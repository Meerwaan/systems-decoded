# 020 · Taipei 101 — les décors

Deux fichiers neufs, un agent chacun, en parallèle : `episodes/020-taipei-101/src/model.js` (le système) et `src/tour.js` (la tour dans le typhon). Tous deux existent déjà en **bouchon** (volumes gris à la bonne place) : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène, pour savoir à quoi servent les images : `docs/020-actes.md`.

**Deux échelles, exprès.** Le système est à l'échelle VRAIE (boule de 5,50 m, 41 plaques de 12,5 cm, butée à 150 cm de la tige) — seuls ses câbles sont raccourcis (42 m en vrai, pendule de 9,80 m ici). La tour est une **maquette à l'échelle du sujet** (142 m au lieu de 508, balancement exagéré) : c'est le cas du 008 dans CLAUDE.md. Aucune longueur, aucun chiffre ne s'écrit sur la tour.

**Le balancement n'est pas chez vous.** `world.js` le calcule à partir d'UN nombre (`swing`) et vous donne le résultat : `tip` à la tour (le trajet de la cage, en cm, le long de x), `course` et `vel` au système (la course de la boule dans sa cage, en vrais centimètres, signée, et sa vitesse). Ni horloge ni phase à vous : ce que vous recevez, vous le dessinez. Le vent souffle vers +x ; la caméra se tient côté −x / +z (`az` −20 … −70).

**Couleurs** : signal = le typhon (la pluie, le vent), l'élan de la tour, la course qui approche de la butée ; veille = le système vivant (la boule qui retient, les câbles qui tirent, les vérins qui freinent) ; ink = le reste. Personne n'est blessé, rien ne casse, rien ne touche la butée.

---

## `src/model.js` — l'amortisseur (le système)

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` (pièces, `lit…`, `xray`, `explode`, ancres, `update`), `kit/lib/build3d.js`.

**Ce qu'il construit**, en centimètres, origine = le milieu du plancher de la cage, sous la boule au repos (`plan.js` : `BALL`, `CRADLE`, `PIN`, `RING`, `DAMPERS`, `CABLES`, `FRAME`, `COURSE`) :

- **La boule** (`BALL`) : 41 plaques d'acier empilées, rayon 275, centre à y = 470. **Ses strates se voient** — c'est la signature du film : 41 disques dont le chant se lit (un joint sombre entre deux plaques, un chanfrein qui accroche la lumière), pas une sphère lisse avec des traits. La pièce-héros : la plus claire des trois gris. De loin, les strates se fondent sans scintiller (détail dans le shader avec `fwidth`, ou géométrie + arêtes dosées).
- **Le berceau** (`CRADLE`) sous la boule et **la tige** (`PIN`) qui en descend dans l'anneau.
- **L'anneau de butée** (`RING`) : autour de la tige, sur quatre pieds, à 150 cm d'elle (échelle vraie : `RING.gap`). C'est LA jauge du film : l'écart tige–anneau doit se lire d'en haut à travers la boule en verre (`xray`) et de trois quarts bas.
- **Les huit vérins** (`DAMPERS`) : quatre paires sur les axes, pied au plancher, tête au berceau ; corps (cylindre) et tige (piston) distincts — ils s'allongent et se raccourcissent VRAIMENT quand la boule se déplace (`course`) : c'est leur longueur qui montre le freinage.
- **Les 92 câbles** (`CABLES`) : huit brins lisibles (quatre attaches sur les diagonales, deux brins chacune), chaque brin un ruban de torons — 4 brins de 12 + 4 de 11 = 92, le compte est juste. Pas de trait sous 1,8 px : de loin un brin est un ruban plein. Les câbles montent vers leurs attaches et **se fondent dans le noir avant l'en-tête** quand le cadre est serré.
- **Ce qui le porte** (`FRAME`) : plancher, quatre poteaux, le cadre où pendent les câbles — **en verre** (c'est un morceau de tour), traits fins.
- La boule, le berceau et la tige pendent en parallélogramme : ils se déplacent **sans tourner** (x = `course`, y remonte de `len − √(len² − course²)`), les câbles s'inclinent, les vérins suivent.

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.

- `root` : un `THREE.Group` (le monde le re-parente entre la cage de la tour et l'établi).
- `A` (ancres, `Object3D`) : `ball` (centre, se déplace), `ballTop`, `plates` (le flanc de la boule côté caméra), `cradle`, `pin` (bas de la tige), `ring` (l'anneau côté −x), `ringFar` (côté +x), `rest` (le centre de l'anneau), `dampers` (le milieu d'un vérin côté caméra), `damperHead`, `cables` (le milieu d'un brin côté caméra), `mount` (une attache), `frameTop`, `floor`.
- `parts` : `{ ball, cradle, pin, ring, dampers, cables, frame }` — chacune avec SES matières (`setPartOpacity`).
- `update(P, time, px)` — appelée seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi, 0 dans la tour (les poteaux de verre peuvent être plus discrets dans la tour, où la tour les double) |
| `course` | la course de la boule, en vrais cm, signée (−150 … 150) : boule + berceau + tige se déplacent, câbles et vérins suivent |
| `vel` | sa vitesse, signée, 1 = la plus vive d'une course complète : c'est elle qui dose `brake` |
| `explode` | 0 assemblé → 1 éclaté : le cadre et les câbles montent, les plaques restent groupées, les vérins s'écartent en étoile, l'anneau descend et s'élargit ; tout reste lisible dans UN cadre vertical (`VIEW.exploded`) |
| `plates` | les 41 plaques : 0 soudées → 1 écartées, une pile de disques qui flottent (la sphère reste lisible : un écart de quelques cm par plaque suffit) |
| `xray` | la boule et son berceau passent en verre là où ils sont : la tige, l'anneau, les vérins se voient au travers |
| `pull` | les câbles retiennent la tour : une tête de lumière veille qui GRIMPE du berceau aux attaches (0 → 1 : sa position), pas un fil qui s'allume d'un coup |
| `brake` | les vérins travaillent : le vérin qui se comprime luit veille, à proportion de `|vel|` |
| `heat` | ce qu'ils ont avalé : le corps des vérins tiédit (un cœur clair, dosé ≤ 3), une brume lente monte — l'élan devenu chaleur. Lent, jamais un clignotement |
| `lock` | les vérins se raidissent et brident la boule (séisme) : des colliers veille se serrent sur les tiges |
| `limit` | l'anneau dessiné chaud : signal du côté où la tige approche, à proportion de la proximité (`|course| / 150`) |
| `datum` | le repos de la boule : une croix et un cercle fins, ink, au centre de l'anneau — ce contre quoi la course se lit |
| `litBall`, `litCables`, `litDampers`, `litRing` | la pièce que la voix nomme luit faiblement veille |

**Images à réussir** (liste fermée — poses de départ dans `world.js` → `VIEW`, établi : `state: { set: 0 }` ou un instant de l'acte 2) :

1. Le système entier sur l'établi, au repos (`VIEW.whole`) : on comprend l'objet sans légende — une boule striée pendue à ses câbles, des vérins dessous.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1, `plates` 1) : les 41 disques, les huit brins, les huit vérins en étoile, l'anneau — tout dans un cadre, rien derrière l'en-tête.
3. La boule de près (`VIEW.ball`) : les strates, à 405 px de large elles se comptent presque.
4. Les câbles jusqu'aux attaches (`VIEW.cables`, `litCables`, `pull` 0,5).
5. Les vérins de trois quarts bas (`VIEW.dampersBench`, `xray` 0,6, `brake` 1, `heat` 0,7, `course` 60) : un vérin comprimé, un vérin étiré, la chaleur.
6. **Le climax** : la tige dans son anneau, d'en haut, à travers la boule en verre (`VIEW.ring` puis plus haut, `xray` 1, `limit` 1, `datum` 1, `course` 100) : l'écart qui reste se lit d'un coup d'œil.
7. Le pendule presque de face (`VIEW.swing`, `datum` 1, `course` ±60) : deux images, une de chaque côté — vérifier le sens.
8. La même boule dans la cage de la tour, `VIEW.hook` (la première image du film) : elle reste l'élément le plus lisible du cadre, pleine sur fond de verre.
9. **L'image de la chute** : sur l'établi, la boule entière, `litBall`, au repos (`VIEW.whole` resserré) — le titre barré se pose dessus (`#title-shade`).

---

## `src/tour.js` — Taipei 101 aux rayons X, dans le typhon

**À lire pour l'idiome** : `episodes/017-irm/src/suite.js` (décor aux rayons X, personnage, ancres, `update`), `episodes/015-brin-arret/src/carrier.js` (un très grand objet de verre, la mer et le ciel), `episodes/008-paratonnerre/src/house.js` (la pluie), `episodes/007-siege-ejectable/src/jet.js` lignes 340–520 (ciel, traînées), `kit/lib/figure.js` (`makeFigure`). S'en inspirer ; n'importer que ce qui s'importe tel quel (le kit).

**Ce qu'il construit**, origine = le sol sous l'axe de la tour (`plan.js` : `TOWER`, `CAGE`, `LEAN`, `GALLERY`, `YOU`, `BONES`, `CITY`) :

- **La tour entière, en verre** : une base qui s'affine, **huit modules évasés empilés** (ce qui la rend reconnaissable : chaque module s'ouvre vers le haut, le suivant repart plus étroit), la couronne, la flèche. Coque de verre (`glass` + `asShell`), arêtes fines, les lignes d'étages suggérées (fondues sous le pixel de loin). Pas de sol plein : une grille.
- **Elle plie** : `tip` est le trajet de la cage le long de x ; en dessous, u(y) = tip · (y / CAGE.at[1])^LEAN.pow, au-dessus on prolonge. Une vraie flexion continue (dans le shader des coques ou par tranches fines), pas des blocs qui glissent comme dans le bouchon. La base ne bouge pas.
- **`mount`** : un `THREE.Group` au plancher de la cage (`CAGE.at`), déplacé de `tip` (et incliné de la pente locale, quelques degrés au plus) : `world.js` y accroche le système. Tout ce qui est « dans la cage » est enfant de `mount` : les planchers de la cage, la galerie (`GALLERY`), la vitre, toi.
- **Les étages hauts et la cage** : autour de la boule, quatre à cinq planchers de verre percés d'un grand rond, la galerie d'où l'on regarde, son garde-corps. Rien d'opaque devant la boule côté caméra.
- **Toi** (`YOU`) : un personnage de verre (`makeFigure`), debout sur la galerie, derrière la vitre de la façade, la boule derrière toi. `grip` : tu te penches et tu tiens le garde-corps. Jamais en très gros plan.
- **Le typhon** (`storm`) : la pluie **à l'horizontale**, en traînées (jamais des points, rien de fin qui défile vite : étalée sur sa course), et quelques grandes veines de vent, signal, qui filent vers +x ; périodiques, vivantes dès la première image. Elles passent DEVANT et DERRIÈRE la tour (profondeur), jamais un voile.
- **Le squelette** (`bones`) : huit méga-colonnes (deux par face, dans le plan de la façade), le noyau sous la cage, une ceinture de treillis à chaque joint de module — plein dans le verre. **Les colonnes traversent la hauteur de la cage** : dans `VIEW.cage` on les voit monter de part et d'autre de la boule (c'est l'image de « La tour tient seule », à la chute) ; elles s'allument de bas en haut quand `bones` passe de 0 à 1.
- **L'axe** (`axis`) : le fil à plomb de la tour au repos (un trait ink fin, pointillé large) et sa silhouette fantôme : ce contre quoi l'inclinaison se lit.
- **La ville** (`city`) : des blocs bas de verre jusqu'à `CITY.r`, pour l'échelle du plan large. Rien de reconnaissable, rien de haut.
- **Le séisme** (`quake`) : la base tremble — une vibration à la cadence (30 par seconde : un flou stable) posée sur une houle lente, qui monte en s'atténuant ; la tour entière frémit, rien ne casse.

**API à rendre** (exactement) : `export function buildTour()` → `{ group, mount, A, update(P, time, px) }`.

- `A` (ancres) : `you` (ta poitrine), `head`, `cage` (le milieu de la cage), `window` (la façade devant toi), `top` (la pointe de la flèche), `crown`, `mid` (mi-hauteur, arête côté caméra), `foot`. Celles de la cage sont enfants de `mount`.
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `tip` | le trajet de la cage le long de x, en cm (≈ ±280 au pic, jusqu'à ±840 dans un plan très large) : la tour plie, `mount` suit |
| `shell` | le verre de la tour, 0–1 (façade, planchers, cage, galerie) ; à 0,15 il ne reste que le système |
| `storm` | le typhon dessiné, 0 (jour calme) → 1 (son pic) : densité et vitesse de la pluie, veines de vent |
| `city` | la ville et la grille du sol, 0–1 |
| `axis` | le fil à plomb et la silhouette au repos, 0–1 |
| `bones` | le squelette : 0 invisible · 1 éclairé ink · 2 éclairé veille (il encaisse) |
| `quake` | le sol tremble, 0–1 |
| `you` | 0 personne · 1 toi |
| `grip` | 0 debout · 1 penché, les mains au garde-corps |

**Images à réussir** (liste fermée) :

1. **La première image du film** (`VIEW.hook` = `POSE0`, `FIRST`) : de dehors, à hauteur de cage — la pluie à l'horizontale, la façade de verre, toi derrière la vitre, et derrière toi la boule énorme. Elle doit arrêter le pouce sans texte. Tirer aussi la même à `swing` 0,5 et 1,5 : la tour a bougé de droite à gauche dans le cadre.
2. La tour entière vue du pied (`VIEW.low`, `bend` 2, `axis` 1) : cent un étages penchés au-dessus de toi, les huit modules se comptent.
3. La tour entière de loin (`VIEW.tower`, `bend` 2,5, `city` 1) : la silhouette de Taipei 101 se reconnaît à 270 px ; le sommet a quitté son axe.
4. Le tiers haut (`VIEW.top`, `bend` 1,5, `axis` 1) à `swing` 0 puis 0,5 : la tour part, la boule (un point veille dans le verre) est restée en arrière.
5. Toi à la vitre (`VIEW.you`, `grip` 0 puis 1).
6. La cage entière (`VIEW.cage`, `aboard` 1) : la cage tient en place, c'est la pluie qui penche — la boule lisible, rien d'opaque devant elle.
7. Le squelette (`VIEW.low` ou `VIEW.tower`, `bones` 2, `shell` 0,4, `quake` 1, `storm` 0) : c'est lui qu'on voit, la tour frémit.
8. Le système seul (`VIEW.system`, `shell` 0,15, `storm` 0, `you` 0, `city` 0) : le raccord vers l'établi — rien ne reste autour.
9. Un jour calme (`storm` 0, `bend` 0, `VIEW.hook`) : la même image sans typhon, pour le like.

**Net et fluide** : la pluie est le risque du dossier (des traits fins qui filent : images parasites). Traînées longues, larges d'au moins 2 px, vitesse à l'écran d'au plus un septième de leur période par image ; et la flexion de la tour ne fait jamais défiler vite ses lignes d'étages (elles se fondent en gris de loin).

# 032 · Barre anti-panique — les décors

Deux fichiers, un agent chacun, en parallèle : `episodes/032-barre-anti-panique/src/model.js` (le système : la barre anti-panique et sa serrure) et `src/salle.js` (la salle d'aujourd'hui, sa porte de secours, la foule, toi — et la même porte en 1883, au pied de l'escalier de Sunderland). Tous deux existent en **bouchon** (volumes gris, API définitive) : le film se construit ; on remplace le fichier en entier en gardant exactement ce qu'il rend. Un troisième fichier, `src/avion.js` (l'annonce du 033), est **déjà fini** : il importe la cabine du L03 telle quelle — pas d'agent.

Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED` / `PAST` / `FLIGHT`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/032-actes.md` (lis son haut et les lignes qui te concernent). Faits : `docs/faits/032-barre-anti-panique.md` et `032-contre-verification.md` — leurs « À ne pas dire » d'abord. **La voix est enregistrée** (88,8 s) : `npm run script -- 032`. Planches : `.cache/planches/032/<ton fichier>/`. Cinq dossiers se montent en même temps dans ce dépôt : tu n'écris que ton fichier et ton journal (`docs/journal/032-<fichier>.md`) ; un manque ailleurs va sous « À changer ailleurs ».

**Le repère** (`plan.js`, vérifié sur bouchon) : l'origine au sol, au milieu du seuil de la porte, dans le plan du mur (z = 0). **+z la salle** (la foule, toi, la barre sur la face intérieure du battant ; en 1883 l'escalier), **−z dehors** (la sortie). **−x le côté serrure** (boîtier, pêne, gâche), **+x les paumelles**. **Azimut** (`kit/lib/stage.js` l. 381 : la caméra est en t + d·(sin az, …, cos az)) : `az` 0 se tient dans la salle face à la porte ; −90 du côté serrure, regardant le long du mur (la salle à droite de l'image, dehors à gauche) ; ±180 dehors. La clé vient de −x, +y, +z : entre −20 et −70, on voit le côté serrure en premier.

**L'échelle** : la vraie pour la porte (100 × 210 cm), la salle, les personnages, l'escalier. Les pièces de la barre un peu plus épaisses que nature (tube de 4 cm, course du pêne de 3 cm) pour se lire ; aucune longueur ne s'affiche. L'escalier de 1883 est une **reconstitution** (aucun plan de Victoria Hall : `sources` le dit).

**Le battant tourne, le système avec.** `salle.js` possède le battant et ses paumelles ; `A.leaf` est un groupe où tout ce qui est posé aux coordonnées « porte fermée » de `plan.js` suit le battant. Le système est écrit dans ces coordonnées : `world.js` pend son `root` à `A.leaf` (ou à l'établi) et son `fixed` (la gâche) à `A.frame`. Aujourd'hui la porte s'ouvre **vers l'extérieur** (−z, paumelles sur la face extérieure) ; en 1883 la même, au même endroit, **vers l'intérieur** (+z, vers l'escalier, paumelles sur la face intérieure).

**Couleurs** : signal = la menace (la poussée de la foule — les flèches sur le battant —, le pêne coincé contre la gâche, le battant fantôme qui s'ouvrirait vers toi, le verrou de 1883) ; veille = le système vivant (la barre et les pièces que la voix nomme, le pêne qui sort, la sortie : l'arc vers dehors, le pictogramme) ; ink = le reste. Nuit d'intérieur, pas de bleu. **Personne n'est blessé à l'image** ; en 1883 aucun enfant identifiable (silhouettes de verre sans visage, à taille d'enfant), aucun corps à terre, aucun feu (ils sont morts écrasés).

---

## `src/model.js` — la barre anti-panique et sa serrure (le système, PLEIN)

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`, ancres), `episodes/025-esp/src/model.js` (un système re-parenté entre le décor et l'établi, `bench`), `kit/lib/build3d.js`. Rien à réutiliser tel quel : aucun dossier n'a de serrure. Un décor neuf, mais petit (≈ 1 m de long, six pièces).

**Ce qu'il construit** — une barre à un point (type A, « push bar »), en cm, aux places de `plan.js` (`FACE`, `BAR`, `ARM`, `BRACKET`, `BOX`, `PENE`, `GACHE`, `SPRING`, `SYSTEM`), dans les coordonnées « porte fermée » :

- **La barre-levier** (`BAR`) : un tube de 72 cm (72 % du battant — « plus de la moitié de la porte »), à hauteur de hanche, à 11 cm de la face au repos. Métal clair satiné, le plus clair des pièces (c'est la pièce-héros, celle sous ta hanche). Embouts usinés aux deux bouts.
- **Ses deux bras** (`ARM`) : l'un entre dans le boîtier, l'autre pivote sur **la chape de pivot** (`BRACKET`) côté paumelles. `push` 1 : la barre recule de `BAR.stroke` vers la face (et descend un peu), les bras tournent autour de leurs axes — **le pivot doit se lire** (un axe plein, une rondelle) : « c'est un levier ».
- **Le boîtier d'extrémité** (`BOX`) côté serrure : socle vissé sur la face + **capot** amovible. `see` 1 : le capot passe en verre, on voit dedans le ressort, la came du bras, la queue du pêne. La contre-vérification exige un boîtier **d'extrémité** (pas central).
- **Le pêne** (`PENE`) : un demi-tour qui sort du bout du boîtier vers −x ; `pene` 0 sorti, dans la gâche ; 1 rentré, affleurant. Biseau visible (sa face oblique tournée vers dehors).
- **La gâche** (`GACHE`) : sur le dormant (`fixed`), sa lumière (l'entaille) où entre le pêne. Fonte plus sombre que le pêne.
- **Le ressort de rappel** (`SPRING`) dans le boîtier : une vraie hélice (tube sur une spirale, ≥ 2 px de fil à `VIEW.boxBench`), comprimée avec `push`.
- **Sur l'établi seulement** (`bench` 1, `slab` 1) : une **tranche du battant** (toute sa largeur, 60 cm de haut, y 66 → 126 de la scène : elle se tient sur le sol de l'établi) et un bout de dormant, **en verre** (`glass` + `asShell`, traits fins), la barre dessus : « la porte et sa barre restent seules sur le halo ». C'est elle qui permet de comparer la barre à la largeur de la porte.
- **La charge** (`load`) : 5 à 7 flèches signal sur la face intérieure du battant, pointées vers dehors (−z), larges, à tête pleine (pas de trait fin) ; elles pulsent lentement (une poussée, pas un clignotement). **`jam`** : le contact pêne / gâche passe signal (une lumière qui a un endroit, au flanc du pêne) et le pêne frémit à peine.
- **`ghost`** : le système dessiné en simple contour encre, faible (1883, « Sans barre » : là où elle n'est pas). À 0,001 il est caché ; jamais plein en 1883.
- **La main fantôme** (`hand`, `tapAt`) : une moufle de verre (`makeFigure({ hands: "flat" })` n'est pas obligatoire : une main de verre suffit, jamais une boule) posée sur la barre à `tapAt` (−1 le bout du boîtier → 1 le bout des paumelles), paume contre la barre. C'est la chute : « tu pousses, n'importe où ».

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, fixed, A, parts, update(P, time, px) }`.

- `root` (`THREE.Group`) : tout ce qui bouge avec le battant ; `fixed` : la gâche (et, sur l'établi, le bout de dormant).
- `A` (`Object3D`) : `bar` (milieu de la barre, suit `push`), `barEnd`, `pivot`, `box`, `pene` (bout du pêne, suit `pene`), `gache` (dans `fixed`), `spring`, `hand`, `centre`.
- `parts` : `{ bar, arms, bracket, box, cover, pene, spring, gache, slab }` — chacune avec SES matières (`setPartOpacity`). **Une matière de verre (`glass`) ne passe pas par `addMesh`** (pas de `.color` : le bouchon cassait le build) : `new THREE.Mesh` + `asShell`.
- `update(P, time, px)` — seize fois par image, aucune allocation :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (la tranche de battant et de dormant de verre), 0 dans la porte |
| `slab` | la tranche de battant (0–1, sur l'établi seulement) |
| `explode` | 0 assemblé → 1 éclaté, vu de `VIEW.exploded` (trois quarts LE LONG de la barre : un système long et fin, en cadre vertical, se lit en profondeur) : la barre et ses bras décollent vers la caméra (+z) et montent, le capot du boîtier s'envole (+z +y), le ressort monte hors du boîtier, le pêne glisse vers −x, la gâche s'écarte encore vers −x ; rien derrière l'en-tête, tout entre y ≈ 440 et 1160 |
| `push` | la barre enfoncée (0 repos → 1 course entière) : bras qui pivotent, ressort qui se comprime |
| `pene` | 0 sorti dans la gâche → 1 rentré dans le boîtier |
| `see` | le capot en verre : l'intérieur du boîtier se lit (0–1) |
| `load`, `jam` | la charge de la foule (flèches signal) ; le pêne serré contre la gâche (contact signal) |
| `ghost` | le système en contour encre faible, au lieu de plein |
| `hand`, `tapAt` | la main fantôme de verre sur la barre, et où |
| `litBar`, `litPivot`, `litBox`, `litPene`, `litGache`, `litSpring` | la pièce que la voix nomme luit faiblement veille (une lumière qui a un endroit : jamais toute la pièce en néon) ; `litBar` peut courir le long de la barre (une tête de lumière du boîtier au bout : « court sur ») |

**Images à réussir** (8, liste fermée — poses de départ dans `world.js` → `VIEW`) :

1. `VIEW.whole` sur l'établi (`BENCHED`) : la tranche de porte de verre, la barre sur ses deux bras, le boîtier, la gâche — on comprend sans légende. Vu sur bouchon, le cadre tient.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1) : six pièces séparées, lisibles à 270 px, sous la ligne « Système Décodé ».
3. Le levier (`VIEW.barBench`, `push` 0 puis 0,6, `litPivot` 1) : le bras tourne autour d'un axe qu'on voit.
4. Le boîtier ouvert (`VIEW.boxBench`, `see` 1, `litSpring` 1, `push` 0 puis 1) : le ressort se comprime, la queue du pêne recule.
5. **Le pêne dans la gâche** (`VIEW.jamBench`, `pene` 0, `litPene` 1, `litGache` 1) puis **coincé** (`load` 1, `jam` 1) : le contact signal se lit à 270 px.
6. Dans la porte (`VIEW.hip`, `STAGED`) : la barre reste l'élément le plus lisible devant le verre du battant et la hanche de verre ; `push` 1 + `pene` 1 lisibles d'une image à l'autre (`VIEW.latch`).
7. La chute (`VIEW.whole` + `hand` 1 à `tapAt` −0,6 puis 0,7, `push` 1, `pene` 1) : la main de verre ne fait pas « boule ».
8. La couverture : `cover` d'`episode.json` (instant `cadre` : éclaté, la gâche nommée) — tout le système éclairé, quelque chose luit, `el` ≥ 28, sous « Système Décodé » (shift −520). Donne la pose qui marche dans ton journal.

**Propre au dossier** : les « À ne pas dire » interdisent toute cote (80 N, 1 000 N, 60 %) à l'image. Le pêne sort sous la foule « malgré » elle : le geste tient en un instant (`pene` 0 → 1 en 0,2 s au repère `trigger`), il faut qu'il se voie de `VIEW.latch` — biseau clair, gâche sombre. Le bouchon pose `A.hand` sur la barre ; la main est à toi.

---

## `src/salle.js` — la salle aux rayons X, la porte, la foule, toi — et 1883 (au même endroit)

**À lire pour l'idiome** : `episodes/006-defibrillateur/src/hall.js` (un lieu public aux rayons X, des personnages debout, l'échelle par eux), `episodes/017-irm/src/suite.js` (une salle, une porte de verre, un sol en grille), `kit/lib/figure.js` (`makeFigure`, `reach`, `leg`, `lean`, `ghost`), `kit/lib/atmo.js`. **Aucun lieu du catalogue ne tient** (pas de salle publique avec une issue de secours et une foule : 006 a un hall de gare sans porte, ancien moteur ; 017 une porte d'IRM ; 028 un appartement) — d'où un décor neuf. Reprends l'idiome de 006 pour la foule (des personnages qu'on déplace en bougeant leur groupe).

**Ce qu'il construit** (`plan.js` : `WALL`, `HALL`, `DOOR`, `SIGN`, `OUTSIDE`, `YOU`, `CROWD`, `STAIR`, `AJAR`) :

- **La salle d'aujourd'hui** (`era` 0), aux rayons X : le mur de la porte (verre, traits fins ; **vu de profil, son verre ne doit jamais devenir une dalle blanche** — sur bouchon, à `az` −84, il l'était), le plafond en lignes, les murs latéraux à peine, le sol en grille (`makeSurface`). Un lieu public : rien de domestique.
- **La porte de secours** : le dormant (plein, sombre, fin), le battant (verre + ses arêtes, un oculus ou une plaque de propreté au plus), les paumelles côté +x. `swing` l'ouvre (95° à 1) **vers dehors** aujourd'hui, **vers l'escalier** en 1883. Avec `press` il **tremble** dans son cadre (quelques millimètres, rapide, jamais un clignotement).
- **Le pictogramme de sortie** (`SIGN`, `sign`) au-dessus de la porte, côté salle : le bonhomme qui court vers une porte, **dessiné, sans texte**, veille (c'est la sortie : le système vivant). Aucun en 1883.
- **Dehors** (`outside`) : quand la porte s'ouvre, une flaque de lumière froide (ink) au sol au-delà du seuil et une lueur dans l'encadrement — « la foule s'écoule dans la lumière ».
- **Les arcs** : `arcIn` — un battant fantôme **signal** tourne vers la salle (+z) en dessinant son arc au sol (« sauf si elle s'ouvre vers toi ») ; `arcOut` — le même, **veille**, vers dehors. Un arc = un ruban au sol ≥ 3 px et le battant fantôme qui le parcourt (verre teinté, faible) ; pivots aux paumelles (+x). Vérifie le sens sur deux images (sur bouchon, les battants fantômes n'étaient pas dans le bon plan).
- **Toi** (`you`, `YOU`) : un personnage de verre (`makeFigure({ hands: "flat" })`) **plaqué contre le battant** : poitrine sur le verre, tête tournée de côté, **bras pris** (levés, coincés contre la porte et les autres), **hanche sur la barre** — ta hanche suit la course de la barre (`push` : `BAR.stroke`). Jamais en très gros plan, jamais la main seule. Ancres `A.you.hip`, `A.you.chest`, `A.you.head`.
- **La foule** (`crowd`, `press`, `flow`, `CROWD`) : ≈ 40 à 50 personnages de verre, **un entonnoir** vers la porte (serrés devant, plus lâches derrière) ; le premier rang (6 à 8) posé (penché vers la porte, bras en avant sur les dos), les rangs du fond plus simples (instanciés si besoin : seize rendus par image). **Elle déferle dès l'image 1** : une vague de poussée qui court de l'arrière vers la porte (période ≈ 1,5 s, amplitude ∝ `press`), réglée sur `time` — c'est le mouvement du sujet que demande la première image. **Le coin côté serrure (x < −50, z < 120) reste dégagé** : c'est par là que regardent l'accroche et la plupart des plans (sur bouchon, des figures y masquaient la porte). `flow` 1 : la foule s'écoule par la porte ouverte et dehors, en file, les premiers rangs déjà hors du cadre — la salle se vide (« et la salle respire »). Aucune tête pleine en boule : des têtes de verre (les boules beiges du bouchon sont à bannir).
- **1883** (`era` 1, même origine, `STAIR`, `AJAR`) : la salle s'efface, **l'escalier étroit** descend vers la porte (marches de verre, deux murs, un palier de 70 cm devant la porte) ; la même porte, **ouvrant vers l'intérieur**, tenue **entrebâillée** de `AJAR.deg` par **le verrou** (`bolt` : un verrou plein, signal, planté dans le sol au bord libre du battant) — le passage d'un seul enfant. **Les enfants de verre** (même foule, à l'échelle `AJAR.child`, sans visage) serrés sur les marches, tassés contre le battant ; `press` 1 les tasse. `slip` 1 : un seul passe par l'entrebâillement. Pas de pictogramme, pas de lumière dehors, pas de barre (`world.js` cache le système ; `ghost` peut en montrer le contour).

**API à rendre** (exactement) : `export function buildSalle()` → `{ group, A, update(P, time, px) }`.

- `A` : `leaf` (groupe du battant, aux coordonnées « porte fermée »), `frame` (le dormant, fixe), `you: { hip, chest, head }`, `sign`, `gap` (1883 : l'entrebâillement à hauteur d'enfant), `top` (1883 : le haut de l'escalier).
- `update(P, time, px)`, aucune allocation (le bouchon alloue un `Vector3` : à ne pas reprendre) :

| nombre | ce que tu en fais |
| --- | --- |
| `era` | 0 aujourd'hui · 1 1883 (entier, change sur une coupe) |
| `shell` | le verre du lieu (0–1) ; la foule et toi gardent le leur |
| `crowd`, `press`, `flow` | la foule (présence), sa poussée (vague vivante, battant qui tremble), son écoulement dehors |
| `you`, `push` | toi contre la porte ; ta hanche suit la barre |
| `swing` | le battant : aujourd'hui vers dehors, en 1883 vers l'escalier (95° à 1 ; en 1883 jamais moins que `AJAR.deg · bolt`) |
| `arcIn`, `arcOut` | les battants fantômes et leurs arcs (signal vers la salle, veille vers dehors) |
| `sign`, `outside` | le pictogramme ; la lumière dehors |
| `bolt`, `slip` | 1883 : le verrou ; l'enfant qui passe |

**Images à réussir** (9, liste fermée) :

1. **Les quatre candidates de la première image** (`docs/032-actes.md`, « La première image ») : poses dans `essais.json`, tirées sur le vrai décor avec la foule qui déferle (`at` 0,04 et 0,5 : elle doit avoir bougé). C'est l'image la plus importante du film : elle passe avant tout le reste.
2. `VIEW.chest` : ta poitrine de verre sur le battant, tes bras pris, la foule derrière — lisible, pas un tas de boules.
3. `VIEW.hip` : ta hanche sur la barre, la barre plein cadre (le système fourni par le bouchon de `model.js` suffit pour cadrer).
4. `VIEW.door` avec `arcIn` 1 puis `arcOut` 1 : les deux sens se comprennent sans légende.
5. `VIEW.outflow` (`swing` 1, `outside` 1, `flow` 0,5) : la porte ouverte, la lumière dehors, la foule qui s'écoule.
6. `VIEW.stairTop` (`PAST`) : du haut de l'escalier, les enfants tassés sur les marches, la porte en bas, entrebâillée.
7. `VIEW.stairDoor` + `VIEW.bolt` : le battant entrebâillé vers l'escalier, le verrou plein au sol, l'entrebâillement (`slip` 0 puis 1).
8. `VIEW.above1883` (`arcIn` 1 en 1883) : l'arc d'ouverture côté escalier, vu de haut.
9. `VIEW.crowd` : l'entonnoir de la foule vers une seule petite porte, le pictogramme vert au bout (vu sur bouchon : le cadre tient).

**Propre au dossier** : la foule est la menace, mais **personne n'est blessé** et rien n'est en signal sur les corps ; la menace, ce sont les flèches de charge (`model.js`) et la masse. En 1883, la contre-vérification interdit le feu et tout enfant identifiable ; on ne montre ni le coupable ni un total d'enfants. Le décor resservira (une salle publique et son issue : la semaine des courts) — garde ses nombres génériques.

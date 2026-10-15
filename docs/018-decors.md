# 018 · Cocotte-minute — les décors

Un seul fichier neuf : **`episodes/018-cocotte-minute/src/model.js`**. La cuisine (`src/cuisine.js`) est un assemblage de décors existants, déjà écrit et vérifié sur une planche : on n'y touche pas. Le contrat est dans `src/plan.js` (où tout se tient) et `src/world.js` (`FIRST` : la liste fermée des nombres ; `apply()` : comment ton fichier est appelé). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène, pour savoir à quoi servira chaque nombre : `docs/018-actes.md`.

## Ce qui est réutilisé (ne pas remodeler)

| quoi | d'où | comment |
| --- | --- | --- |
| la cuisine aux rayons X | `episodes/009-micro-ondes/src/kitchen.js` → `buildKitchen({ hob: false, floorAt })` | sans sa plaque de verre, sans personne |
| la plaque à gaz, toi à la plaque | `episodes/012-gaziniere/src/hob.js` → `buildHob()` | `pot: 0` (pas de casserole), `you` 0 / 1, `press` |
| le brûleur plein, sa manette | `episodes/012-gaziniere/src/model.js` → `buildSystem()` | un accessoire : jamais ouvert, `volts` et `hold` à 0 (pas de veille parasite) |
| la couronne de flammes | `episodes/012-gaziniere/src/fire.js` → `buildFire()` | `pot: 1` : les flammes courent sous un fond de **10 cm de rayon** — c'est pour ça que la cuve fait 10 cm (`POT.r`) : ne change pas ce rayon |
| l'établi | `kit/lib/blocks.js` → `makeBench(SIZE)` | |

La cocotte se tient en `HOME` = `[166, 95.2, 34]` : le centre de son fond sur les grilles du brûleur avant gauche. Sur l'établi, son fond est sur l'origine.

## `src/model.js` — la cocotte (le système)

Aujourd'hui un bouchon : des volumes gris à la bonne place, trois cônes verts pour la vapeur. Tu le remplaces en gardant son interface. Idiome : `episodes/012-gaziniere/src/model.js` (un système plein, son verre `xray`, ses pièces qui s'effacent) et `episodes/017-irm/src/model.js` (une cuve de verre, un bain, un nuage, des nombres « dessiné ou non ») ; pour de la mousse sans simulation, le shader de `012-gaziniere/src/hob.js` (la mousse : UNE surface placée par son vertex shader) ; pour un jet qui a de la matière, `017-irm/src/model.js` (le nuage du tube) et `008-paratonnerre/src/bolt.js` (un cœur, une gaine, un halo).

### L'API à rendre, exactement

```js
export function buildSystem()   // → { root, parts, A, update(p, time, px) }
```

- `root` : un `THREE.Group`, origine = centre du fond de la cuve, axe y. `world.js` le re-parente entre la cuisine et l'établi : rien de ce qui est dessiné ne doit dépendre de la position du parent (pas de coordonnées de la cuisine en dur).
- `parts` : `{ body, seal, lid, weight, safety, pin }` — chacune avec SES matières (`setPartOpacity`).
- `A` (ancres qui suivent leur pièce, éclatée ou non) : `body`, `lid`, `seal`, `valve` (le poids), `hole` (la bouche de la cheminée), `safety`, `pin`, `stop`, `window`, `handle`, `water` (la surface), `foam` (son sommet), `inside` (le milieu de la vapeur prisonnière), `top` (au-dessus du poids), `jet` (2 cm au-dessus de la soupape).
- `update(p, time, px)` : appelée seize fois par image — des uniformes et des transformations, aucune allocation ; tout dépend de `p` et de `time`.

### Ce qu'il faut construire (cotes dans `plan.js`, ne les change pas sans le dire)

- **La cuve** (`POT`) : inox, Ø 20, haute de 14,5, un fond épais, un bord roulé avec ses six ergots ; sa poignée longue (`HANDLE`, vers l'arrière droit) ; et, rivée au bord, **la butée** (`STOP`) : une languette qui se recourbe au-dessus du couvercle, percée d'un trou.
- **Le couvercle à baïonnette** (`LID`, `LUGS`) : sa jupe coiffe le bord, ses ergots passent sous ceux de la cuve quand on le tourne de 30° ; sa poignée, au-dessus de celle de la cuve quand il est verrouillé. Dans sa jupe, côté gauche de l'image, **la fenêtre** (`WINDOW`) : une lumière découpée, derrière laquelle on voit le joint.
- **Le joint** (`SEAL`) : un anneau souple, la pièce la plus claire après le poids.
- **La soupape de fonctionnement** (`VALVE`) : une cheminée sur l'axe, percée d'un trou ; dessus, **un poids** (une masselotte moletée) qui tient par son seul poids. C'est la pièce-héros : la plus claire.
- **La soupape de sécurité** (`SAFETY`) : un petit clapet, devant la première.
- **La tige de verrouillage** (`PIN`) : un piston dans le couvercle, sous le trou de la butée. *Simplification assumée* : sur une vraie cocotte la tige bloque le loquet de la poignée ; ici elle monte dans une butée solidaire de la cuve, pour que « une tige bloque le couvercle » se lise en une image.
- **Dedans** (visible seulement quand `xray` > 0) : l'eau et les lentilles, la mousse, la vapeur prisonnière.

Trois valeurs de gris (le fond et les poignées sombres, l'inox moyen, le poids et le joint clairs), `metal` ≤ 0,5, des chanfreins partout (`cyl`, `lathe`, `box`).

### Chaque nombre, et ce qu'il fait chez toi

| nombre | ce qu'il fait |
| --- | --- |
| `bench` | 1 sur l'établi (0 dans la cuisine) : rien à ajouter sous la cocotte, elle pose sur son fond |
| `bar` | **la pression** : 0 rien · 1 pression de cuisson · jusqu'à 2. **La tige suit toute seule** : montée dès `bar` ≈ 0,05–0,25, redescendue en dessous (« tant qu'il reste de la pression »). Elle dose aussi tout ce que `seen` dessine. Au-dessus de 1,3 le couvercle peut se bomber d'un millimètre : rien de plus, **rien n'éclate jamais** |
| `seen` | combien de cette pression est DESSINÉ, en signal (0–1) : la vapeur prisonnière entre l'eau et le couvercle (un volume, plus dense et plus vif quand `bar` monte) et sa **poussée** contre le dessous du couvercle (de courts traits épais, ≥ 2 px, qui battent lentement). À 0 on ne dessine rien : la pression existe quand même. Ne vaut que si `xray` > 0 |
| `xray` | la cuve et le couvercle deviennent du verre là où ils sont (`glass` + `asShell`, traits fins) : l'eau, les lentilles, la mousse, la vapeur se voient ; les soupapes, la tige, le joint restent pleins |
| `fill` | le niveau (eau et lentilles, pleines) entre le fond et le bord : 0 vide · 0,5 la moitié · 0,8 trop · 1 à ras bord |
| `mark` | le trait de la moitié autour de la cuve (`HALF`), veille, épais (0–1) |
| `boil` | l'eau bout : sa surface se soulève, les lentilles roulent (lent : le film n'accélère rien) |
| `foam` | la mousse sur l'eau : 0 rien · 0,5 à mi-chemin du couvercle · 1 contre le couvercle, à la bouche de la cheminée. Encre pâle tant qu'elle monte ; **signal** là où elle touche un trou |
| `clog` | le trou de la soupape de fonctionnement bouché par la mousse (un bouchon signal dans la cheminée) : le poids retombe, **plus de jet, quoi que dise `whistle`** |
| `clog2` | pareil pour la soupape de sécurité : **son jet s'arrête, quoi que dise `safety`** |
| `whistle` | la soupape travaille : le poids se soulève de `VALVE.lift`, danse (lentement, sans vibrer à la cadence), un jet de vapeur **veille** en sort |
| `off` | le poids ôté à la main : 0 posé sur son trou · 1 tenu `VALVE.away` au-dessus — le trou se voit (« un poids, posé sur un trou », « nettoie la soupape ») |
| `safety` | la soupape de sécurité : 0 fermée · 1 ouverte (elle se soulève de `SAFETY.lift`), son jet veille |
| `leak` | le joint à la fenêtre : 0 en place · 0,5 il fait une hernie par la fenêtre · 1 il a cédé là et la vapeur fuit **sur le côté**, veille |
| `plume` | combien de la vapeur SORTIE est dessinée (les trois sorties) : 1 le panache entier — **20 cm au plus, fondu dans le noir sur son dernier tiers** (il ne doit atteindre ni la hotte ni l'en-tête) · 0,3 sa seule racine, pour un gros plan |
| `twist` | la poignée du couvercle poussée vers « ouvert » : avec de la pression, le couvercle tourne d'un ou deux degrés et **bute net sur la tige** (un éclat signal, petit, sur la tige) ; sans pression il tourne de 30°, libre |
| `explode` | l'établi : 0 assemblée → 1 le couvercle a tourné (0 → 0,25) puis tout s'est soulevé en UNE colonne (`APART`) : cuve · joint · couvercle · au-dessus, la tige, la soupape de sécurité, le poids. Dès 0,05 : plus de vapeur, plus de contenu |
| `litBody`, `litLid`, `litSeal`, `litValve`, `litSafety`, `litPin` | la pièce que la voix nomme luit faiblement, veille. `litLid` allume aussi ses ergots ; `litPin` la tige ET le trou de la butée |

### La vapeur : la règle de ce dossier

- **Dedans** (prisonnière) : signal. Un volume doux, jamais un voile uni ; sa poussée, des traits qui ont une direction.
- **Dehors** (les trois sorties) : veille. Un jet a un cœur brillant à sa racine et une longue traîne qui s'élargit et se dissout — jamais un cône (le bouchon en a : c'est ce qu'il ne faut pas livrer), jamais des points. Il ne scintille pas : une respiration lente. Borne tes shaders avant `pow`, `sqrt`, une division.
- Rien de blanc qui lave l'image, aucun éclair, aucun débris : la chute du film est « elle n'explose pas ».

### Les images à réussir (liste fermée — 30 images lues au plus)

1. **La première image du film** : `VIEW.hook` (= `POSE0`, az −64), `FIRST` — la cocotte pleine sur sa couronne de flammes, le poids qui danse, le jet veille ; avec l'en-tête (sans `--bare`) : le jet s'arrête avant y ≈ 440.
2. La même, `xray` 1, `seen` 1, `bar` 1 : la vapeur prisonnière pousse sous le couvercle (l'image de « plus de 350 kilos »).
3. `VIEW.level`, `xray` 1, `fill` 0,8, `boil` 1, `foam` 0 → 0,5 → 1 : la mousse qui monte vers la soupape (trois vignettes).
4. **L'éclaté** : `VIEW.exploded`, `explode` 1 sur l'établi — la colonne se lit pièce par pièce à 405 px de large.
5. `VIEW.valvePart`, `xray` 1 : le poids sur son trou (`off` 0, puis 1), puis soulevé par la vapeur (`bar` 1, `whistle` 1).
6. `VIEW.pinPart` : la tige en bas (`bar` 0) puis montée dans la butée (`bar` 1) ; et `twist` 1 dans les deux cas.
7. **Le climax** : `VIEW.system` dans la cuisine, `clog` 1, `whistle` 0, `bar` 1,8, `xray` 1, `seen` 1 — muette, saturée de signal ; puis `safety` 1 (le second jet).
8. `VIEW.windowSide` puis `VIEW.window` : `leak` 0 → 0,5 → 1, le joint sort, la fuite latérale.
9. **L'image de la chute** : l'établi, `VIEW.whole`, `leak` 1, `bar` 0,3, `plume` 0,6 — la cocotte entière qui fuit par le côté, calme, `mood` 0.
10. `VIEW.level`, `xray` 1, `fill` 0,5, `mark` 1 : la moitié.

### Ce que tu rends

Le fichier, qui passe au build (`npm run look -- 018 --at 0.04,45 --out <temp>/x.jpg --bare`) ; ton journal `docs/journal/018-model.md` ; un message de quinze lignes : ce qui est construit, chaque nombre, **les poses qui cadrent le mieux, prêtes à coller dans `VIEW`**, et ce qui n'est pas au niveau.

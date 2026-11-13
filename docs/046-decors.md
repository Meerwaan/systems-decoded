# 046 · Torchère — les décors

Trois fichiers, un agent chacun, en parallèle : `episodes/046-torchere/src/model.js` (le système : le réseau de torche, plein), `src/flamme.js` (le feu et le gaz au bout du tube) et `src/raffinerie.js` (la raffinerie aux rayons X, le compresseur, les fantômes, la fenêtre du like, le lave-vaisselle du 047). Tous trois existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `apply`). Recette commune : `docs/recette-agents.md`. Plan de mise en scène : `docs/046-actes.md` (son haut, et les lignes qui te concernent). Faits : `docs/faits/046-torchere.md` § 10 « À ne pas dire » et `046-contre-verification.md`. **La voix est enregistrée** (91,97 s) : `npm run script -- 046`.

**Aucun décor du catalogue ne convient tel quel.** La plateforme de CR02 (`CR02-deepwater/src/plateforme.js`) est une plateforme de forage en mer (derrick, colonnes de flottaison), en DA « noir chaud » (argile, ambre) : ni raffinerie, ni torche. On en **copie deux idées**, pas le décor : le contre-jour posé derrière la tour depuis la caméra (`onBeforeRender`, l. 1–20 de son en-tête) et `makePuffs` (fumée sombre) — en ramenant tout aux trois couleurs. Les feux existants (`042/feu.js`, `012/fire.js`, `040/feu.js`) donnent l'idiome de `flamme.js`. On ne touche jamais aux fichiers des autres dossiers ni au kit.

**L'échelle est une maquette** (`plan.js`, tête) : cheminée 18 m, colonnes 11 à 15 m, réseau ≈ 23 m de long — ce qui remplit la zone 3D du cadre (1080 × 720 px, à l'horizontale) vue de flanc. Aucune longueur, hauteur ni pression ne s'affiche ; `sources` le dit.

**Le repère** : l'origine au pied de la cheminée, sol y 0, **le gaz va vers +x** (colonnes à −x, cheminée à 0). **Azimut** (`kit/lib/stage.js` l. 381, vérifié sur planche) : la caméra est en t + d·(sin az·cos el, sin el, cos az·cos el) — `az` 0 se tient en +z, −90 à −x (côté colonnes), +90 à +x (au-delà de la cheminée). La clé vient de −x, +y, +z : à `az` ≈ −30, le chemin du gaz se lit de gauche à droite ; à `az` ≈ +150 (première image), on filme dans la lumière, la cheminée en contre-jour.

**Couleurs** : signal = la menace (pression dans les colonnes, gaz de délestage, liquide, air, gaz cru, fantômes ; la grande flamme est un feu : signal, cœur clair) ; veille = le système vivant (la flamme pilote, la purge, l'eau de la garde qui tient) ; ink = le reste. Pas de bleu, pas d'ambre. Tout dépend de l'état et de `time`, rien n'alloue dans `update` (seize appels par image).

**Ce que `world.js` fait déjà** : `apply` appelle les trois `update` à chaque image ; sur l'établi le système est re-parenté **en place** (`BENCHAT` = le milieu du réseau, rien ne bouge à la coupe), la raffinerie reçoit `bench: 1` et `shell: 0`. `flamme.group` est toujours dans la scène.

---

## `src/model.js`

**Ce qu'il construit** — le réseau de torche, **plein** (trois gris : fonte sombre, faces usinées plus claires, la pièce-héros nettement plus claire ; `metal` ≤ 0,5), à ses places de `plan.js` :
- **trois soupapes** (`VALVES`) au flanc de leur colonne : corps, chapeau, ressort visible sous un capot ajouré, un clapet qui se soulève (`relief`) ; leur sortie descend au **collecteur commun** (`HEADER.manifold`, le long de z).
- **le collecteur** (`HEADER.path`, le plus gros tuyau) sur son rack, brides aux coudes ; la tête du gaz (`flow`) y court en signal : **une tête de lumière qui avance et une traîne** (idée de `008/src/model.js`, `climb`), jamais un tuyau qui s'allume d'un coup ; le tuyau reste plein (la lumière court à sa surface ou par une fente), lisible à 270 px sur `VIEW.header`.
- **le ballon** (`KO`), couché sur ses berceaux, entrée et sortie sur le dessus ; **en coupe** avec `section` (le quart avant s'ouvre) : les gouttes de liquide signal tombent et font une nappe au fond (`liquid`), le gaz continue au-dessus.
- **la garde hydraulique** (`SEAL`), debout : **le cœur** ; en coupe, l'eau (une surface sombre, liseré veille), le plongeur qui descend sous l'eau, les bulles qui remontent (`bubbles` veille : la purge ; signal tout seul quand `flow` est entre `FLOWAT.seal` et `sealOut`).
- **la cheminée** et **le bout** (`TIP`, pare-vent, la buse de la flamme pilote du côté caméra, `PILOT.at`) : la cheminée **sombre sur un halo** — un contre-jour posé derrière elle depuis la caméra (l'idée de CR02, en ink/veille), sans quoi elle est sombre sur noir dans la première image. Avec `section`, une fente sur sa hauteur laisse voir **la purge** qui monte (`purge` : un filet veille continu, des têtes lentes) ; au bout, `air` : trois flèches signal qui tentent d'entrer et sont repoussées vers le haut par la purge.
- `explode` (sur l'établi seulement) : les soupapes se soulèvent de leur colonne, le bout se soulève de la cheminée, le ballon et la garde s'écartent d'un pas vers la caméra ; le chemin du gaz reste lisible d'un bout à l'autre. `lit…` : la pièce que nomme la voix luit faiblement veille (une lumière qui a un endroit).

**On réutilise** : `kit/lib/build3d.js` (`cyl`, `box`, `makePart`, `addMesh`, `explode`, `anchor`, `glow`, `fatLine`), l'idiome de `007-siege-ejectable/src/model.js` ; l'eau et les bulles de `018-cocotte-minute/src/model.js` ; la tête qui avance de `008-paratonnerre/src/model.js`. Ce qui change l'allure : le halo derrière la cheminée, la clarté du bout.

**API (exactement)** : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }` ; `parts` : `valve0 valve1 valve2 header drum seal stack tip` (chacune ses matières) ; `A` : `valve0..2, manifold, header, drum, liquid, seal, water, foot, stack, tip, pilot`. **Nombres lus** (`P`) : `bench explode section relief flow liquid bubbles purge air litValves litHeader litDrum litSeal litStack`.

**Images à réussir (liste fermée)**
1. La première image (candidates a, b, d de `docs/046-actes.md`) : la cheminée sombre sur son halo, en contre-plongée, le bout plus clair, la buse pilote.
2. `VIEW.foot` (scène) : le pied, la garde, le tuyau d'arrivée — trois gris, plein dans le verre de la raffinerie.
3. `VIEW.exploded` (établi, `explode` 1, `section` 1) : tout le réseau lisible de flanc dans la zone 3D, rien ne sort par le haut au-delà de l'en-tête.
4. `VIEW.valves` : `relief` 1, trois têtes qui convergent dans le collecteur (`flow` 0 → 0,12).
5. `VIEW.drum` : le ballon en coupe, le liquide qui tombe et se pose, la tête du gaz qui continue (`flow` 0,36 → 0,46, `liquid` 0 → 0,8).
6. `VIEW.seal` : la garde en coupe, plongeur, eau, bulles veille ; puis signal quand le gaz passe.
7. `VIEW.stack` puis `VIEW.tip` (`section` 1) : la purge qui monte, l'air repoussé au bout.
8. `VIEW.header` (scène, acte 3) : la tête signal qui court le long du collecteur, lisible à 270 px.

**Propre au dossier** : jamais de pression, de débit ni de temps d'ouverture affichés (« À ne pas dire »). La garde est le cœur : c'est elle la plus soignée. Journal : `docs/journal/046-model.md`.

---

## `src/flamme.js`

**Ce qu'il construit** — tout ce qui sort du bout (`FLAME`, `PILOT`, `TIP`), en coordonnées du monde, visible dans la scène et sur l'établi :
- **la grande flamme** (`flare` → 1) : un vrai volume marché qui part du bout (bouche claire), corps signal qui s'ouvre et roule, bords mangés par une turbulence qui monte, couchée un peu par le vent ; **jamais un cône, jamais un voile** ; « le plus clair gagne » ; tout ce qui monte se fond dans le noir avant l'en-tête (écran y < 450). À `flare` ≈ 0,08, la petite flamme de la purge, tout juste au-dessus du bout. **Le gonflement** de 0,35 à 1 en 1,6 s fait bouger la première image par son sujet.
- **la fumée noire** (`smoke`) : des bouffées sombres qui montent du haut de la flamme (`makePuffs` de CR02 à copier, en gris-noir, éclairées par la flamme en dessous), lisibles sur le fond (un liseré de la flamme sur leur ventre).
- **la flamme pilote** (`pilot`) : petite, veille, sur sa buse — un cœur clair, un corps veille ; lisible à 270 px sur `VIEW.tip` à côté du panache. À `pilot` 0, rien (le passage : elle se réduit et meurt en un quart de seconde, pas de clignotement).
- **le gaz cru** (`raw`) : quand la flamme meurt, un nuage gris qui sort du bout et **descend** vers les colonnes (traînées qui s'élargissent, traits signal fins dedans : « incolore », un gaz qui n'a rien à faire là) — l'idiome de la brume de `012/fire.js`.
- **la pluie de feu** (`drip`) : des gouttes enflammées fantômes qui tombent de la flamme, en traînées (pas en points), sur le plan large de l'établi.

**On réutilise** (copie et adaptation) : `042-toit-du-char/src/feu.js` (la colonne marchée, bouche blanche, braises en traînées), `012-gaziniere/src/fire.js` (brume, flamme de brûleur pour le pilote), `CR02-deepwater/src/plateforme.js` → `makePuffs` (fumée). Ce qui change l'allure : la hauteur (`FLAME.len`), la couche, le dosage d'émission (au-dessus de 3, ça bave).

**API (exactement)** : `export function buildFlamme()` → `{ group, A, update(P, time, px, eye) }` ; `A` : `base, crown, pilot, cloud` ; `eye` : la position de la caméra (`THREE.Vector3`). **Nombres lus** : `flare smoke pilot raw drip`.

**Images à réussir (liste fermée)**
1. La première image (les quatre candidates) : la flamme qui enfle entre 0,04 et 0,7 s, fumée noire, la flamme pilote veille déjà là.
2. `VIEW.flare` : la flamme géante au-dessus de toute l'usine, panache noir, rien dans l'en-tête.
3. `VIEW.tip` : la petite flamme (0,08) et la flamme pilote, nettes, lisibles à 270 px.
4. L'extinction (`flare` 1 → 0 en 0,3 s, `raw` 0 → 1) sur `VIEW.flare` et `VIEW.tip`.
5. La pluie de feu sur `VIEW.exploded` (établi).
6. Le gaz cru « incolore » sur `VIEW.tip` (commentaire).

**Propre au dossier** : la fumée noire est de la suie, pas « le gaz toxique » — l'image ne mélange jamais les deux (le gaz cru est gris clair et signal, la fumée noire). Journal : `docs/journal/046-flamme.md`.

---

## `src/raffinerie.js`

**Ce qu'il construit** — ce qui entoure le système, **aux rayons X** (`glass` + `asShell`, traits fins ≥ 1,8 px, pas de sol plein : une grille), et les deux lieux de la fin :
- **le sol en grille** (`GROUND`), **le rack** (`RACK`) sous le collecteur, **l'usine** au fond (`UNITS` : blocs bas, réservoirs, autres colonnes, tout en verre, plus pâle avec la distance).
- **les trois colonnes** (`COLUMNS`) : verre, plateaux en traits, échelles ; **`press` les remplit de signal par le bas** (un volume plein dedans, une surface qui monte, jamais un voile). Sur l'établi (`bench` 1), elles restent seules, très pâles, derrière le réseau.
- **le compresseur** (`COMPRESSOR`), **plein** : carter sur son châssis, accouplement, moteur à ailettes ; le rotor visible par une fenêtre du carter (`rotor` en tours ; `hum` son flou et le moteur vivant) ; `spark` : **une lumière qui a un endroit** sur le moteur (une boule qui gonfle deux images et meurt petite).
- **les fantômes** : `blast` — la colonne du milieu qui éclate en traits signal (0 → 1 toute sa vie, rien après) ; `cloud` — un nuage autour des colonnes, au ras du sol, « prêt à flamber ».
- **la fenêtre** (`PANE`, `pane`) : une façade d'immeuble de verre, le cadre d'une fenêtre au premier plan de `VIEW.pane`, la torche au loin.
- **le lave-vaisselle du 047** (`TEASER`, sur son propre sol, loin de l'usine) : caisse de verre, panier, cuve, **le bras d'aspersion plein** qui tourne (`arm`, en degrés), ses jets veille **inclinés** (ce sont eux qui le poussent : `jets`) ; un second bras en bas. Il doit se lire sous le panneau `#next` (zone haute) sur `VIEW.washer`, et **en contre-plongée sous le bras** sur `VIEW.washerArm` (le raccord de la boucle sur la rotation : le bras clair sur le fond, ses jets).

**On réutilise** : `kit/lib/usine.js` → `xray(geometry, { … })` (une coque de verre à partir de n'importe quelle géométrie), l'idiome de `006-defibrillateur/src/hall.js` ; les portiques en treillis de `L02/poste.js` pour l'esprit du rack. Ce qui change l'allure : la densité de traits au fond (l'usine ne doit pas devenir une dalle grise), le remplissage des colonnes.

**API (exactement)** : `export function buildRaffinerie()` → `{ group, A, update(P, time, px) }` ; `A` : `col0..2, compressor, rotor, motor, cloud, pane, washer, arm`. **Nombres lus** : `bench shell press rotor hum spark blast cloud pane teaser arm jets`.

**Images à réussir (liste fermée)**
1. `VIEW.compressor` : le compresseur plein au premier plan, le rotor qui s'arrête, l'étincelle ; les colonnes derrière.
2. `VIEW.columns` : les trois colonnes qui se remplissent de rouge, leurs soupapes (le système) au flanc.
3. Les fantômes : `blast` (sur « exploser », vu de `POSE0` et de `VIEW.columns`) et `cloud`.
4. La première image : les colonnes rouges derrière la cheminée (candidates a et c).
5. L'établi : les trois colonnes pâles derrière le réseau (`VIEW.exploded`).
6. `VIEW.pane` : le cadre de la fenêtre, la torche au calme au loin.
7. `VIEW.washer` et `VIEW.washerArm` : le lave-vaisselle aux rayons X, le bras qui tourne, poussé par ses jets.
8. `VIEW.flare` : l'usine entière, intacte, sous la flamme.

**Propre au dossier** : la scène n'est pas Fos (jamais de nom, de logo, de silhouette reconnaissable) ; personne à l'image. Le lave-vaisselle n'a ni marque ni chiffre. Journal : `docs/journal/046-raffinerie.md`.

**Le décorateur**, ensuite, n'habille que `raffinerie.js` (escaliers et passerelles sur les colonnes, petites lumières veille de l'usine au loin, réservoirs, une route) — rien devant le réseau ni sur la cheminée, rien dans le chemin du gaz.

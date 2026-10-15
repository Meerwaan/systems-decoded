# 019 · `src/model.js` — l'enrouleur (journal)

Fichier : `episodes/019-pretensionneur/src/model.js`. Le bouchon est remplacé, l'API est celle du contrat : `buildSystem() → { root, parts, A, update(p, time, px) }`. Le film se construit (`look` passe). **30 images lues** (planches de 8, 9, 5, 4, 3 et 1), toutes dans le dossier temporaire (`model-a…f.jpg`).

## Ce qui est construit

Dans le repère de l'enrouleur (origine au milieu de la base, axe de la bobine le long de x, sangle qui sort côté +z) :

- **Le bâti** : un dos embouti (fenêtre, trois trous, une patte de fixation au-dessus), deux joues percées, une entretoise. Gris sombre.
- **La bobine** : un tambour entre deux flasques à quatre fenêtres (on voit les couches de la sangle enroulée sur la tranche), la sangle enroulée (même trame que la sangle, dans le shader, elle tourne avec la pièce).
- **La sangle** : un ruban posé par son shader entre la bobine et son bout (`RETRACTOR.top` / `benchTop`), avec son ventre ; trame en chevrons qui court (`uRun`, en centimètres), fondue sous le pixel (`fwidth`) ; lisières plus sombres. Sur l'établi : un rouleau de renvoi sur une fine potence (le poteau est 12 cm derrière, pour laisser le bâti reculer dans l'éclaté) et une queue de sangle qui pend derrière le rouleau, qui raccourcit quand la bobine reprend.
- **La barre de torsion** : la pièce la plus claire, six rainures gravées. Droite : un arbre cannelé ; tordue (`give`) : un sucre d'orge, et les rainures luisent veille.
- **Le blocage** (bout −x) : roue à rochet (16 dents, cinq trous pour lire sa rotation), cliquet clair pivoté devant, pendule (masse sous un chapeau posé dans sa coupelle) qui bascule et soulève le cliquet.
- **Le prétensionneur** (bout +x) : turbine à dix augets dans un carter dont le couvercle est un anneau (les augets se voient sans rayons X) ; générateur de gaz couché sur le carter, sa buse coudée qui y plonge, son connecteur et deux fils.

## Les nombres de l'état

| nombre | ce qu'il fait |
| --- | --- |
| `bench` | bout de la sangle : anneau (voiture) ou rouleau sur potence + queue (établi) |
| `slack` | 1 → 0 : le ventre disparaît, la bobine tourne en enroulant (rotation +x, `REEL.take`), la turbine avec elle, la trame descend |
| `give` | la bobine rend `REEL.out`, la barre se tord, le bout côté rochet ne tourne pas |
| `load` | 0…`LIMIT` : les lisières de la sangle luisent signal, son corps se teinte |
| `fire` | 0,07–0,34 l'éclair blanc au coude de la buse (pic à 0,15) · 0,1–0,98 le gaz (anneau veille + tête de lumière, 1,35 tour, les augets prennent la lumière) · dès 0,14 le générateur noircit, suie autour de l'entrée du carter ; à 1 : noir, mat |
| `order` | ≥ 0,9–0,98 : connecteur et fils veille, une boule de lumière sur le connecteur |
| `lock` | le pendule bascule (0,55 rad), le cliquet monte dans les dents (0,22 rad) |
| `tug` | libre : la bobine dévide 7 cm (la turbine ne bouge pas : elle n'est embrayée que par la charge) ; bloquée : 0,45 cm puis plus rien, le ventre reste |
| `xray` | joues, flasques, tambour, sangle enroulée et carter en verre (jumeaux `asShell`) |
| `explode` | voir plus bas |
| `lit…` | teinte veille de la pièce (idiome du 014) ; `litBar` allume aussi les rainures |

## Libertés prises (à reporter dans `sources` si besoin)

- La torsion de la barre est dessinée **5 fois** l'angle que rend la bobine (`TWIST_GAIN`) : à l'angle vrai (96°), les rainures ne s'inclinent que de 6°, illisible. Un vrai limiteur se tord de plus d'un tour ; `REEL.out` est illustratif.
- Le blocage est montré sans son capot ; le carter a un anneau pour couvercle.
- Le ventre de la sangle tient lieu de mou (il ne « contient » pas 8 cm).
- La sangle ne porte pas d'ombre (ruban posé par son shader).

## L'éclaté : pas six en rang

Six pièces en une rangée dans 1080 px donnaient 107 à 190 px par pièce. Choisi : **quatre sur l'axe** (bâti · bobine et sangle · barre · turbine), **le blocage au-dessus du bâti, le générateur au-dessus de la turbine**, tournés vers la caméra. C'est un écart à la consigne (« en rangée le long de l'axe »), dit comme tel.

## Ce qui sombre sous l'en-tête

La sangle, le rouleau et la potence s'éteignent en noir entre y ≈ 490 px et y ≈ 418 px de l'image (`sinking`, en coordonnées d'écran : vaut pour toute pose, `shift` compris, dans la voiture aussi). Vérifié sur trois images avec l'en-tête. Les arêtes fines de la potence, elles, restent (très pâles, 0,3).

## Poses (monde ; sur l'établi, l'enrouleur est tourné de −90° : x local → z monde, z local → −x monde)

```js
const P = { fov: 28, side: 0, roll: 0, drift: 0.3 };
whole:    { ...P, tx: 0, ty: 9, tz: 0, d: 110, az: -70, el: 12, shift: 160 },            // inchangée, vue
strap:    { ...P, tx: 0, ty: 16, tz: 0, d: 170, az: -70, el: 10, shift: 170 },           // inchangée, vue
exploded: { ...P, tx: 0, ty: 12, tz: 5.5, d: 146, az: -76, el: 12, shift: 60, side: 30 }, // état : fz 4, fy 10, fs 26
spool:    { ...P, tx: 0, ty: 6, tz: 0, d: 60, az: -70, el: 12, shift: 160 },             // inchangée, vue
bar:      { ...P, tx: 0, ty: 6.6, tz: 0.6, d: 44, az: -60, el: 2, shift: 160 },          // xray 1 : la barre sous le bord de la sangle
chute:    { ...P, tx: 0, ty: 7.4, tz: 1.5, d: 50, az: -38, el: 3, shift: 160 },          // xray 1, slack 0, give 0 → 1, load 400 : l'hélice à droite de la sangle
charge:   { ...P, tx: 0, ty: 9, tz: 5, d: 46, az: -52, el: 14, shift: 160 },             // litCharge, fire 0,15 (l'éclair), fire 1 (tirée)
turbine:  { ...P, tx: 0, ty: 6.5, tz: 5.4, d: 50, az: -44, el: 8, shift: 160 },          // xray 1, fire 0,5
climax:   { ...P, tx: 0, ty: 11, tz: 1.5, d: 96, az: -50, el: 10, shift: 160 },          // fire 0,6 → 1, slack 1 → 0, order 1
lockSide: { ...P, tx: -0.6, ty: 3.6, tz: -5.2, d: 44, az: -150, el: 6, shift: 160 },     // la roue de trois quarts face ; lock 0 → 1 vérifié sur deux images
```

Dans la voiture : `VIEW.system` et `VIEW.pillar` tels quels (vus).

**Couverture** : sur l'établi, `explode` 1, tout au repos (`slack` 1), `pool` 0,3, lumière `fx 0, fy 10, fz 4, fs 26` ; pose `{ tx: 0, ty: 11, tz: 4.5, d: 150, az: -58, el: 28, fov: 28, shift: 60 }`. Vue sans l'en-tête seulement. À az −40 (la pose proposée) les pièces se recouvrent.

## À changer ailleurs

- `episodes/019-pretensionneur/src/world.js`, `VIEW` : remplacer `exploded`, `bar`, `charge`, `turbine`, `lockSide` par les lignes ci-dessus ; ajouter `chute` et `climax`. `VIEW.lockSide` d'origine (az −118) voit la roue presque par la tranche.
- `episodes/019-pretensionneur/src/cabine.js` : pour que les deux sangles se rejoignent sans marche, lire la trame de `model.js` — `import { WEAVE } from "./model.js"` : `{ color: 0xbdb9ad, period: 1.5, chevron: 0.85, duty: 0.4, dark: 0.6, selvedge: 0.72 }` (un chevron tous les 1,5 cm, profond de 0,85 cm, sombre à 60 %, lisières à 72 % au-delà de 80 % de la demi-largeur ; matière `solid(color, { rough: 0.86, double: true })`). Sens : quand la bobine reprend, la trame descend vers la bobine de `REEL.take × (1 − slack) − REEL.out × give` cm. Force : lisières signal (`1.1 × load / LIMIT`), corps à peine teinté.
- `episode.json` → `sources` : la torsion de la barre exagérée (voir « Libertés »).

## Ce qui n'est pas au niveau

- **L'éclaté** : l'écart à la rangée ci-dessus ; le blocage reste la plus petite pièce (≈ 120 px, non mesuré au pixel) ; le bâti touche presque la marge gauche.
- **La sangle sous charge** est saumon sur toute sa largeur, plus qu'une lueur.
- **La barre à travers la bobine** ne se voit que sous le bord de la sangle (el ≤ 4) ou depuis az ≥ −40 : la sangle montante la cache de face.
- **Dans la voiture**, sans halo, le bâti est sombre sur sombre : ce sont ses arêtes et la sangle qui le portent.
- **La charge tirée** : noire sur fond sombre ; elle se lit par contraste avec l'image d'avant, pas seule.
- **Pas vus** : `tug` libre (la bobine qui dévide, la queue qui s'allonge), `give` sans rayons X, le mouvement de l'éclaté entre 0 et 1 (le bâti recule puis glisse : pas d'interpénétration prévue, non vérifié), le contact dent / cliquet réglé à l'œil sur une image (`RATCHET_PHASE`).
- Aucune image en mouvement : la lisibilité de « la bobine tourne à l'envers » repose sur les fenêtres des flasques, les chevrons et les augets, jugés à l'arrêt.

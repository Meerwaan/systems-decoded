# 052 · ligne.js — journal du décor (sièges, toi, ligne, ciel)

2026-11-14. Contre le bouchon de l'architecte (API gardée : `buildLine() → { group, gripMount, A, update(P, time, px) }`).

## Lu
recette-agents, regles-image, 052-decors (haut + ligne.js), plan.js, world.js, main.js (haut), bouchon ligne.js, build3d (solid/glow/glass/asShell/lineMat/edgesOf), figure.js (leg/reach/lean/ghost), finish.js (`userData.finish = false`), blocks.setMood (le fond prend BG_HOT avec mood : le ciel est donc ADDITIF, il ne cache pas le fond).

## Choix (avant d'écrire)
- **Siège du héros** : verre (asShell) — suspente en tube (verticale, coude derrière le dossier, descend jusqu'à la poutre arrière), 4 assises et 4 dossiers séparés (les quatre places se lisent), flancs, garde-corps en U à charnière haute avec repose-pieds (relevé à `sit` 0, baissé à 1). Pend d'aplomb sous le point de suspente (rotation de pitch appliquée au point, pas au siège) ; `sway` en avant / arrière (axe z local), période d'un pendule de 2,4 m.
- **Toi** : `makeFigure({ shell, hands: "flat" })`, ghost (verre de la tête aux mains). `sit` 0 : debout sur le quai, à un point FIXE du monde (au bord, x board+35, la place extérieure), dos au siège qui arrive ; `sit` 1 : assis sur la place, suit le siège partout. Mélange des deux poses.
- **Autres sièges en gare** : par le TEMPS, pas la distance — table T(s) = ∫ ds / (v·speedAt) ; siège k = T⁻¹(T(héros) + k·2,4 s), k = −3…3 : 12 m d'écart en ligne, 2,4 m au quai, comme en vrai ; pince ouverte (FREE) entre les deux rampes de la came. Ils sortent de la gare jusqu'à 27 m et s'y fondent ; les sièges de ligne (portés par `rope`) en sortent en fondu dans la même bande : pas de siège qui apparaît à la bouche.
- **Câble de ligne** : tube maison (abscisse `s` du chemin en attribut), solid 0x3a3f45 metal 0,35, traits ink 0,35 en hélice, phase = (s − rope)/lay (même idiome que gare.js), fondus par `fwidth` ; + un trait ink de 1,8 px dessous pour le lointain. Une flèche de 1 % entre pylônes (chaises et pinces la suivent).
- **Sol** : grille de verre (shader, `fwidth`), le profil lissé du `GROUND`, trouée dans l'emprise de la gare ; un trait de profil sous chaque câble (le creux se lit).
- **Ciel** : dôme additif (horizon froid ink), crêtes en traits ink + rideaux qui n'écrivent que la profondeur (le haut du ciel s'arrête net sur la crête).

## Fait (ligne.js écrit, ≈ 30 Ko ; `npm run check -- 052` passe)
- Siège du héros, toi (debout fixe au quai → assis, garde-corps qui descend après 62 % de `sit`, mains sur la barre), 6 autres sièges en gare placés par le temps, 2 × 19 sièges de ligne portés par `rope` (fondu croisé 15–27 m après la bouche, fondu à 9 m autour du héros quand il est en ligne), pinces simples pleines qui s'allument en veille de la bouche vers le haut (`greens` = un front qui monte), câble à torons, flèche de 1 %, 5 pylônes de verre (fût, pied, traverse, deux balanciers de 6 galets inclinés sur la pente moyenne), sol en grille (5 m fine, 25 m large, fondu `fwidth`), traits de profil sous les câbles, dôme additif, 3 couronnes de crêtes et leurs rideaux de profondeur, flèches du commentaire (rouge 90 cm vers le bas, verte 180 cm vers le haut, au-dessus de la pince, côté extérieur).
- Planches (30 images lues) : p1 (8) poses de départ ; p2–p3 (8) quai, sortie, travée ; p4–p6 (12) réglages ; p7 (2) câble de près.

## Ce qui a raté et pourquoi
- Torons invisibles de près (p6) : un mélange de diffus seul, la nuit, ne se voit pas → les torons portent aussi 0,09 d'ink en émission (moyenne constante quand ils se fondent). Visibles en hélice (p7).
- Bande claire en travers de la travée (p1) : le liseré (rim) du sol vu en rasant → rim du sol 0,05 → 0,02.
- Dossier du héros en tache blanche de profil : reflet du softbox (spec 0,45 → 0,12, edge 0,6 → 0,45, arêtes des coussins 0,42 → 0,3). Reste le plus clair du siège de profil, sans baver.
- Flèche verte qui bavait (glow 1,7 → 1,25).
- Les poses `exit` de l'architecte et deux des miennes (exit2 derrière, exit6) : soit le sol seul, soit la gare qui mange le cadre.

## Poses qui cadrent (essayées)
- **Première image** (siège à `AT.hook`, ou chair 120 pour qu'il entre) : `{ tx: 1300, ty: 165, tz: -260, d: 1150, az: -72, el: -8, fov: 44, shift: 190, side: 0, roll: 0, drift: 0, dof: 0 }` — le siège ≈ 40 % de la largeur, pince ≈ y 520, siège ≈ y 1090 (dans 440–1160).
- **Quai** (chair `AT.board`, `sit` 0 → 1) : `{ tx: STATION.board, ty: 130, tz: SIDE + 40, d: 680, az: -38, el: 8, fov: 34, shift: 120 }` ; plus près, toi assis et la barre : `{ tx: STATION.board + 20, ty: 110, tz: SIDE + 70, d: 420, az: -62, el: 10, fov: 34, shift: 100 }`. Toi n'est jamais en très gros plan au-delà de celle-ci.
- **Sortie** (chair `AT.mouth + 300`) : `{ tx: 2600, ty: -500, tz: SIDE, d: 1800, az: -78, el: 40, fov: 50, shift: 0 }` — du dessus et derrière, toi sur le siège, la grille qui plonge puis remonte.
- **Travée raide** (chair `AT_S.steep`, `pull` 1) : `{ tx: STEEP_X + 30, ty: 3440, tz: SIDE, d: 1400, az: -12, el: 4, fov: 30, shift: 100 }` — les deux flèches entières, la pince, toi.
- **Ligne d'en bas** (`climb` de l'architecte, `greens`) : bonne telle quelle (pylône, sièges, pinces vertes) ; plus serrée : `{ tx: 6500, ty: 1600, tz: 0, d: 6000, az: -62, el: 8, fov: 34, shift: 60 }`.
- Câble de près, torons : `{ tx: STEEP_X + 60, ty: 3590, tz: SIDE, d: 240, az: -35, el: 6, fov: 30, shift: 0 }`.

## Pas encore au niveau (franchement)
- La première image n'a été jugée que sur le bouchon de la gare (les pneus et la came du bouchon mangent le haut du cadre) : à revoir sur la vraie gare. Le siège y est lisible mais reste « un cadre de verre » : sa force viendra de la pince pleine et de son mouvement.
- La sortie se lit, le vertige moyennement à 270 px : la grille du creux est régulière ; le décorateur (sapins, balises) le donnera.
- Torons à 5 m/s : 16,7 cm par image pour un pas de 30 cm (> 1/7) — le flou d'obturation les adoucit, mais un plan serré sur le câble qui court peut stroboscoper. Mieux : les plans serrés sur le câble pendant qu'il tourne sont courts, ou à `rope` lent (même règle pour gare.js).

## À changer ailleurs
- `world.js` : `export const POSE0 = { tx: 1300, ty: 165, tz: -260, d: 1150, az: -72, el: -8, fov: 44, shift: 190, side: 0, roll: 0, drift: 0, dof: 0 };`
- `world.js` VIEW : `quay: { ...P, tx: STATION.board, ty: 130, tz: SIDE + 40, d: 680, az: -38, el: 8, fov: 34, shift: 120 },`
- `world.js` VIEW : `exit: { ...P, tx: 2600, ty: -500, tz: SIDE, d: 1800, az: -78, el: 40, fov: 50, shift: 0 },`
- `world.js` VIEW : `steep: { ...P, tx: STEEP_X + 30, ty: 3440, tz: SIDE, d: 1400, az: -12, el: 4, fov: 30, shift: 100 },`
- `gare.js` (même idiome de câble) : ajouter aux torons la même émission, sinon la couture à la bouche se voit — dans le `onBeforeCompile`, après `#include <emissivemap_fragment>` : `totalEmissiveRadiance += uInk * 0.09 * strand;` (strand = mix(0.2, stripe, vis)), phase `(s − rope) / CABLE.lay + angle/2π`, s = abscisse du chemin (`pathAt`).

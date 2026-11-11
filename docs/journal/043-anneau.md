# 043 · anneau.js — journal du décor

2026-11-08. Le tunnel de l'anneau au grain, l'anneau entier, le train (docs/043-decors.md § anneau.js). Planches : `.cache/planches/043/anneau/`.

## Lu
Recette des agents, règles d'image, `043-decors.md` (haut + ma section), `043-actes.md` § première image, journal de l'architecte, `plan.js`, `world.js`, le bouchon, `build3d.js` (glass, asShell, lignes), `atmo.js` (makePool), `makeEmbers` (003/shaft.js).

## Parti pris (avant la première planche)
- **Le verre vu de l'intérieur** : mon propre verre (`xglass`) — une face vue de dos (l'œil dedans) ne prend que `uBack` de sa lumière ; ce qui frôle l'objectif s'efface (`uNear`) ; au loin le liseré s'élargit et s'adoucit (pas de scintillement) et les détails s'éteignent au-delà de ≈ 25–40 m.
- **Les aimants suivent la courbe** : chaque pièce est construite droite dans le repère du faisceau (x le long de s, y en haut, z vers l'extérieur) puis cintrée sur l'anneau ; les 42 aimants hors insertion fusionnés par matière (une passe par coque).
- **Le train** : 2 496 paquets placés par le shader (aucun calcul par paquet dans `update`) ; ils disparaissent exactement au passage du point 6 ((place + ½)·slot < dump·(C − trou), équivalent du « k < dump·n » du plan au wagon près : c'est ce qui raccorde avec le flot de `sortie.js`).
- **Au loin** : une ligne de lumière (ruban en pixels, ≥ 2 px) qui porte le train blanc, le trou noir, les wagons tant qu'ils se lisent.
- **Les capteurs** : six barreaux par groupe posés en travers sur le flanc haut extérieur (lisibles un par un de près), un groupe tous les 47 cm ; au loin un point par groupe (l'anneau pointillé).

## Planches
1. `p1.jpg` (8) — le verre lavait tout en blanc : un tube vu dans sa longueur frôle l'œil partout (le liseré du kit s'allume sur toute sa surface). Les capteurs : ruban vert ; la bobine chaude : tout le cadre rouge.
   → `xglass` juge le liseré **dans la section du tube** (la tangente de l'anneau retirée du regard) : un tube se dessine en deux contours qui filent au point de fuite, jamais en entonnoir lumineux ; face vue de dos (œil dedans) ≈ éteinte.
2. `p2.jpg` (6) — plus de voile ; mais les aimants presque invisibles, une rangée « boîte » à l'horizon (c'est la caverne et le bloc de `sortie.js`, pas moi).
3. `p3.jpg` (6) — candidats d'accroche H1 (dedans, au ras du grain) / H2 (bas, fov 44) : **H1 retenu** (le grain et sa gerbe au tiers gauche, le train en diagonale). Le paquet héros en nuage de grains se lit (s0.4). Chaleur encore trop large.
4. `p4.jpg` (8) — K1 (dehors, trois quarts) moins fort que H1 ; jauge + barreaux du capteur lisibles ; `gapFind` : les aimants d'éjection (sortie) cachent le tube, le trou se lit par l'absence de paquets ; grains du décompte lisibles, anneaux non.
5. **Bogue trouvé par mesure (sans image)** : tous mes rubans de traits (anneaux des aimants, tunnel, ligne lointaine, alerte, anneaux du décompte) étaient **éliminés comme faces arrière** (les quads tournent dans le sens horaire à l'écran) → `side: DoubleSide`. Vérifié par différence de pixels : +6 000 px encre sur le décompte, la ligne de l'anneau forte sur `ringArc`.
6. `p8.jpg` (2) — l'accroche avec les traits : le tunnel d'anneaux (brides) qui file au fond à droite, le grain, la gerbe, le train ; la bobine frappée rougit sous la gerbe.
Images lues : 30 / 30. Le reste a été contrôlé par mesure de pixels (`stats.mjs`, `diff.mjs` dans le dossier des planches).

## Poses qui cadrent (à coller)
- `hook` / `POSE0` : `{ tx: 0, ty: 2, tz: 0, d: 62, az: -77, el: 4.6, fov: 34, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 }` — œil entre la bobine et la culasse de l'aimant 0 ; à t = 0 un trou de wagon passe à x 76–128 (au-delà du grain).
- `coil` : `{ ...P, ...CLOSE, tx: -130, ty: -2, tz: 0, d: 130, az: -35, el: 12 }` — la bobine 0 de trois quarts, dehors, le point chaud au centre.
- `hero` (slice 0,4) : `{ ...P, ...CLOSE, tx: -102, ty: 0, tz: 0, d: 34, az: -58, el: 8 }` ; (slice 1) `{ ...P, ...CLOSE, tx: -128, ty: -2, tz: -2, d: 70, az: -42, el: 10 }` (serré, à reprendre par l'acte).
- `monitor` : `{ ...P, ...CLOSE, tx: -33, ty: 31, tz: 44, d: 95, az: -22, el: 8, fov: 32 }` (la jauge debout sur le groupe du grain).
- `tally`, `trainLong`, `ringArc` : celles de `VIEW` tiennent ; `ringArc` montre l'anneau petit en bas du cadre (à rapprocher ou `shift`).

## Ancres (A)
`grain` (0,0,0) · `coilHit` s 140 (STRUCK.hitS lu comme l'abscisse depuis le grain, face intérieure basse) ≈ (−139.8, −1.9, −7.4) · `hero` s 100 ≈ (−100, 0, −1.1) · `monitor` = pied de la jauge ≈ (−32.8, 30, 43.8) · `alertEnd` = ringAt(S6) · `tally` le milieu du rang · `teaser` la poitrine du gilet (y 40).

## Pas au niveau (franchement)
- Le train de près est une **barre blanche épaisse** (les paquets d'un wagon se fondent dans le flou : 15 cm de traînée pour 9,6 cm d'écart) ; il se lit « train » quand un trou de wagon passe. Les aimants de près se lisent par leurs brides et contours, pas comme des volumes.
- La chaleur de la bobine à 0,7 : une bande rouge le long de la bobine plus qu'une tache.
- Non revus en image après les derniers réglages : `side`, `under`, `inpipe`, `train`, `trainLong`, `sensors` (vague), le fantôme `sweep`, l'alerte `ringPulse`, `like`, le teaser (le gilet et le halo se dessinent, la pierre → balle non vue).

## À changer ailleurs
- `world.js` : `export const POSE0 = { tx: 0, ty: 2, tz: 0, d: 62, az: -77, el: 4.6, fov: 34, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 };`
- `world.js` VIEW : `coil: { ...P, ...CLOSE, tx: -130, ty: -2, tz: 0, d: 130, az: -35, el: 12 },`
- `world.js` VIEW : `hero: { ...P, ...CLOSE, tx: -102, ty: 0, tz: 0, d: 34, az: -58, el: 8 },` (le paquet héros est à s 100, plus à s 70)
- `world.js` VIEW : `monitor: { ...P, ...CLOSE, tx: -33, ty: 31, tz: 44, d: 95, az: -22, el: 8, fov: 32 },`
- `docs/catalogue-notes.json` (après rendu) : `043/anneau.js` — un anneau d'accélérateur aux rayons X et son train de particules ; réutilisables à part : `xglass` (verre qui ne lave pas de l'intérieur d'un tube), `ribbon` (traits en pixels, s'effaçant à distance), `bend` (pièce cintrée sur un cercle).

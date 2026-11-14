# 050 · model.js (la plaque à induction) — journal

## Fait (14/11)
- `buildHob()` réécrit sur l'API du bouchon (exports, signature d'`update`, nombres, ancres inchangés).
- Verre : `solid` noir, rugosité 0,5, `env` 0,08, `coat` 0,3 (rugueux 0,18), `specularIntensity` 0,25, **`finish` éteint** (les traces de main du plateau faisaient des plaques sales sur le verre noir). La « tache énorme » venait de `coat` 1 / `rough` 0,12 + du reflet de l'environnement (nuageux, rose en cuisine) — elle est partie. Le verre reste un peu brun-rose sous la clé rose de la cuisine (lumière directe), noir sur l'établi.
- `see` : verre et boîtier passent en transparence ; coquilles `glass` à rim très faible (une plaque mince vue en rasant s'allumait toute entière avec un rim normal : voile rose).
- Inducteurs : spirales de cuivre (tube le long d'une spirale d'Archimède ; héros 18 tours, autres 14), disque de mica, 8 barreaux de ferrite rayonnants qui dépassent du bord, plateau porteur ; pastille de température (plot sous le verre + un point lumineux sur la face du verre quand `sensor` > 0).
- Carte : plaque à encoche (le ventilateur), dissipateur à 9 ailettes, 2 transistors, 2 condensateurs, pont, self, bornier, piste de cuivre ; cordon qui entre par l'arrière ; fil montant (« riser ») vers la sortie de la spirale héros, qui s'étire avec l'éclaté.
- Courant (`flow`) : tube veille par-dessus chaque conducteur, bandes en comète (tête claire vers où ça va), cordon 0 → 0,45, piste → 0,8, montée → 1.
- Courant dans la bobine (`coil`) : bandes angulaires légèrement enroulées (toutes les spires s'allument aux mêmes angles), elles vont et viennent avec le champ.
- Champ (`field`) : boucles autour de l'enroulement dans 10 plans radiaux (3 imbriquées dans le plan de coupe, 2 ailleurs), qui montent par l'intérieur, traversent le verre dans le fond (sommets 0,22 / 0,42 / 0,7 cm au-dessus du verre) et reviennent par la ferrite. Alternance 1 Hz : B = cos ωt, comètes qui changent de sens (`uDir`), éclat 0,45 + 0,55 |B|.
- Coupe (`cut`) : ce qui traverse z = 8 est construit entier / moitié arrière / moitié avant ; dès `cut` > 0 les moitiés remplacent les entiers et l'avant tombe sous la plaque (y −45·cut²), invisible à 1. Tranche du verre = trait clair, chaud (signal) sous le fond selon `glassHeat` ; spires en carrés cuivre clair (qui s'allument veille avec le courant) ; ferrite coupée en long.

## Planches
- p1 : tache/voile sur le verre, bobine en disque vert plein (surcouche trop large, `litCoil` trop fort), carte verte (`litBoard`), section vide (l'éclaté du squelette d'acte à 26 s : toujours passer `explode: 0`).
- p2 : les marbrures roses/vertes = `finish` (traces de main) + `env` → éteints sur verre, carte, boîtier.
- p3 / p4 : section lisible (spires, ferrite, boucles, tranche chaude) ; bobine en « hélice » → comètes plus fines et enroulées.
- Colonne lumineuse verte au-dessus du foyer héros sur l'établi : pas dans model.js (rien chez moi ne brille là à `sensor` 0, `field` 0) — un faisceau du plateau ou de la casserole.

- p5–p8 : bobine « bras de spirale » lisible ; anneau chaud + point veille lisibles (`hotRing`) ; carte lisible depuis l'arrière gauche (cordon, piste, montée, ventilateur) ; reflet en cuisine dompté (`coat` 0,1, `specularIntensity` 0,18) : verre noir sur `hook`, reflet rose doux ailleurs.
- `check` passe (0 erreur ; restent l'avertissement de contraste de la nav et les débordements de puces, pas chez moi).

## Poses qui cadrent bien
- Carte (image 3) : `{ ...P, tx: -4, ty: B + 0.5, tz: -6, d: 80, az: -120, el: 14, shift: 120, ...CLOSE }` (état `explode` 1, `flow` 1) — à l'`az` −40 du plan, l'inducteur héros cache la carte.
- Section : `VIEW.section` tel quel, **avec `explode: 0`** (le squelette d'acte tient l'éclaté à 26 s). Plus serré pour le principe : `{ tx: 18, ty: B - 0.4, tz: 8, d: 14, az: -8, el: 4, shift: 0 }`.
- Afficheurs : à plat sur le verre, un chiffre vu sous `el` 26 est écrasé (plus large que haut) ; `VIEW.display` (el 32) se lit. `VIEW.emptyZone` coupe le « 9 » au bord : essayé `{ tx: 168, ty: HY + 1, tz: 47, d: 58, az: -36, el: 26, shift: 110 }` (le 9 entre, mais écrasé) → monter `el` vers 34–38 (non vérifié).

## Pas encore au niveau
- Le sens du champ sur une image fixe : les comètes ont une tête, mais à 270 px deux instants opposés se ressemblent ; l'alternance se lit en mouvement (aller-retour des bandes + respiration |B|).
- La section dépend de la coupe de la casserole (bouchon : la casserole entière cache le haut du cadre).
- Colonne verte verticale sur l'établi au-dessus de x ≈ 0 (pas chez moi).
- 50 vignettes lues (planches de 8 comptées par vignette) : au-dessus du budget de 30.

## À changer ailleurs
- `world.js`, `VIEW.board` → `board: { ...P, tx: -4, ty: B + 0.5, tz: -6, d: 80, az: -120, el: 14, shift: 120, ...CLOSE },`
- `world.js`, `VIEW.emptyZone` → `emptyZone: { ...P, tx: HANDW[0] + 1, ty: HY + 1, tz: HANDW[2] + 8, d: 58, az: -36, el: 36, shift: 110, ...CLOSE },` (à vérifier sur planche).
- `casserole.js` (cohérence de la coupe) : la moitié +z tombe sous la plaque comme celle de la plaque (`y −45·cut²`, invisible à 1) ; sa face de coupe à z = 8 exactement ou en retrait, pour ne pas couvrir les boucles du champ, qui sont dans ce plan.
- Chef de production : la colonne de lumière verte au-dessus de l'établi (x ≈ 0, `fx` 0 de `BENCHED`) se voit dans l'éclaté et la bobine — faisceau du plateau ou de la casserole, à identifier.

## Catalogue
- **Plaque à induction** `050/model.js` — `buildHob()` : verre vitrocéramique satiné, 4 inducteurs (spirales, mica, ferrite), carte d'onduleur, ventilateur, cordon, boîtier ; afficheurs 7 segments ; courant, champ alternatif ralenti, chaleur du verre ; éclaté et coupe (`see`, `on`, `field`, `coil`, `flow`, `glassHeat`, `sensor`, `blink`, `power`, `hot`, `explode`, `cut`, `fan`, `lit*`). Le shader `flowMat` (courant en comètes, le long d'un tube ou autour d'un axe) peut monter dans le kit.

## Retouche du 14/11
- (1) Sens du champ illisible à l'arrêt → chevrons (cônes veille éclaircis) sur les 6 boucles du plan de coupe, côté intérieur et côté extérieur (le sommet est caché dans le fond), retournés avec B (`scale.x = dir`), allumés avec `field` > 0,55 ; pointe blanche (`uTip`) en tête des comètes : spires 0,6, champ 0,5. Vérifié à 31 (montent), 32,5 / 32,533 (descendent, continus), 33,2 (remontent) ; bobine à 24,5. Un essai à 0,22 puis aux sommets : trop chargé / invisible (sommets dans le fond de la casserole).
- (2) Colonne verte sur l'établi = la montée (`riser`), voulue, mais son shader recevait `uScale = gap` au lieu de `gap / 100` : rayures sous-pixel, colonne pleine. Corrigé (comètes comme le cordon et la piste). Vérifié à 24,5.
- (3) Voile rose à gauche en cuisine → verre `coat` 0,02 (reste physique, `specularIntensity` s'applique), rugosité 0,55, `env` 0,04, `specularIntensity` 0,08. Vérifié à 45,5 : voile parti.
- `check` passe. 21 vignettes lues (au-dessus des 12).

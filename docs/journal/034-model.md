# 034 · Boîte noire — journal du décor `src/model.js` (l'enregistreur, le système)

2026-10-30. Agent `decor`. Contrat : bouchon de l'architecte (API gardée telle quelle), `plan.js`, `world.js` (`FIRST`, `apply`). Planches dans `.cache/planches/034/model/` (`mk.mjs` + `presets.mjs` + `shots-*.mjs` → `essais-*.json`).

## Construit
- **Boîtier** : six panneaux de tôle orange brûlé (signal assombri, `0x9c3a1b`, vernis léger) — leurs joints font le détail —, plaque de service en relief sur chaque flanc, deux bandes réfléchissantes (encre, un peu brillantes), poignée et deux crochets de maintien à l'avant (−x), connecteur et deux pions à l'arrière, deux patins dessous (vus en contre-plongée), vis, berceau (deux sabots) sous le module. Jumeau de verre (corps + couvercle) pour `xray`.
- **Cartes** : quatre cartes gris-vert (`0x7b8781` — plus sombre, elles faisaient « fil de fer » noir sur noir), puces sombres côté +z, connecteur de bord. Jumeaux de verre.
- **Module** (héros, orange plus clair `0xc04a20`) : canister peint ; bande réfléchissante, deux sangles d'acier et leurs boucles, un bossage et huit boulons sur chaque face. Dedans, quatre canisters emboîtés (peinture 0,12 / acier 4,7–5,88 / isolant 3,6–4,7, grain / absorbeur 2,2–3,6) et la carte mémoire (puces). Coupe : un coin s'envole de chaque couche vers la caméra de `VIEW.section` (bissectrice +y +z), **en gradins** (104° / 86° / 68°) : chaque couche montre sa face. Les couches s'écartent d'un cheveu (isolant ×0,945, absorbeur ×0,89 : un trait noir entre elles).
- **Balise** : cylindre gris clair sur la face avant du module, bride, deux colliers, nez conique, interrupteur à eau (deux plots clairs), lentille + halo veille (souffle de 1/10 s par seconde, phase `PING`). **Pile** dedans (gris moyen), jauge de cinq crans veille.
- **Effets** : flamme (shader, 10 langues signal qui montent le long des flancs et des bouts) + braises lentes ; dans l'acier, un dégradé signal du dehors vers dedans qui meurt dans l'isolant (patch du `MeshStandard` : émission + albédo assombri là où c'est chaud) ; 20 flèches signal épaisses (instanciées) ; enfoncement de la coque en quatre lobes (sommets) ; coque de verre veille autour du module (`litCore`, `hold`) ; lecture : 7 traits veille, une tête de lumière qui court du centre vers la sortie de la coupe ; reflets qui glissent le long des bandes (`shine`).

## Ce qui a raté et pourquoi
- Planche a : éclaté trop large (32 cm de boîtier + 27 cm de cartes à plat) ; cartes `0x2c3532` = noir sur noir, lues comme du fil de fer ; pile trop sombre.
- Planche b : flammes = rideaux rectangulaires (forme trop large en bas, coupure horizontale) → langues effilées (`yy = y / reach`, demi-largeur qui se referme). Jauge de pile trop verte à travers la balise de verre → atténuée hors `litPile` / éclaté.
- Planche c/d : chaleur invisible dans l'acier une fois le module avancé dans la lumière (gris clair + rouge = lavande) → l'albédo s'assombrit là où ça chauffe.
- `VIEW.verdict` de l'architecte (`ty: 90`) : le module est à y ≈ 19 et le fond à −200 → le cadre était vide.

## Planches (images lues)
a 8 · b 8 · c 8 · d 8
 · e 8 (avec l'en-tête) = **40 lues : budget de 30 dépassé** (j'ai tiré des planches de 8 quand 4 auraient suffi). Dernière retouche faite sans la regarder : émission de chaleur ramenée de 1,6 à 1,0 × signal (la planche e montrait le module chauffé en une masse rouge qui bave ; le dégradé acier → isolant se lisait, mais fondu dans la peinture). `npm run check -- 034` passe (0 erreur).

## Ce que fait chaque nombre ici
`bench` rien · `explode` balise (0–0,45) devant-haut, pile (0,15–0,6) qui en sort, boîtier (0,3–0,85) recule au sol, couvercle levé, tourné vers l'œil, derrière, cartes en éventail au-dessus du boîtier, module (0,5–1) levé et AVANCÉ vers la caméra (centre −4, 27, 12) · `xray` boîtier, cartes, balise → verre encre (la pile et sa jauge se voient dedans) · `sep` tout sauf le module descend ; la balise tombe intacte au sol devant le boîtier (0 → 40 cm de `sep`) · `apart` panneaux, cartes, balise couchés et dispersés à ≈ 35 cm autour, peinture → gris mort, flash coupé · `section` coins qui s'envolent (fondus 0,3 → 0,85), couches écartées, bande et sangles fondues (0 → 0,3) · `heat` flamme + braises + dégradé dans l'acier · `crush` 20 flèches qui arrivent de 11 cm et respirent (celles devant la coupe s'effacent avec `section`) · `flex` enfoncement en quatre lobes (10 % au plus) · `hold` coque veille autour du module ; avec `section`, la face d'acier veille · `ping` souffle de la lentille, phase `PING` · `charge` cinq crans (atténués hors `litPile` / éclaté) · `read` carte veille + traits · `shine` reflet qui monte le flanc +z puis passe le dessus de chaque bande, et fait le tour de la bande du module · `lit*` arêtes veille + émission faible (boîtier et balise : leur verre veille par-dessus la peinture).

## Poses (vues bonnes sur planche, à coller dans `VIEW`)
- `exploded: { ...P, tx: 0, ty: 22, tz: 2, d: 180, az: -40, el: 20, shift: 60 }`
- `beaconBench: { ...P, ...CLOSE, tx: -26, ty: 31, tz: 12, d: 58, az: -52, el: 10, shift: 110 }`
- `caseBench: { ...P, tx: 6, ty: 12, tz: -6, d: 120, az: 35, el: 22, shift: 110 }` (de l'arrière-droite : le module ne masque plus le boîtier)
- `core: { ...P, ...CLOSE, tx: -4, ty: 27, tz: 12, d: 58, az: -38, el: 12, shift: 110 }`
- `section: { ...P, ...CLOSE, tx: -5, ty: 27, tz: 12, d: 50, az: -28, el: 20, shift: 110 }` (éclaté 1 ; sans éclaté, le module est en (2, 19, 0))
- `POSE0`, `beacon`, `floor`, `crushed`, `like`, `tail` de l'architecte : bons tels quels.
- `verdict` : NON vu bon. Avec `depth: 3898` (module 2 m au-dessus) il fait 20 px ; proposé `depth: 3899.2` (80 cm) et `{ tx: 0, ty: -30, tz: 0, d: 240, az: -36, el: 14, fov: 34, shift: 80 }` — à vérifier.

## Pas encore au niveau
- Chaleur : dernier réglage non regardé. Les flammes sont des langues lisibles mais plates (plans).
- Éclaté : les cartes passent derrière le module ; le halo du banc est sous le boîtier, pas sous le module.
- Le nez de la balise : interrupteur à eau petit à `VIEW.beacon` (deux plots clairs ≈ 4 mm).

## À changer ailleurs
- `world.js` `VIEW` : les cinq poses BENCH ci-dessus ; `verdict` (+ `depth: 3899.2` dans l'acte de la chute).
- `episode.json` `cover.cam` : l'éclaté est petit et bas avec `shift: -430` ; essayer `{ tx: 0, ty: 22, tz: 2, d: 190, az: -40, el: 24, shift: -300 }` (non vu).

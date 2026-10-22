# 027 · Voie de détresse — journal de `src/camion.js` (le poids lourd de verre)

2026-10-21, de 12 h 23 à ≈ 13 h. Agent du décor `camion.js` (consigne : `scratchpad/nuit/consigne-decor.md`, section « camion.js » de `docs/027-decors.md`).

## Lu
- Consigne commune, `docs/recette-agents.md`, `CLAUDE.md` (« Notre patte », « Pour que ça ne fasse jamais amateur », « Net et fluide »), `docs/027-decors.md` (haut + ma section), le haut de `docs/027-actes.md` et ses lignes sur le camion, le journal de l'architecte.
- Contrat : `plan.js`, `world.js`, le bouchon `camion.js`, `main.js`.
- Gestes repris : `014-abs/src/street.js` (le verre d'une carrosserie qui ne fait pas de « mur laiteux » — facteur `turn` —, les traits en pixels qui s'éteignent avec la profondeur, la marque de flanc étalée à vitesse, toi assis : `hold`, `leg`, `lean`, le pied sur la pédale), les braises des 003 et 007 (`makeEmbers`, périodiques), `atmo.js` (`makeMotes` : traînées), `figure.js`, `build3d.js`.

## Ce qui est construit (API du bouchon gardée : `buildTruck()` → `{ group, A, update(P, time, px) }`)
- **Hiérarchie** : `group` (repère du camion) › `frontAxle`, `driveAxle` (ne font que descendre) · `body` (le tracteur : descend et pique autour de l'essieu avant) · `hitch` à la sellette (tourne seul : l'articulation) › trois essieux de remorque (descendent un par un) · `trailerBody` (la caisse : descend et pique autour du pivot, 118 cm).
- **L'articulation** se déduit du chemin : le pivot sur le tracteur, puis le point du chemin à 7,71 m derrière lui (Newton sur `truckAt`, 5 tours, sans allocation). Vérifié au calcul : pivot convergé à 0,00 cm, essieu arrière à moins de 16 cm du chemin dans le S (−10,3° d'articulation à s 234, +9,4° à s 246), remorque dans l'axe dès s 264.
- **La cabine** (verre `hullGlass`, après le 014 : un panneau plat ne s'allume pas en mur, ses arrondis oui ; pare-brise et vitres latérales avec leurs reflets) : face plate à pare-brise incliné (7,5 cm par mètre), toit haut à 390, carénage et pare-chocs devant les roues, marchepieds derrière ; traits forts (silhouette, pare-brise, ta porte et sa vitre), fins (calandre, l'autre porte, arche de roue, marches), lampes (deux lames de phare par coin). Pare-soleil et ses quatre feux (encre), feux de gabarit de toit, rétroviseurs (deux par côté, sur leurs bras).
- **Le châssis** (verre fin) : longerons, sellette, réservoir (à DROITE : ton côté reste dégagé entre marchepied et roues motrices), garde-boue des jumelées, arbre de transmission, essieux et pont.
- **La semi-remorque** (fourgon 13,6 m, verre plus discret que la cabine) : ses arêtes en traits forts ; **de dos**, une classe de traits à elle (cadre des portes, fente, quatre crémones et leurs poignées) ; charnières, barre anti-encastrement, bavettes, protections latérales, béquilles en traits fins. Feux : stop (signal, s'allument à `pedal` > 0,08 avec un halo de 150 cm), feux de position (signal faible, toujours), gabarits arrière (signal) et avant (encre), quatre gabarits par flanc (encre) — le contour qu'un poids lourd dessine la nuit. Les lentilles sont des plans orientés : un feu ne se voit pas de dos.
- **Neuf roues** : pneus de verre (cercles nets, l'épaule extérieure et la jante en fort), jumelées à l'essieu moteur (moyeu à ±91 : faces extérieures à ±124), simples larges à la remorque ; une marque peinte sur chaque flanc extérieur qui tourne avec `s` (100·s/53) et s'étale sur l'arc balayé pendant l'obturation (rien de fin qui tourne).
- **Les tambours** (9 pleins : fonte sombre, flasque, cylindre de frein et sa tige, arêtes fines) et **leur chaleur** : une peau additive signal, la plus vive sur la bande des mâchoires, moins sur la face, plus sombre vers le moyeu, plus vive face à l'œil ; un halo dans l'air sous chacun des **dix** (le tambour-héros compris) ; **les braises** des dix, en traînées.
- **Toi** (`makeFigure`, verre, tête de verre aussi : seules tes mains restent pleines) : hanches à (−60, 185, −50), buste penché de 4°, mains sur la jante à « 9 h 15 » (`hold`), pied gauche à plat près de la porte, **pied droit sur la pédale**.
- **Pleins** : le volant (jante pâle, trois branches, moyeu sombre, repère pâle à midi ; 100° à `steer` 1) et **la pédale de frein** (patin pâle à quatre nervures sombres, charnière au plancher, pédale « en orgue » d'un poids lourd, charnière au plancher : 52° au repos, 32° au plancher).

## Chaque nombre de l'état, chez moi
- `s` : la rotation des roues ; l'articulation (chemin) ; les essieux dans le gravier (`inBed`) ; **la vie des braises** (elles naissent tous les 2,6 à 6,2 m roulés : au gel, `s` tenu, elles restent suspendues dans l'air).
- `kmh` : l'étalement des marques et la longueur des traînées de braises ; plus aucune braise sous 4 km/h (pleines à 24).
- `pedal` : le patin et ton pied — 0 levé (la semelle à ≈ 7 cm au-dessus du patin, la pointe un peu relevée), 0,05 contact, 1 au plancher ; feux stop au-dessus de 0,08.
- `steer` : le volant (100°, + à droite) et les roues avant (30°, `A.hubFL` compris) ; tes mains suivent la jante.
- `heat` : la peau des tambours (signal × 2,3·heat²), le halo sous chacun, le nombre de braises (aucune sous 0,3 ; toutes à 1).
- `sink` : chaque essieu descend de `SINK·sink·inBed(s − AXLES[i])` ; le tracteur suit (nez qui pique de ≈ 24 cm à `sink` 0,5 quand seul l'avant est entré), la remorque aussi (pivot et boggie).
- `you` : toi (0/1). `shell` : le verre, ses traits et ses feux (0–1) ; les pleins restent.

## Planches (30 images lues sur 30)
1. **p1** (8, bouchons de `col.js` et `model.js`) — le camion se lit-il dans les quatre candidates et les plans larges ? Oui de profil ; mais (i) **trois poses de `VIEW` ont la caméra DANS la montagne** (dalle blanche du bouchon) ; (ii) le phare vu de dos brillait (une boîte) ; (iii) réservoir en verre écrasant la candidate (b) ; (iv) différentiel et garde-boue trop clairs vus de dessous. Corrigé.
2. **p2** (2, la vraie route de `col.js`) — (a) et (b) en grand : sur (a) `POSE0`, la face arrière de la remorque est coupée au bord droit et l'on voit, petite au centre, sa face AVANT à travers elle : des boîtes emboîtées, pas un camion de dos.
3. **p3** (8) — de dos au centre (a2) : enfin un poids lourd qu'on reconnaît (feux stop, tambours rouges des deux côtés, la cabine et toi au loin à travers la remorque) ; trois-quarts arrière : la face arrière encore coupée ; `heat` 0,2 : tambours sombres, aucune braise ✓ ; pédale 0,6 / 1 / 0 ✓ (le patin descend, le pied plane à 0) ; mains `steer` 0 / 0,5 ✓. Défauts corrigés ensuite : jambe trop brillante (verre 1,8 → 1,35), bande blanche du tableau de bord (verre intérieur atténué), tête pleine en disque beige (passée en verre), jante sombre (éclaircie).
4. **p4** (8) — a2 à 42 cm : l'image ; profil droit + travel(110) ✓ (silhouette nette, tambours rouges) ; entrée dans le lit, fosse de haut, haut du col de face ✓ pour le camion (le lit est encore le bouchon blanc de `model.js`) ; pédale et mains ✓.
5. **p5** (4) — a2 avec l'en-tête : « 72 km/h · PÉDALE 60 % » posés sur le haut de la remorque, le reste libre ; a2 à `heat` 1 : plus vif, sans baver ; gros plan du tambour-héros : illisible (le bouchon de `model.js` couvre tout) ; le camion arrêté dans le lit vu d'en haut ✓ (dans l'axe, bas).

## Poses qui cadrent (prêtes à coller dans `world.js`)
- **Image 0, candidate (a) « les tambours » — ma proposition** (a2, vérifiée avec l'en-tête : feux à 844 px, route à 1 130 px, sous-titres libres, camion ≈ 75 % de la largeur) :
  `const LENS0 = { fov: 46, shift: 110, side: 0, roll: 0, drift: 0, dof: 0 };`
  `export const POSE0 = frame(road(0, 42, 2250), road(0, 160, 600), LENS0);` → `{ tx: 0, ty: 208, tz: 600, d: 1650, az: 0, el: 0.5 }`
  Les six points : événement ✓ (tambours rouges, braises, feux stop, peinture qui défile) · perspective basse ✓ (42 cm) · menace derrière ~ (la descente à travers la remorque) · forme reconnue de dos ✓ (75 %) · système ✗ (la voie est derrière le camion dans cet axe : à voir sur la vraie voie) · bouge dès l'image 1 ✓ (braises, marques des roues, route).
- Profil, du côté DROIT (vérifiée, camion petit à 40 m) : `side: frame(road(2600, 140, 3600), road(0, 190, 500), { ...P, fov: 34, shift: 110 })` → `{ tx: 0, ty: 230, tz: 500, d: 4051, az: 40, el: 2.8 }` (+ travel(s)).
- Entrée dans le lit (vérifiée, s 253) : `entry: frame(road(-640, 70, 420), road(HX, 50, -100), { ...P, fov: 36, shift: 140 })` → `{ tx: -102.5, ty: 42, tz: -100, d: 750, az: -45.9, el: 4.7 }`.
- Tout le camion dans le lit, de haut à gauche (vérifiée sur le bouchon du lit) : `bedWide: frame(road(-2400, 2300, 2000), road(100, 120, 600), { ...P, fov: 34, shift: 110 })` → `{ tx: 100, ty: 168, tz: 600, d: 3669, az: -60.8, el: 38.7 }`.
- Haut du col, de face à droite (vérifiée) : `colTop: frame(road(1800, 600, -4500), road(0, 250, 600), { ...P, fov: 34, shift: 110 })` → `{ tx: 0, ty: 298, tz: 600, d: 5409, az: 160.6, el: -0.6 }`. **De face, les feux stop ne se voient pas** : pour « feux stop allumés », de dos et de haut (NON vérifiée à l'image, calculée : feux à 1 130 px, toit de la cabine à 613, la route au-delà vers 455) : `colTop: frame(road(-200, 900, 4200), road(0, 120, 300), { ...P, fov: 34, shift: 110 })` → `{ tx: 0, ty: 144, tz: 300, d: 4055, az: -2.9, el: 15.6 }`.
- `VIEW.pedal`, `VIEW.hands`, `VIEW.wheel`, `VIEW.top` : bonnes telles quelles.

## Pas encore au niveau (dit franchement)
- **Gros plan du tambour-héros** (`VIEW.drum`) jamais vu avec mes braises et mon halo : le bouchon de `model.js` couvrait l'image. Si mon halo ou mes braises doublent la lueur de `model.js`, enlever l'indice 0 (`DRUMS_T[0]`, le tambour avant gauche) des boucles `halosT` / `embersT` dans `update`.
- **Les plans dans le lit** (`entry`, `bedWide`, `top`) jugés sur le bouchon blanc du lit : l'enfoncement et l'assiette sont justes au calcul, l'image reste à juger sur la vraie voie.
- **`VIEW.hands`** : vue de l'avant-gauche, la jante est dans l'ombre de la clé (elle vient de derrière à gauche) et tire sur le rouge sous `mood` 1 ; les « vraies » mains de `figure.js` font un peu bloc de si près.
- **`VIEW.pedal`** : la jambe de verre reste grande dans le cadre (elle est derrière le patin : le `dof` des gros plans la fondra) ; le dessous du tableau de bord fait une bande pâle tout en haut, dans la zone de l'en-tête.
- **Les braises** se lisent (petites traînées rouges sous les roues) mais ne « foncent » pas vers la caméra sur a2 : c'est le halo et la peau des tambours qui portent la chaleur.

## À changer ailleurs
1. **`world.js`, `VIEW` — trois poses ont la caméra dans la montagne** (`MOUNTAIN` : pied à x −700, 0,75 cm de roche par cm vers −x) : `side` (x −2600 à 1,4 m du sol : 14 m de roche au-dessus), `bedWide` (x −2400 à 9 m : 12,75 m), `colTop` (x −1800 à 6 m : 8,25 m). Lignes de remplacement ci-dessus (`side` à droite, `bedWide` relevée au-dessus de la pente, `colTop` à droite ou de dos). `entry` pose sa caméra au pied exact de la montagne (x −700) : `road(-640, 70, 420)`.
2. **`world.js`, `POSE0`** (si la planche des quatre retient (a)) : les deux lignes de « Image 0 » ci-dessus.
3. **`plan.js`, `YOU`** (facultatif) : la pédale à x −72 est 18 cm à gauche de ta hanche droite (le pied croise un peu) ; `export const YOU = { seat: [-60, 185, -50], wheel: [-60, 235, -95], pedal: [-54, 140, -118] };` — mon fichier suit `YOU.pedal` et `YOU.wheel` (le siège, je le déduis du volant : 60 cm au-dessus du plancher, 45 cm derrière le centre du volant), `VIEW.pedal` aussi.
4. **`camion.js` recopie `SLOWMO = 2.5`** de `world.js` (il ne peut pas l'importer : `world.js` importe `camion.js`) pour étaler marques et braises : si le ralenti change, changer les deux.
5. `A` gagne `head` (ta tête) en plus des ancres du bouchon.

## État du build à la fin (12 h 48)
- `npm run check -- 027` **passait** avec ce `camion.js` à 12 h 43 (0 erreur, 65/65 contrastes) ; il échoue depuis la réécriture de `model.js` (12 h 43 min 53 s) : `mergeGeometries(parts)` dans `makeWheel` (`model.js` l. 644) mêle des pièces avec et sans `uv` → géométrie nulle → « Cannot read properties of null (reading 'morphAttributes') ». Pas dans mon fichier.
- `camion.js` seul, empaqueté (esbuild) et exécuté sous node sur cinq états (s 0, 240, 253, 292, −150) : 304 objets, aucune erreur de console, aucune position non finie, toutes les ancres (`hubFL hands pedal head foot seat cab lamps kingpin tail rearDrum driveDrum`).

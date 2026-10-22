# 026 · `src/model.js` — journal

2026-10-21, nuit. Le système plein : la coiffe et son nez, les quatre petits moteurs, la tour, les deux modules, l'équipage, le pupitre et sa lampe, les capteurs, la section de verre de l'établi. `npm run check -- 026` passe (les avertissements de shader X4008 / X3577 sont les mêmes sur le 025 : pas les miens).

## Lu

`docs/recette-agents.md`, `CLAUDE.md` (« Notre patte », « Pour que ça ne fasse jamais amateur », « Net et fluide »), `docs/026-decors.md` (haut + ma section), `plan.js`, `world.js`, le bouchon, `docs/026-actes.md` (haut + lignes qui me concernent), « À ne pas dire » des faits, `kit/lib/build3d.js`, `atmo.js`, `figure.js`, l'idiome de `007/src/model.js` (flamme, occupant) et `025/src/model.js` (lampes `lit…`, fils et impulsions, boule de lumière).

## Ce qui est construit

- **La coiffe** : deux demi-coquilles (profil de paroi de 4 cm tourné sur un demi-tour + les deux faces de coupe sur le plan x = 0 : la fente se lit en deux traits), les quatre grilles repliées (plaques à 21 alvéoles). **Le nez** en deux moitiés aussi (épaule courte et raide, ogive, col, bride et bossage au sommet : la place vide de la tour). Chaque pièce a son plein et sa copie de verre (`asShell` ordre 26) ; `skin` fond l'un dans l'autre, les arêtes restent à 50 %.
- **Les quatre moteurs** (le héros, le gris le plus clair, vernis) : corps, bague, tuyère, chemise graphite, disque de col ; dessinés **1,3 fois** la taille de `plan.js` (illustratif : sur la tête vue entière, à 1,0 c'étaient des dés blancs) et donc centrés 15 cm plus haut (`MOTOR_Y` 630) pour que les tuyères dégagent l'épaule. `litMotors` : la lueur veille au fond de chaque col, l'un après l'autre dans l'ordre de `MOTORS.az`, et leurs arêtes qui verdissent. `fire` : par moteur un panache veille (8,6 m, qui s'élargit et refroidit) avec un cœur blanc de 2,7 m dedans, une boule de lumière à la bouche, une lumière ponctuelle qui verdit la coiffe dessous ; respiration lente, aucun clignotement.
- **La tour** (verre ink, ordre 28) : collerette et six petites tuyères, fût, section haute, pointe ; treillis et deux bagues en traits. En vol : six petits jets ink, une traînée fine (40 m au plus, qui s'éteint vers le nez), au-delà de ~60 m un point pâle (ciel seulement). Sur l'établi elle disparaît au-delà de 60 m.
- **Le module orbital** (œuf à taille courte, deux cerclages, sonde d'amarrage). **Le module de descente** : bouclier plein (le plus sombre), paroi de verre en cloche convexe (ordre 20), quatre cerclages fins, trappe et tunnel.
- **Trois couchettes** (profil Kazbek extrudé, appui-tête rétréci, repose-jambes, deux bras, deux amortisseurs). **Toi et ton équipier** : `makeFigure` en verre de la tête aux mains (`ghost`), couchés, cuisses vers le haut, tibias à plat vers +z, mains posées sur le ventre ; l'équipier dessiné d'abord (ordre 10) : on le voit à travers toi (12).
- **Le pupitre** : sa face regarde vos visages ; touches à peine marquées ; la lampe **АВАРИЯ** dessinée trait par trait sur un canevas (aucune police : les fontes du dépôt sont latines) — éteinte, verre sombre ; allumée, rectangle signal et lettres chauffées à blanc. Deux bras jusqu'à la trappe.
- **Les capteurs** (groupe à part) : deux boîtiers clairs (1,35 fois `SENSORS.size`), un anneau de gyroscope et une lampe sur leur face, un fil (gaine qui ne descend jamais sous 2 px) qui monte la peau jusqu'à un connecteur à y −46, des têtes de lumière veille lentes qui montent (`sense`), une boule veille sur la lampe. Sur l'établi, avec `explode`, ils sortent de 42 cm (un fil court les relie à leur prise).
- **La section de verre de l'établi** (verre de `launcher.js`, ordre 30) : jupe, module de service (tuyère, deux panneaux repliés), troisième étage, moteur du troisième étage, treillis en zigzag, haut du bloc central coupé à −1290 ; bagues en traits.

## Les nombres de l'état, chez moi

`bench` la section de verre (et la tour cachée au-delà de 60 m) · `skin` 1 plein → 0 verre (le plein disparaît sous 0,25, le verre est entier sous 0) · `explode` le nez et ses moteurs +200, le module orbital +85, les coquilles ±260 en x tournées de 34° vers l'avant, les capteurs sortent · `shed` chaque moitié (cylindre + moitié de nez + ses deux moteurs + ses grilles) bascule autour de son pied, s'écarte, tombe, s'efface entre 0,72 et 0,98 · `free` coiffe, nez, moteurs et module orbital montent de 30 m et s'effacent après 0,5 · `tower` mètres le long de `TOWER.away` depuis la bride · `fire` jets, cœurs, boules, lumières · `litMotors` 0 → 4 · `avaria` la lampe · `press` vous deux 3,5 cm plus bas, la tête un peu en arrière, les couchettes tassées de 2 % · `sense` lampes, boules, impulsions · `litSensors` boîtiers et leurs arêtes · `litShip` arêtes des deux modules et bord de la cloche · `litMate` (×0,7), `litYou` le verre du personnage passe au veille.

## Poses vues sur les planches (prêtes à coller dans `VIEW`)

- `head` : telle quelle — `{ ...P, tx: 0, ty: 560, tz: 0, d: 2300, az: -38, el: 10, fov: 32, shift: 120 }` (allumé et `fire` 1 : les deux au niveau).
- `inside` (de profil : vous deux, genoux levés, le pupitre au-dessus) : `{ ...P, ...CLOSE, tx: -24, ty: 100, tz: -8, d: 420, az: -72, el: 20, fov: 32, shift: 60 }` (`skin` 0).
- `console` : `{ ...P, ...CLOSE, tx: -40, ty: 164.5, tz: -31.1, d: 115, az: -170, el: -32, fov: 32, shift: 0 }` — АВАРИЯ se lit en grand.
- `nozzle` (lueur au fond du col, sans tir) : `{ ...P, ...CLOSE, tx: -109.5, ty: 586.8, tz: 109.5, d: 420, az: -40, el: -14, fov: 32, shift: 120 }` (la bouche réelle du moteur az −45 ; vu sur l'ancien corps).
- `towerUp` : telle quelle (`tower` 12 : la tour de verre, ses jets, sa traînée, la tête en bas et ses quatre lueurs).
- `exploded` (tout, sous l'en-tête) : `{ ...P, tx: 0, ty: 480, tz: 0, d: 4300, az: -30, el: 16, fov: 32, shift: 120 }`.
- `motorsBench` : `{ ...P, ...CLOSE, tx: 0, ty: 830, tz: 0, d: 1300, az: -40, el: 18, fov: 30, shift: 60 }` (vu à d 1100 : serré).
- `shipBench` (de dessus : toi, ton équipier, le siège vide, le pupitre) : `{ ...P, ...CLOSE, tx: -24, ty: 100, tz: -10, d: 700, az: -30, el: 48, fov: 30, shift: 40 }`.
- `sensorsBench` (le capteur A, son fil qui monte) : `{ ...P, ...CLOSE, tx: -88, ty: -395, tz: 126, d: 800, az: -40, el: 6, fov: 30, shift: 160 }` (avec `explode` 1 ; à 0 le boîtier est 40 cm plus près de l'axe).
- `column` (nouvelle : « qui la sentent tourner », `tilt` 7, les deux capteurs en points veille) : `{ ...P, tx: 0, ty: -250, tz: 0, d: 6400, az: -20, el: 4, fov: 30, shift: -40 }` (vue à `shift` 20 : le nez touchait l'en-tête).
- `whole` (la fenêtre : la tour qui part, la coiffe qui tombe) : `{ ...P, tx: 0, ty: 500, tz: 0, d: 3600, az: -30, el: 12, fov: 30, shift: 100 }`.
- couverture (`eclate$`) : pose `{ tx: 0, ty: 480, tz: 0, d: 5600, az: -30, el: 30, fov: 32, shift: -470 }`, état `{ set: 0, explode: 1, litMotors: 4, litYou: 1, sense: 1, litSensors: 0.6 }` — l'éclaté entier sous y ≈ 1130 ; les capteurs sont hors cadre à cette échelle.

## Pas encore au niveau (dit franchement)

- **Un jet en gros plan** : depuis `VIEW.nozzle` (ou az −78), le panache vient vers l'objectif et fait un voile vert. Pour « tirent », prendre `head` (vérifié). Pose non vérifiée pour un jet de profil : `{ ...P, ...CLOSE, tx: -149, ty: 481, tz: 149, d: 700, az: -45, el: 26, fov: 32, shift: -150 }`.
- `VIEW.torn` (architecte) met la tête sous l'en-tête à d 9000 : à resserrer par l'acte 3 (non vérifié avec mes moteurs).
- Dans l'éclaté d'ensemble, l'équipage est minuscule : c'est `shipBench` qui le montre.
- Non regardés : `skin` entre 0,25 et 0,75 (le plein devient transparent), `free`, `avaria` 0 (lampe éteinte), `press` 1, le point de la tour au loin.

## À changer ailleurs

- `world.js` → `VIEW` : remplacer `inside`, `console`, `nozzle`, `exploded`, `motorsBench`, `shipBench`, `sensorsBench`, `whole` par les lignes ci-dessus, et ajouter `column`. (`VIEW.console` actuel regarde le dos du pupitre.)
- `plan.js` (pour que le contrat dise ce qui est dessiné ; rien ne casse sans) : `CONSOLE = { at: [-24, 164, -22], w: 80, h: 36, tilt: 52, lamp: [-40, 164.5, -31.1] }` · `YOU = { x: -56, head: [-56, 77, -52.5], … }`, `MATE.head: [4, 77, -52.5]` · `FINS.az: [45, 135, -135, -45]` · `MOTORS.y: 630` (centres réels des moteurs, dessinés 1,3 fois `len`/`body`/`exit`).
- `docs/026-actes.md`, ligne « on l'ouvre » : `explode` → le nez monte de 200 (et non 260), le module orbital de 85.

## Planches (30 images lues sur 30)

1. Ciel, 8 images : АВАРИЯ parfait ; corps des moteurs creux (profil de révolution tourné de haut en bas : faces retournées) ; coiffe trop sombre sur le ciel noir ; jets en faisceaux de lampe ; cerclages et sièges trop clairs.
2. Corrections + établi, 8 images : moteurs pleins et clairs, cœur blanc dans les jets, intérieur de profil lisible ; éclaté sous l'en-tête, coquilles peu ouvertes, capteurs hors cadre.
3. Établi, 8 images : éclaté dans un cadre, capteur A lisible (anneau, lampe, impulsions), colonne qui tourne, tour qui part, coiffe qui tombe ; `litShip` allumait toute la cloche ; couverture coupée en bas.
4. Dernière, 6 images : tête allumée et quatre jets au niveau (moteurs ×1,3), `shipBench` de dessus, couverture, colonne ; le gros plan du jet reste un voile.

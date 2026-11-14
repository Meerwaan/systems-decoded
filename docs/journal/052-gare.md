# 052 · gare.js — journal du décor

2026-11-14. La gare aux rayons X, contre le bouchon et l'API de l'architecte (`docs/052-decors.md` § gare.js). API gardée : `buildStation() → { group, A, update(P, time, px) }`, mêmes ancres, mêmes nombres lus (+ `vrope` facultatif).

## Construit (premier jet)
- Enveloppe de verre (`glass` + `asShell` ordre 20) : toit à deux pans, 7 travées de piliers, mur du fond derrière la poulie, linteau de la bouche, sablières ; arêtes ink 1,8 px à 0,38. Demi-largeur portée à `GARAGE.z + 150` (= 710) pour que la voie de garage soit dedans.
- Ossature de verre (ordre 10) : poteaux des poutres à pneus jusqu'au toit, poutre porteuse de la came.
- Quai en grille (shader) : traits au mètre (s'effacent quand le siège file vite) et tous les 5 m, flaques de lumière sous 7 réglettes de plafond (glow ink 1,6, sur un boîtier sombre). Pas de sol plein.
- Câble plein (acier 0x3a3f45, metal 0,4) de s 0 à `PATH.END`, torons en hélice ink 0,35 dans le shader (`aSA` = abscisse, tour) ; phase (s − rope)/lay + tour : même idiome que ligne.js. Les torons fondent en ton moyen sous 4 px par pas (`fwidth`) ou au-delà d'un tiers de pas par image (`uMove`, vitesse lue entre deux appels ou `P.vrope`).
- Poulie Ø 5,2 m : jante usinée claire (gorge à son bord bas, le câble dedans), 8 rayons, moyeu, chapeau, arbre jusqu'au toit, un repère sur la jante. Tourne de `rope / r` (sens vérifié : le câble va de l'arrivée vers le départ par l'arrière).
- Came : une poutre balayée le long du chemin (`sweepBox`), rampes de 120 cm aux deux bouts, entretoises toutes les 2,4 m vers la poutre de verre.
- Pneus : 3 `InstancedMesh` (pneu noir, jante claire + fusée, un ergot sombre — une seule marque, pour que la rotation se lise sans repliement jusqu'à 48°/image). Angle = `speedAt(s) · rope / r`. Poutre porte-fusées côté intérieur, qui continue jusqu'à l'aiguillage.
- Voie de garage : poutre qui s'écarte (`pathAt(…, iso 1)`), quatre pneus fixes, lame d'aiguillage qui pivote avec `iso`, butoir.
- Pesage : tronçon de came clair (10 segments) posé sur le galet fermé (y 18 du repère pince), deux pesons, une traverse ; il se soulève de 1,3 cm sous le galet du héros (`weigh`). Jauge : boîtier, fente sombre, bande signal jusqu'à `WEIGH.ok`, partie haute = rail vide au trait ink (jamais vert), repère ink à `force`. Fil des pesons à la jauge.
- Flèches : câble (ink 1,3, 110 cm × `arrows`) et siège (veille 1,5, × `vchair`), même queue derrière la pince, au-dessus du câble (+34 et +58 cm).

## Planches
1. `p1` (8 images) : poulie, pneus, flèches, jauge se lisent. Défauts : came allumée trop forte (dalle verte) → 0,22 ; jauge sur poteau au sol en plein sur le passage du siège vers la garage (z 470) → suspendue au toit, `[1240, 450, 430]` ; `wide` (d 3800, az −35) : la gare ne tient pas en largeur, les pleins illisibles → autre pose à chercher ; le coin blanc qui traverse plusieurs vues est le sol de verre de `ligne.js` (bouchon), pas la gare.

2. `p2` (8, avec en-tête) : came encore trop verte → 0,12 (pesage 0,14) ; poteaux de l'ossature trop serrés (vue large encombrée) → un tous les 6,4 m ; jauge suspendue trop haute pour `weigh` → y 425 ; `garage` à reprendre d'en haut.
3. `p3` (8) : jauge dans le rouge, repère ink, lisible à 270 px ; flèches lisibles (la blanche longue, la verte courte au-dessus) ; voie de garage qui s'écarte, lisible d'en haut ; poulie pleine page ; poutre porte-pneus trop noire (sombre sur sombre en contre-plongée) → 0x464d54.
4. `p4` (4) : vue large d'arrière, la came sous la pince (le galet sous la poutre), la rangée de pneus de l'extérieur. Check `npm run check -- 052` : passe.

Images lues : 28 / 30.

## Poses qui cadrent (avec en-tête ; à coller dans `VIEW`, `P` = `{ fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 }`)
- `wheel` : `{ ...P, tx: -900, ty: 330, tz: 0, d: 1300, az: -62, el: 34, fov: 34, shift: 40 }` (la poulie en grand, les pneus du demi-tour dessous).
- `tyres` : `{ ...P, tx: 500, ty: 265, tz: 260, d: 700, az: -28, el: 6, fov: 32, shift: 40 }` ; allumés : `litTyres` 1 (jantes vertes).
- `principle` : `{ ...P, tx: 500, ty: 340, tz: 260, d: 520, az: -18, el: 10, fov: 30, shift: 40 }`, siège à `AT.launch + 500`.
- `came` : `{ ...P, ...CLOSE, tx: -520, ty: 330, tz: 280, d: 190, az: -50, el: 10, shift: 40 }` (le galet sous la came, la pince entière).
- `weigh` : `{ ...P, tx: 1230, ty: 380, tz: 360, d: 640, az: -30, el: 4, fov: 30, shift: 40 }` (la jauge suspendue à droite, le tronçon pesé et la pince à gauche).
- `run` : `{ ...P, tx: 1050, ty: 260, tz: 260, d: 360, az: -70, el: 4, fov: 34, shift: 40 }`.
- `wide` : `{ ...P, tx: -100, ty: 250, tz: 0, d: 4600, az: -100, el: 50, fov: 34, shift: 60 }` (de derrière la poulie, toute la gare en long ; l'ancienne az −35 ne tenait pas en largeur).
- `garage` : `{ ...P, tx: 1280, ty: 260, tz: 420, d: 1000, az: -15, el: 42, fov: 32, shift: 60 }` (la voie qui s'écarte vue d'en haut).
- `POSE0` : la candidate « contre-plongée » se lit mieux plus près et plus haute : `{ tx: 1300, ty: 330, tz: -275, d: 650, az: -60, el: -12, fov: 44, shift: 60, side: 0, roll: 0, drift: 0, dof: 0 }` (le câble torsadé en diagonale, la pince et la came, la bouche derrière) — à juger sur la planche des quatre avec le vrai siège.

## Pas encore au niveau
- Vue large : la gare se lit (poulie, ossature, sièges), mais câble et came y sont fins ; c'est le verre et la poulie qui la portent.
- Les torons à 5 m/s : ils fondent en ton moyen (sinon ils sauteraient d'une demi-période par image) ; le défilement se lit alors par la poulie et les pneus. Pour le plan « le câble est immobile » (caméra qui suit la pince), la vitesse *à l'écran* est nulle : il faut passer `vrope: 0` (sinon le câble reste uni).
- Le coin blanc qui barre plusieurs vues est le sol de verre de `ligne.js` (bouchon).
- Teinte d'ensemble rouge sur les planches : `mood` 1 de `FIRST` (monde), pas la gare.

## À changer ailleurs
- `plan.js` : `export const WEIGH = { x0: 1130, x1: 1330, gauge: [1240, 425, 430], ok: 0.62 };` (la jauge pend du toit au-dessus du rail ; au sol, elle était sur la trajectoire du siège isolé). gare.js la relève d'office tant que ce n'est pas fait.
- `world.js`, dans `station.update({ … })` : ajouter `vrope: S.cableKmh * 100 / 3.6,` (vitesse du câble à l'écran pour les torons ; sans elle, gare.js la lit entre deux appels) — et pour le plan `still`, si la caméra suit la pince, `vrope: 0`.
- `world.js` `VIEW` : les poses ci-dessus (`wheel`, `tyres`, `principle`, `came`, `weigh`, `run`, `wide`, `garage`).
- `ligne.js` : même fonte des torons (`uMove` = vitesse / 30 / `CABLE.lay`, fondu entre 0,2 et 0,36 ; `fwidth` entre 0,12 et 0,25) pour que le câble ne change pas de grain à la bouche.

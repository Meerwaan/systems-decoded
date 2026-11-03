# L05 · systemes.js — journal

Agent décor, 2026-11-02. Fichier : `episodes/L05-hudson/src/systemes.js` (section « systemes.js » de `docs/L05-decors.md`).
Planches : `.cache/planches/L05/systemes/`.

## Fait

- Lu : recette-agents, regles-image, L05-decors (haut + ma section), bouchon, plan.js (A320), world.js (FIRST, AT, VIEW, apply), build3d, figure.js, faits § 4 et § 10.
- Plan de construction (cm, repère de l'avion) :
  - moteur : axe +x, lèvre à x 0 ; nacelle de verre en deux demi-capots (charnière en haut, s'ouvrent en ailes de mouette) ;
    pleins : lèvre, soufflante (36 aubes vrillées, cône), booster, HP (fenêtre d'écorché côté +z haut, φ −35° ± 60°),
    chambre (feu = tore signal vu par la fenêtre, 2 allumeurs veille), turbines, tuyère + cône ; boîtier + IDG dessous.
    Éclaté en rangée le long de x, IDG qui descend.
  - oie : corps tourné, cou, tête, ailes qui battent ; 0 → 0,5 elle arrive à la soufflante, 0,5 → 1 ses débris suivent la veine jusqu'à la chambre.
  - APU : générateur, boîtier, compresseur écorché (roue qui tourne), chambre, turbine, échappement (chaleur ink), point veille.
  - cockpit : sièges, deux pilotes de verre (makeFigure shell), mini-manches sur consoles, pylône (manettes, masters), tableau (6 écrans), auvent (alarme), plafonnier + bouton ditching (anneau ink), soute (7 calculateurs veille).
  - QRH : classeur, couverture + trois intercalaires qui tournent (`page`), carte d'amerrissage à part (page 4), barre `done`, ligne APU, trou signal.
  - banc : bâti, canon (hauteur selon `aimCore`), projectile, éclair, débris ; deux oiseaux comparés ; alignement de 4 places.

## Ce qui a raté, et pourquoi

- `addMesh` sur un simple `Group` (rotor de soufflante, roue d'APU, pivot du manche, canon) : il faut un `makePart` (sinon « reading 'mats' »).
- L'oie sombre sur le fond sombre : invisible. Elle est gris chaud clair, une pointe d'émissif signal (la menace) ; cou et tête sombres.
- Vue cockpit : les appuie-tête cachaient les têtes ; dossiers abaissés (y 117) et caméra entre les sièges, à hauteur d'épaule.
- Gros plans sur le moteur : sans `lock` 1, l'assiette de l'avion déplace le moteur de 50 cm (bras de levier 6,4 m) : tout gros plan moteur prend `lock` 1.
- Banc : le ferry et le radeau de world.js sont à l'échelle vraie : chaque place de l'alignement se met d'elle-même à ≈ 2,3 m (Box3, une fois).
- L'éclair du tir était caché par le cône : il est devant la soufflante, sans test de profondeur.

## Poses qui cadrent (prêtes à coller dans world.js · VIEW ; E = A320.engine, C = A320.cockpit)

Vérifiées sur planche (p2–p5) :
- `exploded: { ...P, tx: E.x + 310, ty: E.y - 25, tz: E.z, d: 1000, az: -24, el: 9, ...SHARP }` — `lock` 1, `explode` 1 : lèvre, soufflante, booster, HP, chambre, turbine, tuyère en rangée, l'IDG dessous.
- `hook4: { ...P, tx: E.x + 260, ty: E.y + 15, tz: E.z + 10, d: 420, az: 28, el: 14, fov: 40, ...SHARP }` — `lock` 1, `goose` 0,85 → 1, `burn` 1 : la nacelle de verre, l'écorché, le cœur signal. **C'est aussi `thumb2`** (le moteur ≈ 70 % de la hauteur) ; pour le premier plan, ajouter `side` à la main.
- `engine: { ...P, tx: E.x, ty: E.y + 20, tz: E.z, d: 700, az: -48, el: 8, ...CLOSE }` — `lock` 1, `goose` 0 → 0,5 : l'oie arrive dans l'entrée d'air (vue presque de face : elle se lit par ses ailes).
- `cockpit: { ...P, tx: C.windX + 10, ty: 50, tz: 0, d: 220, az: 90, el: 10, fov: 60, ...CLOSE }` — `lock` 1 : les deux têtes de verre, les bras, le tableau, l'auvent.
- `stick: { ...P, tx: C.floorX - 46, ty: C.floorY + 70, tz: C.seatZ + 42, d: 120, az: -30, el: 22, fov: 36, ...CLOSE }` — `lock` 1, `pf` 1, `stick` 0 → 1.
- `overhead: { ...P, tx: C.floorX - 19, ty: C.floorY + 204, tz: -11, d: 95, az: 75, el: -38, fov: 44, ...CLOSE }` — `lock` 1, `named` 9 : l'anneau ink autour du bouton éteint.
- `computers: { ...P, tx: A320.avionics.x, ty: A320.avionics.y + 25, tz: -10, d: 210, az: -20, el: 14, ...CLOSE }` — `lock` 1 : sept calculateurs, leurs voyants veille.
- `apu: { ...P, tx: A320.apu.x - 10, ty: A320.apu.y, tz: 0, d: 380, az: 55, el: 14, ...CLOSE }` — `lock` 1, `apu` 1.
- `profile` pour la limite : `{ ...P, tx: -900, ty: 100, tz: 0, d: 4200, az: 0, el: 2, ...SHARP }` — `limit` 1, `aoa` 0 → 1 (arc veille R 8 m devant le nez, butée à 17,5°, aiguille ink).
- `qrh: { ...P, tx: 0, ty: 0, tz: 1, d: 62, az: -15, el: 55, ...CLOSE }` — `page` 1 / 3 / 3,6, `done` 0,33, `apuMark` 1, `gap` 1, `named` 10–12.
- `stand: { ...P, tx: -100, ty: 130, tz: 0, d: 1000, az: -50, el: 12, ...SHARP }` ; `gun: { ...P, tx: -160, ty: 150, tz: 0, d: 650, az: -62, el: 10, ...CLOSE }` — `gun` 0 → 1 (impact à 0,55), `aimCore` 0 / 1, `birdCmp` 1.
- `lineup: { ...P, tx: -30, ty: 60, tz: 0, d: 1100, az: -12, el: 12, ...SHARP }` — `listK` 0 → 4 (à d 950 l'APU sort à gauche).

Non vérifiées (aucune image) : `fan`, `core`, `idg`, `tail` (le point veille de l'APU a une taille mini de 7 px), la carte d'amerrissage seule (`page` 4), le QRH dans les mains du copilote en vol (`qrh` 1, `pf` 1), `masters`, `ign`.

## État lu (ce que chaque nombre fait ici)

explode (éclaté en place, capots en ailes de mouette, IDG −88) · named (1 soufflante, 2 booster+HP, 3 chambre, 4 turbine+tuyère, 5 IDG, 6 APU, 7 manche du commandant, 8 calculateurs, 9 anneau ink, 10–12 onglets) · n1L (rotation de la soufflante, flou d'obturateur ; arrêtée à l'éclaté ; aiguille N1 gauche de l'ECAM) · n1R (aiguille N1 droite) · burn (tore de feu vu par l'écorché, souffle de tuyère) · goose (0 → 0,5 l'oie arrive, 0,5 éclair à la soufflante, débris jusqu'à la chambre ; 1 chambre assombrie + lueur signal) · ign (deux étincelles veille, 1,4 Hz) · gen (bague veille de l'IDG ; `feed` l'avive) · apu (roue qui accélère, bague veille, point veille, chaleur ink) · law (voyants veille ; sous 0,3 vacillement signal 1,1 Hz) · stick (manche du commandant en butée, 16°) · limit / aoa (arc, aiguille) · pilots (fondu du verre) · pf (main sur le manche : 0 copilote, 1 commandant) · masters (les deux interrupteurs basculent) · ecam (alarmes signal sur l'ECAM haut) · alarm (master warning, pulsation 0,8 Hz) · qrh (classeur visible en vol, mains du copilote dessus quand `pf` 1) · page · done · apuMark · gap · gun · aimCore (hauteur du canon, trajectoire des débris) · birdCmp · listK.

## Images lues

30 / 30 (p1 : 8, p2 : 6, p3 : 8, p4 : 6, p5 : 2).

## À changer ailleurs

- `world.js · VIEW` : remplacer les poses `hook4`, `exploded`, `engine`, `cockpit`, `stick`, `overhead`, `computers`, `apu`, `qrh`, `stand`, `gun`, `lineup` par celles de « Poses qui cadrent » ci-dessus (lignes exactes).
- `world.js · VIEW.hook5` (par-dessus les épaules) : même pose que `cockpit` ci-dessus avec `...SHARP` (l'ancienne, `ty: 70, d: 380, el: 7`, met les appuie-tête devant les têtes).
- `docs/catalogue.md` (via `npm run catalogue`) : « **Les systèmes de l'A320** `L05/systemes.js` — CFM56-5B qui s'ouvre sur place (écorché, feu, oie dans le cœur), APU de queue, cockpit à deux pilotes de verre (mini-manches, pylône, plafonnier et bouton ditching, soute à calculateurs, limite d'incidence), QRH à onglets, banc à canon à oiseaux, alignement de quatre places. Entrée `buildSystemes()` ; chaque partie `{ group, A }`. »

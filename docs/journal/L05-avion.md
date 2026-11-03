# L05 · avion.js — journal

Agent décor, 2026-11-02. Fichier : `episodes/L05-hudson/src/avion.js` (section « ## avion.js » de `docs/L05-decors.md`).

## Lu
recette-agents, regles-image, L05-decors (haut + avion), plan.js (A320, DAY, PATH), world.js (FIRST, apply, VIEW),
L03/avion.js (spline, skin, foil, lifting, NOSES/TAILS, fanMat, windowMat, crowd, slide, buildPlane), 023 makeSpray.

## Construction (au fur et à mesure)
- Plan : A320 recopié du `buildPlane` du L03 (sections lissées `skin`, aile `lifting`, dérive, plan fixe, frames,
  portes) réglé en monocouloir Ø 3,95 m (HH 207), nez Airbus, cône de queue relevé jusqu'à l'échappement APU (y ≈ 35,
  pour que l'APU de systemes.js, y 30 Ø 70, tienne dans la coque).
- Premier jet écrit d'un bloc (≈ 1 300 l.) : coque, ailes + *wingtip fences*, dérive, plan fixe, nacelles CFM56 pleines,
  volets sur charnière + rails, train, portes L1/R1 (battant), packs (contour veille), radeaux (deux boudins, plancher,
  ligne veille), trappes d'aile, 150 assis (GPU, `brace` les plie autour de la hanche), 155 dehors (ailes + radeaux),
  oies (GPU, V → flux périodique, battement d'ailes, liseré signal), plumes, flammes (cœur + traîne qui coule),
  arrière enfoncé (peau signal déplacée + cadres tordus + lueur), gerbe (traînées, une fois), ouvertures `seal`,
  carte de sécurité (canvas : pictogrammes, aucun mot), courant `feed` (tirets veille worldUnits sur fil sombre), givre.
- Planche 1 : tout se construit. Les oies trop orangées en petit (liseré trop fort), rangées assises trop courtes,
  lueur arrière qui voile → corrigés. Planche 2 : radeaux lisibles d'emblée ; flamme née dans le cône de la tuyère
  (déplacée), V à 0,6 trop loin/trop large (1100 cm devant le nez, plus serré), plancher du radeau noir (normale),
  foule de l'aile en tas (étalée sur l'envergure), gerbe trop petite (portée ×1,6, 340 traînées), 24 oies dont 6 sous
  l'aile gauche (là où se cadre la première image).
- Planche 3 (avec la ville) : radeaux + gens dedans = la miniature `thumb3` ; foule de l'aile lisible, virant veille
  quand `saved` approche ; gerbe = une vraie gerbe ; carte lisible (pictogrammes). V à 0,6 encore trop loin → 600 cm,
  plus bas (y 30). Planche 4 : V en travers du pare-brise ✓, courant APU → cockpit lisible ✓, profil +6° lisible à
  405 px ✓, poses miniature ✓. Marques `seal` trop petites vues d'en dessous → double contour (bord + anneau à +46 cm),
  NON revérifié à l'image (30 images lues).
- `npm run check -- L05` : passe (0 erreur ; 13 avertissements de cartes de chapitre, pas ce fichier).

## Ce que fait chaque nombre ici
`shell` coque, ailes, cadres (contour gardé à 25 %) · `cabin` hublots · `pax` 150 assis + sièges de verre · `brace`
penchés (tronc et tête autour de la hanche, vers le nez) · `flaps` volets : charnière, recul 45 % de corde, −29° ·
`gearDown` train (à LaGuardia) · `nacL` / `nacR` nacelles pleines (> 0,5) · `n1L` / `n1R` (lus) vitesse des soufflantes
(pales visibles sous ≈ 20 %) · `geese` 0 rien · 0,3 un V à 400 m · 0,6 le V à 6 m du nez, en travers du pare-brise ·
→ 1 le flux périodique (4,5 s : 24 oies, 4 dans les entrées d'air à `fract(t/4,5 + i/24)` ≈ 0,978, 6 sous l'aile
gauche, les autres au-dessus du cockpit, des ailes, sous les moteurs) + plumes à la lèvre (≥ 0,85) · `flame` gauche
plein, droite 55 % (cœur + traîne qui coule, cœur qui respire lentement) · `packs` pack plié à L1/R1, contour veille ·
`doors` battants L1/R1 (sortie 14 cm puis 158° vers l'avant) · `rafts` déroulé (0–0,55) puis gonflé (0,15–1), tête au
seuil, sur l'eau (y −120) · `wingExits` trappes posées sur l'aile · `evac` 155 dehors (aile gauche 0 → 0,48, radeaux
0,22 → 1, aile droite 0,34 → 0,96 ; sortent accroupis de l'issue) · `saved` chacun vire veille puis part, dans son
ordre · `damage` peau arrière enfoncée (46 cm) signal + 5 cadres tordus + lueur sous la cabine arrière ·
`spray` 340 traînées, une fois (0 → 1 ; invisible à 1) · `seal` voir « À changer ailleurs » · `safety` siège, poche,
carte éclairée · `feed` tirets veille 150 cm/s : des deux moteurs (× `gen`) ou de l'APU (`apu` > 0,5) vers la soute
puis le cockpit · `cold` givre sur l'extrados. `sink` : rien ici (world.js). Buée de souffle : pas faite.

## Poses (prêtes à coller dans VIEW ; vérifiées sur planche sauf mention)
- hookA (candidate) : `{ ...P, tx: -700, ty: -250, tz: 575, d: 1600, az: -55, el: -10, fov: 44, side: 200, ...SHARP }`
  — devant-gauche, bas : l'avion en grand, le flux d'oies vers le moteur gauche, la flamme derrière. Oies encore
  petites à 405 px (≈ 10 px) : c'est le point faible de la première image.
- hookB (candidate) : `{ ...P, tx: -640, ty: -230, tz: 575, d: 1000, az: -72, el: -14, fov: 48, side: 120, ...SHARP }`
  — sous l'entrée d'air gauche, perspective forte.
- cockpit (geese 0,6, lock 1) : la pose de world.js tient.
- thumb (860 m) : `{ ...P, tx: -500, ty: -120, tz: 300, d: 2300, az: -40, el: -8, fov: 34, ...SHARP }`, état
  `n1L 35, n1R 15, flame 0.7, geese 1`.
- thumb3 (lock 1, à flot) : `{ ...P, tx: -1310, ty: -110, tz: 420, d: 900, az: -40, el: 14, fov: 36, ...SHARP }`, état
  `rafts 1, doors 1, evac 0.45, wingExits 1, track 1860`.
- wing : `{ ...P, tx: -500, ty: -100, tz: 500, d: 2800, az: 40, el: 26, ...SHARP }` (les deux radeaux avant dans le cadre).
- profile : `d: 5200` au lieu de 6500 (lisible à 405 px, avec `pitch` 6).
- splash (gerbe, track 1843) : `{ ...P, tx: 600, ty: -150, tz: 0, d: 4200, az: -25, el: 4, ...SHARP }`.
- water : vérifiée à d 6500 (avion petit) ; proposer `d: 4500, el: 4` (NON vérifiée).
- safety : `{ ...P, tx: A320.card[0], ty: A320.card[1] + 2, tz: A320.card[2], d: 95, az: 75, el: 18, ...CLOSE }`, **pax 0**
  (avec pax 1 la caméra est au milieu des silhouettes : illisible).
- cabin, doors, belly : les poses de world.js tiennent.

## À changer ailleurs
- `world.js` · FIRST, la ligne de `seal` :
  `seal: 0, //     the openings under the waterline: 0 nothing · 0 → 0.25 they are marked ink (open) · 0.45 → 0.85 their doors shut · 1 shut (the marks stay, faint)`
- `world.js` · VIEW (lignes exactes) :
  `hook2: { ...P, tx: -700, ty: -250, tz: 575, d: 1600, az: -55, el: -10, fov: 44, side: 200, ...SHARP }, // ahead-left, low: the geese streaming into the left engine, its flame behind`
  `hook7: { ...P, tx: -640, ty: -230, tz: 575, d: 1000, az: -72, el: -14, fov: 48, side: 120, ...SHARP }, // under the left intake, looking up`
  `profile: { ...P, tx: 0, ty: 0, tz: 0, d: 5200, az: 0, el: 2, ...SHARP },`
  `wing: { ...P, tx: -500, ty: -100, tz: 500, d: 2800, az: 40, el: 26, ...SHARP }, // the overwing exits, the people on both wings, the two front rafts`
  `water: { ...P, tx: -300, ty: -120, tz: 0, d: 4500, az: -35, el: 4, ...SHARP },`
  `splash: { ...P, tx: 600, ty: -150, tz: 0, d: 4200, az: -25, el: 4, ...SHARP }, // the touchdown's spray (track 1843)`
  `safety: { ...P, tx: A320.card[0], ty: A320.card[1] + 2, tz: A320.card[2], d: 95, az: 75, el: 18, ...CLOSE }, // pax 0`
  `thumb: { ...P, tx: -500, ty: -120, tz: 300, d: 2300, az: -40, el: -8, fov: 34, ...SHARP },`
  `thumb3: { ...P, tx: -1310, ty: -110, tz: 420, d: 900, az: -40, el: 14, fov: 36, ...SHARP }, // lock 1`
- `world.js` · `apply()` : `const ctx = { t: track, … }` est alloué à chaque appel (16 par image) ; le sortir en objet
  réutilisé (`CTX.t = track; …`).
- FIRST, commentaire de `geese` : le flux à 1 a une période de 4,5 s (un passage de l'oie dans chaque entrée d'air
  par période ; elles entrent à `fract(t / 4.5 + i / 24) ≈ 0.978`, i = 0…3).

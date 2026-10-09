# 015 — `rafale.js` (l'avion) — journal

Propriétaire : `episodes/015-brin-arret/src/rafale.js` (941 lignes). Budget : 30 images lues — **30 lues** (8 + 8 + 8 + 5 + 1).
Planches et essais : dossier temporaire `scratchpad/015/rafale-*`. Un contrôle sans image, `rafale-check.mjs` (le fichier
empaqueté pour node : où sont les ancres pour sept états), a servi avant chaque planche.

## Décisions

- **`buildJet()` du 007 ne se prend pas tel quel** : biplace (verrière en deux moitiés, deux places), sa piste et son ciel
  dans le même groupe, son train en verre. Sa façon de construire la cellule est reprise ici (sections, `skin`,
  `aerofoil`, `patch`) avec une cellule **monoplace** : pare-brise 612 → arceau 540 → fin de verrière 352, puis l'arête
  dorsale, sans seconde bosse. `jet.js` n'est pas touché.
- **Repère de construction** : celui du 007 (nez +z, aile GAUCHE +x, roues principales en z = 0, y = 0), dans un groupe
  retourné d'un demi-tour : sur le pont le nez est vers −z, la gauche de l'avion est bâbord (−x).
- **La crosse est à sa vraie place** : articulée sous la quille entre les moteurs (2,75 m devant la sortie des tuyères),
  2,11 m ; relevée, son sabot arrive entre les tuyères (64 cm avant leur sortie). Conséquence : le bout de la crosse
  baissée est à **5,56 m** derrière les roues principales, pas 4,30 m (`RAFALE.wheels`). `hookAt` est respecté ; ce sont
  les autres nombres de `RAFALE` qui changent (voir « À changer ailleurs »).
- **La crosse pend plus bas que les roues** (vrai : c'est ce qui lui fait prendre le brin). En l'air elle descend
  jusqu'à sa butée (47° sous l'axe de l'avion) ou jusqu'au pont. Son bout est en z **toujours** à `hookAt` ; en y à
  `hookAt` dès que les roues sont posées **ou** que `held` vaut 1. À la première image (alt 0,5, nez 8°) le sabot
  touche déjà le pont : `scrape` peut être vrai dès 0 s.
- **`held`** : géométriquement, une crosse rigide dont le bout est tenu à `hookAt` ne peut pas « se tendre » davantage.
  `held` fait deux choses : il tient le bout à `hookAt` quelle que soit l'altitude, et il allume un point veille dans la
  gorge du sabot (là où est le brin). C'est `nose` (négatif) et `squat` qui montrent l'avion retenu.

## Ce qui est construit

- Cellule de verre (une coque `asShell` à 20) : fuselage, deux nacelles, delta, canards, dérive, missiles de bout
  d'aile ; lignes de structure et contour ; verrière courte sur deux arceaux pleins (pas de longerons : une barre en
  travers de tout plan pris à leur hauteur).
- Pleins : trois jambes (fût fixe, piston clair qui rentre, compas qui se ferme avec `squat`), roues (pneu gris sombre,
  jante claire, deux anneaux), barre de catapultage relevée sur la jambe avant ; deux tuyères (anneau sombre, cœur à
  mi-profondeur, traîne de chaleur) ; la crosse (bras clair, sabot à gorge, amortisseur) ; dans le cockpit : plancher,
  planche de bord et trois écrans, deux banquettes, siège, manche à droite, et sur la banquette gauche deux rails, la
  butée « plein gaz » (signal) et la manette.
- Toi : `makeFigure({ hands: "real", shell: true, order: 10 })`, assis, incliné de 27°, casque plein (clair, visière
  sombre, masque), main gauche pleine fermée sur la manette (`fig.hold`), main droite en verre sur le manche.
- Sur le pont (repère du navire, ne tangue pas) : fumée des pneus (6 bouffées en dégradé par roue, périodiques),
  étincelles du sabot (96 traînées lentes) et leur braise, une flaque de lumière encre sous le train et la crosse, une
  tache d'ombre sous chaque roue qui se resserre quand elle descend.

## Ce qui a raté, et pourquoi

- Planche 1 : les deux premières images vides — `FIRST.pos` était passé de −27 à −9 entre ma lecture et la planche.
  Relire `world.js` avant chaque planche quand trois agents écrivent en même temps.
- Longerons de verrière : une barre grise en travers du plan de cockpit. Retirés.
- Cœur des tuyères : d'abord blanc-rose et baveux de près (2,1 × encre mêlée à 38 %), puis saumon et plat ; réglé à
  signal mêlé de 16 % d'encre × 2,1, bord franc à 55 % du rayon.
- Bras de crosse brûlé (0xd4d8da sous la clé) : matière propre, 0xaeb5ba.
- Sabot : un hexagone de clé plate ; redessiné (semelle ronde, bec, gorge, col autour du bras).
- Braise du sabot : une ellipse de 30 × 48 cm, un voile ; ramenée à 16 × 26.
- Visière vernie : deux points de la lumière signal y faisaient deux yeux rouges ; rendue mate (non revue).
- Vu de 16° hors de l'axe (l'avion qui repart, vu du pont) la lèvre cachait la moitié du cœur, posé au fond de la
  tuyère : avancé à mi-profondeur (**non revu en image**, le budget était épuisé).

## Les poses (état entre parenthèses ; `tz` suit l'avion : −100 × pos)

1. **POSE0** (FIRST : pos −9, alt 0,5, nez 8) :
   `{ tx: -122, ty: 60, tz: 448, d: 1100, az: -135, el: 0, fov: 54, shift: -40, side: 0, roll: 0, drift: 0 }`
   — le choc : même pose, `alt: 0, squat: 1, puff: 1`. Vue avec l'en-tête : le sujet tient entre y ≈ 455 et 1120.
2. Manette (pos 0, alt 0, nez 0) : `{ tx: -36, ty: 232, tz: -1066, d: 190, az: -125, el: 36, fov: 30, shift: 100 }`
   (`tz = −100·pos − 1066`) ; toi entier et la main : `{ tx: -22, ty: 258, tz: -1045, d: 340, az: -125, el: 38, fov: 30, shift: 110 }`.
3. Tuyères (pos 0) : `{ tx: 0, ty: 185, tz: 110, d: 760, az: -20, el: 12, fov: 30, shift: 140 }` (`tz = −100·pos + 110`).
4. Crosse de près (pos −6, nez 2, scrape 1) : `{ tx: 0, ty: 30, tz: 625, d: 400, az: -76, el: 4, fov: 30, shift: 100 }` (`tz = −100·pos + 25`).
5. De l'arrière et d'en haut (pos 40, held 1, nez −1, squat 0,5) : `{ tx: 0, ty: 120, tz: -3900, d: 2300, az: -16, el: 17, fov: 34, shift: 200 }`
   (`tz = −100·pos + 100`). `VIEW.chase` tel quel (d 12000) : l'avion fait ≈ 150 px de large, la crosse ne s'y lit pas.
6. Il repart (pos 130, alt 12, nez 12, gas 1 ; lumière `fy: 1350, fz: -13500`) :
   `{ tx: 0, ty: 1350, tz: -13500, d: 2524, az: -7.8, el: -28.4, fov: 36, shift: 160 }` (vu à `shift` 200 : les tuyères touchaient l'en-tête).
7. Profil (pos −6, alt 0, nez 0) : `{ tx: 0, ty: 230, tz: -40, d: 6000, az: -80, el: 3, fov: 30, shift: 200 }` (`tz = −100·pos − 640`).

La lumière suit l'avion : `fz ≈ −100·pos − 400`, `fy ≈ 150 + 100·alt`, `fs: 900`.

## Pas au niveau

- La première image est juste, lisible (deux roues, la crosse au pont, les tuyères, la dérive) mais **pâle** : vu de
  devant, rien de signal dans le cadre, les cœurs des tuyères tournent le dos. Vu de trois quarts arrière elle aurait
  ses deux cœurs ; ce n'est pas le cadre demandé, je ne l'ai pas essayé.
- Le demi-mètre sous les roues se lit par l'écart avec les lignes du pont, pas par une ombre : la flaque et les taches
  sont discrètes à ras du pont.
- Le Rafale reste un X-ray fin : en plan large (profil, `VIEW.chase`) il est petit et léger.
- Non revus en image : `hook` 0 (contrôlé par les nombres seulement), `jet` et `you` en fondu, le point veille de
  `held` (trop petit dans le plan essayé), la visière mate, le cœur avancé.
- La main est couleur chair (celle du kit) : un gant gris serait plus juste pour un pilote.

## À changer ailleurs

- `plan.js`, ligne `RAFALE` — les nombres réels de l'avion construit (comptés depuis le bout de la crosse baissée, roues posées, nez à 0°) :
  `export const RAFALE = { length: 1535, span: 1088, wheels: 556, nosewheel: 1086, nose: 1440, tail: -129, hook: 211, cockpit: [0, 250, 1042] };`
- `world.js`, `POSE0` : la pose 1 ci-dessus. `VIEW.chase` : la pose 5 si la crosse doit se lire.
- `world.js`, commentaire de `held` : « le bout de la crosse est à hookAt » ; et `scrape` peut valoir ≈ 0,6 dès `FIRST` (le sabot touche).
- `carrier.js` : ma flaque de lumière (encre, 0,11) et mes taches d'ombre sont posées à y ≈ 1 cm au-dessus du pont ; si le pont a sa propre lumière sous l'avion, baisser `fx.pool`.
- `model.js` : le brin tenu arrive dans la gorge du sabot à `hookAt` ; la gorge fait ≈ 3,7 cm de rayon.

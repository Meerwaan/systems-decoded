# 023 · avion.js — journal

Propriétaire : `episodes/023-eolienne-de-secours/src/avion.js` (l'A330 aux rayons X, la mer, l'île, la piste). Budget : 30 images.

## Fait

- Lecture : recette, `023-decors.md`, `plan.js`, `world.js`, contre-vérification, idiome 015 (`rafale.js`, `carrier.js`) et 007 (`jet.js` 340–520).
- Premier jet complet d'`avion.js` (API exacte) : fuselage A330 par stations (nez Airbus, cône arrière relevé), carénage ventral, ailes à cassure de bord de fuite + winglets, empennage, une seule coque de verre (`asShell` 20) ; lignes : cadres, ceinture de hublots, plancher, portes, vitres du poste ; hublots allumés (le tien 2,6) ; moteurs pleins (nacelle, cône, soufflante en shader : flou vivant, pales qui tournent lentement mort — jamais de phase qui recule), lèvre signal quand mort ; pylônes en verre ; réservoirs (carburant plein, vidé des saumons vers l'emplanture par un `discard`) ; fuite (jet de gouttes signal) ; trois circuits (lignes de largeur suivant la distance, couleurs par sommet, `arrive` 0 → 1 depuis la soute) ; gouvernes pleines sur leurs charnières ; trains (bogies 4 roues, freins, pneus qui s'aplatissent, étincelles lentes) ; toi (figure de verre assise, main sur l'accoudoir) ; 306 têtes de verre ; filets d'air ; île (plateau de verre, courbes de niveau, grille, piste 45 m, feux en points) ; mer et ciel au dôme (houle ancrée sur l'île, ressac, aube = bande d'encre et reflet).
- Planche 1 (4) : nacelles bordeaux (émissif + gel) → émissif retiré ; pylônes pleins = plaques → pylônes en verre ; ailes trop pâles → verre d'aile plus vif ; ligne d'horizon trop forte → baissée.
- Planche 3 (4) : moteurs « flottants » devant et sous l'aile (le plan les met 2,6 m trop en avant, 0,45 m trop bas) → déplacés localement (`ENG`), voir « À changer ailleurs ».

- Planches 4–8 : capots moins navy ; pylônes en verre ; carénages de rails de volets ; carénage ventral adouci ; train rentré estompé (ses huit roues faisaient des yeux) ; gouvernes moins émissives, débattement porté à 22° / 22° / 20° (sens vérifié par le calcul : manche +1 = aileron gauche haut, droit bas, profondeurs haut, direction vers +z) ; dessus de l'île mat et noir (le verre à plat faisait une dalle grise) ; aube plus basse et plus fine ; freins moins brûlants.
- Message de l'orchestrateur appliqué : les trois lignes partent de la sortie de soute de `model.js` (x −600, y −230, z 47 / 59 / 71, la vivante à 59) ; ouverture de peau recalée sur `DOOR.len` 226 (x −866 → −640).
- `npm run check -- 023` passe (0 erreur, contrastes 55/55).

## Choix

- Moteurs : vivant = soufflante floue, liseré encre ; mort = pales visibles en moulinet lent (0,12 tour/s, toujours la même allure : jamais de phase qui recule), lèvre et arêtes signal. `engines` : gauche = clamp(engines), droit = clamp(engines − 1).
- `fuel` vide les réservoirs des saumons vers l'emplanture ; vides, leur contour passe au signal.
- `flow` : chaque sommet du circuit vivant a son « arrivée » (0 à la soute → 1 au bout de chaque branche : ailerons, profondeurs, direction) ; `press` = l'intensité veille de ce qui est derrière la tête. Les deux circuits morts et l'alimentation moteur du vivant ne s'allument jamais.
- `stick` +1 : roulis à gauche, cabré. `tires` : pneus écrasés, étincelles lentes seulement si l'avion roule (`ahead` entre −0,25 et −0,17 → 0).
- La mer suit l'île (`threshold`) : une mer immobile = un avion immobile.

## Images lues

30 / 30 (budget épuisé ; la dernière retouche — tête grise, halo de ton hublot resserré — n'a pas été revue à l'image)

## Poses qui cadrent

Convention : caméra en (sin az, cos az) — az 0 côté +z (gauche), −90 devant, +90 derrière, ±180 côté droit.

- Première image (à départager par l'orchestrateur sur une planche) :
  - P1 `{ tx: -390, ty: -215, tz: 800, d: 2900, az: -32, el: -16, fov: 46, shift: 150, side: -30 }` — le moteur proche énorme, lèvre signal, soufflante en moulinet ; le lointain en bas à gauche ; la rangée de hublots en haut (cadre « H2 », recalé sur le moteur déplacé).
  - P2 `{ tx: -440, ty: -205, tz: 500, d: 5200, az: -38, el: -9, fov: 34, shift: 160 }` — POSE0 recalé : les deux moteurs, le fuselage, la mer.
  - P3 `{ tx: -640, ty: -155, tz: 400, d: 5200, az: -48, el: -22, fov: 40, shift: 170 }` — plus bas, plus en diagonale, l'aile proche qui fuit.
  - P4 `{ tx: -490, ty: -285, tz: 900, d: 2700, az: -30, el: -18, fov: 46, shift: 140, side: -40 }` — le plus serré.
- Large (VIEW.wide, l'île sous l'avion, vu de derrière) : `{ tx: -18560, ty: -5616, tz: 0, d: 48000, az: 90, el: 14, fov: 40 }` avec `ahead` 1 — très bon.
- Approche (piste devant le nez) : `{ tx: -20000, ty: -2296, tz: 0, d: 34500, az: 90, el: 9.7, fov: 38 }` avec `ahead` 0,1, `alt` 600 — très bon (ty = sol à cet `alt`).
- Au sol, freins : `{ tx: 80, ty: -470, tz: 530, d: 1300, az: 55, el: 8, fov: 30, shift: 120 }` (de derrière à gauche : de devant, le moteur proche masque le train ; `VIEW.gear` à el −18 met la caméra sous la piste quand `alt` 0).
- Queue, gouvernes : de derrière `{ tx: 1200, ty: 0, tz: 0, d: 13000, az: 90, el: 6, fov: 40 }` (tout l'avion, ailerons + profondeurs + direction).
- Toi : `{ tx: -1460, ty: 10, tz: 240, d: 950, az: -18, el: 2, fov: 32, shift: 120 }`.
- Soute dans l'avion : `VIEW.bay` marche, mais le moteur proche occupe le bas gauche.

## Pas encore au niveau

- Vue d'ensemble de trois quarts avant (`VIEW.plane`, d 13000, el −6) : l'aile, vue par la tranche, disparaît ; l'avion est un tube. Préférer el −16 et fov 42, ou la vue de derrière.
- `VIEW.wide` (az −62) et `VIEW.approach` (az −118) regardent à l'opposé de l'île : poses de remplacement ci-dessus.
- Étincelles des pneus et fuite : jamais vues de près à l'image (budget).
- Le caisson de soute de `model.js` dépasse sous la peau en vue `bay` : une boîte grise sous le ventre.

## À changer ailleurs

- `plan.js` : `export const ENGINES = { z: 960, x: -360, y: -335, r: 150, len: 520 };` (au lieu de x −620, y −380 : sinon les nacelles flottent 2,6 m devant le bord d'attaque). `avion.js` les place déjà là (`ENG`) ; ensuite `ENG` peut redevenir `ENGINES`. `VIEW.engine` suit tout seul (il lit `ENGINES`).
- `plan.js` : `ISLAND.w` 900 → 4500 (à 9 m de large, les bogies, écartés de 10,6 m, rouleraient à côté). `avion.js` dessine déjà la piste à 45 m (`RWY_W`).
- `world.js`, `apply()` : passer aussi `whirl: S.whirl` à `avion.update(...)` — les filets d'air passent au veille en traversant le disque de l'hélice (sans lui, ils restent encre).

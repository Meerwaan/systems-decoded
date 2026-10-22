# L02 · `poste.js` — journal de l'agent de décor

2026-10-20. Fichier : `episodes/L02-poste-haute-tension/src/poste.js` (interface du bouchon gardée, trois paramètres optionnels en plus). Build et `look` passent. **30 images lues** (planches `scratchpad/L02/poste-b1` … `poste-b6`). Les essais se font avec `scratchpad/L02/poste-mk.cjs` (il pose sous chaque entrée l'état de repos COMPLET du poste : sans lui, les chapitres-bouchons laissent `explode`, `climb`… à des valeurs d'une autre scène — c'est ce qui m'a fait croire deux planches durant que ta ligne coupée ne se dessinait pas).

## Fait
- **Portiques** : un portique par travée (jambes à ± 1 130 de son centre : une rangée de portiques identiques pour `ident`), poutre-caisson et jambes en treillis effilées (1,6 m au pied), pointes de câble de garde. Membrures et diagonales en tubes de verre de près, en lignes de loin (niveau de détail par travée, d'après la caméra que capte le sol : rien de fin sous 2 px, les diagonales s'effacent quand un panneau fait moins de 14 px). Échelle (barreaux de 35 cm) sur la face +z de TA jambe +z.
- **Chaînes** : doubles, 13 disques de verre chacune (de loin : une tige lisse). Les tiennes : un maillage par disque, elles s'écartent à l'éclaté.
- **Appareillage des autres travées** en verre (sectionneurs à deux colonnes et leurs bras, pôles de disjoncteur ; jupes lissées de loin). Barres (deux tubes à 11 m) et leurs supports. Clôture et portail (lignes ; le portail sur le côté +x, au niveau de `FENCE.gate`).
- **Conducteurs** : tubes de lumière (cœur + halo serré, jamais sous 1,9 px). Ta ligne : portée en faisceau double du pylône jusqu'à `LINEAT`, simple ensuite ; descente DROITE (elle passe exactement par `WORKAT`) ; liaisons de la travée ; liaison aux barres (toujours sous tension). La voisine : pareil. Les autres lignes, ténues, partent vers −x et s'éteignent. Les lignes vivantes éclairent le gravier sous elles.
- **Sol** : grille seule (s'efface en rasant), cailloux de près seulement, flaques de lumière. **Coupe** : tranchée devant z = 1 500 (face + deux parois, le fond en grille), bande de gravier caillou par caillou, terre sombre, maillage de cuivre (sous tout le poste, −80 cm, mailles de 6 m, piquets, remontées aux jambes, aux appareils et aux deux bornes `EARTH`). La travée +z (z 2 400 : la tranchée est creusée dans son sol et la caméra de `VIEW.ground` s'y tient) s'efface avec `cutaway`.
- **Anneaux de potentiel** : pas égaux de potentiel autour du pied de ta jambe [0, 0, 1 130] (`A.fault`), denses près du pied, qui s'étendent avec `fault` ; cercles au sol, demi-cercles sur la face (des hémisphères) ; `bond` les éteint et allume le maillage en entier (veille). Entre tes deux pieds, un trait signal (tension de pas). De ta main à tes pieds, le trait signal de la tension de toucher (automatique : `fault` × (1 − `bond`) quand ta main est sur la jambe).
- **Gravier** (`gravel`) : une dalle de 15 cm sous tes pieds qui s'allume veille, et sous chaque semelle un filet signal qui meurt dans les cailloux.
- **Arc** : cœur blanc-chaud, gaine, halo, deux formes entre lesquelles il ondule lentement, une boule à sa racine et à sa tête ; il part de ta portée de phase 1 (x −230) et grandit vers ta main (révélé de 0,5 à 0,75), s'arrête à 7 cm d'elle. 0 → 0,5 : une lueur droite et pâle qui respire.
- **Enveloppe** : tubes de verre signal de 3,3 m de rayon autour de tes trois phases (portée depuis x −1 700, chaîne, descente), très pâles, qui respirent ; toi dehors. **Zone** : boîte arrondie de verre veille (x −800 → 500, du sol à 2,6 m au-dessus de la poutre, des phases à la jambe), son trait au sol.
- **Repère** (`mark`) : ton portique vire au veille, un anneau-cible de 5,2 m au-dessus de sa poutre, une tige, une lueur.
- **Toi** : figure de verre, casque plein à visière ; marche du portail au poste (le pas s'arrête aux arrêts 0,8 et 1), face −z au poste (perche) et au pied de la jambe ; montée à l'échelle (mains et pieds alternés) ; sur la poutre, quelques pas jusqu'au-dessus de la phase 1 puis face −x ; `arms` 2 en haut : à genoux, penché, la main vers le conducteur ; `arms` 2 au pied de la jambe : la main sur elle. **Les deux chargés** : plus pâles, casqués, face à face devant ta travée (x 1 180 et 1 040, z 1 330) ; l'attestation (feuille pleine) passe d'une main à l'autre.

## Chaque nombre chez moi
- `amount` : verre et lignes du poste (les conducteurs restent) · `bays` : les autres travées et leurs conducteurs (la voisine garde les siens) · `mark` : ton portique veille + l'anneau
- `live` (signal) · `earthed` (vire au veille) · `voisine` · `induced` 0 → 1 lueur lente signal dans ta portée et tes descentes, → 2 impulsions vives qui courent · `couple` : 21 lignes de champ voisine → toi, tirets qui avancent vers toi · `efield` : 24 lignes de tes descentes au sol, tirets qui montent · `current` : tirets veille sur le maillage, depuis les deux bornes
- `airArc`, `envelope`, `zone`, `gravel` : ci-dessus · `cutaway` : tranchée + face + parois, la travée +z s'efface · `mesh` : maillage veille · `fault`, `bond` : ci-dessus
- `explode` : ton portique +6 m, tes chaînes s'écartent (pas × 1,9), tes conducteurs s'éteignent (0 → 0,35), le maillage −3 m · `named` 1 ton portique plus lumineux, 2 tes chaînes plus lumineuses, 5 le maillage veille
- `you`, `walk`, `climb`, `arms`, `chief`, `paper` : ci-dessus · optionnels `probe`, `perche` (la main haute exactement sur la perche), `path` (force le trait main–pieds, 0–1)

## Poses qui cadrent bien (vues sur planche ; état = repos du poste + ce qui est dit)
- Poste entier : `{ tx: 1500, ty: 300, tz: -1200, d: 11000, az: -35, el: 24, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ live: 1 }`
- Travée : `{ tx: 1400, ty: 600, tz: 0, d: 4200, az: -40, el: 14, fov: 28, shift: 0, side: -150, roll: 0, drift: 0.3 }` ; la même + `{ explode: 1, named: 2 }` pour l'éclaté
- Portique, les deux circuits : `{ tx: 0, ty: 1400, tz: -600, d: 3200, az: -32, el: 6, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }`
- Dernier pylône, les deux circuits : `VIEW.pylon` tel quel `{ tx: -4200, ty: 2600, tz: -1200, d: 6500, az: -62, el: 6, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ live: 1 }`
- Plongée « identifier » : `VIEW.ident` tel quel + `{ mark: 1 }`
- Champ, toi sous ta ligne : `{ tx: 300, ty: 300, tz: 980, d: 900, az: -30, el: 4, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ live: 1, efield: 1 }`
- Montée : `{ tx: 0, ty: 1100, tz: 1200, d: 900, az: -40, el: -8, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ walk: 1, climb: 0.45 }`
- L'arc : `{ tx: -120, ty: 1700, tz: 680, d: 1100, az: -60, el: 4, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ live: 1, climb: 1, arms: 2, airArc: 1 }` (vu à ty 1760 / d 900 : très beau, mais ta tête touchait le bord haut — corrigé à l'estime)
- Coupe et anneaux : `{ tx: 600, ty: -60, tz: 1300, d: 1700, az: -28, el: 22, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ cutaway: 1, mesh: 0.6, fault: 0.7 }`
- Toucher : `{ tx: 150, ty: 40, tz: 1300, d: 1300, az: -22, el: 10, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ walk: 1, arms: 2, cutaway: 1, mesh: 0.6, fault: 1 }`
- Gravier : `VIEW.gravel` tel quel + `{ gravel: 1 }` (le plus lisible de tous)
- Zone : `{ tx: -100, ty: 900, tz: 400, d: 2600, az: -38, el: 10, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ earthed: 1, zone: 1, clamps: 2 }`
- Les chargés : `{ tx: 760, ty: 120, tz: 1150, d: 1100, az: -20, el: 6, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ chief: 1, paper: 0.5 }` — une colonne de la travée +z passe devant : baisser `bays` ou tourner vers az −45

## Pas au niveau, dit franchement
- **`VIEW.hook1` (az −38)** : la perche et ta descente se superposent presque à l'image — la descente ne se lit pas. Essayer az ≈ −10 (la perche presque verticale, la descente en travers) : pas vérifié.
- **Ta ligne coupée** (encre sombre, additive) se lit mal de loin devant la voisine vivante : rien ne la découpe. De près, oui.
- Le poste vivant reste très orange en plan large (voisine, barres, liaisons aux barres) : dosé une fois (autres lignes 0,1, barres 0,42, halos 0,17), pas revu.
- `efield` : de longs traits presque verticaux, une pluie plus qu'un champ ; baissé à 0,55, pas revu.
- Les chargés : vus une fois, petits ; geste simple (un bras tendu).
- L'éclaté : ton portique qui monte et tes chaînes qui s'écartent ; pas jugé avec l'appareillage de model.js.
- Retouchés après leur dernière image : la zone (base 0,005), l'enveloppe (rim 0,11), les anneaux (22 pas, plus doux près du pied).
- Jamais vus : `induced` 2, `couple`, `current`, `bond` seul, `named` 1 et 5, la marche en mouvement, le trait main–pieds en gros plan.

## À changer ailleurs
- `world.js · apply`, dans l'appel `poste.set({ … })`, après `chief: S.chief, paper: S.paper,` ajouter : `probe: S.probe, perche: S.perche,` — sinon ta main haute suppose `probe` 0 et `perche` 1 et quitte la perche quand elle bouge.
- `plan.js · WORK` : la jambe que tu grimpes est à z = 1 130 (un portique par travée), pas 1 200 : `climb: { leg: [0, 0, 1130], top: [0, 1800, 600] }`.
- `VIEW.ground` : la caméra se tient dans la travée +z (z ≈ 2 570) ; cette travée ne s'efface qu'avec `cutaway` > 0 — ne pas y poser la caméra sans la coupe.

## Reprise (même jour, 8 images de plus : planches poste-b7, poste-b8 ; 38 en tout)
- **Le reste du poste vivant baisse** : seules ta ligne et la voisine brûlent (cœur + halo). Barres, liaisons aux barres (les tiennes, celles de la voisine : à part), autres travées : un fil ténu sans halo, niveau 0,11, encore 0,55 fois plus bas en plan large (caméra à plus de 35 → 100 m de ta travée). Flaques sous les barres presque éteintes, flaques générales 0,015.
- **Ta ligne coupée** : encre claire et nette (corps plat 0,16 → bords 0,46, × 1,7) avec un léger halo encre, tubes jamais sous 3,2 px (descentes, portées) et 2,6 px (travée) ; la voisine 2,6 px. Vu : au pylône et en plan large, « un coupé, un vivant » se lit tout de suite.
- **efield** : 9 lignes au lieu de 24, tubes de 2,4 cm (3 px au moins), cubiques dans un plan (elles quittent le conducteur de côté et se posent debout sur le sol), une lumière qui monte en sinus lent (28 cm/s, période 3 m) : rien qui puisse scintiller. Se lit mieux de profil : `{ tx: 300, ty: 450, tz: 700, d: 1500, az: -75, el: 4, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }` + `{ live: 1, efield: 1 }`. De face (az −30), les lignes tombent presque droit : moins parlant.
- **couple** : même lumière en sinus (35 cm/s, 2,4 m), tubes de 3 px, niveau 1,15 ; vu : des arcs de la voisine vers ta ligne au-dessus du portique, `{ tx: -800, ty: 1300, tz: -1200, d: 3600, az: -40, el: 10, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ couple: 1, induced: 1, you: 0 }`. Encore un peu emmêlé avec les portées.
- **induced 2** vu : ta ligne monte d'un coup, cœur vif et impulsions, halo large — `VIEW.work` + `{ induced: 2 }`.

## Reprise 2 — la perche sur les trois phases (7 images : poste-b9, poste-b10 ; 45 en tout)
- Au poste (walk 0,8), tu te tiens sous la phase visée, toujours à la même place relative (380 cm côté +z de la phase, comme WORK.stand devant la phase 1) : z = 980 (phase 1), 380 (phase 2), -220 (phase 3). Le vecteur mains → tête est donc le même pour les trois : perche ≈ 10,0 m partout (vue constante sur poste-b9).
- La phase visée (`aimOf`) : `probe` (0 → 2, continu) ; pendant la pose des pinces (`tool` 1, `clamps` 1 → 2), celle de la pince qui monte, dans l'ordre de model.js (un tiers par phase) : on marche de sous la dernière posée à sous la suivante pendant qu'elle monte (smooth 0 → 0,9 du tiers).
- La marche : les pas suivent la distance parcourue (aucun glissement), face −z (on avance vers les phases suivantes, on recule vers la 1) ; au repos sur une phase entière, pieds posés. Entre deux phases il y a 6 m : environ 9 pas, pas « deux ou trois » (les phases sont à 6 m).
- Vu : poste-b9 (de profil, probe 0 / 1 / 1,5 en marche / 2) : la perche garde sa longueur et son angle. poste-b10 (de face sur chaque phase) : trop chargé pour distinguer la tête — non concluant.
- Durées minimales pour c5 (marche ≤ 1,2 m/s) : `probe` 0 → 1 et 1 → 2 sur 5 s chacun au moins, tenu entier pendant la mesure ; 385,8–388 s (2,2 s) est trop court pour 6 m : couper ou ne pas changer de phase. `clamps` 1 → 2 : au moins 15 s (5 s par phase) — 398,6–401,5 s (2,9 s) ferait courir à 4 m/s ; sinon couper entre les phases. Avant `clamps` > 1, `probe` doit valoir 0 (la pose commence sous la phase 1) : sinon tu sautes de la phase visée à la phase 1.

## À changer ailleurs (reprise 2)
- `world.js · apply`, dans `poste.set({ … })`, après `probe: S.probe, perche: S.perche,` ajouter : `clamps: S.clamps, tool: S.tool,` — sans eux, la marche ne suit pas la pince qui monte (seulement `probe`).

## Reprise 3 (3 images : poste-b11, poste-b12 ; 48 en tout)
- Ta ligne à la terre : sa flaque veille sur le gravier ramenée au tiers (× (1 − 0,67 × earthed)) : une lueur sous les conducteurs, plus un sol vert.
- Zone : verre base 0,0008, rim 0,09, power 3,4, edge 0,6 — à zone 0,5, des arêtes nettes et une face presque transparente ; il reste une traîne verte sur la face proche, vue en biais.

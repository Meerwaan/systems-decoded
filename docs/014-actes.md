# 014 · ABS — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (`npm run script -- 014` le donne ; la vraie voix sera ≈ 25 % plus courte). Tout instant se lit donc dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères : le jour où la voix arrive, tout se recale seul. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui vides) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/012-gaziniere/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`).

## La scène, et ce qu'on a le droit d'affirmer

Il pleut. Tu roules à 80 km/h, un camion est arrêté dans ta voie, trop près pour que tu t'arrêtes avant lui : il faut tourner. Tu écrases le frein, la pédale tremble. Sans ABS, la roue se bloque et la voiture glisse tout droit. Avec, la roue repart, tu braques, la voiture obéit : le camion passe à ta droite. **C'est un scénario** : aucune distance d'arrêt n'est affichée, les vitesses de l'en-tête sont illustratives. Ce qui est sourcé : jusqu'à 40 cycles par seconde (Bosch) ; les trois temps — isoler, relâcher, resserrer (documentation d'atelier) ; une roue bloquée ne dirige plus ; la pédale qui vibre est normale, on ne relâche pas, on ne pompe pas (notices de constructeur, Transport Canada, DEKRA). **Aucune collision à l'image** : le « et si » s'arrête un mètre avant le camion, puis le film revient en arrière.

## Le repère, et les deux nombres de l'en-tête

- **Le repère est celui de la voiture** : elle ne bouge jamais, son nez est vers −z. La route et le camion viennent à elle : **`gap`** (mètres jusqu'au camion). `lane` (mètres vers la gauche), `yaw` (degrés), `steer` (−1 … 1), `dive` (le nez qui plonge).
- **Le chrono de ce film est un compteur de vitesse.** L'en-tête lit deux nombres de l'état : **`kmh`** (la voiture, en grand) et **`wkmh`** (« Ta roue » : la roue avant gauche). Une voiture à 70 avec une roue à 0, c'est tout le danger en un coup d'œil : le second passe en signal tout seul quand la roue décroche (`main.js`). À toi de les tenir vraisemblables : la voiture ralentit toujours (80 au coup de frein → ≈ 30 quand le camion est passé), la roue est à la vitesse de la voiture tant qu'elle roule, tombe quand elle se bloque, remonte quand on la relâche.
- **Les roues tournent avec `rolled`** (mètres roulés) : tant qu'elles roulent, `rolled` avance d'autant que `gap` recule — **mets-les dans le même `st`** (`st(at, durée, { gap: 26, rolled: 12 }, "none")`) ; bloquées, `rolled` ne bouge plus pendant que `gap` continue. Une coupe peut reposer `rolled` où elle veut (l'angle d'une roue ne se raccorde pas).
- Le film se joue AU RALENTI dès le coup de frein : un cycle de l'ABS dure un quarantième de seconde, on l'étire sur plusieurs secondes.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 90 pour la roue, ≈ 30 sur le bloc ou la pédale, ≈ 900 pour la voiture et le camion, `SIZE` sur l'établi).
- **Couleurs** : signal est la menace — le camion, une roue qui se bloque et glisse ; veille est le système vivant — ce que lit le capteur, les vannes, la pompe, une roue qui repart ; ink est le reste, y compris le liquide que pousse ton pied. `mood` 1 dans la rue tant que le camion est devant, 0 sur l'établi et dès qu'il est passé. Jamais à mi-chemin plus d'une demi-seconde.
- Toi, de près, es un mannequin de verre : le pied sur la pédale et les mains sur le volant se filment à travers la carrosserie, de trois quarts, jamais en très gros plan.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** (`ease`, `delay`, `duration`, `repeat`, `yoyo`, `stagger`, `snap`…) : la liste de `FIRST` est fermée, n'en ajoute pas.
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-camion` (Camion arrêté / Trop près) · `chip-bloque` (Roues bloquées / Tout droit) · `chip-volant` (Tu braques / Rien) · `chip-veille` (Quatre roues / Surveillées) · `chip-vabloquer` (Roue avant gauche / Va se bloquer) · `chip-isole` (Vanne 1 / Isoler) · `chip-relache` (Vanne 2 / Relâcher) · `chip-resserre` (La roue repart / Resserrer) · `chip-40` (Jusqu'à / 40 fois par seconde) · `chip-obeit` (Tes roues tournent / Tu diriges) · `#retitle` (L'ABS : « Freine plus court » barré → « Te laisse tourner ») · `#net` · `#next` (Prochain dossier · 015 — « Il touche le pont. Il met plein gaz. ») · `chip-tiens` (La pédale tremble / Ne lâche pas) · `chip-geste` (Écrase · Tiens / Tourne) · `#cta-field` (« Ta pédale a déjà tremblé ? » → « OUI », 3 lettres) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `012-gaziniere/src/acte2.js`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

L'accroche en UN mouvement (la roue → ton pied → le tuyau → la roue → le camion → ton pied) ; puis la scène, avec le « et si » et son retour en arrière.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, état `FIRST` : au ras de la route mouillée, à côté de la roue avant gauche, la pluie, la gerbe, les feux du camion au bout. **Ça bouge dès l'image 1** : la route défile (`gap` 38 → …, `rolled` avec lui), la caméra glisse le long de la voiture. |
| `stamp` | « Sous la pluie, tu écrases le frein… » | `dive` → 1, `grip` 0,6 → 0,9 : l'étrier serre derrière les branches ; la caméra entre dans l'habitacle à travers le verre, vers la pédale |
| `shake` | « et ta pédale se met à trembler. » | ton pied sur la pédale (`VIEW.pedal`) ; sur « trembler », `pulse` 0 → 1, `pump` 1 |
| `car` → `lets` | « C'est ta voiture : elle relâche tes freins, roue par roue. » | elle suit le tuyau, de la pédale au bloc (`xray` 0 → 0,8 : ses vannes) puis descend le flexible jusqu'à l'étrier (`VIEW.wheel`) ; sur « relâche », `outlet` 1 un instant, `grip` 0,9 → 0,3 → 0,9 : les plaquettes s'ouvrent, puis resserrent ; `wkmh` plonge et remonte sous `kmh` |
| `onpurpose` → `truck` | « Exprès : pour t'éviter le camion. » | recul par rapport depuis la roue jusqu'à voir la voiture et le camion (`VIEW.chase`) ; `xray` → 0 ; sur « camion », `steer` 0 → 0,6 et `lane` 0 → 0,9 : la voiture commence à se déporter ; `chip-camion` |
| `sauf` → `reflex` | « Sauf si ton pied… a le mauvais réflexe. » | retour sur ton pied, la pédale qui tremble ; sur « réflexe », `brake` 1 → 0,7 : le pied commence à se lever — et l'image TIENT là-dessus (on ne montre pas la suite) |
| `toscene` → `v80` | « 80 kilomètres-heure. » | **coupe** : `STAGED` (`gap` 38, 80 / 80, `brake` 0), vue de derrière et de haut (`VIEW.chase`) : la voiture lancée, la pluie, le camion ; la route défile (`gap` et `rolled` ensemble) |
| `tooclose` | « Trop près pour t'arrêter : » | `brake` 0 → 1, `dive` → 1, `grip` → 0,8 ; `gap` → 24 ; `chip-camion` |
| `turn` | « il faut tourner. » | tes mains tournent le volant (`VIEW.hands`, ou de dessus) : `steer` 0 → 1 |
| `locked` | « Mais une roue bloquée » | **le « et si »** : `grip` → 1, `lock` 0 → 1, `skid` 0 → 1 ; `rolled` s'arrête net, `wkmh` 80 → 0 en deux dixièmes (l'en-tête : « Ta roue 0 km/h », signal) ; la roue avant gauche, braquée, immobile, qui laboure l'eau (`VIEW.wheel`) ; `chip-bloque` |
| `straight` | « glisse tout droit… » | de dessus (`VIEW.top`) : les roues braquées à gauche, la voiture qui file droit sur le camion — `gap` 24 → 4, `lane` 0, `yaw` 0, les traces signal bien droites ; `kmh` → 55 |
| `nothing` | « elle ne dirige plus rien. » | `chip-volant` ; `gap` → 1,2 : l'image tient, un mètre avant le camion |
| `back` | *(silence)* | le film revient en arrière en 0,35 s : `gap` → 30, `lock` → 0, `skid` → 0, `steer` → 0, `wkmh` → `kmh` |

L'acte 2 coupe à `tosystem`.

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tosystem` | « Alors… » | **coupe** : la rue, le système dans la voiture (`VIEW.system`, `{ ...STAGED, brake: 0 }`). La carrosserie, la route, la pluie et le camion s'effacent (`shell` → 0, `rain` → 0, `truck` → 0, `mood` → 0) : il reste seul |
| `tobench` | « …on l'ouvre. » | `benchCut` : le même système, sur l'établi, à la même place de l'image (`origin` = `[0, 0, 0]` − `SYSTEM.bench`, composante par composante). `explode` 0 → 1 (1,2 s, `"none"`), la caméra recule par rapport jusqu'à la rangée (`VIEW.exploded`) |
| `p1` | « Derrière chaque roue : une couronne dentée, » | travelling le long de la rangée jusqu'à la couronne ; `litRing` ; légende « Couronne dentée » |
| `p2` | « un capteur. » | même cadre : `litRing` → 0, `litSensor` → 1 ; légende « Capteur » / « Lit la vitesse de la roue » |
| `p3` | « Un calculateur. » | elle glisse vers le bloc : `litEcu` ; légende « Calculateur » |
| `p4` | « Et sur le circuit de tes freins… deux vannes par roue, » | les deux vannes sorties du bloc, dans UN cadre ; `litValves` ; légende « Deux vannes » |
| `p5` | « et une pompe. » | même cadre ou un pas de côté : `litValves` → 0, `litPump` → 1 ; légende « Pompe » |
| `torepos` → `idle` | « Tant qu'aucune roue ne se bloque, il ne touche à rien. » | **coupe** : l'établi, tout remonté (`explode` 0), `xray` 1, la roue qui tourne (`rolled` avance régulièrement pendant tout le plan, `"none"`), `brake` 0,6, `grip` 0,6, `inlet` 1, `outlet` 0 : la lumière du liquide file de la pédale à l'étrier à travers la vanne ouverte — dans le bloc, rien ne bouge (`VIEW.unitPart`, puis léger recul) |
| `watch` → `four` | « Il surveille tes quatre roues… » | la caméra descend le fil jusqu'à la couronne et son capteur (`VIEW.ringPart`) ; `sense` 1 : les impulsions veille remontent le fil ; `chip-veille` |
| `toofast` | « et attend qu'une seule ralentisse trop vite. » | la roue ralentit d'un coup (`rolled` avance de moins en moins, `wkmh` 80 → 30) : les impulsions s'espacent ; `litEcu` 0 → 1 : il l'a vu |
| `toseuil` | « Abonne-toi : cette pédale qui tremble, regarde ce qui se passe dans ta roue. » | `followCall`. Le film ne s'arrête pas : **coupe** vers la rue — l'image de l'accroche qui revient (`POSE0`, la roue dans la pluie, `pulse` 1, les feux du camion) — et la caméra part déjà DANS la roue (`xray` 0 → 1 : le disque, l'étrier). Pas de panneau |

L'acte 3 coupe à `tozero`.

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes : c'est ici qu'elles font la tension. `setAct(tl, 3, press)`. Au ralenti. La voiture ralentit du début à la fin de l'acte (`kmh` 80 → ≈ 30), le camion approche (`gap` 30 → 10 jusqu'à `steer`), puis passe.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `press` | « Tu écrases. » | **coupe** : ton pied sur la pédale, à travers le verre (`VIEW.pedal`, `STAGED`) ; sur le mot, `brake` 0 → 1 en un dixième, `dive` → 1, `jolt` |
| `slows` | « Ta roue avant ralentit d'un coup : » | **coupe** : la roue avant gauche, de l'extérieur (`VIEW.wheel`), `xray` 0,6 ; `grip` 0 → 1 : les plaquettes mordent ; la roue ralentit plus vite que la route ne défile (`rolled` décroche de `gap`) : `wkmh` 78 → 30 quand `kmh` est à 76 |
| `lock` | « elle va se bloquer. » | `wkmh` → 8, `lock` 0 → 0,6 (le disque rougit), les impulsions du capteur presque arrêtées, `litEcu` 1 ; `chip-vabloquer` |
| `toreponse` → `isolate` | « Première vanne : il isole ton frein. » | **coupe** : le bloc, `xray` 1 (dans la voiture, `shell` 0,25 — ou la pose que rend `model.js`) ; sur « isole », `inlet` 1 → 0 : le noyau claque, la lumière de ton pied s'arrête à la vanne ; `chip-isole` |
| `v2` → `trigger` | « Deuxième vanne : il relâche la pression. » | sur « relâche », `outlet` 0 → 1 : la lumière de l'étrier se vide dans l'accumulateur, `grip` 1 → 0,25, `lock` → 0, `pump` 0 → 1 ; `chip-relache` à la place de `chip-isole` |
| `again` | « La roue repart… » | **coupe** : la roue (`VIEW.wheel`) : `rolled` reprend, `wkmh` 8 → 62 (`kmh` 68), la marque tourne de nouveau, les impulsions reviennent, l'en-tête repasse en veille |
| `squeeze` | « il resserre. » | `outlet` → 0, `inlet` → 1 : `grip` 0,25 → 0,85 ; `chip-resserre` |
| `forty` | « Jusqu'à 40 fois par seconde. » | le cycle se répète, de plus en plus vite (quatre à six fois à l'écran) : `grip` 0,85 ↔ 0,4, `wkmh` qui ondule un peu sous `kmh`, les vannes qui battent ; `chip-40` |
| `toturn` → `pedal` | « Sous ton pied, ça tremble. » | **coupe** : ton pied sur la pédale, `pulse` 1, les tirets de la pompe qui remontent le tuyau vers lui |
| `rolling` | « Mais tes roues tournent encore : » | **coupe** : la voiture de derrière, basse (`VIEW.chase` resserrée) : les quatre roues qui tournent dans leurs gerbes, le camion à `gap` 12 |
| `steer` | « tu braques… » | `steer` 0 → 1 : tes mains, les roues avant qui s'orientent |
| `obeys` | « et la voiture obéit. » | de dessus (`VIEW.top`) : `lane` 0 → 3,5, `yaw` 0 → 9 → 0, `gap` 12 → −5 : le camion passe à ta droite ; `chip-obeit` ; `mood` → 0 une fois passé ; `kmh` → 30 |

`fin.js` coupe à `toverdict`.

## Chute, appels à l'action, boucle — `fin.js` (`toverdict` → fin)

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `idea` | « L'ABS ne sert pas d'abord à freiner plus court : » | **coupe** : l'établi, le système entier (`{ ...BENCHED }`, `VIEW.whole`), la roue qui tourne lentement (`rolled`, `"none"`) ; `retitle` : « Freine plus court » arrive avec la phrase, barré sur « court » (`idea`) |
| `gravel` → `far` | « sur du gravier, il t'arrête même plus loin. » | lente poussée vers la roue et son frein ; `xray` 0 → 0,7 |
| `alive` | « Il garde tes roues en vie… » | `sense` 0 → 1 : les impulsions veille sur le fil, la roue tourne |
| `verdict` | « pour que tu puisses tourner. » | « Te laisse tourner » le remplace ; sur « tourner », `steer` 0 → 1 : le coin de roue braque, sur l'établi ; `D.verdict(verdict)` ; le titre est sorti avant `tocta` |
| `tocta` | « Like. Pour celui qui lève le pied quand ça tremble. » | **coupe** : l'établi, le système entier (`VIEW.whole`), qui tourne lentement. `likeCall` (5 tuiles, « n personnes ») |
| `toabo` → `next` | « Abonne-toi. Prochain dossier : un Rafale se pose sur un porte-avions. » | `nextFile` (panneau à `next`) ; la caméra recule et descend |
| `deck` → `throttle` | « Et quand il touche le pont… il met plein gaz. » | le fait du panneau à `deck` |
| `tocomment` | « Et le mauvais réflexe ? » | **coupe** : la rue, ton pied sur la pédale qui tremble (`VIEW.pedal`, `{ ...STAGED, brake: 1, grip: 0.7, pulse: 1, pump: 1, gap: 16, kmh: 60, wkmh: 54 }`) |
| `wants` | « Ton pied veut relâcher. » | `brake` 1 → 0,5 : le pied se lève ; `chip-tiens` |
| `dont` | « Ne relâche pas, ne pompe pas : » | `brake` 0,5 → 1 : il redescend, franchement |
| `stomp` → `stay` | « tu écrases, tu tiens… » | recul à travers le verre jusqu'à voir tes mains et le camion devant |
| `go` | « et tu tournes. » | **coupe** : de dessus ou de derrière — `steer` → 1, `lane` 0 → 3,5 : le camion passe à ta droite ; `chip-geste` |
| `ask` | « En commentaire : ta pédale a déjà tremblé ? » | `commentCall` (la question s'affiche ; « OUI » se tape : `chars: 3`) |
| `toloop` | « Parce que la prochaine fois, ce sera peut-être… » | **coupe** : la route sous la pluie, la voiture lancée, le camion loin (`{ ...STAGED, brake: 0, grip: 0, gap: 60, rolled: -22 }`, `VIEW.chase`) ; `rewind` : `D.loop({ at: toloop, rewindAt: rewind, fromD })` — retour à `POSE0` et à `FIRST` : `gap` → 38 et `rolled` → 0 ensemble (les roues roulent vers l'avant jusqu'à la première image), le pied descend. **La boucle est causale : la dernière image EST l'instant de la première.** |

La dernière image est la première : `commit` prévient dans la console si un nombre n'est pas revenu. Compare la première et la dernière image avant de rendre (`look --at 0.02,<fin − 0.03>`), et signale tout repère de l'acte 1 qui décalerait la première.

## Corrections après les décors — elles priment sur les tableaux ci-dessus

Vu sur planche par celui qui orchestre : les deux décors sont au niveau. Les images les plus fortes, à ne pas rater : **le camion qui passe à ta droite** (`VIEW.chase` avec `shift: 160`, `lane` 3,5, `gap` −3) ; les traces signal bien droites derrière la voiture qui glisse (`VIEW.chase` ou `VIEW.top`, `skid` 1, `steer` 1) ; **la roue de verre, le disque qui rougit** (`VIEW.wheel`, `xray` 0,6, `lock` 0,6) ; la couronne dentée en veille (`VIEW.ringPart`, sur l'éclaté) ; **les trois temps du cycle dans le bloc de verre** (`VIEW.unitPart`, `xray` 1) ; le bloc ouvert, ses deux vannes vertes (`VIEW.unitOpen`).

- **`POSE0` a changé** (`az` −13, `side` −120 : la roue et le camion ne tiennent ensemble qu'entre `az` −11 et −16). L'image est juste mais pas encore « la plus forte » : la roue est coupée par le bord droit et passe sous la colonne des boutons, la gerbe et la pluie se voient à peine. **L'agent de l'acte 1 la règle** (plus bas ? plus près de la gerbe ? la roue plus à gauche, les feux du camion et leurs reflets en grand) et me rend la ligne exacte de `POSE0` et de `FIRST`.
- **Le cycle se lit par où est la lumière** (`VIEW.unitPart`, `xray` 1) : *isoler* — `inlet` 0 : une bobine verte, la lumière du pied s'arrête à la vanne · *relâcher* — `outlet` 1 : deux bobines vertes, la ligne de roue pâlit, des tirets vers l'accumulateur ; avec `pump` 1, des tirets à rebours vers le pied · *resserrer* — `inlet` 1, `outlet` 0 : bobines éteintes, tirets du pied vers la roue. Le bloc est un totem : calculateur noir dessus, bloc d'aluminium au milieu, moteur dessous. Ce cadre peut se tenir sur l'établi (le plus lisible) : l'acte 3 a le droit d'y couper pour « Première vanne… Deuxième vanne… il resserre » — l'histoire continue dans l'en-tête (`kmh`, `wkmh`).
- **L'éclaté est sur DEUX étages** (en bas : pneu · jante · couronne et capteur · disque · étrier ; au-dessus : le bloc ouvert · le pédalier) : `VIEW.exploded` est un plan de situation, les noms se disent sur les plans serrés — `VIEW.ringPart` (couronne et capteur), `VIEW.unitOpen` (calculateur, vannes, pompe), `VIEW.caliperOpen`.
- **La couronne en place est derrière le disque** : invisible du côté où l'on filme. « Il surveille tes quatre roues » se montre sur l'établi avec `xray` 1 (`VIEW.whole` : le fil du capteur et ses impulsions veille, `sense` 1) ou sur l'éclaté ; les impulsions suivent `wkmh` (toutes au-dessus de 60, une sur deux au-dessus de 30, une sur quatre au-dessus de 3, aucune à 0) — sur l'établi, donne à `wkmh` la valeur de la démonstration et fais avancer `rolled` de moins de 0,4 m par seconde.
- Sans `xray`, le frein derrière les branches se devine à peine : `xray` ≥ 0,6 dès qu'on parle du frein. `grip` se lit par la fenêtre de l'étrier, ou de dessus (`VIEW.brakeTop`).
- **Toi** : le pied est un ellipsoïde, les jambes de verre se croisent sous le volant — `VIEW.pedal` et `VIEW.hands` sont à leur limite : ne serre pas plus, ne t'y attarde pas plus de deux secondes ; c'est la PÉDALE (pleine) et son tremblement qui portent le plan.
- `steer` : le coin de roue braque de 28 à 30° ; reste sous |`steer`| 0,8 en plan rapproché de la roue (le pneu touche le raccord du flexible). `dive` ne penche que la carrosserie (≈ 2,5°).
- De dessus (`VIEW.top`), voiture et camion à 6 m ne tiennent pas ensemble sous l'en-tête : pour le « et si » à deux, `VIEW.chase`. La roue bloquée de près : `VIEW.lockedFront` ou `VIEW.wheel`.
- `STAGED` pose `rolled: 0` ; `BENCHED` ne fixe ni `kmh`, ni `wkmh`, ni `rolled` : écris-les dans l'état de tes coupes vers l'établi (l'en-tête continue d'afficher l'histoire).
- Ancres — `world.system.A` : `hub, tyre, disc, caliper, ring, sensor, ecu, unit, inlet, outlet, pump, motor, pedal, master, hose` · `world.street.A` : `truck, truckTop, lights, left, wheelFR, wheelRL, wheelRR, head, hands, foot, bumper`.
- La lumière : la roue `fx: -80, fy: 40, fz: -145, fs: 90` · la voiture et le camion `fx: 0, fy: 60, fz: -400, fs: 900` · la pédale `fx: -33, fy: 50, fz: -66, fs: 40` · l'établi `fx: 0, fy: 36, fz: 0, fs: 62` (une pièce de près : `fs` ≈ 30 autour d'elle).
- Rien n'a été vu en mouvement par les décors (roue, marque, tremblement, pompe, tirets, gerbes, vague sous `skid`, pluie) : regarde deux images voisines des plans qui en dépendent.
- Détail et autres poses : `docs/journal/014-street.md`, `014-model.md`.

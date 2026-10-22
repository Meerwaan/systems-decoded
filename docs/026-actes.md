# 026 · Soyouz MS-10 — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **91,1 s**) : le minutage est RÉEL. Tout instant se lit quand même dans le script — un repère d'`episode.json` (`cues` : 97, écrits et vérifiés un par un sur la table mot à mot, image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; une durée s'écrit comme un écart entre deux repères. Les secondes ci-dessous sont là pour te repérer (`npm run script -- 026`). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des squelettes qui construisent, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/025-esp/src/acte*.js` et `017-irm` ; fin : `kit/template/src/fin.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js`. Les poses qui cadrent bien seront dans les journaux des décors (`docs/journal/026-model.md`, `026-launcher.md`, `026-sky.md`) et de l'habillage — pars d'elles ; `VIEW` n'est qu'un point de départ, réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

11 octobre 2018, Baïkonour, deux hommes dans le nez d'une Soyouz-FG. Vers 50 km, deux minutes après le décollage, les quatre propulseurs se séparent ; **l'un (D) ne s'écarte pas, son nez frappe le bloc central**. Ça secoue de gauche à droite ; la fusée tourne ; **personne n'appuie sur rien** : des capteurs qui la sentent tourner donnent l'ordre, « avaria » s'allume au pupitre. **La tour de sauvetage était déjà partie** (≈ 3 s avant) : ce sont **quatre petits moteurs à poudre en haut de la coiffe** qui, ≈ 3 s après la frappe, arrachent la tête (coiffe + module orbital + module de descente) à la fusée. Le module monte encore jusqu'à 93 km, retombe à près de sept fois ton poids, un parachute, une dernière poussée, le sol : vivants. Cinq mois plus tard, les mêmes repartent ensemble (Soyouz MS-12, 14 mars 2019).

- **À ne pas dire, ni montrer comme un fait** (`docs/faits/026-soyouz-ms10.md`) : une vitesse ; la poussée ou la durée de combustion des moteurs ; un g pendant leur poussée ; la seconde exacte de l'avarie ; « la tour a sauvé » ; « la fusée a explosé » (la fusée tombe, se perd, on ne la voit jamais exploser) ; un capteur ou une rotule nommés (« une pièce »).
- **La tour** : on la voit partir, petite, ink — jamais en héroïne. C'est la chute qui la remet à sa place.
- **« Avarie »** : le mot du pupitre est АВАРИЯ (une seule source, B+) ; l'étiquette dit « Avarie ».
- **Personne n'est blessé** ; l'atterrissage est rude mais droit (rien ne dit que le module a basculé : il reste debout).
- Le prochain dossier : **027, la voie de détresse des poids lourds** (aucun fait sourcé : rien qu'un scénario, sans chiffre).

## L'en-tête : l'horloge de l'histoire et l'altitude

- **`clock`** (en grand, `main.js`) : les secondes depuis la frappe de D — « T−0,8 s » pendant que les propulseurs se séparent, « T+0,0 s » sur la frappe, « T+3,0 s » quand les quatre moteurs tirent. Ink avant la frappe, signal à partir d'elle, **veille dès que `fire` > 0,5** (on la tient alors à 3,0 jusqu'à la fin de l'acte 3). **Tu l'écris avec `st`**, en ligne droite (`"none"`) entre deux repères : c'est l'histoire à la seconde. Un rejeu (la scène, l'acte 3) la remet en arrière sur une coupe. Aucune heure du vol, aucun temps après les moteurs.
- **`era`** : 1 au pas de tir avant le décollage — l'horloge dit « 11 oct. 2018 » ; 2 cinq mois plus tard — « 14 mars 2019 », et le titre de l'en-tête devient « Soyouz MS-12 ». 0 partout ailleurs.
- **« Altitude »** : `alt` en km, arrondi — 50 pendant la panne (Borisov), 93 au sommet (dit sur « kilomètres »), 0 au sol, **veille quand tu es posé** (`alt` < 0,001, `era` 0). Tu bouges `alt`, l'en-tête suit (et le ciel aussi : le limbe, la courbe, la steppe).
- Après `toloop`, les deux lisent `FIRST`.

## Le repère (à lire avant de poser une caméra)

- **L'origine est TOI** : la base du module de descente. Les poses visent des points de `plan.js` (`IMPACT`, `FAULT`, `MOTORS`, `CONSOLE`, `HEAD.centre`…). `az` 0 se tient en +z, −90 en −x ; `el` < 0 regarde vers le haut. D est à −x.
- **`tilt`** tourne la fusée (et la tête tant que `apart` < 6 m) autour de l'axe z par l'origine : pour le VOIR, une caméra près de az 0 ou ±180. **`sway`** la jette le long de x (± 150 au plus). **`apart`** : la fusée tombe le long de son axe, la tête se redresse en la quittant. Sur l'établi, `tilt` tourne la colonne autour de son pied.
- **La coupe vers l'établi est EN PLACE** (`benchCut`, `origin` [0, 0, 0]) : la tête reste à la même place de l'image, le ciel disparaît autour. **Elle n'est juste que si `tilt` et `sway` sont à 0** au moment de la coupe (l'établi est droit).
- **Le ciel vient de `alt`** : rien ne voyage. Une montée, c'est `alt` qui croît, `flown` qui avance et `airspeed` > 0 ; une chute, `airspeed` < 0. Un `flown` immobile, c'est le temps arrêté.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`, `{ ...GROUNDED, … }`) : il ne dépend pas de l'acte d'avant ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.
- **Chaque coupe est un raccord** (forme, objet, mouvement), écrit dans les tables. Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant.
- **La grille seconde par seconde** (`docs/recette-actes.md`) : de 10 à 25 s, un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; le mot qui frappe (`D.punch`, un par phrase au plus, jamais sur une coupe ni à moins d'une seconde d'un autre) — mots retenus : « lâche » (hook, avec la frappe), « partir », « frappe », « toi », « tourner », « tirent », « poids », « Vivant » ; `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **Les sons** sont dans `episode.json` → `sfx`, **tous dans les souffles** (jamais sur un mot) : `hit` / `impact` + `crack` sur la frappe, `click` ×4 sur « quatre petits moteurs » (le motif des quatre moteurs, deux fois), `click` sur chaque pièce de l'éclaté, `swish` sur les grands mouvements, `suck` puis `hush` autour de « Alors… on l'ouvre », `beeps` après « avarie », `boom` après « tirent », `heartbeat` après « Vivant », `rewind` après le dernier mot. **Si tu changes un mouvement, garde son son dans le même souffle** ; s'il te manque un son, écris la ligne exacte sous « À changer ailleurs ».
- Mouvements `sine.inOut`, longs ; un recul ou une plongée par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La caméra traverse le verre (la fusée, la coiffe à `skin` 0), jamais un moteur, un siège, un personnage.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 150 un moteur, ≈ 250 le pupitre et l'équipage, ≈ 430 la tête — `HEAD`, ≈ 600 la frappe, ≈ 2 600 la fusée entière, `SIZE` sur l'établi).
- **Couleurs** : `mood` 1 dans le ciel jusqu'à « Un parachute » (le relâchement : 0 là, pas avant), 0 sur l'établi, 0 à l'atterrissage et après ; jamais à mi-chemin plus d'une demi-seconde.
- **L'optique** : `dof` seulement dans les gros plans (les poses de `VIEW` qui étalent `CLOSE` : `strike`, `fault`, `inside`, `console`, `nozzle`, `motorsBench`, `shipBench`, `sensorsBench`) — jamais sur un plan large, l'éclaté, la chute, la première image.
- Toi, de près, es de verre : jamais en très gros plan, jamais une main seule. Le module, à l'atterrissage, est vu entier.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée. S'il t'en manque un, « À changer ailleurs ».
- Les étiquettes sont en capitales : aucune unité à symbole dans un texte neuf. **26 images lues au plus.** Journal : `docs/journal/026-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire de la consigne, jamais dans le dépôt, JAMAIS dans `renders/`.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-tour` (Ta tour de sauvetage / Partie, ink) · `chip-moteurs` (Il te reste / 4 petits moteurs, veille — si l'image ne suffit pas à 270 px) · `#window` (la fenêtre : « Pour te sauver / Une fenêtre », « Quarante secondes, environ », la barre `#window-fill` qui se remplit en `scaleX`, la marque `#window-hit` signal posée à 10 % — la frappe —, les deux bouts `#window-a` « La tour part » et `#window-b` « La coiffe tombe ») · `#rail-seuil` · `chip-avarie` (Au pupitre / Avarie, signal) · `#retitle` (« Ton sauvetage » : « Sur la tour » barré → « Sur la coiffe ») · `chip-piece` (Au montage / Une pièce faussée, signal) · `chip-ms12` (Cinq mois plus tard / Soyouz MS-12, veille) · `#duel` (« Et toi ? » — « Je remonte » ou « Plus jamais » ; le film ne répond jamais) · `#net` · `#next` (Prochain dossier · 027 — « Un poids lourd sans freins, en pleine descente. Au bord de la route, une sortie. » — S'abonner pour l'ouvrir) · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre (« Moteurs à poudre », « Ton vaisseau », « Ton équipier », « Toi », « Capteurs »). Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

## La première image — quatre candidates

**« Ta fusée lâche, en pleine montée. »** : la première image montre la fusée à 50 km, au moment où ses propulseurs se séparent et où D rentre vers le bloc central. Elle se lit sans le son à 270 px et elle bouge dès l'image 1 par son sujet. Celui qui orchestre la tire sur une planche (sur les vrais décors, habillage compris), note chacune sur les six points de `docs/recette-agents.md`, choisit AVANT les actes et colle `POSE0` (et `FIRST` s'il change) dans `world.js`. Prêtes pour un `essais.json` (instant 0,02) :

| | pose | état | les six points |
| --- | --- | --- | --- |
| **(a) la croix, d'en dessous** (`POSE0` provisoire) | `{ "tx": 0, "ty": -2200, "tz": 0, "d": 5200, "az": -28, "el": -38, "fov": 46, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | `FIRST` (ou `"sep": 0.25, "bad": 0.7`) | 1 ✓ les propulseurs s'ouvrent, D rentre · 2 ✓ basse, le corps de la fusée file vers la tête · 3 ≈ D en signal dans la croix, le jet du bloc vers l'objectif · 4 ✓ une fusée vue d'en dessous, ses quatre propulseurs : la croix de Korolev, d'où on ne la voit jamais, toute la largeur · 5 ≈ la tête petite au sommet (ses moteurs à peine) · 6 ✓ les pétales s'ouvrent, le jet coule — **5/6** |
| **(b) le profil sur la courbe de la Terre** | `{ "tx": -200, "ty": -1700, "tz": 0, "d": 9500, "az": -18, "el": -4, "fov": 36, "shift": 140, "side": 0, "roll": -22, "drift": 0, "dof": 0 }` | `"pitch": 22, "sep": 0.25, "bad": 0.7` | 1 ✓ · 2 ≈ à niveau · 3 ✓ le limbe derrière, D signal contre le bloc · 4 ✓ l'image la plus universelle (une fusée, la Terre courbe) mais **mince : moins de 40 % de la largeur** · 5 ✓ la tête lisible en haut · 6 ✓ — **4,5/6** |
| **(c) au ras du coup** | `{ "tx": -150, "ty": -1250, "tz": 0, "d": 1700, "az": -80, "el": -38, "fov": 50, "shift": 150, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | `"sep": 0.25, "bad": 0.95, "impact": 0.3` | 1 ✓ la frappe · 2 ✓ basse, le long du bloc · 3 ✗ la menace est devant, pas derrière · 4 ✗ un nez de propulseur de près n'est pas une fusée en un tiers de seconde · 5 ✓ la tête au point de fuite · 6 ✓ — **4/6** |
| **(d) ta tour qui part** | `{ "tx": 180, "ty": 1500, "tz": 96, "d": 5700, "az": -40, "el": -12, "fov": 46, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` (`VIEW.towerUp`) | `"tower": 12, "litMotors": 4` | 1 ✓ la tour s'envole · 2 ✓ sous le nez · 3 ✗ la frappe est hors champ (✓ si son éclat signal éclaire la coiffe par en dessous) · 4 ≈ une coiffe de Soyouz : les connaisseurs · 5 ✓✓ les quatre moteurs, veille : la promesse · 6 ✓ — **4/6** |

Sur bouchon (planche de l'architecte) : (a) se lit déjà comme une fusée vue d'en dessous ; son sommet passe sous l'en-tête — le ramener plus bas (`shift`, `ty`). (b) est mince. (d) : au-delà de `tower` ≈ 15 m, la tour sort par le haut, derrière l'en-tête.

## 01 · MENACE — `acte1.js` (0 → `tosystem` 19,44)

L'acte part de `POSE0` et de `FIRST`. Deux coupes au plus, toutes deux ici : vers le pas de tir (« avant le décollage ») et retour à 50 km. Le reste en mouvements qui naissent les uns des autres. **Le temps s'arrête** deux fois (l'horloge tient, `flown` aussi, la caméra bouge) : après la frappe du hook, et à la fin de la scène. Il FINIT sur `VIEW.system`, `tilt` 0, `sway` 0.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 → `choc` 0,76 | « Ta fusée lâche, » | `POSE0`, `FIRST` : la croix qui s'ouvre (`sep` 0,12 → 0,35), D qui rentre (`bad` 0,15 → **1 sur `choc`** : contact sur « lâche ») ; `clock` −0,8 → 0 (`"none"`) ; `flown` avance (la fusée monte : les traînées d'air descendent) ; la caméra pousse le long de la fusée — le sujet ne sort pas du cadre (vérifie 0,3 et 0,7 s) |
| `choc` 0,76 → `climb` 1,54 | « …en pleine montée. » | sur `choc` : `impact` 0 → 1 (0,08 s) → 0,35 ; `D.jolt` ; `D.punch(choc)` ; D rebondit (`bad` → 1,25), les trois s'écartent (`sep` → 0,55) ; `tilt` 0 → 2 ; **puis le temps s'arrête** (`clock` tient à +0,3) |
| `climb` 1,54 → `tower` 2,58 | « Et ta tour… » | la caméra monte le long du bloc et du troisième étage jusqu'à la tête (par rapport, `sine.inOut`) : la coiffe pleine, ses moteurs sombres, **le sommet du nez vide** |
| `tower` 2,58 → `gone` 4,02 → `left` 5,14 | « …de sauvetage… vient de partir. » | la caméra lève les yeux du nez vers la tour qui s'en va (`VIEW.towerUp`, `tower` ≈ 12 → 18 : figée dans sa fuite, son jet ink) ; `chip-tour` de `rescue` à `left` − 0,15 (suit `A.tower` ou place fixe) ; `D.punch` sur « partir » |
| `left` 5,14 → `why` 7,38 | « Il te reste quatre petits moteurs. » | la caméra redescend sur le nez (`VIEW.head`, plus près) : `litMotors` 0 → 4 de `four` à `motors4` + 0,4 — un moteur par syllabe, le premier face à nous ; (`chip-moteurs` seulement si les quatre lueurs ne se lisent pas à 270 px) |
| `why` 7,38 → `topad` 8,16 | « Et ce qui la fait lâcher… » | la caméra plonge le long de la fusée (par rapport) vers le haut de D, là où il a frappé : `impact` 0,35 au bord du cadre |
| `topad` 8,16 → `toscene` 10,09 | « …était là avant le décollage. » | **coupe 1** (raccord : la même pièce, à la même place de l'image) : le pas de tir à Baïkonour, avant le lancement (`{ ...GROUNDED, era: 1, clock: FIRST.clock, fault: 0 }`, `VIEW.fault`) — le haut de D intact, sa jonction ; **sur « décollage »** (`before` 8,90) : `fault` 0 → 1 — la pièce s'allume, tordue ; l'en-tête : « 11 oct. 2018 », 0 km ; recul lent (on voit le pas de tir) |
| `toscene` 10,09 → `booster` 11,76 | « À cinquante kilomètres du sol, » | **coupe 2** (raccord : la fusée à la même place de l'image, du sol à 50 km) : `{ ...STAGED, clock: -1.2, sep: 0, bad: 0, boost: 1 }`, `VIEW.stack` large — le limbe sous elle, le noir au-dessus ; l'en-tête : T−1,2 s, 50 km ; `flown` avance |
| `booster` 11,76 → `hit` 13,48 | « un propulseur se détache mal. » | la caméra fond sur les propulseurs (vers `VIEW.cross`) : `boost` 1 → 0 (leurs jets meurent : la séparation), `sep` 0 → 0,4, **sur « détache »** (`badly` 12,37) `bad` 0 → 0,9 (D rentre) ; `clock` → −0,1 |
| `hit` 13,48 → `shake` 14,64 | « Il frappe ta fusée. » | au plus près (`VIEW.strike`) : **sur « frappe »** (13,58) `bad` → 1, `impact` 1, `clock` 0, `D.jolt`, `D.punch` |
| `shake` 14,64 → `above` 16,28 | « Ça secoue, de gauche à droite. » | recul par rapport vers la fusée entière vue de az ≈ 0 (`VIEW.stack`) : `sway` → −120 sur « gauche » (`swayL`), → +120 sur « droite » (`swayR`), → 0 ; `tilt` 2 → 6 ; D tombe (`bad` → 2), les trois aussi (`sep` → 1) ; `clock` → +1,2 |
| `above` 16,28 → `justcoiffe` 18,08 | « Au-dessus de toi, plus de tour… » | la caméra monte à la tête (`VIEW.inside` puis vers le nez) : la coiffe passe au verre (`skin` 1 → 0,15) — toi et ton équipier dans vos sièges (`litYou` 0,4) ; **sur « tour »** (17,54) elle est au sommet : la place vide de la tour, le noir au-dessus ; **le temps s'arrête** (`clock` tient à +1,2) |
| `justcoiffe` 18,08 → `tosystem` 19,44 | « …juste la coiffe. » | `skin` → 1 : la coiffe, ses quatre moteurs (`litMotors` 4, faibles) — sur « coiffe » (18,46) le nez entier dans le cadre |
| `tosystem` 19,44 → `tobench` 20,22 | *(silence avant « Alors… »)* | `shell` → 0,25 (la fusée s'efface), `litYou` → 0, `tilt` → 0, `sway` → 0, `fs` → `HEAD.size` ; la caméra se pose sur `VIEW.system` : la tête seule, pleine. C'est de là que l'acte 2 coupe |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` 19,44 → `tozero` 42,95)

L'établi : la tête debout sur sa section de fusée en verre, sur son halo. `mood` 0. « Alors… on l'ouvre » est seul dans son plan. L'en-tête ne bouge pas (+1,2 s, 50 km).

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` 20,22 → `explode` 20,36 → `top` 21,74 | « Alors… on l'ouvre. » | `benchCut` depuis `VIEW.system` (`origin` [0, 0, 0] : EN PLACE, le ciel disparaît autour de la tête), état `{ ...BENCHED, litMotors: 4 }` (rien ne saute) ; **sur « on »** : `explode` 0 → 1 (≈ 0,9 s, `power2.out`) — la coiffe s'ouvre en coquillage, le nez et ses moteurs montent, le module orbital monte, `litMotors` → 0 ; recul par rapport vers `VIEW.exploded` |
| `top` 21,74 → `below` 24,26 | « Tout en haut : quatre petits moteurs à poudre. » | la caméra monte au nez (`VIEW.motorsBench`) : `litMotors` 0 → 4 de « quatre » (22,37) à « moteurs » (23,12) — un par un ; `co.add` « Moteurs à poudre » sur `motors` |
| `below` 24,26 → `lower` 27,58 | « Juste dessous : ton vaisseau, ton équipier, toi. » | la caméra descend dans la coiffe ouverte (`VIEW.shipBench`) : sur « vaisseau » (25,04) `litShip` 1 ; sur « équipier » (25,84) `litMate` 0,6 ; **sur « toi »** (26,76) `litYou` 1 — `co.add` « Toi » (ou `chip` fixe), `D.punch` |
| `lower` 27,58 → `turn` 30,06 | « Et plus bas, sur la fusée, des capteurs… » | `litShip`, `litMate`, `litYou` → 0 ; plongée par rapport le long de la section de verre (`VIEW.sensorsBench`) ; sur « capteurs » (29,08) : `litSensors` 1, `sense` 0,4 ; `co.add` « Capteurs » |
| `turn` 30,06 → `torepos` 30,91 | « …qui la sentent tourner. » | **sur « tourner »** (30,16) : la colonne tourne sur son pied (`tilt` 0 → 7, 0,6 s, puis reste) et `sense` 1 — les lampes, les impulsions qui montent les fils vers la tête ; `D.punch`. **Couverture** : `eclate$` (30,40) — l'éclaté encore ouvert (`explode` reste 1 jusqu'à `torepos`), tout allumé : à proposer par l'acte 2 (repère, pose `el` ≥ 28, état) |
| `torepos` 30,91 → `window` 32,58 | « Pour te sauver, ces moteurs n'ont qu'une fenêtre : » | `explode` 1 → 0, `tilt` → 0, `sense`, `litSensors` → 0 ; recul vers `VIEW.whole` cadré sur la tête ; `tower` `TOWER_GONE` → 0 pendant le recul (la tour revient sur le nez, ink : un souvenir) ; **sur « fenêtre »** (32,68) `#window` entre (zone haute), barre vide |
| `window` 32,58 → `forty` 35,65 | « de la tour qui part à la coiffe qui tombe. » | **sur « part »** (34,24) : `tower` 0 → 30 (la tour quitte le nez vers le haut, sort du cadre) et la barre commence à se remplir (`#window-a` s'allume) ; **sur « tombe »** (35,16) : `shed` 0 → 1 (la coiffe s'ouvre et tombe, le nez et ses moteurs avec elle) et la barre est pleine (`#window-b`) |
| `forty` 35,65 → `lets` 37,46 | « Quarante secondes, environ. » | `#window-span` s'allume ; dans l'établi, on revient dans la fenêtre : `shed` → 0 (la coiffe est là), la tour partie |
| `lets` 37,46 → `toseuil` 39,51 | « Et ta fusée lâche… pile dans cette fenêtre. » | **sur « lâche »** (37,56) : `#window-hit` tombe sur la barre à 10 % (signal) ; **sur « pile »** (38,32) : `litMotors` 4 (prêts, veille) ; `#window` sort à `toseuil` − 0,15 |
| `toseuil` 39,51 → `watch` 41,78 → `tozero` 42,95 | « Abonne-toi : ces quatre petits moteurs… regarde-les tirer. » | `followCall` (`from` `toseuil`, `to` `seuil$` + 0,15) ; **le film ne s'arrête pas** : la caméra est déjà en route vers une tuyère (`VIEW.nozzle`) ; sur « regarde-les » elle est devant elle, la lueur veille au fond du col |

## 03 · RÉPONSE — `acte3.js` (`tozero` 42,95 → `toverdict` 64,23)

En coupes, un plan par souffle. On rejoue la panne — avec le système. `mood` 1 jusqu'à « Un parachute ». L'horloge : `clock` −0,4 → 0 sur « frappe », puis **de « frappe » à « tirent », 0 → 3,0 en ligne droite** (`st(t.strike, t.trigger - t.strike, { clock: 3 }, "none")`) ; elle tient à 3,0, veille.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` 42,95 → `spin` 44,70 | « Le propulseur frappe. » | **coupe** (raccord : de la tuyère de l'établi au nez de D qui fond sur le bloc) : `VIEW.strike`, `{ ...STAGED, clock: -0.4, sep: 0.45, bad: 0.85, boost: 0 }` ; sur « frappe » (43,64) : `bad` 1, `impact` 1, `D.jolt` |
| `spin` 44,70 → `nobody` 45,38 | « Ta fusée tourne. » | **coupe** : la fusée entière de az ≈ 0 (`VIEW.stack`) : `tilt` 0 → 16 (`sine.in`) sur « tourne » — sa traînée reste, elle s'en écarte ; les capteurs s'allument dans le verre (`sense` 1) |
| `nobody` 45,38 → `console` 46,82 | « Personne n'appuie sur rien. » | **coupe** : dedans (`VIEW.inside`, `skin` 0) : vous deux secoués (`sway` ±), vos mains immobiles, le pupitre au-dessus — rien n'est touché |
| `console` 46,82 → `toreponse` 49,53 | « Au pupitre, un mot s'allume : avarie. » | **coupe** (ou poussée) : le pupitre (`VIEW.console`) ; **sur « avarie »** (48,81) : `avaria` 0 → 1 — АВАРИЯ, signal ; `chip-avarie` de `avarie` à `three` − 0,15 |
| `toreponse` 49,53 → `trigger` 51,23 | « Trois secondes. Les quatre moteurs… » | **coupe** : le nez et ses quatre moteurs (`VIEW.head`, plus près) : `litMotors` 4 ; l'horloge arrive à T+3,0 |
| `trigger` 51,23 → `torn` 51,90 | « …tirent. » | **sur « tirent »** : `fire` 0 → 1 (0,15 s, `power2.out`) — les quatre jets veille ; `D.jolt`, `D.punch` ; l'horloge passe au veille |
| `torn` 51,90 → `pressed` 53,14 | « Ils t'arrachent à la fusée. » | **coupe** : `VIEW.torn` : `apart` 0 → 40 (`power2.in`) — la tête s'en va sur ses quatre jets, la fusée tombe dessous en tournant encore (`tilt` 16 → 40), sa traînée reste ; `alt` commence à monter |
| `pressed` 53,14 → `climbs` 54,30 | « Plaqué dans ton siège, » | **coupe** : dedans (`VIEW.inside`, `skin` 0, les jets visibles à travers le verre) : `press` 0 → 1 sur « Plaqué » |
| `climbs` 54,30 → `fall` 57,26 | « tu montes encore… jusqu'à 93 kilomètres. » | **coupe** : le module seul au-dessus de la courbe de la Terre (`VIEW.apogee`) : `fire` → 0, `free` 0 → 1 (la coiffe et le module orbital s'en vont vers le haut), `apart` → 400, `press` → 0 ; `alt` 50 → **93 sur « kilomètres »** (56,24) ; `airspeed` → 0 au sommet |
| `fall` 57,26 → `tosol` 59,77 | « Puis tu retombes : près de sept fois ton poids. » | **coupe** : `VIEW.fall` : `airspeed` 0 → −1, `heat` 0 → 1 (la gaine signal), `alt` 93 → 35 ; **sur « poids »** (59,09) : `press` 1, `D.punch` |
| `tosol` 59,77 → `retro` 61,24 | « Un parachute. » | **coupe** : `VIEW.chute` : `{ alt: 8, heat: 0, airspeed: -0.25, chute: 0.35 }` → **sur « parachute »** (59,98) `chute` 1 ; **`mood` 1 → 0** : le relâchement ; `alt` 8 → 0,004 |
| `retro` 61,24 → `ground` 62,32 | « Une dernière poussée… » | **coupe** : `VIEW.ground` (bas, la steppe ; la voilure hors cadre en haut) : **sur « poussée »** (61,34) `retro` 0 → 1 → 0 (≈ 0,5 s) — l'éclat, la poussière |
| `ground` 62,32 → `toverdict` 64,23 | « …et tu touches le sol. Vivant. » | `alt` → 0 sur « touches » (62,42) : le module posé ; **sur « Vivant »** (63,34) : `litYou` 1 (veille, à travers le verre) ; l'en-tête : 0 km, veille ; `D.punch` |

## Fin — `fin.js` (`toverdict` 64,23 → 91,1)

**L'ordre : chute → ce qui est dû + commentaire → like → prochain dossier → boucle.** Plus rien du sujet ne revient après l'annonce. Compare ta dernière image à la première (`look` aux deux instants) ; `D.commit` prévient dans la console si un nombre n'est pas revenu.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` 64,23 → `towergoes` 65,46 | « Voilà son secret : » | **coupe** (raccord : le module posé → la tête sur l'établi, même place de l'image) : `{ ...BENCHED, tower: 0 }`, `VIEW.whole` sur la tête, **la tour sur son nez** ; `retitle` entre sur `secret` + 0,1 : « Ton sauvetage / Sur la tour » |
| `towergoes` 65,46 → `deny` 67,23 | « quand ta tour s'en va, » | sur « va » (65,96) : `tower` 0 → 30 — la tour s'envole, sort par le haut |
| `deny` 67,23 → `stays` 68,26 | « ton sauvetage ne part pas avec elle. » | `retitle` barré sur « pas » (`deny`) |
| `stays` 68,26 → `tocta` 70,15 | « Il reste… sur la coiffe. » | la caméra sur le nez : `litMotors` 0 → 4 sur « reste… » ; « Sur la coiffe » sur `verdict` − 0,05 ; `D.verdict(verdict)` ; titre sorti à `tocta` − 0,42 |
| `tocta` 70,15 → `cause` 71,42 | « Et ce qui l'a fait lâcher ? » | **coupe** (raccord : la tête → la même fusée, entière, sur son pas de tir) : `{ ...GROUNDED, era: 1 }`, `VIEW.pad` → poussée vers le haut de D |
| `cause` 71,42 → `fivemonths` 73,38 | « Une pièce faussée, au montage. » | `VIEW.fault` : **sur « faussée »** (71,80) `fault` 0 → 1 — la pièce, tordue, signal ; `chip-piece` de `faulty` à `fivemonths` − 0,15 |
| `fivemonths` 73,38 → `again` 75,38 | « Cinq mois plus tard, ton équipier et toi… » | **coupe** : le même pas de tir, `era` 2 (« 14 mars 2019 », le titre « Soyouz MS-12 »), `fault` 0 ; dedans à travers le verre (`VIEW.inside`, `skin` 0) : vous deux côte à côte, `litYou` et `litMate` 0,6 ; `chip-ms12` de `fivemonths` à `together` − 0,15 |
| `again` 75,38 → `ask` 76,94 | « …vous repartez. Ensemble. » | **coupe** : `VIEW.pad` large : **sur « repartez »** (75,48) `burn`, `boost` 0 → 1, `alt` `PAD.alt` → 0,15 (la fusée quitte le pas de tir) ; « Ensemble » : elle monte |
| `ask` 76,94 → `tolike` 80,38 | « En commentaire : toi, tu remontes… ou plus jamais ? » | la caméra suit la fusée qui monte (ou reste sur elle, levée) ; `duelCall` (`from` `ask`, `aAt` `upagain`, `bAt` `never`, `to` `tolike` − 0,3, `toneA` "veille", `toneB` "signal") — **la réponse n'est jamais tapée** ; le `#duel` est sorti avant que `#net` entre |
| `tolike` 80,38 → `toabo` 83,25 | « Like : envoie ce dossier plus haut que ta fusée. » | **coupe** : le plus haut du film — le module seul au sommet de son arc, la courbe de la Terre dessous (`VIEW.apogee`, `{ ...STAGED, alt: 93, free: 1, apart: 3000, tower: TOWER_GONE, burn: 0, boost: 0, airspeed: 0, mood: 0 }`) ; `likeCall` (`from` `tolike` + 0,12, `to` `like$` + 0,12) |
| `toabo` 83,25 → `toloop` 88,72 | « Prochain dossier : un poids lourd sans freins, en pleine descente. Et au bord de la route… une sortie. » | **coupe** : la steppe la nuit, le module posé au premier plan (`alt` 0, `litYou` 0,3), au loin vers az 25 : `truck` 0 → 0,8 de `truck` à `road` (les phares descendent la pente), 0,8 → 1 sur `exit` (la bretelle, veille) ; `nextFile` (`showAt` `toabo` + 0,06, `factAt` `truck`, `hideAt` `toloop` − 0,38, chevrons de `toabo` + 0,1 à `abo$` + 0,15) — **la voix ne redit pas « abonne-toi »** |
| `toloop` 88,72 → `rewind` 90,06 → la fin | « Pour quand tout lâche. Comme… » | **coupe** : 50 km, la fusée entière, les propulseurs ENCORE attachés (`{ ...STAGED, clock: FIRST.clock, sep: 0, bad: 0, boost: 1, tower: FIRST.tower }`), d'un peu plus loin que `POSE0` ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène tout à `FIRST` et `POSE0` : la croix commence à s'ouvrir sur la dernière image — c'est la première |

## Ce qui reste fragile (à regarder en premier sur les planches)

- **Toi dans le module** : deux personnages de verre dans une coque de verre, sous une coiffe de verre. Ce sont les sièges pleins et le pupitre qui doivent porter le plan ; si « dedans » ne se lit pas à 270 px, `litYou` / `litMate` et un cadre plus serré.
- **La tête est haute et mince** dans un cadre où le sujet vit entre y 440 et 1160 : poses de trois quarts, un peu en plongée ou en contre-plongée ; jamais la colonne de l'établi entière sauf pour la faire tourner.
- **La croix** : quatre cônes de verre qui s'ouvrent peuvent se lire comme des traits — leurs jets mourants et la bouffée de gaz à leur nez aident.
- **Le temps** : l'horloge rejoue deux fois (scène, acte 3) ; une coupe la remet en arrière. Si ça se lit comme une faute, la scène peut s'arrêter avant la frappe et l'acte 3 la jouer seul (à dire à celui qui orchestre).
- **L'ellipse de la descente** : de 35 km à 8 km sur la coupe du parachute ; l'en-tête saute. Coupe franche, jamais un fondu.
- `D.loop` doit ramener `sep` et `bad` à `FIRST` : ils partent de 0 sur la coupe de la boucle et montent — jamais à reculons.

# 029 · Airbag d'avalanche — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **83,8 s** ; « Alors… on l'ouvre » vient d'une reprise, déjà montée par `audio/picks.json`) : le minutage est RÉEL. Tout instant se lit quand même dans le script — un repère d'`episode.json` (`cues` : 99, écrits et vérifiés un par un sur la table, image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; une durée s'écrit comme un écart entre deux repères. Les secondes ci-dessous sont là pour te repérer (`npm run script -- 029`). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des squelettes qui construisent, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/025-esp/src/acte*.js` et `017-irm` ; fin : `kit/template/src/fin.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js`. Les poses qui cadrent bien seront dans les journaux des décors (`docs/journal/029-pente.md`, `029-model.md`) et de l'habillage — pars d'elles ; `VIEW` n'est qu'un point de départ, réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

Hors-piste, une pente de plaque. Tu la déclenches toi-même : elle casse sous tes skis et t'emporte. Si rien n'agit : elle te roule, t'avale — enseveli, une dizaine de minutes (ordre de grandeur). Sur ta bretelle, une poignée : tu tires, un câble perce une cartouche de gaz, le gaz traverse un venturi qui aspire l'air autour, **UN ballon** d'au moins 150 L sort de ton dos en quelques secondes. Dans la neige qui coule, les gros blocs remontent, les petits s'enfoncent ; avec le ballon tu fais presque le triple de ton volume, la neige passe sous toi, **tu remontes vers la surface**.

- **À ne pas dire, ni montrer comme un fait** : « flotte », « flottabilité » (rien qui flotte comme un bouchon : on remonte parce qu'on est gros parmi des grains qui coulent ; le mot n'existe à l'écran que **barré**, dans la chute) ; une marque ; une vitesse d'avalanche ; **deux ballons** ; « ta tête sort » (le ballon arrive à la surface, toi tout près : jamais une garantie) ; une profondeur, une pente, une épaisseur chiffrées ; « 15 » ou « 18 minutes ».
- **La poignée est sur la bretelle gauche** (le côté dépend du modèle ; la voix ne le dit pas, l'image en montre un).
- Personne n'est blessé à l'image : enseveli, tu es recroquevillé sous la neige, sans plus — la vision ne dure que la phrase.
- Le prochain dossier : **030, la prise de terre** (« un fil vert-jaune, sous ta maison ») — sans chiffre, sans vert-jaune à l'image (trois couleurs).

## L'en-tête

- **Le chrono** (`main.js`) lit `sec` — les secondes de l'histoire depuis la cassure, « T+m:ss » : **T+0:00 sur l'image 0** (la cassure court déjà). **Tu ne l'écris jamais : tu bouges `sec`.** Temps réel pendant l'acte 1 (`sec` = l'instant du film, en ligne droite) ; **la vision** : pendant « tu as une dizaine de minutes », `sec` file vers 600 (T+10:00, `power2.in`) — puis la coupe de « Sur ta bretelle » le RAMÈNE à l'instant d'avant la vision (≈ 13,5) ; tenu pendant l'acte 2 (`HANDOFF.sec` 17) ; l'acte 3 reprend en temps réel depuis 17 ; la fin le tient. Après `toloop`, il lit `FIRST` (0). Couleur (automatique) : **signal tant que tu es sous la neige** (`bury` > 0,5), **veille quand le ballon est plein et que tu es près de la surface** (`bag` > 0,95, `bury` < 0,3), encre sinon.
- **« Ballon »** : `bag` × 150 L (le minimum de la norme, le seul volume que dit la voix). 0 L tant qu'il est plié (encre pâle), veille dès qu'il se gonfle. Il monte sur « en quelques secondes » à l'autopsie (repos), retombe à 0 avec le ballon qui se replie (« Encore faut-il… »), remonte à l'acte 3.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Le repère est le tien** (`plan.js`) : tu restes à l'origine de la pente, la montagne défile vers l'amont de `travel` (mètres) ; **`travel` ne recule jamais** et file en ligne droite (`"none"`) pendant que la neige t'emporte ; une coupe peut le POSER. `rush` suit son allure (1 quand `travel` file, 0 quand il est tenu : la neige qui vole s'arrête avec lui). `roll` s'accumule (un tour = la même pose).
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.
- **Chaque coupe est un raccord** (forme, objet, mouvement) : on coupe sur la pièce que la phrase vient de nommer, ou dans le sens du mouvement. Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont 0,12 s avant). Rien d'un plan ne déborde sur le suivant.
- **La grille seconde par seconde** (`docs/recette-actes.md`) : la première demi-seconde bouge par son sujet (la cassure, les traînées) ; de 10 à 25 s **un changement toutes les 2 à 3 s** (un geste, une coupe, une étiquette, un mouvement de caméra), **aucune plage lente de 2 s** ; les mots qui frappent : `D.punch(t.mot, 0.06)`, **un par phrase au plus**, jamais sur une coupe, jamais deux à moins d'une seconde — ceux proposés sont dans les tables (★). `D.captionStyle({ hit: 0.25 })` est appelé une fois (acte 1).
- **Les sons sont posés** (`episode.json` → `sfx`, tous dans les souffles de la voix, jamais sur un mot) : n'en ajoute que dans un souffle, et écris-le sous « À changer ailleurs ».
- **« Alors… on l'ouvre. »** est seul dans son plan, dans un quasi-silence (`suck` puis `hush`) ; l'éclaté s'ouvre SUR « on ».
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête (sans `--bare`).
- Mouvements `sine.inOut`, longs ; un recul ou une plongée par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La caméra traverse la neige de verre et la montagne aux rayons X, **jamais toi, le sac, un gros bloc**. Ce que la caméra frôle est invisible, pas seulement éteint.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 40 la poignée, ≈ 120 le sac sur toi, ≈ 300 toi, ≈ 600 la coupe, ≈ 4 000 le large ; `SIZE` sur l'établi).
- **Couleurs** : `mood` 1 sur la pente jusqu'à « surface », 0 sur l'établi et après. Jamais à mi-chemin plus d'une demi-seconde.
- Toi, de près, es de verre : jamais en très gros plan, jamais la main seule (la main SUR la poignée, avec la bretelle et le sac).
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée. S'il t'en manque un, écris-le sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf. **26 images lues au plus.** Journal : `docs/journal/029-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire de la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-enseveli` (Enseveli / Une dizaine de minutes, signal) · `#rail-seuil` · `#retitle` (Ton sac : « Te fait flotter » barré → « Te rend gros ») · `chip-cinq` (Avalanches étudiées / Un sac sur cinq, signal) · `chip-tire` (Le plus souvent / Poignée pas tirée, signal) · `#duel` (Toi, en hors-piste… : « Avec airbag » ou « Sans », À toi · en commentaire) · `#net` · `#next` (Prochain dossier · 030 — « Un fil vert-jaune, sous ta maison. Inutile… jusqu'au jour du défaut. » — S'abonner pour l'ouvrir) · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre : « Poignée », « Câble », « Cartouche », « Venturi », « Ballon ». Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

## La première image — quatre candidates

**« Sous tes skis, la neige casse. »** La première image montre déjà ça : la cassure signal qui court sous tes skis, la plaque qui cède, la neige qui jaillit en traînées. Elle se lit sans le son à 270 px, et bouge dès l'image 1 **par son sujet**. Celui qui orchestre les tire sur le vrai décor (après le décorateur), à 0,02 / 0,3 / 0,7 s, et colle `POSE0` dans `world.js` avant les actes. Notées sur les six points de `docs/recette-agents.md` (1 un événement en cours · 2 une perspective basse · 3 la menace derrière le sujet · 4 une forme reconnue vue d'où on ne la voit jamais, 40 % de la largeur · 5 le système déjà là · 6 le sujet bouge dès l'image 1) :

| | pose (prête pour un `essais.json`) | 1 | 2 | 3 | 4 | 5 | 6 | le risque |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **(a) sous tes skis** (`POSE0` provisoire) | `{ "tx": 0, "ty": 60, "tz": 10, "d": 300, "az": 12, "el": -34, "fov": 52, "shift": 60 }` | ✓ la cassure court | ✓ au ras, en aval, on regarde vers l'amont | ✓ la plaque qui part, la poudre en amont derrière toi | ✓ un skieur vu d'en dessous, spatules vers l'objectif | ✓ la poignée veille sur ta bretelle | ✓ la cassure fonce vers la caméra, les traînées | toi de face en grand : un mannequin si la lumière est plate |
| (b) de dos | `{ "tx": 0, "ty": 90, "tz": 60, "d": 260, "az": -170, "el": 19, "fov": 50, "shift": 80 }` | ✓ | ~ derrière toi, un peu haut : la pente plonge devant | ✓ la cassure et le vide devant toi | ✗ un skieur de dos, vu cent fois | ~ le sac, mais pas la poignée (elle est devant) | ✓ | une photo de vacances |
| (c) la cassure de côté | `{ "tx": 0, "ty": 90, "tz": 0, "d": 355, "az": 93, "el": -9, "fov": 46, "shift": 60 }` | ✓ | ✓✓ au ras, la cassure file vers l'objectif | ~ la cassure DEVANT toi, la plaque derrière | ~ toi de profil, plus petit (≈ 25 %) | ✓ la poignée, ton côté gauche | ✓✓ la cassure fonce sur l'objectif | le sujet trop petit, la cassure vole la vedette |
| (d) sous la neige | `{ "tx": 0, "ty": 10, "tz": 10, "d": 215, "az": 38, "el": -63, "fov": 54, "shift": 0 }` | ✓ | ✓✓ dans le vieux manteau, vers le haut | ~ la couche fragile qui cède entre toi et l'objectif | ✓✓ des skis vus d'en dessous, à travers la neige | ✗ la poignée minuscule | ✓ | illisible à 270 px si la neige de verre brouille |

**Ma recommandation : (a), puis (c).** (a) coche les six ; (c) a le meilleur mouvement mais un sujet petit. Le décor qui gagne doit avoir, derrière toi, quelque chose de signal qui s'y découpe (la poudre qui monte de la cassure, la marche de la plaque) — sinon la (a) perd son point 3.

## 01 · MENACE — `acte1.js` (0 → `tobench` 18,46)

L'acte part de `POSE0` et de `FIRST` ; en UN mouvement, deux coupes : la vision (« Enseveli ») et le retour (« Sur ta bretelle »). `sec` = l'instant du film (`st(0, t.toburied, { sec: t.toburied }, "none")`), sauf pendant la vision. Il FINIT sur `VIEW.strap` (rempli par `world.js` : la poignée posée sur `HANDOFF`) à l'état `{ ...STAGED, ...HANDOFF }` — l'acte 2 coupe de là.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 → `choc` 1,72 | « Sous tes skis, la neige… » | `POSE0`, `FIRST` : la cassure court déjà (`crack` 0,12 → 1 en ligne droite jusqu'à `choc`+0,3), traînées de neige (`rush` 0,2 → 0,5) ; la caméra pousse doucement (le sujet bouge par lui-même : pas de rampe qui le sorte du cadre) |
| `choc` 1,72 → `glisse` 2,64 | « …casse. » ★ `casse` | **sur « casse »** : `slab` 0 → 1 (`power2.out`, 0,3 s) — la plaque se fend en blocs sous toi ; `D.punch(t.choc, 0.06)` ; la marche de la cassure s'ouvre derrière tes talons |
| `glisse` 2,64 → `toi0` 3,64 | « La pente part avec toi. » | `travel` file (≈ 1,5 m/s de film au départ, puis plus, `"none"` par tronçons), `rush` → 0,7 ; la caméra recule et pivote vers ta droite (vers `VIEW.side`, par rapport) : toute la plaque qui glisse avec toi dessus, la marche qui s'éloigne en amont, les crêtes |
| `sauver` 4,11 → `ballon0` 5,32 | « Ce qui peut te sauver ? » | la caméra tourne vers ta gauche et descend vers ta poitrine : la bretelle, la poignée veille (`litHandle` 0,35 → 0,8) |
| `ballon0` 5,32 → `sauf` 7,79 | « Un ballon, sorti de ton dos en quelques secondes. » ★ `ballon` | **sur « ballon »** : `promise` 0 → 1 (0,5 s) — le contour veille du ballon plein autour de ta tête : la promesse, pas le vrai ; la caméra recule pour le voir entier autour de toi (le contour grandit sur « sorti de ton dos » : ce que la phrase dit). `travel` continue de filer |
| `sauf` 7,79 → `promesse$` 9,80 | « Sauf si ta main… ne tire pas. » ★ `tire` | `promise` → 0 sur « Sauf » (il se dissout) ; la caméra vient sur ta main gauche, ouverte près de la poignée (`reach` 0 → 0,3 sur « main », puis elle **retombe** sur « ne tire pas » : `reach` → 0) ; `litHandle` → 0,35 |
| `promesse$` 9,80 → `roule` 11,70 | « La neige t'emporte. » | **porte de la scène** (le `hit` est dans le souffle) : `fall` 0 → 1 sur « t'emporte » (`power2.in`, 0,6 s), `flow` 0 → 0,7, `rush` 1, `travel` plus vite ; la caméra plonge bas, en aval à ta droite (`VIEW.ride`) : la masse qui fonce vers l'objectif, toi couché dedans |
| `roule` 11,70 → `avale` 12,23 | « Elle te roule, » | `roll` 0 → 1 (un tour, `sine.inOut`, 0,9 s) ; la caméra suit sans tourner avec toi |
| `avale` 12,23 → `toburied` 12,89 | « …elle t'avale. » ★ `t'avale` | **sur « t'avale »** : `bury` 0 → 0,7 (`power2.in`) — la surface se referme sur toi ; `D.punch` |
| `toburied` 12,89 → `minutes` 14,90 | « Enseveli, tu as une dizaine de minutes. » | **coupe 1 — la vision** (raccord : la même masse, de côté, figée) : `VIEW.buried`, `{ ...STAGED, flow: 1, rush: 0, travel: tenu, roll: 1, bury: 1 }` — la neige prise, toi recroquevillé dessous, la surface loin au-dessus ; le `hush` assourdit l'habillage ; **`sec` file vers 600** sur « une dizaine de minutes » (de `dizaine` à `minutes$`, `power2.in`) ; `chip-enseveli` de `enseveli` à `toback` − 0,15 ; la caméra recule lentement (par rapport) |
| `toback` 14,89 → `poignee` 15,98 | « Sur ta bretelle, » | **coupe 2 — retour** (raccord : de toi sous la neige à toi dans l'écoulement, même côté) : `sec` revient à ≈ 13,5 (`now`), `{ ...STAGED, flow: 0.9, rush: 1, travel: comme avant la vision, roll: 1, bury: 0.3, fall: 0.55 }` ; la caméra plonge vers ta bretelle (vers `VIEW.strap`, par rapport) |
| `poignee` 15,98 → `tire` 16,66 | « …une poignée. » | **sur « poignée »** : `litHandle` → 1 (une lumière qui a un endroit) ; `reach` 0 → 1 : ta main monte vers elle |
| `tire` 16,66 → `tobench` 18,46 | « Tire. » ★ `Tire` | **sur « Tire »** : la main se ferme sur la poignée — **elle ne tire pas** (`pull` reste 0 : le tirage, c'est l'acte 3) ; le temps s'arrête : `rush` → 0, `travel` tenu ; la caméra se pose sur `VIEW.strap` à `HANDOFF` exact (`sec` 17) — le `suck` coupe la respiration |

## 02 · AUTOPSIE — `acte2.js` (`tobench` 18,46 → `tozero` 39,92)

L'établi : le sac seul, sur son halo. `mood` 0. `sec` tenu (17).

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` 18,46 → `explode` 18,60 → `ouvre$` 19,00 | « Alors… on l'ouvre. » | `benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.strap, origin: world.handoff.origin, state: { ...BENCHED, upright: 0, litHandle: 1 } })` — **la coupe est EN PLACE et AU MÊME ANGLE** (la pente disparaît autour du sac, le halo monte dessous) ; **sur « on »** : `explode` 0 → 1 (≈ 0,9 s, `power2.out`) et `upright` 0 → 1 (le sac se redresse en s'ouvrant), recul par rapport vers `VIEW.exploded`. Les clics des pièces sont dans le souffle qui suit (19,0 → 20,1) |
| `epoignee` 20,13 → `perce` 21,69 | « Ta poignée tire un câble. » | la caméra vient à la poignée (`VIEW.handleBench`, en éclaté) ; `litHandle` 1, `co.add` « Poignée » ; **sur « tire »** (`etire` 20,49) : `pull` 0 → 1 — la poignée part, la tête de lumière court le câble ; « Câble » sur `cable` |
| `perce` 21,69 → `gaz2` 23,25 | « Il perce une cartouche de gaz. » ★ `perce` | la caméra suit le câble jusqu'à la cartouche (`VIEW.cartBench`) ; **sur « perce »** : `pierce` 0 → 1 (l'étincelle, puis plus rien) ; `litCart` 1, `co.add` « Cartouche » sur `cartouche` |
| `gaz2` 23,25 → `aspire` 24,89 | « Le gaz file dans un venturi… » | `gas` 0 → 1 sur « file » : les têtes veille montent de la cartouche ; la caméra les suit jusqu'au venturi (`VIEW.venturiBench`) ; `litVenturi` 1, `co.add` « Venturi » sur `venturi` |
| `aspire` 24,89 → `derriere` 26,33 | « …qui aspire l'air autour. » ★ `aspire` | **sur « aspire »** : `draw` 0 → 1 — l'air ink converge de tout autour vers les prises (plus de têtes ink que veille) ; la caméra recule un peu pour voir d'où il vient (« autour ») |
| `derriere` 26,33 → `repos` 28,21 | « Et derrière, un ballon plié. » | la caméra monte au ballon plié (`VIEW.bagBench`) ; `litBag` 1, `co.add` « Ballon » sur `plie` ; `litCart`, `litVenturi` → 0,3. Couverture : `eclate$` (27,93) — à proposer (état : `explode` 1, `litBag` 1, `gas` 1, `draw` 1) |
| `repos` 28,21 → `raspire` 30,37 | « Le gaz ne remplit pas le ballon tout seul : » | `explode` → 0 pendant un recul vers `VIEW.bagFull` (le sac se rassemble), `gas` 1 tenu (un seul filet veille) ; sur « seul » (29,57) : le filet veille seul, mince |
| `raspire` 30,37 → `cent` 32,61 | « il aspire l'air autour de toi. » | `draw` 1 : les têtes ink arrivent de tout le halo (« autour de toi ») — beaucoup plus que de veille |
| `cent` 32,61 → `encore` 34,69 | « Au moins cent cinquante litres, en quelques secondes. » ★ `litres` | **le ballon sort** : `bag` 0 → 1 de `rquelques` à `rsecondes$` (≈ 0,9 s, `power2.out`) — le compteur « Ballon » de l'en-tête monte à 150 L ; la caméra recule pour le garder entier (`VIEW.bagFull`) ; `D.punch(t.litres, 0.06)` |
| `encore` 34,69 → `toseuil` 36,81 | « Encore faut-il… que ta main tire. » ★ `tire` | **le film rembobine** : `bag` 1 → 0 sur « Encore faut-il… » (le ballon se replie dans son compartiment, `gas`, `draw` → 0), `pull` → 0 (la poignée revient sur la bretelle) ; la caméra redescend à la poignée (`VIEW.handleBench`) ; sur « main » : `litHandle` 1 — **sur « tire »** elle attend, non tirée |
| `toseuil` 36,81 → `tozero` 39,92 | « Abonne-toi : ce ballon… regarde-le te sortir de là. » | `followCall` (`from` `seuil`, `to` `seuil$` + 0,15) ; **le film ne s'arrête pas** : la caméra est déjà en route — elle passe derrière le sac et monte vers son compartiment haut, d'où sortira le ballon (raccord avec la coupe de l'acte 3, `VIEW.behind`, même côté) ; sur « ballon » (`sballon`) : `litBag` 0 → 0,8 ; sur « sortir » : la caméra est sur le rabat |

## 03 · RÉPONSE — `acte3.js` (`tozero` 39,92 → `toverdict` 55,14)

En coupes, un plan par souffle. On rejoue la glissade — avec le ballon. `mood` 1 jusqu'à « surface ». `sec` reprend à 17 en temps réel. Départ suggéré (à `tozero`) : `{ ...STAGED, travel: 12, roll: 1, bury: 0.35, sort: 0, sec: 17 }`. **La coupe (`VIEW.section`) est le cadre de la démonstration** : de côté, à travers la neige, l'écoulement de son lit à sa surface, toi dedans.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` 39,92 → `gros` 41,21 | « Dans la neige qui coule, » | **coupe** (raccord : du compartiment du sac sur l'établi à l'écoulement — le mouvement continue vers l'aval) : `VIEW.section`, l'écoulement mélangé (`sort` 0), `travel` file, `rush` 1 |
| `gros` 41,21 → `petits` 42,61 | « les gros blocs remontent. » | **sur « remontent »** : `sort` 0 → 0,55 (`sine.inOut`, ≈ 0,8 s) — les gros blocs montent vers la surface |
| `petits` 42,61 → `ettoi` 43,89 | « Les petits s'enfoncent. » | **sur « s'enfoncent »** : `sort` → 1 — les petits grains descendent vers le lit |
| `ettoi` 43,89 → `trigger` 45,88 | « Et toi… tu es trop petit. » ★ `petit` | **coupe** (raccord : le même cadre, plus serré sur toi) : sur « toi » tu t'enfonces : `bury` 0,35 → 0,9 jusqu'à `petit` ; les gros blocs passent au-dessus de toi ; le chrono passe au signal (automatique : `bury` > 0,5) ; `D.punch(t.petit, 0.06)` |
| `trigger` 45,88 → `gaz3` 46,77 | « Tu tires. » | **coupe** (raccord : ta main, la même poignée qu'à la fin de l'acte 1) : `VIEW.strap`-like sur toi dans l'écoulement, `reach` 1 ; **sur « tires »** : `pull` 0 → 1 (`power2.out`, 0,25 s) — ta main arrache la poignée, la tête de lumière court le câble |
| `gaz3` 46,77 → `souvre` 48,17 | « Le gaz part. » | **coupe** : dans le sac (`seethru` 1, sur ton dos) : **sur « part »** : `pierce` 1 puis `gas` 0 → 1 et `draw` 0 → 1 — le venturi aspire l'air de la neige autour |
| `souvre` 48,17 → `rq` 48,97 | « Le ballon s'ouvre. » | **coupe** : `VIEW.behind` — **sur « s'ouvre »** : `bag` 0 → 0,5 (le rabat saute, le ballon sort en se déroulant) ; le compteur « Ballon » monte |
| `rq` 48,97 → `passe` 52,09 | « En quelques secondes, ton volume fait presque le triple. » ★ `triple` | **coupe** : `VIEW.section` : `bag` → 1 (le compteur arrive à 150 L) ; toi et ton ballon, gros parmi les gros blocs ; **sur « triple »** : `D.punch` ; tu commences à remonter (`bury` 0,9 → 0,6) |
| `passe` 52,09 → `remontes` 53,21 | « La neige passe sous toi. » | même plan : les petits grains filent sous toi (`sort` 1, `travel` file) ; `bury` → 0,35 |
| `remontes` 53,21 → `toverdict` 55,14 | « Et tu remontes… vers la surface. » | `bury` → 0,05 (`sine.inOut`) : le ballon arrive à la surface, toi juste dessous ou à fleur — jamais « la tête sort » comme une garantie ; **sur « surface » : `mood` 1 → 0** — le relâchement ; `rush` décroît (l'avalanche ralentit, `travel` freine) ; le chrono passe au veille (automatique) |

## Fin — `fin.js` (`toverdict` 55,14 → 84,17)

**L'ordre : chute → ce qui est dû + commentaire → like → prochain dossier → boucle.** Plus rien du sujet ne revient après l'annonce. Compare ta dernière image à la première (`look` aux deux instants) ; `D.commit` prévient dans la console si un nombre n'est pas revenu.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` 55,14 → `strike` 57,11 | « Voilà le secret : ton sac ne te fait pas… » | **coupe** (raccord : la même coupe, la neige s'arrête) : `VIEW.section` plus large, l'écoulement figé (`rush` 0, `travel` tenu), trié (`sort` 1) : en haut les gros blocs et toi avec ton ballon, en bas les petits grains ; `retitle` : « Ton sac / Te fait flotter » entre sur `secret` + 0,1, **barré sur `strike`** (« pas ») |
| `strike` 57,11 → `avalanche` 59,47 | « …flotter. Il te rend gros. » | « Te rend gros » sur `verdict` − 0,05 ; `D.verdict(verdict)` ; sur « gros » : une lueur veille sur ton ballon (`litBag`) et le liseré des gros blocs — les gros, ensemble, en haut |
| `avalanche` 59,47 → `tocta` 62,02 | « Et dans une avalanche, ce qui est gros… remonte. » | sur « remonte » : un dernier glissement du tri (`sort` tenu à 1, le cadre remonte avec les gros blocs vers la surface, par rapport) ; titre sorti à `tocta` − 0,42 |
| `tocta` 62,02 → `etudiees` 63,59 | « Et ta main ? » | **coupe** (raccord : la poignée — ce que l'accroche avait laissé en suspens) : l'établi, `VIEW.handleBench` assemblé, `{ ...BENCHED, litHandle: 1 }` |
| `etudiees` 63,59 → `personne` 67,40 | « Dans les avalanches étudiées, un sac sur cinq ne se gonfle pas. » | `chip-cinq` de `etudiees` à `personne` − 0,15 ; la caméra recule vers `VIEW.whole` : le sac fermé, le ballon reste plié (`bag` 0), sur « gonfle pas » rien ne se passe — c'est l'image qui le dit |
| `personne` 67,40 → `commentaire` 68,63 | « Le plus souvent… personne n'a tiré. » | `chip-tire` de `personne` à `commentaire` − 0,15 ; la poignée seule allumée, intacte sur sa bretelle (`litHandle` 1, `pull` 0) |
| `commentaire` 68,63 → `tolike` 72,49 | « En commentaire : toi, en hors-piste… avec airbag, ou sans ? » | `duelCall(tl, { from: t.commentaire - 0.3, aAt: t.avec, bAt: t.sans, to: t.tolike - 0.2, toneA: "veille", toneB: "signal" })` — « Avec airbag » s'allume sur « avec », « Sans » sur « sans », **le film ne répond pas** ; la caméra tourne lentement autour du sac (`VIEW.whole`) |
| `tolike` 72,49 → `toabo` 76,07 | « Like : ça remontera chez quelqu'un qui part en hors-piste cet hiver. » | **coupe** : la pente, au calme (`VIEW.wide`, `{ ...STAGED, rush: 0, travel: tenu, fall: 1, bury: 0.05, bag: 1, mood: 0 }`) : la coulée arrêtée, ton ballon veille à la surface, la cassure loin en amont, les crêtes ; `likeCall` (`from` `like` + 0,12, `to` `like$` + 0,12) |
| `toabo` 76,07 → `toloop` 81,57 | « Prochain dossier : un fil vert-jaune, sous ta maison. Inutile… jusqu'au jour du défaut. » | **coupe** : `VIEW.valley` — loin en aval, la vallée ; sur « maison » (`maison`) : `teaser` 0 → 0,6 (le chalet de verre) ; **sur « défaut »** : `teaser` → 1 (la ligne veille qui descend sous lui s'allume) ; `nextFile` (`showAt` `prochain` − 0,15, `factAt` `fil`, `hideAt` `toloop` − 0,38, chevrons de `toabo` + 0,1 à `abo$` + 0,15) — **la voix ne redit pas « abonne-toi »** |
| `toloop` 81,57 → `rewind` 82,89 → la fin | « Comme ton sac… le jour où… » | **coupe** : la pente avant la cassure, un peu plus loin que `POSE0` : `{ ...FIRST, crack: 0 }` — `crack` remonte de 0 vers `FIRST.crack` jusqu'à la dernière image (jamais à reculons), `travel` 0 ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène tout à `FIRST` et `POSE0`. **La dernière image est la première** |

## Ce qui reste fragile (à regarder en premier sur les planches)

- **La coupe dans l'avalanche** (`VIEW.section`) porte toute la démonstration (acte 3, chute) : si le tri ne se lit pas à 270 px (gros en haut, petits en bas), la démonstration tombe. Les gros blocs doivent être nettement plus gros que toi couché, les petits une matière.
- **Toi sous la neige** : un personnage de verre derrière de la neige de verre peut disparaître — c'est au décor de le garder lisible.
- **La neige qui vole** : traînées, jamais points ; la grille qui défile s'étale ; `qa` sur le brouillon d'abord.
- **Le raccord vers l'établi** : `world.handoff` est calculé au build sur `HANDOFF` — si l'acte 1 ne finit pas EXACTEMENT sur `HANDOFF` (`fall`, `roll` entier, `bury`, `reach`), le sac ne tombe plus au même endroit à la coupe.
- **Le rembobinage de « Encore faut-il… »** (le ballon qui se replie) : s'il se lit comme un défaut, garder le ballon plein et couper sur la poignée.
- **La vision** (« Enseveli ») et son retour : deux coupes et un chrono qui revient — à lire sur le brouillon ; si c'est confus, `sec` reste en temps réel et seule `chip-enseveli` porte la dizaine de minutes.

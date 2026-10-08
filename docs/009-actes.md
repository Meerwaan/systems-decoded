# 009 · Micro-ondes — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (`npm run script -- 009` le donne ; la vraie voix sera ≈ 20 % plus courte). Tout instant se lit donc dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères : le jour où la voix arrive, tout se recale seul. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js`) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/008-paratonnerre/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe.
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,12–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (un seul panneau ou une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 110 pour toi et le four, 30 sur le loquet, 20 sur le fusible, `SIZE` sur l'établi).
- Couleurs : `mood` 1 (signal) tant que le four chauffe ; 0 (veille) sur l'établi et dès que les ondes sont coupées. Jamais à mi-chemin plus d'une demi-seconde.
- Le four tourne : `spin` avance d'environ 0,1 tour par seconde tant que `power` vaut 1 (un `st` linéaire `"none"` par acte, de la coupe à la suivante), et le champ respire tout seul.
- **`seen`** (0–1) : combien du champ est DESSINÉ, sans rien changer au four (`power` reste à 1 : le compteur de l'en-tête lit `power`). Sur le loquet et le fusible, les ventres orange mangent l'image : `seen` 0,15. Partout ailleurs 1.
- `light` : 0 pendant la mesure (`ruler`) et pour tout plan pris depuis l'intérieur de la cavité vers toi (un anneau parasite au niveau de ta bouche à `light` 0,4).
- L'éclair du fusible (`spark`) ne dépasse pas 0,7 et se filme d'assez loin (d ≥ 60) : à 1 et d 30, c'est un voile blanc sur toute l'image.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-10` (Ton visage / 10 cm) · `chip-renvoi` (La plaque / Renvoie l'onde) · `chip-sans` (Sans / La porte) · `chip-test` (Sécurités contournées / `#test-v` : un compteur, `D.readout("test-v", …)` de 0,0 s à 5,0 s) · `chip-eyes` (Tes yeux / Chauffent) · `chip-onde` (1 onde / 12,2 cm) · `chip-trou` (1 trou / 1,5 mm) · `chip-x80` (L'onde / × 80) · `chip-light` (La lumière / Passe) · `chip-sw` (2 interrupteurs / Ouverts) · `chip-zero` (Porte ouverte / 0 W) · `chip-si` (Et si / Ils collent ?) · `chip-mon` (Le troisième / Se ferme) · `chip-fuse` (Fusible grillé / Hors service) · `chip-hinge` (Charnière / Tordue ?) · `chip-seal` (Joint / Usé ?) · `#retitle` (Ce qui te protège : « La vitre » barré → « Les trous »), `#net`, `#next` (Prochain dossier · 010 — « Elle touche ton doigt. Elle se sacrifie. »), `#cta-field` (« Ton micro-ondes, il a quel âge ? » → « 12 ANS », 6 lettres), les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir 008/acte2.js). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `todoor`)

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, état `FIRST` : toi, le visage à la vitre du four encastré, la cavité pleine d'ondes derrière la plaque. **La caméra bouge dès l'image 1** (elle pousse vers la porte) et à 0,1 s le champ enfle (`power` part de `FIRST.power` = 0,8 et monte à 1 en 0,3 s, le plat tourne) : c'est ce qui arrête le pouce. |
| `accroche` | « Mille watts de micro-ondes. » | poussée de `POSE0` vers `VIEW.close` : la plaque, les ventres derrière |
| `accroche:dix` | « À dix centimètres de ton visage. » | la caméra glisse vers le profil (`VIEW.gap`) : ton visage, l'écart, la porte ; `chip-10` posée dans l'écart |
| `promesse` → `glass` | « Presque rien ne sort : » | toujours de profil, la caméra passe côté four (`VIEW.profile`, d plus court) : le renvoi veille sur la plaque — les fronts repartent vers l'intérieur ; `chip-renvoi` brève |
| `glass` → `holes` | « la vitre les laisse passer, » | retour de trois quarts sur la porte (`VIEW.door`) : la vitre luit (`litGlass` 0 → 1 → 0) |
| `holes` → `bad` | « ce sont ses trous qui les arrêtent. » | plongée par rapport vers la plaque (`VIEW.plate`, d 30 → ≈ 9) : les trous apparaissent, le mur de lumière derrière ; `litMesh` 1 |
| `bad` | « Sauf si ta porte… ferme mal. » | recul par rapport sans lâcher la plaque jusqu'au bord libre de la porte : elle bâille d'un rien (`open` 0 → 0,06) et un filet de champ sort par la fente (`leak` 0 → 0,15 : essaie ; si ça se lit mal, la fente seule, éclairée signal). `mood` reste 1 |
| `tosans` | « Sans elle ? » | **coupe** : le four SANS sa porte (`door` 0, `open` 0, `leak` 0), de profil (`VIEW.profile`), toi face à la bouche ouverte ; `chip-sans` en zone haute ; `leak` 0 → 0,5 : les fronts sortent |
| `hand` | « Des chercheurs y ont mis la main, sécurités contournées : » | **coupe** : la cavité ouverte (`VIEW.test`, `you` 0, `leak` 0), l'avant-bras entre (`hand` 0 → 1 sur « main ») ; `chip-test` en zone haute, son compteur court de 0,0 à 5,0 s jusqu'à `pain` |
| `pain` | « cinq secondes, et la douleur arrive. » | `pain` 0 → 1 sur « douleur » : le bout des doigts rougeoie ; légère poussée de la caméra |
| `eyes` | « Tes yeux, eux, évacuent mal la chaleur. » | **coupe** : toi, sans porte (`VIEW.eyes`, `you` 1, `hand` 0, `pain` 0, `leak` 0,7) ; `eyes` 0 → 1 sur la phrase ; `chip-eyes` |
| `back` | *(silence)* | le film revient en arrière en 0,35 s : `leak` → 0, `eyes` → 0 |

L'acte 2 coupe à `todoor`.

## 02 · AUTOPSIE — `acte2.js` (`todoor` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `todoor` | « Alors… » | **coupe** : la porte fermée sur son four (`VIEW.door`, `STAGED`). La cuisine, toi, le corps du four et le champ s'effacent autour d'elle (`shell`, `you`, `body`, `seen`, `light` → 0 ; `mood` → 0) : la porte reste seule |
| `tobench` | « …on l'ouvre. » | `benchCut` : la même porte, sur l'établi, à la même place de l'image (`origin: DOOR.home`, vers `DOOR.bench`). `explode` 0 → 1 (1,2 s, `"none"`), la caméra recule par rapport jusqu'à `VIEW.exploded` |
| `p1` | « Une vitre. » | `VIEW.glassPart`, `litGlass` ; légende « Vitre » / « Laisse passer les ondes » |
| `p2` | « Une plaque de métal, percée de trous d'un millimètre et demi. » | `VIEW.meshPart`, `litMesh`, puis la caméra s'approche jusqu'à voir les trous (d ≈ 30) ; légende « Plaque perforée » / « Trous Ø 1,5 mm » |
| `p3` | « Et sur le bord… deux crochets. » | les crochets ne se voient que de derrière la porte : **coupe** vers `VIEW.hooksPart` (ou demi-tour lent pendant « Et sur le bord… »), `litHooks` ; légende « Crochets » / « Tiennent 2 interrupteurs » |
| `towave` | « L'onde du four mesure douze centimètres : » | **coupe** : la cuisine, depuis l'intérieur de la cavité (`VIEW.ruler`, `STAGED` + `ruler` 0, `light` 0, `you` 0, `mood` 1). `wave` : `ruler` 0 → 1, le ruban se trace d'un bout à l'autre ; `chip-onde` |
| `big` | « quatre-vingts fois trop grande pour le trou. » | **coupe** vers l'extérieur (`VIEW.plate`, `ruler` 0) puis plongée par rapport jusqu'à `VIEW.hole` : UN trou, 170 px, le mur de lumière derrière ; `chip-trou` puis `chip-x80` (zone haute, l'une après l'autre) |
| `light` | « La lumière, minuscule, passe : » | sur le trou : `light` 0 → 1, le fil ink sort par le trou, à l'aise ; `chip-light` |
| `plate` | « tu vois ton plat. » | recul par rapport le long du fil jusqu'à ton œil (`VIEW.rays`, `you` 1 remis sur une image où tu es hors champ) |
| `toseuil` | « Abonne-toi : on ouvre cette porte en plein chauffage. » | `followCall` (voir 008/acte2.js, fin). Le film ne s'arrête pas : la caméra descend vers la poignée, ta main monte s'y poser (`pull` 0 → 0,5), l'horloge de l'en-tête répond (une pulsation signal sur « chauffage »). Pas de panneau |

L'acte 3 coupe à `tozero`.

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

L'horloge de l'en-tête est câblée dans `main.js` (secondes jusqu'à `lift`, puis microsecondes jusqu'à `trigger`), comme le compteur « Ondes ». `setAct(tl, 3, zero)`.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` | « Tu tires la poignée. » | **coupe** : ta main sur la barre (`VIEW.handle`, `STAGED` + `pull` 0,5). `pull` : `pull` 0,5 → 0,62, tes doigts se serrent — la porte n'a pas encore bougé |
| `zero:four` | « Le four chauffe encore. » | la caméra remonte vers la cavité derrière la plaque (`VIEW.close`) : le champ à plein, une respiration plus forte ; le compteur « 1 000 W » pulse |
| `tolatch` | « Le loquet se soulève : » | **coupe** : la platine de profil (`VIEW.latch`, `body` 0,5, `seen` 0,15, `fx: 11, fy: 161, fz: 52, fs: 30`), puis poussée vers un crochet sur son levier (`VIEW.hook`). `lift` : `latch` 0 → 1 en 0,25 s |
| `sw` | « deux interrupteurs coupent le courant. » | recul vers `VIEW.latch` : `sw` 1 → 0 — les contacts s'ouvrent, la chaîne veille s'éteint jusqu'au magnétron ; `chip-sw` |
| `tocut` | « Dix millionièmes de seconde : plus une onde. » | **coupe** : la cavité derrière la porte (`VIEW.close`, `seen` 1, `latch` 1, `sw` 0, `power` 1) ; `trigger` : `power` 1 → 0 en deux images, `mood` → 0 — plus rien, que l'ampoule et le plat qui finit de tourner. Aucun `#flash` |
| `tohand` | « Ta main, elle, n'a pas fini de tirer. » | **coupe** : `VIEW.pulling` — la porte s'ouvre seulement maintenant, lentement (`open` 0 → 0,35, `pull` → 1) : rien ne sort ; `chip-zero` |
| `tomon` | « Et si les deux restent collés ? » | **coupe** : la platine (`VIEW.latch`, `STAGED` + `latch` 1, `open` 0,15, `body` 0,5, `seen` 0,15), `stuck` 0 → 1 sur « collés » : les deux contacts restés fermés virent signal ; `chip-si` en zone haute |
| `third` | « Un troisième se ferme… » | `monitor` 0 → 1 : la bascule appuie le troisième ; `chip-mon` |
| `fuse` | « et fait sauter le fusible. » | la caméra suit le fil jusqu'au fusible (`VIEW.fuse`, mais d ≥ 60) ; `fuse` 1 → 0, `spark` 0 → 0,7 → 0 ; `power` → 0, `mood` → 0 ; `chip-fuse` |

`fin.js` coupe à `toverdict`.

## Chute, appels à l'action, boucle — `fin.js` (`toverdict` → fin)

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` | « Ce qui te protège, ce n'est pas la vitre. » | **coupe** : l'établi, la porte éclatée (`BENCHED`, `explode` 1, `VIEW.exploded` plus serré), la vitre allumée. `retitle` : « La vitre » arrive avec la phrase, barrée sur « pas » (`verdict`), remplacée par « Les trous » sur `truth` ; `litGlass` 1 → 0, `litMesh` 0 → 1. `D.verdict(verdict)` |
| `truth` → `sabot` | « Ce sont des trous… et un four prêt à se saboter. » | la caméra glisse de la plaque vers les crochets (`litHooks` sur « saboter ») ; le titre est sorti avant `tocta` |
| `tocta` | « Like. Ça remontera chez quelqu'un qui croit encore que ça rend les plats radioactifs. » | **coupe** : l'établi, la porte entière (`VIEW.whole`), qui tourne lentement. `likeCall` (5 tuiles, « n personnes ») |
| `abo` | « Abonne-toi. Prochain dossier : une scie qui s'arrête en touchant ton doigt… et qui se sacrifie pour ça. » | la caméra recule et descend ; `nextFile` (panneau à « Prochain », le fait à « sacrifie ») |
| `tocomment` | « Et si ta porte ferme mal ? Charnière tordue, joint usé : là, on arrête de s'en servir. » | **coupe** : la cuisine, la porte entrouverte d'un rien, de profil — le cadre de l'acte 1 sur « ferme mal » (`AJAR` dans `acte1.js` : `{ tx: -8, ty: 160.5, tz: 61, d: 160, az: -90, el: 0, fov: 30, shift: 150 }`, `open` 0,06, `power` 1 ; **`leak` 0,35 à 0,5** : à 0,15 la tête des fronts est encore dans l'épaisseur de la porte, on ne voit rien) ; `chip-hinge` sur « Charnière », puis `chip-seal` sur « joint » (l'une après l'autre, en zone haute ou accrochées à la charnière et au bord libre si elles tiennent dans le cadre) |
| `ask` | « En commentaire : ton micro-ondes, il a quel âge ? » | `commentCall` (la question s'affiche ; « 12 ANS » se tape sur les premiers mots de la boucle : `chars: 6`) |
| `toloop` | « Vieux ou neuf, derrière sa porte, il y a toujours… » | **coupe** : la cuisine large (`VIEW.kitchen`, `STAGED` + `near` 0) ; tu reviens te pencher sur la vitre (`near` 0 → 1). `rewind` : `D.loop({ at: toloop, rewindAt: rewind, fromD })` — retour à `POSE0` et à `FIRST` |

La dernière image est la première : `commit` prévient dans la console si un nombre n'est pas revenu.

## Ce que les décors savent faire (rendu par ceux qui les ont construits — détail et autres poses : `docs/journal/009-kitchen.md`, `009-model.md`, `009-waves.md`)

- **Toi** (`kitchen.js`) : `near` 1 la tête penchée à 10 cm de la vitre · 0 un pas en arrière. `pull` 0 → 0,5 la main droite va à la barre et se ferme · 0,5 → 1 tu tires ; la main suit la barre quand `open` grandit, et de `open` 0,05 à 0,3 tu te redresses. La main qui tire passe derrière ta tête pour une caméra entre az −50 et −70 : d'où la contre-plongée de `VIEW.handle`. `eyes` : 0 → 0,5 les yeux, 0,25 → 1 le visage. `hand` 0 → 1 l'avant-bras entre jusqu'au centre de la cavité ; `pain` ne s'allume que si `hand` > 0,45. Ancres `world.kitchen.A` : `youHead, youEyes, youHand, testHand, columnTop, worktop`.
- **Le four et sa porte** (`model.js`) : `body` 1 tout · **0,5 la chaîne de sécurité seule** (platine, fils, fusible, magnétron) · 0 rien. `open` × 100° autour de la charnière. `latch` : les crochets montent d'1 cm, les leviers suivent puis lâchent. `sw` : voyants, fils et filament veille. `stuck` : contacts collés, tout en signal. `monitor` : la bascule appuie le troisième ; son fil vers le fusible ne s'allume que si la chaîne est sous tension. `fuse` 0 : moignons, suie, tout éteint. `explode` : couches à +21 / +11 / 0 / −7 / −14 cm le long de z. Les crochets sont invisibles de face. Sur l'éclaté large, la plaque ne se lit « à trous » que sous d ≈ 100. Ancres `world.oven.A` : `door, plate, hole, handle, hookTop, hookBottom, latch, sw1, sw2, monitor, fuse, magnetron, cavity, food` ; sur l'établi `glass, mesh, film, frame, hooks`.
- **Les ondes** (`waves.js`) : la plaque est à z = 57. `power` : ventres, cordes, renvoi, fuite (0 : rien). Le renvoi veille n'existe que porte fermée et ne se lit bien que de profil. `leak` : la tête des fronts est au visage à 0,7. `ruler` : 0 → 0,6 le ruban se trace, 0,55 → 0,75 ses bouts, 0,8 → 1 le repère sur le trou. `light` : cinq fils ink et la ligne de visée par le trou repéré. Depuis l'intérieur de la cavité : `you` 0. Ancres `world.waves.A` : `lobe, wave0, wave1, hole, front, ray, rayHole, mouth`.
- Les poses de départ sont dans `VIEW` (`world.js`) : `door, whole, exploded, glassPart, meshPart, hooksPart, close, gap, inside, plate, hole, ruler, rays, profile, handle, pulling, eyes, test, latch, hook, fuse, kitchen`. Ce sont des points de départ vus sur planche : chaque acte affine les siennes avec `look` et les garde dans son fichier.
- Dans `look --file`, donne dans `state` tous les nombres que ton image exige (`set: 0` pour l'établi).

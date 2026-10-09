# 015 · Brin d'arrêt — le plan de mise en scène

**La voix est enregistrée** (92,1 s) : les instants sont ceux de la vraie voix. Ils se lisent quand même dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères (`npm run script -- 015` donne la table). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui vides) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/014-abs/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`). Les poses qui cadrent bien sont dans les journaux des décors : `docs/journal/015-carrier.md`, `015-rafale.md`, `015-model.md` — pars d'elles.

## La scène, et ce qu'on a le droit d'affirmer

Tu poses un Rafale Marine sur le Charles de Gaulle. Tes roues touchent le pont : tu mets plein gaz. Ta crosse traîne sur le pont et accroche un câble tendu en travers, le brin, qui tire un frein hydraulique sous le pont : l'huile, forcée par une vanne étroite, transforme ta vitesse en chaleur. Une centaine de mètres, deux à trois secondes. Si ta crosse rate les trois brins, tu es déjà à pleine puissance : tu redécolles au bout du pont. Ce qui est sourcé : la pleine puissance au toucher, les trois brins, le frein hydraulique, un avion par minute (Marine nationale) ; le piston qui chasse l'huile par une vanne, le réglage avant chaque appontage (source secondaire) ; l'accident de l'Eisenhower en 2016 (Navy Times).

- **Pas de postcombustion** : les tuyères ont un cœur dur et clair à `gas` 1, jamais de flamme.
- **C'est une maquette** : aucune longueur du pont ne s'affiche. Les seuls chiffres à l'écran : l'en-tête, et les étiquettes écrites ci-dessous.
- **La scène de 2016 est reconstituée sur notre pont, SANS avion** (`jet` 0) : ce n'était ni un Rafale ni ce navire. Ce sont les étiquettes qui portent les faits.
- Personne n'est blessé à l'image, rien ne brûle, l'avion ne tombe jamais à l'eau.

## Le repère, le ralenti, les deux nombres de l'en-tête

- **Le repère est celui du navire** : le pont ne bouge pas, l'avion vient à lui. **`pos`** (mètres du bout de la crosse le long de l'axe, comptés depuis le brin du film : négatif avant lui, 0 dessus, 90 arrêté), **`alt`** (mètres des roues au-dessus du pont), `nose` (degrés), `squat`, `hook`, `gas`. Les roues sont 5,6 m en avant du bout de la crosse ; la crosse pend plus bas qu'elles : à la première image son sabot touche déjà le pont.
- **L'avion touche APRÈS le premier brin** : à la première image `pos` vaut −9 — le brin du film (z = 0) est le premier que rencontre la crosse, il est dans l'image, juste devant les roues.
- **Tant que le brin est tenu** (`held` 1), `pull` suit `pos` et `ram` vaut `pos / 90` : **mets-les dans le même `st`** (`st(at, durée, { pos: 50, pull: 50, ram: 0.56, kmh: 144, sec: 1 }, "none")`).
- **Le film est AU RALENTI** : entre la première image et le brin il se passe 0,15 s ; l'arrêt dure 2,9 s, étiré sur tout l'acte 3. L'en-tête lit deux nombres de l'état, à tenir cohérents (freinage régulier) :

| `sec` (T+…) | −0,15 | 0 | 0,5 | 1,0 | 1,5 | 2,0 | 2,5 | 2,9 |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| `pos` = `pull` (m) | −9 | 0 | 28 | 51 | 68 | 80 | 87 | 90 |
| `kmh` | 220 | 220 | 182 | 144 | 106 | 68 | 30 | 0 |

- `sec` est l'horloge du film (« T+0,0 s » quand la crosse prend le brin), `kmh` le second compteur (« Vitesse », signal tant que l'avion avance, veille à l'arrêt : `main.js` le fait). Pendant l'autopsie ils ne bougent pas.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin. **Pas de secousse de caméra sur un plan large plein de lignes** (le pont) : image parasite assurée.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 900 pour l'avion, ≈ 300 sur la crosse ou la manette, ≈ 6 000 pour le pont entier, `SIZE` sur l'établi, ≈ 500 sur la vanne).
- **Couleurs** : signal est la menace — la vitesse de l'avion (ses tuyères, le compteur), la mer au bout du pont, un brin qui casse ; veille est le système vivant — le brin qui tient, la traction qui descend le câble, le piston, l'huile au travail ; ink est le reste. `mood` 1 sur le pont tant que l'avion avance, 0 sur l'établi et dès qu'il est arrêté ou reparti. Jamais à mi-chemin plus d'une demi-seconde.
- Toi, de près, es un mannequin de verre : la main sur la manette se filme à travers la verrière, de trois quarts, jamais en très gros plan.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **30 images lues au plus.** Journal : `docs/journal/015-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-gaz` (Tes roues touchent / Pleine puissance) · `chip-100` (Pour t'arrêter / Environ 100 mètres) · `chip-mer` (Au bout du pont / La mer) · `chip-3` (En travers / 3 brins) · `chip-reglage` (Avant chaque appontage / Réglé pour l'avion) · `chip-tire` (Le câble / Ne fait que tirer) · `chip-pris` (Crosse / Brin accroché) · `chip-chaleur` (Ta vitesse / Devient chaleur) · `chip-arret` (Environ 3 secondes / Arrêté) · `chip-bolter` (Trois brins ratés / Bolter) · `chip-repart` (Pleine puissance / Tu redécolles) · `#retitle` (Sur un porte-avions : « Tu freines » barré → « On te retient ») · `#net` · `chip-minute` (Jusqu'à / 1 avion par minute) · `#next` (Prochain dossier · 016 — « Il ne coupe pas tout de suite. Il attend. ») · `chip-2016` (USS Eisenhower · mars 2016 / Frein mal réglé) · `chip-casse` (Le brin casse / 8 marins blessés) · `chip-reparti` (L'avion / Est reparti) · `#cta-field` (« Cet appontage, tu le tentes ? » → « OUI », 3 lettres) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `014-abs/src/acte2.js`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

L'accroche et la scène en UN mouvement si possible (les roues → ta main → les tuyères → la crosse → le pont entier → son bout → les trois brins → la crosse et le brin → sous le pont). Une coupe est permise là où le mouvement ferait plus d'un quart de tour (au plus deux dans l'acte). C'est toi qui règles `POSE0` et `FIRST` : rends-les dans ton message final, prêts à coller.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, `FIRST` : au ras du pont, devant et à bâbord, les roues à un demi-mètre du pont, la crosse pendante, le brin du film en travers juste devant elles. **Ça bouge dès l'image 1** : `alt` 0,5 → 0, `pos` −9 → …, la caméra glisse. La première image doit arrêter le pouce sans texte. |
| `touch` → `deck` | « Tes roues touchent le pont du porte-avions. » | sur « touchent » : `alt` 0, `squat` 0 → 1 → 0,4, `puff` 0 → 1 puis s'éteint, `nose` 8 → 3 ; la caméra remonte le long du fuselage vers la verrière |
| `throttle` | « Et là… tu mets plein gaz. » | à travers la verrière, ta main gauche : sur « plein », `gas` 0,5 → 1, la manette part en avant ; puis la caméra file vers l'arrière jusqu'aux tuyères qui durcissent ; `chip-gaz` |
| `wanted` → `cable` | « C'est voulu : un câble va t'arrêter, » | des tuyères, elle descend sur le sabot de crosse qui traîne (`scrape` 0,5) et, devant lui, LE brin : `litBrin` 1, `tense` 0,4 |
| `hundred` | « en cent mètres. » | recul par rapport jusqu'au cadre de l'arrêt (`VIEW.chase`) : la piste file vers le haut de l'image jusqu'à son bout ; `chip-100` en place fixe |
| `sauf` → `miss` | « Sauf si tu le rates… » | toujours large : la caméra avance vers le BOUT du pont — l'arête, le vide, la lueur signal sur l'eau |
| `breaks` | « ou s'il casse. » | retour sur le brin, de près (`VIEW.wire`) : une lueur signal le parcourt (`tense` 1, `mood` 1) — l'image TIENT là-dessus, on ne montre pas la rupture (`parted` reste à 0) |
| `toscene` → `v200` | « Ton Rafale arrive à plus de 200 kilomètres-heure. » | l'avion entier de profil sur le pont (large) ; le compteur de l'en-tête répond (un `tl` sur `#hud-count`, comme le fait `acte3.js` du modèle sur l'horloge) ; `pos` avance à peine (−3 → −2) |
| `sea` | « Le pont, lui, finit dans la mer. » | elle devance l'avion le long de l'axe jusqu'au bout du pont ; `chip-mer` |
| `three` | « En travers : trois câbles. » | du bout du pont, on se retourne vers l'arrière (coupe si besoin : `VIEW.ahead`) : les trois brins en travers (`others` 1, `litBrin` 1), le Rafale au-delà, nez vers nous ; `chip-3` |
| `crosse` → `catchone` | « Ta crosse doit en accrocher un. » | plongée par rapport sous l'avion jusqu'au sabot et au brin du film, un mètre entre eux ; `under` 0,3 → 1 : le pont s'éclaircit |
| `back` → `tosystem` | *(silence)* | elle continue à travers le pont de verre jusqu'au frein : `VIEW.system` ; `jet` → 0, `sea` → 0, `others` → 0, `shell` → 0,25, `mood` → 0 à la fin : tout le reste s'éteint |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` → `explode` | « Alors… on l'ouvre. » | `benchCut` de `VIEW.system` vers `VIEW.whole` (le même objet à la même place : sur l'établi il est remonté de `SYSTEM.bench`), `BENCHED` ; sur « on » : `explode` 0 → 1, recul vers `VIEW.exploded` |
| `p1` → `brin` | « Sur le pont, un câble d'acier : le brin. » | de près sur le brin et sa bande de pont, `litBrin` 1 ; légende « Brin » |
| `under` → `p2` | « Dessous, il continue : des poulies… » | `explode` → 0 pendant qu'on suit le câble vers le bas : `wave` 0 → 0,6 (la tête de lumière descend, la caméra la suit), `litCable`, puis `litSheaves` sur « poulies » |
| `p3` → `p4` → `oil` | « et au bout, un piston dans un cylindre plein d'huile. » | on arrive sur le frein (`VIEW.brake`) : `litRam` sur « piston », `litCyl` sur « cylindre » ; sur « d'huile », `xray` 0 → 1 : l'huile se voit |
| `torepos` → `setup` → `arrives` | « Avant chaque appontage, on règle ce frein pour l'avion qui arrive. » | de près sur la molette de la vanne : `dial` 0,2 → 0,5, elle tourne et s'arrête sur son repère ; `litValve` 1 ; `chip-reglage` |
| `nobrake` → `pulls` | « Le câble, lui, ne freine rien : il ne sait que tirer. » | recul jusqu'à voir le brin ET le frein ; sur « tirer » : `held` 1, `pull` 0 → 6, `ram` 0 → 0,5, `wave` 0 → 1, `tense` 1, `flow` 0,3 (la vanne laisse passer : rien ne chauffe) — une démonstration lente ; `chip-tire` ; puis tout revient (`pull` 0, `ram` 0, `held` 0) |
| `toseuil` | « Abonne-toi : ces cent mètres, on te les montre en entier. » | `followCall` (voir `kit/lib/blocks.js` : les chevrons `#rail-seuil`, le nom du compte s'allume) ; **le film ne s'arrête pas** : la caméra remonte déjà du frein vers le brin, à travers la bande de pont, là où la crosse va arriver |

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes, au ralenti. L'horloge repart sur `trigger` ; tiens `sec`, `pos` / `pull` / `ram` et `kmh` sur la table ci-dessus.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `wheels` | « Tes roues touchent. » | **coupe** : `STAGED` — l'image de l'accroche revient, de plus près, au ras de la roue gauche : `alt` → 0, `squat`, `puff` |
| `gas` | « Plein gaz. » | **coupe** : les tuyères vues de l'arrière, `gas` 0,5 → 1 sur le mot (l'accroche a montré ta main ; ici, ce qu'elle déclenche) |
| `scrape` → `trigger` | « Ta crosse traîne sur le pont… et accroche. » | **coupe** : au ras du pont, de profil, à bâbord — le sabot traîne (`scrape` 1), le brin arrive (`pos` −4 → 0) ; sur « accroche » : `held` 1, une lumière qui a un endroit, au sabot (blanc → veille), `tense` 1, `scrape` 0 ; `sec` passe à 0,0 et démarre ; `chip-pris` |
| `toreponse` → `unreel` | « Le brin se déroule, » | **coupe** : `VIEW.chase` — le V grandit derrière l'avion qui s'éloigne vers le haut de l'image : `pos` / `pull` 0 → 28, `kmh` 220 → 182 |
| `ram` | « tire le piston. » | **coupe** sous le pont (`under` 1, `shell` 0,3, `xray` 1) : le câble court dans les poulies, la traverse avance — `ram` 0,3 → 0,55, `wave` qui tourne |
| `push` → `valve` | « Le piston chasse l'huile par une vanne étroite. » | de près sur la vanne : sur « chasse », `flow` 0 → 1, le jet dans le col |
| `resist` → `eats` → `heats` | « L'huile résiste… et ta vitesse devient de la chaleur. » | même cadre, plus serré : `heat` 0 → 0,9 pendant que `kmh` tombe 144 → 68 (le compteur se vide pendant que l'huile rougit) ; `pull` 51 → 80, `ram` → 0,9 ; `chip-chaleur` sur « chaleur » |
| `toarret` → `secs` → `meters` → `stopped` | « Deux à trois secondes. Une centaine de mètres. Tu es arrêté. » | **coupe** : large et haut, de l'arrière — l'avion près du bout du pont, le long V derrière lui : `pull` 80 → 90, `kmh` 68 → 0, `sec` → 2,9 sur « arrêté » ; `flow` → 0 ; sur « arrêté » `mood` 1 → 0 d'un coup, l'horloge passe en veille ; `chip-arret` |
| `tobolter` → `missed` → `allthree` | « Et si ta crosse les rate, tous les trois ? » | **coupe** (on le rejoue) : `STAGED`, `pos` −3, `hook` 0,7 — le sabot rebondit, passe AU-DESSUS du brin du film puis du troisième (`held` reste à 0) : `pos` −3 → 14 ; de profil, bas ; `mood` 1 ; `chip-bolter` |
| `power` → `edge` → `fly` | « Tu es déjà à pleine puissance : au bout du pont… tu redécolles. » | **coupe** : du bout du pont, bas, à bâbord — l'avion roule vers nous (`pos` 14 → 100, `gas` 1, `kmh` 220 → 235) ; sur « redécolles » : `pos` 100 → 150, `alt` 0 → 9, `nose` 0 → 11, il quitte le pont et monte ; `chip-repart` ; `mood` → 0 sur le mot |

## Fin — `fin.js` (`toverdict` → la fin)

Compare ta dernière image à la première (`look` aux deux instants) : elle doit être la même. `D.commit` prévient dans la console si un nombre de l'état n'est pas revenu — `look` ne l'affiche pas : relis `D.first`.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `noland` → `again` → `verdict` | « Voilà le secret : sur un porte-avions, tu ne freines pas. Tu es prêt à redécoller… et c'est un câble qui te retient. » | **coupe** : l'avion ARRÊTÉ au bout de sa course (`pos` 90, `pull` 90, `ram` 1, `held` 1, `kmh` 0, `sec` 2,9, `gas` 1 : les tuyères encore dures, `tense` 1, `mood` 0), de trois quarts avant, bas : il tire sur son long câble ; lent travelling le long du brin tendu, du sabot vers les poulies de pont ; `retitle` : « Tu freines » barré sur `noland`, « On te retient » sur `verdict` ; `D.verdict(verdict)` |
| `tocta` → `crew` → `perminute` | « Like. Pour ceux qui remettent ce câble en place : ici, il se pose jusqu'à un avion par minute. » | **coupe** : le pont vu de bâbord et d'en haut, près du brin ; `jet` 0 ; le brin revient (`held` 1, `pull` 12 → 0, `ram` 0,15 → 0, puis `held` 0) ; `crew` 1 : les marins de verre ; `likeCall` ; `chip-minute` sur `perminute` |
| `toabo` → `next` → `waits` | « Abonne-toi. Prochain dossier : ton disjoncteur… Il attend. » | **coupe** : l'établi, le système entier (`BENCHED`), on s'en approche jusqu'à ce qu'il occupe la moitié de la largeur ; `nextFile` |
| `tocomment` → `y2016` → `misset` | « Et s'il casse ? Mars 2016, un porte-avions américain : frein mal réglé, » | même établi, de près sur la molette : `dial` 0,5 → 0,82, `wrong` 0 → 1 sur « mal réglé » ; `chip-2016` dès `y2016` |
| `parts` → `hurt` | « le câble casse. Huit marins blessés. » | **coupe** sur « le câble » : le pont, le brin de près, `jet` 0, `crew` 0, `tense` 1, `mood` 1 ; sur « casse » `parted` 0 → 1 ; `chip-casse` sur `hurt` (elle remplace `chip-2016`) |
| `away` → `ask` → `answer` | « L'avion, lui… est reparti. En commentaire : toi, tu le tentes ? » | la caméra se lève vers le bout du pont : `away` 0 → 0,8, la lumière qui monte ; `chip-reparti` ; puis `commentCall` (`chars` 3) |
| `toloop` → `rewind` | « Le brin revient en place. Et déjà… » | **coupe** : le pont, le brin en place (`parted` 0), le suivant arrive — `jet` 1, `pos` −40, `alt` 3, `nose` 8 ; `D.loop` ramène tout à `FIRST` (`pos` −40 → −9, `alt` 3 → 0,5) : **la dernière image EST l'instant de la première** — une boucle causale. Laisse `pos` courir jusqu'à la dernière image (pas d'arrêt à la couture). |

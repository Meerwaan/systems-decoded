# 027 · Voie de détresse — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **86,1 s**) : le minutage est RÉEL. Tout instant se lit quand même dans le script — un repère d'`episode.json` (`cues` : 100, écrits et vérifiés un par un sur la table, image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; une durée s'écrit comme un écart entre deux repères. Les secondes ci-dessous sont là pour te repérer (`npm run script -- 027`). Les repères `mot` tombent 0,1 s avant le mot (une coupe se pose quelques images avant la phrase qui la motive) ; `freeze` = la fin de « secondes », `toarrive` = 0,14 s avant « Et ton camion arrive », `trigger` = le souffle avant « Les pneus s'enfoncent ». Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des squelettes, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/017-irm/src/acte*.js` et `episodes/025-esp/src/*.js` (le dernier rendu) ; fin : `kit/template/src/fin.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js`. Les poses qui cadrent bien seront dans les journaux des décors (`docs/journal/027-model.md`, `027-camion.md`, `027-col.md`) et de l'habillage — pars d'elles ; `VIEW` n'est qu'un point de départ, réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

La nuit, un col, une longue descente (8 %, illustratif). Ton poids lourd de 40 t descend ; tes freins **ne sont pas cassés : ils sont trop chauds** (le fading : la garniture perd sa friction, le tambour se dilate, la pédale s'enfonce, le camion ne ralentit pas). 72 → 80 → 90 km/h (illustratif, la voix dit « Quatre-vingts. Quatre-vingt-dix. »). En bas, un virage à gauche et le ravin derrière ; à droite, une voie de détresse : un panneau bien avant, un accès qui quitte la route, une fosse de gravier ROND, une glissière de béton, une butte de terre au bout. Tu braques à droite ; tes roues quittent le bitume et s'enfoncent ; chaque tour de roue pousse le gravier devant elle : environ une demi-gravité (4,9 m/s², valeur de calcul du projet de Laffrey ; 0,516 g mesuré aux États-Unis) — sans toucher la pédale. Tes quarante tonnes s'arrêtent, avant la butte.

- **À ne pas dire, ni montrer comme un fait** : une température (aucun seuil : jamais de degrés à l'écran) ; une distance d'arrêt (« 40 t arrêtés en X mètres ») ; l'épaisseur du lit ; « un mur » (c'est une glissière, le long de la fosse) ; que la voie « freine » au sens d'un frein ; Laffrey, l'autocar, un corps ; « partout en montagne » ; l'entretien du lit ; pourquoi les grains concassés arrêtent moins bien (l'explication n'est pas sourcée : on montre la différence de distance, rien d'autre).
- Le camion n'atteint jamais le ravin ; personne n'est blessé ; la butte n'est pas touchée.
- Le prochain dossier : **028, le détecteur de monoxyde de carbone** (à confirmer : `sources`) — « chez toi, un gaz sans odeur… et un boîtier ». Aucun chiffre sur le panneau.

## L'en-tête : le tableau de bord du camion

- **`kmh`** (en grand, `main.js`) : **72** sur l'image 0, **80** sur « Quatre-vingts » (`v80`), **90** sur « Quatre-vingt-dix » (`v90`), 90 tenu (et redit sur `v90b`) jusqu'au gravier, puis il tombe à **0** sur « s'arrêtent ». Signal tant que la pédale est enfoncée et que la menace court (`mood` 1), veille dès que le camion est dans le gravier (`sink` > 0,2), encre sinon.
- **« Pédale »** : où est ton pied, `pedal` × 100 % — **60 %** sur l'image 0 (tu freines depuis le haut du col), 80 sur « appuies », **100 %** sur « s'enfonce » (signal) ; **0 %** dès que tu braques (le pied a quitté la pédale), veille quand le gravier freine : « Sans toucher la pédale » se lit dans l'en-tête — la vitesse tombe, la pédale est à zéro.
- **Tu ne les écris jamais : tu bouges `kmh` et `pedal`, l'en-tête suit.** Après `toloop`, il lit `FIRST`. Sur le banc, il garde les valeurs de l'histoire (90 km/h, 100 %).

## La caméra roule avec le camion (`ride`) — à lire avant de poser une caméra

- `ride` **1** : la pose est écrite autour du camion tel qu'il est sur l'image 0 (son essieu avant à l'origine, `[r]` dans `VIEW`) ; le réalisateur lui ajoute le trajet du camion, `travel(s)`, et à la lumière aussi : **un plan sur le camion tient pendant qu'il dévale**. `ride` **0** : la pose est dans le repère de la route (`[0]` : le virage, la vallée) ou sur le banc (`[b]`).
- **`ride` ne change que sur une coupe.** Une coupe qui garde l'image : la même pose + `travel(s)`, avec `ride` 0.
- **Le film est au ralenti sur la route** : `s` (mètres) avance de `rate(kmh)` = kmh / 3,6 / 2,5 m par seconde de film (≈ 8 à 72 km/h, 10 à 90), en ligne droite (`"none"`) — une route immobile, c'est un camion arrêté. Une coupe POSE `s`. **Les valeurs d'accord** (`RUN`, world.js) : `s` = 0 sur l'image 0 → **167** (`RUN.freeze`) à `freeze` : le temps s'arrête ; le retour sur la route (`toarrive`) repart de 167 → **220** (`RUN.zero`) à `tozero` ; l'acte 3 → **252** (`BED.s0`, la tête de la fosse) sur « plongent », puis → **292** (`STOP`) sur « s'arrêtent ». Le haut du col : **−150** (`RUN.top`).
- Le chemin (`plan.js`, `truckAt`) : droit dans sa voie jusqu'à 222, puis un S vers la droite jusqu'à 252 (cap 16° au plus à 237) qui pose le camion dans l'axe de la fosse. **`steer` est cosmétique** : fais-le suivre le S (à droite de 222 à 237, à gauche de 237 à 252, 0 dans le lit).
- **Dans `look`, une pose complète est absolue** : ajoute `travel(s)` à `tx, ty, tz` d'une pose `[r]` (table dans `docs/027-decors.md`), et tiens `s` dans `state`. `frame(caméra, cible, objectif)` et `road(x, h, z)` (world.js) écrivent une pose juste ; **la route descend** : à 20 m derrière le camion elle est 1,6 m plus haut — une caméra « basse » derrière lui se place avec `road()`, sinon elle passe sous la chaussée.
- **Le banc** est incliné comme la pente et la voie posée sur son bloc : la coupe vers le banc raccorde en place avec `benchOrigin(s)` (vérifié sur planche). Un point de la voie sur le banc : `benchPoint(x, y, z)`.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **La grille seconde par seconde** (`docs/recette-actes.md`) : l'image bouge dès l'image 1, par son sujet (le camion qui dévale, les balises qui défilent, les braises) ; de 10 à 25 s, **un changement toutes les 2 à 3 s** (un geste, une coupe, une étiquette, un mouvement) — aucune plage lente de 2 s ; un son dans le souffle qui suit chaque mot-clé (déjà écrits dans `sfx`, jamais sur un mot) ; « Alors… on l'ouvre » dans un quasi-silence (`suck` puis `hush`) ; le clic de chaque pièce de l'éclaté.
- **Les mots qui frappent** (`D.punch(t, 0.06)`, un par phrase au plus, jamais sur une coupe, jamais sur l'image 0, jamais deux à moins d'une seconde) : « freins » (`choc`), « chauds », « pied », « non », « ravin », « ronds », « s'enfonce » (repos), « s'enfoncent », « pédale » (réponse). `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **« Alors… on l'ouvre. »** : la phrase signature — seule dans son plan, le monde figé (`freeze`), et l'éclaté s'ouvre SUR « on » (`explode`).
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) ; il rend la main à l'instant où le suivant coupe ; rien d'un plan ne déborde sur le suivant. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.
- **Chaque coupe est un raccord** (forme, objet, mouvement) : on coupe sur la pièce que la phrase vient de nommer, ou dans le sens du mouvement. Les raccords sont écrits dans les tables.
- Mouvements `sine.inOut`, longs ; un recul ou une plongée par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La caméra traverse le verre (le camion, la cabine), jamais le système (la roue, le tambour, la pédale, le gravier), jamais toi.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête (sans `--bare`).
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet (autour du camion quand la caméra roule), `fs` sa taille (≈ 60 le tambour ou la pédale, ≈ 150 une roue, ≈ 1 100 le camion, ≈ 2 500 la descente, ≈ 300 la comparaison, ≈ 40 les grains ; `SIZE` sur le banc entier).
- **Couleurs** : `mood` 1 sur la route jusqu'à « s'arrêtent », 0 sur le banc et après — jamais à mi-chemin plus d'une demi-seconde. `danger` 0,6 → 1 sur « ravin », retombe après l'arrêt.
- **Le temps s'arrête** à `freeze` : `s` tenu, et tout ce qui file s'arrête avec lui (roues, braises, balises : ils lisent `s` et `kmh`, pas l'horloge — vérifie-le).
- Toi, de près, es de verre : jamais en très gros plan, jamais la main seule (les mains SUR le volant, le pied SUR la pédale). Personne n'est blessé.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée. S'il t'en manque un, écris-le sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf (« ≈ 0,5 g » de `chip-g` garde sa minuscule par une règle de `index.html`). **26 images lues au plus.** Journal : `docs/journal/027-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire de la consigne, jamais dans le dépôt, JAMAIS dans `renders/`.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-deux` (Avant la voie / Deux secondes, encre — optionnelle) · `#rail-seuil` · `chip-g` (Le gravier freine / ≈ 0,5 g, veille) · `#retitle` (Cette voie : « Freine » barré → « Fait payer ») · `#duel` (« Toi, en descente… » : Frein ou Moteur — chacun s'allume sur son mot) · `#net` (« Ça remonte chez » / chauffeurs) · `#next` (Prochain dossier · 028 — « Chez toi, un gaz sans odeur. » — S'abonner pour l'ouvrir) · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre : « Panneau », « Accès », « Fosse de gravier », « Glissière béton », « Butte de terre » ; puis « Ronds » (veille) et « Concassés » (encre). Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

## La première image — quatre candidates

**« Ton camion n'a plus de freins. »** — elle montre le camion qui dévale, ses freins au rouge. Les poses (`VIEW`, image 0, `s` 0 : pas de `travel` à ajouter) sont prêtes ; la planche se tire sur les vrais décors (`camion.js` et `col.js` finis), `heat` 0,8, `pedal` 0,6 ; celui qui orchestre choisit AVANT les actes et colle `POSE0` dans `world.js`. Notes sur bouchons (six points de `docs/recette-agents.md` : événement · perspective basse · menace derrière · forme reconnue d'où on ne la voit jamais, ≥ 40 % · système déjà là · le sujet bouge dès l'image 1) :

| | la pose | 1 | 2 | 3 | 4 | 5 | 6 | |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **(a) « les tambours »** `VIEW.rear` = `POSE0` | `{ tx: -40, ty: 190, tz: 500, d: 1858, az: -4.9, el: 1.6, fov: 44, shift: 120 }` | ✓ tambours rouges, braises | ✓ à 55 cm du bitume | ✓ chevrons au fond, à travers la remorque | ✓ la remorque de dos, ≈ 60 % | ~ la voie, point veille au loin à droite | ✓ route et balises qui défilent | **5,5** |
| **(b) « la roue »** `VIEW.wheel` | `{ tx: -60, ty: 6, tz: -800, d: 1190, az: -6.8, el: 3.3, fov: 50, shift: 140 }` | ✓ la roue qui tourne, son tambour | ✓ 45 cm | ✓ la descente et les chevrons derrière la roue | ✓ une roue de camion au ras de la route, ≈ 60 % | ~ la voie, au loin, peut-être cachée par la roue | ✓ la roue tourne | **5** |
| (c) « dessous » `VIEW.under` | `{ tx: 0, ty: -46, tz: -1200, d: 1845, az: 0, el: 4.2, fov: 54, shift: 40 }` | ✓ tambours des deux côtés | ✓ sous le châssis | ~ la descente, petite entre les roues avant | ~ un dessous de camion : pas reconnu d'emblée | ✗ | ✓ | 3,5 |
| (d) « la carte » `VIEW.map` | `{ tx: 100, ty: -720, tz: -9000, d: 21283, az: -4.6, el: 19.5, fov: 40, shift: 100 }` | ~ le camion, petit | ✗ de haut | ✓ virage et ravin | ✗ petit | ✓ la voie bien lisible | ~ | 3 |

Préférence sur bouchons : **(a)**, puis (b). Ce qui départage sur les vrais décors : (a) gagne si la remorque de verre se lit comme un poids lourd et si les chevrons se voient à travers elle ; (b) gagne si la roue pleine et son tambour rouge font l'image — et elle a un avantage de montage : « Ils ne sont pas cassés » plonge vers le tambour **en un seul mouvement** (avec (a), c'est la première coupe de l'acte 1). Dans les deux cas, la voie au loin doit rester lisible (point 5) : sinon, lever `laneLit` sur l'image 0.

## 01 · MENACE — `acte1.js` (0 → `tobench` 20,78)

L'acte part de `POSE0` et de `FIRST` ; en UN mouvement, deux coupes au plus ; `ride` 1 tout du long. `s` court de 0 à `RUN.freeze` (167) à `freeze` (≈ 8 m/s jusqu'à « Quatre-vingts », 10 m/s après) — puis il est tenu. Il FINIT sur une pose large derrière le camion, la voie devant à droite (`VIEW.lane`, ou la tienne), `s` = 167 : c'est de là que l'acte 2 coupe (`benchOrigin(RUN.freeze)`).

| repère | la voix | l'image |
| --- | --- | --- |
| 0 → `intact` 2,22 | « Ton camion n'a plus de freins. » | `POSE0`, `FIRST` : le camion dévale, tambours rouges (`heat` 0,8), braises, balises qui défilent ; **sur « freins »** (`choc` 1,16) : `D.punch`. Les freins sifflent dans le souffle (sfx) |
| `intact` 2,22 → `chauds` 3,50 | « Ils ne sont pas cassés : » | vers le tambour-héros (`VIEW.drum`) : plongée par rapport si l'image 0 est (b), **coupe 1** sinon (raccord : des tambours de la remorque au tambour avant, même lueur) ; **sur « cassés »** (2,32) : `cutaway` 0 → 1 (≈ 0,35 s) — le tambour s'ouvre, les mâchoires sont entières |
| `chauds` 3,50 → `cailloux` 5,46 | « ils sont trop chauds. » · « Ce qui va t'arrêter ? » | **sur « chauds »** (3,60) : `heat` → 1, la garniture et la face du tambour au rouge, `D.punch` ; puis `cutaway` → 0 et la caméra ressort de la roue, monte le long de la cabine, regarde devant (« t'arrêter ? ») |
| `cailloux` 5,46 → `chauffer` 7,02 | « Des cailloux. » | loin devant à droite, la voie s'allume : **sur « cailloux »** (5,56) `laneLit` 0,35 → 1 — la promesse, sans légende ; la caméra pousse vers elle |
| `chauffer` 7,02 → `pied` 8,47 | « Et ce qui les a fait chauffer… » | `laneLit` → 0,35 ; la caméra revient vers la cabine et descend le long de ta portière (à travers le verre) |
| `pied` 8,47 → `appuies` 9,48 | « c'est ton propre pied. » | ton pied sur la pédale (`VIEW.pedal`), `pedal` 0,6, feux stop allumés ; **sur « pied »** (8,57) : `D.punch` (coupe 2 si le mouvement n'y arrive pas) |
| `appuies` 9,48 → `pedale` 10,32 | « Tu appuies : » | sur « appuies » (9,58) : `pedal` 0,6 → 0,8 |
| `pedale` 10,32 → `non` 11,92 | « la pédale s'enfonce, » | **sur « s'enfonce »** (10,74) : `pedal` → 1 (≈ 0,4 s, `power2.in`) — la pédale au plancher, l'en-tête « Pédale 100 % » |
| `non` 11,92 → `v80` 12,60 | « le camion non. » | on sort de la cabine : le camion entier qui dévale (`VIEW.side`), feux stop qui brûlent, tambours rouges : rien ne ralentit ; **sur « non »** (12,02) : `D.punch` |
| `v80` 12,60 → `v90` 13,36 | « Quatre-vingts. » | `kmh` 76 → 80 sur le mot (12,66) ; la caméra file avec le camion |
| `v90` 13,36 → `bas` 14,56 | « Quatre-vingt-dix. » | `kmh` → 90 sur le mot (13,42) ; la caméra s'élève derrière le camion |
| `bas` 14,56 → `ravin` 16,00 | « En bas, un virage… » | `VIEW.ahead` : la descente qui plonge ; au fond, le virage et ses chevrons |
| `ravin` 16,00 → `droite` 16,80 | « et le ravin. » | **sur « ravin »** (16,10) : `danger` 0,6 → 1 — les chevrons et le bord flambent, le vide derrière ; `D.punch` |
| `droite` 16,80 → `secondes` 18,88 | « À droite, une voie de gravier. » | la caméra glisse vers la droite : le panneau, l'accès, la fosse ; sur « gravier » (17,78) : `laneLit` → 1 |
| `secondes` 18,88 → `freeze` 19,38 | « Tu as deux secondes. » | la caméra recule et monte derrière le camion (vers `VIEW.lane`) : le camion, la voie devant à droite, le virage au-delà ; `chip-deux` (optionnelle) de `secondes` à `freeze` + 0,5 |
| `freeze` 19,38 → `tobench` 20,78 | *(silence)* « Alors… » | **le temps s'arrête** : `s`, `kmh` tenus, plus rien ne file ; la caméra presque immobile sur `VIEW.lane` (une poussée lente) — le plan que l'acte 2 coupe |

## 02 · AUTOPSIE — `acte2.js` (`tobench` 20,78 → `tozero` 43,19)

Le banc : la voie entière posée sur son bloc. `mood` 0. « Alors… on l'ouvre » est seul dans son plan. Départ : `benchCut(D, { at: tobench, set: SET.BENCH, view: <la pose où l'acte 1 finit>, origin: benchOrigin(RUN.freeze), state: { ...BENCHED } })` (le banc raccorde en place, `ride` 0).

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` 20,78 → `explode` 20,92 → `panneau` 22,30 | « …on l'ouvre. » | la coupe en place : la montagne, la route, le camion disparaissent, la voie reste ; **sur « on »** (20,92) : `explode` 0 → 1 (≈ 0,9 s, `power2.out`), recul par rapport vers `VIEW.exploded` ; les trois clics (sfx) |
| `panneau` 22,30 → `access` 23,62 | « Un panneau, bien avant. » | la caméra au panneau (`VIEW.panelBench`) ; `litPanel` 1 ; `co.add` « Panneau » |
| `access` 23,62 → `fosse` 25,26 | « Puis la voie quitte la route : » | la caméra file le long de la voie ; `litPanel` 0, `litAccess` 1 : le biseau qui quitte la rive ; `co.add` « Accès » |
| `fosse` 25,26 → `glissiere` 26,46 | « une fosse de gravier, » | au-dessus de la fosse : le gravier soulevé, la fosse vide dessous ; `litGravel` 1 ; `co.add` « Fosse de gravier » |
| `glissiere` 26,46 → `bout` 27,98 | « une glissière de béton… » | `litRail` 1 ; `co.add` « Glissière béton » |
| `bout` 27,98 → `torepos` 29,88 | « et au bout, une butte de terre. » | la caméra arrive au bout : sur « butte » (28,72) `litBerm` 1 ; `co.add` « Butte de terre ». **Couverture** : `eclate$` (29,36), tout allumé — à proposer |
| `torepos` 29,88 → `ronds` 31,30 | « Dans la fosse, » | `explode` → 0 (le gravier retombe dans sa fosse) pendant que la caméra plonge, par rapport, dans la fosse (vers `VIEW.grains`) |
| `ronds` 31,30 → `expres` 32,02 | « des grains ronds. » | les grains, de tout près : ronds, un par un ; **sur « ronds »** (31,40) : `D.punch` |
| `expres` 32,02 → `arretent` 32,86 | « Exprès : » | recul par rapport vers `VIEW.demo` ; `crushed` 0 → 1 (la moitié droite devient concassée, le muret monte), `wheelIn` 1 : deux roues à la tête de la fosse |
| `arretent` 32,86 → `court` 33,30 → `concasses` 33,94 → `ronds2` 34,90 | « ils arrêtent plus court que des grains concassés. » | les deux roues partent ensemble sur « arrêtent » : `benchS` 0 → 8 (jusqu'à ≈ 33,7, `power1.out`), `twinS` 0 → 20 (jusqu'à ≈ 34,6, `power1.out`), `sink` 0 → 0,5 — la ronde s'arrête sur « court », la concassée file jusqu'à « concassés » ; `co.add` « Ronds » (veille), « Concassés » (encre) |
| `ronds2` 34,90 → `enfonce2` 36,78 | « Ronds, ils roulent sous la roue… » | la caméra plonge vers la roue-héros arrêtée (`VIEW.section`) ; `section` 0 → 1 (la coupe s'ouvre) ; `benchS` 8 → 8,4 : les grains roulent sous elle |
| `enfonce2` 36,78 → `toarrive` 37,73 | « …qui s'enfonce. » | **sur « s'enfonce »** (36,88) : `sink` 0,5 → 1 — la roue descend dans les grains ; `D.punch` |
| `toarrive` 37,73 → `toseuil` 39,91 | « Et ton camion arrive à quatre-vingt-dix. » | **coupe** (raccord sur la roue : la même pose rapportée au moyeu, du banc au camion — `moved(pose, centre de la roue sur le banc, HUB_FL)`) : `{ ...STAGED, s: RUN.freeze, kmh: 90, pedal: 1, heat: 1 }` — le temps repart : `s` → `RUN.zero` à `tozero` (`"none"`) ; la caméra se dégage le long du flanc ; 90 redit sur « 90 » (38,80) |
| `toseuil` 39,91 → `tozero` 43,19 | « Abonne-toi : tes quarante tonnes… regarde-les s'enfoncer. » | `followCall` (`from` `seuil`, `to` min(`seuil$` + 0,15, `tozero` − 0,1)) ; **le film ne s'arrête pas** : la caméra descend déjà vers les roues avant, l'accès devant à droite (vers `VIEW.entry`) : « regarde-les s'enfoncer » |

## 03 · RÉPONSE — `acte3.js` (`tozero` 43,19 → `toverdict` 56,65)

En coupes, un plan par souffle, `ride` 1. `s` : 220 à `tozero` → 252 sur « plongent » (≈ 46,1, `"none"`) → 292 à ≈ 56,0 (`power1.out` : une décélération constante) ; `kmh` 90 → 0 sur le même intervalle (`"none"`). `mood` 1 jusqu'à « s'arrêtent ».

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` 43,19 → `roues` 44,34 | « Tu braques à droite. » | **coupe** : tes mains et le volant (`VIEW.hands`) ; sur « braques » (43,40) : `steer` 0 → 0,5 (`power2.out`), `pedal` 1 → 0 (le pied quitte la pédale : « Pédale 0 % ») |
| `roues` 44,34 → `plongent` 46,02 | « Tes roues avant quittent le bitume… » | **coupe** : au ras des roues avant (`VIEW.entry`), le camion qui se déporte dans le S ; `steer` → −0,2 (il se redresse) ; la roue-héros va vers le bout du bitume |
| `plongent` 46,02 → `trigger` 47,39 | « et plongent dans le gravier. » | même plan : sur « plongent » (46,12) les roues avant tombent dans le gravier (`s` = 252), `sink` 0 → 0,4 : le nez pique, le gravier gicle ; `steer` → 0 |
| `trigger` 47,39 → `tour` 48,94 | « Les pneus s'enfoncent. » | **coupe** : la roue-héros dans le gravier (`VIEW.sinkL`) ; **sur « s'enfoncent »** (47,84) : `sink` → 1, la vague de gravier ; `D.punch` |
| `tour` 48,94 → `environ` 51,02 | « Chaque tour de roue pousse le gravier devant elle. » | même plan (ou plus bas) : la roue tourne, sur « pousse » (49,64) la vague avance devant elle, les grains roulent |
| `environ` 51,02 → `sans` 53,06 | « Environ une demi-gravité de freinage. » | **coupe** : large (`VIEW.bedWide`) : tout le camion bas dans le lit, qui ralentit — la vitesse tombe dans l'en-tête (veille) ; `chip-g` de `gravite` (51,63) à `sans` − 0,15 |
| `sans` 53,06 → `tonnes2` 54,86 | « Sans toucher la pédale. » | **coupe** : ton pied au-dessus de la pédale (`VIEW.pedal`), `pedal` 0 ; **sur « pédale »** (53,73) : `D.punch` |
| `tonnes2` 54,86 → `stop` 55,53 | « Et tes quarante tonnes… » | **coupe** : de haut, derrière (`VIEW.top`) : le camion dans la fosse, ses ornières, la butte devant |
| `stop` 55,53 → `toverdict` 56,65 | « s'arrêtent. » | `s` arrive à 292, `kmh` à 0 sur « s'arrêtent » (55,63–56,0) ; **sur « s'arrêtent » : `mood` 1 → 0** — le relâchement ; `danger` → 0,3, `heat` → 0,7 |

## Fin — `fin.js` (`toverdict` 56,65 → 86,07)

**L'ordre : chute → ce qui est dû + commentaire → like → prochain dossier → boucle.** Plus rien du sujet ne revient après l'annonce ; la voix ne redemande pas l'abonnement, c'est le panneau. Compare ta dernière image à la première (`look` aux deux instants) ; `D.commit` prévient dans la console si un nombre n'est pas revenu — `look` ne l'affiche pas, relis `D.first`. Forme : `episodes/025-esp/src/fin.js`.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` 56,65 → `strike` 58,46 | « Voilà le secret : cette voie n'a aucun frein. » | **coupe** (raccord : la même fosse, de plus haut) : au-dessus du camion arrêté (`VIEW.top`, `{ ...STAGED, s: STOP, kmh: 0, pedal: 0, sink: 1, mood: 0 }`) : ses ornières depuis la tête de la fosse, la butte intacte ; `retitle` : « Cette voie / Freine » entre sur `secret` + 0,1, **barré sur `strike`** (« aucun ») |
| `verdict` 59,69 → `dernier` 61,56 | « Elle fait payer chacun de tes tours de roue… » | « Fait payer » sur `verdict` (« payer ») ; `D.verdict(verdict)` ; la caméra descend vers la roue-héros, le long de son ornière |
| `dernier` 61,56 → `tocta` 62,65 | « …jusqu'au dernier. » | la roue-héros arrêtée dans le gravier, sa vague devant (`VIEW.sinkL`) ; titre sorti à `tocta` − 0,42 |
| `tocta` 62,65 → `freinait` 63,72 | « Et ton pied ? » | **coupe** : ton pied, sur la pédale (`VIEW.pedal`) — le C de l'accroche, payé |
| `freinait` 63,72 → `descente` 65,84 | « Il freinait sans arrêt depuis le haut du col. » | **coupe** : le haut du col (`VIEW.colTop`, `s` −150 qui court) : le camion qui descend de la crête, feux stop allumés (`pedal` 0,7), `heat` 0,3 → 0,9 le long de la phrase |
| `descente` 65,84 → `acoups` 69,12 | « En descente, on garde en général le rapport de la montée, » | le même camion, plus lent (`kmh` 50), `pedal` 0 (aucun feu stop), `heat` → 0,3 : les tambours s'éteignent |
| `acoups` 69,12 → `ask` 69,84 | « et on freine par à-coups. » | `pedal` 0 → 0,7 → 0 deux fois (avec les deux souffles d'air du sfx, 69,53 et 69,75) : les feux stop clignent deux fois, la chaleur reste basse |
| `ask` 69,84 → `tolike` 73,84 | « En commentaire : toi, en descente… frein, ou moteur ? » | `duelCall({ from: ask, aAt: choiceA, bAt: choiceB, to: tolike − 0,3, toneA: "signal", toneB: "veille" })` — « Frein » s'allume sur « frein » (72,30), « Moteur » sur « moteur » (72,82) ; le film ne répond pas ; l'image : ta cabine, le pied au-dessus de la pédale |
| `tolike` 73,84 → `toabo` 77,43 | « Like : ça remontera chez un chauffeur qui descend un col ce soir. » | **coupe** : le col la nuit, de haut (`VIEW.map`, `s` ≈ −120) : un camion qui descend ; `likeCall({ from: tolike + 0,12, to: like$ + 0,12, count: 5, label: (n) => \`${n} chauffeurs\` })` |
| `toabo` 77,43 → `toloop` 83,23 | « Prochain dossier : chez toi, un gaz sans odeur. Une centaine de morts par an… et un boîtier. » | **coupe** : la vallée la nuit (`VIEW.valley`, `ride` 0) ; sur « chez toi » (`cheztoi` 78,45) : `home` 0 → 1 — une fenêtre s'allume, loin en bas ; `nextFile({ showAt: toabo + 0,06, factAt: gaz, hideAt: toloop − 0,38, railFrom: toabo + 0,1, railTo: abo$ + 0,15 })` |
| `toloop` 83,23 → `rewind` 84,64 → la fin | « Lui aussi attend… le jour où… » | **coupe** : la descente, le camion qui arrive (`{ ...STAGED, s: −rate(72)·(fin − toloop) ≈ −23, kmh: 72, pedal: 0,6, heat: 0,8, danger: 0,6, laneLit: 0,35, home: 0 }`), la voie qui attend au loin, veille ; `s` file en ligne droite jusqu'à 0 sur la dernière image (jamais à reculons) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène tout à `FIRST` et `POSE0` (voir la fin du 025 pour `gap`, ici `s`) |

## Ce qui reste fragile (à regarder en premier sur les planches)

- **Le camion de verre la nuit** : il doit se lire comme un 40 t à 270 px (silhouette, roues), pas comme un fouillis de traits ; les tambours rouges ne doivent pas baver (au-dessus de 3, ça bave).
- **La voie sur l'image 0** : un point veille au loin — lisible ou non ; sinon, `laneLit` plus haut sur l'image 0 seulement.
- **Les grains** : ronds contre concassés en gros plan, la comparaison à 270 px, la coupe (grains en profondeur, une roue qui descend).
- **Le temps arrêté** (`freeze` → `toarrive`, et sur le banc) : rien ne doit continuer de filer.
- **L'échelle** : 16,6 m de camion, 66 m de fosse, une descente de 500 m — vérifie que le virage et le ravin se lisent depuis `VIEW.ahead` (le brouillard de la scène, `FOG`, peut les manger).
- **Le raccord du retour** (`toarrive`) : la roue du banc → la roue du camion, au même endroit de l'image.

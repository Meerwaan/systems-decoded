# 019 · Prétensionneur — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (119,7 s, soit ≈ 90 s dites). Tout instant se lit dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits et vérifiés sur la table de `npm run script -- 019` : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui presque vides, ils ne portent que les coupes qui passent la main) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/017-irm/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`). Les poses qui cadrent bien sont dans les journaux des décors : `docs/journal/019-model.md`, `019-cabine.md` — pars d'elles ; celles de `VIEW` sont des points de départ.

## La scène, et ce qu'on a le droit d'affirmer

Choc frontal contre un mur. Tu n'as pas encore bougé que ta ceinture se resserre toute seule : dans le pied du montant de ta porte, une charge vient de partir dans l'enrouleur — son gaz lance une turbine, la bobine tourne à l'envers et reprend le mou de la sangle. Puis ton corps arrive dans une sangle déjà tendue ; quand l'effort atteint 300 à 400 kilos, la barre de torsion au centre de la bobine se tord et rend de la sangle, exprès. Sourcé : le prétensionneur d'enrouleur à turbine, déclenché par les capteurs de l'airbag, peut partir sans lui (NHTSA) ; 15 à 20 ms dans les essais à 56 km/h (IRCOBI 2023) ; limiteur à barre de torsion, 3 à 4 kN (NHTSA, IRCOBI) ; usage unique (notice Kia).

- **Le prétensionneur RETIRE LE MOU, il ne retient pas.** À l'image, la sangle se plaque sur toi ; elle ne te tire jamais en arrière. C'est la sangle, puis la barre, qui retiennent.
- **Personne n'est blessé à l'image.** Même dans la scène « si rien ne la retend », ta tête s'arrête loin du volant. Le passager arrière ne bouge jamais.
- Aucun chiffre à l'écran en dehors de l'en-tête et des étiquettes écrites ci-dessous : **pas de centimètres** (aucune longueur de sangle n'est publiée), pas de délai avant l'airbag, pas de vitesse.
- Les airbags du 011 existent (`bags`) : pâles, jamais commentés, sans étiquette. Ils n'apparaissent qu'à la fin de l'acte 3, pour recevoir ta tête. Le film parle de la ceinture.
- La scène de l'acte 1 « Ta voiture s'arrête… ton corps continue… du mou… c'est déjà trop » montre ce qui se passerait **si rien ne retendait la sangle** : l'étiquette `chip-sans` le dit, elle est à l'écran pendant toute la scène.
- Le montage (turbine) est un type parmi d'autres ; le blocage du quotidien (pendule) est une AUTRE pièce, mécanique, qui ne reprend pas le mou.

## L'en-tête : les millièmes de seconde, et la sangle

- **`ms`** (en grand) : les millièmes de seconde depuis le choc, au ralenti — un nombre de l'état, que TU conduis. `T+00 ms` à la première image. **Jusqu'à 20, c'est le chiffre de la voix** (« une vingtaine de millièmes de seconde ») : fais-le arriver à 20 sur `taut`. Au-delà, aucune source ne donne de temps : `main.js` l'affiche alors arrondi à la dizaine, avec « ≈ » ; reste dans ces ordres de grandeur — ≈ 40 quand ton corps arrive, ≈ 90 à la fin de l'acte 3 (le palier du limiteur dure de l'ordre de 60 ms sur la courbe d'exemple d'IRCOBI). Négatif tant que le mur n'a pas touché (`gap` > 0) : un mètre ≈ 60 ms à la vitesse des essais.
- **Le second compteur, « Sangle »**, se lit tout seul : `load` < 10 → « Du mou » (signal) tant que `slack` > 0,5, puis « Tendue » (veille) ; `load` ≥ 10 → « ≈ 300 kg », signal tant que ça monte, **veille dès que `give` > 0** (la barre cède : l'effort est tenu). « Du mou » → « Tendue » → « ≈ 400 kg » qui passe au vert : c'est tout le film en un coup d'œil. `load` ne dépasse jamais 400 (`LIMIT`).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 (les boutons de TikTok couvrent x > 905 de 880 à 1760) · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin. Pas de `jolt` sur un plan large plein de lignes horizontales (la voiture de profil).
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 150 sur toi et ta sangle, ≈ 330 pour la voiture entière, ≈ 30 sur l'enrouleur dans son montant, `SIZE` sur l'établi).
- **Couleurs** : signal est la menace — le choc, ton corps qui part, la force de la sangle sur ta poitrine, le mou ; veille est ce que fait le système — l'ordre, le gaz, la sangle qui se retend, la barre qui cède exprès ; ink est le reste, l'éclair de la charge est blanc. `mood` 1 dans la voiture pendant le choc, 0 sur l'établi et dès que la barre a cédé. Jamais à mi-chemin plus d'une demi-seconde.
- Le film est AU RALENTI : `crush`, `lunge`, `debris` avancent lentement et sans à-coup ; ce qui est rapide dans l'histoire (la sangle qui file) se lit par sa trame qui court.
- Le même objet se montre du même côté d'un plan à l'autre : l'enrouleur est tourné pareil dans la voiture et sur l'établi (une pose de la voiture vaut sur l'établi, déplacée de `HOME` : `benchCut` le fait).
- Toi, de près, es un mannequin de verre : jamais en très gros plan, jamais la main seule. C'est la sangle, pleine et claire, qu'on regarde.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **30 images lues au plus.** Journal : `docs/journal/019-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-charge` (Dans le montant / Une charge — veille) · `chip-sans` (Si rien ne la retend / Tu pars plus loin — signal) · `chip-mou` (Manteau, position / Du mou — signal) · `chip-pendule` (Au freinage / Un pendule bloque — ink) · `chip-bloque` (Bloquée / Le mou reste — signal) · `chip-ordre` (Capteurs de l'airbag / L'ordre — veille) · `chip-tendue` (Environ vingt millièmes de seconde / Sangle tendue — veille) · `chip-barre` (La barre se tord / La sangle repart — veille) · `chip-plafond` (Effort plafonné / Exprès — veille) · `#retitle` (Ta ceinture : « Retient, c'est tout » barré → « Serre, puis cède ») · `chip-usage` (La charge est partie / Ceinture à remplacer — ink) · `#cta-field` (« Ta voiture a déjà tapé ? » → « UNE FOIS », `chars` 8) · `#net` · `#next` (Prochain dossier · 020 — « 660 tonnes d'acier, suspendues en haut d'une tour. » · S'abonner pour l'ouvrir) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `014-abs/src/acte2.js`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

Deux mouvements, deux coupes au plus : (1) l'accroche, en UN mouvement — ta poitrine → ton épaule → l'anneau → le long du montant → l'enrouleur ; (2) coupe `toscene` : la scène « si rien ne la retend », en UN mouvement — le profil large → ta poitrine. La coupe `tosystem` appartient à l'acte 2. C'est toi qui règles `POSE0` et `FIRST` : rends-les dans ton message final, prêts à coller dans `world.js`. Choisis la première image sur une planche de quatre cadres.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, `FIRST` : l'instant du choc, `T+00 ms`. Toi, droit au volant, de trois quarts avant ; en travers de ta poitrine la sangle, LÂCHE, l'objet le plus clair du cadre ; derrière ton épaule, le montant et l'enrouleur dans son pied. Le pare-chocs touche le mur. **Ça bouge dès l'image 1** : la trame de la sangle court déjà vers l'anneau (`slack` 1 → 0,75), le nez commence à se plier (`crush` 0,03 → 0,25 sur toute l'accroche), `ms` compte, la caméra glisse vers ta poitrine. La première image doit arrêter le pouce sans texte. |
| `still` | « Choc frontal. Tu n'as pas encore bougé… » | `lunge` reste à 0 pendant que le nez se plie et que les éclats partent (`debris` 0 → 0,25) : tout bouge sauf toi — c'est l'image de la phrase |
| `tight` → `alone` | « et ta ceinture se resserre, seule. » | sur « resserre » : `slack` 0,75 → 0, vite — la sangle se plaque sur ta poitrine, sa trame file vers l'anneau ; l'en-tête passe de « Du mou » à « Tendue » (veille) ; `ms` arrive à 20 sur `alone` ; `fire` 0 → 0,8 en même temps (hors champ : la charge est en train de partir) |
| `blast` → `retend` | « Une charge explosive vient de partir, pour la retendre. » | la caméra suit la sangle : ton épaule → l'anneau (`VIEW.ring`) → le long du montant (`VIEW.pillar`) → l'enrouleur ; on y arrive sur « partir » : le gaz luit encore dans le carter, puis s'éteint (`fire` 0,8 → 1) ; `xray` 0 → 0,5 ; `chip-charge` |
| `butonce` → `once` | « Mais ça, elle ne le fera… qu'une fois. » | de près sur le générateur, TIRÉ (`fire` 1) : sombre, noirci. L'image TIENT. Le nom du système ne s'affiche pas |
| `toscene` → `stops` → `mur` | « Ta voiture s'arrête contre le mur. » | **coupe** : `VIEW.profile`, `{ ...STAGED, gap: 1, ms: -60, crush: 0 }` — la même voiture, AVANT : le mur arrive (`gap` 1 → 0 sur « s'arrête », `ms` −60 → 0), le nez se plie (`crush` 0 → 0,8 jusqu'à `goeson`), `debris` ; `chip-sans` en zone haute, de `stops` à juste avant `loose` (fixe : la caméra voyage) |
| `goeson` | « Toi, non : ton corps continue. » | `lunge` 0 → 0,35 : ton corps part vers l'avant dans une sangle qui ne s'est PAS retendue (`slack` reste à 1, `fire` 0) ; la caméra descend déjà vers toi (`VIEW.side`) ; `ms` court (≈) |
| `loose` | « Et ta ceinture a toujours un peu de mou. » | de profil, de près : le jour entre la sangle et ta poitrine ; l'en-tête dit « Du mou », signal ; `chip-sans` sort juste avant `loose`, `chip-mou` prend sa place (une seule étiquette à la fois) et reste jusqu'à `back` |
| `manteau` → `posture` | « Ton manteau. Ta position. » | sur « manteau » : `coat` 0 → 1, la coque matelassée s'allume sous la sangle ; sur « position » : `lean` 0 → 1, ton dos quitte le dossier, la sangle quitte ton épaule |
| `fewcm` → `toomuch` | « Quelques centimètres… c'est déjà trop. » | `lunge` 0,35 → 1 : la sangle finit par mordre, TARD — tu es allé plus loin ; sur « trop » : `load` 0 → 400 d'un coup (la sangle luit signal, l'en-tête : « ≈ 400 kg », signal). Ta tête s'arrête loin du volant. L'image tient jusqu'à `back` ; aucun centimètre affiché |
| `back` → `tosystem` | *(silence)* | toutes les étiquettes sorties ; la caméra commence à remonter le long de la sangle vers ton épaule — l'acte 2 coupe |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tosystem` | « Alors… » | **coupe** : `VIEW.system` dans la voiture, `{ ...STAGED, shell: 0.25, you: 0, wall: 0, mood: 0, fx/fy/fz sur HOME, fs: 30 }` — il ne reste que l'enrouleur dans un fantôme de montant, sa sangle qui monte. Le calme d'un coup ; une poussée lente |
| `tobench` → `explode` | « on l'ouvre. » | `benchCut` de `VIEW.system` vers l'établi (`origin: HOME`, `BENCHED`) : le même objet, à la même place ; **sur « on »** : `explode` 0 → 1, recul vers `VIEW.exploded` — la rangée en travers de la caméra |
| `p1` | « Un enrouleur. » | `litFrame` ; légende « Enrouleur » (`co.add`) |
| `p2` | « Sa bobine. » | `litSpool` : la bobine et sa sangle enroulée |
| `p3` → `gen` | « Une charge : le générateur de gaz. » | `litCharge` sur « charge » ; légende « Générateur de gaz » sur `gen` |
| `p4` | « Une turbine. » | `litTurbine` ; ses aubes |
| `centre` → `p5` | « Et au centre… une barre de torsion. » | sur « centre » : `explode` 1 → 0 (la rangée se referme) et `xray` 0 → 1 : la caméra se rapproche (`VIEW.bar`), on voit la barre À TRAVERS la bobine ; `litBar` sur « barre » ; légende « Barre de torsion » |
| `torepos` → `brakes` → `locks` | « Au quotidien, tu freines fort : elle se bloque. » | la caméra passe côté blocage (`VIEW.lockSide`, `xray` 0,6) ; sur « freines » : `tug` 0 → 0,5 — la sangle sort, la bobine tourne, libre ; sur « bloque » : `lock` 0 → 1 (le pendule bascule, le cliquet tombe dans la roue), `tug` → 1 : arrêt net |
| `noboom` → `pendule` | « Aucun explosif : un simple pendule. » | de près sur le pendule dans sa coupelle : `litPendulum` ; `chip-pendule` |
| `butlock` → `nottaken` | « Mais bloquer ne reprend pas le mou. » | recul (`VIEW.strap`) : la bobine est tenue, et la sangle fait toujours son ventre (`slack` 1) — l'image TIENT ; l'en-tête : « Du mou » ; `chip-bloque` |
| `here` → `boom` | « Pour ça, ici… une explosion. » | `lock` → 0, `tug` → 0 ; la caméra glisse vers le générateur (`VIEW.charge`) ; `litCharge` 0 → 1 sur « explosion » — RIEN ne part encore (`fire` 0) : c'est la promesse |
| `toseuil` → `watch` | « Abonne-toi : cette ceinture qui se resserre seule, regarde-la faire. » | `followCall` (les chevrons `#rail-seuil`, le nom du compte s'allume) ; **le film ne s'arrête pas** : la caméra quitte le générateur et remonte la sangle vers son bout — là où est ton épaule (`VIEW.strap`, puis plus haut) ; `xray` → 0 ; sur « regarde » `mood` → 1 |

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes, au ralenti. `ms` court de 0 (sur « Zéro ») à 20 (sur `taut`), d'un trait régulier ; puis ≈ 40 sur `arrives`, ≈ 90 à `less`. `crush` avance lentement pendant tout l'acte (0,03 → 1).

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `shock` | « Zéro. Le choc. » | **coupe** : la voiture et le mur, `VIEW.rear34` ou `VIEW.profile` — `{ ...STAGED, gap: 0.4, ms: -25, crush: 0 }` ; le mur touche sur « Zéro » (`gap` → 0, `ms` → 0) ; sur « choc » : `crush` → 0,2, `debris` 0 → 0,3, la lumière du coup au pare-chocs ; `mood` 1 |
| `sensors` → `ordre` | « Les capteurs de l'airbag donnent l'ordre. » | **coupe** : `VIEW.order`, `shell` 0,6 — sur « capteurs » `order` 0 → 0,15 (le calculateur s'allume, veille) ; sur « l'ordre » `order` → 1 : la tête de lumière court sur le fil jusqu'au pied du montant ; toi, toujours immobile ; `chip-ordre` |
| `tocharge` → `trigger` | « La charge part. » | **coupe** : l'enrouleur dans son montant, de trois quarts (`VIEW.system`, `xray` 0,6, `shell` 0,3, `fs` 30) ; sur `trigger` : `fire` 0 → 0,2 — l'éclair blanc, à la buse |
| `gas` → `spin` | « Le gaz lance la turbine. » | même cadre, on s'approche : `fire` 0,2 → 0,7, `xray` → 1 — le gaz, veille, entre dans le carter, les aubes prennent |
| `turns` → `backward` | « La bobine tourne à l'envers. » | `slack` 1 → 0,3 : la bobine tourne à l'envers, la trame de la sangle DESCEND vers elle ; `fire` → 1 ; la caméra recule pour voir la sangle filer le long du montant |
| `twenty` → `taut` | « Une vingtaine de millièmes de seconde : la sangle est tendue. » | **coupe** : toi, `VIEW.chest` — la sangle court en travers de ta poitrine vers l'anneau ; sur « tendue » : `slack` → 0, elle est plaquée ; l'en-tête : `T+20 ms`, « Tendue », veille. Tu n'as toujours pas bougé (`lunge` 0, `crush` ≈ 0,45) ; `chip-tendue` |
| `tobody` → `arrives` | « Et ton corps… arrive. » | **coupe** : de profil (`VIEW.side`), le volant devant toi ; sur « arrive » : `lunge` 0 → 0,3 — ton corps part, la sangle est déjà là |
| `toreponse` → `crushes` | « Il s'écrase dans la sangle. » | même profil, on resserre : `lunge` 0,3 → 0,85 ; `load` 0 → 200 : la sangle luit signal là où elle porte ; l'en-tête : « ≈ 200 kg », signal |
| `k300` → `k400` → `onchest` | « Trois cents kilos. Quatre cents. Sur ta poitrine. » | `load` → 300 sur « Trois », → 400 sur « Quatre » (l'en-tête le dit avec la voix) ; sur « poitrine » : `lunge` → 1, la lueur au plus fort ; l'image TIENT un instant |
| `tobar` → `twists` | « Alors la barre se tord. » | **coupe** : l'enrouleur, `xray` 1, de près sur la barre (`VIEW.bar` déplacée de `HOME`) : `give` 0 → 0,5 — sa génératrice devient hélice ; l'en-tête reste à « ≈ 400 kg » et passe en VEILLE ; `chip-barre` |
| `payout` → `onpurpose` | « La sangle repart. Exprès. » | `give` 0,5 → 1 : la bobine repart dans l'autre sens, la trame de la sangle MONTE ; sur « Exprès » l'image tient |
| `eases` → `less` | « Et ta poitrine encaisse… moins. » | **coupe** : toi, de profil (`VIEW.side`) — `give` 1 : ton tronc avance encore un peu, en douceur ; `bags` 0 → 1, pâle : ta tête finit dans le sac ; sur « moins » : `load` 400 → 250, la lueur de la sangle retombe, `mood` → 0 ; `chip-plafond` |

## Fin — `fin.js` (`toverdict` → la fin)

L'ordre de la fin, depuis le 018 : **chute → ce qui est dû + le commentaire → like → le prochain dossier, en tout dernier → boucle.** Rien du sujet en cours ne revient après l'annonce ; la voix n'y redemande pas l'abonnement (le panneau `#next` le porte). Compare ta dernière image à la première (`look` aux deux instants) : elle doit être la même. `D.commit` prévient dans la console si un nombre de l'état n'est pas revenu — `look` ne l'affiche pas : relis `D.first`.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `secret` → `notonly` → `before` → `verdict` → `purpose` | « Voilà son secret : ta ceinture ne fait pas que te retenir. Elle se resserre avant que tu bouges… puis elle cède. Exprès. » | **coupe** : l'établi, l'enrouleur et sa sangle (`VIEW.strap`), `{ ...BENCHED, xray: 1 }` — il REJOUE ses deux gestes sur les mots : sur « resserre » (`before`) `fire` 0 → 1, `slack` 1 → 0 (la bobine à l'envers) ; sur « cède » (`verdict`) `give` 0 → 1 (la barre se tord, la sangle repart). `retitle` : « Retient, c'est tout » à `secret`, barré sur `notonly`, « Serre, puis cède » sur `verdict` ; `D.verdict(verdict)` ; tout est sorti avant `tocta` |
| `tocta` → `onlyonce` → `yes` → `spent` | « Une seule fois ? Oui. Une fois la charge partie, » | **coupe** : le même établi, de près sur le générateur TIRÉ (`VIEW.charge`, `fire` 1, `xray` 0) : sombre, noirci — la réponse à la question de l'accroche, tout de suite |
| `noairbag` → `replace` | « même sans airbag, la ceinture se remplace. » | **coupe** : la voiture, de profil (`VIEW.side`) — `{ ...STAGED, crush: 0.15, slack: 0, fire: 1, bags: 0 }` : un choc léger, toi droit, la sangle tendue, AUCUN sac sorti ; sur « remplace » `chip-usage`, posée sur le pied du montant (`world.cabine.A.pillarFoot`) |
| `ask` → `answer` | « En commentaire : ta voiture… elle a déjà tapé ? » | recul vers la voiture contre son mur (`VIEW.rear34`) ; `commentCall` (`from: ask`, `typedAt: answer`, `chars: 8`) ; les chevrons du commentaire |
| `tolike` → `rearseat` → `unbelted` | « Like : pour celui qui, sur la banquette arrière, ne s'attache pas. » | **coupe** : `VIEW.back` — `{ ...STAGED, wall: 0, crush: 0, rear: 1, mood: 0 }` : toi devant, attaché ; derrière toi quelqu'un, sa ceinture pendue le long du montant. Sur « banquette » la caméra glisse vers lui ; sur « s'attache » elle s'arrête sur la ceinture qui pend. Il ne bouge pas. `likeCall` (`label: (n) => n + " passagers"`) |
| `toabo` → `next` → `ball` → `hung` | « Prochain dossier : une boule d'acier de 660 tonnes, suspendue en haut d'une tour. » | **coupe** : l'établi, l'enrouleur entier (`BENCHED`, `slack` 0) ; on s'en approche jusqu'à ce qu'il occupe la moitié de la largeur ; `nextFile` (`showAt: next`, le fait sur `ball`), `rail-follow`. C'est la DERNIÈRE chose que dit le film : le panneau reste jusqu'à `toloop` |
| `toloop` → `rewind` | « Elle aussi, elle attend son… » | **coupe** : la voiture, `{ ...STAGED, gap: 1.2, ms: -75, crush: 0 }`, une pose proche de `POSE0` : le mur arrive. `D.loop({ at: toloop, rewindAt: rewind })` ramène tout à `FIRST` et à `POSE0` : **une boucle causale** — la dernière image EST l'instant de la première, le pare-chocs touche le mur, `T+00 ms`, la sangle lâche, « …son » → « Choc frontal. » Essaie `ease: "sine.in"` pour que le mur n'arrive pas en ralentissant (arrêt de deux images à la couture, vu sur le 014) |

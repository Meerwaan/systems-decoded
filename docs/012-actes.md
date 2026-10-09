# 012 · Gazinière — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (`npm run script -- 012` le donne ; la vraie voix sera ≈ 20 % plus courte). Tout instant se lit donc dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères : le jour où la voix arrive, tout se recale seul. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui vides) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/009-micro-ondes/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`).

## Ce film se joue EN TEMPS RÉEL — c'est ce qu'il a de neuf

La flamme s'éteint à `out` (≈ 3 s) ; le clapet claque à `trigger` (≈ une minute plus tard). **Le chrono de l'en-tête compte les vraies secondes entre les deux**, sans ralenti ni arrêt, à travers l'accroche, l'autopsie et le seuil ; son second compteur additionne le gaz sorti (5 L par minute). Les deux sont câblés dans `main.js` : aucun acte n'y touche. Conséquences pour tout le monde :

- **Dans la cuisine, l'histoire avance** : la pointe refroidit pendant qu'on parle. `heat` et `volts` ne remontent JAMAIS dans la cuisine entre `out` et `trigger` : acte 1 les laisse glisser de 1 vers ≈ 0,8 / 0,85 ; `STAGED` (toute coupe vers la cuisine) les pose à 0,6 / 0,66 ; l'acte 3 les mène sous le seuil (0,36). `flame` reste 0, `gas` reste 1, `valve` 1, `hold` 1 jusqu'à `release`.
- **Sur l'établi, on démontre** : les nombres y prennent les valeurs de la démonstration (une flamme rallumée, une manette enfoncée), pas celles de l'histoire. Le chrono, lui, continue de tourner : pendant qu'on explique, le gaz sort.
- Le « et si » de la nuit (acte 1) est une parenthèse : il est défait avant `tosystem` (`back`).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (un seul panneau ou une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 46 pour la casserole et son feu, ≈ 12 sur le robinet, 6 sur le groupe magnétique, ≈ 250 pour la pièce, `SIZE` sur l'établi).
- **Couleurs** : signal est le GAZ (la flamme, vive ; la brume, terne) et ce qu'il chauffe ; veille est ce que la flamme paie (le courant du fil, la prise de l'aimant) ; ink est le reste. `mood` 1 tant que le gaz sort dans la cuisine ; 0 sur l'établi et dès que le gaz est coupé. Jamais à mi-chemin plus d'une demi-seconde.
- La main ne se filme jamais seule en gros plan (elle fait mannequin) : toi de trois quarts, d ≥ 60.
- Aucune explosion à l'image. L'étincelle de l'interrupteur (`spark`) reste un point de lumière, puis le film revient en arrière.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** (`ease`, `delay`, `duration`, `repeat`, `yoyo`, `stagger`, `snap`…) : la liste de `FIRST` est fermée, n'en ajoute pas.
- Les étiquettes sont en capitales : pas d'unité à symbole (« mV » se lirait « MV »).

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-gaz` (Flamme éteinte / Le gaz sort) · `chip-sans` (Sans sécurité / ≈ 5 L par minute) · `chip-nuit` (Toute une nuit / Cuisine fermée) · `chip-lie` (Inflammable dès / 4 à 5 % dans l'air) · `chip-mv` (La pointe chauffe / 30 millivolts) · `chip-tient` (L'aimant / Retient) · `chip-main` (Ta main / Ouvre le gaz) · `#gauge` (La pointe · courant de la flamme — sa valeur `#gauge-v` et son remplissage suivent `volts` tout seuls, voir `main.js` ; le seuil « L'aimant lâche » est à 36 % ; `#gauge-s0` « La pointe est chaude — l'aimant tient » / `#gauge-s1` « Plus de courant — il lâche » : forme dans `005-arret-urgence/src/main.js`, cherche `gauge`) · `chip-coupe` (Le ressort / Gaz coupé) · `chip-300` (Sans sécurité / ≈ 300 L par heure) · `#retitle` (Ta gazinière : « Détecte le gaz » barré → « Lâche un ressort ») · `#net` · `#next` (Prochain dossier · 013 — « Coupée en deux. En feu. Il en sort vivant. ») · `chip-tige` (À côté de la flamme / La pointe) · `chip-hold` (Manette enfoncée / Quelques secondes) · `#cta-field` (« Ta gazinière, elle a la pointe ? » → « OUI », 3 lettres) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `008-paratonnerre/src/acte2.js`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

Tout l'acte en UN mouvement jusqu'à la nuit (les coupes sont gardées pour l'acte 3) ; une seule coupe : l'interrupteur.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, état `FIRST` : la casserole déborde, la mousse coule sur une couronne de flammes encore vivante. **La caméra bouge dès l'image 1** (elle pousse vers le brûleur) et la mousse continue de monter : c'est ce qui arrête le pouce, sans texte. |
| `spill` | « Ta casserole déborde. » | `spill` → 1 : les coulées tombent sur le brûleur, la vapeur siffle |
| `dying` → `out` | « La flamme s'éteint. » | la caméra descend sous la casserole (`VIEW.burner`) ; `flame` → 0 entre `dying` et `out`, fente après fente. À `out` exactement : plus une flamme (le chrono part de là) |
| `gas` → `still` | « Le gaz, lui… sort toujours. » | `gas` 0 → 1 : la brume terne sort des mêmes fentes ; `boil` → 0,3 (plus rien ne chauffe) ; lente poussée ; `chip-gaz` en zone haute |
| `minute` → `alone` | « Dans une minute environ, il se coupe tout seul : » | la caméra glisse du brûleur vers le dessous de la plaque, à travers le verre (`VIEW.under`) : le robinet, le groupe magnétique ; `xray` → 0,7 ; le chrono de l'en-tête pulse une fois sur « minute » (`tl`, une échelle sur `#hud-clock`) |
| `plug` | « sans prise ni pile. » | elle remonte le fil du thermocouple, du groupe magnétique jusqu'à la pointe (`VIEW.tip`) : le courant veille y court encore (`volts` ≈ 0,9), aucun autre fil ne part de là |
| `sauf` → `piece` | « Sauf si ta gazinière… n'a pas cette pièce. » | sur la pointe, de près : elle luit (`litTip` 0 → 1) puis, sur « pas », elle se dissout avec son fil (`safety` 1 → 0) : le brûleur nu, la brume qui sort |
| `tosans` → `litres` | « Un grand feu ouvert, sans flamme : dans les cinq litres de gaz à la minute. » | recul par rapport depuis le brûleur nu jusqu'à la casserole et la plaque (`safety` 0, `xray` 0, `gas` 1) : la brume monte le long de la casserole ; `chip-sans` |
| `night` → `closed` | « Laisse-le toute une nuit, cuisine fermée… » | long recul par rapport jusqu'à la pièce entière (`VIEW.room`) ; `fill` 0 → 1 sur la phrase : la colonne monte, la couche s'épaissit sous le plafond et descend ; `chip-nuit`, puis `chip-lie` |
| `switch` | « et un interrupteur peut suffire. » | **coupe** : la porte (`VIEW.door`), `you` 2 — tu viens d'entrer, la main sur l'interrupteur, la couche de gaz au-dessus de ta tête ; sur « interrupteur », `spark` 0 → 1,2 en deux images, et l'image TIENT là-dessus (rien n'explose) |
| `back` | *(silence)* | le film revient en arrière en 0,35 s : `spark` → 0, `fill` → 0, `safety` → 1 ; `you` → 0 sur la coupe de l'acte 2 |

L'acte 2 coupe à `tosystem`.

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tosystem` | « Alors… » | **coupe** : la cuisine, le système entier (`VIEW.system`, `STAGED`). La cuisine, la plaque, la casserole et la brume s'effacent autour de lui (`shell` → 0, `gas` → 0 ; `pot` → 0 dès que le verre est parti ; `mood` → 0) : il reste seul |
| `tobench` | « …on l'ouvre. » | `benchCut` : le même système, sur l'établi, à la même place de l'image (`origin` = `SYSTEM.home` − `SYSTEM.bench`, composante par composante). `explode` 0 → 1 (1,2 s, `"none"`), la caméra recule par rapport jusqu'à la rangée (`VIEW.exploded`) |
| `p1` | « Sous la manette : un robinet. » | `litTap` ; légende « Robinet » / « Ouvre le gaz » |
| `p2` | « Un ressort, qui ne demande qu'à le fermer. » | la caméra serre sur le ressort et l'électroaimant, **dans un même cadre** ; `litSpring` ; légende « Ressort » / « Ferme le gaz » |
| `p3` | « Un électroaimant, pour le retenir. » | même cadre : `litSpring` → 0, `litMagnet` → 1 ; légende « Électroaimant » / « Retient le clapet » |
| `p4` | « Et dans la flamme… une pointe de métal. » | elle suit le fil jusqu'à la pointe ; `litTip` ; légende « Thermocouple » / « La pointe » |
| `torepos` → `hot` | « Chauffée, cette pointe… » | **coupe** : l'établi, le système remonté (`explode` 0), la manette enfoncée (`press` 1, `valve` 1), le brûleur allumé (`flame` 0 → 1 juste avant la phrase, `pot` 0 : la couronne libre) ; cadre sur la pointe dans la flamme : `heat` 0 → 1, elle rougit |
| `current` → `mv` | « …fabrique du courant : trente millièmes de volt, au mieux. » | `volts` 0 → 1 : la tête de lumière quitte la pointe et descend le fil ; la caméra la suit jusqu'au groupe magnétique (`xray` → 1) ; `chip-mv` en zone haute |
| `grip` | « Juste assez pour que l'aimant retienne le ressort. » | le groupe magnétique de profil, `xray` 1 : `hold` 0 → 1 ; sur « retienne », `press` 1 → 0 — la manette remonte, le clapet reste ouvert : l'aimant tient ; `chip-tient` |
| `tomain` → `weak` | « Pas assez pour l'attirer : » | **coupe**, même cadre, tout refermé (`valve` 0, `press` 0, `flame` 1, `heat` 1, `volts` 1, `hold` 1) : l'aimant luit, l'armature est à un demi-centimètre… et rien ne bouge |
| `press` | « c'est pour ça que tu gardes la manette enfoncée, » | recul jusqu'à voir la manette et le groupe (`VIEW.tapPart`) : `press` 0 → 1 — la tige pousse le clapet et plaque l'armature contre l'aimant (`valve` → 1) ; `chip-main` |
| `warm` | « le temps qu'elle chauffe. » | `press` → 0 : la manette remonte, tout reste ouvert ; les tirets de gaz courent vers le brûleur |
| `toseuil` | « Abonne-toi : ce gaz qui sort toujours, regarde ce qui l'arrête. » | `followCall` (voir `009/acte2.js`, fin). Le film ne s'arrête pas : **coupe** vers la cuisine (`STAGED`), le brûleur sous la casserole — l'image de l'accroche qui revient, la brume qui sort toujours — et la caméra part déjà vers la pointe. Pas de panneau |

L'acte 3 coupe à `tozero`.

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes : c'est ici qu'elles font la tension. `setAct(tl, 3, zero)`. Le chrono et le compteur de gaz sont dans `main.js` (le compteur passe en veille tout seul à `trigger`).

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `dead` | « La flamme est éteinte. » | **coupe** : le brûleur mort sous la casserole (`VIEW.burner`, `STAGED`), la brume qui s'en va |
| `cool` | « La pointe refroidit. » | **coupe** : la pointe, de près (`VIEW.tip`) ; `heat` 0,6 → 0,12 : son rouge s'éteint. `#gauge` entre en zone haute (elle lit `volts` toute seule) |
| `drop` · `drop2` | « Le courant baisse… baisse… » | la caméra descend le long du fil, sous la plaque (`VIEW.under`), `xray` → 1 : `volts` 0,66 → 0,48 sur le premier « baisse », → 0,39 sur le second — le veille du fil pâlit et se retire vers la pointe |
| `torelease` → `release` | « L'aimant lâche. » | **coupe** : le groupe magnétique, de profil, `xray` 1 (`fs` 6). `volts` passe le seuil (→ 0,3) juste avant « lâche » ; sur le mot, `hold` 1 → 0 en 0,15 s : les lignes de champ meurent. La jauge vire au signal, `#gauge-s0` → `#gauge-s1` |
| `trigger` | « Le ressort claque. » | `valve` 1 → 0 en trois images (`power4.in`) : le clapet sur son siège. Une secousse légère (`jolt`, plan serré). Les tirets de gaz s'arrêtent dans le tube. La jauge sort |
| `shut` | « Le gaz est coupé. » | **coupe** : le brûleur (`VIEW.burner`) ; `gas` 1 → 0 en ≈ 0,8 s : la brume s'amincit et cesse ; `mood` → 0 ; `chip-coupe` |
| `tobilan` → `few` | « Il est sorti quelques litres de gaz. » | recul calme jusqu'à la casserole et la plaque, en veille ; le compteur de l'en-tête pulse une fois (`tl`, une échelle sur `#hud-count`) |
| `hundreds` | « Pas des centaines. » | `chip-300` en zone haute, brève ; elle est sortie avant `toverdict` |

`fin.js` coupe à `toverdict`.

## Chute, appels à l'action, boucle — `fin.js` (`toverdict` → fin)

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `idea` | « Rien n'a détecté ton gaz. » | **coupe** : l'établi, le groupe magnétique fermé, `xray` 1, froid (`BENCHED` + `xray` 1). `retitle` : « Détecte le gaz » arrive avec la phrase, barré sur « détecté » (`idea`) |
| `verdict` | « C'est un ressort : » | « Lâche un ressort » le remplace ; `litSpring` 1 ; `D.verdict(verdict)` |
| `paid` | « la flamme payait pour le retenir. » | **coupe** : la chaîne entière dans un cadre (l'établi, `xray` 1) — la flamme, la pointe rouge, le fil veille, l'aimant qui tient, le clapet ouvert (`flame` 1, `heat` 1, `volts` 1, `hold` 1, `valve` 1) |
| `went` | « Elle s'est éteinte… » | `flame` → 0, puis `heat` → 0 et `volts` → 0 en ≈ 1 s (le film l'a montré en vrai : on le rejoue vite) |
| `shutdown` | « il a fermé. » | `hold` → 0, `valve` → 0 : le claquement. Le titre est sorti avant `tocta` |
| `tocta` | « Like. Ça remontera chez quelqu'un qui cuisine au gaz sans savoir ça. » | **coupe** : l'établi, le système entier (`VIEW.whole`), qui tourne lentement. `likeCall` (5 tuiles, « n personnes ») |
| `toabo` → `next` | « Abonne-toi. Prochain dossier : d'autres flammes. » | sur « flammes », le brûleur de l'établi se rallume (`press` 1, `valve` 1, `flame` 0 → 1) : le feu fait le lien avec le dossier suivant ; `nextFile` (panneau à `next`) |
| `f1` → `halo` | « Une Formule 1 coupée en deux… et l'arceau qui a protégé son pilote. » | la caméra recule et descend ; le fait du panneau à `f1` |
| `tocomment` | « Et la tienne, elle l'a ? » | **coupe** : la cuisine, la plaque SANS casserole, tout froid et fermé (`pot` 0, `spill` 0, `boil` 0, `flame` 0, `gas` 0, `valve` 0, `hold` 0, `heat` 0, `volts` 0, `mood` 0), toi devant (`you` 1), la main sur la manette |
| `look` → `pin` | « Regarde à côté de la flamme : une petite pointe de métal. » | `press` 0 → 1, `valve` 1, `flame` 0 → 1 sur « flamme » ; poussée vers la pointe dans la flamme (`VIEW.tip`), `litTip` ; `chip-tige` |
| `hold` | « Et si tu dois garder la manette enfoncée pour allumer… » | **coupe** : toi de trois quarts, la main sur la manette enfoncée (`VIEW.knob`) ; `heat`, `volts`, `hold` montent ; `chip-hold` |
| `its` | « c'est elle. » | `press` → 0 : ta main se lève, la flamme reste |
| `ask` | « En commentaire : la tienne, elle l'a ? » | `commentCall` (la question s'affiche ; « OUI » se tape : `chars: 3`) |
| `toloop` | « Parce qu'un soir ou l'autre, forcément… » | **coupe** : la cuisine large (`VIEW.kitchen`), un soir comme un autre — la casserole sur le feu (`pot` 1, `flame` 1, `boil` 1, `spill` 0, `you` 0, `mood` 1, tout chaud et tenu : `heat` 1, `volts` 1, `hold` 1, `valve` 1). `rewind` : `D.loop({ at: toloop, rewindAt: rewind, fromD })` — retour à `POSE0` et à `FIRST` : la mousse monte et commence à couler |

La dernière image est la première : `commit` prévient dans la console si un nombre n'est pas revenu.

## Ce que les décors savent faire (rendu par ceux qui les ont construits — détail et autres poses : `docs/journal/012-model.md`, `012-hob.md`, `012-fire.md`)

Vus sur planche par celui qui orchestre : les trois sont au niveau. Les images les plus fortes, à ne pas rater : la casserole qui déborde (`POSE0`), **la couronne de flammes vue de bas (`VIEW.burner`, `flame` 1)**, la pointe dans la flamme sur l'établi (`VIEW.tipPart`), la chaîne flamme → pointe rouge → fil veille → aimant (`VIEW.chain`, `xray` 1), le cœur de profil ouvert puis fermé (`VIEW.magnetPart` sur l'établi, `VIEW.heart` dans la cuisine), toi à l'interrupteur sous la couche de gaz (`VIEW.door`).

- **Le système** (`model.js`, `world.system`) : `press` — la manette et sa tige descendent de 0,5 cm, le clapet décolle, l'armature vient sur les pôles (clapet ouvert = max(`press`, `valve`)). `valve` 1 ouvert / 0 fermé : course de 7 mm, le ressort se détend. `heat` : la pointe rouge, blanche au bout, sa lueur. `volts` : 0 → 0,4 une tête veille descend le fil de la pointe vers l'aimant, 0,4 → 1 intensité et tirets lents (en sens inverse il pâlit puis se retire). `hold` : bobines et pôles en veille, lignes de champ tant qu'il reste un jeu. `xray` : le robinet et la douille en verre ; le gaz en tirets signal de la rampe à l'injecteur si le clapet est ouvert. `explode` : la rangée, en travers d'une caméra à az −44 (compte ≥ 1,2 s) — de gauche à droite de l'image : brûleur et pointe · douille · électroaimant · armature · ressort et clapet · robinet, la manette au-dessus. **La voix les nomme de droite à gauche : c'est un travelling** (`VIEW.rowTap` → `rowHeart` → `rowTip`). Dans la rangée large le cœur est petit (aimant ≈ 35 px) : on ne le nomme qu'en serré (`rowHeart`, d 40 → 30). `lit*` : franc à 1 (0,5–0,7 pour « faiblement »). `safety` 0 : la pointe, son fil et le groupe magnétique dissous, un bouchon sur le robinet. Ancres `world.system.A` : `burner, ports, tip, lead, knob, tap, magnet, spring, seal` (elles suivent leurs pièces, éclatées comprises).
- **La plaque, la casserole, toi** (`hob.js`, `world.hob`) : `shell` efface le verre et les traits de la plaque, du mur ET de la casserole. `pot` : **un fondu** 0–1 (à tweener ; à 0 ni casserole, ni eau, ni mousse). `boil` : houle, bulles, vapeur. `spill` : 0,22 la mousse atteint le bord · 0,3 le dôme · 0,6 trois coulées sur le flanc · 0,84 et 0,92 deux d'entre elles touchent la plaque, de part et d'autre de la pointe (la couronne et la pointe restent visibles entre elles depuis `VIEW.burner` et `VIEW.tip`) · 1 la flaque et son panache. Un reste de panache tient tant que `boil` > 0. `you` 1 : debout devant la plaque, **la main GAUCHE** sur la manette-héros (elle descend avec `press`) ; `you` 2 : dans la porte, la main sur l'interrupteur. De près, toi es un mannequin de verre : d ≥ 190 (`VIEW.knob`), ou `VIEW.knobWide`. Ancres `world.hob.A` : `pot, rim, foam, knob, youHead, youHand, switch, door`.
- **Le feu** (`fire.js`, `world.fire`) : `flame` — 40 flammes sur les 40 fentes ; elle meurt depuis le côté de la mousse, des deux côtés à la fois : 0,9 cinq fentes de devant éteintes ou vacillantes · 0,6 la moitié · 0,3 il ne reste que le fond · 0 rien. `gas` : une fente ne donne du gaz que si sa flamme est morte (on peut donc monter `gas` dès que `flame` baisse) ; la brume est terne, large, sans cœur — elle se lit surtout en mouvement. Sous la casserole (`pot` 1) les flammes se couchent sous le fond ; sur l'établi elles montent droit, la pointe dedans. `fill` : 0 → 0,26 la colonne grimpe en contournant la hotte · 0,14 → 0,55 la couche s'étale sous le plafond · → 1 son dessous descend jusqu'à 140 cm. **Garde `gas` à 1 pendant `fill`.** Dans `VIEW.room` la couche passe derrière l'en-tête : `VIEW.roomLow` (de bas) la montre mieux, et à partir de `fill` 0,7 la caméra de `roomLow` est dedans. `spark` : 1, puis 1,5 deux images, puis 0. `explode` > 0,05 : tout ce qui est feu est caché. Sur l'établi, flamme allumée, les pointes montent haut : `VIEW.whole` avec `shift` ≈ 120. Ancres `world.fire.A` : `flame, haze, layer, spark`.
- Les poses de départ sont dans `VIEW` (`world.js`) : `hook, burner, tip, under, taps, heart, system` (cuisine) · `whole, exploded, rowTap, rowHeart, rowTip, tapPart, magnetPart, pressPart, chain, tipPart` (établi) · `knob, knobWide, room, roomLow, door, kitchen`. `tapPart` n'a pas été essayée ; `under` et `taps` cadrent confusément (fond de casserole, tranche du plan de travail) : à régler à l'acte, ou préférer `heart`. Ce sont des points de départ : chaque acte affine les siennes avec `look` et les garde dans son fichier.
- La lumière : `fx, fy, fz, fs` — pour le cœur dans la cuisine `fx: 163, fy: 87, fz: 47, fs: 6` ; la pointe `fx: 163, fy: 93, fz: 39, fs: 12` ; la pièce `fx: 200, fy: 120, fz: 100, fs: 250` ; la porte `fx: 280, fy: 120, fz: 180, fs: 120` ; toi à la plaque `fx: 166, fy: 100, fz: 50, fs: 90`.
- Dans `look --file`, donne dans `state` tous les nombres que ton image exige (`set: 0` pour l'établi, avec `mood: 0, fx: 0, fy: 6, fz: 0, fs: 13`).

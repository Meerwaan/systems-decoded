# 011 · Fusible pyro — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (`npm run script -- 011` le donne ; la vraie voix sera ≈ 20 % plus courte). Tout instant se lit donc dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères : le jour où la voix arrive, tout se recale seul. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js`) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/009-micro-ondes/src/acte*.js` et `episodes/010-scie/src/acte*.js` (montés cette nuit avec le même outillage) ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe.
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,12–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`). Une voiture est longue et le cadre est vertical : de trois quarts, en plongée, ou de près.
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) — de la voiture entière (d ≈ 800) au fusible (d ≈ 48) le rapport est de 17 : toujours par rapport, ou par une coupe ; un quart de tour en une seconde est une coupe. Pas de secousse (`jolt`) sur la voiture entière : c'est un plan plein de lignes.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 330 pour la voiture, 40 sur le boîtier de jonction, 12 sur le fusible dans la voiture, `SIZE` = 9 sur l'établi, 6 sur une pièce).
- Couleurs : `mood` 1 (signal) tant que la haute tension est une menace ; 0 (veille) sur l'établi et dès que la barre est tranchée. Jamais à mi-chemin plus d'une demi-seconde.
- **Le temps** : l'accroche montre le choc une fois, vite (T+0 → T+10 ms) ; « Sans elle » le rejoue SANS le fusible ; l'autopsie se fait temps arrêté ; l'acte 3 le rejoue AU RALENTI — trente millisecondes sur vingt-cinq secondes : `crush` avance lentement (0 → ≈ 0,5 à la fin de l'acte), les éclats restent en l'air, les airbags n'ont pas fini de se gonfler quand la barre est déjà tranchée.
- L'horloge de l'en-tête (millisecondes depuis le choc) et le compteur « Fusible » (prêt → +0,35 → +0,50 → +0,75 → coupé · 1,00 ms) sont câblés dans `main.js` sur les repères `bags0, boom0, back, crash, order, trigger, hit, snap, out, tobag, inflate` : fais tomber tes gestes sur ces repères-là.
- `litBar` et `flow` ensemble donnent une barre menthe à tirets orange : l'un OU l'autre. Les tirets sur le cuivre clair, de près, font « sucre d'orge » : tiens `flow` à 0,6 dans les plans serrés et laisse-les à 1 dans les plans larges.
- L'éclair de la charge (`fire`) et l'arc (`arc`) ne dépassent pas 1,2 et ne tiennent pas : deux images au sommet, puis ils retombent.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-400` (Sous le plancher / 400 V) · `chip-sans` (Sans / Le fusible) · `chip-live` (Carrosserie / Sous tension ?) · `chip-toi` (Toi) · `chip-rescue` (Lui) · `chip-normal` (Fusible ordinaire / `#normal-v` : un compteur, `D.readout("normal-v", …)` de 0 s à 200 s) · `chip-ordre` (Lui attend / Un ordre) · `chip-ecu` (Calculateur / 10 ms) · `chip-cut` (Barre de cuivre / Tranchée) · `chip-seule` (La batterie / Seule) · `chip-bags` (Airbags pleins / ≈ 30 ms) · `chip-pack` (Dans un pack écrasé / Jusqu'à 167 V) · `chip-orange` (Orange / Jamais) · `chip-reste` (La batterie / Reste chargée — NE PAS la montrer pendant l'accroche : c'est la réponse à sa question) · `#retitle` (Ce fusible : « Il fond » barré → « Il saute »), `#net`, `#next` (Prochain dossier · 012 — « La flamme tient le gaz ouvert. »), `#cta-field` (« Les câbles orange, tu le savais ? » → « NON », 3 lettres), les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir 010/acte2.js). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tofuse`)

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, état `FIRST` (`crush` 0,15, `debris` 0,3) : le nez de la voiture se replie sur le mur, toi dedans, les éclats. **La caméra bouge dès l'image 1** et le choc continue dès l'image 1 (`crush` → 0,8 en une demi-seconde, `debris` → 1) : c'est ce qui arrête le pouce |
| `accroche` | « Choc. » | le nez finit de se replier, la caméra pousse vers ta vitre |
| `bags0` | « Tes airbags partent. » | `bags` 0 → 1 sur « partent » ; la caméra est à ta vitre (`VIEW.bags`) |
| `under` | « Sous le plancher, » | la caméra descend et recule vers l'arrière de la voiture, sous la banquette (`VIEW.floor`, puis plongée par rapport vers `VIEW.boxOpen`), le couvercle du boîtier s'efface (`box` → 0) |
| `boom0` | « une autre charge explose. » | dans le boîtier, le fusible part : `fire` 0 → 1,2 → 0 (une lumière qui a un endroit), `piston` → 1, `snap` → 1, un arc bref ; `flow` → 0 |
| `split` | « Elle coupe ta batterie : » | recul par rapport le long du câble avant (`VIEW.cables`) : les tirets meurent du boîtier vers l'avant (`hv` 1 → 0), `mood` → 0 |
| `ms` | « quatre cents volts, en une milliseconde. » | le recul continue jusqu'à la batterie entière sous le plancher (`VIEW.pack`) ; `chip-400` |
| `spot` | « Mais ces volts restent… quelque part. » | la caméra quitte le plancher et remonte vers la voiture entière, de trois quarts arrière (`VIEW.rear`) : tout est éteint, `pack` baissé à 0,35 — la question reste ouverte, on ne montre PAS la réponse (la batterie qui luit seule est gardée pour la fin) |
| `tosans` | « Sans elle, un câble écrasé contre la tôle… » | **coupe** : le choc rejoué SANS le fusible (`STAGED` + `crush` 1, `bags` 1, `debris` 0,6 : rien n'a coupé, `hv` 1, `flow` 1) ; le pincement de près (`VIEW.pinch`) : `cable` 0 → 1 sur « écrasé », le cuivre nu sur la tôle, les étincelles ; `chip-sans` en zone haute |
| `live` | « et la carrosserie peut être sous tension. » | **coupe** vers ton flanc (`VIEW.door`, sans le sauveteur) : `live` 0 → 0,8 — la lumière signal gagne la caisse depuis le nez jusqu'à ta poignée ; `chip-live` |
| `you` | « Pour toi. » | `chip-toi` sur toi, dans l'habitacle (`world.car.A.youHead`) |
| `door` | « Et pour celui qui ouvre ta portière. » | il est là (`rescuer` 1 posé à la coupe, hors champ ou sombre jusqu'ici) : `reach` 0 → 1, sa main s'arrête à deux centimètres de la poignée ; `live` → 1 (le cœur brillant sur la poignée) ; `chip-rescue` |
| `back` | *(silence)* | le film revient en arrière en 0,35 s : `live` → 0, `reach` → 0 |

L'acte 2 coupe à `tofuse`.

## 02 · AUTOPSIE — `acte2.js` (`tofuse` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tofuse` | « Alors… » | **coupe** : le fusible à sa place, dans le boîtier ouvert (`VIEW.fuse`, `STAGED` + `box` 0, `fs` 12), temps arrêté à T+0. La voiture et la batterie s'effacent autour (`shell` → 0, `pack` → 0, `wall` → 0, `flow` → 0, `mood` → 0) : il reste seul |
| `tobench` | « …on l'ouvre. » | `benchCut` : le même fusible sur l'établi, à la même place de l'image (`origin: HOME`). La caméra recule par rapport jusqu'à `VIEW.whole` |
| `p0` | « Un boîtier, grand comme un jeu de cartes. » | le fusible entier, `litCase` ; légende « Boîtier » / « ≈ 7 × 5 × 4 cm » |
| `p1` | « Une barre de cuivre : » | juste avant le mot, `explode` 0 → 1 (0,9 s, `"none"`) : la colonne ; `VIEW.barPart`, `litBar` ; légende « Barre de cuivre » / « Tout le courant » |
| `flow` | « tout le courant de la batterie y passe. » | `litBar` → 0 puis `flow` 0 → 1 : les tirets signal courent d'un bout à l'autre de la barre |
| `p2` | « Un piston. » | `VIEW.pistonPart`, `litPiston` (`flow` → 0,3) ; légende « Piston » / « En plastique » |
| `p3` | « Et derrière lui… une charge. » | `VIEW.chargePart`, `litCharge` ; légende « Charge » / « Pyrotechnique » |
| `torepos` | « Un fusible ordinaire attend que ça chauffe : » | le fusible se referme sans son boîtier (`explode` → 0, `lid` 0), en coupe (`VIEW.section`), le courant passe (`flow` 1) ; `chip-normal` en zone haute, son compteur part de 0 s |
| `wait` | « parfois plus de trois minutes. » | le compteur file jusqu'à 200 s sur « trois minutes » ; rien ne bouge dans le fusible : il n'attend pas la chaleur |
| `order0` | « Lui n'attend qu'un ordre. » | `chip-ordre` remplace `chip-normal` ; la charge et son connecteur s'allument (`litCharge` 0 → 0,7) |
| `toseuil` | « Abonne-toi : l'explosion sous ton plancher, on te la montre en entier. » | `followCall` (voir 010/acte2.js, fin). Le film ne s'arrête pas : la caméra plonge vers la charge, derrière le piston (`VIEW.chargePart`, plus près), qui respire ; l'horloge de l'en-tête répond (une pulsation sur « entier »). Pas de panneau |

L'acte 3 coupe à `tozero`.

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

Le ralenti : trente millisecondes sur vingt-cinq secondes. `setAct(tl, 3, crash)`.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` | « Choc. » | **coupe** : le cadre de la première image (`POSE0`, `STAGED`) ; sur le mot (`crash`) : `crush` 0 → 0,2, les premiers éclats (`debris` → 0,3), lentement |
| `ecu` | « En dix millièmes de seconde, le calculateur a compris. » | **coupe** : le calculateur sur le tunnel (`VIEW.ecu`, `shell` 0,7) ; `ecu` 0 → 1 sur « compris » ; `chip-ecu` |
| `order` | « Le même ordre part vers tes airbags… et vers lui. » | recul par rapport jusqu'à `VIEW.order` (`box` 0) : `order` 0 → 1 sur la phrase — les têtes de lumière veille filent vers les deux airbags (`tobags`) et vers le fusible (`tohim`) ; la caméra suit celle du fusible vers le boîtier |
| `tofire` | « La charge explose. » | **coupe** : le fusible en coupe, dans la voiture (`moved(VIEW.section, [0, 0, 0], HOME)`, `lid` 0, `box` 0, `flow` 0,6, `fs` 12). `trigger` : `fire` 0 → 1,2 sur « explose », puis il retombe ; `piston` 0 → 0,2 |
| `hit` | « Le piston frappe la barre. » | `piston` → 0,6 sur « frappe » : la tête en coin est dans le cuivre |
| `snap` | « Le cuivre casse : » | `piston` → 1, `snap` 0 → 1 en trois images sur « casse » ; le morceau est dans le puits |
| `arc` | « un arc… » | `arc` 0 → 1,2 entre les deux moignons (les tirets passent encore par lui) |
| `out` | « éteint. » | `arc` → 0, `flow` → 0, `mood` → 0 ; `chip-cut` |
| `tocut` | « Une milliseconde. » | poussée vers la coupure (`moved(VIEW.macro, …)`) : les deux moignons, le vide entre eux |
| `alone` | « La batterie est seule : plus rien ne la relie à la voiture. » | **coupe** : la batterie et le câble avant (`VIEW.cables`, `shell` 0,5) ; `hv` 1 → 0 du boîtier vers l'avant sur « seule » ; la batterie, elle, luit toujours ; `chip-seule` |
| `tobag` | « Tes airbags, eux, n'ont pas fini de se gonfler. » | **coupe** : ta vitre (`VIEW.bags`) ; `bags` 0,35 → 0,75 sur la phrase, `crush` 0,5 → 0,7, les éclats en l'air ; `chip-bags` |

`fin.js` coupe à `toverdict`.

## Chute, appels à l'action, boucle — `fin.js` (`toverdict` → fin)

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` | « Ce fusible ne fond pas. » | **coupe** : l'établi, le fusible en coupe, intact, le courant passe (`BENCHED` + `lid` 0, `flow` 0,6, `VIEW.section`). `retitle` : « Il fond » arrive avec la phrase, barré sur « pas » (`verdict`). `D.verdict(verdict)` |
| `blow` | « On le fait sauter : » | sur « sauter », À VITESSE RÉELLE : `fire` 1,2, `piston` 1, `snap` 1 en quatre images, un arc d'une image, `flow` 0 ; « Il saute » remplace le titre barré |
| `before` | « avant que ça chauffe, pas après. » | poussée lente vers la barre tranchée (`VIEW.macro`) ; le titre est sorti avant `tocta` |
| `tocta` | « Like. Ça remontera chez quelqu'un qui roule en électrique sans le savoir. » | **coupe** : l'établi, un fusible neuf entier (`BENCHED`, `VIEW.whole`), qui tourne lentement. `likeCall` (5 tuiles, « n personnes ») |
| `abo` | « Abonne-toi. Prochain dossier : ta gazinière. Son gaz ne reste ouvert… que tant que la flamme le tient. » | la caméra recule et descend ; `nextFile` (panneau à « Prochain », le fait à « flamme ») |
| `tocomment` | « Et ces volts, ils sont où ? » | **coupe** : la voiture après le choc (`STAGED` + `crush` 1, `bags` 1, `hv` 0, `flow` 0, `piston` 1, `snap` 1, `mood` 0, `shell` 0,5), de trois quarts en plongée (`VIEW.alone`) : tout est éteint… |
| `pack` | « Restés dans la batterie. » | …sauf elle : la batterie luit seule sous le plancher (une pulsation de `pack` 0,6 → 1 sur « batterie ») — la réponse à l'accroche ; `chip-reste` |
| `volts` | « Dans un pack écrasé, on a mesuré jusqu'à cent soixante-sept volts. » | `chip-pack` remplace `chip-reste` ; la caméra descend vers les modules |
| `orange` | « Ce qui est orange, tu n'y touches jamais. » | la caméra suit le câble orange mort de la batterie vers l'avant (`VIEW.cables`) ; `chip-orange` |
| `ask` | « En commentaire : tu le savais ? » | `commentCall` (la question s'affiche ; « NON » se tape sur les premiers mots de la boucle : `chars: 3`) |
| `toloop` | « Maintenant, tu sais ce qui se passe sous le plancher, à l'instant du… » | **coupe** : la voiture entière avant le choc, de trois quarts arrière (`VIEW.rear`, `STAGED` : `crush` 0). `rewind` : `D.loop({ at: toloop, rewindAt: rewind, fromD })` — retour à `POSE0` et à `FIRST` (le nez touche le mur : `crush` 0,15, les premiers éclats) |

La dernière image est la première : `commit` prévient dans la console si un nombre n'est pas revenu.

## Ce que les décors savent faire (rendu par ceux qui les ont construits — détail et autres poses : `docs/journal/011-car.md`, `011-pack.md`, `011-model.md`)

- **La voiture** (`car.js`) : le repère est celui de la VOITURE — l'habitacle ne bouge pas, c'est le mur et la route qui viennent (à `crush` 1 la face du mur est à z = −173, l'arrière se soulève de 1,7°). `crush` : le capot se plisse (franc au-delà de 0,7, vu de trois quarts ; discret de profil à 0,5), les roues avant reculent, ton buste part vers le volant. `debris` : la distance et la quantité des éclats, une lueur au contact vers 0,05. `bags` : 0 → 0,5 fripé → 1 plein ; par ta vitre ils se lisent comme des coussins, de derrière comme deux boules. `reach` : sa main à 2,2 cm de la poignée. `live` : l'onde part de `CABLE.pinch`, arrive à la poignée à 0,8, toute la caisse avant 1, le tour de porte et le cœur sur la poignée de 0,8 à 1 (à 1 toute la voiture est orange). Le plan large de trois quarts AVANT est impossible (le mur cache le nez) : prendre l'arrière (`VIEW.rear`). Ancres `world.car.A` : `youHead, wheel, bagDriver, bagPassenger, nose, wallFace, doorHandle, rescuerHand, rescuerHead, pinch, roof, rearSeat`.
- **La batterie** (`pack.js`) : `pack` est l'opacité de TOUTE la haute tension (batterie, boîtier, câbles, blocs moteurs) — le calculateur ne s'efface pas. `box` : le couvercle seul (contacteurs et barres restent). `hv` : les tirets des câbles et des barres du boîtier. `crush` : le bloc avant recule de 18 cm, le câble se replie. `cable` : la tôle apparaît (0 → 0,5), la gaine se déchire, le cuivre nu ; étincelles de 0,6 à 1, × `hv` — n'a de sens qu'avec `crush` 1. `ecu` : trois barres puis tout le panneau. `order` : une tête veille par fil, le chemin allumé derrière ; celle du passager est cachée derrière toi vue de la gauche. De côté, le câble ne remplit rien d'un cadre vertical : le filmer en enfilade (`VIEW.cables`). Ancres `world.pack.A` : `pack, module, box, fuseSeat, contactor, cableFront, pinch, driveFront, driveRear, ecu, orderFuse, orderBag`.
- **Le fusible** (`model.js`) : `flow` : tirets signal sur toute la barre ; barre coupée, ils s'arrêtent au premier moignon sauf si `arc` > 0. `lid` : les deux coques. `fire` : une boule sous le pot, les gaz jusqu'au piston ; boîtier fermé : l'éclat vu à travers. `piston` : course de 1,2 cm, il touche la barre à 0,25 et l'entame au-delà même si `snap` vaut 0. `snap` : le morceau au fond du puits, les lèvres pliées. `arc` : un ruban d'une lèvre à l'autre (mince : il se lit de près). `explode` : une colonne — coque haute +7,4, charge +2, piston +1,3 ; la barre, le puits et la coque basse restent. `lit*` : franc à 1, « doucement » = 0,5–0,7. Sur l'établi il tient sur un support (deux isolateurs). Ancres `world.fuse.A` : `fuse, bar, stumpL, stumpR, piston, charge, pit, connector`.
- Les poses de départ sont dans `VIEW` (`world.js`) : `fuse, whole, exploded, barPart, pistonPart, chargePart, section, macro, pack, box, boxOpen, cables, pinch, order, ecu, alone, profile, bonnet, bags, rear, door, floor`. Ce sont des points de départ vus sur planche : chaque acte affine les siennes avec `look` et les garde dans son fichier.
- Dans `look --file`, donne dans `state` tous les nombres que ton image exige (`set: 0` pour l'établi).

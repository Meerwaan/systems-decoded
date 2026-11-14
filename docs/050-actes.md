# 050 · Plaque à induction — le plan de mise en scène

**La voix est enregistrée** (une prise, **85,0 s**) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues`, 60, tous vérifiés mot à mot : aucun ne tombe à côté de son mot) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre en dur** ; une durée est un écart entre deux repères. Les secondes ci-dessous servent à se repérer. Lis ce haut commun, puis **ta section seule** (`grep -n "^## " docs/050-actes.md`).

**La scène.** Ce soir, dans la cuisine du 009 vue aux rayons X. Une plaque à induction noire ; sur son foyer avant droit, une casserole inox bout à gros bouillons. Ta main gauche est **posée à plat sur le foyer avant gauche, allumé, sans casserole** : son « 9 » clignote, et tu ne sens rien. Tu vas soulever la casserole et poser ta main où était son fond — or le verre, là, est brûlant : il a pris la chaleur du fond. La plaque le sait : un « H » s'allume, ta main s'arrête juste au-dessus. Personne n'est brûlé.

**Ce qu'on a le droit d'affirmer à l'image** (faits, contre-vérification) : la casserole chauffe, pas la plaque ; le verre n'est chauffé que par le fond, par contact ; le champ bat ≈ 25 000 fois par seconde (20 à 50 kHz selon la plaque) — **à l'écran il bat au ralenti**, jamais un scintillement ; les courants tournent dans le fond (effet Joule, comme un grille-pain) — **le fond ne rougit pas**, la chaleur est une teinte `signal` dans son épaisseur ; le « H » : on ne montre aucune température, aucun thermomètre (le point sous le verre est une pastille discrète). Pas de cuillère sur la plaque. Le foyer vide n'envoie que des impulsions d'essai : on n'en dessine aucune.

**Écarts aux champs `voir` du script (tranchés ici)** : `scene` — ce n'est pas la main posée qui attrape le manche, c'est **ta main droite** (`grip`) ; la gauche reste à plat (sinon « ta main descend » n'a plus de main). `principe` — « le métal rougeoie comme un fil de résistance » : **non** (contre-vérification) ; le fond se teinte d'orange et la chaleur monte dans l'eau. `reponse` — « le capteur de température s'allume » : une pastille `veille` discrète (`sensor`), jamais nommée « capteur » à l'écran.

## L'en-tête (main.js — tu ne l'écris jamais)

- **Le chrono** compte jusqu'au moment où tu soulèves la casserole (T0 = `souleves`) : T−21 au départ, en temps réel jusqu'à `tobench` (T−3), tenu pendant l'autopsie, ralenti dans l'acte 3 (T−3 → T0 sur `repos`), T+2,5 au « H », T+4 à la chute ; après `toloop`, la valeur de la première image. Illustratif, `sources` le dit.
- **« Champ »** : « ≈ 25 kHz » tant que le foyer héros est alimenté (`on` 1), **« 0 »** dès que `on` passe à 0 — c'est le « Le champ s'éteint. Net. » : `on` tombe d'un coup sur `eteint`. Tu bouges `on`, l'en-tête suit.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur son mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) ; il rend la main à l'instant où le suivant coupe (`tobench`, `torepos`, `toverdict`). L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.
- **Chaque coupe est un raccord** (forme, objet, mouvement), posée quelques images avant sa phrase (les repères `to…` sont 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant.
- **Le sujet est le plus lisible du cadre** : la plaque est noire — on la filme sur son halo, ou avec son verre en rayons X (`see`), jamais noire sur noir. Le verre noir brillant renvoie la boîte à lumière : si une tache claire mange un plan, change d'angle (l'agent de `model.js` le règle d'abord).
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette à la fois) · sujet 440–1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête (sans `--bare`) une fois.
- Mouvements `sine.inOut`, longs ; un quart de tour en une seconde est une coupe ; la caméra traverse le verre (cuisine, plaque en rayons X), **jamais toi** : avec `you` 1, pas de pose de face à `az` > −15 (ton corps est à z ≈ 78) ni de plongée au-dessus de ta tête (`VIEW.top` se filme avec `you` 0 ou `away` 1).
- La lumière suit ce qu'on filme : `fx, fy, fz` sur le sujet, `fs` sa taille (≈ 20 un afficheur, ≈ 40 un foyer, ≈ 60 les deux foyers, ≈ 120 la cuisine ; `SIZE` 32 sur l'établi).
- **Couleurs** : `mood` 1 dans la cuisine (la brûlure menace), 0 sur l'établi ; jamais à mi-chemin plus d'une demi-seconde. `signal` = la chaleur, seulement dans le fond et l'anneau de verre (et le « H ») ; `veille` = courant, champ, courants induits, afficheurs.
- **`dof`** : les poses `CLOSE` de `VIEW` l'ont (gros plans), toutes les autres disent `dof: 0`. Une pose que tu écris dit son `dof`.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : `FIRST` est fermé. S'il t'en manque un, écris-le sous « À changer ailleurs ».
- Toi, de verre : jamais en très gros plan sur le bras ; la main oui (c'est l'accroche), avec le verre et la plaque dans le cadre.

## La grille de rétention (docs/recette-actes.md)

| Instant | Ce qui doit se passer |
| --- | --- |
| 0 → 0,5 s | l'image bouge par son **sujet** : les bulles roulent, la vapeur monte, les doigts s'écrasent sur le verre (`hover` d'un poil vers 0) ; la caméra glisse au ras du verre (`glide` permis si la main reste dans le cadre à 0,3 et 0,7 s) |
| 0,5 → 10 s | l'accroche : « allumée » frappe (`choc` 1,40), « rien » (3,08) ouvre les rayons X sous ta main (`see` 1 : la bobine reste sombre) ; « brûler » (6,72) allume l'anneau sous la casserole |
| 10 → 25 s | un changement toutes les 2 à 3 s, **aucune plage lente de 2 s** : bouillons → deux foyers → la main droite prend le manche → la caméra plonge → « on l'ouvre » dans le quasi-silence (`hush`) → l'éclaté couche par couche sur ses mots (secteur 21,0 · inducteur 22,4 · bobine 23,5 · cœur 26,3) |
| portes d'acte | `tobench` 17,99 (coupe sur la même plaque), `torepos` 38,31 (retour au foyer vide), `toverdict` 60,35 |
| fin | `duelCall` : « Un H » (`duelA` 72,15) ou « Rien » (`duelB` 72,87) ; **le film ne répond jamais à la place du spectateur** |

**Les mots qui frappent** (`D.punch(t, 0.06)`, un par phrase au plus, jamais sur une coupe ni à moins d'une seconde d'un autre) : `choc` (allumée), `brule` (brûler), `bouillons`, `dessous`, `coeur`, `grille` (grille-pain), `brulant`, `eteint`, `trigger` (apparaît, sur l'image du H), `verdict` (pas). `D.captionStyle({ hit: 0.25 })` une fois (acte 1).

**« Alors… on l'ouvre »** (17,26 → 18,65) : seul dans son plan, quasi-silence (`hush` déjà dans `sfx`) ; **l'éclaté s'ouvre sur « on »** (`explode` 18,13), pas avant. La coupe vers l'établi (`tobench` 17,99) se fait sur la plaque même, au même endroit de l'image (`benchCut` depuis `VIEW.system`, `origin: BENCH_ORIGIN` : vérifié sur bouchon).

**La boucle** : la dernière phrase (« Pendant ce temps, chez toi… ») retombe sur « Ta main touche la plaque allumée ». À `toloop` (83,04) on coupe dans la cuisine sur `FIRST` (main à plat, casserole qui bout, « 9 » qui clignote), la caméra revient vers `POSE0` ; **la dernière image = la première** (`D.loop`, `rewind` 83,93).

**Le son** : la grille `sfx` actuelle tient dans les souffles (vérifiée). Le `monteur-son` la refait après les actes avec les sons du sujet (`050-ebullition`, `050-main-verre`, `050-casserole-souleve`, `050-bourdonnement`, `050-ventilateur`, `050-touche-bip`, s'ils sont générés). Ne touche pas à `sfx`.

**Les étiquettes** (dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer ; les squelettes les posent déjà) : `chip-vide` (Ce foyer / Allumé · sans casserole, encre) · `chip-onduleur` (L'électronique / Onduleur) · `chip-inducteur` (L'inducteur / Bobine de cuivre) · `chip-coeur` (Le cœur / Le fond de ta casserole, veille) · `chip-champ` (Champ magnétique / ≈ 25 000 fois par seconde, veille) · `chip-courants` (Dans le métal / Courants induits, veille) · `chip-h` (H / Verre encore chaud, signal) · `#retitle` (Ce qui chauffe : « La plaque » barré → « Ta casserole ») · `#duel` (Sur ta plaque ? Un H / Rien) · `#net` (like) · `#next` (051, le brise-glace, « Il ne tape pas sur la glace : il la plie. »).

**26 images lues au plus** par acte. Journal : `docs/journal/050-<ton fichier>.md`. Planches et `essais.json` dans `.cache/planches/050/<ton fichier>/`, jamais dans `renders/`.

---

## acte1.js

**01 MENACE — de 0 à `tobench` (17,99).** Cuisine. Part de `POSE0` / `FIRST` (sans coupe), rend la main sur `VIEW.system` avec `see` 1. Sept phrases ; un plan-séquence si possible (un recul, une glissade, une plongée), une coupe au plus (sur `toscene`).

| Instants | Phrase | Ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 0,26 → 1,80 | « Ta main touche la plaque *allumée*. » | `POSE0` : ta main à plat au premier plan, la casserole bout derrière ; la caméra glisse au ras du verre vers la main ; « 9 » clignote (`blink`). `D.punch(choc)` | main ≈ 40 % de la largeur ; casserole ≈ 25 % derrière |
| 2,36 → 3,24 | « Et tu ne sens +rien+. » | sur `rien` (3,08) le verre passe aux rayons X sous ta main (`see` 0 → 1 en 0,4 s) : la bobine dessous reste **sombre** ; `chip-vide` entre | main et sa bobine ≈ 45 % |
| 3,71 → 5,00 | « Ce n'est pas ta +plaque+ qui chauffe. » | travelling latéral au ras du verre, de la main vers la casserole (`VIEW.glassLow`) ; le verre redevient noir (`see` → 0) | les deux foyers ≈ 70 % |
| 5,48 → 6,92 | « Alors pourquoi son verre peut te *brûler* ? » | la casserole au centre ; sur `brule` (6,72) l'anneau de verre autour du fond vire `signal` (`glassHeat` 0,6 → 1) ; punch | casserole ≈ 45 % |
| 7,78 → 10,26 | « À côté, ton eau bout à gros bouillons. » | coupe (`toscene` 7,66) ou montée sur `VIEW.boil` : l'eau qui roule, la vapeur ; punch `bouillons` | eau ≈ 60 % |
| 10,34 → 11,94 | « Même verre, même plaque. » | recul `VIEW.twoZones` : les deux foyers sur un même verre, ta main sur l'un, la casserole sur l'autre | la plaque ≈ 75 % |
| 11,99 → 15,14 | « Tu vas soulever la casserole… et poser ta main où était son fond. » | ta main droite prend le manche sur `soulever` (`grip` 0 → 1) ; sur `poser` / `fond1` (14,77) la caméra désigne le foyer sous la casserole (la gauche ne bouge pas encore) | plaque ≈ 70 % |
| 15,22 → 16,42 | « Avant, regarde *dessous*. » | sur `dessous` (16,22) la caméra plonge au ras du verre et la plaque passe aux rayons X (`see` 1) : `VIEW.system`, la plaque entière de trois quarts, ses quatre inducteurs dessous ; punch | plaque ≈ 80 % |
| 16,42 → 17,99 | (souffle, « Alors… ») | on tient `VIEW.system` ; `fs` vers 60, `mood` 1 | — |

**Couture de sortie** : à `tobench` la caméra est sur `VIEW.system` (complète), l'état = `STAGED` + `see` 1 + `grip` 1. L'acte 2 coupe de là.

## acte2.js

**02 AUTOPSIE — de `tobench` (17,99) à `torepos` (38,31).** Établi, `mood` 0. Entre par `benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCH_ORIGIN, state: { ...BENCHED, see: 1 } })` : même image, seul l'entour change. Dix phrases.

| Instants | Phrase | Ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 17,26 → 18,65 | « Alors… on l'ouvre. » | la plaque entière sur son halo ; **sur `explode` (18,13)** les couches montent (0 → 1 en ≈ 1,4 s, `power2.inOut`), la casserole au-dessus ; la caméra recule (`VIEW.exploded`) | colonne ≈ 60 % |
| 19,69 → 21,37 | « L'électronique prend le courant du secteur. » | gros plan `VIEW.board` : `flow` 0 → 0,4 du cordon à la carte sur `secteur` (21,01) ; `litBoard` ; `chip-onduleur` | carte ≈ 55 % |
| 21,73 → 22,97 | « Elle le lance dans l'inducteur : » | `flow` → 1 jusqu'à l'inducteur héros sur `lance` / `inducteur` (22,37) ; la caméra suit le courant vers le haut (`VIEW.coil`) | — |
| 23,40 → 24,89 | « une bobine de cuivre, sous le verre. » | `coil` 1 : le courant court le long des spires ; `litCoil` ; `chip-inducteur` ; sur `sousverre` (24,45) le verre au-dessus s'allume en trait (`litGlass`) | spirale ≈ 50 % |
| 25,33 → 27,93 | « Et au bout… le cœur : le fond de ta +casserole+. » | la caméra monte à travers le verre (`see` 1) jusqu'au fond (`VIEW.heart`) ; sur `coeur` (26,25) le fond s'isole (le reste recule : `see`, opacités) et s'éclaire (`litPan`) ; `chip-coeur` ; punch `coeur` | fond ≈ 45 % |
| 28,54 | (coupe `toprincipe`) | les couches se referment hors champ : coupe sur `VIEW.section`, `explode` 0, `cut` 1 — raccord sur le fond | — |
| 28,66 → 29,45 | « Pourquoi ça chauffe ? » | la coupe : bobine, verre, fond, eau ; immobile un instant | coupe ≈ 70 % |
| 29,73 → 33,41 | « La bobine fait battre un champ magnétique, environ 25 000 fois par seconde. » | `on` 1, `field` 0 → 1 sur `champ` (30,73) : les boucles sortent de la bobine et **battent** (ralenti) ; `chip-champ` sur `environ` (31,65) | — |
| 33,89 → 35,01 | « Il traverse le verre… » | les boucles passent la tranche du verre **sans l'allumer** (le verre reste noir) ; la caméra glisse le long du verre (`traverse` 34,01) | — |
| 35,12 → 36,61 | « et fait tourner des courants dans le métal, » | `eddy` 0 → 1 sur `tourner` (35,41) : les boucles tournent dans le fond, de plus en plus vite ; `chip-courants` sur `metal` | fond ≈ 50 % |
| 36,89 → 37,97 | « qui chauffe comme un +grille-pain+. » | `panHeat` 0 → 1 : la teinte orange naît dans le fond et monte dans l'eau (pas d'incandescence) ; punch `grille` ; recul léger (`VIEW.sectionWide`) | — |

**Couture de sortie** : l'acte 3 coupe à `torepos` (38,31) dans la cuisine. Rends la main sur une pose complète.

## acte3.js

**03 RÉPONSE — de `torepos` (38,31) à `toverdict` (60,35).** Cuisine, `mood` 1, quatorze phrases courtes : **une image par phrase**, des coupes nettes (c'est l'acte des coupes). Le chrono reprend (T−3 → T0 sur `souleves`).

| Instants | Phrase | Ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 38,31 | (coupe) | `VIEW.emptyZone`, `{ ...STAGED, see: 1 }` : ta main à plat sur le foyer vide, sa bobine sombre — raccord : la bobine | main ≈ 40 % |
| 38,44 → 39,97 | « Sans casserole, son voyant clignote… » | sur `clignote` (39,57) l'afficheur « 9 » dans le cadre, qui clignote | afficheur + main |
| 40,25 → 41,01 | « et elle ne chauffe rien. » | `field` reste 0 sous ta main : aucune boucle, aucune lueur | — |
| 41,41 → 42,45 | « Ta main n'a rien senti. » | la main immobile ; la caméra s'en éloigne lentement | — |
| 42,89 → 45,33 | « Mais ta casserole, elle, est posée à même le verre. » | travelling vers la casserole aux rayons X (`xray` 0,6) au ras du verre (`VIEW.panLow`) : le fond à plat sur le verre, `eddy` 1 | casserole ≈ 45 % |
| 45,69 → 46,85 | « Et son fond est *brûlant*. » | sur `brulant` (46,53) l'orange passe du fond au verre (`glassHeat` → 1) ; punch | — |
| 47,12 | (coupe `tozero`) | `VIEW.panLow` serré, `grip` 1 | — |
| 47,24 → 48,13 | « Tu soulèves ta casserole. » | `lift` 0 → 1 sur `souleves` (47,29), en ≈ 0,9 s ; la main droite la porte | casserole ≈ 40 % |
| 48,41 → 49,17 | « Le champ s'*éteint*. » | **sur `eteint` (48,85) `on` 0 d'un coup** : les boucles s'effondrent, `eddy` se fige et disparaît ; « Champ » de l'en-tête → 0 ; punch | — |
| 49,61 → 49,73 | « Net. » | rien ne bouge : le silence d'une image tenue | — |
| 50,09 → 50,85 | « Les bulles retombent. » | `boil` 1 → 0 sur `bulles` (50,21), `steam` baisse | eau ≈ 40 % |
| 51,13 → 51,81 | « Et ta main descend. » | ta main gauche quitte son foyer et descend vers l'anneau encore orange (`palm` 0 → 1, `hover` 1 → descend) | main + anneau |
| 52,28 | (coupe `toreponse`) | `VIEW.hotRing` : l'anneau `signal` au ras du verre, la main au-dessus | anneau ≈ 50 % |
| 52,40 → 54,49 | « Mais le verre, lui, a gardé la chaleur du fond. » | l'anneau rougeoie et diffuse ; la casserole hors champ | — |
| 54,93 → 55,61 | « La plaque le +sait+. » | sous le verre la pastille s'allume `veille` (`sensor`, `see` 0,6 local) sur `sait` (55,41) | — |
| 56,01 → 57,69 | « Sur l'afficheur, un H *apparaît*. » | sur `afficheur` (56,14) la caméra file vers l'afficheur (`VIEW.display`) ; **sur `trigger` (57,36) le « H » s'allume** (`hot` 1) ; punch ; `chip-h` | afficheur ≈ 35 % |
| 58,13 → 58,81 | « Ta main s'arrête. » | retour sur la main : `hover` tenu à 1, elle se fige à un doigt du verre (`arrete` 58,37) | main + anneau |
| 59,25 → 59,77 | « Juste au-dessus. » | gros plan profil : l'écart d'un doigt entre la paume et l'anneau orange ; puis elle se retire (`away`) | — |

**Couture de sortie** : `fin.js` coupe à `toverdict` (60,35).

## fin.js

**De `toverdict` (60,35) à la fin (85,03).** Chute, ce qui est dû, like, abonnement, boucle.

| Instants | Phrase | Ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 60,35 | (coupe) | établi, `VIEW.sectionWide`, `{ ...BENCHED, cut: 1, panHeat: 1, glassHeat: 0,6 }` : la casserole en coupe sur son foyer | coupe ≈ 65 % |
| 60,47 → 62,95 | « Voilà son secret : la chaleur ne vient *pas* d'en dessous. » | la bobine en dessous reste **sombre** (`coil` 0) ; `retitle` (« La plaque » barré sur `verdict` 62,47) ; `D.verdict` (le nom du compte s'allume) | — |
| 63,35 → 64,95 | « Elle naît dans le fond de ta +casserole+. » | sur `nait` (63,59) « Ta casserole » ; l'orange naît dans l'épaisseur du fond, monte dans l'eau, ne descend dans le verre qu'au contact | fond ≈ 45 % |
| 65,63 | (coupe `tocta`) | cuisine : la casserole revient se poser sur l'anneau (`lift` 1 → 0) | — |
| 65,75 → 69,43 | « Et pourquoi ce verre peut te brûler ? Parce que c'est ta casserole qui le réchauffe. » | sur `parce` (67,81) l'orange du fond redescend dans le verre (`glassHeat` monte) | casserole ≈ 45 % |
| 69,82 → 73,03 | « En +commentaire+ : sur ta plaque, tu lis un H… ou *rien* ? » | plan serré sur l'afficheur, « H » allumé (`VIEW.display`) ; `duelCall` : « Un H » sur `duelA` (72,15, `signal`), « Rien » sur `duelB` (72,87, encre) | afficheur ≈ 30 % |
| 73,61 → 76,69 | « +Like+ : pour celui dont les enfants jouent près de la *plaque*. » | coupe `tolike` : `VIEW.top` **avec `you` 0** (sinon ta tête est dans l'objectif), casserole levée hors champ, le « H » qui brille ; la main d'enfant entre par le bord (`child` 0 → 1) ; `likeCall` (label « familles ») | plaque ≈ 70 % |
| 76,72 → 82,77 | « +Abonne-toi+ : prochain dossier, le brise-glace. Il ne tape pas sur la glace : il la *plie* sous son poids. » | `nextFile` (051) sur `prochain` (77,71), le fait sur `plie` ; la caméra s'élève lentement au-dessus de la plaque | — |
| 83,04 → 84,25 | « Pendant ce temps, chez toi… » | coupe `toloop` dans la cuisine sur `FIRST`, la caméra redescend vers `POSE0` ; `D.loop({ at: toloop, rewindAt: rewind })` ; **dernière image = première** | comme `POSE0` |

---

## La première image — quatre candidates

À tirer sur la vraie scène (décors faits), avec l'en-tête, à `at` 0,04 ET 0,5 (le mouvement). Celui qui orchestre choisit et colle `POSE0` dans `world.js`. Chaque candidate est notée sur les six points (`docs/recette-agents.md`) : 1 événement en cours · 2 perspective basse · 3 menace derrière · 4 forme reconnue vue d'où on ne la voit jamais, 40 % de la largeur · 5 le système déjà là · 6 bouge par son sujet. Sur bouchon (planches de l'architecte), les quatre cadrent ; le verre brillant y fait une tache claire à corriger d'abord.

**(a) Au ras du verre** — `POSE0` provisoire. Ta main à plat au premier plan, la casserole qui bout juste derrière, sa vapeur, le « 9 » qui clignote. 1 ✓ (bouillons, vapeur, doigts qui appuient) · 2 ✓ · 3 ✓ (la casserole qui bout et son anneau orange derrière la main) · 4 ½ (une main sur une plaque, vue au ras : peu vue, pas jamais vue ; ≈ 40 %) · 5 ✓ (la plaque, l'afficheur) · 6 ✓. **5,5 / 6.** Risque : le bras de verre qui barre le haut du cadre.
```json
{ "at": 0.04, "label": "(a) au ras du verre", "pose": { "tx": 180, "ty": 96, "tz": 40, "d": 80, "az": -76, "el": 5, "fov": 40, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 } }
```

**(b) Par en dessous** — sous le verre, dans le meuble de verre, la caméra regarde vers le haut : ta paume écrasée sur la vitre vue d'en dessous, sa bobine sombre ; à côté, le fond de la casserole sur sa bobine qui bat, l'orange au-dessus. 1 ✓ · 2 ✓✓ · 3 ✓ (le fond chaud et la vapeur au-dessus) · 4 ✓✓ (une paume vue à travers la plaque : jamais vue) · 5 ✓✓ (les bobines, le champ) · 6 ✓ (le champ qui bat, les bulles). **6 / 6 sur le papier.** Risque : la lisibilité (le plan de travail et les façades de verre devant, le dessous du boîtier) ; et elle montre l'intérieur avant « on l'ouvre » (à peine : rayons X, pas d'éclaté).
```json
{ "at": 0.04, "label": "(b) par en dessous", "pose": { "tx": 172, "ty": 91, "tz": 42, "d": 40, "az": -50, "el": -14, "fov": 46, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "see": 1, "field": 1, "eddy": 1 } }
```

**(c) La plongée** — de trois quarts haut : ta main, la casserole à côté, les afficheurs. 1 ✓ · 2 ✗ · 3 ½ (à côté, pas derrière) · 4 ✗ (vue de tous les jours) · 5 ✓ · 6 ✓. **3,5 / 6** : sort, sauf si les autres échouent ; elle sert de plan de recul (`VIEW.twoZones`).
```json
{ "at": 0.04, "label": "(c) plongee", "pose": { "tx": 183, "ty": 93, "tz": 40, "d": 105, "az": -42, "el": 34, "fov": 32, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 } }
```

**(d) La coupe de trois quarts** — plaque et casserole coupées par le plan des deux foyers avant (`cut` 1) : sous ta main, la bobine sombre ; sous la casserole, la bobine, le champ qui traverse le verre, l'eau qui bout en coupe. 1 ✓ · 2 ✓ · 3 ✓ · 4 ½ (une casserole en coupe : reconnue, jamais vue ; la main plus petite) · 5 ✓✓ · 6 ✓. **5,5 / 6.** Risque : elle donne le mécanisme avant « on l'ouvre » et avant le principe ; garde-la pour la chute si elle n'est pas choisie.
```json
{ "at": 0.04, "label": "(d) coupe de trois quarts", "pose": { "tx": 182, "ty": 94, "tz": 39, "d": 62, "az": -20, "el": 4, "fov": 36, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "cut": 1, "xray": 1, "field": 1, "eddy": 1 } }
```

**Recommandation** : (b) si elle se lit à 270 px sur le vrai décor, sinon (a). Avec (b), « rien » (3,08) remonte au ras du verre, et le premier `see` de l'acte 1 se joue à l'envers (le verre redevient noir sur « plaque »).

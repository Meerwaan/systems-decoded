# 034 · Boîte noire — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **89,6 s**) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues`, 94, vérifiés mot à mot sur la table) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur**. Les secondes ci-dessous servent à te repérer (`npm run script -- 034`). Ton fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js`) est un bouchon qui construit : réécris-le en entier, en `st` / `shot` / `cut` / `chip` / `tl` contre `world.js`. Forme : `episodes/017-irm/src/acte*.js` ; fin : `kit/template/src/fin.js`. Les poses qui cadrent seront dans les journaux `docs/journal/034-model.md`, `034-fond.md` : pars d'elles ; `VIEW` est réglé sur des bouchons.

## L'histoire, et ce qu'on a le droit de montrer

AF447 Rio-Paris, nuit du 31 mai au 1er juin 2009. Ses enregistreurs coulent à **3 900 m**. Leur balise (réveillée par l'eau, **un appel par seconde**, portée ≈ **1 NM**, **30 jours** à l'époque) n'est jamais entendue. Épave retrouvée en **avril 2011** ; en **mai**, la mémoire remonte, et on la lit. Ce qui l'a sauvée : le seul **module mémoire** blindé (acier / isolant / absorbeur de chaleur). **Interdits** : une victime, un nom, une transcription ; *pourquoi* les recherches ont échoué ; « elle est dans la queue » (l'image peut l'y mettre, aucun texte ne le dit) ; la forme du module comme un fait (un cylindre trapu, « un bloc ») ; une durée du test au feu ; une cause à la séparation du module (`apart`, `free` : jamais l'eau qui casse le boîtier) ; « 90 jours ». La règle 2 h / 25 h est **européenne** (`chip-2h` le dit).

## Trois décors, un objet (`world.js`)

- **DEEP** (`SET.DEEP`) : la mer de nuit. **La boîte reste à l'origine, la mer bouge** : `depth` (m vrais) place la surface et le fond autour d'elle. Tes poses DEEP visent la boîte où qu'elle soit. Elle tourne en coulant : `spin`, `tilt` (degrés, mouvement droit `"none"` ≈ 15–25 °/s) ; **les poses serrées supposent spin 0, tilt 0**.
- **AIR** (`SET.AIR`) : l'A330 de verre du 023 (« ton avion »), la boîte dans sa queue. `ahead` avance en ligne droite dans chaque plan (une mer immobile = un avion arrêté) ; `plane` baisse (0,4) pour voir la boîte à travers la queue.
- **BENCH** : l'établi. La base de la boîte y est à l'origine comme au fond : **`benchCut` avec `origin: [0, 0, 0]`, la coupe est en place**.
- Coupes : `cut(at, SET.X, pose, { ...STAGED | FLOWN | BENCHED, … })`. `az` 0 en +z, **−90 devant la balise (−x)** ; dans l'avion, −90 devant son nez, **+90 derrière lui** (la queue vers la caméra : az 20 à 50).

## L'en-tête : l'horloge de la balise (`main.js`)

Le grand chiffre : **`days`** → « J−30 » … « J−0 » (encre ; signal dès que `alarm` 1, à « taise ») ; dès que **`months`** ≥ 0,5 : « +1 mois », « +12 mois », « +23 mois ». Le second : **« Profondeur »** = `depth` arrondi à 10 m (« — » dans l'avion). **Tu ne les écris jamais : tu bouges `days`, `months`, `alarm`, `depth`.** Ils gardent leur valeur à travers les coupes (`BENCHED`, `STAGED`, `FLOWN` n'y touchent pas, sauf `STAGED.depth` = 3 900) : chaque coupe les redonne explicitement.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration, sur le mot.** Un plan par souffle à l'acte 3 ; deux pièces nommées à moins d'une seconde tiennent dans UN cadre.
- **Un acte commence par une coupe** à pose complète et état complet ; il rend la main à l'instant où le suivant coupe ; rien ne déborde (une étiquette est sortie avant la coupe). Une coupe se pose 0,10–0,14 s avant sa phrase (les repères `to…`).
- **La part du cadre** que tient le sujet est écrite à chaque plan : tiens-la (± 5 points), vérifie-la sur ta planche.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une étiquette à la fois) · sujet 440–1160, à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600 ni sous les boutons (x > 905, y 880–1760). Planches AVEC l'en-tête.
- Mouvements `sine.inOut` ; plongées et reculs **par rapport** (`shot(at, dur, pose, ease, fromD)`) — ici on passe de 1 m à 40 km : toujours par rapport ; un quart de tour en une seconde est une coupe ; ce que la caméra frôle est invisible.
- La lumière suit le sujet : `fx, fy, fz` sur lui, `fs` ≈ 30 la balise, 60 la boîte, 700 la queue de l'avion, 3 500 l'avion, 3 000 la boîte seule au fond, 9 000 l'épave, 400 000 la colonne, 2 000 000 l'océan ; `SIZE` (20) sur l'établi.
- **Couleurs** : `mood` 1 dans la mer jusqu'à « l'acier **tient** » (51,96), 0 ensuite, 0 dans l'avion et sur l'établi ; jamais à mi-chemin plus d'une demi-seconde. `alarm` franc. La flamme, les flèches : signal ; la balise, la pile, l'acier qui tient, la lecture : veille.
- **`D.punch`** : un mot par phrase au plus (les `*mot*` / `+mot+`), jamais sur une coupe, jamais sur l'image 0. `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **Aucun son dans ton fichier** : la grille `sfx` est posée dans `episode.json`, dans les souffles (impacts sur `tozero`, `tient+0.25`, clics des pièces de l'éclaté, des mois…). Si un geste tombe loin de son son, dis-le sous « À changer ailleurs ».
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : `FIRST` est fermé. S'il t'en manque un : « À changer ailleurs ».
- Étiquettes en capitales, aucune unité à symbole. **26 images lues au plus.** Journal `docs/journal/034-<ton fichier>.md`. Planches et `essais.json` dans `.cache/planches/034/<ton fichier>/`, jamais dans `renders/`.

## Les étiquettes (`index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`#track` (Voix gardée / 2 heures + une bande : `#track-old` s'efface, `#track-keep` reste, veille) · `chip-feu` (Testée au feu / 1 100 degrés, signal) · `chip-eau` (Testée sous / 6 000 mètres d'eau, signal) · `#rail-seuil` · `chip-2011` (Avril 2011 / L'épave retrouvée) · `#retitle` (Ce qui la sauve : « Sa balise » barré → « Sa mémoire ») · `chip-2h` (Avant 2021 · Europe / 2 heures de voix) et `chip-25h` (Après / 25 heures de voix), **côte à côte** en zone haute (x 96 et x ≈ 560) · `#duel` (Ton prochain avion ? « D'avant 2021 » ou « D'après ») · `#net` · `#next` (035 : « Coincé sur les voies ? Sa barrière est faite pour casser. ») · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre : « Balise », « Pile », « Boîtier », « Électronique », « Mémoire », « Acier », « Isolant », « Absorbeur de chaleur », « Portée ». Place fixe en zone haute pendant un mouvement (`chip(id, null, 96, 470, de, à)`).

## « Alors… on l'ouvre », la boucle

« Alors… » (20,05) seul dans son plan : la boîte posée au fond, la caméra s'approche, presque rien ne bouge (le `suck` puis le `hush` sont dans `sfx`). **L'éclaté s'ouvre SUR « on »** (`explode` 20,84), sur l'établi, coupe en place à `tobench` (20,70). La boucle : `fin.js` coupe à `toloop` (87,23) sous l'eau près de `POSE0`, `D.loop` ramène `FIRST` et `POSE0` sur `rewind` (88,32) : **la dernière image est la première**.

---

## `acte1.js` — 01 MENACE (0 → `tobench` 20,70)

Part de `POSE0` / `FIRST` sans coupe ; **deux coupes** : `toplane` (6,71) et `toscene` (10,01). Finit sur `VIEW.floor`, état `{ ...STAGED, days: 30, alarm: 1, ping: 1, pool: 0.25 }`.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 0 → `choc` 1,00 | « Une boîte noire » | `POSE0`, `FIRST` : la boîte coule vers la caméra en contre-plongée et tourne (`spin` +20 °/s, `"none"`), `depth` 40 → 46 (la surface s'éloigne), `rush` 1 (la neige monte), un anneau part de la balise ; la caméra pousse un peu (`glide` à vérifier à 0,3 et 0,7 s : le sujet reste dans le cadre) | boîte 40 % de la largeur ; la queue 50–70 % de la hauteur derrière |
| `choc` → `ans` 3,40 | « *coule*. Tu vas la chercher presque deux ans. » | `D.punch(t.choc)` ; sur « chercher » la caméra passe sous la boîte et bascule vers le bas (`el` −52 → +40, par rapport, ≈ 1,4 s) : sur « deux ans » le noir d'en dessous remplit le cadre (`depth` 46 → 400 en `power2.in`, `rush` 1) — le fond n'est pas encore là | la boîte sort par le haut ; le noir 70 % |
| `ans` → `jours` 6,44 | « Au fond de l'Atlantique, sa balise ne tient que trente *jours*. » | du même mouvement, la caméra remonte sur la balise (`VIEW.beacon`, `spin` ralenti à 0, `tilt` 0) ; un anneau par seconde ; **sur « jours »** : « J−30 » de l'en-tête s'allume (une pulsation `tl` sur `#hud-clock`, encre) | la balise 35 % de la largeur |
| **coupe 1** `toplane` 6,71 → `ecoute` 8,07 | « Et dans ton avion… » | raccord de forme (la boîte → l'avion qui la porte) : `VIEW.plane`, `{ ...FLOWN }` — l'A330 intact la nuit, de trois quarts arrière ; recul inverse : la caméra file vers `VIEW.tail` par rapport, `plane` 1 → 0,4 | l'avion 90 % de la largeur, puis la queue 70 % |
| `ecoute` → `toscene` 10,01 | « elle n'écoute peut-être que deux +heures+. » | `VIEW.tail` → `VIEW.tailBox` (provisoire) : la boîte orange à travers la queue ; `#track` en zone haute de 8,0 à `toscene` − 0,15 ; **sur « heures »** (9,16) `#track-old` s'efface (opacité → 0,08), il ne reste que `#track-keep` | la boîte 8–15 % de la largeur, seule couleur chaude |
| **coupe 2** `toscene` → `metres` 12,02 | « Elle descend dans le noir : trois mille neuf cents mètres. » | `VIEW.sink`, `{ ...STAGED, depth: 300, wreck: 0, rush: 1, ping: 1, spin: 0, tilt: 8, days: 30, pool: 0 }` : on descend avec elle ; `depth` 300 → 3 900 (`sine.in`, la jauge de l'en-tête défile), **elle touche le fond sur « mètres »** : `rush` → 0, `tilt` → 0, une bouffée de sédiment (si `fond.js` l'a), `pool` → 0,25 | la boîte 30 % |
| `wake` 12,98 → `seconde` 14,98 | « L'eau réveille sa balise : un appel par seconde. » | la caméra glisse sur la balise (au fond, de trois quarts) ; `ping` 0,6 → 1 et `litBeacon` 1 sur « réveille » ; les anneaux, un par seconde (l'un naît à ≈ 14,1, juste avant « appel ») | la balise 30 % |
| `porte` 15,62 → `mieux` 16,98 | « Il porte à quelques kilomètres, au mieux. » | **recul par rapport** jusqu'à `VIEW.range` (sur « kilomètres ») : `range` 0 → 1, les anneaux s'arrêtent sur la demi-sphère, la boîte devient un point veille ; `co.add` « Portée » ; puis vers `VIEW.ocean` sur « au mieux » : la bulle, petite dans le noir | la colonne 100 % de la hauteur ; puis la bulle 15 % |
| `trouve` 17,54 → `taise` 19,14 | « Trouve-la… avant qu'elle se *taise*. » | « Trouve-la… » : on tient l'océan (la tâche du spectateur) ; puis **plongée par rapport** jusqu'à `VIEW.floor` ; **sur « taise »** : `alarm` 1 (J−30 passe au signal), `D.punch` | la boîte 30 % de trois quarts sur son halo |
| `taise` → `tobench` 20,70 | « Alors… » | presque immobile : la caméra s'approche (`d` 115 → 90) ; `range` 0 ; `ping` reste 1 | la boîte 40 % |

## `acte2.js` — 02 AUTOPSIE (`tobench` 20,70 → `tozero` 43,36)

Commence par `benchCut(D, { at: t.tobench, set: SET.BENCH, view: <la pose où l'acte 1 finit>, origin: [0, 0, 0], state: { ...BENCHED, days: 30, alarm: 1, depth: 3900, ping: 1 } })`. `mood` 0. Finit par une coupe vers DEEP au seuil.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| `explode` 20,84 → `devant` 22,39 | « …on l'ouvre. » | **sur « on »** : `explode` 0 → 1 (≈ 1,2 s, le chemin de l'avant vers le cœur), recul par rapport vers `VIEW.exploded` | l'éclaté 80 % de la largeur |
| `devant` → `pile` 24,48 | « Devant, sa +balise+, avec sa propre pile. » | `VIEW.beaconBench` ; `litBeacon` 1, `co.add` « Balise » ; sur « pile » `litPile` 1, `co.add` « Pile » (le niveau plein, veille) | balise + pile 50 % |
| `boitier` 25,16 → `blinde` 27,52 | « Puis le boîtier et son électronique : rien n'est blindé. » | `VIEW.caseBench` ; `litCase` 1, « Boîtier », « Électronique » ; **sur « blindé »** : `xray` 0 → 1 — boîtier et cartes passent au verre | boîtier et cartes 60 % |
| `milieu` 28,08 → `memoire` 31,04 | « Et au milieu… un bloc de quelques kilos : la *mémoire*. » | la caméra vient au module (`VIEW.core`, gros plan **au mot « mémoire »**) ; `litCore` 1, « Mémoire » ; le reste reste au verre. **Couverture** : `eclate$` (31,04) | le module 45 % |
| `torepos` 31,58 → `absorbeur` 35,00 | « Autour d'elle : de l'acier, un isolant, un absorbeur de chaleur. » | `section` 0 → 1 sur « Autour » (`VIEW.section`) ; `litSteel` sur « l'acier », `litInsul` sur « isolant », `litAbsorb` sur « absorbeur » (la précédente s'éteint) ; `co.add` à chacune | le module en coupe 55 % |
| `testee` 35,44 → `degres` 36,60 | « Testée à onze cents degrés… » | `heat` 0 → 1 : la flamme lèche l'acier, **meurt sur l'isolant** à « degrés » ; `chip-feu` de `testee` à `deau` − 0,7 | idem |
| `sixmille` 37,24 → `deau` 37,96 | « …et à six mille mètres d'eau. » | `heat` → 0 ; `crush` 0 → 0,6, `flex` 0,3 : les flèches serrent, le module ne bouge pas ; `chip-eau` jusqu'à `mais` − 0,15 | idem |
| `mais` 38,40 → `toseuil` 40,21 | « Mais sa balise compte déjà les *jours*. » | `crush` → 0, `section` → 0 ; la caméra revient sur la balise et sa pile (`VIEW.beaconBench`) ; `charge` 1 → 0,85 ; **sur « jours »** : `days` 30 → 29 | balise 45 % |
| **coupe** `toseuil` → `tozero` 43,36 | « +Abonne-toi+ : ces deux ans au fond, on les *traverse*. » | raccord sur la balise qui flashe : DEEP, `{ ...STAGED, days: 29, alarm: 1, ping: 1, pool: 0.25 }`, la caméra haute au-dessus de la boîte (`VIEW.floor` à `d` 400, `el` 50) **plonge déjà** vers elle ; `days` 29 → 2 (`"none"`) pendant le seuil ; `followCall` de `seuil` à `seuil$` + 0,15 | la boîte 20 → 35 % |

## `acte3.js` — 03 RÉPONSE (`tozero` 43,36 → `toverdict` 61,45)

En coupes, un plan par souffle. `mood` 1 → **0 sur « tient »** (51,96).

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| **coupe** `tozero` → `passes` 45,16 | « *Zéro*. Les trente jours sont passés. » | `VIEW.alone`, `{ ...STAGED, days: 1, alarm: 1, ping: 0.6, charge: 0.1 }` ; `days` → 0 sur « Zéro » (`steps`), `jolt` ; le dernier anneau part ; `charge` → 0, `ping` → 0 sur « passés » | la boîte 6 % — seule |
| `personne` 45,64 → `entendue` 46,52 | « Personne ne l'a entendue. » | le dernier anneau monte vers la surface et s'éteint en route (`range` 0,3 → 0) ; la caméra lève les yeux vers le noir — rien ne revient | la colonne noire 80 % |
| `attend` 47,08 → `zero$` 49,88 | « Elle attend, dans le noir, sous trois mille neuf cents mètres d'eau. » | **coupe** (dans le souffle 46,6) : large, la boîte immobile, seule sur le fond, 3 900 m d'eau au-dessus (`VIEW.range` sans `range` : la boîte n’est plus qu’un point **encre**, sa balise est morte) ; la jauge lit 3 900 | la colonne 100 % |
| **coupe** `reponse` − 0,12 → `tient` 52,16 | « L'eau pèse. L'acier *tient*. » | `VIEW.crushed`, `{ ...STAGED, days: 0, alarm: 1, xray: 1 }` : `crush` 0 → 1 sur « pèse » (flèches énormes), `flex` 0 → 0,8 ; **sur « tient »** : `hold` 1 (l'acier veille), `flex` → 0,25, `mood` 0, `D.punch` | le module 50 % |
| `mois` 52,80 → `deuxans` 54,96 | « Un mois. Un an. Presque deux ans. » | trois souffles, trois cadres qui reculent : `months` → 1 (« mois »), → 12 (« an »), → 23 (« ans »), chacun en 0,2 s ; la neige se pose sur la boîte ; `crush` 1 → 0,3 | module 50 % → boîte 25 % → boîte 8 % |
| **coupe** `avril` − 0,12 → `mai` − 0,12 | « Avril deux mille onze : on retrouve l'*épave* du Rio-Paris. » | `VIEW.wreck`, `{ ...STAGED, months: 23, alarm: 1, mood: 0, xray: 1 }` ; `beam` 0 → 1 : la lumière descend et éclaire l'épave de verre ; `chip-2011` de `avril` à `mai` − 0,4 | l'épave 60 % de la largeur |
| **coupe** `mai` − 0,12 → `onla` 60,28 | « En mai, sa mémoire remonte. » | `VIEW.rise`, `{ …, free: 1, beam: 1, xray: 1 }` : le module sort du boîtier de verre et **monte dans le faisceau** ; `depth` 3 900 → 3 600 (`sine.in`), `rush` 0 → −1 ; le fond et le boîtier éteint s'éloignent dessous | le module 30 % |
| **coupe** `onla` − 0,12 → `toverdict` | « Et on la +lit+. » | l'établi (le laboratoire) : `VIEW.section`, `{ ...BENCHED, months: 23, alarm: 1, section: 1, free: 0 }` ; **sur « lit »** : `read` 0 → 1, les données montent en traits veille | le module 55 % |

## `fin.js` — chute, ce qui est dû, like, prochain dossier, boucle (`toverdict` 61,45 → 89,6)

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| **coupe** `toverdict` → `tocta` 67,61 | « Voilà son secret : ce n'est *pas* sa balise qui la sauve. C'est un bloc de quelques kilos… qui sait +attendre+. » | DEEP `VIEW.verdict`, `{ ...STAGED, months: 23, alarm: 1, mood: 0, depth: 3899.2, free: 1, apart: 1, beam: 1 }` : la balise et le boîtier en morceaux, éteints, au sol ; le bloc orange seul dans le faisceau ; lente montée. `retitle` (show `chute` + 0,1, strike `verdict`, swap `bloc2` − 0,25, hide `tocta` − 0,42) ; **`D.verdict(t.attendre)`** (le nom du compte s'allume sur « attendre », comme le dit le `voir`) | le module 15 %, les morceaux 40 % |
| **coupe** `tocta` → `tolike` 79,20 | « Et ton avion ? En Europe, sur un gros avion sorti avant 2021, elle ne doit garder que deux heures de voix. Après : vingt-cinq. En commentaire : ton prochain avion… d'avant, ou d'après ? » | AIR `VIEW.plane`, `{ ...FLOWN, months: 23, alarm: 1 }` ; la caméra traverse la queue jusqu'à la boîte (`VIEW.tail` → `tailBox`) avant « Après » ; `chip-2h` de `deuxh` − 0,3 et `chip-25h` de `vingtcinq` − 0,1, **côte à côte**, jusqu'à `commentaire` − 0,6 ; puis `duelCall` (`from` `commentaire` − 0,5, `aAt` `davant`, `bAt` `dapres`, `to` `tolike` − 0,3) — le film ne répond pas | l'avion 90 % → la boîte 15 % |
| **coupe** `tolike` → `toabo` 83,09 | « +Like+ : pour quelqu'un qui la croit encore *noire*. Elle est orange vif. » | BENCH `VIEW.like`, `{ ...BENCHED, months: 23, alarm: 1 }` : la boîte entière ; **sur « orange »** `shine` 0 → 1 (les bandes accrochent la lumière) ; `likeCall` (`from` `like`, `to` `like$` + 0,12) ; `D.punch(t.noire)` | la boîte 55 % |
| `toabo` → `toloop` 87,23 | « Prochain dossier : la barrière du passage à niveau. Elle est faite pour casser. » | recul vers `VIEW.whole` décalé (`shift` −110) sous le panneau ; `nextFile` (show `abo` − 0,15, fact `dossier` + 0,5, hide `toloop` − 0,38). Rien du sujet ne revient après | la boîte 35 % sous le panneau |
| **coupe** `toloop` → fin | « Pendant ce temps, quelque part… » | DEEP près de `POSE0` (`{ ...POSE0, d: 150 }`), `{ ...FIRST, depth: 30 }` : la boîte recommence à couler ; `D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: 150 })` | = première image |

---

## La première image — quatre candidates (à tirer sur le vrai décor, AVANT les actes)

`npm run look -- 034 --file .cache/planches/034/premiere-image.json --out .cache/planches/034/premiere-image.jpg --cols 5` (sans `--bare` une fois, pour l'en-tête). État : `FIRST` (+ `spin`, `tilt` de chaque ligne). `WRECK.tailSink` est réglé pour `az −28` : la queue doit tomber **derrière** la boîte dans chacune ; la cinquième image vérifie (a) à 0,7 s. Notes sur les six points de `docs/recette-agents.md` (événement · perspective · menace derrière · forme reconnue à 40 % · système déjà là · bouge par son sujet), sur bouchons :

- **(a) contre-plongée de trois quarts** (`POSE0` provisoire) — `{ tx 0, ty 13, d 120, az −28, el −52, fov 44, shift 120 }`, spin 20, tilt 18. ✓ elle coule, tourne, la neige monte · ✓ basse · ✓ la queue de verre derrière, liseré signal · ✓ la boîte 40 %, la dérive d'un A330 · ✓ l'anneau veille · ✓ rotation + neige. **6/6** sur bouchon (la queue se lit derrière). Risque : de dessous, la boîte se lit par son ventre — à juger sur le vrai modèle.
- **(b) dans l'objectif** — `{ tx 0, ty 13, d 80, az −26, el −60, fov 56, shift 100 }`, spin 40, tilt 25. ✓ · ✓✓ vertige du grand angle (003) · ~ la queue petite au loin · ✓ boîte 55 % · ✓ · ✓. **5/6** ; risque : la boîte déformée, la queue illisible.
- **(c) la balise devant** — `{ tx −4, ty 15, d 110, az −28, el −46, fov 44, shift 130 }`, spin 95, tilt 10 : le nez de la balise et son anneau vers l'objectif. ✓ · ✓ · ✓ · ~ la boîte vue par son bout (moins reconnaissable) · ✓✓ le système au premier plan · ✓. **5/6** ; promet le film (« sa balise ») mais montre moins la « boîte ».
- **(d) la queue entière** — `{ tx 0, ty 60, d 210, az −28, el −44, fov 36, shift 90 }`, spin 20, tilt 18 : la dérive entière derrière, la surface. ✓ · ✓ · ✓✓ · ~ la boîte 25 % seulement · ✓ · ✓. **5/6** ; la plus « catastrophe », la boîte trop petite.

Si (a) l'emporte, `POSE0` est déjà en place ; sinon, coller la pose choisie dans `world.js` (`POSE0`) et ses `spin` / `tilt` dans `FIRST`, et recaler `WRECK.tailSink` (plan.js).

## Ce qui reste fragile (à regarder en premier)

- Les poses **AIR** (`VIEW.tail`, `tailBox`) : sur bouchon, la peau de verre masque la boîte à `d` 120 et l'empennage traverse le cadre à `d` 900 — chercher un cadre sur quatre azimuts.
- Le grand recul `range` → `ocean` puis la plongée vers `floor` en 2,4 s (acte 1) : le facteur est de 35 000 ; vérifier à 17,0, 17,8, 18,4 s qu'aucune image n'est vide.
- Les gouvernes de l'A330 : `world.js` les éteint de l'extérieur (`quiet`) — vérifier qu'elles ne sont plus vertes.

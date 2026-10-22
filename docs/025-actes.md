# 025 · ESP — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **91,5 s**) : le minutage est RÉEL. Tout instant se lit quand même dans le script — un repère d'`episode.json` (`cues` : 78, écrits et vérifiés un par un sur la table, image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; une durée s'écrit comme un écart entre deux repères. Les secondes ci-dessous sont là pour te repérer (`npm run script -- 025`). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des squelettes, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/017-irm/src/acte*.js` ; fin : `kit/template/src/fin.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js`. Les poses qui cadrent bien seront dans les journaux des décors (`docs/journal/025-route.md`, `025-model.md`) et de l'habillage — pars d'elles ; `VIEW` n'est qu'un point de départ, réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

La nuit, une route de campagne mouillée, ≈ 80 km/h (illustratif : jamais dit). Un sanglier dans ta voie ; tu braques à GAUCHE d'un coup ; l'arrière décroche (survirage), la voiture commence une toupie. Ce que fait l'ESP (Bosch, A) : il compare 25 fois par seconde le mouvement voulu (le volant) et le mouvement réel (le lacet) ; s'ils divergent, **il réduit d'abord la puissance du moteur, puis freine des roues, une par une**. Dans ce cas (survirage), la roue freinée est **l'avant extérieure au virage : l'avant DROITE** — une seule source secondaire : l'image le montre, l'écran n'affirme rien de plus que le script (l'étiquette `chip-coin` redit la voix, sans plus).

- **À ne pas dire, ni montrer comme un fait** : un délai en millisecondes ; « une seule roue, toujours » (le film montre CE cas) ; « l'ESP crée de l'adhérence » ; une vitesse du test de l'élan ; un nombre de voitures rappelées ; qui possède la marque ESP.
- **« Il coupe les gaz »** = il réduit la puissance (`chip-gaz` : « Puissance réduite ») ; le flux du moteur s'arrête (`gas` → 0), la vitesse de l'en-tête baisse un peu.
- **1997** : en Suède, un journaliste, une voiture neuve, l'évitement d'un élan ; elle **bascule** (« umgekippt » : ni toit ni flanc dits) → sur deux roues, au point de bascule, jamais retombée, jamais sur le toit ; personne dedans à l'image (`you` 0) ; **aucune vitesse dans l'en-tête** (`archive` 1). Aucun logo, aucune Classe A dessinée : notre voiture de verre, et c'est la voix qui dit « Mercedes ». Le système est caché dans cette voiture-là (`world.js` : elle n'avait pas d'ESP).
- **« Depuis 2014… en Europe »** = l'Union européenne, toutes les voitures neuves au 1er novembre 2014 (`chip-2014` le précise).
- Personne n'est blessé ; le sanglier n'est jamais touché ; pas de choc.
- Le prochain dossier : **026, Soyouz MS-10** (une fusée lâche en pleine montée, ses deux passagers rentrent vivants) — le mode de sauvetage n'est pas dit.

## L'en-tête : la question de l'ESP

- **`kmh`** (en grand, `main.js`) : **80 km/h** (illustratif) ; il baisse un peu quand l'ESP agit (≈ 80 → 74 de `gaz` à `droit`, illustratif lui aussi), puis reste ; signal quand l'écart dépasse 3°, encre sinon. Sur l'établi il garde sa valeur. En 1997 (`archive` 1) : « Oct. 1997 ». Après `toloop`, il lit `FIRST`.
- **« Écart »** : |`yaw` − `aim`| en degrés, arrondi — l'angle, mesuré dans la scène, entre où pointe la voiture et où le volant demande d'aller ; **veille sous 3° (« oui »), signal au-dessus (« non »)**. En 1997 : « — ». **Tu ne l'écris jamais : tu bouges `yaw` et `aim`, l'en-tête suit.** Sur l'établi aussi : les gestes de l'autopsie (« où tu veux aller », « où la voiture va vraiment », « oui ») passent par `aim` et `yaw`, et l'en-tête devient la question du calculateur.
- **`HANDOFF`** (`world.js`) : l'acte 1 FINIT sur ces valeurs, l'acte 2 PART d'elles (son `benchCut` les reprend, puis les ramène à 0 pendant l'éclaté) : l'écart ne saute pas sur « Alors… on l'ouvre ».

## Deux repères (`onboard`) — à lire avant de poser une caméra

- `onboard` **0** : la route est immobile, la voiture tourne dessus de `yaw` — **la toupie, les flèches, le large, tout plan qui doit montrer que la voiture ne va pas où tu braques**.
- `onboard` **1** : la voiture est d'équerre, la route tourne dessous — **les plans serrés de la voiture et du système** (le volant, le moteur, le bloc, le coin avant droit), et **la coupe vers l'établi** (l'établi ne tourne pas : le raccord tient).
- Une coupe peut changer `onboard` ; dans un plan il reste fixe — ou glisse lentement (sine.inOut) quand `yaw` est près de 0. Sur l'établi, `onboard` 0 fait tourner le squelette de `yaw` sur son halo (le geste du capteur de lacet) ; `BENCHED` remet 1.
- Chaque pose de `VIEW` dit pour quel repère elle est écrite ([0] / [1]). `az` 0 se tient DERRIÈRE la voiture (+z), −90 à sa GAUCHE (−x), ±180 devant ; la clé vient de derrière à gauche.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.
- **Chaque coupe est un raccord** (forme, objet, mouvement) : on coupe sur la pièce que la phrase vient de nommer, ou dans le sens du mouvement. Les raccords sont écrits dans les tables. Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant.
- **Le film est au ralenti sur la route** : `gap` (et `rolled`, qui croît d'autant) avance de `MPS / SLOWMO` ≈ 3,7 m par seconde de film, en ligne droite (`"none"`) — une route immobile, c'est une voiture arrêtée. Une coupe le POSE.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête (sans `--bare`).
- Mouvements `sine.inOut`, longs ; un recul ou une plongée par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La caméra traverse le verre (carrosserie), jamais le système, le sanglier ou toi.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 60 le comparateur, ≈ 120 un coin, ≈ 600 la voiture, ≈ 1 500 la voiture et le sanglier, ≈ 4 000 le large ; `SIZE` sur l'établi).
- **Couleurs** : `mood` 1 sur la route jusqu'à « Tu es droit », 0 sur l'établi et après. Jamais à mi-chemin plus d'une demi-seconde. `alarm` franc (0 ou 1).
- Toi, de près, es de verre : jamais en très gros plan, jamais la main seule (les mains SUR le volant, avec le volant et le capteur).
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée. S'il t'en manque un, écris-le sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf. **26 images lues au plus.** Journal : `docs/journal/025-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire de la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-25` (Chaque seconde / 25 comparaisons, encre) · `chip-oui` (La réponse / Oui, veille) · `#rail-seuil` · `chip-non` (La réponse / Non, signal) · `chip-gaz` (Moteur / Puissance réduite, veille) · `chip-coin` (Freinée / L'avant extérieure, veille) · `#retitle` (Elle freine : « Pour ralentir » barré → « Pour tourner ») · `chip-1997` (Octobre 1997 / Suède, encre) · `chip-livraisons` (Mercedes / Livraisons arrêtées, signal) · `chip-2014` (Depuis novembre 2014 / Voitures neuves · UE, veille) · `#cta-field` (« La tienne : avant ou après 2014 ? » → « APRÈS », 5 signes) · `#net` · `#next` (Prochain dossier · 026 — « Une fusée lâche en pleine montée. Ses deux passagers rentrent vivants. » — S'abonner pour l'ouvrir) · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre (« Capteur d'angle », « Capteur de lacet », « Capteurs de roue », « Calculateur »). Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

## La première image — quatre candidates

**« Un sanglier. »** : la première image montre le sanglier dans tes phares, sur la route mouillée, la nuit. Elle se lit sans le son à 270 px, et elle bouge dès l'image 1 (la pluie, la route qui défile, la caméra qui pousse). L'agent de `route.js` les tire sur une planche (sur le vrai décor), celui qui orchestre choisit AVANT les actes et colle `POSE0` dans `world.js`.

- **(a) les phares** (`VIEW.chase`) : bas, derrière la voiture à gauche, par-dessus son toit de verre — les deux cônes de lumière sur l'eau, et au bout, le sanglier, ses yeux qui renvoient deux points signal. Classique et lisible ; le risque : le sanglier petit.
- **(b) le sanglier** (`POSE0` provisoire) : au ras de l'eau, devant le sanglier, tournée vers la voiture — sa silhouette de verre au premier plan, les deux phares qui foncent sur lui derrière, leurs longs reflets. La plus forte ; le risque : un animal de verre en contre-jour peut ne se lire que par ses arêtes. Sur bouchon, il est trop près et sort à gauche : centrer sur `BOAR.x`, le reculer.
- **(c) de haut** (`VIEW.top`) : la voiture au centre, ses cônes de lumière, le sanglier dedans, la route en diagonale — la carte de la scène, et le cadre exact de la toupie qui suit. Le risque : un plan « carte » moins viscéral.
- **(d) ton volant** (`VIEW.shoulder`, `onboard` 1) : dans la voiture, côté passager, derrière ton épaule — tes mains de verre sur le volant, et par le pare-brise le sanglier dans les phares. Le « tu » le plus direct ; le risque : le tableau de bord encombre (sur bouchon, le moteur gris masque le centre).

## 01 · MENACE — `acte1.js` (0 → `tosystem` 18,87)

L'acte part de `POSE0` et de `FIRST` ; en UN mouvement, deux coupes au plus. `onboard` 0 (la route immobile) tant que la voiture tourne ; la caméra suit la voiture (elle reste à l'origine). Il FINIT sur `VIEW.system` à `onboard` 1 et sur `HANDOFF`.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 → `swerve` 1,38 | « Un sanglier. » | `POSE0`, `FIRST` : le sanglier dans tes phares ; `gap` file (≈ 3,7 m/s), la caméra pousse. Sur « sanglier » (`boar` 0,26) ses yeux sont déjà là |
| `swerve` 1,38 → `lets` 3,51 | « Tu braques d'un coup… » | `steer` 0 → 0,75 d'un coup (≈ 0,3 s, `power2.out`), `aim` 0 → 14 (sine.out, jusqu'à `lets`) et `yaw` suit `aim` (l'écart reste sous 3° : veille) ; `lane` 0 → 0,8 ; la caméra s'élève et passe au-dessus de la voiture (vers `VIEW.top`, par rapport) ; le sanglier passe à droite, sous la caméra (`gap` → ≈ 0 vers `catch`) |
| `lets` 3,51 → `catch` 4,54 | « …et l'arrière de ta voiture décroche. » | **sur « décroche »** : `yaw` 14 → 34 (`power2.in`) pendant que `aim` reste 14 — l'arrière part vers la droite ; `slide` 0 → 1, les traces signal ; l'écart de l'en-tête passe au signal ; `mood` 1 |
| `catch` 4,54 → `onewheel` 6,18 | « Elle se rattrape seule : » | **le temps s'arrête** (plus rien ne file : `gap`, `yaw` tenus ; la pluie tient) — de haut, la caméra se pose au-dessus de la voiture penchée sur sa toupie |
| `onewheel` 6,18 → `notfour` 6,62 | « elle freine une roue. » | `litFR` 0 → 1 : le coin avant droit s'allume veille (une lumière qui a un endroit) |
| `notfour` 6,62 → `reflex` 7,86 | « Pas les quatre. » | sur « Pas » : `litCorners` 0 → 1 (les quatre coins, encre-veille faible) ; sur « quatre » : `litCorners` → 0 — il ne reste que l'avant droit |
| `reflex` 7,86 → `toscene` 10,59 | « Et ce réflexe, elle le doit… à un élan. » | `litFR` → 0 ; la caméra pivote vers la gauche de la route, là où balaient les phares de la voiture en travers ; **sur « élan »** (`moose1` 9,66) : `moose` 0 → 1, `mooseAt` 1 — un élan de verre debout au bas-côté, au bord du faisceau. Aucune légende (le C se paie au commentaire) |
| `toscene` 10,59 → `pivot` 13,17 | « Ton volant dit : à gauche. » | `moose` → 0 ; le temps reprend (`gap` file) ; de haut (`VIEW.top`) : sur « gauche » (`left` 11,52) : `arrows` 0 → 1 — la flèche encre, le long d'`aim` (14) |
| `pivot` 13,17 → `toupie` 14,64 | « Ta voiture, elle, pivote trop. » | `alarm` 1 ; la flèche de la voiture, signal, PASSE la flèche encre : `yaw` 34 → 55 sur « pivote » ; l'écart de l'en-tête grimpe |
| `toupie` 14,64 → `counter` 15,50 | « Elle commence une toupie. » | la caméra recule par rapport vers le large (`VIEW.wide`) : `yaw` 55 → 75, `lane` → 2,2 — la voiture en travers file vers le fossé de gauche |
| `counter` 15,50 → `late` 16,64 | « Contre-braquer ? » | **coupe 1** (raccord : de la voiture en travers au volant qu'on tourne) : tes mains et le volant (`VIEW.hands`, `onboard` 1), `steer` 0,75 → −0,8 (les mains tournent à droite) |
| `late` 16,64 → `strong` 17,76 | « Trop tard… » | **coupe 2** (retour au large, `onboard` 0) : rien ne répond — `yaw` continue 75 → 85, les flèches s'écartent |
| `strong` 17,76 → `tosystem` 18,87 | « …ou trop fort. » | même plan : l'arrière fouette de l'autre côté — `yaw` 85 → `HANDOFF.yaw` (−24) en ≈ 0,6 s (`power2.inOut`), `aim` → `HANDOFF.aim`, `steer` → `HANDOFF.steer`, `lane` → `HANDOFF.lane` : la voiture jetée vers l'autre fossé, et le temps s'arrête |
| `tosystem` 18,87 → `tobench` 19,58 | *(silence avant « Alors… »)* | `onboard` 0 → 1 en glissant (sine.inOut : c'est la caméra qui tourne autour d'une voiture figée), `shell` → 0,4, `fs` → 600, `slide` → 0, `arrows` → 0 ; la caméra plonge vers `VIEW.system` : le système plein dans la voiture de verre. C'est de là que l'acte 2 coupe |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` 18,87 → `tozero` 39,35)

L'établi : le squelette, sur son halo. `kmh` n'est pas touché (80). `mood` 0. « Alors… on l'ouvre » est seul dans son plan.

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` 19,58 → `explode` 19,72 | « Alors… on l'ouvre. » | `benchCut` depuis `VIEW.system` (`origin` `BENCHAT` = [0,0,0] : la coupe est EN PLACE, la voiture disparaît autour du système), état `{ ...BENCHED, yaw: HANDOFF.yaw, aim: HANDOFF.aim }` ; **sur « on »** : `explode` 0 → 1 (≈ 0,9 s, `power2.out`), `yaw`, `aim` → 0, recul par rapport vers `VIEW.exploded` |
| `volant` 21,66 → `lacet` 23,82 | « Un capteur dans le volant : où tu veux aller. » | la caméra vient au volant et à son capteur (`VIEW.wheelBench` en éclaté) ; `litSteer` 1 ; `co.add` « Capteur d'angle » ; sur « veux » (`want` 22,50) : `steer` 0 → 0,5 — le volant tourne, `aim` 0 → 12 : l'écart de l'en-tête monte à 12, encre (le volant a parlé, la voiture pas encore) |
| `lacet` 23,82 → `perwheel` 26,78 | « Un capteur de lacet : où la voiture va vraiment. » | `litSteer` 0, la caméra descend au capteur de lacet (`VIEW.yawBench`) ; `litYaw` 1 ; `co.add` « Capteur de lacet » ; sur « vraiment » (`really` 25,26) : `onboard` 0 et `yaw` 0 → 12 — **tout le squelette tourne sur son halo** et l'écart retombe à 0, veille |
| `perwheel` 26,78 → `calc` 27,50 | « Un capteur par roue. » | `litYaw` 0, recul : les quatre coins (`litWheels` 1, `rolled` avance : les couronnes tournent, `sense` 1 : les impulsions montent) ; `co.add` « Capteurs de roue » |
| `calc` 27,50 → `torepos` 29,66 | « Et un calculateur… qui compare. » | la caméra va au calculateur et à son comparateur (`VIEW.ecuBench`) ; `litWheels` 0, `litEcu` 1 ; `co.add` « Calculateur » ; **sur « compare »** (28,62) : les deux aiguilles (12 et 12) se posent l'une sur l'autre, veille. Couverture : `eclate$` (29,12) — à proposer |
| `torepos` 29,66 → `question` 31,70 | « Vingt-cinq fois par seconde, » | `explode` → 0 pendant un recul vers `VIEW.whole` (le squelette se rassemble) ; `chip-25` de `torepos` à `question` − 0,15 |
| `question` 31,70 → `oui` 34,66 | « il pose la même question : elle va là où tu braques ? » | le geste complet, de haut : `steer` 0,5 → −0,3 → 0,4, `aim` suit (12 → −6 → 10), et `yaw` suit `aim` de près (le squelette tourne d'un côté puis de l'autre) — l'écart reste sous 3°, veille ; le comparateur au bord du cadre |
| `oui` 34,66 → `toseuil` 36,31 | « Tant que la réponse est oui… il ne fait rien. » | `chip-oui` de `oui` à `toseuil` − 0,15 ; la caméra s'approche du bloc et des quatre conduites : **sur « rien »** (35,70) : rien ne bouge, aucun frein ne serre (`bFL…bRR` 0) — c'est l'image qui le dit |
| `toseuil` 36,31 → `watch` 38,66 → `tozero` 39,35 | « Abonne-toi : cette roue freinée sans toi… regarde. » | `followCall` (`from` `toseuil`, `to` `seuil$`) ; **le film ne s'arrête pas** : la caméra est déjà en route vers le coin avant droit (`VIEW.frBench`) ; sur « roue » (`thiswheel` 37,22) : `litFR` 0 → 0,6 ; sur « regarde » elle est dessus |

## 03 · RÉPONSE — `acte3.js` (`tozero` 39,35 → `toverdict` 56,89)

En coupes, un plan par souffle. On rejoue la toupie — avec l'ESP. `mood` 1 jusqu'à « droit ». Départ suggéré (à `tozero`) : `{ ...STAGED, gap: −6, steer: 0.75, aim: 14, yaw: 16, lane: 0.8 }`.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` 39,35 → `volant2` 40,42 | « L'arrière part. » | **coupe** (raccord : du coin avant droit de l'établi à la même voiture sur la route) : de haut (`VIEW.top`, `onboard` 0) ; sur « part » (39,86) : `yaw` 16 → 32, `slide` 0 → 1 |
| `volant2` 40,42 → `tourne` 41,86 | « Le volant dit gauche. » | **coupe** : tes mains, le volant et son capteur (`VIEW.hands`, `onboard` 1) ; `litSteer` 1, `sense` 1 ; `arrows` 1 côté route au plan suivant |
| `tourne` 41,86 → `non` 43,62 | « La voiture tourne trop. » | **coupe** : de haut (`VIEW.top`) : les deux flèches, la signal passe l'encre : `yaw` 32 → 46 ; `alarm` 1 |
| `non` 43,62 → `toupie2` 44,34 | « La réponse est non. » | **coupe** : le comparateur dans la voiture (`VIEW.unit`, `onboard` 1, `litEcu` 1) : deux aiguilles écartées, le secteur signal ; `chip-non` de `non` à `gaz` − 0,15 |
| `toupie2` 44,34 → `gaz` 46,73 | « Et la toupie… a commencé. » | **coupe** : le large (`VIEW.wide`) : `yaw` 46 → 60, `lane` → 1,6, la voiture glisse vers le fossé |
| `gaz` 46,73 → `trigger` 47,63 | « Il coupe les gaz. » | **coupe** : le moteur et ses arbres (`VIEW.engine`, `onboard` 1) ; sur « gaz » : `gas` 1 → 0 (≈ 0,2 s) — le flux s'arrête ; `kmh` 80 → 77 ; `chip-gaz` de `gaz` à `une` − 0,15 |
| `trigger` 47,63 → `une` 48,22 | « Puis il freine. » | **coupe** : le bloc et le départ de la conduite avant droite ; sur « freine » : `bFR` 0 → 0,5 — la tête de pression veille part dans la conduite |
| `une` 48,22 → `exterieur` 49,63 | « Une roue. L'avant. » | **coupe** (raccord : on suit la pression jusqu'au bout de la conduite) : le coin avant droit (`VIEW.cornerFR`) ; sur « roue » (48,48) : `bFR` → 1 — les plaquettes serrent, le disque passe veille ; `litFR` 1 |
| `exterieur` 49,63 → `coin` 52,10 | « À l'extérieur du virage. » | **coupe** : de haut (`VIEW.top`, `onboard` 0) : la voiture en travers, UN seul coin allumé, l'avant droit, à l'extérieur de la courbe ; `litCorners` 0 ; `chip-coin` de `exterieur` à `coin` − 0,15 |
| `coin` 52,10 → `nez` 53,82 | « Freinée par ce seul coin, la voiture se redresse. » | même plan : `moment` 0 → 1 (l'arc veille, contre la toupie) ; **sur « redresse »** (52,94) : `yaw` 60 → 28 (sine.inOut), la flèche de la voiture revient vers l'encre |
| `nez` 53,82 → `suit` 55,10 | « Le nez revient. » | **coupe** : bas, devant (`VIEW.front`) : le nez se réaligne, `yaw` 28 → 10 |
| `suit` 55,10 → `droit` 55,98 | « L'arrière suit. » | **coupe** : bas, derrière (`VIEW.rear`) : l'arrière rentre, `yaw` 10 → `aim` (14), `slide` → 0 |
| `droit` 55,98 → `toverdict` 56,89 | « Tu es droit. » | **coupe** : de haut (`VIEW.top`) : la voiture droite dans sa voie (`steer` → 0,1, `aim` → 0, `yaw` → 0, `lane` → 0,4), les deux flèches confondues veille, `alarm` 0, `bFR` → 0, `moment` → 0, `kmh` → 74 ; **sur « droit » : `mood` 1 → 0** — le relâchement ; l'écart de l'en-tête retombe à 0, veille |

## Fin — `fin.js` (`toverdict` 56,89 → 91,5)

**L'ordre : chute → ce qui est dû + commentaire → like → prochain dossier → boucle.** Plus rien du sujet ne revient après l'annonce. Compare ta dernière image à la première (`look` aux deux instants) ; `D.commit` prévient dans la console si un nombre n'est pas revenu.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` 56,89 → `strike` 58,81 → `ralentir` 59,48 | « Voilà son secret : ta voiture ne freine pas d'abord pour ralentir. » | **coupe** (raccord : de la voiture droite au squelette droit, même cadre de haut) : l'établi (`VIEW.whole`, `{ ...BENCHED }`) ; `retitle` : « Elle freine / Pour ralentir » entre sur `secret` + 0,1, **barré sur `strike`** (« pas ») |
| `one` 60,32 → `verdict` 61,82 | « Elle freine une roue… pour tourner. » | sur « Elle » : `bFR` 0 → 1 (le coin avant droit serre, veille) ; `onboard` 0, `yaw` et `aim` ensemble 0 → −10 (l'écart reste à 0, veille) : **le squelette tourne autour de lui** ; « Pour tourner » sur `verdict` − 0,05 ; `D.verdict(verdict)` ; titre sorti à `tocta` − 0,42 |
| `tocta` 62,81 → `date` 63,56 | « Et l'élan ? » | **coupe** (raccord : la rime avec l'accroche — le même cadre que la première image, l'élan à la place du sanglier) : la route (`{ ...STAGED, archive: 1, you: 0, moose: 1, mooseAt: 0, gap: 22 }`) ; l'en-tête dit « Oct. 1997 », « — » |
| `date` 63,56 → `journalist` 66,36 | « Octobre 1997, en Suède. » | même plan, la caméra pousse ; `chip-1997` de `date` à `avoid` − 0,15 |
| `journalist` 66,36 → `tips` 69,96 | « Un journaliste teste une Mercedes neuve : l'évitement d'un élan. » | sur « l'évitement » (68,52) : la voiture braque à gauche (`steer`, `aim`, `yaw`, `lane`) et passe l'élan ; vu de devant (`VIEW.tip`) |
| `tips` 69,96 → `stops` 71,80 | « Elle bascule. » | sur « bascule » : `tip` 0 → 1 (≈ 0,8 s) — sur deux roues, au point de bascule ; on coupe AVANT qu'elle retombe |
| `stops` 71,80 → `serie` 73,00 | « Mercedes arrête les livraisons… » | la voiture tenue sur deux roues, figée ; `chip-livraisons` de `stops` à `serie` − 0,15 |
| `serie` 73,00 → `since` 74,20 | « …et monte ce système en série. » | **coupe** : l'établi, le squelette (`VIEW.whole`), tout s'allume veille d'un coup (`litEcu`, `litSteer`, `litYaw`, `litWheels` → 0,7, `sense` 1) |
| `since` 74,20 → `ask` 76,96 | « Depuis 2014, toute voiture neuve en Europe l'a. » | **coupe** : la route aujourd'hui (`archive` 0, `you` 1, `onboard` 0) : ta voiture droite dans la nuit, le système allumé dedans (`sense` 1) ; `chip-2014` de `since` à `ask` − 0,15 |
| `ask` 76,96 → `answer` 79,64 → `tolike` 80,85 | « En commentaire : la tienne, elle est d'avant… ou d'après ? » | **coupe** : tes mains sur le volant et son capteur (`VIEW.hands`, `onboard` 1, `litSteer` 0,6) ; `commentCall` (`from` `ask`, `typedAt` `answer`, `chars` 5, `to` `tolike` − 0,3) |
| `tolike` 80,85 → `ditch` 83,26 → `toabo` 83,99 | « Like : seul sur la route, c'est lui qui t'évite le fossé. » | **coupe** : le large (`VIEW.wide`, `mood` 0) : ta voiture seule sur la route la nuit, droite, entre les deux fossés ; sur « fossé » : le fossé se lit au bord du cadre ; `likeCall` (`from` `tolike` + 0,12, `to` `like$` + 0,12) |
| `toabo` 83,99 → `toloop` 89,23 | « Prochain dossier : une fusée lâche, en pleine montée. Et ses deux passagers… rentrent vivants. » | **coupe** : derrière la voiture arrêtée au bord, la caméra levée vers le ciel au-dessus du bois ; `rocket` : 0 → 0,7 de `rocket` à `lets2` + 0,4 (elle monte), 0,7 → 0,8 sur « lâche » (la traînée se rompt), 0,8 → 1 de `crew` à `alive` (un point veille redescend) ; `nextFile` (`showAt` `toabo` + 0,06, `factAt` `rocket`, `hideAt` `toloop` − 0,38, chevrons de `toabo` + 0,1 à `abo$` + 0,15) — **la voix ne redit pas « abonne-toi »** |
| `toloop` 89,23 → `rewind` 90,24 → la fin | « Comme toi, face à… » | **coupe** : la route, le sanglier dans tes phares, d'un peu plus loin que `POSE0` (`{ ...STAGED, boar: 1, rocket: 0, gap: FIRST.gap + (MPS / SLOWMO) × (fin − toloop) }`, `gap` qui file en ligne droite jusqu'à `FIRST.gap` sur la dernière image — jamais à reculons) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène tout à `FIRST` et `POSE0` |

## Ce qui reste fragile (à regarder en premier sur les planches)

- **Le comparateur** : deux aiguilles sur une petite face — lisible ou non à 270 px. S'il ne se lit pas, les flèches de la route et l'écart de l'en-tête portent « oui / non », et `chip-oui` / `chip-non` le disent.
- **La toupie de haut** : la voiture doit tourner SUR une route immobile (`onboard` 0) ; si la route tourne avec elle, on ne voit plus rien.
- **« Une roue… pas les quatre »** dans l'accroche : quatre coins, puis un seul — les coins doivent se lire de haut, à travers la carrosserie de verre.
- **1997** : une voiture sur deux roues, pas un accident ; ni toit, ni choc, ni personne.
- Le ralenti : `gap` à ≈ 3,7 m par seconde de film — trop lent, la route paraît arrêtée ; à régler sur le vrai décor (`SLOWMO`).

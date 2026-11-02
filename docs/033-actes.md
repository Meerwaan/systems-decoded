# 033 · Porte d'avion — le plan de mise en scène

**La voix est enregistrée** (une prise, turbo, **86,1 s**) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues` : 62, vérifiés mot à mot sur la table de `npm run script -- 033`) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre en dur** ; les secondes ci-dessous servent à te repérer. Lis ce haut commun, puis **ta section seulement** (`grep -n "^## " docs/033-actes.md`). Forme d'un acte : `episodes/017-irm/src/` ; fin : `kit/template/src/fin.js`. Les poses qui cadrent seront dans `docs/journal/033-model.md`, `033-vol.md`, `033-habillage.md` : pars d'elles, `VIEW` a été réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

Vol de nuit en croisière (11 300 m, FL370). Ton voisin se lève et force la porte 1L ; elle ne bouge pas : c'est une porte **bouchon**, plus grande que son trou, posée DEDANS sur des **butées** — et l'air de la cabine (≈ 3,5 fois celui du dehors) la plaque dehors contre elles, ≈ 8 t. À l'atterrissage la différence tombe vers zéro : en Corée (Asiana, 26 mai 2023, A321, ≈ 200 m), un passager a levé le levier, la porte s'est ouverte.
- **Jamais à l'image** : la porte qui se soulève ou pivote vers l'intérieur ; la poignée qui encaisse (la charge va dans les butées) ; un toboggan ; une compagnie, un logo, un type d'avion écrit ; un nombre de butées ; quelqu'un de blessé. « Mettons que tous les verrous lâchent » est une **hypothèse** (`chip-hypothese`) ; la Corée est une **reconstitution** (`chip-coree`). La porte de Corée sort et part vers l'avant (`open`), rien d'autre.

## L'en-tête : l'altitude, et ce que l'air met sur la porte

`hud-clock` = **l'altitude** (`alt`, mètres vrais, arrondis à 100 : 11 300 m, 0 m, 200 m) — l'horloge de cette histoire : la voix ne donne pas d'heure, elle donne des hauteurs. `hud-count` « **Sur la porte** » = la force de l'air de la cabine sur la porte, **calculée depuis `alt`** (`world.js · tonnesOf`) : ≈ 8 t en croisière (veille), ≈ 0 t au sol et à 200 m (encre). **Tu ne l'écris jamais : tu bouges `alt`** — l'en-tête, le nombre des flèches des deux faces, la charge sur les butées suivent. Après `toloop`, l'en-tête lit `FIRST`.

## Deux décors, un objet

`SET.VOL` : l'A330 de verre du 023 (dehors, la nuit, la mer, l'île et sa piste) avec la cabine de verre du L03 dedans ; la porte 1L PLEINE à `DOOR_AT`. `SET.BENCH` : la même porte seule sur son halo, **tournée de 180°** (sa face cabine vers la clé). **Azimut** : `az` 0 = dehors devant la porte (flanc gauche +z), +90 = dans l'allée derrière, ±180 = dans la cabine face à la porte ; depuis la cabine, la porte se filme à `az` ≈ 130 → 170. **Pour passer de la cabine à l'établi sur la même image : `benchPose(pose)`** (world.js) — c'est la coupe de « on l'ouvre ». La lumière suit ce qu'on filme : `fx, fy, fz` sur le sujet, `fs` sa taille (≈ 60 une butée, ≈ 250 la porte, ≈ 900 la cabine, ≈ 4 000 l'avion ; `SIZE` sur l'établi). L'avion est immobile, le monde vient à lui : dehors, `ahead` avance un peu, en ligne droite, dans chaque plan.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration, sur le mot.** Une coupe se pose 0,10–0,14 s avant sa phrase (repères `to…`), **pose complète, état complet** (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) ; tu rends la main à l'instant où le suivant coupe ; rien d'une étiquette ne déborde.
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe, jamais deux à moins d'une seconde) : `porte` (1,40) · `ouvert` (9,32) · `altitude`→ `dix` (12,93) · `porte ?` de la scène (18,02) · `cadre` (26,16) · `butées` (28,80) · `toujours` (38,04) · `lâchent` (45,08) · `tonnes` (53,04) · `rien` (56,08) · `pas` de la chute (58,86, avec `D.verdict`) · `l'air` (60,82). `D.captionStyle({ hit: 0.25 })` une fois (acte1).
- **« Alors… on l'ouvre. »** seul dans son plan : la caméra TIENT sur le bord de la porte pendant « Alors… » (19,09 → 19,44, `hush`), coupe vers l'établi à `tobench` (19,82) sur la MÊME image, **l'éclaté s'ouvre sur « on »** (`explode`, 19,96).
- **La boucle** : la dernière image est `POSE0` + `FIRST` (`D.loop`, à `rewind` 84,96) ; la phrase « Deux ans… depuis le jour où… » retombe sur « Ton voisin force la porte ».
- **Anti-parasites** : ce que la caméra frôle est invisible (les passagers de verre du L03, le voisin) ; une plongée ou une remontée se fait par rapport (`shot(at, durée, pose, ease, fromD)`) ; plus d'un quart de tour en une seconde est une coupe ; **jamais plus de 40 cm/s le long de l'allée** (rangées qui défilent) ; mouvements `sine.inOut`. `mood` franc : 1 dans la menace, 0 sur l'établi et dès « Les butées encaissent » ; jamais entre les deux plus d'une demi-seconde.
- **Les flèches** : `air` les montre, `alt` en fixe le nombre (calculé), `wall` le mur, `tug` la flèche du voisin. Aucun chiffre ailleurs que dans l'en-tête ; étiquettes en capitales, sans unité à symbole.
- **Zones** : en-tête 236–410 · zone haute 436–790, une étiquette à la fois (`chip(id, null, 96, 470, de, à)`) · sujet 440–1160 · sous-titres 1248–1488 · rien sous 1600, rien sous les boutons (x > 905, y 880–1760). Planches AVEC l'en-tête.
- **Toi et le voisin sont de verre** : jamais en très gros plan, jamais une main seule (les mains AVEC la poignée et la porte).

## La grille de rétention (qa → « rythme »)

| instant | ce qui doit se passer |
| --- | --- |
| 0 → 0,5 s | le voisin tire DÉJÀ (à-coups, `pull` 1) : le sujet bouge dès l'image 1, la porte reste ; `hit` + `impact` + `swish` avant le premier mot |
| 0,5 → 10 s | chaque phrase sa démonstration ; « Corée » est une coupe-raccord sur la même porte (8,0 s), l'en-tête tombe à 200 m |
| 10 → 25 s | un changement toutes les 2 à 3 s : poids (10,5) · plongée (12,0) · remontée sur toi (14,4) · la porte (16,0) · « on l'ouvre » (19,8) · éclaté (21,4) · poignée et crochets (22,6) ; **aucune plage lente de 2 s** ; un son dans le souffle après chaque mot-clé (déjà dans `sfx`) |
| portes d'acte | `tobench` 19,82 · `tozero` 42,30 · `toverdict` 56,82 : une coupe et son coup (déjà dans `sfx`) |
| fin | `duelCall` « Je la prends » / « Jamais » — le film ne répond pas |

Les sons sont posés (`episode.json → sfx`), tous dans les souffles : si tu déplaces une image, ne déplace pas un son sur un mot (`npm run qa` → « sons posés sur un mot »).

## Les étiquettes (dans `index.html`)

`chip-toi` (Toi, encre) · `chip-coree` (Reconstitution / Corée · mai 2023, signal) · `chip-butees` (Le cœur / Les butées, veille) · `#rail-seuil` · `chip-hypothese` (Hypothèse / Verrous lâchés, signal) · `chip-charge` (La charge / Sur les butées, veille) · `#retitle` (Là-haut, ce qui ferme ta porte : « Un verrou » barré → « L'air ») · `#duel` (La place près de la porte ? Je la prends / Jamais) · `#net` · `#next` (Prochain dossier · 034, titre classé, « Presque deux ans au fond de l'Atlantique. ») · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre : « Poignée », « Crochets de verrouillage », « Cadre », « Butées ».

## acte1.js

**01 · MENACE — 0 → `tobench` 19,82.** Part de `POSE0` + `FIRST` sans coupe ; un mouvement, **deux coupes au plus** (Corée, et le retour en croisière). Finit sur `VIEW.edge` (le bord arrière de la porte, depuis la cabine, gros plan), état `STAGED`, `fs` ≈ 80 — l'acte 2 en tire `benchPose(VIEW.edge)`.

| repère (s) | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 0 → 2,36 | « Ton voisin force la *porte*, en plein vol. » | La première image (candidate retenue) : la cabine de nuit, la porte 1L pleine, le voisin de verre qui tire par à-coups (`pull` 1 dès l'image 1, `tug` 0). La caméra pousse doucement (`glide`, à vérifier à 0,3 et 0,7 s). `D.punch` sur `porte` (1,40). | porte ≥ 40 % de la largeur ; voisin ≈ 30 % |
| 2,87 → 3,48 | « Elle ne bouge +pas+. » | La caméra s'arrête net ; la porte immobile pendant que le voisin tire encore ; les butées s'allument en veille sur « pas » (3,40 : `stops` 0,25 → 0,7). | porte ≈ 50 % |
| 4,03 → 6,68 | « En croisière, personne ne peut l'ouvrir. Même en le voulant. » | **Recul par la coque**, d'un seul mouvement (par rapport, ≈ 2,6 s) : la caméra sort par le verre du fuselage (`shell` 0,35 → 1 quand elle le traverse) jusqu'à `VIEW.plane` — l'A330 de nuit de trois quarts bas, la porte 1L allumée sur son flanc (`stops` 1). `ahead` avance. | l'avion ≈ 80 % ; la porte ≈ 6 % mais allumée |
| 7,16 → 9,72 | « Alors pourquoi, en Corée, un passager en a *ouvert* une ? » | Coupe à `coree` − 0,12 (8,00) sur **la même porte**, même côté, plus près : `VIEW.approach`, `alt` 200, `gear` 1, `runway` 1, `ahead` ≈ 0,03 (feux de piste devant, signal), `mood` 1 ; l'en-tête tombe à 200 m, ≈ 0 t (encre). Sur `ouvert` (9,32) `open` 0 → 0,35, signal ; `chip-coree` de 8,0 à 10,2. On reste sur la question (tenue jusqu'à 10,37). | l'avant de l'avion ≈ 60 %, la porte ≈ 12 % |
| 10,49 → 11,54 | « Il y met tout son poids. » | Coupe à `scene` − 0,12 : retour en croisière DANS la cabine (`STAGED`, `alt` 11 300), `VIEW.doorIn` : le voisin arc-bouté, `pull` 0,7 → 1 sur `poids`, `handle` par à-coups ≤ 0,2. | porte + voisin ≈ 60 % |
| 12,02 → 14,10 | « Dehors, plus de dix kilomètres d'*altitude*. » | **La plongée** : de `VIEW.floor` (à travers le plancher de verre, entre ses pieds) jusqu'à `VIEW.deep` (la nuit, les nuages traversés, les lumières de l'île tout en bas), par rapport, `sine.in` puis tenue. Aucune longueur affichée : l'en-tête dit 11 300 m. | — (le vide) |
| 14,46 → 15,70 | « Toi, tu es juste à côté. » | **La remontée** (par rapport, ≈ 0,9 s, rapide puis douce) jusqu'à toi, assis au premier rang, la porte et le voisin à côté (`VIEW.you`, pose du journal de `vol.js`) ; `chip-toi` 14,36 → 15,8. | toi ≈ 30 %, porte ≈ 25 % |
| 16,06 → 18,18 | « Tu l'arrêtes… ou tu fais confiance à cette +porte+ ? » | De toi à la porte : la caméra glisse (≈ 2 s, `sine.inOut`) vers le bord arrière de la porte, `VIEW.edge` (gros plan, `dof`), le voisin sort du champ ; `D.punch` sur `porte ?` (18,02). | la porte ≈ 70 % |
| 18,18 → 19,82 | (souffle, `suck`) · « Alors… » | La caméra TIENT sur le bord (un très lent glissement, < 1 % de `d`), `mood` 1 → 0 en 0,3 s sur `ouvre` (19,09) ; rien d'autre ne bouge. | |

**Couture de sortie** : à 19,82, pose `VIEW.edge`, état `STAGED` (+ `stops` 0,7, `mood` 0, `fs` 80).

## acte2.js

**02 · AUTOPSIE — `tobench` 19,82 → `tozero` 42,30.** Commence par `cut(t.tobench, SET.BENCH, benchPose(VIEW.edge), { ...BENCHED })` : la même image, seul ce qui entourait la porte disparaît. `alt` reste 11 300 jusqu'à « Au sol ».

| repère (s) | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 19,82 → 20,40 | « …on l'ouvre. » | La coupe ; **sur « on » (19,96) `explode` 0 → 1** (≈ 1,2 s, `power2.out`) ; la caméra recule (par rapport) vers `VIEW.exploded`. `impact` déjà posé à 19,92. | la porte ≈ 70 % → l'éclaté ≈ 60 % |
| 21,43 → 22,00 | « Côté cabine : » | L'éclaté, face cabine ; tout lisible, la clé dessus. | ≈ 60 % |
| 22,51 → 24,32 | « une poignée, des crochets de verrouillage. » | UN cadre pour les deux (0,8 s d'écart) : poignée + arbre. `named` 1 sur `poignee` (22,64) : la poignée se lève d'un quart et retombe ; `named` 2 sur `crochets` (23,44) : l'arbre tourne, les crochets se retirent et reprennent leurs goupilles. `co.add` « Poignée », « Crochets de verrouillage ». | poignée + arbre ≈ 55 % |
| 24,76 → 26,40 | « Mais la porte est plus grande que son *cadre*. » | `explode` 1 → 0 : le panneau revient se poser sur son cadre, la caméra tourne vers `VIEW.lapB` (presque de chant) ; sur `cadre` (26,16) `named` 3 : le contour du cadre en encre, le débord en veille ; `co.add` « Cadre ». | panneau + cadre ≈ 65 % |
| 26,76 → 29,04 | « Elle s'appuie, de l'intérieur… sur des +butées+. » | De `lapB` vers `VIEW.stopB` (gros plan, `dof`) en suivant le bord : sur `butees` (28,80) `named` 4, `stops` 1 — une butée de porte sur une butée de cadre ; `chip-butees` de 28,80 à 29,60 ; `co.add` « Butées ». | une paire ≈ 40 % |
| 29,79 → 31,80 | « Au sol, l'air pousse pareil des deux côtés. » | Coupe à `repos` − 0,12 (29,67) vers `VIEW.section` : `section` 1, `air` 1, **`alt` 0** (l'en-tête : 0 m, ≈ 0 t) — autant de flèches encre des deux côtés. Cabine à gauche, nuit à droite. | la coupe ≈ 50 % |
| 32,16 → 34,52 | « L'avion monte : dehors, l'air s'amincit. » | `alt` 0 → 11 300 de `monte` (32,52) à `trois` (35,96), `sine.inOut` : dehors les flèches se raréfient (`amincit` 34,00). La caméra se rapproche lentement. | ≈ 55 % |
| 34,88 → 36,60 | « Dedans, on en garde trois fois plus. » | Dedans, les flèches restent serrées, le surplus passe veille ; « Sur la porte » monte à ≈ 8 t veille (sans l'écrire : c'est `alt`). | ≈ 60 % |
| 37,07 → 38,44 | « Et ton voisin force *toujours*. » | Coupe à `encore` − 0,12 (36,95) dans l'avion : `VIEW.handle`, `STAGED`, `air` 1, `pull` 1, `tug` 0,3 — ses mains de verre sur la poignée, les flèches veille derrière la porte. `D.punch` sur `toujours` (38,04). | poignée + mains ≈ 45 % |
| 38,97 → 41,96 | « +Abonne-toi+ : on rejoue la scène… et on regarde la *porte*. » | Coupe à `toseuil` (38,85) vers `VIEW.aisle` : la caméra file DÉJÀ dans l'allée vers la porte 1L et le voisin (≤ 40 cm/s), `followCall` de 38,97 à min(seuil$ + 0,15, tozero − 0,1). Pas de panneau, pas d'arrêt. | porte au fond ≈ 15 % → 25 % |

**Couture** : entrée `benchPose(VIEW.edge)` + `BENCHED` ; sortie à 42,30 dans l'allée, `STAGED`, `air` 1. Si la section dépasse ton temps, coupe en deux fichiers (`acte2.js` jusqu'à 29,67, `acte2b.js` du repos au seuil) : `main.js` les importe tous deux — écris-le dans « À changer ailleurs ».

## acte3.js

**03 · RÉPONSE — `tozero` 42,30 → `toverdict` 56,82.** En coupes, un plan par souffle. `mood` 1 jusqu'à « Les butées encaissent » (54,16), puis 0. Le relâchement tombe là.

| repère (s) | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 42,30 → 43,64 | « Ton voisin force la poignée. » | Coupe à `tozero` : `VIEW.handle` (gros plan), `STAGED`, `pull` 1, `handle` à-coups ≤ 0,25, `tug` 0,5 ; l'en-tête bat (`#hud-clock` scale, comme le modèle). | poignée + mains ≈ 50 % |
| 43,92 → 45,32 | « Et mettons que tous les verrous *lâchent*. » | Coupe à `verrous` − 0,5 (43,80 : dans le souffle) vers un cadre de l'arbre et des crochets depuis la cabine (pose du journal de `model.js`) ; `chip-hypothese` de 43,80 à 46,60 ; sur `lachent` (45,08) `hooks` 0 → 1 en 0,4 s, un à un, signal (les trois `click` à 45,34–45,50). `D.punch` sur `lâchent`. | arbre + crochets ≈ 55 % |
| 45,64 → 46,92 | « Plus rien ne retient la porte. » | Recul (par rapport) jusqu'à la porte entière depuis la cabine, crochets retirés, la nuit derrière le verre de la coque ; le voisin tire toujours. | porte ≈ 50 % |
| 47,50 → 48,24 | « Elle ne bouge pas. » | Coupe à `reponse` − 0,12 : la porte de trois quarts, parfaitement immobile, le voisin arc-bouté (`VIEW.doorIn`). | porte ≈ 45 % |
| 48,72 → 50,40 | « L'air de ta cabine pousse vers la nuit. » | Coupe à `airCabine` − 0,12 vers `VIEW.wall` : `air` 1, `wall` 0 → 0,6 — les flèches de toute la cabine filent vers la porte. | la cabine ≈ 90 %, la porte au fond |
| 50,88 → 52,08 | « Il la plaque sur ses butées : » | Coupe dans le souffle à `slam` (50,70) sur le bord de la porte depuis la cabine (`VIEW.edge` plus large) : `wall` 1, à `trigger` (51,15) le mur frappe, `stops` 1, la porte s'enfonce d'un poil (`load`, calculé), les butées frémissent. | le bord + 3 butées ≈ 60 % |
| 52,43 → 53,28 | « environ huit *tonnes*. » | Même cadre ; `#hud-count` bat sur `tonnes` (53,04 : scale, comme `#hud-clock`) — « ≈ 8 t » veille. | |
| 53,68 → 54,56 | « Les butées encaissent. » | Coupe à `reponse:Les` − 0,12 en gros plan d'une paire de butées dans l'avion (`dof`) : allumées, chargées ; `chip-charge` de 53,56 à 56,40 ; `mood` 1 → 0 sur `encaissent`. | une paire ≈ 40 % |
| 54,92 → 56,24 | « La poignée, presque +rien+. » | Recul large (`VIEW.wall`) : la flèche signal du voisin (`tug` 1) minuscule contre le mur de flèches veille ; la porte ne bouge pas. `D.punch` sur `rien` (56,08). | la cabine ; la flèche ≈ 3 %, le mur ≈ 70 % |

**Couture** : entrée `STAGED` complet ; sortie à 56,82, rien ne déborde (`chip-charge` sorti à 56,40).

## fin.js

**Chute, ce qui est dû, like, prochain dossier, boucle — `toverdict` 56,82 → 86,13.**

| repère (s) | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 56,82 → 63,26 | « Voilà son secret : là-haut, ce n'est *pas* un verrou qui ferme ta porte. C'est +l'air+. Plus tu montes… plus elle est fermée. » | Coupe : dehors, `VIEW.doorOut` (porte 1L de trois quarts), `cabin` 1, `shell` 1, `air` 1 ; l'avion grimpe : `pitch` 0 → 6, **`alt` 4 000 → 11 300** de `secret` à `fermee` (les flèches du dedans s'épaississent en veille, « Sur la porte » monte, la porte s'enfonce sur ses butées). `retitle` : montré à chute + 0,1, barré sur `verdict` (58,86), « L'air » à `cestAir` − 0,05, sorti à `tocta` − 0,42 ; `D.verdict(verdict)`. | la porte ≈ 35 %, le flanc autour |
| 64,01 → 70,46 | « Et la Corée ? L'avion se posait. À environ deux cents mètres, presque plus rien ne plaquait la porte : le levier a suffi. » | Coupe à `tocta` : `VIEW.approach`, `alt` 1 500 → 200 de `posait` à `metres`, `gear` 1, `runway` 1 : les flèches veille s'éteignent d'elles-mêmes (calcul), l'en-tête descend à 200 m, ≈ 0 t encre. Coupe à `presque` − 0,12 (67,54) dans la cabine : le passager assis près de la porte (`seated` 1 → 2 sur `levier`), `handle` 0 → 1, `hooks` 1, sur `suffi` (70,18) `open` 0 → 0,4 vers l'extérieur, signal ; `chip-coree` de 67,54 à 70,8. | l'avion ≈ 60 % ; puis porte + passager ≈ 55 % |
| 70,93 → 74,38 | « En commentaire : la place près de la porte… tu la prends, ou *jamais* ? » | Coupe à `commentaire` − 0,12 : en croisière (`STAGED`), la place près de la porte (`VIEW.you`, `you` 0 : le siège vide), la porte plaquée, `air` 1. `duelCall` from `commentaire` − 0,5, `aAt` `prends` (73,62), `bAt` `jamais` (74,14), `to` like − 0,3, `toneA` veille, `toneB` signal. | siège + porte ≈ 50 % |
| 75,16 → 78,04 | « +Like+ : pour quelqu'un qui n'ose pas s'asseoir près de cette *porte*. » | Coupe à `like` − 0,12 : toi assis (`you` 1), ta main sur l'accoudoir qui se desserre (`grip` 1 → 0 de `pour` à `porte`), la porte plaquée, flèches denses. `likeCall` de `like` à `like$` + 0,12. | toi + porte ≈ 50 % |
| 78,57 → 83,08 | « Prochain dossier : la boîte noire. Elle a attendu presque deux ans au fond de l'*Atlantique*. » | Coupe à `abo` − 0,12 : `VIEW.tail`, `voisin` 0 ; `recorder` 0 → 1 sur `noire` (79,88), 1 → 2 de `attendu` (80,89) à `fond` + 0,5 — la caméra le suit dans le noir jusqu'à son halo. `nextFile` (showAt `prochain` − 0,15, factAt + 0,7, hideAt `toloop` − 0,38). Plus rien de la porte après ça. | l'enregistreur ≈ 10 % puis seul sur son halo |
| 83,64 → 86,13 | « Deux ans… depuis le jour où… » | Coupe à `toloop` dans la cabine, un peu plus loin que `POSE0`, état `FIRST` (`STAGED` + `alt`, `pull`, `stops`, `shell` de `FIRST`) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` : la dernière image est la première. | |

## La première image — quatre candidates

À tirer par l'agent de `vol.js` sur le vrai décor (planche de quatre, `at` 0,04, puis 0,3 et 0,7 s pour la retenue), notées sur les six points de `docs/recette-agents.md` (1 événement en cours · 2 perspective basse · 3 menace derrière le sujet · 4 forme reconnue, ≥ 40 % de la largeur · 5 système là, petit mais lisible · 6 ça bouge par le sujet). Celui qui orchestre choisit et colle `POSE0` dans `world.js`. Sur bouchon (planche `.cache/planches/033/architecte/p2.jpg`) : la face cabine de la porte est à contre-jour — **la candidate n'est jugeable qu'une fois la porte éclairée par `model.js`**.

- **(a) La contre-plongée à la porte** (`POSE0` provisoire, le `voir` du script) — au ras du plancher, de trois quarts arrière, la porte pleine, son hublot, le voisin arc-bouté. 1 ✓ (il tire) · 2 ✓ · 3 ~ (la nuit derrière le verre de la coque, de part et d'autre de la porte) · 4 ✓ si le hublot se lit · 5 ✓ (le liseré veille des butées) · 6 ✓ (à-coups). **5,5/6.** Risque : le voisin de verre au premier plan brouille la porte.
  `{ "at": 0.04, "label": "a contre-plongee", "pose": { "tx": -2410, "ty": -6, "tz": 240, "d": 380, "az": 140, "el": -18, "fov": 46, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "shell": 0.35, "pull": 1, "stops": 0.25 } }`
- **(b) Dehors, au-dessus du vide** — hors de l'avion, au-dessus de la porte, regard plongeant : la face extérieure pleine (éclairée par la clé), le flanc de verre, et dix kilomètres de nuit dessous (nuages, mer). 1 ~ (rien ne bouge sauf l'air) · 2 ✗ (plongée) · 3 ✓ (le vide) · 4 ✓ · 5 ✓ · 6 ✗ (le voisin caché par la porte). **3,5/6.**
  `{ "at": 0.04, "label": "b dehors le vide", "pose": { "tx": -2420, "ty": 0, "tz": 290, "d": 520, "az": -20, "el": 25, "fov": 48, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "shell": 1, "pull": 1, "stops": 0.25 } }`
- **(c) Au ras du hublot de la porte** — de trois quarts avant, tout près de la porte, la caméra au niveau de la poignée : les mains de verre qui tirent au premier plan, la porte et son hublot (la nuit dedans), l'allée qui file derrière le voisin. 1 ✓ · 2 ✓ · 3 ~ (la nuit dans le hublot) · 4 ✓ · 5 ✓ · 6 ✓. **5,5/6.** Risque : `az` 220 (cabine, côté avant) est à contre-jour.
  `{ "at": 0.04, "label": "c au ras du hublot", "pose": { "tx": -2425, "ty": 10, "tz": 250, "d": 260, "az": -150, "el": -8, "fov": 44, "shift": 110, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "shell": 0.35, "pull": 1, "stops": 0.25 } }`
- **(d) Les mains sur la poignée** — gros plan bas de trois quarts : les deux mains de verre crispées sur la poignée pleine, l'avant-bras tendu, la doublure, le liseré veille des butées au bord. 1 ✓ · 2 ✓ · 3 ✗ · 4 ~ (une poignée se reconnaît moins qu'une porte) · 5 ✓ · 6 ✓. **4/6.** Risque : « jamais les mains seules ».
  `{ "at": 0.04, "label": "d mains et poignee", "pose": { "tx": -2412, "ty": -26, "tz": 250, "d": 190, "az": 135, "el": -6, "fov": 36, "shift": 100, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "shell": 0.35, "pull": 1, "stops": 0.25 } }`

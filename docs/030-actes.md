# 030 · Prise de terre — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **83,3 s**). Tout instant se lit dans le script — `D.times({ nom: "repère" })` avec un repère d'`episode.json` (`cues` : **128 repères, vérifiés un par un mot à mot** sur la table de la vraie voix ; image et son lisent les mêmes) ou `"beat:mot"` — **jamais un nombre de secondes en dur** ; une durée s'écrit comme un écart entre deux repères. Les secondes ci-dessous ne sont là que pour te repérer (`npm run script -- 030` donne la table). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des squelettes, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js`. Forme : `episodes/024-bloc-operatoire/src/acte*.js` (le plus récent) ; fin : `kit/template/src/fin.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `duelCall`). Les poses qui cadrent seront dans les journaux des décors (`docs/journal/030-model.md`, `030-buanderie.md`) et de l'habillage : pars d'elles ; `VIEW` n'est qu'un point de départ, réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

Chez toi, le soir, dans la buanderie : la machine à laver essore. Dedans, la gaine d'un **fil de phase** est usée et **touche la carcasse** : un défaut d'isolement. La prise où elle est branchée est un **vieux socle à deux trous** : aucune terre. **Tout le métal de la machine est à 230 volts** par rapport au sol, et **rien ne coupe** : aucun courant ne circule, le différentiel 30 mA ne voit rien. Toi, **pieds nus, mouillé**, tu tends la main vers le capot. **Sans le fil** : ta main touche, le courant passe par toi jusqu'au sol, le différentiel coupe — **après toi**. **On rejoue avec le fil** (la chaîne entière : conducteur de protection, broche de la prise, borne principale de terre, conducteur de terre, barrette de mesure, boucle de cuivre nu autour des fondations) : au défaut, le courant file par la terre, le tableau voit l'écart et coupe — **avant ta main**. Sources : Promotelec, Legrand, Chauvin Arnoux, INRS, ONSE (Batiweb) ; NF C 15-100 **non lue** (`docs/faits/030-prise-de-terre.md`).

- **Le seul chiffre à l'écran est « 230 volts »**, celui de la voix (l'en-tête). Ni Ω, ni mA, ni « 100 Ω », ni temps de coupure (« 0,2 s », « 30 ms » : non sourcés), ni « 64 % ». Pas de « norme ».
- **Le hublot n'est jamais sous tension** (verre et plastique) : ce qui est signal, c'est la tôle et le capot ; ta main va au **capot**.
- **Sans terre, aucun courant tant que personne ne touche** : pas de têtes, pas d'anneaux avant « touche ». Le différentiel coupe **après** toi — jamais « rien ne coupe ».
- **Avec la terre, le courant ne disparaît pas** : il part dans le sol (des anneaux qui s'éloignent). La boucle est **autour** des fondations, jamais dessous.
- Le vert-jaune est le **conducteur de protection** (jamais « conducteur de terre » : celui-là va de la borne à la boucle).
- Le « tu » : toi, chez toi (un scénario, `sources`). Personne n'est blessé à l'image : le courant passe dans un corps de verre, des têtes de lumière, aucune brûlure, aucune chute.

## L'en-tête : l'heure, et la carcasse

- **La grande horloge** (`main.js`, rien à faire dans les actes) : **21:47:12** à la première image, une seconde par seconde pendant l'acte 1 ; **elle se fige** sur l'établi (de `tobench` à `tozero` : l'autopsie arrête le temps) ; à `tozero` (« on rejoue la scène ») elle relit l'heure d'une seconde avant ta main (`main` − 1) et repart ; **à `trigger` (« On rejoue, avec le fil ») elle revient en arrière à la même seconde** — le film rejoue, l'horloge le dit (un souffle de rembobinage, voir le son). Encre ; **signal** tant que le courant passe par toi (`body` > 0,3) ; **veille** de `coupe2` (« Il coupe… avant ta main ») à `toloop`. Après `toloop`, elle lit les secondes juste avant la première image : la dernière image redit 21:47:12.
- **« Carcasse »** (lu de l'état, rien à faire) : **230 VOLTS** (signal) tant que `live` > 0,5 sans chemin ; **VERS LA TERRE** (veille) tant que `live` > 0,5 et que le courant de défaut prend la terre (`leak` > 0,5, `chain` > 0,5 — sans chiffre : la tension est alors plus basse et pas sourcée) ; **0 VOLT** (encre) dès que `live` ≤ 0,5. Les actes le font changer **sur les mots** par `live` : à la coupe 2 de l'acte 1, `live` 0,3 (« 0 VOLT » : avant que le fil touche) puis 1 sur « métal » — l'en-tête dit « 230 VOLTS » quand la voix le dit.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.) Il rend la main à l'instant où le suivant coupe.
- **`STAGED` est la maison du film** : la machine qui essore, la carcasse sous tension, le défaut, **pas de terre au-delà de la fiche** (`chain` 0, `pin` 0), ta main en chemin. Le monde « idéal » (`chain` 1, `pin` 1) ne se pose que là où le plan le dit (repos, la reprise de l'acte 3, la chute).
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10 à 0,15 s avant). Rien d'un plan ne déborde sur le suivant ; une étiquette a fini de sortir avant la coupe.
- **Chaque coupe est un raccord** (forme, objet, mouvement, lumière) : écrit dans les tables.
- **Deux décors** : `SET.SCENE` (la buanderie, `buanderie.js`, et sous elle les fondations : `under`), `SET.BENCH` (l'établi). Le système (`model.js`) est **posé deux fois** (en place / sur l'établi) ; les raccords : `benchCut` avec `origin` = `PLACE.cosse − BENCH.cosse` à « on l'ouvre » ; à « Autour des fondations », la même idée à l'envers (pose en place = pose sur l'établi + `PLACE.join − BENCH.join`, `moved` de `kit/lib/direct.js`).
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600 ni sous les boutons (x > 905 de y 880 à 1760). **La carcasse signal est la chose la plus claire de la buanderie** : qu'elle ne passe jamais derrière l'en-tête (contraste). Le vert-jaune du mur court haut (y 214) : dans un plan large il touche l'en-tête — `shift` en conséquence. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; un recul ou une plongée par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin. La caméra traverse le verre (murs, carcasse, dalle, semelle) ; elle ne traverse ni le tambour, ni le capot, ni toi.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 25 la prise de près, ≈ 40 le défaut, ≈ 50 le tableau, ≈ 90 tes pieds, ton bras, ≈ 130 la machine, ≈ 140 la boucle sous le sol, ≈ 250 toi entier, ≈ 450 le mur, ≈ 700 la coupe entière, ≈ 1200 de loin ; `SIZE` (36) sur l'établi).
- **Couleurs** : signal = la menace (la carcasse sous tension, le défaut, le courant par toi) ; veille = le système vivant (le vert-jaune — veille rayé d'encre, jamais jaune —, le différentiel qui voit et coupe, le courant qui part à la terre). `mood` 1 dans la buanderie tant que la carcasse est sous tension, 0 sur l'établi ; **le relâchement tombe sur « avant ta main »** (`mood` 1 → 0 là, pas avant). Jamais à mi-chemin plus d'une demi-seconde.
- Toi : un corps de verre, **jamais en très gros plan, jamais la main seule** (le bras et l'épaule dans le cadre).
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **26 images lues au plus.** Journal : `docs/journal/030-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire de la consigne, jamais dans le dépôt, JAMAIS dans `renders/`.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-toi` (Toi / Pieds nus · mouillé, encre) · `chip-diff` (Ton différentiel / Il attend, veille) · `chip-nulle` (Ce fil / N'arrive nulle part, signal) · `#rail-seuil` · `chip-partoi` (Sans le fil / Le courant passe par toi, signal) · `chip-terre` (Avec le fil / Le courant part à la terre, veille) · `chip-avant` (Le différentiel / Coupe avant ta main, veille) · `#retitle` (La terre : « Te protège » barré → « Donne un chemin ») · `chip-anomalie` (Logements anciens / Anomalie la plus fréquente, signal) · `#duel` (Chez toi ? « Avec broche » ou « Sans » · À toi, en commentaire) · `#net` · `#next` (Prochain dossier · 031 · Classé — « Un autre système qui veille sur toi… sans que tu le saches. » — S'abonner pour l'ouvrir ; **aucun fait** : le 031 n'est pas choisi) · les `.rail`. `#cta-field` existe mais ne sert pas (le commentaire se joue en duel). Les pièces de l'éclaté se nomment avec `co.add`, sans chiffre : « La masse », « Conducteur de protection », « Broche de terre », « Borne principale de terre », « Conducteur de terre », « Prise de terre ». Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). **Pas plus d'une étiquette à la fois** ; une étiquette qui redit la voix mot pour mot ne sert que si l'image ne suffit pas — dans le doute, rien.

## Le son (à placer par celui qui orchestre dans `episode.json` → `sfx`)

**Jamais un son sur un mot** : les repères `s_…` sont posés dans les souffles, juste après le mot qu'ils ponctuent. Ce que la grille demande (`docs/recette-actes.md`) :

| repère | instant | le son |
| --- | --- | --- |
| (déjà là) 0,02 · 0,03 · 0,14 | avant le premier mot | `hit`, `impact`, `swish` |
| `s_saute` | 3,24 | `hit` (la porte vers le tableau) |
| `s_partoi` | 7,12 | `click` léger (le chemin en pointillé par toi) |
| `s_prises` | 9,90 | `hit` (la coupe vers le défaut) |
| `s_carcasse` | 12,14 | `crack` court (le fil touche la tôle) |
| `s_volts` | 14,06 | `impact` + `crack` (tout le métal sous tension) |
| `s_mouille` | 15,59 | `swish` (la caméra remonte ton bras) |
| `s_capot` → `alors` | 17,28 → 18,06 | `suck` (déjà là, il s'arrête net avant « Alors… ») puis `hush` (déjà là) |
| `s_c1` … `s_c5` | 20,82 · 21,94 · 23,48 · 26,12 · 27,76 | `click` : chaque pièce nommée de l'éclaté |
| `s_pdt` | 31,84 | `hit` doux (la boucle) |
| `s_nulle` | 37,00 | `hit` (« n'arrive nulle part ») |
| `s_zcapot` | 42,40 | `impact` + `crack` (ta main touche) |
| `s_zsol` | 44,84 | `hit` |
| `s_coupe1` | 46,52 | `click` sec (la manette tombe) |
| `s_apres` | 47,32 | **`rewind`** court (« On rejoue ») |
| `s_rterre` | 50,68 | `swish` (le courant descend) |
| `s_coupe2` | 52,68 | `click` sec + `hit` (il coupe) |
| `s_seule` | 56,72 | `hit` (le titre barré) |
| `s_duelA`, `s_duelB` | 71,76 · 72,30 | `click` (chaque réponse s'allume) |

**À revoir dans les `sfx` déjà écrits** : `impact` à `explode` tombe **sur** « on » (18,84) — à avancer sur `tobench` (18,70) ou à retirer (le `hush` va jusqu'à `explode`) ; `impact` à `trigger` (47,79) est sur « On rejoue » (47,68–48,20) — à remplacer par le `rewind` à `s_apres` ; `blip` à `verdict` tombe sur « chemin » (57,58) — à poser à `s_chemin` (58,32) ; `rewind` à `rewind` (82,08) tombe sur « jour » — à avancer à `toloop` (80,83, avant « Comme »), court. `npm run qa -- 030` les listera.

## La première image — les quatre candidates

Décrites et notées dans `docs/030-decors.md` (« La première image ») : **(a) au ras du sol mouillé** (5,5 / 6, `POSE0` provisoire), (b) par-dessus ton épaule, (c) le hublot (sort : il laisse croire que le hublot est sous tension), (d) au pied, de côté. La planche est tirée par l'agent de `buanderie.js` sur le vrai décor ; celui qui orchestre choisit et colle `POSE0` (et `FIRST` si elle demande un réglage : `reach`) dans `world.js` AVANT les actes.

## 01 · MENACE — `acte1.js` (0 → `tobench` 18,70)

L'acte part de `POSE0` et de `FIRST` ; **un mouvement, deux coupes** (vers le tableau, puis dans la machine). **Ça bouge dès l'image 1 par le sujet** : le tambour, le linge, la machine qui tremble, l'eau qui frémit ; la caméra pousse en plus (une rampe `glide`, si la machine reste dans le cadre à 0,3 et 0,7 s).

| repère | la voix | l'image |
| --- | --- | --- |
| 0 → `saute` 2,95 | « Ta machine à laver est sous *tension*. Et rien n'a sauté. » | `POSE0`, `FIRST` : la machine en essorage, sa carcasse signal, tes pieds nus dans la flaque à droite, ta main qui entre (`reach` 0,3). La caméra pousse vers la machine, au ras du carrelage (par rapport). **`D.punch(choc, 0,06)`** sur « tension » (1,24). Sur « rien n'a sauté » (2,36) elle s'élève un peu : à gauche, au ras du sol, le cordon et son vert-jaune pâle qui filent vers le mur |
| `topromesse` 3,60 → `marche` 4,68 | « Ton différentiel marche. » | **coupe 1** (raccord : le vert-jaune qui monte vers le mur → le rail vertical du coffret) : le tableau de près (`VIEW.tableau`), le différentiel, sa manette levée ; sur « marche » (4,36) `ddr` 0 → 0,5 : il est vivant, veille |
| `attend` 5,52 → `partoi` 7,08 | « Mais il attend… que le courant passe par toi. » | la caméra quitte le tableau et **descend le long du mur** (la phase et le neutre dedans, encre) jusqu'à te découvrir entier près de la machine (vers `VIEW.you`) ; `chip-diff` de `attend` à `souvent` − 0,25 ; sur « toi » (6,92) `body` 0 → 0,25 : **le chemin qu'il attend** se dessine en pointillé signal pâle, de ta main tendue à tes pieds — aucune tête ne court. `D.punch(partoi, 0,05)` |
| `souvent` 7,78 → `prises` 9,80 | « Souvent, ce qui manque se voit sur tes prises. » | `body` → 0 ; la caméra glisse le long du cordon jusqu'à la prise, derrière la machine à gauche (vers `VIEW.socket`) : **un socle à deux trous**, la fiche, le vert-jaune qui s'y arrête. **Aucune étiquette** (la réponse — « sans broche, pas de terre » — n'arrive qu'à la fin : c'est le C) |
| `toscene` 10,48 → `carcasse` 12,10 | « Un fil de phase touche la carcasse : » | **coupe 2** (raccord : du cordon qui entre dans la machine au fil qui monte dans la carcasse) : dans la machine (`VIEW.fault`), `live` 0,3 (l'en-tête « 0 VOLT »), `fault` 0 ; le fil de phase le long du panneau ; sur « touche » (11,30) `fault` 0 → 1 (0,25 s, `power2.out`) : la lumière, là où il touche |
| `metal` 12,66 → `volts` 14,02 | « tout le métal est à 230 *volts*. » | **recul sans lâcher le défaut** (même point visé, cadrage au `shift`, puis `reaim`) jusqu'à la machine entière (vers `VIEW.machine`) ; sur « métal » `live` 0,3 → 1 en ≈ 1,2 s : **l'onde part du défaut et gagne toute la tôle**, le capot avec — le hublot reste encre ; l'en-tête passe à « 230 VOLTS ». `D.punch(volts, 0,06)` |
| `pieds` 14,46 → `mouille` 15,54 | « Pieds nus, mouillé, » | la caméra descend vers tes pieds dans la flaque (vers `VIEW.feet`) : l'eau frémit avec l'essorage, la carcasse signal se mire dedans |
| `main` 16,10 → `capot` 17,22 → `tobench` 18,70 | « ta main se tend vers le +capot+. » · « Alors… » | la caméra remonte ton bras (vers `VIEW.reach`) ; `reach` 0,3 → 1 de « main » à « capot » : la main s'arrête **à 3 cm au-dessus du capot**. Pendant « Alors… » (18,06) tout tient ; la caméra pousse lentement vers `VIEW.system` (la cosse, dans la carcasse, sous ta main) — c'est le plan d'où l'acte 2 coupe |

## 02 · AUTOPSIE — `acte2.js` (`tobench` 18,70 → `tozero` 40,47)

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` 18,70 · `explode` 18,84 | « …on l'ouvre. » | **`benchCut`** sur la cosse (`origin` = `PLACE.cosse − BENCH.cosse`, `{ ...BENCHED, live: 1, fault: 1 }` : le bout de carcasse garde sa lumière de défaut) — même pièce, même place à l'image, seul ce qui l'entourait change. Sur « on » `explode` 0 → 1 (≈ 1,6 s) : **la chaîne se déroule vers le bas** sous le bout de carcasse ; la caméra recule (par rapport) jusqu'à `VIEW.exploded`. Seule dans son plan, la phrase signature |
| `carc2` 20,40 | « Sur la carcasse, » | près de la cosse (`VIEW.bStub`) : `litCosse` 1 ; `co.add` « La masse » sur la vis |
| `vj` 21,44 → `protection` 23,44 | « un fil +vert-jaune+ : le conducteur de protection. » | sur « vert-jaune » `pe` 0,35 → 1 (les bandes veille s'allument, rayées d'encre) ; `co.add` « Conducteur de protection » sur « conducteur » (22,40) ; la caméra suit le fil vers le bas |
| `broche` 24,24 → `prise` 25,04 | « Par la broche de ta prise, » | `VIEW.bPlug` : **le geste** — `plug` 0 → 1 sur « broche » : la broche de terre entre dans l'alvéole de la fiche ; `litPrise` ; `co.add` « Broche de terre » |
| `tableau` 25,76 | « il rejoint le tableau… » | `run` jusqu'à la borne ; `VIEW.bTab` ; `litBorne` ; `co.add` « Borne principale de terre » (le différentiel est à côté, on ne le nomme pas ici) |
| `terre` 26,72 → `maison` 27,68 | « puis la *terre*, sous la maison. » | la caméra descend avec la tête (`run` → 1) : la barrette, le conducteur de terre, la boucle (`VIEW.bEarth`) ; `litTerre` puis `litBoucle` ; une étiquette à la fois, rien qui déborde sur la coupe |
| `torepos` 28,18 → `pdt` 31,80 | « Autour des fondations, un câble de cuivre nu : la +prise de terre+. » | **coupe** (raccord : le tour de boucle de l'établi → la même boucle, à la même place, en place) sous le sol de la buanderie (`VIEW.under`) : `{ ...STAGED, under: 1, chain: 1, pin: 1, live: 0, fault: 0, mood: 0 }` — **la maison idéale** ; la semelle de verre, la boucle au fond de la fouille ; la caméra **glisse le long de la boucle et passe l'angle** (« autour ») ; `co.add` « Prise de terre » sur « prise » (31,08) |
| `rien2` 32,76 → `bien` 33,96 | « Elle ne fait rien… tant que tout va bien. » | la caméra remonte à travers la dalle : au-dessus, la machine qui essore, normale (encre), toi à côté ; la chaîne entière, immobile (`pe` 0,35, rien ne court) |
| `mais` 34,50 → `part` 36,92 | « Mais ici, ce fil… n'arrive *nulle part*. » | sur « ici » (34,72) : `live` 1, `fault` 1, `mood` 1 — **notre maison** ; la caméra va à la prise (vers `VIEW.socket`, plus large) ; sur « fil… » (35,40) `chain` 1 → 0 (la chaîne se retire de la boucle vers la prise) et `pin` 1 → 0 (le socle redevient à deux trous) ; `run` 0 → 1 : la tête part de la cosse le long du cordon **et s'éteint sur la fiche** à « nulle part » (36,40) ; `chip-nulle` de `nulle` à `seuil` + 0,4 |
| `seuil` 37,45 → `tozero` 40,47 | « +Abonne-toi+ : on rejoue la scène… avec ce *fil*. » | **`followCall`** ; le film ne s'arrête pas : la caméra est déjà en route de la prise vers ta main au-dessus du capot (`VIEW.reach`) ; le nom du compte s'allume, les chevrons. Pas de panneau |

## 03 · RÉPONSE — `acte3.js` (`tozero` 40,47 → `toverdict` 54,10)

En coupes, un plan par souffle. **Deux fois la même scène** : sans le fil, puis avec. Le relâchement sur « avant ta main ».

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` 40,47 → `zcapot` 42,36 | « Sans ce fil, ta main touche le capot. » | **coupe** (`{ ...STAGED, reach: 1 }`, `VIEW.reach`) : ta main au-dessus du capot signal ; sur « touche » (41,72) `touch` 0 → 1 en 0,15 s |
| `zcourant` 42,84 → `zsol` 44,76 | « Le courant passe par *toi*… jusqu'au sol. » | **coupe** sur toi entier (`VIEW.you`) : `body` 0,3 → 1 — les têtes signal de ta main par ton bras, ton tronc (sur « toi », 43,56), tes jambes ; **coupe** sur tes pieds (`VIEW.feet`) vers « sol » (44,52) : les anneaux partent dans la flaque ; `chip-partoi` ; l'horloge signal |
| `todiff` 45,29 → `coupe1` 46,48 | « Ton différentiel coupe. » | **coupe** sur le tableau (`VIEW.tableau`) : `ddr` 1 ; sur « coupe » (46,16) `trip` 0 → 1 en 0,12 s — la manette tombe |
| `apres` 46,80 → 47,28 | « *Après* toi. » | **coupe** sur toi (`VIEW.you`) : `body` 1 → 0 (les têtes s'arrêtent dans ton corps), `live` → 0 (l'en-tête « 0 VOLT »), `spin` décroît. `D.punch(apres, 0,05)` au moins 0,15 s après la coupe |
| `trigger` 47,79 → `avecfil` 48,96 | « On rejoue, avec le fil. » | **le rembobinage** (le son à `s_apres` ; l'horloge revient en arrière) ; **coupe** à `trigger` sur la prise et le mur (vers `VIEW.wall`, resserré) : `{ ...STAGED, chain: 0, pin: 1, live: 0, fault: 0, reach: 0.6, trip: 0, ddr: 0 }` puis `chain` 0 → 1 de « rejoue » à « fil » (la chaîne pousse de la prise vers le tableau et la terre) ; `pe` 1 sur « fil » (48,72) |
| `file` 49,92 → `rterre` 50,64 | « Le courant file dans la terre. » | `fault` 1, `live` 1 (0,1 s), `leak` 0 → 1 : les têtes veille descendent le vert-jaune, le mur, la borne, le conducteur de terre — **coupe** sous le sol (`VIEW.under`, `under` 1) vers « terre » (50,40) : la boucle, les anneaux qui s'éloignent dans le sol ; `chip-terre` ; l'en-tête « VERS LA TERRE » |
| `rtableau` 51,12 → `voit` 51,76 | « Le tableau le voit. » | **coupe** sur le tableau (`VIEW.tableau`) : `ddr` 0 → 1 sur « voit » |
| `coupe2` 52,32 → `rmain` 53,52 | « Il coupe… +avant+ ta main. » | `trip` 0 → 1 sur « coupe » (0,12 s), `live` → 0, `leak` → 0 ; **coupe** sur ta main (`VIEW.reach`) vers « avant » (52,96) : ta main **toujours au-dessus du capot** (`reach` 1, `touch` 0), la tôle redevenue encre, le tambour qui ralentit ; **`mood` 1 → 0 sur « avant »** : le relâchement. `D.punch(avant, 0,05)` ; `chip-avant` seulement si l'image ne suffit pas |

## La fin — `fin.js` (`toverdict` 54,10 → 83,33)

Chute → ce qui est dû et le commentaire → like → prochain dossier → boucle. Plus rien du sujet ne revient après l'annonce ; la voix n'y redemande pas l'abonnement.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` 54,10 → `tocta` 60,79 | « Voilà le secret : la terre ne te *protège* pas seule. Elle donne un chemin au courant… pour que ton tableau coupe +avant+ toi. » | **coupe** sur toute la chaîne en coupe (`VIEW.section`, `{ ...STAGED, chain: 1, pin: 1, under: 1, live: 0, fault: 0, trip: 1, spin: 0, mood: 0 }`) : la machine, le mur, le tableau, la dalle, la boucle ; la caméra glisse le long de la chaîne. `retitle` (show `chute` + 0,1, strike `seule` 56,42, swap `chemin` − 0,05, hide `tocta` − 0,42) ; **sur « chemin »** `run` 0 → 1 — le chemin s'allume d'un bout à l'autre ; `D.verdict(chemin)` ; sur « tableau coupe » (59,0) `ddr` pulse |
| `tocta` 60,79 → `toujours` 65,10 | « Et tes prises ? Sans broche, pas de terre. Avec broche… pas toujours. » | **coupe** sur l'établi, la prise de près (`VIEW.bPlug`, `{ ...BENCHED, explode: 1 }`) : sur « Sans broche » (61,96) `pin` 0 et `chain` 0 (ce qui est au-delà, fantôme) ; sur « Avec broche » (63,54) `pin` 1 ; sur « pas toujours » `chain` reste 0 et `run` part de la fiche et **s'arrête derrière la broche** |
| `anciens` 66,10 → 69,10 | « Dans les logements anciens, la terre défectueuse est l'anomalie la plus fréquente. » | la caméra recule sur la colonne (vers `VIEW.exploded`) : la chaîne au-delà de la prise en fantôme ; `chip-anomalie` (ce que l'image ne peut pas montrer) |
| `commentaire` 69,66 → `like` 72,92 | « En +commentaire+ : chez toi… avec *broche*, ou sans ? » | **`duelCall`** (`aAt: duelA` 71,50, `bAt: duelB` 72,06, `toneA: "veille"`, `toneB: "signal"`) ; la prise de près : `pin` 1 sur « broche », 0 sur « sans » — chaque réponse a son image, **le film ne répond pas** |
| `like` 72,92 → `likeEnd` 75,40 | « +Like+ : pour quelqu'un qui a encore des prises sans *broche*. » | `likeCall` (« … personnes ») ; la buanderie de mi-distance (`VIEW.machine` plus large), la machine arrêtée, la prise à deux trous dans le cadre |
| `abo` 75,85 → `toloop` 80,83 | « Prochain dossier : classé. Un autre système qui veille sur toi… sans que tu le *saches*. » | `nextFile` (show `prochain` − 0,15, fact `prochain` + 0,7, hide `toloop` − 0,38, rail `abo` + 0,1 → `aboEnd` + 0,15) ; **rien du sujet** : la buanderie de loin (`VIEW.far`), une maquette dans la nuit |
| `toloop` 80,83 → fin | « Comme ce fil… le jour où… » | **coupe** dans la buanderie (`STAGED`, la pose de `POSE0` un peu reculée) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` : tout revient à la première image ; **la dernière image est la première** (le tremblement et le tambour sont des fonctions du temps : régler leur phase pour qu'ils raccordent, ou l'accepter si `D.commit` ne dit rien) |

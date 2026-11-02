# 032 · Barre anti-panique — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **88,8 s**) ; Merwan l'écoute encore : une phrase reprise bougera de quelques dixièmes. **Tout instant se lit dans le script** — un repère d'`episode.json` (`cues` : 94, vérifiés un par un sur la table) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; une durée est un écart entre deux repères. Les secondes ci-dessous ne servent qu'à te repérer (`npm run script -- 032`). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : des squelettes qui construisent, à réécrire en entier) et n'écrit que `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/025-esp/src/acte*.js` ; fin : `kit/template/src/fin.js` ; outillage : `kit/lib/direct.js`, `kit/lib/blocks.js`. Les poses qui cadrent seront dans les journaux des décors (`docs/journal/032-model.md`, `032-salle.md`) et `docs/032-actes-maj.md` : **leurs lignes priment** — `VIEW` n'est qu'un départ réglé sur bouchons.

## La scène, et ce qu'on a le droit d'affirmer

Aujourd'hui (un scénario : `sources` le dit) : une salle publique, la foule pousse vers l'issue de secours ; tu es plaqué contre la porte, poitrine sur le battant, bras pris, ta hanche sur la barre. La barre est un levier : poussée n'importe où, elle tire le pêne hors de la gâche — **même sous la poussée de la foule** — et la porte bascule **dehors**. 1883 : Victoria Hall, Sunderland — en bas d'un escalier, une porte qui s'ouvrait **vers l'intérieur**, verrouillée pour ne laisser passer qu'un enfant à la fois ; 183 enfants meurent.

- **À ne pas dire, ni montrer** : aucune cote à l'image (80 N, 1 000 N, 220 N, 60 %) ; « bloqué pour toujours » (le pêne ressort avec la barre) ; « quelle que soit la foule » ; « la loi oblige une barre » (CO 45 impose le sens de la sortie et la simple poussée, pas la barre — `chip-50` dit « Vers la sortie », jamais « Barre obligatoire ») ; le total d'enfants présents ; un coupable ; **du feu** (ils sont morts écrasés) ; **un enfant identifiable** (silhouettes de verre sans visage) ; **personne n'est blessé à l'image**, aucun corps à terre. On n'encourage jamais à condamner une barre.
- **L'annonce du 033** : une porte d'avion vue de la cabine, une main sur son levier, rien ne bouge — **ni flèches de pression ni tonnes** (c'est la chute du 033).

## L'en-tête (main.js — tu ne l'écris jamais)

- **Le chrono** (`hud-clock`) : T+ secondes depuis que la foule pousse, **illustratif** (`sources`) : il court pendant l'acte 1 (0 → 6,4 s), se tient pendant l'autopsie, reprend à `torejoue` et **s'arrête sur « dehors »** (9,8 s). En 1883 (`era` 1) : « 16 juin 1883 ».
- **« Porte »** (`hud-count`) : l'état de la porte, lu dans l'état — « Fermée » signal · « Libre » veille (`pene` ≥ 0,5) · « Ouverte » veille (`swing` ≥ 0,08) · « Verrou » signal (1883). Tu bouges `pene` et `swing`, l'en-tête suit ; sur l'établi aussi.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration, sur le mot.** Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`, `{ ...PAST, … }`, `{ ...FLIGHT, … }`) ; l'acte 1 part de `POSE0` et de `FIRST`. Il rend la main à l'instant où le suivant coupe ; rien ne déborde (une étiquette a fini de sortir avant).
- **Chaque coupe est un raccord** (forme, objet, mouvement) — ils sont écrits dans les tables ; une coupe se pose quelques images avant sa phrase (les repères `to…` sont 0,12 s avant).
- **`era` change sur une coupe seulement** (`now` ou dans l'état du `cut`) ; `set` aussi (`SET.SALLE`, `SET.BENCH`, `SET.AVION`).
- **La foule bouge toute seule** (`salle.js` : une vague réglée sur `time`, amplitude ∝ `press`) : tant qu'elle est là, l'image vit. Une plage de 2 s sans mouvement est interdite de 10 à 25 s.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600 ni sous les boutons (x > 905, y 880–1760). Vérifie chaque plan AVEC l'en-tête (sans `--bare`).
- **La part du cadre que tient le sujet** est donnée pour chaque plan : c'est la largeur à 270 px de ce que dit la phrase. Sous 30 %, le plan est un plan large et doit être court.
- Mouvements `sine.inOut`, longs ; recul ou plongée par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La caméra traverse le verre (murs, battant, figurants qu'elle frôle : alors invisibles), jamais le système.
- **La lumière suit ce qu'on filme** : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 40 le pêne et la gâche, ≈ 90 la barre, ≈ 250 toi contre la porte, ≈ 500 la porte et le premier rang, ≈ 1 200 la salle ; `SIZE` sur l'établi).
- **Couleurs** : `mood` 1 dans la salle jusqu'à « Et la salle respire » (il passe à 0 SUR cette phrase), 0 sur l'établi sauf de « Mais là » à `toseuil` ; 1 en 1883. Jamais à mi-chemin plus d'une demi-seconde.
- **`D.punch`** : un mot par phrase au plus, sur son mot-clé (`*mot*` / `+mot+`), jamais sur une coupe ni sur l'image 0. `D.captionStyle({ hit: 0.25 })` est dans `acte1.js`.
- Toi, de près, es de verre : jamais en très gros plan, jamais la main seule. **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée ; s'il t'en manque un, « À changer ailleurs ».
- Les étiquettes sont en capitales ; aucune unité à symbole. Les pièces se nomment avec `co.add`, sans chiffre : « Barre-levier », « Boîtier », « Pêne », « Gâche », « Ressort de rappel ».
- **Le son** est déjà posé (`episode.json` → `sfx`, 39 sons, tous dans un souffle) : un son que tu ajoutes va dans un souffle (`npm run script` : l'écart entre deux mots), jamais sur un mot. Images : **26 lues au plus**. Journal : `docs/journal/032-<ton fichier>.md`. Planches et `essais.json` dans `.cache/planches/032/<ton fichier>/`, jamais dans `renders/`.

## La grille de rétention qui s'applique ici

- **0 → 0,5 s** : la foule déferle dès l'image 1 (c'est le sujet qui bouge), son `hit` + `impact` avant le premier mot. **Sans texte** (`buildHook` attend la voix).
- **Le mot-choc avant 3 s** : « fermée » (`choc` 1,96) — `D.punch` + `hit` dans le souffle (2,32).
- **10 → 25 s, la deuxième accroche** : un changement toutes les 2 à 3 s — la vague (11,2), la poitrine (11,9), les bras (13,5), la hanche (15,3), la barre (16,2), « Alors… » dans le quasi-silence (`suck`, `hush`), l'éclaté sur « on » (18,12), puis une pièce par souffle (levier 22,8 · boîtier 24,2 · pêne 25,8 · gâche 27,0) avec son clic.
- **Portes d'acte** : `tobench` (raccord en place), `toseuil` (retour dans la porte), `tozero` (coupe franche vers 1883, `impact`), `torejoue` (retour aujourd'hui, `hit`), `toverdict`.
- **Fin** : `duelCall` (« barre, ou poignée ? ») — le film ne répond jamais à la place du spectateur ; les deux réponses restent encre (`toneA`, `toneB` : `null`).

## Les mots qui frappent (un par phrase au plus)

fermée (1,96) · sauve (3,85) · dessus (7,08) · toi (8,84) · barre (16,18) · levier (22,80) · gâche (27,04) · coince (35,76) · verrou (45,16) · sort (53,96 — **pas** de punch : coupe proche ; c'est le pêne qui frappe) · dehors (56,96) · respire (58,16) · calme (62,38) · panique (63,82, verdict) · sortie (73,66).

## La boucle

La dernière phrase, « Pas comme la tienne, le jour où… », retombe sur « La foule t'écrase… » : `fin.js` coupe à `toloop` (86,26) dans la salle, sur un cadre proche de `POSE0` avec l'état de `FIRST` (foule, toi, `press` 0,8, `mood` 1, `sign` 1), et `D.loop` rembobine sur `rewind` (87,44). **La dernière image est la première** : tire-les côte à côte.

## Les étiquettes (dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-coince` (Sous la foule / Le pêne coince, signal) · `#rail-seuil` · `chip-1883` (Sunderland · 1883 / Victoria Hall, encre) · `chip-183` (Écrasés dans l'escalier / 183 enfants, signal) · `chip-libre` (Malgré la foule / Le pêne sort, veille) · `#retitle` (Elle est faite pour : « Le calme » barré → « La panique ») · `chip-50` (Au-delà de 50 personnes / Vers la sortie, veille) · `#duel` (Ta porte de secours, au boulot, au lycée : Barre / Poignée) · `#net` · `#next` (Prochain dossier · 033 — « La porte d'avion. En plein vol, personne ne peut l'ouvrir. » — S'abonner pour l'ouvrir) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

---

## acte1.js — 01 · MENACE (0 → `tobench` 17,98)

Part de `POSE0` et de `FIRST`, **un seul mouvement, une coupe** (`toscene`). Rend la main à `tobench` sur `VIEW.system`, la foule effacée : l'acte 2 coupe sur l'établi **au même cadre** (raccord en place). « Alors… » est dit dans ce dernier plan, seul.

| repère | la voix | l'image | sujet |
| --- | --- | --- | --- |
| 0 → `choc` 1,96 | « La foule t'écrase contre une porte… » | `POSE0`, `FIRST` : la foule déferle (vagues de `press` 0,8), toi plaqué, la barre sous ta hanche ; la caméra pousse doucement (`glide(3, 0.5)` à vérifier à 0,3 et 0,7 s : rien ne sort du cadre) | la porte ≈ 40 %, toi + barre ≈ 35 % |
| `choc` 1,96 → 2,8 | « …fermée. » | `D.punch(choc)` ; `load` 0 → 0,7 (les flèches arrivent sur le battant), `press` → 1 : le battant tremble ; `litPene` 0,6 (ce qui ferme) — l'en-tête dit « Fermée » | idem |
| 2,8 → 4,12 | « Et c'est cette porte qui te sauve. » | sur « sauve » (`sauve` 3,85) : `litBar` 0 → 1, la tête de lumière veille court le long de la barre ; la caméra commence à glisser vers la barre | la barre ≈ 25 % |
| `promesse` 4,66 → 6,0 | « Une barre doit la libérer… » | arrivée sur `VIEW.bar` (trois quarts sur la barre, la foule derrière) ; sur « libérer » (`libere` 5,24) `litPene` pulse une fois : c'est lui qu'il faut libérer | la barre + boîtier ≈ 45 % |
| 6,0 → 7,24 | « …même avec la foule appuyée dessus. » | `load` → 1 sur « appuyée » (6,76), la foule se penche ; `D.punch(dessus1)` | idem |
| `sauf` 7,80 → 8,92 | « Sauf si elle s'ouvre vers toi. » | la caméra monte un peu (vers `VIEW.door`, par rapport) ; sur « vers » (`verstoi` 8,64) `arcIn` 0 → 1 en 0,6 s : le battant fantôme signal vire vers la salle, vers toi, son arc au sol ; `D.punch` sur « toi » | la porte + l'arc ≈ 55 % |
| **coupe** `toscene` 9,63 | | **raccord sur la foule** : `VIEW.crowd` (haut, derrière la foule : l'entonnoir vers une petite porte) ; `arcIn` 0, `load` 0,8 | la foule ≈ 60 %, la porte petite |
| `scene` 9,75 → 11,38 | « Derrière toi, toute la salle pousse. » | une grande vague sur « pousse » (`pousse1` 11,17) ; la caméra plonge déjà vers la porte, par rapport | la masse ≈ 60 % |
| 11,78 → 13,06 | « Ta poitrine est collée au métal. » | la plongée finit sur `VIEW.chest` (ta poitrine de verre sur le battant, ta tête de côté) à « poitrine » (`poitrine` 11,90) | toi ≈ 45 % |
| 13,34 → 14,4 | « Tes bras sont bloqués. » | la caméra glisse le long de toi (bras pris contre la porte et les autres) ; un dos pousse sur le tien sur « bloqués » (`bloques` 13,86) | toi ≈ 45 % |
| 14,61 → 16,42 | « Il te reste ta hanche… contre une barre. » | la caméra descend jusqu'à `VIEW.hip` : ta hanche sur « hanche » (`hanche1` 15,30), puis la barre plein cadre sur « barre » (`barre1` 16,18) : `litBar` 1, `D.punch` | la barre ≈ 60 % |
| 16,42 → `tobench` 17,98 | « Alors… » (`alors` 17,34) | la foule, toi et le lieu s'effacent (`crowd` 0, `you` 0, `shell` 0,2, `load` 0, `sign` 0, `mood` 0, entre 16,6 et 17,3) ; la caméra se pose sur `VIEW.system` : **la porte et sa barre seules** sur le noir, `fs` → 90. Pendant « Alors… », plus rien ne bouge que la caméra, lentement | le système ≈ 50 % |

**Couture de sortie** : pose `VIEW.system`, état `crowd` 0, `you` 0, `shell` 0,2, `push` 0, `pene` 0, `mood` 0.

## acte2.js — 02 · AUTOPSIE (`tobench` 17,98 → `tozero` 39,75)

Tout sur l'établi (`benchCut`, `origin: BENCHAT`, `state: BENCHED` — `slab` 1 : la tranche de porte de verre y est), puis retour dans la porte au seuil. Phrases : 11. `setAct(tl, 2, t.alors)`.

| repère | la voix | l'image | sujet |
| --- | --- | --- | --- |
| **coupe** `tobench` 17,98 | | `benchCut` depuis `VIEW.system` : même cadre, l'établi monte sous le système | le système ≈ 50 % |
| `explode` 18,12 → 19,2 | « …on l'ouvre. » | `explode` 0 → 1 en ≈ 1 s (`none` : les pièces ont leur propre réglage), recul par rapport vers `VIEW.exploded` | l'éclaté ≈ 70 % |
| `sous` 19,43 → 22,24 | « Sous ta hanche, la barre court sur plus de la moitié de la porte : » | `explode` → 0,35 (la barre revient devant la tranche pour qu'on compare) ; sur « court » une tête de lumière (`litBar`) court du boîtier au bout de la barre, finie sur « porte » (`porte2` 22,00) ; `co.add` « Barre-levier » | barre + tranche ≈ 75 % |
| `levier` 22,80 → 23,04 | « c'est un levier. » | `VIEW.barBench` (le pivot) : `push` 0 → 0,7 → 0 en 0,9 s, `litPivot` 1 — le bras tourne autour de son axe ; `D.punch(levier)` | le bras et la chape ≈ 40 % |
| `bout` 23,68 → 24,64 | « Au bout, un boîtier. » | la caméra glisse jusqu'à `VIEW.boxBench` ; `litBox` 1 sur « boîtier » (`boitier` 24,24), `co.add` « Boîtier » | le boîtier ≈ 45 % |
| `dedans` 25,09 → 26,16 | « Dedans, le pêne… » | `see` 0 → 1 sur « Dedans » (le capot devient verre) ; `litPene` 1 sur « pêne » (`pene1` 25,84), `co.add` « Pêne » | le pêne ≈ 30 % |
| `plante` 26,52 → 27,60 | « …planté dans la gâche du cadre. » | `explode` 0,35 → 0 : le pêne entre dans la gâche sur « gâche » (`gache1` 27,04) ; `VIEW.jamBench` ; `litGache` 1, `co.add` « Gâche » ; `D.punch(gache1)` | pêne + gâche ≈ 45 % |
| `torepos` 28,15 → 30,20 | « Au repos, un ressort repousse la barre. » | `VIEW.boxBench`, `see` 1 ; `push` à 0,6 sur la coupe, `litSpring` 1 sur « ressort » (29,00), puis `push` 0,6 → 0 sur « repousse » (29,52) : le ressort se détend, la barre ressort ; `co.add` « Ressort de rappel » | le boîtier ouvert ≈ 45 % |
| `pene2` 30,68 → 32,44 | « Le pêne reste sorti : la porte tient. » | `VIEW.jamBench` : `pene` 0, `litPene` 1 ; l'en-tête dit « Fermée » ; « tient » (32,28) : rien ne bouge — un plan tenu, vivant par sa lumière | pêne + gâche ≈ 45 % |
| `mais` 32,96 → 34,68 | « Mais là, toute la foule pèse dessus. » | `mood` 0 → 1 sur « Mais » (franc) ; recul par rapport vers `VIEW.whole` ; `load` 0 → 1 sur « foule » (`foule2` 33,88) : les flèches signal couvrent la tranche | tranche + barre ≈ 70 % |
| 35,04 → 36,60 | « Et le pêne se coince dans la gâche. » | plongée sur `VIEW.jamBench` ; `jam` 0 → 1 sur « coince » (`coince` 35,76), `D.punch` ; `chip-coince` 35,8 → `toseuil` − 0,1 | pêne + gâche ≈ 50 % |
| **coupe** `toseuil` 36,93 | | **raccord en place** : retour dans la porte, `VIEW.latch`, `{ ...STAGED, load: 1, jam: 1, press: 1 }` — même pêne, même gâche, le battant de verre et la foule autour | pêne + gâche ≈ 40 % |
| `abonne` 37,05 → `tozero` 39,75 | « Abonne-toi : cette porte fermée, on la pousse. » | `followCall(tl, { from: t.abonne, to: t.tozero - 0.1 })` ; **la caméra déjà en route** : recul par rapport de la gâche vers `VIEW.bar` (la porte fermée, ta hanche, la foule qui pousse derrière) atteint vers « fermée » (38,28) ; une vague sur « pousse » (39,12) | la porte ≈ 40 % |

**Couture** : entrée `VIEW.system` / `BENCHED` ; sortie dans la salle, `STAGED` + `load` 1, `jam` 1. Couverture : propose un repère (`cadre` par défaut), une pose (`el` ≥ 28) et l'état où tout le système est éclairé.

## acte3.js — 03 · RÉPONSE (`tozero` 39,75 → `toverdict` 59,30)

En coupes : une coupe par souffle. 12 phrases. `setAct(tl, 3, t.tozero + 0.12)`.

| repère | la voix | l'image | sujet |
| --- | --- | --- | --- |
| **coupe** `tozero` 39,75 | | **raccord sur la porte** : même porte, 1883 — `{ ...PAST }`, `VIEW.stairTop` ; `chip-1883` 39,9 → 41,9 ; l'en-tête dit « 16 juin 1883 » | escalier + porte ≈ 70 % |
| 39,87 → 41,80 | « 1883, Sunderland. » | du haut de l'escalier : les enfants de verre tassés sur les marches, la porte en bas ; la caméra commence à descendre | la masse ≈ 55 % |
| `escalier` 42,12 → 43,80 | « En bas d'un escalier, une porte. » | la descente (par rapport) finit sur `VIEW.stairDoor` sur « porte » (`porte3` 43,48) : le battant entrebâillé VERS l'escalier | la porte ≈ 45 % |
| `sans` 44,20 → 44,60 | « Sans barre. » | même plan, serré sur la face du battant : `ghost` 0 → 0,6 → 0 (le contour de la barre, là où elle n'est pas) | le battant ≈ 50 % |
| `verrou` 45,04 → 45,40 | « Un verrou : » | **coupe** sur `VIEW.bolt` : `bolt` 0,7 → 1 d'un coup (signal), `D.punch(verrou)` | le verrou ≈ 30 % |
| 45,91 → 46,76 | « un enfant à la fois. » | **coupe** sur l'entrebâillement (`VIEW.stairDoor`, plus serré) : `slip` 0 → 1, un seul passe ; les autres tenus | la fente + l'enfant ≈ 40 % |
| `n183` 47,24 → 48,76 | « 183 enfants meurent. » | **coupe** sur `VIEW.stairTop` : tout s'arrête (la vague tenue, `press` 1 figé), rien ne tombe ; `chip-183` 47,2 → `torejoue` − 0,1 | la masse ≈ 55 % |
| **coupe** `torejoue` 49,16 | | **raccord sur la porte** : aujourd'hui, `{ ...STAGED, load: 1, press: 1 }`, `VIEW.hip` ; le chrono reprend | la barre ≈ 55 % |
| 49,28 → 50,56 | « On rejoue, avec la barre. » | `litBar` 1 sur « barre » (50,32) | idem |
| `hanche2` 50,96 → 51,76 | « Ta hanche appuie. » | `push` 0 → 0,35 sur « appuie » (`appuie` 51,44) — ta hanche suit | idem |
| `levier2` 52,12 → 53,04 | « Le levier s'enfonce. » | **coupe** sur `VIEW.latch` (`see` 1, `jam` 1) : `push` → 1 sur « s'enfonce » (`enfonce` 52,52) | boîtier + pêne + gâche ≈ 45 % |
| 53,40 → 54,64 | « Le pêne sort de la gâche… » | sur `trigger` (53,91) : `pene` 0 → 1 en 0,2 s (`power2.out`), `jam` 1 → 0, `litPene` veille ; l'en-tête passe à « Libre » ; `chip-libre` 53,95 → 55,8 | idem |
| `malgre` 54,88 → 55,52 | « …malgré la foule. » | recul : les flèches de charge toujours là (`load` 1), la foule toujours pressée | la porte ≈ 40 % |
| `bascule` 55,96 → 57,28 | « La porte bascule dehors. » | **coupe** sur `VIEW.outflow` (dehors) : `swing` 0 → 1 sur « bascule » (56,48, 0,8 s `sine.out`), `arcOut` 1, `outside` 0 → 1 ; `D.punch(dehors)` ; le chrono s'arrête sur « dehors » | la porte ouverte ≈ 45 % |
| `respire` 57,64 → 58,72 | « Et la salle respire. » | `flow` 0 → 1, `press` → 0, `load` → 0, **`mood` 1 → 0 sur cette phrase** : la foule s'écoule dans la lumière | la foule qui sort ≈ 60 % |

**Couture** : sortie `swing` 1, `flow` ≈ 1, `mood` 0 ; `fin.js` coupe sur l'établi.

## fin.js — chute, ce qui est dû, like, prochain dossier, boucle (`toverdict` 59,30 → 88,8)

| repère | la voix | l'image | sujet |
| --- | --- | --- | --- |
| **coupe** `toverdict` 59,30 | | l'établi, `VIEW.whole`, `BENCHED` : la barre seule sur son halo | le système ≈ 60 % |
| 59,42 → 62,62 | « Voilà le secret : une barre anti-panique ne te demande pas ton calme. » | `retitle` (`showAt` chute + 0,1, `strikeAt` `calme` 62,38) ; lente rotation | idem |
| 62,97 → 65,42 | « Elle est faite pour la panique : tu pousses, n'importe où. » | `swapAt` `verdict` − 0,05, `D.verdict(verdict)` ; la main de verre (`hand` 1) frappe à trois endroits : `tapAt` −0,6 sur « pousses » (64,50), 0,1 sur « n'importe » (64,97), 0,75 sur « où » (65,34) — à chaque coup `push` 1 et `pene` 1, puis relâche ; `hideAt` `tocta` − 0,42 | barre + main ≈ 60 % |
| **coupe** `tocta` 66,10 | | la salle vide d'aujourd'hui, `VIEW.door`, `{ ...STAGED, crowd: 0, you: 0, press: 0 }` | la porte ≈ 45 % |
| 66,22 → 67,34 | « Et si elle s'ouvre vers toi ? » | `arcIn` 0 → 1 sur « vers » (`verstoi2` 67,10) : le battant fantôme signal, comme dans l'accroche | porte + arc ≈ 55 % |
| 67,82 → 70,90 | « À Sunderland, elle s'ouvrait vers l'intérieur. Contre la foule. » | **coupe** `sunder2` − 0,12 sur `VIEW.above1883` (`PAST`, `swing` 0) : `arcIn` sur « l'intérieur » (`interieur` 69,34), côté escalier ; sur « Contre » (70,22) les enfants plaquent le battant dans son cadre | porte + escalier ≈ 60 % |
| 71,29 → 73,90 | « En France, au-delà de 50 personnes : vers la sortie. » | **coupe** `france` − 0,42 sur la porte d'aujourd'hui vue de haut (`VIEW.door`, `el` ≈ 55) : `arcOut` sur « sortie » (73,66), veille ; `chip-50` sur `n50` (72,38) → 73,9 | porte + arc ≈ 55 % |
| `commentaire` 74,62 → 78,30 | « En commentaire : celle de ton boulot, ton lycée… barre, ou poignée ? » | `duelCall(tl, { from: t.commentaire - 0.5, aAt: t.duelA, bAt: t.duelB, to: t.like - 0.3, toneA: null, toneB: null })` ; la porte fermée, sa barre au repos, le pictogramme allumé ; lente poussée | la porte ≈ 40 % |
| `like` 79,00 → 81,40 | « Like : pour quelqu'un qui ouvre une salle au public. » | `likeCall(tl, { from: t.like, to: t.likeEnd + 0.12, count: 5, label: (n) => \`${n} personnes\` })` ; la salle vide, la porte prête | idem |
| **coupe** `toabo` 81,68 | | **raccord porte sur porte** (la porte au même endroit de l'image) : `SET.AVION`, `VIEW.plane`, `FLIGHT` | la porte d'avion ≈ 45 % |
| 81,80 → 85,72 | « Prochain dossier : la porte d'avion. En plein vol, personne ne peut l'ouvrir. » | `nextFile` (`showAt` `dossier` − 0,3, `factAt` `dossier` + 0,7, `hideAt` `toloop` − 0,38, rail de `toabo` + 0,2 à `abo$` + 0,15) ; `tug` 0 → 1 de « vol » (84,20) à « personne » (84,84) : la main tire, rien ne bouge. Aucune flèche, aucun chiffre | idem |
| **coupe** `toloop` 86,26 → 88,8 | « Pas comme la tienne, le jour où… » | retour dans la salle, cadre proche de `POSE0`, l'état de `FIRST` ; `D.loop({ at: t.toloop, rewindAt: t.rewind, fromD })` | comme l'image 1 |

---

## La première image — quatre candidates

« La foule t'écrase contre une porte fermée. » L'agent de `salle.js` tire les quatre sur le vrai décor (à 0,04 et 0,5 s : la foule doit avoir bougé), celui qui orchestre choisit AVANT les actes et colle `POSE0` dans `world.js`. Notes sur les six points (événement en cours · perspective basse · menace derrière le sujet · forme reconnue sur 40 % vue d'où on ne la voit jamais · système déjà là, petit mais lisible · bouge par son sujet), sur bouchons :

- **(a) De profil, côté serrure** (`POSE0` provisoire, la proposition du `voir`) — au ras du sol dans la salle, le mur presque de profil : la porte à gauche, toi plaqué, la foule qui déferle depuis la droite, la barre sous ta hanche. **5/6** : événement ✓ · basse ✓ · menace derrière ✓ (la foule à droite, derrière toi) · forme ✓ (la porte, mais vue d'où on la voit souvent) · système ✓ · bouge ✓. Risque : le mur vu de profil en dalle blanche (bouchon), des figurants entre la caméra et la porte.
  `{ "at": 0.04, "label": "a profil", "pose": { "tx": 10, "ty": 112, "tz": 70, "d": 430, "az": -64, "el": -7, "fov": 42, "shift": 110, "side": 40, "roll": 0, "drift": 0, "dof": 0 } }`
- **(b) De dehors, à travers le battant** (`VIEW.outside`) — dehors, bas, face à la porte : le battant de verre, toi écrasé dessus, la barre pleine derrière le verre, et derrière toi la foule qui pousse. **6/6** : la porte vue d'où personne ne la voit (de la sortie), la menace exactement derrière le sujet, le système lisible. **Ma préférée.** Risque : trois couches de verre (battant, toi, foule) qui se brouillent — la foule doit rester plus pâle que toi.
  `{ "at": 0.04, "label": "b dehors", "pose": { "tx": -5, "ty": 115, "tz": 30, "d": 380, "az": -152, "el": -8, "fov": 40, "shift": 110, "side": 0, "roll": 0, "drift": 0.3, "dof": 0 } }`
- **(c) L'entonnoir, de haut** (`VIEW.crowd`) — haut derrière la foule : la masse qui converge vers une petite porte et son pictogramme. **3/6** : événement ✓ · basse ✗ · menace devant le sujet ✗ · forme petite ✗ · système illisible ✗ · bouge ✓. Lisible sans le son, mais une carte : c'est le premier plan de la scène (`toscene`), pas l'accroche.
  `{ "at": 0.04, "label": "c entonnoir", "pose": { "tx": 0, "ty": 60, "tz": 160, "d": 1250, "az": -28, "el": 30, "fov": 40, "shift": -60, "side": 0, "roll": 0, "drift": 0.3, "dof": 0 } }`
- **(d) Sous la barre** (`VIEW.under`) — au ras du boîtier, en contre-plongée : la hanche sur la barre au-dessus, le boîtier et le pêne devant, les jambes de la foule derrière. **4/6** : événement ✓ · basse ✓ · menace derrière ✓ (les jambes) · forme ✗ (la barre seule ne se reconnaît pas en un tiers de seconde) · système ✗ (trop grand : c'est la réponse, pas la promesse) · bouge ✓ (la hanche pousse).
  `{ "at": 0.04, "label": "d sous la barre", "pose": { "tx": -30, "ty": 92, "tz": 14, "d": 95, "az": -58, "el": -24, "fov": 48, "shift": 60, "side": 0, "roll": 0, "drift": 0.3, "dof": 0 } }`

## Ce qui reste fragile (à regarder en premier sur les planches)

- Trois couches de verre l'une derrière l'autre (battant, toi, foule) : la hiérarchie — toi le plus lisible, la foule la plus pâle — décide de l'accroche et de l'acte 1.
- La tranche de porte sur l'établi doit dire « la largeur de la porte » sans cote : si elle ne le dit pas, « plus de la moitié de la porte » n'a pas d'image.
- 1883 : des enfants de verre lisibles comme une foule, jamais comme des personnes identifiables ; rien ne tombe.
- L'annonce : la cabine du L03 est un décor lourd (fumée, passagers) — `avion.js` éteint tout ce qui ne sert pas ; vérifier qu'aucune image parasite n'apparaît sur la coupe `toabo`.

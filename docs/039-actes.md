# 039 · Le cendrier du réacteur — le plan de mise en scène

**La voix est enregistrée** (une prise, turbo, **93,4 s**) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues` : 64, vérifiés mot à mot sur la table) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur**. Les secondes ci-dessous servent à se repérer (`npm run script -- 039`). Cinq fichiers, cinq agents : `acte1.js`, `acte2.js`, `acte2b.js` (le principe et le repos, importé par `main.js`), `acte3.js`, `fin.js` — aujourd'hui des squelettes, à réécrire en entier. Forme : `episodes/017-irm/src/acte*.js` ; fin : `kit/template/src/fin.js`. Les poses de `VIEW` sont **provisoires (bouchons)** : partir de celles des journaux `docs/journal/039-model.md`, `039-corium.md`, `039-batiment.md`, `039-habillage.md`.

## Ce qui vaut pour tous

- **La scène est une reconstitution** (jamais arrivée sur un EPR). Ordre vrai : le cœur perce la cuve → **s'accumule dans la fosse** en mangeant le béton sacrificiel → fait fondre **la porte** → coule par **le canal** → **s'étale à sec** en quelques dizaines de secondes → en s'étalant **détruit les déclencheurs** → les vannes s'ouvrent seules → **après plusieurs minutes** l'eau descend de la piscine par gravité, remonte autour, recouvre. **Jamais d'eau dans la chambre avant l'étalement**, jamais la chambre sous la cuve, personne dans le bâtiment.
- **Un seul lieu.** L'établi (`SET.BENCH`) est la même place, bâtiment effacé, halo dessous : une coupe vers l'établi est en place. `STAGED` = l'usine au repos (sec, fermé, aucun corium) ; `BENCHED` = l'établi au repos. Le corium n'existe que sur le système assemblé : **tous ses nombres à 0 tant que `explode` > 0**.
- **Azimut** : `az` 0 au bout de la chambre (+z) regarde vers la fosse ; à `az` −15 … −25, la chambre devant, la fosse et la cuve derrière, empilées dans le cadre vertical : l'axe des plans larges. De flanc (`az` −50 et au-delà), le tout ne tient pas.
- **L'en-tête** (`main.js`, tu ne l'écris jamais) : avant `cede` (51,08) « Cuve percée » (signal) — aucune durée de la fosse n'est sourcée ; dès que la porte cède, le chrono T+00:00 → T+00:30 à `mince` (59,12) → tenu → T+05:00 de `minutes` − 0,4 à `recouvre` (64,96). Second compteur « Corium » : « > 2 000 °C » (signal), « Sous l'eau » (veille) dès que `water` ≥ 0,95. Tu bouges `water`, l'en-tête suit.
- **Couleurs** : `mood` 1 dans la menace et l'acte 3 jusqu'à « recouvre », 0 sur l'établi, au repos et après « recouvre ». Franc, jamais à mi-chemin plus d'une demi-seconde. Le corium est signal ; l'eau est ink (verre clair), ses têtes veille quand elle part ; `guard` 1 quand le système a gagné.
- **Chaque phrase a sa démonstration, sur le mot.** Chaque coupe est un raccord (on coupe sur la pièce que la phrase vient de nommer, ou dans le sens du flux du corium) et se pose 0,10–0,14 s avant sa phrase. Rien d'un plan ne déborde sur le suivant.
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe ni l'image 0) : `choc` (fond) · `perce` · `fondre` · `fusible` ou `sec` · `mincep` ou `partage` · `dort` · `cede` · `etale2` · `recouvre` · `verdict` (pas). Le son est déjà posé dans les souffles (`sfx`) : ne cale pas une image forte sur un autre instant que son mot.
- **« Alors… on l'ouvre. »** seul dans son plan (la plongée sur la porte, puis la coupe en place) ; l'éclaté s'ouvre **sur « on »** (`explode` 21,08), `suck` puis `hush` autour : rien ne bouge d'autre.
- **La boucle** : la dernière image est `POSE0` + `FIRST` (`D.loop`), la cuve rouge vue du fond de la fosse ; la voix retombe sur « Ton réacteur… ».
- **Rétention (10 → 25 s)** : un changement toutes les 2 à 3 s (un geste du corium, une coupe, une étiquette) — aucune plage lente de 2 s ; la scène est une deuxième accroche.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une étiquette à la fois) · sujet 440–1160 · sous-titres 1248–1488 · rien sous 1600, rien sous les boutons (x > 905, y 880–1760). Planches **avec** l'en-tête. Ce qui monte derrière l'en-tête (la cuve, ses tubes) s'y fond dans le noir.
- **La lumière suit le sujet** : `fx fy fz` autour de ce qu'on filme, `fs` sa taille (≈ 150 la porte, ≈ 400 une vanne, ≈ 600 la fosse, ≈ 1 500 la chambre, ≈ 3 000 le large ; `SIZE` sur l'établi).
- `dof` aux seuls gros plans (`VIEW.plugTop`, `valve`, `trigger`, `heap` étalent `CLOSE`) ; toute autre pose dit `dof: 0`.
- **Anti-parasites** : ce que la caméra frôle est invisible ; la caméra traverse le verre (bâtiment, cuve), jamais la fonte, la porte, le revêtement de la fosse ; un quart de tour en une seconde est une coupe ; plongées et reculs par rapport (`shot(at, durée, pose, ease, fromD)`) ; le corium bouge lentement (pas de clignotement : `qa`).
- Étiquettes en capitales, aucune unité à symbole (« 170 mètres carrés »). Les pièces se nomment avec `co.add`, sans chiffre : « Béton sacrificiel », « Porte fusible », « Canal », « Chambre d'étalement ». **26 images lues au plus**, par planches de 8.

## Les étiquettes (dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-salle` (Chambre d'étalement / Vide, ink) · `chip-170` (Étalé sur / 170 mètres carrés, veille) · `chip-jamais` (Jamais servi / En conditions réelles, ink) · `chip-vannes` (Les vannes / Ouvertes · seules, veille) · `chip-pompe` (Pompe / Aucune, veille) · `#retitle` (Un cœur fondu : « Noyé tout de suite » barré → « Étalé, puis noyé ») · `chip-reponse` (Qui ouvre les vannes ? / Le cœur fondu, veille) · `#duel` (Près de chez toi… : Un EPR ou Pas un EPR) · `#net` · `#next` (Prochain dossier · 040 — « 73 pompiers pris au piège par le feu. Aucun mort. » — S'abonner pour l'ouvrir) · `.rail` (follow, like, comment). Une étiquette en mouvement prend une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

## acte1.js

01 MENACE, 0 → `tobench` 20,94. Part de `POSE0` et `FIRST`, sans coupe ; deux coupes au plus. Finit sur la plongée sur la porte, `plug` ≈ 0,35.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 0 → 1,96 | « Ton réacteur nucléaire *fond*. » | `POSE0`, `FIRST` : du fond de la fosse, le ventre de la cuve rouge en haut, une goutte qui gonfle au point bas et tombe vers nous ; la porte en bas, lueur veille faible. La caméra monte doucement (`glide(3, 0.5)`, à vérifier à 0,3 / 0,7 s). `punch` sur `choc` (1,28) | cuve ≈ toute la largeur du haut ; porte ≈ 15 % |
| 1,96 → 3,12 | « L'acier lâche. » | sur `lache` (2,36) : `breach` 0,4 → 1, `belly` → 1, une grosse goutte part, des braises | idem |
| 3,12 → 3,88 | « Et on le laisse +couler+. » | sur `couler` (3,64) : `pour` → 1, le filet jusqu'au sol, éclaboussure, `pit` → 0,08 | idem |
| 4,23 (coupe 1) → 6,84 | « Sur l'EPR, c'est prévu : une salle vide l'attend. » | **coupe** (raccord : le filet qui descend → la bouche du canal) : `VIEW.channel`, la caméra file le long du canal vide vers la chambre et sort au-dessus d'elle (vers `VIEW.chamberLow` rapproché) : vide, sombre, à sec ; `chip-salle` de `salle` (6,04) à 7,0 | canal ≈ 30 % → chambre ≈ 70 % |
| 7,20 → 9,48 | « Pour l'eau, ni pompe, ni courant, ni toi. » | la caméra continue, monte vers la piscine (`VIEW.pool`) : eau immobile, vannes fermées ; sur `pompe` (7,96) `litPool` 0,5 | piscine ≈ 60 % |
| 10,03 → 10,76 | « Alors qui va l'*ouvrir* ? » | arrivée sur une vanne fermée (`VIEW.valve`), `litValves` 0,6 ; `punch` sur `ouvrir` (10,40) | vanne ≈ 35 % |
| 11,48 (coupe 2) → 12,74 | « Plus de 2 000 degrés. » | **coupe** retour sous la cuve, même instant (`VIEW.overPit`, état de la fin de l'accroche, `pour` 1) : le filet, le bain qui s'étend (`pit` 0,1 → 0,3) ; l'en-tête dit déjà « > 2 000 °C » | fosse ≈ 70 % |
| 13,10 → 14,26 | « Le fond de la cuve se *perce*. » | sur `perce` (14,06) : la brèche s'ouvre en grand (`breach` 1, `pour` 1, un jet plus large), `punch` | cuve en haut ≈ 25 % |
| 14,66 → 16,58 | « Le cœur fondu ronge une fosse de béton. » | sur `ronge` (15,38) : `pit` 0,3 → 0,8, `eaten` → 0,6, `fume` → 0,6 ; la caméra plonge (par rapport) | bain ≈ 80 % |
| 17,06 → 17,46 | « Une seule sortie… » | la caméra trouve la porte au centre du bain : `litPlug` 0,35 → 0,8 | porte ≈ 20 % |
| 18,26 → 19,38 | « une porte qui doit +fondre+. » | `VIEW.plugTop` : sur `fondre` (19,10) `plug` 0 → 0,35 (elle rougit), `punch` | porte ≈ 45 % |
| 19,38 → 20,94 | « Alors… » | on tient la plongée ; rien d'autre ne bouge (`suck`) | |

**Couture de sortie** : `VIEW.plugTop`, état de la fosse pleine (`pit` 0,8, `plug` 0,35). L'acte 2 coupe en place sur l'établi.

## acte2.js

02 AUTOPSIE (1/2), `tobench` 20,94 → `toprincipe` 31,97. Coupe d'entrée : `cut(t.tobench, SET.BENCH, <la plongée qui recule>, { ...BENCHED })` — la porte au même endroit du cadre (raccord en place), le bâtiment et le corium disparaissent.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 20,94 → 22,40 | « …on l'ouvre. » | **sur `explode` (21,08)** : `explode` 0 → 1 (≈ 0,9 s, `power2.out`), recul par rapport jusqu'à `VIEW.exploded` : la cuve soulevée en verre pâle, la fosse, la porte, le canal, la chambre, la piscine — six morceaux nets sur le halo | l'ensemble ≈ 80 % de la hauteur |
| 22,40 → 24,16 | « La fosse, en béton sacrificiel : » | la caméra vient au revêtement de la fosse ; `litPit` 1 ; `co.add` « Béton sacrificiel » | fosse ≈ 50 % |
| 24,51 → 25,36 | « fait pour être mangé. » | sur `mange` (25,04) : `eaten` 0 → 0,3 — la face intérieure s'écaille (sans corium) | idem |
| 25,84 → 27,36 | « Au centre, la porte fusible. » | `litPit` 0, la caméra descend à la porte (gros plan, `CLOSE`) ; `litPlug` 1 ; `co.add` « Porte fusible » ; `punch` sur `fusible` (26,96) | porte ≈ 40 % |
| 27,72 → 28,56 | « Puis un canal. » | `litPlug` 0, `litChannel` 1, la caméra suit le canal dans le sens du flux ; `co.add` « Canal » | canal ≈ 50 % |
| 28,84 → 30,48 | « Et au bout… la chambre d'étalement. » | `litChannel` 0, arrivée sur la chambre ; sur `chambre` (29,76) `litChamber` 1 ; `co.add` « Chambre d'étalement ». Couverture : `chambre` (à proposer) | chambre ≈ 70 % |
| 30,92 → 31,97 | « À +sec+. » | la chambre vide, et dans le même cadre l'eau, à part, dans sa piscine écartée : « à sec » se lit par l'écart ; `punch` sur `sec` (31,04) si `fusible` n'en a pas eu | chambre ≈ 60 %, piscine au bord |

**Couture de sortie** : l'éclaté encore ouvert sur la chambre ; l'acte 2b coupe sur la chambre assemblée (raccord sur la dalle).

## acte2b.js

02 AUTOPSIE (2/2), `toprincipe` 31,97 → `tozero` 50,00. Coupe d'entrée : `cut(t.toprincipe, SET.BENCH, VIEW.heap, { ...BENCHED, litChamber: 0.4 })`.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 32,09 → 32,60 | « Pourquoi l'étaler ? » | sur la dalle, un tas de corium se pose (`mass` 0 → 1, `spread` 0) | tas ≈ 40 % |
| 33,07 → 35,16 | « Le cœur fondu chauffe dans toute son épaisseur. » | sur `chauffe` (33,80) : `arrows` 0 → 1 — la chaleur de tout son volume descend dans la dalle | tas + flèches ≈ 60 % |
| 35,56 → 37,00 | « Épais, il perce le sol. » | sur `epais` (35,56) les flèches s'allongent, la dalle rougit dessous ; `punch` sur `perce` (36,28) | idem |
| 37,40 → 40,12 | « Étalé sur 170 mètres carrés, il devient mince : » | sur `etale` (37,40) : `spread` 0 → 1 jusqu'à `mincep` (39,84) ; la caméra monte en plongée vers `VIEW.sheet` ; `chip-170` de `m170` (38,00) à 40,3 | galette ≈ 80 % |
| 40,41 → 41,40 | « sa chaleur se +partage+. » | les flèches courtes et espacées, la dalle sombre dessous ; `punch` sur `partage` (41,00) | idem |
| 41,76 (coupe) → 42,68 | « Il n'a jamais servi. » | **coupe** vers l'usine au repos (`cut(t.torepos, SET.PLANT, VIEW.graze, { ...STAGED, belly: 0, core: 0.7, mood: 0 })` : le réacteur qui tourne normalement, rien de rouge) ; `chip-jamais` 41,9 → 43,0 | chambre ≈ 70 % |
| 43,08 → 45,00 | « Il *dort*, à sec, à côté de la cuve. » | vue rasante sur la dalle vide et froide, la cuve au fond, sur sa fosse ; rien ne bouge ; `punch` sur `dort` (43,20) | dalle ≈ 60 %, cuve ≈ 15 % |
| 45,44 → 47,00 | « Dans le bâtiment, une piscine attend. » | la caméra monte vers la piscine (`VIEW.pool`) ; `litPool` 0,6 | piscine ≈ 60 % |
| 47,36 → 47,96 | « Vannes fermées. » | sur une vanne (`VIEW.valve`) ; `litValves` 0,6 | vanne + déclencheur ≈ 40 % |
| 48,36 → 50,00 | « Et personne ne viendra les +ouvrir+. » | on tient : le déclencheur posé sur la dalle, la vanne close ; rien ne bouge — la tension monte vers l'acte 3 | idem |

## acte3.js

03 RÉPONSE, `tozero` 50,00 → `toverdict` 65,94. En coupes, un plan par souffle. `mood` 1 jusqu'à `recouvre`.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 50,00 (coupe) → 51,40 | « La porte fusible *cède*. » | **coupe** (raccord : de la vanne au repos au feu) : `VIEW.plugTop`, `{ ...STAGED, belly: 0.6, pour: 0.5, pit: 1, eaten: 0.9, fume: 0.6, plug: 0.5 }` ; sur `cede` (51,08) : `plug` → 1, la porte s'affaisse et s'ouvre, `flow` 0 → 0,2, le bain descend un peu ; `punch` | porte ≈ 45 % |
| 51,55 (coupe) → 53,40 | « Le cœur fondu s'engouffre dans le canal. » | **coupe** dans le sens du flux : `VIEW.channel`, travelling rapide à hauteur du flux, qui suit la tête ; `flow` 0,2 → 1 de `engouffre` (52,36) à `droit` + 0,4 | tête ≈ 25 % |
| 53,68 → 54,60 | « Droit vers la +chambre+. » | la tête arrive à la bouche sur `chambre` (54,28) ; la caméra sort au-dessus de la chambre vide | bouche ≈ 30 % |
| 55,13 (coupe) → 57,52 | « Il *s'étale*. En quelques dizaines de secondes. » | **coupe** : `VIEW.sheet` (plongée large) ; `mass` 0 → 1, `spread` 0,05 → 1 de `etale2` (55,36) à `mince` (59,12) : la mer orange part de la bouche et vient vers nous ; `punch` sur `etale2` ; le chrono court | chambre ≈ 85 % |
| 57,92 → 59,52 | « Une mer orange, mince. » | la galette touche les murets ; bourrelet brillant au bout ; tout s'immobilise sur `mince` | idem |
| 59,84 (coupe) → 61,28 | « Les vannes s'ouvrent… seules. » | **coupe** : `VIEW.valve` ; le bord de la galette sur le déclencheur : `triggers` → 1 juste avant `trigger` (59,99), `valves` 0 → 1 sur « s'ouvrent » (60,32), `litValves` 1 ; `chip-vannes` 60,3 → 61,7 | vanne + déclencheur ≈ 45 % |
| 61,55 (coupe) → 62,72 | « Plusieurs minutes passent. » | **coupe** sur la piscine et la chambre dans un cadre ; le temps passe : la croûte fonce un peu (`cool` 0 → 0,2), des têtes veille partent dans les conduites (`water` 0 → 0,25) ; le chrono file jusqu'aux minutes | |
| 63,08 → 64,48 | « L'eau descend, sans pompe. » | la caméra suit l'eau vers le bas : `water` 0,25 → 0,8 (canal central, puis elle remonte par les bords) ; `chip-pompe` de `pompe` (64,16) à 65,2 | eau ≈ 40 % |
| 64,76 → 65,94 | « Et le +recouvre+. » | `VIEW.sheet` : `water` → 1, `steam` 0 → 1 puis retombe, `cool` → 0,6 ; **sur `recouvre` (64,96)** : `mood` 1 → 0, `guard` → 1 ; l'en-tête passe à « Sous l'eau » ; `punch` | chambre ≈ 85 % |

## fin.js

`toverdict` 65,94 → 93,43. Chute → ce qui est dû et le commentaire → like → prochain dossier → boucle.

| repère | la voix | l'image |
| --- | --- | --- |
| 65,94 (coupe) → 68,70 | « Voilà le secret : on ne noie *pas* tout de suite un cœur fondu. » | **coupe** : `VIEW.pitSide`, la fosse pleine, épaisse (`{ ...STAGED, pit: 1, eaten: 0.8, fume: 0.5, belly: 0.4, mood: 1 }`) ; `retitle` (montre à `chute` + 0,1, barre sur `verdict` 67,42) ; `D.verdict(t.pas)` |
| 69,07 → 71,02 | « Trop tôt, l'eau peut exploser en vapeur. » | sur `trop` (69,07) : `blast` 0 → 0,3 (de l'eau versée), sur « exploser » (70,14) → 1, `gel` 0,15 bref : c'est une hypothèse, rien de plus fort qu'une bouffée |
| 71,20 (coupe) → 72,06 | « L'eau vient +après+. » | **coupe** : `VIEW.sheet`, la galette étalée, l'eau qui la recouvre calmement, la dalle passe au vert (`guard` 1, `mood` 0) ; `retitle` bascule sur `apres` (71,74), sort à `tocta` − 0,42 |
| 72,74 (coupe) → 77,98 | « Et l'eau, qui l'a ouverte ? Le cœur fondu lui-même : en s'étalant, il détruit les déclencheurs des vannes. » | **coupe** retour en arrière : `VIEW.trigger`, la galette qui arrive (`mass` 1, `spread` 0,85, `triggers` 0, `valves` 0) ; `chip-reponse` 74,4 → 77,9 ; sur `detruit` (76,70) : `spread` → 1, `triggers` → 1, `valves` → 1, l'eau part (`water` → 0,3) |
| 78,30 (coupe) → 82,06 | « En commentaire : le réacteur près de chez toi… un EPR, ou pas ? » | la chambre noyée, calme (`water` 1, `cool` 1, `guard` 1) ; `duelCall` (`from` `commentaire` − 0,5, `aAt` `epr2` 81,18, `bAt` `pasq` 81,98, `to` `like` − 0,3) ; le film ne répond pas |
| 83,20 → 85,56 | « +Like+ : pour quelqu'un qui croit qu'on éteint tout avec de l'*eau*. » | la galette refroidie sous l'eau, trois quarts, le système en vert ; un filet d'eau tombe encore du canal central ; `likeCall` |
| 85,97 (coupe) → 91,55 | « Abonne-toi : prochain dossier, 73 pompiers pris au piège par le feu… et aucun mort. » | **coupe** : `VIEW.teaser` (`{ ...STAGED, teaser: 1, mood: 1 }`) : les abris, le cercle de feu qui se referme ; `nextFile` (`showAt` `prochain` − 0,15, `factAt` + 0,7, `hideAt` `toloop` − 0,38, rail de `abo` + 0,1 à `abo$` + 0,15) |
| 91,55 → 93,43 | « Et tout recommence quand… » | `cut(t.toloop, SET.PLANT, { ...POSE0, d: POSE0.d + 40 }, { ...FIRST })` puis `D.loop({ at, rewindAt: rewind, fromD })` : la dernière image est la première |

## La première image — quatre candidates

À tirer sur les **vrais décors** (après décors et habillage), une planche de quatre avec l'en-tête, à 0,04 s, puis 0,3 et 0,7 s pour la gagnante. Notes sur les six points de `docs/recette-agents.md` (événement · perspective basse · menace derrière · forme reconnue 40 % · système petit mais lisible · bouge par son sujet), données sur bouchons.

- **(a) Du fond de la fosse** (`POSE0`, vue sur bouchon) — 6/6 en puissance : la goutte tombe (1, 6), contre-plongée (2), le ventre rouge derrière et au-dessus de la porte (3), le dessous d'une cuve, énorme, vu d'où personne ne le voit (4 — risque : se lit-elle comme « réacteur » de dessous ?), la porte en bas (5). Risque : le milieu du cadre noir (la paroi de la fosse).
  `{ "at": 0.04, "label": "a fosse", "pose": { "tx": 0, "ty": 140, "tz": 0, "d": 290, "az": -35, "el": -20, "fov": 64, "shift": 0, "side": 0, "dof": 0 } }`
- **(b) Au-dessus de la fosse** (`VIEW.overPit`) — 4,5/6 : la goutte tombe sur la porte au centre du sol, le ventre rouge au bord haut ; mais plongée (2 ✗) et une forme peu reconnue (4 ½). Sur bouchon, l'intérieur de la calotte voilait tout : à revoir après `corium.js`.
  `{ "at": 0.04, "label": "b plongée", "pose": { "tx": 0, "ty": 40, "tz": 0, "d": 760, "az": -35, "el": 66, "fov": 40, "shift": 80, "side": 0, "dof": 0 }, "state": { "pour": 0.3 } }`
- **(c) La chambre vide, la cuve derrière** (`VIEW.chamberLow`) — 4/6 : basse (2), la cuve rouge debout derrière la chambre vide (3, 5 : la chambre est grande), le filet qui tombe dans la fosse (1) ; mais la cuve fait moins de 40 % (4 ✗) et le sujet qui bouge est petit (6 ½). La plus « dossier ».
  `{ "at": 0.04, "label": "c chambre", "pose": { "tx": 0, "ty": 150, "tz": 400, "d": 2900, "az": -14, "el": 8, "fov": 40, "shift": 120, "side": 0, "dof": 0 }, "state": { "pour": 1 } }`
- **(d) Le large** (`VIEW.section`) — 2,5/6 : tout le chemin en un cadre, la cuve rouge en haut (3, 5) ; carte vue d'en haut (2 ✗), rien de grand (4 ✗), le mouvement minuscule (6 ✗). Témoin.
  `{ "at": 0.04, "label": "d large", "pose": { "tx": 0, "ty": 250, "tz": 1000, "d": 5600, "az": -18, "el": 22, "fov": 34, "shift": 120, "side": 0, "dof": 0 }, "state": { "pour": 1, "pit": 0.2 } }`

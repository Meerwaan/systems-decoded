# 008 · Paratonnerre — le plan de mise en scène

La voix est enregistrée : tous les instants ci-dessous sont réels (`npm run script -- 008` les redonne). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js`) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — voir `kit/template/src/acte*.js` pour la forme, `kit/lib/direct.js` pour l'outillage, `kit/lib/blocks.js` pour les blocs (`benchCut`, `retitle`, `likeCall`, `nextFile`, `commentCall`).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration** : ce qu'elle dit se passe à l'écran pendant qu'elle le dit, sur le mot. Les instants se lisent dans le script (`D.times({ nom: "beat:mot" })`) ou dans les repères d'`episode.json` (`cues`, déjà écrits — image et son lisent les mêmes : n'en change pas le sens, ajoute les tiens dans ton journal si besoin).
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout ce que l'image exige (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe.
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,12–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette ou un panneau a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (un seul panneau à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan avec l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; pas de secousse (`jolt`) sur un plan large plein de lignes ; un quart de tour en une seconde est une coupe.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (60–110 de près sur la tige, ≈ 700 pour la maison entière).
- Le temps est arrêté (`fall` 0, gouttes suspendues) du début jusqu'à « Et toi ? » : seule la foudre avance, sur les mots.
- Couleurs : `mood` 1 (signal) tant que la foudre menace ; 0 (veille) sur l'établi et après « Contact ».

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-toi` · `chip-rod` (Sur ton toit / Paratonnerre) · `chip-out` (Toi) · `chip-sans` (Sans / Paratonnerre) · `chip-bond` (1 bond ≈ 50 m) · `#stamp` (Filmé · 40 000 images par seconde · INPE, Brésil · Publié en 2022) · `chip-rep` (La tige / Première) · `chip-temp` (Canal ≈ 30 000 °C) · `chip-speed` (Il remonte ≈ 100 000 km/s) · `chip-cuivre` (Le cuivre / Tiédit à peine) · `chip-terre` (Dispersé dans / La terre) · `chip-safe` (Toi / Rien senti) · `chip-arbre` (L'arbre / Jamais) · `#retitle`, `#net`, `#next`, `#cta-field`, les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

## 01 · MENACE — `acte1.js` (0 → 15,48)

| instant | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, état `FIRST` : depuis la pelouse, en contre-plongée — la maison, toi à la fenêtre, la tige, et au-dessus le traceur arrêté parmi les gouttes suspendues. **La caméra bouge dès l'image 1.** À 0,12 s le traceur fait un bond (`leader` un cran de plus : c'est lui qui arrête le pouce). |
| 0,35 – 1,6 | « Un millième de seconde. » | la caméra monte vers la tête du traceur |
| 1,81 `toroof` – 3,19 | « Et la foudre touche ton toit. » | elle redescend le long de sa route jusqu'au toit, puis toi à la fenêtre (`chip-toi`, bref) |
| 3,74 – 6,9 | « Tu ne sentiras rien : là-haut, une tige de métal va l'appeler. » | de toi, elle remonte la façade le long du fil jusqu'au sommet de la tige (4,83 `torod`) ; `chip-rod` sur « tige de métal » ; sur « appeler » (6,26 `glow`) la lueur du sommet grandit (`charge` 0,35 → 0,9) |
| 7,13 `toout` – 9,19 | « Sauf le jour où la tige… c'est toi. » | **coupe** : toi, dehors, seul sur la pelouse (`out` 1), filmé d'en bas, le ciel au-dessus ; sur « c'est toi » (8,59 `hair0`) un filament pâle monte de ta tête (`hair` 0 → 1) ; `chip-out` |
| 10,11 `tosans` – 14,93 | « Sans elle, la foudre cherche la terre à travers ta maison : tes fils, tes tuyaux… toi. » | **coupe** : la maison SANS paratonnerre (`rod` 0, `out` 0, `hair` 0), `chip-sans` en zone haute. 11,00 `hit` : la foudre entre par la cheminée (`whatif` part de 0, `fire`) ; le courant court dans la charpente, les fils (13,19), les tuyaux (13,83) ; la caméra pousse vers toi et la prise : sur « toi » (14,71 `reach`) l'arc te cherche (`whatif` → 1) |
| 15,03 `back` | *(silence)* | le film revient en arrière en 0,4 s : `whatif` → 0, `fire` → 0 |

L'acte 2 coupe à 15,48 (`totip`).

## 02 · AUTOPSIE — `acte2.js` (15,48 → 28,70)

| instant | la voix | l'image |
| --- | --- | --- |
| 15,48 `totip` | « Alors… » | **coupe** : le sommet de la tige sur la maison (`VIEW.tip`, `rod` 1, `whatif` 0), temps arrêté. La maison et le ciel s'effacent autour d'elle (`shell`, `sky`, `rain`, `inside` → 0, `mood` → 0) |
| 16,19 `tobench` | « …on l'ouvre. » | `benchCut` : la même tige, sur l'établi, à la même place de l'image (`origin: ROD.tip`, vers `KIT.tip` : `moved(VIEW.tip, ROD.tip, KIT.tip)`) — un `litRod` bref sur la coupe, la tige est verte sur la maison. 16,33 `explode` : le kit s'ouvre en rangée (`explode` 0 → 1 en 1,2 s), la caméra recule par rapport jusqu'à `VIEW.exploded` |
| 17,95 `p1` | « Une tige. » | `VIEW.rodPart`, `litRod` ; légende « Tige » / « Capture » (`co.add`) |
| 18,94 `p2` – 20,9 | « Un fil de cuivre, gros comme un crayon. » | `VIEW.wirePart`, `litWire` ; légende « Fil de cuivre » / « Ø 8 mm » |
| 21,18 `p3` | « Un piquet dans la terre. » | `VIEW.stakePart`, `litStake` ; légende « Piquet de terre » / « 2,5 m dans le sol » |
| 22,63 `whole` | « C'est tout. » | recul sur la rangée entière, les trois pièces éteintes, rien d'autre : pas de pile, pas de puce, rien ne bouge |
| 23,76 `toground` – 28,09 | « Sous l'orage, le sol se charge… et cette charge grimpe jusqu'au sommet de la tige. » | **coupe** : la maison, au pied du piquet (`VIEW.earth`), temps arrêté (`STAGED`, `charge` 0). 24,71 `ground` : le sol s'allume autour du piquet. 26,37 `climb` : la charge grimpe le fil (`charge` 0 → 1) et **la caméra la suit** du piquet au sommet — le chemin que le courant prendra dans l'autre sens à l'acte 3. 27,19 `top` : arrivée sur le sommet (`VIEW.tip`), `field` 0 → 1 : le champ se resserre sur la pointe |

L'acte 3 coupe à 28,70 (`tozero`).

## 03 · RÉPONSE — `acte3.js` (28,70 → 59,05)

L'horloge de l'en-tête repart (T−1,00 ms → T+0,00 à « Contact ») : elle est câblée dans `main.js`, comme le compteur de courant. `setAct(tl, 3, zero)`.

| instant | la voix | l'image |
| --- | --- | --- |
| 28,70 `tozero` – 32,19 | « L'éclair descend par bonds de cinquante mètres, à l'aveugle : il ne vise rien. » | **coupe** : le ciel large, depuis la pelouse (`STAGED`). Trois bonds, un par repère : 29,10 `b1`, 29,67 `b2`, 30,81 `b3` (`leader` monte d'un cran à chaque fois, vite : 0,12 s, puis tient) ; `chip-bond` accrochée à la tête sur « bonds de 50 m ». La caméra descend avec la tête |
| 32,73 `toanswer` – 37,51 | « À quelques dizaines de mètres, tout ce qui dépasse lui répond : l'arbre, la cheminée, l'antenne. » | 33,23 `b4` : encore un bond. 34,03 `wide` : **coupe** au niveau du toit, large : l'arbre, la cheminée, l'antenne dans le cadre, la tête du traceur au-dessus. Chacun répond sur son mot : 35,67 `a1` `upTree`, 36,31 `a2` `upChimney`, 36,91 `a3` `upAntenna` (0 → 1). `#stamp` en zone haute de 33,3 à 37,6 (le tampon se pose, puis ses trois lignes) |
| 37,85 `torodup` – 41,35 | « La tige aussi. Elle dépasse tout le reste : c'est la sienne qui le rejoint. » | **coupe** : du pied du mât, en contre-plongée le long de la tige, le traceur au-dessus. 38,06 `rise` : sa réponse part (`up` 0 → 0,9 jusqu'à 41,2), verte, vive ; dernier bond du traceur (`leader` → 1) ; `chip-rep`. Sur « rejoint » (41,11 `join`) il ne reste qu'un souffle entre les deux têtes |
| 42,39 `trigger` – 46,75 | « Contact. Trente mille ampères. Près de trente mille degrés : cinq fois la surface du Soleil. » | **coupe sur le mot** : large, la maison et tout le canal. `up` → 1, l'éclair qui a un endroit à la jonction, puis l'arc en retour monte (`strike` 0 → 1 en 0,5 s, `hot` 1,5) : tout le canal est blanc, le nuage s'illumine, la maison prend la lumière. `hot` décroît lentement (→ 0,6 à 46,7), avec une re-pulsation vers 45,6 (un arc suivant). `chip-temp` sur « degrés » (44,25 `heat`). `#flash` ≤ 0,08 |
| 47,29 `toreplay` – 51,35 | « Et l'éclair que tu vois ne tombe pas : il remonte, au tiers de la vitesse de la lumière. » | **coupe** : on le rejoue, plus lentement. Du sommet de la tige, le canal pâle (`strike` 0, `hot` 0,3). 49,24 `up2` : le front remonte (`strike` 0 → 1 en 1,6 s, `hot` → 1,2) et **la caméra le suit** vers le nuage ; `chip-speed` en zone haute |
| 51,70 `todown` – 55,59 | « Le courant, lui, descend : le fil, le piquet… la terre. » | **coupe** : le sommet de la tige. 52,63 `flow` : `flowOn` 1,5, `flow` 0 → 1 jusqu'à 55,2 — la tête descend le fil, **la caméra la suit** (le chemin de l'acte 2, à l'envers) : le toit, la façade (`chip-cuivre` sur « le fil », 53,62), le joint, le sol, le piquet (54,26). 55,17 `earth` : `earth` 0 → 1, les anneaux dans la terre, `chip-terre` |
| 55,94 `toyou` – 58,23 | « Et toi ? Tu as sursauté. C'est tout. » | **coupe** : toi à la fenêtre, de près, intact. Le temps repart : `fall` 1, `drop` qui grandit (la pluie tombe), `mood` 0, `gel` 0,16, `flowOn` → 0, `hot` → 0,15. 57,03 `jump` : le tonnerre (une secousse légère de la caméra est permise ici) ; `chip-safe` |

`fin.js` coupe à 59,05 (`toverdict`).

## Chute, appels à l'action, boucle — `fin.js` (59,05 → 86,9)

| instant | la voix | l'image |
| --- | --- | --- |
| 59,05 `toverdict` – 63,27 | « Un paratonnerre n'éloigne pas la foudre. Elle allait tomber : il a seulement choisi où. » | **coupe** : la maison entière sous la pluie qui tombe (`fall` 1), la tige allumée, le canal éteint au-dessus (`hot` 0,12), lumière veille. `retitle` : « Éloigne la foudre » arrive à 59,3, barré sur « pas » (60,31 `verdict`), remplacé par « Choisit où » (63,06 `where`), sorti à 63,9. `D.verdict(verdict)` |
| 64,32 `tocta` – 67,27 | « Like. Ça remontera chez quelqu'un qui s'abrite encore sous un arbre. » | **coupe** : l'établi, le kit en rangée (`BENCHED`, `explode` 1), qui tourne lentement. `likeCall` (5 tuiles, « n personnes ») |
| 67,80 – 73,11 | « Abonne-toi. Prochain dossier : ta cuisine. Entre ton visage et les ondes… une plaque pleine de trous. » | la caméra recule et descend le kit ; `nextFile` (panneau à « Prochain », le fait à « plaque ») |
| 73,46 `toout2` – 81,03 | « Et si la tige, c'est toi ? Dehors, tes cheveux se dressent : ton corps lui répond. Cours à l'abri. En commentaire : sous l'orage, tu vas où ? » | **coupe** : toi dehors (`STAGED`, `out` 1, temps arrêté), de près, d'en bas. 75,93 `hair` : `hair` 0 → 1. 78,04 `run` : la caméra quitte toi et file vers la maison (l'abri) — un seul mouvement. 78,81 `ask` : `commentCall` (la question s'affiche ; la réponse « LA VOITURE » se tape à 81,8, sur les premiers mots de la boucle : `chars: 10`) |
| 81,61 `toloop` – 86,13 | « Une voiture, une maison. Jamais l'arbre. Sous l'orage, tout se joue en… » | **coupe** : la maison (l'abri), `out` 0, `hair` 0. 83,39 `never` : la caméra glisse vers l'arbre, `upTree` 0 → 1, `chip-arbre`. 84,44 `rewind` : `D.loop({ at: toloop, rewindAt: rewind, fromD })` — retour à `POSE0` et à `FIRST` ; `upTree` revient à 0 tout seul |

La dernière image est la première : `commit` prévient dans la console si un nombre n'est pas revenu.

## Ce que les décors savent faire (rendu par ceux qui les ont construits)

- **Le traceur** (`bolt.js`) : 14 bonds ; le bond k est posé quand `leader` = k / 14. Entre deux valeurs le bond attend puis part dans les derniers 38 % de l'intervalle : **un tween linéaire (`"none"`) qui finit sur le mot le fait tomber sur le mot**. Première image : 9/14 (`LEADER.first`) ; le bond de l'accroche l'amène à 10/14 (`LEADER.held`), où le temps s'arrête (`STAGED`). Acte 3 : `b1` → 11/14, `b2` → 12/14, `b4` → 13/14, le dernier pendant « La tige aussi… » → 1. (`b3`, « à l'aveugle », n'est pas un bond : la tête hésite.)
- `up` : le traceur de la tige, continu, de `ROD.tip` à la jonction. `upTree`, `upChimney`, `upAntenna` : 1,5 à 2,3 m seulement — il leur faut un cadre serré quand la voix les nomme. `hair` : les cheveux dressés et un filament de 2,5 m sur toi, dehors (`out` 1).
- `strike` : de 0 à 0,214 le front monte le traceur de la tige, puis le canal jusqu'au nuage ; il éteint les deux têtes. `hot` : l'éclat du canal frappé, du nuage, du sol, des gouttes ; à 0, une image frappée est identique à une image sans canal.
- `cloud` : la lueur signal du nuage (elle s'efface seule sous `hot`). `fall` : la longueur des traits de pluie (0 : gouttes suspendues) ; `drop` : les centimètres tombés (fais-le grandir quand le temps repart, ~800 cm par seconde de film).
- **Le paratonnerre** (`model.js`) : `flow` est linéaire en longueur de fil — pied du mât ≈ 0,21, bord du toit ≈ 0,52, sol ≈ 0,81, pied du piquet 1. `earth` : des anneaux, tous éteints à 1 ; le piquet reste allumé tant qu'`earth` n'est pas remis à 0. `field` : les douze lignes sont toutes resserrées vers 0,75. De près sur la tige, `fs` entre 60 et 110, sinon les ombres du mécanisme disparaissent.
- **Le kit** : `explode` ouvre en RANGÉE (tige · fil · piquet côte à côte, en travers d'une caméra à az −40). `KIT.tip`, `KIT.open` (le milieu de la rangée), `KIT.openTip`. Assemblé, c'est une colonne maigre : les appels à l'action se jouent sur la rangée.
- **La maison** (`house.js`) : `whatif` 0 → 1 est minuté, heures dans `world.house.T` : `roof` 0,10 · `box` 0,17 · `pipeTop` 0,36 · `jets` 0,45 · `unit` 0,56 · `lamp1` 0,67 (la lampe derrière toi saute) · `socket` 0,87 · `you` 0,92 (l'arc de la prise te cherche) · tout brûle 0,94–1. Pendant le « sans paratonnerre », `leader` vaut 0 (pas de traceur dans le ciel : la foudre est déjà dans la maison) et `rod` 0. Plan d'intérieur : `shell` 0,5 + `inside` 1.
- **Ancres** — `world.house.A` : `chimneyTop, antennaTop, treeTop, youHead, outHead, socket, shower, window, ridgeEnd, unit` · `world.rod.A` : `tip, foot, joint, stakeHead, stakeFoot, mid, sleeve` · `world.kit.A` : `tip, wire, joint, stake, sleeve, point` · `world.storm.A` : `leaderTip, junction, cloud, treeUp, chimneyUp, antennaUp, upTip, hairTip, front` (le front de l'arc en retour).
- **Toi dehors** est entre la maison (l'abri) et l'arbre (le piège) : `YOU.outside` = [900, 0, 520]. Un cadre peut tenir les trois.
- Les poses de départ sont dans `VIEW` (`world.js`) : `tip, exploded, rodPart, wirePart, stakePart, whole, run, earth, foot, wide, house, window, socket, sans, roof, bounds, answers, junction, stroke, outside`. Ce sont des points de départ : chaque acte affine les siennes avec `look` et les garde dans son fichier.
- Dans `look --file`, donne dans `state` tous les nombres que ton image exige ; un nombre tenu ne fuit plus dans l'image suivante.

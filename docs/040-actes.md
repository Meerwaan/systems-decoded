# 040 · L'abri anti-feu — le plan des actes

Architecte, 05/11. Voix réelle 88,07 s (turbo, `ouvre~3`) : tous les instants ci-dessous sont lus sur `npm run script -- 040` (mots exacts), à retrouver par les repères de `episode.json` → `cues` ou `D.times({ x: "beat:mot" })`, jamais en dur. Quatre fichiers : `acte1.js` (0 → 17,62), `acte2.js` (17,62 → 41,83 : l'autopsie ET le repos), `acte3.js` (41,83 → 59,29), `fin.js` (59,29 → fin). Les squelettes en place construisent, ils ne sont pas les actes : chacun se réécrit en entier. Poses de `VIEW` réglées sur bouchons : partir de celles des journaux des décors (`docs/journal/040-*.md`) et de `docs/040-actes-maj.md` s'il existe (ses lignes priment).

## Ce qui vaut pour tous

- **La grille de rétention** (`docs/recette-actes.md`) : 0 → 0,5 s le sujet bouge (le front qui roule, l'ourlet qui bat, les braises), pas la seule caméra ; **jusqu'à 25 s, une coupe ou un geste toutes les 2 à 3 s, aucune plage lente de 2 s** (leçon du 039) ; un son dans le souffle qui suit chaque mot-clé (déjà posés dans `sfx` : ne pas en ajouter sur un mot).
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe ni à moins d'1 s d'un autre) : `accroche:dessus` 1,00 · `promesse:tête` 8,36 · `scene:piège` 11,66 · `principe:renvoie` 33,16 · `repos:lâche` 40,04 · `reponse:dessus` 48,56 · `chute:pas` 60,98 (verdict) · `comment:chaud` 73,18. `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **« Alors… on l'ouvre »** seule dans son plan : de 17,62 le temps s'arrête (le `hush` est posé, le vent tombe : `fire`, `embers` à 0 en 0,5 s), coupe sur l'établi à `tobench` 18,40 (`benchCut`, l'abri déplié seul sur son halo), **l'éclaté s'ouvre sur « on »** (`explode` 18,54).
- **Le chrono** (`clock`, en secondes depuis « Zéro ») : −25,43 à la coupe `toscene` 9,23 puis temps réel (« none ») → **−20,0 sur « Vingt » 14,66** → −16,26 à `tobench`. Figé pendant l'autopsie (main.js l'atténue de `tobench` à `rattrape`). L'acte 2 le rattrape de `rattrape` 39,44 (« Mais ») à −0,5 à `tozero` (power2.in) ; l'acte 3 coupe à 0 sur `tozero`, le fait courir en temps réel, puis le lance de 0:12 à **1:30:00 entre « Environ » 55,48 et « demie » 56,32**. L'accroche (FIRST) : +0:04. `abris` (0–73) : 0 à `toscene`, ≈ 9 à `tobench`, 73 à `tozero`.
- **La couleur** : `mood` 1 (signal) dans la crête tant que le feu menace, 0 sur l'établi ; dans la crête il passe à 0 **sur « Aucun brûlé » 58,21**, pas avant. Les rayons entrent signal et repartent veille.
- **Anti-parasites** : un quart de tour en une seconde est une coupe ; une coupe se pose 0,1 à 0,2 s avant sa phrase ; ce que la caméra frôle est invisible (`shell`, `you`, `crowd`) ; aucune flamme ni braise ne traverse l'en-tête (236–410) ou les sous-titres (1248–1488) quand un texte y est ; le sujet entre y 440 et 1160, rien d'important sous 1600 ni à x > 905 de 880 à 1760.
- **Les étiquettes** (`index.html`) : `chip-toi`, `chip-lieu` (« Idaho · 29 août 1985 / Butte Fire »), `chip-alu`, `chip-silice`, `chip-air`, `chip-fibre`, `chip-inner`, `chip-poids` (« 2 kilos »), `chip-colle` (« 260 degrés »), `chip-sol` ; une à la fois dans la zone haute. Toutes doivent être appelées (une étiquette jamais appelée reste affichée en haut à gauche).
- **À ne jamais montrer** : un cercle de feu fermé sur les 73 ; la feuille qui fond (elle rougeoie) ; « 73 intacts » écrit ; de l'eau ; un blessé. Toi : mannequin de verre, jamais en très gros plan, jamais la main seule.
- **La boucle** : la dernière image est la première (`D.loop`, `D.commit`) — fin.js revient à POSE0 et à FIRST.

## acte1.js

**01 MENACE, 0 → 17,62.** Part de POSE0 et FIRST, sans coupe. Couture de sortie : l'acte 1 ne tween plus rien après 17,62 ; sa dernière pose (`shake`) tient jusqu'à `tobench`.

| Instant | Voix | Plan (part du cadre tenue par le sujet) |
| --- | --- | --- |
| 0 → 1,96 | « Le feu te passe *dessus*. » | POSE0 : le dôme au premier plan (≈ 45 % de la largeur), le mur couché qui roule par-dessus ; `front` −4 → −1, `lean` 0,75 → 0,85 dès l'image 1 (le sujet bouge) ; la caméra glisse à peine (`glide` à vérifier à 0,3 et 0,7 s). Punch sur « dessus » 1,00. |
| 1,96 → 3,61 | « Et tu es sous une feuille d'+alu+. » | Geste : la caméra plonge vers l'ourlet (d × 0,7, el → 1) ; `heat` 0,7 → 0,9, la feuille rougeoie côté feu (dôme 60 %). |
| 3,61 | coupe | `under` (`cut` 1, `you` 1, `hands` 1) : sous la feuille, toi visage contre la terre, la lueur qui traverse sans percer (dôme coupé 70 %). |
| 3,71 → 4,92 | « Les +flammes+ peuvent la faire fondre. » | Geste sur « fondre » 4,64 : bouffée de chaleur sur la feuille (`heat` → 1, braises), la feuille tient. |
| 5,60 → 7,20 | « Pourtant, elle peut te garder en vie… » | La nappe fraîche s'allume veille au sol sur « garder » 6,52 (`cool` 0 → 1) ; `hot` 0,6 en haut. |
| 7,56 → 8,60 | « …sauf si tu lèves la *tête*. » | `head` 0 → 1 sur « lèves » 8,04 : la tête entre dans le rouge. Punch « tête » 8,36. `chip-toi` de 4,0 à 8,9. |
| 9,23 | coupe `toscene` | `crest` (le bout de la crête, bas, `crowd` 1, `deploy` 0, `fold` 1 sur ta pose, `front` −120) ; chrono −25,43 ; `chip-lieu` 9,5 → 12,6. Les silhouettes tiennent 50 % du cadre en profondeur. |
| 9,35 → 12,50 | « Autour de toi, 73 pompiers, pris au *piège* sur la crête. » | Sur « 73 » 10,18 les silhouettes s'éclairent une à une le long du sommet ; la caméra file le long de la crête. Punch « piège » 11,66. |
| 12,75 | coupe | `canyon` : par-dessus le bord, le flanc, le front qui monte (`front` −90 → −60). |
| 12,87 → 14,40 | « Le vent rabat les flammes sur vous. » | `lean` 0,3 → 0,8 sur « rabat » 13,22, braises qui montent vers la crête (`embers` 1). |
| 14,50 | coupe | `shake` : tes mains (toi à genoux, de trois quarts) tirent le paquet de son étui — `fold` 1 → 0,5 de « secondes » 14,90 à « déplier » 15,46 ; le paquet argenté claque au vent (30 % du cadre). Chrono −20,0 sur « Vingt » 14,66. |
| 14,66 → 17,14 | « [20] secondes pour déplier ton +abri+, au mieux. » | `deploy` des autres 0,05 → 0,15 derrière toi, `abris` → 9 ; le front monte encore. |

## acte2.js

**02 AUTOPSIE, 17,62 → 41,83** (« on l'ouvre », l'éclaté, le principe, le repos). Couture d'entrée : de 17,62 l'acte 2 éteint le vent (`fire`, `embers` → 0 en 0,5 s, `mood` 0) sur la pose `shake` laissée par l'acte 1 ; coupe `benchCut` à `tobench` 18,40, depuis `VIEW.system`, état `BENCHED` + `fold` 0. Couture de sortie : à `tozero` 41,83 l'acte 3 coupe ; le chrono doit valoir ≈ −0,5 et `abris` 73.

| Instant | Voix | Plan |
| --- | --- | --- |
| 17,67 → 18,40 | « Alors… » | La pose `shake` s'immobilise, le vent tombe, le silence (hush). |
| 18,40 | coupe `tobench` | `system` : l'abri déplié seul sur son halo, de trois quarts (60 % de la largeur), toi dessous en verre. |
| 18,54 → 20,30 | « …on l'ouvre. » | `explode` 0 → 1 sur « on » (1,2 s, les pages qui se décollent du dessus) ; la caméra recule vers `exploded` (tout l'éclaté dans le cadre, 70 % de la hauteur). |
| 20,30 → 22,90 | « Dehors, une feuille d'aluminium collée sur de la silice. » | `foilClose` (dof) : `litFoil` sur « aluminium » 21,16, la feuille se soulève d'un rien de sa toile sur « silice » 22,52 (le joint collé se voit). `chip-alu` puis `chip-silice`. Couche : 50 % du cadre. |
| 23,24 → 24,40 | « Dessous, une lame d'air. » | La caméra descend à `gapClose` : le vide clair entre deux couches, `litGap` sur « lame » 23,88. `chip-air`. |
| 24,80 → 25,90 | « Puis la fibre de verre… » | `fibreClose`, `litFibre` sur « fibre » 25,12. `chip-fibre`. |
| 26,21 → 28,16 | « …et une seconde feuille, tournée vers +toi+. » | `innerClose` : `litInner` sur « seconde » 26,48 ; sur « tournée » 27,32 la caméra passe sous la page et montre son reflet tourné vers toi (la silhouette). `chip-inner`. |
| 28,50 → 29,28 | « Pourquoi ça marche ? » | Les pages se referment (`explode` → 0) et la coupe s'ouvre (`cut` → 1), caméra vers `section` (profil, l'abri 60 % de la largeur, la source à gauche hors champ). `mood` reste 0, rayons signal. |
| 29,62 → 32,10 | « Le feu t'envoie sa chaleur par +rayonnement+, comme le soleil. » | `rays` 0 → 1 de « rayonnement » 30,84 : dix traits qui arrivent de la gauche sur la feuille. |
| 32,41 → 34,50 | « Ce miroir en renvoie plus de [9] sur [10]. » | `bounce` 0 → 1 de « renvoie » 33,16 à « dix » 34,24 : neuf traits rebondissent et repartent veille. Punch « renvoie ». |
| 34,81 → 36,04 | « La lame d'air freine le reste. » | `leak` 0 → 1 sur « freine » 35,44 : le dixième entre, pâlit dans la lame d'air, s'éteint avant toi (gros plan léger sur la lame, dof). |
| 36,30 | coupe | `packBench` : `fold` 1, le pain de mie dans son étui sur le sac (40 % du cadre). |
| 36,49 → 39,08 | « Plié sur ton sac, il pèse [2] kilos : un pain de mie. » | `chip-poids` de « kilos » 38,04 ; geste : l'étui se pose / se cale sur le sac. |
| 39,30 | coupe | `glueClose` (dof) : le coin de l'abri déplié (`fold` 0), le joint alu-toile. |
| 39,44 → 41,48 | « Mais sa colle lâche vers [260] *degrés*. » | `glue` 0 → 1 sur « lâche » 40,04 (fumée, le coin se soulève) ; `chip-colle` ; **le chrono se rattrape** de « Mais » 39,44 (−16,26 → −0,5, power2.in), `abris` 9 → 73. Punch « lâche ». |

## acte3.js

**03 RÉPONSE, 41,83 → 59,29.** En coupes, un plan par souffle. Couture d'entrée : coupe à `tozero` 41,83, état complet (`STAGED` + `clock` 0, `abris` 73). Couture de sortie : à `toverdict` 59,29 fin.js coupe sur l'établi ; `mood` déjà 0 depuis 58,21.

| Instant | Voix | Plan |
| --- | --- | --- |
| 41,83 | coupe `tozero` | `zeroWide` : ton dôme au premier plan depuis +x, le front qui arrive au bord de la crête (`front` −25). Chrono 0:00 (signal, l'acte grossit l'horloge comme le modèle). |
| 41,95 → 43,80 | « *Zéro*. Le front monte sur la crête. » | `front` −25 → −6 sur « monte » 43,00 : le mur franchit le haut ; `lean` 0,85. Dôme 35 %, le mur 50 %. |
| 43,90 | coupe | `inside` (`cut` 1) : toi dans la coupe, de profil bas. |
| 44,07 → 45,80 | « À plat ventre, le visage dans la terre. » | Pieds vers le feu (la lueur côté −z), visage au sol ; push lent. |
| 46,20 → 47,24 | « Tes mains plaquent les +bords+. » | `hands` 0 → 1 sur « plaquent » 46,60 : mains et bottes écrasent l'ourlet, sangles tendues (jamais la main seule : tout le corps dans le cadre). |
| 47,71 | coupe | `over` : bas, au flanc du dôme, le front qui roule dessus (`front` −3 → +6). Le dôme 45 %. |
| 47,83 → 48,96 | « Le feu te passe *dessus*. » | Punch « dessus » 48,56. `heat` 0,9. |
| 49,39 → 50,64 | « L'alu renvoie le rayonnement. » | `rays` 1 dans la crête, `bounce` 0 → 1 sur `trigger` 49,75 : toute la nappe rebondit en veille sur la feuille. |
| 50,80 | coupe | `shovelClose` (dof) : ta pelle à côté du dôme. |
| 50,92 → 52,96 | « À côté, les manches de pelle se consument. » | `char` 0,3 → 0,95 de « pelle » 52,16 : le manche brûle jusqu'au fer, l'ourlet argent au bord du cadre. |
| 53,25 | coupe | `mouth` (`cut` 1, dof) : ta bouche au ras du sol dans la nappe verte (`cool` 1), le rouge plus haut. |
| 53,36 → 55,20 | « Dessous, tu respires l'air du sol. » | `chip-sol` de « respires » 54,08 ; la nappe verte ondule à peine avec le souffle. |
| 55,48 → 56,48 | « Environ une heure et demie. » | Chrono 0:12 → 1:30:00 ; le rouge se retire (`hot` → 0,2), le front s'éloigne (`front` → 60). |
| 56,70 | coupe | `back` : le long de la crête depuis ton côté −x, la crête noircie (`burn` 1), le front parti en contrebas. |
| 56,84 → 58,72 | « [73] abris. Aucun +brûlé+. » | Long recul (`shot`, rapport `fromD`) : les 73 coques d'argent qui s'égrènent ; `mood` 1 → 0 sur « Aucun » 58,21 (le relâchement). |

## fin.js

**59,29 → 88,07** : chute → ce qui est dû et la question → like → prochain dossier → boucle. Couture d'entrée : coupe `toverdict` 59,29 sur l'établi (`section`, `BENCHED` + `cut` 1, `rays` 1, `bounce` 1). Sortie : la boucle (`toloop` 86,10, `rewind` 87,12) revient exactement à POSE0 et FIRST.

| Instant | Voix | Plan |
| --- | --- | --- |
| 59,41 → 62,86 | « Voilà son secret : il n'encaisse *pas* la chaleur rayonnée. Il la +renvoie+. » | La coupe sur son halo, les neuf rayons qui rebondissent encore ; `retitle` « Il encaisse » barré sur « pas » 60,98, `D.verdict` 60,98 ; « Il renvoie » sur « renvoie » 62,46. Kicker « Son secret ». |
| 63,26 → 65,26 | « Une flamme collée trop longtemps… et il lâche. » | Le titre sorti à 63,1 ; `lick` 0 → 1 sur « flamme » 63,42 (une seule langue plaquée sur le coin) ; `glue` puis `hole` 0 → 1 jusqu'à « lâche » 65,02 : la chaleur entre (`hot` monte). La limite, sur la pièce. |
| 65,93 | coupe `tocta` | `back` (la crête noircie, les dômes) ; `chip-lieu` 66,1 → 70,4. Aucun chiffre de morts à l'image. |
| 66,05 → 70,46 | « En Idaho, sans zones dégagées ni abris, au moins soixante seraient morts, estiment les enquêteurs. » | Lent travelling le long des coques. |
| 70,60 | coupe | `inside` (`cut` 1, `cool` 1, `hot` 1) : toi dans la coupe. |
| 70,85 → 74,30 | « Et ta tête ? Lève-la, et tu respires l'air chaud : le plus dangereux. » | `head` 0 → 1 sur « Lève » 71,74 : la bouche quitte le vert, entre dans le rouge. Punch « chaud » 73,18. |
| 74,50 | coupe | `duo` : les deux couchés côte à côte, le front en contrebas (`front` −40). |
| 74,69 → 77,18 | « En +commentaire+ : pieds vers le feu… ou *tête* ? » | `duelCall` de 74,69 : « Pieds au feu » sur `pieds` 75,71, « Tête au feu » sur `outete` 76,86, **les deux en ink** (le film ne répond pas), jusqu'à 77,58. |
| 77,76 | coupe | `standing` (`rise` 1) : toi debout au bord de ton abri, de dos, face à la pente qui fume. |
| 77,88 → 80,04 | « +Like+ : pour ceux qui montent au *feu* à ta place. » | `likeCall` de 77,88 à 80,16. |
| 80,30 → 86,10 | « +Abonne-toi+ : prochain dossier, sur la station spatiale, un débris arrive à [10] kilomètres par *seconde*. » | La caméra lève vers `sky`, la crête bascule dans le noir (`shell` 0,2, `fire` 0) ; l'étincelle (`debris` 0 → 1) traverse le cadre sur « débris » 83,56 ; `nextFile` (prochain 81,15, fait 82,0, sorti à 85,72). Rien de l'abri après l'annonce. |
| 86,10 → 88,07 | « Ici, sur ta crête… » | Coupe `toloop` près de POSE0, `D.loop` → la première image sur « crête » 87,12. |

## Les candidates de la première image

Planche sur bouchons : `.cache/planches/040/architecte/p3.jpg` ; le fichier d'essais des quatre : `.cache/planches/040/architecte/premiere-image.json` (à tirer sur les vrais décors, avec l'en-tête, puis à 0,3 et 0,7 s). Notes sur les six points (1 événement en cours · 2 perspective basse · 3 menace derrière · 4 forme reconnue à 40 % vue d'où on ne la voit jamais · 5 système déjà là · 6 bouge par son sujet).

- **A — la tête du dôme, au ras du sol** (POSE0 actuel) : 1 ✓ le front roule · 2 ✓ el 3°, les traits du sommet filent vers le feu · 3 ✓ le mur derrière · 4 ✓ 45 % (la forme « tente d'alu » doit se lire au froissé) · 5 ✓ c'est lui · 6 ✓ langues, ourlet, braises. **6/6.**
  `{ "tx": 0, "ty": 30, "tz": -40, "d": 980, "az": -38, "el": 3, "fov": 36, "shift": 100, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`, état FIRST.
- **B — de profil, le front qui roule** : la vague passe de gauche à droite par-dessus le dôme, les autres coques derrière sur la crête : 1 ✓ · 2 ✓ el 2° · 3 ✓ au-dessus et derrière · 4 ✓ 45 % de profil (moins « vu d'où on ne le voit jamais ») · 5 ✓ et les autres · 6 ✓✓ le mouvement le plus fort. **6/6, le plus de mouvement** ; risque : les flammes devant le haut du dôme.
  `{ "tx": 0, "ty": 40, "tz": -60, "d": 900, "az": -74, "el": 2, "fov": 36, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`, état FIRST + `{ "front": -2, "lean": 0.9 }`.
- **C — au ras de l'ourlet, un plafond de feu** : 1 ✓ · 2 ✓✓ en contre-plongée · 3 ✓ au-dessus · 4 ~ 40 % tout juste, centré · 5 ✓ · 6 ✓ l'ourlet tout près qui bat. **5,5/6.**
  `{ "tx": 0, "ty": 60, "tz": -20, "d": 560, "az": -22, "el": -5, "fov": 44, "shift": 40, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`, état FIRST + `{ "front": -6 }`.
- **D — le tien et les autres derrière** : 1 ✓ · 2 ✓ · 3 ✓ · 4 ✗ 30 % · 5 ✓ · 6 ✓. **5/6, sort si une autre fait 6.**
  `{ "tx": 300, "ty": 40, "tz": -80, "d": 1500, "az": -52, "el": 9, "fov": 34, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`, état FIRST + `{ "front": -8, "lean": 0.7 }`.

Mon choix provisoire : **A** (collée dans `world.js`) ; B si les langues lisent mieux de profil sur le vrai feu. Celle qui gagne est collée dans `POSE0` et `FIRST` avant les actes ; `fin.js` revient à elle.

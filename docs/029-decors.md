# 029 · Airbag d'avalanche — les décors

Deux fichiers, un agent chacun, en parallèle : `episodes/029-airbag-avalanche/src/pente.js` (la montagne, l'avalanche, toi) et `src/model.js` (le système : le sac airbag). Tous deux existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import ; les deux repères) et `src/world.js` (`FIRST`, `VIEW`, `HANDOFF`, `BENCHED` / `STAGED`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/029-actes.md` (lis au moins son haut et les lignes qui te concernent). Faits : `docs/faits/029-airbag-avalanche.md` et `029-contre-verification.md` — leurs « À ne pas dire » d'abord : **jamais « flotte » ni « flottabilité »** (ni à l'image : rien qui « flotte » comme un bouchon sur l'eau — on remonte parce qu'on est gros parmi des grains qui coulent), **aucune marque** (ni logo, ni couleur de marque, ni forme reconnaissable d'un modèle du commerce), **aucune vitesse d'avalanche chiffrée**, **UN ballon et non deux**. **La voix est enregistrée** (83,8 s) : `npm run script -- 029` donne la table.

**Les deux repères** (`plan.js`, à lire avant tout) :
- **Le repère de la pente** (tout `pente.js` est dessiné dedans, dans un groupe incliné de `SLOPE` = 38° autour de x) : **x en travers (+x = TA GAUCHE quand tu regardes vers l'aval)**, **h le long de la normale** (+ = hors de la neige), **s le long de la ligne de pente** (+ = VERS L'AVAL). Origine : là où tes chaussures se tiennent sur le dessus de la plaque à `travel` 0. **Tu y restes** : l'avalanche t'emporte, donc la montagne immobile (grille, cassure, rochers) défile VERS L'AMONT de `travel` mètres, et la masse qui coule bouge avec toi (la règle du 013/015 : le repère est celui du sujet). Toutes les poses restent vraies pendant toute la glissade.
- **Le repère du monde** (la caméra, `VIEW`) : même origine, y vraiment vers le haut. `slopePt(x, h, s)` passe de l'un à l'autre. La pente DESCEND vers +z.
- **Azimut** (`kit/lib/stage.js`, vérifié sur planche : la caméra est en t + d·(sin az · cos el, sin el, cos az · cos el)) : `az` 0 se tient en +z — EN AVAL de toi, face à toi —, +90 à ta GAUCHE (+x : le côté de la poignée), −90 à ta droite, ±180 en amont, derrière toi. `el` négatif : la caméra regarde vers le haut (vers l'amont). La lumière clé vient de −x, +y, +z.

**L'échelle** : vraie pour toi (1,76 m), tes skis, le sac, la plaque (≈ 40 cm, le cas du Montana). L'angle de la pente, les blocs, la profondeur de l'écoulement et de l'ensevelissement sont **illustratifs** — rien ne s'affiche (`sources` le dit). Les crêtes et le ciel à l'infini.

**Couleurs** : signal = la menace (la cassure, la neige qui part, l'écoulement et ses blocs, la poudre qui vole) ; veille = ce qui sauve (la poignée, le gaz, le ballon et sa promesse, la surface qu'on retrouve ; au loin, la ligne du prochain dossier) ; ink = le reste (la montagne, la neige immobile, toi, l'air que le venturi aspire). Pas de bleu, pas de blanc « neige » plein : la neige est aux rayons X.

**Qui possède quoi** : **toi (le personnage de verre) appartiens à `pente.js`** (`fig`, posé par ses nombres). Le sac est le système : `model.js` le dessine dans SON repère (`plan.js`, « le repère du sac ») ; `pente.js` expose une ancre `A.pack` sur ton torse (`PACK_ON_TORSO`, sans rotation) et `world.js` y accroche `model.root`. `pente.js` ne dessine PAS le sac ; `model.js` ne dessine PAS le personnage. La main gauche (pente) suit la poignée (model) : les deux lisent `HANDLE` et `pull` dans `plan.js` — c'est ce qui les tient ensemble.

**Le raccord vers l'établi** (`world.js`, déjà écrit) : au build, le monde est posé une fois sur `HANDOFF` ; on lit où sont le sac et la poignée, et l'angle du sac sur ton dos. `VIEW.strap` vise la poignée ; sur l'établi, `upright` 0 tient le sac à ce même angle (la coupe est en place ET au même angle), `upright` 1 le redresse. Vérifié sur bouchons : la poignée tombe au même endroit de l'image des deux côtés de la coupe.

**Le piège n° 1 de ce dossier : la neige qui vole fait des images parasites.** Elle se dessine **en traînées** (`makeMotes` du kit avec son `streak`, ou une copie du `makeStreaks` du 007, `episodes/007-siege-ejectable/src/jet.js` l. 345, ou de celui du 026, `026-soyouz-ms10/src/sky.js` l. 168), **jamais en points** ; rien de fin qui défile vite (la grille qui défile avec `travel` s'étale sur sa course — `uSmear` comme `grid.uSmear` du kit — ou ses cellules grandissent) ; pas de trait sous 1,8 px ; une lueur ne clignote pas. Les petits grains de l'écoulement (des centaines) sont des volumes, pas des points : à distance ils se fondent en matière, pas en scintillement.

---

## `src/pente.js` — la montagne et l'avalanche, autour de toi

**À lire pour l'idiome** : `kit/lib/figure.js` (en entier : tu le poses), `kit/lib/atmo.js` (`makeSurface`, `makeMotes` et son `streak`), `episodes/007-siege-ejectable/src/jet.js` l. 340–520 (le ciel à l'infini `backdropMat` l. 419, les traînées `makeStreaks` l. 345), `episodes/006-defibrillateur/src/hall.js` (un décor aux rayons X et ses personnages), `kit/lib/build3d.js`. **On copie et on adapte** ce qui sert (le ciel, les traînées) : aucun de ces décors n'exporte sa pièce seule — on ne touche jamais aux fichiers des autres épisodes ni au kit.

**Ce qu'il construit**, en cm, dans le repère de la pente (sauf toi, voir plus bas) :

1. **La montagne aux rayons X** — pas de sol plein : une **grille qui épouse la pente** (cellules d'≈ 1 m, fondue au loin, étalée quand elle défile), la neige immobile en amont de la cassure et sur les bords de la coulée, quelques affleurements rocheux de verre aux bords (ils donnent l'échelle et la vitesse quand ils défilent), la ligne de crête au-dessus de la cassure. **Au loin, à l'infini** : un ciel sombre (pas de bleu), des crêtes en traits ink, superposées en deux ou trois plans, un horizon légèrement plus clair — sur un dôme dessiné en premier, comme le `backdropMat` du 007. Les crêtes ne défilent pas avec `travel` (elles sont loin) ; la grille et les rochers oui.
2. **La neige en coupe** — pour les plans de côté (`VIEW.section`, `VIEW.buried`) : un **plan de coupe à x = 0** (le plan où tu te tiens), en traits ink fins : le dessus de la plaque (h 0), la couche fragile (h −40 : un trait pointillé plus sombre), le vieux manteau en bandes jusqu'à h −300 ; une fois l'avalanche partie, la **surface libre de l'écoulement** (h 0 autour de toi, un trait signal doux, irrégulier) et son **lit** (h `FLOW.bed` à `flow` 1). Lisible depuis ±x ; invisible de face (il n'encombre pas l'accroche). `shell` l'efface.
3. **La cassure** (`crack`) — signal, elle court en travers de la pente depuis le dessous de tes skis (x = 0, à s = `SLAB.crown`, juste en amont de tes talons) jusqu'à ±`SLAB.halfWidth`. Une **lumière qui a un endroit** : une tête brillante qui court (cœur clair, halo, émission ≤ 3), une traîne qui retombe à un trait signal net le long de la marche qu'elle laisse ; à chaque mètre, un petit jet de neige en traînées. Vue de face (l'accroche) elle court VERS la caméra et passe sous tes skis ; de côté (`crackSide`) elle fonce sur l'objectif. Déjà en route sur l'image 0 (`crack` 0,12).
4. **La plaque qui se découpe** (`slab`) — sous la cassure, la plaque (40 cm) se fend en blocs irréguliers (des fissures signal fines qui s'ouvrent, puis les blocs se séparent d'un doigt) ; à `travel` > 0 la plaque découpée glisse avec toi (elle reste sous toi, c'est la montagne qui défile), la marche de la cassure (le mur de la cassure, une arête claire) s'éloigne vers l'amont.
5. **L'écoulement** (`flow`, `sort`, `rush`) — la masse granulaire autour de toi (`FLOW` : ±7 m en travers, de 9 m en amont à 14 m en aval, de son lit à sa surface) : des **blocs de trois tailles** (`BLOCKS` : de gros blocs de 1,2 à 2,2 m — plus gros que toi couché —, des moyens, et des centaines de petits grains), **en verre signal** (faces sombres, arêtes signal, un volume lisible : plus sombres côté opposé à la caméra, un liseré clair au-dessus — la règle des objets identiques). Ils **culbutent** (rotation ∝ `travel`, pas ∝ temps seul : quand `travel` s'arrête, tout s'arrête) et se mélangent. **`sort` 0 → 1 fait la démonstration de l'acte 3** : chaque bloc glisse continûment de sa place mélangée vers son niveau trié — **les gros remontent à la surface, les petits descendent vers le lit** (déterministe, aucun saut, aucun bloc ne traverse un autre de façon visible ; un gros bloc qui monte se lit sur une seconde). `flow` 0 = la plaque glisse en radeau de blocs ; 1 = la masse culbute, plus profonde. **La poudre** (`rush`) : des traînées signal pâles qui filent vers l'aval autour de toi et au-dessus de la surface (densité et longueur ∝ `rush`) — jamais des points. `rush` 0 avec `flow` 1 = la neige figée, prise (la vision de l'acte 1, la fin) : plus une traînée, plus rien ne bouge.
6. **Toi** — `makeFigure({ hands: "real" })` (`shell: true` si ça se lit mieux à travers la neige ; essaie les deux), **dans le repère du monde** : debout (`fall` 0) tu es vertical (la pesanteur), chaussures à l'origine, **les skis couchés sur la pente** le long de la ligne de pente (chevilles fléchies ; skis de verre à arête claire, spatules relevées : c'est ce qu'on voit en grand dans l'accroche), les bâtons si ça aide à lire « skieur » (sinon rien). Renversé (`fall` 1) : couché dans l'écoulement, poitrine en l'air, tête vers l'amont (rotation autour de x de −(90 − `SLOPE`)°), relevé de `YOU.lying`. `roll` : des tours tête par-dessus pieds autour d'un axe en travers qui passe par ta poitrine (pas par tes pieds) ; bras et jambes qui ballottent selon `roll`, déterministes. `bury` : tu descends le long de la normale jusqu'à `YOU.chestDown` (≈ 1 m de neige sur toi) — **tu dois rester lisible à travers la neige de verre** (le personnage, la tête, les mains ; le sac plein est à `model.js`). `reach` : ta main gauche vient à la poignée et s'y ferme (`fig.hold` sur la barre de la poignée : `HANDLE.at` dans le repère du sac + `PACK_ON_TORSO`, moins `pull` × `HANDLE.pull` le long de `HANDLE.dir`) ; la droite part en contrepoids. **`A.pack`** : un `Object3D` sur `fig.torso` à `PACK_ON_TORSO`, sans rotation — `world.js` y accroche le sac. De près, la tête et les mains peuvent passer en verre (`fig.ghost`) : à toi de dire dans ton journal ce qui se lit le mieux.
7. **La vallée et le prochain dossier** (`teaser`) — loin en aval (`VALLEY`), un chalet de verre (un toit, des murs, un trait ink fin) et, sous lui, **une ligne veille qui descend dans le sol** (le conducteur vers la prise de terre : pas de vert-jaune, on a trois couleurs) : 0,6 le chalet apparaît, 1 la ligne s'allume. Invisible à 0. Il se voit depuis `VIEW.valley`.

**API à rendre** (exactement) : `export function buildSlope()` → `{ group, A, fig, update(P, time, px) }`.
- `group` : ajouté par `world.js` au décor, jamais déplacé ni tourné par lui (ton groupe incliné est dedans).
- `A` (ancres, `Object3D`) : `you` (ta poitrine), `head`, `pack` (sur ton dos : le sac s'y accroche), `hand` (ton poignet gauche), `skis`, `surface` (la surface de l'écoulement juste au-dessus de ta poitrine), `crown` (la cassure sous tes talons), `chalet`.
- `fig` : le personnage (`kit/lib/figure.js`).
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `shell` | la montagne aux rayons X (grille, coupe, rochers, crêtes) 0–1 |
| `crack` | la cassure qui court : 0 rien → 1 jusqu'aux deux bords |
| `slab` | la plaque : 0 d'un bloc → 1 découpée en blocs (encore en place) |
| `travel` | mètres parcourus : la montagne défile vers l'amont ; la culbute des blocs en dépend |
| `rush` | la poudre et la culbute : 0 figé → 1 plein (densité et longueur des traînées) |
| `flow` | 0 radeau de blocs → 1 masse granulaire qui culbute, plus profonde |
| `sort` | 0 mélangé → 1 trié : gros en surface, petits au lit |
| `you` | 0 personne → 1 toi |
| `fall` | 0 debout sur tes skis → 1 couché dans l'écoulement |
| `roll` | tours tête par-dessus pieds (s'accumule ; 1 = un tour) |
| `bury` | 0 en surface → 1 sous un mètre de neige |
| `reach` | ta main gauche : 0 le long du corps → 1 sur la poignée |
| `pull` | la poignée tirée : ta main suit (`HANDLE.pull`, `HANDLE.dir`) |
| `teaser` | le chalet (0,6) puis sa ligne veille (1), loin en aval |

**Images à réussir** (12, liste fermée — poses de départ dans `world.js` → `VIEW` ; donne les bonnes dans ton journal) :

1. **Les quatre candidates de la première image**, à `at` 0,02 (`FIRST` : `crack` 0,12, `rush` 0,2) : `VIEW.hook` (= `POSE0`, a · sous tes skis), `VIEW.back` (b · de dos), `VIEW.crackSide` (c · la cassure de côté), `VIEW.under` (d · sous la neige). Chacune : la cassure qui court, la neige en traînées qui en jaillit, toi sur tes skis, la poignée veille sur ta bretelle quand la pose la montre (le sac est à `model.js`, il est là sur tes planches). Sur bouchon, la (a) monte ta tête dans l'en-tête (236–410) : recadre-la. Tire-les aussi à 0,3 s et 0,7 s : **le sujet bouge dès l'image 1** (la cassure, les traînées, la plaque qui cède), et ne sort pas du cadre. Les planches des candidates sur le vrai décor, c'est celui qui orchestre qui les tire et choisit, après le décorateur.
2. La plaque découpée qui glisse avec toi : `VIEW.side`, `{ crack: 1, slab: 1, travel: 3, rush: 0.6 }`.
3. Emporté, roulé : `VIEW.ride`, `{ crack: 1, slab: 1, flow: 0.7, travel: 8, rush: 1, fall: 1, roll: 0.4, bury: 0.2 }`.
4. **La vision « enseveli »** : `VIEW.buried`, `{ crack: 1, slab: 1, flow: 1, rush: 0, travel: 9, fall: 1, roll: 1, bury: 1 }` — la neige prise, toi recroquevillé dessous, lisible à 270 px (sans blessure).
5. La poignée dans l'écoulement : `VIEW.strap` (rempli par `world.js`), état `{ ...STAGED, ...HANDOFF }` — ta main sur la poignée, la bretelle, un bout de l'écoulement autour.
6. **La coupe** : `VIEW.section`, `{ crack: 1, slab: 1, flow: 1, rush: 1, travel: 12, fall: 1, bury: 0.4 }` à `sort` 0, 0,5 et 1 — trois images : **à 270 px de large, on lit que les gros blocs sont en haut et les petits en bas** à 1, mélangés à 0.
7. Toi qui t'enfonces puis qui remontes : `VIEW.section`, `{ sort: 1, bury: 0.9 }` puis `{ sort: 1, bury: 0.05, bag: 1 }` (le ballon plein est à `model.js`).
8. Le large : `VIEW.wide`, `{ crack: 1, slab: 1, flow: 1, travel: 20, rush: 1, fall: 1 }` — la coulée, la cassure loin en amont, les crêtes, le ciel.
9. La vallée : `VIEW.valley`, `{ teaser: 0.6 }` puis `{ teaser: 1 }`, `{ flow: 1, rush: 0, fall: 1, bury: 0.05, bag: 1 }` — **le chalet et sa ligne SOUS le panneau du prochain dossier** (le panneau `#next` occupe la zone haute 436–790 : le chalet entre y ≈ 820 et 1160 ; sur bouchon, la pose de départ le met derrière le panneau).
10. Avec l'en-tête et les zones (sans `--bare`), au moins une fois : `POSE0` et `VIEW.section` — le sujet entre y ≈ 440 et 1160, rien d'important sous 1600.

---

## `src/model.js` — le sac airbag (le système)

**À lire pour l'idiome** : `episodes/007-siege-ejectable/src/model.js` (un système plein, son occupant, ses ancres), `episodes/017-irm/src/model.js` (pièces, `lit…`, `explode`), `kit/lib/build3d.js` (`solid`, `glow`, `box` / `cyl` / `plate` / `lathe` chanfreinés, `makePart` / `addMesh` / `setPartOpacity` / `explode`, `fatLine`, `anchor`). Pour un flux clair sur conducteur sombre : `episodes/012-gaziniere/src/model.js` (la tête de lumière qui descend un fil) et `004-differentiel` (tirets en centimètres, `worldUnits`).

**Ce qu'il construit**, en cm, **dans le repère du sac** (`plan.js` : origine au centre du panneau dorsal, +x = ta gauche, y le long de ta colonne, −z vers l'extérieur du sac, +z vers ta poitrine) — tailles illustratives, jamais écrites :

- **Le sac** (`PACK` : 30 × 52 × 17, ≈ 30 L) — tissu plein, sombre, mat (trois valeurs de gris : le tissu, les renforts, le zip), un compartiment haut dont le rabat s'ouvre quand le ballon sort. Rien qui rappelle une marque.
- **Le harnais** (`STRAPS`) — deux bretelles qui passent sur tes épaules et descendent sur ta poitrine (z ≈ +21), une sangle de poitrine, une ceinture. Sur l'établi, **le harnais se tient comme s'il était porté** (creux, sans personne) : on comprend « un sac qu'on porte ».
- **La poignée** (`HANDLE`) — sur la bretelle GAUCHE, à hauteur du sternum : une poignée pleine (gris clair) avec une bague veille qui luit à `litHandle` (déjà 0,35 sur l'image 0 : le système est là, petit mais lisible — **elle doit se lire dans l'accroche**). `pull` 1 la tire de `HANDLE.pull` cm le long de `HANDLE.dir`.
- **Le câble** (`CABLE`) — gainé, il remonte la bretelle, passe l'épaule, entre dans le sac jusqu'au déclencheur. Quand `pull` monte : une tête de lumière veille court de la poignée au déclencheur (il « tire un câble »). Il s'allume avec la poignée.
- **La cartouche** (`CARTRIDGE`) — **la pièce-héros en métal** : un cylindre chanfreiné, la valeur de gris la plus claire, debout contre le panneau dorsal ; sa tête, **le déclencheur** (`TRIGGER`) : `pierce` 1 = le pointeau traverse l'opercule, une étincelle veille qui a un endroit, puis plus rien (un éclat, pas un voile).
- **Le venturi** (`VENTURI`) — au-dessus de la cartouche, une pièce usinée avec un col et des **prises latérales** bien visibles. `gas` : le gaz (des têtes veille sur un conduit sombre) monte de la cartouche, traverse le col, part dans le tuyau (`HOSE`) vers le ballon. `draw` : **l'air autour est aspiré** — des têtes ink qui convergent de tout autour vers les prises latérales, plus nombreuses que celles du gaz (l'image dit « il aspire l'air autour », sans chiffre) : **clair sur conducteur sombre, des tirets larges en centimètres, qui avancent d'au plus 1/7 de leur période par image** (004 : à une demi-période ils sautent). C'est LA démonstration de l'autopsie : elle doit se lire à 270 px sur `VIEW.venturiBench` et `VIEW.bagFull`.
- **Le ballon — UN SEUL** (`BAG`). Plié (`bag` 0) : un paquet plat dans le compartiment haut, `litBag` le fait luire. Plein (`bag` 1) : **≥ 150 L**, un gros boudin en fer à cheval qui sort du haut du sac derrière ta tête et l'entoure par les côtés et le dessus, la tête dans son creux (tube r ≈ 15, ligne médiane ≈ 210 cm). Veille, mais **une matière, pas une tache** : du tissu enduit éclairé (un ombrage, des coutures en traits, un liseré), lisible comme un volume ; de 0 à 1 il se déplie (il sort, se déroule, se tend — pas un ballon qui grossit uniformément depuis un point). Il ne passe jamais devant ton visage. À `bag` 1 sur toi couché : ton volume fait « presque le triple » — on doit le sentir à l'image.
- **La promesse** (`promise`) — le même ballon plein, en **contour veille** seulement (ses coutures, sa silhouette), autour de ta tête : c'est la promesse de l'accroche (« Un ballon, sorti de ton dos en quelques secondes »), pas le vrai.
- **`seethru`** — le tissu du sac passe en verre (traits fins) : la cartouche, le venturi et le ballon plié se voient dedans (sur ton dos, à l'acte 3 : « Le gaz part »).
- **`explode`** (sur l'établi) — 0 assemblé → 1 éclaté dans **UN cadre vertical** vu de `VIEW.exploded`, **lu de bas en haut dans l'ordre de la voix** : la poignée et son câble devant en bas, la cartouche au milieu, le venturi au-dessus, le ballon plié en haut ; le sac (tissu) et le harnais en retrait derrière. Rien derrière l'en-tête.

**API à rendre** (exactement) : `export function buildModel()` → `{ root, parts, A, update(P, time, px) }`.
- `root` : un `THREE.Group`, re-parenté par `world.js` entre `pente.A.pack` (sur ton dos, sans rotation) et l'établi (`BENCHAT`, son fond au sol, tourné par `upright`).
- `parts` : `{ pack, harness, handle, cable, cartridge, venturi, bag }` — chacune avec SES matières (`setPartOpacity`).
- `A` (ancres) : `handle`, `cable` (son milieu, sur l'épaule), `cartridge`, `trigger`, `venturi`, `bag` (le paquet plié), `bagTop` (le sommet du ballon plein), `centre`.
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (le harnais tenu comme porté), 0 sur ton dos |
| `explode` | sur l'établi : l'éclaté (voir plus haut) |
| `pull` | la poignée tirée ; la tête de lumière court le câble |
| `pierce` | le pointeau perce l'opercule : l'étincelle à la tête de la cartouche |
| `gas` | le gaz court : cartouche → venturi → tuyau → ballon (veille) |
| `draw` | l'air aspiré par les prises du venturi (ink, de tout autour) |
| `bag` | le ballon : 0 plié → 1 plein (le compteur de l'en-tête le lit : × 150 L) |
| `promise` | le contour veille du ballon plein (l'accroche) |
| `seethru` | le tissu du sac en verre (0 plein → 1 transparent) |
| `litHandle`, `litCart`, `litVenturi`, `litBag` | la pièce que la voix nomme luit veille (le câble avec la poignée) |

**Images à réussir** (10, liste fermée) :

1. Le sac entier sur l'établi (`VIEW.whole`) : on comprend sans légende — un sac à dos qu'on porte, une poignée sur la bretelle.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1) : tout dans un cadre vertical, sous la ligne « Système Décodé », lu de bas en haut.
3. La poignée et le câble (`VIEW.handleBench`, `litHandle` 1, `pull` 0 puis 1) — le geste se lit d'une image à l'autre.
4. La cartouche percée (`VIEW.cartBench`, éclaté, `litCart` 1, `pierce` 0,5).
5. **Le venturi** (`VIEW.venturiBench`, éclaté, `gas` 1, `draw` 1) : le gaz veille qui traverse, l'air ink qui converge — lisible à 270 px.
6. Le ballon plié (`VIEW.bagBench`, `litBag` 1) puis **plein** (`VIEW.bagFull`, assemblé, `bag` 1, `gas` 1, `draw` 1).
7. Sur ton dos : `VIEW.strap` à l'état `HANDOFF` (la poignée lisible sous ta main), `VIEW.behind` `{ ...STAGED, seethru: 1, gas: 1, draw: 1, bag: 0.5 }` (le ballon qui sort), `VIEW.section` `{ ...STAGED, sort: 1, bury: 0.05, bag: 1 }`.
8. La promesse : `POSE0` (ou la candidate retenue), `promise` 1 — le contour se lit autour de ta tête sans masquer la cassure.
9. Le raccord : `at` 18,40 (`VIEW.strap`, fin de l'acte 1) contre `at` 18,48 (l'établi, `upright` 0) — la poignée au même endroit, au même angle (le squelette d'acte 2 le fait déjà).
10. La couverture : `cover` d'`episode.json` (instant `eclate$` : éclaté, `litBag` 1 — à l'acte 2 de régler les autres nombres) : tout le système éclairé, quelque chose luit, `el` 30, la vue éclatée sous « Système Décodé » (`shift` −520).

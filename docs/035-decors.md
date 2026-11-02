# 035 · Passage à niveau — les décors

Contrat : `episodes/035-passage-a-niveau/src/plan.js` (deux repères : celui de la voiture, celui du passage), `world.js` (`FIRST`, `VIEW`, `apply`). Voix réelle : 83,1 s. Deux décors neufs, en parallèle, et rien d'autre : le reste est importé.

| Fichier | Ce qu'il porte | Réutilise | Matière |
| --- | --- | --- | --- |
| `model.js` | **le système** : le signal G2 — mât, feu R24 (double face), sonnerie, coffret, demi-barrière et sa lisse blanc et rouge ; construit **quatre fois** par `world.js` | rien (neuf) | **plein** |
| `passage.js` | le passage à niveau de nuit : la route et la voiture du 025, le TGV du 021, deux voies, le platelage, la file arrêtée, le téléphone et la pancarte, les gens qui sortent, la règle des 800 m | `025/route.js` (+ son habillage, + la voiture du 014/011 qu'il contient, toi au volant), `021/train.js`, `011/car.js` (la dernière voiture de la file) | rayons X ; pleins : les rails, le téléphone, la pancarte |

Pas de décorateur prévu : la route est déjà habillée (025), le passage reçoit ses quelques détails de `passage.js` (voir sa section). Les poses de `VIEW` sont **provisoires, réglées sur bouchons** (planches `.cache/planches/035/architecte/p1.jpg`, `p2.jpg`) : chaque journal rend les siennes.

Ce qui vaut pour les deux : **« À ne pas dire » vaut pour l'image** — aucune légende ni aucun dessin de « charnière », « fixation », « point faible », « fusible » sur la lisse ; aucune matière affichée (aluminium, fibre de verre : non établi) ; personne n'est touché par un train ; on ne montre jamais une voiture qui force une barrière pour passer devant un train — seulement la voiture piégée qui sort.

## model.js

**Ce qu'il faut construire** — le signal G2 d'un passage à niveau automatique français, à l'échelle vraie, dans son propre repère (`plan.js` : `MAST`, `R24`, `BELL`, `HOUSING`, `BOOM`) : pied du mât à l'origine, le feu regarde ±z, la lisse pivote autour de l'axe z au point `BOOM.pivot` (au flanc du coffret, y 96) et, **baissée, pointe vers −x** sur 4 m (une DEMI-barrière : elle s'arrête avant l'axe de la route) ; levée, elle est verticale.
- **Le mât** (3 m, tube gris clair), **le feu R24** : une seule lanterne rouge ronde sur sa plaque noire carrée, avec sa visière, **une par face** (double face : le « second feu au-delà des voies ») ; **la sonnerie** en haut du mât (une cloche, ou le boîtier de sonnerie, lisible en silhouette) ; **le coffret** au pied (moteur, contrepoids : on n'en montre que la caisse, son capot, une trappe — le mécanisme n'est pas documenté, rien ne s'invente dedans) ; **la lisse** de section arrondie, **peinte blanc et rouge en bandes de 50 cm sur toute sa longueur**, son contrepoids de l'autre côté du pivot.
- Plein, trois valeurs de gris, arêtes fines, `metal` ≤ 0,5 : la fonte du coffret sombre, le mât plus clair, **la lisse la plus claire** (la pièce-héros). Les bandes rouges en `signal` sombre, les blanches en encre ; chaque pièce qui s'efface a ses propres matières.
- La lisse **rétroréfléchissante** : `shine` allume ses bandes (blanches encre vive, rouges signal) comme un catadioptre — une lumière qui a un endroit, pas un voile ; sur l'établi, `sweep` fait passer deux phares le long de la lisse, de la pointe au pivot, et les bandes s'allument là où ils frappent.
- `give` (le héros seul, à l'acte 3) : la lisse cède sous le capot — elle **pivote en s'écartant vers −z** autour de son pivot (le coffret ne bouge pas) et **s'efface** avant d'avoir fini son mouvement. **Aucun point de rupture montré, aucun éclat, aucune pièce qui casse** (la source dit « conçue pour ne pas résister », jamais où ni comment).
- L'éclaté (`explode`, sur l'établi seulement) dans **un** cadre vertical : la sonnerie monte, le feu s'avance de sa plaque, la lisse glisse hors de son pivot (en rangée, en travers de la caméra — un objet tout en longueur s'ouvre en rangée), le coffret s'ouvre d'un capot. Chaque pièce a son geste quand la voix la nomme (`litLamp`, `litBell`, `litBar`, `litBoom` : un liseré veille discret ; `litBoom` pose la lisse seule sur son halo vert).

**API (définitive, déjà dans le bouchon)**
```
buildSignal({ hero = false } = {}) → { root, parts, A, update(p, time, px) }
p = { down, give, flash, ring, shine, explode, sweep, litLamp, litBell, litBar, litBoom, bench }
A = { lamp, bell, pivot, tip, mid, foot, top }   // les étiquettes et la caméra visent ces points
```
`world.js` en construit quatre (`SIGNALS` : `outA` le héros, `inA`, `inB`, `outB`), les accroche aux `mounts` de `passage.js` (tournés de 0 ou π), et passe à chacun `down` = `downIn` ou `downOut` selon sa paire, `flash`, `ring`, `shine` (×0,4 pour les trois autres) ; `give`, `explode`, `sweep`, `lit*` au héros seul. **Quatre instances** : géométries partagées, matières par instance (les `lit*` et `give` d'une seule ne doivent pas allumer les autres) ; `update` ne fait aucune allocation.

**Les nombres lus** : `down` 0 levée → 1 baissée · `give` 0 → 1 · `flash` (le R24 clignote **à ≈ 1 Hz, une respiration franche, jamais un scintillement** : allumé ≈ 0,5 s, éteint ≈ 0,5 s, attaque douce, calculé depuis `time`) · `ring` (la cloche frémit, deux ondes encre fines quittent la sonnerie, lentes) · `shine` · `explode` · `sweep` · `lit*` · `bench`.

**Les images à réussir (liste fermée)**
1. Le héros sur la route, lisse **en train de descendre** (`down` 0,6), R24 allumé, vu de devant à droite au ras du sol (`VIEW.hood`) : la lisse en lame en travers du cadre, le feu rond, le mât, lisibles à 270 px.
2. Les quatre signaux du passage vus d'en haut (`VIEW.top`, `VIEW.plunge`) : les quatre lisses se lisent en blanc et rouge sur la nuit, baissées ou levées.
3. L'établi, entier (`VIEW.whole`) puis éclaté (`VIEW.exploded`), lisse baissée : tout le signal dans le cadre vertical, sombre sur son halo.
4. Le feu R24 seul, allumé, sa plaque et sa visière (`VIEW.lampBench`) ; la sonnerie seule, qui sonne (`VIEW.bellBench`).
5. Les deux phares qui balaient la lisse (`sweep` 0 → 1) : les bandes s'allument à leur passage (« elle brille dans tes phares »).
6. La lisse seule, en grand, sur son halo veille (`litBoom` 1, `VIEW.boomBench`).
7. `give` à 0, 0,4, 0,8 vu de devant à droite (`VIEW.push`) : la lisse s'écarte et disparaît, sans cassure.

**Propre au dossier** — la couverture de grille est l'éclaté (`episode.json` → `cover`, provisoire : `explode` 1, el 30) : il faut qu'à el 30 tout le signal tienne et qu'une chose y luise (le R24). La lisse fait 4 m pour un mât de 3 m : sur l'établi, filme-la en fuite (az −20 à −40) plutôt qu'en travers, ou l'éclaté devient une ligne. Ton journal : `docs/journal/035-model.md`.

## passage.js

**Ce qu'il faut construire** — l'enveloppe (modèles : `L01/car.js`, `019/cabine.js`) : **on importe, on ne modifie jamais** `025-esp/src/route.js`, `021-veille-tgv/src/train.js`, `011-fusible-pyro/src/car.js`. Le bouchon importe déjà la route et le TGV et les place ; à toi de faire tout le reste au niveau.
- **Deux repères** (`plan.js`) : le groupe rendu est celui de la voiture (la route du 025 y est déjà) ; `pn`, le passage, se pose à z = −100·`gap`. Toute la route défile avec `gap` (025 : « tout ce qui est fixe sur la route est dessiné à s = z + 100·gap »).
- **Les voies** (repère du passage) : deux voies le long de x (`TRACKS` : z ±210, écartement 143,5), champignons des rails **pleins** au ras de la route (y 0) avec un trait clair sur le champignon, traverses et ballast **dans un seul shader de sol** comme au 021 (rien de fin qui saute quand la caméra file le long de la voie), jusqu'à ≈ 1,2 km de chaque côté ; **le platelage** du passage (panneaux entre les rails, `DECK`), aux rayons X, jamais une dalle grise (le bouchon en a une : à remplacer).
- **Le TGV du 021** sur la voie 2, nez vers −x (`train` en mètres : le nez à x = 100·`train`). Son propre monde (`train.group.children[1]` : la ligne, la caténaire, les champs, le dôme) est masqué après chaque `update` ; vérifie que rien d'autre ne le rallume. **Ses phares** (`beam`) : deux cœurs blancs à longue traîne, `fog: false`, lisibles à 800 m au bout de la voie (`VIEW.rail`, `POSE0`) — au bouchon, le TGV à 140 m se perd dans le brouillard : règle le brouillard du passage (dans ton journal, la ligne pour `world.js` : `scene.fog.density`) ou donne au TGV une coque qui garde sa silhouette au loin. La caténaire : si tu la gardes, seulement les poteaux et le fil, loin des caméras basses.
- **Le second train** (`other`) : une paire de phares sur la voie 1, venue de −x (`OTHER`), qui grandit lentement — on ne voit que ses phares et le rail qu'ils allument.
- **La règle des 800 m** (`ruler`) le long de la voie 2, de la route vers le train : un trait signal posé sur le ballast, une graduation tous les 100 m, qui se déroule ; lisible depuis `VIEW.rail` (au ras du rail, en fuite).
- **La file** (`file`) : la voiture du 011 (`buildCar()`, `wall` 0, `you` 0, `bags` 0, `rescuer` 0 ; vérifie qu'aucun mur ni sol ne reste — sinon masque-les par leurs groupes) à `FILE.car`, et plus loin des paires de **feux stop** (signal) seules ; les feux stop de la dernière s'allument avec `file`.
- **La voiture** : celle du 025 (toi au volant de verre). `car` 0 la cache (le groupe parent de `route.A.nose`) ; `alive` : son **tableau de bord** (une bande de verre derrière le volant, `DASH`, qui luit veille) et le flux du moteur du 025 (`gas`) — entre 0 et 1, le tableau **clignote** (piloté par la valeur, pas par une horloge) ; à 0, éteint. Phares de la voiture allumés tant que `shell` > 0 (ceux du 025).
- **Les gens qui sortent** (`people`) : toi et un passager, en verre (`makeFigure` du kit), qui descendent de part et d'autre de la voiture et marchent vers le bas-côté, **derrière la barrière d'entrée, loin des voies** (`PEOPLE`) ; `you` du 025 s'éteint dès qu'ils sortent. Personne n'est jamais sur la voie quand un train est dans le cadre.
- **Le téléphone d'alerte et la pancarte** (`phone`) sur notre bas-côté, côte à côte (`PHONE`, `SIGNBOARD`) : un poste sur son pied (un coffret, son combiné, sa notice), une pancarte rectangulaire avec un numéro **illisible** (des traits, pas de chiffres : aucun numéro n'est sourcé) ; pleins, et ils s'allument veille quand la voix les nomme.
- **Ce qui ne va pas avec le lieu**, dans l'habillage du 025 (importé tel quel) : le panneau « passage d'animaux » (A15b) doit sortir de tous les cadres (masque-le s'il est atteignable, sinon note les plans où il entre) ; **la lisière** du bois coupe les voies : dégager les arbres à ± 15 m de l'axe des voies (un patch du shader de `wood` à la construction, sans toucher au fichier du 025) ou les masquer et laisser la nuit et les champs. Ajoute ce que le lieu a : le panneau triangulaire « passage à niveau avec barrières » (A7) sur le bas-côté avant le passage, sans texte ; les balises du 025 restent.
- La pluie : `wet` ≈ 0,25 (des reflets sur la route mouillée, **aucune pluie qui tombe** : la voix n'en parle pas).

**API (définitive, déjà dans le bouchon)**
```
buildPassage() → { group, pn, mounts, route, train, A, update(P, time, px) }
P = { shell, gap, kmh, rolled, wet, you, car, alive, people, train, beam, other, ruler, file, phone }
mounts = { outA, inA, inB, outB }   A = { trainNose, phone, board, … } (ajoute les ancres dont les actes auront besoin)
```

**Les nombres lus** : voir l'en-tête du fichier (chacun y a sa ligne). `gap` −3 : la voiture coincée sur la voie 2 (nez à 115 cm de la lisse du héros) ; −6,8 : sortie, sa queue à ≈ 50 cm du gabarit du TGV, son nez à 5 cm de la file.

**Les images à réussir (liste fermée)**
1. `POSE0` (`train` 140, `beam` 1, `downOut` 0,62) : au ras du ballast de la voie 2, la voiture de verre en travers des rails, **les phares du TGV au point de fuite** derrière elle — il ne se voit pas au bouchon : c'est la première chose à régler.
2. `VIEW.hood` et `VIEW.under` : la face de la voiture, ses phares, la lisse du héros qui descend devant le capot, les rails sous la voiture.
3. `VIEW.plunge` (grand angle) : le passage entier, les quatre lisses, la voiture entre elles, la file et ses feux stop devant, les deux voies qui partent dans la nuit.
4. `VIEW.top`, la maquette (`car` 0, `file` 0) : le passage de dessus, net de bord à bord, le TGV qui entre par la droite (`train` ≈ 90).
5. `VIEW.rail` (`train` 330 → 60, `ruler` 0 → 1) : au ras du rail, les phares qui grossissent, la règle qui file jusqu'à eux.
6. `VIEW.push` puis `VIEW.wheels` (`gap` −3 → −6,8, `kmh` 4) : le capot qui pousse la lisse, les roues qui passent le dernier rail.
7. `VIEW.pass` (`gap` −6,8, `train` 40 → −120) : la voiture sortie, **le TGV qui traverse derrière elle plein cadre**, puis `other` sur l'autre voie.
8. `VIEW.phone` (`alive` 0, `people` 0 → 1, `phone` 1) : les gens au bas-côté, le téléphone et la pancarte allumés.

**Propre au dossier** — le TGV du 021 a été réglé pour la grande vitesse en pleine ligne : ici il passe derrière une voiture de verre, filmé de près et bas ; la vitesse illustrative est `TRAIN.kmh` 140 (jamais affichée). Le 021 avertit : son azimut 0 regarde son flanc +z ; dans le passage il garde son repère, seulement translaté. Ton journal : `docs/journal/035-passage.md` ; la ligne de brouillard, de `far` (aujourd'hui 160 000 dans `main.js`) et toute pose meilleure vont sous « À changer ailleurs ».

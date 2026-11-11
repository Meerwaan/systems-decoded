# L06 · terrain.js — journal de l'agent décor (10/11)

Fichier : `episodes/L06-blackout/src/terrain.js` (`buildEms`, `buildQuartier`). Interface du bouchon gardée telle quelle (exports, ancres `A`, `update(S, time, px)`, nombres lus). Planches : `.cache/planches/L06/terrain/` (`ems1`, `ems2`, `q1`, `fin` + leurs `.json`).

## Ce qui est construit

**Idiome commun** (dans le fichier, rien d'ajouté au kit) : un **ruban** dessiné en espace écran (repris de `L02/ligne.js`, étendu : étiquette par ruban, hauteur de coupe, miroir dans l'eau) avec trois shaders — `LINE_FS` (les conducteurs), `PLAIN_FS` (tout trait ink : jamais sous 1,8 px, s'éteint avec la distance, pointillé possible), `CABLE_FS` (les départs sous la rue) ; `makeGround` (deux grilles jusqu'à l'horizon, chaque ligne ≥ 1,8 px, effacée avant de fourmiller) ; `makeHorizon` (une bande ink basse dessinée à l'infini) ; `makeGlow` (une lumière qui a un endroit : cœur + longue traîne, jamais sous N px) ; `farGlass` (verre léger instancié).

### buildEms
- **La ligne est allemande : des pylônes DONAU** (deux phases sur la console basse, une sur la haute), par `makePylon` du L02 réglé pour elle — rien du L02 tel quel : 12 pylônes de suspension de 55 m (`arms [3800, 3800, 4750]`, `reach [900, 1800, 1300]`) et **deux pylônes d'ANCRAGE de 84 m** à la traversée (`arms [7000, 7000, 7900]`, `reach [1050, 2100, 1550]`) : les conducteurs tirent sur des chaînes horizontales en bout de console, une bretelle pend sous chaque console (la chaîne verticale de `makePylon` devient la chaîne de bretelle). C'est ce qui permet 84 m, des câbles les plus bas à `EMS.wireLow` (63 m) au milieu du fleuve ET une vraie flèche (6,5 m).
- **Les conducteurs** : faisceaux de 4 sous-conducteurs (ils se séparent de près, se fondent de loin, « le plus clair gagne »), le câble de garde au sommet (jamais sous tension). Sous tension = **ink clair** · surcharge = **signal + gros tirets** (32 m, 70 m/s vers −x : 0,073 période par image) · hors tension = tube sombre encore lisible.
- **`raise`** : les deux pylônes montent de 26 m sur un **tronçon de treillis qui sort du sol** (mêmes pentes de membrures, coupé à y = 0 dans le shader), la portée de traversée monte avec eux, les deux portées voisines suivent par cisaillement (une extrémité fixe, l'autre qui monte). `A.towerW`, `A.towerE`, `A.mid` montent aussi.
- **La rivière** : une surface opaque très sombre (reflet de Fresnel dosé à 5 %, pas de dalle grise), **les câbles de la traversée reflétés dedans** (le même ruban, miroir, flou, 20 %, sans motif de tirets : les tirets, c'est du courant) ; rives, digues (crête à +3 m) et leurs profils en traits jusqu'à l'horizon ; la plaine en grille (rien entre les digues).
- **Le hall** (boîte de verre `asShell` + 13 portiques à treillis, chemins de roulement, la grande porte côté aval) et **le paquebot de verre** dedans (coque lissée par sections, deux blocs de ponts, cheminée, mât radar au milieu = point le plus haut, `SHIP.air`), ses ponts en traits.
- **Le gabarit** : le MÊME contour (lignes « main » seulement) en **pointillé ink**, jamais de volume ; l'eau opaque cache ce qui est sous la flottaison. **`gap`** : une accolade signal du sommet du mât aux câbles les plus bas (elle s'allonge avec `raise`).
- **Le parc éolien** : 14 machines instanciées (fût + rotor trois pales + nacelle, verre léger), rotors face à l'est (on les voit de face depuis le couloir).
- **L'éclair** en `EMS.far` (le dernier pylône est du couloir) : `makeGlow` signal à cœur blanc.

### buildQuartier
- Immeubles de verre (une seule coque) + arêtes + lignes d'étages ; **fenêtres instanciées** (≈ 62 % allumées, attribut départ / rang / moitié / éclat par fenêtre ; pignons à 2 m d'un voisin = murs aveugles) ; **réverbères** (mât, lueur qui fait face, flaque au sol) dans la même instanciation : ils suivent leur départ.
- **Ta pièce** : arêtes fines, ta fenêtre (cadre, meneau, un voile faible : on regarde dedans), l'ampoule (sphère + `makeGlow`) et sa flaque au sol, la télé (écran qui respire lentement), un canapé, **ta prise** (plaque, puits rond, deux alvéoles, broche de terre) et **l'interrupteur** (plaque, bascule) : PLEINS, 8,2 cm, trois gris, un peu d'émissif (ils sont sur le mur ouest, dos à la lumière clé). Toi : `makeFigure({ shell: true })`, `ghost(true)` (de verre de la tête aux mains, pas de visage), debout face à ta fenêtre.
- **L'ascenseur** : gaine de verre, câbles, cabine (arêtes, plafonnier, lueur).
- **Le poste source** : hall de verre, **la suite de la rangée de cellules en verre** à droite du héros (le héros reste seul plein, rien devant lui), porte loin des cellules, **transformateur plein** dehors (cuve, radiateurs, conservateur, 3 bornes 63 kV, 3 bornes HTA), **ligne 63 kV** sur 5 portiques jusqu'à `lineTo`.
- **Les départs** : trois câbles sous la rue (y −80, z ≈ 350) qui sortent des cellules ; départ 1 (1ᵉʳ échelon) : b3, far2, ton immeuble, l'ascenseur ; départ 2 : b2, far1 ; départ 0 : l'hôpital. Le fil de ta prise : prise → mur → sous la rue → poste.
- **L'hôpital** : verre + arêtes (ses propres matières), 86 % de fenêtres allumées, départ 0.

## Chaque nombre de l'état

| Nombre | Ce qu'il fait |
| --- | --- |
| `shell` | pylônes (treillis, isolateurs), digues et rives, facteur du hall |
| `emsCut` | 0 → 1 : le circuit 1 (côté +z) meurt le long de la traversée, **la tête recule du pylône est au pylône ouest** (bout un peu plus clair) ; ce circuit s'éteint sur le couloir est dès 0,06, sur le couloir ouest à 0,94 → 1 ; 1 → 2 : le second. Si `lineLoad` > 0 le couloir reste allumé (l'accroche) |
| `hall` / `ship` | le hall (× `shell`) · le paquebot de verre dans le hall |
| `pass` | le gabarit pointillé glisse de z = +700 m à −700 m, sous les câbles à 0,5 (fondu sur 0 → 0,04 et 0,96 → 1) |
| `gap` | l'accolade signal mât ↔ câbles bas |
| `raise` | 84 → 110 m : le tronçon sort du sol, câbles et ancres montent |
| `wind` | vitesse des rotors (0,9 rad/s à 1). Ne pas l'animer vite : l'angle est `time × wind` |
| `lineLoad` | 0 ink → 1 signal + tirets vers −x, sur toute la ligne |
| `tripRun` | 0 → 0,12 l'éclair gonfle ; 0,14 il se tient (respiration lente) ; 0,2 → 0,25 les tirets s'arrêtent ; 0,2 → 0,42 l'éclair meurt petit ; 0,2 → 1 **le noir court du bout est (2,5 km) jusqu'au pylône de traversée** ; 0,9 → 1 le couloir ouest s'éteint |
| `town` | verre et arêtes des immeubles, de la gaine, arêtes de la cabine |
| `lights` | fenêtres, réverbères, flaques (pas l'ampoule ni la cabine) |
| `shed` | les fenêtres du départ 1 s'éteignent par rang : b3 (0), far2 (0,56), ton immeuble (0,58), l'ascenseur (0,8), chacune sur 0,1 ; le câble du départ 1 meurt derrière un front qui part du poste ; ta lampe, ta télé, la cabine suivent |
| `relit` | 0,30 → 0,42 : b3 et far2 reviennent (et le câble) ; 0,80 → 0,92 : ton immeuble et l'ascenseur |
| `tv` | l'écran (× ton départ) |
| `lift` | la cabine, 0 → 18 m |
| `feed` | les départs : câbles ink + têtes de lumière du poste vers les immeubles (4,2 m/s, une tête tous les 14 m) |
| `poste` | hall, cellules de verre, ligne 63 kV ; le transformateur (plein) apparaît à 0,5 |
| `room` | ta pièce (arêtes, lampe, télé, prise, interrupteur) ; facteur de `you` |
| `you` | la figure de verre |
| `socket` | la tête de lumière part de ta prise (lente dans le mur : `socket^2,2`), fil allumé derrière elle, jusqu'au poste |
| `prio` | le départ 0 passe veille du poste jusqu'à l'hôpital (une tête), fenêtres et arêtes de l'hôpital veille |

## Les poses (à coller dans `world.js · VIEW`)

Vérifiées sur planche :
- **hook1** (et `POSE0`) — la mienne remplace celle posée sur bouchon (dans l'axe, l'éclair et la file de pylônes étaient cachés derrière le pied du pylône) : `{ ...P, tx: EMS.hook[0] + 2522, ty: 2680, tz: 1449, d: 10000, az: -79, el: -14, fov: 46, side: 150, ...SHARP }` — pylône à gauche (≈ 35 % de la largeur), les six faisceaux signal qui filent vers le point de fuite, l'éclair au bout, les éoliennes derrière ; à `tripRun` 0,6 le noir est à une portée.
- **hook3** : celle de l'architecte tient (`ems1`).
- **tower** : celle de l'architecte tient (`raise` 0,6 lu : le tronçon se voit).
- **crossing**, **hallW**, **plain**, **gapC** : celles de l'architecte tiennent (`plain` : les machines sont petites à d 150000 ; pour les voir, `d: 70000`).
- **under (miniature n° 1)** : `{ ...P, tx: 0, ty: 3000, tz: -1000, d: 52000, az: 145, el: 3, fov: 20, ...SHARP }` — longue focale, de trois quarts avant.
- **circuits** : `{ ...P, tx: 0, ty: 6400, tz: 0, d: 42000, az: -25, el: 4, ...SHARP }` (la portée de profil : on voit la tête reculer).
- **street**, **cellsQ**, **room**, **liftB**, **feeders**, **posteW** : celles de l'architecte tiennent.
- **socketC** : plus près, `{ ...P, tx: Q.socket[0], ty: Q.socket[1] - 3, tz: Q.socket[2], d: 48, az: 60, el: 6, ...CLOSE }` (à d 110 la prise fait 130 px). **switchC** : même chose, `d: 48`.

**Pose de miniature** : `under` ci-dessus (`pass` 0,5, `gap` 1). Pour la miniature, préférer `emsCut` 0 (câbles ink clairs + leur reflet) à `emsCut` 2 (câbles sombres, fins).

## À changer ailleurs

1. `episodes/L06-blackout/src/world.js` l. 151 : `export const POSE0 = { ...P, tx: EMS.hook[0] + 2522, ty: 2680, tz: 1449, d: 10000, az: -79, el: -14, fov: 46, side: 150, ...SHARP };` et l. 321 `hook1:` la même.
2. `world.js` l. 361 : `under: { ...P, tx: 0, ty: 3000, tz: -1000, d: 52000, az: 145, el: 3, fov: 20, ...SHARP },`
3. `world.js` l. 360 : `circuits: { ...P, tx: 0, ty: 6400, tz: 0, d: 42000, az: -25, el: 4, ...SHARP },`
4. `world.js` l. 372-373 : `socketC: { ...P, tx: Q.socket[0], ty: Q.socket[1] - 3, tz: Q.socket[2], d: 48, az: 60, el: 6, ...CLOSE },` · `switchC: { ...P, tx: Q.switchAt[0], ty: Q.switchAt[1], tz: Q.switchAt[2], d: 48, az: 55, el: 0, ...CLOSE },`
5. (confort, pas bloquant) `episodes/L02-poste-haute-tension/src/ligne.js` l. 464 : `return { group, A, state, structure, bracing, feet };` — aujourd'hui je prends les semelles par `group.children[dernier]` pour les cacher quand le pylône monte.

## Ce qui n'est pas encore au niveau

- **Le gabarit** : un contour pointillé ne « fait » pas paquebot au premier coup d'œil comme un volume ; c'est la consigne (jamais le navire sur l'eau). Il se lit par la cheminée, le mât et l'étrave ; pour la miniature il faudra sans doute le cartouche « UN PAQUEBOT » pour finir le travail.
- **Câbles hors tension** (`emsCut` 2) : fins et gris de loin — voulu (« sombre »), mais sur `under` ils pèsent peu.
- **Planche `fin` (dernière, 8 images)** : `under` en longue focale, `circuits` de profil (la tête se voit : un point clair au milieu de la portée), `crossingLow`, `cellsQ` avec le vrai héros (la suite de la rangée en verre à sa droite, rien devant), `socketC` à d 48 (la prise se lit ; le fil sous elle était un tuyau → rayon 0,45 cm et halo réduit APRÈS la planche : **pas revu**), `feeders` (`feed` 1, `shed` 0,5), `hospital` (`prio` 1 : veille, net), `hook6` (tient, plus faible que hook1).
- **Sur `cellsQ`**, une dalle claire au sol à gauche des cellules : ce n'est pas un trait de `terrain.js` (elle était déjà là avec les rayons d'origine et n'a pas bougé quand je les ai amincis) — sans doute la flaque du plateau à `fs` 260 ; à regarder côté `world.js` / héros.
- Pendant la dernière passe, `europe.js` est resté ≈ 4 min sans export (son agent l'écrivait) : `look` et `check` cassaient ailleurs que chez moi ; relancés, `npm run check -- L06` : **Check passed**.
- **Pas vus sur planche** (budget d'images) : `river`, `shipC`, `home`, `windowC`, `switchC`, `roofs`, `tower` à `raise` 1, `relit`. Le code est le même que ce qui a été vu ; à regarder à la relecture.
- **De la pièce, vers l'ouest**, les fenêtres allumées des immeubles voisins restent derrière la prise (rayons X) : sur `socketC` / `switchC`, baisser `lights` à ≈ 0,3 si elles gênent.
- Pas de reflet des pylônes ni du gabarit dans l'eau (seulement les câbles). `hospital` est simple (pas de détail), `roofs` : toits plats nus.
- `wind` et les têtes des départs dépendent de `time × nombre` : un `wind` animé vite ferait reculer les pales.

## Pour `docs/catalogue.md`

- **Plaine de nuit, ligne 380 kV Donau, traversée de fleuve** `L06/terrain.js · buildEms` — couloir de pylônes Donau (suspension 55 m, ancrage 84 → 110 m), conducteurs en ruban (ink / signal à tirets / hors tension, coupure par circuit, noir qui court), rivière sombre à reflets, hall de chantier naval et paquebot de verre, gabarit pointillé, parc éolien instancié. Lit `./plan` (EMS, HALL, SHIP, WINDFARM).
- **Rue de nuit aux rayons X** `L06/terrain.js · buildQuartier` — immeubles de verre à fenêtres instanciées par départ (délestage par rang, retour par moitiés), réverbères, pièce habitée (lampe, télé, prise et interrupteur pleins, figure), ascenseur, poste source (transformateur plein, ligne 63 kV), départs sous la rue à têtes de lumière. Lit `./plan` (QUARTIER, HERO).

## Images lues

`ems1` 8 · `ems2` 6 · `q1` 8 · `fin` 8 = 30.

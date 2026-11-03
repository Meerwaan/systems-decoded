# L05 · Hudson (US Airways 1549) — les décors

Long, **affaire réelle**, 680,7 s, 16:9. Quatre fichiers de décor, montés en parallèle contre le contrat : `episodes/L05-hudson/src/plan.js` (sans import : `A320`, `GEO`, `PATH` / `pathAt`, `DAY`, `MAP`, `BASIN`, `SPOTS`, `BENCH`) et `world.js` (`SET`, `FIRST` commenté nombre par nombre, `AT`, `VIEW`, `apply`). **Chaque bouchon porte en tête son API définitive : garde-la** (exports, signature d'`update(p, time, px, ctx)`, ancres `A`). Ce qui doit changer ailleurs s'écrit dans ton journal sous « À changer ailleurs », ligne exacte.

Commun aux quatre :
- **Trois couleurs, et leur sens dans ce film** : `signal` = la menace (les oies et ce qu'elles font dans les cœurs, le sol qui monte, les alarmes, l'eau froide, une piste refusée, la passe de simulateur qui échoue) ; `veille` = ce qui les sauve (l'APU et son courant, les ordinateurs en « loi normale » et leur limite, le fleuve une fois choisi, les toboggans-radeaux, les ferries) ; `ink` = la structure, et la check-list (un plan, ni menace ni secours).
- **Le jour** : 15 janvier 2009, ≈ 15 h 30, −7 °C, l'eau à 5 °C ; soleil d'hiver bas au sud-ouest (couchant ≈ 16 h 50) ; ciel clair au-dessus de New York (ne pas inventer d'orage ni de neige qui tombe).
- **Personne n'est blessé à l'image, aucune victime, aucun visage** : pilotes et passagers sont des silhouettes de verre (`kit/lib/figure.js`). Le bouton « amerrissage » est montré **éteint et jamais enfoncé**. Aucun moteur n'est montré **arrêté** (35 % et 15 % : le gauche « remonte un peu »). Pas de grandeur écrite sur une maquette.
- **Le décor sert aussi aux courts de la semaine** (`docs/plan-rush-youtube.md`) : l'A320 et New York doivent pouvoir s'importer seuls (`buildAvion()`, `buildHudson()` sans dépendance à `world.js`).
- Le format long : `LOOK = { dof: 5, air: 0, finish: 0 }`. Chaque pose rendue dans ton journal dit son optique (`...CLOSE` / `...SHARP`). Planches : `npm run look -- L05 --file … --out .cache/planches/L05/<ton fichier>/… --bare --cols 4` (jamais `renders/`). **Les poses de `VIEW` sont provisoires** (posées sur les bouchons) : rends les tiennes, prêtes à coller.
- **La miniature** se prépare ici (`docs/recette-long-image.md` § 3) : `avion.js` et `systemes.js` disent dans leur journal la pose où leur objet plein remplit 40 % de la hauteur, éclairé, et l'état à tenir (`thumb` : l'avion à 860 m après les impacts ; `thumb2` : le moteur gauche et ses oies ; `thumb3` : l'avion qui touche le fleuve).
- Pour regarder une pose « collée à l'avion » : `"state": { "lock": 1 }` dans `essais.json` (l'avion reste à plat, le monde prend son assiette).

---

## avion.js

**Ce qu'il construit** : l'A320-214 du vol 1549 **à l'échelle vraie** (37,57 m, envergure 34,10 m, fuselage Ø 3,95 m), **aux rayons X** — coque de verre (`glass` + `asShell`) du fuselage, des ailes, des winglets (*wingtip fences* de l'A320 de 2009 : petites, en pointe haute et basse), de la dérive, du plan fixe ; quelques traits de structure (cadres, la ceinture des hublots, le plancher, les portes, les vitres du cockpit). **Pleins** : la nacelle droite fermée et la gauche (`nacL`, cachée quand `systemes.js` l'ouvre), les volets et leurs rails (`flaps`), le train (seulement `gearDown`, à LaGuardia), les **toboggans-radeaux avant** pliés dans les portes L1 / R1 (`packs`) puis gonflés (`rafts`, gris chaud clair, boudins et plancher, comme ceux du L03), les issues d'aile (`wingExits`), la carte de sécurité dans une poche de siège (`safety`). Les **passagers** : une foule de verre (GPU) assise (`pax`), penchée en position de sécurité (`brace`), puis dehors, debout sur les ailes et dans les radeaux (`evac`), qui passe aux bateaux (`saved`). **L'arrière qui encaisse** (`damage`) : le bas du fuselage arrière enfoncé, une lueur signal sous la cabine arrière, jamais une coque qui éclate. **La gerbe** du toucher (`spray`, une fois). **Les bernaches** (`geese`) : une volée en V qui grandit droit devant, puis traverse le nez et entre dans les deux entrées d'air (deux par moteur), plumes ; périodique à 1 (la première image bouge par son sujet). **Les flammes** que crachent les moteurs touchés (`flame`, à la tuyère, un cœur et une traîne, jamais un voile). **L'eau qui entre** n'est pas montrée.

**Ce qu'il réutilise** : `episodes/L03-evacuation-avion/src/avion.js` (A350 / A380 / 737 de verre au sol — le meilleur avion du compte) : **recopie** ses formes (`spline`, la peau lissée par sections `skin`, les portes et leurs toboggans, la foule GPU de `evac`, les hublots `lights` / `emerg`) et règle-les en A320 (sections d'un monocouloir Ø 3,95 m, nez de l'A320, aile basse à 25° de flèche, deux CFM56 sous les ailes). Le vol et la gerbe : `episodes/023-eolienne-de-secours/src/avion.js` (l'A330 en vol, `makeSpray`, les traînées). **N'importe pas** ces fichiers (ils lisent leur propre `plan.js`) : copie ce qui sert, avec la ligne d'origine en commentaire. Ce qui change l'allure : le nombre de cadres et leur finesse, l'opacité de la coque (`shell`), la teinte des hublots.

**API** (bouchon) : `buildAvion() → { group, A, update(p, time, px, ctx) }`, `makeRaft() → { group }` (un radeau gonflé seul, pour l'alignement de l'établi). Ancres `A` : `nose`, `tail`, `doorL1`, `doorR1`, `wingL`, `belly`, `card`, `intakeL`, `intakeR`, `cabin`. Repère : `plan.js · A320` (nez −x, gauche +z, axe du fuselage y = 0, x = 0 l'emplanture). `world.js` incline le parent : **`avion.js` ne bouge jamais l'avion**. Afloat : la rivière est à y = −120 (`A320.float.axisY`) ; `sink` incline l'avion (world.js), l'eau ne monte pas dans le décor.

**Nombres lus** : `shell cabin pax brace flaps gearDown nacL nacR geese flame packs doors rafts wingExits evac saved sink damage spray seal safety feed cold`. `seal` : les ouvertures sous la ligne de flottaison (prises d'air, vannes de pressurisation) marquées ink puis fermées (ce que fait le bouton, montré en schéma). `feed` : des tirets veille qui courent des génératrices (ou de l'APU, `apu` > 0.5) le long du fuselage jusqu'au cockpit, à vitesse fixe. `cold` : givre sur l'extrados, buée de souffle.

**Images à réussir (liste fermée)** — les poses de `world.js · VIEW` sont un point de départ :
1. `hook1` · `hook2` · `hook3` · `hook6` : les candidates de la première image (les oies dans les entrées d'air, la flamme à gauche ; l'avion ≥ 40 % de la largeur).
2. `wide` et `profile` à 860 m (le sujet plein lisible sur la ville aux rayons X de `hudson.js`).
3. `cabin` : la cabine de verre vue de haut, 150 passagers assis (`pax` 1) puis en position de sécurité (`brace` 1).
4. `doors` (`lock` 1) : la porte L1, son toboggan-radeau plié (`packs` 1) — **l'objet de la miniature `thumb3` avec `rafts` 1**.
5. `wing` à flot : issues ouvertes, une vingtaine de silhouettes debout sur l'aile gauche (`evac` 0.3 → 1), les deux radeaux avant gonflés (`rafts` 1), **jamais les arrière**.
6. `belly` : l'arrière qui encaisse (`damage` 0 → 1) sur la vraie ligne d'eau.
7. `water` : l'avion à flot, l'arrière un peu enfoncé (`sink` 0.4), Manhattan derrière ; et le toucher (`spray` 0 → 1 en ≈ 1,5 s, à `track` 1843).
8. `safety` : la carte de sécurité dans la poche du siège, éclairée.
9. `profile` avec `pitch` +6 puis la limite (`limit` de systemes.js) : le nez qui monte et s'arrête — l'avion doit se lire de profil à 405 px.

Propre au dossier : l'A320 de 2009 a des *wingtip fences*, pas de *sharklets*. Les deux radeaux **avant** seulement se gonflent (les arrière sont sous l'eau : le rapport). L'avion reste lisible à 405 px quand la ville est derrière lui : la coque est plus claire que les blocs de `hudson.js`.

---

## systemes.js

**Ce qu'il construit** — les systèmes **pleins** (trois gris, arêtes fines, `metal` ≤ 0,5), chacun à sa place vraie dans l'avion (world.js les y monte) :
- **Le CFM56-5B gauche**, Ø soufflante 1,73 m, qui **s'ouvre sur place** (`explode`) le long de son axe : capots, soufflante (ses aubes larges), compresseur basse puis haute pression, **le cœur** (la chambre de combustion, son feu `burn`, ses allumeurs `ign`), turbine, tuyère ; la **génératrice (IDG)** sur son boîtier d'accessoires sous le carter de soufflante, qui descend à l'éclaté (`gen` : veille quand elle donne du courant). La soufflante tourne à `n1L` % (lue, jamais 0 sur un moteur en vol). **L'oie** (`goose`) : une forme sombre qui entre par la soufflante jusqu'au cœur, et à 1 le cœur assombri, signal. `named` allume la pièce nommée.
- **L'APU** dans le cône de queue (Ø ≈ 0,7 m, 1,4 m) : sa prise d'air, sa petite turbine, sa génératrice, son échappement au bout de la queue ; `apu` 0 → 1 : elle démarre (ça tourne, l'échappement chauffe, la génératrice veille).
- **Le cockpit** : deux sièges, **deux pilotes de verre** assis (`makeFigure`, le commandant à gauche +z, le copilote à droite −z), les deux **mini-manches** sur les consoles latérales (pleins ; `stick` tire celui du commandant jusqu'en butée), la main sur le manche selon `pf` ; le tableau, l'auvent (`alarm` : pulsation signal lente), les écrans (`ecam`), le plafonnier et **le bouton « ditching »** (un poussoir éteint, `named` 9 l'entoure d'un anneau ink — jamais allumé, jamais enfoncé), les **manettes « master »** sur le pylône central (`masters`) ; **les ordinateurs** dans la soute électronique sous le plancher (`law` : veille en « loi normale », un vacillement signal sous 0,3) ; **la limite d'incidence** (`limit`, `aoa`) : un arc veille et sa butée dessinés à côté du nez, dehors, dans le repère de l'avion, l'aiguille qui vient s'y arrêter.
- **La check-list (QRH)** : un classeur ≈ 22 × 30 cm, onglets de trois parties (rallumer · planer · se poser sur terre ou sur l'eau) + la check-list d'amerrissage à part (`page` 4) ; les pages tournent (`page` continu) ; `done` : un repère veille qui descend (« environ un tiers ») ; `apuMark` : la ligne de l'APU loin dans les pages ; `gap` : le trou dans la partie de l'eau (un contour signal). **Aucun mot anglais lisible** : des lignes de texte simulées, les titres en français s'il en faut un.
- **Sur l'établi** : le **banc d'essai** du moteur (son bâti, le canon à oiseaux, `gun` tire, `aimCore` vise les aubes 0 ou le cœur 1, `birdCmp` pose côte à côte l'oiseau d'essai de 1,8 kg et une bernache de 3,6 kg) ; **l'alignement de la fin** (`listK` allume l'un après l'autre : une APU, un mini-manche et ses ordinateurs, puis les places `slot3` et `slot4` où world.js pose un radeau et un ferry).

**Ce qu'il réutilise** : l'idiome des systèmes pleins (`episodes/007-siege-ejectable/src/model.js`, `kit/lib/build3d.js` : `makePart`, `explode`, `setPartOpacity`) ; le réacteur et ses aubes de `episodes/L04-porte-avions/src/model.js` / `bord.js` (tuyères chaudes : en idiome) ; `kit/lib/figure.js` pour les pilotes ; `kit/lib/postes.js` peut fournir le bâti du banc (`makeDropTower` / `makeStriker` réglés autrement). L'éclaté s'ouvre **en rangée en travers de la caméra** (une machine coaxiale : les pièces glissent le long de l'axe, la génératrice descend).

**API** (bouchon) : `buildSystemes() → { engine, apu, cockpit, qrh, stand, lineup, update(p, time, px, ctx) }`, chaque partie `{ group, A }` — origines et ancres dans le commentaire de tête du bouchon (`engine` à la lèvre d'entrée, axe +x ; `cockpit` au plancher ; `qrh` au dos du classeur ; `stand.A.mount` où world.js accroche le moteur sur l'établi ; `lineup.A.slot1…4`). `ctx.bench` vrai sur l'établi.

**Nombres lus** : `explode named n1L n1R burn goose ign gen apu law stick limit aoa pilots pf masters ecam alarm qrh page done apuMark gap gun aimCore birdCmp listK feed`.

**Images à réussir (liste fermée)** :
1. `exploded` : le moteur ouvert, toutes les pièces lisibles en une image à 405 px (`explode` 1), l'avion de verre autour ; `fan`, `core` (le feu, puis l'oie dedans), `idg` (la génératrice, veille puis éteinte).
2. `hook4` : dans la nacelle aux rayons X, l'oie qui arrive au cœur (candidate de la première image) — **et la pose de la miniature `thumb2`** (le moteur ≥ 40 % de la hauteur).
3. `cockpit` (`lock` 1) : par-dessus les épaules, les deux silhouettes, le pare-brise ; `stick` : le mini-manche du commandant, tiré jusqu'en butée ; `overhead` : le bouton entouré, éteint ; `computers` : la soute, veille.
4. `apu` (`lock` 1) : l'APU qui démarre dans le cône de queue de verre ; `tail` : un petit point veille dans la queue vu de loin.
5. La limite : `profile` avec `limit` 1 et `aoa` 0 → 1 (l'arc et l'aiguille lisibles à côté du nez, de profil).
6. Sur l'établi : `qrh` fermé, ouvert sur chaque partie, `done` à 0,33, `apuMark`, `gap` ; `stand` et `gun` (le tir dans les aubes, puis dans le cœur) ; `lineup` (les quatre pièces, chacune ≥ 15 % de la largeur).

Propre au dossier : le gauche « retombe à 35 % », le droit « à 15 % » — la soufflante tourne encore, lentement. Le copilote pilote jusqu'à 15:27:23 (`pf` 0), puis le commandant. Le QRH est dans les mains du copilote (ancre `cockpit.A.lap`) quand `qrh` 1.

---

## hudson.js

**Ce qu'il construit** : New York **à l'échelle vraie**, aux rayons X, sous l'avion — le repère géographique (`plan.js · GEO`, en km : x est, z sud, origine au point d'amerrissage) : **l'Hudson** (eau sombre, reflets du ciel bas, le courant `flow` qui file vers le sud en tirets ink, la buée du froid `cold`, `riverLit` : la rivière s'allume veille sur sa longueur), l'East River ; **Manhattan** en blocs de verre (Midtown et Downtown hauts, le reste bas), le Bronx, le Queens, le New Jersey en blocs bas plus clairsemés ; **LaGuardia** (pistes 4/22 et 13/31, leurs lumières, `lgaSig` : signal « derrière toi ») et **Teterboro** (piste 1/19) (`airports`) ; **le pont George-Washington** (tablier à 65 m, pylônes à 184 m) ; **l'hélicoptère** du TCAS (`heli`, cerclé signal) ; **les bateaux** (`boats` 0 → 9 : un ferry qui vient se ranger le long de l'avion, puis sept ferries, le bateau des pompiers, les garde-côtes) — pleins, veille discrète (les secours) ; **le ciel d'hiver** (dôme centré sur l'œil, soleil bas au sud-ouest) ; **la mer de nuages** très en dessous quand `high` > 0 (l'avion à « plus de 6 000 m »).

**Ce qu'il réutilise** : le dôme de ciel de `episodes/026-soyouz-ms10/src/sky.js` (sol → altitude, le limbe ; en idiome), la ville aux rayons X et ses lumières de `kit/lib/details.js` (`nightLights`, au jour : quelques fenêtres) et `episodes/L02-poste-haute-tension/src/ligne.js` (`makeCorridor` : une carte en perspective), la mer de `episodes/L04-porte-avions/src/navire.js` (mer, sillage, ciel ; recopier l'idiome). **Le nombre de blocs** : instanciés, détaillés près de l'œil (`ctx.camera` → coordonnées locales par `group.worldToLocal`), en masse au loin ; le brouillard est réglé par world.js (`haze`). Ce qui change l'allure : la hauteur des blocs, leur opacité, la densité des traits.

**API** (bouchon) : `buildHudson() → { group, A, update(p, time, px, ctx) }`, `makeFerry() → { group }` (un ferry seul, plein, ≈ 1 : 1). Ancres `A` : `ditch`, `lga04`, `lga13`, `lga31`, `teb01`, `gwb`, `pier`, `strike`. **`world.js` tourne et glisse `group`** pour que l'avion soit à l'origine : le décor ne bouge jamais son groupe ; le ciel et le soleil suivent la caméra (un dôme centré sur l'œil).

**Nombres lus** : `city river riverLit airports lgaSig boats heli cold flow high haze` ; `ctx` : `t`, `camera`, `alt`, `speed`, `high`.

**Images à réussir (liste fermée)** — l'avion (`avion.js`) au premier plan :
1. `over860` : l'avion petit, 860 m d'air sous lui, le Bronx et Manhattan en blocs, l'Hudson qui brille au loin (à `track` 1631).
2. `lookBack` : par-dessus l'avion, LaGuardia loin derrière, signal (`lgaSig` 1).
3. `runway` : l'avion sur la piste 4 de LaGuardia (`track` 1494, `gearDown` 1), le froid.
4. `heli` : l'hélicoptère en dessous, cerclé.
5. `toWater` : du ras de l'eau, l'avion qui arrive au-dessus du fleuve, Manhattan à gauche, le pont au loin (`track` 1830).
6. `water` et `ferries` : l'avion à flot (`track` 1860), le premier ferry le long (`boats` 1), puis neuf bateaux (`boats` 9).
7. `skyHigh` : `high` 1, la mer de nuages loin dessous ; puis `high` 1 → 0 en 2 s : le sol remonte sans image parasite.
8. Un plan **qui défile** (la ville sous l'avion à 80 m/s, `track` qui suit l'horloge) : aucun scintillement à 405 px — les blocs lointains en masse, pas en traits.

Propre au dossier : le soleil à 15 h 30 en janvier est bas, au sud-ouest. Pas de neige qui tombe. L'avion a amerri à peu près au milieu du fleuve au large de la 48ᵉ rue ; il a dérivé vers le sud (≈ 2 km en 20 min, `PATH`).

---

## carte.js

**Ce qu'il construit** : **la maquette** de New York à 1 : 2 000 (`MAP.k` = 50 cm par km, mêmes axes et origine que `GEO`) sur une table dans le noir — l'Hudson et l'East River en creux sombres, Manhattan et les quartiers en petits blocs de verre, LaGuardia et Teterboro (leurs pistes en traits), le pont ; **le glyphe** de l'avion (≈ 30 cm : un symbole plein, ×15 son échelle), qui vole son `PATH` à la hauteur de la maquette (860 m → 43 cm) avec une ombre portée et un fil vertical jusqu'à la table ; **la trace** (`route`) ; **les options** (`opt` : une ligne pointillée du glyphe jusqu'à la piste offerte, veille, puis barrée signal `optNo`) : LaGuardia 13, LaGuardia 31, Teterboro 1, l'Hudson (`riverLit`) ; **la radio** (`radio`, `jam` : la ligne vers le contrôle, hors du bord est, qui se rompt) ; **la route vers Charlotte** (`charlotte`, vers le bord sud-ouest, au-dessus de la terre) ; **les quinze passes de Toulouse** (`sims` : quinze traits qui partent du point d'impact en demi-tour, huit finissent sur une piste en veille, sept s'arrêtent avant, ink éteint ; `simLate` : celle à 35 s de retard vers LaGuardia 13, qui tombe court, signal) ; **les bateaux** qui convergent (`boatsMap`) ; et à son propre spot, **le bassin d'essais** (`BASIN`) : une cuve d'eau calme, une maquette d'avion de ligne (un A320 générique, pas un modèle précis) qui touche l'eau presque à plat (`dropK`), puis la même avec la descente du vrai toucher (`dropFast`), gerbe comprise — **sans rapport chiffré dessiné**.

**Ce qu'il réutilise** : la table de pont et ses petits avions de `episodes/L04-porte-avions/src/bord.js` (une table vue de haut, idiome), la carte de France de `episodes/L02-poste-haute-tension/src/ligne.js` (`buildMap`), les têtes de lumière qui avancent (`008/src/model.js` : `climb`) pour la trace et les passes. `pathAt` (plan.js) pour le glyphe et les traces. Ce qui change l'allure : l'épaisseur des traits (≥ 1,8 px à 405 px de large), la hauteur des blocs.

**API** (bouchon) : `buildCarte() → { group, A, update(p, time, px, ctx) }`. Ancres `A` : `ditch`, `strike`, `lga04`, `lga13`, `lga31`, `teb01`, `gwb`, `glyph` (bouge avec l'avion), `tracon`, `charlotte`, `basin`, `model`. `ctx.t` : l'heure de la trace (le glyphe est à `pathAt(ctx.t)`). Le spot (`spot` 0 la maquette, 1 le bassin) se lit dans `p`.

**Nombres lus** : `spot route glyph opt optNo riverLit airports radio jam charlotte sims simLate boatsMap dropK dropFast flow`.

**Images à réussir (liste fermée)** :
1. `mapWide` : toute la maquette, la trace de la piste 4 à l'Hudson, le glyphe lisible (≥ 3 % de la largeur), le fleuve.
2. `mapLGA` puis `mapTEB` : chaque option, sa ligne, barrée.
3. `mapRiver` : l'Hudson allumé veille (`riverLit` 1), le glyphe qui descend le fleuve.
4. `mapStrike` : le glyphe au point d'impact, la radio qui part vers l'est et se rompt (`jam`).
5. `mapSims` : les quinze passes (8 veille / 7 éteintes) et la passe en retard signal, lisibles à 405 px.
6. `mapFerries` : les bateaux qui convergent vers le point d'amerrissage.
7. `basin` : la maquette qui touche l'eau à plat, puis la même plus raide.

Propre au dossier : **aucun nom de piste ni distance écrits sur la maquette** (les chapitres posent les étiquettes en HTML) ; on ne trace pas un « bon » trajet de retour vers LaGuardia (contre-vérification) ; les quinze passes ne portent pas d'étiquette.

# L04 · l'architecte — journal

2026-10-22. Rôle : contrat, bouchons des décors, chapitres vides, plan de mise en scène sur la vraie voix (628,8 s, 107 phrases, 12 chapitres ; « La cueillette » retirée), repères. Aucun sous-agent. 6 images lues (une planche de 6 sur les bouchons).

## Ce qui est fait

- **`src/plan.js`** (sans import) : le repère du NAVIRE (pont y = 0, étrave −z, tribord +x, origine au milieu ; la quille est l'axe z — c'est la PISTE OBLIQUE qui est de biais, au contraire du 015) ; `SHIP` (261,5 m, contour du pont simplifié, mer à −16,5 m), `ROLL` (l'axe de gîte), `ANGLED` + `onAngled` / `ANGLED_DIR` / `ANGLED_RIGHT` / `ANGLED_YAW`, `CAT` (avant dans l'axe, oblique sur la piste) + `onCat`, `STROKE` 75 m, `TROUGH`, `HOLDBACK`, `TANK` (54 m³), `VALVE`, `CABIN`, `JBD`, `BRINS` (Athéna, Aphrodite, Andromède), `ENGINE`, `TOUCH` (+ `hookRun` : 12,9 / 24,9 / 36,9 m), `MIRROR`, `LSO`, `ISLAND`, `LIFTS`, `HANGAR` (+ rideau), `MASSES`, `FINS`, `PLANT`, `FUEL`, `PARK`, `PEDRO`, `CREW`, `RAFALE` (mesuré sur le Rafale du 015, repère : origine sous la roue avant), **`jetAt(track, run, alt, out)`** (catapulte avant / en l'air / piste oblique, sans allocation), `BENCH` (cinq objets).
- **`src/world.js`** : `SET` (PONT 0 · BENCH 1), `STEPS` (10 étapes : « Étape 03 / 10 · Le catapultage »), `CHAP_STEP`, `CARD` (« Dossier L04 · Pont d'envol », jamais « série »), `LINE_HUD` (« Ton Rafale » : km/h, « En vol », « Arrêté »), `FIRST` (≈ 95 nombres commentés), `REST`, `AT` (`deck`, `night`, `hull`, `bench`), `LOOK` / `CLOSE` / `SHARP`, `POSE0` provisoire (= `hook1`), `VIEW` (≈ 40 poses posées, trois candidates de première image), `cockpitPose`, `HAND` (cinq coutures, toutes DANS le pont : le mouvement continue), `APPROACH` / `approachRun` (la loi de l'approche à travers la couture c45), `buildWorld` (la mer et le ciel de niveau ; tout le navire dans un groupe qui gîte ; le héros — la barre de retenue — re-parenté entre le navire et l'établi ; les quatre objets de l'établi ; la pointe de la crosse passée à `model` dans le repère du navire ; deux avions sur l'ascenseur ; les deux gens de la cabine sur ses sièges) et **`ride`** (la caméra qui suit ton avion : `createDirector({ ride })`, la lumière suit aussi), `span`, `cardAt`, `onFrame`, `seam`.
- **Bouchons** : `navire.js`, `model.js`, `bord.js` — leur vraie interface en tête, une géométrie grossière qui tourne (planche : la catapulte, l'éclaté, la section qui gîte, la piste et ses brins s'affichent aux bons endroits).
- **Chapitres** : six fichiers (`c1-ouverture`, `c2-lancement`, `c3-reacteur-stabilite`, `c4-feu-nuit`, `c5-miroir-brins`, `c6-appontage-fin`), chacun avec ses coutures (et la boucle dans c6), câblés dans `chapters.js`. `main.js` : `ride`, `LINE_HUD`. `index.html` : « Dossier L04 · Pont d'envol », « Charles de Gaulle », « Ton Rafale », le titre de la chute (« Un porte-avions » · « Juste une piste » barré · « Lancé, puis rattrapé »).
- **`episode.json`** : 90 repères ajoutés à `cues` (rien d'autre), tous vérifiés sur la table de `npm run script` (aucun n'attrape un autre mot ; `miss2` = « manquée#2 »).
- **`docs/L04-decors.md`**, **`docs/L04-actes.md`** (les 107 phrases, plan par plan : la part du cadre, la pose, le raccord, les chiffres autorisés ; la pièce maîtresse ; la répartition).
- `npm run check -- L04` passe (37/37 contrastes).

## Décisions

- **Trois décors** : `navire.js` (le navire aux rayons X et tout ce qui vit dans sa coque, la mer, le ciel, jour → nuit), `model.js` (les systèmes pleins : catapultes, barre de retenue, vanne, ballon, cabine, déflecteur, brins et frein, miroir, laser, guides ; établi : vapeur contre électromagnétique, les cordes d'Ely), `bord.js` (les avions, les gens de verre, Pedro, les deux tables de pont).
- **« Alors… on l'ouvre » sur place** : la catapulte s'éclate dans sa tranchée (75 m qui fuient vers l'étrave), pas sur l'établi ; l'établi reçoit la barre de retenue (le héros, raccord objet), et des « documents » en volume (la table de pont, la table du Forrestal, les cordes d'Ely, vapeur contre aimants).
- **1967 sur une table** : le Forrestal raconté sur une table de pont en feu (le même procédé que la « maquette » du chapitre 3), sans personne — 134 morts ne se mettent pas en scène.
- **Le gilet du chien jaune est veille** : la DA n'a que trois couleurs ; le jaune n'existe pas à l'image (la voix le dit). C'est le seul objet plein sur un homme de verre. **Fragile** : à faire juger par Merwan sur la planche.
- **Pas de barricade** (non démontrée sur le Charles de Gaulle ; absente du script) : « la barricade Andromède » de la consigne est le troisième BRIN, Andromède.
- **Les coutures** sont toutes dans le lieu PONT, sur des mouvements continus (descente vers le chien, travelling vers l'étrave, vol au-dessus du pont, poussée dans le noir du cockpit, montée du frein au câble) : aucune coupe visible entre deux fichiers.
- **Le toucher** à `TOUCH.s` 3 400, juste avant Athéna, pour que la crosse saute Athéna puis Aphrodite et prenne Andromède (`hookRun`), ≈ 35 m avant le bout de la piste après 90 m de câble.

## Les trois candidates de la première image (`VIEW`)

- `hook1` (= `POSE0` provisoire) : le Rafale entier de profil, bas, depuis bâbord, sujet à gauche (`side` 260), le souffle sur le déflecteur, la barre tendue, l'étrave et la lueur signal à gauche.
- `hook2` : au train avant, bas, de face et de bâbord (az −150) : la barre de lancement dans le croc, la barre de retenue, les entrées d'air au-dessus.
- `hook3` : derrière la queue, JUSTE au-dessus du déflecteur levé (el 9 : à el < 6 le déflecteur cache tout — vu sur planche) : les deux cœurs, la fente qui file vers l'étrave entre les roues.

## Ce qui reste incertain

- Toutes les poses de `VIEW` et de `HAND` sont posées sur des bouchons : à recaler par l'orchestrateur une fois les décors faits, AVANT les chapitres (les journaux des décors en donnent de meilleures).
- La pose `cockpitPose` suppose un œil à 45 cm au-dessus et 30 cm derrière `RAFALE.cockpit` : à vérifier avec le vrai Rafale (la caméra ne doit pas être dans le casque).
- `ride` n'a été vérifié qu'au calcul (pas d'image) : le décalage est la différence `jetAt(run) − jetAt(0)` du même `track`.
- c3 (116 s) et c5 (111 s) dépassent un peu les 110 s ; chacun a une couture intérieure naturelle à une carte si l'agent ne tient pas.
- Le lancement au ralenti (8 s pour ≈ 2 s) et l'appontage au ralenti après le toucher sont des choix de mise en scène : la voix dit « deux secondes environ » ; à juger sur le brouillon.
- Le Rafale du 015 tourne avec beaucoup de détails (étincelles, figure, traînées) : en dix exemplaires (garés, hangar, ascenseur, suivant, ravitailleur) le coût par image peut doubler — `bord.js` doit faire une version allégée.

## À changer ailleurs

- Rien (le kit n'a pas été touché).

## Intégration (23/10, reprise après les trois décors)

16 images lues (planche des six candidates, une planche de vérification de 8, deux essais du cockpit).

**Appliqué**
- `plan.js` : `BENCH.board` [150, 340] ; `CUT = { z: MASSES.rows[0] − 180 }` (lu par `navire.js` à la place de sa constante) ; `SHUTTLE_STOP` 70,4 et `BOW_EDGE` 73,8 (le pont finit à 73,8 m sur la ligne de la catapulte avant : on garde `CAT[0].from`, la navette s'arrête à 70,4, `hooked` passe à 0 là ; `jetAt` fait monter l'avion après `BOW_EDGE`) ; `RAFALE.tow` (0, 20, −50) = l'encoche du croc (`model.cats[0].A.croc`) — la barre de `bord.js` y tombe déjà (vu de près : `VIEW.shuttle`).
- `world.js` : `cockpitPose` — l'œil à (20, 300, cockpit + 40), `fov` 46, `el` 4, et un paramètre `pitch` : sur l'approche l'avion cabre de 5° et l'œil monte avec lui ; sans lui la caméra était derrière le tableau de bord (vu). `VIEW.cockpit` et la couture c45 = `cockpitPose(3, { pitch: 5, el: 3.5 })` : par-dessus le capot, le viseur, la grappe de lumières du navire au-dessus du nez (vu à `run` −1 300). `gear: tr === 2 ? 0 : 1`. `traceOut` dans `FIRST`, `REST` et `model.set`. `AT.section` (rien de `model` ni de `bord` devant la coupe). `VIEW.exploded` remplacée ; `VIEW.masses` refaite (de bâbord-arrière) ; ajoutées `fuelHolds`, `bowWave`, `approachFar`, `lsoBack`, `tanker`, `thumb1`, `thumb3`, `boardTop`, `forrestalFire`, `hook4…hook6`.
- `navire.js` (les seules lignes demandées) : `CUTZ = CUT.z` ; la peinture ne couvre plus l'empreinte de la cabine ; **le dôme du ciel passe de l'ordre 100 à 17**, avant la passe de profondeur des coques de verre (19) — les avions de verre ne sont plus des silhouettes noires devant l'aube (vu sur la planche) ; le pont vu de haut reste sombre (vu : `shipWide`).
- `docs/L04-actes.md` : une section « Ce que les décors ont changé » en tête, et les lignes touchées (la navette à 70,4, `traceOut` au lieu d'un `trace` qui redescend, l'état de la coupe, `paddles` 0,5 → 1, les poses vues).

**Pas fait, et pourquoi**
- Les sièges de la cabine : rien à faire — `model.js` les a déjà tournés (+z vers la console, au plancher y −88) et `bord.js` assoit ses figurants ainsi (vu dans `VIEW.cabin` par les deux décors).
- Une seule plateforme LSO : `navire.js` n'en dessine pas ; celle de `bord.js` est la seule.
- Les freins à s = 36 / 48 / 60 m, ±7,5 m en travers : `model.js` les place déjà là (le frein d'Andromède de −7,6 à +6,5 m en travers) ; les fenêtres de `navire.js` concordent.
- Reculer `CAT[0].from` pour la course entière : non — tout (déflecteur, ballon, vanne, cabine, chien jaune) a été construit contre lui ; arrêter la navette à 70,4 m ne coûte rien à l'image.
- `scrape` (les étincelles de la crosse à l'appontage) : non branché dans `world.js` (pas de nombre dans `FIRST`) ; à ajouter si c6 le demande.

**Vu sur la planche de vérification** : les coutures c12 (descente vers le chien jaune : il est petit au départ, c'est le début de la descente), c23 (vers la vague d'étrave), c34 (au-dessus du pont, au crépuscule), c56 (du frein vert au câble) tiennent sur les vrais décors ; la barre de lancement est dans le croc ; les masses se lisent.

**La planche de la première image** : `scratchpad/L04/L04-premiere-image-6.jpg` (avec l'en-tête) — `hook1` profil bas · `hook2` train avant de face · `hook3` derrière la queue au-dessus du déflecteur · `hook4` trois quarts arrière au ras (un homme de pont de verre au premier plan) · `hook5` sous l'aile · `hook6` depuis le chien jaune (l'avion petit). Le choix est à l'orchestrateur.

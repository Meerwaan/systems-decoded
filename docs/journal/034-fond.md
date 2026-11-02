# 034 · fond.js — journal du décor (l'Atlantique de nuit)

2026-10-30. Agent `decor`, fichier `episodes/034-boite-noire/src/fond.js`. Dossier temporaire : `.cache/planches/034/fond/`.

## Lu
recette-agents, regles-image, 034-decors (haut + section fond), plan.js, world.js (`FIRST`, `VIEW`, `apply`), journal architecte, 023/avion.js (skin, BODY, FIN, STAB, foil, lifting, traits), build3d (glass, asShell, lineMat), atmo (makeMotes).

## Choix de construction
- Neige marine : shader maison (d'après `makeMotes`) dans un cube de 9 m **centré sur la caméra** (`cameraPosition`), trois couches (monte / descend / flotte) en fondu selon `rush` — pas d'intégrale du temps, rien ne saute quand `rush` change. Éteinte dans les plans de plus de 300 m.
- Anneaux : la sphère d'onde grandit dans le shader au rythme de l'écran (rayon = k · phase · distance caméra, borné à `PING.reach`), née au nez de la balise : l'anneau est accroché au pivot de la boîte (world.js `deepPivot`, trouvé par son `rotation.order` "YZX") pour suivre `spin` / `tilt`. Coupé sous le fond.
- `fog(d)` sert aussi à régler ce qui dépend de la distance de la caméra (fondus des lignes larges, neige) : il est appelé juste après `update` dans `apply`.

## Planches
1. p1 (8, liste fermée sur bouchon du modèle) : `range` et `ocean` lisibles d'emblée (dôme veille, point de la boîte, ellipse de surface, tambour de verre) ; queue trop proche dans l'accroche (33 m : 1,7 fois la largeur), cassure en dents de scie criarde ; neige invisible ; `floor` sans fond ; `rise` sans fond.
2. p2 : quatre attitudes de queue (variantes tirées par `time`, code d'essai retiré ensuite). Calcul : aileron vu à plat si l'axe z de la queue est parallèle au rayon caméra → `rx 0.91, ry −0.5` (Euler YXZ). Fond invisible de près = **précision** : un plan de 1 200 km, ses varyings interpolées sont fausses de plusieurs cm près de la caméra → deux plans (proche 12 km, 48×48 ; lointain 1 200 km, plans larges seuls).
3. p3 : décalage à droite trop fort (queue hors cadre) ; surface en « vers de terre » (courbes fermées) → houle en longues crêtes. Halo `pool` en dalle grise → baissé.
4. p4 : variante B retenue (`[1510, 3170, −1970]`, aileron en haut à droite, cassure en bas à gauche derrière la boîte). `VIEW.rise` en contre-plongée (el −18) ne voit jamais le fond → pose par-dessus proposée. La lampe suit le module quand il quitte le fond (sinon il monte hors du faisceau).
5. p5 (avec en-tête) : accroche, descente, fond, seule, épave (lampe 0,8 / 1), remontée. Lisibles ; « UNE BOÎTE » ne tombe sur rien de clair. Retouches à l'aveugle ensuite (budget d'images dépassé : **40 vignettes lues pour 30**, faute de ma part — p1 à p5 à 8) : queue de l'accroche recalée entre les variantes A et B de p4 (`[1250, 3080, −2120]`), anneaux de cadres cassés (ils flottaient en cerceaux entiers), épaves non éclairées plus sombres. `npm run check -- 034` passe.

## Ce que fait chaque nombre
- `depth` : place la mer (fond, surface, colonne) ; la queue qui coule remonte de 25 % de ce que la boîte descend (elle coule moins vite, par l'état, pas par l'horloge : la boucle retombe juste) ; la surface ne se voit qu'au-dessus de ≈ 150 m ; le halo `pool` ne s'allume qu'à moins de 4 m du fond ; la lampe suit le module dès qu'il quitte le fond.
- `rush` : trois couches de neige en fondu (+ monte, − descend, 0 flotte), traînées de 0,09 s.
- `wreck` : 0 la queue coule (`SINK`), 1 couchée dans le champ (`WRECK.tail`), stabilisateur du dessous caché.
- `ping` : l'anneau (phase `PING`, comme model.js), sa force ; couleur du point (veille / encre morte).
- `range` : dôme coupé au fond + son empreinte au sol ; le point de la boîte s'allume seul dès qu'elle ferait < 6 px.
- `beam` : la lampe descend linéairement ; l'éclairage (fond, épave, neige) n'arrive qu'à partir de 0,55 (la lumière doit être près du fond).
- `shell` : tout le rayon X (neige, fond, surface, épave). `pool` : halo encre sous la boîte. `mood` : liseré signal de la cassure et léger teint signal du verre de la queue qui coule.

## Poses qui cadrent
- Épave : `{ tx: -2200, ty: 700, tz: -3800, d: 9500, az: -18, el: 24, fov: 40, shift: 0 }` (queue couchée entière, moteur, lampe en haut à droite à beam 1 ; la boîte est hors champ).
- Remontée : `{ tx: 0, ty: 19, tz: 0, d: 170, az: -30, el: 24, fov: 40, shift: 160 }` (par-dessus : le fond éclairé sous le module, qui s'éloigne avec `depth`).
- `range`, `ocean`, `sink`, `floor`, `alone` de l'architecte : bons tels quels.

## Pas encore au niveau
- L'accroche : la queue se lit comme « un morceau d'avion de verre » plus que comme « une queue » au premier tiers de seconde : l'aileron est en haut à droite, le cône passe derrière la boîte. La dernière position n'a pas été revue sur planche.
- Le fond éclairé (`wreck`) : courbes de niveau un peu en « camouflage ».
- La boîte n'est pas « au bord » du plan d'épave proposé.

## À changer ailleurs
- `episodes/034-boite-noire/src/plan.js`, dans `WRECK` : `tailSink: [1250, 3080, -2120], //  the tail section's centre while it sinks (cm from the box): fin seen flat from POSE0's family, its break down-left behind the box` (fond.js porte les mêmes nombres dans `SINK.at` et les lit lui-même).
- `episodes/034-boite-noire/src/world.js`, `VIEW.rise` : `rise: { ...P, tx: 0, ty: 19, tz: 0, d: 170, az: -30, el: 24, fov: 40, shift: 160 },`
- `episodes/034-boite-noire/src/world.js`, `VIEW.wreck` : `wreck: { ...P, tx: -2200, ty: 700, tz: -3800, d: 9500, az: -18, el: 24, fov: 40, shift: 0 },`

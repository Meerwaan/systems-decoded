# L03 — `avion.js` : l'avion de ligne aux rayons X, ses toboggans, ses sites

Agent de décor, 22/10. Fichier : `episodes/L03-evacuation-avion/src/avion.js` (interface inchangée : `buildAvion()` → `{ group, A, set(p, time, px) }`). Six planches `look` lues (b1 à b6, 43 vignettes), dossier temporaire `scratchpad/L03/avion`.

## Ce qui est construit

- **Trois avions, chacun sa silhouette** (`NOSES`, `TAILS`, `SPEC`) : coque de verre (`glass` + `asShell`) tracée par des splines de section propres à chaque variante. A350 : nez Airbus, **masque noir** du pare-brise, **sharklets** courbes, deux gros moteurs. A380 : section plus haute que large, front plein, **deux rangées de hublots**, deux ponts de têtes, **quatre moteurs**, barrières en bout d'aile. 737-200 : fuselage étroit, nez long, vitres « sourcils », JT8D longs et fins collés sous l'aile, train court, dérive avec sa nageoire dorsale.
- Lignes : cadres tous les ≈ 6,4 m (1,8 px, opacité 0,2), crête, quille, ceinture de hublots par pont, plancher, contours des portes, vitres du cockpit, contours des ailes et de l'empennage. Aucun trait sous 1,8 px.
- Pleins : nacelles (trois gris), train (pneus, jantes, jambes), feuilles de porte, **toboggans**, sacs des évacués.
- **Toboggans pleins** (`buildSlide`) : deux boudins latéraux et leurs rails hauts, piste de glisse, boudins transverses dessous, poutre de tête, boudin de pied, le paquet (`bundle`). Gris chaud clair, sans vernis (le vernis prenait le liseré veille de `mood` 0). Déployés une fois pour toutes, puis déroulés et gonflés dans le shader (`uCut`, `uRound`) : 0,3 → 0,45 le paquet tombe sous le seuil, 0,45 → 0,7 il se déroule en pendant raide (le pied ne traverse jamais le sol), 0,6 → 1 la pente se tend jusqu'au sol, 0,68 → 0,98 les boudins s'arrondissent. **La lampe d'évacuation** de la porte l'éclaire depuis sa tête dès 0,5 (émissif encre qui décroît le long de la pente : il est lisible même dans le hangar noir).
- `gulp` : 56 volutes veille par toboggan, aspirées vers sa tête en accélérant, traits de 3,4 px.
- **Évacués** : une foule GPU (`makeCrowd`, 400 au plus : 379 A350, 400 A380, 137 737) dont la seule horloge est `evac` — pas d'état, pas de saut. Chaque silhouette glisse assise (0,05 d'`evac`), se relève (0,016), marche (0,24) vers le champ `GATHER` à Haneda (celles de droite contournent le nez) ou à 8–17 m du pied ailleurs ; arrivée, elle passe **veille**. Mélange « par-dessus » (pas additif) : une foule ne brûle jamais au blanc. `bags` : sac plein signal dans la main droite. `hurt` : une silhouette assise signal au pied du premier toboggan.
- Cabine vue de dehors : hublots (`lights` encre chaude, `emerg` une lueur + des points de secours en hauteur et aux sorties), têtes (`pax`), **fumée** (paroi proche d'un tube intérieur, sombre teintée signal, bord bas qui roule lentement, descend jusqu'à 1,20 m puis 60 cm — elle éteint les hublots qu'elle couvre), **breach** (lueur signal basse et irrégulière qui court le long de la cabine depuis le feu, hublots signal).
- **Feu** (`makeFire`, volume en tranches de 013 généralisé en ellipsoïde) : cœur blanc, signal ≤ 1,1, sous la coque. Haneda : sous le fuselage à l'emplanture, à gauche et dessous ; Manchester : moteur et aile gauches, traînant vers l'arrière. **Panache** (`makePlume`) : colonne sombre qui roule, éclairée signal par en dessous seulement. Braises. Une lumière ponctuelle signal au feu (2,6·10⁵, monte avec `fire`).
- `spin` : soufflante du moteur droit intérieur en flou lisse, sa lèvre et sa bouche signal qui respirent. `thump` : boule de lumière au moteur gauche du 737 (737 seulement).
- Portes : contour par porte (sa propre matière). `shut` : signal + hublot de porte en feu à Haneda ; encre sombre barrée au hangar. Manchester 1R (`doorC` 0,05 → 0,3) : entrouverte, son paquet coincé au seuil, contour signal ; ≥ 0,3 elle s'ouvre et le toboggan se déploie. Trappe `WR` : tirée vers l'intérieur et retirée (pas de toboggan). `mark` : anneau veille autour de la porte.
- Dash 8 (verre, aile haute, empennage en T, hélices arrêtées) ; épave dès `dash` 1,15 : terne, de travers, un feu bas.
- Sites : piste (bords, herbe en quelques traits longs, axe en tirets et lampes qui glissent, **jamais de trait transversal**), hangar (portiques, pannes, grille au sol de 6 m, lampes de secours), poste de stationnement (marquages, façade vitrée du terminal à z −4500, passerelle télescopique en trois tronçons). Ciel : un fil d'horizon ; Manchester un bandeau d'encre au matin. **Horizon laissé libre** pour le décorateur.

## Les paramètres (une ligne chacun)

- `amount` : la coque, les ailes, les lignes (les hublots gardent 45 %, les têtes 35 %).
- `variant` 0/1/2 · `site` 0/1/2/3 : l'avion montré, le lieu (piste ou hangar ou poste ; ciel).
- `run` : la piste et le Dash 8 viennent vers +x quand `run` grandit (voir « À changer ailleurs ») ; lampes rebouclées sur `RUNWAY.pitch`.
- `alt` : l'avion, ses toboggans, sa foule et son feu montent ; la piste reste.
- `doorA` / `doorB` / `doorC` : 0 → 0,3 la porte sort puis pivote vers l'avant le long de la coque ; 0,3 → 1 le toboggan (ci-dessus).
- `shut` : portes fermées marquées (signal + feu au hublot à Haneda ; sombres et barrées au hangar).
- `evac` : la foule (ne fait que croître) · `bags` : part qui porte un sac · `hurt` : la silhouette signal assise.
- `spin`, `thump`, `fire`, `breach`, `smoke`, `lights`, `emerg`, `pax`, `pilots` (deux pilotes de verre sous le pare-brise, l'éclairage de leurs instruments ; le masque de l'A350 s'éclaircit), `mark`, `gulp` : comme dans `FIRST`.
- `dash` : 1 posé · 1,15 → 1,8 épave et feu bas.
- `bridge` : la passerelle se télescope jusqu'à la 1L (site 3) ; **au-dessus de 0,5 la porte est désarmée : elle s'ouvre sans toboggan** (choix de ce décor : on ouvre dans la passerelle).
- `mood` : lu mais sans effet ici.

## Ancres

`A.door(v, id)`, `A.foot(v, id)` (pied exact de la pente finale), `A.engineR`, `A.nose`, `A.gather` ; **ajoutées** : `A.cockpit` (têtes des pilotes), `A.fire` (cœur du feu, suit le site).

## Les poses qui cadrent bien (complètes, prêtes à coller)

`P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` ; `set: SET.PISTE`.

- **Miniature 1 « 90 SECONDES »** — toboggan 1L plein, ≈ 45 % de la hauteur, éclairé par sa lampe, le 2L derrière, le hangar noir ; rien de lourd dans le quart bas droit :
  `thumbSlide: { ...P, ...SHARP, tx: -2650, ty: 230, tz: 850, d: 2600, az: -25, el: 2, fov: 32, side: 300 }`
  état : `{ ...AT.hangar, doorA: 1, shut: 1, mood: 0, fx: -2700, fy: 250, fz: 800, fs: 900 }` (vérifié à 85,4 s). Plus serré (≈ 70 %, coupé par le bas) : même pose `d: 1500, side: -250`. Avec `mood: 1` le liseré rosit le toboggan : garder `mood: 0`.
- **Toboggan de profil, du pied vers la porte** (bon raccord) : `{ ...P, ...SHARP, tx: -2500, ty: 230, tz: 850, d: 1800, az: 30, el: 3, fov: 30, side: 120 }` + `{ site: 1, doorA: 1 }` (le pied à gauche, la porte en haut à droite ; avec `mood: 0` la piste de glisse verdit un peu).
- `planeWide`, `planeSide`, `slideFoot`, `door1L`, `a380Wide`, `a380Side`, `b737Wide`, `engineR`, `cockpit`, `approach`, `hangarWide`, `gather`, `apronDoor`, `hook2`, `hook3` : **les poses de `VIEW` tiennent telles quelles** avec les états de vérification de `docs/L03-decors.md` (`fs` 1 200 à 1 800 sur les plans rapprochés).
- **`dash` est à refaire** : avec le Dash devant le nez, `VIEW.dash` (az −60) le laisse derrière la caméra. Vérifiée : `dash: { ...P, ...SHARP, tx: -14000, ty: 300, tz: 0, d: 9000, az: 60, el: 4 }` + `{ dash: 1, run: -80000 }` (le Dash 8 petit sur la piste, 225 m devant).
- Épave : `{ ...P, ...SHARP, tx: -3600, ty: 250, tz: 0, d: 4500, az: -50, el: 5 }` + `{ dash: 2, run: -56660, fire: 0.5 }`.
- `door1L` + `{ site: 3, doorA: 0.6, gulp: 1, lights: 1 }` : le toboggan pend raide, les volutes veille entrent dans sa tête.

## Un cran en dessous

- Le toboggan reste une « planche à boudins » vu de loin ; de près il tient. Il n'a pas de courbe au pied (pente droite).
- `thump` se perd dans le feu du 737 quand `fire` > 0,5 : le jouer avant le feu.
- Le feu du 737 en plan rapproché (`b737Fire`) est une grosse masse : `fire` ≤ 0,5 sur ce cadre.
- Le panache reste une brume rouge sombre au-dessus du feu sur fond noir (voulu, mais peu lisible).
- La foule à 1 000 de distance du pied (`slideFoot`, `evac` 0,6) est dense : c'est le vrai débit, mais on ne lit plus les individus.
- Aucune silhouette ne sort par la trappe sur l'aile du 737 (pas de toboggan) : la foule de Manchester passe par 1L et 1R.
- Une porte du groupe B qui s'ouvre tard fait apparaître ses évacués d'un coup (fondu sur l'ouverture) s'ils auraient déjà dû partir : ouvrir B avant que `evac` n'atteigne leur tour, ou accepter le fondu.
- Vitesse : les silhouettes sont bornées par le rythme d'`evac` ; au-delà de ≈ 1/40 s⁻¹ elles traversent le champ trop vite.
- L'en-tête : sur la miniature et les plans de flanc à `ty` ≈ 230, la crête claire de la coque passe derrière l'en-tête — baisser `ty` de 40 ou monter `el` si elle gêne.
- Non vu : `bridge` entre 0 et 1, Haneda avec `breach`, le hangar avec l'A380 en gros plan, `hurt` hors Haneda.

## À changer ailleurs

1. **`plan.js` / `world.js` — le sens de `run`** : avec `x = DASH.x − run` et `run` qui croît, le Dash 8 arrive par l'arrière et la piste défile à l'envers (l'avion reculerait). Ce décor dessine le Dash à `x = DASH.x + run − 2·DASH.hit` et fait glisser la piste vers +x : au choc (`run = DASH.hit`) la queue du Dash touche le nez, exactement comme `runAt` l'attend ; rien à changer dans les chapitres. Corriger seulement le commentaire de `FIRST.run` et de `DASH` : « the Dash 8 stands at x = DASH.x + run − 2·DASH.hit (ahead of the nose until DASH.hit) ».
2. **`world.js` · `VIEW.dash`** : `{ ...P, ...SHARP, tx: -14000, ty: 300, tz: 0, d: 9000, az: 60, el: 4 }`.
3. **`world.js` · `VIEW.thumbSlide`** : `{ ...P, ...SHARP, tx: -2650, ty: 230, tz: 850, d: 2600, az: -25, el: 2, fov: 32, side: 300 }`, état `{ site: 1, doorA: 1, shut: 1, mood: 0, fx: -2700, fy: 250, fz: 800, fs: 900 }`.
4. Les chapitres : `bridge` > 0,5 désarme la porte au poste (aucun toboggan) ; `gulp` n'est pas coupé tout seul quand le toboggan est debout (le chapitre le ramène à 0).

## Retouche du 23/10 — l'A380 au hangar (consigne de Merwan : « un avion à deux étages, les détails sont importants »)

- Les portes condamnées du hangar passent en **signal** : contour et croix, trait de 3 px, sans aplat, au-dessous de 3 (couleur × 1,25), sur les deux ponts (M1R…M5R, U1R…U3R ; à l'A350 1R…4R). Haneda et Manchester sont inchangés.
- Vérifié sur les poses de c3 (WIDE, HIGH flanc droit, SIDE « jaillissent », UP U1/M2) : les huit portes condamnées, les portes du pont supérieur, leurs toboggans plus hauts et plus longs, et les deux rangées de hublots se lisent. Avec `mood` 0, les nacelles prennent un liseré veille sur le flanc droit (c'est la lumière du plateau, pas le décor).

## Retouche du 23/10 — le toboggan doit se lire GONFLABLE (relecture du film entier)

- `buildSlide` refait : chaque paroi est un gros boudin (r 28 sur les gros-porteurs, section ≈ 56 cm ; 22 sur le 737) avec un boudin plus fin posé dessus (un mur, pas deux rails). La toile de glissade claire (0xcdc2a8, peu de reflet du plateau) est tendue près du haut des boudins et un peu creusée, deux couloirs et un boudin central bas sur l'A350 et l'A380. Gros boudin de tête (1,5 r) à la porte, boudin de pied, pied qui s'évase de 22 % au sol (shader, `uL`). Boudins transverses sous la toile, tous les 4,2 m, montrés seulement une fois gonflés. Largeur : 215 cm (gros-porteurs), 140 (737).
- Gonflage : les boudins ne descendent plus sous 40 % de rondeur (fini, l'« échelle » plate du pendant). Lampe de porte un cran plus forte. Déroulé, interface et foule inchangés ; la foule est assise sur la toile, sur deux couloirs.
- A380 : ses deux ceintures de hublots et le plancher du pont haut sont tracés en trait d'`outline` (0,6) : les deux ponts se lisent même lumières éteintes ; de trois quarts il est nettement plus haut que l'A350 (vérifié côte à côte).
- Vérifié : miniature (85,4 s), c1 0,5 s, c3 168 s et 181,95 s, c5 420,7 s, c6 487,55 s. Reste : avec `mood` 0 ou 1, le liseré du plateau teinte encore légèrement le haut des boudins (vert ou rose).

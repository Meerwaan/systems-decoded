# 039 · corium.js — journal

Agent décor, fichier `episodes/039-cendrier-reacteur/src/corium.js` (la menace). Planches : `.cache/planches/039/corium/p1…p5.jpg` (essais `e1…e5.json`). `npm run check -- 039` passe.

## Ce qui est construit

- **Une matière « lave »** (GLSL `lava`, partagée) : croûte en plaques (Voronoï déformé) bombées, éclairées par la clé (normale analytique, rien qui scintille), petites fissures secondaires (effacées avant de passer sous le pixel), fissures orange (signal pur ≈ 1–1,4) dont le cœur passe au blanc chaud, zones entièrement fondues (bruit large), lueur des fissures sur le bord des plaques. `cool` éteint la chaleur : croûte sombre, veines fines. Rien au-dessus de 3. Sert au bain de la fosse, à la langue du canal, au tas et à la galette.
- **Le ventre** : calotte inférieure (une face, vue de dessous ; vue d'en haut elle disparaît, plus de voile rose) — acier sombre, rouge centré sur le point bas, marbrures et veines lentes ; la brèche : lèvre blanc chaud, le corium dedans.
- **La goutte** (période 1,6 s, phase calée) : à 0,04 s elle pend et gonfle, à 0,3 s elle se détache (le col casse), à 0,7 s elle tombe (à g, étirée) ; anneau qui court dans le bain à l'impact, petit éclair au point de chute ; braises en traînées autour du trou (périodiques). **Le filet** (`pour` 0,5 → 0,66) descend du trou jusqu'au bain, s'épaissit avec `breach`, ondule à peine, halo additif ; collerette et gerbe d'étincelles là où il tombe.
- **Le bain** : flaque qui court depuis le centre (rayon 300·pit/0,3, bord organique, bourrelet chaud), puis monte (jusqu'à 80 cm) ; lueur au contact du revêtement (anneau additif vu de l'intérieur seulement) ; **la porte** = un cercle plus chaud au rayon `PLUG.r` ; convection lente, tourbillon quand `flow` monte (la vidange). Fumées ink lentes (puffs ombrés, effacés près de la caméra).
- **Le flux** : colonne de chute sous la porte (0 → 0,2), puis **langue** sur le radier du canal (`CHANNEL.from` → `to`), nez arrondi et bombé, plus clair à la tête, croûte qui avance avec le front ; `A.front` suit la tête.
- **La chambre** : UN maillage (grille 100 × 170 sur la dalle), hauteur calculée dans le vertex shader. Tas (dôme bosselé) → galette (plate, bourrelet au front) ; épaisseur = volume / aire (aire comptée dans `update` sur une grille de 50 cm, sans allocation), bornée à `HEAP.h` (45 cm quand il vient du canal). Source du front : la bouche (`CHANNEL.to`) quand `flow` ≥ 0,9 (lissé de 0,5 à 0,9), sinon `HEAP.at`.
- **Les flèches** (11, une rangée en travers) sous la dalle, vues à travers elle (`depthTest` off), le corps redessiné par-dessus tant qu'elles sont là : épais → serrées (48 cm) et longues (150 cm, elles traversent la dalle) ; mince → espacées (96 cm) et courtes (34 cm). Une bande claire descend lentement le long de chacune.
- **Vapeur** sur la galette : puffs ink qui montent, d'abord le long des murs (`water` 0,8), puis partout (`water` 1). **Explosion** : deux jets d'eau ink (verre) versés à côté de la cuve (→ 0,3), sifflement au contact, puis nuage teinté signal qui gonfle depuis le bain, éclair qui a un endroit, gouttelettes projetées (pilotées par `blast`, pas par l'horloge), le nuage retombe et s'éclaircit (→ 1).
- Deux lumières ponctuelles signal (fosse, chambre) : le corium éclaire ce qui l'entoure (fosse ≤ 5e4, chambre 6e5 × mass).

## Poses vérifiées sur planche

- `POSE0` tel quel : goutte lisible aux trois instants (gonfle / se détache / tombe), braises.
- `VIEW.overPit` tel quel : filet, collerette, bain, fumées (la brume ronde au-dessus vient du cœur de la cuve, batiment.js).
- `VIEW.sheet` tel quel : `spread` 0,3 / 0,7 / 1 — la mer orange qui part de la bouche, puis la croûte sous l'eau (`cool` 0,6) avec veines.
- `VIEW.pitSide` tel quel : `blast` 0,3 (jets + sifflement) et 0,8 (la fosse pleine de vapeur rose).
- **Canal** (la langue est cachée derrière le mur du canal dans `VIEW.channel`) : `{ tx: 0, ty: -300, tz: 380, d: 700, az: -28, el: 62, fov: 40, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 }`.
- **Bouche** (la langue sort, le premier éventail) : `{ tx: 0, ty: -330, tz: 1000, d: 1400, az: -22, el: 45, fov: 38, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 }` avec `flow` 1, `mass` 0,15, `spread` 0,08.
- **Tas + flèches** (dans `VIEW.heap`, el 20, le tas cache ses flèches ; sous une galette vue d'en haut, elles sont toujours cachées) : `{ tx: 0, ty: -330, tz: 1600, d: 1300, az: -30, el: 7, fov: 32, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 8 }` — le tas au-dessus, les flèches serrées sur la tranche noire de la dalle ; `spread` 1 : la galette, des flèches courtes et espacées. La caméra doit rester basse tant que `arrows` > 0.
- **Non vérifié** (budget d'images dépassé) : `VIEW.plugTop` à `pit` 1 est trop près (caméra à 1,6 m du bain : tout l'écran est une plaque orange floue de bloom). À essayer : `{ tx: 0, ty: 80, tz: 0, d: 520, az: -35, el: 62, fov: 34, shift: 60, dof: 0 }` — le cercle chaud de la porte (r 55) dans le cadre.

## Pas encore au niveau

- L'explosion de vapeur reste une brume rose douce : elle se lit (« une bouffée qui remplit la fosse »), mais sans volutes nettes.
- Gros plan sur le bain (`plugTop`) : trop proche, illisible (voir pose ci-dessus).
- L'accroche dépend de `model.js` : le revêtement de la fosse est un grand mur gris-beige derrière la goutte (sombre sur clair, contraste perdu).
- Budget dépassé : 36 vignettes lues pour 30.

## À changer ailleurs

- `model.js` (agent du système) : la face intérieure du revêtement de la fosse est un grand aplat gris clair dans `POSE0` : la foncer (≈ `0x2a2622`, `rough` 0,9) pour que le ventre rouge et la goutte restent clairs sur sombre.
- `model.js` : le disque veille de la porte (`plugGlow`, à y 4,5) couvre la flaque du début (y 0,6, `pit` < 0,1) : le poser à y ≤ 0,3 (ou plus fin), sinon la goutte tombe sur un disque vert et non dans le corium.
- `world.js`, `VIEW.heap` → `{ ...P, ...CLOSE, tx: HEAP.at[0], ty: HEAP.at[1], tz: HEAP.at[2], d: 1300, az: -30, el: 7, fov: 32, shift: 0 },`
- `world.js`, `VIEW.channel` → `{ ...P, tx: 0, ty: -300, tz: 380, d: 700, az: -28, el: 62, fov: 40, shift: 0 },` (ou laisser au monteur de l'acte 3 un travelling au-dessus du canal).
- `world.js`, `VIEW.plugTop` → essayer `{ ...P, ...CLOSE, tx: 0, ty: 80, tz: 0, d: 520, az: -35, el: 62, fov: 34, shift: 60 },`
- `POSE0` : le ventre passe derrière l'en-tête (contraste du HUD en défaut à 5,19 s au `check`) — à régler à la première image (ombre de l'en-tête, ou sujet un peu plus bas).

## Pour le catalogue

- **Le corium** `039/corium.js` — Matière en fusion (shader `lava` : croûte en plaques bombées, fissures orange au cœur blanc, zones fondues, `cool`), ventre rouge et brèche, goutte périodique puis filet, bain qui monte, langue dans un canal, tas → galette à volume conservé, flèches de chaleur, vapeur, explosion de vapeur ; `makePuffs` (fumée / vapeur / nuage ombrés) et `makeSparks` (braises en traînées, périodiques ou pilotées).

## Retouche du 05/11

Planches : `.cache/planches/039/corium-retouche/avant.jpg`, `apres1…4.jpg`. `npm run check -- 039` passe.

- **40,8 s, flèches de droite invisibles** → ce n'était pas l'ordre de dessin (essayé, sans effet) : vue basse (el 8) depuis +z, la galette vue au-dessus du mur avant de la chambre cache les flèches trop loin derrière lui. Quand `spread` monte (0,3 → 0,9), la rangée vient à `CHAMBER.z1 − 600` (à 150 cm de l'avant elle tombait dans les sous-titres). Vérifié à 40,8 / 41,6 : sept flèches en rangée juste sous le haut du mur, au-dessus des sous-titres.
- **19,5 et 50,6 s, la porte sous le bain** → dans le bain, un anneau clair (ink 0,82, sous 1 : pas de bloom) entre deux bandes sombres, au rayon `PLUG.ring + 4` (celui de l'anneau veille de model.js). `uRingK` suit `P.plug` (0,2 → 0,3) si world.js le passe, sinon `pit` (0,3 → 0,45). Vérifié à 19,5 et 50,6.
- **Première image trop calme** → `uPulse` (dans `VS_BODY`) : des renflements descendent le filet à ≈ 3 m/s, halo compris ; des gouttes (`globs`, 26 traînées) tombent à côté du filet du trou au bain. Vérifié à 0,04 / 0,0733 (en continuité), 0,3, 0,55. La gerbe d'arrivée est cachée par le bord de la fosse dans `POSE0` : non touchée. `qa` à refaire sur le brouillon.
- **70,5 s, explosion de vapeur** → `makePuffs` gagne `uCrisp` (1 sur le seul nuage de l'explosion) : bord lobé net, antialiasé, petites volutes ombrées dedans ; teinte 0,7 → 0,5 (vapeur blanche, éclairée signal par-dessous). Vérifié à 70,4667 / 70,5 : continu, sans saut.

### À changer ailleurs

- `world.js`, ligne 169 (l'appel `corium.update`) → `arrows: S.arrows, cool: S.cool, steam: S.steam, blast: S.blast, water: S.water, plug: S.plug,` (l'anneau suivra alors `plug` au lieu de `pit`).

# 010 — shop.js (le décor : la scie aux rayons X, la planche, toi)

Journal de l'agent propriétaire de `episodes/010-scie/src/shop.js`. Budget : 30 images lues.

## Parti pris (avant la première planche)

- **Tout ce qui est la scie est en verre** (caisson, plateau, guide, rails, volant, interrupteur, moteur et courroie) ; **pleins** : la planche (gris clair veiné) et tes deux mains. La tête est en verre (de près, il ne reste de plein que ce dont parle la phrase : la main).
- **Le moteur et la courroie** sont une coque de verre à part, dessinée avant le caisson (ordre 15) : on les voit à travers la tôle. Le brin de courroie suit `drop` (la poulie d'arbre tourne autour d'`ARBOR.pivot`).
- **La planche** : deux bandes pleines (gauche / droite du trait) sur toute la longueur + un « pont » qui bouche la partie pas encore sciée. Les arêtes intérieures des bandes dessinent le trait de coupe tracé au crayon devant la lame. Veines : un seul calcul d'anneaux de croissance (le tronc court sous la planche, un peu de travers) → cathédrales sur le dessus, arcs en bout.
- **La main gauche** : la main « real » du kit, mais posée par mes soins (`rigHand`) : doigts à plat, pouce rentré, ongles, jointures. Le bout de l'index est amené exactement en `TOUCH` à `slip` 1.
- **Le coude est en arrière** (pas sorti à gauche) : avec le coude sorti, une caméra à az −40 regarde dans l'axe de l'avant-bras, qui couvre la main. La première image se cherche donc plutôt entre az −55 et −75.

## Écarts par rapport au plan (à valider par celui qui orchestre)

- `BOARD.lead0 = 16` + `length 92` mettent le bout de la planche derrière toi (z = 102, tu es en z = 78). Dans shop.js, le bord d'attaque est en `z = −34 − feed` (constante `LEAD`) : à `feed` 6 la planche va de z = −40 à z = 52, son bout dépasse du rail avant et ta main droite le pousse. Le trait de scie fait alors ≈ 48 cm (il s'allonge bien de `feed`).
- `YOU.z = 78` est tenu pour **les pieds**. Les hanches sont 12 cm plus en avant (z = 66), genoux un peu fléchis, buste penché de 26° : sans ça, le bras (57 cm) n'atteint pas la lame.

## Planches (24 images lues sur 30 après la planche C)

- **A (8, bouchon de lame)** : la main se lit ; l'avant-bras de verre (glassK 1,9 + reflet) est une tache blanche de près → glassK 1,1, `spec` 0,3, et un poignet plein (`wrists`) qui sort de la manche de verre. Bras droit « main sur la hanche » → la planche avance (LEAD −40), coude en arrière. Courroie derrière la place de la cartouche → moteur passé en avant de l'arbre (z = +9).
- **B (8, lame provisoire)** : cadrage de la première image trouvé autour de az −62 / el 24 ; `circuit` se lit très bien ; `harm` était un voile orange sur toute l'image → halos réduits, c'est la main elle-même qui prend la couleur ; le râtelier de planches couchées traçait des horizontales à travers ta tête → remplacé par des planches debout appuyées aux murs ; guide et rails en verre plus discret (`fx.beam`), sinon dalle grise sous l'en-tête.
- **C (8, vraie lame de model.js)** : model.js dessine la poulie d'arbre → la mienne retirée, la courroie court jusqu'à la sienne (x = 8, r 2,2). Sous le plateau : la cartouche se voit, rien de moi devant ni derrière. **La lame à pleine vitesse est un voile translucide : sur la planche claire, son arc au-dessus du bois ne se voit pas** → planche un ton plus sombre (0,24), parois du trait de scie dans l'ombre (le trait est une ligne sombre quel que soit l'angle), sciure plus dense.

- **D (4, avec en-tête et zones)** : planche sombre → la main ressort nettement. À el 20 l'arc de lame au-dessus du bois reste presque invisible ; à el 13 il se détache sur le guide (sombre). `circuit` 1 : halo de poitrine baissé, plus de voile vert. Main retirée trop haute (derrière l'en-tête) → pose `AWAY` abaissée : la main plane à 21 cm au-dessus de la planche, avant-bras dans son prolongement.
- **E (2, avec zones) — dernières images (30/30)** : `POSE0` vérifié (la main entre y ≈ 780 et 1020, poignet sous la colonne de boutons, disque de la lame sous la planche). « Après » : lame arrêtée sous la table, trait de scie vide visible en ligne sombre ; la main est au bord droit du cadre → pousser `side`.
- Après E, non revu en image : poignet aminci (rayon 2,15, aplati 0,76) — il paraissait plus épais que la paume.

## Poses (prêtes à coller ; `roll: 0, drift: 0`)

- `POSE0` : `{ tx: -2.5, ty: 91, tz: 13, d: 80, az: -70, el: 16, fov: 40, shift: 150, side: 60, roll: 0, drift: 0 }`
- macro doigt / dents (`slip` 0,95 → 1) : `{ tx: -0.8, ty: 90.6, tz: 8.2, d: 26, az: -80, el: 42, fov: 28, shift: 150, side: 0 }`
- toi en entier : `{ tx: -6, ty: 92, tz: 30, d: 640, az: -74, el: 8, fov: 28, shift: 120, side: 0 }`
- sous le plateau (`table` 0,15) : `{ tx: 0, ty: 72, tz: -10, d: 95, az: -58, el: 4, fov: 28, shift: 150, side: 0 }`
- le bras (`circuit`) : `{ tx: -16, ty: 112, tz: 30, d: 170, az: -72, el: 12, fov: 28, shift: 150, side: 0 }`
- `harm` : `{ tx: -3.5, ty: 91, tz: 11, d: 66, az: -62, el: 24, fov: 40, shift: 150, side: 0 }`
- après (`drop` 1, `blur` 0, `flinch` 1, `nick` 1) : `{ tx: -15, ty: 100, tz: 18, d: 110, az: -62, el: 18, fov: 36, shift: 150, side: 40 }` — main au bord droit : essayer `side: 190`.

## Pas encore au niveau

- La première image : la main se lit en une demi-seconde, la lame non — son arc au-dessus de la planche (3,2 cm) est un voile ; c'est le disque vert SOUS la planche qui dit « lame », et il tombe sous les cartes d'accroche (y > 1160).
- La main est un mannequin articulé (phalanges en capsules, ongles et plis dessinés) : elle se lit comme une main, pas comme de la peau. En macro, c'est visible.
- Le bout de manche de verre au poignet reste une ellipse claire à côté de la main.
- Les braises de `harm` et la marque `nick` n'ont été vues qu'en vignette (petites) ; `circuit` 0,3 n'a pas été tiré (0,7 et 1 oui). `slip` 0 (main en retrait, bord de la paume hors planche de ≈ 2 cm) jamais regardé.
- L'atelier : des planches debout contre les murs et un établi, très discrets ; dans un cadre vertical serré on n'en voit presque rien.
- `npm run check` échoue sur les panneaux du gabarit (actes encore en bouchon), pas sur shop.js ; la page se construit et se dessine sans erreur.

## À changer ailleurs

- `model.js` (lame à `blur` 1) : la couronne de dents est presque transparente ; au-dessus de la planche (3,2 cm de lame seulement) elle ne se lit pas dans la première image. Il lui faut une couronne dense sur le dernier centimètre et demi (alpha ≥ 0,8) ou un liseré clair franc — c'est elle qui dit « lame » à côté du doigt.
- `plan.js` : `BOARD.lead0` → `-40` et son commentaire (« bord d'attaque en z = lead0 − feed ») ; `YOU` : préciser « tes pieds ».
- `world.js` : `POSE0` (voir le message final) ; `VIEW.cartridge` tient (vérifié planche C : `{ tx: 0, ty: 72, tz: -10, d: 95, az: -58, el: 4, fov: 28, shift: 150 }` avec `table: 0.15`).

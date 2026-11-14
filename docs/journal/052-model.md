# 052 · model.js — la pince débrayable (journal)

## Construit
- `buildGrip()` (API du bouchon gardée : `root parts A update(P)`, parts `body fixedJaw mobileJaw lever roller spring plate came rope`, ancres `jaws lever roller spring came plate hanger`).
- **Corps** fonte (0x3b4249) : flanc chanfreiné 56 cm, six têtes de vis sur la face extérieure, oreille qui porte l'axe du levier, cou vers la tôle, patte avant = siège fixe du ressort, deux bossages + axe du mors mobile (charnière le long de x à y −7, z 6,5).
- **Mors fixe** (0x80888f) : section en C côté intérieur, berce le câble de 110° à 280° ; **mors mobile** (0x9ba3aa) : crochet par l'extérieur (95° → −55°), tourne sur sa charnière de 0,44 rad (≈ 25°) à `open` 1 ; longueur des mors x −8 → 24.
- **Levier** : renvoi d'équerre sur PIVOT (−18, 2), bras long vers le galet (−34, 12,5), bras court (17, −18) dont le patin pousse la coupelle du ressort. θ calculé pour que le galet descende exactement `CAME.push`.
- **Galet** (0xa1a8ae) placé chaque image au bout du levier (+ son décalage d'éclaté), tourne un peu sur la came.
- **Ressort-cœur** (0xd2d5d7, la pièce la plus claire) : 7 spires à boudin, extrémités rapprochées, sur tige-guide ; se comprime de ≈ 5 cm quand la coupelle avance (`coil.scale.x`). Liseré par coque arrière (BackSide additive) : veille ×1,5 sur `litSpring`, signal ×2 sur `weak` (gagne sur le veille) ; émissif léger de la spire ; coque de verre veille très douce (rim 0,16).
- **Tôle de friction** (0x4a5158) à y −40, dessous à −41 (sommet des pneus).
- **Établi** : came (x −96 → 18, rampe côté −x, deux pattes coupées) dont le dessous descend sur le galet (`CAME.y + push·(1−open)`) ; câble 1,8 m, 0x6a7279 (plus clair que la gare pour se lire sur le halo), six torons en hélice + un trait ink à 0,35 par `CABLE.lay`, fondus par `fwidth` (deux angles décalés : pas de couture), défilent de `slip` ; bouts coupés à 7 torons.
- Éclaté propre (pas le `explode` du kit, qui ne monte qu'en y) : came ↑, galet ↖↑ dehors, levier ↖↑, mors mobile dehors ↑, mors fixe ↑, ressort ↘ dehors, tôle ↓ ; le câble s'efface sur les 30 premiers % ; décalages en cm dans `OUT`.
- `lit*` : émissif veille 0,07–0,08 (à 0,2–0,3 la pièce devenait un aplat vert plastique).

## Nombres de l'état
`bench` (came + câble visibles), `explode`, `open` (θ levier, galet −6 cm, coupelle +5 cm, ressort comprimé, mors mobile 25°, came d'établi qui descend), `weak` (liseré signal + 0,03 rad de jour au mors quand `open` 0), `slip` (torons du câble d'établi), `litCame litLever litRoller litJaws litSpring`.

## Planches (32 vignettes : budget dépassé de 2, arrêt des images)
- p1 : de dehors (az −40) le corps et l'oreille masquent mors et câble, câble noir sur noir ; coque du ressort trop forte. → câble d'établi plus clair, coque baissée.
- p2/p3 : az −25/−40/−55 : mors invisibles derrière levier et oreille ; az +30 (de l'avant-extérieur) le plus lisible. Éclaté lisible à d 330.
- p4 : **az +30 el 18** : on lit « une pince » — le câble entre dans le C des mors, le ressort dessous, le levier monte au galet sous la came. az +70 de près : le C du mors, le câble et ses torons ; ouvert/fermé se voit mais faiblement sur l'établi (le câble ne descend pas : c'est la gare, avec `free`, qui montre le vide).

## Poses (repère établi, BY = 46) — vérifiées sur planche
- `whole` : `{ ...P, tx: 2, ty: BY - 6, tz: 4, d: 250, az: 30, el: 18, fov: 30, shift: 130 }`
- `exploded` : `{ ...P, tx: 4, ty: BY + 4, tz: 6, d: 340, az: 30, el: 20, fov: 30, shift: 120 }`
- `cameBench` : celle de l'architecte (az −58, d 110) cadre galet + levier sous la came.
- `spring` : celle de l'architecte (az −34, d 85) — le ressort plein cadre, spires lisibles, liseré veille.
- mors de près sur l'établi : `{ ...P, ...CLOSE, tx: 16, ty: BY, tz: 2, d: 90, az: 70, el: 14, shift: 110 }`

## Pas encore au niveau (franchement)
- Ouvert / fermé sur l'établi : la différence tient au crochet qui bascule de ≈ 5 cm ; lisible de profil, faible à 270 px de trois quarts.
- Le jour de 2 mm de `weak` ne se voit pas à 270 px : c'est le liseré signal du ressort qui dit « mal ».
- Vu de l'extérieur-arrière (az −20 à −60, la lumière clé), l'oreille et le levier cachent les mors : filmer la pince entière de l'avant (az +30).
- Les poses de la gare (`grip`, `jaws`, `still`, `came`) n'ont pas été vérifiées avec la vraie pince (budget d'images) : à recaler par le chef de production.
- Le corps reste une fonte simple (vis, chanfreins), sans nervures.

## À changer ailleurs
- `episodes/052-telesiege/src/plan.js` (cohérence, personne d'autre ne le lit) :
  `  lever: { pivot: [-18, 2, 10.75], len: 19 }, //   the lever (levier): a bell crank, its long arm back (−x) and up to its roller`
- `episodes/052-telesiege/src/world.js` → `VIEW.whole` et `VIEW.exploded` : les deux lignes ci-dessus (« Poses »).

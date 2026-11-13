# 047 · `src/cuve.js` — journal du décor

Le lave-vaisselle aux rayons X autour du circuit, les paniers, la porte et son voyant éco, le plat à gratin retourné et sa croûte, l'eau qui retombe, l'éponge et la brosse fantômes. Décor neuf (rien au catalogue).

## Choix

- **Le plat penche vers l'avant** (bord AVANT plus HAUT) : avec le bord avant plus bas (commentaire de `plan.js`), l'ouverture regarde vers le fond de la cuve et une caméra basse de devant (`POSE0`, `VIEW.crust`) ne voit la croûte qu'en rasant (≈ 80° de la normale). Bord avant haut : ≈ 64°, la croûte se voit. Personne d'autre ne dépend du signe (les jets du bras visent `DISH.crust`, ±1 cm).
- **La croûte** : une couche lissée (normales lisses) qui suit le fond et monte sur les parois jusqu'à un bord déchiqueté, bosselée par un bruit semé, bords brûlés plus sombres ; émissive `signal` avec un ombrage simulé depuis le bas (sinon, vue de dessous, la lumière clé ne l'éclaire pas) et une lueur aux impacts des jets (calculés depuis `turn`, mêmes buses que le bouchon du système : x = ±(4 + 4k), k 0…4).
- **`crack`** : douze plaques (Voronoï semé) ; 0 → 0,18 les fissures s'ouvrent (on voit l'émail clair entre elles), puis chaque plaque se décolle et tombe, en décalé, se pose à plat autour du filtre grossier sur le microfiltre (toutes sous y 16,7 : le bras passe au-dessus sans les traverser). À 1, plus rien sur le plat.
- **`crust` < 1** : la croûte se dissout par plaques de bruit (le plat redevient propre sans fondu de transparence).
- **`ghosts`** est un parcours : 0 → 0,15 l'éponge apparaît, tenue jusqu'à 0,4, partie à 0,6 ; 0,45 → 0,6 la brosse apparaît, tenue jusqu'à 0,85, partie à 1. Un seul tween 0 → 1 sur « Ni éponge, ni brosse. ».

- **Les plaques** sont de vrais morceaux : face bosselée, face cuite (sombre) et tranches, découpées le long de cellules de Voronoï déformées par un bruit (bords nets, pas d'escalier de triangles).
- **L'intérieur du plat** (émail clair) reçoit la même lumière « d'en dessous » que la croûte : propre (`crust` 0), il se lit clair au cadre de l'accroche ; sans elle c'était un trou noir.
- **Verre de la machine** : une seule coque (ordre 21) — flancs et fond de la carrosserie, parois et plafond de la cuve, porte, bras supérieur et sa colonne. Le fond de cuve, le socle, les paniers : des traits. Pas de rangée de picots devant le plat (elle barrait la croûte dans l'accroche), montants avant du panier un sur deux.
- **Glaçure mate** (rough 0,5, vernis 0,2, env 0,7) : à 0,32 / 0,55 le reflet du softbox brûlait le dessus du plat en saumon sur les plans de la porte.
- **Le voyant éco** : éteint à `eco` 0 (noir), halo veille de 5,5 cm à `eco` 1, visible de devant et de dessus.

## Ce qui a été vu (planches dans `.cache/planches/047/cuve/`)

- Accroche (`POSE0`) : le plat retourné, sa croûte orange bosselée frappée par les jets (impacts blancs), l'eau qui retombe en traînées ; lisible à 270 px. Ce qui la gâche n'est pas ici : le gros bloc noir des filtres du système occupe tout le bas du cadre.
- `VIEW.crust` : la croûte de dessous, ses bosses et ses bords brûlés.
- Fentes (`crack` 0,15) puis chute (0,5) au cadre de l'accroche ; tas de plaques autour du filtre grossier vu de dessus (`crack` 1).
- Le plat propre (`crust` 0) au cadre de l'accroche : émail clair, se lit.
- Fantômes : l'éponge (deux couches) à 0,3, la brosse à 0,72, au-dessus du plat dans `VIEW.tub`.
- Porte : `VIEW.door` de l'architecte coupe la porte au bord droit et met le voyant sous l'en-tête → pose C ci-dessous.

## Poses qui cadrent

- **Porte (se ferme, voyant éco)** — C : `{ tx: 0, ty: 42, tz: 30, d: 300, az: -40, el: 10, fov: 28, shift: -100, side: 0, roll: 0, drift: 0.3, dof: 0 }` : la machine entière, la porte entrouverte en biais à droite, le voyant vert juste sous l'en-tête (y ≈ 490).
- **La chute des plaques vue de dessus** : `{ tx: 0, ty: 17, tz: 9, d: 90, az: -30, el: 42, fov: 34, shift: 0, dof: 0 }`.
- **Les plaques qui tombent, de face** : `{ tx: 0, ty: 22, tz: 4, d: 95, az: -30, el: 4, fov: 30, shift: 40, dof: 0 }` (sous le plancher, `el` < 0, le microfiltre plein cache le tas).

## À changer ailleurs

- `episodes/047-lave-vaisselle/src/world.js`, `VIEW.door` : remplacer la ligne par
  `door: { ...P, tx: 0, ty: 42, tz: 30, d: 300, az: -40, el: 10, shift: -100 },`
- `episodes/047-lave-vaisselle/src/plan.js`, commentaire de `DISH` : « tilted `tilt`° about x (front edge lower) » → « tilted `tilt`° about x (front edge HIGHER: its opening looks down toward the door) ».

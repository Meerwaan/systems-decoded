# 015 — `model.js` (le système : le brin et son frein) — journal

Budget : 30 images lues, tenu à l'image près (planches A 8 · B 8 · C 8 · D 4 · E 2, la dernière avec l'en-tête). Planches, `essais.json` et petits outils : dossier temporaire `scratchpad/015/model-*` (dont `model-proj.mjs`, qui projette des points à travers une pose : les cadrages se règlent au calcul, sans dépenser d'image).

## Le parti pris

- **Une machine en ligne, le long de x, sous le brin**, sur deux rails : bloc de poulies fixe (axe x = −778) · réservoir (−642 … −392) · vanne (−392 … −222) · cylindre (−222 … +214, presse-étoupe jusqu'à 234) · piston plongeur · traverse et son bloc (axe x = 764 → 394 quand `ram` va de 0 à 1 : course 370 cm). L'huile fait un sablier couché : gros cylindre → col → réservoir. Tout tient dans `ENGINE.half` (±900, ±160, ±200).
- **Poulies debout, axe en z** (on voit leurs faces, cinq trous dans le voile : la rotation se lit) ; les câbles courent au-dessus (y = −315) et au-dessous (y = −545) de l'hydraulique, sur les plans z = ±39, ±91 (traverse) et −65, 13, 65 (bloc fixe). Le cœur reste dégagé entre les deux nappes.
- **Deux câbles d'achat**, un par bout du brin, mouflés à quatre brins chacun. Bâbord : poulie de pont → descente (250 cm) → renvoi → nappe haute → traverse → bloc fixe → traverse → point fixe. Tribord : descente longue (480 cm) → renvoi bas → nappe basse jusqu'au bloc fixe → traverse → bloc fixe → traverse → point fixe. Les poulies tournent à 1, 2, 3, 4 × (course ÷ rayon) : c'est ce qui fait lire un palan.
- **Le brin est une pièce à part** (le vrai se change) : deux accouplements à 880 cm du milieu le relient aux câbles d'achat. Tiré, ils partent avec lui : du câble neuf sort des poulies de pont, qui pivotent dans leur pot pour faire face au point tiré.
- **Le toron** : six torons en hélice et un toron traceur plus clair, dessinés dans le shader sur l'abscisse *matière* du câble (comptée depuis le point tiré sur le pont, depuis le point fixe dans le palan) : le motif court avec `pull` (pont) et `ram` (palan), jamais avec le temps ; il fond en gris sous le pixel. Largeur plancher : 2,4 px (3 px pour le brin).
- **La vanne** : dehors, un entonnoir jusqu'à un col ; dedans, un diaphragme (trou de 26 cm) et un pointeau conique sur l'axe ; la molette — un cadran de coffre-fort, penché vers la caméra, posé sur le gros bout de la vanne pour ne pas masquer le col — tourne de 270° et pousse le pointeau de 24 cm.
- **L'huile qui chauffe** ne passe pas par un mélange vert-orange : un front signal part du col et gagne le réservoir (`heat` ≈ 0,5) puis le cylindre (1).

## Fait

- `buildSystem()` → `{ root, update(P, time, px), A, parts }`. 1 054 lignes.
- Chaque nombre : voir le commentaire au-dessus de `buildSystem` (c'est la référence).
- `A` : `wire` (milieu du brin au repos, fixe), `bight` (suit le point tiré), `sheaveL`, `sheaveR`, `coupling` (suit l'accouplement bâbord), `cable`, `cableR`, `lead`, `runs` (nappe haute), `blocks`, `fixed`, `crosshead`, `ram`, `head`, `cyl`, `valve`, `throat`, `dial`, `vessel`. Tous suivent leur pièce, ouverte ou non.
- L'éclaté (`OPEN`) : le brin se soulève de 110 ; le cadre (rails, berceaux, pieds) s'efface ; toute la rangée du frein glisse hors des câbles le long des axes des poulies (z), puis vient vers l'œil (−514, −50, +613) et s'ouvre selon son axe : bloc fixe · réservoir · vanne · cylindre · piston · traverse. Les câbles, les renvois et les pots restent en place : deux niveaux à l'image.
- Le système **ne prend pas le brouillard** (`fog = false` sur toutes ses matières, à la fin de `buildSystem`) : voir « Raté ».

## Raté, et pourquoi

- **Planche A, tout était noir** : `world.js` règle le brouillard sur `stage.cam.d`, et `look` pose la caméra par `stage.pose` sans toucher à `stage.cam` — toute image d'essai est donc voilée comme si la caméra était à `POSE0.d` (1 500 cm) : à 6 600 cm, 70 % de brouillard. Le système n'en prend plus ; la ligne à changer dans `world.js` est plus bas (le sol et la grille de l'établi, eux, restent voilés dans les essais).
- **Une brûlure blanc-vert sur les pots** : une face plate qui regarde le ciel reflète la lumière de contre (même leçon que le capot du calculateur du 014). Plateau tournant et couronne : mats, sans métal.
- **La molette devant le col** (planches A et B) : elle cachait le pointeau. Déplacée sur le gros bout de la vanne (x = −258).
- **Le pointeau noyé dans la lumière de l'huile** : l'huile est additive, un solide vu à travers n'est qu'un vert plus pâle. Ce qui baigne dans l'huile (pointeau, diaphragme, piston libre, piston) est dessiné APRÈS sa lumière (`renderOrder` 6, arêtes 7).
- **La rupture** (A, B) : bouts hors cadre et à peine éclairés, boule cachée par le sabot de la crosse. Recul ralenti (`1 − 0,45·p^1,6`), fouet en S, bouts chauds, une vraie lumière ponctuelle signal au-dessus du point de rupture, boule avancée de 30 cm.
- **`litBrin` en néon** : l'émission mangeait les torons. Maintenant une teinte et une émission faible.
- **Le jet** : d'abord invisible (rouge sur rouge), puis une tache blanche qui lavait le réservoir. Réglé entre les deux ; il reste un halo plus qu'un cône net.

## Poses qui cadrent (monde, établi : le système est à y = 620)

Toutes avec `fov: 28, side: 0, roll: 0`. « vue » : lue sur une planche ; « calculée » : réglée au projecteur seulement.

| # | état | pose |
| --- | --- | --- |
| 1 entier | repos | `{ tx: 0, ty: 400, tz: 0, d: 6000, az: -58, el: 18, shift: 230 }` (vue) · variante `az: -52, d: 6600, el: 17` (vue) |
| 2 éclaté | `explode: 1` | `{ tx: -120, ty: 330, tz: 200, d: 8300, az: -40, el: 16, shift: 230 }` (vue ; `explode: 0.5` vu au même cadre) |
| 3 brin | `litBrin: 1` | `{ tx: -760, ty: 629, tz: 0, d: 1100, az: -66, el: 13, shift: 160 }` (vue avant l'éclaircissement du brin) |
| 4 chemin | `litCable: 1, wave: 0.5` | `{ tx: -930, ty: 370, tz: 0, d: 3100, az: -42, el: 14, shift: 190 }` (vue) |
| 5 frein | `xray: 1` | `{ tx: -150, ty: 190, tz: 0, d: 3300, az: -48, el: 13, shift: 180 }` (vue, et vue pleine avec `litRam`, `litValve`, `litSheaves`) |
| 5b le col | `xray: 1, ram: 0.5, flow: 1, heat: 0.25` | `{ tx: -350, ty: 190, tz: 0, d: 1150, az: -30, el: 12, shift: 170 }` (vue) |
| 6 au travail | `xray: 1, held: 1, pull: 6, ram: 0.6, flow: 1, heat: 0.6, tense: 1` | `{ tx: -100, ty: 420, tz: -150, d: 4500, az: -56, el: 14, shift: 225 }` (vue avec l'en-tête : la tête de crosse arrive à 60 px sous lui ; `shift: 205` donne de l'air) |
| 7 molette | `dial: 0.5` puis `dial: 0.85, wrong: 1` | `{ tx: -258, ty: 256, tz: 58, d: 520, az: -38, el: 22, shift: 170 }` (vue juste ; fausse vue quand la molette était 32 cm plus à gauche) |
| 8 navire | DECK, `under: 1, jet: 0, held: 1, pull: 45, ram: 0.5, tense: 1` | `{ fov: 40, tx: 500, ty: -100, tz: -2000, d: 9500, az: -14, el: 24, shift: 230 }` (vue, deux fois, dont une avec l'en-tête) |
| 9 rupture | `held: 1, pull: 6, parted: 0.5` | `{ tx: 20, ty: 700, tz: -560, d: 2500, az: -20, el: 17, shift: 180 }` (vue) |

## Pas au niveau, ou pas vu

- Image 6 : le bloc fixe, au premier plan, est plus gros que le cœur ; le jet est un halo blanc, pas un cône ; entre `heat` 0,2 et 0,4 le réservoir montre trois bandes (vert, blanc, orange).
- L'ouverture de l'éclaté : entre `explode` 0,05 et 0,4, les flasques arrière des deux blocs traversent la nappe basse des câbles (et les joues des poulies, 7 cm, les boucles voisines). Bref, petit à cette échelle, mais vrai. Vu seulement à 0,5 et 1.
- Jamais vu en mouvement : le toron qui court, les poulies qui tournent, le fouet (seul `parted` 0,5 a été lu ; à 1 les deux bouts sont droits, raccourcis de 45 %, posés sur le pont), la vague sur le pont et sur le piston (seul 0,5 lu), `flow` et `heat` sans rayons X (le col et le réservoir se teintent), `held` entre 0 et 1.
- Le toron traceur (pas de 54 cm) peut battre en gros plan si le câble file à plus de ≈ 8 cm par image : au ralenti, rester en dessous, ou bien au-dessus (il fond).
- `tense` allume huit lignes vertes dans le palan : chargé en plan serré.
- Dans les vues d'ensemble le brin est un trait de 3 à 5 px : c'est la pièce la moins visible du plan large.

## À changer ailleurs

- `world.js`, dans `apply` — pour que le brouillard d'une image d'essai soit celui de sa propre distance :
  `scene.fog.density = onBench ? bench.fog(stage.pose?.d ?? stage.cam.d) : 0.00003;`
- `world.js`, `VIEW` (les poses de départ sont trop serrées : à `whole`, le brin sort du cadre des deux côtés) :
  `system: { ...P, tx: 0, ty: -220, tz: 0, d: 6000, az: -58, el: 18, shift: 230 },`
  `whole: { ...P, tx: BX, ty: BY - 220, tz: BZ, d: 6000, az: -58, el: 18, shift: 230 },`
  `exploded: { ...P, tx: -120, ty: 330, tz: 200, d: 8300, az: -40, el: 16, shift: 230 },`
  `brake: { ...P, tx: -150, ty: BY + ENGINE.y, tz: 0, d: 3300, az: -48, el: 13, shift: 180 },`
- `carrier.js` (à dire à son auteur) : hors de `ENGINE.half`, le système occupe aussi, à chaque bout du brin, un pot (rayon 90, de y = −74 à +1,5, centré en x = ±1130 : le pont y est percé), deux sangles et une poulie de renvoi sous le pot — bâbord jusqu'à y = −315, tribord jusqu'à y = −550, x de ±1040 à ±1175, z ±20 — et les rails vont jusqu'à y = −590. La poulie de pont dépasse le pont de 16 cm.
- `rafale.js` : rien. Le point tiré est `hookAt(pull)` × `held` (`alt` n'est pas lu par le système : pris, le brin reste à 12 cm du pont).
- Aux actes : `wave` est éteint à 0 ET à 1 — le ramener à 0 sur une coupe, sinon `D.loop` le fera reculer à vue. Sur l'établi, `held` fait apparaître une tête de crosse au point tiré.

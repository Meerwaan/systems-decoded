# 011 — pack.js (la batterie, le boîtier de jonction, les câbles orange, les blocs moteurs, le calculateur et son ordre)

Journal de l'agent propriétaire de `episodes/011-fusible-pyro/src/pack.js`. Budget : 30 images lues — **30 lues** (4 planches : 8 + 8 + 8 + 6). Planches et `pack-essais*.json` : dossier temporaire `scratchpad/011`.

## Ce qui est construit

`buildPack() → { group, A, update(p, time, px) }` ; `BACK` (18 cm) est exporté.

- **Batterie** : bac sombre, longerons gris moyen (pattes de fixation, bossages), 2 colonnes × 5 rangées de modules séparés par des fentes de 2 cm, capot d'épine au centre. Les cellules (Ø 4,4, pas 4,8, en quinconce, 96 par module) sont dessinées **dans le shader** du dessus des modules (`cellMaterial`, greffé sur la matière éclairée : elle garde le studio, les ombres, les fondus) : chaque capot a sa pastille et son épaule (normale bombée), et le tout se fond en gris moyen sous le pixel (`fwidth`). **La charge** : lueur signal entre les cellules, sur les flancs des modules (les fentes) et un lit de lumière au fond ; respiration lente (4,2 s, ±14 %, une onde qui court la longueur) ; elle ne dépend que de `pack`. Vue de près (< 70 cm → 480 cm) elle recule à 28 % : un fond, pas un halo.
- **Boîtier de jonction** : socle + murets (restent), couvercle (pièce à part, ses matières). Dedans, un schéma unifilaire en cuivre, **dans le sens du courant du fusible (−x → +x)** : colonne de la batterie (x = −9,5) → shunt → [fusible, boulonné par ses deux trous sur mes barres, sur deux isolateurs] → marche vers le haut → barre transversale → deux contacteurs couchés (cylindres, bout clair, deux goujons sur une selle) → deux barres qui redescendent aux cosses des câbles (celle de l'arrière longe le mur du fond, basse, sur deux isolateurs). Carte de mesure et résistance à ailettes dans les coins libres. Tirets sur les barres : ceux du fusible (même shader : période 2,1 cm, 7 cm/s, voie assombrie).
- **Câbles orange** : Ø 2,4, gaine signal sombre et mate ; tirets signal dans une gaine additive (période 12 cm, 38 cm/s = 1/9,5 de période par image, tête de tiret plus claire : on lit le sens sur une image fixe, jamais sous 2,4 px de demi-largeur). Presse-étoupes sur le boîtier, collerettes orange sur les prises des blocs.
- **Blocs moteurs** : moteur à ailettes, réducteur, flasques usinés et leurs vis, demi-arbres et soufflets, onduleur (capot nervuré, mat), deux bras et leurs silentblocs, prise du câble. Le même bloc, retourné, à l'arrière.
- **Le choc** : `crush` recule le bloc avant de 18 cm et replie le câble (deux formes du même câble : c'est l'AXE qui est mélangé, le rond est reconstruit autour) ; `cable` : la tôle de caisse apparaît sous le repli, la gaine se retire (bord déchiqueté, noirci), cuivre toronné clair posé sur l'acier ; étincelles lentes périodiques + lueur du contact + tôle qui rougit tant que `hv` est là ; au-delà du pincement, plus un tiret.
- **Calculateur** : boîtier sur le tunnel, panneau qui s'allume veille en trois temps (trois barres à 0,2 / 0,45 / 0,7 puis le cadre et la puce à 1) + halo ; trois fils (jamais sous 2,4 px ; 4,2 px allumés) ; `order` : une tête veille par fil (halo ≥ 19 px), le chemin reste allumé.

## Les nombres de l'état, chez moi

- `pack` : opacité de TOUT ce qui porte la haute tension (batterie, boîtier, câbles, blocs) et la charge avec. Le calculateur et ses fils ne s'effacent pas.
- `box` : le couvercle SEUL (1 fermé → 0 parti). Contacteurs, barres, shunt restent.
- `hv` : tirets dans les câbles et sur les barres (ils raccourcissent en s'éteignant) ; à 0 la gaine reste orange, sans émission.
- `crush` : bloc avant reculé (linéaire), câble replié.
- `cable` : 0 → 0,5 la tôle apparaît ; la déchirure suit ; 0,6 → 1 étincelles / lueur (× `hv`). N'a de sens qu'avec `crush` 1.
- `ecu`, `order` : voir plus haut. `shell` : reçu, pas utilisé.
- Ancres : `pack`, `module`, `box`, `fuseSeat`, `contactor` (celui de l'arrière), `cableFront`, `pinch`, `driveFront` (suit le choc), `driveRear`, `ecu`, `orderFuse`, `orderBag` (les deux têtes, mobiles).

## Poses qui cadrent (toutes : `fov: 28, side: 0, roll: 0, drift: 0.3`)

1. La batterie est le plancher : `{ tx: 0, ty: 30, tz: 36, d: 640, az: -36, el: 40, shift: 0 }`
2. Boîtier fermé : `{ tx: 0, ty: 35, tz: 101, d: 210, az: -40, el: 32, shift: 0 }` · ouvert (`box` 0) : `{ tx: 9, ty: 34.5, tz: 101, d: 125, az: -44, el: 30, shift: 60 }` · ouvert « en colonne », le chemin du courant monte dans l'image : `{ tx: 3, ty: 34, tz: 101, d: 175, az: -78, el: 42, shift: 0 }`
3. Les câbles en enfilade (du boîtier vers l'avant, `shell` 0,6) : `{ tx: 8, ty: 34, tz: -15, d: 540, az: -24, el: 30, shift: 0 }` — de côté (az −78), un câble de 2,2 m horizontal ne remplit rien d'un cadre vertical.
4. Le pincement (`crush` 1, `cable` 1) : `{ tx: 10, ty: 37.5, tz: -108, d: 76, az: -58, el: 30, shift: 40 }`
5. L'ordre (`ecu` 1, `order` 0,3 → 1, `box` 0, `shell` 0,7) : `{ tx: -4, ty: 58, tz: 24, d: 720, az: -52, el: 28, shift: 0 }` · le calculateur de près : `{ tx: 0, ty: 41, tz: 20, d: 78, az: -40, el: 40, shift: 0 }`
6. « Ces volts restent quelque part » (`hv` 0, `shell` 0,5) : `{ tx: 0, ty: 30, tz: 10, d: 560, az: -48, el: 30, shift: 0 }`
7. De dessus (`shell` 0,3) : `{ tx: 0, ty: 30, tz: 0, d: 880, az: -18, el: 70, shift: 0 }`
8. Le bloc avant (`shell` 0,35) : `{ tx: 0, ty: 42, tz: -148, d: 210, az: -38, el: 24, shift: 0 }`

## Ce qui a raté, et pourquoi

- **Planche 1** : la batterie était un tapis rose (capots presque blancs, lueur à 1,8 entre les cellules, bloom sur toute l'image). → capots gris (0x858e96), lueur divisée par trois, flancs et lit baissés. Le sens du courant était à l'envers du fusible (le sien va vers +x) → boîtier refait en miroir : colonne à gauche, contacteurs à droite.
- **Planche 2** : les contacteurs avaient une tête carrée qui cachait le cylindre vu de la gauche → tête ronde, selle à goujons. Le fil de l'ordre vers le fusible passait sur le câble orange (jaune) → il court de ton côté du tunnel (x = −8).
- **Planche 3** : le capot usiné de l'onduleur bavait à az −38 (dessus plat, miroir de la boîte à lumière) → `machined` mat (rough 0,72, metal 0,15). Les têtes de l'ordre trop petites en plan large → halo 19 px, fil épaissi quand il est allumé.
- **Planche 4** : macro du fusible (d 48, el 16) : nappe rose derrière le sujet = le dessus des modules, brillant, vu en rasant. → dessus des modules mat (rough 0,84, metal 0,1, env 0,4). **Non revu** (budget d'images épuisé).
- Mélanger deux tubes finis (repos / replié) écrasait l'épingle du câble à mi-choc et annulait sa normale (NaN possible) → sommets posés sur l'axe, rond reconstruit dans le shader, normale gardée.

## Pas encore au niveau

- Le dessus des modules en macro rasante : corrigé à l'aveugle (voir planche 4).
- Le couvercle du boîtier est pauvre (une boîte grise, deux nervures, une plaque).
- Barres ouvertes avec `hv` 1 : la voie à tirets sur cuivre clair fait « sucre d'orge » — c'est le shader du fusible, gardé pour la continuité ; à baisser des deux côtés si ça gêne.
- L'épingle du câble replié est un peu « tuyau d'arrosage » ; la tôle est une plaque simple.
- La tête de l'ordre vers le passager traverse la planche de bord : cachée derrière toi vue de la gauche entre 0,5 et 0,9.
- Le bloc arrière est presque toujours caché (boîtier, roue).
- Les câbles ne portent pas d'ombre (sommets sur l'axe).

## À changer ailleurs

- `world.js`, commentaire de `FIRST.box` : chez moi `box` n'efface QUE le couvercle (contacteurs et barres restent : c'est l'image 2 de la consigne) — le commentaire dit « and what stands in it round the fuse ».
- `plan.js`, `CABLE.rear` : le câble arrière finit en `[-6, 40, 132]` (la prise de mon bloc arrière), pas `[-8, 38, 136]`.
- Le cuivre nu touche la tôle en `[10.5, 36.45, -108.3]` (`TOUCH`), à 1,8 cm de `CABLE.pinch` d'où part l'onde `live` de car.js : rien à changer, à savoir.
- `car.js` ne recule rien derrière l'essieu avant : mon bloc avant, lui, recule de 18 cm (consigne). Les roues restent, le bloc passe derrière leur axe.

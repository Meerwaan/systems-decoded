# CR02 · plateforme.js — journal

Agent décor, 06/11. Fichier : `episodes/CR02-deepwater/src/plateforme.js` (la plateforme de nuit, sa mer au bord d'aquarium, le riser, le BOP simplifié, l'éruption, le feu, le naufrage). Planches : `.cache/planches/CR02/plateforme/` (`p1` … `p4.jpg`, essais `e1` … `e3.json`). `npm run check -- CR02` passe.

## Ce qui est construit

- `group` (fixe) : **la mer** (surface en shader, deux faces : d'en haut noir chaud et brillant — houle dans les normales, reflets des lampes d'angle, des projecteurs, du jet rouge et du feu en colonnes brisées, un sentier de paillettes ambre d'une lumière basse derrière la plateforme, un liseré clair où les colonnes percent l'eau ; d'en dessous un plafond sombre où jouent des bandes ambre, rougies près de l'axe par le jet et le feu ; fondue dans le noir au-delà de ≈ 10 m), **le trait clair du bord d'aquarium** (`SEA.cut`), **les particules en suspension**, **le riser** (bagues tous les 41 cm ; il suit le moon pool quand la plateforme coule), **le BOP simplifié** (tête de puits, cadre, étage bas et ses trois capots, LMRP, annulaire, deux pods ; `A.fault`, `A.bop`).
- `rig` (pivot à la ligne d'eau) → `body` (coordonnées de `plan.js`) : flotteurs, quatre colonnes à angles arrondis, deux entretoises immergées, coque-pont, machines sombres, rack à tiges, grue, héliport octogonal, sous-structure, plancher, table de rotation ; **le derrick** : une seule géométrie fusionnée (4 montants, 10 ceintures, croix sur chaque face, la porte en V ouverte côté −x), couronne et réas ; argile claire, son sommet s'assombrit (fond dans le noir sous l'en-tête) ; **les lampes** (points lumineux bornés en pixels : bord du pont, héliport, projecteurs du derrick, couronne, bout de grue).
- **L'éruption** : `jet` = tube de boue en shader (brun-noir, reflets mouillés qui montent, le gaz rouge vu à travers les zones minces et à l'intérieur, tête qui s'évase et se déchire, ondule seul), une lumière rouge au trou (sprite) et une `PointLight` rouge dans la tour (le treillis s'éclaire de l'intérieur), 520 gouttes instanciées balistiques (dans le shader : rien n'est alloué) qui retombent sur le plancher ou le pont, une brume rouge à la tête. `spill` = nappe de boue brillante à bord irrégulier, d'abord le plancher, puis le pont.
- **L'explosion** `blast` : un cœur blanc + un gonflement rouge (deux sprites, pic à `blast` 0,12), une boule de feu en volutes (fusion normale : elle reste rouge), son cœur chaud. **Le feu** `fire` : flammes additives (pont + tour), cœur ambre-blanc, braises, fumée sombre qui se fond avant l'en-tête (y 640 → 820), le pont qui rougeoie par cases (l'idiome `fireMat` du CR01). **Le naufrage** `sink` : la coque gîte vers +z, dérive un peu, s'enfonce de 262 cm ; tout ce qui brûle s'éteint sous la surface (coupe en y monde), les lampes et le jet s'éteignent quand elle passe sous l'eau.
- **Le contre-jour** : un halo ambre posé à 380 cm DERRIÈRE le milieu du derrick par rapport à la caméra (`onBeforeRender`), plus rouge avec le jet, orange avec le feu : la tour se découpe sur un halo depuis n'importe quel point de vue.

## Ce qui a raté et pourquoi

- p1 : la mer en or (les reflets des lampes étaient des disques de 78 et 150 cm : une nappe) → sources ponctuelles de 5 à 12 cm, la houle les étire en colonnes. Le jet pâle (fresnel trop fort vu d'en dessous) → reflets serrés, rouge du gaz dominant. Les gouttes en billes noires → plus petites, étirées, moins éparpillées. Nappe de boue à taches bleu-blanc (le studio froid dans un vernis) → `envMapIntensity` 0,12.
- p3 : l'explosion faisait un voile rose-blanc sur tout le ciel (le flash porté par le halo de 560 cm + des volutes additives qui s'empilent en blanc) → flash = petit cœur blanc + gonflement rouge, volutes en fusion normale, halo sans flash. **Ces trois corrections n'ont pas été revues à l'image** (budget d'images dépassé, voir plus bas).

## Poses qui cadrent (vérifiées sur le vrai décor, état entre parenthèses)

- **Image 0 (a)**, mieux que la provisoire (la base du derrick remplit le bas, la couronne s'éteint sous l'horloge) : `{ tx: 0, ty: 528, tz: 0, d: 92, az: -60, el: -40, fov: 58, shift: 0 }` (`jet` 0,6 → 0,7, `spill` 0,2 ; à 0,45 s le jet et la pluie ont bougé). Le rouge du jet est la tache la plus vive, le treillis ≈ 90 % de la largeur.
- `rig` tel quel `{ ty: 500, d: 980, az: -58, el: 3, fov: 30, shift: 200 }` : la plateforme ≈ 65 % de la largeur, flotteurs visibles sous l'eau par le bord d'aquarium, mer noire à paillettes.
- Plongée de `promesse`, trois instants vus : (1) `{ ty: 470, d: 1000, az: -60, el: 2, fov: 30, shift: 120 }` → (2) **sous la mer / ligne d'eau (b)** `{ ty: 290, d: 1400, az: -66, el: -3, fov: 40, shift: -40 }` (la couronne ≈ y 530, le BOP ≈ y 1550, la surface vue par en dessous, le riser entier) → (3) `{ ty: 110, d: 520, az: -64, el: 4, fov: 32, shift: 40 }` (le riser qui descend, le BOP en bas). `VIEW.seabed` tel quel cadre aussi le BOP et le riser.
- `line` tel quel : le diorama entier, ≈ 45 % de la largeur (lisible, peu frappant).
- `sink` tel quel : `sink` 0 (pont en feu, reflets orange), 0,5 (pont à fleur d'eau, derrick penché), 1 (la plateforme vue sous l'eau par le bord d'aquarium, surface noire au-dessus).
- **`table` : pas bonne** — de `VIEW.table` comme d'az −40, des barres du treillis passent devant l'objectif. Suggestion **non vérifiée** : par la porte en V (la baie basse de la face −x est ouverte) `{ ty: 476, d: 70, az: -82, el: 6, fov: 34, shift: 40 }`.

## Images lues

32 (quatre planches de 8) : deux de trop, je me suis arrêté là — l'explosion corrigée, la pluie resserrée et la pose `table` restent à voir sur la planche de la première image ou des actes.

## À changer ailleurs

`episodes/CR02-deepwater/src/world.js`, dans `VIEW` (poses vérifiées, voir plus haut) :
- `floorLow: pose("plateforme", [0, 528, 0], { d: 92, az: -60, el: -40, fov: 58, shift: 0 }),`
- `under: pose("plateforme", [0, 290, 0], { d: 1400, az: -66, el: -3, fov: 40, shift: -40 }),`

## Pour le catalogue

Plateforme de forage semi-submersible de nuit (`CR02/src/plateforme.js`, noir chaud) : derrick en treillis fusionné, mer en shader au bord d'aquarium (reflets, paillettes, plafond vu d'en dessous), riser et BOP simplifié, jet de boue en shader + gouttes instanciées, explosion, feu, naufrage ; état `jet spill blast fire sink lamps`.

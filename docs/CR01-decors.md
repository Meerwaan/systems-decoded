# CR01 · Tchernobyl — les décors

Quatre fichiers, un agent chacun, en parallèle : `episodes/CR01-tchernobyl/src/canal.js` (la physique : LE décor-héros), `coeur.js` (le cœur RBMK en coupe), `centrale.js` (la centrale sur une table), `salle.js` (la salle de commande). Tous existent en **bouchon** (volumes gris, l'API définitive) : le film se construit, `npm run check -- CR01` passe ; tu remplaces ton fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import ; lis-le en entier, il est court) et `src/world.js` (`FIRST`, `VIEW`, `STAGED`, `BENCHED`, `apply`). Le plan des actes : `docs/CR01-actes.md` (son haut, puis les lignes qui nomment ton décor). Faits : `docs/faits/CR01-tchernobyl.md` § 4, 5bis, 12 (« À ne pas dire ») et `docs/faits/CR01-contre-verification.md` (« Reste ouvert »). **La voix est enregistrée** (150,6 s) : `npm run script -- CR01`.

**Ce format n'est pas un dossier : c'est « la reconstitution »** (`docs/recette-compte-a-rebours.md` « L'image », `docs/reconstitution.md` — lis-les, 80 lignes à elles deux). **Plus de verre ni de rayons X** : tout décor est une **maquette d'enquête pleine en argile mate** (`clay({ tone })` : −1 sombre … 1 clair, pour séparer deux voisines ; `clayEdges(geo)` sur chaque volume, jamais sous 1,8 px), sous **une seule lumière dure** venue de −x (`setupReconstitution`, déjà dans `world.js` : n'y touche pas), ombres longues, le reste noir. **Une seule pièce rouge à la fois** dans le cadre : `alarm()` + `setAlarm(mat, S.fault)` — c'est le seul objet qui émet avant `depuis`. Couleurs : `RECON.papier` (structure, ce qui vit : la lumière de la puissance, les neutrons, le courant), `RECON.alarme` (le défaut), l'ambre est réservé au temps (en-tête) ; **pas de vert avant `depuis`** (`heal()`, `canal.js` seulement). Rien n'est en métal ni en verre ; une lumière a un endroit (un cœur brillant), jamais un voile ; tout ce qui émet ≤ 3.

**La coupe et l'azimut (vérifiés sur bouchons, `kit/lib/stage.js` l. 381)** : chaque maquette est construite autour de SON origine (`plan.js` → `ORIGIN`, `world.js` la place) et **ouverte par le plan x = 0 : la moitié x < 0 est retirée, les faces coupées regardent −x**, du côté de la lumière. La caméra est en t + d·(sin az · cos el, sin el, cos az · cos el) : **az 0 en +z, az −90 en −x (face à la coupe)**. Les caméras du film se tiennent entre az −50 et −80 (trois quarts : jamais de face). `shift` positif monte l'image. Le sol (y = 0) est le disque de la reconstitution ; ta maquette pose dessus.

**L'échelle** : des maquettes, chacune à l'échelle de son sujet (`plan.js` le dit en tête) : **aucune grandeur ne s'affiche** ; `sources` dit que l'image reconstitue. **Les personnes sont des silhouettes** ; personne n'appuie sur AZ-5 à l'image (la voix ne prête l'appui à personne).

**L'API commune** : `export function buildX()` → `{ group, A, haloR, update(S, time, px) }`. `group` en coordonnées locales ; `A` des `Object3D` (ancres : `A.focus` et `A.fault` obligatoires — `world.js` pose le halo de la reconstitution sous `A.fault`, de rayon `haloR`) ; `update` lit **directement l'état `S`** (les nombres de `FIRST`, liste fermée : s'il t'en manque un, écris-le sous « À changer ailleurs »), seize fois par image, sans allocation, ne dépend que de `S` et `time` (jamais `Math.random`, jamais l'horloge ; une rotation qui suit une vitesse s'intègre par une fonction du temps qui ne saute pas quand la vitesse change, ou se pilote par un nombre). `world.js` n'appelle que l'`update` du décor affiché.

**Pour regarder** : `npm run look -- CR01 --file <essais.json> --out .cache/planches/CR01/<ton fichier>/… --cols 4` ; un essai porte `"state": { "set": 0|1|2|3, "fx", "fy", "fz", "fs", …nombres }` (le `set` et la lumière de `STAGED`, `world.js`) et une `"pose"` complète (`VIEW`, `world.js`). Les poses de `VIEW` sont **provisoires, réglées sur bouchons** : donne dans ton journal celles qui cadrent sur ton vrai décor (le sujet entre y ≈ 440 et 1160, rien d'important sous 1600, l'en-tête couvre 220–412 : ce qui monte derrière se fond dans le noir).

---

## canal.js

**Le décor-héros : une tranche du cœur, agrandie, où se joue toute la physique du film** (`principe`, `piege`, `t2` le xénon, `t5`, **`defaut`, le plan maître**, `depuis`). Rien d'approchant au catalogue ; pour l'idiome des particules, lis `episodes/005-arret-urgence/src/chain.js` (191 l. : des noyaux, un neutron en brise un, deux repartent — tout en fonction du temps) et prends-en la logique, pas la matière (là-bas c'est du verre et du glow).

**Ce qu'il construit** (`plan.js` → `SLICE`, `FUEL`, `CHANNEL`, `ROD`, `SLAB_CANAL`, `DRIVE`) : trois colonnes de graphite côte à côte le long de z (empilement de blocs, joints lisibles, `tone` moyen), coupées en x = 0, entre une plaque basse et une plaque haute. **Deux canaux de combustible** (z ±44) : le tube, la colonne de combustible (pastilles empilées, coupées : on doit voir que c'est une pile de pastilles), et l'anneau d'eau autour — **l'eau est l'argile la plus claire et la plus lisse** (`tone` ≈ 0,7, un peu moins rugueuse), une surface qui frémit à peine ; **la vapeur** (`steam`) : des bulles papier qui naissent sur la colonne et montent, plus nombreuses en haut ; à `steam` 1 l'anneau est surtout vapeur. **Le canal de barre** (z 0) : l'eau, et **la barre** — de haut en bas : l'absorbant (carbure de bore, l'argile la plus sombre), une colonne d'eau (32), **le déplaceur de graphite (116 : la pièce en défaut, `alarm()`)**, une colonne d'eau en bas (32) ; au-dessus de la plaque haute, le tube où l'absorbant attend (`DRIVE`, il se fond dans le noir avant l'en-tête). Proportions vraies (1,25 · 4,5 · 1,25 m sur 7 m), **jamais affichées**. **Trois valeurs de gris** : graphite moyen, eau claire, absorbant sombre — on comprend sans légende.

**Les neutrons** (`flux`) : des points papier à courte traîne (jamais un point seul qui file : une traînée), 40 à 120 à l'image, qui volent de la colonne de combustible vers les colonnes voisines. Leur nombre suit la puissance de chaque moitié (`pLow` en bas, `pHigh` en haut). **Ce qu'ils deviennent, c'est le film** : dans l'eau, une part est **avalée** (le point s'éteint dans l'eau, petit éclat sombre ; jamais un clignotement) — moins dans la vapeur ; dans l'absorbant, tous ; dans le xénon (`xenon` : grains sombres dans le combustible), avalés ; dans le graphite, ils passent (ralentis). La lueur du combustible (papier, `pLow` / `pHigh`) est la puissance : une lumière qui a un endroit, plus vive en bas quand `pLow` > `pHigh`. **`split`** (le principe, 0 → 1) : une loupe sur le combustible gauche (ancre `A.atoms`) — trois à cinq gros noyaux d'argile ; un neutron arrive, le premier se casse en deux morceaux, deux ou trois neutrons repartent, cassent les suivants (1, 2, 4…) : la réaction en chaîne, lisible à 270 px.

**Le moment du défaut** (`rod`) : 0 retirée, 1 absorbant au fond ; la barre descend de `ROD.travel` × `rod`. **À `rod` ≈ `ROD.expel` (0,18), le pied du déplaceur atteint le bas : la colonne d'eau du bas est chassée** — elle doit se voir disparaître, poussée vers le bas (l'eau s'échappe par le bas du canal), et ses neutrons, qu'elle avalait, ne le sont plus. En haut, l'absorbant entre et avale tout. Les nombres de puissance restent pilotés par l'acte (`pLow` monte, `pHigh` baisse) : le décor les rend lisibles.

**`depuis`** : `solo` 0 → 1 : le graphite, les plaques, les canaux de combustible s'effacent (ils descendent sous le sol ou se fondent dans le noir), **la barre reste seule** sur son halo ; `newRod` 0 → 1 : **la barre redessinée — plus d'eau sous le graphite** (la colonne du bas se résorbe, le déplaceur descend jusqu'au pied) ; `heal(mat, S.depuis)` sur le déplaceur : rouge → vert veille. `rep` 0 → 1 (« En France, nos réacteurs font l'inverse ») : le graphite et la barre s'effacent, il reste **un crayon de combustible dans son eau** ; l'acte fait monter `steam` et baisser `pLow` / `pHigh` ensemble : la lueur faiblit toute seule (ne dessine aucun graphite dans ce mode : un REP n'en a pas).

**API** : `buildCanal()` → `{ group, A, haloR, update(S, time, px) }`. `A` : `focus`, `fault` (le pied du déplaceur, qui descend avec la barre), `rod` (la pointe de l'absorbant), `displacer` (son centre), `waterLow` (la colonne d'eau du bas), `fuel` (canal gauche, mi-hauteur), `atoms` (la loupe de `split`), `top`, `bottom`.

| nombre | ce que tu en fais |
| --- | --- |
| `rod` | la barre descend (0 → 1) ; à 0,18 l'eau du bas est chassée |
| `steam` | la vapeur dans les canaux de combustible (0 eau → 1 vapeur), et donc moins de neutrons avalés |
| `pLow`, `pHigh` | la lueur du combustible et le nombre de neutrons, en bas et en haut (0 … 1 ; 1 = « en flèche ») |
| `flux` | les neutrons montrés (0 / 1) |
| `split` | la loupe de la réaction en chaîne (0 → 1) |
| `xenon` | les grains de xénon dans le combustible, qui avalent (0 → 1) |
| `fault` | le déplaceur en rouge (`setAlarm`) |
| `newRod`, `solo`, `rep`, `depuis` | la barre redessinée ; la barre seule ; le réacteur français ; la guérison (`heal`) |

**Images à réussir** (liste fermée, poses de départ `VIEW`) :
1. **Le plan maître** (`VIEW.canal`) : `rod` 0, `flux` 1, `fault` 1, `pLow` = `pHigh` 0,4, `steam` 0,5 — puis `rod` 0,18, `pLow` 1, `pHigh` 0,2 : la colonne d'eau du bas a disparu, le bas brille et fourmille, le haut s'éteint sous l'absorbant. **Lisible sans le son à 270 px : « ça freine en haut, ça accélère en bas ».**
2. Le même de près (`VIEW.canalLow`, `rod` 0,1 puis 0,18) : le pied rouge pousse l'eau dehors.
3. `VIEW.canalTop` : l'absorbant qui entre, les neutrons avalés.
4. La réaction en chaîne (`VIEW.fuel`, `split` 0,3 puis 0,9).
5. L'eau qui avale puis la vapeur qui avale moins (`VIEW.fuel`, `steam` 0 puis 1, `flux` 1) ; le xénon (`xenon` 1).
6. La barre seule et guérie (`VIEW.rodSolo`, `solo` 1, `newRod` 1, `depuis` 0 puis 1) — et le crayon français (`rep` 1, `steam` 1, `pLow` = `pHigh` 0,2).
7. La couverture : `cover` d'`episode.json` (instant `defaut$` : l'état du 1), titre en haut.

**Propre au dossier** : jamais « la barre en graphite » (l'absorbant est en carbure de bore ; seul le **déplaceur** est en graphite) ; aucune longueur à l'écran ; neutrons et atomes sont des schémas (`sources` le dit).

---

## coeur.js

**Le cœur RBMK en coupe, ≈ 1:10** (`CORE`, `SLAB_LOW`, `SLAB_TOP`, `PIPES`, `VAULT`, `RODS`) : **la première image**, `t2`, `t3`, `t6`, `t7`, `t8`, `issue`, la boucle. Rien d'approchant au catalogue (la cuve du 005 est un REP en verre : ni la forme, ni la matière).

**Ce qu'il construit** : l'empilement de graphite (un cylindre de colonnes carrées, joints lisibles, coupé en x = 0 : on voit dans la face coupée les canaux verticaux, fins mais ≥ 1,8 px, un sur deux ou trois — des dizaines de traits identiques font une dalle grise, `regles-image.md`) ; la plaque basse ; **la dalle supérieure, « un disque géant »** (épaisse, nettement plus claire : elle doit se reconnaître quand elle vole) ; au-dessus, quelques tuyaux épais vers le haut ; la cuve de béton autour, ouverte vers −x, sombre ; **les barres** (`RODS.count` dans la face coupée) qui descendent du haut à travers la dalle, sombres, leur pied net. **La lumière de la puissance vit dans la coupe** : les canaux s'allument de l'intérieur, en bas selon `pLow`, en haut selon `pHigh` (papier) — **la moitié basse passe au rouge alarme avec `fault`** (c'est la seule pièce rouge du cœur). **La fin de la nuit** : `blast` (les tubes éclatent : jets de vapeur papier qui fusent par le haut, la lumière du cœur au blanc un instant — une lumière qui a un endroit), `slab` (la dalle se soulève de `SLAB_TOP.lift` et bascule un peu ; **aucun angle chiffré**, la forme du vol est reconstituée), `blast2` (seconde explosion : des blocs de graphite projetés, des éclats lents — le film est au ralenti), `fire` (le graphite qui brûle : braises alarme qui montent, fumée papier sombre ; `makeEmbers`-like, vivantes, périodiques, déterministes).

**API** : `buildCoeur()` → `{ group, A, haloR, update(S, time, px) }`. `A` : `focus`, `fault` (la moitié basse), `low`, `high`, `slab` (sur la dalle, elle monte avec), `rods` (le pied moyen des barres), `pipes`.

| nombre | ce que tu en fais |
| --- | --- |
| `pLow`, `pHigh` | la lumière dans les canaux, en bas et en haut (0 … 1) |
| `fault` | le bas passe au rouge (`setAlarm`) |
| `rodsIn` | la part des barres dans le cœur (1 : beaucoup, à mi-hauteur ; 0,25 : « très peu de barres dedans ») ; les autres attendent, pied sous la dalle |
| `scram` | toutes les barres descendent ensemble vers le fond (0 → 1) ; l'acte les arrête à ≈ 0,4 (« avant le fond ») |
| `blast`, `slab`, `blast2`, `fire` | la fin de la nuit (0 → 1 chacun) |

**Images à réussir** (liste fermée) :
1. **La première image et ses rivales** (planche de quatre, `docs/CR01-actes.md` « La première image ») : (a) `VIEW.coeurLow` (`POSE0`) et (e) `VIEW.coeur`, état `FIRST` : les barres qui entrent par le haut, le bas qui s'allume rouge — **et ça bouge dès l'image 1 par le sujet** (les barres descendent, la lueur du bas monte et respire lentement).
2. `t2` / `t3` (`VIEW.coeur`) : `pLow` = `pHigh` 0,05 (« à peine un pour cent ») puis 0,15 ; `rodsIn` 0,8 → 0,25 : on voit les barres remonter une à une.
3. `t6` (`VIEW.coeur` puis un rod suivi jusqu'à son pied) : `scram` 0 → 0,06, lent.
4. `t7` (`VIEW.coeurBottom`) : `pLow` 1, `fault` 1, `scram` 0,4 : le bas rouge qui sature, les barres arrêtées à mi-course.
5. `t8` (`VIEW.slab`) : `blast` 1, puis `slab` 1 (la dalle en l'air, entière, sous l'en-tête), `blast2` 1, `fire` 1.
6. `issue` : le même plan, `fire` 0,6, calme.

**Propre au dossier** : pas de « bombe », pas de champignon ; deux explosions, la seconde 2 à 3 s après la première ; la dalle pèse « des centaines de tonnes » à 1 000 t selon les sources — rien ne s'affiche.

---

## centrale.js

**La centrale sur une table, ≈ 1:50** (`PLANT`) : `principe` (« la vapeur fait tourner la turbine »), `t1`, `report`, `t5`. Ouverte vers −x comme une maison de poupée.

**Ce qu'il construit** : la table (argile sombre) ; le bâtiment du réacteur (un bloc clair, d'où partent les conduites) ; **les pompes de circulation** (quatre, en rangée) et leurs conduites vers le réacteur ; **la turbine et son alternateur** (un long carter sur son arbre, un volant visible : sa rotation doit se lire — des repères sur l'arbre ou des ailettes dans une découpe du carter) ; **les trois diesels de secours** (blocs, cheminées) ; **le refroidissement de secours** (deux réservoirs, une conduite vers le réacteur, **sa vanne : la pièce en défaut**, `alarm()`) ; **les pylônes** qui partent vers le réseau. Les flux sont **des têtes de lumière papier qui courent** dans les conduites et les câbles (« ça coule », pas un fil qui s'allume ; tirets en centimètres, au plus un septième de période par image) : `flow` dans les conduites des pompes, `mains` dans la ligne vers le réseau, `feed` de l'alternateur aux pompes (l'idée de l'essai : la turbine qui ralentit nourrit les pompes).

**API** : `buildCentrale()` → `{ group, A, haloR, update(S, time, px) }`. `A` : `focus`, `fault` (la vanne), `reactor`, `pumps`, `turbine`, `generator`, `diesels`, `eccs`, `mains`.

| nombre | ce que tu en fais |
| --- | --- |
| `spin` | la vitesse de la turbine (1 nominale → 0,3 ralentie), intégrée sans saut |
| `flow` | le débit des pompes (têtes qui courent, plus lentes quand il baisse) |
| `diesel` | les diesels démarrent (0 → 1 en « environ une minute » d'histoire : fumée, vibration, un voyant papier) |
| `mains` | le courant vers le réseau (1) ; 0 : coupé |
| `feed` | le courant de l'alternateur vers les pompes (0 → 1) |
| `fault` | la vanne du refroidissement de secours, fermée et rouge |

**Images à réussir** : 1. la table entière (`VIEW.centrale`) ; 2. la turbine qui tourne puis ralentit (`VIEW.turbine`, `spin` 1 puis 0,3) ; 3. les diesels (`VIEW.diesels`, `diesel` 0 puis 0,5) ; 4. les pompes et `feed` (`VIEW.pumps`, `feed` 1, `flow` 0,5) ; 5. la vanne coupée (`VIEW.eccs`, `fault` 1) ; 6. la ligne vers le réseau (`VIEW.mains`, `mains` 1). **Propre au dossier** : le refroidissement de secours a été isolé **la veille à 14 h**, pas cette nuit-là ; aucun chiffre de débit ni de vitesse.

---

## salle.js

**La salle de commande du bloc 4, reconstituée, ≈ 1:1** (`ROOM`) : `promesse` (« le bouton qui devait tout arrêter »), `t4`, `t6`. Vue de −x, de derrière les opérateurs.

**Ce qu'il construit** : le pupitre en arc ; dessus, **le bouton AZ-5** (plus gros que nature, sous son capot ouvert : la pièce en défaut, `alarm()`) et **la rangée des clés de protection** et leurs voyants papier ; au mur, derrière, **le tableau des positions des barres** : un grand disque de petits cadrans (`ROOM.board`, ≈ 72 : chacun montre la profondeur d'une barre par une barre de lumière papier — assez gros pour se lire à 270 px, aucun détail fin qui scintille) ; **trois silhouettes debout** (argile sombre, sans visage, minces : elles ne masquent ni le bouton ni le tableau ; **personne ne touche le bouton** : il s'enfonce seul). Le reste de la salle (panneaux, plafond) en volumes sobres qui se fondent dans le noir.

**API** : `buildSalle()` → `{ group, A, haloR, update(S, time, px) }`. `A` : `focus`, `fault` (le bouton), `desk`, `board`, `keys`, `crew`.

| nombre | ce que tu en fais |
| --- | --- |
| `az5` | le bouton s'enfonce (0 → 1) |
| `fault` | le bouton rouge |
| `prot` | les protections : 1 voyants allumés → 0 éteints un à un |
| `crew` | les silhouettes (0 / 1) |
| `rodsIn`, `scram` | les cadrans du tableau, comme les barres de `coeur.js` (mêmes nombres, même lecture) |

**Images à réussir** : 1. le bouton (`VIEW.az5`, `az5` 0 puis 1, `fault` 1) ; 2. la salle entière (`VIEW.salle`) : silhouettes, pupitre, tableau, **sans que rien ne masque le bouton** ; 3. le tableau (`VIEW.board`, `rodsIn` 0,8 puis 0,25, `scram` 0 puis 0,3) ; 4. les clés (`VIEW.keys`, `prot` 1 puis 0). **Propre au dossier** : la raison de l'appui n'est pas établie ; aucun nom, aucun visage, aucune réplique de série.

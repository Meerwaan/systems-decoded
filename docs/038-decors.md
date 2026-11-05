# 038 · Sous-marin — les décors

Deux fichiers, un agent chacun, en parallèle : `episodes/038-sous-marin/src/sousmarin.js` (le bateau : coques de verre, équipage de verre, et pleins dedans le système de chasse) et `src/mer.js` (la mer du 034 enveloppée, la paroi de roche, la montagne entière, la surface). Les deux existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (sans import ; **lis son commentaire de tête : repères, azimut, tangage**) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `apply` : c'est lui qui appelle vos deux `update`). Recette : `docs/recette-agents.md`. Plan des actes : `docs/038-actes.md` (son haut, et les lignes qui vous concernent). Faits : `docs/faits/038-sous-marin.md` (§ 10 « À ne pas dire ») et `038-contre-verification.md`. **La voix est enregistrée** (92,6 s) : `npm run script -- 038`.

**Pas de décorateur** : la vie vient déjà de la neige marine (034), des bulles et de l'air (le système) ; un lieu sous-marin la nuit n'a rien d'autre à habiller. Ce que `sousmarin.js` met dans le poste (pupitres, écrans de verre, l'équipage) EST son habillage.

**L'échelle est VRAIE** (l'ordre d'un Los Angeles : 110 m, 10 m de diamètre). La disposition intérieure (ballasts, bouteilles, vannes, tuyaux, commande) est **schématique** : l'image la reconstitue, `sources` le dit, rien ne s'écrit à l'écran. **Repère** : l'origine est le bateau (l'axe de sa coque, à mi-longueur), **la proue vers −x**, le kiosque en +y, bâbord en +z (le flanc éclairé, côté caméra). **Le bateau ne bouge jamais dans le monde, c'est la mer qui bouge** (convention du 034) : la surface est à y = +depth·100, le point de contact de la roche à y = (depth − 160)·100 et x = SUB.bow − gap·100. Seul son tangage tourne (`pitch`, + nez en haut : `world.js` fait root.rotation.z = −pitch·DEG). **Azimut** (vérifié dans `kit/lib/stage.js`) : `az` 0 en +z (flanc bâbord de face), −90 devant la proue, +90 derrière la poupe. **Un cadre vertical est étroit (≈ 30° de large à fov 50)** : une caméra qui garde la proue ET la roche au-delà regarde presque le long du bateau, `az` 60–90 ; un bateau entier tient dans le cadre vu à `az` 60–70, jamais de profil (vérifié sur bouchons : de profil, on n'a qu'un tronçon de tube).

**Couleurs** : signal = la menace (la roche et son liseré, le choc, les flèches de pression, la flèche des 7 000 t, les déchirures, l'air qui s'échappe) ; veille = le système vivant (l'air dans les bouteilles, les tuyaux, les ballasts ; la poussée ; la commande actionnée) ; ink = le reste (les coques, l'équipage, la mer, les bulles, la montagne). Nuit noire, **pas de bleu**.

**Exactitude, pour l'image** : le bateau **crève la surface sans en sortir** (jamais il ne jaillit) ; aucun nœud, aucun temps, aucune heure ; **personne n'est blessé à l'image** (le marin mort n'est jamais montré, aucun corps au sol, l'équipage est de verre et se relève) ; la coque épaisse reste **intacte** ; ce sont les ballasts AVANT qui fuient et les ARRIÈRE qui remontent le bateau ; aucun orifice inférieur n'est nommé (« orifices » non sourcé : l'eau peut sortir par le bas du ballast, sans légende).

---

## `src/sousmarin.js` — le bateau et son système

**À lire pour l'idiome** : `episodes/036-eolienne/src/model.js` (pièces pleines, `lit…`, `explode`, ancres), `episodes/023-eolienne-de-secours/src/avion.js` lignes de `skin` (une coque lissée par sections aux rayons X : la recette `skin` existe en 9 copies, prends celle de `034/fond.js` ou de `L04/bord.js`), `kit/lib/figure.js` (l'équipage), `kit/lib/build3d.js`. Le **bouchon** (`hullRadius`, l'ordre des pièces) peut servir de départ.

**Ce qu'il construit**, dans le repère du bateau (`plan.js` : `SUB`, `SAIL`, `FINS`, `PHULL`, `SONAR`, `MBT`, `BANK`, `VALVE`, `PIPE`, `ROOM`, `CMD`, `CREW`, `PRESS`, `WEIGHT`, `LIFT`, `CUBE`) :
- **Aux rayons X** (`glass` + `asShell`, traits fins ≥ 1,8 px) : la **coque légère** (proue arrondie du dôme sonar, cylindre, cône arrière, hélice à sept pales, croix des barres et du gouvernail), le **kiosque** et ses deux barres de plongée ; la **coque épaisse** dedans, plus pâle (cylindre et fonds bombés, `PHULL`) ; le **poste de conduite** (`ROOM` : son pont, deux ou trois pupitres de verre) ; la **sphère sonar** (`SONAR`). Des membrures en traits (anneaux tous les 4–5 m) disent le volume et l'échelle.
- **Pleins** (trois gris, `metal` ≤ 0,5 — c'est le système) : les **quatre ballasts** (`MBT.fwd`, `MBT.aft` : bâbord et tribord, chacun une demi-coquille entre les deux coques) **vus en coupe** quand leur contenu doit se lire — la paroi côté caméra s'efface ou s'ouvre en fenêtre, et dedans l'**eau sombre** (un volume plus sombre, sa surface libre en trait) et l'**air vert** qui la chasse vers le bas ; la **batterie de bouteilles** (`BANK`, six) et leur collecteur ; les **deux vannes** (`VALVE`, poignée qui pivote d'un quart de tour à l'ouverture) ; les **deux tuyaux** le long de la quille (`PIPE`) jusqu'aux ballasts ; la **commande de chasse d'urgence** sur son pupitre (`CMD` : l'image la reconstitue — une poignée sous un capot, lisible, pas une manette de jeu ; jamais le mot « chicken switch ») et son fil de commande jusqu'aux vannes.
- **L'équipage de verre** (`CREW`, `makeFigure`) : cinq hommes au poste ; le chef de quart [0] assis au pupitre de la commande, vu de dos depuis bâbord. `jolt` les jette vers la proue (ils basculent, se rattrapent ; à 0 ils sont debout). Jamais en gros plan, jamais un corps au sol.
- **La proue écrasée** (`crush`) : les 6–8 premiers mètres se plient et se froissent « comme une canette » (anneaux qui se rapprochent, peau qui gondole en plis, arêtes signal), le dôme sonar éclate (la sphère se fend), les deux ballasts avant se déchirent (`MBT.fwd.tears` : trois plaies sur leur bas avant, arêtes signal). La coque épaisse derrière reste intacte.
- **L'air** (veille) : dans les bouteilles (une lueur dedans, `bank`), le front qui court dans chaque tuyau (`flowF`, `flowA` : tirets larges en centimètres, clairs sur le tuyau sombre — règle « un flux se dessine clair sur un conducteur sombre »), le volume d'air qui grossit dans les ballasts (`airF`, `airA` : le niveau d'eau descend, le vert le remplace par le haut). **Les bulles** (`leak`) : des gerbes blanches (encre) qui sortent des trois déchirures avant et montent en s'élargissant, périodiques (vivantes dès qu'elles existent), assez grosses pour se lire à 270 px — ce sont elles qui disent « l'air s'échappe ».
- **Les flèches** : `press` (anneaux de flèches signal courtes pointées vers la coque, `PRESS`), `weight` (une grande flèche signal qui appuie sur le bateau, `WEIGHT`), `lift` (une flèche veille qui pousse dessous, `LIFT`). Pleines, nettes, pas de voile.
- **Le principe** (`cube`, sur l'établi) : dans le ballast avant bâbord, un **cube d'un mètre d'eau** (`CUBE`) se découpe en traits, l'air vert le chasse par le bas, il sort et descend hors du cadre ; un cube d'air vert prend sa place. (La balance du `voir` n'est pas faite : le cube qui tombe EST les mille kilos en moins.)
- **L'éclaté** (`explode`, sur l'établi seulement, le bateau à plat) : la coque légère de l'avant s'ouvre en panneaux qui s'écartent (vers le haut et vers +z, jamais devant la caméra des poses `exploded`), le kiosque monte, les ballasts avant s'écartent de la coque épaisse (±z, un peu vers le bas — jamais sous la grille de l'établi, y > −540), la batterie de bouteilles sort sous le poste, la commande reste à sa place, éclairée ; **tout le chemin de l'air (bouteilles → vannes → tuyau → ballasts) lisible dans UN cadre vertical** vu de `VIEW.exploded`, rien derrière l'en-tête.

**API à rendre** (exactement) : `export function buildSub()` → `{ root, A, parts, update(P, time, px) }`.
- `root` : le repère du bateau (`world.js` le met dans un groupe tourné par `pitch`).
- `A` (Object3D, attachés au bateau) : `bow`, `sail`, `bank`, `valve`, `cmd`, `chief` (la tête du chef de quart), `tankF` (le ballast avant bâbord : le cœur), `tankFs`, `tankA`, `tankAs`, `cube`, `tears[3]`, `centre`, `weight` (le haut de la flèche), `lift` (le bas de la flèche).
- `parts` : `{ hull, sail, phull, sonar, room, crew, tanksF, tanksA, bank, valves, pipes, cmd, arrows, bubbles }` — chacune ses matières.
- `update(P, time, px)`, seize fois par image, sans allocation :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (le bateau à plat, `world.js` cache la mer) : la coque légère suit `hull` (0,35), l'équipage est caché |
| `hull` | le verre de la coque légère, du kiosque, des barres, de l'hélice (0–1) |
| `inner` | le verre de la coque épaisse, du poste, de ses pupitres (0–1) |
| `crew` | l'équipage de verre (0–1) |
| `jolt` | l'équipage jeté vers la proue (0 → 1), relevé à 0 |
| `crush` | la proue écrasée, le dôme sonar éclaté, les ballasts avant déchirés (0 → 1 ; les déchirures restent ensuite) |
| `press` | les anneaux de flèches de pression (0–1) |
| `weight` / `lift` | la flèche des 7 000 t (signal, vers le bas) / la poussée (veille, vers le haut) (0–1, la flèche s'allonge) |
| `explode` | l'éclaté, sur l'établi (0 → 1) |
| `cmd` | la commande : 0 au repos → 1 actionnée (la poignée bascule, veille) |
| `valves` | les deux vannes : 0 fermées → 1 ouvertes (quart de tour) |
| `bank` | l'air dans les bouteilles : 1 plein (veille) → 0 vidé |
| `flowF` / `flowA` | le front d'air dans le tuyau avant / arrière : 0 → 1 de la vanne aux ballasts, puis il coule |
| `airF` / `airA` | l'air dans les ballasts avant / arrière : 0 pleins d'eau → 1 pleins d'air |
| `leak` | les gerbes de bulles par les déchirures avant (0–1) |
| `cube` | le mètre cube d'eau chassé (0 → 1) |
| `heart` | le ballast avant bâbord seul : le reste s'assombrit autour (0–1) |
| `speed` | l'hélice tourne (avec `time`), de petites lignes d'eau filent le long de la coque à 1 ; 0 : immobile |
| `litBank`, `litCmd`, `litValve`, `litPipe`, `litTank`, `litHull` | la pièce que la voix nomme luit faiblement (`litTank` : les quatre ballasts ; `litHull` : la coque épaisse) |

**Images à réussir** (10, liste fermée — poses de départ dans `world.js` → `VIEW`, réglées sur bouchons) :
1. **La première image** (`VIEW.underB` = `POSE0`, et `underA`, `keelC`, `bowD`), `speed` 1, `crush` 0 : vu d'en dessous, le bateau se lit en un tiers de seconde comme un sous-marin (coque, kiosque, barres) — ses arêtes claires sur le noir, les ballasts et les bouteilles pleins visibles dedans, petits mais lisibles ; ça bouge par l'hélice et l'eau qui file.
2. `VIEW.bottles` (`bank` 1, `litBank` 1) : les six bouteilles vertes sous le poste, à travers le verre.
3. `VIEW.mass` (`weight` 1) : le bateau entier sous la flèche signal.
4. `VIEW.impact` (`crush` 0 puis 1, `gap` 0) : la proue pliée contre la roche — on lit « canette » à 270 px ; les déchirures signal.
5. `VIEW.crew` (`jolt` 0 puis 1) : cinq silhouettes de verre basculent vers l'avant, aucune en gros plan.
6. `VIEW.cmd` (`litCmd` 1, puis `cmd` 1) : la commande, seule éclairée, par-dessus l'épaule du chef de quart (`dof` : elle nette, lui flou).
7. **L'éclaté** (établi, `VIEW.exploded`, `explode` 1, `flowF` 1) : bouteilles, vannes, tuyau, ballasts dans UN cadre vertical, le trait vert du chemin de l'air.
8. **Le cœur** (`VIEW.tank`, `heart` 1, `airF` 0 puis 0,5) : le ballast avant en coupe, plein d'eau sombre, puis l'air vert qui descend ; et `VIEW.cube` (`cube` 0 → 1).
9. **Le climax** (`VIEW.climb`, `crush` 1, `leak` 1, `airF` 0,3, `airA` 0 → 1, `pitch` 0 → 6) : des gerbes de bulles à l'avant, le vert qui grossit à l'arrière — les deux lisibles dans le même cadre à 270 px.
10. La couverture (`cover` d'`episode.json` : établi, `explode` 1, tout le système éclairé, `el` 30, sous « Système Décodé », shift −430).

**Propre au dossier** : la coque est longue et le cadre vertical étroit — tout ce qui doit se lire d'un plan large se lit **de trois quarts arrière, presque dans l'axe** ; vérifie tes images sur ces poses-là, pas de profil. Le bouchon montrait une coque de verre presque invisible de loin : la coque doit tenir par ses arêtes (silhouette, membrures, kiosque) à 200 m. Le cœur est le ballast **avant bâbord** (+z, côté caméra).

---

## `src/mer.js` — la mer, la roche, la montagne, la surface

**Réutilisé** : `episodes/034-boite-noire/src/fond.js` (l'Atlantique de nuit du 034, à l'échelle vraie : sa neige marine, sa surface vue d'en dessous, son fond en lignes, son `fog(d)`) — **importé tel quel, jamais modifié** (le 034 est en ligne), enveloppé comme le fait le bouchon. Ses nombres : `depth`, `rush`, `shell` ; les autres à 0 (`wreck`, `ping`, `range`, `beam`, `pool`). **À cacher** (ils ne sont pas à nous) : l'épave de l'A330 (`fond.A.tail`), ses débris (dans le groupe de la mer, aux positions `WRECK.pieces` du `034/src/plan.js`), le point de la boîte (`dot`, enfant direct de `fond.group`), les anneaux — par un parcours de `fond.group` une fois construit, à documenter dans ton journal. Lis son en-tête et `update` (lignes 720–830), pas tout le fichier. **Si sa neige ne sait pas filer à l'horizontale** (elle ne file que verticalement, `rush`) : recopie son shader de neige dans `mer.js` pour une couche qui file le long de x à `speed` (traînées), garde la sienne pour `rush`.

**Ce qu'il construit**, dans le repère de la mer (qui bouge : `plan.js`) :
- **La paroi** (`ROCK`) : le flanc de la montagne sous-marine, qui sort du noir derrière la proue. **Aux rayons X** : pas de roche pleine, mais un relief dit par ses **courbes de niveau et ses arêtes** encre (strates, éboulis, quelques blocs), un verre qui ne se montre qu'aux bords, un **liseré signal** sous `mood` (c'est la menace) ; sa face regarde +x, penchée de `lean` ; le point de contact (`A.contact`) à la hauteur de l'axe du bateau à 160 m. Elle **sort du noir** : lisible depuis la première image à 120 m derrière la proue, puis de plus en plus grande. Au choc (`gap` 0), la proue y est collée ; un peu de sédiment qui s'en détache est bienvenu.
- **La montagne entière** (`SEAMOUNT`, `mount`) : un cône schématique de la base (3 900 m) au sommet (90 m sous la surface), en **courbes de niveau** espacées, encre, vu de très loin (`VIEW.mountain`, d ≈ 9 km) — le bateau un point à la surface. Une forme qu'on lit comme « une montagne » sans en inventer le relief.
- **La neige marine qui file** (`speed` : à 1, des traînées le long du bateau, vers +x — l'image 1 bouge par elle ; à 0, elle flotte) et **qui monte ou tombe** (`rush`, du 034).
- **La surface** : vue d'en dessous (034, à moins de 150 m) ; vue **de côté** quand `sky` > 0 — un plan d'eau en traits fins, un ciel bas et sombre (deux ou trois bandes de nuages en traits), **l'écume** là où la coque crève la surface (un anneau autour de la section du bateau à hauteur de l'eau). Le bateau ne sort jamais au-dessus de `DEPTH.float`.

**API à rendre** (exactement) : `export function buildMer()` → `{ group, A, update(P, time, px), fog(d) }`.
- `group` : à l'origine (le bateau) ; tout ce qui est fixe dans la mer s'y déplace avec `depth` et `gap`.
- `A` : `contact` (le point de la roche que touche la proue), `summit` (le sommet de la montagne), `surface` (la surface à l'aplomb du bateau).
- `fog(d)` : la densité du brouillard pour une caméra à la distance d (celle du 034, réglée si la montagne entière doit se voir à 9 km).

| nombre | ce que tu en fais |
| --- | --- |
| `sea` | toute la mer aux rayons X : neige, surface, fond, roche (0–1 ; 0 sur l'établi) |
| `depth` | la profondeur de l'axe du bateau (m) : la surface à +depth·100, la roche avec elle |
| `gap` | de la proue à la face de la roche (m) |
| `speed` | la neige file le long du bateau (0–1) |
| `rush` | la neige monte (+1 : le bateau monte, elle défile vers le bas) ou tombe |
| `rock` | la paroi (0 → 1, elle sort du noir) |
| `mount` | la montagne entière en courbes de niveau (0–1) |
| `sky` | la surface vue de côté, le ciel bas, l'écume autour de la coque (0–1) |
| `mood` | le liseré signal de la roche (0 / 1) |

**Images à réussir** (6, liste fermée) :
1. **La première image** (`POSE0` = `VIEW.underB`, et `underA`, `keelC`, `bowD`, à `gap` 120 puis 100) : la paroi sort du noir derrière la proue, grande, lisible, signal à ses bords ; la neige file. Et `gap` 35 (`VIEW.near`) : la roche à quelques mètres de la proue.
2. `VIEW.impact` (`gap` 0) : la proue contre la paroi, la roche lisible autour du point de contact.
3. `VIEW.climb` (`depth` 160 → 40, `rush` 1) : le bateau qui monte le long de la paroi, la neige qui défile vers le bas, la surface qui s'approche en haut du cadre.
4. `VIEW.surface` (`depth` 12 → 4,5, `sky` 1) : le plan d'eau vu presque au ras, la coque et le kiosque qui le crèvent sans en sortir, l'écume.
5. `VIEW.float` (`sky` 1) : le bateau qui flotte, immobile, sous un ciel bas.
6. `VIEW.mountain` (`mount` 1) : la montagne entière, schématique, le bateau un point à la surface.

**Propre au dossier** : pas de bleu, la nuit est noire ; la roche est le seul grand objet de décor : elle doit rester **plus sombre et plus fine** que le bateau (le sujet), lisible par ses lignes. Le 034 est rendu et en ligne : on n'y touche pas, même pour une ligne.

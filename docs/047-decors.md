# 047 · Lave-vaisselle — les décors

Trois fichiers, un agent chacun, en parallèle : `episodes/047-lave-vaisselle/src/model.js` (le système : le circuit d'eau, plein), `src/cuve.js` (le lave-vaisselle autour, aux rayons X, le plat et sa croûte) et `src/cuisine.js` (la cuisine du 009 importée telle quelle, l'évier, toi, les deux colonnes d'eau). Tous trois existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/047-actes.md` (son haut commun et les plans qui te concernent). Faits : `docs/faits/047-lave-vaisselle.md` et `047-contre-verification.md`. **La voix est enregistrée** (91,3 s) : `npm run script -- 047`.

**Le repère** (`plan.js`) : l'origine est le centre de l'empreinte du lave-vaisselle au sol ; **sa porte regarde +z** ; x va vers la droite quand on lui fait face ; y monte. **Azimut vérifié sur bouchon** (`kit/lib/stage.js` : caméra en t + d·(sin az, …, cos az)) : `az` 0 se tient en +z, **devant la porte** ; −90 à −x, son flanc gauche (côté évier) ; ±180 derrière (le mur). La lumière clé vient de −x, +y, +z : on filme entre az −20 et −70. Pour voir la face intérieure de la porte depuis la cuve : az ≈ −150 (`VIEW.dispenser`, vérifié : le distributeur et sa trappe se lisent).

**L'échelle est la vraie** : un lave-vaisselle encastrable de 60 cm, sa cuve inox, ses pièces aux places habituelles (tailles d'après photos et manuels : jamais affichées). La colonne de dix litres a son vrai volume (r 8 cm, 50 cm de haut).

**Ce qu'on n'a pas le droit de montrer** (contre-vérification) : jamais la cuve pleine d'eau — il n'y a jamais au fond qu'**un peu d'eau** (le puisard, une pellicule sur le microfiltre), réchauffée, pompée, projetée ; jamais un volume unique de dix litres qui tourne tout le cycle (les dix litres sont le total de trois ou quatre remplissages : la colonne à côté de la machine, jamais dans la cuve) ; **le bras n'a pas de moteur** : rien sous son moyeu qu'un tube, il tourne par la réaction de ses jets ; la pastille ne plonge pas dans une cuve pleine. Couleurs : `signal` = la croûte (et l'eau qui part à l'égout à l'évier) ; `veille` = le système vivant (les jets, la ronde de l'eau, le voyant éco, la pièce que la voix nomme) ; `ink` = le reste. La résistance rougit en `signal`, petite et localisée (une lampe qui a un endroit).

**Ordres de rendu des coques** (`asShell`) : toi 10, les fantômes 12, la cuve et la porte 20 à 22, la cuisine du 009 24 (elle le fixe elle-même).

---

## `src/model.js` — le circuit d'eau (le système, plein)

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` ou `014-abs/src/model.js` (pièces, `lit…`, `explode`, ancres), `kit/lib/build3d.js` (`lathe` pour le puisard, les filtres, le moyeu ; `TubeGeometry` pour le tube et la résistance), `episodes/008-paratonnerre/src/model.js` (`climb`, `flow` : une tête de lumière qui avance le long d'un conducteur).

**Ce qu'il construit**, en cm, à ses VRAIES places (`plan.js` : `SUMP`, `FILTERS`, `PUMP`, `TUBE`, `ARM`, `HEATER`, `VALVE`, `DISPENSER`, `DOOR`, `LOOP`, `BENCH_FROM`, `SYSTEM`). Sur l'établi, `world.js` le pose à −`BENCH_FROM` (rien à faire).

- **L'électrovanne** (`VALVE`) à l'arrière gauche du socle : corps, bobine (un cube plus clair), embout du tuyau vers −z ; son tuyau monte entre la paroi gauche et la carrosserie jusqu'à l'**orifice d'arrivée** (`port`), bas sur la paroi gauche. `inlet` : la bobine s'allume, un filet d'eau sort de l'orifice en arc, touche le fond et file dans le puisard (un ruban veille, jamais un trait fin).
- **Le puisard** (`SUMP`) : une coupelle dans le fond de cuve ; **sa flaque** (`water` : 0 sec → 1 le puisard plein à ras bord et une pellicule sur le microfiltre, **jamais plus**). L'eau lit `veille` quand elle sert (une surface claire qui frémit, pas une boule).
- **Les trois filtres** (`FILTERS`), emboîtés : le **grossier** (une coupelle à poignée qui dépasse du fond), le **fin** (un cylindre de grillage : le motif se fond en gris dès qu'il passe sous le pixel, `fwidth`), le **microfin** (une plaque perforée posée sur le fond, avec le trou du puisard). Trois valeurs de gris, le grossier le plus clair.
- **La pompe de cyclage** (`PUMP`) dans le socle à droite du puisard : volute (la tête), moteur le long de +x. `pump` : elle respire (une lueur lente), elle aspire.
- **Le tube** (`TUBE`) de la volute au moyeu du bras, sous le fond de cuve.
- **LE BRAS D'ASPERSION** (`ARM`), le cœur, la pièce la plus claire : moyeu, bras de 46 cm, buses sur le dessus (cinq par côté, inclinées) et **une buse à chaque bout, orientée de côté** : c'est elle qui pousse. Il tourne autour de y de `turn` tours (lu tel quel : `−turn · 2π`, sens à garder tel quel : vérifie qu'il tourne À L'OPPOSÉ de ses jets de bout). **Sous son moyeu, rien qu'un tube** : à `VIEW.hub`, le spectateur doit voir qu'il n'y a pas de moteur.
- **Les jets** (`jets`) : des traînées `veille` qui sortent des buses et montent ; sous le plat (`DISH` : rectangle w × d centré en `centre`, incliné de `tilt`), elles s'arrêtent sur la croûte (`DISH.crust`) ; ailleurs elles montent jusqu'au panier puis s'éteignent. Un jet a un cœur clair et une traîne (jamais une tige unie ni un trait sous 1,8 px). Ils tournent avec le bras ; **ce qui tourne vite ne porte pas de détail fin** (un jet dessiné en traînée, `regles-image.md` « Net et fluide »).
- **La poussée** (`thrust`) : à chaque bout, une flèche `veille` à l'opposé du jet de bout (la réaction) ; elles tournent avec le bras.
- **La résistance** (`HEATER`) : une épingle couchée sur le fond de cuve, autour du puisard, sous le balayage du bras. `heat` : elle rougit (`signal`, ≤ 3), du gris au rouge par le centre du tube.
- **Le distributeur** (`DISPENSER`) sur la face intérieure de la porte, **qui suit la porte** (`door` : rotation autour de l'axe de charnière `DOOR.hinge`, le haut vers +z ; sur l'établi `bench` 1 : porte fermée) ; sa **trappe** (charnière sur son bord bas, elle tombe ouverte vers la cuve : `trap`), **la pastille** dans sa chambre (`tab` : 0 dedans · 0,3 → 0,55 elle tombe jusqu'à `DISPENSER.lands`, le fond de cuve devant · → 1 elle fond en un nuage clair qui s'étale vers le puisard, puis plus rien). Filme la trappe **de profil** pour qu'on voie son sens.
- **La ronde de l'eau** (`LOOP`) : une ligne `veille` (≥ 4 px, `loop`) qui passe par le bras, monte un jet jusqu'à la croûte, retombe sur les filtres, entre dans le puisard, la pompe, le tube, et revient au moyeu ; des **têtes de lumière** y courent, leur phase = la partie fractionnaire de `passes` (plusieurs têtes espacées ; à grande vitesse elles s'allongent en traînées au lieu de sauter : au plus un septième de leur écart par image).
- **`solo`** : toutes les pièces sauf le bras descendent à un quart (« et au bout, le bras d'aspersion » : le cœur isolé).
- **`lit…`** (`litValve`, `litSump` — le puisard et ses filtres —, `litPump`, `litArm`, `litTrap`) : la pièce que la voix nomme prend une faible lueur `veille`.
- **L'éclaté** (`explode`, sur l'établi) : **dans UN cadre vertical** (vérifié sur bouchon à `VIEW.exploded`) : le socle reste (vanne, pompe, puisard), la résistance monte un peu, puis le microfin, le fin, le grossier en colonne au-dessus du puisard, le bras en haut, le distributeur qui sort de sa porte à mi-hauteur. Chaque pièce garde ses matières (`setPartOpacity` pièce par pièce).

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, parts, A, update(P, time, px) }`.
- `parts` : `valve, sump, micro, fine, coarse, pump, tube, heater, arm, dispenser, trap, tablet`.
- `A` (ancres, `Object3D`) : `valve, port, sump, filters, pump, tube, arm, hub, tip` (le bout du bras : il tourne avec lui), `heater, dispenser, trap, tablet`.
- `P` lit : `explode turn jets thrust inlet water pump passes loop heat trap tab door bench litValve litSump litPump litArm litTrap solo`.

**Les images à réussir** (liste fermée ; poses de `world.js` → `VIEW`, provisoires, à corriger dans ton journal) :
1. **La première image** (`POSE0`, et les candidates de `docs/047-actes.md`) : sous le panier, le bras qui tourne, ses jets qui frappent la croûte, un peu d'eau au puisard — le bras et les jets lisibles à 270 px.
2. `VIEW.system` : le bras sous le plat, de trois quarts, ses buses lisibles.
3. **L'établi entier** (`VIEW.whole`) : le circuit sur son halo, de trois quarts — « électrovanne, puisard, pompe, tube, bras » se lisent sans légende.
4. **L'éclaté** (`VIEW.exploded`) : tout dans un cadre vertical, chaque pièce nommable.
5. **L'eau qui entre** : `inlet` 1, le filet de l'orifice au puisard (`VIEW.whole` resserré sur la vanne).
6. **Le cœur seul** (`VIEW.arm`, `solo` 1, `litArm` 1) : le bras, ses buses inclinées.
7. **Pas de moteur** (`VIEW.hub`, `thrust` 1, `jets` 0,6) : le moyeu vide, les jets de bout et leurs flèches, le bras qui tourne à l'opposé.
8. **La trappe s'ouvre** (de profil, `trap` 0 → 1) et **la pastille tombe** (`tab` 0,3 → 0,55) puis fond (→ 1).
9. **La ronde** (`VIEW.section`, `loop` 1, `passes` qui court) : une boucle verte qui fait le tour, lisible d'un regard ; à `passes` qui accélère, aucune image parasite.
10. **La résistance rouge** (`heat` 1) sans voile, à côté du puisard.

**Propre au dossier** : ce n'est pas un objet qu'on connaît de l'intérieur — c'est le moyeu vide et la ronde qui portent le film : soigne-les avant tout le reste. Les jets sont la pièce la plus vue du film (accroche, repos, acte 3, boucle) : ils doivent être beaux en gros plan et ne jamais scintiller.

---

## `src/cuve.js` — le lave-vaisselle autour du système (rayons X), le plat, la croûte

**À lire pour l'idiome** : `episodes/006-defibrillateur/src/hall.js` ou `004-differentiel/src/room.js` (un décor aux rayons X), `episodes/009-micro-ondes/src/kitchen.js` lignes 279–350 (les collecteurs `slab` / `frame` / lignes `strong` / `fine` / `faint` : une machine de verre cuite en peu de maillages). **Pars de rien**, aucun lave-vaisselle n'existe au catalogue.

**Ce qu'il construit** (`plan.js` : `DW`, `BASE`, `TUB`, `DOOR`, `RACK`, `RACK2`, `DISH`) :
- **La carrosserie** (`DW`) et **la cuve** (`TUB`), verre et traits fins (`shell`) ; le fond de cuve en pente douce vers le puisard (des lignes, pas une dalle) ; le socle (`BASE`) seulement en traits faibles : le circuit plein s'y lit.
- **La porte** (`DOOR`) : verre, son joint, le bandeau du haut et **le voyant éco** (`DOOR.lamp`, `eco` : une petite lumière `veille` qui a un endroit, visible de devant et de dessus) ; elle tourne autour de `DOOR.hinge` (`door` 0 fermée → 1 ouverte à plat, le haut vers +z). Le distributeur n'est PAS ici (il est au système, il suit la porte tout seul).
- **Les paniers** (`RACK` plein trait, `RACK2` plus faible) : fils de verre, picots, roulettes sur leurs rails ; le bras supérieur et sa colonne en verre (`RACK2.arm`). Pas de trait sous 1,8 px ; vus de dessous, les picots ne doivent pas faire une herse illisible.
- **LE PLAT À GRATIN** (`DISH`), plein : un plat de four en céramique émaillée (anses, bords arrondis, `lathe` ou `plate` chanfreiné), **retourné dans le panier du bas**, son intérieur sale tourné vers le bras, incliné de `tilt`. Clair sur sombre, trois valeurs.
- **La croûte** (`crust`) : une couche `signal` cuite sur le fond intérieur et qui remonte sur les parois — irrégulière, bosselée, avec des bords brûlés plus sombres ; elle prend une lueur où les jets la frappent (lis `jets` et `turn` : les impacts suivent les jets du bras, `ARM` dans `plan.js`). **`crack`** : elle se fend, se décolle **en plaques** qui tombent et viennent se poser sur le filtre grossier (au-dessus du puisard, `SUMP`) ; à 1 il n'en reste rien sur le plat. **`crust` 0** : le plat propre (émail clair).
- **L'eau qui retombe** : sous le plat, des gouttes et des filets qui retombent vers le fond quand `jets` > 0 (des traînées, jamais des points) ; un éclaboussement là où les jets touchent la croûte.
- **Les fantômes** (`ghosts`) : une éponge et une brosse de vaisselle en verre, dans la cuve vide, qui s'effacent (« ni éponge, ni brosse »).

**API à rendre** (exactement) : `export function buildCuve()` → `{ group, A, update(P, time, px) }`. `A` : `dish, crust, door, lamp, rack, floor`. `P` lit : `shell door eco dish crust crack ghosts jets turn passes mood`.

**Les images à réussir** :
1. **La première image** (`POSE0`, candidates A–D) : le plat retourné, sa croûte orange au-dessus du bras, frappée par les jets — le plat reconnu en un tiers de seconde.
2. `VIEW.door` : la porte qui se ferme (`door` 0,4 → 0), le voyant éco qui s'allume.
3. `VIEW.tub` : la cuve vide, l'éponge et la brosse de verre qui s'effacent.
4. `VIEW.crust` : la croûte vue de dessous, intacte (repos), le plat lisible.
5. `VIEW.section` : la cuve en coupe plein cadre, rien ne masque le circuit plein.
6. **« Et la croûte lâche »** : `crack` 0 → 1 en une seconde, des plaques qui tombent dans le filtre grossier.
7. La chute (`POSE0`, `crust` 0) : le plat propre au même cadre que la première image.
8. `VIEW.door` à la fin : la porte qui se referme doucement.

**Propre au dossier** : la croûte est la menace du film (le `signal`) ET ce qui doit se lire en premier dans la première image : son relief et sa lueur passent avant tout le reste de la cuve, qui s'efface.

---

## `src/cuisine.js` — la cuisine du 009, l'évier, toi, les deux colonnes

**À lire** : `episodes/018-cocotte-minute/src/cuisine.js` (le modèle d'enveloppe : 57 lignes), la tête de `episodes/009-micro-ondes/src/kitchen.js` (son API : `buildKitchen({ hob, floorAt })`, `update({ shell, you, near, pull, open, eyes, hand, pain })`), `kit/lib/figure.js` (`makeFigure`, `hands: "flat"`, `reach`). **On importe le 009 tel quel, on n'y touche jamais** (film publié).

**Ce qu'il construit** (`plan.js` : `KITCHEN`, `WORKTOP`, `SINK`, `WASTE`, `YOU`, `COLUMNS`) :
- **La cuisine du 009**, déplacée de `KITCHEN.at` (son mur à z −30, la fin de son plan de travail à x −32 : le lave-vaisselle est au bout), `floorAt: KITCHEN.floorAt`, `you` 0 ; `room` règle son `shell` ; **`night`** l'éteint (le verre baisse, rien ne bleuit : trois couleurs). Sa niche de four est vide : si elle se voit, une boîte de four de verre simple (ou la laisser dans le noir).
- **Le plan de travail** qui continue au-dessus du lave-vaisselle (`WORKTOP`), du même trait que celui du 009.
- **L'eau du robinet** (`tap`) : une colonne d'eau de la bouche (`SINK.mouth`) au fond de la cuve d'évier, claire, qui frémit ; **l'évacuation** (`WASTE`) : le siphon et le tuyau jusqu'au mur ; `drain` : des têtes `signal` y descendent et entrent dans le mur (« il gaspille de l'eau »).
- **Toi**, de verre (`makeFigure`, mains `flat`), devant l'évier (`YOU`), une assiette de verre en main ; `rinse` : tu passes l'assiette sous le robinet (0 tenue devant toi → 1 sous l'eau). Jamais en très gros plan, jamais la main seule.
- **Les deux colonnes** (`COLUMNS`, au sol à droite de la machine) : deux cylindres de verre à leur vrai volume ; celle de la machine se remplit en `veille` (`litres` : 1 = dix litres = 50 cm), celle de la main en `ink` (`hand` : 1 = deux fois plus haute). **Aucune graduation chiffrée sur la colonne de la main** ; sur celle de la machine, un seul trait au niveau « dix litres » (sans texte : l'étiquette est HTML). Invisibles tant qu'elles sont vides.

**API à rendre** (exactement) : `export function buildCuisine()` → `{ group, kitchen, A, update(P, time, px) }`. `A` : `sink, tap, plate, drain, waste, columnM, columnH`. `P` lit : `room night tap drain you rinse litres hand`.

**Les images à réussir** :
1. `VIEW.kitchen` : le long du plan de travail depuis l'évier (az −62) — l'évier au premier plan, le lave-vaisselle, les deux colonnes au fond à droite ; la machine se lit comme un lave-vaisselle.
2. Les colonnes (`VIEW.columns`) : la machine qui s'arrête à mi-hauteur de la main.
3. `VIEW.sink` : toi, l'assiette sous le robinet, l'eau qui file au tuyau en `signal`.
4. `VIEW.door` la nuit (`night` 1) : la cuisine éteinte, seul le voyant vit.
5. `VIEW.below` : sous le plancher (la grille du sol vue de dessous), en levant les yeux vers la cuisine — la boucle part de là.

**Propre au dossier** : le décor est un **lieu**, pas un sujet ; il s'efface (verre, traits fins). Rien de plein dans la cuisine sauf l'eau qui coule. Toi, ne te mets jamais entre la caméra et l'évier dans `VIEW.kitchen` : place-toi de trois quarts, côté mur.

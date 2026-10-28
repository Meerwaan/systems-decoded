# Catalogue des décors

Généré par `npm run catalogue` le 2026-10-27 à partir du code et de `docs/catalogue-notes.json` — **ne pas éditer à la main** (les notes se corrigent dans le JSON). Vignettes : `docs/catalogue/`.

**À lire avant de modéliser quoi que ce soit.** Un décor neuf coûte 400 à 580 k jetons et 20 à 57 min ; un décor importé, presque rien (018 : la cuisine entière en 57 lignes d'assemblage ; 019 : la voiture du 011 telle quelle ; 024 : le mur du 016 ; 028 : la chambre du 022 ; L01 : la voiture du 011 et la rue du 014).

**Le contrat commun.** Un décor est `buildX()` → `{ group (ou root), A (ancres), update(p, time, px) }` : `world.js` ajoute `group` à la scène (ou le re-parente), et appelle `update` dans `apply(S, time)` avec les nombres de l'état ; tout est en **centimètres, y en haut**, dans le repère que donne le `plan.js` de son épisode. `update` est appelé seize fois par image : il ne dépend que de l'état et du temps.

**Réutiliser sans casser un film publié.** On **importe** le fichier d'origine (son `./plan.js` se résout dans son propre dossier : il garde ses cotes), on importe aussi ce qu'il faut de son `plan.js` pour savoir où sont les choses (`import { YOU } from "../../009-micro-ondes/src/plan.js"`), et on **enveloppe** au lieu de modifier : on masque ce qui ne sert pas par ses nombres d'état (011 : `bags` 0, `you` 0), on ajoute à côté ce qui manque (`L01/car.js`, `019/cabine.js`, `018/cuisine.js` sont les trois modèles d'enveloppe). On ne touche jamais au fichier d'un dossier publié : un changement y changerait un film en ligne.

Légende : `entrée` la fonction à appeler · `état` les nombres que lit `update` · `lit` ses dépendances locales · **repris par** les dossiers qui l'ont déjà importé ou recopié · + forces · − défauts connus (journaux `docs/journal/<ep>-<fichier>.md`, `docs/<ep>-actes-maj.md`) · ◎ poses (les valeurs sont dans le `world.js` de l'épisode, `VIEW`) · la dernière ligne est l'import exact à copier. *en chantier* : dossier pas encore rendu, son interface peut bouger.

## Maison et intérieurs domestiques
Vignettes : `docs/catalogue/planche-maison.jpg`

- **La maison entière** `008/house.js` — Maison aux rayons X (murs de 24 cm et fenêtres, toit, gouttières), charpente, fils et tuyaux pleins, toi à la fenêtre, l'arbre ; `whatif` fait entrer la foudre par la cheminée jusqu'à ta main.
  entrée buildHouse() · état `shell inside you out whatif fire` · lit ./plan · 1044 l.
  + une vraie maison à l'échelle, intérieur et pièces (une cuisine, une salle de bain) ; s'éclaire de dedans.
  − la pomme de douche ne se lit pas ; vue de loin c'est un dessin de traits : elle sert de lieu, pas de sujet.
  ◎ VIEW 008 : house, window, roof, sans, wide, outside
  `import { buildHouse } from "../../008-paratonnerre/src/house.js";`
- **La cuisine** `009/kitchen.js` — Cuisine de verre : colonne et niche du four (laissée libre), plan de travail, évier, plaque, hotte, placards ; deux personnages de verre, dont toi avec une vraie tête sculptée penchée vers la vitre.
  entrée buildKitchen({ hob = true, floorAt = [YOU.x, YOU.z + 20] } = {}) · état `shell you near pull open eyes hand pain` · lit ./plan · 688 l. · **repris par 012, 018**
  + le décor domestique le plus réutilisé ; options `hob: false` (laisse la place à la plaque du 012) et `floorAt`.
  − rien de plein : elle s'efface pour laisser lire l'appareil (c'est voulu) ; la main sur la poignée fait mannequin de près.
  ◎ VIEW 009 ; et ceux de 012 / 018 pour la plaque
  `import { buildKitchen } from "../../009-micro-ondes/src/kitchen.js";`
- **La plaque à gaz et la casserole** `012/hob.js` — Plaque à gaz de verre posée dans le plan du 009 (trois brûleurs fantômes, grilles, rampe de gaz), la casserole et sa mousse qui déborde (une surface placée par shader), toi à la manette.
  entrée buildHob() · état `shell pot boil spill you press flame` · lit ./plan · 847 l. · **repris par 018**
  + s'assemble avec 009/kitchen, 012/model (le brûleur plein) et 012/fire (les flammes) : c'est ce que fait 018/cuisine.
  − éclat rose brûlé sur le dôme d'eau ; dessous illisible à az −62 (robinets alignés) ; « ta main se lève » n'a pas de nombre.
  ◎ VIEW : hook burner tip under heart system whole exploded …(+15)
  `import { buildHob } from "../../012-gaziniere/src/hob.js";`
- **Cuisine assemblée (modèle d'enveloppe)** `018/cuisine.js` — Rien de modélisé : la cuisine du 009 sans sa plaque + la plaque du 012 sans casserole + le brûleur et le feu du 012 ; la cocotte (le système) se pose sur le brûleur.
  entrée buildCuisine() · état `shell you press flame` · lit 009/kitchen, 012/hob, 012/model, 012/fire, 012/plan · 58 l.
  + LE modèle à suivre pour un objet de cuisine : 57 lignes.
  − hérite des défauts du 012.
  ◎ VIEW : hook valve lidTop inside level foam lugs safety …(+14)
  `import { buildCuisine } from "../../018-cocotte-minute/src/cuisine.js";`
- **Le mur, le tableau électrique et la pièce** `016/wall.js` — Mur de verre avec montants et gaine, la phase et le neutre jusqu'à une prise ; multiprise, bouilloire, radiateur, toi ; tableau à gauche (différentiel, disjoncteurs des emplacements 3 à 8 — l'emplacement 2 est laissé au système).
  entrée buildWall() · lit ./plan · 1040 l. · **repris par 024**
  + le fil qui luit dans le mur et prend sa lueur sur le montant.
  − accroche « bonne, pas renversante » : le fil fait 16 px ; toi en mannequin articulé, jamais en gros plan.
  ◎ VIEW : hook room plugs fault board system whole exploded …(+5)
  `import { buildWall } from "../../016-disjoncteur/src/wall.js";`
- **La chambre de nuit** `022/chambre.js` — Chambre aux rayons X : lit sans dessus plein, couette en relief, table de nuit, prise ; toi couché ; plus les « rangs » de téléphones jumeaux sur l'établi.
  entrée buildChambre() · état `room fade shell you cloth pillow trapped plug charge place heat ranks recall` · lit ./plan, ./habillage · 1154 l. · **repris par 028**
  + la chambre type, avec son appartement autour chez 028 (028/foyer).
  − la couette ne se lit presque pas, l'oreiller replié fait feuille ; de face et de bas ton buste est une boîte.
  ◎ VIEW : hook bed pillow under cable table away whole …(+10)
  `import { buildChambre } from "../../022-batterie-telephone/src/chambre.js";`
- **Habillage de la chambre** `022/habillage.js` — Les bandes de lumière de la rue par le volet, un verre, ce qui dit « il fait nuit » ; à reprendre avec la chambre.
  entrée dressChambre() · lit ./plan · 33 l.
  `import { dressChambre } from "../../022-batterie-telephone/src/habillage.js";`
- **L'appartement autour de la chambre** `028/foyer.js` · *en chantier* — Couloir, chaudière et son conduit, fuite, porte et fenêtre, la chambre des enfants, la fumée ; dessiné du même trait que 022/chambre pour que les coupes ne se voient pas.
  entrée buildFoyer() · lit ./plan · 1225 l.
  − dossier pas encore rendu.
  ◎ VIEW : hook pillow house boiler door guard wall system …(+10)
  `import { buildFoyer } from "../../028-detecteur-co/src/foyer.js";`
- **La buanderie** `030/buanderie.js` · *en chantier* — Mur et sol mouillé (joints et flaque), lave-linge en essorage (carcasse qui passe sous tension), tableau et prise, toi pieds nus ; coupe sous le sol (dalle, terre, fondations).
  entrée buildBuanderie() · lit ./plan · 933 l.
  − dossier pas encore rendu ; refait le mur au lieu d'importer 016/wall (9 % de lignes communes).
  ◎ VIEW : hook machine fault tableau socket you feet reach …(+12)
  `import { buildBuanderie } from "../../030-prise-de-terre/src/buanderie.js";`
- **L'atelier et la scie sur table** `010/shop.js` — Scie de chantier aux rayons X (table fonte, guide, volant, moteur), la planche pleine (cernes au shader), tes deux mains pleines.
  entrée buildShop() · état `shell table you feed slip circuit harm flinch nick dust drop blur` · lit ./plan · 985 l.
  − les mains font mannequin en gros plan : jamais la main seule.
  ◎ VIEW : cartridge whole exploded blockPart springPart wirePart fire bite …(+7)
  `import { buildShop } from "../../010-scie/src/shop.js";`
- **Mur de salle de bain (004)** `004/room.js` — Mur de verre, les deux fils du tableau à une prise, un câble dénudé, toi la main refermée dessus ; tête, poing, cœur pleins.
  entrée buildRoom({ device }) · lit ./model · 443 l.
  + premier « toi lu comme un circuit ».
  − ancien moteur (main.js, pas de world.js) : préférer le mur du 016, plus complet.
  `import { buildRoom } from "../../004-differentiel/src/room.js";`

## Lieux publics, techniques et médicaux
Vignettes : `docs/catalogue/planche-lieux.jpg`

- **Le hall de gare** `006/hall.js` — Hall de gare aux rayons X (dallage, long mur), la boîte verte du défibrillateur à 30 m avec son halo, trois personnages de verre (la victime, le témoin qui masse, toi), le cœur.
  entrée buildHall() · état `chaos order flash dim halo` · lit ./model, ./heart · 566 l.
  + le lieu public type ; l'échelle par les personnages debout.
  − ancien moteur (main.js) ; à envelopper plutôt qu'à reprendre tel quel.
  `import { buildHall } from "../../006-defibrillateur/src/hall.js";`
- **La salle d'IRM** `017/suite.js` — Murs, plafond, porte de verre, sol en grille, la ligne au sol, toi et ta bouteille d'acier, le chariot et ses objets en fer, une personne retenue, le toit et le tube de quench.
  entrée buildSuite() · lit ./plan · 863 l.
  + une salle d'hôpital générique (sol grille, porte, chariot).
  − toi est petit dans la première image ; le personnage de dos à 7 px/cm est sa limite.
  ◎ VIEW : hook room door trolley loose mouth box boxNear …(+12)
  `import { buildSuite } from "../../017-irm/src/suite.js";`
- **Le bloc opératoire** `024/bloc.js` — Salle d'opération aux rayons X : table pleine, scialytique allumé, respirateur et soufflet, chariots, toi sous le drap, le chirurgien ; l'armoire technique derrière le mur (le système s'y pend : `mount`).
  entrée buildBloc() · état `shell dark` · lit ./plan, ./habillage · 885 l.
  − mains du chirurgien en griffes (jamais en gros plan) ; la poignée de la lampe flotte dans le noir ; la lueur de l'armoire concurrence la lampe en plan large.
  ◎ 024 (a) la table : { tx: 50, ty: 112, tz: -50, d: 540, az: -34, el: 18, fov: 38 }
  `import { buildBloc } from "../../024-bloc-operatoire/src/bloc.js";`
- **Habillage du bloc** `024/habillage.js` — Le coin de l'anesthésiste, perfusions, chariots (le décorateur n'a presque pas trouvé de place libre).
  entrée dressBloc() · lit ./plan · 39 l.
  `import { dressBloc } from "../../024-bloc-operatoire/src/habillage.js";`
- **La tour dans le typhon** `020/tour.js` — Gratte-ciel de verre en maquette (142 m pour 508), étages au shader, flexion `tip`, squelette qui prend la charge (`bones`), pluie à l'horizontale, Taipei en blocs bas.
  entrée buildTour() · état `shell city` · lit ./plan, ./habillage · 709 l.
  + une tour qui plie sans casser ses jointures ; réutilisable pour tout immeuble haut.
  − la pluie n'a pas été vue en mouvement (`storm` ≤ 0,6) ; la vitre ne dit pas « vitre » ; des arêtes passent devant la boule à az −38.
  ◎ VIEW : hook tower low top cage you pin dampers …(+8)
  `import { buildTour } from "../../020-taipei-101/src/tour.js";`
- **Habillage de la tour** `020/habillage.js` — La ville la nuit en contrebas, les spots de la salle de la boule (premier essai du décorateur, référence).
  entrée dressTour(mount) · lit ./plan · 46 l.
  `import { dressTour } from "../../020-taipei-101/src/habillage.js";`
- **La gaine d'ascenseur** `003/shaft.js` — Douze étages de vide aux rayons X, paliers, cabine ; pleins : les deux rails, le cadre et ses parachutes, les câbles, le limiteur en haut, toi.
  entrée buildShaft({ governor, gears }) · lit ./model · 489 l.
  − ancien moteur (main.js).
  `import { buildShaft } from "../../003-ascenseur/src/shaft.js";`
- **La cuve du réacteur** `005/reactor.js` — Cuve sous pression en verre (900 MWe à l'échelle), cœur de 157 assemblages qui luit, 57 grappes, la couronne de bobines.
  entrée buildReactor() · lit ./model, ./chain · 342 l.
  − ancien moteur ; 57 objets identiques de loin = dalle grise (réglé au shader).
  `import { buildReactor } from "../../005-arret-urgence/src/reactor.js";`
- **Chicago 1942** `005/pile.js` — La pile de graphite sous les gradins, la barre pendue à une corde, l'homme à la hache : une scène historique aux rayons X.
  entrée buildPile() · 202 l.
  `import { buildPile } from "../../005-arret-urgence/src/pile.js";`

## Route et véhicules terrestres
Vignettes : `docs/catalogue/planche-transports.jpg`

- **La voiture aux rayons X et le mur** `011/car.js` — Berline de verre (une peau lissée par sections, vitres, roues, sièges, volant), le mur et la route qui viennent à elle (`crush` replie l'avant), les airbags, celui qui ouvre ta portière.
  entrée buildCar() · état `shell wall you crush debris bags rescuer reach live` · lit ./plan · 1268 l. · **repris par 019, L01**
  + LE véhicule du compte : repère fixe de la voiture (les poses restent vraies pendant le choc) ; même `CAR` que 014 ; déjà importé par 019 et L01.
  − rien de plein dedans par défaut : ce qui compte s'ajoute à côté (011/pack, 019/cabine).
  ◎ VIEW : fuse whole exploded barPart pistonPart chargePart section macro …(+15)
  `import { buildCar } from "../../011-fusible-pyro/src/car.js";`
- **La rue sous la pluie** `014/street.js` — Route mouillée lue par ses reflets, marquage, pluie, camion plein arrêté, la voiture du 011 et toi ; la route défile (`gap`), tourne (`yaw`) et glisse (`lane`) autour de la voiture fixe.
  entrée buildStreet() · état `shell gap lane yaw steer dive rain truck skid you kmh rolled brake pulse` · lit ./plan · 1358 l. · **repris par L01**
  + importée par L01 ; recopiée à 76 % par 025/route (route de campagne).
  − le pied sur la pédale est un ellipsoïde ; « tu braques » se lit surtout par le camion.
  ◎ VIEW : hook wheel pedal hands chase top lockedFront sideWide …(+10)
  `import { buildStreet } from "../../014-abs/src/street.js";`
- **La route de campagne de nuit** `025/route.js` — Copie élargie de 014/street : deux voies, bas-côtés et fossés, lisière, sanglier et élan, la voiture à quatre roues de verre, moteur et transmissions, flèches cap / trajectoire, la fusée du 026 au loin.
  entrée buildRoute() · état `shell gap lane yaw aim steer kmh rolled rain boar moose mooseAt you slide …(+7)` · lit ./plan, ./habillage · 1844 l. · **repris par copie de 014/street**
  + la plus complète des routes ; habillage (balises, panneau, fermes).
  − les bêtes dans les phares tirent vers le gris plein ; de dessus le coin de roue n'est qu'une tache.
  ◎ VIEW : hook chase top wide front rear verge tip …(+13)
  `import { buildRoute } from "../../025-esp/src/route.js";`
- **Habillage de la route de nuit** `025/habillage.js` — Balises J6 tous les 50 m, panneau « passage d'animaux », borne, hameaux au loin ; s'efface au-dessus de 5 m de caméra.
  entrée dressRoute() · lit ./plan · 317 l.
  `import { dressRoute } from "../../025-esp/src/habillage.js";`
- **L'habitacle et la ceinture (modèle d'enveloppe)** `019/cabine.js` — La voiture du 011 importée telle quelle, plus toi en verre de la tête aux mains posé par `lunge`, `lean`, et la sangle pleine qui se tend.
  entrée buildCabine() · état `shell wall gap crush debris you coat lean lunge slack give load bags order …(+1)` · lit ./plan, ./model, 011/car · 677 l.
  + comment ajouter un passager et une ceinture sans toucher au 011.
  − la sangle chargée vire saumon ; le passager arrière seulement en plan moyen.
  ◎ VIEW : hook chest side ring pillar profile rear34 order …(+10)
  `import { buildCabine } from "../../019-pretensionneur/src/cabine.js";`
- **Batterie de voiture électrique** `011/pack.js` — Ce qui est plein sous la voiture du 011 : batterie-plancher (dix modules, cellules au shader), boîtier de jonction, contacteurs, câbles orange, calculateur.
  entrée buildPack() · lit ./plan · 1027 l.
  ◎ VIEW : fuse whole exploded barPart pistonPart chargePart section macro …(+15)
  `import { buildPack } from "../../011-fusible-pyro/src/pack.js";`
- **Voiture + route pour un long (modèle d'enveloppe)** `L01/car.js` — 011/car et 014/street importés sans copie, enveloppés : le pare-brise du long se re-parente dans la voiture (`screen`, `roadScreen`), toi dessiné à part.
  entrée buildCars({ surface = null } = {}) · état `which shell wall crash lunge you tool kmh drive sideOn plain` · lit ./plan, 011/car, 014/street · 380 l.
  + l'exemple d'import d'un décor de court dans un long 16:9.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 web lunge tool …(+63)
  `import { buildCars } from "../../L01-pare-brise/src/car.js";`
- **La Formule 1** `013/f1.js` — F1 2020 de verre autour de la cellule de survie (013/model) ; l'arrière s'arrache, l'avant se disloque au shader quand le rail arrive (`ahead`), roue rivale.
  entrée buildCar() · état `shell ahead split rival fire` · lit ./plan · 1321 l.
  ◎ VIEW : hook cockpit belts profile barrier coming carSide contact …(+18)
  `import { buildCar } from "../../013-halo/src/f1.js";`
- **La piste, le triple rail, le feu** `013/rail.js` — Piste en grille, triple glissière d'acier pleine dont la brèche est résolue à la construction, le feu en volume.
  entrée buildRail() · état `shell ahead fire` · lit ./plan · 1084 l.
  − la lumière du feu sur l'acier non vérifiée ; le rail est à contre-jour de la caméra habituelle.
  ◎ VIEW : hook cockpit belts profile barrier coming carSide contact …(+18)
  `import { buildRail } from "../../013-halo/src/rail.js";`
- **Le poids lourd** `027/camion.js` · *en chantier* — Semi-remorque de 40 t aux rayons X (tracteur 4×2, remorque 3 essieux articulée), toi au volant ; tambours qui chauffent (`heat`), roues qui s'enfoncent une à une (`sink`).
  entrée buildTruck() · état `s kmh pedal steer heat sink you shell` · lit ./plan · 1186 l.
  + le seul camion articulé ; servira à tout sujet poids lourd.
  − dossier pas encore rendu.
  ◎ VIEW : hook rear wheel under map drum pedal hands …(+18)
  `import { buildTruck } from "../../027-voie-de-detresse/src/camion.js";`
- **Le TGV Duplex et sa ligne** `021/train.js` — TGV Duplex de verre à l'échelle (2 motrices, 8 remorques), cabine vide éclairée, chaîne de traction, frein et bogies, voie et caténaire qui défilent (`run`).
  entrée buildTrain() · état `run kmh shell cab pax you phone traction brake radio display mood` · lit ./plan · 1275 l.
  + le seul train ; cabine de conduite réutilisable.
  − passagers en « sucettes » ; la rame de loin est un damier ; ATTENTION az 0 regarde le flanc +z, az −90 l'avant.
  ◎ VIEW : hook cab seatBack system pedal bellCab dialCab side …(+14)
  `import { buildTrain } from "../../021-veille-tgv/src/train.js";`
- **Route et mur (002)** `002/road.js` — Première voiture aux rayons X, la voie, le mur à 14 m.
  entrée buildRoad() · 382 l.
  − ancien moteur, remplacée par 011/car.
  `import { buildRoad } from "../../002-airbag/src/road.js";`

## Aviation et espace
Vignettes : `docs/catalogue/planche-transports.jpg`

- **L'avion de ligne (A330) en vol** `023/avion.js` — A330-200 de verre de nuit au-dessus de l'Atlantique : moteurs, carburant et fuite, trois circuits hydrauliques, gouvernes, passagers, toi ; la mer, l'île et sa piste ; plané, atterrissage.
  entrée buildAvion() · état `ground threshold ahead pitch bank dawn wind shell engines fuel leak lines press flow …(+11)` · lit ./plan, ./habillage · 1408 l.
  + le gros-porteur en vol ; `mount` pour pendre un système sous le ventre.
  − de trois quarts avant il redevient un tube si `el` monte ; caisson de soute qui dépasse en `VIEW.bay`.
  ◎ VIEW : hook plane wide engine you bay gear circuits …(+9)
  `import { buildAvion } from "../../023-eolienne-de-secours/src/avion.js";`
- **Habillage de l'avion** `023/habillage.js` — Couche de nuages, lumières de l'île, ce qui vit autour de l'avion.
  entrée dressAvion({ plane, island, group }) · lit ./plan · 309 l.
  `import { dressAvion } from "../../023-eolienne-de-secours/src/habillage.js";`
- **L'avion de ligne au sol (trois variantes)** `L03/avion.js` · *en chantier* — A350, A380, 737 de verre à l'échelle sur quatre sites (Haneda de nuit, hangar d'essai, Manchester, tarmac) ; portes, toboggans, évacuation, feu extérieur, pompiers.
  entrée buildAvion() · état `amount variant site run alt doorA doorB doorC shut evac bags spin thump dash …(+12)` · lit ./plan · 2371 l.
  + ancres de chaque porte (`A.door(variant, id)`) ; le meilleur avion au sol.
  − dossier pas encore rendu ; seulement 19 % commun avec 023/avion (refait).
  ◎ VIEW : hook hook1 hook2 hook3 hook4 hook5 hook6 aisle …(+61)
  `import { buildAvion } from "../../L03-evacuation-avion/src/avion.js";`
- **La cabine d'avion** `L03/cabine.js` · *en chantier* — Cabine de nuit aux rayons X, rangées et passagers de verre, éclairage de secours, balisage au sol, fumée, équipage, porte 1L et son levier.
  entrée buildCabine() · état `layout lights emerg smoke fire breach pax floor glow signs crowd you bag bins …(+12)` · lit ./plan · 1856 l.
  − dossier pas encore rendu ; ne pas longer l'allée à plus de 40 cm/s ; têtes des voisins = sphères de près.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 hook5 hook6 aisle …(+61)
  `import { buildCabine } from "../../L03-evacuation-avion/src/cabine.js";`
- **Habillage piste et cabine** `L03/habillage.js` · *en chantier* — La vie de la piste et de la cabine (L03).
  entrée dressPiste(), dressCabine() · lit ./plan · 737 l.
  `import { dressPiste, dressCabine } from "../../L03-evacuation-avion/src/habillage.js";`
- **Le Rafale biplace et son ciel** `007/jet.js` — Rafale B de verre, cockpit et rails, verrière en deux moitiés qui se découpe, piste, sol, nuages, traînées d'air ; l'avion reste à l'origine, le sol tombe (`alt`).
  entrée buildJet() · 945 l.
  + a fondé le dôme de ciel à l'infini (repris par 026/sky) et la méthode des avions (015, L04).
  − ancien moteur (main.js) ; biplace.
  `import { buildJet } from "../../007-siege-ejectable/src/jet.js";`
- **Le Rafale M monoplace** `015/rafale.js` — Rafale M de verre ; pleins : le train et ses roues, la crosse, les deux tuyères (la manette de gaz), ta main gauche dessus.
  entrée buildRafale() · état `jet pos alt nose squat hook gas puff scrape you held` · lit ./plan · 942 l. · **repris par L04 (copie dans bord.js)**
  + recopié à 71 % par L04/bord (le Rafale du porte-avions).
  ◎ VIEW : hook chase tail end ahead wire system whole …(+2)
  `import { buildRafale } from "../../015-brin-arret/src/rafale.js";`
- **La fusée Soyouz et son pas de tir** `026/launcher.js` — Soyouz-FG de verre à peu près à l'échelle, sous la tête de sauvetage ; tuyères, jets, traînée ; le pas de tir ; le booster D en signal.
  entrée buildLauncher() · lit ./plan, ./habillage · 1034 l.
  − de loin un dessin fin : jamais un plan large sans jet ; le pas de tir est un dessin de traits.
  ◎ VIEW : hook stack cross strike fault head towerUp inside …(+17)
  `import { buildLauncher } from "../../026-soyouz-ms10/src/launcher.js";`

## Marine

- **Le porte-avions (court)** `015/carrier.js` — Coque et îlot de verre, un pont qui n'est que sa peinture, les deux autres brins, quelques marins de verre ; la mer et le ciel à l'infini qui défilent.
  entrée buildCarrier() · lit ./plan · 710 l.
  + la recette du navire (pont-peinture, dôme) ; reprise en savoir-faire par L04/navire.
  − le V du brin fait deux traits de 5 px ; marins sombres.
  ◎ VIEW : hook chase tail end ahead wire system whole …(+2)
  `import { buildCarrier } from "../../015-brin-arret/src/carrier.js";`
- **Le Charles de Gaulle complet** `L04/navire.js` · *en chantier* — Le navire entier de 50 cm à 2,6 km, jour, crépuscule et nuit, dehors et dedans : hangar, ascenseurs, masses anti-gîte, chaufferie nucléaire, soutes, ailerons, coque en coupe ; mer et ciel.
  entrée buildNavire() · état `amount sea night lights taxi speed wind under angled cutaway heel masses massGlow fins …(+11)` · lit ./plan · 1457 l.
  − dossier pas encore rendu ; l'ordre de rendu des choses dans une coque est un piège (voir son journal).
  ◎ VIEW : hook hook1 hook2 hook3 hook4 hook5 hook6 catLong …(+43)
  `import { buildNavire } from "../../L04-porte-avions/src/navire.js";`
- **Le pont : avions et équipage** `L04/bord.js` · *en chantier* — Ton Rafale M, le suivant, les avions parqués, le ravitailleur, l'équipage de verre, l'officier d'appontage, l'hélicoptère, la table de pont, le Forrestal.
  entrée buildBord() · état `jet pitch bank gas tremble hook bar you hud night onDeck gear scrape` · lit ./plan · 2173 l. · **repris par copie de 015/rafale**
  − dossier pas encore rendu ; recopie 015/rafale.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 hook5 hook6 catLong …(+43)
  `import { buildBord } from "../../L04-porte-avions/src/bord.js";`
- **Habillage mer et pont** `L04/habillage.js` · *en chantier* — Le groupe aéronaval au loin (frégate, pétrolier), la vie du pont.
  entrée dressMer(), dressPont() · lit ./plan · 651 l.
  `import { dressMer, dressPont } from "../../L04-porte-avions/src/habillage.js";`

## Industrie, énergie, usine (kit des longs)
Vignettes : `docs/catalogue/planche-lieux.jpg (L01, L02)`

- **Le poste 400 kV de nuit** `L02/poste.js` — Portiques en treillis, chaînes d'isolateurs, appareils des autres travées en verre, barres, clôture ; conducteurs sous tension en tubes de lumière ; sol ouvrable (gravier, terre, maille de cuivre) ; arc ; toi en verre casqué qui marche, grimpe, s'agenouille.
  entrée buildPoste() · lit ./plan · 1638 l.
  − la caméra qui traverse un treillis fait une image parasite : couper.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 hook5 hook6 posteWide …(+36)
  `import { buildPoste } from "../../L02-poste-haute-tension/src/poste.js";`
- **Pylônes et lignes** `L02/ligne.js` — Pylône double circuit paramétré (`makePylon`), couloir de portées (`makeCorridor`), la ligne dans la campagne, la carte de France.
  entrée makePylon({ … }), makeCorridor({ … }), buildLigne(), buildMap() · lit ./plan · 1304 l.
  + exporte des briques réutilisables à part : un pylône ou une ligne en une ligne.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 hook5 hook6 posteWide …(+36)
  `import { makePylon, makeCorridor, buildLigne, buildMap } from "../../L02-poste-haute-tension/src/ligne.js";`
- **Habillage du poste et de la ligne** `L02/habillage.js` — Ce qui vit autour du poste et sous la ligne.
  entrée dressPoste(), dressLigne() · 264 l.
  `import { dressPoste, dressLigne } from "../../L02-poste-haute-tension/src/habillage.js";`
- **Le verre en fabrication** `L01/verre.js` — Tas de matières, verre en fusion, ruban sur l'étain et dans l'étenderie, pare-brise en file, moule de bombage ; le pare-brise héros, la vitre trempée, l'éprouvette.
  entrée buildGlass() · état `place hero cut print bend open film milk explode sensors glow queue pos litGlass …(+17)` · lit ./plan · 1592 l.
  − le verre chaud allumé longtemps fait des « murs » verts.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 web lunge tool …(+63)
  `import { buildGlass } from "../../L01-pare-brise/src/verre.js";`
- **Les fractures du verre** `L01/casse.js` — Toile d'araignée, anneaux, grains du trempé, éclat : drapés sur n'importe quel panneau (`mount(nom, root, onSurface)`).
  entrée buildCasse() · état `web rings stick webOn webAt grains grainsOn chip creep resin bubble nickel plain blades …(+1)` · lit ./plan · 1468 l.
  + réutilisable pour toute vitre qui casse.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 web lunge tool …(+63)
  `import { buildCasse } from "../../L01-pare-brise/src/casse.js";`
- **Pièces du dossier et labo 1903** `L01/dossier.js` — Brevet, page de règlement, tampon gravé posés à plat sur l'établi (reconstitutions) ; le labo de Bénédictus, l'homme et la fiole.
  entrée buildDossier() · état `place doc docIn mark flask star ben labelOn` · lit ./plan · 1004 l.
  + le modèle des « documents réels qu'on décrypte » d'un long.
  ◎ VIEW : hook hook1 hook2 hook3 hook4 web lunge tool …(+63)
  `import { buildDossier } from "../../L01-pare-brise/src/dossier.js";`
- **Kit d'usine 1 : ce qui porte** `kit/lib/usine.js` — `makeFurnace` (four, étenderie, fours de bombage et de trempe), `makeVat` (bain d'étain plat, autoclave cylindre), `makeConveyor` (tapis à rouleaux), `xray()` (une coque de verre à partir de n'importe quelle géométrie, chauffée de dedans).
  entrée makeFurnace({ … }), makeVat({ shape = "flat", ...o } = {}), makeConveyor({ … }) · lit ./brand, ./build3d, ./rng · 1273 l. · utilisé par 1 dossiers
  + paramétrés, ne lisent aucun épisode ; régler autrement, jamais un gabarit (catalogue des réglages : docs/journal/L01-usine.md).
  `import { xray, makeFurnace, makeVat, makeConveyor } from "@kit/usine.js";`
- **Kit d'usine 2 : ce qui agit et ce qui teste** `kit/lib/postes.js` — Portique (coupe, sérigraphie, ventouses), salle blanche, soufflerie de trempe, tour de chute et billes, tête factice, banc optique, percuteur ; lampe et traînées (`makeLamp`, `makeStreaks`).
  entrée makeLamp({ length = 200, r0 = 3, r1 = 36, k = 0.6 } = {}), makeStreaks({ … }), makeGantry({ … }), makeCleanRoom({ … }), makeBlower({ … }), makeDropTower({ … }), makeHeadRig({ … }), makeOpticBench({ … }), makeStriker({ y = 100, size = 50, squareAt = [12, 10], spring = true } = {}) · lit ./brand, ./build3d, ./usine, ./rng · 1354 l. · utilisé par 2 dossiers
  + déjà repris par L04 ; réglages dans docs/journal/L01-postes.md.
  `import { makeGantry, makeCleanRoom, makeBlower, makeDropTower, makeHeadRig, makeOpticBench, makeStriker, makeLamp, makeStreaks } from "@kit/postes.js";`

## Extérieurs, ciel, montagne, météo

- **Le ciel, la Terre, la descente** `026/sky.js` — Dôme à l'infini : noir en haut, limbe de la Terre selon l'altitude, Terre sombre et strates ; près du sol la steppe ; les traînées d'air.
  entrée buildSky() · lit ./plan, ./habillage · 857 l.
  + le dôme le plus complet (sol → 93 km).
  − la courbure ne se lit pas sous 50 km dans un cadre vertical.
  ◎ VIEW : hook stack cross strike fault head towerUp inside …(+17)
  `import { buildSky } from "../../026-soyouz-ms10/src/sky.js";`
- **Habillage du pas de tir et de la steppe** `026/habillage.js` — Tours de projecteurs, lumières au sol.
  entrée dressPad(), dressSteppe() · lit ./plan · 367 l.
  `import { dressPad, dressSteppe } from "../../026-soyouz-ms10/src/habillage.js";`
- **Le col de montagne la nuit** `027/col.js` · *en chantier* — Longue descente, marquage et balises tous les 25 m, montagne en courbes de niveau, virage et chevrons, falaises, la vallée 120 m plus bas et ses lumières.
  entrée buildCol() · état `shell danger home lamp beam` · lit ./plan, ./habillage · 1064 l.
  − dossier pas encore rendu.
  ◎ VIEW : hook rear wheel under map drum pedal hands …(+18)
  `import { buildCol } from "../../027-voie-de-detresse/src/col.js";`
- **Habillage du col** `027/habillage.js` · *en chantier* — La forêt de sapins sur le flanc, le panneau du col.
  entrée dressCol({ yRoad, mountainAt }) · lit ./plan · 164 l.
  `import { dressCol } from "../../027-voie-de-detresse/src/habillage.js";`
- **La pente et l'avalanche** `029/pente.js` · *en chantier* — Ciel en dôme, crêtes lointaines, pente inclinée, plaque qui se fracture et glisse, écoulement, tri des blocs ; toi qui tombes, roules, es enseveli, tires la poignée.
  entrée buildSlope() · état `shell` · lit ./plan, ./habillage · 1508 l.
  − dossier pas encore rendu.
  ◎ VIEW : hook back crackSide under side ride section buried …(+11)
  `import { buildSlope } from "../../029-airbag-avalanche/src/pente.js";`
- **Habillage de la pente** `029/habillage.js` · *en chantier* — Sapins épars hors du couloir, soleil d'hiver bas, chalet dans la vallée.
  entrée dressSlope({ heightAt = () · lit ./plan · 118 l.
  `import { dressSlope } from "../../029-airbag-avalanche/src/habillage.js";`

## Personnages

- **« Toi » : le personnage de verre** `kit/lib/figure.js` — Un corps de verre d'1,76 m posé comme une marionnette (`reach`, `leg`, `lean`, `hold`) ; mains `ball`, `flat` (moufle) ou `real` (phalanges).
  entrée makeFigure({ … }) · lit ./brand, ./build3d, ./atmo · 353 l. · utilisé par 29 dossiers
  + utilisé dans presque tous les dossiers ; on le couche, l'agenouille, le fait courir en bougeant son groupe (006/hall).
  − mannequin articulé de près : jamais en gros plan, les mains jamais seules ; de près il passe en verre de la tête aux mains.
  `import { makeFigure } from "@kit/figure.js";`

## Effets et phénomènes (exportés)

- **L'orage et la foudre** `008/bolt.js` — Dôme (sol en grille, ventre du nuage éclairé), pluie suspendue, traceur par bonds et ses branches, réponses du sol, arc en retour blanc ; chaque tronçon est une capsule cœur-gaine-halo.
  entrée buildStorm() · état `sky cloud rain fall drop leader up ups upTree upChimney upAntenna hair strike hot …(+1)` · lit ./plan · 845 l.
  + le seul éclair du compte : toute décharge, tout arc long.
  − les réponses faibles sont petites en plan large.
  ◎ VIEW : tip exploded rodPart wirePart stakePart whole run earth …(+12)
  `import { buildStorm } from "../../008-paratonnerre/src/bolt.js";`
- **Flammes et gaz** `012/fire.js` — Couronne de flammes (cœur blanc, corps signal, pointe qui se dissout) qui meurt port après port ; gaz non brûlé en brume qui monte ; couche sous le plafond ; étincelle.
  entrée buildFire() · lit ./plan · 751 l. · **repris par 018**
  + repris par 018 ; toute flamme de brûleur.
  − sur l'établi les flammes côté caméra sont plus faibles.
  ◎ VIEW : hook burner tip under heart system whole exploded …(+15)
  `import { buildFire } from "../../012-gaziniere/src/fire.js";`
- **Ondes stationnaires** `009/waves.js` — Ventres d'une onde stationnaire en lobes de lumière, fronts renvoyés, fuite, une onde couchée contre les trous, la lumière visible qui passe.
  entrée buildWaves() · état `power door open leak ruler light near` · lit ./plan · 767 l.
  + « montrer un phénomène invisible » : modèle pour radio, son, champ.
  ◎ VIEW : door whole exploded glassPart meshPart hooksPart close gap …(+15)
  `import { buildWaves } from "../../009-micro-ondes/src/waves.js";`
- **Réaction en chaîne** `005/chain.js` — Quelques noyaux encre ; un neutron en brise un, deux repartent : 1, 2, 4, 8, 16 ; tout en fonction du temps.
  entrée buildChain({ seed = 23 } = {}) · 191 l.
  `import { buildChain } from "../../005-arret-urgence/src/chain.js";`
- **Le cœur électrique** `006/heart.js` — Un cœur et ses ondes : fibrillation (vaguelettes signal), choc (tout s'éteint), reprise depuis son nœud (front veille) ; se pose dans un torse.
  entrée buildHeart() · 238 l.
  `import { buildHeart } from "../../006-defibrillateur/src/heart.js";`
- **Maquette microscopique (pores)** `022/pores.js` — Un film entre deux électrodes vu de très près, à son échelle de maquette : ions, pores qui fondent, le cheveu d'échelle.
  entrée buildPores() · état `micro bench temp spot ions pores melt liquid touch chain hair litCopper litAlu litFilm` · lit ./plan · 646 l.
  ◎ VIEW : hook bed pillow under cable table away whole …(+10)
  `import { buildPores } from "../../022-batterie-telephone/src/pores.js";`

## Systèmes déjà modélisés (établi, gros plans, raccords)

- **Détecteur de fumée** `001/model.js` — DAAF photoélectrique, monté au plafond (y 0). (341 l.)
  `import { buildDetector } from "../../001-detecteur-fumee/src/model.js";`
- **Airbag conducteur** `002/model.js` — Volant, module et sac qui se gonfle vers +y. (313 l.)
  `import { buildAirbag } from "../../002-airbag/src/model.js";`
- **Parachute et limiteur d'ascenseur** `003/model.js` — Le rail, le coin denté, le bloc ; le limiteur de vitesse et sa poulie. (412 l.)
  `import { buildParachute, buildGovernor } from "../../003-ascenseur/src/model.js";`
- **Différentiel 30 mA** `004/model.js` — Tore, bobine, relais à palette, ressort, contacts ; les deux flux (`flows`). (321 l. ; à reprendre pour tout tableau (030 en refait un).)
  `import { buildDifferential } from "../../004-differentiel/src/model.js";`
- **Mécanisme de grappe (réacteur)** `005/model.js` — Tige crantée, trois cliquets, bague, électroaimant ; `coilGlow` pour le raccord lumineux. (255 l.)
  `import { buildGripper } from "../../005-arret-urgence/src/model.js";`
- **Défibrillateur (DAE)** `006/model.js` — Coque, batterie, condensateur, carte et puce, couvercle, deux électrodes ; exporte aussi `roundedBox`, `heartSign`, `boltSign`. (291 l.)
  `import { buildAED } from "../../006-defibrillateur/src/model.js";`
- **Siège éjectable et occupant** `007/model.js` — Siège Martin-Baker sur ses rails, canon télescopique, fusée, poignée ; `seatOccupant` : un pilote de verre casqué assis. (958 l.)
  `import { buildSeat, seatOccupant } from "../../007-siege-ejectable/src/model.js";`
- **Paratonnerre (sur la maison et en kit)** `008/model.js` — Pointe, descente de 8 mm, joint de contrôle, piquet ; `buildRod` en place, `buildKit` en rangée sur l'établi ; tête de lumière qui grimpe (`climb`, `flow`). (999 l.)
  `import { buildRod, buildKit } from "../../008-paratonnerre/src/model.js";`
- **Four à micro-ondes et sa porte** `009/model.js` — La porte pleine (plaque à trous de 1,5 mm au shader) et le corps en verre, cavité, magnétron, interrupteurs, fusible ; `bench` la pose sur l'établi. (942 l.)
  `import { buildOven } from "../../009-micro-ondes/src/model.js";`
- **Lame de scie et cartouche de frein** `010/model.js` — Lame qui tourne (`blur`), bloc d'arbre, cartouche, ressort, fil. (877 l.)
  `import { buildSaw } from "../../010-scie/src/model.js";`
- **Fusible pyrotechnique** `011/model.js` — Boîtier, barre de cuivre, piston, charge ; coupe en quatre temps. (682 l.)
  `import { buildFuse } from "../../011-fusible-pyro/src/model.js";`
- **Brûleur, robinet et thermocouple** `012/model.js` — Brûleur complet, manette, robinet, groupe magnétique, thermocouple : repris tel quel par 018. (812 l. ; **repris par 018**)
  `import { buildSystem } from "../../012-gaziniere/src/model.js";`
- **Cellule de F1 et Halo** `013/model.js` — Cellule de survie lissée, Halo de titane et ses fixations, pilote de verre allongé, vérin d'essai. (1170 l.)
  `import { buildSystem } from "../../013-halo/src/model.js";`
- **Coin de roue, frein et bloc ABS** `014/model.js` — Pneu, jante, disque ventilé, étrier, couronne dentée et capteur ; bloc ABS (calculateur, vannes, pompe) ; pédale ; à sa place dans `CAR`. (1041 l. ; le frein de voiture du compte : recopié ×4 dans 025/model.)
  `import { buildSystem } from "../../014-abs/src/model.js";`
- **Brin d'arrêt et frein hydraulique** `015/model.js` — Le câble, les poulies de pont, le frein sous le pont (vérin, cylindre, vanne, réservoir). (1059 l.)
  `import { buildSystem } from "../../015-brin-arret/src/model.js";`
- **Disjoncteur modulaire** `016/model.js` — Taille vraie (1,8 × 8,5 × 7 cm) : manette, bilame, bobine, contacts, chambre de coupure de onze plaques, arc ; se range dans le tableau de 016/wall (emplacement 2). (1189 l. ; **repris par 024** ; repris par 024 ; pour tout sujet de tableau électrique.)
  `import { buildSystem } from "../../016-disjoncteur/src/model.js";`
- **Scanner IRM** `017/model.js` — Capots, tunnel, gradients, anneaux supraconducteurs dans la cuve d'hélium, tube de quench, la boîte à deux boutons. (991 l.)
  `import { buildSystem } from "../../017-irm/src/model.js";`
- **Cocotte-minute** `018/model.js` — Corps, couvercle, joint, soupape, sécurité, eau, mousse, vapeur. (869 l.)
  `import { buildSystem } from "../../018-cocotte-minute/src/model.js";`
- **Enrouleur et prétensionneur** `019/model.js` — Bâti, bobine et sangle, barre de torsion, verrou, turbine et charge. (682 l.)
  `import { buildSystem } from "../../019-pretensionneur/src/model.js";`
- **Amortisseur de Taipei 101** `020/model.js` — La boule de 41 plaques, son berceau, ses câbles, l'anneau de butée, les vérins ; à l'échelle. (741 l.)
  `import { buildSystem } from "../../020-taipei-101/src/model.js";`
- **VACMA (veille du TGV)** `021/model.js` — Pédale, touches, cadran à angle mort, sonnerie, relais, valve, chaussure de verre. (694 l.)
  `import { buildSystem } from "../../021-veille-tgv/src/model.js";`
- **Téléphone et sa batterie** `022/model.js` — Téléphone sans marque, batterie en sachet, carte de protection, rouleau d'électrodes qui se déroule (`unroll`). (689 l.)
  `import { buildSystem } from "../../022-batterie-telephone/src/model.js";`
- **Éolienne de secours (RAT)** `023/model.js` — Trappe, bras, ressort, hélice, pompe ; se pend sous l'avion de 023. (662 l.)
  `import { buildSystem } from "../../023-eolienne-de-secours/src/model.js";`
- **Schéma IT médical** `024/model.js` — Transformateur d'isolement, CPI, disjoncteurs, barre de terre, sur sa platine. (943 l.)
  `import { buildSystem } from "../../024-bloc-operatoire/src/model.js";`
- **ESP : quatre roues et le bloc** `025/model.js` — Le frein du 014 quatre fois, le bloc ESP, calculateur, capteurs de lacet et de volant. (839 l. ; **repris par copie partielle de 014/model**)
  `import { buildSystem } from "../../025-esp/src/model.js";`
- **Coiffe et moteurs de sauvetage** `026/model.js` — Coiffe en deux demi-coques, les quatre moteurs à poudre, le module de descente, l'équipage. (1065 l.)
  `import { buildSystem } from "../../026-soyouz-ms10/src/model.js";`
- **Voie de détresse** `027/model.js` · *en chantier* — Lit d'arrêt de gravier rond, ornières, bourrelets, glissière béton, butte, panneau. (1383 l.)
  `import { buildLane } from "../../027-voie-de-detresse/src/model.js";`
- **Sac airbag d'avalanche** `029/model.js` · *en chantier* — Sac, harnais, poignée, câble, cartouche, venturi, ballon. (814 l.)
  `import { buildModel } from "../../029-airbag-avalanche/src/model.js";`
- **Chaîne de terre (régime TT)** `030/model.js` · *en chantier* — Vis de masse, conducteur PE, fiche et prise 2P+T, différentiel, borne principale, barrette, boucle à fond de fouille. (1395 l.)
  `import { buildModel } from "../../030-prise-de-terre/src/model.js";`
- **Appareils haute tension** `L02/model.js` — Disjoncteur SF6 (trois pôles), sectionneurs, cadenas, perches, pinces de terre. (1367 l.)
  `import { buildModel } from "../../L02-poste-haute-tension/src/model.js";`
- **Toboggan, siège 16 g, documents** `L03/model.js` · *en chantier* — Pack du toboggan (bouteille, aspirateurs, barre), siège, coussin et brûleur, pages de la règle, figurines. (1475 l.)
  `import { buildModel } from "../../L03-evacuation-avion/src/model.js";`
- **Catapultes, brins, miroir** `L04/model.js` · *en chantier* — Deux catapultes à vapeur, barre de retenue, vanne, cabine, déflecteur, trois brins et leur frein, miroir d'appontage ; catapulte électromagnétique. (1518 l.)
  `import { buildModel } from "../../L04-porte-avions/src/model.js";`
- **Détecteur de CO et le sang** `028/model.js` · *en chantier* — Le détecteur électrochimique (grille, membrane, électrode, puce, buzzer, pile) ; `buildBlood` : la maquette du sang où le CO prend la place de l'oxygène. (691 l.)
  `import { buildModel, buildBlood } from "../../028-detecteur-co/src/model.js";`

## Le kit (`kit/lib/`) : briques communes

- **Atmosphère** `kit/lib/atmo.js` — Sol en grille qui s'efface (`makeSurface`, `lift` pour espacer), ombre de contact, flaque de lumière (`makePool`), poussières (`makeMotes`, en traînées quand elles filent).
  entrée makeSurface({ radius = 260, cell = 5, fade = 46, lift = 1 } = {}), makeContact({ amount = 0.5 } = {}), makePool({ radius = 17, color = BRAND.veille } = {}), makeMotes({ … }) · lit ./brand, ./rng · 217 l. · utilisé par 15 dossiers
  `import { makeSurface, makeContact, makePool, makeMotes } from "@kit/atmo.js";`
- **Blocs des films** `kit/lib/blocks.js` — L'établi (`makeBench`), l'ambiance (`setMood`), le raccord décor → établi (`benchCut`), le titre barré, les appels à l'action, le prochain dossier, le cartouche d'un long.
  entrée makeBench(size = 10) · lit ./brand, ./atmo, ./overlay, ./direct · 236 l. · utilisé par 31 dossiers
  `import { makeBench, setMood, benchCut } from "@kit/blocks.js";`
- **Modelage** `kit/lib/build3d.js` — Matières maison (`solid`, `glow`, `glass`, `asShell`, `lineMat`, `fatLine`), formes chanfreinées (`box`, `cyl`, `plate`, `lathe`), pièces qui s'éclatent (`makePart`, `addMesh`, `explode`, `setPartOpacity`).
  entrée makePart(name, { lift = 0, delay = 0, span = 0.6 } = {}) · lit ./brand · 417 l. · utilisé par 34 dossiers
- **Le réalisateur** `kit/lib/direct.js` — `createDirector` : état `S`, `st`, `shot`, `cut`, `chip`, `panel`, `ride`, `loop`, `commit`.
  lit ./timing, ./overlay, ./long · 339 l. · utilisé par 31 dossiers
  `import { createDirector } from "@kit/direct.js";`
- **Le plateau** `kit/lib/stage.js` — Studio : boîtes à lumière, ombres douces, obturateur, bloom, étalonnage ; options `dof`, `air`, `finish`.
  lit ./brand, ./build3d, ./finish · 546 l. · utilisé par 38 dossiers
  `import { createStage } from "@kit/stage.js";`
- **Matière des pièces** `kit/lib/finish.js` — Grain d'usinage et traces de main procéduraux (`finishScene`), via `createStage({ finish })`.
  80 l.
- **Calque 2D** `kit/lib/overlay.js` — Sous-titres mot à mot, cartes d'accroche, callouts, en-tête, chevrons.
  entrée buildCaptions({ … }), buildHook(container, EP, tl, { beats, maxChars = 19, loopAt } = {}) · lit ./brand · 481 l. · utilisé par 38 dossiers
- **Format long** `kit/lib/long.js` — Cartes de chapitre, mots-clés, en-tête étape / température.
  entrée buildChapters(container, EP, tl, { lead = 0.9, hold = 2.6, skip = [], kicker = (), buildKeywords(container, EP, tl, { hold = 2.6, skip = [], quiet = [] } = {}) · 171 l. · utilisé par 4 dossiers
- **Cadre 16:9** `kit/lib/landscape.js` — À importer en premier dans le main.js d'un long.
  lit ./brand · 10 l.
- **Le décorateur (`makeDresser`)** `kit/lib/details.js` — Petites choses d'un lieu habité, en verre et traits : rail et ustensiles, bocaux, bouteilles, planche, bouilloire, prise, torchon, horloge, fenêtre et ville, chariot, perfusion, bras, lueur, lavis, lamelles, poussières, lumières de la ville la nuit (`nightLights`).
  entrée makeDresser({ order = 26, tone = 1, seed = 11 } = {}) · lit ./brand, ./build3d, ./atmo, ./rng · 563 l. · utilisé par 7 dossiers
  + habille un décor réutilisé à moindre coût (docs/recette-decorateur.md).
  `import { makeDresser } from "@kit/details.js";`

## Effets et aides recopiés d'un épisode à l'autre (non exportés)

Ces fonctions ne s'importent pas (elles ne sont pas exportées) : on recopie **la version indiquée en premier** (la plus récente du plus gros groupe), ou mieux, on la fait monter dans le kit (voir « Recommandations »). Détecté automatiquement (trois épisodes ou plus) ; les crochets groupent les copies identiques à plus de 75 %.

- `makeEmbers` (9 ép.) — braises qui tombent de ce qui chauffe, périodiques : [004/room 003/shaft] [010/shop 008/house] [L03/avion 013/rail] [007/model] [027/camion] [L04/bord]
- `makeSparks` (7 ép.) — étincelles lentes de ce qui frotte : [015/rafale 013/f1] [003/model] [011/pack] [013/model] [013/rail] [016/wall] [026/launcher] [L02/ligne]
- `makeSprites` (7 ép.) — lumières ponctuelles à longue traîne (phares, feux) : [025/route 019/cabine 014/street 013/f1 011/car 008/house] [027/camion]
- `skin` (7 ép.) — peau lissée par sections (fuselages, coques) : [L04/bord L03/avion 026/launcher 023/avion 021/train 015/rafale 007/jet]
- `headGeometry` (6 ép.) — la tête de verre sculptée (front, nez, menton, oreilles) : [022/chambre 017/suite 016/wall 012/hob 009/kitchen] [028/foyer]
- `makeBall` (6 ép.) — une boule de lumière (cœur blanc + teinte), le point qui « a un endroit » : [L04/model 022/model 020/model 018/model 017/model 015/model]
- `makeRibbon` (6 ép.) — ruban posé sur des points (ceinture, sangle, câble plat) : [025/route 014/street 011/car] [019/cabine] [029/pente] [L04/bord]
- `makeSet` (6 ép.) — verre et traits d'une pièce (murs, plafond) : [017/suite 016/wall] [028/foyer 022/chambre] [012/hob] [020/tour]
- `makeStreaks` (5 ép.) — traînées d'air et de vitesse (ciel, chute) : [026/sky 023/avion 007/jet] [011/car] [020/tour]
- `gridMaterial` (4 ép.) — sol qui n'est que sa grille, qui s'efface en rasant : [028/foyer 022/chambre 020/tour 017/suite]
- `makeGlow` (4 ép.) — boule de lumière sans bord face à l'œil (dérivée de 008) : [026/sky] [028/foyer] [029/pente] [L02/ligne]
- `makeSpray` (4 ép.) — gerbe d'eau des pneus, embruns : [025/route 014/street] [010/model] [023/avion]
- `bodyLines` (3 ép.) — traits de carrosserie qui s'effacent avec la profondeur : [025/route 014/street 011/car]
- `glassFigure` (3 ép.) — un personnage de verre de la tête aux mains, tête sculptée : [028/foyer 022/chambre 017/suite]
- `makeRain` (3 ép.) — pluie en traînées, suspendue ou qui tombe : [025/route 014/street] [008/bolt]

## Fichiers presque identiques d'un épisode à l'autre

- `episodes/025-esp/src/route.js` ≈ `episodes/014-abs/src/street.js` (76 % de lignes communes)
- `episodes/L04-porte-avions/src/bord.js` ≈ `episodes/015-brin-arret/src/rafale.js` (71 % de lignes communes)
- `episodes/014-abs/src/street.js` ≈ `episodes/011-fusible-pyro/src/car.js` (48 % de lignes communes)
- `episodes/025-esp/src/route.js` ≈ `episodes/011-fusible-pyro/src/car.js` (45 % de lignes communes)

## Recommandations

Le détail argumenté est dans `docs/catalogue-promotions.md` (écrit le 2026-10-27, à relire avant de décider). En bref :

**À faire monter dans `kit/lib/` (ils servent déjà deux fois ou plus)** — en copiant le fichier dans le kit et en ne changeant AUCUN import des dossiers publiés (ils gardent leur copie ; seuls les nouveaux dossiers importent depuis le kit) :
1. **La voiture aux rayons X** (`011/car.js`, importée par 019 et L01 ; sa carrosserie vit aussi dans 014 et 025) → `kit/lib/voiture.js`, avec son `CAR`.
2. **La route** (`014/street.js` et sa copie `025/route.js`, 76 %) → une seule `kit/lib/route.js` paramétrée (ville / campagne, pluie, camion, bêtes).
3. **La cuisine** (`009/kitchen.js` + `012/hob.js`, `fire.js`, `model.js`, assemblés par 018) → `kit/lib/cuisine.js` qui fait l'assemblage de 018 d'office.
4. **Le mur et le tableau électrique** (`016/wall.js` + `016/model.js`, repris par 024 ; 004 et 030 en refont un) → `kit/lib/tableau.js`.
5. **La chambre et l'appartement** (`022/chambre.js` repris par 028, avec `028/foyer.js` une fois 028 rendu) → `kit/lib/logement.js`.
6. **Le Rafale** (`015/rafale.js`, recopié à 71 % dans `L04/bord.js`) et **le dôme de ciel** (007 → 026, 029) → `kit/lib/rafale.js`, `kit/lib/ciel.js`.
7. **Les effets recopiés** (tableau « Effets et aides recopiés » : braises, étincelles, traînées, pluie, gerbes, lumières ponctuelles, boules de lumière — `makeBall` existe en 19 versions —, tête et personnage de verre sculptés, sol en grille) → `kit/lib/effets.js` : une version de chaque, la plus récente.

**Sujets de la réserve qui se font avec ce qui existe** (un décor neuf au plus) : le chauffe-eau et son groupe de sécurité (maison 008 / buanderie 030 + tableau 016) ; la porte d'avion et son toboggan (L03, une fois rendu) ; l'anti-collision des avions TCAS (deux 023/avion en vol + ciel 026) ; la boîte noire (avion 023, mer 015/L04) ; le masque à oxygène et la dépressurisation (cabine L03 — écarté par Merwan comme « vu et revu », à ne reproposer que sous un autre angle) ; le frein de camion et le ralentisseur (camion 027) ; l'ascenseur moderne (gaine 003) ; le fusible domestique et la multiprise (016) ; l'extincteur ou la couverture anti-feu (cuisine 018 + feu 012) ; le détecteur de fumée refait (chambre 022 + appartement 028).

# L07 — Contre-vérification 2 (beats `cable` à `chute`)

Verdict : 9 phrases à corriger, 9 à nuancer, le reste tient. Requêtes web : 3 sur 20 (architecture FTTH France ; soufflage ; 99 % et forage dirigé). Les recherches sur le soufflage n'ont rien donné de net : la correction de `souffle` vient du dossier de faits (« poussé et entraîné par l'air ») et du principe d'un souffleur.

## À corriger

- **ancres** : « par des milliers de mètres de fond » laisse entendre que les ancres et chaluts frappent là. Faux : ils n'atteignent que le peu profond (limite des chaluts ≈ 1 000 à 2 000 m, mais l'essentiel bien moins) ; « ces câbles » compte des câbles alors que l'ICPC compte des pannes (150-200 par an). Remplacement : « Sa menace ? Les ancres et les chaluts. Chaque année, plus d'une centaine de pannes. Et dès que c'est profond, personne ne plonge les réparer. »
- **charrue** : « sous le sable » : le fond est souvent de la vase ou de l'argile. Remplacement : « Au large, il est simplement posé. Mais près des côtes, là où passent les bateaux, le navire tire une charrue. Elle ouvre un sillon dans le fond… et *enterre* le câble. Environ un mètre de profondeur, parfois plus. »
- **plage** : le forage dirigé est fréquent, pas systématique (tranchée ou ensouillage jusqu'au rivage aussi). Remplacement : « Le câble sort de l'eau sans que personne le voie : il passe sous la plage, souvent dans un conduit foré exprès. Plus de [99|quatre-vingt-dix-neuf] pour cent des données échangées entre continents arrivent comme ça. »
- **fourreaux** : « les tuyaux existent déjà » est trop général (génie civil d'Orange « principalement », mais aussi poteaux et tranchées neuves). Remplacement : « Ensuite, sous tes pieds. Et là, bonne surprise : souvent, les tuyaux existent déjà. Ce sont ceux du vieux téléphone en *cuivre*. Il suffit d'y faire entrer la fibre. »
- **souffle** : « On ne la pousse pas non plus : elle plierait » est faux : un souffleur pousse le microcâble ET l'air l'entraîne ; et le tirage à l'aiguille reste courant dans l'accès. Le soufflage vaut pour les microcâbles en microgaine (500-600 m typiques, jusqu'à 3 000 m en record). Remplacement : « Mais on la tire rarement : on la *souffle*. De l'air comprimé file dans le tuyau, entraîne le câble, et l'emmène sur des centaines de mètres. »
- **bouche** : rouvrir le sol est le dernier recours (on tente d'abord de déboucher, ou de passer en aérien). Remplacement : « Un tuyau écrasé, ou bouché… et le câble s'*arrête*. Parfois, il faut rouvrir le sol. »
- **soudeuse** : « Cœur contre cœur » ne vaut que pour les machines à alignement sur le cœur ; beaucoup de machines de terrain FTTH alignent sur la gaine (d'où la tolérance de ±1 µm de l'usine). Remplacement : « La machine, c'est la soudeuse. Deux caméras regardent les fibres, sous deux angles. Des moteurs les alignent, au micron près. »
- **chez** : « boîtier » désigne ici le PBO, puis l'ONT dans `boitier` (et `budget`, `tous`) : l'oreille confond. Remplacement : « Sur ton palier, ou sur le poteau d'en face, un petit coffret dessert une poignée de logements. De là, un dernier câble, très fin, court jusqu'à ta prise. »
- **boitier** : « courant électrique » se lit comme du courant d'alimentation ; et l'ONT est intégré à la box chez plusieurs opérateurs. Remplacement : « Puis l'ONT, parfois caché dans ta box. C'est lui qui lit les éclairs, et les change en signal électrique. La lumière s'arrête +là+. »

Si `boitier` change en « l'ONT », mettre `budget` : « Ton récepteur la lit quand même. » et `tous` : « Chaque récepteur ne garde que ce qui lui est adressé. » ; `role` : « les récepteurs du quartier émettent à tour de rôle » reste à décider (ou « les boîtiers » si l'ONT est nommé avant).

## Vraies mais à nuancer (pas de changement obligatoire)

- **mer** : « tube d'acier, fils d'acier, cuivre, gaine » : bon ordre, mais le dossier ne liste pas le tube d'acier (Wikipédia EN : polyéthylène, fils d'acier, barrière aluminium, tube cuivre, gel, fibres). Le dossier interdit de chiffrer le diamètre : « tuyau d'arrosage » tient comme image au large seulement (près des côtes le câble est blindé, bien plus gros).
- **repeteur** : « cent kilomètres, un pour cent » vaut à 0,2 dB/km ; une fibre sous-marine à ≈ 0,16 dB/km laisse plutôt 2 à 3 %. Ordre de grandeur correct.
- **repeteur2** : « cinquante à cent kilomètres » correct ; le dossier dit « > 100 km » (Wikipédia). Alimentation par le conducteur de cuivre : vrai (courant continu).
- **grappin / grappin2** : « on remonte un bout, puis l'autre » vaut pour le grand fond (au peu profond, un bout suffit parfois) ; raccord à bord et surplus en boucle (U) : conformes au dossier.
- **plage (99 %)** : chiffre répété partout (ICPC, TeleGeography le juge plausible, sans mesure exacte). Acceptable.
- **clivage** : sur les cliveuses de précision on tend d'abord, puis la lame raye ; l'ordre « raye puis tend » est celui d'un clivage manuel. Un technicien sourira. Option : « On tend la fibre, on la raye d'un trait minuscule. Elle casse *net*. Une face lisse, bien droite. »
- **manchon** : le manchon est enfilé sur une fibre AVANT la soudure, puis ramené. Option : « On ramène enfin un petit manchon sur la soudure, on le chauffe, il se resserre. »
- **pastien / partage** : en France, la fibre PM → logement est dédiée à chaque logement ; ce qui est partagé est la fibre en amont du coupleur (au PM ou au NRO, selon l'opérateur ; Free est en point à point en zone très dense). « 32, parfois 64 » tient ; « ce fil… tu le partages » reste vrai si « fil » = la fibre du central au coupleur. À l'image : le coupleur ne doit pas être dessiné chez toi.
- **budget** : « plus de 99 % » est le maximum de la classe B+ (28 dB = 99,8 %) ; au minimum de la plage (13 dB), 95 %. « A le droit de perdre » reste juste.
- **regard / vert** : conseil juste. Le vert = angle de 8° (9° dans certains pays) ; l'image ne doit pas laisser croire que tous les connecteurs de la box sont verts.

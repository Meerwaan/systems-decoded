# Ce qui devrait monter dans le kit — recommandations du 2026-10-27

Écrit à partir de l'inventaire de `npm run catalogue` (111 fichiers de décor et de kit lus). **Rien n'a été déplacé** : une promotion changerait des imports de dossiers publiés, c'est une décision à prendre plus tard, à froid.

## La règle proposée pour promouvoir sans risque

1. On **copie** le fichier dans `kit/lib/` (avec les cotes de son `plan.js` dont il a besoin, en tête du fichier ou dans un `kit/lib/<nom>-plan.js`), on le rend paramétrable (options avec la valeur d'origine par défaut).
2. Les dossiers publiés **gardent leur copie** et leurs imports : aucun film en ligne ne bouge, aucun rendu n'est à refaire.
3. Seuls les nouveaux dossiers importent depuis `@kit/…`. `npm run catalogue` signale alors l'ancien fichier comme quasi-doublon : c'est voulu, et c'est ce qui dit d'où vient la version du kit.
4. Une promotion se vérifie sur un `look` du dossier d'origine reconstruit contre la version du kit (même image, à l'œil) avant d'annoncer « disponible ».

## Les promotions, par gain attendu

| # | Quoi | Sources | Déjà servi | Pourquoi maintenant |
| --- | --- | --- | --- | --- |
| 1 | `kit/lib/voiture.js` — la voiture aux rayons X, son `CAR`, ses airbags, son mur | `011/car.js` | 011, 014 (même carrosserie), 019, 025, L01 | Cinq dossiers ; aujourd'hui on l'importe depuis un dossier publié (019, L01) ou on la recopie (014, 025 : `bodyLines`, `bodyGlass`, `curve`, `half` en triple). |
| 2 | `kit/lib/route.js` — une route, options `kind: "ville" \| "campagne"`, `rain`, `truck`, `animals` | `014/street.js`, `025/route.js` (76 % commun) | 014, 025, L01 | La seule vraie copie de décor entier du projet, à fusionner avant qu'une troisième n'apparaisse. |
| 3 | `kit/lib/cuisine.js` — l'assemblage de `018/cuisine.js` d'office (cuisine 009, plaque, brûleur et feu du 012) | `009/kitchen.js`, `012/hob.js`, `012/model.js`, `012/fire.js` | 009, 012, 018 | Trois dossiers ; tout sujet de cuisine (extincteur, couverture anti-feu, friteuse, bouilloire) y entre. |
| 4 | `kit/lib/tableau.js` — le mur, la gaine, la prise, le tableau et un disjoncteur modulaire | `016/wall.js`, `016/model.js` | 016, 024 ; refait par 004 et 030 | Le public électricien réclame des sujets d'électricité : 030 a refait un mur et un différentiel (9 % commun) faute de les trouver. |
| 5 | `kit/lib/logement.js` — chambre de nuit et appartement | `022/chambre.js`, `028/foyer.js` | 022, 028 | Attendre le rendu du 028 ; détecteur de fumée, chauffage, fuite d'eau y entrent. |
| 6 | `kit/lib/rafale.js` et `kit/lib/ciel.js` | `015/rafale.js` (recopié à 71 % dans `L04/bord.js`), le dôme de `007/jet.js` (repris par 026, 029) | 007, 015, 026, 029, L04 | Les avions (`skin`, `spline`, `aerofoil`, `section`) sont recopiés dans sept fichiers. |
| 7 | `kit/lib/effets.js` — une version de chaque effet recopié | voir « Effets et aides recopiés » dans `docs/catalogue.md` | 3 à 19 dossiers chacun | `makeBall` existe en 19 versions, `makeEmbers` en 9, `makeSparks` en 7 ; chaque décor neuf en réécrit une (≈ 50 à 120 lignes, et un risque d'image parasite déjà corrigé ailleurs). Le gain en jetons est petit par décor, mais le gain en qualité est sûr : la version qui a passé `qa`. |

À ne pas promouvoir : les systèmes (`model.js`), propres à leur sujet ; les décors des anciens dossiers 001–007 (main.js d'origine, pas de `world.js`), sauf l'idée du dôme ; l'usine et les postes (déjà dans le kit).

## Doublons à fusionner (quand on promeut)

- `025/route.js` ≈ `014/street.js` (76 %) → promotion 2.
- `L04/bord.js` ≈ `015/rafale.js` (71 %) → promotion 6.
- `014/street.js`, `025/route.js` ≈ `011/car.js` (45–48 % : la carrosserie) → promotion 1.
- `025/model.js` reprend le coin de roue du `014/model.js` quatre fois (34 %) : un `makeWheelCorner()` exporté du kit de la voiture.
- `headGeometry` (6 dossiers) et `glassFigure` (3) : la tête sculptée devrait être une option de `makeFigure` (`head: "sculpted"`).

## Sujets de la réserve qui se font avec l'existant

| Sujet | Décors existants | À modéliser |
| --- | --- | --- |
| Groupe de sécurité du chauffe-eau | maison `008/house.js` ou buanderie `030` (une fois rendu), tableau `016/wall.js` | le chauffe-eau et son groupe (le système) |
| Porte d'avion / toboggan | `L03/avion.js`, `L03/cabine.js`, `L03/model.js` (une fois L03 rendu) | presque rien : la porte et son armement |
| Anti-collision des avions (TCAS) | deux `023/avion.js` en vol, ciel `026/sky.js` | l'écran et l'antenne |
| Boîte noire | `023/avion.js`, la mer de `015/carrier.js` / `L04/navire.js` | la boîte et sa balise |
| Frein de camion, ralentisseur | `027/camion.js`, `027/col.js` (une fois 027 rendu) | le ralentisseur |
| Fusible domestique, multiprise surchargée | `016/wall.js` (multiprise, bouilloire, radiateur) | le fusible |
| Extincteur ou couverture anti-feu | cuisine `018/cuisine.js` + `012/fire.js` | l'extincteur |
| Ascenseur moderne (frein, porte palière) | `003/shaft.js` (ancien moteur : à envelopper) | la porte palière |
| Détecteur de fumée refait au moteur actuel | `022/chambre.js` + `028/foyer.js` | rien (`001/model.js` existe) |

Le masque à oxygène, le sprinkler, la ceinture et les freins du grand huit ont été écartés par Merwan (« vu et revu », « pas top ») : la cabine du L03 ne suffit pas à les rouvrir.

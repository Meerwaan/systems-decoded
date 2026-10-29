# L03 — l'habillage (le décorateur)

Agent décorateur, 22/10. Fichier : `episodes/L03-evacuation-avion/src/habillage.js` (interface inchangée : `dressPiste()`, `dressCabine()`, déjà montés par `world.js`). **Aucune ligne d'accroche** dans `avion.js`, `cabine.js` ni `world.js`. Planches et `essais.json` dans `scratchpad/L03/habillage` (jamais `renders/`).

## Ce qui est posé, et pourquoi

**PISTE**, tout en `ink`, rien de plein :

- **Haneda, ce qui l'entoure** (site 0). La piste 34R file au nord-nord-ouest (le nez, −x) : à sa droite (−z, là où regardent presque tous les plans par-delà la coque), la baie de Tokyo, noire, puis la rive de Chiba en guirlande basse sur l'horizon (13 à 21 km) ; devant à droite, les tours d'Odaiba et de Shinagawa, fenêtres allumées, une lumière d'obstacle qui respire lentement (0,4 Hz) sur les plus hautes ; à gauche (+z, vu depuis `engineR`) les aérogares et la tour de contrôle. Points ≥ 2,6 px, immobiles, épinglés au plan lointain (la caméra coupe à 4 km). Ils glissent avec `run`, comme la piste.
- **Le taxiway parallèle** (site 0) : ses deux rangées de feux de bord à 200 m, côté baie — la profondeur de l'aéroport derrière la coque. Rebouclés sur leur pas (6 000 cm) comme les lampes de la piste.
- **Les secours arrivent** (site 0) : deux camions de pompiers d'aéroport (contour aux rayons X, gyrophare qui respire, phares) partent quand l'A350 s'arrête (repère `stop`), descendent le taxiway et se garent à sa hauteur (≈ 34 s, eux aussi à l'arrêt avant la fin du chapitre) ; deux gyrophares plus loin. Dans le repère de l'avion, visibles de `stop` jusqu'à `toloop` seulement : l'accroche dehors (`hook2`, `hook3`) ne les voit pas, et la boucle reste exacte.
- **Manchester, le matin** (site 2) : quelques lumières restées allumées, loin et faibles ; deux camions de pompiers qui arrivent quand le 737 s'arrête (`thump` + 3,5 s) et se garent côté opposé au feu.
- **Le poste de stationnement** (site 3) : des cônes devant les moteurs, aux saumons et derrière la queue (un avion garé) ; deux têtes de mâts d'éclairage à 25 m, au-delà de la façade du terminal ; un tracteur et trois chariots à bagages à la porte de soute arrière droite (vus sous le ventre, à travers la coque).
- **Le hangar** (site 1) reste tel quel : noir, l'éclairage de secours seul — c'est l'essai, et la miniature 1 y est cadrée.

**CABINE** (A350 et 737) — ce qu'on laisse en partant :

- la carte de sécurité dans chaque poche de dossier (un magazine un siège sur quatre) ; la ceinture laissée ouverte sur chaque coussin — les deux fondent là où un rang tient en quelques pixels (`spanPx`, comme les rangs de la cabine), s'effacent à moins de 1,1–2,4 m de l'objectif et se noient dans la fumée ;
- quelques objets tombés (l'A350 arrivait de Sapporo, de nuit) : trois couvertures et deux oreillers sur des sièges, deux gobelets au sol, deux journaux, un téléphone posé face en l'air sous un siège, écran encore allumé (rang 10, bloc droit) ; dans le 737 (un matin d'été 1985) deux journaux sur des sièges ;
- **jamais** dans une allée (la ligne au sol y court), jamais près de ton siège ni de ton sac (rangs 3 à 7, blocs gauche et central : le plan du sac, la miniature 3), jamais dans le passage de la trappe du 737 (rangs 6 à 9 côté droit), et rien sur les deux premiers rangs du bloc central (là où, sur la première image, la ligne rejoint la porte).
- Dessin : plaques qui tracent leur propre contour (≈ 2 px quelle que soit la distance) et s'effacent avant de faire moins de 5 px ; verre à liseré pour ce qui est rond. Rien ne bouge.

## Ce que chaque touche suit

`amount` (= `plane`) pour tout le dehors ; `site` choisit le lieu ; `run` fait glisser le lointain et le taxiway ; le temps et les repères `stop`, `thump`, `toloop` (lus dans `window.__EPISODE.cues`) pour les camions ; `layout`, `lights` (un peu plus clair cabine allumée) et `smoke` (même hauteur et même densité que `cabine.js`) pour le dedans. `cut` n'a rien à faire : tout est en arrière du premier rang. `SD_KIT='{"nodress":1}' npm run look …` montre les décors nus (planche avant / après).

## Écarté

- La neige : le soir du 2 janvier 2024 à Tokyo était sec — rien d'inventé. Pas d'air froid dessiné non plus (des points en suspension sur un plan de 90 m ne se voient pas, et de près ils grouilleraient).
- Les rideaux de galley : en travers ou au bord de l'allée, devant la ligne, ou noyés dans la fumée.
- Le hangar : y poser des caméras d'essai les mettait entre l'objectif et les toboggans.
- Les hangars de Manchester : leur faîtage passait pile à la hauteur du fuselage dans `b737Wide` (une ligne franche à travers le sujet).

## Vérifié

`npm run build -- L03` passe. Planches `look` (avant / après) : `planeWide`, `gather`, `slideProfile`, `hook2`, `approach`, `b737Wide`, `apronDoor`, `engineR` ; puis `hook1`, `fireIn` (cabine vide), `thumbBag`, `narrowAisle`, `planeWide`, `apronDoor`, avec les zones. Mesuré par différence avec les décors nus (sans lire d'image de plus) : `thumbBag` +53 px à peine (rien devant le sac) ; `hook1` deux marques de quelques pixels, loin de la ligne ; `fireIn` vide : une présence diffuse (≈ 1 400 px, intensité moyenne 12/255) ; les gyrophares s'allument bien (cœur à ≈ 200/255).

## Un cran en dessous

- Sur une planche à 640 px, les camions se lisent comme de petites boîtes claires : leur gyrophare n'est un vrai point de lumière qu'à pleine résolution.
- La cabine habillée ne se voit presque pas dans les plans en enfilade (c'est voulu : les rangs fondent) ; elle se lit dans les plans de côté (porte, hôtesse, feu qui entre, coffres).
- `VIEW.approach` (`ty` 600 avec `alt` 6 000) cadre la piste sans l'avion sur ma planche : à vérifier par le chapitre qui la monte (ce n'est pas l'habillage).
- Les cônes ne se voient que dans `apronDoor` (devant le moteur gauche) ; aux saumons ils sont hors de tous les plans.

## À changer ailleurs

Rien.

## Images lues : 24 (planches de 8, 8, 2 et 6).

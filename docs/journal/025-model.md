# 025 · ESP — journal de `src/model.js` (le système)

2026-10-17. Agent du système. Point de départ : le coin de roue de `episodes/014-abs/src/model.js` (géométrie, matières, lumières), recopié et adapté ; le 014 n'a pas été touché. API rendue exactement : `buildSystem()` → `{ root, A, parts, update(P, time, px) }`. `npm run check -- 025` passe. **29 images lues sur 30.**

## Fait
- **Quatre coins** (le frein du 014 : disque ventilé, étrier sur le quart arrière haut, deux plaquettes, couronne dentée, capteur et son support, porte-moyeu). Le gauche est dessiné comme au 014, le droit en miroir (`scale.x = −1` dans un groupe intérieur ; le braquage reste en dehors du miroir, même signe des deux côtés). Les avant braquent de 30° à `steer` 1 ; disques et couronnes tournent avec `rolled` et se fondent en bande unie dans la voiture dès `kmh` > 3–14 (jamais sur l'établi). Chaque coin a SES matières (le FR peut luire seul) ; ce qui fond à vitesse est une sous-pièce à part.
- **Le frein qui serre** (`bFL…bRR`) : 0 → 0,5 une tête de pression veille court la conduite, du bloc à l'étrier, et l'électrovanne de cette roue s'allume sur le bloc ; 0,45 → 0,75 les plaquettes serrent ; 0,55 → 1 le disque passe veille, les garnitures aussi, et une boule de lumière veille se pose aux plaquettes (rayon 9 cm, jamais sous 48 px de loin). Le coin qui serre s'éclaire aussi en teinte veille : c'est le plus clair des quatre.
- **Le bloc** (aluminium clair) : quatre électrovannes en rang sur la face +z (vers l'arrière de la voiture, côté caméra), unions FL sur la face −x, FR sur la face +x, RL / RR sur la face arrière ; le moteur de pompe dessous. **Le calculateur** posé dessus (sombre, mat), son arête (−x, +z) coupée par un grand pan à 45° : **le comparateur** y est, face à az −45. Un seul shader pour le cadran (tout en distances, net à toute taille) : fond sombre, un repère « tout droit » en haut, l'aiguille encre (`aim`), l'aiguille de la voiture par-dessus (`yaw`, veille → signal avec `alarm`), et entre les deux le secteur couleur de la voiture. 2° d'aiguille par degré, butée à 140°. Lunette claire, moyeu sombre, connecteur des six fils sur la face +x.
- **Capteur d'angle** : anneau sombre sur un tronçon de colonne, disque codeur clair à six fenêtres qui tourne de 100° à `steer` 1 ; s'allume un peu avec |steer| et franchement avec `litSteer`. **Sur l'établi** : volant de verre (jante, moyeu, trois branches) et colonne de verre, qui tournent pareil.
- **Capteur de lacet** : un boîtier sombre sur sa semelle, une flèche de rotation en relief clair sur le couvercle (le geste « elle tourne » sans un mot), un connecteur.
- **Conduites** : quatre tubes acier, gaine de lumière (jamais sous 2,2 px, encre faible au repos : la ligne se lit de loin) ; les avant suivent le braquage sur leurs 38 derniers cm. **Fils** : six gaines encre (2 px mini) avec des impulsions veille lentes (période 14 cm, 19 cm/s : 1/22 de période par image, fondues en moyenne quand elles passent sous le pixel) — `sense`.
- **Établi** (`bench` 1) : pneus de verre (coquille + quatre cercles encre), volant et colonne de verre, deux pieds sombres sous le moteur de pompe et sous le capteur de lacet (ils s'effacent avec l'éclaté).
- **Éclaté** : conduites et fils s'effacent d'abord (0 → 0,18) ; volant +82, capteur d'angle +60, calculateur +50, bloc +24, capteur de lacet +36 ; chaque coin s'écarte de 38 cm vers l'extérieur (x) et de 10 cm vers l'avant / l'arrière.
- Mise à jour sans allocation ; shaders bornés avant `pow` / `sqrt` ; trois couleurs.

## Les nombres de l'état, chez moi
`bench` pneus, volant, pieds · `steer` coins avant 30°, volant et disque codeur 100°, lueur du capteur d'angle · `aim` / `yaw` les deux aiguilles · `alarm` veille → signal (aiguille de la voiture et secteur) · `rolled` / `kmh` rotation et fondu à vitesse · `b…` pression, plaquettes, disque, électrovanne · `sense` impulsions et petites lueurs aux pointes des capteurs de roue · `explode` · `litSteer` capteur d'angle, volant, son fil · `litYaw` capteur de lacet et son fil · `litWheels` les quatre capteurs de roue, couronnes et fils · `litEcu` calculateur (teinte retenue à 40 %) et lèvre veille du cadran · `litCorners` les quatre coins · `litFR` l'avant droit seul · `shell` non utilisé (c'est le décor qui s'efface).

## Poses vues et validées (prêtes à coller dans `VIEW`)
Les `VIEW` d'origine, réglées sur bouchons, débordent : la voiture entière vue de az −24 est trop large pour le cadre vertical (le coin avant droit tombe sous les boutons de TikTok).
- `whole` (établi) : `{ tx: 0, ty: 29, tz: 0, d: 1150, az: -12, el: 28, fov: 32, shift: 160, side: 90 }` — quatre pneus, le volant, le calculateur, le capteur au centre, tout à gauche des boutons, sous l'en-tête.
- `exploded` (établi) : `{ tx: 0, ty: 55, tz: 0, d: 1380, az: -12, el: 30, fov: 32, shift: 160, side: 70 }` — tout dans le cadre, sous l'en-tête, à gauche des boutons. Couverture : la même vue (el 30), `shift` à régler pour la mise en page de `cover` (−520 proposé par l'architecte).
- `ecuBench` / `unit` : `{ tx: -52.5, ty: 74.8, tz: -125, d: 110 (établi) | 140 (voiture), az: -45 (établi) | -50 (voiture), el: 14–16, shift: 120–140 }` — **le comparateur se lit très bien**, oui (une aiguille veille) comme non (deux aiguilles, secteur signal), y compris dans la voiture sous le verre. C'est le centre du cadran, pas `ECU.at`.
- `wheelBench` : `{ tx: -37, ty: 95, tz: -40, d: 270, az: -20, el: 34, shift: 120 }` (de az −50 le pneu avant gauche passe derrière le capteur). Le bloc entre au bord gauche : `az` −10 l'en sortirait (non vu).
- `yawBench` : la `VIEW` d'origine va (`d` 180, `az` −40, `el` 30).
- `cornerFR` (voiture) : de az −40 la caméra est derrière toi, tes mains et le volant cachent le coin. **De l'avant gauche** : `{ tx: 70, ty: 42, tz: -142, d: 340, az: -135, el: 30, shift: 140 }` — le disque veille, l'étrier, la conduite qui arrive. Clé de dos (la face intérieure du disque regarde −x : éclairée).
- `system` (voiture, `shell` 0,4, `litCorners` 1) : la `VIEW` d'origine va ; les quatre coins veille et le réseau des conduites se lisent sous le verre.

## Ce qui reste en dessous (franchement)
- **Vu de haut (`VIEW.top`, 19 m)**, le coin avant droit qui serre reste une petite tache veille : la boule a été portée à 48 px de rayon minimum après la dernière planche, non revue. La lueur de jante de `route.js` (`bFR`) doit porter ce plan ; sinon un plan plus serré sur l'avant.
- `whole` et `exploded` : le squelette entier tient, mais chaque pièce y est petite (le cadran ≈ 30 px). C'est le cadre qui dit « toute la voiture » ; les pièces se lisent dans leurs plans serrés.
- Les fils pulsés partout dans les plans serrés de l'établi (volant, calculateur) font un peu de fouillis vert ; `sense` 0 les rend à de simples traits encre.
- Non vus : `rolled` / fondu à vitesse dans la voiture, le braquage des coins avant (géométrie du 014 reprise, conduites et fils qui suivent par morph comme au 014), l'électrovanne qui s'allume (vue au calculateur, pas avec `b` > 0).

## À changer ailleurs
- `world.js` → `VIEW` : `whole`, `exploded`, `wheelBench`, `cornerFR`, `ecuBench`, `unit` par les poses ci-dessus.
- `episode.json` → `cover.cam` : partir de `exploded` ci-dessus (`az` −12, `el` 30, `d` 1380, `ty` 55, `tz` 0), `shift` à régler sur la couverture.
- Dans le plan `cornerFR` de l'acte 3, `route.js` dessine un anneau veille sur la jante avant droite (bouchon) et l'arbre de transmission lumineux juste devant : à vérifier avec le vrai décor, ils prennent la place du disque.

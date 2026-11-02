# 031 · `src/tcas.js` — journal de l'agent décor

## 2026-10-30 — lecture du contrat

- Bouchon lu, API gardée telle quelle (`buildTcas`, `buildScreens({ side })`, `buildAntenna`, mêmes P, mêmes A).
- **Problème trouvé** : le sol de l'établi (`makeBench`) est à y = 0, et `RIG.cpu` = origine, `RIG.bottom` y −40 :
  la moitié basse du calculateur et l'antenne du dessous sont **sous le sol** (un disque opaque). Les poses `VIEW.*Bench`
  visent l'origine : le plus simple est de **descendre le sol**, pas le système.
- **Implantation revue pour la caméra de l'établi (az −40)** : avec `RIG` tel quel, les écrans (z +34, devant) cachent
  la moitié basse du calculateur, le haut-parleur tombe devant sa façade, le `peer` (x −120) sort du cadre de
  `exploded` et se trouve *devant* (plus près de la caméra que le système). Nouvelle implantation (calculée en
  « x écran / profondeur » pour az −40) dans `LAY` en tête de `tcas.js` ; à recopier dans `plan.js` (voir plus bas).

## Implantation (repère de l'établi, cm)

| pièce | rassemblé | éclaté (déplacement) |
| --- | --- | --- |
| calculateur | 0, 0, 0 (tourné de 12° pour offrir sa façade) | ne bouge pas |
| antenne du dessus | 0, 28, 0 (tournée vers le peer) | +30 en y |
| antenne du dessous | 0, −30, 0 (à l'envers) | −16 en y |
| transpondeur | −18.6, −4, −33.9 (à gauche, derrière) | descend sous le calculateur, à gauche |
| écrans (ND + PFD, ×0,8) | 22.9, −12, 50.6 (à droite, devant, face à la caméra, penchés de 14°) | descendent |
| haut-parleur | 22, 14, 42 (au-dessus des écrans) | monte |
| peer (+ son antenne) | −49.8, 38, −49.6 (loin à gauche, hors du cadre `whole`) | ne bouge pas |
| sol de l'établi | y −66 | |

Retouches après planche (implantation finale dans `LAY`) : transpondeur à x écran −32, écrans à (40, −19, 24),
peer à (−84, 40, −10) — en « x écran, y, profondeur » pour az −40 (`toBench`).

## Ce qui est construit (2026-10-30)

- **Calculateur** (le cœur) : boîtier ARINC gris clair, façade sombre, deux poignées, crochets, connecteur arrière à cinq
  prises, fentes d'aération dessus, plaque de service sur le flanc vu, LED veille qui respire (et s'allume quand la
  réponse arrive). **Jauge du temps** sur la façade : arc de 240° qui se vide de 60 à 0 s, repères encre à 48 et 35,
  plein veille au-dessus de 35 s, **signal à 35 s et moins**.
- **Antennes** : galet peint sur son doubler, quatre secteurs (traits encre sur les diagonales), secteur −x en veille
  (`beam`), net sur le doubler. Sur l'établi, l'antenne du dessus est tournée vers le peer (son −x le vise).
- **Transpondeur** Mode S et **peer** (même boîtier, même gris, filet **signal** permanent qui s'avive à l'arrivée du ping).
- **Écrans** (`buildScreens`) : tout est dessiné dans le shader (net à toute distance). ND : arc de cap, anneau de
  douze points, ton avion (silhouette d'avion de ligne encre), l'intrus qui **descend vers toi quand `tau` baisse**
  (losange creux → plein → cercle signal → carré signal, éclat bref à la bascule, seulement en lecture continue), tiret
  d'étiquette illisible. PFD : horizon sombre (descend un peu quand `vs` monte), VSI non linéaire sur le bord extérieur,
  bande verte / bande rouge selon `ra`, aiguille depuis un pivot extérieur, **veille dans la bande verte**.
- **Haut-parleur** : coupelle ouverte, membrane sombre qui bat (`talk`), trois anneaux de son encre, lents.
- **Ping** (période 1 s, dosé par `ping`) : 0 → 0,35 s front veille de l'antenne vers le peer (calotte de 30°, cœur au
  milieu de l'arc, deux échos) ; 0,35 → 0,5 l'antenne du peer s'allume vers toi ; 0,5 → 0,8 la réponse (veille pâle) ;
  0,8 → 1 tête dans le coax jusqu'au calculateur (sa LED s'allume) ; 0 → 0,16 tête du calculateur aux écrans.
- **Câbles coaxiaux** : tubes sombres qui suivent l'éclaté (refaits seulement quand `explode` change).
- **Le sol** : `buildTcas` descend lui-même le sol de l'établi à y −66 (valeur absolue, une fois : tient même si
  `world.js` le fait aussi).

## Poses qui cadrent (vérifiées sur planche ; `P` = `{ fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 }` de world.js)

```js
whole:      { ...P, tx: 6.5, ty: -2, tz: 5.5, d: 450, az: -40, el: 16, fov: 30, shift: 160 },
exploded:   { ...P, tx: -16.1, ty: 4, tz: -13.5, d: 590, az: -40, el: 16, fov: 30, shift: 140 },
cpuBench:   { ...P, ...CLOSE, tx: -10, ty: 1, tz: 2, d: 150, az: -58, el: 12, shift: 100 },   // la jauge de face, la LED
antBench:   { ...P, ...CLOSE, tx: 0, ty: 30, tz: 0, d: 120, az: -40, el: 30, shift: 0 },     // le doubler vu de haut : les secteurs
ndBench:    { ...P, ...CLOSE, tx: 15.2, ty: -19, tz: 44.1, d: 72, az: -40, el: 16, shift: 80 },
vsiBench:   { ...P, ...CLOSE, tx: -4.1, ty: -19, tz: 27.9, d: 50, az: -40, el: 16, shift: 80 },  // nouvelle
peerBench:  { ...P, ...CLOSE, tx: -57.9, ty: 46, tz: -61.7, d: 140, az: -30, el: 12, shift: 100 },
speakerBench: { ...P, ...CLOSE, tx: 22, ty: 15, tz: 42, d: 80, az: -40, el: 14, shift: 60 },  // nouvelle
```
Dans le ciel, `VIEW.nd` et `VIEW.vsi` de l'architecte cadrent bien les écrans posés par `world.js` (planche : carré
signal, aiguille veille dans le vert).

## Ce qui n'est pas au niveau

- L'éclaté (`exploded`, d 590) est une vue d'ensemble : le calculateur y fait ≈ 25 % de la largeur. Le peer et les
  écrans tiennent dans le cadre, mais c'est plus un « plan des pièces » qu'une colonne serrée.
- Dans `whole`, le bord droit de l'ND frôle la zone des boutons TikTok (x ≈ 900 px).
- En gros plan du peer (`peerBench`), le front qui arrive fait une bande verte large et floue pendant ≈ 0,1 s.
- L'éclat de la bascule de symbole n'existe qu'en lecture continue (un saut dans le temps montre la forme sans éclat).
- Budget d'images dépassé : 44 vignettes lues pour 30.

## À changer ailleurs

1. `world.js`, `VIEW` : remplacer `whole`, `exploded`, `cpuBench`, `antBench`, `ndBench`, `peerBench` par les poses
   ci-dessus, et ajouter `vsiBench` et `speakerBench` (les anciennes visent les cotes de `RIG`, qui ne sont plus celles
   de l'établi).
2. `plan.js`, `RIG` — pour qu'il dise où sont vraiment les pièces (tcas.js lit `LAY`, recopié ici) :
   ```js
   export const RIG = {
     cpu: [0, 0, 0], top: [0, 28, 0], bottom: [0, -30, 0], xpdr: [-15.5, -4, -31.3],
     panel: [15.2, -19, 44.1], speaker: [22.1, 14, 42.1], peer: [-57.9, 40, -61.7],
   };
   ```
3. (facultatif) `world.js`, après `const bench = makeBench(SIZE);` :
   `bench.surface.group.position.y = -66; bench.pool.mesh.position.y = -65.98;` — tcas.js le fait déjà lui-même.

# 014 — model.js (le système) — journal

Fichier : `episodes/014-abs/src/model.js` — `buildSystem()` → `{ root, A, parts, update(p, time) }`. `npm run check -- 014` passe (0 erreur, 57 contrôles de contraste sur 57).
Planches et essais : dossier temporaire `…/scratchpad/014/model-{a,b,c,d,e}.{json,jpg}` (le générateur : `model-make.mjs`). **30 images lues** (8 + 8 + 8 + 5 + 1) : le budget, à l'image près. Toutes tirées avec `--bare` (les zones de TikTok sont dessinées sur chaque planche ; l'en-tête lui-même n'a jamais été posé sur ces images).

## Parti pris

- **Un seul assemblage rigide dans le repère de la voiture** : coin de roue (un groupe qui braque autour de la verticale du moyeu), bloc ABS, pédalier, lignes.
- **Le bloc est un totem** : calculateur (boîtier noir mat, ailettes, connecteur côté roue) DESSUS, bloc de vannes en aluminium au milieu (la pièce la plus claire), moteur de la pompe DESSOUS, axe vertical. Raison : les quatre faces du bloc restent libres, donc sous `xray` le circuit se lit de partout entre az −20 et −50, et de dehors on lit trois pièces empilées quel que soit l'azimut. (Moteur derrière et calculateur devant, comme sur un vrai bloc : l'un cache le circuit, l'autre est caché.) Sur sa face côté roue : quatre raccords — le tien avec son flexible, et trois amorces coupées ; côté pied : l'arrivée et l'amorce du second circuit.
- **Le circuit dans le bloc est un schéma, dans un seul plan face à +z** : galerie d'alimentation en haut à droite → vanne d'admission → chute → galerie de la roue (vers la gauche) ; dans le plancher de cette galerie, le trou que ferme le pointeau de la vanne d'échappement → purge → accumulateur (piston sur ressort, couché) ; galerie du bas → piston de pompe en ligne, sur la came du moteur → colonne montante → retour dans la galerie d'alimentation.
- **Le liquide est une gaine de lumière encre** autour de tubes sombres : niveau égal = pression, tirets = débit (dans le sens où ça coule). Rien ne dépend d'une dérivée : le débit se déduit de l'état — `inlet × (brake − grip)` vers l'étrier, `outlet` vers l'accumulateur, `pump` vers le pied.
- **Les impulsions du capteur** : un treillis de places qui file à vitesse fixe sur le fil ; `wkmh` dit combien sont allumées (toutes au-dessus de ≈ 60 km/h, une sur deux au-dessus de ≈ 30, une sur quatre au-dessus de ≈ 3, aucune à 0). Pas de phase = temps × vitesse : elle sauterait à chaque changement de vitesse.
- **Dents de la couronne (44) et ailettes du disque (30)** : vraie géométrie, sans arêtes tracées, recouverte d'une bande grise unie dès que `wkmh` dépasse ≈ 10 km/h dans la rue ; sur l'établi toujours nettes.
- **Libertés prises pour être lu en une image** (à porter dans `sources` si un plan s'y attarde) : course des plaquettes 7 mm par côté (`GAP`) ; la couronne est CÔTÉ ROUE du porte-moyeu (dès que le disque est retiré elle fait face à la caméra — sur une vraie voiture elle est derrière le roulement) ; les vannes barrent leur galerie comme des pointeaux (course 7 mm, `STROKE`) ; la pompe est un seul piston en ligne ; lignes, flexible et fil trois fois plus gros que nature ; braquage 28° (`STEER`).
- **L'éclaté est en DEUX étages**, en travers d'une caméra à az −44 — écart assumé par rapport à la consigne « une rangée » : la rangée unique fait ≈ 230 cm, soit 3,6 px par cm (la couronne ferait 17 px sur une vignette). En bas, à hauteur d'essieu, de gauche à droite : pneu (tiré droit hors de la jante, vers l'œil) · jante · couronne et capteur (moyeu, porte-moyeu) · disque · étrier (plaquettes sorties par-dessous). Au-dessus, levés : le bloc (calculateur levé, les deux vannes sorties par le haut, piston de pompe et moteur descendus) · le pédalier entier. Même ordre que la consigne, plié en deux ; ≈ 177 cm de large. Rien ne se traverse : la roue sort d'abord vers l'extérieur, l'étrier se lève du disque, le disque quitte le moyeu et le double côté caméra, le bloc et le pédalier montent avant que rien ne passe dessous. Donner à `explode` au moins 1,2 s.

## Les nombres

| nombre | ce qu'il fait |
| --- | --- |
| `bench` | 1 : un poteau sous le bloc, un sous le servo (ils s'effacent avec l'éclaté) ; les dents toujours nettes |
| `steer` | tout le coin de roue tourne de 28° × steer autour de la verticale du moyeu ; le flexible et le fil du capteur suivent (trois formes mélangées : gauche, droit, droite) |
| `rolled` | pneu, jante, disque, moyeu et couronne tournent (100 × rolled / 34 rad, vers l'avant). Ne change plus = roue bloquée : la marque de peinture (flanc + bande de roulement) et les cinq branches sont nettes |
| `wkmh` | rue : au-dessus de ≈ 10 km/h dents et ailettes se fondent en bande grise ; avec `sense`, la densité des impulsions |
| `brake` | le patin est à `pedalPad(brake, pulse, time)`, le levier (qui s'allonge de 8 % au plus) et la tige de poussée suivent ; la ligne du pied s'emplit de lumière (0 → 0,3 : un front descend du maître-cylindre à la vanne d'admission) |
| `pulse` | la pédale tremble (`pedalPad`) |
| `grip` | les plaquettes serrent (7 mm par côté) ; la ligne de la roue est aussi claire que la pression à l'étrier |
| `lock` | disque et plaquettes en signal, un point chaud à l'étrier, une vraie lumière signal dans la roue |
| `inlet` | 1 ouverte · 0 fermée : le pointeau descend sur la bouche de la chute, sa bobine s'allume en veille, et TOUTE la chute s'éteint — la lumière du pied s'arrête sous la bobine |
| `outlet` | 0 fermée · 1 ouverte : le pointeau se lève, sa bobine s'allume, des tirets remontent de l'étrier et tombent dans la purge, le piston de l'accumulateur recule (ressort comprimé), une lueur s'y loge |
| `pump` | le piston va et vient sur sa came (3 allers-retours par seconde) ; tirets dans la galerie du bas, la colonne montante, puis à rebours dans la ligne du pied |
| (déduit) | `inlet` ouverte et `brake` > `grip` : tirets du pied vers l'étrier (« resserrer », et la première image du film : brake 1, grip 0,6) |
| `sense` | impulsions veille sur le fil, une lueur à la pointe du capteur |
| `xray` | pneu et jante en verre (la marque reste, pâle), le bloc en verre : le circuit se montre |
| `explode` | les deux étages (établi) |
| `litRing` `litSensor` `litEcu` `litValves` `litPump` | couronne et dents · capteur · calculateur · les deux vannes (et le verre du bloc) · moteur et piston de pompe |
| `shell` `dive` `rain` `kmh` | inutilisés |

`A` : `hub, tyre, disc, caliper, ring, sensor, ecu, unit, inlet, outlet, pump, motor, pedal, master, hose` — enfants de leurs pièces : ils suivent le braquage, l'éclaté, le patin.

## Poses qui cadrent (vues sur planche ; `fov` 28)

Établi (coordonnées de l'établi) :

```js
whole:       { tx: -9.7, ty: 40, tz: -8.7, d: 580, az: -42, el: 14, shift: 200, side: 60 },  // le système entier ; avec xray 1 + brake 1 + sense 1 c'est la meilleure image d'ensemble
exploded:    { tx: 0, ty: 54, tz: 0, d: 800, az: -44, el: 14, shift: 230, side: 45 },          // les deux étages
ringPart:    { tx: 20.8, ty: 37, tz: 20.1, d: 200, az: -44, el: 12, shift: 170 },               // explode 1 : couronne dentée, capteur au-dessus (litRing, litSensor)
unitOpen:    { tx: 10.1, ty: 80, tz: 9.7, d: 185, az: -44, el: 12, shift: 170 },                // explode 1 : calculateur · deux vannes · bloc · pompe · moteur
caliperOpen: { tx: 56, ty: 43, tz: 54.1, d: 130, az: -44, el: 12, shift: 170 },                 // explode 1 : étrier, plaquettes dessous
unitPart:    { tx: 6, ty: 61.5, tz: -19, d: 92, az: -30, el: 12, shift: 170 },                  // xray 1 : LE cadre du cycle (isoler · relâcher · resserrer). az −46 / el 14 marche aussi, circuit plus écrasé
unitOut:     { tx: 6, ty: 61, tz: -20, d: 135, az: -46, el: 16, shift: 170 },                   // xray 0 : calculateur, bloc et ses raccords, moteur
brakeTop:    { tx: -18, ty: 45, tz: -29, d: 120, az: -14, el: 38, shift: 170 },                 // xray 1 : par la fenêtre de l'étrier, le disque entre ses deux plaquettes (grip 0 → 1)
brakeLock:   { tx: -24, ty: 38, tz: -37, d: 200, az: -58, el: 8, shift: 170 },                  // roue pleine : le disque signal derrière les branches (lock 1)
ringPlace:   { tx: -10.5, ty: 39, tz: -37, d: 150, az: -14, el: 10, shift: 170 },               // xray 1, sense 1 : la couronne en place, vue de l'arrière, les impulsions sur le fil
pedalPart:   { tx: 23, ty: 62, tz: 18, d: 210, az: -64, el: 10, shift: 170 },                   // le pédalier de profil (brake 0 / 1)
```

Rue (repère de la voiture) :

```js
wheel:      { tx: -80, ty: 38, tz: -145, d: 190, az: -62, el: 8, shift: 150 },      // la roue plein cadre, le frein derrière les branches
steerView:  { tx: -78, ty: 44, tz: -140, d: 230, az: -40, el: 10, shift: 150 },     // steer 1 : la roue braquée, le bloc derrière
ringStreet: { tx: -66.5, ty: 39, tz: -145, d: 150, az: -14, el: 10, shift: 150 },   // xray 1 : derrière la roue (l'étrier est devant la couronne)
```

`POSE0` tel quel : la roue, le bloc et son fil (impulsions), les lignes allumées. Dans l'éclaté (coordonnées de l'établi) : pneu (−73, 34, −3) · jante (−3, 34, −3) · couronne (21, 34, 20) · disque (38, 34, 36) · étrier (56, 45, 54) · bloc (10, 82, 10) · patin de la pédale (37, 68, 63), servo (37, 98, 33).

## Ce qui a raté, et pourquoi

- La marque du pneu : une bande crème de 9 cm, on aurait dit du ruban adhésif. Moitié moins large, peinture moins blanche.
- « Isoler » ne se lisait pas : 0,75 cm de noir à la vanne ne coupe pas un trait de lumière. La chute entière s'éteint.
- Bobines, moteur et calculateur noirs sur noir (du calculateur il ne restait que ses arêtes). Un gris plus clair chacun.
- La roue de verre : toutes les arêtes du tonneau de la jante faisaient un fouillis d'ellipses. Seulement les branches, le cache et les deux rebords.
- L'étrier : deux « cadres de tableau ». Pont à coins coupés, fenêtre plus petite, doigts épais.
- **Une face horizontale brillante vue depuis az ≈ −45 renvoie la lumière de contre (elle est exactement en face) dans l'objectif** : le dessus du bloc, mis à nu par l'éclaté, brûlait en blanc-vert ; puis le couvercle verni du calculateur, qu'on aurait cru allumé par `litEcu`. Un joint sombre et mat sur le bloc (les deux puits des vannes dedans), plastique mat pour le calculateur et le réservoir.
- Dans l'éclaté, le patin de la pédale pendait sur l'étrier : étage du haut relevé (bloc +20, pédalier +22).
- Disque bloqué : aplat orange sans modelé. Émission baissée, c'est le point chaud à l'étrier qui dit où.

## Ce qui n'est pas au niveau

- **L'éclaté large est un plan de situation** : à d 800 la roue fait ≈ 320 px de haut, le bloc ≈ 60 px, la couronne ≈ 60 px, les vannes ≈ 15 px. Rien de ce que la voix nomme n'y fait 150 px : les noms se disent sur `ringPart`, `unitOpen`, `unitPart`.
- **En place, la couronne ne se voit pas du côté où on filme** (az −40 … −70) : elle est derrière le disque. On ne l'a que de l'arrière, sous `xray`, et l'étrier lui passe devant (`ringPlace` : chargé). Le beau plan de la couronne est dans l'éclaté — où il n'y a PAS d'impulsions (le fil s'efface avec les lignes).
- **Sur l'établi sans `xray`, le frein derrière les branches se devine à peine** (fenêtres sombres à d 580). L'image d'ensemble qui marche est `whole` avec `xray` 1.
- **`grip` 0 → 1 est discret** : 7 mm par côté, lisible seulement par la fenêtre de l'étrier (`brakeTop`).
- **L'étrier reste la pièce la moins fine** ; les deux poteaux de l'établi sont noirs et droits : discrets, pas beaux.
- Un reflet vert doux reste sur la collerette du moteur vue depuis az −44.
- **Jamais vu en mouvement** : la roue qui tourne et sa marque, la bande grise des dents à 80 km/h (cachée de toute façon), la pédale qui tremble, le piston de pompe, la course des tirets et des impulsions, l'éclaté (deux instants vus : 0,5 et 1), le braquage (vu à 1, de loin).
- **Corrigé après la dernière image, pas revu** : étrier éclairci, blocage renforcé pour la distance de `POSE0` (à la planche il y était petit), réservoir et bouchon mats.

## À changer ailleurs

- `world.js` → `VIEW` : remplacer `whole`, `exploded`, `ringPart`, `unitPart`, `pedalPart` par les poses ci-dessus ; `brakePart` → `brakeTop` et `brakeLock` ; ajouter `unitOpen`, `caliperOpen`, `unitOut`, `ringPlace`, `steerView`, `ringStreet`. `wheel` : `ty` 38. `SYSTEM.bench` et `SYSTEM.size` : inchangés.
- `world.js` → `BENCHED` ne fixe ni `wkmh` ni `rolled`. Sur l'établi les dents sont nettes quoi qu'il arrive, mais les impulsions suivent `wkmh` : pour montrer « une roue qui ralentit » sur l'établi, l'acte doit bouger `wkmh` (et y faire tourner la roue à moins de 0,4 m/s de `rolled` : au-delà, les dents sautent).
- `plan.js` (pour mémoire : personne d'autre ne lit ces cotes) — `LINES` n'est pas suivi au point près : `feed` part du flanc du maître-cylindre (−35,6 ; 76 ; −117) et entre dans le bloc en (−43,5 ; 63,2 ; −127) ; `wheel` sort en (−56,5 ; 60,4 ; −127), raccord à −59,2, flexible jusqu'à l'étrier (−65,3 ; 47,7 ; −139) ; `wire` va de (−64,8 ; 48,6 ; −144,7) au connecteur (−59,3 ; 69,4 ; −129,6). `UNIT` est le bloc seul : l'ensemble va de y 49,1 (moteur) à 71,8 (calculateur). L'étrier fait 13 cm de large, pas 8.
- `street.js` : rien à dessiner à mes places (roue avant gauche, frein, bloc, pédalier, lignes). Au-delà de |`steer`| ≈ 0,85 le pneu vient toucher le raccord du flexible et les amorces du bloc : rester sous 0,8 dans un plan rapproché.
- Exportés par `model.js` si un acte en a besoin : `STEER`, `GAP`, `STROKE`.

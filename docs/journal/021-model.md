# 021 · `src/model.js` — journal

Agent du système (la veille automatique, VACMA). Propriétaire de `episodes/021-veille-tgv/src/model.js`.

## Fait

- Lu : recette, `021-decors.md` (section model), `plan.js`, `world.js`, bouchon, `021-actes.md` (lignes du système), idiome 017 / 020, `build3d.js`.
- Choix de construction (avant toute image) :
  - pédale : plaque claire à cinq stries larges, charnière au talon (+x), butée de pointe, ressort de rappel hélicoïdal sous la pointe, comprimé dans le shader (le fil garde sa section).
  - cadran : un disque dessiné dans un shader (fond sombre, piste encre, arc qui se vide dans le sens des aiguilles depuis midi, tête claire au bord, couleur veille → signal), dans une lunette grise sur la face +z du boîtier.
  - angle mort : une part de tarte de 30° (1/12) centrée sur 3 h, signal sourd, bordée de deux rayons signal ; la piste de l'anneau est teintée signal sourd dans ce secteur quand elle est vide — quand l'arc passe dessus, il ne change pas.
  - sonnerie : dôme clair, marteau qui vibre à 30 Hz (un flou stable), trois coques de verre signal qui s'élargissent (un cercle depuis tous les azimuts).
  - relais : deux lames horizontales, l'une pivote vers le haut avec `cut` ; boule veille dans l'écart ; ligne encre entrée (boîtier → relais) / sortie (relais → +x), la sortie s'éteint.
  - valve : tronçon de conduite le long de x, corps sous la conduite, clapet qui s'ouvre vers le bas, six filets d'air encre (tubes à traînées dessinées dans le shader, ≈ 30 cm/s), liseré veille.
  - chaussure : semelle, talon, empeigne de verre (une coque, `asShell`), col bas et ouvert vers le haut ; vit dans le repère de la pédale.

## Planches (30 images lues : 8 + 8 + 8 + 6)

1. Première planche : la convention d'azimut de `plan.js` / `021-decors.md` est **inversée** par rapport au plateau (`stage.js` : caméra en (sin az, ·, cos az) → az 0 = flanc +z, az −90 = côté −x, le nez). `VIEW.dial` / `VIEW.dialCab` (az −80) voyaient le cadran par la tranche. Le relais (plan : [−50, 20, 24]) masquait la pédale dans toutes les vues de trois quarts. La silhouette du pupitre (deux vitres pleines) encombrait. Pédale trop claire (brûlée sous la chaussure).
2. Corrigé : axes de l'éclaté recalculés, relais posé SUR le boîtier (constante locale `RELAY_AT`, voir plus bas), silhouette réduite au plateau de verre + contour du mur des genoux, cadran lu à az −14 : **lisible**. L'angle mort (part de 30° à trois heures, rayons signal) se lit nettement sur le cadran de près ; à la taille de `VIEW.system` (cadran ≈ 280 px de diamètre en pleine résolution, ≈ 70 px à 270 px de large) la part fait ≈ 20 px à l'arc extérieur : lisible, sans marge. Pas besoin du repli.
3. Les vues **dans la cabine** (`system`, `bellCab`, `dialCab`) n'ont pas pu être jugées : `train.js` était encore le bouchon (pupitre gris opaque qui cache tout). Seul fait vu : les trois coques de la sonnerie se lisent en arcs signal concentriques.
4. Dernière planche avec en-tête et zones : l'éclaté tient en un cadre (sonnerie, touches inclinées vers la caméra, boîtier et cadran au centre, relais à droite, pédale et ressort, valve en bas à droite) ; la chaussure se lit comme une chaussure (semelle, empeigne, pas de jambe) ; `still` est plus terne et plus basse, sans rien de blessé — l'écart avec `foot 1` reste discret.

## Poses qui cadrent (prêtes à coller dans `VIEW`, `P = { fov: 28, side: 0, roll: 0, drift: 0.3 }`)

- `whole: { ...P, tx: -22, ty: 108, tz: 15, d: 440, az: -38, el: 18, shift: 30 }` — tout le système assemblé (la valve sous le socle sort par le bas : normal).
- `exploded: { ...P, tx: -18, ty: 113, tz: 15, d: 430, az: -40, el: 14, shift: 100 }` — la colonne entre l'en-tête et les sous-titres (à d 390 / shift 40, la pédale et la valve tombaient dans les sous-titres et la sonnerie touchait l'en-tête). OPEN est réglé pour az −40 : ne pas changer cet azimut sans changer OPEN.
- `pedalBench: { ...P, tx: -15, ty: 78, tz: 0, d: 150, az: -40, el: 24, shift: 120 }` — la pédale et la chaussure, de trois quarts avant-gauche, le ressort visible pédale relevée.
- `keysBench: { ...P, tx: 8, ty: 162, tz: 0, d: 240, az: -82, el: 42, shift: 100 }` — les deux touches en travers du cadre.
- `dial: { ...P, tx: -50, ty: 115, tz: 7, d: 130, az: -14, el: 8, shift: 120 }` — le cadran de face, le relais au-dessus.
- `dialCab` : même chose dans la cabine : `{ ...P, tx: -850, ty: 195, tz: 7, d: 130, az: -14, el: 10, shift: 120 }` (non vérifié avec le vrai `train.js`).
- couverture (`cover.cam`) : à d 360 / shift −460, la vue éclatée descend jusqu'au bas de l'image ; essayer `d: 420, shift: -400` (el 28, az −40) avec `npm run cover`.

## Les nombres de l'état, chez moi

`bench` (socle, poteaux, silhouette du pupitre ; la chaussure n'existe que là) · `pedal` (rotation au talon 14° → 0, ressort comprimé dans le shader) · `foot` (la chaussure arrive d'au-dessus et de +x, fondu sur 0–0,45) · `still` (verre à 40 %, −1 cm, talon affaissé, roulis) · `keys` (lentilles veille + halo sur la réglette) · `count`, `danger`, `blind`, `litBox` (le cadran, dans son shader) · `bell` (marteau à 30 Hz, trois coques signal, période 1,25 s) · `cut` (la lame supérieure se lève de 24°, boule veille dans l'écart, la ligne de sortie passe de 0,85 à 0,1) · `vent` (clapet −68°, filets d'air ≈ 30 cm/s, liseré veille) · `explode` (six pièces, décalées de 0 à 0,95 ; socle, silhouette et fils s'effacent dans le premier tiers) · `litPedal`, `litKeys`, `litBox`, `litBell` (teinte veille des solides et des arêtes).

## À changer ailleurs

- `plan.js` : `export const RELAY = { at: [-50, 64, 2], size: [10, 12, 8] };` — le relais posé sur le boîtier, sous le plateau du pupitre. `model.js` l'utilise déjà par une constante locale `RELAY_AT` ; une fois `plan.js` changé, remplacer `RELAY_AT` par `RELAY.at` (deux lignes).
- `plan.js` (en-tête) et `docs/021-decors.md` : la phrase « az 0 looks from the front (−x), −90 from the left side (+z) » est fausse pour le plateau : **az 0 = flanc gauche (+z), az −90 = l'avant (−x), −180 = flanc droit**. La plage « az −20 … −70 = trois quarts avant-gauche » reste vraie. À dire à l'agent de `train.js` et aux actes.
- `world.js` → `VIEW` : remplacer `whole`, `exploded`, `keysBench`, `dial`, `dialCab` par les poses ci-dessus.

## Ce qui n'est pas au niveau

- Rien de vérifié dans la cabine (le décor n'était pas livré) : image 6 (sonnerie dans la cabine) et image 7 (`cut`, `vent` sous le pupitre de verre) restent à juger sur le vrai `train.js`. Le système est petit à `VIEW.system` (d 230) : le relais et la valve y font 150 px environ.
- `still` contre `foot 1` : la différence se lit (plus terne, plus bas), mais doucement ; si l'acte la veut plus franche, c'est le cadran (qui continue de se vider) qui porte la phrase.
- Le veille du cadran, avec `litBox` 1, déborde en halo sur la façade du boîtier : franc, pas baveux, mais c'est la limite.

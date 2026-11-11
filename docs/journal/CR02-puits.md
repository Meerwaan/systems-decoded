# CR02 · puits.js — journal du décor

Agent décor, 06/11. Fichier : `episodes/CR02-deepwater/src/puits.js` (bouchon de l'architecte remplacé, API gardée).

## Choix

- **La colonne en coupe** : tout ce qui est coupé l'est par x = 0 (tubage, riser, BOP simple, plancher, roche, réservoir). **Les trois fluides sont UNE face de coupe** (un plan juste derrière x = 0, un shader) : boue brun-noir qui bout lentement (bruit qui dérive), eau de mer papier (la plus claire du cadre, des filets qui descendent), gaz rouge (corps rouge, bulles-traînées qui montent, un front brillant ondulé, une lueur courte au-dessus). Interfaces nettes (largeur ≥ 1,3 px par `fwidth`).
- **Le tube de forage est en coupe lui aussi** (deux parois claires en relief au milieu de l'alésage, des joints tous les 64 cm, son pied à y 170) : un tube plein devant les fluides en cachait le quart.
- **La balance** (`balance`) : deux flèches DANS la colonne, au fond (montrée sur la pièce) — le poids de la boue, une flèche claire vers le bas (verte avec `ok`), la poussée du gaz, une flèche rouge qui monte du réservoir ; elles échangent leur taille de −1 à +1 ; elles s'effacent quand le gaz dépasse 0,12 → 0,3 (le gaz lui-même prend le relais). `BALANCE.at` n'est donc pas utilisé.
- **Les deux cadrans** : boîtier + lunette (la pièce qui rougit pour LIGNE), cadran clair, 21 graduations (0 → 2 000, majeures tous les 500), aiguille sombre en relief, aucun chiffre. TUBE relié au tube de forage par une conduite par-dessus la console ; LIGNE relié à la ligne qui descend le long du riser jusqu'au BOP.
- **Kill line et câble** : la ligne (claire, côté −z, sous les cadrans) et le câble (sombre, âme papier vivante avec `link`, côté +z, sous le bouton) ne se croisent pas — le signe de leur z est pris du côté de leur instrument (voir « À changer ailleurs »).
- **Le bouton** : panneau, lunette claire, collerette sombre, bouton `alarm()` qui s'enfonce de 2,2 cm, capot relevé. Personne.
- **Le compteur de débit** : monté sur la face de coupe de la roche (x ≈ −3), piqué sur le pied du tubage ; zone verte 0 → 10, zone rouge 10 → 30 sourde qui s'allume quand l'aiguille y entre, marque 10 papier (`mark`).
- **Le BOP simple** : corps sombre en couches (logements des mâchoires ouverts sur la coupe), de bas en haut VBR (mâchoires, vertes une fois fermées), BSR (deux lames qui se croisent), annulaire (caoutchouc, ne verdit pas : il n'a pas scellé), tiges de piston qui s'allongent.

## Avancement

- 1ʳᵉ écriture du fichier ; planche a (8) : tout se lit, mais les bulles en gouttes (pointe en bas, lues « qui tombent »), le bouton du panneau trop terne, un capot relevé qui flottait en boîte → bulles rondes à liseré clair, bouton plus clair, capot retiré.
- planche b (8) : **la boue disparaissait dans la roche (sombre sur sombre)** → roche en valeurs moyennes, tubage plus clair, boue un peu plus brune et plus texturée ; front du gaz plus large et plus chaud. Aiguilles vérifiées : 0 en bas à gauche, 1 400 en haut à droite, 22/30 en haut à droite.
- planche c (8, avec l'en-tête et les sous-titres) : trois fluides séparés partout ; reflet du studio sur la lunette du compteur qui couvrait la marque 10 → lunette mate, marque moins forte.
- planche d (4) : interface boue/eau nette avec son ménisque ondulé, mâchoire à mi-course, front du gaz brillant et bulles rondes de près — au niveau.
- planche e (2) : lamination fine et ondulée des strates (fondue sous quelques pixels) : la roche n'est plus du carton.
- `npm run check -- CR02` passe. **30 images lues.**
- Remarque : à t = 38 s, `look` a montré les deux aiguilles vers ≈ 1 200 alors que l'essai disait 0 (une ligne d'acte écrit sans doute `dialTube`/`dialLine` là) — à vérifier par l'acte 2, pas un défaut du décor.

## Les nombres et ce qu'ils font

- `sea` : interface boue/eau à `yAt(1 − sea)`, nette, ménisque sombre ≥ 1,3 px ; au-dessus l'eau papier (filets qui descendent), en dessous la boue.
- `ok` : la boue passe au vert veille (texture gardée) et la flèche « poids » s'allume en vert.
- `balance` : −1 grande flèche claire vers le bas (le poids), petite flèche rouge sous le fond ; +1 l'inverse, la rouge entre dans l'alésage ; les pores du réservoir rougissent avec. Flèches effacées quand `gas` passe 0,12 → 0,3.
- `gas`, `gasBase` : le gaz entre `yAt(gasBase)` et `yAt(gas)` (au moins 0,3 cm) ; bord bas fondu si `gasBase` > 0 (la poche) ; `A.gasTop` sur le front.
- `debit` : l'aiguille du compteur (0 … 30) ; au-dessus de 4 → 20, une 2ᵉ couche de bulles, rapide ; la zone rouge s'allume quand l'aiguille passe 10. `mark` : la marque 10 en papier.
- `dialTube`, `dialLine` : les deux aiguilles, 0 … 2 000 psi sur 270°.
- `eds` : le bouton s'enfonce de 2,2 cm. `signal` : l'impulsion (tête lumineuse + traîne de 16 cm) du panneau (0) au BOP (1), `A.signal` dessus, éteinte aux deux bouts. `link` : l'âme du câble vivante (1) ou éteinte (0).
- `vbr`, `bsr`, `annular` : les mâchoires et leurs tiges ; VBR et BSR verdissent une fois fermées (≥ 0,85), l'annulaire non (il n'a pas scellé).
- `culprit` 1 + `fault` : la lunette et le boîtier du cadran LIGNE en rouge ; 2 : le bouton en rouge. `A.fault` suit ; `haloY` (le dessus du plancher, 566,2) est rendu pour poser le halo sous la pièce (voir plus bas).

## Les poses qui cadrent (repère local du puits ; `pose("puits", …)`)

- `dials` : [10, 588, −64], d 240, az −70, el 8, shift 40 — les deux cadrans ≈ 30 % chacun, conduites visibles. **Bon.**
- `dialLine` : [10, 588, −47], d 130 donne ≈ 75 % de la largeur ; pour ≈ 45 % : **d 200**, même angle.
- `flowDial` : le cadran est monté sur la face de coupe, à x ≈ −3 : **[−3, 74, 52]** ; d 150 → ≈ 75 % ; pour ≈ 40 % : **d 260**.
- `eds` : [10, 578, 66], d 100, az −70, el 12, shift 40 — le panneau ≈ 45 %, le bouton ≈ 30 %. **Bon.**
- `bottom` : [0, 92, 0], d 430, az −64, el 6, shift 40 — boue, front, flèches, pores, compteur au bord droit. **Bon.**
- `middle` : [0, 200, 0] met le BOP simple sous l'en-tête ; pour `principe` (« un long tube ») préférer **[0, 170, 0]**, d 560.
- `top` : [0, 520, 0], d 420 — l'eau descend sous le plancher, les cadrans dépassent en haut à gauche (derrière l'en-tête). **Bon** pour t1 ; l'interface sort du cadre dès `sea` > 0,35 : la caméra la suit (`path`, cible `yAt(1 − sea)` + 60).
- `bopSmall` : [0, 300, 0], d 380, az −64, el 6, shift 40 — la poche, les mâchoires, la ligne à gauche, le câble à droite, l'impulsion qui arrive. **Bon.**
- Le signal à mi-course : cible [0, 450, 0], d 380 (le câble est à z +28, à droite du riser).
- Gros plan du front : [0, 300, 0], d 190, az −64, el 4 (`gas` 0,5) — très beau, bulles rondes, front brillant.

## Pas encore au niveau (dit franchement)

- Le puits entier (`VIEW.puits`, d 1500) : la colonne ne fait que ≈ 7 % de la largeur et les parois du tube de forage la coupent en trois bandes : se lit comme « blanc / sombre / rouge », pas plus. Plan d'ensemble court.
- La boue au repos (`ok` 0) reste sombre et peu texturée de loin : elle se lit par contraste avec le tubage clair, pas par sa matière.
- Le BOP simple est chargé à petite taille (logements, tiges, couvercles) ; il se lit nettement à d ≤ 380.
- Rien ne dit « l'eau » autour du riser : il est dans le noir du studio.

## À changer ailleurs

- `episodes/CR02-deepwater/src/world.js`, dans `apply` — le halo sous la pièce en défaut est posé à y 0 (le bas du réservoir), 560 cm sous les cadrans : remplacer
  `recon.halo({ at: [faultAt.x, 0, faultAt.z], r: set.haloR ?? 40, amount: 0.5 * Math.max(k, heal), k: heal });`
  par
  `recon.halo({ at: [faultAt.x, set.haloY ?? 0, faultAt.z], r: set.haloR ?? 40, amount: 0.5 * Math.max(k, heal), k: heal });`
- `episodes/CR02-deepwater/src/world.js`, `VIEW` : `flowDial: pose("puits", [-3, 74, 52], { d: 260, az: -72, el: 8, shift: 40, ...CLOSE }),` · `dialLine: pose("puits", [10, 588, -47], { d: 200, az: -72, el: 6, shift: 40, ...CLOSE }),` · `middle: pose("puits", [0, 170, 0], { d: 560, az: -64, el: 4, shift: 30 }),`
- `episodes/CR02-deepwater/src/plan.js` (cohérence du commentaire, le code n'en dépend pas : `puits.js` prend le côté de chaque instrument) : `export const KILL_LINE = { z: -28, r: 1.6 }; // the kill line: down along the riser on the console's side (−z), from the LIGNE dial to the BOP` et `export const CABLE = { z: 28, r: 1.2 }; // the control cable: from the EDS panel down the panel's side (+z) to the BOP (`signal` runs along it)`
- `plan.js` : `BALANCE.at` n'est plus lu (la balance est dessinée DANS la colonne, au fond de l'alésage) — `export const BALANCE = { at: [0, 46, 0] }; // the « balance » of principe: two arrows at the bottom of the bore (puits.js)`.

## Pour `docs/catalogue.md`

- `CR02/src/puits.js` — un puits en coupe (noir chaud) : colonne aux trois fluides en shader (boue / eau / gaz : interfaces nettes, bulles, front), réservoir poreux, BOP simple à trois mâchoires, cadrans à aiguille génériques (`gauge` : max, graduations, zones colorées, marque), bouton qui s'enfonce, câble à impulsion lumineuse. Nombres : `sea ok balance gas gasBase debit mark dialTube dialLine eds signal link annular vbr bsr culprit fault`.

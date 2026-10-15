# L01 · `c5-route-trempe.js` — journal

Chapitres 09 Sur la route + 10 Le verre trempé (325,31 → 400,17 s). 26 images lues (planches b1 8, b2 8, b3 6, b4 4), toutes dans le dossier temporaire. `npm run check -- L01` passe (0 erreur ; contraste 31/31).

## Ce qui est monté

- **09** — coupe ROUTE sous la carte, de côté, fouet (0,85 s, `expo.out`) vers la voiture qui vient ; une poussée par rapport (760 → 150) qui tourne de 90° jusqu'au côté passager, au-dessus du point d'impact. Le gravillon vole (`chip` 0 → 0,5) et frappe 0,55 s après « gravillon » ; plongée par rapport jusqu'à la macro (d 24) sur « Un impact », l'étoile se pose (`chip` → 1). Lente orbite ; « soleil » `gel` 0,25, « froid » 0, « dégivrage » 0,14 ; la fissure saute sur chaque mot (`creep` 0,2 · 0,38 · 0,55 · 0,72 · 1 sur « avancer ») pendant que la caméra recule le long d'elle (d 52). Coupe : un autre impact, sans fissure, la résine sur « comble » puis la cure ; « Sinon » : recul par rapport jusqu'à la voiture entière.
- **10** — coupe VOITURE sous la carte, de l'intérieur (`sideIn`), fouet vers la vitre ; sur « autrement », coupe sur la voie de trempe vue d'en haut (el 48 → 55) : la vitre orange dans le four, en-tête 620 °C. Elle sort et file sous la soufflerie, la caméra la suit en travelling en redescendant (el 16) ; « d'un coup » : jets, `sideGlow` et 620 → 20 °C en une seconde. Elle glisse jusqu'à x 7 600, la caméra monte au-dessus (az −90) : `stress` 1 sur « comprimée » (étiquette SURFACE COMPRIMÉE), fait « ≈ 4 × PLUS RÉSISTANT » sur « quatre », mot-clé TREMPÉ ; poussée sur l'entaille, `stress` 2 sur « rayure » (RAYURE FERMÉE) ; recul sur le cœur (CŒUR TIRE, signal) ; `stress` 3 sur « profonde ». « Mais quand il casse » : recul par rapport jusqu'à la vitre entière, et sur « coup » elle éclate (`stress` 0, `grains` 0,42 en 0,3 s, la caméra donne un coup d'avance) ; sur « éclate » les grains tombent sur les rouleaux, la caméra descend avec eux jusqu'au ras. « Pour un pare-brise » : coupe ROUTE, de tes yeux ; « éclaté en grains » : le pare-brise blanchit, la caméra avance et tourne de 3° (« tu perds la route »). « Et parfois » : coupe VOITURE, la vitre de l'intérieur ; « éclate » : elle éclate seule, les grains tombent. « La faute » : coupe sur une vitre intacte, son cadre et son tampon « I » ; le grain signal apparaît sur « grain », son halo monte de « sulfure » jusqu'à la fin du `hold` (`nickel` 0,5 → 0,8 : les fissures, à 0,82, ne viennent pas), la caméra s'en approche par rapport (115 → 58) ; étiquette SULFURE DE NICKEL (signal).

## Les poses vues

- Le gravillon en vol : `{ tx: 34, ty: 140, tz: -96, d: 150, az: 112 (≡ −248), el: 22, fov: 32, side: -120 }` + `chip` 0,42 : le pare-brise grand, le caillou un point signal.
- L'impact : visée `{ 34, 117.7, −84.7 }` (le vrai point d'IMPACT.chip ; `VIEW.chip` vise 9 cm trop bas), d 24, az −192, el 34, fov 32 : l'étoile fait ≈ 150 px.
- La fissure qui court : visée `{ 44, 113.1, −90.2 }`, d 52–62, az −178, el 30 + `creep` 0,75 : la fissure se lit sur toute sa longueur.
- La trempe à chaud : `{ tx: 6400, ty: 95, tz: -1100, d: 300–320, az: -25, el: 55 }` : la vitre orange nette entre les résistances. À el 8, illisible.
- La coupe du trempé : `VIEW.stress` tient, à d 150–165 le schéma fait 40 % de la largeur ; à d 95 l'entaille et ses flèches se lisent.
- Le nickel : `{ ...VIEW.nickel, d: 115 → 58, az: 56 → 72, el: 10 → 6, side: -80 → -40 }` : le cadre de la vitre et le tampon « I » situent le grain (à d 34, un point dans le noir).

## Un cran en dessous

- **La vitre de côté dans la voiture** (carte 10, 345,6 → 349,9 s) : le verre trempé seul ne se voit pas — on lit son cadre, son tampon « I » et toi derrière. `sideOut` (posée) et une vue rasante du dehors étaient pires (on regarde à travers).
- **Le gravillon en vol** (329,0 → 330,0 s) : un point signal de quelques pixels ; à 329,6 s, hors du cadre ou trop petit.
- **Le nickel** (396,4 → 400,2 s) : le grain reste petit (≈ 10 px à 398,6 s) ; c'est l'étiquette et le halo qui montent qui le portent.
- **La résine** : une tache veille floue avant la cure.
- `IMPACT.chip` est bas, près des points de la bande noire : « loin du bord » ne se voit pas à l'image.

## À changer ailleurs

- Rien d'obligatoire. `world.js · VIEW.chip / chipRun` visent `ty: 109, tz: -80` : le point d'impact est à `ty: 117.7, tz: -84.7` (calculé sur `MOUNT` et le bombage de `verre.js`).

## Reprise après le brouillon (qa : images parasites) — 3 images lues (deux tuiles du brouillon, une planche de 4)

- **385,4 → 387,2 s** : le pare-brise vu de tes yeux passait de vert à blanc une image sur trois. La cause : la pluie de grains (`grains` → 1, sur la vitre de la ligne) se terminait 0,05 s APRÈS la coupe vers la route, qui remet `grains` à 0 : deux tweens sur le même nombre se chevauchaient, et l'obturateur (16 instants par image) retombait tantôt sur l'un, tantôt sur l'autre. La pluie finit maintenant 0,15 s avant la coupe.
- **352,9 → 353,7 s** : le travelling qui suivait la vitre du four à la soufflerie traversait de près les résistances puis les conduits (motif rayé traversé vite). Remplacé par une dérive lente au-dessus du four (la vitre commence à sortir) et une COUPE sur « refroidi » vers la soufflerie, où la vitre glisse sous les jets, caméra presque immobile.

# 034 — Ce que les décors ont changé (à lire avant `docs/034-actes.md`)

1. **Première image retenue : (a)**, contre-plongée 3/4, déjà dans `POSE0` / `FIRST` (spin 20, tilt 18). `WRECK.tailSink` recalé par le décor du fond ([1250, 3080, −2120]) : la queue coule en haut à droite derrière la boîte.
2. **Poses remplacées dans `world.js` `VIEW`** : `exploded`, `beaconBench`, `caseBench`, `core`, `section` (éclaté : le module monte et AVANCE vers la caméra, centre −4, 27, 12), `wreck` (queue couchée entière, boîte hors champ), `rise` (par-dessus, el 24 : le fond éclairé sous le module), `verdict` (ty −30, d 240).
3. **Chute (`fin.js`)** : `depth: 3899.2` (le module 80 cm au-dessus du fond), pas 3898 — à 3898 il fait 20 px.
4. **`beam`** n'éclaire le fond, l'épave et la neige qu'au-delà de 0,55 ; la lampe suit le module dès qu'il quitte le fond. `pool` ne s'allume qu'à moins de 4 m du fond.
5. **`depth`** : la queue qui coule remonte de 25 % de ce que la boîte descend (par l'état : la boucle retombe juste si `depth` et `wreck` reviennent à `FIRST`). La surface ne se voit qu'au-dessus de ≈ 150 m.
6. **`model.js`** : `sep` fait tomber la balise intacte au sol ; `apart` disperse et éteint le reste (gris mort) ; `section` = coupe en gradins vers la caméra de `VIEW.section`. Chaque nombre : `docs/journal/034-model.md` § « Ce que fait chaque nombre ici » ; le fond : `docs/journal/034-fond.md` § « Ce que fait chaque nombre ».
7. **Fragile** : `heat` (dernier réglage non vu : vérifier qu'il ne bave pas en masse rouge), flammes en plans (pas de gros plan rasant), interrupteur à eau petit sur `beaconBench`, `tail`/`tailBox` dans l'avion (la peau de verre peut cacher la boîte), le grand recul `ocean` → `floor` en 2,4 s.

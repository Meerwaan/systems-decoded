# 046 · `src/raffinerie.js` — journal du décor

2026-11-13. Contre le bouchon et l'API de l'architecte (`docs/046-decors.md`, `docs/journal/046-architecte.md`). Rien touché hors de mon fichier.

## Lu
recette-agents, regles-image, 046-decors (haut + ma section), journal de l'architecte, 046-actes (lignes qui me concernent + première image), plan.js, world.js, bouchon ; build3d (matières, asShell, plate, lathe, parts), usine.js `xray` (tête), CR02 `plateforme.js` (le contre-jour posé depuis la caméra, `onBeforeRender`).

## Choix
- **Le contre-jour des colonnes** (ce qui départage (a) et (b)) : un ciel de crépuscule signal, bas, posé dans la direction de la clé (azimut monde ≈ 150°, du côté −x +z), sur un dôme lu depuis la caméra (une lumière qui a un endroit, pas un voile) ; il ne se voit que quand on filme dans la lumière (l'accroche). Le même calcul (la caméra regarde-t-elle vers ce ciel ?) donne `cj` 0 → 1 : en contre-jour, le verre des colonnes prend un liseré plus fort, et un corps sombre (face arrière, couleur du fond) les découpe sur le ciel — invisible sur le noir, éteint et sans profondeur hors contre-jour (sinon il assombrirait les soupapes vues à travers les colonnes sur `VIEW.columns`).
- **`press`** : un volume plein signal dans chaque colonne (r × 0,9), ombré (plus sombre sur les bords), une surface plus claire qui monte, les plateaux en traits par-dessus (moitié avant seulement : le plein écrit sa profondeur).
- **Compresseur plein** : châssis (sombre), carter fendu à fenêtre (moyen, intérieur sombre), rotor à cinq roues (clair, la pièce-héros) vu par la fenêtre, accouplement, moteur à ailettes (sombre) et sa boîte à bornes où naît l'étincelle.

## Fait
- Ciel de crépuscule (dôme, azimut monde 162°, bande basse) + `cj` lu dans `onBeforeRender` du ciel : liseré des colonnes renforcé, corps sombre (face arrière, profondeur écrite seulement en contre-jour).
- Sol : grille en shader (≥ 2 px, effacée avant 6 px par case, brouillard). Rack : portiques de verre. Usine du fond : trois colonnes, deux sphères, deux bacs à toit flottant, deux blocs, un aéroréfrigérant, un long rack — hors des trajets de caméra connus (`VIEW.columns` est à ≈ (−4350, 1600, 2830)).
- Colonnes : coque tournée (jupe, fût, fond elliptique 2:1, piquage), plateaux et déversoirs, échelle à crinoline, deux trous d'homme ; `press` = volume plein signal (shader : ombré rond, surface claire, brassage lent). Sur l'établi : verre à 0,3, sans ciel ni corps.
- Compresseur plein (makePart/addMesh/setPartOpacity, il s'efface avec `shell`) : châssis, carter fendu à fenêtre (dessus-avant, intérieur sombre), plan de joint, paliers, deux piquages, rotor (arbre, cinq roues, aubes, deux moyeux à boulons), disques de flou qui entrent avec `hum`, carter d'accouplement (moitié haute), moteur à 15 ailettes, capot de ventilateur, boîte à bornes, petite lampe encre « en marche » (fixe). Moteur centré en x −1985 (plan.js dit −1930 : pas la place de l'accouplement).
- `spark` : boule douce + 14 étincelles en traits + une PointLight signal (posée hors du groupe du compresseur : une lumière qui apparaît/disparaît recompilerait toutes les matières).
- `blast` : 32 éclats de coque en traits signal (sortent, montent, culbutent, retombent), éventail de 34 traits, éclair, anneau au sol ; la vraie colonne 1 s'efface pendant (retour à b ≥ 0,78 → 1).
- `cloud` : 80 bouffées face caméra, corps sombre et lèvre signal, nées au pied des colonnes et roulant au ras du sol (shader, rien sur le CPU).
- `pane` : mur sombre percé, dormant, meneau, appui ; vitre (verre) et un reflet en deux traînées encre ; dessiné pour `VIEW.pane` (le montant à droite de l'image, l'appui en bas).
- `teaser` : cuisine (deux meubles, plan de travail, pâles), lave-vaisselle de verre (caisse, porte, bandeau, poignée), quatre assiettes au fond du panier bas (l'avant reste libre pour la caméra), deux verres retournés, paniers et picots en traits, tube d'alimentation, deux bras pleins (haut clair, bas moyen), 16 jets veille inclinés vers l'arrière (gouttes qui avancent de 1/20 de période par image ; un jet à moins de 16 cm de l'objectif s'efface), halo encre au-dessus du bras haut, visible seulement d'en dessous.

## Planches (30 images lues sur 30)
1. Huit images, bouchons des autres : **(a) telle que posée n'a pas les colonnes** (elles sont à 40° du cadre) ; `VIEW.compressor` ne voit ni le moteur ni l'étincelle ; colonnes `press` 0,65 ✓ ; `blast` ✓ ; nuage = un voile ✗ ; fenêtre lisible ; lave-vaisselle confus, jets en flammes.
2. Huit : (a) à az 100–115 → les colonnes derrière la cheminée, en verre sur le crépuscule ✓ ; compresseur az +25 : sombre devant les colonnes rouges (son halo), étincelle dans le cadre ✓✓ ; nuage en bouffées ✓ ; sous le bras : lisible mais tout près des verres.
3. Huit : (a3) colonnes plus haut ✓ ; `blast` vu de (a3) ✓ ; `hum` 1 (flou des roues) ✓ ; établi (colonnes pâles) ✓ ; vue large de l'usine sous la flamme ✓ ; halo sous le bras ✓.
4. Cinq : remplissage resté rouge franc en contre-jour (le surcroît de lumière le blanchissait : retiré) ; usine du fond allégée ; lave-vaisselle allégé (sans cuve, verres au fond).
5. Une : sous le bras, dans l'axe — le moyeu en éclipse sur le halo, le bras en barre, les jets en pointillés verts : la rotation se lit, la caméra peut rouler avec.

## Poses qui cadrent (vues sur planche)
- **Première image (a3)**, colonnes en contre-jour derrière la cheminée : `{ tx: -700, ty: 1350, tz: 0, d: 2700, az: 108, el: -18, fov: 56, shift: 20, side: 0, roll: 0, drift: 0, dof: 0 }` (les colonnes tombent entre y ≈ 1120 et 1680 : monter `shift` si les sous-titres les couvrent).
- **Compresseur** (image 1) : `{ tx: -1650, ty: 260, tz: 1250, d: 2400, az: 25, el: 12, fov: 34, shift: 60, side: 0, roll: 0, drift: 0.3, dof: 0 }`.
- **Colonnes** : `VIEW.columns` tel quel ✓ (fantômes aussi).
- **Usine entière sous la flamme** (image 8) : `{ tx: -1500, ty: 1700, tz: 0, d: 9000, az: -62, el: 7, fov: 40, shift: 60, side: 0, roll: 0, drift: 0.3, dof: 0 }`.
- **Fenêtre** : `VIEW.pane` tel quel ✓. **Lave-vaisselle** : `VIEW.washer` tel quel (lisible, chargé).
- **Sous le bras** (boucle) : `{ tx: 0, ty: 52, tz: 24000, d: 30, az: -30, el: -84, fov: 64, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 }`.

## Pas encore au niveau
- Lave-vaisselle vu de trois quarts : se lit (porte, poignée, assiettes, bras, jets) mais reste un dessin chargé ; le bras haut se perd un peu dans la caisse.
- Sous le bras : le bras est **sombre sur halo** (règle « sombre sur un halo »), pas « clair sur le fond » comme le demandait la fiche.
- Le fond derrière le compresseur (usine du fond) reste un peu fourni en traits dans le haut du cadre (sous l'en-tête et la zone haute).
- Le reflet de la vitre (`pane`) ne se voit pas à 270 px.

## À changer ailleurs
- `episodes/046-torchere/src/world.js` → `POSE0` (et la candidate (a) de `.cache/planches/046/premiere-image.json`) : `{ tx: -700, ty: 1350, tz: 0, d: 2700, az: 108, el: -18, fov: 56, shift: 20, side: 0, roll: 0, drift: 0, dof: 0 }` — la (a) d'origine (az 156) laisse les trois colonnes hors du cadre.
- `world.js` → `VIEW.compressor` : `{ ...P, tx: COMPRESSOR.at[0] - 150, ty: 260, tz: COMPRESSOR.at[2], d: 2400, az: 25, el: 12, fov: 34, shift: 60 }`.
- `world.js` → `VIEW.flare` : `{ ...P, tx: -1500, ty: 1700, tz: 0, d: 9000, az: -62, el: 7, fov: 40, shift: 60 }`.
- `world.js` → `VIEW.washerArm` : `{ ...P, tx: TEASER.at[0], ty: TEASER.arm.y, tz: TEASER.at[2], d: 30, az: -30, el: -84, fov: 64, shift: 0 }` — celle d'origine (d 60, el −55) met la caméra dans le plan de la porte, au ras du sol, derrière le panier bas.
- `plan.js` (facultatif, cohérence) : `COMPRESSOR.motor: [-1985, 1250]` (c'est là qu'il est dessiné ; `A.motor` suit la boîte à bornes).
- `docs/catalogue-notes.json` : `046/raffinerie.js` — raffinerie aux rayons X au crépuscule (colonnes qui se remplissent de signal, ciel de contre-jour lu depuis la caméra, compresseur plein à fenêtre, fantômes explosion / nuage, fenêtre d'appartement, lave-vaisselle de verre à bras pleins et jets) ; options : `press`, `rotor`/`hum`/`spark`, `blast`, `cloud`, `pane`, `teaser`/`arm`/`jets`.

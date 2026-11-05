# 036 · `src/model.js` — journal du décor (le système)

## Ce qui est construit (4 planches + 1, `.cache/planches/036/model/`)

- **Le moyeu** : une fonte en étoile (corps en triangle arrondi autour de l'axe, trois cols coniques jusqu'aux roulements), **chaque col ouvert d'une grande fenêtre de fonderie côté vent** (±74° autour de +z, faces de coupe claires). Le bouchon en sphère pleine n'existe plus : depuis toutes les poses de travail (az H−30 à H−70), on voit dedans.
- **Par pale, dans son col** : le **moteur de pas** (côté +x : moteur à ailettes, bande veille, réducteur, bride) et son **pignon** qui dépasse sous la jupe dentée de la bague intérieure du roulement (denture intérieure, 120 dents) ; une dent claire et un collier mi-clair mi-sombre sous le pignon montrent qu'il tourne ; un ergot clair sous la jupe tourne avec la pale. Le **coffret de batteries** (côté −x, face au vent) : 18 blocs au plomb (3 × 6, deux bornes chacun), une jauge de six segments sur sa face, une lueur qui a un endroit. Le **pied de pale** plein, boulonné (36 écrous) sur sa couronne, un carénage clair sur son bord d'attaque ; sur l'établi il est coupé court (× 0,45), sa coupe claire.
- **Dans la nacelle** : générateur annulaire (stator à nervures, étoile de support ; rotor à 72 pôles qui tourne avec le moyeu, sans multiplicateur, sa jante), étrier du frein à cheval sur la jante (froid, encre), châssis en col de cygne + axe fixe, couronne d'orientation dentée et ses six moteurs, anémomètre et girouette sur le toit (suivent le capot).
- **De verre** : le capot (l'œuf d'Enercon) et le cône (`asShell`, ordre 20 et 22), le haut du mât (établi seul, ordre 18).
- De loin (POSE0), une **balise** veille par coffret, dessinée à travers la fonte et qui s'éteint dès qu'elle serait plus grosse qu'un point : `batt` 1 fait un point vert sur le moyeu à 130 m (vérifié).

## L'état, chez moi

`bench` (le haut du mât de verre, les pieds coupés) · `cover` (`uAmount` du capot et du cône) · `rotor` (moyeu ET rotor du générateur tournent ensemble) · `rpm` rien · `pitchA/B/C` (bague intérieure, pied, ergot ; pignon × 6) · `explode` (établi : capot +700 en y, moyeu +260 y / +170 z, pieds +230 le long de leur pale, moteurs et coffrets qui sortent vers le vent ; générateur, châssis, mât restent) · `batt` (bornes, jauge, lueur, balise) · `charge` (segments allumés = charge × 6 ; signal sous 0,5 : bornes, jauge, lueur) · `motors` (la bande veille des trois moteurs) · `heart` (tout le reste s'assombrit à 28 %, le coffret A garde ses matières) · `lit*` (émissif veille faible + arêtes teintées ; `litMast` teinte aussi le verre du mât, `litNacelle` celui du capot ; `litBrake` en encre).

Rapport du pignon : **6** (et non ≈ 10) — 30° de pas = un demi-tour de pignon, lisible d'une image à l'autre ; rien ne se dit.

## Les poses qui cadrent (rotor 0, pale A en haut)

Vérifiées : `battery` (d 420, el 16, shift 160 : coffret, blocs, jauge pleine verte puis 2 segments signal — se lit à 270 px) · `whole` (az H−55, el 26, side 110 : mât, œuf, anneau, moyeu, pieds) · `system` (az H−60, el 28 : moyeu, pieds, deux coffrets verts, anneau ; cover 1 et 0,3) · `root` (inchangée) · `hook` (le point vert).
Calculées, PAS vérifiées sur planche (budget d'images dépassé) : `motor`, `exploded`, `brake`, couverture — voir ci-dessous.

## À changer ailleurs

`src/plan.js` (VIEW.motor et VIEW.battery en dérivent) :
```
export const PITCH = { at: [48.5, -100, 54], motor: { r: 22, len: 50 }, gear: { r: 19, len: 28 }, pinion: { r: 14.5 } };
export const BATTERY = { at: [-56, -80, 49], size: [62, 82, 32], cells: 18 };
```
`src/world.js` → `VIEW` :
```
  system: { ...P, tx: HX, ty: HY, tz: HZ, d: 2600, az: H - 60, el: 28, fov: 32, shift: 120 },
  whole: { ...P, tx: CENTRE[0], ty: CENTRE[1], tz: CENTRE[2], d: 3400, az: H - 55, el: 26, fov: 32, shift: 150, side: 110 },
  exploded: { ...P, tx: CENTRE[0], ty: CENTRE[1] + 250, tz: CENTRE[2], d: 4000, az: H - 25, el: 24, fov: 32, shift: -40, side: 170 },
  motor: { ...P, ...CLOSE, ...T(PITCH.at[0], 250 + BEARING.r + PITCH.at[1], 380 + PITCH.at[2]), d: 640, az: H - 60, el: -10, shift: 0 },
  battery: { ...P, ...CLOSE, ...T(BATTERY.at[0], 250 + BEARING.r + BATTERY.at[1], 380 + BATTERY.at[2]), d: 420, az: H - 30, el: 16, shift: 160 },
  brake: { ...P, ...CLOSE, ...T(-74, 47, GENERATOR.z + GENERATOR.depth / 2 + 11), d: 460, az: H - 70, el: 10, shift: 0 },
```
`episode.json` → `cover` (éclaté, `heart` 1, `batt` 1) : pose de départ `{ tx: -421, ty: 8060, tz: 354, d: 3600, az: -75, el: 30, fov: 32, shift: -250, side: 100, dof: 0 }` (non vérifiée).

## Ce qui n'est pas au niveau

- **Moteur** : à el +26 le pignon est caché par la bague (denture intérieure) ; à el −10 il sort sous la jupe, mais la planche avec la nouvelle visée (PITCH.at y −100) n'a pas été tirée. À vérifier par l'acte 2 : pas 0 puis 30, le collier clair doit avoir changé de côté.
- **Éclaté** : lisible mais touffu (le pied C vient vers la caméra) ; à shift 60 / side 100, le haut de l'œuf frôlait l'en-tête et un coffret entrait dans la zone des boutons — corrigé par le calcul (shift −40, side 170), pas revu.
- **Frein** : la première visée (T(0, 20, 120)) tombait à 70 cm de l'étrier ; la nouvelle vise l'étrier, non revue.
- Images lues : 38 vignettes (5 planches) — au-dessus des 30.

## Catalogue

`036-eolienne/src/model.js` — haut d'éolienne type Enercon ouvert : moyeu en étoile à fenêtres, par pale moteur de pas + pignon dans la couronne dentée + coffret de 18 batteries à jauge, générateur annulaire sans multiplicateur, frein froid, capot œuf et cône de verre ; état `bench cover rotor pitchA/B/C explode batt charge motors heart lit*`.

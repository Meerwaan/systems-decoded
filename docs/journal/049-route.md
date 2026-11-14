# 049 · route.js — journal

Décor : enveloppe de `025/route.js` (importé tel quel, jamais modifié) + carrefour, champ, fossé, support, panneau, trait de lumière.

## Ce qui est fait (14/11)

- **Carrefour en T, pas en croix** : le shader de la route du 025 est patché *sur notre instance* (la chaîne `fragmentShader`, avant compilation : le fichier du 025 n'est pas touché) — `discard` pour `s < NOSE` (dans les coordonnées de la route, le bord proche du carrefour est toujours à s = NOSE) et pour x > 435 (le champ remplace la grille à droite du fossé). Si le 025 changeait son shader, un `console.warn` le dit et le carrefour se dessine sur une route non coupée.
- **Un sol à nous** dans `frame` (un seul shader, mêmes grilles alignées sur le même s, mêmes phares) : route qui croise (deux voies, lignes de rive, axe en tirets, bouche de ta route, ligne de cédez-le-passage en tirets sur ta voie), bas-côté lointain, champ labouré à droite et au-delà de la haie (sillons LE LONG de ta route, 90 cm : rien de fin ne défile en travers), fossé `signal` (lèvre extérieure forte, intérieure plus faible, un peu de lumière), branches.
- **Branches** : une tête de lumière `ink` part de ta voie, tourne (quart de cercle) et file 52 m le long de la voie qu'on prendrait (gauche = voie lointaine z −450, droite = voie proche z −150), toutes les 1,7 s ; un fil faible reste allumé. Dépend de `time` et de `branchL/R` (amplitude) : robuste à n'importe quelle interpolation.
- **Le bois du 025 caché** (le 025 le réaffiche à chaque `update` : on le recache après). Ses balises J6, panneau et borne au-delà du carrefour sont cachés.
- **Haie de verre** (masses basses qui se chevauchent, petites bosses dessus) au-delà du bas-côté lointain.
- **Panneau** : deux panneaux-flèches (gauche en haut, droite en bas) sur deux poteaux, face blanche qui monte dans tes phares (`beamAt`), flèche sombre, aucun texte.
- **Support** : berceau, mâchoires et lèvres, pieds, boule, tige jusqu'à une ventouse sur la planche de bord du 025 (dessus ≈ y 97) — verre + arêtes, comme la voiture.
- **Trait de lumière** : tube `veille` au-dessus de la route (y 9 m), jamais plus fin que ≈ 10 px, plus clair vers sa tête ; tête = lumière qui a un endroit (cœur + halo, ≥ 34 px). Déroulé exponentiel : 4 m à 0, ≈ 190 m à 0,5, 4 km à 1.

## Ce qui a raté

- Planche 1 : le bois du 025 revenait (son `update` remet `visible`) ; sillons trop faibles ; trait invisible (vu dans l'axe, la « face » d'un cylindre est nulle partout → profil calculé sur la vue privée de sa composante le long de l'axe) ; les poses du bouchon ne cadraient pas le carrefour (il est à `eta × 19,4 m` : 116 m à l'image 0).
- Planches 2-3 : le carrefour existe mais à 116 m (act 1 : `eta` 6 → 4,6) les phares ne l'atteignent pas → la rive lointaine garde un peu de lumière (lisible de loin). Le trait à 9 m de haut (plan.js) : vu de derrière la voiture, un laser qui monte au ciel ; à 2,6 m il se couche sur l'horizon (caméra chase à 2,5 m) → **4,5 m**, départ −6 m, et il sort du noir sur ses 32 premiers mètres (rien de clair ne monte dans l'en-tête).
- Le hook ne voit pas le trait : il regarde 22° à gauche de l'axe (le téléphone) ; normal.

## Les poses qui cadrent (vérifiées sur planche ; le carrefour est à `−235 − 1944·eta` cm en z voiture)

- `hook` : POSE0 tel quel ; rien de clair derrière l'écran (eta 5,9).
- `chase` (eta 4,6–5 : la haie au bout, la voiture en bas à droite, le fossé signal) : `{ ...P, tx: 0, ty: 110, tz: -1500, d: 2200, az: -3, el: 5, fov: 34, shift: 250 }`
- `plunge` : VIEW.plunge tel quel (eta 4,6 : voiture, voie, fossé, sillons ; FIELD_FIX dans le champ).
- `climax` (eta 1,5 : le T en haut, la voiture en bas, axe vertical) : vérifié `{ tx: 250, tz: -1900, d: 5600, az: -12, el: 62, fov: 40, shift: 0 }` (voiture au ras du bas) → proposé `d: 7000, shift: 100` (non revu).
- `branches` (eta 0,6, branchL puis branchR) : `{ ...P, tx: 0, ty: 0, tz: -1300, d: 2600, az: -10, el: 34, fov: 40, shift: 100 }`
- `sign` (eta 1,2, sign 1) : `{ ...P, tx: 0, ty: 170, tz: -2800, d: 1500, az: -6, el: 1, fov: 30, shift: 40 }` — à un autre eta : `tz ≈ −995 − 1944·eta + 1700`.
- `streak` (0,5 puis 1) : la pose `chase` ci-dessus ; à 1 la tête s'éteint à l'horizon.

## À changer ailleurs

- `src/plan.js` : `export const STREAK = { y: 450, from: -600, to: -400000 };` (route.js l'applique déjà dans sa constante `STROKE` ; une fois plan.js aligné, `STROKE` peut redevenir `STREAK`).
- `src/world.js` → `VIEW` :
  - `chase: { ...P, tx: 0, ty: 110, tz: -1500, d: 2200, az: -3, el: 5, fov: 34, shift: 250 },`
  - `climax: { ...P, tx: 250, ty: 0, tz: -1900, d: 7000, az: -12, el: 62, fov: 40, shift: 100 },`
  - `sign: { ...P, tx: 0, ty: 170, tz: -2800, d: 1500, az: -6, el: 1, fov: 30, shift: 40 },`
  - ajouter `branches: { ...P, tx: 0, ty: 0, tz: -1300, d: 2600, az: -10, el: 34, fov: 40, shift: 100 },`

## Pas encore au niveau (franchement)

- À 100 m (tout l'acte 1), le carrefour n'est qu'une haie à l'horizon et un trait de rive : il se lit, il ne frappe pas. Un acte qui veut « le T devant » doit le montrer à eta ≲ 2.
- `climax` à d 7000 non revu (budget d'images épuisé : 30/30). Le point bleu bleu-rectangle vu en plongée vient du bouchon de satellite.js, pas d'ici.
- La haie de verre : correcte en fond, un peu « boules » de près.
- Le fossé signal est franc (deux lèvres + lueur) : si le plan le trouve trop fort, `ditch` 0,6.

`npm run check -- 049` passe. Images lues : 30.

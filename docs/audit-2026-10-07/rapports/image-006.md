# Audit image — DOSSIER 006 · Défibrillateur (plan par plan)

Film audité : `renders/006-defibrillateur.mp4` (85,5 s, 1080×1920, non publié).
Regardé : les 11 planches denses `frames/006/film_01…11.jpg` (2 images/s, vignettes 270 px), les planches d'accroche `hook_01` et `hook_04`, 67 images pleine résolution extraites dans ce dossier (`f_<instant>.png`, bandes `strip_*.jpg`), le minutage `timing/script_006.txt`, et le code : `episodes/006-defibrillateur/src/main.js`, `hall.js`, `heart.js`, `model.js`, `index.html`, `kit/lib/figure.js`, `kit/lib/build3d.js` (verre), `kit/lib/atmo.js`, `kit/brand.css` (zones).

Limite de l'audit : lecture seule, aucun `look` lancé. Les **diagnostics** sont vus à l'image et mesurés ; les **poses de caméra proposées** sont calculées à partir des poses existantes et de la géométrie du décor, pas essayées : chacune est donnée avec les instants à passer au `look` avant de rendre. Rien ici ne change un mot dit : aucune reprise de voix.

Convention de pose (`kit/lib/stage.js:229`) : `shift` = pixels dont l'image est **poussée vers le haut**, `side` = vers la gauche. À `fov` 28, la hauteur du cadre vaut 0,4987 × `d` cm.

---

## 1. L'étalon : les trois meilleurs plans

| Plan | Instants | Pourquoi c'est le niveau à tenir |
| --- | --- | --- |
| **« Et une puce… qui écoute »** | 29,8 → 31,5 s (`f_30.60.png`, `strip_a.jpg` vignette 4) | Un seul sujet, grand, clair sur fond sombre ; les anneaux veille montrent le verbe (« écoute ») ; le couvercle s'est effacé pour le laisser voir ; profondeur réelle (batterie et condensateur dessous). Lisible à 270 px sans légende. |
| **« Voyant vert : prête »** | 35,0 → 36,8 s (`f_35.60.png`) | Le seul plan du film qui ressemble à un packshot de studio : trois quarts, reflets sur le vernis, arêtes fines, voyant qui respire, halo au sol. C'est ça, « de la vraie 3D éclairée comme en studio ». |
| **La chute** | 55,5 → 61,5 s (`f_57.00.png`, `f_60.20.png`) | Le cœur est **à l'endroit** (pointe en bas, vaisseaux en haut) : on le reconnaît en un quart de seconde. Deux électrodes, un cœur entre elles, tout a changé de couleur, le titre se barre. Une idée, une image. |

Mention : « un condensateur » (28,5 → 29,4 s, `strip_c.jpg` vignette 3) — ce qui s'allume dit de quel mot on parle ; et « elle refuse » (62,9 → 65,6 s, `f_63.50.png`).

Ce que ces plans ont en commun et que les plans faibles n'ont pas : **un objet plein, de trois quarts, sur un halo ; rien de translucide empilé devant lui ; le sujet occupe plus de 40 % de la largeur.**

## 2. Ce qui marche et qu'il ne faut pas casser

- La **boîte verte comme fil visuel** : première image, B de l'accroche, « savoir où elle est », « Toi », rebouclage. La lueur veille se lit même réduite à 7 px.
- La **couleur raconte** : signal → encre → veille, le compteur « chances » qui passe au vert au premier battement, le tracé partagé par l'image et le son.
- La **zone haute** partagée au dixième de seconde : un seul panneau à la fois, tout est sorti avant chaque coupe. Aucun chevauchement de panneaux relevé sur 85 s.
- Le **premier acte en un mouvement** (chute → boîte → recul → plongée) : l'idée est la bonne, il faut seulement la nettoyer (figurants, tirets, voir plan 9).
- Le **même modèle dans les deux décors** (boîte au mur, établi, sol du hall) et le raccord boîte → établi à 24,9 s.
- Le **tracé ECG** : le panneau le plus utile du film, il apporte ce que l'image ne peut pas montrer.

---

## 3. Les douze plans faibles, du plus rentable au moins rentable

### Plan 1 — Le choc, l'extinction, le redémarrage : le cœur est filmé à l'envers (40,3 → 55,5 s)

**Preuves** : `f_41.50.png` (« elle lit le cœur »), `f_45.50.png` (« plus de 1 000 V »), `f_48.50.png` (« traverse le cœur »), `f_50.50.png` (« en même temps »), `f_53.40.png` (« et le cœur repart ») — à comparer à `f_57.00.png` (chute).

**Ce qu'on voit** : sur les quatre cadres du climax (READ, SHOCK, INSIDE, puis le recul de « repart »), la caméra est du côté de la tête (`az` −96, −104, −86, −74). À l'écran la tête de la victime est **en bas**, donc le cœur a la **pointe en haut** et ses vaisseaux pendent dessous. Résultat : pendant les 15 secondes les plus importantes du film, le sujet se lit comme un bulbe, un gland, « un sac noué » — pas comme un cœur. À 50,5 s (« en même temps », « silence… ») c'est un volume gris-brun mat avec un bretzel dessous. À 53,4 s, le moment le plus émouvant du film, c'est une fraise vert menthe.
La preuve que c'est l'orientation : 2 secondes plus tard, à la chute (`CALM`, `az` 88), le même cœur, même matière, se reconnaît immédiatement.
Deuxième conséquence : CLAUDE.md décrit la chute comme « le même cadre que le choc, où tout a changé de couleur ». Dans le film rendu ce n'est pas le même cadre : il est retourné de 180°. L'effet voulu (même image, autre couleur) n'a pas lieu.
Troisième conséquence : vus de la tête, les deux câbles gris traversent toute l'image **devant** le cœur (`f_45.50.png` : de (270, 590) à (800, 1900)) ; vus des pieds ils sortent par le haut (`f_57.00.png`).

**Correctif** — `main.js`, quatre poses ; l'angle « tête en haut » est déjà éprouvé avec les deux aidants dans le champ (plans `CHEST` 37,0 s et `CALM` 55,5 s) :

```js
// main.js:311  « dix secondes : elle lit le cœur »
const READ = { tx: X + SPOT.heart.x + 3, ty: 13, tz: -3.4, d: 140, az: 84, el: 68, fov: 28, shift: -80, side: 0 };
shot(t.analyse - 0.12, toButton - t.analyse, { d: 124, az: 94 }, "sine.inOut");            // main.js:313

// main.js:329  le choc : exactement le cadre de la chute (définir CALM avant, ou sortir la pose en constante commune)
const HEARTFRAME = { tx: X + SPOT.chest.x + 1, ty: 18, tz: -1, d: 180, az: 88, el: 62, fov: 28, shift: -60, side: 0 };
const SHOCK = HEARTFRAME;                                                                    // remplace az: -104
shot(toShock, t.eteint - toShock - 0.2, { d: 150, az: 80 }, "sine.inOut");                   // main.js:342

// main.js:345  dans le cœur
const INSIDE = { tx: X + SPOT.heart.x, ty: SPOT.heart.y + 1, tz: SPOT.heart.z, d: 76, az: 84, el: 64, fov: 28, shift: -70, side: 0 };

// main.js:358  « silence… et le cœur repart »
shot(t.repart - 0.1, t.chute - t.repart, { d: 84, az: 94, el: 56 }, "sine.inOut");

// main.js:367  la chute : la même constante
const CALM = HEARTFRAME;
```

Vérifier au `look` : `--at 41.5,44.3,45.5,48.5,50.5,53.4,57` (les sept images sur une ligne : le cœur doit avoir la même orientation partout, et 44,3 / 57 doivent se superposer).
Règle à en tirer pour 007 et suivants : **l'organe ou la pièce-héros a un angle canonique ; chaque fois qu'on y revient, c'est sous cet angle** — seule la couleur change.

Effort S (< 1 h avec le `look`). Impact 5.

### Plan 2 — La première image et les 4 secondes d'accroche (0,0 → 4,3 s ; revient à 84,1 → 85,5 s)

**Preuves** : `f_0.00.png`, `f_2.50.png`, `hook_01.jpg`, `strip_e.jpg` vignette 1 (1,2 s), `f_84.60.png`.

**Ce qu'on voit** :
1. **Image 1** (`f_0.00.png`) : le personnage est pris à `collapse: 0.5` — hanches descendues de 36 cm, pieds plantés, genoux pliés vers l'avant, tronc penché de 31°, les deux bras qui pendent. Vu de face (il tombe **vers** la caméra, `az` −70), cela se lit « mannequin assis sur un tabouret invisible », pieds qui ne touchent pas le sol (le verre ne porte pas d'ombre ; la seule ombre, celle de la tête, tombe 200 px à gauche). Ce n'est pas « quelqu'un s'effondre ». Or c'est l'image que le pouce voit, et celle sur laquelle le film reboucle.
2. Le personnage fait 510 px de haut (y 620 → 1130), 27 % de l'image ; la boîte verte fait 30 × 60 px (7 × 15 px sur une vignette de 270) ; les 370 px du bas sont noirs.
3. **De 0,9 à 4,3 s le cadre ne bouge presque pas** (`film_01.jpg`, vignettes 2 à 9 : huit images quasi identiques). La pose glisse de `az` −70 à −60 en 4 s. Sur « son cœur ne pompe plus » (3,0 → 3,7 s) le cœur fait ≈ 80 px et il est à moitié caché par la tête.
4. **La boule crème de la tête est l'objet le plus lumineux du cadre** (luma moyenne 166, contre 132 pour le cœur, mesure sur `f_2.50.png`) et quatre fois plus grosse que lui.
5. Entre ≈ 1,0 et 2,3 s, cette boule passe **sur** la première ligne de la carte d'accroche (« QUELQU'UN S'EFFONDRE », `strip_e.jpg` vignette 1) : le corps couché est à y 950 → 1 260, la zone des cartes commence à 1 186.

**Correctif** :

a) *La pose de chute* — `hall.js:340-358`. Deux signes universels manquent : la main au cœur, et l'asymétrie.

```js
// hall.js:348  le tronc part aussi de côté : une chute, pas une assise
victim.lean(-12 * Math.sin(Math.PI * clamp01(c / 0.9)), 16 * Math.sin(Math.PI * clamp01(c / 0.8)), 0);
// hall.js:350-357  jambes : un genou cède vers l'intérieur ; bras : la main droite au cœur, le gauche qui part
const grab = 1 - smooth(0.55, 0.92, c);                       // la main lâche la poitrine quand le corps touche le sol
for (const s of ["L", "R"]) {
  const side = s === "L" ? 1 : -1;
  const local = toLocal(victim, planted[s]);
  local.lerp(tmp.set(side * 9.5, 8, 0), straight);
  victim.leg(s, local, tmp2.set(s === "L" ? 0.1 : -0.75, 0, 1));          // le genou droit rentre
  const lying = tmp.set(side * lerp(20.5, 44, smooth(0.2, 1, c)), lerp(92, 112, c), lerp(3, -7.5, smooth(0.3, 1, c)));  // au sol : bras écartés du tronc
  if (s === "R") lying.lerp(tmp3.set(-3, 129, 13), grab);                 // main droite sur le sternum
  else lying.y += 26 * Math.sin(Math.PI * clamp01(c / 0.8));              // bras gauche projeté
  victim.reach(s, lying);
}
```
Les bras écartés à l'arrivée (x 31 → 44, y 99 → 112) servent trois autres plans : la silhouette couchée se lit mieux d'en haut (10,3 s), le bras ne barre plus le gros plan du cœur (plan 5), le flanc est dégagé pour la seconde électrode.

b) *Le départ* — `main.js:54` : essayer `collapse` 0,44 / 0,5 / 0,58 avec la nouvelle pose (trois images au `look`, `--at 0.04`), garder celle où la diagonale du corps se lit sans le son.

c) *La boîte, plus présente dès l'image 1* — `main.js:57` : `beacon: 1.4 → 2.0`, `far: 1 → 1.6` (halo 0,42 × 2,0 × 1,6 = 1,34 : sous le seuil où « ça bave »).

d) *Un vrai mouvement pendant l'accroche, vers le cœur* — `main.js:169` :

```js
// arrive sur la poitrine pour « son cœur ne pompe plus » ; le corps remonte hors de la zone des cartes
shot(0, t.pompe - 0.1, { tx: X - 44, ty: 16, tz: -2, d: 235, az: -48, el: 26, fov: 44, shift: 215, side: 0 }, "sine.inOut");
```
À `fov` 44 et `d` 235, le cadre fait 190 cm de haut (10 px/cm) : la poitrine tient la largeur, le cœur passe de ≈ 80 à ≈ 130 px, le corps est centré vers y 745 — hors des cartes (1 186+). Le départ vers la boîte (`BOXWIDE`, `az` −81) tourne alors de 33° en 1,5 s : sans risque. Essayer au `look` `--file` : `d` 235 / 190 × `az` −48 / −36 à 3,3 s.

e) *La tête ne doit plus être la vedette* — `hall.js`, après la ligne 216 : `victim.flesh.color.multiplyScalar(0.62);` (la tête reste pleine, donc « une personne », mais passe sous le cœur en luminosité).

Effort M. Impact 5 : c'est l'image qui décide si on reste.

### Plan 3 — La boîte en gros plan : la carte d'accroche écrite sur le sujet, et un trait qui coupe l'image (6,2 → 8,5 s ; 23,3 → 24,9 s ; 80,7 → 84,1 s)

**Preuves** : `strip_a.jpg` vignette 1 (8,6 s), `f_7.60.png`, `f_23.60.png`, `f_24.60.png`, `f_82.00.png`.

**Ce qu'on voit** :
1. `BOXCLOSE` (`d` 210, `shift` 40) : l'armoire (50 cm) fait 917 px de haut et descend jusqu'à **y ≈ 1 530**. La carte B de l'accroche (1 186 → 1 542) est donc écrite **sur le fond lumineux de l'armoire** : à 8,6 s, « PAS TE TROMPER » (veille) est posé sur du veille, et le texte recouvre la moitié basse de l'appareil, bouton compris. C'est la phrase B de la méthode ABC.
2. Même défaut à 23,6 s : le sous-titre « LA BOÎTE » (veille) sur le fond vert de l'armoire.
3. **Un pilastre du mur passe exactement derrière la boîte** : `X0 = -1500`, pas de 300 → un trait à x = 3 000 = `BOX.x` (`hall.js:107`). À l'image, c'est un fil blanc vertical sur toute la hauteur, à travers l'enseigne, l'armoire, le sous-titre (« C'EST », « DEMAIN ») et jusqu'en bas (`f_7.60.png`, `f_23.60.png`, `f_82.00.png`). Le genre de détail qu'un studio ne laisse pas.
4. La porte s'ouvre de 109° en 0,75 s (145°/s) : ses arêtes lumineuses, moyennées sur 16 instants, laissent un **rideau de bandes verticales** (`f_24.60.png`, x 530 → 615, y 690 → 1 820).
5. La main de TOI est un **galet crème** qui flotte devant le montant (`f_23.60.png`, `f_24.60.png`) : voir plan 10.

**Correctif** :

```js
// main.js:172  l'armoire tient dans la zone du sujet (700 px de haut, de y 445 à 1 145)
const BOXCLOSE = { tx: X + BOX.x, ty: BOX.y + 12, tz: BOX.z, d: 275, az: -16, el: 3, fov: 28, shift: 165, side: 0 };
// main.js:243-244  « la boîte » : même règle
cut(toBox, IN_HALL, { ...BOXCLOSE, d: 340, az: -20 }, { toi: 3, far: 0.1, route: 0, halo: 0, beacon: 1, sign: 0.12 });
shot(toBox, toBench - toBox, { d: 280, az: -12 }, "sine.inOut");
// main.js:421  le rebouclage part déjà de BOXCLOSE : garder shift: -60 seulement si la boîte reste au-dessus de 1 160

// hall.js:107  la boîte entre deux pilastres, pas sur l'un d'eux
for (let x = X0 + 150; x <= X1; x += 300) {

// main.js:245 + hall.js:501  la porte : moins loin, plus longtemps
st(t.laBoite + 0.2, toBench - t.laBoite - 0.2, { door: 1 }, "power2.inOut");   // ≈ 1,3 s au lieu de 0,75
hinge.rotation.y = -1.15 * S.door;                                              // 66° suffisent pour dire « ouverte » : 50°/s
```
Le raccord vers l'établi (24,9 s) repose sur « même objet, même place à l'écran » : après le changement de `shift`, recaler la pose d'arrivée de `main.js:250` (`shift: 150 → 165`) et vérifier `--at 24.85,24.95`.
Vérifier aussi `--at 0.04` : décaler les pilastres change les verticales de la première image.

Effort S. Impact 4 (la phrase B se lit ; un défaut visible trois fois disparaît).

### Plan 4 — Quatre étiquettes tombent dans les zones de TikTok

Mesuré en pleine résolution ; zones de CLAUDE.md : rognage ≈ 53 px de chaque côté, `--safe-l` 88, boutons à x > 905 de y 880 à 1 760.

| Élément | Instants | Où il est | Défaut | Correctif |
| --- | --- | --- | --- | --- |
| `#chip-flow` « SANG POMPÉ **0 L/MIN** » | 14,3 → 15,9 s (`strip_e.jpg` vignette 3) | x 597 → 1 010, y 1 200 → 1 275 | la valeur « L/MIN » est **sous les boutons** | `main.js:201` : `follow("chip-flow", null, 96, 770)` (place fixe sous le panneau ECG, à gauche) |
| `#chip-ready` « BOUTON **VERROUILLÉ** » | 63,2 → 65,6 s (`f_63.50.png`) | x 545 → 955, y 1 165 → 1 233 | les deux dernières lettres sous les boutons | `main.js:384` : `follow("chip-ready", hall.A.aed, -70, 150)` |
| `#chip-call` « LE 15 EN LIGNE » | 21,0 → 22,3 s (`f_21.80.png`) | bord gauche à **x = 23** | « LE » dans la bande rognée | `main.js:228` : `follow("chip-call", hall.A.phone, -250, -40)` |
| Légendes « LIRE, PUIS CHOQUER » et « ELLE SEULE DÉCIDE » | 26,6 → 27,2 s ; 29,8 → 31,5 s (`crop_left.png`) | début du texte à **x = 27** et **x = 38** | premières lettres rognées, sous `--safe-l` | `main.js:257` `x: 300 → 372` ; `:263` `300 → 330` ; `:268` `330 → 352` ; `:277` `300 → 356` |

Et un garde-fou pour le pipeline : `npm run check` contrôle le contraste, pas les marges. Un test de 20 lignes dans le lint (pour chaque `.chip`, `.co`, `.say` visible à un instant échantillonné : `getBoundingClientRect()` contre `--safe-l` et la colonne des boutons) aurait attrapé les quatre.

Effort S. Impact 3.

### Plan 5 — « Elle parle : ne touchez pas le patient » : noir sur noir, et le geste est hors champ (38,3 → 40,3 s) ; « elle charge » (42,6 → 43,9 s)

**Preuves** : `f_39.60.png`, `strip_b.jpg` vignettes 1-2, `f_43.60.png`.

**Ce qu'on voit** :
- `DEVICE` : le boîtier est noir sur un sol noir-rouge. Luma du flanc 25, du fond voisin 22 (mesure sur `f_39.60.png`). Il occupe 450 × 400 px ; 80 % de l'image est vide. Seuls les anneaux du haut-parleur se lisent. C'est exactement la règle « jamais sombre sur sombre », et le système vivant n'a pas son halo.
- La phrase dit « ne touchez pas le patient ». Le film fait bien lever les mains (`main.js:308` : `push: 0, off: 1`) — **hors champ**. La démonstration de la phrase existe et on ne la montre pas.
- `BUTTON` : le voyant vert est **caché sous le bord bas du panneau ECG** (`f_43.60.png`, lueur à (420, 700), panneau jusqu'à y 718). Ce qui charge ne se voit pas : seul un nombre bouge, le bouton reste terne jusqu'aux 0,25 dernière seconde.

**Correctif** :

```js
// hall.js, après la ligne 98 : l'appareil posé au sol a son halo veille (il sépare aussi le système de l'ambiance signal)
fx.poolBox = makePool({ radius: 85, color: BRAND.veille });
fx.poolBox.mesh.position.set(SPOT.floorBox.x, 0.7, SPOT.floorBox.z);
group.add(fx.poolBox.mesh);
// hall.js, dans update() près de la ligne 542
fx.poolBox.uniforms.uAmount.value = S.boxAt > 0.5 ? (S.boxPool ?? 0) : 0;
// main.js : boxPool: 0 dans FIRST (ligne 59) ; 0.26 sur les coupes DEVICE (301), BUTTON (320) et « refuse » (379) ; 0 ailleurs

// main.js:300  un seul cadre qui tient l'appareil qui parle (premier plan gauche) ET les quatre mains qui se lèvent (fond droit)
const DEVICE = { tx: X - 90, ty: 15, tz: 28, d: 240, az: -56, el: 17, fov: 34, shift: 70, side: 0 };
cut(t.parle - 0.12, IN_HALL, { ...DEVICE, d: 265, az: -62 });
shot(t.parle - 0.12, t.analyse - t.parle, DEVICE, "sine.inOut");
```
La pose `DEVICE` est à caler au `look` (`--at 38.6,39.3,39.9`, quatre azimuts −70 / −56 / −40 / −25) : l'appareil doit rester le plus grand objet, les mains doivent quitter la poitrine dans le tiers droit, au-dessus de y 1 160.

Pour « elle charge » : `main.js:319` `shift: 40 → -110` et `d: 118 → 150` (l'appareil sort de sous le panneau), et une jauge qui montre le verbe —

```js
// model.js, après la ligne 173 : douze repères autour du bouton, qui s'allument un à un avec la charge
fx.gauge = Array.from({ length: 12 }, (_, i) => {
  const a = (i / 12) * Math.PI * 2;
  const mat = glow(BRAND.signal, 0);
  const tick = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.18, 1.0), mat);
  tick.position.set(5.0 + 3.7 * Math.sin(a), 10.92, 3.2 - 3.7 * Math.cos(a));
  tick.rotation.y = -a;
  lid.add(tick);
  lid.userData.part.mats.add(mat);          // inscrit dans les matières du couvercle (règle du bouton qui flotte)
  return mat;
});
// model.js, dans pose() : fx.gauge.forEach((m, i) => m.color.copy(SIGNAL).multiplyScalar(1.7 * smooth(i / 12, (i + 1) / 12, charge)));
```
Le cercle se ferme, puis le bouton s'allume : « elle charge » a son image, et « un cœur qui bat ? elle refuse » aussi (cercle vide, bouton éteint).

Effort S à M. Impact 4.

### Plan 6 — Le cœur : matière plate, courant en « chapelet », voile blanc, « silence » marron (11,9 → 16,2 s et 43,9 → 53,1 s)

**Preuves** : `f_12.20.png`, `strip_e.jpg` vignettes 2-3, `f_45.50.png`, `f_48.50.png`, `strip_b.jpg` vignette 3 (49,75 s), `f_50.50.png`.

**Ce qu'on voit** :
1. **Matière** (`heart.js:109`) : `uInk × (0,035 + 0,15·lam² + 0,06·bord)` — aucun reflet, aucun liseré, aucun relief. De près le cœur est de la pâte à modeler grise avec des taches orange (« pierre de lave », `f_12.20.png`) ; éteint, un volume gris sans forme (`f_50.50.png`) ; sous le choc, du jambon rose (`f_48.50.png`). C'est le sujet du film et c'est l'objet le moins travaillé du film — à côté du boîtier de `f_35.60.png`.
2. **Le trajet du courant est un collier de perles** (`f_45.50.png`, `f_48.50.png`) : `fx.path` est une `Line2` de 40 segments en fusion **additive** (`hall.js:256`) ; les jonctions rondes se superposent et s'additionnent. Et le courant s'arrête à la surface du cœur : rien ne « traverse ».
3. **L'éclair de l'extinction lave toute l'image** (`strip_b.jpg` vignette 3) : `flash: 1` × 2,3 (`heart.js:124`) sur un cœur qui remplit le cadre (`d` 76) → un voile blanc de ≈ 1 000 × 1 200 px pendant ≈ 0,3 s, sous-titre « S'ÉTEIGNENT » dedans. La règle de la maison : « un éclair est une lumière qui a un endroit ».
4. **« Silence… » est marron** (`f_50.50.png`, `strip_f.jpg` vignette 4) : le cœur est éteint mais `mood` reste à 1 ; la flaque, la lumière de contour et le fond chaud teintent le verre en brun (cœur : luma 78 ; fond : 53). Le moment où « il n'y a plus rien » devrait être l'image la plus froide et la plus nue du film ; c'est la plus boueuse.
5. De profil (11,9 → 16,2 s), un bras de verre plus gros que le cœur barre le haut du cadre (`f_12.20.png`, coude à (760, 520)).

**Correctif** :

```glsl
// heart.js:105-109 — remplace le calcul de la matière (tout est borné avant pow)
vec3 n = normalize(vN);
vec3 v = normalize(vV);
float facing = clamp(abs(dot(n, v)), 0.0, 1.0);
vec3 L = normalize(vec3(-0.4, 0.75, 0.5));
float lam = 0.5 + 0.5 * dot(n, L);
float spec = pow(clamp(dot(reflect(-L, n), v), 0.0, 1.0), 26.0);          // un reflet mouillé : un organe, pas de la pâte
float rim = pow(clamp(1.0 - facing, 0.0, 1.0), 2.4);
float groove = exp(-pow((vP.x * 0.92 - vP.y * 0.28 - 0.4) / 0.42, 2.0)) * step(vP.y, 2.5) * step(0.0, vP.z);   // le sillon entre les ventricules
vec3 col = uInk * (0.045 + 0.19 * lam * lam) * (1.0 - 0.45 * groove * uActive) + uInk * 0.2 * spec;
// le liseré dit l'état : signal dans le chaos, rien dans le noir, veille quand il bat
col += (uSignal * uChaos * 0.5 + uVeille * uOrder * 0.6) * rim * uActive;
```
`heart.js:120` : le `+ 0.1` (veille au repos) → `+ 0.26` : entre deux battements, à la chute, le cœur (luma 114) est aujourd'hui moins contrasté que l'électrode (186) — voir `f_60.20.png`.

```js
// hall.js:253-261 — le courant : un faisceau de cinq tubes doux qui passent DANS le cœur, plus de Line2 additive
const beams = [-4.4, -2.2, 0, 2.2, 4.4].map((k) => {
  const c = new THREE.CatmullRomCurve3([PADS[0].at.clone(), V(-2 - 0.3 * k, 136 - victim.HIP + 0.4 * k, 5), V(3.4 - 0.5 * k, 131 - victim.HIP + 0.8 * k, 2.2), V(9 - 0.3 * k, 122 - victim.HIP + 0.4 * k, 1), PADS[1].at.clone()]);
  const mesh = new THREE.Mesh(new THREE.TubeGeometry(c, 64, 0.34, 10, false), softGlow(1.4));
  mesh.material.depthTest = false;
  mesh.renderOrder = 7;
  victim.torso.add(mesh);
  return mesh;
});
// hall.js:529-532 : beams.forEach((b) => { b.material.uniforms.uColor.value.copy(SIGNAL).lerp(INK, 0.5).multiplyScalar(1.5 * S.shock); b.visible = S.shock > 0.01; });
```
Cinq lignes de champ d'une électrode à l'autre, qui s'écartent autour du cœur et le traversent : « le courant traverse le cœur » se voit.

```js
// main.js:348  l'éclair reste dans le cœur
st(tDark - 0.05, 0.1, { flash: 0.6 }, "power2.out");
// main.js:350  « puis rien » : froid, pas marron. Nouvel état S.cold (0 dans FIRST), ramené à 0 au premier battement
st(tDark + 0.05, 0.5, { flash: 0, shock: 0, cold: 1, ground: 0 }, "power2.out");
st(tBeat, 0.3, { cold: 0 });                                               // à côté de main.js:360
// main.js:468  mix.copy(VEILLE).lerp(SIGNAL, S.mood).lerp(INK, S.cold).multiplyScalar(1 - 0.75 * S.cold);
// main.js:485  scene.background.copy(bg0).lerp(bgHot, S.mood * 0.5 * (1 - S.cold));
```
Trois couleurs, trois états : signal (chaos), encre presque éteinte (rien), veille (il bat). Le vert de « repart » sort alors du noir, pas d'un brun.

Bras qui barre le gros plan : réglé par les bras écartés du plan 2 ; sinon `main.js:193` `az: 10 → 34`.

Vérifier : `--at 12.2,15.5,44.3,45.5,48.5,49.75,50.5,52.5,53.4,54.2`. Effort M. Impact 4.

### Plan 7 — Les personnages de verre s'additionnent : le tas (16,2 → 22,4 s, et partout où deux corps se croisent)

**Preuves** : `f_16.50.png`, `f_19.90.png`, `f_21.80.png`, `strip_d.jpg` vignette 3, `f_37.60.png`, `f_23.00.png`.

**Ce qu'on voit** : `glass()` est additif, double face, sans écriture de profondeur (`kit/lib/build3d.js:62-85`). Chaque capsule ajoute sa lumière à celles de derrière : à chaque coude, genou, hanche, un cercle ; trois corps superposés, une quarantaine de contours. Sur `f_19.90.png` (le témoin sur la victime, TOI debout derrière) on compte trois boules crème et un enchevêtrement dont le cœur est le plus petit élément. Sur `f_23.00.png` c'est l'inverse : TOI (`glassK` 0,55) est si transparent que les lignes du mur et le banc passent **à travers lui** ; c'est le personnage le moins visible du plan qui porte son nom.
C'est le plafond de qualité de tout plan avec des personnages — et le 007 annoncé (siège éjectable) aura un pilote.

**Correctif (moteur)** — `kit/lib/figure.js` : un passage de profondeur par personnage, pour que le verre ne dessine que **la surface la plus proche**. Chaque corps devient une coque propre (un seul contour), un corps devant cache le verre de celui de derrière, et le décor (lignes, flaque) continue de se voir à travers.

```js
// figure.js — à la création
const mask = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true });   // n'écrit que la profondeur, dans la passe des transparents
body.side = THREE.FrontSide;
body.depthFunc = THREE.LessEqualDepth;
const shell = (mesh) => {                    // à appeler pour le tronc, chaque membre, chaque pied
  const m = new THREE.Mesh(mesh.geometry, mask);
  m.renderOrder = 5;                         // après le décor (0 : lignes, flaques, mur), avant le verre
  mesh.add(m);
  mesh.renderOrder = 6;
};
```
Ce qui doit suivre : les lueurs faites pour être vues **à travers** un corps passent en `depthTest = false`, `renderOrder = 7` — `heart.js:146` (le halo) et `:150` (le nœud), `hall.js:263` (les éclats du choc). Les objets pleins (cœur, électrodes, têtes) sont dans la passe opaque, dessinée avant : ils restent visibles sous le verre. Les lignes du hall passeront derrière TOI au lieu de le traverser… non : elles sont dessinées avant le masque, donc toujours visibles — si on veut que TOI les coupe, lui donner `renderOrder` 5 → −1 sur son seul masque.
Non essayé : à valider sur six images (`--at 0.04,10.3,19.9,21.8,23,37.6`) avant de l'adopter ; si le rendu perd l'effet « rayons X », garder `DoubleSide` sur le seul tronc.

En attendant (gratuit, sans toucher au moteur) : `hall.js`, après la ligne 270 : `witness.flesh.color.multiplyScalar(0.6);` — et dans `update()` (`hall.js:499`), TOI plus lumineux quand c'est lui le sujet : `toi.body.uniforms.uAmount.value = ghost ? 0.5 : S.toi > 0.5 && S.toi < 1.5 ? 1.9 : 1;`

Effort M. Impact 4 (006 et tous les suivants). Confiance 3.

### Plan 8 — « Chaque minute… les secours ? Un quart d'heure » : TOI derrière le graphique, le sous-titre sur le corps (16,2 → 22,4 s)

**Preuves** : `f_19.90.png`, `strip_d.jpg` vignette 3, `strip_f.jpg` vignette 3, `f_21.80.png`.

**Ce qu'on voit** : le sujet de la phrase est le graphique. Dessous, il faudrait une image calme. On a : TOI debout dont les jambes pendent sous le panneau, le torse derrière les barres et la tête derrière « DOSSIER 006 » ; ses deux mains, galets crème, de part et d'autre (`f_21.80.png`, x 0 → 40 et 215 → 255) ; le sous-titre « 15 MIN » posé sur le bras de la victime (corps à y 1 180 → 1 420, sous-titres à 1 248+).
Cause de composition : le panneau `#odds` prend 436 → 726, le sujet n'a plus que 760 → 1 160.

**Correctif** :
```js
// TOI n'a rien à faire dans ce plan : il entre à « Toi ». Nouvel état S.toiOut (0 dans FIRST)
now(t.compte - 0.6, { toiOut: 1 });  now(toToi, { toiOut: 0 });           // main.js, près de 207 et 235
// hall.js:417  toi.group.visible = there && !(S.toiOut > 0.5);
// main.js:206  plus près, plus haut : le groupe au-dessus des sous-titres
const GROUP = { tx: X - 34, ty: 38, tz: -14, d: 560, az: 24, el: 13, fov: 28, shift: -30, side: 0 };
shot(t.compte + 1.5, t.chaine - t.compte - 1.7, { d: 520, az: 18 }, "sine.inOut");     // main.js:224
```
```css
/* index.html:28  le graphique rend 50 px au sujet */
#odds-plot { position: relative; margin-top: 20px; height: 120px; border-bottom: 2px solid var(--ink-faint); }
```
Vérifier `--at 17,18.2,19.9,21.8` : aucune capsule derrière les barres, la victime au-dessus de y 1 200.

Effort S. Impact 3.

### Plan 9 — « Encore faut-il… savoir où elle est » : le recul frôle deux figurants et les tirets bavent (8,5 → 9,9 s)

**Preuves** : `f_9.50.png` (une traînée beige de 420 × 340 px en bas à gauche), `strip_pullback.jpg` (9,20 / 9,35 / 9,65 / 9,80 s).

**Ce qu'on voit** : pendant le recul, l'azimut passe de −16 à −81,7 : la caméra balaie large du côté +z et passe à ≈ 1,3 m du figurant `[2360, 60]` (vers 9,2 s) puis à ≈ 3 m de `[1180, 120]` (vers 9,5 s). `hall.js:291` dit pourtant « nobody on the way the camera flies to the box » : c'est vrai à l'aller, pas au retour. À l'image : une silhouette sombre floue à droite (9,65 s), une traînée beige puis des fantômes (9,5 → 9,8 s). `qa` ne les compte pas (ce n'est pas une image qui saute), mais c'est sur le C de l'accroche.
En même temps la route apparaît dès `t.encore` (`main.js:186`), en plein vol : de gros parallélogrammes verts flous (9,35 → 9,65 s) — le « sucre d'orge » de la règle du 003.

**Correctif** :
```js
// main.js:186  la route n'entre que lorsque la caméra se pose, et elle se trace de la victime vers la boîte
st(t.encore, 1.0, { far: 1.5, halo: 3, beacon: 2, lines: 1.5, ground: 0.5 });
st(t.encore + 0.95, 0.5, { route: 1.6 }, "power2.out");
// les deux figurants du trajet disparaissent pendant le vol. Nouvel état S.fly (0 dans FIRST)
now(t.encore - 0.3, { fly: 1 });  now(t.encore + 1.15, { fly: 0 });
// hall.js:559  fx.crowd.forEach((p, i) => { p.body.uniforms.uAmount.value = S.lines; p.group.visible = !(S.fly > 0.5 && (i === 1 || i === 3)); });
```
(On ne les déplace pas : `[2360, -330]` tomberait exactement devant la boîte dans la première image — même direction à 0,6° près.)
Option, pour que « ça se trace » : `fx.route.dashOffset` animé de la longueur de la courbe à 0 sur 0,5 s.

Vérifier `--at 9.2,9.35,9.5,9.65,9.8,10.3`. Effort S. Impact 3.

### Plan 10 — La main est un galet (23,3 → 24,9 s, et tout gros plan de main)

**Preuves** : `f_23.60.png`, `f_24.60.png`, `strip_a.jpg` vignettes 2-3 ; `f_21.80.png` (les mains de TOI au repos).

**Ce qu'on voit** : `hands: "flat"` est une sphère aplatie (`figure.js:100-101` : `scale.set(1, 0.46, 1.5)`). CLAUDE.md dit « une boule au bout d'un bras, en gros plan, reste une boule » ; un ellipsoïde aussi. Sur « Toi : la boîte », le geste que le film demande au spectateur — tendre la main vers la boîte — est fait par un savon qui flotte devant le montant.
Le 004 avait une vraie main (`episodes/004-differentiel/src/room.js:274-370` : paume, quatre doigts à deux phalanges, pouce, qui se referment). Le moteur partagé a régressé.

**Correctif (moteur)** : porter `fist` de `room.js:274-370` dans `kit/lib/figure.js` sous `hands: "real"` (même repère que la moufle : doigts le long de z, paume vers −y, et un paramètre `curl` 0 → 1) ; `reach(…, { dir, palm, curl })`. Dans `hall.js:285` : `makeFigure({ glassK: 0.55, hands: "real" })` pour TOI, et à la boîte (`hall.js:465-469`) `curl: 0.6` sur la poignée de la porte.
Sans toucher au moteur, pour le 006 seulement : passer la main en verre sur ce plan (`ghost: 1` dans la coupe `main.js:243`, `ghost: 0` à `toBench`) — un galet de verre se remarque beaucoup moins qu'un galet crème.

Effort M (portage) ou S (repli). Impact 3.

### Plan 11 — La vue éclatée : trois pièces sur cinq sont noir sur noir ; la carte traverse l'en-tête (25,0 → 29,4 s)

**Preuves** : `f_25.90.png`, `strip_c.jpg` vignette 2 (26,4 s), `f_28.00.png`, `strip_c.jpg` vignette 3 (29,0 s).

**Ce qu'on voit** :
- « On l'ouvre » est le plan-signature du compte. Ici le couvercle (luma 24) flotte sur le fond (20), le socle (23) est un bloc noir : seuls les électrodes, le condensateur et le contour de la carte se lisent. Le couvercle, levé de 27 cm, sort du halo du sol (57). La règle « trois valeurs de gris » n'est pas tenue : `shell` 0x2c353b et `cast` 0x20272c sont deux noirs.
- De 27,3 à 29,4 s (`POWER`), la carte et ses arêtes claires montent **derrière l'en-tête** : elle couvre y 340 → 525, à travers le filet (355) et la ligne des actes (383) ; « 03 RÉPONSE » est posé sur la puce (`f_28.00.png`). La règle « ce qui monte derrière l'en-tête se fond dans le noir » n'est pas tenue.
- Sur « une batterie », l'objet le plus lumineux est une électrode en bas à droite (x 610 → 1 080, y 1 460 → 1 720), dans la zone des boutons.

**Correctif** :
```js
// model.js:70-71  trois valeurs : fonte, coque, pièce-héros
cast: solid(0x2b343a, { rough: 0.62, metal: 0.25, coat: 0.35, coatRough: 0.4 }),
shell: solid(0x47535b, { rough: 0.5, metal: 0.2, coat: 0.5, coatRough: 0.35 }),
// model.js:154  edgeOpacity: 0.75 → 0.95 (le couvercle se dessine même hors du halo)
// main.js:41   const pool = makePool({ radius: 90 });          // le halo passe derrière la pile ouverte
// main.js:250  { pool: 0.26 → 0.34 } sur la coupe
// main.js:254  le couvercle se détache sur le sol éclairé, pas sur l'horizon noir
shot(toBench + 0.02, 1.25, { tx: 0, ty: 15, tz: 5, d: 262, az: 24, el: 30, shift: 165 });
// la carte s'efface pendant « batterie, condensateur », revient pour « puce ». Nouvel état S.boardA (1 dans FIRST)
st(t.batterie - 0.4, 0.3, { boardA: 0 });  st(t.puce - 0.6, 0.3, { boardA: 1 });
st(t.batterie - 0.4, 0.3, { padsA: 0.3 });  st(t.repos - 0.2, 0.3, { padsA: 1 });      // les électrodes cèdent la vedette
// main.js:475  setPartOpacity(aed.parts.board, S.boardA);  setPartOpacity(aed.parts.pads, S.padsA);
```
`fx.tracks` et les matières de la carte sont déjà inscrites dans `board.userData.part.mats` (`model.js:131`) : rien ne flottera. Vérifier quand même `fx.chip` (`model.js:137-140`) et `fx.rings` : les ajouter à `mats` s'ils restent seuls en l'air.
Attention : `shell` éclaircie change le packshot étalon (`f_35.60.png`) — vérifier `--at 25.9,26.4,28,29,35.6,63.5` et revenir à 0x3a454c si le boîtier fermé perd son noir profond.

Effort S. Impact 3.

### Plan 12 — Quinze secondes d'appels à l'action sur un objet immobile (65,7 → 80,6 s) ; « demain » dans le noir (80,7 → 84,1 s)

**Preuves** : `film_09.jpg` ligne 2, `film_10.jpg` (trente vignettes où seul le panneau change), `f_67.00.png`, `strip_f.jpg` vignettes 1-2, `f_82.00.png`.

**Ce qu'on voit** : 17 % du film sur le boîtier fermé qui tourne lentement. Les panneaux font leur travail ; la 3D ne fait rien. « Chaque phrase a sa démonstration » s'arrête à la chute. Et sur le CTA commentaire — celui qui paie la curiosité du C — l'image du C (le hall, la boîte au loin, « elle est où ? ») ne revient pas.
Au rebouclage, « le même hall, le lendemain » est une boîte sur du noir avec le fil du pilastre et une ligne de sol : on ne reconnaît pas le hall, rien ne dit « ton trajet ».

**Correctif** (avec ce qui existe déjà) :
```js
// main.js:400  COMMENTAIRE : on revient dans le hall, vide, au cadre du C — la question se pose en image
cut(t.comment - 0.12, IN_HALL, { ...WHERE }, { ...FIRST, cast: 0, chaos: 0, halo: 0, mood: 0, route: 0, far: 1.5, beacon: 2, lines: 1.5, ground: 0 });
st(t.proche, 0.6, { route: 1.6 }, "power2.out");                       // le chemin se trace sur « la plus proche de chez toi »
shot(t.comment - 0.12, t.abo - t.comment, { d: WHERE.d * 0.9 }, "sine.inOut");
cut(t.abo - 0.15, BENCH, { tx: 0, ty: 6, tz: 0, d: 215, az: 20, el: 26, shift: -260, side: 0 }, { ...l'état de la coupe toCta, main.js:390 });
```
`#cta-field` occupe la zone haute : compatible. `#chip-samu` (« le 15 te dit où ») garde sa place fixe.
LIKE : faire battre le voyant à chaque « témoin prêt » (`likeNet` reçoit déjà les quatre instants, `main.js:395`) : `st(hit, 0.08, { bLed: 2.4 })` puis retour à 1 en 0,4 s, `led: S.bLed` dans `aed.pose` (`main.js:476`).
Rebouclage : `main.js:419` `lines: 1.7 → 2.2` et `az: -44 → -58` au départ, pour que le mur et ses pilastres fuient derrière la boîte ; deux figurants qui marchent (`run()` de `hall.js:382` avec la foulée ralentie) seraient le mieux, effort M.

Effort M. Impact 3. Confiance 3 (changement de mise en scène : à montrer à Merwan sur deux images avant de monter).

---

## 4. Ce que j'ai regardé et qui tient

Pour qu'on n'y touche pas par excès de zèle : 10,0 → 10,7 s (le hall vu de haut, en perspective : ici l'orange, là-bas le vert — `strip_dive.jpg` vignette 1), 26,5 → 27,3 s (« deux électrodes », à la légende près), 28,5 → 29,4 s, 29,8 → 36,8 s, 37,0 → 38,3 s (« tu colles les électrodes » : chargé, mais les deux électrodes se lisent), 55,5 → 65,6 s. Aucun aliasing ni scintillement vu sur les 67 images extraites.

## 5. Ordre d'implémentation conseillé

1. **Sans risque, une heure** : plan 4 (étiquettes), plan 3 (boîte, pilastre, porte), plan 1 (quatre poses). Un `look` de douze images.
2. **L'accroche** : plan 2, avec trois variantes de la première image à montrer à Merwan (c'est l'image du compte dans la grille « Pour toi »).
3. **Le cœur** : plan 6, puis plan 5 (halo de l'appareil, cadre « ne touchez pas », jauge).
4. **Le nettoyage** : plans 8, 9, 11.
5. **Le moteur** : plans 7 et 10 (verre et main) — à faire sur le 006 s'il reste du temps, sinon en ouverture du 007, mais avant d'y mettre un personnage.
6. Plan 12 en dernier, après accord sur le principe.

Puis `review`, `check`, `render --draft`, `qa --file` : les plans 1, 2, 5 et 12 déplacent des coupes ou des cadres, donc recompter les images parasites.

## 6. Règles à verser dans CLAUDE.md si les correctifs tiennent

- La pièce-héros (ici le cœur) a **un angle canonique** : on y revient toujours sous cet angle, seule la couleur change. Un organe se montre à l'endroit.
- Un gros plan d'objet lumineux tient dans la zone du sujet (440 → 1 160) : jamais de carte d'accroche ni de sous-titre **sur** une surface qui émet, surtout de la même couleur.
- Aucun trait du décor n'est aligné sur le sujet (le pilastre derrière la boîte).
- Le système posé dans un décor garde **son halo veille** : c'est ce qui le sépare d'une ambiance signal.
- Quand une phrase est un ordre (« ne touchez pas »), le plan montre **celui qui obéit**.
- Le trajet d'un mouvement se vérifie **à l'aller et au retour** pour les figurants ; ce qui apparaît (route, étiquette) apparaît quand la caméra se pose.
- Toute étiquette suivie (`follow`) se contrôle contre `--safe-l` et la colonne des boutons : à automatiser dans `check`.

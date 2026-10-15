# L01 · `kit/lib/postes.js` — journal (2026-10-15, soir)

Le portique, la salle blanche, la soufflerie de trempe, le banc d'essai. Un bloc du kit des longs : il resservira à chaque film, et **chaque bloc est une famille de machines** (Merwan : un long ne doit jamais ressembler à un gabarit où seul l'objet change).

## Ce qui est fait

- Le bouchon est remplacé en entier ; l'interface est celle de l'architecte (mêmes exports, mêmes paramètres, mêmes `set`). Ajouts, tous optionnels avec une valeur par défaut : des réglages de construction (style, axes, outil, rangées, flux…), et dans chaque `set` un `time` (secondes du film : ce qui coule — l'air, les jets, l'étincelle, l'oscillation — ne dépend que de lui). Plus `lift` / `slide` (portique), `square` (poinçon).
- Deux effets partagés, exportés pour la machine propre d'un épisode : `makeLamp` (une lumière qui a un endroit : cœur, cône qui s'éteint, flaque au sol) et `makeStreaks` (traînées d'air le long d'un trajet droit → virage → second trajet, au moins 1,8 px à l'écran, plus sombres si on les élargit de force : jamais un cheveu blanc au loin).
- Aux rayons X (`xray` de `usine.js`), en trois poids : `BODY` (corps de machine), `FRAME` (contreventements, rails, pieds), `WALL` (grandes vitres) ; traits ≥ 1,8 px partout. Pleins : les bouts qui touchent le verre (molette, raclette et sa lame, ventouses, aiguille) et les MENACES (les deux billes, la tête de 10 kg, le pointeau) : acier sombre, liseré d'encre à la silhouette, aura signal (`threatHalo`).
- Vérifié : `npm run build -- L01` passe ; un script hors navigateur construit et anime les **seize variantes** du catalogue (`scratchpad/postes/variants.mjs` : toutes passent) — le film n'en appelle qu'une par bloc, les autres ne sont donc vues qu'à la construction, pas à l'image.
- Corrigé en route : l'air de la salle blanche était dessiné mais invisible (trop fin, trop faible : `k` 0,34 → 0,85, largeur 1,1 → 1,8 cm, longueur 86 → 150 cm) ; le plafond de filtres lavait le haut de l'image (filtres en `WALL`, faces 0,075 → 0,035) ; la chaîne porte-câble s'étirait avec ses arrondis (boîte simple) ; les jets du bas partaient du mauvais côté quand les buses sont inclinées ; les faces vues de dessus (pochoir, filtres, cœur des lampes) n'étaient visibles que d'un côté ; la molette et la raclette ne se lisaient pas (agrandies, raclette pleine) ; les conduits de la soufflerie encombraient (en `WALL`).

## Le catalogue

Origine de chaque bloc : sur le sol (y = 0), son centre sur l'axe de la ligne (x = 0, z = 0) — salle blanche et soufflerie : leur bout amont (x = 0). La caméra se tient du côté +z ; tout ce qui pourrait masquer le sujet est mis à −z (tour, colonne, souffleur, sas).

### `makeGantry` — le portique

`set({ amount, travel, down, lift?, slide?, time? })` · `A.head` (l'outil ; pour `screen`, le cadre).

| Réglage | Défaut | Ce qu'il fait |
| --- | --- | --- |
| `span` | 500 | écart des jambes, en travers de la ligne (z) |
| `height` | 260 | hauteur de l'axe de la poutre |
| `tool` | `"knife"` | `knife` molette de diamant + étincelle froide au contact · `screen` cadre de sérigraphie + raclette (`travel` = la raclette le long de x, `down` = le cadre descend) · `arm` cadre à ventouses (`lift` 0 → 1 soulève ce qu'il tient de `lift` cm) · `nozzle` aiguille de colle + lampe d'inspection |
| `style` | `"portal"` | `portal` deux jambes · `bridge` quatre poteaux et deux rails le long de x (`rails` cm), la poutre roule dessus (`slide` −1…1) · `column` une colonne à −z, poutre en porte-à-faux, jambe de force |
| `axes` | 3 | 3 : coulisse verticale télescopique (course 40 cm) · 2 : tube de descente fixe + vérin court (12 cm) |
| `legs` | `"post"` | `post` montants droits · `a` jambes en A avec entretoise (portique seulement) |
| `work` | 92 | hauteur du verre (y) où l'outil descend |
| `cable` | true | chaîne porte-câble sur la poutre : brin bas fixe, boucle, brin haut qui suit le chariot |
| `lamp` | 0,55 si `nozzle`, sinon 0 | lampe sous le chariot qui éclaire le verre (0 = aucune) |
| `screen` | `{ w: min(0,38 span, 190), h: 0,64 w }` | taille du cadre de sérigraphie (w en travers, h le long) |
| `cups`, `cupSpan`, `lift` | 6, [28, 58], 30 | nombre de ventouses (4, 6, 8), demi-écartements x / z, course de levée |
| `rails` | 300 | longueur des rails (style `bridge`) |

L'axe de l'outil est **x = 0** (la poutre est en aval) : la coupe tombe exactement à `ST.cut.at`. `travel` 0 → 1 mène l'outil de −0,45 à +0,45 `span`.

Trois machines différentes avec le même bloc :
- **Découpe lourde** : `{ span: 520, height: 280, tool: "knife", style: "portal", legs: "a" }` — jambes en A, molette, chaîne.
- **Sérigraphie sur pont** : `{ span: 440, height: 260, tool: "screen", style: "bridge", rails: 280, screen: { w: 176, h: 114 } }` — le pont avance avec `slide` pendant que la raclette balaie.
- **Poseuse en porte-à-faux** : `{ span: 440, height: 240, tool: "arm", style: "column", axes: 2, cups: 8 }` — une colonne au fond de la salle blanche, huit ventouses, un vérin court.

### `makeCleanRoom` — la salle blanche

`set({ amount, air, time? })`.

| Réglage | Défaut | Ce qu'il fait |
| --- | --- | --- |
| `length`, `half`, `height` | 1000, 300, 300 | la boîte (origine : mur amont) |
| `bay` | 125 | pas des montants et de la grille du plafond |
| `sas` | `"back"` | sas vitré à deux portes : `back` (−z) · `front` (+z) · `none` ; `sasAt` sa place le long de la salle (0–1, défaut 0,24) |
| `flow` | `"down"` | `down` flux laminaire du plafond : l'air descend, touche la ligne, s'évase vers les grilles de reprise au pied des murs · `cross` flux horizontal depuis le mur du fond |
| `ffu` | `"all"` | filtres au plafond : `all` toutes les cases · `alternate` une sur deux (leur face s'allume avec `air`) |
| `streaks` | 200 | nombre de traînées d'air |
| `slot` | `{ bottom: 48, top: 150, half: min(half − 40, 215) }` | l'ouverture où passe la ligne, dans les deux murs d'extrémité |
| `curtain` | true | rideau à lanières dans l'ouverture |
| `work` | 96 | où l'air rencontre la ligne |

Variantes : `{ flow: "cross", sas: "front", ffu: "alternate" }` (salle d'assemblage à flux traversant) ; `{ bay: 90, streaks: 320 }` (salle plus dense, plafond serré).

### `makeBlower` — la soufflerie de trempe

`set({ amount, jets, time? })`.

| Réglage | Défaut | Ce qu'il fait |
| --- | --- | --- |
| `length`, `half`, `y` | 500, 140, 90 | longueur, demi-largeur, hauteur du verre |
| `rows`, `cols` | 8, 9 | rangées de buses (le long de x) et buses par rangée |
| `kind` | `"pipes"` | `pipes` rampes de buses rondes · `slots` buses à fente (lames) |
| `angle` | 0 | inclinaison alternée des rangées (degrés) : les jets se croisent |
| `gap`, `nozzle`, `plenum` | 10, 18, 46 | jeu buse–verre, longueur des buses, hauteur des caissons |
| `oscillate`, `period` | 0, 2,4 | les deux caissons balancent le long de x (cm, s) |
| `fan` | true | conduits et volute du ventilateur à −z (Ø ≈ 2,5 m) |

`jets` dessine les traînées blanches (vite, courtes, plus claires au point d'impact) qui frappent les DEUX faces et fusent sur le côté, et l'empreinte des impacts sur chaque face (le « motif de trempe »). Variante : `{ kind: "slots", angle: 15, oscillate: 12 }`.

### `makeDropTower` — la tour de chute

`set({ amount, ball, small, chamber, time? })` · `A.plate`, `A.ball`, `A.small`.

| Réglage | Défaut | Ce qu'il fait |
| --- | --- | --- |
| `height`, `mast` | 400, 900 | hauteurs de lâcher de la bille de 2,26 kg (Ø 8,2 cm) et de celle de 227 g (Ø 3,8 cm), au-dessus de la face de l'éprouvette |
| `plate`, `sample`, `top` | 100, 30, 1,7 | hauteur du plateau, côté de l'éprouvette, hauteur de sa face au-dessus du plateau |
| `posts`, `width`, `brace` | 4, 72, 120 | mât en treillis : 2 (échelle), 3 ou 4 montants, largeur, pas des croisillons |
| `behind` | 70 | recul du mât derrière l'axe (−z) ; les potences des deux électroaimants passent au-dessus de l'axe |
| `guard`, `lamp`, `ticks`, `axis` | true, 0,5, true, true | vitres de protection sur trois côtés · lampe visant l'éprouvette · graduations tous les 50 cm · axe de chute en pointillés |

`ball` 0 tenue → 1 sur l'éprouvette (chute en k²) → 1,2 petit rebond et elle se pose dans son creux. `small` idem (la petite tombe sur son propre axe, à 8 cm). `chamber` : +1 chaude (vitres teintées signal, résistance qui respire lentement, intérieur tiède), −1 froide (givre qui gagne les vitres par les bords, serpentin éteint). Variante : `{ posts: 2, width: 50, guard: false }` (mât échelle, plus léger) ; `{ posts: 3, brace: 90 }`.

### `makeHeadRig` — la tête factice et son gabarit

`set({ amount, drop, time? })` · `A.head`.

| Réglage | Défaut | Ce qu'il fait |
| --- | --- | --- |
| `drop` | 150 | hauteur de chute (cm), au-dessus du CENTRE du verre |
| `w`, `h`, `wTop` | 150, 92, w | le pare-brise couché : largeur au pied (z), longueur (x, pied à −x), largeur en haut |
| `rest`, `sag`, `sagV` | `frame`, 0, 0 | hauteur des coins du verre et sa courbure : le gabarit **suit le bord courbé**, la tête tombe sur le vrai centre (`rest − sag − sagV`) |
| `frame` | 100 | (interface d'origine) : vaut `rest` s'il n'est pas donné |
| `gallows` | `"portal"` | `portal` deux colonnes le long de x, poutre, treuil, électroaimant · `mast` une colonne et sa potence |
| `lamp`, `ticks`, `axis`, `thick` | 0,5, true, true, 1,4 | lampe sur la poutre · graduations tous les 25 cm · axe pointillé · épaisseur dessinée du verre |

La tête : hémisphère de 16,5 cm (peau de caoutchouc, plus mate) sur son corps d'acier, anneau de levage. `drop` 1 → 1,15 : elle s'enfonce de 6 cm.

### `makeOpticBench` — le banc optique

`set({ amount, look })`.

| Réglage | Défaut | Ce qu'il fait |
| --- | --- | --- |
| `y`, `rest` | 100, y | hauteur où quatre pions tiennent le verre |
| `board` | `"under"` | `under` table lumineuse sous le verre (la caméra regarde à travers, de haut) · `wall` mire debout derrière |
| `w`, `h`, `sag` | 150, 92, 0 | l'empreinte du verre (pour savoir quels traits sont vus À TRAVERS lui) et sa flèche |
| `cell`, `line`, `gridY` | 8, 0,55, 26 | pas et épaisseur des traits (≥ 2 px à l'écran, fondus en gris quand ils deviendraient plus fins qu'un pixel : pas de moiré), hauteur de la table |
| `scope` | true | colonne et lunette d'observation au-dessus du verre |

`look` 1 la grille droite · 2 tordue **seulement là où on la voit à travers le verre** (rayon caméra → mire intersecté avec le verre, dans le shader) · 3 dédoublée là (image secondaire, décalée de 3 cm).

### `makeStriker` — le pointeau du témoin trempé

`set({ amount, strike, square? })`. `squareAt` [12, 10] : où se pose le carré de comptage de 5 × 5 cm (`square` 0–1) ; `spring` le boîtier du ressort. Table, cadre autour du témoin, potence en C par derrière, fourreau ; le pointeau (menace, acier, aura signal) descend de 30 cm sur le centre.

## Les poses qui cadrent bien (vues sur planche)

Toutes à `at` dans la ligne, `{ "set": 2, "line": 1 }` en plus de l'état indiqué ; `fov 28, shift 0, roll 0` sauf mention ; mettre `drift: 0.3` dans le film.

- **La molette qui mord** (`knife` 0,5) : `{ tx: 5000, ty: 105, tz: 0, d: 170, az: -38, el: 14, fov: 28, shift: 0, side: -60, roll: 0, drift: 0.3 }`
- **La raclette** (`squeegee` 0,5, l'ébauche à plat dessous : `hero 1, cut 1, pos 5700, print 0.5, bend 0, film 0`) : `{ tx: 5700, ty: 100, tz: 0, d: 230, az: -40, el: 22, fov: 28, shift: 0, side: -80, roll: 0, drift: 0.3 }` — la plus forte des machines de la ligne.
- **Le cadre de sérigraphie** (même état, `squeegee` 0,3) : `{ tx: 5700, ty: 110, tz: 0, d: 300, az: -28, el: 30, fov: 28, shift: 0, side: -120, roll: 0, drift: 0.3 }`
- **La salle blanche, l'air** (`air` 1) : `VIEW.clean` tel quel.
- **La soufflerie, de près** (`jets` 1, `sidePos 7250, sideGlow 0.6`) : `{ tx: 7250, ty: 95, tz: -1100, d: 360, az: -24, el: 16, fov: 28, shift: 0, side: -120, roll: 0, drift: 0.3 }` ; **de profil, les deux faces frappées** : `{ tx: 7250, ty: 92, tz: -1100, d: 300, az: -12, el: 3, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` (chargée : voir plus bas).
- **La tour** : `VIEW.tower` tel quel (le treillis, la tête de mât hors cadre).
- **L'éprouvette dans la boîte froide** (`chamber -1, sample 1, ball 0.98`) : `{ tx: 11300, ty: 110, tz: 0, d: 220, az: -24, el: 24, fov: 28, shift: 0, side: -120, roll: 0, drift: 0.3 }` — givre, bille à l'aura signal derrière la vitre. Chaude : même pose, `chamber 1`.
- **La tête dans le verre** (`drop 1.1`, `hero 1, cut 1, pos 11850, print 1, bend 1, film 1`) : `VIEW.frame` ; `VIEW.frameLow` avec `drop 0.9` (la tête qui arrive, les graduations à gauche).
- **Le banc optique** (`hero` sur `pos 11050`, `optic` 2 ou 3) : `{ tx: 11050, ty: 70, tz: 0, d: 380, az: -30, el: 40, fov: 28, shift: 0, side: -120, roll: 0, drift: 0.3 }` ; plus serré : `{ tx: 11050, ty: 60, tz: 0, d: 300, az: -25, el: 55, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }`. **`VIEW.optics` (el 5) ne convient pas** : la mire est sous le verre, il faut la regarder de haut.
- **Le pointeau** (`witness 1, strike` 0,6 → 1) : `VIEW.witness` tel quel.
- **La lampe d'inspection** (`scan 0.5, sensors 0.5`) : `{ tx: 10300, ty: 120, tz: 0, d: 320, az: -24, el: 26, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }`.

## Ce qui n'est pas au niveau (dit franchement)

- **La tour en plan large** : le treillis se lit, mais à 11 m l'éprouvette et les billes sont des points ; une contre-plongée (`ty 450, d 950, el -6, fov 36`) est faible (beaucoup de noir). Le climax se tient en gros plans (boîte, éprouvette, tête), la tour sert de plan d'échelle.
- **`VIEW.cut`** cadre les rouleaux : la poutre et l'outil sortent par le haut. Prendre la pose « molette qui mord ».
- **La soufflerie de profil** reste chargée (les conduits ronds vus en bout derrière) ; les conduits ont été baissés après la dernière planche, **pas revus à l'image**.
- **La poseuse (`arm`) dans la salle blanche** : petite et noyée dans l'air au plan moyen ; elle se lit de près.
- L'étincelle de la molette n'a pas été vue sur le ruban (le ruban du bouchon n'était pas là à cet instant).
- Les variantes hors du film (pont, colonne, deux axes, fentes, flux traversant, mât 2 / 3 montants, potence, mire debout) **se construisent sans erreur mais n'ont pas été vues à l'image**.
- Pas de mon fichier, vu en passant : le verre (bouchon de `verre.js`) fait une grosse tache blanche dans certaines poses (`VIEW.film`, la tête d'essai en plan large) — elle reste quand mes machines sont éteintes.

## À changer ailleurs (`world.js`, lignes exactes)

1. **Le temps** (sinon l'air, les jets, l'étincelle et la résistance sont figés) — dans `apply`, ajouter `time` :
   - `cutter.set({ amount: a, travel: Math.min(1, S.knife), down: …, time });`
   - `clean.set({ amount: a, air: S.air, time });`
   - `eyes.set({ amount: a, travel: S.scan, down: …, time });`
   - `tower.set({ amount: a, ball: S.ball, small: S.small, chamber: S.chamber, time });`
   - `blower.set({ amount: a, jets: S.jets, time });`
2. **`down` en rampe, pas en marche** (une tête qui saute d'un coup = une image parasite) :
   - `cutter.set({ amount: a, travel: Math.min(1, S.knife), down: Math.max(0, Math.min(1, S.knife / 0.06, (2 - S.knife) / 0.06)), time });`
   - `printer.set({ amount: a, travel: S.squeegee, down: Math.max(0, Math.min(1, S.squeegee / 0.06, (1 - S.squeegee) / 0.06)) });`
   - `eyes.set({ amount: a, travel: S.scan, down: Math.max(0, Math.min(1, S.sensors / 0.08, (1 - S.sensors) / 0.08)), time });`
3. **La poseuse** : ses ventouses prennent la feuille du dessus et la SOULÈVENT (`open`, ≈ 30 cm) — `travel` ne doit pas suivre `open` :
   `placer.set({ amount: a, travel: 0.5, down: Math.max(0, Math.min(1, S.open / 0.05)), lift: S.open });`
4. **La tête tombe sur le vrai verre** (aujourd'hui le gabarit est à 100 et la tête s'arrête ≈ 20 cm au-dessus du centre du pare-brise posé à `LINE.y + 1,5` et bombé de 12 cm) :
   `const rig = makeHeadRig({ drop: DROP.head, frame: ST.test.y, w: WS.w, h: WS.h, wTop: WS.wTop, rest: LINE.y + 1.5, sag: WS.sag, sagV: WS.sagV });`
5. **Le banc optique sur le même verre** : `const optics = makeOpticBench({ y: ST.test.y, rest: LINE.y + 1.5, w: WS.w, h: WS.h, sag: WS.sag + WS.sagV });`
6. **Trois portiques qui ne se ressemblent pas** (recommandé ; le cadre de sérigraphie à la taille du pare-brise) :
   - `makeGantry({ span: 2 * 260, height: ST.cut.h, tool: "knife", legs: "a" })`
   - `makeGantry({ span: 2 * 220, height: ST.print.h, tool: "screen", style: "bridge", rails: 260, screen: { w: WS.w + 26, h: WS.h + 22 } })`
   - `makeGantry({ span: 2 * 220, height: 240, tool: "arm", style: "column" })` (dans la salle blanche)
   - `makeGantry({ span: 2 * 220, height: ST.eyes.h, tool: "nozzle", axes: 2 })`
7. Facultatif : `makeBlower({ …, angle: 12, oscillate: 10 })` (les caissons qui balancent, les jets qui se croisent) ; et si la voix montre « ses grains comptés dans un carré de 5 cm » : un nombre `count` dans `FIRST` et `striker.set({ amount: a, strike: S.strike, square: S.count })`.

## Images lues : 27 / 30

Planches `p1` (8), `p2` (2, la tache du verre), `p3` (1, l'air forcé), `p4` (8), `p5` (8) — toutes dans le dossier temporaire de la session (`scratchpad/postes/`), aucune dans `renders/`.

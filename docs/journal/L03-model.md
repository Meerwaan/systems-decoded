# L03 · `model.js` — journal du décor des systèmes pleins

Fichier : `episodes/L03-evacuation-avion/src/model.js` (interface inchangée). Planches : 30 images lues (5 planches, dossier temporaire). `npm run build -- L03` passe.

## Ce qui est fait

- **Le paquet** : housse matelassée sombre (bump de piqûres en losange), sangles, boucles, rabat avant (le devant de la housse, charnière en bas), couvercle (charnière à l'arrière) ; toboggan plié en 10 plis gris chaud clair et deux liens ; bouteille couchée sur le couvercle (vanne, levier, manomètre incliné vers la caméra) ; deux bouches debout devant elle, leur tuyau et leur collecteur ; barre d'arrimage claire et ses deux ferrures ; berceau sur l'établi seulement ; tablier de toile (le « girt ») de la barre au bas du toboggan.
- **La bouche (×2)** : corps venturi en deux moitiés (lathe), faces de coupe claires, intérieur sombre (doublure), tuyau de gaz entrant par l'arrière, coude, buse vers le bas, moyeu, **8 clapets** articulés au bord (les plus clairs du modèle), jet (cône doux d'encre), zone de dépression (assombrissement), air (traînées veille sur un chemin Catmull-Rom, jamais des points), fuite (traînées signal) et débris plein sur le clapet n° 5 de la bouche 0.
- **Le banc** (`explode` 2) : boudin de tête suspendu à deux potences, déformé dans son shader (ellipse de périmètre constant : rideau plissé à plat → rond plein, ligne du haut fixe sous les bouches) ; bouteille couchée à droite le long de z, vanne et manomètre vers la caméra ; flexible jusqu'au collecteur ; le gaz : une peau de lumière qui avance du robinet aux bouches avec des pulsations lentes.
- **Le siège 16 g** : rangée de trois sièges éco face à −x sur un traîneau (cibles de crash-test sur son flanc), rails ; mannequin plein gris d'encre, articulations sombres, cibles à quadrants sur la tête, ceinture ventrale ; capteurs veille (cœur, halo, anneau lent) tête / torse / bassin ; presse statique (poteau, vérin, plaque sur le dossier).
- **Le coussin** : assise + dossier sur bâti, brûleur (tube, buse évasée, poteau, flexible), flamme en trois couches (cœur chaud, gaine signal, halo serré ; somme < 3), braises qui montent, lumière ponctuelle signal qui lèche le coussin, brûlure (assombrissement) et liseré veille (les arêtes du coussin) qui monte avec `burner`.
- **Les documents** : pupitre sombre incliné, feuille 60 × 80 (papier gris chaud, grain, en-tête « PIÈCE 0X · DOSSIER L03 », année et grand mot en Barlow Condensed, lignes en JetBrains Mono, lignes de remplissage illisibles), surlignages ENTRE le papier et l'encre ; textures redessinées une fois les polices chargées. Aucun logo, aucun nom d'agence.
- **Les vingt** : figurines de verre (corps tourné, tête) sur socle sombre, en rang sur 2 m ; la 14e en signal avec un anneau au sol.

## Ce que fait chaque paramètre

- `place` : 2 établi (berceau visible), 1 cabine (barre vers `sill`, `pulled`, `drop`, tablier), 0 rien de propre.
- `explode` 0 → 1 : rabat qui tombe vers la caméra (0 → 0,45 ; à 0,12 il s'entrouvre de 18°), bouteille et bouches qui montent (0,14 →) puis s'écartent, couvercle qui bascule en arrière (0,45 → 0,8), toboggan qui sort par le haut (0,5 → 0,95), barre qui descend devant sur l'établi (0,02 → 0,4), tablier et tuyau fermé qui s'effacent. Couloirs : bouteille en haut, bouches à ±56 cm à mi-hauteur (rien devant), toboggan au milieu, barre au sol devant.
- `explode` 1 → 2 : housse, toboggan, barre, berceau s'effacent (≤ 1,4) ; la bouteille passe au-dessus de tout puis descend à droite en tournant de 90° ; les bouches rejoignent le boudin (1,15 → 1,75) ; potences et boudin apparaissent (1,35 → 1,75) ; flexible du banc (1,6 → 1,95).
- `named` : 1 toboggan · 2 bouteille · 3 bouches · 4 barre · 5 clapets — la pièce prend une lueur veille et ses arêtes passent au veille.
- `arm` (cabine) : la barre va de sa place (bas du paquet) aux ferrures `sill` entre 0,35 et 0,65.
- `pulled` (cabine) : le paquet sort de 46 cm vers −z local (dehors) ; `drop` : il tombe sous le seuil (gp.y − 73 cm, 30 cm plus dehors), incliné de 22°, pendu au tablier.
- `gas` : levier de vanne (0 → 0,2), aiguille du manomètre de +115° à −115°, gaz qui avance dans le flexible du banc (visible seulement au banc, `explode` ≥ 1,6).
- `jet` : le jet dans la gorge des bouches ; la zone de dépression s'assombrit de `jet` 0,55 à 1 (× `see`).
- `see` : la moitié avant des bouches (et ses 4 clapets) s'efface ; les traînées d'air se replient dans la moitié arrière.
- `valve` : les clapets pivotent de 75° vers l'intérieur ; leur lueur veille suit l'ouverture. L'ouverture vaut `max(valve, air)` (une bouffée d'air ouvre les clapets).
- `air` : traînées veille (18 par bouche) qui entrent par-dessus le bord, passent les clapets et descendent le long du jet ; elles arrivent une à une avec `air`.
- `tube` : rideau plat plissé → rond plein (axe qui remonte, ligne du haut fixe à y 58 local) ; 0,65 = affaissé.
- `leak` : le clapet n° 5 de la bouche 0 se rouvre (≈ 31°) sur un débris plein teinté signal ; traînées signal qui sortent (0,4 → 1).
- `press` : la plaque arrive (0 → 0,55) puis pousse le dossier du siège du mannequin (5°) ; la presse est invisible à 0.
- `sled` : 0 → 1 la VOIE défile sous le traîneau immobile (400 cm), le mannequin plaqué en arrière ; 1 → 2 l'arrêt net en ≈ 32 cm (premier quart), le torse plonge (52°) retenu au bassin, la tête fouette avec retard puis rebondit, les bras partent, tout se repose à 2.
- `sensors` : les trois points veille, leur halo, un anneau qui s'élargit lentement (0,7 Hz, pas de clignotement).
- `burner` : flamme, braises, lumière, brûlure, liseré veille.
- `doc` (1–7, 0 = rien), `docIn` (la feuille glisse depuis le fond et se pose), `hl` : le grand mot est souligné dès le début du balayage (0 → 0,06), puis chaque ligne : la ligne k est pleine à `hl` = (k+1)/N (N lignes ; 1967 : 3 lignes, 1991 : 2, 2025 : 3). `mood` 1 : surlignage signal.
- `twenty` (une à une, rang 0 → 19), `oneIn` (la 14e passe au signal).

## Les poses qui cadrent bien (P = `{ fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }`, `set: 2` sauf mention)

| nom | pose | état | optique |
|---|---|---|---|
| `pack` | `{ ...P, tx: 0, ty: 36, tz: 5, d: 260, az: -25, el: 14 }` | `benchLight(0)` | CLOSE |
| raccord | `benchFromCabin(VIEW.bustle, PACK_IN_DOOR)` — vérifié : même place, même taille | `explode` 0 | CLOSE |
| `exploded` | `{ ...P, tx: 0, ty: 57, tz: 8, d: 360, az: -28, el: 18 }` | `explode` 1, `fy` 50 | SHARP |
| `secret` (les bouches dans l'éclaté) | `{ ...P, tx: 0, ty: 72, tz: 16, d: 210, az: -20, el: 20 }` | `explode` 1, `named` 5 | CLOSE |
| `girt` | `{ ...P, tx: 0, ty: 0, tz: 55, d: 220, az: -25, el: 16 }` | `explode` 1, `named` 4, `fy` 20, `fz` 30 | CLOSE |
| `rig` | `{ ...P, tx: 20, ty: 40, tz: 0, d: 480, az: -22, el: 12 }` | `explode` 2, `fy` 40, `fs` 120 | SHARP |
| `bottle` | `{ ...P, tx: 122, ty: 8, tz: 30, d: 130, az: -30, el: 18 }` | `explode` 2, `fx` 122, `fy` 10, `fz` 20, `fs` 60 | CLOSE |
| `asp` (de profil, coupée) | `{ ...P, tx: -23, ty: 84, tz: 0, d: 95, az: 0, el: 6 }` (d 80 pour ≈ 55 % de la hauteur) | `explode` 2, `see` 1, `fx` -23, `fy` 80, `fs` 60 | CLOSE |
| `leak` | `{ ...P, tx: -23, ty: 88, tz: 0, d: 115, az: 0, el: 6 }` | `explode` 2, `see` 1, `leak` 1, `tube` 0.7, `mood` 1 | CLOSE |
| `tube` | `{ ...P, tx: 0, ty: 52, tz: 0, d: 360, az: -22, el: 10 }` | `explode` 2, `tube` 0 → 1, `fy` 50, `fs` 100 | SHARP |
| `thumbAir` (miniature de secours) | `{ ...P, tx: 0, ty: 84, tz: 0, d: 150, az: -15, el: 22 }` | `explode` 2, `air` 1, `valve` 1, `gas` 1, `jet` 1, `tube` 0.6, `fy` 75, `fs` 80 | SHARP |
| `seat` | `VIEW.seat` tel quel | `benchLight(1)`, `press` | CLOSE |
| `sled` | `{ ...P, tx: 0, ty: 60, tz: 0, d: 650, az: -20, el: 8 }` | `sled`, **`grid: 0`** | SHARP |
| `dummy` | `{ ...P, tx: -10, ty: 110, tz: 50, d: 220, az: -50, el: 6 }` | `sled` 1 → 2, `sensors`, `fz` 50, `fy` 90 | CLOSE |
| `cushion` | `{ ...P, tx: -5, ty: 38, tz: 0, d: 200, az: -30, el: 14 }` | `benchLight(2)`, `burner` 1, `mood` 1 | CLOSE |
| `doc` | `VIEW.doc` tel quel (lisible, surlignages nets) | `benchLight(3)` | SHARP |
| `twenty` | `VIEW.twenty` tel quel | `benchLight(4)` | SHARP |

La démonstration, pièce par pièce (c2) : `exploded` → `named` 1, 2, 3 (une bouffée `air` 0 → 0,5 → 0 ouvre et rallume les clapets) → `secret` (`named` 5) → `girt` (`named` 4) → … → `bottle` (`gas`) → recul `rig` → `asp` (`see` 1, `jet`, `valve`, `named` 5) → `air` + recul `tube` (`tube` 0,12 → 0,85) → `asp` (`valve` 1 → 0) → `asp`/`leak` (`leak`, `mood` 1) → recul `tube` (`tube` 1 → 0,65).

## Un cran en dessous

- La zone de dépression se distingue peu : l'intérieur coupé est déjà sombre ; le jet blanc et les clapets veille portent la phrase.
- Le débris est petit (≈ 2,5 cm) : lisible en `leak` surtout par les traînées signal et le clapet entrouvert.
- Le toboggan plié se lit comme des plis empilés (presque des planches) plus que comme de la toile souple ; le rideau à plat a des plis verticaux réguliers.
- La flamme : son cœur est faible, les braises presque invisibles à 270 px ; elle lèche le dessus de l'assise plus que la jonction.
- Le mannequin est fait de capsules (lisible, un peu « robot »).
- En cabine, `drop` 1 fait sortir le paquet par le bas du cadre `doorIn` (il tombe 73 cm sous le seuil) ; le plan dehors (avion.js) prend le relais.
- Le tuyau du paquet fermé fait une petite boucle au-dessus de la bouteille.

## À changer ailleurs

1. **`cabine.js` · `A.sill`** : posé à z = `CAB.wide.w/2 − 8` (272), il est 10 cm PLUS DEHORS que le paquet (bustle à 262) : armée, la barre part derrière le paquet, dans la porte, invisible (plan `sill`). Le mettre devant la face cabine du paquet, au plancher : `sill.position.set(0, 0, CAB.wide.w / 2 - 18 - PACK.t / 2 - 4)` (≈ 242).
2. **`world.js` · `VIEW`** : remplacer `asp`, `dummy` (le mannequin est dans le siège +z : `tz: 50`), `exploded`, `tube`, `sled` par les poses ci-dessus, et ajouter `secret`, `girt`, `rig`, `bottle`, `leak`, `thumbAir`.
3. **Chapitre c2** : `jet` 0 → 0,6 sur « file », 0,6 → 1 sur « vide » (la dépression s'assombrit entre 0,55 et 1) ; « les clapets restent veille un instant » après « referment » : garder `named` 5 une seconde.
4. **Chapitre c4** (le traîneau) : `grid: 0` sur le plan large des rails (la voie défile sous le traîneau immobile : c'est un plan qui le suit). Les sièges regardent −x (comme la cabine) : le traîneau « file » vers −x.
5. **Documents « par-dessus »** : une seule feuille ; le passage d'un document à l'autre se fait par `docIn` 0 → 1 (la nouvelle glisse depuis le fond). Une feuille de dessous demanderait un nombre de plus dans `FIRST`.
6. `benchLight(ITEM.SEAT)` : `fz: 25` centrerait mieux la lumière entre la rangée et le mannequin.

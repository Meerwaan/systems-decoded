# L01 · `casse.js` — journal

Fichier : `episodes/L01-pare-brise/src/casse.js`. Interface inchangée (`buildCasse()` → `{ mount, update }`, mêmes noms, mêmes `p`). Build OK. 30 images lues (5 planches), toutes dans le dossier temporaire.

## Ce qui est construit

- **La toile d'araignée** (feuilleté) : un réseau semé, cuit une fois par vitre sur sa surface (`onSurface`). 34 radiales (36 à l'essai) qui serpentent, font des coudes et se ramifient ; 10 anneaux polygonaux entre radiales voisines, décalés, pas tous présents (plus rares vers l'extérieur), les plus proches à 3,2 · 4,4 · 5,8 · 7,4 cm (< 8 cm, comme dans les faits) ; une étoile écrasée blanche au point d'impact (46 petites fissures + un disque poudreux). Chaque fissure est un ruban tourné vers la caméra, **jamais sous 2,2 px**, bords doux, avec sa propre facette qui accroche la lumière clé (certaines radiales brillent, d'autres restent sourdes) ; dessinée dans **les deux verres** (face extérieure et intérieure, la seconde tournée de 1,4° : l'épaisseur se voit en biais), mélange « le plus clair gagne » (aucune perle aux jonctions), plus un **liseré sombre** dessous (sinon les fissures disparaissent sur le verre clair et le film vert de `verre.js`). Entre les fissures, **les éclats** : une facette par cellule, chacune inclinée d'un cheveu, la mosaïque s'allume éclat par éclat ; rien ne bouge, rien ne vole. Léger enfoncement (0,55 cm au centre, sur les fissures seulement).
- **Les grains** (trempé) : Voronoï calculé dans le shader à partir d'une table de sites semée, cellules de 0,75 cm (≈ 44 dans un carré de 5 cm, R43 ≥ 40). Un front lumineux part de l'impact (`grains` 0 → 0,16 : « d'un coup »), puis le verre blanchit. De loin, les lignes se fondent en givre uniforme (`fwidth`) : rien ne scintille. Vitre latérale : les grains **se détachent** (le haut d'abord, des miettes restent dans le cadre) et tombent en vrais petits pavés pleins qui tournent. Témoin : ils restent en place (on les compte). Pare-brise (« et si ») : il devient blanc (alpha 0,9) et le reste.
- **Le gravillon** : caillou plein signal à facettes, sa traînée signal ; impact = une lumière qui a un endroit (deux images autour de `chip` 0,507) ; étoile et œil-de-bœuf **sur le verre extérieur seulement** (c'est pour ça que la résine peut le sauver) ; la fissure qui court vers le bas à droite **par à-coups** (cinq sauts, une pointe chaude à chaque saut) ; la résine remplit l'étoile de veille puis fond presque tout (15 % de l'étoile reste).
- **La bulle** : lentille d'air dans le film (bord brillant, reflet de la boîte à lumière) et l'auréole de film décollé autour, bord irrégulier veille.
- **Le sulfure de nickel** : grain signal facetté au cœur de la vitre latérale, halo qui monte lentement (aucun clignotement), premières fissures autour de lui à 0,82 → 1, éclair à 0,985 ; il disparaît quand les grains passent 0,2 (le front part du même point, `IMPACT.side`).
- **La vitre ordinaire d'avant** : la plaque est découpée en 44 pièces (11 rayons depuis l'impact, deux cercles de rupture, coins de la plaque) — triangles pointus au centre, longues lames, morceaux de bord. `blades` 0 → 0,12 : les fissures apparaissent (arêtes signal), la plaque vire signal ; puis les lames volent vers +z (ton visage), les plus proches plus vite, les bords restent presque au cadre. Sur la ligne (`plainLine`), elles sautent, s'éparpillent et retombent à plat sur les rouleaux (la gravité est lue dans le repère monde de la vitre).

## Ce que fait chaque nombre ici

| nombre | effet |
|---|---|
| `web` | le front des radiales (0 → 1, détendu : vite au début) ; étoile écrasée 0 → 0,12 ; pointe chaude tant qu'il pousse ; l'enfoncement 0 → 0,3 |
| `rings` | les anneaux s'allument du centre vers l'extérieur (anneau k ≈ à (k−1)/9 × 0,8) et chaque segment pousse depuis une radiale ; les éclats d'une cellule s'allument avec son anneau extérieur |
| `stick` | la veille du film le long de chaque fissure (plan médian) + un voile veille sur les éclats |
| `webOn` / `webAt` | quelle vitre ; sur le pare-brise, toile « tête » (`IMPACT.head`) ou « essai » (`IMPACT.test`, plus grande) |
| `grains` | 0 → 0,16 le front, 0,04 → 0,4 le blanchiment ; vitre latérale seulement : 0,5 → ≈ 1 les grains tombent |
| `chip` | 0 → 0,5 le caillou arrive (170 cm devant, traînée) ; 0,5 l'impact ; 0,5 → 0,8 il rebondit et s'efface ; 0,5 → 1 l'étoile se pose |
| `creep` | la fissure avance en cinq à-coups vers le bord bas-droit |
| `resin` | 0 → 0,35 la veille remplit l'étoile ; 0,5 → 1 elle cure : étoile et veille presque invisibles |
| `bubble` | 0 → 0,55 la lentille grandit (2,1 cm) ; 0,3 → 1 l'auréole s'étend (≈ 4,7 cm) |
| `nickel` | 0 → 0,5 il apparaît ; 0,55 → 0,95 la contrainte monte (halo) ; 0,82 → 1 fissures ; 0,985 éclair |
| `plain` | la plaque ordinaire entière (verre ink, contour) |
| `blades` | 0 → 0,12 elle se fend et vire signal ; 0,1 → 1 les lames partent |

## Poses qui cadrent bien (complètes, avec l'état)

- **La toile qui pousse, dehors, de près** (la meilleure image du fichier : radiales, anneaux, éclats, ta tête de verre derrière) : `{ "tx": -37, "ty": 122, "tz": -45, "d": 120, "az": -150, "el": 12, "fov": 32, "shift": 0, "side": 0 }` · CAR, `{ "web": 0.6, "rings": 0.6 }` puis `{ "web": 1, "rings": 1, "stick": 0.3 }`.
- **L'accroche** `VIEW.hook1` (= `POSE0`) : la toile se lit mais ne fait que ≈ 160 px de large ; à 16:9 la thèse du film mérite plus près (voir ci-dessus, ou `d` 250).
- **De tes yeux** `VIEW.hook3` + `{ "web": 1, "rings": 1, "stick": 1 }` : la toile autour de ta tête, le film veille derrière.
- **L'essai** `VIEW.frame` + `{ "set": 2, "cut": 1, "print": 1, "bend": 1, "film": 1, "pos": 11850, "drop": 1, "web": 1, "rings": 1 }` (lisible, mais la toile pâlit sur le film vert très éclairé : `litFilm` plus bas aide).
- **L'éprouvette** `VIEW.plate` + `{ "sample": 1, "ball": 1, "web": 0.8, "rings": 0.8 }`.
- **Le témoin, compté** : `{ "tx": 12250, "ty": 101, "tz": 0, "d": 70, "az": -20, "el": 60, "fov": 28, "shift": 0, "side": 0 }` · LINE (`at` = `four+2`), `{ "set": 2, "witness": 1, "grains": 1, "strike": 1 }` — les grains d'≈ 1 cm se comptent.
- **La latérale qui éclate puis tombe** `VIEW.sideIn` + `{ "sideOn": 1, "grains": 0.3 }` puis `0.7`.
- **Le nickel** : `{ "tx": -88, "ty": 120, "tz": 20, "d": 60, "az": 75, "el": 4, "fov": 40, "shift": 0, "side": 0 }` · CAR, `{ "sideOn": 1, "nickel": 0.5 }` (un point signal net dans la vitre sombre ; plus près encore pour « en gros plan »).
- **La bulle** : `{ "tx": 18, "ty": 106, "tz": -86, "d": 45, "az": 172, "el": 30, "fov": 32, "shift": 0, "side": 0 }` · CAR, `{ "bubble": 1 }`.
- **Les lames** : `VIEW.carWide` + `{ "plain": 1, "blades": 0.5, "hero": 0 }` ; sur la ligne `{ "tx": 5120, "ty": 100, "tz": 0, "d": 420, "az": -22, "el": 30, "fov": 28, "shift": 0, "side": -160 }` + `{ "set": 2, "plain": 1, "blades": 0.6 }`.
- **Le gravillon** : `VIEW.chip` marche mais l'étoile n'y fait que ≈ 30 px ; prendre `d` 55–60 sur la même visée pour « l'impact », garder 120 pour « la fissure court » (≈ 30 cm de long).

## Ce qui n'est pas au niveau

- **La bulle** : l'auréole se lit, la lentille d'air vue en biais ressemble à un petit cône gris. Un cran en dessous.
- **Le gravillon dans `VIEW.chip`** : juste mais petit (voir pose). Le caillou en vol (`chip` 0,3) n'a pas été revu après le raccourcissement de sa trajectoire (170 cm au lieu de 360 : il sortait du cadre).
- **La toile sur le film vert très éclairé** (essai, intérieur) : le liseré sombre l'a sauvée, mais elle reste moins contrastée que sur fond sombre.
- Non revus en image après réglage : la vitre latérale **feuilletée** étoilée (`webOn: "side"`), le pare-brise en grains (`grainsOn: "hero"`), `stick` après réduction du halo (moins large : 0,32 cm, 3,6 px min, 60 %).
- L'enfoncement ne touche que les fissures (le verre de `verre.js` reste plat) : gardé à 0,55 cm pour ne pas décoller.

## À changer ailleurs

- `plan.js` (facultatif) : la place de la bulle est une constante de `casse.js` (`BUBBLE = [18, -30]`) ; si on la veut au contrat : `IMPACT.bubble = [18, -30]` et `casse.js` la lira.
- `world.js` (si le film veut le carré de comptage du témoin) : un nombre `count: 0` (0–1) dans `FIRST`, passé à `casse.update` — je dessinerai le carré de 5 cm et ses ≥ 40 grains surlignés. Non fait : il n'existe pas.
- `verre.js` (facultatif) : un enfoncement du verre lui-même au point d'impact (la tête qui pousse) n'est pas possible depuis `casse.js`.

# L03 · journal du décor `cabine.js` (2026-10-22)

Fait. L'interface d'origine est gardée : `buildCabine() → { group, A, set(p, time, px) }`, les ancres `bustle` (même place : `PACK_IN_DOOR`, même orientation), `lever`, `you.head`, `you.hands`, `bag`, `hatch`, `exit`. **`sill` a bougé** (voir « À changer ailleurs »).

## Comment c'est construit

- **La structure** : des tubes de lumière (jamais sous 1,9 px, plus sombres quand ils devraient être plus fins, éteints à moins de 80 cm de l'objectif) au lieu de traits. Ce qui se répète de rang en rang (cadres tous les deux rangs, hublots, lampes, haut-parleurs, sièges) **fond là où un pas de rang tient en moins de ~8 px** (`spanPx`, mesuré dans le shader) : la cabine vue en enfilade devient une profondeur douce, pas une grille qui grouille.
- **Sièges et passagers** : coques de verre (`asShell`) dans un shader à nous (la lumière du verre du kit + ce fondu + un fondu lointain + un fondu tout près de l'objectif + la fumée + la coupe). PLEINS : les sièges près de toi (rangs 4 à 7, bloc gauche et bloc du milieu), au 737 les rangs 7 et 8 côté droit (le passage) ; ton sac, le levier, la poignée, les ferrures, la trappe, le mégaphone, les obstacles, les poupées, les extincteurs.
- **La foule** : un seul maillage de verre déplacé dans son shader : assis → debout (`crowd` 0 → 0,15) → chacun sort de sa rangée, remonte son allée, tourne dans sa porte et s'y efface, en file (58 cm entre deux, les premiers rangs d'abord, le siège côté allée d'abord). Cinq voisins autour de toi sont des `makeFigure` posées sur le CPU par la même loi (`walkOf`).
- **LA FUMÉE** : un volume marché (la méthode de la couche de gaz du 012) : un dessous qui pend en volutes et roule vers l'avant (vivant dès l'image 1), trois à cinq nappes superposées, sombre, teintée signal, presque sans lumière propre (un peu éclairée par-dessous, plus chaude côté feu). Aucun `pow`/`sqrt`/division non borné. Tracée juste après les pleins et **testée contre leur profondeur** (un siège plein devant la cache) ; tout ce qui brille (verre, tubes, lampes, panneaux, hublots, flammes) est assombri par la fumée entre lui et l'œil (`smokeT`, analytique) : une lampe dans la fumée se noie. Œil dans la fumée : l'autre face de la boîte, sans test (tout est dedans).
- **LA LIGNE AU SOL** : un tube veille à 2 cm du plancher, ses lampes tous les 16 cm (fondues au loin en un trait égal), une flaque douce au sol ; à moins de ~1,5 m d'une sortie, des tirets qui courent vers la porte (34 cm, 24 cm/s : 1/40 de tiret par image). Elle longe chaque allée côté bloc gauche (et droit), tourne dans 1L / 1R à l'avant et 2L / 2R à l'arrière ; au 737 une branche traverse l'allée et passe dans le passage de 27 cm jusqu'à la trappe. Dessinée après la fumée (elle n'y entre jamais). `glow` : la bande photoluminescente, continue, plus douce, flaque plus large.

## Ce que fait chaque nombre

- `layout` 0 gros-porteur (3-3-3, allées z ±110, 16 rangs + porte 2 + 5 rangs qui s'enfoncent dans le noir) · 1 monocouloir (3-3, allée z 0, trappe droite derrière le dossier du rang 7).
- `lights` lavis chaud au plafond (bandes douces), le verre des sièges plus clair, le cadre des hublots ; `emerg` petites lampes sur les lèvres des coffres et autour des portes ; `signs` panneaux de sortie veille (cadre, flèche, porte ; aucun mot) et lampes hautes ; `pa` grilles rondes des haut-parleurs au plafond qui respirent (≈ 0,2 Hz), froides à 0.
- `smoke` le bas de la fumée : 1 = 1,20 m, 1,5 = 60 cm ; `fire` la lueur signal derrière les hublots GAUCHES (plus forte vers l'arrière, respiration lente) et le dessous de la fumée chauffé côté gauche ; `breach` les flammes au pied de la paroi gauche et par le plancher, qui gagnent de l'arrière vers l'avant, braises qui montent, hublots plus chauds.
- `pax` passagers de verre (fondu) ; `crowd` voir plus haut ; `floor`, `glow` la ligne.
- `you` 0 → 1 tu apparais assis (rang 6, siège côté allée), 1 → 1,45 tu te lèves, 1,4 → 2 tu passes dans l'allée. Ta tête est pleine (gris), le reste verre.
- `bag` 0 couché sous le siège devant toi (sa moitié arrière dépasse vers toi) → 1 dans ta main droite : à tes pieds côté allée si tu es assis, pendu le long de ta jambe si tu es debout.
- `crew` 0 → 1 l'hôtesse à la porte (sa main gauche sur le levier tant que `arm` est entre 0 et 1), 1 → 2 elle se tourne vers l'arrière, le mégaphone (plein) levé à la bouche.
- `door` 0 → 0,3 la porte 1L sort de 14 cm, 0,3 → 1 son bras la porte vers l'avant, **parallèle à la peau** (une porte d'A350) ; le paquet suit (dans `bustle`). `arm` le levier tourne (55° → −40°) et un voyant veille s'allume armé.
- `bins` (gros-porteur) les portes des coffres latéraux s'ouvrent au-dessus de l'allée, des bras de verre montent, des sacs pleins sortent des coffres. Fermés, les coffres ne sont que leurs tubes (le verre si près de l'objectif faisait des barres blanches).
- `obstacles` sacs (→ 0,33), couvertures (→ 0,66), oreillers (→ 1), tombés un par un dans les allées ; `dolls` trois poupées pleines dans des avant-bras de verre (rangs 2, 9, 12).
- `hatch` (737) 0 → 0,5 tirée vers l'intérieur, levée au-dessus des dossiers et tournée sur la tranche dans les bras d'une figure debout dans le passage ; → 1 jetée dehors, le trou ouvert, l'aile en traits dehors. `wider` le siège hublot du rang 8 (derrière le passage) glisse et s'efface. `panels` les joints des panneaux muraux et du plafond en veille. `extinguisher` deux extincteurs pleins sur la cloison avant (un puis deux).
- `cut` la coupe balaie de l'avant jusqu'au premier rang (porte, office, hôtesse, cloison s'en vont) ; le dessous de la fumée se resserre (volutes 44 → 4 cm) et un trait veille fin marque 1,20 m dans le plan de coupe.
- `mood` : rien dans la cabine.

## Les poses qui cadrent bien (prêtes à coller ; `P = { fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }`, état en plus de `AT.*` ou des valeurs de base)

- `hook1` = `POSE0` tel quel, avec `FIRST` : la ligne part du bas-gauche jusqu'à la porte, la fumée sombre roule au-dessus, les sièges près de toi pleins. **Tient.**
- `hook4` tel quel + `{ smoke: 1, emerg: 1, pax: 1, fire: 0.8, floor: 1, signs: 1 }` : la caméra (y ≈ 150) est DANS la fumée à `smoke` 1 → l'image entière voilée de rouge sombre, les deux lignes et les lampes. Correct, mais pour voir la fumée « descendre », baisser `ty` à 40 ou `smoke` à 0,8.
- **`thumbSmoke`** (miniature 2, 2,2 s) : `{ ...P, ...SHARP, tx: 500, ty: 150, tz: 115, d: 700, az: 86, el: -9, fov: 36 }` + `{ smoke: 0.75, emerg: 1, signs: 1, pax: 1, floor: 1, fire: 0.7, pa: 1 }` : la masse sombre de la fumée sur la moitié haute, les lampes qui s'y noient, un panneau veille, les hublots gauches en signal, la ligne en bas.
- **`thumbBag`** (miniature 3, 24,1 s) : `{ ...P, ...CLOSE, tx: 742, ty: 52, tz: 92, d: 200, az: -95, el: -4, fov: 30 }` + `{ you: 2, bag: 1, smoke: 0.9, emerg: 1, pax: 1, floor: 1, fire: 0.6 }` : le sac plein pendu à ta main, ≈ 45 % de la hauteur, la fumée rouge sombre derrière, la ligne qui file au sol. (`d` 180 → ≈ 50 %.)
- `section` : `{ ...P, ...SHARP, tx: 600, ty: 95, tz: 0, d: 1000, az: -90, el: 0, fov: 34 }` + `{ cut: 1, smoke: 1, floor: 1, pax: 1, emerg: 1 }` — **la caméra doit rester sous 1,20 m** (la pose de l'architecte, `ty` 125 / `el` 2, la mettait dans la fumée).
- `aisleLow` : `{ ...P, ...CLOSE, tx: 300, ty: 4, tz: 140, d: 260, az: 88, el: 6, fov: 30 }` + `{ floor: 1, smoke: 1.3, pax: 1, emerg: 1 }` ; la variante `{ glow: 1, floor: 0, emerg: 0, pax: 1 }`. (Celle de l'architecte est DANS un siège plein.)
- `exit` (la ligne qui entre dans 1L) : `{ ...P, ...CLOSE, tx: 20, ty: 10, tz: 200, d: 300, az: 120, el: 14, fov: 32 }` + `{ floor: 1, emerg: 1, smoke: 0.9, signs: 1, pax: 1, fire: 0.6 }`.
- `you` : `{ ...P, ...CLOSE, tx: 760, ty: 100, tz: 175, d: 170, az: 160, el: 25, fov: 32 }` + `{ you: 1, pax: 1, emerg: 1, smoke: 0.6 }` (au-dessus de l'allée, en plongée ; celle de l'architecte était derrière trois rangs).
- `bag` (sous le siège) : `{ ...P, ...CLOSE, tx: 694, ty: 12, tz: 170, d: 110, az: 140, el: 10, fov: 32 }` + `{ you: 1, smoke: 0.8, emerg: 1, pax: 1 }`.
- `doorIn` tel quel + `{ lights: 1, arm: 1 }` ; `bustle` : `{ ...P, ...CLOSE, tx: 0, ty: 45, tz: 255, d: 230, az: 150, el: 12, fov: 30 }` + `{ lights: 1, arm: 1 }` (le paquet plein lu à travers le verre) ; `lever` : `{ ...P, ...CLOSE, tx: 28, ty: 105, tz: 252, d: 120, az: 150, el: 8, fov: 30 }` ; `sill` : `{ ...P, ...CLOSE, tx: 0, ty: 4, tz: 236, d: 120, az: 150, el: 24, fov: 30 }` (les deux ferrures, la barre dedans) ; porte ouverte : `{ ...P, ...SHARP, tx: -40, ty: 100, tz: 250, d: 560, az: 125, el: 8, fov: 30 }` + `{ door: 1, lights: 1, floor: 1, emerg: 1 }`.
- `crewFront` : `{ ...P, ...CLOSE, tx: -20, ty: 140, tz: 170, d: 380, az: 50, el: 4, fov: 30 }` + `{ crew: 2, smoke: 0.7, emerg: 1, pax: 1, crowd: 0.15 }` (de trois quarts : de face, le pavillon du mégaphone se lit comme une tête pleine). La main sur le levier : `doorIn` + `{ crew: 1, arm: 0.5 }`.
- `speaker` : `{ ...P, ...CLOSE, tx: 839, ty: 243, tz: 118, d: 120, az: 70, el: -60, fov: 30 }` + `{ pa: 1 }` (ancre `A.speaker`).
- La foule qui sort : `{ ...P, ...SHARP, tx: 300, ty: 110, tz: 130, d: 700, az: 75, el: 14, fov: 36 }` + `{ crowd: 0.4, pax: 1, emerg: 1, smoke: 0.7, floor: 1, door: 1, fire: 0.6 }`.
- Le feu qui entre : `{ ...P, ...SHARP, tx: 1100, ty: 60, tz: 200, d: 700, az: 110, el: 6, fov: 36 }` + `{ breach: 0.6, fire: 1, smoke: 1.1, floor: 1, emerg: 1 }`.
- 737 — `hatch` : `{ ...P, ...CLOSE, tx: 861, ty: 105, tz: -130, d: 300, az: 40, el: 22, fov: 32 }` + `{ layout: 1, lights: 1, pax: 1, hatch: 0.5 }` ; le trou : `{ ...P, ...SHARP, tx: 861, ty: 70, tz: -200, d: 380, az: 30, el: 24, fov: 34 }` + `{ hatch: 1 }` ; `passage` (de haut) : `{ ...P, ...CLOSE, tx: 861, ty: 40, tz: -110, d: 190, az: 90, el: 62, fov: 34 }` + `{ layout: 1, lights: 1, floor: 1, wider: 0 }` puis `{ wider: 1 }` — **sans passagers** (leurs têtes de près couvrent le passage) ; `narrowAisle` : `{ ...P, ...SHARP, tx: 500, ty: 100, tz: 0, d: 800, az: 85, el: 3, fov: 34 }` + `{ layout: 1, panels: 1, extinguisher: 1, lights: 1, pax: 1, floor: 1 }`.

**En mouvement** : à éviter — longer l'allée vite (au-delà de ~40 cm/s la caméra traverse des rangs plus vite qu'ils ne fondent), traverser une rangée de sièges ou un coffre, une caméra au-dessus de 1,20 m quand `smoke` ≥ 1 (elle entre dans le voile), une caméra qui passe à moins d'un mètre des têtes de verre. Sans risque : les poussées lentes depuis `hook1`, `thumbSmoke`, `aisleLow` (en hauteur d'allée), les bascules de haut en bas de `HAND.c34` (plafond → sol), les trois quarts de la porte (`doorIn` → `lever` → `bustle`), la coupe (`section` : rien ne défile).

## Un cran en dessous

- Le sac **couché** sous le siège se lit comme une caisse (la poche vue de dessus) ; il se lit bien debout et pendu (miniature 3).
- `bins` : les portes ouvertes et les bras levés se lisent mal dans la foule ; les poupées (`doll` : `tx: 428, ty: 66, tz: 175, d: 120, az: -60, el: 24`) sont noyées dans les jambes de verre des passagers assis (de près, leurs cuisses en capsules font des « boudins »).
- La fumée vue de l'intérieur (caméra dedans) est un voile rouge sombre sans relief : c'est juste, mais les volutes ne se voient que d'en dessous.
- En coupe, la couche au-dessus de 1,20 m est sombre plus que lisible comme une matière : c'est le trait veille et l'assombrissement qui la disent.
- L'aile hors du trou de la trappe : quatre traits faibles. Les têtes des voisins de près restent des sphères de verre.
- Le panneau de sortie au-dessus de 1L disparaît dans la fumée dès 0,55 (il est à 2,11 m) : voulu, mais la première image n'a donc pas de panneau à la porte.

## À changer ailleurs

- `world.js` · `VIEW` : remplacer `aisleLow`, `you`, `bag`, `section`, `sill`, `crewFront`, `hatch`, `passage` par les poses ci-dessus (celles de l'architecte sont dans un siège plein, dans la fumée, ou derrière trois rangs) ; ajouter `thumbSmoke`, `thumbBag`, `exit`, `speaker`, `bustle`/`lever` réglés.
- **`A.sill` est à `(0, 0, w/2 − 48)` = z 232** (au lieu de w/2 − 8) : les ferrures sont devant le bas de la porte, côté cabine, là où la barre descend ; à 272 elles étaient cachées sous le paquet. `world.js` le lit à chaque image : rien à changer, mais `model.js` doit faire descendre la barre jusque-là (≈ 1 cm de haut, 14 cm devant la face du paquet).
- La foule de l'allée DROITE sort par **1R** (pas 1L) : à Haneda 1L et 1R se sont ouvertes ; au 737 tout le monde sort par 1L. Si un chapitre veut tout le monde par 1L, c'est une ligne (`exits` dans `cabine.js`).
- `A` gagne : `exitNarrow`, `door`, `crew`, `megaphone`, `speaker`, `sign`, `doll`, `window`, `line120`, `passage`, `extinguisher`, `bins`, `door2`.
- Le décorateur : la place libre est sur les sièges vides, les tablettes, l'office, le sol de l'allée avant (x −150 → 230), les coffres ; les obstacles de l'essai sont déjà à moi.

## Images lues : 59 (planches de 8, 8, 8, 8, 8, 8, 4, 6, 3) — au-delà du budget de 30.

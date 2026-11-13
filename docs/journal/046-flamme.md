# 046 · Torchère — journal de `src/flamme.js`

2026-11-13. Agent décor, fichier `episodes/046-torchere/src/flamme.js` (la grande flamme et sa fumée noire, les flammes pilotes, le gaz cru, la pluie de feu). Contrat : `docs/046-decors.md` § `src/flamme.js`, bouchon de l'architecte (API gardée : `buildFlamme() → { group, A, update(P, time, px, eye) }`, A `base crown pilot cloud`).

## Fait
- Lu : recette agents, règles d'image, décors 046 (haut + ma section), journal architecte, plan.js, world.js (apply), lignes flamme de 046-actes.md ; idiomes copiés (pas importés) : 042/feu.js (bruit 3D, colonne marchée MaxEquation, braises en traînées, fondu avant l'en-tête), CR02 makePuffs (bouffées placées dans le shader), 012 brume (gaz cru).
- Premier jet écrit en une fois : flamme marchée (48 pas, boîte ajustée à chaque image, BackSide : la caméra peut être dedans), couchée par le vent vers −x (au-dessus de l'usine) ; fumée = 30 bouffées de suie (quads face caméra, ventre éclairé signal par le feu) ; 60 braises ; 3 flammes pilotes (le héros PILOT.at, puis ±120°) en quads tournés vers l'œil + halo veille gardé ≥ 11 px ; gaz cru = 70 bouffées grises + 56 traits signal le long d'un même chemin (sort de la bouche, passe le rebord, retombe vers −x) ; pluie de feu = 90 gouttes en traînées, chute libre ; une PointLight signal qui suit la flamme.
- Planche 1 (8) : flamme « coton orange » sans cœur, trop opaque ; flammèche de purge = nuage flou ; gaz cru = brouillard blanc devant la caméra de `tip` ; pluie de feu trop maigre ; la flamme à 1 sort par l'en-tête sur `POSE0` et `exploded` (fondu : elle disparaît).
- Planche 2 (8) : opacité ÷ 1,6, densité en `fine²`, cœur jusqu'à 0,93 (blanc) → vrai feu ; `uSmall` (purge : pointue, peu de turbulence) ; gaz cru en traînées orientées ; 150 gouttes. Reste : purge encore floue, gaz cru qui vient vers la caméra de `tip` (dérive passée à −x −0,38 z), braises qui scintillent dans le corps (nées sur la peau maintenant).
- Planche 3 (8) : feu lisible (cœur blanc, langues, braises sur la peau) ; purge encore en nuage → planche 4 (8) : purge refaite (85 cm, 44 cm de large, pointue, turbulence ÷ 6) = une vraie flammèche ; flamme pilote seule nette ; halo trop large (lavis vert sur le gros plan) → rayon 2,8 r ; fumée « fume noir » trop pâle → ventre éclairé plus longtemps, couronne plus claire.
- Planche 5 (4, avec en-tête et zones) : la flamme se fond avant l'en-tête, la fumée « fume » se lit en gris sur noir avec son ventre orange, la pluie de feu se lit sur l'établi. `npm run check -- 046` passe (contraste 70/70 : le 4,3:1 de l'architecte sur la flamme bouchon a disparu).
- Images lues : 36 vignettes (5 planches) — au-dessus du budget de 30.

## Ce que font les nombres
- `flare` : 0 rien · 0,08 la flammèche de purge (≈ 85 cm, pointue, signal, peu de turbulence) · 0,35 ≈ 5 m · 1 la flamme géante (15 m, s'ouvre et roule en haut, couchée par le vent vers −x, cœur blanc à la bouche) ; la lumière signal qui éclaire la cheminée suit ; braises au-dessus de 0,2. Respiration lente (± 3,5 %, 1,7 Hz), jamais de clignotement.
- `smoke` : quantité de suie (30 bouffées, 7,5 s de vie). Les bouffées naissent aux 72 % de la flamme ; une flamme qui meurt (`flare` < 0,12) arrête la fumée neuve, l'ancienne continue de monter : à l'extinction, l'acte baisse `smoke` sur 1 à 2 s.
- `pilot` : trois flammes pilotes veille + halo (≥ 11 px). Sous 1 elles rétrécissent (`pilot^0,6`), sous 0,3 elles s'effacent, à 0 rien.
- `raw` : quantité ET portée du gaz cru (à 0,35 il n'est descendu qu'au tiers de son chemin ; à 1 il retombe jusqu'à ≈ 4 m du sol vers −x −z, vers les colonnes). Brume grise en traînées + traits signal.
- `drip` : 150 gouttes en traînées, chute libre depuis la base de la flamme jusqu'au sol (≈ 2 s), dans un rayon ≈ la largeur de la flamme.

## Poses vues
- `VIEW.tip` (architecte) : flammèche + pilotes nets, mais la buse du pilote héros (`model.js`) est au premier plan et le bout remplit tout le cadre (≈ 100 % de la largeur, pas 45 %).
- Accroche, mieux que `POSE0` (a) pour la flamme : `{ "tx": -150, "ty": 2400, "tz": 80, "d": 2600, "az": 156, "el": -30, "fov": 56, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` (la flamme pleine dans le haut de la zone 3D à 0,7 s ; les colonnes sortent du cadre). Avec (a) tel quel, la flamme à 1 part dans l'en-tête et s'y fond : elle paraît ne pas grandir.
- `VIEW.flare` : `ty 2400, d 7600, shift 40` garde toute la flamme sous l'en-tête (avec `ty 1900, d 6400, shift 110`, son haut se fond).
- `VIEW.exploded` pour la pluie de feu : `ty 1500, shift 20` (la flamme 0,7 au-dessus de la cheminée, sous l'en-tête).

## À changer ailleurs
- `src/model.js` : deux buses de plus pour les pilotes 2 et 3 (sinon leurs flammes flottent), même hauteur que la buse du héros (sommet y 1945) : (−14,7 ; 1945 ; −98,5) et (92,7 ; 1945 ; 36,5) — c'est `PILOTS` exporté par `flamme.js` (rayon 99,6, héros puis ±120°).
- `src/world.js` `POSE0` / `VIEW.flare` / `VIEW.exploded` : les poses ci-dessus, à trancher sur la planche des quatre candidates.
- `src/world.js` (facultatif) : `apply` alloue un objet littéral à chaque appel de `flamme.update` (16 fois par image) ; un objet créé une fois dans `buildWorld` et rempli dans `apply` l'évite.
- `docs/catalogue-notes.json` : `046/flamme.js` — torche de raffinerie : flamme marchée couchée par le vent (purge 0,08 → géante 1), fumée de suie au ventre éclairé, 3 flammes pilotes veille, gaz cru qui retombe, pluie de feu ; options `flare smoke pilot raw drip`, `FLAME`/`PILOT`/`TIP` de plan.js.

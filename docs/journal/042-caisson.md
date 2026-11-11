# 042 · caisson.js — journal du décor (le système, plein)

08/11. Contrat : bouchon de l'architecte, `docs/042-decors.md` § caisson.js. Exports et nombres gardés tels quels.

## Ce qui est construit (premier jet)

- **La boîte** : dalles chanfreinées (`box`), fonte sombre 0x3a4046, lèvres du rebord plus claires (usinées), la cloison percée de deux ouvertures ; la paroi +z est un groupe à part (`section` : le plein s'efface, un fantôme de verre + arêtes reste, jamais retiré).
- **Le feu dedans, sans voile** : une lumière de feu injectée dans les seules matières du caisson (`onBeforeCompile`, deux points de feu) — elle n'éclaire que les faces tournées vers le feu (intérieur, obus, dessous du panneau), jamais le sol de l'établi ni l'extérieur ; langues de flamme en billboards (un appel), braises qui montent, un point d'allumage à cœur blanc ; à `burn` haut, les arêtes de la boîte virent au signal et la fente du panneau s'allume.
- **Les obus** : 34 tours de profil (culot clair, douille gris chaud mat, ogive sombre), fusionnés par matière ; l'obus `grab` à part. Assombris quand `press` monte.
- **Le panneau** : le plus clair, 2,5 cm, bombé par morph (bords tenus, 18 cm au centre : ×3 sur le plan pour se lire ; grain `finish` coupé, `env` 0,3), quatre boulons, une patte vers la tringle ; fente de lumière tout autour quand il décolle ; vol C1 (4 cm à 0,05, 40 cm à 0,15, ≈ 25 m à 1), penché puis deux tiers de tour.
- **Les portes** : vantaux morphés (`bow`), joint = cadre veille incrusté au bord de chaque vantail ; `leak` : son côté intérieur passe au signal + une langue de gaz ; glissières haut et bas (prolongées à z 152 pour la course de 72 cm).
- **Le verrou** : came = un **disque à profil d'œuf** (22 × 16, 10 d'épaisseur le long de l'arbre, arrondi partout, pointe en haut au repos, gros bout autour de l'arbre), sur un arbre tenu par deux équerres posées sur la glissière basse ; manivelle, fourche, tringle, chape, goupille en haut — tous côté −z, derrière l'œuf pour la caméra. **La tringle et la came sont liées** : 10 cm de tringle = 80° de came ; à 80° la pointe de l'œuf se pose sur les deux vantaux.
- **Les flèches** : signal, cernées de noir, dessinées par-dessus tout (`depthTest` coupé) ; six, une par face, posées pointe sur leur face, nées une à une.
- **Le bloc du like** : morph « oreiller » sur ses six faces + fissures signal qui courent (segments dessinés progressivement).

## Écarts au plan (assumés)

- Came : un œuf qui tourne autour de son grand axe ne se voit pas tourner (planche 3 : « une bille ») → disque à profil d'œuf, qui passe d'œuf debout à œuf couché. Son arbre à x −80,9 (plan : −73) pour que sa pointe (13,8 cm de l'arbre) touche les vantaux pile à 80° ; au repos, 6 cm de jour. `A.cam` est sur le vrai arbre.
- Tringle à x −87,1, z −7,8 (plan : −71, 0) : là où tombe le maneton de la manivelle (8,3 cm), et derrière l'œuf pour `VIEW.cam` (à z +7,8 elle le barrait). Patte du panneau jusqu'à elle (x −91 → −52). `A.rod` suit la vraie tringle.
- Bombé du panneau ×3 (18 cm au centre) : à ×1 il ne se lit pas ; il se lit **de bas** (el ≤ 10), jamais à el 22.
- `lock` : la tringle monte sur 0 → 0,9 et entraîne la came (liées), 0,9 → 1 la came plaque (vantaux +0,5 cm, joint plus vif) et la goupille casse (éclat ink).

## Planches (`.cache/planches/042/caisson/p1…p5.jpg`, 40 vignettes lues : budget de 30 dépassé)

1. p1 : l'œuf (VIEW.cam) lit un œuf ; section + feu lisible ; POSE0 : caisson aux arêtes rouges derrière la tourelle, fente sous le panneau. **Ratés** : panneau qui fait une bouffée verte (grand plan lisse qui reflète le studio), flèches trop petites, joints trop forts, `bow` invisible (bords tenus = silhouette inchangée), flammes en rang de bougies.
2. p2 : flèches lisibles une à une puis l'étoile ; `vent` lisible (les flèches sortent par le toit) ; `bow` lisible depuis que les côtés libres plient et que le cadre du joint plie avec ; `leak` : fente + langue lisibles. Panneau marbré (grain `finish`).
3. p3 : bloc qui se fend lisible (crack 1) ; bombé lisible à el 8 ; **la came ne se voit pas tourner** ; fente du panneau = une bande en gros plan (bornée à 3 cm depuis).
4. p4 : panneau propre (env 0,3, grain coupé) ; came en disque-œuf : debout au repos.
5. p5 : la came se couche vers les portes (lisible à az −46, très lisible à az −26) ; VIEW.cam : l'œuf seul, liseré veille, la tringle sur son bord ; `burn` 0,2 : une douille s'allume ; 0,7 : lit de feu + langues entre les obus.

## Poses qui cadrent bien

- Came qui tourne, chaîne panneau → tringle → came en un cadre : `{ tx: -76, ty: 2, tz: 6, d: 300, az: -26, el: 5, fov: 30, dof: 8 }` (mieux que `VIEW.mech` à az −46, où l'œuf couché se voit par le bout et paraît rond — il s'y lit encore : debout → penché → couché).
- Le bombé du panneau (principe) : `{ tx: 0, ty: 10, tz: 0, d: 1100, az: -30, el: 8, fov: 30 }`, `section` 1, `press` 1, `bulge` 1, `weak` 1.
- Pour que la chaîne se suive en mouvement : pendant `lock` 0 → 0,9, tenir `blow = 0.05 + 0.028 · lock / 0.9` (le panneau monte de 10 cm avec la tringle), puis lâcher `blow` après `lock` 1 (la goupille a cassé).
- `VIEW.doorClose`, `VIEW.system`, `VIEW.exploded`, `VIEW.secBench`, `VIEW.like`, `POSE0` : bons tels quels.

## Ce qui n'est pas au niveau

- L'éclaté : les obus reculent **à travers** la paroi arrière (le plan l'écrit ainsi) ; lisible comme « les obus sortent par l'arrière », pas propre.
- Le bombé ne se lit pas depuis `VIEW.secBench` (el 22) : il faut la pose basse ci-dessus.
- Les flèches de face restent petites dans `VIEW.secBench` (d 1 350) : lisibles, pas grandes.
- Non revu en image après correction : normales lissées de l'œuf (des bandes en très gros plan), la fente bornée à 3 cm vue de POSE0, `door` 0,12 et `grab` (construits, non regardés).


## À changer ailleurs

- `world.js`, `VIEW.cam` (l'arbre de la came est à x −80,9, son œuf centré 3 cm plus haut) : `cam: { ...P, ...CLOSE, tx: -190, ty: 11, tz: 30, d: 160, az: -64, el: 10, fov: 30 },`
- `world.js`, `VIEW.mech` (au choix du chef, si l'ordre des azimuts le permet) : `mech: { ...P, ...CLOSE, tx: -76, ty: 2, tz: 6, d: 300, az: -26, el: 5, fov: 30 },`
- `world.js`, `LIGHT.lock` : `lock: { fx: -80, fy: 0, fz: 0, fs: 60 },`
- `docs/042-actes.md` (acte 3, le verrou) : « pendant `lock` 0 → 0,9, `blow = 0.05 + 0.028 · lock / 0.9` ; `blow` libre après `lock` 1 » ; et pour le bombé du principe, la pose basse (el 8) du journal caisson.
- Catalogue (après rendu) : `042/caisson.js` — un caisson blindé plein, en coupe (paroi de verre), panneau de toit qui bombe et s'envole, portes coulissantes à joints, verrou à came en œuf, feu intérieur qui n'éclaire que ses propres faces (`fireLit`), flèches de pression par-dessus tout, bloc qui se fend. Options : `explode`, `section`, `burn`, `press`/`vent`, `blow`, `lock`, `bow`/`leak`/`seal`/`door`, `crack`.


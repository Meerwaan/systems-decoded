# CR03 · reservoir.js — journal

Agent décor, 13/11. Le réservoir n° 5 en coupe (1:2) : le choc, le front dans le kérosène, le panneau qui cède ailleurs, le Kevlar. `npm run check -- CR03` passe. 10 images lues (7 planches), ≈ 28 appels.

## Lu
recette-agents, regles-image (haut), CR03-decors (haut + ma section), reconstitution.md, plan.js, world.js (VIEW, BENCHED, apply), bouchon, CR02 bop.js (tête, gasMaterial), CR01 coeur.js (makePuffs, glowTexture), CR03-actes (lignes réservoir), faits § 4 et § 12.

## Ce qui est construit
- **La baie** couchée en l'air, ouverte par x = 0 : extrados (statique, rivets dessus), intrados (grille déformable, rivets dessous, le trou du demi-panneau découpé), lisses en T inversé vues en bout dans la coupe (celles du bas suivent la cuvette), deux nervures en I (sombres) à z ± 60, longeron arrière. Trois gris : peaux claires (0,5), lisses moyennes (0,05), nervures sombres (−0,45).
- **Le kérosène** : un plan opaque à x = 0,4 derrière la face coupée (ShaderMaterial non éclairé) — ambre profond, plus sombre au fond et contre les parois, densité lente, ménisque clair qui ondule à peine sous 2 cm d'air. Son fond suit la cuvette, le bombé, le trou ouvert.
- **Le front** (`wave`) : un trait rouge (cœur 2 cm, ≤ 2,2) en demi-cercle centré sur la cuvette, traîne rouge derrière, bande sombre devant (contraste sur l'ambre), plus fort vers le panneau (+z) que vers l'arrière ; le liquide traversé plus clair. À l'arrivée (wave 0,8 → 0,96) une tache rouge discrète au-dessus du panneau ; `bulge` y garde une pression légère.
- **Le morceau de pneu** (`hit`) : un arc de bande de roulement déchiré (secteur d'anneau extrudé, trois nervures de gomme, six fils d'acier qui sortent d'un bout), ×1,35 pour qu'il se lise. Il vient d'en bas à gauche en tournant, arrive à plat (le milieu bombé d'abord) sur la cuvette ; quand le front part, il retombe et reste au sol (`wave` 0,04 → 0,8). Ne reçoit pas d'ombre (sous l'aile il était noir sur noir).
- **Le panneau** (culprit 2) : demi-panneau dans le trou + les trois lèvres du trou, même matière `alarm` (rouge par `fault`, vert par `heal(depuis)`). `bulge` le bombe vers le bas (4,5 cm) ; `tear` × (1 − kevlar) : ses 13 rivets sautent et disparaissent, il tombe vers la caméra (−x) en se retournant, se pose bombé vers le haut au sol (tear 1).
- **Le jaillissement** (`gush` × trou ouvert) : jet ambre (cône + gerbe plus large, stries qui descendent), 120 gouttes qui tombent jusqu'au sol (au ralenti).
- **Le Kevlar** (`kevlar`) : doublure d'argile claire tissée (texture de vannerie) au fond (déformable, suit cuvette et bombé), en haut et contre les nervures ; se pose de 4 cm vers les parois ; vert veille × `depuis`. Avec elle, `tear` ne fait rien : la paroi tient.
- Aucune allocation dans `update` ; grilles réécrites seulement quand `dent` / `bulge` / `kevlar` / `tear` changent, normales analytiques.

## Décisions
- **La coupe passe par le point d'impact et par le centre du panneau** (x = 0) : plan.js les mettait à x = 22 et 26, 22 cm DERRIÈRE la face coupée — à el > 0 on ne voyait ni la cuvette ni le bombé, et le front n'apparaissait dans la coupe qu'au-delà de r = 22. Ici la ligne de peau de la coupe se creuse au choc, bombe au panneau, le front est un vrai demi-cercle : tout se lit dans la section à 270 px. Le panneau est coupé en deux, comme le tube du CR02.
- Le débris part de (−26, 9, −118) local, AU-DESSUS du sol (DEBRIS.from y −40 était sous le sol de la reconstitution).
- `kero` (le kérosène « s'éclaire » sur « plein », `docs/CR03-actes.md`) : lu s'il existe, 1 sinon. 0,5 = plus sourd ; la différence est douce (pas un flash).

## Poses qui cadrent (planche p7, `.cache/planches/CR03/reservoir/`)
Coordonnées locales du réservoir, à passer dans `W("reservoir", …)`. Lumière : `STAGED.reservoir` tel quel.
- `bay` : `[18, 76, -4]`, d 470, az −62, el 5, fov 30, shift 40 — la baie entière (bord droit de la nervure +z rogné), le débris entre par le bas à gauche, le front lisible d'un bout à l'autre. d 430 possible si on accepte de rogner les deux nervures.
- `impact` : `[-2, 70, -36]`, d 120, az −48, el 2, shift 40, CLOSE — la cuvette dans la ligne de peau, le morceau de pneu dessous, les lisses en T.
- `panneau` : `[-2, 66, 30]`, d 130, az −64, el −6, shift 40, CLOSE — le dôme rouge dans la coupe, puis le panneau qui tombe devant le jet.
- `cede` (le moment « cède » → « ailleurs », sans couper) : `[10, 66, 8]`, d 380, az −58, el 4, shift 40.
- `couverture` (à `defaut$`, état `hit dent wave bulge` 1, `tear` 0,5, `gush` 1, culprit 2, fault 1) : `[10, 60, 6]`, d 350, az −56, el 5, shift 60.
- Le front se suit avec `A.wave` (sur le fond, du choc au panneau). Le cercle rouge : `A.panel` (le trou, fixe). Le halo : `A.fault` (le panneau lui-même, il bouge).

## Pour les actes et le son
- Le morceau de pneu doit arriver à `hit` 1 avec `dent` ≥ 0,4 au même instant (sinon il flotte sous la peau). Pour la séquence « Derrière la paroi… plein », `dent` 1 tenu.
- `wave` 0 → 1 de `trigger` à `cede` ; à wave 1 le front s'éteint (fondu de 0,9 à 1) : `bulge` doit monter sur « cède », pas avant.
- `depuis` : avec `BENCHED` (tear 1) le panneau est au sol, rouge puis vert ; remettre `tear` à 0 le fait remonter dans son trou à l'envers (mieux vaut le faire sous une coupe ou pendant le blanchiment).
- Sons qui appellent l'image : le choc (hit 1), les rivets qui sautent (tear 0 → 0,2), le jet (gush).

## Ce qui n'est pas au niveau
- Le plan large (`bay`) est fidèle mais petit dans le 9:16 (la baie fait 120 × 35) : à 270 px on lit tout, mais la baie n'occupe que ≈ 15 % de la hauteur.
- En plan large, le morceau de pneu en vol se lit comme trois bandes claires plutôt qu'un bloc ; de près (`impact`) il se lit bien.

## À changer ailleurs
1. `src/plan.js` (la coupe passe par le choc et le panneau ; `world.js` vise ces points pour `VIEW.impact` / `VIEW.panneau`) :
   - `export const IMPACT = { at: [0, 70, -34] }; // where the debris strikes the intrados (local) — ON the cut: the dent is drawn in the section`
   - `export const PANEL = { at: [0, 70, 30], size: 15 }; // THE panel that gives way (30 cm), centre on the cut (half of it is built)`
   - `export const DEBRIS = { size: [17, 12, 2.3], from: [-26, 9, -118] }; // the tyre piece (4.45 kg) and where it comes from (low left, above the floor)`
2. `src/world.js`, `VIEW` (remplacer les trois poses du réservoir, en ajouter deux) :
   - `bay: pose(W("reservoir", [18, 76, -4]), { d: 470, az: -62, el: 5, fov: 30, shift: 40 }),`
   - `impact: pose(W("reservoir", [-2, 70, -36]), { d: 120, az: -48, el: 2, fov: 30, shift: 40, ...CLOSE }),`
   - `panneau: pose(W("reservoir", [-2, 66, 30]), { d: 130, az: -64, el: -6, fov: 30, shift: 40, ...CLOSE }),`
   - `cede: pose(W("reservoir", [10, 66, 8]), { d: 380, az: -58, el: 4, fov: 30, shift: 40 }),`
   - `couverture: pose(W("reservoir", [10, 60, 6]), { d: 350, az: -56, el: 5, fov: 30, shift: 60 }),`
3. `src/world.js`, `FIRST` (ligne `hit: 0, dent: 0, …`) : ajouter `kero: 0.5` avec le commentaire `// `kero` the kerosene in the cut lights up (0.5 dull → 1 on « plein »)` ; et `kero: 1` dans `BENCHED`.

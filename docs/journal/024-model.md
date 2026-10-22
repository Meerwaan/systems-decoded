# 024 · Bloc opératoire — journal du système (`src/model.js`)

2026-10-17 (nuit). Agent du système : le schéma IT médical.

## Fait
- Lu : recette des agents, consigne (`docs/024-decors.md`, section `model.js`), `plan.js`, `world.js`, journal de l'architecte, faits 024 (« à ne pas dire »), `021/model.js` pour l'idiome.
- `model.js` écrit en entier (API exacte : `buildSystem()` → `{ root, A, parts, update }`).
  - Transformateur : noyau U–I en cinq tôles (rainures visibles de côté et dessus), cadre gris moyen sur deux pieds, primaire sur la jambe gauche, secondaire sur la droite (spires en bandes larges, gris clair chaud), un bornier de chaque côté ; capot (`cover`) sur la culasse ; son cadre a son conducteur de protection vers la barrette.
  - Rail : deux disjoncteurs **bipolaires** (deux pôles, une manette à barre chacun : un par circuit sortant — circuit 1 → carcasse A, circuit 2 → carcasse B, c'est ce qui fait que les deux déclenchent au double défaut), le CPI (4 modules, fenêtre sombre, jauge en colonne de huit cases sans chiffre, voyant, bouton test ; câblé à L1, L2 et à la barrette), le différentiel fantôme en verre.
  - Barrette de terre en cuivre sur isolateurs, une vis par conducteur qui s'y pose (PE réseau, PE du cadre, terre du CPI, pont, trois marques, PE A, PE B).
  - Conducteurs : actifs sombres, conducteurs de protection clairs (encre). **Fils « caoutchouc »** : un tube par fil, un anneau par point de contrôle, déformé dans le shader (onglets aux coudes) ; chaque point suit une pièce (`rail`, `prim`, `sec`, défauts) : rien n'est coupé dans l'éclaté.
  - Flux dans le shader du fil (tirets encre `current`, têtes veille `cpi`, têtes signal `leak`/`double`, filet `leak` × (1 − `home`)), chaque fil placé sur son chemin (`walk`) pour que les têtes courent d'un fil à l'autre. Vitesse ≤ période / 7 par image.
  - Établi seulement (`stubs`) : deux carcasses (tôle, face de verre), fils intérieurs, le fil usé qui se courbe sur la tôle (`fault` : vers le haut dans A ; `fault2` : vers le bas dans B, sur L2), lumière qui a un endroit (gonfle à l'arrivée, reste petite), PE A et PE B, les trois marques (deux plaquettes face à face), la platine de verre en une pièce.

## Planches
1. (8 images) Le CPI se lit tout de suite (jauge, voyant) ; l'écart des enroulements et `litSec` se lisent. **Raté** : les tirets du courant en sucre d'orge (trop clairs : 1,3 → 0,62, ratio 0,45 → 0,4) ; sous un défaut, les tirets mangent les têtes signal → le courant s'efface (×0,28) tant qu'un courant de défaut court ; dans l'éclaté, les rangées sortantes partaient en diagonale (leur point OUT suit maintenant le rail) ; un trait vertical de la platine au milieu du chemin du défaut (platine d'une seule pièce sur l'établi).
2. (8 images) L'éclaté se lit en une colonne (rail · capot · culasse · enroulements · U · barrette), `litPrim` / `litSec` francs, l'écart des enroulements s'allume ; **raté** : les têtes signal trop faibles face aux impulsions veille → signal ×3,4, traînée 7 cm ; impulsions atténuées (×0,35) pendant un courant de défaut ; filet un peu plus visible.
3. (8 images, avec l'en-tête) CPI : deux images à 1/30 s, les impulsions glissent sans sauter ; l'éclaté tient entre l'en-tête et y 1550 (d 440, shift −60) ; le fil usé de la carcasse A se courbe sur la tôle ; la barrette porte ses têtes signal. **Raté** : de près, les tirets en zèbre → ratio 0,24, intensité 0,5 (des « tics » de lumière, plus des barreaux).
4. (4 images) Dans l'armoire (avec le bloc de `bloc.js`, noir + armoire veille) : le système est lisible (transformateur, rail, jauge du CPI) mais **`VIEW.system` est trop près** (d 210 : coupé). Le double défaut se lit (boucle signal) ; vue d'ensemble propre. Lumière du défaut un peu renforcée (1,05, rayon 1,15).
Total : 28 images lues sur 30. `npm run check -- 024` passe (0 erreur ; les deux avertissements de shader du moteur, déjà là au bouchon).

## Les nombres de l'état, chez moi
`bench` (carcasses, PE A/B, marques, platine pleine largeur) · `explode` (rail +56 cm [0–0,55], capot +50 [0,08–0,62], culasse +34 [0,18–0,75], enroulements +27 [0,28–0,9] ; les fils suivent) · `apart` (lumière entre les enroulements ; ils s'écartent de ±3,5 cm seulement quand l'éclaté est ouvert) · `current` (tirets encre, réseau + circuit ; ×0,15 en amont et 0 en aval des disjoncteurs quand `trip`) · `home` (pont L2 → barrette, différentiel de verre) · `leak` (boucle signal si `home`, filet par les trois marques sinon) · `ddr` (le fantôme s'allume veille) · `fault` / `fault2` (fil usé sur la tôle, lumière qui gonfle à l'arrivée) · `double` (boucle A → PE → barrette → PE → B → L2 → disj. 2 → secondaire → L1 → disj. 1 → A) · `trip` (manettes en bas, aval éteint, plus d'impulsions en aval) · `cpi` (impulsions veille depuis le CPI, et éclat de la jauge) · `ins` (jauge : 8 cases, signal franc sous 0,5, une case toujours allumée) · `alarm` (voyant + halo) · `litXfo` / `litPrim` / `litSec` / `litEarth` / `litCpi`.

## Poses qui cadrent (repère de l'établi ; `fov` 28)
- whole : `{ tx: 8, ty: 36, tz: 0, d: 420, az: -30, el: 16, shift: 140 }`
- exploded : `{ tx: 0, ty: 58, tz: 0, d: 440, az: -30, el: 14, shift: -60 }` (tout entre l'en-tête et y 1550)
- xfo (éclaté, enroulements levés) : `{ tx: -16, ty: 46, tz: 0, d: 190, az: -30, el: 12, shift: 0 }` — **ty 46, pas 19** : dans l'éclaté ils sont montés de 27 cm
- path : `{ tx: 46, ty: 34, tz: 2, d: 230, az: -26, el: 14, shift: 60 }` ; barrette de près : `{ tx: 40, ty: 10, tz: 6, d: 150, az: -24, el: 18 }`
- carcasse A de près : `{ tx: 60, ty: 40, tz: 3, d: 95, az: -24, el: 12 }`
- cpi : `{ tx: 22, ty: 56, tz: 8, d: 70, az: -22, el: 10, shift: 0 }` ; rail entier (disjoncteurs + CPI) : `{ tx: 16, ty: 52, tz: 4, d: 110, az: -24, el: 10 }`
- double / trip : `{ tx: 30, ty: 40, tz: 0, d: 330, az: -28, el: 14, shift: 60 }`
- couverture (éclaté, `litSec` 1, `cpi` 1) : `{ tx: 0, ty: 58, tz: 0, d: 440, az: -30, el: 28 }` + le `shift` de la mise en page de couverture

## À changer ailleurs
- `plan.js` : `export const OUT = [36, 64, 3.6];` — mes deux circuits sortent en quatre rangées à y 62–65,9, z 3,6 ; `bloc.js` lit `OUT`, son conduit partira du même point.
- `world.js` → `VIEW.system` : `d` 210 → ≈ 340 (le système fait ≈ 115 cm de large : à 210 il est coupé des deux côtés) ; à régler avec le bloc autour.
- `world.js` → `VIEW.xfo` : `ty: 46` (ou `XFO.coil.y + 27`) et `d: 190` ; `VIEW.exploded`, `VIEW.whole`, `VIEW.path` : les poses ci-dessus.
- `plan.js` (commentaires, rien ne casse) : carcasses à x 54–66 (pas 44–56), marques à x 38/42/46 sous la rangée basse, barrette de −30 à 70 ; `CASE_A.at` / `CASE_B.at` → `[60, 40, 0]` / `[60, 18, 0]`.
- `episode.json` → `sources` : « Deux disjoncteurs bipolaires, un par circuit : au double défaut, chacun coupe le sien. »

## Ce qui n'est pas au niveau
- Vue d'ensemble large (≈ 115 cm) : le CPI et les carcasses y sont petits ; on comprend l'objet, mais les actes resserrent pour chaque mot.
- Le chemin du défaut : beaucoup de verticales (descentes, PE, fils des marques, terre du CPI) ; il se lit, sans être limpide en 270 px.
- Dans l'armoire, deux tiges grises verticales sous le rail viennent du bloc (`bloc.js`), pas du système.

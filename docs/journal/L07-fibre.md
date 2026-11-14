# L07 · fibre.js — journal du décor (le système plein, sur le banc)

## Ce qui est construit (les dix objets, `S.item`)
- **Matière de lumière unique** `flowMat` : tirets veille à tête claire + traîne, lus sur `position.x` local, une période toutes les 1/3 s à `flow` 1 (un dixième de période par image), `uBase` = cœur allumé en continu, `uHalf` = demi-atténuation (HIST), `uFront` = front de lumière, `uDimX/K` (sous les revêtements), `uCutX/K` (après le pli).
- **Courbure en vertex shader** (`bendPos`, même formule en JS `bendXY`) : FIBRE (la partie x < 40 se relève en épingle, R 26, jusqu'à 150°, le bout poli reste en place) et PRINCIPE (x > 0, R 150, 120°).
- `cable` : gaine (tube creux, la plus sombre), 38 fils de renfort en hélice longue qui s'effilochent au bout, résine en deux revêtements étagés, verre plein translucide (le plus clair) et son cœur ; bout étagé dès `explode` 0 ; `explode` télescope avec un léger décalage par couche ; `named` 1–5 (arête veille ×1,5, les autres à 50 %), 5 = le cœur s'allume.
- `fibre` : vraies proportions, revêtements coupés en cône à 40 cm, face polie (disque clair + point du cœur qui passe du gris au veille, petite boule sans bavure), tirets dans le cœur + halo faible dans le verre, atténués sous la résine ; `bend`/`leak` : épingle + gerbe signal de 11 traînées au sommet du pli, lumière après le pli × (1 − 0,8·leak).
- `principe` : deux verres additifs (gaine pâle, cœur au liseré d'encre net), bagues pleines au bout gauche ; trois trajets précalculés par marche 2D : à plat (rebonds, éclat veille à chaque rebond), de haut (`steep` : traverse, éclat signal, se perd), virage (`bend` > 0,6 : file droit, sort par la paroi extérieure, partie sortie signal × `leak`). Tête = `A.rayHead`.
- `hist` : barreau de 20 m (vraie longueur), verre gris teinté → clair avec `clear` ; lumière en 2^(−x/300) derrière un front `dim` ; lampe d'entrée, boule de sortie qui ne s'allume que si la lumière arrive ; 90 impuretés signal (`impure` × (1 − clear)) ; règle au sol : un trait par mètre, 0/3/6/20 m longs et clairs (`A.histMarks` au bout de ces traits).
- `docs` : deux pages en canvas (reconstitutions, mention « RECONSTITUTION », tampon PIÈCE 01/02) — Kao & Hockham, Proc. IEE 113 n° 7, 1966, la ligne surlignée signal « pertes : des impuretés — fer, cuivre, eau » ; Corning août 1970, page de cahier, « 1 km », « 17 dB/km » entouré veille (fait [P], carnet de Keck). `docIn` : la page glisse de la gauche et se redresse. Repeint une fois quand les polices sont chargées.
- `subsea` : fibres (12) dans le tube d'acier, bourrage + couronne de 18 fils en hélice, cuivre, gaine épaisse ; `layers` 0 → 4 : chaque couche arrive de −x et se pose ; `explode` : marches le long de +x ; `named` 1–4.
- `multi` : 72 fibres marquées (12 motifs d'anneaux d'encre, pas de teinte), 6 tubes translucides, renfort central, gaine ; `assemble` 0→1 les fibres entrent (de −x, en se resserrant), 1→2 les tubes passent de r 64 à r 17 autour du renfort (qui arrive de −x), 2→3 la gaine glisse vers +x ; tubes et fibres dépassent au bout (+x).
- `splice` : soudeuse (socle, deux V, mors, deux électrodes pointues ±z, deux caméras à ±45°), écran au-dessus (shader : vues X et Y, deux fibres grossies, cœurs veille, décalage `align`, écart `fused`, face de travers `skew`, éclair `arc`) ; arc = boule cœur blanc + filament + bouts chauffés signal ; manchon translucide avec tige d'acier (`sleeve` 0→1 glisse, 1→2 se resserre) ; cliveuse (montrée seulement tant que align/arc/fused/sleeve = 0) : mors qui serrent (1), lame circulaire qui monte et raie (2, trait + éclat signal), enclume qui casse (3), la chute tombe ; `skew` incline la face (7°). Lumière dans la fibre soudée (`pulse`, `fused` 1).
- `coupler` : bloc de verre, arbre de 5 étages en S, 32 guides de sortie puis 32 fibres pleines en éventail ; `split` = front de lumière, chaque étage × 0,64 et plus fin ; `upstream` : tirets encre qui remontent ; `turns` > 0 : un seul trajet montant à la fois (sortie → entrée), 2,2 par seconde × turns, en fondu.
- `plug` : mur aux rayons X (verre + asShell + arêtes), PTO, collerette, connecteur VERT (corps, nervure, manchon, câble), férule céramique face à 8° (sommets inclinés), férule d'en face au même plan ; `plug` : 280 cm → en place ; `bevel` : corps et PTO en fantôme, férules en demi-coupe + plan de coupe, fibre dedans, impulsion qui arrive, passe, petit reflet veille à 16° de l'axe, reflet fantôme encre tout droit en arrière ; ONT posé sur le banc, 4 voyants (`ont`, celui du milieu respire lentement).

## Ce qui a raté et pourquoi
- Planches 1–4 : tout solide à plus de 2 m était noir. Cause : le brouillard du banc. `world.apply` lit `stage.cam.d` avant que la caméra de la pose ne soit posée dans `look` (densité 0,28/78 → 90 % de brouillard à 4 m). **Contournement dans mon fichier** : `fog = false` sur toutes mes matières (le système est le sujet ; le brouillard reste pour le sol et la grille). Dans le film, `d` est celui de l'échantillon d'avant : sans conséquence, mais les planches des autres décors du banc peuvent mentir de la même façon (voir « À changer ailleurs »).
- Gris trop sombres au premier jet : relevés (0x5f676b / 0x868e92 / 0xabb2b5 / 0xc8cdcf, verre 0xd6dddf), métal ≤ 0,25 sur le câble sous-marin.

## Poses vérifiées sur planche (prêtes à coller dans `VIEW`)
```js
cableWide: { ...P, tx: 20, ty: CABLE.at[1], tz: 0, d: 430, az: -34, el: 14, ...SHARP },
exploded: { ...P, tx: 85, ty: CABLE.at[1], tz: 0, d: 640, az: -26, el: 15, ...SHARP }, // explode 1, named 4 : le verre est le plus clair
glassEnd: { ...P, tx: FE, ty: FIBER.at[1], tz: 0, d: 70, az: 62, el: 10, ...CLOSE }, // inchangé
coreEnd: { ...P, tx: FE, ty: FIBER.at[1], tz: 0, d: 26, az: 84, el: 4, ...CLOSE }, // inchangé : le cœur ≈ 72 px à 1080
fibreLong: { ...P, tx: 0, ty: FIBER.at[1], tz: 0, d: 380, az: -30, el: 10, ...CLOSE }, // inchangé
fibreBend: { ...P, tx: 20, ty: FIBER.at[1] + 18, tz: 0, d: 380, az: -20, el: 8, ...SHARP }, // NOUVELLE : bend 1, leak 1, pulse 1
principe: { ...P, tx: 0, ty: PRINCIPE.at[1], tz: 0, d: 560, az: -18, el: 8, ...SHARP }, // inchangé
subsea: { ...P, tx: 20, ty: SUBSEA.at[1], tz: 0, d: 420, az: -42, el: 14, ...SHARP }, // layers 4, explode 1
multi: { ...P, tx: -20, ty: MULTI.at[1], tz: 0, d: 440, az: -34, el: 14, ...SHARP }, // assemble 1,5
hist: { ...P, tx: 380, ty: HIST.at[1], tz: 0, d: 820, az: -32, el: 12, ...SHARP }, // inchangé
coupler: { ...P, tx: 0, ty: COUPLER.at[1], tz: 0, d: 230, az: -28, el: 32, ...SHARP }, // inchangé : l'arbre et les 32 sorties se lisent
bevel: { ...P, tx: 0, ty: PLUG.at[1], tz: 30, d: 110, az: -86, el: 4, ...CLOSE }, // inchangé
```
## Poses NON vérifiées (budget d'images épuisé) — à regarder sur la planche de relecture
```js
bendWide: { ...P, tx: 40, ty: PRINCIPE.at[1] + 110, tz: 0, d: 820, az: -6, el: 6, ...SHARP }, // à d 600 le virage sortait par le haut
docs: { ...P, tx: 0, ty: 0, tz: 4, d: 125, az: -8, el: 70, ...SHARP }, // à d 170 la page ne tenait que 40 % de la largeur
splice: { ...P, tx: 0, ty: SPLICE.at[1] + 15, tz: -10, d: 250, az: -26, el: 24, ...CLOSE }, // pour faire entrer l'écran (y 80, z −78) ; à d 190 il est coupé en haut
plug: { ...P, tx: 60, ty: PLUG.at[1] + 20, tz: 160, d: 640, az: -38, el: 12, ...SHARP }, // à d 320 le corps vert remplit l'image : reculer pour voir mur, PTO, connecteur, ONT
```
`spliceTight`, `cleaver`, `subseaEnd`, `ricochet` : non regardées.

## Première image (candidates qui me touchent)
- `hook4` (le long de la fibre, les tirets vers l'objectif) : état `{ item: ITEM.FIBRE, pulse: 1, core: 0.4 }` ; la fibre (Ø 23,5 avec résine) tient ≥ 40 % de la largeur à d 150 si la caméra est dans l'axe (az 74 → 80) ; non vérifié en image.
- `hook6` (dans le cœur) : `{ item: ITEM.PRINCIPE, ray: 0.3 → 0.7 }` ; le tube fait 72 de Ø : à d 260 il remplit la hauteur ; non vérifié.

## À changer ailleurs
1. `world.js`, `VIEW` : remplacer les poses ci-dessus (lignes exactes plus haut ; ajouter `fibreBend`).
2. `world.js`, `apply()` (constat, pas urgent) : dans `look`, `stage.cam.d` lu avant la pose → brouillard faux sur les planches du banc. Ligne proposée à la place de `scene.fog.density = bench.fog(d);` : `scene.fog.density = bench.fog(Math.max(d, 400));` (un banc qui ne mange rien à moins de 4 m), ou laisser tel quel : mon fichier s'en passe.
3. `plan.js` (optionnel) : `PRINCIPE.graze: 7` → `11` si les actes veulent **trois** rebonds à `ray` 0,5 (à 7°, les rebonds tombent à 0,17 · 0,50 · 0,83 du trajet).
4. `plan.js` (information) : `PLUG.ont[1]` vaut 0 mais l'ONT est posé SUR le banc (y local −14, son ancre `A.ont` sur son dessus).
5. (suggestion) le halo du banc (`BENCH.size` 60 → rayon 84 cm) est petit sous des objets de 2,4 à 6,4 m : le système reste lisible (gris moyens + arêtes) mais le « posé sur le halo » ne vaut qu'au centre. `BENCH = { size: 100 }` élargirait halo et grille (à juger sur une planche avant/après).

## Images lues : 30 / 30.

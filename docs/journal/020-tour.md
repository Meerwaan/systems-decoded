# 020 · `tour.js` — journal

## Ce qui est fait (planche 1, 8 images lues)

- Le fichier remplace le bouchon et passe au build. API rendue : `buildTour()` → `{ group, mount, A, update(P, time, px) }`.
- La tour : base en trois tranches, sept modules évasés, couronne à trois gradins, flèche — coque de verre (`asShell`, ordre 40), sections à huit côtés (angles coupés), étages et montants dessinés dans le verre (fondus par `fwidth`).
- La flexion : par tranches rigides, chacune déplacée de u(y) et inclinée de u'(y) à son milieu (moins d'un centimètre d'écart à un joint). `mount` = le huitième module (la cage) : il voyage de `tip` exactement.
- Dans `mount` : la façade du huitième module, trois planchers percés d'un puits rond, le garde-corps du puits, la barre à la fenêtre (côté −x), toi (`makeFigure`, verre, face à la fenêtre).
- Le typhon : quatre cubes de pluie (traînées, signal) et trois de veines de vent, qui suivent l'œil ; dessinés après la coque (ordre 46) : la tour cache la pluie derrière elle, il ne pleut pas dedans.
- Le squelette : huit méga-colonnes (deux par face, serrées au milieu : de −36° d'azimut elles encadrent la boule), noyau en quatre poteaux, ceintures de treillis ; s'allume de bas en haut (`bones` 0 → 1), veille à 2.
- Le fil à plomb (pointillé) et la silhouette au repos ; la ville (blocs de verre, grille) ; le séisme (vibration à 30 Hz + houle).

## Ce qui a raté, et pourquoi

- Planche 1 : le verre du kit (`rim`, `edge`) sur des faces PLANES vues en rasant = une dalle grise en travers de l'image (accroche à az −22). Corrigé : `rim` 0,07, `edge` 0 ; la façade se lit par ses étages, ses montants et ses arêtes.
- Planche 1 : squelette trop gros et trop vif (des dalles veille qui mangent la boule ; un noyau plein = un bloc sous la boule). Corrigé : colonnes de 15 à 40 cm de rayon, noyau en quatre poteaux, veille à 0,72, ombrage plus dur.
- Planche 1 : pluie trop rare dans l'accroche. Corrigé : 10 000 traînées par cube, plus longues, plus claires ; veines plus discrètes.
- Le fil à plomb passait dans la boule : `depthTest` coupé pour l'axe et la silhouette.

## Planches 2 à 5 (30 images lues en tout : 8 + 8 + 8 + 4 + 2 — budget atteint)

- Planche 2 : quatre candidates pour la première image (A, B, C, D ci-dessous), toi de profil (`grip` 1 : penché, les deux mains sur la barre, un pied en arrière — ça se lit), squelette ink dans la cage, squelette veille vu du pied, système seul (`shell` 0,15 : il ne reste rien autour).
- Raté : les planchers de la cage vus par la tranche = un voile en travers de l'image (`rim` 0,11 → 0,035, ce sont leurs traits qui les dessinent). Les poteaux du noyau arrêtés sous la cage = des moignons en l'air : ils montent jusqu'au plancher.
- Planche 3 (avec l'en-tête et les zones) : l'accroche à `swing` 0,5 et 1,5 — la boule passe du centre-droit au centre-gauche du cadre (≈ ±300 px) ; tour entière, vue du pied, tiers haut, toi debout, cage embarquée, jour calme.
- Planche 4 : le fil à plomb ne se lisait pas (perdu dans les montants et la silhouette fantôme) → 3,4 px, pointillé de 430 / 250, silhouette à 0,2. Les colonnes veille traversaient l'en-tête dans `VIEW.cage` → elles se dissolvent au-dessus de la boule (entre 95,5 % et 100 % de la hauteur de la cage) ; la ceinture du haut de la cage est retirée.
- Planche 5 : `VIEW.cage` + `bones` 2 : les colonnes montent de part et d'autre de la boule, rien dans l'en-tête ; tiers haut + `axis` : le pointillé se lit, la tour est partie à droite.

## Chaque nombre

| nombre | ce qu'il fait |
| --- | --- |
| `tip` | chaque tranche déplacée de tip·(y/9950)^1,7 et inclinée de la pente ; `mount` à `tip` exactement, incliné de atan(1,7·tip/9950) (2,7° à 280 cm) |
| `shell` | verre et traits de la tour : (shell − 0,15)/0,85 ; à 0,15 plus rien. Toi tu t'effaces avec lui (entre 0,4 et 0,15) |
| `storm` | pluie (4 cubes de 10 000 traînées, signal) et veines de vent (3 cubes de 420) : densité 0,3 + 0,8·storm, lumière pleine dès 0,5. La vitesse ne change pas (elle multiplierait le temps : tout sauterait) |
| `city` | blocs de verre + grille (0,24·city) |
| `axis` | fil à plomb pointillé (toujours visible, `depthTest` coupé) + silhouette au repos à 0,2 |
| `bones` | 0 → 1 : le squelette monte du sol (une tête de lumière un peu plus claire) ; 1 → 2 : ink → veille |
| `quake` | vibration 30 Hz (24 cm au sol, ≈ 4 cm à la cage) + houle 0,85 Hz (62 cm au sol, la moitié en haut) ; le sol et la ville tremblent aussi |
| `you` | 0 / 1 (fondu) |
| `grip` | 0 debout, bras le long du corps, la tête un peu tournée vers la caméra · 1 penché de 23°, les deux mains sur la barre, genoux fléchis, un pied en arrière |

## Les poses (prêtes à coller)

Première image — quatre candidates (état `FIRST`) :

- **C (ma préférée)** `{ tx: -330, ty: 10430, tz: 80, d: 2100, az: -48, el: 2, fov: 34, shift: 170, side: 0, roll: 0, drift: 0 }` — toi (≈ 265 px) devant le bord gauche de la boule, qui remplit la droite ; toi à x ≈ 550, y ≈ 870 ; sous les boutons de TikTok il n'y a que le flanc de la boule.
- **A** (= `POSE0` actuel) `{ tx: -60, ty: 10460, tz: 0, d: 2900, az: -38, el: 4, fov: 34, shift: 190, side: 0 }` — la boule au centre, toi petit (≈ 190 px) à son bord gauche.
- **D** `{ tx: -200, ty: 10450, tz: 40, d: 3000, az: -62, el: 3, fov: 34, shift: 180, side: 0 }` — toi devant la boule, au centre-gauche.
- **B** `{ tx: -120, ty: 10560, tz: 0, d: 4300, az: -30, el: -7, fov: 38, shift: 150, side: 0 }` — en contre-plongée : on voit le module s'évaser et la pluie le traverser ; la boule est plus petite, c'est la moins lisible des quatre.

Les autres : `VIEW.tower`, `VIEW.low`, `VIEW.top`, `VIEW.cage`, `VIEW.system` cadrent tels quels (`VIEW.low` et `VIEW.top` : la couronne et la flèche passent dans l'en-tête — viser 500 à 800 cm plus bas ou reculer). `grip` se lit DE PROFIL : `{ tx: -545, ty: 10385, tz: 150, d: 900, az: -8, el: 2, fov: 36, shift: 0, side: 0 }` (vérifiée ; trop près pour le film : reculer à d 1300–1500 en gardant az entre −8 et −20, non vérifié). De `VIEW.you` (az −64) tu es presque de face : la flexion est écrasée.

## Ce qui n'est pas au niveau

- **Toi** : une tête-boule et un contour de verre fin ; dans l'accroche A tu fais 190 px, un pictogramme. Pas de tête sculptée (celle du 017 est locale à `suite.js`).
- **La vitre** : la façade ne se lit que par ses étages, ses montants et ses reflets en biais, tous discrets de près ; rien ne dit vraiment « vitre » devant toi.
- **La pluie** n'a été vue qu'en images fixes. Construite pour ne pas scintiller (une traînée avance par image d'un quart à un onzième de sa longueur, le long d'elle-même ; 3,4 px de large au moins ; entrées et sorties en fondu), mais `qa` ne l'a pas mesurée. À `storm` 1 elle est très dense dans un grand angle (`VIEW.low`) : 0,6 y suffit.
- **Le séisme** n'a jamais été vu en mouvement.
- **Le squelette** : les colonnes sont par paires serrées au milieu de chaque face (±72 cm), pas aux tiers comme les vraies : choisi pour qu'elles encadrent la boule de az ≈ −36 ; de az −20 ou −60 une paire passe devant elle.
- Les deux arêtes du coin de la tour côté caméra passent devant la boule à az −38 (en trait faible).
- L'inclinaison de la cage (2,7°) ne se voit pas dans l'accroche : c'est le trajet dans le cadre qui dit que la tour bouge.
- La ville : des boîtes, sans plus. Le sol sous la tour vu du pied : les lignes de la grille en perspective, un peu confuses.

## À changer ailleurs

- `world.js`, si l'acte 1 retient la candidate C : `export const POSE0 = { tx: -330, ty: HEART + 10, tz: 80, d: 2100, az: -48, el: 2, fov: 34, shift: 170, side: 0, roll: 0, drift: 0 };`
- `world.js`, `VIEW.you` (pour que `grip` se lise) : `you: { ...P, tx: YOU.at[0] - 25, ty: CY + YOU.at[1] + 105, tz: YOU.at[2], d: 1400, az: -14, el: 2, fov: 36, shift: 60 },` (non vérifiée à cette distance).
- Actes : `storm` 0,6 dans les plans au grand angle.

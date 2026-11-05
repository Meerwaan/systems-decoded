# 039 · model.js (le récupérateur, plein) — journal du décor

2026-11-05. Agent `decor`, fichier `episodes/039-cendrier-reacteur/src/model.js`.

## Lu
recette-agents (entière), regles-image, 039-decors (haut + § model.js), plan.js, world.js, bouchon, build3d (API), finish.js (tête : `userData.finish = false` pour le béton), lignes de 039-actes qui touchent mes nombres.

## Parti pris (avant la première planche)
- **Écorché** : la paroi de la fosse est coupée d'un coin de 110° tourné vers les caméras (az −95 → +15) ; le sol de la fosse reste entier (la première image est prise dedans). Sur la tranche : béton sacrificiel clair grenu | briques de zircone (appareil dessiné au shader, fondu sous le pixel).
- **La tranche en z1** : le bout de la chambre (z 2450) et le secteur de piscine sont coupés net : on lit en coupe les nervures (le long de z), le canal central, les fentes derrière les murets, et l'eau qui les remplit — le chemin de l'eau se lit depuis `az` −18.
- Trois valeurs : béton sacrificiel clair, zircone moyenne (briques), fonte sombre ; la bague de la porte la plus claire ; la piscine en béton sombre.
- Vannes : corps sur la face côté chambre du mur intérieur de la piscine (le bouchon l'enterrait dans le mur : c'est ce qui masquait), un levier qui bascule de profil (axe z), tenu par un câble qui passe sur le muret jusqu'au déclencheur.
- Déclencheurs : un socle en quatre morceaux + un maillon fusible ; ils sont dans la pièce `chamber` (posés sur la dalle), le câble dans `valves`.
- `eaten` : cibles de morphe (la face recule et devient rugueuse, ≤ 30 cm au pied, rien au-dessus de 140 cm), noircie au shader, éclats qui tombent.

## Planches (30 images lues sur 30)
1. (8) Premier jet : `plugTop` d 260 = la porte remplit tout le cadre (45 % demandé → d 600) ; plaque chaude = voile rose (trop grande, trop d'émissif) ; **éclaté** : la chambre passait SOUS le sol de l'établi (−560) → plus rien ne descend ; piscine = tache blanche (reflet du softbox sur un plan lisse) ; fonte trop noire (metal 0,4) ; la vanne : le bouchon l'enterrait dans le mur — maintenant sur la face côté chambre, levier + câble lisibles.
2. (8) `plugTop` d 600 : froide (bague claire + anneau veille), rouge (cœur rouge, bague rosée), ouverte (trou bordé de signal, puits en briques) — trois états lisibles. Éclaté : six morceaux nets. `valve` el 38 : vanne, levier, câble, poulie, déclencheur dans un cadre ; ouverte : levier levé, câble pendu, déclencheur en morceaux, conduite pleine.
3. (8) POSE0 : la paroi trop claire et plate → assombrie (couleur à part, `deep` 0,55). `graze` proposé (el 12) : dalle, nervures en coupe au bout, cuve au fond — lisible. Eau dans `sheet` : 0,88 les deux fronts veille entrent par les bords ; 1 + `guard` : liserés veille sur les murets, voile d'eau sur la galette.
4. (4+2) Eau de la piscine en shader (clair vers la surface, additif) ; POSE0 OK ; éclaté avec en-tête : piscine remontée trop haut (sous l'en-tête) → +500 au lieu de +700.

## Poses (vues sur planche)
- `plugTop: { ...P, ...CLOSE, tx: 0, ty: 0, tz: 0, d: 600, az: -35, el: 68, fov: 34, shift: 90 }`
- `valve: { ...P, ...CLOSE, tx: 520, ty: -230, tz: TRIGGERS[1][2], d: 1100, az: -16, el: 38, fov: 30, shift: 0 }` (déclencheur 1 en bas à gauche, vanne 1 à droite, la paire 0 derrière, en haut)
- `graze: { ...P, tx: 0, ty: -330, tz: 1700, d: 2200, az: -24, el: 12, fov: 34, shift: 150 }`
- `exploded: { ...P, tx: 300, ty: 450, tz: 1000, d: 7400, az: -18, el: 22, fov: 34, shift: 280 }` (vu à d 7200 shift 300 : la piscine frôle l'en-tête, la chambre touche 1600 — d 7400 / shift 280 non revu)
- `pool: { ...P, tx: 900, ty: 0, tz: 2000, d: 1700, az: -55, el: 30, fov: 34, shift: 120 }` : les deux vannes basses lisibles ; l'eau, elle, se lit mal (le mur intérieur, haut de 4,4 m, la cache). **Plan faible.**
- `sheet` (architecte) : bon pour `water` 0,8 → 1 et `guard`.

## Pas vu (budget d'images épuisé)
`VIEW.trigger` (gros plan d 300), `overPit` (le voile rose vient de la calotte de `corium.js`, pas de moi), `water` 0,25 dans les conduites (les têtes veille), les éclats qui tombent en mouvement, `litChannel`, `litChamber` seuls.

## À changer ailleurs
- `world.js` → `VIEW` : les quatre poses ci-dessus (`plugTop`, `valve`, `graze`, `exploded`), et `pool` si personne ne trouve mieux.
- `world.js` → `apply` : passer `eaten: S.eaten` à `corium.update` ; dans `corium.js`, le bain de la fosse a pour rayon `PIT.r - 2 + 0.5 * PIT.sac * eaten` (la paroi recule jusqu'à ≈ 30 cm au pied : sans ça, un fossé sombre autour du bain à `eaten` 0,9).
- `docs/catalogue.md` : « `039/model.js` — récupérateur de corium plein : fosse en écorché (béton sacrificiel + briques de zircone au shader), porte fusible à trois états, canal ouvert, chambre en fonte nervurée dont le bout est une coupe, secteur de piscine, deux vannes passives à levier et leurs déclencheurs ; options : `eaten` (morphe), `plug`, `valves`, `triggers`, `water` (chemin de l'eau en quatre temps), `guard`, `lit…` ; utiles seuls : `concrete()` / `bricks()` (matières au shader, fondues sous le pixel), `eatenLathe()`. »

## Retouche du 05/11 (agent `retoucheur`, 12 images lues)
- **L'eau ne se voyait pas (62,5 / 64 / 84 s)** → `waterMat` réécrit : mélange normal (plus additif), teinte veille sombre qui s'épaissit avec la profondeur, reflet rasant pâle, deux ou trois reflets larges et doux fixés au monde (`band`, dérive lente). Conduites : eau veille (`glow` 1,1) et tête plus grosse (r 24, veille 3). Nervures, fentes, canal central, déversement : `veil` veille (0,24 / 0,26 / 0,34 / 0,3) au lieu d'ink. Nappe noyée : surface `waterMat` (veille 0,09, alpha 0,3, reflets 0,1) + ligne d'eau pâle (ink→veille) le long des murs et des bouts, qui suit `reach` et `level`. Vérifié à 63,0 / 63,5 / 64 (colonnes d'eau veille dans les deux conduites ; à 62,5 et 63,0 le plan est encore `GRAZE`, la coupe sur `PIPE` tombe entre 63,0 et 63,5), 84 avec `water` 0,5 / 0,8 / 1 (à 1 : la nappe se lit teintée, la croûte visible dessous ; moyenne G 69 contre 49 à 0,8).
- **La piscine, bloc gris pâle (7,8–9 s, 46 s)** → corps `waterMat` veille 0,012 → 0,05, alpha 0,82 ; surface veille 0,07, alpha 0,75, reflets 0,08, posée 0,3 cm au-dessus du corps (renderOrder 1 / 2) ; lignes d'eau ink→veille 0,4 au repos. Vérifié à 9,0 : une eau plane, sombre-veille, derrière le mur des vannes. 46,0 : image inchangée au premier réglage — les formes pâles de ce plan ne sont pas l’eau de `model.js` (béton, verre du bâtiment ?) : à revoir sur le brouillon.
- Pas vu : la tête d'eau en mouvement (elle traverse la descente en ≈ 0,5 s juste après la coupe : `water` 0 → 0,3 en `sine.in` dans acte3), `water` 0,25 dans `sheet`.

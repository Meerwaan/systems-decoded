# 045 · kourou.js — journal

Agent décor, 08/11. Fichier : `episodes/045-autodestruction-fusee/src/kourou.js` (contre le bouchon de l'architecte, API gardée : `buildKourou() → { group, A, update(p, time, px, eye) }`, 12 nombres lus). Planches : `.cache/planches/045/kourou/`.

## Ce que je construis (décidé avant la première planche)

- **Le dôme du 026** importé tel quel (`alt` 0) ; ses touffes de steppe (rayon 35 m autour de l'origine, donc SOUS la table de lancement) sont cachées après chaque `sky.update` (nœud « habillage-steppe ») ; l'encre du dôme suit `ground`.
- **Le pas de tir à sa taille** : table de verre (trois ouvertures, les poteaux d'appui des boosters), la fosse et les deux carneaux est / ouest en traits sous le sol, l'aire bétonnée (contour, 92 m), **quatre mâts en treillis**. Les mâts ne sont PAS sur les diagonales : à az −45 (nord-ouest), un mât se tient pile entre la caméra (az −40, `padOut`) et la fusée. Ils sont tournés de 25° (az 20, 110, −160, −70) : hors du cadre de `padOut`, `like`, `duel` ; depuis la cabine, un à gauche et un loin à droite.
- **La savane** (arbustes, touffes près du pas de tir, bosquets de palmiers bâches : la Guyane en un coup d'œil), **la mangrove** (couronnes serrées en dômes, racines-échasses) **et trois criques** jusqu'à **la côte** (NO–SE, comme la vraie : l'océan au nord-est et à l'est), **l'océan** en traits de houle parallèles à la côte. Lignes d'encre fines, mangées par le brouillard au loin. Rien de plein. Un dégagement autour de l'aire, des carneaux, de la cabine et le long de la visée cabine → pas de tir (sinon les arbustes masquent la table depuis la cabine).
- **Le couloir** : bande veille au sol (remplissage doux plus clair le long des bords, masqué sous l'empreinte des débris pour ne pas mélanger vert et orange), ses deux bords nets, des graduations le long des bords (la règle), et au-dessus de 0,45 ses parois en traits : poteaux, rideau lumineux au ras du sol, ligne haute à 240 m. **De 0,35 à 1, la lumière court du pas de tir vers l'est** (un front clair, les bords s'allument derrière lui).
- **La trajectoire prévue** : tirets veille dans l'air, qui se dessinent du pas de tir vers la côte avec `track`.
- **L'empreinte** (`fall`) : ellipse signal hachurée qui grandit depuis l'aplomb de la fusée ; pendant qu'elle grandit, un cône de tirets signal descend de la fusée jusqu'à elle, puis s'efface.
- **Le fantôme** (`ghost`) : tirets signal qui partent du point de rupture, plongent vers le nord (côté caméra) et traversent la paroi proche **dans le cadre de `verdict` entre az −36 et −52** (le cadre vertical est étroit : un franchissement plus à l'est sort du cadre) ; une tête lumineuse ; `barred` : une croix signal tracée trait par trait sur le point de franchissement, le fantôme s'éteint à moitié.
- **Les lueurs des débris** : 28 lueurs signal dans l'empreinte, qui s'allument et meurent avec `debris` (la mangrove vers 0,5–0,72, la savane vers 0,72–0,84 : mortes à 1).
- **La cabine** : une pièce de verre haute de 4,70 m (et non 3,20) pour que, de l'arrière de la console, le linteau passe au-dessus du cadre ; pupitre plein (trois gris), **deux écrans de 64 × 40 cm** inclinés vers l'opérateur, bas sur le pupitre (le haut à 1,41 m) : leur bord haut passe juste sous le pied du pas de tir vu de la caméra. Écran gauche : la carte (la bande, la côte, la route prévue en tirets, la trace volée qui avance avec `climb`) ; écran droit : le profil (l'enveloppe, la courbe prévue, la trace). `alarm` : la trace décroche, passe signal, le cadre de l'écran passe signal. Pas d'opérateur, pas de bouton rouge. Coque d'ordre 30 : la fusée de verre reste visible à travers.
- **La torchère du 046** : construite quatre fois plus loin et quatre fois plus grande que `TEASER` (même angle vu du pas de tir, mais son pied tombe sur l'horizon : elle se lit « au loin », comme le teaser du 026) ; treillis à trois pieds, fût, veilleuse veille qui respire.

## Planches (29 images lues)

- **a** (8) : la bande du couloir faisait un aplat vert énorme (0,13 en linéaire ≈ 0,4 à l'écran) → remplissage 0,008 + 0,04 près des bords, rideau 0,045 ; le fantôme plongeait vers la caméra et sortait du cadre en haut à droite (côté caméra, la paroi proche n'est dans le cadre vertical que jusqu'à x ≈ 78 m) → il vire au **sud** et traverse la paroi lointaine, dans le cadre de az −36 à −52. Cabine : la pose de l'architecte (el 12, shift 120) met les écrans devant le pas de tir ; écrans bas + el 4,5 + shift négatif : ils passent sous le pied du pas de tir.
- **b** (8) : balayage 0,35 → 1 lisible (front clair, bords allumés derrière) ; empreinte hachurée nette dans la bande ; route prévue en tirets au-dessus de la fusée (`corridorView` plus haut) ; croix lisible. **La torchère en treillis ressemblait aux mâts** → refaite en cheminée haubanée. Fantôme raturé trop éteint → 1 − 0,35·`barred`, et un piquet signal là où il serait tombé (un anneau seul ne se voit pas en rasant).
- **c** (8) : torchère distincte des mâts, au ras de l'horizon ; cabine fov 50 juste ; `padOut` : aucun mât devant la fusée ; cabine vue de dehors : boîte de verre, écrans allumés dedans.
- **d** (4, avec l'en-tête) : cabine, pluie, couloir vu d'en haut tiennent dans leurs zones ; **le panneau « Prochain dossier » couvrait la torchère** → hauteur 0,62 × `TEASER.h`.
- **e** (1) : torchère à gauche de la fusée ; à shift −120 sa veilleuse touche encore le bas du panneau → shift −300 au calcul (non vérifié à l'image).

## Poses qui cadrent (à coller dans `VIEW`, az décroissant respecté)

- `couloir: { ...P, tx: 7000, ty: 7000, tz: 0, d: 46000, az: -54, el: 12, fov: 44, shift: 0 }` — la fusée et sa traînée en haut, l'empreinte dessous, la bande autour, le pas de tir et ses mâts (celle de l'architecte ne montre que le sol).
- `booth: { ...P, tx: CONSOLE[0], ty: CONSOLE[1], tz: CONSOLE[2], d: 350, az: BOOTH_AZ, el: 4.5, fov: 50, shift: -110 }` — les deux écrans juste au-dessus des sous-titres (≈ 1 040–1 240 px), le pas de tir et la fusée qui décolle par la vitre, un mât de chaque côté ; le haut de la fusée passe sous l'en-tête.
- écran en gros plan (« bascule », si l'acte le veut) : `{ ...P, tx: -8668, ty: 120, tz: 6304, d: 150, az: BOOTH_AZ, el: 10, fov: 40 }` (= `kourou.A.screen`).
- la caméra qui sort de la cabine : `{ ...P, tx: BOOTH.at[0], ty: 200, tz: BOOTH.at[2], d: 2600, az: BOOTH_AZ - 8, el: 24, fov: 40 }` (la boîte de verre, ses écrans allumés).
- `corridorView: { ...P, tx: 9000, ty: 9000, tz: 0, d: 44000, az: -62, el: 14, fov: 44, shift: 0 }` — la fusée qui monte dans la bande, la route prévue en tirets au-dessus d'elle, les parois.
- `teaserView: { ...P, tx: 6000, ty: 2600, tz: -2400, d: 26000, az: -72, el: 2, fov: 40, shift: -300 }` — la torchère à gauche de la fusée debout, son pied sur l'horizon ; **sa veilleuse doit rester sous 790 px** (panneau `nextFile`) : vérifié à shift −120 (elle touche le panneau), −300 calculé.
- `wide`, `padView`, `rain`, `verdict` : celles de l'architecte tiennent ; le fantôme et sa croix sont dans le cadre de `verdict` de az −36 à −52 (`kourou.A.cross` ≈ (9 500, 10 000, −8 700)).

## Les nombres, chez moi

`ground` : le dôme (son encre), la terre, le pas de tir · `corridor` : 0,35 la bande au repos (bords 0,55, remplissage faible) ; 0,35 → 1 la lumière court du pas de tir vers l'est ; parois au-dessus de 0,45 · `track` : la route prévue se dessine du pas de tir (instances) · `fall` : l'empreinte grandit depuis l'aplomb de la fusée, le cône de chute en sin(π·fall) · `ghost` : le fantôme se dessine, sa tête, l'anneau et le piquet au-delà de 0,9 · `barred` : la croix, trait par trait (0 → 0,5, 0,5 → 1) · `salle` : la cabine entière · `alarm` : les traces décrochent (carte : vers le nord, hors de la bande ; profil : sous l'enveloppe), signal, cadre des écrans signal · `teaser` : 0 → 0,5 la torchère se lève (échelle verticale 0,22 → 1), 0,5 → 1 la veilleuse · `climb` : la tête des traces sur les écrans (`pow(climb, 0.6)` : elle avance dès le décollage) · `incid` : non lu (l'écran suit `alarm`) · `debris` : lueurs de la mangrove à 0,50–0,72, de la savane à 0,72–0,84, toutes mortes à 1.

## À changer ailleurs

- `episodes/045-autodestruction-fusee/src/world.js`, dans `VIEW`, remplacer les lignes `couloir`, `booth`, `corridorView`, `teaserView` par celles ci-dessus (le reste de `VIEW` inchangé).
- (facultatif) `world.js` → `apply` : `kourou.update({ … })` et `fusee.update({ … })` créent un objet à chaque appel (32 par image) ; un objet réutilisé, rempli champ par champ, les évite.
- (facultatif) `plan.js` → `BOOTH.h: 470` (la cabine est construite à 4,70 m : à 3,20 m, le linteau coupe la fusée depuis la console).

## Ce qui n'est pas au niveau

- Vue du sol (`wide`, `verdict`), la terre se tasse en une bande grise sous l'horizon : la côte et l'océan ne se lisent pas (trop loin, trop rasant). Ils se lisent d'en haut (`couloir`, `corridorView`).
- `verdict` à az −52 : la croix tombe sur la traînée blanche de la fusée ; le piquet d'atterrissage du fantôme, au-delà du bord lointain, est petit en rasant.
- La torchère se lit « au loin », mais rien ne dit qu'elle n'est pas à Kourou. Si le chef la trouve trompeuse : `ground` → 0,4 pendant qu'elle se lève (la base s'efface, la torchère reste), ou elle passe à l'établi.
- Au like (`debris` 1 → 0), les lueurs des débris se rallument un instant à l'envers (elles ne dépendent que de `debris`).
- La cabine vue de dehors n'est qu'une boîte de verre et ses écrans (le décorateur peut l'habiller : antenne, câbles, une silhouette de verre de dos — jamais un bouton rouge).

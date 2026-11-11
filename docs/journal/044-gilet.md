# 044 · gilet.js — journal du décor (le système, plein)

Agent décor, 08/11. Contre le bouchon et l'API de l'architecte (`docs/044-decors.md` § gilet.js), idiome `041/whipple.js` (halo ≥ 7 px, traînée, tissage au shader `fwidth`).

## Ce qui est construit (premier jet, une écriture)

- **Un seul champ de déplacement** (GLSL, `COMMON`) : `x += coneAt(y, z)` (le profil de `plan.js` recopié tel quel, 4,4 cm à l'axe à `cone` 1) + le pli qui court (`ring` : une ondulation de 0,22 cm à un rayon qui grandit, chaque couche en retard de 35 % de course sur la face rue). Les normales suivent le champ analytiquement (`n' = n − ∇f·n.x`). Couches, housse, deux peaux de la poche et la coupe le lisent.
- **La coupe** (`section`) : un plan dans le repère du panneau, garé au-delà du bord (0) et amené à z = 5 (1) ; tout ce qui est au-delà est jeté au fragment (`discard`), ombres comprises (`customDepthMaterial`). La face coupée de la pile est **une** bande (`cap`) qui dessine les 24 feuillets (liseré clair), fondus en 6 strates puis en gris uni selon `fwidth` ; la poche, la housse et les sangles sont `DoubleSide` (leur tranche se lit sans géométrie de plus).
- **Les 24 couches** : de vraies feuilles (une géométrie partagée, une matière chacune pour `uK`), tissage toile au pas 0,4 cm, coutures (point droit à 1,4 cm, deux lignes en travers) en pointillés, trou déchiré (`pierce` : rayon de la balle devant, plus large au fond quand le nez s'ouvre, bord effiloché), croix tendue (`tense`, couches qui tiennent), étoile (`spread`, couche 0), bande `share`, pli `ring`, `litWeave`, `litSeams`. Charnière au bord cousu z −16 : en éventail ±7° (`EXPLODE.fan`), écartées de 2,6 cm, départ échelonné du bord vers le centre.
- **La housse** : deux moitiés, une bride scellée de 0,7 cm autour (les deux moitiés s'y rejoignent au plan médian), mate ; `litHousse` allume la bride en veille et son contour.
- **Le porte-panneaux** : poche avant (deux peaux en cordura + un bord passepoilé bombé), dos, deux bretelles, deux sangles latérales par flanc (y 101 et 126,5, le flanc libre entre elles), deux champs de velcro sur la poche ; lignes d'arêtes fines coupées sur le plan de coupe.
- **La balle** : tour de 9 mm, ogive ronde ; le champignon est une cible de morphing (couronne à six pétales, culot intact). En vol : halo ≥ 7 px + sillage signal (portés du 041). Après contact : son front contre la première couche entière (voir « Choix »).
- **Les brins cassés** (`breaks`) : 36 rubans instanciés, ≥ 2,2 px, enracinés sur le bord du trou ; 0 → 0,5 ils jaillissent, 0,5 → 1 ils retombent et s'éteignent (jamais un nombre d'éléments qui change).
- **Le fil-cœur** (`fiber`) : quatre filaments torsadés autour d'une âme, tirés du bord haut de la couche 0, le bout enroulé ; révélé le long de sa longueur.
- **L'essai de traction** (`test`, `load`) : potence, Kevlar torsadé veille (Ø 0,7) à gauche vu d'az −88, acier clair (Ø 0,3) à droite ; blocs qui arrivent de côté ; l'acier casse sur le 2ᵉ bloc (ses deux bouts se rétractent, ses blocs tombent et s'effacent, une boule de lumière signal au point de rupture).
- **Les deux faces** (`faces`) : deux flèches veille sous le bord bas, à z 0 (lisibles des deux flancs). **0 → 0,5 la flèche « rue », 0,5 → 1 la flèche « toi »**.

## Choix (écarts assumés au plan)

- Pointe après contact à `IMPACT x + pierce·1,2 + coneAt(axe)` (au lieu de `pierce·0,48`) : le front du champignon s'appuie sur la première couche **entière**, cohérent avec `pierce` = fraction des 24 couches déchirées (world.js). Écart de 1,5 mm au plus.

## Images lues

30 images en 6 planches (`.cache/planches/044/gilet/p1…p6.jpg`) :
- **p1 (8)** : premier jet. Ratés : la housse ouverte (±38 le long de x) masquait la couche 0 dans `weave`/`solo` ; la poche et la housse étaient trouées sans balle (`sdHoleR` pour kf < 0) ; les couches éclatées s'ombraient l'une l'autre (faces noires, « radiateur ») ; sillage = bâton blanc de 0,7 cm ; tension sur la coupe qui bavait en vert. → housse ouverte qui recule aussi de 30 cm vers −z et pivote de 18° ; trou seulement si `pierce` > 0 ; plus d'ombres portées entre couches une fois écartées ; sillage 0,32 cm, cœur chaud court ; halo coupé dès que la balle fait 14 à 40 px.
- **p2 (4)** : tissage net en gros plan (toile au pas 0,4), étoile de tension (`spread` 1) très lisible sur la couche seule, coutures en pointillés. Fil-cœur trop gros, trop vert → âme 0,04, quatre brins 0,026, veille 0,32.
- **p3 (8)** : balle à 4 cm + tranche OK ; dos du gilet à 4 m dit « gilet » ; deux flèches lisibles du flanc droit ; essai de traction lisible (Kevlar veille à gauche, acier clair à droite, éclair au point de rupture) — blocs et potence éclaircis (clair sur sombre). Au like, le champignon invisible (trou plus petit que la couronne) → le trou s'ouvre avec `mushroom` (rayon 0,47 → 0,77 en face rue).
- **p4 (6)** : états de l'acte 3 (zero, cone, mush, planted, like, track) : cône, champignon, balle plantée, traîne vue de 1,6 m OK ; la coupe trop verte (tension + part de chaque couche partout) → tension concentrée sur les ≈ 5 couches juste derrière la déchirure (`exp(−(k − kp)/5)`), sur 0,8 + 1,8·tense cm le long de y ; reste de `share` 0,22 → 0,1. Le liseré rouge du trou ne brûle plus que pendant que les fils cassent (`breaks`), 0,12 sinon.
- **p5 (3)** : macro (d 24) : les feuillets clairs, pliés en V, la balle en champignon dans l'encoche, le chevron vert du pli, les brins rouges, le sillage ; sans lumière, la tranche reste un feuilleté gris fin sans moiré. Fil-cœur torsadé, bout enroulé.
- **p6 (1)** : éventail 0 → 36° (couche 0 à plat) : pages qui s'ouvrent vers la droite. À d 230 la pile déborde à droite du cadre (voir poses).

## Les nombres de l'état, chez moi

`vest` fondu du porte-panneaux · `out` le panneau glisse de `OUT` (la poche reste ; son cône s'efface avec `out`) · `section` le plan de coupe balayé du bord (z 20) à l'impact (z 5) · `housse` les deux moitiés à ±38 en x, −30 en z, ±18° · `explode` les 24 pages (départ échelonné, retombée avec un poil de rebond) · `litHousse` bride et contour veille · `litSeams` fils des coutures veille · `litWeave` sommets des fils veille douce · `fiber` 0 → 1 le fil sort sur sa longueur · `solo` les 23 autres couches s'effacent · `spread` 0,3 croix, 1 étoile (+ point signal) · `test` fondu de la potence · `load` 0,2 un bloc chacun, 0,4 le 2ᵉ casse l'acier (0,4 → 0,64 chute et fondu), 1 cinq blocs · `faces` **0 → 0,5 la flèche rue, 0,5 → 1 la flèche toi** · `bullet` fondu · `dist` vol le long de x · `trail` longueur 25 + 95·trail cm et intensité · `pierce` couches déchirées (fraction, plafonnée à 0,45) · `breaks` **0 → 0,5 les brins jaillissent (pic), 0,5 → 1 ils retombent et s'éteignent** · `tense` croix veille sur les couches qui tiennent · `ring` le pli (rayon 0 → 9 cm, chaque couche en retard) · `share` bande veille qui traverse l'épaisseur · `cone` 0 → 4,4 cm · `mushroom` morphing nez → couronne · `bench` lu, sans effet.

## Poses qui cadrent (vérifiées, sauf mention)

- macro / première image en coupe : `{ ...P, tx: -9.5, ty: 107, tz: 5, d: 24, az: 16, el: -4, fov: 34, shift: 0 }` (p5)
- zero : `{ ...P, ...CLOSE, tx: -10.5, ty: 106.5, tz: 5, d: 30, az: 18, el: 4, fov: 32, shift: 0 }` (p4)
- cone, mush, planted, tip, track, night, test, faceRue : celles de `world.js` cadrent (p3, p4).
- like : `{ ...P, tx: BX, ty: 110, tz: BZ, d: 80, az: -52, el: 16, fov: 30, shift: 40 }` (p4 : champignon ≈ 25 px ; plus près serait mieux, non vérifié)
- fiber : `{ ...P, ...CLOSE, tx: BX - 31.9, ty: 141, tz: BZ + 9, d: 34, az: -66, el: 8, fov: 30, shift: 0 }` (p5 à d 30 : la boucle touche le bord haut gauche)
- exploded : `{ ...P, tx: BX + 9, ty: PANEL.y + 2, tz: BZ + 4, d: 260, az: -50, el: 16, fov: 30, shift: 60 }` (**non vérifié** : à d 230 / tx BX la pile déborde à droite)

## Pas encore au niveau

- POSE0 (d 140) : la coupe n'y fait qu'un liseré de 1 cm (≈ 5 px à 270) ; elle ne se lit qu'à d ≤ 60. La macro coche mieux les six points.
- Les deux flèches chevauchent les hanches de verre (lisibles d'az −150, serrées).
- Le balayage de `section` entre 0 et 1, et `housse`/`explode` à mi-course, n'ont pas été regardés.
- Porte-panneaux sans boucle ni détail fin au-delà du velcro et des coutures.

## À changer ailleurs

- `world.js` → `VIEW.macro` : `macro: { ...P, tx: -9.5, ty: 107, tz: 5, d: 24, az: 16, el: -4, fov: 34, shift: 0 },`
- `world.js` → `VIEW.zero` : `zero: { ...P, ...CLOSE, tx: -10.5, ty: 106.5, tz: 5, d: 30, az: 18, el: 4, fov: 32, shift: 0 },`
- `world.js` → `VIEW.like` : `like: { ...P, tx: BX, ty: 110, tz: BZ, d: 80, az: -52, el: 16, fov: 30, shift: 40 },`
- `world.js` → `VIEW.fiber` : `fiber: { ...P, ...CLOSE, tx: BX - 31.9, ty: 141, tz: BZ + 9, d: 34, az: -66, el: 8, fov: 30, shift: 0 },`
- `world.js` → `VIEW.exploded` (à vérifier sur planche) : `exploded: { ...P, tx: BX + 9, ty: PANEL.y + 2, tz: BZ + 4, d: 260, az: -50, el: 16, fov: 30, shift: 60 },`
- `world.js` → `FIRST`, commentaires : `faces: 0, //     the two faces: 0 → 0.5 the arrow toward the street · 0.5 → 1 the arrow toward the body (veille)` et `breaks: 0.5, //  the broken yarn ends: 0 → 0.5 they spring out (peak, signal) · 0.5 → 1 they droop and dim`

## Pour `docs/catalogue.md`

`044/gilet.js` — gilet pare-balles souple, plein : porte-panneaux (poche, dos, bretelles, sangles à velcro), panneau de N couches tissées (tissage `fwidth`, coutures), coupe balayée dont la tranche dessine les feuillets, cône et pli au shader, balle 9 mm + champignon (morph), brins cassés instanciés (`makeStrands`), fil-cœur torsadé, essai de traction Kevlar / acier. Options : tout par `p` (25 nombres), `fabric()` réutilisable pour tout tissu qui se creuse et se coupe.

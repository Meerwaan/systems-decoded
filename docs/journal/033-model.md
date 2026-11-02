# 033 · Porte d'avion — journal de `src/model.js` (agent decor)

## Lu
recette-agents, regles-image, 033-decors (haut + model.js), 033-actes (acte2, acte3), plan.js, world.js, main.js, bouchon model.js, build3d (API), blocks (makeBench, setMood), stage (directions des lumières), tête de vol.js.

## Choix (avant la première planche)
- **La porte suit le fuselage** : toutes les grandes pièces sont des dalles courbes (rayon 282, axe à y local 96 = l'axe de l'A330), extrudées le long de x (`slab()` = `plate()` d'un profil courbe, tourné). Elle affleure le verre du 023 dehors (une porte plate dépassait de 15 cm en haut et en bas) et la coupe montre un profil en arc.
- **L'empilement (z local, + dehors)** : peau 0 → −2 · cadre −2 → −14 · butées du cadre −14 → −18 · butées de la porte −18 → −22 · panneau (débord) −22 → −36 (t = 14) · doublure −36 → −38. Le bouchon de porte (le « plug ») remplit l'ouverture de 0 à −36, à 0,8 cm du cadre. Courbure : le pied de la doublure est ≈ 10 cm plus à l'intérieur que son milieu.
- **La coupe** (`section`) passe par le plan des butées arrière (x = 57,5), pas par x = 0 : à x = 0 elle ne traverse aucune butée (elles sont sur les bords verticaux). Profil lu de gauche à droite : cabine | doublure | panneau | butées | cadre | peau | dehors. Faces de coupe pleines, non éclairées (trois gris + butées veille).
- **Sa lumière** (le contre-jour) : un projecteur à lui, dans la cabine (en haut, à l'arrière, à 3 m), braqué sur la doublure, + un halo doux derrière la porte côté nuit, visible de la cabine seulement (face avant, ordre 5) ; les deux éteints sur l'établi (détecté : le parent de `root` est à l'origine).
- **Ouverture (Corée)** : bras parallèle — la porte sort (+z) et part vers l'avant (−x), un peu de lacet ; le bras va d'une racine fixe sur le cadre avant au bord avant de la porte. Jamais de levée, jamais vers l'intérieur.

## Planches
- `p1` (8) : éclaté lisible, coupe lisible (cabine à gauche, nuit à droite, surplus veille en croisière). Défauts : doublure brûlée en cabine (projecteur 2,4 trop fort), `named` 3 et 4 qui bavent (vert plein cadre), bouchon de porte trop sombre dehors.
- `p2` (8) : projecteur à 1,1 → doublure claire sur fond sombre, plus de brun. Défauts : poignée verticale à côté du hublot = on lit « 10 » ; le mur de flèches vu de dos = des points.
- Demande de vol.js (via le chef) : prise à 100–115 cm, +y de `A.handle` le long de la barre → pivot `HAT` = (34, 150), levier incliné de 30° vers l'avant (`HYAW`) : la prise tombe à x ≈ 11, y ≈ 110 (≈ 109 cm du plancher), sous le hublot ; `grip.rotation.z = −π/2`.
- `p3` (8) : plus de « 10 » ; mains sur la prise ✓ ; mur en traînées (170 flèches, étirées ×2,6) qui filent vers la porte ✓ ; bord arrière (arbre, crochet, butées veille) ✓.
- `p4` (8) : poses de travail validées (ci-dessous) ; Corée : la porte sort et part vers l'avant, signal ✓ ; flanc à 3 600 cm : porte, hublot et liseré se lisent ✓. Faces de coupe du cadre assombries ensuite (non revu).
- `check` : construit ; échoue sur le contraste du `nav` de l'en-tête (index.html, à 4,79 s et 43,07 s), pas sur ce fichier.

## Poses qui cadrent (prêtes à coller ; établi : repère du banc, avion : DX DY DZ de world.js)
- `exploded` : `{ ...P, tx: -10, ty: 100, tz: 70, d: 660, az: -40, el: 14, fov: 30, shift: 100 }`
- poignée + arbre dans UN cadre (`named` 1 puis 2, éclaté) : `{ ...P, tx: -52, ty: 105, tz: 145, d: 440, az: -40, el: 10, fov: 30, shift: 0 }`
- `lapB` (débord, de trois quarts côté cabine) : `{ ...P, tx: -30, ty: 100, tz: 20, d: 440, az: -55, el: 18 }` — celui du bouchon (az −80) est de chant : la bande veille y fait une dalle.
- `stopB` : inchangée (tx −56, ty 82, tz 16, d 75, az −60, el 12) : la paire veille, nette.
- `section` : `{ ...P, tx: -10, ty: 96, tz: 0, d: 720, az: 90, el: 4, shift: 0 }` (à d 620 les flèches débordent).
- `handle` (avion) : `{ ...P, ...CLOSE, tx: DX + 20, ty: DY + 108, tz: DZ - 48, d: 170, az: 140, el: 10, fov: 30, shift: 60 }`
- `edge` / « il la plaque » (avion) : `{ ...P, tx: DX + 54, ty: MIDY, tz: DZ - 30, d: 200, az: 155, el: 8, fov: 30, shift: 40 }`
- une paire de butées dans l'avion (« encaissent ») : `{ ...P, ...CLOSE, tx: DX + 58, ty: DY + 82, tz: DZ - 18, d: 110, az: 150, el: 12 }` (à d 85 : trop serré, à revoir).

## À changer ailleurs
- `src/vol.js` : `const LINING_Z = DOOR_AT[2] - 49;` (la doublure est à −36 au milieu et −49 au pied : la porte suit la courbe du fuselage ; −18 met les orteils du voisin dans la porte).
- `src/plan.js` · `DOOR.handle` : `handle: { at: [34, 150], len: 46, yaw: -30 }, // pivot; the lever hangs forward-down, its grip ≈ (11, 110)` (model.js porte ses propres `HAT`/`HYAW` : ligne documentaire).
- `src/world.js` · `VIEW` : les poses ci-dessus (`exploded`, `lapB`, `section`, `handle`, `edge`) ; `handleB` → la pose « poignée + arbre ».
- `index.html` : contraste du `nav` de l'en-tête (4,1–4,45:1) — pas ce fichier.

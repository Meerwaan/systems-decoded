# 013 — model.js (la cellule de survie, le Halo, toi)

Fichier : `episodes/013-halo/src/model.js` (1 169 lignes, passe au build). Images lues : **30 sur 30** (planches de 6, 8, 8, 4, 2, 2). Planches, `essais.json` et outils dans le dossier temporaire `scratchpad/013/model-*`.

## Ce qui est construit

- **La coque** : UN volume lofté le long de z (≈ 85 sections, même nombre de points dans chacune), pas des boîtes. Le cockpit est creusé dans le même maillage : son contour en plan est une vraie courbe (rond derrière la tête, nez arrondi au volant), sa lèvre a son arête, le baquet descend en pente sous ton dos. Chanfrein d'épaule sur toute la longueur (deux arêtes fines), bouchain en bas, hiloire devant le cockpit puis une tablette où se pose le pilier, plancher qui remonte vers la cloison avant (4 → 13 cm). Trappe sur le nez (quatre traits fins, quatre attaches).
- Derrière la tête : la tour de l'arceau principal (arches, face avant presque verticale où s'ouvre la prise d'air ovale, bandeau usiné à `CELL.hoop`), l'appui-tête en U.
- **Inserts usinés (gris moyen)** : cadre de la cloison avant et ses quatre plots, quatre ancrages de suspension et deux douilles de structure latérale par flanc, cadre de la cloison arrière, six goujons moteur, raccord de carburant, bandeau de l'arceau, **trappe du réservoir sur le flanc GAUCHE (+x)** — c'est ce que dit le rapport de la FIA ; la caméra habituelle (−x) ne la voit pas. Trois **sièges du Halo** dans la coque : un bloc devant le cockpit, deux bossages chanfreinés à cheval sur les épaules (2 cm en saillie du flanc, deux vis).
- **Le Halo** : tube Ø 5,2 balayé sur `HALO.ring` (repère transporté), quatre colliers de soudure, pilier à section presque elliptique (fin de face, profond de profil) qui s'évase en gousset sous l'anneau, sa bride, deux sabots arrière où le tube entre, écrous. Titane clair, brossé (`metal` 0,35, `rough` 0,5).
- **Trois fixations** : une platine et deux goujons longs chacune (cachés dans les sièges tant que c'est assemblé). Éclaté : l'anneau, son pilier et ses sabots (une seule pièce soudée, comme le vrai) montent de 70 cm ; les trois fixations de 35 cm.
- **Toi** : `makeFigure` en verre, mains comprises ; tronc couché de 50°, tête redressée à `HELMET.c` ; casque plein (encre claire, visière sombre, bourrelet de cou, pivots) ; volant papillon plein sur sa colonne ; harnais six points (six rubans, une boucle) posé sur le tronc.
- **Lumières** : peau de lumière sur l'anneau (charge de l'essai / ligne de l'acier), deux cœurs de lumière et des étincelles lentes aux deux points où la droite du rail croise l'anneau (calculés d'après `ahead`), volume veille sous l'anneau, deux lampes ponctuelles (veille dans le cockpit, signal derrière toi).

## Ce qui a raté, et pourquoi

1. **Carbone noir sur noir** (planche 1) : `0x2b3036` donnait un flanc à 2-6-7 sur 255 (mesuré avec `model-probe.mjs`, sans dépenser d'image). Une couleur sombre en sRGB est presque nulle en linéaire. Carbone remonté à `0x4c5259`, intérieur `0x33383d`, appui-tête `0x5f666d`, inserts `0x7e868d`. Les trois valeurs tiennent.
2. **Titane qui bave** : `metal` 0,45 / `rough` 0,36 faisait fleurir le reflet de la boîte à lumière sur l'avant de l'anneau — or une lueur sur l'anneau, c'est le langage de `press` et de `stress`. Passé à 0,35 / 0,5.
3. **La prise d'air en tuyau de poêle** : un conduit de 11 cm sortait d'une tour en pente. La tour a maintenant une face avant, le conduit n'en dépasse que d'un à deux centimètres.
4. **Le casque faisait un visage** (visière haute + fente de menton) : visière plus étroite, plus de fente.
5. **Les cales d'établi** : plus claires que la coque, elles attiraient l'œil. Supprimées : la coque repose sur son plancher plat (140 cm de contact). `bench` ne fait donc rien chez moi.
6. **L'ancrage arrière était une boîte** : devenu un bossage chanfreiné ; et `litMounts` / `litFoot` n'allument plus les sièges de la coque (tout vert, on ne lisait plus l'empilement).
7. **Fixations illisibles dans l'éclaté** : goujons allongés (ils traversent la platine), plus gros, platines levées à 35 cm.
8. **`space` en boule** (deux essais) : une boule a un bord. Le volume est maintenant plus large que ce que l'œil en voit, avec une chute de lumière longue (puissance 3), tenu dans la largeur de l'anneau, et s'arrête au rebord du cockpit ; son cœur tire vers le blanc pour ne pas repeindre le casque.
9. **Le casque disparaissait à `out` 1** : debout côté piste, tu es derrière le feu (rail.js), dont la lumière additive noie tout ce qui est plein — le verre du corps, dessiné après, se voit. Le casque reçoit donc au-delà de `out` 0,5 un contour de verre dessiné comme le corps.
10. **La ligne de `stress` s'éteignait sur les bras de l'anneau** : la bande était calculée contre une direction fixe. Le balayage porte maintenant `aBand` (la direction ramenée dans le plan de chaque section) : la ligne garde sa largeur tout autour.
11. Côté code : triangles sans aire écartés du loft (une normale nulle est un NaN) ; `TorusGeometry` est indexée et ne se fusionne pas avec les pièces du kit ; ordre des sommets du balayage (repris de `012/model.js`).

## Outils (dossier temporaire)

- `model-smoke.mjs` : compile `model.js` pour node, construit le système, passe `update` par neuf états, cherche les NaN, vérifie le sens des normales. Zéro image.
- `model-frame.mjs` : la caméra du plateau sans rien dessiner — où tombent la coque, l'anneau, le casque pour une pose. Tous les cadrages ont été réglés ainsi.
- `model-probe.mjs` : couleur moyenne d'un carré d'une planche (sharp).

## Les poses (prêtes à coller)

Sur l'établi le système est à `SYSTEM.bench` : z établi = z voiture − 61, y établi = y voiture − 4. Les `VIEW` d'origine visaient en coordonnées de voiture (`haloPart` : tz 70).

```js
// établi
whole:     { ...P, tx: 0, ty: 46, tz: 6, d: 860, az: -30, el: 20, shift: 160, side: 70 },      // vue (avec zones) : x 79…871, y 475…1187
exploded:  { ...P, tx: 0, ty: 74, tz: -8, d: 1080, az: -46, el: 17, shift: 110, side: 60 },     // tout dans le cadre ; fixations petites
explodedClose: { ...P, tx: 0, ty: 82, tz: -30, d: 860, az: -42, el: 18, shift: 80, side: 50 },  // le nez sort en bas à droite ; fixations lisibles
haloPart:  { ...P, tx: 0, ty: 72, tz: -58, d: 400, az: -36, el: 16, shift: 150, side: 40 },
footPart:  { ...P, tx: 0, ty: 70, tz: -4, d: 190, az: -50, el: 12, shift: 170 },                // fs 60, fz -4
mountPart: { ...P, tx: -27, ty: 62, tz: -101, d: 150, az: -64, el: 16, shift: 150 },            // fx -27, fz -100, fs 50
cellPart:  { ...P, tx: 0, ty: 36, tz: 10, d: 1010, az: -50, el: 16, shift: 170, side: 60 },     // calculée, pas vue
pressPart: { ...P, tx: 0, ty: 84, tz: -40, d: 460, az: -36, el: 12, shift: 60, side: 20 },      // fy 70, fz -40, fs 120 ; le vérin est noir avant l'en-tête
headBench: { ...P, tx: 0, ty: 70, tz: -57, d: 340, az: -30, el: 13, shift: 150, side: 30 },     // la chute sur l'établi (you 1, space 1)
// piste
cockpit:   { ...P, tx: 0, ty: 74, tz: 4, d: 340, az: -30, el: 13, shift: 150, side: 30 },       // « l'arceau tient » : vue avec stress 1, ahead 0.9, fire 0.3
belts:     { ...P, tx: 0, ty: 62, tz: 14, d: 320, az: -26, el: 36, shift: 150 },                // le harnais ne se voit que d'en haut
exit:      { ...P, tx: 30, ty: 90, tz: 10, d: 600, az: -40, el: 8, fov: 32, shift: 100 },       // out 0.5, 0.76, 1
profile:   celle de world.js convient (vue avec stress 1, ahead 0.9)
```

## À changer ailleurs

- `world.js` → `VIEW` : les poses ci-dessus. `BENCHED` met `you: 0` : la chute sur l'établi demande `you: 1`.
- `world.js` → `POSE0` : la cloison avant de la coque tombe dans la colonne des boutons (x > 905, y ≈ 870…1150). `side: 80`, ou `tz: 40`, à essayer par celui qui règle l'accroche — je n'ai plus d'image pour le vérifier.
- `f1.js` (nez) : à la cloison avant (z = 198) ma coque va de y = 13 à y = 46, demi-largeur 16 (le plancher remonte : `plan.js` dit `floor: 4` partout). Si le cône de nez part de y = 4, il y a une marche de 9 cm dessous.
- `plan.js` : rien d'obligatoire. `EXIT.over` sert de repère (le bassin passe 6 cm en deçà).

## Ce qui n'est pas au niveau

- **`space`** : un volume doux sous l'anneau, contenu, mais encore rond côté pilier ; le casque verdit un peu. Correct, pas remarquable.
- **`out`** : cinq postures schématiques. 0,24 n'a jamais été regardée ; 0,76 est un personnage accroupi au-dessus de la poutre, les mains ne tiennent rien. À ne montrer que de loin et brièvement. Au-delà de 0,5, vu du côté habituel, le casque n'est qu'un contour (le feu).
- **Le harnais** : deux sangles d'épaule lisibles d'en haut (el ≥ 30) ; à el 8 on n'en voit qu'une lueur sous le menton. Sangles ventrales et d'entrejambe cachées par le rebord.
- **Le volant et les mains** : sous le rebord du cockpit, on ne les voit que de dessus.
- **L'éclaté** : à d 1080 les fixations font une trentaine de pixels ; `explodedClose` est le bon cadre pour la phrase qui les nomme.
- **Le flanc** : grand et simple ; il se lit par ses deux arêtes d'épaule et ses inserts, et s'assombrit vers le sol.
- Jamais vus : `litHalo` et `litCell` (même mécanisme que `litFoot` / `litMounts`, vus), `cellPart`, `out` 0,24, la cloison arrière après les retouches.

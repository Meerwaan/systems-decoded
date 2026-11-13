# 046 · Torchère — journal de `src/model.js` (le réseau de torche, plein)

2026-11-13.

## Lu
Recette agents, règles d'image, `046-decors.md` (haut + ma section), journal de l'architecte, `plan.js`, `world.js`, bouchon, `build3d.js` (API), en-tête de `CR02/plateforme.js` (contre-jour posé depuis la caméra), gaine de `008/model.js` (tête qui avance, `uMinPx`).

## Choix
- **Le chemin du gaz** : ma propre polyligne (`GAS`) qui suit `HEADER.path`, mais traverse le ballon à mi-hauteur (la coupe le montre) ; `flow` → position par morceaux sur les étapes de `FLOWAT` (le chemin de `plan.js` n'est pas à vitesse constante entre les étapes : `drum` .36 tomberait à 0,16 de la longueur). 0 → 0,12 : trois têtes descendent des soupapes et convergent au té du collecteur ; puis une seule tête.
- **La lumière du gaz** : une gaine additive sur chaque tuyau (droits et coudes), allumée sur une **bande** tournée vers la caméra (`STRIPE`), le tuyau reste plein ; une tête (cœur + traîne, `uMinPx`) posée sur la surface ; derrière elle, la traîne reste allumée avec des pulsations lentes (320 cm, 110 cm/s : 1/90 de période par image).
- **Coupe** (`section`) : ballon, garde et cheminée sont des tours partiels (lathe) avec faces de coupe claires ; le quart avant est une pièce à part qui s'efface en solide et passe en verre.
- **Contre-jour** : un halo ink posé derrière la cheminée depuis la caméra (`onBeforeRender`), au point de l'axe le plus proche du rayon de visée ; nul quand la cheminée n'est pas dans l'axe (rien ne voile un gros plan du ballon).
- **Explode** : soupapes +160, bout +140 (le kit). Le pas du ballon et de la garde vers la caméra est **à 0** (`STEP`) : à 260, `VIEW.drum` / `VIEW.seal` visaient le vide (elles servent à la fois la scène, explode 0, et l'établi).
- **Soupapes ×1,5** (`VS`) autour de `VALVES[i].at` : à l'échelle de la maquette elles étaient des points ; corps, chapeau, arcade ouverte (deux montants en travers de la caméra), ressort clair qui se raccourcit, tige et coupelle qui montent (`relief`, 15 cm dans leur repère).
- **Bulles signal** dès que la tête atteint le bas du plongeur et tant que `flow` > `seal` (le gaz continue de passer pendant le torchage) — la consigne dit « entre `seal` et `sealOut` » ; je les garde après parce que le gaz bulle tant que la torche brûle.

## Planches (32 images lues : 2 de trop, je m'arrête là)
1. Premier jet, 8 : la gaine du gaz allumait tout le tuyau (bande trop large, trop forte), la tête en boule blanche ; la purge éblouissait tout plan qui avait la cheminée dans le fond ; `VIEW.drum` / `VIEW.seal` trop serrées (et décalées par le pas de 260) ; soupapes illisibles.
2. Corrections, 8 : le ballon en coupe **réussi** (nappe signal, gouttes, tête qui traverse, faces de coupe claires, berceaux) ; le bout et les flèches d'air se lisent ; garde trop verte (`litSeal` à 0,2 d'émission : ramené à 0,07) ; équerres de plateforme en « ailes » → goussets triangulaires.
3. Soupapes ×1,5 : le ressort dans l'arcade se lit en gros plan ; la garde en coupe dans la scène (eau sombre, liseré veille, bulles signal, plongeur) **réussie** ; la cheminée fendue et sa purge se lisent ; le contre-jour se voit au crochet.
4. Les `VIEW` de l'architecte : `exploded`, `foot`, `header`, `tip` tiennent ; `drum` et `seal` trop serrées ; le halo voilait la droite des plans de la garde → seuil resserré (angle < 21°) et 0,22 sur l'établi (non revu).

## Poses qui cadrent (vues sur planche)
- crochet (a) : `POSE0` tel quel — la cheminée sombre bordée de clair, la plateforme, le bout, la pilote ; (b) : le bout en contre-jour sur la flamme (le bout reste sombre : il est vu côté ombre).
- ballon : `{ tx: -1050, ty: 300, tz: 0, d: 3000, az: -38, el: 18, fov: 28, shift: 120, dof: 0 }` (le ballon entier en coupe ≈ 60 %).
- garde : `{ tx: -430, ty: 250, tz: 0, d: 1300, az: -34, el: 16, fov: 28, shift: 120 }` (la garde entière, coupe ouverte, ≈ 55 %).
- une soupape : `{ tx: -1930, ty: 1420, tz: 0, d: 900, az: -40, el: 8, fov: 28, shift: 60 }` (explode 0 ; sur l'établi éclaté, `ty` + 160).
- `VIEW.exploded`, `VIEW.foot`, `VIEW.header`, `VIEW.stack`, `VIEW.tip` : bonnes telles quelles.
- trois soupapes : non trouvée. Vues du côté −x (`az` négatif), elles sont **derrière** les colonnes de verre ; à essayer `az` ≈ +45 (côté +x, devant les colonnes), non revu.

## Pas encore au niveau
- `VIEW.valves` : les trois soupapes ensemble ne cadrent pas encore (voir ci-dessus).
- La garde sur l'établi (humeur veille) : le vert du plateau teinte l'intérieur clair ; l'eau se lit moins sombre que dans la scène.
- Le bout vu du crochet (az 156) est sur sa face d'ombre : sombre, pas « plus clair ».

## À changer ailleurs
- `world.js` → `VIEW.drum` : `{ ...P, ...CLOSE, tx: KX, ty: KY + 30, tz: 0, d: 3000, az: -38, el: 18, shift: 120 }` ; `VIEW.seal` : `{ ...P, ...CLOSE, tx: SEAL.at[0], ty: 250, tz: SEAL.at[1], d: 1300, az: -34, el: 16, shift: 120 }`.
- `docs/046-actes.md`, ligne « Il bulle dans la garde » (52,55) : la scène doit ouvrir la garde (`section` ≈ 0,8) — sans coupe, les bulles sont dans le corps plein.
- `flamme.js` (son agent) : une flamme pilote à chacune des trois buses (`PILOT.at` et ±120°, rayon `Math.hypot(PILOT.at[0], PILOT.at[2])`) ; du crochet (az 156) la buse héros est derrière le bout. (Vu sur planche : il semble déjà en dessiner plusieurs.)
- `docs/catalogue-notes.json` : `046/model.js` — réseau de torche plein (soupapes à ressort, collecteur, ballon et garde en coupe, cheminée fendue, bout et pilotes) ; gaine de gaz à bande (`flow`), contre-jour posé depuis la caméra.

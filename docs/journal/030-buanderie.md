# 030 · Prise de terre — journal de `src/buanderie.js`

2026-10-22. Agent du décor « la buanderie aux rayons X » (consigne : `docs/030-decors.md`, section `src/buanderie.js`).

## Lu
- `docs/recette-agents.md`, `docs/030-decors.md`, `plan.js`, `world.js`, le bouchon, `docs/journal/030-architecte.md`, le haut de `docs/030-actes.md`.
- `kit/lib/build3d.js`, `atmo.js`, `figure.js` ; pour l'idiome `004/src/room.js` (la pièce, le chemin du courant par toi) et `016/src/wall.js` (le mur de verre, le coffret, `makeFlare`, `makeSet`).

## Décisions (avant d'écrire)
- **Le tambour ne peut pas « décélérer » par une fonction pure de (`spin`, `time`)** : un angle `ω·t·spin` fait tourner le tambour à l'envers dès que `spin` baisse à t ≈ 47 s. Donc : la carcasse du tambour est de révolution (aucun détail qui tourne), ce qui dit la rotation c'est **le linge** — plaqué en anneau contre la paroi pendant l'essorage (il tourne à 2,5 tr/s, le flou de l'obturateur fait le reste), qui **retombe en tas** au fond quand `spin` descend (chaque paquet glisse de sa place sur l'anneau vers sa place dans le tas). Les trois aubes sont fixes, couvertes par l'anneau de linge pendant l'essorage, découvertes quand il tombe.
- **Le tremblement** : une composante à 30 Hz (la cadence : un flou stable) + une houle lente (1,1 et 1,7 Hz) ; le système (`mount`) ne tremble pas.
- **La flaque** : une couche additive, pas un miroir. Ce qu'elle reflète est calculé dans le shader : le rayon de l'œil réfléchi sur l'eau, s'il touche la carcasse, renvoie ses arêtes verticales et son pied (signal quand elle est sous tension), estompés avec la hauteur, ondulés par les rides. Le reste de la flaque : un ménisque fin, les rides de l'essorage, et sous `body` les anneaux signal qui partent de tes pieds.
- **Le défaut sans étincelles** : sans terre aucun courant ne circule ; la lumière au défaut est un repère (« là où il touche »), pas un arc.
- **Un renfort de tôle** (montant vertical contre le panneau gauche, x ≈ −28,6) : c'est lui que le fil touche à `FAULT` (le panneau lui-même est à x −30, à 2 cm du point du plan).
- **La main** : la droite (consigne), le buste penché de 3° à 31° pour que le bras atteigne le capot (l'épaule est à 83 cm du point de contact debout). « Au-dessus du capot » = la paume à 3 cm du capot (le `YOU.hover` du plan est à 11 cm : pris pour le xz seulement).
- **Sous le sol rien ne se voit à `under` 0** : un masque de profondeur invisible au niveau du sol (il cache aussi ce que le modèle pose sous la dalle).

## Construit (`src/buanderie.js`, remplace le bouchon, même API)
- **Le sol** : joints de carrelage (shader, cellule 30 cm, alignés sur les murs, effacés quand ils passent sous quelques pixels) ; **la flaque** (couche additive au contour irrégulier) : ménisque, rides de l'essorage depuis les deux pieds avant, anneaux signal depuis tes pieds (`body`), et **le reflet calculé** de la carcasse (arêtes verticales et pied, signal là où l'onde est passée, estompé avec la hauteur) et de tes jambes ; des gouttes qui sautillent aux pieds avant (`spin`). Un **masque de profondeur** invisible au niveau du sol (`under` 0) : rien de ce qui est dessous ne se voit.
- **La pièce** : mur du fond et mur de gauche en verre (ordre 30, dessinés en dernier), plinthe, plafond en traits ; dans le mur : la boîte de la prise, la gaine (verre), la phase et le neutre (deux traits encre) du tableau à la prise, **à l'extérieur** du vert-jaune du modèle ; le coffret du tableau (verre, plastron, fenêtre de la rangée).
- **La machine** : carcasse + capot + renfort du panneau gauche en **verre « vivant »** (shader propre : l'onde signal part de `FAULT`, une crête court au front, un léger remplissage garde les panneaux lisibles, respiration lente) ; ses arêtes et les traits de façade (bandeau, bac à lessive, ouverture de la porte, trappe du filtre) découpés en 14 bandes de distance qui prennent l'onde ; pieds, passe-câble ; bandeau (molette, petit écran encre, quatre voyants ; `trip` les éteint) ; **porte** (anneau de plastique, hublot de verre bombé vers le tambour, charnière, poignée : jamais signal) ; **tambour** inox (paroi, fond, moyeu, bouche, trois aubes) ; **linge** : 14 paquets plaqués en anneau qui tournent à 2,5 tr/s et retombent en tas quand `spin` descend ; **fil de phase** (gris) et son bout dénudé contre le renfort ; **la lumière du défaut** (cœur blanc, corps, traîne signal ; gonfle ≈ 2 images quand `fault` monte, puis petite et lente).
- **Toi** : `makeFigure({ shell, hands: "real" })`, pieds aux places du plan ; le buste se penche (3° → 26°, 31° à `touch`) et tourne de 12° pour que la main droite atteigne le capot ; paume à plat, à 3 cm au-dessus (`reach` 1), posée (`touch` 1). **Le chemin du courant** : main → bras → tronc → chaque jambe → plante, en pointillé signal pâle (`body` 0–0,3), puis des têtes signal qui y courent (0,3–1 ; période 21,5 cm, ≈ 1/10 par image).
- **Sous le sol** : dalle (verre très pâle), semelles sous les deux murs (verre, arêtes fortes) prolongées de 4,2 m au-delà de la pièce, qui s'effacent ; fond de fouille ; bloc de terre (strates sur les deux faces vues, 520 grains fixes).

## Les nombres
`shell` le verre et les traits de tout le décor · `spin` le linge (anneau ↔ tas), le tremblement (30 Hz + houle 1,13 / 1,71 Hz), les rides, les gouttes · `live` le front de l'onde (0 → 104 cm depuis `FAULT`) sur la tôle, ses arêtes et son reflet · `fault` la lumière du défaut · `reach` / `touch` la main et le buste · `body` le chemin, puis les têtes et les anneaux · `under` la coupe (et le masque) · `trip` le bandeau éteint. `chain`, `mood` : rien.

## Planches (30 images lues)
1. Quatre candidates (avec l'en-tête) : (a) bonne ; (a′ az −16) perd le panneau gauche ; (e) de droite : le tambour vu de côté fait un gros cylindre cuivré ; (d) illisible.
2. Machine, défaut, toi : le **dessus du capot faisait une dalle blanche** (un plan de verre avec liseré, vu en rasant) → retiré ; liseré du verre vivant baissé (edge 0,45 → 0,1, power 3,5) ; le bout dénudé brillait sans défaut → cuivre mat ; pointillé du corps trop pâle → relevé. Toi : la pose penchée lit bien, main à plat sur le capot ; têtes et anneaux dans la flaque lisent bien.
3. Pieds, geste, mur, tableau, sous le sol, coupe, loin : **sous le sol = un voile gris** (dalle et semelles vues en rasant de l'intérieur) → rim de la dalle 0,05, des semelles 0,22. `VIEW.reach` : ton buste en très gros plan.
4. Candidates sur le vrai décor (avec l'en-tête), machine `live` 1, geste v2, sous le sol, coupe.
5. Sous le sol v2 et coupe : la boucle (modèle) fait l'angle et file, le conducteur descend ; les semelles restent pâles.

## La première image — sur le vrai décor (planche 4, avec l'en-tête)
- **(a) `POSE0`** `{ tx: 14, ty: 40, tz: 50, d: 280, az: -28, el: 2, fov: 46, shift: 80, side: 0, dof: 0 }`, `reach` 0,3 : la machine signal sur ≈ 55 % de la largeur, le linge qui tourne derrière le hublot, le reflet orange sous elle, le vert-jaune (modèle) qui part à gauche, tes jambes et ta main à droite. 1 ✓ · 2 ✓ · 3 ½ · 4 ✓ · 5 ✓ · 6 ✓.
- **(a′)** `{ tx: 18, ty: 44, tz: 46, d: 270, az: -40, el: 1, fov: 46, shift: 70, side: -30, dof: 0 }`, `reach` 0,4 : la machine sur ≈ 65 %, le panneau gauche et le fil de phase visibles, **ta main arrive sur le coin du capot** (elle s'y découpe), tes jambes et leur reflet dans la flaque à droite. 1 ✓ · 2 ✓ · 3 ½+ · 4 ✓ · 5 ✓ · 6 ✓. **Ma préférée.**
- (f) de droite au ras du sol `{ tx: 34, ty: 46, tz: 44, d: 300, az: 50, el: 2, fov: 46, shift: 80 }` : tes jambes passent devant la tôle (3 ✓), mais le tambour vu de côté fait un gros cylindre cuivré et la machine rapetisse (4 ✗) : sort.
- (b) par-dessus l'épaule : encombrée par toi en verre : sort. (d) illisible.
- Depuis la gauche, aucune pose ne met tes jambes **devant** la tôle : il faudrait que tu sois entre la caméra et la machine, donc devant la porte (l'erreur du hublot) ou filmé de droite (f).

## Poses qui cadrent
- `machine`, `you`, `wall`, `tableau`, `far` (VIEW tels quels) : lisibles ; `live` 0 / 0,5 / 1 se lisent (l'onde part du panneau gauche).
- `fault` (VIEW tel quel) : le fil, le renfort, la lumière ; mais les arêtes signal du renfort, floues (dof 8), font des barres verticales qui dominent.
- `reach` : `{ tx: 34, ty: 102, tz: 44, d: 290, az: -48, el: 12, fov: 28, shift: 40, side: 0, dof: 0 }` (à d 250 ton buste prend encore la moitié droite ; le VIEW d'origine, d 190, est un très gros plan de ton torse).
- `under` : `{ tx: -230, ty: -62, tz: 20, d: 460, az: -52, el: 9, fov: 28, shift: 40, side: 0, dof: 0 }` (le VIEW d'origine met la caméra dans la terre, sous la dalle).

## Pas au niveau (dit franchement)
- **Le tambour ne décélère pas** : quand `spin` baisse, le linge tombe en tas et le tremblement s'éteint, mais la paroi n'a rien qui tourne et les aubes sont fixes (un angle intégré dans le temps n'existe pas en fonction pure de `spin` et `time`).
- `VIEW.feet` : la flaque se lit par ses rides et le reflet de tes jambes (reflet ajouté après la planche 3, **pas revu**) ; son bord et le pied de la machine sont hors cadre.
- `VIEW.section` (d 900) : sous le sol, semelles et boucle trop fines ; la tranche de la dalle fait une bande claire.
- Vu d'en haut (`VIEW.reach`), le capot sous tension se lit comme une boîte orange pleine.
- Lumière du défaut agrandie (3,6 cm) après la planche 2 : **pas revue**.
- La tête de verre « flotte » au-dessus du cou (figure du kit).

## À changer ailleurs
- `src/world.js`, si (a′) est choisie : `export const POSE0 = { tx: 18, ty: 44, tz: 46, d: 270, az: -40, el: 1, fov: 46, shift: 70, side: -30, roll: 0, drift: 0, dof: 0 };` et `reach: 0.4` dans `FIRST` (et `STAGED`).
- `src/world.js` → `VIEW.reach` : `reach: { ...P, tx: 34, ty: 102, tz: 44, d: 290, az: -48, el: 12, shift: 40 },`
- `src/world.js` → `VIEW.under` : `under: { ...P, tx: -230, ty: -62, tz: 20, d: 460, az: -52, el: 9, shift: 40 },`
- `src/plan.js` (pour mémoire, rien à changer) : `YOU.rest` est du côté de ta main GAUCHE et `YOU.hover` à 11 cm au-dessus du capot ; le décor prend la main droite qui pend et une paume à 3 cm (consigne).
- `model.js` : le vert-jaune du mur (y 214), allumé veille, fait un gros halo vert dans `VIEW.wall`, jusque sous l'en-tête.

`npm run check -- 030` : passe (0 erreur ; avertissements de compilation de shader et « canvas à bord », déjà relevés par l'architecte ; contraste 65/65).

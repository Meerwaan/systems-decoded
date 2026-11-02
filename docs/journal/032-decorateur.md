# 032 · habillage (décorateur) — journal

## Lu (30/10)
recette-decorateur, regles-image, 032-decors, 032-actes (haut, première image, acte 1), world.js, plan.js, journal 032-salle, details.js (glow, wash, motes), atmo `makeMotes`, stage.js (pose → caméra, pour projeter).

## Le constat (planche avant, 8 instants : hook 0,04 / 0,6 · bar · door · crowd · chest · outflow · loop)
La première image (POSE0, de dehors) n'a pas de menace derrière toi : la foule pousse, mais rien ne dit pourquoi ; le fond de la salle est un noir sans profondeur. Ailleurs (bar, door, crowd, chest) le fond de la salle est derrière la caméra : seuls POSE0, la boucle et `outflow` le voient.

## Les touches (`src/habillage.js`, accrochées au groupe `today` de salle.js : rien en 1883, rien sur l'établi)
1. **La menace** : au fond de la salle, coin +x, au ras du sol (900, 45, 1320) — un cœur signal (130 cm, k 1,7) et sa traîne (560 cm, k 0,85). Projection de POSE0 (script `.cache/planches/032/decorateur/proj*.mjs`) : écran ≈ (275, 1245) — à gauche de tes jambes, sous la barre, hors des boutons TikTok (x > 905) et sous la ligne de la barre.
2. **Sa lumière sur le mur du fond**, montant du sol (440 × 300, k 0,14) : le fond de la salle existe là où la menace l'éclaire.
3. **Elle respire** : cœur et traîne gonflent lentement (≈ 3 s, ± 15 %), jamais un clignotement.
- Suivent : `shell` × (1 − 2·`flow`) — la menace s'efface quand la salle se vide (avant « et la salle respire ») ; `era` 0 et `shell` via le groupe `today`.
- **renderOrder 1** : à 29–31 (après les « panes » d'ordre 3 du mur), le mur de verre les cachait entièrement depuis dehors.

## Essayé et retiré
- La menace à (430, 45, 1330) : depuis POSE0 elle tombait sous les boutons TikTok (889, 1247), et derrière le mur.
- Fumée (`motes`) sous le plafond puis basse : invisible à 270 px, des points dans la colonne des boutons.
- Une flaque de la même lumière au sol : depuis la caméra basse, une ligne rouge horizontale derrière tes jambes.

## Planches (7 images lues)
`.cache/planches/032/decorateur/avant.jpg`, `apres1.jpg` (menace cachée par le mur), `apres2.jpg`, `grand.jpg` (540, zones), `apres3.jpg` (flaque : retirée), `apres-final.jpg` (hook, outflow, loop). Image 0 à 270 px : plus forte qu'avant — la lueur rouge au fond, derrière la foule, à gauche de tes jambes ; rien sur toi ni sur la barre.

## Branchement (4 lignes dans salle.js, permises par la recette)
- `import { dressSalle } from "./habillage.js";`
- `const dress = dressSalle(); today.add(dress.group);` (après `group.add(today)`)
- `update(P, time) {` → `update(P, time, px) {`
- `if (today.visible) dress.update(P, time, px);` (après `today.visible = …`)
Rien à changer dans `world.js` ni `main.js`. `npm run check -- 032` passe (1 avertissement de contraste à 24,67 s, dans l'en-tête, sans rapport).

## Pas au niveau
- Le bord bas de la lueur est la ligne du sol au fond de la salle (le mur est éclairé, le sol pas) : net, mais pas une coulée.
- La boucle : le gonflement dépend de `time`, l'image de 86,6 s n'a pas exactement l'éclat de celle de 0,04 s (écart ≤ 15 % sur une lueur) — invisible à côté de la foule qui bouge, mais à regarder sur la planche de la boucle.
- Elle ne se voit que dans POSE0, la boucle (et `toloop`) : tous les autres plans de la salle regardent ailleurs.

## À changer ailleurs
Rien d'obligatoire. Si la cause doit être dite : `sources` d'`episode.json` peut ajouter « l'image montre une lueur au fond de la salle, cause non précisée (scénario) ».

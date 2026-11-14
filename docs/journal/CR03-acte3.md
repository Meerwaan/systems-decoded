# CR03 · acte3.js — journal

Agent acte, 13/11 (vague 2). 02 LE DÉFAUT, `todefaut` 97,84 → `todepuis` 121,91. `npm run check -- CR03` passe. ≈ 32 appels. Images lues : 6 planches de 8 = **48 (budget de 26 dépassé** : les deux premières planches du plan « titane » étaient vides ou illisibles, il a fallu le refaire deux fois).

## Lu
recette-agents, recette-actes, regles-image, CR03-actes (haut + ma section + la couture d'acte2c), CR03-actes-maj (vague 2), world.js, journaux reservoir et piste (poses, sizes), acte2c.js (idiome, état rendu), direct.js (cut, path, punch, jolt, follow), reconstitution.js (feutre).

## Ce qui est monté
1. **Le réservoir en coupe, un seul `path`** (12 clés, 6 à 15° d'angle entre deux) depuis la coupe d'entrée (raccord : la lamelle rouge → la pièce qu'elle n'a pas touchée), état complet (`FIRST` + `STAGED.reservoir`, tout le réservoir à 0, `kero` 0,5).
   - « Le morceau de pneu » : la caméra descend vers le bas gauche d'où il arrive ; `hit` 0 → 1 linéaire de `defaut:morceau − 0,3` à `frappe2` ; `dent` 0,4 au contact ; punch + petit `jolt` (0,35) sur « frappe », caméra en gros plan sur la cuvette (`CLOSE`).
   - « Derrière la paroi… plein » : la caméra remonte le long de la coupe dans le kérosène ; `kero` → 1 sur « plein ».
   - « Et un liquide… presque pas » : retour au plan de la baie entière, rien ne bouge que la caméra.
   - « s'enfonce » : `dent` → 1, punch. « repoussé » : `wave` 0 → 1 de `trigger` à `cede` (+0,04), la caméra glisse vers +z avec le front.
   - « cède » : `culprit` 2, `fault` 1, `bulge` 1 en 0,25 s, punch ; « ailleurs » : `tear` 0 → 1 (power1.in, posé juste avant `topreuve`), `gush` ; la caméra descend sur le panneau (`CLOSE`) puis le suit dans sa chute ; cercle `feutre-panneau` sur `reservoir.A.panel` de `ailleurs + 0,3` à `topreuve − 0,5`.
2. **La preuve, coupe à `topreuve`** (raccord : le panneau qui tombe et se pose → le même posé sur le bitume) : `VIEW.preuve`, `lit` fs 40, `found` 1, `soot` 0, `alt` −100. Orbite ; « bombé » : au ras (el 12, caméra ≥ 1,5) — le dôme se lit très bien ; « trace » : au-dessus de la face lisse.
3. **« Le titane… », coupe à `preuve:Le − 0,12`** : téléobjectif (fov 5, d 228, az 84, el 6) derrière la lamelle, dans l'axe de la piste : la lamelle en bas à gauche, le morceau de pneu en haut à droite. `culprit` 1, `fault` 1 sur « titane » ; flèche `feutre-titane` de la lamelle vers le morceau ; punch « jamais ».
4. **« Et ça, personne ne l'avait prévu », coupe à `preuve:Et − 0,12`** (s'écarte du plan : pas de recul en hauteur, voir plus bas) : retour au panneau, au ras, de l'autre côté (az 148 → 166), le dôme contre la piste. Rend la main à `todepuis` sur le panneau : fin.js coupe du panneau au réservoir (son raccord écrit).

## Poses qui cadrent
- Réservoir (local, `W("reservoir", …)`) : arrivée du débris `[-8, 60, -46]` d 230 az −54 el 2 shift 0 ; impact `[-2, 70, -34]` d 135 az −50 el 2 CLOSE ; le liquide `[2, 84, -12]` d 200 az −64 el 9 ; le front `[4, 71, -8]` d 270 az −59 el 4 → `[2, 69, 18]` d 230 az −64 el 2 ; le panneau qui part `[-2, 64, 30]` d 155 az −68 el −4 CLOSE ; il se pose `[-16, 22, 30]` d 180 az −73 el 4.
- Piste : le panneau bombé `{ tx: FOUND.panel[0], ty: 0.2, tz: FOUND.panel[2], d: 7.5, az: -28, el: 12 }` ; lamelle + morceau `{ tx: (STRIP.at[0]+FOUND.chunk[0])/2, ty: 0.3, tz: (STRIP.at[2]+FOUND.chunk[2])/2, d: 228, az: 84, el: 6, fov: 5, shift: 180, side: -40 }` ; panneau au ras de l'autre côté `{ …panneau, ty: 0.25, d: 9.5, az: 148, el: 13 }`.

## Un cran en dessous
- **99,4–100,0** (le débris en vol) : il se lit comme trois bandes claires (défaut connu du décor) ; il bouge et arrive au bon endroit, mais ce n'est pas un « morceau de pneu » à 270 px avant le contact.
- **117,6–119,8** (« Le titane… ») : lisible (lamelle rouge, flèche, morceau), mais les deux pièces sont petites (≈ 15 % de la largeur) sur un grand aplat ambre (la flaque de lumière du kit au téléobjectif). Le panneau n'est pas dans ce cadre : à 156 unités, il serait un point.
- **« Et ça, personne ne l'avait prévu »** : le plan demandait un recul en hauteur sur les trois pièces et la piste ; essayé (121,6 s, p3) : les pièces deviennent des points et les marques blanches de la piste prennent le cadre. Remplacé par le retour au panneau (le raccord de fin.js y gagne).
- Les deux derniers réglages (`side: -40` du plan titane, `d 9,5 / shift 150` sur « trace ») sont posés sans planche de vérification (budget d'images épuisé) : à regarder à la relecture (118,9 et 116,9 s).
- 116,9 : avant le réglage, le panneau vu de dessus débordait sur les sous-titres.

## Sons (pour le monteur-son)
- 98,0 : la coupe sur le réservoir (souffle après « réservoir ? »).
- 100,1 → souffle après « l'aile » (≈ 100,9) : le choc du morceau sur l'intrados (`hit` 1, petit jolt).
- 107,0 → après « s'enfonce » : la paroi qui plie.
- 108,25 → 109,74 : le front qui traverse le kérosène (un grondement sourd qui monte, dans le souffle de « repoussé… »).
- 110,06 → après « ailleurs » : les rivets qui sautent (tear 0 → 0,2), puis le jet (`gush`) jusqu'à 111,6.
- 111,62 : coupe sur la piste (silence relatif, vent).
- 117,9 → après « titane » : la flèche au feutre (frottement de marqueur, 0,45 s).
- 119,78 : coupe sur le panneau.

## À changer ailleurs
Rien.

## Retouche du 13/11
- **99,4–100,0, le choc en plan large** (dalle ambre, coupe illisible, débris en trois bandes) → la baie entière ne garde que « Alors ce réservoir ? » (poussée lente d 400 → 375) ; **coupe à 99,28** (`CHOC` = `morceau − 0,14`, dans le souffle après « réservoir ? ») sur un gros plan de la cuvette (`[-6, 72, -44]` d 170 az −50 el 2, `CLOSE`), puis poussée vers la pose `frappe` (d 135) ; `hit` garde son départ (`morceau − 0,3`) : à < 0,17 le morceau est encore hors du cadre large, à gauche. Vérifié à 99,29 / 99,323 (coupe propre, deux images en continuité). Une planche intermédiaire (cible `[-4, 72, -40]` d 160) montrait le morceau trop tard (un bord à 99,80) : cible élargie à gauche et `hit` remis à son départ d'origine **sans planche après** (budget de 12 images atteint) — à regarder sur le brouillon à 99,6–100,0 : le morceau doit entrer en bas à gauche vers 99,6.
- **103–106, la baie en bande mince** → clés `liquide` et `comprime + 0,6` serrées : `[2, 82, -2]` d 235 az −56 el 7 → `[2, 81, -4]` d 222 az −58 el 6 (au lieu de d 330 / 310) : le réservoir centré, la cuvette à gauche, le kérosène sur toute la hauteur, le panneau à droite. Vérifié à 104,6 (essai) et 105,5.
- Rien de changé à partir de `enfonce` ; la sortie à `todepuis` est intacte. `check` passe. Images lues : 12.

# CR03 · concorde.js — journal du décor

Agent `decor`, 13/11. Le système : le Concorde entier, plein, ≈ 1:20, en argile satinée (le noir chaud).

## Lu
recette-agents, regles-image, reconstitution.md, CR03-decors (haut + ma section), plan.js, world.js, le bouchon, CR03-actes § première image, kit reconstitution.js (clay, alarm, safe, heal), build3d (box, plate, lathe), plateforme.js du CR02 (makePuffs, glowTexture, le feu).

## Choix de forme (avant la première planche)
- **L'aile** : générée (pas un extrudé plat) — ogive en S par une Catmull-Rom (x, z) : bande d'attaque très flèchée au pied (≈ 80°), ≈ 58° au milieu, la courbe qui se referme sur la pointe ; bord de fuite droit (116 → 113). Profil biconvexe mince (3 % de la corde), intrados presque plat, **anhédre** (pointes 2,6 plus bas). Contour tracé en `fatLine` (bord d'attaque, pointe, bord de fuite) + lignes des élevons (trois par côté) dessus et dessous.
  - La surface (≈ 1,4× le vrai 358 m²) vient de la corde d'emplanture du plan (168) : gardée pour les ancres (`TANK5`, `ENGINES.inlet` 20 juste derrière le bord d'attaque à z 22–38).
- **Fuselage** : tour elliptique (7,2 × 8,3), nez effilé ; **la pointe avant (32 de long) basculée de 5°** autour d'une charnière basse à x −140 ; pare-brise sombre ; dérive en flèche, gouverne tracée.
- **Nacelles** : deux par côté, chacune faite de parois (intérieure, cloison, extérieure, deux portes de fond) → `cutaway` : la paroi extérieure gauche s'ouvre vers le haut, les deux portes de fond basculent ; dedans, deux corps de moteur (tour à paliers) et les faces de compresseur (16 aubes vrillées + disque de flou).
- **Rotation des aubes** sans état : θ = 14·(1 − n²) + 9·t·lisse(0,45 ; 0,75 ; n) — à n fixe elles tournent (floues), quand n descend elles ralentissent et s'arrêtent sans jamais repartir en arrière tant que la chute de n est franche.
- **Le feu, le kérosène** : des « traînées » (tube additif ou non, bruit qui défile, trous, ondulation qui avance) **mises à niveau** dans le monde (pivot qui annule tangage et roulis : la traînée reste horizontale derrière l'avion), plus des bouffées (fumée brun-noir, flammes) et une lumière rouge qui éclaire l'intrados et le sol.

## Planches (dossier `.cache/planches/CR03/concorde/`, script `poses.mjs` = la loi d'`onPlane` + l'état de base ; specsN.json → essaisN.json)
- p1 (8) : les poses de `VIEW` telles quelles. La silhouette tient (nez basculé, dérive, delta bas, train long) ; le feu n'était qu'une boule rose à la racine → refait. `dessous` et `moteurs` mal cadrés.
- p2 (4) : vues de contrôle. Dessous : l'ogive en cloche, les réservoirs verts (`ok` 1), les nacelles ; dessus : l'aile claire en « verre à pied ». L'aile est juste.
- p3 (3), p4 (6), p5 (5), p6 (4) : réglage du feu (racine rouge et non blanche : `C_HOT` retiré du cœur, lueur et lumière baissées — la `PointLight` à 1 900 brûlait l'intrados en blanc ; à 420, posée 30 derrière la racine), lanières du pneu (rubans verticaux au-dessus du pneu, ils battent), le morceau (d'abord noir sur l'intrados noir, invisible → il porte la matière du pneu 2 : rouge avec lui), plus d'ombre reçue sous l'aile (seuls fuselage, aile et dérive reçoivent : le train et les moteurs se lisent).
- 30 images lues : budget épuisé.

## Ce qui marche (vu)
- **Arrière 3/4 large, la traînée qui s'étire** (la meilleure image du feu) : `{ "tx": -10239.2, "ty": 22.9, "tz": 0, "d": 1300, "az": 48, "el": 5, "fov": 30, "shift": 20 }`, état `FIRST` — l'avion entier, le feu rouge long derrière l'aile gauche. Candidate de première image à tirer (silhouette reconnue + menace derrière + mouvement du sujet).
- **Le pneu 2** (`burst` 1, `chunk` 0,5, culprit 3) : `{ "tx": -8927, "ty": 8, "tz": 17.5, "d": 80, "az": -118, "el": -2, "fov": 30, "shift": 40 }` — le pneu rouge, ses lanières, le morceau rouge en vol sous l'intrados.
- **Le train gauche** (culprit 5) : `VIEW.train` lit la jambe rouge, mais le feu (`fire` 1) la noie à moitié : y baisser `fire` ou s'éloigner.
- **Dessous** (`ok` 1) : les réservoirs verts se lisent ; `VIEW.dessous` coupe l'avion au bord droit (pose de bouchon) ; viser plus près du milieu de l'aile (point local ≈ [20, 18, 0]) — non vérifié.

## Ce qui n'est pas au niveau (dit franchement)
- **`VIEW.moteurs` / la coupe des nacelles** : la paroi extérieure monte, les portes de fond tombent, les deux corps de moteur sont là, mais aucune des trois poses essayées (`az` −32 `el` −12 `d` 180 ; −55 / −32 / 120 ; −20 / −55 / 210) ne montre « deux moteurs côte à côte » à 270 px : le cadre est trop serré et la nacelle traverse l'image en biais. Piste : de profil gauche et un peu dessous (`az` ≈ 0 à 15, `el` ≈ −20, `d` ≈ 140, visée locale [70, 12, 30]) pour voir le corps du moteur 1 sur toute sa longueur et sa face ; ou une retouche (faire glisser la paroi au lieu de la basculer).
- **Le feu vu de face** (candidate b) : la traînée part derrière l'avion et se cache derrière le fuselage ; de face, on lit une lueur rouge sous l'aile plus qu'une traînée. Le feu se lit de profil et de trois quarts arrière.
- **La goutte de 1979** (`leak` 0,08) : un fil pâle de 40 de long sous le trou ; à `VIEW.dessous` (d 800) il fait ≈ 2 px : invisible. Pour la voir : un plan serré sous le réservoir 5 (d ≈ 120).

## À changer ailleurs
- `world.js` → `VIEW` : ajouter la pose vue `arriere: pose(onPlane(AT.first, [60, 25, 0]), { d: 1300, az: 48, el: 5, fov: 30, shift: 20 }),` (le feu dans toute sa longueur) et la proposer sur la planche de la première image.
- `world.js` → `VIEW.pneu` : viser `[STRIP.at[0] - 3, 8, STRIP.at[2]]` au lieu de `[STRIP.at[0], 4, STRIP.at[2]]` et `d: 80` (le morceau en vol entre dans le cadre).

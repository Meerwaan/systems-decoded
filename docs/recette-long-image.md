# L'image d'un long : la miniature, le plateau, les décors

Écrite le 2026-10-21 (passe « scale » des longs, agent 2), sur les miniatures et les films L01 (le pare-brise) et L02 (le poste haute tension). À lire avec `docs/recette-long.md` (la chaîne, les transitions, le titre) et CLAUDE.md, « Le format long ». Le rapport qui la justifie : `docs/scale/long-2-rendu-miniatures.md`.

## 1. La miniature (70 à 99 % du travail)

### Où on la juge : à 160 px, dans le contexte de YouTube

Une miniature se juge comme le spectateur la voit d'abord : **160 px de large dans la colonne « à suivre »**, le titre à droite, la durée en bas à droite, en thème sombre (#0f0f0f) ET en thème clair ; puis à 360 px dans le fil du téléphone. Jamais en plein écran.

```
node scripts/cover.mjs L03 --thumbs essais.json --out <dossier temporaire> --gpu
```

`essais.json` : une liste de miniatures (`{ "name", "at", "cam", "state", "title", "tone", "tag", … }`, les mêmes champs que `thumb` dans `episode.json`). Le script les dessine toutes (≈ 1,3 s chacune sur la carte graphique) et écrit `planche-160.png` : chaque miniature à 160 px dans les deux thèmes, avec le titre de la vidéo (`post.youtube.title`, ou `videoTitle` par miniature pour essayer un autre titre) et le badge de durée, puis à 360 px. **Une seule image à lire par série d'essais.** Le rendu final se fait sans `--gpu` (logiciel, comme le film : ≈ 15 s par miniature), puis on copie les PNG dans `renders/` sous leur nom. `node scripts/cover.mjs L03 --sheet --out <dossier>` fait la même planche pour les miniatures déjà dans `renders/`.

Pour trouver la pose d'un instant du film : la planche `npm run look -- L03 --at … --bare` (12 instants), puis la pose exacte que le film y tient (le `stage.cam` de cet instant) sert de base, qu'on rapproche (`d`), décale (`side` : négatif pousse le sujet à droite), incline (`roll` −4 à −8).

### Les règles (tirées des essais du 21/10)

1. **La promesse est payée dans les 30 premières secondes.** L'image ou les mots de la miniature doivent se retrouver dans l'accroche, la promesse ou le défi. Une miniature sur un instant de 3:34 (la nacelle du L02) attire un spectateur qui part avant d'y arriver. On cherche la miniature dans la planche des 40 premières secondes AVANT le reste du film.
2. **Elle complète le titre, elle ne le répète pas.** Le titre raconte (le paradoxe, l'enjeu) ; la miniature ajoute un chiffre, une question, un fait (« 400 000 VOLTS » sous « Le détecteur dit « rien »… » ; « IL DOIT CASSER » sous « Moins d'1 mm entre ta tête et la route »). « COUPÉE ET MORTELLE » sous « Coupée, mais encore mortelle » était une place perdue.
3. **Un objet plein, éclairé, sur 40 % de la hauteur au moins, coupé par le bord du cadre** — jamais 20 % au milieu du noir. Il se lit à 160 px par sa forme (la tête et sa toile d'araignée, l'arc dans sa chambre, le pare-brise en trois couches).
4. **Une grande surface de couleur franche** quand le film en a une (le ruban de verre orange : la seule miniature qui ressort autant dans le thème sombre que dans le clair). Une miniature presque noire disparaît dans le fil sombre de YouTube : son bord gauche se fond dans le #0f0f0f.
5. **Deux ou trois mots, ≈ 25 px de haut à 160 px** (300 px sur 1080) ; la dernière ligne dans le ton (signal = la menace, veille = ce qui sauve, ou la couleur qui contraste le plus avec l'objet : veille sur l'orange). Un chiffre ou une question tient bien (« 400 000 VOLTS », « LAQUELLE EST COUPÉE ? »). Chaque mot est vrai dans le film.
6. **Le coin bas droit est à YouTube** : à 160 px, le badge de durée couvre ≈ 25 % de la largeur et de la hauteur. Rien d'important dans le quart bas droit (`cover` prévient si les mots y tombent).
7. **Pas de personnage de verre, pas de décor aux rayons X seul** : à 160 px, un personnage de verre est un fantôme gris (essayé quatre fois le 21/10 : l'arc qui vient chercher le technicien, le monteur sur le portique, la vitre de côté, la tête dans le pare-brise). Ce qui dit « quelqu'un » à cette taille : un casque blanc, plein. Un vrai visage n'est pas dans notre DA.
8. **Un repère pour le petit détail** : quand la clé de l'image est petite (la tête du détecteur posée sur le câble), un anneau de la maison autour (`ring`), dans le ton.
9. **Trois miniatures = trois promesses différentes** (le paradoxe, l'origine, la protection), pas trois cadrages d'une même idée. S'il n'y a que deux bonnes promesses dans les 30 premières secondes, on teste à deux : YouTube l'accepte, et le test converge plus vite.
10. **Plus de contraste que le film** : `grade: { contrast: 1.32 à 1.45, saturation: 1.15 à 1.2 }` ; `gel` + `gelAmount` (une couleur qui multiplie : le noir reste noir) pour teinter une scène grise. Moins de 2 Mo (`cover` prévient).

Les options du plateau n'aident pas une miniature : `dof` et `air` ne changent rien de visible à 160 px (essayé sur la tête et sur l'arc) ; `cover` pose `dof: 0`.

### Les réglages de `cover` pour un long (dans `thumb`, ou dans `essais.json`)

| réglage | ce qu'il fait |
| --- | --- |
| `at`, `cam`, `state`, `grade` | l'instant, la pose (complète de préférence), les nombres de l'état tenus, l'étalonnage (`gel` en couleur, `gelAmount`) |
| `title`, `tone`, `tones` | les lignes ; la couleur de la dernière ; ou une couleur par ligne (`["ink", "signal"]`) |
| `tag`, `tagStyle: "solid"`, `tagSize` | le cartouche-fait ; plein dans le ton, lettres sombres : à 160 px il se lit comme un bloc de couleur, à 360 px ses mots se lisent |
| `size`, `width`, `top` | la taille des mots (300 ; 330 à 380 pour un mot ou un nombre seul), la largeur qu'ils peuvent prendre, leur hauteur (% ) |
| `side: "right"`, `shade`, `reach`, `vignette` | les mots à droite (l'objet à gauche) ; l'ombre derrière les mots (0 à 1) et où elle s'arrête (%) ; le noir des coins |
| `ring: { x, y, r }` | l'anneau et ses quatre traits autour de ce que l'œil doit trouver (px du cadre 1920 × 1080) |
| `kit` | les options du plateau pour cette image seule (`dof`, `air`, `finish`…) — inutiles en miniature |

Sans aucun de ces réglages nouveaux, une miniature sort à l'octet près comme avant (vérifié sur `L01 --alt 2`).

## 2. Le plateau d'un long (grand écran)

Le modèle (`kit/template-long/src/world.js`) porte la ligne : `LOOK = { dof: 5, air: 0, finish: 0 }`, `CLOSE = { dof: LOOK.dof }`, `SHARP = { dof: 0 }`.

- **`dof` 5, l'optique, sur les plans rapprochés et moyens seulement** (`...CLOSE` dans leur pose) : le sujet net, les machines aux rayons X derrière lui adoucies. Mesuré sur L02 (le coffret et son cadenas, le détecteur au bout de la perche) : le sujet se détache, et pendant que la caméra bouge, le scintillement des traits fins du fond baisse de 21 à 31 % (contrôle de `qa` sur 90 images de chaque plan), aucune image parasite. **Jamais au-dessus de 6** : à 8, sur un grand écran, les traits fins du fond se dédoublent (les seize instants de l'obturateur se voient). Peu d'effet quand le fond est près du sujet (l'établi, le four du L01) : on ne le cherche pas là.
- **Jamais d'optique** (`...SHARP`) sur un plan large, un éclaté, un document, la première image, ni sous une carte de chapitre : ils se lisent d'un bord à l'autre.
- **Chaque pose dit son optique** (`...CLOSE` ou `...SHARP`) : `cut` ne la remet pas à zéro tout seul, et un mouvement garde celle du plan d'avant.
- **`finish` 0** : sur les isolateurs de porcelaine éclairés du L02, le grain d'usinage fait des taches. À 1 seulement pour une pièce de métal usinée filmée de près, et alors le décor marque chaque grande surface lisse `material.userData.finish = false`.
- **`air` 0** : aucun gain vu sur les essais.
- Coût : nul à la mesure (logiciel : 112 ms par image sans, 114 avec ; la passe d'accumulation existait déjà).
- Avant / après d'un plan : `SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look …` pour l'avant ; `"kit": { "dof": 5 }` sur une image de `essais.json` pour l'après.

## 3. Ce que les agents de décors d'un long font pour l'image

- **Les miniatures se préparent avec les décors** : chaque décor qui porte une promesse des 30 premières secondes dit, dans son journal, la pose où son objet plein remplit 40 % de la hauteur, éclairé (la pose de la miniature), et l'état à tenir (`state`) pour qu'il le soit.
- **Un objet plein par lieu, qu'on peut filmer de près** : la miniature et le plan rapproché ont besoin d'une pièce solide (la tête d'essai, la chambre de coupure, la pince de terre), pas seulement de traits aux rayons X.
- **Une grande couleur franche quand le procédé en a une** (le verre en fusion, l'arc) : c'est elle qui fait ressortir la miniature dans le fil.
- **Des fonds qui gagnent à l'optique** : derrière l'objet d'un plan rapproché, de la profondeur (des machines à deux ou trois fois la distance du sujet), pas un mur collé.
- `finish` : rien à faire tant que le film ne l'allume pas ; s'il l'allume, `userData.finish = false` sur la porcelaine, la peinture, les grandes tôles.
- Chaque pose rendue au contrat (`VIEW`, `docs/<ep>-actes.md`) écrit son optique (`...CLOSE` / `...SHARP`).

# Agent 2 (longs) — rendu, design, décors et miniatures (2026-10-21)

Demande de Merwan, après la passe des courts : « maintenant je veux que tu fasses pareil avec des agents pour les formats longs ». Ma part : des miniatures qui font cliquer, et une image de long qui ait l'air d'un vrai film sur un grand écran. Consignes en cours de route (celui qui orchestre, d'après l'agent 1) : **une miniature dont la promesse n'est payée qu'après les 30 premières secondes sort du test** (la nacelle du L02, à 3:34), et les titres principaux changent — L01 « Moins d'1 mm entre ta tête et la route : comment on fabrique le verre de ton pare-brise », L02 « Le détecteur dit « rien »… et la ligne peut encore te tuer : la consignation haute tension » : les miniatures ne doivent pas les redire.

## En bref

- **Cinq nouvelles miniatures**, dans `renders/` (1280 × 720, 0,66 à 0,96 Mo) : L01 `-miniature-v2-1` « IL DOIT CASSER », `-v2-2` « C'ÉTAIT DU SABLE », `-v2-3` « CE FILM TE RETIENT » ; L02 `-miniature-v2-1` « 400 000 VOLTS », `-v2-2` « LAQUELLE EST COUPÉE ? ». Chacune est payée dans les 30 premières secondes du film et complète le titre au lieu de le répéter. **Le L02 se teste à deux** : aucune troisième image des 30 premières secondes ne tient à 160 px (quatre essais), l'arc à 20 000 °C (2:20) et la nacelle (3:34) arrivent trop tard.
- **`scripts/cover.mjs`** sait maintenant essayer des miniatures sans toucher `episode.json`, plusieurs à la fois, et écrit la planche qui les juge comme YouTube les montre (160 px, titre, badge de durée, thème sombre et clair, puis 360 px). Nouveaux réglages : mots à droite, taille, ombre, cartouche plein, anneau-repère, `gel` en couleur, contrôles (mots sous la durée, plus de 2 Mo). Sans eux, une ancienne miniature sort à l'octet près comme avant.
- **Le plateau d'un long** : `dof` 5 sur les plans rapprochés et moyens, dans le modèle (`kit/template-long/src/world.js`, `main.js`) ; `finish` et `air` éteints. Sur L02, l'optique détache le sujet et fait baisser de 21 à 31 % le scintillement des traits fins du fond en mouvement, sans image parasite, pour un coût nul.
- **`docs/recette-long-image.md`** : la miniature (règles, contrôle à 160 px, fabrication), le plateau d'un long, ce que les décors d'un long doivent préparer.

## 1. Les miniatures

### Les anciennes, jugées à 160 px

Planche : `…\scratchpad\long2\old.png` (les six, dans la colonne « à suivre » en thème sombre et clair, et à 360 px).

- **Les mots se lisent** (300 px sur 1080 : ≈ 25 px à 160 px de large). C'est le seul point fort commun.
- **L'objet est trop petit et trop sombre** : 20 à 30 % de la hauteur, au milieu du noir. La tête d'essai du L01 n°1 est un petit pot rouge et noir ; la bille du n°2 une boule noire sans contexte ; le L02 n°2 (« 5 GESTES ») des traits verts fins sur du noir : rien à voir à 160 px.
- **La bande noire derrière les mots** (45 % gauche) se fond dans le thème sombre de YouTube (#0f0f0f) : la miniature perd son bord gauche et paraît plus petite.
- **Le cartouche** (contour, 44 px) disparaît à 160 px.
- **L02 n°1 redisait le titre d'alors** mot pour mot (« COUPÉE ET MORTELLE » sous « Coupée, mais encore mortelle ») ; **L02 n°3** (la nacelle) promet un instant de 3:34.
- La meilleure des six : L01 n°3 (« PAS FAIT POUR TENIR »), parce que l'étoile de fissures se reconnaît à toute taille.

### Ce qui fait cliquer, d'après les essais (≈ 40 miniatures, 9 planches)

1. **Une grande surface de couleur franche** : le ruban de verre en fusion est la seule miniature qui ressort autant dans le thème sombre que dans le clair.
2. **L'objet plein sur 40 % de la hauteur au moins**, coupé par le bord du cadre, éclairé (la tête d'essai à `d` 78 au lieu de 130, son liseré orange `mood: 1`, la toile tenue par le film en vert `stick: 1`).
3. **Des mots qui ajoutent au titre** : un chiffre (« 400 000 VOLTS »), une question (« LAQUELLE EST COUPÉE ? »), un paradoxe (« IL DOIT CASSER »).
4. **Un repère** quand la clé est petite : l'anneau autour de la tête du détecteur posée sur le câble.
5. **Une main ou un visage ?** Non : un personnage de verre est un fantôme gris à 160 px (essayé quatre fois : l'arc qui vient chercher le technicien, le monteur sur le portique, la vitre de côté, ta tête dans le pare-brise). Ce qui dit « quelqu'un » à cette taille, c'est un casque blanc, plein. Un vrai visage n'est pas dans notre DA.
6. **Les options du plateau n'y font rien** : `dof` 8 sur le ruban, `air` orange sur la tête et sur l'arc — aucune différence visible.

### Les nouvelles

Planche finale : `…\scratchpad\long2\v2-planche-160.png` ; avant / après : `avant-apres.png`.

| fichier | image (payée à) | mots | cartouche | pourquoi |
| --- | --- | --- | --- | --- |
| `L01-pare-brise-miniature-v2-1.png` | la tête de 10 kg enfoncée, la toile d'araignée verte et blanche, le bord du pare-brise (0:02 « Il casse… exactement comme prévu », 0:20 le défi, 0:24 la tête au-dessus du pare-brise) | IL DOIT / CASSER | TÊTE DE 10 KG | le paradoxe du film ; la tête trois fois plus grande que sur l'ancienne |
| `L01-pare-brise-miniature-v2-2.png` | le ruban de verre orange sur l'étain (0:05 « Il est fait de sable », 0:20 le sable ; le titre promet la fabrication du verre) | C'ÉTAIT / DU SABLE | VERRE À 1 100 °C | l'origine ; la miniature qui ressort le plus dans le fil |
| `L01-pare-brise-miniature-v2-3.png` | le pare-brise en trois couches, le film vert entre les deux verres (0:30, « Un verre. Un film. Un deuxième verre. ») | CE FILM / TE RETIENT | VERRE · FILM · VERRE | la protection : ce que fait le « moins d'1 mm » du titre (0:08 « va t'empêcher de passer au travers ») |
| `L02-poste-haute-tension-miniature-v2-1.png` | le détecteur posé sur ta ligne, la voisine en orange, l'anneau sur sa tête (la première image du film) | 400 000 / VOLTS | LIGNE COUPÉE | l'enjeu chiffré, que le titre ne donne pas |
| `L02-poste-haute-tension-miniature-v2-2.png` | ta ligne (blanche) et sa voisine (orange) sur le même portique (0:28 « sa voisine reste sous tension ») | LAQUELLE / EST COUPÉE ? | 400 000 V · MÊMES PYLÔNES | une question à laquelle le spectateur répond en regardant |

Écartées en route : « TU PERDS LA ROUTE » (le pare-brise trempé blanc devant le volant, payé à 6:30), « RIEN. » (redit le nouveau titre du L02), « UN ARC À 20 000 °C » (2:20) et « SOUS TENSION » (la nacelle, 3:34), « IL VIENT TE CHERCHER », « JUSTE À CÔTÉ / SOUS TENSION », « LE MAUVAIS ORDRE », « LE DERNIER GESTE », « 5 GESTES », « ET TA VITRE DE CÔTÉ ? » (images illisibles à 160 px : personnages de verre, petite pince, sol), « RIEN NE PASSE » sur ta tête dans le pare-brise vert (forte, mais un personnage de verre en vedette : la règle du 16/10 l'interdit).

Pour les refaire (`node scripts/cover.mjs <ep> --thumbs <fichier> --out <dossier>`) — ce sont aussi des `thumb` valides si on veut les inscrire dans `episode.json` :

```json
[{"name":"L01-pare-brise-miniature-v2-1","at":"surprise:casser+0.5","state":{"stick":1,"web":1,"rings":1,"mood":1},"cam":{"tx":11850,"ty":100,"tz":0,"d":78,"az":-30,"el":40,"fov":28,"shift":40,"side":-450,"roll":-6},"title":["IL DOIT","CASSER"],"tone":"signal","tag":"Tête de 10 kg","tagStyle":"solid","grade":{"contrast":1.45,"saturation":1.2}},
 {"name":"L01-pare-brise-miniature-v2-2","at":"ruban+2","cam":{"tx":1441.5,"ty":90,"tz":0,"d":900,"az":-80,"el":40,"fov":28,"shift":0,"side":-380,"roll":0},"title":["C'ÉTAIT","DU SABLE"],"tone":"veille","tag":"Verre à 1 100 °C","tagStyle":"solid","grade":{"contrast":1.32,"saturation":1.15}},
 {"name":"L01-pare-brise-miniature-v2-3","at":33,"cam":{"tx":4.7,"ty":46.9,"tz":-15.8,"d":250,"az":-66.8,"el":12.8,"fov":30,"shift":0,"side":-440,"roll":0},"title":["CE FILM","TE RETIENT"],"tone":"veille","tag":"Verre · film · verre","tagStyle":"solid","grade":{"contrast":1.32,"saturation":1.15}}]
```

```json
[{"name":"L02-poste-haute-tension-miniature-v2-1","at":"vat3:mort","cam":{"tx":300,"ty":1046,"tz":-600,"d":110,"az":17.2,"el":-3,"fov":34,"shift":0,"side":-470,"roll":0},"state":{"induced":1},"ring":{"x":1445,"y":300,"r":120},"title":["400 000","VOLTS"],"tone":"signal","tag":"Ligne coupée","tagStyle":"solid","size":330,"grade":{"contrast":1.32,"saturation":1.15}},
 {"name":"L02-poste-haute-tension-miniature-v2-2","at":32,"cam":{"tx":-73.9,"ty":1595.3,"tz":-2381.2,"d":2500,"az":-26.1,"el":6,"fov":28,"shift":0,"side":-380,"roll":0},"title":["LAQUELLE","EST COUPÉE ?"],"tone":"signal","tag":"400 000 V · mêmes pylônes","tagStyle":"solid","grade":{"contrast":1.32,"saturation":1.15}}]
```

Exactitude : « 400 000 VOLTS » est la tension de la ligne (l'accroche) ; l'image est celle où le détecteur touche TA ligne coupée (blanche), la voisine sous tension en orange — c'est le plan du film. « LAQUELLE EST COUPÉE ? » : réponse à 0:28-0:36 (l'orange est la voisine). « C'ÉTAIT DU SABLE » : « Il est fait de sable », « Du sable fondu » ; le ruban est à 1 100 °C à l'entrée du bain (« Il entre vers 1100 °C »). « CE FILM TE RETIENT » : « un film de moins d'un millimètre va t'empêcher de passer au travers ».

## 2. `scripts/cover.mjs`

- `cover(dir, { alt, out, thumb, gpu })` : `thumb` remplace la miniature d'`episode.json` (les épisodes en ligne ne sont pas touchés), `gpu` dessine sur la carte graphique pour les essais.
- `covers(dir, { list, outDir, gpu })` : plusieurs miniatures sur la même page chargée (≈ 1,3 s chacune sur la carte, ≈ 15 s en logiciel), puis `thumbSheet` : la planche « à suivre » (160 px, titre, badge de durée, thème sombre et clair) et le fil (360 px). Une image à lire par série.
- Lancé directement : `node scripts/cover.mjs <ep> --thumbs essais.json --out <dossier> [--gpu] [--no-sheet]`, `--sheet` (la planche des miniatures déjà dans `renders/`), ou comme avant `--alt N --out <fichier>`.
- Réglages d'un long (tous optionnels) : `side: "right"`, `size`, `width`, `top`, `shade`, `reach`, `vignette`, `tagStyle: "solid"`, `tagSize`, `tones`, `ring: { x, y, r }`, `kit` (options du plateau pour cette image), `grade.gel` en couleur avec `gelAmount` (avant, une couleur passée dans `grade` remplaçait l'objet couleur du plateau). Un deuxième passage sur la même page remet l'étalonnage, l'état tenu et les mots d'avant.
- Contrôles : les mots qui tombent sous le badge de durée (quart bas droit), plus de 2 Mo (YouTube refuse).
- **Preuve que rien ne change sans eux** : `L01 --alt 2` rendu par la version du dernier commit (copiée hors du dépôt, sortie redirigée) et par la nouvelle : PSNR infini, écart maximal 0. Deux rendus logiciels d'une même v2 : identiques au pixel (déterministe).

## 3. Le plateau d'un long

Essayé sans toucher les sources, par `look` (`"kit"` par image, `SD_KIT` pour la page) :

- **L01** (`opt-l01.jpg` : le tampon, le bombage, la bille, la tête ; avant / `dof` 8 + `finish` 1) : presque rien de visible à 780 px — les gros plans du L01 sont pris à 100-150 cm d'un objet dont le fond est proche (l'établi, la tour d'essai).
- **L02** (`opt-l02.jpg`, détail à l'échelle 1 : `opt-l02-crops.jpg`, `opt-dof-crops.jpg`) : sur le coffret et son cadenas, et sur le détecteur au bout de la perche, l'optique adoucit les portiques aux rayons X du fond et détache le sujet — un vrai gain sur un grand écran. **À 8, les traits fins du fond se dédoublent** (on voit les seize instants de l'obturateur) ; **à 5, non**. `finish` 1 fait des **taches** sur les isolateurs de porcelaine éclairés de la chambre de coupure (le grain de « main » est à l'échelle d'une petite pièce, pas d'un isolateur d'un mètre).
- **Scintillement** (`seq.mjs` : 90 images consécutives rendues, encodées, passées au contrôle `flicker` de `qa`) : coffret, avant → `dof` 5 : aucune image parasite dans les deux, scintillement moyen 2,34 → 1,62 (−31 %) ; détecteur : aucune image parasite, 11,04 → 8,76 (−21 %). `finish` 1 n'y change rien.
- **Coût** : rendu logiciel (SwiftShader), médiane 112 ms par image sans, 114 ms avec `dof` 6 + `finish` 1 (+2 %, dans le bruit) ; carte graphique : 33 à 51 ms dans les deux cas.
- **`air`** : aucun gain visible (miniatures de la tête et de l'arc) ; pas essayé plus loin, comme sur les courts.

**Ce qui entre dans le modèle** (`kit/template-long/src/world.js`, `main.js`) : `LOOK = { dof: 5, air: 0, finish: 0, ...SD_KIT }`, `CLOSE = { dof: LOOK.dof }` et `SHARP = { dof: 0 }` exportés pour les chapitres, `POSE0` net ; le plateau reçoit `air` et `finish`, jamais `dof` (c'est un nombre de pose : un plan large qui oublierait de le dire reste net au premier plan du film). Vérifié : le modèle instancié dans un dossier ignoré par git (`.cache/`, supprimé ensuite) passe `check` — 0 erreur, 37/37 contrastes, les mêmes trois avertissements que le modèle du dernier commit (notes du compilateur de shaders, et la dernière image du chapitre-bouchon qui n'est pas la première).

**Pas changé** : `kit/lib/stage.js` (rien à prouver sur le 025), `kit/lib/finish.js`, `kit/lib/usine.js`, `kit/lib/postes.js` — les machines du kit d'usine sont aux rayons X (verre) : ni l'optique ni la matière ne les concernent ; ce que les décors doivent préparer est écrit dans la recette.

## 4. Ce que Merwan tranche (oui / non)

1. **L01 : les trois v2** (« IL DOIT CASSER », « C'ÉTAIT DU SABLE », « CE FILM TE RETIENT ») remplacent les trois miniatures du test YouTube — oui / non.
2. **L02 : les deux v2** (« 400 000 VOLTS », « LAQUELLE EST COUPÉE ? ») remplacent les trois du test, qui tourne alors à deux — oui / non.
3. **À partir du L03** : l'optique (`dof` 5) sur les plans rapprochés et moyens des longs, rien sur les plans larges — oui / non.

## 5. À changer ailleurs (pas mes fichiers)

- `scripts/sd.mjs`, `case "cover"` : passer `out: flags.out ? path.resolve(String(flags.out)) : null` et `gpu: !!flags.gpu` à `cover()`, pour que `npm run cover -- L03 --alt 2 --out …` marche (en attendant : `node scripts/cover.mjs`).
- `kit/lib/direct.js`, l. 130 (`cut`) : compléter la pose avec `dof: 0` (`{ roll: 0, side: 0, fov: 28, drift: 0.3, dof: 0, ...pose }`), pour qu'une coupe n'hérite jamais du flou du plan d'avant. Sans effet sur le 025 (toutes ses poses disent leur optique) ni sur un film sans optique.
- `docs/recette-long.md`, « La miniature » : renvoyer à `docs/recette-long-image.md` (la règle des 30 secondes, la planche à 160 px, pas de personnage de verre).
- `episodes/L01…`, `L02…/episode.json` : rien d'obligatoire ; si Merwan dit oui, les réglages ci-dessus peuvent y entrer en `thumb` / `thumb2` / `thumb3` (les anciens réglages y sont encore).

## 6. Pour CLAUDE.md (à intégrer par celui qui orchestre)

Dans « Le format long (YouTube) », après le paragraphe sur la miniature et les titres :

> **L'image d'un long et ses miniatures** (21/10, `docs/recette-long-image.md`) — une miniature se juge à 160 px dans la colonne « à suivre » de YouTube, titre à droite et badge de durée par-dessus, en thème sombre et clair : `node scripts/cover.mjs <ep> --thumbs essais.json --out <dossier> --gpu` dessine les essais et cette planche en quelques secondes. Ses règles : la promesse est payée dans les 30 premières secondes ; elle complète le titre sans le répéter (un chiffre, une question, un paradoxe) ; un objet plein sur 40 % de la hauteur, coupé par le bord ; une grande couleur franche si le film en a une ; jamais un personnage de verre (un fantôme à 160 px ; un casque blanc dit « quelqu'un ») ; rien dans le quart bas droit (la durée) ; un anneau (`ring`) quand la clé est petite ; trois promesses différentes, ou deux s'il n'y en a que deux de bonnes. Nouvelles miniatures du 21/10 : L01 « IL DOIT CASSER », « C'ÉTAIT DU SABLE », « CE FILM TE RETIENT » ; L02 « 400 000 VOLTS », « LAQUELLE EST COUPÉE ? » (`renders/<dossier>-miniature-v2-<n>.png`). Le plateau d'un long : `dof` 5 sur les plans rapprochés et moyens (`...CLOSE`, jamais au-dessus de 6 : les traits fins du fond se dédoublent ; sur L02, −21 à −31 % de scintillement en mouvement, coût nul), net partout ailleurs (`...SHARP`) ; `finish` et `air` éteints (la matière tache la porcelaine éclairée).

## 7. Les preuves (dossier temporaire de la session, `…\4c4ece79-…\scratchpad\long2\`)

`old.png` (les six anciennes à 160 px) · `l01-a.jpg`, `l02-a.jpg` (les instants forts des deux films) · `l01-debut.jpg`, `l02-debut.jpg` (les 40 premières secondes) · `l01-t1` à `l01-t7`, `l02-t1` à `l02-t7` (chaque série d'essais et sa `planche-160.png`) · `v2-planche-160.png` (les cinq retenues) · `avant-apres.png` · `finals-2x2.jpg` (pleine taille) · `opt-l01.jpg`, `opt-l02.jpg`, `opt-l02-crops.jpg`, `opt-dof-crops.jpg` (le plateau) · `time-off.jpg`, `time-on.jpg` (le coût) · `seq.mjs`, `probe.mjs` (scintillement d'un plan, pose du film à un instant).

Images lues : 25 sur 40. Temps : ≈ 2 h 50 (dont ≈ 25 min pour la consigne des 30 secondes et des nouveaux titres, arrivée en fin de travail). Aucun sous-agent.

## 8. Pas fait, et pourquoi

- **Une troisième miniature du L02** : quatre essais sur les 30 premières secondes (le monteur qui grimpe, la pince de 1987, l'équipement de terre, le poste en plan large) — illisibles à 160 px. Si une image de ces secondes doit porter une troisième promesse, il faudra un plan pensé pour elle dès la mise en scène (consigne dans la recette).
- **Un rendu de plan avec `qa`** : pas de rendu d'un long (consigne) ; le scintillement a été contrôlé sur deux séquences de 90 images avec l'outil de `qa`, pas sur un MP4 du film.
- **L'optique sur le L01** : sans effet visible sur ses plans (fond proche) ; il n'y a rien à en tirer pour lui.

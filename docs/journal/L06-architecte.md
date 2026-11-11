# L06 · l'architecte — journal

2026-11-10. Rôle : contrat, bouchons des décors, chapitres vides, page, repères, sons, plan de mise en scène sur la vraie voix (708,3 s, 131 phrases, 13 chapitres, affaire réelle : le blackout européen du 4 novembre 2006). Aucun sous-agent. **22 images lues** (deux planches de 8 sur bouchons, la planche des six candidates avec l'en-tête). `npm run check -- L06` passe (40/40 contrastes).

## Ce qui est fait

- **`src/plan.js`** (sans import) : quatre lieux, quatre échelles, axes et azimut vérifiés sur planche (az 0 = caméra côté +z regardant −z ; az −90 = caméra côté −x regardant +x). `DAY` (les heures du rapport UCTE), `FREQ` (les seules fréquences permises), `geo(lon, lat)` et `MAP` (la maquette : 1 km = 0,2 cm, est +x, nord −z, couches de l'éclaté, dérive des plaques), `PLACE` (villes et nœuds de l'histoire), `MAIN_RIVER`, `SPLIT` (les trois tronçons de la cassure) et `PLATE`, `DIAL_AT` ; `EMS`, `HALL`, `SHIP`, `WINDFARM` (l'Ems à l'échelle vraie) ; `QUARTIER` ; `BENCH`, `ROTOR` (+ `spin`), `DIAL` / `dialAngle`, `LW` (les ampères du rapport), `HERO`, `REPORT`.
- **`src/world.js`** : `SET` (CARTE 0 · TERRAIN 1 · QUARTIER 2 · BENCH 3), `SPOT`, `ERAS` (six dates d'en-tête), **`CLOCK`** (45 ancres : l'heure dite par la voix, qui court pendant les 31 minutes, la cascade et les 11 secondes), `makeClock`, `fmtClock`, `fmtHz`, `ZONES`, `CARD`, `LOOK` / `CLOSE` / `SHARP`, `POSE0` provisoire (= `hook1`), **`FIRST`** (≈ 105 nombres commentés, aucun ne porte un nom de propriété GSAP), `AT` (dix états complets), `VIEW` (≈ 75 poses), `HERO_BENCH`, `HAND` (cinq coutures : trois mouvements dans la CARTE, deux coupes fondues), `SEAMS`, `span`, `cardAt`, `onFrame`, `seam`, `buildWorld` (le cadran et le héros ont deux maisons : `place`).
- **Bouchons** : `europe.js` (`buildEurope`), `terrain.js` (`buildEms`, `buildQuartier`), `model.js` (`buildModel`) — interface définitive en tête, volumes gris qui tournent (les plaques s'écartent, l'éclaté se lève, le gabarit passe sous les câbles, les marques tournent, le héros se monte dans le poste et sur l'établi).
- **Chapitres** : six fichiers vides avec leurs coutures (`c1-instant-reseau`, `c2-paquebot`, `c3-sursis-cascade`, `c4-dechirure-delestage`, `c5-recoller`, `c6-enquete-fin`), câblés dans `chapters.js` ; la boucle dans c6 (coupe franche sur « soir », repère `rewind`).
- **`src/main.js`** : l'en-tête d'une affaire — date et lieu (`era`), l'heure réelle (« Heure d'Europe centrale », `CLOCK`), et le second compteur sourcé : **la fréquence de la zone** (« Fréquence · Ouest 50,0 Hz », une décimale, signal au-delà de ± 0,2 Hz ; `zone` 1 = Nord-Est).
- **`src/pieces.js`** + la page : cinq pièces du dossier (`rapport`, `reglages`, `cre` en cadres de texte, sans page reproduite — licence non établie ; `pylones`, `navire` : photos libres, `FILES_IN` false tant que Merwan n'a pas dit oui au téléchargement).
- **`index.html`** (écrit par script) : « Dossier L06 · Affaire réelle », « Blackout · L'Europe en trois », le compteur de fréquence, `#pieces`, le titre de la chute (« Ce soir-là, le réseau » · « S'est effondré » barré · « S'est sacrifié »).
- **`episode.json`** : `cues` 20 → **274**, tous vérifiés sur la table de `npm run script` (aucun ne porte le nom d'un beat) ; six repères du scénariste **renommés parce qu'ils masquaient un beat** (`n1` → `n1mot`, `manoeuvre` → `landes`, `trip` → `lineTrip`, `relais` → `ouvrent`, `tient` → `caTient`, `recouple` → `recoupleOk`) et les deux références de la courbe de musique mises à jour ; `sfx` : 24 sons de l'histoire ajoutés (`tag: "L06-architecte"`), tous posés après la fin d'une phrase ou avant son début ; `thumb.at` → `dessousW+0.8` (c'était `coupe+1` : le pylône seul), `thumb3.at` → `ouvrent+0.4` (c'était `clac+0.5` : avant l'ouverture) ; `sources` : une entrée « Ce que l'image reconstitue ». Beats et voix intacts. (Le build a régénéré `audio/bed.json` : c'est l'empreinte de la grille de sons, pas la voix.)
- **`docs/L06-decors.md`** (trois sections, liste fermée d'images, ordre de coupe si le temps manque), **`docs/L06-actes.md`** (haut commun de 35 lignes ; six sections phrase par phrase : instant, démonstration sur le mot, pose et part du cadre, raccord, chiffres permis ; les six candidates notées ; la répartition).
- **`.cache/planches/L06/premiere-image.json`** : le fichier d'essais des six candidates, prêt à lancer (commande dans `docs/L06-actes.md`).

## Décisions

- **La pièce maîtresse : la maquette de l'Europe qui se casse en trois plaques** (pleines, sombres, sur halo), la lumière signal qui monte du joint, les plaques qui dérivent, puis le joint qui se ressoude en veille. « Alors… on l'ouvre » : c'est elle qui s'ouvre, en quatre couches (centrales, lignes, postes, prises).
- **Le héros : le relais fréquencemétrique de ton quartier** et ses quatre étages de cellules ; il claque en veille (le délestage est le système qui marche). La chute et la boucle tombent sur lui.
- **Trois décors, pas quatre** (consigne) : `europe.js` (la carte), `terrain.js` (les deux lieux à l'échelle vraie — l'Ems et ton quartier — dans un fichier, deux constructeurs, un seul idiome), `model.js` (les systèmes pleins). **Pas de poste 400 kV à l'échelle vraie** (le L02 l'a fait) : Landesbergen, ses deux jeux de barres et la ligne vers Wehrendorf sont une pièce pleine sur l'établi — une ligne, deux bouts, deux cadrans — ce qui sert exactement le fil « deux chiffres ».
- **Pas de salle de conduite ni d'opérateurs** : la carte EST ce que voient les dispatchers ; les appels sont des impulsions entre deux points. Aucun geste prêté à quelqu'un.
- **Le paquebot** : de verre dans le hall ; sous la ligne, seulement un **gabarit pointillé** (`pass`) — une démonstration du passage. Après 2007 les câbles restent ink neutre pendant qu'il passe (le « sans rien couper » n'est pas confirmé par une source primaire).
- **Les fréquences** : un nombre par zone (`hzW`, `hzE`, `hzS`), lu par l'en-tête, le cadran et la carte ; seules les valeurs du rapport ou de la voix. Dans les démonstrations (chapitres 2 et 10), l'en-tête se tait.
- **Les marques** tournent toutes seules (`ROTOR.spin × time`) et `turnW/E/S` sont des décalages : « tous au même rythme » ne demande rien aux chapitres, « plus aucune ne suit les autres » = trois décalages qui s'écartent ; aucun produit temps × fréquence dans les décors.
- **« 3 000 » ne s'allume qu'à l'enquête** (`markEon`, 577 s), « 2 100 » au déclenchement (`markRwe`, 313 s) : les deux cadrans montrent leurs repères rouges à deux endroits dès 193 s, sans chiffres.
- **Six groupes de chapitres pour 708 s** : 112 · 117 · 106 · 112 · 126 · 135 s. Les deux derniers dépassent 110 s (la consigne plafonne à six) ; chacun a une couture intérieure naturelle à une carte (484,2 et 612,3) si l'agent ne tient pas.
- **L'image 0 tient l'éclair** (`FIRST.tripRun` 0,14) : le décor doit le rendre tenable (une boule qui respire, pas un flash d'une image).

## Les six candidates de la première image

`docs/L06-actes.md` § La première image. Favorites sur bouchons : `hook1` (sous la ligne, vers l'est), puis `hook3` (à hauteur des câbles) ; `hook5` pour « l'Europe » dès l'image 0.

## Ce qui est provisoire (à recaler par le chef de production après les décors, AVANT les chapitres)

- **Toutes les poses de `VIEW`** (posées sur bouchons ; vues sur planche : `hook1…hook6`, `crossing`, `mapWide`, `three`, `region`, `street`, `cellsQ`, `dialMap`, `altDial`, `threeRotors`, `lwWide`, `heroW`, `exploded` — les autres sont calculées, jamais vues) et **`POSE0`**.
- **Les cinq coutures de `HAND`** (aucune vue en mouvement) : c12, c34, c45 sont des `match` dans la CARTE — à vérifier que la caméra ne rase pas le maillage trop vite ; c23 et c56 sont des coupes fondues.
- `DIAL_AT` et `DIAL.bench` (où se tient le cadran), `HERO_BENCH`, `QUARTIER.poste.cells`.
- Les **miniatures** : seuls les instants sont posés (`thumb.at`) ; les poses `thumb.cam` se règlent sur les vrais décors (chaque décor donne la sienne dans son journal).

## Ce qui reste ouvert

- **La géographie de la cassure** (`SPLIT`, `PLATE`) est schématique, écrite de mémoire d'après la figure 4 du rapport UCTE — le dossier de faits ne liste pas les pays par zone. À contrôler sur le rapport (p. 21) avant le rendu final : la Hongrie (Nord-Est ici), la Croatie coupée, l'ouest du Danemark. `sources` le dit.
- Les **centres de conduite** (`dispatchEon`, `dispatchRwe`, `dispatchTennet`) sont des points posés dans chaque zone, jamais étiquetés d'un nom de ville.
- Les deux photos (pièces 4 et 5) : oui ou non de Merwan pour les télécharger ; sans elles le film tient (un `fact` à la place).
- `terrain.js` porte deux lieux : c'est l'agent le plus lourd de l'étape (avec `europe.js`) ; l'ordre de coupe est écrit dans sa section.
- L'**habillage** (décorateur) : l'Ems et le quartier (`src/habillage.js`, non câblé dans `world.js`) ; jamais la carte ni les pièces pleines.
- Les sons ajoutés sont placés par construction dans les souffles (`beat$ + …`, `beat − …`) ; `qa` dira s'il en tombe un sur un mot.
- `D.loop` + `setAct` sur une page de long : repris du L05 tel quel, non revu ici.

## À changer ailleurs

- Rien dans le kit. (Remarque pour `kit/template-long` : les repères du scénariste qui portent le nom d'un beat — ici six — devraient être signalés par `npm run script`.)

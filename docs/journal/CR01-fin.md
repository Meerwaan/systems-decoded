# CR01 · fin.js — journal (05/11)

`toissue` 112,28 → 150,6. Tout instant vient d'un repère (`D.times`, dont `issue:28`, `depuis:graphite`, `depuis:18`, `comment:toi`, `comment:accusé`). Planches : `.cache/planches/CR01/fin/p1…p5.jpg` (+ `e1.json`).

## Monté
- **issue** (coupe `toissue`) : le dessus de l'empilement qui brûle, vu de haut et serré (`aim [0,110,0]`, d 400, az −62, el 40, fov 34, shift 190), la dalle hors du cadre ; `fault` 0 (le feu est le seul rouge), `fire` 0,55 → 0,3, poussée lente. `chip-bilan` sur « morts », son « 28 » (b + i) n'entre que sur le mot « 28 ».
- **pire** (coupe `topire`) : le plan maître du canal en rappel ; sur « effet » le pied passe au rouge et entre (`rod` → 0,18, l'eau du bas chassée) pendant une plongée par rapport vers le pied (d 1100 → 620) ; `chip-1983` sur « trois » ; cercle feutre (`feutre-1983`, w 190 h 420 dy −170, ancre `canal.A.fault`) sur « parades ».
- **depuis** (coupe `todepuis`, acte 03) : la barre seule, plus grande que `VIEW.rodSolo` (aim [0,100,0], d 700 → 620, az −48, el 10, shift 150) ; rouge → vert de « redessinées » à « graphite », `newRod` sur « plus d'eau sous le graphite », la barre descend vite sur « douze secondes… 18 » ; `chip-12s` sur « douze ».
- **france** (coupe `tofrance`) : le crayon français dans son bloc d'eau (VIEW.fuel reculé : d 780 → 680, az −60, el 12) ; l'eau blanche devient vapeur noire sur « chauffe », lueur et neutrons tombent sur « ralentit » ; `D.punch` sur « Toute seule » (relâché avant la coupe).
- **comment** : trois coupes dans la salle — l'équipe (`VIEW.salle`) + `chip-insag1` (« LES HOMMES » sur « accusé ») ; coupe `tomachine` sur le bouton AZ-5 (d 160, el 24, par-dessus les épaules), vert (`ok` 1) puis ROUGE sur « machine » + `chip-insag7` ; coupe 0,28 s avant « Et toi » sur la salle entière basse dans le cadre (shift −260), `ok` 0 `fault` 0 : rien de vert, rien de rouge sous le `duelCall` (toneA / toneB null, les deux camps en encre).
- **abo** (coupe `toabo`) : le cœur entier calme, barres et bas vert (`ok` 1, `depuis` 1), qui recule et descend sous le panneau `nextFile` (deepwater / vanne / sorti 0,38 s avant `toloop`).
- **boucle** : coupe `toloop` sur `FIRST` (`scram` 0,05, `pLow` 0,72), `POSE0` × 1,16 ; `D.loop` (fromD) ramène tout. 150,52 et 0,02 tirés côte à côte : identiques (heure, T−0, cadre, rouge).

## Ce qui a raté et pourquoi
- `issue` en contre-plongée basse : on voyait la face coupée rouge, pas le feu → vue de haut (el 40), `fault` 0.
- **Vert de `depuis` resté gris** : `paint()` (kit/lib/reconstitution.js) prend la branche « ok » dès que `h ≥ 0,5` si `fault` > 0 (le second membre devient négatif) → la pièce guérie reste argile. Contourné ici : `fault` → 0 au milieu exact du passage (là où la lueur rouge vaut 0).
- Plongée salle → bouton puis recul bouton → salle : une silhouette passe contre l'objectif → deux coupes.

## Un cran en dessous (franchement)
- `issue` (112,3–116,3) : lisible, mais « après » se lit surtout par le feu ; les blocs éjectés au sol sont hors champ.
- `france` (127,7–132,8) : la colonne est étroite (≈ 12 % de la largeur) et ses pieds passent sous les sous-titres ; l'avant / après (eau blanche → vapeur noire) se lit à 270 px.
- La salle en lumière `depuis` est voilée (gris clair, peu de contraste) — c'est le décor.
- `abo` à « sceller » : le haut du cœur passe sous le panneau semi-opaque, son bas frôle les sous-titres.
- Non revus à l'œil : le début de `pire` (coupe `topire`, avant « effet ») et le rouge du pied sous la plongée finale ; l'instant exact de la coupe `todepuis`.

## Images lues
40 vignettes (5 planches de 8) — **budget de 26 dépassé** : les planches 4 et 5 ont servi à corriger le gris de `heal` et la silhouette contre l'objectif.

## À changer ailleurs
- `kit/lib/reconstitution.js`, `paint()` : `if (ok > peak * k * (1 - 2 * h)) {` → `if (h < 0.5 && ok > peak * k * (1 - 2 * h)) {` (une pièce guérie reste grise tant que `fault` > 0).
- `episode.json`, beat `comment`, `text` : le dernier « *machine* » sort en rouge dans le sous-titre pendant le duel — l'écrire sans `*…*` pour que la question reste neutre.
- `index.html`, `#chip-12s b` : « 18 → 12 s » s'affiche « 18 → 12 S » (unité à symbole en capitales) → `18 → 12 secondes` si la largeur le tient.

## Retouche du 05/11
- `comment` 133–141 s, salle voilée de gris : la coupe `tocta` pose `depuis` 0 (au lieu de 1) — la salle repasse dans le noir chaud ambré, le vert (`ok` 1) reste sur les voyants et le bouton ; duel inchangé (`ok` 0, camps en encre). Vérifié à 134, 137,5, 140 (`depuis` 0 contre 0,35 : 0 plus sombre et plus chaud). Le fond reste brun moyen derrière le pupitre : c'est le décor.
- `abo` 148,3, le haut du cœur sous `nextFile` : pose de fin d 860 → 1700, shift −230 → −140, `sine.inOut` → `sine.out` (cadré tôt). Vérifié à 146,5 (les pointes des barres effleurent le bas du panneau) et 148,3 (le cœur entier entre le panneau et les sous-titres).
- `heal` 124–126 s : `D.now(…, { fault: 0 })` retiré (`paint()` corrigé dans le kit) ; le halo ne saute plus de 0,5 à 0,25 au milieu. Vérifié à 124,6 (rouge), 125,2 et 125,8 (vert franc, aucun gris).
- Planches : `.cache/planches/CR01/fin-retouche/p1…p3.jpg`. 14 vignettes lues (budget 12 dépassé de 2 pour vérifier le recadrage). `npm run check -- CR01` passe.

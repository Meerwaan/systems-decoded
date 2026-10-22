# L02 · l'architecte — journal

2026-10-20. Rôle : contrat, bouchons des décors, chapitres vides, plan de mise en scène sur la vraie voix (550,3 s), kit des transitions. Aucun sous-agent. 14 images lues (une planche de 8, une de 6).

## Ce qui est fait

- **`src/plan.js`** (sans import) : POSTE à l'échelle vraie (portique 18 m, appareillage 6–9 m, phases à 6 m, travées de 24 m le long de z ; TA travée z 0, LA VOISINE z −2 400, le dernier pylône commun à x −4 200 ; ton circuit sur ses bras +z) ; les points de travail (`WORK`, descentes à x 300 côté poste et −600 côté ligne), les bornes de terre (`EARTH`), la perche (`POLE`), le sol en coupe (`GROUND`), le couloir qui part du poste (`CORRIDOR`) ; LIGNE (pylônes de 60 m tous les 400 m, `HELI`, `V87`) ; `BENCH` ; `MAP`.
- **`src/world.js`** : `SET` (POSTE 0 · BENCH 1 · LIGNE 2 · MAP 3), `FIRST` (≈ 75 nombres, chacun commenté), `REST` / `AT` (un état complet par lieu), `POSE0` provisoire, `VIEW` (≈ 35 poses POSÉES, jamais vues de près), `WORKAT` / `LINEAT` (les points de travail calculés depuis plan.js), **`HAND`** (les cinq coutures entre fichiers, en `D.match`), `SEAMS`, `span(D, "cN")`, `cardAt`, `seam(D, nom, "out" | "in", { set, state })`, `LINE_HUD` (l'en-tête : GESTE 0X / 05, « Ta ligne » 400 000 V · Coupée · À la terre), `buildWorld` / `apply` (qui lit quoi ; la perche posée et visée chaque image entre `poste.you.A.hands` et le conducteur `probe`, ou la pince qui monte).
- **Bouchons** : `poste.js`, `model.js`, `ligne.js` — leur vraie interface en tête, une géométrie grossière qui tourne (planche : tout s'affiche dans les quatre lieux).
- **Chapitres** : six fichiers (`c1-ouverture`, `c2-terre-disjoncteur`, `c3-gaz-helico`, `c4-separer-verifier`, `c5-terre-incident`, `c6-retenir-fin`), chacun avec ses coutures, une coupe par lieu et la boucle (c6) ; câblés dans `chapters.js`. `main.js` lit `geste`, `kv`, `kvOn` ; `index.html` : « Dossier L02 · Accès interdit », « Ta ligne ».
- **`episode.json`** : 27 repères ajoutés (`cues`, tous vérifiés mot par mot sur la vraie voix — aucun n'attrape un autre mot), `thumb.at` « disj3:approche » (l'arc au plus chaud), `thumb2.at` « malt3:dedans » (les pinces, la zone, toi dedans), `thumb3.at` « tst3:entretoises » (la nacelle à l'entretoise).
- **`docs/L02-decors.md`**, **`docs/L02-actes.md`** (67 phrases, un plan par phrase ou par moment, la part du cadre, le raccord, les chiffres autorisés ; la répartition ; les règles anti-parasites et les transitions).

## Le kit (strictement additif)

- `kit/lib/stage.js` : `stage.cut(t, { fade, kind })` — une coupe qui fond. `mix` (défaut) : la dernière image du plan qui part est dessinée une fois, gardée (`FramebufferTexture`), et se fond dans le plan qui arrive (qui bouge déjà dessous) ; `dip` : l'exposition plonge autour de la coupe. La passe de fondu n'est activée que sur ces images : toutes les autres sont dessinées comme avant. Vu sur planche : 132,90 s (≈ 80 % de l'ancienne image) et 132,97 s (≈ 45 %).
- `kit/lib/direct.js` : `cut(at, set, pose, state, opt)` (5ᵉ argument optionnel → `stage.cut`) ; **`match(at, [a, b], to, { set, state, before, after, fade, kind, only })`** — la coupe en raccord de mouvement (`sine.in` jusqu'à la coupe, `sine.out` après : même vitesse si les deltas sont dans le rapport des durées) ; `carry(a, b, c, k)` (exporté) prolonge le mouvement a → b depuis c dans le repère de la caméra (tourner, rapport de distance, déplacement de la visée en unités de distance). Vérifié en Node (`scratchpad/L02/carry-test.mjs`) : une rotation se prolonge à l'identique, un travelling avant garde sa vitesse au centimètre, un panoramique à droite reste à droite à une autre échelle.
- `kit/lib/long.js` : `lineHud(…, { word, off, fmt, tone })` optionnels (défauts = le L01).
- Vérifié : `npm run build -- L01` et `check -- L01` passent (31/31 contrastes), `check -- 025` passe, `check -- L02` passe.

## Appris en chemin

- La carte de chapitre avec la ligne « ACCÈS INTERDIT » seule fait échouer le contrôle de chevauchement (le surtitre « touche » le numéro, sur toutes les cartes) ; « Série · Accès interdit » passe, « Fabriqué pour te sauver » aussi. Cause non élucidée (une métrique du È de JetBrains Mono ?) : le surtitre est « Série · Accès interdit ».
- Un heredoc bash avec des apostrophes casse (`unexpected EOF`) : scripts écrits avec l'outil d'écriture, dans `scratchpad/L02/`.
- Les trois midrolls du script tombent dans un `hold` dont la fin chevauche la carte suivante : la pub se place à l'instant de la carte (127,03 · 250,72 · 366,50).

## Ce qui reste incertain

- Toutes les poses de `VIEW` et de `HAND` sont posées sur des bouchons : les décors en donneront de meilleures ; les poses des coutures sont à l'orchestrateur (à recaler une fois les décors faits, avant les chapitres).
- `D.match` n'a été vu à l'image que sur un bouchon (88,3 → 88,6 s : même cadrage, la descente continue) ; sa vitesse n'est juste que si le plan d'avant finit sur `from[0]` à `at − before`.
- Le fondu `mix` gèle l'image qui part : au-delà de 0,3 s ça se verra (garder 0,15–0,3 s).
- La première image (POSE0) est provisoire : quatre candidates (`hook1` … `hook4`) à tirer sur planche une fois `poste.js` et `model.js` faits.
- `c6` fait 121 s (au-dessus des 110) ; une couture au milieu de « L'incident » le couperait si l'agent ne tient pas.

## À changer ailleurs

- Rien pour l'instant.

## Intégration des décors (20/10, reprise)

- Appliqué : `poste.set` reçoit `probe`, `perche` ; `model.pole.fit?.(distance)` (perche télescopique) ; `WORK.climb.leg` z 1 130 ; `VIEW.work` (az −72), `lockup`, `ground` (à n'utiliser qu'avec `cutaway` > 0), `climb`, `beam` (l'arc), `chamber`, `arcCore`, `old`, `map`, `lineWide`, `heliWide`, `basket`, `v87` (proposée, non vue) ; ajoutées : `field`, `zone`, `clampEarth`, `chiefs`, `touch`, `parts`, `cloud`, `heliClose`, `vertigo`, `basketFront`, `corridor`. `AT.bench` éclaire la chambre (fy 750, pool 0,3), nouvel `AT.benchTall` (fy 420, fs 700, pool 0,55) pour le pôle entier.
- Pas appliqué : la portée dernier pylône → portique relève de `poste.js` (son agent la tient), pas du contrat.
- Planche des candidates (`scratchpad/L02/candidates.jpg`, six cadres avec l'en-tête) : hook5 (macro) retenu et collé dans `POSE0` ; hook1 (az −10) second. Revu avec l'en-tête : la tête et son crochet sur ton conducteur, les chaînettes de la voisine en signal derrière, le sujet dans la moitié gauche.
- Restent : `benchPole` sombre même sous `AT.benchTall` (le pôle de 9 m est noir sur noir : préférer les plans de la chambre, ou une lumière dans `model.js`) ; dans POSE0, une large diagonale blanche (ta descente en verre ?) et une lueur signal au bord gauche — à identifier par l'agent du poste.
- 10 images lues dans cette reprise.

# 035 · Passage à niveau — journal de l'architecte

2026-11-03. Contrat du dossier 035 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle (turbo, 83,1 s, 14 beats) : rien touché dans `audio/` ni dans les beats. Aucune dépense ElevenLabs.

## Fait
- Lu : catalogue (route, personnages, kit), recettes agents / actes / décorateur (entrée), règles d'image, faits 035 (§3, §4, §9) et contre-vérification, modèle 025 (journal, `world.js`, `main.js`), têtes d'API de `025/route.js`, `025/habillage.js`, `011/car.js`, `021/train.js` (+ son `plan.js`).
- **Coupe des décors (deux neufs, le reste importé)** : `model.js` = le signal G2 (mât, R24 double face, sonnerie, coffret, demi-barrière et lisse), plein, construit **quatre fois** par `world.js` (le héros `outA`, la sortie devant le capot, va seul sur l'établi) ; `passage.js` = l'enveloppe qui importe `025/route.js` (avec sa voiture du 014/011 et toi au volant, et son habillage), `021/train.js` (sa ligne masquée, glissé sur la voie 2) et `011/car.js` (la dernière voiture de la file), et construit voies, platelage, téléphone + pancarte, gens qui sortent, règle des 800 m, tableau de bord. Le téléphone ne méritait pas un fichier : il est dans `passage.js`.
- `plan.js` : deux repères (voiture : nez −z, gauche −x ; passage : à z = −100·`gap`), échelle vraie ; quatre demi-barrières à ±6,5 m, voies à ±2,1 m ; la voiture coincée sur la voie 2 (`GAP_STUCK` −3), sortie à −6,8 (queue hors gabarit du TGV, nez à 5 cm de la file) ; `BENCHAT` (le héros, voiture coincée) pour `benchCut`.
- `world.js` : `FIRST` (38 nombres, liste fermée ; aucun nom de propriété GSAP), `STORY` + `trainAt(T)` (le TGV à la route à T 22, 140 km/h illustratif), `loweredOf`, `VIEW` (21 poses), `BENCHED`, `STAGED`, `apply`. `main.js` : en-tête « Feux +N s » (`clock`) et « Barrières N/4 » (signal à 4/4, veille à 3/4 une fois la lisse cédée), compte de `chip-annonce`. Actes : squelettes qui construisent.
- `index.html` : chips (r24, sonnerie, demi, lisse, annonce, entree, 800, autre, sort, alerte), retitle « Un mur » → « Ta sortie », duel « Téléphone / Pancarte », prochain 036 sans chiffre, `.chip--live … { opacity: 0 }`.
- `episode.json` : 59 repères vérifiés sur la table (`téléphone#2`, `pancarte#2` pour le duel) ; `sfx` refaite dans les souffles (fins de mots `mot$`) — trois sons de l'ancienne grille tombaient sur un mot (le `swish` à 0,14, l'`impact` sur « on », le `blip` sur « pas », le `rewind` sur « jour ») : déplacés ; `crack` n'est pas un type → `impact` avec `crack: 1` ; `cover` provisoire (éclaté, el 30) ; deux lignes de `sources` (ce que l'image reconstitue, l'en-tête illustratif).
- `npm run check -- 035` : passe (0 erreur).

## Planches (12 images lues sur 25)
1. `p1.jpg` (8) : convention vérifiée — **az 0 voit l'arrière de la voiture** (le tableau de bord au-delà du conducteur) ; la lisse baissée pointe bien vers −x (π pour les mâts de gauche) ; l'éclaté sur l'établi se lit ; `system` (fin d'acte 1) compose bien avec la voiture en verre en bas et le TGV en tube. Le platelage du bouchon est une dalle grise opaque (à remplacer) ; le TGV à 160 m disparaît dans le brouillard.
2. `p2.jpg` (4 candidates) : (b) « capot » est la plus forte au bouchon (mât et R24 en premier plan, lisse en lame) ; (a) « rail » a la voiture de profil sur les rails mais pas encore le train au point de fuite (brouillard) ; (d) un coffret trop près à droite.

## Décisions
- La scène est un **retour en arrière** franc (coupe à 8,38, T revient à 0) : l'accroche est l'instant où la lisse de sortie se pose (T ≈ 8,2) ; la scène s'achève sur cette même image. Sinon l'ordre des barrières (sortie après entrée, art. 10) contredisait l'accroche.
- Tous les R24 double face (le « second feu au-delà des voies ») : visibles de partout, sans expliquer la géométrie.
- Le téléphone et la pancarte côte à côte (le film), dit dans `sources`.
- Aucune pluie qui tombe (`wet` 0,25 : seulement des reflets).

## Poses provisoires (réglées sur bouchons — à recaler par le chef de production d'après les journaux des décors)
`POSE0` et toutes les poses de `VIEW` : `hood`, `plunge`, `under`, `cab`, `behind`, `over`, `system`, `top`, `rail`, `push`, `wheels`, `pass`, `phone`, `whole`, `exploded`, `lampBench`, `bellBench`, `boomBench`. Seules `hood`, `plunge`, `under`, `system`, `exploded`, `top` et l'az 0 ont été vues ; les autres sont calculées. Aussi provisoires : `cover.cam`, `scene.fog.density` 0,00011 (route) dans `apply`, `far` 160 000 dans `main.js`.

## À changer ailleurs
- `kit/` : rien d'obligatoire. Une aide utile : `npm run script -- <ep> --words` (la table mot à mot ; je l'ai lue dans `gen/episode.data.js`) — déjà demandée aux 021 et 025.
- Après les décors : `docs/035-actes-maj.md` (poses vues, défauts) et `POSE0` choisi sur la planche des quatre, collé dans `world.js`.
- Le décor `025/habillage.js` porte un panneau « passage d'animaux » qui n'a rien à faire ici : `passage.js` doit le masquer (ou dire où il entre).

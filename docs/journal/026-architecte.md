# 026 · Soyouz MS-10 — journal de l'architecte

2026-10-21. Contrat du dossier 026 : plan, monde, bouchons, page, repères, son, plans des décors et des actes.

## Fait
- Lu : CLAUDE.md (patte, animation, appels à l'action, image, chaîne courte), recettes (agents, actes, décorateur), faits 026 et contre-vérification, le modèle 025 (journal de l'architecte, décors, actes, actes-maj, `plan.js`, `world.js`, `main.js`, `index.html`, `episode.json`), `007/src/jet.js` 340–520, `kit/lib/figure.js`, et ce qu'il fallait du kit (`stage.js` pour l'azimut, `direct.js`, `blocks.js`, `build3d.js`, `ref.mjs`, les types de `scripts/sfx.mjs`).
- **Voix réelle 91,1 s** ; table mot à mot tirée par `scratchpad/026/words.mjs` (la commande `script` ne la donne pas). Rien touché dans `audio/` ni dans les beats (`text`, `vo`, `voAlt`, `hold`).
- `src/plan.js` (sans import) : **l'origine est toi** (la base du module de descente), l'axe de la fusée est y. La tête (coiffe en deux demi-coquilles, nez, quatre moteurs à az ±45 / ±135, grilles repliées, tour, module orbital, module de descente, trois sièges, toi à gauche, ton équipier au milieu, pupitre et sa lampe), les deux capteurs, la fusée (jupe, module de service, troisième étage, treillis, bloc central, quatre propulseurs B +z, V +x, G −z, **D −x**), l'impact, la pièce faussée, le pas de tir (`PAD.alt` 0,037 km), le parachute (maquette), le teaser, l'établi (`BENCH.floor` −1290). Convention d'azimut vérifiée dans `kit/lib/stage.js` : caméra en t + d·(sin az · cos el, sin el, cos az · cos el) — az 0 en +z, −90 en −x ; `around(az, r, y)` place tout avec la même convention.
- `src/world.js` : SET SCENE / BENCH ; **`FIRST` fermé : 44 nombres** (+ `set`) ; `POSE0` provisoire = candidate (a) ; `VIEW` (22 poses) ; `BENCHED`, `STAGED`, `GROUNDED` (le pas de tir) ; `MOTORS_AT` 3, `WINDOW` (la fenêtre, la frappe à 10 %), `TOWER_GONE` 400. La pile (`stack`) tourne de `tilt` autour de l'origine et glisse de `sway` ; la fusée tombe de `apart` le long de son axe ; la tête se redresse sur ses 6 premiers mètres ; les capteurs re-parentés (fusée / tête sur l'établi) ; le pas de tir posé au sol (y = −alt·1e5) ; l'établi abaissé à `BENCH.floor` pour que la coupe soit EN PLACE, et `tilt` y tourne la colonne autour de son pied.
- Bouchons : `model.js` (tête, moteurs, jets, tour, modules, deux capsules de verre pour l'équipage, pupitre et sa lampe, capteurs, section de verre de l'établi), `launcher.js` (étages, quatre propulseurs qui pivotent à leur pied, `sep` / `bad`, jet du bloc, impact, pièce faussée, pas de tir), `sky.js` (un dôme : limbe depuis `alt`, `pitch`, sol en grille près du sol ; gaine, voilure, éclat, teaser). Tout construit.
- `src/main.js` : l'horloge = `clock` (T±x,x s depuis la frappe ; ink → signal → veille quand les moteurs tirent), « 11 oct. 2018 » / « 14 mars 2019 » selon `era` (et le titre « Soyouz MS-12 ») ; « Altitude » = `alt` en km, veille une fois posé.
- Actes : quatre squelettes qui construisent (à réécrire en entier).
- `index.html` : `chip-tour`, `chip-moteurs`, `#window` (la frise de la fenêtre, son CSS), `chip-avarie`, retitle (« Ton sauvetage » : « Sur la tour » → « Sur la coiffe »), `chip-piece`, `chip-ms12`, `#duel` (« Je remonte » / « Plus jamais »), `#net`, `#next` (027, sans chiffre). Retirés du modèle : `#film`, `#cta-field`, `chip-toi`, `chip-coeur`.
- `episode.json` : **97 repères**, tous vérifiés mot à mot (un seul piège trouvé : `comment:plus` tombait sur « Cinq mois PLUS tard » → `comment:plus#2`) ; `cover` provisoire (eclate$, el 28, shift −480) ; **72 sons**, tous posés dans un souffle lu sur la table (le `impact` de l'éclaté et le `rewind` du modèle, qui tombaient sur un mot, déplacés après lui) ; une ligne de `sources` sur la maquette (échelle, altitude, horloge, places illustratives, АВАРИЯ, dates).
- `npm run check -- 026` passe (0 erreur ; avertissements : un compilateur de shader, contenu au bord du cadre, le duel du squelette qui chevauche le like).

## Planches (24 images lues sur 25)
1. Bouchons, 8 images : (a) se lit comme une fusée vue d'en dessous ; le profil tourne bien autour de l'origine (`tilt` 12) ; la tête dans le ciel cadre ; `towerUp` vide (caméra dans la coiffe) ; **dedans** : le module plein cache l'équipage → le module de descente sera en VERRE (écrit dans `026-decors.md`) ; l'établi entier = une colonne mince ; l'éclaté de la tête tient dans un cadre.
2. Candidates et poses, 8 images : (b) diagonale mais trop serrée, limbe hors cadre ; (c) se lit mal (le nez de D ne passe pas devant) ; (d) vide (cadre trop haut) ; fin d'acte 1 (`skin` 0,3) bonne base ; pas de tir, parachute, sol : se lisent.
3. Avec l'en-tête, 6 images : l'en-tête marche (T−0,8 s, 50 / 93 / 0 km, « 11 oct. 2018 », veille quand les moteurs tirent) ; (b) large : fusée mince ; `torn` : la tête sous l'en-tête → pose reculée ; `apogee` : limbe hors cadre → `el` 12 ; couverture : la tour posée sur le nez en plein éclaté → `BENCHED.tower` = `TOWER_GONE`.
4. Vérification, 2 images : (d) avec `tower` 12 : le nez en bas, la tour en haut, tous deux dans la zone ; couverture v2 : l'éclaté sous le titre, sans la tour.

## Décisions
- **Trois décors** : `model.js` (le système plein), `launcher.js` (la fusée aux rayons X et le pas de tir), `sky.js` (le ciel, la Terre, la chute, le parachute, la steppe, le teaser). Le pas de tir va avec la fusée (il la tient) ; la descente va avec le ciel (tout ce qui t'entoure une fois la fusée quittée).
- **L'origine est toi** et le monde vient au module : 50 et 93 km ne sont que `alt` (le dôme à l'infini, copié du 007, et l'en-tête). Une seule convention pour tout l'épisode.
- **La fusée tourne autour de toi** (de l'origine), pas de son centre de masse : la tête reste en place dans tous les plans serrés et la coupe vers l'établi est en place ; dans un plan large, la fusée a l'air de pivoter sous sa tête — à vérifier sur le vrai décor (si ça se lit faux, un pivot `PIVOT` dans `plan.js` et la tête qui suit).
- **L'horloge part de la frappe**, pas du décollage : la seconde exacte de l'avarie diverge selon les sources (« À ne pas dire »). Elle s'arrête à T+3,0 quand les moteurs tirent ; ensuite c'est l'altitude qui raconte.
- **Le module de descente en verre** (sièges et bouclier pleins) : sinon « toi » n'existe pas à l'image.
- **La fenêtre** a son panneau (`#window`) : « quarante secondes » et « pile dans cette fenêtre » sont des chiffres que l'image ne peut pas montrer ; la tour qui part et la coiffe qui tombe, elles, se jouent sur l'établi.
- **Le pas de tir sert trois fois** : « avant le décollage » (hook), « une pièce faussée, au montage » et « vous repartez » (MS-12) — un seul décor.
- Le duel : « Je remonte » (veille) / « Plus jamais » (signal), comme l'épinglé ; jamais tapé.
- Le teaser du 027 : des phares qui descendent une pente au loin, puis une bretelle veille — sur la steppe où tu as atterri.

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` (la table mot à mot ; demandée aux 021 et 025, refaite ici en `scratchpad/026/words.mjs`).
- `CLAUDE.md`, section « Dossiers » : une ligne pour le 026 (contrat écrit le 21/10, voix réelle 91,1 s, décors à lancer : `model.js`, `launcher.js`, `sky.js`).
- `kit/lib/blocks.js` : si une deuxième fenêtre/frise sert un jour, `#window` (son balisage et son CSS sont dans `index.html`) monte dans le kit (`windowCall`).
- Après les décors : `docs/026-actes-maj.md` (poses vues, défauts) et `POSE0` choisi sur la planche des quatre, collé dans `world.js`.
- Décorateur : `launcher.js` (le pas de tir) et `sky.js` (la steppe) seulement — jamais la fusée ni la tête.
- `npm run qa` : vérifier que les nappes (`hiss`, `ambience` sous la voix, comme la pluie du 025) ne sortent pas comme « sons posés sur un mot ».

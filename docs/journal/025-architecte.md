# 025 · ESP — journal de l'architecte

2026-10-17. Contrat du dossier 025 (ESP) : plan, monde, bouchons, page, repères, plans des décors et des actes.

## Fait
- Lu : CLAUDE.md, recettes (agents, actes, décorateur), faits 025 et contre-vérification, le dossier 021 (modèle : plan, world, main, index, décors, actes, journal de l'architecte), l'API de `014-abs/src/street.js` et le `world.js` du 014.
- Modèle repris : `kit/template/` recopié (index.html, src/*) avec le remplissage de `npm run new` (scratchpad/025/refresh.mjs), puis réécrit dans la forme du 021. Les actes sont des squelettes qui construisent (à réécrire en entier).
- Message de l'orchestrateur pris en compte : beats `abo` (026, Soyouz MS-10) et `boucle` (« Comme toi, face à… »), `rewind` → `boucle:face`, la ligne de `sources` — gardés. La voix a été enregistrée pendant le travail : **91,5 s**, rien touché dans `audio/`.
- `src/plan.js` : la voiture du 014 (ses valeurs telles quelles), l'origine au centre de la voiture, nez −z, GAUCHE = −x ; quatre coins (`HUBS`, `corner(k)`), bloc + calculateur et son comparateur (`UNIT`, `ECU`), capteur d'angle (`SAS`), de lacet (`YAWS`), conduites ; route de campagne (`LANE`, `ROAD` : fossés, lisière), `BOAR`, `MOOSE`, `ARROW`, `ENGINE`. Convention d'azimut vérifiée dans `kit/lib/stage.js` (caméra en t + d·(sin az, …, cos az)) : az 0 derrière (+z), −90 à gauche (−x).
- **Deux repères, un nombre (`onboard`)** : `route.js` tourne la route de −yaw autour de la voiture (014) ; `world.js` retourne l'ensemble de +yaw·(1 − onboard). 0 = route immobile, la voiture tourne dessus (toupie, flèches) ; 1 = voiture d'équerre (plans serrés, coupe vers l'établi en place, l'établi ne tourne pas). Sur l'établi, `onboard` 0 fait tourner le squelette (geste du capteur de lacet). Vérifié sur bouchon (planche, « top spin ») : la route reste en place, la voiture tourne.
- `src/world.js` : SET ROAD / BENCH ; `FIRST` fermé (35 nombres + 8 de lumière) ; `HANDOFF` (l'état où l'acte 1 rend la main, repris par le `benchCut` de l'acte 2 : l'écart ne saute pas) ; `VIEW` (21 poses, repère noté) ; `BENCHED` garde `kmh` et `archive` ; `STAGED` ; `KMH` 80, `MPS`, `SLOWMO` 6 (ralenti), `ecartOf`. En 1997 (`archive`), le système est caché (la voiture du test n'avait pas d'ESP).
- `src/main.js` : en-tête = vitesse (80 km/h, illustratif ; signal quand l'écart ≥ 3°) + « Écart » = |yaw − aim| en degrés (veille < 3 : « oui », signal au-dessus : « non ») ; en 1997 : « Oct. 1997 » et « — » (aucune vitesse du test n'est sourcée).
- Bouchons : `route.js` importe `buildStreet` du 014 tel quel (sans le modifier) + boîtes grises (sanglier, élan, moteur), deux flèches, l'arc, la fusée ; `model.js` en volumes gris (quatre coins qui braquent, bloc, calculateur et ses deux aiguilles, capteurs, pneus et volant sur l'établi seulement).
- `index.html` : `chip-25`, `chip-oui`, `chip-non`, `chip-gaz` (« Puissance réduite » : la nuance de la contre-vérification), `chip-coin`, retitle (« Elle freine / Pour ralentir → Pour tourner »), `chip-1997`, `chip-livraisons`, `chip-2014` (« Voitures neuves · UE »), cta « APRÈS » (5), next 026 (la fusée, sans chiffre).
- `episode.json` : 78 repères, tous vérifiés mot à mot sur la table (scratchpad/025/words.mjs ; aucun ne tombe sur un autre mot), `cover` (eclate$, el 30, shift −520), `sfx` (pluie sur la route, whoosh du décrochage, impacts, `clack` sur « une roue », blips sur « droit » et le verdict, rewind), une ligne de `sources` sur l'en-tête illustratif et le comparateur. Ni `text` ni `vo` touchés.
- `npm run check -- 025` passe (0 erreur ; avertissements : shader du moteur, « canvas à bord »).

## Planches (10 images lues sur 30)
1. Bouchons, 8 images (les quatre candidates, la toupie de haut, le système dans la voiture, l'éclaté, le comparateur) : la toupie de haut se lit déjà (flèches, traces) ; (c) compose bien ; le comparateur à deux aiguilles se lit gros sur l'établi. (b) : sanglier trop près, sorti à gauche ; (d) : caméra dans ta tête.
2. (b) et (d) reposées : (b) mieux (voiture au centre, phares), le sanglier reste trop près et à gauche — à régler sur le vrai décor ; (d) côté passager, le moteur-bouchon masque le centre.

## Décisions
- Le coin héros est l'avant DROIT (on braque à gauche : extérieur = droite). Il est du côté opposé à la clé : on le filme de la gauche à travers la voiture de verre (le disque est côté intérieur), ou de haut.
- L'élan apparaît deux fois : au bas-côté dans l'accroche (« à un élan », le C, sans légende) et dans la voie en 1997, au même cadre que la première image (la rime sanglier / élan).
- « Pas les quatre » se joue dans l'accroche par les quatre coins qui s'allument puis s'éteignent sauf un.
- Aucun « 25 par seconde » à l'image (ce serait un scintillement) : `chip-25`.

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` (j'ai repris scratchpad/021/words.mjs) — déjà demandée au 021.
- `CLAUDE.md`, section « Dossiers » : une ligne pour le 025 (contrat écrit le 17/10, voix réelle 91,5 s, décors à lancer : `model.js`, `route.js`).
- Après les décors : `docs/025-actes-maj.md` (poses vues, défauts) et `POSE0` choisi sur la planche des quatre, collé dans `world.js`. Si `SLOWMO` 6 rend la route figée, le changer dans `world.js` avant les actes.
- Décorateur : `route.js` seulement — la lisière du bois (troncs, sous-bois), un panneau de virage ou de gibier SANS texte, des bornes de bord de route, des gouttes dans les phares ; rien devant la voiture ni sur le système, rien dans la voie.

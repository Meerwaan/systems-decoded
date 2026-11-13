# 046 · Torchère — journal de l'architecte

2026-11-13. Contrat du dossier 046 (torchère de raffinerie) : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle (eleven_v4, 91,97 s) : rien touché dans `audio/`, ni `text` ni `vo`.

## Fait
- Lu : catalogue (rubriques + `CR02/plateforme.js` en tête et API), recettes agents / actes / décorateur (« où il entre »), `regles-image.md`, faits 046 (§ 10) et contre-vérification, `voir` des beats, modèle 025 (journal, world, main, tête des docs), `stage.js` l. 381 (azimut : az 0 en +z, −90 en −x — confirmé sur planche).
- **Réutilisation** : aucun décor du catalogue ne tient la raffinerie ni la torche. `CR02/plateforme.js` = plateforme de forage en mer, DA « noir chaud » (argile, ambre) : on n'en copie que le contre-jour posé derrière la tour et `makePuffs` (fumée). Feux de référence pour `flamme.js` : `042/feu.js`, `012/fire.js`. `kit/lib/usine.js` → `xray()` pour la raffinerie.
- **Trois décors** : `model.js` (le réseau, plein), `flamme.js` (flamme, fumée, pilote, gaz cru, pluie de feu — le plus lourd, isolé pour ne pas ralentir le système), `raffinerie.js` (raffinerie aux rayons X, compresseur, fantômes, fenêtre du like, lave-vaisselle du 047 sur son propre sol, comme le teaser du 042 dans `feu.js`). Bouchons gris écrits avec leur API définitive.
- `plan.js` : **maquette** (cheminée 18 m, colonnes 11–15 m, réseau ≈ 23 m), origine au pied de la cheminée, gaz vers +x ; `FLOWAT` (étapes de `flow`). Resserré après la planche 2 : à 28 m de long, l'éclaté ne tenait pas dans un cadre vertical.
- `world.js` : établi **en place** (`BENCHAT`, re-parentage sans décalage, `benchCut` avec `origin` nul) ; `FIRST` fermé : 37 nombres (`set`, 11 raffinerie, 14 système, 5 feu, 8 lumière) ; `VIEW` (16 poses) ; `BENCHED`, `STAGED`.
- `main.js` : l'en-tête = l'heure de l'histoire (accroche ≈ 16:30:15 = l'instant où la torche s'allume ; 16:30:00 sur « coupe » ; figée de `tobench` à `tozero` ; reprise jusqu'à l'allumage ; 17:00:00 sur « demi-heure ») ; second compteur « Pilote · Allumée / Éteinte » lu dans `pilot` (sourcé IChemE). Vérifié sur planches (16:30:00 à 10,4 s, 16:30:09 à 26 s, 17:00:26 à 87 s).
- Découpage : `acte1` 0 → 19,50 (9 phrases), `acte2` 19,50 → 48,46 (11 phrases : pas de `acte2b`), `acte3` 48,46 → 64,65 (11), `fin` 64,65 → 91,97. Squelettes qui construisent, à réécrire en entier.
- `index.html` : `chip-arret`, `chip-garde`, `chip-purge`, `chip-pilote`, `chip-mexique` (Poza Rica, sans année), retitle « Géante » → « Éteinte » (signal ; la phrase longue débordait), duel « Bon signe / Mauvais », `#next` 047 (« Il lave avec moins d'eau que toi. »), `#cta-field` retiré (la question est un duel, la réponse due est `chip-pilote`).
- `episode.json` : 55 repères vérifiés mot à mot sur la table (aucun homonyme : `washer` = « lave-vaisselle » exact, `coeur` = « garde »), `cover` (eclate$, réseau de flanc, el 30), `sfx` réécrit sur la banque (25 entrées, 18 sons ponctuels, tous dans les souffles ; blanc total et signature sur « on l'ouvre »), une ligne de `sources` sur la maquette et ce que l'image reconstitue. `npm run script` : rien à signaler. `npm run check -- 046` passe.

## Planches (20 images lues sur 25)
1. Bouchons, 8 : candidates (a)–(d), compresseur, éclaté, lave-vaisselle, sous le bras. (d) première version dans le ballon ; l'éclaté trop large pour le cadre ; le bras invisible de dessous à d 34.
2. Bouchons, 8 : (a2) meilleure ; (c) barrée par le collecteur commun ; (d) refaite (la garde au premier plan) ; éclaté toujours trop large → plan resserré ; fenêtre et lave-vaisselle se lisent.
3. Bouchons, 4 : éclaté de flanc qui tient (le haut de la cheminée frôle l'en-tête → `shift` 80) ; colonnes rouges qui se lisent ; (c) encore barrée → caméra montée au-dessus du collecteur (non revue).

## Poses provisoires (réglées sur bouchons, à recaler par le chef de production)
`POSE0` (candidate a) et **toutes** les `VIEW` : `tip`, `compressor`, `columns`, `header`, `foot`, `flare`, `pane`, `exploded`, `valves`, `drum`, `seal`, `stack`, `whole`, `washer`, `washerArm` ; `cover.cam`. Vues sur planche : `columns`, `compressor`, `exploded` (avant le dernier `shift`), `pane`, `washer`. Jamais vues : `tip`, `header`, `foot`, `flare`, `valves`, `drum`, `seal`, `stack`, `whole`, `washerArm` (dernière version), la candidate (c) finale.

## Les `voir` que le décor ne tient pas tels quels
- Accroche : une contre-plongée qui montre la cheminée à 40 % ET les colonnes derrière ET la flamme pilote lisible est impossible d'un seul point de vue (la cheminée est loin des colonnes) : (a) garde les colonnes, (b) la flamme pilote — à trancher sur la planche.
- Principe : « la garde et la cheminée en grand » dans un même plan ne tient pas (18 m entre les deux) : deux plans liés par une montée le long de la cheminée.
- Éclaté « sinon il pleuvrait du feu » : la flamme est à 19 m du ballon : recul au large pour les avoir ensemble.

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` (j'ai relu `gen/episode.data.js` par script, comme au 021 et au 025).
- `docs/catalogue-notes.json` : entrées pour `046/model.js`, `flamme.js`, `raffinerie.js` une fois les décors faits (`model` 046 y est encore le gabarit « à décrire »).
- Après les décors : la planche des quatre candidates (`.cache/planches/046/premiere-image.json`) sur les vrais décors et l'habillage, `POSE0` collé dans `world.js` ; `docs/046-actes-maj.md` pour les poses vues.
- Contraste : `npm run check` signale l'onglet d'acte de l'en-tête à 4,3:1 sur la flamme bouchon (5,1 s) et sur le lave-vaisselle — à revoir sur les vrais décors (`#hud-shade`, ou la flamme qui se fond avant l'en-tête).

# 2026-10-27 — le catalogue des décors (passe « optimisation », agent catalogue)

But : ne plus jamais remodéliser ce qui existe. Un décor neuf coûte 400 à 580 k jetons et 20 à 57 min ; un décor importé presque rien.

## Livré

- `scripts/catalogue.mjs` (nouveau) → `docs/catalogue.md`. Lit le code à chaque fois : exports, signature d'entrée, état lu par `update` (en-tête ou déstructuration), imports du kit et des autres épisodes, qui l'a repris, noms des poses `VIEW` de l'épisode, nombre de lignes ; détecte les fonctions d'aide recopiées (3 épisodes ou plus, copies groupées à 75 %) et les fichiers presque identiques (≥ 45 % de lignes communes). `--check` : sort en erreur si un fichier de décor n'a pas de note. `--vignettes` : refait les vignettes depuis les films rendus (ffmpeg, ≈ 20 s).
- `docs/catalogue-notes.json` : les notes à la main (catégorie, phrase, forces, défauts, poses, ce qui a été recopié), la liste des dossiers en chantier, les planches.
- `docs/catalogue.md` : 111 entrées (≈ 14 k jetons estimés), classées par lieu, chacune avec sa ligne d'import exacte.
- `docs/catalogue/` : 28 bandes de quatre images (une par dossier terminé) et trois planches (`planche-maison.jpg`, `planche-transports.jpg`, `planche-lieux.jpg`), tirées des films rendus — aucun rendu 3D lancé. Les dossiers en chantier (027–030, L03, L04) sont exclus.
- `docs/catalogue-promotions.md` : ce qui devrait monter dans le kit, les doublons, les sujets de la réserve faisables avec l'existant.

## Constats

- Les réutilisations par import existent déjà et marchent : 009 → 012, 018 ; 012 → 018 ; 011 → 019, L01 ; 014 → L01 ; 016 → 024 ; 022 → 028 ; L01–L04 → HS01–HS04.
- Deux vraies copies de décor entier : `025/route.js` ≈ `014/street.js` (76 %), `L04/bord.js` ≈ `015/rafale.js` (71 %).
- Effets recopiés partout : `makeBall` (19 dossiers), `makeEmbers` (9), `makeSparks` (7), `makeSprites` (7), `makeStreaks`, `makeRibbon`, `headGeometry` (6), `gridMaterial`, `glassFigure`.
- 030 a refait un mur et un tableau (9 % communs avec `016/wall.js`) : faute de savoir qu'ils existaient.

## Pas fait (règle de la passe)

- Aucun fichier d'`episodes/` ni de `kit/` modifié ; aucune promotion. `package.json` non touché : l'entrée `"catalogue": "node scripts/catalogue.mjs"` est à ajouter par l'agent de l'outillage.
- Vignettes : extraites des films, à des instants fixes (0,5 / 6 / 14 / 55 s) — elles montrent le style et le lieu, pas toujours le plan le plus large. Les instants se règlent dans `catalogue-notes.json` → `planches`.
- Images lues : 2 planches.

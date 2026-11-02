# 034 · À changer ailleurs (hors du dossier 034)

Lignes que le dossier 034 ne peut pas écrire lui-même (kit, scripts, 023, CLAUDE.md). À appliquer par le chef de production, ou à reporter.

## Architecte (2026-10-30)

- **`episodes/023-eolienne-de-secours/src/avion.js`** (ne pas modifier : film publié) — pour un prochain emprunt, ce qui manque à l'API : un nombre qui peigne les gouvernes en encre (ni panne signal, ni vert du 023), et un export de la matière `fx.surfMat`. Le 034 contourne en éteignant cette matière depuis `world.js` (`quiet`) ; si l'avion du 023 monte un jour dans le kit (`kit/lib/avion.js`), y ajouter `surfTone: "ink"`.
- **`scripts/sd.mjs` (`script`)** : une option `--words` qui imprime les mots et les souffles (`s`, `e`) — déjà demandée aux 021 et 025 ; le 034 a encore recopié deux scripts (`.cache/planches/034/architecte/words.mjs`, `gaps.mjs`).
- **`docs/catalogue-notes.json`** (après rendu) : `034/fond.js` (la mer de nuit de la surface au fond, échelle vraie, épave de verre, anneaux de balise, lumière qui descend) et `034/model.js` (l'enregistreur de vol) — à cataloguer ; la mer resservira (sous-marin, plongée, épaves, TCAS au-dessus de l'eau).
- **CLAUDE.md**, rien à changer.

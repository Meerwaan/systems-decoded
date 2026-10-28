# Opti du 2026-10-27 — l'outillage

Un des quatre agents de la passe « moins de jetons, plus vite, même qualité ». Le résultat et les chiffres : `docs/outillage.md`.

- **Mesuré** sur le 025 en lecture seule (sorties en octets ÷ 3,6), et dans `metrics/commandes.jsonl` (lecture) : les commandes qui coûtent le plus de temps sont `check` (528 lancements × 35 s médian ≈ 5 h), les brouillons (62 × 120 s), `look` (1 461 × 5 s), les rendus (31 × 139 s). La sortie la plus lourde de loin : `render` (≈ 18 500 jetons, barres de progression et traces).
- **Fait** : résumés par retrait + journal `.cache/logs/` (`scripts/lib/log.mjs`, `scripts/lib/hfreport.mjs`, `hfCompact` dans `sd.mjs`) ; `--verbose` ; `check` qui se souvient (empreinte de ce que la page charge, seulement les contrôles réussis) ; `qa` et `script` condensés ; `look` à 270 px sans colonnes vides ; `render --out`, `review --out` ; `SD_NO_METRICS`.
- **Essayé, écarté** : 5 workers au rendu (plus lent), capture `look` à demi-échelle, `check --timeout 500` (même durée, même résultat JSON), cache du `build` (0,12 s).
- **Preuve** : brouillon du 025 rendu avant / après identique à l'octet ; `gen/` et `index.html` identiques (sha1). Le JSON de `check` est identique entre deux réglages.
- **Non touché** : `voice` (sa table est la décision, et il touche aux crédits), `metrics`, `front`, `sfx`, `posts`, `social`, le kit.
- Trois lignes de mes premières mesures (build, voice, check du 025, 12 h 49 UTC) sont entrées dans `metrics/commandes.jsonl` avant que j'ajoute `SD_NO_METRICS` : laissées telles quelles (consigne : ne pas modifier `metrics/`).
- `npm run lint` n'existe pas dans `package.json` (seul `node scripts/sd.mjs lint` marche) : ajouté.

# Passe « opti » du 27/10 — la chaîne d'agents d'un dossier

Agent de l'équipe des quatre (les autres : `CLAUDE.md` + `docs/memoire/`, `scripts/` + `kit/`, `docs/catalogue*`). Périmètre : `.claude/agents/`, `docs/chaine-optimisee.md`, `docs/recette-*.md`. Aucun agent lancé, aucun commit, aucun crédit.

## Mesuré

- `metrics/production.json` agrégé par genre (84 actes, 58 décors, 10 architectes, 28 faits, 11 contre-vérifications) : tableau dans `docs/chaine-optimisee.md` § 1.
- Le chiffre d'une notification de fin d'agent est la taille de son contexte à la fin (reprise du c1 du L04 : 0,42 → 0,46 M) : les « 13 à 23 k » par reprise du L01 ne comptaient que l'ajout ; une reprise relit ≈ 0,4 M à chaque appel. Les 0,69 M du 026 et les 4,3 M du L04 le confirment.
- Une planche `look` est un seul fichier (≈ 1,6 k jetons) : les images pèsent ≈ 6 k sur un agent de 400 k. Les planches de relecture de 28 vignettes (4 596 px) sont réduites à ≈ 110 px par vignette avant lecture.
- `CLAUDE.md` (211 Ko ≈ 60 k jetons) était chargé dans chaque agent ; ramené à 32 Ko par l'agent du contexte pendant cette passe.
- Les consignes réécrites à la main de nuit en nuit (`scratchpad/consigne-{faits,contre,architecte,decor,acte}.md`, 21/10) ont servi de base aux définitions.

## Fait

- `.claude/agents/` : `faits`, `contre-verif` (sonnet, effort medium), `architecte`, `decor`, `decorateur`, `acte`, `chapitre`, `retoucheur` (nouveau : la retouche par un agent neuf), `chef-de-production` (modèle de la session). Pas de champ `tools` : on ne sait pas si une liste restreinte garde l'outil de remise du rapport ; « pas de sous-agent » est dans le texte.
- `promo.md` aligné (renvois vers `docs/memoire/` et `docs/chaine-optimisee.md`, plus de « CLAUDE.md en entier »).
- `docs/recette-agents.md` : les types, `regles-image.md` au lieu des sections de `CLAUDE.md`, 45 → 30 images (ce que disait déjà `CLAUDE.md`), le catalogue, une section « Économie de contexte ». `docs/recette-actes.md` : le type, l'API du kit par `grep`. `docs/recette-long.md` : la mesure qui dément « 13 à 23 k par reprise ». Aucune règle de fond retirée ; sauvegarde d'avant : `.cache/sauvegardes/opti-2026-10-27/`.
- `docs/chaine-optimisee.md` : la chaîne d'un court et d'un long, les leviers chiffrés, avant / après.

## À vérifier au premier lancement

- Que les nouveaux types apparaissent dans l'outil `Agent` (sinon : relancer la session).
- Le chef de production sur le 031 : jetons par rôle (`npm run chrono … agent`), points de fenêtre, durée — contre l'estimation (≈ 3,1 M, une fenêtre, ≈ 2 h 15).
- `CLAUDE.md` (agent du contexte) dit encore « une reprise se fait par `SendMessage` … ou un agent neuf » : à faire pointer vers le type `retoucheur`.

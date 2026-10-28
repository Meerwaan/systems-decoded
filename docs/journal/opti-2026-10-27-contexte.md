# Optimisation du contexte — 27/10

Le but : `CLAUDE.md` est chargé dans chaque conversation et dans chaque sous-agent, à chaque appel. Il faisait 211 Ko (≈ 59 000 jetons) ; il en fait maintenant 30 Ko (≈ 8 300 jetons).

- **Ce qui reste dans `CLAUDE.md`** : les règles en vigueur (accroche ABC, structure, « Alors… on l'ouvre », ordre de la fin et CTA, exactitude, patte, zones TikTok, commandes, ordre de travail, chaîne économe, script, voix et crédits, image en bref, livraison, format long en bref, promos) et un index « pour X, lire Y ». Les formulations des règles sont reprises du texte d'origine, resserrées.
- **Ce qui est parti dans `docs/memoire/`**, recopié tel quel par plages de lignes (`split.mjs`, hors dépôt) : treize fichiers thématiques, plus la copie intégrale `CLAUDE-complet-2026-10-27.md`. Chaque fichier commence par une ligne « Pour : … » qui dit quand le lire.
- **Vérification** (`verifie.mjs`, hors dépôt) : l'ancien fichier découpé en 1 164 phrases ; 1 164 retrouvées mot pour mot dans le nouveau `CLAUDE.md` ou dans `docs/memoire/*.md` (hors copie intégrale). Rien de perdu ; rien de fusionné.
- **Deux ajouts de forme** dans `CLAUDE.md`, tirés de l'historique : « sur les 021 à 030, le verdict `MÊME TON PARTOUT` a été laissé à l'oreille de Merwan » (sinon la règle et la pratique se contredisaient), et le compte TikTok des exports (@hors.ligne_mw).
- **Pointeurs vers les autres chantiers du jour** : `docs/catalogue*` (catalogue des décors, en cours par un autre agent) et les recettes `docs/recette-*.md`.
- Non touché : la mémoire automatique (voir le rapport : elle double plusieurs règles de `CLAUDE.md`).

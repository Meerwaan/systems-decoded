# 021 · Veille du TGV — journal de l'architecte

2026-10-17. Contrat du dossier 021 (VACMA) : plan, monde, bouchons, page, repères, plans des décors et des actes.

## Fait
- Lu : CLAUDE.md, recettes (agents, actes, décorateur), faits 021 et contre-vérification, le dossier 023 (modèle), 022-actes-maj.
- Voix réelle : 93,43 s. Table des mots tirée par un petit script hors dépôt (scratchpad/021/words.mjs).
- Modèle repris : `kit/template/` recopié (index.html, src/*) avec le remplissage de `npm run new` (scratchpad/021/refresh.mjs), puis réécrit dans la forme du 023.
- `src/plan.js` : une seule échelle (la vraie) ; repère du train, nez −x, flanc gauche +z, rail y 0 ; l'autre voie et les poteaux à −z (on roule à gauche : rien de haut entre la caméra et le train). Système à la charnière de la pédale, dans l'espace des genoux sous le pupitre (x −800).
- `src/world.js` : SET LINE / BENCH ; `run` (mètres, défilement) + `kmh` ; `FIRST` fermé (27 nombres + lumière) ; `VIEW` (21 poses, réglées sur bouchons) ; `BENCHED` ne touche pas `kmh` (l'en-tête lit le train sur l'établi) ; `brakedOf` (distance lue sur la vitesse, décélération constante).
- `src/main.js` : en-tête = vitesse (signal tant que `kmh` > 0, l'établi compris) + « Freinage » (« — » puis 0 → 2 320 m) ; après `toloop` il lit `FIRST`.
- Bouchons : `model.js` (pédale, touches couchées, boîtier + cadran en `setDrawRange`, sonnerie, relais, valve, chaussure) et `train.js` (motrice, cabine, siège, pupitre, remorques, 393 têtes instanciées, toi, conduite, bogies, rails, grille, poteaux qui bouclent sur `run`).
- `index.html` : 16 étiquettes + retitle (« Elle surveille / Le conducteur → Un geste »), cta « NON », next 022 ; pas de `#film` (comme le 023).
- `episode.json` : 73 repères (tous vérifiés mot à mot sur la table de `npm run script`), `cover` (eclate$, el 28, shift −460), sfx : deux `beeps` (les sonneries), `clack` (le relais), `hiss` (l'air), `blip` (la radio). Ni `text` ni `vo` touchés (la table dit toujours « timing voix réelle »).
- `npm run check -- 021` passe (0 erreur ; deux avertissements de shader du moteur, un « canvas à bord »).

## Planches (16 images lues sur 30)
1. Bouchons, 8 poses de `VIEW` : le cadrage tient ; le pupitre bouchon (opaque) masque la pédale de `VIEW.system` — le vrai pupitre est de verre, avec l'espace des genoux ouvert. Correction : pédale déplacée sous le pupitre (x −760 → −800), touches couchées vers le haut (de face elles tournaient le dos à la caméra et à la clé), cadran sur la face +z.
2. Les quatre candidates (a nez, b cabine, c rame, d ras du rail) + système, dos du siège, établi, couverture : sur bouchons, (c) n'est qu'un trait à 16 000 → la rapprocher (9 000, `el` 25). Le cadran se lit gros et franc sur l'établi : bon signe pour en faire le héros.

## Décisions de tact
- Personne dans la cabine, jamais ; la porte du fond fermée ; aucune porte latérale ouverte. « Le conducteur tombe du train » = plan tenu sur la vitre vide.
- « Un corps effondré… peut appuyer encore » : une chaussure de verre, sur l'établi, qui devient un poids mort (repli : un bloc de verre neutre).
- L'angle mort du commentaire se montre sur le cadran (un secteur que l'anneau traverse sans réagir), jamais par un conducteur qui s'endort.

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` qui imprime l'instant de chaque mot (j'ai dû écrire scratchpad/021/words.mjs) — les repères se vérifient mot à mot, les architectes en ont besoin à chaque dossier.
- `CLAUDE.md`, section « Dossiers » : une ligne pour le 021 (contrat écrit le 17/10, voix réelle 93,4 s, décors à lancer : `model.js`, `train.js`).
- Après les décors : `docs/021-actes-maj.md` (poses vues, défauts) et `POSE0` choisi sur la planche des quatre, collé dans `world.js`.
- Décorateur (si on le passe) : `train.js` seulement — la nuit de Seine-et-Marne (quelques lumières de fermes au loin, une route, la ligne de crête), jamais rien entre la caméra et le train, rien sur la cabine.

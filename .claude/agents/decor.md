---
name: decor
description: Modélise UN fichier de décor ou le système d'un dossier de Système Décodé (court ou long), contre le bouchon et l'API posés par l'architecte, en parallèle des autres décors. À lancer après l'architecte, un agent par fichier de src/ ; la consigne donne le dossier et le fichier.
model: inherit
---

# Tu modélises un fichier de décor (ou le système)

D'autres agents modélisent les autres fichiers en même temps que toi, contre les bouchons de l'architecte. Modèle de la session : c'est la 3D « digne d'un studio » qui se joue ici — une image seulement « correcte » se refait.

## Ta consigne te donne

Le dossier (`031`, `L05`), ton fichier (`src/camion.js`), parfois deux ou trois lignes propres au dossier. Tout le reste est dans les fichiers ci-dessous. Dossier temporaire : celui de la consigne, sinon `.cache/planches/<ep>/<ton fichier sans .js>/`.

## À lire, dans cet ordre, et rien d'autre

`CLAUDE.md` est déjà dans ton contexte (« Notre patte ») : ne le relis pas.
1. `docs/recette-agents.md` EN ENTIER (cadre, règles qui ne se discutent pas, regarder, première image, options du plateau, économie de contexte, ce que tu rends).
2. `docs/memoire/regles-image.md` (« Pour que ça ne fasse jamais amateur », « Net et fluide » : chaque règle vient d'une image ratée).
3. `docs/<ep>-decors.md` : le haut, puis **TA section seulement** (ce qu'il faut construire, l'API, les nombres, la liste fermée des images à réussir, ce que tu réutilises).
4. `docs/catalogue.md` à la ligne de ce que ta section dit de réutiliser ; puis ce fichier-là : son API et ses options (`grep -n "^export"`, commentaire de tête), et seulement les fonctions que tu reprends.
5. Le contrat : `src/plan.js`, `src/world.js` (`FIRST`, `apply()` : comment ton fichier est appelé) ; ton bouchon (son API est le contrat : garde exports et signature).
6. Du kit, l'API : `kit/lib/build3d.js`, `kit/lib/atmo.js`, `kit/lib/figure.js` s'il y a un personnage, `kit/lib/usine.js` / `postes.js` pour une machine de long (catalogues `docs/journal/L01-usine.md`, `L01-postes.md` — réglés autrement, jamais un gabarit).
7. Le dossier de faits, section « À ne pas dire », si tu dessines un chiffre ou un texte.

**Long** : `docs/recette-long-image.md` § 3 en plus ; vignettes 16:9 (`look` les fait à 640 px sur trois colonnes).

## Le cadre

Tu n'écris que dans ton fichier et dans ton journal `docs/journal/<ep>-<ton fichier sans .js>.md`, tenu au fur et à mesure (une coupure de fenêtre ne doit rien perdre). Ce qui doit changer ailleurs (`plan.js`, `world.js`, le kit) s'écrit dans le journal sous **« À changer ailleurs »**, ligne exacte : le chef de production l'applique. **30 images lues au plus** (une vignette compte pour une), **45 appels d'outils visés**. Écris ton fichier en une à trois fois, puis corrige par `Edit` (une réécriture complète d'un fichier de 60 Ko reste 17 k jetons de plus dans ton contexte). Pas de sous-agent. Si le build casse dans un fichier qui n'est pas le tien, attends trente secondes et relance. `npm run check -- <ep>` doit construire à la fin.

## La barre

Le niveau du dernier épisode rendu, au-dessus. On distingue tout, tout de suite (une vignette de 270 px se lit). Le système plein, trois valeurs de gris, arêtes fines, `metal` ≤ 0,5 ; ce qui l'entoure aux rayons X (`glass` + `asShell`, traits fins, pas de sol plein : une grille). Trois couleurs qui ont un sens (`ink`, `veille`, `signal`). Tout dépend de `time` et de l'état ; rien n'est alloué dans `update` (appelé seize fois par image).

## Ton message final, quinze lignes au plus

Ce qui est construit ; chaque nombre de l'état et ce qu'il fait chez toi ; les poses qui cadrent le mieux (renvoi au journal si elles sont longues) ; ce qui n'est pas encore au niveau, dit franchement ; « À changer ailleurs » (les lignes exactes, ou « voir journal, N lignes ») ; une ligne pour `docs/catalogue.md` si ton décor peut resservir (ce qu'il est, ses options) ; tes images lues.

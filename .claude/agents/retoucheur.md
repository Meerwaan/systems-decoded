---
name: retoucheur
description: Agent NEUF qui corrige des plans précis dans UN fichier déjà monté d'un dossier de Système Décodé (acte, chapitre ou décor) — images parasites, mouvements heurtés, plages immobiles, plans faibles relevés par qa ou par la relecture — sans relire tout le dossier. À préférer à une reprise par SendMessage dès que la retouche demande plus de trois appels.
model: inherit
---

# Tu retouches un fichier déjà monté

Un autre agent a monté ce fichier ; il n'est plus là. Tu as **sa liste de défauts, son fichier et son journal** : c'est tout ce qu'il te faut. Pourquoi un agent neuf : une reprise par `SendMessage` relit à chaque appel tout le contexte de l'agent d'origine (≈ 0,4 M de jetons) — la reprise d'un acte du 026, 19 appels, a coûté 0,69 M ; les neuf du L04, 4,3 M. Toi, tu pars d'un contexte léger : reste léger.

## Ta consigne te donne

Le dossier, le fichier, et **la liste fermée des défauts** avec leurs instants (sortie de `qa` ou ligne de la relecture : « image parasite à 146,23 s », « heurté 315,1 », « plan de 19 s 358,1 → 377 », « 187,5 : avion minuscule dans le noir »). Dossier temporaire : celui de la consigne, sinon `.cache/planches/<ep>/<fichier>-retouche/`.

## À lire, et rien d'autre

`CLAUDE.md` est déjà dans ton contexte : ne le relis pas.
1. Le journal de l'agent d'origine, `docs/journal/<ep>-<fichier>.md` : les poses qui cadrent, ce que fait chaque nombre, ce qu'il a déjà dit faible, la couture rendue.
2. Ton fichier — en entier, une fois. Ne le relis pas après tes `Edit`.
3. Selon les défauts, une seule de ces références : `docs/memoire/regles-image.md` (« Net et fluide » pour une image parasite ou un mouvement heurté) ; `docs/recette-actes.md` (« La grille seconde par seconde ») pour un court ; `docs/recette-long.md` (« Les transitions », « Ce qui a raté ») pour un long.
4. Du contrat ou du kit, seulement la fonction ou la pose dont tu as besoin (`grep`).

## Comment tu corriges

- Un défaut, une correction locale par `Edit` : jamais réécrire le fichier, jamais changer la couture d'entrée ou de sortie (pose ET état), ni `POSE0` / `FIRST`, ni ce qui n'est pas dans ta liste.
- Les remèdes connus : un mouvement heurté ou un quart de tour en une seconde → une coupe nette (posée quelques images avant le mot) ou une poussée lente ; une image parasite → deux tweens du même nombre qui se chevauchent, une coupe qui remet un nombre qu'un tween emmène, un motif rayé traversé vite, un objet frôlé (le rendre invisible), un fondu `mix` qui ne tombe pas pile sur une image ; une plage immobile → un geste du sujet ou un changement de vue sur le mot ; un plan trop long → une coupe en raccord ; un sujet trop petit → resserrer jusqu'à la part du cadre écrite dans `docs/<ep>-actes.md`.
- **Vérifie chaque correction** sur une planche `look` aux instants du défaut, à ± 1/30 s pour une image parasite (deux images consécutives identiques ou en continuité).

## Le cadre

Tu n'écris que dans ton fichier et à la fin du journal d'origine, sous `## Retouche du <date>` (défaut → correction → vérifié à). **12 images lues au plus, 20 appels d'outils visés.** Ce qui doit changer ailleurs : « À changer ailleurs », ligne exacte. Pas de sous-agent, aucun commit. `npm run check -- <ep>` doit passer.

## Ton message final, huit lignes au plus

Pour chaque défaut : corrigé (comment, en dix mots) ou non (pourquoi) ; ce qui reste à voir sur le prochain brouillon ; « À changer ailleurs » ; tes images lues.

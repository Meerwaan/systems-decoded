---
name: decorateur
description: Donne aux décors aux rayons X d'un dossier de Système Décodé (court ou long) la vie qu'ils ont dans la réalité — trois à six touches dans src/habillage.js, jamais sur le système ni devant lui. À lancer après les décors et avant le choix de la première image ; jamais pour un décor réutilisé déjà habillé.
model: inherit
---

# Tu habilles les lieux d'un dossier

Tu donnes à un lieu **la vie qu'il a dans la réalité** — ce qu'on y pose, ce qui y éclaire, ce qui flotte dans son air, ce qu'on voit au loin — sans toucher au système, sans rien mettre devant lui, sans encombrer. Trois à six touches justes valent mieux que vingt accessoires.

## Ta consigne te donne

Le dossier, les fichiers de décor à habiller (jamais le système), parfois une ou deux lignes. Ton fichier : `episodes/<dossier>/src/habillage.js` ; ton journal : `docs/journal/<ep>-habillage.md` ; dossier temporaire : celui de la consigne, sinon `.cache/planches/<ep>/habillage/`.

## À lire, et rien d'autre

`CLAUDE.md` est déjà dans ton contexte : ne le relis pas.
1. `docs/recette-decorateur.md` EN ENTIER : c'est ta recette (ce que tu as le droit de toucher — **quatre lignes au plus** dans le décor —, les garde-fous, le catalogue, comment travailler, la première image d'abord, ce que tu rends). Elle complète `docs/recette-agents.md` : lis-en « Le cadre », « La première image », « Économie de contexte ».
2. `docs/memoire/regles-image.md`.
3. `docs/<ep>-actes.md` : le haut, la liste des plans et les candidates de la première image — c'est d'elle que tu tires tes instants.
4. `src/plan.js`, `src/world.js` (`FIRST`, `POSE0`, `VIEW`) en lecture ; les journaux des décors que tu habilles (`docs/journal/<ep>-<décor>.md` : poses qui cadrent, nombres).
5. `kit/lib/details.js` : le catalogue (son en-tête et ses exports d'abord).

## Le cadre

**24 images lues au plus**, **30 appels d'outils visés** (le décorateur du 026 en a fait 102 pour 0,51 M : la recette vise 150 à 250 k sur un court). Une planche avant, une planche après aux mêmes instants (l'image 0 jugée à 270 px à côté de celle d'avant : au moins aussi forte, sinon on retire), une reprise au plus. Pas de sous-agent. `npm run check -- <ep>` doit construire.

## Ton message final, dix lignes au plus

Les touches posées et leur raison ; le nombre de l'état que chacune suit ; « À changer ailleurs » (lignes exactes : les lignes d'accroche dans le décor si tu ne les as pas posées, un nombre d'état, l'air d'une lampe) ; ce qui n'est pas au niveau ; le chemin de ta planche avant / après ; tes images lues ; une ligne pour `docs/catalogue.md` si une brique peut resservir.

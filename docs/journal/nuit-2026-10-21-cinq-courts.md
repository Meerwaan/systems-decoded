# Nuit du 21/10 — cinq courts d'avance (026 → 030)

Chef de production : un agent lancé par la conversation principale, vers 6 h 30. Consigne de Merwan avant d'aller dormir : « lance aussi 5 courts d'avance », puis « tu peux lancer les voix, t'inquiète, je te fais confiance avec les vérifs, et attention à pas couper les voix ». Il dormait : j'ai validé moi-même chaque accroche (A·B·C, `docs/recette-script.md`) et enregistré les voix.

**Résultat : un film fini (026), quatre dossiers dont la voix est enregistrée (027 à 030), et le 027 dont les décors sont faits.** La fabrication s'est arrêtée deux fois sur la limite de la fenêtre de 5 h (vers 8 h 30 et vers 14 h), puis au seuil de 70 % d'hebdomadaire fixé par la conversation principale.

## L'état de chaque dossier

| | fait | reste |
| --- | --- | --- |
| **026 — Soyouz MS-10** | **fini** : `renders/026-soyouz-ms10.mp4` (91,1 s), `-iphone.mp4` (29,0 Mio, SSIM 0,994), `-couverture.png`, textes Instagram / YouTube | l'écoute et la publication par Merwan |
| **027 — voie de détresse** | faits, contre-vérification, script (253 mots), voix (86,1 s), architecte, trois décors (`model.js` la voie et la roue, `camion.js` le 40 t de verre, `col.js` la descente de nuit), leurs poses intégrées dans `world.js` et `plan.js`, `check` passe, textes Instagram / YouTube | le décorateur (`col.js` seulement), la première image sur planche, les quatre actes, relecture, reprises, brouillon, `qa`, rendu, couverture, copie téléphone |
| **028 — détecteur de CO** | faits, contre-vérification, script (239 mots), voix (85,7 s), textes Instagram / YouTube | toute la 3D (architecte d'abord ; la maison et la cuisine des 008, 009, 012 sont à réutiliser) |
| **029 — airbag d'avalanche** | faits, contre-vérification, script (247 mots), voix (83,8 s), textes | toute la 3D (la pente et la neige à construire ; le personnage de verre existe, `kit/lib/figure.js`) |
| **030 — prise de terre** | faits, contre-vérification, script (247 mots), voix (83,3 s), textes | toute la 3D (la pièce et le tableau des 004, 016, 024 à réutiliser) ; son annonce finale est un rendez-vous (« Prochain dossier : classé ») : le 031 n'est pas choisi |

Les `src/` des 028 à 030 sont ceux du modèle actuel (`npm run new` du 21/10) ; ceux du 027 sont de l'architecte et des décors.

### Ce que la prochaine session reprend pour le 027

- Lire `docs/027-decors.md`, `docs/027-actes.md` et les journaux `docs/journal/027-*.md` (architecte, model, camion, col). Les « À changer ailleurs » des trois décors sont **déjà appliqués** (poses `side`, `entry`, `bedWide`, `colTop`, `panelBench`, `demo`, `section`, `drumTop`, `demoTop` ; `kmh` passé au système dans `apply()` ; `EDGE` tel que `col.js` le dessine ; `YOU.pedal` à −54).
- **La première image n'est pas choisie.** Candidates : (a) les tambours (le `POSE0` provisoire de l'architecte), et la pose du camion de dos, à 42 cm du sol, feux stop et tambours rouges, 75 % de la largeur (`frame(road(0, 42, 2250), road(0, 160, 600), { fov: 46, shift: 110 })`, journal `027-camion.md`). Dans `look`, une pose prise sur le camion s'écrit en absolu : ajouter `travel(s)` (table dans `docs/027-decors.md`). Point faible connu : à l'image 0, la voie au loin n'est qu'un point vert, et le ravin ne se lit que vu de 9 m.
- Points faibles signalés par les décors : la couverture n'est pas trouvée (`model.js`) ; sans `kmh`, les sculptures et les trous de jante feront de l'effet stroboscopique dès que la roue tourne ; le gros plan du tambour-héros n'a jamais été vu avec le camion autour.
- Agents qui ont monté ses fichiers (leur travail est gardé, à reprendre par `SendMessage` s'il faut retoucher leur fichier — attention, un agent repris relit tout son contexte : voir plus bas) : architecte `a1a54f595c82e91ef`, `model.js` `a5e26d45d6a2215b1`, `camion.js` `a7aa013ab7ab1c79e`, `col.js` `a938593c01f2b8157`.

### Les voix (une prise `eleven_v4_turbo` d'une seule requête chacune, direction des 021 à 025)

| | annoncés | facturés | durée | « Alors… on l'ouvre » | à faire entendre à Merwan |
| --- | --- | --- | --- | --- | --- |
| 026 | 939 | 413 | 91,1 s | 1,14 s, pause 0,22 s | la boucle dite un peu vite ; « tu remontes… ou plus jamais ? » retombe (normal pour une alternative) |
| 027 | 882 + 2 reprises | 388 + 80 + 81 = 549 | 86,1 s | prise d'origine gardée : 1,15 s, pause 0,16 s, un peu grave (−3,5 dt) | les deux reprises de « on l'ouvre » étaient pires (1,92 s ; 1,31 s très grave) |
| 028 | 829 + 2 reprises | 365 + 77 + 77 = 519 | 85,7 s | prise d'origine gardée : 1,15 s, pause 0,19 s, plate | reprises pires (1,63 s ; 1,31 s plate) |
| 029 | 837 + 3 reprises | 368 + 69 + 145 = 582 | 83,8 s | **reprise 1 montée** (`audio/picks.json`) : 1,23 s, pause 0,12 s — la prise d'origine (1,52 s, pause 0,33 s) dépassait le seuil de 1,5 s | la pause est courte |
| 030 | 831 | 366 | 83,3 s | 1,22 s, pause 0,31 s | — |

**2 429 crédits facturés** pour les cinq (≈ 486 par court). Solde ElevenLabs : 115 790 à 6 h 30, 110 809 à 7 h 39 (≈ 2 550 de la différence sont la voix du L03, enregistrée par la conversation principale).

Vérifié sur chaque voix (`scratchpad/nuit/verif-voix.mjs`, mesure sur l'audio et pas seulement sur l'alignement) : chaque mot aligné, aucune coupe posée sur de la voix (−60 à −94 dBFS aux coupes), la voix s'arrête au moins 0,16 s avant chaque coupe, la fin du dernier mot entière dans `voix.wav`. Leçon : l'alignement d'ElevenLabs peut placer la fin du dernier mot d'une phrase après la coupe alors que la voix est déjà finie (029, toute la prise) — c'est l'énergie de l'audio qu'il faut mesurer, pas l'horodatage. Les cinq courbes de tension disent « même ton partout », comme les 021 à 025.

**« Alors… on l'ouvre » en reprise** : le turbo, sur une requête courte (la scène, la phrase, l'éclaté), donne soit pas de pause, soit une phrase qui traîne. `[short pause]` la fait traîner (1,63 à 1,92 s) ; sans lui, la pause n'est pas jouée (0,09 à 0,19 s). Huit reprises sur trois films, une seule retenue. La prise entière reste la meilleure source, comme le disait la recette.

### Les scripts

Écrits par moi d'après les faits (générateur `scratchpad/nuit/gen-script.mjs` et un fichier de données par dossier), validés sur la recette du 21/10 (mot-choc avant 3 s : 1,0 à 2,1 s estimés ; scène de 22 à 30 mots ; question à deux camps ; légende qui ouvre sur le mot cherché), `npm run script` sans avertissement (sauf le 028 à 239 mots : film de 85,7 s). Les contre-vérifications ont fait changer 4 à 7 phrases par script — entre autres : 027, « un mur » → « une glissière », « Un panneau, un kilomètre avant » (valeur du seul projet de Laffrey) → « bien avant », la chute « elle ne freine pas ton camion » (littéralement faux) → « cette voie n'a aucun frein » ; 028, « à cette dose » → « à faible concentration », la chute « quand tu en as trop respiré » → « il compte ta dose… et sonne avant qu'elle soit dangereuse » ; 029, « deux ballons » → « un ballon » (seul ABS en a deux), « ta tête sort à la surface » → « tu remontes vers la surface » ; 030, « le hublot » (en verre) → « le capot », « sous les fondations » → « autour des fondations ».

## Le 026, de la voix au film

Architecte → trois décors (`model.js`, `launcher.js`, `sky.js`) → première image choisie sur deux planches (la fusée vue d'en dessous, la tête en zone haute ; `FIRST` : `sep` 0,25, `bad` 0,4) → décorateur (la steppe, le pas de tir la nuit, le teaser ; image 0 inchangée) → quatre actes en parallèle → deux planches de 28 → brouillon et `qa` → neuf sons centrés sur un mot replacés (un `swish` est centré sur son instant : `mot$+0,02` le pose à moitié sur le mot, il faut `mot$` + 0,02 + sa demi-durée) → une reprise de l'acte 1 (première demi-seconde 1,1 → 1,9 ; la frappe et la secousse lisibles ; une image parasite à 15,00 s apparue en cours de reprise et corrigée) → rendu, `qa`, couverture, copie téléphone, textes.

## Le coût

- **Jetons d'agents ≈ 9,6 M** : faits ×4 0,88 M et contre-vérifications ×4 0,77 M (modèle léger) ; architectes 026 et 027 1,20 M ; décors du 026 1,64 M et du 027 1,87 M ; décorateur du 026 0,51 M ; actes du 026 2,04 M ; reprise de l'acte 1 0,69 M. Chaque agent de la session a coûté 500 à 670 k jetons (les nuits précédentes : 300 à 490 k).
- **Temps** : 6 h 30 → 17 h 30, dont deux coupures (≈ 8 h 30 → 12 h et ≈ 14 h → 17 h). Le 026 a demandé ≈ 4 h de travail effectif hors attente.
- **Crédits** : 2 429.
- **Jauge** : fenêtre de 5 h 83 % à 6 h 30 (remise à zéro à 7 h) ; 33 % à 7 h 40 → 91 % à 8 h 40 → coupure ; 3 % à 12 h 01 → 37 % à 12 h 35 → 85 % à 13 h 11 → 89 % à 13 h 25 → coupure vers 14 h ; 3 % à 17 h → 10 % à 17 h 20. Hebdomadaire : 42 % à 6 h 30 → 48 % à 7 h 40 → 56 % à 8 h 40 → 58 % à 12 h → 62 % à 12 h 35 → 69 % à 13 h 11 → 71 % à 17 h → **72 % à la fin**.

## Ce que la double coupure apprend sur le rythme des vagues

1. **Une vague se mesure à ce qu'elle consommera, pas à la jauge du moment.** Les deux coupures viennent d'agents lancés sous le seuil qui ont continué : quatre agents de la session ont fait passer la fenêtre de 33 à 91 % en une heure (avec la voix du L03 en même temps) ; sept agents, de 37 à 85 % en 36 minutes. Mesuré : **≈ 8 à 9 points de fenêtre par agent et par heure**, ≈ 13 à 14 points par million de jetons.
2. **Un dossier entier ne tient plus dans une fenêtre.** Architecte, trois décors, décorateur, quatre actes et une reprise ≈ 6 M de jetons ≈ 80 points de fenêtre. Rythme qui tient : une fenêtre pour architecte + décors + décorateur d'un dossier, la suivante pour ses actes, sa relecture et son rendu — et jamais plus de quatre agents de la session à la fois. La règle donnée à midi (une vague seulement sous 55 %, deux dossiers en 3D au plus) est juste ; ce qu'elle ne dit pas : une vague lancée à 3 % avec sept agents dépasse quand même 85 % avant de finir.
3. **Une reprise par `SendMessage` coûte le contexte de l'agent, pas la taille de la retouche** : la reprise de l'acte 1 (19 appels, 5 minutes de travail) a coûté 0,69 M de jetons, parce que l'agent relit à chaque appel ses ≈ 400 k jetons de contexte. Pour une petite retouche sur un agent qui a déjà beaucoup travaillé, un agent neuf avec une consigne précise de dix lignes peut coûter cinq fois moins.
4. **L'hebdomadaire est le vrai plafond** : +30 points pour ≈ 9,6 M de jetons d'agents et la conversation principale (scripts et voix des L03 et L04). À ce prix, un court entier coûte ≈ 6 à 8 points d'hebdo : la semaine en porte une dizaine, pas vingt.
5. **Ce qu'il faut regarder entre deux vagues** : `get_usage` avant chaque lancement, et le nombre d'agents encore en vol × 8 points par heure. Un agent coupé par la limite garde son travail : le relancer après la remise à zéro par `SendMessage` (le 026 n'a rien perdu aux deux coupures).
6. Outils écrits pour la nuit, dans `scratchpad/nuit/` : `verif-voix.mjs` (rien de coupé, mesuré sur l'audio), `gen-script.mjs` (un script depuis un fichier de données, mots affichés contre mots dits), `attendre.mjs` (attendre la fin d'un agent : sa transcription contient un appel de remise de plus qu'au départ — la taille du fichier ne suffit pas, il est écrit en continu), et les consignes communes (faits, contre-vérification, architecte, décor).

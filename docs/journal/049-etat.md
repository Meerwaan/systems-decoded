# 049 — Le GPS : état (chef de production)

Consigne : de l'architecte au rendu final ; voix faite ; aucun crédit ElevenLabs ; seulement les fichiers du 049 ; pas de commit ; 4 agents à la fois au plus.

## 13/11 ≈ 22 h 45 — départ
- Jauge : fenêtre 4 % (remise à zéro 14/11 04 h 40), hebdo 18 %.
- Fait : script, voix (`audio/voix.wav`, `vo.json`, `bed.wav`). `chrono decors` déjà lancé par la conversation.
- En cours : architecte.

## 14/11 ≈ 23 h 10 — architecte rendu (a09ec7b2d4154580a, 0,32 M, 27 min)
- Contrat posé, check passe. 3 décors : route.js (enveloppe du 025), model.js (téléphone), satellite.js. Première image : candidates `.cache/planches/049/premiere-image.json` (A recommandée).
- Décision du chef : le point bleu reste bleu (#3B8CFF, sur le point seul) — la voix dit « ton point bleu ».
- Jauge 31 % / hebdo 22 %. Lancé : vague décors × 3.

## 14/11 ≈ 23 h 30 — décors rendus
- route adb2947c06d6cac50 (0,25 M, 14 min), model aa6f667d0ca20afb5 (0,23 M), satellite a8d2a20b52fc16e2b (0,25 M). « À changer ailleurs » appliqués (VIEW chase/climax/sign/branches/exploded/chip/quartzBench/up/satSky/satBench/clocks ; plan STREAK). check passe.
- Notes des décors : anneaux faibles en plan `high` (rings 0 conseillé) ; carrefour ne frappe qu'à eta ≤ 2 ; climax d 7000 non revu ; POSE0 satellite hors cadre sauf variante « hook » du journal satellite.
- Lancé : decorateur.

## 14/11 ≈ 23 h 45 — habillage + première image
- decorateur ad6f414233cd991ae (0,21 M, 7 min) : fermes, village, lunettes ; rien à changer ailleurs.
- Première image : A (sous le téléphone), planche `.cache/planches/049/image0.jpg` ; POSE0 inchangé. `docs/049-actes-maj.md` écrit.
- Vague actes NON lancée : jauge 89 % (hebdo 29 %), au-dessus de 85 %.

## EN FILE — reprise à 04 h 40 (14/11, remise à zéro de la fenêtre)
Reste, dans l'ordre : `chrono actes` → vague `acte` × 4 (acte1, acte2, acte3, fin ; consigne : dossier, fichier, « lire docs/049-actes-maj.md ») → leurs « À changer ailleurs » → `monteur-son` → relecture (4 planches de 8 à 270 px) → check → render --draft + qa --file → une vague `retoucheur` → render → qa → cover → phone → `node scripts/posts.mjs`.
Agents rendus : architecte a09ec7b2d4154580a · décors adb2947c06d6cac50 (route), aa6f667d0ca20afb5 (model), a8d2a20b52fc16e2b (satellite) · decorateur ad6f414233cd991ae. Aucun en vol. Jetons d'agents du dossier : 1,26 M.
Points à surveiller à la relecture : `climax` d 7000 non revu ; dernière retouche de l'habillage non revue ; étincelle d'arrivée des anneaux (hook) non revue ; reflet orangé coin haut-droit du téléphone.

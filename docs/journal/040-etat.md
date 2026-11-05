# 040 abri anti-feu — état (chef de production)

Consigne : de l'architecte au film rendu. Voix faite (turbo, 88,067 s, `ouvre~3`), ne pas toucher à la voix ni dépenser de crédits. « MÊME TON PARTOUT » laissé à Merwan.

## Fait
- 05/11 22:57 : chrono `decors` lancé ; jauge 84 % / hebdo 69 % (remise à zéro 23 h) → attente de la remise à zéro avant l'architecte.

## En vol

## Reste
architecte → décors → décorateur → image 0 → actes-maj → actes ×4 → relecture → check → brouillon + qa → retouches → render → qa → cover → phone → posts.mjs
- 23:22 architecte a05d63ba460a438a8 rendu (0,33 M) ; décors model a7252d97812d4299d (0,29 M), crete a83b5789a84641327 (0,27 M), feu a188654c61e42a3e9 (0,27 M) rendus.
- « À changer ailleurs » appliqués : VIEW (crest, canyon, back, section compromis, inside, mouth, packBench, foilClose, shovelClose, *Close d 330), #hud-shade dans index.html. Kit/scripts (chip--live, script --words, catalogue) : NON faits (hors périmètre).
- Image 0 = candidate C (POSE0 collé, front -6, heat 0.4) ; boucle 88,0 identique. docs/040-actes-maj.md écrit.
- Défauts connus pour la retouche : pavés roses de la feuille chauffée en gros plan (model) ; canyon/zeroWide (crete/feu) ; flammes en aplats orange.
- Jauge 23:45 : 14 % / hebdo 71 %. Suite : decorateur (crete.js) puis actes ×4.
- decorateur ae305af05350eaac6 rendu (0,26 M, 3 touches, image 0 inchangée). Actes ×4 lancés.
- actes rendus : acte1 ad7bf2629749fb1be, acte2 a08ed41d92a77843d, acte3 a3274f6746f3756ae, fin a88a07d28de69f2b7 (0,22–0,23 M chacun). Relecture en cours.
- 00:15 relecture (5 planches .cache/planches/040/relecture/) ; check OK (1 avert. nav 24,46 s) ; brouillon + qa : voix calée 0 ms, −14,05 LUFS, 0 image parasite ; lent 4,0–7,5 s ; 1re demi-seconde 1,0 ; heurtés 28,8 / 18,9 / 63,7 / 43,7 / 57,6 / 87,5.
- 5 sons replacés à la main dans episode.json → sfx (secondes absolues ; le fichier a été réindenté par JSON.stringify).
- Vague de retouches lancée : retoucheur acte1, acte3, fin, model. acte2 (heurtés 18,9 / 28,8, pile hors cadre 25,4) en attente d'une 2e vague.
- retouches rendues : acte1 a6f43e8f5dad65ffb, acte3 a17c37ba441a17d94, fin a8d6212f75555558d, model a24877db365803f71 (0,17–0,19 M). Reste : retouche acte2 puis rendu.
- retouche acte2 a96577fc3fbc4314d rendue (0,19 M). Rendu final en cours.
- 00:50 FINI. Rendu final renders/040-abri-anti-feu.mp4 : voix calée 0 ms, −14,05 LUFS, 0 image parasite, aucune plage lente avant 25 s, 1re demi-seconde 2,3, aucun son sur un mot (2 swishes reculés à 3,32 et 80,22). Boucle vérifiée (0,0 = 88,03 = 88,06).
- Couverture refaite : cover.at « alu », pile éclatée sous le titre (cam d 820, shift −380). Copie téléphone, posts.mjs OK (040 y était déjà).
- Reste un cran en dessous : heurté 19,1 (10,8, reflets de la feuille à l'ouverture), 26,9 pile au bord droit, tête « boule » du mannequin, langue `lick` petite à 64 s, 4 et 6 s à ≈ 1,0 de mouvement.
- Non faits (hors périmètre) : kit chip--live, script --words, fiches catalogue (crete, feu, model), contraste nav 24,46 s (couleur du kit).
- Jauge fin : 40 % / hebdo 74 %. Jetons d'agents ≈ 3,55 M (architecte 0,33 · décors 0,83 · décorateur 0,26 · actes 0,90 · retouches 0,93).

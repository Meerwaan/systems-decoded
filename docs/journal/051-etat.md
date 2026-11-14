# 051 brise-glace — état (chef de production)

- 13/11 22 h 45 : départ, jauge 4 % / hebdo 18 %. Voix faite. Étape : architecte (en vol).
- Architecte rendu (a7c82e181662c39d3, 330 k). Sujet = navire brise-glace (pas le marteau). 3 décors neufs : model.js, glace.js, banquise.js. Actes : acte1, acte2, acte2b, acte3, fin. POSE0 provisoire (a). Sons 051-* absents de kit/sons (ne pas acheter sans Merwan).
- Jauge 28 % / 21 %. Vague décors × 3 lancée.
- Décors rendus : model a290c61daae6eda1b (311 k), glace a53eef6249525104a (291 k), banquise af8c2065b18da872c (352 k). « À changer ailleurs » TOUS appliqués (world.js VIEW/POSE0/FIRST bowWater+fx, plan.js SHOK.yaw 50 + RIDGE.ahead −5750, banquise.js fenêtre bowWater via uPatch.w, episode.json cover.cam). `check` passe.
- Première image choisie : (a6b), POSE0 el 6 d 10050 (planche .cache/planches/051/image0.jpg). docs/051-actes-maj.md écrit.
- ARRÊT jauge : fenêtre 96 % (autres sessions), hebdo 30 %. Remise à zéro 14/11 03:40 UTC.
- RESTE, dans l'ordre : decorateur (habillage.js, une vague seule) → re-planche image 0 si l'habillage la touche → acte × 4 (acte1, acte2, acte2b, acte3) puis fin (5 fichiers : deux vagues, ou fin avec la 2e) → monteur-son (banque existante, pas de sons 051-* achetés) → relecture 4 planches → check, render --draft, qa → retoucheur × 1 vague → render, qa, cover, phone, posts.mjs.
- Notes actes : acte1 anime close 0,55→0,85 jusqu'à « referme » ; bowWater 1 sur bowSide/principle ; top/deck/flank à vérifier.

# 046 torchère — état (chef de production)

Consigne : de l'architecte au brouillon + retouches ; rendu final seulement après confirmation que la voix est validée (« PRÊT POUR LE RENDU »). Ne pas toucher audio/. Monter sur les repères du script. Sortie sam. 14/11 20 h. Fin réécrite vers 047 lave-vaisselle (champs `voir`).

- 13/11 04:41 — départ. Jauge 33 % fenêtre, 89 % hebdo (remise à zéro 08:00). Candidat décor : CR02/plateforme.js (catalogue).
- Étape 1 : architecte lancé.
- 05:06 — architecte rendu (abda778c86d01c630, 359 k, 24 min). Pas de réutilisation (CR02 = noir chaud). 3 décors neufs : model.js, flamme.js, raffinerie.js (dont lave-vaisselle 047). Candidates image 0 : .cache/planches/046/premiere-image.json. Actes : acte1 0→19,50 · acte2 →48,46 · acte3 →64,65 · fin →91,97.
- 05:55 — décors rendus : model a1e74c19f2a4f4440 (322 k), flamme a8e7707f7e576f45a (261 k), raffinerie aec66903ceba184fa (319 k). À-changer appliqués (5 VIEW, FL préalloué, plan COMPRESSOR.motor). Buses pilotes déjà dans model.js.
- POSE0 choisi (« m », az 100) ; docs/046-actes-maj.md écrit. Étape suivante : decorateur, puis 4 actes.
- 05:44 — decorateur rendu (aedcaf7fd6cf675f4, 232 k) : lampes d'usine, lampadaires, manche à air ; image 0 inchangée. Jauge 52 % / hebdo 92 % (remise à zéro 08:00). Vague des 4 actes lancée.
- 05:56 — actes rendus : acte1 a2f0aef500763f5d6 (225 k), acte2 ad7ec3335c91db579 (254 k), acte3 ac9b233b6b7226a07 (238 k), fin a03b8e7b01edc2f0a (245 k). À-changer appliqués : main.js pilote ≥ 0,3 ; world.js flamme.group suit le bout soulevé ; model.js halo de contre-jour atténué avec la distance (0,85, 3500/3500 — vérifié : image 0 intacte, colonne blanche partie à 42,4).
- Relecture : .cache/planches/046/relecture/p1-p4.jpg + halo.jpg. check ✓ (0 erreur, 71/71). Brouillon rendu ; qa ✓ voix calée, 0 image parasite, −14,06 LUFS ; première demi-seconde 0,4, plage lente 0–2 s. `npm run camera` : > 90 °/s à 12, 20, 27, 29 (175), 41, 43, 44, 46 (182) ; plages fixes 83,3–86,8 et 88,9–90.
- 06:05 — EN FILE : hebdo 93 % (> 92). Reprise à 08:00 (remise à zéro fenêtre + hebdo).

## À la reprise (08:00)
Vague 1, 4 `retoucheur` (consignes prêtes) :
- acte1.js : (1) 0 → 2 s quasi fixe : la flamme enfle et la fumée monte franchement dès l'image 1, poussée caméra plus nette, image 0 = POSE0/FIRST inchangée ; (2) ≈ 12 s 104 °/s (compresseur → colonnes) : coupe ou < 90 °/s ; (3) 18,8 « Alors… » : pied de cheminée / garde blanc brûlé, pas sombre sur halo — régler `VIEW.foot` dans world.js (l'acte 2 part de cette pose par benchCut : le dire) ; (4) 8,3 « s'éteint » : descendre la pilote à 0,32 (seuil de l'en-tête passé à 0,3).
- acte2.js : (1) vitesses > 90 °/s à ≈ 20, 27, 29 (175, plongée vers la garde), 41, 43, 44, 46 (182, recul vers les colonnes) : coupes ou mouvements plus lents ; (2) 42,4 « Elle dort » : réseau minuscule, flamme invisible à 270 px → plan lisible de la torche qui dort ; (3) 23,9–25,2 ballon fermé noir qui remplit le cadre ; (4) vérifier l'étiquette « Collecteur » (la fin l'a vue à 75,5 et 84,6).
- acte3.js : (1) « enfle / gronde » (reponse:la#2) : flamme ≈ 30 % de la largeur au climax → ≥ 45 % ; (2) 63,5 « Rien n'a explosé » : flamme petite et pâle sur le plan large ; (3) facultatif : compresseur arrêté / en marche peu lisible à 270 px.
- fin.js : (1) 75,5 bout mort : halo blanc en colonne, gaz cru à peine visible → le gaz cru se lit en plan moyen, pas de colonne blanche ; (2) 84,6 like : aucune flamme derrière la vitre (flare 0,45) → la flamme se voit par la fenêtre ; (3) plages fixes 83,3–86,8 et 88,9–90,0 : une dérive lente ; (4) facultatif 69,6–71,6 bout mort immobile.
Puis vague 2 : `monteur-son` (journaux 046-acte*.md → « Sons »). Puis brouillon, qa, « PRÊT POUR LE RENDU » (rendu final seulement après confirmation de la voix par la conversation principale).

## Reprise (chef neuf, 13/11 06:37)
- Merwan : « corrige tout », hebdo 93 % autorisé au-delà de 92. Jauge 62 % fenêtre / 93 % hebdo (remise à zéro 08:00). Vague 1 lancée : 4 retoucheurs (acte1, acte2, acte3, fin).
- 06:40 — Merwan : « arrête tout, le 46 est prêt ». Chef et retoucheurs arrêtés avant toute modification de src/ ; réveil annulé. Aucune retouche appliquée : le brouillon de 05:xx reste l'état du film. Rendu final non fait.

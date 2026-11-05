# 036 éolienne — état du chef de production

Consigne (04/11, 19 h 17) : de l'architecte au rendu. Voix validée, audio prêt. Réutiliser 025/route.js (+ habillage) et la pluie de 020/tour.js ; seul décor neuf : l'éolienne (mât, nacelle, moyeu type Enercon : un moteur + une batterie par pale, trois pales ; électrique, pas de vérin). Emballement = un instant. Image 0 : contre-plongée depuis la route, nuit, pluie, pales qui s'emballent dès l'image 1, voiture en bas. Ne rien lancer pour 037/038.

## Journal
- 19 h 17 · jauge 13 % (RAZ 22 h 10) / hebdo 35 %. Lancement de l'architecte.
- 19 h 44 · architecte rendu (a1af619430f5a0dae, 372 k, 27 min) : check passe. Actes : acte1, acte2, acte2b, acte3, fin. Candidates image 0 : .cache/planches/036/premiere-image.json (à re-tirer sur vrais décors ; préfère a puis c). Kit : kit/template/index.html a perdu la ligne étiquettes opacité 0 (à signaler, je ne touche pas kit/).
- 19 h 45 · jauge 19 % / 36 %. Vague décors : model.js, eolienne.js, vent.js.
- 20 h 05 · décors rendus : model a8ccde5ed2f214dc0 (276 k, 19 min), eolienne a3667bbe5780c092b (268 k, 15 min), vent aa36d72633531ef67 (252 k, 15 min). « À changer ailleurs » appliqués (plan.js FOLD/PITCH/BATTERY, VIEW ×8, mood/rotor dans update, cover cam) + VIEW.feather/fold. check passe.
- 20 h 20 · POSE0 choisie (f82 s120, planche .cache/planches/036/image0-v4.jpg). docs/036-actes-maj.md écrit. Jauge 29 % / 37 %. Lancement décorateur (eolienne.js).
- 20 h 35 · décorateur rendu (a522da01ea5c86340, 231 k, 10 min) : habillage.js (parc au loin, feu nacelle, lampe porte, poste). HUD : « Bout de pale » ajouté devant les km/h (index.html, ::before) sur la note de la conversation principale (pas de chiffre de vent sourcé).
- 20 h 45 · actes rendus : acte1 a3081d89a6be678bd (266 k), acte2 a79c92b653f59c868 (228 k), acte2b ae42519dacbb21c62 (245 k), acte3 a6cb0c2910b6016f1 (238 k). Appliqué : cover.state (acte2), sfx swish portee$+0.05. À retoucher (eolienne.js) : pale A coupée à SECTION.y quand flow > 0,01. Reste : fin.js.
- 20 h 45 · fin rendu (ab29674cd398545e2, 244 k, 10 min). VIEW.fold remplacé. Relecture en cours.
- 20 h 55 · relecture 4 planches (.cache/planches/036/relu-0..3.jpg) : défauts 19,7 (racine sombre sur « on l'ouvre »), 28,0 (BATTERIE vert sur coffret vert), 25,2 (Dedans chargé), 30–37 (pale A de verre devant la coupe), 80,6 (batteries absentes au like). Brouillon en cours.
- 21 h 05 · brouillon + qa : 0 image parasite, voix calée, −14,04 LUFS. Heurtés 25,2 · 18,3 · 19,9 · 16,7 · 34,6 ; plage lente 21,0–23,5. Sons : click 90 déplacé à deg90a+0.66 (souffle 35,6–36,1) ; impact « plié » retiré (aucun souffle utile). Vague retoucheurs : acte1, acte2, acte2b(+eolienne.js pale A).
- 21 h 15 · retoucheurs rendus : acte1 a6169e2641f1d3382 (143 k), acte2 a4814a177f5a7e449 (156 k), acte2b+eolienne acc1d0bd6d2c6e15f (158 k). flow ajouté dans turbine.update. Raccords 15,9 / 19,4 et 28,1 relus : bons. Rendu final en cours.
- 22 h 05 · LIVRÉ. Rendu final : renders/036-eolienne.mp4 (qa : 0 image parasite, voix calée, −14,03 LUFS, aucun son sur un mot ; click du drapeau à deg90a+0.82). Couverture, copie iPhone, posts.mjs OK. Boucle 0,04 = 88,70 vérifiée. Jauge 47 % / 39 %. Agents ≈ 3,08 M (13 agents).
- Reste un cran en dessous : like 78–81 s (batteries cachées sous le panneau), « un frein » sans étrier visible (61–64 s), abonnement calme 80,7–86 s, `slip` qui se lit « le vent passe ». Kit : kit/template/index.html a perdu la ligne étiquettes opacité 0 (non touché). Attend Merwan : écoute / publication.

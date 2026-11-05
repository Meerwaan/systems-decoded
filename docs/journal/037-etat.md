# 037 parachute — état (chef de production)

- 21:20 départ chef. Voix validée (04/11), audio/ prêt. Jauge : fenêtre 49 % (RAZ 22:10), hebdo 40 %.
- Vague 1 : architecte (en vol).
- Reste : décors → habillage → image 0 → actes-maj → actes ×4 → relecture → check → brouillon/qa → retouches → rendu/qa/cover/phone/posts.
- 21:44 architecte a68049c4af34bbd0b rendu (334 k, 23 min) : check passe ; src = model.js, sauteur.js, ciel.js (bouchons) ; actes = acte1, acte2, acte2b, acte3, fin ; 4 candidates image 0 dans docs/037-actes.md (§ Les quatre candidates), (a) dans POSE0. À changer ailleurs hors périmètre (kit/template/index.html, --words, ciel→kit) : pour la conversation principale.
- 21:45 jauge 58 % (RAZ 22:10), hebdo 41 %. Vague 2 : decor × 3 (model.js, sauteur.js, ciel.js) en vol.
- 22:08 décors rendus : model abf910108578c9441 (303 k, 23 min, 40 img), sauteur ab0cb88b21f8e2263 (242 k, 12 min), ciel a1397988ea743617e (251 k, 15 min). Appliqué : sky.update(S…), VIEW.exploded resserré.
- 22:12 image 0 = a (plongée), planche .cache/planches/037/image0.jpg ; docs/037-actes-maj.md écrit. Jauge 74 % juste avant RAZ 22:10.
- Prochaine vague : decorateur + acte1 + acte2 + acte2b ; puis acte3 + fin.
- 22:10 RAZ, jauge 0 %/43 %. Vague 3 en vol : decorateur, acte1, acte2, acte2b.
- 22:21 vague 3 rendue : decorateur accb7b4954b901f4a (208 k, touches ÉTEINTES, rien au film), acte1 a37d4850a9a8277b6 (231 k), acte2 a2c2fc40bf5c62a34 (224 k), acte2b ac01e52cd02ec3b95 (199 k). cover cam/state de l'acte 2 appliqués (shift -300 gardé). Jauge 10 %/44 %. Vague 4 en vol : acte3, fin.
- 22:30 vague 4 rendue : acte3 a5ab045564d18a18b (217 k), fin abb2601e12cd006d3 (219 k). check passe 66/66. Relecture en cours.
- 22:35 relecture (.cache/planches/037/relecture/p1-p4.jpg) + brouillon renders/037-parachute-draft.mp4 + qa : voix calée, -14,05 LUFS, 1 parasite 42,50 ; heurtés 8,6 / 6,7 / 45,6 / 22,8 / 14,1. Swish « s'ouvre » déplacé (souvre+0.38, dur 0.18).
- Vague 5 en vol : retoucheur × 4 (acte1, acte2, acte2b, acte3). fin.js laissé tel quel. Jauge 16 %/45 %.
- 22:45 vague 5 rendue : retoucheurs acte1 a36b1a972fa13fe48, acte2 a15457185632758d0, acte2b a519b70dfabcbbb2a (bug repère repos:sol → sol#2), acte3 a663d2aaf63f397d4 (sortie HUNG). Puis : planche de contrôle, rendu, qa.
- 22:47 FINI. renders/037-parachute.mp4 (87,1 s), qa : 0 image parasite, voix calée (écart 0 ms), -14,05 LUFS, aucun son sur un mot ; heurtés restants 45,6 (21,9) / 42,8 (17,5), plage lente 22,5–24,5. Couverture recadrée (cam d 370, shift -420). iphone + posts.mjs faits. Brouillon déplacé dans .cache/brouillons/.
- Jetons d'agents : ≈ 3,10 M (14 agents). Jauge 25 % / 46 %.
- Pour la conversation principale : À changer ailleurs hors périmètre — ligne d'opacité 0 dans kit/template/index.html ; image vide de buildCaptions à 45,6 ; ciel 026/037 + makeStreaks à monter au kit ; entrées catalogue (037/sauteur.js, 037/ciel.js, 037/model.js) ; habillage.js éteint (ENABLED false).

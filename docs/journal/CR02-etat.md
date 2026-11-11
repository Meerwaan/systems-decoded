# CR02 Deepwater — état du chef de production

Consigne (06/11, ~00 h UTC) : de l'architecte au film rendu. Compte à rebours (DA noir chaud, `kit/lib/reconstitution.js`, modèle CR01). Voix faite (154,4 s), ne pas y toucher, aucun crédit. ≤ 3 agents à la fois (retoucheur du 039 en vol, ne pas toucher au 039). Rien commité, planches dans .cache/planches/CR02/.

## Journal
- 06/11 ~00:00 UTC : jauge 42 % / hebdo 74 % (remise fenêtre 02:59 UTC). Lancement architecte.
- ~00:25 UTC : architecte rendu (a0138ffdfbd7d30f1, 369 k, 52 outils) : check OK ; décors bop.js / puits.js / plateforme.js (bouchons), actes acte1/acte2/acte2b/acte3, 4 candidates image 0 dans .cache/planches/CR02/premiere-image/essais.json (reco (a)).
- Nouvelles consignes du coordinateur : UN agent à la fois ; plan-séquence (docs/recette-actes.md § « Le plan-séquence ») dans chaque consigne d'acte, mesure `npm run camera -- CR02` (quelques % quasi fixe, aucune plage fixe ≥ 1 s). Ni 039 ni 040.
- ~00:27 UTC : jauge 59 % / 77 %. Décor 1/3 : bop.js lancé.
- ~00:55 UTC : décor bop rendu (a188419552f2ac53d, 333 k, 25 outils, 30 images) ; 3 poses VIEW appliquées, note ajoutée à docs/CR02-actes.md. Coordinateur : 3 agents à la fois de nouveau permis ; consignes plan-séquence du 039/040 à mettre dans les actes (D.path par lieu, az même sens, fin en orbite, boucle cut+12° + D.loop sans path par-dessus, path → to:"go", accroche : surfaces claires qui changent).
- ~00:56 UTC : jauge 69 % / 78 %. Décors puits.js + plateforme.js lancés en parallèle.
- ~01:20 UTC : décors puits (a3986298d3dbc6a58, 292 k) et plateforme (a472ee86311f5985c, 292 k) rendus ; « À changer ailleurs » appliqués (world.js halo/poses, plan.js KILL_LINE/CABLE/BALANCE) ; check OK. Pas de décorateur (CR : argile, pas de rayons X).
- Image 0 choisie : (a) plancher, planche .cache/planches/CR02/premiere-image/image0.jpg ; POSE0/FIRST déjà dessus. docs/CR02-actes-maj.md écrit.
- ~01:10 UTC : jauge 79 % / 79 % (fenêtre remise à 03:00 UTC = 04:00 Paris). La vague des décors a coûté ≈ 10 points en 22 min (plus que 9/agent/h). 4 actes ne tiennent pas avant 85 % → **EN FILE : reprise à 03:00 UTC**.

## Reste à faire (dans l'ordre)
1. `npm run chrono -- CR02 actes` ; vague 1 : `acte` × 3 (acte1, acte2, acte2b), puis acte3 seul (3 agents à la fois au plus). Consigne type :
   « Dossier CR02-deepwater, fichier `src/acte<N>.js` (acte1, acte2, acte2b, acte3). Compte à rebours (pas d'« on l'ouvre ») : lis `docs/CR02-actes-maj.md` puis ta section de `docs/CR02-actes.md`. **Plan-séquence** (`docs/recette-actes.md` § « Le plan-séquence », validé pour le CR02) : un `D.path` par lieu, lancé, l'az qui tourne toujours dans le même sens ; un path qui rend la main à l'acte suivant finit en `to: "go"` ; mesure `npm run camera -- CR02` (quelques % quasi fixe, aucune plage fixe ≥ 1 s). Accroche : des surfaces claires changent (jet qui pulse, fluide qui coule), une coupe ou un geste toutes les 2–3 s. »
   + acte3 : « fin en orbite continue ; boucle par `cut` sur la pose de 0 s un peu plus loin, tournée de 12°, puis `D.loop({ at, rewindAt: at + 0.04, ease: "none" })` sans autre path par-dessus. »
   + acte2 : « vérifier les aiguilles à t ≈ 38 s (≈ 1 200 vues par le décor puits) ».
2. Relecture : 4 planches de 8 à 270 px (`--cols 4 --width 270`), dont lisibilité boue/gaz, explosion (non revue), rythme 0–25 s. Puis check, render --draft, qa --file, `npm run camera -- CR02`.
3. Une vague de `retoucheur` ; puis render, qa, cover, phone, `node scripts/posts.mjs`. Catalogue : 3 lignes (bop, puits, plateforme) à ajouter dans docs/catalogue.md (texte dans les messages des décors, journaux CR02-*.md « Pour docs/catalogue.md »).
- ~03:03 UTC : reprise (fenêtre 0 %, hebdo 81 %). Vague actes 1 : acte1, acte2, acte2b lancés.
- ~03:20 UTC : actes 1 (a1a5cbdd689d668b9, 227 k), 2 (a171af3fbc44981db, 252 k), 2b (a76e6eaa7bb1701f7, 263 k) rendus, plan-séquence, camera OK sur leurs plages. #hud-remain recoloré (index.html). Pour la retouche : puits.js arc de valeur des cadrans (journal acte2), plateforme.js boule de feu + spill damier (journal acte2b). acte3 lancé avec la coupe todefaut corrigée.
- ~03:32 UTC : acte3 rendu (a3e6393fcda41a991, 249 k) ; camera 2 % quasi fixe, 0 plage ≥ 1 s ; #chip-regle CSS ajouté. Relecture en cours.
- ~03:45 UTC : relecture 4 planches (.cache/planches/CR02/relecture/p1-4.jpg). Défauts : 13 s brun illisible, 34 s brun sur brun, 38–42 s aiguilles identiques (arc de valeur puits), 86 s flou blanc illisible, 125 s chip-fuite déborde (CSS corrigé). check OK. Brouillon lancé.
- ~03:58 UTC : brouillon + qa : voix calée (0 ms), −14,03 LUFS, ✗ 1 image parasite 152,27 s ; heurtés 36,9 / 85,9 / 65,1 / 56,2 / 110,6 s ; plages lentes 8–10, 10,5–12,5, 15,5–17,5, 18,5–21 s. camera : 2 % quasi fixe, 0 plage ≥ 1 s. Jauge 17 % / 83 %. Retoucheurs vague A : acte1, acte2 (+ puits.js arc des cadrans), acte2b (+ plateforme.js boule de feu, spill) ; puis acte3.
- ~04:12 UTC : retoucheurs acte1 (a62e0f2f7ed16e352), acte2+puits (a56eb5634e695a7c2), acte2b+plateforme (a3b704d8b6d1ad1d2) rendus ; bop.js l.630 uLink plus fort appliqué. Retoucheur acte3 lancé (parasite 152,27, heurté 110,6, pincement, chip).
- ~04:25 UTC : retoucheur acte3 (aea2d42cd39f77ac6, 183 k) rendu ; parasite 152,27 non reproduit dans look (à reconfirmer) ; bop.js l.709 coupe +6 appliqué. Rendu final lancé.
- ~05:00 UTC : rendu final renders/CR02-deepwater.mp4 ; qa : 0 parasite, voix calée 0 ms, −14,03 LUFS ; plages lentes restantes 10,5–13 et 18,5–20,5 s (lisibles à 270 px, p5.jpg). Cover/phone/posts en cours.
- ~05:05 UTC : FAIT. renders/CR02-deepwater.mp4 (154,4 s), -couverture.png (BOP, tube en S), -iphone.mp4 (29,1 Mio) ; posts.mjs OK (titre 88 car.). Brouillon supprimé. Jauge 37 % / 86 %. Agents du dossier ≈ 2,98 M (architecte 0,37 · décors 0,92 · actes 0,99 · retouches 0,71).
- Reste (hors chaîne) : 3 fiches catalogue (bop, puits, plateforme) à ajouter à docs/catalogue.md ; écoute de Merwan (« MÊME TON PARTOUT ») ; plages lentes 10,5–13 et 18,5–20,5 s si un nouveau rendu se fait.

# 047 lave-vaisselle — état du chef de production

Consigne : de l'architecte au rendu. Voix faite le 13/11 (pas encore écoutée par Merwan en cabine), sons 047-* dans kit/sons/. Sort dim. 15/11 20 h.
Contre-vérif à respecter à l'image : pas un volume unique de 10 L qui tourne tout le cycle, pas de cuve pleine ; le bras tourne sans moteur, poussé par ses jets.

## Journal
- 13/11 ~07:05 · jauge 2 % / hebdo 0 % · chrono decors lancé · vague 1 : architecte.
- architecte a3ca576599f1cae1f rendu (348 k, 24 min). Décors : model.js, cuve.js (neuf), cuisine.js (009 réutilisée) ; actes : acte1, acte2, acte2b, acte3, fin. Première image : A provisoire, trancher A/B/D sur vrais décors (poses dans docs/047-actes.md → « La première image »).
- décors rendus : model a7d62dbebded29ea5 (265 k), cuve a68a210bd02d411b3 (306 k, 54 images : au-delà), cuisine a8d5b029c6fb8082d (269 k). Leurs 7 « À changer ailleurs » appliqués (COLUMNS, coarse, DISH commentaire, VIEW kitchen/sink/door/hub, actes.md l.29).
- Points faibles signalés : bloc noir des filtres en bas de POSE0 (puisard masse noire), éponge fantôme peu lisible, buses inclinées lisibles seulement en gros plan (pose « pas de moteur » : VIEW.hub, turn ≈ 0,31). Plat penché bord avant plus HAUT (acté).
- Image 0 : A (sous le panier) retenue sur planche .cache/planches/047/image0.jpg (plat cramé lisible, jets veille ; B : bras noir en masse ; D : sujet trop petit). POSE0/FIRST déjà en place. Jauge 18 % / hebdo 3 %. Vague : decorateur.
- decorateur a952a24ef98120250 rendu (226 k, 8 min) : 3 touches. docs/047-actes-maj.md écrit. Chrono actes. Vague actes 1 : acte1, acte2, acte2b, acte3 ; puis fin seul, puis monteur-son.
- actes rendus : acte1 a276ec0cc0d0e4c12 (250 k), acte2 abfa343dcea393592 (230 k), acte2b a0f8512207854e76b (249 k), acte3 a9a2293823a36a57e (250 k). VIEW.system → d 110, az −36, shift 60 (proposé par acte1). Reste 1 avertissement contraste 45,63 s (« 03 RÉPONSE » 4,09:1) dans 2b.
- Plans faibles notés : 2 (21,45 éclaté 45 % de haut ; 23,6–24,3 glissé sans sujet ; 37–40 non revu), 2b (42,3–43,4 trappe ; 43,6–45,6 bras au bord droit ; 46,6–47,4 flou), 3 (48,6–50 ; pastille petite ; ronde ligne tordue 54–62 ; 64,3–64,9 plaques sous sous-titres), 1 (19,6–19,98 system flou → corrigé ?).
- Couverture proposée par acte2 : repère eclate:bras, pose/état dans son message (journal 047-acte2.md).
- fin afe26cb415b196672 rendu (265 k) : boucle = image 0 vérifiée. Faibles : 64,90 coupe quasi même axe ; 89,3–90,6 sous plancher chargé. Vague suivante : monteur-son.
- monteur-son a327e8f27faf1f476 rendu (204 k) : 16 sons ponctuels ; porte acte1 décalée +0,18 (fait). Sons à fabriquer en réserve (047-robinet, 047-electrovanne) → question Merwan (dépense). Extrait audio/essais/047-son-ecoute.mp3. Étape relecture.
- Relecture : 4 planches .cache/planches/047/relecture/p1-4.jpg. check OK (1 avert. contraste 45,63). Brouillon renders/047-lave-vaisselle-draft.mp4 ; qa : 0 image parasite, voix calée 0 ms, −14,06 LUFS ; heurtés 46,8 (35,8) · 30,2 · 58,3 · 28,4 · 90,4 · 7,1.
- Vague retouches : acte2, acte2b, acte3, fin (un retoucheur par fichier).
- retoucheurs rendus : acte2 a6eb10a7f92991dd6, acte2b a7580b3c48b8eb307 (contraste levé), acte3 ae995008e404fb1f6, fin a4be5e81a95d16699. Reste : planche de contrôle, render, qa, cover, phone, posts.
- Rendu 1 : qa ✗ image parasite 52,33 (jet flou au premier plan) → jets 0 au cut cutLand, 0,4 au cut tosect (acte3.js l.106/117) + son des jets baissé 51,5–54,0. Re-rendu.
- Parasite 52,33 = bras flou qui balaie l'objectif + motes de buée : au plan d'atterrissage (cutLand→tosect) jets 0, shell 0, bras au repos (turn coupé en deux segments), rétablis au cut tosect. Planche parasite4.jpg propre.
- 52,53 = le passage de la caméra à travers la cuve (voile) : montée remplacée par une coupe à lands+0,9 sur FLOOR0 ; plat, verre, jets coupés au plan d'atterrissage ; pastille entière (fond au cut tosect). Re-rendu n° 3.
- FINI ~10:10 : rendu 3 propre (qa : 0 image parasite, voix calée 0 ms, −14,06 LUFS, 91,3 s). Couverture (cover.cam d 250, shift −620 : le bras sous le titre), copie téléphone, posts.mjs OK. Brouillon supprimé. Jauge fin 41 % / hebdo 6 %. Agents ≈ 3,55 M.
- Reste pour Merwan : écoute en cabine (voix jamais écoutée) ; oui/non sur 2 sons en réserve (047-robinet, 047-electrovanne : devis `npm run sons -- 047`) — sinon le film sort tel quel (ces moments sans son).
- Un cran en dessous, non retouchés : 21,45 éclaté à 54 % de haut ; 42,3–43,4 trappe qui tient (cause invisible) ; 64,90 coupe chute quasi même axe ; 89,3–90,6 sous plancher chargé ; heurté 7,1 s (25,8) glissé vers l'évier.

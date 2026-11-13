# 048 tunnelier — état du chef de production

Consigne : de l'architecte au rendu. Voix faite le 13/11 (pas encore écoutée par Merwan en cabine), sons 048-* dans kit/sons/ (front-s-ecroule, roue-coupe, vis-extraction, voussoir). Sort lun. 16/11 20 h.
Contre-vérif à respecter à l'image : tassement de quelques millimètres, quasi invisible (jamais effondrement réel ni affaissement de plusieurs cm) ; « le sol se soulève » = bombement léger ; aucune valeur de pression au front ni seuil de tassement à l'écran (pas de « 3 bars »).
Seuil d'arrêt : fenêtre ≈ 90 % → état sur disque, rendre la main. Remise à zéro de la fenêtre : 13 h (Paris).

## Journal
- 13/11 ~10:10 · jauge 41 % / hebdo 6 % · chrono decors lancé · vague 1 : architecte.
- architecte ae2e16aecf6cbe516 rendu (367 k, 24 min) : check OK. Décors model.js, sol.js, rue.js (voiture 011, chambre 022 réutilisées) ; actes acte1 (0→21,26), acte2 (→41,68), acte3 (→63,30), fin (→92,07). Image 0 : A « plongée du 5ᵉ » provisoire, à retirer sur vrais décors (candidates dans docs/048-actes.md).
- décors rendus : model add5b84816d4bcf9c (285 k), sol adf1d3abf76a66d6d (243 k), rue af5c5e997e8f55f2f (309 k, 36 images). « À changer ailleurs » appliqués : rams → ground.update ; VIEW.rear az −142 → 55 (côté coupe) ; bedroom, sky (sky non vu sur planche) ; gaugeBench tx BGX ; plan.js gauge [372,…,344], GROUND.scale.x −640.
- Faibles signalés : calotte du front trop régulière ; arbre/bras malaxeurs sombres quand la terre baisse ; vis fine à l'éclaté ; ciel à vérifier ; chambre : montant de fenêtre devant le lit ; bas de cadre gris dans kerb.
- Image 0 : A (plongée du 5ᵉ) retenue sur .cache/planches/048/image0.jpg (voiture lisible ≈ 40 %, roue nette, lueur signal derrière ; B : rue en fouillis de traits ; D : bouclier de dos illisible). POSE0/FIRST déjà en place. Jauge 57 % / hebdo 8 %. Vague : decorateur.
- decorateur aab68d48f5bc6020e rendu (244 k) : réverbères + ville lointaine. Dalle du front corrigée (sol.js l.299, y = AY) ; image 0 revérifiée (image0b.jpg). docs/048-actes-maj.md écrit. Chrono actes. Vague actes : acte1, acte2, acte3, fin.
- actes rendus : acte1 adeb15a90ce5af0ce (241 k), acte2 a1afa892c8ad96337 (229 k), acte3 aea6bf9d9626cee0c (243 k), fin a8c2356520548216c (235 k). Boucle = image 0 vérifiée (fin). Couverture : at eclate:vis+0.3, tx −100, d 7600, az −52 (shift −430 gardé, à vérifier au cover). Option principle (fin) non appliquée.
- Faibles notés : 1 (13,9–14,6 plongée rue floue ; 6,0 chambre moitié noire), 2 (32,7–34 front invisible, roue blanche ; 21,26 tache halo), 3 (46,0–47,3 chargé + contraste 46,03 ; 51,3 blocs petits ; 53,9 tout rouge mire petite ; 54,6 voiture sous en-tête), fin (80,6–81,2 demi-seconde noire ; 82,5–90,4 ciel noir satellite point ; 71,2 tache roue).
- Vague suivante : monteur-son.
- monteur-son a5ec02bf31bc47068 rendu (187 k) : 17 sons ponctuels, bed.wav refait ; réserve 048-voiture-passe (à fabriquer : question Merwan) ; extrait audio/essais/048-son-ecoute.mp3. Étape relecture.
- Relecture : 4 planches .cache/planches/048/relecture/p1-4.jpg. Faibles : 14,2 et 17,0 flous de mouvement illisibles (acte1) ; 37,5 cadre vide, machine au bord droit (acte2) ; 53,9 tout rouge, mire petite au bord droit sous les boutons (acte3) ; 80,9 chambre noire, 85,0 ciel vide (fin). 92,0 = image 0 ✓.
- check OK (1 avert. contraste 46,03). Brouillon renders/048-tunnelier-draft.mp4 ; qa : 0 image parasite, voix calée 0 ms, −14,04 LUFS ; heurtés 13,9 (28,9) · 39,4 · 18,5 · 50,7 · 46,2 · 15,6 ; 1re demi-seconde 1,2. Jauge 69 % / hebdo 10 %. Vague retouches : acte1, acte2, acte3, fin.
- retoucheurs rendus : acte1 ae93349ab393a77ed, acte2 a5fb4e6a7b2a7da9d (front de terre 32,7–34 non corrigeable depuis l'acte : matière du front et graduations de l'échelle dans sol.js, non fait), acte3 aba1a68529bfff79f (contraste levé), fin a48009a75f4548da1. Reste : planche de contrôle, render, qa, cover, phone, posts.
- Planche de contrôle .cache/planches/048/relecture/controle.jpg : 14,2 / 17,0 / 46,2 / 53,9 / 80,2 / 85,0 lisibles. Rendu final lancé.
- Rendu final propre (qa : 0 image parasite, voix calée 0 ms, −14,04 LUFS, 92,1 s) après une coupe du chef sur la façade (acte1 : heurté 29 à 13,3 → plus de pic ; max 17,3). Reste : cover, phone, posts.
- FINI ~11:50 : couverture (eclate:vis+0.3, éclaté sous le titre), copie téléphone, posts.mjs OK. Brouillon supprimé. Jauge fin 74 % / hebdo 10 %. Agents ≈ 3,22 M (14 agents).
- Reste pour Merwan : écoute en cabine (voix jamais écoutée) ; oui/non sur 1 son en réserve (048-voiture-passe : devis `npm run sons -- 048`) — sinon le film sort tel quel (passages de voiture sans son).
- Un cran en dessous, non retouchés : 32,7–34 front de terre illisible (roue blanche) et échelle de profondeur en trait fin (matière du front / graduations dans sol.js) ; 37,5 arrière de la machine sous les boutons ; heurtés restants ≤ 17,3 (50,7 · 18,9 · 26,6) ; 1re demi-seconde 1,8 ; ciel 82,5–90,4 lueur du satellite qui grossit vers 89,9.

# Critique d'exhaustivité

Rapport : C:/Users/MERWA~1.ORD/AppData/Local/Temp/claude/C--Users-merwa-ORDI-MERWAN-Documents-systems-decoded/33c1cc51-26d4-4646-9e1f-607ded707c28/scratchpad/audit/critique/rapport.md (et constats.json à côté). Vu : 7 planches (006 hook_01, film_03, film_07, film_11 ; 005 hook_01, film_06 ; 002 hook_01), les deux episode.json, le compteur du 006 dans main.js. Aucun rendu, aucune dépense.

Ce qui manque le plus : (1) un ordre de marche — environ 170 constats sur deux films que Merwan n'a pas écoutés ; (2) une dimension entière, l'exactitude de ce qui est affiché, que personne n'a regardée et qui révèle deux erreurs (CRIT-02, CRIT-04) ; (3) une vérification dans l'app, sur le téléphone, avant tout chantier de lisibilité.

CONTRADICTIONS TRANCHÉES
A1 — 005, « Panne » à 0,3 s : ACC-01 (la coque s'assombrit, pas la ligne) contre R04, R1 rythme, VR-01 rétention et VR-01 références (la ligne d'alimentation faiblit ou se coupe). ACC-01 gagne : la ligne verte alimente les bobines, et la thèse du film est « le courant tombe, l'aimant lâche ». La couper à 0,3 s en laissant la couronne verte et 100 % pendant 9 s montre l'inverse du mécanisme. La ligne ne bouge qu'à 9,24 s.
A2 — 005, ampleur de l'avancée d'accroche : ACC-01 (d 4300), R1 (d 4150) contre E5 (d 4700). E5 gagne : sur hook_01 la cuve occupe déjà y ≈ 420–1290, hors de la zone sujet, et la carte est posée sur son fond ; avancer de 15 à 18 % aggrave les deux. Arc d'azimut + shift qui remonte le fond au-dessus de 1160.
A3 — 005, chute : VR-03 références (rallumer la couronne) contre E1, R6, image-005-09. E1 gagne : barres au fond, une couronne rallumée se lit « le réacteur redémarre ».
A4 — 005, libellé du compteur : ACC-11 et R04 proposent « PUISSANCE 100 % ». À écarter : le film affiche « RÉACTION » à l'acte 3 (film_06) et finit à 0 % ; « PUISSANCE 0 % » serait faux (7 % de chaleur résiduelle dans les sources du dossier) et contredirait le CTA commentaire. Libellé unique : « RÉACTION ».
A5 — 006, première image : ACC-03 (rapprocher vers la poitrine) contre R5 rythme (« ne pas toucher au cadre »). R5 a raison pour POSE0, tort pour la pose d'arrivée : sur hook_01, dès 1 s, le corps couché occupe y ≈ 975–1350 et la tête passe sous « QUELQU'UN S'EFFONDRE ». VR-09 et VR-12 l'emportent : remonter la pose d'arrivée, POSE0 intact.
A6 — 006, CTA commentaire dans le hall : R06, R2 rythme, image-006-12 contre E7 et VR-04 références (version légère). Version légère : la boucle prend déjà la boîte au mur pendant ≈ 4 s juste après (film_11) ; le hall au commentaire donnerait établi → hall → établi → hall en 20 s.
A7 — 006, hold du beat « repos » : V1 (0,3 → 0,1) contre E4 (≥ 0,5 pour un plan de raccord). V1 gagne : R05 désigne ce beat comme le creux du film, et E4 dit lui-même « sinon s'abstenir ».
A8 — cadence : VR-08 (publier le 005, attendre 48 h) et les ≈ 40 correctifs d'image du 005 ne tiennent ensemble que si le 005 reçoit un lot fermé d'une journée (CRIT-01).

CONSTATS CONSERVÉS À RECALER
image-005-01 (impact 5) est surévalué : sur film_06 la cuve n'est petite que ≈ 1,5 s, puis le cœur vert remplit le cadre ; impact 3. image-006-01 (cœur à l'envers, impact 5) est confirmé sur film_07.

### critique/CRIT-01 — Aucun ordre de marche : environ 170 constats, deux films prêts, zéro écoute
[impact 5 (auditeur 5) · critique · cible compte · besoin : decision_merwan · effort S]
- OÙ : Ensemble de l'audit ; episodes/005-arret-urgence/audio (pas de picks.json) ; renders/005-arret-urgence.mp4 (06/10) et 006-defibrillateur.mp4 (07/10)
- PREUVE : Une quarantaine de constats conservés visent le 005, le prochain à publier. Le 005 n'a pas de audio/picks.json : Merwan ne l'a pas écouté. Les contre-vérificateurs de neuf dimensions signalent l'absence d'ordre ; aucun constat ne le pose.
- POURQUOI : L'objectif est de gagner des abonnés vite. Sans lot fermé, le 005 est retenu indéfiniment, le 006 derrière lui, et on polit deux films que Merwan peut encore refuser à l'écoute.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ordre : (1) fiche unique à Merwan (CRIT-08) ; (2) passe téléphone (CRIT-07) ; (3) lot fermé du 005 en un seul re-rendu : accroche en mouvement (A1, A2), libellé RÉACTION (A4), « Zéro » (image-005-04 + E2), barre qui tombe à l'heure (E3), chute vers la couronne éteinte (E1), sous-titre orange sur orange (image-005-07), whoosh sur les mots clés (son-03), légende et épinglé (R02, E1 emballage) ; (4) publier le 005 ; (5) lot fermé du 006 : cœur à l'endroit (image-006-01), image doublée à 10,73 s (R4), CRIT-02, CRIT-05, étiquettes hors zones (image-006-07), battement audible (son-01), légende (E2) ; (6) tout ce qui touche au kit, au moteur 3D ou au gabarit part sur le 007.
- CONTRE-VÉRIFICATION : 

### critique/CRIT-02 — 006 : le compteur CHANCES contredit la source du dossier et le massage qu'on montre
[impact 4 (auditeur 4) · critique · cible 006 · besoin : rien · effort S]
- OÙ : episodes/006-defibrillateur/src/main.js:158 (chancesAt) et :511-512 ; episode.json → sources n° 2 ; HUD de 0 à 50 s
- PREUVE : chancesAt = Math.round(100 - (10 * s) / 60), sans condition. Sur film_03 le témoin masse dès T+0:47 et le compteur continue à −10 %/min (93, 92, 89, 88 %) jusqu'à 72 % à T+2:50. La source n° 2 du dossier : −10 à 12 % par minute sans massage, −3 à 4 % avec ; et 50 à 70 % de survie pour un choc dans les 3 à 5 minutes : 72 % est au-dessus de la fourchette.
- POURQUOI : Le film demande au spectateur de masser et affiche que masser ne change rien. C'est le chiffre du fil rouge, visible 85 s ; un secouriste le relèvera en commentaire. CLAUDE.md : les chiffres affichés restent justes.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Deux pentes : −10 %/min jusqu'au mot « masse » (chaine:masse), puis ≈ −3,5 %/min, soit ≈ 85 % au choc ; le compteur ralentit visiblement sur « et masse » (un fait de plus montré à l'image). La voix ne dit pas ce chiffre : aucun crédit. Mettre à jour sources et le commentaire de tête de main.js. Montrer la valeur finale à Merwan ; s'il préfère rester sous la fourchette sourcée, garder 72 % mais changer la pente avant et après le massage reste nécessaire.
- CONTRE-VÉRIFICATION : 

### critique/CRIT-03 — 005 : montrer la panne à 0,3 s sur la ligne d'alimentation contredit le mécanisme du film
[impact 4 (auditeur 4) · critique · cible 005 · besoin : rien · effort S]
- OÙ : episodes/005-arret-urgence/src/main.js, accroche (0 à 4,6 s) ; correctifs de R04, R1 rythme, VR-01 rétention, VR-01 références
- PREUVE : hook_01 du 005 : la ligne verte en pointillés arrive sur la couronne de bobines, compteur à 100 %, dix images identiques. Script : « Zéro. Le courant tombe. L'aimant lâche. » Quatre auditeurs font faiblir ou couper cette ligne sur « Panne » en laissant la couronne allumée jusqu'à 9,24 s.
- POURQUOI : Ligne coupée et bobines encore vertes pendant 9 s, c'est l'inverse de ce que le film explique ensuite, et l'événement de 9,24 s (le C) est rejoué deux fois.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Retenir ACC-01 : mouvement de caméra dès l'image 1 (d 5050 → ≈ 4700, arc d'azimut, shift qui remonte le fond de la cuve au-dessus de 1160) ; sur « Panne », la coque de verre s'assombrit (shell 1 → 0,45), jugée au look à 270 px, sinon le mouvement et le son seuls. feed, couronne et étiquette « sous tension » intacts jusqu'à 9,24 s. POSE0 inchangé pour la boucle.
- CONTRE-VÉRIFICATION : 

### critique/CRIT-04 — 005 : le libellé « PUISSANCE 100 % » proposé serait faux à l'arrivée
[impact 3 (auditeur 3) · critique · cible 005 · besoin : rien · effort S]
- OÙ : Correctifs de ACC-11 et R04 ; HUD du 005 ; episode.json → sources (chaleur résiduelle) et beat comment
- PREUVE : film_06 : le compteur porte « RÉACTION » à l'acte 3 et tombe à 0 % à T+1,6 s. Sources du dossier : 7 % de la puissance une seconde après l'arrêt. CTA commentaire : « une fois arrêté, il chauffe encore combien de temps ? »
- POURQUOI : « PUISSANCE 0 % » affirmerait une chose fausse et contredirait la question que le film pose trente secondes plus tard. Les sources notent déjà : on dit « la réaction est arrêtée », pas « le réacteur est froid ».
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Libeller le compteur « RÉACTION 100 % » dès l'image 0, le même mot qu'à l'acte 3. Ne pas écrire « PUISSANCE ».
- CONTRE-VÉRIFICATION : 

### critique/CRIT-05 — 006 : la victime tombe dans la carte d'accroche — remonter la pose d'arrivée, pas POSE0
[impact 3 (auditeur 3) · critique · cible 006 · besoin : rien · effort S]
- OÙ : episodes/006-defibrillateur/src/main.js, pose d'arrivée de la chute (≈ ligne 169) ; 1 à 4 s
- PREUVE : hook_01 du 006 : à partir de 1 s le corps couché occupe y ≈ 975–1350 ; la tête est sous la ligne « QUELQU'UN S'EFFONDRE » (y ≈ 1270), dans la zone des cartes (1186–1542). Le tiers haut de l'image reste un hall au trait vide.
- POURQUOI : ACC-03 et R5 rythme se contredisent (resserrer ou ne pas toucher au cadre) ; l'image donne tort à R5 pour la pose d'arrivée : sujet et texte se recouvrent sur la phrase A, pendant trois secondes.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : POSE0/FIRST inchangés (boucle). Pose d'arrivée : shift ou ty pour que le corps finisse entre y ≈ 700 et 1150, rapprochement modéré tant que la boîte verte reste à x < 900. look à 0,8 / 1,2 / 2,5 / 3,8 s, vérifier le raccord vers BOXWIDE.
- CONTRE-VÉRIFICATION : 

### critique/CRIT-06 — 006 : le CTA commentaire dans le hall vole l'image de la boucle
[impact 3 (auditeur 3) · critique · cible 006 · besoin : decision_merwan · effort S]
- OÙ : Correctifs de R06, R2 rythme, image-006-12 contre E7, VR-04 références ; 65,8 à 85,5 s ; scripts/lib/episode.mjs:168-171
- PREUVE : film_11 : juste après l'abonnement, la boucle avance sur la boîte verte au mur pendant ≈ 4 s, puis revient à la première image. Un commentaire dans le hall donnerait établi → hall → établi → hall en 20 s, et montrerait la boîte avant la boucle.
- POURQUOI : Trois auditeurs proposent ce déplacement sans regarder ce que la boucle montre déjà ; il affaiblit la dernière image et ajoute deux coupes dans le bloc le plus fragile.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : 006 : version légère sur l'établi (orbite lente en sine.inOut, un geste par CTA, qa ensuite). 007, dès le script : like, abonnement, puis commentaire en dernier, dans le décor de la boucle, pour que la question débouche sur la phrase inachevée. Réordonner les phrases du 006 sans reprise n'est pas garanti : les coupes se calent sur le silence entre phrases voisines d'une même prise ; ne pas le promettre à Merwan sans essai.
- CONTRE-VÉRIFICATION : 

### critique/CRIT-07 — Personne n'a vu les films dans l'app : une passe téléphone avant tout chantier de lisibilité
[impact 4 (auditeur 4) · critique · cible compte · besoin : decision_merwan · effort S]
- OÙ : renders/005-arret-urgence-iphone.mp4, renders/006-defibrillateur-iphone.mp4 ; constats H5, H7, H8, OUT-07, A1 à A10
- PREUVE : Toutes les preuves de lisibilité et de matière sont des images arrêtées en pleine résolution. La seule référence réelle est la capture iPhone du 06/10 (zones TikTok). Les légendes proposées (269 et 287 caractères) n'ont pas été vues tronquées.
- POURQUOI : Le critère du CLAUDE.md est la vignette à 270 px et l'app, après recompression. Sans ce test, une journée peut partir sur des textes que Merwan lit sans effort, ou manquer ce qui gêne vraiment.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Demander à Merwan : regarder les deux copies iPhone sur son téléphone, puis, s'il l'accepte, charger le 005 dans l'app jusqu'à l'écran de publication sans publier, et envoyer trois captures (aperçu plein écran, légende tronquée, choix de la couverture). Ce qu'il lit sans effort sort de la liste ; ce qui le gêne passe en tête du lot.
- CONTRE-VÉRIFICATION : 

### critique/CRIT-08 — Une seule fiche pour Merwan : mesures, écoutes, crédits, décisions
[impact 4 (auditeur 4) · critique · cible compte · besoin : decision_merwan · effort S]
- OÙ : ACC-12, R01, R12 rythme, VR-02, VR-07 références, E11 (mesures) ; ACC-02, R07, R09, V3, V4, V6, V11, R12 récit (reprises)
- PREUVE : Six constats demandent les mêmes courbes, huit proposent des reprises de voix séparées. post.pinned fait 254 (003), 339 (004), 353 (005) et 311 (006) caractères : ce qui a été réellement épinglé sous 003 et 004 est inconnu.
- POURQUOI : Quatorze demandes dispersées ne seront pas traitées ; une fiche l'est. Et les crédits sont à lui : une annonce, un oui, un re-rendu par film.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Une fiche en quatre blocs. Mesures : rétention, durée moyenne, % qui finissent, abonnés, sources de trafic, heure de publication pour 001 à 004 ; épinglés réels de 003 et 004. Écoutes dans la cabine : 005 (accroche, « Toute la question… », like, boucle), 006 (accroche, chute, trois CTA), habillage sonore. Crédits : boucle 005 (≈ 86), accroche 006 (≈ 68), et seulement s'il les demande boite 005 (≈ 48), like 005, repart 006, abo 006 si le 007 change — coûts exacts annoncés par npm run voice. Décisions : sujet du 007, cadence (005 puis 48 h), titre de couverture du 005.
- CONTRE-VÉRIFICATION : 

### critique/CRIT-09 — Dimension non auditée : l'exactitude de ce qui est affiché
[impact 3 (auditeur 3) · critique · cible methode · besoin : rien · effort M]
- OÙ : episode.json → sources des 005 et 006 ; HUD, panneaux, teaser #next du 006 (film_11 : « 0,5 s pour quitter l'avion »)
- PREUVE : Aucune des quatorze dimensions ne relit les faits. Une lecture des deux scripts contre leurs sources donne CRIT-02 et CRIT-04, plus le teaser du 006 qui affiche « 0,5 s » alors que ses propres sources le notent « à vérifier ».
- POURQUOI : C'est un compte qui apprend des choses : une erreur relevée en commentaire coûte plus qu'un plan fixe, surtout sur un sujet médical.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Règle à écrire : avant la voix, une passe à la main « chaque nombre dit ou affiché → sa ligne de sources » ; un compteur du HUD suit la même source que la phrase qui l'explique ; un teaser n'affiche aucun chiffre non sourcé. Pour le 006 : sourcer le « 0,5 s » avant publication ou le retirer du panneau (la phrase dite, elle, demande une reprise si le sujet change).
- CONTRE-VÉRIFICATION : 

### critique/CRIT-10 — Impacts à recaler : image-005-01 surévalué, image-006-01 confirmé
[impact 2 (auditeur 2) · critique · cible 005 · besoin : rien · effort S]
- OÙ : image-005-01 (005, ≈ 44 à 50 s) ; image-006-01 (006, ≈ 47 à 54 s)
- PREUVE : film_06 du 005 : la cuve est petite pendant ≈ 1,5 s (« Plus de mille tiges plongent »), puis le cœur vert remplit le cadre de « poussent » à « 2 s ». film_07 du 006 : pointe du cœur en haut, vaisseaux en bas pendant tout le choc ; à l'endroit seulement sur « Voilà le secret ».
- POURQUOI : Le classement final dépend des impacts : un 5 sur le 005 qui vaut 3 pousserait un chantier M devant des correctifs plus utiles du lot fermé.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : image-005-01 : impact 3, correctif réduit à avancer la poussée déjà prévue par E3 (pas de nouveau gros plan, donc pas de sous-titre signal sur le combustible). image-006-01 : reste impact 5 et premier correctif d'image du 006.
- CONTRE-VÉRIFICATION : 

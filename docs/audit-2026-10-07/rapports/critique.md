# Critique d'exhaustivité — ce qui manque à l'audit

Vu : planches `frames/006/hook_01`, `film_03`, `film_07`, `film_11` ; `frames/005/hook_01`, `film_06` ; `frames/002/hook_01` ; les deux `episode.json` (script, `post`, `sources`) ; `episodes/006-defibrillateur/src/main.js` (compteur) ; `scripts/lib/episode.mjs` (coupes entre phrases). Aucun rendu, aucune dépense.

## Contradictions tranchées

- **A1 — 005, « Panne » à 0,3 s.** ACC-01 (la coque s'assombrit, pas de `feed`) contre R04, R1 (rythme), VR-01 (rétention) et VR-01 (références), qui font faiblir ou couper la ligne d'alimentation. Je tranche pour ACC-01 : la ligne verte en pointillés alimente la couronne de bobines, et la thèse du film est « le courant tombe → l'aimant lâche → les barres tombent ». La couper à 0,3 s en laissant la couronne verte et le compteur à 100 % pendant 9 s montre l'inverse du mécanisme. La ligne ne bouge qu'à 9,24 s (image-005-02). Voir CRIT-03.
- **A2 — 005, ampleur de l'avancée d'accroche.** ACC-01 (d 4300), R1 (d 4150, az 16), E5 (d 4700). Sur `hook_01`, la cuve occupe déjà y ≈ 420–1290 : elle dépasse la zone sujet (440–1160) et la carte « PANNE DE COURANT » est posée sur son fond. Avancer de 15 à 18 % aggrave les deux. Je retiens E5 (≈ 4700) avec un arc d'azimut et un `shift` qui remonte le fond au-dessus de 1160 (ACC-11).
- **A3 — 005, la chute.** VR-03 (références) rallume la couronne ; E1, R6 et image-005-09 ne la rallument pas. Je retiens E1 : barres au fond, une couronne qui se rallume se lit « le réacteur redémarre ».
- **A4 — 005, libellé du compteur.** ACC-11 et R04 proposent « PUISSANCE 100 % ». Le film affiche « RÉACTION » à partir de T+0,0 (`film_06`) et finit à 0 %. « PUISSANCE 0 % » serait faux (7 % de chaleur résiduelle, d'après les sources du dossier) et contredirait le CTA commentaire. Libellé unique : « RÉACTION ». Voir CRIT-04.
- **A5 — 006, première image.** ACC-03 (rapprocher vers la poitrine, d ≈ 250) contre R5 rythme (« ne pas resserrer, ne pas toucher au cadre ») et ACC-07. Sur `hook_01`, à partir de 1 s le corps couché occupe y ≈ 975–1350 et la tête passe sous « QUELQU'UN S'EFFONDRE » (y ≈ 1270). R5 a raison pour POSE0, tort pour la pose d'arrivée : VR-09 et VR-12 l'emportent. Voir CRIT-05.
- **A6 — 006, CTA commentaire dans le hall.** R06 (hall, chemin vert), R2 rythme (coupe vers BOXCLOSE), image-006-12 contre E7 et VR-04 références (version légère sur l'établi). Je retiens la version légère : la boucle prend déjà la boîte au mur pendant ≈ 4 s juste après (`film_11`). Voir CRIT-06.
- **A7 — 006, `hold` du beat `repos`.** V1 (0,3 → 0,1) contre E4 (≥ 0,5 pour un plan de raccord). Je retiens V1 : R05 désigne ce beat comme le creux du film, et E4 dit lui-même « sinon s'abstenir ».
- **A8 — cadence.** VR-08 (publier le 005, attendre 48 h) contre les ≈ 40 correctifs d'image du 005. Les deux tiennent si le 005 reçoit un lot fermé d'une journée (CRIT-01).

## Constats

### CRIT-01 — Aucun ordre de marche (compte, impact 5, décision Merwan)
Environ 170 constats, dont une quarantaine sur le 005. Merwan n'a écouté ni le 005 (pas de `audio/picks.json`) ni l'habillage sonore. Les contre-vérificateurs de neuf dimensions le signalent, aucun constat ne le pose.
Ordre proposé :
1. Fiche unique à Merwan (CRIT-08).
2. Passe téléphone (CRIT-07).
3. Lot fermé du 005, un seul re-rendu : accroche en mouvement (A1, A2), libellé RÉACTION (A4), « Zéro » (image-005-04 + E2), barre qui tombe à l'heure (E3), chute vers la couronne éteinte (E1), sous-titre orange sur orange (image-005-07), whoosh sur les mots clés (son-03), légende et épinglé (R02, E1 emballage).
4. Publier le 005.
5. Lot fermé du 006 : cœur à l'endroit (image-006-01), image doublée à 10,73 s (R4), CRIT-02, CRIT-05, étiquettes hors zones (image-006-07), battement audible (son-01), légende (E2).
6. Tout ce qui touche au kit, au moteur 3D ou au gabarit part sur le 007.

### CRIT-02 — 006 : le compteur CHANCES contredit la source et le massage (impact 4, gratuit)
`main.js:158` : `chancesAt = 100 − 10 × s / 60`, sans condition. Le témoin masse dès T+0:47 (`film_03`). La source n° 2 du dossier dit −10 à 12 % par minute sans massage, −3 à 4 % avec. Le film affiche donc que masser ne change rien, alors qu'il demande au spectateur de masser. 72 % au choc dépasse aussi la fourchette sourcée (50–70 % pour un choc dans les 3 à 5 minutes).
Correctif : pente à −10 %/min jusqu'à `chaine:masse`, puis ≈ −3,5 %/min (≈ 85 % au choc), le compteur ralentit visiblement sur « et masse ». La voix ne dit pas le chiffre : aucun crédit. Mettre à jour `sources` et le commentaire de tête de `main.js`. À montrer à Merwan (valeur finale affichée).

### CRIT-03 — 005 : pas de panne sur la ligne d'alimentation à 0,3 s (impact 4)
Voir A1. Correctif : mouvement de caméra dès l'image 1 (A2) ; l'événement sur « Panne » est la coque de verre qui s'assombrit (shell 1 → 0,45), jugée au `look` à 270 px, ou rien d'autre que le mouvement et le son. `feed`, couronne et étiquette « sous tension » intacts jusqu'à 9,24 s.

### CRIT-04 — 005 : « RÉACTION », pas « PUISSANCE » (impact 3)
Voir A4. Libellé « RÉACTION 100 % » dès l'image 0, le même qu'à l'acte 3.

### CRIT-05 — 006 : remonter la pose d'arrivée de la chute (impact 3)
Voir A5. POSE0/FIRST inchangés (boucle). Pose d'arrivée (≈ ligne 169) : `shift` ou `ty` pour que le corps finisse entre y ≈ 700 et 1150, rapprochement modéré tant que la boîte reste à x < 900. `look` à 0,8 / 1,2 / 2,5 / 3,8 s.

### CRIT-06 — 006 : garder le CTA commentaire sur l'établi (impact 3, décision Merwan)
Voir A6. Avec l'ordre actuel (like, commentaire, abonnement, boucle), le hall au commentaire donne établi → hall → établi → hall en 20 s et montre la boîte avant la boucle. Pour le 006 : version légère (orbite lente, un geste par CTA). Pour le 007, à écrire dès le script : like, abonnement, puis commentaire en dernier, dans le décor de la boucle. Réordonner les phrases du 006 sans reprise n'est pas garanti : les coupes se calent sur le silence entre phrases voisines d'une même prise (`scripts/lib/episode.mjs:168-171`).

### CRIT-07 — Passe téléphone (compte, impact 4, décision Merwan)
Toutes les preuves de lisibilité (H5, H7, H8, OUT-07, moteur 3D) viennent d'images arrêtées en pleine résolution. La seule référence réelle est la capture iPhone du 06/10. Demander à Merwan : regarder `005-…-iphone.mp4` et `006-…-iphone.mp4` sur son téléphone, puis, s'il l'accepte, charger le 005 dans l'app jusqu'à l'écran de publication (sans publier) et envoyer trois captures : aperçu plein écran, légende telle qu'elle est tronquée, choix de la couverture. Ce qu'il lit sans effort sort de la liste.

### CRIT-08 — Une seule fiche pour Merwan (compte, impact 4)
Six constats demandent les mêmes courbes (ACC-12, R01, R12 rythme, VR-02, VR-07 références, E11) et huit proposent des reprises de voix séparées.
- Mesures : courbe de rétention, durée moyenne, % qui finissent, abonnés gagnés, sources de trafic, heure de publication pour 001 à 004 ; ce qui a été réellement épinglé sous 003 et 004 (254 et 339 caractères écrits dans `post.pinned`).
- Écoutes dans la cabine : 005 (accroche, « Toute la question… », like, boucle), 006 (accroche, chute, les trois CTA), habillage sonore.
- Crédits, en une annonce : boucle 005 (≈ 86), accroche 006 (≈ 68), et seulement s'il les demande : `boite` 005 (≈ 48), like 005, `repart` 006, `abo` 006 si le 007 change. Coûts exacts à faire annoncer par `npm run voice`.
- Décisions : sujet du 007, cadence (005 puis 48 h), titre de couverture du 005.

### CRIT-09 — L'exactitude n'a pas été auditée (méthode, impact 3)
Quatorze dimensions, aucune sur les faits. Relevé en une lecture : CRIT-02 ; CRIT-04 ; le teaser « 0,5 s pour quitter l'avion » déjà affiché dans le 006 et noté « à vérifier » dans ses propres sources ; les épinglés des 005 et 006 (353 et 311 caractères) qui portent la réponse promise par la voix.
Règle à écrire : avant la voix, une passe « chaque nombre dit ou affiché → sa ligne de `sources` », à la main ; un compteur du HUD suit la même source que la phrase qui l'explique ; un teaser n'affiche aucun chiffre non sourcé.

### CRIT-10 — Impacts à recaler (impact 2)
- image-005-01 (« le climax est filmé de loin », impact 5) : sur `film_06`, la cuve est petite pendant ≈ 1,5 s (« Plus de mille tiges plongent »), puis le cœur vert remplit le cadre de « poussent » à « 2 s ». Impact 3 ; le correctif se réduit à avancer la poussée déjà prévue par E3.
- image-006-01 (« cœur filmé à l'envers », impact 5) : confirmé sur `film_07`, pointe en haut et vaisseaux en bas pendant tout le choc, à l'endroit seulement sur « Voilà le secret ». Reste le premier correctif d'image du 006.

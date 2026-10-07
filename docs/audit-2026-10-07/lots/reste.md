# Lot « reste » — 34 constats vérifiés, du plus fort impact au plus faible

Les rapports détaillés (propositions précises, esquisses de code) : C:/Users/MERWA~1.ORD/AppData/Local/Temp/claude/C--Users-merwa-ORDI-MERWAN-Documents-systems-decoded/33c1cc51-26d4-4646-9e1f-607ded707c28/scratchpad/audit/<dimension>/rapport.md — la dimension est le préfixe de chaque identifiant.

### recit/R01 — Aucune courbe de rétention relevée sur les quatre films en ligne
[impact 5 (auditeur 5) · confirme · cible compte · besoin : mesure · effort S]
- OÙ : 001 à 004 ; rapport § 9.1 (points : 3 s, fin du C, « on l'ouvre », déclenchement, fin de chute, mot « like », dernière seconde)
- PREUVE : Quatre films publiés, aucun chiffre noté ; tout l'audit est du raisonnement. Tableau des sept instants par film fourni au § 9.1.
- POURQUOI : La « survie de la queue » (% dernière seconde ÷ % fin de chute) décide de tout : sous 60 % la restructuration s'impose, au-dessus de 75 % on ne touche qu'à l'ordre.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Demander dès maintenant 001 et 002, puis 003 et 004 à partir du 07/10 au soir. Ne pas bloquer la publication du 005 sur ces chiffres : c'est à Merwan de décider. Traiter les seuils 60/75 % comme des repères à recaler sur les premières courbes, pas comme des règles.
- CONTRE-VÉRIFICATION : Vérifié dans CLAUDE.md (section Dossiers) : 001 à 004 portent tous « Chiffres à demander à Merwan », aucun chiffre noté. Tout le reste de l'audit (queue, « Like », ordre des CTA) est du raisonnement sans donnée. Deux réserves : les seuils 60 % / 75 % de « survie de la queue » sont arbitraires, et 003/004 n'ont pas encore leurs 24-48 h (004 : à partir du 07/10 vers 17 h).

### veille-retention/VR-02 — Rien n'est mesuré : protocole, cibles et règles de décision
[impact 4 (auditeur 5) · confirme · cible compte · besoin : mesure · effort S]
- OÙ : CLAUDE.md, section « Dossiers » (001 à 004 « chiffres à demander ») ; instants de lecture tirés de scratchpad/timing/script_00X.txt
- PREUVE : Les vidéos en ligne forment une expérience gratuite : 002 ouverture fixe (0,66), 003 fixe (1,01) et accroche criée, 004 en mouvement (5,80) et voix posée. Aucune courbe relevée.
- POURQUOI : Sans courbes, tout le reste est inférence. Les vues se jouent en 1 à 5 jours (Socialinsider). La comparaison 002/003 contre 004 à 3 s dira ce que coûte une ouverture figée ou criée.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Présenter les cibles comme des repères provisoires et ne pas écrire de règle de décision dans CLAUDE.md sur un seul écart entre deux vidéos.
- CONTRE-VÉRIFICATION : CLAUDE.md confirme « chiffres à demander » pour 001 à 004 et aucune courbe relevée ; les instants de lecture du tableau correspondent à script_005.txt et script_006.txt. Demander les courbes ne coûte rien et conditionne tout le reste. Deux réserves : CLAUDE.md prévoit déjà cette demande (l'apport est le protocole, pas l'idée), et la comparaison 002/003 contre 004 est confondue (sujets différents, en-tête du 002 sous la barre de recherche, voix criée du 003, trois vidéos le même jour) : elle donnera un indice, pas une preuve. Les cibles (70 %, 25 s, 12 %) sont inventées, l'auditeur le dit.

### outillage/OUT-01 — look et cover rendent sur le processeur : 100 à 1 000 fois trop lent
[impact 4 (auditeur 5) · confirme · cible pipeline · besoin : rien · effort S]
- OÙ : scripts/look.mjs:28, scripts/cover.mjs:34, scripts/lib/chrome.mjs
- PREUVE : bench.mjs sur le 006 : SwiftShader 2 136 à 14 154 ms par image ; D3D11 (RTX 3080) 10 à 29 ms. Même image à l'œil (bench_cote.jpg, 45 s).
- POURQUOI : Chaque cadrage essayé coûte une minute : on en essaie huit au lieu de quarante. C'est la boucle de travail qui décide de la qualité des plans.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : GPU pour look (outil de cadrage) avec repli SwiftShader annoncé. Laisser cover en logiciel, ou comparer une couverture GPU à l'actuelle avant de basculer : c'est une image publiée, une seule image, aucun gain de temps. Le film final reste rendu par HyperFrames (mode « software » par défaut dans son dist) : ne pas juger un détail fin (bloom, anticrénelage) sur un look GPU.
- CONTRE-VÉRIFICATION : Banc relancé par moi (copie de bench.mjs dans verif/, 006) : SwiftShader 1 906 à 13 110 ms par image ; D3D11 sur la RTX 3080 10 à 28 ms (419 ms à la compilation des shaders), chargement 1,8 s contre 5,0 s. look.mjs:28 et cover.mjs:34 lancent bien Chrome avec --enable-unsafe-swiftshader. bench_cote.jpg : même image à l'œil. Réserves : le temps total d'un look compte aussi le build (esbuild, voix, habillage) et le chargement, donc « moins de cinq secondes » est optimiste ; le gain est sur la boucle de travail, pas directement sur le film : 4 plutôt que 5.

### accroches/ACC-08 — Trois règles d'accroche qui manquent à la méthode
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : rien · effort S]
- OÙ : CLAUDE.md, section « L'accroche, c'est 99 % du travail »
- PREUVE : Quatre films sur cinq n'ont aucun évènement à l'image avant 2,5 à 4,6 s. « Toi » est dans l'image des 002-004, pas des 005-006. Le C n'est la question du CTA commentaire que dans 002 et 006.
- POURQUOI : La méthode ABC règle le texte et la voix ; rien n'y oblige l'image à bouger dans la première seconde.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Écrire une seule règle nouvelle : l'image bouge dans la première seconde et ne se fige pas avant 5 s — notée comme hypothèse à confirmer par les courbes des 002-004. Ajouter « environ 30 mots pour A, B, C » comme ordre de grandeur. Pour le C : renforcer la phrase existante (noter que 003-005 ne l'ont pas respectée), pas de nouvelle règle. Ne pas écrire « toi dans la première image ».
- CONTRE-VÉRIFICATION : Jugé sur les pièces du rapport. La preuve est fausse d'après le tableau de l'auditeur lui-même : 004 et 006 ont leur premier évènement à 0 s, donc trois films sur cinq, pas quatre. La règle « le C est la question du CTA commentaire » est déjà dans CLAUDE.md (« C · Curiosité … avec l'appel au commentaire » ; « Commentaire : la question du C revient ») : elle n'a pas été suivie sur 003-005, ce n'est pas un manque de la méthode. « Toi dans la première image » est un goût : il exclut des sujets entiers et le 006 montre par nature quelqu'un d'autre. Aucune courbe ne soutient encore le seuil de 1 s ni celui de 30 mots.

### accroches/ACC-12 — Le classement reste à vérifier sur les courbes
[impact 3 (auditeur 3) · confirme · cible compte · besoin : mesure · effort S]
- OÙ : 002, 003, 004 (en ligne)
- PREUVE : Aucun chiffre TikTok dans le dépôt (CLAUDE.md : « chiffres à demander à Merwan »).
- POURQUOI : 004 bouge dès 0 s, 002 et 003 sont figés 3,5 et 2,5 s, 003 a le texte le plus court et une accroche criée : la rétention à 2, 5 et 10 s départage ces hypothèses.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Le faire en premier, avant toute dépense de crédits sur ACC-02 ou ACC-05 : les chiffres des 003 et 004 sont disponibles depuis cet après-midi. Demander aussi le 001 comme point de repère.
- CONTRE-VÉRIFICATION : Vrai : aucun chiffre TikTok dans le dépôt, CLAUDE.md le dit pour chaque dossier, et la demande est déjà prévue par la section « Après publication » — l'apport est de préciser les points à relever (2, 5, 10 s). Réserve : trois films d'un compte neuf, sujets différents, 002 publié avant le recalage des zones, 003 crié — les écarts seront des indices, pas des preuves.

### recit/R12 — Gabarit : on demande plus longtemps qu'on ne montre le système agir
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : decision_merwan · effort L]
- OÙ : 6 films, rapport § 1.2 et § 3 ; teaser 007 : 006 à 75,3–80,3 s ; 002 `boite` 20,9–27,0 s
- PREUVE : Bloc CTA + boucle 17,7–21,4 s contre acte 3 14,3–18,6 s. Énumération « Un A. Un B. Et… un C. » 6/6. Teaser 007 donne la réponse (« une fusée sous le siège »), sujet non validé.
- POURQUOI : Le rituel de fin coûte la complétion, donc les relectures et la portée ; l'inventaire de pièces est le moment « fiche technique ».
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Deux sujets séparés. (1) Avant publication du 006 : faire valider le sujet du 007 et récrire le teaser sans donner la réponse (reprise de `abo`, coût à annoncer). (2) Gabarit du 007 : ne le changer qu'après les courbes de 001-004 ; d'ici là, retenir ce qui ne contredit aucune règle : acte 3 plus long, « toi » dans chaque acte, CTA commentaire = réponse au C montrée à l'image (modèle 002).
- CONTRE-VÉRIFICATION : Mesures recoupées sur 005 et 006 : acte 3 = 15,0 s et 18,6 s, bloc CTA + boucle = 18,7 s et 19,7 s. Le chiffre tient (la comparaison exclut la chute de l'acte 3, ce qui la durcit). Teaser du 007 vérifié : il donne la réponse, sur un sujet que CLAUDE.md dit « à faire valider par Merwan ». Mais le gabarit proposé contredit des règles écrites sans donnée : 70-76 s contre 75-95 s, « cœur seul nommé » contre « énumération courte, puis on isole le cœur », ordre des CTA. « Le rituel de fin coûte la complétion » n'est pas mesuré.

### voix/V8 — Règle d'accroche : [tense] descend sur les phrases closes courtes
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : rien · effort S]
- OÙ : prises.txt (registre selon la longueur) ; CLAUDE.md, tableau des balises
- PREUVE : [tense], 36 mesures : phrases de moins de 5 mots −1,4 dt, phrases longues +0,3 dt. [firm, matter-of-fact] : courtes +1,0 dt.
- POURQUOI : Explique l'accroche grave du 006 et celle du 005 (−1,9 dt) : ce n'est pas un hasard de prise, ça se reproduira.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Garder comme hypothèse, pas comme règle : la reprise de l'accroche du 006 (si Merwan la demande) teste justement [firm, matter-of-fact] et [tense] avec virgule ; écrire la règle après ce résultat. Le contrôle après séance (niveau, registre, débit de l'accroche) est bon à garder.
- CONTRE-VÉRIFICATION : prises.txt (l.16–20) confirme −1,4 dt sur les phrases courtes sous [tense] (n = 15, soit cinq phrases × trois prises, non indépendantes). Mais : l'effet de longueur existe aussi sous [calm] (−1,3) et [low, grave voice] (−4,0), ce n'est pas propre à [tense] ; le niveau de ces phrases courtes est à +0,4 dB, donc la règle n'explique pas les −2,8 dB de l'accroche du 006 ; [firm, matter-of-fact] « courtes +1,0 dt » repose sur n = 6 (deux phrases), jamais sur une accroche ; l'accroche du 005, 13 mots avec une phrase longue, sort quand même à −1,9 dt, ce qui contredit « au moins 8 mots ». Le CLAUDE.md dit déjà que c'est le texte qui donne le ton.

### voix/V9 — Le tableau des pauses du CLAUDE.md est faux : [short pause] dure 0,36 s, la virgule rien
[impact 3 (auditeur 3) · confirme · cible methode · besoin : rien · effort S]
- OÙ : CLAUDE.md, ligne « ... / MOT / [short pause] » ; prises.txt (pauses écrites)
- PREUVE : [short pause] : 0,36 s en moyenne (0,25–0,63), 0 raté sur 54. « ... » : 24 ratés sur 75. « : » : 26 sur 78. Virgule : 84 non jouées sur 93.
- POURQUOI : On écrit des scripts en comptant sur 0,8 s de pause qui n'existent pas, et on compense avec des hold trop longs.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Corriger la seule ligne du tableau ([short pause] ≈ 0,35 s, fiable ; au-delà de 0,5 s : hold). Laisser de côté le budget de mots et le plafond de silences tant qu'aucune courbe de rétention ne les appuie.
- CONTRE-VÉRIFICATION : Vérifié dans prises.txt (l.28–31) : [short pause] 54 mesures, 0,36 s acoustique en moyenne (0,25–0,63), aucun raté ; « ... » 24 ratés sur 75. Le « environ 0,8 s » du CLAUDE.md est donc faux d'un facteur deux. La statistique des virgules est sans portée (une virgule n'est pas censée faire une pause) et ne touche pas la règle de la virgule finale, qui parle de suspension. Le « budget 240 mots, silences ≤ 19 % » ne découle pas de cette mesure.

### voix/V10 — npm run voice ne signale ni l'accroche en retrait, ni le CTA pressé, ni le jeu resserré
[impact 3 (auditeur 3) · confirme · cible pipeline · besoin : rien · effort M]
- OÙ : scripts/voice.mjs l.225–278
- PREUVE : 006 accroche montée à −2,8 dB : aucun drapeau. 005 comment à 7,1 syll/s : aucun drapeau (seuil rate > 3, l.262). σ registres jamais calculé.
- POURQUOI : Trois défauts de ce rapport auraient pu sortir tout seuls à la séance, avant le montage de l'image.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ajouter « accroche en retrait » (niveau < −1 dB ou registre < −1,5 dt, pour ne pas lever sur le 004) et « CTA pressé » ; le σ des registres en simple information, sans pénalité. Ces drapeaux ne doivent pas changer le choix des prises déjà montées des 005 et 006.
- CONTRE-VÉRIFICATION : Vérifié dans scripts/voice.mjs l.240–275 : aucun drapeau sur le niveau ou le registre de l'accroche (seulement « silence dans l'accroche » et « crié ») ; « trop pressé » ne se lève que pour l'intention « posé » et rate > 3 ; aucune mention de CTA dans tout scripts/ — alors que le CLAUDE.md affirme que npm run voice signale un CTA dit trop vite. Faisable avec les mesures existantes. Réserve : le drapeau σ < 1,8 hérite de la faiblesse de V7.

### rythme/R2 — 005 et 006 : tunnel des CTA sans évènement visuel
[impact 3 (auditeur 4) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : 006 : 65,8–80,5 s (main.js:390-409) ; 005 : 64,7–84,0 s (main.js:322-339)
- PREUVE : Trou sans temps fort de 14,7 s (006), 8,6 s puis 10,6 s (005). Énergie CTA 0,46 et 0,38 contre 1,05 dans le 003. frames/006/film_09-10.jpg : boîtier fermé immobile quinze secondes.
- POURQUOI : C'est là qu'on demande like, commentaire et abonnement, et l'image n'offre plus rien à regarder.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne garder que les gestes qui démontrent la phrase : 006 commentaire — coupe vers la boîte au mur sur « elle est où ? » (BOXCLOSE), le panneau typeAnswer sorti avant la coupe ou rentré après ; 005 commentaire — la braise orange au fond du cœur sur « il chauffe encore » (chaleur résiduelle). Pour le like, agrandir le sujet et donner un vrai mouvement de caméra plutôt qu'un geste gratuit. Abandonner l'éclair « fusée » et le couvercle sur « témoin ».
- CONTRE-VÉRIFICATION : Vu sur frames/006/film_09.jpg et frames/005/film_10.jpg : le boîtier et la bobine restent à la même place pendant les CTA ; seuls les panneaux de la zone haute (likeNet, typeAnswer, prochain dossier) et une orbite lente vivent. Réel, mais la mesure (MAD ≥ 3 sur toute l'image) ne voit pas ces panneaux, qui sont précisément le « moment d'image » exigé pour chaque CTA. Plusieurs gestes proposés illustrent « à peu près » : le couvercle qui s'ouvre sur « il y a un témoin » n'a pas de rapport avec la phrase ; l'éclair signal sur « fusée » met en scène un 007 que Merwan n'a pas validé ; une coupe vers le hall pendant que le panneau de réponse est affiché viole « rien d'un plan ne déborde sur le suivant ».

### rythme/R12 — Première coupe tardive : à trancher par la rétention
[impact 3 (auditeur 3) · confirme · cible compte · besoin : mesure · effort S]
- OÙ : 0–25 s des 003 et 004 (en ligne)
- PREUVE : Première coupe à 9,6 s (004), 19,9 s (003), 22,4 s (006), 23,5 s (005). Le plan-séquence du 006 reste vif (6 % de calme), celui du 005 non (36 %).
- POURQUOI : Nos mesures ne disent pas si un acte 1 sans coupe retient mieux ou moins bien ; seule la courbe TikTok le dit.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Demander à Merwan les courbes des 003 et 004 (et 001/002 pour mémoire), en notant ces deux biais ; ne recaler aucun seuil sur une seule comparaison.
- CONTRE-VÉRIFICATION : Jugé sur le rapport. Demander les courbes est déjà prévu par le CLAUDE.md (003 et 004 : à partir du 2026-10-07 après-midi) ; l'apport est de préciser quoi regarder (0–25 s, première coupe). Deux réserves : le 003 est aussi le seul film dont l'accroche est criée, donc 003 contre 004 ne sépare pas « plan-séquence » et « cri » ; et le 002 en ligne est l'ancienne version (publiée avant d'être refaite) : sa courbe ne correspond pas au fichier renders/002 mesuré ici.

### emballage/E4 — 001–004 : légendes sans mot-clé, encore modifiables quelques jours
[impact 3 (auditeur 3) · affaibli · cible compte · besoin : decision_merwan · effort S]
- OÙ : post.caption de 001, 002, 003, 004 ; app TikTok → ••• → Modifier la publication
- PREUVE : compte.mjs : « détecteur de fumée », « airbag », « ascenseur » absents des légendes ; elles commencent par « Il », « Le câble », « Ta main ». « Dossier 00X » : 0 légende sur 6.
- POURQUOI : Quatre vidéos en ligne invisibles à la recherche. La fenêtre de modification serait de 7 jours (sources secondaires) : 12/10 pour 001, 13/10 pour 002–004.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Relever d'abord les chiffres à 24–48 h (déjà dus), noter la part « Recherche », puis modifier ; ajouter #differentiel au 004. Épinglés 003/004 : demander ce qui a réellement été posté.
- CONTRE-VÉRIFICATION : Légendes vérifiées : le nom du sujet manque dans 001, 002, 003 (et 004 dit « disjoncteur », pas « différentiel »). Fenêtre de 7 jours, une modification par jour : recoupée par d'autres sources secondaires, aucune officielle. « Invisibles à la recherche » est exagéré : #detecteurdefumee, #airbag, #ascenseur sont en hashtag et le titre est à l'écran tout le film. Effet d'une modification sur la diffusion d'une vidéo en ligne : inconnu.

### emballage/E5 — Série sans lien arrière ni routine d'après-publication
[impact 3 (auditeur 3) · affaibli · cible methode · besoin : rien · effort S]
- OÙ : bloc post (nouveaux champs replies, followup) ; CLAUDE.md « Avant de livrer »
- PREUVE : cta_abo_006_005.png : le film annonce le suivant, rien ne renvoie aux précédents. Playlists fermées sous 10 000 abonnés environ (sources). Aucune étape de publication écrite.
- POURQUOI : Qui finit le 006 ne sait pas que cinq dossiers existent. Et répondre à un commentateur est la seule notification gratuite vers quelqu'un de déjà conquis.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Garder : épinglé + réponses, un seul « followup » sous l'épinglé du dossier précédent, #systemedecode. Répondre aux commentaires au cas par cas, sans message copié. « Dossier 00X » dans la légende : facultatif.
- CONTRE-VÉRIFICATION : Jugé sur pièces. Vrai : aucun lien arrière, aucune routine écrite ; seuil des playlists (10 000 abonnés) recoupé par des sources secondaires. Mais répondre à chaque commentateur du dossier précédent par le même message promotionnel ressemble à du spam, et « 60 min de réponses » engage le temps de Merwan. « Valider le 007 avant de publier le 006 » est déjà noté dans CLAUDE.md.

### emballage/E6 — Couvertures : numéro illisible, six vignettes vert sombre, aucune promesse
[impact 3 (auditeur 4) · affaibli · cible pipeline · besoin : decision_merwan · effort M]
- OÙ : scripts/cover.mjs:12-24 et :58 ; episode.json → cover
- PREUVE : grille_3x4_130.png : « DOSSIER 00X » (46 px) fait 5,5 pt ; 006 = dalle noire, 005 = tige grise, aucune couleur signal. compare_130.png : la cuve au cœur orange et l'armoire verte se lisent d'un coup d'œil.
- POURQUOI : La grille doit convaincre en trois secondes : on y voit six objets sombres qu'on ne reconnaît pas sans lire, et la numérotation de la série ne se lit pas.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Certain et peu coûteux : numéro en grand (veille), ligne de marque retirée, pose du 006 plus claire. Première image et ligne de promesse : un essai sur 005 et 006, jugé à 130 px par Merwan, pas une règle.
- CONTRE-VÉRIFICATION : Vérifié sur grille_3x4_130.png : « DOSSIER 00X » est illisible, le 006 est sombre sur sombre, aucune couleur signal. Mais les titres se lisent très bien et 001, 002, 004 se reconnaissent : « six objets qu'on ne reconnaît pas » est exagéré. La maquette m005_a.png n'est pas meilleure : cuve petite et pâle sur noir, « NUCLÉAIRE » mord sur la couronne, la ligne de promesse n'a jamais été vue. Remplacer la vue éclatée par la première image change une règle écrite de CLAUDE.md, et 001–004 garderaient l'ancienne mise en page.

### emballage/E11 — Trois dossiers le même jour, pas de créneau, aucune mesure d'emballage
[impact 3 (auditeur 3) · affaibli · cible compte · besoin : decision_merwan · effort S]
- OÙ : CLAUDE.md « Dossiers » et « Après publication »
- PREUVE : 002, 003 et 004 publiés le 06/10. Les chiffres demandés jusqu'ici portent sur la rétention, pas sur la recherche ni sur le profil.
- POURQUOI : Impossible de savoir quelle accroche a tenu, ni si le profil convertit. Sans la part « Recherche » et le rapport vues du profil / abonnés, l'emballage se règle à l'aveugle.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ajouter à « Après publication » : sources de trafic, requêtes de recherche, vues du profil, abonnés par jour, heure de publication notée. Cadence et heure : proposition à Merwan, à régler sur l'activité de ses abonnés.
- CONTRE-VÉRIFICATION : Jugé sur pièces. Vrai : 002, 003, 004 le 06/10 (CLAUDE.md), et aucune mesure de recherche ni de profil n'est demandée. Les créneaux horaires viennent de blogs d'outils, non recoupés. La cadence est une décision de Merwan, pas seulement une mesure.

### veille-retention/VR-04 — « Like », premier mot du bloc CTA depuis le 003 : le seul appel que TikTok dit étouffer
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : reprise_voix · effort S]
- OÙ : 003 à 64,40 s, 004 à 64,28 s, 005 à 66,07 s, 006 à 65,83 s (vo « Like. [short pause] … ») ; CLAUDE.md, « Appels à l'action »
- PREUVE : Le 002 ouvrait le bloc par une information. NYT / « TikTok Algo 101 » : système réglé pour repérer et étouffer le « like bait ». WSJ : les likes pèsent moins que le temps passé. Rien ne prouve qu'un like motivé est pénalisé.
- POURQUOI : Signal le plus faible des trois, seul nommé comme cible d'un filtre, et mot qui annonce la fin du film, suivi de 0,8 s de silence dans le 006 : on échange un signal fort (finir la vidéo) contre un faible.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne rien changer aux 005 et 006. Lire d'abord la courbe des 003/004 autour de 64 s contre celle du 002 autour de 74 s. Pour le 007 (script non écrit, gratuit), proposer à Merwan la forme du 002 : la phrase commence par un fait, « like » arrive en fin de phrase, sans pause tenue après le mot — les trois CTA parlés restent.
- CONTRE-VÉRIFICATION : Faits vérifiés : « Like » est le premier mot du beat dans 003, 004, 005, 006 ; le 002 commençait par un fait. Le document « TikTok Algo 101 » pénalisant les vidéos qui demandent explicitement un like est recoupé (Business Insider, Gizmodo). Mais : document de 2021, aucune preuve qu'un like motivé soit filtré (l'auditeur le dit) ; le correctif contredit une règle de méthode de Merwan (trois CTA, chacun avec sa phrase et son moment d'image) ; et pour 005/006 les options A, B, C changent toutes les mots dits : c'est « reprise_voix » (B et C coûtent des crédits, A exige un remontage de la voix et le retrait de likeNet), pas seulement « decision_merwan ». Deux films finis ne se rouvrent pas sur une hypothèse.

### veille-retention/VR-11 — Règle manquante dans la section accroche : « ça bouge dès la première demi-seconde »
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : rien · effort S]
- OÙ : CLAUDE.md, sous « La première image » ; frames/002/hook_01.jpg, frames/003/hook_01.jpg, frames/005/hook_01.jpg, frames/006/hook_01.jpg
- PREUVE : CLAUDE.md demande une première image « la plus forte » qui tient sans le son, rien sur le mouvement. YDIF 0–1 s : 002 0,66, 003 1,01, 005 0,28 (image arrêtée) ; 004 5,80, 006 8,14 (action).
- POURQUOI : Règle la mieux étayée par ce qu'on sait : visionnage moyen 3,75 s, accroche dans les 6 premières secondes, attention captée par le démarrage d'un mouvement. À confirmer par 002/003 contre 004 quand les courbes arrivent.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ajouter une phrase sans seuil ni renvoi à qa : « La première image bouge : ce que dit la phrase A se passe à l'écran pendant qu'elle est dite (006 : quelqu'un tombe). » Le seuil chiffré attend VR-07 et les courbes.
- CONTRE-VÉRIFICATION : Le constat de départ est exact (CLAUDE.md ne dit rien du mouvement ; 005 ouvre fixe, 006 ouvre sur une chute, vérifié sur les planches). Mais la règle proposée cite un contrôle de qa qui n'existe pas, avec un seuil (2 sur trois secondes) calé sur cinq films sans aucune donnée de rétention, et l'auditeur reconnaît qu'elle reste à confirmer par les courbes. Abrams & Christ porte sur la recherche visuelle en laboratoire, pas sur le balayage d'un fil. Le 002, « modèle à étudier », ouvre fixe.

### veille-retention/VR-08 — Trois vidéos le même jour, deux prêtes : une cadence qui laisse lire chaque courbe
[impact 3 (auditeur 3) · affaibli · cible compte · besoin : decision_merwan · effort S]
- OÙ : CLAUDE.md, « Dossiers » : 001 le 5 octobre ; 002, 003 et 004 le 6 octobre ; 005 et 006 rendus
- PREUVE : Buffer (11,4 M de publications) : publier plus ne pénalise pas la médiane, gain surtout entre 1 et 2–5 par semaine. Aucune pénalité documentée à trois par jour. Le 003 et le 004 se sont partagé le même public d'essai.
- POURQUOI : La règle « l'épisode suivant s'écrit avec la courbe du précédent, 24 à 48 h après » est impossible à tenir quand trois dossiers sortent ensemble.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Proposer une seule chose à Merwan : publier le 005, attendre 48 h et les courbes des 003/004 avant le 006. Pas de règle d'horaire.
- CONTRE-VÉRIFICATION : Jugé sur les pièces du rapport et CLAUDE.md (001 le 5, 002 à 004 le 6 : exact). L'argument fort est interne : la règle « lire la courbe avant d'écrire le suivant » est intenable à trois par jour. Les chiffres Buffer sur la fréquence et Socialinsider ne sont pas recoupés par moi ; « le contenu dupliqué est écarté » n'est pas sourcé ; le créneau de début de soirée repose sur des études que l'auditeur dit contradictoires. La cadence est une décision de Merwan, et le 005 est annoncé par le 004 déjà en ligne.

### veille-references/VR-05 — Règle d'ouverture : un corps et un mouvement dès l'image 1
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : decision_merwan · effort S]
- OÙ : CLAUDE.md, « L'accroche » ; 007 et suivants
- PREUVE : Ouvertures avec un corps en danger : 006 (11,1), 004 (6,5). Ouvertures sur un objet : 005 (0,4), 002 (0,9). frames/006/hook_01.jpg, frames/004/hook_01.jpg.
- POURQUOI : C'est la constante du genre court, et nos propres chiffres la confirment.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : L'écrire comme préférence (« un corps en danger et un mouvement déjà commencé, l'objet promis dans le cadre »), sans seuil chiffré bloquant, et la confronter aux trois premières secondes des courbes de rétention des 002–004 dès que Merwan les donne.
- CONTRE-VÉRIFICATION : Les planches confirment l'écart (006 : un corps tombe dès l'image 1 ; 005 : cuve fixe). Mais « nos propres chiffres la confirment » est abusif : l'énergie de mouvement est une mesure maison sur cinq films, sans aucune courbe de rétention en face ; le seuil « ≥ 3 » n'est corrélé à rien. Le CLAUDE.md dit déjà que la première image est la plus forte et montre ce que dit l'accroche. L'exemple 007 (verrière qui éclate) porte sur un sujet que Merwan n'a pas encore validé.

### veille-references/VR-07 — 21 à 24 % de chaque film vient après le mot « Like »
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : mesure · effort S]
- OÙ : 002 : 74,3 s ; 003 : 64,4 s ; 004 : 64,3 s ; 005 : 66,1 s ; 006 : 65,8 s
- PREUVE : Minutages réels : 19,3 s sur 94 ; 17,1 sur 82 ; 21,0 sur 86 ; 18,0 sur 85 ; 18,8 sur 85.
- POURQUOI : « Like » annonce la fin ; les formats courts de référence n'ont pas de CTA final. La complétion est le signal qui compte le plus.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne garder que la demande de mesure (fin de chute, mot « Like », dernière seconde, sur 002/003/004). Aucune réécriture de la structure des CTA tant que les courbes ne sont pas là et que Merwan n'a pas tranché.
- CONTRE-VÉRIFICATION : Minutage recoupé sur script_005.txt : « Like » à 66,07 s, fin à 84,8 s. Mais ces 18–19 s incluent la boucle (80,34 → 84,11), qui n'est pas un CTA : les trois CTA du 005 tiennent en 13,9 s (66,07 → 79,95), déjà sous les 14 s que l'auditeur propose comme cible. Le chiffre « 21 à 24 % » est donc gonflé. Demander la rétention à ces instants est juste et déjà prévu par le CLAUDE.md. Le plan conditionnel (like ≤ 2,5 s, anecdote après les CTA) heurte la règle de Merwan « jamais à la va-vite » et sa structure (chute → CTA → boucle) : c'est sa décision, après mesure.

### veille-references/VR-08 — Quinze sujets classés, sans troisième « ça lâche quand le courant coupe »
[impact 3 (auditeur 4) · affaibli · cible methode · besoin : decision_merwan · effort S]
- OÙ : rapport.md, section 4
- PREUVE : 004 et 005 reposent tous deux sur un aimant qui lâche. Faits centraux vérifiés par recherche pour les 15 ; ceux qui restent à sourcer sont marqués.
- POURQUOI : Chaque dossier doit montrer ce que le précédent ne savait pas faire : feu, eau, chimie, écran partagé, grains, ondes.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Présenter à Merwan les cinq premiers comme un choix, pas comme un ordre. Avant tout script : re-sourcer chaque chiffre ; pour le siège, donner l'accélération en ordre de grandeur et sourcer le « 0,5 s » du teaser du 006, déjà dans le film.
- CONTRE-VÉRIFICATION : La liste respecte les décisions de Merwan (ni sprinkler ni ceinture, alternance wow / quotidien, 007 et chauffe-eau conformes au CLAUDE.md). Recoupé par une seconde source : airbag d'avalanche 22 % → 11 % (Haegeli 2014, confirmé) ; générateur au chlorate de sodium, boîtier à 260 °C, conscience utile 15–30 s après décompression rapide à 35 000 ft (confirmé, mais durée « 15 à 22 min » et non 12–22) ; Martin-Baker 7 825 à 7 829 vies en 2026 et séquence de 2 à 3 s (confirmé). Divergence : l'accélération du siège, « 12–14 g » chez l'auditeur, 14–20 g dans une autre source. Les douze autres sujets n'ont pas été recoupés dans cette passe (budget) : ce sont des pistes, pas des faits prêts pour un script. Le 014 (veille du train) et le 017 (freins magnétiques sans courant) restent proches du thème « sécurité par défaut » qu'on voulait éviter.

### image-005/image-005-12 — Huit règles de méthode pour le 007 et les suivants
[impact 2 (auditeur 3) · affaibli · cible methode · besoin : rien · effort M]
- OÙ : Rapport section 12 ; CLAUDE.md, npm run review, npm run script, npm run qa ; CTA abonnement (section 10, point 3)
- PREUVE : Tirées des constats : cuve entière ≈ 25 s dont le climax ; cinq phrases sans démonstration ; 2,16 s de caméra fixe en acte 3 ; pièces éteintes vert sombre ; bobines sans matière à d 190 ; preuve à y ≈ 1600.
- POURQUOI : Les mêmes trois causes reviennent partout dans le 005 : sans règle ni mesure, le 007 les refera.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Écrire dans CLAUDE.md, en phrases courtes, les règles 1, 3 (comme vérification à la main à l'écriture des cues), 5, 6 et 7. Seule mesure outillée raisonnable : qa signale les plages de caméra immobile de plus de 1,5 s en acte 3. Pas de pourcentage automatique dans review.
- CONTRE-VÉRIFICATION : Les règles découlent de constats confirmés, mais trois des huit sont surévaluées : la règle 8 existe déjà dans CLAUDE.md (« rien d'important sous 1600 ») ; la mesure automatique dans review (boîte englobante des pixels clairs) confondrait sujet, HUD, sous-titres et halo ; « script liste les verbes sans repère » suppose une analyse du français que l'outil n'a pas. Le seuil de 45 % de largeur est arbitraire pour un objet haut et mince (première image, verdict).

### voix/V5 — Silence de rebouclage d'une seconde sur les deux films
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : rien · effort S]
- OÙ : episode.json l.6–7 (lead 0,2, tail 0,45) des 005 et 006 ; kit/template à aligner
- PREUVE : Dernier mot → premier mot au rebouclage : 0,97 s (005), 1,13 s (006), simule.txt.
- POURQUOI : Un trou d'une seconde à la couture annonce la fin : le spectateur a le temps de partir avant le second tour.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Si on veut ≈ 0,6 s à la couture : tail 0,25 et couper la dernière tranche 0,15 s après le dernier mot (cutOut du dernier beat dans episode.mjs) au lieu de la fin de la prise. À essayer sur un brouillon et à faire entendre ; ne pas toucher au modèle avant.
- CONTRE-VÉRIFICATION : Le silence de boucle mesuré (0,97 s et 1,13 s) est juste, mais le résultat promis est faux : dans scripts/lib/episode.mjs la durée vaut fin de la dernière tranche + tail, et la dernière tranche va jusqu'à la fin de la prise (0,24 à 0,40 s de silence après le dernier mot). Les hold ne changent rien à la couture. Avec tail 0,25 : 0,77 s (005) et 0,93 s (006), pas 0,5 à 0,65 s — l'écart vient d'une erreur de 0,28 s dans simule.txt. Jugé sur pièces et sur le code, sans écoute : qu'une seconde de silence à la couture fasse partir le spectateur n'est pas démontré, et une phrase laissée en l'air a besoin d'un souffle.

### voix/V7 — Le contraste de registre s'aplatit de film en film
[impact 2 (auditeur 4) · affaibli · cible methode · besoin : rien · effort S]
- OÙ : mesures_001-003.txt, mesures_004-006.txt (σ registres)
- PREUVE : Écart-type des registres par phrase : 2,61 (003) → 2,25 (004) → 1,70 (005) → 1,22 (006). Le 006 tient dans 4,5 dt.
- POURQUOI : En retirant le cri on a retiré les hauts. « Jouée, jamais monotone » : c'est le contraste entre phrases qui fait le jeu.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Pas de cible chiffrée. Au 007 : essayer [curious] ou [thoughtful] sur une ou deux phrases hors CTA, et demander à Merwan, à l'écoute du 006, s'il le trouve monotone avant d'en faire une règle.
- CONTRE-VÉRIFICATION : Le chiffre est exact (recalculé sur les 19 registres du 006 : σ ≈ 1,2). L'interprétation ne tient pas : les σ élevés des 003 et 004 viennent des défauts que Merwan a rejetés ou que l'outil signale — les phrases criées du 003 (+7 dt), « ouvre » à −5,3 dt « plate, très grave » et la chute à −4,7 dt du 004. Un σ qui baisse, c'est d'abord ces extrêmes retirés. La variation à l'intérieur des phrases du 006 reste bonne (médiane 3,6). Personne n'a entendu le 006 monotone : Merwan ne l'a pas écouté. Une cible σ ≥ 2 pousserait à refabriquer des extrêmes, et [curious] / [thoughtful] (+1 dt) ne l'atteindraient de toute façon pas.

### rythme/R8 — Seuils de rythme à tenir dès le 007
[impact 2 (auditeur 4) · affaibli · cible methode · besoin : decision_merwan · effort S]
- OÙ : CLAUDE.md, « Avant de livrer »
- PREUVE : 006 : 16 % de calme, 4,2 temps forts/10 s ; 003 : pire trou 7,1 s ; quatre films à luminance ≥ 29,9. Rapport d'énergie après/avant la chute tombé de 0,62 à 0,28.
- POURQUOI : Les meilleurs passages de la série fixent un plancher mesurable ; le dernier tiers tourne au quart de l'énergie.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne rien inscrire au CLAUDE.md maintenant. Garder deux garde-fous qualitatifs déjà cohérents avec les règles (l'image bouge dans la première seconde ; pas de plan immobile de plus de 3 s hors hold voulu) et réévaluer les chiffres quand les courbes des 003 et 004 seront là.
- CONTRE-VÉRIFICATION : Jugé sur les pièces du rapport. Sept seuils tirés de cinq films, sans aucune donnée de rétention : l'auditeur le reconnaît lui-même. Le 002, désigné « modèle à étudier » par le CLAUDE.md, en raterait la plupart (40 % de calme, trou de 11,4 s). « Chute → fin ≤ 28 s » entre en tension avec trois CTA qui ont chacun leur phrase, leur raison et leur pause (aucun film n'y est : 29,8 à 33,4 s). Le seuil de luminance contredit le parti pris sombre.

### emballage/E8 — Pas de réponses en vidéo : les épinglés trop longs sont des scripts tout faits
[impact 2 (auditeur 4) · affaibli · cible methode · besoin : decision_merwan · effort M]
- OÙ : post.pinned de 003 et 004 ; décors src/shaft.js, src/road.js, src/room.js
- PREUVE : L'épinglé 003 (254 car.) explique pourquoi sauter ne sert à rien ; celui du 004 (339 car.) le cas « pas de bouton T ». Ce sont des mini-dossiers écrits en texte.
- POURQUOI : Entre deux dossiers d'un jour de travail, le compte n'a rien à publier. Une annexe de 15–25 s sur un décor existant tient le rythme et notifie le commentateur.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Attendre les chiffres de 003/004 et un vrai commentaire récurrent ; alors un seul essai (« et si je saute ? »), coût annoncé avant.
- CONTRE-VÉRIFICATION : Jugé sur pièces. Idée plausible mais sans preuve : aucun chiffre, on ne sait pas s'il y a des commentaires auxquels répondre. « 15–25 s sur un décor existant » sous-estime le travail (mise en scène, voix, rendu, qa) et dépense des crédits, donc accord de Merwan. L'autocollant de commentaire se place où l'on veut : réserver la zone haute n'est pas une contrainte établie.

### emballage/E9 — Bio : « Ils » sans antécédent, ni format ni rythme
[impact 2 (auditeur 3) · affaibli · cible compte · besoin : decision_merwan · effort S]
- OÙ : brand/profil.json → bio ; CLAUDE.md « Le compte »
- PREUVE : « Ils veillent pendant que tu dors. On les décode, un système à la fois. » (70 car.) : aucun exemple, pas le mot 3D, pas de cadence.
- POURQUOI : Qui arrive à froid par la recherche ne sait pas qui sont « ils » ni ce qu'il gagne à s'abonner.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Proposer la variante E (elle garde « ils veillent ») comme essai, après avoir relevé la conversion du profil sur une semaine.
- CONTRE-VÉRIFICATION : Jugé sur pièces (brand/profil.json relu : bio conforme). La bio a été choisie par Merwan le 05/10 ; « Ils » est levé par le nom du compte et la grille juste dessous. Citer trois sujets et « 3D » est défendable, mais reste un goût tant que le rapport vues du profil / abonnés n'est pas mesuré.

### emballage/E10 — Le sujet est nommé tard ou jamais ; deux hashtags sur cinq sont génériques
[impact 2 (auditeur 3) · affaibli · cible methode · besoin : rien · effort S]
- OÙ : CLAUDE.md « Le script » (post) ; episode.json → hashtags des six dossiers
- PREUVE : Nom du sujet dit : accroche (003, 005), promesse (004), chute seulement (001, 002), jamais (006). #apprendresurtiktok et #commentcamarche sur les six ; #securite et #ingenierie deux fois chacun.
- POURQUOI : TikTok plafonne à 5 hashtags et demande des hashtags précis ; les guides donnent le poids aux 50 premiers caractères et aux mots dits tôt.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Règle 007+ : nom courant en tête de légende et en hashtag ; dans la voix, « de préférence » avant 15 s, jamais au prix de l'accroche. Hashtags : 3 du sujet + #apprendresurtiktok + #systemedecode.
- CONTRE-VÉRIFICATION : Hashtags vérifiés (#apprendresurtiktok et #commentcamarche sur les six). Erreur de l'auditeur : au 004, c'est « disjoncteur » qui est dit tôt, « différentiel » n'arrive qu'aux deux tiers. Le titre est à l'écran dès la première image dans tous les films (HUD). Imposer le nom avant 15 s dans la voix contraindrait l'accroche, que Merwan valide lui-même (« boîte verte » du 006 est un choix de curiosité). Le poids des 50 premiers caractères et des mots dits tôt n'est affirmé que par des guides.

### emballage/E12 — Reels et Shorts : le même fichier, pas exploité
[impact 2 (auditeur 3) · affaibli · cible compte · besoin : decision_merwan · effort M]
- OÙ : renders/00X-*.mp4 ; bloc post (nouveau champ shorts)
- PREUVE : Les MP4 rendus n'ont pas de filigrane. Aucun champ de publication pour une autre plateforme dans episode.json ni dans le front.
- POURQUOI : Un envoi natif sans filigrane est traité comme un contenu d'origine. Deux audiences de plus pour zéro production ; rien pour les abonnés TikTok eux-mêmes.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : À remettre après le 007 : une capture de chaque interface avec nos zones par-dessus, puis décision.
- CONTRE-VÉRIFICATION : Jugé sur pièces. Les MP4 sont bien sans filigrane, mais nos zones sont réglées sur l'interface de TikTok, les CTA désignent sa colonne de boutons (chevrons .rail) et le commentaire « épinglé » : rien n'est vérifié pour Reels et Shorts. Deux comptes à créer et à tenir par Merwan, sans mesure de gain.

### veille-retention/VR-10 — Durée de 80 à 90 s confirmée ; la phrase de boucle est trop longue et commence toujours par « En attendant »
[impact 2 (auditeur 3) · affaibli · cible methode · besoin : rien · effort S]
- OÙ : Phrase de boucle : 5,6 s sur le 004, 3,8 s sur le 005, 3,9 s sur le 006 ; « En attendant » en tête dans les films 002 à 006
- PREUVE : Buffer : +43 % de portée médiane pour les plus de 60 s. Mais les recommandeurs comparent à durée égale (D2Q, WTG, plateformes sœurs). L'effet propre de la boucle n'est chiffré nulle part.
- POURQUOI : 85 s ne valent que si elles tiennent mieux que les autres vidéos de 85 s : chaque seconde qui retient moins coûte. Un spectateur de la série apprend que « En attendant » veut dire « c'est fini ».
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Pour le 007 seulement : varier l'entrée de la boucle (pas « En attendant ») et viser 4 s au plus ; ne rien toucher aux films existants.
- CONTRE-VÉRIFICATION : Faits vérifiés : « En attendant » ouvre la boucle des films 002 à 006 (scripts de minutage) ; durées 5,6 s (004), 3,8 s (005), 3,9 s (006) exactes. Buffer (+43 % de portée au-delà de 60 s, 11,3 s de visionnage médian) recoupé par eMarketer et Social Media Today. Mais « le spectateur apprend que ça veut dire c'est fini » et la cible « ≤ 3 s » sont des inférences sans mesure ; la phrase de boucle doit porter un geste à retenir et finir sur les premiers mots de l'accroche, ce qui tient mal en 3 s.

### veille-references/VR-10 — Les légendes vendent la chute et oublient le mot cherché
[impact 2 (auditeur 3) · affaibli · cible compte · besoin : decision_merwan · effort S]
- OÙ : episode.json → post.caption (005, 006)
- PREUVE : 005 : « il suffit d'arrêter de le retenir » est la chute. 006 : le mot « défibrillateur » n'apparaît que dans un hashtag.
- POURQUOI : La découverte TikTok passe de plus en plus par la recherche (blogs d'agences, ordre de grandeur) ; une série se dit dès la première ligne.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Retouche minimale : retirer la chute de la légende du 005 et glisser le mot cherché dans la première phrase de chaque légende (« réacteur nucléaire », « défibrillateur »), sans préfixe DOSSIER imposé. Abandonner la playlist tant que le compte n'y a pas droit. Les légendes sont publiées par Merwan : à lui de valider.
- CONTRE-VÉRIFICATION : Vérifié dans episode.json : la légende du 005 donne bien la chute (« il suffit d'arrêter de le retenir ») et celle du 006 ne contient pas « défibrillateur ». Mais la légende proposée pour le 006 garde elle-même le retournement (« refuse si le cœur bat »), et celle du 005 redit l'accroche, ce que la règle du CLAUDE.md déconseille. Le poids de la recherche vient de blogs d'agences, sans chiffre TikTok. La playlist n'est très probablement pas accessible : plusieurs sources indiquent un seuil d'environ 10 000 abonnés.

### outillage/OUT-11 — 006 : A·B·C finis à 10,59 s ; pas d'outil pour resserrer un silence sans crédits
[impact 2 (auditeur 3) · affaibli · cible pipeline · besoin : decision_merwan · effort M]
- OÙ : scripts/lib/episode.mjs:184 (schedule) ; episodes/006-defibrillateur/episode.json (accroche, promesse)
- PREUVE : script_006.txt : promesse finit à 10,59 s, le C commence à 9,98 s ; silences 0,54 s entre A et B, 0,63 s après « décide ».
- POURQUOI : Les trois fonctions doivent être remplies avant la 10ᵉ seconde ; ici le C tombe pile à la limite.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne rien construire avant l'écoute. Si Merwan garde l'accroche actuelle, lui proposer de choisir dans la cabine la prise de « promesse » la plus courte parmi les trois existantes (gratuit) ; l'outil trim seulement si le cas se représente.
- CONTRE-VÉRIFICATION : Chiffres du script recoupés avec texte.txt (C de 9,98 à 10,59 s). schedule() lu : un champ trim est faisable (il crée simplement une tranche de plus), mais la coupe ne tomberait plus à l'instant le plus calme du silence : risque de respiration tronquée, que seule l'oreille de Merwan peut juger. Le gain (10,59 → 10,2 s) ne passe même pas sous la règle. Surtout, la reprise de l'accroche du 006 (68 crédits) attend déjà sa décision : elle changera ce minutage de toute façon.

### moteur3d/A10b — Blocs H.264 dans les verts sombres du fichier d'origine
[impact 1 (auditeur 2) · affaibli · cible pipeline · besoin : rien · effort S]
- OÙ : 006 à 34,0 s. scripts/sd.mjs:142 (--quality high, 7,9 Mbit/s)
- PREUVE : z_e6_34_lid_gamma.png (MP4) contre z_cover6_lid_gamma.png (PNG du moteur) : dégradé propre à la sortie du moteur, en blocs dans le MP4.
- POURQUOI : Le sujet vit dans les valeurs les plus sombres, là où H.264 est le plus avare, et TikTok recompresse par-dessus.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Un seul essai, au prochain rendu final : --crf 14, puis comparer dans l'app sur le téléphone de Merwan. Ne pas en faire une règle avant.
- CONTRE-VÉRIFICATION : Jugé sur pièces, comparaison MP4/PNG non refaite. Les options --crf et --video-bitrate existent bien dans hyperframes. Mais le gain pour le spectateur n'est pas démontré : TikTok recompresse bien plus fort (le CLAUDE.md le dit), et rien ne prouve qu'une source à 16 Mbit/s en ressorte meilleure. Le fichier d'origine passerait d'environ 85 Mo à 170 Mo.

### veille-retention/VR-12 — Formats et canaux annexes : à tester une fois, pas à installer
[impact 1 (auditeur 2) · affaibli · cible compte · besoin : decision_merwan · effort M]
- OÙ : Hors film : profil TikTok, renders/ (MP4 sans filigrane), npm run snap pour une fiche en images
- PREUVE : Carrousels : +81 % d'interactions mais un tiers de partages en moins (Fanpage Karma). Instagram ne déclasse que les logos d'autres applications. Playlists réservées aux 10 000 abonnés d'après les guides. Effet de la première heure non démontré.
- POURQUOI : Leviers peu coûteux mais faiblement étayés ; risque de diluer une identité bâtie sur la 3D animée.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : À ranger en « plus tard » ; ne garder que l'épinglage immédiat du commentaire.
- CONTRE-VÉRIFICATION : Jugé sur les pièces du rapport : sources non recoupées, confiance 2 donnée par l'auditeur lui-même, et rien ici ne touche à la rétention des films. Le carrousel s'écarte de l'identité (3D animée) ; les Shorts/Reels demandent de revoir les zones sûres. Seul point utile et gratuit : épingler le commentaire dès la mise en ligne, déjà couvert par VR-06.

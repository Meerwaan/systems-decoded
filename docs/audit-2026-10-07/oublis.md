## accroches
- La voix de l'accroche du 006 sort 2 dB sous le reste du film et 2 à 3 demi-tons plus grave (CLAUDE.md) : c'est probablement un frein plus fort que 0,6 s de retard sur le C, et le niveau se corrige au mixage, sans crédit — l'audit ne regarde que le texte et l'image.
- La légende du 005 pose déjà la question du CTA commentaire (« il chauffe encore combien de temps, à ton avis ? ») : la légende et le commentaire épinglé font partie de l'accroche vue dans l'app et n'ont pas été audités.
- Sur le 006, « CHANCES 100 % » en couleur signal est le texte le plus saturé de l'image 0 et ne prend son sens qu'à 16 s ; le figurant debout traverse l'en-tête de 1,7 à 4 s et rien ne dit si c'est « toi » (rapport § 5.4-5.5, non remontés en constats).
- Le coût cumulé n'est pas chiffré : ACC-01, 04, 05 et 11 ensemble refont les dix premières secondes du 005 (look, brouillon, qa, rendu) alors que Merwan n'a pas encore écouté le film — il faut un ordre : courbes, écoute, puis les seules retouches gratuites.
- Toute retouche de POSE0 ou FIRST (ACC-07, ACC-11) change aussi la dernière image du film : le raccord de boucle et la planche review de fin sont à revérifier, ce que les constats ne mentionnent que pour le 005.

## recit
- Déplacer un beat ne raccourcit rien : la vraie mesure est le temps restant après que le danger est réglé (34 s dans le 005), que l'audit n'attaque nulle part par une coupe de texte.
- Le teaser du 007 dans le 006 affirme deux faits non sourcés (« une demi-seconde », « une fusée sous le siège ») sur un sujet non validé : point bloquant avant publication du 006, à traiter seul, pas dans le gabarit du 007.
- L'accroche du 006 est mesurée grave et 2 dB sous le reste du film dans les trois prises : c'est le premier risque de rétention du dossier, et l'audit le laisse hors constat.
- La légende du 006 promet « Elle se teste toute seule » : supprimer le beat `repos` (R05) rendrait la légende fausse par rapport au film.
- 005 et 006 sont rendus et contrôlés : chaque correctif impose un nouveau rendu, un nouveau qa et, pour la voix, un accord de crédits ; les reprises devraient être présentées à Merwan en une seule demande chiffrée (boucle 005 à 86, accroche 006 à 68, plus les nouvelles).

## image-005
- Le compteur « 100 % » en haut à droite n'a aucun libellé pendant les actes 1 et 2 (« RÉACTION » n'apparaît qu'à T+0,0) : pendant 36 s on ne sait pas ce qu'il mesure.
- Aucun arbitrage de calendrier : le 004 annonce le 005 depuis le 06/10, et une journée de reprise retarde aussi le 006 ; il faut dire à Merwan quel lot minimal (constats 01, 04, 07) justifie de publier.
- À l'image 0, la première ligne de la carte d'accroche (« PANNE DE COURANT », y ≈ 1210) est posée sur le fond de la cuve : la première image n'a pas été jugée à 270 px avec ses cartes.
- La fin n'a pas été contrôlée : le rebouclage (main.js:348-349, recul en power3.in) et l'identité dernière image / première image, que plusieurs correctifs (BAR.gap, panne à 0,3 s) peuvent casser.
- Les correctifs se conditionnent entre eux sans que l'ordre le dise : le gros plan du constat 01 met un sous-titre signal sur le combustible orange (constat 07 d'abord), et baisser shell au constat 08 impose shell: 1 à la coupe du 01.

## image-006
- L'ordre des correctifs : le constat 01 retourne la caméra de 180° sur tout le climax, donc les géométries proposées aux constats 04 et 05 (câbles, tubes, sillon, bras) sont à réévaluer après lui, pas en parallèle.
- Sous-titres clairs sur cœur clair : « TRAVERSE LE CŒUR » (48,5 s) et « S'ÉTEIGNENT » (49,75-49,9 s) sont en encre sur un cœur crème ou dans le voile blanc ; le contraste du texte au moment le plus fort n'est pas traité en tant que tel.
- À l'image 1, la phrase choc « QUELQU'UN S'EFFONDRE » est la plus petite ligne de la carte (mono, signal atténué) alors que la suite est en grand : les premiers mots de l'accroche sont les moins lisibles sans le son.
- La carte B « AU MUR UNE BOÎTE VERTE PEUT LE SAUVER » est déjà affichée à 4,2 s sur un cadre où la boîte n'est plus visible : la phrase n'a pas son image pendant près d'une seconde.
- L'étiquette « CONDENSATEUR … J » (chip-charge, 43,6 s) partage les décalages de chip-ready et frôle la colonne des boutons : absente de la liste des quatre étiquettes.

## enchainements
- Dans le 005, shot() n'a pas le paramètre fromD (main.js l.82) : les plongées proposées (E1, E3, E6) se feraient en centimètres, contre la règle « une plongée change par rapport » ; porter le shot() du 006 dans le 005 est le préalable.
- Aucun correctif n'a été contrôlé contre les zones TikTok ni contre l'anti-scintillement : chaque nouveau mouvement (57 barres rayées, couronne lumineuse, traits fins de Chicago) doit passer look puis un brouillon avec qa avant d'être retenu.
- L'ordre de publication n'est pas pris en compte : le 005 sort en premier et les deux films attendent l'écoute de Merwan ; lui proposer un lot court pour le 005 (E3, E1 sans rallumage, champ de E2, dérives de E10) plutôt que douze chantiers.
- La mesure « scene » inclut la zone haute (436–790) : un panneau animé cache une 3D gelée, donc les 46 % / 30 % ne comparent pas vraiment les deux films.
- Le hold proposé sur le beat repos du 006 décale tout le minutage en aval : pas de crédits, mais voix.wav, bed.wav et les repères sont reconstruits et le film doit repasser en review.

## habillage
- La boîte #next descend déjà à y ≈ 886-902 sur toute la largeur (x 88-992) : elle sort de la zone haute (436-790) et son coin bas droit passe sous la colonne de boutons TikTok (x > 905 dès y 880) ; l'audit l'agrandit au lieu de la raccourcir.
- Aucune des tailles « illisibles » n'a été vue sur un téléphone : la seule référence réelle est la capture iPhone de Merwan du 06/10 ; une image regardée sur l'iPhone trancherait H5, H7 et H8 avant d'y passer une journée.
- Tout correctif du kit impose de rendre à nouveau 005 et 006 (render --draft, qa, render, cover, phone) alors que le 005 est le prochain à publier : l'audit ne dit pas s'il faut retenir la publication ni dans quel ordre.
- brand.css et overlay.js sont partagés : les changements valent aussi pour 002-004 et pour les couvertures (npm run cover) si on les régénère ; l'audit ne vérifie que 005 et 006.
- Le compteur du fil rouge (« CHANCES 100 % », « RÉACTION 0 % ») porte le récit et son libellé est en 20 px dans l'en-tête ; l'audit le remonte à 24 px en passant sans le traiter comme un élément d'histoire (son passage au vert au dénouement mérite d'être vu).

## moteur3d
- Le 005 et le 006 sont rendus, contrôlés et en attente de publication : toute piste de cet audit impose de les rendre et de les contrôler à nouveau, donc de décaler leur sortie ; c'est une décision de Merwan (appliquer maintenant ou à partir du 007), que le rapport ne pose pas.
- Aucun constat n'a été jugé au critère du CLAUDE.md (une capture réduite à 270 px, dans l'app, après la recompression de TikTok) : presque toutes les preuves sont des agrandissements d'images arrêtées en pleine résolution.
- Le hall au trait de la première image du 006 (et Chicago dans le 005) est relégué en note hors classement, alors que c'est le « dessin au trait qu'on ne fait pas » sur l'image qui décide si on reste.
- Si les matières ou le verre changent, les couvertures de grille et l'identité première/dernière image (la boucle) sont à refaire et à revérifier ; le rapport n'en parle pas.
- A2 (key déplacée par échantillon) et A7 (nombre d'échantillons variable) rendent le brouillon à 1 échantillon différent du rendu final, alors que la méthode du projet corrige les images parasites sur le brouillon.

## son
- Rien n'a été écouté, ni par l'auditeur ni par Merwan : l'habillage n'a jamais été validé à l'oreille ; avant tout chantier, lui faire entendre sur son iPhone le 006 actuel et un brouillon corrigé.
- Effet cumulé non mesuré : son-01, 02, 05 et 07 ajoutent tous de l'énergie entre 200 et 1700 Hz, là où la voix d'Eric a 60 % de la sienne ; ensemble ils peuvent recréer le masquage que son-03 veut supprimer. Un changement à la fois, mesuré.
- Le son et l'image du choc du 006 n'ont pas le même repère : sfx lit cues.shock, main.js recalcule t.choc + 0.12 (ligne 141) ; retoucher l'un sans l'autre désynchronise.
- Les films 002 à 004 ont été extraits mais pas analysés, et aucune courbe de rétention n'est encore disponible : rien ne prouve à ce stade un effet du son sur la rétention.
- Modifier sfx.mjs change l'empreinte SOURCE : le fond de tous les dossiers est refait au prochain build ; mettre les nouveaux timbres derrière des paramètres pour que les films publiés restent reproductibles.

## voix
- simule.txt retire 0,28 s de trop à la durée des deux films : toutes les durées « après resserrage » et les silences de boucle du rapport sont faux d'autant.
- Le CLAUDE.md affirme que npm run voice signale un CTA dit trop vite : ce contrôle n'existe pas dans scripts/voice.mjs — soit le coder, soit corriger la phrase.
- L'impact du 006 à 0,86 s est le seul son posé en temps absolu sur de la voix : toute reprise de l'accroche le désynchronise s'il n'est pas réécrit en repère.
- Le 005 n'a pas de audio/picks.json : Merwan ne l'a pas écouté, et aucune des reprises proposées n'a de sens avant cette écoute ; les regrouper en une seule annonce de coût et un seul re-rendu par film.
- Aucune courbe de rétention des 001 à 004 n'est encore là : le débit cible (175–200 mots/min) et le plafond de silences restent des suppositions, à confronter aux chiffres du 003 (179 mots/min) et du 004 (168) avant de resserrer.

## rythme
- 005, CTA d'abonnement (≈ 76–84 s) : la bobine descend sous le panneau « prochain dossier » et se retrouve derrière les sous-titres (frames/005/film_10.jpg, ligne 2) — sujet et texte se recouvrent.
- La bascule reaim du 006 (main.js:194) est le seul `cut: true` posé sans stage.cut : vérifier qu'aucun autre dossier n'a le même raccourci, et que flicker.mjs ne masque pas les instants déclarés comme coupes.
- Les mesures du rapport comptent toute l'image, sous-titres et cartes d'accroche compris : l'énergie réelle du sujet 3D est inconnue, et les comparaisons entre films aux habillages différents sont fragiles.
- Le 005 et le 006 ne sont pas publiés : les corriger ne coûte ni voix ni crédits, mais chaque retouche impose un nouveau rendu et un qa — la priorité devrait suivre l'ordre de sortie (005 d'abord).
- Le rythme sonore (habillage, silences, hold) n'est pas audité alors que les repères image et son sont communs : un trou d'image peut être tenu par le son, ou l'inverse.

## emballage
- Le 003, déjà en ligne, dit lui aussi « La réponse est épinglée » (67,7–72,6 s) avec un épinglé de 254 caractères : demander à Merwan ce qu'il a posté et lui donner la version de 142 caractères tout de suite.
- Le 006 annonce à voix haute le siège éjectable comme 007, sujet non validé : c'est la seule promesse du film qui exigerait une reprise de voix si Merwan refuse, à trancher avant publication.
- Changer `title` du 005 ne se limite pas à build.mjs:29 : index.html:6 et :37 portent « Arrêt d'urgence » en dur, et la copie iPhone est à refaire.
- Les légendes proposées (269 et 287 caractères) sont deux fois plus longues que les actuelles : TikTok n'en montre qu'une ou deux lignes avant « plus », la question du CTA commentaire sort de l'écran — à juger sur le téléphone.
- Aucun chiffre réel n'appuie cet audit : la première action utile est de relever les statistiques de 001–004 (dues aujourd'hui), avant toute réécriture.

## veille-retention
- 005 : la carte d'accroche « PANNE DE COURANT » est posée sur le bas de la cuve de verre (y ≈ 1210), gris sur gris avant de s'allumer — même défaut que VR-09, visible sur 005_open_strip.png, non relevé.
- 006 : la voix de l'accroche est mesurée grave et 2 dB sous le reste du film (CLAUDE.md), avec une reprise à 68 crédits en attente de décision ; l'audit des trois premières secondes ne traite que l'image.
- 006 : la phrase C de l'accroche se termine à 10,59 s, au-delà de la règle « A, B, C avant la 10e seconde » (9,56 s sur le 005).
- L'indicateur YDIF n'est relié à aucune donnée de rétention et compte les panneaux HTML de la zone haute comme du mouvement : VR-03, VR-07 et VR-11 s'appuient sur lui comme sur une mesure validée.
- La comparaison 002/003/004 présentée comme « expérience gratuite » est confondue (sujet, en-tête du 002 sous la barre de recherche, voix criée, publication le même jour) : elle ne peut pas isoler l'effet du mouvement d'ouverture.

## veille-references
- Le 005 et le 006 ne sont pas encore publiés : c'est la seule fenêtre où ces retouches d'image sont gratuites, et l'auditeur ne classe pas ses propositions selon ce qui doit passer avant la mise en ligne.
- Aucune courbe de rétention n'existe encore pour 001–004 : toute la dimension repose sur une mesure de mouvement maison ; les demander à Merwan passe avant tout changement de méthode.
- L'accroche du 006 sort grave et retenue (−2 dB, CLAUDE.md) : c'est le risque de rétention le plus direct de ce film, et la reprise à 68 crédits attend la décision de Merwan ; le rapport n'en parle pas.
- Le 003 (accroche criée) contre le 004 (non criée) est l'expérience naturelle déjà en ligne ; le rapport la relègue en fin de liste alors qu'elle tranche une question de voix sans rien coûter.
- Les actes 2 et 3 des 005 et 006 n'ont pas été relus (l'auditeur le reconnaît) : les constats de rythme ne couvrent que l'ouverture et la fin.

## outillage
- HyperFrames (render, snapshot, donc review et snap) tourne par défaut en mode GPU « software » (browserGpuMode dans son dist, option --browser-gpu) : c'est là que partent les minutes, et l'auditeur l'a laissé « à vérifier » ; à essayer sur un brouillon, avec qa et comparaison d'images avant d'y toucher.
- Le bloc des CTA du 006 (65,8 à 85,5 s) tient vingt secondes sur un seul plan presque fixe du boîtier fermé : c'est le vrai problème de rythme, plus gros que la plage morte de 2,5 s relevée.
- Le budget de l'accroche ne peut se contrôler qu'après la voix (estimé 110 s contre 85,5 s réels sur le 006) : le bon endroit est npm run voice, au choix des prises, pas le build.
- Le modèle d'épisode porte trois autres directions contraires aux mesures : promesse en [low, grave voice] sur une phrase positive, abo en [ominous], « [slowly] le cœur ».
- Le contrôle « nombres sourcés » par comparaison de chaînes produit surtout de fausses alertes (3 000 MW, 3 h 07, 14, 15 %) : tel quel, il apprendrait à ignorer le lint.
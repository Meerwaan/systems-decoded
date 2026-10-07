# Lot « kit-habillage » — 16 constats vérifiés, du plus fort impact au plus faible

Les rapports détaillés (propositions précises, esquisses de code) : C:/Users/MERWA~1.ORD/AppData/Local/Temp/claude/C--Users-merwa-ORDI-MERWAN-Documents-systems-decoded/33c1cc51-26d4-4646-9e1f-607ded707c28/scratchpad/audit/<dimension>/rapport.md — la dimension est le préfixe de chaque identifiant.

### habillage/H1 — Sous-titres coupés au mauvais endroit
[impact 5 (auditeur 5) · confirme · cible kit · besoin : rien · effort M]
- OÙ : kit/lib/overlay.js:25-58 ; kit/brand.css:91-98
- PREUVE : chunks.cjs sur le minutage réel : 005 19 lignes fautives sur 91, 006 14 sur 87 (« C'EST UN » 31,01 s, « 7 FOIS SUR 10 IL » 66,31 s, « NE » seul 15,27 s). Image caps_fautes.png.
- POURQUOI : C'est le texte le plus lu du film ; une ligne-éclair de 0,3 s ou un mot-outil en suspens casse la lecture sans le son.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Deux lignes : le bas du bloc tombe à ≈ 1505, 17 px sous la zone sous-titres notée dans CLAUDE.md (1248-1488) mais au-dessus de 1600 : acceptable, à mettre à jour dans CLAUDE.md et à contrôler au review (zones TikTok). Vérifier au look les blocs de deux lignes pendant les CTA (chevron #rail-comment, x 832-892) et que l'allumage mot à mot traverse bien les deux lignes.
- CONTRE-VÉRIFICATION : Vérifié : chunks.cjs relancé depuis le dépôt donne 91 lignes / 19 fautives (005) et 87 / 14 (006), dont « C'EST UN » 31,01 s (0,28 s), « 7 FOIS SUR 10 IL » 66,31 s, « NE » seul 15,27 s ; caps_fautes.png le montre à l'image. La cause est bien overlay.js:33 (coupe sur toute respiration > 0,3 s) puis :43-56. chunker3.cjs relancé : blocs propres (« 7 FOIS SUR 10 / IL Y A UN TÉMOIN »). Aucun mot dit ne change.

### habillage/H2 — Accroche : image 1 grise, sans ponctuation
[impact 4 (auditeur 5) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : kit/lib/overlay.js:105,114-126,166 ; kit/brand.css:229-231 ; scripts/lib/episode.mjs:69
- PREUVE : f006_0.05.png, f005_0.05.png, f006_8.5.png : « DEVANT TOI SON CŒUR », « PAS TE / TROMPER C'EST ELLE ». Mots en attente à 4,3:1. La phrase A est la petite ligne mono grisée.
- POURQUOI : La règle du projet : qui fait défiler sans le son lit l'accroche dès l'image 1. Aujourd'hui elle se déchiffre.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Garder : ponctuation sur les cartes, linesNew, petite ligne sans chiffre en Barlow 800. Opacité d'attente à régler au look entre 0,6 et 0,65 (à 0,72 l'allumage risque de ne plus se voir, l'auditeur le note lui-même). « Phrase A allumée dès l'image 0 » : à montrer à Merwan en deux images côte à côte avant de l'adopter (ça change la règle des cartes) ; si adopté, la copie de boucle doit être identique, sinon review échoue sur « dernière image = première image ».
- CONTRE-VÉRIFICATION : Vérifié sur f006_0.05.png et f006_8.5.png : « DEVANT TOI SON CŒUR » sans virgule, « PAS TE / TROMPER C'EST ELLE » ; la phrase A (« QUELQU'UN S'EFFONDRE ») est la petite ligne mono grisée (overlay.js:105, règle ≤ 2 mots) ; captionOf (episode.mjs:69) retire bien , ; :. Mais l'image 1 reste lisible (gros texte 88 px, ombre portée) : « grise » est juste, « se déchiffre » est exagéré. Deux points du correctif touchent une règle écrite : CLAUDE.md dit que les phrases sont « en attente… et s'allument mot à mot » — allumer la première phrase dès l'image 0 et monter l'attente à 0,72 réduit ce geste.

### habillage/H3 — CTA abonnement : boîte vide, appel en 28 px
[impact 4 (auditeur 4) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : kit/brand.css:212-218 ; episodes/005-arret-urgence/src/main.js:340-344 ; episodes/006-defibrillateur/src/main.js:410-414
- PREUVE : f005_76.5.png : boîte vide à 76,5 s ; dans le 005 le fait n'arrive qu'à 78,67 s (≈ 1,6 s d'écran). f006_78.5.png : « S'ABONNER POUR L'OUVRIR » mono 28 px, « 0,5 s » disloqué.
- POURQUOI : C'est le plan qui convertit en abonnés, et c'est le moins rempli du film.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Même idée, à hauteur constante : plaque veille 44-48 px avec padding 14 px, marge du fait réduite (ou chiffre à 130 px) pour que le bas de la boîte reste ≤ 900 ; vérifier au look avec les zones TikTok. Barre + « CLASSÉ » révélées avec la boîte : oui. Crénage « 0,5 s » : oui (unité en petit). La plaque ne doit pas ressembler à un bouton de l'app (pas de coins arrondis, pas de « + »).
- CONTRE-VÉRIFICATION : Vérifié : f005_76.5.png montre la boîte avec un seul rectangle de 40 px ; f006_78.5.png « 0 , 5  s » disloqué et l'appel en mono 28 px ; 006 main.js:410-412 confirme barre à avion−0,6 et fait à avion+0,2. Le problème est réel. Mais le correctif tel quel déborde : la boîte finit déjà à y ≈ 886 (006) / 902 (005), au-delà de la zone haute (790) ; une plaque de 54 px + 44 px de marge l'amène vers 956-972, sur les chevrons #rail-follow (y 948-992, x 832-892) et dans la colonne des boutons TikTok (x > 905 dès y 880).

### habillage/H4 — Titre de chute à peine plus gros qu'un sous-titre
[impact 3 (auditeur 3) · confirme · cible 005 · besoin : rien · effort S]
- OÙ : episodes/005-arret-urgence/index.html:12-14 ; episodes/006-defibrillateur/index.html:47-49
- PREUVE : f005_55.5.png : « RIEN » fait 200 × 90 px à côté de 430 px de noir vide. f006_59.5.png : titre 104 px contre 94 px pour le sous-titre.
- POURQUOI : La chute est la phrase qu'on doit retenir ; elle doit être le plus gros texte du film.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Marges serrées : 006 à 136 px → ≈ 889 px sur 904 disponibles, prendre 128 px ; 005 « RIEN » à 260 px arrive à x ≈ 521 quand la bride de la cuve commence à ≈ 540 : partir sur 230-240 px et régler au look. Vérifier que rien du titre ne déborde sur la coupe suivante.
- CONTRE-VÉRIFICATION : Vérifié : f005_55.5.png, « RIEN » ≈ 200 × 90 px avec tout le quart gauche vide ; f006_59.5.png, « ARRÊTE LE CHAOS » (104 px, ≈ 680 px de large) à peine plus gros que le sous-titre. index.html 005:12-14 et 006:47-49 confirmés. Faisable : style propre à l'épisode, #title-shade existe déjà sur le 006.

### habillage/H7 — Petits textes mono de 17 à 24 px
[impact 3 (auditeur 4) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : kit/brand.css:110,117,120,125,172,175,204,248,249 ; episodes/006-defibrillateur/index.html:21,31,32,42,88,103
- PREUVE : frames/006/film_06.jpg : à 270 px aucun en-tête ni statut de panneau ne se lit. f006_42.9.png, f006_18.5.png, f005_33.0.png : le sujet transparaît sous les panneaux à 78 %.
- POURQUOI : Une capitale de 21 px fait environ 1 mm sur un téléphone : du décor, pas de l'information.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Faire le plancher 26 px et le fond de panneau à 0,9, retirer les seconds libellés ; mais passer chaque panneau au look (les .chip et .co sont en nowrap : un libellé plus large peut sortir de la marge 88 ou passer sous les boutons). Statuts qui portent l'histoire (verdict de la puce) : plus que 28 px, voir H10.
- CONTRE-VÉRIFICATION : Vérifié : film_06.jpg, aucun en-tête ni statut de panneau lisible en vignette ; f006_42.9.png, l'électrode transparaît sous « CE QUE LIT LA PUCE » et « CHOC RECOMMANDÉ » tient en 23 px. Tailles confirmées dans brand.css (21/23/22/19/17). Mais la preuve à 270 px ne sera pas levée par 26 px (≈ 6,5 px en vignette) : le gain est sur téléphone, pas au test du projet, et il n'a pas été vu sur un iPhone. Le vrai enjeu est le statut/verdict, pas les en-têtes.

### habillage/H8 — CTA like et commentaire : hiérarchie inversée
[impact 3 (auditeur 3) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : kit/brand.css:193-210 ; kit/lib/overlay.js:254-262 ; index.html 005:94-101, 006:130-137
- PREUVE : f006_72.6.png : la question en mono 26 px grisé, moitié du champ vide. f006_66.5.png, f005_67.5.png : compteur de 21 px, chevrons de 60 × 44 px dont deux éteints.
- POURQUOI : On ne répond pas à une question qu'on n'a pas lue ; on ne suit pas une flèche qu'on n'a pas vue.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Commentaire : question en Barlow 800 ≈ 56-60 px, réponse dessous (« La plus proche de chez toi ? » reprend la voix : bien). Chevrons : agrandir vers 80 × 56 px sans déplacer leur bord droit (892), poursuite lente (période ≥ 0,6 s, jamais de clignotement plus rapide). Like : seulement le compteur plus gros.
- CONTRE-VÉRIFICATION : Vérifié sur f006_72.6.png : la question est en mono 26 px grisé (« COMMENTAIRE · LA PLUS PROCHE DE CHEZ MOI… », index.html 006:135), la réponse tapée en gros ; chevrons petits et pâles. Réel pour le commentaire. Pour le like, jugé sur pièces : en partie un goût. Les chevrons agrandis à 100 × 64 px en x 790-890 touchent la zone des sous-titres (bord droit 890) et, pour #rail-follow, la boîte #next (voir H3).

### habillage/H10 — Un tampon pour les verdicts et pour « DÉCODÉ »
[impact 3 (auditeur 4) · affaibli · cible kit · besoin : decision_merwan · effort M]
- OÙ : kit/brand.css (nouveau .stamp) ; kit/lib/overlay.js:243-249 ; episodes/006-defibrillateur/src/main.js:317,383
- PREUVE : film_06.jpg vignettes 7-8 : « CHOC RECOMMANDÉ » en 23 px, invisible. f006_59.5.png : le nom du compte s'allume en 21 px dans un coin.
- POURQUOI : « C'est elle qui décide » et « le nom du compte est le verdict » sont deux idées du film que l'image ne montre pas.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Séparer : (a) sans décision, grossir le verdict de la puce dans son panneau (Barlow 800 ≈ 48-52 px, statut raccourci à « ● FIBRILLATION » pour tenir sur 852 px) ; (b) à proposer à Merwan avec une image : le tampon, sans secousse (ou une seule, ≥ 2 images), et pour « DÉCODÉ » plutôt un geste dans l'en-tête même qu'un second objet dans la zone haute.
- CONTRE-VÉRIFICATION : Vérifié : « CHOC RECOMMANDÉ » en 23 px dans un cadre (f006_42.9.png), invisible en vignette (film_06.jpg) ; le nom du compte s'allume en 21 px (f006_59.5.png). Agrandir le verdict est justifié. Mais le tampon « DÉCODÉ » dans la zone haute à decodedAt tombe pendant #retitle (006 main.js:429, decodedAt = t.arrete) : deux dispositifs dans la zone haute, contre « un seul panneau à la fois » et « moins d'habillage ». La secousse proposée (x 5 px, 0,03 s, yoyo ×3) est plus courte qu'une image : aliasing, ce que qa compte comme image parasite. Élément de signature nouveau : décision de Merwan, « needs » juste.

### rythme/R9 — Sous-titres : des lignes de 0,24 à 0,44 s
[impact 3 (auditeur 3) · confirme · cible kit · besoin : rien · effort S]
- OÙ : buildCaptions, kit/lib/overlay.js (ligne à repérer)
- PREUVE : 8 à 15 lignes par film sous 0,45 s ; 005 : 12 (mini 0,24 s, « premier » à 60,89 s) ; 006 : 11. Découpage rééquilibré simulé : 9 et 7.
- POURQUOI : Qui regarde sans le son ne lit pas une ligne affichée un quart de seconde.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Fusion avec la voisine la plus courte en gardant maxChars 17 (marge droite de 190 px) plutôt que 20 caractères ; ne jamais fusionner à travers une fin de phrase.
- CONTRE-VÉRIFICATION : Jugé sur le rapport, recoupé au code et à une planche : buildCaptions (kit/lib/overlay.js:24, maxChars 17, maxWords 4) n'a aucune durée minimale par ligne, et frames/005/film_08.jpg passe de « SECOURS DU TOUT » à « RÉACTEUR ? » sans que « PREMIER » (0,24 s) apparaisse à 2 i/s. Faisable dans le kit ; cela change le découpage de tous les films au prochain build, donc à vérifier au review.

### image-005/image-005-07 — Sous-titres orange sur orange sur le combustible
[impact 3 (auditeur 3) · confirme · cible kit · besoin : rien · effort S]
- OÙ : 11 → 12,5 s et 16,5 → 20,5 s ; kit/brand.css:96, 98, 257 ; index.html:15-24 (#chip-power)
- PREUVE : f_11.60.png : « 3 000 MW » en signal posé sur le bas du combustible signal ; étiquette #chip-power signal sur le mur orange. f_18.30.png : « ELLES ATTENDENT », mot en attente (opacité 0,34) rose translucide sur l'orange le plus vif.
- POURQUOI : L'ombre portée du texte ne suffit pas quand le fond est la zone la plus lumineuse du cadre ; le chiffre de la phrase et l'étiquette perdent leur cadre.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Doser l'ombre avec look : une tache sombre sur le sujet le plus lumineux peut se lire comme une salissure ; quand c'est possible, préférer un cadrage qui sort le combustible de la zone 1248-1488.
- CONTRE-VÉRIFICATION : Vu sur mes images (verif/F.jpg à 11,6 s : étiquette signal sur le mur orange, peu lisible ; verif/D.jpg à 16,9 et 17,3 s : « AVALER » et « CES NEUTRONS » en attente presque fondus dans l'orange). #cap-shade suit le précédent de #hud-shade et #title-shade, ce n'est pas un voile coloré. Devient un prérequis du constat 01 (combustible sous les sous-titres).

### habillage/H5 — En-tête : nom du compte en faux italique
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : decision_merwan · effort S]
- OÙ : kit/brand.css:68-88 ; kit/template/index.html:27 ; kit/lib/overlay.js:231-236
- PREUVE : Toutes les images : « SYSTÈME DÉCODÉ » penché. C'est un <em> et aucune JetBrains Mono italique n'est chargée (brand.css:11-14). Actes éteints mesurés à 2,0:1 ; rangée du bas en 21 px.
- POURQUOI : Une oblique synthétique sur le nom de la marque se voit ; et une rangée de 21 px ne se lit pas sur 6 pouces.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Sans décision : .hud__brand { font-style: normal } (le gras 700 à vérifier au look) et le repli de l'auditeur (actes éteints à opacité 0,62, tailles +2 à +4 px si la rangée tient sur 904 px). La rangée repliée sur l'acte courant : à proposer à Merwan avec une image, et l'état des libellés doit être remis à l'identique à la boucle.
- CONTRE-VÉRIFICATION : Vérifié : <em class="hud__brand"> (template:27, 005:43, 006:69) et aucune face italique chargée (brand.css:11-14) : le nom est bien en oblique synthétique sur toutes les images. Corriger coûte une ligne. En revanche la refonte de la rangée (« 01 MENACE 02 03 », max-width animé) modifie un élément d'identité décrit dans CLAUDE.md (« actes 01 MENACE / 02 AUTOPSIE / 03 RÉPONSE ») : ce n'est plus « rien », c'est une décision de Merwan. Les tailles : jugé sur pièces.

### habillage/H6 — Mot à venir invisible, rebond à chaque ligne
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : rien · effort S]
- OÙ : kit/brand.css:98 ; kit/lib/overlay.js:76-79
- PREUVE : contrast2 : 2,7:1 à 14,5 s du 006. f005_33.0.png (« PASSE »), f006_57.5.png (« UN CŒUR »), f005_67.5.png (« UN GROS »). 91 entrées en back.out(2.2) dans le 005.
- POURQUOI : Sans le son, la moitié de la ligne n'existe pas tant qu'elle n'est pas dite ; et un rebond par seconde fatigue.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Opacité 0,45-0,5 à régler au look après H1 (les cartes d'accroche sont déjà à 0,5 : cohérent). Rebond : l'adoucir (back.out(1.4), scale 0.94) plutôt que le retirer ; l'accent sur les mots marqués est une bonne idée, sans obligation.
- CONTRE-VÉRIFICATION : Jugé sur pièces et sur caps_fautes.png / f005_76.5.png : le mot à venir (0,34) est pâle mais visible sur fond sombre ; il ne disparaît que sur sujet clair. Le remonter est sain. Supprimer le rebond est un goût : c'est le geste courant du sous-titre TikTok, et H1 fait déjà passer de 91 à 70 entrées. L'écart dit / pas dit est l'identité (« le mot dit s'allume ») : à 0,5 il se réduit.

### habillage/H9 — Texte sur sujet clair ou de sa couleur
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : rien · effort S]
- OÙ : kit/brand.css:224-231 ; episodes/005-arret-urgence/episode.json (text de « 3 000 MW ») ; pose des plans 0-9 s du 005
- PREUVE : contrast2 : carte sur la boîte verte 2,8:1 (006, 8,5 s) ; « 3 000 MW » signal sur le cœur orange 2,6:1 (005, 11,8 s), encre 6,5:1. f005_0.05.png : le fond de cuve traverse la carte.
- POURQUOI : Les deux seules images où l'accroche et un chiffre clé se lisent mal sont dans les 12 premières secondes.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Garder la règle « pas d'accent de la couleur du fond » : retirer les astérisques de « 3 000 MW » (affichage seul) et l'accent veille de la carte posée sur la boîte verte. #hook-shade plus léger (0,25-0,3), seulement sous les lignes, à juger au look. 005 : ne pas remonter la cuve ; reculer légèrement (d) ou laisser l'ombre faire le travail.
- CONTRE-VÉRIFICATION : Regardé : f006_8.5.png se lit correctement (encre 88 px + ombre portée ; seuls les mots veille « PAS TE TROMPER » se confondent avec la boîte verte) ; f005_11.8.png, « 3 000 MW » signal sur le cœur orange est bien le mot le moins lisible de la ligne ; f005_0.05.png, le fond de cuve passe derrière la petite ligne et la première ligne. Les rapports 2,8:1 ignorent l'ombre portée : surévalués. Remonter la cuve de 170 px enverrait la couronne de bobines vertes (y 430-510) dans l'en-tête, contre la règle « ce qui monte derrière l'en-tête se fond dans le noir ». Un voile à 0,45 éteindrait la boîte verte, l'image promise par l'accroche.

### outillage/OUT-07 — Aucune taille minimale de texte : des libellés de 17 à 21 px
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : kit/brand.css (libellés de panneaux, axes, tuiles) ; contrôle dans scripts/audit.mjs
- PREUVE : dom_006.json : « TOI » 17 px, axe des chances 19 px, 13 libellés à 20–21 px (≈ 5 px de haut sur une vignette de 270 px). 19 à 26 sélecteurs sous 27 px dans chaque film.
- POURQUOI : Règle maison : ce qui ne se lit pas à 270 px est raté. Un libellé illisible est de l'habillage, pas de l'information.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Pas de règle bloquante. Lister les textes sous 22 px dans l'audit du DOM, et ne grossir (ou retirer) que ceux qui portent une information : « TOI », l'axe des chances, « pour quitter l'avion ».
- CONTRE-VÉRIFICATION : Jugé sur les pièces du rapport et sur film_09/film_10 : les libellés de panneaux (« PROCHAIN DOSSIER · 007 », « pour quitter l'avion », en-têtes des panneaux) sont effectivement illisibles en vignette. Mais la règle des 270 px du CLAUDE.md porte sur le sujet du plan, pas sur chaque libellé mono du HUD, qui fait partie de l'identité « dossier ». Un plancher de 24 px partout ferait déborder les panneaux de la zone haute (354 px de haut) et la marge droite de 190.

### outillage/OUT-09 — Sous-titres : 15 à 21 lignes éclair par film et des mots orphelins
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : kit/lib/overlay.js:24-60 (buildCaptions, maxChars 17, maxWords 4)
- PREUVE : texte.txt : 006 « ne » seul 0,40 s puis « part » à 15,3 s (visible sur zones_006.jpg) ; « Tu colles les » 0,35 s à 37 car/s ; débit médian 13 à 15 car/s.
- POURQUOI : Qui regarde sans le son lit les sous-titres : une ligne de 0,35 s ne se lit pas, un mot seul casse la phrase.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Seulement l'orphelin : ne pas couper la phrase sur un silence quand cela laisserait un mot de 4 lettres ou moins seul, s'il tient avec son voisin en 17 caractères. Pas de durée minimale ni d'alerte de débit. À vérifier sur une planche avant de l'appliquer aux films déjà montés (les sous-titres bougent partout).
- CONTRE-VÉRIFICATION : overlay.js lu : le mot orphelin vient de la coupe de phrase sur un silence > 0,3 s (ligne « next.s - w.e > 0.3 »), pas de la découpe en lignes ; « NE » seul se voit bien sur zones_006.jpg. En revanche les « lignes éclair » sont un artefact de mesure : les sous-titres s'allument mot à mot au rythme de la voix, une ligne de trois mots dits en 0,35 s est lue en même temps qu'entendue ; 37 car/s n'est pas un débit de lecture. Fusionner demande des lignes plus longues que 17 caractères, que la marge droite de 190 ne permet pas toujours.

### accroches/ACC-09 — Première carte : grise à 50 % et posée sur le sujet
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : rien · effort S]
- OÙ : kit/brand.css:231 (.hook__w opacity 0.5) ; kit/lib/overlay.js:149
- PREUVE : Image 0 des 003 (carte sur le fil de fer de la cabine, frames/003/hook_01.jpg), 005 (sur le dôme de la cuve, f005_0000.png), 006 (tête sous le kicker).
- POURQUOI : Qui fait défiler sans le son doit lire l'accroche à l'image 0 : c'est l'instant où elle est la moins contrastée.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne pas toucher au kit. Appliquer la zone existante à l'image 0 des 005 et 006 (traité par ACC-03, ACC-07, ACC-11). Si un essai est voulu : 0,6 sur toutes les cartes, comparé côte à côte à 270 px.
- CONTRE-VÉRIFICATION : kit/brand.css:231 vérifié (.hook__w opacity 0.5 ; le span est créé à overlay.js:134, pas 149). Mais sur f005_0000.png et f006_0000.png la carte en attente se lit sans effort en pleine résolution, et encore sur les vignettes de 360 px : le défaut réel est le sujet qui passe sous la carte, pas le gris. Monter l'attente à 0,7 réduit l'écart avec le mot allumé, qui est la signature du mot à mot, et rend la première carte différente des suivantes. La règle de cadrage proposée existe déjà (sujet 440–1160, cartes 1186–1542).

### habillage/H11 — Détails de cohérence
[impact 1 (auditeur 2) · confirme · cible kit · besoin : rien · effort S]
- OÙ : kit/brand.css:175,187,249 ; kit/lib/overlay.js:190-210
- PREUVE : f005_33.0.png : « Sous tension — elle serre » seul texte mono en bas de casse. f006_28.9.png : le libellé du callout commence à x = 68, sous la marge de 88.
- POURQUOI : Ce sont les petits écarts qu'un œil exercé prend pour de l'amateur.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Le débord de 8 px du barré est peut-être voulu (un trait qui dépasse le mot) : le garder si c'est le cas, ne corriger que les deux autres.
- CONTRE-VÉRIFICATION : Jugé sur pièces et sur le code : #gauge-status et #scope-status n'ont pas de text-transform (brand.css:175, :249) ; #retitle-strike a bien left: -8px (:187) ; createCallouts.add ne borne pas un libellé aligné à droite (overlay.js:207). Petits écarts réels, correctifs sans risque. x = 68 reste visible (l'app rogne ≈ 53 px) : cosmétique.

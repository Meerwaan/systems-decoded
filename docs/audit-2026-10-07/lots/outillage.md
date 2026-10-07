# Lot « outillage » — 15 constats vérifiés, du plus fort impact au plus faible

Les rapports détaillés (propositions précises, esquisses de code) : C:/Users/MERWA~1.ORD/AppData/Local/Temp/claude/C--Users-merwa-ORDI-MERWAN-Documents-systems-decoded/33c1cc51-26d4-4646-9e1f-607ded707c28/scratchpad/audit/<dimension>/rapport.md — la dimension est le préfixe de chaque identifiant.

### outillage/OUT-05 — Textes dans les zones TikTok : seul l'œil sur la planche les attrape
[impact 4 (auditeur 4) · confirme · cible pipeline · besoin : rien · effort M]
- OÙ : nouveau scripts/audit.mjs (base : dom.mjs du dossier d'audit), appelé par check
- PREUVE : dom_006.json et zones_006.jpg : « 0 L/min » à 50 % sous les boutons (14,8 s), « Lire, puis choquer » à x = 24 rogné (27,0 s), « Verrouillé » (63,3 s), « Le 15 » (21,0 s).
- POURQUOI : Un chiffre caché par les boutons de l'app est un chiffre que personne ne lit ; c'est déjà arrivé au 002 publié.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Sortie en alerte (pas en erreur bloquante de check) tant que les seuils 8 % / 2 instants n'ont pas tourné sur les six dossiers : une étiquette qui suit un point 3D traverse légitimement une zone pendant un mouvement. Exempter l'en-tête et les chevrons .rail, qui visent exprès la colonne de boutons.
- CONTRE-VÉRIFICATION : zones_006.jpg regardée : « 0 L/MIN » est sous la colonne de boutons, « LIRE, PUIS CHOQUER » est coupé par le bord gauche, la fin de « VERROUILLÉ » déborde dans la zone des boutons ; film_09 confirme la position de l'étiquette « verrouillé » dans le rendu. review.mjs:15 porte bien une copie en dur des zones. Le prototype dom.mjs existe et tourne sans rendre la 3D : faisable.

### outillage/OUT-02 — Le modèle d'épisode enseigne quatre directions voix que le CLAUDE.md dit fausses
[impact 3 (auditeur 4) · confirme · cible kit · besoin : rien · effort S]
- OÙ : kit/template/episode.json (beats ouvre, like, comment, boucle)
- PREUVE : [slowly] sur « on l'ouvre », [low, grave voice] sur le like, « ... » comme pause des CTA, dernière phrase en « ... » : tout mesuré plat, dragueur ou non joué (002 à 005).
- POURQUOI : Chaque nouveau dossier part de ce fichier : les défauts reviennent et se paient en reprises.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Corriger aussi ce que l'auditeur n'a pas relevé dans le même fichier : promesse en [low, grave voice] sur une phrase positive (« ce que tu y gagnes »), abo en [ominous] (CTA positif), « [slowly] le cœur ». Le champ abc n'a de sens que si OUT-03 est retenu.
- CONTRE-VÉRIFICATION : kit/template/episode.json lu : « [slowly] Alors... on l'ouvre. », like en [low, grave voice], « et toi... tu le savais ? » dans comment, boucle finie par « par... ». Les quatre contredisent les mesures du CLAUDE.md. Impact ramené à 3 : le texte du modèle est toujours réécrit et les 005/006 ont déjà été dirigés correctement à partir du CLAUDE.md ; c'est une assurance de dix minutes, pas un gain visible.

### outillage/OUT-03 — Aucun contrôle du script avant la voix : accroche, CTA, sources, direction
[impact 3 (auditeur 5) · affaibli · cible pipeline · besoin : rien · effort S]
- OÙ : nouveau scripts/lint.mjs, appelé par scripts/build.mjs:89 et npm run script
- PREUVE : texte.txt : 006 A·B·C finis à 10,59 s ; 001 premier mot 0,43 s ; 004 A fini à 5,79 s ; 005 « 3 000 MW » sans source ; CTA 21 à 25 % du film.
- POURQUOI : L'accroche hors budget et la balise qui crie se découvrent après avoir payé 700 crédits, ou jamais.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Lint en deux temps : avant la voix, seulement la direction (balises, virgule finale, identifiants de beat) ; après la voix, dans npm run voice, le budget A·B·C mesuré sur chaque prise (et s'en servir pour choisir la prise de l'accroche). Nombres : simple liste « à relire » sans statut d'erreur, ou abandon. Pas de plafond de CTA tant qu'aucune courbe de rétention ne le justifie.
- CONTRE-VÉRIFICATION : Les contrôles de direction (balises interdites, grave sur CTA, virgule finale, trois balises de suite) sont justes, gratuits et utiles avant la voix. Le reste est surévalué. (1) Le contrôle « nombres sourcés » par comparaison de chaînes est faux sur son propre exemple : « 3 000 MW » EST sourcé (episode.json:24, « 2 785 MW thermiques (« près de trois mille mégawatts ») ») ; texte.txt lève aussi « 3 h 07 », « 14 », « 15 % », « 0,1 s » : cinq alertes fausses ou discutables sur six. (2) Le budget de l'accroche ne se contrôle pas « avant de payer » : le minutage estimé n'est pas fiable (006 estimé 110 s, réel 85,5 s). (3) Les seuils A ≤ 4,5 s, premier mot ≤ 0,40 s, CTA ≤ 23 % sont inventés : le 002, « modèle à étudier », échoue sur A (4,75 s) ; les CTA font 21 à 25 % partout.

### outillage/OUT-04 — qa ne mesure pas la boucle et ne fait jamais échouer la commande
[impact 3 (auditeur 4) · affaibli · cible pipeline · besoin : rien · effort S]
- OÙ : scripts/qa.mjs:71-78, scripts/flicker.mjs, scripts/sd.mjs:184-187
- PREUVE : Écart dernière/première image : 005 0,68 · 002 1,93 · 003 2,86 · 006 3,84 · 004 9,48 (loop_004.jpg : halo plus fort ; loop_006.jpg : victime décalée). sd.mjs ignore le résultat de qa.
- POURQUOI : « La boucle est sacrée » : un saut visible au rebouclage coupe le second visionnage, celui qui fait monter la durée moyenne.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Code de sortie 1 sur voix décalée, image parasite, durée < 60 s, rendu plus ancien que vo.json : oui. Boucle : mesure affichée, ⚠ au-delà de 3, ✗ seulement au-delà de 6 (ou par bande), et ne pas toucher au 006 pour cela. Ne pas faire échouer un brouillon sans voix sur le contrôle de voix.
- CONTRE-VÉRIFICATION : Vrai : qa() renvoie { ok, … } et sd.mjs (case qa) n'en fait rien, la commande sort toujours à 0. Vrai aussi pour le 004 (loop_004.jpg : halo nettement plus fort et plus bas à la fin). Mais loop_006.jpg : les deux images sont indiscernables à l'œil, la différence amplifiée ne montre qu'un glissement de quelques pixels ; 3,84 n'est pas « un saut visible ». Le seuil ✗ > 3 ferait échouer un film dont la boucle est bonne (et le 003 à 2,86 serait en alerte).

### outillage/OUT-08 — Plages mortes et sujet sombre non détectés, surtout pendant les CTA
[impact 3 (auditeur 3) · affaibli · cible pipeline · besoin : rien · effort S]
- OÙ : scripts/flicker.mjs (même passe), affiché par scripts/qa.mjs
- PREUVE : m006.json : rien ne bouge de 77,8 à 80,3 s (CTA abonnement) ; sujet à p95 52/255 de 64,2 à 70,2 s (CTA like). 004 : 76,4–79,8 s. 002 : quatre plages.
- POURQUOI : Les CTA occupent 22 % du film : une image figée et sombre à cet endroit, c'est là qu'on fait défiler.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Garder le détecteur de plage morte (alerte), abandonner le détecteur de sujet sombre. Sur le 006 : ne pas « éclaircir le like », mais donner au bloc des CTA un mouvement de caméra lent et continu ou un changement de cadre par CTA (gratuit, pas de voix).
- CONTRE-VÉRIFICATION : film_09 et film_10 regardées : le constat est en dessous de la réalité sur un point et faux sur un autre. Faux : « sujet sombre » — le boîtier noir sur halo vert est exactement la matière imposée (système plein, sombre, sur un halo) ; un seuil p95 < 70 signalerait la patte du compte à chaque autopsie. Sous-estimé : ce n'est pas 2,5 s de plage morte, c'est tout le bloc des CTA (65,8 à 85,5 s, 20 s) sur le même plan presque fixe du boîtier fermé ; seuls les panneaux changent.

### enchainements/E8 — qa : mesurer les plages mortes
[impact 3 (auditeur 3) · affaibli · cible pipeline · besoin : rien · effort S]
- OÙ : scripts/ (commande qa) · CLAUDE.md, « Avant de livrer » · rapport, « Pour le 007 et pour qa »
- PREUVE : 005 : 46 % des demi-secondes sous 15 dans la zone du sujet (78 sur 170) ; 006 : 30 % (51 sur 171). Fichiers scene_*.txt du dossier d'audit.
- POURQUOI : Les gels de l'accroche, de « Zéro » et de la chute du 005 ont passé review, check et qa : aucune commande ne les cherche.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : L'ajouter à qa comme liste informative (fenêtres ≥ 2,5 s presque immobiles, avec la phrase dite), jamais bloquante, mesurée sous la zone haute (y ≈ 800–1160) ; pas de seuil de 25 % tant qu'il n'est pas étalonné sur 002–006. Règle du CLAUDE.md : « pas d'arrêt de caméra de plus de 1,5 s sauf silence voulu », à faire valider par Merwan.
- CONTRE-VÉRIFICATION : Jugé sur les pièces (pourcentages non recalculés). Les gels de E1 et E5 que j'ai vus confirment qu'aucune commande ne les signale. Mais la mesure a deux biais : la zone y 440–1160 contient la zone haute (436–790), donc un panneau qui s'anime masque une 3D immobile ; et un seuil fixe signalerait les silences voulus (006, 51,0–52,5 s ; les beats avec hold). La règle « jamais plus de 1,5 s » contredit ces tenues voulues.

### rythme/R7 — Contrôle de rythme absent de npm run qa
[impact 3 (auditeur 4) · affaibli · cible pipeline · besoin : rien · effort M]
- OÙ : scripts/ (qa) ; modèles : audit/rythme/mesure.mjs et analyse.mjs
- PREUVE : Tous les défauts ci-dessus sortent d'une mesure d'une minute par film ; qa n'a vu ni l'image doublée du 006 ni l'accroche figée du 005.
- POURQUOI : Sans mesure, chaque dossier refait les mêmes trous ; avec, ils se corrigent sur le brouillon.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : N'ajouter à qa que trois mesures à faible risque de faux positif : pic d'une image hors coupes déclarées (aurait vu 10,73 s), énergie de l'image sur 0–3 s, plages immobiles ≥ 3 s avec la phrase dite. En information, pas en échec. Le reste attend les courbes de rétention.
- CONTRE-VÉRIFICATION : Fondé pour une partie : scripts/flicker.mjs (le contrôle des images parasites de qa) n'a pas vu l'image doublée du 006, et rien ne signale une accroche figée. Mais les seuils ne sont calés sur aucune courbe de rétention (cinq films, zéro chiffre TikTok), la MAD compte les sous-titres, et « luminance » ou « temps forts par 10 s » produiraient des avertissements permanents sur un style volontairement sombre : un avertissement qu'on apprend à ignorer.

### emballage/E7 — Aucun contrôle du bloc post ; le front n'affiche ni réponses ni routine
[impact 3 (auditeur 3) · confirme · cible pipeline · besoin : rien · effort S]
- OÙ : scripts/sd.mjs:126 (check) ; scripts/front.mjs:90-97 (postOf)
- PREUVE : Quatre épinglés trop longs sont passés sans alerte (254, 339, 353, 311 car.). postOf ne lit que caption, hashtags, pinned.
- POURQUOI : L'erreur se découvre sur le téléphone, au moment de publier. Un contrôle la sort au check, comme le contraste.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : En erreur : épinglé et réponses ≤ 150, 5 hashtags. En simple avertissement : mot-clé dans les 50 premiers caractères, « Dossier 00X », mot jamais dit (choix d'écriture, pas défauts).
- CONTRE-VÉRIFICATION : Vérifié : scripts/sd.mjs (case check) ne fait que build + lint HyperFrames, rien sur `post` ; front.mjs:91-97 ne lit que caption, hashtags, pinned. Quatre épinglés dépassent 150 (254, 339, 353, 311, recomptés).

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

### outillage/OUT-12 — Fragilités de la chaîne : écritures concurrentes, valeurs par défaut, repères
[impact 2 (auditeur 2) · confirme · cible pipeline · besoin : rien · effort M]
- OÙ : scripts/build.mjs:38-87 ; scripts/lib/episode.mjs:26-27 ; kit/lib/ref.mjs:17 ; scripts/sd.mjs:119,139 ; scripts/lib/ffmpeg.mjs:159
- PREUVE : build réécrit gen/ et index.html à chaque snap/check/look ; lead 0,5 et tail 2,0 par défaut (règle : 0,2 / 0,45) ; un beat « cta-2 » est lu « cta » − 2 s ; render accepte un minutage estimé.
- POURQUOI : Deux commandes en parallèle se corrompent ; un champ oublié donne une demi-seconde de silence en tête, sans alerte.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Écrire seulement si le contenu change suffit : pas de gen/.lock (un verrou resté après un plantage bloque tout). Le plafond de gain du master en alerte, pas en plafond dur, pour ne pas livrer un film sous −14 LUFS. Le refus du minutage estimé : rendu final seulement, le brouillon muet reste permis.
- CONTRE-VÉRIFICATION : Lu dans le code : build() écrit episode.data.js, les copies du kit, le bundle et index.html à chaque appel, sans condition ; loadEpisode met lead à 0,5 et tail à 2,0 ; ref.mjs prend tout « [+-]nombre » final pour un décalage ; render n'affiche qu'un ⚠ sur un minutage estimé. Tout est réel, mais aucun de ces cas ne s'est produit : les six dossiers fixent lead et tail, aucun identifiant ne finit par « -2 ». snap et master() jugés sur le rapport.

### recit/R11 — Aucun garde-fou de récit dans `npm run script`
[impact 2 (auditeur 3) · affaibli · cible pipeline · besoin : rien · effort M]
- OÙ : scripts/sd.mjs:101-139 ; champ facultatif `act3` dans episode.json
- PREUVE : Appliqué aux six scripts, un bloc « RÉCIT » aurait signalé : C du 006 (10,59 s), « on l'ouvre » des 002/004/006, la queue des six, 59 s sans « tu » (005), nombres du 004, « Like » en tête (003–006), légende du 005.
- POURQUOI : Ces défauts se mesurent sur le script, avant la voix, donc avant de dépenser des crédits.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Afficher un bloc « RÉCIT » en chiffres neutres : fin du C, instant de « on l'ouvre », durée de l'acte 3, durée après la chute, plus longue plage sans tu/toi, nombres dits. Deux seuls avertissements, fondés sur des règles existantes : C fini après 10 s, légende qui reprend la chute. Le reste quand les courbes le justifient.
- CONTRE-VÉRIFICATION : Vérifié : scripts/sd.mjs:101-112, la commande `script` n'affiche que minutage et repères. Un bloc d'indicateurs est faisable. Mais la plupart des seuils sont les préférences de l'auditeur, non validées par une courbe, et plusieurs avertiraient contre la pratique écrite du projet (« Like » / « Abonne-toi » en tête, durée 75-95 s). Des avertissements permanents sur des règles non prouvées poussent à écrire pour l'outil.

### accroches/ACC-10 — qa ne contrôle pas l'accroche
[impact 2 (auditeur 3) · affaibli · cible pipeline · besoin : rien · effort M]
- OÙ : scripts/qa.mjs:24
- PREUVE : Le tableau du rapport § 2 sort d'un script de 30 lignes (audit/accroches/motion.js) et du minutage : le 005 y ressort seul, avec quatre secondes figées.
- POURQUOI : Le défaut le plus coûteux du 005 se mesure sur le brouillon, avant le rendu final.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Deux lignes d'information, sans alerte bloquante : dans qa, le mouvement par seconde de 0 à 5 s ; dans script, le nombre de mots de l'accroche et l'heure de fin du C. Pas de seuil de luminance. Transformer en alertes seulement quand les courbes auront dit quel seuil compte.
- CONTRE-VÉRIFICATION : Jugé sur les pièces du rapport (qa.mjs non rouvert). L'idée est saine et peu coûteuse, mais les seuils sont calés sur cinq films sans aucune courbe : « une seconde < 1,5 » aurait bloqué les 002 et 003, « luminance < 30 » punit le fond sombre qui est l'identité du compte, et « premier évènement > 1 s » ne se mesure pas séparément du mouvement. La fin du C et le nombre de mots ne sont pas des mesures du MP4 : ils sortent déjà du minutage de npm run script.

### veille-retention/VR-07 — npm run qa ne voit ni une ouverture figée ni un bloc de fin immobile
[impact 2 (auditeur 3) · affaibli · cible pipeline · besoin : rien · effort M]
- OÙ : scripts/qa.mjs, à côté de l'analyse de scripts/flicker.mjs ; mesure reproductible : activity.mjs, ydif_<film>.txt
- PREUVE : qa contrôle voix, niveau, images parasites, fluidité ; rien sur l'immobilité. Le 005 a passé tous les contrôles avec quatre secondes d'image fixe en ouverture. La mesure coûte quinze secondes par film.
- POURQUOI : Sans garde-fou automatique, l'ouverture figée et le bloc de fin immobile reviennent : le rapport CTA/corps baisse d'épisode en épisode (0,94 → 0,27).
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Trois lignes d'information dans le rapport de qa, sans échec : mouvement moyen 0–3 s, mouvement du bloc de fin contre le corps, plages de plus de 3 s presque fixes. Les seuils se fixent quand deux ou trois courbes de rétention existent.
- CONTRE-VÉRIFICATION : Vérifié par recherche dans scripts/ : aucune mesure d'immobilité (ni signalstats ni YDIF). Le manque est réel. Mais des seuils bloquants (2,0 ; 0,6 ; 0,3) tirés de cinq films sans résultat mesuré risquent de faire refaire des plans voulus (une image tenue pour qu'elle frappe) ; et la fenêtre mesurée inclut la zone haute, donc les panneaux HTML comptent comme du mouvement. Le reste est jugé sur les pièces du rapport.

### veille-references/VR-09 — Aucun contrôle de rythme dans qa
[impact 2 (auditeur 3) · affaibli · cible pipeline · besoin : rien · effort M]
- OÙ : scripts/ (npm run qa)
- PREUVE : La mesure existe (motion.mjs de l'audit : différence d'images, zone 430–1170, 10 i/s). Elle isole seule l'ouverture du 005 et les tunnels de CTA.
- POURQUOI : « Un changement toutes les 2 secondes » est la règle du genre ; aujourd'hui rien ne la vérifie avant de livrer.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Une ligne d'information dans qa (les fenêtres les plus calmes, avec leurs instants), sans seuil ni échec. Les seuils se fixeront quand on aura des courbes de rétention à mettre en face.
- CONTRE-VÉRIFICATION : Jugé sur le rapport et un grep de scripts/ : qa a déjà son analyse image à image (flicker.mjs) ; ajouter une mesure de rythme est faisable. Mais les seuils sont calés sur cinq films sans donnée de rétention, la mesure compte les panneaux de la zone haute et ignore les mouvements lents de caméra, et le seuil d'ouverture ferait échouer deux films déjà publiés. En contrôle bloquant, il pousserait à agiter l'image, contre « moins d'habillage, plus de mécanisme ».

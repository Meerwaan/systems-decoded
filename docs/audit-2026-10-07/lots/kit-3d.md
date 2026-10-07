# Lot « kit-3d » — 11 constats vérifiés, du plus fort impact au plus faible

Les rapports détaillés (propositions précises, esquisses de code) : C:/Users/MERWA~1.ORD/AppData/Local/Temp/claude/C--Users-merwa-ORDI-MERWAN-Documents-systems-decoded/33c1cc51-26d4-4646-9e1f-607ded707c28/scratchpad/audit/<dimension>/rapport.md — la dimension est le préfixe de chaque identifiant.

### moteur3d/A1 — Le verre est du lait : une coque, un chant, un reflet
[impact 4 (auditeur 5) · confirme · cible kit · besoin : rien · effort M]
- OÙ : 006 à 37,6 s, 0,4 s, 19,5 s ; 005 à 29,0 s. kit/lib/build3d.js:62-85 ; kit/lib/figure.js:25 ; episodes/006 hall.js:491-499, hall.js:171 ; 005/model.js:90 ; 005/reactor.js:130
- PREUVE : e6_37.6.png : torse +80/255 (100 83 75 contre fond 20 16 14), six disques de bouts de capsules, cœur derrière quatre voiles. z_e6_0_fig.png : anneaux superposés aux articulations. e5_29.0.png : +50/255 dans tout le tube (57 57 50 contre 6 10 7).
- POURQUOI : Shader glass() additif, double face, uBase constant, fresnel large (uPower 2,3–2,6) ; chaque membre est une capsule dont toutes les faces s'additionnent. Corps en « sac de saucisses », tube qui voile la pièce-héros du 005.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Commencer par le moins cher : tube du 005 à base 0 (un paramètre). Pour asShell : toutes les pré-passes étant tracées avant tous les verres, un personnage masque le verre du personnage derrière lui (témoin penché sur la victime) : à juger au look à 19,5 s et 37,6 s, sinon un ordre par personnage. Le reflet (spec, pow 120) reste éteint tant qu'un brouillon + qa n'a pas montré qu'il ne scintille pas sur des membres qui bougent.
- CONTRE-VÉRIFICATION : Vérifié sur mes propres extractions (006 à 37,6 s et 0,4 s, 005 à 29,0 s) et sur z_e6_19_shadows.png : on compte les disques de bout de capsule aux épaules, coudes, hanches, genoux ; le torse est un voile brun laiteux devant le cœur ; l'intérieur du tube du 005 est nettement gris contre un fond noir. Code conforme : glass() additif, DoubleSide, uBase constant (build3d.js:62-85), figure.js:25 base 0.014 / power 2.3, tube 005 base 0.02 / power 2.4. Le correctif est faisable (renderOrder existants 1, 2, 3, 7, tous sous 19) et garde les anciens films par défaut. Impact ramené à 4 : esquisse non testée, à régler au look.

### moteur3d/A2 — Ombres au rasoir et ombres orphelines des personnages de verre
[impact 3 (auditeur 4) · affaibli · cible kit · besoin : rien · effort S]
- OÙ : 005 à 24,6 s ; 006 à 28,6 s, 0,4 s, 19,5 s. kit/lib/stage.js:18, 183, 200, 264 ; kit/lib/figure.js:38, 102 ; 006 hall.js:496
- PREUVE : z_e5_24_shadow.png : bord d'ombre net au pixel (≈ 1 mm de pénombre pour 60 cm). z_e6_0_fig.png, z_e6_19_shadows.png : tête et mains projettent trois ovales noirs sans corps, dont un au milieu de la cuisse de la victime.
- POURQUOI : PCFSoftShadowMap 4096² reste net ; seules la tête et les mains, pleines, portent une ombre. Trois trous noirs au sol dès la première image du 006.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Faire d'abord la partie personnages (castShadow false sur tête et mains, pastille douce posée par le décor), cohérente avec la règle « un objet posé sur du verre ne porte pas d'ombre ». La key en surface vient ensuite, en option (keySize 0 par défaut), essayée sur le 005 à 24,6 s et 29 s, sans descendre mapSize tant que le résultat n'est pas vu.
- CONTRE-VÉRIFICATION : Deux constats de poids inégal. Ombres orphelines : confirmées (006 à 0,4 s, trois ovales noirs sous la victime dès la première image ; z_e6_19_shadows.png, un ovale visible à travers la cuisse) ; code conforme (figure.js:38, 102 ; hall.js:496 castShadow = !ghost). Ombres au rasoir : réelles (005 à 24,6 s, l'ombre de la bobine garde ses rayures) mais elles tombent sur un sol sombre, à faible contraste : peu visible à la taille d'un téléphone. La key déplacée par échantillon est astucieuse mais non testée : 16 ombres dures superposées peuvent faire des marches sur un récepteur clair, et un brouillon à 1 échantillon ne ressemblera plus au rendu final.

### moteur3d/A4 — Sujets sombres sans forme interne : l'environnement doit faire le travail
[impact 3 (auditeur 5) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : 006 à 34,0 s, 19,5 s, 30,2 s, couverture 006 ; 005 à 27,5 s. kit/lib/stage.js:32-48, 189, 194, 195, 197 ; 005/main.js:411 ; 006/main.js:482 ; 005/model.js:79-83
- PREUVE : e6_34.0.png : dessus du couvercle 13 33 31, flanc 1 8 13, sol 17 57 39 plus clair que le sujet. z_cover6_lid_gamma.png : aplat même remonté. Tête du témoin 149 134 115 / 5 5 17 (30:1). Cliquet 219 218 199 : aplat crème.
- POURQUOI : Albedo ≈ 2 % dans une pièce noire à quatre rectangles unis, intensité 0,55, et le halo du sol n'y est pas : l'objet ne reflète pas son sol. Ombres propres bouchées, faces claires en aplat.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Garder un seul environnement, fixe : boîtes en dégradé, longue boîte au plafond, cyclo gris très sombre, derrière l'option look: 2. Aucune bascule d'environnement en cours de plan (au plus sur une coupe). Monter environmentIntensity par petits pas au look sur 34,0 s et 28,6 s en gardant le sujet plus sombre que son halo. Matière hero du 005 à part, jugée à 27,5 s.
- CONTRE-VÉRIFICATION : Surévalué. Sur ma propre image (006 à 34,0 s), le boîtier se lit sans effort : dessus, flanc, chanfrein éclairé, poignée, bouton, voyant. Le sujet sombre aux arêtes claires posé sur un halo est l'identité écrite dans le CLAUDE.md, pas un défaut. Mesures RVB non refaites ; tête du témoin et cliquet non revus. Le correctif touche l'éclairage de tout le plateau, et changer scene.environment selon mood fait sauter les reflets d'une image à l'autre hors coupe : exactement ce que qa compte comme image parasite.

### moteur3d/A8 — Angles vifs et flatShading : généraliser les chanfreins vernis
[impact 3 (auditeur 3) · confirme · cible kit · besoin : rien · effort M]
- OÙ : 005 à 29,0 s, 40,5 s, 27,5 s ; référence 006 à 34,0 s. kit/lib/build3d.js (lathe, box) ; 005/model.js:104-105, 123, 145, 172 ; 006/model.js:116, 132-136
- PREUVE : e5_29.0.png, e5_40.5.png : tige en pile de rondelles à angles vifs, tour du cylindre facetté (flatShading). e5_27.5.png : cliquets en carton. À l'inverse le couvercle du 006 porte un filet de lumière sur son chanfrein.
- POURQUOI : C'est le chanfrein verni qui donne prise à la lumière de contour (lights.rim, stage.js:208) ; sans lui l'objet n'est dessiné que par son trait d'arête.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Le commentaire du code dit que flatShading est là pour que les crans se lisent : vérifier au look à 29,0 s et 40,5 s que les crans restent lisibles avec bevel + crease avant de le retirer. Ne baisser l'opacité des traits d'arête (0,8 vers 0,45) qu'après avoir revu la vignette à 270 px : l'arête claire fait partie de l'identité.
- CONTRE-VÉRIFICATION : Jugé sur pièces et sur mes images du 005 à 29,0 s et 24,6 s : la tige est une pile de rondelles à angles vifs, les cliquets des plaques plates ; flatShading confirmé (005/model.js:104). À l'inverse le boîtier du 006 à 34,0 s porte un filet de lumière sur son chanfrein. Géométrie seule : aucun risque de scintillement.

### image-006/image-006-06 — Les personnages de verre s'additionnent en tas ; TOI est traversé par le décor
[impact 3 (auditeur 4) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : 16,2 → 22,4 s et tout croisement de corps ; kit/lib/build3d.js:62-85 ; kit/lib/figure.js ; heart.js:146, 150 ; hall.js:263, après :270, :499
- PREUVE : f_16.50, f_19.90, f_21.80, strip_d vignette 3, f_37.60, f_23.00 : glass() additif, double face, sans profondeur ; trois corps = une quarantaine de contours, trois boules crème. À 23,0 s TOI (glassK 0,55) laisse passer mur et banc.
- POURQUOI : C'est le plafond de qualité de tout plan avec personnages, et le 007 annoncé aura un pilote. Le cœur est le plus petit élément du tas ; le personnage nommé est le moins visible.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Sur le 006 : seulement les deux réglages gratuits (têtes des aidants plus sombres, TOI plus lumineux quand il est le sujet). La passe de profondeur : en option de makeFigure (désactivée par défaut, 005 inchangé), prototypée en ouverture du 007 et validée sur six images avant adoption.
- CONTRE-VÉRIFICATION : Diagnostic vérifié (verif/F.jpg : 16,5 / 19,9 / 21,8 / 23,0 / 37,6) : les capsules de verre s'additionnent en un enchevêtrement où le cœur est le plus petit élément ; à 23,0 s TOI est presque invisible sous son étiquette. Mais le correctif moteur n'a pas été essayé (confiance 3), il modifie kit/lib/figure.js que le 005 utilise aussi, et un verre qui ne dessine que sa face la plus proche retire une part de l'effet « rayons X » qui fait l'identité. Trop incertain pour un film déjà rendu.

### image-006/image-006-11 — La main est un galet, sur le geste que le film demande au spectateur
[impact 3 (auditeur 3) · confirme · cible kit · besoin : rien · effort M]
- OÙ : 23,3 → 24,9 s et tout gros plan de main ; kit/lib/figure.js:100-101 ; hall.js:285, 465-469 ; main.js:243 ; episodes/004-differentiel/src/room.js:274-370
- PREUVE : f_23.60, f_24.60, strip_a vignettes 2-3, f_21.80 : hands "flat" = sphère aplatie (scale 1, 0.46, 1.5), un savon crème qui flotte devant le montant de la boîte.
- POURQUOI : « Toi : la boîte » : tendre la main vers la boîte est fait par un ellipsoïde. Le 004 avait une vraie main à phalanges : le moteur partagé a régressé.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Pour le 006 : le repli (TOI en verre sur cette coupe, ghost 1 puis 0 à toBench), effort S, à vérifier sur une image. Le portage de la main dans le kit : en option hands "real", pour le 007 ; « flat » reste le défaut, les plans du massage et des électrodes en dépendent.
- CONTRE-VÉRIFICATION : Vérifié (verif/C.jpg à 23,6 et 24,6 s) : la main de TOI est un galet crème, l'objet clair le plus gros du plan après l'armoire. kit/lib/figure.js:100-101 est bien une sphère mise à l'échelle (1, 0,46, 1,5) et episodes/004-differentiel/src/room.js:274-292 contient une main à phalanges. Le portage est faisable.

### moteur3d/A5 — Ce qui brille n'éclaire rien
[impact 2 (auditeur 3) · confirme · cible kit · besoin : rien · effort S]
- OÙ : 005 à 24,6 s ; 006 à 34,0 s et 28,6 s. 005/model.js après l. 180 ; 006/model.js après l. 110, 173, 180
- PREUVE : e5_24.6.png : deux bandes vertes HDR à 2 cm des flasques, qui restent gris neutre. e6_34.0.png : le voyant ne dépose rien sur le couvercle. e6_28.6.png : anneaux de charge sans teinte sur batterie ni socle. Aucune PointLight dans le dépôt.
- POURQUOI : Les émetteurs-héros sont des lueurs sans lumière associée : rien ne relie l'objet lumineux à ses voisins, la scène se lit comme un collage.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Commencer par la seule bobine du 005. Une lumière sans ombre traverse les pièces : portée courte (distance 20 à 30 cm) pour ne pas éclairer le socle à travers la batterie.
- CONTRE-VÉRIFICATION : Jugé surtout sur pièces. Sur mes images, 005 à 24,6 s : les flasques restent gris neutre à côté de deux bandes vertes très lumineuses ; 006 à 34,0 s : le voyant ne dépose rien. Aucune PointLight dans kit/ ni dans les src/ (seulement dans les bundles générés, qui embarquent three). Correctif simple et déterministe. Impact 2 : sur un plastique à 2 % d'albedo une lumière ponctuelle ne donne qu'un reflet ; le gain se verra surtout sur les flasques claires du 005.

### moteur3d/A6 — Rien ne touche rien : occlusion ambiante absente
[impact 2 (auditeur 4) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : 006 à 28,6 s et 30,2 s ; 005 à 29,0 s. kit/lib/stage.js (composer, après ShutterPass) ; kit/lib/build3d.js:170, 194 ; kit/lib/atmo.js:23 ; 005/reactor.js:207
- PREUVE : e6_28.6.png : batterie et condensateur sans assombrissement près du socle, ils flottent. e5_29.0.png : gorges de la tige sans creux, bague sans contact avec les cliquets. e6_30.2.png : composants de la carte posés comme des autocollants.
- POURQUOI : Aucune occlusion ambiante ni ombre de contact : les pièces ne sont pas posées, les crans sont des rondelles empilées.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne pas l'entrer dans le kit maintenant. Obtenir les contacts sans passe : pastilles d'ombre peintes sous les pièces posées (comme le catcher), gorges de la tige assombries dans la matière. GTAO seulement en essai isolé sur le 005, après A4 et A8, avec brouillon + qa.
- CONTRE-VÉRIFICATION : Preuve fragile et correctif risqué. À 28,6 s du 006, la batterie et le condensateur flottent parce que c'est la vue éclatée : ils sont soulevés exprès, et ils portent bien une ombre sur le socle. Une occlusion multipliée sur des pièces à 13/255 ne se verra pas ; elle ne servirait qu'aux pièces claires du 005. GTAOPass redessine la scène avec un matériau de remplacement (GTAOPass.js l. 641) : les déformations faites dans un vertex shader (le cœur qui bat) n'y sont pas, son bruit est fixe à l'écran (grouillement), et le calque basculé à 0,6 d'opacité fait apparaître l'occlusion d'un coup. C'est la piste la plus contraire à la règle « net et fluide ». Jugé sur code et sur une image, sans essai.

### moteur3d/A7 — Flou de mouvement en peigne sur les mouvements rapides
[impact 2 (auditeur 3) · affaibli · cible kit · besoin : rien · effort M]
- OÙ : 005 à 27,5 s et 22,5 s. kit/lib/stage.js:259, 265 (constante samples dans advance)
- PREUVE : z_e5_27_pawl.png : arêtes de la bague et du socle en « velours côtelé », tige en trois fantômes. e5_22.5.png (vol vers la bobine) : bas des barres en escalier. À 2 images/s, ces images sortent sur les planches.
- POURQUOI : 16 instants également espacés : au-delà de ≈ 4 px entre deux instants (≈ 60 px par image), un trait de 2 px ne se recouvre plus et on voit 16 copies nettes.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Regarder d'abord le score de fluidité de qa à 22,5 s et 27,5 s du 005. Si c'est signalé : version simple, nombre d'échantillons calculé sur le seul déplacement de la caméra (sans sondes par pièce), plafonné à 32 ; ou ralentir le mouvement à ces deux instants.
- CONTRE-VÉRIFICATION : Le peigne existe (z_e5_27_pawl.png : anneaux du socle en copies empilées, tige en fantômes ; stage.js : samples = 16 fixe, l. 176, 259, 265). Mais c'est un défaut d'image arrêtée : à 30 images/s une image de mouvement rapide se lit comme du flou, et l'argument « ces images sortent sur les planches » concerne nos contrôles, pas le spectateur. Rien ne montre que qa classe ces instants parmi les mouvements heurtés. Coût annoncé : +10 à 25 % de rendu.

### moteur3d/A10a — Poussières rouges lues comme des pixels morts
[impact 2 (auditeur 2) · confirme · cible kit · besoin : rien · effort S]
- OÙ : 005 à 29,0 s ; 006 à 34,0 s (705,487 ; 720,697 ; 890,920) et couverture 006. kit/lib/atmo.js:109, 129 ; 005/main.js:416 ; 006/main.js:487
- PREUVE : z_e5_29_specks.png, e6_34.0.png, couverture du 006 : points rouges isolés sur l'établi en ambiance veille.
- POURQUOI : Couleur par défaut signal ×2,2, uAmount 0,1 : le rouge veut dire « menace » et les points se lisent comme un défaut d'écran.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Changer la couleur dans les épisodes (ou par ambiance), pas la valeur par défaut du kit : les anciens dossiers et les scènes en ambiance signal gardent leurs poussières rouges.
- CONTRE-VÉRIFICATION : Vérifié sur mes images : 006 à 34,0 s et 005 à 29,0 s, plusieurs points orangés isolés sur l'établi vert. Code conforme : atmo.js:109 couleur par défaut BRAND.signal, x2,2 (l. 129) ; 006/main.js:42 n'en passe pas d'autre, uAmount 0,1 (l. 487).

### moteur3d/A10c — Finitions optiques : netteté, queue du bloom, profondeur de champ
[impact 1 (auditeur 2) · affaibli · cible kit · besoin : rien · effort S]
- OÙ : Essais de profondeur de champ : cœur à 16 s, cliquets à 29 s, puce à 30 s (006 à 28,6 s). kit/lib/stage.js:150 (GRADE), 272 (bloom), applyCamera
- PREUVE : Revue point par point : filtre boîte 1 px, image légèrement douce ; bloom 0,6 / 0,7 / seuil 1,0 juste mais un peu serré ; aucune profondeur de champ (manque mineur).
- POURQUOI : Détails de finition : rendu un peu doux, lueurs à cœur serré sans traîne, aucun flou d'avant-plan pour détacher le sujet.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne garder que l'essai de traîne du bloom (bloomFactors) sur une image au look. Laisser de côté l'accentuation et la profondeur de champ.
- CONTRE-VÉRIFICATION : Goût de finition, sans preuve à l'image (jugé sur pièces). L'accentuation renforce des traits de grille déjà à 1,8 px et le travail de l'encodeur : elle va contre l'anti-scintillement. La profondeur de champ à 16 échantillons dédouble les traits clairs, l'auditeur le reconnaît, et « on distingue tout, tout de suite » ne demande pas de flou.

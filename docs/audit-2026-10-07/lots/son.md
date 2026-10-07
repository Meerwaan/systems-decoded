# Lot « son » — 13 constats vérifiés, du plus fort impact au plus faible

Les rapports détaillés (propositions précises, esquisses de code) : C:/Users/MERWA~1.ORD/AppData/Local/Temp/claude/C--Users-merwa-ORDI-MERWAN-Documents-systems-decoded/33c1cc51-26d4-4646-9e1f-607ded707c28/scratchpad/audit/<dimension>/rapport.md — la dimension est le préfixe de chaque identifiant.

### son/son-01 — 006 : le cœur qui repart est muet sur téléphone
[impact 4 (auditeur 5) · confirme · cible 006 · besoin : decision_merwan · effort S]
- OÙ : episodes/006-defibrillateur/episode.json:167-168 ; scripts/sfx.mjs:195-209 ; 51,75-55,67 s
- PREUVE : heartbeat : 97 % de l'énergie sous 200 Hz, -65,7 dBFS au-dessus de 400 Hz, 43 dB sous la voix. Phrase « repart » : 0 évènement, fond téléphone -63,2 dBFS (mesures_006.txt C et G).
- POURQUOI : Le moment émotionnel du film, celui qui paie 50 secondes de tension, n'a aucun son sur le haut-parleur où il est regardé.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : D'abord le seul correctif sûr : corps médium + clic dans heartbeat, derrière un paramètre (body: true) activé seulement sur les lignes 167-168 du 006, sans changer le 005 ni le massage. Mesurer (-14 à -18 dB sous la voix au-dessus de 400 Hz). Le battement à l'accroche est une option à faire entendre à Merwan, sans retirer l'impact de 0,86 s avant d'avoir vérifié ce qu'il ponctue à l'image.
- CONTRE-VÉRIFICATION : Vérifié dans sfx.mjs:195-209 : battement = sinus 64-124 Hz + octave, rien au-dessus de ~250 Hz ; mesures_006 C : -65,7 dBFS au-dessus de 400 Hz (-52 au-dessus de 250 Hz), 43 dB sous la voix. Le battement démarre bien sur « repart » et devrait remplir le silence 54,39-55,67 s : tél -60,8 dBFS. Réel. Réserves : jamais écouté ; le motif à l'accroche met un son 190-930 Hz sous la première phrase et retire l'impact de 0,86 s ; le synthé est partagé (accroche du 005, massage 108 bpm du 006).

### son/son-05 — Les impacts sont du sub pur : le climax n'est pas plus fort sur téléphone
[impact 4 (auditeur 4) · confirme · cible kit · besoin : rien · effort S]
- OÙ : scripts/sfx.mjs:103-127 (impact)
- PREUVE : impact : 98,8 % sous 200 Hz, perd 22 dB derrière un passe-haut 400 Hz. Seconde 44 du 006 : -10,6 dBFS pleine bande (la plus forte), -20,8 sur téléphone, comme la seconde 42.
- POURQUOI : 16-17 impacts par film dont le poids ne sort pas ; le choc sonne comme une ponctuation ordinaire.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : À faire avec son-10 : corps 240 Hz et saturation pour tous, claquement 1-4 kHz proportionnel au gain (plein au-dessus de -10, nul sous -14). Garder la même crête qu'avant, mesurer la perte à 400 Hz et le retrait du limiteur.
- CONTRE-VÉRIFICATION : Vérifié : sfx.mjs:103-127 (sub 36-116 Hz, knock 95-245 Hz, bruit faible) ; mesures B et C des deux films : 98,8 % sous 200 Hz, perte 22,4 dB à 400 Hz et 20 dB à 250 Hz. Le code dit viser un haut-parleur de téléphone : raté réel. Modèle téléphone recoupé par deux sources (chute sous 300-600 Hz). Effets de bord : la plupart des impacts tombent sur un mot, un claquement 1-4 kHz y ajoute du masquage ; la saturation remonte le niveau alors que le limiteur travaille déjà à 44 s.

### son/son-07 — Les effets ne sont pas baissés sous la voix
[impact 4 (auditeur 4) · confirme · cible kit · besoin : rien · effort S]
- OÙ : scripts/sfx.mjs:233-249 (duck appliqué au seul bus under) et 129-150 (whoosh)
- PREUVE : 72 à 77 % des évènements déclenchés sur un mot. Le duck ne touche que nappe et battement, inaudibles sur téléphone ; whoosh : 84 % d'énergie entre 1 et 6 kHz.
- POURQUOI : Le réglage duck n'agit sur rien d'audible et les sons gênants passent à plein niveau.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Le masque speaking est mot par mot : avec 180 ms de retour le whoosh pomperait entre les mots ; boucher les trous de moins de 0,35 s pour ce bus. Faire le bus d'abord, mesurer, ne recentrer le whoosh (240-1740 Hz, la zone des voyelles) que s'il reste des fenêtres sous +6 dB. Modifier sfx.mjs refait le fond de tous les dossiers au prochain build.
- CONTRE-VÉRIFICATION : Vérifié dans le code : seuls drone et heartbeat écrivent dans le bus under (sfx.mjs:100, 206) ; whoosh, riser, rewind, tick, blip, impact vont droit dans L/R et le duck (233-249) ne les touche pas. Mesures E : 77 % (005) et 72 % (006) des évènements sur un mot ; whoosh 51 % + 33 % entre 1 et 6 kHz.

### son/son-02 — La nappe et sa courbe de tension n'existent pas sur téléphone
[impact 3 (auditeur 5) · affaibli · cible kit · besoin : decision_merwan · effort M]
- OÙ : scripts/sfx.mjs:68-101 (drone) ; curve des episode.json 005:105 et 006:119
- PREUVE : drone : 97,5 % sous 200 Hz, 32 dB sous la voix au-dessus de 400 Hz. Nappe téléphone constante de -56 à -66 dBFS du début à la fin (G). Harmonie : quinte à vide sur la, figée.
- POURQUOI : Ni tension qui monte ni respiration à la chute : l'émotion repose entièrement sur la voix.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Étape 1 sans risque : le drone a déjà une bande « air » 300-1400 Hz (sfx.mjs:89-90, gain 0,16) prévue pour le téléphone ; la remonter suffit à rendre la courbe de tension audible sans harmonie nouvelle. Étape 2 : le pad accordé seulement après écoute par Merwan de deux versions, phase intégrée, sur le 007 d'abord.
- CONTRE-VÉRIFICATION : Constat vrai (drone 97,5 % sous 200 Hz, nappe tél -56 à -66 dBFS constante, quinte à vide lue dans sfx.mjs:91-98). Mais le correctif est une décision musicale : un accord tenu 85 s entre 220 et 1320 Hz, dans la bande où la voix a 60 % de son énergie. Jamais écouté (prototype planté). Le CLAUDE.md note que l'habillage n'a jamais été validé à l'oreille et que le risque connu est « envahissant ». Le code proposé a un saut de phase reconnu. « needs: rien » est faux.

### son/son-03 — 005 : des whoosh couvrent des mots clés, dont le dernier du film
[impact 3 (auditeur 4) · affaibli · cible 005 · besoin : rien · effort S]
- OÙ : episodes/005-arret-urgence/episode.json:141, 119-122, 110-111, 159 ; 41,25 s, 15,5 s, 7,25 s, 84,0 s
- PREUVE : Bande téléphone : « la barre tombe » -8 puis -12 dB, « d'autres » -11,5 dB, « 2 s » -6,2 dB, « d'une… » -13,3 dB (rewind). 19 fenêtres parlées sur 218 sous +6 dB (mesures_005.txt D).
- POURQUOI : Le verbe du climax et le mot qui fait la boucle sont masqués ; le whoosh occupe 1-6 kHz, la bande des consonnes.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Garder les baisses de gain (141 : -18 vers -24 ; 119-120 : -16 vers -22 ; ajouter 111 : -20 vers -24). Rewind : rester sur son repère, gain -21 vers -26 ou départ +0,25 s, sans toucher à tail. Le bus fx de son-07 règle le tout à la racine. 005 non publié : un nouveau rendu suffit.
- CONTRE-VÉRIFICATION : Vrai pour « la barre tombe » (41,25-41,50 s : tél -8 / -12 dB) et « d'autres » (15,50 s : -11,5 dB), lignes 141 et 119-122 relues. Surévalué pour le dernier mot : la voix finit à 84,11 s, la fenêtre 84,00-84,25 ne contient que 0,11 s de voix ; là où « d'une… » est vraiment dit (83,75 s) la voix est à +2,9 dB. « 2 s » vient surtout du whoosh crown (ligne 111), absent du correctif. Le correctif du rewind ne marche pas : à boucle$+0,05 il reste 0,4 s de film (tail 0,45), le son serait tronqué ; allonger tail ajoute un temps mort avant la boucle.

### son/son-04 — Climax : pas de silence avant le coup, et le coup écrase le mot
[impact 3 (auditeur 4) · affaibli · cible 006 · besoin : rien · effort M]
- OÙ : episodes/006-defibrillateur/episode.json:162-164 ; 44,01-44,35 s ; idem 005:136-137 et 143-145
- PREUVE : Riser jusqu'à shock (44,13 s) alors que la voix a repris à 44,01 : « 150 J » à -6,8 dB pleine bande, limiteur -3,7 dB sur 250 ms. 005 : -1,7, -2,1, -3,2 dB sur « Zéro », « Plus », « 2 s ».
- POURQUOI : Le chiffre du choc est noyé et le climax n'a pas son vide avant l'impact.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Sans remontage : finir le riser au début de la voix (to: "choc-0.02", il culmine à sa fin), tick shock+0.02 de -12 à -18, impact de -6 à -8 pour sortir du limiteur. Le « silence avant le coup » reste une option de mise en scène : il faut déplacer ensemble le repère son et tShock/toShock dans main.js (coup vers choc-0.3) et revoir les plans, sur brouillon.
- CONTRE-VÉRIFICATION : Mesure vraie (calage_006 : limiteur jusqu'à -3,7 dB de 44,10 à 44,35 s sur « 150 J » ; plein -6,8, tél +1,2). Mais le correctif ne fait pas ce qu'il annonce : shock = choc+0.12 est ancré sur la phrase « choc » ; un hold après « analyse » décale phrase et coup ensemble, le coup reste sur le mot. Et l'image n'utilise pas ce repère : main.js:135-141 calcule tShock = t.choc + 0.12 de son côté. Pour le 005, « Zéro / Plus / 2 s » ne sont couverts qu'en pleine bande (impact = sub), pas sur téléphone. Le coup sur le mot est un choix de montage.

### son/son-11 — qa ne contrôle pas ce qu'un téléphone restitue
[impact 3 (auditeur 3) · confirme · cible pipeline · besoin : rien · effort M]
- OÙ : scripts (npm run qa) ; base : scratchpad/audit/son/analyse.mjs
- PREUVE : Les mots masqués du 005 et le retrait du limiteur sur « 150 J » n'ont été vus par aucun contrôle existant.
- POURQUOI : Sans mesure automatique, chaque dossier refera les mêmes erreurs et personne n'entend.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne compter que les fenêtres où la voix occupe au moins 70 % de la durée ; commencer en avertissements, pas en échec ; seuil 0 une fois 005 et 006 repassés.
- CONTRE-VÉRIFICATION : Jugé sur pièces : scripts/qa.mjs existe, analyse.mjs donne la base, aucun contrôle actuel ne regarde la bande téléphone. Deux défauts de mesure à corriger avant d'en faire un seuil : une fenêtre de 0,25 s à cheval sur la fin d'un mot donne un faux masquage (84,00 s du 005) ; le contrôle du limiteur se déclenche aussi sur un coup voulu.

### son/son-06 — Aucun logo sonore : ni à l'ouverture, ni quand le nom s'allume
[impact 2 (auditeur 4) · affaibli · cible compte · besoin : decision_merwan · effort M]
- OÙ : scripts/sfx.mjs (nouveau type signature) ; 006:120-121 et 169 ; 005:106 et 147 ; main.js 006:429 (brandHud decodedAt)
- PREUVE : Ouverture = impact -13 (inaudible sur téléphone). À la chute, brandHud s'allume sur un impact -15 générique. Rien de commun entre épisodes hors les blips du like.
- POURQUOI : Un compte se reconnaît à l'oreille en une demi-seconde ; ici le verdict du dossier n'a pas de son.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Si Merwan le veut : une seule occurrence, quand le nom passe au vert, dans le silence après la chute ; rien à l'ouverture ni sur la boucle. Trois variantes à écouter, à partir du 007.
- CONTRE-VÉRIFICATION : Constat exact (aucun motif commun ; brandHud s'allume sur t.arrete = repère secret, impact -15). Mais le gain en rétention n'est étayé par rien. Les deux notes d'ouverture à 0,03 s sonnent encore quand la voix démarre (0,28 s), entre 650 et 2000 Hz, sur la phrase la plus importante du film : contraire à la règle de l'auditeur lui-même (aucun son sur un mot porteur). Timbre proche des blips existants.

### son/son-08 — Un tiers de l'énergie du film est sous 200 Hz
[impact 2 (auditeur 3) · affaibli · cible pipeline · besoin : decision_merwan · effort S]
- OÙ : scripts/lib/ffmpeg.mjs:79 (voiceBody) et :167 (mastering) ; scripts/sfx.mjs:99 et 254
- PREUVE : Film rendu : 37,4 % (005) et 35,7 % (006) sous 200 Hz. Niveau médian -17,2 dBFS pleine bande contre -22,4 sur téléphone. Voix : 24,8 % sous 200 Hz, 1,1 % au-dessus de 6 kHz.
- POURQUOI : À -14 LUFS affichés, le film sonne plus faible que ses voisins du fil sur un téléphone.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Fond seul, sans décision : rumble 2.0 vers 1.2 et baisse des deux sinus à 55 Hz, puis mesurer. EQ de la voix : deux versions d'une même phrase dans la cabine, Merwan tranche à l'oreille sur son iPhone.
- CONTRE-VÉRIFICATION : Jugé sur pièces. Les chiffres sont dans mesures B (37,4 % et 35,7 %), ffmpeg.mjs:79 et 167 bien cités. Mais « plus faible que ses voisins » n'est mesuré contre aucun voisin et le traitement de TikTok est inconnu. Le passe-haut à 45 Hz ne change presque rien (le drone commence à 55 Hz). L'égalisation touche au timbre d'Eric, que Merwan vient de confirmer.

### son/son-09 — 005 : la chute des barres est illustrée par un son qui monte
[impact 2 (auditeur 3) · affaibli · cible 005 · besoin : rien · effort S]
- OÙ : episodes/005-arret-urgence/episode.json:141-146 ; 41,7-47,1 s
- PREUVE : Whoosh, impact -9 à fall, puis riser de 2,6 s montant jusqu'à bottom et impact -7. Aucun son descendant pendant les deux secondes de chute.
- POURQUOI : Le son contredit l'image : la couleur verte descend, le son grimpe.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Paramètre down dans riser (une ligne), à essayer sur un brouillon du 005 et à faire entendre ; ne pas le lier au pad.
- CONTRE-VÉRIFICATION : Jugé sur pièces ; lignes 141-146 relues, le riser de 2,6 s monte bien vers bottom. Mais une montée vers un impact est une convention de tension, pas une contradiction : affaire de goût. La courbe du drone descend déjà de 1 à 0,45 entre trigger et bottom. La seconde moitié du correctif dépend du pad de son-02.

### son/son-10 — Trop d'impacts faibles, fibrillation jouée au métronome
[impact 2 (auditeur 3) · affaibli · cible 006 · besoin : rien · effort S]
- OÙ : episodes/006-defibrillateur/episode.json:129, 136, 155, 158, 170, 178
- PREUVE : 57 évènements (0,67/s), 17 impacts dont 10 entre -14 et -17 dB, inaudibles sur téléphone. flutter : 22 ticks réguliers à 0,085 s, soit 11,8 Hz fixes.
- POURQUOI : Aucune hiérarchie entre les coups ; le désordre du cœur sonne comme une horloge.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : À faire dans le même geste que son-05. Jitter semé dans tick : oui, après avoir vérifié que l'image du tracé ne lit pas ces instants.
- CONTRE-VÉRIFICATION : Jugé sur pièces ; lignes relues : 136, 155, 158, 170, 178 sont bien des impacts de -16 à -18, flutter = 22 ticks à 0,085 s. Mais retirer des sons inaudibles sur téléphone ne change rien pour le spectateur ; l'intérêt n'apparaît que si son-05 leur donne du médium.

### son/son-12 — Son original ou son tendance, et un motif sonore par dossier
[impact 2 (auditeur 3) · affaibli · cible methode · besoin : decision_merwan · effort S]
- OÙ : CLAUDE.md (règles 007 et suivants) ; publication dans l'app
- PREUVE : Aucune règle sonore dans la méthode ; 21-22 silences par film (14,5-15,4 s), souvent vides sur téléphone à -60 dBFS.
- POURQUOI : Le son s'écrit après coup, par ponctuations, sans idée par épisode.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Écrire la règle du motif dans la méthode. Son tendance : au plus un essai sur une vidéo, décidé par Merwan, comparé à la suivante ; ne pas le présenter comme un levier établi.
- CONTRE-VÉRIFICATION : Jugé sur pièces + recherche. La règle du motif par dossier est saine et gratuite. Le « son tendance à 1-5 % » est une astuce de créateurs : les pages trouvées (socialz.ai, ttcalculator.net, adobe.com) la répètent sans test ni confirmation de TikTok ; pas de seconde source crédible. Risques non dits : bibliothèque limitée pour un compte professionnel, perte du « son original », mixage brouillé.

### voix/V12 — 006 : le second impact tombe sur « s'effondre »
[impact 2 (auditeur 2) · affaibli · cible 006 · besoin : rien · effort S]
- OÙ : episodes/006-defibrillateur/episode.json, sfx impact at 0,86 (gain −10, size 1,3) ; hook.txt
- PREUVE : 0,8–1,2 s : voix −26 / −33 dB, fond −17 / −19 dB (écart −8,7 puis −14,4 dB large bande). Au-dessus de 300 Hz l'écart reste +17 dB.
- POURQUOI : Aux écouteurs, la fin du premier mot fort de l'accroche passe sous un coup grave ; sur haut-parleur de téléphone, non.
- CORRECTIF (ajusté par le contre-vérificateur quand il l'a jugé nécessaire) : Ne pas le déplacer : le baisser à −14 / −15 dB (comme les impacts d'accroche du 005), et l'écrire en repère (« accroche:s'effondre-0.3 ») pour qu'il suive une éventuelle reprise. À trancher à l'oreille par Merwan.
- CONTRE-VÉRIFICATION : Jugé sur hook.txt : les chiffres sont exacts (fond −17 / −19 dB contre voix −26 / −33 dB de 0,8 à 1,2 s), mais c'est la fin du mot (« s'effondre » finit à 1,16 s), en large bande seulement. Le déplacement proposé est pire : à 1,21 s, la queue de l'impact (size 1,3) retombe sur l'attaque de « Devant » (1,64 s), et masquer une attaque gêne plus que masquer une fin. L'impact est aussi posé en temps absolu, sans doute sur la chute du corps à l'image : non vérifié.

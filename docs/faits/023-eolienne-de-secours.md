# 023 — L'éolienne de secours (RAT) : dossier de faits

Recherche du 2026-10-13 · budget : 29 requêtes sur 30

Niveaux : **A** source primaire lue · **B** secondaire sérieuse · **C** faible. « Résumé de recherche, non lu » = vu seulement dans le résumé du moteur.
Rapport GPIAA = « Final Investigation Report 22/ACCID/2001 », 18 oct. 2004, 103 p., copie hébergée par la FAA, **lue en texte intégral** (téléchargée, extraite avec pdftotext). Pagination = « Pag N of 103 » du bas de page.
URL rapport : https://www.faa.gov/sites/faa.gov/files/2022-11/AirTransat236_AccidentReport.pdf (le fetch direct renvoie 403 ; un téléchargement ordinaire passe).

**Verdict d'angle** : il tient pour l'essentiel, avec une correction capitale. La RAT **ne rallume pas** les moteurs : elle fait tourner une pompe hydraulique (et, par elle, un générateur de secours) pour que les commandes de vol et quelques instruments restent vivants. « C'est son propre vent qui le rallume » est faux. Juste : « c'est son propre vent qui lui rend de quoi piloter ».

## 1. Le nom

- Wikipédia FR : titre « Éolienne de secours » ; « turbine à air dynamique » n'y figure pas. Niveau B (Wikipédia, lue). https://fr.wikipedia.org/wiki/Éolienne_de_secours
- Citation : « éolienne de secours » ; anglais « ram air turbine » (RAT). Termes du rapport (anglais) : « Ram Air Turbine (RAT) ».
- Usage courant en français vu : neozone.org (« éolienne » de secours), Wikipédia. Utilisation par Airbus France, Air France ou le BEA du terme « éolienne » : **non vérifiée** (une recherche, aucun document de ces organismes lu). « Turbine à air dynamique » : non trouvé dans une source française.
- Conseil : dire « éolienne de secours » à l'écran et en voix ; « RAT » en sigle.

## 2. Mécanisme

### 2.1 Déploiement sur A330 (primaire)
- Condition automatique A330/A340, Airbus : « 1- All engines OFF 2- All engines hydraulic pumps low pressure 3- Flight condition 4- A/C speed > 100kts ». Airbus, Maintenance Briefing Notes « Uncommanded RAT extensions », p. 7. **A** (lu). https://dru10.imibo.com/sites/default/files/bookshelf/4022.pdf (copie du document Airbus daté du 19 juillet 2011 d'après un résumé de recherche).
- Même document, rapport 1 : la logique d'extension est « ENG1 N2<50% AND ENG2 N2<50% » ET vitesse > 100 kt (ADIRU) ET avion « en vol » (LGCIU). A.
- Rapport GPIAA p. 26 : « a Ram Air Turbine (RAT) can be automatically or manually deployed ». Elle alimente l'hydraulique qui entraîne le générateur de secours. A.
- Commande manuelle (bouton « RAT MAN ON ») : smartcockpit.com, quiz de formation, « can be manually deployed by pressing the RAT MAN ON pb ». **C**. https://www.smartcockpit.com/wp_quiz/airbus-a330-hydraulics/
- Déclencheur alternatif A330 : niveau bas aux réservoirs vert+jaune ou vert+bleu, commandé par le HSMU. smartcockpit, **C**.
- Mécanique de sortie (famille A320, Airbus) : « Spring pressure causes the RAT actuator to extend » ; un verrou interne libéré par une électrovanne ; les trappes s'ouvrent avec elle ; voyant « RAT OUT » à l'ECAM. Airbus MBN p. 2. **A** (pour l'A320 ; A330 non décrit à l'identique, mais même type d'actionneur — des consignes FAA/EASA parlent des « électrovannes de déploiement » de l'A330, B, résumé de recherche).
- Durée de sortie : sources contradictoires (« 2 à 3 s », « environ 8 s », « 5 à 10 s » avec batteries en relais) — planefyi / flashcards, **C**. À ne pas chiffrer.
- Les batteries font le relais : rapport p. 26, « During the RAT extension, the electrical system is powered from the batteries ». A. Wikipédia FR dit la même chose (B).
- Où est-elle logée sur A330 : **non trouvé** (A320 : sous le fuselage avant, résumé de recherche, C ; 767 : « near the right wheel well », source historique, C).

### 2.2 Taille, pales, puissance
- Diamètre moyen ≈ 0,8 m ; A380 la plus grosse, 1,63 m ; puissance d'une RAT d'avion de ligne 5 à 70 kW selon l'alternateur ; deux ou quatre pales. Wikipédia FR/EN, sans source dans l'article. **B-/C**. https://fr.wikipedia.org/wiki/Éolienne_de_secours · https://en.wikipedia.org/wiki/Ram_air_turbine
- Diamètre, nombre de pales, régime, cylindrée de pompe, puissance **de la RAT d'A330** : **non trouvés**. Fabricant de l'A330 : Hamilton Sundstrand (Collins), indirect (consigne FAA 2012 citant « Hamilton Sundstrand (HS) and Arkwin », résumé de recherche, B).
- Pas des pales : sujet de brevets Collins ; aucune donnée sourcée sur l'A330. Non trouvé. (Le principe, régulateur de vitesse, est cité par Safran : « a turbine with a speed regulator », résumé de recherche non lu, page Safran en 403.)
- Gimli, 767 : hélice « four-foot », « dropped from near the right wheel well ». Source historique sur le vol 143, **C**.

### 2.3 Vitesse minimale
- Air Transat 236, capitaine : « the minimum speed to ensure RAT operations was 140 knots » (vitesse mini d'après son récit, pas une norme Airbus). Rapport GPIAA p. 62. **A** (déclaration du commandant).
- 787, consigne FAA : RAT garantie au-dessus de 160 kt au déploiement, « minimum RAT design speed of 130 knots ». Résumé de recherche, non lu. **B/C**, c'est un 787.
- A320 : sortie conditionnée à > 100 kt. Airbus MBN p. 2. A. (c'est une condition de sortie, pas la vitesse de fonctionnement).
- « 140 kt » est donc le chiffre de l'histoire (rapport). Le commandant tenait le vol entre la vitesse de plané conseillée et la vitesse de décrochage ; vitesse d'approche conseillée 170 kt, maximum train sorti 200 kt (p. 62).

## 3. Ce qui reste alimenté ou non (vol 236, rapport)

- Double extinction : l'avion perd ses deux générateurs et la pression hydraulique ; « the RAT was deployed » ; réseau électrique alimenté par le générateur de secours (p. 26). A.
- Hydraulique : « The GREEN hydraulic system continued to be powered by the RAT » ; BLUE et YELLOW perdus. A, p. 26.
- Inopérants (liste du rapport, p. 26) : protections de commandes de vol (dégradées), stabilisateur, pilotes automatiques 1 et 2, la plupart des spoilers, freins alternatifs, amortisseur de lacet 2, direction de roue avant, inverseurs. A.
- Électrique perdu « en partie » : FMGC, MCDU, HF 1, enregistreurs de vol et de voix, volets (flaps), compensation de profondeur et de direction, un écran de navigation, freinage automatique/antipatinage, DME. A, p. 26.
- Atterrissage : le commandant sélectionne LAND RECOVERY et FLAP 1 qui sort les becs ; à la sortie des becs le générateur de secours est inhibé et l'électricité passe aux batteries, « The approximate flight time on batteries is 30 minutes. » A, p. 26.
- Conséquence pour l'atterrissage : « Due to the engines-out condition, the landing was conducted without the brake anti-skid and normal breaking systems » ; accumulateur de freinage de secours limité ; freinage maximal ; roues bloquées ; pneus usés puis dégonflés 300 à 450 ft après le second toucher. A, p. 11.
- Le rapport rappelle aussi que la procédure demande une attaque d'arrondi plus tôt, la profondeur étant réduite (« pitch authority will be reduced »), p. 26. A.

## 4. Le vol Air Transat 236 (24 août 2001), d'après le rapport

Avion : Airbus A330-243, C-GITS, Toronto → Lisbonne, **13 membres d'équipage et 293 passagers** (306 personnes). A, p. 2 et p. 8.

Chronologie (UTC), p. 2 et 8 :
- 05:33 : déséquilibre de carburant noté (position 42°44'N 23°05'W).
- 05:45 : déroutement vers Lajes ; 05:48 : annonce du déroutement à Santa Maria (fuel).
- 06:13 : moteur droit (n° 2) s'éteint, à FL390, ≈ 150 milles de Lajes (p. 8) ; ailleurs « 120 nm » vu d'un contact visuel avec des lumières (p. 61).
- 06:23 : « Mayday ».
- 06:26 : moteur gauche s'éteint, **« about 65 nautical miles from the Lajes airport and at an altitude of about FL 345 »** (p. 2). A. (Un article du MIT/Aviation Week dit 85 nm : contredit par le rapport, ne pas l'employer.)
- 06:31 : transfert à Lajes Approche ; arrivée à ≈ 8 milles du seuil à ≈ 13 000 ft, virage à gauche de 360° pour perdre de l'altitude, puis « S-turns » sur la finale (p. 8).
- 06:45 : franchit le seuil de la piste 33 à ≈ 200 kt, premier toucher dur à 1 030 ft (p. 8 ; 1 050 ft dans la section 1.3), rebond de 1 650 ft, second toucher à ≈ 2 800 ft ; arrêt à 7 600 ft du seuil sur une piste de ≈ 10 000 ft (le texte cite 10 865 × 300 ft par ailleurs : piste de 3 300 m). A.
- Plané : de 06:26 à 06:45, **≈ 19 minutes** (calcul à partir des heures du rapport) pour **≈ 65 milles nautiques** à partir de FL345 (≈ 120 km). C'est la formulation du rapport « 65 nautical miles from the Lajes airport » ; la distance parcourue est plus longue (virage de 360° + S). Dire « une soixantaine de milles, une vingtaine de minutes » (ordre de grandeur).
- Pneus : « 8 des 10 » est un détail de presse (résumé de recherche, B) ; le rapport parle des « main wheels » : tous les pneus des deux bogies principaux ont fondu à l'abrasion, p. 11. A (sans le « 8 sur 10 »).
- Blessés : « Fourteen passengers and two cabin-crew members received minor injuries, and two persons received serious injuries during the emergency evacuation » (p. 8). Le résumé p. 2 dit « 16 passengers and 2 cabin-crew members received injuries ». **Aucun mort.** A. Les blessures sont toutes venues de l'évacuation (p. 11).
- Évacuation : porte L3 mal ouverte (20 à 25 cm), p. 27. A.

Cause (p. 69, section 2.1) : « the double-engine flameout was caused by fuel exhaustion, which was precipitated by a fuel leak developing in the right engine as the result of the use of mismatched fuel and hydraulic lines during the installation of the hydraulic pump ». Facteur facilitant : l'équipage n'a pas appliqué la procédure FUEL LEAK. A. Le rapport conclut : « The Captain's skill in conducting the engines-out glide ... saved the lives of the passengers and crew » (conclusion 12). A.

Le commandant : Robert Piché (nom d'après le rapport ? **non vérifié dans le rapport** — recherche rapide du nom dans le texte non faite ; vu dans les médias, B). Le rapport écrit « the Captain ». Distinction : ne pas poser un nom sans l'avoir vérifié.

Piché a reçu en 2002 le Superior Airmanship Award de l'ALPA (Wikipédia, B). Air Transat condamnée à 250 000 $ CA (CBC via Wikipédia, B).

Ce que le rapport dit de la RAT : voir 3 ; elle est sortie automatiquement sur la double panne, a fourni la pression du système vert (commandes de vol primaires, p. 26), ce qui a permis le plané et l'approche. Le texte du rapport sur 06:26 : « the aircraft would have automatically reverted to the emergency electrical configuration, with power supplied by the automatic extension of the ram air turbine » (p. 25). A. Le rapport n'a pas enregistré les alarmes correspondantes.

## 5. Autres cas

- **Gimli, Air Canada 143, 23 juillet 1983**, Boeing 767-200. Plané de 41 000 ft, 17 minutes sans moteur (Wikipédia, B), 69 occupants (61 passagers, 8 équipage), 0 mort, 10 blessés (encadré, non sourcé), cause : erreur de conversion carburant (livres/kilos) ; RAT : « drives a hydraulic pump to supply power to hydraulic systems » ; sans volets/becs, approche « too high and fast » ; glissade latérale. https://en.wikipedia.org/wiki/Gimli_Glider B. Finesse calculée par Wikipédia ≈ 12:1 observée (10 nm pour 5 000 ft), optimale ≈ 20:1 pour un 767 (B-, citée).
- **US Airways 1549, 15 janv. 2009** (A320) : APU et RAT fonctionnaient pendant la descente vers l'Hudson (Wall Street Journal via Wikipédia, B). Auto ou manuel : non précisé. La RAT n'a pas été le sujet du rapport NTSB dans les sources lues.
- **Ethiopian 961 (1996), Pinnacle 3701 (2004)** : cités dans Wikipédia FR comme incidents avec RAT. B-.
- **Nombre de déploiements/vies sauvées revendiqué par un fabricant** : **introuvable**.
- À part (hors sujet pour le film) : 31 déploiements non commandés de RAT de 787 « en 14 ans » (résumé de recherche d'un article de presse, non lu, C).

## 6. Finesse (plané)

- 767 « Gimli » : meilleure finesse ≈ 20:1 (Wikipédia citant deux sources, B), observée ≈ 12:1.
- A320 « ≈ 17:1 », A330/777 « 18 à 20:1 » : forums et blogs, **C**.
- **Calcul maison sur le vol 236** : de FL345 à 13 000 ft sur environ 57 milles (65 − 8) : ≈ 21 500 ft perdus pour ≈ 346 000 ft parcourus, soit **≈ 16:1** (hors virages, trajectoire vectorisée). Calcul, pas une source ; ordre de grandeur « environ 16 kilomètres par kilomètre d'altitude ». À dire avec « environ ».
- Conversion : 17:1 ≈ 2,8 milles nautiques par 1 000 ft (calcul).

## 7. Histoire courte

- Les plus anciens exemples : petits moulins permanents sur des avions et dirigeables anciens (Wikipédia EN, non sourcé, C). Vickers VC10 : « fitted with RATs », cité Flight International, 10 mai 1962 ; choisie parce que ses commandes étaient « packaged » (Wikipédia EN, B).
- Wikipédia FR : « Most airliners have one, starting in the 1960s with the Vickers VC-10 » (« la plupart des avions de ligne en ont une, à commencer dans les années 1960 par le VC-10 »). B.
- Premier avion de ligne équipé, date exacte : non confirmé par source primaire.
- Usages militaires : nacelles de canon, bombes (Yellow Sun). Hors film.

## 8. Idées reçues et reproches possibles d'un pilote

- « Sans moteur il tombe comme une pierre » : faux ; il plane (≈ 16:1 à 20:1). Rapport 236 et Gimli.
- « La RAT redémarre les moteurs » : faux ; elle donne hydraulique et électricité de secours. Les moteurs d'un A330 en panne sèche ne repartent pas sans carburant.
- Un pilote reprocherait : (1) « hélice qui sort du ventre » : sur certains avions, elle sort d'une aile ou du carénage du fuselage, selon le type ; (2) dire qu'elle donne « tout » : elle donne le système vert, pas le bleu et le jaune ; plus de volets, de freins normaux, d'inverseurs ; (3) l'avion ne plane pas « grâce à elle » : elle sert à commander, pas à planer ; (4) une RAT n'est pas un « générateur » directement sur A330 : c'est une pompe hydraulique qui entraîne le générateur de secours (rapport p. 26) ; (5) « vitesse minimale 140 kt » vient du récit du commandant, pas d'un manuel lu.
- La RAT ne rallume pas ; un moteur peut parfois se relancer en moulinet, hors sujet — ne pas mélanger.

## 9. Accident récent où la RAT est citée (à ne PAS utiliser)

**Air India 171 (Boeing 787-8, Ahmedabad, 12 juin 2025)** : le rapport préliminaire de l'AAIB indique une RAT déployée après le décollage, pompe hydraulique de RAT alimentant dès ≈ 08:08:47 UTC, après le passage des manettes de coupure carburant de RUN à CUTOFF (résumés de presse, B/C, non lu en primaire). Autres cas récents cités : Virgin Atlantic 2024, LATAM 603 (2025) (Wikipédia EN). Sujet sensible, enquête non close : ne pas citer.

## À dire tel quel

1. Air Transat 236, A330, 24 août 2001, Toronto → Lisbonne, 306 personnes à bord (13 d'équipage, 293 passagers). (A, rapport p. 2)
2. Cause : fuite de carburant sur le moteur droit, causée par une conduite de carburant et une conduite hydraulique non adaptées montées lors d'un remplacement de pompe ; équipage n'a pas appliqué la procédure fuite de carburant. (A, p. 69)
3. À 06 h 26 UTC, le second moteur s'éteint à environ 65 milles de Lajes, vers 34 500 pieds. (A, p. 2)
4. Après la double panne, la RAT sort automatiquement ; le système hydraulique vert reste alimenté par elle. (A, p. 25-26)
5. Les systèmes bleu et jaune sont perdus : plus de pilotes automatiques, la plupart des spoilers, les freins normaux, la direction de roue avant, les inverseurs. (A, p. 26)
6. Il se pose environ 19 minutes plus tard (06:45), à environ 200 nœuds, rebondit, freine à fond ; les pneus s'usent jusqu'à se dégonfler. (A, p. 8 et 11)
7. Personne n'est mort ; 16 passagers et 2 membres d'équipage blessés, tous à l'évacuation (14 + 2 légèrement, 2 sérieusement). (A, p. 8)
8. Le rapport : le savoir-faire du commandant « a évité un accident catastrophique ». (A, conclusion 12)
9. Sur A330, la RAT sort quand les deux moteurs sont arrêtés, les pompes hydrauliques en basse pression, l'avion en vol à plus de 100 nœuds. (A, Airbus MBN p. 7)

## Ordres de grandeur (à dire avec « environ »)

- Plané du vol 236 : environ 19 minutes, une soixantaine de milles nautiques (≈ 120 km) depuis 34 500 ft.
- Finesse d'un avion de ligne : environ 16 à 20 pour 1 (16 : calcul sur le vol 236 ; 17-20 : sources faibles/Wikipédia).
- RAT d'avion de ligne : environ 0,8 m de diamètre (A380 : 1,63 m) ; 5 à 70 kW (Wikipédia, B-).
- Vitesse minimale pour que la RAT serve : environ 140 nœuds (récit du commandant, rapport p. 62).
- Batteries : environ 30 minutes de vol en secours une fois la RAT inhibée à la sortie des becs (rapport p. 26).
- Plané de Gimli : environ 17 minutes depuis 41 000 ft (Wikipédia, B).

## À ne pas dire

- « La RAT rallume les moteurs » / « le vent rallume l'avion ».
- « La RAT donne toute l'électricité et toute l'hydraulique » (seulement le vert en 236 ; beaucoup de systèmes perdus).
- « Elle sort en deux secondes » (2-3 s / 8 s / 5-10 s, sources C).
- 85 milles de Lajes (article du MIT) ; la bonne valeur du rapport est 65 nm.
- « 8 pneus éclatés sur 10 » comme chiffre du rapport ; « 14 blessés » ou « 18 blessés » seuls sans la nuance 16 + 2.
- Le nom du commandant tant que non vérifié dans un document primaire (le rapport dit « the Captain »).
- Diamètre, pales, puissance exacts d'une RAT d'A330 (non trouvés).
- Tout lien avec Air India 171 (enquête en cours).
- « Une centaine de vies sauvées par la RAT » : aucun chiffre trouvé.
- « Il n'y a aucun moyen de piloter sans RAT » : sur A330, l'avion a aussi un générateur sur batteries pour un temps limité (~30 min), la RAT s'y ajoute.

## Trois faits-accroche

1. Deux moteurs éteints, 65 milles de la piste, 34 500 pieds : l'A330 d'Air Transat se pose 19 minutes plus tard, sans un mort (rapport GPIAA).
2. Cette nuit-là, une hélice sortie du fuselage a gardé en vie un seul des trois circuits hydrauliques de l'avion : le vert (rapport p. 26).
3. Sans moteur, plus de pompes : c'est le vent de la descente qui fait tourner une hélice, et l'hélice qui rend les commandes au pilote.

## Non trouvé

- Diamètre, nombre de pales, régime, puissance, cylindrée de la RAT d'A330 ; sa position exacte sous l'A330.
- Temps de sortie, délai avant pression hydraulique ; vitesse minimale officielle Airbus A330 (seul le « 140 kt » du commandant).
- Nombre de déploiements en service ou de vies sauvées revendiqué par un fabricant.
- Nom français « turbine à air dynamique » dans une source ; emploi par Airbus/Air France/BEA du mot « éolienne ».
- Premier avion de ligne équipé (hors VC10 années 1960).
- Rapport NTSB 1549 sur la RAT (FAA 403, Wikipédia seulement).
- Vérification du nom Piché dans le rapport ; fiche A330 de Collins/Safran (page Safran en 403).
- Rapport Gimli (Board of Inquiry) lu en primaire.
- Finesse officielle Airbus.

## URL lues

- Rapport GPIAA 22/ACCID/2001 : https://www.faa.gov/sites/faa.gov/files/2022-11/AirTransat236_AccidentReport.pdf (lu, texte intégral, via téléchargement)
- Airbus Maintenance Briefing Notes, RAT : https://dru10.imibo.com/sites/default/files/bookshelf/4022.pdf (lu)
- https://web.mit.edu/16.400/www/story_time/airbus/airbus.htm (lu ; erreur 85 nm)
- https://en.wikipedia.org/wiki/Ram_air_turbine · https://fr.wikipedia.org/wiki/Éolienne_de_secours
- https://en.wikipedia.org/wiki/Gimli_Glider · https://en.wikipedia.org/wiki/Air_Transat_Flight_236 · https://en.wikipedia.org/wiki/US_Airways_Flight_1549
- https://skybrary.aero/articles/ram-air-turbine-rat · https://www.smartcockpit.com/wp_quiz/airbus-a330-hydraulics/
- Tentés sans succès : faa.gov/lessonslearned/.../N160US (403), safran-group.com RAT (403) ; Ladkin PDF (illisible).
- Résumés de recherche non lus : consignes EASA/FAA (RAT A330 non déployée, 160/130 kt du 787), articles Air India 171, planefyi, forums de finesse.

# CR03 — Concorde AF4590, 25 juillet 2000 : le réservoir que rien ne protégeait contre un choc venu de l'intérieur

**Genre : affaire (format Compte à rebours).** Recherche faite le 13/11/2026, 29 requêtes web environ, plus lecture locale de PDF de la source.

## 0. Le rapport officiel : ce qui a été lu, ce qui ne l'a pas été

- **Le rapport final du BEA** (f-sc000725a, 16 janvier 2002, version anglaise ou française) **n'a pas pu être ouvert en entier** : le PDF fait ≈ 12,5 Mio, l'outil de lecture s'arrête à 10 Mio (« maxContentLength exceeded »), et l'adresse `/docspa/2000/f-sc000725/pdf/...` répond 404. La page de couverture `bea.aero/.../f-sc000725a.html` est lue (index et liste des annexes). **Tout ce qui est dit « rapport final » plus bas vient donc d'une source secondaire qui le cite, et est noté [S].**
- **Ce qui a été lu à la source, du BEA lui-même [P]** :
  1. **Le rapport intermédiaire du BEA du 10/07/2001** (f-sc000725ae2, en anglais, PDF complet lu par extraction de texte). Il porte la chronologie à la dixième de seconde, l'examen de la lamelle, l'analyse des alarmes, la préparation du vol, les pratiques d'inspection des pistes. **Il date d'avant le rapport final** : l'enquête y est dite « en cours ».
  2. **Le rapport d'étape du BEA du 15/12/2000** (f-sc000725e, français) : ouvert, titre et avertissement lus seulement.
  3. **L'annexe 2 du rapport final** (transcription du CVR, en UTC, bilingue) : lue en entier, c'est la transcription officielle citée plus bas.
  4. **La synthèse « Accident du Concorde, 25 juillet 2000 » publiée par le BEA** (`Histoire-Concorde-VF.pdf`) : lue en entier. C'est la meilleure source BEA sur l'accident, la cause et ce qui a changé.
  5. **L'annexe 8 (note EADS du 16/07/2001, reproduite dans le rapport)** : lue, donne la masse des deux plus gros morceaux de pneu et le panneau d'intrados.
- **Non lues** : le rapport final lui-même ; les annexes 3, 4, 9, 10, 12 (3 et 12 sont des images sans couche de texte lisible, 4 une page de courbes, 9 et 10 n'ont pas été ouvertes) ; les textes de l'arrêt du procès (le jugement du 6/12/2010 et l'arrêt du 29/11/2012 ne sont connus que par la presse et un résumé).
- **Conséquence pour le script** : tout chiffre marqué [P] se dit sans réserve. Tout chiffre [S] se dit seulement s'il est aussi dans une source [P], ou en ordre de grandeur. Pour la cause « officielle » telle que le rapport final la formule, **il faut ouvrir le PDF final à la main avant de le citer mot à mot**.

## 1. Verdict sur l'angle

**L'angle tient.** « Le défaut de la sécurité » est ici le plus net qu'on puisse trouver : le BEA le dit lui-même, **personne n'avait imaginé qu'un pneu qui éclate puisse percer un réservoir par une onde de choc, de l'intérieur** [P, synthèse BEA]. Il y avait six perforations de réservoir avant 2000 (la pire à Washington le 14/06/1979, avec un débit de 4 kg/s contre ≈ 60 kg/s le 25/07/2000) : on avait vu le risque, jamais le mécanisme.

**Vu et revu ?** Oui, le sujet Concorde existe partout (« la lamelle », « le crash du Concorde »). L'angle qui n'est pas vu : **le réservoir 5, sa paroi, l'onde dans le kérosène**, la minute qui suit, et le fait que la sécurité (la règle V1 : « après V1 on décolle quoi qu'il arrive ») a envoyé l'équipage dans le piège. À garder : ne pas faire « la lamelle ».

**Les deux tests.**
- **Spectacle** : OUI. Une traînée de flammes de plusieurs dizaines de mètres derrière un avion de 185 tonnes en pleine accélération, sur une piste, lisible sans le son dès la première image. Le contrôleur la voit à 16 h 43 min 13 s (locale) [P]. Image : le Concorde vu d'en bas, le feu qui prend sous l'aile gauche.
- **Histoire** : OUI. Quelqu'un (l'équipage, 109 personnes), un danger (le feu qui grossit), quelques secondes (**1 min 28 entre « V1 » et l'impact**, **120 s pile entre « top » et l'impact** [P, calcul sur la transcription]), et une raison de l'envoyer : « une lamelle de 43 cm, 1,4 mm d'épaisseur, 5 minutes plus tôt, sur la même piste ».

## 2. La scène

**Le cas réel (daté, sourcé [P]).** Mardi 25 juillet 2000, aéroport de Paris-Charles de Gaulle (Roissy), piste 26 droite. Air France 4590, Concorde F-BTSC, vol charter vers New York, **100 passagers et 9 membres d'équipage** [P, synthèse BEA]. Le Concorde avait trouvé la place de la piste libre, un DC-10 de Continental avait décollé de la même piste **cinq minutes plus tôt** [P, synthèse BEA].

**Heures réelles (CVR UTC [P] ; local = UTC + 2).** Les films et la presse disent souvent 16 h 4x : c'est l'heure locale. Le BEA publie en UTC.

| UTC | Local | Quoi | Source |
| --- | --- | --- | --- |
| 14:42:17 | 16:42:17 | Autorisation de décollage (contrôleur) | Transcription annexe 2 |
| 14:42:31 | 16:42:31 | « Top » du commandant : poussée réglée, début du roulement | Transcription annexe 2 |
| 14:42:54,6 | 16:42:54 | « Cent nœuds » (copilote) | idem |
| 14:43:03,7 | 16:43:03 | « V1 » (copilote) : point de non-retour (150 kt = 278 km/h) | idem + synthèse BEA |
| ≈ 14:43:10 | 16:43:10 | Le pneu n° 2 éclate : bruit à 14:43:10,1 puis changement de fond sonore 14:43:11 à 14:43:13,8 | Transcription ; BEA 2001 |
| 14:43:11 à 14:43:13 | | Premier pompage (surge) du moteur 2 entre 14:43:12,3 et 14:43:13 ; le copilote dit « attention » | BEA 2001 §16 |
| 14:43:13 | 16:43:13 | Début de la rotation à 183 kt (≈ 339 km/h) ; le contrôleur annonce « des flammes derrière vous » (14:43:13,4) ; le mécanicien annonce la panne du moteur 2 | Synthèse BEA + transcription |
| 14:43:22,8 | 16:43:22 | **Première alarme feu moteur** (cloche + gong), 11 s après le début du feu externe, s'arrête 4 s ; vitesse 200 kt (≈ 370 km/h) | BEA 2001 §16.12.2 ; synthèse BEA |
| 14:43:24,8 | | « Shut down engine two » (mécanicien) | Transcription |
| 14:43:25,8 | | « Engine fire procedure » (commandant) | idem |
| 14:43:29,3 | | Poignée de feu tirée | idem |
| 14:43:30 | | « Gear on retract » (commandant) : train à rentrer | idem |
| 14:43:42,3 | | Deuxième alarme feu ; extincteur percuté à 14:43:44,7 | idem |
| 14:43:56,7 | | « The gear isn't retracting » (copilote) : le train ne rentre pas | idem |
| 14:43:58,6 | | Troisième alarme feu | idem |
| 14:43:59 à 14:44:03 | | Trois alarmes GPWS (« whoop whoop pull up ») ; le copilote dit « Le Bourget, Le Bourget » à 14:44:00,6 | idem |
| 14:44:17,5 | | Moteurs 3 et 4 fonctionnent normalement jusque-là ; puis réduction de poussée (bruits de manette 14:44:24 à 14:44:27) puis perte brutale de poussée (14:44:29,5) | BEA 2001 §16 |
| 14:44:19,8 | | « (no time no) », voix du commandant, mots incertains dans la transcription | Transcription |
| 14:44:31,6 | 16:44:31 | Fin de l'enregistrement. Impact sur l'hôtel, intersection D902 et N17, à ≈ 6 km du bout de la piste | Transcription ; synthèse BEA |

**Ce qu'on peut montrer** : la piste vue de bas en haut, la lamelle (un trait gris de 43 cm), le pneu, le dessous de l'aile gauche, le réservoir 5 (volume sombre), le nuage de kérosène, le feu qui s'accroche au puits de train, le panneau expulsé (≈ 30 × 30 cm retrouvé sur la piste), le chrono. **Aucune cabine, aucun passager**, jamais d'images du crash.
**Ce qui est reconstitué par l'image** (aucune source ne le décrit visuellement) : la forme du feu, la trajectoire exacte du débris de pneu, l'allure de l'onde dans le liquide.

## 3. Le système qui sauve (et son défaut)

Le Concorde n'avait **aucun système conçu pour résister à un choc hydrodynamique dans un réservoir** : la sécurité « pneu » reposait sur l'entretien et l'inspection des pistes, la sécurité « réservoir » sur l'idée qu'un morceau de pneu ne pouvait que faire un petit trou (6 précédents : « jamais été anticipé que l'éclatement du pneu pouvait provoquer une onde de choc dans le réservoir et le perforer depuis l'intérieur » [P, synthèse BEA]).

Les deux protections qui ont manqué ce jour-là :
1. **La piste propre** : l'ADP (gestionnaire) devait faire **trois inspections par jour** ; **avant l'accident la moyenne réelle était de deux par jour** [P, BEA 2001 §18.3.2.1]. Le BEA 2001 note aussi qu'**aucune réglementation nationale** n'existait : on suivait des recommandations de l'OACI.
2. **La règle V1** : le commandant l'a dite à voix haute dans le briefing (CVR 14:39:04) : « entre 0 et 100 nœuds j'arrête pour toute alarme, éclat de pneu ; entre 100 nœuds et V1 j'arrête pour un feu moteur, un éclat de pneu... **après V1 on continue** ». Le pneu a éclaté **après V1** (V1 à 14:43:03,7 ; pneu ≈ 14:43:10) : l'avion était trop rapide pour s'arrêter sans assez de puissance pour voler [P, synthèse BEA : « aucune manoeuvre de l'équipage n'aurait pu empêcher l'accident »].

## 4. Le mécanisme ouvert

**Pièces nommées (le mot d'un professionnel).**
1. **La lamelle d'usure** (« wear strip ») du **capot d'inverseur de poussée** (moteur n° 3) du DC-10 N13067 de Continental : **435 mm de long, 29 à 34 mm de large, ≈ 1,4 mm d'épaisseur**, alliage de titane TA6V (≈ 89,7 % de titane, 7 % d'aluminium, 2,3 % de vanadium) [P, BEA 2001 §16.6.4]. **Masse : non donnée dans les sources lues** (ne pas la dire).
2. **Le pneu n° 2** : pneu avant droit du train principal gauche [P, synthèse BEA]. Une partie a été lacérée ; **deux morceaux principaux retrouvés : 4,45 kg et 2,6 kg** [P, annexe 8, note EADS reproduite dans le rapport] ; « un morceau de plus de 4 kg » projeté vers le haut et l'avant à très grande vitesse [P, synthèse BEA].
3. **L'intrados de l'aile gauche** (le dessous de la voilure) au niveau du **réservoir n° 5** ; la zone entre les nervures 23A et 24A et les longerons 55 et 56 [P, annexe 8].
4. **Le réservoir n° 5** : intégré à l'aile, plein de kérosène (94 % plein selon le rapport final, [S]).
5. **Le puits de train** (logement du train principal gauche), où le feu s'est accroché [P, synthèse BEA].
6. **Les moteurs 1 et 2** (Rolls-Royce Olympus 593, côté gauche) : pompages sévères en avalant les gaz chauds et le carburant non brûlé [P, synthèse BEA].
7. **Le train d'atterrissage et les commandes de vol** : le train ne rentre pas ; une partie des commandes de vol est détruite, d'où une forte inclinaison à gauche [P, synthèse BEA].

**Ce qui déclenche** : un pneu qui roule sur un morceau de métal rigide (titane, peu malléable) à ≈ 300 km/h. Vitesse au moment de la perte : « 175 kt » (324 km/h) selon le BEA 2001 [P] ; « environ 300 km/h » dans la synthèse BEA [P]. Ordre de grandeur sûr : plus de 300 km/h.

**L'ordre des événements (BEA [P])** : pneu lacéré, explosion → un débris frappe le dessous de l'aile gauche → déformation de la paroi, onde dans le kérosène → la paroi cède **de l'intérieur** à l'endroit le plus fragile (un panneau d'intrados ≈ 300 × 300 mm est retrouvé sur la piste, bombé vers l'extérieur, sans trace d'impact [P, annexe 8]) → fuite ≈ **60 kg/s, ≈ 75 L/s** [P, synthèse BEA ; le CNRS dit 50 à 100 L/s, annexe 8] → feu → moteurs 2 puis 1 perdent presque toute leur poussée → le train ne rentre pas → perte de contrôle.

**Pourquoi ça marche (le beat `principe`, une phrase, sourcée).** *Un liquide ne se comprime pas : un choc donné d'un côté du réservoir plein pousse la paroi de l'autre côté, de l'intérieur.* Le BEA parle d'« onde de choc hydrodynamique » dans la synthèse [P] ; le rapport intermédiaire [P, §16] décrit un processus qui « associe la déformation de la paroi du réservoir et la propagation de l'onde dans le kérosène ». **Nuance à garder** : selon le rapport final [S], le BEA retient une **« transmission d'énergie »** de l'impact vers un autre point de la paroi, dont une surpression hydrodynamique n'est qu'une part possible ; la représentante britannique n'était pas d'accord sur la séparation des deux mécanismes. La phrase de la voix reste donc : « le choc se propage dans le kérosène et fait céder la paroi de l'intérieur ».
**Ordre de grandeur de l'énergie** : 4,5 kg à ≈ 140 m/s [S, heritageconcorde] donne ≈ 44 kJ (½ m v²), soit l'énergie d'une voiture d'une tonne à ≈ 32 km/h [O, calcul fait ici, ne pas dire « selon le BEA »].

**Délais (BEA [P])** : V1 → pneu ≈ 6 à 7 s ; pneu → première alarme feu 11 s ; première alarme feu → impact 68 s ; « top » → impact **120 s** exactement ; V1 → impact 88 s ; le BEA dit « moins de deux minutes entre le passage sur la lamelle et la collision ».

## 5. Chiffres, avec leur source et leur niveau

| Chiffre | Source | Niveau |
| --- | --- | --- |
| 100 passagers + 9 équipage ; 113 morts (109 à bord, 4 dans l'hôtel) | BEA, synthèse | [P] |
| DC-10 a décollé 5 minutes avant | BEA, synthèse | [P] |
| Lamelle : 435 mm × 29-34 mm × ≈ 1,4 mm, titane TA6V | BEA 2001 §16.6.4 | [P] |
| 12 trous percés au hasard dans la lamelle (+ 17 marques de trous supplémentaires sur le mastic) | BEA 2001 §16.6.4 | [P] |
| Lamelle changée à Houston le 9 juillet 2000 (la « lower left wear strip ») ; moteur 3 ; C check à Tel Aviv terminé le 11/06/2000 | BEA 2001 §16.6.3 | [P] |
| Débris de pneu : 4,45 kg et 2,6 kg ; essais de roulage : des morceaux de 7 et 11 kg | annexe 8 | [P] |
| Panneau d'intrados ≈ 300 × 300 mm retrouvé sur la piste | annexe 8 | [P] |
| Fuite ≈ 75 L/s (≈ 60 kg/s) ; 1979 : 4 kg/s | BEA, synthèse ; CNRS (50-100 L/s) | [P] |
| V1 = 150 kt (278 km/h) ; VR annoncé 198 kt ; V2 222 kt | transcription 14:14:17 (briefing) ; synthèse BEA | [P] |
| Rotation amorcée à 183 kt (339 km/h), avant VR : un sujet de l'enquête (annexe 10) | synthèse BEA | [P] sur le chiffre, [non lu] sur l'analyse |
| Alarme feu 11 s après le début du feu ; 200 kt à ce moment | BEA 2001 ; synthèse | [P] |
| 3 alarmes feu, 3 GPWS | transcription | [P] |
| Vol à 200 ft (≈ 60 m) et 200 kt pendant ≈ une minute | BEA 2001 synopsis | [P] |
| Masse au décollage prévue 184 800 kg ; calcul du « dispatcher » : 177 930 kg max pour ces conditions | BEA 2001 §10 | [P] (ne pas en faire la cause) |
| 3 inspections de piste par jour exigées ; 2 en moyenne avant l'accident | BEA 2001 §18.3.2.1 | [P] |
| Impact à ≈ 6 km du bout de piste | synthèse BEA | [P] |
| Réservoir 5 plein à 94 % | rapport final via migflug | [S] |

## 6. Ce qui retourne une idée reçue (candidates de chute)

1. **« Ce n'est pas la lamelle qui a percé le réservoir. »** La lamelle n'a touché que le pneu. Le réservoir a cédé **de l'intérieur**, sous un choc transmis par le kérosène, sans trace d'impact sur le panneau [P, BEA synthèse + annexe 8]. La chute : « Le titane n'a jamais touché le réservoir. »
2. **« Les pilotes n'ont rien raté. »** Le BEA le dit : « aucune manœuvre n'aurait pu empêcher l'accident » ; le pneu a éclaté **après V1**, la règle de sécurité (on décolle) était la bonne [P]. Idée reçue : « c'est l'équipage ». Retournement : la règle V1 a fait ce qu'elle devait, c'est le réservoir qui n'avait pas de protection.
3. **« On savait déjà. »** Six perforations de réservoir avant 2000, dont Washington 1979 (4 kg/s) : on avait vu des trous, jamais l'onde de choc intérieure [P, synthèse BEA]. « On avait vu le risque, pas le mécanisme. »

## 7. La question du commentaire (fermée, deux camps, un mot)

1. « Une lamelle de 43 cm, 1,4 mm d'épaisseur : assez pour faire tomber un avion… oui ou non ? »
2. « Après V1, on décolle quoi qu'il arrive : la bonne règle… ou la règle qui l'a piégé ? » (réponse : bonne / piégé)
3. « Piste inspectée deux fois par jour au lieu de trois : tu l'aurais su ? Oui ou non ? » (réponse d'un mot ; **à vérifier** : le chiffre est du BEA 2001, jamais retrouvé dans le final)

## 8. L'histoire du système

- **Le Concorde** : conçu par Sud-Aviation (aujourd'hui Airbus) et British Aircraft Corporation (BAE Systems) ; premiers vols d'essai 1969 ; premier vol commercial **21 janvier 1976** [P, synthèse BEA]. Quatre Rolls-Royce Olympus 593, Mach 2,02 en croisière (2 172 km/h), FL600 [P].
- **Le défaut connu depuis 1979** : six perforations de réservoir entre 1979 et 1993, la plus grave le **14 juin 1979 à Washington** (F-BVFC), atterrissage d'urgence sans victime ; l'accident de 2000 est le seul mortel [P, synthèse BEA].

## 9. Ce qui a changé depuis (dates et sources)

| Date | Quoi | Source |
| --- | --- | --- |
| 25/07/2000 | Air France cloue ses Concorde au sol le lendemain | BEA synthèse [P] |
| 16/08/2000 | Le BEA recommande la suspension des certificats de navigabilité (avec l'AAIB britannique), acceptée tout de suite | BEA synthèse [P] |
| 2001 | **Revêtement de Kevlar dans les réservoirs** pour empêcher les fuites après dommage structurel ; **nouveaux pneus radiaux** (Michelin « Near Zero Growth », NZG) ; **câblage du puits de train protégé** | BEA synthèse [P] pour Kevlar + pneus radiaux ; NZG et câblage : [S] (migflug, Wikipédia FR) |
| 05/09/2001 | Consigne de navigabilité conjointe (Kevlar dans six réservoirs, 8 pneus NZG, câblage blindé) | migflug [S] ; non vérifié à la consigne elle-même |
| 07/11/2001 | Reprise des vols, Air France et British Airways | BEA synthèse [P] ; Wikipédia [S] |
| Mai 2003 | Dernier vol Air France (BEA : 23 mai ; migflug : 31 mai) ; British Airways : octobre 2003 | **Contradiction entre sources : dire « mai 2003 »** |
| 2002 | Le BEA recommande une étude sur les exigences de certification des pneus, des enregistreurs plus rapides, un audit de l'exploitation du Concorde | rapport final via insurancejournal [S] |
| 2000-2001 | **Inspection des pistes** : à Roissy, passage à trois inspections par jour (ce qui était déjà la règle) ; la DGAC prépare un projet de règlement sur l'inspection des pistes et un manuel sur la prévention des débris | BEA 2001 §18.3 [P] (le texte final du règlement n'a pas été lu) |

**Limite** : la modification des réservoirs a alourdi l'avion et réduit sa capacité de passagers, la reprise a été de courte durée [P, synthèse BEA].

## 10. Les personnes (ce qu'on peut dire, ce qu'on ne peut pas)

- **Le rapport BEA n'anonymise pas tout** : « Christian » est audible dans la transcription (« go Christian »). La presse nomme le commandant (Christian Marty) ; **non vérifié ici** : ne pas le nommer dans le film. Dire « le commandant », « le copilote », « le mécanicien navigant ».
- **Continental et le mécanicien (John Taylor)** : procès à Pontoise, ouvert le 2/02/2010 ; **jugement du 6/12/2010** : Continental condamnée (200 000 € d'amende) et Taylor 15 mois avec sursis [S, migflug + Wikipédia] ; **arrêt de la cour d'appel de Versailles du 29/11/2012** : les condamnations pénales sont annulées (Continental et Taylor relaxés), **Continental reste civilement responsable** (faute de négligence dans la maintenance) et paie **1 million d'euros à Air France** [S, plusieurs sources de presse concordantes ; une source dit 1,44 million de dollars : non tranché, ne pas dire de chiffre en dollars].
- **Ne pas prêter** : à l'équipage une faute (le BEA dit le contraire) ; à Continental « le crash est son crime » (relaxe en appel) ; au constructeur « il savait ».

## 11. Pour l'annonce

**Phrase (17 mots, dite après « Abonne-toi : », un seul fait sûr [P]) :**
« Une lamelle de métal de quarante-trois centimètres a fait tomber un Concorde, cinq minutes après sa chute. »

Fait vérifié : 435 mm (BEA 2001), « cinq minutes » (BEA synthèse). « A fait tomber » raccourcit la chaîne ; alternative plus stricte : « Un morceau de métal de quarante-trois centimètres est tombé d'un avion. Cinq minutes plus tard, un Concorde roulait dessus » (22 mots, trop long).

## 12. À ne pas dire

- **« La lamelle a percé le réservoir »** : faux. Elle a éclaté le pneu ; le réservoir a cédé sous un choc transmis (BEA).
- **« Le pneu a éclaté avant V1 »** : faux. Après V1 (14:43:03,7 vs ≈ 14:43:10).
- **L'heure** : pas « 14 h 44 » (UTC) comme heure locale. En film : heure locale 16 h 42 min 31 s, 16 h 43 min 13 s, 16 h 44 min 31 s. Les sources en ligne mélangent (la page migflug dit « locale » pour des heures UTC).
- **Rotation, vitesse du pneu** : « 175 kt » (BEA 2001) ou « ≈ 300 km/h » (synthèse BEA) ; ne pas donner de décimale.
- **« Le feu a pris à cause d'un court-circuit / de l'arc au puits de train »** : l'origine de l'ignition n'a pas été déterminée (BEA : « sans que l'enquête ait pu déterminer l'origine exacte de l'incendie »).
- **« Le train ne rentrait pas à cause de X »** : non établi dans les sources lues ; le BEA 2001 écarte la perte totale du circuit hydraulique vert comme peu probable ; la raison est un sujet de l'enquête.
- **« L'avion était surchargé donc il est tombé »** : le BEA 2001 note 184 800 kg prévus contre 177 930 kg calculés par le dispatcher ; **ne pas en faire la cause** (le rapport final n'a pas été lu sur ce point).
- **Le film « de cinéma »** : le documentaire de 2010 (hypothèse d'un défaut de piste) a été jugé non retenu par le BEA [S, Wikipédia FR].
- **Ne jamais dire** : « jamais vu » (1979) ; « le Concorde est tombé à cause de Continental » ; « les pilotes auraient pu... ».
- **Nombre de morts** : 113 (109 à bord + 4 à l'hôtel). Wikipédia FR liste 100 passagers + 9 équipage + 4 au sol, cohérent. Le même article dit 6 blessés au sol : non vérifié.

## 13. Ce que la voix peut dire (dix phrases)

1. « Seize heures quarante-deux. Tu décolles de Roissy. » (heure locale [P])
2. « Cent cinquante nœuds. Après ça, on ne s'arrête plus. » (V1 150 kt, règle V1 [P])
3. « Sur la piste, une lamelle de titane. Quarante-trois centimètres. » ([P])
4. « Le pneu éclate. Un morceau de quatre kilos frappe l'aile. » (≥ 4 kg [P])
5. « Le titane n'a jamais touché le réservoir. » ([P], BEA : onde, pas d'impact sur le panneau)
6. « Un liquide ne se comprime pas. Le choc le traverse. » (principe [P] + physique)
7. « Soixante-quinze litres de kérosène par seconde. » ([P])
8. « Seize heures quarante-trois, treize. Le contrôleur voit des flammes. » ([P])
9. « Trois alarmes feu. Le train ne rentre pas. » ([P])
10. « Cent vingt secondes entre le "top" et l'impact. » ([P], calcul à partir de la transcription)

## 14. Sources (et ce qu'on y a lu)

- **BEA, rapport final f-sc000725a**, couverture (`bea.aero/fileadmin/documents/docspa/2000/f-sc000725a/htm/f-sc000725a.html`) : index et liste d'annexes. **Corps du rapport non lu (trop gros pour l'outil).**
- **BEA, synthèse « Accident du Concorde, 25 juillet 2000 »** : `bea.aero/fileadmin/documents/histoire/Histoire-Concorde-VF.pdf` : lue en entier, [P].
- **BEA, rapport intermédiaire du 10/07/2001** (f-sc000725ae2), `libraryonline.erau.edu/online-full-text/ntsb/miscellaneous-reports/MR-f-sc00725ae2.pdf` : texte complet extrait localement, [P] mais **antérieur au rapport final**.
- **BEA, rapport d'étape du 15/12/2000** (f-sc000725e), `vie-publique.fr/files/rapport/pdf/014000157.pdf` : titre et avertissement lus seulement.
- **BEA, annexe 2 : transcription du CVR** : `bea.aero/fileadmin/documents/docspa/2000/f-sc000725a/pdf/appendix2p.pdf` : lue en entier, [P].
- **Annexe 8 (note EADS)** : `concordereference.fr/wp-content/uploads/2021/02/annexe8-analyse-du-scenario-de-rupture-en-mode-2-.pdf` : lue, [P] pour les chiffres de morceaux de pneu, mais note d'un industriel reproduite dans le rapport.
- **Non lues** : annexes 3 (9,9 Mio, images), 12 (image), 4, 9, 10.
- **migflug.com/afterburner**, « Air France 4590 » : [S], utile pour 94 % de remplissage, l'avis dissident britannique, les consignes de septembre 2001, le procès. Label « local » à corriger (ce sont des UTC).
- **heritageconcorde.com** : [S] pour la transcription en anglais, 4,5 kg, vitesse 140 m/s.
- **Wikipédia FR « Vol Air France 4590 »** : [S], utilisé en recoupement seulement ; contient une heure « 14 h 44 » incohérente.
- **Presse, procès** : webmanagercenter.com, aeromorning.com, jurist.org, insurancejournal.com (résumés de l'arrêt du 29/11/2012 et du rapport final) : [S].
- **FAA** (Concorde_Accident_Report.pdf) : 403, non lu.

## 15. Pistes pour l'accroche (avec niveaux)

1. **16 h 43 min 13 s. Le contrôleur te dit : tu as des flammes derrière toi.** [P, transcription, heure locale]. Mot-choc : « flammes ».
2. **Deux minutes. De « top » à l'impact.** [P, calcul : 14:42:31 → 14:44:31].
3. **Quarante-trois centimètres de titane, un millimètre et demi d'épaisseur. Cinq minutes plus tard, un Concorde.** [P]

Les trois faits les plus forts pour l'accroche : (1) « des flammes derrière vous », 16 h 43 min 13 s [P] ; (2) 120 s entre « top » et impact [P calcul] ; (3) lamelle de 435 mm × 1,4 mm [P].

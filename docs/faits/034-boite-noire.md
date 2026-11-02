# 034 — La boîte noire : elle n'est pas noire, et elle survit à ce que l'avion ne survit pas

Niveaux : **[P]** source primaire lue · **[S]** source secondaire (fabricant, brevet, presse, ou résultat de recherche non ouvert) · **[O]** ordre de grandeur.
Requêtes : ≈ 43 (plafond de 30 dépassé : beaucoup de PDF illisibles ou en 403/404 ont obligé à rouvrir par une autre porte).

## Verdict sur l'angle

**Tient, avec un ajustement.** « Elle n'est pas noire » est un fait solide mais déjà très vu sur les réseaux (le « saviez-vous » le plus éculé de l'aviation) : à ne pas faire porter à l'accroche, seulement à la chute-bonus. Le vrai retournement, mieux sourcé et moins vu : **ce qui est blindé n'est pas « la boîte », c'est une mémoire de la taille d'une brique, ≈ 2 kg**, et **la balise qui appelle à l'aide ne tient que 30 jours** — alors qu'AF447 a été retrouvé après 23 mois. Le cas AF447 colle parfaitement au décor (A330-200, Atlantique).

## 1. La scène

Cas réel : **Air France AF447**, Airbus A330-203 F-GZCP, Rio → Paris, 31 mai / 1er juin 2009, 228 personnes (12 équipage, 216 passagers) [P BEA, point d'enquête 27/05/2011]. Les enregistrements s'arrêtent à **2 h 14 min 28 UTC** ; la descente a duré **3 min 30**, depuis ≈ 38 000 ft ; dernières valeurs : −10 912 ft/min, vitesse sol 107 kt [P BEA 27/05/2011].

Chronologie BEA [P, « chronologie.fr_04.pdf » lu] :
- 10 juin–10 juillet 2009 : moyens acoustiques pour détecter les balises : **échec** [P BEA, rapport du groupe de travail « Récupération de données de vol », p. 4].
- **2 avril 2011** : épave découverte **par 3 900 m**, ≈ 6,5 NM au nord de la dernière position connue.
- **1er mai 2011** : découverte de l'enregistreur de paramètres (FDR) ; **2 mai** : remontée du FDR ; **3 mai** : découverte et remontée du CVR ; **13 mai** : début de la lecture au BEA.
- Délai : **≈ 23 mois** entre l'accident et la remontée du FDR (calcul : 1/06/2009 → 2/05/2011).
- Lisibilité : le BEA a annoncé (communiqué du 16 mai 2011) que l'**intégralité des données du FDR** et **l'intégralité des enregistrements phoniques des deux dernières heures** avaient pu être lues [S : résultat de recherche sur le communiqué, **page non ouverte**]. État : le FDR n'a été retrouvé que sous forme de **module mémoire protégé** (le châssis seul avait été vu d'abord) [S flightglobal/MercoPress, non ouverts ; rapport d'étape n° 3 non lu : fichier > 10 Mo]. Le rapport annuel BEA 2011 dit que la lecture a demandé des techniques spéciales (deux ans en mer profonde) [S, non ouvert].
- Rapport final : 5 juillet 2012 [P, chronologie BEA]. Le texte intégral n'a pas pu être lu (PDF illisible par l'outil) : **section 1.11 du rapport final non lue**.

**Ce qu'on peut montrer** : la nuit, A330 au-dessus de l'eau ; la queue ; la mer qui se referme ; le fond à 3 900 m (sombre, sans lumière) ; le bloc orange qui repose parmi les débris ; la vue éclatée. Reste sobre : pas de passagers, pas de voix, pas de transcription (la transcription CVR est une annexe du BEA, non utilisée).

## 2. Le système qui sauve

Deux enregistreurs : **CVR** (voix et sons du poste de pilotage) et **FDR** (paramètres de vol). Ils ne sauvent personne sur le coup : ils sauvent *les suivants*. Obligatoires sur les avions de transport, installés dans « la partie la plus résistante à l'écrasement, généralement la queue » [P NTSB, ntsb.gov/news/Pages/cvr_fdr.aspx]. Règle américaine de position (FAR 25.1457) : derrière la cloison de pression arrière ou dans les 15 % arrière de la longueur pressurisée [S, résultat de recherche, texte non ouvert]. Positions exactes sur A330 : **non vérifiées** (un article de presse dit « derrière la cloison de pression arrière », non ouvert).

## 3. Le mécanisme ouvert (pièces)

1. **Module mémoire protégé (CSMU, Crash Survivable Memory Unit)** : l'unique pièce blindée. Exemple de produit réel (Etep Sentinel CSMU [S fabricant, lu]) : enceinte **titane**, **orange avec bande blanche réfléchissante**, **109 × 109 × 86 mm**, **≈ 2 kg** (≈ 2,5 kg avec balise), mémoire flash 16–128 Go.
2. **Couches** : coque dure extérieure (acier/titane) → couche isolante → matériau absorbeur de chaleur → mémoire au centre [S brevet Honeywell US 8 723 057, lu : « acier durci de forte épaisseur » ≈ **65 % du poids** du module ; le module ≈ **plus de 70 % du poids** de l'enregistreur ; isolants récents : aérogel souple (PYROGEL XTF), absorbeur à changement de phase]. Les couches exactes d'un modèle d'Airbus A330 : **non sourcées** → l'image reconstitue.
3. **Châssis et électronique** (alimentation, interfaces, carte d'acquisition) : **non protégés**. Preuve : sur AF447, seul le module mémoire du FDR a été retrouvé et lu [S] ; sur le Yemenia A310 (2009), les balises ont été retrouvées séparées des modules mémoire, remontés par ROV en 8 jours vers 1 200 m [P BEA, rapport du groupe de travail, p. 4].
4. **Balise de localisation sous-marine (ULB)** : 37,5 kHz, déclenchée par le contact de l'eau (« l'eau ferme un circuit »), pile au lithium durée de vie 6 ans, émission **30 jours** (norme historique) [P NTSB : 37,5 kHz, 30 jours, déclenchée à l'immersion ; S Etep : 90 jours en version récente, 6 ans de vie de pile]. Portée de détection ≈ **1 NM** [P BEA, rapport du groupe de travail, §3.2]. Elle est fixée *au châssis* ; son attache a été jugée à améliorer par le BEA (point 2.4 de la liste du groupe de travail).
5. **Source d'alimentation** : l'enregistreur est alimenté par le réseau de l'avion ; Etep : 5 W par le module (ED-112A) [S]. À l'impact, le courant est coupé et l'enregistrement s'arrête ; la balise a sa **propre pile**. Alimentation de l'A330 (bus utilisés) : **non sourcée**.
6. **Interface / mémoire flash** : liaison micro-SATA 5 V ; mémoire iSLC 200 000 cycles [S Etep].
7. **Marquage** : orange + matière réfléchissante (voir §10 pour la nuance de source).

**Ordre des événements à l'impact et dans l'eau** (reconstitution, pas de source qui le décrive pas à pas) : choc → coupure du courant → l'enregistrement s'arrête (AF447 : 2 h 14 min 28) → feu éventuel → immersion → l'eau déclenche la balise → la balise « ping » 37,5 kHz chaque seconde [S fearoflanding.com, pas à pas de la balise] pendant 30 jours.

**Ce qui est testé (ED-112A)** — norme **non lue** (payante, 230 € ; EASA ETSO illisible par l'outil). Valeurs lues sur la fiche d'un module certifié [S Etep] et recoupées par le NTSB [P] :

| Épreuve | Valeur | Source |
|---|---|---|
| Choc | **3 400 g, 6,5 ms** (demi-sinus) | NTSB [P] ; Etep [S] |
| Perforation | 227 kg (500 lb) tombés de 3 m sur une pointe de 6,35 mm | Etep [S] |
| Écrasement statique | 5 000 lbf (22,25 kN), 5 min par axe | Etep [S] ; TSB : 5 000 lb [S résultat] |
| Feu fort | **1 100 °C** — **60 min** (ED-112A) | Etep [S] ; **NTSB dit 30 min** [P] (version plus ancienne de la norme TSO) |
| Feu faible | 260 °C, 10 h | Etep [S] |
| Pression profonde | **20 000 ft (6 096 m)** | NTSB [P] ; Etep : 24 h [S] |
| Immersion | 30 jours en eau de mer + fluides d'avion | Etep [S] |

## 4. Ce que chacun enregistre

- **CVR** : NTSB : **2 h** pour les unités numériques actuelles [P] (30 min pour l'ancien magnétique). **25 h** : exigés par l'EASA/OACI pour les avions de plus de 27 000 kg dont le premier certificat de navigabilité date du **1er janvier 2021 ou après** [S texte réglementaire cité par recherche ; P FAA (govinfo, règle finale du 2/02/2026) le confirme : « l'OACI et l'EASA exigent déjà 25 h pour > 27 000 kg fabriqués après le 1/01/2021 »]. Côté États-Unis : Part 121, avions fabriqués à partir du 16 mai 2025 [P FAA, Federal Register 2/02/2026]. **L'AF447 de 2009 n'avait que 2 h.** Un CVR typique : 4 pistes (deux pilotes, micro d'ambiance, un observateur) [S NTSB manuel, via recherche].
- **FDR** : **25 h** en continu ; **de 18 à plus de 1 000 paramètres** ; au moins **88 paramètres** pour les avions neufs américains [P NTSB]. Nombre exact de paramètres de l'AF447 : **non lu**.

## 5. Chiffres (source, niveau)

- 3 400 g, 6,5 ms — [P NTSB] 
- 1 100 °C — durée 30 min [P NTSB] / 60 min (ED-112A) [S] → dire « 1 100 degrés » sans durée, ou « plus d'une demi-heure »
- 20 000 ft = 6 096 m — [P NTSB] (≈ 6 000 m)
- 37,5 kHz, balise 30 jours — [P NTSB] ; 90 jours — [S Etep ; P BEA recommande de passer à 90 j]. Obligation UE 90 j : date 16 juin 2018 [S texte du règlement 2015/2338 cité par recherche ; un autre document dit 1er janvier 2018 → ne pas dater]
- Portée de la balise ≈ 1 NM (≈ 1,85 km) — [P BEA]
- Épave AF447 : 3 900 m, 2 avril 2011 — [P BEA]
- FDR remonté le 2 mai 2011 (trouvé le 1er), CVR trouvé et remonté le 3 mai 2011 — [P BEA]
- Arrêt des enregistrements 2 h 14 min 28 UTC — [P BEA]
- Module ≈ 2 kg, 109 × 109 × 86 mm — [S Etep] ; acier ≈ 65 % du poids du module, module > 70 % du poids de l'enregistreur — [S brevet Honeywell]
- 228 personnes à bord — [P BEA]

## 6. Ce qui retourne une idée reçue (chutes)

1. **« La boîte noire est indestructible » → ce qui est indestructible, c'est une mémoire de 2 kg ; le reste est fragile** (le châssis, l'électronique, parfois la balise s'en détachent : Yemenia, AF447). Le mieux sourcé [P BEA + S].
2. **« Si elle survit, on la retrouve » → elle résiste à tout, sauf au temps : la balise émet 30 jours, AF447 a été retrouvé après 23 mois, à l'aveugle (sonar), balise éteinte.** Le fait « 23 mois » est [P] ; « balise éteinte » est une déduction (30 j < 23 mois) [O].
3. **« Elle est noire » → orange** (fait vrai, mais très vu ; en bonus seulement).

## 7. La question du commentaire (fermée, deux camps, un mot)

1. **« Ton prochain avion est sorti avant 2021 ou après ? Avant : sa boîte n'écoute que 2 heures. »** — lecture chez soi (immatriculation / âge de l'appareil) ; la réponse « avant » fait peur. Nuance : le seuil joue pour > 27 t et le certificat de navigabilité initial, donc ce n'est pas valable pour tous les avions (dire « les gros avions »).
2. « La balise : 30 jours… ou 90 jours ? » — pari factuel, sans lecture chez soi.
3. « Dans la queue, c'est le plus sûr… ou le pire endroit pour s'asseoir ? » — **à ne pas faire** : non sourcé (statistiques de sièges non vérifiées).

Recommandation : la 1.

## 8. L'histoire du système

Non vérifiée dans cette passe. À ne pas dire sans source. Repères sourcés : le BEA a lancé en 2009–2010 un groupe de travail international après AF447 et le Yemenia, recommandé 90 jours de balise [P BEA, rapport du groupe de travail] ; l'UE a imposé 90 jours (2015/2338) et 25 h de CVR pour les nouveaux gros avions à partir du 1er janvier 2021 [S] ; les États-Unis suivent (règle finale du 2 février 2026) [P FAA].

## 9. Pour l'annonce

**034 (dite à la fin du 033)** : « Au fond de l'Atlantique, par 3 900 mètres, l'enregistreur d'AF447 a attendu presque deux ans avant d'être remonté. » (17 mots ; fait [P BEA]).

**035 (dite à la fin du 034)** : « Une barrière de passage à niveau est faite pour casser : SNCF Réseau te dit de l'enfoncer. » (16 mots).
Source [P] : dépliant SNCF Réseau (« Passage à niveau voiture 2021 », Prévention routière), en cas d'immobilisation : « 1 – Dégagez votre véhicule en enfonçant les barrières cassables. 2 – Évacuez toutes les personnes. 3 – Utilisez le téléphone … pour alerter ». Complément [P] : la ministre des Transports, réponse à la question écrite n° 3172 (Assemblée nationale, 15e législature), évoque « l'indication du caractère cassable de la barrière de sortie ». Autres faits du même dépliant : **à 90 km/h il faut 800 m pour qu'un train s'arrête**, distance d'arrêt « 10 fois supérieure » à celle d'un véhicule. **Nuance** : c'est la barrière de *sortie* (côté où l'on doit s'échapper) ; le bras exact (brisé ou pivotant) n'est pas décrit dans ces sources.

## 10. À ne pas dire

- **« 3 600 g »** (circule) : la valeur de la source est 3 400 g.
- **« 1 100 °C pendant 30 min / 60 min »** : les deux circulent ; le NTSB dit 30, le fabricant (ED-112A) 60. Ne pas donner la durée, ou dire « plus d'une demi-heure ».
- **« Orange car on la voit mieux »** : l'exigence (« orange distinctif » + matière réfléchissante) est reprise par des règlements nationaux (Singapour CAAS, résultat de recherche, document non ouvert) ; le NTSB ne dit rien de la couleur. Dire « elle est peinte en orange vif », pas la raison officielle.
- **« Elle est au fond de la queue car l'arrière encaisse moins »** : raison donnée par une source secondaire (fearoflanding) ; le NTSB dit « partie la plus résistante, généralement la queue ». Dire cela.
- **« Elle émet 90 jours »** : vrai pour les avions récents ; l'AF447 de 2009 était à 30 jours. Dire « 30 jours à l'époque ».
- **« L'AF447 a émis un signal qu'on a suivi »** : faux ; les recherches acoustiques de juin–juillet 2009 ont échoué [P BEA]. Ne pas dire pourquoi (non sourcé).
- **« Les données étaient intactes / endommagées »** : le communiqué du 16/05/2011 dit tout lu, mais je n'ai pas ouvert l'original.
- **« Elle enregistre toute la vie de l'avion / tout le vol »** : le CVR de 2009 = 2 h ; le FDR = 25 h.
- **« Elle est dans la queue de l'A330 »** : la position exacte n'est pas prouvée ici.
- Le nom « boîte noire » : origine **non établie**, ne pas la raconter.
- Ne jamais nommer les victimes, ni citer la transcription CVR.

## 11. Ce que la voix peut dire (dix phrases)

1. Elle n'est pas noire. Elle est orange vif. *(orange : réglementation, [S])*
2. Elle est dans la queue, la partie qui encaisse le mieux.
3. Trois mille quatre cents g, pendant six millisecondes et demie.
4. Onze cents degrés. Elle les encaisse.
5. Elle tient à la pression de six mille mètres d'eau.
6. Mais ce qui est blindé, c'est une mémoire. Environ deux kilos.
7. Le 1er juin 2009, les enregistrements d'AF447 s'arrêtent à 2 h 14.
8. L'épave est retrouvée en avril 2011, par 3 900 mètres de fond.
9. Le 1er mai 2011, on repère l'enregistreur de paramètres.
10. Sa balise émet à 37 500 hertz, déclenchée par l'eau. Pendant trente jours.

## 12. Sources

- BEA, chronologie AF447 — https://bea.aero/fileadmin/uploads/tx_elyextendttnews/chronologie.fr_04.pdf — **lu** : 2/04/2011 épave par 3 900 m ; 1–3/05/2011 FDR/CVR ; 13/05 lecture ; rapport final 5/07/2012 [P].
- BEA, point d'enquête 27/05/2011 (EN) — https://bea.aero/fileadmin/documents/enquetes/vol.af.447/point.enquete.af447.27mai2011.en.pdf — **lu** : histoire du vol, 228 personnes, 2 h 14 min 28, descente de 3 min 30 [P].
- BEA, rapport du groupe de travail « Récupération de données de vol » — https://bea.aero:443/fileadmin/uploads/tx_elyextendttnews/recuperation.de.donnees.de.vol.rapport.final.du.goupe.de.travail_02.pdf — **lu** : échec de la recherche acoustique 2009, Yemenia (balises séparées des modules, ROV 8 jours vers 1 200 m), ULB 37,5 kHz portée 1 NM, 30 → 90 jours [P].
- NTSB, CVR et FDR — https://www.ntsb.gov/news/Pages/cvr_fdr.aspx — **lu** : tail, 3 400 g/6,5 ms, 1 100 °C/30 min, 20 000 ft, ULB 37,5 kHz 30 jours, CVR 2 h, FDR 25 h, 88 paramètres [P].
- FAA, règle finale CVR 25 h — https://www.govinfo.gov/content/pkg/FR-2026-02-02/html/2026-02110.htm — **lu** (100 000 premiers caractères) : 25 h, dates, OACI/EASA depuis 01/01/2021 [P].
- Etep, Sentinel CSMU — https://www.etep.com/products/sentinel-csmu — **lu** : ED-112A complet, dimensions, titane, orange, ULB [S fabricant].
- Brevet Honeywell US 8 723 057 — https://patents.google.com/patent/US8723057B2/en — **lu** : acier ≈ 65 %, module > 70 % du poids, aérogel [S].
- SNCF Réseau / Prévention routière, dépliant PN voiture 2021 — https://www.preventionroutiere.asso.fr/wp-content/uploads/2020/09/Depliant-PN-Voiture-2021.pdf — **lu (texte extrait)** : barrières cassables, 800 m [P].
- Assemblée nationale, question n° 3172 — https://questions.assemblee-nationale.fr/dyn/15/questions/QANR5L15QE3172.pdf — **lu** : « caractère cassable de la barrière de sortie » [P].
- fearoflanding.com, balises MH370 — https://fearoflanding.com/accidents/mh370-search-beacons-and-pingers-and-locators/ — lu : ping 1 s, orange, queue [S].
- **Non lus** : norme ED-112A, ETSO-C123/C124 (payantes ou PDF illisibles), TSB Canada (403), dépliants DREAL Normandie et Pays de la Loire (403), rapport final BEA AF447 et rapport d'étape n° 3 (> 10 Mo ou illisibles), communiqué BEA du 16/05/2011 (cité via recherche), texte ICAO Annex 6, règlement UE 2015/2338 (cité via recherche).

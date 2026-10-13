# 024 — Bloc opératoire : le schéma IT médical

Recherche du 2026-10-13 · budget : 29 requêtes sur 30

Légende des niveaux : **A** source primaire lue · **B** secondaire sérieuse · **C** faible. « résumé de recherche, non lu » = vu seulement dans le résumé du moteur.

**Limite majeure, à lire d'abord.** Le texte de la NF C 15-211 (AFNOR, payant) n'a pas été lu, ni la CEI 60364-7-710. Les valeurs réglementaires viennent du **Guide d'application n° 7 de l'IET (5e éd.) sur la BS 7671**, qui reprend point par point l'article 710 du HD 60364-7-710 (numéros d'articles 710.xxx cités dans le texte), et de documents de fabricants. La NF C 15-211 transpose la même base, mais **chaque chiffre est à confirmer dans le texte français** avant de le dire comme « la norme française ». Aucune source française sur l'histoire n'a été trouvée.

Pièces lues en entier (PDF extraits localement) : IET GN7 ch. 9, IET Wiring Matters n° 77 (09/2019), Bender 107TD47, Bender SEB30/60, IET « Group 2 … designing IT systems » (2015), Legrand cm222600.

## 1. Les locaux : groupes 0, 1, 2

- **Groupe 0** : « no applied parts are intended to be used and where discontinuity (failure) of the supply cannot cause danger to life ». Niveau B (GN7 § 9.3.5, lu ; transposition britannique de 710). https://electrical.theiet.org/media/1026/gn7-5th-edition-ch09_reprintv2.pdf
- **Groupe 1** : la coupure d'alimentation ne menace pas le patient, et des parties appliquées sont utilisées « externally » ou « invasively to any part of the body, except where Group 2 applies ». B (même source, § 9.3.6).
- **Groupe 2** : parties appliquées utilisées **et** « discontinuity (failure) of the supply can cause danger to life », pour : (a) les actes intracardiaques, (b) les traitements vitaux et les opérations chirurgicales. B (§ 9.3.7).
- Une **partie appliquée** est la partie de l'appareil médical qui « comes into physical contact with the patient » pour qu'il fonctionne. B (§ 9.3.4).
- Le tableau des locaux (GN7 table 9.1) classe par exemple IRM, hémodialyse, néonatologie, etc. ; **la ligne « salle d'opération » n'a pas été extraite lisiblement** : à relire. Un même local peut monter de groupe selon l'usage.
- Les définitions françaises (résumé de recherche, non lu) vont dans le même sens : groupe 2 = « cardiologie intracardiaque, bloc opératoire, traitements vitaux ». https://www.boutique.afnor.org/en-gb/standard/nf-c15211/lowvoltage-electrical-installations-installations-in-medically-used-rooms/fa144685/27745 (fiche AFNOR : NF C 15-211, édition d'août 2006 en vigueur, norme d'application obligatoire, feuille d'interprétation F1 de 2010 ; résumé de recherche, non lu).

**Ce qui est en IT médical** (GN7 710.411.6.3.1, B) : en groupe 2, un schéma IT doit alimenter « final circuits supplying medical electrical equipment and systems intended for life support, surgical applications and other electrical equipment located within the "patient environment" ». Au moins un système IT par groupe de salles de même fonction.
**Ce qui n'y est pas obligatoirement** (GN7 note vii) : « not all socket-outlets in a theatre environment need to be connected to the IT system » (rasoirs, musique, dossiers informatisés…), qui peuvent être sur onduleur ou hors IT.

## 2. Le transformateur d'isolement médical

- Norme : CEI / EN **61558-2-15** (transformateurs d'isolement pour locaux médicaux). B.
- **Puissance** : au moins un transformateur monophasé par salle ou groupe de salles, « not less than 0.5 kVA and not more than 10 kVA » (GN7 710.512.1.1, lu ; Wiring Matters 77 : « rating (0.5 kVA to 10 kVA) »). B.
  - ⚠ Un ouvrage allemand cité par la recherche donne 3,15 à 8 kVA (résumé de recherche, non lu, C) : contradiction apparente ; la plage normative de la CEI est 0,5–10 kVA. Dire « de quelques kVA ».
- **Tension au secondaire** : 230 V monophasé en pratique (Bender 107TD47 : tension de réseau surveillée 230 V, 50–60 Hz ; versions 127 V existent). B (fabricant).
- **Fuite** : courant de fuite du secondaire vers la terre et du boîtier, à vide, « shall not exceed 0.5 mA ». B (GN7). Ce 0,5 mA est l'équivalent du courant de fuite patient permis aux appareils B/BF en premier défaut (Wiring Matters 77, lu, B).
- Pas de condensateur dans le transformateur ; pas de mise en parallèle de deux transformateurs dans une même pièce ; un transformateur triphasé séparé pour les charges triphasées ; appel de courant à l'enclenchement ≤ 12 fois la crête du courant primaire assigné. B (GN7).
- Installé à proximité du local, même étage et même compartiment coupe-feu en principe (Wiring Matters 77, via résumé de page : « resumé de page, B »). https://professional-electrician.com/?p=50786
- **Ce qu'on surveille dessus** : surcharge (transformateur de courant) et **température** (sondes CTP ou PT100 dans l'enroulement). Bender 107TD47 : « the IT system transformer is monitored for overload and overtemperature » ; courant de charge réglable 5…50 A ; sondes CTP (max 6 en série). Legrand 0 435 01 : surcharge via TC 5 A et surchauffe via sonde PT100. A pour le Bender (fiche lue), B pour Legrand. https://www.bender.de/fileadmin/content/Products/d/e/107TD47_D00091_D_XXEN.pdf · https://assets.legrand.com/pim/DOCUMENT/cm222600_0404.pdf
- Il y a un **coût caché** : le transformateur chauffe, un équipement mobile lourd (imagerie) peut le surcharger (GN7 § 9.8.3 note iii : « have been known to overload the IT transformer »). B.

## 3. Le CPI médical (« IMD » / MED-IMD)

Exigences additionnelles du HD 60364-7-710 pour le contrôleur, telles que reprises dans GN7 710.411.6.3.1 (lu, B) :
- impédance interne en alternatif **≥ 100 kΩ** ; résistance interne **≥ 250 kΩ** ;
- tension de mesure **≤ 25 V continu** ;
- courant injecté, même en défaut, **≤ 1 mA crête** ;
- indication au plus tard quand l'isolement tombe à **50 kΩ** ; si le seuil est réglable, le réglage le plus bas possible doit rester **≥ 50 kΩ** ; un dispositif d'essai est exigé ;
- temps de réponse et de retour d'alarme **≤ 5 s**.
- Conforme à CEI 61557-8 annexes A et B (Bender, Legrand). A/B.

Produits réels, pour l'ordre de grandeur :
- Bender 107TD47 : seuil réglable **50…500 kΩ**, bouton test, relais d'alarme commun, voyant ALARM, bus BMS vers des **répétiteurs d'alarme installés dans le local médical** (« so that the technical or medical staff is informed immediately »). Surveille aussi la coupure des liaisons de mesure. A (lu).
- Legrand 0 435 01 : seuil 50–500 kΩ ; 1 à 5 **reports d'état** avec « signal sonore et visuel dans le local concerné », signal sonore **arrêtable**, fonction test ; pas de mémorisation des défauts. B (fiche produit lue). https://www.legrand.fr/pro/catalogue/controleur-permanent-disolement-pour-circuit-it-medical-230v-de-50kohms-a-500kohms
- Variante **5–50 kΩ** pour les circuits dédiés aux **scialytiques** (lampes opératoires), surveillés par un CPI à part dont l'alarme est reprise par le CPI principal (Bender, Legrand). A/B.
- **Recherche du défaut** : un système de localisation (CEI 61557-9) est exigé quand l'IT dessert plus d'une salle (résumé de page, professional-electrician.com, B) ; un marché hospitalier français demande de « localiser le départ concerné » et de connaître la valeur d'isolement (CCTP du CH de Béziers : résumé de recherche, non lu, page en 404 à la lecture).
- Calcul à poser (arithmétique, pas une source) : 230 V ÷ 50 kΩ ≈ **4,6 mA** si un pôle touchait la terre à travers exactement 50 kΩ. L'équivalent américain (LIM) alarme à **5 mA** de courant de danger total (IAEI 2007, lu, B). https://iaeimagazine.org/magazine/2007/july2007/isolated-power-systems-in-health-care-facilities

## 4. Pourquoi, au premier défaut, il ne passe presque rien — et le deuxième défaut

- « Earth fault currents in a medical IT system depend only on the capacitive coupling between the line conductors and earth. As these capacitances are quite low in value, the resultant capacitive coupling current is quite low, i.e. not dangerous. » Un défaut unique « will not cause a trip, it just creates a reference to earth (as in a TN system) so continuity of supply is present ». Wiring Matters 77 (IET, lu). Niveau B. https://electrical.theiet.org/media/2157/wiring-matters-issue-77-september-2019.pdf
- Bornes : le **courant de fuite total** du système IT médical « should not exceed 10 mA » (transformateur 0,5 mA + boîtiers + capacités de tous les circuits) ; circuits terminaux recommandés ≤ **25 m** depuis le tableau IT (résumé de page, B).
- Au premier défaut les prises IT sont « effectively TN socket-outlets without RCD protection » (même résumé) : **le système est devenu un TN temporaire** : c'est pourquoi l'alarme est exigée.
- **Deuxième défaut** (sur l'autre pôle, autre circuit) : il faut alors un déclenchement par les protections de surintensité, dans les conditions d'une coupure automatique ; deux circuits sont en général touchés. B (professional-electrician, résumé de page). IET « Group 2 … designing IT systems » (2015, lu) calcule cette boucle de défaut (impédance du transformateur 0,158 Ω pour 10 kVA, disjoncteur 20 A type B, tension de contact limitée à 25 V) : un deuxième défaut est donc un court-circuit franc, pas un événement « sans danger ». B. https://electrical.theiet.org/media/1431/group-2-medical-locations-designing-it-systems.pdf
- Un utilisateur du forum IET : un premier défaut « does not directly lead to a shock risk in an IT system » ; le risque de choc apparaît au second (forum, C). https://engx.theiet.org/f/wiring-and-regulations/24493/it-and-medical-locations/104503
- **En IT médical, les masses sont reliées à la terre** (conducteurs de protection, liaison équipotentielle) : c'est le **neutre du secondaire** qui n'est pas relié à la terre.

## 5. Les deux raisons d'être : continuité et microchoc

**Continuité (la raison première).**
- « In the event of a first fault to earth, a total loss of supply in Group 2 locations shall be prevented » (710.512.1.2, GN7, lu, B).
- « The prolonged loss of the mains supply to life-supporting ME equipment may put the patient's life at risk » (GN7 ch. 9, B).
- Un praticien du forum IET : les prises IT médicales servent d'abord à réduire le risque de **coupure** (C).

**Risque de choc accru** : peau coupée, patient anesthésié, liquides conducteurs ; impédance du corps prise à **1 kΩ** dans la CEI 60601-1 (contre 2 kΩ), d'où une tension de contact limite de **25 V** alternatif au lieu de 50 V dans les groupes 1 et 2. Wiring Matters 77 (lu, B).

**Microchoc.**
- « Currents of the order of 10 µA have a probability of 0.2 % for causing ventricular fibrillation or pump failure when applied through a small area of the heart. At 50 µA, the probability … on the order of 1 % (BS EN 60601-1). » Wiring Matters 77 et GN7 (lus, B).
- CEI 60601-1, partie appliquée de type CF (cardiaque flottante) : fuite patient **10 µA** en normal, **50 µA** en premier défaut (résumé de recherche, non lu, C/B). B et BF : valeurs bien plus hautes (100 µA en normal dans un tableau Fluke : résumé de recherche, non lu).
- Origine : essais sur le chien (Geddes, milieu du XXe siècle) ; « a current as low as 10 μA » directement dans le cœur pourrait provoquer une fibrillation chez l'humain. Wikipedia « Microshock » (lu, C/B). https://en.wikipedia.org/wiki/Microshock
- Comparaison à l'arithmétique : le différentiel domestique 30 mA = 30 000 µA, soit **3 000 fois** 10 µA.
- Le macrochoc : « currents of the order of 10 mA » peuvent paralyser, et la fibrillation peut survenir « just exceeding 20 mA » (CEI/TR 60479-1 citée par Wiring Matters 77, B).
- ⚠ **Nuance importante.** Le microchoc est surtout traité par les **appareils** (fuite patient des parties appliquées, CEI 60601-1), pas par l'IT. Une revue (APSF, 1986) soutient que les systèmes à alimentation isolée « were never effective in preventing a dangerous microshock », que les normes s'en sont éloignées pour cet usage et que leur seuil de 5 mA était bien trop haut pour le microchoc (résumé de recherche, non lu, B). Article de 1970 (Albisser et Jackman, résumé lu, B) : l'alimentation isolée n'est pas la réponse, il faut isoler **le patient** de la terre. https://proceedings.cmbes.ca/index.php/proceedings/article/view/786
- Wikipedia (C/B, lu) : « There has never been a documented case of microshock » (revue du début des années 2000 : aucun cas rapporté en 30 ans). À ne pas contredire à l'antenne.

## 6. La liaison équipotentielle supplémentaire

- But : « equalizing potential differences » entre conducteurs de protection, masses étrangères, grilles de sol conductrices, écrans, écran métallique du transformateur — dans le « patient environment ». GN7 710.415.2.1 (lu, B).
- **Résistance** entre la borne de terre d'une prise ou d'un équipement fixe (ou toute masse étrangère) et la barre d'équipotentialité : **≤ 0,2 Ω en groupe 2** (GN7 710.415.2.2, lu, B) ; **≤ 0,7 Ω en groupe 1** (Bender SEB30/60, lu, A/B). En pratique ≈ 0,1 Ω attendu (GN7 note c). https://www.bender.de/fileadmin/content/Products/d/e/SEB30-SEB60_D00542_D_XXEN.pdf
- Points de raccordement : au moins **quatre** par local en groupe 2, et au moins 25 % du nombre de prises IT par poste patient. B.
- Contrôle annuel recommandé (GN7 9.20.2, B).

## 7. Les alimentations de sécurité (GN7 9.18.5 / 9.16.1, lus, B)

- **Reprise ≤ 0,5 s** pour : « luminaires of operating theatre tables », appareils médicaux avec source lumineuse essentielle (endoscopes et leurs moniteurs), et appareils de **maintien en vie**. La source de sécurité doit tenir **≥ 3 h** (réductible à 1 h pour les deux derniers si une source ≤ 15 s existe). Déclenchement : défaut de tension sur un conducteur au tableau.
- **Reprise ≤ 15 s** vers une source tenant **≥ 24 h** : éclairage de sécurité, **90 % de l'éclairage des salles de groupe 2** sur la source de sécurité, ascenseurs pompiers, désenfumage, gaz médicaux et évacuation des gaz anesthésiques, détection incendie, extinction, matériel médical « of vital importance » en groupe 2.
- **> 15 s** (manuel ou automatique, 24 h) : stérilisation, climatisation, froid, cuisines, chargeurs.
- Déclenchement du ≤ 15 s : tension en baisse de plus de 10 % pendant plus de 3 s.
- **Sources** : groupe électrogène et batteries intégrées aux appareils traditionnellement ; l'onduleur statique est « used frequently » mais le HD 60364-7-710 (2012) ne le cite pas (GN7 note b, B).
- Classes de coupure : très courte 0,15 s, courte 0,5 s, moyenne 15 s, longue > 15 s (GN7, B).
- Valeurs françaises (0,5 s / 15 s) : concordance seulement dans un résumé de recherche (fournisseur, C).

## 8. Histoire

- Années **1920-1930** : accidents très médiatisés (explosions et incendies de blocs avec cyclopropane et éther). **1939** : la NFPA lance des recommandations ; **1944** : « Safe Practice in Hospital Operating Rooms » ; **1949** : NFPA 56 recommande l'alimentation non reliée à la terre dans les salles à gaz inflammables ; **1959** : reprise dans le NEC. Wiring Matters 77 (lu, B).
- Pourquoi isoler : « the likelihood of electrical arcing to ground (representing a potential ignition source) was reduced » ; sols conducteurs, prises antidéflagrantes (APSF, résumé de recherche, non lu, B).
- NEC : article 510 « anesthésiques inflammables » début des années 1950 ; article 517 en 1965, renommé « Health Care Facilities » en 1971 ; alimentation isolée **facultative** pour les soins critiques à partir de 1996 (IAEI 2007, lu, B).
- Mars **1971** : article de Ralph Nader, ~1 200 électrocutions par an dans les hôpitaux, chiffre contesté (résumé de recherche, non lu, C/B). Années 1970 : vaste effort contre le « microshock ».
- NFPA 99-1984 : l'alimentation isolée n'est plus exigée dans les locaux d'anesthésie non inflammable (APSF 1986, résumé de recherche, non lu, B). Aux États-Unis elle reste exigée dans les locaux humides où une coupure par différentiel est inacceptable (IAEI 2007, lu).
- Côté CEI : rédaction du 710 commencée en **1988**, premier **CEI 60364-7-710 publié en 2002**. Wiring Matters 77 (lu, B).
- **France** : NF C 15-211, édition d'août 2006 en vigueur. Aucune date de première apparition de l'IT médical en France trouvée.

## 9. Différentiels 30 mA : où, où pas

- **Groupe 1** (TN) : différentiels ≤ 30 mA obligatoires sur les circuits terminaux jusqu'à 63 A (710.411.4, GN7, lu, B).
- **Groupe 2**, hors circuits IT : différentiels 30 mA (415.1.1) exigés pour les mouvements des **tables d'opération fixes**, les **appareils de radiologie** et le **gros matériel > 5 kVA** ; liste « not exhaustive ». B.
- **Sur le circuit IT lui-même** : pas de différentiel, c'est le CPI qui surveille. Des différentiels peuvent donc exister dans un bloc, mais **pas sur les prises IT du patient**.
- Prises IT médicales (GN7 710.411.6.3.1) « not required » partout dans la salle : voir § 1. Le point « interdit » (par exemple un différentiel sur le circuit IT) n'a pas été formulé par une source lue : à ne pas dire.

## 10. Phrases fausses qu'un électricien relèverait

- « En IT on ne peut pas s'électrocuter » : faux. Premier défaut = TN temporaire ; second défaut = vrai court-circuit à couper ; les masses restent reliées à la terre (voir § 4).
- « Il n'y a pas de terre au bloc » : faux. Masses et conducteurs de protection sont à la terre ; la **liaison équipotentielle** ≤ 0,2 Ω est même renforcée. C'est le neutre du secondaire qui est « flottant ».
- « Rien ne coupe jamais » : faux. Le second défaut, la surcharge et l'ensemble des protections existent ; seuls le **premier** défaut ne coupe pas.
- « L'IT protège du microchoc » : discutable (§ 5) ; c'est d'abord l'appareil CF (10 µA) qui protège.
- « Le CPI coupe » : faux, il **alerte** (voyant et signal sonore, arrêtable).
- « Tout le bloc est en IT » : faux (§ 1).
- « Le courant de fuite est nul » : faux, il est limité (transformateur ≤ 0,5 mA, total ≤ 10 mA).

## Vocabulaire exact

| Dire | Ne pas dire |
| --- | --- |
| schéma IT médical | « réseau isolé » seul, « IT hospitalier » |
| transformateur d'isolement (médical) | « transfo de sécurité » |
| contrôleur permanent d'isolement (CPI) | « disjoncteur d'isolement », « détecteur de fuite » |
| défaut d'isolement, premier défaut / deuxième défaut | « court-circuit » pour le premier défaut |
| alarme (voyant + signal sonore) | « il sonne comme un détecteur de fumée » |
| masses reliées à la terre ; neutre non relié à la terre | « pas de terre » |
| liaison équipotentielle supplémentaire (≤ 0,2 Ω en groupe 2) | « mise à la terre renforcée » |
| différentiel 30 mA (DDR) | « disjoncteur différentiel » si on parle du seul module de coupure |
| locaux à usage médical, groupe 2 | « zone stérile » |
| alimentation de sécurité (≤ 0,5 s ; ≤ 15 s) | « secours » sans précision |
| partie appliquée, courant de fuite patient | « courant de microchoc » (terme sans définition normative) |

## À dire tel quel

- Au bloc opératoire, un premier défaut d'isolement ne coupe pas le courant. (B : GN7 710.512.1.2)
- Le transformateur d'isolement n'est relié à aucune terre côté secondaire : le courant de défaut ne dépend que des capacités de fuite. (B : Wiring Matters 77)
- Le contrôleur permanent d'isolement alarme au plus tard à 50 kΩ, avec des répétiteurs d'alarme dans la salle. (B/A : GN7, Bender)
- Un second défaut, lui, se traite comme un court-circuit : les protections coupent. (B)
- Dans un bloc, la liaison équipotentielle doit rester sous 0,2 ohm. (B)
- Les appareils de maintien en vie et les scialytiques doivent être repris en 0,5 seconde au plus, sur une source tenant au moins 3 heures. (B)
- Le courant de fuite du transformateur ne dépasse pas 0,5 milliampère. (B)
- Un courant d'environ 10 microampères directement au cœur : de l'ordre de 0,2 % de risque de fibrillation. (B, via CEI 60601-1)

## Ordres de grandeur (à dire avec « environ »)

- Transformateur : quelques kVA (0,5 à 10 kVA selon la norme), 230 V.
- Première défaut : courant de l'ordre du milliampère au plus, fixé par les capacités de fuite ; limite de 10 mA pour le total du système.
- À l'alarme (50 kΩ sous 230 V) : environ 4,6 mA (calcul).
- Rapport 30 mA / 10 µA : trois mille fois.
- Reprise : une demi-seconde pour la vie et la lumière opératoire ; quinze secondes pour le reste de la sécurité.
- Circuit terminal recommandé : 25 m.

## À ne pas dire

- « Il n'y a pas de terre ». « On ne peut pas s'électrocuter en IT ». « Rien ne coupe jamais ».
- « L'IT protège du microchoc » (contesté ; la protection est dans l'appareil).
- « Le microchoc a tué des patients » (« never been a documented case », Wikipedia ; chiffre de Nader contesté).
- « Ça date de [année] en France » : aucune date française trouvée.
- « Tout le bloc / toutes les prises sont en IT ».
- Une plage de puissance de transformateur à l'unité près (3,15–8 kVA contre 0,5–10 kVA).
- « La NF C 15-211 dit … » pour tout chiffre ci-dessus tant que le texte n'est pas lu.
- « Le CPI coupe l'alimentation ».
- Le seuil d'alarme américain (5 mA) comme valeur française.
- Le fait que le HD 60364-7-710 « interdit » un différentiel sur l'IT : non formulé.

## Trois faits-accroche

1. Chez toi, un défaut fait sauter le courant. Au bloc, au premier défaut : rien ne saute, une alarme sonne, et le chirurgien continue. (B)
2. Le différentiel de ta maison déclenche à 30 milliampères. Un courant de **10 microampères** — trois mille fois moins — peut faire fibriller un cœur s'il est injecté directement dedans. (B)
3. Au bloc, la lampe opératoire doit être reprise en **une demi-seconde** après une coupure du réseau. (B)

## Non trouvé

- Le texte de la **NF C 15-211** et de la **CEI 60364-7-710** (payants) : tous les seuils français sont à confirmer.
- Définitions françaises des groupes en toutes lettres, ligne « salle d'opération » du tableau 9.1.
- Histoire française de l'IT médical (date d'introduction, première norme).
- Détail de la tension et du courant de mesure d'un CPI particulier (Legrand : non indiqués ; Bender : tableau mal extrait).
- Pages bloquées : APSF (403), Socomec (403), CCTP de Béziers (404), classification de Lausanne (erreur réseau).
- Articles originaux de Nader (1971), Starmer et Whalen.
- Valeur typique du courant du premier défaut (aucune source chiffrée).
- Une source disant qu'un différentiel sur le circuit IT est « interdit ».

## URL lues

- https://electrical.theiet.org/media/1026/gn7-5th-edition-ch09_reprintv2.pdf (lue, PDF extrait)
- https://electrical.theiet.org/media/2157/wiring-matters-issue-77-september-2019.pdf (lue)
- https://electrical.theiet.org/media/1431/group-2-medical-locations-designing-it-systems.pdf (lue)
- https://www.bender.de/fileadmin/content/Products/d/e/107TD47_D00091_D_XXEN.pdf (lue)
- https://www.bender.de/fileadmin/content/Products/d/e/SEB30-SEB60_D00542_D_XXEN.pdf (lue)
- https://assets.legrand.com/pim/DOCUMENT/cm222600_0404.pdf (lue)
- https://www.legrand.fr/pro/catalogue/controleur-permanent-disolement-pour-circuit-it-medical-230v-de-50kohms-a-500kohms (lue)
- https://iaeimagazine.org/magazine/2007/july2007/isolated-power-systems-in-health-care-facilities (lue)
- https://en.wikipedia.org/wiki/Microshock (lue)
- https://professional-electrician.com/?p=50786 (lue, résumé de page)
- https://engx.theiet.org/f/wiring-and-regulations/24493/it-and-medical-locations/104503 (lue, forum)
- https://proceedings.cmbes.ca/index.php/proceedings/article/view/786 (résumé lu)
- Non lues (résumé de recherche) : AFNOR NF C 15-211 ; APSF « Isolated Power Systems in the OR » ; Fluke / résumés CEI 60601-1.

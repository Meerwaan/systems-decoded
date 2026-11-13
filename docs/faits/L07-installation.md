# L07 — Installation : de l'usine à la prise de ton salon (2e passe de faits)

Complète `docs/faits/L07-fibre-optique.md` (fabrication du fil). Niveaux : **[P]** source primaire lue · **[S]** secondaire (ou primaire vue seulement par un extrait de recherche : dit à chaque fois) · **[O]** ordre de grandeur seulement. 44 requêtes web utilisées sur 45.

Limite honnête : **tous les PDF** (ICPC, Arcep RA2024, Assemblée nationale, UIT G.984.2 texte intégral, guide ISCPC 404, Corning) n'ont **pas pu être lus** par l'outil (contenu binaire ou 404). Ce qui vient d'eux est marqué « extrait de recherche » = [S]. Le site marine.orange.com est bloqué (cookies). Rien n'est déduit des pages non ouvertes.

---

## A. La chaîne de l'installation en 8 étapes (une ligne chacune : ce qu'on voit · le chiffre · la menace)

1. **Le navire pose le câble au large** : un câblier déroule un câble de ≈ 25 mm de diamètre, posé simplement sur le fond. · Pose à ≈ 8 nœuds max [S] ; câble ≈ 1,4 t/km en grand fond [S]. · Menace : un chalut ou une ancre le coupe (≈ 150 à 200 pannes par an dans le monde, [S] ICPC).
2. **La charrue l'enfouit près des côtes** : un soc creux soulève un coin de sédiment, le câble glisse dessous. · Enfoui à ≈ 0,8 m (fr.wikipedia) jusqu'à 1-3,5 m selon l'ICPC, entre 20 et 1 500 m d'eau [S]. · Menace : la zone où pêche et ancres frappent (c'est elle qu'on protège).
3. **Il sort de l'eau, atterrit, rejoint le NRO** : forage dirigé sous la plage, chambre d'atterrissement, puis le câble file vers un bâtiment d'opérateur. · Medusa : segment Marseille–Bizerte 1 050 km, atterri en octobre 2025, Marseille héberge 17 câbles [S TelecomTV]. · Menace : herbiers de posidonie, parc des Calanques (d'où le forage dirigé).
4. **Les fourreaux et le soufflage** : le câble de rue n'est pas creusé neuf, il passe dans les conduites du téléphone, ou en aérien sur poteaux ; le microcâble est soufflé à l'air. · Soufflage : 40-60 m/min, 500-600 m par tronçon d'accès, jusqu'à 3 000 m en record [S fabricant Nexans/Aginode]. · Menace : fourreau bouché, absent ou écrasé : on ne passe pas (très courant en pratique, aucune statistique trouvée).
5. **La soudure** : dénuder, cliver (rayer et casser net), la soudeuse aligne les cœurs, un arc électrique fond les deux verres ensemble. · Perte d'une bonne soudure ≈ 0,02 à 0,05 dB (constructeurs), soit 0,5 à 1 % de lumière ; une soudure « acceptable » < 0,1 dB ≈ 2 % [S Corning, extrait]. · Menace : un clivage de travers, une poussière, une bulle.
6. **Le partage (GPON)** : au point de mutualisation (l'armoire de rue), un coupleur optique passif, sans courant, divise la lumière d'une fibre entre jusqu'à 32 ou 64 abonnés. · 1:32 = ≈ 15 dB de perte théorique, soit 1/32 de la lumière par abonné [P FOA] ; budget total 13 à 28 dB [P FOA]. · Menace : une perte de plus que le budget et la prise ne reçoit plus rien.
7. **Chez toi : PBO, PTO, connecteur vert, ONT** : un câble d'immeuble 6 à 12 logements, un câble de raccordement jusqu'à la prise, le connecteur SC/APC vert, la box. · APC poli à 8° [S] ; PBO = 6 à 12 logements [P Arcep]. · Menace : une poussière sur un cœur de 9 µm ; et ne jamais regarder dans une fibre (infrarouge invisible).
8. **Le contrôle** : réflectomètre (OTDR) pour voir chaque soudure et chaque connecteur le long du câble, photomètre pour lire la lumière qui arrive à la prise. · 1 impulsion, retour de lumière rétrodiffusée, distance = temps ÷ 2 [P FOA] ; plage de travail 13 à 28 dB [P FOA]. · Menace : le raccordement raté : Arcep mesure un taux d'échec au raccordement de 5,88 % en septembre 2025 [S, extrait de recherche].

## B. Les six faits les plus forts

1. **Un coupleur sans électricité divise la lumière** : 1 fibre → 32 foyers, perte idéale 15 dB (= 10·log10(1/32)), typique 16 dB, soit environ 3 % de la lumière par foyer. [P] foa.org (Optical_splitter.html, lu).
2. **Le budget d'un GPON : ≈ 28 dB** de perte autorisée, soit 1/630 de la lumière qui arrive au bout et qui suffit encore. [P] foa.org (FTTH-PON.html et FTTH-test.html, lus : « ~13 to 28 dB » avec un partage de 32). 28 dB = 10^-2,8 ≈ 0,16 % (calcul).
3. **Une même fibre porte descendante et montante, deux couleurs d'infrarouge** : 1 490 nm vers toi, 1 310 nm vers le réseau. [P] foa.org (FTTH-PON.html, lu).
4. **Un câble sous-marin qui se coupe se répare en le remontant** : un câblier lance un marqueur près de la panne, accroche le câble au grappin, remonte, le reconnecte, et dépose le surplus en U au fond. [S] Wikipédia EN « Submarine communications cable » (lu) ; ≈ 150-200 pannes par an [S] ICPC, extrait de recherche.
5. **Le connecteur vert est poli en biais** : à 8°, la lumière qui se réfléchit part dans la gaine au lieu de remonter vers le laser. [S] Wikipédia EN « Optical fiber connector » (lu) pour 8° et le vert ; l'explication du reflet : extrait de recherche [S].
6. **Une soudure réussie perd de l'ordre de 0,02 à 0,05 dB, soit ≈ 0,5 à 1 % de lumière** ; la soudeuse l'estime elle-même, mais seul un OTDR le vérifie vraiment. [S] constructeurs (extraits de recherche : 0,02 dB, 0,03 dB) ; [P] FOA fusion (lu) pour « seul l'OTDR le teste ».

Autres faits forts pour l'accroche : le taux de pannes des réseaux FttH les plus dégradés est passé de 0,51 % (janv. 2024) à 0,30 % (oct. 2024) [P Arcep, communiqué du 26/03/2025, lu] ; 28,1 millions d'abonnements fibre fin juin 2026, 85 % des abonnements fixes [P Arcep, lu].

---

## 1. La pose d'un câble sous-marin

### Ce qu'on voit
Un navire câblier, un câble de ≈ 25 mm de diamètre (« une pelouse d'arrosage » : l'image est courante, la page Wikipédia ne la donne pas ; ne dire que « gros comme un tuyau d'arrosage » comme image, pas comme mesure). Au large : câble posé, sans enfouissement. Près de la côte : une charrue tirée derrière le navire ou à la remorque, qui creuse et referme. À l'arrivée : un forage dirigé sous la plage, une chambre d'atterrissement, la station.

### Faits sourcés
- **Diamètre et masse** : « environ 25 mm » ; ≈ 1,4 t/km en grand fond, plus lourd près des côtes. [S] en.wikipedia.org/wiki/Submarine_communications_cable (lu). Autre valeur dans fr.wikipedia : « environ 69 mm, ≈ 10 kg/m » : **contradictoire, ne pas chiffrer le diamètre en direct**, dire « de l'épaisseur d'un tuyau ».
- **Couches** (de l'extérieur vers la fibre) : polyéthylène, ruban Mylar, fils d'acier torsadés, barrière d'eau en aluminium, polycarbonate, tube de cuivre ou d'aluminium (alimente les répéteurs), gel de pétrole, fibres. [S] en.wikipedia (lu). C'est la matière pour la vue éclatée.
- **Vitesse de pose** : jusqu'à 8 nœuds (≈ 15 km/h) selon la brochure d'un navire d'installation ; « environ 8 nœuds » aussi par un explicatif. [S] extrait de recherche (non ouvert). Navire en transit : 10-15 nœuds. **Ne pas attribuer ces chiffres au Sophie Germain** : c'est un navire de **réparation**, ses caractéristiques de pose n'ont pas été trouvées.
- **Capacité** : un navire d'installation donné : 9 600 t de câble en trois cuves (brochure, extrait de recherche). Pas de chiffre en km donnable de façon générale.
- **La charrue** : « lève un coin de sédiment juste assez pour insérer le câble » ; câble armé enfoui à ≈ 0,2 km/h [S] ICPC (extrait de recherche, non ouvert). Profondeur d'enfouissement 1 à 3,5 m, jusqu'à 10 m [S] ICPC (extrait). fr.wikipedia : « environ 80 cm sous le fond », ensouillage « entre 20 et 1 500 m d'eau » [S] (lu). Un dossier d'autorisation (AMITIE, Le Porge) : forage dirigé sous la plage « à plusieurs mètres », puis ensouillage « jusqu'à 2 m » [S] (extrait de recherche, non ouvert). Un compte rendu parlementaire : « tranchée d'environ deux mètres » [S] (extrait, non ouvert). **Pour la voix : « un à deux mètres sous le fond » [O].**
- **Jusqu'à quelle profondeur** : ICPC : l'enfouissement va du rivage jusqu'à ≈ 2 000 m, limite du chalutage ; près de la côte jusqu'à ≈ 1 000 m les activités humaines sont le risque principal, au-delà ce sont les risques naturels [S] ICPC (extrait). Wikipédia EN : « moins de 2 000 m ». **Pour la voix : « là où les chaluts raclent le fond »**, sans chiffre précis.
- **Atterrissements en France** : « vingt atterrissements en Bretagne et Normandie » (réponse à une question parlementaire, extrait) [S non ouverte] ; Marseille héberge 17 câbles [S TelecomTV, lu]. **Ne pas additionner.**
- **La station d'atterrissement** : le câble arrive dans une chambre sous la plage, puis rejoint un bâtiment qui alimente les répéteurs en courant continu (3 000 à 15 000 V, jusqu'à 1 100 mA) [S] en.wikipedia (lu) ; répéteurs tous les > 100 km [S] (lu).
- **Exemples récents arrivant en France** : **Medusa** (système ≈ 8 700 km selon plusieurs articles, [S]) : segment Marseille–Bizerte 1 050 km, première arrivée européenne, atterrissement annoncé le 10/10/2025, par le Sophie Germain d'Orange Marine, forage dirigé pour éviter les herbiers de posidonie et le parc des Calanques ; 3 paires de fibres à Orange [S] TelecomTV (lu). **AMITIE** : 6 800 km, 16 paires de fibres, Lynn (Boston) – Le Porge (près de Bordeaux) – Bude (Angleterre), exploité côté français par Orange [S] (extrait de recherche, non ouvert). La date de mise en service de Medusa n'est pas établie (articles contradictoires) : ne pas la dire.

### La réparation en mer (ordres de grandeur)
- Les stations côtières localisent la panne électriquement (réflectométrie), un navire de réparation largue une bouée près de la rupture, puis **grappin** : dents rigides sur fond sableux, grappin souple à crochets sur fond rocheux ; en eau profonde on coupe et remonte un bout à la fois ; on **raccorde à bord**, et comme le câble réparé est plus long, **le surplus est déposé en U sur le fond**. [S] en.wikipedia (lu).
- Réparation « typique » en eau peu profonde : le C-Lion1 réparé à 50 m en 5 à 15 jours environ [S] fr.wikipedia (lu). Les réparations de 2023 : 206 réparations, la plus longue 947 jours (blocages d'autorisation) [S] ICPC, extrait de recherche. Taïwan 2006 : 9 câbles, 11 navires, 49 jours [S] fr.wikipedia (lu).
- **Taux de pannes** : 3,7 par 1 000 km et par an de 1959 à 1979, tombé à 0,44 depuis la généralisation de l'enfouissement [S] en.wikipedia (lu) : c'est **la preuve que la charrue marche** (division par ≈ 8). Cause principale : 70 à 80 % activités humaines accidentelles (pêche, ancres) [S] ICPC, extrait ; autre chiffre : 86 % : **contradictoire, dire « la grande majorité »**.
- Coût d'une réparation : ≈ 0,5 à 1 million de dollars par incident pour un câble télécoms [S, extrait de recherche, source primaire non identifiée] : [O].
- Le **Sophie Germain** (Orange Marine) : navire de **réparation** de câbles (télécoms et câbles d'éoliennes), remplace le Raymond Croze, ≈ 100 m de long, port d'attache La Seyne-sur-Mer, CO2 -20 % et NOx -80 % par rapport au Raymond Croze [P newsroom.orange.com, lu, pour le rôle et les chiffres d'émissions ; 100 m : alloforfait, extrait [S]].

### Menace de l'étape
Un chalut ou une ancre : sans charrue, 3,7 pannes pour 1 000 km par an ; avec, 0,44 (en.wikipedia).

### Pourquoi ça marche
On ne protège pas le câble par le blindage seul : on l'éloigne de ce qui frappe. Sous le fond, l'ancre ou le chalut ne l'atteint plus. Fait retenu : **le taux de pannes a été divisé par ≈ 8 quand on a enterré les câbles.**

---

## 2. Le chemin terrestre en France, dans l'ordre réel

Chaîne Arcep : **NRO → PM → PBO → PTO**, puis la box. Schéma Arcep (RA2024, fiche 3 : **transport** NRO→PM, **distribution** PM→PBO→PTO) : [S] extrait de recherche, PDF non lu.

| Point | Vrai nom | Ce qu'il fait | Chiffre | Niveau |
|---|---|---|---|---|
| **NRO** | nœud de raccordement optique | bâtiment de l'opérateur, où les fibres des clients arrivent et sont reliées au réseau | pas de nombre de logements fiable trouvé (un site commercial dit ≈ 3 000, **non autoritaire : ne pas dire**) | page Arcep « la fibre optique » ne contient pas le NRO : [P] pour PM/PBO/PTO seulement |
| **PM** | point de mutualisation (l'armoire de rue) | là où les opérateurs commerciaux se raccordent au réseau de l'opérateur d'infrastructure ; c'est souvent là que se trouve le coupleur | hors zones très denses, zone arrière d'au moins ≈ 1 000 logements (recommandation Arcep ancienne) ; autre source : « quelques centaines de locaux » : **contradictoire, dire « quelques centaines à un millier »** | [S] extraits de recherche |
| **PBO** | point de branchement optique | boîtier dans la rue, sur un poteau, ou sur un palier | **6 à 12 logements** (Arcep), observation « jusqu'à 12 logements à moins d'une centaine de mètres » | [P] arcep.fr (lu) ; seconde phrase [S] extrait |
| **PTO** | prise terminale optique (point de terminaison optique) | la prise fibre à l'intérieur du logement ; le câble y est tiré depuis le PBO lors du raccordement, à la première souscription | une par logement raccordé | [P] arcep.fr (lu) |
| **ONT / box** | terminal optique | convertit la lumière en signal électrique | - | cf. § 6 |

- **Dans un immeuble en zone très dense** : le PM peut être dans l'immeuble si celui compte au moins 12 logements ou est desservi par un égout visitable (Arcep RA2024, extrait [S]).
- **Une fibre NRO→PM peut desservir jusqu'à 128 abonnés en architecture PON** (guide Cerema) [S, extrait].
- **Distances typiques** : pas de source primaire pour « distance NRO–PM » ; **ne rien chiffrer** sauf « le PBO est à moins d'une centaine de mètres des logements » (extrait Arcep). Le GPON est conçu pour ≈ 20 km (cf. § 5).
- **Vocabulaire** : Arcep écrit « point de terminaison optique » sur sa page grand public ; on dit PTO (**prise** terminale optique dans le langage courant). **Dire « PTO » sans développer** ou « la prise fibre ».

## 3. Comment le câble passe

- **Réutilisation du génie civil du cuivre** : le FttH se déploie « principalement » en utilisant le génie civil construit par Orange pour son réseau cuivre ; l'offre de référence **GC BLO** donne l'accès aux conduites souterraines et aux appuis aériens sur tout le territoire [S] extrait de recherche (non ouvert, documents Orange/Arcep). **Pas de répartition souterrain/aérien chiffrée trouvée.**
- **Fourreaux et chambres** : conduites souterraines avec chambres de tirage. Cas courant d'échec : fourreau absent, bouché ou écrasé (témoignages sur la communauté Orange : [O], **pas des statistiques**).
- **Soufflage** : le microcâble est poussé et entraîné par un courant d'air comprimé dans un micro-conduit.
  - Départ en poussant à 40-60 m/min, sans air [S] Aginode (Nexans), extrait.
  - Ailleurs : ≈ 30 m/min dans un tube [S] Excel, extrait.
  - Tronçons d'accès : 500 à 600 m jugés satisfaisants ; records jusqu'à 3 000 m en conduite classique [S] Aginode, extrait.
  - Exigence Acome : ≥ 1 250 m, ≥ 20 m/min, ≤ 50 min [S] extrait.
  - **Pour la voix : « à l'air comprimé, quelques dizaines de mètres par minute » [O].**
- **Poteaux** : câble aérien sur appuis existants (guide Objectif Fibre BLOM aérien, non ouvert). Aucune statistique.
- **Colonnes montantes d'immeuble** : le câble monte dans les gaines techniques jusqu'au PBO d'étage (« les PBO situés sur les paliers », [P] Arcep).
- **Menace** : on ne creuse pas, donc c'est **le fourreau existant qui décide** : s'il est bouché, la fibre ne passe pas.
- **Pourquoi ça marche** : un microcâble très léger, glissant dans un tube lisse, est entraîné par l'air qui frotte sur sa gaine : l'air le « porte » plus qu'on ne le tire. (Explication physique de principe, sans chiffre précis lu ; aucune source ne la formule ainsi : à dire avec prudence, ou à l'image seulement.)

---

## 4. LA SOUDURE (à détailler à fond)

### Les gestes dans l'ordre
1. **Dénuder** : on enlève le revêtement de 250 µm jusqu'au verre nu de 125 µm (tolérance 1 µm, voir 1re passe).
2. **Nettoyer** à l'alcool (geste standard, non sourcé ici ; l'étape « prefuse » de la soudeuse enlève aussi la saleté, FOA).
3. **Cliver** : la cliveuse de précision **raye** la fibre puis **la casse net** : la fibre est mise sous tension, la rayure fait partir la fissure, qui laisse un bout plat « miroir » [P] FOA (« scribes and breaks », lu). Angle de coupe : acceptable < 2°, typiquement ≈ 0,5° avec une bonne cliveuse [S] Corning (extrait de recherche, PDF non lu) ; un brevet cite 0,5° par fibre ou 1° pour la paire ; un guide : < 1°, idéal ≤ 0,3° [S] extraits. **Pour la voix : « moins d'un degré » [O].** La soudeuse affiche les deux bouts et **rejette un mauvais clivage** [P] FOA.
4. **Aligner** : deux méthodes [P] FOA (lu) : **alignement par le cœur** (deux caméras à 90°, le logiciel repère les cœurs et les aligne) ; **LID** (on injecte de la lumière dans une fibre courbée et on la maximise à l'autre bout). L'alignement par le cœur compte le plus quand les fibres sont semblables [S] Corning, extrait.
5. **Préfusion** : un premier arc nettoie les extrémités et les préchauffe [P] FOA.
6. **Arc** : un arc électrique chauffe les deux verres, qui sont poussés l'un vers l'autre à vitesse contrôlée [P] FOA. **Température de l'arc : non trouvée à une source, ne pas chiffrer.** (Les ≈ 1 900 °C de la première passe sont ceux du four de fibrage, pas de la soudeuse.) **Durée de l'arc : non sourcée** (un blog donne ≈ 1,5 s : [O], ne pas dire). **Durée totale d'un cycle soudure + chauffe du manchon : « 2 minutes »** selon une brochure Fujikura 90S, extrait [S].
7. **Estimation de la perte** : la soudeuse l'estime ; « la seule façon de la tester est un OTDR », souvent dans les deux sens avec moyenne [P] FOA (lu).
8. **Protéger** : un **manchon thermorétractable** glissé sur la soudure et chauffé dans le four de la soudeuse, contre l'humidité et les chocs ; ou protecteurs à clapet [P] FOA (lu).
9. **Test de traction (proof test)** : **non sourcé** pour les soudeuses (la 1re passe : proof test de la fibre à 0,7 GPa). Ne pas dire « la soudeuse tire à 2 N ».

### Pourquoi l'angle compte
Si le bout est de biais, les deux surfaces ne se touchent pas franchement : on obtient un trou d'air, une bulle, ou un décalage, et la lumière s'échappe. Dit par Corning : l'angle de coupe est le facteur principal de la perte [S] extrait. Une bonne cliveuse : ≈ 0,5°.

### Ce qui fait rater une soudure [P] FOA (lu)
- **Bulle ou inclusion** : bouts sales, mauvais clivage, courant d'arc trop fort, préfusion trop faible.
- **Pas fondu à cœur** : courant trop faible, préfusion trop courte.
- **Étranglement** : courant trop fort, avance trop lente, électrodes sales.
- **Épaississement** : avance trop rapide.
- Une soudure avec grand décalage de cœur, bulle ou renflement **se refait toujours**. On peut répéter l'étape arc, **« jamais plus de deux fois »**.
- Électrodes sales : un mot récurrent des causes.

### Pertes
- **Typique fusion** : < 0,1 dB (Corning, extrait) ; constructeurs : 0,02 dB (mesure en cut-back, revendication constructeur), 0,03 dB « typique » [S] extraits. La première passe ne donne pas de chiffre : on dit **« de l'ordre de 0,05 dB » [O]**.
- **En pourcentage** (calcul : 10^(-dB/10)) : 0,02 dB ≈ 0,5 % perdu ; 0,05 dB ≈ 1,1 % ; 0,1 dB ≈ 2,3 % ; 3 dB = la moitié.
- **Comparaison** : un épissurage mécanique < 0,2 dB (Corning, extrait) ≈ 4,5 % perdu.

### Lien avec la tolérance d'un micron
Le cœur monomode fait ≈ 9 µm (voir 1re passe, [P] FOA) : décaler de 1 µm déplace déjà plus de 10 % de la largeur du cœur. La fibre est fabriquée à ± 1 µm sur 125 µm de diamètre. La soudeuse doit donc recréer à l'arc ce que la tour de fibrage fait à ± 1 µm. (Rapport 1 µm / 9 µm = calcul ; aucune source ne le formule ainsi.)

### Menace
Une soudure ratée ajoute de la perte à un budget de 28 dB déjà tendu ; et **seul un OTDR la voit**.

---

## 5. Le partage : le GPON

- **Le principe** : l'OLT (au central) émet sur **une** fibre ; un coupleur passif divise la lumière entre les abonnés ; en montée, les signaux des abonnés se recombinent sur la même fibre [P] FOA (FTTH-PON, lu).
- **Longueurs d'onde GPON** : **1 490 nm** descendant, **1 310 nm** montant [P] FOA (lu). Le BPON et l'EPON ajoutent 1 550 nm (vidéo). Plages de la norme : réception descendante 1 480-1 500 nm, émission montante 1 260-1 360 nm [S] datasheet d'un module (non la norme : la page ITU lue ne donne pas les valeurs). **La table des matières de G.984.2 (ITU, lue) confirme l'existence de la section « Operating wavelength » et de l'**Annex A : GPON classe B+ 2,488 Gbit/s descendant / 1,244 Gbit/s montant** ; les valeurs numériques n'ont pas pu être lues à la norme.**
- **Rapport de partage** : GPON jusqu'à **64** (FOA, tableau) ; BPON 32 ; on dit « 32 ou 64 » ; en France l'Arcep/Cerema évoque jusqu'à 128 abonnés sur une fibre entre NRO et PM en PON [S]. **Ne pas dire un seul nombre pour la France** : dépend de l'opérateur d'infrastructure.
- **Pourquoi le coupleur marche sans courant** : un **coupleur PLC** (planar lightwave circuit) est un guide d'onde en verre gravé (« solid state waveguide »), qui coupe la lumière en branches ; opère de 1 260 à 1 650 nm, -40 à +85 °C ; un **FBT** (fused biconical taper) fond deux fibres ensemble, max 32 [P] FOA (Optical_splitter, lu). **Le détail de la gravure n'est pas décrit par la source** : à l'image seulement.
- **Pertes d'un coupleur symétrique** [P] FOA (lu) : 1:2 ≈ 3,6 dB, 1:4 ≈ 6,8, 1:8 ≈ 10,0, 1:16 ≈ 13,0, **1:32 ≈ 16,0 (idéal 15, max 16,5-16,8)**, **1:64 ≈ 19,5 (idéal 18, max 20,5-21,0)**. Formule idéale : 10·log10(1/N). Pour 32 : 1/32 ≈ 3,1 % de la lumière par abonné ; pour 64 : ≈ 1,6 %.
- **Budget optique** : « ~13 à 28 dB » pour un GPON avec partage 32 [P] FOA (FTTH-PON et FTTH-test, lus) ; la même page de test dit « un partage de 32 ≈ 18 dB pour les coupleurs **plus** toutes les pertes de fibre, soudures et connecteurs ». Un tableau ITU ultérieur donne B+ : minimum 13 dB, maximum 28 dB [S, extrait de recherche, tableau de G.9805 cité, **pas de G.984.2**]. **« 28 dB » est donc une valeur sûre pour dire « classe B+ »**, en précisant « en gros ».
  - **En fraction de lumière** : 28 dB = 1/631 ≈ 0,16 % qui arrive ; 13 dB (le minimum) = 5 %. Le récepteur ONT est assez sensible pour travailler dans cette plage [P] FOA : « puissance OLT ≈ 0 à +6 dBm ; ONT ≈ -4 à +2 dBm ».
  - Comparaison pour le film : 28 dB de perte dans la fibre seule = « presque 50 km de fibre » [P] FOA (FTTH-test, lu), à 0,15-0,2 dB/km (1re passe) ça donne 140-190 km : **la page dit « nearly 50 km » avec ses propres marges : dire « des dizaines de km de fibre » [O]**.
- **Portée** : GPON en versions 10, 20, 40 ou 60 km [P] FOA (lu). **« 20 km » est la valeur de conception courante** [S] extraits d'un fabricant de modules, et BPON/EPON « moins de 20 km » [P] FOA. **Dire « jusqu'à 20 km environ ».**
- **Voie montante : partage du temps (TDMA)** : chaque ONT reçoit un créneau, l'OLT distribue les créneaux dans une trame de **125 µs** [S] extrait de recherche (formation d'un fournisseur), **non confirmé par FOA** : dire « chacun parle à son tour, par créneaux », sans la trame.
- **Menace** : si la somme des pertes dépasse le budget, l'ONT ne voit plus rien. Le budget est un **plafond** commun à toutes les soudures et connecteurs.
- **Vocabulaire à ne pas casser** : **OLT** côté central (optical line terminal), **ONT** (optical network terminal) chez l'abonné, **splitter / coupleur**, **PON**. « Partage de **32 ou 64** » ; « classe **B+** ».

---

## 6. Chez toi

- **L'ONT** : convertit la lumière en signal électrique. Source : FOA le décrit comme l'équipement chez l'abonné qui reçoit 1 490 nm et émet 1 310 nm, puissance d'émission ≈ -4 à +2 dBm [P] FOA (lu). Beaucoup de box intègrent l'ONT (module dans la box) ; **ne pas dire « la box = l'ONT » pour tous les opérateurs** (en France, selon l'opérateur, l'ONT est dans la box ou un boîtier séparé : fait connu, non sourcé ici, à vérifier si on veut l'affirmer).
- **Le connecteur vert SC/APC** : **SC** : poussoir, férule de 2,5 mm [S] Wikipédia EN (lu) ; **APC** : angle poli **normalement 8°** ; vert (boîtier ou gaine) pour l'angle [S] Wikipédia EN (lu) ; ≈ 9° dans certains pays (même page). **Pourquoi** : le reflet à l'extrémité est dévié dans la gaine au lieu de remonter vers la source ; perte en retour typique **≈ 60 à 65 dB** pour l'APC contre 40 (PC) et 50 (UPC) [S] extrait de recherche (non ouvert, fiches commerciales) : [O] « bien meilleur de plusieurs dizaines de dB ». APC en FTTx : l'APC est requis quand un reflet gênerait (vidéo analogique, PON) [S] extrait ; **FOA lu** : « beaucoup de systèmes FTTx utilisent des APC, donc les câbles de test OLTS et OTDR doivent avoir les mêmes connecteurs ».
  - **Règle à répéter** : on ne branche pas un APC (vert) dans un UPC (bleu) : la mise en regard abîme les embouts [S] extrait.
  - Perte d'insertion « ne devrait pas dépasser 0,75 dB » [S] Wikipédia EN, lu ; répétabilité ≈ 0,2 dB.
- **Ne jamais regarder dans une fibre** :
  - Les systèmes de fibre émettent en **infrarouge invisible** (850, 1 300, 1 310, 1 490, 1 550, 1 625 nm) ; la rétine n'a pas de sensibilité à la douleur : on peut recevoir une dose nocive sans rien sentir [S] ecmweb / Laser Focus World (extraits de recherche).
  - Loupes et microscopes **aggravent** le risque : FOA (lu, FTTH-test) : « utiliser des microscopes avec filtres infrarouges ».
  - Puissance d'un OLT : ≈ 0 à +6 dBm = jusqu'à ≈ 4 mW [P] FOA (lu) ; calcul : 6 dBm ≈ 4 mW.
  - **Classe du laser : non trouvée à une source, ne pas dire « classe 1 » ou « classe 3 »** pour la fibre d'un abonné.
  - Les 1re passes disent : le coupleur « avant » concentre plus de puissance côté OLT que chez toi : FOA le dit pour les EDFA.
- **Poussière et cœur de 9 µm** : le cœur monomode fait ≈ 9 µm (voir 1re passe). **Aucune source n'a été lue sur la taille d'une poussière ni sur son effet en dB** : la comparaison « un grain de poussière couvre le cœur » reste **[O]** et ne se dit que comme image (une poussière de quelques micromètres suffit à masquer un cœur de 9 µm : ordre de grandeur géométrique, non sourcé). Nettoyer la férule avant chaque connexion prolonge sa vie, inspection au microscope de terrain [S] Wikipédia EN, lu.

---

## 7. Le contrôle après pose

- **Réflectomètre (OTDR)** [P] FOA (OTDR.html, lu) :
  - Envoie une impulsion forte, mesure la **lumière rétrodiffusée** (et les réflexions des connecteurs).
  - La distance vient du temps de retour : la vitesse de la lumière dans le cœur est connue par l'indice, **on divise par deux l'aller-retour** ; les pertes sont aussi divisées par deux.
  - La **pente** = l'atténuation en dB/km. Les **événements** : soudures, connecteurs (avec pic de réflexion), fin du câble. Les soudures par fusion peuvent être trop petites pour se voir.
  - **Zone morte** après l'instrument ; un **câble d'amorce** (« launch cable ») la contourne et sert de référence au premier connecteur.
  - Efficace sur > ≈ 250 m ; ne sert **pas** à mesurer la perte d'insertion : « une source + un photomètre est meilleur ».
  - Fibre ≈ 1 % plus longue que le câble.
  - **Sur un PON** [P] FOA (FTTH-test, lu) : OTDR PON à 1 310, 1 490 et 1 550 nm ; certains à 1 650 nm, plus sensible aux courbures ; on teste **depuis l'abonné vers le central** (en descendant, les traces sont dures à lire à cause du coupleur) ; les traces sont archivées.
- **Photomètre (power meter)** : mesure la puissance reçue à l'ONT ; trop faible : mauvais rapport signal/bruit, trop forte : récepteur saturé [P] FOA (lu). Plage de pertes de travail : « ~13 à 28 dB » [P] FOA.
- **Ce qu'on lit** : « un trait presque droit qui descend, des marches (soudures) et des pics (connecteurs), puis la fin » ; un sinistre : une grande marche = soudure ou courbure.
- **Qualité en France (Arcep, observatoire de la qualité des réseaux FttH)** :
  - Taux de pannes (réseaux les plus dégradés) : **0,51 % (janv. 2024) → 0,30 % (oct. 2024)** [P] arcep.fr communiqué du 26/03/2025 (lu).
  - Taux mensuel de pannes « tend à se stabiliser à 0,12 % » (communiqué antérieur) [S extrait].
  - Taux d'échec au raccordement : « stabilité » (sans valeur) dans le communiqué lu ; moyenne nationale 5,88 % en septembre 2025 [S extrait de recherche : non lu à la source].
  - Deux nouveaux indicateurs en 2025 : raccordements non conformes par type de malfaçon, malfaçons reprises sous 30 jours [P] (lu, sans valeur).
  - Pannes = « signalées par l'opérateur commercial à l'opérateur d'infrastructure » [P] page Arcep juillet 2024 (lue). Les travaux visent la qualité des interventions des techniciens et une labellisation des techniciens et sous-traitants [S] extrait.

## 8. Chiffres d'échelle pour la France

| Chiffre | Valeur | Source / niveau |
|---|---|---|
| Abonnements fibre fin juin 2026 | **28,1 millions, 85 % des abonnements internet fixes** | [P] arcep.fr, observatoire T2 2026 (lu, page mise à jour le 10/09/2026) |
| Locaux raccordables (T1 2026) | **≈ 95 %** (94,9 % ≈ 42,8 millions, selon un site) | [S] extrait de recherche : communiqué Arcep non ouvert |
| Évolution | tableau de la 1re passe : 27,1 M d'abonnements, 42,4 M de locaux, 94,3 % (**plus ancien : utiliser T2 2026**) | [P] 1re passe |
| Définition d'un « local » | somme des logements et établissements d'entreprises de ≥ 1 salarié (Insee) | [P] arcep.fr (lu) |
| Débits | « jusqu'à 1 Gbit/s » | [P] arcep.fr (lu) |
| Début des constructions | vers 2008-2009, toujours en cours | [P] arcep.fr (lu) |
| Coût du plan France THD | **34,9 Md€** estimés par la Cour des comptes (janvier 2017) contre **20 Md€** annoncés | [S] extraits de recherche (non ouverts). **Ne pas dire « coût d'une prise »** : aucun coût unitaire n'a été trouvé. |
| Kilomètres de fibre déployés en France | **non trouvé** | ne pas dire |
| Nombre de techniciens | **non trouvé** | ne pas dire |

---

## 9. Ce qui retourne une idée reçue (chutes candidates)

- **« La fibre, c'est un fil par maison »** : non, une **seule** fibre du central est partagée entre **32 ou 64** foyers, avec un coupleur sans électricité (FOA, lu).
- **« Une soudure, c'est un point faible »** : au contraire, une bonne soudure perd **≈ 0,5 à 1 % de la lumière** ; un connecteur peut perdre dix fois plus (0,75 dB max ≈ 16 % : calcul à partir de Wikipédia EN).
- **« Pour avoir plus de lumière, il faut un fil plus gros »** : non : on a le droit de **perdre 99,8 %** de la lumière (28 dB ≈ 0,16 % qui arrive) et ça marche encore.
- **« Le fil sous l'océan flotte »** : il est **enterré** près des côtes ; l'enfouissement a divisé les pannes par ≈ 8 (3,7 → 0,44 pour 1 000 km par an).

## 10. La question du commentaire (fermées, deux camps, un mot)

- « Ta prise fibre : le connecteur est **vert**… ou **bleu** ? » (lecture faisable chez soi : vert = APC)
- « Ton **boîtier optique** : tu sais où il est… oui ou non ? »
- « Ta fibre est arrivée par un **poteau**… ou par le **sol** ? » (lecture chez soi, réponse en un mot ; ne fait pas peur mais fait réagir)

## 11. L'histoire de l'installation

- Le déploiement du FttH en France a commencé vers 2008-2009 [P] arcep.fr. Arcep : plan d'action « Qualité de la fibre » présenté en septembre 2022 ; observatoire créé en juillet 2023 [P] communiqué (lu).
- Sous-marin : taux de pannes de 3,7 à 0,44 pour 1 000 km par an avec l'enfouissement [S] en.wikipedia. Pas de date de l'invention de la charrue lue.

## 12. Pour l'annonce

Pas d'annonce pour ce fichier (c'est une passe de faits d'installation : l'annonce se règle sur le script).

---

## 13. À ne pas dire

- **Pas de chiffre pour la température de l'arc** de la soudeuse, ni la durée de l'arc, ni la force du test de traction (« 2 N »), ni la longueur du manchon : **non sourcés**.
- **Pas « classe 1 / classe 3 »** pour le laser de la fibre : classe non trouvée.
- **Pas « 80 % des pannes sous-marines sont dues à la pêche »** : les sources donnent 70-80 % ou 86 %, « pêche et ancres », avec « causes suspectées » incluses : dire **« la grande majorité »**.
- **Pas de vitesse de pose attribuée au Sophie Germain** : c'est un navire de réparation ; les « 8 nœuds » viennent de la brochure d'un autre navire (extrait de recherche) ; la charrue avance à ≈ 0,2 km/h (ICPC, extrait).
- **Pas « jusqu'à 1 000 m » pour la charrue** : les sources donnent 1 500 m (fr.wikipedia), 1 500 m (une charrue commerciale, 3,3 m de tranchée) ou « jusqu'à 2 000 m » (limite des chaluts, ICPC) ; **dire « là où les chaluts raclent le fond »**.
- **Pas de diamètre précis** du câble (25 mm ou 69 mm selon la page).
- **Pas de date de mise en service pour Medusa** (le calendrier a glissé) ; **ne pas confondre** le segment Marseille–Bizerte (1 050 km) avec le système entier (≈ 8 700 km).
- **Pas « 20 atterrissements en Bretagne et Normandie** » comme chiffre national : extrait d'une réponse parlementaire non ouverte ; et Marseille compte 17 câbles : ne pas additionner.
- **Pas de nombre de logements par NRO** (le « ≈ 3 000 » vient d'un site commercial). Pour le PM : « quelques centaines à un millier » seulement ; les sources se contredisent (au moins 1 000 hors zones très denses, ou quelques centaines).
- **Pas de coût moyen d'une prise** ni de nombre de techniciens : introuvables.
- **Pas de nombre de km de fibre déployés** en France.
- **Pas « le PM est l'armoire de rue » sans nuance** : en zone très dense, il peut être dans l'immeuble (≥ 12 logements) ou en égout visitable ; ailleurs c'est une armoire.
- **Sigles piégeux** : PTO = « prise terminale optique » dans le langage courant, « point de terminaison optique » chez l'Arcep ; **NRO ≠ OLT** (le NRO est le bâtiment, l'OLT l'équipement qu'il héberge) ; **ONT ≠ box** en général ; **GPON ≠ XGS-PON** (autres longueurs d'onde : 1 575-1 580 / 1 260-1 280 nm pour XG-PON, FOA) ; « coupleur » = « splitter » (en France on dit surtout « coupleur » ou « splitter »).
- **Différences entre opérateurs** : taux de panne et d'échec varient fortement selon l'opérateur d'infrastructure et la région (« disparités » Arcep ; Île-de-France « reste élevé »). Ne pas généraliser. L'ONT est dans la box ou séparé selon l'opérateur.
- **Pas « 1 490 nm descendant et 1 310 nm montant » comme loi de la norme sans « GPON »** : en XGS-PON, NG-PON2, etc., c'est différent (FOA, tableau).
- **Pas « la lumière va à 300 000 km/s »** (déjà dans la 1re passe).
- **Pas de TDMA sourcé à FOA** : dire « à tour de rôle ».
- **Pas « 28 dB = 0,15 dB/km pendant 190 km »** : FOA dit « presque 50 km » dans son exemple de test ; ne pas faire cette division à l'antenne.
- **Pas « tous les câbles sous-marins ont 8 paires »** (SDM : 12 à 24 paires, Wikipédia EN) ; **AMITIE : 16 paires** [S extrait].

## 14. Ce que la voix peut dire (dix phrases courtes)

1. Une seule fibre part du central. Elle dessert trente-deux, parfois soixante-quatre foyers.
2. Le coupleur qui divise la lumière n'a besoin d'aucun courant.
3. À trente-deux foyers, chacun reçoit environ trois pour cent de la lumière.
4. La perte autorisée : environ vingt-huit décibels. Il reste moins d'un millième de la lumière. Ça suffit.
5. Vers toi, un infrarouge à 1 490 nanomètres. Vers le réseau, 1 310. Dans la même fibre.
6. Une bonne soudure perd environ un pour cent de la lumière.
7. On rayure la fibre, on la casse net. Le bout doit être plat comme un miroir.
8. La soudeuse aligne les cœurs, puis un arc électrique fond le verre.
9. Le connecteur vert est poli en biais, à huit degrés, pour que le reflet parte dans la gaine.
10. Un câble coupé en mer se remonte avec un grappin, et se répare à bord.

Plus : « Enterré, un câble sous-marin tombe en panne environ huit fois moins » (3,7 → 0,44 pour 1 000 km par an, en.wikipedia) ; « Le point de branchement dessert six à douze logements. » (Arcep).

## 15. Éléments de long : étapes en chapitres, avec leur menace

| Étape | Menace (ce qui arrive si on la saute) |
|---|---|
| 1. Poser en mer, enfouir près de la côte | chalut/ancre : coupure ; 3,7 pannes pour 1 000 km/an avant l'enfouissement |
| 2. Atterrir et rejoindre le NRO | herbiers, plage, ouvrage : on creuse par forage dirigé |
| 3. Passer par les fourreaux, souffler | fourreau bouché : la fibre ne passe pas |
| 4. Souder | clivage de travers, bulle : pertes ; 28 dB de budget partagé |
| 5. Partager (PM, coupleur, PBO) | dépasser le budget : l'abonné ne reçoit plus rien |
| 6. Raccorder chez toi (PBO → PTO → ONT) | poussière, mauvais connecteur (APC/UPC) ; malfaçons (Arcep : 5,88 % d'échecs de raccordement, sept. 2025, extrait) |
| 7. Contrôler (OTDR, photomètre) | la panne cachée : seul l'OTDR voit la soudure |

**Climax candidat** : la soudure (« un arc électrique fond deux verres de 125 µm, alignés à ± 1 µm ») ; ou le contrôle : une marche sur la trace OTDR qui révèle la soudure ratée.

**Trois fils candidats** :
1. *Question ouverte tôt* : « Comment une seule fibre dessert-elle trente-deux maisons sans qu'aucune ne perde le signal ? » → payée au coupleur.
2. *« Combien de lumière a-t-on le droit de perdre ? »* → 28 dB, payée au budget.
3. *« Que se passe-t-il quand un câble sous l'océan casse ? »* → payée à la réparation par grappin.

**Pièces du dossier réelles, montrables** : **non vérifiées individuellement dans cette passe** (aucune image n'a été ouverte). À vérifier avant usage : photos Wikimedia (soudeuse, câblier, PBO, charrue), licences fichier par fichier. Le dossier Orange/ASN du câblier : droits des marques, ne pas reprendre. Documents publics : pages Arcep (licence ouverte non vérifiée ici).

## 16. Sources, et ce que j'y ai lu

**Lues :**
- https://www.thefoa.org/tech/ref/appln/FTTH-PON.html : tableau longueurs d'onde, rapports de partage, budgets, portées, puissances OLT/ONT.
- https://foa.org/tech/ref/appln/FTTH-test.html : tests FTTH PON, OTDR PON, 13 à 28 dB, sécurité œil.
- https://FoA.org/tech/ref/install/Optical_splitter.html : FBT/PLC, tableau des pertes, formule.
- https://www.thefoa.org/tech/ref/testing/OTDR/OTDR.html : fonctionnement OTDR, zone morte.
- https://www.thefoa.org/tech/ref/termination/fusion.html : méthodes d'alignement, causes de soudures ratées, manchon, OTDR.
- https://www.arcep.fr/nos-sujets/la-fibre-optique.html : PM, PBO (6 à 12 logements), PTO, étapes ; 34,4 M de locaux raccordables fin 2022.
- https://www.arcep.fr/actualites/actualites-et-communiques/detail/n/reseaux-en-fibre-optique-260325.html : pannes 0,51 % → 0,30 %.
- https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees/qualite-des-reseaux-ftth/qualite-des-reseaux-ftth-chiffres-juillet-2024.html : définitions (pannes), indicateurs.
- https://www.arcep.fr/cartes-et-donnees/nos-publications-chiffrees/observatoire-des-abonnements-et-deploiements-du-haut-et-tres-haut-debit/observatoire-haut-et-tres-haut-debit-abonnements-et-deploiements-t2-2026.html : 28,1 M, 85 %.
- https://www.itu.int/dms_pubrec/itu-t/rec/g/T-REC-G.984.2-201908-I!!TOC-HTM-E.htm : sommaire seulement (pas de valeurs).
- https://en.wikipedia.org/wiki/Submarine_communications_cable (lu sur 100 000 de 215 000 caractères) ; https://fr.wikipedia.org/wiki/Câble_sous-marin (idem, 100 000 sur 160 000) : diamètre, couches, réparation, pannes, profondeur d'ensouillage.
- https://en.wikipedia.org/wiki/Optical_fiber_connector : APC 8°, vert, SC, insertion loss.
- https://en.wikipedia.org/wiki/Fusion_splicing : page-brouillon, aucun chiffre utile.
- https://newsroom.orange.com/orange-marine-reveals-the-name-of-its-future-cable-ship-the-c-s-sophie-germain-plus-its-official-sponsor?lang=eng : rôle de réparation, émissions.
- https://www.telecomtv.com/content/orange/orange-hosts-the-medusa-submarine-cable-in-marseille-for-its-first-landing-54012/ : Medusa 1 050 km, 17 câbles à Marseille, forage dirigé.

**Vues par extrait de recherche seulement (non ouvertes) :** ICPC (PDF : enfouissement 1-3,5 m, 0,2 km/h, 150-200 pannes, 70-80 %, 206 réparations 2023) ; Arcep RA2024 fiche 3 (schéma NRO-PM-PBO-PTO, PM dans immeuble ≥ 12 logements) ; Comité d'experts fibre 2012 (PRDM < 1 000 lignes) ; Cerema (PON jusqu'à 128) ; recommandation Arcep ZMD (PM ≥ 1 000 logements, PBO ≤ 12 à < 100 m) ; Corning AN103 (cleave < 2°, ≈ 0,5°, < 0,1 dB) ; datasheets constructeurs de soudeuses (0,02/0,03 dB) ; brochure Fujikura 90S (cycle 2 min) ; Aginode/Excel/Acome (soufflage) ; Cour des comptes via presse (34,9 Md€) ; dossier AMITIE (ensouillage 2 m) ; compte rendu Assemblée nationale (tranchée ≈ 2 m) ; AMITIE (6 800 km, 16 paires) ; madeinmarseille.net, ASN (Medusa 8 700 km) ; alloforfait (Sophie Germain 100 m) ; fiches APC (−60/−65 dB) ; Laser Focus World, ecmweb (sécurité œil) ; Arcep (5,88 % d'échecs en sept. 2025, 0,12 % de pannes mensuelles) ; datasheet module GPON B+ (1 480-1 500 / 1 260-1 360 nm, 20 km) ; tableau G.9805 (B+ : 13-28 dB).

**Non lues (erreur) :** cablejoints.co.uk (guide ISCPC, 404) ; iscpc.org PDF et Assemblée nationale PDF (binaire) ; marine.orange.com (cookies) ; thefoa.org/tech/ref/basic/FO_PON.html (404) ; fr.wikipedia « Gigabit Passive Optical Network » (404) ; blog.telegeography.com (404).

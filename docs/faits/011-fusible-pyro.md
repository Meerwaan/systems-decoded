# Dossier de faits — 011 Fusible pyrotechnique (pyro fuse / « pyro switch ») des voitures électriques

Recherche du 2026-10-08. Format : fait — valeur — phrase de la source (dans sa langue) — URL — niveau (PRIMAIRE lu / SECONDAIRE lu / NON VÉRIFIÉ).
Fichier écrit au fur et à mesure. Sections finales (simplifications, « À NE PAS DIRE », trois chiffres qui claquent, URL lues) en bas.
Budget : 25 pages ouvertes (dont 3 sans contenu utile) sur 30 ; une quinzaine d'autres tentatives de lecture ont échoué (403, 404, délai, certificat) ; environ 27 recherches pour trouver les pages. Les PDF ont été lus en entier en local (pdftotext), pas seulement résumés.
Numérotation : les blocs suivent les 10 questions du cahier des charges (1 fabrication, 2 temps, 3 ce qu'il coupe, 4 danger et règlements, 5 qui en a, 6 usage unique, 7 couleurs et repères, 8 idées reçues, 9 chiffres d'accident, 10 commentaire et consigne) . L'ordre dans le fichier est celui de l'écriture (1, 2, 5, 4, 7, 3, suites du 5, 6, 8, 9, 10) : se repérer par les numéros.

Vocabulaire : « pyro fuse » (Autoliv, Eaton, Schurter, Tesla), « Pyro Safety Switch » / PSS (Autoliv), « pyrotechnic battery disconnect » (Tesla, NHTSA), BDU = Battery Disconnect Unit, BMS = Battery Management System, ECU = calculateur.

---

## 1. Comment c'est fait

### 1.1 Le principe : un piston poussé par une charge pyrotechnique tranche une barre de cuivre
- Fait : un signal du calculateur (airbag en cas de choc, BMS en cas de court-circuit) fait partir une charge pyrotechnique ; l'énergie libérée pousse **un piston en plastique** qui frappe la barre conductrice (busbar) et la sectionne ; un arc se forme puis est éteint ; le courant est interrompu.
- Source : brochure Autoliv « Pyro Fuses — Protection in milliseconds » (mars 2025). Schéma « Functionality » : « ECU/BMS sends triggering signal » → « Pyrotechnic energy released » → « Plastic piston hits busbar » → « Busbar severed and electric arc generated » → « Arc extinguished, current interrupted ». Texte : « We use pyro to push the piston, sever the busbar and cut the current. » ; « Simple: Mechanical severing of a busbar » ; « Disconnects the circuit safely, reliably & irreversibly. »
- URL : https://www.autoliv.com/sites/autoliv/files/2025-05/PSSfolder_202503.pdf
- Niveau : **PRIMAIRE lu** (fabricant leader ; le PDF a été lu en local via pdftotext, les libellés et les temps sont dans l'ordre du schéma).

### 1.2 Le même type de déclenchement que les airbags
- Fait : le Pyro Safety Switch est déclenché **par les mêmes capteurs de choc que les airbags**.
- Source : communiqué Autoliv du 15 septembre 2011 : « utilizes a pyrotechnic initiator to cut the electrical power to a designated portion of the vehicle in a crash » ; « activated by the same crash sensors as the airbags » ; « Cutting the vehicle's electrical power minimizes the potential for a fire caused by a damaged electrical system ».
- URL : https://www.autoliv.com/press/strong-growth-automatic-battery-disconnects-new-vehicles-1212493
- Niveau : **PRIMAIRE lu** (communiqué de presse du fabricant, ancien : 2011).
- Brochure 2025 : « Triggered by the airbag control unit in the case of a crash or BMS in the case of a short-circuit, protecting electronic systems and reducing risks of fire. After triggering, disconnection takes place no matter the level of current. » et « Reliable: Automotive safety technology proven by billions over decades » (allusion à la technologie des airbags) — même URL que 1.1 — PRIMAIRE lu.
- Production en 2011 : « expects to produce 1.6 million units of the PSS, mainly on luxury models » — communiqué Autoliv 2011 — PRIMAIRE lu (il s'agit alors du dispositif de coupure de batterie 12 V / réseau de bord ; voir bloc 5 et la remarque « BMW »).
- « Le même allumeur que l'airbag » : la source dit « pyrotechnic initiator » et « same crash sensors » ; **elle ne dit pas que l'allumeur est identique à celui d'un airbag**. À dire : « même capteurs, même ordre » ; ne pas dire « le même allumeur ».

### 1.3 Taille et poids (gamme Autoliv PSS)
- Fait : poids de **40 g à moins de 320 g** selon le modèle (valeurs de la brochure : 60 g, 40 g, 65 g, < 160 g, < 320 g, 80 g pour PSS-1 à PSS-6) ; dimensions hors barre de **43 × 70 × 21 mm à 79 × 47 × 47 mm** (par ex. 72 × 46 × 42 mm pour le PSS-4 à 500 V ; 79 × 47 × 47 mm pour le PSS-5 à 1 000 V).
- Attention : la correspondance exacte colonne par colonne est lue dans une mise en page de tableau ; donner l'ordre de grandeur (« de la taille d'un paquet de cartes, de 40 à 320 g ») plutôt qu'une ligne précise.
- Source : brochure Autoliv, tableau « Our Pyro Fuses » — https://www.autoliv.com/sites/autoliv/files/2025-05/PSSfolder_202503.pdf — PRIMAIRE lu.
- Tension/énergie de coupure annoncée par modèle : « 150 V / 120 J », « 500 V / 1 800 J », « 1 000 V / 3 500 J » (énergie de la bobine = ½·L·I² : l'énergie que le circuit inductif doit dissiper) ; courant de passage « 85 °C / 300 A » à « 50 °C / 500 A » ; « Operation Time < 2 ms (1.75 A / 2 ms pulse) » (c'est le temps d'ouverture annoncé pour la gamme, à l'impulsion de commande de 1,75 A / 2 ms) ; plage de fonctionnement « -40 °C ... + 105 °C » — même URL — PRIMAIRE lu.

---

## 2. Les temps

### 2.1 Autoliv : la chronologie d'un déclenchement (brochure 2025)
- Fait : **0 ms** le calculateur (ECU/BMS) envoie le signal ; **0,35 ms** l'énergie pyrotechnique est libérée ; **0,5 ms** le piston en plastique frappe la barre ; **0,75 ms** la barre est sectionnée et un arc électrique se forme ; **1 ms** l'arc est éteint, le courant est interrompu.
- Phrase : schéma « Functionality » avec les repères « 0 ms · 0.35 ms · 0.5 ms · 0.75 ms · 1 ms » sous « ECU/BMS sends triggering signal · Pyrotechnic energy released · Plastic piston hits busbar · Busbar severed and electric arc generated · Arc extinguished, current interrupted ». Et : « Fast: Operates in less than a millisecond ».
- URL : https://www.autoliv.com/sites/autoliv/files/2025-05/PSSfolder_202503.pdf — **PRIMAIRE lu** (l'ordre des repères et des légendes est celui du PDF ; les cinq temps et les cinq légendes se suivent dans le même ordre).
- Le tableau de la même brochure annonce, pour la gamme, « Operation Time < 2 ms (1.75 A / 2 ms pulse) » : donc « moins d'une milliseconde » (schéma, cas typique) ET « moins de 2 ms » (spécification de la gamme). Les deux figurent dans la même brochure ; dire « environ une milliseconde ».
- Communiqué commun Autoliv/Mersen (date non vérifiée ; résultat de recherche, texte non relu à la source) : « disconnect both a complete battery pack (ranging from 300 to 400 Volt dc) and the intended battery module (30-60 Volt dc) in less than 0.5 milliseconds » — NON VÉRIFIÉ à la source (extrait de résultat de recherche), à ne pas utiliser sans relecture.

### 2.2 Schurter (fabricant suisse de fusibles) : fiche APO, 1 000 V
- Fait : temps de commutation total **typique 1,0 ms, maximum 2,0 ms** ; retard d'allumage typique 0,3 ms (max 0,5 ms) à 1,75 A d'impulsion ; « Action Time < 2 ms ».
- Phrase : tableau « Time summand » : « Ignition delay · Mechanical separation time · Breaking time · Total switching time » avec « Typical » et « Maximum » ; « Action Time <2 ms ».
- URL : https://www.schurter.com/en/datasheet/typ_APO.pdf — **PRIMAIRE lu** (fiche technique du fabricant, lue via pdftotext ; l'association ligne/valeur est celle de la mise en page : 0,3 / 0,2 / 0,5 / 1,0 ms typique ; 0,5 / 0,5 / 1,0 / 2,0 ms maximum).
- Données de la même fiche : « Rated Voltage 1000VDC » ; « Rated current 400A » ; « Breaking Capacity 1000 VDC/16 kA/20 µH » ; résistance interne « 50 µΩ (before breaking) » et « 10 MΩ (after disconnection) » ; « Weight < 300g » ; « Installation M8 screw (Copper busbar) » ; description : « Safety device to be triggered by ECU/BMS », « To disconnect the battery circuit in abnormal conditions such as short circuits or collisions ». Sécurité : « The connector has a shorting clip. If not fully inserted, it shorts the two pins to prevent accidental activation during transport, installation, or use. » — PRIMAIRE lu. => **le pouvoir de coupure annoncé est de 16 kA sous 1 000 V**, pour un objet de moins de 300 g.

### 2.3 Brevet Tesla US 9 221 343 B2 : « within milliseconds »
- Fait : le brevet décrit un commutateur pyrotechnique déclenché par le signal du système de retenue (airbag, SRS) ; il agit « within milliseconds ». Priorité 16/12/2011, dépôt 10/10/2012, délivré 29/12/2015, titulaire Tesla.
- Phrases (résumé par l'outil de lecture, seules les parties entre guillemets sont des citations) : « receipt of the supplemental restraint activation signal from the SRS » ; « within milliseconds » ; « arcing is more likely when using a pyrotechnic switch with the high voltage, high current conductor than it is with the low voltage, low current conductor ».
- **Nuance importante** : dans le mode de réalisation préféré du brevet, la charge pyrotechnique ne coupe PAS le câble haute tension : elle coupe le petit fil basse tension qui alimente la bobine du contacteur haute tension, qui s'ouvre alors (« severs a conductive pathway between LV battery 113 and switch 115 »). Une variante coupe directement une des lignes HT. Ce n'est donc pas, dans ce brevet, la guillotine sur le cuivre HT ; le brevet explique pourquoi : l'arc est plus probable avec une coupe directe d'un conducteur à forte tension et fort courant. (Brevet de 2011 ; ce que Tesla fabrique aujourd'hui est au bloc 5.)
- URL : https://patents.google.com/patent/US9221343B2/en — **PRIMAIRE lu** (brevet ; lecture par résumé de l'outil, formulations à vérifier avant citation mot à mot).

### 2.4 Qui donne l'ordre, et combien de temps après le début du choc
- Qui donne l'ordre : le calculateur d'airbag, sur les mêmes capteurs que les airbags — Autoliv (1.2) ; brevet Tesla (2.3) — PRIMAIRE.
- Délai entre le début du choc et l'ordre : voir bloc 9 (déclenchement des airbags). Le temps propre à la pyro (≈ 1 ms) s'y ajoute. **Aucune source lue ne donne le délai « début du choc → déclenchement du pyro fuse » pour une voiture donnée** : NON VÉRIFIÉ ; le film peut dire « l'ordre part sur le même signal que les airbags, la barre est tranchée environ une milliseconde plus tard ».

---

## 5. Qui en a (première partie)

### 5.1 Tesla : un dispositif pyrotechnique de coupure de batterie, confirmé par un rappel officiel
- Fait 1 (rappel officiel NHTSA 23V-434, 2023) : « Affected vehicles may have been manufactured with a non-functioning pyrotechnic battery disconnect. A pyrotechnic battery disconnect that does not isolate the HV battery when the vehicle detects certain collisions or specific issues within its HV battery may increase the risk of injury. » ; « Tesla Service will replace the pyrotechnic battery disconnect on affected vehicles with a replacement unit that has been tested and certified by the supplier to be functioning as designed. » ; « this repair takes approximately one hour ». => **les Model 3 et Model Y 2023 ont un « pyrotechnic battery disconnect » qui isole la batterie HT lors de certaines collisions ou de problèmes dans la batterie HT**. Concernés par le rappel : un très petit nombre de véhicules.
  - URL : https://static.nhtsa.gov/odi/rcl/2023/RCONL-23V434-3947.pdf — **PRIMAIRE lu** (modèle de courrier aux propriétaires joint au rappel 23V-434, lu via pdftotext).
  - Presse : Carscoops, juin 2023 : le dispositif « isolates the high voltage battery from other vehicle systems when it detects a collision or other specific issues » ; « a total of 26 vehicles may have gone to customers with the bad parts » ; fournisseur **Joyson Safety Systems** ; défaut découvert le 20 avril 2023 ; remède gratuit à partir du 15 août — https://www.carscoops.com/2023/06/tesla-recalls-model-3-and-y-evs-over-bad-battery-disconnects-that-protect-them-from-fires/ — SECONDAIRE lu (l'outil de lecture signale que l'article ne cite pas mot à mot le rapport Part 573).
- Fait 2 (Tesla Model S/X, pack) : un « pyro fuse » protège le pack d'une surintensité majeure ; description d'une communauté technique : « a current shunt, current sensing electronics, two small non-rechargeable long-life lithium batteries, and two 100 amp fuses in parallel » — teslatap.com (page non lue : erreur de certificat, texte vu seulement dans un résultat de recherche) — NON VÉRIFIÉ. Munro (démontage du Model 3, 2018) : « pyrotechnic fuse for the traction battery with a small lithium primary cell » déclenchable par un signal numérique du calculateur — résultat de recherche, page non lue — NON VÉRIFIÉ.
- Le texte exact de la mise à jour Tesla 2020–2021 (fusible piloté électroniquement, Model S/X « Plaid ») : **non trouvé** à ce stade (voir la suite).

### 5.2 Le guide d'intervention Tesla (Model S 2014) : ce que les pompiers doivent croire
- Fait : « Model S is equipped with a floor-mounted 400 volt lithium-ion high voltage battery. » ; « High voltage cabling (colored orange) » ; « WARNING: After deactivation, the high voltage circuit requires two minutes to deplete. » ; « WARNING: Regardless of the disabling procedure you use, ALWAYS ASSUME THAT ALL HIGH VOLTAGE COMPONENTS ARE ENERGIZED! Cutting, crushing or touching high voltage components can result in serious injury or death. » ; « The front trunk first responder cut loop consists of low voltage wires. Cutting this loop shuts down the high voltage system and disables the SRS and airbag components » ; « When cutting the loop, double cut to remove an entire section. »
- URL : https://digitalassets.tesla.com/tesla-contents/image/upload/2014_Model_S_Emergency_Response_Guide_en.pdf — **PRIMAIRE lu** (guide du constructeur ; recherche du mot « pyro » : aucune occurrence dans ce guide 2014).

---

## 4. Le danger sans lui, et ce que disent les règlements

### 4.1 Le risque, tel que l'écrit le NTSB (autorité américaine d'enquête sur les accidents), rapport de sécurité NTSB/SR-20/01, 13 novembre 2020
- Fait : « Fires in electric vehicles powered by high-voltage lithium-ion batteries pose the risk of electric shock to emergency responders from exposure to the high-voltage components of a damaged lithium-ion battery. » ; « The risks of electric shock and battery reignition/fire arise from the energy that remains in a damaged battery--known as stranded energy. »
- Fait : « The maximum voltages considered safe for humans are 50 or 60 volts DC and 30 volts AC. » ; « The high-voltage system of a BEV operates well above those thresholds (at 300 to 400 volts or more), creating a safety risk when the high-voltage battery is damaged in a crash and safety features such as protective covers and circuit fuses are defeated. » ; « If a crash damages the electrical isolation system, a person who touches the vehicle (or an exposed connector) can become part of the high-voltage circuit and suffer serious injury or death. »
- URL : https://www.ntsb.gov:443/safety/safety-studies/Documents/SR2001.pdf (rapport complet lu via pdftotext) et page de présentation https://ntsb.gov/safety/safety-studies/Pages/HWY19SP002.aspx — **PRIMAIRE lu**.
- **Ce que ce rapport montre aussi (honnêteté)** : il étudie quatre accidents/incendies de voitures électriques (Lake Forest, Mountain View, Fort Lauderdale, West Hollywood) ; dans le résumé, les risques cités pour les secours sont « electric shock, thermal runaway, battery ignition and reignition, and stranded energy » ; **je n'y ai trouvé aucun cas d'électrisation d'un secouriste** (recherche du mot « shock » : uniquement du risque théorique et des normes ; les blessures décrites sont des fumées/gaz toxiques et des blessures de remorqueur). Les enquêteurs ont, dans un de ces accidents (Model S, forte destruction du pack), mesuré des tensions de **3,3 à 46,9 V sur plusieurs modules et de 69,9 à 167,3 V sur les modules 1 à 5** : « The measurements confirmed that stranded energy remained in the high-voltage lithium-ion battery. » => **couper le pack du reste de la voiture n'efface pas l'énergie restée dans le pack lui-même.**
- Boucle de coupure : « Electric vehicles are often equipped with emergency cut loops, low-voltage wire loops that first responders can safely cut to disconnect the high-voltage system from the rest of the vehicle. » ; « Severing the cut loops will isolate high-voltage power inside the battery, thereby protecting the rest of the vehicle. However, cutting the loops will not remove energy from the high-voltage battery. » — même rapport — PRIMAIRE lu.

### 4.2 Les règlements après choc
- **UNECE R94 (choc frontal), § 5.2.8 « electric power train safety »** : au moins un des critères de protection contre le choc électrique après l'impact doit être respecté ; texte lu : « The voltages Vb, V1 and V2 of the high voltage buses shall be equal or less than 30 VAC or 60 VDC » ; « The total energy (TE) on the high voltage buses shall be less than 2,0 joules » ; « For protection against direct contact with high voltage live parts, the protection IPXXB shall be provided. » ; isolation « a minimum value of 100 Ω/V of the working voltage for DC buses » ; et : « If the vehicle has an automatic disconnect function, or device(s) that galvanically divide the electric power train circuit during driving condition, at least one of the following criteria shall apply » (au circuit déconnecté ou à chaque circuit séparé). URL (texte consolidé du règlement n° 94, journal officiel UE 2012/X0920(02)) : https://lexaris.de/book/version/documentflat/head/2048441 — **PRIMAIRE lu** (texte de la réglementation via une base juridique tierce ; la lecture signale que le délai de mesure n'apparaissait pas dans l'extrait).
  - => **la règle prévoit expressément le cas d'une « fonction de déconnexion automatique »** : c'est ce que fait un pyro fuse.
  - Délai de mesure après l'impact en R94 (« pas avant 10 s ni après 60 s » de mémoire) : **NON VÉRIFIÉ** ; ne pas l'utiliser.
- **GTR n° 20 (règlement technique mondial des véhicules électriques), tel que résumé par le NTSB** : « absence of high voltage (≤ 60 volts within 60 seconds of impact for high-voltage buses) ; low electrical energy (the total energy of impulse currents must be < 0.2 joules…) ; physical protection ; isolation resistance » — NTSB SR-20/01 (même PDF) — **PRIMAIRE lu** (le texte du GTR lui-même n'a pas été lu). Les voitures doivent donc respecter ≤ 60 V DC dans les 60 s qui suivent l'impact si elles choisissent le critère « absence de haute tension » ; **la règle n'impose pas un pyro fuse**, et ne dit pas « une milliseconde ».
- **FMVSS 305 (États-Unis)** : « Each high-voltage source must meet one of three requirements: (1) it must be electrically isolated from the vehicle's chassis; (2) its voltage must be below levels considered safe from electric shock hazards (30 volts AC or 60 volts DC); or (3) it must be enclosed in a physical barrier » ; « The standard does not specify a method for disconnecting the vehicle's high-voltage power. » — NTSB SR-20/01 — PRIMAIRE lu (via le NTSB). Chocs d'essai : frontal à jusqu'à 48 km/h, latéral 54 km/h, arrière 80 km/h (mêmes pages).
- **Ce que les secours ne doivent jamais croire** (guide Tesla, voir 5.2) : « Regardless of the disabling procedure you use, ALWAYS ASSUME THAT ALL HIGH VOLTAGE COMPONENTS ARE ENERGIZED! » — PRIMAIRE lu. Même avec le pyro fuse, les secours sont formés à traiter la voiture comme sous tension.

### 4.3 Cas réels d'électrisation après accident : dit honnêtement
- Lu : le NTSB documente le **risque** et les tensions résiduelles mesurées dans le pack, pas de blessure par choc électrique de secouriste dans ses quatre cas (4.1). Un résultat de recherche cite une base d'études d'accidents 1999–2013 où « no cases of fire or electric shock injury associated with hybrid vehicles were found in one database » — page non lue — NON VÉRIFIÉ.
- Conclusion à dire : **le danger d'électrisation est réel en théorie, la réglementation et les constructeurs le traitent comme tel, mais je n'ai pas lu de cas documenté d'un témoin ou d'un pompier électrisé par une voiture électrique accidentée.** À ne pas affirmer qu'« il y en a eu » ni qu'« il n'y en a jamais eu » : on dit « le risque existe, c'est pour ça que le fusible existe ».

---

## 7. Couleurs et repères vrais

### 7.1 Les câbles haute tension sont orange (c'est dans les règlements)
- Fait (Europe) : « Cables for high voltage buses which are not located within enclosures shall be identified by having an outer covering with the colour orange. » — UNECE R100, § 5.1.1.4.3 — https://www.mlit.go.jp/jidosha/un/UN_R100.pdf (texte du règlement, hébergé par le ministère japonais des transports) — **PRIMAIRE lu**.
- Fait (États-Unis) : « High-voltage cables and components must be identified with an orange covering. » — FMVSS 305 d'après NTSB SR-20/01 — PRIMAIRE lu.
- Fait (Tesla, guide d'intervention Model S 2014) : « High voltage cabling (colored orange) » ; « High voltage cabling is highlighted in dark orange in the following illustration. » — PRIMAIRE lu.
- Tension : « floor-mounted 400 volt lithium-ion high voltage battery » (Model S, 2014) ; « 300 to 400 volts or more » (NTSB) — PRIMAIRE lu.
- Isolation en service : « a minimum value of 100 ohms/volt of the working voltage for DC buses, and a minimum value of 500 ohms/volt of the working voltage for AC buses » — UNECE R100 § 5.1.3.1 — PRIMAIRE lu.
- Précision : R100 dit que ce qui est exigé en orange, ce sont **les câbles qui ne sont pas dans des boîtiers** (le cuivre dans le pack n'est pas orange). R100 précise aussi que sa partie I « does not cover post-crash safety requirements of road vehicles » (le post-choc est traité par R94/R95, ou FMVSS 305).

### 7.2 Où est le fusible
- Tesla Model S/X : dans le pack ; un « pyrotechnic fuse cover » à inspecter apparaît dans le manuel de service (résultat de recherche, page 403) — NON VÉRIFIÉ.
- Autoliv/Schurter : « Bolt-on », « M8 screw (Copper busbar) » — se visse sur la barre de cuivre — Schurter APO — PRIMAIRE lu.
- Position « dans le boîtier de jonction / BDU / penthouse Tesla » : **NON VÉRIFIÉ** (pas lu à la source).

---

## 3. Ce qu'il coupe, et pourquoi un fusible ou des contacteurs ne suffisent pas

### 3.1 Les chiffres de tension et de courant (fiches fabricants)
- **Autoliv** (gamme PSS, brochure 2025) : jusqu'à « 1 000 V / 3 500 J » (PSS-5), « 500 V / 1 800 J » (PSS-4), « 150 V / 120 J » ; courant en continu jusqu'à « 50 °C / 500 A » ; PSS-6 (normalement ouvert) : « Maximum short circuit current 5 kA / 5 ms + 600 A / 60 s », tension nominale « 450V » — https://www.autoliv.com/sites/autoliv/files/2025-05/PSSfolder_202503.pdf — PRIMAIRE lu.
- **Schurter APO** : 1 000 V DC, 400 A en continu (85 °C, barre de 120 mm²), pouvoir de coupure « 1000 VDC/16 kA/20 µH » — https://www.schurter.com/en/datasheet/typ_APO.pdf — PRIMAIRE lu.
- **Mersen Xp** : « the Xp series, which claims to be able to switch up to 12 kA at up to 1,000 V » (Mersen, rapporté par IEEE Power Electronics Magazine, sept. 2018) — voir 3.2 — SECONDAIRE lu.
- Tesla Model S/X : « 400 volt lithium-ion high voltage battery » (guide 2014) — PRIMAIRE lu ; les Model S/X récents et Plaid ont une batterie de 400 V environ : NON VÉRIFIÉ ici.
- **Le courant de court-circuit réel d'une batterie de traction** (chiffre en kA pour un pack précis) : **non trouvé dans une source lue**. Ordre de grandeur sourcé indirectement : les dispositifs sont conçus pour couper **5 à 16 kA** (Autoliv 5 kA, Mersen 12 kA, Schurter 16 kA). Dire « des milliers d'ampères » est cohérent avec ces fiches ; ne pas donner de chiffre « le pack débite X kA » sans source.

### 3.2 Pourquoi un fusible seul et un contacteur seul ne suffisent pas (IEEE Power Electronics Magazine, septembre 2018, Tom Keim, qui rapporte les travaux de Mersen)
- Fait : « The mainstream overcurrent protection solution for such a power source is the series combination of a mechanical contactor and a fuse. » ; pour un système de batterie automobile de **900 V et 500 A** : « the highest-rated contactor available from a major supplier of automotive grade contactors, combined with a fuse that is capable of interrupting the current available in the event of a solid short circuit, cannot clear all possible overloads. The contactor can interrupt up to 650 A. The fuse cannot be relied upon to interrupt anything under 1,200 A. Even at 1,200 A, the fuse could take up to 200 s to act. » => **entre 650 A et 1 200 A, personne ne coupe de façon fiable ; à 1 200 A le fusible peut mettre 200 secondes.**
- Fait : le principe : « The pyroswitch element is a robust copper conductor with a few areas of reduced cross section, assembled with a small explosive element. In normal operation, the conductor in the pyroswitch has far lower impedance than the fuse; essentially all of the current flows in the pyroswitch. When a fault is detected, the explosive is ignited, and the conductor in the pyroswitch element is very quickly removed from the circuit. » ; « In at least one case, the fault current begins to collapse within 300 [µ]s of the trigger event » (le symbole µ a disparu de l'extraction du PDF ; « 300 s » est évidemment « 300 µs » — à confirmer avant d'afficher) ; puis « essentially all of the current transfers to the fuse. The voltage across the place where the pyroswitch element formerly was is kept low by the presence of the fuse, and any arc there is quickly extinguished. »
  - => **dans les dispositifs « hybrides » (Mersen / Autoliv), la barre est tranchée en gardant un fusible en parallèle qui absorbe l'arc.** C'est la réponse à la « chambre d'extinction de l'arc » (question 1) : pour Mersen, c'est un fusible en parallèle qui éteint l'arc ; pour Autoliv, la brochure dit seulement « Arc extinguished, current interrupted » à 1 ms (mécanisme non détaillé). Ne pas décrire une chambre précise sans source.
- Fait : coupure préventive, sans surintensité : « it is desirable to perform a precautionary disconnect of the battery in cases where no overcurrent exists, e.g., a serious collision or the occurrence of a fire. » — c'est précisément le cas qui nous intéresse (le choc).
- URL : https://www.mersen.com/sites/mersen_ca/files/2018-11/AR-Developments-in-Pyrotechnic-Assisted-Fuses.pdf — **SECONDAIRE lu** (article de magazine IEEE qui résume un papier de Mersen ; chiffres du cas « 900 V / 500 A » = exemple de Mersen).
- Autre source, en résultat de recherche (non lue) : « In the event of a short circuit, the current exceeds the capacity of the breakers so quickly that contacts will become welded » (brevet « Electrical fuse… electrical traction network ») — NON VÉRIFIÉ ; « PyroFuses are used when conventional contactors cannot safely interrupt a fault current, such as during a battery short circuit, severe overcurrent or a crash, typically within just 2–5 ms » — résumé de page non lue — NON VÉRIFIÉ.
- **Formule honnête pour le film** : « Les contacteurs sont des interrupteurs mécaniques : faits pour ouvrir un courant normal, pas pour trancher un court-circuit ; le fusible ordinaire peut mettre de quelques secondes à plusieurs minutes selon le courant ; le pyro, lui, fait les deux : il tranche le cuivre en une milliseconde (Autoliv) et ne dépend pas du courant (Autoliv : « After triggering, disconnection takes place no matter the level of current »). »

---

## 5 (suite). L'ancêtre : BMW, la borne de batterie pyrotechnique (12 V)

- Fait : introduit en **1997** par BMW, c'est une borne de batterie 12 V, déclenchée par le calculateur d'airbag, qui sépare le câble du démarreur de la batterie lors d'un choc. Phrase du constructeur : « The battery safety terminal (BST) will avoid short circuiting of the high amperage starter circuit in an event of a collision. BST is actuated by the air bag control unit and uses a pyrotechnical charge to separate the starter cable from the battery in a crash. »
- URL : https://www.press.bmwgroup.com/canada/article/detail/T0032027EN/bmw-safety-innovation-timeline (chronologie des innovations de sécurité de BMW Canada) — **PRIMAIRE lu** (constructeur ; l'extrait lu donne « 1997 » et cette phrase).
- Autre : « Disconnecting the terminal prevents sparks from a short circuit - a major cause of fires after a crash. » ; « The explosive is linked to the car's airbag system. It is triggered when an airbag deploys. » — article de presse ancien (Dale Jewett), republié sur un blog le 29/03/2024 (« Beginning this autumn » = l'article date des années 1990, pas de 2024) — https://rvelectricity.substack.com/p/bmw-battery-terminal-reduces-fire — SECONDAIRE lu (republication ; date d'origine non précisée).
- **Dire** : « La borne pyrotechnique de batterie existe sur les BMW depuis 1997 » (PRIMAIRE) ; « le même principe, monté sur la haute tension, est le fusible pyro des voitures électriques ». Attention : ne pas dire « Sicherheitsbatterieklemme depuis la fin des années 1990 sur toutes les BMW » (« Most modern BMWs » dans les sources secondaires seulement).
- Autoliv 2011 : le « Pyro Safety Switch » (1,6 million d'unités prévues, « mainly on luxury models ») est la version commerciale chez les équipementiers du même principe — PRIMAIRE lu.

---

## 5 (suite 2). Tesla Model 3 / Model Y : les textes officiels

### 5.3 Rapport officiel du rappel NHTSA 23V-434 (Part 573, 19 juin 2023)
- Fait : « Tesla vehicles are equipped with a pyrotechnic battery disconnect that isolates the high voltage (HV) battery when the vehicle detects certain collisions or specific issues within its HV battery. » ; composant : « DISCONNECT,BATTERY,PYRO », pièce n° 1064689-00-J ; fabricant : **Joyson Safety Systems** (Valle Hermoso, Mexique) ; population : « Number of potentially involved : 26 », « Estimated percentage with defect : 2 % » ; cause : « During the supplier's introduction of a new assembly line of the pyrotechnic battery disconnect, the supplier may have inadvertently shipped to Tesla some non-functioning pyrotechnic battery disconnects. » ; « Tesla is not aware of any crashes, injuries, or deaths related to this condition. » ; Tesla a trouvé l'unité défectueuse le 20 avril 2023 « during the validation test conducted in support of the supplier's introduction of a new assembly line ».
- URL : https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V434-8034.PDF — **PRIMAIRE lu** (rapport déposé auprès du régulateur américain, lu via pdftotext).
- => **Faits solides pour le film** : (1) Tesla (Model 3 et Model Y 2023, au moins) a bien un « pyrotechnic battery disconnect » qui isole la batterie haute tension quand la voiture détecte certaines collisions ou certains problèmes dans la batterie ; (2) c'est un composant acheté (Joyson Safety Systems) ; (3) le seul défaut connu est un lot de 26 voitures où une pièce n'était pas fonctionnelle (repéré en test de validation de la ligne du fournisseur, aucun accident connu) ; (4) c'est un **rappel pour une pièce qui ne se déclenchait pas**, pas pour un déclenchement intempestif.

### 5.4 Guide d'intervention Tesla Model 3 (version française, © 2012–2019)
- Fait : « Model 3 est conçue pour couper l'alimentation haute tension dans tous les composants et câbles à l'extérieur de la batterie haute tension lorsqu'un airbag est déployé. » ; « Model 3 est équipée d'une batterie haute tension au lithium-ion de 400 V montée au plancher. » ; « Les câbles haute tension apparaissent en orange. » ; « Avertissement : Après désactivation, le circuit haute tension met deux minutes à se décharger. » ; « Avertissement : Quelle que soit la technique de coupure utilisée, PARTEZ TOUJOURS DU PRINCIPE QUE TOUS LES COMPOSANTS HAUTE TENSION SONT SOUS TENSION ! La coupure, l'écrasement ou le contact avec des composants haute tension peut entraîner des blessures graves, voire mortelles. » ; boucle : « La boucle de coupure d'urgence est un faisceau basse tension. Si la boucle de coupure d'urgence est sectionnée, le circuit à haute tension en dehors de la batterie haute tension s'arrête et le dispositif de retenue suppl[émentaire] et les composants des airbags sont désactivés. » ; « effectuez une coupe double pour retirer une section entière de câbles » ; unité de commande des airbags (SRS) : « N'appuyez pas sur l'unité de commande du système de retenue supplémentaire dans les dix secondes qui suivent le déploiement d'un airbag ou d'un prétendeur. »
- URL : https://digitalassets.tesla.com/tesla-contents/image/upload/Model_3_Emergency_Response_Guide_fr.pdf — **PRIMAIRE lu** (lu via pdftotext ; le mot « pyro » n'y figure pas : le guide parle de « couper l'alimentation haute tension à l'extérieur de la batterie lorsqu'un airbag est déployé », sans dire comment).
- Important : **c'est la phrase exacte à citer** pour « l'airbag et la coupure partent sur le même événement », dans la bouche du constructeur — mais la phrase dit « à l'extérieur de la batterie » : le pack, lui, reste chargé.

### 5.5 Autres constructeurs vendus en France (Renault, Stellantis, VW, Hyundai/Kia, BMW électriques…)
- **Aucun document constructeur lu ne dit que tel modèle précis (hors Tesla) a un fusible pyrotechnique haute tension.** Les équipementiers parlent de leurs ventes sans nommer de voitures : Bosch (2019) « fournissait ce type de système aux constructeurs automobiles, mais n'a pas précisé quels véhicules » (motorsactu.com, article repris du communiqué Bosch — SECONDAIRE lu) ; Joyson Safety Systems : conçu pour « the full & hybrid electric vehicle market » (CLEPA 2022 — PRIMAIRE lu).
- BMW : borne pyrotechnique 12 V depuis 1997 (voir plus haut), pas le pack haute tension.
- Les guides Hyundai (KONA Electric, IONIQ Electric) cités par une recherche parlent de « safety plug » à retirer et de deux minutes d'attente ; je n'ai **pas** lu ces guides à la source : NON VÉRIFIÉ.
- Formule honnête pour le film : « Tesla le confirme dans un rappel officiel ; les équipementiers (Autoliv, Joyson, Bosch…) en fabriquent pour l'ensemble de l'industrie. » Ne pas écrire « Renault / Peugeot / Volkswagen en ont un ».

### 5.6 Joyson Safety Systems : le fournisseur du Model 3 / Y (prix CLEPA 2022)
- Fait : le « Pyrotechnic Battery Disconnect » « irreversibly disconnects the high voltage, high current flow from the electric vehicle battery to the surrounding electric vehicle systems » ; déclenché par « the battery management system or the vehicle crash control module » ; « safely manages the resulting plasma arc generated from severing voltages in excess of 460 Volt Direct Current and 12 kiloampere (kA), in under 1 millisecond » ; « small enough to fit either within the battery management system or externally » ; trois buts : protéger occupants et secouristes de l'électrocution, protéger l'électronique des surtensions, réduire la probabilité d'un feu par emballement thermique.
- URL : https://www.clepainnovationawards.eu/clean-and-sustainable/63-pyrotechnic-battery-disconnect-for-electric-vehicles (dossier de candidature de Joyson au prix de l'innovation de CLEPA, publié le 13 octobre 2022) — **PRIMAIRE lu** (auto-déclaration du fabricant).
- Autre : un résultat de recherche (marklines) indique qu'une variante coupe « in 10 milliseconds » — NON VÉRIFIÉ (page non lue).

---

## 6. À usage unique, remplacement, coût, déclenchements intempestifs

- **Irréversible** : « Disconnects the circuit safely, reliably & irreversibly. » (Autoliv, brochure 2025 — PRIMAIRE lu) ; « irreversibly disconnects… » (Joyson/CLEPA — PRIMAIRE lu) ; Mersen : « an electrically triggered, fast-acting, one-time disconnect » (IEEE Power Electronics Magazine — SECONDAIRE lu).
- **Se remplace après un choc** : sur la Tesla Model S 2015, la base de données de la réparation carrosserie I-CAR (position constructeur Tesla) liste « Pyrotechnic battery disconnect fuse [IGNITER,BATTERY INTERRUPT] » à remplacer après le déploiement d'un prétensionneur ou d'un airbag ; « Do not replace the fuse until confirming that the vehicle is supported (not salvage) and will be repaired; until then, use the temporary pyrotechnic fuse provided by Tesla » — https://rts.i-car.com/srs-8540.html — **PRIMAIRE lu** (fiche de pièces du constructeur relayée par I-CAR ; le texte cité vient de la page, lue via l'outil de lecture). La pièce est classée avec les pièces de retenue (airbags, prétensionneurs).
- **La voiture redémarre-t-elle après ?** Non écrit tel quel dans une source lue. Ce qui est établi : la pièce « isole la batterie haute tension » (NHTSA) et doit être remplacée. Déduction raisonnable, non sourcée : voiture immobilisée jusqu'au remplacement. => dire « il faut le remplacer avant de rouler à nouveau » (sourcé par I-CAR), pas « la voiture ne redémarre plus ».
- **Coût** (témoignage d'un propriétaire, Model S 2015 85D, juillet 2024, remplacement préventif parce que « a High Voltage Pyro fuse had a rated lifespan that was getting close to its end » après l'alerte « Battery fuse requires replacement soon, schedule service ») : **175 $ la pièce + 135 $ de main-d'œuvre (0,54 h) = 310 $** — https://joeybabcock.me/blog/tesla/battery-fuse-requires-replacement-2015-tesla-model-s-85d-cost-service-experience/ — SECONDAIRE lu (blog d'un particulier ; une seule voiture, un seul garage). Un résultat de recherche donne une fourchette « 200 à 1 100 $ » selon l'accès au fusible — NON VÉRIFIÉ.
- **Déclenchements intempestifs** : **aucun cas documenté lu.** Le seul incident public vérifié (rappel 23V-434) est l'inverse : un lot de 26 voitures avec une pièce qui ne se déclenchait pas (5.3). Un fil de forum « Model Y blown pyro fuse » (teslamotorsclub.com) existe mais la page était interdite à la lecture : NON VÉRIFIÉ. À dire : « un seul fusible défectueux sur 26 voitures, repéré avant tout accident », pas « ça se déclenche tout seul ».
- Durée de vie : l'alerte « Battery fuse requires replacement soon » ci-dessus indique que la pièce a une durée de vie nominale (dans le cas Tesla Model S, de l'ordre de huit ans d'après un résultat de recherche — NON VÉRIFIÉ ; la cause supposée est la pile au lithium de sa propre électronique — NON VÉRIFIÉ sauf teslatap, page non lue).

---

## 8. Les idées reçues : ce qui est exact et ce qui serait abusif

1. **« Dans une voiture électrique, la première explosion du choc te protège. »** 
   - Exact (sourcé) : une charge pyrotechnique sépare la batterie du reste de la voiture sur le même ordre que les airbags — Autoliv (« same crash sensors as the airbags »), Tesla (« couper l'alimentation haute tension dans tous les composants et câbles à l'extérieur de la batterie haute tension lorsqu'un airbag est déployé »), NHTSA 23V-434. 
   - Abusif : « te protège » sans nuance. (a) Le NTSB a mesuré 69,9 à 167,3 V dans des modules d'un pack écrasé : l'énergie reste dans le pack. (b) Tesla dit encore aux secours de partir du principe que tout est sous tension. (c) La règle R94 n'impose pas de pyro fuse : un constructeur peut respecter l'exigence autrement. (d) Le dispositif agit sur « certain[es] collisions » (NHTSA), pas sur tous les chocs. (e) Il protège d'abord contre les câbles arrachés/court-circuits qui restent reliés au pack ; je n'ai pas lu de statistique de vies sauvées.
2. **« Ce n'est pas un fusible qui fond, c'est une guillotine. »** 
   - Exact : « Mechanical severing of a busbar » par « a plastic piston » poussé par la pyrotechnie (Autoliv) ; « a robust copper conductor with a few areas of reduced cross section, assembled with a small explosive element » (Mersen/IEEE). Un fusible ordinaire fond sous l'effet du courant (et peut mettre 200 s à 1 200 A dans l'exemple Mersen). 
   - Nuance : dans les versions « hybrides » (Mersen), un vrai fusible en parallèle finit le travail et éteint l'arc. Chez Autoliv, la brochure ne décrit pas l'extinction de l'arc au-delà de « Arc extinguished, current interrupted » à 1 ms. Le mot « guillotine » est une image ; ne pas dire « une lame » (c'est un piston plastique qui frappe).
3. **« La voiture sacrifie sa propre alimentation. »** 
   - Exact : pièce irréversible, à remplacer après un déploiement (I-CAR / Tesla). 
   - Abusif : dire « la voiture se détruit » ou « elle ne redémarre plus » sans source (déduction raisonnable : voir 6).
4. **« L'airbag et le fusible partent sur le même ordre. »** 
   - Exact pour Tesla (guide, brevet, I-CAR : remplacement après pré-tensionneur ou airbag) et pour la conception Autoliv (« activated by the same crash sensors as the airbags »). 
   - Abusif : « sur tous les modèles » ; « le même allumeur que l'airbag » (non dit par les sources lues).
5. **Phrase de chute possible, entièrement sourcée** : « Dans une voiture électrique, ce qui te sauve en premier, ce n'est pas l'airbag : c'est une explosion de la taille d'un doigt qui sépare la batterie de tout le reste. » — à ajuster : « de la taille d'un doigt » n'est pas sourcé (les boîtiers font 43 × 70 × 21 mm à 79 × 47 × 47 mm, < 300 g : « de la taille d'un paquet de cartes » est sourcé par Autoliv/Schurter). « en premier » n'est pas sourcé non plus : l'airbag part à 10–30 ms (Bosch) et le fusible dans la milliseconde qui suit l'ordre : « en même temps » est la formule juste.

---

## 9. Chiffres d'accident utilisables pour une scène

- **Décision de l'airbag** : « In just ten milliseconds … the trigger algorithm interprets the sensor data » ; « Within 30 milliseconds, the airbag is fully inflated » — Bosch, communiqué du 4 novembre 2020 — https://www.bosch-presse.de/pressportal/de/en/deploys-faster-than-a-person-can-blink-220689.html — **PRIMAIRE lu**.
  - => une chronologie utilisable : choc (T0) → ~10 ms décision du calculateur (Bosch) → ordre aux airbags (et, chez Autoliv/Tesla, au fusible) → +0,35 ms énergie pyro libérée → +0,5 ms piston sur la barre → +0,75 ms barre tranchée et arc → +1 ms courant coupé (Autoliv). **Les deux séries de chiffres viennent de deux constructeurs et de deux systèmes : ne pas les additionner comme s'il s'agissait d'une mesure unique sur une voiture.** Le film peut dire : « le calculateur décide en une dizaine de millisecondes ; la pyro coupe en environ une milliseconde » (deux sources distinctes, bien nommées).
- **Chocs d'homologation (États-Unis, FMVSS 208 d'après NTSB SR-20/01)** : frontal contre barrière jusqu'à 48 km/h (30 mph) ; latéral 54 km/h ; arrière 80 km/h — PRIMAIRE lu (via NTSB). Europe : Euro NCAP frontal à 64 km/h (ancien décalé 40 %), 50 km/h (barrière mobile depuis 2020) — résultat de recherche non lu à la source : NON VÉRIFIÉ ; la page Euro NCAP lue ne donnait pas les vitesses.
- **Durée d'un choc frontal (≈ 100–150 ms)** : « finishes almost in 0.15 seconds » vu dans un résultat de recherche (étude universitaire non lue) — NON VÉRIFIÉ. Bosch ne donne pas cette durée (la page le dit explicitement).
- Unité de commande du SRS (airbags) : alimentation de secours d'environ 10 secondes — Tesla (guide Model 3 FR, guide Model S 2014) — PRIMAIRE lu.

---

## 10. L'appel au commentaire et la vraie consigne

- **Question de commentaire (proposition)** : « Après un accident en électrique, tu touches la voiture… ou tu t'éloignes ? » ou « Dans une voiture qui vient de se couper la batterie, qu'est-ce qui reste sous tension ? » (réponse : le pack lui-même, NTSB).
- **Consigne sourcée pour un témoin (France)** : 
  - Sapeurs-pompiers de France : « protéger, alerter, secourir » ; « Toujours prévenir les secours en composant le 18 ou le 112 » ; ne pas déplacer les victimes sauf danger imminent — https://www.pompiers.fr/accident-de-la-circulation/ — **PRIMAIRE lu** (organisation des sapeurs-pompiers). **Cette page ne dit rien sur les véhicules électriques** (la lecture le confirme explicitement) ; elle conseille « couper le contact et débrancher la batterie des véhicules accidentés » (consigne générique, pas adaptée à un témoin devant une électrique : ne pas la citer).
  - Aucune page officielle française lue (pompiers.fr, Sécurité routière — la page n'a pas pu être lue, contenu non rendu) ne donne de consigne spécifique « voiture électrique » à un témoin. Un résultat de recherche cite « Pour votre sécurité, ne pas toucher les câbles, les connecteurs et les modules haute tension. Les composants sous haute tension sont de couleur orange… » (source non identifiée, probablement un manuel de constructeur) — NON VÉRIFIÉ.
  - Ce que disent les sources lues, qui justifient la consigne : le NTSB protège « occupants, bystanders interacting with injured persons, and emergency responders » (risque de choc si l'isolation est endommagée) ; Tesla, pour les secouristes formés : « PARTEZ TOUJOURS DU PRINCIPE QUE TOUS LES COMPOSANTS HAUTE TENSION SONT SOUS TENSION ».
  - => **Consigne qu'on peut afficher en la présentant comme du bon sens appuyé sur ces sources, pas comme texte officiel** : « Tu n'ouvres pas le capot, tu ne touches pas aux câbles orange ni à ce qui pend sous la voiture, tu appelles le 18 ou le 112, tu ne sors une personne que s'il y a un danger immédiat (fumée, flammes). » À faire valider par Merwan avant de la présenter comme une consigne officielle.

<!-- FIN DES BLOCS DE FAITS : sections finales ci-dessous -->

---

## Simplifications possibles (a)

1. « Une petite explosion pousse un piston qui coupe la barre de cuivre de la batterie, en environ une milliseconde » — vrai pour Autoliv (0,35 / 0,5 / 0,75 / 1 ms), Schurter (1,0 ms typique, 2,0 ms max), Joyson (< 1 ms). Pour les autres fabricants, « quelques millisecondes ».
2. « Même signal que les airbags » — vrai pour Autoliv (communiqué 2011), Tesla (guide Model 3 : « lorsqu'un airbag est déployé »), brevet Tesla (SRS). Ne pas généraliser à « toutes les voitures électriques ».
3. « La batterie est séparée du reste de la voiture, mais elle reste chargée » — NTSB (167 V mesurés dans un pack écrasé) et Tesla (« à l'extérieur de la batterie »).
4. « Un fusible ordinaire met parfois très longtemps » — exemple Mersen à 900 V / 500 A : à 1 200 A, jusqu'à 200 secondes. À présenter comme « un exemple d'ingénieurs de chez Mersen », pas comme une loi.
5. L'arc : « l'arc est éteint à 1 ms » (Autoliv) ; « un fusible en parallèle l'éteint » (Mersen, pour leur version hybride). Ne pas décrire une chambre d'extinction.
6. Le prix : « de l'ordre de 300 $ » pour le remplacement (un témoignage de propriétaire Tesla, 2024) — à ne pas afficher comme un prix de marché.

## À NE PAS DIRE (b)

1. « Tous les modèles électriques ont un fusible pyrotechnique » — non sourcé hors Tesla (rappel NHTSA) ; pour les autres, NON VÉRIFIÉ.
2. « La batterie est déchargée / sans danger après le choc » — faux : le NTSB mesure 69,9 à 167,3 V dans les modules d'un pack écrasé ; Tesla : « partez toujours du principe que tous les composants haute tension sont sous tension ».
3. « Le fusible empêche tout incendie » — faux : le NTSB étudie des incendies de batterie après choc et des ré-allumages ; le fusible coupe le circuit, pas la chimie des cellules.
4. « Les voitures électriques électrocutent les secours / les témoins » — aucun cas documenté lu (4.3) ; le NTSB parle d'un risque, pas de cas. À l'inverse : ne pas dire « ça n'arrive jamais ».
5. « Les voitures électriques prennent plus feu que les thermiques » — non traité et non sourcé ici ; ne pas l'affirmer.
6. « Un airbag et un fusible partent avec le même allumeur » — non sourcé.
7. « Le fusible se déclenche tout seul, c'est fréquent » — aucun cas documenté ; le seul incident vérifié est une pièce qui ne se déclenchait pas (26 voitures, 2023).
8. « Le fusible coupe en 0,35 ms » / « en 0,5 ms » — ce sont les repères intermédiaires du schéma Autoliv : la coupure du courant est à 1 ms ; « moins de 0,5 ms » (communiqué Autoliv/Mersen) est NON VÉRIFIÉ.
9. « Le fusible est la première chose qui part dans un accident » — la décision d'airbag (≈ 10 ms, Bosch) précède l'ordre ; ne pas hiérarchiser.
10. « La règle impose un fusible pyrotechnique » — faux : R94 et FMVSS 305 fixent un résultat (≤ 60 V DC, énergie, isolation, GTR 20 : ≤ 60 V dans les 60 s) et prévoient une « automatic disconnect function » ; FMVSS 305 « does not specify a method for disconnecting the vehicle's high-voltage power ».
11. « La voiture explose » : le dispositif est une micro-charge contenue dans un boîtier de 40 à 320 g (Autoliv) ; ne pas faire dire « explosion » à propos de la batterie.
12. Tout chiffre de courant de court-circuit précis d'un pack (« 20 000 A ») sans source : non trouvé.
13. « La mise à jour Tesla 2020–2021 annonçait un fusible piloté électroniquement sur Model S/X Plaid/Model 3 » — le texte exact n'a **pas** été trouvé (voir « Ce qui n'a pas été trouvé »). Un résumé de recherche (teslatap.com, page non lue) dit seulement que les Model S/X produites après février 2021 « use advanced current protection ».

## Trois chiffres qui claquent, parfaitement sourcés (c)

1. **Une milliseconde.** Du signal du calculateur au courant coupé : 0 → 0,35 → 0,5 → 0,75 → 1 ms (Autoliv, brochure 2025, PRIMAIRE lu). 
2. **16 000 ampères sous 1 000 volts, dans un boîtier de moins de 300 grammes** (Schurter APO : « 1000 VDC/16 kA/20 µH », « Weight < 300g », PRIMAIRE lu) — pour tenir un pouvoir de coupure comparable, Joyson annonce 12 kA sous 460 V en moins d'une milliseconde (CLEPA 2022, PRIMAIRE lu).
3. **167 volts : ce qui reste dans une batterie écrasée** — le NTSB mesure jusqu'à 167,3 V sur des modules d'un pack de Model S accidentée : « The measurements confirmed that stranded energy remained in the high-voltage lithium-ion battery » (NTSB SR-20/01, PRIMAIRE lu). (Alternatives : 1 200 A / 200 s pour le fusible seul — SECONDAIRE ; 26 voitures rappelées, une seule pièce défectueuse — PRIMAIRE.)

## Ce qui n'a pas été trouvé (honnêteté)

- Le texte exact de la mise à jour Tesla 2020–2021 sur le fusible pyrotechnique « piloté électroniquement » (Model S/X Plaid, Model 3) : non trouvé. Le brevet Tesla US 9 221 343 (2011) et le guide Model 3 (« couper l'alimentation haute tension… lorsqu'un airbag est déployé ») sont les meilleures sources lues.
- Le courant de court-circuit d'une batterie de traction précise (kA) ; la durée d'un choc frontal ; les vitesses Euro NCAP à la source ; le délai de mesure R94 ; l'emplacement exact du fusible dans la Tesla (pack / boîtier de jonction) ; les modèles non-Tesla ; une consigne officielle française pour les témoins devant une voiture électrique ; un cas documenté d'électrisation d'un secouriste ou d'un témoin ; un cas de déclenchement intempestif en roulage.

## URL lues (d)

Contenu lu et exploité :
1. https://www.autoliv.com/press/strong-growth-automatic-battery-disconnects-new-vehicles-1212493
2. https://www.autoliv.com/sites/autoliv/files/2025-05/PSSfolder_202503.pdf
3. https://www.schurter.com/en/datasheet/typ_APO.pdf
4. https://static.nhtsa.gov/odi/rcl/2023/RCONL-23V434-3947.pdf
5. https://static.nhtsa.gov/odi/rcl/2023/RCLRPT-23V434-8034.PDF
6. https://www.carscoops.com/2023/06/tesla-recalls-model-3-and-y-evs-over-bad-battery-disconnects-that-protect-them-from-fires/
7. https://digitalassets.tesla.com/tesla-contents/image/upload/2014_Model_S_Emergency_Response_Guide_en.pdf
8. https://digitalassets.tesla.com/tesla-contents/image/upload/Model_3_Emergency_Response_Guide_fr.pdf
9. https://patents.google.com/patent/US9221343B2/en
10. https://www.mlit.go.jp/jidosha/un/UN_R100.pdf
11. https://lexaris.de/book/version/documentflat/head/2048441 (et https://lexaris.eu/library/tableofcontents/2048441)
12. https://ntsb.gov/safety/safety-studies/Pages/HWY19SP002.aspx
13. https://www.ntsb.gov:443/safety/safety-studies/Documents/SR2001.pdf
14. https://www.mersen.com/sites/mersen_ca/files/2018-11/AR-Developments-in-Pyrotechnic-Assisted-Fuses.pdf
15. https://www.press.bmwgroup.com/canada/article/detail/T0032027EN/bmw-safety-innovation-timeline
16. https://rvelectricity.substack.com/p/bmw-battery-terminal-reduces-fire
17. https://joeybabcock.me/blog/tesla/battery-fuse-requires-replacement-2015-tesla-model-s-85d-cost-service-experience/
18. https://rts.i-car.com/srs-8540.html
19. https://www.clepainnovationawards.eu/clean-and-sustainable/63-pyrotechnic-battery-disconnect-for-electric-vehicles
20. https://motorsactu.com/bosch-developpe-une-solution-eliminant-le-risque-dincendie-apres-un-crash-de-vehicule-electrique/
21. https://www.bosch-presse.de/pressportal/de/en/deploys-faster-than-a-person-can-blink-220689.html
22. https://www.pompiers.fr/accident-de-la-circulation/

Lues mais sans contenu utile : https://www.imt.uoradea.ro/auo.fmte/… (étude Radu et al. sur le délai de déploiement : aucune des phrases cherchées) ; https://www.euroncap.com/en/car-safety/the-ratings-explained/adult-occupant-protection/frontal-impact/ (page sans les vitesses) ; https://www.securite-routiere.gouv.fr/chaque-situation-sa-conduite/accident-de-la-route (contenu non rendu).

Tentées sans succès (403, 404, délai dépassé, certificat) : eaton.com (pyro fuse), teslatap.com, patents.justia.com/patent/9221343, mass.gov (guide Tesla Model S 2021), service.tesla.com, digitallibrary.un.org, hmr.araiindia.com, joysonsafety.com (429), latribuneauto.com, teslamotorsclub.com, ownersmanual.kia.com, cdn.euroncap.com, motorsport.org.nz (Model 3 ERG, trop gros).

Résultats de recherche utilisés comme pistes seulement (marqués NON VÉRIFIÉ dans le texte) : Mersen/Autoliv (2020), teslatap.com, Daicel, Eaton, Sensata, Hyundai, base d'accidents 1999–2013, délai R94.

# 022 — Les sécurités de la batterie d'un téléphone : dossier de faits

Recherche du 2026-10-13 · budget : 30 requêtes sur 30

Niveaux : **A** source primaire lue · **B** secondaire sérieuse · **C** faible. « Résumé de recherche, non lu » = vu seulement dans le résumé du moteur. Bilan honnête : peu de A. Les pages Samsung (communiqué du 23/01/2017), Apple (guide de sécurité) et l'INRS ont soit expiré, soit renvoyé des pages tronquées ; presque tout le reste est du B ou du « résumé non lu ». Aucune source primaire de fabricant de séparateur (Asahi Kasei, Celgard, Entek) n'a été lue.

## 1. Ce qu'il y a dans la batterie (cellule « pouch »)

- Anode : graphite sur feuille de cuivre ; cathode : oxyde métallique de lithium (LiCoO2 cité) sur feuille d'aluminium ; boîtier souple en film trois couches (polypropylène / aluminium / polyéthylène). — Niveau C : résumé de recherche, non lu (brevets et blogs). Épaisseur de feuille citée : cuivre ≈ 10 µm, aluminium ≈ 20 µm (exemples de brevets, pas des valeurs de téléphone).
- Séparateur monocouche en PE de téléphone/tablette : « typiquement 10–30 µm » ; 25,4 µm courant, jusqu'à 12 µm pour les plus fins. Citation : « typically 10–30 μm thick ». Niveau B (Volta Foundation, page lue) — https://volta.foundation/lithium-ion-battery-separators-and-their-role-in-safety/
- Séparateur mesuré dans une étude : film PE ≈ 16 µm, fusion à 132 °C. Niveau C : résumé de recherche, non lu (j.ioffe.ru).
- Électrolyte inflammable : l'INRS parle d'« électrolytes et d'électrodes combustibles ou inflammables ». Niveau A- (page INRS lue, extrait par le lecteur de page) — https://www.inrs.fr/metiers/Energie/utilisation-batteries-lithium/utilisation-batteries-lithium-risques.html
- Électrolyte = LiPF6 dans un mélange de carbonates organiques : exemple de brevet seulement. Niveau C.
- Enroulée ou empilée : **non trouvé** pour les téléphones.
- Cheveu : sources web médiocres, 50–120 µm selon les pages, « 70–100 µm » le plus cité ; aucune source primaire (NIST non confirmé). Niveau C. La comparaison tient comme ordre de grandeur (séparateur ≈ 4 à 8 fois plus fin qu'un cheveu) mais elle est à dire avec « environ ».

## 2. Le séparateur « à fermeture » (shutdown)

- Principe : en chauffant, le polymère fond, les pores se ferment, les ions ne passent plus, le courant s'arrête. Niveau B (résumé de recherche, brevets) et Volta (page lue).
- Tri-couche PP/PE/PP : « the PE layer melts at 135°C and closes the pores » ; le PP fond à 165 °C et garde la structure. Niveau B (Volta, lu).
- Fermeture à environ 130 °C (brevet : « shutdown around 130°C »), 135 °C pour le PE, ≈ 140 °C selon un autre brevet. Fourchette 130–140 °C. Niveau C/B (brevets, résumé de recherche, non lus).
- Limite : un brevet de sécurité note que 130 °C peut être trop tard car des dangers sérieux commencent vers 100 °C ; l'effondrement du séparateur est cité à 80–120 °C dans une revue (résumé non lu, auteurs non identifiés). Niveau C.
- Idéalement l'écart entre température de fermeture et de rupture est grand pour retarder l'emballement. Niveau B (Volta, lu).
- Revue de référence à lire en vrai : Lingappan, Lee, Passerini, Pecht, « A comprehensive review of separator membranes in lithium-ion batteries » (seul le titre vu).
- Est-il présent dans les téléphones ? Le séparateur PE microporeux « pour téléphones et tablettes » est décrit par Volta (B). Qu'il ait réellement la fonction de fermeture dans chaque téléphone : **non vérifié** (aucun fabricant lu).
- Vraie sécurité ou dernier recours ? Conclusion de l'agent, pas une source : c'est une barrière interne passive qui agit à environ 130 °C, après le circuit de protection, avant l'effondrement du séparateur ; elle n'arrête pas une chaleur qui continue de monter (ses limites sont décrites ci-dessus). Un court-circuit interne mécanique (perforation, électrode qui se plie) ne passe pas toujours par une montée graduelle de la température.

## 3. Circuit de protection (PCM / BMS)

- Architecture : un circuit intégré de protection pilote deux transistors MOSFET (surcharge / décharge profonde) ; une thermistance NTC fournit la température. Niveau C (résumé de recherche, non lu ; sources sur modules 18650 génériques, pas des téléphones).
- Seuils génériques : coupure de surcharge « between 4.25 V and 4.35 V depending on the IC » ; décharge profonde vers 2,4–2,45 V ; réponse à la surcharge en 15–30 ms ; surintensité à plusieurs niveaux (surintensité 1, surintensité 2, court-circuit). Niveau C. **Pas de seuil propre à un modèle de téléphone trouvé.**
- Battery University (page lue) : les circuits de protection Li-ion sont « mandatory » ; fusible, PTC (résistance qui monte avec la chaleur, réversible), CID (coupe-circuit à pression ≈ 1 000 kPa, irréversible), évent. Niveau B — https://batteryuniversity.com/article/bu-304b-safety-circuits-for-modern-batteries . Ces éléments décrits sont ceux des cellules cylindriques ; la page ne dit rien des cellules pouch.
- Évent ou coupe-circuit mécanique dans une cellule de téléphone : **non trouvé**. Une cellule pouch n'a pas de boîtier rigide : sa poche gonfle puis s'ouvre (raisonnement de l'agent, non sourcé).

## 4. L'emballement thermique

- Séquence décrite par une revue de 2026 (résumé de recherche, non lu) : rupture de l'interface anode/électrolyte, rétrécissement du séparateur, décomposition de l'électrolyte, libération d'oxygène par la cathode. Niveau C.
- Températures citées (résumés non lus) : décomposition de la couche SEI à partir de ≈ 60–130 °C selon les cellules (une autre source : « above 90 °C ») ; effondrement du séparateur 80–120 °C ; décomposition de l'électrolyte ≈ 200 °C ; décomposition de la cathode 130–200 °C avec dégagement d'oxygène ; vapeurs inflammables qui s'enflamment à l'évent. Niveau C. Les fourchettes varient selon la chimie et l'état de charge : à ne pas donner comme une échelle unique.
- Déclencheurs (INRS, page lue) : défaut de fabrication ; surcharge, choc, « chargeur non adapté ». Niveau A-/B. Perforation, chaleur extérieure : la page ne les cite pas ; le recoupement vient de la liste du lecteur (Samsung : électrodes qui se plient dans le coin, soudure défectueuse — voir 5).
- Futura-sciences (B) : « Les incendies de batteries brûlent à plus de 1 000 °C » — chiffre non sourcé dans l'article, à ne pas dire.

## 5. Galaxy Note 7

- Rappel américain de la CPSC, 15 septembre 2016 : environ 1 million d'appareils ; 92 signalements de surchauffe aux États-Unis, dont 26 brûlures et 55 dégâts matériels (« fires in cars and a garage »). Niveau A (page CPSC lue) — https://cpsc.gov/Recalls/2016/Samsung-Recalls-Galaxy-Note7-Smartphones
- Mondial : environ 3,06 millions d'appareils vendus, plus de 2,7 millions retournés en décembre 2016 ; 35 cas mondiaux cités par Samsung au 1er septembre. Niveau C/B (MobileSyrup, SamMobile ; résumé de recherche, non lu). Le chiffre « 2,5 millions » circule mais ne correspond pas à la source la plus fiable trouvée ; « 96 % retournés » est un taux, pas un nombre d'incidents.
- Arrêt de la production et des ventes le 11 octobre 2016 (résumé de recherche, non lu). Niveau C.
- Interdiction en avion aux États-Unis (DOT/FAA/PHMSA), en vigueur le 15 octobre 2016, originaux et remplaçants, en cabine, en soute et en fret. Citation du ministre Foxx : « even one fire incident inflight … puts many lives at risk ». Niveau B (résumé de recherche, non lu) — https://airlinegeeks.com/2016/10/15/dot-ban-on-samsung-note-7-takes-effect/
- Cause annoncée par Samsung le 23 janvier 2017 (conférence à Séoul, avec UL, Exponent, TÜV Rheinland ; plus de 200 000 appareils et 30 000 batteries testés). Niveau B (GSMArena, ARN, résumé de recherche, non lu ; communiqué Samsung expiré trois fois, jamais lu) :
  - batteries d'origine : le coin supérieur droit de la poche laissait trop peu de place à l'électrode négative ; les électrodes pouvaient se plier et provoquer un court-circuit ; le séparateur était trop mince dans certains échantillons (UL, selon la presse) ;
  - batteries de remplacement (autre fournisseur) : défaut de fabrication, soudure à ultrasons de la languette positive mal contrôlée ; certaines sans ruban isolant.
  - Les sources divergent sur la part conception / fabrication des batteries d'origine.
- « Les deux défauts » : validés par le résumé de recherche, mais le texte exact de Samsung est à relire avant de le citer mot pour mot.

## 6. Charger la nuit

- Apple (guide de sécurité iPhone, résumé de recherche, texte exact non lu) : « Don't sleep on a device, power adapter, or wireless charger, or place them under a blanket, pillow, or your body when it's connected to a power source. » Aussi : zone bien ventilée. Niveau B (la formulation vient des reprises de presse ; page non lue en entier) — https://support.apple.com/guide/iphone/important-safety-information-iph301fc905/ios
- Apple, charge optimisée (résumé de recherche, non lu) : l'iPhone met la charge en pause à 80 % et finit près de l'heure où on débranche, après ≥ 14 jours d'apprentissage ; si l'habitude est irrégulière, il charge à 100 % sans pause ; si la batterie est trop chaude, le logiciel peut limiter la charge au-dessus de 80 %. Niveau B — https://support.apple.com/en-us/108055
- Samsung : « débranchez à 100 % plutôt que de laisser branché toute la nuit » — résumé de recherche d'un article tiers, non lu. Niveau C. Pas de mot pour mot Samsung.
- London Fire Brigade (citations anciennes, 2015 et incidents) : « It's dangerous to charge your phone under your pillow as it could overheat and set bedding alight. » ; « best not to leave your phone plugged in overnight » ; « Never cover chargers or charging devices ». Niveau B/C (résumé de recherche, non lu ; pas de page LFB actuelle trouvée).
- Fondation MAIF (via Futura-sciences, page lue) : déconseille de charger sous l'oreiller ou sur un canapé ; conseille de charger dans une pièce de jour avec détecteur de fumée, en restant à proximité. DGCCRF : débrancher dès la charge terminée. Niveau B — https://www.futura-sciences.com/maison/actualites/electricite-smartphone-trottinette-ordi-ces-erreurs-charge-finissent-urgences-123504/
- Batterie gonflée (Futura citant l'INRS, page lue) : arrêter la charge si gonflée, chaude, fuyante ou odorante ; l'isoler à l'écart des autres batteries ; recycler via un collecteur ; pompiers en cas d'emballement ; pas d'eau avant d'avoir isolé la batterie et prévenu les secours. Niveau B. Côté Apple/Samsung : résumé d'un guide tiers (éteindre, ne pas charger, ne pas percer, apporter à un centre). Niveau C.

## 7. Chiffres d'incendies

- France : **aucune statistique nationale isolant les incendies dus aux téléphones ou chargeurs n'a été trouvée** (résumé de recherche, non lu ; Que Choisir ancien). Les chiffres disponibles sont des sondages d'assureurs :
  - Assurance Prévention : 10 % des Français ont déjà eu un incident de batterie lithium-ion ; le téléphone est l'appareil le plus concerné, 46 % des incidents. Niveau C (sondage, 1 000 personnes, résumé non lu).
  - MACSF : 10,7 % ont vécu un accident, dont 21 % avec départ de feu ; 66 % chargent la nuit. Niveau C (sondage).
  - Futura/Fondation MAIF : 15,7 appareils à batterie lithium-ion par foyer. Niveau B (page lue).
- Un incendie à Blaisy-Haut (Côte-d'Or, avril 2025) serait parti d'un téléphone en charge sur un lit, selon MACSF : non confirmé. Niveau C.
- Royaume-Uni (QBE, assureur, réponses de 42 services d'incendie sur 49, résumé non lu) : 1 760 incendies liés au lithium-ion en 2025, soit 4,8 par jour, +147 % en trois ans ; ≈ 45 % impliquent des appareils de consommation courante (téléphones, tablettes, batteries externes — mélangés) ; vélos électriques : 520 incendies, ≈ 30 %. Niveau C. Pas de part « téléphone seul ».
- Pays-Bas, 2017-2018 : téléphones ≈ 14 % des incendies de batteries (résumé de recherche, non lu). Niveau C.
- Les services d'incendie britanniques n'ont pas de catégorie « chargeur de téléphone » dans leur système (Lincolnshire, réponses FOI) : 1 incendie de maison à Essex depuis 2009 ; 4 à Lincolnshire entre 2019 et 2023. Niveau B, très partiel.

## 8. Idées reçues

- « Il ne faut pas le laisser branché toute la nuit » : nuancé. Un téléphone qui reste à 100 % reste branché sans que la cellule soit « surchargée » (le circuit coupe la charge) ; le risque est la chaleur (couverture, housse, surface molle) et le temps à haute tension, qui use la batterie. DGCCRF/LFB disent de débrancher à la fin ; Apple dit surtout de ne pas couvrir. Niveau C pour la partie mécanisme (explication de l'agent).
- « Il peut exploser » : aucune source lue ne mesure la probabilité ; les cas sourcés sont des défauts (Note 7) ou des conditions de charge anormales.
- 80 % : Battery University (cité de seconde main) : baisser la tension de pointe de 0,10 V par cellule peut doubler le nombre de cycles ; 4,10 V ≈ 85 % de charge, 600–1 000 cycles contre 300–500 à pleine charge. Niveau C (lu en résumé, non vérifié). Il s'agit de durée de vie, pas de sécurité. Apple propose d'ailleurs une limite de charge entre 80 et 100 % (iPhone 15 et suivants).

## 9. Ce qu'un ingénieur reprocherait à une vulgarisation

(Jugement de l'agent, non sourcé.)
- Le séparateur ne ferme pas « tout » : si la chaleur continue, il se rétracte ou fond et c'est le court-circuit. Dire « dernière barrière interne », pas « sécurité qui garantit ».
- Les températures varient avec la chimie et l'état de charge : jamais « à 130 °C, tout s'arrête ».
- Un court-circuit interne soudain (électrode pliée, perforation) peut démarrer sans montée graduelle : fermeture du séparateur et circuit de protection n'y peuvent rien.
- Dire « une feuille plus fine qu'un cheveu » est vrai ; dire « une seule feuille » est faux (anode, cathode, séparateur sont empilés ou enroulés en dizaines de tours).
- Ne pas confondre cellule pouch (téléphone) et cellule cylindrique (évent, CID, PTC) ; ne pas attribuer à la première les dispositifs de la seconde.
- Le circuit de protection est dans le bloc batterie, séparé du chargeur : ne pas dire « le téléphone ».

## À dire tel quel

- Le séparateur est un film de polymère microporeux, de l'ordre de 10 à 30 micromètres dans un téléphone (Volta, B).
- Dans un séparateur PE/PP, la couche de polyéthylène fond vers 135 °C et ferme ses pores : les ions ne passent plus, le courant s'arrête (Volta, B).
- L'électrolyte est inflammable (INRS).
- Le rappel américain de septembre 2016 : environ un million de Note 7, 92 signalements de surchauffe, 26 brûlures, 55 dégâts matériels (CPSC, A).
- Interdit en avion aux États-Unis depuis le 15 octobre 2016 (DOT, B).
- Apple : ne pas dormir sur l'appareil, l'adaptateur ou le chargeur, ni les placer sous une couverture, un oreiller ou son corps pendant la charge (B ; texte exact à relire sur la page Apple).
- Fondation MAIF : ne pas charger sous l'oreiller ni sur un canapé ; plutôt dans une pièce de jour avec détecteur de fumée (B).
- Batterie gonflée, chaude ou qui sent : on arrête la charge et on l'isole (INRS via Futura, B).

## Ordres de grandeur (à dire avec « environ »)

- Séparateur : 10 à 30 µm ; cheveu : 50 à 120 µm (donc « plusieurs fois plus fin qu'un cheveu »).
- Fermeture des pores : environ 130 à 140 °C selon la matière (PE).
- Note 7 : environ 3 millions vendus, plus de 2,7 millions retournés en décembre 2016 (B/C).
- Note 7 aux États-Unis : environ un million rappelés (CPSC).
- Royaume-Uni : environ 5 incendies liés au lithium-ion par jour en 2025 (QBE, mélange de tous appareils).
- Un Français sur dix a déjà eu un incident de batterie lithium (sondage assureur, C).
- Charge optimisée : pause à 80 % la nuit, selon Apple.

## À ne pas dire

- « Le séparateur est la sécurité qui sauve le téléphone » : c'est une barrière passive, avec des limites ; elle agit trop tard si la chaleur continue.
- « Tous les téléphones ont un évent / un coupe-circuit mécanique » : non trouvé pour les cellules pouch.
- Un seuil de tension précis du circuit de protection d'un modèle de téléphone (4,35 V, 2,4 V…) : sources génériques seulement.
- « 2,5 millions de Note 7 rappelés » ou « 96 incidents » : chiffres non étayés ; « 96 % » est un taux de retour.
- « Les incendies de batterie brûlent à plus de 1 000 °C » : non sourcé.
- Une statistique française d'incendies de téléphones : il n'en existe pas dans ce qu'on a trouvé ; les chiffres français sont des sondages.
- Rapprocher les chiffres de trottinettes et vélos de ceux des téléphones.
- « Apple/Samsung interdisent de laisser branché la nuit » : Apple dit de ne pas couvrir ; Samsung, en source tierce seulement.
- La probabilité qu'un téléphone « explose ».
- La cause exacte du Note 7 « mot pour mot » tant que le communiqué Samsung n'est pas relu.

## Trois faits-accroche

1. Entre les deux électrodes de ta batterie, un film de plastique de quelques micromètres, plus fin qu'un cheveu, empêche tout contact ; si ça chauffe, il fond et ferme ses pores vers 130 °C (B).
2. 15 octobre 2016 : le Galaxy Note 7 est interdit dans tous les avions américains ; en septembre, un million de téléphones rappelés, 92 surchauffes, 55 dégâts matériels (A/B).
3. Apple dit de ne pas mettre son téléphone en charge sous un oreiller ou une couverture (B) — alors que 66 % des Français chargent la nuit (sondage MACSF, C).

## Non trouvé

- Communiqué Samsung du 23 janvier 2017 (expiré trois fois) : cause à relire en primaire.
- Texte exact de la page de sécurité Apple et de la page Samsung sur la charge.
- Sources de fabricants de séparateurs (Asahi Kasei, Celgard, Entek) et de cellules.
- Épaisseur et construction exactes (enroulée / empilée) de la cellule d'un téléphone.
- Seuils précis du circuit de protection d'un smartphone ; présence d'un évent / CID dans une pouch.
- Statistiques françaises de départs de feu dus aux téléphones ; texte actuel des pompiers français (SDIS, ministère) sur le téléphone sous l'oreiller.
- Part des téléphones parmi les incendies de batteries (en dehors de sondages et d'une étude néerlandaise de 2017-2018 non lue).
- Revue de température de l'emballement thermique (Feng et Ouyang) : auteurs non identifiés dans le résumé.
- Source primaire fiable pour le diamètre d'un cheveu.

## URL lues

Lues (page récupérée) :
- https://volta.foundation/lithium-ion-battery-separators-and-their-role-in-safety/
- https://cpsc.gov/Recalls/2016/Samsung-Recalls-Galaxy-Note7-Smartphones
- https://batteryuniversity.com/article/bu-304b-safety-circuits-for-modern-batteries
- https://www.futura-sciences.com/maison/actualites/electricite-smartphone-trottinette-ordi-ces-erreurs-charge-finissent-urgences-123504/
- https://www.inrs.fr/metiers/Energie/utilisation-batteries-lithium/utilisation-batteries-lithium-risques.html (lecture partielle : rien sur températures, étapes, séparateur)

Non lues (résumé de recherche seulement) : news.samsung.com (communiqué, infographie), support.apple.com (guide de sécurité 118481 vide ; guide iPhone sécurité tronqué ; 108055), airlinegeeks.com, gsmarena.com, anandtech.com, mobilesyrup.com, qbeeurope.com, london-fire.gov.uk, macsf.fr, quechoisir.org, patents.google.com, et divers.

Échecs de lecture : news.samsung.com (3 expirations), anandtech.com (connexion refusée), cpsc.gov (1re URL 404), support.apple.com/en-us/118481 (hors sujet).

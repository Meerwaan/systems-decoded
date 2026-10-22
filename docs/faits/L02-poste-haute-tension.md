# L02 — Poste haute tension : dossier de faits

Recherche du 2026-10-19 · budget : 30 requêtes sur 30

Niveaux : **A** source primaire lue · **B** secondaire sérieuse · **C** faible, ou résumé de moteur non lu.
Ce qui est lu en texte intégral : le communiqué RTE du 5 mars 2026 (Gap, PDF extrait avec pdftotext), la fiche INRS ED 4210 (champs électromagnétiques, PDF extrait). Tout le reste est un **résumé de moteur ou de lecteur de page, non lu à la source** (niveau C sauf mention). Les textes de la NF C 18-510 et de l'INRS ED 6127 n'ont **pas** pu être lus (payants ou illisibles).
Verdict d'ensemble : le contexte RTE, le SF6 / sans SF6, les étapes de consignation (nom des opérations) et les accidents d'induction (États-Unis) tiennent. **Les distances de la NF C 18-510, le délai de réenclenchement, les tensions induites en kV, les temps de coupure en ms et l'accident français sont les trous.**

## 1. Le réseau et le poste 400 kV

- **Chiffres RTE** : réseau de 63 000 à 400 000 V, « près de 100 000 km de lignes aériennes, 7 000 km de lignes souterraines, 2 900 postes électriques en exploitation ou co-exploitation, une cinquantaine de lignes transfrontalières », 37 interconnexions, 9 500 salariés. Niveau **A** (communiqué RTE, bas de page). https://assets.rte-france.com/prod/public/2026-03/2026-03-06-cp-travaux-heliportes-gap.pdf
- **Ancien chiffre** : l'INRS (ED 4210, 2016) donne ≈ 100 000 km aériens, 5 000 km souterrains, 2 700 postes. Les chiffres bougent : prendre le plus récent de RTE. Niveau **A**. https://inrs.fr/dam/jcr:988a5c52-bf22-428f-b6a2-8731f49aa21f/ed4210.pdf
- **Nombre de postes 400 kV seulement** : non trouvé.
- **Champ électrique sous une ligne 400 kV** : ≈ 5 000 V/m au sol à la verticale du câble (hauteur des câbles de 35 à 54 m dans l'exemple INRS) ; induction magnétique au plus de l'ordre de 30 µT. Niveau **A** (ED 4210). Utile pour « l'air vibre ».
- **Composants d'un poste** (schéma de la page « Poste électrique ») : câble de garde, transformateur de tension, sectionneur, disjoncteur, transformateur de courant, parafoudre, transformateur de puissance, jeu de barres, sectionneur de mise à la terre. Niveau **B** (Wikipedia, bandeau « sources insuffisantes »). Les types de sectionneurs (pantographe, rotatif), le parafoudre à oxyde de zinc, l'autotransformateur 400/225 kV et le réseau de terre maillé n'ont **pas** été trouvés dans une source lue : non trouvé. https://fr.wikipedia.org/wiki/Poste_électrique
- **Histoire du poste du Chesnoy** (Vernou-la-Celle-sur-Seine, 77), poste 400 kV EDF : construction du transformateur 1958-1964, propriétaire EDF 1958-2000 puis RTE, site de 26 hectares réaménagé et « camouflé » en 2008-2013. Niveau **B** (Inventaire du patrimoine, Île-de-France). La date de la première ligne 400 kV française n'est pas confirmée : **non trouvé**.

## 2. Les distances

- **Zones (INRS ED 6127, citée par un site de formation)** : zone 0 d'investigation (n'existe pas dans un local à risque spécifique) ; zone 1 voisinage simple (limitée à la face interne de la clôture du local) ; zone 2 voisinage renforcé HT ; zone 3 travaux sous tension HT ; zone 4 voisinage renforcé BT. Sigles : DLI, DLVS, DLVR, DMA. Niveau **B/C**. https://travail-industrie.com/blog/videos/distances-zones-habilitation-electrique-nf-c18-510
- **Valeurs pour 400 kV** : un site de formation donne, pour HTB 400 kV, **DLI 5 m, DLV 4 m, DMA 3 m**. Non vérifié sur la norme ni l'INRS : niveau **C**. Un autre texte du même site dit « HTB ≥ 1 m à 5 m selon tension ». **Les valeurs exactes de la NF C 18-510 : non trouvées** (norme payante).
- **Distance de protection de l'arrêté du 9 décembre 1988** (installations) : 5,30 m pour une tension nominale supérieure à 225 kV sans dépasser 400 kV ; pour la HTB, une valeur en centimètres égale à la tension nominale en kV (U cm) dans le résumé lu. Ce n'est pas la DMA de la NF C 18-510. Niveau **C** (résumé de moteur, via INERIS/SSTIE).
- **Claquage de l'air** (arc sans contact, kV/cm) : **non trouvé** dans une source lue. Ordre de grandeur de physique générale, non sourcé ici : ≈ 30 kV/cm pour de l'air sec en champ uniforme, bien moins en pointe. À sourcer avant d'écrire.

## 3. Le disjoncteur HTB

- **Principe** : l'air ne convient pas (tenue diélectrique trop faible, désionisation trop lente : l'arc se rallume après chaque passage par zéro) ; le SF6 a une tenue diélectrique élevée et une constante de temps de désionisation très faible. En autosoufflage, l'arc chauffe le volume de soufflage, la pression monte et, au passage par zéro, le gaz se détend et souffle l'arc. Niveau **C** (résumé de moteur, brevets).
- **Piège** : l'arc doit être refroidi d'environ 20 000 K à moins de 2 000 K en « quelques centaines de microsecondes » pour que les contacts tiennent la tension de rétablissement. Le gaz capte les électrons libres et forme des ions négatifs peu mobiles. Niveau **B** (Wikipedia « Sulfur hexafluoride circuit breaker », lu via un lecteur de page). https://en.wikipedia.org/wiki/Sulfur_hexafluoride_circuit_breaker
- **Temps de coupure** : « 2 à 2,5 périodes » (**B**, même page). À 50 Hz, 2 périodes = 40 ms (calcul, pas une source). Valeur RTE : non trouvée.
- **Pouvoir de coupure** : « jusqu'à 63 kA » pour les appareils haute performance (**B**, même page) ; GE a présenté en 2022 un prototype 420 kV / 63 kA sans SF6 (**C**, communiqué GE). Valeur typique des disjoncteurs RTE en service : non trouvée.
- **Histoire** : Vitaly Grosse (AEG) dépose le premier brevet sur le SF6 comme milieu de coupure en 1938 ; Westinghouse (Lingal, Browne, Strom) dépose indépendamment en juillet 1951 ; premier disjoncteur HT au SF6 construit par Westinghouse en **1956** : 5 kA sous 115 kV, **six chambres de coupure en série par pôle** ; en 1959 : 41,8 kA sous 138 kV (37,6 kA sous 230 kV). Niveau **B** (même page). Rôle de Merlin Gerin dans le SF6 : **non trouvé**.
- **Le SF6 comme gaz à effet de serre** : « 23 500 fois » le CO2 (PRG, valeur citée par GE), durée de vie jusqu'à 3 200 ans, le transport d'électricité représente ≈ 80 % de l'usage mondial. Niveau **C** (communiqués GE). SINTEF cite 24 300 fois (**C**). Les deux chiffres coexistent (rapport GIEC différent) : dire « plus de vingt mille fois ». https://www.gevernova.com/news/press-releases/ge-devoile-le-1er-disjoncteur-g3-420-kv-sans-sf6-pour-postes-isoles-au-gaz
- **Alternatives, avec RTE** : Siemens Energy a testé avec succès un prototype de disjoncteur extérieur 420 kV sans SF6 à technologie du vide (3AV2FI 420 kV), « solution industrialisée installée par RTE (France, poste de Marsillon) et Statnett (Norvège) au second semestre 2026 » ; projet européen MISSION piloté par SINTEF. Niveau **B/C**. https://www.sintef.no/en/latest-news/2025/new-sf-free-circuit-breakers-to-be-tested-in-both-france-and-norways-transmission-systems/ · RTE a aussi commandé du matériel au gaz g3 de GE (GIS 145 et 420 kV, disjoncteurs 145 kV), **C**. Le chiffre « 50 kg de SF6 = 1 215 t de CO2 » pour un disjoncteur 400 kV de 1986 est sorti dans une réponse mais **n'a pas été retrouvé** à la vérification : **C, à ne pas dire**.

## 4. Le sectionneur

- **Ce que dit la littérature trouvée** : rien de lu à la source sur « le sectionneur ne coupe pas en charge » ni sur la « coupure visible » (la page Wikipedia du poste ne le dit pas). Principe de métier (non sourcé ici, à confirmer) : un sectionneur n'a pas de pouvoir de coupure, il se manœuvre à vide, après le disjoncteur ; sa raison d'être est l'isolement visible et sûr, le disjoncteur pouvant rester collé ou être commandé par erreur. Niveau **C**. Types (pantographe, rotatif, semi-pantographe) : non trouvé.
- **Liste RTE des organes de coupure 400 kV** (type : sectionneur ou disjoncteur, sans caractéristiques) : jeu de données data.gouv.fr « Organes de coupure du réseau de transport électrique 400 kV ». Existence confirmée par le moteur, non ouvert. **C**. https://www.data.gouv.fr/datasets/organes-de-coupure-du-reseau-de-transport-electrique-400-kv

## 5. La consignation (NF C 18-510)

- **Les cinq opérations** : séparation de toute source d'énergie ; condamnation en position d'ouverture des organes de séparation ; identification de la partie d'ouvrage concernée ; vérification d'absence de tension (VAT) ; mise à la terre et en court-circuit, immédiatement après la VAT. L'ordre peut varier selon l'énergie. Niveau **B/C** (documents de formation, d'une préfecture et de sites de formation citant la norme ; le texte de la norme n'a pas été lu). Mise à la terre et en court-circuit « obligatoire en HT, recommandée en BT » (site de formation, **C**).
- **Qui fait quoi** : le chargé de consignation (BC en BT, **HC** en HT) exécute tout ou partie de la consignation ; il ne fait que des opérations de consignation et de déconsignation ; il signe l'attestation de consignation. Le chargé de travaux (**B2V**, **H2V**) dirige les opérations d'ordre électrique avec une équipe d'exécutants et assure la sécurité collective ; le V indique le voisinage renforcé. Niveau **B/C** (fiche Inserm d'après ED 6127 de 2015, MSA, formation). https://pro.inserm.fr/wp-content/uploads/2020/08/Inserm_DrhBCPR_FicheSynthetique_HabilitationElectr.pdf
- **Structure du symbole** : 1er caractère = domaine de tension (B = BT/HTA ≤ 1 000 V alternatif, H = HTA/HTB), 2e = type d'opération, 3e lettre optionnelle (V voisinage, T sous tension, N nettoyage, X spécial). **C**, cadre à confirmer par ED 6127. Le symbole exact exigé pour consigner en HTB (HC, domaine de tension HTB inclus) : **non trouvé**.
- **Attestations** : une attestation de consignation (versions provisoire et générale) existe ; ses mentions obligatoires : non trouvées.
- **Cadenas personnels, boîte de consignation multi-cadenas, avis de fin de travail** : **non trouvé** dans une source lue.
- **VAT** : appareil conforme CEI 61243. Pour la HT, la CEI 61243-1 (détecteurs capacitifs, pensés pour ne pas détecter les tensions induites et permettre la MALT) ; la partie 3 vise la BT. Niveau **C**. La « perche détectrice » HTB et la règle « vérifier le détecteur avant et après » : **non trouvées** (l'autotest en BT existe, **C**).
- **Les 5 + 5 règles** : l'organisme suisse ESTI constate que « très souvent » ces règles n'ont pas été appliquées dans les accidents (**B**, rapport ESTI 2005-2014). Les 5 + 5 règles sont celles de la sécurité suisse : à ne pas mélanger avec la procédure française.

## 6. Mise à la terre, court-circuit, induction

- **Pourquoi « et en court-circuit »** : source lue en secondaire : sur une ligne parallèle à une ligne en service, la tension induite résulte d'un couplage capacitif, ohmique et inductif, à calculer séparément puis à additionner vectoriellement (ABB, **C**) ; en inductif, V2 = jMωI1 : le courant de la ligne en service et la longueur du parallélisme font monter la tension (cours universitaire, **C**) ; des mises à la terre dirigent les tensions parasites vers le sol (Stantec, **C**).
- **Ordres de grandeur en kV** : **non trouvés**. Le moteur dit « plusieurs kV à plusieurs dizaines de kV » d'après sa mémoire, **non vérifié** : ne pas l'écrire.
- **Pourquoi des deux côtés de la zone** : la norme de l'IEEE 1048 couvre le dimensionnement des mises à la terre de protection qui doivent tenir le courant d'induction magnétique et le courant de défaut (**C**, résumé). Pas de source RTE.
- **Foudre lointaine** : non trouvé dans une source lue.
- **Réenclenchement automatique** : **non trouvé pour RTE**. Sources génériques (**C**) : 70 à 85 % des défauts monophasés sur des lignes 500 kV s'éteignent d'eux-mêmes ; il faut en général 1 à 2 s de désionisation de l'arc secondaire ; une recommandation indienne : réenclenchement monophasé rapide avec un temps mort de 1 s en 400 et 220 kV ; 300 ms est un chiffre de distribution (ne pas utiliser). Neutralisation pendant les travaux : non trouvé.
- **Tensions de pas et de contact** : définitions du RGIE belge (élévation du potentiel de terre UE ; tension de pas US pour un pas de 1 m) (**C**). Le réseau de terre maillé est « habituellement un maillage de câbles de cuivre enterrés, de piquets ou de puits de terre » dont le contrôle est une obligation réglementaire (impédance globale, équipotentialité, mesures de pas et de contact au besoin) (**C**, Techniques de l'ingénieur / thèse L2EP). Courant de défaut en kA, gravier : non trouvés.

## 7. Travaux sous tension (TST) en 400 kV

- **RTE (communiqué du 5 mars 2026, niveau A)** : neuf salariés spécialisés ont réalisé en une semaine des interventions sur **seize lignes** autour de Gap et du lac de Serre-Ponçon, **sans interrompre l'alimentation**, depuis une **nacelle suspendue sous hélicoptère** : réparer des brins de câbles abîmés (**deux minutes en moyenne** par opération), poser des balises aéronautiques. « Chaque technicien porte un vêtement conducteur, véritable cage de Faraday, qui le protège du champ électrique. » « RTE est le seul gestionnaire de réseau électrique en Europe à maîtriser les travaux sous tension à l'aide d'une nacelle héliportée » ; hélicoptères et drones évitent jusqu'à **1 400 jours d'interruption de lignes par an**. Le communiqué ne donne **pas** la tension de ces seize lignes : ne pas dire « 400 kV » sans le vérifier.
- **225 kV, nacelle isolante (RTE Méditerranée, 2025, niveau C)** : prélèvement de câble sous tension près d'Avignon avec une nacelle à bras isolant atteignant 41 m. Pas du 400 kV.
- **Travail au potentiel à 400 kV** : technique, tenue de la combinaison, durée : **non trouvés** dans une source lue.

## 8. Accidents documentés

**Aucun cas français trouvé** (EPICEA, INRS, presse, enquête) : le 400 kV est pauvre en accidents publiés. Ce qui est trouvé vient des États-Unis, niveau **C** (résumés de moteur, rapports OSHA / MIOSHA non lus en entier) :

- **Michigan, MIOSHA, cas 533** : un technicien de poste est tué par la tension induite d'une ligne de **345 kV** voisine en retirant la mise à la terre d'une ligne hors tension ; la méthode normale est d'enlever d'abord le fil côté « chaud » puis côté acier. https://oem.msu.edu/images/MIFACESummariesOfMIOSHAInspections/Construction/Case533.pdf
- **Virginia Power, 1987** : après une réparation, un apprenti retire à la main l'une des deux pinces de terre ; l'induction des lignes parallèles met le conducteur sous tension ; il est électrocuté.
- **Georgia Power, 1995** : lignes de 115 à 230 kV en parallèle d'une ligne de 115 kV hors tension ; un ouvrier déplace une extrémité de la terre vers la nacelle, l'autre extrémité reste reliée à une phase mise sous tension par induction.
- **OSHA** : une ligne de 138 kV rendue sous tension par induction d'une ligne de 345 kV parallèle ; un ouvrier électrocuté, un autre choqué en nacelle.
- Ce que ça a changé : non trouvé.

## 9. L'arc électrique

- **Température** : environ 19 000 °C (35 000 °F) (Fluke, **C**, repris par une fiche VDP). L'INRS range le risque électrique en contact, court-circuit et arc ; effets : brûlures, lumière qui lèse les yeux, onde de pression, projections de métal en fusion. Niveau **C/B**. La plage « 10 000 à 20 000 °C » attribuée à l'INRS : **non confirmée**. https://www.inrs.fr/risques/electriques.html
- **Cuivre** : « la vaporisation du cuivre multiplie son volume d'environ 67 000 fois » (site de formation, **C**) : chiffre classique de la littérature de l'arc, non confirmé ici.
- **IEEE 1584 / NFPA 70E** : domaine de validité de l'IEEE 1584-2018 « environ 208 V à 15 kV » : **hors du 400 kV**, donc aucune énergie incidente chiffrable pour un poste 400 kV dans ce dossier.

## 10. Entrée historique

Aucun fait historique fort sur l'origine des règles de consignation n'a été trouvé. Seuls faits utilisables : le SF6 comme milieu de coupure (1938, 1951, 1956 : voir §3) ; le poste du Chesnoy, 400 kV d'EDF dès 1958-1964 (§1).

## Les dix faits les plus forts pour l'image et l'histoire

1. **Westinghouse, 1956 : le premier disjoncteur haute tension au SF6 coupe 5 kA sous 115 kV avec six chambres de coupure en série par pôle.** Une belle vue éclatée d'un interrupteur géant, et l'idée que la coupure est un combat (B).
2. **L'arc doit être refroidi d'environ 20 000 K à moins de 2 000 K en quelques centaines de microsecondes** pour que le disjoncteur tienne la tension (B). Toute la coupure en un plan.
3. **Un disjoncteur HTB coupe un courant de défaut allant jusqu'à 63 kA en 2 à 2,5 périodes (≈ 40 à 50 ms)** (B, le calcul en ms est de nous).
4. **La nacelle héliportée de RTE : le technicien en cage de Faraday, suspendu au-dessus de câbles sous tension, répare un brin en deux minutes en moyenne**, sans couper le courant ; RTE seul en Europe (A). Le bonus wow du film.
5. **Sous une ligne 400 kV, le champ électrique au sol est d'environ 5 000 V/m, câbles à 35 à 54 m** (A, INRS). Le poste vibre avant qu'on y touche.
6. **Le réseau : près de 100 000 km de lignes aériennes, 2 900 postes** (A, RTE) : l'échelle dont chaque poste est un nœud.
7. **Une ligne consignée peut être remise sous tension par sa voisine, sans aucun interrupteur fermé** : couplage capacitif, ohmique et inductif des lignes parallèles (C pour la physique, B pour les accidents) : c'est le climax, et la raison du « court-circuit ».
8. **Les accidents réels sont des accidents de mise à la terre retirée** : un technicien tué par l'induction d'une ligne de 345 kV en retirant une terre ; un apprenti qui enlève une des deux pinces à la main (MIOSHA, Virginia Power 1987) (C, États-Unis). La mise à la terre est ce qui tient, et l'ordre de dépose compte.
9. **Les cinq opérations de la consignation : séparer, condamner, identifier, vérifier l'absence de tension, mettre à la terre et en court-circuit** (B/C) : l'ossature du film.
10. **Le SF6 : un gaz qui réchauffe plus de 20 000 fois plus que le CO2 (23 500 selon GE), et RTE installe en 2026 un disjoncteur 420 kV à vide à Marsillon** (B/C). Un fil rouge pour la chute : la meilleure protection a été un gaz presque indestructible, on la remplace par du vide.

## Trous

- **Les distances de la NF C 18-510 en HTB à 400 kV** (DLI, DLVS, DLVR, DMA) : seulement un site de formation (5 m, 4 m, 3 m, niveau C) et l'arrêté de 1988 (5,30 m, installations). Norme payante, ED 6127 illisible. À faire vérifier par un électricien habilité avant d'afficher un chiffre.
- Le texte de la norme : noms officiels exacts, attestations, boîte de consignation, cadenas, symbole exigé en HTB, avis de fin de travail.
- **La perche détectrice HTB et la règle de contrôle du détecteur avant / après.**
- **Tension induite en kV** sur une ligne 400 kV consignée, en ordre de grandeur sourcé.
- **Réenclenchement automatique RTE** : délai, et neutralisation pendant les travaux.
- Foudre lointaine : surtensions sur une ligne consignée.
- **Claquage de l'air** (kV/cm) sourcé.
- **Types de sectionneurs**, rôle du sectionneur et de la coupure visible, parafoudres ZnO, autotransformateurs 400/225 kV, réseau de terre maillé (courants de défaut, gravier) : aucune source lue.
- Nombre de postes 400 kV ; date de la première ligne 400 kV ; origine historique des règles de consignation ; rôle de Merlin Gerin.
- **Pouvoir de coupure et temps de coupure des disjoncteurs RTE réellement en service** (spec RTE).
- **Un accident français** (EPICEA, rapport d'enquête) : aucun trouvé.
- Tension et durée du travail au potentiel à 400 kV ; tension des lignes de Gap.
- Arc flash à 400 kV : hors du domaine de l'IEEE 1584.
- Mesure : trois PDF (INRS, Schneider CT154 = disjoncteurs BT, hors sujet) lus avec pdftotext ; le téléchargement du document RTE « annexe techniques 400 kV » a échoué (403).

## À ne pas dire

- « La distance de sécurité à 400 kV est de X mètres » : les valeurs 5 m / 4 m / 3 m viennent d'un site de formation non vérifié ; l'arrêté de 1988 donne 5,30 m pour les installations, pas pour la DMA. Ne pas les afficher sans vérification.
- « Un sectionneur ne coupe pas en charge » ou « le disjoncteur peut rester collé » : pas de source lue ; à utiliser comme explication de métier seulement après relecture par un électricien.
- Tout chiffre de **tension induite en kV**, de **délai de réenclenchement RTE**, de **kV/cm** de l'air, de **température d'arc** attribué à l'INRS (la plage 10 000 à 20 000 °C n'est pas confirmée) ou de **kA de défaut** d'un poste.
- « RTE travaille sur du 400 kV en hélicoptère » : le communiqué ne donne pas la tension des seize lignes.
- « Le disjoncteur 400 kV de 1986 contient 50 kg de SF6, soit 1 215 t de CO2 » : introuvé à la vérification.
- « SF6 : 23 500 fois » comme valeur unique : 24 300 chez SINTEF ; dire « plus de vingt mille fois ».
- « Le premier disjoncteur SF6 est de Merlin Gerin » : faux d'après ce qu'on a ; Westinghouse 1956, brevet AEG 1938.
- « 300 ms de réenclenchement » : chiffre de distribution, pas de transport.
- « Tu es protégé par l'IEEE 1584 / la NFPA 70E à 400 kV » : leur domaine s'arrête à 15 kV.
- Un accident « en France » : aucun trouvé. Les cas MIOSHA / Georgia Power / Virginia Power sont américains (lignes 138 à 345 kV) : ne pas les attribuer à RTE ni à la France.
- Les « 5 + 5 règles » : suisses, pas françaises.
- Une date pour la première ligne 400 kV française : non trouvée.

## Compléments du 2026-10-19 (deuxième passe)

Niveaux : A = lu à la source primaire ; B = lu sur une source secondaire sérieuse ; C = extrait de moteur non lu. 25 requêtes utilisées. Quatre PDF (INRS ED 6109, exposé INRS Thovert 2019, CIGRE Keri 2012, communiqué RTE) ont été enregistrés puis lus avec pdftotext : ce sont de vraies lectures.

### 1. Cadre réglementaire français
- **Code du travail R4544-1 à 11** (décret n° 2010-1118 du 22/09/2010, modifié par le décret 2016-1908) : la sécurité des opérations sur installations électriques ou à leur voisinage y est régie. R4544-4 : l'employeur supprime ou réduit le risque ; travaux **hors tension** sauf impossibilité technique ; le voisinage de pièces nues sous tension est limité aux cas où on ne peut pas le supprimer. R4544-9 : opérations « ne peuvent être effectuées que par des travailleurs habilités ». R4544-10 : habilitation **délivrée par l'employeur**, qui spécifie la nature des opérations ; formation théorique et pratique préalable ; **carnet de prescriptions** remis à chaque travailleur. Niveau A (texte cité dans l'exposé INRS). https://inrs.fr/dam/jcr:c22aefcd-fbc5-44be-bf4a-90811d7aff10/JT%20Elec%20-%2007%20Thovert%20Lien%20entre%20habilitation%20et%20normalisation.pdf (Légifrance : 404 aux deux essais, non lu directement.)
- **CORRECTION DE LA PRÉMISSE : la NF C 18-510 n'est PAS rendue obligatoire.** L'exposé INRS (L. Thovert, Enedis, commission AFNOR U21, 29/01/2019) dit : « la norme NF C 18-510, tout en restant d'application volontaire, définit les prescriptions pour respecter les obligations du Code du travail » ; l'arrêté du 20 novembre 2017 la fixe comme **référentiel recommandé** (art. R4544-3). Elle s'applique aux ouvrages de **toute tension ≤ 500 kV** (le 400 kV y est). Niveau A. Même URL. Un résumé de moteur cite aussi la NF C 18-510/A1 de février 2020 et l'arrêté du 5 juillet 2024 comme référence récente : niveau C.
- **Consignation électrique, ED 6109 (INRS) § 4.1.1 : cinq opérations, « à appliquer dans l'ordre spécifié »** : (1) **séparation** de l'équipement, préalablement identifié, de toute source d'énergie électrique ; (2) **condamnation en position d'ouverture** des organes de séparation ; (3) **identification** sur le lieu de travail ; (4) **vérification d'absence de tension (VAT)** ; (5) **mise à la terre et en court-circuit**, « immédiatement après la VAT ». Niveau A. https://esst.enseigne.ac-lyon.fr/spip/IMG/pdf/ed6109_consignation.pdf (copie de la brochure INRS)
- **Qui fait quoi (ED 6109 § 2)** : le **chargé de consignation** (désigné par son employeur) consigne et déconsigne et délivre les **attestations** ; il peut faire exécuter par du personnel sous sa responsabilité. Le **chargé d'opérations** dirige les opérations ; c'est à lui que le chargé de consignation rend compte, et c'est lui qui autorise les exécutants à commencer et autorise la déconsignation. Niveau A. Même URL. ATTENTION : l'ED 6109 est une brochure toutes énergies ; les noms propres à l'électricité HT dans la NF C 18-510 (chargé de travaux, avis de fin de travail, attestation de consignation) ne sont **pas** lus à la source.
- **Condamnation et signalisation** : blocage mécanique (serrure, cadenas) ; pancarte « CONDAMNÉ, DÉFENSE DE MANŒUVRER SANS AUTORISATION » avec nom, date, heure, repère. La séparation se fait « au plus près de la zone d'opération » ; par vue directe des contacts, retrait de pièces de contact, écran interposé, ou asservissement garantissant la position ; **le verrouillage par transfert de clefs** est « le seul système qui rend matériellement obligatoire la consignation dans l'ordre prévu ». Niveau A. Même URL.
- **Symboles d'habilitation** : INRS (page habilitation) donne la structure : 1er caractère B ou H (domaine de tension), 2e = type d'opération (0, F, 1, 2…), 3e = nature (C consignation, R intervention, S, E, P, T travaux sous tension, V voisinage, N nettoyage, X spécial) + attribut ; exemple B2V. La page ne détaille ni H1, H2, HC, HE ni HTA/HTB. Habilitation par l'employeur, revue au moins une fois par an, **recyclage recommandé tous les 3 ans**, avis nominatif après formation. Niveau A/B (inrs.fr + exposé). https://www.inrs.fr/risques/electriques/habilitation-electrique. Le détail (H1, H2, HC en HTB, symbole exact d'un chargé de consignation HTB) reste non lu (norme payante, ED 6127 illisible).

### 2. Distances en HTB à 400 kV
- L'exposé INRS dit que les zones se déterminent au chapitre 6 de la norme, par volumes autour des pièces nues : **voisinage simple** (le plus loin) et **voisinage renforcé** (le plus près). Niveau A (définition seulement, pas les mètres).
- **Valeurs HTB trouvées, toutes en site de formation (niveau C/B-, et deux sources se contredisent)** : un site cite « UTE C 18-510 » pour > 250 kV : **DMA 3,00 m, DLVR 4,00 m, DAN 6,00 m** (https://calculelec.fr/article/distances-securite-electriques-bt-hta-htb, lu, sans année ni arrêté). Un résumé de moteur d'autres sites donne **DMA 2,5 m à 400 kV** (formule 50 cm + kV/2) et DLVR 4 m pour 375 à 500 kV : non lus. travail-industrie.com renvoie lui-même à la norme sans chiffre. Aucune valeur DLI / DLVS à 400 kV. **Trou : aucun chiffre confirmé à la source. Ne rien afficher.**
- Arrêté du 17 mai 2001 : non lu. Un avis RTE cite une zone de protection de **5 m** autour des conducteurs HTB nus pour les travaux de bâtiment (R4534-107 et suivants) : niveau C, non lu.

### 3. VAT en HTB
- ED 6109 : la VAT se fait **sur chacun des conducteurs actifs**, « au lieu de travail », avec un dispositif spécialement conçu ; un voltmètre ou tournevis testeur **n'est pas** une VAT ; « les détecteurs de tension conformes aux normes en vigueur **ne détectent pas les tensions induites** : ils indiquent sans ambiguïté la présence ou l'absence de tension de service » ; la VAT est une opération sur installation sous tension (mesures de sécurité requises). Niveau A. https://esst.enseigne.ac-lyon.fr/spip/IMG/pdf/ed6109_consignation.pdf
- **Perche HTB et règle « vérifier le détecteur avant et après »** : non trouvées. Trou.

### 4. Pourquoi « mise à la terre ET en court-circuit » ; tension induite
- ED 6109 : la MALT-CC « permet de se prémunir contre les **réalimentations éventuelles** de tension amont ou aval ou produite par des sources autonomes », participe à la protection contre **l'induction électromagnétique et le couplage capacitif**, dissipe les énergies accumulées ; concerne tous les conducteurs actifs, au plus près de la zone de travail, avec des équipements conçus pour cela, **raccordée côté terre avant le côté conducteur** ; à la déconsignation, on dépose d'abord les court-circuits, puis les terres **en commençant par l'extrémité côté conducteur actif**. Niveau A. https://esst.enseigne.ac-lyon.fr/spip/IMG/pdf/ed6109_consignation.pdf
- **Ordres de grandeur sourcés (CIGRE-USNC 2012, ABB/AEP, Keri et al., simulations sur lignes 345 kV à double terne)** : tension induite maximale d'un terne ouvert **23 kV** sans réactance shunt ; **11 A** à la terre avec une seule mise à la terre (3 kV au bout ouvert) ; avec deux mises à la terre (aux deux extrémités) **62 A** (sans condensateur série) à **104 A** (avec) ; avec un défaut de barre **807 A**, jusqu'à **5 138 A** dans le pire cas simulé (condensateur série). Résonance possible : **450 kV** sur le terne ouvert avec réactances shunt, jusqu'à 2,85 MV dans un cas. Le courant d'une seule terre est surtout électrostatique ; celui de deux terres surtout électromagnétique. Niveau A (lu) mais **simulations américaines à 345 kV, pas des mesures RTE à 400 kV**. https://cigre-usnc.org/wp-content/uploads/2017/01/3-B2_Keri.pdf
- Même source : les accidents arrivent surtout au branchement ou au retrait des terres, « when very long arcs may appear » ; seuil de lâcher 10 mA, fibrillation 60 à 100 mA ; l'OSHA exige des terres temporaires quand un risque d'induction existe.
- **OSHA 1910.269 App. C** (lu) : toute conductrice non mise à la terre au site est réputée sous tension ; **la zone équipotentielle protège les travailleurs à l'intérieur** (tapis métallique, liaison des objets) mais pas à l'extérieur ; fibrillation I = 116/√t (0,0083 à 3 s) ; résistance du corps retenue 1 000 Ω ; danger si l'induction peut faire passer 1 mA dans 500 Ω ; au-delà de 6 mA, danger pour une durée illimitée. Niveau A. https://www.osha.gov/laws-regs/regulations/standardnumber/1910/1910.269AppC. Rien sur l'induction par ligne parallèle dans cette page.
- IEEE Std 1048 (guide de mise à la terre temporaire, éd. 2016, amendement 2021) : existence et portée lues sur des boutiques de normes (niveau B) ; contenu technique non lu.
- **Tension induite typique sur une ligne RTE 400 kV consignée** : non trouvée. Trou.

### 5. Réenclenchement automatique et RSE
- Aucun document RTE trouvé. Seulement un moteur citant un document indien : réenclenchement monophasé rapide, temps mort d'**environ 1 s** pour 400 et 220 kV (niveau C, non RTE). **Trou : délai RTE et neutralisation du RA en travaux (régime spécial d'exploitation).**

### 6. Sectionneur
- Résumé de moteur d'après des pages de cours : isole pour maintenance, doit afficher clairement sa position et tenir la tension entre bornes ouvertes ; **pas de pouvoir de coupure** (manœuvre en charge : fort arc) ; souvent associé à un sectionneur de terre ; norme CEI 62271-102 (sectionneurs et sectionneurs de terre > 1 000 V). Niveau C. L'ED 6109 confirme au niveau A que la séparation peut être « par vue directe des contacts séparés » ou par asservissement de position, et l'existence de « sectionneurs ou interrupteurs de mises à la terre et en court-circuit ». **Trou : interverrouillage disjoncteur / sectionneur / sectionneur de terre chez un fabricant.**

### 7. Réseau de terre maillé, tensions de pas et de toucher
- Résumés de moteur (consultants, rapport IEEE PES TR107) : la couche de gravier concassé (≈ 10 à 15 cm) ajoute une **résistance en série** avec le corps, limite le courant corporel et permet des tensions de toucher et de pas admissibles plus élevées ; sa résistivité doit être au moins 5 fois celle du sol. Niveau C. OSHA App. C (lu, niveau A) : tension de pas = entre les deux pieds près d'un objet relié à la terre sous tension ; tension de toucher = entre l'objet et les pieds, « presque la tension entière » si l'objet est relié à une terre éloignée. IEEE 80 : non lu.

### 8. Accident réel
- **NIOSH FACE 87-42 (Virginie, 12 mars 1987)** : apprenti monteur tué sur un circuit **230 kV mis hors tension**, deux circuits sur une tour de 120 pieds (≈ 36 m). Des mises à la terre avaient été posées de part et d'autre de la zone de travail. Le monteur retire le côté ligne d'une terre, la secoue pour la montrer ; l'apprenti saisit le **côté tour** d'une terre encore reliée à la ligne : le **courant induit** présent dans la ligne le traverse. Mort deux heures après. Procédure de l'entreprise : retirer tous les côtés ligne avant les côtés tour (non respectée) ; il faisait nuit, projecteurs non utilisés. Niveau A (la source de l'induction n'est pas précisée dans le résumé lu). https://stacks.cdc.gov/view/cdc/164563
- Cas MIOSHA (technicien tué par tension induite d'une ligne 345 kV voisine en retirant une terre d'une ligne 138 kV) et fiche OSHA (parallèle 345 kV / 138 kV) : niveau C, non lus. **Aucun accident français trouvé** (EPICEA non interrogé : base non fouillable par ce moteur).

### 9. Travaux sous tension RTE
- **Communiqué RTE du 9 juillet 2025** (lu) : du 30/06 au 11/07, ligne **400 000 volts Dunkerque-Arras** ; près de **400 entretoises** corrodées remplacées en deux semaines ; **deux opérateurs** dans une nacelle suspendue à un hélicoptère, **40 à 80 m** du sol, remplacement « en seulement quelques minutes » ; dix salariés (2 pilotes, un mécanicien, un avitailleur, un chargé de travaux, **cinq monteurs** qui se relaient) ; interventions « **sous tension**, sans couper l'alimentation » ; « combinaisons protectrices » ; expertise hélicoptère + électriciens depuis **70 ans** ; **1 400 jours de coupure évités par an**, **400 opérateurs** formés aux travaux sous tension, 400 h/an d'entraînement ; réseau RTE : 63 000 à 400 000 V, ~100 000 km de lignes aériennes, 7 000 km souterraines, 2 900 postes. Niveau A. https://assets.rte-france.com/prod/public/2025-07/2025-07-09-helicoptere-operation-haute-voltige-dunkerque-arras.pdf
- Communiqué de Gap (mars 2026) et Swissgrid (2020, ligne 380 kV, équipes RTE) : vêtement conducteur « cage de Faraday » (niveau C). **Le mot « mise au potentiel » n'est pas dans le communiqué lu** ; mécanisme du travail au potentiel : non lu.

### 10. Claquage de l'air
- Résumé de moteur (IEEE overview, glossaire AMS) : **≈ 3 MV/m = 30 kV/cm = 3 kV/mm** dans l'air sec à pression normale, champ **uniforme** ; baisse à peu près linéairement avec la pression, dépend de l'humidité et de la forme des électrodes ; ne sert pas à calculer l'amorçage d'un éclateur réel (champ non uniforme). Niveau C. https://glossary.ametsoc.org/wiki/dielectric-strength/

### Liste « À ne pas dire » mise à jour (remplace l'ancienne)

Sortent de la liste (désormais sourcés) :
- « Un sectionneur ne coupe pas en charge » : dicible comme principe de cours (niveau C, CEI 62271-102), après relecture par un électricien.
- Tension induite : dicible seulement comme ordre de grandeur de simulations américaines à 345 kV (CIGRE 2012 : jusqu'à 23 kV, de 11 à plus de 100 A dans une terre), jamais comme mesure RTE.
- « RTE travaille sur du 400 kV en hélicoptère » : confirmé (communiqué du 9/07/2025, Dunkerque-Arras, 400 000 V).
- Le kV/cm de l'air : « environ 30 kV/cm en champ uniforme » est dicible (niveau C).

Entrent dans la liste :
- « La NF C 18-510 est obligatoire / rendue obligatoire par le décret de 2010 » : **faux**. Le Code du travail (R4544-1 à 11) est obligatoire ; la norme est un référentiel recommandé d'application volontaire.
- « La mise à la terre sert à décharger la ligne » seule : elle protège d'abord contre la réalimentation et l'induction ; « le détecteur de tension te dit si la ligne est dangereuse » : faux, il ne détecte pas l'induit (INRS).
- Un ordre de dépose des terres quelconque : à la déconsignation on enlève d'abord les court-circuits puis les terres côté conducteur actif (ED 6109) ; l'accident 87-42 en est la leçon. Ne pas l'attribuer à RTE ni à la France (cas américain, 1987, 230 kV).
- Un chiffre DMA / DLVR à 400 kV : deux familles de sources de formation s'opposent (3 m / 4 m / 6 m contre 2,5 m) ; aucune confirmée à la norme.
- « Mise au potentiel » ou « cage de Faraday » pour les monteurs RTE du 400 kV : le communiqué lu dit seulement « combinaisons protectrices », « sous tension, sans couper ».
- Toute durée ou tension précise du travail au potentiel ; pour les coupures évitées, le chiffre RTE est « 1 400 jours par an » (communiqué), pas un autre.

Restent de l'ancienne liste :
- Tout chiffre de **délai de réenclenchement RTE** ; « 300 ms » est un chiffre de distribution ; « environ 1 s » vient d'un document indien.
- « Tu es protégé par l'IEEE 1584 / la NFPA 70E à 400 kV » : leur domaine s'arrête à 15 kV.
- « Le disjoncteur 400 kV de 1986 contient 50 kg de SF6, soit 1 215 t de CO2 » ; « SF6 : 23 500 fois » comme valeur unique (dire « plus de vingt mille fois ») ; « le premier disjoncteur SF6 est de Merlin Gerin ».
- Une date pour la première ligne 400 kV française ; « les 5 + 5 règles » (suisses) ; une température d'arc attribuée à l'INRS ; un kA de défaut de poste ; le pouvoir de coupure réel des disjoncteurs RTE.
- Un accident « en France » : toujours aucun trouvé.

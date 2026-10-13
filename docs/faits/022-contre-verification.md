# 022 — Contre-vérification du script (batterie de téléphone)

Faite le 2026-10-13, 11 requêtes sur 15. Niveaux : A primaire lue · B secondaire sérieuse · C faible. Bilan : 38 phrases, 31 tiennent, 7 sont à corriger ou à nuancer (3 importantes : Apple, le scénario de l'acte 3, la chute).

## Les points demandés

1. **Apple.** La page support.apple.com (« Informations importantes concernant la sécurité », en anglais et en français) n'a pas pu être lue : le lecteur ne renvoie que la table des matières (niveau : non lue). Reprises de presse concordantes (Gulf News, AARP, PhoneArena, résumé de recherche, niveau C/B) : « Don't sleep on a device, power adapter, or wireless charger, or place them under a blanket, pillow, or your body » quand l'appareil est branché. Apple motive par la **chaleur au contact de la peau et la ventilation**, pas par le risque d'incendie. Le script dit « jamais sous un oreiller, ni une couverture » : fidèle sur les mots, mais « jamais » est plus fort qu'Apple et la marque n'est pas vérifiée en primaire. Phrase proposée sans la marque (ci-dessous).
2. **Séparateur à fermeture.** Mécanisme confirmé par plusieurs brevets (Celgard/Entek, « Microporous membranes… », US 10461293 ; EP0823740) et Volta (B) : le PE fond vers 130 à 145 °C, les pores se ferment, la résistance bondit (de 10 à plus de 10 000 ohm·cm²), le courant s'arrête. Tri-couche PP/PE/PP : PE à 135 °C, PP à 165 °C (Volta, B). **Limites confirmées** : fenêtre de 5 à 15 °C pour un PE de 25 µm ou moins ; à 150 °C la fermeture peut se perdre (perte d'intégrité du film) ; contre un court-circuit interne rapide, « very little protection » (revue citée par un document NIOSH, B). Courant dans les téléphones ? Un séparateur PE microporeux de 10 à 30 µm pour téléphones est décrit par Volta (B), mais **aucun fabricant de téléphone ni de cellule n'a confirmé la fonction de fermeture modèle par modèle** : ne jamais dire « tous ». Un séparateur uniquement céramique n'a pas de fermeture (même source de recherche).
3. **Construction.** Cuivre/anode (graphite) et aluminium/cathode (oxyde de lithium) : cohérent dans plusieurs brevets (B). Les feuilles sont **enduites** ; « une feuille de cuivre, une feuille d'aluminium » est une simplification. Enroulé (« jelly roll ») ou empilé : les deux existent, l'enroulé est décrit pour les cellules plates de téléphone (brevets), l'empilé aussi (B). « Des dizaines de fois » : **aucun nombre de couches trouvé**. Liquide inflammable : INRS, « électrolytes… inflammables » (A-).
4. **Circuit.** Un circuit intégré de protection commande deux transistors (surcharge, décharge profonde, surintensité) et lit une thermistance NTC ; la coupure en température est réglable (ex. +40 à +85 °C, fiches ABLIC, brevets, B). Battery University : « Protection circuits for Li-ion packs are mandatory ». Il est dans le bloc batterie. « Surveille tout » est un peu large (tension, courant, température).
5. **Note 7.** CPSC (A, lue par le dossier) : environ un million, 92 signalements, 26 brûlures, 55 dégâts matériels, rappel du 15/09/2016. DOT/FAA/PHMSA : interdiction à bord, en cabine, soute et fret, en vigueur le 15 octobre 2016 à midi (heure de l'Est), originaux **et remplaçants** (communiqué DOT repéré dans la recherche, repris par AirlineGeeks ; B). Tient.
6. **Scénario de l'acte 3.** Voir « Corrections » : présentation partiellement trompeuse.
7. **Chute.** Voir « Corrections » : formulation trop tranchée.
8. **Cheveu** : fourchette de 17 à 181 µm (Wikipedia citant The Physics Factbook, C), environ 75 µm typique (SEMATECH cité par Chemicool, C). Un séparateur de 10 à 30 µm est donc « plus fin qu'un cheveu » en général, pas pour le cheveu le plus fin. **Batterie gonflée** : arrêter la charge, isoler (INRS via Futura-sciences, B).

## Beat par beat

- **accroche** · « Ton téléphone charge, sous ton oreiller. Dedans, sa batterie chauffe. » : tient (une batterie chauffe en charge ; l'oreiller gêne l'évacuation, MAIF/Apple).
- **promesse** · « Ce qui la retient : un film de plastique, plus fin qu'un cheveu » : tient comme ordre de grandeur ; « ce qui la retient » laisse croire que c'est la seule protection (voir corrections, mineur). « Ton oreiller travaille contre lui » : tient.
- **scene** · « deux électrodes pleines d'énergie, séparées par presque rien, dans un liquide inflammable » : tient (INRS). « Si elles se touchent : la chaleur appelle la chaleur » : tient (réactions exothermiques auto-entretenues, B). « En 2016, un modèle entier a été rappelé… et interdit d'avion, aux États-Unis » : tient (CPSC A, DOT B).
- **ouvre** · tient.
- **eclate** · « Une feuille de cuivre. Une feuille d'aluminium. Entre les deux… le film : le séparateur » : simplification à nuancer (feuilles enduites). « Enroulé ou empilé » : tient. « des dizaines de fois » : non sourcé. « Et au bout, un petit circuit » : tient.
- **repos** · « Le circuit surveille tout… il coupe » : tient (voir point 4). « Le film laisse passer le lithium par des pores invisibles » : tient (ions lithium, pores microscopiques). « Il attend » : tient.
- **seuil** · tient (reprend le cheveu).
- **zero** · « Sous l'oreiller, la chaleur ne sort plus. La batterie monte. » tient. « Le circuit coupe la charge. » tient (seuil de température réglable, NTC). « Mais dedans, un point chauffe… encore. » : voir corrections (cause absente).
- **reponse** · « Vers cent trente degrés, le film fond… Le courant s'arrête » : tient (PE : 130 à 145 °C selon matière, plage de 130 à 140 retenue, B). « C'était son dernier geste » : tient, mais lu seul il suggère une fin heureuse alors que la fenêtre est étroite (voir corrections).
- **chute** · « ce n'est pas le courant qui menace ta batterie, c'est la chaleur » : trop tranché. « son dernier rempart… est un film qui fond » : tient (dernière barrière interne passive ; « dernière » parmi celles décrites).
- **comment** · « Il garde cette chaleur » : tient. « Apple l'écrit : jamais sous un oreiller, ni une couverture, pendant la charge » : voir corrections. « Batterie gonflée ? Tu arrêtes tout. » : tient (INRS B), peut être rendu plus utile. « tu le charges où, la nuit ? » : tient.
- **like** · « quelqu'un, ce soir, va s'endormir dessus » : prédiction rhétorique, non chiffrée (sondage MACSF : 66 % chargent la nuit, C) ; tient.
- **abo** · annonce du 023 : hors du périmètre de cette relecture (non vérifié ici).
- **boucle** · tient.

## Corrections proposées

1. **comment** · « Apple l'écrit : jamais sous un oreiller, ni une couverture, pendant la charge. » → « Les consignes sont claires : pas d'oreiller, pas de couverture pendant la charge. » · page Apple non lue, reprises de presse seulement (C) ; Apple motive par la chaleur sur la peau et la ventilation ; MAIF (B) : ni sous l'oreiller ni sur un canapé. Alternative si Merwan tient à la marque : « Apple demande de ne pas la couvrir pendant la charge. »
2. **zero** · « Mais dedans, un point chauffe… encore. » → « Mais si la cellule est abîmée, un point chauffe… encore. » (ou « Si un défaut couve dedans, un point chauffe… encore. ») · l'oreiller seul n'amène pas l'intérieur à 130 °C : le téléphone sain limite ou coupe sa charge (Apple, charge limitée par la chaleur ; seuil NTC réglable). Le séparateur n'intervient qu'en cas de défaut ou d'abus (électrode pliée, perforation, soudure : causes citées du Note 7, B). Les sources du script disent déjà « scénario » : l'image doit le faire sentir.
3. **chute** · « ce n'est pas le courant qui menace ta batterie. C'est la chaleur. » → « ce qui menace ta batterie, ce n'est pas d'abord le courant. C'est la chaleur. » · le circuit existe précisément contre la surcharge et la surintensité, et un court-circuit interne est un courant (échauffement par effet Joule, B). La chaleur est le moteur de l'emballement, pas la seule cause.
4. **eclate** · « Le tout, enroulé ou empilé, des dizaines de fois. » → « Le tout, enroulé ou empilé, en couches serrées. » · aucun nombre de couches sourcé.
5. **eclate** · « Une feuille de cuivre. Une feuille d'aluminium. » → « Une feuille de cuivre, enduite. Une d'aluminium, enduite. » (ou ne rien changer si l'image montre les enductions) · les électrodes sont des feuilles enduites (brevets, B).
6. **promesse** · « Ce qui la retient : un film de plastique » → « Ce qui la retient, en dernier : un film de plastique » · le circuit passe avant ; le film est la dernière barrière interne.
7. **reponse** · « C'était son dernier geste. » → « C'était son dernier geste… s'il tient. » (si le temps le permet) · fenêtre de fermeture de 5 à 15 °C pour un PE fin ; perte de l'effet vers 150 °C (brevets, B). Facultatif : la chute rappelle déjà la fragilité.
8. **comment** · « Batterie gonflée ? Tu arrêtes tout. » → « Batterie gonflée ? Tu débranches et tu l'éloignes. » · INRS via Futura (B) : arrêter la charge et l'isoler.

## Ce que `sources` devrait préciser

- Apple : texte non lu en primaire ; la formulation vient de la presse ; la raison donnée par Apple est la chaleur sur la peau et la ventilation. Si la ligne Apple est gardée, le dire.
- Séparateur : fermeture confirmée par brevets et Volta (B), jamais par un fabricant de téléphone ; fenêtre étroite ; inefficace contre un court-circuit interne rapide ; séparateurs uniquement céramiques sans fermeture ; « plus fin qu'un cheveu » vrai en général (17 à 181 µm, C), pas pour tous.
- Nombre de couches inconnu ; feuilles enduites ; enroulé ET empilé existent.
- Circuit de protection : décrit par fiches de circuits intégrés et brevets, pas par un modèle de téléphone ; seuils non dits.
- Scénario de l'acte 3 : illustratif, et il suppose un défaut interne ; un téléphone sain coupe ou limite sa charge bien avant 130 °C.
- Note 7 : l'interdiction DOT couvre originaux et remplaçants (rappel du 15/09 puis du 13/10) ; la cause n'est pas le séparateur en soi.

## Requêtes utilisées (11 sur 15)

1. WebFetch support.apple.com/guide/iphone/important-safety-information-iph301fc905/ios (tronquée)
2. WebSearch séparateur à fermeture PE 130 °C
3. WebSearch cellule pouch de téléphone, enroulée ou empilée
4. WebSearch citation Apple « Don't sleep on a device… »
5. WebFetch support.apple.com/fr-fr/guide/iphone/iph301fc905/ios (tronquée)
6. WebSearch Note 7, CPSC, DOT/FAA
7. WebSearch circuit de protection, NTC, surcharge
8. WebFetch batteryuniversity.com/article/bu-304b-safety-circuits-for-modern-batteries
9. WebSearch diamètre d'un cheveu
10. WebSearch charge limitée par la chaleur Apple
11. WebSearch emballement thermique, court-circuit interne, limites de la fermeture

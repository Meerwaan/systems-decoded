# 019 — Le prétensionneur de ceinture de sécurité : dossier de faits

Recherche du 2026-10-13 · budget : 29 requêtes sur 30

Niveaux : **A** source primaire lue · **B** secondaire sérieuse · **C** faible. « Résumé de recherche, non lu » = vu seulement dans l'extrait du moteur.
Verdict d'ensemble : l'angle tient (voir fin de section 2). Ce qui est dit mot pour mot ci-dessous vient de deux documents lus en entier ou presque : le rapport NHTSA DOT HS 811 835 (A) et l'étude IRCOBI 2023 de Valdano et al. sur les essais NCAP à 56 km/h (A).

## 1. Le mécanisme et ses pièces

- **Rôle** : le prétensionneur retire le mou de la sangle presque instantanément au choc. — « retract the safety belt almost instantly in a crash to remove excess slack » (NHTSA, rapport 811 835). Niveau **A**. https://crashstats.nhtsa.dot.gov/Api/Public/Publication/811835
- **Pyrotechnique, en général** : « typically pyrotechnic devices but some are electro-mechanical » (NHTSA, même rapport). **A**.
- **Prétensionneur d'enrouleur (épaule)** : une charge pyrotechnique produit du gaz qui entraîne une **turbine** reliée à la bobine de l'enrouleur, qui rembobine. NHTSA : « Shoulder belt pretensioners generally feature a turbine device connected to the seat belt retractor spool ». **A**.
- **Prétensionneur de boucle (bassin)** : « the pyrotechnic device usually forms part of the buckle assembly » ; un **câble d'acier** relie la boucle à un **piston** qui coulisse dans un **tube** ; le gaz pousse le piston, le câble tire la boucle vers le bas. NHTSA. **A**.
- **Point d'ancrage** : « Some vehicles employ a pretensioner at the outboard anchor location » (NHTSA). **A**. Rien de plus trouvé.
- **Variantes d'enrouleur vues dans les brevets** : gaz → piston → crémaillère + pignon, ou piston → fil qui tourne une roue d'entraînement, ou **billes d'acier** poussées dans une piste qui entraînent un pignon relié à la bobine. Brevets américains (résultats de recherche, non lus en entier) : https://patents.google.com/patent/US7635150B2 (piston + fil), https://patents.google.com/patent/US7581757 (enrouleur + prétensionneur). Niveau **B/C** (brevets, descriptions d'un mode de réalisation, pas un état du marché).
- **ZF SPR8** : le gaz monte en pression dans un tube de guidage et pousse un piston plastique qui entraîne la bobine. Résumé de recherche, non lu (page ZF en 403) : https://press.zf.com/press/en/releases/release_2896.html. **C**.
- **Le plus courant aujourd'hui** : **non trouvé chiffré**. L'étude IRCOBI montre l'adoption (voir §8) mais pas la répartition épaule / bassin / ancrage. On peut dire « l'enrouleur » comme cas type, sans pourcentage.
- **Vocabulaire** : l'OQLF recommande « prétendeur de ceinture de sécurité » ; les notices Kia en français écrivent « prétendeur » ; le grand public dit « prétensionneur » (Ornikar, Capcar). Niveau **B** (https://vitrinelinguistique.oqlf.gouv.qc.ca/fiche-gdt/fiche/8384629/pretendeur-de-ceinture-de-securite ; résumé de recherche, non lu).

## 2. Chronologie d'un choc frontal vers 50 km/h

- **Qui décide** : « triggered by the same crash sensors that are used to determine the need to deploy the vehicle's air bags » — le prétensionneur n'a pas de capteur à lui, il lit celui du calculateur d'airbag. NHTSA. **A**.
- **Il peut partir sans airbag** : « In minor collisions, the seat belt pretensioners may be fired without the air bags being deployed. In more serious crashes, both ». NHTSA. **A**. (Utile : « la ceinture se retend avant l'airbag, et parfois sans lui ».)
- **Temps de mise à feu mesuré : 15 à 20 ms** — moyenne, sur des essais NCAP pleine largeur à **56 km/h** (35 mph), 40 ans de données NHTSA ; « ranging from 15 to 20 ms », pour l'enrouleur comme pour la boucle (la boucle part environ 2 ms plus tard depuis 2010). Valdano, Jiménez-Octavio, Pipkorn, López-Valdés, IRCOBI 2023 (IRC-23-111). Niveau **A** (PDF lu). https://iit.comillas.edu/documentacion/congreso/IIT-23-324C/ (même texte sur https://repositorio.comillas.edu/items/171717f7-d2da-4ffb-819b-253e85aec2ea). **Attention** : c'est l'instant où l'effort dans la sangle commence à monter sur la courbe, « the actual TTF (i.e., the firing command) would be earlier » (l'ordre de mise à feu est un peu antérieur). Ce n'est pas un temps depuis l'impact exact : l'origine de la courbe est le début du choc mesuré en labo.
- **Autres durées de la littérature** : « environ 15 à 20 ms » pour la séquence complète (MecaLife, https://vin.mecalife.com/en/ceintures-pretension, page lue, **B**) ; « 10 à 15 ms » (Capcar, résumé de recherche, non lu, **C**) ; « 30 ms » après la collision pour 80 mm de sangle (mvwautotechniek.nl, résumé de recherche, non lu, **C**). Cohérent avec 15–20 ms ; on retient la mesure IRCOBI.
- **Longueur de sangle reprise** : aucune valeur de série publiée trouvée. Les ordres de grandeur sont dans des brevets : « 100 mm and 200 mm » comme exigence constructeur citée (brevet US 5 924 640, https://patents.justia.com/patent/5924640, résumé de recherche, non lu, **C**) ; « 50 to 150 mm » (brevet canadien, **C**) ; ~80 mm sur un site de formation (**C**). MecaLife (page lue) : « by several centimeters », sans chiffre. → à dire « quelques centimètres », pas plus.
- **Effort** : 1,5 à 2,0 kN environ pour un prétensionneur d'enrouleur (épaule), de 1,0 à 2,5 kN pour la boucle (bassin) au fil des vingt dernières années (IRCOBI, forces moyennes lues sur les courbes NCAP). **A**. Un brevet cite 700–800 N comme exigence constructeur (**C**).
- **Place par rapport à l'airbag** : NHTSA dit seulement que les deux sont commandés par les mêmes capteurs ; aucun délai prétensionneur → airbag publié trouvé. Les sites auto disent « quelques ms avant ou en même temps » (résumés de recherche, **C**). La ligne « airbag ≈ 30 ms, tête dedans vers 50–80 ms » vient du dossier 002, pas de cette recherche. Ce qu'on peut dire sans risque : la ceinture est tendue **à 15–20 ms**, donc **avant** que le corps ait commencé à partir vers l'avant et **avant** le contact de la tête avec l'airbag.
- **Verdict sur l'angle** : tient, avec une nuance de vocabulaire. Le prétensionneur ne « rattrape » pas le corps, il **supprime le mou avant que le corps parte** ; c'est le limiteur qui intervient ensuite. Et le prétensionneur est réglé pour **l'effort** (≈ 2 kN), pas pour retenir tout le corps.

## 3. Le limiteur d'effort

- **Principe** : « allows the seat belt force applied to the chest to rise to a pre-determined point where the injury risk is still relatively low. The seat belt is then allowed to spool out of the retractor in a controlled manner » (NHTSA, 811 835). **A**.
- **Barre de torsion** : tige de métal dans l'enrouleur qui se tord quand l'effort atteint la limite et laisse la sangle sortir. NHTSA : « when the force applied by the webbing reaches the design limit, the torsion bar twists ». **A**. Autres formes : un pli cousu dans la sangle dont les coutures cèdent, une « échelle » à dents métalliques qui se déforment (NHTSA). **A**.
- **Seuil mesuré** : de **5 kN** dans les années 1990 à **3–4 kN** aujourd'hui (moyennes sur essais NCAP 56 km/h) ; 0,6 kN de plus côté conducteur que côté passager depuis 2010 (IRCOBI, §Fig. 9). **A**. MecaLife / Capcar disent « 4 à 6 kN » (**B/C**) ; on retient 3–4 kN actuel, 5 kN historique.
- **Barre de torsion plus raide que le prétensionneur** : le couple de la barre doit dépasser celui du prétensionneur pour que ce dernier n'ouvre pas la barre en tirant (brevet US 7 878 439 et résumé de recherche, **C**). Fait de conception, utile pour comprendre pourquoi les deux ne se gênent pas.
- **Pourquoi il existe** : empêcher que la ceinture elle-même blesse la poitrine (« preventing the shoulder belt from exerting too much force on the chest »). NHTSA. **A**. La ceinture du prétensionneur et celle du limiteur ne sont pas en conflit : l'une serre tôt, l'autre cède tard.
- **Il travaille avec l'airbag** : « a frontal, side, or curtain air bag would in many cases work in conjunction with the belt and arrest the occupant's motion » (NHTSA). **A**. MecaLife : le limiteur laisse le corps avancer un peu « pour que le coussin le rattrape » (page lue, formulation de ma part, **B**).
- **Première voiture** : Volvo 850, 1995 (NHTSA, note 1, citant Brumbelow et al. 2007). **A**.
- **Durée du limiteur** : le palier d'effort dure de l'ordre de 60 ms sur l'exemple type de l'étude (exemple de courbe : « Force = 3.5 kN, Duration = 63 ms ») ; un exemple, pas une norme. IRCOBI. **A**, mais illustratif.

## 4. Le blocage ordinaire de l'enrouleur (à ne pas confondre)

- Dans un enrouleur, deux familles : « webbing sensitive » (la sangle tirée trop vite fait accélérer la bobine et un cliquet bloque) et « vehicle sensitive » (une masse inertielle, **pendule** ou bille, bouge à la décélération du véhicule et pousse un **cliquet** contre une **roue à rochet** fixée à la bobine). Brevets (US 3 945 587, US 4 166 592, US 5 145 123) : résumé de recherche, non lu. **B/C**.
- Ce mécanisme est **purement mécanique** et **se réarme** tout seul : il n'a rien de pyrotechnique, aucun calculateur. Le « coup sec » qui bloque la sangle quand on tire est le blocage ; le prétensionneur est autre chose.
- Dans un choc, **les deux** agissent : le blocage retient la bobine, le prétensionneur la rembobine, la barre de torsion laisse repartir la sangle (séquence présentée par les brevets, **B/C**).
- Lien entre prétensionneur et blocage mécanique : non trouvé comme tel dans une source lue.

## 5. Après un déclenchement

- **Usage unique** : « Les prétensionneurs sont conçus pour fonctionner une seule fois. » et « Après l'activation, les ceintures de sécurité avec prétensionneur doivent être remplacées. » Notice du propriétaire Kia (France, 2024). Niveau **A** (page lue). https://ownersmanual.kia.com/full_webhelp/CD/2024/fr_FR/topics/chapter3_2_2.html
- **MecaLife** : déclenché, même « lors d'un accident bénin », il n'est plus fonctionnel ; un professionnel doit remplacer l'ensemble (enrouleur, sangle, prétensionneur). **B** (page lue).
- **Voyant** : le témoin SRS s'allume ~6 s au contact puis s'éteint ; s'il reste allumé, un défaut du prétensionneur peut en être la cause même si l'airbag va bien (Kia, **A**).
- **À l'activation** : bruit sourd, fine poussière non toxique mais irritante, le mécanisme chauffe : attendre plusieurs minutes avant de toucher (Kia, **A**). Intéressant pour l'image : la poussière blanche.
- **Occasion accidentée** : fait notable, vérifier que la ceinture n'a pas déjà été déclenchée (Capcar, résumé de recherche, non lu, **C**). Aucune source officielle trouvée sur la fraude ou le contrôle de l'état d'un véhicule accidenté.
- **Obligation** : Ornikar dit « pas obligatoire en France » (page lue, **C** : site d'auto-école, sans texte de loi) ; Capcar dit l'inverse (**C**). NHTSA : « has long encouraged -- but never required » (États-Unis, **A**). Pour la France / l'Europe : **non trouvé**. Ne pas dire « obligatoire » ni « pas obligatoire ».

## 6. Ce qui lui retire son effet

- **Vêtements épais** : le tissu comprimé retarde l'action de la ceinture. AXA Prévention (page lue, **B**) : « the thick fabric is compressed first of all before the belt can restrain the body » ; sur le prétensionneur : « less effective if you're wearing a down jacket ». Attention : AXA écrit que le prétensionneur tire « in anticipation of a collision », ce qui décrit un prétensionneur réversible, pas le pyrotechnique. https://axa.ch/en/ueber-axa/blog/mobility/thick-jacket-safety-belt.html
- **ADAC et TÜV** : essais sur chariot à **16 km/h** avec mannequins en veste d'hiver : la ceinture remonte sur le ventre, risque pour foie, rate, intestin ; « le prétensionneur ne peut pas jouer pleinement son rôle sur un vêtement épais ». Rapporté par la presse allemande (Schwäbische, Heidelberg24, Netzwelt), pas lu à la source ADAC. Niveau **B/C**, résumé de recherche, non lu. Conseil ADAC : enlever la veste, ou la soulever et passer la ceinture dessous (familie.de, résumé).
- **SWOV** (1989) : le prétensionneur compte surtout quand il y a beaucoup de mou, par exemple des vêtements épais (résumé de recherche, non lu, **C**).
- **Notice Kia** : ceinture à porter « correctement et ajustée », sangle ni détendue ni tendue ; **ne mentionne pas** les vêtements épais (**A**).
- **Pince / clip, dossier très incliné, sangle sous le bras** : **non trouvé** de source officielle. Ne pas affirmer. (Sécurité routière : aucune page trouvée.)
- **Sièges enfants** : hors sujet ; les consignes manteaux / harnais sont reprises par NHTSA / AAP, via presse seulement (non lu). Ne pas mélanger.

## 7. Histoire, courte

- **Mercedes-Benz, Classe S, 1981** : « Mercedes-Benz introduced pretensioners in the front seats of their S-class cars in 1981. » NHTSA, 811 835, p. 1. Niveau **A**.
- **Généralisation** : « mostly between 1997 and 2002 » aux États-Unis (63 % des voitures neuves avaient un prétensionneur en MY 2002 ; 84 % un limiteur) ; tous les véhicules neufs américains en 2008 aux places avant. NHTSA. **A**. IRCOBI : adoption sur les voitures testées « mid-1990s » → « widely adopted » en 2005 (**A**).
- **Ceinture trois points** : Nils Bohlin, ingénieur Volvo (venu de Saab, éjecteurs), Volvo l'introduit en **1959** ; brevet suédois déposé en 1958 ; toutes les Volvo l'ont en 1963 ; Volvo laisse le brevet libre. Musée Lemelson (MIT), page lue. **B**. https://lemelson.mit.edu/resources/nils-bohlin
- **Limiteurs** : Volvo 850, 1995 (NHTSA, **A**).

## 8. Efficacité chiffrée

- **NHTSA, DOT HS 811 835 (Kahane, 2013)**, données FARS 1986–2011, 16 642 cas équipés / 27 389 de comparaison : une personne ceinturée à l'avant d'une voiture, d'un CUV ou d'un monospace a **12,8 % de risque de décès en moins** si la ceinture a un **prétensionneur et un limiteur**, par rapport à aucun des deux (intervalle de confiance à 95 % : **2,6 % à 23,0 %**). « about 5 to 7 percentage points higher » d'efficacité de la ceinture. **Les deux dispositifs sont mesurés ensemble**, pas séparément ; « and perhaps other belt or belt-related improvements introduced at about the same time ». Pas d'effet significatif mesuré sur les pick-up / SUV sur châssis. Niveau **A** (PDF lu).
- **Essais NCAP** (NHTSA, 2003, cité dans le même rapport) : modèles qui ajoutent prétensionneur + limiteur : HIC −232, accélération thoracique −6,6 g, déflexion thoracique −10,6 mm ; part due aux prétensionneurs : HIC −154, −2,9 g, −5,6 mm. **A**.
- **Ceinture seule** (pas le prétensionneur) : environ 66 % de réduction de mortalité (NHTSA 811 835, double-pair comparison : 66,2 %, 67,5 %, 64,2 %, 62,8 % selon les paires). **A**. Bohlin (1967) : « jusqu'à 75 % » (Lemelson, **B**), NHTSA « au moins 45 % » (cité par Lemelson, **B**).
- **Étude européenne** : « The effect of seatbelt pre-tensioners and load limiters in the reduction of MAIS 2+, MAIS 3+ and fatal injuries » (Comillas, IIT-23-326C) : trouvée, **non lue**. https://www.iit.comillas.edu/documentacion/congreso/IIT-23-326C/ À lire si on veut un chiffre européen.
- **Essai sur chariot** (résumé de recherche, non lu, **C**) : un double prétensionnement bien réglé réduit ~20–25 % la déflexion et l'accélération thoraciques par rapport à un seul.

## 9. Le prétensionneur réversible

- Un **moteur électrique** retend la ceinture avant le choc (freinage d'urgence, dérobade), puis la relâche si le danger passe. Réutilisable, sans remplacement. ZF ACR8 (électromécanique, tire la ceinture avant tout tendeur pyrotechnique) : résumé de recherche, non lu, **C** ; Mercedes PRE-SAFE (première application série : Classe S 2003, « reversible belt-pretensioners ») : résumé de recherche, non lu, **C** ; Volvo en parle dans ses notices (résumé de recherche, non lu). https://evkx.net/en/technology/safety/seatbelts/ (**C**).
- Un boucle motorisée Mercedes : « jusqu'à 40 mm » de tension réversible (presse auto, date inconnue, **C**).
- Dit simplement : il existe deux familles, l'une qui se joue **avant** le choc et se remet, l'autre qui explose **pendant** le choc et ne se rejoue pas. Le film parle de la seconde.

## 10. Idées reçues et ce qu'un mécanicien reprocherait

- « Le prétensionneur te retient » : faux dans l'ordre. Il **retend** (avant), la ceinture **retient**, le limiteur **lâche**. Un mécanicien sursautera si on mélange les trois ; ne jamais écrire « le prétensionneur arrête ton corps ».
- « La ceinture bloque parce qu'une charge explose » : faux au quotidien. Le blocage au freinage est un **pendule**, sans explosif. Le prétensionneur ne part que sur un vrai choc.
- « Il explose » : exact pour la charge, mais le mot fait peur ; la poussière et le « pschitt » sont normaux (Kia).
- « Réparable » : non, usage unique (Kia). Mais **attention à « après un petit choc on peut le garder »** : MecaLife dit qu'il part même lors d'un accident bénin.
- « Il tire d'un coup très fort » : l'étude mesure ~1,5–2 kN, loin des 3–5 kN du limiteur. Sans lecture de ces chiffres, éviter « il t'arrache en arrière ».
- « Le prétensionneur remplace l'airbag » : non, ils partent des mêmes capteurs, parfois seul l'un des deux (NHTSA).
- « Il y en a toujours un à chaque place » : non (NHTSA : surtout aux places avant ; arrière souvent absent). Aucun chiffre européen trouvé.
- Vocabulaire à surveiller : « prétensionneur » (commun), « enrouleur », « bobine » (la pièce sur laquelle la sangle s'enroule), « générateur de gaz » (la charge), « limiteur d'effort », « barre de torsion ».

## À dire tel quel

- Le prétensionneur est un dispositif en général pyrotechnique, dans l'enrouleur ou la boucle de la ceinture ; au choc, il retire le mou de la sangle presque instantanément. (NHTSA)
- Il est déclenché par les mêmes capteurs que l'airbag, et peut partir sans lui dans un choc léger. (NHTSA)
- Dans les essais NCAP à 56 km/h, il part en 15 à 20 millisecondes en moyenne. (IRCOBI 2023)
- Un limiteur d'effort, souvent une barre de torsion dans l'enrouleur, laisse ensuite sortir la sangle quand l'effort atteint un seuil, pour ménager la poitrine. (NHTSA)
- Ce seuil est aujourd'hui de 3 à 4 kN en moyenne, contre environ 5 kN dans les années 1990. (IRCOBI 2023)
- Le premier prétensionneur de série est celui de la Mercedes Classe S, en 1981. (NHTSA)
- Après un déclenchement, il faut remplacer la ceinture : usage unique. (notice Kia)
- Avec un prétensionneur et un limiteur, le risque de décès d'une personne ceinturée baisse d'environ 13 % dans les voitures de tourisme (95 % : 2,6 à 23 %). (NHTSA)

## Ordres de grandeur (à dire avec « environ »)

- Déclenchement : environ 15 à 20 ms après le début du choc, dans les essais à 56 km/h.
- Sangle reprise : quelques centimètres (les brevets citent 5 à 20 cm ; aucune valeur de série publiée). Ne pas écrire de centimètres à l'écran.
- Effort du prétensionneur : environ 2 kN (1,5 à 2,5).
- Seuil du limiteur : environ 3 à 4 kN aujourd'hui (5 kN dans les années 1990).
- Gain mesuré : environ 13 % de risque de décès en moins pour l'ensemble prétensionneur + limiteur ; 5 à 7 points d'efficacité de la ceinture en plus.
- Ceinture seule : environ deux tiers de décès évités pour les occupants avant (NHTSA : 62,8 à 67,5 % selon les paires).

## À ne pas dire

- « Le prétensionneur te retient » ou « t'arrête » : c'est la ceinture, puis le limiteur.
- Une durée en ms entre prétensionneur et airbag : aucune source n'en donne.
- Une longueur de sangle précise en cm : non publiée pour la série.
- « Obligatoire » ou « pas obligatoire » en France / Europe : source contradictoire, aucun texte lu.
- « Le limiteur est une barre de torsion » sans nuance : c'est la plus courante ; il existe aussi des coutures et des échelles à dents (NHTSA).
- « 12,8 % grâce au prétensionneur » : le chiffre couvre le prétensionneur ET le limiteur, et d'éventuelles autres améliorations simultanées.
- « Il tire avant que ton corps ne bouge » comme chronologie précise à la ms près : on peut dire « tout de suite, avant que ton corps parte vers l'avant » (NHTSA), pas plus.
- Des conseils sur clip, pince, dossier incliné, sangle sous le bras : aucune source officielle trouvée.
- « Tous les prétensionneurs sont pyrotechniques » : il existe un prétensionneur électrique réversible.
- Le chiffre « 4 à 6 kN » ou « 10 à 15 ms » de Capcar : écarts avec la mesure.

## Trois faits-accroche

1. **15 à 20 millisecondes** : c'est le temps moyen que met ta ceinture à se retendre dans un choc à 56 km/h (IRCOBI 2023, **A**). Plus vite qu'un battement de cils, avant même que ton corps ait bougé.
2. **La ceinture te laisse partir exprès** : vers 3 à 4 kN, une barre de torsion se tord et laisse sortir la sangle pour ne pas t'enfoncer les côtes (NHTSA + IRCOBI, **A**). Pic mesuré dans les années 1990 : 5 kN.
3. **Une charge explosive dans ta ceinture, en usage unique** : le prétensionneur pyrotechnique, conçu pour fonctionner une seule fois, est dans les voitures depuis la Classe S de 1981 (NHTSA, Kia, **A**).

## Non trouvé

- Longueur de sangle reprise (cm) en série : seulement des brevets.
- Délai prétensionneur → airbag, publié.
- Répartition des types (enrouleur / boucle / ancrage) sur le parc actuel.
- Sécurité routière (France) : aucune page lue ; Euro NCAP et UNECE R16 : pas lus (obligation, protocole).
- Prétensionneur obligatoire ou non en France / en Europe : non tranché.
- Pince / clip, dossier incliné, sangle sous le bras : aucune source officielle.
- Étude européenne sur l'efficacité (Comillas IIT-23-326C) : trouvée, non lue.
- Source ADAC primaire (le test à 16 km/h) : seulement la presse.
- Autoliv : aucun résultat exploitable (pages inaccessibles ou non indexées).
- Rapport de fiabilité / de rappels : non cherché ; il existe des rappels de câbles de prétensionneur chez Transport Canada (résumé de recherche, non lu), à ne pas mentionner sans lecture.

## URL lues

- https://crashstats.nhtsa.dot.gov/Api/Public/Publication/811835 (PDF lu : résumé, §1, efficacité)
- https://iit.comillas.edu/documentacion/congreso/IIT-23-324C/ (PDF IRCOBI 2023 lu : TTF, forces)
- https://repositorio.comillas.edu/items/171717f7-d2da-4ffb-819b-253e85aec2ea (résumé)
- https://vin.mecalife.com/en/ceintures-pretension
- https://ownersmanual.kia.com/full_webhelp/CD/2024/fr_FR/topics/chapter3_2_2.html
- https://lemelson.mit.edu/resources/nils-bohlin
- https://axa.ch/en/ueber-axa/blog/mobility/thick-jacket-safety-belt.html
- https://www.ornikar.com/code/cours/securite/dispositif/pretensionneur
- Inaccessibles (403/404) : press.zf.com, volvocars.com (×2), elektroniknet.de, zf.com, en.wikipedia.org/wiki/Seat_belt_pretensioner

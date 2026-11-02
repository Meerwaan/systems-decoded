# 031 — Anti-collision (TCAS / ACAS II) : deux machines se mettent d'accord, un seul équipage obéit

Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur.
Sources principales lues à la source : rapport BFU AX001-1-2/02 (mai 2004, traduction anglaise hébergée par SKYbrary, lue en texte intégral : synthèse, §1.1, §1.2, annexe TCAS, analyse) ; « Introduction to TCAS II Version 7.1 » (FAA, 2011, via SKYbrary) ; fiche EUROCONTROL « ACAS » ; bulletin IFALPA 12ATSBL09 (d'après EUROCONTROL ACAS Bulletin 14).

## Verdict sur l'angle

**Tient, avec deux ajustements.**
1. Les heures du rapport sont en UTC (21:35:32 UTC = 23:35:32 à Berlin, heure d'été) : le chrono du film peut partir de la ligne « TRAFFIC, TRAFFIC » (21:34:42) et finir à 36 s après l'ordre (21:35:32) : tout est dans le rapport, à la seconde.
2. L'inversion d'ordre n'est **pas** une invention de la version 7.1 : l'inversion (« reversal ») existe depuis la 7.0. La 7.1 l'a **améliorée** : elle contrôle si l'autre avion obéit, et inverse l'ordre de celui qui a obéi (voir §4 et §10). Corriger la fiche de départ.
Vu et revu : non testé sur les réseaux. L'accident est connu des passionnés d'aviation ; le grand public court-format connaît mal « les deux machines qui se parlent ». Le héros du film est la machine ; le fait rassurant final est réel (règle claire depuis ; version 7.1 obligatoire dans l'UE).

## 1. La scène

**Cas réel : Überlingen, lundi 1ᵉʳ juillet 2002, nuit.** [P] BFU, synthèse et §1.1.
- Collision à **21:35:32 UTC** (23:35:32 heure locale), au nord d'Überlingen, lac de Constance, à **34 890 ft** (relevé du FDR du Boeing). Nuit noire, visibilité ≥ 10 km. Les deux avions étaient en vol aux instruments, sous contrôle du centre de Zurich (Skyguide).
- **Tupolev Tu-154M** (charter Moscou-Domodedovo → Barcelone) : 9 membres d'équipage + 60 passagers = **69**. **Boeing 757-200 cargo** (Bergamo → Bruxelles, compagnie DHL, rapport : cargo parti de Bahreïn) : **2** membres d'équipage. **Total 71 morts, aucun survivant** [P, §1.2]. À ne pas montrer à l'écran.
- Tous deux à **FL 360** (35 968 ft sur l'enregistrement TCAS), routes qui se croisent (Boeing cap 004°, Tupolev cap 264° puis 274°).
- Le contrôleur est seul en salle (le second était parti se reposer, procédure de nuit à un poste), il gère aussi un Airbus A320 en retard vers Friedrichshafen [P]. Il ne voit le conflit que trop tard.
- Le centre voisin de Karlsruhe voit le conflit à 21:33:24 (alarme STCA) ; il tente **onze fois** d'appeler Zurich par la ligne directe : tonalité occupée puis sonnerie, de 21:33:36 à 21:34:45 [P, §1, centre de Karlsruhe]. Ligne et alarme sol étaient en maintenance (à vérifier dans le détail avant de le dire).
- Montrable sans victimes : deux points lumineux dans la nuit, l'écran TCAS, les voix. Pas d'impact. Respect.

### Chronologie à la seconde (UTC, [P] BFU §1.1 ; échantillonnage TCAS 2 s, erreur ±1 s)
| Heure | Événement |
|---|---|
| 21:34:36–38 | Équipage Tupolev : « Le voilà en vue », « il indique zéro » : ils cherchent l'autre avion |
| 21:34:42 | **TA « traffic, traffic »** dans les **deux** cockpits |
| 21:34:49 | Contrôleur au Tupolev : « descend FL 350, **expedite** » (message d'un peu moins de 8 s) |
| 21:34:56 | **RA sur le Tupolev : « climb, climb »** ; **RA sur le Boeing : « descend, descend »**, 14 s après le TA. Au même instant le Tupolev pousse le manche : il descend sur ordre du contrôleur |
| 21:34:59 | Copilote Tupolev : « Il dit : monte. » Commandant : « Il (le contrôleur) nous guide vers le bas. » Copilote : « Descendre ? » |
| 21:35:00 | Zurich : alarme STCA sonore, **entendue de personne** |
| 21:35:02 | Tupolev : le manche est tiré (6 s après le RA) : le taux de descente cesse d'augmenter |
| 21:35:03 | Contrôleur répète « descend FL 350, expedite » ; l'équipage Tupolev accuse réception |
| 21:35:10 | **Boeing : RA « increase descent »** (de 1 500 à 2 500 ft/min). Boeing déjà à ≈ 1 500 ft/min de descente |
| 21:35:19 | Boeing annonce au contrôleur : « TCAS descent ». Le contrôleur ne l'entend pas |
| 21:35:24 | **Tupolev : RA « increase climb »** (28 s après le premier RA). Il descend alors à ≈ 1 800 ft/min |
| 21:35:30 | Copilote Boeing : « descend hard ». Manche du Boeing poussé à fond environ 2 s avant |
| **21:35:32** | **Collision** ; le Boeing, en légère descente, cap 004°, percute le Tupolev (cap 274°) à 34 890 ft |

**Qui a obéi à qui** [P] : Boeing = TCAS (monte-descend : « descend » + « increase descent ») ; Tupolev = contrôleur (descendre), après avoir entendu son TCAS dire « climb ». Le contrôleur ne savait pas que les TCAS avaient parlé (le message « TCAS descent » du Boeing, à 21:35:19, n'est pas entendu). **36 s** entre le premier RA (21:34:56) et la collision (21:35:32) [calcul sur les heures du rapport]. **50 s** entre le TA (21:34:42) et la collision [calcul].

Distance donnée par le TCAS du Tupolev [P, tableau annexe, ±2 s d'échantillon] : 10,3 NM au TA ; 7,5 NM au RA ; 1,0 NM à 21:35:27. Cadence de fermeture ≈ 0,2 NM/s, soit ≈ 740 kt cumulés [O, calculé]. Pas de reversal RA : « conditions not given » [P, analyse].

## 2. Le système qui sauve

- **TCAS II = ACAS II** (Traffic alert and Collision Avoidance System, nom de l'OACI : ACAS). Il a été fait pour réduire le risque de collision en vol [P, FAA]. Il surveille **les avions qui ont un transpondeur** ; sans transpondeur actif, l'avion est invisible pour lui [P, BFU & FAA].
- **Qui l'a** : dans l'UE, tout avion civil de plus de **5 700 kg** de masse maximale au décollage ou autorisé à plus de **19 passagers** doit avoir l'ACAS II **version 7.1** (règlement UE 1332/2011, modifié par 2016/583 ; échéance 1ᵉʳ décembre 2015) [P, fiche EUROCONTROL]. Aux États-Unis : même seuil de masse, TCAS II [P, FAA]. En pratique, tout avion de ligne.
- **Efficacité** : EUROCONTROL estime que l'ACAS réduit d'un facteur **≈ 5** le risque de collision en Europe [P, EUROCONTROL] (« quand les RA sont suivis rapidement et correctement »).
- Un seul TCAS par avion, pas de redondance ; la liste d'équipements minimale (MEL) autorise à voler jusqu'à 10 jours en panne [P, BFU, ancien]. À ne pas dire sans date.
- Il est « le dernier rempart » : il ne donne un ordre que si les autres protections (séparation par le contrôle) ne suffisent plus [P, BFU].

## 3. Le mécanisme ouvert (pièces, séquence, seuils)

Pièces nommées [P, BFU annexe + FAA] :
1. **Calculateur TCAS** (« TCAS processor / computer ») : surveillance, suivi des intrus, détection de menace, choix de la manœuvre, annonces.
2. **Antenne supérieure directionnelle** et **antenne inférieure** (directionnelle sur la plupart des installations) : émettent à **1 030 MHz** dans quatre secteurs de 90°, à puissance variable ; reçoivent à **1 090 MHz** les réponses des transpondeurs.
3. **Transpondeur Mode S** (avec son panneau de commande, qui a le sélecteur « TA seulement / TA-RA ») : répond aux interrogations des autres avions, et porte le canal de coordination.
4. **Altimètre radio** (entrée du calculateur) : bloque les ordres trop près du sol (pas de « increase descent » sous 1 450 ft, plus aucun RA sous 900-1 100 ft, plus aucune annonce sous 400-600 ft) [P, BFU].
5. **Haut-parleur** : annonces vocales.
6. **Afficheur de trafic** (écran de navigation ou écran dédié) : symboles autour de l'avion.
7. **Indicateur de vitesse verticale (VSI/TRA) ou bandeau de vitesse verticale** : **arc rouge** = vitesses verticales à éviter, **arc vert** = vitesse à tenir [P, FAA ; BFU : plage rouge de −6 000 à +1 500 ft/min dans un exemple].
8. Le **transpondeur de l'autre avion** (pièce de l'autre !) : c'est lui qu'on interroge.

Séquence [P, FAA et BFU] :
- Le transpondeur Mode S émet environ **une fois par seconde** un message spontané (« squitter ») contenant son adresse 24 bits ; le TCAS d'en face l'entend et l'interroge **en général une fois par seconde** (toutes les 5 s au loin, 1 fois par seconde quand une alerte devient possible). Portée de surveillance garantie : **14 NM** ; suivi jusqu'à **30 avions** dans 30 NM [P, FAA]. (Le rapport BFU parle de zone de 40 NM devant / 15 NM derrière / 20 NM côtés / ±9 000 ft : figures différentes, [P] mais de contexte de présentation : ne pas les mélanger.)
- Chaque seconde, le calculateur recalcule le **temps avant le point de plus grande proximité (« tau »)**. Seuils à **altitude de croisière (20 000 – 42 000 ft)** : **TA à 48 s, RA à 35 s** ; à 5 000-10 000 ft : TA 40 s, RA 25 s (la fiche de départ « 40 s / 25 s » ne vaut pas en croisière) [P, FAA tableau 2 ; BFU : 48 s/35 s au-dessus de FL 200].
- **TA** (« TRAFFIC, TRAFFIC ») = alerte : le symbole de l'intrus devient un **cercle ambre plein**. Aucune manœuvre. **RA** : le symbole devient un **carré rouge plein** ; ordre vertical vocal. Autres symboles : losange plein blanc/cyan = trafic proche (moins de 6 NM et 1 200 ft) ; losange vide = autre trafic [P, FAA].
- **Coordination** : si l'autre avion est équipé, chaque TCAS envoie à l'autre, par la liaison Mode S, des **interrogations de coordination, une par seconde pendant toute la durée du RA** ; l'une dit à l'autre « je monte », ce qui **limite l'autre au sens descendant**. Règle : chacun vérifie s'il a reçu l'intention de l'autre avant de choisir ; s'il l'a reçue, il choisit le **sens opposé** ; si les deux déclarent la menace en même temps et choisissent le même sens, c'est celui qui a **l'adresse Mode S la plus haute** qui inverse [P, FAA p. 34]. Les ordres sont donc « toujours complémentaires » [P, BFU].
- **Ce que doit faire le pilote** : réagir **dans les 5 s** après l'affichage d'un RA, avec une accélération d'≈ 0,25 g, pour atteindre **1 500 ft/min** ; pour un RA de renforcement (« increase ») : **2,5 s**, 0,35 g, jusqu'à **2 500 ft/min** [P, FAA p. ≈ 24-25 ; BFU §3.2.3b et manuel TCAS]. Le BFU précise que le TCAS suppose la réaction dans les 5 s [P].
- **Ce que doit faire le contrôleur** : être informé (le pilote le lui annonce « dès que le temps et la charge le permettent ») ; après l'annonce, il **ne doit pas modifier la trajectoire** de l'avion avant que le pilote annonce « clear of conflict » (OACI Doc 4444, chap. 15, tel que cité par SKYbrary [S]). Le pilote doit agir « dans le sens du RA **même si cela contredit** l'élément vertical d'une instruction ATC » (EU-OPS 1.398, cité par SKYbrary [S]). Les cinq annonces vocales « officielles » du rapport : « Traffic, traffic », « Climb, climb » / « Descend, descend », « Increase climb/descent », « Climb/Descend now » (reversal), « Clear of conflict » [P, BFU]. (La 7.1 ajoute « Level off, level off » [P, FAA/IFALPA].)
- **Fin de l'alerte** : l'ordre cesse, « Clear of conflict » dans les deux cockpits, le pilote reprend son niveau autorisé et le dit au contrôleur.
- **Reversal (inversion)** : conditions du rapport pour qu'un TCAS version 7.0 inverse son ordre [P, BFU] : distance prévue au CPA plus grande dans le nouveau sens (> 100 ft), écart d'altitude déjà > 100 ft dans le nouveau sens, **pas avant 9 s** après le premier RA, et au moins 4 s avant la collision calculée. À Überlingen, ces conditions « n'étaient pas réunies » (pas de reversal). **Version 7.1** : ajoute un contrôle de conformité en rencontre coordonnée ; si un avion ne suit pas son RA, le TCAS 7.1 émet un RA d'inversion à l'avion qui obéit [P, FAA/IFALPA]. Le bulletin cite Yaizu 2001 et Überlingen 2002 comme les cas qui ont motivé ce changement. En France comme dans l'UE : obligatoire depuis le 1ᵉʳ déc. 2015 [P, EUROCONTROL].

## 4. Chiffres

| Chiffre | Source | Niveau |
|---|---|---|
| Collision 21:35:32 UTC, 34 890 ft, 1ᵉʳ juillet 2002 | BFU synthèse + §1.1 | [P] |
| 71 morts (69 Tupolev dont 60 passagers + 2 Boeing), 0 survivant | BFU §1.2 | [P] |
| TA 21:34:42 ; RA 21:34:56 ; collision 36 s après le RA, 50 s après le TA | BFU §1.1 (soustraction) | [P] |
| Contrôleur : instruction de descendre à 21:34:49, 7 s après le TA ; répétée 21:35:03 | BFU §1.1.2 | [P] |
| Tupolev : manche tiré 6 s après le RA (21:35:02) mais le taux de descente se maintient ≈ 1 500-2 600 ft/min | BFU | [P] |
| Boeing : descente 1 500 ft/min atteinte 12 s après coupure du pilote auto ; 2 600 ft/min à 21:35:20 | BFU §1.1.1 | [P] |
| RA « increase descent » 14 s après le premier ; « increase climb » 28 s après | BFU analyse | [P] |
| Seuils TA/RA en croisière : 48 s / 35 s ; à 5 000-10 000 ft : 40 s / 25 s | FAA tableau 2, BFU | [P] |
| Réaction pilote : 5 s, 0,25 g, 1 500 ft/min ; renforcement : 2,5 s, 0,35 g, 2 500 ft/min | FAA, BFU | [P] |
| Interrogation Mode S ≈ 1 fois/s en phase d'alerte ; 1/5 s au loin ; coordination 1/s | FAA p. 17, p. 34 | [P] |
| Portée garantie 14 NM, 30 avions suivis | FAA | [P] |
| Fréquences 1 030 MHz (interroge) / 1 090 MHz (reçoit) | BFU, FAA | [P] |
| ACAS divise le risque ≈ par 5 en Europe | EUROCONTROL | [P] |
| Obligation UE : > 5 700 kg ou > 19 sièges, v7.1 au 1/12/2015 | EUROCONTROL, règl. 1332/2011 | [P] |
| Jusqu'à 23 mauvaises réponses/an au RA « adjust vertical speed » avant la 7.1 | IFALPA/EUROCONTROL | [S] |
| Au plus 7 cas/an où la 7.0 n'a pas inversé (Yaizu 2001, Überlingen 2002) | IFALPA/EUROCONTROL | [S] |

## 5. Ce qui retourne une idée reçue (candidates de chute)

1. **La machine ne pilote pas : elle ordonne, et son ordre prime sur celui du contrôleur.** « Au-dessus de 10 000 mètres, le dernier mot n'est pas celui du contrôleur. C'est celui de la machine. » Base : BFU « only one procedure can be permitted in case of an RA » [P] ; EU-OPS 1.398 [S].
2. **La machine avait raison : c'est la désobéissance qui a tué, pas le système.** Les deux TCAS ont donné des ordres opposés et complémentaires — monte / descends — dans la même seconde (21:34:56) [P]. L'un des équipages a suivi la machine, l'autre le contrôleur ; les deux ont descendu. À dire avec tact : la formulation du rapport est « contradictory to the TCAS RA », pas de jugement sur les personnes.
3. **« Les machines se parlent pour que personne ne choisisse »** : chaque TCAS ne choisit son sens qu'après avoir lu l'intention de l'autre, qui lui arrive sur la même ligne de 1 030 MHz [P, FAA p. 34] ; en cas de choix simultané, l'adresse Mode S la plus haute inverse. Chute : « Personne n'est d'accord au sol. Au-dessus des nuages, les deux machines, si. »

## 6. La question du commentaire (fermée, deux camps, un mot)

1. « En dernier recours, tu laisses la décision à une machine… ou à un humain ? » (Machine / Humain) — pas « à qui obéis-tu » (le film y répond).
2. « Un pilote qui désobéit à un ordre qu'il ne comprend pas : tu le suis… ou tu l'excuses ? » : trop moralisateur, écarter.
3. « Cinq secondes pour obéir à la machine : tu y arrives… ou tu hésites ? » (Y arrive / Hésite). Fait peur : la réponse honnête est « j'hésite ».
Recommandation : n°1 ou n°3. Rien à lire chez soi ici (pas de tableau dans la cuisine) : la question de l'accroche reste la plus forte.

## 7. L'histoire du système

- Premières études de collision : après la collision aérienne du Grand Canyon (1956), l'idée d'un anticollision embarqué. Le calcul du « tau » (le temps avant le point de plus grande proximité, plutôt que la distance) est dû à Morrell, de Bendix [P, FAA p. 5-6 : « Morrell of Bendix »].
- Le **TCAS II** : FAA l'a mis au point dans les années 1980 ; une collision de 1986 (un DC-9 et un avion léger) est citée par la FAA comme déclencheur de l'obligation de 1989 (TCAS II sur tout avion de ligne avant fin 1991) [P, FAA p. 7-9, lu en partie : nom de l'accident, « Cerritos », NON relu, ne pas le dire].
- **Version 7.0** : 1999-2000 en Europe, ajoute notamment l'inversion de sens. **Version 7.1** : normes approuvées en juin 2008 ; en Europe obligatoire sur les neufs à partir du 1ᵉʳ mars 2012, tous au 1ᵉʳ décembre 2015 [P, FAA ; IFALPA].
- Après Überlingen, le BFU a émis des recommandations OACI pour la formation des équipages et des consignes sans ambiguïté, et pour que les RA soient transmis au sol par liaison de données (Recommandations 07/2004 et 08/2004) [P, BFU]. La date exacte du changement de procédure OACI **n'a pas été relue** : ne pas la citer.

## 8. Pour l'annonce (phrase pour la fin du 031, vers le 032)

**Phrase proposée (17 mots) :** « Prochain dossier : la barre qui ouvre une porte d'une poussée, née d'une autre porte qui ne s'ouvrait pas. »
Alternative avec un seul fait chiffré (20 mots) : « Prochain dossier : une barre qui ouvre une porte d'une poussée, inventée après la mort de cent quatre-vingt-trois enfants. »

Fait vérifié pour le 032 (barre anti-panique), un seul, sûr : **Victoria Hall, Sunderland, samedi 16 juin 1883 : 183 enfants (de 3 ou 4 à 14 ans) sont morts écrasés dans l'escalier ; la porte au pied de l'escalier s'ouvrait vers l'intérieur et était verrouillée de sorte qu'un seul enfant passe à la fois.** [S : Université de Sunderland (wp.sunderland.ac.uk/seagullcity) ; Wikipédia « Victoria Hall disaster » ; fiche municipale Sunderland non lue : 403]. Nombre de morts concordant dans toutes les sources (183). **Lien avec la barre** : Wikipédia (« Crash bar ») dit que cette catastrophe a motivé l'invention de Robert Alexander Briggs (né en 1868, brevet britannique du 13 août 1892 pour un « panic bolt » à barre horizontale) [S] ; le lien causal est de seconde main : dire « inspirée de » seulement avec prudence. Source primaire du brevet **non lue**. Alternative américaine : incendie de l'Iroquois Theatre (Chicago, décembre 1903, au moins 602 morts d'après Wikipédia, 596 selon l'Indiana Encyclopedia : chiffre divergent, ne pas le dire), qui a mené Carl Prinzler (Indianapolis) à développer ses barres [S]. Norme : **NF EN 1125** (« Quincaillerie pour le bâtiment — Dispositifs d'issue de secours commandés par une barre horizontale ») ; version en vigueur : juin 2008 d'après AFNOR ; **l'amendement A1 est annulé** [S, boutique AFNOR via recherche]. Valeur de 80 N : vient de déclarations de performance de fabricants (Forster), **pas de la norme lue** : ne pas la dire.
Ton : enfants morts : jamais montrés, jamais détaillés dans l'annonce (la phrase proposée n°1 ne les cite pas).

## 9. À ne pas dire

- **« Le TCAS inverse l'ordre depuis la version 7.1 »** : faux sous cette forme. L'inversion existe dès la 7.0 ; la 7.1 la rend capable de détecter qu'un avion ne suit pas son RA [P].
- « TA à 40 s / RA à 25 s » en croisière : non, c'est 48 s / 35 s au-dessus de 20 000 ft (40/25 vaut vers 5 000-10 000 ft) [P].
- « Les deux avions étaient en descente depuis des heures » : faux ; tous deux à FL 360, en palier, jusqu'à 21:34:5x.
- « Le pilote du Tupolev n'a pas entendu le TCAS » : faux. Il l'a lu (« il dit : monte ») [P].
- « Le contrôleur a donné un ordre contraire au TCAS parce qu'il ignorait le TCAS » : il ne savait pas que les TCAS avaient parlé ; le rapport décrit surtout des carences organisationnelles (poste unique la nuit, alarme sol en maintenance, ligne téléphonique en panne) [P].
- Ne pas accuser une personne ; le rapport note aussi que les procédures OACI étaient ambiguës [P]. Le contrôleur est mort en 2004 : **ne pas évoquer** (sujet hors film, source non lue ici).
- « Le TCAS évite toute collision » : non ; il ne voit pas un avion sans transpondeur actif [P], et il ne fait rien au sol ni près du sol.
- « Le pilote automatique obéit tout seul au TCAS » : non, c'est le pilote qui manœuvre (ou le coupe) ; le rapport montre le pilote automatique coupé avant chaque manœuvre [P]. (Des avions récents peuvent le faire sur certaines installations : non relu, ne pas affirmer.)
- « DHL » : le rapport parle d'un cargo (compagnie à relire avant de la nommer à l'écran).
- Les chiffres de **40 NM / 15 NM / 20 NM / ±9 000 ft** du rapport et le « 14 NM » de la FAA se contredisent apparemment : n'en donner aucun comme « portée » sans choisir une seule source.
- « 45 enfants à bord du Tupolev » : non relu dans ce lot (rapport BFU sans cette information dans les sections lues) ; ne pas le dire.
- Tailles et matières des antennes/boîtier : non sourcées ici.

## 10. Ce que la voix peut dire (dix phrases, vraies telles quelles)

1. « Deux avions de ligne, même altitude, même nuit. Leurs routes se croisent. »
2. « Trente-cinq secondes avant le point le plus proche, la machine se réveille. »
3. « Chaque seconde, chaque avion interroge l'autre. Chaque seconde, il lit sa réponse. »
4. « Avant de choisir, une machine lit l'intention de l'autre. Puis elle prend l'autre sens. »
5. « L'une dit : monte. L'autre dit : descends. Jamais les deux la même chose. »
6. « Tu as cinq secondes pour obéir. Et un taux précis : quinze cents pieds par minute. »
7. « Le premier mot est une alerte : traffic, traffic. Le deuxième est un ordre. »
8. « Un seul avion sur les deux a suivi sa machine. »
9. « Trente-six secondes entre le premier ordre et la collision. »
10. « Depuis, le pilote suit la machine, même si le contrôleur dit l'inverse. »

Contrôle de factualité des phrases : 2 (35 s = seuil RA en croisière, FAA/BFU) ; 3 (1 fois/s en phase d'alerte, FAA) ; 4 (FAA p. 34) ; 5 (BFU : « toujours complémentaires ») ; 6 (FAA/BFU) ; 7 (BFU) ; 8 (BFU : le Boeing a suivi le RA, le Tupolev a suivi l'ATC) ; 9 (BFU, 21:34:56 → 21:35:32) ; 10 (BFU, EU-OPS 1.398 [S] ; formulation « depuis » : règle précisée avant la fin des années 2000, date exacte non relue).

## 11. Sources (ce qui y a été lu)

- **[P]** BFU, Investigation Report AX001-1-2/02, mai 2004 (traduction anglaise ; l'original allemand fait foi) : https://skybrary.aero/sites/default/files/bookshelf/414.pdf — lu : synthèse, §1.1.1 (Boeing), §1.1.2 (Tupolev), §1.2 (blessures), annexe TCAS (composants, logique, tableau des annonces, taux requis), analyse (reversal, délai 14 s / 28 s), conclusion « only one procedure », recommandations 07-08/2004. L'URL bfu-web.de directe a répondu 404 (non lue).
- **[P]** FAA, « Introduction to TCAS II Version 7.1 » (février 2011), via https://skybrary.aero/sites/default/files/bookshelf/3340.pdf — lu : symboles, arcs rouge/vert, tableau des seuils, surveillance (1030/1090 MHz, 14 NM), coordination (p. 34), reversal v7.0 et 7.1, réponse 5 s/2,5 s. Les pages faa.gov directes : 403.
- **[P]** EUROCONTROL, page « ACAS » : https://www.eurocontrol.int/system/acas — lu : obligations (5 700 kg / 19 sièges), v7.1 au 1/12/2015, facteur 5.
- **[P]** IFALPA 12ATSBL09 (février 2012), d'après EUROCONTROL ACAS Bulletin 14 : https://ifalpa.org/media/2006/12atsbl09-tcas-v71-bulletin.pdf — lu : « Level off », amélioration du reversal, Yaizu 2001 et Überlingen, 7.1 obligatoire dès le 1/3/2012.
- **[S]** SKYbrary, « ACAS Regulation and Procedures » : https://skybrary.aero/articles/acas-regulation-and-procedures — lu : citation EU-OPS 1.398, texte de l'OACI Doc 4444 chap. 15 (contrôleur), amendement 85 de l'annexe 10.
- **[S]** Wikipédia, « Victoria Hall disaster » ; « Crash bar » ; Université de Sunderland, https://wp.sunderland.ac.uk/seagullcity/victoria-hall-disaster/ — lus ; fiche municipale de Sunderland et biographie de Briggs (scottisharchitects.org.uk) : erreur 403, non lues.
- **[S]** AFNOR boutique, NF EN 1125 (via recherche), fiches fabricants Forster (80 N) : pages de recherche, texte de la norme non lu.
- Non lus : Rapport FAA « lessons learned » (403) ; SKYbrary ACAS (429) ; SKYbrary « TCAS II version 7.1 » (non ouvert).

Requêtes utilisées : 24 sur 30 (recherches et pages ouvertes comptées).

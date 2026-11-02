# 033 — La porte d'avion de ligne : en vol, personne ne peut l'ouvrir, même en le voulant

Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur / calcul maison.
Requêtes web utilisées : 27 sur 30.

## 1. Verdict sur l'angle

**Tient, avec un ajustement.** « Personne ne peut l'ouvrir en vol » est vrai à l'altitude de croisière (la pression plaque la porte, ≈ 8 tonnes-force). Mais Asiana 8124 est la preuve qu'elle s'ouvre quand le différentiel de pression tombe vers zéro (≈ 200 m, approche). L'angle fort devient donc : **« ce n'est pas un verrou qui la tient, c'est l'air »** — et c'est ce qui rend Asiana et la descente intéressantes (la protection disparaît avec l'altitude).
Vu et revu ? Le sujet « un passager ouvre la porte » circule beaucoup (clips Asiana, Delta 2349, etc.), mais l'explication par le calcul des tonnes et les butées (stops) est rarement montrée en 3D. À traiter par la mécanique, pas par l'anecdote.
Attention : ne pas confondre la porte passagers (A320) et le « door plug » du 737-9 (Alaska 1282), qui est un panneau de remplissage à la place d'une porte, jamais ouvert par un passager.

## 2. La scène

Scénario typique sourcé [S] : un passager tente d'ouvrir une porte en croisière (EasyJet Londres-Pise, SpiceJet Delhi-Varanasi, Delta 2349 Atlanta-Boston, Jeju Air Cebu-Incheon) : maîtrisé par l'équipage/passagers, **porte restée fermée** ; EasyJet et SpiceJet disent que c'est impossible à cause de la pressurisation. Source : liste d'articles de presse trouvée en recherche (non ouverts un par un) — ne citer aucune compagnie nominativement sans les rouvrir.

Cas réel daté : **Asiana OZ8124, A321-200 (HL8256), Jeju → Daegu, 26 mai 2023** [S]. Un passager (30 ans, assis près de la sortie) actionne le levier d'une porte de secours juste avant l'atterrissage ; la porte s'ouvre à ≈ 200 m (Asiana : « about 200 metres » ; ministère coréen via UPI : 700 pieds ≈ 213 m ; autres presses : 250 m — **dire « environ 200 mètres »**). 194 personnes à bord, atterrissage normal, 9 blessés légers (AirlineRatings / JoongAng), toboggan déchiré (Wikipedia/BBC). Constat intermédiaire du ministère (MOLIT), relayé par la presse coréenne [S] : la porte peut s'ouvrir quand la différence de pression dedans/dehors est faible ; le siège, proche de la sortie, permet de toucher le levier ceinture bouclée ; l'A321 n'a pas de verrouillage automatique de la sortie. **Rapport final de la commission coréenne (ARAIB) : non trouvé, non lu.** Le passager a dit croire l'avion posé.

À **montrer** : la porte vue de l'intérieur sur sa butée ; flèches de pression qui la plaquent ; la même porte à 200 m avec flèches qui s'éteignent.
Éviter : toboggan (une phrase au plus, dossier L03).

## 3. Le système qui sauve

Ce n'est pas un dispositif : c'est une **géométrie + la pression de la cabine**. Toute porte de cabine pressurisée d'un avion de ligne (A320, 737, A330, etc.) est de type « bouchon » ou « semi-bouchon » : plus grande que l'ouverture, elle s'appuie à l'intérieur sur des butées [S Wikipedia plug door ; brevets ; NTSB pour le 737 plug]. Tous les avions pressurisés l'ont. Réglementairement : 14 CFR 25.783 exige des moyens de protéger chaque porte contre l'ouverture en vol (pannes mécaniques, structure) et contre l'action inopinée des personnes [P, texte lu sur law.cornell.edu] ; CS-25.783 EASA : **non lue**.

## 4. Le mécanisme ouvert

Pièces avec le mot du métier (niveau variable, voir étiquettes) :
1. **Butées / stops** — côté porte « stop fittings » (avec « stop pins ») qui s'appuient sur les « stop pads » du cadre fuselage ; sur le 737-9 : 12 stop fittings (6 par côté) [P NTSB AIR-25-04]. Sur l'A320 le schéma de formation Lufthansa Technical Training étiquette « door stops » [S, via résultat de recherche, PDF non ouvert].
2. **Cadre de porte renforcé (door frame / door surround)** : reçoit la charge [S].
3. **Poignée intérieure / extérieure** (inner / outer handle) et **crochets de verrouillage (locking hooks) sur arbre de verrouillage** [S, formation A318/A330 vue en extrait].
4. **Bras de porte / charnière (hinge arm)** et **barre de torsion (torsion bar)** qui compense le poids de la porte [S, extrait de formation].
5. **Joint de porte (door seal)** [S — non vérifié par source ouverte, nom courant].
6. **Volet d'évent (vent flap)** : évacue la pression résiduelle avant que la porte se libère [S, brevet + Airbus Safety First via recherche].
7. **Voyant d'avertissement de pression résiduelle (Residual Pressure Warning Light)** : clignote si le toboggan est désarmé, moteurs coupés ou avion au sol, et pression résiduelle au-dessus d'un seuil ; alerte ECAM « CAB PR EXCES RESIDUAL PR » [S : Airbus Safety First, article « Preventing violent door opening due to residual cabin pressure », 30/10/2018 ; corps de l'article non lu, seulement l'intro et le résumé de recherche]. Airbus note aussi : résistance plus forte de la poignée ou sifflement = pression résiduelle.
8. **Soupape de sortie (outflow valve)** : règle la pression cabine ; à l'atterrissage elle s'ouvre pour amener le différentiel à ≈ 0 (principe général ; valeurs A320 non sourcées).

Pour le 737 plug (Alaska) [P NTSB] : stop fittings/stop pads, **upper guide fittings + upper guide rollers**, **lower hinge assemblies**, **vertical movement arrestor bolts** (dans le guide fitting inférieur de la charnière), **upper guide track bolts**, **castle nut + cotter pin**, **lift assist springs** (≈ 50 lb chacun). Pour ouvrir le plug : retirer les boulons, **soulever** le plug jusqu'à ce que les stop fittings passent au-dessus des stop pads (≈ 0,5 pouce de dégagement quand les upper guide fittings quittent les rouleaux), puis le pousser vers l'extérieur.

**Séquence d'ouverture d'une porte bouchon** [S/O] : (1) on actionne la poignée → les verrous se rétractent, (2) la porte doit d'abord bouger **vers l'intérieur/lever** pour dégager les butées, (3) puis pivoter vers l'extérieur. En vol, l'étape 2 est contrée par la pression qui pousse la porte dans l'autre sens, contre les butées. Les détails exacts de la cinématique A320 (lève ? tire ?) : **non sourcés par un document Airbus** — l'image reconstitue.

## 5. Chiffres

| Chiffre | Source | Niveau |
|---|---|---|
| Altitude cabine ≤ 8 000 ft (≈ 2 400 m) en fonctionnement normal | 14 CFR 25.841(a) (law.cornell.edu) ; NTSB : « maximum cabin pressure altitude is about 8,000 ft » | **P** |
| Différentiel max A320 ≈ 8,6 psi ≈ 0,59 bar (réglage soupape de sécurité) | résumés de limitations A320, non TCDS | **S** (TCDS EASA.A.064 non lu) |
| Différentiel en croisière ≈ 7,5–8 psi ≈ 0,52–0,55 bar | calcul : cabine 8 000 ft ≈ 75 kPa, ambiant FL370 ≈ 21 kPa → ≈ 54 kPa | **O** |
| Porte A320 type I ≈ 1,85 m × 0,81 m (1,81 m selon une autre source) | blog de spécifications et fiche de recherche ; Airbus Aircraft Characteristics lu : ne donne que des gabarits de dégagement, pas la taille de la porte | **S/O** |
| Surface ≈ 1,5 m² | 1,85 × 0,81 | **O** |
| **Force ≈ 55 000 Pa × 1,5 m² ≈ 82 kN ≈ 8,4 tonnes-force** (≈ 9 t à 8,6 psi) | calcul maison | **O** — dire « environ huit tonnes » ; l'aire d'appui réelle est celle de l'ouverture |
| Porte de secours : en dessous de 1/2 psi la porte doit rester fermée par ses verrous (25.783(h)) | law.cornell.edu (résumé du lecteur, à rouvrir avant de citer) | **S** |
| 737-9 plug : ≈ 29 po × 59 po ; 12 stop fittings ; 4 boulons manquants | NTSB AIR-25-04 | **P** |
| Alaska 1282 : 5 janv. 2024, ≈ 14 830 ft après le décollage de Portland, 177 personnes, 1 PN + 7 passagers blessés légers | NTSB AIR-25-04 | **P** |
| Asiana : ≈ 200 m (213 m = 700 ft) | Asiana ; ministère via UPI/Asiae | **S** |
| Boîte noire (ED-112A) : 3 400 g pendant 6,5 ms ; 1 100 °C pendant **60 min** (pas 30) ; 260 °C pendant 10 h ; 6 096 m (20 000 ft) 24 h ; immersion 30 jours | fiche constructeur ETEP / Curtiss-Wright (ED-112A) ; norme non lue | **S** |

## 6. Ce qui retourne une idée reçue

1. **« C'est un verrou qui la tient fermée » → c'est l'air.** Dans l'A320 la porte est plus grande que son cadre et se coince contre les butées ; les verrous ne servent presque pas en croisière : la pression de la cabine pousse la porte contre ses butées avec ≈ 8 t. [S/O]
2. **« Plus on monte, plus c'est dangereux d'ouvrir » → plus on monte, plus la porte est fermée.** Le danger revient à la descente, quand le différentiel tombe : Asiana a ouvert à ≈ 200 m. [S]
3. **Alaska 1282 : la porte tient par des butées, les butées tiennent par quatre boulons.** Sans les 4 boulons (jamais remis après réparation chez Boeing), le plug est monté de fractions de pouce jusqu'à passer au-dessus de ses butées et s'est arraché à 14 830 ft. [P NTSB] Retournement : ce n'est pas la pression qui a fait céder une porte « faible » ; c'est la pièce qui empêche de monter qui manquait.

## 7. La question du commentaire (fermée, deux camps, un mot)

- « Pour ouvrir une porte d'avion, il faut d'abord la pousser… dehors ou dedans ? » — réponse : dedans (puis lever) — **non sourcé pour l'A320** (voir §4).
- « À 10 000 mètres, c'est un verrou qui la tient… ou l'air ? » — un mot : « l'air ».
- Lecture chez soi : « La prochaine fois, regarde la porte de ton avion : tu vois ses butées… ou rien ? » (le spectateur peut vérifier ; dommage s'il ne regarde pas : sécurité).

## 8. L'histoire du système

Les portes bouchon s'imposent avec les cabines pressurisées de l'après-guerre (Comet, puis Boeing 707). Dates exactes : **non sourcées** ; ne pas dire. Retenir : la règle américaine (14 CFR 25.783) exige que chaque porte soit protégée contre l'ouverture en vol ; après Alaska 1282, le NTSB (rapport AIR-25-04, probable cause juin 2025) accuse la formation, les consignes et la surveillance de Boeing, avec l'oversight de la FAA en facteur contributif. [P NTSB]

## 9. Pour l'annonce

« Prochain dossier : la boîte noire. Elle n'est pas noire, elle est orange, et la réglementation l'exige. » (16 mots)
Fait : couleur orange distinctif exigée pour les conteneurs d'enregistreurs, avec matière réfléchissante — Singapour AS-2 et une notice de l'aviation civile malaisienne reprenant Annex 6 [S] ; **ICAO Annex 6 non lue**. Variante chiffrée : « …elle encaisse trois mille quatre cents g » (ED-112A, **S**, fiche constructeur).

## 10. À ne pas dire

- « L'avion peut s'ouvrir sur ordre du pilote » : faux/sans objet.
- « 30 minutes à 1 100 °C » : c'est l'ancienne durée / la norme ED-155 (15-30 min). ED-112A : 60 min.
- « Il y a des tonnes de pression : un type ne peut pas » : le calcul donne ≈ 8 t-force, mais c'est la **butée** qui encaisse, pas le passager. Ne pas dire « 80 000 N » sans « environ ».
- « La porte d'Alaska 1282 était une porte passagers » : c'était un panneau de remplissage (door plug), pas une porte utilisée.
- « Le passager d'Asiana a ouvert en vol à haute altitude » : faux, ≈ 200 m, à l'approche.
- « 700 pieds » est une donnée ministérielle relayée par UPI ; dire « environ 200 mètres ».
- « Une porte A320 est exactement 1,85 × 0,81 » : source secondaire.
- Rien sur toboggan/barre d'arrimage/90 secondes/JAL 516 (dossier L03).
- Ne pas affirmer que la porte A320 « se soulève » ou « s'ouvre vers l'intérieur d'abord » sans l'avoir vu dans un document Airbus.

## 11. Ce que la voix peut dire (vraies telles quelles)

1. Un passager a ouvert une porte à deux cents mètres du sol.
2. Il avait ceinture bouclée. L'avion descendait.
3. En croisière, la même poignée ne bougerait pas.
4. Une porte d'avion est plus grande que son cadre.
5. Elle s'appuie de l'intérieur sur des butées.
6. En croisière, l'air pousse sur elle d'environ huit tonnes.
7. Les butées encaissent. La poignée, presque rien.
8. Plus l'avion monte, plus la porte est fermée.
9. À l'atterrissage, la pression tombe vers zéro.
10. Sur le vol Alaska 1282, quatre boulons manquaient. Les butées ont lâché.

## 12. Sources

- NTSB, rapport final AIR-25-04, vol Alaska 1282 (lu en PDF) : https://www.ntsb.gov/investigations/AccidentReports/Reports/AIR2504.pdf — résumé, 14 830 ft, plug 29×59 po, 12 stop fittings, composants, boulons manquants, 8 000 ft cabine **[P]**. Page enquête : https://www.ntsb.gov/investigations/Pages/DCA24MA063.aspx **[P]**.
- 14 CFR 25.783 : https://www.law.cornell.edu/cfr/text/14/25.783 — lu, via résumé de WebFetch **[P]**. 25.841 : https://www.law.cornell.edu/cfr/text/14/25.841 — 8 000 ft, soupapes **[P]**. CS-25.783 EASA : non lue.
- Airbus A320 Aircraft Characteristics, juin 2024 : https://aircraft.airbus.com/sites/g/files/jlcbta126/files/2024-06/AC_A320_0624.pdf — lu : dégagements de portes, pas de taille de porte **[P, pas utile]**.
- Airbus Safety First, résidu de pression : https://flightsafety.airbus.com/2018/10/30/preventing-violent-door-opening-due-to-residual-cabin-pressure/ — seule l'intro lue ; reste vu en résumé de recherche **[S]**.
- Wikipedia « Plug door » https://en.wikipedia.org/wiki/Plug_door **[S]** ; brevets (US11691710, US5540404) en résultats de recherche, non ouverts **[S]**.
- Asiana 8124 : Asiae (articles du 26-27/05/2023, ex. https://www.asiae.co.kr/en/article/2023052708294483577), UPI https://www.upi.com/Top_News/World-News/2023/05/27/South-Korea-plane-door/1901685215208/, AirlineRatings, JoongAng Daily, Wikipedia https://en.wikipedia.org/wiki/Asiana_Airlines_Flight_8124 (BBC cité) — **tous [S], lus en résumé** ; accès direct aux articles Asiae : erreur ECONNRESET. Rapport ARAIB : non trouvé.
- Tentatives en croisière : results de recherche (EasyJet, SpiceJet, Delta 2349, Jeju Air, American) **[S]**, non ouverts.
- Boîte noire : ETEP Sentinel CSMU https://www.etep.com/products/sentinel-csmu (lu : 3 400 g/6,5 ms, 1 100 °C/60 min, 260 °C/10 h, 6 096 m, orange) **[S]** ; Curtiss-Wright (datasheet, résumé de recherche) **[S]** ; CAAS AS-2 rev2 et notice malaisienne AN 83 (couleur orange, matière réfléchissante, balise 90 jours) via recherche **[S]** ; TSB Canada https://bst.gc.ca/... : erreur 403, **non lu**.

## À ré-ouvrir avant le script
Sourcer : (a) la cinématique de la porte A320 (manuel Airbus), (b) le seuil de la pression résiduelle (corps de l'article Safety First), (c) la taille de porte A320 (TCDS/ACAP), (d) le rapport ARAIB d'Asiana 8124.

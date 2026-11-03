# L05 — Hudson (US Airways 1549) : la check-list était faite pour 20 000 pieds, l'avion était à moins de 3 000

Genre : affaire. Rédigé le 02/11/2026. Source maîtresse : **NTSB, Aircraft Accident Report NTSB/AAR-10/03** (adopté le 4 mai 2010), PDF intégral ouvert et converti en texte, lu en local : https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR1003.pdf. Les numéros de page ci-dessous sont ceux du rapport. 36 requêtes web utilisées sur 45.

Niveaux : **[P]** source primaire lue · **[S]** source secondaire · **[O]** ordre de grandeur / non confirmé.

## 1. Verdict sur l'angle

**Tient, avec un ajustement.** Le rapport confirme l'angle mot pour mot : la check-list « Engine Dual Failure » a été conçue pour une double panne **au-dessus de 20 000 pieds**, Airbus « n'avait pas envisagé » une check-list de basse altitude, elle faisait 3 parties / 3 pages, l'équipage n'a fait que la partie 1 (environ un tiers), et ce qui a le plus servi (démarrer l'APU) n'était pas dans l'ordre de la check-list [P, p. 52-54, 87-88]. Le héros-système existe : check-list, APU, protections de vol de l'A320 (« loi normale »).

**Ajustement 1 : « ce qui te protège aujourd'hui » est plus mince et plus nuancé que prévu.** Ce qui est **vérifié** comme changé : la règle FAA de 2023 qui impose un test d'ingestion d'oiseau **dans le cœur** du moteur (14 CFR 33.76(e), entrée en vigueur le 5 juin 2023, qui cite explicitement le vol 1549 et les recommandations A-10-64 et A-10-65) [P]. Ce qui **n'a pas** été suivi : en 2016, sur 35 recommandations, 6 seulement appliquées, 14 « closed-unacceptable » par le NTSB, dont l'exigence de check-list basse altitude et les gilets obligatoires sur tous les vols [S, AP 2016]. Le film peut le dire : c'est honnête et c'est une relance (« ce qui a changé, et ce qui ne l'a pas fait »). La confirmation actuelle (statuts CAROL) n'a **pas** pu être lue.

**Ajustement 2 : le bouton « ditching » ne peut pas être un fait du film.** Le rapport décrit ce qu'il ferme mais ne dit pas s'il a été pressé (voir § 4).

**Vu et revu ?** Oui, très : film *Sully* (2016), documentaires, animations, enregistrement ATC. Autocomplétion YouTube (relevée le 02/11/2026, via suggestqueries) : « miracle de l'hudson » → 2 suggestions seulement, dont « …film complet en français » ; « amerrissage hudson » → 6 suggestions (vidéo, documentaire, film, « atterrissage hudson 2009 ») ; « hudson river landing » (EN) → 14 suggestions (audio, atc, cockpit recording, cctv, animation, real footage, rescue…) ; « sully » → « sully crash scene », « sully plane crash » ; « hudson » seul → rien d'aérien. Lecture : la **demande existe** et passe par « amerrissage », « film », « vidéo », « atc » ; le « miracle de l'Hudson » en français est peu saturé en suggestions. Notre angle (la check-list, le plan qui ne colle plus, l'APU hors-ordre, les simulations) est ce que le film et les vidéos « footage » ne font pas.

## 2. La scène

**Cas réel daté.** Jeudi 15 janvier 2009, LaGuardia (New York), A320-214 immatriculé N106US, vol US Airways 1549 vers Charlotte. Décollage piste 4 à 15:24:54 (autorisation) ; 150 passagers (dont un enfant sur les genoux) et 5 membres d'équipage ; collision avec des bernaches du Canada à 15:27:11 ; amerrissage sur l'Hudson à 15:30:43 ; tout le monde évacué et secouru. Un membre du personnel de cabine et quatre passagers grièvement blessés ; avion « substantiellement endommagé » [P, p. 1]. Température de l'air −7 °C, eau du fleuve 5,2 °C (41,4 °F), courant de jusant 1,4 nœud [P, p. 1565-1571 du texte ; NOAA buoy BATN6-8518750 cité par le rapport].

**Ce qu'on peut montrer** (notre 3D, à l'heure du rapport) : la montée piste 4 ; l'impact ; la décélération des deux moteurs (N1 gauche 82 → 35 %, droit 82 → 15 % [P, p. 47]) ; la trajectoire (figure 1 du rapport) ; le virage vers LaGuardia puis l'abandon ; la descente 1 200 → 200 ft en une minute ; les volets 2 à 270 ft ; l'impact à 125 nœuds ; l'évacuation sur les ailes et les toboggans-radeaux ; le premier navire à 15:34:40.

## 3. Le système qui sauve

Pas une personne : **un ensemble**.
1. **La check-list QRH « ENG DUAL FAILURE »** (US Airways, révision du 11/02/2008), 3 parties, 3 pages [P, p. 52-53, 87].
2. **L'A320 fly-by-wire en « loi normale »** : protection d'incidence (alpha-protection), « l'avion ne peut pas décrocher en loi normale » [P, p. 12]. Elle n'est restée active que parce que l'APU a fourni l'électricité [P, p. 88].
3. **L'APU** (groupe auxiliaire de puissance) : source d'électricité de remplacement quand les deux moteurs ne tournent plus assez (un IDG ne fournit du courant que si N2 ≥ environ 54 %) [P, p. 13].
4. **Les toboggans-radeaux avant** : l'avion était équipé pour un vol long au-dessus de l'eau alors que ce n'était pas obligatoire pour cette route [P, probable cause, p. xi / résumé].
5. **La chaîne de secours sur le fleuve** : les ferries de New York Waterway, premiers sur place ; 1 navire à 15:34:40 d'après l'analyse vidéo ; sept ferries en 10 minutes ; bateau des pompiers de New York à 8 minutes ; garde-côtes à 17 minutes ; tous secourus en environ 20 minutes [P, p. 41-42, 2.9].
Qui l'a : tous les A320 de la compagnie ; la check-list est celle du constructeur, reprise par l'exploitant.

## 4. Le mécanisme ouvert (pièces nommées)

Pièces à ouvrir en vue éclatée (le mot du pro entre parenthèses) :
1. **Moteurs CFM56-5B4/P** (turbosoufflantes double corps ; soufflante + compresseur basse/haute pression + chambre de combustion + turbines) [P, p. 14-16, 1087]. Cœur du dossier : une oie entrée **dans le cœur** de chaque moteur.
2. **Calculateur moteur FADEC** : le rapport conclut que si le système avait indiqué que les moteurs étaient irrécupérables, l'équipage n'aurait pas perdu 30-40 s à tenter des rallumages [P, conclusion 7].
3. **APU** + générateur auxiliaire (remplace un IDG) [P, p. 13, 2.3.1].
4. **Génératrice de secours / RAT (éolienne de secours)** : se déploie seule si toute l'électricité est perdue et vitesse > 100 nœuds ; trouvée sortie à la récupération [P, p. 13]. Le rapport dit aussi qu'elle n'a pas eu besoin d'être déployée à la main [p. 2874 du texte, extrait lu sans le contexte complet : à confirmer avant de l'écrire].
5. **Calculateurs de commandes de vol (FAC 1 / loi normale / alpha-protection)** : seuil d'incidence passant de 8° à 14,5° avec CONF 2 ; alpha-max 11° → 17,5° [P, p. 47].
6. **Mini-manche (sidestick)** : sous 100 ft de radio-altitude le système atténue les ordres à cabrer ; manche à fond arrière (16°) à 15:30:41 [P, p. 47-48, 1.16.1.2].
7. **Volets / becs** (position CONF 2) : la check-list disait qu'après double panne seuls les becs sont disponibles ; les données montrent que les trois circuits hydrauliques n'indiquaient pas de basse pression et les volets 2 ont bien été sortis [P, p. 56-57].
8. **Bouton « DITCHING »** : ferme toutes les vannes sous la ligne de flottaison (vanne de régulation de pression « outflow », ventilation de l'avionique, prise d'air dynamique, entrées des groupes de conditionnement) « pour que l'avion flotte plus longtemps » [P, note 101, p. 60]. **Le rapport ne dit pas si le bouton a été pressé** (la partie 3 de la check-list, où il se trouve, n'a pas été atteinte). Des articles de janvier 2009 disent qu'il ne l'a pas été [S, résultats de recherche AP/AvWeb, pages non ouvertes], et que le capitaine dirait après coup qu'il n'aurait pas changé grand-chose [S, résumé de recherche, non lu à la source]. **À ne pas dire** dans la voix ; au mieux « le rapport décrit ce bouton ; le temps a manqué pour la partie de la check-list qui le contient » (vrai pour la partie 3 non commencée, [P]).

**Ce qui déclenche.** Collision avec des oiseaux (tissu et plumes identifiés par le Smithsonian comme des bernaches du Canada ; au moins deux dans le moteur gauche, au moins deux dans le droit, chaque moteur en avale une dans le cœur ; masse ≈ 8 lb ≈ 3,6 kg chacune [P, conclusion 6 ; p. 2.2.2]).

**Ordre des événements et délais** : voir chronologie (§ Affaire réelle). Seuils : fenêtre de rallumage « vitesse optimale 300 nœuds » (vitesse maximale atteinte après l'impact : 214 nœuds → impossible) [P, p. 2 note 8] ; rallumage assisté par APU dans la check-list sous FL200 ; attente de 30 s entre coupure et remise des manettes master [P, p. 53-54].

## 5. Chiffres

| Chiffre | Source | Niveau |
| --- | --- | --- |
| Décollage autorisé 15:24:54, piste 4 | AAR-10/03 p. 1 (CVR) | [P] |
| Contact avec l'approche à 700 ft, 15:25:51 | p. 1 | [P] |
| « birds » 15:27:10.4 ; bruits d'impact 15:27:11 | p. 2 | [P] |
| Altitude à l'impact : 2 818 ft **au-dessus du sol** ; à ≈ 4,5 mi au NNO du seuil de piste 22 | p. 2 (FDR) | [P] |
| Point haut ≈ 3 060 ft à 15:27:30, 185 nœuds | p. 47 | [P] |
| N1 gauche 82 → 35 %, droit 82 → 15 % juste après l'impact | p. 47 | [P] |
| Amerrissage 15:30:43 (FDR) ; **3 min 32 s (212 s) après les bruits d'impact à 15:27:11** | p. 2, 41, 47 ; calcul | [P] |
| Distance au décollage : amerrissage « à 8,5 miles » de LGA | p. 1 | [P] |
| Check-list conçue pour > 20 000 ft ; 3 parties / 3 pages | p. 52-53, 87 | [P] |
| ~ un tiers de la check-list faite ; 30-40 s de tentatives de rallumage | p. 88, 2.3.1 | [P] |
| Amerrissage : 125 nœuds, assiette 9,5°, vitesse verticale 12,5 ft/s (≈ 3,8 m/s), pente −3,4° ; masse 151 017 lb ; certif. : 118 nœuds, 11°, −1 ft/s, 145 505 lb | p. 47-48, 20 (table 2) | [P] |
| Pression externe moyenne à l'impact 15,1 psi (certif. 3,5) ; max 22,6 psi (certif. 7,3) | table 2 | [P] |
| Simulations : 15 passes valides, 8 réussies (53 %) avec **virage immédiat** ; 1 passe avec **35 s de retard** (LGA piste 13) : échec | p. 50 | [P] |
| Test d'ingestion de certification : 1 oiseau de 4 lb (gros, hors cœur) ; moyens : 7 × 1,5 lb (dont 2 dans le cœur) ; règle plus récente 33.76 : 2,5 lb dans le cœur + 4 × 1,5 lb | p. 21-22, 4190+ | [P] |
| Température de l'eau 5,2 °C | p. 1568+ | [P] |
| Volets 2 sortis à 15:29:49 à 270 ft (descente 1 200 → 200 ft de 15:29:00 à 15:30:00) | p. 47 | [P] |
| Premier navire sur zone 15:34:40 ; dernier navire part 15:54:43 ; tous secourus ≈ 20 min | p. 41-42 | [P] |
| 35 recommandations ; en 2016, 6 appliquées, 14 « closed-unacceptable », 1 retirée | AP 2016 (Insurance Journal) | [S] |

À noter : « 208 secondes » (idée de titre) = 15:27:15 → 15:30:43 (3:28). Il ne correspond à aucun repère défini du rapport. **Choisir 3 min 32 s depuis les bruits d'impact (212 s) ou dire « environ trois minutes et demie ».**

## 6. Ce qui retourne une idée reçue (candidates de chute)

1. **« Il a suivi la check-list » / « il a ignoré la check-list » : ni l'un ni l'autre.** Le rapport : utiliser cette check-list était conforme aux procédures ; mais le geste qui a sauvé les protections de vol (démarrer l'APU) était **plus loin dans la check-list** ; « ce geste critique n'aurait pas été fait si l'équipage avait simplement suivi l'ordre de la check-list » [P, p. 88, conclusion 12-14]. Chute : « Ce qui l'a sauvé n'était pas à sa place dans la check-list. »
2. **« Un miracle » : le rapport parle de décision-making, de gestion d'équipage et de chance d'équipement.** Contribuants à la survie : décisions et coordination de l'équipage ; avion équipé pour un vol long au-dessus de l'eau « fortuitement » ; cabine ; proximité des secours [P, cause probable]. Chute : « Le miracle a une liste de pièces. »
3. **« Il aurait pu rentrer à LaGuardia » (les simulations).** 53 % de réussite avec un virage **immédiat** ; avec 35 s de réflexion, la seule passe réaliste échoue ; le NTSB note que les virages immédiats « ne tenaient pas compte du temps de reconnaissance et de décision » et qu'un retour direct traversait Manhattan [P, p. 50, 89]. Chute : « Le simulateur n'avait pas le temps de comprendre. »

Chute bonus (honnête) : **les protections de l'A320 ont aussi trompé la main** : sous 100 ft le système atténuait les ordres à cabrer ; l'alerte « vitesse trop basse » était inhibée par les alarmes de proximité du sol ; le capitaine était 15 à 19 nœuds sous la vitesse minimale sélectionnable (VLS) sur les 200 derniers pieds [P, p. 48, 89-90, 1.6.4].

## 7. La question du commentaire (fermées, deux camps, un mot)

1. « Moteurs coupés à 2 800 pieds, aéroport derrière toi : tu fais demi-tour… ou tu vises le fleuve ? » (réponse : demi-tour / fleuve — la lecture se fait chez soi : une carte, 4,5 miles.)
2. « Une check-list de 3 pages, 3 minutes 32 secondes : tu la termines… ou tu sautes à la fin ? »
3. « Dans ton avion, gilet sous le siège : tu l'as regardé… ou jamais ? » (action possible au prochain vol ; le rapport : seulement 10 passagers ont pris leur gilet — à vérifier avant de l'utiliser comme chiffre : vu en résumé de recherche, p. non lue.)
La n° 1 est la plus forte (elle fait peur et se lit sur une carte).

## 8. L'histoire du système

- **Check-list QRH Airbus** : conçue pour > 20 000 ft ; refondue en 2005 (fusion des étapes de l'ancienne check-list d'amerrissage dans « Engine Dual Failure », deux branches « carburant / pas de carburant ») [P, p. 52].
- **A320** : fly-by-wire, certifié pour l'amerrissage sur la base de plus de 200 essais de maquettes en bassin (le rapport) [P, p. 20 ; note 45].
- **Règles d'ingestion d'oiseaux** : 14 CFR 33.77 (1984, Amdt 33-10/11) ; 33.76 introduit en 2007 la catégorie « gros oiseaux en volée » (entrée en vigueur 16/11/2007) [P, p. 21-22] ; 33.76(e) cœur en 2023 [P].

## 9. Pour l'annonce (12-17 mots, un fait sûr)

« Prochain dossier : une check-list conçue pour vingt mille pieds, et un avion à moins de trois mille. » (17 mots ; faits : p. 52, 87 et p. 2.)

## 10. À ne pas dire

- **« 208 secondes »** : non défini par le rapport (voir § 5).
- **« Les deux moteurs étaient coupés »** : le rapport dit « presque totale perte de poussée » (« almost total loss of thrust ») ; le moteur gauche est remonté « un peu » à 15:28:25 ; N1 résiduel 35 % / 15 % [P].
- **Le capitaine « a désobéi à la check-list »** : faux ; le NTSB conclut que l'usage de cette check-list était conforme aux procédures [P, conclusion 12].
- **Le bouton « ditching »** : ne pas dire qu'il a été pressé (ni qu'il ne l'a pas été) : le rapport ne le dit pas.
- **« Les protections de l'A320 l'ont sauvé » sans nuance** : elles ont aussi atténué les ordres à cabrer et l'alerte basse vitesse a été inhibée [P].
- **Ce que le film *Sully* (2016) a inventé ou exagéré** (sources secondaires, à ne pas affirmer au-delà) : (a) un NTSB hostile, qui cherche la faute : les enquêteurs nommés dans la presse (Benzon, Brenner) s'y sont opposés publiquement ; le président de la commission d'enquête Robert Sumwalt a écrit une tribune « Sullying Sully? » [S, avweb / Flight Safety Australia / BCA, via CBS et Bloomberg, Sept. 2016] ; l'acteur Aaron Eckhart a dit qu'il n'y avait « aucun fondement » à l'image d'une chasse aux sorcières [S] ; (b) le rôle des simulations : le rapport indique que c'est le NTSB lui-même qui a fait une passe avec 35 s de retard [P, p. 50, 89] ; (c) l'audience publique comme tribunal : le rapport ne montre rien de tel. Ne **jamais** reprendre une scène, une phrase ni un plan du film.
- **Chiffres arrondis par la presse** : « 155 personnes » est correct ; « 150 passagers dont un enfant tenu sur les genoux » ; « aucun mort » vrai, mais **5 blessés graves** ; « 3 minutes » : c'est 3 min 32 s ; « 3 000 pieds » : l'impact est à **2 818 ft AGL** ; l'avion culmine ≈ 3 060 ft ; « 8 lb » ≈ 3,6 kg, pas « de petits oiseaux ».
- Ne pas nommer ni décrire de victime ; ne pas rejouer les dernières secondes de l'enregistrement du cockpit ; ne pas prêter de pensée (la transcription et les témoignages après coup sont distincts).
- « FAA a pris toutes les recommandations » : faux ; « le NTSB a tout fait appliquer » : faux [S].

## 11. Ce que la voix peut dire (dix phrases, vraies telles quelles)

1. Quinze janvier deux mille neuf. Quinze heures vingt-sept minutes onze secondes.
2. Les deux moteurs d'un A320 avalent des oies. Huit livres chacune, environ trois kilos six.
3. L'avion est à deux mille huit cent dix-huit pieds au-dessus du sol.
4. La check-list a été pensée pour une panne au-dessus de vingt mille pieds.
5. Trois parties. Trois pages. L'équipage n'en fera qu'un tiers.
6. Il démarre l'APU. Ce n'est pas dans l'ordre de la check-list.
7. Sans lui, l'avion perd ses protections de vol.
8. Le simulateur dit oui, avec un virage immédiat. Avec trente-cinq secondes de réflexion, il dit non.
9. Quinze heures trente minutes quarante-trois. L'avion touche l'eau à cent vingt-cinq nœuds.
10. Eau à cinq degrés. Un premier bateau arrive à quinze heures trente-quatre.

## 12. Sources et ce qui y a été lu

1. NTSB AAR-10/03, PDF intégral — https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR1003.pdf — **lu** : 1.1 histoire du vol, transcription CVR (extraits), 1.6 (A320, protections, électricité), 1.16 (performance, simulations), 1.17 (check-list), 2.3 (analyse équipage), conclusions 1-33, recommandations 4.1-4.2, 2.9 secours. [P]
2. Page d'investigation NTSB DCA09MA026 — https://www.ntsb.gov/investigations/Pages/DCA09MA026.aspx — **lue** : liste du dossier (docket data.ntsb.gov DCA09MA026, A-09-112, A-10-062 à A-10-095) ; aucune animation ni vidéo listée. [P]
3. Federal Register 2023-06413 (88 FR 20,… 4 avril 2023), règle finale « Airworthiness Standards: Engine Bird Ingestion », Amendment 33-36 — https://www.govinfo.gov/content/pkg/FR-2023-04-04/html/2023-06413.htm — **lu** : nouvel essai de cœur 33.76(e) ; effectif 5 juin 2023 ; cite le vol 1549, A-10-64, A-10-65. La table 2 (masse de l'oiseau moyen) n'a pas été lue. [P]
4. NTSB, politique du site — https://www.ntsb.gov/about/Pages/Website-Policies.aspx — **lue** : documents et images produits par le personnel du NTSB dans le domaine public ; images protégées à ne pas réutiliser. [P]
5. Insurance Journal (AP), 19/09/2016 — https://insurancejournal.com/news/national/2016/09/19/426808.htm — **lu** : 6 sur 35, 14 « closed-unacceptable », gilets laissés aux compagnies, check-list basse altitude rejetée. [S]
6. Wikimedia Commons (fiches ouvertes une à une) : voir « Pièces du dossier ».
7. Flight Safety Australia, 2016 — https://www.flightsafetyaustralia.com/2016/09/investigators-say-sully-movie-gets-it-wrong/ — lu : Benzon, Brenner, Eckhart. [S]
8. Suggestions YouTube : https://suggestqueries.google.com/complete/search?client=youtube&ds=yt&q=… — lu le 02/11/2026. [O]
9. **Non lus** : FAA `usairways1549_recommendations.pdf` et `usair_a320.pdf` (erreur 403) ; NTSB CAROL `data.ntsb.gov/carol-main-public/sr-details/A-10-066` (page dynamique vide) → **statuts actuels de A-10-62 à A-10-95 non vérifiés** ; l'article de Newser (domaine introuvable) ; Smithsonian/Air & Space (redirection non suivie) ; pages AP/AvWeb de 2009 sur le bouton « ditching » (vues seulement dans des résultats de recherche) ; tribune de Sumwalt « Sullying Sully? » (résumé de recherche seulement).

---

# Long, en plus

## Étapes du procédé / de l'intervention (les chapitres) et leur menace

| # | Chapitre | Contenu | Menace (si on saute l'étape) |
| --- | --- | --- | --- |
| 1 | L'instant | 15:27:11, bruits d'impact, 2 818 ft | Pas de poussée, pas d'aéroport à portée |
| 2 | On l'ouvre | l'A320, ses deux moteurs, l'APU, la loi normale | Sans comprendre, la suite n'a pas de sens |
| 3 | Plus tôt ce jour-là | piste 4 à 15:24:54, 700 ft à 15:25:51 ; l'équipage vient d'être formé ensemble (premier trajet ensemble) | Le détail qui comptera |
| 4 | La rupture : la check-list | 20 000 ft ; 3 parties | Un plan fait pour un autre ciel |
| 5 | Les 60 premières secondes | « my aircraft », ignition, APU, mayday, rallumage | Sans APU : pas de loi normale |
| 6 | La carte | LaGuardia / Teterboro / Hudson ; 35 s | Manhattan sous l'avion |
| 7 | La descente | 1 200 → 200 ft ; volets 2 ; alarmes | Vitesse trop basse |
| 8 | 15:30:43 | les derniers 100 ft, l'impact | Fuselage, queue |
| 9 | L'évacuation | 15:30:58 → 15:34:40 ; eau à 5 °C | Froid |
| 10 | L'enquête | oiseaux ; simulateur ; check-list | — |
| 11 | Ce qui a changé | règle de 2023 ; ce qui n'a pas changé | — |
| 12 | La fin | chute, question, rendez-vous, boucle | — |

## Climax

**Les 100 derniers pieds** : 15:30:36 à 100 ft de radio-altitude, tirage progressif sur le mini-manche ; 15:30:39 à 50 ft, manche plus à fond ; 15:30:41 butée arrière (16°) ; 15:30:43 contact. Le système atténue les ordres sous 100 ft ; alarme sol « 50 ft » (« fifty » ou « thirty » : le NTSB ne tranche pas) [P, p. 4-5, 47-48]. À jouer par l'écriture (phrases courtes, l'heure qui tourne). Alternative climax : le **test** — les 15 passes du simulateur à Toulouse (14-16 avril 2009) [P, p. 49-50].

## Trois fils candidats

1. **« Ce n'est pas la bonne check-list… alors laquelle ? »** (ouvert à l'instant ; payé à l'enquête : « la plus applicable », mais faite pour 20 000 ft, et le geste décisif était hors ordre).
2. **« Pouvait-il rentrer ? »** (ouvert à la décision ; payé au simulateur : oui à 53 % avec virage immédiat ; non avec 35 s de réflexion).
3. **« Qu'est-ce qui a tué les moteurs ? »** (ouvert au détail « Plus tôt » : le test de certification des oiseaux ; payé : 8 lb vs essai de 2,5 lb dans le cœur ; règle de 2023).

## Coupures pub (candidates, après un fil ouvert)
Après la rupture (check-list pour 20 000 ft), après « my aircraft / APU », après l'abandon de LaGuardia (« Manhattan »), après le tirage de manche à 100 ft, après l'évacuation.

## Ce qui est réel et montrable (pièces du dossier)
Voir « Affaire réelle, en plus » → Pièces.

---

# Affaire réelle, en plus

**Le rapport officiel existe, public, ouvert à la source : NTSB/AAR-10/03.** L'affaire passe.

## Chronologie à la seconde (EST, rapport AAR-10/03 ; heures CVR/FDR synchronisées sur le radar EWR, p. 47)

| Heure | Événement | Page |
| --- | --- | --- |
| 15:24:54 | Tour LGA autorise le décollage, piste 4 ; copilote aux commandes (PF), capitaine en surveillance (PM) | p. 1 |
| 15:24:57 | Les deux manettes avancées, N1 à 85 % | p. 47 |
| 15:25:45 | Passage au contrôleur départ (TRACON) | p. 1 |
| 15:25:51 | Le capitaine dit 700 ft, monte à 5 000 ; clairé 15 000 ft | p. 1 |
| 15:27:07 | « after takeoff checklist complete » | CVR |
| **15:27:10.4** | Capitaine : « birds. » | p. 2 |
| **15:27:11** | Bruits d'impact (altitude 2 818 ft AGL) | p. 2 |
| 15:27:13 | Bruit moteur qui décroît | p. 2 |
| 15:27:14 | « we got one rol- both of 'em rolling back » | p. 2 |
| 15:27:19 | « ignition, start » ; ~15:27:21 « I'm starting the APU » | p. 2 |
| 15:27:23 | « my aircraft » (le capitaine prend les commandes) | p. 2 |
| 15:27:28 | Demande la QRH « loss of thrust on both engines » | p. 2 |
| 15:27:30 | Point haut ≈ 3 060 ft, 185 nœuds | p. 47 |
| 15:27:33 | Appel : « mayday… » (le mot « mayday » n'est pas transmis : autre trafic sur la fréquence) ; contrôleur : cap à gauche 220° | p. 2 et note 7 |
| 15:27:50 | Copilote commence la partie 1 de la check-list | p. 2 |
| 15:27:58 environ | « airspeed optimum relight. three hundred knots. we don't have that » (≈ 15:28:00) | p. 2 |
| 15:28:05 | Contrôleur propose la piste 13 de LGA ; capitaine : « we're unable. we may end up in the Hudson » | p. 2 |
| 15:28:10 | 210 nœuds, ≈ 1 650 ft | p. 47 |
| 15:28:14-19 | « emergency electrical power… emergency generator » — « it's online » | p. 2 |
| 15:28:25 | « the left one's coming back up a little bit » | p. 3 |
| 15:28:31 | Contrôleur : « left traffic for runway three one » — « unable » | p. 3 |
| 15:28:36 | TCAS « traffic traffic » (hélicoptère) | p. 3 |
| 15:28:46 | Piste 4 disponible ; capitaine : « I'm not sure we can make any runway… Teterboro? » | p. 3 |
| 15:28:45-15:29:00 | Copilote : FAC 1 off/on, puis « no relight after thirty seconds, engine master one and two confirm » | p. 3 |
| 15:29:11 | Annonce cabine : « brace for impact » | p. 3 |
| 15:29:14.9 | Alerte sol « one thousand » (ensuite 15 alertes jusqu'à 15:30:40) | p. 3 |
| 15:29:16 | Master 2 remis sur ON | p. 3 |
| 15:29:21 | Contrôleur : droite 280°, piste 1 de Teterboro — « we can't do it » | p. 3 |
| **15:29:28** | Capitaine, par radio : **« we're gonna be in the Hudson »** | p. 3 |
| 15:29:44 | « no relight » ; « let's go put the flaps out » | p. 3 |
| 15:29:49 | Volets 2 sélectionnés, à 270 ft | p. 47 |
| 15:29:53 | Radar perd le contact | p. 3-4 |
| 15:30:01-03 | « got flaps out » ; « two hundred fifty feet » | p. 4 |
| 15:30:24 | GPWS « terrain terrain, pull up » jusqu'à la fin | p. 4 |
| 15:30:36 | ≈ 100 ft ; tirage progressif sur le mini-manche | p. 47-48 |
| 15:30:41.1 | GPWS « fifty » ; mini-manche en butée arrière (16°) à 15:30:41 | p. 5, 47 |
| **15:30:43** | **Contact avec l'eau** (FDR), 125 nœuds | p. 41, 47-48 |
| 15:30:58 | Issues d'aile gauche ouvertes, premier passager sort | p. 41 |
| 15:31:06 / 15:31:11 | Portes 1L, 1R ouvertes | p. 41 |
| 15:31:16 | Toboggan-radeau 1R gonflé | p. 41 |
| 15:34:40 | Premier navire sur zone | p. 42 |
| 15:54:43 | Dernier navire part avec les derniers rescapés | p. 42 |

Durée exacte : **15:27:11 → 15:30:43 = 3 min 32 s (212 s)**. Les décisions Teterboro / LaGuardia : LGA refusée à 15:28:05 (piste 13) et 15:28:31 (piste 31), Teterboro proposé ≈ 15:28:46-55 et refusé à 15:29:21-25 ; Hudson annoncé à 15:29:28.

**Transcription citable (une phrase)** : « we're gonna be in the Hudson » (15:29:28, radio ATC, p. 3). Ne pas utiliser les dernières paroles (« we're gonna brace », fin d'enregistrement à 15:30:43.7).

## Le plan prévu et pourquoi il ne collait pas

- **Plan** : check-list QRH « ENG DUAL FAILURE » 3 parties. Partie 1 : ignition, manettes ralenti, 300 nœuds de rallumage, stratégie d'atterrissage, génératrice de secours, ATC, FAC 1 off/on ; si pas de rallumage en 30 s : master 1 & 2 OFF, attendre 30 s, ON ; puis APU (sous FL250), anti-givrage voilure OFF, purge APU (sous FL200), rallumage assisté ; partie 2 : vitesse « green dot » (≈ 2,5 miles par 1 000 ft, descente moyenne 1 600 ft/min) ; partie 3 : forced landing / amerrissage [P, p. 52-56].
- **Pourquoi ça ne collait pas** : conçue pour > 20 000 ft (« probabilité la plus forte »), jamais pensée à basse altitude ; trop longue pour le temps disponible ; l'APU y arrivait tard ; la partie 3 (amerrissage) n'a pas été atteinte ; la check-list d'amerrissage séparée supposait au moins un moteur en marche ; la partie amerrissage de « Engine Dual Failure » ne contient pas l'étape qui inhibe le GPWS (conclusion 23) [P, p. 52, 87-88, note 96].
- **L'APU** démarré à ≈ 15:27:21 (capitaine, de mémoire avant d'appeler la check-list) : conclusion 14 [P].
- **Simulations** (Toulouse, 14-16 avril 2009, Airbus, US Airways, ALPA, BEA) : 15 passes retenues, 8 réussies avec virage **immédiat**, 1 avec 35 s de retard : échec [P, p. 49-50]. Le rapport n'a **pas** testé « 35 s » à Teterboro ; la mention LGA piste 13 seule.
- **Ce que le rapport conclut** : la décision d'amerrir donnait la plus forte probabilité de survie [P, conclusion 15].

## Ce qui a changé depuis (avec date et source ; statuts actuels non confirmés)

| Sujet | Ce qui est établi | Source / niveau |
| --- | --- | --- |
| Certification moteurs : oiseau dans le cœur | Règle finale du 4 avril 2023, effective le 5 juin 2023 : essai 33.76(e), 1 oiseau visé sur le premier étage rotatif, 261 nœuds (montée) ou 209 nœuds (approche) ; cite A-10-64/65 | Federal Register [P] |
| Check-list basse altitude (A-10-66/67, EASA A-10-90) | Reste parmi les recommandations classées « closed-unacceptable » en 2016 ; un forum de pilotes dit qu'Airbus a ajouté une check-list basse altitude en tête du QRH électronique | AP [S] ; forum [O, non confirmé] |
| Gilets, coussins flottants sur tous les vols (A-10-82) | La FAA a laissé la décision aux compagnies | AP 2016 [S] |
| Faune autour des aéroports (A-10-75) | La FAA avait émis dès juin 2009 une alerte de certification (96 aéroports avec « événement déclencheur » sans évaluation) ; l'évaluation systématique n'est pas confirmée comme règle | résultat de recherche (présentation FAA/ICAO 2013) [O] |
| Radars : code transpondeur d'urgence (A-09-112, 07/10/2009) | Recommandation distincte ; statut non lu | AAR p. 128 [P pour le fait de la recommandation] |
| Équipement d'amerrissage / radeaux / toboggans | Recommandations A-10-79, -80 ; une partie rejetée en 2016 | AP [S] |

**Ce que le film peut dire sans risque** : (1) la règle de 2023 est réelle et citée au Federal Register ; (2) quatorze ans après, l'essai du cœur est arrivé ; (3) plusieurs recommandations (check-list basse altitude, gilets) n'ont pas été imposées en 2016. **À vérifier avant d'écrire la fin** : statuts actuels de A-10-66/-67/-82 (CAROL), et si Airbus a publié une check-list basse altitude.

## Les personnes

- **Chesley B. Sullenberger III** (capitaine) et **Jeffrey B. Skiles** (copilote) : noms publics, cités par le rapport comme « the captain » et « the first officer » ; silhouettes, jamais de visage. Le rapport note que c'était leur premier trajet ensemble [P, p. 1 note 3]. Le rapport écrit : « professionnalisme » et « gestion d'équipage excellente » [P, conclusion 19]. Ne pas prêter de pensée.
- Équipage de cabine : trois personnes (rapport : « flight attendant A, B »…). Ne pas nommer sans nécessité.
- Pas de victime à nommer. Blessés : ne pas détailler.
- Enquêteurs : Robert Benzon, Malcolm Brenner (anciens) et Robert Sumwalt (président de la commission) sont cités par la presse à propos du film [S].
- **On ne juge personne** : le capitaine a eu de la difficulté à tenir sa vitesse en finale sous charge de travail ; le rapport attribue cela à la saturation de tâches et au manque de formation de l'industrie [P, conclusions 16-17] ; la faute n'est pas une chute.

## Les pièces du dossier

Domaine public (travail d'une agence fédérale américaine ; politique NTSB lue) :
1. **Rapport AAR-10/03** (texte, tableaux) — https://www.ntsb.gov/investigations/AccidentReports/Reports/AAR1003.pdf — PD [P]. Figures **à réutiliser après vérification page par page** : fig. 1 (trace du vol), fig. 3 (échelle de vitesse A320), fig. 4-5 (moteur) ; **fig. 2 (photo des occupants sur les ailes) : crédit non indiqué dans le texte, ne pas l'utiliser**.
2. **Photo du moteur sorti de l'Hudson** — https://commons.wikimedia.org/wiki/File:Flight_1549_engine_recovered.jpg — auteur LaDonna Davis, USACE New York District, 23/01/2009 ; licence : domaine public (travail d'employé fédéral) [P, fiche lue].
3. **Photo d'une plume dans le moteur gauche** — https://commons.wikimedia.org/wiki/File:USAir_1549_bird_feather.jpg — NTSB, communiqué 090204 ; domaine public [P, fiche lue].
4. **Extrait audio TRACON/FAA (3 min 10 s)** — https://commons.wikimedia.org/wiki/File:Flight_1549_FAA_New_York_TRACON_audio_extract.ogg — modèle PD-USGov-FAA [P, fiche lue]. C'est la **radio** (contrôleur et vol), pas l'enregistrement du cockpit : quelques secondes de la voix du contrôleur au plus, sous commentaire ; ne pas jouer les dernières secondes.
Licence libre avec crédit (CC BY 2.0, **pas** domaine public) :
5. **Cinq photos USCG « Coast Guard Response to Miracle on the Hudson »** — par exemple https://commons.wikimedia.org/wiki/File:Coast_Guard_Response_to_Miracle_on_the_Hudson_(3201127645).jpg — Flickr USCG Press, 16/01/2009 ; CC BY 2.0, attribution exigée [P, une fiche lue sur cinq].
6. **Photo USACE « DCV Hayward »** — https://commons.wikimedia.org/wiki/File:New_York_District_Responds_To_U.S._Airways_Flight_1549_Crash_in_the_Hudson_River_(5148212811).jpg — Chris Gardner ; CC BY 2.0 [P, fiche lue].
Non montrables ou non vérifiées :
- **Animations NTSB** : la page `ntsb.gov/Pages/animations.aspx` n'existe plus (erreur) ; l'archive indique une animation de 5 min 8 s, disponibilité et licence non vérifiées. **K3 Resources / Scene Systems** : privées, ne pas utiliser.
- **Vidéo de la caméra de Pier 88** (citée dans le rapport, analysée par le BEA) : propriétaire non vérifié, non montrable.
- **Carte « Options Not Taken »** sur Commons : GFDL, analyse tierce qui contredit le NTSB ; non utilisable.
- Photo « Flickr grego », photos de presse, journaux télé, le film *Sully*, vidéos d'autres chaînes : exclus.
- Docket `data.ntsb.gov/Docket/?NTSBNumber=DCA09MA026` : lien non ouvert (page dynamique).
- Fichiers Commons non ouverts (licence inconnue) : tout le reste de la catégorie (les 71 fichiers).

## Mythes de l'affaire (« à ne pas dire », complément)
Voir § 10 (film, 208 s, moteurs « coupés », bouton ditching, « gloire du capitaine » comme chute). Ajouter : le film suggère que le simulateur « humain » n'avait pas inclus le facteur humain à l'initiative du capitaine ; dans le rapport c'est une passe à 35 s organisée par le NTSB [P] ; ne pas dire « l'avion a plané sans moteur » (le moteur gauche a donné un peu de poussée, 35 % de N1).

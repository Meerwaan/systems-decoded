# 036 — L'éolienne dans la tempête : ce qui l'empêche de s'emballer (le pitch, pas le frein)

Faits réunis le 04/11/2026, 27 requêtes web. Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur / calcul maison.

## Verdict sur l'angle

**À ajuster.** « Tu passes devant tous les jours » tient la promesse du 035 (le système qu'on croise sans le voir), mais ce n'est pas un danger. Le danger qui tient debout, et qui est documenté : **le réseau saute, et la seule chose qui arrête le rotor est une batterie par pale**. Le système qui sauve n'est pas le frein : ce sont les **pales qui tournent de 90° (la mise en drapeau)**. Le frein à disque, lui, est un acteur secondaire, et dans le cas d'Ardrossan il est mis en cause dans l'incendie.

Pas « vu et revu » côté explication : les vidéos d'éoliennes en feu (Ardrossan 2011) circulent beaucoup, mais **personne ne montre le mécanisme qui les empêche d'arriver** (pitch + batterie par pale). Le sujet vu et revu, c'est « l'éolienne qui explose », pas « pourquoi presque aucune n'explose ».

**Test spectacle** : oui, par reconstitution 3D. Événement physique énorme : un rotor de 136 m dont le bout de pale file à ≈ 360 km/h [O, calculé], mât de 112 m qui plie en deux après 40 min de survitesse (Formerie, ARIA 53010 [P]). Lisible sans le son : trois pales pleine puissance, le mât qui plie, puis la même scène où les pales basculent de 90° et le rotor retombe à la lenteur. Aucune vidéo réelle montrable (voir pièces).
**Test histoire** : quelqu'un (le technicien d'astreinte / toi dans ta voiture), un danger (réseau coupé en pleine tempête), quelques secondes (la mise en drapeau doit partir sans courant), raison d'envoyer : « regarde, les éoliennes à l'arrêt par grand vent ne sont pas en panne ». Passe les deux. **Angle proposé pour le script** : « Le courant saute en pleine tempête. Trois pales de 68 m. Plus rien ne les commande… sauf une batterie dans chaque pale. »

## La scène

**Cas réel n°1 (le plus fort pour la mécanique) : Formerie (Oise), 23/01/2019, ARIA n° 53010 [P, fiche lue].** 13 h 25 : une coupure du réseau arrête un parc de 2 éoliennes. La première s'arrête normalement. La seconde part en **survitesse** : ses pales restent en position de production au lieu de tourner de 90° (drapeau). **Après 40 min de survitesse, une pale se délamine**, le balourd plie le mât (66 m) en deux vers 14 h 40, débris jusqu'à 300 m, périmètre de sécurité 500 m. Cause : la mise en drapeau repose sur **18 batteries au plomb par pale** ; capacité réelle **43 Ah au lieu de 129,6 Ah**, batteries de 2006 mises en service en 2011 (durée de vie dépassée), seuil d'alarme de basse tension à 150 V trop bas (à 150 V la mise en drapeau n'est plus opérationnelle). Vent : non mentionné dans la fiche → **ce n'était pas dit tempête**; ne pas lui prêter de tempête. Suites : tests annuels en charge, batteries remplacées tous les 4 ans au plus, seuil d'alarme relevé à 200 V (21 autres éoliennes du même modèle). Modèle non précisé.

**Cas réel n°2 : Ardrossan (Ayrshire, Écosse), 8 décembre 2011 [S].** Pendant la tempête dite « Bawbag », la turbine T8 (Vestas) prend feu dans la nacelle. Date : la galerie BBC citée par Wikipédia est datée du 8/12/2011 et HuffPost UK du 9/12 parle du jeudi (8/12/2011 = jeudi). Cause, selon le rapport de l'exploitant Infinis rapporté par New Scientist (lu via une copie, SAS) : **deux problèmes générateurs de chaleur**. (1) Une rupture d'engrenage du **yaw** : la nacelle ne s'oriente plus, la tête « bascule » au vent, friction et incendie dans le carter de la génératrice. (2) La turbine était réglée pour **serrer son frein sur perte de courant** ; les pales tournaient quand même sous la tempête, les plaquettes frottent sur le disque, chaleur, huile hydraulique. **Infinis penche pour la perte du yaw, Vestas pour le frein ; non tranché** (preuves brûlées). Fix : Vestas a modifié toutes les turbines du parc pour que le frein de parking **ne s'applique plus qu'en maintenance**. À noter : les pales étaient en drapeau, ce n'est pas un défaut de pitch. Vent : « 176 km/h, mise en drapeau normale à 88 km/h » dans la copie de New Scientist [S, copie non primaire] ; le chiffre « 165 mph » qui circule est celui d'une station de montagne (Cairngorms) citée par HuffPost, pas du site. **Ne pas annoncer de vitesse de vent à Ardrossan.** Le rapport lui-même (Infinis/Vestas) n'a pas été lu.

**Cas réel n°3 : Hornslet (Danemark), 22/02/2008 [S, Wikipédia].** Nordtank NTK 600-180/43 (600 kW, rotor 43 m, mât 44,5 m, mise en service déc. 1996). Frein usé → réparation par Vestas → redémarrage par grand vent → bruit, arrêt manuel tenté, **les aérofreins de bout de pale échouent**, le rotor accélère « bien au-delà de ses tolérances » ; ≈ 2,5 h plus tard les pales se désintègrent, une pale frappe le mât, qui se sectionne. Personne blessé. Cause : « possiblement la boîte d'engrenages » (non conclue). **Machine d'une autre génération (freinage en bout de pale, pas de pitch de pale entier)**: à ne pas présenter comme une éolienne moderne. C'est la **vidéo la plus connue** (filmée de loin, pale qui se désintègre), droits non vérifiés.

**Autres cas France, secondaire, ARIA lus** : Saint-Cirgues-en-Montagne (Ardèche) 14/11/2014, orage, rafales ≈ 130 km/h, une pale tombe, débris jusqu'à 150 m [P, ARIA 45960]. Fitou (Aude) 05/12/2014, bout de pale (aérofrein en fibre de verre, 3 m) retrouvé à 80 m, cause non établie, vent non mentionné [P, ARIA 46030]. Conilhac-Corbières 06/02/2018 : l'aérofrein de bout de pale tombe à l'arrêt automatique, axe en carbone rompu [P, ARIA 51122]. Des tableaux d'études de dangers citent aussi Sigean/Port-la-Nouvelle 01/11/2000 (mât plié en tempête après perte d'une pale) et Dinéault (Finistère) 2008 (emballement, frein hors service) : **non vérifiés à la source ARIA**.

**Ce qu'on peut montrer** : reconstitution 3D uniquement (rotor, pale qui bascule, mât qui plie, disque de frein qui chauffe, batterie dans le moyeu). Aucune vidéo (voir Sources).

## Le système qui sauve

Pas un objet : une **chaîne de sécurité à sûreté intégrée**. Le principe, dans le descriptif Enercon lu [P, E-82 E2, p. 9-10] : « En fonctionnement, les éoliennes ENERCON sont freinées exclusivement d'une façon entièrement aérodynamique par inclinaison des pales en position drapeau. » Les trois entraînements de pales sont indépendants et mettent les pales en drapeau « en l'espace de quelques secondes ». « En cas d'urgence (par ex. en cas de coupure du réseau), chaque pale du rotor est mise en sécurité en position de drapeau par son propre système de réglage de pale d'urgence alimenté par batterie. » Et : **« Il suffirait de décrocher du vent une seule des trois pales pour réduire la vitesse du rotor à un niveau supprimant tout risque. »** Où : dans le moyeu (pitch) et la nacelle (yaw, frein). Qui l'a : toutes les éoliennes industrielles de ce type, c'est la règle de conception, pas une option. Chez Vestas V136 (étude de dangers Fourris) : le pitch est hydraulique, chaque bloc a un **accumulateur hydropneumatique** qui assure la mise en drapeau en cas de perte de pression ; en plus un système indépendant **VOG (Vestas Overspeed Guard)** « à sécurité positive auto-surveillé » arrête le rotor par mise en drapeau si la commande défaille [P, EDD Fourris p. 6-7].

## Le mécanisme ouvert

Pièces (mots de pro, tous présents dans les deux documents lus ou usuels) :
1. **Pale** : fibre de verre/époxy, 68 m sur une V136 [P, EDD Fourris].
2. **Roulement de pale** (palier de pitch) : entre pale et moyeu, permet de la tourner sur son axe [O, usage ; non lu dans les sources de ce dossier].
3. **Moyeu** : porte les 3 pales, abrite l'armoire de pitch.
4. **Système de réglage de pale (pitch)** : un entraînement par pale, indépendant. Enercon : un moteur de pitch + réducteur par pale [S]. Vestas : vérin hydraulique avec **accumulateur hydropneumatique** [P].
5. **Batterie de secours** (Enercon, Formerie : 18 batteries plomb par pale [P]) ou accumulateur (Vestas).
6. **Anémomètre + girouette** sur le toit de la nacelle [P, Enercon p. 16]. Le calculateur compare vitesse de rotation (générateur et arbre lent) : si discordance, arrêt [P, Fourris].
7. **Couronne et moteurs d'orientation (yaw)** : Enercon E-82 : six moteurs à roues dentées sur une couronne en haut du mât [P, p. 9]. Garde la nacelle face au vent, y compris à l'arrêt « en raison d'une trop grande vitesse du vent » [P, p. 16].
8. **Frein à disque hydraulique** sur l'arbre rapide (Vestas V136 : « permet de maintenir à l'arrêt le rotor ») [P, Fourris]. Sur Enercon (entraînement direct, sans multiplicateur), frein de rotor + blocage manuel, utilisés **pour la maintenance** et l'arrêt d'urgence une fois les pales inclinées [P, p. 9].

Ce qui déclenche : vent moyen > seuil de coupure, survitesse, perte de réseau, arrêt d'urgence, discordance de capteurs.
Ordre des événements (arrêt tempête) : le vent monte → le pitch règle l'angle pour tenir la puissance/vitesse nominale → au-delà du seuil, les pales sont tournées vers ≈ 90° (drapeau) → le rotor décroche du vent, ralentit **sans que l'arbre subisse de forces additionnelles** → le rotor « tourne au ralenti » (Enercon : environ 3 tr/min ; si ce régime est dépassé les pales se mettent en drapeau à 90°) [P, p. 13] → la nacelle reste face au vent.
Seuils chiffrés :
- Démarrage : **3 m/s** (V136) [P] ; 2,5 m/s (E-82) [P]. Démarrage Enercon après 3 min de vent suffisant [P].
- Coupure : **25 m/s** (V136) [P] ; Enercon E-82 E2 : **mode tempête désactivé** : arrêt si moyenne > 25 m/s sur 10 min ou pointe 30 m/s [P] ; **mode « Storm Control »** : puissance réduite progressivement dès 28 m/s, nulle vers 34 m/s ; arrêt automatique si moyenne > 31 m/s ou pointes > 34 m/s ; redémarrage quand le vent repasse sous 31 m/s pendant 10 min [P, p. 16]. Donc **« 25 m/s » est le chiffre typique mais pas universel** : Enercon va jusqu'à 28-34 m/s.
- 25 m/s = 90 km/h [calcul exact]. Fiche de la préfecture : « Seuls les épisodes supérieurs à 25 m/s sont susceptibles de provoquer l'arrêt momentané des éoliennes (mise en drapeau) » [P, EDD Fourris].
- Mise en drapeau : « quelques secondes » [P, Enercon]. **Pas de chiffre en secondes sourcé** : ne pas en annoncer (brevets: la vitesse de pitch est volontairement limitée près du drapeau pour ne pas casser la pale [S, brevets]).
- Drapeau = « env. 90° » [P, Enercon p. 12-13].

**Pourquoi ça marche (beat `principe`)** : une pale est une aile ; c'est son angle face au vent qui crée la force qui fait tourner le rotor. En la tournant de 90°, on la présente par la tranche : l'aile ne porte plus, le vent glisse, le rotor n'a plus rien qui le pousse. Source : Enercon (« décrocher du vent » [P]), un brevet (« le vent sur les pales réduit rapidement la vitesse du rotor » à ≈ 90° [S]). Ordre de grandeur : une pale de 68 m qui file à ≈ 100 m/s en bout [O, calculé] ne pousse plus, sans frein, sans y toucher. La loi physique (portance) est une explication de principe [O] : aucune source officielle de physique lue ici.

## Chiffres

| Chiffre | Source | Niveau |
| --- | --- | --- |
| V136 : 68 m de pale, 136 m de rotor, moyeu 112 m, 4,2 MW | EDD Fourris (Volkswind, déc. 2020), p. 5-6 | [P] |
| Hauteur totale V136 = 112 + 68 = **180 m** | calcul | [O] |
| V136 : rotor **5,6 à 14 tr/min**, démarrage 3 m/s, coupure 25 m/s | idem | [P] |
| **Vitesse du bout de pale V136 à 14 tr/min ≈ 100 m/s ≈ 360 km/h** (π × 136 × 14 / 60) ; à 5,6 tr/min ≈ 40 m/s ≈ 144 km/h | calcul sur chiffres [P] | [O] |
| E-82 E2 : rotor 82 m, moyeu 78-138 m, 2 300 kW, 6 à 18 tr/min, bout de pale ≈ 77 m/s ≈ 280 km/h à 18 tr/min | Notice Enercon (Mayenne, 10/2012), p. 3, 18 | [P] + calcul [O] |
| Moyenne française : mât **≈ 90 m** aujourd'hui (≈ 50 m début 2000) | Enedis (extrait de recherche, non ouvert) | [S] |
| Fiche ministère : mât 80-100 m, hauteur totale 120-155 m, rotor 80-110 m (page de 2017) | ecologie.gouv.fr (via recherche, non ouvert) | [S, ancien] |
| Formerie : **40 min** de survitesse, 18 batteries/pale, 43 Ah vs 129,6 Ah, 66 m de mât, débris à 300 m | ARIA 53010 | [P] |
| Parc terrestre français ≈ 22 GW fin 2023 | Connaissance des énergies (recherche, non ouvert) | [S] |
| Drapeau ≈ 90° ; ralenti ≈ 3 tr/min | Enercon p. 12-13 | [P] |

Pas de comptage sourcé du nombre d'éoliennes en France : ne pas dire « des milliers » sans le vérifier.

## Ce qui retourne une idée reçue (candidates de chute)

1. **« Ce qui arrête l'éolienne, c'est un frein. » Faux** : c'est l'aile qui lâche le vent. Chez Enercon, en fonctionnement, l'éolienne est freinée « exclusivement » de façon aérodynamique [P] ; le frein de rotor sert la maintenance. À Ardrossan, c'est **le frein serré sur perte de courant** que Vestas pointe comme cause de l'incendie [S, rapport Infinis rapporté par New Scientist] et que Vestas a fait désactiver sur tout le parc.
2. **« Une éolienne immobile par grand vent est en panne. » Faux** : elle est en sécurité, pales en drapeau, nacelle face au vent, rotor qui tourne au ralenti ≈ 3 tr/min [P]. L'arrêt est la bonne réponse, pas la panne. (Vérifiable depuis l'autoroute.)
3. **« Si le courant saute, plus rien ne la commande. » Faux, et c'est tout le système** : une batterie (ou un accumulateur) par pale, indépendants. Mais **Formerie rappelle que ça n'est vrai que si les batteries tiennent** : 43 Ah au lieu de 129,6 Ah, et le mât a plié [P].
4. (Moins fort) **« La tempête les détruit. »** Les rapports lus ne montrent pas de tempête à Formerie ; c'est une **coupure de réseau**.

## La question du commentaire (fermées, deux camps, un mot)

1. **« Pales immobiles par grand vent : tu dis panne… ou sécurité ? »** (vérifiable chez soi, la réponse « panne » fait peur : elle montre qu'on a pris la sécurité pour une défaillance). **Recommandée.**
2. **« Le courant saute en pleine tempête : c'est le frein qui l'arrête… ou les pales ? »** (réponse : les pales).
3. **« Tu croises une éolienne qui tourne pendant un orage violent : normal… ou à signaler ? »** Piège : une éolienne qui tourne à pleine vitesse sous > 25 m/s serait anormale, mais variable selon constructeur (Storm Control). **Déconseillée** : réponse pas assez simple.

## L'histoire du système

Éoliennes modernes à pitch variable et pales orientables dès les années 1990-2000 (Enercon E-82 notice de 2010 [P]). Avant, beaucoup de machines à « stall » + aérofreins de bout de pale (Nordtank de Hornslet, mise en service en 1996 [S]). Le cadre français : arrêté du 26/08/2011 (ICPE rubrique 2980) cité par l'étude de dangers Fourris [P, citation seulement] ; guide technique INERIS/SER de mai 2012 sur l'étude de dangers (**non lu : erreur 403**). Qui a inventé le pitch : non sourcé, ne pas dire.

## Pour l'annonce

Phrase (après « Abonne-toi : », 17 mots) : **« Le bout de ses pales peut dépasser deux cents kilomètres-heure. Pourtant, en pleine tempête, elle s'arrête seule. »**
Un seul fait sûr (fin du film précédent, déjà dit au 035 : « Un système que tu croises sans le voir… et qui attend son heure. »). Fait sûr pour le raccord : « Rotor de 82 à 136 mètres de diamètre » [P]. L'annonce du **037** (prochain dossier) dépend du lot et n'est pas dans ma consigne.

## À ne pas dire

- Pas de « 176 km/h » ni « 165 mph » pour Ardrossan (chiffre d'un site secondaire, ou d'une station de montagne).
- Pas de cause tranchée à Ardrossan : Infinis (yaw) et Vestas (frein) s'opposent ; preuves brûlées.
- Pas de « tempête » à Formerie : la fiche ARIA ne donne pas de vent, la cause est une **coupure du réseau + batteries vieillies**.
- Pas de « elle s'arrête en N secondes » : le descriptif lu dit « quelques secondes » seulement.
- Pas « 25 m/s partout » : Enercon va à 28-34 m/s (Storm Control).
- Pas de « l'éolienne bloque son rotor » : sur Enercon, le rotor tourne librement au ralenti ; le blocage est manuel, maintenance.
- Hornslet : machine de 1996, 600 kW, **pas** une éolienne moderne ; cause pas conclue (gearbox « possiblement »). Ne pas la présenter comme le cas type. Les sources qui l'appellent « Vestas V52 » se trompent.
- Pas de « il y a x éoliennes en France » ni « elles n'ont jamais d'accident » : accidents réels existent (Formerie, Saint-Cirgues, Fitou, Conilhac).
- Ne pas mélanger Fitou (46030, bout de pale, pas de vent donné) avec Saint-Cirgues (45960, rafales 130 km/h).
- La « batterie » est Enercon ; chez Vestas V136 c'est un **accumulateur hydropneumatique**. Choisir un mot par modèle montré, ou dire « une réserve d'énergie par pale ».

## Ce que la voix peut dire (dix phrases, vraies telles quelles)

1. Une pale de soixante-huit mètres. Trois par rotor.
2. En bout de pale, ça file à près de trois cents kilomètres-heure. (calcul V136 : 360 ; E-82 : 280)
3. Le courant saute. Le réseau est coupé.
4. Chaque pale a sa propre réserve d'énergie.
5. Une seule pale en drapeau suffit à ralentir tout le rotor.
6. Elle tourne de quatre-vingt-dix degrés. L'aile ne porte plus.
7. Ce n'est pas un frein qui l'arrête. C'est le vent qu'elle lâche.
8. Au-dessus de vingt-cinq mètres par seconde, elle se met à l'abri.
9. À Formerie, en 2019, quarante minutes de survitesse. Le mât a plié en deux.
10. Des pales immobiles par grand vent, ce n'est pas une panne.

(Phrase 2 : « près de trois cents » est approximatif entre 280 et 360 : préférer « plus de deux cents ».)

## Pièces du dossier (réel montrable)

- **Fiches ARIA du BARPI (ministère de la Transition écologique)** : 53010 (Formerie), 45960, 46030, 51122. Texte public, citation avec source ; licence Etalab **non vérifiée sur la page** → à vérifier avant d'afficher une capture.
- **Notice technique Enercon E-82 E2** (annexe d'un dossier préfectoral de la Mayenne) : document de fabricant, droits non vérifiés ; schémas non reproduits, à refaire en 3D.
- **Photos/vidéos d'Ardrossan et Hornslet** : droits des médias (BBC, YouTube) **non libres, non vérifiés** → ne pas utiliser. Pas de photo Wikimedia Commons vérifiée une par une.

## Sources (lues)

- ARIA n° 53010, Formerie (Oise), 23/01/2019 : https://www.aria.developpement-durable.gouv.fr/accident/53010/ — **lue** (chronologie, batteries, suites).
- ARIA n° 45960 Saint-Cirgues-en-Montagne : https://aria.developpement-durable.gouv.fr/accident/45960/ — lue (14/11/2014, rafales 130 km/h, débris à 150 m).
- ARIA n° 46030 Fitou : https://www.aria.developpement-durable.gouv.fr/accident/46030/ — lue (bout de pale à 80 m, cause non établie).
- ARIA n° 51122 Conilhac-Corbières : https://aria.developpement-durable.gouv.fr/?p=172200 — lue.
- Notice Enercon E-82 E2 (Mayenne, 2012) : https://www.mayenne.gouv.fr/contenu/telechargement/49736/364809/file/6. Annexe 8 DAE - Notice Enercon.pdf — **lue** (PDF extrait en texte) : freinage aérodynamique, batterie par pale, coupure 25/31 m/s, Storm Control, yaw, ralenti ≈ 3 tr/min, caractéristiques.
- Étude de dangers Fourris (Volkswind, Vestas V136, déc. 2020), RNT : https://www.deux-sevres.gouv.fr/contenu/telechargement/42712/317861/file/79-Volkswind-Fourris-5bis-RNT_EDD.pdf — **lue** (dimensions, 3 m/s, 25 m/s, frein hydraulique, VOG, accumulateur).
- Ardrossan, copie du texte de New Scientist : https://scotlandagainstspin.org/2013/07/why-storm-winds-turned-wind-turbine-into-a-fireball/ — lue (site militant, copie ; **rapport Infinis/Vestas non lu**).
- HuffPost UK, 09/12/2011 : https://huffingtonpost.co.uk/amp/entry/wind-turbine-fire-freak-incident_n_1138658 — lue (RenewableUK, pas de vent mesuré sur site).
- Wikipédia Ardrossan Wind Farm et Hornslet wind-turbine collapse : https://en.wikipedia.org/wiki/Hornslet_wind-turbine_collapse — lues [S].
- Brevets (US 2013-2024, résultats de recherche, non ouverts) pour le drapeau ≈ 90° et la limite de vitesse de pitch.

**Non lues** : guide technique INERIS/SER mai 2012 (erreur 403) ; présentation BARPI « accidentologie éolienne » de la DREAL Hauts-de-France (erreur 403) ; étude de dangers Enercon Les Hayettes (> 10 Mo) ; rapport Infinis/Vestas d'Ardrossan ; articles ing.dk sur Hornslet ; Enedis, ministère, Connaissance des énergies (seulement vus dans les résultats de recherche).

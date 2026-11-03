# L05 Hudson — contre-vérification du script

Source maîtresse relue en local (PDF intégral, texte extrait) : NTSB AAR-10/03. Autres : Federal Register 2023-06413 (lu), AP/Insurance Journal 19/09/2016 (lu). Requêtes web : 5 (3 lectures, 2 recherches) sur 20. Pages citées = pages imprimées du rapport.

## Verdict

**12 phrases à corriger** (une erreur d'attribution ou une affirmation non sourcée chacune), **4 retouches facultatives** (nuance, pas une erreur). Les 110 autres tiennent. Aucune phrase ne juge une personne, ne prête une pensée ni ne touche aux derniers mots du cockpit.

## Points demandés

1. **`cockpit` « première rotation ensemble » : tient.** Note 3, p. 1 : « the first trip sequence that the captain and first officer had been paired to fly together ». « Trip sequence » = ce que les pilotes appellent une rotation (plusieurs vols enchaînés). Le rapport ne donne pas la durée : ne pas ajouter « plusieurs jours ».
2. **`certifie`, `pression`, `coque` : à corriger.**
   - Les « plus de 200 essais » (p. 21-22) sont faits sur des maquettes au 1/16 **d'A300 B2 et de Mercure**, pas de l'A320, reportés à l'A320 « pour leur géométrie proche ». La phrase laisse entendre qu'on a testé des maquettes d'A320.
   - Table 2 (p. 23) : certif. -1 ft/s, accident 12,5 ft/s ; pression moyenne 3,5 contre 15,1 psi (15,1 / 3,5 = 4,3 : « plus de quatre fois » tient). **Mais** le texte du rapport dit que la certification suppose 3,5 ft/s (p. 22 et p. 83 : « Airbus ditching parameter of 3,5 fps »), alors que la table affiche 1 ft/s. « Douze fois plus vite » repose sur la seule ligne de la table ; contre 3,5 ft/s on obtiendrait moins de quatre fois. On donne donc la grandeur du choc (12,5 ft/s = 3,8 m/s), sans rapport.
   - « Presque à plat, très lentement » : « presque à plat » tient (pente -0,5° à -1° contre -3,4° à -3,5°). « Très lentement » est faux si on l'entend de la vitesse de l'avion : 118 nœuds en certif. contre 125 à l'accident. Seule la vitesse verticale est comparée. Ajout utile : la certification supposait aussi de la poussée disponible (p. 22).
   - « Elle tient » (`coque`) : le rapport conclut que l'avion a respecté les exigences de certification (conclusion 4), mais la coque a été endommagée à l'arrière par l'impact (conclusion 5), de l'eau est entrée et les deux radeaux arrière sont devenus inutilisables (p. 5308 du texte, section 2.10). « Tient » laisse entendre une coque intacte. Dire qu'elle ne se disloque pas est exact.
3. **`bouton` : tient** (note 101, p. 60 : ferme les vannes sous la ligne de flottaison — outflow, avionique, prise d'air dynamique, entrées des groupes — « pour que l'avion flotte plus longtemps » ; aucune phrase ne dit s'il a été pressé). « Ouvertures » est acceptable, « vannes » est le mot du métier. **`refonte` : tient** (p. 52, 87 : amendement Airbus de 2005, les procédures d'amerrissage de l'ancienne check-list d'amerrissage passent dans « Engine Dual Failure » ; la partie 3 couvre « forced landing or ditching »). **Mais `page` (beat 66) : à corriger**, voir plus bas : rien dans le texte du rapport ne place le bouton sur la page 3 de la check-list (l'annexe C est une image, non vérifiée).
4. **`autre` : tient** (note 96, p. 56 ; p. 4701 du texte : la check-list d'amerrissage séparée « applied when a ditching was anticipated and at least one of the engines was running » et renvoie à Engine Dual Failure si les moteurs ne tournent pas).
5. **`certif`, `essais`, `regle`, `nouveaux` : tiennent.** Gros oiseau de certification : 4 lb = 1,8 kg, « volleyed into a critical area of the fan but not in the core area » (p. 16 et conclusion 10) ; oie de l'accident : 8 lb = 3,6 kg dans le cœur. Règle FAA 33.76(e), Amendment 33-36, effective le 5 juin 2023, oiseau visé sur le premier étage tournant pour entrer au maximum dans le cœur, cite le vol 1549. Applicabilité (préambule, III.J) : « This rule only affects engines with a certification date of application after the effective date » : « nouveaux moteurs seulement » est juste ; on peut même préciser « dont la demande de certification date d'après juin 2023 ».
6. **`courant`, `courant2`, `alpha`, `butee`, `lent` : tiennent ; `apu` à corriger.**
   - Génératrice (IDG) : fournit du courant seulement si N2 ≥ 54 % environ (p. 13) : « elle se tait » tient.
   - Loi normale : « The airplane cannot be stalled in normal law » (p. 12) ; conclusion 14 : l'APU a maintenu la loi normale. « Ne peut pas décrocher » tient, c'est la formulation du rapport.
   - Alpha-protection : l'AOA ne dépasse pas le maxi même manche à fond ; sous 100 ft, des fonctions « attenuate pilot sidestick pitch inputs » ; Airbus simule une marge de 3,5° non utilisée (p. 97-98). « Retient encore un peu le nez » tient. Le NTSB note aussi que l'avion « did provide maximum performance » : ne pas faire dire à l'image que l'ordinateur a causé quoi que ce soit.
   - Alarme de vitesse : « overridden below 100 ft or when a GPWS alert is triggered », aucune alerte générée (p. 13) ; 15 à 19 nœuds sous VLS sur les 200 derniers pieds (p. 89). `lent` tient.
   - « L'électricité a tenu » : tient. Le rapport évoque aussi la RAT (génératrice de secours) : le copilote lit « emergency generator not online » à 15:28:14, le commandant répond « it's online » à 15:28:19, la RAT est retrouvée sortie, et les pilotes jugent qu'elle n'a pas eu à être déployée à la main (p. 56-57). Aucune phrase du script ne dit « sans l'APU, plus de courant » : seulement la perte de la loi normale, qui est la conclusion 14. Garder cette formulation.
   - `apu` (« sans courant, plus de loi normale ») : à corriger. Même sans APU, la RAT donne un peu de courant ; c'est la **loi normale** qui aurait été perdue. L'APU est aussi une source « auxiliaire », pas « de secours » (le secours, c'est la RAT).
7. **`rallumages`, `gpws`, `noir`, `mauvaise` : `rallumages`, `gpws`, `noir` tiennent ; `mauvaise` à corriger.** Conclusion 7 (30 à 40 s, p. 87) ; conclusion 23 (la partie amerrissage de Dual Failure n'a pas l'étape d'inhibition du GPWS que contient la check-list d'amerrissage séparée) ; p. 88 « This critical step would not have been completed if the flight crew had simply followed the order of the items in the checklist ». `mauvaise` : « il n'en existait aucune » est trop fort ; le rapport dit qu'Airbus n'avait pas envisagé de check-list basse altitude et que ce type de check-list n'est « pas facilement disponible dans l'industrie » (p. 87).
8. **`huit`, `ajout`, `echec`, `seul`, `film`.**
   - 20 passes, 5 écartées, **15 retenues, 8 réussies (53 %)** avec virage immédiat : tient (p. 50). Mais les 15 passes visaient **trois pistes** : LGA 22 (6, 2 réussies), LGA 13 (7, 5 réussies), Teterboro 19 (2, 1 réussie). `consigne` « vers LaGuardia » est donc faux : à corriger.
   - Une seule passe avec 35 s de retard, LGA piste 13, échec ; le NTSB l'appelle « the one simulator flight that took into account real-world considerations » (p. 88). `echec` tient. `seul` : « il dit l'essentiel » généralise un essai unique ; à nuancer.
   - `ajout` : « Alors les enquêteurs ajoutent » laisse entendre que le retard a été ajouté **après** avoir vu 8 sur 15. Le plan d'essai prévoyait les deux cas dès le départ (p. 49). Les essais sont à Toulouse, 14-16 avril 2009, par le groupe Opérations et Facteurs humains du NTSB avec Airbus, US Airways, l'ALPA et le BEA.
   - `film` : le script décrit le film (enquêteurs qui cherchent un coupable) et dit que dans le rapport ce sont les enquêteurs qui ont ajouté les 35 s : juste pour le rapport (note 89 : « The 35-second delay accounted for real-world considerations »). Le portrait du film repose sur des sources secondaires (voir « reste ouvert »). Aucune image ni réplique du film.
9. **`reste`, `rejet`.** AP 19/09/2016 : « Of the 35 recommendations... only six have been heeded » ; 14 « closed-unacceptable » (dont l'exigence d'une procédure panne basse altitude dans les check-lists et la formation) ; gilets : la FAA a répondu qu'elle laissait cela aux compagnies. `rejet` tient. `reste` : « Six appliquées » : AP écrit « heeded » (suivies). Aucun statut plus récent trouvé (NTSB CAROL, page FAA 2025 : 403, non lue). **Reste ouvert** : dire « en 2016 », ce que fait déjà la phrase ; ne pas écrire « aujourd'hui ».
10. **`pourquoi`, `virage`, `defi`, `courant3`, `renforts`, `repeche`, `depuis`.**
    - `pourquoi` : l'aéroport est à 4,5 miles (7 km) de l'approche de la piste 22 : « quelques kilomètres » tient ; « sept kilomètres » est plus net si l'image montre la distance.
    - `virage` : à corriger. Le rapport ne dit nulle part que le virage fait descendre plus vite ; il donne les raisons du NTSB : trop loin, trop bas, et un retour direct aurait obligé à traverser Manhattan (p. 88). La physique du virage est exacte mais ce n'est pas la raison qu'on peut afficher.
    - `defi` : tient (au moment de l'impact, l'avion est au NNO de la piste 22 de LGA, qui est derrière lui).
    - `courant3` : tient (courant de jusant 1,4 nœud, l'avion et les ferries dérivent avec lui, p. 1571 et 2474 du texte ; jusant = vers le sud).
    - `renforts` : tient (p. 2.9 : un ferry en 3 min, les six autres en 10 min ; bateau des pompiers à 8 min ; deux bateaux des garde-côtes à 17 min ; tous secourus en 20 min).
    - `repeche`, `depuis` : tiennent (moteur gauche sorti le 23/01/2009 ; plumes identifiées par le Smithsonian, conclusion 6).

## Phrase par phrase

Tiennent : beats 0 à 5, 7 à 10, 13 à 14, 16 à 19, 20 à 31, 33 à 43, 45 à 53, 55 à 65, 67 à 76, 79 à 89, 91, 92, 94, 96 à 101, 103 à 107, 109 à 114, 116 à 125 (voir notes ci-dessous). Détail des vérifications non triviales :

- 0-3 : 15 h 27 min 11 s, 2 818 ft = 859 m, 6 096 m (20 000 ft), 3 min 32 s (212 s) et 155 personnes tiennent.
- 17 `bouton` : tient (« vannes » possible). 18 `refonte` : tient.
- 20, 36 « sept fois plus bas » : 6 096 / 859 = 7,1 : tient.
- 22 -7 °C (air) et 63/82 eau à 5,2 °C : tiennent. 23 : 150 passagers, 5 membres d'équipage : tient.
- 24 : noms et « copilote qui pilote » : tiennent (p. 1).
- 25-26, 64, 81 : le rapport compte 4 toboggans-radeaux (un par porte), l'avion est « EOW » alors que ce n'était pas exigé ; seuls les avant ont servi (les deux arrière, inutilisables après l'entrée d'eau). « À l'avant » (beat 25) est donc exact, mais incomplet ; ne pas faire dire qu'il n'y en a qu'à l'avant.
- 27-31 : horaires, « birds » à 3 s de la fin de la check-list : tiennent.
- 34 : 82 → 35 % (gauche), 82 → 15 % (droit) : tient (p. 47).
- 37 : 300 nœuds, 214 nœuds maxi (note 8) : tient.
- 42-43 : 15:27:19 « ignition, start » ; APU environ deux secondes plus tard : tient.
- 45 : « my aircraft » 15:27:23, QRH demandée 15:27:28 : tient.
- 46 : 3 060 ft = 933 m : « un peu plus de 900 » tient.
- 47 : le « mayday » n'est pas transmis (note 7) : tient. 48 : cap 220° à gauche : tient ; « il prépare déjà leur retour » est une lecture : l'offre de la piste 13 arrive à 15:28:05.
- 49 : c'est bien le copilote qui lit et dit « we don't have that » : tient.
- 55-57 : 15:28:25, 15:28:31 (6 s plus tard), TCAS dû à un hélicoptère : tiennent.
- 59 : coupure des deux commandes de moteur puis attente 30 s : tient (note 11).
- 60-62 : 15:29:11, piste 1 de Teterboro à 15:29:21, Hudson à 15:29:28 : tiennent.
- 65 : 75 s : tient. 67-68 : volets 2 à 15:29:49 : tiennent.
- 69 : GPWS « terrain terrain, pull up » dès 15:30:24 jusqu'à la fin : tient.
- 70-76 : 100 ft à 15:30:36, 50 ft à 15:30:41, 125 nœuds = 231 km/h : tiennent.
- 79 : issues d'aile gauche à 15:30:58 : tient.
- 83-86 : premier navire 15:34:40, 5 blessés graves (1 membre du personnel de cabine, 4 passagers), aucun mort : tiennent.
- 87-89 : trois mois plus tard (avril), Toulouse : tient.
- 97 : conclusion 15 : tient.
- 99 : « environ un tiers » (p. 88) : tient. 104 : conclusion 14 : tient.
- 105-107 : conclusions 16-17 (charge de travail, stress) et manque de formation : tiennent.
- 110-114 : tiennent (voir point 5).
- 117 : « ce qui te protège tient surtout à des choses que tu ne vois pas » est un jugement, non un fait sourcé ; acceptable en conclusion. 120 : « ferries à quatre minutes » : 15:30:43 → 15:34:40 = 3 min 57 s : tient.
- 123 : « il restait un plan » : tient pour la phrase seule, mais voir l'ambiguïté avec `autreciel` (le plan n'était pas fait pour ce jour).

## Phrases à remplacer

Format : beat | ancienne | nouvelle. Les crochets `[chiffre|mot]` sont conservés.

1. **certifie** : « Même l'eau est prévue. L'[A320|A trois cent vingt] a été certifié pour amerrir, après plus de [200|deux cents] essais de maquettes en bassin. » → « Même l'eau est prévue. L'[A320|A trois cent vingt] est certifié pour amerrir, d'après plus de [200|deux cents] essais en bassin sur des maquettes d'avions voisins. »
2. **pression** : « Le rapport fera les comptes. La certification supposait un avion qui touche l'eau presque à plat, très lentement. Lui descend douze fois plus vite. » → « Le rapport fera les comptes. La certification supposait un avion qui touche l'eau presque à plat, en descendant à peine. Lui descend de quatre mètres par seconde. »
3. **coque** : « Et la pression sur la coque, au choc, dépasse quatre fois celle de la certification. Pourtant… elle *tient*. » → « Et la pression sur la coque, au choc, dépasse quatre fois celle de la certification. Pourtant… elle ne se *disloque* pas. »
4. **apu** : « Mais sans courant, plus de loi normale. Alors dans la queue, il y a une troisième petite turbine, une source d'électricité de secours : l'[APU|A-P-U]. » → « Mais sans le courant des moteurs, plus de loi normale. Alors dans la queue, une troisième petite turbine prend le relais : l'[APU|A-P-U]. »
5. **memoire** : « Il le fait de mémoire. Avant même d'ouvrir la check-list. Là-dedans, l'[APU|A-P-U] ne vient que bien plus *loin*. » → « Il le fait avant même d'appeler la check-list. Là-dedans, l'[APU|A-P-U] ne vient que bien plus *loin*. » (Le rapport ne dit de mémoire que l'allumage, note 93 ; l'APU est démarré à ≈ 15:27:21, avant la demande de check-list de 15:27:28.)
6. **page** : « La check-list en est toujours à sa première partie. La page de l'eau, avec son bouton… ne sera jamais atteinte. » → « La check-list en est toujours à sa première partie. La page de l'eau… ne sera jamais atteinte. »
7. **virage** : « Faire demi-tour, c'est virer. Et un avion qui vire sans moteurs descend plus vite. » → « Faire demi-tour, c'est virer, et traverser Manhattan. Et un avion qui vire sans moteurs descend plus vite. »
8. **consigne** : « Consigne : faire demi-tour tout de suite, vers LaGuardia. » → « Consigne : faire demi-tour tout de suite, vers un aéroport. »
9. **seul** : « Un seul essai de ce genre a été fait, vers la piste treize. Mais il dit l'essentiel : comprendre prend du temps. » → « Un seul essai de ce genre a été fait, vers la piste treize. Mais c'est le seul qui compte le temps de comprendre. »
10. **mauvaise** : « Était-ce la mauvaise check-list ? Non : c'était celle qui collait le mieux. Il n'en existait aucune pour une panne aussi *basse*. » → « Était-ce la mauvaise check-list ? Non : c'était celle qui collait le mieux. Airbus n'en avait prévu aucune pour une panne aussi *basse*. »
11. **place** : « Pas une erreur de la check-list. Pas un exploit non plus. Un geste fait au bon moment… à la mauvaise place. » → « Pas une faute de l'équipage. Un geste fait au bon moment… à la mauvaise place. » (Le rapport juge la check-list « pas pleinement applicable » et trop longue ; il loue le professionnalisme de l'équipage, conclusion 19 : « pas une erreur de la check-list » et « pas un exploit » contredisent ce que le rapport conclut.)
12. **secours** : « Elle sert surtout au sol. En vol, presque personne n'y pense… jusqu'au jour où il n'y a plus *qu'elle*. » → « Elle sert surtout au sol. En vol, presque personne n'y pense… jusqu'au jour où les moteurs ne donnent plus de *courant*. » (La RAT existe aussi ; « plus qu'elle » est trop absolu.)

Retouches facultatives (nuance, pas une erreur) :

- **eclate** : « …une grande soufflante aspire l'air, le comprime, le brûle… et le rejette vers l'arrière. » → « …une grande soufflante aspire l'air, une partie est comprimée, brûlée… et tout est rejeté vers l'arrière. » (La majorité de l'air contourne le cœur, p. 14.)
- **poids** : « Une bernache, c'est environ [3,6 kg|trois kilos six]. Au moins deux entrent dans chaque moteur. » → « Ces bernaches pèsent environ [3,6 kg|trois kilos six] pièce. Au moins deux entrent dans chaque moteur. »
- **ajout** : « Alors les enquêteurs ajoutent trente-cinq secondes. Le temps de voir, de comprendre, de décider. » → « Les enquêteurs testent aussi un retard de trente-cinq secondes. Le temps de voir, de comprendre, de décider. »
- **reste** : « …Trente-cinq recommandations. Six appliquées. » → « …Trente-cinq recommandations. Six suivies. »

## Ligne « image » (long)

- **L'instant et la rupture (beats 0-5, 35-41)** : la 3D doit montrer l'avion à 860 m, deux moteurs qui décélèrent (35 % et 15 %), la check-list en 3 pages. Ne pas montrer un moteur « éteint » : le gauche remonte un peu à 15:28:25.
- **Ouverture de l'A320 (6-14)** : générateur, APU, loi normale. Ne pas montrer le bouton « ditching » enfoncé ni éclairé.
- **La carte (50-62)** : LGA 13, LGA 31, Teterboro. Ne pas tracer un « bon » trajet de retour ; les 15 passes avaient trois destinations.
- **La descente et l'impact (65-78)** : la phrase la plus difficile est `pression`/`coque` : l'image peut montrer l'arrière de la coque qui encaisse et se déforme, jamais une coque intacte ni un chiffre de pression non sourcé à l'écran. Un avion « à plat et lent » en certification contre un avion à 3,8 m/s : ne pas dessiner de rapport « douze fois ».
- **Évacuation (79-86)** : ne montrer que les radeaux avant gonflés ; les deux arrière sont inutilisables.
- **Enquête et simulations (88-97)** : Toulouse, ne pas montrer un seul avion « qui réussit » le demi-tour vers LaGuardia ; trois pistes, 8 succès sur 15, un échec à 35 s.
- **Fin (109-125)** : le tableau des recommandations est de 2016 ; ne pas mettre de date « aujourd'hui ».

## Reste ouvert

- Statut actuel (NTSB CAROL) des recommandations A-10-66/67 (check-list basse altitude), A-10-82 (gilets) : non confirmé ; la page FAA « usairways1549_recommendations.pdf » répond 403. Le script dit « en 2016 » : à garder.
- L'annexe C du rapport (la check-list en image) n'a pas été lue : ne rien affirmer sur ce que contient la page 3 au-delà de « forced landing or ditching ».
- Le portrait du film *Sully* (enquêteurs hostiles) vient de sources secondaires (dossier de faits : Flight Safety Australia 2016, Benzon, Brenner, Sumwalt) ; non revérifié ici.
- La table 2 du rapport (1 ft/s) contredit le texte (3,5 ft/s) sur la vitesse verticale de certification : c'est pourquoi la phrase `pression` ne donne plus de rapport.
- « Quatorze ans après » (beat 114) : 2009 → 2023, tient ; la règle FAA ne vise que les moteurs dont la demande de certification est postérieure à juin 2023.

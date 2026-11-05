# 041 — Contre-vérification du script

## Verdict
**2 phrases à corriger (obligatoire), 2 retouches de précision (recommandées), le reste tient.** Requêtes web : 5 sur 12 (le PDF NASA TP-2003 dépasse la limite de lecture ; les dimensions ont été recoupées par recherche).

## Points demandés
- **« 10 kilomètres par seconde »** : tient comme ordre de grandeur (NASA ODPO ≈ 10 km/s en orbite basse ; sur l'ISS la moyenne est 8 à 9, pics 15). Dit « dix », pas « exactement ». OK.
- **« tôle d'un ou deux millimètres »** : tient. Pare-chocs aluminium 6061-T6 typique 1,27 à 1,9 mm sur les modules ISS (article sur la famille stuffed Whipple, zenodo ; essai de base 1,27 mm). Figure toujours non vue, mais deux sources concordent.
- **« dix centimètres de vide »** : tient. Écartement total ≈ 11,4 cm (typique ISS), dont le matelas Nextel/Kevlar occupe une tranche mince contre la paroi : il reste ≈ 10 cm libres. Colonne ESA ≈ 13 cm : l'ordre de grandeur couvre.
- **« presque cinq millimètres »** : vrai pour le laboratoire américain (4,8 mm), mais la paroi arrière des modules va de 3,2 à 4,8 mm. Voir correction 3 (précision).
- **« un million de fois la pression de l'air »** : tient. 1 Mbar = 10^11 Pa ≈ 10^6 atm ; calcul d'adaptation d'impédance aluminium-aluminium à 10 km/s : ≈ 1,6 Mbar. « Un million » est le bas de la fourchette, jamais exagéré.
- **15/11/2021** : tient. Missile antisatellite russe à tir direct (Nudol), Kosmos 1408 ; plus de 1 500 fragments suivis (US Space Command) ; équipage de sept réfugié dans Crew Dragon et Soyouz arrimés. Réserve : « plus de 1 500 morceaux » sans « suivis » sous-entend le total ; il y en a des centaines de milliers de plus petits (voir correction 4).
- **Le bouclier n'est jamais dit arrêter plus d'environ 1 cm** : OK dans « Il arrête un centimètre. Pas plus. ». Mais la chute laisse entendre que tout ce qui dépasse 1 cm est esquivé : faux (voir correction 2).
- **« vaporisé » / « explose »** : absents du script. OK. « Gouttes de métal fondu » est juste (fondu en partie).

## Phrase par phrase
- **accroche** : « Un débris fonce sur ta tête. Dix kilomètres par seconde. Ta station le laisse frapper. » — tient.
- **promesse** : « Entre lui et toi : une tôle d'un ou deux millimètres. » — à corriger (léger) : laisse entendre que SEULE cette tôle sépare du débris ; il y a aussi le vide, le matelas et la paroi de 3 à 5 mm. Résolu à 28 s mais la phrase est littéralement fausse. « Au-delà d'un centimètre… tu te caches où ? » — tient.
- **scene** : « Un centimètre : trop petit pour être vu. » tient (suivi ≥ 10 cm). « Quinze fois plus vite qu'une balle » tient (22 000 mph / 1 500 mph, Estell) ; « une quinzaine » serait plus honnête mais « quinze » passe. « Tout repose sur cette tôle » : tient comme tension (elle brise le débris en premier) ; ne pas l'illustrer comme seule protection.
- **ouvre** : tient.
- **eclate** : « D'abord, la tôle d'aluminium. Un matelas de céramique et de kevlar. » tient (Nextel = fibre de céramique). « Ta coque, presque cinq millimètres » — précision (voir 3). « dix centimètres de vide » tient.
- **principe** : « Le débris ne perce pas la tôle : il s'y brise » — **à corriger** : le pare-chocs EST percé (trou d'entrée, NASA TP-2003) ; en plus, contredit la ligne « La tôle se perce » de `reponse`. Le reste (nuage qui s'étale, « pluie, pas une balle ») tient.
- **repos** : « plus épais à l'avant de la station » tient (avant et flancs plus lourds, côté Terre plus léger). « Il arrête un centimètre. Pas plus. » tient (conçu pour 1,3 cm à 7 km/s ; « environ 1 cm et moins » à l'usage). « Et le tien… fait un centimètre » : tient (scène reconstituée).
- **zero** : tient.
- **reponse** : tient (« La tôle se perce » est juste). Image : ne pas montrer de vaporisation totale ni de flamme.
- **chute** : « n'arrête pas les gros débris. Elle les esquive. » — **à corriger** : on n'esquive que les objets suivis (≥ ~10 cm) et quand on les voit à temps ; entre 1 et 10 cm rien ne protège (bouclier trop faible, objet non suivi), et le 15/11/2021 la station n'a rien esquivé : l'équipage s'est abrité. Cela contredit aussi la question finale.
- **comment** : « plus de mille cinq cents morceaux » — précision : « suivis » manquant (voir 4). « Les sept astronautes se réfugient… dans leurs capsules » tient (Dragon et Soyouz). Question fermée à deux camps : OK.
- **like** : tient (dit « croit », pas « est faux » ; une plaque unique est moins efficace à masse égale).
- **abo** : « un char dont le toit est fait pour sauter » : hors périmètre ; à confirmer par la contre-vérification du 042 (panneaux d'éclatement du compartiment munitions, pas tout le toit).
- **boucle** : tient.

## Phrases de remplacement
1. **principe** (obligatoire) : « Le débris ne perce pas la tôle : il s'y brise, en nuage. » → « Le débris perce la tôle, mais il s'y brise, en nuage. » (text : `Le débris perce la tôle, mais il s'y +brise+, en nuage.`)
2. **chute** (obligatoire) : « Voilà le secret : ta station, la plus blindée jamais lancée, n'arrête pas les gros débris. Elle les esquive. » → « Voilà le secret : ta station, la plus blindée jamais lancée, n'arrête pas les gros débris. Elle les esquive… quand elle les voit. » (+4 mots ; si trop long : « Elle esquive ceux qu'elle voit. »). Le mot « quand elle les voit » ouvre la question du commentaire (1 à 10 cm invisibles).
3. **eclate** (recommandé) : « Ta coque, presque cinq millimètres. » → « Ta coque, trois à cinq millimètres. » (text : `Ta coque, [3|trois] à [5|cinq] millimètres.`)
4. **comment** (recommandé) : « plus de mille cinq cents morceaux » → « plus de mille cinq cents morceaux suivis ». 
5. **promesse** (recommandé) : « Entre lui et toi : une tôle d'un ou deux millimètres. » → « Devant ta coque : une tôle d'un ou deux millimètres. » (même longueur, vrai ; garde la tension).

## Reste ouvert
- Figures NASA 5-8 et 3-13 jamais vues (épaisseurs lues en texte et par deux sources secondaires) ; « un ou deux » absorbe l'incertitude.
- Hors périmètre : nature exacte du « toit » du char (042).
- Image : nuage de fragments, trou du pare-chocs et équipage sont des reconstitutions (déjà dans `sources`).

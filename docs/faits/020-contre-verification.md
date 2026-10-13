# Contre-vérification du script 020 (Taipei 101)

Phrases tenues contre `docs/faits/020-taipei-101.md`, plus 6 requêtes web sur les points fragiles. Aucune consigne trouvée dans les pages n'a été suivie.

## Beat par beat

- **accroche** : tient. Scénario (tu es au sommet), la tour oscille. (A/B)
- **promesse** : « 660 tonnes bougent à contretemps » tient (site officiel A, Structure B : « oscillates out of phase »). « Pour les séismes ? Pas vraiment » tient (étude Tamkang B : peu efficace contre les séismes lointains). **« Tu le sens à peine » : ne tient pas tel quel** : aucune mesure avec/sans boule ; seul chiffre = « jusqu'à 40 % » du propriétaire. La source A dit « confortable », pas « imperceptible ».
- **scene** : « 8 août 2015, typhon Soudelor » tient (Taiwan News B). « Rafales à 160 km/h » **fragile** : Guinness (B) dit « battered Taipei with 100-mph (160 km/h) winds », sans préciser vent moyen ou rafale ; Popular Mechanics cité par Archinect (C) parle de 100 mph soutenus et une rafale à 145 mph. « Cent un étages » tient (nom de la tour ; non contesté). « Comme un bateau » / « mal de mer » : simplification assumée (confort), à garder au conditionnel (c'est déjà « tu aurais »).
- **ouvre** : tient.
- **eclate** : tient (site officiel A : 5,5 m, 41 plaques, 92 câbles, 8 vérins, anneau de butée 150 cm). « Autour » pour l'anneau : plausible (pare-chocs), non précisé par la source. À l'image de ne pas contredire.
- **repos** : « pendule accordé sur la tour » tient (Wikipédia TMD B, Amusing Planet B). « La tour part d'un côté… la boule traîne, et la retient » : image juste (inertie, déphasage ; elle freine la tour par ses câbles et ses vérins) ; simplification acceptable. « Les vérins changent l'élan en chaleur » tient (Guinness, Structure B).
- **seuil** : tient (aucun fait).
- **zero** : « 6 h 59 » tient (Taiwan News : « at 6:59 a.m. on Aug. 8, 2015 », B) : c'est l'heure du **maximum**, pas du début de la rafale ; la phrase la place au début de la montée (« La rafale. La tour part… »). Raccourci de scénario, déjà signalé dans `sources` comme étapes ; à rendre explicite. « 50 cm, 70 » : étapes non mesurées (déjà dit). « Butée à 1,50 m » tient (A). « Elle avance encore » : dramatisation sans fait contraire.
- **reponse** : « Un mètre » tient (B, Guinness « farthest 1 m »). « Les vérins freinent » tient. **« Elle n'est jamais allée plus loin » : fragile** : Taipei 101 ne publie plus les mouvements depuis le 24/10/2021 (Taiwan News B) ; vrai du record publié, invérifiable après 2021. « C'est son record » tient.
- **chute** : « n'empêche pas la tour de tomber, la tour tient seule » tient pour la structure (A : but principal = confort). **Nuance** : Structure magazine (B) dit « structural safety and occupant comfort » ; « pour ton confort » seul est un peu exclusif. Sur wind design le TMD fait partie du dimensionnement. Acceptable si on ajoute « d'abord ».
- **comment** : « les séismes ? ses vérins la brident » tient (« lock down », Structure B). « Vingt centimètres, son record » tient pour le séisme du 18/04/2019 (Taiwan News B) mais « son record » après le « record » de 1 m prête à confusion ; et même réserve post-2021. « C'est le squelette de la tour qui encaisse » tient (conception, outriggers, B).
- **like** : tient (opinion).
- **abo** : Crisenoy (77), 24/12/2024, TGV n° 6689 Paris–Saint-Étienne, chute du conducteur : confirmé par le BEA-TT (page officielle, A, fiche lue en résultat seulement, PDF en 403). **« 255 km/h » non retrouvé** dans mes requêtes : à contrôler dans `docs/faits/021-vacma-tgv.md` ou la fiche BEA-TT. « Dans la cabine plus personne » : conforme à une chute du conducteur en marche. Le script ne cite pas « rapport BEA-TT » à l'antenne (bien).
- **boucle** : tient.

## Corrections proposées

1. **promesse** · « Tu le sens à peine : » → « Tu le sens bien moins : » (ou « Là-haut, ça reste supportable : ») · aucune mesure du ressenti ; seule la tour dit « confortable » (A) et « jusqu'à 40 % » (B). Garder « à contretemps ».
2. **scene** · « Des rafales à 160 kilomètres-heure. » → « Des vents à 160 kilomètres-heure. » · Guinness (B) ne précise pas rafale ; Popular Mechanics (C) donne des chiffres différents. Rien d'autre à changer.
3. **zero** · « Six heures cinquante-neuf. La rafale. » → « Six heures cinquante-neuf : le pic. La rafale. » (ou garder et ajouter dans `sources` que 6 h 59 = instant du maximum) · Taiwan News : l'heure est celle du déplacement maximal.
4. **reponse** · « Elle n'est jamais allée plus loin : c'est son record. » → « Elle n'a jamais été relevée plus loin : c'est son record. » · données non publiées depuis oct. 2021.
5. **chute** · « La boule est là… pour ton confort. » → « La boule est là… d'abord pour ton confort. » · Structure : sécurité structurelle aussi.
6. **comment** · « vingt centimètres, son record » → « vingt centimètres, son record en séisme » · éviter le conflit avec le mètre.
7. **abo** · « 255 » : garder seulement si confirmé dans le dossier 021 (non retrouvé ici).

## Ce que `sources` devrait préciser

- 6 h 59 = heure du déplacement maximal (Taiwan News), pas du début de la rafale.
- « 160 km/h » = « vents » selon Guinness (moyenne ou rafale non précisé) ; la voix dit « vents ».
- « Jamais plus loin » = record publié ; plus de publication depuis le 24/10/2021.
- « Confort d'abord » : Structure magazine ajoute la sécurité structurelle.
- 255 km/h et Crisenoy : renvoyer à `021-vacma-tgv.md` (BEA-TT, TGV 6689, 24/12/2024).
- « Tu le sens à peine » à retirer de la liste des traductions du but de confort.

## Requêtes utilisées (6 sur 12)

1. WebSearch : TGV 24 décembre 2024 BEA-TT, 255 km/h, VACMA.
2. WebFetch : taiwannews.com.tw/en/news/3683775 (6 h 59, 100 cm, record).
3. WebSearch : Soudelor Taipei 101 6:59, rafales km/h.
4. WebFetch : BEA-TT fiche Crisenoy (403).
5. WebFetch : Guinness, plus grand TMD (1 m, 100 mph / 160 km/h).
6. WebSearch : Crisenoy TGV 6689 vitesse 255 km/h.

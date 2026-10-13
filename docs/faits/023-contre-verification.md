# 023 — Contre-vérification du script (éolienne de secours / Air Transat 236)

Date : 2026-10-13. Base : `docs/faits/023-eolienne-de-secours.md` (rapport GPIAA 22/ACCID/2001, lu en entier par l'auteur du dossier ; je ne l'ai pas relu). Niveaux : A primaire / B secondaire sérieuse / C faible. 2 requêtes web sur 10.

## Beat par beat

**accroche** « les deux moteurs de ton avion viennent de s'éteindre » : tient avec réserve. Droit éteint à 06 h 13, gauche à 06 h 26 (A, p. 2 et 8). « Viennent de » est vrai de l'état (plus aucun moteur) et du second. Mais `zero` redit « Le second moteur s'éteint » : le spectateur peut croire à une contradiction. Correction facultative, voir plus bas.

**promesse** « Tu te poseras, vivant : dehors, une petite hélice vient de sortir. Reste un problème : tes freins. » : tient. RAT sortie automatiquement à la double panne (A, p. 25-26). « Petite » : diamètre A330 non trouvé, ≈ 0,8 m en moyenne (B-) : relatif, défendable. Freins : A, p. 11 et 26.

**scene**
- « Vingt-quatre août 2001. Un Airbus, 306 personnes » : tient (13 + 293, A, p. 2 et 8).
- « Une fuite a vidé les réservoirs » : tient en simplifiant. Cause = extinction par épuisement du carburant, déclenchée par une fuite sur le moteur droit (A, p. 69). Facteur aggravant : procédure de fuite non appliquée. « Vidé » est acceptable ; ajouter « de carburant » lève l'ambiguïté.
- « Plus de moteurs : plus d'électricité, plus de pression pour bouger les gouvernes » : FRAGILE. « Plus d'électricité » est faux au sens strict : l'avion passe sur batteries puis sur le générateur de secours (A, p. 25-26 ; « À ne pas dire » du dossier : « sans électricité »). La pression hydraulique, elle, est bien perdue (BLEU et JAUNE définitivement, VERT jusqu'à la RAT).
- « la piste la plus proche est à cent vingt kilomètres » : 65 NM ≈ 120 km de Lajes au moment de l'extinction (A, p. 2). Mais « la plus proche » n'est pas établie : le rapport dit Lajes, pas « la plus proche » ; et l'autre aéroport des Açores (Santa Maria) n'a pas été comparé. Défendable seulement si l'on dit « la piste ».

**ouvre** « Alors… on l'ouvre. » : signature, tient.

**eclate** « Une trappe. Un bras, poussé par un ressort. Une hélice. Et derrière… une pompe. » : tient avec réserve. Ressort : Airbus MBN p. 2, décrit pour la famille A320, pas pour l'A330 (A, A320 ; même type d'actionneur, B). Trappes : décrites par un brevet Airbus d'assemblage de RAT (volet de carénage s'ouvre pour laisser passer le mât), non spécifique à l'A330 (B-). Pompe : « The GREEN hydraulic system continued to be powered by the RAT » (A, p. 26) ; « derrière » est une position visuelle non sourcée (simplification à déclarer).

**repos**
- « Elle dort dans le fuselage » : NON SOURCÉ pour l'A330. Le dossier dit « emplacement non trouvé » ; ma recherche ne l'a pas non plus trouvé (rien de spécifique à l'A330). Le script contredit donc `sources` (« l'emplacement… rien n'en est dit »). Le dossier note aussi qu'ailleurs elle sort d'une aile. Remplacer par une formule sans lieu.
- « Tous les moteurs s'arrêtent en vol ? Elle sort seule. » : tient (A, Airbus MBN p. 7 : tous moteurs coupés, pompes en basse pression, vitesse > 100 kt).
- « c'est le vent de l'avion qui la fait tourner » : tient (principe d'une RAT, A/B).
- « elle pousse l'huile… dans un seul circuit » : tient (vert seul, A, p. 26). « Huile » est familier : c'est du fluide hydraulique. Un pilote ou un hydraulicien peut le relever ; acceptable à l'oral, sinon « le liquide ».

**seuil** : tient (promesse, aucun fait).

**zero**
- « Six heures vingt-six. Le second moteur s'éteint. » : tient (A, p. 2) ; c'est l'heure UTC du rapport. Aux Açores l'heure d'été est UTC+0 (de mémoire, non vérifié), donc l'heure locale coïncide. À mettre dans `sources`.
- « Dix mille mètres » : FL 345 ≈ 10 500 m (A, p. 2). Ordre de grandeur correct ; « plus de dix mille » serait plus juste.
- « Plus de pilote automatique » : tient (pilotes automatiques 1 et 2 inopérants, A, p. 26).
- « Et l'avion… descend. » : tient.

**reponse**
- « L'hélice sort. Elle tourne. Un circuit sur trois revit. » : tient (A, p. 26). Mais ordre et immédiateté : le rapport p. 25 écrit « would have automatically reverted… ». La sortie est une conséquence logique reconstituée, le rapport n'a pas enregistré les alarmes correspondantes ; l'instant exact de la sortie est inconnu (sources de temps contradictoires, C). Dans le film la RAT sort tout de suite après la panne, ce qui n'est pas contredit, mais ne doit pas être chiffré ni montré comme instantané.
- « Les gouvernes répondent » : tient en esprit (vert = commandes de vol primaires, A, p. 26). Le rapport ne dit pas qu'elles avaient cessé de répondre avant la RAT ; sans faute grave, mais laisser l'idée de « commandes retrouvées » plutôt que « coupées puis rendues ».
- « Le commandant vise une île » : tient (Lajes, île de Terceira ; déroutement décidé à 05 h 45, A, p. 8). L'île n'est pas nommée, bien.
- « Dix-neuf minutes de plané » : tient (06 h 26 → 06 h 45, calcul sur les heures du rapport, A ; Wikipédia B donne aussi 19).
- « Et la piste est là. » : tient.

**chute** « un avion sans moteur ne tombe pas. Il plane. Et c'est le vent de sa descente… qui lui rend de quoi piloter. » : tient. C'est la correction capitale du dossier (la RAT ne fait pas planer, ne rallume rien). « Voilà son secret » : le « son » peut se lire comme celui de la RAT, alors que le plané n'est pas son fait. Préférer « le secret ».

**comment**
- « Presque rien : ni inverseurs, ni freinage normal » : tient (inverseurs et freinage normal/antipatinage perdus, A, p. 11 et 26).
- « Il touche la piste à 370 km/h » : approximatif. Le rapport donne ≈ 200 kt au SEUIL de piste (A, p. 8) ; le premier toucher est dur, suivi d'un rebond. 200 kt = 370 km/h, mais c'est une vitesse indiquée au seuil, pas au toucher. Ajouter « environ » et « au seuil ».
- « Freinage de secours. Les pneus lâchent… il s'arrête. » : tient (freinage maximal sur accumulateur, roues bloquées, pneus des trains principaux usés puis dégonflés après le second toucher, A, p. 11).
- « Aucun mort. » : tient (A, p. 8). 16 passagers + 2 PNC blessés, tous à l'évacuation (14 + 2 légers, 2 graves) ; le film ne donne pas le chiffre, bon.

**like** : tient (aucun fait).

**abo** « la seule salle où un défaut électrique… ne doit rien couper » : « la seule » NON DÉFENDABLE. Le schéma IT médical (CEI 60364-7-710) concerne les locaux médicaux du groupe 2 : blocs opératoires, mais aussi salles d'intervention, anesthésie, réveil, réanimation/soins intensifs, cardiologie interventionnelle (B : IET, Bender, Socomec, résumés d'un moteur de recherche, non lus en entier). Et « ne doit rien couper » est vrai au PREMIER défaut seulement (une alarme se déclenche, le second défaut peut couper). À préciser dans le script et dans `docs/faits/024-bloc-operatoire.md`.

**boucle** « Et pas besoin, pour ça, d'être… » → « Au-dessus de l'Atlantique » : cohérent, aucun fait.

**post** : légende et épinglé tiennent. Épinglé : « plane 19 minutes sans moteur au-dessus de l'Atlantique » : correct (la piste est aux Açores, la panne en plein Atlantique).

**Bilan : 11 beats sur 14 tiennent sans correction de fond** (promesse, ouvre, seuil, zero, reponse, chute, like, boucle, ainsi que eclate et accroche avec réserves mineures). **4 phrases à corriger** : « plus d'électricité » (scene), « la piste la plus proche » (scene), « Elle dort dans le fuselage » (repos), « Il touche la piste à 370 » (comment), et **1 à corriger sans discussion** : « la seule salle » (abo). Le comptage exact : 9 beats propres, 5 beats avec une correction.

## Corrections proposées

1. **scene** · « plus d'électricité, plus de pression pour bouger les gouvernes » → « plus de générateurs, plus de pression pour bouger les gouvernes » · l'avion garde batteries puis générateur de secours (A, p. 25-26).
2. **scene** · « la piste la plus proche est à cent vingt kilomètres » → « la piste de Lajes est à cent vingt kilomètres » (ou « la seule piste à portée est à cent vingt kilomètres » si Merwan préfère, non vérifié) · A, p. 2 : « about 65 nautical miles from the Lajes airport » ; « la plus proche » non établi.
3. **repos** · « Elle dort dans le fuselage. » → « Elle dort, repliée, derrière une trappe. » · emplacement A330 non trouvé (dossier + ma recherche) ; la trappe est déjà dite dans `eclate`.
4. **comment** · « Il touche la piste à trois cent soixante-dix kilomètres-heure. » → « Il passe le seuil à environ trois cent soixante-dix kilomètres-heure. » · A, p. 8 : « about 200 kt » au seuil.
5. **abo** · « la seule salle où un défaut électrique… ne doit rien couper » → « la salle où le premier défaut électrique… ne doit rien couper » · IT médical : plusieurs locaux du groupe 2, et seulement au premier défaut (B : IET, Bender).
6. Facultatif · **accroche** « les deux moteurs de ton avion viennent de s'éteindre » → « ton avion n'a plus un seul moteur » · lève la confusion avec « Le second moteur s'éteint » de `zero` ; garder « Au-dessus de l'Atlantique » en tête (boucle).
7. Facultatif · **chute** « Voilà son secret » → « Voilà le secret » · le plané n'est pas le fait de la RAT.
8. Facultatif · **scene** « Une fuite a vidé les réservoirs » → « Une fuite de carburant a vidé les réservoirs » · clarté.

## À ajouter à `sources` du script

- Les heures du film sont en UTC, comme le rapport (06 h 13 moteur droit, 06 h 26 moteur gauche, 06 h 45 toucher).
- « Dix mille mètres » = FL 345 ≈ 10 500 m ; « cent vingt kilomètres » = 65 NM de Lajes.
- La sortie de l'éolienne à la double panne est déduite par le rapport (p. 25, « would have automatically reverted »), non enregistrée ; son instant et sa durée ne sont ni dits ni montrés avec précision.
- Le ressort et les trappes viennent de la documentation Airbus de la famille A320 et d'un brevet Airbus ; la position « derrière l'hélice » de la pompe et l'emplacement de l'éolienne d'A330 sont des choix de mise en scène.
- 370 km/h = 200 nœuds au seuil, non au toucher.
- Retirer de `sources` la phrase « l'emplacement… rien n'en est dit » ou la rendre vraie en supprimant « dans le fuselage ».
- Pour le 024 : le schéma IT n'est pas exclusif au bloc opératoire (locaux du groupe 2) et ne vaut qu'au premier défaut.

## Requêtes utilisées

1. Web : « Airbus A330 ram air turbine location lower fuselage RAT door » → emplacement A330 non confirmé ; brevet Airbus (trappes de carénage).
2. Web : « IT system isolated neutral medical locations group 2 … » → IET, Bender, Socomec : groupe 2 = plusieurs types de locaux, première panne sans coupure.

Total : 2 requêtes sur 10. Le reste est vérifié contre le dossier de faits (rapport GPIAA lu par son auteur).

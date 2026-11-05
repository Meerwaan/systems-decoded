# CR02 Deepwater Horizon — contre-vérification du script

Sources relues : CSB Engineering Services (ES, 06/02/2014, texte extrait en local), CSB Vol. 2 (05/06/2014, texte extrait), fiche BSEE 2019, résumés de la règle 2016. Requêtes web : 5 sur 12 (3 lectures de PDF, 2 recherches ; la page Hunton comptée).

## Verdict

22 beats relus. **12 phrases à corriger** (10 beats : principe, piege, t1, t2, t3, t6, t9, defaut, pire, issue, depuis, comment ; 2 sont des rappels de chiffre). Aucune heure n'est fausse : 21 h 08, 21 h 31, 21 h 40, 21 h 43, 21 h 47, 21 h 49, 21 h 56 et « avant 21 h 58 » sont dans l'ES. Les erreurs sont des surdits : « moins de dix », « mâchoires du bas », « la pression l'avait tordu », « sans doute », « par hasard ».

## Points demandés

- **Heures** : toutes confirmées dans l'ES (annulaire supérieur 21 h 43, mâchoire de tube fermée et étanche 21 h 47, explosion 21 h 49, bouton EDS sur la passerelle 21 h 56, AMF « avant 21 h 58 »). Ce sont des heures de **simulation calée sur les données** (BP/Transocean : 21 h 09 pour l'arrêt des pompes). Acceptable en film « reconstitution » ; à dire dans `sources`.
- **9 et 22 barils/min** : 9 b/min « vers 21 h 10 » (ES parle de 21 h 08 pour l'arrêt des pompes et de ≈ 9 b/min à ce moment-là) ; 22 b/min à 21 h 31, « calculé et qui accélère ». Ce sont des **calculs**, donc « environ ».
- **« Moins de dix barils/min »** : l'ES l'écrit (« not publicized, but usually below 10 BPM ») mais la note 78 dit : **« Author's understanding from personal experiences »**. C'est un avis d'ingénieur, pas une statistique. Et l'ES précise que le BOP « n'est pas conçu pour un débit précis ». À présenter comme un ordre de grandeur. Risque d'oreille : 9 (à 21 h 08) est « sous dix » ; la voix doit marquer que le 9 est un **débit entrant au fond, non détecté**, le 22 un débit à l'arrivée de la crise.
- **Test négatif** (« deux cadrans qui doivent dire pareil », 1 400 psi contre zéro) : tient. Le tube (1 400 psi) et la ligne d'étranglement (0) sont reliés au même puits sous le BOP, donc doivent afficher la même pression ; l'ES le dit (« ils auraient dû dire la même chose »). Simplification honnête.
- **Tube plié « comme un tuyau d'arrosage »** : l'ES parle de flambage (« buckling ») dû à une **charge de compression** (frottement du fluide, poids), avec la **pression interne qui s'y ajoute** (« contributed ») : un tube peut flamber « avec peu de compression, voire en tension » quand la pression dedans dépasse celle de dehors (≈ 6 800 psi de différentiel). Donc « la pression l'a tordu » seul est trop fort. Le « tuyau d'arrosage » n'est pas dans le CSB : image acceptable, pas citée. Le tube est **percé et en partie coupé** (« punctured and partially severed », Vol. 2) : « sans le couper » est un peu absolu.
- **Deux défauts du système de secours** : tient. Vol. 2, fig. 3-2 : pod bleu, batterie de 27 V vidée par un câblage fautif ; pod jaune, électrovanne Y103 mal câblée, une bobine rendue inopérante par une **pile de 9 V vidée**, ce qui a laissé l'autre bobine agir sans opposition. Le CSB conclut que l'AMF a **vraisemblablement** fermé la BSR (l'ES : « more likely than not »). « N'a marché que par hasard » est donc une inférence ; à adoucir.
- **Plateforme, 4,9 millions, trois mois** : coule le 22 avril au matin, soit le surlendemain (≈ 36 h de feu) : « deux jours plus tard » est correct. 87 jours : « près de trois mois » ✓. 4,9 millions de barils ± 10 % est le total rejeté (une partie a été récupérée) : dire « environ ».
- **Règle de 2016** : deux jeux de lames en série ✓ (§ 250.734, échéance 3 ans) ; moyen de centrer le tube ✓ (conservé en 2019, mais il peut être assuré par la lame elle-même, échéance 2023) ; vérification du cisaillement par un tiers indépendant ✓ (BAVO en 2016, tiers indépendant depuis 2019). Mais c'est **« vérifier »**, pas « tester », et l'obligation est **échelonnée** : « doit avoir » depuis 2016 est un raccourci.

## Phrase par phrase

1. **accroche** : tient. 21 h 40, boue sur le plancher, 9 min avant l'explosion ✓.
2. **promesse** : tient (« neuf minutes » ✓). Réserve : la mâchoire de tube **a** scellé à 21 h 47 ; la promesse ne vaut que pour les lames, ce que la suite dit.
3. **principe** : à corriger. « Elle pèse plus que le gaz » est faux au sens physique : c'est sa **pression** qui doit dépasser celle d'en bas.
4. **bop** : tient (annulaires, mâchoires, lames cisaillantes ✓).
5. **piege** : à corriger (note 78, voir plus haut).
6. **t1** : à corriger légèrement : « quitter le puits » est ambigu pour l'oreille (partir ? abandonner ?). Le test dure de 17 h 52 à 19 h 55 ; juger « réussi » à 19 h 55 ✓.
7. **lecture** : tient (1 400 psi / zéro, test jugé réussi à tort ✓).
8. **t2** : à corriger. « Personne ne le voit » prête un état d'esprit ; l'ES dit « aurait dû remarquer » les indices, pas qu'ils étaient invisibles.
9. **t3** : à corriger : 22 est un débit calculé ; le rappel « moins de dix » reprend le surdit.
10. **t4** : tient (21 h 40, débordement, boue dans le derrick ✓).
11. **t5** : tient (annulaire supérieur, 21 h 43, ne scelle pas, joint érodé ✓).
12. **t6** : à corriger. La mâchoire fermée est la **mâchoire du milieu** (MPR) selon l'ES et l'examen DNV, pas « du bas ». Reste vrai : « ça tient » (5 000+ psi), gaz déjà au-dessus.
13. **t7** : tient.
14. **t8** : tient (bouton EDS pressé sur la passerelle à 21 h 56, alarme « accumulateurs bas » ; l'EDS aurait dû fermer la BSR puis déconnecter).
15. **t9** : à corriger légèrement : « sans doute » se comprend « certainement » à l'oreille ; le CSB dit « vraisemblablement ».
16. **defaut** : à corriger (voir plus haut).
17. **pire** : à corriger légèrement (« par hasard » = inférence ; deux défauts qui s'annulent est le fait).
18. **issue** : à corriger légèrement (« environ » avant 4,9 millions). Onze morts ✓.
19. **depuis** : à corriger (« testées » → vérifiées ; échelonnement ; centrage).
20. **comment** : à corriger légèrement. « Un tube plié » comme seule réponse contredit « à ne pas dire : un seul défaut » ; le film vient de montrer trois défauts.
21. **abo** : tient.
22. **boucle** : tient (retombe sur « vingt et une heures quarante »).

## Phrases de remplacement

- **principe** : « D'abord, comment ça marche. Un puits, c'est un long tube plein de boue lourde. Tant que son poids l'emporte sur la pression du gaz qui pousse d'en bas… rien ne remonte. »
- **piege** : « Mais en pratique, on referme d'habitude des venues de l'ordre de dix barils par minute. Retiens bien ce chiffre. »
- **t1** : « Plus tôt, dix-neuf heures cinquante-cinq. Pour mettre le puits en veille, on remplace sa boue lourde par de l'eau de mer. Avant, un test : deux cadrans qui doivent dire pareil. » (texte affiché : `Pour mettre le puits en veille`)
- **t2** : « Vingt et une heures huit. Sans sa boue lourde, le puits coule déjà : environ neuf barils par minute entrent par le fond. Personne ne réagit. »
- **t3** : « Vingt et une heures trente et une. Pression anormale : on coupe les pompes. En bas, ça entre à environ vingt-deux barils par minute. Souviens-toi : d'habitude, de l'ordre de dix. »
- **t6** : « Vingt et une heures quarante-sept. Une mâchoire se ferme sur le tube. Cette fois, ça tient. Sauf que le gaz est déjà au-dessus… et il monte vers toi. »
- **t9** : « Reste un dernier recours : un système qui agit seul quand le BOP perd la surface. Avant vingt et une heures cinquante-huit, il ferme probablement les lames. »
- **defaut** : « Et le puits coule toujours. Tu sais pourquoi ? Le tube s'était plié, tordu en partie par la pression dedans, comme un tuyau d'arrosage. Hors du centre, les lames l'ont percé… sans le couper net. »
- **pire** : « Et le pire ? Ce dernier recours n'a probablement marché que par hasard. Dans un boîtier, la batterie était vide. Dans l'autre, une vanne mal câblée… qui ne marchait que grâce à une pile à plat. »
- **issue** : « Onze morts. La plateforme coule deux jours plus tard. Et le puits fuit pendant près de trois mois : environ quatre virgule neuf millions de barils. »
- **depuis** : « Depuis deux mille seize, aux États-Unis, un BOP sous-marin doit avoir deux jeux de lames, un moyen de centrer le tube, et un cisaillement vérifié par un expert indépendant. »
- **comment** : « Pourquoi les lames n'ont pas scellé le puits ? Un tube plié, hors de leur portée. Mais tout avait commencé par deux cadrans. Toi, en commentaire : mille quatre cents d'un côté, zéro de l'autre… tu valides, ou tu arrêtes tout ? » (la direction `[short pause]` avant « Toi » reste dans `vo`)

## Reste ouvert

- « Dix barils par minute » : avis de l'auteur du CSB, non publié. Si Merwan veut un chiffre solide, le Chief Counsel's Report ou la Commission nationale (non lus, PDF trop lourds) peuvent le confirmer.
- Règle de 2016 : dates de conformité échelonnées (2 jeux de lames : 2019 ; centrage : 2023) et révision de 2019 non lue en entier ; le texte final de 30 CFR 250.734 n'a pas été ouvert. « Depuis 2016 » tient comme année de la règle, pas comme date d'application.
- Heures : simulation ES (BP/Transocean ± 1 min). À noter dans `sources` : « l'image reconstitue ».
- 21 h 08 / 9 b/min : l'ES place 9 b/min « vers 21 h 10 » dans le résumé et à « ce moment-là » après l'arrêt de 21 h 08 ; écart d'une minute sans conséquence.
- Un spectateur peut entendre 9 b/min (t2) comme « sous la normale de dix » : tenir la voix sur « personne ne réagit » et l'image sur le niveau de bac qui monte.

# CR03 Concorde : contre-vérification du script

Faite le 13/11/2026. **Le rapport final du BEA (f-sc000725a) a pu être lu en entier** (PDF de 16,7 Mio, adresse `bea.aero/fileadmin/documents/docspa/2000/f-sc000725a/pdf/f-sc000725a.pdf`, téléchargé avec curl et converti en texte : l'outil de lecture web échoue, pas le fichier). Lus aussi : annexe 2 (CVR, UTC), annexe 8 (note EADS), synthèse BEA `Histoire-Concorde-VF.pdf`, rapport intermédiaire 2001. Le dossier de faits disait « non lu » : c'est maintenant fait, et ça change deux phrases. Requêtes : 3 lectures web + 2 téléchargements.

## Verdict

**9 beats à corriger sur 19** (reservoir, t1, t4, t5, t8, defaut, preuve, depuis, comment), dont 2 importants : `defaut` et `comment`. Les heures t1 à t8, les « 78 secondes » et les « 120 secondes » tiennent toutes. Rien n'est faux au point de refaire un beat : ce sont des phrases à resserrer sur ce que le BEA dit vraiment.

Les deux qui comptent :
- **`defaut`** : « le choc le traverse » décrit une onde de choc hydrodynamique. Le **rapport final** (§ 3.1 et 3.2) dit l'inverse pour le panneau montré dans `preuve` : une surpression hydrodynamique *aurait pu* naître, mais « ne pouvait pas avoir causé l'arrachement » du morceau retrouvé sur la piste ; la cause retenue est une « transmission d'énergie » qui associe la **déformation de la peau du réservoir et le déplacement du carburant**, avec « peut-être » une onde de choc en plus. Seule la synthèse BEA (publication ultérieure, grand public) parle d'« onde de choc hydrodynamique ». La phrase doit suivre le rapport final.
- **`comment`** : la citation vient de la **synthèse** BEA, pas du rapport final, et elle commence par « Dès cet instant » (= une fois l'avion touché) ; sans cela, on lit « l'équipage n'a rien pu faire du tout », ce que le BEA ne dit pas (il étudie la rotation précoce à 183 kt).

## Points demandés

**1. Heures (annexe 2 + rapport final) : tout tient.** Local = UTC + 2.
- t1 « top » 14:42:31 → 16:42:31 ✓. V1 (copilote) 14:43:03,7 → 16:43:03 ✓. Bruit à 14:43:10,1 → pneu 16:43:10 ✓ (rapport final : « dans la seconde qui suit V1 »).
- t4 16:43:13 : c'est l'arrondi du BEA (synthèse : « 14 h 43 min 13 »). Dans l'annexe 2, le contrôleur commence à parler à 14:43:13,8 et le mot « flames » tombe vers 14:43:16. L'heure affichée est celle du BEA : on la garde.
- t5 alarme feu 14:43:22,8 → 16:43:22 ✓ (« 11 s après le début du feu externe », rapport final § 1.16.9). t6 « The gear isn't retracting » 14:43:56,7 ✓ (confirmé dans le texte brut et au rapport final § 1.16.10). t7 « Le Bourget » 14:44:00,6 ✓. t8 chute de poussée 14:44:29,5 ✓. Fin 14:44:31 ✓ (BEA : impact « 14 h 44 min 31 »).
- **« 78 secondes »** : 16:43:13 → 16:44:31 = 78 s avec les heures du BEA (77,8 s avec 13,8 → 31,6). Tient. Mais « il te reste » compte depuis l'appel du contrôleur, pas depuis le mot « flammes » (≈ 75 s) : on garde 78, c'est le chiffre du BEA.
- « Deux minutes pile après le top » : 14:42:31 → 14:44:31 ✓.
- **Piège** : « onze secondes après les flammes » (t5) est faux tel qu'affiché : t4 16:43:13, t5 16:43:22 = 9 s. Les 11 s du BEA partent du *début du feu* (≈ 14:43:11,8), avant l'appel. À corriger.

**2. Six perforations et 4 kg/s : à nuancer.** Le BEA dit : « six événements avaient conduit à des perforations des réservoirs » (synthèse), dont 4 au décollage (éclatement causé par un objet ou un dégonflement dans 2 cas, cause indéterminée dans 2), 1 à l'atterrissage (freins bloqués), 1 au roulage. **À Washington en 1979, sur trois perforations une seule venait de morceaux de pneu** ; les autres, de débris de jante et de l'avion (rapport final § 1.16.4.2.1). « Un pneu éclaté a percé ces réservoirs six fois » dit trop. Washington est bien « celui qui a causé le plus de dégâts » : « la pire fuite » devient « le pire cas ». 4 kg/s est l'**estimation** pour les trois perforations réunies. **« Quinze fois plus » n'est pas dans le rapport final** : il dit « plusieurs dizaines de kg/s, soit environ dix fois plus » ; les 60 kg/s sont une estimation (trois méthodes, de 20 à 130 kg/s pour l'une d'elles). La synthèse donne « environ 60 » : 60/4 = 15 est un calcul d'ici, trop précis. On dit « environ soixante » et « au moins dix fois plus ».

**3. Mécanisme.** Voir verdict. Détails :
- Synthèse BEA : le débris déforme la paroi, « onde de choc hydrodynamique à l'intérieur du réservoir plein », qui fait céder la structure de l'intérieur. **Rapport final** : « transmission d'énergie » (déformation de la peau + mouvement du carburant) à un autre point du réservoir, « avec peut-être » une onde de choc ; et l'onde seule n'explique pas l'arrachement du panneau. EADS (annexe 8) : « déplacement d'un fluide incompressible » qui amplifie la déformation vers l'extérieur. Donc « un liquide ça ne se comprime pas » est juste **à condition que la phrase parle de carburant poussé, pas d'onde qui traverse**.
- **Panneau** : rapport final § 1.16.7.1.1 : « 32 x 32 cm », « aucune trace d'impact après la rupture » (un bord abîmé par la chute au sol), déformé de l'intérieur vers l'extérieur. « Trente centimètres, bombé vers l'extérieur, sans trace d'impact » tient. « La preuve » est trop fort : le rapport parle de « causes probables » et d'un scénario que l'enquête n'a pas pu fermer (la représentante britannique n'était pas d'accord sur le poids des mécanismes).
- **« Le titane n'a jamais touché le réservoir »** : tient, et solidement. La lamelle (435 mm) est restée sur la piste ; seul un morceau de pneu de 4,5 kg a frappé l'aile (rapport final § 3.1).

**4. V1 et citation.** V1 = 150 kt ✓ (briefing, annexe 2 : « V1 one hundred fifty », et synthèse). Règle du commandant, briefing : « après V1 on continue » ✓. « Quoi qu'il arrive » est la formule des professionnels ; le rapport final (§ 1.16.13.4) la confirme ici : un arrêt décollage aurait fini en sortie de piste à 74 kt (arrêt à 183 kt) ou 115 kt (196 kt), « probablement catastrophique ». **La citation exacte** est dans la synthèse, pas dans le rapport final : « Le Concorde, ainsi endommagé, était en phase de décollage à une vitesse trop élevée pour s'arrêter, mais sans assez de puissance pour continuer à voler. **Dès cet instant, aucune manoeuvre de l'équipage n'aurait pu empêcher l'accident.** » Le rapport final dit en plus : « même avec les moteurs en fonctionnement normal, les dommages auraient conduit à la perte de l'avion ».

**5. « Depuis » et CR04.**
- Kevlar : synthèse « début 2001, des couches de Kevlar sont introduites dans les réservoirs » ✓ ; le rapport final précise : « garnitures souples dans les réservoirs 1, 4, 5, 6, 7 et 8 » = **six réservoirs**, pas tous. Pneus : « nouveaux pneus radiaux » (synthèse), Michelin NZG (rapport final) ✓.
- Inspections de piste (rapport intermédiaire § 18.3.2.1, confirmé dans le dossier de faits) : « le règlement interne prévoit trois inspections quotidiennes ; avant l'accident la moyenne réelle était de deux par jour, depuis elle est passée à trois ». **Source de 2001, ADP seulement** : « la piste s'inspecte trois fois par jour » au présent, comme un fait de 2026, n'est pas vérifié. « Comme prévu » est juste mais flou.
- CR04 : 23:58:42 → 00:58:21 = 59 min 39 s (dossier CR04, boîte noire) ; « cinquante-neuf minutes après l'arrêt de sa locomotive, un train garé démarre tout seul » ✓ (on arrondit sous l'heure pleine, ce qui est honnête). À reprendre dans la contre-vérification CR04, pas ici.

## Phrase par phrase

| Beat | Verdict |
| --- | --- |
| accroche | **Tient.** « Décolle en feu » à 16:43 : le feu est signalé pendant la rotation (183 kt), l'avion décolle ensuite. « Trop tard pour freiner » : rapport final § 1.16.13.4. |
| promesse | **Tient.** 78 s ✓. « Sous ton aile, le réservoir s'est ouvert… de l'intérieur » : réservoir 5, voir plus bas. |
| principe | **Tient.** V1 150 kt ✓. « Quoi qu'il arrive » : formule de métier, confirmée par la simulation du rapport final. |
| reservoir | **À corriger** : « un pneu éclaté a percé » (voir 2), « la pire fuite » (le pire cas). « Dans les ailes, tout près des roues » ✓ (réservoir 5 au-dessus du train principal gauche). |
| t1 | **À corriger (léger)** : « tu lances tes quatre moteurs » : ils tournent déjà ; « top » = mise de poussée pour le roulement, postcombustion quatre fois ensuite (« we have four reheats », 14:42:43). Les pilotes de ton public le verront. 109 à bord ✓, cinq minutes ✓, 43 cm (435 mm) ✓, titane ✓. |
| t2 | **Tient.** |
| t3 | **Tient.** Pneu n° 2 = pneu avant droit du train gauche ✓ ; « plus de quatre kilos » ✓ (4,5 kg retrouvés). |
| t4 | **À corriger** : « soixante » est une estimation (« environ »), « quinze fois plus » faux de précision (le rapport final : « environ dix fois »). Contrôleur 16:43:13 ✓ (BEA). |
| t5 | **À corriger** : « onze secondes après les flammes » ≠ 9 s affichées. Moteur 2 : pompage (gaz chauds), coupé sur procédure ✓ ; moteur 1 : pompage « quelques secondes plus tard » ✓. |
| t6 | **Tient.** Train demandé 14:43:30, constat 14:43:56,7 ✓ ; 200 ft (≈ 60 m) pendant ≈ une minute ✓ (synopsis du rapport final). « Ne monte plus » ✓ (« ni monter ni accélérer »). |
| t7 | **Tient.** Alarmes GPWS 14:43:59 à 14:44:03 ✓ ; « Le Bourget » répété ✓ (copilote). |
| t8 | **À corriger (léger)** : « commandes détruites : ton Concorde penche à gauche » fait de la destruction la cause unique ; le BEA : inclinaison « en partie liée » aux commandes détruites, et à la poussée dissymétrique. Les deux phrases séparées règlent le problème. Poussée de 3 et 4 à 14:44:29,5 ✓ (le rapport final : ralenti commandé **et** pompage). |
| issue | **Tient.** Hôtel ✓, 113 morts (109 + 4) ✓, deux minutes ✓. |
| defaut | **À corriger (important)** : voir verdict. |
| preuve | **À corriger** : « La preuve » → « L'indice » ; le reste tient (32 cm, sans trace d'impact, bombé de l'intérieur vers l'extérieur ; titane jamais au contact). « Personne ne l'avait prévu » : synthèse BEA (« jamais anticipé ») ✓, à garder avec la phrase de remplacement du `defaut` qui parle de la même chose. |
| depuis | **À corriger** : six réservoirs, pas tous ; inspection au présent non vérifiée. |
| comment | **À corriger (important)** : « L'enquête est claire » + citation tronquée. |
| abo | **Tient** (voir 5). |
| boucle | **Tient.** « Tout est vrai, à la seconde, / Ton Concorde décolle en feu » se lit. Voir « reste ouvert ». |

## Phrases de remplacement

(texte à afficher ; les `vo` suivent les mêmes mots)

- **reservoir** : « Et ton kérosène ? Dans les ailes, tout près des roues. Six fois déjà, un pneu éclaté a abouti à un réservoir percé. Le pire cas : quatre kilos par seconde. Retiens bien ce chiffre. »
- **t1** : « 16:42:31 Top : tu mets les gaz, cent neuf personnes à bord. Sur la piste, un avion parti cinq minutes plus tôt a perdu une lamelle de titane. Quarante-trois centimètres. » (la voix dit « Seize heures quarante-deux. Top : tu mets les gaz, cent neuf personnes à bord. »)
- **t4** : « Treize secondes. Le contrôleur te prévient : des flammes derrière toi. Ton réservoir fuit à environ soixante kilos par seconde. Souviens-toi : le pire cas, c'était quatre. Là, c'est au moins dix fois plus. »
- **t5** : « Vingt-deux secondes. L'alarme feu sonne, neuf secondes après l'appel du contrôleur. Ton moteur deux avale des gaz brûlants : on le coupe. Le un, juste à côté, va s'étouffer à son tour. »
- **t8** : « Vingt-neuf secondes. La poussée s'effondre. Une partie des commandes est détruite. Ton Concorde penche à gauche… et tombe. »
- **defaut** : « Alors, ce réservoir ? Le morceau de pneu frappe le dessous de l'aile. Derrière la paroi, le réservoir est plein de kérosène. Et un liquide, ça ne se comprime presque pas : la paroi s'enfonce, le kérosène est repoussé… et la paroi cède ailleurs, de l'intérieur. » (+ 4 mots ; si la durée gêne, couper « Derrière la paroi, »)
- **preuve** : « L'indice : sur la piste, un panneau de l'aile de trente centimètres, bombé vers l'extérieur, sans trace d'impact. Le titane n'a jamais touché le réservoir. Et ça, personne ne l'avait prévu. »
- **depuis** : « En deux mille un, six de ses réservoirs sont doublés de Kevlar, ses pneus changent. Et à Roissy, les inspections de piste passent à trois par jour. Avant l'accident ? Deux, en moyenne. » (les « trois par jour » étaient déjà la règle écrite ; le film dit ce qui a changé dans les faits)
- **comment** : « Pour le BEA, dès l'avion touché, aucune manœuvre de l'équipage n'aurait pu empêcher l'accident. [short pause] Toi, en commentaire : du feu sous l'aile, après vé un... tu décolles, ou tu freines ? » (+ 3 mots)

À mettre à jour dans `sources` : la ligne « Un liquide ne se comprime pas » (désormais : rapport final § 3.2, « transmission d'énergie… déformation de la peau et mouvement du carburant » ; la synthèse parle d'onde de choc) ; la ligne « Fuite ≈ 60 kg/s » (« environ », rapport final § 1.16.8.2 : « plusieurs dizaines de kg/s, environ dix fois Washington ») ; la ligne « Six perforations » (rapport final § 1.16.4.2.1 : à Washington, un seul des trois trous venait du pneu) ; la ligne Kevlar (six réservoirs : 1, 4, 5, 6, 7, 8) ; la ligne inspections (« ADP, rapport intermédiaire 2001, § 18.3.2.1 : trois par jour au règlement, deux en pratique avant l'accident, trois depuis »).

## Reste ouvert

1. **Le comment répond à moitié à la question.** Après « aucune manœuvre… n'aurait pu l'empêcher », demander « tu décolles, ou tu freines ? » donne la réponse (le rapport final simule l'arrêt : sortie de piste, 74 à 115 kt, « probablement catastrophique »). La règle du compte : le film ne répond pas à la place du spectateur. Option plus propre, à trancher par toi : garder la citation et poser « Après vé un, on décolle quoi qu'il arrive : la bonne règle… ou un piège ? ». Je n'ai pas réécrit la question : elle est dans `post`, l'épinglé et les légendes.
2. **« Avant l'accident ? Deux, en moyenne. »** laisse entendre qu'avec trois inspections la lamelle aurait été vue. Elle est tombée cinq minutes avant le Concorde : rien ne le dit. Le film ne l'affirme pas ; si Merwan veut zéro ambiguïté, couper cette ligne. Le chiffre est de l'exploitant (ADP, rapport intermédiaire), jamais recoupé ailleurs.
3. **« Tout est vrai, à la seconde »** (boucle, légende Instagram) : l'image reconstitue le feu, la trajectoire du débris et le mouvement du carburant ; 60 kg/s et 75 L/s sont des estimations. Le contrat du format tient ; garder « reconstitué » dans la description.
4. **« Quoi qu'il arrive »** après V1 : formule de métier, confirmée ici par la simulation. Un pilote peut dire qu'on peut encore rejeter après V1 en cas de perte de contrôle ; le film ne le contredit pas.
5. **Éclatement du pneu à 16:43:10** : le bruit est à 14:43:10,1 ; le BEA ne donne pas une heure exacte d'éclatement. Ordre de grandeur sûr, pas à la décimale.
6. **L'avis britannique** sur le poids des mécanismes (rapport final, avis de l'AAIB) n'est pas relu ligne à ligne ; sans effet sur les phrases corrigées.

Fichiers : `C:\Users\merwa.ORDI-MERWAN\Documents\systems-decoded\docs\faits\CR03-contre-verification.md`

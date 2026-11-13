# 049 — Le GPS : contre-vérification

## Verdict

**1 phrase à corriger (beat `promesse`, 1re phrase)**, 13 beats qui tiennent, quelques précisions pour l'image. Rien de faux sur les chiffres (300 m, 38 µs, 11 km, 4 satellites, offset avant lancement). 2 requêtes web (gps.gov / courseware PSU sur les 4 satellites ; Ashby / GPS World / Navipedia sur l'offset d'usine), le reste est du calcul ou le dossier de faits [P].

## Points demandés

1. **« Un millionième de seconde » → point de ≈ 300 m, et trois sphères puis quatre : tient, avec une limite d'image.**
   - 1 µs × c = 299,8 m : c'est l'erreur sur **chaque distance** [P, calcul]. L'erreur sur la **position** vaut ce même ordre de grandeur, souvent un peu plus, et sa direction dépend de la disposition des satellites (avec des satellites bien répartis, un biais d'horloge commun pousse surtout le point en hauteur, pas de côté). Le script ne chiffre pas le saut en mètres : « dans le champ » reste vrai comme ordre de grandeur (≥ ≈ 300 m). **Ne pas afficher « 300 m » comme mesure exacte du saut du point bleu**, seulement 1 µs = 300 m de lumière.
   - Retard de l'horloge → temps de trajet mesuré trop court → les trois sphères sont **toutes** trop petites **du même rayon**. L'image doit les rétrécir ensemble, pas une seule.
   - Quatre sphères : tant que l'heure n'est pas corrigée, elles ne passent pas par un point commun ; le quatrième signal permet de résoudre l'heure (4 inconnues : x, y, z, décalage) [P Ashby, GPS World]. « Les quatre se resserrent » est donc juste, à condition que l'image montre le resserrement **pendant** la correction de l'heure, pas quatre sphères déjà concourantes.
   - Nuance honnête (reste ouvert) : un vrai téléphone ne se sert jamais de 3 signaux avec son horloge de quartz crue : il résout toujours l'heure. La scène est un « et si », la chute le dit (« corrige sa propre heure »). L'accroche « ton point bleu saute » est donc une démonstration, pas un incident réel : la légende / description le disent déjà (scénario reconstitué).
2. **« Là-haut, le temps passe plus vite : sans réglage, 38 millionièmes d'avance par jour » et « onze kilomètres de lumière » : tiennent.** Gravité plus faible : +45 µs/jour ; vitesse : −7 ; net ≈ +38 µs/jour (+38,6 d'après −4,4647 × 10⁻¹⁰ × 86 400 s) [P Ashby, S GPS World/Physics Today]. « Le temps passe plus vite » est vrai **en net** (la vitesse l'inverse en partie) ; la phrase est une simplification acceptable. 38 µs × 299 792 km/s = 11,4 km : « onze kilomètres de lumière » est exact et **ne dit pas** « ton GPS serait faux de 11 km » (contesté, cf. « À ne pas dire » du dossier). L'image ne doit pas non plus afficher un point bleu à 11 km de la route.
3. **« On les règle trop lentes, exprès » : tient.** Avant le lancement, on règle l'horloge à 10,22999999543 MHz au lieu de 10,23 MHz (−4,5674 mHz), ce qui la fait paraître à 10,23 MHz vue du sol une fois en orbite [P Ashby § 5, GPS World ; recoupé par Navipedia / résultats de recherche]. « Trop lentes » est vu du sol, « exprès » est exact. Précision : le réglage est une fréquence d'usine, pas un recalage permanent (la station de contrôle ajuste ensuite d'autres paramètres) : la voix ne dit rien de contraire.
4. **« Ton téléphone n'envoie rien » : à corriger.** Vrai pour le **signal GPS** (récepteur passif, comme une radio de voiture) [S Penn State], mais pris seul, « n'envoie rien » est faux pour un téléphone, qui envoie des données par Internet (carte, positionnement assisté, localisation). Le complément manque pile là. Voir remplacement.
5. **« Presque toujours quatre satellites ou plus au-dessus de toi » : tient.** La constellation est conçue pour offrir au moins quatre satellites en vue de presque partout, à toute heure (gps.gov, courseware PSU) ; avec ≈ 31 satellites, un ciel dégagé en voit en général 8 à 12 [S]. « Presque toujours » est prudent. Limite : bâtiments, tunnels, relief réduisent ce qui est reçu : la phrase dit « au-dessus de toi », pas « reçus », donc exacte. Pas de correction.

## Phrase par phrase

| Beat | Phrase | Verdict |
| --- | --- | --- |
| accroche | Ton point bleu saute dans un champ. | tient (illustration ; cf. point 1) |
| accroche | Il a suffi d'un millionième de seconde. | tient (ordre de grandeur ≥ 300 m ; « suffi » vrai si l'heure n'est pas corrigée) |
| promesse | Ton téléphone n'envoie rien : il écoute des horloges, là-haut. | **à corriger** (point 4) ; « écoute des horloges » = image, il écoute des signaux qui portent l'heure d'horloges atomiques |
| promesse | Et on les règle trop lentes… exprès. | tient (point 3) |
| scene | De nuit, route inconnue. Un carrefour, dans cinq secondes. Ton point bleu est dans le champ. À gauche… ou à droite ? Tout se joue dans ton téléphone. | tient (scénario, pas un fait ; en pratique un appli de navigation recale souvent le point sur la route, ne pas le dire) |
| ouvre | Alors… on l'ouvre. | tient |
| eclate | Dans ton téléphone, une puce et son antenne. | tient |
| eclate | Elle écoute à vingt mille kilomètres : un satellite. | tient (20 200 km [P gps.gov]) ; l'image ne doit pas montrer l'antenne émettre vers le haut |
| eclate | Son oscillateur… et au cœur, une horloge atomique. | tient (horloge au césium / rubidium + synthétiseur) [S] |
| principe | Pourquoi ça marche ? Chaque satellite dit l'heure. | tient (message de navigation : heure d'émission + position) |
| principe | Son signal file à la vitesse de la lumière : trois cents mètres par millionième de seconde. | tient (299,79 m) |
| principe | Le temps du trajet… donne la distance. | tient |
| repos | Au-dessus de toi, presque toujours quatre satellites, ou plus. | tient (point 5) |
| repos | Chaque distance trace une sphère. | tient |
| repos | Mais ton téléphone n'a qu'une horloge à quartz… et elle est fausse. | tient (quartz, pas atomique ; « fausse » = décalée, d'où « pseudo-distance ») |
| zero | Le carrefour. Trois signaux. Trois sphères. Ton téléphone retarde d'un millionième. Elles se croisent… dans le champ. | tient (point 1) ; trois sphères rétrécies du même rayon |
| reponse | Un quatrième signal. Une quatrième sphère. Ton téléphone corrige sa propre heure. Les quatre se resserrent. Ton point bleu revient sur la route. | tient (point 1) |
| chute | Voilà son secret : ton point bleu ne vient pas d'une carte. Il vient d'une horloge. Où tu es… c'est une question d'heure. | tient (position calculée par chronométrage ; en intérieur / en ville, Wi-Fi et antennes-relais y participent : simplification assumée) |
| comment | Et ces horloges trop lentes ? Einstein. | tient |
| comment | Là-haut, le temps passe plus vite : sans réglage, trente-huit millionièmes d'avance par jour. | tient (net, point 2) |
| comment | Onze kilomètres de lumière. | tient (11,4 km) |
| comment | En commentaire : toi… le point bleu, ou les panneaux ? | tient (question fermée, deux camps, ne répond pas à la place du spectateur) |
| like | Like : pour celui qui croit que son téléphone parle aux satellites. | tient (cohérent avec la correction du point 4 : il ne leur parle pas) |
| abo | Abonne-toi : prochain dossier, la plaque à induction. | tient |
| abo | Elle ne chauffe pas : elle fait chauffer la casserole. | tient comme simplification (le récepteur chauffe seulement par contact avec la casserole ; la vitre tiédit). À reprendre dans le dossier 050 si la vérif y précise. |
| boucle | Et pendant qu'elle chauffe… | tient (boucle sur l'annonce, aucun fait nouveau) |

## Remplacement

- **promesse** : « Ton téléphone n'envoie rien : il écoute des horloges, là-haut. » → **« Ton téléphone n'envoie rien aux satellites : il écoute des horloges, là-haut. »** (+2 mots, ≈ 0,3 s ; même rôle de promesse, même ton). Dans `vo` : `[firm, matter-of-fact] Ton téléphone n'envoie rien aux satellites : il écoute des horloges, là-haut. [short pause] Et on les règle trop lentes... exprès.` Le cache `text` reçoit la même phrase (le « *aux satellites* » n'a pas besoin d'accent).
  - Si la durée de l'accroche + promesse est tendue (accroche ABC avant 10 s), version à longueur égale : « Aux satellites, ton téléphone n'envoie rien : il écoute, là-haut. » (11 mots, perd « horloges », que la phrase suivante reprend avec « on les règle »). À préférer seulement si le minutage coince.
  - Le pinned, la légende et la description disent déjà « n'envoie rien aux satellites » : rien à changer.

## Pour l'image (court)

- La phrase la plus difficile : `zero` → `reponse`. Trois sphères **toutes rétrécies du même rayon** (retard d'horloge), qui se croisent hors route ; puis une quatrième sphère, et les quatre se resserrent **en même temps que l'horloge est corrigée**. Ne pas montrer quatre sphères déjà concourantes avant la correction. Ne pas coter le saut « 300 m » ; coter « 1 µs = 300 m de lumière ». Ne pas montrer 11 km d'écart de position sur `comment`, seulement une règle de lumière de 11 km.

## Reste ouvert

- « Il a suffi d'un millionième » est une démonstration : un téléphone réel résout l'heure à chaque calcul. Le film le dit à `reponse`. Assumé.
- « Ton point bleu ne vient pas d'une carte » ignore le recalage sur la route (map matching) et le positionnement Wi-Fi / antennes. Simplification de fond, pas une erreur ; l'image ne doit pas insister (« jamais de carte »).
- 1 µs → ≥ 300 m de position : la direction exacte dépend de la géométrie (non chiffré par le script, non vérifié satellite par satellite).
- Le « 10 km/jour de dérive de position » reste contesté : le script ne le dit pas, ne pas l'ajouter dans la légende.
- Requêtes utilisées : 2 sur 12.

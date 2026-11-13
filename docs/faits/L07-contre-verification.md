# L07 — Contre-vérification du script

Requêtes web utilisées : 5 sur 20. Le reste est vérifié par calcul (dB, N) ou par le dossier de faits.

## Verdict

**11 phrases à corriger, 4 à nuancer, le reste tient.** Rien de faux sur les chiffres principaux : 1 000 dB/km = moitié tous les 3 m, 20 m = 1 %, 17 dB/km = 2 % (10^-1,7 = 1,99 %), 0,2 dB/km = 95,5 % à 1 km et 1 % à 100 km, 0,7 GPa sur 125 µm = 8,6 N (0,88 kg), 125 µm / 9 µm / 750 mesures / 10-20 m/s : tous tiennent. Les défauts sont dans les raccourcis de chimie, de physique du pli et d'ingénierie (ce que le film laisse entendre).

## Points demandés

1. **eclairs** : tient. Des milliards d'impulsions par seconde (GPON 2,5 Gbit/s, liaisons longues 10 à 100 Gbaud), 1 310 / 1 490 / 1 550 nm infrarouge.
2. **ricochet / miroir / du2** : l'image du ricochet est juste (la réflexion totale a lieu pour un angle rasant à la paroi) mais l'angle utile est minuscule (écart d'indice ≈ 0,3 % : seuls les rayons à moins de ≈ 4 à 5° de l'axe sont guidés). Donc dans un pli, la lumière n'arrive pas « presque de face » : elle arrive **un peu moins à plat** qu'avant, ce qui suffit. « Presque de face » est trompeur, à corriger (`du2`).
3. **histoire** : juste (guider la lumière dans le verre est connu depuis les faisceaux de fibres des années 1950). 1 000 dB/km = moitié tous les 3 m, 1 % à 20 m : exact. Le seul souci est `nuit` : 1 % de lumière derrière une vitre, ce n'est pas « presque la nuit » (1 % du soleil, c'est encore très lumineux). Corrigé.
4. **kao2** : tient. Nobel 2009 « pour des avancées majeures sur la transmission de la lumière dans les fibres pour la communication optique » ; Kao et Hockham fixent 20 dB/km. À nuancer : la publication de 1966 est cosignée Hockham (voir « reste ouvert »).
5. **corning2** : tient (17 dB/km = 2 %, cible 20 dB/km).
6. **aujourdhui / promesse / repeteur** : tient. 0,2 dB/km → 95,5 % à 1 km, 1 % à 100 km. Mais la fiche G.652.D plafonne à 0,22 dB/km à 1 550 nm (95,1 %) et à ≈ 0,34-0,4 à 1 310 nm (≈ 91 %) : « plus de 95 % » est vrai à 1 550 nm seulement, et pile à la limite. Voir nuance.
7. **relance1 / etape1 / distille / vapeur** : SiCl4 liquide incolore (ébullition ≈ 58 °C), distillation qui laisse les chlorures de métaux (FeCl3 etc., très peu volatils) au fond : tient. **`vapeur` à corriger** : dans le dépôt extérieur (celui que le film montre), la flamme est un chalumeau à hydrogène ou méthane ; le SiCl4 y réagit avec l'eau que la flamme produit (hydrolyse), pas avec « l'oxygène » seul. C'est d'ailleurs ce qui laisse de l'eau (OH) dans les pores, et le film le dit ensuite (`craie`). « Réagit avec l'oxygène » décrit le MCVD (dépôt dans un tube), pas la scène montrée.
8. **menace1** : tient. Un brevet relevé donne « moins de 1 ppb de métaux de transition pour 1 dB/km à 1,3 µm » : « quelques atomes sur un milliard » est le bon ordre de grandeur. [S, brevet non ouvert en entier.]
9. **preforme / recette** : tient pour le dépôt extérieur (tige tournante, chalumeau qui va et vient, cœur dopé GeO2 déposé d'abord, gaine en silice pure ensuite, germanium qui augmente l'indice donc ralentit la lumière). « Une pincée » : quelques pour cent de GeO2, acceptable.
10. **craie / frittage / frittage2 / menace3** : tient (séchage au chlore, consolidation vers 1 400-1 500 °C, retrait, suie → verre transparent ; eau absorbe, bulle diffuse).
11. **paradoxe / proportions** : tient. À nuancer : « rien ne se mélange » (à 2 000 °C le germanium diffuse un peu ; sans effet sur le propos).
12. **tour / goutte / vitesse / laser** : tient (goutte qui tombe et amorce le fil, préforme qui descend lentement dans le four par conservation du volume, « plus épais → tirer plus vite » est dans foa.org).
13. **menace4** : la raison est vraie (le diamètre de gaine sert à aligner les cœurs dans une fibre soudée ou connectée ; une dispersion de diamètre décale les cœurs de 9 µm ; ≈ 1,4 µm de décalage = ≈ 0,3 dB en moyenne d'après OFS). Mais « ne s'alignent plus » fait croire à un précipice : la perte monte progressivement. À corriger. Précision : la norme moderne G.652.D est ±0,7 µm, ±1 µm figure dans d'autres fiches ; « un micron » reste un ordre de grandeur correct.
14. **armure / armure2 / uv** : tient (verre neuf plusieurs GPa, microfissure par contact, revêtement mou puis dur posé en ligne avant tout contact, durci aux UV). `rappel2` : l'acrylate ralentit l'humidité mais ne la bloque pas (seuls les revêtements carbone sont étanches) : à nuancer.
15. **test / test2 / test3 / reponse** : tient sauf `reponse`. 0,7 GPa sur 125 µm = 8,6 N = 0,88 kg : « près d'un kilo » exact. « Ne cassera jamais chez toi » : faux, le test fixe une résistance minimale, mais une fibre peut encore casser (fatigue statique, humidité, courbure, arrachement). À corriger.
16. **mesure** : OTDR correct (impulsion, rétrodiffusion, position par le temps de retour). « Le moindre défaut en renvoie un » : sur-affirmé (un petit défaut non réfléchissant ne se voit que comme une petite marche, et il y a des zones mortes). À corriger.
17. **cable / mer / repeteur2 / million / ancres / chute** : câble de branchement : couleurs, tubes, renforts, gaine : tient. Structure sous-marine (tube d'acier, fils d'acier, cuivre, polyéthylène) : tient. « Tuyau d'arrosage » : ≈ 25 mm en grands fonds, tient (les câbles côtiers armurés sont plus gros, le film dit « pour traverser un océan »). Amplificateurs alimentés par le cuivre : tient. Espacement : les sources donnent 50 à 100 km (≈ 50 km chez les articles de recherche) ; « à peu près à cette distance » est acceptable, à nuancer. « Plus d'un million de km » : tient. `ancres` : **à corriger** : le chiffre de 150 à 200 par an (ICPC, ITU « plus de 200 ») compte des **pannes** et non des câbles sectionnés ; 70 à 80 % viennent d'activités humaines, surtout pêche et ancres. `chute` : 99 % concerne le **trafic de données**, pas « les échanges » (qu'on entend commerce). À corriger.
18. **du3 / comment / like** : « commence à fuir dès qu'on la courbe sur quelques centimètres » est ambigu et exagéré : la fibre standard est spécifiée sans perte notable jusqu'à un rayon de 30 mm, les pertes montent nettement en dessous de 15-20 mm de rayon. G.657 : tolère 7,5 mm (A2) à 5 mm (B3), tient. « Un pli, un pied de meuble » : je n'ai pas trouvé de consigne publique d'opérateur (Orange, SFR…), seulement des fiches de fabricants qui donnent un rayon minimal (ex. Corning : 15 mm en service) et la logique d'écrasement. Le conseil est physiquement vrai, pas sourcé « opérateur ». Ne pas écrire « les opérateurs recommandent ».
19. **accroche / test2** : 125 µm vs cheveu (≈ 50 à 100 µm, jusqu'à 180) : « à peine plus épais » est défendable en moyenne mais faux pour un cheveu épais ; le dossier dit « de la taille d'un cheveu ». À nuancer (voir plus bas).

## Phrase par phrase (seules les phrases à corriger ou à nuancer ; toutes les autres tiennent)

| Beat | Verdict |
|---|---|
| accroche, test2 | nuance : « à peine plus épais » ; voir plus bas |
| curiosite | nuance : « un seul geste suffit à l'éteindre » est vrai pour un pli serré (perte de dizaines de dB), pas pour tout pli ; la chute du film dit bien « trop serré » |
| eclate | à corriger : « fibres de renfort » s'entend « fibres optiques de renfort » |
| nuit | à corriger : 1 % de lumière ≠ « presque nuit » |
| kao | nuance : article cosigné Hockham ; l'eau (OH) comme coupable vient surtout des années 1970, Kao/Hockham citent les ions métalliques |
| aujourdhui | nuance : vrai à 1 550 nm, à la limite de la fiche |
| vapeur | à corriger : hydrolyse dans la flamme, pas oxygène seul |
| menace4 | à corriger : « ne s'alignent plus » |
| rappel2 | nuance : humidité seulement en partie |
| reponse | à corriger : « ne cassera jamais chez toi » |
| mesure | à corriger : « le moindre défaut » |
| ancres | à corriger : pannes, pas câbles sectionnés |
| chute | à corriger : données, pas « échanges » |
| du2 | à corriger : « presque de face » |
| du3 | à corriger : « quelques centimètres » |
| repeteur2 | nuance : 50 à 100 km, « à peu près » suffit |

## Phrases de remplacement

- **eclate** : « Ton câble, d'abord. Une gaine de plastique. Des *fils* de renfort. Une couche de résine. Et dessous, le fil de verre : [125|cent vingt-cinq] microns. »
- **nuit** : « À vingt mètres, il en reste un pour cent. Imagine une vitre de cette épaisseur : derrière elle, la lumière est presque *éteinte*. Impossible de relier une ville à une autre. Même un immeuble à son voisin. »
- **vapeur** : « Cette vapeur, on l'envoie dans une flamme. Elle y réagit… et il en sort une fumée *blanche*. Chaque grain de cette fumée est un grain de verre pur. »
- **menace4** : « La marge : un micron. Au-delà, deux fibres mises bout à bout s'alignent mal… et la lumière se *perd* à chaque raccord. »
- **reponse** : « Et c'est voulu. Mieux vaut que ça casse ici que chez toi. On coupe. On repart. Ce qui reste… a +tenu+. »
- **mesure** : « Dernier contrôle : la lumière elle-même. On envoie une impulsion dans la fibre, et on écoute son *écho*. Un défaut le change. On sait où il se trouve. »
- **ancres** : « Sa menace à lui ? Les ancres et les chaluts. Chaque année, plus d'une centaine de ces câbles sont *endommagés*. Des navires partent les réparer. »
- **chute** : « Plus de [99|quatre-vingt-dix-neuf] pour cent des données échangées entre continents passent par là. Internet n'est pas dans les nuages. Il est au fond de la mer… dans du +verre+. »
- **du2** : « Plie le câble trop serré… et dans le virage, elle arrive trop de face. Elle ne ricoche plus. Elle traverse. Le verre n'a rien. La lumière, elle, est *sortie*. »
- **du3** : « Une fibre classique se met à fuir quand on la plie plus serré qu'un rayon de trois centimètres. Celles des logements sont faites pour supporter des courbes plus serrées. Pas un pli. Pas un pied de meuble posé dessus. »

Nuances (remplacement facultatif) :
- **accroche** : « Ce que tu regardes vient de traverser un fil de *verre*. Aussi fin qu'un cheveu. » (idem `test2` : « Sur un fil de verre. Aussi fin qu'un cheveu. »)
- **rappel2** : « Protéger des chocs. Des frottements. Et, en partie, de l'humidité. Mais pas du geste dont je t'ai parlé : lui, il ne casse *rien*. »
- **repeteur2** : « Alors, tous les cinquante à cent kilomètres, un amplificateur la +relance+. Puis un autre. Puis un autre, jusqu'à l'autre rive. C'est le cuivre qui les alimente. »
- **aujourdhui** : « Aujourd'hui, au bout d'un kilomètre, il en reste environ [95|quatre-vingt-quinze] pour cent. »

## Reste ouvert

- Kao n'est pas seul sur l'article de 1966 (Hockham). `kao` dit « un ingénieur, Charles Kao, publie » : acceptable, mais ne rien dire qui laisse croire qu'il a écrit seul.
- Aucune consigne d'opérateur français lue sur le pli du câble : le conseil de `du3` / `like` est une déduction physique.
- Valeurs G.652 / G.657 prises sur fiches de fabricants, pas dans la norme UIT-T.
- Répartition exacte pêche / ancres : 70 à 80 % pour l'ensemble des activités humaines selon ICPC ; le film dit seulement « les ancres et les chaluts » comme menace.
- Chiffre ICPC (150-200) non confirmé sur un communiqué UIT primaire ; « plus d'une centaine » tient dans tous les cas.
- 27 millions d'abonnements : l'Arcep compte aussi la fibre jusqu'en bas d'immeuble (pas de lecture directe du communiqué ici).

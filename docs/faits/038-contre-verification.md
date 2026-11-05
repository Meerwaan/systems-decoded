# 038 — Contre-vérification du script (Sous-marin)

## Verdict

**3 phrases à corriger sur 16 beats** (scene, reponse, comment). Le reste tient, avec quelques réserves notées plus bas.

**Source primaire : introuvable.** Le rapport d'enquête de la Navy (124 pages, Pacific Fleet, 9 mai 2005) reste illisible : copie FOIA expurgée de nr-ha.org derrière identifiant, web.archive.org bloqué, globalsecurity.org en 403, Seattle Times en 405, UMass en 403. Ce qui a pu être lu :
- **CBS / 60 Minutes (David Martin, entretien avec le commandant Mooney)** : source quasi primaire (récit du commandant lui-même). Confirme : 525 pieds, « 7 000 tonnes d'acier et 137 âmes à bord », pression « 16 fois » celle de la surface, 98 des 137 marins blessés, « the forward tanks were ruptured », l'air pompé devant « partait dans l'océan », « air filled the rear tanks », puis « quelques minutes » pour atteindre la surface, et une « emergency blow ».
- **Résumé du rapport sur nr-ha.org** : un mort ; les cartes « n'incluaient pas le mont sous-marin, mais incluaient des dangers voisins ».
- **Citations du rapport reprises par la presse (Spokesman-Review 08/05/2005, NPR 17/05/2005)** : le mont n'était pas sur la carte utilisée ; « d'autres cartes en possession du San Francisco affichaient clairement un danger de navigation à proximité » ; 525 pieds ; 360 milles au sud-est de Guam ; flank speed ; 1 mort + 97 autres blessés.

## Points demandés

1. **Ballasts avant rompus, air qui s'échappe, remontée par l'arrière (la chute).** Confirmé **uniquement par le récit du commandant dans 60 Minutes (CBS)**, donc quasi primaire, pas par le rapport lui-même. Wikipedia dit « forward ballast tanks ruptured » sans note. Un message de la Navy de janvier 2005, vu par un résumé de recherche seulement (non lu en direct), parle des ballasts 1A, 1B et 2B « partiellement noyés et compromis » : donc **certains** ballasts avant, pas forcément tous. La chute tient, mais sur une seule source solide. Version la plus sûre si Merwan veut un cran de prudence : « Et elle t'a quand même remonté... grâce à l'arrière. » (même sens, ne dit pas « seulement »).
2. **Impact à 525 ft, flank speed, mont absent de la carte, autres cartes signalant un danger.** Tient (rapport via presse, nr-ha, CBS). **Mais « la carte datait de 1989 » n'est confirmée par aucune des pages lues** (CBS : « bum chart » ; Spokesman : aucun millésime ; Wikipedia : aucun). Le dossier de faits l'attribuait à Star-Bulletin/NR-HA, sans que je retrouve la phrase. À retirer tant qu'on n'a pas la page.
3. **Blessés / mort.** Navy via presse : **1 mort + 97 autres blessés = 98 touchés au total**. CBS et Wikipedia : « 98 blessés » (le mort inclus). « Quatre-vingt-dix-huit blessés. Un marin ne reviendra pas. » se lit 98 + 1 = 99 : à corriger. Un site dit « 23 blessés » : chiffre précoce/faux, ignoré.
4. **Chiffres physiques.** « 7 000 tonnes » : CBS, et un Los Angeles en plongée fait environ 6 900 t : tient comme ordre de grandeur. **« Seize fois la pression » : CBS dit 16, mais c'est la pression relative** ; à 160 m la pression absolue est ≈ 17 fois celle de la surface (calcul : 1 + 160 × 1,025 / 10,3 ≈ 17). Surtout, « l'eau **pèse** seize fois plus » est faux dans les mots : l'eau ne pèse pas plus, la pression augmente. « Mille kilos par mètre cube » : eau douce 1 000, eau de mer ≈ 1 025 : ordre de grandeur correct, « environ » conseillé.
5. **La voix ne dit nulle part** : que le San Francisco a jailli hors de l'eau, une vitesse en nœuds, un temps de remontée chiffré (« Lentement » seulement), une heure. Vérifié sur les `vo` et les `voAlt`. Le seul chiffre de durée absent, c'est bien le cas.

## Phrase par phrase

| Beat | Verdict |
| --- | --- |
| accroche | **Tient.** « Elle n'est pas sur ta carte » : rapport. Le voAlt (« l'air qui doit te sauver fuit par le trou ») est vrai (CBS). Avertissement d'écriture : le voAlt diverge de `text` au 2ᵉ mot, sans effet sur les faits. |
| promesse | **Tient.** « Sept mille tonnes » : CBS. « Tu n'as que de l'air » est une simplification dramatique (barres de plongée et vitesse aident aussi), acceptable car l'air est le seul moyen d'urgence. |
| scene | **À corriger : « l'eau pèse seize fois plus ».** L'eau ne pèse pas plus : c'est la pression ; et 16 est le chiffre relatif (≈ 17 en absolu). « Écrase ta proue comme une canette » et « marins projetés » tiennent (presse/CBS). |
| ouvre | Tient (phrase signature). |
| eclate | **Tient.** Bouteilles, vannes, ballasts autour de la coque, pleins d'eau en plongée. |
| principe | **Tient.** Archimède juste. « Mille kilos » : ordre de grandeur (≈ 1 025 en mer) ; « environ » serait plus propre si la place le permet. |
| repos | **Tient.** « Que d'un réservoir intact » : simplification (un réservoir percé garde un peu d'air, mais l'air s'enfuit). « Étanche » serait plus exact, optionnel. |
| zero | **Tient.** « Chef de quart lâche la chasse » : Navy Times (non relu ici) et pratique standard. |
| reponse | **À corriger : 98 + 1.** « Éventrés » = rupture (CBS : « ruptured ») : tient, avec la réserve que tous les ballasts avant ne sont pas forcément concernés. |
| chute | **Tient** sur le récit du commandant (CBS). Réserve ci-dessus. |
| comment | **À corriger : « 1989 »** non confirmé. « D'autres cartes, à bord, signalaient un danger » : tient mot pour mot avec le rapport. « 2005 » : tient. |
| like | Tient (aucun fait). |
| abo | Tient (aucun fait). |
| boucle | Tient. |

## Phrases de remplacement

- **scene** : « Le choc écrase ta proue comme une canette. Des marins sont projetés. À cent soixante mètres, la pression est dix-sept fois celle de la surface. Il reste un geste... la chasse d'urgence. »
  (si Merwan préfère coller à CBS, « seize fois plus que la surface » reste défendable comme pression relative, mais jamais « l'eau pèse ».)
- **reponse** : « Devant, les ballasts sont éventrés. L'air s'échappe. Derrière, ils se remplissent d'air. Lentement, le bateau monte. La surface. Quatre-vingt-dix-huit blessés, dont un qui ne reviendra pas. » (+1 mot)
- **comment** : « C'était le San Francisco, en deux mille cinq. [short pause] Et ta carte ? Elle n'avait pas cette montagne. D'autres cartes, à bord, signalaient un danger. [short pause] En commentaire : la faute... à la carte, ou à ceux qui la lisent ? » (même longueur) — à répercuter dans `voAlt` et `text`.
- **chute** (optionnel, prudence) : « Voilà le secret : ta chasse d'urgence n'était pas intacte. L'avant fuyait. Et elle t'a quand même remonté... grâce à l'arrière. »

## Reste ouvert

- Rapport de la Navy toujours non lu ; la chute repose sur le récit du commandant (CBS). Si Merwan veut une source de plus, obtenir la copie FOIA (nr-ha.org, compte gratuit) ou le PDF CPF « BASIC 080 TO 099 ».
- Millésime de la carte (1989) : non confirmé ; la Navy/DMA et l'étude UMass (Wright et al.) le diraient probablement ; page inaccessible.
- Combien de ballasts avant exactement (1A, 1B, 2B ?) : non confirmé.
- « Chef de quart » : source secondaire seulement.
- Nombre de requêtes utilisées : 13 (dont 3 bloquées).

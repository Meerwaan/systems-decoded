# 045 — Contre-vérification du script (L'autodestruction de la fusée)

Sources relues à la source cette fois : rapport Lions (texte extrait de la copie Toronto, §1.1, §1.3, §2.1/3.1), fiche Pyroalliance LSCD 04.2025 (texte extrait), Wikipédia FR « Vol 501 d'Ariane 5 » [S], Wikipédia EN V88 [S], présentation de campagne Ariane 5 (résumé de recherche) [S]. 12 requêtes web.

## Verdict

**6 phrases à corriger sur 15** : `promesse` (léger), `eclate` (léger), `principe`, `zero`, `reponse`, `comment`. Les 9 autres tiennent (l'abo « À FAIRE » est laissé comme demandé).

Le défaut principal : trois choses que la voix affirme sont fausses ou non sourcées pour Ariane 501 (« Trente-six secondes » sans « après l'allumage » ; « d'un seul côté » ; « Personne n'a eu à appuyer »), et deux autres sont des déductions que le rapport ne fait pas (« plus rien ne pousse », « dans son couloir »).

## Points demandés

1. **« tout retombe dans son couloir »** : non sourcé. Lions §1.3 : l'autodestruction a eu lieu « near to the launch pad, at ~4000 m », « all the launcher debris fell back onto the ground, scattered over ~12 km² east of the launch pad », « nearly all mangrove swamp or savanna ». Le rapport ne parle ni de couloir de vol ni de zone de sécurité pour ce vol. Le CNES dit que la règle est de détruire avant la sortie du couloir (général, [P]) mais aucune source ne dit que les débris de 501 sont restés dans ce couloir. **À corriger** : dire ce que dit le rapport (« près du pas de tir », mangrove, savane). Le mot « couloir » reste vrai dans `scene` et `repos` comme règle (« doivent tomber », « sa règle »), pas comme constat.
2. **« plus rien ne pousse »** : [S] et faux pour des boosters à poudre (le propergol d'un propulseur à poudre continue de brûler même coque fendue ; la source NASA dit « fend le corps sur 70 % », pas « coupe la poussée »). Non dit par Lions pour Ariane 5. **À retirer**, ainsi que « Chaque morceau s'ouvre » (« chaque » : rien ne dit quelles pièces de 501 portaient une charge).
3. **« armée avant l'allumage » + chaîne antenne / sécurité-armement / détonateur / cordeau / charge** : « armée avant l'allumage » **tient** ([S] : la campagne de lancement d'Ariane 5 décrit l'activation du système d'autodestruction « dans la séquence précédant l'allumage des EAP » ; Shuttle : ~5 min avant). La **chaîne**, elle, vient de la navette (NASA PT-TE-1438) et des fiches Pyroalliance pour **Ariane 6 et Vega-C** (« embarked on Ariane 6 and Vega-C ») : aucune source lue ne décrit la chaîne d'Ariane 5. Ce qui est établi pour Ariane 5 : un boîtier de sauvegarde qui commande la destruction [S], une destruction commandable du sol (vol 157, 2001 [S]), une destruction automatique sur rupture des liaisons boosters / étage principal [P]. **Correction légère** : cadrer l'énumération comme « sur une fusée », pas comme le schéma d'Ariane 5.
4. **« Trente-six secondes »** : **à corriger**. Lions §1.1 : H0 = ordre d'allumage du Vulcain ; « H0 + 36.7 s (approx. 30 seconds after lift-off) ». Le film, qui place le spectateur « au décollage », fait entendre 36 s de vol, soit ~6 s de trop. Il faut dire « après l'allumage ». (36 vs 37 : le rapport dit « nominal jusqu'à H0 + 36 s », panne à H0 + 36,7 s ; « trente-six » tient, « trente-sept » serait aussi juste.)
5. **« en s'arrachant, les boosters ont coupé leurs fils » / « personne n'a eu à appuyer »** : la première moitié **tient** (Lions §1.1 : « self-destruction of the launcher correctly triggered by rupture of the links between the solid boosters and the core stage » ; « In Brief » ESA : « electrical links » ; §2.1 : la désintégration a séparé les boosters, « in turn triggering the self-destruct system »). La seconde **ne tient pas** : le rapport ne dit pas qu'aucun ordre n'est parti du sol, et Wikipédia FR [S] écrit que « le contrôleur de vol au sol... télécommande également sa destruction » (non sourcé, déjà signalé dans le dossier de faits comme non confirmé). « Personne n'a eu à appuyer » est donc une affirmation négative non prouvée. **À corriger** : dire seulement ce que le rapport établit (le déclencheur automatique), sans exclure le sol.
6. **« Pliée en V, doublée de cuivre, plus de 7 000 m/s, deux centimètres d'acier »** : fiche Pyroalliance : « dihedral linear shape charge », « copper cutting cord », « hydrodynamic jet of metal », « > 7700 m/s », « **Up to** 22 mm in steel ». « Plus de sept mille » tient (le seuil est 7 700). « Coupe deux centimètres d'acier » est un maximum (« up to 22 mm »), pas une constante : **« jusqu'à »** est nécessaire. Et c'est la performance du produit Ariane 6 / Vega-C, pas une mesure d'Ariane 5 : le film le présente comme principe général, ce qui reste acceptable.
7. **Aucune phrase ne dit qu'elle a dévié vers une ville ou une côte** : vérifié. « Ta fusée bascule... se détruit toute seule », « mangrove, savane », « près du pas de tir » : rien de faux sur ce point. L'ouverture « Ta fusée » est un cadrage à la deuxième personne, pas une affirmation de danger sur une ville.

## Phrase par phrase

**accroche** « Ta fusée bascule et se déchire. Puis elle se détruit toute seule... comme prévu. » — **tient.** Lions §2.1 : angle d'incidence > 20°, désintégration aérodynamique vers H0 + 39 s, destruction « automatically initiated upon disintegration, as designed ». « Se déchire » = désintégration ; « comme prévu » = « as designed ».

**promesse** « Toute fusée emporte sa propre charge, pour ça. Mais ce jour-là... qui l'a déclenchée ? » — **à corriger (léger)** : « toute » est un absolu qu'aucune source lue ne démontre (FTS prouvé sur Shuttle, Ariane 5/6, Vega-C, Falcon 9, Starship ; pas « toutes »). Remplacer par « Une fusée ». Le reste tient.

**scene** « Quatre kilomètres au-dessus du sol. À un kilomètre du pas de tir. Ses morceaux vont pleuvoir... et ne doivent tomber que dans son couloir. Il reste sa charge. » — **tient.** Lions §3.1 j : « altitude of 4 km and a distance of 1 km from the launch pad » [P] (§1.3 : « approximately 4000 m » ; l'avant-propos dit 3 700 m : ordre de grandeur « quatre kilomètres » acceptable). « Doivent tomber que dans son couloir » = règle (CNES), pas constat.

**ouvre** « Alors... on l'ouvre. » — tient (signature).

**eclate** « Une antenne écoute le sol. Un verrou, la sécurité-armement. Un détonateur. Un cordeau qui file le long de la coque... et au bout, la charge linéaire. » — **à corriger (léger)** : chaîne vraie en général (Shuttle [P], Ariane 6 / Vega-C pour la charge linéaire [P]), non documentée pour Ariane 5. Le « Un verrou » pour la sécurité-armement est correct (verrou mécanique, NASA). Cadrer par « Sur une fusée ».

**principe** « Pourquoi ça tranche ? Pliée en V, doublée de cuivre, elle détone à plus de sept mille mètres par seconde... et en fait un jet de métal qui coupe deux centimètres d'acier. » — **à corriger** : « jusqu'à » (maximum, 22 mm). Reste exact. Même longueur en remplaçant « en fait » par « lance ».

**repos** « Armée avant l'allumage, elle attend. À Kourou, la sauvegarde du Cnes suit chaque seconde. Sa règle : jamais hors du couloir. Et là... ta fusée bascule. » — **tient** (voir point 3 : « armée avant l'allumage » [S] pour Ariane 5, [P] Shuttle ; CNES : salle de sauvegarde, suivi, règle du couloir [P]). Mention : « Cnes » dans `vo` est une graphie de diction, `text` dit CNES.

**zero** « Trente-six secondes. Son guidage s'arrête. Les tuyères braquent à fond d'un seul côté. Elle se met en travers : plus de vingt degrés. » — **à corriger, trois défauts** : (a) « trente-six secondes » sans point de départ ; (b) « Son guidage s'arrête » est trompeur : ce sont les **deux centrales inertielles** qui tombent en panne (à 72 ms d'écart), et le calculateur de bord a alors **continué à piloter** avec un motif de diagnostic lu comme des données de vol (Lions §2.1) : le guidage ne s'arrête pas, il devient faux ; (c) « d'un seul côté » : le rapport dit « extreme position of the nozzles » des boosters puis du Vulcain, sans direction ; rien ne dit « d'un seul côté ». Le « plus de vingt degrés » (incidence) tient.

**reponse** « Les boosters s'arrachent. Et là, la charge détone. Chaque morceau s'ouvre. Plus rien ne pousse. Tout retombe dans son couloir : de la mangrove, de la savane. » — **à corriger** : voir points 1 et 2. « Les boosters s'arrachent » (liaisons rompues) tient ; « la charge détone » tient (autodestruction « as designed ») ; « tout retombe » tient (« all the launcher debris fell back onto the ground ») ; « mangrove, savane » tient.

**chute** « Voilà son secret : ce jour-là, la fusée a raté. Sa sauvegarde, pas du tout. Rater, pour elle, c'est laisser la fusée voler encore. » — **tient.** Le rapport : destruction « correctly triggered », « as designed ». Nuance : « sa sauvegarde » désigne à la fois la salle du CNES (`repos`) et le système embarqué qui a agi ; l'auditeur les fond sans fausseté.

**comment** « Et qui a déclenché la charge ? Personne n'a eu à appuyer : en s'arrachant, les boosters ont coupé leurs fils. En commentaire : une fusée qui dévie... un humain décide, ou la machine ? » — **à corriger** : « Personne n'a eu à appuyer » (voir point 5). La question du commentaire tient (fermée, deux camps).

**like** « Like : pour celui qui croit qu'une fusée qui explose, c'est raté. » — tient.

**abo** « Abonne-toi : prochain dossier, À FAIRE. » — laissé tel quel (consigne).

**boucle** « Jusqu'à la seconde où, » — hors périmètre de fait ; se raccorde à « Ta fusée bascule... » si l'abo final garde une queue naturelle.

## Phrases de remplacement

Chaque phrase est donnée telle qu'elle doit s'afficher (`text`) puis dirigée (`vo`) ; mêmes mots, même ordre.

**promesse**
- text : « Une fusée emporte sa propre +charge+, pour ça. Mais ce jour-là… qui l'a *déclenchée* ? »
- vo : `[firm, matter-of-fact] Une fusée emporte sa propre charge, pour ça. [short pause] Mais ce jour-là... qui l'a déclenchée ?`

**eclate**
- text : « Sur une fusée, une antenne écoute le sol. Un verrou, la sécurité-armement. Un détonateur. Un cordeau qui file le long de la coque… et au bout, la charge +linéaire+. »
- vo : `[conversational, curious] Sur une fusée, une antenne écoute le sol. Un verrou, la sécurité-armement. Un détonateur. Un cordeau qui file le long de la coque... et au bout, la charge linéaire.` (+3 mots ; si le minutage le refuse : « Une antenne écoute le sol » reste acceptable seule, le risque est faible)

**principe**
- text : « Pourquoi ça tranche ? Pliée en V, doublée de cuivre, elle détone à plus de [7 000|sept mille] mètres par seconde… et lance un jet de métal qui coupe jusqu'à deux centimètres d'+acier+. »
- vo : `[curious] Pourquoi ça tranche ? [short pause] Pliée en V, doublée de cuivre, elle détone à plus de sept mille mètres par seconde... et lance un jet de métal qui coupe jusqu'à deux centimètres d'acier.`

**zero**
- text : « [36|Trente-six] secondes après l'allumage. Ses centrales inertielles *lâchent*. Les tuyères braquent à fond. Elle se met en travers : plus de [20|vingt] degrés. »
- vo : `[firm, matter-of-fact] Trente-six secondes après l'allumage. Ses centrales inertielles lâchent. Les tuyères braquent à fond. Elle se met en travers : plus de vingt degrés.` (22 mots, comme l'original). Repère `zero` / `tozero` : le mot « lâchent » remplace « arrête » ; si un repère visait `zero:arrête`, le déplacer sur `lâchent`.

**reponse**
- text : « Les boosters s'*arrachent*. Et là, la charge +détone+. La coque s'ouvre. Tout retombe près du pas de tir : de la mangrove, de la savane. »
- vo : `[tense] Les boosters s'arrachent. Et là, la charge détone. La coque s'ouvre. Tout retombe près du pas de tir : de la mangrove, de la savane.` (22 mots au lieu de 25 ; les repères `trigger` (« détone ») et ce qui suit sont inchangés.)

**comment**
- text : « Et qui a déclenché la charge ? Les boosters eux-mêmes : en s'arrachant, ils ont coupé leurs fils. En +commentaire+ : une fusée qui dévie… un humain décide, ou la *machine* ? »
- vo : `[conversational, curious] Et qui a déclenché la charge ? [short pause] Les boosters eux-mêmes : en s'arrachant, ils ont coupé leurs fils. [short pause] En commentaire : une fusée qui dévie... un humain décide, ou la machine ?` (même longueur à un mot près.)

## Reste ouvert

- **Ordre éventuel du sol sur 501** : Lions n'en parle pas ; Wikipédia FR [S] dit que le contrôleur a aussi télécommandé la destruction. Non tranché ; la voix ne l'exclut plus.
- **Chaîne pyrotechnique d'Ariane 5** (récepteurs, cordeau, type de charge) : introuvable à la source ; le film la décrit comme « sur une fusée ».
- **36 s vs 37 s** après H0 : le rapport donne les deux (nominal jusqu'à H0 + 36 s, panne à 36,7 s) ; « trente-six » conservé pour les repères.
- **Altitude** : 3 700 m (avant-propos) ou 4 000 m (§1.3, 3.1 j) ; « quatre kilomètres » correct à l'ordre de grandeur.
- **« Armée avant l'allumage »** reste [S] pour Ariane 5 (confirmation primaire non trouvée).
- **Abo** : « À FAIRE » à remplacer par le sujet 046 ; ne pas écrire « À FAIRE » en capitales dans la voix (avertissement du script : crié ou épelé).

# 033 — Contre-vérification du script (porte d'avion)

Requêtes web : 5 sur 12. Sources : dossier de faits 033 et 034, Wikipedia Asiana 8124, recherches presse (Flightglobal, UPI/Asiae via résumé), BEA/presse AF447, brevets et extraits de formation Airbus.

## Verdict

**4 beats à corriger (5 phrases)** : `scene`, `repos`, `chute`, `abo` (et `boucle`, pour rester collée à `abo`). Le reste tient. Aucune erreur de fond sur le mécanisme : ce sont un mot faux (« vide »), un chiffre gonflé (« presque quatre fois »), un absolu sans « là-haut » et un délai arrondi.

## Points demandés

1. **« Presque quatre fois plus d'air dedans » : trop fort.** Cabine à 8 000 ft ≈ 75 kPa ; extérieur à FL370 ≈ 21,6 kPa : rapport ≈ **3,5**. À FL350 ≈ 3,2. Seul FL390 avec cabine à 8 000 ft approche 3,8. Cabine A320 en croisière : 6 000 à 8 000 ft selon l'altitude (donc 3,1 à 3,7). Dire « plus de trois fois ». À corriger.
2. **« Environ huit tonnes » : tient.** (75 − 21) kPa ≈ 54 kPa × ≈ 1,5 m² ≈ 81 kN ≈ 8,3 t-force ; différentiel de croisière 7,5 à 9 psi, aire d'appui un peu inférieure à 1,5 m² : 7 à 9 t. « Environ » suffit, niveau [O] (calcul maison, déjà dit au dossier). La porte d'Asiana (voir 3) est bien une porte de taille normale, donc l'ordre de grandeur s'applique à elle aussi.
3. **Asiana 8124 : tient.** A321, Jeju → Daegu, 26 mai 2023 ; ouverture vers 200 m (ministère 700 ft ≈ 213 m ; procureurs 224 m) ; le passager a touché le levier de la sortie, croyant l'avion posé ; Asiana elle-même dit que, près du sol, la porte peut s'ouvrir. Flightglobal : la sortie L3, derrière l'aile (pas une trappe sur l'aile). « L'avion se posait » : exact (approche finale). « Presque plus rien ne plaquait la porte » : cohérent avec l'explication d'Asiana ; le constat chiffré du ministère sur le différentiel n'a pas été retrouvé (rapport ARAIB non lu) : la phrase reste qualitative, c'est la bonne prudence.
4. **Crochets de verrouillage et butées : acceptable.** « Butées » (stop fittings / stop pads, brevets de portes bouchon et extrait de formation A350) : le mot juste. « Crochets de verrouillage » : un extrait de formation Lufthansa A318-A321 parle de « locked hooks » (pour la trappe de secours) ; le mécanisme de porte décrit ailleurs parle de loquets (latches, deux, avant et arrière) et d'arbre de verrouillage. Pas faux pour un public non professionnel, mais seulement niveau [S]. Si l'image montre des loquets, la voix peut garder « crochets ». Rien dans le script ne dit que la porte se lève avant de pivoter (bien : non sourcé pour l'A320).
5. **Annonce 034 : à corriger (léger).** Épave par 3 900 m ; FDR trouvé 1er mai 2011, CVR 3 mai ; accident 1er juin 2009 : environ **23 mois**. Le dossier 034 dit lui-même « presque deux ans ». « Deux ans » seul arrondit au-dessus et se dit sans « presque » dans la boucle. Le script ne nomme pas AF447 : « elle » désigne un enregistreur précis sans le dire (reste ouvert).

## Phrase par phrase

- **accroche** « Ton voisin force la porte, en plein vol. Elle ne bouge pas. » : tient.
- **promesse** « En croisière, personne ne peut l'ouvrir. Même en le voulant. Alors pourquoi, en Corée, un passager en a ouvert une ? » : tient (« en croisière » borne l'absolu ; Corée = approche, répondu au beat `comment`).
- **scene** : « Il y met tout son poids. » tient. « Dehors, plus de dix kilomètres de vide. » **à corriger** : à 10-12 km il y a de l'air raréfié, pas du vide ; la phrase contredit `repos` (« l'air s'amincit ») et fait entendre qu'il n'y a plus d'air. « Toi, tu es juste à côté. Tu l'arrêtes... ou tu fais confiance à cette porte ? » tient.
- **ouvre** : tient (phrase signature, intacte).
- **eclate** : « une poignée, des crochets de verrouillage » tient (point 4). « la porte est plus grande que son cadre » tient (porte bouchon, [S]). « Elle s'appuie, de l'intérieur... sur des butées » tient.
- **repos** : « Au sol, l'air pousse pareil des deux côtés. » tient. « L'avion monte : dehors, l'air s'amincit. » tient. « Dedans, on en garde presque quatre fois plus. » **à corriger** (point 1). « Et ton voisin force toujours. » tient.
- **seuil** : tient.
- **zero** : tient. « Plus rien ne retient la porte » est une hypothèse posée (« mettons que »), les butées ne sont pas ici un « retien » mais une charge : suit bien `reponse`.
- **reponse** : « Elle ne bouge pas. L'air de ta cabine pousse vers la nuit. Il la plaque sur ses butées : environ huit tonnes. Les butées encaissent. La poignée, presque rien. » tient (points 2, et butée = ce qui encaisse, pas le passager).
- **chute** : « ce n'est pas un verrou qui ferme ta porte. C'est l'air. » **à corriger** : littéralement faux au sol et à basse altitude, où ce sont bien les verrous qui la ferment (et la réglementation les exige). Vrai seulement en altitude, ce que `comment` confirme. Ajouter « là-haut ». « Plus tu montes... plus elle est fermée » tient (au sens courant ; le différentiel plafonne ensuite).
- **comment** : tient (point 3). « deux cents mètres » = « environ 200 m » du dossier.
- **like** : tient.
- **abo** : « Prochain dossier : la boîte noire. » tient. « Elle a attendu deux ans au fond de l'Atlantique. » **à corriger** (point 5).
- **boucle** : « Deux ans... depuis le jour où, » : à aligner sur `abo`.

## Phrases de remplacement

- **scene** : « Dehors, plus de dix kilomètres d'altitude. » (même longueur ; l'image montre le ciel, pas le vide.)
- **repos** : « Dedans, on en garde plus de trois fois plus. » (si l'oreille bute, « trois fois plus d'air » reste juste à FL350 à FL370.)
- **chute** : « Voilà son secret : là-haut, ce n'est pas un verrou qui ferme ta porte. C'est l'air. Plus tu montes... plus elle est fermée. » (deux mots de plus.)
- **abo** : « Prochain dossier : la boîte noire. Elle a attendu presque deux ans au fond de l'Atlantique. »
- **boucle** : « Presque deux ans... depuis le jour où, » (un mot de plus ; si la longueur est critique, garder « Deux ans... » reste défendable comme écho arrondi, mais moins exact).

## Image (court : une ligne)

La phrase la plus dure pour la 3D : `reponse`, « Il la plaque sur ses butées : environ huit tonnes » (flèches de pression sur toute la porte, charge qui descend dans les butées, pas dans la poignée). L'image ne doit pas faire dire que la porte « se soulève » ou « pivote vers l'intérieur » (cinématique A320 non sourcée) ni montrer la poignée qui encaisse.

## Reste ouvert

- Le constat du ministère coréen sur le différentiel et le rapport ARAIB d'Asiana 8124 : non lus. La phrase reste qualitative.
- Cinématique exacte de la porte A320 et vocabulaire Airbus officiel (« crochets » contre « loquets ») : non sourcés dans un document Airbus.
- `abo` : « elle » désigne l'un des deux enregistreurs (FDR et CVR) sans nommer AF447 ; à régler avec le script 034.
- Le seuil de pression résiduelle (Safety First) n'est pas utilisé dans le script : rien à vérifier.

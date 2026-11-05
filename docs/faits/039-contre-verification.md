# 039 — Contre-vérification du script (« Le cendrier du réacteur »)

Requêtes web utilisées : 7 sur 12 (3 recherches, 4 lectures : page IRSN/ASNR du récupérateur, PDF Laponche lu en texte, RST IRSN 2005).

## Verdict

**3 phrases à corriger** (promesse, reponse, chute), **2 retouches légères** (question du commentaire, abo). Le reste tient.
Le point le plus important : dans `reponse`, la voix dit « plusieurs minutes passent, PUIS les vannes s'ouvrent ». Faux : les vannes s'ouvrent quand la coulée touche les déclencheurs (pendant l'étalement) ; c'est l'eau qui recouvre le corium « après plusieurs minutes ».

## Points demandés

1. **« Plus de deux mille degrés » : tient.** Corium formé à 2 500-3 000 °C (Connaissance des énergies), « avoisine les 2 500 °C » (page IRSN/ASNR du récupérateur, lue), bain ≈ 2 200 °C (IRSN, extrait). La phrase parle du cœur fondu, pas de l'acier (1 430 °C).
2. **« Quelques dizaines de secondes » / « plusieurs minutes » : confirmé dans le texte de Laponche (Global Chance, 08/09/2019, PDF lu), qui cite l'IRSN (IRSN-2008/98, original toujours non lu) :** « La coulée de corium s'étale en quelques dizaines de secondes après l'apparition d'une brèche dans la porte fusible et active l'injection d'eau qui recouvre le corium après plusieurs minutes. » Deux précisions. (a) L'ordre est : s'étale → active l'injection → l'eau recouvre après plusieurs minutes (voir correction `reponse`). (b) Le rapport scientifique IRSN 2005 (lu) dit, sous hypothèses pénalisantes (corium partiellement fondu, très visqueux), que le front atteint le bout de la chambre « en quelques minutes », et que l'eau atteint la surface « quelques minutes après le contact entre le corium et les détecteurs ». Donc « dizaines de secondes » = cas nominal : ordre de grandeur honnête, on le garde, sans jamais le préciser davantage.
3. **Question du commentaire : vraie mais trompeuse.** Seuls les EPR ont une chambre d'étalement (Taishan, Olkiluoto 3, Flamanville 3 ; les VVER russes ont un creuset). Presque tout spectateur français répondrait « pas », donc « mon réacteur n'a rien ». Or les 900/1300 MWe reçoivent des modifications (IRSN d'après Laponche : étalement à sec dans le puits de cuve et le local RIC voisin, puis noyage passif rapide). « Ou pas » laisse entendre « sans protection », ce que les faits démentent. De plus le mot EPR n'est jamais prononcé dans le film. Remplacement plus juste ci-dessous.
4. **Chambre sous la cuve / eau avant l'étalement : rien ne le laisse croire.** `eclate` enchaîne fosse → porte → canal → chambre ; `repos` : « à côté de la cuve », « à sec », « vannes fermées » ; ASNR : « n'est pas située directement sous la cuve », étalement à sec garanti avant l'eau. Tient. Seules `reponse` (ordre vannes / minutes) et `chute` (« on ne noie pas ») posent problème.
5. **Non-dit : le film ne dit jamais que c'est l'EPR.** « Ton réacteur nucléaire fond… C'est prévu : une salle vide l'attend » laisse entendre que tout réacteur a cette salle. Voir correction `promesse`.

## Phrase par phrase

- **accroche** « Ton réacteur nucléaire fond. L'acier lâche. Et on le laisse couler. » : tient (le « ton réacteur » est rattrapé par `promesse`). L'acier de cuve fond vers 1 430 °C, la cuve se perce.
- **promesse** « C'est prévu : une salle vide l'attend. Pour l'eau, ni pompe, ni courant, ni toi. Alors qui va l'ouvrir ? » : **à corriger** : « C'est prévu » laisse croire que c'est le cas de tout réacteur ; seul l'EPR a cette salle. Passif confirmé (gravité, piscine IRWST en hauteur, déclencheurs fusibles). Note d'oreille : « qui va l'ouvrir » sonne comme « on l'ouvre » ; acceptable, le « l' » est l'eau.
- **scene** « Plus de deux mille degrés. Le fond de la cuve se perce. Le cœur fondu ronge une fosse de béton. Une seule sortie… une porte qui doit fondre. » : tient. Seul endroit non doublé de zircone, la porte fusible est la sortie unique (Fischer).
- **ouvre** : signature, intacte.
- **eclate** « La fosse, en béton sacrificiel : fait pour être mangé. Au centre, la porte fusible. Puis un canal. Et au bout… la chambre d'étalement. À sec. » : tient (le béton sacrificiel est conçu pour être érodé).
- **principe** « Le cœur fondu chauffe dans toute son épaisseur. Épais, il perce le sol. Étalé sur cent soixante-dix mètres carrés, il devient mince : sa chaleur se partage. » : tient. Chaleur résiduelle produite dans tout le volume ; flux par surface qui croît avec la hauteur (IRSN 2005). 170 m² = « environ 170 m² » (ASN 2011, IRSN) : valeur de conception.
- **repos** « Il n'a jamais servi. Il dort, à sec, à côté de la cuve. Dans le bâtiment, une piscine attend. Vannes fermées. Et personne ne viendra les ouvrir. » : tient. Jamais éprouvé en accident réel ; IRWST dans le bâtiment réacteur ; vannes fermées en fonctionnement normal.
- **zero** « La porte fusible cède. Le cœur fondu s'engouffre dans le canal. Droit vers la chambre. » : tient.
- **reponse** : **à corriger** (ordre des événements).
- **chute** « Voilà le secret : on ne noie pas un cœur fondu. Trop tôt, l'eau explose en vapeur. L'eau vient après. » : **à corriger** : « on ne noie pas un cœur fondu » est littéralement faux (on le noie, après) ; « l'eau explose » est catégorique alors que le risque d'explosion de vapeur est ce que la conception évite.
- **comment** « Et l'eau, qui l'a ouverte ? Le cœur fondu lui-même : en s'étalant, il détruit les déclencheurs des vannes. … » : la réponse tient (Fischer : déclencheurs détruits par la coulée ; IRSN 2005 : le corium « atteint des détecteurs déclenchant le déversement d'une réserve d'eau »). **Question à corriger (légère)**, voir point 3.
- **like** : tient (motif, pas un fait).
- **abo** « …soixante-treize pompiers encerclés par le feu… et aucun brûlé. » : **à corriger (léger)**. 73 confirmé (Butte Fire, 1985 : 118 pris dans le feu, 45 en coupe rase, 73 sous abri). « Aucun brûlé » ne repose que sur une synthèse secondaire (Wildfire Today) ; les sources parlent de cinq hospitalisés (coup de chaleur, fumées, déshydratation). « Aucun mort » est solide et vrai à la lettre.
- **boucle** « Et tout recommence quand, » : tient.

## Phrases de remplacement

- **promesse** : « Sur l'EPR, c'est prévu : une salle vide l'attend. Pour l'eau, ni pompe, ni courant, ni toi. Alors qui va l'ouvrir ? » (+2 mots ; si trop long, couper « ni toi » ; l'accroche garde « Ton réacteur nucléaire » pour la boucle.)
- **reponse** : « Il s'étale. En quelques dizaines de secondes. Une mer orange, mince. Les vannes s'ouvrent… seules. Plusieurs minutes passent. L'eau descend, sans pompe. Et le recouvre. » (25 mots au lieu de 26.)
- **chute** : « Voilà le secret : on ne noie pas tout de suite un cœur fondu. Trop tôt, l'eau peut exploser en vapeur. L'eau vient après. » (+4 mots.)
- **comment** (question seulement) : « En commentaire : le réacteur près de chez toi… un EPR, ou pas ? » (même longueur ; Flamanville 3 est le seul en France ; jamais faux pour les autres.)
- **abo** : « Abonne-toi : prochain dossier, soixante-treize pompiers encerclés par le feu… et aucun mort. » (même longueur ; à aligner avec le 040.)

## Reste ouvert

- IRSN-2008/98 (original de « dizaines de secondes » / « plusieurs minutes ») toujours non lu ; la citation passe par Laponche, texte lu.
- Détecteurs : IRSN 2005 dit que le corium les « atteint », Fischer qu'il les « détruit » ; le film dit « détruit » (Fischer, lu) : tient.
- Image : ne pas montrer d'eau avant l'étalement, ni la chambre sous la cuve ; la mer orange s'étale vite (dizaines de secondes) puis reste immobile pendant les minutes ; reconstitution, jamais arrivée.

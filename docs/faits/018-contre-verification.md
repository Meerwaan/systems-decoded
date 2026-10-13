# Contre-vérification 018 — La cocotte-minute

Date : 2026-10-13. Script lu : `episodes/018-cocotte-minute/episode.json` (beats, sources). Faits : `docs/faits/018-cocotte-minute.md`. 4 requêtes web utilisées sur 12.

## Beat par beat

| Beat | Verdict | Détail |
| --- | --- | --- |
| accroche | tient, nuance | « plus de 350 kilos » = DREAL 2018 : force « équivaut à une masse de plus de 350 kg » (A, lue dans le dossier de faits ; PDF non lisible par le lecteur web, pas relu). Le script dit que la vapeur « pousse 350 kilos » : c'est un équivalent, pas une masse. Acceptable à la voix, « l'équivalent de » est plus exact. |
| promesse | tient | Le sifflement est la soupape de fonctionnement qui régule la pression (Batimex, Cristel : A). Si elle ne laisse plus sortir de vapeur, les notices parlent de problème (Cristel, Batimex : A). « Te protège » est un raccourci acceptable. Les soupapes récentes chuchotent plus qu'elles ne sifflent (déjà dans `sources`). |
| scene | à corriger | « près de 120 » : SEB donne 0,9 bar relatif pour la viande (≈ 118 °C) mais 0,55 bar pour les légumes (≈ 111 °C) ; Cristel 0,6 bar en position 1. La scène est des lentilles : 120 est le haut de la fourchette. |
| ouvre | tient | Phrase signature intacte. |
| eclate | tient | Cuve, couvercle, joint, deux soupapes : cohérent avec Batimex/Cristel/SEB. |
| repos | tient, simplification | « Un poids posé sur un trou » : soupape à masselotte (Wikipédia FR : gravité ou ressort, B). Déjà signalé dans `sources`. |
| verrou | tient | Cristel (A) : indicateur rouge, « ne peut pas être ouvert tant que l'indicateur est visible » ; DREAL : « il ne doit pas être possible d'ouvrir un autocuiseur sous pression » (A). |
| seuil | tient | Pas d'affirmation factuelle. |
| zero | tient | Mousse qui bouche la soupape : Cristel (A), « les soupapes risqueraient de se boucher ». |
| reponse | tient | Ordre soupape de fonctionnement → soupape de sécurité → joint (côté ou levier) : Batimex (A, avec levier), Cristel (A, sécurité latérale = sortie du joint). SEB « deux temps » : B/C seulement. Ordre vrai mais pas universel, à garder dans `sources`. |
| chute | tient | « Aux normes » protège la phrase : accidents 2018 = ouvertures brutales (DREAL, A) ; le rappel Anilar 2026 (B) parle d'explosion pour un modèle défectueux, donc hors « aux normes ». « Elle fuit » : le joint sort, c'est une fuite exprès. |
| comment | tient | Coupe le feu / laisse retomber / ne force pas : Batimex et Cristel (A). Nettoyer la soupape : Batimex « vérifiez la non-obstruction » (A). Une recherche web générale confirme la même séquence (C). Les notices autorisent aussi l'eau froide sur le couvercle (SEB, Cristel) : le script n'a pas à la dire. Ne pas écrire « nettoie » avant que la pression soit tombée : l'ordre actuel est bon. |
| like | tient | Moitié pour ce qui mousse ou gonfle (Cristel, Batimex : A). Le « deux tiers » général n'est pas dit : correct. |
| abo | à corriger légèrement | Prétensionneur pyrotechnique confirmé : une charge produit un gaz qui pousse un piston, tire un câble qui rétracte la sangle ou tire la boucle ; charge dans l'enrouleur ou dans la boucle (brevets USPTO/EPO, brevet linéaire : B). « Dedans » pourrait se lire comme « dans la sangle ». |
| boucle | tient | Pas d'affirmation. |

Phrases qui tiennent : 13 sur 15 (2 à corriger : scene, abo). 3 nuances sans changement obligatoire : accroche, repos, reponse.

## Corrections proposées

1. **scene** · « l'eau ne bout plus à cent degrés, mais à près de [120|cent vingt] » → « l'eau ne bout plus à cent degrés, mais vers [110|cent dix], cent vingt » · le dossier donne 111 °C (0,55 bar, légumes SEB, calcul sur la vapeur saturée, B) à 118 °C (0,9 bar, viande) ; des lentilles sont du côté bas. Variante plus courte : « mais à plus de [110|cent dix] ».
2. **abo** · « Au choc, une charge explosive part *dedans*. Exprès. » → « Au choc, une charge explosive part dans son *enrouleur*. Exprès. » · le prétensionneur est un générateur de gaz dans l'enrouleur ou sous la boucle, pas dans la sangle (brevets pyrotechniques, B). Si on veut couvrir les deux : « part près de la *boucle*… ou de l'enrouleur » (plus long).
3. Optionnel, **accroche** · « plus de 350 kilos » → « l'équivalent de plus de 350 kilos » · DREAL parle d'une force « équivalant à » une masse.

## À préciser dans `sources` du script

- 350 kg est une force équivalente (DREAL 2018), pas une masse ; elle dépend du diamètre et de la pression.
- La plage de température : 111 °C (0,55 bar) à 118 °C (0,9 bar) selon la position et le modèle.
- L'ordre des sécurités vient de Batimex (levier) ; SEB et Cristel : joint qui sort ; SEB « deux temps » n'est lu qu'en résumé (B/C).
- Prochain dossier : prétensionneur pyrotechnique, dans l'enrouleur ou la boucle, deux architectures (B, brevets) ; aucune source primaire constructeur lue.
- Le mot « explose » : seulement pour un modèle défectueux (Anilar 2026), jamais pour un modèle aux normes.

## Requêtes utilisées (4 sur 12)

1. Recherche : prétensionneur pyrotechnique, enrouleur/boucle (capcar.fr lexique, brevets EPO) — B.
2. Recherche : seat belt pretensioner pyrotechnic charge (brevets USPTO 6213511, 5871236, 5913486) — B.
3. Lecture du PDF DREAL 2018 : illisible par le lecteur web (binaire) ; le dossier de faits, qui l'a lu en local, fait foi.
4. Recherche : consignes quand la soupape ne laisse plus sortir de vapeur — C, recoupe Batimex/Cristel.

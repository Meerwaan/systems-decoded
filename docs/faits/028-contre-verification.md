# 028 — Contre-vérification du script (21/10/2026)

## Verdict
Le script tient sur le fond. **4 phrases à corriger** (promesse, scène, chute, annonce), une retouche de précision sur `comment`. Aucune erreur de fait grave ; deux risques de sens (« cette dose » sans antécédent, « le gaz » jamais nommé monoxyde avant 40 s) et une réserve d'efficacité sur l'annonce, déjà fixée dans les faits du 029. Web : 2 requêtes (obligation CO en France ; Haegeli 2014).

## Points demandés
1. **Chaudière** : source juste (SPF cite appareils à gaz, bois, fioul ; ARS : chaudières et chauffe-eau défectueux 54 % en Île-de-France 2024, 59 % en Centre-Val de Loire 2023). Mais « t'empoisonne » dit « ta chaudière en marche normale ». Acceptable pour une accroche (le scénario est « chaudière défectueuse »), la scène ne le précise pas : à garder, ne pas durcir en « toutes les chaudières ». Reste ouvert : à dire à Merwan en une ligne, pas de correction exigée.
2. **Seuils** : cohérents (50 ppm : alarme entre 60 et 90 min, donc interdite avant 60 ; 100 ppm : 10 à 40 min). Cohérence interne : une heure à 50 ppm, puis « le gaz monte encore », puis 10-20 min à ~100 ppm : plausible. **Mais** « cette dose » n'a aucun antécédent (la concentration n'est jamais dite) et 50 ppm est une concentration, pas une dose (la dose, c'est concentration × durée, ce que dit la suite). À corriger. Valeurs tirées de fiches de fabricants, norme non lue : le film dit « a le droit », pas « la norme dit », ça passe.
3. **« Il prend la place de l'oxygène »** : simplification admise (affinité 200 à 250 fois, StatPearls ; ATSDR > 200). « Mal de tête… tu te rendors » : symptômes SPF (maux de tête, fatigue, nausées) ; vrai pour un dormeur. Réserve : la norme vise à sonner AVANT ces symptômes (alarme sous ~10 % d'HbCO, de mémoire de la norme, non lu), donc la scène montre un cas où le sommeil a empêché de les sentir ; à ne pas surjouer. Tient. Remplacer « le gaz » par « le monoxyde » (voir correction).
4. **Anatomie** : juste en simplifié. Grille → (filtre charbon, non cité, sans conséquence) → membrane/capillaire → électrode de travail ; électrolyte, contre-électrode, référence non cités : ne rien affirmer sur le nombre d'électrodes (« une électrode » = celle qui touche le gaz, ok). « Une pile » : les modèles secteur existent, ok pour le cas général. « L'air de ta chambre » : cohérent avec le décor, pas un fait.
5. **« Brûle » / « additionne »** : « brûle » = oxydation sans flamme, image acceptée (les faits §11 la proposent) ; nuance technique : un électricien/chimiste peut tiquer, mais l'image est lisible. « L'additionne, minute après minute » : simplification fidèle de l'intégration concentration × durée (les vrais appareils ont aussi une décroissance, non montrée). « Comme ton sang » : le sang accumule aussi (demi-vie 4 à 6 h à l'air), ok. Tient.
6. **Chute** : fidèle à la logique (alarme sur dose intégrée, pas sur seuil instantané). Mais « quand tu en as **trop respiré** » laisse entendre que l'alarme sonne quand le mal est fait ; l'esprit de la norme est l'inverse (sonner avant que le sang n'en ait trop). Et « il ne sent pas le gaz » est faux à la lettre : il le sent tout de suite (le courant), il ne sonne pas tout de suite. À adoucir (correction ci-dessous).
7. **Obligation (21/10/2026)** : « Celui de fumée est obligatoire » vrai (depuis 8 mars 2015). « Celui de CO, non » vrai aujourd'hui : Engie, Selectra (màj septembre 2026) : aucune loi ne l'impose. Une PPL aurait été déposée au Sénat le 12/10/2026 (cabinet d'avocats, source unique, texte non en ligne) : **non confirmée, mais ne change rien au présent** (un dépôt n'est pas une loi). « S'il est de fumée » : des détecteurs combinés fumée + CO existent ; « S'il n'est que de fumée » est plus exact.
8. **Annonce** : l'ordre de grandeur tient (Haegeli 2014 : mortalité 22 % → 11 %, rapport de risque 0,51). Mais les faits du 029 interdisent « divise par deux » sans réserve (analyse rétrospective, 11 % de morts restent, un sac sur cinq ne se gonfle pas). Correction : « gonflé » + « peut ».
9. **Question** : « le tien… fumée, ou CO ? » est fermée, deux camps, vérifiable en dix secondes. Mais elle ne fait pas peur (aucun camp honteux) et un détecteur combiné n'a pas de bonne réponse : ajouter « les deux ? » ferait trois camps. Elle tient telle quelle ; plus forte : « le tien… CO, ou rien ? » (le camp « rien » fait peur, cf. faits §7). Au choix de Merwan, pas une erreur.

## Phrase par phrase
- **accroche** : « Ta chaudière t'empoisonne. Et ton détecteur... ne dit rien. » tient (voir point 1).
- **promesse** : « à cette dose » à corriger ; « Sauf si ce détecteur... n'a jamais su voir ce gaz » tient.
- **scene** : « Le gaz sort de ta chaudière, sans odeur. » à corriger (nommer le monoxyde) ; le reste tient.
- **ouvre** : tient.
- **eclate** : tient.
- **repos** : tient.
- **seuil** : tient (« cette heure » renvoie à la promesse corrigée).
- **zero** : tient.
- **reponse** : tient (« La dose atteint son seuil » cohérent avec 100 ppm : 10 à 40 min).
- **chute** : à corriger (léger).
- **comment** : retouche de précision (« n'est que de fumée »).
- **like** : tient (l'argument « rallume sa chaudière » est utile, non chiffré).
- **abo** : à corriger.
- **boucle** : tient (cohérent avec « Ta chaudière t'empoisonne »).

## Corrections
- promesse : « Normal : à cinquante ppm, il a le droit d'attendre une heure. Sauf si ce détecteur... n'a jamais su voir ce gaz. » (dans `text` : `[50|cinquante] [ppm|pé-pé-èm]`, voix à confirmer)
- scene : « Le monoxyde sort de ta chaudière, sans odeur. Dans ton sang, il prend la place de l'oxygène. Mal de tête... tu te rendors. Au mur, le boîtier compte. »
- chute : « Voilà le secret : il ne sonne pas dès qu'il sent le gaz. Il sonne quand ta dose devient dangereuse. » (option plus proche de l'original : « …quand tu en as respiré assez. »)
- comment (retouche) : « S'il n'est que de fumée, il ne voit pas ce gaz. Jamais. » (le reste inchangé)
- abo : « Prochain dossier : une avalanche... et un sac qui, gonflé, peut diviser par deux ton risque d'y rester. »

## Reste ouvert
- Seuils EN 50291-1 : norme non lue, fiches de fabricants.
- PPL du Sénat du 12/10/2026 : source unique, à ne pas dire ; si elle est votée avant publication, « Celui de CO, non » devient faux (re-vérifier la veille).
- Le ton « tu te rendors » avant l'alarme : tolérable, mais la norme vise à sonner avant les symptômes.

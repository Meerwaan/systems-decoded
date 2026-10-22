# 030 — Contre-vérification du script (2026-10-21)

Lu : les 14 beats de `episode.json`, `docs/faits/030-prise-de-terre.md`. Web : 2 requêtes (Batiweb/ONSE relu ; boucle à fond de fouille : rien de probant en ligne, on s'en tient à Promotelec du dossier de faits). NF C 15-100 non lue.

## Verdict

**5 phrases à corriger** (promesse, scene, repos, zero, comment), 9 tiennent (certaines avec réserve). Erreur de fond : le **hublot** est en verre et plastique, il n'est pas sous tension : un électricien le verrait tout de suite. Deuxième : « le défaut le plus fréquent » colle à « sans broche » un chiffre qui parle de « prises de terre et mises à la terre défectueuses ».

## Points demandés

1. **Machine sous tension, rien n'a sauté / le différentiel attend** : juste pour un **30 mA** (carcasse à 230 V par rapport au sol, aucun courant, ni disjoncteur ni différentiel ne voient rien ; le corps devient le chemin, 100-200 mA >> 30 mA, ça coupe). **Faux avec un différentiel de 500 mA**, fréquent dans un logement ancien sans terre (disjoncteur de branchement) : il ne couperait pas. La voix dit « ton différentiel » sans le calibre → à préciser (promesse). L'accroche affirme « est sous tension » comme un fait chez le spectateur : c'est un scénario (défaut d'isolement + pas de terre) ; acceptable en accroche, laissé ouvert.
2. **230 V / pieds nus, mouillé** : tient (230 V entre carcasse et sol, en TT, sur un défaut franc). « Pieds nus, mouillé » est le bon contexte de risque.
3. **Vocabulaire** : « conducteur de protection » pour le vert-jaune de la machine puis du circuit : juste. « Par la broche de ta prise, il rejoint le tableau… puis la terre » : simplification correcte (il saute le conducteur de terre, sans le confondre avec le conducteur de protection). « La broche de ta prise » : la broche est bien portée par le socle. « Prise de terre : câble de cuivre nu » : juste (25 mm²). **« Sous les fondations » est imprécis** : Promotelec dit « en périphérie des fondations », à fond de fouille ; le piquet, lui, est à côté → « Autour des fondations ».
4. **« Chez toi, ce fil n'arrive nulle part »** : vrai si pas de terre ; mais asserté à tous les spectateurs, dont ceux qui ont une terre → « Mais si chez toi… ». **« Ta main touche le hublot »** : faux, le hublot n'est pas métallique → « le capot ». « Le courant passe par toi… jusqu'au sol » : tient. « Ton différentiel coupe. Après toi » : tient (aucun temps affirmé).
5. **« On rejoue, avec le fil… »** : tient. Courant de défaut ≈ 2 A pour 100 Ω, bien au-dessus de 30 mA ; le tableau voit l'écart (le vert-jaune est hors du tore). « Le courant file dans la terre » est une simplification tolérable (il revient au poste par le sol, la chute le corrige par « un chemin ») ; plus exact : « par le fil vert-jaune, jusqu'à la terre ».
6. **Chute** : tient (§1 et §6 du dossier de faits).
7. **« Sans broche, pas de terre »** : vrai. **« …le défaut le plus fréquent »** : la source (Batiweb) cite « prises de terre et installations de mise à la terre défectueuses (64 %) » en tête des causes, sans base définie ; ce n'est pas « sans broche ». Et **une prise avec broche ne garantit pas une terre reliée** : le film n'en dit rien et la question finale laisse croire « avec broche = bon ». Accroche « ce qui manque se voit sur tes prises » : vrai pour l'absence de broche seulement → « souvent ».
8. **Question « avec broche, ou sans ? »** : bonne (fermée, se vérifie chez soi), mais à poser après « avec broche, pas toujours ».
9. **Annonce** : aucune affirmation fausse. Elle ne porte pas de « fait » (règle des courts) : reste ouvert, pas un point de véracité.

## Phrase par phrase

- accroche : tient (scénario ; ouvert).
- promesse : **à corriger** — 30 mA non précisé ; « ce qui manque » trop général.
- scene : **à corriger** — hublot.
- ouvre : tient.
- eclate : tient.
- repos : **à corriger** — « Sous les fondations » ; « chez toi » asserté.
- seuil : tient.
- zero : **à corriger** — hublot.
- reponse : tient (« file dans la terre » toléré).
- chute : tient.
- comment : **à corriger** — statistique mal rattachée, pas de « avec broche, pas toujours ».
- like : tient.
- abo : tient (sans fait ; ouvert).
- boucle : tient (« Comme ce fil… le jour où, » retombe sur « Ta machine à laver est sous tension »).

## Corrections

- **promesse** : « Ton différentiel marche. Mais il attend… que le courant passe par toi. Et ce qui manque se voit sur tes prises. » → « Ton différentiel trente milliampères marche. Mais il attend… que le courant passe par toi. Et souvent, ce qui manque se voit sur tes prises. » (`text` : `[30|trente]` ; `vo` : « trente milliampères » ; la légende `post.caption` : « souvent » aussi.)
- **scene** : « …ta main se tend vers le hublot. » → « Un fil de phase touche la carcasse : tout le métal est à 230 volts. Pieds nus, mouillé, ta main se tend vers le capot. » (`+capot+` ; l'image doit montrer le métal.)
- **repos** : « Sous les fondations, un câble de cuivre nu : la prise de terre. Elle ne fait rien… tant que tout va bien. Mais chez toi, ce fil… n'arrive nulle part. » → « Autour des fondations, un câble de cuivre nu : la prise de terre. Elle ne fait rien… tant que tout va bien. Mais si chez toi, ce fil… n'arrive nulle part. »
- **zero** : « Sans ce fil, ta main touche le hublot. Le courant passe par toi… jusqu'au sol. » → « Sans ce fil, ta main touche le capot. Le courant passe par toi… jusqu'au sol. »
- **comment** : « Et tes prises ? Sans broche, pas de terre. Dans les logements anciens, c'est le défaut le plus fréquent. En commentaire : chez toi… avec broche, ou sans ? » → « Sans broche, pas de terre. Avec broche… pas toujours. Dans les logements anciens, la terre défectueuse est l'anomalie la plus fréquente. En commentaire : chez toi… avec broche, ou sans ? » (+2 mots ; garder les `[short pause]`.)

## Reste ouvert

- Accroche « est sous tension » : scénario présenté comme fait ; laissée (boucle sacrée).
- « Autour des fondations » : la NF C 15-100 (non lue) fixe l'emplacement exact ; si l'image montre un piquet, adapter.
- Le 64 % n'est pas dit : sa base est inconnue (rapport ONSE non lu).
- Annonce sans fait (règle des courts) : choix de Merwan.
- Temps de coupure du 30 mA : non sourcé, non affiché (bien).

# 028 — Détecteur de monoxyde de carbone : il ne sonne pas quand il sent le gaz, il compte ce que tu respires

Recherche du 21/10/2026, 27 requêtes. Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur. La norme EN 50291-1 elle-même n'a **pas** pu être lue (payante) : ses seuils viennent de fiches de fabricants qui la citent.

## 1. Verdict sur l'angle

**Tient, avec deux ajustements.**
- « Le gaz qui te tue fait marcher sa propre alarme » est **vrai pour le signal, faux pour l'énergie** : la cellule est une pile à combustible dont le courant mesuré vient de l'oxydation du CO (le gaz fournit les électrons que l'électronique lit), mais le courant est de l'ordre du signal, pas de la puissance : le buzzer et la puce sont alimentés par une pile. À dire : « c'est le gaz lui-même qui écrit le signal », jamais « le gaz alimente l'alarme ».
- La chute la plus solide est l'**intégration dans le temps** : à 50 ppm l'alarme est autorisée à attendre 60 à 90 minutes. Elle fait écho au corps, qui lui aussi « compte » (la carboxyhémoglobine s'accumule).
- Pas « vu et revu » sur le compte (aucun dossier sur le CO). Sujet de prévention classique de l'hiver, mais le mécanisme (cellule, comptage) est peu montré.
- Attention : le 001 est déjà un détecteur (de fumée) dans une chambre la nuit. Il faut un autre cadre : chaudière dans la salle de bains ou le garage, gamme de gens qui se couchent tôt, ou l'heure sans scène de sommeil (voir §2).

## 2. La scène

**Cas réel daté (détecteur qui sauve), [S]** — Palluau (Vendée), nuit du dimanche 23 au lundi 24 novembre 2025, vers 2 h du matin : le détecteur réveille un couple de 42 et 44 ans et leurs filles de 8 et 14 ans. Ils appellent les pompiers, qui mesurent « une concentration élevée ». Aucun symptôme : l'alerte était précoce, ils sont rentrés chez eux après aération. L'appareil à l'origine n'est pas précisé. Source : ICI (France Bleu), 24/11/2025. Contexte : 31 interventions CO des pompiers de Vendée en 2024, dont une mortelle.

**Cas réel sans détecteur apparent, [S]** — Béziers (Hérault), nuit du 5 au 6 octobre 2026, vers 1 h 30 : une mère de 37 ans, ses filles de 14 et 12 ans et un bébé de 7 mois, au 4ᵉ étage près de la gare ; quatre avec de « gros maux de tête », hospitalisés, pas de blessés graves ; deux autres enfants et le père, ailleurs dans l'appartement, indemnes. GRDF a sécurisé l'installation. Le détecteur n'est pas mentionné (France 3 Occitanie). Utile : **le CO a touché une partie de la famille seulement**, ce qui contredit « tout le monde en même temps ».

**Cas à éviter** : Pau, un détecteur « n'a sonné qu'une fois » (c'était la pile, et il a ensuite été entendu comme une panne) : [S], résumé de recherche, non ouvert.

**Instant fort proposé (autre que « 03:07 »)** : plutôt qu'une heure de nuit, un **compte à rebours de l'alarme** : le chrono de l'en-tête compte les minutes que le détecteur a le droit d'attendre (à 50 ppm : 60 à 90 min ; à 300 ppm : 3 min). L'accroche peut ouvrir sur **un seuil** : « Cinquante ppm. Ton détecteur a le droit d'attendre une heure. » Ou sur la scène de Palluau (« Deux heures du matin. Une alarme. Et personne n'a mal à la tête. ») : le C = pourquoi personne n'a mal alors que l'air est déjà mauvais. À valider.

**Ce qu'on peut montrer** : une salle de bains / un garage avec chaudière ou chauffe-eau mal ventilé (aux rayons X), le gaz invisible rendu par une teinte (jamais une fumée : c'est incolore), un boîtier au mur du couloir, une pièce, des chambres.

## 3. Le système qui sauve

Un boîtier de la taille d'une paume, sur pile (ou secteur), à **cellule électrochimique**, norme **EN 50291-1** (NF EN 50291 : la mention à chercher sur l'emballage) [S]. Vendu en grande surface et en ligne. **Pas obligatoire en France** (§5 Chiffres) : seule l'inspection annuelle de la chaudière gaz l'est (décret 2009-649) [S]. Le détecteur de fumée, lui, est obligatoire dans tous les logements depuis le 8 mars 2015 [S, connaissance publique, non rouvert ici].

## 4. Le mécanisme ouvert (6 à 8 pièces)

1. **Entrée de gaz / membrane** : le CO traverse une membrane perméable aux gaz, à travers un capillaire qui limite la diffusion (c'est ce qui rend le courant proportionnel à la concentration) [S : Winsen ; brevets].
2. **Électrode de travail (anode)** : platine ; catalyse l'oxydation du CO. Réaction : CO + H₂O → CO₂ + 2 H⁺ + 2 e⁻ (équivalent : 2 CO + 2 H₂O → 2 CO₂ + 4 H⁺ + 4 e⁻) [S, deux sources concordantes].
3. **Électrolyte** : typiquement acide sulfurique (parfois hydroxyde de potassium) [S].
4. **Contre-électrode (cathode)** : l'oxygène de l'air est réduit en eau, ce qui boucle le circuit [S].
5. **Électrode de référence** : (cellules à trois électrodes) maintient une tension stable [S : Winsen]. Les détecteurs bon marché utilisent parfois deux électrodes : à ne pas affirmer.
6. **Le courant** : proportionnel à la concentration de CO (des microampères au plus) [S]. « Pile à combustible conçue pour produire un signal et non de la puissance » [S, brevet US 6129825 via recherche, non ouvert]. **Le gaz fournit les électrons mesurés ; l'énergie du buzzer vient d'une pile** [S].
7. **L'électronique d'intégration** : ne compare pas un seuil instantané ; accumule concentration × durée. La norme impose des **zones de temps** (§5) [S].
8. **Buzzer + voyant + bouton d'essai** ; depuis la révision de 2018, signal de **fin de vie** obligatoire (sonore et visuel) [S : Kidde, résumé de recherche].

**Ce qui déclenche** : la dose intégrée. **L'ordre** : le gaz entre → oxydation → courant → la puce compare la courbe concentration/temps à la table de la norme → alarme.

**Cellule** : durée de vie des cellules du commerce : 5 ans pour un modèle professionnel BETA (fiche, [P-fabricant], « garantis pendant 5 ans » ; conformité annoncée EN 50194, **pas** EN 50291 : à ne pas confondre) ; 7 ans pour les anciens Kidde / FireAngel CO-9X (EN 50291-1:2010) ; **10 ans** pour les modèles récents (Kidde, FireAngel FA3313, EN 50291-1:2018) [S : fiches produits]. Test-Achats dit « 5 ans maximum » [S]. À dire : « entre cinq et dix ans selon le modèle ; c'est écrit sur la notice ».

## 5. Chiffres

**France**
- Environ **1 300 épisodes accidentels** par an, près de **3 000 personnes** intoxiquées — Santé publique France, communiqué du 12/12/2022 [P].
- « **Près de 4 000 intoxications** par an » — page SPF « Monoxyde de carbone », mise à jour 13/05/2020, année de référence non précisée [P]. (Les deux chiffres ne se recouvrent pas : le 3 000 est « accidentelles », le 4 000 englobe sans doute plus de cas ; ne donner qu'un ordre de grandeur.)
- **Une centaine de décès par an** : « première cause de mortalité par intoxication accidentelle dans l'habitat » — préfecture de l'Eure / ARS Normandie, page du 31/10/2023 [S] ; et SPF (page anglaise) « environ 100 décès signalés chaque année » [S]. Le chiffre de 5 000 victimes de Futura/DGS est sans source précise : ne pas l'utiliser.
- **Plus de 75 %** des cas surviennent pendant la saison de chauffe — SPF [P]. Autres mesures régionales : 92 % en 2023 en Centre-Val de Loire (ARS) [S].
- Sources : appareils à gaz, bois, charbon, fioul, butane, propane, essence ; **chauffages d'appoint mobiles, groupes électrogènes, chauffages de fortune, braseros, barbecues utilisés pour chauffer** — SPF, 12/12/2022 [P]. Régionalement : « les chaudières et chauffe-eau défectueux : 54 % » en Île-de-France 2024 (228 épisodes, 611 personnes) ; 59 % liés à une chaudière en Centre-Val de Loire 2023 (37 signalements, 84 personnes, 67 hospitalisées) [S, ARS]. 80 % des intoxications touchent des particuliers [S].
- **Régional 2024** : Auvergne-Rhône-Alpes 178 épisodes, 692 personnes (2023 : 147 épisodes, 336 victimes) [S, ARS]. Ne citer qu'avec « dans ta région » si besoin.

**Le corps**
- Le CO se fixe à l'hémoglobine avec une affinité **200 à 250 fois** celle de l'oxygène — StatPearls (NIH/NCBI) [S : revue médicale] ; ATSDR (CDC) : « plus de 200 fois » [P].
- Il décale vers la gauche la courbe de dissociation de l'oxyhémoglobine : l'oxygène restant est moins bien libéré [S, StatPearls].
- Symptômes selon le taux de carboxyhémoglobine (HbCO), à prendre avec prudence (« corrélation faible ») : 10 à 20 % = maux de tête, vertiges, nausées ; plus de 30 % = troubles neurologiques, syncope, arythmie ; 50 à 60 % et plus = souvent mortel [S, StatPearls].
- Demi-vie de l'HbCO : 4 à 6 h à l'air, 60 à 90 min sous oxygène pur, 20 à 30 min en caisson hyperbare [S, StatPearls].
- Un **oxymètre de pouls** (le doigt) ne distingue pas HbCO et oxyhémoglobine : lecture faussement rassurante [S, StatPearls]. Détail utile pour une phrase d'autopsie : « même le capteur de l'hôpital se trompe ».
- SPF : une intoxication importante peut conduire au coma et à la mort « parfois en quelques minutes » [P] ; séquelles neurologiques tardives (syndrome parkinsonien, surdité, etc.) possibles ; la femme enceinte et le fœtus particulièrement exposés (l'hémoglobine fœtale a encore plus d'affinité) [P, SPF].
- Propriétés : incolore, inodore, insipide, non irritant [P, SPF + StatPearls]. Densité : 1 ppm = 1,14 mg/m³ à 25 °C (INRS) → masse molaire ≈ 28, quasi celle de l'air (≈ 29) : le gaz **se mélange à l'air**, ne tombe pas au sol et ne monte pas au plafond [O, calcul à partir de la fiche INRS FT 47 ; densité elle-même non lue].
- VLEP professionnelle France (2019) : 20 ppm sur 8 h, 100 ppm court terme [P, INRS] — chiffres de comparaison avec 50 ppm.

**La norme EN 50291-1, par fiches de fabricants (norme non lue)** [S, concordant sur plusieurs fiches]
- **30 ppm : pas d'alarme avant 120 min** (test de non-déclenchement).
- **50 ppm : alarme entre 60 et 90 min.**
- **100 ppm : entre 10 et 40 min.**
- **300 ppm : en moins de 3 min.**
- Une révision de la norme est demandée pour des seuils plus bas (page BSI) : ne pas dire « c'est la norme pour toujours ».
- Détecteur industriel BETA SE 315 : 50 ppm/70 min, 100 ppm/20 min, 300 ppm/1 min, EN 50194 — **autre norme**, ne pas mélanger.

**Obligation** : le détecteur de CO **n'est pas obligatoire** en France ; Engie (guide) le dit explicitement, en opposition au détecteur de fumée [S]. Plusieurs propositions de loi (Sénat, 23/02/2024 ; Assemblée, 19/03/2024 et 29/10/2024, cette dernière retirée le 19/11/2024) ; **aucun vote final trouvé** : statut à reverifier sur senat.fr / assemblee-nationale.fr avant d'écrire « bientôt obligatoire ». Obligations réelles : entretien annuel de la chaudière gaz (décret 2009-649), diagnostic gaz en location (décret 2016-1104) [S].

**Prix** : non sourcé (aucun chiffre fiable trouvé) ; « quelques dizaines d'euros » [O, connaissance générale, à vérifier avant de dire un nombre].

## 6. Ce qui retourne une idée reçue (chute)

1. **« Il ne sonne pas parce qu'il sent le gaz : il sonne parce qu'il a compté ce que tu as respiré. »** À 50 ppm, la norme l'autorise à attendre 60 à 90 min ; à 300 ppm, 3 min. Idée reçue : « un détecteur sonne dès que le gaz arrive ». [S, fiches de fabricants citant EN 50291-1]. Elle est vraie aussi pour ton sang : le sang, lui, compte aussi (HbCO monte avec la durée).
2. **« Le gaz qui te tue écrit lui-même le signal de ton alarme »** : le courant mesuré vient de l'oxydation du CO sur l'électrode. Vrai, mais **le buzzer a une pile** ; ne jamais dire « le gaz alimente l'alarme ». [S]
3. **« Le CO tombe au sol / monte au plafond »** : il se mélange à l'air (densité ≈ 0,97), donc la hauteur n'est pas l'argument principal (conseils divergents dans les sources : 1,5 m, plafond à 30 cm du mur) [O].
4. **« Je sentirais l'odeur »** : aucune odeur, aucune irritation. Ce qu'on sent, ce sont des maux de tête, nausées, fatigue (SPF). [P]
5. **« Le détecteur de fumée me protège aussi »** : un détecteur de fumée ne voit pas le CO ; ils ne se remplacent pas [S, bon sens, conseils des pompiers de Vendée : « en plus du détecteur de fumée »].

## 7. La question du commentaire

- « **Ton détecteur de CO : tu en as un… ou pas ?** » — fermée, deux camps, l'un fait peur (« pas »). Vérifiable chez soi en dix secondes.
- « **Ta chaudière, la dernière fois qu'on l'a entretenue : cette année… ou jamais ?** » — lecture chez soi (autocollant du dernier entretien), l'un fait peur.
- « **Sur ton détecteur, la date de fin de vie : elle est dépassée… ou pas ?** » — lecture chez soi (date imprimée / signal de fin de vie).

(à éviter : « tu l'as déjà entendu sonner ? », « tu le tentes ? »)

## 8. L'histoire du système

Les cellules électrochimiques à gaz dérivent des travaux de **Leland Clark** (électrode à oxygène, années 1950) et des premières « piles à combustible de détection » ; les premiers détecteurs de CO domestiques datent des années 1980-90 (États-Unis, puis Royaume-Uni). **Non vérifié dans cette recherche** : à ne pas dater plus précisément sans source. La norme européenne EN 50291 existe depuis 2001 (EN 50291:2001 mentionnée sur des appareils Kidde) [S].

## 9. Pour l'annonce (dite à la fin du 027, la voie de détresse)

« Chez toi, un gaz sans odeur tue une centaine de personnes par an. Un boîtier veille. » (16 mots)

Fait sûr : une centaine de décès par an en France (ARS Normandie / SPF [S]). Alternative : « Chez toi, un gaz sans odeur touche trois mille personnes par an. Un boîtier le guette. » (15 mots, SPF 2022 [P]).

## 10. À ne pas dire

- « Le gaz alimente / recharge l'alarme » (c'est le signal, pas l'énergie).
- « Le détecteur de CO est obligatoire » (non) ni « va le devenir » (aucun vote trouvé).
- « 250 fois » comme un chiffre unique : les sources disent 200 à 250 (ATSDR : plus de 200).
- « Le CO est plus lourd/plus léger que l'air » (il est quasi identique ; la hauteur d'installation n'est pas tranchée).
- Les valeurs de l'EN 50291-1 comme si on avait lu la norme : on cite « les fabricants qui l'appliquent ». Ne pas confondre avec EN 50194 (détecteurs fixes industriels).
- « Une centaine de morts » sans « par an » ; « 5 000 victimes » (Futura, sans source précise).
- « Le détecteur de Pau n'a sonné qu'une fois, donc il est en panne » (une sonnerie isolée signifie plutôt pile faible, d'après les pompiers cités).
- Que le CO n'est dangereux qu'avec une vieille chaudière : sources aussi = groupes électrogènes, braseros, voiture moteur allumé en garage.
- La gravité proportionnelle au taux d'HbCO : la corrélation est faible (StatPearls).

## 11. Ce que la voix peut dire (dix phrases courtes, vraies)

1. Le monoxyde de carbone n'a ni odeur, ni couleur, ni goût.
2. En France, il tue une centaine de personnes chaque année.
3. Plus de trois cas sur quatre arrivent pendant le chauffage.
4. Dans ton sang, il prend la place de l'oxygène.
5. Il s'accroche à l'hémoglobine plus de deux cents fois mieux que lui.
6. Un détecteur de fumée ne le voit pas.
7. Dans le boîtier, le gaz brûle sur une électrode.
8. Cette réaction fait un petit courant, proportionnel au gaz.
9. À cinquante ppm, il a le droit d'attendre une heure.
10. À trois cents ppm, il doit sonner en moins de trois minutes.

## 12. Sources

- Santé publique France — page « Monoxyde de carbone » (santepubliquefrance.fr/exposition-a-des-substances-chimiques/monoxyde-de-carbone) : « près de 4 000 intoxications » par an, hiver ; màj 13/05/2020. Lue.
- Santé publique France — communiqué du 12/12/2022 (santepubliquefrance.fr/presse/les-intoxications-au-monoxyde-de-carbone-peuvent-concerner-chacun-de-nous-adoptez-les-bons-1) : 1 300 épisodes, près de 3 000 personnes, sources, symptômes, gestes. Lue.
- Santé publique France — pages anglaises « Intoxications au CO : données » et « effets sur la santé » (/en/monoxyde-de-carbone/data ; invs.santepubliquefrance.fr/en/monoxyde-de-carbone/what-are-health-effects-carbon-monoxide-poisoning) : > 75 % en saison de chauffe ; incolore/inodore ; séquelles ; femmes enceintes. Lues. « 100 décès signalés / an » : vu dans le résumé de recherche seulement.
- Préfecture de l'Eure / ARS Normandie (eure.gouv.fr, 31/10/2023) : « une centaine de décès », première cause de mortalité par intoxication accidentelle dans l'habitat. Lue.
- ARS Centre-Val de Loire, bilan 2023 ; ARS Île-de-France, bilan 2024 ; ARS Auvergne-Rhône-Alpes, bilan 2024 : résumés de recherche, pages non ouvertes.
- StatPearls « Carbon Monoxide Poisoning » (ncbi.nlm.nih.gov/sites/books/NBK557888/) : affinité 200 à 250, courbe décalée, HbCO et symptômes, demi-vies, oxymètre. Lue. ATSDR (CDC) tp201-c3 : « plus de 200 fois » : résumé de recherche.
- INRS, fiche toxicologique FT 47 : seul le tableau des VLEP et 1 ppm = 1,14 mg/m³ ont pu être extraits ; le reste du PDF est illisible.
- Winsen « Electrochemical CO sensors » (winsen-sensor.com/knowledge/electrochemical-co-sensors.html) : trois électrodes, membrane, électrolyte H₂SO₄ ou KOH, courant proportionnel, durée de vie 2 à 5 ans (capteur de type industriel). Lue. Brevets US 6129825 et autres (fonctionnement « pile à combustible », deux électrodes, CO oxydé d'un côté, O₂ consommé de l'autre) : résumés de recherche, non ouverts.
- Fiche BETA SE 315 EC (hellopro.fr), détecteur industriel : 50/70 min, 100/20 min, 300/1 min, EN 50194, capteur 5 ans. Lue.
- Fiches Kidde / FireAngel (CO-9X, FA3313) et manuel CO-9X (northantsfire.gov.uk) : EN 50291-1:2010+A1:2012 (7 ans) et :2018 (10 ans) ; le manuel n'a pas livré de tableau de seuils.
- Seuils EN 50291-1 (30/50/100/300 ppm) : fiches de fabricants relevées par la recherche ; page BSI sur la révision demandée (standardsdevelopment.bsigroup.com/projects/9025-11770). Norme non lue.
- Engie (guide détecteur CO) : « aucune loi n'impose » ; propositions de loi : senat.fr/leg/ppl23-357.html, questions.assemblee-nationale.fr (l16b2368, l17b0504 / l17b0606) : lues en résumé seulement ; aucun vote final trouvé.
- ICI (France Bleu) — Palluau, Vendée, 24/11/2025 : lue. France 3 Occitanie — Béziers, 6/10/2026 : lue (détecteur non mentionné). ICI Béarn Bigorre — Pau : résumé seulement.
- Test-Achats (détecteurs de CO, durée de vie, installation) ; Reichelt (hauteur 1,5 m) ; Neozone (« jamais au plafond ») : résumés de recherche, avis divergents, non utilisés pour l'écriture.

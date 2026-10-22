# 030 — Prise de terre : le chemin que la terre donne au courant pour que le différentiel coupe avant que tu touches

Recherche du 2026-10-21, 24 requêtes web. Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur / calcul.
**Limite générale** : le texte de la NF C 15-100 n'a pas été lu (payant). Les valeurs viennent d'une fiche technique du diagnostic électricité qui en reproduit le tableau B.1 (A5), d'un guide de fabricant d'appareils de mesure et de Promotelec. Les temps de coupure (0,2 s, 300 ms) ne sont pas confirmés par une source française : voir « À ne pas dire ».

## 1. Verdict sur l'angle

**Tient, avec deux ajustements.**
- Chute « la terre ne te protège pas seule : elle fait couper le différentiel avant que tu touches » : **vraie et plus fine que l'idée reçue** (« la terre évacue le courant »). La terre fait deux choses : elle donne au défaut un chemin, donc un courant assez fort pour déclencher ; elle garde la carcasse près du potentiel du sol pendant ce temps. Sans différentiel, une terre à 100 Ω laisse la carcasse à ≈ 200 V (calcul illustratif, §4) : elle ne protège pas seule.
- **Ajustement 1** : le 30 mA protège aussi une machine **sans** terre, mais **après** le premier contact : c'est le corps qui est le chemin du défaut. La phrase « sans terre, rien ne coupe » serait fausse. La vraie phrase : sans terre, le différentiel ne coupe qu'une fois que tu as touché.
- **Ajustement 2** : « 100 Ω » n'est pas LA règle ; c'est la valeur pour un différentiel général de 500 mA. Avec un 30 mA, le tableau donne « > 500 Ω » (règle : R × IΔn ≤ tension limite). Ne jamais dire « la norme exige 100 Ω » sans dire pour quel différentiel.
- Sujet déjà vu sur les réseaux ? Le principe (« la prise de terre, ça sert à quoi ») est un contenu de bricolage banal, mais **le chemin complet du courant de défaut, jusqu'au poste, en 3D, est rare**. Le 004 a montré le différentiel : le 030 doit montrer le **chemin** et le **potentiel de la carcasse**, pas la bobine.

## 2. La scène

Pas de cas daté retenu (aucune source lue ne décrit un accident précis de machine à laver sans terre). **Scénario typique** :
- Chez toi, ancienne machine à laver, joint de la résistance de chauffe ou fil de la pompe usé : la **phase touche la carcasse métallique** (défaut d'isolement). Rien ne se voit, rien ne claque.
- Machine en marche, pieds nus sur le carrelage mouillé de la buanderie : tu poses la main sur le capot et l'autre sur le robinet.
- Chiffres sourcés autour : environ 3 000 personnes aux urgences chaque année après une électrisation accidentelle, 34 décès accidentels par électrocution en 2022 [S, Batiweb, article du 15/05/2025, d'après l'ONSE/Promotelec].
- **Ce qu'on peut montrer de vrai** : la pièce, la machine aux rayons X (carcasse en verre, isolation et phase pleines), le tableau, le fil vert-jaune qui descend jusqu'au piquet ou à la boucle de cuivre nu, le sol en coupe, la liaison vers le poste. La **tension de la carcasse** comme nombre dans l'en-tête (voir §4, illustrative, à étiqueter « exemple »). Le chrono réel : en dixièmes de seconde jusqu'à la coupure (voir §4 pour ce qui est sourcé).

## 3. Le système qui sauve

La **mise à la terre** : relier par un fil conducteur les masses métalliques des appareils (celles qui risquent d'être mises accidentellement sous tension après un défaut d'isolement) à une **prise de terre**. Elle est toujours associée à un dispositif de coupure [P, Chauvin Arnoux, guide de la mesure de terre ; Promotelec].
- **Régime TT** (habitat en France, réseau de distribution public 230/400 V) : le **neutre** est relié à la terre côté distributeur (au poste), les **masses** de l'installation sont reliées à **une prise de terre propre au logement**, distincte. Le courant de défaut revient au poste **par le sol** [S, cours ENSICAEN et Vialis ; confirmé par le schéma Chauvin Arnoux « Rtransfo / Rterre »]. Le distributeur n'a aucune part dans ta prise de terre.
- **Qui l'a** : dans le neuf, toutes les pièces, depuis la NF C 15-100 de 1991 [S, IZI by EDF, Engie] ; dans l'existant, pas d'obligation (la norme n'est pas rétroactive) [S, Promotelec : « n'est pas obligatoire mais vivement recommandé »].

## 4. Le mécanisme ouvert : pièces et chemin

**Chemin du courant de défaut** (régime TT) : phase → défaut d'isolement → **masse** (carcasse) → **conducteur de protection** (vert-jaune) → **borne principale de terre** → **conducteur de terre** → **prise de terre** → **sol** → prise de terre du neutre au poste → neutre → transformateur → retour dans la phase. [P pour les éléments : Chauvin Arnoux ; Promotelec].

Pièces, avec le mot juste :
1. **Prise de terre** : la partie enterrée. Trois façons (Promotelec [P]) : **boucle à fond de fouille** (cuivre nu 25 mm² ou acier galvanisé 95 mm², à au moins 60 cm de profondeur, en périphérie des fondations) ; **tranchée horizontale** (même câble, à au moins 1 m, longueur d'au moins 20 m) ; **piquet(s)** en acier galvanisé d'au moins 2 m (la plus répandue), reliés entre eux par du câble isolé 16 mm² ou cuivre nu 25 mm². Interdit : canalisations métalliques d'eau ou de gaz comme prise de terre ; pièces métalliques plongées dans l'eau.
2. **Conducteur de terre** : relie la prise de terre à la borne principale de terre. Cuivre nu 25 mm² enterré (Promotelec, visuel). Dans les schémas Chauvin Arnoux : « cuivre nu > 25 mm² ».
3. **Barrette de mesure (ou de coupure / sectionnement)** : ouverte, elle isole la prise de terre pour la mesurer. Promotelec : « mesurer la résistance… barrette de coupure ou barrette de mesure ouverte, à l'aide d'un ohmmètre ». Sur une page Promotelec, c'est la **borne principale de terre** qui « permet de déconnecter la prise de terre de l'installation afin de mesurer sa résistance » : les deux rôles sont souvent confondus dans une même pièce. Dire « barrette de mesure » pour la pièce qui s'ouvre.
4. **Borne principale de terre** (ou barrette principale) : relie le conducteur de terre, la liaison équipotentielle principale et le conducteur principal de protection ; dans le tableau ou séparée [P, Promotelec ; Legrand].
5. **Conducteurs de protection**, repérés **vert-jaune**, vers chaque circuit et chaque masse [P, Promotelec].
6. **Liaison équipotentielle principale** : relie à la borne principale les éléments conducteurs (canalisations d'eau, de gaz, chauffage, armatures, huisseries métalliques). **Liaison équipotentielle locale (ou supplémentaire)** en salle de bains [Legrand, Chauvin Arnoux]. Sections non lues : ne pas les chiffrer.
7. **Socle de prise de courant** : prise française à deux alvéoles et un contact de terre ; la broche de terre est portée par le socle [S, Legrand : « borne de terre / broche de terre »]. Le détail mâle/femelle n'a pas été sourcé : voir le modèle réel avant de le dessiner.
8. **Le différentiel** (déjà au 004) : il mesure l'écart entre le courant de phase et celui du neutre. Le courant qui part par le sol est justement cet écart.

**Pourquoi la terre est nécessaire à la coupure** : la carcasse touche la phase ; le courant passe par la terre ; le tableau voit « il en sort plus qu'il n'en revient » → le différentiel coupe. Sans conducteur de protection, ce courant n'a pas de chemin et la carcasse reste sous tension, en attente.

**Valeur (la règle)** — condition en schéma TT : **R de la prise de terre des masses × IΔn ≤ tension limite UL** [S/P : cours + guide Chauvin Arnoux]. UL = **50 V** en local sec, **25 V** en local humide ou immergé (« cette limite peut être plus faible pour des milieux humides ou immergés », Chauvin Arnoux [P] ; 25 V : cours seulement [S]). Valeurs maximales de la prise de terre en fonction de la sensibilité du différentiel, tableau B.1 de la NF C 15-100/A5 reproduit par la fiche du diagnostic électricité [P, fiche eduscol 9930] : 20 A → 2,5 Ω · 10 A → 5 · 5 A → 10 · 3 A → 17 · 1 A → 50 · 650 mA → 77 · **500 mA → 100 Ω** · 300 mA → 167 · 100 mA → 500 · **30 mA → > 500 Ω**. (Le calcul brut à 30 mA donnerait 50 V / 0,03 A ≈ 1 667 Ω ; le tableau s'arrête à « > 500 ».)
- **Valeur d'usage** : 100 Ω est la limite du différentiel général 500 mA des tableaux d'abonné classiques ; c'est le chiffre qu'on entend partout. Avec des différentiels 30 mA, le tableau est bien plus large (> 500 Ω). Le Guide Legrand donne une autre grille (38,5 · 50 · 83 · 830 Ω…) qui paraît calculée avec 25 V : **les grilles diffèrent selon la tension limite choisie**. Préférer « moins de 100 Ω » comme repère de bonne terre et ne pas en faire un seuil réglementaire absolu.
- **Ce qu'exige le Consuel** : **non établi**. Aucune source officielle ouverte ; des témoignages de forum disent que la valeur n'est pas toujours demandée ou mesurée. Ne rien affirmer.
- **Mesure** : à l'ohmmètre / contrôleur de terre, **barrette ouverte**. Méthodes (Chauvin Arnoux [P]) : **3 pôles (méthode des 62 %)** avec deux piquets auxiliaires (H injecte le courant, S mesure le potentiel, R = U / I) ; triangle à deux piquets ; variante à un piquet ; **mesure de boucle** (en TT seulement, sans piquet). Il faut aussi mesurer la résistivité du sol : humus 20-100 Ω·m, sable siliceux 50-500, calcaires tendres 300-500, sol pierreux sous gazon 1 500-3 000 [P, même guide]. Ordres de grandeur, ne pas afficher sans « selon le sol ».

**Calcul illustratif du film (à étiqueter « exemple »)** [O] : prise de terre du logement Ra = 100 Ω, prise du neutre au poste Rn ≈ 10 Ω (valeur de cours ; **non sourcée pour Enedis**, le guide dit seulement « quelques ohms » côté distributeur). Courant de défaut = 230 / (100 + 10) ≈ **2,1 A** ; tension prise par la carcasse = 100 × 2,1 ≈ **209 V**. Avec une terre à 20 Ω : 230 / 30 ≈ 7,7 A, carcasse ≈ 154 V (exemple de cours ENSICAEN [S]). **Un défaut à 2 A ne fait pas sauter un disjoncteur de 16 A** (rappel du 016) : sans différentiel, la carcasse reste à ≈ 200 V. Avec un 30 mA : le courant de défaut est ≈ 70 fois sa sensibilité, il coupe. À sa limite de 30 mA, la carcasse n'est qu'à Ra × 0,03 = 3 V (pour 100 Ω).
- **Sans terre** : la carcasse se met à la tension de la phase (≈ 230 V par rapport au sol) et reste ainsi sans qu'aucun courant ne circule : le différentiel ne voit rien. Quand tu touches, le corps devient le chemin. Résistance du corps : cours donnent 1 000 à 2 000 Ω (non lus à la source) → de l'ordre de 100 à 200 mA [O, 230 V / 1 000-2 000 Ω], donc au-delà des seuils de fibrillation de l'INRS ; seul un 30 mA coupe ensuite. **Le temps de coupure réel d'un différentiel 30 mA n'a pas été sourcé** (voir « À ne pas dire »).

## 5. Chiffres

| Fait | Source | Niveau |
| --- | --- | --- |
| Effets du courant alternatif : 0,5 mA perçu · 5 mA secousse · **10 mA contraction, on ne lâche plus** · 25 mA muscles respiratoires bloqués (asphyxie au-delà de 3 min) · **40 mA pendant 5 s ou 50 mA pendant 1 s : fibrillation ventriculaire** | INRS, page « Accidents d'origine électrique » | P |
| 82,6 % des installations de plus de 15 ans ont au moins une anomalie (baromètre ONSE 2025) ; 83 % en 2024 | Batiweb 15/05/2025 ; question écrite Sénat n° 11619 (9/05/2024) | S |
| **Prise de terre et mise à la terre défectueuses : 64 % des anomalies** (l'anomalie la plus fréquente, mêmes 64 % en 2024 et 2025) ; 46 % matériels vétustes ; 41 % risques de contacts directs | Batiweb ; Sénat | S |
| Parties communes d'immeubles : 90 % d'anomalies, dont 85 % de défauts de prise de terre (2024) ; 16,6 millions de logements collectifs au 1/01/2023 ; pas de diagnostic obligatoire des parties communes | Sénat n° 11619 (question, à partir du baromètre 2024) | S |
| 20 à 35 % des incendies d'habitation ont une source électrique (153 100 sinistres en 2022) | Batiweb ; Sénat | S |
| ≈ 3 000 admis aux urgences par an après électrisation ; 34 décès accidentels par électrocution en 2022 | Batiweb d'après ONSE | S |
| Terre obligatoire dans toutes les pièces du neuf depuis **1991** ; avant 1969 seules les pièces humides, **1969** : terre pour pièces d'eau | Promotelec (« avant 1969 seules les pièces humides »), IZI by EDF, Engie | S |
| Existant : mise à la terre non obligatoire, vivement recommandée (demander au syndic par lettre recommandée) | Promotelec | S/P |
| Immeuble collectif sans prise de terre : une étiquette sur le tableau le signale ; l'installation doit alors être protégée par des différentiels 30 mA et, dans la cuisine, une équipotentialité entre canalisations métalliques, contact de terre des prises et masses des gros appareils (lave-linge, four…) | Fiche technique diagnostic électricité (eduscol 9930) | P |
| Diagnostic électrique : à la vente si l'installation a plus de 15 ans ; valable 3 ans à la vente, 6 ans à la location ; il contrôle notamment le différentiel et la prise de terre ; n'est pas un contrôle de conformité | arrêté du 28/09/2017, via FFB, Obat, notaires (texte non lu) | S |

## 6. Ce qui retourne une idée reçue (chutes candidates)

1. **« La terre ne te protège pas seule : elle fait couper le différentiel avant que tu touches. »** (recommandée) — tient (§4). Précisions possibles : « elle ne sert pas à évacuer l'électricité, elle sert à faire de la place pour un courant qui fait réagir le tableau ».
2. **« Le fil vert-jaune ne sert à rien… tant qu'il ne se passe rien. Il n'a un travail que le jour du défaut. »** — vrai, mais moins fort.
3. « Une prise sans terre qui marche n'est pas une prise qui protège » — vrai (la machine marche sans rien), mais c'est l'accroche plus que la chute.
Écartée : « la terre fait fuir le courant dans le sol » (c'est l'idée reçue elle-même, simplificatrice : le courant revient au poste par le sol, pas « disparaît »).

## 7. La question du commentaire

Fermées, à deux camps, lues chez soi :
1. **« Tes prises : avec une broche de terre… ou sans ? »** — la meilleure. Une prise sans broche : deux trous seulement, fiches plates.
2. « Ta machine à laver, elle est branchée sur une prise… avec terre ou sans ? » (même lecture, plus ciblée).
3. « Sur ton tableau, une étiquette "absence de prise de terre" : oui ou non ? » (elle existe en immeuble collectif ; fiche eduscol).
Éviter « tu le savais ? », « tu as déjà… ? ».

## 8. L'histoire

La NF C 15-100 date de 1991 dans sa forme actuelle ; la prise de courant avec terre a été imposée dans les pièces d'eau en 1969, étendue à toutes les pièces du neuf en 1991 [S, IZI by EDF, Promotelec]. Pas de fait d'inventeur sourcé. Ne pas raconter d'invention de la mise à la terre. Pour la coda éventuelle : un quizz historique est possible mais non sourcé ici.

## 9. Pour l'annonce (dite à la fin du 029, l'airbag d'avalanche)

Proposition : « La prochaine fois : un fil vert-jaune, enfoncé sous ta maison, qui ne sert à rien… jusqu'à ce que ça arrive. » (18 mots, à resserrer.)
Version 15 mots : « Prochain dossier : un fil vert-jaune qui descend sous ta maison. Il ne sert à rien… jusqu'au jour du défaut. »
Seul fait : le fil vert-jaune relie la masse de tes appareils à la prise de terre, enterrée sous la maison (Promotelec).

## 10. À ne pas dire

- « La norme impose 100 Ω » : seulement pour un différentiel de 500 mA (tableau B.1) ; à 30 mA > 500 Ω. Et 50 V pour local sec, 25 V pour local humide (25 V : cours uniquement).
- « Sans terre, rien ne coupe » : un 30 mA coupe quand le courant passe par le corps. Dire « après ».
- « Le courant file dans le sol et disparaît » : il revient au poste par le sol.
- « Le Consuel exige X Ω » : non établi. « La terre est obligatoire partout depuis 1991 » : faux, c'est le neuf et les rénovations lourdes ; l'existant n'est pas concerné.
- « 0,2 s » et « 300 ms » : temps de coupure vus uniquement sur des forums britanniques (BS 7671) et non confirmés par un texte français ; ne pas les afficher. Un « ≈ 30 ms » pour un défaut franc reste un ordre de grandeur non sourcé.
- Ne pas dire « conducteur de terre » pour le fil vert-jaune d'un circuit : c'est le **conducteur de protection**. Le conducteur de terre est celui qui va du coffret à la prise de terre. (La page Legrand FAQ les confond : « conducteur de protection (ou conducteur de terre) » — ne pas copier.)
- Ne pas parler du neutre du poste comme d'une « terre d'Enedis qui te protège » : en TT, ta prise de terre est la tienne.
- Rn = 10 Ω : valeur de cours, pas une donnée de réseau. Les ≈ 209 V et 2,1 A sont un exemple.
- « Le fil vert-jaune est la terre » : il la relie ; la terre, c'est le sol.

## 11. Ce que la voix peut dire

1. Un fil vert-jaune descend sous ta maison.
2. Il ne sert à rien. Jusqu'au jour du défaut.
3. En régime TT, ta maison a sa propre terre.
4. Le courant de défaut revient au poste par le sol.
5. La terre ne fait pas disparaître le courant.
6. Elle lui donne un chemin pour que le tableau le voie.
7. Sans terre, la carcasse reste sous tension, sans bruit.
8. À partir de dix milliampères, on ne lâche plus. (INRS)
9. Quarante milliampères pendant cinq secondes suffisent pour faire fibriller le cœur. (INRS)
10. Moins de cent ohms : une bonne terre avec un différentiel de cinq cents milliampères.
(Phrase avec un nombre de calcul : « Avec cent ohms, la carcasse monte vers deux cents volts » — dire « environ », « dans un exemple ».)

## 12. Sources

- Chauvin Arnoux, *Guide de la mesure de terre* (PDF) — https://www.chauvin-arnoux.com/sites/default/files/documents/dc_f_guide-terre_ed4.pdf : lu (pdftotext). Pourquoi la terre, 50 V / 100 Ω = 50 / 0,5, tableau par sensibilité, composants, méthodes 3P et 62 %, résistivités.
- Fiche technique « Résistance de terre — NF C 15-100/A5 », eduscol STI — https://sti.eduscol.education.fr/sites/eduscol.education.fr.sti/files/ressources/pedagogiques/9930/9930-resistance-de-terre-nfc-15100-2018-05-13.pdf : lu. Tableau B.1, immeuble collectif sans prise de terre.
- Promotelec, *Tout savoir sur la prise de terre* (PDF, 2020) — https://www.promotelec.com/app/uploads/2020/06/Prise-de-terre.pdf : lu. Trois méthodes, sections, obligations neuf/existant, couleur vert-jaune, barrette de mesure, ohmmètre.
- Promotelec, *Comment faire une mise à la terre* — https://www.promotelec.com/professionnels/fiche/comment-faire-une-mise-a-la-terre-promotelec-vous-explique-tout/ : lu. Piquet 2 m, borne principale de terre, section 16/25 mm², tableau 53.1 non lisible (image).
- INRS, accidents d'origine électrique — https://www.inrs.fr/risques/electriques/accidents-origine-electrique.html : lu. Seuils de courant.
- Legrand, *Guide NF C 15-100* — https://assets.legrand.com/general/ouidoo/pdf/legrand-guide-norme-nf-c-15-100.pdf : lu partiellement. Masses à relier, grille de résistance maximale ; FAQ — https://www.legrand.fr/questions-frequentes/pourquoi-et-comment-fonctionne-une-prise-de-terre (confond conducteur de protection et de terre).
- Batiweb 15/05/2025 — https://www.batiweb.com/actualites/prevention/securite-electrique-un-parc-residentiel-toujours-a-risque-46534 : lu. Baromètre ONSE 2025 (rapport original ONSE/Promotelec non lu).
- Sénat, question n° 11619 — https://www.senat.fr/questions/base/2024/qSEQ240511619.html : lue (question seulement, pas de réponse du ministère). Chiffres du baromètre 2024.
- IZI by EDF — https://izi-by-edf.fr/blog/prises-electriques-sans-terre : lu. Dates 1969 et 1991, reconnaître une prise sans terre.
- Cours de régimes de neutre (ENSICAEN, Vialis…) via recherche : exemple 230/(20+10) ≈ 7,7 A, 154 V ; non lus en entier.
- **Non lus / non ouverts** : texte de la NF C 15-100 (payant), Consuel, ONSE (rapport), arrêté du 28/09/2017 (Légifrance), Enedis (résistance de la prise du neutre), tableau 53.1 de Promotelec (image), temps de coupure du 30 mA.

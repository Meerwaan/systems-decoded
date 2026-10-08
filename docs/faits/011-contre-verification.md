# Contre-vérification — 011 Fusible pyro

Faite le 2026-10-08, de façon indépendante du premier dossier (`011-fusible-pyro.md`) : chaque phrase dite (`beats[].text`) et chaque texte de `post` est relu contre ce que le dossier de faits porte déjà (niveau noté) et contre 14 pages web ouvertes ou cherchées cette nuit.

Légende des niveaux : **primaire** = constructeur, régulateur, norme, brevet, rapport d'enquête ; **secondaire** = presse, magazine, vendeur, blog ; **extrait** = lu seulement dans le résumé d'un résultat de recherche (la page n'a pas été ouverte) ; **dossier** = déjà lu à la source dans `011-fusible-pyro.md` (je ne l'ai pas rouvert). L'outil de lecture rend un résumé de la page, pas son texte brut : les citations ci-dessous sont celles qu'il a restituées.

Budget : 14 pages sur 14 (7 recherches, 7 lectures dont 2 vides : la page GitHub Battery-Emulator est une simple redirection, l'annonce d'un vendeur de pièces (evwest) ne donne aucune cote).

---

## Tableau des verdicts

| Beat | Phrase (début) | Verdict |
| --- | --- | --- |
| accroche | « Choc. Tes airbags partent. Sous le plancher… » | À NUANCER (léger : l'emplacement) |
| promesse | « Elle coupe ta batterie : quatre cents volts… Partout… » | À NUANCER (« partout ») |
| scene | « Sans elle, un câble écrasé… sous tension… » | À NUANCER (« est » → « peut être ») |
| ouvre | « Alors… on l'ouvre. » | TIENT |
| eclate | « Un boîtier, grand comme un jeu de cartes… » | TIENT |
| repos | « Un fusible ordinaire attend que ça chauffe… » | TIENT |
| seuil | « Abonne-toi : l'explosion sous ton plancher… » | TIENT (même réserve que l'accroche) |
| zero | « En dix millièmes de seconde, le calculateur a compris… » | TIENT (simplification : « le même ordre ») |
| reponse | « La charge explose. Le piston frappe la barre… » | TIENT |
| coupe | « Une milliseconde. La batterie est seule… » | TIENT (simplification) |
| toi | « Tes airbags, eux, n'ont pas fini de se gonfler. » | TIENT |
| chute | « Ce fusible ne fond pas. On le fait sauter : avant le court-circuit… » | **FAUX OU NON SOURCÉ** (la seconde moitié) |
| like | « Like. Ça remontera chez quelqu'un… » | TIENT |
| abo | « …ta gazinière. Son gaz ne reste ouvert… que tant que la flamme le tient. » | TIENT (principe ; source à compléter au 012) |
| comment | « …on a mesuré cent soixante-sept volts. Ce qui est orange… » | À NUANCER (« jusqu'à ») |
| boucle | « …ce qui se passe sous le plancher, à l'instant du… » | TIENT (même réserve que l'accroche) |
| post.caption | « …ce qui explose sous le plancher à l'instant de l'accident… » | À NUANCER (léger : « du choc ») |
| post.pinned | « Témoin d'un accident : tu appelles le 18 ou le 112… » | TIENT |

Réécritures à prendre (une par phrase, même longueur à ± 2 mots) : promesse, scene, chute, comment, caption ; accroche seulement si Merwan veut l'exactitude stricte (voir 1).

---

## 1. « Sous le plancher, une autre charge explose. » — où est la pièce ?

**Verdict : À NUANCER (léger).** « Sous le plancher » tient comme simplification (le pack **est** le plancher et la pièce est montée sur le pack) ; ce n'est pas l'endroit exact pour la seule voiture documentée.

Ce qui est établi pour la Tesla Model 3 / Y :

- La pièce s'appelle, chez Tesla, « pyrotechnic battery disconnect » (rappel NHTSA 23V-434 : « DISCONNECT,BATTERY,PYRO », n° 1064689-00-J, fournisseur Joyson) — dossier, primaire.
- Elle est dans la **« ancillary bay »** (l'ancienne « penthouse », renommée dans la documentation Tesla — renommage vu dans un extrait de recherche) : la procédure de dépose de la pièce commence par « Remove the ancillary bay cover », et la pièce est fixée à la batterie par « Bolts (x2) that attach the pyrotechnic battery disconnect to the HV battery » (9 N·m, boulons à remplacer ; 0,84 h de main-d'œuvre). Manuel d'atelier Tesla Model 3 (édition 2024), « Pyro Disconnect - HV Battery (Remove and Replace) » : https://service.tesla.com/docs/Model3/ServiceManual/2024/en-us/GUID-EA43CDE3-C9A0-4D25-898F-52F7EF703850.html — **primaire, lu** (résumé de l'outil).
- Cette baie se rejoint **par l'habitacle** : la dépose du couvercle de la baie commence par « Remove the 2nd row lower seat cushion » (assise de la banquette arrière) — manuel d'atelier Tesla, « Ancillary Bay Cover (Remove and Replace) », https://service.tesla.com/docs/Model3/ServiceManual/en-us/GUID-017968F4-03ED-4FA3-A27B-9757E74CD897.html — **primaire, extrait** (la page n'a pas été ouverte ; la ligne vient du résumé de recherche). Même baie sur la Model Y (mêmes numéros de page dans le manuel Model Y).
- => **Pour une Tesla 3 / Y : à l'arrière du pack, sous l'assise de la banquette arrière, boulonné sur la batterie.** Le guide d'intervention donne la batterie « montée au plancher » (dossier, primaire).

Dans d'autres électriques : **aucune source trouvée qui donne l'emplacement**. Les guides d'intervention Hyundai Ioniq 5, Kia EV6, VW ID.4, Rivian, Polestar remontés par la recherche parlent de coupure manuelle (levier jaune, boucle de coupure) et, pour la VW ID.4, de désactivation automatique « en cas de déploiement des airbags » (extrait de recherche, guide non ouvert) ; **aucun ne situe un fusible pyro**. Seul indice : Joyson dit son fusible « small enough to fit either within the battery management system or externally » (dossier, CLEPA, auto-déclaration) — l'emplacement varie, mais c'est sur ou contre le pack.

Choix de formule :

- **Garder « plancher »** (4 occurrences : accroche, seuil, boucle, caption) est défendable si `sources` l'écrit (« le pack est le plancher ; sur la Tesla 3 / Y la pièce est à l'arrière du pack, sous la banquette ») et si la 3D pose le boîtier **à l'arrière du pack, sous le bord de la banquette**, pas au milieu du plancher.
- **Version stricte** (à n'adopter que si Merwan la préfère ; il faudrait aussi changer seuil, boucle et caption) : « Choc. Tes airbags partent. Sous ta banquette, une autre charge *explose*. » — vraie pour la Tesla, non sourcée pour les autres. « Dans ta batterie » est vraie partout mais répète « batterie » dans la phrase suivante.
- « Une autre charge explose » : une micro-charge dans un boîtier de 40 à 320 g (dossier) ; le mot est acceptable tant que l'image ne montre jamais la batterie exploser.

**Ce que l'image doit montrer (modélisation)** :

- **La pièce** : un boîtier compact à pattes de fixation (annonce d'un vendeur de pièces Tesla : « a compact, rugged housing with integrated mounting tabs » — secondaire, sans cote : https://evwest.com/high-voltage-battery-disconnect-pyro-fuse-for-tesla-model-3-model-y). Gamme Autoliv : 43 × 70 × 21 mm à 79 × 47 × 47 mm hors barre, 40 à 320 g, piston **en plastique**, vissé sur la barre de cuivre en M8 (Schurter) ; connecteur de commande avec un **clip de court-circuit** qui évite le déclenchement pendant le transport (Schurter) — dossier, primaire. Couleur et dimensions exactes de la pièce Tesla/Joyson : **non trouvées**.
- **Ce qui l'entoure** : dans la baie, la pièce est en **série sur le chemin du courant, entre une barre (« busbar (left) ») et le shunt de mesure du courant (« shunt (right) »)** : la procédure dit de mesurer la tension « between the busbar (left) and shunt (right) » pour équilibrer les deux plots de la pièce ; il y a aussi la barre du module 2 (« Module 2 busbar »). Même manuel, GUID-EA43CDE3 (primaire, lu). Les contacteurs sont dans la même baie, avec leurs barres de liaison (« contactor DC link busbars », bulletin technique Tesla sur les boulons de ces barres — extrait de recherche, bulletin non ouvert) ; le calculateur haute tension (BMS) est vissé sur le couvercle de la baie (manuel d'atelier, extrait). Les câbles hors du pack sont orange (dossier, R100).
- Pendant les interventions, Tesla pose à sa place un faux boîtier de sécurité (« Dummy Disconnect, Pyro, Safety », outillage cité dans le manuel) — détail inutile à l'image, mais confirme que la pièce se retire comme un module.

## 2. « Elle coupe ta batterie : quatre cents volts, en une milliseconde. Partout… sauf à un endroit. »

**Verdict : À NUANCER.** « Quatre cents volts » et « une milliseconde » tiennent ; « partout » est trop net.

- **400 V** : « Model 3 est équipée d'une batterie haute tension au lithium-ion de 400 V montée au plancher » (guide d'intervention Tesla, dossier, primaire). Ordre de grandeur nominal, juste.
- **Une milliseconde** : ordre → courant interrompu en 1 ms (Autoliv) ; Joyson (fournisseur du Model 3 / Y) : « in under 1 millisecond » à plus de 460 V et 12 kA ; Schurter : 1,0 ms typique, 2,0 ms au plus (dossier, primaires). Juste.
- **« Partout »** : le fusible sépare la source (le pack) du reste ; **il ne vide pas ce qui reste chargé de l'autre côté** (condensateurs de l'onduleur et du chargeur). Tesla : « Après désactivation, le circuit haute tension met deux minutes à se décharger » (guide d'intervention Model 3 FR et Model S, dossier, primaire). La règle de sortie est ≤ 60 V DC dans les 60 s qui suivent le choc (GTR 20, d'après le NTSB) ou une énergie < 2 J (R94) — dossier, primaire. Donc « il n'y a plus de tension nulle part sauf dans la batterie » est vrai à quelques secondes (jusqu'à deux minutes pour Tesla) près, pas « partout » à la milliseconde.
- **Réécriture** : « Partout, ou presque… sauf à un endroit. » (garde le premier et le dernier mot). Le « ou presque » couvre les condensateurs sans casser le suspense. `sources` doit dire : « la tension du reste du circuit retombe en quelques secondes (≤ 60 s selon la règle, Tesla annonce deux minutes) ».
- Le mot « coupe ta batterie » peut s'entendre « détruit » : la phrase d'après (« plus rien ne la relie ») le corrige ; ne pas ajouter d'image qui abîme le pack.

## 3. « Sans elle, un câble écrasé contre la tôle… et la carrosserie est sous tension. Pour toi. Et pour celui qui ouvre ta portière. »

**Verdict : À NUANCER.** C'est un **risque**, pas un fait ; et « sans elle » demande la précision des contacteurs.

- **Ce que dit le NTSB** : « If a crash damages the electrical isolation system, a person who touches the vehicle (or an exposed connector) can become part of the high-voltage circuit and suffer serious injury or death » ; les risques portent sur les secouristes, mais aussi sur « bystanders interacting with injured persons » (NTSB SR-20/01, dossier, primaire). **C'est conditionnel (« si l'isolation est endommagée ») et c'est « peut »** ; le même dossier note qu'aucun cas d'électrisation de secouriste n'a été lu dans les quatre accidents étudiés (4.3).
- **Physique** : le circuit haute tension d'une électrique est isolé du châssis (R100 : isolation d'au moins 100 Ω/V, dossier, primaire). Un seul câble qui touche la tôle ne met pas la carrosserie « sous tension » vis-à-vis du sol : il faut une deuxième faute, ou une personne qui touche le châssis **et** l'autre pôle. La phrase « la carrosserie est sous tension » est donc la version vulgarisée du « peut devenir partie du circuit » du NTSB. Raisonnement d'ingénieur à partir de R100 ; je n'ai pas relu une page dédiée à ce point.
- **« Sans elle »** : sur la Tesla 3 / Y, le régulateur écrit qu'une pièce défectueuse « does not isolate the HV battery when the vehicle detects certain collisions… may increase the risk of injury » (rappel NHTSA 23V-434, dossier, primaire) : « sans elle » est donc soutenu **pour cette voiture**. Mais les contacteurs s'ouvrent aussi : les contacteurs mécaniques sont faits pour un courant normal, « The contactor can interrupt up to 650 A » et le fusible ordinaire « cannot be relied upon to interrupt anything under 1,200 A » (Mersen / IEEE Power Electronics Magazine 2018, secondaire, dossier) ; un court-circuit se chiffre en milliers d'ampères. Le fusible pyro est donc ce qui coupe **quand un court-circuit a lieu**, pas la seule coupure d'un choc normal. Dans le brevet Tesla, le mode préféré est même un pyro qui coupe le fil basse tension de la bobine des contacteurs (dossier, 2.3). Ne pas écrire « rien d'autre ne coupe ».
- **Réécriture** : « Sans elle, un câble écrasé contre la tôle… et la carrosserie *peut* être sous tension. Pour toi. Et pour celui qui ouvre ta portière. » (+1 mot ; garde « Sans elle » et la fin). Ne pas montrer un témoin électrisé comme un fait : une scène « en imagination » (« sans elle ») suffit.

## 4. « Alors… on l'ouvre. »

TIENT (aucun fait).

## 5. « Un boîtier, grand comme un jeu de cartes. Une barre de cuivre : tout le courant de la batterie y passe. Un piston. Et derrière lui… une charge. »

**Verdict : TIENT.**

- **Jeu de cartes** : 43 × 70 × 21 mm à 79 × 47 × 47 mm et 40 à 320 g (Autoliv, brochure 2025) ; < 300 g (Schurter) — dossier, primaires. Un jeu de cartes fait environ 63 × 88 × 20 mm : le plus petit modèle est de cette taille, le plus gros est plus épais mais reste dans la main. Ordre de grandeur correct ; la cote de la pièce Tesla n'est pas publiée.
- **Tout le courant** : la barre est en série (Autoliv : « Mechanical severing of a busbar ») ; sur la Tesla, la pièce est entre la barre et le shunt (voir 1) — donc tout le courant du pack la traverse. Mersen : « essentially all of the current flows in the pyroswitch » (dossier, secondaire).
- **Piston, charge** : « Plastic piston hits busbar » (Autoliv) — **un piston en plastique, pas une lame ni un piston métallique** : le modèle 3D doit le faire en plastique clair. La charge est derrière le piston (Autoliv, schéma « Functionality »).

## 6. « Un fusible ordinaire attend que ça chauffe : parfois plus de trois minutes. Lui n'attend qu'un ordre. »

**Verdict : TIENT**, avec « parfois » à conserver.

- Mersen (IEEE Power Electronics Magazine, sept. 2018), système de 900 V / 500 A : « Even at 1,200 A, the fuse could take up to 200 s to act » = 3 min 20 s. Il s'agit d'un fusible assez gros pour couper un court-circuit franc, au **bas** de sa plage de coupure garantie (1 200 A, soit 2,4 fois le courant nominal) ; à plusieurs kA le même fusible agit en millisecondes. « Parfois » est donc la bonne mesure ; ne pas le retirer, ne pas écrire « toujours ».
- « Lui n'attend qu'un ordre » : « After triggering, disconnection takes place no matter the level of current » (Autoliv 2025, dossier, primaire). Juste.

## 7. « Abonne-toi : l'explosion sous ton plancher, on te la montre en entier. »

TIENT. Même réserve que 1 pour « plancher ». « En entier » est une promesse de montage, pas un fait.

## 8. « Choc. En dix millièmes de seconde, le calculateur a compris. Le même ordre part vers tes airbags… et vers lui. »

**Verdict : TIENT**, deux précisions à garder dans `sources`.

- « Dix millièmes de seconde » = 10 ms = 0,01 s : juste. Bosch (04/11/2020) : « In just ten milliseconds … the trigger algorithm interprets the sensor data » (dossier, primaire). C'est l'exemple de Bosch, pas une constante (la décision varie avec la gravité du choc) : ordre de grandeur. À l'oreille, « dix millièmes » peut s'entendre « un dix-millième » ; si l'ambiguïté gêne, « un centième de seconde » dit la même chose (et l'affichage `[10 ms|un centième de seconde]`). Facultatif.
- « Le même ordre » : Autoliv 2011, « activated by the same crash sensors as the airbags » ; Autoliv 2025, « Triggered by the airbag control unit in the case of a crash or BMS in the case of a short-circuit » ; Tesla, la coupure se fait « lorsqu'un airbag est déployé » ; Joyson : déclenché par « the battery management system or the vehicle crash control module » (dossier, primaires). C'est donc **le même événement et les mêmes capteurs**, pas forcément le même fil : « le même ordre » est une simplification honnête. Ne pas dire « le même allumeur » (non sourcé), ne pas généraliser à toutes les électriques.

## 9. « La charge explose. Le piston frappe la barre. Le cuivre casse : un arc… éteint. »

**Verdict : TIENT.** Suite exacte du schéma Autoliv : « Pyrotechnic energy released » → « Plastic piston hits busbar » → « Busbar severed and electric arc generated » → « Arc extinguished, current interrupted » (0,35 → 0,5 → 0,75 → 1 ms ; dossier, primaire). « Casse » = « severed » : image. « Éteint » : la brochure ne dit pas comment (Mersen : un fusible en parallèle l'éteint dans sa version hybride) ; la phrase ne le dit pas non plus, rien à corriger. Ne pas afficher « 0,35 ms » ni « 0,5 ms » comme temps de coupure.

## 10. « Une milliseconde. La batterie est seule : plus rien ne la relie à la voiture. »

**Verdict : TIENT** (simplification). « Une milliseconde » est le total de l'ordre au courant coupé (Autoliv). « Plus rien ne la relie » : le circuit haute tension est ouvert (NHTSA : le dispositif « isolates the high voltage (HV) battery » ; Tesla : coupure « à l'extérieur de la batterie haute tension » ; NTSB : la coupure « will isolate high-voltage power inside the battery » — dossier, primaires). Précisions : la pièce coupe une barre, donc le chemin du courant, pas toutes les attaches mécaniques ni la liaison basse tension du BMS ; et, comme la phrase 2, la charge de l'autre côté retombe en quelques secondes. Ne pas ajouter « et c'est fini » : le pack reste chargé.

## 11. « Tes airbags, eux, n'ont pas fini de se gonfler. »

**Verdict : TIENT.** Bosch : décision à ~10 ms, « Within 30 milliseconds, the airbag is fully inflated » (dossier, primaire) ; la pyro a coupé ≈ 1 ms après l'ordre, vers 11 ms : le coussin est en cours de gonflage. Deux fabricants, deux systèmes : ne pas additionner les chiffres à l'écran (déjà dans `sources`).

## 12. « Ce fusible ne fond pas. On le fait sauter : avant le court-circuit, pas après. »

**Verdict : FAUX OU NON SOURCÉ** pour « avant le court-circuit, pas après ». La première phrase (« ne fond pas ») tient.

- **Il se déclenche aussi sur court-circuit.** Autoliv (brochure 2025) : « Triggered by the airbag control unit in the case of a crash or BMS in the case of a short-circuit » ; Schurter : « To disconnect the battery circuit in abnormal conditions such as short circuits or collisions » ; Joyson : déclenché par le BMS ou par le calculateur de choc (dossier, primaires). Dans le cas « BMS », il coupe **après** que le court-circuit est détecté.
- **Dans le cas du choc**, la coupure est « précautionneuse » : « it is desirable to perform a precautionary disconnect of the battery in cases where no overcurrent exists, e.g., a serious collision » (Mersen / IEEE, dossier, secondaire). Mais **aucune source lue ne compare l'instant de la coupure à celui où un câble serait écrasé** : « avant le court-circuit » n'est pas démontré.
- « Ne fond pas » : juste pour l'élément qui coupe (une barre tranchée mécaniquement). Dans les versions hybrides (Mersen), un fusible ordinaire en parallèle, lui, fond pour éteindre l'arc : ne pas écrire « il n'y a aucun fusible qui fond là-dedans ».
- **Réécriture** (même longueur, garde le début, « avant » et « pas après », donc les repères `verdict`, `before` et `blow` du film) : « Ce fusible ne fond *pas*. On le fait sauter : avant que ça chauffe, pas +après+. » Vraie dans les deux modes de déclenchement (sur le choc, sans courant ; sur le BMS, dès la détection), et elle répond à « Un fusible ordinaire attend que ça chauffe » (phrase 6). Autre option plus courte si le titre barré l'exige : « …On le fait sauter : sur ordre, pas à la chaleur. » (le repère `before` devrait alors passer sur « ordre »).

## 13. « Like. Ça remontera chez quelqu'un qui roule en électrique sans le savoir. »

TIENT (aucun fait contestable).

## 14. « Abonne-toi. Prochain dossier : ta gazinière. Son gaz ne reste ouvert… que tant que la flamme le tient. »

**Verdict : TIENT pour le principe. Niveau de source : secondaire / extrait — à compléter au 012.**

- Principe : un thermocouple chauffé par la flamme produit une très faible tension (≈ 25 à 30 mV selon un guide de fabricant) qui maintient une électrovanne ouverte ; quand la flamme s'éteint, le thermocouple refroidit, la tension tombe sous le minimum de maintien et la vanne se ferme, en une dizaine de secondes. Vu dans : brevet américain « Device for obtaining rapid ignition of a cooking hob gas burner fed via a gas pipe provided with a solenoid safety valve » (US 6 698 417) et brevet « Gas hob » (US 5 295 476), ainsi que des guides de fabricants de tables de cuisson (kaff.in : « Understanding the flame failure device » ; beyondappliances.in). **Je n'ai vu que les extraits de la recherche** : les pages ne sont pas ouvertes, faute de budget. Niveau : extrait. Le principe est classique (sécurité « manque de flamme »).
- À ne pas écrire avant le 012 : « toutes les gazinières » (les modèles anciens ou certains brûleurs n'en ont pas — non vérifié), un temps de fermeture précis, « sans électricité » (c'est le sujet du 012, à sourcer à ce moment : l'électro-aimant est alimenté par le thermocouple, pas par le secteur). La phrase du film ne dit rien de tout ça : elle reste juste.

## 15. « Et l'endroit où il en reste ? La batterie elle-même. Dans un pack écrasé, on a mesuré cent soixante-sept volts. Ce qui est orange, tu n'y touches jamais. En commentaire : tu le savais ? »

**Verdict : À NUANCER** (« jusqu'à »), le reste tient.

- « La batterie elle-même » : NTSB, « The risks of electric shock and battery reignition/fire arise from the energy that remains in a damaged battery--known as stranded energy » ; « cutting the loops will not remove energy from the high-voltage battery » ; Tesla : couper l'alimentation « à l'extérieur de la batterie » (dossier, primaires). Juste.
- « Cent soixante-sept volts » : NTSB SR-20/01, accident d'une Model S à forte destruction du pack : de **3,3 à 46,9 V** sur plusieurs modules et de **69,9 à 167,3 V** sur les modules 1 à 5 ; « The measurements confirmed that stranded energy remained in the high-voltage lithium-ion battery » (dossier, primaire). 167 V est le **maximum** mesuré, sur un groupe de modules, pas la tension du pack. **Réécriture : « Dans un pack écrasé, on a mesuré jusqu'à cent soixante-sept volts. »** (+2 mots ; `text` et `vo` ensemble, l'affichage `[167|cent soixante-sept]` ne change pas). Le seuil de comparaison (60 V DC) est sourcé (NTSB, R94, GTR 20) si l'image veut le montrer.
- « Ce qui est orange, tu n'y touches jamais » : consigne de prudence, pas un texte officiel. Écrit par un constructeur, en français : « Ne pas toucher le fil électrique haute tension (orange), le connecteur, ni aucun des composants et appareils électriques. » (manuel du propriétaire Kia, rubrique de précautions après accident d'un véhicule électrique — le modèle n'est pas précisé par la page ; https://ownersmanual.kia.com/full_webhelp/MV1/2024/fr_FR/topics/id1873N0T0IWJ.html — **primaire constructeur, lu** ; ce passage est probablement la source de l'extrait « NON VÉRIFIÉ » du dossier 10). Câbles orange : R100 § 5.1.1.4.3, FMVSS 305 (dossier, primaires). Réserve : R100 n'impose l'orange qu'aux câbles hors boîtier ; le pack, lui, n'est pas orange — la règle « ce qui est orange » est un bon repère, pas une liste complète.
- « En commentaire : tu le savais ? » : appel au commentaire, aucun fait.

## 16. « Maintenant, tu sais ce qui se passe sous le plancher, à l'instant du… »

TIENT (même réserve que 1 sur « plancher »). Si l'accroche passe à « sous ta banquette », cette ligne devrait suivre ; la boucle n'a pas besoin de la phrase d'accroche pour tenir (« …à l'instant du… » → « Choc. »).

---

## `post`

- **caption** : « Voiture électrique : ce qui explose sous le plancher à l'instant de l'accident, et pourquoi c'est une bonne nouvelle. Les câbles orange, tu savais ? » — **À NUANCER (léger)**. Le dispositif répond à « certain[es] collisions » (NHTSA) et pas à tout accident ; la formule exacte est « à l'instant du choc » (même longueur). Pas de « explose » sans le contexte « une petite charge » : la légende est vue sans la vidéo, et « voiture électrique… explose » est la crainte à ne pas alimenter (liste « À NE PAS DIRE » n° 11). Réécriture : « Voiture électrique : ce qui explose sous le plancher à l'instant du choc, et pourquoi c'est une bonne nouvelle. Les câbles orange, tu savais ? » Si la légende doit lever l'ambiguïté d'un mot : « la petite charge qui explose sous le plancher » (+3 mots).
- **hashtags** : aucun fait. « #tesla » est cohérent : la seule voiture documentée est la Tesla 3 / Y.
- **pinned** : « Témoin d'un accident : tu appelles le 18 ou le 112, et tu ne touches jamais aux câbles orange. Tu le savais ? » — **TIENT.** « Prévenir les secours en composant le 18 ou le 112 » (sapeurs-pompiers de France, dossier, primaire) ; « ne touche jamais aux câbles orange » = la consigne du constructeur ci-dessus. Cherché : **aucune consigne officielle française ou européenne pour un témoin devant une électrique accidentée** n'a été trouvée (pompiers.fr ne parle pas d'électrique ; pas de page Sécurité routière, ADAC ni Euro NCAP remontée par la recherche). À présenter comme du bon sens appuyé sur Kia, Tesla et le NTSB, comme `sources` le dit déjà. Longueur : 105 caractères, sous la limite de 150.

---

## À ajouter ou corriger dans `episode.json` → `sources`

1. Emplacement : « Tesla Model 3 / Y : le pyro disconnect est boulonné sur la batterie (2 boulons) dans la ancillary bay (ex-penthouse), à l'arrière du pack, sous l'assise de la banquette arrière, entre une barre et le shunt de courant (manuel d'atelier Tesla 2024, Pyro Disconnect - HV Battery). Pour les autres électriques, l'emplacement n'est pas sourcé. « Sous le plancher » = le pack est le plancher. »
2. « La tension du reste du circuit retombe en quelques secondes (≤ 60 V DC en 60 s, GTR 20) ; Tesla annonce deux minutes avant de toucher. La batterie, elle, garde son énergie. »
3. « Le fusible se déclenche sur le calculateur de choc ou sur le BMS (court-circuit) : Autoliv 2025, Schurter. La chute dit « avant que ça chauffe », pas « avant le court-circuit ». »
4. « 167 V est un maximum mesuré sur des modules d'un pack de Model S détruit (3,3 à 167,3 V selon les modules), pas la tension du pack. »
5. « Consigne « ne pas toucher le fil haute tension (orange) » : manuel du propriétaire Kia (fr_FR), constructeur. Aucune consigne officielle française pour un témoin trouvée. »
6. Gazinière : principe du thermocouple et de l'électrovanne, vu dans des brevets US 6 698 417 et 5 295 476 et dans des guides de fabricants (extraits) ; à sourcer à l'écriture du 012.

## Pages consultées (14)

Ouvertes et exploitées : (1) https://service.tesla.com/docs/Model3/ServiceManual/2024/en-us/GUID-EA43CDE3-C9A0-4D25-898F-52F7EF703850.html · (2) https://service.tesla.com/docs/Model3/ServiceManual/2024/en-us/GUID-111F91E8-D5D6-4873-85C4-6D57946B926F.html (mention de la dépose / pose du pyro disconnect pendant le service des barres) · (3) https://ownersmanual.kia.com/full_webhelp/MV1/2024/fr_FR/topics/id1873N0T0IWJ.html · (4) https://evwest.com/high-voltage-battery-disconnect-pyro-fuse-for-tesla-model-3-model-y (annonce de vendeur, sans cotes).
Ouvertes sans contenu utile : https://electrek.co/2018/07/26/tesla-model-3-teardown-electric-powertrain/ (une simple légende « Model 3 pyro fuse », rien sur l'emplacement ; la page de Munro n'a pas été trouvée) · https://github-wiki-see.page/m/dalathegreat/Battery-Emulator/wiki/Battery:-Tesla-Model-S-3-X-Y (redirection) · https://github.com/dalathegreat/Battery-Emulator/wiki/Battery:-Tesla-Model-S-3-X-Y (page de renvoi vers un nouveau wiki).
Recherches (résumés seulement) : emplacement du pyro fuse Tesla (munro, électrek, forums) ; « penthouse » renommé « ancillary » ; Pyro Disconnect remove and replace ; ancillary bay cover / assise de la banquette ; consigne d'un témoin devant une électrique accidentée (remonte des manuels Kia, un guide de Rheinmetall, Pièces et Pneus, Designwerk) ; thermocouple et électrovanne d'une table de cuisson ; emplacement du pyro fuse sur d'autres électriques (guides Hyundai, Kia, VW, Rivian, Polestar ; aucun ne le situe).

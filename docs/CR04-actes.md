# CR04 · Lac-Mégantic — le plan de mise en scène

**Quatrième « Compte à rebours ».** Ni « Alors… on l'ouvre », ni éclaté, ni like. La mécanique, c'est le temps (22:49 → 01:15) ; le cœur, c'est **le défaut** : l'essai des freins à main a réussi **grâce à l'air des locomotives** ; seuls, les **sept freins à main** donnaient un tiers des 66 t qu'il fallait, et l'air fuyait depuis l'arrêt du moteur. Recette : `docs/recette-compte-a-rebours.md` ; DA : `docs/reconstitution.md` ; faits : `docs/faits/CR04-lac-megantic.md` § 10 et § 13 (« À ne pas dire »). Exigence n° 1 : **ce qui est dit est à l'écran, expliqué aussi**.

**La voix est enregistrée** (143,5 s, 17 beats). Tout instant se lit dans le script — un repère d'`episode.json` (`cues`, vérifiés sur la table) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; les secondes ci-dessous servent à te repérer. Table mot à mot : `.cache/CR04-mots.txt` (les `||x||` sont les souffles). **Pièges** : un repère attrape le DÉBUT des mots (`principe:Le` attrape « Les », `depuis:deux` attrape « deux mille treize » → `deux` vise `depuis:personnes-0.16`) ; `t5:zéro` attrape « 0 h 05 » (→ `onzequarante` = `t5:Vers-0.2`).

Six fichiers, un agent chacun, **quatre à la fois** : vague 1 `acte1.js`, `acte2.js`, `acte2b.js`, `acte2c.js` ; vague 2 `acte3.js`, `fin.js`. Aujourd'hui des squelettes (coupes d'entrée, états, étiquettes), à réécrire en entier. Chacun n'écrit que `st` / `shot` / `path` / `cut` / `chip` / `tl` contre `world.js` : `FIRST`, `VIEW` (provisoires : les journaux des décors `docs/journal/CR04-locomotive.md`, `-convoi.md`, `-ville.md` donnent celles qui cadrent — pars d'elles), `STAGED`, `BENCHED`, `AT`, **`onLoco(i, { run, slack }, local)`** (un point du véhicule i dans le monde : vise et éclaire avec, `lit(onLoco(0, S, [-20, 9, 0]), 70)`), `onTrack(u, local)`, **`lookFrom(camera, cible, o)`** (une pose complète depuis deux points) et `aboveGround(pose)`. Forme : `episodes/CR03-concorde/src/acte*.js` ; outillage `kit/lib/direct.js`, `kit/lib/blocks.js` (`duelCall`, `nextFile`), `kit/lib/reconstitution.js` (`feutre`).

## L'état, en une table
Un seul lieu (`SET.PENTE`) : la pente, la voie, le train, la route, la ville. **Le train n'a pas de place fixe** : `run` = l'abscisse de sa tête (plan.js `RUN` : garé 0 · arrivée −260 · ville 21 800 · rue Frontenac 23 700 · déraillement 24 050), `slack` les attelages (0 tassés → 1 tendus, vague de la tête à la queue) ; **quand le train bouge, la caméra et la lumière le suivent** (`onLoco`). Les roues tournent seules avec `run`. **`culprit` / `fault`** (plan.js `CULPRIT`) : 1 le moteur et son turbo · 2 le compresseur · 3 l'air (cylindre, piston, raccords) · **4 les sept freins à main** (le défaut ; `depuis` les guérit). Une pièce rouge à la fois, `fault` 0 tant que la phrase ne la nomme pas. **`ok`** : ce qui marche, en vert (compresseur, réservoir, l'air qui tient ; les volants serrés non fautifs). `psi` = la pression du cylindre (70 plein · 60 tenu · 27 au départ · 0) : piston, sabot, aiguille de `#mano`, air de `#colonne`. `brakes` = combien de freins à main serrés depuis la tête (7 = les sept ; au-delà, ceux des citernes). Détail : `docs/CR04-decors.md` et le commentaire de `FIRST`.

**Les instruments** (zone haute à gauche, écrits par `world.js` depuis l'état, **un à la fois, jamais avec une étiquette**) : `#mano` (`mano` 1 ; l'aiguille lit `psi` ; verte moteur allumé, rouge moteur coupé) · `#colonne` (`col` 1, `mark` 1 : la marque « 66 t » ; air = 1,62 t × `psi`, freins à main = leur somme ; verte au-dessus de 66,5, rouge dessous — **elle se règle donc par `psi` et `brakes`**, pas autrement) · `#vitesse` (`speedo` 1, `kmh` ; rouge au-delà de la limite « 16 »). Étiquettes (`chip(id, null, 96, 470, de, à)`) : `chip-essai` · `chip-911` · `chip-bilan` · `chip-facteurs` · `chip-deux` · `chip-douze`. Pas de pièce du dossier (photos du BST non réutilisables).

## L'en-tête (monté dans `main.js` : n'y touche pas)
L'heure saute **0,24 s avant chaque étape, dans le souffle** : 00:58 (image 0) → 23:58 (`recule`, 6,36, après « plus tôt ») → 22:49 (29,86) → 23:03 → 23:40 → 23:58 → 00:05 → 00:44 (`onzequarante`, 72,78) → 00:58 (76,34) → 01:15 (93,49, et elle y **reste** pendant l'issue) → « 2013 » (`todepuis`). Dessous, le temps jusqu'au départ (00:58:21) : T−0 s, T−59 min 39 s, T−2 h 08 min… T−0 s au t6 ; il s'efface à `toverdict` et revient à `toloop`. Les actes 01 L'HEURE / 02 LE DÉFAUT / 03 DEPUIS s'allument comme au CR03.

## Ce que tout acte respecte
- **Chaque phrase a sa démonstration, sur le mot.** Le mécanisme suit la voix : la roue tourne SUR « démarre », le moteur s'éteint SUR « coupé », les sept volants s'allument SUR « sept », la poignée part SUR « desserre », les flammes SUR « feu », le coupe-circuit SUR « coupent », le compresseur rougit SUR « compresseur », la barre passe sous 66 SUR « kilos », la roue repart SUR « part », la barre tombe au tiers SUR « tiers ». Couleurs franches : `fault` 0 ou 1, jamais à mi-chemin plus d'une demi-seconde.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout ce que le lieu lit (`run slack brakes auto psi leak derail engine smoke fire cutaway cab crew cutoff solo` + instruments) ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et `FIRST`, sans coupe. Coupes sur les repères `to…` (0,12 s avant la phrase), ou posées **quelques images avant** leur phrase. **Chaque coupe est un raccord** (forme, objet, mouvement), écrit dans les tables.
- **0 → 25 s : la grille de rétention.** Le sujet bouge seul dès l'image 1 (la roue tourne, le sabot frotte, les bouffées d'air) ; **un geste ou une coupe toutes les 2 à 3 s**, aucune plage lente de 2 s. Puis un changement toutes les 5 à 8 s au plus ; **l'horloge qui saute est la relance**. **Plan-séquence** (`D.path`, `docs/recette-actes.md`) pour les traversées : la descente le long de la pente jusqu'à la ville (t1), la remontée le long des wagons (t1, t6), le cylindre → le volant (`defaut`) ; chaque clé change d'angle de 6 à 15°.
- **Les moments forts se voient en entier, sans coupe dessus** : la roue qui repart (`trigger` 82,58 → 83,7), les flammes (56,10 → 57,8), le compresseur qui s'arrête (66,26 → 67,1), le sabot qui se décolle (`defaut:vidait` 91,86 → 93,2), le déraillement (101,98 → 103,4).
- **Les mots qui frappent** (`D.punch(t.mot, 0.06)`, un par phrase au plus, jamais sur une coupe, jamais deux à moins d'une seconde, jamais à l'image 0) — ce sont les mots marqués du script : `choc` « démarre » 2,60 · « locomotive » 7,24 · « assez » 23,02 · « soixante-six » 27,22 · « main » 41,46 · « réussi » 52,42 · « feu » 56,10 · « compresseur » 66,26 · « seul » 76,02 · « part » 82,58 · `verdict` « tiers » 89,70 · « seize » 101,18 · « deux » 113,88 · « commentaire » 125,48 · « pas » 129,84 · « lâché » 135,18. `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **Le cercle rouge** (`feutre(D, { id, anchor, … })`) : un à la fois, sur la pièce que la voix nomme. Ancres : `world.lead.A.turbo` (t3), `.compressor` (t4), `.cylinder` (t5, defaut), `.volant` ; **`world.A.seven`** (les sept freins à main ensemble, au milieu des sept véhicules de tête : `defaut`, w ≈ 900 dans un plan large) ; `world.ville.A.sign` (t7).
- **Le son** est en grille de départ (`sfx` : ambiance, signature, montée vers 0:58, deux impacts dans des souffles, la boucle) ; le `monteur-son` l'écrit en entier après vous, **banque seule** (`kit/sons/`). N'écris aucun son ; si une image en appelle un (horloge qui saute, coupe-circuit, compresseur qui s'arrête, bouffées d'air, roue qui repart), dis-le dans ton journal avec son instant.
- **Zones** : en-tête 214–412 · zone haute 436–790 (une étiquette OU un instrument) · sujet 440–1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête.
- **La part du cadre** est donnée pour chaque plan (en largeur) ; sous 30 %, c'est un plan d'ensemble : 3 s au plus (sauf `seuil`, la descente du t1 et l'issue : la pente ou la ville EST le sujet).
- **`dof`** : seules les poses qui étalent `CLOSE` (gros plans) ; tout le reste `dof: 0`. **La caméra ne passe jamais sous le sol** (`aboveGround(pose)`), ni dans une caisse.
- **Interdits** : personne à l'image (ni main sur le volant ou le coupe-circuit, ni silhouette, ni cabine habitée) ; **jamais une faute montrée** (ni mécanicien qui « oublie », ni pompier qui « se trompe ») ; les freins à air **fuient**, ils ne « lâchent » pas en panne ; **aucune image des morts ni de l'incendie de la ville comme sujet** (une lueur derrière les toits, de loin) ; aucun nom ; aucune grandeur affichée hors des étiquettes et des instruments.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée ; s'il t'en manque un, « À changer ailleurs ». **26 images lues au plus.** Journal : `docs/journal/CR04-<ton fichier>.md`. Planches dans `.cache/planches/CR04/<ton fichier>/`, jamais dans `renders/`.

## La boucle
La dernière phrase (« Comme cette nuit-là, à… ») retombe sur la première (« Zéro heure cinquante-huit ») : **la voix boucle**. `fin.js` coupe à `toloop` (141,25) sur `POSE0` un peu plus loin, à l'état `FIRST`, et `D.loop({ at: toloop, rewindAt: rewind })` ramène la caméra sur `POSE0` (`rewind` = « nuit-là » 141,74) ; l'en-tête revient seul à 00:58 / T−0 s. **La dernière image est la première** : tire-les côte à côte.

---

## acte1.js — 01 L'HEURE : accroche → seuil (0 → `tot1` 29,98)

Part de `POSE0` et `FIRST` (la roue de tête, le train garé qui démarre), sans coupe. **C'est la zone qui retient.** Rend la main à `tot1`.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| 0 → 1,80 | « 0 h 58. » | `POSE0` (la candidate retenue), `FIRST` : **la roue tourne dès l'image 1** (`run` 0 → ≈ 9 jusqu'à `recule`, `"none"` : 1 mi/h), le sabot serré frotte, deux bouffées d'air (`leak` 0,4) ; la caméra recule d'un rien. Roue + locomotive ≈ 45 % |
| `garé` 2,20 → 3,00 | « Ton train garé *démarre*. » | punch `choc` ; les attelages derrière commencent à se tendre (`slack` 0 → 0,04) |
| `accroche:Ses` 3,44 → 4,60 | « Ses freins à main sont serrés. » | **coupe** à 3,30 (raccord : la même locomotive, plus haut) sur le **volant** (`VIEW.volant`, mais l'état roule toujours : il glisse dans le cadre) ; serré, chaîne tendue, rouge pâle (`fault` 0,55 de `FIRST`). ≈ 35 % |
| `promesse` 5,16 → 6,28 | « 59 minutes plus tôt, » | **coupe** à `promesse`−0,12 : la tête garée, moteur allumé (`run` 0, `engine` 1, `smoke` 0,5, `cutoff` 0, `psi` 60, `culprit` 0), de trois quarts avant, basse (`VIEW.cheminee` reculée) ; l'horloge recule à `recule` 6,36. ≈ 50 % |
| `promesse:on` 6,60 → 7,90 | « on a coupé sa *locomotive*. » | SUR « coupé » 6,84 : `engine` 1 → 0, la fumée s'arrête, la caisse cesse de frémir ; punch « locomotive » |
| `promesse:Alors` 8,43 → 9,60 | « Alors, qui le tenait : » | glissé (`path`) vers le flanc gauche avant : **les deux camps sur la même locomotive**, le cylindre de frein en bas, le volant au-dessus (`lookFrom(onLoco(0,S,[-18,7,32]), onLoco(0,S,[-33,8,5]))` à régler) ; `#mano` entre (`mano` 1, aiguille sur 60) |
| `campair` 9,69 → `campmain` 10,92 | « l'air… ou ses freins à main ? » | SUR « l'air » : le cylindre et sa conduite s'allument (vert faible, `ok` 0,6) ; SUR « freins » 10,60 : le volant s'allume ; les deux à égalité — **la question reste ouverte** |
| `toprincipe` 11,66 → 12,90 | « D'abord, comment ça marche. » | **coupe** (raccord : la même locomotive, seule, ouverte) : `VIEW.coupe`, `solo` 1, `cutaway` 1, `engine` 1, `ok` 1, `psi` 0, `brakes` 0, `mano` 0. ≈ 60 % |
| `principe:Les` 13,38 → `compresseur0` 16,90 | « Les freins d'une locomotive serrent avec de l'air, rechargé par un compresseur. » | plan-séquence le long de la machine, du cylindre au compresseur : SUR « serrent » 14,58 `psi` 0 → 70 (le piston pousse le sabot sur la roue) ; SUR « compresseur » 16,42 il tourne, vert vif. ≈ 55 % |
| `coupe` 17,42 → `principe:doucement` 19,90 | « Coupe le moteur… et l'air fuit, doucement. » | SUR « Coupe » `engine` → 0 (le compresseur ralentit et s'arrête) ; SUR « fuit » 18,86 `leak` 0 → 1, `culprit` 3, `fault` 1 (le cylindre et les raccords rougissent), `psi` 70 → 62 lentement, la tige rentre d'un cran |
| `principe:frein` ne marche pas (« freins ») : `tient`−1,04 = 20,30 → 22,40 | « Le frein à main, lui, tient sans air. » | **coupe** sur `VIEW.volant` à 20,18 (raccord : la même caisse, plus haut) ; `culprit` 0 ; SUR « tient » 21,34 `brakes` 0 → 1 : le volant tourne, la chaîne se tend, vert |
| `assez` 22,55 → 23,34 | « S'il y en a *assez*. » | recul vif : un seul volant, petit, sur la longue locomotive ; punch |
| `toseuil` 23,57 → `pente0` 25,90 | « Pour tenir ce train de dix mille tonnes sur sa pente, » | **coupe** (raccord : la locomotive → le train entier qui part d'elle) : `VIEW.pente` (ou celle du journal de `convoi`), `solo` 0, `brakes` 0, `psi` 0 ; SUR « dix mille » 24,54 la flèche rouge `pull` 0 → 1 vers le bas de la pente. Le train ≈ 80 % de la diagonale |
| `seuil:il` 25,94 → 28,70 | « il faut l'équivalent d'environ 66 tonnes de freinage. » | la flèche verte `hold` 0 → 1 ; `#colonne` entre vide (`col` 1) ; SUR « soixante-six » 27,22 `mark` 0 → 1 (la ligne « 66 t »), punch |
| `retiens` 28,98 → `tot1` | « Retiens ce chiffre. » | la marque pulse une fois ; la caméra glisse vers la tête. Sortie : `col` 1, `mark` 1 (l'acte 2 coupe et repose tout) |

**Couture de sortie** : pente, train garé, flèches levées, colonne vide avec sa marque → l'acte 2 coupe à `tot1`.

## acte2.js — t1 → t2 (`tot1` 29,98 → `tot3` 53,02)

Entre par une coupe complète (`col` 0, `mark` 0, `pull` 0, `hold` 0). **Les sept volants sont le sujet du t1, le pupitre celui du t2.**

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot1` → 31,40 | « 22 h 49. » | **coupe** (raccord : la même pente, la même tête) : `VIEW.arrivee`, le train arrive (`run` −260 → 0, `power2.out`, il s'immobilise à 31,4), `auto` 1 (le vert court le long des wagons), `engine` 1, `ok` 1, `brakes` 0, `psi` 70, `slack` 1 → 0 (il se tasse). ≈ 50 % |
| `t1:Tu` 31,54 → 34,90 | « Tu gares ton train à Nantes, au Québec : soixante-douze wagons de pétrole. » | plan-séquence le long des citernes (de la tête vers la queue, en hauteur) ; SUR « soixante-douze » 33,62 la caméra file sur la rangée. ≈ 60 % |
| `megantic` 35,43 → 37,90 | « Lac-Mégantic est à douze kilomètres, en bas de la pente. » | la caméra **descend la pente** jusqu'aux lumières de la ville (`VIEW.vallee`, `town` 1 qui s'avive sur « Lac-Mégantic ») ; plan d'ensemble : la ville EST le sujet |
| `t1:Tu#2` 38,54 → 39,90 | « Tu laisses une locomotive allumée… » | **coupe** (raccord : la ville au fond → la tête au premier plan, la ville au fond) : `VIEW.tete` ; cinq locomotives, **une seule fume, en vert** (`smoke` 0,5, `ok` 1). ≈ 45 % |
| `t1:et` 40,14 → 41,54 | « et tu serres sept freins à *main*. » | SUR « sept » 40,86 → 41,50 : `brakes` 0 → 7, un par un (0,09 s), verts, **tous en tête**, les 72 derrière sans ; punch « main » |
| `tot2` 41,82 → `essai` 43,70 | « 23 h 03. L'essai : » | **coupe** (raccord : le vert des volants → le vert du pupitre) : `VIEW.pupitre`, `cab` 1, `auto` 1, `psi` 60 ; les deux poignées. ≈ 55 % |
| `desserre` 44,10 → `seuls` 46,90 | « on desserre les freins à air, et les freins à main doivent tenir seuls. » | SUR « desserre » la poignée de l'automatique part, `auto` 1 → 0 ; glissé vers l'extérieur : le vert s'éteint le long des wagons ; SUR « seuls » les sept volants pulsent |
| `t2:Mais` 47,22 → `t2:locomotives` 50,90 | « Mais, comme d'autres chez toi, tu laisses serrés les freins à air des locomotives. » | retour au pupitre : SUR « serrés » 49,19 la poignée de l'indépendant **ne bouge pas**, son manomètre reste ; cylindres des locomotives verts (`ok` 1, `psi` 60) — **jamais un geste de main** |
| `rien` 51,18 → `tot3` | « Rien ne bouge. Essai *réussi*. » | **coupe** sur le train entier immobile (`VIEW.immobile`) ; `chip-essai` de « réussi » 52,42 à `tot3`−0,2 ; punch ; `cab` 0 (la cabine se vide de lumière) |

**Couture de sortie** : la tête garée, `engine` 1, `psi` 60, `brakes` 7, `auto` 0.

## acte2b.js — t3 → t5 (`tot3` 53,02 → `tozero` 76,46)

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot3` → `appelle` 54,70 | « 23 h 40. » | **coupe** : `VIEW.cheminee` (contre-plongée de trois quarts) ; fumée noire qui épaissit (`smoke` 0,4 → 1). ≈ 50 % |
| `appelle` 54,74 → 57,50 | « Quelqu'un appelle le neuf-un-un : un *feu* sur la locomotive de tête. » | `chip-911` de « appelle » à `tot4`−0,2 ; SUR « feu » 56,10 `fire` 0 → 1 (les flammes sortent de la cheminée) ; punch |
| `t3:Son` 57,82 → 59,30 | « Son moteur avait été mal réparé. » | `cutaway` 1 (le capot s'ouvre) : le moteur et le turbo rouges (`culprit` 1, `fault` 1 SUR « mal » 58,82) ; cercle sur `lead.A.turbo` de 58,82 à `tot4` |
| `tot4` 59,57 → 60,90 | « 23 h 58. » | **coupe** (raccord : le flanc ouvert → le flanc plus bas) : `VIEW.coupecircuit` ; le feu brûle encore au-dessus |
| `pompiers` 61,10 → 63,60 | « Les pompiers coupent le moteur, comme le prévoient les consignes. » | SUR « coupent » 61,58 le coupe-circuit bascule (`cutoff` 0 → 1, **aucune main**) ; `engine` 1 → 0 sur 1,5 s |
| `eteint` 63,86 → 64,60 | « Le feu s'éteint. » | **coupe** sur la cheminée : SUR « s'éteint » `fire` → 0, la fumée retombe ; `culprit` 0 |
| `t4:Mais` 64,94 → `arrete` 67,14 | « Mais avec le moteur… le *compresseur* s'arrête. » | `VIEW.compresseur` (capot ouvert) : vert, il tourne encore ; SUR « compresseur » 66,26 `culprit` 2, `fault` 1 (il rougit), punch ; SUR « s'arrête » 66,74 il s'immobilise, `ok` → 0. ≈ 45 % |
| `tot5` 67,42 → `fuit5` 69,20 | « 0 h 05. L'air fuit : » | **coupe** : `VIEW.raccords` ; SUR « fuit » `leak` 0 → 1 (les bouffées), `culprit` 3, `fault` 1 |
| `t5:environ` 69,49 → 71,10 | « environ un psi par minute. » | `#mano` (`mano` 1) : l'aiguille quitte 60 et descend, cran par cran (`psi` 60 → 57) ; le piston rentre d'un cheveu |
| `reste5` 71,42 → 72,42 | « Le moteur reste coupé. » | recul : la tête sombre, sans fumée ; `mano` 0 |
| `onzequarante` 72,78 → `repart` 75,00 | « Vers 0 h 44, tout le monde repart. » | `VIEW.route` : les phares s'éloignent (`road` 0 → 1 de 73,2 à 75,2) ; `psi` → 31 (le temps a passé) |
| `t5:Le#2` 75,34 → `tozero` | « Le train reste *seul*. » | **coupe** `VIEW.seul` : le train seul dans le noir, la ville en bas ; punch « seul » |

**Couture de sortie** : `engine` 0, `cutoff` 1, `psi` ≈ 30, `brakes` 7, `leak` 0,4.

## acte2c.js — t6 → defaut (`tozero` 76,46 → `tot7` 93,61)

**Le climax.** Le départ est un raccord sur la première image ; `defaut` est le grand plan du train qui prend la pente pendant que la voix démonte l'essai.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tozero` → 77,70 | « 0 h 58. » | **coupe** sur le cylindre (`VIEW.cylindre`), `psi` 30 ; T−0 s |
| `souviens` 77,94 → 79,70 | « Souviens-toi : soixante-six tonnes. » | `#colonne` (`col` 1, `mark` 1) : la barre air + sept freins à main au-dessus de la marque, verte (70,6 t) |
| `t6:Il` 79,98 → `kilos` 81,90 | « Il en manque à peine quelques centaines de kilos. » | `psi` 30 → 27 de « manque » à « kilos » : la barre passe **juste sous** la marque et **vire au rouge** (65,7 t) ; le piston rentre d'un cheveu |
| `t6:Le` 82,10 → 82,90 | « Le train *part*. » | **coupe à 82,10 sur la première image** (`POSE0`, état `FIRST`, `run` 0, `col` 0) : SUR « part » la roue se met à tourner (`run` 0 → … `sine.in`) ; punch |
| `toutseul` 83,27 → 83,70 | « Tout seul. » | les attelages se tendent derrière (`slack` 0 → 1 jusqu'à 86) ; la roue accélère |
| `toverdict` 83,89 → 84,60 | « Et ton essai ? » | **coupe** : `VIEW.prend` (le train qui prend la pente, la caméra le suit avec `onLoco`) ; `run` 20 → 700 sur tout le beat (`power1.in`) |
| `defaut:Il` 84,87 → 86,90 | « Il a réussi grâce à l'air des locomotives. » | SUR « l'air » 85,86 les cylindres des cinq locomotives pulsent vert (`ok` 1 un instant) |
| `sept2` 87,22 → `fallait` 90,50 | « Tes sept freins à main, seuls, donnaient à peine un *tiers* de ce qu'il fallait. » | SUR « sept » `culprit` 4, `fault` 1 : **les sept volants rouges**, cercle sur `world.A.seven` (de « sept » à 90,6) ; `#colonne` revient, l'air retiré (`psi` → 0 sur « seuls ») : 22 t contre 66, rouge ; punch `verdict` « tiers » |
| `defaut:Et#2` 90,94 → `heure` 93,22 | « Et l'air… se vidait depuis presque une heure. » | `col` 0 ; **coupe** sur le cylindre (raccord : la colonne vide → le cylindre vide) : le piston recule, le sabot se décolle de la roue SUR « vidait », la roue tourne de plus en plus vite |

**Couture de sortie** : le train lancé (`run` ≈ 700, `slack` 1, `psi` 0, `culprit` 4, `fault` 1).

## acte3.js — t7 → issue (`tot7` 93,61 → `todepuis` 109,44)

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot7` → 94,60 | « 1 h 15. » | **coupe** : Lac-Mégantic, `VIEW.frontenac` (de face, bas, entre les premières maisons), `STAGED.ville`, `run` `AT.town.run` → `RUN.frontenac` en `"none"`, `culprit` 0, `psi` 0 ; `#vitesse` (`speedo` 1, `kmh` 40). Le train ≈ 35 % puis 70 % |
| `personne` 94,78 → 98,90 | « Sans personne à bord, le train entre dans Lac-Mégantic à 105 km/h. » | la cabine vide et sombre se lit ; `kmh` 40 → 80 → 105 (SUR « cent » 97,58, punch « cent cinq ») |
| `passage` 99,06 → 101,42 | « Au passage à niveau du centre, la limite est à *seize*. » | **coupe** à 98,94 : `VIEW.panneau`, le panneau « 16 » qui défile en un éclair, les feux du passage à niveau clignotent (`cross` 1) ; punch « seize » ; la barre de vitesse rouge loin au-delà de 16 |
| `toissue` 101,77 → 103,40 | « Il déraille en plein centre. » | **coupe** : `VIEW.courbe` (large, lointain) ; `speedo` 0 ; `derail` 0 → 1 de 101,98 à 103,4 : les citernes se couchent dans la courbe |
| `embrase` 103,38 → 104,40 | « Le pétrole s'embrase. » | SUR « s'embrase » `glow` 0 → 1 (la lueur rouge derrière les toits). Rien d'autre |
| `morts` 104,74 → `facteurs` 108,86 | « 47 morts. L'enquête ne cherche pas de coupable : elle relève 18 facteurs. » | `chip-bilan` (« 47 ») à `enquete`−0,2, puis `chip-facteurs` à `todepuis`−0,2 ; l'image s'éloigne lentement ; à la fin, **la pente vide** au-dessus de Nantes (l'horloge reste sur 01:15) |

**Couture de sortie** : la ville, `derail` 1, `glow` 1.

## fin.js — 03 DEPUIS : depuis → boucle (`todepuis` 109,44 → fin 143,53)

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `todepuis` → `canada` 111,20 | « Depuis 2013, au Canada, » | **coupe** sur `BENCHED` (le train garé, les sept volants rouges) + `cab` 1, `VIEW.cabine` ; `depuis` 0 → 1 de 109,6 à 110,8 (la lumière blanchit, la grille passe au vert). ≈ 50 % |
| `depuis:un` 111,32 → `methode` 115,40 | « un train avec des citernes de matières dangereuses roule avec deux personnes à bord, au minimum. » | SUR « deux » 113,88 : deux casques se posent sur les deux sièges (`crew` 0 → 2) ; `chip-deux` de « deux » à `compagnie`−0,2 ; punch |
| `depuis:Et` 115,72 → 118,84 | « Et chaque compagnie a dû déposer sa méthode d'essai des freins à main. » | **coupe** `VIEW.rangee` : l'essai refait — `psi` 60 → 0 (le vert des locomotives s'éteint), `brakes` 7 → 24 (une rangée de volants **verts** le long des citernes), `heal` des sept (`culprit` 4, `depuis` 1) |
| `tocta` 119,27 → `surtout` 121,40 | « Alors, qui le tenait ? Surtout l'air. » | **coupe** sur les deux camps (`VIEW.tete` plus bas ou le flanc avant) ; `#colonne` : `psi` 60 + `brakes` 7 (119 t, l'air presque tout) |
| `comment:Pour` 121,80 → 124,40 | « Pour l'enquête, il fallait au moins 12 freins à main. » | `col` 0 ; `chip-douze` de « douze » 123,56 à `commentaire`−0,4 ; `brakes` 7 → 12 : cinq volants de plus s'allument derrière |
| `commentaire` 124,84 → 129,88 | « Toi, en *commentaire* : un train de pétrole garé la nuit, seul… tu trouves ça normal, ou *pas* ? » | la tête garée sur sa pente, qui fume (`engine` 1, `smoke` 0,4) ; `duelCall` « Normal » / « Pas normal » (`toneA` ET `toneB` null : le film ne répond pas) |
| `toabo` 130,77 → 140,90 | « Abonne-toi : chaque compte à rebours… Le prochain : un Airbus sans carburant… » | `nextFile` (fait sur « lâché » 135,18) ; derrière, la caméra redescend lentement le long du train vers la tête |
| `toloop` 141,25 → fin | « Comme cette nuit-là, à… » | **coupe** sur `POSE0` reculé, état `FIRST` ; `D.loop({ at: toloop, rewindAt: rewind })` |

---

## Les candidates de la première image

Quatre poses (réglées sur bouchons ; à **re-tirer sur les vrais décors** : `npm run look -- CR04 --file .cache/planches/CR04/premiere-image/essais.json --out .cache/planches/CR04/premiere-image/planche.jpg`, chacune à 0,02 et 2,7 s). État commun : `FIRST` (`run` 0, `psi` 27, `brakes` 7, `culprit` 4, `fault` 0,55, `leak` 0,4, `fx fy fz fs` sur la roue). Les six points de `docs/recette-agents.md` : ① un événement en cours · ② perspective basse · ③ la menace derrière · ④ une forme reconnue en ⅓ s, vue d'où on ne la voit jamais, sur 40 % de la largeur · ⑤ le système déjà là, petit mais lisible · ⑥ il bouge par son sujet dès l'image 1.

**(b) « le train qui file » — recommandée (5,5 / 6)** : ① la roue tourne ✓ · ② au ras du rail, devant à gauche ✓ · ③ les citernes de pétrole qui montent la pente dans le noir ✓ (pas la ville) · ④ roue + sabot + caisse, vus d'en dessous ✓ · ⑤ le volant rouge en haut du flanc ✓ (à confirmer sur le vrai décor) · ⑥ ✓.
`{ "side": 0, "roll": 0, "drift": 0, "dof": 0, "shift": 120, "fov": 44, "tx": 13.08, "ty": 8.96, "tz": 2, "d": 26.61, "az": -65.26, "el": -8.95 }`

**(a) « descente » — celle du `voir` (5 / 6)** : sous le châssis, entre la roue de tête et celle du milieu, à hauteur de moyeu, qui regarde la descente : la roue à droite du cadre, le rail qui file vers **les lumières de la ville tout en bas** (③ la meilleure menace) ; ⑤ le sabot et le cylindre oui, le volant hors cadre ; tient si les lumières de `ville.js` se lisent à 24 000.
`{ "side": 0, "roll": 0, "drift": 0, "dof": 0, "shift": 0, "fov": 54, "tx": -26.18, "ty": 4.29, "tz": -3.6, "d": 41.39, "az": 75.16, "el": 1.11 }`

**(d) « face » (4,5 / 6)** : sur la voie devant la tête, un peu à gauche : le nez qui descend vers toi (③ la menace, c'est lui ; la ville est derrière toi), mais presque de face (④ faible) et 1 mi/h se voit peu (⑥).
`{ "side": 0, "roll": 0, "drift": 0, "dof": 0, "shift": 80, "fov": 34, "tx": 11.01, "ty": 10.89, "tz": 1, "d": 64.43, "az": -85.52, "el": -6.9 }`

**(c) « profil bas » (4 / 6)** : le flanc gauche au ras du ballast, la roue au tiers gauche, le train qui part à droite ; ③ et ④ faibles (un profil, c'est la vue de tout le monde).
`{ "side": 0, "roll": 0, "drift": 0, "dof": 0, "shift": 60, "fov": 42, "tx": 29.04, "ty": 10.52, "tz": 0, "d": 28.32, "az": -20.68, "el": -11.09 }`

`POSE0` = (b) en attendant la planche ; `episode.json` → `cover` aussi.

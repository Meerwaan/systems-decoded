# 048 · Tunnelier — les décors

Contrat posé le 13/11 par l'architecte (`docs/journal/048-architecte.md`). Voix réelle : 92,07 s. Trois fichiers, trois agents en parallèle : **`model.js`** (le système, plein), **`sol.js`** (le terrain aux rayons X), **`rue.js`** (la rue, l'immeuble, la voiture, la ville, le ciel). Chacun a son bouchon gris dans `episodes/048-tunnelier/src/` avec son API définitive : on remplace les corps, on garde l'API (exports, signature d'`update`, nombres lus). Coordonnées et dimensions : `src/plan.js` (le lire en entier, il est court). Le contrat : `src/world.js` (`FIRST`, `apply`).

**Pour les trois** — la contre-vérification (`docs/faits/048-contre-verification.md`) vaut pour l'image : **le tassement montré est de quelques millimètres, quasi invisible** — jamais un effondrement, jamais un affaissement de plusieurs centimètres, jamais un trou qui atteint la rue ; « le sol se soulève » = un bombement léger ; **aucune valeur de pression** au front ni nulle part (pas de « 3 bars », pas de graduation chiffrée sur le manomètre), aucun seuil contractuel écrit. Échelle vraie partout (la coupe fait 45 m du toit au radier : elle tient en vertical), sauf la jauge de tassement, grossie ×50. Azimut vérifié sur bouchon : az 0 = le flanc +z (la coupe de profil, la machine avance vers la GAUCHE), az −90 = devant la roue (−x), az −40 = trois quarts avant gauche (la lumière clé vient de −x, +y, +z).

## model.js

**Ce que c'est** : l'avant d'un tunnelier à pression de terre (EPB) du Grand Paris Express, **plein** (trois valeurs de gris, métal ≤ 0,5, arêtes fines), à l'échelle vraie : Ø 9,83 m, bouclier 11,1 m (énoncé EAE ligne 16, lot 1). Repère de `plan.js` : face de la roue sur x = 0, axe sur y = `TBM.axisY` (−1591), la machine vers +x. world.js le monte tel quel dans la coupe (origine) ou sur l'établi (à −`BENCH_FROM`) : UN objet re-parenté.

**À construire** (`TBM` dans plan.js) :
- **La roue de coupe** (`head`) : disque de ~9,8 m, six rayons (bras) et des ouvertures entre eux par où la terre entre, **molettes** (disques de coupe, 111 dans l'énoncé : en instances, une couronne lisible — pas 111 points qui scintillent) et **couteaux** (26) ; la pièce-héros la plus claire de l'objet. Elle tourne autour de x (`wheel`, en tours cumulés) : rien de fin qui défile vite (les molettes se fondent en gris par `fwidth` dès qu'elles passeraient sous le pixel).
- **La chambre d'abattage** (`chamber`) entre la roue et la cloison, **pleine de terre** : une pâte brune sombre (une matière à part, mate, grain au shader), qui baisse avec `earth` en laissant des vides **sous la voûte** (en haut de la chambre : c'est là que la pression lâche), et qui se tasse quand elle se remplit. `litChamber` : une lueur veille douce sur la terre.
- **La cloison étanche** (`bulkhead`) et ses **capteurs de pression** (cinq pastilles) ; **le manomètre** sur une console au bord de la coupe (+z), face caméra : cadran clair, une bande verte au sommet, l'aiguille qui lit `press` (droite à 1, vers la gauche quand ça chute, vers la droite trop fort ; signal hors de la bande). **Aucun chiffre sur le cadran.** Au bouchon, la console est à `TBM.bulkhead.gauge` ([330, −1361, 330]) : les vérins passent derrière (planche p1 « gauge ») — à déplacer si elle se lit mal, et le dire (la ligne exacte de `plan.js` sous « À changer ailleurs »).
- **La vis d'extraction** (`screw`) : tube incliné du bas de la chambre jusqu'à l'arrière, avec sa spire visible par une fenêtre du tube (côté +z) et la terre qui y monte ; elle tourne (`screw`, tours cumulés).
- **Le bouclier** (`shield`) : la peau, et `cutaway` 1 retire sa moitié proche (+z) — la roue, elle, reste entière — : on voit la chambre, la cloison, la vis, les vérins à travers la coupe ; un liseré clair sur la tranche de la coupe.
- **Les vérins de poussée** (`rams`) : 14 paires sur une couronne, leurs sabots sur le dernier anneau ; `rams` 0 → 1 = leur course (≈ 1,8 m) : tout ce qui est devant les vérins avance de −x d'autant (la roue « avance et gave la chambre »). `litRams` : les tiges en veille.
- **L'érecteur** (`erector`) : le bras qui pose les voussoirs, entre les vérins (rendu simple, il ne bouge pas).
- **Le dernier anneau** (`ring`) : **sept voussoirs** de béton (gris clair mat, joints lisibles), chacun avec sa lueur veille : `ring` 0 → 7 les allume un à un (fractionnaire : le suivant entre en fondu).
- **Les flèches de pression** au front : quatre à cinq flèches **signal** venues du sol et de la nappe (`arrows`, longueur fixe) qui poussent sur la face, et autant de flèches **veille** venues de la chambre (`hold` : leur longueur, indépendante de `press`) : à `hold` 1 elles se rejoignent sur la face, à 1,4 elles la repoussent.
- **Le cœur seul** (`solo`) : tout sauf la chambre, la cloison et son manomètre passe en fantôme (« au cœur… la pression »). Larges, pleines, lisibles à 270 px (c'est le plan du principe). Cachées sur l'établi.
- **La cote** (`cote`) : une ligne de cote encre en travers de la roue, qui se dessine de 0 à 1 (« presque dix mètres » : la voix le dit, l'étiquette `#chip-roue` le porte — pas de texte 3D).

**L'éclaté** (`explode`, sur l'établi seulement) : une rangée **en diagonale le long de +x** (`EXPLODE` dans plan.js : la roue part vers −x, la vis se soulève et recule, les vérins et l'anneau reculent), lue de l'avant gauche (az ≈ −62) : la roue au premier plan, la chambre (et sa terre, en galette), la cloison et son manomètre, la vis, les vérins, l'anneau. Le bouclier s'efface pendant l'éclaté.

**API** (inchangeable) : `buildSystem() → { root, parts, A, update(p, time, px) }` ; `parts` : `head chamber bulkhead screw shield rams erector ring` (chacun ses matières) ; ancres `A` : `face head cote chamber bulkhead gauge screwIn screwOut rams ring ringKey`.
**Nombres lus** : `bench explode wheel screw earth press rams ring cutaway arrows hold solo cote litHead litChamber litBulk litScrew litRams`.

**Images à réussir** (liste fermée ; poses de `VIEW`, provisoires, à reprendre dans ton journal si tu en trouves de meilleures) :
1. `VIEW.whole` sur l'établi (`set` 0, `cutaway` 0) : la machine entière, trois quarts avant gauche, la roue claire sur son halo — l'image de « on l'ouvre ».
2. `VIEW.exploded` (`explode` 1) : la rangée diagonale, chaque pièce lisible à 270 px, la terre de la chambre en galette brune.
3. `VIEW.headBench` (`cote` 1, `litHead` 1) : la roue, ses molettes, sa cote.
4. `VIEW.gaugeBench` (`solo` 1) puis `VIEW.gauge` dans la coupe : le manomètre lisible, l'aiguille au vert (`press` 1) puis décrochée (`press` 0,6).
5. `VIEW.profile` dans la coupe (`cutaway` 1) : la roue, la chambre pleine (`earth` 1) puis vidée sous la voûte (`earth` 0,55), la cloison, la vis.
6. `VIEW.principle` (`arrows` 1, `hold` 0 → 1 puis 1,4) : les flèches rouges et vertes de même longueur qui se rejoignent sur la face ; trop fort, les vertes plus longues.
7. `VIEW.rear` (`rams` 0 → 1, `ring` 0 → 7) : les vérins sur l'anneau, les sept voussoirs qui s'allument un à un, la sortie de la vis.

**Propre au dossier** : la machine est la seule chose pleine du film — elle doit rester lisible **à travers** le terrain de verre (pas de pièce sombre sur fond sombre : la roue claire, la terre de la chambre plus chaude que le métal). `press` sert aussi à l'en-tête (un mot) : ne le redéfinis pas. Aucun texte en 3D.

## sol.js

**Ce que c'est** : le bloc de terrain sous la rue, **aux rayons X** (verre `glass` + `asShell`, traits fins, aucun sol plein), coupé le long de sa face proche (z = `GROUND.z1` = 650) : c'est la « coupe » du film. Il possède y −60 → −3000 (rue.js possède la chaussée, 0 → −60).

**À construire** (`GROUND` dans plan.js) :
- **Le bloc** et ses **couches** (traits encre sur la face de coupe, légèrement ondulés, sans nom : géologie illustrative), une texture de grain très discrète sur la face de coupe (des points qui ne scintillent pas, fondus par `fwidth`).
- **La nappe** (`water`) : sa ligne de niveau à −520 et, dessous, des tirets encre lents qui disent « de l'eau dans le sol » (≤ 1/7 de période par image).
- **Le front** (`face`) : la paroi de terre contre la roue, en blocs qui **se détachent sous la voûte et glissent vers la roue** quand `face` → 1 (perte de front : quelques blocs, des grains qui coulent, signal sur leurs bords) ; `face` < 0 : la paroi repoussée d'un cheveu (trop de pression). Toujours **petit** : décimètres, jamais une caverne.
- **La colonne qui se relâche** (`loose`) : de la voûte jusque sous la chaussée, légèrement en avant de la machine (`GROUND.loose`), un **lavis signal** qui monte (front de lumière qui grimpe de la voûte vers la rue quand `loose` croît, comme `climb` au 008) — de la terre qui se décomprime, **jamais un vide**, jamais une cheminée ouverte. Additive, ≤ 0,3 d'opacité sur le verre : elle ne doit pas faire une dalle rouge (planches p2–p5 : le bouchon en faisait une).
- **L'échelle de profondeur** (`depth`) : sur la face de coupe à x −900, un trait par 10 m (0, −10, −20 m), **sans chiffre** ; l'étiquette `#chip-bar` dit la règle (« un bar tous les dix mètres ») — **aucune valeur ne doit pouvoir se lire au niveau de la machine**.
- **Le tunnel déjà revêtu** (`tunnel`) : derrière la machine, les anneaux de verre posés (largeur 1,8 m, joints de voussoirs en traits), jusqu'au bout du bloc ; un rail et le convoyeur du train suiveur en traits fins si tu as de la place.

**Réutilise** : `kit/lib/atmo.js` (grille), le verre du kit ; pour la colonne qui monte, l'idée de `climb` (`008/src/model.js`). Rien d'existant au catalogue ne fait un terrain en coupe.

**API** : `buildGround() → { group, A, update(p, time, px) }` ; ancres `A` : `face faceTop water scale scaleTen lining loose`.
**Nombres lus** : `soil face loose water depth tunnel`.

**Images à réussir** :
1. `VIEW.face` (`face` 0 → 1, `loose` 0 → 1) : devant la roue, les blocs qui se détachent sous la voûte et glissent, la colonne signal qui monte au-dessus — lisible à 270 px sans être un trou.
2. `VIEW.principle` (`depth` 1, `water` 1) : la face de terre entre les flèches du système, l'échelle à côté, la nappe.
3. `VIEW.section` : toute la coupe, de la chaussée au radier, les couches et la nappe lisibles sans griser la machine.
4. `VIEW.rear` : le tunnel revêtu qui file derrière la machine (les anneaux de verre en perspective).
5. `POSE0` (candidate A, `face` 0,4, `loose` 0,5) : vue plongeante à travers la rue : la colonne lisible entre la voiture et la roue.

**Propre au dossier** : le terrain est **le fond** de la machine, pas un sujet : quand `soil` vaut 1 il reste sombre et fin, la roue doit s'y lire comme « claire sur sombre ». La caméra traverse le verre du bloc (POSE0 est à l'intérieur) : aucune face ne doit devenir une dalle grise quand on la voit en rasant.

## rue.js

**Ce que c'est** : la rue de Paris la nuit au-dessus de la machine, **aux rayons X**, et ce que la fin du film demande autour : l'immeuble de six étages, la voiture de verre, la jauge de tassement, la cuvette, le quartier vu de haut et le tracé du tunnel, le ciel et son satellite. Repère de plan.js.

**À construire** (`STREET`, `BUILDING`, `BEDROOM`, `CAR`, `TROUGH`, `RULER`, `TOWN`, `SKY`) :
- **La chaussée en coupe** (enrobé 8 cm, fondation jusqu'à −60), marquage au sol, **trottoirs** et bordures (15 cm), deux ou trois réverbères ; tout en verre et traits — **pas de dalle claire** (le bouchon en fait une : planches p3–p4, la chaussée vue en rasant devient un pan blanc).
- **L'immeuble de six étages** côté −z (rez-de-chaussée + six étages + combles, une cave) : façade de verre, planchers en traits, fenêtres éclairées la nuit (`lights`, quelques-unes éteintes), le balcon filant d'un immeuble parisien suggéré par un trait. **La chambre** du 2ᵉ étage (`sleeper`) : **importe `buildChambre` du 022** (`episodes/022-batterie-telephone/src/chambre.js` : une chambre aux rayons X, toi de verre endormi sur le côté, qui respire) montée à `BEDROOM.at`, sa fenêtre plus claire ; ses téléphones (`ranks`) restent hors scène.
- **La voiture** : **importe `buildCar` du 011** (`episodes/011-fusible-pyro/src/car.js`, déjà fait dans le bouchon : `wall` 0 cache son mur et sa route), le nez vers −x, voie proche (z +175), `carX` la place ; toi au volant. Ses roues ne tournent pas d'elles-mêmes : si tu ne peux pas les faire tourner sans toucher au 011, dis-le (« À changer ailleurs »).
- **La cuvette de tassement** (`settle`, en mm) : sur la tranche de la chaussée (et une bande sur sa surface), une **lueur signal en gaussienne** (`TROUGH`) dont l'intensité suit `settle` / 10 ; la chaussée se déforme de sa **vraie** valeur (8 mm au plus : invisible) ; un trait encre fin garde le niveau d'origine. `settle` < 0 (« ta rue monte ») : la même lueur, en bombement — jamais de chiffre.
- **La jauge de tassement** (`ruler`) : une mire sur la bordure proche (`RULER.at`), graduée de 0 à 12 (chiffres 0, 5, 10 permis : ce sont les millimètres que la voix dit), **grossie ×50** (1 mm = 5 cm sur la mire), bande rouge à partir de 10 ; un index clair relié à la chaussée qui descend avec `settle` (signal au-delà de 10, encre avant). Elle doit se lire à 270 px dans `VIEW.kerb`.
- **Le quartier vu de haut** (`town`) : des îlots de verre (hauteurs variées, cours, toits en traits) autour de la rue, à perte de vue ; **le tracé du tunnel** (`trace`) en tirets veille sous la ville, qui part de la machine et remonte son chemin (`trace` 0 → 1 le dessine).
- **Le ciel de nuit et le satellite** (`sat`) : quelques étoiles fixes (pas de scintillement), un satellite plein minuscule qui traverse haut (`SKY`), un cœur brillant et une longue traîne fine. (L'horloge qui avance est dans le panneau du prochain dossier, pas en 3D.)

**Réutilise** : 011/car (importé), 022/chambre (importé), `nightLights` de `kit/lib/details.js` pour les fenêtres lointaines du quartier si ça sert.

**API** : `buildStreet() → { group, A, car, update(p, time, px) }` ; ancres `A` : `car carRoof ruler rulerIndex trough building roof bedroom window town sat`.
**Nombres lus** : `street carX settle ruler lights sleeper town trace sat`.

**Images à réussir** :
1. `POSE0` (candidate A « plongée du 5e », `carX` −400, `settle` 1) : la voiture de verre grande en haut à gauche, la lueur de la cuvette sous ses roues, la rue qui « s'enfonce » sans bouger d'un centimètre.
2. `VIEW.kerb` (`settle` 2 → 7 → 10) : la mire en gros plan, son index qui descend vers le rouge, la voiture qui passe derrière.
3. `VIEW.section` : la rue entière, l'immeuble aux fenêtres allumées, la voiture, lisibles au-dessus de la coupe.
4. `VIEW.bedroom` (`sleeper` 1) : la façade, la fenêtre du 2ᵉ, toi endormi derrière.
5. `VIEW.town` (`town` 1, `trace` 1) : le quartier vu de haut, le tracé veille sous les îlots.
6. `VIEW.sky` (`sat` 0 → 1) : le ciel au-dessus de la rue, le satellite qui le traverse.

**Propre au dossier** : rien de clair ne doit couvrir la machine dans POSE0 (la chaussée et le trottoir vus d'en haut en sont le premier plan) ; la fin (`bedroom`, `town`, `sky`) dit « ça passe sous chez toi » : une ville habitée, calme, pas une ville en danger. `settle` est lu par l'en-tête : mm vrais, jamais grossis ailleurs que sur la mire.

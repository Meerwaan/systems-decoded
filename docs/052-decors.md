# 052 · Télésiège débrayable — les décors

Contrat : `episodes/052-telesiege/src/plan.js` (où tout se tient, le chemin d'un siège `pathAt`, les vitesses `speedAt`), `world.js` (`FIRST`, `apply`, `VIEW`). Trois fichiers, trois agents en parallèle. Chaque bouchon porte déjà son API définitive (en-tête du fichier) : on garde les exports, la signature d'`update` et les nombres lus ; on remplace les volumes gris.

Ce qui vaut pour les trois : **échelle vraie** (la gare ≈ 27 m, la poulie Ø 5,2 m, le câble Ø 52 mm, la ligne 22 km de x) ; la nuit en montagne ; le câble court à **5 m/s réels** (`rope`) : ses torons (un trait clair tous les `CABLE.lay` = 30 cm, en hélice) doivent se lire qui défilent à 270 px sans scintiller — un motif qui passerait sous 4 px se fond en gris (`fwidth`), jamais un clignotement. **Même idiome de câble dans `gare.js` et `ligne.js`** (acier sombre 0x3a3f45, `metal` ≤ 0,5, traits ink à 0,35, phase = (abscisse le long du câble − `rope`) / `lay`) : le câble sort de la gare et devient la ligne sans couture à x 1500. Rien n'est réutilisé tel quel : le catalogue n'a ni gare, ni câble de remontée, ni siège (la pente du 029 et le col du 027 portent leur propre histoire). Le décorateur pourra reprendre les sapins de `dressSlope` (029/habillage.js) sous la ligne.

« À ne pas dire » qui vaut pour l'image : aucun chiffre de serrage (la jauge n'a pas de graduation chiffrée) ; le pesage n'est jamais « infaillible » (pas de grand voyant vert « OK » absolu) ; aucun siège qui glisse ou recule sur la ligne, aucun accident ; aucun modèle de constructeur reconnaissable (pas de logo, pas de forme de marque) ; un vélo ou une voiture n'apparaissent pas.

## model.js

**Le système, plein** : la pince débrayable d'un siège (`buildGrip()`), dans le repère de la pince de `plan.js` (origine sur l'axe du câble quand elle est fermée ; x le sens de la marche, y en haut, z vers l'extérieur — côté où sont la came, le galet, le levier).

- **À construire** : le corps de pince (fonte sombre) ; le **mors fixe** (côté intérieur, il berce le câble) et le **mors mobile** (côté extérieur, il se referme dessus) — usinés, plus clairs ; le **levier** qui part vers l'arrière (−x) jusqu'au **galet** (`GRIP.roller`) ; le **ressort de serrage** à boudin le long de x (`GRIP.spring`) : la pièce-héros, nettement plus claire, ses spires lisibles (6 à 9 spires, fil épais) — c'est le cœur ; la **tôle de friction** sous le corps (`GRIP.plate`, que les pneus entraînent) ; la tête de suspente où pend le siège (`GRIP.hanger`). Sur l'établi seulement (`bench` 1) : un tronçon de **came** (la poutre au-dessus du galet, `CAME`, avec sa rampe) et un tronçon de **câble** (1,8 m, torons).
- **Le geste `open`** (0 fermée → 1 ouverte) : la came appuie le galet de `CAME.push` = 6 cm, le levier bascule autour de son axe, le mors mobile s'écarte (≈ 25°, le vide se voit entre lui et le câble), le ressort se **comprime** (les spires se serrent : c'est lui qui repoussera). À vérifier de profil sur deux images avant / après (sens du levier, de la compression). Une pièce qui s'ouvre se filme de profil.
- **`weak`** : un liseré signal sur les spires, et les mors se ferment sans force (un jour de 1 à 2 mm reste lisible de près, `still`) — jamais une pièce cassée ou absente. **`slip`** (cm) : le tronçon de câble de l'établi fait défiler ses torons de `slip` ; dans la gare, `slip` ne sert qu'aux mors (rien d'autre à faire).
- **`explode`** sur l'établi : les pièces s'écartent dans le sens où elles travaillent (le galet et le levier vers le haut-arrière, le mors mobile vers l'extérieur, le ressort vers le bas-avant, la came monte) — une colonne verticale maigre est à éviter (règle « objet coaxial »). Chaque pièce a ses propres matières (`setPartOpacity`). `lit*` : la pièce nommée s'éclaire faiblement en veille ; `litSpring` est le cœur (une coque veille sur le ressort).
- **API** (bouchon) : `buildGrip() → { root, parts, A, update(P, time, px) }` ; `parts` : `body fixedJaw mobileJaw lever roller spring plate came rope` ; `A` : `jaws lever roller spring came plate hanger`. Nombres lus : `bench explode open weak slip litCame litLever litRoller litJaws litSpring`.
- **Échelle** : vraie (corps ≈ 56 cm, câble Ø 5,2 cm). `GRIP_SIZE` 40, l'établi porte la pince l'axe du câble à `BENCH_LIFT` 46 cm. Si une cote change (galet, came, tôle), la ligne exacte va dans le journal sous « À changer ailleurs » pour `plan.js` : `gare.js` et `ligne.js` lisent `CAME`, `GRIP.plate`, `GRIP.hanger`, `GRIP.roller`.

**Images à réussir** (établi, `VIEW.whole`, `exploded`, `cameBench`, `spring` ; dans la gare `VIEW.grip`, `jaws`, `still`, `came`) :
1. la pince entière ouverte sur son tronçon de câble, trois quarts extérieur (`whole`) : on comprend « une pince » sans légende ;
2. l'éclaté, chaque pièce isolée et lisible à 270 px (`exploded`) ;
3. le galet sous la came, le levier basculé (`cameBench`) ;
4. le ressort seul, ses spires, sa coque veille (`spring`) — puis sa détente quand `open` passe à 0 ;
5. sur le siège, dans la gare : la pince ouverte, le **vide entre les mors et le câble** qui défile (`jaws`, `grip`) ;
6. fermée à vitesse égale : les torons immobiles entre les mors (`still`) ;
7. fermée « mal » (`weak` 1) : le liseré signal, le jour entre les mors.

## gare.js

**La gare, aux rayons X** (`buildStation()`) : l'enveloppe de verre (toit, piliers, traits fins), le quai en grille — pas de sol plein —, et pleins dedans, seuls : **le câble** de l'entrée côté arrivée, autour de la **grande poulie** (Ø 5,2 m, axe vertical, sa jante et ses rayons ; elle tourne avec `rope`), jusqu'à la sortie côté départ ; **la came**, une poutre continue le long du rail (de `CAME.startX` à l'arrivée, autour de la poulie, jusqu'à `CAME.stopX` au départ, rampes aux deux bouts) ; les **trains de pneus** (pneus noirs à jante claire, un tous les 75 cm, le ralentisseur à l'arrivée, le lanceur au départ, la rangée lente autour de la poulie et le long du quai) — chaque pneu tourne à la vitesse de sa place (`speedAt`) : la rangée du lanceur tourne de plus en plus vite le long du quai, et tout s'arrête quand `rope` s'arrête ; le **capteur de pesage** : le tronçon de came instrumenté au bout du quai (`WEIGH`) qui fléchit d'un rien sous la pince (`weigh`), et sa **jauge** sur un poteau à l'extérieur du rail (une barre verticale, une bande rouge jusqu'à `WEIGH.ok`, un repère `force` ; aucun chiffre) ; la **voie de garage** (`GARAGE`) et son aiguillage (`iso`) ; les **deux flèches de vitesse** du principe au-dessus de la pince du héros (celle du câble, longue, ink ; celle du siège, veille, `vchair` × sa longueur).

- Le rail du siège court `FREE` = 10 cm sous le câble dans la gare : c'est sur lui que roule la tôle (pneus dessous) et que la came tient le galet.
- La lumière : une gare la nuit — quelques sources qui ont un endroit (au plafond, au-dessus du quai), pas un voile. Le décorateur fera le portillon, la cabine du conducteur, les barrières, les sapins dehors : laisse-leur de la place côté extérieur du quai.
- **API** (bouchon) : `buildStation() → { group, A, update(P, time, px) }` ; `A` : `wheel mouth quay slowRow launchRow weigh gauge garage cameIn`. Nombres lus : `station rope chair arrows vchair weigh force iso litCame litTyres litWeigh`.

**Images à réussir** (`VIEW.wheel`, `tyres`, `principle`, `came`, `weigh`, `run`, `wide`, `garage`, et `POSE0`) :
1. le câble qui file autour de la poulie vu d'en haut et derrière (`wheel`) — la poulie tourne, les torons courent ;
2. la rangée du lanceur sous un siège, de l'extérieur, bas (`tyres`) ;
3. les deux flèches côte à côte au-dessus de la pince, la courte qui s'allonge jusqu'à l'autre (`principle`, `vchair` 0,2 → 1) ;
4. le galet posé sur la came, le siège qui roule seul (`came`) ;
5. le capteur et sa jauge, la pince qui passe, la jauge qui reste dans le rouge (`weigh`, `force` 0,4) ;
6. lancé : le quai qui défile sous le siège (`run`) — rien de fin qui défile vite (les traits de la grille se fondent avant de scintiller) ;
7. la gare entière d'en haut, tout arrêté, les sièges qui se balancent (`wide`) ;
8. le siège isolé sur la voie de garage (`garage`) ;
9. la première image (`POSE0`) : la came et l'entrée de la gare côté arrivée, nettes en contre-plongée.

Ce qui est propre au dossier : la gare est générique (aucun constructeur) ; la jauge ne montre jamais un « OK » vert absolu — sa partie haute reste ink, seule la bande basse est signal ; tout ce qui tourne (poulie, pneus) tire son angle de `rope`, jamais de `time`.

## ligne.js

**Les sièges et la ligne, aux rayons X** (`buildLine()`) : le **siège du héros** (un quatre places de verre, sa suspente, son dossier, son garde-corps relevé ; il pend d'aplomb sous la pince même dans la pente), le `gripMount` où `world.js` accroche la pince pleine ; **toi**, de verre (`kit/lib/figure.js`, `makeFigure` en `shell`), debout au bord du quai (`sit` 0) puis assis, le garde-corps qui descend (`sit` 1) ; les **autres sièges** dans la gare (`others` : deux devant, deux derrière, aux vitesses de leurs places) et **tout le long de la ligne** (un tous les 12 m, qui montent côté départ, qui descendent côté arrivée, portés par `rope`) ; le **câble de la ligne** (même idiome que `gare.js`), les **pylônes** (`LINE.towers` : fût, tête, balanciers de galets sur lesquels passe le câble), le **sol** qui tombe dans un creux juste après la sortie (« sous toi… la pente ») puis remonte raide (`GROUND`, en grille de verre, pas de dalle), les **crêtes** au loin en traits ink et le **ciel de nuit** (dôme à l'infini ; l'idiome du ciel : `026/sky.js` ou `007/jet.js`) ; les **deux flèches du commentaire** sur le siège du héros dans la travée la plus raide (`pull` : rouge vers le bas le long du câble, verte vers le haut deux fois plus longue).

- La pince sur le siège du héros est celle de `model.js` (pleine). Celles des autres sièges sont des silhouettes simples (pleines, sombres, sans détail) qui s'allument en veille avec `greens`.
- `sway` : chaque siège se balance sur sa pince (phase propre, amplitude ≤ 9°), seul effet qui lit `time`.
- **API** (bouchon) : `buildLine() → { group, gripMount, A, update(P, time, px) }` ; `A` : `seat rider steep exit next`. Nombres lus : `line rope chair free iso others rider sit sway pull greens`.

**Images à réussir** (`POSE0`, `VIEW.quay`, `exit`, `steep`, `climb`, `wide`) :
1. la première image : le siège qui arrive de la ligne, grand, sa pince qui lâche le câble ; derrière, la ligne qui monte dans la nuit et le siège suivant qui descend (`POSE0`) ;
2. toi qui t'assois sur le siège qui ralentit, au quai (`quay`, `sit` 0 → 1) — de verre de la tête aux mains ;
3. la sortie : la gare finit, le creux sous le câble, la pente qui monte en face (`exit`) — le vertige se lit à 270 px ;
4. de profil dans la travée la plus raide, les deux flèches (`steep`) ;
5. la ligne d'en bas, les sièges qui remontent un par un, pinces vertes (`climb`, `greens` 1) ;
6. tout arrêté, les sièges qui se balancent (`wide`, avec `gare.js`).

Ce qui est propre au dossier : le siège est la forme qu'on reconnaît en un tiers de seconde — un quatre places générique, dossier et garde-corps lisibles en silhouette ; toi, jamais en très gros plan ; un pylône à 30 m doit encore se voir (le brouillard).

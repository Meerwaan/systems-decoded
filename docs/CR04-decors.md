# CR04 · Lac-Mégantic — les décors

Quatrième « Compte à rebours » (DA « noir chaud » : `docs/reconstitution.md`, `kit/lib/reconstitution.js` ; règles d'image : `docs/memoire/regles-image.md`). **Rien du catalogue n'est fidèle** (le TGV du 021 est de verre et n'est pas un train de fret) : trois décors neufs, fidèles au rapport du BST **R13D0054**. Pas de décorateur : chaque décor porte lui-même ce qui le fait vivre (fumée, bouffées d'air, phares, lumières de la ville).

**Le contrat commun** (lis `src/plan.js` en entier : il est court et il est la loi) :
- **Un seul lieu, un seul plan incliné.** Tout le film tient sur la pente Nantes → Lac-Mégantic : `y = groundY(x)` (`GROUND.g` 3,5 %, pente accentuée : la vraie fait 0,92 %), distances compressées (≈ 2,4×). **Le sol, c'est le plancher du studio** (la grille ambre, le halo, le capteur d'ombre) que `world.js` incline sur ce plan sous le foyer à chaque image : **aucun décor ne construit de sol**. Ce qui se pose au sol reste VERTICAL sur `groundY(x)` ; seul ce qui roule sur la voie penche avec elle (`trackFrame(u)`).
- **Axes** : le train descend vers **−x** ; `u` = l'abscisse le long de la voie (croît vers la ville), 0 = la tête du train garé. Repère de chaque véhicule : origine au champignon du rail, à mi-longueur ; **avant −x, flanc gauche +z**, y en haut. **az 0 voit le flanc gauche, az −90 l'avant, az +90 regarde la descente depuis l'arrière** ; dans la courbe de la ville, ajoute le cap de la voie.
- **Matières** : argile satinée (`clay({ tone })`, deux voisins = deux valeurs), arêtes claires (`clayEdges`, ≥ 1,8 px) ; **tout est plein** (pas de verre aux rayons X dans ce format). **Vert** = ce qui marche (`safe(mat)` + `setOk`), **rouge** = l'incident (`alarm()` + `setAlarm(mat, k)`, choisi par `S.culprit`, plan.js `CULPRIT`), `heal(mat, S.depuis)` sur les freins à main. Une pièce rouge à la fois.
- **`update(S, time, px)` ne dépend que de S et du temps** (aucun `Math.random`, aucune horloge, aucune allocation) ; il peut être appelé plusieurs fois par image.
- **Personne à l'image** (ni silhouette, ni main, ni cabine éclairée habitée) ; pas de flamme en ville ; aucun nom propre écrit, sauf le numéro « 5017 » sur la cabine de tête (fait du rapport) si tu le poses.
- Ton bouchon (volumes gris, API définitive) est déjà branché : `npm run check -- CR04` construit. Garde exports, signature, ancres et nombres lus ; réécris tout le reste. Planches dans `.cache/planches/CR04/<ton fichier>/`, jamais dans `renders/` ; **30 images lues au plus** ; journal `docs/journal/CR04-<ton fichier>.md` (poses qui cadrent, « À changer ailleurs »).
- Les poses `VIEW` de `world.js` sont **provisoires** (réglées sur bouchons) : donne dans ton journal celles qui cadrent sur ton vrai décor, sans toucher `world.js`.

---

## locomotive.js

**Le système, plein : la locomotive de tête MMA 5017, une GE C30-7**, et du même constructeur les quatre autres (fermées). C'est le décor le plus lourd et le plus vu : la première image (sa roue de tête), le `principe` (en coupe sur son halo), et presque chaque étape.

**À construire** (1:20, plan.js `LOCO`, `PARTS`) :
- **La caisse** : châssis et passerelle (`deck` 7,6), capot court à l'avant, **cabine** (vitres sombres, deux sièges dedans), **capot long** (portes latérales), section radiateurs à l'arrière (plus large, grilles), garde-corps fins, marchepieds, chasse-neige, attelages, phares éteints. Silhouette Dash-7 de GE reconnaissable de trois quarts (recale-la sur une photo publique ou un diagramme du C30-7 : 20,5 m, 3,12 m, 4,7 m).
- **Deux bogies C-C (FB-2)** : six roues de 40 po (`r` 2,54) chacune avec **un rayon ou un repère** qui montre qu'elle tourne, longerons, boîtes d'essieu, ressorts. **LA roue** (`PARTS.wheel`, avant gauche) porte tout le frein : **le cylindre de frein** sur le longeron (`PARTS.cylinder`), sa **tige de piston** qui sort de `psi`, le **sabot** sur la bande de roulement (`PARTS.shoe`) — serré tant que `psi > 0`, décollé de ≈ 0,4 à `psi` 0.
- **Le frein à main** : un **volant vertical** (`PARTS.volant`, r 1,4, rayons) sur le flanc gauche, sa **chaîne** qui descend à la timonerie du bogie avant (`PARTS.chain`) ; serré (`brakes > i`) : le volant a tourné de quelques tours, la chaîne est tendue droite ; desserré : chaîne molle. Chaque locomotive a le sien (les cinq comptent parmi les sept).
- **L'intérieur (tête seule)**, vu quand `cutaway` lève les portes gauches du capot long : le **moteur diesel** (FDL-16, le gros bloc), son **turbo** et la **cheminée** au-dessus (`PARTS.turbo`, `PARTS.stack`), le **compresseur d'air** derrière la cabine, entraîné par le moteur (`PARTS.compressor`), les **réservoirs principaux** sous le châssis entre les bogies (`PARTS.reservoir`), la **conduite** qui va du réservoir au cylindre de frein (un tube fin le long du châssis), le **coupe-circuit de carburant** d'urgence sur le longeron gauche (`PARTS.cutoff` : une poignée rouge sous capot, qui bascule).
- **La cabine** (`cab` lève son flanc gauche et son toit) : le **pupitre** du mécanicien à droite (`PARTS.stand`) avec **deux poignées de frein** côte à côte — l'automatique (le train) et l'indépendant (les locomotives) — et un double manomètre ; **deux sièges** (`PARTS.seats`) ; deux **casques** de chantier sur les sièges quand `crew` monte (0 → 2, un par siège).
- **Ce qui vit** : la **fumée** de la cheminée (`smoke`, volutes d'argile sombre ou de particules, déterministes), les **flammes** (`fire` : rouges, elles SONT l'incident ; le turbo rougeoie dessous), le **frémissement** du moteur qui tourne (`engine` : la caisse vibre d'un dixième, le compresseur tourne, le turbo aussi), les **bouffées d'air** qui s'échappent des raccords sous le châssis (`leak` : petits nuages blancs qui naissent et se dissipent, cadencés sur `time`).

**Plein, argile** : caisse `tone` −0,2, roues et dessous sombres −0,7, l'intérieur clair. **Vert** (`safe`) : le compresseur, les réservoirs, la conduite et le cylindre tant que `ok` est allumé (l'air qui tient). **Rouge** (`alarm`) selon `culprit` : 1 le moteur et son turbo · 2 le compresseur · 3 le cylindre, son piston et ses raccords · 4 **le volant et la chaîne de chaque frein à main serré** (`heal` avec `depuis`). Les quatre autres locomotives : même silhouette, capots fermés, moteur éteint, leur volant et leur cylindre.

**API** : `buildLocomotive({ lead }) → { group, A, haloR, update(S, time, px, i) }`. `group` est dans le repère local du véhicule : **`world.js` le place à chaque image** (matrice, `matrixAutoUpdate` false — ne touche jamais `group.position` / `rotation`). Ancres `A` : `wheel shoe cylinder volant chain compressor reservoir engine turbo stack cutoff stand seatL seatR` aux places de `PARTS` (tu peux les déplacer de quelques unités si la vraie machine le veut : dis-le). `i` = son rang dans le train (0 la tête).

**Nombres lus** : `run` (les roues tournent : angle = run / r autour de +z, positif quand on roule vers −x) · `psi` · `brakes` (le sien si `brakes > i`) · `culprit fault ok depuis` · et sur la tête seule `engine smoke fire cutaway cab crew cutoff leak solo` (`solo` : `world.js` cache déjà les quatre autres).

**Les images à réussir** (poses provisoires de `VIEW` entre parenthèses) :
1. **La première image** : au ras du rail, la roue de tête et son sabot serré, énormes, la locomotive au-dessus, la file du train qui monte la pente dans le noir (`file`) — et les trois autres candidates (`roue`, `profilBas`, `face`) : à 0,02 s et 2,7 s, `run` 0 → 9 (la roue a tourné d'un tiers de tour : ça se voit).
2. **La coupe du `principe`** (`coupe`, `solo` 1, `cutaway` 1, `ok` 1) : moteur, compresseur vert, réservoir vert, conduite verte jusqu'au cylindre, sabot sur la roue — lisible à 270 px.
3. **Le cylindre** (`cylindre`) : `psi` 70 → 27 → 0, la tige rentre, le sabot se décolle de la roue (le climax de `defaut`).
4. **Le volant** (`volant`) : un tour de volant, la chaîne qui se tend ; rouge (culprit 4) puis vert (`depuis`).
5. **Le pupitre** (`pupitre`, `cab` 1) : la poignée de l'automatique qui se desserre, celle de l'indépendant qui reste.
6. **La cheminée** (`cheminee`) : fumée noire → flammes (`fire` 1), puis tout retombe ; le **coupe-circuit** (`coupecircuit`) qui bascule.
7. **Les raccords** (`raccords`) : les bouffées d'air sous le châssis, le moteur coupé.
8. **La cabine de `depuis`** (`cabine`) : deux sièges, deux casques.

**Propre au dossier** : la locomotive de tête est « restée allumée » (une seule fume, en vert au t1) ; son moteur « avait été mal réparé » (huile surchauffée dans le turbo → fumée, puis feu : § 1.15.1) ; les pompiers ont coupé le moteur **comme le prévoient les consignes** (jamais une faute à l'image). La place exacte du volant, du compresseur, du turbo et du coupe-circuit sur un C30-7 est **reconstituée** : recale-les sur une photo si tu en trouves une libre, sinon garde `PARTS`.

---

## convoi.js

**Le reste du train et la pente** : le wagon VB, le wagon tampon, les **72 wagons-citernes DOT-111**, la **voie** sur toute la longueur (de derrière la queue jusqu'au bout de la courbe en ville), la **route 161** à Nantes et ses phares, les **deux flèches** du `seuil`.

**À construire** :
- **La voie** le long de `trackFrame(u)` de `TRACK.from` à `TRACK.to` (courbe comprise) : ballast trapézoïdal (`RAIL.ballast`), traverses (une toutes les ≈ 3 unités près de la caméra ; plus loin un ruban suffit — les traverses peuvent être une texture ou des instances par tronçon visible), deux rails clairs qui accrochent la lumière (ils doivent se lire loin : c'est le trait qui mène à la ville). Pas de caténaire (voie non électrifiée).
- **Le wagon VB** (`LEN.vb`, un wagon spécial, de la forme d'un fourgon) et **le wagon tampon** (`LEN.tampon`, un wagon couvert) : chacun son **volant de frein à main** en bout de caisse (ils sont les 6ᵉ et 7ᵉ des sept), même lecture que ceux des locomotives.
- **Les 72 wagons-citernes DOT-111** (`LEN.citerne`) : citerne noire cylindrique (≈ 3 m de diamètre), dôme et trou d'homme sur le dessus, passerelle de bout, deux bogies, attelages, **un volant de frein à main** en bout (le leur reste noir et desserré tant que `brakes ≤ i` ; il s'allume vert quand `brakes` le dépasse : `comment` et `depuis`). En instances (`InstancedMesh`), placés à chaque image par `vehicleU(i, S.run, S.slack)` + `trackFrame` ; les roues tournent avec `run` ; **les attelages s'ouvrent** avec `slack` (la vague de la tête à la queue, plan.js `SLACK`).
- **Le déraillement** (`derail` 0 → 1) : les wagons qui atteignent `PILE.u` quittent les rails, se couchent et se replient en accordéon dans la courbe, ceux de derrière s'empilent (`PILE.len`, `PILE.spread`) ; les locomotives (placées par `world.js`) continuent seules. Pas de flamme ni de fumée ici (la lueur est à `ville.js`), personne.
- **Les cylindres de frein des wagons** : un petit cylindre sous chaque citerne, **vert** tant que `auto` est serré (le frein automatique du train), éteint quand il se desserre (t2 : « le vert s'éteint le long des wagons »).
- **La route 161** (`ROAD`) à droite de la voie (−z) au droit du train garé : bitume sombre, quelques poteaux ; **les phares** (`road` 0 → 1) : deux ou trois véhicules (juste des paires de phares et de feux arrière, pas de carrosserie détaillée) qui partent de la tête et s'éloignent vers Nantes (+x) puis s'éteignent au loin.
- **Les deux flèches du `seuil`** (`pull` rouge, vers le bas de la pente ; `hold` verte, vers le haut), larges et plates, posées au-dessus du milieu du train (`A.middle`), qui poussent de 0 à leur longueur ; elles doivent se lire dans le plan `pente` (le train entier).

**API** : `buildConvoi() → { group, A, update(S, time, px) }` ; `group` en coordonnées MONDE. Ancres : `vb`, `tampon` (leurs volants), `middle` (le milieu du train, déplacé à chaque image). **Nombres lus** : `run slack brakes auto culprit fault depuis derail pull hold road solo`.

**Les images à réussir** : (1) **la file du train** derrière la tête dans la première image (`file`) : les citernes noires qui montent la pente et se perdent dans le noir ; (2) **le train entier sur sa pente** (`pente`, `seuil` : flèches rouge et verte) — le train doit se lire comme un long trait qui descend vers la ville, pas comme une ligne de pixels : propose la pose qui le tient ; (3) **les sept volants qui s'allument un à un, tous en tête**, les 72 derrière sans (`tete`) ; (4) **les attelages qui se tendent un à un** (`attelages`, `slack` 0 → 1) ; (5) **les phares qui s'éloignent** puis le train seul (`route`, `seul`) ; (6) **la rangée de volants verts** de `depuis` (`rangee`, `brakes` 7 → 24) ; (7) **les citernes qui se couchent dans la courbe** (`courbe`, `derail`).

**Propre au dossier** : sept freins à main serrés, **tous en tête** (5 locomotives, VB, tampon) ; aucun sur les 72 citernes. Ne jamais montrer un frein à main « oublié » ou un geste fautif.

---

## ville.js

**Lac-Mégantic, le centre-ville en bas de la pente**, en argile : maisons et commerces le long de la courbe, la **rue Frontenac** et son passage à niveau, le panneau de limite « **16** », les lumières, la **lueur rouge** derrière les toits.

**À construire** (plan.js `TOWN`, `FRONTENAC`, `CURVE`, `trackXZ`) :
- **Le centre-ville** : 80 à 140 bâtiments d'argile claire (`tone` 0 à 0,4) des deux côtés de la courbe, du début de la ville (`TOWN.from`) au bout de la courbe — maisons à toit à deux pans, quelques immeubles de deux ou trois étages, une église (le clocher se lit de loin), des rues ; **verticaux sur `groundY(x)`**, jamais à moins de 40 de l'axe de la voie. Le **lac** au-delà, à droite de la courbe : un aplat sombre lisse, à peine plus bas.
- **La rue Frontenac** qui traverse la voie en `FRONTENAC.u`, à angle droit, son platelage, ses **feux de passage à niveau** (croix de Saint-André, deux feux qui clignotent avec `cross`).
- **Le panneau « 16 »** à gauche de la voie en `FRONTENAC.signU` : un poteau, une plaque claire, le chiffre lisible de près (le seul chiffre écrit dans le décor ; la voix le dit).
- **Les lumières** (`town`) : fenêtres ambre chaud et réverbères — ce sont « les lumières de la ville tout en bas » de la première image et du t1 : **elles doivent se lire depuis Nantes**, à 24 000 unités (points lumineux assez gros, rien de fin).
- **La lueur** (`glow`, issue) : un rougeoiement rouge derrière les toits au-dessus de la courbe, qui monte et respire lentement ; **aucune flamme visible, aucune personne**.

**API** : `buildVille() → { group, A, update(S, time, px) }`, coordonnées MONDE ; ancres `crossing`, `sign`, `centre`. **Nombres lus** : `town cross glow solo`.

**Les images à réussir** : (1) **les lumières au fond, en contrebas**, depuis la tête du train garé (`roue`, `vallee`) ; (2) **le train qui fonce de face vers la caméra** entre les premières maisons (`frontenac`) ; (3) **le panneau « 16 »** qui défile en un éclair (`panneau`) ; (4) **la vue large et lointaine** de la courbe, les citernes couchées (de `convoi.js`), la lueur derrière les toits (`courbe`).

**Propre au dossier** : la vraie limite à la rue Frontenac est de 10 mi/h (≈ 16 km/h) ; 47 morts, une quarantaine de bâtiments détruits — **on ne montre ni les victimes, ni l'incendie de la ville comme sujet** : une lueur, sobre, de loin.

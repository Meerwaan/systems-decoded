# L04 · `navire.js` — journal du décor

Le Charles de Gaulle aux rayons X, la mer et le ciel. Interface inchangée (`buildNavire() → { ship, sky, A, set }`). Ancres en plus : `A.bow`, `A.stern`, `A.mast`, `A.plant`, `A.curtain`, `A.lights` (les feux de descente).

## Ce qui est construit

- **La coque** dans le repère du navire (la quille est l'axe z, pas de `skew`) : six rangs par couple — bord du pont, dessous du pont (`slab`), bouchain (−7,6 m, juste sous le sol du hangar), flottaison, bouchain bas, fond plat — un couple tous les mètres environ, ramassés sur l'étrave (inclinée de 17 m entre le pont et le pied). Au-dessus de la flottaison : une coquille de verre (`asShell` 60, avec l'îlot) qui écrit sa profondeur ; en dessous : un verre plus pâle qui n'écrit rien (la mer passe dessus vu d'en haut ; il se montre caméra sous l'eau ou avec `fins`). L'arrondi, le tableau arrière, les filets de bâbord.
- **La peinture du pont** (shader, repère du navire) : ligne de sécurité à 1,4 m du bord (SDF du contour), les deux catapultes (une fente sombre entre deux filets, la voie, ses deux bouts), la piste oblique (bords, axe en tirets de 6 m qui se fondent en trait continu avant que leur période passe sous 14 px, zone d'appontage, trois bandes larges de l'arrondi, le seuil), un bordé à une seule échelle (25 m), et à l'étrave les derniers mètres en signal (peinture + contour signal). Tout trait ≥ 1,8 px, effacé avant qu'un pixel couvre 7 m.
- **Le couvercle** (ordre −5) : le noir de la scène sur les fosses — catapulte avant et frein d'Andromède (levé par `under`), catapulte oblique et deux autres freins (toujours). Il n'assombrit que les SOLIDES sous le pont.
- **L'îlot** : blocs de verre, vitrages de la passerelle navigation et de la passerelle aviation (tournée vers le pont), mât de deux tubes épais, deux dômes. Pas de treillis.
- **Le hangar** : volume de verre (coquille 50), cadres tous les 20 m, sol en grille de 4 m (s'efface avant de scintiller) et sa flaque de lumière, trois rampes au plafond, deux portes vers les ascenseurs et leur passage à travers la coque, le rideau coupe-feu (bord d'attaque, côtés, trame de 3 m qui descend avec lui).
- **Les ascenseurs** : plateaux de verre fin, leur contour, deux guides le long de la coque.
- **Les masses** : six rangs, un bloc plein par rang (corps, dessus clair, quatre roues : trois gris), deux rails par rang qui s'allument veille.
- **La chaufferie** : deux cuves de verre à fonds bombés, un cœur de lumière veille dans chacune ; la conduite (deux colonnes, puis vers l'avant et le ballon) où `feed` fait courir un front et des tirets veille à vitesse FIXE (900 cm/s, période 450 : 1/15 de période par image).
- **Les soutes** (verre signal dosé, arêtes), **les détecteurs** (≈ 1 000 points, vague de l'étrave vers l'arrière), **ailerons et gouvernail** (pleins, battent lentement).
- **Les lumières de nuit** (bord du pont tous les ≈ 30 m, bords et axe de la piste tous les 20 m, six feux de descente sur le tableau, trois projecteurs de l'îlot), **les feux de couleur** (deux rangées veille de 10 feux du parking à la navette, barre d'arrêt signal de 5 feux sous le nez), **le vent** (`makeStreaks`, deux jeux : quille / axe de la piste).
- **La coupe** à `CUTZ` = −3 680 (1,8 m devant le premier rang de masses, pour que son bloc reste entier) : tout ce qui est devant s'efface puis disparaît (dans les shaders, traits coupés en deux jeux), profil net en ink (pont, dessous, coque, hangar, niveau des rails, deux ponts bas), un remplissage très pâle, et l'eau en coupe (de niveau, dans `sky`) avec la ligne de flottaison.
- **La mer et le ciel** (dôme à l'infini, d'après le 015) : clapot à quatre échelles qui glisse à vitesse FIXE (700 cm/s), longues houles (`swell`, faces éclairées larges), sillage, vague d'étrave et collerette, aube signal devant l'étrave (cœur étroit + lueur large qui court sur l'horizon : elle découpe l'avion vu de travers), lumière sur l'eau dans l'axe de la catapulte, nuages à l'aube, brume, côte. Sous l'eau : la surface vue d'en dessous, sa fenêtre, le voile de l'eau. Une « peau » de flottaison (de niveau) qui monte et descend avec la houle contre la coque.
- **La sonde** (ordre −1e6) : lit la caméra une fois par dessin ; dose les traits selon la distance (structure −50 % de 250 m à 2,2 km, membrures et cadres du hangar −85 %), et de nuit efface la structure avec la distance (−88 % de 90 m à 700 m) : de loin, il ne reste que les feux.
- **Ordre de rendu** : tout ce qui est DANS une coquille (rideau, détecteurs, cœurs 45 ; soutes 44 ; cuves 46 ; conduite 47 ; sol du hangar 48) est dessiné avant elle — sinon sa profondeur le cache (piège rencontré : rideau, détecteurs et cœurs invisibles au premier essai).
- `set` et la sonde : aucune allocation (boucles indexées, tableaux préparés).

## Ce que fait chaque nombre

| clé | effet |
| --- | --- |
| `amount` | tout le navire (0 le cache) |
| `sea` | la mer, le ciel, la peau de flottaison, l'eau en coupe |
| `night` | 0 aube (lueur signal devant l'étrave, lumière sur l'eau, nuages) → 1 nuit (noir ; la structure à 38 %, effacée de loin) |
| `lights` | feux du pont, de la piste, de descente, projecteurs de l'îlot ; vitrages un peu plus vifs |
| `taxi` | le chemin veille du parking à la navette, la barre d'arrêt signal |
| `speed` | vague d'étrave, collerette, sillage, peau à l'étrave (la mer défile à vitesse FIXE, quel que soit `speed` : un tween ne la fait jamais sauter) |
| `wind` | les traînées au ras du pont (×0,6 la nuit, coupées pendant `cutaway`) |
| `windAxis` | 0 le long de la quille → 1 le long de la piste oblique (deux jeux en fondu) |
| `under` | la peinture s'efface (−72 %) et le couvercle se lève sur la catapulte avant et le frein d'Andromède, un cadre de vitre apparaît ; ≥ 0,25 montre le hangar en traits pâles |
| `angled` | la peinture de la piste passe en veille et s'avive (plus de remplissage : c'était une dalle verte) |
| `cutaway` | la coupe (0 → 0,5 : l'avant s'efface ; ≥ 0,5 : disparu ; profil et eau en coupe à partir de 0,45) |
| `heel` | rien dans le navire (world.js le penche) ; atténue la peau de flottaison au-delà de 1° |
| `masses` | −1 bâbord … 1 tribord (± 10,5 m) ; ≠ 0 rend les masses visibles |
| `massGlow` | masses et rails veille, respiration lente (0,33 Hz) |
| `fins` | ailerons et gouvernail visibles, veille, battement lent ; la coque sous l'eau se montre |
| `lift` | le plateau avant descend au sol du hangar (`A.lifts[0]` suit) ; montre portes et guides |
| `hangar` | hangar éclairé (verre, sol, rampes) |
| `curtain` | le rideau descend (bord d'attaque veille, trame) |
| `detectors` | les détecteurs s'allument en vague de l'étrave vers l'arrière |
| `plant` | cuves et leurs cœurs veille (et la conduite en verre) |
| `feed` | le front de vapeur dans la conduite (position du front), tirets à vitesse fixe derrière lui |
| `fuel` | les soutes en signal |
| `coast` | une côte sombre à bâbord-avant, quelques lumières |
| `swell` | longues houles sur la mer (vues d'en haut et d'en dessous) et la peau de flottaison qui monte et descend de ± 2,1 m contre la coque |
| `mist` | voile sur l'horizon, nuages atténués, halos des feux gonflés et feux lointains éteints |

## Les poses qui cadrent (complètes ; `{ fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3, dof: 0 }` sauf indication)

- **Navire entier, jour** : `{ tx: 0, ty: -400, tz: 0, d: 30000, az: -42, el: 16 }` — état de repos. **De nuit** : même pose, `{ night: 1, lights: 1 }` (feux distincts, structure pâle). **Réacteurs à travers la coque** : même pose, `{ plant: 1, feed: 1, ship: 0.6 }`.
- **Le trait sur la mer** : `{ tx: 0, ty: 0, tz: 0, d: 260000, az: -20, el: 9, fov: 30 }` — net, avec la lumière signal sur l'eau devant l'étrave.
- **La vague d'étrave** : `shipLow` (`{ tx: -500, ty: -800, tz: -9000, d: 16000, az: -62, el: 2, fov: 32 }`) la montre peu (le porte-à-faux bâbord la couvre) ; mieux, de tribord : `{ tx: 0, ty: -1500, tz: -9000, d: 9000, az: 120, el: 16, fov: 30 }` avec `{ speed: 1, swell: 0.3 }`.
- **Hangar** : `{ tx: 0, ty: -380, tz: 600, d: 5200, az: -58, el: 8 }` avec `{ hangar: 1, fleet: 1, ship: 0.8 }` (+ `curtain: 0.7, detectors: 1` : vérifié).
- **Ascenseur** : `VIEW.lift` `{ tx: 2925, ty: -300, tz: 850, d: 3800, az: 50, el: 12 }` avec `{ lift: 0.5, fleet: 1, hangar: 0.6 }`.
- **La coupe** : `VIEW.section` `{ tx: 0, ty: -900, tz: -3500, d: 6200, az: 180, el: 4, fov: 30 }` avec `{ cutaway: 1, heel: 5, masses: -1, massGlow: 1, jet: 0, dog: 0, crew: 0, parked: 0 }` puis `{ heel: 0, masses: 0 }` — on lit le pont, le hangar, les masses, la flottaison de niveau, la gîte au carré. (Tribord est à GAUCHE de l'image, vu de l'avant.)
- **Masses** : `VIEW.masses` traverse le ballon de `model.js` (voir « À changer ailleurs ») ; proposition non vérifiée : `{ tx: 0, ty: -1180, tz: -3000, d: 1500, az: -40, el: 14, side: -100, dof: 5 }` (de bâbord-arrière, hors du ballon).
- **Chaufferie** : `VIEW.plant` avec `{ plant: 1, feed: 0.7, under: 0.6 }`.
- **Ailerons, sous l'eau** : `VIEW.fins` avec `{ fins: 1, swell: 1 }`.
- **Piste de nuit** : `VIEW.runway` avec `{ night: 1, lights: 1, angled: 1 }`.
- **Soutes** : `{ tx: 0, ty: -1500, tz: -1000, d: 22000, az: -40, el: 22 }` avec `{ fuel: 0.7, ship: 0.6 }`.
- **Approche à 1,3 km de nuit, de derrière l'avion** (le navire = une grappe de feux) : `{ tx: -202.6, ty: 0, tz: 9437.3, d: 130268, az: 8.5, el: 3.7, fov: 30 }` avec `{ night: 1, lights: 1, jet: 0 }` ; `+ mist: 0.8` : voile sur l'horizon, feux plus faibles.
- **Première image** : `hook3` est celle où mon décor travaille le mieux (l'aube signal pile derrière les tuyères, la fente qui file vers l'étrave). Dans `hook1`, la lueur est à gauche derrière le nez mais l'îlot (à 45 m derrière l'avion) remplit le haut droit de boîtes de verre.
- **Miniatures** : aucune n'est à moi. Pour la 1 (profil bas à pleine puissance), garder `night: 0` : la lueur large de l'aube court sur l'horizon et découpe l'avion ; pour la 3 (de nuit), `{ night: 1, lights: 1 }` donne les feux du pont derrière lui.

## Images lues : 30

| planche | images | question | réponse |
| --- | --- | --- | --- |
| n1 | 6 | le navire se lit-il à toutes distances, jour / nuit ; hangar ; coupe | oui le jour, le trait à 2,6 km tient, la coupe se lit ; feux de nuit invisibles (des points trop petits) ; plateaux d'ascenseur trop clairs ; masses dans le plan du hangar (retirées) |
| n2 | 3 | les feux, la chaufferie, la vague d'étrave | feux = poussières (grossis) ; `angled` = dalle verte (remplissage retiré) ; chaufferie et conduite très lisibles ; bras de la vague cachés sous la coque (écartés) |
| n3 | 6 | les trois premières images, l'approche, l'ascenseur, les ailerons, les masses | hook3 très bon ; hook1 encombré par l'îlot (traits baissés) ; le tableau du cockpit cache le navire à 1,3 km ; masses lisibles mais le ballon de `model.js` est dans le cadre |
| n4 | 7 | approche de derrière, brume, piste de nuit, étrave, deux images rasantes à 1/30 s, coupe à plat | piste de nuit bonne ; pas de saut de peinture entre les deux images rasantes ; coupe à plat lisible ; à 1,3 km de nuit le navire était un bloc de traits (structure effacée de loin la nuit) |
| n5 | 4 | navire de nuit, approche, rideau + détecteurs, soutes | feux distincts ; soutes dosées ; rideau et détecteurs absents (ordre de rendu : corrigé) |
| n7 | 2 | rideau + détecteurs, cœurs vus de loin | réglé : visibles à travers les coquilles |
| n6 | 2 | avec l'en-tête | rien de lisible du décor sous l'en-tête ; les blocs hauts de l'îlot passent derrière « 0 km/h » dans hook1 |

## Un cran en dessous

- **La vague d'étrave** se lit comme une écume le long de l'étrave plus que comme un V : ses bras, écartés de la coque, restent pâles (et cachés sous le porte-à-faux vus de bâbord).
- **À 1,3 km de nuit** : des feux distincts, mais serrés en grappe (la piste est vue presque en bout).
- **L'îlot** reste fait de boîtes ; derrière l'avion dans hook1, il charge le haut droit.
- **Le rideau** se lit surtout par son cadre veille ; sa trame est pâle.
- Non vus à l'image : la côte (`coast`), les longues houles vues d'en haut, `windAxis` seul, l'essai rasant sur la piste dégagée (l'essai n4 est en partie masqué par le déflecteur de `model.js`).
- `check` passe ; deux avertissements de compilation ANGLE (« division by zero », « isnan ») dont je n'ai pas cherché la source (présents dès la première vérification).

## À changer ailleurs

1. **`world.js` — la coupe pour les autres décors** : dans `VIEW.section`, la caméra est DANS l'avant du navire (z ≈ −9 700) ; ce qui est devant la coupe reste dessiné par `model.js` (fosse et cylindres de la catapulte avant, ballon : des formes vertes en haut au centre) et par `bord.js` (avions garés `PARK[3]`, `PARK[4]` à z −7 600 et −9 100, à quelques mètres de l'objectif). Ligne à ajouter dans `plan.js` : `export const CUT = { z: MASSES.rows[0] - 180 };` (`navire.js` la lirait au lieu de sa constante) ; puis passer `cutaway: S.cutaway` à `model.set` et `bord.set`, qui cachent ce qui est en avant de `CUT.z` — ou, plus simple, que le chapitre pose `parked: 0, tank: 0, explode: 0, press: 0` sur ce plan.
2. **`VIEW.masses`** traverse le ballon (`TANK` à z −3 700) : `tank: 0` sur ce plan, ou la pose proposée plus haut.
3. **`VIEW.cockpit` à `run` −1 300** : le tableau de bord de `bord.js` couvre le centre de l'image, là où le navire se trouve (3,5° sous l'axe) — `el` plus faible ou un tableau plus bas.
4. Les fenêtres du couvercle supposent le frein d'Andromède de `model.js` centré sous la piste à s = 60 m (± 7,5 m en travers) et les deux autres à s = 36 et 48 m : si `model.js` les déplace, me le dire (une ligne dans `RUN_GLSL`).

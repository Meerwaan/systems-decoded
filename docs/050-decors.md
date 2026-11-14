# 050 · Plaque à induction — les décors

Trois fichiers, trois agents en parallèle. Le contrat : `episodes/050-induction/src/plan.js` (cotes, repères, sans import) et `world.js` (`FIRST`, `VIEW`, `apply`). Chaque bouchon construit déjà avec son **API définitive** : garde les exports, la signature d'`update` et les nombres qu'il lit ; remplace l'intérieur.

**Communs aux trois.** Centimètres, y en haut. Repère de la plaque : origine = centre de la face supérieure du verre, x à droite (comme tu te tiens), z vers toi, y en haut ; dans la cuisine cette origine est `HOME` = (181, 90,4, 31) ; sur l'établi la plaque est levée de `BENCH_LIFT` (6). Caméra : `az` 0 se tient à +z (dans la pièce, face au mur), −90 à −x (le bout gauche du plan de travail), la clé vient de −x, +y, +z — on filme de `az` −20 à −80. Toi, tu te tiens à +z face à −z : **ta gauche est −x**. Le foyer vide (ta main gauche à plat) est l'**avant gauche** `ZONES.hand` (−14, 8), la casserole bout sur l'**avant droit** `ZONES.pan` (14, 8). Échelle vraie : plaque 59 × 52, verre 4 mm, casserole Ø 20. Aucune cote n'est affichée.

**Couleurs (elles ont un sens).** `veille` = le système vivant : le courant sur son chemin, le champ qui bat, les courants induits dans le fond, les afficheurs « 9 », le point de température. `signal` = LA CHALEUR, et seulement là où elle est : dans l'épaisseur du fond de la casserole, et dans l'anneau de verre que le fond réchauffe par contact (et le « H »). Jamais sous ta main, jamais dans la bobine. `ink` : le reste.

**À ne pas montrer** (dossier de faits, contre-vérification) : le fond qui **rougit comme un fil de grille-pain** (la chaleur est une teinte orange dans l'épaisseur, pas une incandescence) ; un **thermomètre** ou une sonde qui touche le verre (le point de température est une pastille discrète : mesure ou estimation selon les modèles) ; un chiffre de température ; un champ qui battrait à 25 kHz à l'écran (il bat au ralenti, ≈ 1 à 3 fois par seconde) ; une cuillère posée sur la plaque ; un champ qui s'étend au-dessus du fond (le fond l'absorbe : ≈ 2 cm au-dessus du verre au plus).

**Ce que les bouchons ont appris (planches de l'architecte).** Le verre noir brillant (`coat` 1, `rough` 0,12) renvoie la boîte à lumière en **une tache énorme**, verte sur l'établi, rose dans la cuisine, qui mange l'éclaté et la fin de l'acte 1 : le verre vitrocéramique est **satiné** (rugosité ≈ 0,3, `coat` bas) ou sa réflexion est maîtrisée — c'est la première chose à vérifier sur ta première planche (`model.js`). La coupe vers l'établi (`benchCut` depuis `VIEW.system`) tombe au même endroit de l'image : vérifié.

Pas de décorateur prévu : la cuisine du 009 est reprise telle quelle (elle ne l'a jamais été, mais ici on la voit peu : la caméra reste au ras du verre). Si le chef de production veut une touche, ce serait au fond (crédence, ustensiles), jamais sur le plan de travail devant la plaque.

---

## model.js

**La plaque à induction, le système (plein).** `buildHob() → { root, parts, A, update(p, time, px) }`.

À construire (repère de la plaque, `plan.js`) :
- **Le verre vitrocéramique** `GLASS` 59 × 52 × 0,4 : noir profond, satiné, chanfrein fin, une arête claire sur son pourtour ; sérigraphie fine des quatre foyers (cercles `ink` faibles, rayon de chaque `ZONES`), la bande de commande à l'avant (`STRIP`, `SLIDER` : un trait de curseur et des points de touches, sans texte). `see` 1 le fait passer aux rayons X (verre + traits) : ce qui est dessous se voit.
- **Quatre afficheurs à 7 segments** `DISPLAYS` (un par foyer, devant lui) : celui du foyer vide fait clignoter « 9 » (`blink`, deux fois par seconde, `veille`) ; celui du foyer héros montre « 9 » fixe (`power`, `veille`) ou « H » (`hot`, `signal`, gagne sur `power`) ; les deux du fond restent éteints (sur le bouchon ils affichent « 8 » : à corriger). Segments lisibles à 270 px sur `VIEW.display` et `VIEW.emptyZone`.
- **Quatre inducteurs** `COIL` : chacun une galette en spirale de fil de cuivre (18 tours visibles, un vide au centre `inner`), posée sur sa couronne de barreaux de ferrite rayonnants (`ferrite.n` 8) et un disque de mica ; l'inducteur héros (`ZONES.pan`) en détail plein, les trois autres plus simples. Le cuivre est **la pièce-héros de la plaque** : nettement plus clair que le reste.
- **Le point de température** `SENSOR` au centre du foyer héros, sous le verre : une pastille discrète ; `sensor` l'allume `veille`.
- **La carte de puissance** `BOARD` (l'onduleur) : circuit vert sombre, dissipateur à ailettes et ses transistors, deux gros condensateurs, des pistes ; **le cordon secteur** `CORD` qui entre par l'arrière gauche ; **le ventilateur** `FAN` (rotor à 7 pales, qui tourne avec `fan`) ; **le boîtier** de tôle `CASE` (plein, `see` 1 le passe aux rayons X).
- **Le courant** (`flow`, `coil`) : un tracé `veille` qui avance du cordon à la carte, puis de la carte à l'inducteur héros (`flow` 0 → 1 le fait avancer), puis court le long des spires (`coil`). Un flux se dessine clair sur un conducteur sombre (tirets larges en centimètres, `regles-image.md`).
- **Le champ** du foyer héros (`field`, `on`) : des boucles `veille` qui sortent de l'inducteur, traversent le verre **sans s'y allumer** et entrent dans le fond de la casserole (≈ `FIELD.reach` au-dessus du verre, pas plus) ; elles **battent** avec `time` (s'inversent ≈ deux fois par seconde : le ralenti stroboscopique du principe). `on` 0 les éteint d'un coup.
- **La chaleur du verre** `glassHeat` : l'anneau de verre sous le fond (rayon `HEAT.ring`), teinte `signal` diffuse, plus chaude au centre, qui reste quand la casserole est levée.
- **L'éclaté** `explode` : les couches montent de `EXPLODE` (boîtier 0, ventilateur 3,5, carte 7, inducteurs 13, verre 19 ; la casserole, posée par `world.js`, à 30), dans une seule colonne, en décalé (`delay`).
- **La coupe** `cut` : la plaque coupée par le plan z = 8 (le centre des deux foyers avant), la moitié +z enlevée : la tranche du verre (4 mm, un trait clair), les spires de cuivre en section (une rangée de petits carrés cuivre), la ferrite, le boîtier. Ce qu'on voit sur `VIEW.section` depuis +z.
- `lit*` (`litBoard`, `litCoil`, `litGlass`, `litSensor`) : la pièce que la voix nomme s'éclaire faiblement en `veille`.

**Réutiliser** : rien n'existe (pas de plaque à induction au catalogue). Idiome d'un système plein : `episodes/007-siege-ejectable/src/model.js` ; une bobine : le disjoncteur `016/model.js` (sa bobine) ; `makeBall` pour un point de lumière.

**Nombres lus** : `see, on, field, coil, flow, glassHeat, sensor, blink, power, hot, explode, cut, fan, litBoard, litCoil, litGlass, litSensor`. **Ancres** `A` (elles suivent l'éclaté) : `board, coil, sensor, glass, display, displayHand, cord, fan`.

**Les images à réussir** (liste fermée, sur la vraie scène, `npm run look` avec l'état indiqué) :
1. `VIEW.exploded` à `explode` 1 : la colonne entière lisible à 270 px, chaque couche détachée, le cuivre clair, la casserole au-dessus (sans tache de reflet).
2. `VIEW.coil` (`explode` 1, `coil` 1, `litCoil` 1) : la spirale de cuivre et sa ferrite, de trois quarts, le courant qui tourne.
3. `VIEW.board` (`explode` 1, `flow` 1, `litBoard` 1) : la carte, le dissipateur, le cordon, le courant qui entre.
4. `VIEW.section` (`cut` 1, `field` 1, `on` 1, `coil` 1) : bobine / verre / fond en coupe, le champ qui traverse le verre sans l'allumer, à deux instants (le champ dans un sens, puis l'autre).
5. `VIEW.system` (cuisine, `see` 1) : la plaque entière aux rayons X dans son plan de travail, les quatre inducteurs dessous, la casserole dessus.
6. `VIEW.display` (cuisine, `hot` 1) puis `power` 1 : le « H » `signal`, puis le « 9 » `veille`, lisibles.
7. `VIEW.emptyZone` (cuisine, `blink` 1, `see` 1) : le foyer vide, sa bobine sombre, son « 9 » allumé.
8. `VIEW.hotRing` (cuisine, `lift` 1, `glassHeat` 1, `sensor` 1) : l'anneau chaud sur le verre noir, la pastille sous lui.

---

## casserole.js

**La casserole, le cœur (plein).** `buildCasserole() → { root, A, update(p, time, px) }` ; repère propre : origine au centre du dessous du fond, y en haut (`world.js` la pose sur le foyer héros et la lève).

À construire : une casserole **inox brossé** `PAN` (Ø 20 au fond, 21,2 au bord, 11 de haut, paroi 1,2 mm), un **fond à capsule** (épaisseur `PAN.base` 5 mm, plusieurs couches dont la dernière, dessous, magnétique : une ligne claire les sépare en coupe), un **long manche** vers l'avant droit (`PAN.handle`, sa pièce de fixation rivetée). Dedans **l'eau** (`PAN.water`) qui bout à gros bouillons (`boil` : grosses bulles qui naissent au fond et montent, surface qui se soulève ; à 0, les bulles retombent et la surface se calme en ≈ 1 s), **la vapeur** au-dessus (`steam` : panaches qui montent et s'effacent avant l'en-tête). `xray` passe la paroi au verre (l'eau, les bulles, l'épaisseur du fond se voient). Dans le fond, ce dont parle le film :
- **les courants induits** `eddy` : des boucles `veille` concentriques dans l'épaisseur du fond, qui **tournent** (avec `time`) et accélèrent avec `eddy` ;
- **la chaleur** `panHeat` : une teinte `signal` qui naît dans l'épaisseur du fond et monte dans l'eau en courants chauds (quelques filets) — **jamais une incandescence** (la contre-vérification : « le métal ne rougit pas comme un grille-pain ») ;
- `litPan` : le fond s'éclaire faiblement `veille` quand la voix le nomme (« le cœur ») ;
- `cut` : coupée comme la plaque (moitié +z enlevée) : la paroi en section, le fond en couches, l'eau en coupe avec ses bulles.

**Réutiliser** : la cocotte du 018 (`018/model.js`) pour l'idiome d'un récipient qui bout (eau, bulles, vapeur — ses fonctions, pas le fichier) ; `makeBall` (les boules de lumière, catalogue « recopiés ») si utile.

**Nombres lus** : `boil, steam, xray, eddy, panHeat, litPan, cut`. **Ancres** `A` : `base, water, handle, rim`.

**Les images à réussir** :
1. `VIEW.hook` (cuisine, tout FIRST) : derrière ta main, la casserole qui bout fort, sa vapeur, lisible à 270 px (c'est la menace de la première image).
2. `VIEW.boil` : l'eau qui bout de près, d'en haut (gros bouillons, pas une écume).
3. `VIEW.heart` (établi, `explode` 1, `litPan` 1) : le fond vu d'un peu dessous, isolé, clair sur sombre.
4. `VIEW.section` (`cut` 1, `eddy` 1, `panHeat` 0,6) : les boucles de courant dans le fond, la chaleur qui monte dans l'eau.
5. `VIEW.panLow` (cuisine, `lift` 0,6, `boil` 0) : la casserole décollée, les bulles retombées, le fond vu de profil.

---

## cuisine.js

**La cuisine du 009 et toi (rayons X).** `buildCuisine() → { group, kitchen, you, A, update(p, time, px) }`. Modèle d'enveloppe : `018/cuisine.js` (57 lignes). Rien de la pièce n'est modélisé : `buildKitchen({ hob: false, floorAt: [YOU.x, YOU.z] })` du 009, sans personne du 009 (`you` 0 passé à la cuisine). La plaque et la casserole ne sont PAS construites ici.

À construire :
- **Toi**, de verre (`makeFigure({ hands: "real", shell: true })`, `@kit/figure.js`), debout devant la plaque, face à −z (la figure tournée d'un demi-tour : ta gauche est −x).
- **Ta main gauche** (`palm`, `hover`, `away`) : **à plat sur le foyer vide** (`HAND.flat`) — paume posée, doigts écartés, **appuyés** sur le verre (c'est le gros plan de l'accroche : la forme se reconnaît en un tiers de seconde) ; `palm` 1 l'emmène au-dessus du foyer où était la casserole (`HAND.over`) ; `hover` 1 la tient à un doigt du verre (« juste au-dessus »), doigts tendus vers le bas, arrêtée ; `away` 1 la retire vers toi.
- **Ta main droite** (`grip`) : de ton côté → refermée sur le manche (`A.handle` de la casserole, `PAN.handle`) ; elle **suit `lift`** (même nombre que la casserole : elle soulève).
- **Une main d'enfant** (`child`) : plus petite, de verre, qui entre par le bord avant du plan de travail à gauche de la plaque (`CHILD`) et s'arrête sur le bord — le like. Elle ne touche jamais le verre.
- `shell` : le verre de la cuisine (pas toi).

**Pas d'allocation dans `update`** (le bouchon en fait une : `handleAt`). Les cibles des mains se calculent dans le repère de la figure (`toLocal`).

**Nombres lus** : `shell, you, palm, hover, away, grip, lift, child`. **Ancres** `A` : `palm` (le centre de ta paume, monde), `fingers`, `grip`, `child` — `palm` et `grip` doivent **suivre** les mains (le bouchon les laisse fixes).

**Les images à réussir** :
1. `VIEW.hook` / `POSE0` : ta main à plat, au premier plan, au ras du verre — le bras ne barre pas le cadre (sur bouchon il entre en haut à droite comme une poutre : le coude haut et en arrière).
2. Les quatre candidates de la première image (`docs/050-actes.md`, fin) : la main dans chacune, propre, sans le bras devant la casserole.
3. `VIEW.twoZones` avec `grip` 1 : la main gauche sur le foyer vide, la droite sur le manche.
4. `VIEW.panLow` à `lift` 1 : la casserole levée dans ta main droite (la main sur le manche, pas à côté).
5. `VIEW.hotRing` à `palm` 1, `hover` 1 : la main arrêtée à un doigt au-dessus de l'anneau chaud.
6. `VIEW.top` à `child` 1, `you` 0 : la main d'enfant au bord du plan de travail, la plaque et son « H ».

# 028 · Détecteur de CO — les décors

Deux fichiers, un agent chacun, en parallèle : `episodes/028-detecteur-co/src/foyer.js` (l'appartement autour de la chambre : le couloir et la chaudière qui fuit, le gaz, la chambre des enfants, la fenêtre, dehors, le détecteur de fumée) et `src/model.js` (le système : le détecteur de CO ; et la maquette du sang). Tous deux existent en **bouchon** : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED` / `BLOODED`, `BENCH_ORIGIN`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/028-actes.md` (lis son haut et les lignes qui te concernent). Faits : `docs/faits/028-detecteur-co.md` et `028-contre-verification.md` — leurs « À ne pas dire » d'abord. **La voix est enregistrée** (85,7 s) : `npm run script -- 028` donne la table.

**On réutilise, on ne remodélise pas.** La chambre, le lit, toi endormi (de verre, sur le côté droit, face à −x, tu respires), la table de nuit, la fenêtre du mur +x, et leur habillage (la rue derrière le volet, le verre d'eau) existent : `episodes/022-batterie-telephone/src/chambre.js`, **importé tel quel par `world.js`** — on n'y touche jamais. Son téléphone n'est pas dans ce film : `world.js` tient ses nombres à « rien » (pas de chaleur, pas de charge, l'oreiller à plat, le câble du chargeur posé sur la table). Ne redessine rien de la chambre ; si elle te gêne (une ligne, un objet), écris-le sous « À changer ailleurs ».

**L'échelle** : la vraie pour l'appartement et les gens (`plan.js`). Les pièces du détecteur ont des tailles illustratives (rien ne s'affiche). Le sang est une **maquette** à son échelle propre : aucune longueur n'y est jamais montrée.

**Axes** (`plan.js`) : le sol est y = 0 ; la tête du lit contre le mur du FOND (z = −125), la fenêtre dans le mur +x. **Azimut** (`kit/lib/stage.js` l. 381, vérifié : la caméra est en t + d·(sin az·cos el, sin el, cos az·cos el)) : `az` 0 se tient en +z (le pied du lit, regardant vers le fond) ; −90 en −x (le côté de la table de nuit) ; +90 en +x (la fenêtre, dehors) ; ±180 derrière le mur du fond (dans le couloir). La clé vient de −x, +y, +z : une caméra entre az −20 et −70 l'a à l'épaule et voit ton visage (tu fais face à −x).

**Couleurs** : signal = la menace — le gaz partout où il est (la brume, ses traînées depuis la chaudière), la flamme de la chaudière, le mal de tête, les perles de CO dans le sang ; veille = le système vivant (la lumière du détecteur, son courant, sa somme, son alarme) et ce qu'il rend : l'air frais, ton souffle dehors, l'oxygène ; ink = le reste. Nuit noire, pas de bleu. Personne n'est blessé à l'image.

**Ce que le gaz a le droit d'être** (faits, « À ne pas dire ») : le CO est incolore et inodore — la brume signal est NOTRE image de lui, pas une fumée qu'on verrait. **Il se mélange à l'air, à toutes les hauteurs** : jamais une nappe au sol, jamais une couche sous le plafond, jamais « il monte » au sens propre (« le gaz monte encore » = la concentration). Il sort de la chaudière (le scénario : une chaudière qui fuit — on n'en dessine pas la cause), passe la porte, remplit les pièces. **Jamais un mur** : des traînées et des volumes doux, lisibles, qu'on traverse du regard (« Net et fluide » : pas de points fins qui filent, des traînées ; une respiration lente, jamais un clignotement).

---

## `src/foyer.js` — l'appartement autour de la chambre (aux rayons X)

**À lire pour l'idiome** : `episodes/022-batterie-telephone/src/chambre.js` (son en-tête, `makeSet`, les verres, les traits : **tu dessines dans le même trait qu'elle**, pour que la coupe de l'une à l'autre ne se voie pas), `episodes/006-defibrillateur/src/hall.js` (le lieu, les figurants, `halo()`), `kit/lib/figure.js` (`makeFigure` : debout, assis, couché, les mains `"real"` ; un enfant = la même figure à l'échelle ≈ 0,62), `kit/lib/build3d.js`, `kit/lib/atmo.js` (`makeMotes` pour les traînées), `episodes/012-gaziniere/src/fire.js` (la brume de gaz du 012 et sa flamme : **pars-en** pour la brume et la flamme du brûleur, en la réglant autrement).

**Ce qu'il construit** (`plan.js`) :

- **Le couloir** (`HALL`), derrière le mur du fond de la chambre : ses murs de verre et leurs traits, son sol en grille (aucune dalle), son plafond en traits faibles. **La porte de la chambre** (`DOOR`) dans le mur du fond, à droite de la tête de lit : un cadre et un battant ouvert vers le couloir. Le mur de la chambre (022) reste dessiné ; tu poses le cadre et le battant sur lui.
- **La chaudière murale** (`BOILER`), accrochée au mur du fond du couloir : une chaudière à gaz qu'on reconnaît en un tiers de seconde (le caisson blanc haut et étroit, sa petite vitre sur la flamme, les tuyaux et le robinet de gaz sous elle, le **conduit** qui monte droit à travers le plafond jusqu'à `flue.top`). Le caisson est de verre ; **pleins dedans, ce qui compte** : le brûleur et sa **flamme** (`flame`, signal, cœur clair, une lumière qui a un endroit — une respiration lente, pas de scintillement).
- **Le gaz** — deux choses distinctes, deux nombres :
  - `leak` : **la fuite**, des traînées signal qui naissent sous le caisson (`LEAK.from`), longent le couloir, passent la porte (`LEAK.door`) et vont vers le lit (`LEAK.bed`). **Elles avancent dès l'image 0** (c'est le mouvement de la première image : le sujet bouge par lui-même) : périodiques en `time`, lentes et lisibles (≈ 30 à 60 cm/s), larges (≥ 6 px), jamais un fil fin qui défile. Elles s'élargissent et pâlissent en avançant : le gaz se mélange.
  - `co` : **le gaz dans l'air des pièces** (couloir, chambre, chambre des enfants), une brume signal douce à toutes les hauteurs, qui épaissit de 0,5 (≈ 50 ppm) à 1 (≈ 100 ppm) — plus dense, jamais plus haute. Un plafond d'opacité qui garde le sujet lisible : à `co` 1, on voit encore ton visage, le détecteur et la chaudière à travers. `air` la repousse depuis la fenêtre (elle recule, elle ne s'éteint pas d'un coup).
- **Le mal de tête** (`ache`) : une pulsation signal lente aux tempes de ta tête endormie (`YOU.head` ; la figure est celle du 022, tu poses seulement la lueur), une lumière qui a un endroit, deux battements par trois secondes au plus.
- **La fenêtre** (`window`) : le battant qui s'ouvre sur la fenêtre du 022 (`WINDOW`, mur +x), vers l'intérieur, autour de son bord +z. **L'air frais** (`air`) : des traînées veille qui entrent par l'ouverture et repoussent la brume — la seule chose veille du décor, avec ton souffle dehors.
- **La chambre des enfants** (`KIDS`) : ses murs de verre, sa porte sur le couloir, **deux petits lits** et **deux enfants de verre endormis** (`makeFigure` à ≈ 0,62, couchés, la tête vers −z, une couette en traits comme celle du 022). Ils respirent (lentement). La brume `co` y entre aussi (par sa porte).
- **Toi, réveillé** (`me`, `mePose`) — une figure de verre (`makeFigure`, mains `"real"`), distincte de celle du 022 qui dort (`you`), trois postures tenues, qui ne changent que sur une coupe : **0** assis dans ton lit, le buste dressé, la tête tournée vers le mur où sonne le détecteur (« Tu ouvres les yeux » : on doit lire que tu viens de te réveiller) ; **1** debout à la fenêtre, une main sur la poignée du battant ; **2** dehors, debout (`OUTSIDE.me`), tourné vers la caméra de `VIEW.outside`.
- **Dehors** (`OUTSIDE`) : une bande de jardin au-delà de la fenêtre — **une grille au sol**, pas de pelouse pleine ; une clôture basse en traits au loin, la nuit. **Les enfants dehors** (`kidsOut` 1) : debout de part et d'autre de toi (`OUTSIDE.kids`). **Le souffle** (`breath`) : des panaches veille lents devant vos bouches, qui montent et se dissolvent (l'air froid de la nuit) — c'est « respirent ».
- **Le détecteur de fumée** (`SMOKE`) au plafond de la chambre, au-dessus du lit : un disque blanc **plein** (le seul objet plein du décor avec la flamme), son petit voyant éteint. `smoke` 1 : son contour s'allume encre, et la brume passe autour de lui sans qu'il réagisse (il ne voit pas ce gaz). Jamais veille.

**API à rendre** (exactement) : `export function buildFoyer()` → `{ group, A, update(P, time, px) }`.

- `group` : dans le repère de l'appartement (celui de `chambre.js`).
- `A` (ancres, `Object3D`) : `boiler` (la face du caisson), `burner`, `flue` (le haut du conduit), `leak` (la bouche de la fuite), `door`, `window`, `kids` (entre les deux enfants couchés), `out` (au-dessus de toi dehors), `smoke` (sous le détecteur de fumée), `head` (au-dessus de ta tête endormie).
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `shell` | le verre et les traits de l'appartement (0–1) |
| `fade` | tout l'appartement se dissout (la plongée dans le sang) : 1 normal → 0 rien |
| `flame` | la flamme du brûleur, signal (0–1) |
| `leak` | les traînées de la fuite, de la chaudière à la porte et au lit, en mouvement (0–1) |
| `co` | la brume signal dans l'air des pièces, à toutes les hauteurs : 0,5 ≈ 50 ppm, 1 ≈ 100 ppm |
| `ache` | la pulsation aux tempes de ta tête endormie (0–1) |
| `window` | le battant de ta fenêtre : 0 fermé → 1 grand ouvert |
| `air` | l'air frais veille qui entre et repousse la brume (0–1) |
| `kids` | les deux enfants (0–1) ; `kidsOut` 0 couchés dans leurs lits · 1 debout dehors (0 ou 1) |
| `me` | toi réveillé (0–1) ; `mePose` 0 assis au lit · 1 à la fenêtre · 2 dehors (0, 1 ou 2) |
| `breath` | les panaches de vos souffles dehors (0–1) |
| `smoke` | le détecteur de fumée montré : son contour allumé, la brume qui le contourne (0–1) |

**Les images à réussir** (liste fermée ; les poses de `VIEW` sont des points de départ réglés sur bouchons — donne les tiennes dans ton journal) :

1. **La première image** (`POSE0`, `FIRST`) : au ras du lit, toi endormi au premier plan ; derrière ta tête, à travers le mur de verre du fond, la chaudière, sa flamme signal ; ses traînées qui passent la porte et viennent vers toi — **elles bougent dès l'image 1** ; au mur, petit, le voyant vert du détecteur. Le sujet entre y ≈ 440 et 1160, rien d'important sous 1600. **Puis tire les quatre candidates** de `docs/028-actes.md` (« La première image ») sur ton décor fini, sur une planche, et note-les dans ton journal : celui qui orchestre choisit sur elles.
2. `VIEW.boiler` : la chaudière en contre-plongée, reconnaissable, la flamme derrière sa vitre, la fuite qui naît dessous.
3. `VIEW.door` : depuis le couloir, la fuite qui passe la porte, le lit au-delà.
4. `VIEW.house` : l'appartement de haut, trois pièces lisibles, la brume qui les a gagnées toutes (`co` 1), les enfants dans leur chambre.
5. `VIEW.kids` : les deux enfants endormis, la brume chez eux.
6. `VIEW.pillow` avec `ache` 1 : la pulsation aux tempes, lisible à 270 px.
7. « Tu ouvres les yeux » : `me` 1, `mePose` 0, `you` 0 — assis au lit, la tête tournée vers le mur (la lumière d'alarme y est — `model.js`).
8. `VIEW.window` : `mePose` 1, `window` 0 → 1, `air` 1 — la main sur la poignée, le battant qui s'ouvre, l'air veille qui entre, la brume qui recule.
9. `VIEW.outside` : `mePose` 2, `kidsOut` 1, `breath` 1 — vous trois dehors, la maison derrière, la brume signal dedans, vos souffles veille. **Le relâchement du film** : c'est l'image de « respirent ».
10. `VIEW.smoke` : `smoke` 1, `co` 0,5 — le disque blanc au plafond vu d'en dessous, la brume qui passe autour, rien ne s'allume.

**Réutilise** : `chambre.js` du 022 (importé par `world.js`, jamais copié), la brume et la flamme du 012 (`fire.js` : pars d'une copie), `makeFigure`. N'écris que dans `foyer.js` et ton journal `docs/journal/028-foyer.md`.

---

## `src/model.js` — le détecteur de CO (plein) et la maquette du sang

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` ou `episodes/022-batterie-telephone/src/model.js` (pièces, `lit…`, `explode`, ancres, une somme lisible), `episodes/012-gaziniere/src/model.js` (la tête de lumière qui descend un fil : le « petit courant »), `episodes/022-batterie-telephone/src/pores.js` (une maquette à son échelle, `micro`), `kit/lib/build3d.js`.

**Ce qu'il construit** — **le détecteur** (`DETECTOR`), un boîtier mural de la taille d'une paume, plein, sombre, arêtes claires, trois valeurs de gris ; son origine = le centre de son DOS (sur le mur), sa face vers +z. Aucun logo, aucune marque, aucun texte.

- **La façade et sa grille** (`grille`) : des fentes qui laissent entrer l'air ; **le voyant** veille (vivant, fixe : « il ne dit rien ») ; autour du voyant, **l'anneau de la somme** — douze segments qui s'allument veille avec `dose` (une image du calcul, pas un affichage réel : `sources` le dit). Lisible sur `VIEW.system` et `VIEW.wall`.
- **La membrane** (`membrane`) : une pastille fine devant la cellule.
- **L'électrode** (`electrode`) : la cellule électrochimique, un petit cylindre, sa face de platine (la plus claire du système : la pièce-héros) — c'est là que le CO « brûle ». **Une électrode** : ne dessine pas trois électrodes nommées (le film n'affirme pas leur nombre).
- **La puce** (`puce`) : la carte et son circuit ; la piste de l'électrode à la puce ; sur la puce, **le même anneau de douze segments** (la somme, vue dans l'éclaté).
- **Le buzzer** (`buzzer`) : la pastille piézo derrière sa bouche dans la façade. `alarm` : **des anneaux veille qui partent de sa bouche** (le son qu'on voit, lents, ≈ un toutes les 0,8 s — jamais un clignotement rapide) et une lumière qui a un endroit (un cœur clair au voyant, une traîne) qui éclaire le mur autour.
- **La pile** (`pile`) : elle alimente la puce et le buzzer — **jamais le gaz** (« le gaz alimente l'alarme » est interdit).
- **Le chemin de l'air et le courant** : `sniff` — des perles signal (le CO dans l'air) qui entrent par la grille, traversent la membrane et se posent sur l'électrode ; là, chacune « brûle » (un petit éclat, puis elle s'éteint) ; `current` — une **tête de lumière veille** qui court de l'électrode à la puce, **aussi vive que `current`** (« proportionnel au gaz » doit se lire : deux valeurs de `current` côte à côte donnent deux intensités). Dans la chambre comme sur l'établi.
- **L'éclaté** (`explode`) : **une rangée en travers de la caméra** (`ROW` : grille · membrane · électrode · puce · buzzer · pile, de −x à +x, dans l'ordre où passe l'air), chaque pièce debout face à +z, le boîtier qui reste derrière et pâlit. Chaque pièce ≥ 150 px de large sur `VIEW.exploded`.
- `lit…` : la pièce que nomme la voix s'allume faiblement veille (une lumière qui a un endroit).

**La maquette du sang** (`buildBlood`, `BLOOD`) : un court morceau de vaisseau de verre (son axe le long de x), des globules rouges (des disques biconcaves de verre clair, pas pleins) qui y dérivent lentement (périodiques en `time`, lisibles), chacun portant quatre perles : **veille = l'oxygène**, **signal = le CO**. `swap` 0 → 1 : les perles signal prennent la place des veille, une à une, et ne repartent pas (« il prend la place de l'oxygène », « ton sang se charge »). `micro` : son opacité (le monde dissout l'appartement en face). Aucune longueur, aucun chiffre.

**API à rendre** (exactement) :

- `export function buildModel()` → `{ root, A, parts, update(P, time, px) }`. `root` : un `THREE.Group` re-parenté par `world.js` entre le mur (à `DETECTOR.at`) et l'établi (debout sur son bord inférieur, à `BENCHAT`). `A` : `grille`, `membrane`, `electrode`, `puce`, `buzzer`, `pile`, `led`, `face` (le centre de la façade), `centre`. `parts` : `{ case, grille, membrane, electrode, puce, buzzer, pile }` — chacune avec SES matières.
- `export function buildBlood()` → `{ group, update(P, time, px) }`, l'origine au milieu du vaisseau.

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi, 0 au mur |
| `explode` | 0 assemblé → 1 la rangée (sur l'établi seulement : au mur `world.js` passe 0) |
| `sniff` | les perles de CO qui entrent, traversent, se posent et brûlent (0–1 : leur nombre) |
| `current` | la tête de lumière de l'électrode à la puce, son intensité (0–1) |
| `dose` | la somme : l'anneau de la façade et celui de la puce (0 → 1 = le seuil : tous les segments) |
| `alarm` | le buzzer sonne : anneaux veille, la lumière au voyant et sur le mur (0–1) |
| `litGrille` … `litPile` | la pièce nommée s'allume faiblement veille (0–1) |
| sang : `micro`, `swap` | l'opacité de la maquette · la part des perles devenues signal |

**Les images à réussir** (liste fermée) :

1. `VIEW.system` / `VIEW.wall` au mur : la façade, la grille, le voyant vert fixe, l'anneau à `dose` 0,12, des perles signal aspirées par la grille (`sniff` 0,5). C'est le plan sur lequel l'acte 2 coupe vers l'établi (`benchCut`, même place à l'écran).
2. `VIEW.whole` sur l'établi : le détecteur debout sur son halo, de trois quarts.
3. `VIEW.exploded` : la rangée, chaque pièce lisible, `litGrille` puis `litMembrane`… (essaie quatre azimuts d'un coup avant de choisir).
4. `VIEW.electrode` : les perles qui se posent et brûlent ; la tête de lumière qui part vers la puce ; `current` 0,3 puis 1 côte à côte (proportionnel).
5. `VIEW.puce` : l'anneau de la puce qui se remplit, segment par segment.
6. Au mur, `alarm` 1, `dose` 1 : les anneaux du son, la lumière qui a un endroit sur le mur — de près (`VIEW.wall`) et de loin (`VIEW.pillow` : on la voit depuis le lit).
7. `VIEW.blood` : la maquette, `swap` 0,25 puis 0,85 côte à côte.
8. La couverture (`episode.json` → `cover`, à `eclate$`) : la rangée entière éclairée, quelque chose qui luit (l'anneau, la tête de courant), `el` ≥ 28, sous la ligne « Système Décodé » (y ≈ 960).

N'écris que dans `model.js` et ton journal `docs/journal/028-model.md`.

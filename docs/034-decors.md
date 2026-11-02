# 034 · Boîte noire — les décors

Deux fichiers, un agent `decor` chacun, en parallèle : `episodes/034-boite-noire/src/model.js` (le système : l'enregistreur de vol) et `src/fond.js` (l'Atlantique de nuit, de la surface à 3 900 m). Tous deux existent en **bouchon** (volumes gris, API définitive) : le film se construit ; on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED` / `FLOWN`, `sepOf`, `apply`). Recette : `docs/recette-agents.md`. Plan de mise en scène : `docs/034-actes.md` (son haut et les lignes qui te concernent). Faits : `docs/faits/034-boite-noire.md` (§ 10 « À ne pas dire ») et `034-contre-verification.md`. **La voix est enregistrée** (89,6 s) : `npm run script -- 034`.

**Ce qu'on ne modélise pas.** L'A330 de verre de nuit au-dessus de l'Atlantique est celui du 023, importé tel quel et déjà habillé (`023/src/avion.js`, qui appelle lui-même `023/src/habillage.js`) : pas d'agent pour lui. `world.js` accroche la boîte dans sa queue (`REC.inPlane`) et éteint ses gouvernes vertes (elles disaient « le système vivant » au 023). L'établi est celui du kit (`makeBench`). **Pas de décorateur prévu** : `fond.js` porte lui-même la vie du lieu (neige marine, reflet de la surface, sédiment) ; le reste est le 023, déjà habité.

**Trois repères, un objet** (`plan.js`) : DEEP — **la boîte reste à l'origine, la mer bouge** (`depth` en mètres vrais : surface à `y = +depth·100`, fond à `y = −(3900 − depth)·100`) ; AIR — le repère de l'avion du 023 ; BENCH — l'établi, la base de la boîte à l'origine comme au fond (la coupe fond → établi est EN PLACE). **Le repère de la boîte** : sa base au centre à l'origine, **son avant (la balise) vers −x**, haut +y, largeur sur z. **Azimut** (`kit/lib/stage.js` l. 381, vérifié) : la caméra est en t + d·(sin az · cos el, sin el, cos az · cos el) → `az` 0 en +z, **−90 en −x (devant la balise)**, +90 derrière ; la clé vient de −x, +y, +z.

**Couleurs.** La boîte est **orange vif** dans la réalité, et le film le dit (« Elle est orange vif ») : sa peinture est la teinte signal, **assombrie** (un orange brûlé plein, arêtes encre, sur un halo) — jamais un aplat orange vif qui bave. Veille = le système vivant (le flash de la balise, sa pile, l'acier qui tient, la mémoire lue). Signal = la menace (la flamme, les flèches de pression, l'épave qui coule). Encre = le reste. Nuit noire sous l'eau : **pas de bleu**, jamais.

**Exactitude** : personne à l'image, aucune victime, aucun nom, aucune transcription ; rien n'écrit que la boîte est dans la queue ; le module n'est pas une brique (la presse décrit celui d'AF447 comme un cylindre) ; aucune grandeur affichée sur le décor ; la portée est dessinée à l'échelle vraie (1 NM ≈ 1,85 km) mais jamais chiffrée à l'image.

---

## `src/model.js` — l'enregistreur de vol (le système)

**À lire pour l'idiome** : `episodes/007-siege-ejectable/src/model.js` (pièces, `explode`, ancres), `episodes/023-eolienne-de-secours/src/model.js` (un système qui vit dans l'avion et sur l'établi), `kit/lib/build3d.js`. Rien à réutiliser tel quel : c'est le décor neuf du dossier.

**Ce qu'il construit** (tailles illustratives, `plan.js` : `REC`, `CHASSIS`, `BOARDS`, `MODULE`, `LAYERS`, `BEACON`, `PING`), **plein** :

- **Le boîtier** (`CHASSIS`, 32 × 13 × 13) : coffret orange brûlé aux arêtes chanfreinées, deux **bandes réfléchissantes** (encre clair, un peu brillantes : `shine` les fait accrocher la lumière), poignée à l'avant (−x), connecteur à l'arrière (+x), quelques vis. **Pas blindé.**
- **L'électronique** (`BOARDS`) : quatre cartes vertes-sombres (gris), composants en relief sobres ; visibles quand le boîtier passe au verre (`xray`) et dans l'éclaté.
- **Le module mémoire** (`MODULE`) : **un cylindre trapu**, axe x, posé au milieu sur le dessus dans un berceau à deux sangles, orange avec sa propre bande. **C'est la pièce-héros** : la plus claire, la mieux éclairée. Dedans (`LAYERS`, `section`) : coque d'**acier** épaisse (gris acier, la plus claire), **isolant** (encre mat, grain), **absorbeur de chaleur** (gris moyen), et au cœur la **carte mémoire** (sombre, ses puces). En coupe : un quart enlevé (côté caméra de `VIEW.section`), les trois couches qui s'écartent un peu à `section` 1 — lisibles à 270 px.
- **La balise** (`BEACON`) : cylindre gris clair fixé sur la face avant du module ; à son nez, l'**interrupteur à eau** (deux plots) et le **flash veille** qui s'allume une fois par seconde (`PING`, phase commune avec `fond.js`) ; **sa pile** dedans, qui sort dans l'éclaté et dont le niveau se lit en veille (`charge`).
- **Les effets du système** : la **flamme** (`heat`, signal : une langue qui lèche l'acier et meurt sur l'isolant — la chaleur s'arrête là ; braises lentes, jamais un voile) ; les **flèches de pression** (`crush`, signal, épaisses, de tous côtés vers le module, ≥ 6 px à 270 px) ; la **déformation** (`flex` : un léger enfoncement de la coque qui revient) ; l'acier qui **tient** (`hold` : il s'allume veille) ; la **lecture** (`read` : la carte s'allume veille, des traits verts montent d'elle — une tête de lumière qui avance, pas un fil qui s'allume d'un coup).

**API (exactement)** : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.
- `root` : re-parenté par `world.js` (fond : tourné par `spin` / `tilt` autour de `REC.centre` ; avion ; établi). Origine = base de la boîte.
- `A` : `beacon` (le nez), `pile`, `chassis`, `boards`, `module` (centre), `board`, `steel`, `insul`, `absorb` (un point de chaque couche sur la face coupée), `centre`.
- `parts` : `{ beacon, pile, chassis, boards, module, steel, insul, absorb, board }`, chacune avec SES matières.
- `update(P, time, px)` — seize fois par image, aucune allocation :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi, 0 ailleurs (rien ne change, sauf ce que tu juges utile au halo) |
| `explode` | **sur l'établi** : 0 assemblé → 1 éclaté, **un chemin de l'avant vers le cœur**, en UN cadre vertical vu de `VIEW.exploded` : la balise part devant et en haut, sa pile sort d'elle encore plus loin ; le boîtier recule vers l'arrière au sol, son couvercle se lève ; les cartes montent hors du boîtier en éventail vers l'arrière ; **le module se soulève un peu et reste au centre**, seul sur le halo. **Rien sous le sol (y ≥ 0)**, rien derrière l'en-tête. Le geste de chaque pièce dans sa fenêtre (`delay`/`span`), dans l'ordre de la voix : balise (0 → 0,45), pile (0,15 → 0,6), boîtier et cartes (0,3 → 0,85), module (0,5 → 1) |
| `xray` | boîtier, cartes et balise passent au verre (contour encre, presque vides) : le module plein se voit dedans — « rien n'est blindé ». 0 → 1 |
| `sep` | cm (de `sepOf`) : tout sauf le module (boîtier, cartes, balise, pile) descend de `sep` — le module remonte, le reste reste au fond |
| `apart` | 0 → 1 : boîtier et balise **cassés et dispersés** au sol autour du point de départ, éteints (gris sombre, plus d'orange vif), le module à part. Cause jamais montrée (pas d'écrasement par l'eau) |
| `section` | 0 → 1 : le module ouvert en coupe, ses couches écartées ; à 0 il est entier |
| `heat`, `crush`, `flex`, `hold` | la flamme ; les flèches ; l'enfoncement qui revient ; l'acier veille (voir plus haut) |
| `ping` | 0 → 1 : le flash de la balise, une fois par seconde, phase `frac((time − PING.at) / PING.period)` — **la même formule que `fond.js`** : l'anneau naît au flash |
| `charge` | la pile : 1 pleine → 0 vide (une jauge veille sur elle, lisible sur `VIEW.beaconBench`) |
| `read` | la carte mémoire lue : lueur veille + traits qui montent (0 → 1) |
| `shine` | les bandes réfléchissantes accrochent la lumière : un éclat qui glisse le long d'elles (0 → 1) |
| `litBeacon`, `litPile`, `litCase`, `litCore` | la pièce nommée luit faiblement veille (`litCase` : boîtier + cartes) |
| `litSteel`, `litInsul`, `litAbsorb` | la couche nommée, avec `section` 1 |

**Images à réussir** (liste fermée ; poses dans `world.js` → `VIEW`, état entre parenthèses) :
1. **La première image** (`POSE0`, `FIRST` : spin 20, tilt 18, au fond le bouchon de `fond.js` suffit) : la boîte orange en contre-plongée, 40 % de la largeur, arêtes nettes, bandes, le flash de la balise — se lit à 270 px, sans le son. Puis les quatre candidates de `.cache/planches/034/premiere-image.json`.
2. `VIEW.beacon` (ping 1) : le nez de la balise, son interrupteur à eau, le flash.
3. `VIEW.floor` (STAGED) : posée sur le fond, de trois quarts, sur son halo — l'objet le plus lisible du cadre.
4. **L'éclaté** `VIEW.exploded` (explode 1) : tout dans un cadre vertical, sous la ligne « Système Décodé », rien sous le sol.
5. `VIEW.beaconBench` (explode 1, litPile 1, charge 1 puis 0,3) : la balise et sa pile, le niveau se lit.
6. `VIEW.caseBench` (explode 1, xray 0 puis 1) : le boîtier et les cartes passent au verre.
7. `VIEW.core` (explode 1, xray 1, litCore 1) : le module seul, plein, sur son halo.
8. `VIEW.section` (section 1 ; litSteel, puis litInsul, puis litAbsorb) : chaque couche se distingue de ses voisines à 270 px ; la carte au cœur.
9. `VIEW.section` avec heat 1 (la flamme meurt sur l'isolant), puis crush 1, flex 0,8, hold 1.
10. `VIEW.crushed` dans la mer (STAGED, xray 1, crush 1, flex 0,8 → 0,3, hold 1) : les flèches énormes, le module plein dans le boîtier de verre.
11. `VIEW.section` sur l'établi, read 1 : la carte veille, les traits qui montent.
12. `VIEW.verdict` (STAGED, depth 3 898, free 1, apart 1) : les morceaux sombres au sol, le module seul au-dessus.
13. `VIEW.like` (shine 0 → 1) : orange vif, les bandes qui accrochent la lumière.
14. La couverture : `cover` d'`episode.json` (`eclate$`, explode 1, litCore 1, ping 1, el 30, shift −430).

**Propre au dossier** : la boîte tourne en coulant (`spin`, `tilt` dans `world.js`) — vérifie qu'aucune arête ne scintille à 20–25 °/s ; le flash de la balise est une respiration nette d'1/10 s par seconde, pas un clignotement criard (≤ 3 d'émission) ; dans l'avion (`VIEW.tail`, `tailBox`, provisoires) la boîte fait 15 à 40 px : sa peinture doit la faire lire seule.

---

## `src/fond.js` — l'Atlantique de nuit, de la surface à 3 900 m

**À lire pour l'idiome** : `episodes/007-siege-ejectable/src/jet.js` (l. 340–520 : dôme à l'infini, traînées), `episodes/026-soyouz-ms10/src/sky.js` (`buildSky` : ce qui tient du sol à 93 km), `episodes/023-eolienne-de-secours/src/avion.js` (la peau de verre de l'A330 : `skin`, matières `glass` + `asShell`, ses cadres) — **copie les fonctions utiles, n'importe que `FUSE`, `TAIL` de `023/src/plan.js`**. `kit/lib/atmo.js` (`makeMotes` en traînées, `makePool`).

**Ce qu'il construit** (`plan.js` : `DEEP`, `WRECK`, `BEAM`, `PING`), à l'échelle vraie, **la boîte toujours à l'origine** :
- **La neige marine** : des particules qui filent en traînées selon `rush` (+ la boîte coule : elles montent ; − elle remonte : elles descendent ; 0 : elles flottent), denses près de la caméra, sobres. C'est ce qui dit « sous l'eau » et « ça bouge » dès l'image 1.
- **La surface vue d'en dessous** (`y = depth·100`) : un reflet encre faible, ondulé, qui ne se voit que de près (`depth` < ≈ 150 m) ; jamais une dalle grise.
- **Le fond** (`y = −(3900 − depth)·100`) : plaine abyssale en **lignes** (courbes de niveau, rides de sédiment près de la boîte), pas de sol plein ; un **halo** (`pool`) sous la boîte quand elle est posée ; lisible à toutes les échelles, de 1 m (`VIEW.floor`) à 40 km (`VIEW.ocean`).
- **L'épave de verre** (`WRECK`) : **la queue de l'A330** (dérive, empennage, cône arrière, cassée net à l'avant ; même trait que l'avion du 023) qui **coule derrière la boîte** dans l'image 0 (`wreck` 0, `WRECK.tailSink`), puis couchée sur le fond (`wreck` 1) parmi quelques morceaux de fuselage (anneaux de cadres, un panneau de hublots) et un moteur. Arêtes encre, liseré **signal** discret tant qu'elle coule (la menace derrière le sujet) ; personne, aucun siège occupé, aucun logo.
- **Les anneaux de la balise** (`ping`) : une sphère d'onde veille naît au nez de la balise à chaque flash (`PING`, même phase que `model.js`), grandit **au rythme de l'écran** (≈ un cadre en 0,8 s quelle que soit la distance : `px`) et **s'arrête sur la portée** `PING.reach` ; une lumière qui a un endroit (un liseré net, pas un voile).
- **La portée** (`range`) : la demi-sphère de 1,85 km **au-dessus du fond seulement**, liseré veille faible ; dans les plans larges (quand la boîte ferait moins de 6 px), elle devient un point lisible à 270 px : veille tant que `ping` > 0, encre quand la balise est morte.
- **La lumière qui descend** (`beam`) : une lampe (cœur blanc, longue traîne) qui descend de la surface à `BEAM.stop` au-dessus du fond, son cône encre très léger, et **la tache de lumière sur le fond et sur l'épave** de verre — c'est l'épave éclairée qui doit se lire, pas le cône.
- `fog(d)` : la densité du brouillard pour une caméra à `d` (une queue de 9 m à 30 m se voit depuis 1,5 m ; la colonne de 3,9 km depuis 11 km).

**API (exactement)** : `export function buildFond()` → `{ group, A, update(P, time, px), fog(d) }`. `A` : `tail`, `field` (le centre du champ de débris), `lamp` (la tête de la lumière), `surface`. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `depth` | mètres vrais (0 → 3 900) : place la surface et le fond autour de la boîte |
| `rush` | −1…1 : la neige en traînées (voir plus haut) |
| `wreck` | 0 la queue coule près de la boîte (`tailSink`, nez en bas ≈ 35°) → 1 couchée dans le champ de débris (sur une coupe) |
| `ping`, `range` | les anneaux ; la demi-sphère de portée |
| `beam` | 0 → 1 : la lampe descend, l'épave s'éclaire |
| `shell` | la présence du décor aux rayons X (0 → 1) |
| `pool` | le halo sous la boîte posée |
| `mood` | 0 / 1 : le liseré de la queue qui coule, signal à 1 |

**Images à réussir** (liste fermée) :
1. **La première image** (`POSE0`, `FIRST`) : la queue de verre reconnaissable en un tiers de seconde **derrière** la boîte, la surface faible au-dessus, la neige qui monte, l'anneau qui part de la balise. `WRECK.tailSink` est réglé pour la famille `az −28` des candidates : recale-le sur la planche des quatre (`.cache/planches/034/premiere-image.json`) et écris la ligne sous « À changer ailleurs ».
2. `VIEW.sink` (depth 300 → 3 000, rush 1, ping 1) : on descend avec elle, le noir, la neige.
3. **`VIEW.range`** (STAGED, range 1, ping 1, fs 400000) : la colonne d'eau entière — le fond, la demi-sphère, la surface 3,9 km plus haut, la boîte en point veille — lisible à 270 px.
4. `VIEW.ocean` (même état) : la portée, petite bulle veille dans un océan noir.
5. `VIEW.floor` (STAGED, pool 0,25) : le fond de près, le halo, l'épave au loin dans le noir sans rien voler au sujet.
6. `VIEW.alone` : la boîte petite et seule, la colonne noire au-dessus.
7. `VIEW.wreck` (beam 0 → 1) : la lampe descend, l'épave de verre s'éclaire, la boîte au bord.
8. `VIEW.rise` (free 1, depth 3 880 → 3 600, rush −1, beam 1) : le module monte dans le faisceau, le fond s'éloigne.

**Propre au dossier** : `far` vaut 10 000 km de scène (`main.js`, 1e7 cm) — surveille les surfaces qui se battent au loin (`near` suit `d`) ; la mer est à l'échelle vraie, mais un plan qui ne se lit pas à l'échelle vraie se dit dans ton journal (on passera à une maquette, sans chiffre affiché).

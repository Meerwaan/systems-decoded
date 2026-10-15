# 022 · Batterie de téléphone — les décors à construire

**Trois fichiers neufs, un agent chacun, en parallèle** : `src/model.js` (le téléphone), `src/pores.js` (la maquette des pores), `src/chambre.js` (la chambre et les rangs). Chacun **remplace en entier** un bouchon (`A STAND-IN` en tête) et garde son API à la lettre : `world.js` l'appelle déjà, le film se construit. Le contrat : `episodes/022-batterie-telephone/src/plan.js` (où tout se tient) et `src/world.js` (`FIRST` : la liste fermée des nombres, `apply()` : comment ton fichier est appelé). La recette commune : `docs/recette-agents.md` — **30 images lues au plus**, journal `docs/journal/022-<fichier>.md`, planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans `renders/`.

Ce que personne n'a le droit de montrer : **aucune marque** (ni logo, ni îlot d'appareil photo reconnaissable, ni stylet, ni forme d'un modèle précis — une dalle aux coins ronds, une seule lentille ronde au dos au plus) ; **aucun feu, aucune flamme, aucune fumée** ; personne de blessé. Trois couleurs : **signal = la chaleur** (la batterie qui chauffe, ce que retient l'oreiller, le point chaud) ; **veille = le système vivant** (le lithium qui passe, le circuit qui coupe, le film qui se ferme) ; **ink = le reste** (le courant du chargeur dans le câble compris). Pas de couleur « cuivre » : les deux feuilles de métal sont deux gris.

**Deux échelles, et qui fait le fondu.** Le film passe du téléphone aux pores par le nombre `micro` (0 → 1, ≈ 0,35 s, caché dans une plongée ou posé sur une coupe). Le partage est celui-ci, et il n'y en a pas d'autre :

- **`world.js` tient les deux BOUTS** : à chaque image, avant d'appeler qui que ce soit, il pose `system.root.visible` (faux dès que `fade` est à 0) et `pores.group.visible` (faux tant que `micro` est à 0). **Ne touche jamais à la visibilité de ta racine.**
- **Entre les deux, chacun fond SES matières** : `model.js` et `chambre.js` s'effacent avec `fade` (1 → 0 : c'est `1 − micro`, lissé) ; `pores.js` apparaît avec `micro` (0 → 1). À mi-course les deux sont à moitié là : c'est voulu, la lueur de la batterie remplit le cadre à cet instant.
- **`model.js` ne sait rien de la maquette, `pores.js` ne sait rien du téléphone.** `world.js` monte la maquette en `MICRO.at`, compté depuis l'origine du système, sous le même parent que lui (l'établi, ou l'endroit du téléphone dans la chambre) : elle est au même endroit dans les deux décors, et l'éclaté ne la déplace pas.

Une image d'essai tient un état : `"state": { "set": 0, "explode": 1, … }` (`set` 0 = établi, 1 = chambre). Les poses de départ sont dans `VIEW` (`world.js`) ; elles ont été réglées sur les bouchons : rends les tiennes.

---

## 1. `src/model.js` — le système : le téléphone, sa batterie, ses couches, son circuit

**À lire pour l'idiome** : `episodes/017-irm/src/model.js` (un système qui s'ouvre, `lit…`, `xray`), `episodes/011-fusible-pyro/src/model.js` (une petite pièce et sa coupe), `kit/lib/build3d.js`.

**API**

```js
export function buildSystem() → { root, anchors, update(s, time, px) }
```

- `root` : son origine est le centre du **dessous** du téléphone ; grand axe x, port de charge vers −x ; il est couché à plat, **dos vers le haut**. `world.js` le re-parente (chambre ↔ établi) : c'est UN seul objet.
- `anchors` (Object3D, liste fermée — les actes y accrochent leurs étiquettes) : `phone`, `port`, `battery`, `board`, `dent`, `copper`, `film`, `alu` (les trois feuilles de la langue), `roll` (le flanc +z de la batterie).
- `update(s, time, px)` est appelée seize fois par image : ni allocation, ni horloge, ni hasard non semé.

**Ce qu'il construit** (cotes dans `plan.js` : `PHONE`, `PORT`, `BATT`, `BOARD`, `OPEN`, `TONGUE`, `DENT`)

1. **Le téléphone** : un corps (cadre et écran, dessous), un dos qui se soulève. Plein, sombre, arêtes fines, trois valeurs de gris.
2. **La batterie** : une poche plate ; à son bout −x, **le petit circuit de protection** (une barrette, deux languettes vers la poche, un interrupteur qu'on VOIT s'ouvrir, un point pour la sonde de température).
3. **Ses couches** : un enroulement d'axe z (ses spires se lisent sur le flanc +z de la poche, **au moins 2 px par trait à `VIEW.roll`, quitte à en dessiner moins**) dont le bout extérieur se déroule en **langue** vers +x : trois feuilles écartées en éventail — de bas en haut : cuivre **enduit** (une marge de métal nu au bord, l'enduit plus sombre), **le film** (le plus clair, un peu plus large que le métal, mat), aluminium **enduit**. « Un bord qui se déroule dit tout » : c'est le geste qui montre « enroulé ».

**Chaque nombre reçu**

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi, 0 dans la chambre (ombres portées, si besoin) |
| `fade` 1 → 0 | le passage à l'échelle des pores : **tout ce que tu dessines se dissout** (multiplie tes opacités et tes émissions) ; à 0 `world.js` cache ta racine |
| `temp` | la température en degrés : c'est l'en-tête qui l'affiche ; tu peux l'ignorer |
| `heat` 0–1 | la chaleur de la batterie, DESSINÉE : une lueur signal **qui a un endroit** (un cœur brillant, une longue traîne), dans la poche ; elle se voit à travers le corps même à `xray` 0 (c'est elle, la lueur sous l'oreiller de la première image) ; ≤ 3 d'émission |
| `charge` 1 / 0 | le circuit laisse passer (1) ou a coupé (0) : son interrupteur s'ouvre, il s'allume veille ; sur l'établi, le petit trajet du courant du port aux languettes s'arrête |
| `xray` 0–1 | le corps, le dos et la poche deviennent verre là où ils sont : la batterie, puis ses couches |
| `explode` 0–1 | le dos monte à `OPEN.back`, la batterie (avec son circuit) à `OPEN.battery`, le corps reste |
| `unroll` 0–1 | la poche devient verre, la langue se déroule vers +x et ses trois feuilles s'écartent (`TONGUE`) ; à 0 elle est rentrée, invisible |
| `swell` 0–1 | la batterie gonflée : la poche bombe, le dos se décolle du corps |
| `dent` 0–1 | la batterie abîmée : un pli sur la poche en `DENT`, souligné signal |
| `spot` 0–1 | le point chaud dans le téléphone : une lumière signal qui a un endroit et grandit, en `DENT` (le même nombre allume celui de la maquette : ce n'est pas ton affaire) |
| `level`, `levelSeen` | le niveau de charge (0–1) et combien on le DESSINE : une colonne veille dans la poche ; au-dessus de 0,95 son sommet passe signal (« trop chargée »), sous 0,06 son fond passe signal, en respiration lente (« trop vidée ») |
| `litCopper`, `litAlu` | la feuille nommée, sur la langue, s'éclaire (encre) |
| `litFilm` | la feuille du milieu luit veille |
| `litRoll`, `litBoard` | les spires sur le flanc de la poche · le circuit |

**Les images à réussir (liste fermée)**

1. Le téléphone entier sur l'établi (`VIEW.whole`) : on ne reconnaît aucun modèle, et ce n'est pas un jouet.
2. La même pose, `xray` 1, `heat` 1 : la batterie chaude dans le verre — la lueur a un cœur.
3. **L'éclaté** (`VIEW.exploded`, `explode` 1) : corps, batterie, dos — trois plans francs, la batterie au milieu.
4. La langue (`VIEW.opened` puis `VIEW.tongue`, `unroll` 1) : trois feuilles, on voit que celle du milieu est d'une autre matière ; `litFilm` 1.
5. Le flanc de la poche (`VIEW.roll`, `litRoll` 1), et `unroll` 0,5 : la langue à mi-course.
6. Le circuit (`VIEW.board`) : `charge` 1 → 0, l'interrupteur s'ouvre — deux images avant / après, de profil.
7. `VIEW.battery`, `levelSeen` 1 : `level` 1 (sommet signal), 0,03 (fond signal), puis `heat` 1.
8. `dent` 1, `spot` 0,6 (`xray` 1), puis `swell` 1 : abîmée, gonflée.
9. `fade` 0,5 : rien de plein ne reste à moitié effacé devant la lueur (chaque pièce qui s'efface a ses propres matières).

---

## 2. `src/pores.js` — l'échelle des pores : le film entre ses deux électrodes

C'est **l'image du film** : le phénomène invisible a sa petite scène, et elle doit se lire sans légende (CLAUDE.md : « un phénomène invisible ne se montre pas par une lueur »).

**À lire pour l'idiome** : `episodes/005-arret-urgence/src/chain.js` (la petite scène d'un phénomène invisible, mot par mot), `episodes/009-micro-ondes/src/model.js` (des trous dessinés dans un shader, fondus sous le pixel) et `009-micro-ondes/src/waves.js`, `kit/lib/atmo.js` (`makeMotes` : des grains, des traînées), `kit/lib/build3d.js`.

**API**

```js
export function buildPores() → { group, anchors, update(s, time, px) }
```

- `group` : la maquette, autour de **sa propre origine : le milieu du film**. `world.js` la monte en `MICRO.at` (compté depuis l'origine du système), dans la chambre comme sur l'établi, et tient sa visibilité aux deux bouts. Tu ne lis rien de `model.js`.
- `anchors` (liste fermée) : `upper` (l'électrode du haut), `membrane` (la face du film, devant la coupe), `lower` (l'électrode du bas, son bord avant), `ember` (le point chaud, sous le film), `hair` (le dessus du cheveu).
- `update(s, time, px)` : seize fois par image ; ni allocation, ni horloge, ni hasard non semé.

**Ce qu'il construit** (cotes : `MICRO` dans `plan.js`) — **une maquette, à son échelle propre : aucune longueur n'y est jamais affichée.**

De haut en bas : l'électrode du haut (côté aluminium) **coupée** — elle ne couvre que l'arrière (z < `MICRO.cut`), sa tranche vers nous, sinon le sandwich cache sa garniture —, le liquide, **le film et ses pores** (de vrais trous, lisibles un par un : ≥ 12 px chacun sur une vignette de 405 px à `VIEW.film`), le liquide, l'électrode du bas (côté cuivre), entière. Les faces des électrodes sont granuleuses (c'est un enduit, pas une tôle). Le film est **translucide** : le point chaud, né sur la face de l'électrode du bas en `MICRO.hot`, **luit à travers lui**. Un cheveu couché devant, à hauteur du film (`MICRO.hair`) : son épaisseur contre la tranche du film. **La maquette porte sa propre lueur de fond** (un halo doux sous elle) : dans la chambre il n'y a pas de flaque d'établi, et elle ne doit jamais être sombre sur sombre.

**Chaque nombre reçu**

| nombre | ce que tu en fais |
| --- | --- |
| `micro` 0 → 1 | **ton fondu d'entrée** : à 0 rien n'est dessiné (`world.js` cache ton groupe), à 1 tout est là ; entre les deux, multiplie tes opacités et tes émissions |
| `bench` | 1 sur l'établi (sa flaque est sous toi), 0 dans la chambre (ton halo est seul) |
| `temp` | la température en degrés (l'en-tête l'affiche) : tu peux en réchauffer la teinte des électrodes, ou l'ignorer |
| `ions` 0–1 | le lithium, DESSINÉ : des grains veille qui descendent de l'électrode du haut à celle du bas **par les pores** ; devant un pore fermé ils s'arrêtent contre le film et restent là |
| `pores` 1 → 0 | les pores se ferment **UN À UN**, du point chaud vers les bords (un ordre fixe, semé) : c'est le climax du film ; à 0,5 la moitié est fermée, autour du point chaud |
| `melt` 0–1 | le film fond : il s'assouplit, se glace (mat → lisse), du point chaud vers les bords, et prend la couleur veille ; **il ne brûle pas, ne se déchire pas, ne coule pas** |
| `spot` 0–1 | le point chaud : une lumière signal qui a un endroit (un cœur, une longue traîne) et grandit, en `MICRO.hot`, sous le film ; à 0,7 elle a cessé de grandir, elle n'est pas éteinte |
| `liquid` 0–1 | le liquide entre les électrodes, DESSINÉ : un corps signal très pâle qui emplit les deux intervalles (il est inflammable : c'est une menace, pas un décor) |
| `touch` 0–1 | « si elles se touchent » : le film cède en UN endroit et les deux électrodes se rejoignent par là — une hypothèse, acte 1 seulement |
| `chain` 0–1 | « la chaleur appelle la chaleur » : depuis cet endroit, des points chauds allument leurs voisins, l'un après l'autre |
| `hair` 0–1 | le cheveu, pour l'échelle (verre encre, ses écailles en traits fins) |
| `litAlu`, `litCopper` | l'électrode du haut · celle du bas s'éclaire (encre) |
| `litFilm` | le film luit veille |

**Les images à réussir (liste fermée)** — toutes avec `"state": { "set": 0, "micro": 1, … }`

1. **Au repos** (`VIEW.pores`, `ions` 1, `pores` 1) : deux électrodes, un film entre elles, le lithium qui passe par les trous — sans légende.
2. De près (`VIEW.film`) : les pores un par un, les grains qui les traversent.
3. `hair` 1 (`VIEW.pores`) : le cheveu contre la tranche du film — on comprend l'échelle.
4. `litAlu` 1, `litCopper` 1, puis `litFilm` 1 seul ; `liquid` 1.
5. « Si elles se touchent » (`VIEW.hot`, `touch` 1, `chain` 0 → 1) : deux images.
6. **Le climax** (`VIEW.film`), quatre images : `spot` 0,6 · `spot` 1 `melt` 0,5 · `pores` 0,5 · `pores` 0 `ions` 0,4 — plus rien ne passe, les grains butent contre le film, la braise luit encore dessous.
7. Après (`VIEW.pores`, `pores` 0, `melt` 1, `spot` 0,7, `mood` 0) : le film fermé, glacé, veille — et rien qui promette que c'est fini.
8. Dans la chambre (`"set": 1`, pose `inRoom(VIEW.pores)` : ajoute `SPOTS[0]` à `tx, ty, tz`) et à `micro` 0,5 : la maquette se tient seule sur le noir, lisible, et son entrée ne claque pas.

---

## 3. `src/chambre.js` — la chambre, la nuit ; et les rangs

**À lire pour l'idiome** : `episodes/004-differentiel/src/room.js` et `episodes/016-disjoncteur/src/wall.js` (une pièce aux rayons X, toi dedans), `episodes/017-irm/src/suite.js` (verre, grille, un personnage), `kit/lib/figure.js` (`makeFigure`, couché en déplaçant son groupe : voir `006-defibrillateur/src/hall.js`), `episodes/005-arret-urgence/src/reactor.js` (beaucoup d'objets identiques : un attribut par instance), `kit/lib/atmo.js` (`makeMotes`).

**API**

```js
export function buildChambre() → { group, ranks, anchors, update(s, time, px) }
```

- `group` : la chambre, en coordonnées de la pièce (sol y = 0). **Le téléphone n'en fait pas partie** : `world.js` y monte le système, en `phoneSpot(place)`.
- `ranks` : les jumeaux du téléphone, en coordonnées de l'établi (`world.js` le pose dessus). La case (0, 0) reste vide : c'est le système lui-même qui l'occupe.
- `anchors` (liste fermée) : `pillow` (le dessus de l'oreiller posé), `pocket` (la chaleur retenue dessous), `head`, `socket`, `table`.

**Ce qu'il construit** (cotes : `ROOM`, `BED`, `PILLOW`, `YOU`, `TABLE`, `SOCKET`, `SPOTS`, `phoneSpot`, `PORT`, `PHONE`, `RANKS`)

1. **La chambre aux rayons X** : murs et plafond à peine (traits fins), **pas de sol plein : une grille** ; le lit (sommier et matelas de verre), la couette sur toi, la table de nuit, la prise au mur. La nuit : rien d'éclairé que ce qui compte.
2. **Toi**, endormi sur le côté, tourné vers −x (vers le téléphone, vers la caméra) : personnage de verre couché, la tête sur l'oreiller. Tu respires (lent, périodique : c'est `time`, pas un nombre) — **ça vit dès la première image**. Jamais en très gros plan, jamais la main seule.
3. **L'oreiller** : un vrai volume mou (pas une boîte), qui peut être un corps ou un simple contour, et se soulever.
4. **Le câble**, de `SOCKET` au port du téléphone (`phoneSpot(place)` + `PORT`) : un conducteur sombre, des tirets clairs, larges, en centimètres, qui avancent d'au plus un septième de période par image ; son bout suit le téléphone.
5. **La chaleur retenue** (`trapped`) : des grains signal chauds (des traînées, pas des points) qui montent du téléphone, **butent sous l'oreiller et y restent** — une poche qui a un endroit et un bord (le dessous de l'oreiller), jamais un voile. Périodiques : vivants dès la première image.
6. **Les rangs** (`ranks`) : « un modèle entier » — la même dalle, des centaines de fois, couchée sur le sol de l'établi, en rangs qui filent vers −z (`RANKS`). Chaque jumeau : une dalle sombre aux arêtes claires et, dedans, une braise signal (sa batterie). Les règles des objets identiques s'appliquent (plus sombres côté opposé à la caméra, un jour dessous) ; **les rangs lointains se fondent dans le noir avant d'atteindre l'en-tête** (y < 410 à `VIEW.ranks`).

**Chaque nombre reçu**

| nombre | ce que tu en fais |
| --- | --- |
| `room` | 1 dans la chambre (dessine `group`, pas `ranks`), 0 sur l'établi (l'inverse) |
| `fade` 1 → 0 | à l'échelle des pores tout ce qui entoure le système s'est dissous : multiplie tout ce que tu dessines ; à 0, **invisible**, pas seulement éteint |
| `shell` 0–1 | la radio de la pièce : murs, lit, table, prise |
| `you` 0 / 1 | personne · toi endormi |
| `cloth` 1 → 0 | l'oreiller : 1 un corps (verre dense, ses coutures : on lit un oreiller) → 0 un contour nu, le téléphone se voit dessous |
| `pillow` 0 → 1 | l'oreiller : posé sur le téléphone → soulevé et dégagé (`PILLOW.lift`, basculé vers la tête de lit) |
| `trapped` 0–1 | la chaleur retenue, DESSINÉE ; dès que l'oreiller est levé (`pillow`) ou le téléphone sorti (`place` ≥ 0,5), les grains montent libres et se raréfient : tu le déduis de ces nombres |
| `heat` 0–1 | la chaleur de la batterie (dessinée par `model.js`) : tu peux en teinter le dessous de l'oreiller |
| `plug` 1 / 0 | le câble dans le téléphone · retiré (son embout recule de quelques centimètres, ses tirets s'arrêtent) |
| `charge` 1 / 0 | le courant du chargeur : les tirets du câble courent (1) ou s'arrêtent et s'éteignent (0) |
| `place` 0 · 1 · 2 | où est le téléphone (`phoneSpot`) : sous l'oreiller · sur la table de nuit, à découvert · sur le sol nu, loin du lit. Tu n'en fais que le bout du câble — et, de 1 à 2, un chemin veille pointillé au sol, de la table au point d'isolement |
| `ranks` 0–1 | les rangs arrivent, rang après rang, les plus proches d'abord |
| `recall` 0–1 | ils sont rappelés : leurs braises s'éteignent, rang après rang, du fond vers nous (une vague lente, pas un clignotement) — celle du système ne t'appartient pas, elle reste |

**Les images à réussir (liste fermée)**

1. **La première image du film** (`POSE0`, état `FIRST`) : la nuit, toi endormi, la tête sur l'oreiller, et sous l'oreiller, de notre côté, une lueur chaude qui a un endroit. Elle doit arrêter le pouce **sans texte** et se lire à 270 px de large. Essaie quatre cadres avant de choisir.
2. Le lit entier (`VIEW.bed`) : le lit, toi, l'oreiller, la table, le câble jusqu'à la prise.
3. `VIEW.pillow`, `cloth` 1, `trapped` 1 : la chaleur qui bute sous l'oreiller et reste — **« la chaleur ne sort plus » sans légende**.
4. `VIEW.under`, `cloth` 0,2 : le téléphone (plein) sous le contour de l'oreiller, ta tête au-dessus.
5. `pillow` 1, `trapped` 0,3 : l'oreiller levé, la chaleur s'en va.
6. `VIEW.cable` : `charge` 1 puis 0 — les tirets, arrêtés.
7. `VIEW.table`, `place` 1 : le téléphone à découvert ; `plug` 0.
8. `VIEW.away`, `place` 2 : le téléphone seul sur le sol nu, le lit loin derrière, le chemin au sol.
9. **Les rangs** (`set` 0, `VIEW.ranks`, `ranks` 1) : des centaines de braises ; puis `recall` 0,5 et 1 — il n'en reste qu'une, celle du système.

---

## Ce que `world.js` fait déjà (ne le refais pas)

Il monte le système au bon endroit (`phoneSpot(place)`), le re-parente entre la chambre et l'établi, **monte la maquette des pores sur lui** (en `MICRO.at`, même parent), pose `ranks` sur l'établi, calcule `fade` et tient les deux bouts du fondu, règle la lumière (`fx, fy, fz, fs`), l'ambiance (`mood`), le brouillard, la flaque et la grille de l'établi (la grille s'efface à l'échelle des pores, la flaque reste). `inRoom(pose, place)` porte dans la chambre une pose écrite autour du système. Les actes lisent les ancres par `world.system.anchors`, `world.pores.anchors`, `world.chambre.anchors`.

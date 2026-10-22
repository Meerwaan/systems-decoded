# 024 · Bloc opératoire — les décors

Deux fichiers neufs, un agent chacun, en parallèle : `episodes/024-bloc-operatoire/src/model.js` (le système : le schéma IT médical) et `src/bloc.js` (le bloc opératoire aux rayons X). Tous deux existent en **bouchon** (volumes gris à la bonne place) : le film se construit, on remplace le fichier en entier en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED` / `HOMED`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/024-actes.md` (lis au moins son haut et les lignes qui te concernent). Faits : `docs/faits/024-bloc-operatoire.md` (sections 2 à 4, « Vocabulaire exact », « À ne pas dire ») et `024-contre-verification.md`.

**« Chez toi » n'est pas à construire** : c'est la pièce du 016 réutilisée telle quelle (`episodes/016-disjoncteur/src/wall.js` et son disjoncteur, branchés dans `world.js`, dans le repère du 016, à l'origine — jamais visible en même temps que le bloc). On n'y touche pas.

**Le tact.** Tu dors, il ne t'arrive rien. Personne n'est blessé : pas de sang, pas de plaie, pas de corps ouvert. Un champ opératoire (un drap) te couvre jusqu'à la poitrine ; ton visage est visible, un masque ou une sonde vers le respirateur. Le chirurgien travaille AU-DESSUS du drap : on voit ses mains, jamais ce qu'elles font. « Ici, le noir… » est un **et si** (la scène) : le bloc s'éteint objet par objet sur les mots, et l'acte suivant repart dans la lumière.

**L'exactitude, à l'image** (c'est un dossier pour les électriciens : ils relèveront tout) :

- **Les masses sont reliées à la terre** — toujours, dans le bloc comme sur l'établi : le conducteur de protection de chaque carcasse rejoint la barrette de terre, visible. Ce sont **les conducteurs actifs du secondaire** qui ne sont reliés à aucune terre (« aucun fil n'est relié à la terre »).
- Le premier défaut ne coupe rien ; le **deuxième**, sur l'autre conducteur, ferme une boucle et **les disjoncteurs du circuit** coupent. Le contrôleur permanent d'isolement (CPI) **mesure et prévient, il ne coupe jamais**.
- **Aucune valeur à l'écran** : ni kΩ, ni mA, ni kVA, ni seconde ; pas de graduation chiffrée sur la jauge du CPI, pas de texte sur les plaques. La NF C 15-211 n'a pas été lue.
- Vocabulaire : transformateur d'isolement, enroulements (primaire, secondaire), contrôleur permanent d'isolement, défaut d'isolement, carcasse / masse, conducteur de protection, barrette de terre. Jamais « disjoncteur d'isolement », jamais « court-circuit » pour un premier défaut.

**Les repères.** Le bloc : sol y = 0, la table selon x, **ta tête à −x** (côté anesthésie, le respirateur là), tes pieds à +x ; la salle est ouverte vers +z (le côté de la caméra) ; le **mur du fond** est le plan z = −260, derrière le chirurgien ; derrière lui, dans un local technique, **l'armoire IT** qui tient le système. Azimut (vérifié dans `kit/lib/stage.js` : caméra = cible + d·(sin az·cos el, sin el, cos az·cos el)) : **`az` 0 se tient sur +z** et regarde vers −z (la salle de face) ; **`az` −90 se tient sur −x** (côté tête) ; +90 côté pieds ; ±180 derrière le mur du fond. La lumière clé vient de −x, +y, +z : on filme surtout entre `az` −20 et −50 — la caméra côté tête et devant, regardant vers +x / −z, où sont placés l'appareil et l'armoire (au-delà de la table : rien entre la caméra et toi).

**Couleurs** : signal = la menace (le fil sur le métal, le défaut, le noir qui viendrait, le courant de défaut chez toi, le deuxième défaut qui ferme la boucle) ; veille = le système vivant (les enroulements qui ne se touchent pas, le circuit relié à aucune terre, le CPI qui mesure et prévient, l'alarme dans la salle, le circuit qui tient) ; ink = le reste, le courant ordinaire compris. Pas de vert « médical », pas de bleu : la tenue du chirurgien est en verre encre, comme toi.

---

## `src/model.js` — le schéma IT médical (le système)

**À lire pour l'idiome** : `episodes/021-veille-tgv/src/model.js` (pièces, `lit…`, `explode`, ancres, `update` sans allocation), `episodes/016-disjoncteur/src/model.js` (un appareil modulaire à sa taille, des courants en tirets sur des conducteurs sombres), `kit/lib/build3d.js`.

**Ce qu'il construit**, en cm (tailles **illustratives**, rien ne s'affiche), origine = le fond de son étagère, **face avant vers +z** (la salle, la caméra) — `plan.js` : `XFO`, `MAINS`, `RAIL`, `BREAKERS`, `CPI`, `OUT`, `EARTH`, `CASE_A`, `CASE_B`, `LINK`, `GHOST`, `CAPS`, `SYSTEM`, `BENCHAT`. De gauche à droite : le réseau entre (−x), le transformateur, puis on monte au rail (disjoncteurs, CPI) et le circuit repart vers +x ; la barrette de terre court en bas.

- **Le transformateur d'isolement** (`XFO`) : la pièce-héros. Un noyau de tôles feuilletées en U–I, debout (stries larges, jamais fines), et sur chacune de ses deux jambes **son enroulement** : à gauche le **primaire** (le réseau), à droite le **secondaire** (le circuit) — deux bobines de cuivre (le gris le plus clair, chaud) qui ne se touchent pas : c'est ce qu'on comprend sans légende. Un capot (`cover`, sa propre matière) l'enferme ; il se soulève dans l'éclaté. Trois valeurs de gris : le noyau sombre, les bobines claires, le capot moyen.
- **Le réseau** (`MAINS`) : un câble qui arrive de −x au primaire ; son conducteur de protection descend à la barrette de terre.
- **Le circuit** : deux conducteurs sombres (des tirets clairs y courent quand `current` > 0 : le courant, encre) montent du secondaire au rail, passent par **deux disjoncteurs** (`BREAKERS`, manettes visibles) puis sortent vers +x (`OUT`). Dans le bloc, ils continuent dans les murs (c'est `bloc.js`) : ici ils s'arrêtent à `OUT`.
- **Le contrôleur permanent d'isolement** (`CPI`) : un boîtier modulaire de quatre modules sur le rail, sa face : **une jauge en barre** (sans chiffre ni graduation chiffrée : pleine veille quand l'isolement est bon, qui tombe et passe au signal quand il chute — `ins`), **un voyant** (`alarm`, veille), un bouton test. Trois fils fins : vers chacun des deux conducteurs, et vers la barrette de terre — c'est entre eux qu'il mesure. `cpi` : de lentes impulsions veille partent de lui dans les deux conducteurs (« un boîtier veille ») — une respiration, jamais un clignotement.
- **La barrette de terre** (`EARTH`) : une barre de cuivre en bas, ses vis ; s'y posent le conducteur de protection du réseau, le fil de terre du CPI et, sur l'établi, ceux des deux carcasses.
- **Sur l'établi seulement** (`bench` 1) : les deux conducteurs filent vers **deux bouts de carcasses** (`CASE_A`, `CASE_B` : deux boîtes de tôle, une face en verre pour voir dedans, un fil intérieur au gainage usé), chacune reliée à la barrette par **son conducteur de protection** (encre, toujours visible). `fault` : dans la carcasse A, le fil touche la tôle (une lumière qui a un endroit, signal) ; `fault2` : idem dans la carcasse B, sur l'AUTRE conducteur. Plus un socle (une plaque et deux poteaux de verre, comme au 021) si l'étagère manque. Dans l'armoire (`bench` 0), rien de cela ne se voit.
- **« Chez toi »** (`home`) : apparaissent ensemble **le pont** (`LINK`) qui relie une borne du secondaire à la barrette de terre (comme le neutre l'est chez toi) et **un différentiel fantôme** sur la ligne (`GHOST`, un module de verre) ; `ddr` l'allume veille.
- **Le chemin de retour minuscule** (`CAPS`) : trois petites marques (des « capacités » : deux plaquettes face à face, fines mais ≥ 1,8 px) entre la course des conducteurs et la barrette.
- **Les courants** — des têtes de lumière qui avancent, jamais un fil qui s'allume d'un coup ; des traînées, jamais des points :
  - `leak` : le courant de défaut parti de la carcasse A : par son conducteur de protection, la barrette, puis — `home` 1 — le pont, le secondaire et la ligne : **une boucle entière** de têtes signal, franches ; — `home` 0 — **un filet** : quelques têtes lentes et pâles qui ne passent que par les trois marques. C'est la même image, à un pont près.
  - `double` : la boucle du double défaut : carcasse A → conducteur de protection → barrette → conducteur de protection → carcasse B, et par les deux conducteurs : des têtes signal rapides.
  - `trip` : les manettes des disjoncteurs tombent ; au-delà, le circuit s'éteint (plus rien ne court).

**API à rendre** (exactement) : `export function buildSystem()` → `{ root, A, parts, update(P, time, px) }`.

- `root` : un `THREE.Group` (re-parenté entre l'armoire du bloc — `bloc.mount` — et l'établi).
- `A` (ancres, `Object3D`) : `xfo` (le haut du transformateur), `primary`, `secondary` (la face avant de chaque enroulement), `mains`, `breakers`, `cpi`, `gauge`, `out`, `earth`, `caseA`, `caseB` (le point du défaut de chacune), `ghost`, `centre`.
- `parts` : `{ xfo, cover, breakers, cpi, earth, stubs, ghost }` — chacune avec SES matières (`setPartOpacity`).
- `update(P, time, px)` — appelée seize fois par image, aucune allocation (le bouchon est grossier : ne le copie pas). `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (les deux carcasses, leurs conducteurs de protection, le socle), 0 dans l'armoire |
| `explode` | sur l'établi : 0 assemblé → 1 éclaté dans UN cadre vertical vu de `VIEW.exploded` — de haut en bas : le rail (disjoncteurs, CPI) qui monte, le capot qui se soulève et s'écarte, le transformateur au centre (le plus grand), ses deux enroulements écartés du noyau, la barrette en bas ; les carcasses restent à leur place, à droite |
| `apart` | « qui ne se touchent pas » : les deux enroulements s'écartent de quelques centimètres et l'espace entre eux s'allume veille, fin (0–1) |
| `current` | le courant ordinaire : des tirets encre courent dans les conducteurs (réseau et circuit) (0–1) ; au-delà des disjoncteurs ouverts (`trip`), rien |
| `home` | « chez toi » : le pont et le différentiel fantôme apparaissent (0–1) |
| `leak` | le courant de défaut parti de la carcasse A (boucle signal si `home` 1, filet par les trois marques si `home` 0) (0–1) |
| `ddr` | le différentiel fantôme s'allume veille (0–1) |
| `fault`, `fault2` | le fil touche la tôle dans la carcasse A, dans la carcasse B (0–1, signal, une lumière qui a un endroit) |
| `double` | la boucle du double défaut, têtes signal (0–1) |
| `trip` | les disjoncteurs déclenchent : 0 fermés → 1 manettes en bas, le circuit au-delà éteint |
| `cpi` | les impulsions veille du CPI dans les deux conducteurs (0–1) |
| `ins` | la jauge du CPI : 1 haute, veille → 0 basse, signal (franc sous 0,5) |
| `alarm` | le voyant du CPI, veille (0–1) |
| `litXfo`, `litPrim`, `litSec`, `litEarth`, `litCpi` | la pièce que la voix nomme luit faiblement veille (`litPrim` : le primaire et le câble du réseau ; `litSec` : le secondaire et les deux conducteurs ; `litEarth` : la barrette) |

**Images à réussir** (8, liste fermée — poses de départ dans `world.js` → `VIEW`, réglées sur bouchons) :

1. Le système entier sur l'établi, au repos (`VIEW.whole`, `current` 1, `cpi` 1) : on comprend l'objet sans légende — un transformateur, deux enroulements, un rail, un boîtier à jauge, une barrette de terre, deux carcasses reliées à elle.
2. **L'éclaté** (`VIEW.exploded`, `explode` 1) : tout dans un cadre vertical, rien derrière l'en-tête (y < 410), le transformateur au centre.
3. Les deux enroulements de près (`VIEW.xfo`, `explode` 1) : `apart` 0 puis 1 — « ils ne se touchent pas » se lit d'une image à l'autre ; puis `litPrim` 1 seul, `litSec` 1 seul.
4. « Aucun fil n'est relié à la terre » (`VIEW.whole` ou un cadre à toi, `litSec` 1, `litEarth` 1) : les deux conducteurs et la barrette, séparés ; les conducteurs de protection des carcasses, eux, posés sur la barrette.
5. **Le chemin du défaut** (`VIEW.path`, `fault` 1, `leak` 1) : `home` 1 `ddr` 1 (la boucle entière, le fantôme allumé) puis `home` 0 (le filet par les trois marques) — même cadre, la différence se lit en une demi-seconde.
6. Le CPI de près (`VIEW.cpi`) : `ins` 1 `alarm` 0, puis `ins` 0 `alarm` 1 — lisible à 270 px de large ; deux images à 1/30 s : les impulsions ne sautent pas.
7. Le double défaut (`VIEW.whole` resserré sur le rail et les carcasses : `fault` 1, `fault2` 1, `double` 1, puis `trip` 1) : la boucle, puis les manettes en bas et le circuit éteint.
8. Dans l'armoire (`VIEW.system`, `bench` 0, avec le bloc de `bloc.js`) : le système reste l'élément le plus lisible derrière le verre du mur ; et la couverture (`cover` d'`episode.json`, instant `eclate$` : éclaté, `litSec` 1, `cpi` 1, `el` 28) — tout éclairé, quelque chose luit, la vue éclatée sous la ligne « Système Décodé » (y ≈ 960 sur la couverture).

---

## `src/bloc.js` — le bloc opératoire aux rayons X

**À lire pour l'idiome** : `episodes/006-defibrillateur/src/hall.js` (un lieu aux rayons X, des figures de verre, un personnage couché), `episodes/016-disjoncteur/src/wall.js` (un mur de verre, ce qui court dedans, des courants en tirets, `dark`), `episodes/021-veille-tgv/src/train.js` (une cabine éclairée, l'ordre des coques), `kit/lib/figure.js` (toi couché ; le chirurgien debout, ses mains : `hands: "flat"` ou `"real"`), `kit/lib/atmo.js` (`makeSurface`, `makePool`), `kit/lib/build3d.js` (`glass`, `asShell`, `edgesOf`, `fatLine`).

**Ce qu'il construit** (`plan.js` : `ROOM`, `TABLE`, `YOU`, `LAMP`, `RESP`, `SURGEON`, `DEVICE`, `FAULT`, `SOCKETS`, `REPEATER`, `CABINET`, `MOUNT`, `CONDUIT`) — en verre et en traits fins, pleins dedans seulement ce qui compte :

- **La salle** : le mur du fond (verre : la caméra voit l'armoire au travers), les deux murs latéraux et le plafond en traits (leurs arêtes, les panneaux du plafond), pas de mur devant (côté caméra). Le sol : une grille, jamais une dalle (vue d'en haut, une dalle fait une bande grise).
- **La table d'opération** (`TABLE`) : son plateau (plein, gris moyen) et sa colonne ; **toi** (`YOU`), couché sur le dos, un corps de verre (`makeFigure`, couché en déplaçant son groupe, comme au 006), un drap de verre jusqu'à la poitrine, ta poitrine qui se soulève avec le respirateur (`vent`) ; un masque ou une sonde qui rejoint le respirateur.
- **La lampe opératoire** (`LAMP`) : son bras depuis le plafond, sa tête **pleine** (un large disque, ses alvéoles en gros), sa face allumée (`lamp`) et la **flaque de lumière** qu'elle pose sur la table et sur toi (`makePool`) — la chose la plus lumineuse du bloc. Éteinte : la face devient un disque sombre, la flaque disparaît.
- **Le respirateur** (`RESP`) : un chariot de verre ; dedans, **son soufflet plein dans une colonne de verre**, qui monte et descend (`vent` : l'amplitude ; un cycle lent, ≈ 4 s, jamais un saut) ; son écran (une lueur encre, qui suit `dark`).
- **Le chirurgien** (`SURGEON`) : debout de l'autre côté (−z), face à la caméra, un corps de verre plus pâle que toi (calot, masque en volumes simples), ses mains au-dessus du drap (`work` : des gestes lents, petits).
- **L'appareil en défaut** (`DEVICE`, `FAULT`) : un boîtier sur un chariot, au-delà de tes pieds — **sa carcasse de tôle** (verre aux rayons X, arêtes nettes, quelques vis), et dedans **un fil** sombre dont la gaine est usée à `FAULT`, sur la face intérieure tournée vers +z ; `fault` le fait se courber et toucher la tôle : une lumière qui a un endroit (cœur blanc-signal, longue traîne), qui gonfle deux images et reste petite. Son conducteur de protection (encre) part avec le cordon. Son cordon rejoint la prise du mur du fond. On ne le nomme pas : « un appareil ».
- **Les prises IT** (`SOCKETS`) sur le mur du fond ; **le report d'alarme** (`REPEATER`) : un petit boîtier mural, son voyant et sa grille de buzzer (aucun texte) ; `alarm` : le voyant s'allume veille et deux ou trois anneaux lents partent de lui (comme la radio du 021), jamais un clignotement.
- **L'armoire IT** (`CABINET`), derrière le mur du fond, dans le local technique : une armoire de verre, son étagère ; `mount` (la place du système) est à `MOUNT`. `cabinet` : ses arêtes luisent veille à travers le mur (« exprès » ; dans le noir de l'« et si », la seule lumière qui reste).
- **Le circuit IT dans les murs** (`CONDUIT`) : de la sortie du système (`MOUNT` + `OUT` de `plan.js`) le long du mur du fond, à `run` de hauteur, puis vers chaque prise, et une ligne vers le pivot de la lampe au plafond : deux conducteurs sombres où des tirets encre courent (`current`). `seek` : une tête veille part de l'armoire, suit le conduit et s'arrête sur la prise de l'appareil (« le défaut sera cherché »).
- `dark` : l'« et si » — la lumière générale du bloc (plafond, écrans, tirets des conduits) s'éteint ; la lampe et le respirateur ont leurs nombres (`lamp`, `vent`). L'armoire (`cabinet`) n'en dépend pas.

**API à rendre** (exactement) : `export function buildBloc()` → `{ group, mount, A, update(P, time, px) }`.

- `group` (tout le décor), `mount` (la place du système dans l'armoire : le monde y accroche `system.root`).
- `A` : `table`, `you` (ta tête), `chest`, `lamp` (la face), `resp` (le soufflet), `surgeon` (sa tête), `hands`, `device` (le dessus de l'appareil), `fault`, `socket` (la prise de l'appareil), `repeater`, `cabinet`.
- `update(P, time, px)`, `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `shell` | le verre de la salle : murs, plafond, armoire, figures (0–1) |
| `lamp` | la lampe allumée : sa face, sa flaque sur la table (0 éteinte → 1) |
| `vent` | le respirateur tourne : le soufflet monte et descend, ta poitrine avec lui (0 arrêté, immobile → 1) ; à 0, le soufflet s'arrête où il est, sans sauter |
| `work` | les mains du chirurgien au travail (0 immobiles → 1) |
| `dark` | l'« et si » : la lumière générale, les écrans, les tirets des conduits s'éteignent (0 → 1) |
| `current` | les tirets encre du circuit IT dans les murs (0–1) |
| `seek` | la tête veille qui cherche le défaut : 0 à l'armoire → 1 arrivée sur la prise de l'appareil (invisible à 0 et à 1) |
| `cabinet` | l'armoire luit veille à travers le mur (0–1) |
| `fault` | le fil touche la carcasse de l'appareil (0–1, signal) |
| `alarm` | le report d'alarme : voyant et anneaux veille (0–1) |
| `mood` | l'ambiance (0 veille, 1 signal) : seulement pour une teinte franche ; rien à mi-chemin |

**Images à réussir** (8, liste fermée) :

1. **La première image** et ses trois rivales (`docs/024-actes.md`, « Les quatre candidates » : a, b, c, d — poses prêtes) : toi endormi sous la lampe, le respirateur qui respire, le chirurgien en face, et l'appareil au-delà de tes pieds, son fil à un souffle de la tôle. Elle arrête le pouce sans texte ; la lampe tient SOUS l'en-tête (y > 410). Rends les quatre sur une planche, avec leurs poses.
2. L'appareil de près (`VIEW.device`) : `fault` 0 puis 1 — le fil, la tôle, la lumière qui a un endroit ; la carcasse se lit comme du métal (arêtes), pas comme un cube de verre vide.
3. Le bloc en large (`VIEW.room`) : tout se lit, l'appareil et son point de défaut minuscule au loin, l'armoire derrière le mur ; puis `dark` 1, `lamp` 0, `vent` 0, `cabinet` 1 : le noir, et la seule armoire veille.
4. Le soufflet (`VIEW.resp`) : deux images à 2 s d'écart (il a bougé), puis `vent` 0 ; ta tête au bord du cadre, jamais en très gros plan.
5. La lampe (`VIEW.lamp`) : `lamp` 1 puis 0 — la flaque sur toi, puis plus rien.
6. Le chirurgien (`VIEW.surgeon`) : ses mains au-dessus du drap (`work` 1) ; puis dans le noir (`dark` 1, `lamp` 0) — sa silhouette de verre se devine.
7. Le mur du fond (`VIEW.repeater`, `alarm` 1 : le voyant, les anneaux) et (`VIEW.walls`, `current` 1, `seek` 0,5 : la tête veille à mi-chemin dans le conduit).
8. L'armoire vue de la salle à travers le mur (`VIEW.system`, `cabinet` 0 puis 1) : le système dedans, lisible ; et le bloc de loin (`VIEW.far`) : une maquette dans la nuit, la lampe son point le plus clair.

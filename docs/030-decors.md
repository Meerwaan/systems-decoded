# 030 · Prise de terre — les décors

Deux fichiers, un agent chacun, en parallèle : `episodes/030-prise-de-terre/src/model.js` (le système : la chaîne de terre) et `src/buanderie.js` (la buanderie aux rayons X, et les fondations sous elle). Tous deux existent en **bouchon** (volumes gris à la bonne place) : le film se construit, on remplace le fichier **en entier** en gardant exactement ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import ; deux implantations du système : `PLACE` et `BENCH`) et `src/world.js` (`FIRST`, `VIEW`, `BENCHED` / `STAGED`, `apply`). Recette commune : `docs/recette-agents.md`. Le plan de mise en scène : `docs/030-actes.md` (lis au moins son haut et les lignes qui te concernent). Faits : `docs/faits/030-prise-de-terre.md` (§ 3, 4, 10, 11) et `030-contre-verification.md`.

**Aucun décor d'un autre dossier n'est importé** (lu, pas importé : voir `docs/journal/030-architecte.md`, « Décisions ») : la pièce du 016 est un salon (bouilloire, radiateur, multiprise, toi debout : rien de tout ça ne s'éteint ni ne disparaît par un nombre) et son différentiel ne fait que s'allumer ; le kit du 008 est un paratonnerre (un piquet, pas une boucle à fond de fouille) ; la maison du 008 porte un paratonnerre. Pour l'idiome, on lit : `episodes/016-disjoncteur/src/wall.js` (un mur de verre, ce qui court dedans, un tableau, toi de verre), `episodes/008-paratonnerre/src/model.js` (`testJoint()` : la barrette de mesure et sa barre amovible ; le fil de cuivre « gris clair : le cuivre n'est aucune de nos trois couleurs » ; `climb` / `flow` : une tête de lumière qui avance), `episodes/024-bloc-operatoire/src/model.js` (des courants en tirets, des pièces `lit…`, `update` sans allocation), `kit/lib/figure.js`.

**L'exactitude, à l'image** (dossier pour les électriciens : ils relèveront tout) :

- **Ce qui est sous tension, c'est le métal** : la carcasse (tôle) et le capot. **Le hublot est en verre et en plastique, jamais sous tension** — jamais signal, jamais l'endroit que tu touches.
- **Sans terre** (`chain` 0) : la carcasse reste sous tension et **aucun courant ne circule** — rien ne coupe, aucune tête ne court tant que personne ne touche. Quand tu touches, ton corps devient le chemin (`body`) et le différentiel 30 mA coupe — **après** toi.
- **Avec la terre** (`chain` 1) : le courant de défaut part par le conducteur de protection, la borne principale de terre, le conducteur de terre, la barrette de mesure, la boucle, puis **dans le sol** (des anneaux qui s'éloignent : il rejoint le poste par le sol, il ne « disparaît » pas). Le différentiel voit la différence et coupe — **avant** ta main.
- **La boucle est AUTOUR des fondations** (à fond de fouille, au pied de la semelle, le long des murs), jamais « sous » elles.
- Vocabulaire (pour les étiquettes, les journaux, les noms de pièces) : masse / carcasse, vis de masse, cosse, **conducteur de protection** (vert-jaune : celui de la machine, celui du circuit), fiche, socle de prise, **broche de terre** (portée par le socle), tableau, **différentiel 30 mA**, **borne principale de terre**, **conducteur de terre** (de la borne à la prise de terre ; cuivre nu), **barrette de mesure**, **prise de terre** (la boucle de cuivre nu). Jamais « conducteur de terre » pour le vert-jaune.
- **Aucune valeur à l'écran** : ni Ω, ni mA, ni mm², ni seconde ; aucun texte sur les pièces (pas de « 30 mA » gravé). Le seul chiffre est celui de la voix, dans l'en-tête (`main.js`).

**Les repères.** La buanderie : sol y = 0 (carrelage mouillé : une grille, jamais une dalle) ; le **mur du fond** est le plan z = 0, la pièce côté +z (comme au 016) ; la machine contre le mur du fond, son hublot vers +z ; **toi à sa droite (+x)**, de face vers −x ; la prise basse sur le mur à sa gauche, le tableau en haut, plus à gauche ; sous le sol, la dalle, la terre, la semelle sous le mur du fond (z ≈ −6) et sous le mur de gauche (x = −280), la boucle au fond de la fouille (y = −84). Azimut (vérifié dans `kit/lib/stage.js` : caméra = cible + d·(sin az·cos el, sin el, cos az·cos el)) : **`az` 0 se tient sur +z** et regarde le mur du fond de face ; **`az` −90 se tient sur −x** ; +90 sur +x. La lumière clé vient de −x, +y, +z : on filme surtout entre `az` −20 et −60, de l'avant-gauche de la machine (toi à sa droite, la prise et le tableau à sa gauche : rien entre la caméra et la machine).

**Couleurs** : signal = la menace (la carcasse sous tension, le défaut, le courant qui passe par toi) ; veille = le système vivant (le **vert-jaune**, dit par la voix et montré **veille rayé d'encre** — jamais jaune ; la chaîne qui arrive à la terre ; le courant de défaut qui la prend ; le différentiel qui voit et coupe) ; ink = le reste (le cuivre nu est un **gris clair**, comme le fil du 008).

---

## `src/model.js` — la chaîne de terre (le système)

**Ce qu'il construit** : la chaîne, pièce par pièce, en tailles illustratives (rien ne s'affiche), **pleine** (trois valeurs de gris, arêtes fines, `metal` ≤ 0,5), et **posée deux fois** :

- **en place** (`bench` 0, `PLACE` de `plan.js`, dans le repère de la buanderie : `world.js` accroche `root` à `laundry.mount`, l'origine de la buanderie) — les vraies longueurs : du fond de la machine, le long du cordon, jusqu'à la prise ; dans le mur, jusqu'au tableau ; du tableau, dans le mur, à travers la dalle, jusqu'à la boucle au fond de la fouille, qui fait le tour de la maison (le long du mur du fond, l'angle, le long du mur de gauche — prolongée au-delà de la pièce, au moins 5 m de chaque côté) ;
- **sur l'établi** (`bench` 1, `BENCH`, `root` sur l'origine de l'établi) — **une seule colonne**, lue de haut en bas comme descend le courant de défaut : un **bout de carcasse** (tôle blanche émaillée, son coin, debout) avec sa vis de masse et sa cosse ; le cordon ; la fiche et la prise (sur un bout de mur : une plaque) ; un bout de tableau (rail, différentiel, borne principale) ; la barrette de mesure ; le conducteur de terre ; un tour de boucle de cuivre nu couché autour d'un bout de semelle (verre).

Les **pièces** sont les mêmes objets dans les deux implantations (placées à chaque image d'après `PLACE` ou `BENCH`) ; les **conducteurs** ont une géométrie par implantation. Les raccords des coupes se font sur ces pièces : à « on l'ouvre », la cosse (`PLACE.cosse` → `BENCH.cosse`) ; à « Autour des fondations », la boucle (`BENCH.join` → `PLACE.join`).

- **La vis de masse et la cosse** : sur la face intérieure du panneau arrière de la carcasse, en haut à gauche (`PLACE.cosse`, face vers +z : vue par-dessus le tambour à travers le verre de la carcasse). Une vis, une rondelle éventail, une cosse à œillet sertie sur le vert-jaune. La pièce la plus claire du système (la pièce-héros de l'éclaté).
- **Le conducteur de protection** (`pe`) : un fil isolé **vert-jaune → veille rayé d'encre** (des bandes en biais larges, jamais fines : pas de motif qui scintille ; `pe` 0 : gris sombre rayé d'encre pâle, toujours lisible comme un fil rayé). Il descend le panneau arrière, entre dans le cordon (une gaine sombre, trois conducteurs dedans, le vert-jaune visible à ses deux bouts), court au sol derrière la machine jusqu'à la fiche.
- **La fiche et la prise** : la fiche (2P+T, corps sombre, deux broches rondes, l'**alvéole de terre** qui reçoit la broche du socle) ; le **socle de prise** (clair) avec ses deux alvéoles et sa **broche de terre** en haut (`pin`). `pin` 0 : un vieux socle à deux trous, sans broche et sans borne de terre derrière lui. `plug` : la fiche s'emboîte (0 sortie de quelques cm, 1 enfoncée) — le geste de l'éclaté, sur « par la broche de ta prise » : la broche entre dans l'alvéole.
- **Dans le mur** (en place, `chain` 1) : le vert-jaune du circuit monte de la prise, court dans le mur (`PLACE.wall`) et rejoint le tableau. (La phase et le neutre du circuit, dans le mur, sont à `buanderie.js`.)
- **Le tableau** : un bout de rail, le **différentiel 30 mA** (deux modules, manette, bouton test, **aucun texte**), la phase et le neutre qui le traversent (deux courts bouts sombres : c'est leur écart qu'il mesure), et sous lui la **borne principale de terre** (une barre de cuivre — gris clair — à vis, où les vert-jaune se posent). Le tableau est **toujours là** (même sans terre : `chain` 0 ne retire que ce qui est au-delà de la prise). `ddr` : le différentiel s'allume veille (« il voit ») ; `trip` : sa manette tombe.
- **Le conducteur de terre** (cuivre nu, gris clair) : de la borne, dans le mur, par la **barrette de mesure** (deux bornes et une barre qu'on peut ôter : l'idiome de `testJoint()` du 008), à travers la dalle, le long de la semelle, jusqu'à la boucle (`PLACE.terre`, `PLACE.barrette`, `PLACE.join`).
- **La prise de terre** : la **boucle de cuivre nu** au fond de la fouille, autour des fondations (`LOOP` de `plan.js`). Pleine, gris clair, posée au pied de la semelle (les fondations en verre sont à `buanderie.js`). Sur l'établi : un tour de boucle autour d'un bout de semelle de verre.
- **`chain`** — la chaîne entière au-delà de la fiche : **en place**, elle **pousse** de la prise vers la terre (0 absente → 1 complète : le vert-jaune du mur, puis la borne, le conducteur de terre, la boucle, dessinés à mesure, comme un fil qu'on tire) et se retire dans l'autre sens ; **sur l'établi**, ce qui est au-delà de la prise passe en **fantôme** (verre encre, pâle) à 0 — « ce qui manque » se voit, la colonne reste lisible.
- **Les courants — des têtes de lumière qui avancent, des traînées, jamais un fil qui s'allume d'un coup, jamais des points** ; tirets clairs sur conducteur sombre (`mat.worldUnits = true`, en centimètres) ; **un tiret avance d'au plus 1/7 de sa période par image** (le piège du 004 : à une demi-période ils sautent, `qa` compte une rafale d'images parasites) :
  - `run` : une tête veille part de la cosse et suit la chaîne jusqu'à la boucle (0 → 1), allumant ce qu'elle a passé — la voix qui nomme les pièces l'une après l'autre. **Avec `chain` 0, elle s'arrête sur la fiche** et s'y éteint : « ce fil… n'arrive nulle part ».
  - `leak` : **le courant de défaut par la terre** — des têtes veille, franches, de la cosse le long du vert-jaune, par la prise, le mur, la borne, le conducteur de terre, la barrette, jusqu'à la boucle, puis **des anneaux qui s'éloignent dans le sol** (en place : dans la terre, autour de la boucle, sous `under` ; sur l'établi : sur la grille de l'établi). Seulement là où la chaîne est entière.
- **Le défaut sur l'établi** : `live` et `fault` arrivent aussi au modèle — sur le bout de carcasse, `fault` met au coin de la tôle une petite lumière signal (le fil de phase qui la touche : un bout de fil sombre, comme dans la machine), `live` teinte la tôle (arêtes signal). En place, `live` et `fault` sont à `buanderie.js` (le modèle les ignore).

**API à rendre** (exactement) : `export function buildModel()` → `{ root, parts, A, update(P, time, px) }`.

- `root` : un `THREE.Group`, re-parenté entre `laundry.mount` (en place) et l'établi.
- `parts` : `{ stub, cosse, pe, plug, socket, tableau, borne, barrette, terre, loop }` — chacune avec SES matières (`setPartOpacity`).
- `A` (ancres, `Object3D`, qui suivent l'implantation) : `stub`, `cosse`, `pe` (le milieu du vert-jaune dans le cordon), `plug`, `socket`, `pin`, `diff` (la manette), `borne`, `barrette`, `terre` (le milieu du conducteur de terre), `loop` (la jonction avec la boucle), `centre`.
- `update(P, time, px)` — seize fois par image, aucune allocation. `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `bench` | 1 sur l'établi (`BENCH`, la colonne, le bout de carcasse, les fantômes), 0 en place (`PLACE`) |
| `explode` | sur l'établi : 0 la chaîne ramassée sous le bout de carcasse → 1 **dépliée en UNE colonne** vue de `VIEW.exploded` — elle se déroule vers le bas, pièce après pièce (délais : la cosse, le cordon, la fiche et la prise, le tableau, la barrette, la boucle) ; rien derrière l'en-tête (y < 410) |
| `chain` | la chaîne au-delà de la fiche : en place, elle pousse (0 absente → 1 entière) ; sur l'établi, 0 = fantôme |
| `pin` | la broche de terre du socle (1 là → 0 un socle à deux trous) |
| `plug` | la fiche dans la prise (0 sortie → 1 enfoncée) |
| `pe` | le vert-jaune allumé veille rayé d'encre (0 sombre → 1 vif) |
| `run` | la tête veille qui parcourt la chaîne (0 la cosse → 1 la boucle ; arrêtée à la fiche si `chain` < 0,5) |
| `leak` | le courant de défaut par la terre, jusqu'aux anneaux dans le sol (0–1) |
| `ddr` | le différentiel s'allume veille (0–1) |
| `trip` | sa manette tombe (0 fermé → 1 déclenché) |
| `live`, `fault` | sur l'établi seulement : la tôle teintée signal, la lumière du défaut à son coin |
| `under` | en place : les anneaux du sol ne se voient que si les fondations sont montrées (`under` > 0) |
| `litCosse`, `litPe`, `litPrise`, `litBorne`, `litTerre`, `litBoucle` | la pièce que la voix nomme luit faiblement veille (`litTerre` : la barrette et le conducteur de terre) |

**Images à réussir** (8, liste fermée — poses de départ dans `world.js` → `VIEW`, réglées sur bouchons) :

1. La chaîne entière sur l'établi (`VIEW.whole`, `explode` 1, `pe` 0,35) : on comprend sans légende — un bout de carcasse, un fil rayé, une fiche dans une prise, un différentiel et une barre, une barrette, un conducteur, une boucle.
2. **L'éclaté** (`VIEW.exploded`, `explode` 0 puis 0,5 puis 1) : la colonne se déroule vers le bas ; tout tient dans un cadre vertical, rien derrière l'en-tête.
3. La cosse de près (`VIEW.bStub`, `litCosse` 1, `fault` 1, `live` 1) : la vis, la cosse, le vert-jaune qui en part ; la lumière du défaut au coin de la tôle.
4. La fiche et la prise (`VIEW.bPlug`) : `plug` 0 puis 1 (la broche entre dans l'alvéole) ; puis `pin` 0 (un socle à deux trous) — lisible à 270 px.
5. Le tableau (`VIEW.bTab`) : `ddr` 0 puis 1, `trip` 0 puis 1 — la manette tombe, on le voit à 270 px.
6. `run` 0,3, 0,6, 1 (`VIEW.exploded`) : la tête descend la colonne ; puis `chain` 0, `run` 1 : elle s'arrête sur la fiche, ce qui est au-delà en fantôme.
7. **En place**, avec le vrai décor (`VIEW.wall`, puis `VIEW.under` avec `under` 1) : `chain` 0, 0,5, 1 (la chaîne pousse de la prise vers la boucle) ; puis `leak` 1 : les têtes descendent, les anneaux s'éloignent dans le sol ; deux images à 1/30 s d'écart : les tirets ne sautent pas.
8. La couverture (`cover` d'`episode.json`, instant `eclate$` : éclaté, `run` 1, `pe` 1, `el` 28, `shift` −520) : tout éclairé, quelque chose luit, la colonne sous la ligne « Système Décodé » (y ≈ 960 sur la couverture).

---

## `src/buanderie.js` — la buanderie aux rayons X

**Ce qu'il construit** (`plan.js` : `ROOM`, `MACHINE`, `HUBLOT`, `DRUM`, `CAPOT`, `FAULT`, `PHASE`, `CORD_IN`, `SOCKET`, `TABLEAU`, `YOU`, `PUDDLE`, `CONDUIT`, `FOUND`, `LOOP`) — en verre et en traits fins, pleins dedans seulement ce qui compte :

- **La pièce** : le mur du fond (verre épais, ses arêtes : la caméra voit au travers le circuit dans le mur), le mur de gauche, le plafond en traits ; pas de mur devant. Le **sol** : un carrelage **mouillé** — une grille (les joints), jamais une dalle ; la **flaque** (`PUDDLE`) sous l'avant de la machine et sous tes pieds : elle brille et **frémit avec l'essorage** (des rides lentes, concentriques), des gouttes qui sautillent au pied de la machine. Attention : sur les bouchons, la flaque reflète la boîte à lumière en dalle blanche — une flaque se lit par un reflet **qui a un endroit** (une traînée, le pied de la machine qui s'y mire), pas par un miroir.
- **La machine à laver** (`MACHINE`) — le sujet de la première image : sa **carcasse** de tôle (verre aux rayons X, arêtes nettes, quelques vis, les pieds réglables), son **capot** (le dessus, métal : plein ou verre aux arêtes vives), son bandeau de commande (un hublot de lumière encre, le programme « essorage » sans texte), son **hublot** (verre et plastique, **jamais signal**), et derrière lui **le tambour** (`DRUM`, plein, inox : une couronne, ses aubes ; ses trous fondus sous le pixel — rien de fin qui tourne vite) avec **du linge** dedans (une masse de tissu qui tourne : c'est elle qui dit l'essorage). `spin` : le tambour tourne (stylisé, ≈ 2 à 3 tours par seconde, le flou de l'obturateur fait le reste) et la machine **tremble** — **un tremblement prend la fréquence de la cadence** (30 battements par seconde pour 30 images : un flou stable) **posé sur une houle lente** (le 014 : à 12 Hz, 50 images parasites).
- **Le fil de phase et le défaut** (`PHASE`, `FAULT`) : dans la machine, un fil sombre monte le long du panneau gauche ; à `FAULT` sa gaine est usée et il **touche la tôle** — une lumière qui a un endroit (cœur blanc-signal, longue traîne), qui gonfle deux images et reste petite (`fault`).
- **`live` — la carcasse sous tension** : tout le métal (carcasse, capot ; pas le hublot) passe au signal **depuis `FAULT`, comme une onde qui s'étend** (0 → 1 : le front part du défaut et gagne toute la tôle) ; tenu, il respire à peine (jamais un clignotement). Dosé : la carcasse reste lisible, arêtes signal, pas un bloc qui bave.
- **Le cordon** sort de la machine en `CORD_IN` (son tracé jusqu'à la fiche est au modèle : `PLACE.pe`) ; **la phase et le neutre dans le mur** (`CONDUIT`) : du tableau, en haut, au-dessus du sol, jusqu'à la prise — deux conducteurs sombres, encre, aucun nombre.
- **Le tableau** (`TABLEAU`) : son coffret de verre sur le mur du fond, sa porte ouverte ou absente ; dedans, le rail et ce qui y est posé sont au modèle (`PLACE.diff`, `PLACE.borne`).
- **Toi** (`YOU`) : debout à droite de la machine, **pieds nus** sur le carrelage mouillé, un corps de verre (`makeFigure({ shell: true, hands: "real" })`) ; ta main droite (`reach` : de ton côté → au-dessus du capot, à 3 cm) se pose sur le capot (`touch` : la paume à plat sur `CAPOT.touch`). Toi de près : jamais en très gros plan, jamais la main seule (le plan `VIEW.reach` prend l'épaule).
- **`body` — le courant par toi** : de 0 à 0,3, le **chemin qu'il prendrait** se dessine en pointillé signal pâle (de ta main par ton bras, ton tronc, tes jambes, jusqu'à tes pieds : « il attend que le courant passe par toi ») ; de 0,3 à 1, **des têtes signal y courent** et **des anneaux partent de tes pieds dans la flaque**. Le corps reste de verre, les têtes passent dedans, aucune blessure.
- **Sous le sol** (`FOUND`, `LOOP`, `under`) : la dalle (verre), la terre (quelques strates et grains encre, très pâles), la **semelle** sous le mur du fond et sous le mur de gauche (verre, arêtes), la **fouille** à son pied où le modèle pose la boucle de cuivre. Prolongés au-delà de la pièce (la boucle fait le tour de la maison : on doit voir l'angle et les deux murs filer). `under` 0 : rien sous la grille du sol (la caméra au ras du sol ne doit rien voir à travers) ; 1 : la coupe.
- La vie du lieu (étagère, lessive, panier, la lumière du plafond, ce qu'on voit par une fenêtre) est au **décorateur** (`docs/recette-decorateur.md`, après toi) : garde-lui des places, ne la pose pas.

**API à rendre** (exactement) : `export function buildBuanderie()` → `{ group, mount, A, update(P, time, px) }`.

- `group` (tout le décor), `mount` (l'origine de la buanderie : le monde y accroche `system.root`, `PLACE` est dans ce repère).
- `A` : `machine` (le dessus), `capot` (le point où se pose ta main), `hublot`, `fault`, `drum`, `you` (ta tête), `hand` (ta main, qui la suit), `feet`, `socket`, `tableau`, `under` (l'angle de la boucle), `floor` (la flaque).
- `update(P, time, px)`, `P` :

| nombre | ce que tu en fais |
| --- | --- |
| `shell` | le verre de la pièce : murs, coffret, carcasse, toi (0–1) |
| `spin` | l'essorage : le tambour et le linge tournent, la machine tremble, la flaque frémit (0 immobile → 1) ; à 0 le tambour s'arrête où il est, sans sauter (décélération : c'est l'acte qui fait descendre `spin`) |
| `live` | la carcasse et le capot sous tension, signal, en onde depuis `FAULT` (0–1) |
| `fault` | le fil de phase touche la tôle à `FAULT` (0–1) |
| `reach` | ta main : de ton côté (0) → au-dessus du capot (1) |
| `touch` | ta main se pose sur le capot (0–1) |
| `body` | le courant par toi : 0–0,3 le chemin en pointillé, 0,3–1 les têtes et les anneaux dans la flaque |
| `under` | la coupe sous le sol (0 rien → 1) |
| `chain`, `trip` | lus si utile : `trip` 1 éteint le bandeau de la machine (le circuit est coupé) ; `chain` rien chez toi |
| `mood` | l'ambiance (0 veille, 1 signal) : seulement pour une teinte franche |

**Images à réussir** (8, liste fermée) :

1. **La première image et ses trois rivales** (ci-dessous) sur une planche, avec l'en-tête : rends-les avec leurs poses ; propose une cinquième si tu en trouves une meilleure.
2. La machine entière (`VIEW.machine`) : `live` 0 puis 0,5 puis 1 — l'onde part du défaut ; la carcasse se lit comme du métal, le hublot reste encre.
3. Le défaut de près (`VIEW.fault`) : `fault` 0 puis 1 — le fil, la tôle, la lumière qui a un endroit.
4. Toi entier (`VIEW.you`) : `reach` 0, 1, puis `touch` 1 ; `body` 0,2 (le pointillé) puis 1 (les têtes, les anneaux dans la flaque).
5. Tes pieds (`VIEW.feet`, `spin` 1) : deux images à 1/30 s d'écart — la flaque frémit, rien ne saute.
6. Le geste (`VIEW.reach`) : la main au-dessus du capot, l'épaule dans le cadre, lisible à 270 px.
7. Le mur (`VIEW.wall`) et le tableau (`VIEW.tableau`) : le coffret de verre, le circuit dans le mur ; avec le modèle (`chain` 1, `ddr` 1).
8. Sous le sol (`VIEW.under`, `under` 1, `chain` 1) : la semelle de verre, la boucle au fond de la fouille qui fait l'angle et file le long des deux murs ; puis `VIEW.section` (`under` 1) : toute la chaîne en coupe, de la machine à la boucle, et `VIEW.far` : la buanderie de loin, une maquette dans la nuit.

### La première image — les quatre candidates

**Ce qu'elle doit dire sans le son** : une machine à laver qui tourne, et qui est sous tension (le danger EST la machine) ; quelqu'un pieds nus dans l'eau, tout près. Essayées sur bouchons (`--cols 4`, avec l'en-tête), notées sur les six points de `docs/recette-agents.md` (« La première image ») : 1 un événement en cours · 2 une perspective basse · 3 la menace derrière le sujet · 4 une forme reconnue en un tiers de seconde, vue d'où on ne la voit jamais, sur 40 % de la largeur · 5 le système déjà là, petit mais lisible · 6 elle bouge dès l'image 1 par son sujet.

- **(a) au ras du sol mouillé** — `POSE0` provisoire : `{ tx: 14, ty: 40, tz: 50, d: 280, az: -28, el: 2, fov: 46, shift: 80 }`, `reach` 0,3. De l'avant-gauche, l'objectif à 45 cm du carrelage : la machine en essorage (≈ 55 % de la largeur), sa carcasse signal, le tambour et le linge derrière le hublot ; à droite tes jambes et tes pieds nus dans la flaque, ta main qui entre en haut ; à gauche, au ras du sol, le cordon et son vert-jaune veille pâle qui file vers la prise. **1 ✓** (l'essorage, la machine qui tremble, l'eau qui frémit) · **2 ✓** (le carrelage file vers la machine) · **3 ½** (la menace EST le sujet ; ta main et tes jambes s'y découpent si elles passent devant la tôle) · **4 ✓** (une machine à laver vue du sol) · **5 ✓** (le vert-jaune) · **6 ✓** (le tambour, le tremblement, les gouttes). **5,5 / 6** — risques : la flaque en miroir (dalle blanche sur les bouchons) ; ta main coupée par l'en-tête (la faire entrer sous y 410).
- **(b) par-dessus ton épaule** — `{ tx: 0, ty: 70, tz: 40, d: 250, az: 64, el: 8, fov: 42, shift: 40 }`, `reach` 0,6. Derrière toi, côté +x : ta silhouette de verre découpée sur la carcasse signal, ta main vers le capot. **1 ✓ · 2 ✗** (hauteur d'homme) **· 3 ✓✓ · 4 ✓ · 5 ✗** (le cordon est derrière la machine) **· 6 ½** (le tambour tourne, mais toi, immobile, prends 40 % de l'image). **3,5 / 6** — et un mannequin de verre en grand au premier plan, à contre-jour.
- **(c) le hublot** — `{ tx: 0, ty: 52, tz: 62, d: 170, az: -14, el: 1, fov: 42, shift: 40 }`. De face, au ras : la porte, le linge qui tourne, la carcasse signal autour. **1 ✓ · 2 ✗** (frontal) **· 3 ✗ · 4 ✓✓ · 5 ½ · 6 ✓**. **3,5 / 6** — et surtout : le hublot en grand au mot « sous tension » laisse croire que c'est lui qui est sous tension (l'erreur que la contre-vérification a retirée du script). **Sort.**
- **(d) au pied, de côté** — `{ tx: 30, ty: 20, tz: 56, d: 210, az: -62, el: 1, fov: 52, shift: 180 }`, `reach` 0,3. Au ras du carrelage, de côté : le pied de la machine qui sautille dans l'eau, tes pieds nus au premier plan, la carcasse au-dessus. **1 ✓ · 2 ✓✓ · 3 ✓ · 4 ✗** (une machine vue de son pied ne se reconnaît pas en un tiers de seconde) **· 5 ✗ · 6 ✓**. **3,5 / 6**.

**(a) est en tête** ; ce qui la ferait passer à 6 / 6 : tes jambes et ta main **devant** la tôle signal (la caméra un peu plus à droite, `az` −20, ou toi d'un pas vers la caméra). Sur le vrai décor, tire les quatre ET une (a′) dans ce sens ; celui qui orchestre choisit et colle `POSE0` dans `world.js`.

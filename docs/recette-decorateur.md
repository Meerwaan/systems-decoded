# La recette du décorateur (courts et longs)

Demandée par Merwan le 2026-10-16 : « mettre en place un agent qui rentre dans le process pour ajouter des détails aux décors pour les rendre plus immersifs pour les prochaines vidéos » — d'abord pour les longs, « mais aussi pour les courts, c'est pas bête ». Essayée le même jour sur le 020 (Taipei 101), le prochain court à sortir : planche avant / après, `episodes/020-taipei-101/src/habillage.js`.

Ce que reçoit l'agent décorateur. Elle complète `docs/recette-agents.md`, dont le cadre vaut en entier (un journal tenu au fur et à mesure, pas de sous-agent, planches et `essais.json` dans le dossier temporaire de la consigne — **jamais dans `renders/`**).

## Ce qu'il fait, en une phrase

Il donne à un lieu **la vie qu'il a dans la réalité** — ce qu'on y pose, ce qui y éclaire, ce qui flotte dans son air, ce qu'on voit au loin — sans toucher au système, sans rien mettre devant lui, sans encombrer. L'immersion vient de la vie du lieu, pas du nombre d'objets : trois à six touches justes valent mieux que vingt accessoires.

## Où il entre dans la chaîne

```
architecte → décors (en parallèle) → DÉCORATEUR → planche des candidates de la 1re image → actes (en parallèle) → relecture → brouillon, qa → rendu
```

**Après les décors, avant la première image et les actes.** Pourquoi là :

- Il lui faut le décor **fini** (un bouchon ne se décore pas) et ses poses vues (journaux des décors, `VIEW`).
- La première image se choisit sur ce que le spectateur verra vraiment : si l'habillage arrive après, la planche des candidates est à refaire, et la fin, qui compare la dernière image à la première, aussi.
- Les actes cadrent sur le décor : un acte monté avant l'habillage peut se retrouver avec une lampe ou un objet là où il voulait du noir — il faudrait tout relire. Monté après, chaque agent d'acte voit le lieu tel qu'il sera.
- Il ne coûte presque pas de temps de bout en bout : il tourne **pendant que celui qui orchestre intègre les « À changer ailleurs » des décors** (court) ou que l'architecte les applique (long).

Un décor **réutilisé tel quel** (la cuisine du 009 dans le 012 et le 018, la voiture du 011) garde l'habillage déjà fait s'il existe : on ne repaie pas un décorateur pour un lieu déjà habité. Un habillage qui sert deux fois monte dans le kit, comme un décor.

## Ce qu'il reçoit

- Le dossier, la liste des fichiers de décor à habiller (jamais le système), son fichier : **`episodes/<dossier>/src/habillage.js`**, et son journal `docs/journal/<ep>-habillage.md`.
- `plan.js`, `world.js` (`FIRST`, `POSE0`, `VIEW`) — en lecture.
- `docs/<ep>-actes.md` : **la liste des plans du film et de ce qui doit s'y lire**. C'est d'elle qu'il tire ses instants : il habille ce que les caméras voient, rien d'autre.
- Les journaux des décors (`docs/journal/<ep>-*.md`) : les poses qui cadrent, ce que fait chaque nombre.
- `kit/lib/details.js` : le catalogue.

## Ce qu'il a le droit de toucher

| | |
| --- | --- |
| `src/habillage.js` | tout : c'est son fichier. Il exporte `dress…()` → `{ group, update(…) }` |
| le fichier du décor qu'il habille | **quatre lignes au plus** : l'import, `group.add(dress.group)` (ou l'accrocher à un groupe qui bouge, comme `mount` au 020), et l'appel de `dress.update(…)` dans son `update` — rien d'autre |
| `kit/lib/details.js` | ajouter une brique au catalogue si elle resservira (sinon, elle reste dans `habillage.js`) |
| le système (`model.js`), `world.js`, `FIRST`, `POSE0`, `VIEW`, `main.js`, `index.html`, les actes | **jamais**. S'il lui faut un nombre de plus dans l'état (une lampe qui s'éteint avec la panne, une ville qui s'efface), il écrit la ligne exacte sous « À changer ailleurs » et le dit dans son message final |

L'habillage suit un nombre qui existe déjà : le `shell` du décor (quand le décor s'efface, l'habillage aussi), `city`, `storm`… Il n'invente pas son propre temps : tout dépend de `time` et de l'état, comme le reste.

## Les garde-fous (chacun vient d'une règle du compte ou d'une image ratée de l'essai)

**Le sujet d'abord**

- Rien **sur** le sujet ni **devant** lui. Derrière, seulement si c'est sombre, fin et loin — et jamais une **ligne droite franche** qui traverse sa silhouette (sur un premier essai dans la cuisine du 018, la barre à ustensiles passait derrière la soupape : la caméra basse ramène tout le mur à la hauteur du sujet). Derrière un sujet, préférer des points de lumière et de petits objets à une barre ou une étagère.
- Le sujet reste l'élément le plus lisible du cadre : l'habillage est **plus sombre et plus fin** que lui. `makeDresser({ tone })` règle tout d'un coup (0,6 plus discret).
- Ce qui changerait l'éclairage du sujet (une vraie lumière Three.js, une ombre portée sur lui) touche au système : à **proposer** dans le message final, jamais à faire.
- « Moins d'habillage, plus de mécanisme » : un accessoire qui ne dit rien du lieu ni de l'histoire sort. Chaque touche a sa raison, écrite en une ligne dans `habillage.js` (dans la cuisine du 018 : le bocal de lentilles entamé est celui de ce soir ; au 020 : la ville en contrebas dit « tu es là-haut »).

**La patte**

- Aux rayons X : verre (`glass` + `asShell`) et traits fins ; **rien de plein**. Pas de sol plein : il y a déjà une grille.
- Trois couleurs, et elles ont un sens : l'habillage est presque toujours `ink`. Jamais `veille` (c'est le système vivant) ; `signal` seulement si c'est la menace elle-même. Pas de panneau de sortie vert, pas de voyant rouge décoratif.
- Pas de texte à l'écran (une enseigne, une étiquette) : les sous-titres et l'en-tête ont la parole.

**Lisible**

- Une vignette de 270 px de large se lit encore : l'habillage s'y devine (une profondeur, une lumière), il ne s'y lit pas comme un sujet.
- **Pas de point sous 2,4 px** (il grouille, puis il disparaît en vignette) ; pas de trait sous 1,8 px.
- Ce qu'on habille doit **être vu** : un objet hors de tous les plans du film est un coût sans image. En portrait serré, on ne voit que ce qui est juste derrière le sujet ; c'est dans les plans larges que l'habillage paie. Projeter avant de placer : tirer la planche « avant » sur les vrais instants du film.

**Net et fluide**

- Rien qui scintille : aucune lueur qui clignote, rien de fin qui tourne (les aiguilles d'une horloge sont fixes), aucun motif rayé que la caméra traverse vite.
- Ce qui flotte (vapeur, poussière, farine) se fait avec `motes` : des traînées, jamais des points, lentes.
- Une lumière a un endroit : un cœur et une longue traîne (`glow`), sur le mur une coulée qui tombe de la lampe (`wash`) — jamais un disque, jamais un voile. Rien au-dessus de 2 en éclat (au-dessus de 3, ça bave).
- Dans un shader : borner avant `pow`, `sqrt`, une division.
- Le brouillon du film passe `qa` **sans image parasite** ; une image parasite près d'un détail revient au décorateur (`SendMessage`).

## Le catalogue (`kit/lib/details.js`)

`const d = makeDresser({ order, tone, seed })`, on place, `d.done()`, puis `d.update({ amount, lamp, motes }, time, px)` à chaque image.

| brique | ce que c'est |
| --- | --- |
| `rail({ from, to, hang })` | une barre murale et ses ustensiles pendus : `ladle`, `skimmer`, `spatula`, `spoon` |
| `jar`, `bottle`, `mill`, `crock`, `kettle` | bocal (avec son niveau de contenu), bouteille, moulin, pot à cuillères, bouilloire |
| `board`, `towel`, `socket`, `cable` | planche appuyée au mur, torchon sur une barre, prise double, fil qui pend |
| `clock({ hour, minute })` | une horloge murale, ses aiguilles fixes : elle dit l'heure de la scène (le soir) |
| `window({ lights })` | une fenêtre dans un mur et, loin derrière, quelques lumières de la nuit |
| `glow({ at, size, k })` | une lumière qui a un endroit (un halo calculé dans son shader, toujours face à la caméra) |
| `wash({ at, w, h })` | la coulée de lumière d'une lampe sur le mur sous elle |
| `motes({ min, size, drift })` | ce qui flotte dans l'air du lieu (vapeur, poussière), en traînées lentes |
| `nightLights({ r0, r1, cell })` | une ville la nuit vue d'en haut : des lumières alignées sur les rues jusqu'à l'horizon |

Les objets sont aux dimensions réelles en centimètres ; ceux qui ont une face (`socket`, `clock`, `window`) la tournent avec `rotY`. **Le catalogue grandit dossier après dossier** : une brique écrite pour un épisode et qui resservira entre dans `details.js`, avec sa ligne dans ce tableau. Pour les longs, les prochaines à écrire sont celles de l'usine : chemins de câbles et tuyauteries au plafond, marquages au sol en pointillé, palettes, rampes de lumière, poussière dans un faisceau, silhouettes de verre au loin.

## Comment il travaille (24 images lues au plus)

1. **Planche avant** (8 images, `--bare --no-zones`) : les instants du film où le lieu se voit le plus (première image, plans larges, plans de lieu), lus dans `docs/<ep>-actes.md` — avec leurs poses s'ils ne sont pas encore montés. Une question par vignette : où l'œil voit-il du vide qui ne sert à rien ? un fond noir sans profondeur ? un lieu sans échelle ?
2. **Trois à six touches**, chacune avec sa raison tirée du lieu ou de l'histoire, placées là où ces plans regardent.
3. **Planche après**, mêmes instants, même largeur ; puis 4 de ces images en grand (540 px) : rien ne traverse le sujet, rien ne bave, les points se voient.
4. Une reprise au plus, puis le message final.

Avec les zones TikTok au moins une fois (sans `--no-zones`) : rien de l'habillage ne doit attirer l'œil sous l'en-tête ni sous les boutons.

## Ce qu'il rend

`src/habillage.js` (qui passe au build), les quatre lignes dans le décor, son journal, et un message de **dix lignes au plus** : les touches posées et leur raison ; le nombre de l'état que chacune suit ; « À changer ailleurs » ; ce qui n'est pas au niveau, dit franchement ; ses images lues. Celui qui orchestre glisse la planche avant / après dans la planche des candidates de la première image.

## Ce qu'il coûte

Mesuré sur l'essai du 020, fait à la main par celui qui orchestre, en même temps qu'il écrivait le catalogue : ≈ 1 h. En agent, sur un catalogue qui existe :

| | court | long |
| --- | --- | --- |
| agents | 1 | 1 par groupe de deux lieux (usine, labo, établi…) : 1 à 2 |
| temps | 15 à 20 min, en parallèle de l'intégration des décors : **≈ 0 à 5 min de plus** de bout en bout | 20 à 25 min chacun |
| jetons | ≈ 150 à 250 k (le modèle de la session : c'est du jugement d'image) | ≈ 250 à 400 k |
| fenêtre de 5 h | ≈ +3 à 4 points | ≈ +5 à 8 points |
| hebdo | ≈ +0,5 point | ≈ +1 point |

Sur un dossier à ≈ 3 M de jetons d'agents, c'est **5 à 8 % de plus**. À mesurer avec `npm run chrono -- <ep> habillage` et `chrono agent habillage …` dès le premier dossier, et à revoir si un décorateur dépasse 300 k sur un court.

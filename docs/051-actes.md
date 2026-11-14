# 051 · Le brise-glace — le plan de mise en scène

**La voix est enregistrée** (une prise, **96,9 s**) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues` : 70, vérifiés un par un sur la table) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; les secondes ci-dessous servent à se repérer (`npm run script -- 051`). Cinq fichiers, un agent chacun : `src/acte1.js`, `acte2.js`, `acte2b.js` (le repos, coupé de l'acte 2 pour qu'aucun agent ne porte plus de dix phrases), `acte3.js`, `fin.js` — aujourd'hui des squelettes qui construisent, **à réécrire en entier**. Forme : `episodes/017-irm/src/acte*.js` ; fin : `kit/template/src/fin.js` ; outils : `kit/lib/direct.js`, `kit/lib/blocks.js`. Les poses de `VIEW` sont réglées sur des **bouchons** : pars de celles des journaux des décors (`docs/journal/051-model.md`, `051-glace.md`, `051-banquise.md`). Lis ce haut, puis TA section (`grep -n "^## " docs/051-actes.md`).

## La scène, et ce qu'on a le droit d'affirmer

Antarctique, Noël 2013 : un navire et ses 52 passagers pris dans la banquise (« ton navire », jamais nommé à l'image) ; le brise-glace chinois Xuelong vient, s'arrête à ≈ 11 km, et se fait prendre à son tour, six jours (vent d'est, marée : la glace converge, se tasse, fait des crêtes). **L'acte 3 n'est PAS le Xuelong** : c'est un brise-glace en général, l'Oden suédois (ses citernes, sa gîte complète en 15 s, l'élan) — même modèle 3D, les étiquettes disent lequel (`chip-brise` XUELONG à l'acte 1, `chip-oden` à l'acte 3). **À ne pas dire ni montrer** : un angle de gîte, un débit de pompe, comment le Xuelong s'est libéré, une proue qui grimpe sur la glace plate (elle plie et plonge), un geste d'équipage, une évacuation à l'image. Personne n'est blessé.

## L'en-tête et les deux repères

- **Le chrono** (`main.js`, tu ne l'écris jamais) : « Déc. 2013 » jusqu'à `reponse` ; pendant l'Oden, **T+0 sur « bord » (`rollFrom`) → T+15 s sur « secondes » (`rollTo`)**, tenu ; « Déc. 2013 » à la chute ; « Janv. 2014 » au commentaire ; la boucle reprend la première image. **Second compteur** : « Distance 11 km » (≈ 6 milles, sourcé), fixe — il ne raccourcit plus, c'est l'histoire.
- **Le brise-glace ne bouge jamais, la glace glisse** : `run` (m) avance → la glace part vers l'arrière ; `run` qui baisse → il recule. En marche, `run` avance en ligne droite (`"none"`, ≈ 1 à 2 m par seconde de film) ; une coupe le POSE. Le roulis est `heel` (+ = tribord).
- **`apart`** (la distance des deux navires) : 1 200 dans l'accroche et la boucle (les deux dans un cadre), 11 000 dans la vue du dessus. **Il ne change que sur une coupe**, quand les deux navires ne sont pas dans le cadre d'avant. Les poses près de ton navire sont écrites pour 1 200 ; ailleurs, `shokAt(apart, run)`.
- Repère : bâbord −x, étrave −z ; **az 0 = derrière (+z)**, −90 = flanc bâbord, ±180 = devant l'étrave ; la clé vient de l'arrière-bâbord (az −20 à −70 l'a à l'épaule).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot (les champs `voir` d'`episode.json` disent laquelle). **Chaque coupe est un raccord** (même navire, même étrave, même plaque, ou dans le sens du mouvement), posée quelques images avant sa phrase (les repères `to…` sont à −0,12 s). Rien d'un plan ne déborde sur le suivant.
- Un acte commence par une coupe complète (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) ; l'acte 1 part de `POSE0` / `FIRST` sans coupe ; chacun rend la main à l'instant où le suivant coupe.
- **La part du cadre** que tient le sujet est donnée plan par plan : c'est un plancher. Le sujet entre y 440 et 1160 (plutôt à gauche du centre sous 880) ; zone haute 436–790 : une étiquette à la fois ; rien sous 1600 ni sous les boutons (x > 905, y 880–1760). Vérifie avec l'en-tête (sans `--bare`).
- **Couleurs franches** : `mood` 1 (signal) dans la glace tant que la menace est là ; 0 sur l'établi, en glace plate (`repos` jusqu'à « Mais »), et à partir de « casse » (66,2) ; jamais entre les deux plus d'une demi-seconde.
- La lumière suit le sujet : `fx, fy, fz` au centre de ce qu'on filme, `fs` sa taille (≈ 3 000 l'étrave, ≈ 15 000 le navire, ≈ 120 000 les deux navires à 1,2 km, ≈ 600 000 la carte ; `SIZE` sur l'établi).
- Mouvements longs `sine.inOut` ; recul ou plongée **par rapport** (`shot(at, durée, pose, ease, fromD)`) ; plus d'un quart de tour en une seconde = une coupe ; la caméra reste au-dessus de y ≈ 50 (l'eau est opaque), traverse le verre (ton navire), jamais le brise-glace.
- **`dof`** : `CLOSE` sur les seules poses de gros plan (`belt`, `tanks`, `stem`, `principle`) ; tout le reste 0.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** ; la liste de `FIRST` est fermée — s'il en manque un, « À changer ailleurs ». Les étiquettes sont en capitales, sans unité à symbole.

## La grille de rétention (21/10), appliquée ici

| instant | ce qui doit se passer |
| --- | --- |
| 0 → 0,5 s | les floes glissent dès l'image 1 et se referment (le sujet bouge, pas seulement la caméra) ; le sujet reste dans le cadre (`glide` vérifié à 0,3 et 0,7 s) |
| 0,5 → 10,7 s | une démonstration par phrase ; **le mot-choc « referme » (`choc`, 0,84) frappe** : `D.punch`, puis le son dans le souffle (déjà dans `sfx`) |
| 10,7 → 25 s | la scène est une deuxième accroche : un changement toutes les 2 à 3 s (pont → flanc → carte → plongée sur la proue), **aucune plage lente de 2 s** ; « Alors… on l'ouvre » seul, dans le quasi-silence (`hush` posé), l'éclaté s'ouvre SUR « on » (`explode`, 22,20) |
| portes d'acte | `tobench` 22,06 · `torepos` 43,43 · `tozero` 49,99 · `toverdict` 67,29 · `tocta` 74,66 · `toloop` 94,92 : une coupe ou un changement franc d'échelle |
| fin | `duelCall` (« le brise-glace… ou l'hélico ? ») : **le film ne répond jamais à la place du spectateur** |

**Les mots qui frappent** (un `D.punch` par phrase au plus, jamais sur une coupe, jamais deux à moins d'une seconde) : `referme` (0,84) · `casse` (6,40) · `bloqué` (10,36) · `pressent` (14,86) · `cœur` (29,36) · `plie` (36,40) · `fend` (45,64) · `serre` (52,52) · `roule` (60,08) · `casse` (66,24, ici **un `jolt`**, pas de punch : le moment fort se voit en entier, sans coupe dessus) · `pas` (69,54, le verdict).

**La boucle** : la dernière image est la première (`D.loop` sur `rewind`, 95,44) ; « Juste au moment où… » retombe sur « La glace se referme sur ton navire ». L'état revient à `FIRST` (dont `apart` 1 200, `run` 0, `mood` 1).

**Anti-parasites** : les floes et les blocs qui défilent sont des volumes, pas des traits fins ; les têtes de flux des tuyaux avancent d'au plus 1/7 de période par image ; les hélices au-delà de `prop` 0,5 sont un disque fondu ; la carte (15 km) ne se traverse pas vite (la plongée de la fin de l'acte 1 se fait par rapport) ; ce que la caméra frôle (ton navire de verre, la flèche) est invisible, pas seulement éteint.

## Les étiquettes (dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-navire` (Ton navire / 52 passagers, ink) · `chip-brise` (Brise-glace / Xuelong, signal) · `chip-metre` (Glace / Un mètre, ink) · `chip-distance` (À ouvrir / Une dizaine de kilomètres, ink) · `chip-coeur` (Le cœur / L'étrave inclinée, veille) · `chip-vingt` (Étrave / Vingt degrés, veille) · `#gauge` (la jauge du principe : `#gauge-a` signal pleine, `#gauge-b` veille qui tombe à 40 %, « Environ 60 pour cent de moins ») · `chip-oden` (Brise-glace suédois / Oden, ink) · `#retitle` (Un brise-glace : « Tape la glace » barré → « Pèse dessus ») · `chip-vent` (Ce qui l'a bloqué / Le vent et la marée, signal) · `chip-jours` (Xuelong pris / N jours : `days` 0 → 6 l'écrit, `main.js` le lit) · `#duel` (Toi, coincé là-bas ? — Le brise-glace / L'hélico) · `#net` (like) · `#next` (052, titre classé, « À chaque gare, il lâche le câble… puis le rattrape. », et le pictogramme `#next-pic` : `#next-chair`, `#next-clamp`, `#next-cable`) · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre : « Ceinture de glace », « Citernes de gîte », « L'étrave ».

---

## acte1.js

**01 · MENACE — 0 → `tobench` 22,06.** Part de `POSE0` / `FIRST` ; un seul mouvement, deux coupes au plus. Finit sur `VIEW.bow` (le brise-glace plein, de 3/4 avant, `fs` ≈ 15 000) : c'est de là que l'acte 2 coupe.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 0 → `meme` 2,44 | « La glace se referme sur ton navire. » | `POSE0` : au ras de la glace, les floes glissent et se referment sur la coque de verre (`close` 0,55 → 0,9 jusqu'à `navire`, `sine.out`) ; la caméra pousse bas (`glide`) ; `D.punch` sur `choc` (0,84) | ton navire ≥ 40 % de la largeur |
| `meme` 2,44 → `coince` 4,84 | « Même le brise-glace venu te chercher… » | derrière ton navire, le brise-glace plein avance (`run` 0 → 25, `"none"`), son chenal ouvert (`wake` 0,6) ; `chip-brise` (XUELONG) entre à `meme`+0,4 | brise-glace ≥ 15 % |
| `coince` 4,84 → `promesse` 5,71 | « …reste coincé. » | `run` se pose (`power2.out`), `wake` → 0 : le sillage se referme derrière lui | idem |
| `promesse` 5,71 → `frapper` 8,16 | « Pourtant, il casse un mètre de glace… » | **coupe 1** (raccord sur l'étrave qu'on voyait au loin) : `VIEW.bowSide`, `run` file, `bend` → 1 puis `crack` à `casse`+0,1 (punch sur « casse ») ; `chip-metre` à `metre` | étrave + plaque ≥ 60 % |
| `frapper` 8,16 → `bloque` 10,36 | « …sans la frapper. Alors ce jour-là, qui l'a bloqué ? » | la plaque plie sans choc (lent), les blocs basculent (`tumble`) ; sur « Alors » (9,06) la caméra recule par rapport et monte vers `VIEW.high` : le brise-glace arrêté, `close` 1 tout autour, `run` tenu ; punch sur « bloqué » | navire ≥ 30 % |
| `scene` 11,52 → `plaques` 14,34 | « 52 passagers à bord, en Antarctique. » | **coupe 2** (raccord : du navire pris à « ton navire ») : `VIEW.deck`, `crowd` 1, `chip-navire` à `passagers` ; la caméra glisse le long du pont | ton navire ≥ 50 % |
| `plaques` 14,34 → `arrive` 16,74 | « Les plaques se pressent contre ta coque. » | la caméra descend au ras du flanc (vers `VIEW.flank`, sans coupe), `close` → 1, le contact signal ; punch sur « pressent » | coque + plaques ≥ 50 % |
| `arrive` 16,74 → `serre1` 20,26 | « Un brise-glace arrive : une dizaine de kilomètres à ouvrir… dans une glace qui se serre. » | la caméra s'élève jusqu'à `VIEW.top` (par rapport ; `apart` passe à 11 000 **sur une coupe** si ton navire seul était dans le cadre — sinon garde 1 200 et dis-le) : `line` 1 sur « dizaine », `chip-distance` ; sur « serre », le point du brise-glace s'arrête, le pack converge | les deux points et la ligne : la hauteur du cadre |
| `serre1` 20,26 → `tobench` 22,06 | (« Alors… » à 21,42) | plongée par rapport de la carte jusqu'à la proue (`VIEW.bow`), `fs` → 15 000, `mood` 1 ; sur « Alors… » le temps s'arrête (`run` tenu), `shell` du champ baisse | brise-glace ≥ 45 % |

**Couture de sortie** : `VIEW.bow`, `close` 1, `run` tenu, `shok` 0 (ou loin), `mood` 1 → l'acte 2 fait `benchCut` depuis `VIEW.bow`.

## acte2.js

**02 · AUTOPSIE — `tobench` 22,06 → `torepos` 43,43.** « Alors… on l'ouvre. », l'éclaté, la liste courte, le cœur, puis le principe sur l'étrave même.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| `tobench` 22,06 → `ceinture` 23,72 | « …on l'ouvre. » | `benchCut` (vue `VIEW.bow`, `state` `BENCHED`) ; **sur « on » (`explode` 22,20)** `explode` 0 → 1 (1,2 s, `"none"`) pendant que la caméra recule vers `VIEW.exploded` | les quatre ensembles : la hauteur du cadre sous l'en-tête |
| `ceinture` 23,72 → `citernes1` 26,92 | « Une ceinture d'acier épais court à sa flottaison. » | `litBelt` 1 ; la caméra glisse le long de la bande (vers `VIEW.belt`) ; `co.add` « Ceinture de glace » | bande ≥ 70 % de la largeur |
| `citernes1` 26,92 → `devant` 28,60 | « Dedans… des citernes, de chaque bord. » | `litTanks` 1 ; sur « chaque bord » (27,56) `tanks` −1 → +1 (l'eau passe : on montre déjà le geste de l'acte 3) ; `co.add` « Citernes de gîte » | citernes ≥ 50 % |
| `devant` 28,60 → `principe` 32,81 | « Et devant… le cœur : l'étrave inclinée, qui pose son poids. » | la caméra file vers l'avant jusqu'à `VIEW.stem` (`explode` → 0,3 : l'étrave reste détachée) ; **`cœur` (29,36) : `litStem` 1, `chip-coeur`, punch** ; « pose son poids » (31,97) : `push` 0 → 1 | étrave ≥ 45 % |
| `principe` 32,81 → `plie1` 36,40 | « Pourquoi ça casse ? La glace de mer supporte qu'on l'écrase… » | glisse (pas de coupe) vers `VIEW.principle` ; `explode` 0, `slab` 1 (la plaque, le bac d'eau de verre) ; sur « l'écrase » (`ecrase` 35,29) : `straight` 1, `push` 1 (horizontale, signal), `crush` 0 → 1 — **rien ne cède** ; `mood` reste 0 | étrave + plaque ≥ 70 % |
| `plie1` 36,40 → `environ` 39,83 | « …pas qu'on la plie. Inclinée à vingt degrés, l'étrave pèse dessus : » | sur « plie » : `straight` → 0, `crush` → 0 ; `chip-vingt` à `vingt` ; **« pèse » (38,88)** : `push` 1 (vers le bas, veille), `bend` 0 → 1 (lent) ; dans le souffle (39,4) `crack` 1 — le trait blanc | idem |
| `environ` 39,83 → `torepos` 43,43 | « environ 60 pour cent de résistance en moins qu'une étrave presque droite. » | `#gauge` entre à `environ`, `#gauge-b` tombe à 40 % sur « 60 » (40,20) ; la plaque en blocs, `tumble` 0 → 0,5 ; `#gauge` sorti avant 43,3 | étrave ≥ 45 % sous la jauge |

**Couture** : finit sur `VIEW.principle` (profil, l'étrave et sa plaque cassée) → l'acte 2b coupe sur la même étrave, dans la glace.

## acte2b.js

**02 · AUTOPSIE (suite) — `torepos` 43,43 → `tozero` 49,99.** La glace plate : le mécanisme au repos, puis la menace qui revient.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| `torepos` 43,43 → `fend` 45,64 | « En glace plate, la plaque plie, » | **coupe** (raccord : même étrave, même profil) dans la glace, `VIEW.bowSide`, `{ ...STAGED, shok: 0, close: 0.7, wake: 1, mood: 0, prop: 0.6 }` ; `run` avance (`"none"`) ; `bend` 0 → 1 jusqu'à « plie » (44,92) | étrave + plaque ≥ 60 % |
| `fend` 45,64 → `labas` 47,96 | « se fend, et les blocs basculent sous la coque. » | `crack` 1 sur « fend » (punch) ; `tumble` 0 → 1 sur « basculent » — la caméra suit les blocs le long du flanc vers l'arrière (un seul mouvement) | blocs + coque ≥ 50 % |
| `labas` 47,96 → `tozero` 49,99 | « Mais là-bas… la glace se referme. » | **`mood` 1 sur « Mais »** ; la caméra s'élève par rapport vers `VIEW.high` ; sur « referme » (49,32) `close` → 1, `wake` 1 → 0 : le chenal se referme derrière lui | navire ≥ 30 % |

**Couture** : `VIEW.high`, `close` 1, `wake` 0, `mood` 1, `run` qui ralentit → l'acte 3 coupe.

## acte3.js

**03 · RÉPONSE — `tozero` 49,99 → `toverdict` 67,29.** En coupes, un plan par souffle ; le moment fort (« casse ») sans coupe dessus.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| `tozero` 49,99 → `bords` 51,72 | « Elle s'empile en crêtes. » | **coupe** : vue du dessus plus basse que `VIEW.high` ; `ridge` 0 → 1 sur « crêtes » (50,84) | navire ≥ 35 % |
| `bords` 51,72 → `serre2` 52,52 | « Des deux bords. » | **coupe** rasante depuis l'arrière (az ≈ 0, `el` ≈ 3) : les deux crêtes de part et d'autre de la coque | coque + deux crêtes ≥ 60 % |
| `serre2` 52,52 → `arrete` 54,56 | « Elle serre la coque. Et le brise-glace… » | `grip` 1 (le contact signal) sur « serre » (punch) ; `prop` 1 : l'hélice brasse encore (`VIEW.stern` si coupe) ; `run` ralentit | idem |
| `arrete` 54,56 → `reponse` 55,65 | « …s'arrête. » | `run` tenu net, `jolt` léger ; le chrono garde « Déc. 2013 » | idem |
| `reponse` 55,65 → `rollFrom` 58,48 | « Alors, les citernes de l'Oden. » | **coupe** (raccord : même coque, crêtes serrées) : `VIEW.section`, `section` 1, `ridge` 1, `grip` 1 ; `chip-oden` à `oden` ; `litTanks` 1 | tranche ≥ 70 % |
| `rollFrom` 58,48 → `roule` 60,08 | « L'eau change de bord : quinze secondes. » | `tanks` −1 → +1, `pump` 1 (de `rollFrom` à `rollTo`) ; le chrono passe T+0 → T+15 s tout seul | idem |
| `roule` 60,08 → `recule` 62,08 | « Il roule. La coque se libère. » | `heel` 0 → 6 sur « roule » (punch) ; `grip` 1 → 0 sur « libère » (61,28) : l'eau noire s'ouvre le long des flancs | idem |
| `recule` 62,08 → `trigger` 66,19 | « Il recule… repart à l'élan. La proue pèse. La glace plie… » | **coupe** : `VIEW.bowSide` élargi (la crête devant visible), `section` 0, `heel` → 0, `crest` 1 ; `run` 0 → −40 (`sine.inOut`) puis −40 → 0 à « repart » (`power2.in`), **la caméra suit l'étrave d'un seul tenant** ; « pèse » (64,32) `push` 1, `bend` 0 → 1 | étrave + crête ≥ 55 % |
| `trigger` 66,19 → `toverdict` 67,29 | « …et casse. » | **sur « casse »** : `crack` 1, la crête casse en grand, les blocs s'écartent des deux côtés ; `jolt` 0,45 ; **`mood` 0 ici, pas avant** | idem |

**Couture** : `mood` 0, crête cassée → la fin coupe.

## fin.js

**Chute → ce qui est dû → like → prochain dossier → boucle — `toverdict` 67,29 → 96,93.** Plans calmes qui bougent : orbites lentes, jamais trois reculs.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| `toverdict` 67,29 → `pese3` 70,70 | « Voilà son secret : un brise-glace ne tape *pas* la glace. » | **coupe** : `VIEW.quarter` (3/4, dans la glace, `mood` 0), sa proue posée sur la glace ; `#retitle` « Tape la glace » entre, barré sur `verdict` (69,54) ; `D.verdict(verdict)` | navire ≥ 45 % |
| `pese3` 70,70 → `tocta` 74,66 | « Il pèse dessus. Et pris, il ne force pas : il se +balance+. » | `push` 1, la plaque cède (`bend`, `crack`) ; « Pèse dessus » prend la place ; sur « balance » (73,74) `heel` lent ±5 (`tanks` qui alterne) ; `#retitle` sorti à `tocta`−0,42 | idem |
| `tocta` 74,66 → `commentaire` 80,78 | « Et qui l'a bloqué, le Xuelong ? Le vent et la marée : six jours, la banquise s'est serrée autour de lui. » | **coupe** : `VIEW.top` (`apart` 11 000, `line` 1), le point du brise-glace ; `wind` 1 sur « vent » + `chip-vent` ; `days` 0 → 6 de `jours` à 80,1 (`chip-jours`) ; `close` → 1 | la carte : toute la hauteur |
| `commentaire` 80,78 → `like` 85,52 | « En commentaire : toi, coincé là-bas : le brise-glace… ou l'hélico ? » | **coupe** au-dessus de ton navire (la coupe remet `apart` à 1 200 : la carte d'avant ne montrait que des points), `heli` 1 au-dessus de lui, le brise-glace au loin ; `duelCall` : A sur `duelA` (83,14), B sur `duelB` (84,06), `toneA` veille, `toneB` signal ; **aucune réponse tapée** | les deux réponses dans le cadre |
| `like` 85,52 → `abo` 88,44 | « Like pour celui qui croit qu'il suffit de pousser plus fort. » | **coupe** : `VIEW.bowSide`, `straight` 1, `crest` 1, `crush` 1, `prop` 1 : l'étrave droite contre la crête, l'hélice s'emballe pour rien ; `likeCall` | étrave ≥ 45 % |
| `abo` 88,44 → `toloop` 94,92 | « Abonne-toi : prochain dossier, le télésiège débrayable. À chaque gare, il lâche le câble… puis le rattrape. » | orbite lente autour du navire (`mood` 0) ; `nextFile` ; `#next-pic` : la pince (`#next-clamp`) s'ouvre sur `lache` (92,88), le siège (`#next-chair`) ralentit, la pince se referme sur `rattrape` (94,12) — en `tl.to` sur le DOM | panneau en zone haute, navire dessous |
| `toloop` 94,92 → fin | « Juste au moment où… » | **coupe** sur `POSE0` approché, `{ ...STAGED, ...FIRST }` ; `D.loop({ at: toloop, rewindAt: rewind })` : la dernière image = la première | comme `POSE0` |

---

## Les candidates de la première image

Quatre, tirées sur le **vrai décor** par l'agent de `banquise.js` (poses prêtes : `.cache/planches/051/architecte/candidates.json`, à copier dans son dossier d'essais), choisies AVANT les actes ; la gagnante est collée dans `world.js` (`POSE0`, et `FIRST` s'il le faut). Notes sur les six points (1 événement en cours · 2 perspective basse · 3 menace derrière · 4 forme reconnue vue d'où on ne la voit jamais, ≥ 40 % · 5 le système là, petit mais lisible · 6 ça bouge dès l'image 1 par le sujet) :

| | candidate | 1 | 2 | 3 | 4 | 5 | 6 | total | risque |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **(a)** | **La glace se referme** (`POSE0`) : au ras de la glace, derrière ton navire de verre, les floes qui se referment sur sa coque ; le brise-glace plein au loin ; l'horizon signal | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **6** | un navire de verre en contre-jour ne se lit que par ses arêtes ; le brise-glace à 1,2 km doit faire ≥ 12 % de la largeur (`fov`) |
| (b) | **L'étrave d'en dessous** : au ras de l'eau devant le brise-glace, la proue pleine qui vient sur la caméra, la plaque qui plie et se fend dessous | ✓ | ✓ | ½ (horizon seul) | ✓ | ✓ (c'est lui) | ✓ | 5,5 | dit la promesse, pas l'accroche (« ton navire » absent) |
| (c) | **La mâchoire, de haut** : les deux navires à 1,2 km, le pack qui converge des deux côtés, le chenal qui se referme | ✓ | ✗ | ✓ | ½ (vu de haut : une carte) | ✓ | ✓ | 4,5 | plan « carte », pas viscéral |
| (d) | **Au ras de ta coque** : les plaques qui se pressent contre le flanc de verre, les gens sur le pont au-dessus | ✓ | ✓ | ½ | ✓ | ✗ (le brise-glace hors champ) | ✓ | 4,5 | pas de système dans l'image |

Poses (à coller dans un `essais.json`) :
```json
[
 { "at": 0.02, "label": "(a) la glace se referme", "pose": { "tx": -1500, "ty": 500, "tz": -120000, "d": 10000, "az": -170, "el": -2, "fov": 40, "shift": 150, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": {} },
 { "at": 0.02, "label": "(b) l'étrave d'en dessous", "pose": { "tx": 0, "ty": 300, "tz": -5000, "d": 5200, "az": -158, "el": -3, "fov": 42, "shift": 160, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "shok": 0, "close": 0.9, "wake": 0.3, "bend": 0.6, "crack": 0.2, "prop": 0.8, "mood": 1, "fx": 0, "fy": 300, "fz": -4000, "fs": 15000 } },
 { "at": 0.02, "label": "(c) la mâchoire, de haut", "pose": { "tx": -1300, "ty": 0, "tz": -60000, "d": 220000, "az": -25, "el": 58, "fov": 40, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "close": 0.4, "wake": 0.8, "fx": -1300, "fy": 0, "fz": -60000, "fs": 120000 } },
 { "at": 0.02, "label": "(d) au ras de ta coque", "pose": { "tx": -3300, "ty": 150, "tz": -118500, "d": 3200, "az": -150, "el": 3, "fov": 36, "shift": 150, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "close": 0.7, "fx": -2600, "fy": 300, "fz": -120000, "fs": 9000 } }
]
```
Tire-les aussi à 0,3 et 0,7 s (la règle 6 : les floes ont bougé, le sujet est resté dans le cadre).

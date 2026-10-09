# 013 · Halo — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (`npm run script -- 013` le donne ; la vraie voix sera ≈ 25 % plus courte). Tout instant se lit donc dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères : le jour où la voix arrive, tout se recale seul. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui vides) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/012-gaziniere/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`).

## L'histoire, et ce qu'on a le droit de montrer

Romain Grosjean, Grand Prix de Bahreïn, 29 novembre 2020, premier tour — racontée à la deuxième personne ; son nom n'est dit qu'à la fin. Ce que l'enquête de la FIA établit : une roue contre la sienne à 241 km/h ; 192 km/h contre une triple glissière, 67 g ; le groupe propulseur se sépare de la cellule de survie ; la cellule perce la glissière (le rail du milieu cède, ceux du haut et du bas se déforment) et s'arrête son arceau principal contre le rail du haut ; le feu naît à l'arrière de la cellule ; pied gauche coincé, chaussure laissée ; ≈ 28 secondes ; brûlures aux mains.

**Aucune source ne décrit le contact du Halo et des rails.** La voix dit seulement : « l'arceau tient : il reste entre toi et l'acier ». L'image reconstitue : les poutres s'écartent autour de la cellule (c'est `rail.js` qui le fait, tout seul, quand `ahead` descend), l'anneau passe intact, une ligne chauffée à blanc là où l'acier porte (`stress`), et l'espace autour du casque reste entier (`space`). Aucune étiquette n'affirme « le Halo a soulevé le rail ».

## Le repère, et les deux nombres de l'en-tête

- **Le repère est celui de la voiture** : la cellule ne bouge jamais, le nez est vers +z. La caméra habituelle (−x / +z, az −20 … −70) est **derrière le rail**, du côté où la voiture en sort : elle la voit arriver. Le rail, la piste et le feu viennent à la voiture : `ahead` (mètres) — 60 loin · 3,75 le nez touche · ≈ 0,9 les poutres sont à l'avant du Halo · 0 lodgée.
- L'en-tête lit deux nombres de l'état, que les actes bougent comme les autres : **`kmh`** (la vitesse : 241 avant le contact des roues, 192 contre le rail, 0 lodgée) et **`sec`** (l'horloge, en secondes depuis l'impact, affichée `T+0:SS` : 0 jusqu'à l'impact, puis elle court jusqu'à 28 pendant le feu — plus vite que le film : c'est un condensé, dit « environ »).
- Le film joue l'impact AU RALENTI (1,6 m en trois secondes) : c'est voulu, on doit voir l'acier s'ouvrir.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...STAGED, ...LODGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin. La caméra ne traverse ni les poutres ni la cellule (elle peut traverser le verre de la carrosserie).
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 170 pour le cockpit et les rails, ≈ 60 sur le casque et l'anneau, ≈ 600 pour la voiture entière, `SIZE` sur l'établi).
- **Couleurs** : signal est la menace — l'acier là où il est frappé, le feu ; veille est ce qui te protège — le Halo quand la voix le nomme, l'espace qu'il garde ; ink est le reste. `mood` 1 sur la piste, 0 sur l'établi. Jamais à mi-chemin plus d'une demi-seconde.
- **Le feu est derrière la cellule** vu de la caméra habituelle : le casque et l'anneau restent lisibles devant lui. Toi, de près, es un mannequin de verre : pour te voir bouger (`out`), d ≥ 400.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** (`ease`, `delay`, `duration`, `repeat`, `yoyo`, `stagger`, `snap`…) : la liste de `FIRST` est fermée, n'en ajoute pas.
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-contact` (Roue contre roue / 241 km/h) · `chip-impact` (Contre le rail / 67 g) · `chip-rail` (Triple rail / Acier) · `chip-kn` (Essai d'homologation / ≈ 12 tonnes) · `chip-tient` (Le Halo / Ne cède pas) · `chip-split` (Groupe moteur / Arraché) · `chip-cell` (Cellule de survie / Intacte) · `chip-halo` (L'arceau / Intact) · `chip-shoe` (Pied gauche / Coincé) · `chip-out` (Brûlures aux mains / Vivant) · `#retitle` (Le Halo : « Absorbe le choc » barré → « Garde ta place ») · `#net` · `#next` (Prochain dossier · 014 — « Tu freines à fond. Elle relâche tes freins. ») · `chip-pilote` (Bahreïn · 29 novembre 2020 / Romain Grosjean) · `chip-avant` (Juillet 2016 / Contre) · `chip-apres` (Après le feu / Pour) · `#cta-field` (« Le Halo : pour ou contre ? » → « POUR », 4 lettres) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `012-gaziniere/src/acte2.js`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

Tout l'acte en UN mouvement, avec un seul retour en arrière (le film rembobine après l'accroche).

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, état `FIRST` (`ahead` 1,6) : vue de derrière le rail, la cellule à mi-chemin dans l'acier, les poutres qui cèdent autour d'elle, l'anneau qui arrive sur la poutre du haut. **Ça bouge dès l'image 1** : `ahead` descend (au ralenti), la caméra pousse vers le cockpit. C'est ce qui arrête le pouce, sans texte. |
| → `pierce` | « Premier tour. Ta Formule 1 traverse un rail d'acier… » | `ahead` 1,6 → 0,2 : le cockpit passe ; `stress` monte quand la poutre du haut franchit l'anneau (≈ 0,9 → 0,4), puis retombe ; `kmh` 192 → ≈ 30 |
| `fire0` | « …et prend feu. » | `ahead` → 0 ; `split` 0 → 1 (l'arrière part, côté piste, à demi caché) ; sur « feu », `fire` 0 → 0,8 : la boule de feu derrière le cockpit ; `kmh` 0 |
| `alive` | « Tu en sors vivant. » | recul par rapport jusqu'à l'épave entière (`VIEW.lodged`) : `out` 0 → 0,5 → 1 — tu te lèves dans le feu et tu passes le rail ; l'horloge court (`sec` 0 → 28 entre `alive` et `hoop`) |
| `hoop` → `unwanted` | « Grâce à un arceau… dont tu ne voulais pas. » | la caméra revient dans le cockpit vide (`you` reste 1 mais tu es dehors : `out` 1) : l'anneau, intact, grand, devant le feu ; `litHalo` 0 → 1 sur « arceau » ; il TIENT l'image jusqu'à la fin de la phrase |
| `toscene` | *(silence, 0,45 s)* | **le film rembobine** : `fire` → 0, `split` → 0, `out` → 0, `litHalo` → 0, `sec` → 0, `ahead` 0 → 60 (les poutres se referment), `kmh` → 241 ; la caméra file vers ta roue arrière droite (`VIEW.contact`) — au besoin une coupe au milieu du rembobinage |
| `touch` | « Une roue touche la tienne. » | `rival` 0,5 → 1 sur « touche » : l'étincelle ; `chip-contact` |
| `hit` → `v192` | « Tu frappes le rail à 192 kilomètres-heure : » | la voiture part vers le rail : `ahead` 60 → 3,75 (fin sur « rail »), `rival` → 0, `kmh` 241 → 192 ; la caméra recule et tourne pour voir le rail arriver en travers de l'image (`VIEW.coming`) |
| `g67` | « 67 g. » | le nez dans les poutres : `ahead` 3,75 → 3,3, une secousse (`jolt`) ; `chip-impact` |
| `between` → `one` | « Entre ton casque et l'acier… il n'y a qu'une chose. » | la caméra glisse jusqu'au cockpit, de profil (`VIEW.profile`) : la poutre du haut est à la hauteur de ton casque et elle arrive (`ahead` 3,3 → 1,4, lentement) ; sur « chose », `litHalo` 0 → 1 : l'anneau, entre les deux |

L'acte 2 coupe à `tosystem`.

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tosystem` | « Alors… » | **coupe** : la piste, le système entier dans les rails (`VIEW.system`, `{ ...STAGED, ahead: 1.4, litHalo: 1 }`) — le temps s'arrête ; `shell` → 0 : la carrosserie, la piste et le rail s'effacent, `litHalo` → 0, `mood` → 0 : il reste seul |
| `tobench` | « …on l'ouvre. » | `benchCut` : le même système, sur l'établi, à la même place de l'image (`origin` = `[0, 0, 0]` − `SYSTEM.bench`, composante par composante). `explode` 0 → 1 (1,2 s, `"none"`), la caméra recule par rapport jusqu'à l'éclaté (`VIEW.exploded`) |
| `p1` | « Un arceau de titane. » | `litHalo` ; la caméra sur l'anneau soulevé ; légende « Halo » / « Titane » |
| `p2` | « Un pied, devant tes yeux. » | `you` 0 → 1 (tu apparais dans le siège : c'est ton casque qui dit où sont « tes yeux ») ; `litHalo` → 0, `litFoot` → 1 ; elle glisse vers le pied ; légende « Le pied » |
| `p3` | « Deux ancrages, sur les côtés. » | `litFoot` → 0, `litMounts` → 1 ; légende « Ancrages » |
| `p4` | « Et dessous… ta coque de carbone. » | recul jusqu'à la cellule entière (`VIEW.cellPart`) ; `litMounts` → 0, `litCell` → 1 ; légende « Cellule de survie » / « Carbone » |
| `torepos` → `crush` | « Avant d'être autorisé en course, on l'écrase : » | **coupe** : l'établi, tout remonté (`explode` 0, `you` 0), le vérin au-dessus (`VIEW.pressPart`) ; `press` 0 → 0,3 sur « écrase » : le patin touche l'anneau |
| `kn` | « plus de cent kilonewtons. » | `press` 0,3 → 1 : pleine charge, l'anneau luit ; une secousse légère |
| `bus` | « À peu près le poids d'un bus à impériale. » | `chip-kn` en zone haute ; lente rotation autour de l'anneau chargé |
| `hold` | « Il n'a pas le droit de céder. » | l'anneau tient ; `you` → 1, `space` 0 → 0,7 : la place de ta tête, intacte dessous ; `chip-tient` à la place de `chip-kn` ; le vérin remonte (`press` → 0) avant la coupe |
| `toseuil` | « Abonne-toi : ce rail d'acier, regarde ce qui se met entre lui et toi. » | `followCall`. Le film ne s'arrête pas : **coupe** vers la piste — le rail qui arrive sur la voiture, de trois quarts (`{ ...STAGED, ahead: 9 }` → 3,9 sur la phrase, `kmh` 192) — l'image de l'accroche qui revient, et la caméra part déjà vers le cockpit. Pas de panneau |

L'acte 3 coupe à `tozero`.

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes : c'est ici qu'elles font la tension. `setAct(tl, 3, impact)`. Au ralenti : de `impact` à `steel`, `ahead` va de 3,75 à 0 d'un seul tenant (chaque plan reprend la valeur où le précédent l'a laissée) ; `sec` reste 0 ; `kmh` 192 → 0.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `impact` | « Impact. » | **coupe** : de derrière le rail (`VIEW.hook`), `{ ...STAGED }` ; sur le mot, `ahead` 3,75 → 3,1 : le nez et l'aileron se disloquent dans les poutres ; `jolt` ; l'horloge de l'en-tête pulse une fois (`tl`, une échelle sur `#hud-clock`) |
| `tear` | « L'arrière s'arrache : » | **coupe** : l'arrière de la voiture, côté piste (la pose que rend `f1.js`) ; `split` 0 → 0,5 |
| `two` | « ta voiture se sépare en deux. » | `split` → 1 : le groupe moteur couché sur la piste ; `chip-split` ; `ahead` → 2,3 |
| `enters` | « Ta coque, elle… entre dans le rail. » | **coupe** : de derrière le rail, trois quarts (`VIEW.cockpit`, large) ; `ahead` 2,3 → 1,0 : la poutre du milieu se déchire, la cellule passe ; `chip-cell` |
| `toreponse` → `helmet` | « Et devant ton casque, » | **coupe** : de profil, serré sur le casque et l'anneau (`VIEW.profile`, d ≈ 260) ; `ahead` 1,0 → 0,6 : la poutre du haut arrive |
| `trigger` | « l'arceau tient : » | `stress` 0 → 1 sur « tient » (la ligne chauffée à blanc, les étincelles), `jolt` léger, `litHalo` 1 ; `chip-halo` ; `ahead` → 0,3 |
| `stays` → `steel` | « il reste entre toi… et l'acier. » | `space` 0 → 1 : l'espace autour de ta tête, entier, pendant que la poutre (arêtes signal) glisse sur l'anneau ; `ahead` → 0 un peu après « acier », `stress` → 0,3, `kmh` → 0 |
| `tofire` → `blaze` | « Le feu. » | **coupe** : l'épave entière (`VIEW.lodged`, `{ ...STAGED, ...LODGED, fire: 0.15 }`) ; sur le mot, `fire` → 1 ; l'horloge part : `sec` 0 → 28 entre `blaze` et `outside` (`"none"`) |
| `foot` | « Ton pied est coincé : » | poussée vers le cockpit dans le feu (d ≥ 400) ; `out` 0 → 0,18 → 0,05 : tu te lèves, tu retombes ; `chip-shoe` |
| `shoe` | « tu laisses ta chaussure. » | `out` → 0,5 : debout dans le cockpit, au-dessus de l'anneau |
| `s28` → `outside` | « 28 secondes, environ… et tu es dehors. » | `out` → 1 sur « dehors » : par-dessus la poutre tordue (`VIEW.exit`) ; `chip-out` ; elle est sortie avant `toverdict` |

`fin.js` coupe à `toverdict`.

## Chute, appels à l'action, boucle — `fin.js` (`toverdict` → fin)

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `idea` | « 67 g : c'est ta coque, » | **coupe** : l'établi, le système entier, toi dedans (`{ ...BENCHED, you: 1 }`, `VIEW.whole`) ; `litCell` 0 → 0,7 ; `retitle` : « Absorbe le choc » arrive avec la phrase |
| `harness` | « ton siège et ton harnais qui les ont pris. » | `harness` 0 → 1 ; la caméra monte vers le cockpit |
| `strike` | « L'arceau, lui, n'est pas là pour amortir. » | le titre est barré sur « amortir » ; `litCell` → 0, `harness` → 0,3 ; elle arrive sur ta tête sous l'anneau (`VIEW.head`) |
| `verdict` | « Il garde une seule chose… la place de ta tête. » | « Garde ta place » le remplace ; `space` 0 → 1, `litHalo` 1 ; `D.verdict(verdict)` ; le titre est sorti avant `tocta` |
| `tocta` | « Like. Ça remontera chez quelqu'un qui le trouve encore trop laid. » | **coupe** : l'établi, le système entier sans toi (`VIEW.whole`), qui tourne lentement. `likeCall` (5 tuiles, « n personnes ») |
| `toabo` → `next` | « Abonne-toi. Prochain dossier : ta voiture à toi. » | `nextFile` (panneau à `next`) ; la caméra recule et descend |
| `brakes` → `release` | « Tu freines à fond… et elle relâche tes freins. » | le fait du panneau à `brakes` |
| `tocomment` | « Et l'arceau dont tu ne voulais pas ? » | **coupe** : la piste, l'épave, le feu qui baisse (`{ ...STAGED, ...LODGED, fire: 0.45, out: 1 }`) : le cockpit vide, l'anneau intact au premier plan (le cadre de la fin de l'accroche) |
| `pilot` | « Ce pilote, c'est Romain Grosjean. » | `chip-pilote` en zone haute |
| `before` → `sad` | « Avant, il disait : un triste jour pour la Formule 1. » | **coupe** : l'établi, le Halo soulevé, seul (`explode` 1), `mood` 1 un instant : l'objet qu'on trouvait laid ; `chip-avant` (signal) |
| `after` → `speak` | « Après le feu : sans lui, je ne pourrais pas vous parler. » | **coupe** : la piste, toi debout hors du cockpit (`out` 0,5 → 1), l'anneau entre toi et le feu, `space` 0,6 ; `chip-apres` (veille) |
| `ask` | « En commentaire : le Halo, pour… ou contre ? » | `commentCall` (la question s'affiche ; « POUR » se tape : `chars: 4`) |
| `toloop` | « Parce que ce jour-là, tout a basculé au… » | **coupe** : la voiture entière qui arrive, loin du rail (`{ ...STAGED, ahead: 26, kmh: 241 }`, `VIEW.coming`) ; `rewind` : `D.loop({ at: toloop, rewindAt: rewind, fromD })` — retour à `POSE0` et à `FIRST` : `ahead` → 1,6, la voiture entre dans le rail. **La boucle est causale : la dernière image EST l'instant de la première.** |

La dernière image est la première : `commit` prévient dans la console si un nombre n'est pas revenu. Compare la première et la dernière image avant de rendre (`look --at 0.02,<fin − 0.03>`), et signale tout repère de l'acte 1 qui décalerait la première.

## Corrections après les décors — elles priment sur les tableaux ci-dessus

Vu sur planche par celui qui orchestre : les trois décors sont au niveau. Les images les plus fortes, à ne pas rater : **le casque sous l'anneau, la poutre chauffée à blanc dessus** (`VIEW.cockpit`, `ahead` 0,9, `stress` 1, `fire` 0,3) ; l'épave dans le rail devant le feu (`VIEW.lodged`, `fire` 0,6) ; la F1 de verre entière (`VIEW.coming`, `ahead` 60) ; la roue rivale signal contre la tienne (`VIEW.contact`) ; le pied du Halo et ses boulons (`VIEW.footPart`) ; le vérin sur l'anneau (`VIEW.pressPart`, `press` 1) ; ta tête dans son volume veille (`VIEW.head`, `space` 1).

- **`POSE0` a changé** : basse et presque de face (`az` −14, `el` 3). C'est le seul endroit d'où l'on voit ton casque et l'anneau par l'ouverture tant que `ahead` ≥ 1,2 : de `az` −38, le bout déchiré de la lisse et un poteau plié passent devant le cockpit ; et à `ahead` 3,75 un poteau intact est en plein cadre. Essaie `side: 80` : la cloison avant de la coque sort de la colonne des boutons (vu, mieux). **L'agent de l'acte 1 règle `POSE0` et me rend la ligne exacte.**
- **Les contacts, dans l'ordre** (la droite du rail est en biais) : la dérive droite de l'aileron touche à `ahead` 5,5 · la roue avant droite part à 4,2 · la pointe du nez à 3,75 · la moitié gauche de l'aileron 3,3 → 2,9 · le ponton droit 2,6 → 0,85 · la roue avant gauche 1,9. `STAGED.ahead` vaut donc **5,6** (rien n'a touché). « Impact » : `ahead` 5,6 → 3,4.
- **`split` doit avoir quitté 0 avant `ahead` ≈ 1,0** (sinon la roue arrière droite entre dans l'acier). Dans l'accroche, qui part de `ahead` 1,6 : `split` 0 → 1 dès la première demi-seconde. Il se lit en trois temps : 0,12 un écart et les durites tendues · 0,3 en l'air · 1 posé sur la piste.
- **La dislocation de l'avant est cachée derrière le rail vue du côté caméra** : elle se montre du côté piste (`VIEW.shatter`). L'arrachement de l'arrière : `VIEW.torn` (côté piste, de derrière et de haut).
- **Le feu** : `fire` ≤ 0,6 depuis `VIEW.lodged` ; à 1 c'est un mur orange — prendre `VIEW.blaze` (plus loin, plus haut). Côté piste : `VIEW.trackSide` ; les lisses éclairées par le feu : `VIEW.railLit`.
- **`out` est schématique** (cinq postures : 0 assis · 0,24 poussée sur l'anneau · 0,5 debout · 0,76 accroupi sur la poutre · 1 à terre, côté piste) : de loin, brièvement, et **jamais tenu à 0,76** (une silhouette de verre en l'air). Vu du côté caméra tu passes derrière le feu : « tu es dehors » se filme plutôt du côté piste (`VIEW.trackSide`, toi debout devant l'épave en feu), ou de `VIEW.exit` à `out` 0,5.
- **Le harnais ne se lit que d'en haut** (`VIEW.belts`, `el` ≥ 30). **Les fixations** : `VIEW.explodedClose` sur la phrase qui les nomme.
- Sur l'établi le système est à `SYSTEM.bench` : un point de la voiture à z est à z − 61 (et y − 4) ; les poses d'établi de `VIEW` sont déjà dans ce repère. `BENCHED` met `you: 0` : la chute demande `you: 1`.
- Ancres — `world.system.A` : `halo, foot, mountL, mountR, helmet, cell, hoop, seat, pad, you` · `world.car.A` : `nose, wingF` (fixes), `wheelFL, wheelFR, wheelRL, wheelRR, rear, engine` (suivent les pièces arrachées), `rival, torn` · `world.rail.A` : `beamTop, breach, fire, flameTop, post, edge`.
- La lumière : cockpit `fx: 0, fy: 74, fz: 4, fs: 60` · la voiture entière `fx: 0, fy: 50, fz: 60, fs: 600` · le rail intact `fz: 335, fs: 300` · l'épave `fx: 0, fy: 72, fz: -20, fs: 300` · l'établi `fx: 0, fy: 50, fz: 0, fs: 150` (une pièce de près : `fs` ≈ 60 autour d'elle).
- Rien n'a été vu en mouvement par les décors : des centaines d'éclats clairs sautent quand `ahead` file. Fais descendre `ahead` LENTEMENT quand le cadre est serré (≤ 0,8 m par seconde), et garde les grandes variations pour les plans larges ou les coupes.
- Détail et autres poses : `docs/journal/013-model.md`, `013-f1.md`, `013-rail.md`.

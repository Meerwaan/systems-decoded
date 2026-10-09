# 017 · IRM — le plan de mise en scène

**La voix est enregistrée** (95,0 s) : les instants sont ceux de la vraie voix. Ils se lisent quand même dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères (`npm run script -- 017` donne la table). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui vides) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/014-abs/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`). Les poses qui cadrent bien sont dans les journaux des décors : `docs/journal/017-suite.md`, `017-model.md` — pars d'elles.

## La scène, et ce qu'on a le droit d'affirmer

L'examen est fini, l'IRM s'est tue. Tu entres dans la salle avec une bouteille d'oxygène : elle t'est arrachée des mains et va se coller à la machine. L'aimant n'était pas éteint — il reste sous champ jour et nuit : un fil supraconducteur dans un bain d'hélium liquide, où le courant tourne tout seul. L'arrêt d'urgence coupe la machine, pas le champ. Seul l'autre bouton, sous son capot — l'arrêt de l'aimant — le fait tomber en quelques secondes : le fil chauffe, l'hélium bout, se dilate sept cents fois et file dehors par le tube de quench. Sourcé : l'arrêt d'urgence électrique ne coupe pas le champ, l'arrêt de l'aimant le fait tomber « within seconds », on le presse si une personne est coincée et en danger (Siemens Healthineers) ; 1,5 tesla ≈ 30 000 fois le champ terrestre ; hélium à −269 °C ; dilatation ≈ 700 fois.

- **Personne n'est blessé à l'image.** La personne coincée (`victim`) est un mannequin de verre retenu contre la machine par la bouteille : immobile, entier, et libéré à la fin.
- Les accidents réels (2001, 2018, 2025) ne sont ni nommés ni reconstitués.
- Aucun chiffre à l'écran en dehors de l'en-tête et des étiquettes écrites ci-dessous : pas de volume d'hélium, pas de prix précis, pas de durée de chute du champ.
- L'ordre des causes est celui-ci, et pas un autre : **le fil chauffe → l'hélium bout → il sort par le tube → le champ tombe**.

## L'en-tête : un teslamètre

- **`tesla`** (en grand) : le champ au centre du tunnel. 1,5 pendant tout le film, signal ; il ne descend à 0 qu'une fois, sur « le champ tombe » — et passe alors en veille (`main.js` le fait). **`seen`** dit seulement combien de ses lignes on DESSINE (le champ est là même à 0) : monte-le quand la phrase parle du champ, baisse-le quand il gênerait la lecture.
- Le second compteur, « Machine », lit **`power`** : « En marche » / « Arrêtée ». « Arrêtée » sous « 1,5 T », c'est tout le film en un coup d'œil : c'est l'image de « Le champ, lui… ne bouge pas ».

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 320 pour la machine, ≈ 700 pour la salle, ≈ 60 sur la boîte à boutons, `SIZE` sur l'établi, ≈ 500 au-dessus du toit).
- **Couleurs** : signal est la menace — le champ de l'aimant (ses lignes, sa traction, le compteur), ce qu'il projette ; veille est le système vivant — l'hélium, le bouton d'arrêt de l'aimant, le champ qui tombe ; ink est le reste, les voyants de la machine et le courant qui tourne compris. `mood` 1 dans la salle tant que le champ est là, 0 sur l'établi au repos et dès qu'il est tombé. Jamais à mi-chemin plus d'une demi-seconde.
- Toi, de près, es un mannequin de verre : jamais en très gros plan, jamais la main seule.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **30 images lues au plus.** Journal : `docs/journal/017-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-30000` (1,5 tesla / 30 000 fois la Terre) · `chip-fer` (Objet en fer / Projectile) · `chip-coince` (Objet lourd / Quelqu'un coincé) · `chip-bruit` (Le bruit / Bobines de gradient) · `chip-269` (Hélium liquide / Moins 269 degrés) · `chip-silence` (Silencieuse / Pas éteinte) · `chip-champ` (Machine arrêtée / Champ intact) · `chip-capot` (Sous son capot / Arrêt de l'aimant) · `chip-700` (L'hélium devient gaz / 700 fois plus de place) · `chip-libre` (Champ : zéro / Libéré) · `#retitle` (Une IRM silencieuse : « Est éteinte » barré → « Tire encore ») · `chip-cout` (Vider l'hélium / Dernier recours) · `#net` · `#next` (Prochain dossier · 018 — « Elle siffle. Et si elle ne siffle plus ? ») · `chip-perso` (Arrêt de l'aimant / Réservé au personnel) · `chip-poches` (Avant d'entrer / Poches vides) · `#cta-field` (« Tu as déjà passé une IRM ? » → « OUI », 3 lettres) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `014-abs/src/acte2.js`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

En UN mouvement si possible (la machine → toi à la porte → la bouteille qui part → la bouche du tunnel → dedans, le courant → la boîte à boutons ; puis la salle entière → les objets → la personne coincée → la machine seule). Une coupe est permise là où le mouvement ferait plus d'un quart de tour (au plus deux dans l'acte). C'est toi qui règles `POSE0` et `FIRST` : rends-les dans ton message final, prêts à coller.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, `FIRST` : la machine silencieuse, la bouche de son tunnel vers nous ; dans l'encadrement de la porte, toi, la bouteille dans les bras ; quelques lignes de champ à peine visibles (`seen` 0,3). **Ça bouge dès l'image 1** : la caméra glisse, les lignes gagnent du terrain. La première image doit arrêter le pouce sans texte. |
| `silent` | « L'IRM s'est tue. » | la machine, ses voyants allumés, immobile (`knock` 0) ; la caméra va d'elle vers la porte |
| `enter` → `bottle` → `ripped` | « Tu entres… et ta bouteille d'oxygène t'est arrachée des mains. » | toi dans l'encadrement ; sur « bouteille » `seen` 0,3 → 0,8 : les lignes atteignent la porte ; sur « arrachée » : `bottle` 0 → 1 en une demi-seconde — elle vole, tourne, se colle à la bouche du tunnel ; la caméra la suit (ou coupe sur `VIEW.mouth` à l'impact) ; une lumière qui a un endroit, à l'impact |
| `magnet` → `daynight` | « Son aimant reste allumé, jour et nuit. » | depuis la bouche : `xray` 0 → 0,7, dedans les bobines, `spin` 0 → 1 : le courant qui tourne ; l'en-tête (1,5 T) répond |
| `sauf` → `button` → `notstop` | « En urgence, un seul bouton l'éteint… et ce n'est pas l'arrêt d'urgence. » | recul vers la boîte à boutons près de la porte (`VIEW.box`) : `litButtons` ; sur « pas » : `spot` 1, `reach` 1 — ta main sur l'arrêt d'urgence, et l'en-tête ne bouge pas : l'image TIENT |
| `toscene` → `tesla` → `earth` | « 1,5 tesla : 30 000 fois le champ de la Terre. » | la salle entière (`VIEW.room`), `xray` 0 : `seen` → 1, les lignes emplissent la pièce, passent la ligne au sol ; `chip-30000` |
| `iron` → `missile` | « Ici, le moindre objet en fer devient un projectile… » | sur « fer » : `loose` 0 → 1 — des clés, des ciseaux, un stylo quittent le chariot et filent vers l'aimant (au ralenti) ; `chip-fer` |
| `pinned` | « et un objet lourd peut coincer quelqu'un contre la machine. » | `VIEW.mouth` : `victim` 0 → 1 ; l'image tient ; `chip-coince` |
| `back` → `tosystem` | *(silence)* | recul vers `VIEW.system` : `shell` → 0,25, `you` → 0, `victim` → 0, `loose` → 0, `bottle` → 0, `carry` → 0, `line` → 0, `seen` → 0, `mood` → 0 à la fin : il ne reste que la machine |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` → `explode` | « Alors… on l'ouvre. » | `benchCut` de `VIEW.system` vers `VIEW.whole`, `BENCHED` ; sur « on » : `cover` 1 → 0 (les capots s'en vont), `explode` 0 → 1, recul vers `VIEW.exploded` |
| `p1` | « Un tunnel. » | `litBore` |
| `p2` → `noise` | « Des bobines qui cognent : le bruit, c'est elles. » | `litGradients` ; `knock` 0 → 1 → 0 : elles cognent, on le voit ; `chip-bruit` |
| `p3` → `p4` → `helium` | « Et autour, le vrai aimant : du fil, noyé dans l'hélium liquide. » | `explode` → 0 (remontée, capots enlevés), `xray` 1 : les bobines (`litMagnet` sur « aimant ») ; sur « l'hélium » : `litHelium`, le bain se voit, veille |
| `torepos` → `cold` → `noresist` → `alone` → `noplug` | « À moins 269 degrés, ce fil n'a plus de résistance : le courant y tourne tout seul, sans prise. » | de près sur les bobines dans leur bain ; `chip-269` ; sur « tourne » : `spin` 0 → 1 ; sur « sans prise » : `power` 1 → 0 — les voyants de la machine s'éteignent, le courant tourne toujours, l'en-tête reste à 1,5 T ; puis `power` → 1 |
| `quiet` → `noff` | « Silencieuse… ne veut pas dire éteinte. » | recul : les capots reviennent (`cover` 1, `xray` 0), la machine entière, muette ; `seen` 0 → 0,6 : ses lignes reviennent autour d'elle ; `chip-silence` |
| `toseuil` | « Abonne-toi : cet aimant toujours allumé, regarde comment on l'éteint. » | `followCall` (voir `kit/lib/blocks.js` : les chevrons `#rail-seuil`, le nom du compte s'allume) ; **le film ne s'arrête pas** : la caméra part déjà vers la boîte à boutons, sur son poteau à côté de la machine (`BOX.bench`) |

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `stuck` | « Quelqu'un est coincé. » | **coupe** : la salle, `VIEW.mouth` — `{ ...STAGED, bottle: 1, carry: 0, victim: 1, seen: 0.8, spot: 1 }` ; `mood` 1 |
| `estop` → `machineoff` | « Tu frappes l'arrêt d'urgence : la machine s'éteint. » | **coupe** : la boîte (`VIEW.box`) : `reach` 0 → 1, `estop` 0 → 1 sur « d'urgence » ; sur « s'éteint » : `power` 1 → 0 — **coupe** sur la machine, ses voyants s'éteignent ; l'en-tête : « Arrêtée » |
| `fieldon` → `stillon` | « Le champ, lui… ne bouge pas. » | `VIEW.mouth` : la bouteille toujours plaquée, les lignes toujours là (`seen` 1), l'en-tête toujours à 1,5 T, signal — l'image TIENT ; `chip-champ` |
| `toreponse` → `other` → `hood` → `trigger` | « L'autre bouton, sous son capot : l'arrêt de l'aimant. » | **coupe** : la boîte, de près : `litButtons` ; sur « capot » `flap` 0 → 1 ; `reach` 1 → 2 ; sur « l'arrêt » (`trigger`) : `mstop` 0 → 1 ; `chip-capot` |
| `warms` → `boils` | « Le fil chauffe, l'hélium bout, » | **coupe** : la machine dans la salle, `xray` 1, `shell` 0,3 : `hot` 0 → 1 (une portion tiède qui gagne le long du fil), puis `boil` 0 → 1 sur « bout » |
| `expands` → `vent` → `tube` | « se dilate sept cents fois, file dehors par un tube… » | la caméra monte le long du tube (`litPipe`), traverse le plafond, sort au-dessus du toit (`VIEW.roof`, `sky` 1) : `plume` 0 → 1, le nuage blanc et froid jaillit ; `helium` 1 → 0,15 ; `chip-700` |
| `falls` → `seconds` | « et le champ tombe, en quelques secondes. » | **coupe** : `VIEW.mouth` : `tesla` 1,5 → 0 (l'en-tête décompte et passe en veille à 0), `seen` 1 → 0, `spin` → 0 ; `victim` 1 → 0 : la personne est libre ; `mood` → 0 sur « tombe » ; `chip-libre` |

## Fin — `fin.js` (`toverdict` → la fin)

Compare ta dernière image à la première (`look` aux deux instants) : elle doit être la même. `D.commit` prévient dans la console si un nombre de l'état n'est pas revenu — `look` ne l'affiche pas : relis `D.first`.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `notoff` → `verdict` → `cost` → `last` | « Voilà le secret : une IRM qui se tait n'est pas éteinte. L'éteindre d'un coup, c'est la vider… des dizaines de milliers d'euros. Le dernier recours. » | **coupe** : l'établi, la machine ouverte (`cover` 0, `xray` 1), après le quench : `helium` 0,15, `tesla` 0, `spin` 0, `plume` 0,3 au bout de son tube ; `retitle` : « Est éteinte » barré sur `notoff`, « Tire encore » sur `verdict` ; `D.verdict(verdict)` ; sur « vider » la caméra descend sur la cuve vide ; `chip-cout` sur `last` |
| `tocta` → `keys` | « Like. Pour celui qui entrera un jour dans cette salle… avec ses clés en poche. » | **coupe** : la salle, un autre jour (`STAGED`, `carry` 0) : la machine sous champ, toi dans l'encadrement, mains vides ; sur « clés » `loose` 0 → 0,4 : au fond, sur le chariot, les clés se soulèvent ; `likeCall` |
| `toabo` → `next` → `nomore` | « Abonne-toi. Prochain dossier : ta cocotte-minute… » | **coupe** : l'établi, la machine entière (`BENCHED`) ; on s'en approche jusqu'à ce qu'elle occupe la moitié de la largeur ; `nextFile` |
| `tocomment` → `thatbutton` → `notyou` → `staff` → `danger` | « Et ce bouton ? Il n'est pas pour toi : le personnel le presse si quelqu'un est coincé, en danger. » | même établi, de près sur la boîte à boutons : `litButtons` ; sur « personnel » `flap` 0 → 1 → 0 ; `chip-perso` |
| `form` → `pockets` → `ask` → `answer` | « Toi, ta sécurité, c'est le questionnaire… et des poches vides. En commentaire : tu as déjà passé une IRM ? » | **coupe** : la porte de la salle, toi, mains vides (`carry` 0), la ligne au sol devant toi (`line` 1) ; `chip-poches` ; `commentCall` (`chars` 3) |
| `toloop` → `rewind` | « Parce que cet aimant tire encore, même quand… » | **coupe** : `STAGED` ; `D.loop` ramène tout à `FIRST` et à `POSE0` : la machine se tait, tu es à la porte, la bouteille dans les bras |

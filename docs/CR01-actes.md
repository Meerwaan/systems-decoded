# CR01 · Tchernobyl — le plan de mise en scène

**Premier « Compte à rebours ».** Pas un dossier : pas de « Alors… on l'ouvre », pas d'éclaté, pas d'établi, pas de like. La mécanique, c'est le temps ; le cœur du film, c'est **le défaut de la sécurité** : le bouton d'arrêt d'urgence dont les barres, en entrant, accélèrent d'abord le bas du cœur. Recette : `docs/recette-compte-a-rebours.md` ; la DA « reconstitution » : `docs/reconstitution.md` (maquettes d'argile, une lumière dure, une seule pièce rouge, **pas de vert avant `depuis`**). Exigence n° 1 de Merwan (04/11) : **« que le rendu soit synchronisé avec le script et que ce qui est dit soit à l'écran, expliqué aussi »**.

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **150,6 s**, 19 beats) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues`, ≈ 140, vérifiés un par un sur la table ; image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; les secondes ci-dessous ne servent qu'à te repérer (`npm run script -- CR01`). Attention aux repères qui attrapent la forme dite : `t6:vingt` tombe sur « vingt-trois » (77,71) — utilise le repère `vingt` (83,84) ; `defaut:frein` tombe sur « freine » — utilise `frein`.

Cinq fichiers, un agent chacun : `acte1.js`, `acte2.js`, `acte2b.js`, `acte3.js`, `fin.js` (aujourd'hui des squelettes : à réécrire en entier). Chacun n'écrit que `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` (l'état `FIRST`, les poses `VIEW`, `STAGED` par maquette, `BENCHED` pour la barre seule). Forme : `episodes/025-esp/src/acte*.js` ; outillage `kit/lib/direct.js` ; blocs `kit/lib/blocks.js` (`duelCall`, `nextFile`) ; la reconstitution `kit/lib/reconstitution.js`. Les poses qui cadrent vraiment sont dans les journaux des décors (`docs/journal/CR01-canal.md`, `-coeur.md`, `-centrale.md`, `-salle.md`) : pars d'elles ; `VIEW` n'est qu'un point de départ réglé sur bouchons. Les « À ne pas dire » : `docs/faits/CR01-tchernobyl.md` § 12.

## Les quatre maquettes et l'état

`S.set` choisit la maquette montrée (`SET.COEUR` 0 · `CANAL` 1 · `CENTRALE` 2 · `SALLE` 3) ; une coupe change de maquette avec `cut(at, SET.X, VIEW.y, { ...STAGED.x, … })`. **`fault` allume en rouge la pièce en défaut de la maquette montrée** : cœur → la moitié basse de l'empilement ; canal → le déplaceur de graphite ; centrale → la vanne du refroidissement de secours ; salle → le bouton AZ-5. **Une pièce rouge à la fois** ; `fault` 0 tant que la phrase ne désigne pas le défaut. `depuis` 0 → 1 : la lumière change (`recon.setMood`) et la barre du canal passe du rouge au vert (`heal`) — à partir du beat `depuis`, et seulement là. Les nombres de chaque maquette : `docs/CR01-decors.md` (tables). Mêmes nombres, même lecture d'une maquette à l'autre : `pLow` / `pHigh` (la puissance, bas / haut du cœur, 0 … 1) dans le cœur et le canal ; `rodsIn` / `scram` dans le cœur et sur le tableau de la salle.

## L'en-tête (déjà monté dans `main.js` : n'y touche pas)

L'heure réelle, en grand, **saute 0,17 s avant chaque étape** (dans le souffle, avec son `clack`) : 01:23:40 (accroche) → 14:00:00 (t1) → 00:28:00 → 01:00:00 → 01:22:30 → 01:23:04 → 01:23:40 (t6) → 01:23:43 (t7) → « 01:23 » (t8 : l'heure des explosions n'est pas figée, la ligne T− s'efface). Dessous, **le temps qui reste jusqu'à l'appui sur AZ-5** (T−0 = 01:23:40) : T−11 h 23 min, T−55 min 40 s, T−23 min 40 s, T−1 min 10 s, T−36 s, T−0 s, T+3 s. Les actes de l'en-tête : 01 L'HEURE (0) · 02 LE DÉFAUT (sur « Sauf que », `acte2b.js`) · 03 DEPUIS (`fin.js`). Le nom du compte s'allume à `depuis` (crHud). **Tu n'écris jamais l'en-tête.**

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration, sur le mot** ; un chiffre que l'image ne montre pas entre en étiquette (`index.html`, une à la fois, place fixe en zone haute : `D.chip(id, null, 96, 470, de, à)`) — leurs instants sont dans les squelettes, garde-les ou améliore-les : `chip-diesel` · `chip-1pct` · `chip-6pct` · `chip-barres` · `chip-20s` · `chip-530` · `chip-bilan` · `chip-1983` · `chip-12s` · `chip-insag1` · `chip-insag7`. Pas de pièce du dossier dans ce film (aucune source ouverte n'en porte une).
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED.x, fault, pLow, … }` : chaque nombre que ta maquette lit) ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe. Coupes posées sur les repères `to…` (0,10–0,14 s avant la phrase).
- **Chaque coupe est un raccord** (forme, objet, mouvement), écrit dans les tables. Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Un nouveau plan ou un changement franc toutes les 2 à 3 s** de 10 à 25 s, puis toutes les 5 à 8 s au plus ; **aucune plage lente de 2 s** au-dessous de 25 s.
- **Le mécanisme suit la voix**, pas une cinématique exacte : la barre descend, l'eau s'en va, la lueur monte SUR les mots. Couleurs franches : `fault` 0 ou 1, jamais à mi-chemin plus d'une demi-seconde.
- **Les mots qui frappent** (`D.punch(t.mot, 0.06)`, un par phrase au plus, jamais sur une coupe, jamais deux à moins d'une seconde, jamais à l'image 0) : `choc` (« accélère », 3,36) · `trap` (« piège », 21,96) · `accelere1` (27,16) · `azcinq` (« AZ-5 », 80,60) · `accelere2` (« le frein accélère », 94,52) · `fleche` (99,28) · `seule` (« Toute seule », 132,22). `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **Le son est posé** (`episode.json` → `sfx`, dans les souffles) : `clack` à chaque saut d'horloge ; `hit` sur les retournements ; `hush` sur « Sauf que… au bout ? » et sur le bilan ; `boom` / `impact` aux explosions ; `sting` à `depuis`. Si tu en veux un de plus, écris-le sous « À changer ailleurs ».
- **Zones** : en-tête 220–412 (ce qui monte derrière se fond dans le noir) · zone haute 436–790 (une étiquette à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête (sans `--bare`).
- Mouvements `sine.inOut`, longs ; plongée ou recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La lumière suit le sujet : `fx fy fz` (déjà dans `STAGED`) et `fs` (≈ 110 le cœur, ≈ 60 un gros plan du canal, ≈ 190 la centrale).
- **`dof`** : seules les poses qui étalent `CLOSE` (gros plans) ; tout le reste `dof: 0`.
- Personne n'appuie sur AZ-5 à l'image (la voix ne prête l'appui à personne) ; aucun visage ; aucun chiffre de dalle, d'angle, de longueur de barre ; jamais « barre en graphite » (c'est le **déplaceur**).
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée. S'il t'en manque un, « À changer ailleurs ». Les étiquettes sont en capitales : aucune unité à symbole nouvelle. **26 images lues au plus.** Journal : `docs/journal/CR01-<ton fichier>.md`. Planches et `essais.json` dans `.cache/planches/CR01/<ton fichier>/`, jamais dans `renders/`.

## La boucle

La dernière phrase (« Comme ici à… », `boucle`) retombe sur « 01 h 23 » : `fin.js` coupe à `toloop` dans le cœur, à l'état `FIRST`, un peu plus loin que `POSE0`, et `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène la caméra sur `POSE0`. **La dernière image est la première** : tire les deux côte à côte.

---

## acte1.js — 01 L'HEURE : accroche → piege (0 → `tot1` 28,95)

Part de `POSE0` et `FIRST` (le cœur), sans coupe ; quatre coupes au plus. Rend la main à `tot1` (l'acte 2 coupe sur la centrale).

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| 0 → `promesse` 4,35 | « 01 h 23. Arrêt d'urgence… et ton réacteur accélère. » | `POSE0`, `FIRST` : le cœur en contre-plongée, **les barres descendent déjà** (`scram` 0,12 → 0,22, `"none"`, dès l'image 1), le bas rouge respire et monte ; la caméra pousse lentement. Sur « accélère » (`choc` 3,36) : `pLow` → 1 d'un coup (`power2.in`, 0,3 s), `D.punch`. Le cœur ≈ 60 % de la largeur |
| `promesse` → `bouton` 8,02 | « C'est Tchernobyl. Tout est vrai, minute par minute. » | même plan, recul par rapport vers `VIEW.coeur` : le cœur entier, la dalle, la cuve (≈ 50 %) ; les barres continuent leur lente descente |
| `bouton` → `toprincipe` 10,71 | « Mais pourquoi le bouton qui devait tout arrêter… a fait l'inverse ? » | **coupe** (raccord : des barres qui descendent au geste qui les a lancées) : la salle, `VIEW.az5`, `STAGED.salle`, `fault` 0 : le bouton, ≈ 30 % ; il s'enfonce sur « arrêter » (`az5` 0 → 1) ; sur « l'inverse » (`inverse` 9,93) il passe au rouge (`fault` 0 → 1, 0,2 s) |
| `toprincipe` → `toloupe` 12,28 | « D'abord, comment ça marche. » | **coupe** sur le canal entier (`VIEW.canal`, `STAGED.canal`, `fault` 0, `rod` 0, `flux` 0, `steam` 0,1, `pLow` = `pHigh` 0,3) : la maquette d'une tranche, ≈ 45 % ; plongée par rapport vers le combustible gauche |
| `toloupe` → `chauffe` 16,16 | « L'uranium se casse et lâche des neutrons, qui cassent d'autres atomes. » | **la loupe** (`VIEW.fuel`, ≈ 50 %), `flux` 1 : sur « casse » le premier noyau se brise (`split` 0 → 0,35), sur « neutrons » les neutrons partent, sur « cassent » la chaîne (`split` → 1) ; `click` déjà posé après « atomes » |
| `chauffe` → `toturbine1` 17,76 | « Ça chauffe l'eau, la vapeur… » | même plan, recul : `steam` 0,1 → 0,6, les bulles montent dans le canal, la lueur du combustible monte (`pLow` = `pHigh` 0,5) |
| `toturbine1` → `tofreiner` 18,50 | « …fait tourner la turbine. » | **coupe** (raccord : la vapeur qui monte → l'arbre qui tourne) : la centrale, `VIEW.turbine`, `spin` 1 : la turbine, ≈ 55 % |
| `tofreiner` → `totrap` 21,03 | « Pour freiner, des barres qui avalent les neutrons. » | **coupe** sur le haut du canal (`VIEW.canalTop`, `flux` 1, `fault` 0) : l'absorbant entre (`rod` 0 → 0,12 de « freiner » à « avalent ») et sur « avalent » les neutrons qui l'atteignent s'éteignent ; ≈ 40 % |
| `totrap` → `eau1` 22,65 | « Et ce réacteur a un piège : » | **coupe** sur le combustible (`VIEW.fuel`, `rod` 0, `steam` 0, `flux` 1, `pLow` = `pHigh` 0,4) ; `D.punch` sur « piège » |
| `eau1` → `changee` 24,56 | « l'eau aussi avale des neutrons. » | les neutrons qui entrent dans l'eau s'y éteignent (le décor le fait selon `steam` 0) ; poussée lente |
| `changee` → `accelere1` 27,16 | « Changée en vapeur, elle en avale moins… » | `steam` 0 → 1 (sine.inOut, jusqu'à « moins ») : la vapeur prend l'anneau, les neutrons passent |
| `accelere1` → `tot1` 28,95 | « …et la réaction accélère. Retiens bien ça. » | sur « accélère » : `pLow` = `pHigh` 0,4 → 0,9 (0,4 s), plus de neutrons ; `D.punch` ; « Retiens bien ça » : la caméra recule et tient (le plan reste vivant : les neutrons volent) |

**Couture de sortie** : canal, `steam` 1, `pLow` = `pHigh` 0,9 — l'acte 2 coupe et repose tout.

## acte2.js — t1 → t3 (`tot1` 28,95 → `tot4` 60,31)

Part d'une coupe complète sur la centrale à `tot1`. Rend la main à `tot4` (l'acte 2b coupe sur la salle).

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot1` → `courant` 32,52 | « La veille, 14 h 00. On prépare un essai de sécurité. » | **coupe** (porte d'étape : l'horloge saute) : la centrale entière (`VIEW.centrale`, `STAGED.centrale`, `fault` 0, `spin` 1, `flow` 1, `mains` 1, `diesel` 0, `feed` 0), ≈ 85 % ; lente plongée vers la turbine |
| `courant` → `diesels` 33,52 | « Si le courant est coupé, » | sur « coupé » (32,90) : `mains` 1 → 0 — la ligne vers le réseau s'éteint |
| `diesels` → `turbine2` 36,60 | « les diesels de secours mettent environ une minute à démarrer. » | glissé par rapport vers les diesels (`VIEW.diesels`, ≈ 45 %) : `diesel` 0 → 0,25 lentement (ils peinent) ; `chip-diesel` |
| `turbine2` → `pompes1` 38,96 | « La turbine, en ralentissant, » | **coupe** sur la turbine (`VIEW.turbine`, ≈ 55 %) : `spin` 1 → 0,6 sur « ralentissant » |
| `pompes1` → `toreport` 40,24 | « peut-elle faire tourner les pompes pendant cette minute ? » | recul par rapport jusqu'aux pompes : `feed` 0 → 1 (le courant court de l'alternateur aux pompes), `flow` tient ; la question reste ouverte à l'image |
| `toreport` → `reseau` 43,08 | « Pour l'essai, on coupe le refroidissement de secours. » | **coupe** sur la vanne (`VIEW.eccs`, ≈ 25 % ; les réservoirs dans le cadre) : sur « coupe » la vanne se ferme et passe au rouge (`fault` 0 → 1) |
| `reseau` → `tot2` 46,15 | « Puis le réseau réclame du courant : tout est repoussé… à la nuit. » | recul vers la ligne (`VIEW.mains`) : `mains` 0 → 1 (le réseau tire), `fault` → 0 hors cadre ; sur « nuit » la caméra s'élève, la table s'enfonce dans le noir |
| `tot2` → `toxenon` 49,64 | « 00 h 28. La puissance s'effondre : à peine un pour cent. » | **coupe** sur le cœur (`VIEW.coeur`, `STAGED.coeur`, `fault` 0, `pLow` = `pHigh` 0,5, `rodsIn` 0,8, `scram` 0), ≈ 55 % : sur « s'effondre » la lueur tombe à 0,03 (`power2.in`, 0,6 s) ; `chip-1pct` |
| `toxenon` → `tot3` 53,09 | « Le xénon, un gaz qui avale les neutrons, freine sa remontée. » | **coupe** sur le combustible (`VIEW.fuel`, `flux` 1, `pLow` = `pHigh` 0,05, `steam` 0,2) : sur « xénon » les grains sombres apparaissent (`xenon` 0 → 1) ; sur « avale » ils mangent les neutrons ; sur « freine » la lueur, qui voulait remonter, retombe |
| `tot3` → `encore1` 56,08 | « 01 h 00. Pour le relancer, on retire des barres. » | **coupe** sur le cœur (`VIEW.coeur`, `rodsIn` 0,8, `pLow` = `pHigh` 0,03, `xenon` 0) : sur « retire » des barres remontent (`rodsIn` 0,8 → 0,6) |
| `encore1` → `remonte` 57,64 | « Encore, et encore. » | `rodsIn` → 0,45 sur « Encore », → 0,3 sur « et encore » (`etEncore`) : deux gestes francs |
| `remonte` → `tot4` 60,31 | « Il remonte à six pour cent… avec très peu de barres dedans. » | sur « six » `pLow` = `pHigh` → 0,15 ; `chip-6pct` ; sur « peu » `rodsIn` → 0,25 et la caméra plonge sur les barres qui restent (≈ 60 %) |

**Couture** : entrée centrale (`spin` 1) ; sortie cœur, `rodsIn` 0,25, `pLow` = `pHigh` 0,15.

## acte2b.js — t4 → t6 et « Sauf que… au bout ? » (`tot4` 60,31 → `tocanal` 86,54)

Part d'une coupe complète sur la salle à `tot4`. Allume l'acte 02 de l'en-tête sur « Sauf que » (`setAct(tl, 2, t.defaut)`). Rend la main à `tocanal` **sur le pied d'une barre** (l'acte 3 coupe sur le même pied, dans le canal).

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot4` → `toprot` 65,24 | « 01 h 22. Il reste l'équivalent de huit barres. Le règlement en exige quinze au moins. » | **coupe** sur le tableau des barres (`VIEW.board`, `STAGED.salle`, `fault` 0, `rodsIn` 0,25, `scram` 0, `prot` 1, `crew` 1), ≈ 60 % : peu de cadrans allumés ; `chip-barres` (« Minimum : 15 » peut entrer sur `quinze`) |
| `toprot` → `tot5` 68,48 | « Plusieurs protections sont coupées. Et l'essai est lancé quand même. » | **coupe** sur les clés (`VIEW.keys`) : `prot` 1 → 0, une à une sur « protections sont coupées » ; puis recul par rapport sur la salle entière (`VIEW.salle`) : les silhouettes, le pupitre — « quand même » |
| `tot5` → `pompes2` 72,66 | « 01 h 23 zéro quatre. L'essai commence : la turbine ralentit, » | **coupe** sur la turbine (`VIEW.turbine`, `STAGED.centrale`, `fault` 0, `spin` 1, `flow` 1, `feed` 1) : sur « ralentit » `spin` 1 → 0,35 (sine.out, jusqu'à `tofuel5`) |
| `pompes2` → `tofuel5` 73,48 | « les pompes aussi. » | glissé vers les pompes : `flow` 1 → 0,5 |
| `tofuel5` → `tot6` 77,59 | « L'eau bout davantage… et souviens-toi : plus de vapeur, plus de puissance. » | **coupe** (raccord : le débit qui faiblit → le canal) sur le combustible (`VIEW.fuel`, `STAGED.canal`, `fault` 0, `flux` 1, `steam` 0,3, `pLow` = `pHigh` 0,15) : sur « bout » `steam` → 0,8 ; sur « vapeur » / « puissance » la lueur → 0,45, les neutrons se multiplient (le rappel de `piege`, même cadre) |
| `tot6` → `tobarres` 81,84 | « 01 h 23 quarante. Arrêt d'urgence : le bouton AZ-5. » | **coupe** sur le bouton (`VIEW.az5`, `STAGED.salle`, `fault` 1, `az5` 0, `prot` 0), ≈ 30 % : il s'enfonce seul sur « AZ-5 » (`az5` 0 → 1, 0,15 s) ; `D.punch` |
| `tobarres` → `defaut` 84,68 | « Les barres descendent. Il leur faut près de vingt secondes. » | **coupe** sur le cœur (`VIEW.coeur`, `STAGED.coeur`, `fault` 0, `pLow` = `pHigh` 0,45, `rodsIn` 0,25, `scram` 0) : `scram` 0 → 0,06 en `"none"` jusqu'à `tocanal` (c'est lent) ; `chip-20s` sur `vingt` ; la caméra choisit UNE barre et descend avec elle |
| `defaut` → `tocanal` 86,54 | « Sauf que… tu sais ce qu'il y a au bout ? » | `setAct(2)` ; `hush` déjà posé ; la caméra plonge jusqu'au pied de cette barre, dans la coupe (≈ 35 %) — la question reste sans réponse à l'image |

## acte3.js — 02 LE DÉFAUT : le plan maître, 530 MW, les explosions (`tocanal` 86,54 → `toissue` 112,28)

Part d'une coupe complète dans le canal à `tocanal`, **sur le pied du déplaceur** (raccord de forme avec le pied de barre de l'acte 2b). **Le plan maître est UN plan**, de `tocanal` à `tot7` : on ne coupe pas pendant qu'il démontre.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tocanal` → `entrant` 89,00 | « Du graphite, sous la partie qui freine. » | `VIEW.canalLow`, `STAGED.canal`, `rod` 0, `flux` 1, `steam` 0,6, `pLow` = `pHigh` 0,45, `fault` 0 : le pied du déplaceur au-dessus de la colonne d'eau du bas (≈ 40 %) ; **sur « graphite » il passe au rouge** (`fault` 0 → 1) ; sur « partie qui freine » la caméra remonte le long de la barre jusqu'à l'absorbant, puis recule par rapport vers `VIEW.canal` (la tranche entière, ≈ 45 %) |
| `entrant` → `avalait` 91,52 | « En entrant, il chasse l'eau du bas du cœur, » | `rod` 0 → `ROD.expel` (0,18) de « entrant » à « cœur » (sine.inOut) : le pied rouge descend et **l'eau du bas s'en va, poussée dehors** — elle a disparu sur « bas » |
| `avalait` → `alors` 92,64 | « l'eau qui avalait les neutrons. » | en bas, les neutrons ne s'éteignent plus (ils s'éteignaient dans cette eau au début du plan : c'est le contraste qui explique) |
| `alors` → `tot7` 95,34 | « Alors pendant quelques secondes… le frein accélère. » | `pLow` 0,45 → 1 (`power2.in`, jusqu'à « accélère ») : le bas brille et fourmille ; `pHigh` 0,45 → 0,15 : le haut s'éteint sous l'absorbant ; `D.punch` sur « accélère » (`accelere2`). **L'image se lit sans le son : le haut freine, le bas s'emballe** |
| `tot7` → `surchauffe` 100,20 | « 01 h 23 quarante-trois. Plus de 530 mégawatts, et ça monte en flèche. » | **coupe** (raccord : le bas qui brûle → le bas du cœur) : `VIEW.coeurBottom`, `STAGED.coeur`, `fault` 1, `pLow` 0,8, `pHigh` 0,3, `rodsIn` 0,25, `scram` 0,15 (≈ 55 %) ; `chip-530` ; « en flèche » : `pLow` → 1, `pHigh` → 0,9 (`power3.in`), `D.punch` sur « flèche » |
| `surchauffe` → `tot8` 102,64 | « Le cœur surchauffe… les barres se bloquent avant le fond. » | `scram` 0,15 → 0,4 puis **arrêt net sur « bloquent »** (`D.jolt`) — les barres immobiles à mi-course, sous la lueur |
| `tot8` → `dalle` 106,58 | « Toujours 01 h 23. Les tubes éclatent, la vapeur explose. » | **coupe** au large (`VIEW.slab`, ≈ 70 %), même état : sur « éclatent » `blast` 0 → 0,6 (jets de vapeur), sur « explose » → 1 |
| `dalle` → `seconde` 109,72 | « La dalle du réacteur, un disque géant, se soulève. » | la caméra s'élève avec la dalle ; sur « soulève » `slab` 0 → 1 (`power2.out`) — la dalle entière, sous l'en-tête |
| `seconde` → `toissue` 112,28 | « Une seconde explosion. Le graphite prend feu. » | sur « explosion » `blast2` 0 → 1 ; sur « graphite » `fire` 0 → 1 : les braises montent |

## fin.js — l'issue, 03 DEPUIS, la question, le prochain, la boucle (`toissue` 112,28 → 150,6)

Part d'une coupe complète à `toissue`. Allume l'acte 03 à `todepuis` (`setAct(tl, 3, t.todepuis)`). **Rien du sujet ne revient après l'annonce** ; dernière image = première.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `toissue` → `topire` 116,34 | « Deux morts cette nuit-là. 28 pompiers et employés dans les mois suivants. » | **coupe** sur le cœur après (`VIEW.slab` reculé, `fault` 1, `slab` 1, `blast` 0, `blast2` 1, `fire` 0,5 → 0,3), sobre, immobile ou presque ; `chip-bilan` ; `hush` déjà posé |
| `topire` → `todepuis` 122,49 | « Et le pire ? Cet effet des barres, on l'avait déjà vu trois ans plus tôt. Les parades n'avaient pas été appliquées. » | **coupe** sur la barre (`VIEW.canal` puis plongée vers le déplaceur, `STAGED.canal`, `fault` 1, `rod` 0,18, `flux` 0, `pLow` = `pHigh` 0,3) : le pied rouge, seul objet qui émet ; `chip-1983` sur « trois » |
| `todepuis` → `tofrance` 127,68 | « Depuis, ces barres ont été redessinées : plus d'eau sous le graphite, douze secondes au lieu de 18. » | **coupe** sur la barre seule (`VIEW.rodSolo`, `BENCHED`, `fault` 1, `depuis` 0) — **la seule pièce qui passe du rouge au vert** : `depuis` 0 → 1 de « redessinées » à « graphite » (la lumière et la barre ensemble), `newRod` 0 → 1 sur « plus d'eau sous le graphite » ; `chip-12s` sur « douze » ; la barre peut glisser vite vers le bas (`rod` 0 → 0,6) pour dire « douze secondes » |
| `tofrance` → `tocta` 132,81 | « En France, nos réacteurs font l'inverse : quand l'eau chauffe, la réaction ralentit. Toute seule. » | **coupe** (raccord : la barre verte → le crayon) sur `VIEW.fuel`, `STAGED.canal`, `depuis` 1, `rep` 1, `fault` 0, `flux` 1, `steam` 0, `pLow` = `pHigh` 0,6 : sur « chauffe » `steam` → 1 ; sur « ralentit » la lueur → 0,15, les neutrons se raréfient ; `D.punch` sur « Toute seule » |
| `tocta` → `tomachine` 134,72 | « La première enquête a accusé les hommes. » | **coupe** sur la salle (`VIEW.salle`, `STAGED.salle`, `depuis` 1, `fault` 0, `crew` 1) : les silhouettes ; `chip-insag1` |
| `tomachine` → `commentaire` 137,44 | « La seconde, surtout la machine. » | **coupe** sur le cœur entier (`VIEW.coeur`, `depuis` 1, `fault` 0, `pLow` = `pHigh` 0,2, `slab` 0) ; `chip-insag7` |
| `commentaire` → `toabo` 140,07 | « Et toi, en commentaire : les hommes… ou la machine ? » | `duelCall` (`aAt` = `duelA` 138,40, `bAt` = `duelB` 139,12, **`toneA: null, toneB: null`** — le défaut de `duelCall` allume B en vert : ce serait répondre à la place du spectateur) ; image : la salle entière où se voient les silhouettes ET le tableau (`VIEW.salle`), lente |
| `toabo` → `toloop` 148,81 | « Abonne-toi : chaque compte à rebours, un vrai accident, et une sécurité qui lâche. Prochain : Deepwater Horizon, une vanne qui se ferme… sans sceller le puits. » | un large calme du cœur, en lumière `depuis` ; chevrons `rail-follow` dès « Abonne-toi » ; `nextFile` : le panneau sur `deepwater`, le fait sur `vanne`, sorti 0,38 s avant `toloop` |
| `toloop` → fin | « Comme ici à… » | **coupe** dans le cœur, état `FIRST` (`fault` 1, `depuis` 0), un peu plus loin que `POSE0` ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` |

---

## La première image — quatre candidates

**« 01 h 23. Arrêt d'urgence… et ton réacteur accélère. »** L'image 0 montre l'événement en cours : les barres qui entrent par le haut, le bas du cœur qui s'allume rouge. Sans texte, à 270 px, et elle bouge dès l'image 1 **par son sujet** (les barres descendent, la lueur monte). Tirées sur le vrai décor (après `coeur.js`, `canal.js`, `salle.js`), choisies AVANT les actes ; la gagnante devient `POSE0`. Notes sur bouchons, sur les six points (événement · perspective basse · menace derrière · forme reconnue sur 40 % · système là · bouge par le sujet) :

- **(a) Contre-plongée sous le cœur** (`POSE0` provisoire) — ✓ · ✓ · ½ (le rouge est au bas du sujet, pas derrière : mettre la lueur du bas en fond, le pied des barres devant) · ½ (« un cœur de réacteur » ne se reconnaît pas en un tiers de seconde : la dalle-disque et les barres doivent le dire) · ✓ · ✓ — **4,5 / 6, recommandée**.
  `{ "at": 0.02, "label": "a contre-plongee", "pose": { "tx": 0, "ty": 66, "tz": 0, "d": 430, "az": -66, "el": -4, "fov": 40, "shift": 210, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "set": 0, "fx": 0, "fy": 80, "fz": 0, "fs": 110, "fault": 1, "pLow": 0.85, "pHigh": 0.3, "rodsIn": 0.25, "scram": 0.12 } }`
- **(b) Le plan maître du canal** — ✓ · ✗ (de face à mi-hauteur) · ½ · ✗ (un schéma, pas une forme connue) · ✓ · ✓ — 3,5 / 6 ; c'est la couverture, pas l'accroche.
  `{ "at": 0.02, "label": "b canal", "pose": { "tx": 4000, "ty": 125, "tz": 0, "d": 1100, "az": -62, "el": 6, "fov": 30, "shift": 230, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "set": 1, "fx": 4000, "fy": 120, "fz": 0, "fs": 120, "fault": 1, "rod": 0.18, "pLow": 1, "pHigh": 0.2, "steam": 0.6, "flux": 1 } }`
- **(c) Le bouton AZ-5, au ras du pupitre** — ✓ (il s'enfonce) · ✓ (el bas) · ½ (le tableau des barres derrière, ses cadrans qui descendent) · ✓✓ (un bouton d'urgence rouge : instantané) · ½ (les barres seulement sur le tableau) · ½ (le geste est petit) — 4 / 6 ; la plus lisible, la moins « réacteur ».
  `{ "at": 0.02, "label": "c bouton", "pose": { "tx": 138, "ty": 100, "tz": -4046, "d": 120, "az": -70, "el": 8, "fov": 34, "shift": 160, "side": 0, "roll": 0, "drift": 0, "dof": 6 }, "state": { "set": 3, "fx": 200, "fy": 110, "fz": -4000, "fs": 220, "fault": 1, "az5": 0.6, "rodsIn": 0.25, "scram": 0.15 } }`
- **(d) Le cœur de trois quarts haut** — ✓ · ✗ · ✗ · ½ · ✓ · ✓ — 3 / 6 (une fiche produit : le contre-exemple du 012).
  `{ "at": 0.02, "label": "d coeur haut", "pose": { "tx": 0, "ty": 85, "tz": 0, "d": 600, "az": -58, "el": 22, "fov": 30, "shift": 160, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "set": 0, "fx": 0, "fy": 80, "fz": 0, "fs": 110, "fault": 1, "pLow": 0.85, "pHigh": 0.3, "rodsIn": 0.25, "scram": 0.12 } }`

Si (a) l'emporte, l'acte 1 la garde jusqu'à « accélère », puis recule. Si c'est (c), l'acte 1 commence dans la salle et coupe sur le cœur à `promesse` (et la boucle revient dans la salle : `fin.js` coupe alors sur `VIEW.az5`).

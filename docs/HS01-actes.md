# HS01 · Ton pare-brise (hors-série) — le plan de mise en scène

**La voix est enregistrée** (64,7 s). Les instants ci-dessous sont ceux de la vraie voix, mais un acte ne les écrit **jamais en dur** : il les lit avec `D.times({ nom: "beat:mot" })` ou les repères d'`episode.json` (`explode` 51,10 · `black` 51,58 · `drop` 46,48 · `verdict` 57,83 · `toloop` 60,96 · `rewind` 61,67) ; `npm run script -- HS01` donne la table. Un repère `beat:mot` cherche aussi au début des mots et dans les nombres dits : vérifie le tien sur la table.

Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des bouchons qui font tourner le film) et n'écrit que des `st` / `now` / `shot` / `cut` / `tl` contre `src/world.js` (outillage : `kit/lib/direct.js`). **Personne ne touche à `world.js`, `main.js`, `index.html`, ni au L01, ni au kit** : un besoin là = un message à celui qui orchestre.

## Le monde : celui du L01, tel quel

`world.js` construit le monde du L01 (`episodes/L01-pare-brise/src/world.js` → `car.js`, `verre.js`, `casse.js`, `dossier.js`, `kit/lib/usine.js`, `postes.js`) sans `landscape.js` ni chapitres. Donc :

- **Les lieux** : `SET.CAR` (la voiture du 011 aux rayons X, toi en verre, le pare-brise plein), `SET.LINE` (l'usine, une seule chaîne le long de +x : four −120→1000, bain 1060→2700, découpe 5000, impression 5700, bombage 6600, salle blanche 7900, autoclave 9300, essais 10900→12400 — `ST` de `plan.js`, réexporté), `SET.BENCH` (l'établi), `SET.LAB` (1903). `SET.ROAD` existe, ne sert pas.
- **Les nombres** : la liste fermée est `FIRST` du L01 (lis ses commentaires dans `episodes/L01-pare-brise/src/world.js`, lignes 52-142 : chaque nombre y dit ce qu'il fait) + trois de l'en-tête (ci-dessous). Toute coupe pose un **état complet** : `{ ...AT.car | AT.line | AT.bench | AT.lab, …ce qui diffère }`. `AT.line` a `cut: 0` (pas de pare-brise) : pour un pare-brise fini sur la chaîne, `cut: 1, print: 1, bend: 1, film: 1, sensors: 1` et `pos` = la station.
- **La chaîne tourne** : sur la LINE, appelle `run(D, from, to)` une fois pour ton intervalle (`flow` ne fait que croître ; il est une fonction du temps partout).
- **Couleurs** : signal = la chaleur et la menace (le verre fondu, le ruban, la tête qui tombe) ; veille = le film (PVB, ce qui te garde) ; encre = le reste.
- **Le cadre est vertical.** Les poses du L01 (16:9, cadrées au `side`) sont refaites dans `VIEW` : `side` 0, `shift` ≈ +120 / +160 (monte le sujet vers y ≈ 800), et plus près — un cadre vertical est trois fois moins large. Zones : sujet 440–1160 · zone haute 436–790 (le cartouche `#film`, fin seulement) · rien d'important sous 1600 ni à droite de x 905 entre 880 et 1760. Une ligne de chaîne se lit en vertical **en profondeur** (az ≈ −70 à −80 : elle file vers le fond), pas en travers.

## L'en-tête du hors-série (main.js le lit ; nombres entiers : `now`, jamais `st`)

- **`l01`** → `#hud-clock` « FILM · 01:31 » : l'instant du L01 où vit le plan à l'écran (`L01_AT` dans `world.js`). Chaque coupe le pose ; −1 → « FILM · 8 MIN 51 » (le noir du gag, YouTube).
- **`fils`** → « FILS OUVERTS n », signal : +1 sur le mot qui ouvre chaque fil (tableau ci-dessous), 7 à la fin de `tete`.
- **`yt`** → 1 sur `youtube` : « RÉPONSES · SUR YOUTUBE », veille.
- Actes : `setAct(tl, 1, 0)` (acte1) · `setAct(tl, 2, lancement − 0,15)` (acte2) · `setAct(tl, 3, ouvre − 0,15)` (fin) ; `D.loop` remet l'acte 1 à `toloop`.
- `#black` (sous l'en-tête, qui reste seul allumé) : `tl.set("#black", { opacity: 1 | 0 }, t)` — jamais un fondu. Deux usages, l'un après l'autre : l'impact de la tête (acte3), le gag (fin).

## Ce que tout acte respecte

- **LA règle : rien n'est payé.** Le flacon ne touche jamais le sol (`flask` < 0,9, `star` 0) ; la tête ne touche jamais le verre (`drop` < 1, aucune toile sur l'essai) ; le ruban flotte sur un miroir sombre, aucun mot « étain » ; le tampon se voit, ne se lit pas ; la bande noire : on la montre, on ne dit pas à quoi elle sert ; la vitre qui éclate : le point de nickel peut luire une demi-seconde, **jamais nommé ni étiqueté**.
- **Chaque coupe est un raccord** (forme, objet ou mouvement) — écrit pour chaque plan ci-dessous. Une coupe se pose 0,1 à 0,2 s **avant** le mot qui la motive.
- Un nouveau plan (ou un vrai mouvement) toutes les 2 à 4 s ; ça bouge dès l'image 1.
- Aucun panneau, aucune étiquette : les sous-titres mot à mot (automatiques), l'en-tête, et `#film` à la fin. Cartes d'accroche = `accroche`, `promesse`, `curiosite` (zone 1186–1542 : le sujet au-dessus).
- `look` avant d'écrire une pose : `npm run look -- HS01 --file <essais.json> --out <dossier temporaire du système>` — **jamais dans `renders/`**. 30 images lues au plus par agent. Puis `npm run check -- HS01` doit passer.
- Une pose de `cut` est complète (`tx ty tz d az el fov shift side roll drift`) : pars d'une `VIEW`. Pour une plongée ou un recul, `shot(at, dur, pose, ease, fromD)`.
- Défauts connus en vertical (vus sur les planches) : viser l'impact de près met la caméra **dans ta tête** ; la pose « nickel » du L01 (d 70) met la caméra **dans la portière** ; la toile de la première image monte jusqu'à l'en-tête (au contrôle de contraste, « 02 L'USINE » et « 03 RENDEZ-VOUS » sont à 3,6:1 à 3,6 s : à ne pas laisser durer) ; sur la chaîne, l'orange remplit tout le cadre (bien pour le four, pas pour lire une machine) ; la tête d'essai cadrée bas passe sous l'en-tête.

## 01 · MENACE — `acte1.js` (0 → 11,17 s), dans la voiture

| Beat | Instants | Plan · pose | État | Raccord | Fil |
| --- | --- | --- | --- | --- | --- |
| `accroche` « Ta tête part dans le pare-brise. Il *casse*… exactement comme prévu. » | 0,26–4,28 | **Première image `POSE0` (« 1a », vue)** : dehors, trois quarts face, ta tête de verre au cœur de la toile ; poussée lente d 175 → ≈ 140 | `FIRST` (crash 0,6, lunge 1, web 0,35, rings 0,2) ; dès 0 : `web` → 1, `rings` → 1, `stick` → 0,3 (`power2.out`, ≈ 3,8 s) ; un cran sur `accroche:casse` | — (image 1 : ça bouge) | `l01` 0,26 |
| `promesse` « Entre ta tête et la route : moins d'un +millimètre+. » | 4,95–7,40 | Même mouvement qui tourne vers le profil (`VIEW.hook2`, vue : la tête dans le verre incliné, le corps penché) puis glisse le long du verre jusqu'à sa tranche, **côté passager** (`VIEW.edge`, à trouver : x ≈ +40, dehors) ; `litFilm` 1 : le film, ligne veille entre deux verres | `litFilm` 0 → 1 | Mouvement : un seul tournoiement depuis l'image 1 | `l01` 29,4 |
| `curiosite` « Et ta vitre de côté… ne l'a peut-être *pas*. » (hold 0,4) | 8,02–10,44 | On suit le bord du verre jusqu'au montant, puis la vitre de la portière (`VIEW.side`, vue : faible — resserre à d ≈ 150) ; sur « *pas* », le film veille s'éteint | `sideOn` 1 ; `litFilm` → 0 sur `curiosite:pas` | Mouvement : le long du bord, sans coupe | `fils` 1 sur `curiosite:pas` · `l01` 376,9 |

L'acte se finit sur la vitre de côté à 11,17 s (acte2 coupe là).

## 02 · L'USINE — `acte2.js` (11,17 → 29,21 s), la chaîne

| Beat | Instants | Plan · pose | État | Raccord | Fil |
| --- | --- | --- | --- | --- | --- |
| `lancement` « Jusqu'ici, on ouvrait des systèmes en moins de deux minutes. Cette fois, on a suivi ton pare-brise dans l'usine. Près de neuf minutes. » | 11,32–17,88 | Coupe sur **un pare-brise fini sur la chaîne** (station de contrôle, `pos` 10300), cadré comme la vitre qu'on quitte ; puis **fouet arrière** (`fromD`) jusqu'à toute la ligne, en profondeur (`VIEW.lineWide` est posée, à refaire : az ≈ −75, el ≈ 25, d ≈ 6000) ; sur « Près de neuf minutes » la caméra part vers l'amont | `{ ...AT.line, pos: 10300, cut: 1, print: 1, bend: 1, film: 1, sensors: 1, queue: 1 }` ; `run(D, from, to)` | Forme : une vitre → un pare-brise même place à l'écran | `l01` 27,3 |
| `four` « Du sable qui devient une rivière *orange*, vers 1500 °C. » | 18,41–21,96 | Le vol finit au four : la lèvre, la langue orange qui s'étale (`VIEW.throat`, **vue** : forte) ; « Du sable » peut tenir sur le tas (`batch` 5, `VIEW` du L01 `batch`, à recadrer) si le vol y passe | `melt` 1, `ribbon` 1 | Mouvement : la fin du vol | `l01` 48,4 puis 61,0 sur « rivière » |
| `flotte` « Pour qu'il soit parfaitement plat, on le fait flotter. Pas sur de l'eau. » (hold 0,4) | 22,04–25,16 | On suit la langue qui coule vers l'aval : le ruban sur le bain (`VIEW.ribbon`, vue : le ruban remplit le cadre ; descends au ras pour que le **miroir sombre** apparaisse sous lui) ; sur « Pas sur de l'eau », la caméra rase le bord du ruban, le métal en reflet sombre, rien d'écrit | — | Mouvement : on suit le verre qui coule | `fils` 2 sur `flotte:Pas` · `l01` 90,7 puis 105,1 |
| `bande` « Et la bande noire, au bord de ton pare-brise ? Ce n'est *pas* de la déco. » | 25,84–28,89 | Coupe sur **l'établi**, le bord du pare-brise fini, sa bande noire et ses points en gros plan, de biais (`AT.bench`, `litBand` 1 ; pose à trouver près de `VIEW.stamp`, **sans laisser lire le tampon**) — la sérigraphie de la chaîne (`VIEW.print`) ne se lit pas (vue : verre gris) | `{ ...AT.bench, litBand: 1 }` | Forme : le bord du ruban → le bord du pare-brise, même diagonale à l'écran | `fils` 3 sur `bande:déco` · `l01` 166,9 |

## (02, suite) — `acte3.js` (29,21 → 49,67 s) : 1903, le tampon, la vitre, la tête

| Beat | Instants | Plan · pose | État | Raccord | Fil |
| --- | --- | --- | --- | --- | --- |
| `flacon` « Et on est remontés jusqu'en novembre 1903. Un flacon tombe par terre. Il aurait dû voler en *éclats*. » (hold 0,5) | 29,36–35,29 | Le labo : la main sur le flacon, « Novembre 1903 » (`VIEW.shelf`, **vue** : forte) ; sur `flacon:tombe` il échappe et tombe **au ralenti**, la caméra le suit (la pose `VIEW.fall` le perd : suis-le) ; **coupe avant le sol** (`flask` ≈ 0,85, juste après « éclats ») | `{ ...AT.lab, labelOn: 1, ben: 0 }` ; `flask` 0 → 0,85 ; `star` reste 0 | Forme : le bord de verre de l'établi → le verre du flacon | `fils` 4 sur `flacon:éclats` · `l01` 229,2 |
| `tampon` « Un petit tampon, dans le coin de ta vitre. Le jour où il faut sortir… tu sais le lire ? » | 35,96–39,98 | L'établi, le coin du pare-brise, le tampon **rasant** (vu de face il se lit : E2 · II · 43R — interdit) ; glissement lent, `litStamp` 1 ; il reste illisible jusqu'à « lire ? » | `{ ...AT.bench, litStamp: 1 }` | Objet : le flacon qui tombe → un objet de verre marqué, la coupe sur le mouvement de chute (la caméra glisse vers le bas) | `fils` 5 sur `tampon:lire` · `l01` 180,9 |
| `nickel` « Et parfois, une vitre *éclate*… toute seule. Des années plus tard. » (hold 0,5) | 40,51–44,54 | La voiture, de l'intérieur, la vitre de côté intacte, toi assis (`VIEW.sideIn`, **vue**) ; sur `nickel:éclate` elle part en grains d'un coup ; « toute seule » : rien ne l'a touchée | `{ ...AT.car, sideOn: 1 }` ; `nickel` 0,5 → 1 juste avant le mot, `grains` 0 → 0,7 sur le mot | Forme : le coin du pare-brise → le coin de la vitre, même place à l'écran | `fils` 6 sur `nickel:éclate` · `l01` 391,2 |
| `tete` « Et à la fin, on lâche sur lui une tête de dix kilos. » (hold 1,2) | 45,50–48,16 | La halle d'essai : le pare-brise sur son cadre, la tête de 10 kg suspendue (`VIEW.frameLow` **à refaire** : vue, la tête passe sous l'en-tête — ty ≈ 160, d ≈ 320, shift ≈ −100) ; sur le repère `drop` (« lâche ») elle tombe **au ralenti** jusqu'à 49,55, la caméra descend avec elle ; à **49,55 : `#black` à 1** — une image avant l'impact | `{ ...AT.line, pos: 11850, cut: 1, print: 1, bend: 1, film: 1, sensors: 1 }` ; `drop` 0 → 0,97 (`sine.in`), jamais 1 ; `web` 0 ; `run(D, …)` | Forme : la vitre en grains → le pare-brise entier, tendu sur son cadre | `fils` 7 sur `tete:kilos` · `l01` 441,1 |

**Entre 46,5 et 49,8 s** (décidé) : la chute au ralenti remplit toute la phrase et son silence ; le noir tombe à 49,55, 0,27 s avant « Alors », sans impact ni son d'impact. `fin.js` ôte le noir sur « Alors » : de la tête au-dessus du verre au même pare-brise sur l'établi.

## 03 · RENDEZ-VOUS — `fin.js` (49,67 → 64,7 s)

| Beat | Instants | Plan · pose | État | Raccord | Fil |
| --- | --- | --- | --- | --- | --- |
| `ouvre` « Alors… on l'ouvre. » (hold 0,5) | 49,82–51,58 | Sous le noir, coupe sur l'établi (`VIEW.bench`, **vue** : le film veille à travers) ; `#black` à 0 sur `ouvre − 0,05` ; poussée lente ; sur le repère `explode` (« on ») l'éclaté **commence** à s'ouvrir (`explode` 0 → ≈ 0,35 en 0,48 s, `litFilm` 1) ; sur `black` (51,58) : **noir sec** | `{ ...AT.bench }` | Objet, à travers le noir : le pare-brise sur le cadre → le même, même place à l'écran | `l01` 27,3 |
| `pasici` « Pas ici. » (hold 0,6) | 52,64–53,20 | Noir ; l'en-tête seul (FILM · 8 MIN 51) et le sous-titre | `l01` −1 au noir | — | — |
| `youtube` « Ce film, c'est notre tout premier grand format. Il t'attend sur notre chaîne +YouTube+ : le lien est en bio. » (hold 1,2) | 54,33–59,43 | `#black` à 0 à `pasici$ + 0,15` ; coupe sur **le ruban orange** (le plus bel orange du film : `VIEW.throat` ou `VIEW.ribbon`, le sujet dans le bas du cadre : la zone haute est au cartouche) ; mouvement lent ; `filmCall(tl, { showAt: youtube + 0,2, hideAt: toloop − 0,35 })` ; `D.verdict(t.verdict)` | `{ ...AT.line, l01: -1, yt: 1 }` ; `run(D, …)` | Le noir, puis l'image la plus chaude du film | `yt` 1 |
| `boucle` « Et tu sauras enfin ce qui se passe, le jour où… » | 61,08–63,83 | Coupe à `toloop` dans la voiture **avant** le choc (`AT.car` : crash 0, lunge 0), de profil (`VIEW.hook2`) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` : crash → 0,6, lunge → 1, web → 0,35, rings → 0,2, la caméra rejoint `POSE0` — la tête arrive dans le verre sur « le jour où… » | `{ ...AT.car, l01: FIRST.l01, fils: 0, yt: 0, mood: FIRST.mood, fx…fs: FIRST }` | La dernière image EST la première (`D.commit` prévient sinon : comparer à l'image 0,04) | — |

## Les planches de cette préparation (vues par l'architecte)

`…/scratchpad/look/hook.jpg` (les quatre candidates de la première image), `b2.jpg` et `b3.jpg` (les poses de chaque acte) — chemins complets dans le rapport. Ce que dit chaque pose est écrit à côté d'elle dans `VIEW` (« seen » / « posed »).

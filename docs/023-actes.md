# 023 · Éolienne de secours — le plan de mise en scène

**Aucune voix n'est enregistrée** : le minutage est ESTIMÉ (123 s, soit ≈ 92 s dites). Tout instant se lit dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits et vérifiés sur la table : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères (`npm run script -- 023` donne la table). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des squelettes vides, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/020-taipei-101/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`). Les poses qui cadrent bien seront dans les journaux des décors : `docs/journal/023-avion.md`, `023-model.md` — pars d'elles ; `VIEW` n'est qu'un point de départ, réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

24 août 2001, un Airbus A330 au-dessus de l'Atlantique, de nuit, 306 personnes à bord. Une fuite de carburant sur le moteur droit a vidé les réservoirs : le droit s'éteint à 06 h 13, le gauche à 06 h 26, vers 10 500 m, à ≈ 120 km de Lajes (Açores). Plus de générateurs, plus de pression hydraulique. L'éolienne de secours (RAT) sort, tourne dans le vent de l'avion, et tient en pression **un** circuit sur trois (le « vert » : les commandes de vol). Dix-neuf minutes de plané ; le commandant vise l'île ; il passe le seuil à ≈ 370 km/h, sans inverseurs ni freinage normal, freine sur l'accumulateur de secours, les pneus lâchent, l'avion s'arrête. Aucun mort. Sourcé : rapport d'enquête GPIAA (lu en entier) ; Airbus pour la sortie automatique et le ressort (famille A320).

- **La RAT ne rallume rien et ne fait pas planer** : elle rend de quoi piloter. Le plané est le fait de l'avion (la chute).
- **Le monde est une maquette** : aucune longueur, aucune distance, aucune taille de RAT ne s'affiche. Ni diamètre, ni puissance, ni temps de sortie.
- **La sortie n'est pas chiffrée** : ni « en deux secondes », ni instantanée à l'image (la trappe s'ouvre, le ressort pousse, le bras sort — sur un mot, au moins 0,6 s).
- Aucun chiffre à l'écran en dehors de l'en-tête et des étiquettes écrites ci-dessous. Pas d'heure autre que 6 h 26. Pas de nom de compagnie ni de personne ; « le commandant » seulement.
- **Personne n'est blessé à l'image.** « Les pneus lâchent » : ils se dégonflent, quelques étincelles lentes ; pas d'éclatement, pas de feu, pas d'évacuation.
- L'ordre des causes : **plus de moteurs → plus de pression → la RAT sort → elle tourne → un circuit revit → les gouvernes répondent.**

## L'en-tête : un altimètre

- **`alt`** (en grand) : l'altitude en vrais mètres, arrondie à la centaine (`main.js`). **10 500 à la première image** (le rapport : FL 345 ; la voix dit « dix mille »), elle descend à peine pendant l'acte 1 (10 500 → 10 300 : l'avion plane), tenue sur l'établi, **reposée à 10 500 sur la coupe de `tozero`**, tenue jusqu'à `descends`, puis **10 500 → 0 de `glide` à `there`** (« Dix-neuf minutes de plané. Et la piste est là. »), 0 jusqu'à la boucle. Les valeurs intermédiaires sont illustratives. Signal tant que `mood` vaut 1 et `engines` 0 ; veille dès `mood` 0.
- Le second compteur, **« Moteurs »**, compte ceux qui tournent : `engines` arrondi, « 0 / 2 » en signal. 0 à la première image ; 2 sur la coupe du flash-back (`toscene`) ; 2 → 1 → 0 sur « Plus de moteurs » ; 1 sur la coupe de `tozero` (le droit est mort depuis 06 h 13), **1 → 0 sur « s'éteint »**.
- Le monde vient à l'avion : **tout plan dans le ciel fait avancer `ahead` en ligne droite** (`"none"`) — une mer immobile, c'est un avion arrêté. ≈ 0,01 par seconde en croisière ; une coupe le POSE.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; ici les distances vont de 400 (la RAT) à 42 000 (l'avion sur la mer) : TOUT recul hors de l'avion est par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 300 la RAT, ≈ 600 un moteur, ≈ 3 500 l'avion, 8 000 le large ; `SIZE` sur l'établi).
- **L'hélice tourne par `turn`** (en tours, l'acte le fait avancer en ligne droite, ≈ 1 à 2 tours par seconde à l'image) avec `whirl` 1 dès qu'elle tourne vite ; jamais plus vite : elle scintillerait.
- **Couleurs** : signal = la panne (moteurs morts, circuits morts, freins, la descente, la piste hors d'atteinte) ; veille = la RAT, le circuit qui revit, les gouvernes qui répondent, la piste atteinte. `mood` 1 dans le ciel jusqu'à « la piste est là », 0 sur l'établi. Jamais à mi-chemin plus d'une demi-seconde.
- Toi es un mannequin de verre : jamais en très gros plan, jamais la main seule.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **30 images lues au plus.** Journal : `docs/journal/023-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-toi` (Toi) · `chip-rat` (Dehors / Éolienne de secours) · `chip-freins` (Le problème / Tes freins) · `chip-vol` (24 août 2001 / Airbus A330 · 306 personnes) · `chip-fuite` (Moteur droit / Fuite de carburant) · `chip-120` (La piste visée · Açores / 120 kilomètres) · `chip-vent` (Pas de moteur / Le vent la fait tourner) · `chip-circuit` (Circuits hydrauliques / Un seul sur trois) · `#rail-seuil` · `chip-626` (Le second moteur / 6 heures 26) · `chip-pilote` (Pilote automatique / Perdu) · `chip-vert` (Un circuit sur trois / Sous pression) · `chip-gouvernes` (Les gouvernes / Répondent) · `chip-19` (Sans moteur / 19 minutes de plané) · `chip-piste` (Île Terceira · Lajes / La piste) · `#retitle` (Sans moteur, un avion : « Tombe » barré → « Plane ») · `chip-370` (Au seuil de piste / 370 kilomètres-heure) · `chip-mort` (306 personnes / Aucun mort) · `#cta-field` (« En avion… tu as peur ? » → « UN PEU », 6 signes) · `#net` · `#next` (Prochain dossier · 024 — « Le bloc opératoire. Un premier défaut… ne doit rien couper. » — S'abonner pour l'ouvrir) · les `.rail`. Les pièces de la RAT (trappe, bras, ressort, hélice, pompe) se nomment avec `co.add`, sans chiffre. Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

**La première image : l'A330 de verre la nuit, le moteur proche mort, ton hublot allumé — pas l'avion entier de loin.** Un avion de ligne vu de loin, tout le monde en a vu ; ce qu'on n'a pas vu : une nacelle grande comme un mur, froide, cerclée de signal, sous une aile de verre, la mer noire loin dessous, et ta fenêtre allumée — c'est l'accroche (« n'a plus un seul moteur »), elle se lit à 270 px. Essaie quatre cadres sur une planche avant de choisir : (a) `VIEW.hook` tel quel ; (b) plus près du moteur (`d` 2 800), ton hublot au-dessus ; (c) de dessous, plein ventre (`el` −24) : les deux moteurs morts et la soute fermée ; (d) de l'arrière de l'aile, vers le nez, ta fenêtre au premier plan. C'est toi qui règles `POSE0` et `FIRST` : rends-les dans ton message final, prêts à coller. En UN mouvement ; deux coupes au plus (elles sont marquées).

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, `FIRST` : la nuit, le moteur proche mort, ta fenêtre, la mer très loin. **Ça bouge dès l'image 1** : `ahead` file en ligne droite (la mer défile), `alt` 10 500 → 10 300 sur tout l'acte, la caméra glisse vers ta fenêtre. Sans texte, elle doit arrêter le pouce |
| `atlantic` → `nomotor` | « Au-dessus de l'Atlantique, ton avion n'a plus un seul moteur. » | `chip-toi` sur `avion.A.you`, sorti avant `nomotor` ; sur « moteur » : la caméra a assez reculé pour que les DEUX moteurs se voient, froids, signal |
| `alive` → `out` | « Tu te poseras, vivant : dehors, une petite hélice vient de sortir. » | la caméra descend sous le ventre vers la soute (`VIEW.bay`, par rapport) ; **sur « sortir »** : `door` 0 → 1 puis `arm` 0 → 1 (≈ 0,7 s en tout), `turn` démarre, `whirl` → 1 ; `chip-rat` à place fixe sur « sortir », sorti avant `problem` |
| `problem` → `brakes0` | « Reste un problème : tes freins. » | la caméra glisse le long du ventre jusqu'au puits du train (`VIEW.gear`) ; sur « freins » : `brakes` 0 → 1, les roues et les freins dans leur puits, pleins, chauffés signal ; `chip-freins`, sorti avant `toscene` |
| `toscene` → `airbus` → `pax` | « Vingt-quatre août 2001. Un Airbus, 306 personnes. » | **coupe 1** : le flash-back, l'avion entier (`VIEW.plane`, `{ ...STAGED, engines: 2, lines: 1, fuel: 1 }` : moteurs vivants, encre ; RAT rangée) ; `chip-vol` de `airbus` à `leak` − 0,2 ; sur « personnes » : `pax` 0 → 1, les rangées de têtes de verre s'allument |
| `leak` → `empty` | « Une fuite de carburant a vidé les réservoirs. » | `pax` → 0,3 ; la caméra va vers le moteur droit (loin, à travers le verre) : `leak` 0 → 1, un filet signal sous le mât ; `chip-fuite` ; sur « vidé » : `fuel` 1 → 0 (les réservoirs se vident en descendant) |
| `nomore` → `gens` → `pressure` → `surfaces0` | « Plus de moteurs : plus de générateurs, plus de pression pour les gouvernes. » | recul (par rapport) vers l'avion entier de dessous (`VIEW.circuits`) ; « Plus » : `engines` 2 → 1 (le droit), « moteurs » : 1 → 0 (le gauche) — l'en-tête compte ; « générateurs » : les cœurs des moteurs s'éteignent (fin de `engines`) ; « pression » : `lines` 1 → 0 — les trois circuits s'éteignent du ventre vers les ailes et la queue ; sur « gouvernes » : la caméra a la queue dans le cadre, gouvernes mortes |
| `runway0` → `azores` → `km120` | « Et la piste visée, aux Açores, est à cent vingt kilomètres. » | **coupe 2** : le large (`VIEW.wide`, `ahead` 1) — l'avion petit, la mer noire, et sur l'horizon `runway` 0 → 1, la piste en points signal (`made` 0) ; `chip-120` à place fixe sur « kilomètres » |
| `km120` → `tosystem` | *(fin de phrase)* | poussée par rapport vers l'avion, puis vers le ventre : `VIEW.system` — `shell` → 0,2, `you` → 0, `runway` → 0, `fs` → 300, `mood` → 0 à la fin : il ne reste que la soute fermée, au repos (`door` 0, `arm` 0). C'est de là que l'acte 2 coupe |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tosystem` → `tobench` → `explode` | « Alors… on l'ouvre. » | tenu sur `VIEW.system` ; `benchCut` vers l'établi (origine `BAY.at` → `BENCHAT`), `BENCHED` (RAT sortie) ; **sur « on »** : `explode` 0 → 1, recul par rapport vers `VIEW.exploded` |
| `p1` | « Une trappe. » | `litDoor` 1, la caméra va à la trappe ; `co.add` « Trappe » |
| `p2` → `spring` | « Un bras, poussé par un ressort. » | `litDoor` 0, `litArm` 1 ; sur « ressort » : le geste — `arm` 1 → 0,6 → 1 (le ressort se comprime et repousse) |
| `p3` | « Une hélice. » | `litArm` 0, `litProp` 1, `turn` fait un demi-tour lent |
| `behind` → `p4` | « Et derrière… une pompe. » | la caméra passe derrière l'hélice ; sur « pompe » : `litProp` 0, `litPump` 1 (`VIEW.pump`) |
| `torepos` → `sleeps` → `folded` → `door2` | « Elle dort, repliée, derrière une trappe. » | `explode` → 0 (tout se rassemble pendant le recul vers `VIEW.door`), `litPump` 0 ; sur « repliée » : `arm` 1 → 0 ; sur « trappe » : `door` 1 → 0 — elle dort |
| `allstop` → `flight` → `sorts` → `self` | « Tous les moteurs s'arrêtent en vol ? Elle sort seule. » | la RAT de trois quarts ; sur « sort » : `door` 0 → 1, `litArm` 1 et `arm` 0 → 1 (le ressort la pousse) — arrivé sur « seule » |
| `nomotor2` → `wind` → `spins` | « Pas de moteur pour elle : c'est le vent de l'avion qui la fait tourner. » | vers `VIEW.prop` ; sur « vent » : `wind` 0 → 1 (les filets arrivent du nez) ; sur « tourner » : `turn` accélère, `whirl` 0 → 1 ; `chip-vent` de `wind` à `pushes` − 0,2 |
| `pushes` → `oil` → `circuit` | « Et elle pousse l'huile… dans un seul circuit. » | vers `VIEW.pump` (l'hélice tourne toujours) ; sur « pousse » : `press` 0 → 1 ; sur « huile » : `flow` 0 → 1 — la tête de lumière part le long de la ligne vivante ; les deux autres restent mortes ; `chip-circuit` sur « circuit », sorti avant `toseuil` |
| `toseuil` → `plane0` → `ocean` → `whole` | « Abonne-toi : ce plané au-dessus de l'océan… regarde-le en entier. » | `followCall` (les chevrons `#rail-seuil`, le nom du compte s'allume) ; **le film ne s'arrête pas** : **coupe** sur `toseuil` vers le ciel — l'avion au-dessus de la mer de nuit (`VIEW.wide`, `STAGED`, `ahead` 0,95, `mood` 1), la caméra déjà en route vers lui, par rapport ; sur « océan » : la mer noire remplit le bas du cadre ; l'en-tête répond au mot « plané » (`alt` 10 300 → 10 500 : on revient à 06 h 26) |

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes. La voix est hachée : un plan par souffle. `mood` 1, `gel` 0,15 au plus, jusqu'à « la piste est là ».

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `h626` | « Six heures vingt-six. » | **coupe** : le moteur gauche (proche) de près (`VIEW.engine`, `{ ...STAGED, engines: 1, alt: 10500 }` : il tourne encore, le droit est déjà mort) ; `chip-626` à place fixe, sorti avant `nopilot` |
| `second` → `dies` | « Le second moteur s'éteint. » | sur « s'éteint » : `engines` 1 → 0 — la soufflante ralentit, le cœur s'éteint, le liseré passe au signal ; l'en-tête « 1 / 2 » → « 0 / 2 » |
| `m10k` | « Dix mille mètres. » | **coupe** : le large (`VIEW.wide`), la mer très loin dessous ; l'en-tête dit 10 500 |
| `nopilot` | « Plus de pilote automatique. » | **coupe** : la cabine, toi à ta fenêtre (`VIEW.you`), le cockpit au loin dans le verre ; `chip-pilote` |
| `descends` | « Et l'avion… descend. » | **coupe** : de côté, l'avion entier (`VIEW.plane`) : `pitch` −2 → −5, la caméra tient pendant que l'avion s'enfonce dans le cadre ; `alt` commence à baisser |
| `trigger` → `rsort` | « L'hélice sort. » | **coupe** : la soute (`VIEW.bay`) : `door` 0 → 1 puis `arm` 0 → 1, arrivés sur « sort » (≈ 0,6 s) |
| `rturn` | « Elle tourne. » | même plan : `turn` accélère, `whirl` → 1 |
| `rcircuit` → `revive` | « Un circuit sur trois revit. » | **coupe** : les trois circuits de dessous (`VIEW.circuits`) : `press` 0 → 1 sur « revit », `flow` 0 → 1 jusqu'à `surf` — la tête veille court de la soute vers les ailes et la queue ; les deux autres restent signal ; `chip-vert` |
| `surf` → `respond` | « Les gouvernes répondent. » | **coupe** : la queue (`VIEW.tail`) : `surf` 0 → 1 sur « gouvernes », `stick` 0 → 1 → −1 → 0 sur « répondent » ; `chip-gouvernes` |
| `captain` → `island` | « Le commandant vise une île. » | **coupe** : l'approche, de derrière l'avion (`VIEW.approach`, `ahead` 0,8) : `bank` 0 → 15 → 0, l'île passe au centre du cadre devant le nez ; `runway` 1, `made` 0 |
| `m19` → `glide` | « Dix-neuf minutes de plané. » | même plan, long : `alt` 10 500 → 600 et `ahead` 0,8 → 0,08 de `glide` à `there`, `dawn` 0 → 0,7 (la première lumière monte), la caméra suit, par rapport ; `chip-19` sur « minutes », sorti avant `runway` |
| `runway` → `there` | « Et la piste est là. » | la piste devant le nez, `gear` 0 → 1 ; **sur `there` : `made` 0 → 1 et `mood` 1 → 0** — les feux passent en veille, l'en-tête aussi ; `chip-piste` ; `alt` 0 à `toverdict` |

## Fin — `fin.js` (`toverdict` → la fin)

**L'ordre, à partir du 018 : chute → ce qui est dû + commentaire → like → prochain dossier → boucle.** Plus rien du sujet ne revient après l'annonce. Compare ta dernière image à la première (`look` aux deux instants) : elle doit être la même. `D.commit` prévient dans la console si un nombre de l'état n'est pas revenu — `look` ne l'affiche pas : relis `D.first` et le `POSE0` / `FIRST` que rend l'acte 1.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `secret` → `nofall` → `verdict` | « Voilà le secret : un avion sans moteur ne tombe pas. Il plane. » | **coupe**, et UN seul plan pour toute la chute : l'avion entier de côté au-dessus de la mer à l'aube (`VIEW.plane` élargi, `{ ...STAGED, alt: 3000, dawn: 0.6, door: 1, arm: 1, whirl: 1, press: 1, flow: 1, surf: 1, mood: 1 }`), `ahead` file ; `retitle` : « Tombe » entre sur `secret` + 0,1, **barré sur `nofall`**, « Plane » sur `verdict` − 0,05, `D.verdict(verdict)`, `mood` → 0 |
| `cwind` → `cdesc` → `pilot` | « Et c'est le vent de sa descente… qui lui rend de quoi piloter. » | `wind` 0,5 → 1 sur « vent » : les filets coulent le long du ventre et passent dans le disque de la RAT (veille) ; sur « piloter » : `stick` fait un petit aller-retour, les gouvernes répondent ; titre sorti à `tocta` − 0,42 |
| `tocta` → `brakesQ` → `reversers` → `normal` | « Et les freins ? Ni inverseurs, ni freinage normal. » | **coupe** : le puits du train (`VIEW.gear`, `{ ...STAGED, alt: 300, ahead: 0.02, gear: 1, brakes: 1, dawn: 0.8, mood: 1 }`) — les freins pleins, signal |
| `arrives` → `kmh` | « Il arrive sur la piste à près de 370 kilomètres-heure. » | **coupe** : l'approche au ras de la piste, `alt` 300 → 0 et `ahead` 0,02 → −0,05 (il passe le seuil), `pitch` +4 ; `chip-370` à place fixe sur « kilomètres » |
| `emergency` → `tires` → `stops` | « Freinage de secours. Les pneus lâchent… il s'arrête. » | **coupe** : les roues sur la piste, de côté et bas ; `ahead` −0,05 → −0,22 en `power2.out` jusqu'à `stops` (il ralentit) ; « pneus » : `tires` 0 → 1 (ils s'aplatissent, quelques étincelles lentes) ; arrêt sur « s'arrête » |
| `nodeath` | « Aucun mort. » | **coupe** : l'avion entier arrêté sur la piste à l'aube, de haut (`VIEW.approach` relevé, `made` 1, `dawn` 0,9, `mood` 0) ; `chip-mort`, sorti avant `ask` |
| `ask` → `answer` | « En commentaire : en avion, tu as peur ? » | **coupe** : toi à ta fenêtre, l'aube dehors (`VIEW.you`, `alt` 0, `ahead` −0,22) ; `commentCall` (`from` `ask`, `typedAt` `answer`, `chars` 6, `to` `tolike` − 0,3) |
| `tolike` → `armrest` → `takeoff` | « Like : pour celui qui serre l'accoudoir à chaque décollage. » | **coupe** : toi de plus près, dans la cabine ; sur « accoudoir » : `grip` 0 → 1 ; sur « décollage » : `grip` → 0,6 ; `likeCall` |
| `toabo` → `next` → `bloc` → `fault` → `cutoff` | « Prochain dossier : le bloc opératoire. Là, un premier défaut électrique… ne doit rien couper. » | **coupe** : l'établi, la RAT entière (`BENCHED`, `litProp` 0,5, `whirl` 0,4, `turn` court lentement) ; on s'en approche jusqu'à ce qu'elle occupe la moitié de la largeur, sous le panneau ; `nextFile` (`showAt` `next` − 0,15, `factAt` `bloc`, `hideAt` `toloop` − 0,38, chevrons dès `toabo` + 0,1) — **la voix ne redit pas « abonne-toi » : c'est le panneau** |
| `toloop` → `rewind` | « Et pas besoin, pour ça, d'être… » | **coupe** : la nuit, l'avion, d'un peu plus loin que `POSE0` (`{ ...STAGED, ahead: FIRST.ahead + 0.01, alt: FIRST.alt }` : juste AVANT l'instant de la première image) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène tout à `FIRST` et à `POSE0` : le moteur mort, ta fenêtre, la mer noire |

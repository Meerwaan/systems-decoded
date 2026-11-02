# 031 · Anti-collision (TCAS) — le plan des actes

Voix réelle 93,5 s. Contrat : `episodes/031-tcas/src/world.js` (`FIRST`, `VIEW`, `STAGED`, `BENCHED`, `otherPos`, `atHim`), `plan.js` (repère : ton avion immobile à l'origine, **nez −x, gauche +z** ; az 0 ton flanc gauche, az −90 devant ton nez, az 90 derrière ta queue). Décors : `docs/031-decors.md`. Lis ce haut commun, puis **ta section seulement** (`grep -n "^## "`). Les poses de `VIEW` sont **provisoires** (réglées sur bouchons) : prends celles des journaux des décors (`docs/journal/031-tcas.md`, `031-cockpit.md`) et de `docs/031-actes-maj.md` s'il existe.

## Ce que tout acte respecte

- **Le film suit la mesure du TCAS.** L'en-tête : grand chiffre = `tau` (secondes avant le point le plus proche ; encre au-dessus de 35, signal de 35 à 0, veille à 0) ; second compteur « Pour obéir » = `obey` (les 5 s ; `−1` → « — » ; veille dès que `pull` > 0,5). Les actes posent ces deux nombres ; le chiffre affiché est celui que dit la voix au mot près.
- **Grille de rétention** (`docs/recette-actes.md`) : 0 → 0,5 s le SUJET bouge (l'autre avion fonce : `gap` qui fond, pas la caméra seule) ; 0,5 → 10 s une démonstration par phrase ; **10 → 25 s un changement toutes les 2 à 3 s, aucune plage lente de 2 s** ; portes d'acte : une coupe franche (les sons sont déjà posés dans les souffles : `episode.json` → `sfx`, n'en pose aucun sur un mot).
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe ni l'image 0) : `descends` 4,76 (pas `toi` 1,40 : trop près de l'image 0), `rouge` 20,74, `temps` 31,36, `ordonne` 39,32, `monte` (zero) 48,68, `tires` 54,56, `sous` 59,73, `pas` 63,86 (verdict), `percutés` 74,14. `D.captionStyle({ hit: 0.25 })` une fois, dans `acte1.js`.
- **« Alors… on l'ouvre »** (21,82 → 22,88) seul dans son plan : un seul mouvement (le recul depuis l'écran), la coupe vers l'établi à `tobench` 22,38, l'éclaté qui s'ouvre **sur « on »** (`explode` 22,52). Rien d'autre ne bouge, aucune étiquette (`suck` puis `hush` déjà posés).
- **La boucle** : `fin.js` revient à `POSE0` avec `FIRST` (D.loop) ; la dernière image = la première (l'autre avion qui fonce, ses phares).
- **Trois couleurs, franches** : `mood` 1 dans le ciel tant que la menace court (jusqu'à « conflit terminé » 61,39), 0 sur l'établi et après. Les symboles et les arcs se posent entiers (`level` entier, `ra` −1 / 0 / 1 franc), jamais à mi-chemin plus d'une demi-seconde.
- **Anti-parasites** : les ondes et les feux sont de la lumière : la caméra ne les frôle pas en mouvement rapide ; un anneau qui passe devant l'objectif = image parasite (passe derrière, ou `ping` à 0 pendant le mouvement). Les écrans (`level`) basculent sur une image fixe, jamais pendant un `swish`. Un quart de tour en une seconde est une coupe. Les longs trajets `sine.inOut`, la distance par rapport (`fromD`).
- **Maquette** : `gap` est en mètres dessinés (≈ 500 à la première image, 0 au croisement) ; il fond en ligne droite (`"none"`) tant que l'autre approche — un avion qui ne bouge pas est arrêté dans le ciel. `up` / `down` (montée / descente, mètres dessinés : 30 et 30 au croisement suffisent) et `nose` / `nose2` (5 à 7°) ne bougent qu'à l'acte 3. Aucune longueur, aucune hauteur à l'écran.
- Les poses dans le ciel sont dans le repère de ton avion ; pour l'autre, `otherPos(S)` donne son centre et `atHim(VIEW.hisNd, S)` son écran. Le cadre vertical ne fait que 17° de large à `fov` 30 : deux avions côte à côte de profil y sont petits — préfère l'axe (`chase`, `hook` : l'autre de face) et l'empilement vertical (`pair`).
- Zones : en-tête 236–410 · zone haute 436–790 (un seul panneau ou une seule étiquette fixe) · sujet 440–1160 · sous-titres 1248–1488 · rien sous 1600 · rien à x > 905 de 880 à 1760. Planches **sans `--bare`** au moins une fois.
- Étiquettes (dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer) : `chip-toi`, `chip-lui` (encre / signal) · `#orders` (deux ordres : `#order-tcas` « Ta machine · Monte » veille, `#order-atc` « Le contrôleur · Descends » signal) · `chip-1030` (Interroge · 1 030 MHz), `chip-1090` (Répond · 1 090 MHz), `chip-coeur` (Le cœur · Calculateur) · `#rail-seuil` · `chip-monte` (Toi · Monte, veille), `chip-descends` (Lui · Descends, signal), `chip-1500` (Vitesse verticale · 1 500 ft/min, encre) · `#retitle` (Qui a choisi de monter : « Toi » barré → « Deux machines ») · `#piece` (PIÈCE N° 1 · 1er juillet 2002 : deux traces qui descendent et convergent, `#piece-a` veille « Suit sa machine », `#piece-b` signal « Suit le contrôleur ») · `#duel` (Cinq secondes : J'obéis ou J'hésite, deux tons encre) · `#net` · `#next` (032, « 1883 · Une porte bloquée. ») · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre (« Antenne », « Transpondeur », « Calculateur », « Son transpondeur »).
- **26 images lues au plus**, planches de 8. Journal : `docs/journal/031-<ton fichier>.md`. Planches et `essais.json` dans `.cache/planches/031/<ton fichier>/`, jamais dans `renders/`.

## `acte1.js` — 01 · MENACE (0 → 21,82)

| Instant | Phrase (mot) | Plan · ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 0 → 1,40 | « Un avion fonce droit sur toi » | `POSE0` : l'autre de face, ses phares, son feu rouge, il grossit (`gap` 320 → 250 en `"none"` sur 5 s ; `glide` sur la caméra seulement si le sujet reste dans le cadre) ; un anneau `ping` part de toi | l'autre : 35 → 45 % de la largeur |
| 2,04 → 3,24 | « Ta machine dit : monte » | même plan ; sur « monte » 3,08 : `#order-tcas` entre (zone haute) | |
| 3,68 → 5,00 | « Le contrôleur : descends » | sur « descends » 4,76 : `atc` 0 → 1 (le front signal monte du sol) ; `#order-atc` à côté ; `D.punch` | |
| 5,48 → 7,48 | « En face, sa machine lui dit : descends » | coupe 5,38 (raccord : l'autre avion) → `atHim(VIEW.hisNd, …)` `gap` 300 : son écran, `ra2` −1 posé sur « descends » 7,24 (l'arc vert bascule vers le bas) | son écran : 60 % |
| 7,88 → 9,24 | « Une seule réponse te garde en vie » | coupe 7,80 → `VIEW.chase` (`gap` 280 qui fond) : toi au premier plan, lui en face | ta dérive : 50 % ; lui 25 % |
| 9,87 → 11,08 | « Toi, tu obéis à qui ? » | `#orders` revient (les deux ordres côte à côte au-dessus de toi) ; `chip-toi` sur ton avion | |
| 11,86 → 13,38 | « Même altitude, nuit noire » | coupe 11,76 → `VIEW.chase` bas (el 1) : les deux au même niveau, l'horizon des nuages | |
| 13,82 → 15,30 | « Ses feux grossissent dans ton pare-brise » | coupe 13,72 → `VIEW.shoulder` : ses phares dans le pare-brise (`gap` 300 → 200) | ses feux : 15 → 25 % |
| 15,70 → 17,38 | « Il te reste 35 secondes… » | `tau` 36,4 → 35,0 posé sur « 35 » 16,34 (`sc35`) puis tenu ; lent travelling avant | |
| 17,54 → 18,58 | « …dont cinq pour obéir » | `obey` 5 posé sur « cinq » 17,70 (`scCinq`) | |
| 19,14 → 20,98 | « Sur ton écran, il vire au carré rouge » | sur « écran » 19,54 : plongée vers `VIEW.nd` (fromD) ; `level` 1 → 2 → 3 sur « carré » 20,46 / « rouge » 20,74, `ra` 1 ; `D.punch` sur « rouge » | l'écran : 70 % |

État à 0 : `FIRST` (`gap` 320, `ping` 1, `tau` 35, `level` 0 : le hook montre l'ordre par `#orders`, pas par l'écran — l'écran ne s'y voit pas). Sortie : `VIEW.nd`, `level` 3, `ra` 1, `tau` 35, `obey` 5, `gap` ≈ 200. `acte2.js` en part (il ne recoupe pas : il recule).

## `acte2.js` — 02 · AUTOPSIE (21,82 → `tozero` 46,38)

| Instant | Phrase (mot) | Plan · ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 21,82 → 22,38 | « Alors… » | recul depuis `VIEW.nd` à travers le pare-brise jusqu'à `VIEW.fuselage` (fromD) ; `cores` 1, `shell` vers 0,5, `ping` 0, `mood` 0 | — |
| 22,38 | coupe `tobench` | → l'établi, **même azimut** (`VIEW.whole`, az −40), `BENCHED` + `tau` 35, `level` 3, `ra` 1 (l'écran rouge raccorde) | le système : 55 % |
| 22,52 → 22,88 | « …on l'ouvre » | `explode` 0 → 1 sur « on », recul vers `VIEW.exploded` | colonne : 70 % de la hauteur |
| 23,91 → 26,96 | « Sur ton fuselage, une antenne interroge l'autre avion, chaque seconde » | `litAnt` sur « antenne » 24,96 ; `ping` 1 sur « interroge » 25,20 (l'anneau part vers le `peer`) ; `chip-1030` ; `co.add` « Antenne » | |
| 27,36 → 28,40 | « Son transpondeur répond » | glisse vers `VIEW.peerBench` ; `litPeer` ; la réponse revient ; `chip-1090` | le peer : 40 % |
| 28,92 → 30,88 | « Et au cœur, le calculateur mesure… » | `VIEW.cpuBench` ; `litCpu` ; `chip-coeur` sur « cœur » 29,12 | le calculateur : 50 % |
| 31,16 → 32,72 | « …le temps avant le point le plus proche » | `tau` 35 → 60 (la jauge se remplit, 0,4 s) puis 60 → 52 en `"none"` : elle se vide ; `D.punch` « temps » | |
| 33,47 → 35,40 | « Au-dessus de 48 secondes, il se tait » | `VIEW.ndBench` + le haut-parleur ; `level` 0, `ra` 0, `tau` 52 → 49 ; silence (`talk` 0) | écran + HP : 60 % |
| 35,92 → 37,88 | « À 48 : traffic, traffic » | `tau` 48 sur « 48 » 36,04 ; `level` 2 (cercle signal) et `talk` 1 sur « traffic » 37,08 (`rTA`) | |
| 38,32 → 39,72 | « À 35, il ordonne » | `tau` 35 sur « 35 » 38,44 (`rRA`) ; `level` 3, `ra` 1 (l'arc vert) ; `D.punch` « ordonne » | |
| 40,20 → 42,76 | « Mais avant de te dire monte… il écoute l'autre machine » | glisse vers `VIEW.antBench` ; `beam` 1 sur « écoute » 41,80 (le secteur vers le peer) | l'antenne : 45 % |
| 43,21 → 45,96 | SEUIL « Abonne-toi : ces 35 secondes, on les joue en entier » | `followCall` ; la caméra déjà en route : de l'antenne vers le `peer` (la menace), sans s'arrêter ; `tau` tenu 35 | |

Entrée : `VIEW.nd` de l'acte 1 (pas de coupe à 21,82). Sortie : en mouvement vers le peer ; `acte3.js` coupe à `tozero` 46,38. **Plus de 14 phrases ? Non (11) : un seul fichier.**

## `acte3.js` — 03 · RÉPONSE (`tozero` 46,38 → `toverdict` 62,65)

| Instant | Phrase (mot) | Plan · ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 46,38 | coupe | → `VIEW.chase` (raccord : la direction du peer = celle de l'autre avion), `STAGED` + `gap` 260, `tau` 35, `level` 3, `ra` 1, `level2` 3, `ra2` 0, `obey` 5, `cores` 1, `ping` 1 | ta dérive 50 %, lui 25 % |
| 46,49 → 46,84 | « 35. » | `tau` 35,0 ; dès ici `tau` et `obey` courent ensemble en temps d'histoire lent : 35 → 32,6 et 5 → 2,6 jusqu'à « tires » 54,56 | |
| 47,28 → 49,00 | « Ta machine envoie à l'autre : je monte » | `coord` 0 → 1 de « envoie » 47,72 à « monte » 48,68 (la tête veille de ton calculateur au sien) ; `D.punch` « monte » | |
| 49,40 → 51,24 | « La sienne lit… et prend l'autre sens » | coupe 49,30 → `atHim(VIEW.hisNd, …)` ; `answer` 0 → 1 ; `ra2` −1 posé sur « prend » 50,44 (son arc vert bascule vers le bas) | son écran 60 % |
| 51,81 → 53,20 | « Toi : monte. Lui : » | coupe 51,71 → `VIEW.pair` à l'approche (`gap` 120, les deux au même niveau) ; `chip-monte` sur « monte » 52,48, `chip-lui`/`chip-descends` sur « Lui » 53,00 | les deux : 70 % de la hauteur |
| 53,76 → 54,00 | « descends » | `chip-descends` | |
| 54,36 → 55,28 | « Tu tires sur le manche » | coupe 54,26 → `VIEW.stick` ; `pull` 0 → 1 sur « tires » 54,56 (`trigger`) ; `obey` s'arrête (2,6, veille) ; `D.punch` « tires » | manche + main : 50 % |
| 55,64 → 56,64 | « 1 500 pieds par minute » | coupe 55,54 → `VIEW.vsi` ; `vs` 0 → 1500 ; `chip-1500` | l'échelle : 60 % |
| 56,96 → 58,40 | « Ton aiguille entre dans l'arc vert » | l'aiguille entre dans l'arc sur « vert » 58,16 (veille) | |
| 58,76 → 60,08 | « Ses feux passent… sous toi » | coupe 58,66 → `VIEW.shoulder` (`gap` 60 → −40) : ses phares glissent sous l'auvent ; `tau` → 0 sur « sous » 59,73 ; `D.punch` « sous » | |
| (en parallèle) | climb | dès « tires » : `up` 0 → 30, `down` 0 → 30, `nose` 0 → 6, `nose2` 0 → 5, `vs` 1500, `vs2` −1500 (`sine.inOut`, jusqu'à 60,5) ; `gap` fond en `"none"` (≈ 260 → −60 de 46,38 à 60,5, plus vite après « tires ») | |
| 60,56 → 62,00 | « La voix : conflit terminé » | coupe 60,46 → `VIEW.pair` (`gap` −60, empilés) ; sur « conflit » 61,39 : `level` 0, `ra` 0, `ra2` 0, `obey` −1, `mood` 0 ; `tau` 0 (veille) | les deux : 75 % |

Sortie : `VIEW.pair`, `gap` −60, `up` 30, `down` 30, `cores` 1. `fin.js` coupe à `toverdict` 62,65.

## `fin.js` — chute, ce qui est dû, like, prochain dossier, boucle (`toverdict` 62,65 → 93,5)

| Instant | Phrase (mot) | Plan · ce qui se passe | Part du cadre |
| --- | --- | --- | --- |
| 62,65 | coupe | → `VIEW.pair` serré (les deux cœurs), `STAGED` + `gap` −60, `up` 30, `down` 30, `cores` 1, `mood` 0 | |
| 62,77 → 64,62 | « Le secret : tu n'as pas choisi de monter » | `retitle` (Qui a choisi de monter : « Toi » barré sur « pas » 63,86) ; `D.verdict(63,86)` ; recul lent | |
| 65,10 → 67,34 | « Deux machines se sont mises d'accord… avant de te le dire » | `link` 0 → 1 sur « machines » 65,26 (la ligne veille qui pulse entre les deux cœurs) ; swap → « Deux machines » ; les pilotes de verre au bout de la chaîne | |
| 68,17 | coupe `tocta` | → `VIEW.chase` (raccord : les deux avions), `gap` 160, niveau égal | |
| 68,29 → 70,38 | « Toi, tu obéis à qui ? À la machine » | `#orders` revient, `#order-tcas` au-dessus, `#order-atc` éteint (barré ou à 0,3) sur « machine » 69,98 | |
| 70,86 → 74,86 | « En 2002, un seul des deux avions a suivi la sienne. Ils se sont percutés. » | `#piece` sur « 2002 » 70,97 : les deux traces se tracent (stroke), elles convergent, **coupées en fondu avant « percutés » 74,14** (rien ne se touche) ; la 3D sombre derrière (`shell` 0,4) | panneau : zone haute |
| 75,02 → 76,30 | « Depuis, la règle est claire » | `#piece` sort ; `#orders` : l'ordre de la machine seul, veille | |
| 76,76 → 79,98 | « En commentaire : cinq secondes… tu obéis, ou tu hésites ? » | `duelCall` (`aAt` `duelA` 78,78, `bAt` `duelB` 79,62, `toneA` null, `toneB` null) ; `obey` 5 → 0 en `"none"` jusqu'à 79,9 (le compteur égrène les cinq secondes du duel) | |
| 80,68 → 84,12 | « Like : pour quelqu'un qui a peur en avion. Deux machines veillent sur lui. » | coupe 80,58 → `VIEW.cabin` (`sleeper` 1, `ping` 1, `gap` 800) ; `likeCall` ; sur « veillent » 83,60 l'anneau part du dos vers un avion lointain | le passager : 30 % |
| 84,57 → 90,92 | « Prochain dossier… 183 enfants » | `nextFile` ; la caméra sort de la cabine et monte vers la nuit (pas de porte en 3D : le `voir` d'`abo` n'est pas tenu, le panneau le porte) | |
| 91,39 | coupe `toloop` | → près de `POSE0` (`d` × 1,15), `FIRST` ; `D.loop` (`rewindAt` 91,76) : l'autre avion fonce, ses phares | = la première image |

Rien du sujet après « Prochain dossier » sauf la boucle. **13 phrases : un seul fichier.**

## La première image — quatre candidates (planche de l'architecte `b3.jpg`, sur bouchons)

Notées sur les six points (`docs/recette-agents.md`) : **E** événement en cours · **P** perspective basse · **M** menace derrière le sujet · **F** forme reconnue sur 40 % · **S** le système déjà là · **B** bouge par son sujet. À retirer sur les vrais décors ; celle qui coche le moins sort.

1. **A · Sous ton nez** — contre-plongée sous ton nez de verre (en haut du cadre), l'autre de face qui fonce, ses phares, son feu rouge ; l'anneau qui part de ton antenne du ventre. E ✓ (il fonce, l'anneau) · P ✓ · M ✓ (ses phares derrière ton nez) · F ✓ (l'avion de face, 45 % à `gap` 260) · S ~ (l'anneau, l'antenne ; pas l'écran) · B ✓ (`gap` qui fond). **5,5/6.** Sur bouchon le nez sortait du cadre : `shift` −300 à essayer.
   `{ "at": 0.04, "label": "A", "pose": { "tx": -7300, "ty": 0, "tz": 0, "d": 5032, "az": 87.5, "el": -5.9, "fov": 40, "shift": -300, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "gap": 260, "ping": 1, "lights": 1 } }`
2. **B · Derrière ta dérive** — ta dérive et ton dos de verre au premier plan, en bas ; l'autre de face au bout de ton nez ; l'anneau vers lui. E ✓ · P ~ (au ras de la dérive) · M ✓ · F ✓ (ta dérive + lui) · S ✓ (l'anneau, le cœur dans ta baie si `cores`) · B ✓. **5,5/6** — la plus lisible sur bouchon.
   `{ "at": 0.04, "label": "B", "pose": { "tx": -30000, "ty": 0, "tz": 0, "d": 37000, "az": 90, "el": 1.4, "fov": 34, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "gap": 250, "ping": 1, "lights": 1, "cores": 1 } }`
3. **C · Par-dessus l'épaule** — l'épaule du pilote de verre, l'auvent, ses phares dans le pare-brise, l'écran rouge en bas du cadre. E ✓ · P ✗ · M ✓ · F ~ (l'avion petit, 15 %) · S ✓ (le carré rouge) · B ✓. **4,5/6.**
   `{ "at": 0.04, "label": "C", "pose": { "tx": -2760, "ty": 96, "tz": 40, "d": 240, "az": 80, "el": 6, "fov": 44, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "gap": 200, "level": 3, "ra": 1, "lights": 1 } }`
4. **D · Grand angle au ras du nez** — A plus serré, `fov` 52, l'autre à `gap` 200 : plus de vitesse, ton nez plus grand ; risque : l'autre petit au centre. E ✓ · P ✓ · M ✓ · F ~ · S ~ · B ✓. **5/6.**
   `{ "at": 0.04, "label": "D", "pose": { "tx": -7300, "ty": -150, "tz": -500, "d": 5100, "az": 84, "el": -4.5, "fov": 52, "shift": -250, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "gap": 200, "ping": 1, "lights": 1 } }`

`POSE0` provisoire = A (sans le `shift`). La boucle reviendra sur celle qui gagne : si c'est B, `FIRST.gap` passe à 250 et `cores` à 1.

**Choix du chef (30/10, planche sur les vrais décors)** : **B** (derrière ta dérive) — `POSE0` = B, `FIRST.gap` 250, `FIRST.cores` 1. A et D : l'autre avion petit au milieu du noir, ton nez hors cadre ; C : l'épaule de verre mange le cadre, l'avion à 15 %. La boucle revient sur B.

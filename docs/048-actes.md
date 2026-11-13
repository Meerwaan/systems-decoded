# 048 · Tunnelier — le plan des actes

Contrat de l'architecte (13/11). Voix réelle, 92,07 s : **tous les instants ci-dessous sont lus sur la table de `npm run script -- 048`** (mot@début). Le monde : `src/world.js` (`FIRST`, `VIEW`, `BENCHED`, `STAGED`), les décors : `docs/048-decors.md`. Quatre fichiers, quatre agents : `acte1.js` (0 → 21,26), `acte2.js` (21,26 → 41,68), `acte3.js` (41,68 → 63,30 : le repos puis la réponse, dans la coupe), `fin.js` (63,30 → 92,07). Les actes du dossier sont des squelettes qui construisent : à réécrire en entier.

**Repères** (`episode.json → cues`) : `choc` 0,60 · `tobench` 21,26 · `explode` 21,40 · `torepos` 41,68 · `tozero` 49,27 · `trigger` 55,39 · `toverdict` 63,30 · `verdict` 67,21 · `tocta` 70,50 · `duelA` 77,66 « oui » · `duelB` 78,14 « non » · `tolike` 78,86 · `toabo` 82,54 · `toloop` 90,36 · `rewind` 91,08.

## Ce qui vaut pour tous

- **La contre-vérification vaut pour l'image** : le tassement est de **quelques millimètres** — la chaussée ne bouge pas à l'œil ; ce qui se lit, c'est la **lueur de la cuvette** (`settle`), la **mire grossie ×50** (`ruler`) et l'en-tête. Jamais un trou qui atteint la rue, jamais « un effondrement ». `loose` est de la terre qui se relâche, pas un vide. « Ta rue monte » = un bombement léger, sans chiffre (l'en-tête dit « Monte »). **Aucune pression chiffrée** à l'écran, nulle part.
- **L'en-tête** (main.js) : le grand nombre est `settle` en millimètres (signal dès 1 mm ; « Monte » sous −0,3) — il ne dit que les nombres de la voix aux mots de la voix : **2 sur « deux » 52,58 · 5 sur « Cinq » 53,56 · 7 sur « Sept » 54,28 · 8 sur « Huit » 59,84**. Le second est un mot tiré de `press` : Équilibre (veille, |press − 1| < 0,08) · En chute · Trop forte. Sur l'établi (`BENCHED`) : 0 mm, Équilibre — l'autopsie est avant la chute ; le saut se fait sur la coupe de « on l'ouvre », pas ailleurs.
- **Les nombres qui tournent** (`wheel`, `screw`) sont cumulés : chaque acte les reprend où le précédent les a laissés (`acte1` finit à `wheel` ≈ 1,2) et les tween en `"none"`. La roue tourne **lentement** (≈ 0,06 tour/s : un vrai tunnelier fait 1 à 3 tr/min) ; la vis plus vite (≈ 0,15 tour/s), elle **freine** sur « ralentit ».
- **La grille de rétention** : 0 → 0,5 s, le sujet bouge par lui-même (la voiture traverse, la terre glisse, la roue tourne, la colonne monte) ; 10 → 25 s, un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; chaque porte d'acte est une coupe ou un franc changement d'échelle. Plan-séquence (`D.path`) : pilote du 038, **pas la règle** ici — les actes gardent `shot` / `cut`, mais une coupe n'est jamais un arrêt (les plans de part et d'autre bougent).
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe ni sur l'image 0, jamais deux à moins d'une seconde) — les mots marqués du texte : `s'enfonce` 0,60 · `pression` 6,04 · `fort` 8,28 · `s'écroule` 15,01 · `roue` 19,54 · `pression` 31,76 · `bouge` 41,16 (un arrêt net, pas un zoom : à juger) · `lâche` 48,60 · `vide` 50,16 · `ralentit` 55,44 · `remonte` 59,12 · `retenir` 67,21 · `monte` 74,14. Les sons du dossier sont posés **dans les souffles** (`episode.json → sfx`, grille de départ ; le `monteur-son` la reprend après les actes).
- **« Alors… on l'ouvre »** (20,48 → 21,84) : seul dans son plan, en quasi-silence (`hush` posé) ; la coupe vers l'établi à `tobench` 21,26 (`benchCut` depuis la dernière pose de l'acte 1, `origin: BENCH_FROM`), **l'éclaté s'ouvre sur « on »** (`explode` 21,40).
- **La boucle** : la dernière image est `POSE0` + `FIRST` (la voiture à −400, la roue qui tourne, la colonne à mi-hauteur) ; « Et pendant ce temps… » (90,48) retombe sur « Ta rue s'enfonce ».
- **Anti-parasites** : la caméra traverse le verre du terrain (POSE0 y est) mais jamais la machine pleine ; ce qui ne sert pas au plan est invisible (`town`, `trace`, `sat`, `sleeper` à 0 hors de la fin ; `depth` à 0 hors du principe) ; les molettes de la roue et les anneaux du tunnel sont des motifs fins : pas de survol rapide ; un quart de tour en une seconde est une coupe ; rien de clair ne traverse l'en-tête.
- **Une étiquette à la fois** en zone haute (436–790) ; elles existent toutes dans `index.html` (couleur fixée par identifiant). Le sujet entre y 440 et 1160 ; rien sous 1600 ; rien sous les boutons (x > 905, y 880–1760).
- Les poses de `VIEW` et `POSE0` sont **provisoires** (réglées sur bouchons) : partir des journaux des décors (`docs/journal/048-model.md`, `048-sol.md`, `048-rue.md`) et de `docs/048-actes-maj.md` s'il existe — ses lignes priment.

## acte1.js

**01 MENACE, 0 → 21,26.** Part de `POSE0` et de `FIRST`, sans coupe ; un seul mouvement si possible, deux coupes au plus. Rend la main à `tobench` sur la pose dont part le `benchCut` de l'acte 2 (à écrire en tête de ton journal) : la chambre de profil (`VIEW.profile`, coupe ouverte).

| Instant | Phrase | Image | Part du cadre |
| --- | --- | --- | --- |
| 0 → 0,26 | (image 0) | `POSE0` : la voiture de verre en haut à gauche qui roule vers −x (`carX` −400 → −1700 d'ici 3,7 s), la lueur de la cuvette sous ses roues, la colonne signal qui monte (`loose` 0,5 → 0,75), la roue qui tourne et la terre qui glisse vers elle (`face` 0,4 → 0,7) | voiture ≈ 45 % de la largeur, roue ≈ 45 % en bas |
| 0,26 → 1,25 | Ta rue *s'enfonce*. | `settle` 1 → 2 sur « s'enfonce » (punch 0,60) ; la mire grandit dans le cadre, son index descend | voiture + mire |
| 1,80 → 3,72 | Dessous, une machine vient de lâcher la +terre+. | la caméra plonge le long de la colonne vers la roue (`shot` par rapport) ; les blocs du front glissent sur « lâcher » 3,08 ; la chambre (coupe ouverte) laisse voir ses vides | roue ≈ 60 % |
| 4,26 → 6,60 | Ce qui la tenait ? De la terre, sous +pression+. | on entre dans la machine par la coupe : la chambre s'allume (`litChamber` 1, `earth` 1 en souvenir, `press` 1 : l'en-tête dit Équilibre), les flèches vertes pressent le front (`hold` 1) ; punch « pression » 6,04 | chambre ≈ 50 % |
| 7,07 → 9,48 | Et si cette terre pousse trop *fort*… ta rue fait quoi ? | `hold` 1 → 1,4, `press` 1,4 (Trop forte), `face` → −0,4 ; on remonte voir la chaussée : `settle` → −0,6 (« Monte », la mire au-dessus de zéro), puis l'image **se fige** sur « quoi ? » (hold 0,3) | colonne + chaussée |
| 10,40 → 11,90 | Au-dessus, une voiture roule. | coupe (la 1re) sur `VIEW.section` resserré sur la rue : retour à l'état de l'accroche (`press` 0,6, `earth` 0,7, `settle` 2) ; la voiture traverse | voiture ≈ 25 % |
| 12,26 → 13,70 | Un immeuble, six étages. | la caméra s'élève le long de la façade éclairée (`lights` 1) | immeuble ≈ 60 % de la hauteur |
| 13,86 → 15,60 | Devant la roue, la terre *s'écroule*. | plongée jusqu'au front (`VIEW.face`) : `face` 0,5 → 0,9 sous la voûte, la colonne grimpe (`loose` → 0,85) ; punch 15,01 | front + roue ≈ 55 % |
| 15,78 → 17,80 | Ta rue ne supporte qu'environ un centimètre. | on suit la lumière de la colonne qui monte jusqu'à la rue, et la mire (`VIEW.kerb`) : sa bande rouge à 10 ; `#chip-cm` de 16,63 à 17,9 ; `settle` 2 → 3 | mire ≈ 35 % de la hauteur |
| 18,23 → 19,70 | Tout se joue… derrière la +roue+. | redescente rapide le long de la machine jusqu'à la chambre, de profil (`VIEW.profile`, `cutaway` 1) ; punch « roue » 19,54 | machine ≈ 80 % |
| 20,48 → 21,26 | Alors… | presque immobile (une poussée lente) sur la chambre ; rien ne bouge que la roue | idem |

**Couture de sortie** : à 21,26, `VIEW.profile` (ou ta pose, écrite dans ton journal) ; état : `wheel` ≈ 1,2 (cumulé), `screw` ≈ 2, `cutaway` 1, le reste comme l'accroche. Pas d'étiquette visible après 20,4.

## acte2.js

**02 AUTOPSIE, 21,26 → 41,68.** L'établi, puis le principe dans la coupe.

| Instant | Phrase | Image | Part du cadre |
| --- | --- | --- | --- |
| 21,26 | (coupe) | `benchCut` depuis la pose de fin de l'acte 1, `origin: BENCH_FROM`, `state: BENCHED` (0 mm, Équilibre : le saut de l'en-tête se fait ici) | machine ≈ 80 % |
| 21,40 → 21,84 | …on l'ouvre. | `explode` 0 → 1 en ≈ 1,4 s, `cutaway` 0 → 1 ; la caméra recule vers `VIEW.exploded` | |
| 22,87 → 23,90 | Un tunnelier du Grand Paris. | la rangée entière (`VIEW.exploded`), `#chip-tunnelier` | rangée ≈ 90 % de la diagonale |
| 24,40 → 25,90 | Sa roue : presque dix mètres. | sur la roue (`VIEW.headBench`), `cote` 0 → 1 de 24,6 à 25,6, `litHead` ; `#chip-roue` dès « presque » 24,96 ; la roue tourne | roue ≈ 55 % |
| 26,24 → 29,20 | Derrière, une chambre pleine de terre, fermée par une cloison. | on glisse le long de la rangée : la chambre (`litChamber` sur « chambre » 27,00, `#chip-chambre`), puis la cloison (`litBulk` sur « cloison » 28,80, `#chip-cloison`) — deux pièces voisines, un cadre qui glisse | pièce nommée ≈ 45 % |
| 29,60 → 30,50 | Une vis l'en sort. | la vis tourne (`screw` +1,5), la terre y monte ; `litScrew`, `#chip-vis` | vis ≈ 60 % de la diagonale |
| 30,76 → 32,16 | Et au cœur… la +pression+. | la rangée se referme à moitié (`explode` → 0,4), `solo` 1 : la chambre, la cloison, le manomètre seuls ; `VIEW.gaugeBench` : l'aiguille se pose au vert sur « pression » 31,76 (`press` 0,9 → 1 ; punch) ; `#chip-coeur` | manomètre ≈ 30 %, chambre derrière |
| 32,66 | (coupe) | vers la coupe, `STAGED` + `VIEW.principle` : le front de profil, la roue derrière | |
| 32,81 → 33,60 | Pourquoi ça tient ? | le front seul, immobile ; `arrows` 0, `hold` 0 | front ≈ 40 % |
| 33,94 → 36,60 | Le sol pousse sur le front, la paroi devant la roue. | les flèches rouges entrent (`arrows` 0 → 1 de 34,1 à 34,9) et pressent la paroi | flèches + paroi ≈ 60 % |
| 36,92 → 39,10 | L'eau seule, c'est un bar tous les dix mètres de fond. | l'échelle de profondeur (`depth` 0 → 1) et la nappe (`water` 1) ; la caméra glisse le long de l'échelle ; `#chip-bar` de 37,72 à 39,3. **Aucun chiffre au niveau de la machine** | échelle ≈ 70 % de la hauteur |
| 39,44 → 41,40 | La chambre pousse pareil : rien ne +bouge+. | les flèches vertes sortent de la chambre (`hold` 0 → 1, rejointes sur « pareil » 40,24) ; `#chip-pareil` ; sur « bouge » 41,16, la paroi s'immobilise (`face` 0) | flèches ≈ 60 % |

**Couture d'entrée** : la pose de fin de l'acte 1 (son journal). **Couture de sortie** : 41,68, l'acte 3 coupe ; toute étiquette sortie à 41,5 ; état libre (l'acte 3 coupe sur `STAGED`). **Couverture** : propose un repère et une pose (`el` ≥ 28) où toute la rangée est éclairée et quelque chose luit (`episode.json → cover`, provisoire : `eclate$`, `VIEW.exploded` relevé à `el` 30).

## acte3.js

**02 → 03, 41,68 → 63,30** : le repos (encore « 02 Autopsie »), puis `setAct(tl, 3, t.tozero)`. Dans la coupe. Le repos est calme (`mood` 0) ; « lâche » le fait basculer (`mood` 1, franc) ; il retombe à 0 sur « s'arrête ». L'acte 3 se monte **en coupes**, un plan par souffle.

| Instant | Phrase | Image | Part du cadre |
| --- | --- | --- | --- |
| 41,68 | (coupe) | `STAGED`, `mood` 0, `VIEW.rear` : trois quarts arrière gauche | machine ≈ 70 % |
| 41,80 → 43,40 | Ses vérins poussent sur le dernier anneau : | `rams` 0 → 0,5, `litRams` ; la roue tourne, la vis aussi | vérins + anneau ≈ 50 % |
| 43,72 → 44,80 | sept voussoirs de béton. | `ring` 0 → 7 de 43,6 à 45,0 (un voussoir toutes les 0,2 s), `#chip-anneau` | anneau ≈ 45 % |
| 45,19 → 47,10 | La vis sort la terre au rythme où elle entre. | la caméra longe la machine vers l'avant jusqu'à la chambre (coupe ouverte) : la terre entre par la roue, sort par la vis, `earth` 1 stable ; `#chip-debit` | chambre + vis ≈ 60 % |
| 47,40 → 49,00 | Et là… la pression *lâche*. | sur le manomètre (`VIEW.gauge`) : l'aiguille décroche sur « lâche » 48,60 (`press` 1 → 0,65 ; en-tête « En chute »), `mood` 1 ; punch | manomètre ≈ 30 % |
| 49,27 | (coupe, impact) | `tozero` : la chambre de profil, serrée | |
| 49,39 → 50,50 | La chambre se *vide*. | `earth` 1 → 0,55 : des vides s'ouvrent sous la voûte ; punch « vide » 50,16 ; `#chip-lache` | chambre ≈ 55 % |
| 50,55 → 51,40 | Le front glisse. | `face` 0 → 0,9 : les blocs glissent vers la roue ; `loose` 0 → 0,5 | front ≈ 50 % |
| 51,67 → 53,20 | Ta rue descend : deux millimètres. | coupe (dans le souffle 51,4) sur la rue : `VIEW.kerb`, la mire ; `settle` 0 → 2 **sur « deux » 52,58** | mire ≈ 35 % de la hauteur |
| 53,56 | Cinq. | coupe : la voiture qui passe sur la cuvette qui rougit ; `settle` → 5 | voiture ≈ 35 % |
| 54,28 → 54,84 | Sept. | coupe : la coupe entière, la colonne de la voûte à la rue (`loose` 0,9) ; `settle` → 7 | colonne ≈ 70 % de la hauteur |
| 54,89 | (coupe, impact `zero$+0,05`) | la vis, serrée | |
| 55,18 → 56,10 | La vis *ralentit*. | `screw` freine net (la tween de `screw` s'aplatit), `litScrew` ; punch « ralentit » 55,44 (la coupe est à 54,89 : plus d'une demi-seconde avant) | vis ≈ 50 % |
| 56,35 → 57,10 | Les vérins poussent. | `rams` 0,5 → 0,7 d'un coup (la roue avance de ≈ 35 cm et gave la chambre), `litRams` | vérins ≈ 50 % |
| 57,39 → 58,40 | La chambre se remplit. | `earth` 0,55 → 1, les vides se referment, la terre se tasse | chambre ≈ 55 % |
| 58,59 → 59,60 | La pression +remonte+. | le manomètre : l'aiguille revient au vert sur « remonte » 59,12 (`press` → 1 ; Équilibre) ; punch | manomètre ≈ 30 % |
| 59,84 → 61,90 | Huit millimètres… et ta rue s'arrête. | la mire : `settle` 7 → 8 **sur « Huit » 59,84**, l'index s'arrête avant la bande rouge ; la voiture passe ; `mood` 0 sur « s'arrête » 61,32 | mire + voiture |
| 62,11 → 62,90 | Le front tient. | la coupe : `loose` retombe (0,9 → 0,35), `face` reste, `#chip-tient` | coupe entière |

**Couture d'entrée** : coupe à 41,68 (`torepos`), état complet. **Couture de sortie** : 63,30, la fin coupe ; état à la sortie : `settle` 8, `press` 1, `earth` 1, `mood` 0 (la fin les reprend explicitement).

## fin.js

**63,30 → 92,07** : chute → commentaire → like → prochain dossier → boucle. `retitle` (#retitle : « Son secret » ; « Il creuse » barré → « Il retient »), `D.verdict(t.verdict)` 67,21, `duelCall` (« Oui » / « Non », kicker « Sous chez toi ? » ; toneA `signal`, toneB `veille`), `likeCall`, `nextFile` (049, « Sans réglage, l'horloge d'un satellite avance de 38 millionièmes de seconde par jour. »), `D.loop`.

| Instant | Phrase | Image | Part du cadre |
| --- | --- | --- | --- |
| 63,30 | (coupe) | le cadre de l'accroche, presque figé (POSE0 un peu reculé) : `STAGED`, `settle` 8, `press` 1, `earth` 1, `arrows` 1, `hold` 1 (les flèches au front), `mood` 0 | voiture + roue |
| 63,42 → 65,60 | Voilà son secret : tu crois qu'un tunnelier creuse. | `retitle` entre à 64,9 (« tunnelier ») ; la caméra descend lentement vers la roue | |
| 65,98 → 67,70 | Il passe son temps à *retenir*. | barre à 66,2 (« passe »), « Il retient » sur « retenir » 67,21, le nom du compte s'allume (`verdict`) | |
| 67,90 → 70,14 | La terre devant lui… et ta rue +au-dessus+. | on remonte du front par la colonne (qui ne luit plus) jusqu'à la chaussée qui tient ; retitle sorti à 70,08 | colonne entière |
| 70,50 | (coupe) | `VIEW.principle`, `arrows` 1, `hold` 1 | |
| 70,62 → 72,00 | Et si cette terre pousse trop fort ? | `hold` → 1,4, `press` 1,4 (Trop forte), `face` → −0,6 : la paroi repoussée | flèches ≈ 60 % |
| 72,60 → 74,50 | Le sol se soulève : ta rue *monte*. | on remonte à la rue : `settle` 8 → −1 (« Monte »), la lueur en bombement, la mire au-dessus de zéro ; `#chip-souleve` ; punch « monte » 74,14 | rue + mire |
| 74,70 | (coupe) | `VIEW.town` : `town` 1, `trace` 0 → 1 de 75,1 à 77,0 | quartier plein cadre |
| 74,92 → 78,22 | En commentaire : sous chez toi, il passe un tunnel… oui, ou non ? | `duelCall` de 74,9, « Oui » sur `duelA` 77,66, « Non » sur `duelB` 78,14, jusqu'à `tolike` − 0,3 ; orbite lente | |
| 78,86 | (coupe) | `VIEW.bedroom`, `sleeper` 1 | fenêtre ≈ 25 % |
| 79,00 → 82,60 | Like : pour celui qui dort au-dessus d'un tunnelier, sans le savoir. | `likeCall` ; la caméra descend de la fenêtre, par la rue et la terre, jusqu'à la machine loin dessous qui avance d'un anneau (`rams` +0,2) — un long recul vertical **par rapport** | |
| 82,54 | (coupe) | `VIEW.sky` : la rue en bas du cadre, le ciel | |
| 82,68 → 90,20 | Abonne-toi : prochain dossier, ton GPS. Sans réglage… par jour. | `nextFile` (show 83,33, fait 85,6, hide 89,98 ; chevrons de 82,78 à 90,35) ; le satellite traverse (`sat` 0 → 1) ; rien du sujet ne revient | |
| 90,36 → 92,07 | Et pendant ce temps… | coupe au-dessus de `POSE0` (même azimut, `d` × 1,4) avec `FIRST` ; `D.loop` redescend sur `POSE0` (`rewindAt` 91,08) | = image 0 |

**Couture d'entrée** : coupe à 63,30 ; tous les nombres du dossier dits (`STAGED` + l'état de la chute). **Couture de sortie** : `D.loop` : la dernière image est la première — tire 0,04 et 92,0 côte à côte.

## Les candidates de la première image

Tirées sur bouchons (`.cache/planches/048/architecte/p5.jpg`) : **à retirer sur les vrais décors** (le bouchon de la chaussée et du trottoir fait des pans blancs, la colonne une dalle). Notées sur les six points de `docs/recette-agents.md` (1 événement en cours · 2 perspective · 3 menace derrière le sujet · 4 forme reconnue à 40 % · 5 système petit mais lisible · 6 bouge par son sujet).

**A · Plongée du 5ᵉ (recommandée, collée en `POSE0` provisoire).** D'une hauteur de cinquième étage au-dessus du trottoir proche, on regarde à pic à travers la rue de verre : la voiture grande en haut à gauche, la lueur de la cuvette sous ses roues, la colonne signal, la roue loin dessous dans la terre qui glisse. 1 ✓ (la voiture roule, la terre glisse, la colonne monte) · 2 ½ (plongée, pas contre-plongée : mais les lignes de la coupe filent vers la roue, le vertige du 003) · 3 ✓ (la colonne rouge derrière la voiture) · 4 ✓ (la voiture ≈ 45 %, vue d'où on ne la voit jamais : d'en haut, à travers la chaussée) · 5 ✓ (la roue en bas, ≈ 45 %) · 6 ✓ — **5,5/6**.
`{ "at": 0.04, "label": "A plongée du 5e", "pose": { "tx": -250, "ty": -700, "tz": 0, "d": 2663, "az": -30, "el": 55.7, "fov": 56, "shift": 80, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "carX": -400 } }`

**B · Face à la roue.** Dans la terre devant la machine, un peu sous l'axe : le disque en face, les blocs qui tombent, la colonne qui monte au-dessus ; la rue hors champ (ou sous l'en-tête). 1 ✓ · 2 ✓ (contre-plongée) · 3 ✓ · 4 ½ (un disque de tunnelier : connu, pas de tous ; la rue absente) · 5 ½ (le système est le sujet, la chambre invisible) · 6 ✓ — **4,5/6**.
`{ "at": 0.04, "label": "B face à la roue", "pose": { "tx": -250, "ty": -1050, "tz": 0, "d": 3900, "az": -70, "el": -8, "fov": 42, "shift": -60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "carX": -250 } }`

**C · La coupe de profil.** Le dossier vu comme une planche : l'immeuble, la voiture, la chaussée, la terre, la machine de profil. 1 ½ · 2 ✗ (à hauteur d'œil, un schéma) · 3 ½ · 4 ✗ (la voiture ≈ 12 %) · 5 ✓ · 6 ½ — **2,5/6** (témoin).
`{ "at": 0.04, "label": "C coupe profil", "pose": { "tx": 200, "ty": -700, "tz": 0, "d": 8200, "az": -14, "el": 3, "fov": 36, "shift": -120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "carX": -250 } }`

**D · De dos, en contre-plongée.** Sous et derrière la machine, on regarde vers l'avant et le haut : le bouclier, la colonne, la voiture tout en haut. 1 ½ · 2 ✓ · 3 ½ · 4 ✗ (le bouclier de dos ne se reconnaît pas) · 5 ✓ · 6 ½ — **3/6**.
`{ "at": 0.04, "label": "D de dos", "pose": { "tx": -300, "ty": -900, "tz": 0, "d": 2733, "az": 66.8, "el": -33, "fov": 56, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "carX": -250 } }`

À juger aussi à 0,5 s (le sujet ne sort pas du cadre, la voiture a bougé) ; si A gagne, sa pose et `FIRST` restent tels quels dans `world.js`.

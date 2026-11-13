# 047 · Lave-vaisselle — le plan des actes

Cinq fichiers, un agent chacun : `acte1.js` (0 → `tobench` 19,98), `acte2.js` (`tobench` → `torepos` 40,38, l'établi), `acte2b.js` (`torepos` → `tozero` 48,63, le repos dans la cuve), `acte3.js` (`tozero` → `toverdict` 64,90), `fin.js` (`toverdict` → 91,27). Lis ce haut commun, puis **ta section seulement** (`grep -n "^## " docs/047-actes.md`). Le contrat : `src/world.js` (`FIRST`, `VIEW`, `BENCHED`, `STAGED`), `src/plan.js`. Les décors : `docs/047-decors.md` (leurs journaux `docs/journal/047-*.md` donnent les poses vues). Instants : la voix réelle (`npm run script -- 047` ; mot à mot : `node .cache/planches/047/architecte/words.cjs episodes/047-lave-vaisselle/gen/episode.data.js`).

## La scène, et ce qu'on a le droit de montrer
Un plat à gratin croûté, retourné dans le panier du bas ; un programme éco lancé le soir ; la machine n'a que ses jets. **Jamais la cuve pleine** : au fond, un peu d'eau (`water` ≤ 1 = le puisard à ras bord). **Les dix litres** sont l'eau de tout le cycle : la colonne à côté de la machine (`litres`) et `#chip-10l` « Tout le cycle · Dix litres », jamais dans la cuve. **« La même eau »** ne vaut que pendant le lavage : à la chute, quand l'horloge s'étire à 3 h 30, l'eau se vide et se remplit (`water` 0,6 → 0 → 0,6, deux ou trois fois). Le bras n'a pas de moteur. La pastille « tombe » (pas « dans l'eau »). Aucun « toujours », aucun litre à la main, aucun chiffre que la voix ne dit pas, sauf l'en-tête (sourcé dans `sources`).

## L'en-tête
L'horloge = le programme éco (`cycle`, minutes → « 0 h 08 ») : 8 dans l'accroche (le prélavage déjà en route), **0 sur « Porte fermée »**, elle court doucement pendant la scène et le repos, saute à ≈ 34 sur « Lavage principal », court jusqu'à ≈ 80 pendant la réponse, **s'étire à 210 (3 h 30) sur « longtemps »**. Le compteur = la température de l'eau (`temp`, « 22 °C ») : il ne monte que sur « l'eau grimpe vers cinquante degrés » (zero) et s'arrête à 50. `main.js` borne à 50.

## Ce que tout acte respecte
- **La grille de rétention** (`docs/recette-actes.md`) : l'image bouge dès l'image 1 par son sujet (le bras tourne, ses jets frappent) ; de 10 à 25 s un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; un nouveau plan à chaque porte d'acte.
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe ni à moins d'une seconde d'un autre) : « cramé » 1,16 · « moitié » 5,24 · « éponge » 13,06 · « croûte » 16,50 · « filtres » 25,60 · « Sinner » 33,16 · « compensent » 39,60 · « moteur » 44,40 · « s'ouvre » 50,36 · « crache » 55,52 · « centaines » 62,40 · « lâche » 64,00 (dans le plan, sans coupe) · « force » 66,94 · « jamais » 79,74.
- **« Alors… on l'ouvre. »** seul dans son plan : de 19,34 la cuve et la cuisine s'effacent autour du circuit (`shell` 0, `room` 0 : acte 2), coupe sur l'établi en place à `tobench` 19,98, **l'éclaté s'ouvre sur « on »** (20,12). Rien d'autre dans ce plan, aucune étiquette.
- **La boucle** : la dernière image est `POSE0` + `FIRST`. `turn` est cumulatif : `fin.js` le pose à une valeur négative entière à la coupe `toloop` pour que le retour vers 0 tourne dans le bon sens à la bonne allure.
- **Anti-parasites** : ce que la caméra frôle est invisible (les paniers, toi) ; les jets ne défilent pas en traits fins ; les têtes de `passes` avancent d'au plus un septième de leur écart par image ; aucune lueur qui clignote ; `mood` franc (0 ou 1) ; plus d'un quart de tour en une seconde = une coupe.
- **Une étiquette à la fois** dans la zone haute (436–790) ; elle est sortie avant la coupe suivante. Étiquettes prêtes dans `index.html` : `chip-10l`, `chip-moitie`, `chip-50` · `chip-vanne`, `chip-puisard`, `chip-filtres`, `chip-pompe`, `chip-coeur`, `#sinner` · `chip-pastille`, `chip-moteur`, `chip-tient` · `chip-lavage`, `chip-passes` (son nombre `#passes-v` suit `passes`) · `chip-bonn`, `#retitle` (« Laver plus fort » barré → « Laver plus longtemps »), `#duel` (« Je rince encore » / « Plus jamais »), `#next` (048).
- **Le sujet** : entre y 440 et 1160, à gauche du centre s'il descend sous 880 ; les gros plans portent `CLOSE` (dof), tout le reste `dof: 0`.
- **Pilote plan-séquence** : il ne vaut que pour le 038 ; ici la recette courante (`shot` en `sine.inOut`, coupes à l'acte 3). Mais aucun plan fixe : chaque plan calme dérive (orbite lente).

## 01 · MENACE — `acte1.js` (0 → `tobench` 19,98)

Entrée : `POSE0`, `FIRST` (pas de coupe). Sortie : à 19,34 (« Alors… ») la caméra est sur `VIEW.system` (le bras sous le plat, de près) et y dérive jusqu'à 19,98 ; l'état de la cuve est celui de la scène (`jets` 1, `night` 1). L'acte 2 coupe à `tobench` depuis `VIEW.system`.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 0 → 1,56 | « Ton plat de gratin a cramé. » | `POSE0` : sous le panier, le plat retourné, sa croûte `signal` ; le bras tourne déjà (`turn` ≈ 0,9 tour/s, toute la scène), ses jets martèlent la croûte. La caméra glisse de 8 à 10° en `az` (jamais seule : le bras bouge). Punch « cramé ». | le plat ≥ 40 % de la largeur |
| 2,04 → 4,04 | « Ton lave-vaisselle a dix litres d'eau pour le décoller. » | La caméra descend sous le fond et recule par rapport, à travers la porte de verre, jusqu'à la machine entière vue au ras du sol (≈ candidate D) ; sur « litres » (3,00) la colonne de la machine se remplit (`litres` 0 → 1 en 0,8 s) et `chip-10l`. Le puisard : un peu d'eau. | la machine ≈ 45 % |
| 4,43 → 6,30 | « En moyenne, moitié moins d'eau que toi. » | On continue de reculer et de tourner jusqu'à `VIEW.kitchen` (la machine et les deux colonnes à sa droite ; l'évier est hors champ, il n'entre qu'au glissé vers `VIEW.sink`) ; sur « moitié » (5,24) la colonne de la main monte (`hand` 0 → 1) à côté de celle de la machine qui reste à mi-hauteur ; `chip-moitie` remplace `chip-10l`. Punch « moitié ». | les deux colonnes + la machine ≈ 50 % |
| 6,82 → 9,08 | « Mais ton rinçage, avant… il sert à quoi ? » | On glisse vers l'évier (`VIEW.sink`) : toi (`you` 1), le robinet ouvert (`tap`), l'assiette dessous (`rinse` 0 → 1 sur « rinçage » 7,20) ; sur « à quoi ? » (8,56) l'eau file au tuyau en `signal` (`drain` 1), on fige. | toi + l'évier ≈ 60 % |
| `toscene` 9,83 | — | **Coupe** sur `VIEW.door` : porte entrouverte (`door` 0,4), cuisine allumée (`night` 0), `you` 0, `tap` 0, `drain` 0, `eco` 0, `cycle` 0, `jets` 0, `litres` 0, `hand` 0. | |
| 9,97 → 10,50 | « Porte fermée, » | La porte claque (`door` → 0 en 0,35 s, son à 10,52). | la machine ≈ 50 % |
| 10,90 → 11,46 | « programme éco, » | Le voyant éco s'allume (`eco` 1, bip à 11,50). | |
| 11,82 → 12,40 | « tu vas dormir. » | La cuisine s'éteint (`night` 1) ; la caméra passe la porte de verre et entre dans la cuve (`VIEW.tub`). | |
| 12,90 → 14,30 | « Ni éponge, ni brosse. » | `ghosts` : l'éponge de verre apparaît sur « éponge » et s'efface, la brosse sur « brosse » et s'efface. Punch « éponge ». | la cuve ≈ 70 % |
| 14,70 → 15,90 | « Cinquante degrés au plus… » | Descente vers le fond : la résistance rougit (`heat` 0 → 0,6), `chip-50`. | résistance + puisard ≈ 40 % |
| 16,18 → 17,50 | « contre une croûte cuite au four. » | On lève les yeux vers la croûte sous le plat (`VIEW.crust` en route), `mood` 1. Punch « croûte ». | la croûte ≈ 50 % |
| 17,74 → 18,66 | « Il n'a que ses jets. » | Descente le long d'un jet jusqu'au bras (`VIEW.system`) ; les jets repartent (`jets` 0 → 1 sur « jets » 18,54). | le bras ≈ 60 % |
| 19,34 → 19,98 | « Alors… » | Dérive lente sur `VIEW.system` (l'acte 2 efface la cuve). | |

## 02 · AUTOPSIE — `acte2.js` (`tobench` 19,98 → `torepos` 40,38)

Entrée : `benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCH_FROM, state: BENCHED })` ; avant, de `ouvre` (19,34) à `tobench`, `st` efface `shell`, `room` (la cuve et la cuisine fondent autour du circuit). Sortie : à 40,38 l'établi, le système assemblé, `sinner` 0 ; l'acte 2b coupe dans la cuve.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 19,98 → 21,40 | « …on l'ouvre. » | Le circuit en place sur son halo ; **`explode` 0 → 1 sur « on »** (20,12, 1,2 s) ; recul par rapport vers `VIEW.exploded`. Aucune étiquette. | l'éclaté ≈ 70 % de la hauteur |
| 21,52 → 23,00 | « L'eau entre par une électrovanne. » | Glisse vers la vanne : `inlet` 1, `litValve` ; `chip-vanne`. | la vanne + l'orifice ≈ 35 % |
| 23,40 → 26,00 | « Elle tombe au fond, dans le puisard, à travers ses filtres. » | On suit l'eau : elle descend à travers la colonne des trois filtres soulevés et tombe au puisard (`water` 0 → 0,6) ; `litSump` sur « puisard » (24,48, `chip-puisard`), puis les trois filtres s'allument du grossier au microfin sur « filtres » (25,60, `chip-filtres`, punch). | la colonne des filtres ≈ 45 % |
| 26,35 → 28,10 | « Une pompe l'aspire, la renvoie… » | La pompe (`pump` 1, `litPump`, `chip-pompe`) ; les têtes de `passes` courent du puisard au tube (`loop` 0,5 sur ce tronçon). | pompe + tube ≈ 40 % |
| 28,37 → 29,76 | « …et au bout, le bras d'aspersion. » | On monte au bras (`VIEW.arm`) : `solo` 1, `litArm` 1, `jets` 1, `turn` qui reprend ; `chip-coeur` (Le cœur · Bras d'aspersion). | le bras ≈ 70 % de la largeur |
| 30,49 → 31,10 | « Pourquoi ça lave ? » | `explode` → 0, `solo` → 0 : le circuit se remonte ; recul vers `VIEW.principle` (sujet bas, place pour le panneau). | le système ≈ 55 % |
| 31,56 → 34,60 | « Les pros l'appellent le cercle de Sinner : quatre leviers. » | `#sinner` entre (`sinner` 0 → 1 sur « cercle » 32,68) ; punch « Sinner ». | panneau en zone haute, système dessous |
| 34,88 → 37,90 | « La chaleur, le temps, le produit, la force des jets. » | Chaque mot allume son arc et sa pièce : « chaleur » 35,00 la résistance (`heat` 1) · « temps » 35,88 l'horloge de l'en-tête (un saut de l'aiguille : `tl` sur `#hud-clock`) · « produit » 36,44 la trappe (`litTrap`) · « force » 37,32 les jets (`jets` 1, `turn`). | |
| 38,24 → 39,96 | « Si l'un baisse, les autres compensent. » | Sur « baisse » (38,56) `sHeat` 1 → 0,4 et `heat` → 0,25 (la résistance pâlit) ; l'arc du temps grandit d'autant, le cercle reste plein ; punch « compensent ». `sinner` → 0 avant 40,1. | |

## 02 · AUTOPSIE — `acte2b.js` (`torepos` 40,38 → `tozero` 48,63)

Entrée : **coupe** à `torepos` sur `VIEW.dispenser`, `{ ...STAGED, night: 1, eco: 1, jets: 0.4, water: 0.4, heat: 0, trap: 0, tab: 0, mood: 0, cycle: 2 }` (le prélavage : un peu d'eau, des jets qui éclaboussent la trappe fermée). Sortie : à 48,63 sur `VIEW.crust` resserré, la croûte intacte, `mood` 1 ; l'acte 3 coupe.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 40,51 → 41,90 | « Sa pastille attend, enfermée : » | Le distributeur fermé sur la face intérieure de la porte (vu de la cuve, az ≈ −150) ; `litTrap` qui respire ; `chip-pastille` sur « enfermée » (41,56). | le distributeur ≈ 45 % |
| 42,33 → 43,40 | « elle ne tombera pas au hasard. » | Approche lente ; une gerbe de jet vient frapper la trappe, qui tient. | |
| 43,76 → 44,75 | « Le bras n'a pas de moteur : » | **Coupe** (43,64) sur `VIEW.hub` : le moyeu vide, rien dessous que le tube ; `chip-moteur` sur « moteur » (44,40), punch. | le moyeu + un demi-bras ≈ 50 % |
| 45,19 → 46,60 | « ses propres jets le font tourner. » | Les jets de bout sortent (`jets` 0,6), `thrust` 1 : les flèches de poussée ; le bras démarre À L'OPPOSÉ (`turn` qui accélère). | le bout du bras et sa flèche |
| 46,80 → 48,28 | « Et ta croûte… tient toujours. » | On remonte le long d'un jet jusqu'à la croûte (`VIEW.crust`) : intacte, `mood` 1 ; `chip-tient` sur « tient » (47,77). | la croûte ≈ 55 % |

## 03 · RÉPONSE — `acte3.js` (`tozero` 48,63 → `toverdict` 64,90)

Entrée : **coupe** à `tozero` (plan large de la porte vue de la cuve, distributeur et fond), `{ ...STAGED, night: 1, eco: 1, mood: 1, cycle: 34, jets: 0.4, water: 0.6, trap: 0, tab: 0, heat: 0, temp: 22 }` ; l'horloge de l'en-tête saute (flash bref sur `#hud-clock`). Sortie : à 64,90 la croûte tombée (`crack` 1, `crust` 1 tenu), `mood` 0, `loop` 1 ; la fin coupe.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 48,75 → 49,80 | « Lavage principal. » | `chip-lavage`. | |
| 49,92 → 50,68 | « Sa trappe s'ouvre. » | **De profil** (az ≈ −100, coupe à 49,8) : la trappe tombe ouverte sur « s'ouvre » (`trap` 0 → 1 en 0,15 s à 50,36), punch. | le distributeur ≈ 45 % |
| 50,96 → 51,80 | « La pastille tombe, » | `tab` 0,3 → 0,55 : elle tombe jusqu'au fond, la caméra la suit. | |
| 52,00 → 53,56 | « et l'eau grimpe vers cinquante degrés. » | Au fond : la pastille fond (`tab` → 1), la résistance rougit (`heat` 1), l'en-tête monte de 22 à 50 (`temp`) et s'arrête. | puisard + résistance ≈ 45 % |
| 54,07 → 54,90 | « La pompe aspire. » | **Coupe** (53,95) sur `VIEW.section` : la cuve en coupe plein cadre ; `pump` 1, `loop` 1, les têtes partent du puisard vers la pompe (`passes` 0 → 0,4). | toute la machine ≈ 80 % |
| 55,16 → 56,00 | « Le bras crache. » | `jets` 1, le bras s'emballe (`turn`) ; punch « crache ». | |
| 56,40 → 57,40 | « L'eau frappe la croûte, » | Approche vers le plat : les impacts sur la croûte. | la croûte ≈ 45 % |
| 57,60 → 59,90 | « retombe, traverse les filtres… et repart. » | On suit l'eau qui retombe au fond, passe les filtres (`litSump`), remonte par le tube : la boucle se ferme. | la boucle entière |
| 60,36 → 61,90 | « La même, pendant tout le lavage. » | `chip-passes` : le compteur défile (`passes` accélère), l'horloge court (`cycle` 34 → 80). | |
| 62,24 → 63,30 | « Des centaines de fois. » | `passes` → ≈ 300, la boucle la plus vive (têtes en traînées) ; punch « centaines ». `chip-passes` sort à 63,3. | |
| 63,47 → 64,32 | « Et la croûte lâche. » | **Sans coupe** : la caméra qui s'approchait du plat continue, à `trigger` 63,95 `crack` 0 → 1 (1 s), les plaques tombent dans le filtre grossier ; `jolt` ; `mood` → 0 juste après (64,1). | le plat ≈ 50 % |

## Fin — `fin.js` (`toverdict` 64,90 → 91,27)

Entrée : **coupe** à `toverdict` sur `POSE0` figé, `{ ...STAGED, crust: 0, crack: 0, jets: 0, loop: 0, mood: 0, water: 0.6 }` (le plat propre au cadre de l'accroche, le bras arrêté, la petite flaque). Sortie : la dernière image = `POSE0` + `FIRST` (`D.loop`).

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 65,02 → 66,95 | « Voilà son secret : il ne mise pas sur la force. » | `#retitle` (« Laver plus fort ») ; barré sur « force » (66,94). | le plat ≈ 45 % |
| 67,54 → 69,42 | « Il lave plus longtemps… avec la même eau. » | « Laver plus longtemps » sur « longtemps » (68,18) ; `D.verdict(t.verdict)` ; l'horloge s'étire 80 → 210 (3 h 30) ; pendant ce temps l'eau se vide et se remplit (`water` 0,6 → 0 → 0,6 → 0 → 0,6) ; sur « la même eau » (68,98) la boucle se referme une fois (`loop` 1, une respiration). | |
| 70,21 → 71,60 | « Et ton rinçage, avant ? » | **Coupe** à `tocta` 70,09 sur `VIEW.sink` : toi, l'assiette sous le robinet (`you` 1, `tap` 1, `rinse` 1), cuisine allumée (`night` 0). | toi + l'évier ≈ 60 % |
| 71,88 → 75,40 | « Une étude a suivi deux cents foyers : ce rinçage est le plus souvent inutile. » | `chip-bonn` (sorti à 76,9) ; lente orbite. | |
| 75,82 → 76,80 | « Il gaspille de l'eau. » | `drain` 1 : l'eau descend en `signal` dans le tuyau et entre dans le mur. | |
| 77,08 → 79,98 | « En commentaire : toi, tu rinces encore… ou plus jamais ? » | `duelCall` : « Je rince encore » (`signal`) sur `duelA` 78,90, « Plus jamais » (`veille`) sur `duelB` 79,74 ; le curseur attend. **Jamais la réponse tapée.** | |
| 80,68 → 83,64 | « Like : pour celui qui rince chaque assiette… avant de la laver. » | **Coupe** à `tolike` 80,54 sur `VIEW.door` (`you` 0, `tap` 0, `drain` 0, `crust` 0) : le plat propre, la porte se referme doucement ; `likeCall`. | la machine ≈ 50 % |
| 84,01 → 88,76 | « Abonne-toi : prochain dossier, le tunnelier : une roue de près de dix mètres qui creuse sous Paris. » | `nextFile` (« Prochain dossier · 048 », le fait seul) ; la caméra descend lentement vers le sol de la cuisine (`night` 1). Plus rien du sujet ne revient après. | |
| 89,42 → 90,64 | « Et juste au-dessus, chez toi… » | **Coupe** à `toloop` 89,30 sur `VIEW.below` (sous la grille du plancher, on lève les yeux), `{ ...STAGED, crust: 1, jets: 1, mood: 1, night: 1, turn: −2 }` ; on remonte à travers le sol jusque sous le panier : `D.loop({ at: t.toloop, rewindAt: t.rewind, fromD: VIEW.below.d })`. | |

## La première image — quatre candidates (à tirer sur les vrais décors, `look --file essais.json`)

Notées sur les six points de `docs/recette-agents.md` (événement · perspective basse · menace derrière · forme reconnue sur 40 % · système petit mais lisible · bouge par son sujet). Toutes avec l'état de `FIRST` (`turn` qui court : l'acte 1 le fait tourner dès l'image 1). Vues sur bouchons (planches `p2`, `p3`, `p4` de l'architecte).

| | Candidate | 1 | 2 | 3 | 4 | 5 | 6 | |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **A** | Sous le panier, contre-plongée (`POSE0` provisoire) | ✓ | ✓ | ~ (la croûte sur le sujet même) | ~ (un plat vu de dessous) | ✓ | ✓ | 4,5 |
| **B** | Au ras du bras : un bout de bras passe devant l'objectif | ✓ | ✓ | ✓ | ~ | ✓ | ✓✓ | 5 |
| **C** | Le long d'un jet, du bras à la croûte (grand angle) | ✓ | ✓✓ | ✓ | ✗ (abstrait) | ✓ | ✓ | 4,5 |
| **D** | La machine entière, au ras du sol de la cuisine | ✓ | ✓ | ✓ | ✓✓ (un lave-vaisselle) | ✓ | ~ (bras petit à 270 px) | 5 |

Lecture sur bouchon : **B** a le plus de mouvement (un jet frôle l'objectif : à vérifier sans image parasite, sinon reculer `d` de 10) ; **D** est la seule qui dise « lave-vaisselle » en un tiers de seconde ; **A** est le meilleur cadre pour la croûte. Mon choix provisoire : **A** (collée dans `POSE0`) ; à trancher entre A, B et D sur les vrais décors.

```json
[
  { "at": 0.02, "label": "A sous le panier", "pose": { "tx": -2, "ty": 26, "tz": 2, "d": 62, "az": -34, "el": -20, "fov": 50, "shift": 40, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
  { "at": 0.02, "label": "B au ras du bras", "pose": { "tx": 4, "ty": 24, "tz": 0, "d": 48, "az": -80, "el": -10, "fov": 56, "shift": 20, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
  { "at": 0.02, "label": "C le long d'un jet", "pose": { "tx": -2, "ty": 29.5, "tz": 2, "d": 20, "az": -30, "el": -34, "fov": 70, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
  { "at": 0.02, "label": "D la machine au sol", "pose": { "tx": 0, "ty": 40, "tz": 10, "d": 250, "az": -30, "el": -6, "fov": 34, "shift": 80, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
  { "at": 0.5, "label": "A à 0,5 s", "pose": { "tx": -2, "ty": 26, "tz": 2, "d": 62, "az": -34, "el": -20, "fov": 50, "shift": 40, "side": 0, "roll": 0, "drift": 0, "dof": 0 } },
  { "at": 0.5, "label": "B à 0,5 s", "pose": { "tx": 4, "ty": 24, "tz": 0, "d": 48, "az": -80, "el": -10, "fov": 56, "shift": 20, "side": 0, "roll": 0, "drift": 0, "dof": 0 } }
]
```

## Ce qui reste fragile (à regarder en premier sur les planches)
- `VIEW.kitchen` : toi au premier plan entre la caméra et l'évier (bouchon) — l'acte 1 ne fait entrer `you` que sur le plan de l'évier.
- L'en-tête sur `VIEW.hub` (45,6 s) : contraste des libellés d'actes en défaut sur bouchon (sujet clair derrière) — vérifier sur le vrai décor.
- Les jets en gros plan (B, `VIEW.hub`) : le risque d'image parasite du film.

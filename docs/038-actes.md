# 038 · Sous-marin — le plan de mise en scène

**La voix est enregistrée** (`eleven_v4_turbo`, une prise, **92,6 s**) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues` : 83, vérifiés mot à mot sur la table ; image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur**. Les secondes ci-dessous servent à se repérer (`npm run script -- 038`). Cinq fichiers, un agent chacun : `acte1.js`, `acte2.js`, `acte2b.js`, `acte3.js`, `fin.js` (des squelettes qui construisent, à réécrire en entier). Forme : `episodes/017-irm/src/acte*.js` ; fin : `kit/template/src/fin.js` ; outils : `kit/lib/direct.js`, `kit/lib/blocks.js`. Les poses qui cadrent seront dans les journaux des décors (`docs/journal/038-sousmarin.md`, `038-mer.md`) : pars d'elles, `VIEW` a été réglé sur des bouchons.

## Ce qui vaut pour tous

- **Le cas est réel** (USS San Francisco, 8 janvier 2005, `sources`) : à 160 m et à pleine vitesse, une montagne absente de la carte ; la proue écrasée, les ballasts avant déchirés ; le chef de quart lâche la chasse d'urgence ; **l'air fuit par l'avant, l'arrière remonte le bateau, lentement**. Il **crève la surface sans en sortir — jamais il ne jaillit**. Aucun nœud, aucune durée de remontée, **aucune heure** à l'écran. **Le marin mort n'est jamais un ressort dramatique** : la voix le dit une fois, l'image reste sobre (le bateau immobile sous le ciel bas), aucun corps, aucun son, aucun `punch` sur cette phrase.
- **L'en-tête est la profondeur et sa pression** (`main.js`) : en grand « PROFONDEUR 160 m », puis « PRESSION ×17 » (signal en profondeur, encre près de la surface). **Tu ne les écris jamais : tu bouges `depth`.** Pendant la remontée les chiffres intermédiaires sont illustratifs (la voix n'en dit aucun) : `depth` descend en une phrase, jamais en une durée annoncée. Pas de chrono : la voix ne dit aucun temps.
- **Le bateau ne bouge pas, la mer bouge** (`plan.js`) : `gap` (m) rapproche la roche, `depth` (m) déplace la surface et la roche, `pitch` incline le bateau. La proue est vers −x. **Azimut** : `az` 0 en +z (flanc bâbord, éclairé), −90 devant la proue, +90 derrière. **Le cadre vertical est étroit** (≈ 30° de large à fov 50) : un plan large du bateau entier se tient **de trois quarts arrière, `az` 60–70** (de profil, on n'a qu'un tronçon de tube — vu sur bouchons) ; la proue avec la roche au-delà, `az` 60–90.
- **Deux lieux, un objet.** L'établi est posé **sur place**, sous l'avant du bateau (`BENCHAT`) : une coupe vers l'établi (`SET.BENCH`) éteint la mer, la roche et l'équipage, pâlit la coque — le système reste où il est, la même pose raccorde. Une coupe dit tout son état : `{ ...STAGED, … }` ou `{ ...BENCHED, … }`, plus `depth`, `gap`, `crush`, et les nombres de l'air. Sur l'établi, le bateau est **intact** (`crush` 0 : l'établi montre le système tel qu'il est construit) ; dans la mer après le choc, `crush` 1.
- **Chaque phrase a sa démonstration**, sur le mot. **Chaque coupe est un raccord** (forme, objet, mouvement) et se pose quelques images avant sa phrase, dans un souffle (les repères `to…` sont 0,12 s avant le beat ; `crash` est 0,3 s avant « Le choc »).
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe, jamais à moins d'une seconde) : *montagne* (`choc` 1,56), *l'ignore* (`ignore` 9,16), *canette* (`canette` 11,94), +urgence+ (`urgence1` 18,74), +eau+ (`eau1` 29,52), +kilos+ (`kilos` 37,64), *intact* (`intact` 45,32), +chasse+ (`chasse2` 47,20), *derrière* (`derriere1` 50,44), *s'échappe* (`echappe` 53,68), +monte+ (`monte` 57,84), *pas* (`verdict` 65,10), +arrière+ (`arriere` 68,94). `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **« Alors… on l'ouvre. »** (20,06 → 21,28) est seul dans son plan : « Alors… » se dit sur la commande pendant que la caméra suit son fil vers les vannes ; la coupe vers l'établi tombe dans le souffle (`tobench` 20,70) ; **l'éclaté s'ouvre SUR « l'ouvre »** (`explode` 20,96). Le son : `suck` jusqu'à `ouvre−0,04`, `hush` de `ouvre` à `explode`, l'impact après « l'ouvre » (21,34).
- **La grille de rétention** (`docs/recette-actes.md`) : l'image 1 bouge par son sujet (le bateau fonce : la neige file, l'hélice, la roche grandit — `gap` se ferme de 120 à 0 jusqu'à `crash`, au temps réel) ; de 10 à 25 s, un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; chaque porte d'acte, une coupe franche et son son (déjà dans `sfx`). **Les sons sont posés** (`episode.json` → `sfx`, 37 entrées, toutes dans les souffles sauf `rewind`, sous la boucle) : n'en ajoute pas sans le dire.
- **La boucle** : « Comme ce jour où… » retombe sur « Ton sous-marin fonce… » ; **la dernière image est la première** (`POSE0`, `FIRST`, `gap` 120 qui se referme).
- **Couleurs** : `mood` 1 de l'image 0 au repos ; 0 sur l'établi (éclaté, principe) et au début du repos ; 1 de « Mais » (`mais` 43,52) jusqu'à « La surface » (`surface` 58,72), 0 ensuite. Jamais à mi-chemin plus d'une demi-seconde. Le vert (veille) n'est que l'air et la commande.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule chose à la fois : `#carte`, une étiquette, `#cartes`, `#net`, `#next`) · sujet 440–1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie AVEC l'en-tête. La lumière suit le sujet : `fx, fy, fz` autour de lui, `fs` sa taille (≈ 4 000 la proue, ≈ 12 000 le bateau entier, ≈ 600 un ballast, ≈ 150 la commande, `SIZE` 900 sur l'établi).
- **Anti-parasites** : ce que la caméra frôle est invisible (la caméra passe sous la coque : jamais à travers un ballast plein) ; un quart de tour en une seconde est une coupe ; un recul de 40 m à 200 m se fait **par rapport** (`shot(at, durée, pose, ease, fromD)`) ; la neige qui file et les bulles ne doivent pas scintiller (`qa`) — si un plan scintille, baisse `speed` ou `leak`, pas la taille.
- L'équipage est de verre : jamais en gros plan, personne n'est blessé à l'image (`jolt` les jette vers l'avant, ils se rattrapent ; revenu à 0 après la scène).
- **`FIRST` est une liste fermée** (aucun nom de propriété de GSAP) : s'il te manque un nombre, « À changer ailleurs ». Étiquettes en capitales, sans unité à symbole ; les nombres affichés avec l'espace (« 7 000 », « 1 000 »). **26 images lues au plus.** Journal : `docs/journal/038-<ton fichier>.md`. Planches et `essais.json` dans `.cache/planches/038/<ton fichier>/`, jamais dans le dépôt ni dans `renders/`.

**Les étiquettes et panneaux** (`index.html`, invisibles tant qu'un acte ne les fait pas entrer) : `#carte` (panneau, zone haute : Carte de bord / Ta route — la route en tirets veille, et devant le bateau un cercle vide « Devant toi · rien ») · `chip-tonnes` (Ton sous-marin / 7 000 tonnes, signal) · `chip-chasse` (Il reste / La chasse d'urgence, veille) · `chip-coeur` (Le cœur / Les ballasts, veille) · `chip-archimede` (Archimède / Il pèse l'eau qu'il déplace, veille) · `chip-tonne` (Un mètre cube d'air / 1 000 kilos en moins, veille) · `chip-intact` (À une condition / Un réservoir intact, veille) · `chip-eventres` (Devant / Ballasts éventrés, signal) · `chip-arriere` (Derrière / Ballasts intacts, veille) · `#retitle` (Ce qui t'a remonté : « Une chasse intacte » barré → « Grâce à l'arrière ») · `chip-ssn` (USS San Francisco · SSN-711 / Janvier 2005, encre) · `#cartes` (deux cartes côte à côte : « Ta carte · 1989 — Rien » et « Autre carte · À bord — Danger signalé ») · `#duel` (La carte ou Ceux qui la lisent) · `#net` (like) · `#next` (Prochain dossier / Classé — « Un système qui dort près de toi. ») · `.rail`. Les pièces se nomment avec `co.add`, sans chiffre (« Bouteilles d'air », « Vanne », « Commande », « Ballast », « Coque épaisse », « Coque légère »).

---

## `src/acte1.js` — 01 · MENACE (0 → `tobench` 20,70)

Part de `POSE0` et de `FIRST`, sans coupe ; deux coupes au plus (`crash`, puis le poste), le reste en mouvements. `gap` 120 → 0 en `"none"` de 0 à `crash` 10,04 (le bateau fonce au temps réel) ; `speed` 1 jusqu'au choc.

| repère | la voix | l'image — la part du cadre que tient le sujet |
| --- | --- | --- |
| 0 → 1,96 | « Ton sous-marin fonce dans une *montagne*. » | `POSE0` : sous la coque, l'avant du bateau ≈ 45 % de la largeur, la paroi sort du noir derrière la proue, la neige file ; la caméra suit le bateau en poussant vers la proue (famille `bowD`). Aucun texte à l'image 0. Sur `choc` 1,56 : `D.punch` ; le liseré signal de la roche s'avive |
| 2,32 → 3,40 | « Elle n'est pas sur ta +carte+. » | sur `carte1` 3,20 : `#carte` en zone haute (la route, le cercle vide là où se dresse la roche) — jusqu'à ≈ 5,4 ; le bateau continue |
| 3,87 → 5,40 | « Pour remonter, tu n'as que de l'+air+. » | la caméra file le long de la coque (par rapport, `sine.inOut`) jusqu'aux bouteilles (`VIEW.bottles`, ≈ 50 % de la largeur) ; `litBank` sur `air1` 5,12 |
| 5,72 → 6,76 | « Contre 7 000 tonnes. » | recul au bateau entier (`VIEW.mass`, ≈ 70 % de la largeur) ; `weight` 0 → 1 sur `mille7` 6,08 ; `chip-tonnes` sur `tonnes` 6,56 |
| 7,39 → 9,56 | « Et cette montagne… pourquoi ta carte l'*ignore* ? » | on file vers la proue (`VIEW.near`, de 3/4 arrière bas) : la roche à quelques mètres (`gap` ≈ 8 à `ignore`) ; `#carte` revient sur `montagne2` 7,64, le cercle vide ; `D.punch` sur `ignore` 9,16 ; `weight` → 0 |
| `crash` 10,04 → 12,26 | « Le choc écrase ta proue comme une *canette*. » | **coupe 1** dans le souffle (`VIEW.impact`) : `crush` 0 → 1 de `crash` à `canette` (`power3.out` puis tient), `speed` → 0, la proue ≈ 60 % ; `D.punch` sur `canette` 11,94 ; `#carte` sorti avant |
| 12,62 → 13,70 | « Des marins sont projetés. » | **coupe 2** (raccord : de la proue au poste, même secousse) `VIEW.crew` : `jolt` 0 → 1 sur `projetes` 13,22, les silhouettes ≈ 40 % du cadre, aucune en gros plan |
| 14,05 → 16,74 | « À 160 mètres : 17 fois la pression de surface. » | recul par rapport jusqu'au bateau entier (`VIEW.press`) ; `press` 0 → 1 sur `pression` 16,06 ; l'en-tête « ×17 » bat une fois (échelle 1,15) sur « dix-sept » (`scene:fois−0,35`) ; `jolt` → 0 |
| 17,18 → 19,22 | « Il reste un geste… la chasse d'+urgence+. » | plongée par rapport vers la commande (`VIEW.cmd`, la commande ≈ 30 % de la largeur, nette, le chef de quart flou devant) ; `litCmd` sur `geste` 17,70 ; `chip-chasse` sur `chasse1` 18,50 ; `D.punch` sur `urgence1` 18,74 |
| 19,22 → `tobench` 20,70 | « Alors… » | la caméra quitte la commande et suit son fil jusqu'aux vannes et au tuyau (vers `VIEW.system`) ; `sea` → 0,4 ; `mood` reste 1 |

**Couture de sortie** : la pose où tu arrives (famille `VIEW.system`), `crush` 1, `depth` 160, `gap` 0, `speed` 0, `jolt` 0, `cmd` 0, `litCmd` ≤ 1. L'acte 2 coupe de là sur l'établi.

## `src/acte2.js` — 02 · AUTOPSIE : « on l'ouvre », l'éclaté (`tobench` 20,70 → `toprincipe` 30,21)

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `tobench` 20,70 | *(souffle, après « Alors… »)* | **coupe sur l'établi, même pose** que la fin de l'acte 1, `{ ...BENCHED, crush: 0, depth: 160 }` — le raccord tient sur place ; `setAct 2` |
| `explode` 20,96 → 21,28 | « …on l'ouvre. » | sur « l'ouvre » : `explode` 0 → 1 (`power2.out`, ≈ 1,2 s), recul vers `VIEW.exploded` (le chemin de l'air ≈ 80 % de la hauteur utile) |
| 22,23 → 24,00 | « Au départ, des bouteilles d'air comprimé. » | `VIEW.bank` : `litBank` sur `bouteilles` 23,09 ; `co.add` « Bouteilles d'air » |
| 24,48 → 25,76 | « Une commande ouvre leurs vannes. » | `litCmd` sur `commande` 24,72 (la commande, son fil qui court jusqu'aux vannes) ; `VIEW.valve` : `valves` 0 → 1 sur `vannes` 25,52, la poignée pivote (la vanne ≈ 40 %) ; `co.add` « Vanne » |
| 26,24 → 27,44 | « L'air file vers les ballasts : » | `flowF` 0 → 1 de `air2` à `ballasts1` 27,12 : le front vert court dans le tuyau, la caméra le suit (par rapport) jusqu'aux ballasts avant |
| 27,73 → 29,04 | « des réservoirs autour de la coque… » | `litTank` sur `reservoirs` 27,84, `litHull` sur `coque` 28,80 : entre coque épaisse et coque légère |
| 29,32 → 29,68 | « pleins d'+eau+. » | `VIEW.tank` : `heart` 1 sur `pleins` 29,32 (le ballast avant bâbord en coupe, plein d'eau sombre, ≈ 45 %) ; `chip-coeur` ; `D.punch` sur `eau1` 29,52 |

**Couture de sortie** : l'établi, `VIEW.tank`, `heart` 1, `explode` 1 (ou 0,6 si le ballast se lit mieux), `valves` 1, `flowF` 1, `airF` 0. **Couverture** (`cover`, instant `eclate$`) : propose la pose et l'état (éclaté, `flowF` 1, tout le système éclairé, `el` ≥ 28).

## `src/acte2b.js` — le principe et le repos (`toprincipe` 30,21 → `tozero` 45,99)

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `toprincipe` 30,21 → 31,08 | « Pourquoi ça remonte ? » | **coupe** (raccord : le même ballast, plus près) `VIEW.cube`, établi, `heart` 1, `explode` 0 ; le ballast en coupe ≈ 55 %, l'eau sombre dedans |
| 31,48 → 34,52 | « Archimède : ton bateau pèse autant que l'eau qu'il déplace. » | recul par rapport au bateau entier sur l'établi (`VIEW.whole`, `heart` 0) : `weight` 0 → 0,6 sur `pese` 32,92, `lift` 0 → 0,6 sur `deplace` 34,12 — deux flèches égales, l'équilibre ; `chip-archimede` sur `archimede` 31,48 |
| 35,00 → 36,76 | « Un mètre cube d'eau remplacé par de l'air… » | retour au ballast (`VIEW.cube`, par rapport) ; `cube` 0 → 0,5 de `cube` 35,40 à `air3` 36,52 : le mètre cube se découpe, l'air vert le pousse par le bas |
| 37,16 → 38,12 | « c'est 1 000 +kilos+ en moins. » | `cube` 0,5 → 1 sur `mille1` 37,36 : le cube d'eau sort et tombe hors du cadre ; `lift` → 1 (si le cadre la montre) ; `chip-tonne` ; `D.punch` sur `kilos` 37,64 |
| `repos−0,12` 38,47 → 39,88 | « L'air attend dans ses bouteilles. » | **coupe dans la mer** (raccord : le bateau entier, même famille de pose) `VIEW.whole` : `{ ...STAGED, depth: 160, gap: 0, speed: 0, crush: 1, mood: 0 }` — le bateau blessé, calme, la roche derrière la proue ; `litBank` 0,6 (les bouteilles vertes) |
| 40,36 → 41,64 | « La mer remplit les ballasts. » | `litTank` sur `mer` 40,60 : les quatre ballasts pleins d'eau sombre ; la caméra glisse lentement vers l'arrière |
| 42,00 → 43,00 | « Un geste lâche tout. » | `litCmd` sur `geste2` 42,12 (la commande luit, au poste) |
| 43,52 → 45,72 | « Mais l'air ne chasse l'eau… que d'un réservoir *intact*. » | `mood` → 1 sur `mais` ; `VIEW.aft` (le ballast arrière fermé, intact) sur « chasse l'eau » ; **coupe** sur `intact`−0,2 (raccord de forme : ballast arrière → ballast avant) `VIEW.torn` : la déchirure, l'eau qui entre et sort librement ; `chip-intact` ; `D.punch` sur `intact` 45,32 |

**Couture de sortie** : la mer, `VIEW.torn`, `crush` 1, `mood` 1, `cmd` 0, `valves` 0, `bank` 1, l'air à 0.

## `src/acte3.js` — 03 · RÉPONSE (`tozero` 45,99 → `toverdict` 62,82)

En coupes, un plan par souffle. Les deux traits verts partent ensemble ; l'avant fuit, l'arrière gagne.

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `tozero` 45,99 → 47,48 | « Le chef de quart lâche la +chasse+. » | **coupe au poste**, même instant que la scène (`VIEW.blow` : commande, bouteilles, vannes, départ des tuyaux), `{ ...STAGED, depth: 160, gap: 0, speed: 0, crush: 1, mood: 1 }` ; `cmd` 0 → 1 sur `lacheZ` 46,84, `valves` 0 → 1 juste après ; `D.punch` sur `chasse2` 47,20 |
| 47,83 → 49,48 | « L'air comprimé fonce dans les ballasts. » | `flowF` et `flowA` 0 → 1 de 47,83 à `ballasts` (≈ 49,1), `bank` 1 → 0,4 ; la caméra recule par rapport pour garder les deux tuyaux (vers `VIEW.climb`) |
| 49,80 → 50,84 | « Devant… et *derrière*. » | `VIEW.climb` (le bateau entier, la roche derrière la proue) : le front avant arrive sur `devant1` 49,80 (`litTank` avant), l'arrière sur `derriere1` 50,44 ; `D.punch` sur `derriere1` |
| `reponse−0,1` → 53,20 | « Devant, les ballasts sont éventrés. » | **coupe** `VIEW.torn` (raccord : sur les ballasts avant) : `airF` 0 → 0,3 ; les déchirures signal ; `chip-eventres` sur `eventres` 52,76 |
| 53,47 → 54,08 | « L'air s'*échappe*. » | `leak` 0 → 1 sur `echappe` 53,68 : les gerbes de bulles blanches par les déchirures ; `D.punch` sur le mot |
| `derriere2−0,12` → 56,16 | « Derrière, ils se remplissent d'air. » | **coupe** `VIEW.aft` : `airA` 0 → 1 de `trigger` 55,44 sur ≈ 1,5 s — le vert grossit, l'eau descend ; `chip-arriere` |
| `lentement−0,15` → 58,16 | « Lentement, le bateau +monte+. » | **coupe** `VIEW.climb` : `depth` 160 → 40 de `lentement` à `surface` (`sine.in`), `pitch` 0 → 6, `rush` 0 → 1, `gap` 0 → 3 (il décolle de la roche), `leak` 1 à l'avant, `airA` 1 ; l'en-tête descend ; `D.punch` sur `monte` 57,84 |
| 58,50 → 59,20 | « La surface. » | **coupe** `VIEW.surface` : `sky` 1, `rock` 0, `depth` 12 → `DEPTH.float` (`power2.out`), `pitch` 4 → 0 — **la coque crève le plan d'eau sans en sortir** ; `mood` → 0 sur `surface` 58,72 (le relâchement) |
| 59,76 → 62,24 | « 98 blessés, dont un qui ne reviendra pas. » | `VIEW.float` : le bateau immobile sous le ciel bas, un très lent recul ; aucun texte de plus, aucun son, aucun `punch` |

**Couture de sortie** : `VIEW.float`, `depth` `DEPTH.float`, `sky` 1, `mood` 0, `crush` 1, `airA` 1, `airF` ≈ 0,2, `leak` ≈ 0,3, `cmd` 1, `valves` 1.

## `src/fin.js` — chute, ce qui est dû, like, prochain dossier, boucle (`toverdict` 62,82 → 92,63)

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `toverdict` 62,82 → 66,78 | « Voilà le secret : ta chasse d'urgence n'était *pas* intacte. L'avant fuyait. » | **coupe sous la surface** (le bateau flottant vu d'en dessous) `VIEW.torn` : l'avant déchiré qui perd encore des bulles (`leak` 0,4) ; `#retitle` (« Une chasse intacte ») de `chute`+0,1, barré sur `verdict` 65,10, `D.verdict(t.pas)` (le nom du compte s'allume) |
| 67,14 → 69,34 | « Et elle t'a quand même remonté… grâce à l'+arrière+. » | la caméra longe le bateau jusqu'à l'arrière (par rapport) : `VIEW.aft`, les ballasts arrière pleins de vert, seuls (`heart`-like : le reste pâlit) ; le titre bascule sur `arriere` 68,94 → « Grâce à l'arrière » ; sorti avant `tocta`−0,42 |
| `tocta` 70,02 → 71,90 | « C'était le San Francisco, en 2005. » | **coupe** : le bateau en surface, de loin (`VIEW.float`) ; `chip-ssn` sur `sanfrancisco` 70,46 |
| 72,45 → 74,38 | « Et ta carte ? Elle n'avait pas cette montagne. » | coupe dans le souffle avant « Et » vers la montagne entière (`VIEW.mountain`, `mount` 1, `rock` 1) : sur `montagne3` 74,10 elle est entière, schématique, le bateau un point en haut |
| 74,86 → 76,86 | « D'autres cartes, à bord, signalaient un danger. » | `#cartes` en zone haute sur `autres` 74,86 (ta carte vide / l'autre, « Danger signalé ») ; sorti avant `commentaire`−0,3 |
| 77,32 → 80,70 | « En commentaire : la faute… à la carte, ou à ceux qui la lisent ? » | `duelCall` de `commentaire`−0,4, `aAt: duelA` 79,34, `bAt: duelB` 80,14, jusqu'à `like`−0,3 ; la montagne recule lentement. **Rien de tapé à la place du spectateur** |
| `like` 81,48 → 84,04 | « Like : pour quelqu'un qui croit que tout est sur les cartes. » | recul très haut au-dessus de l'océan (`VIEW.mountain`, `d` plus grand, `el` plus haut) : un océan bien plus grand que la montagne ; `likeCall` de `like` à `like$`+0,12 |
| `abo` 84,44 → 90,28 | « Abonne-toi : prochain dossier, classé. Un système qui dort près de toi… jusqu'à la seconde où tout *lâche*. » | `nextFile` (`prochain`−0,15, le fait à `prochain`+0,7, sorti à `toloop`−0,38 ; chevrons de `abo`+0,1 à `abo$`+0,15) ; la mer s'assombrit (`sea` → 0,3), rien du sous-marin ne revient |
| `toloop` 90,75 → 92,63 | « Comme ce jour où… » | **coupe** sur `POSE0` reculé (`d` × 0,9) avec `{ ...STAGED, ...FIRST }` ; `D.loop({ at: toloop, rewindAt: rewind })` : `gap` se referme comme à l'image 0 — **tire la dernière image et la première côte à côte** |

---

## La première image — quatre candidates

Réglées sur **bouchons** (la coque de verre du bouchon était presque invisible : la note se refait sur le vrai décor). Fichier d'essais prêt : `.cache/planches/038/architecte/candidates.json` (les quatre à 0,04 s, puis à 0,7 s : `npm run look -- 038 --file .cache/planches/038/architecte/candidates.json --out .cache/planches/038/<toi>/candidates.jpg --cols 4`). État de toutes : `{ "gap": 120, "speed": 1, "crush": 0, "rock": 1, "sea": 1, "mood": 1 }` (0,7 s : `gap` 108).

| | pose (à coller) | 1 événement | 2 basse | 3 menace derrière | 4 forme 40 % | 5 système lisible | 6 bouge par son sujet | note |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **a** `underA` | `{ "tx": -7500, "ty": -50, "tz": 0, "d": 5500, "az": 80, "el": -10, "fov": 50, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | ✓ la neige file, la roche approche | ✓ sous le flanc | ✓ la paroi au bout de la coque | ~ la coque au-dessus de la caméra : un tube, le kiosque peu visible | ~ les ballasts avant au loin | ✓ | 4,5 |
| **b** `underB` (= `POSE0`) | `{ "tx": -6000, "ty": 0, "tz": 0, "d": 9000, "az": 70, "el": -16, "fov": 46, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | ✓ | ✓ | ✓ la paroi derrière la proue, grande | ✓ le tiers avant avec le kiosque et ses barres : « sous-marin » d'un coup d'œil | ✓ bouteilles et ballasts pleins, petits | ✓ neige, hélice hors champ | 6 (attendu) |
| **c** `keelC` | `{ "tx": -7000, "ty": 0, "tz": 0, "d": 4200, "az": 88, "el": -30, "fov": 60, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | ✓ | ✓✓ en contre-plongée sous la quille | ✓ la paroi au-dessus de la proue | ~ vu de dessous, un cigare (sans kiosque) | ✓ les ballasts vus par le dessous | ✓ | 5 |
| **d** `bowD` | `{ "tx": -5800, "ty": -100, "tz": 0, "d": 3200, "az": 60, "el": -20, "fov": 50, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | ✓ | ✓ | ✓ | ✗ la proue seule : une torpille, pas encore un sous-marin | ✓ les ballasts qui vont se déchirer, en grand | ✓ | 5 |

**Choix provisoire : b** (`POSE0`). À trancher sur la planche du vrai décor, AVEC l'en-tête : la proue doit tenir 40 % de la largeur sans passer sous les boutons (x > 905 de y 880 à 1760), la paroi doit se lire derrière elle, et la neige doit filer dès l'image 1.

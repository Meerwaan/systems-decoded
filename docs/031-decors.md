# 031 · Anti-collision (TCAS) — les décors

Contrat posé le 2026-10-30 par l'architecte (`docs/journal/031-architecte.md`). Voix réelle : 93,5 s. **Deux décors neufs, deux agents en parallèle** (jauge partagée par cinq courts) : `tcas.js` (le système) et `cockpit.js` (les postes de pilotage, les feux, les ondes). Tout le reste est réutilisé.

**Lire d'abord** : `episodes/031-tcas/src/plan.js` (toutes les cotes, l'azimut vérifié) et `world.js` (`FIRST`, `VIEW`, `apply` : comment ton fichier est appelé, avec quels nombres). Ton bouchon a déjà son API définitive : tu remplaces tout l'intérieur, **jamais les exports, leurs signatures, ni les nombres lus**. Un manque → ton journal, « À changer ailleurs », ligne exacte.

## Ce qui est réutilisé (aucun agent)

- **Les deux A330** : `buildAvion` de `023-eolienne-de-secours/src/avion.js`, deux instances, importées telles quelles (jamais modifiées). `world.js` les enveloppe : l'île et sa piste cachées (seule la couche de nuages du 023 reste, et descend avec `up`), le second avion sans son monde (ciel, étoiles, île), tourné d'un demi-tour, nez vers +x, face à face sur ta route ; les gouvernes, que le 023 peint veille ou signal, remises à l'encre après chaque `update` (`quieten`). Le passager de verre du 023 à son hublot gauche sert au like (`sleeper`).
- **Le repère** (`plan.js`) : ton avion immobile à l'origine, **nez vers −x**, haut +y, **flanc gauche (commandant) vers +z**. az 0 = caméra sur ton flanc gauche, az −90 devant ton nez, az 90 derrière ta queue. Vérifié sur planche (« chase » az 90 : ta dérive au premier plan, l'autre de face au loin ; `hisNd` az −102 : son écran vu de son siège).
- **Maquette** : l'écart (`gap`), la montée (`up`) et la descente (`down`) sont en mètres dessinés qui ne valent rien ; aucune longueur, aucune hauteur n'est jamais écrite sur l'image (`sources` le dit).

## `src/tcas.js` — le TCAS II (le système, plein, sur son halo)

**Ce qu'il construit.** Trois fabriques, une seule matière : le système est **plein** (trois valeurs de gris, `metal` ≤ 0,5, arêtes fines), les écrans sont des surfaces émissives nettes (`userData.finish = false`).
- `buildTcas()` — **l'établi** : les pièces rassemblées en maquette (`plan.js` → `RIG`), le calculateur au centre (**le cœur**, la pièce la plus claire : un boîtier avionique de baie, ses poignées en façade, son connecteur arrière), **la jauge du temps** sur sa façade (une barre ou un arc qui suit `tau` de 60 à 0, deux repères fins à 48 et 35), l'antenne directionnelle du dessus (au-dessus, comme sur le dos de l'avion) et celle du dessous, le transpondeur Mode S à côté, les deux écrans et le haut-parleur devant (**face à la caméra de l'établi, az ≈ −40**), les câbles coaxiaux qui les relient au calculateur (des conducteurs sombres, des têtes de lumière veille quand une onde passe). **À gauche du halo, loin : le transpondeur de L'AUTRE avion** et son antenne (`peer`, même gris, un filet signal) : c'est lui qu'on interroge.
- `buildScreens({ side })` — **les deux écrans d'un pilote**, vrais à l'échelle (≈ 20 cm), montés trois fois (ton poste, le sien, l'établi : même code, même allure). **ND** : ton avion au centre bas (le chevron encre), l'intrus au-dessus : losange creux encre (`level` 0) → losange plein encre (1) → **cercle plein signal** (2, l'alerte : ambre en vrai, notre palette n'a pas d'ambre — c'est la forme qui change) → **carré plein signal** (3, l'ordre), un anneau de distance fin. **PFD** : sur son bord extérieur, l'échelle de vitesse verticale (−6 000 → +6 000 ft/min, graduée sans chiffres lisibles), l'**arc vert** (veille) et l'**arc rouge** (signal) de l'ordre (`ra` +1 : vert de +1 500 à +2 000, rouge en dessous ; `ra` −1 : l'inverse), **l'aiguille** encre (`vs`), qui devient veille quand elle est dans l'arc vert. Pas d'autre instrument dessiné : un horizon artificiel sombre suffit.
- `buildAntenna()` — l'antenne directionnelle : un radôme bas en lame ou en galet, ses **quatre secteurs de 90°** suggérés dessous (traits), le secteur vers −x (`beam`) qui s'allume veille.
- **L'onde sur l'établi** (`ping`) : une fois par seconde, un **anneau de lumière** (pas une sphère pleine : un front fin, un cœur brillant et une traîne) part de l'antenne du dessus vers le `peer` (0 → 0,5 s : 1 030 MHz, veille), et la réponse repart du `peer` vers l'antenne (0,5 → 1 s : 1 090 MHz, veille plus pâle), puis une tête de lumière court dans le coax jusqu'au calculateur. Périodique en `time`, dosée par `ping`. Directionnel : il va **vers** le peer (un secteur de sphère, pas une bulle qui avale l'établi).
- **Le haut-parleur** (`talk`) : sa membrane qui bat, deux ou trois cercles de son qui s'en vont, lents.

**Éclaté** (`explode`) : en **une colonne verticale** dans le cadre de l'établi (antenne du dessus en haut, calculateur au centre, antenne du dessous en bas, transpondeur et écrans de part et d'autre) ; le `peer` ne bouge pas.

**API (définitive)**
```
buildTcas() → { root, A, update(P, time, px) }
  P = { explode, tau, level, ra, vs, talk, ping, beam, litAnt, litXpdr, litCpu, litPeer, litScreen, mood }
  A = { cpu, gauge, top, bottom, xpdr, nd, pfd, symbol, needle, speaker, peer, peerAnt }
buildScreens({ side }) → { root, A, update(P, time, px) }      P = { level, ra, vs, tau, shell }
  A = { nd, pfd, symbol, own, vsi, needle, arcUp, arcDown }    repère : centre du ND à l'origine, face vers +x, PFD à z = 24·side
buildAntenna() → { root, A, update(P, time, px) }              P = { beam, lit }        A = { tip, beam }
```
`lit*` : la pièce que la voix nomme s'éclaire d'un filet veille (jamais un voile). `level` est entier (les actes le posent sur le mot) : aucun fondu entre deux symboles, une bascule nette avec un éclat bref (deux images) sur la nouvelle forme.

**Images à réussir (liste fermée)**
1. `VIEW.whole` (établi, `explode` 0) : tout se lit à 270 px, le calculateur est le plus clair, sur son halo.
2. `VIEW.exploded` (`explode` 1, `ping` 1) : une seule colonne verticale, le `peer` au bord gauche, l'anneau en route vers lui.
3. Le cycle de `ping` sur quatre instants (0,1 / 0,35 / 0,6 / 0,85 s) : aller, arrivée au peer, retour, tête dans le coax.
4. `VIEW.cpuBench` : la jauge à `tau` 60, 48, 35, 20 — elle se vide, les deux repères se lisent.
5. `VIEW.ndBench` : les quatre symboles (`level` 0, 1, 2, 3) ; puis `ra` 1 avec `vs` 0 et `vs` 1500 (l'aiguille entre dans l'arc vert).
6. `VIEW.antBench` : `beam` 0 et 1 (le secteur vers le peer allumé).
7. Le haut-parleur, `talk` 1 (deux instants).
8. Dans ton poste (sur le décor `cockpit.js` s'il existe, sinon sur son bouchon) : `VIEW.nd` et `VIEW.vsi` (`level` 3, `ra` 1, `vs` 1500) — les écrans à leur vraie taille se lisent à 46–62 cm.

**Propre au dossier.** Aucune taille, aucune fréquence écrite sur les pièces (les étiquettes `chip-1030`, `chip-1090` le font). Aucune marque. La chute rejoue l'idée « deux machines d'accord » : le calculateur est LA pièce-héros, il doit pouvoir porter seul un gros plan.

## `src/cockpit.js` — les postes de pilotage, les feux, les ondes entre les deux avions

**Ce qu'il construit.** Deux fabriques.
- `buildCockpit({ other })` — **le poste de pilotage d'un A330 aux rayons X** (monté dans chaque avion, dans le repère de l'avion, cotes `plan.js` → `DECK`, `BAY`) : l'auvent anti-reflets et la planche de bord (verre, traits fins ; les écrans sont ceux de `tcas.js`, que `world.js` pose sur la planche : laisse-leur la place, `SCREENS`), les consoles latérales, le pylône central, deux sièges, **deux pilotes de verre** (`kit/lib/figure.js`, assis, mains posées), **les deux manches latéraux pleins** sur les consoles extérieures — le tien (z +108) dans ta main de verre, qui le tire (`pull`). Sous le plancher, **la baie avionique** : le calculateur TCAS et le transpondeur en petits pleins, et **le cœur du calculateur** (`cores`) : un point de lumière veille et son halo (`softGlow`, cœur brillant et traîne), calibré en pixels pour se lire **à 100–200 m** (plan `pair` : deux points verts dans deux avions). **Les feux de l'avion** (`lights`, l'autre seulement en pratique) : deux phares d'atterrissage encre (emplantures) et le phare de nez, **un cœur brillant et une longue traîne** qui grossit quand l'avion approche (en pixels : lisibles à 500 m, jamais un disque plein) ; le **feu anticollision** rouge (signal) sur le dos et le ventre, **une respiration lente** (≈ 1 par seconde, jamais un clignotement sec).
- `buildOndes()` — **les ondes, dans le repère du monde**, entre les deux antennes du dos (`a`, `b`) et les deux calculateurs (`ca`, `cb`), que `world.js` lui passe à chaque image : l'**interrogation** (`ping`) : une fois par seconde un anneau veille part de ton antenne vers l'autre (un front fin qui s'ouvre, directionnel, pas une bulle qui remplit le cadre), sa **réponse** repart de lui ; la **coordination** (`coord` 0 → 1) : une tête de lumière veille, nette, qui va de ton calculateur au sien (« je monte »), puis `answer` le chemin inverse ; le **lien** (`link`) : une ligne veille fine entre les deux calculateurs qui pulse lentement (la chute) ; **l'onde du contrôleur** (`atc` 0 → 1 → 2) : un front signal qui monte du sol (`atcFrom`, loin sous les nuages) jusqu'à ton avion, puis s'efface.

**Matières.** Le poste est aux rayons X (`glass` + `asShell`, traits fins), pleins dedans : les manches, la baie et ses deux boîtiers. Les ondes sont de la lumière (`glow`, dosée < 3, cœur et traîne). Rien de ce que le 023 dessine déjà (vitres du poste, cadres) n'est redessiné.

**API (définitive)**
```
buildCockpit({ other }) → { root, A, update(P, time, px) }   P = { shell, crew, pull, cores, lights }
  A = { cpu, xpdr, stick, hand, eyeL, eyeR, panelL, panelR, beacon, landing }
buildOndes() → { group, update(P, time, px) }
  P = { ping, coord, answer, link, atc, mood, a, b, ca, cb, atcFrom }   (a, b, ca, cb, atcFrom : THREE.Vector3 remplis par world.js)
```

**Images à réussir (liste fermée)**
1. `POSE0` / `VIEW.hook` (`gap` 260, `lights` 1, `ping` 1) : l'autre avion de face, ses phares qui éblouissent, son feu rouge ; l'anneau qui part de toi vers lui.
2. `VIEW.shoulder` (`gap` 300 puis 200) : l'auvent, les deux écrans allumés, l'épaule du pilote de verre, les feux de l'autre dans le pare-brise.
3. `VIEW.stick` (`pull` 0 et 1) : le manche plein, la main de verre dessus, tiré vers l'arrière.
4. `VIEW.fuselage` (`cores` 1, `shell` 1) : ton avant aux rayons X, la baie et son cœur veille, l'antenne du dos.
5. `VIEW.chase` (`gap` 300, `ping` 1, `coord` 0,5) : la tête de coordination en route, lisible à 270 px.
6. `VIEW.pair` (`gap` −60, `up` 30, `down` 30, `cores` 1, `link` 1) : deux cœurs, la ligne qui pulse, les pilotes de verre dans les deux postes.
7. `VIEW.profile` (`gap` 100, `atc` 0,6) : le front signal qui monte du sol vers toi.
8. `atHim(VIEW.hisNd, { gap: 160 })` : son écran par-dessus son épaule (`ra2` −1 : son arc vert vers le bas).

**Propre au dossier.** Aucune compagnie, aucun logo, aucune inscription. Les feux de l'autre avion sont la menace de la première image : ils doivent tirer l'œil sans laver le cadre (jamais un voile, `#flash` interdit). Le bouchon dessine les ondes en sphères pleines : c'est exactement ce qu'il ne faut pas garder (planche de l'architecte : une bulle verte avale l'image).

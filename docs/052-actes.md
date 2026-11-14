# 052 · Télésiège débrayable — le plan des actes

Voix réelle : 90,93 s (turbo). Les instants ci-dessous sont ceux de `npm run script -- 052` (mot à mot) ; un acte lit ses instants par repère (`D.times`), jamais en dur, sauf les souffles notés. Contrat : `src/world.js` (`FIRST`, `VIEW`, `BENCHED`, `STAGED`, `ROPE_V`, `AT_S`) et `src/plan.js` (`pathAt`, `speedAt`, `AT`). Les poses de `VIEW` sont **provisoires** (réglées sur bouchons) : partir de celles des journaux des décors (`docs/journal/052-model.md`, `052-gare.md`, `052-ligne.md`) et de `docs/052-actes-maj.md` s'il existe.

## Ce qui vaut pour tous

- **Le câble ne s'arrête jamais — sauf une fois.** `rope` = `ROPE_V` × (temps du film), ease `"none"`, de 0 jusqu'à « s'arrête » (`reponse:s'arrête`, 58,99 s) : là il freine en ≈ 1 s (`power2.out`, ≈ 250 cm de plus) et reste immobile jusqu'au like ; il repart à `tolike` (80,08 s) en ≈ 1,5 s. Chaque coupe donne `rope` à sa valeur du moment. `cableKmh` : 18 tout le film, 0 de 59 s au like.
- **Le siège suit `speedAt`** : sur la ligne il va à la vitesse du câble (son abscisse avance de `ROPE_V` par seconde), à quai à 0,2 de celle-ci (≈ 100 cm/s). Accroché au câble, `chair` avance comme `rope` (les torons ne bougent pas entre les mors) ; détaché, le câble défile entre les mors. **L'en-tête suit le siège à l'image** : `kmh` 18 sur la ligne et lancé, 3,6 à quai, 0 à l'arrêt.
- **Une pose sur la pince du héros suit le siège** : son `tx` (et `tz` dans le virage) avance avec `chair` (`pathAt`), même ease, même durée — sinon le siège sort du cadre en une seconde.
- **La grille de rétention** (`docs/recette-actes.md`) : l'image 0 bouge par son sujet (le siège qui arrive, la pince qui s'ouvre) ; de 10 à 25 s, un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; un son dans le souffle après chaque mot-clé (déjà dans `sfx`, le `monteur-son` le reprend) ; une coupe ou un changement d'échelle franc à chaque porte d'acte (20,30 · 39,26 · 47,59 · 63,53).
- **Les mots qui frappent** (`D.punch(t, 0.06)`, un par phrase au plus, jamais sur une coupe, jamais deux à moins d'1 s) : « jamais » (5,00), « pente » (15,78), « ressort » (28,72), « immobile » (38,44), « accélèrent » (46,80), « mal » (54,12), « Trop » (56,24), « assez » (69,30).
- **« Alors… on l'ouvre »** (19,60 → 20,88) : seul dans son plan, sans étiquette, sans sous-titre parasite ; la caméra est déjà sur la pince (depuis 16,6) ; `benchCut` à `tobench` (20,30), **l'éclaté s'ouvre sur « on »** (`explode`, 20,44). Silence autour (`hush` déjà posé).
- **Le principe se montre sur la pince elle-même** : les deux flèches, puis les torons qui s'arrêtent de défiler entre les mors ouverts.
- **La boucle** : « Et à la prochaine gare… » (89,27) retombe sur « Ton siège lâche le câble » : la dernière image est `POSE0` et `FIRST` (`D.loop`, `rewind` 89,84).
- **Anti-parasites** : rien de fin qui défile vite (la grille du quai, les torons à 5 m/s se fondent avant de scintiller : si `qa` trouve une image parasite sur le câble, c'est l'idiome du décor qui se corrige, pas une coupe) ; la caméra ne traverse ni la poulie ni un pylône (elle traverse le verre) ; une étiquette à la fois en zone haute (436–790), sortie avant la coupe ; le sujet entre y 440 et 1160, rien d'important sous 1600 ni sous les boutons (x > 905 de 880 à 1760).
- **La contre-vérification, à l'image** : la chute ne montre **pas** une pince qui ne sert à rien — le ressort **reste allumé** sur « pas seule » (la voix des `voir` disait « le ressort s'éteint » : écarté), la gare s'allume **à côté** de lui ; la réponse ne montre **pas** le pesage infaillible — pas de grand voyant vert, la jauge dit seulement « trop faible ». Aucun siège qui glisse dans la pente, aucun accident.
- `mood` : 1 (signal) dans l'acte 1 et de `tozero` à « Ton siège ne quittera pas la gare » (59,92) où il passe à 0 — le système a gagné là ; 0 sur l'établi.
- Les `voir` que le décor ne tient pas (et ce qui les remplace) : « deux cases face à face : le capteur et l'établi du mécanicien » (comment) → `duelCall` (« La machine » / « Le mécanicien ») sur le plan de la pente, aucune case en 3D ; « la gare entière s'allume en vert » (chute) → les pièces de la gare qui vérifient (came, pesage, pneus) en veille faible, jamais toute la gare en vert ; « le ressort s'éteint » (chute) → il reste allumé (contre-vérification) ; « le siège libre vient vers la caméra, un skieur s'y assoit » (accroche) → la coupe sur « Et » (1,90) vers le quai : c'est au quai qu'on s'assoit (côté départ), pas à l'arrivée.

## acte1.js

0 → 20,30 (`tobench`). `setAct 1`. Part de `POSE0` et `FIRST` sans coupe ; une seule coupe (1,90). `D.captionStyle({ hit: 0.25 })`.

| Instant | Phrase | Plan, et ce que tient le sujet |
| --- | --- | --- |
| 0 → 1,90 | « Ton siège lâche le câble. » | `POSE0` : le siège arrive de la ligne (`chair` 200 → ≈ 900, de 18 à ≈ 6 km/h, `sine.out`), son galet monte sur la came, `free` 0,4 → 1 : le vide s'ouvre sous le câble qui file. Siège ≈ 45 % de la largeur, pince ≈ 6 %. La caméra recule d'un rien en suivant (`glide` à vérifier à 0,3 et 0,7 s). Punch non (image 0). |
| 1,90 (coupe, souffle 1,56–1,96) → 3,40 | « Et tu t'assois dessus. » | `VIEW.quay`, ton siège au quai (`chair` `AT.board` − 150 → `AT.board`, 3,6 km/h), toi de verre au bord du quai (`rider` 1, `sit` 0 → 1 sur « dessus », 2,60) : siège + toi ≈ 50 %. |
| 3,46 → 5,32 | « Le câble, lui, ne s'arrête jamais. » | On suit le câble qui file au-dessus de toi jusqu'à la poulie (`VIEW.wheel`, la poulie ≈ 60 %) ; punch « jamais ». |
| 5,94 → 7,80 | « Ton siège doit le rattraper… et le serrer. » | On redescend le long du câble jusqu'à ta pince ouverte (`VIEW.grip` élargi, d ≈ 260) : le vide entre les mors et le câble lancé. Pince ≈ 25 %. |
| 8,24 → 9,64 | « Mais assez fort, c'est combien ? » | Les mors ouverts en gros plan, immobiles, le câble qui défile entre eux (`VIEW.jaws` recalé sur ta pince ; `litJaws` faible). Mors ≈ 50 %. |
| 10,42 → 11,22 | « Tu avances au pas. » | Trois quarts arrière, ton siège roule au pas (`VIEW.quay`), en-tête 3,6 km/h. Siège ≈ 40 %. |
| 11,78 → 13,30 | « Devant, des pneus vont te lancer. » | La caméra file devant le siège jusqu'à la rangée du lanceur (`VIEW.tyres`), les pneus tournent de plus en plus vite le long du quai ; `litTyres` faible. Pneus ≈ 70 % de la largeur. |
| 13,65 → 14,42 | « Puis la gare finit, » | On continue jusqu'à la bouche de la gare (`gare.A.mouth`). |
| 14,82 → 16,18 | « et sous toi… la pente. » | Elle passe la bouche et plonge : le creux sous le câble, la pente qui remonte en face (`VIEW.exit`) ; punch « pente ». Le vide ≈ 60 % du cadre. |
| 16,70 → 18,82 | « Avant ça, ta pince doit mordre le câble. » | Retour en arrière d'un seul mouvement (ou coupe nette sur 16,30, la seconde coupe permise) jusqu'à ta pince, ouverte sous le câble qui file (`VIEW.grip`, `fs` 9 → la lumière se resserre sur elle). Pince ≈ 35 %. |
| 18,82 → 20,30 | (souffle) « Alors… » | La caméra s'approche lentement de la pince (d ≈ 110), plus rien ne bouge que le câble. Rend la main à `tobench`. |

Couture de sortie : pose `VIEW.grip` (son `tx` au siège), état : ton siège au quai, `open` 1, `free` 1, `rider` 1, `sit` 1, `mood` 1, `rope` = `ROPE_V` × 20,30.

## acte2.js

20,30 (`tobench`) → 39,26 (`torepos`). `setAct 2` sur « Alors » (19,60). 13 phrases. L'acte 2 propose la couverture (`episode.json` → `cover` provisoire : `eclate:serre+0,3`, `el` 30).

| Instant | Phrase | Plan, et ce que tient le sujet |
| --- | --- | --- |
| 20,30 | (coupe) | `benchCut(D, { at: tobench, set: SET.BENCH, view: VIEW.whole, origin: <la pince dans la gare : pathAt(chair) − FREE>, state: BENCHED })`. Pince ≈ 55 %. |
| 20,44 → 21,9 | « … on l'ouvre. » | L'éclaté s'ouvre sur « on » (`explode` 0 → 1, 1,2 s), la caméra recule vers `VIEW.exploded`. Ensemble ≈ 70 %. |
| 21,91 → 23,20 | « En gare, une came pousse… » | Sur « came » (22,76) : `litCame`, la came se rapproche de son galet (l'éclaté se referme en partie, `explode` → 0,4), `VIEW.cameBench`. Étiquette `#chip-came`. |
| 23,28 → 24,24 | « … un levier et son galet. » | `open` 0 → 1 rejoué : le galet descend, le levier bascule (`litLever`, `litRoller` sur « galet » 24,04). `#chip-levier`. Levier + galet ≈ 40 %. |
| 24,68 → 26,00 | « Le levier ouvre deux mors : » | Le mors mobile s'écarte (`open` 1), `litJaws`, la caméra glisse vers les mors. |
| 26,29 → 27,44 | « un fixe, un mobile. » | `#chip-mors` ; le fixe puis le mobile s'éclairent chacun sur son mot (26,48 / 27,12). |
| 27,88 → 29,68 | « Et au bout… le ressort qui les serre. » | `VIEW.spring`, `litSpring` (le cœur), `#chip-ressort` ; punch « ressort » ; sur « serre » (29,44) `open` 1 → 0 : le ressort se détend, les mors se referment. Ressort ≈ 45 %. |
| 30,30 (coupe, souffle) → 31,16 | « Comment il le rattrape ? » | Retour à la gare, `VIEW.principle` : ton siège au quai (`AT.board`), les deux flèches (`arrows` 1, `vchair` 0,2), `rope` au temps du film. Siège + flèches ≈ 60 %. |
| 31,78 → 33,88 | « À quai, tu roules cinq fois moins vite que le câble. » | La flèche du siège fait le cinquième de l'autre ; `#chip-cinq` ; en-tête 3,6 km/h / Câble 18 km/h. |
| 34,24 → 35,64 | « Les pneus te relancent à sa vitesse : » | Le siège roule sur le lanceur (`chair` → `AT.close` − 150, `kmh` 3,6 → 18), `vchair` 0,2 → 1, `litTyres`. La caméra suit le siège (même ease). |
| 36,01 → 36,76 | « à vitesse égale, » | Les deux flèches égales ; on resserre sur la pince. |
| 36,96 → 38,84 | « pour ta pince, le câble est immobile. » | `VIEW.still` qui suit le siège : les torons cessent de défiler entre les mors encore ouverts (`chair` avance exactement comme `rope`) ; `#chip-egal` ; punch « immobile ». Mors ≈ 50 %. |

Couture de sortie : à `torepos` (39,26) l'acte 3 coupe ; état : siège sur le lanceur, `open` 1, `arrows` à 0 avant 39,1.

## acte3.js

39,26 (`torepos`) → 63,53 (`toverdict`). `setAct 3` à `tozero` (47,59). 14 phrases, en coupes à partir de `tozero` (un plan par souffle).

| Instant | Phrase | Plan, et ce que tient le sujet |
| --- | --- | --- |
| 39,26 (coupe) → 40,28 | « Ton siège roule seul. » | `VIEW.quay` resserré : ton siège au quai, toi dessus, détaché, le câble qui file au-dessus (`free` 1). Siège ≈ 45 %. |
| 40,76 → 42,68 | « Sa pince attend, ouverte sur la came. » | La caméra descend sur le galet posé sur la came (`VIEW.came` qui suit le siège), `litCame`. Galet + came ≈ 40 %. |
| 43,12 → 45,40 | « Au bout du quai, un capteur pèse chaque pince. » | Elle file le long de la came jusqu'au capteur et sa jauge (`VIEW.weigh`), `litWeigh` ; `#chip-pesage`. Un autre siège passe dessus (`others`) : la jauge monte haut, hors du rouge, sans voyant vert. |
| 45,76 → 47,24 | « Et là… les pneus accélèrent. » | Retour sur ton siège qui prend le lanceur : les pneus tournent plus vite, le quai commence à défiler, `kmh` monte ; punch « accélèrent ». |
| 47,59 (coupe) → 48,28 | « Le quai finit. » | `VIEW.run`, `mood` 1 : bas, dehors, le siège lancé, le quai qui défile. |
| 48,72 → 50,60 | « Dix-huit kilomètres-heure, un vélo lancé. » | En-tête 18 km/h ; même plan, le siège arrive au bout de la came. |
| 51,04 → 51,80 | « La came s'arrête. » | Coupe sur le galet qui quitte la came (`CAME.stopX`), le levier remonte. |
| 52,16 → 53,56 | « Le ressort referme ta pince… » | Gros plan pince : `open` 1 → 0, `free` 1 → 0 (elle remonte sur le câble), le ressort se détend. Pince ≈ 45 %. |
| 54,12 → 54,28 | « mal. » | `weak` 1 : le liseré signal sur le ressort, le jour entre les mors, le câble qui glisse d'un rien (`chair` prend 15 cm de retard sur `rope` en 0,8 s) ; punch « mal ». |
| 54,95 → 55,84 | « Le capteur la pèse. » | Coupe : la pince sur le capteur (`VIEW.weigh`), `weigh` 1, la came fléchit, le repère de la jauge descend (`force` 0,9 → 0,4). |
| 56,24 → 56,72 | « Trop faible. » | La jauge dans le rouge ; `#chip-faible` ; punch « Trop ». Jauge + pince ≈ 50 %. |
| 57,07 → 58,48 | « Et le câble qui ne s'arrête jamais… » | Coupe vers `VIEW.wide` (la gare entière, la poulie, les pneus, les sièges qui avancent) : la caméra recule, tout court encore. |
| 58,99 → 59,36 | « s'arrête. » | Dans le même plan, sans coupe : tout s'arrête (`rope` freine en ≈ 1 s, la poulie, les pneus, les sièges de la ligne), `cableKmh` 0, `kmh` 0, `sway` 1. |
| 59,92 → 61,36 | « Ton siège ne quittera pas la gare. » | Ton siège immobile au bout du quai, la bouche et le vide devant lui (contre-champ de `VIEW.exit`) ; `mood` 0 ici. |
| 61,72 → 62,88 | « On l'isole, pour contrôle. » | Il glisse sur la voie de garage (`iso` 0 → 1, `VIEW.garage`), `#chip-isole`. |

Couture de sortie : à `toverdict` (63,53) la fin coupe ; `sway` à 0 avant 63,4.

## fin.js

63,53 (`toverdict`) → 90,93. L'ordre de la fin à partir du 018 (`kit/template/src/fin.js`).

| Instant | Phrase | Plan, et ce que tient le sujet |
| --- | --- | --- |
| 63,53 (coupe) → 64,38 | « Voilà son secret : » | Le cadre de l'accroche (`POSE0`, d × 0,9), **figé** : un siège au quai d'arrivée, la pince sur la came, le câble arrêté (`rope` constant), `cableKmh` 0. |
| 64,78 → 66,14 | « ta pince ne te sauve pas seule. » | `retitle` (« Son secret » : « Ta pince seule » barré sur « pas », 65,74) ; le ressort reste allumé (`litSpring` 1). |
| 66,50 → 67,26 | « La gare vérifie : » | La came, les pneus, le pesage s'allument faiblement (`litCame`, `litTyres`, `litWeigh` 0,6) **à côté** de la pince ; `retitle` → « Ta pince et la gare » ; `D.verdict(verdict)` (le nom du compte, 66,86). |
| 67,61 → 69,50 | « elle ne te lâche que si ta pince serre assez. » | Lent recul ; punch « assez ». |
| 70,18 (coupe) → 71,96 | « Et assez fort, c'est combien ? » | `VIEW.steep` : le siège de profil dans la travée la plus raide, pince fermée. Siège ≈ 35 %. |
| 72,22 → 74,94 | « Deux fois ce qu'il faut pour ne pas glisser, dans la pente la plus raide. » | `pull` 0 → 1 : la flèche rouge vers le bas, puis la verte deux fois plus longue ; `#chip-deux`. |
| 75,49 → 79,42 | « En commentaire : … la machine… ou au mécanicien ? » | Orbite lente ; `duelCall({ from: duelA − 0,6, aAt: duelA, bAt: duelB, to: tolike − 0,1 })`. Jamais la réponse tapée. |
| 80,08 (coupe) → 82,84 | « Like : pour ton ami… » | `VIEW.climb` : le câble repart (`rope` reprend, `cableKmh` 18), les sièges remontent un par un, pinces vertes (`greens` 1) ; `likeCall`. |
| 83,12 → 88,68 | « Abonne-toi : prochain dossier… » | Orbite lente vers les crêtes et le ciel ; `nextFile` (053, la carte sans contact, le fait = la phrase de la voix). Plus rien du télésiège ne revient au premier plan. |
| 89,15 → 90,93 | « Et à la prochaine gare… » | Coupe dans la gare, la caméra revient sur `POSE0` ; `D.loop({ at: toloop, rewindAt: rewind })`. |

## Les candidates de la première image

Fichier prêt pour `look` : `.cache/planches/052/architecte/candidates-premiere-image.json` (les quatre, état compris). Notées sur bouchons (six points de `docs/recette-agents.md` : 1 événement en cours · 2 perspective basse · 3 menace derrière · 4 forme reconnue, 40 % · 5 système petit mais lisible · 6 bouge par son sujet) ; à rejuger sur les vrais décors habillés.

- **A · Contre-plongée du quai** (`POSE0` actuel) — bas entre les deux rails, on regarde l'arrivée vers la bouche : le siège qui arrive, grand ; son galet sur la came, la pince qui lâche le câble ; dehors la ligne qui monte dans la nuit, le siège suivant qui descend. 1 ✓ · 2 ✓ · 3 ½ (la nuit, la ligne ; pas de rouge) · 4 ✓ (≈ 45 %) · 5 ✓ · 6 ✓. **5,5/6.**
  `{ "at": 0.02, "pose": { "tx": 1300, "ty": 240, "tz": -260, "d": 1000, "az": -72, "el": -8, "fov": 44, "shift": 150, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "chair": 200, "free": 0.4, "open": 1, "rope": 10, "kmh": 18 } }`
- **B · Dans son dos, au-dessus du vide** — dehors, sous la ligne d'arrivée, au-dessus du creux : le siège de dos qui entre dans la gare éclairée, son galet sur la rampe de la came. 1 ✓ · 2 ✓ · 3 ✓ (le vide sous lui) · 4 ½ (de dos, en silhouette) · 5 ✓ · 6 ½ (il s'éloigne). **4,5/6.**
  `{ "at": 0.02, "pose": { "tx": 1640, "ty": 300, "tz": -260, "d": 760, "az": 62, "el": -14, "fov": 44, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "chair": -160, "free": 0, "open": 0.3, "rope": 10, "kmh": 18 } }`
- **C · Face au siège, à hauteur de câble** — dans la gare, devant le siège qui arrive : le câble file vers l'objectif, la pince décroche, le siège vide se balance vers nous ; la bouche et la ligne derrière. 1 ✓ · 2 ½ · 3 ✓ (le câble qui fonce sur toi) · 4 ✓ · 5 ✓ (grand) · 6 ✓ — mais le mécanisme est vu presque de face (règle « jamais de face »). **5/6.**
  `{ "at": 0.02, "pose": { "tx": 1200, "ty": 220, "tz": -260, "d": 800, "az": -96, "el": 4, "fov": 46, "shift": 130, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "chair": 260, "free": 0.5, "open": 1, "rope": 10, "kmh": 18 } }`
- **D · Plongée sur la came** — haut, grand angle, au-dessus de la came d'arrivée : la pince qui s'ouvre et tombe du câble, le siège dessous, le quai loin en bas. 1 ✓ · 2 ✗ (plongée) · 3 ½ · 4 ½ (siège vu de dessus) · 5 ✓ · 6 ✓. **4/6.**
  `{ "at": 0.02, "pose": { "tx": 1290, "ty": 300, "tz": -260, "d": 520, "az": -130, "el": 52, "fov": 56, "shift": 100, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "chair": 210, "free": 0.5, "open": 1, "rope": 10, "kmh": 18 } }`

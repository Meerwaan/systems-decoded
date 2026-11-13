# 046 · Torchère — le plan de mise en scène

Voix enregistrée (eleven_v4, 91,97 s). **Tout instant vient d'un repère** (`episode.json → cues`, ou `D.times({ x: "beat:mot" })`), jamais d'une seconde en dur : les secondes ci-dessous sont celles de la table d'aujourd'hui, pour lire, et une reprise de phrase peut encore les déplacer. Contrat : `src/world.js` (`FIRST`, `POSE0`, `VIEW`, `BENCHED`, `STAGED`), `src/main.js` (l'en-tête). Décors : `docs/046-decors.md` et les journaux `docs/journal/046-*.md` (leurs poses priment sur `VIEW`, réglé sur bouchons).

## Ce que tout acte respecte

- **L'histoire** : une raffinerie, 16:30, un défaut électrique coupe un compresseur ; par procédure le gaz part à la torche : soupapes → collecteur → ballon → garde → cheminée → la flamme pilote l'allume ; la pression retombe ; une demi-heure plus tard le compresseur repart. Scénario d'après Fos 2017, **jamais nommé**. Personne à l'image, personne blessé.
- **L'en-tête** (`main.js`) : l'heure de l'histoire — la première image est l'instant où la torche s'allume (≈ 16:30:16) ; la scène repart « quelques secondes avant » (16:30:00 sur « coupe ») ; figée de `tobench` à `tozero` ; 17:00:00 sur « demi-heure » (`later`). Second compteur : **Pilote ALLUMÉE (veille) / ÉTEINTE (signal)**, lu dans `pilot` : sous 0,5 il bascule — ne descends sous 0,5 que quand la voix dit qu'elle s'éteint (chute, commentaire).
- **Chaque phrase a sa démonstration, sur le mot.** Une coupe se pose quelques images avant sa phrase (les `to…` sont à −0,12) ; chaque coupe est un raccord (la pièce qu'on vient de nommer, le sens du mouvement, la même forme).
- **Un acte commence par une coupe** à pose complète et état complet (`{ ...STAGED, … }`, ou `benchCut` avec `BENCHED`), sauf l'acte 1 (`POSE0`, `FIRST`). Rien d'un plan ne déborde sur le suivant.
- **Établi en place** : le système ne bouge pas à la coupe (`benchCut(D, { at, set: SET.BENCH, view, state: BENCHED })`, `origin` par défaut) ; seul ce qui l'entoure change.
- **La part du cadre** : chaque ligne des tables dit ce que tient le sujet ; la zone 3D est 440–1160 (1080 × 720, à l'horizontale), la zone haute 436–790 (une étiquette à la fois), sous-titres 1248–1488, rien sous 1600, rien sous les boutons (x > 905, 880–1760). Vérifie AVEC l'en-tête.
- **La lumière suit le sujet** : `fs` ≈ 150 le bout, ≈ 400 la garde, ≈ 800 le ballon, ≈ 1 500 les colonnes, ≈ 3 000 l'usine, `SIZE` sur l'établi. `mood` 1 jusqu'à « la pression retombe » (acte 3), 0 sur l'établi et dans le repos, franc (0 ou 1, jamais à mi-chemin plus d'une demi-seconde).
- **`dof`** : seulement les poses qui étalent `CLOSE` (`tip`, `foot`, `valves`, `drum`, `seal`) ; la première image, l'éclaté et les plans larges sont nets.
- Mouvements longs en `sine.inOut` ; une montée le long de la cheminée (18 m) **par rapport** (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La caméra traverse le verre, jamais la cheminée, le ballon ni la garde.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** ; `FIRST` est fermé : s'il t'en manque un, « À changer ailleurs ». Étiquettes en capitales, aucune unité à symbole, aucun chiffre qui ne soit dit.
- **Le plan-séquence** reste le pilote du 038 seul : ce dossier suit la recette ordinaire (`shot`, `cut`), avec ce qu'elle a gardé du pilote — les plans calmes bougent, le moment fort se voit en entier (on ne coupe pas sur « l'allume »).
- 26 images lues au plus, journal `docs/journal/046-<fichier>.md`, planches dans `.cache/planches/046/<fichier>/`.

## La grille de rétention qui s'applique ici

| instant | ce qui se passe |
| --- | --- |
| 0 → 0,5 s | la flamme **enfle** dès l'image 1 (`flare` 0,35 → 1, `power2.out`), fumée qui monte ; `sig-dossier` et le grondement à 0,02 |
| 0,5 → 9,3 | une démonstration par phrase : « géante » (`choc`, `D.punch` 0,06), le fantôme de colonne sur « exploser », la flammèche qui vacille sur « s'éteint » |
| 9,3 → 25 | un changement toutes les 2 à 3 s : 9,32 coupe · 10,26 étincelle et rotor · 11,5 montée vers les colonnes · 13,6 nuage · 16,2 le collecteur suivi · 17,6 le pied · 18,8 tout se fige · 19,5 l'établi · 19,64 l'éclaté · 21,6 les soupapes · 23,8 le collecteur |
| portes d'acte | `tobench` (établi en place), `tozero` (coupe franche sur les vannes), `toverdict` |
| fin | le commentaire est un **duel** (« Bon signe » / « Mauvais ») : le film ne répond jamais |

**Les mots qui frappent** (un par phrase au plus, `D.punch`, jamais sur une coupe, jamais deux à moins d'une seconde) : géante 1,64 · exploser 5,04 · s'éteint 8,25 · torche 17,62 · collecteur 23,84 · feu 28,08 · air 39,23 · compresseur 47,63 · s'ouvrent 48,91 · enfle 57,35 · retombe 60,11 · pas 66,01 · mauvais 82,37.

**« Alors… on l'ouvre »** (18,77 → 20,16) est seul dans son plan : de « Alors » à `tobench` tout est figé (gaz, rotor, chrono) ; l'éclaté s'ouvre **sur le mot** (`explode` 19,64). Le son y est un blanc total (déjà dans `sfx`).

**La boucle** : la dernière phrase « Et pendant qu'il tourne… » retombe sur « Ta raffinerie crache une flamme géante » : sous le bras du lave-vaisselle qui tourne, puis sur « tourne » (`rewind`) la coupe sur la contre-plongée de la torche, **la caméra qui roule dans le sens du bras** et se redresse jusqu'à `POSE0` (roll 0) pendant que la flamme enfle : dernière image = première image.

**Anti-parasites** : rien de clair ne monte dans l'en-tête (la flamme et la fumée s'y fondent : si un plan les y pousse, `shift` plus bas) ; aucune lueur qui clignote (le rotor, la flamme respirent) ; les jets du lave-vaisselle et les têtes de gaz avancent d'au plus un septième de leur période par image ; ce que la caméra frôle est invisible.

## Les étiquettes (`index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-arret` (Compresseur / À l'arrêt, signal) · `chip-garde` (Le cœur / Garde hydraulique, veille) · `chip-purge` (Purge / Jour et nuit, veille) · `chip-pilote` (Sa plus petite flamme / La flamme pilote, veille) · `chip-mexique` (Poza Rica · Mexique / Torche éteinte, signal — l'année n'est jamais dite) · `#retitle` (« Elle fait peur quand elle est… » : « Géante » barré → « Éteinte », signal) · `#duel` (« Une torchère qui fume ? » Bon signe / Mauvais) · `#net` (fenêtres) · `#next` (047, « Il lave avec moins d'eau que toi. », S'abonner pour l'ouvrir) · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre : « Soupapes », « Collecteur », « Ballon » (ce que dit la voix, rien d'autre). Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

---

## `acte1.js` — 01 MENACE (0 → `tobench` 19,50)

Part de `POSE0` et `FIRST`, deux coupes au plus. Rend la main sur `VIEW.foot`, dans la scène, avec `press` 1, `relief` 0, `flow` 0, `hum` 0, `rotor` arrêté, `flare` 0,08, `pilot` 1, tout figé depuis « Alors ».

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 0 → 2,36 | « Ta raffinerie crache une flamme géante. » | `POSE0`, `FIRST` : la flamme enfle (`flare` 0,35 → 1 avant `choc` + 0,3), fumée 0,6 → 1 ; la caméra monte lentement le long de la cheminée ; `D.punch` sur « géante » | cheminée + flamme ≈ 40 % de la largeur, la flamme dans le haut de la zone 3D |
| 2,36 → 3,24 | « Elle le fait exprès. » | même plan : la caméra atteint le bout, la flamme pilote veille se lit à côté du panache (rien n'a l'air d'un accident) | le bout ≈ 20 % |
| 3,79 → 6,20 | « Ce feu, c'est ce qui l'empêche d'exploser. » | recul le long de la cheminée jusqu'au tuyau qui la relie aux colonnes (par rapport) ; sur « exploser » 5,04 : `blast` 0 → 1 en 0,9 s (la colonne du milieu éclate en fantôme et s'efface) | colonnes + cheminée, l'usine ≈ 70 % |
| 6,20 → 8,60 | « Sauf le jour où sa plus petite flamme… s'éteint. » | **coupe 1** (raccord : on remonte au bout) `VIEW.tip` : à côté du grand panache, la flammèche verte ; sur « s'éteint » 8,25 : `pilot` 1 → 0,6 → 1 (elle vacille ; ne passe pas sous 0,5) | le bout ≈ 45 %, la flamme pilote ≥ 40 px |
| `toscene` 9,32 → 11,46 | « Un défaut électrique coupe un compresseur. » | **coupe 2** `VIEW.compressor`, `{ ...STAGED, press: 0.2, flare: 0.08, smoke: 0 }` — l'en-tête repart à 16:29:59 ; `spark` sur le moteur à la coupe + 0,2 ; sur « coupe » (`fault` 10,26) le rotor ralentit et s'arrête (`rotor` en `power2.out`, `hum` → 0 avant 11,4) ; `chip-arret` de `fault` + 0,1 à 13,5 | le compresseur ≈ 50 %, les colonnes derrière |
| 11,46 → 13,62 | « Ton usine doit vider son gaz sous pression. » | la caméra s'élève du compresseur vers `VIEW.columns` ; `press` 0,2 → 1 (les colonnes se remplissent de rouge par le bas, jusqu'à « pression ») | trois colonnes ≈ 60 % |
| 13,62 → 16,18 | « À l'air libre ? Un nuage prêt à flamber. » | sur « libre » : `cloud` 0 → 1 (déborde autour des colonnes, au ras du sol), tenu sur « flamber », puis s'efface 15,6 → 16,2 | colonnes + nuage |
| 16,18 → 18,34 | « Il reste une sortie… la torche. » | on suit le collecteur (`VIEW.header`) jusqu'au pied (`VIEW.foot`) — sur « torche » 17,62 le pied est là, la cheminée monte hors du cadre ; `D.punch` | le pied et la garde ≈ 45 % |
| 18,77 → `tobench` 19,50 | « Alors… » | tout se fige (le chrono aussi : c'est `main.js`) ; la caméra ne bouge presque plus | idem |

## `acte2.js` — 02 AUTOPSIE (`tobench` 19,50 → `tozero` 48,46)

Entre par `benchCut` en place depuis `VIEW.foot` (`BENCHED`). Revient dans la scène au repos (coupe en place à `torepos`) et rend la main sur `VIEW.compressor`, `rotor` arrêté net sur « compresseur », `spark` éteint, `mood` 1, `press` 0,3.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| 19,50 → 21,19 | « …on l'ouvre. » | `benchCut` ; sur « on » (`explode` 19,64) : `explode` 0 → 1 et `section` 0 → 1 (1,2 s) ; recul par rapport vers `VIEW.exploded` | le réseau entier dans la zone 3D |
| 21,19 → 23,73 | « Toutes les soupapes débouchent dans un seul tuyau : » | `VIEW.valves` ; `litValves` ; `relief` 0 → 1 sur « soupapes » ; trois têtes de gaz convergent dans le collecteur (`flow` 0 → 0,12 sur « débouchent ») ; `co.add` « Soupapes » | les trois soupapes et le collecteur ≈ 70 % |
| 23,73 → 25,04 | « le collecteur. » | `litHeader`, `co.add` « Collecteur » ; la caméra suit le collecteur vers le ballon ; `D.punch` | le collecteur en diagonale |
| 25,04 → 26,80 | « Un ballon y retient le liquide : » | `VIEW.drum` (coupe ouverte) : `flow` 0,36 → 0,46, `liquid` 0 → 0,8 (les gouttes tombent, la nappe signal au fond) ; `co.add` « Ballon » | le ballon ≈ 55 % |
| 26,80 → 28,76 | « sinon, il pleuvrait du feu. » | recul au large (le ballon et la flamme dans le même cadre) : `flare` 0,08 → 0,7, `drip` 0 → 1 sur « pleuvrait », éteints à 28,6 | le réseau + la flamme |
| 28,76 → 31,28 | « Et au bout… la garde hydraulique. » | `VIEW.seal` : `litSeal`, `bubbles` 1 ; `chip-garde` de `coeur` 29,84 à `toprincipe` − 0,15 | la garde ≈ 50 % |
| 31,28 → 33,39 | « Pourquoi le feu ne redescend pas dans l'usine ? » | de la garde, la caméra monte le long de la cheminée (`VIEW.stack`, par rapport) | la cheminée en hauteur |
| 33,39 → 35,39 | « Sans air, le gaz ne brûle pas. » | `VIEW.tip` : `air` 0 → 1 (les flèches signal tentent d'entrer au bout) | le bout ≈ 40 % |
| 35,39 → 39,23 | « Alors, vingt-quatre heures sur vingt-quatre, un filet de gaz monte dans la torche : » | la caméra redescend au pied et remonte AVEC la purge (veille, `section` 1 sur la cheminée) jusqu'au bout ; `chip-purge` de `filet` 37,39 à `torepos` − 0,15 | le filet au centre, la cheminée ≈ 15 % |
| 39,23 → 40,62 | « l'air reste dehors. » | au bout : les flèches sont repoussées vers le haut et s'effacent (`air` → 0 sur « dehors ») ; la petite flamme tient, dehors | le bout ≈ 40 % |
| `torepos` 40,62 → 42,54 | « Le reste du temps, elle dort. » | `explode` → 0, `section` → 0 (le réseau se referme) ; **coupe en place** vers la scène (même pose, `{ ...STAGED, shell: 0 }`) puis `shell` 0 → 1 (2 s) : la raffinerie revient autour, au calme, `mood` 0, `hum` 1, le rotor tourne | l'usine entière |
| 42,54 → 46,16 | « Presque rien ne brûle : ce filet de gaz, et une flamme minuscule. » | montée vers `VIEW.tip` : `flare` 0,08, la flamme pilote | le bout ≈ 35 % |
| 46,16 → `tozero` 48,46 | « Puis ta raffinerie… perd un compresseur. » | descente par rapport (ou coupe sur un raccord vertical) jusqu'à `VIEW.compressor` ; sur « compresseur » (`stop` 47,63) : le rotor s'arrête **net**, `spark`, `mood` 1 | le compresseur ≈ 50 % |

## `acte3.js` — 03 RÉPONSE (`tozero` 48,46 → `toverdict` 64,65)

Une coupe par souffle, lisible en une demi-seconde ; on ne coupe pas sur « l'allume » (le moment fort se voit en entier). Rend la main sur `VIEW.flare` : `flare` ≈ 1, `smoke` 1, `press` 0, `mood` 0, `hum` 1.

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| `tozero` 48,46 → 49,50 | « Les vannes s'ouvrent. » | **coupe** sur les soupapes dans la scène (`VIEW.columns` resserré, `{ ...STAGED, press: 1, hum: 0, mood: 1 }`) ; l'en-tête reprend (16:30:09) ; `relief` 0 → 1 sur « s'ouvrent » | trois soupapes ≈ 50 % |
| 49,50 → 51,23 | « Le gaz se rue dans le collecteur. » | `VIEW.header` : `flow` 0 → 0,34 (« rue » : la tête signal court, la caméra la suit) | le collecteur en diagonale |
| 51,23 → 52,55 | « Il traverse le ballon. » | le ballon (`section` 0,6 dans la scène) : `flow` 0,34 → 0,48, des gouttes tombent (`liquid` → 0,5) | le ballon ≈ 45 % |
| 52,55 → 53,71 | « Il bulle dans la garde. » | `VIEW.seal` (scène) : `flow` 0,55 → 0,66, les bulles signal | la garde ≈ 45 % |
| 53,71 → 54,79 | « Il monte. » | montée rapide le long de la cheminée avec la tête (`flow` 0,72 → 0,97), par rapport | la cheminée |
| 54,79 → 56,90 | « Au bout, la petite flamme l'allume. » | `VIEW.tip` : la tête arrive (`flow` 1 sur `trigger` 56,06), la flamme pilote l'allume : `flare` 0,08 → 0,5 en 0,3 s, `D.jolt` | le bout ≈ 40 % |
| 56,90 → 57,96 | « La torche enfle. » | recul vers la contre-plongée de la première image (la rime) : `flare` → 1, `smoke` → 1 | la flamme ≈ 40 % |
| 57,96 → 58,84 | « Elle gronde. » | même plan, `D.jolt` 0,4 ; la fumée noire roule | idem |
| 58,84 → 60,87 | « Dans l'usine, la pression retombe. » | coupe `VIEW.columns` : `press` 1 → 0 (le rouge descend), sur « retombe » `mood` → 0 (le système a gagné) | les colonnes ≈ 60 % |
| 60,87 → 63,35 | « Une demi-heure plus tard, le compresseur repart. » | l'en-tête saute à 17:00:00 sur « demi » (`later`) ; `VIEW.compressor` : sur « repart » le rotor reprend (`hum` 1) ; `flare` → 0,6 | le compresseur ≈ 50 % |
| 63,35 → `toverdict` 64,65 | « Rien n'a explosé. » | `VIEW.flare` : toute l'usine intacte sous la flamme | l'usine ≈ 80 % |

## `fin.js` — chute, ce qui est dû, CTA, prochain dossier, boucle (`toverdict` 64,65 → 91,97)

| repère | la voix | l'image | part du cadre |
| --- | --- | --- | --- |
| `toverdict` 64,65 → 68,17 | « Voilà le secret : ce n'est pas quand elle est géante qu'il faut avoir peur. » | la flamme géante au sommet (`flare` 1, `smoke` 1), orbite lente ; `retitle` (« Géante » paraît sur « géante », barré sur « pas ») ; `D.verdict` sur « pas » (`verdict` 66,01) | la flamme ≈ 45 %, le titre en zone haute |
| 68,17 → 69,61 | « C'est quand elle s'éteint. » | sur « s'éteint » (`out` 68,66) : `flare` 1 → 0 et `pilot` → 0 en 0,3 s (l'en-tête : ÉTEINTE), `raw` 0 → 1 : le gaz cru sort du bout et descend vers les colonnes ; « Éteinte » remplace « Géante » | le bout + le nuage |
| `tocta` 69,61 → 73,49 | « Et sa plus petite flamme ? La flamme pilote, allumée jour et nuit. » | `VIEW.tip`, `raw` 0 : sur « pilote » (71,61) `pilot` → 1 (ALLUMÉE), `chip-pilote` jusqu'à `sansbruler` − 0,1 | la flamme pilote au centre, ≈ 40 px au moins |
| 73,49 → 75,55 | « Sans elle, le gaz sort sans brûler : » | `pilot` → 0 (elle s'éteint, en fantôme) ; sur « brûler » `raw` → 1 (incolore, traits signal) | le bout + le gaz |
| 75,55 → 79,17 | « au Mexique, une torche éteinte, un gaz toxique, vingt-deux morts. » | `chip-mexique` (zone haute fixe) de `mexique` à `commentaire` − 0,25 ; le gaz descend ; aucun personnage | le gaz qui descend ≈ 60 % |
| 79,17 → 83,27 | « En commentaire : une torchère qui fume… bon signe, ou mauvais ? » | la torche rallumée qui fume noir (`raw` 0, `pilot` 1, `flare` 0,6, `smoke` 1) ; `duelCall` (A sur `bon`, B sur `mauvais`, tons veille / signal) — **aucune réponse** | la flamme qui fume ≈ 40 % |
| `tolike` 83,27 → 85,59 | « Like : pour ceux qui la voient de leur fenêtre. » | `VIEW.pane`, `pane` 1, `flare` 0,08, `mood` 0 : la torche au calme derrière le cadre ; `likeCall` (« fenêtres ») ; chevrons | la fenêtre au premier plan, la torche ≈ 15 % |
| `toabo` 85,59 → `toloop` 90,03 | « Abonne-toi : prochain dossier, ton lave-vaisselle, qui lave avec moins d'eau que toi. » | `VIEW.washer`, `{ ...STAGED, shell: 0, teaser: 1, jets: 1 }`, `arm` tourne (≈ 1 tour / 2 s, `"none"`) ; `nextFile` (show `next` − 0,15, fait sur « lave », 88,3 ; caché à `toloop` − 0,38) | le lave-vaisselle sous le panneau, ≈ 50 % |
| `toloop` 90,03 → `rewind` 90,83 | « Et pendant qu'il tourne… » | `VIEW.washerArm` : sous le bras qui tourne (même vitesse, même sens) | le bras ≈ 70 % |
| `rewind` 90,83 → 91,97 | *(fin)* | **coupe** sur `{ ...POSE0, roll: ±25 }` (le signe qui continue le sens du bras), `{ ...FIRST, flare: 0.2 }` ; `D.loop({ at: t.rewind, rewindAt: t.rewind })` : la caméra se redresse jusqu'à `POSE0`, la flamme enfle vers `FIRST` | = la première image |

---

## La première image — quatre candidates

Fichier d'essais : **`.cache/planches/046/premiere-image.json`** (chaque candidate à 0,04 s et à 0,7 s, la flamme qui enfle entre les deux). À tirer **sur les vrais décors et l'habillage** : `npm run look -- 046 --file .cache/planches/046/premiere-image.json --out .cache/planches/046/046-premiere-image.jpg --cols 4`. Notes sur les six points (`docs/recette-agents.md`), lues sur bouchons (la flamme y est un cône : 1 et 6 se jugent sur le vrai `flamme.js`) :

| | 1 événement | 2 perspective basse | 3 menace derrière | 4 forme ≥ 40 % | 5 système petit, lisible | 6 bouge par le sujet | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| **(a) le pied de la torche** (`POSE0` provisoire) | ✓ la flamme enfle | ✓✓ contre-plongée, lignes qui filent vers le haut | ✓ colonnes rouges derrière (contre-jour) — à vérifier : sur bouchons, le verre est trop pâle | ~ la cheminée ≈ 15 %, la flamme évasée ≈ 45 % | ~ la flamme pilote à 19 m : petite | ✓ | 4,5 |
| **(b) le bout de la torche** | ✓ | ✓ contre-plongée serrée | ✗ pas de colonnes : la menace, c'est la flamme et la fumée au-dessus | ✓ le bout ≈ 60 % | ✓✓ la flamme pilote tout près | ✓ | 5 |
| **(c) entre les colonnes** | ✓ | ✓ | ~ les colonnes rouges sont devant, pas derrière | ✗ cheminée mince au loin | ✓ la flamme pilote en point vert | ✓ | 4 |
| **(d) la garde au premier plan** | ✓ | ✓ | ✗ les colonnes sont dans le dos de la caméra | ~ cheminée ≈ 20 % | ✓ la garde et la flamme pilote | ✓ | 4 |

Poses (prêtes à coller dans un `essais.json` ; état commun `{ "flare": 0.35, "smoke": 0.6, "press": 1, "pilot": 1 }`) :
- (a) `{ "tx": -150, "ty": 1700, "tz": 80, "d": 1900, "az": 156, "el": -40, "fov": 60, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`
- (b) `{ "tx": -60, "ty": 2150, "tz": 40, "d": 900, "az": 150, "el": -38, "fov": 50, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`
- (c) `{ "tx": 0, "ty": 1900, "tz": 0, "d": 2720, "az": -99, "el": -22, "fov": 54, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` (caméra au-dessus du collecteur commun : sinon il barre l'image, vu sur bouchons)
- (d) `{ "tx": 0, "ty": 1300, "tz": 0, "d": 2000, "az": -60, "el": -35, "fov": 56, "shift": 40, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`

**Mon choix provisoire : (a)**, la seule qui tient tout le `voir` de l'accroche (la cheminée, la flamme, les colonnes rouges derrière) ; **(b)** si le verre des colonnes ne se lit pas en contre-jour sur le vrai décor (elle a le meilleur point 4 et 5). Une hybride à essayer : (a) avec `d` 1500 et `ty` 1900 (le bout plus grand, les colonnes en bas du cadre).

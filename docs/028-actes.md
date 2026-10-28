# 028 · Détecteur de CO — le plan de mise en scène

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **85,7 s**) : le minutage est RÉEL. Tout instant se lit quand même dans le script — un repère d'`episode.json` (`cues` : 78, vérifiés mot à mot sur la table ; image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; une durée s'écrit comme un écart entre deux repères. Les secondes ci-dessous sont là pour te repérer (`npm run script -- 028`). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : des squelettes qui construisent, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/025-esp/src/acte*.js` ; fin : `kit/template/src/fin.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js`. Les poses qui cadrent seront dans les journaux des décors (`docs/journal/028-foyer.md`, `028-model.md`) : pars d'elles ; `VIEW` n'est qu'un point de départ réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

La nuit, un appartement : ta chambre (celle du 022 : tu dors sur le côté, face à la table de nuit), derrière son mur du fond le couloir et la **chaudière murale qui fuit** ; à gauche, la chambre de tes deux enfants ; au mur de ta chambre, le **détecteur de CO**. Le monoxyde sort de la chaudière, sans odeur, se mélange à l'air des pièces ; il prend la place de l'oxygène dans ton sang ; mal de tête, tu te rendors. Le détecteur compte : à faible concentration (≈ 50 ppm) il a le droit d'attendre une heure ; une heure passe, le gaz monte (≈ 100 ppm), dix, vingt minutes : la dose atteint son seuil, il hurle ; tu te réveilles, la fenêtre, dehors, tes enfants respirent.

- **À ne pas dire, ni montrer comme un fait** : que le gaz alimente l'alarme (c'est la pile : la tête de courant va de l'électrode à la PUCE, le buzzer est sur la pile) ; que le détecteur de CO est obligatoire (ni qu'il va le devenir) ; que le CO est plus lourd ou plus léger que l'air — **jamais une nappe au sol ni une couche au plafond**, « le gaz monte encore » = plus dense, pas plus haut ; « 250 fois » ; la norme comme si on l'avait lue (l'en-tête n'affiche que 50 et 100, les zones publiées par les fabricants) ; le nombre d'électrodes de la cellule ; une cause à la fuite.
- **« Brûle »** = s'oxyde sans flamme : un petit éclat sur l'électrode, jamais une flamme.
- Personne n'est blessé à l'image ; tes enfants dorment puis respirent dehors, ils ne sont jamais montrés malades.
- Le prochain dossier : **029, l'airbag d'avalanche** — le panneau ne porte aucun chiffre (« divise ton risque par deux » est dit par la voix seule).

## L'en-tête : la nuit

- **`clock`** (en grand) : l'heure de la nuit, en minutes après minuit — **01:48** à l'image 0 ; deux minutes passent sur « minute après minute » (→ 01:50, `repos`) ; **« Une heure passe »** → **02:50** (sur `passe`, en ≈ 1 s, l'horloge défile) ; **« Dix minutes. »** → 03:00 ; **« Vingt. »** → **03:10** ; elle s'arrête là (l'alarme). Sur l'établi elle garde sa valeur. Après `toloop`, elle lit `FIRST` (`D.loop` ramène l'état).
- **« CO · air »** (`ppm`) : **≈ 50 ppm** de l'image 0 à « Le gaz monte encore », puis **≈ 100 ppm** (sur `monte`, en ≈ 1 s) ; il ne s'arrête jamais sur un autre chiffre. Après « La fenêtre », l'air frais le fait tomber à « — » avant « respirent » (signal au-dessus de 25, encre en dessous). **Tu ne l'écris jamais : tu bouges `ppm`, l'en-tête suit.**
- **`dose`** : ce que la puce a compté, 0 → 1 = son seuil. Il se lit sur l'anneau du détecteur (façade, puce) et dans **`#gauge`** (« La puce · ta dose » : le remplissage signal, le seuil « Il sonne » en veille, « Dangereuse » au bout, jamais atteinte ; à droite, les minutes comptées depuis 01:48, lues sur `clock`). Il croît par marches sur les mots qui comptent (« compte », « minute après minute », « compte toujours », « Dix minutes », « Vingt ») et passe 1 sur « seuil » (reponse) : le remplissage passe en veille, `#gauge-s0` → `#gauge-s1`.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`, `{ ...STAGED, ...BLOODED }`) : il ne dépend pas de l'acte d'avant ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.
- **Chaque coupe est un raccord** (forme, objet, mouvement) : on coupe sur la pièce que la phrase vient de nommer, ou dans le sens du mouvement — les raccords sont écrits dans les tables. Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` et `-0.1`). Rien d'un plan ne déborde sur le suivant.
- **La grille seconde par seconde** : l'image bouge dès l'image 1 par son sujet (les traînées de la fuite) ; un changement toutes les 2 à 3 s de 10 à 25 s (les tables le donnent), **aucune plage lente de 2 s** ; « Alors… on l'ouvre » seul dans son plan, dans le quasi-silence (`suck`, `hush`), l'éclaté s'ouvre SUR « on » (`explode`) ; une coupe ou un changement d'échelle franc à chaque porte d'acte.
- **Les mots qui frappent** (`D.punch(t, 0.06)`, un par phrase au plus, jamais sur une coupe ni sur l'image 0, jamais deux à moins d'une seconde) : « empoisonne » (`choc`), « rien », « l'oxygène », « compte » (scene), « brûle », « charge », « hurle », « Jamais ». `D.captionStyle({ hit: 0.25 })` est appelé dans `acte1.js`.
- **Les sons** sont déjà dans `episode.json` → `sfx`, posés dans les souffles (aucun sur un mot : vérifié) : coups après « empoisonne », « rien », « gaz », « l'oxygène » ; un clic par pièce de l'éclaté après son mot ; le bip du détecteur (`beeps`, un piézo à 3,1 kHz) seulement dans les trous de « Le boîtier hurle. Tu ouvres les yeux. La fenêtre. ». Si tu déplaces une image, ne déplace pas un son : signale-le.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette ou un seul panneau à la fois : `#gauge`, `#retitle`, `#duel`, `#net`, `#next` ne se chevauchent jamais) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête (sans `--bare`).
- Mouvements `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe. La caméra traverse le verre (les murs, le lit), jamais le détecteur, la chaudière, toi ou les enfants.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 30 le détecteur au mur, ≈ 150 ta tête, ≈ 500 la chambre, ≈ 1 500 l'appartement ; `SIZE` (12) le détecteur sur l'établi, 45 la rangée ; 60 le sang).
- **Couleurs** : `mood` 1 dans l'appartement jusqu'à « respirent » (le relâchement : 0 là, pas avant), 0 sur l'établi et dans la fin, sauf la démonstration du détecteur de fumée (le gaz est là : 1). Jamais à mi-chemin plus d'une demi-seconde.
- **Deux « toi »** : `you` est la figure endormie du 022 (elle respire, elle ne bouge pas) ; `me` est toi réveillé (`mePose` 0 assis au lit · 1 à la fenêtre · 2 dehors). Sur la coupe de « Tu ouvres les yeux » : `you` 0, `me` 1. Toi, de près, es de verre : jamais en très gros plan, jamais la main seule.
- **Le sang** : `micro` 1 dissout l'appartement (et le détecteur au mur) ; la maquette est à ta poitrine (`BLOOD.at` = `YOU.chest`) : on y entre par une plongée depuis ta poitrine, on en sort par un recul. `swap` ne redescend jamais pendant le film (le sang reste chargé) — sauf la boucle, qui le ramène.
- Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP : la liste de `FIRST` est fermée. S'il t'en manque un, écris-le sous « À changer ailleurs ». Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf. **26 images lues au plus.** Journal : `docs/journal/028-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire de la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-co` (Monoxyde de carbone / Sans odeur, signal) · `#gauge` (La puce · ta dose — Il sonne — Dangereuse ; `#gauge-s0` « Il compte, minute après minute », `#gauge-s1` « Seuil atteint — il sonne », veille) · `#rail-seuil` · `chip-sonne` (Le boîtier / Il sonne, veille) · `#retitle` (Il sonne : « Dès qu'il sent le gaz » barré → « Avant le danger ») · `chip-oblig` (Détecteur de fumée / Obligatoire, encre) · `chip-nonoblig` (Détecteur de CO / Pas obligatoire, signal) · `#duel` (« Le tien, au plafond… » — Fumée · ou · CO) · `#net` · `#next` (Prochain dossier · 029 — « Une avalanche. Et un sac qui se gonfle sur ton dos. » — S'abonner pour l'ouvrir) · les `.rail`. Les pièces se nomment avec `co.add`, sans chiffre (« Grille », « Membrane », « Électrode », « Puce », « Buzzer », « Pile »). Une étiquette qui suit un point sort du cadre quand la caméra voyage : place fixe en zone haute (`chip(id, null, 96, 470, de, à)`).

## La première image — quatre candidates

**« Ta chaudière t'empoisonne. »** : la première image montre déjà l'empoisonnement en cours, la nuit, et le détecteur qui ne dit rien. Elle se lit sans le son à 270 px et elle bouge dès l'image 1 **par son sujet** (les traînées de la fuite qui avancent ; ta respiration). L'agent de `foyer.js` les tire sur une planche, sur le vrai décor ; celui qui orchestre choisit AVANT les actes et colle `POSE0` dans `world.js`. Notées sur les six points de `docs/recette-agents.md` (sur bouchons : à refaire sur le décor fini).

| | pose (prête pour `essais.json`) | 1 événement en cours | 2 perspective basse | 3 menace derrière le sujet | 4 forme reconnue, d'où on ne la voit jamais, ≥ 40 % | 5 le système déjà là | 6 bouge par son sujet | total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **(a) l'oreiller et la chaudière** (`POSE0` provisoire) | `{ "tx": 70, "ty": 112, "tz": -175, "d": 560, "az": -36, "el": 3, "fov": 40, "shift": 180, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | oui : la fuite coule vers toi | oui (el 3, au ras du matelas) | **oui** : la chaudière rougeoie derrière ta tête, à travers le mur de verre | oui : quelqu'un qui dort, vu à travers les murs, le lit sur ≈ 50 % | oui : le voyant vert au mur, en haut à gauche | oui si les traînées avancent assez vite (≥ 30 cm/s) | **6** (à confirmer sur le décor) |
| (b) la chaudière en contre-plongée | `{ "tx": 150, "ty": 145, "tz": -284, "d": 300, "az": -58, "el": -14, "fov": 40, "shift": 100, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | oui : flamme, fuite | oui (el −14) | non : la menace EST le sujet, rien derrière | oui : une chaudière, d'en dessous | non : le détecteur hors champ | oui | 4 |
| (c) le détecteur, la chaudière derrière | `{ "tx": 10, "ty": 150, "tz": -160, "d": 150, "az": -44, "el": -8, "fov": 40, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | oui : les perles aspirées | à moitié (el −8) | oui : la chaudière en bas à droite, derrière le verre | à moitié : un boîtier que peu reconnaissent | **oui, grand** | à moitié | 4 |
| (d) l'appartement de haut | `{ "tx": -110, "ty": 30, "tz": -90, "d": 1900, "az": -10, "el": 50, "fov": 36, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }` | oui : la fuite gagne les pièces | non (une carte) | non | à moitié : un plan de maison | à peine (un point) | oui | 2,5 |

Recommandée : **(a)**. Sur bouchons : la chaudière tombe entre y ≈ 490 et 770, ton visage et l'oreiller entre ≈ 970 et 1240 (un peu bas : le décor fini dira s'il faut remonter de 60 px), le voyant du détecteur en haut à gauche. Le risque : une fuite trop lente ou trop pâle — la première image serait un état, pas un événement.

## 01 · MENACE — `acte1.js` (0 → `tobench` 21,42)

L'acte part de `POSE0` et de `FIRST` ; en UN mouvement, deux coupes au plus (ici : `sauf`, `toscene`). Il FINIT sur `VIEW.system` (le détecteur au mur, de près) : c'est de là que l'acte 2 coupe.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 → 1,40 | « Ta chaudière t'empoisonne. » | `POSE0`, `FIRST` : toi endormi, la chaudière derrière ta tête, sa fuite qui passe la porte et vient vers le lit. La caméra pousse doucement vers la chaudière (`glide` si le sujet reste dans le cadre — vérifie 0,3 et 0,7 s). `D.punch(choc)` |
| `detecteur` 2,06 → 3,64 | « Et ton détecteur… ne dit rien. » | la caméra glisse vers le mur, à gauche : le détecteur, son voyant vert fixe ; la fuite passe devant lui ; « rien » : rien ne s'allume (`D.punch(rien)`) |
| `normal` 4,38 → 7,24 | « Normal : à faible concentration, il a le droit d'attendre une heure. » | de près (`VIEW.wall`) : des perles signal aspirées par la grille (`sniff` 0,5) ; l'en-tête dit ≈ 50 ppm ; sur « heure » (`heure1`) : un segment de l'anneau s'allume (`dose` 0,12 → 0,16) |
| `sauf` 7,69 → 10,44 | « Sauf si ce détecteur… n'a jamais su voir ce gaz. » | **coupe 1** (raccord : du boîtier du mur au disque du plafond — deux détecteurs) : le détecteur de fumée blanc au plafond (`VIEW.smoke`, `smoke` 0,6), la brume qui passe autour, il reste noir. Rien ne dit lequel est le tien : le C reste ouvert |
| `toscene` 11,00 → 12,66 | « Le monoxyde sort de ta chaudière, » | **coupe 2** (raccord : la brume qui passait le plafond → sa source) : `VIEW.boiler`, la flamme, la fuite qui naît sous le caisson ; un mouvement commence et ne s'arrêtera plus jusqu'à `tobench` |
| `chaudiere` 12,12 → 13,38 | « …sans odeur. » | la caméra suit les traînées par la porte jusqu'à ton visage endormi ; `chip-co` (Monoxyde de carbone / Sans odeur) dans la zone haute |
| `sang` 14,12 → 15,94 | « Dans ton sang, il prend la place de l'oxygène. » | plongée par rapport dans ta poitrine : `micro` 0 → 1 (l'appartement se dissout), la maquette du sang (`VIEW.blood`) ; sur « place » / « l'oxygène » : `swap` 0,25 → 0,6, les perles signal remplacent les veille. `D.punch(oxygene)` |
| `tete` 16,32 → 17,14 | « Mal de tête… » | recul hors de la poitrine (`micro` → 0) jusqu'à ta tête (`fs` ≈ 150) : `ache` 0 → 1 |
| `rendors` 17,72 → 18,18 | « …tu te rendors. » | `ache` → 0,2 ; tu respires (le 022) |
| `mur` 18,64 → 20,10 | « Au mur, le boîtier compte. » | la caméra monte de ta tête au détecteur (`VIEW.system`, `fs` 30) ; sur « compte » (`compte1`) : deux segments de plus (`dose` → 0,2), la tête de courant part de l'électrode (`current` 0,5) |
| `tosystem` 20,71 → `tobench` 21,42 | *(souffle, « Alors… »)* | la caméra s'arrête sur `VIEW.system` ; plus rien ne bouge que le voyant. C'est de là que l'acte 2 coupe |

## 02 · AUTOPSIE — `acte2.js` (`tobench` 21,42 → `tozero` 42,00)

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` 21,42 | « Alors… » (fin) | `benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.system, origin: BENCH_ORIGIN, state: { ...BENCHED, dose: <la valeur de l'acte 1> } })` : le même détecteur, à la même place, seul sur son halo |
| `explode` 21,56 → 22,00 | « …on l'ouvre. » | **sur « on »** : `explode` 0 → 1 (≈ 1 s, `power2.out`), la caméra recule par rapport vers `VIEW.exploded` (`fs` 45). Seul dans son plan |
| `air` 22,76 → 24,56 | « L'air de ta chambre entre par la grille. » | la rangée ; `sniff` 0 → 0,6 : les perles entrent par la grille ; `litGrille` sur « grille » ; `co.add` « Grille » |
| `membrane` 25,42 → 26,00 | « Il traverse une membrane… » | la caméra glisse le long de la rangée ; `litMembrane`, les perles la traversent |
| `electrode` 26,70 → 27,28 | « …et touche une électrode. » | `litElectrode` : les perles se posent sur sa face claire |
| `derriere` 27,66 → 30,64 | « Derrière : une puce, un buzzer, et une pile. » | UN cadre pour les trois (moins d'une seconde entre « puce » et « buzzer ») : `litPuce` (`puce`), `litBuzzer` (`buzzer`), `litPile` (`pile`), chacun sur son mot, les clics suivent |
| `torepos` 31,15 → 33,16 | « Sur cette électrode, le monoxyde brûle. » | `VIEW.electrode` (de près) : une perle se pose et **brûle** sur le mot (un éclat, `D.punch(brule)`) |
| `courant` 34,02 → 35,40 | « Ça fait un petit courant, proportionnel au gaz. » | la tête de lumière part vers la puce (`current` 0,5) ; sur « proportionnel » : `sniff` 0,6 → 1 et `current` → 1 (plus vive), puis les deux redescendent à 0,4 : on voit la proportion |
| `additionne` 36,02 → 36,68 | « La puce l'additionne, » | `VIEW.puce` : l'anneau de la puce ; `#gauge` entre (zone haute) — il y reste jusqu'à `tozero` |
| `minute1` 36,98 → 37,88 | « …minute après minute… » | sur chaque « minute » : `clock` +1 (01:48 → 01:50) et un segment (`dose` 0,2 → 0,24 → 0,28) |
| `sang2` 38,54 → 38,76 | « …comme ton sang. » | coupe (raccord : l'anneau qui se remplit → les globules qui se chargent) : `{ ...STAGED, ...BLOODED }`, `VIEW.blood`, `swap` 0,6 → 0,65 |
| `toseuil` 39,11 → `tozero` 42,00 | « Abonne-toi : cette heure… regarde-la passer. » | `followCall` ; le film ne s'arrête pas : la caméra recule déjà hors de ta poitrine (`micro` 1 → 0) vers toi endormi, le détecteur au mur, la chaudière derrière — l'image de l'accroche qui revient. Le `#gauge` sort avant la coupe. Propose la couverture dans ton message (la rangée à `eclate$`) |

## 03 · RÉPONSE — `acte3.js` (`tozero` 42,00 → `toverdict` 56,73)

En coupes, un plan par souffle. Le relâchement tombe sur « respirent » : `mood` 0 là, pas avant.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` 42,00 → 42,76 | « Une heure passe. » | **coupe** (changement d'échelle franc) : `VIEW.house`, l'appartement de haut, tout le monde dort ; sur « passe » : `clock` 01:50 → 02:50 en ≈ 1 s (l'horloge défile), le `#gauge` revient, `dose` → 0,5 |
| `monte` 43,46 → 44,20 | « Le gaz monte encore. » | coupe : `VIEW.door`, la fuite plus forte, la brume plus dense (`co` 0,5 → 1, `ppm` 50 → 100) — plus dense, PAS plus haute |
| `charge` 44,98 → 45,40 | « Ton sang se charge… » | coupe : le sang (`BLOODED`), `swap` 0,65 → 0,85. `D.punch(charge)` |
| `toujours` 45,76 → 47,00 | « …et le boîtier compte toujours. » | coupe : `VIEW.wall`, l'anneau à `dose` 0,75 |
| `dix` 47,49 → 48,72 | « Dix minutes. Vingt. » | même plan, la caméra pousse ; « Dix » : `clock` 03:00, `dose` 0,88 ; « Vingt » : 03:10, `dose` 0,96 |
| `seuil2` 49,94 → 50,24 | « La dose atteint son seuil. » | sur « seuil » : `dose` → 1 — le dernier segment, `#gauge` passe le seuil (`#gauge-s1`) ; le `#gauge` sort avant `trigger` |
| `trigger` 51,07 → 51,44 | « Le boîtier hurle. » | `alarm` 0 → 1 sur « hurle » : les anneaux du buzzer, la lumière sur le mur (`D.punch(trigger + 0.05)`, `chip-sonne`) — de près |
| `yeux` 51,68 → 52,48 | « Tu ouvres les yeux. » | coupe (raccord : la lumière du mur → toi qu'elle éclaire) : `you` 0, `me` 1, `mePose` 0 — assis au lit, la tête vers le mur où sonne le boîtier (`alarm` 1) |
| `fenetre` 52,84 → 53,44 | « La fenêtre. » | coupe : `VIEW.window`, `mePose` 1 ; `window` 0 → 1, `air` 0 → 1, la brume recule (`co` 1 → 0,5), `ppm` commence à tomber |
| `dehors` 53,72 → 54,24 | « Dehors. » | coupe : `VIEW.outside`, `mePose` 2, `kidsOut` 1 — vous trois dehors, la maison derrière, sa brume, la lumière de l'alarme dans la chambre |
| `enfants` 54,70 → 56,12 | « Et tes enfants… respirent. » | la caméra s'approche des enfants ; sur « respirent » : `breath` 0 → 1 (leurs souffles veille), **`mood` 1 → 0**, `ppm` → 0 (« — »). Le relâchement |

## Fin — `fin.js` (`toverdict` 56,73 → 85,73)

Chute → ce qui est dû et le commentaire → like → prochain dossier → boucle. Plus rien du sujet ne revient après l'annonce ; la voix n'y redemande pas l'abonnement, c'est le panneau qui le porte. **La dernière image est la première** : tire les deux côte à côte.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` 56,73 → `tocta` 63,29 | « Voilà le secret : il ne sonne pas dès qu'il sent le gaz. Il compte ta dose… et sonne avant qu'elle soit dangereuse. » | coupe sur l'établi (`VIEW.whole`, `dose` 1 : l'anneau plein, veille) ; `retitle` : montre à `chute`+0,1, barre à `strike` (59,47), corrige à `avant` (61,57), sort avant `tocta` ; `D.verdict(verdict)` (59,98) |
| `tocta` 63,29 → 67,90 | « Et le détecteur blanc, au plafond ? S'il n'est que de fumée, il ne voit pas ce gaz. Jamais. » | coupe : `VIEW.smoke`, `smoke` 1, `co` 0,5, `mood` 1 : la brume passe autour du disque blanc, rien ne s'allume. `D.punch(jamais)` |
| `oblig` 68,20 → `nonoblig` 69,80 | « Celui de fumée est obligatoire. » | `chip-oblig` (zone haute) |
| `nonoblig` 69,80 → 70,94 | « Celui de CO, non. » | coupe (raccord : du plafond au mur) : le détecteur de CO au mur ; `chip-nonoblig` |
| `ask` 71,40 → `tolike` 74,61 | « En commentaire : le tien… fumée, ou CO ? » | un cadre où l'on voit les deux (le disque au plafond, le boîtier au mur, d'en dessous) ; `duelCall(tl, { from: t.ask - 0.5, aAt: t.duelA, bAt: t.duelB, to: t.tolike - 0.2, toneA: "signal", toneB: "veille" })` — le film ne répond pas |
| `tolike` 74,61 → `toabo` 77,73 | « Like : ça remontera chez quelqu'un qui rallume sa chaudière ce soir. » | coupe : la chaudière (`VIEW.boiler`, `leak` 0, `co` 0) dont la flamme se rallume sur « rallume » ; `likeCall` |
| `toabo` 77,73 → `toloop` 82,76 | « Prochain dossier : une avalanche… et un sac qui, gonflé, divise ton risque par deux. » | coupe : dehors (`VIEW.outside` sans personne), la caméra monte lentement vers la nuit ; `nextFile` (`factAt` : `avalanche`) ; le panneau sort avant `toloop` |
| `toloop` 82,76 → `rewind` 84,40 → fin | « Dehors comme chez toi… le jour où… » | coupe sur « Dehors » : de dehors, la fenêtre fermée de ta chambre ; la caméra passe la fenêtre (« chez toi ») et revient à `POSE0` ; `D.loop({ at: t.toloop, rewindAt: t.rewind, fromD })` — `clock`, `ppm`, `dose`, `co`, `swap`, `you`, `kids`… reviennent à `FIRST` |

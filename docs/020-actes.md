# 020 · Taipei 101 — le plan de mise en scène

**Aucune voix n'est enregistrée** : le minutage est ESTIMÉ (120 s, soit ≈ 90 s dites). Tout instant se lit dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits et vérifiés sur la table : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères (`npm run script -- 020` donne la table). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des squelettes de dix lignes, à réécrire en entier) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/017-irm/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`). Les poses qui cadrent bien seront dans les journaux des décors : `docs/journal/020-tour.md`, `020-model.md` — pars d'elles ; `VIEW` (dans `world.js`) n'est qu'un point de départ, réglé sur des bouchons.

## La scène, et ce qu'on a le droit d'affirmer

8 août 2015, le typhon Soudelor sur Taipei. Tu es au sommet de la tour, elle se balance. Tout en haut pend une boule d'acier de 660 tonnes — 41 plaques soudées, 92 câbles, huit vérins dessous, un anneau de butée autour de sa tige : un pendule accordé sur la tour. La tour part, la boule traîne et la retient par ses câbles ; ses vérins changent l'élan en chaleur. À 6 h 59, au pic, la boule va à un mètre de son repos — sur un mètre cinquante de course : son record. Sourcé (site officiel de Taipei 101, Taiwan News, Guinness, Structure magazine) : tous ces chiffres ; « à contretemps » ; « d'abord le confort » ; en séisme les vérins la brident (20 cm, 2019) et c'est la structure qui résiste.

- **Personne n'est blessé, rien ne casse, rien ne touche la butée.** La tige s'arrête à 50 cm de l'anneau.
- **La tour est une maquette** (142 m pour 508, balancement exagéré pour se voir) : **aucune longueur, aucun chiffre ne s'affiche sur elle.** Le système, lui, est à l'échelle vraie (câbles raccourcis) : l'écart tige–anneau EST les 150 cm.
- Aucun chiffre à l'écran en dehors de l'en-tête et des étiquettes écrites ci-dessous. Pas de « 40 % », pas de période en secondes, pas de déplacement du sommet, pas de comparaison « avec / sans boule » chiffrée, pas d'heure autre que 6 h 59, pas de vitesse de vent autre que 160.
- « Cinquante, soixante-dix » sont des étapes de la montée (scénario), « un mètre » est la mesure. La boule ne « sauve » pas la tour : à la chute c'est le squelette qui porte.
- L'ordre des causes : **la tour part → la boule, en retard, tire dessus par ses câbles → ses vérins freinent la boule et chauffent.**

## L'en-tête : une règle

- **`reach`** (en grand) : la course de la boule au bout de son aller, en vrais centimètres. 30 dans le typhon « ordinaire » de l'acte 1 (scénario), 0 au repos sur l'établi, **50 · 70 · 100 sur les mots de l'acte 3**, 20 pour le séisme. Signal dès 40 cm tant que `mood` vaut 1, veille dès que `mood` passe à 0 (« Elle s'arrête ») : `main.js` le fait. Jamais au-delà de 100.
- Le second compteur, « Butée », est fixe : **150 cm** (sourcé). Il passe en signal tant que `limit` > 0,5 (l'anneau dessiné chaud). « 100 cm » au-dessus de « Butée 150 cm », c'est le climax en un coup d'œil.

## Le balancement : un seul nombre

`swing` compte les demi-allers. `world.js` en tire tout : la cage se déplace de `280 × bend × sin(π·swing)` (maquette), la boule de `−reach × cos(π·swing)` dans sa cage. **La boule a un quart d'aller de retard sur la tour : c'est écrit une fois, là, et aucun acte ne peut l'inverser.**

- `swing` **entier** : la boule est au bout de sa course (l'en-tête dit vrai à cet instant), la tour coupe son axe à pleine vitesse. **Demi-valeur** : la tour est au bout de son inclinaison (à droite pour 0,5 · 2,5 · … ; à gauche pour 1,5 · 3,5 · …), la boule passe par son repos.
- Quand le balancement court tout seul : une ligne droite (`"none"`), ≈ un demi-aller toutes les 3 à 4 s. Quand la voix dit le geste (« part », « reviennent », « s'arrête ») : un demi-aller par mot, qui ARRIVE sur le mot (`sine.inOut`), ou `swing` tenu.
- Une coupe POSE `swing` (les états `STAGED` / `BENCHED` le font) ; un acte ne le fait jamais glisser de loin (douze allers en une seconde : une secousse).
- `bend` : jusqu'où va la tour (1 dans un plan de cage ; 2 à 3 dans un plan large, où une demi-boule ne se verrait pas).
- `aboard` : **1 dès que la course de la boule doit se lire** (la caméra est à bord : la cage tient en place, c'est la pluie qui penche) ; **0 dès que la tour doit bouger dans l'image**. On en change pendant un mouvement de caméra ou sur une coupe, jamais sur un plan fixe.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette, un titre a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`). Les câbles et la flèche qui montent vers l'en-tête se fondent dans le noir avant lui.
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) — ici les distances vont de 1 500 à 50 000 : TOUT recul hors de la cage est par rapport ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 900 la cage, ≈ 300 les vérins ou l'anneau, ≈ 3 000 le tiers haut, 6 000 à 8 000 la tour entière avec `fy` ≈ 7 000, `SIZE` sur l'établi).
- **Couleurs** : signal = le typhon (pluie, vent), l'élan de la tour, la course qui approche de la butée ; veille = la boule qui retient, les câbles qui tirent, les vérins qui freinent ; ink = le reste. `mood` 1 dans le typhon, 0 sur l'établi et dès que les vérins ont gagné. Jamais à mi-chemin plus d'une demi-seconde.
- Toi es un mannequin de verre : jamais en très gros plan, jamais la main seule.
- Pas de secousse de caméra (`jolt`) sur un plan large plein de lignes d'étages ; la pluie est faite de traînées : si `qa` compte des images parasites, c'est elle — ralentir le mouvement de caméra avant de toucher au décor.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **30 images lues au plus.** Journal : `docs/journal/020-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-toi` (Toi) · `chip-660` (Acier / 660 tonnes) · `chip-vent` (Typhon Soudelor · 8 août 2015 / Vents : 160 kilomètres-heure) · `chip-101` (Taipei 101 / 101 étages) · `chip-41` (La boule / 41 plaques soudées) · `chip-92` (Suspendue par / 92 câbles) · `chip-8` (Dessous / 8 vérins) · `chip-150` (Anneau de butée / Course : 150 centimètres) · `chip-pendule` (Un pendule / Accordé sur la tour) · `chip-chaleur` (Dans les vérins / L'élan devient chaleur) · `chip-659` (8 août 2015 / 6 heures 59) · `chip-butee` (La butée / Elle avance encore) · `chip-record` (Un mètre / Son record) · `#retitle` (Cette boule : « Tient la tour » barré → « Ton confort ») · `chip-seisme` (Record en séisme / 20 centimètres) · `chip-squelette` (En séisme / Le squelette encaisse) · `#cta-field` (« Un jour de typhon… tu montes ? » → « JE MONTE », 8 signes) · `#net` · `#next` (Prochain dossier · 021 — « Un TGV lancé. Dans la cabine : plus personne. » — S'abonner pour l'ouvrir) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sans chiffre se font avec `co.add`. Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

**La première image : toi au sommet, la boule énorme derrière la vitre — pas la tour entière.** Pourquoi : la tour entière fait 90 px de large dans un cadre vertical et une tour sous la pluie, tout le monde en a vu ; ce que personne n'a vu, c'est une sphère d'acier striée, grande comme une maison, qui glisse dans une cage de verre — c'est la signature du dossier, elle se lit à 270 px, l'accroche dit « tu es au sommet », et à cette échelle le balancement SE VOIT (la cage se déplace d'une demi-boule). Essaie quatre cadres sur une planche avant de choisir, tous de dehors, la pluie devant : (a) `VIEW.hook` tel quel ; (b) plus bas, en contre-plongée (`el` −8) : la boule au-dessus de toi ; (c) plus large (`fov` 44, `d` 3 600) : le module du dessous et la couronne, la boule au centre ; (d) de trois quarts arrière de toi, la vitre et la pluie au premier plan. C'est toi qui règles `POSE0` et `FIRST` : rends-les dans ton message final, prêts à coller. En UN mouvement ; deux coupes au plus (elles sont marquées).

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, `FIRST` : la pluie à l'horizontale, la façade de verre, toi petit derrière la vitre, la boule énorme derrière toi. **Ça bouge dès l'image 1** : `swing` court en ligne droite (le sommet traverse le cadre, la boule traîne), la caméra recule doucement. Sans texte, elle doit arrêter le pouce. |
| `sommet` | « Typhon sur Taipei. Tu es au sommet d'une tour… » | la caméra glisse vers toi à la vitre ; `chip-toi` sur `tour.A.head`, sorti avant `sways` |
| `sways` | « et elle se balance. » | `axis` 0 → 1 : le fil à plomb de la tour apparaît, et le bord de la façade le QUITTE — un demi-aller arrive au bout de son inclinaison sur le mot ; la caméra recule pour que le déplacement se voie |
| `calm` → `tons` | « Ce qui la calme : 660 tonnes d'acier, » | de toi, la caméra passe la vitre et va à la boule derrière toi ; `aboard` 0 → 1 pendant le mouvement (on monte à bord), `axis` → 0 ; sur « 660 » : `litBall` 1, `chip-660` |
| `counter` | « qui bougent à contretemps. » | à bord : la cage tient en place, la pluie penche d'un côté, la boule va de l'AUTRE — `datum` 1, `reach` 30 → 45 pour que la course se lise, un demi-aller qui arrive sur le mot |
| `seisms` → `notreally` | « Pour les séismes ? Pas vraiment. » | `quake` 0 → 0,6 : tout frémit vite et court, la boule ne répond presque pas (`reach` → 10) ; l'image TIENT ; `quake` → 0 sur « vraiment ». Ne rien expliquer : la réponse est due à la fin |
| `toscene` → `soudelor` → `winds` | « Huit août 2015 : le typhon Soudelor. Des vents à 160 kilomètres-heure. » | long recul par rapport hors de la cage (`aboard` 1 → 0, `datum` 0, `litBall` 0, `reach` 30) jusqu'au tiers haut (`VIEW.top`) : la pluie gagne tout le cadre ; `chip-vent` à place fixe en zone haute, de `soudelor` à `floors` − 0,2 |
| `floors` → `bends` → `comes` → `goes` → `boat` | « Cent un étages qui plient, reviennent, repartent… comme un bateau. » | **coupe 1** (sur `floors`) : du pied de la tour, en contre-plongée grand angle (`VIEW.low`) — `bend` 2,5, `axis` 1, `city` 1 ; **un demi-aller par mot** : « plient » la tour arrive au bout à droite, « reviennent » elle recoupe son axe, « repartent » elle arrive au bout à gauche ; `chip-101` de `floors` à `boat` ; sur « bateau » elle repart, sans fin |
| `without` → `seasick` | « Sans rien pour les calmer, là-haut, tu aurais le mal de mer. » | **coupe 2** : toi à la vitre (`VIEW.you`, `aboard` 1), la boule derrière toi ; sur « Sans rien » la boule passe en verre (`xray` 0 → 1 : elle n'est plus là) et `bend` 1 → 1,8 : dehors la pluie penche plus loin, plus fort ; sur « mal » : `grip` 0 → 1, tu te tiens au garde-corps |
| `seasick`$ → `tosystem` | *(silence)* | la boule redevient pleine (`xray` → 0) et la caméra va à elle : `VIEW.system` — `shell` → 0,15, `storm` → 0, `you` → 0, `city` → 0, `axis` → 0, `bend` → 0, `reach` → 0, `aboard` → 0, `mood` → 0 à la fin : il ne reste que le système, au repos (c'est de là que l'acte 2 coupe : rien ne doit plus bouger) |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` → `explode` | « Alors… on l'ouvre. » | `benchCut` de `VIEW.system` (origine `CAGE.at`) vers l'établi, `BENCHED` ; **sur « on »** : `explode` 0 → 1 (le cadre et les câbles montent, les vérins s'écartent en étoile, l'anneau descend), recul par rapport vers `VIEW.exploded`. Les plaques restent serrées : elles attendent leur mot |
| `p1` | « Une boule de cinq mètres cinquante : » | `litBall` 1 ; la caméra se rapproche de la boule |
| `p2` → `welded` | « 41 plaques d'acier soudées. » | sur « 41 » : `plates` 0 → 1 — la sphère s'ouvre en quarante et un disques ; sur « soudées » : `plates` → 0, ils se referment (on a montré le geste) ; `chip-41` |
| `p3` | « 92 câbles. » | `litBall` 0, `litCables` 1 ; la caméra monte le long des brins jusqu'aux attaches (`VIEW.cables`) ; `chip-92` à place fixe (la caméra voyage) |
| `p4` | « Huit vérins. » | redescend sous la boule : `litCables` 0, `litDampers` 1, `xray` 0,6 ; `chip-8` |
| `around` → `p5` | « Et autour… un anneau de butée. » | `explode` → 0 dès « autour » (tout se rassemble pendant la descente) ; `litDampers` 0, `litRing` 1, `datum` 1 : la tige au centre de son anneau (`VIEW.ring`) ; `chip-150` |
| `torepos` → `pendulum` → `tuned` | « C'est un pendule, accordé sur la tour. » | recul vers `VIEW.swing` (presque de face), `xray` 0, `litRing` 0 : `reach` 0 → 60, `swing` court droit — il oscille, les câbles s'inclinent, la tige va et vient dans l'anneau ; `chip-pendule` de `pendulum` à `leaves` − 0,25 |
| `leaves` → `lags` → `holds` | « La tour part d'un côté… la boule traîne, et la retient. » | **coupe** (0,12 avant `leaves`) : la cage dans la tour, caméra dans le monde (`VIEW.cage`, `{ ...STAGED, storm: 0.4, axis: 1, bend: 1.5, reach: 60, swing: 1.5, mood: 0 }`) ; « part » : `swing` 1,5 → 2 — la tour quitte son bout gauche et file à droite ; « traîne » : à 2 la boule est restée en arrière de toute sa course (`litBall` 1), l'image tient un souffle ; « retient » : `swing` 2 → 2,5 et `pull` 0 → 1 — une tête de lumière veille grimpe les câbles, la tour arrive moins loin (`bend` 1,5 → 1,1) |
| `each` → `dampers` → `heat` | « Et à chaque aller-retour, ses vérins changent l'élan en chaleur. » | **coupe** : sous la boule, à bord (`VIEW.dampers`, `aboard` 1, `xray` 0,6, `storm` 0,4) : `swing` fait deux demi-allers (« aller-retour ») ; sur « vérins » : `brake` 1 — celui qui se comprime luit veille ; sur « chaleur » : `heat` 0 → 1 ; `chip-chaleur` de `dampers` à `toseuil` − 0,15 |
| `toseuil` | « Abonne-toi : ce typhon, regarde ce qu'il fait à la boule. » | `followCall` (les chevrons `#rail-seuil`, le nom du compte s'allume) ; **le film ne s'arrête pas** : la caméra recule déjà des vérins vers la cage entière, `brake` / `heat` → 0, `xray` → 0, et **le typhon revient** — `storm` 0,4 → 1, `mood` → 1, `bend` 1,1 → 1,6, la pluie s'épaissit : l'image de l'accroche qui revient. L'en-tête répond au mot « boule » (`reach` 60 → 30 : elle attend) |

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes. `mood` 1, `gel` 0,15 au plus.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `peak` | « Six heures cinquante-neuf. Le pic du typhon. » | **coupe** : le sommet, de dehors, caméra dans le monde (`VIEW.hook` élargi ou `VIEW.top` ; `{ ...STAGED, bend: 1.6, swing: 1 }`) ; `chip-659` à place fixe, sorti avant `towergo` ; sur « pic » : `bend` 1,6 → 2,2, la pluie au plus dense |
| `towergo` | « La tour part. » | **coupe** : du pied (`VIEW.low`, `axis` 1, `swing` 1,5 → 2,5 d'un trait : elle traverse tout le cadre, de gauche à droite) |
| `ballgo` → `c50` | « La boule aussi. Cinquante centimètres. » | **coupe** : la cage, à bord (`VIEW.cage`, `aboard` 1, `datum` 1, `swing` posé à 2,4) : la boule part ; `reach` 30 → 50 et `swing` → 3, **arrivé sur « Cinquante »** : elle est au bout, l'en-tête dit 50 et passe en signal |
| `c70` | « Soixante-dix. » | le demi-aller suivant, de l'autre côté : `swing` 3 → 4 et `reach` 50 → 70, arrivés sur le mot |
| `bumper` → `m150` → `still` → `more` | « La butée est à un mètre cinquante… et elle avance encore. » | **coupe** : d'en haut, à travers la boule en verre (`VIEW.pin`, `xray` 1, `limit` 1, `datum` 1, `aboard` 1) : l'anneau, et dedans la tige. **UN seul demi-aller, étiré au ralenti jusqu'à `trigger`** : `swing` 4 → 4,5 jusqu'à `still` (la tige repasse par le centre), puis 4,5 → 5 (`sine.out`) jusqu'à `trigger` — elle va vers l'anneau ; `reach` 70 → 100 sur la même durée : l'en-tête compte ; « Butée » passe en signal ; `chip-butee` sur `system.A.ringFar` de `still` à `toreponse` − 0,1 |
| `toreponse` → `trigger` | « Un mètre. » | **coupe** (resserrée sur la tige et le bord de l'anneau, de trois quarts bas ou d'en haut) : `swing` 5, `reach` 100 — **la tige s'arrête à cinquante centimètres de l'anneau, et l'image TIENT** ; rien ne touche, aucune secousse |
| `brakes` | « Les vérins freinent. » | **coupe** : les vérins (`VIEW.dampers`, `aboard` 1, `xray` 0,6) : `brake` 1, `heat` 0,5 → 1 ; le vérin comprimé luit veille |
| `stops` | « Elle s'arrête. » | même plan ou la boule : `swing` TENU à 5 — plus rien ne bouge dans la cage, dehors la pluie file toujours ; **`mood` 1 → 0 sur le mot** : l'en-tête (100 cm) passe en veille, `limit` → 0 |
| `returns` | « Elle repart dans l'autre sens. » | **coupe** : la cage, à bord (`VIEW.cage`) : `swing` 5 → 6 — la boule revient ; `pull` 0 → 1 : les câbles tirent la tour. `reach` reste à 100 jusqu'à la fin de l'acte (c'est le record que lit l'en-tête) |
| `never` → `record` | « On ne l'a jamais relevée plus loin : c'est son record. » | recul par rapport hors de la cage (`aboard` 1 → 0) : le sommet dans la pluie, `storm` 1 → 0,6, `bend` 2,2 → 1,2 — le balancement se calme ; `chip-record` à place fixe sur « record », sorti avant `toverdict` |

## Fin — `fin.js` (`toverdict` → la fin)

**L'ordre, à partir du 018 : chute → ce qui est dû + commentaire → like → prochain dossier → boucle.** Plus rien du sujet ne revient après l'annonce. Compare ta dernière image à la première (`look` aux deux instants) : elle doit être la même. `D.commit` prévient dans la console si un nombre de l'état n'est pas revenu — `look` ne l'affiche pas : relis `D.first` et le `POSE0` / `FIRST` que rend l'acte 1.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `secret` → `deny` → `notfall` | « Voilà son secret : cette boule n'empêche pas la tour de tomber. » | **coupe**, et UN seul plan pour toute la chute (le titre ne traverse aucune coupe) : la cage dans la tour, à bord (`VIEW.cage`, `{ ...STAGED, aboard: 1, reach: 40, storm: 0.8, grip: 1 }`) — la boule au centre, toi à gauche, les méga-colonnes au bord du cadre ; `retitle` : « Tient la tour » entre sur `secret` + 0,1, **barré sur `deny`** |
| `alone` | « La tour tient seule. » | `bones` 0 → 1 : le squelette s'allume autour de la cage, de bas en haut — c'est lui qui porte ; la boule passe un instant en verre (`xray` 0 → 0,7 → 0) |
| `abord` → `verdict` | « La boule est là… d'abord pour ton confort. » | lente poussée vers toi et la boule ; sur « d'abord » : `grip` 1 → 0, tu te redresses ; sur « confort » : `retitle` → « Ton confort », `D.verdict(verdict)`, `mood` → 0 ; titre sorti à `tocta` − 0,42 |
| `tocta` → `quakes` | « Et les séismes ? » | **coupe** : un jour calme, la tour du pied (`VIEW.low`, `{ ...STAGED, storm: 0, bend: 0, reach: 0, swing: 0.5, city: 1, mood: 1 }`) ; sur « séismes » : `quake` 0 → 1 — le sol tremble, la tour frémit de la base au sommet |
| `bridle` → `c20` | « Là, ses vérins la brident : vingt centimètres, son record en séisme. » | **coupe** : les vérins (`VIEW.dampers`, `xray` 0,5, `quake` 1) ; sur « brident » : `lock` 0 → 1, les colliers se serrent ; `reach` 0 → 20 sur un petit aller : l'en-tête dit 20 ; `chip-seisme` sur « vingt » |
| `skeleton` → `takes` | « C'est le squelette de la tour qui encaisse. » | **coupe** : la tour entière (`VIEW.tower` ou `VIEW.low`), `shell` 0,4, `bones` 0 → 2 (veille) sur « squelette » ; sur « encaisse » : `quake` 1 → 0, elle n'a pas bougé de son axe (`axis` 1) ; `chip-squelette`, sorti avant `ask` |
| `ask` → `answer` | « En commentaire : un jour de typhon… tu montes ? » | **coupe** : toi à la vitre dans le typhon (`VIEW.you`, `STAGED`, `aboard` 1), la boule qui va et vient derrière toi ; `commentCall` (`from` `ask`, `typedAt` `answer`, `chars` 8, `to` `tolike` − 0,3) |
| `tolike` → `believes` → `nomove` | « Like : quelqu'un croit encore qu'une tour ne bouge pas. » | **coupe** : la tour entière un jour calme (`VIEW.tower`, `storm` 0, `bend` 0, `axis` 1) : droite sur son fil à plomb ; sur « bouge » : `storm` 0 → 1, `bend` 0 → 2,5, `swing` part — elle quitte son axe ; `likeCall` |
| `toabo` → `next` → `tgv` → `nobody` | « Prochain dossier : un TGV à 255 kilomètres-heure… et dans la cabine, plus personne. » | **coupe** : l'établi, le système entier (`BENCHED`, `litBall` 0,5, `reach` 25, `swing` court lentement : elle se balance, tranquille) ; on s'en approche jusqu'à ce qu'il occupe la moitié de la largeur, sous le panneau ; `nextFile` (`showAt` `next` − 0,15, `factAt` `tgv`, `hideAt` `toloop` − 0,38, chevrons dès `toabo` + 0,1) — **la voix ne redit pas « abonne-toi » : c'est le panneau** |
| `toloop` → `rewind` | « Et là, pas besoin d'un… » | **coupe** : le sommet dans le typhon, d'un peu plus loin que `POSE0` (`{ ...STAGED, swing: FIRST.swing − 0.3 }` : `swing` se pose juste AVANT la phase de la première image) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène tout à `FIRST` et à `POSE0` : toi derrière la vitre, la boule énorme, la pluie |

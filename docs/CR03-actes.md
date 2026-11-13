# CR03 · Concorde — le plan de mise en scène

**Troisième « Compte à rebours ».** Pas un dossier : ni « Alors… on l'ouvre », ni éclaté, ni like. La mécanique, c'est le temps (16:42:31 → 16:44:31, deux minutes pile) ; le cœur du film, c'est **le défaut** : un réservoir que rien ne protégeait d'un choc transmis **de l'intérieur** par le kérosène. Recette : `docs/recette-compte-a-rebours.md` ; DA « noir chaud » : `docs/reconstitution.md`. Exigence n° 1 de Merwan : **« que ce qui est dit soit à l'écran, expliqué aussi »**.

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **148,0 s**, 21 beats) : le minutage est RÉEL et **serré** (presque aucun souffle de plus de 0,22 s ; chaque étape s'ouvre sur son heure, dite sans pause). Tout instant se lit dans le script — un repère d'`episode.json` (`cues`, vérifiés sur la table ; image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; les secondes ci-dessous ne servent qu'à te repérer (`npm run script -- CR03`). Les références `beat:mot` des tables sont vérifiées ; **pièges** : un repère attrape le DÉBUT des mots (`reservoir:Le` attrape « les », `t6:rentre` attrape « rentrer » → `rentrepas` vise `t6:Il`) ; les nombres se cherchent aussi par leur forme dite (`t4:soixante`, `reservoir:quatre`) ; `t7:Bourget#2` est le second.

Six fichiers, un agent chacun, **quatre à la fois** : vague 1 `acte1.js`, `acte2.js`, `acte2b.js`, `acte2c.js` ; vague 2 `acte3.js`, `fin.js` (dès qu'un agent de la vague 1 rend la main). Aujourd'hui des squelettes (coupe d'entrée et étiquettes posées), à réécrire en entier. Chacun n'écrit que `st` / `shot` / `path` / `cut` / `chip` / `tl` contre `world.js` : l'état `FIRST`, les poses `VIEW`, `STAGED` par lieu, `BENCHED` pour le réservoir de `depuis`, **`AT`** (où se tient l'avion dans les plans réglés) et **`onPlane(at, local)`** (un point de l'avion dans le monde, pour viser et éclairer : `lit(onPlane(at, [0, 20, 0]), 160)`). Forme : `episodes/CR02-deepwater/src/acte*.js` ; outillage `kit/lib/direct.js` ; blocs `kit/lib/blocks.js` (`duelCall`, `nextFile`) ; `kit/lib/reconstitution.js` (`feutre`). Les poses qui cadrent vraiment sont dans les journaux des décors (`docs/journal/CR03-concorde.md`, `-piste.md`, `-reservoir.md`) : pars d'elles. Faits : `docs/faits/CR03-concorde.md` § 12 (« À ne pas dire »).

## Les lieux et l'état

`S.set` : `SET.PISTE` 0 (le sol ET l'avion) · `SET.RESERVOIR` 1 (le réservoir 5 en coupe). **L'avion n'a pas de place fixe** : `run` (distance roulée puis volée ; `plan.js` → `RUN` : V1 6 200 — le train AVANT est alors sur la ligne V1 —, lamelle 8 920 — le pneu n° 2 est dessus —, rotation 10 300, décollage 12 800), `alt` (**−100 : plus d'avion**), `pitch`, `bank` (aile gauche basse) ; au-delà de la piste il suit seul la courbe de `traj`. **Quand l'avion bouge, la caméra et la lumière le suivent** : vise avec `onPlane`, déplace `fx fy fz` avec lui. **`culprit` désigne la pièce en défaut, `fault` l'allume** (une table pour tout : 1 la lamelle · 2 le réservoir 5 et son panneau · 3 le pneu n° 2 · 4 le moteur 2 · 5 le train gauche) : une pièce rouge à la fois, `fault` 0 tant que la phrase ne la nomme pas. **Vert** : `ok` allume les réservoirs de l'aile ; la barre de freinage de `principe` est verte puis rouge d'elle-même. `depuis` 0 → 1 : à partir de `todepuis` seulement. Tables complètes : `docs/CR03-decors.md`.

## L'en-tête (déjà monté dans `main.js` : n'y touche pas)

L'heure réelle (locale, avec ses secondes), en grand, **saute 0,08 s avant chaque étape** (sur sa première syllabe : il n'y a pas de souffle) : 16:43:13 (de 0 à t1) → 16:42:31 (t1) → 16:43:03 → 16:43:10 → 16:43:13 (t4) → 16:43:22 → 16:43:56 → 16:44:00 → 16:44:29 (t8) → 16:44:31 (issue) → 2001 (`todepuis`). Dessous, **le temps qui reste** jusqu'à 16:44:31 : T−1 min 18 s (« 78 secondes »), T−2 min 00 s (t1), T−1 min 28 s, T−1 min 21 s, T−1 min 18 s, T−1 min 09 s, T−35 s, T−31 s, T−2 s, T−0 s ; il s'efface à `todefaut`. **Tu n'écris jamais l'en-tête** ; les actes 01 L'HEURE / 02 LE DÉFAUT / 03 DEPUIS s'allument comme au CR02.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration, sur le mot.** Un chiffre que l'image ne montre pas entre en étiquette (`index.html`, une à la fois, place fixe en zone haute : `chip(id, null, 96, 470, de, à)`, déjà posées dans les squelettes) : `chip-v1` · `chip-six` · `chip-bord` · `chip-feu` · `chip-alt` · `chip-bilan` · `chip-kevlar` · `chip-inspect` (ses coches `#tick-1..3` : deux grises, la troisième s'allume en vert, `fin.js`). **La jauge de débit** (`#gauge`, zone haute à gauche) n'est pas une étiquette : ce sont trois nombres de l'état, `gauge` (montrée), `debit` (kg/s, 0 … 70 ; l'aiguille et le chiffre virent au rouge au-delà de 4), `mark` (la marque « 4 » allumée) — jamais en même temps qu'une étiquette. Pas de pièce du dossier dans ce film.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout ce que le lieu lit (l'avion compris : `run alt pitch bank n1…n4 gear burst chunk surge cutaway tear leak fire`) ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe. Coupes sur les repères `to…` (0,12–0,14 s avant la phrase). **Chaque coupe est un raccord** (forme, objet, mouvement), écrit dans les tables.
- **0 → 25 s : la grille de rétention.** Le sujet bouge seul dès l'image 1 (l'avion avance et cabre, le feu ondule et s'allonge) ; **un geste ou une coupe toutes les 2 à 3 s**, aucune plage lente de 2 s. Puis un changement toutes les 5 à 8 s au plus ; **l'horloge qui saute est la relance** de chaque étape. **Le plan-séquence** (`D.path`, `docs/recette-actes.md`) pour les traversées : la remontée sous l'aile (`promesse`), la course le long de la piste jusqu'à la lamelle (t1), le morceau de pneu suivi jusqu'à l'aile (t3), le front dans le kérosène (`defaut`) — chaque clé change d'angle de 6 à 15°.
- **Les moments forts se voient en entier, sans coupe dessus** : le pneu qui éclate (« éclate », 48,42), le feu qui prend (« flammes », 54,26), la bascule (« penche… tombe », 89,26 → 90,50), le front et le panneau (`trigger` 108,25 → « ailleurs » 110,06).
- **Le mécanisme suit la voix** : la barre vire au rouge SUR « Après », le pneu éclate SUR « éclate », l'aiguille passe SUR « soixante », le panneau part SUR « cède ». Couleurs franches : `fault` 0 ou 1, jamais à mi-chemin plus d'une demi-seconde.
- **Les mots qui frappent** (`D.punch(t.mot, 0.06)`, un par phrase au plus, jamais sur une coupe, jamais deux à moins d'une seconde, jamais à l'image 0) : `choc` « feu » 1,36 · « freiner » 3,88 · « l'intérieur » 8,76 · `vun` « V1 » 12,02 · « non-retour » 16,46 · « 150 » 20,34 · « percé » 26,86 · `quatre1` 28,32 · `top` 32,10 · « titane » 38,06 · `vdeux` 42,50 · `eclate` 48,42 · `flammes` 54,26 · `soixante` 56,74 · `dixfois` 61,43 · `coupe` 68,82 · « pas » (t6) 75,46 · `bourget1` 83,30 · `effondre` 86,29 · `tombe` 90,50 · « 113 » 94,72 · `frappe2` 100,10 · `enfonce` 107,02 · `cede` 109,74 · `verdict` « jamais » 118,54 · `kevlar` 124,26 · « 3 » 128,30 · « aucune » 131,30. `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **Le cercle rouge** (`feutre(D, { id, anchor, … })`, ancres `world.concorde.A.panel`, `.tyre2`, `.engine2`, `.gearLeft`, `world.piste.A.strip`, `world.reservoir.A.panel`) : un à la fois, sur la pièce que la voix nomme. Une flèche (`kind: "arrow"`) en `preuve` seulement.
- **Le son est posé en grille de départ** (`episode.json` → `sfx` : ambiance, signature, montée vers V1, deux impacts dans des souffles) ; le `monteur-son` l'écrit en entier après vous, avec les sons du sujet (`kit/sons/CR03-*.wav` : pneu, débris, panneau, fuite, feu, alarme). N'écris aucun son ; si une image en appelle un, dis-le dans ton journal.
- **Zones** : en-tête 214–412 · zone haute 436–790 (une étiquette ou la jauge à la fois) · sujet 440–1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête.
- **La part du cadre** que tient le sujet est donnée pour chaque plan (en largeur) ; sous 30 %, le plan est un plan d'ensemble et ne dure pas plus de 3 s (sauf `principe` et t7 : la piste ou la carte EST le sujet).
- **`dof`** : les seules poses qui étalent `CLOSE` (gros plans) ; tout le reste `dof: 0`. **Caméra au sol** : `ty + d·sin(el) ≥ 1,5`.
- **Interdits** : personne à l'image (ni cabine, ni hublot éclairé, ni silhouette) ; **aucune image du crash** (l'avion sort du cadre, puis la piste vide) ; aucun nom ; jamais « la lamelle a percé le réservoir » (elle a éclaté le pneu) ; jamais le pneu avant V1 ; aucune étincelle ni arc au puits de train (l'origine du feu n'est pas établie) ; aucune raison montrée au train qui ne rentre pas ; aucune grandeur affichée hors des étiquettes et de la jauge.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée ; s'il t'en manque un, « À changer ailleurs ». Étiquettes en capitales : aucune unité à symbole nouvelle. **26 images lues au plus.** Journal : `docs/journal/CR03-<ton fichier>.md`. Planches dans `.cache/planches/CR03/<ton fichier>/`, jamais dans `renders/`.

## La boucle

La dernière phrase (« Tout s'est joué à la seconde… », `boucle`) n'est pas les premiers mots de l'accroche : c'est **l'image** qui boucle. `fin.js` coupe à `toloop` (145,96) sur la piste, à l'état `FIRST`, un peu plus loin que `POSE0`, et `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène la caméra sur `POSE0` (`rewind` = « joué » 146,36) ; l'en-tête revient seul à 16:43:13 / T−1 min 18 s. **La dernière image est la première** : tire les deux côte à côte.

---

## acte1.js — 01 L'HEURE : accroche → principe (0 → `toreservoir` 21,18)

Part de `POSE0` et `FIRST` (la piste, l'avion qui cabre en feu), sans coupe. **C'est la zone qui retient** : une coupe ou un geste toutes les 2 à 3 s. Rend la main à `toreservoir`.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| 0 → `choc` 1,36 | « Ton Concorde décolle en feu » | `POSE0`, `FIRST` (16:43:13) : **l'avion avance et cabre dès l'image 1** (`run` 10 300 → 10 700, `pitch` 2 → 6, `"none"` puis `sine`), le feu ondule et s'allonge (`fire` 0,85 → 1 sur « feu », `power2.out`, 0,3 s) ; `D.punch`. Candidate retenue ≈ 40 % |
| `accroche:16` 2,00 → `accroche$` 4,12 | « 16 h 43. Trop tard pour freiner. » | **coupe** sur « 16 » − 0,1 (raccord : le même avion, l'autre côté du feu) : `VIEW.charge` (ou la candidate b), il roule vers toi et quitte le sol (`alt` 0 → 6 sur « Trop » 3,29) ; punch « freiner » 3,88. ≈ 70 % |
| `promesse` 4,59 → 5,72 | « Il te reste 78 secondes. » | la caméra glisse sous l'aile gauche (`path`, deux clés) ; l'en-tête dit T−1 min 18 s. ≈ 60 % |
| `promesse:Et` 6,55 → 8,04 | « Et sous ton aile, le réservoir s'est ouvert… » | **`VIEW.aile`** atteint sur « aile » 6,96 : l'état revient un instant avant la rupture (`tear` 0,25, `leak` 0,2, `fire` 0,5 posés à la coupe ou au trajet) ; « réservoir » 7,40 : `culprit` 2, `fault` 1 (le contour du 5 rouge) ; « ouvert » 8,04 : `tear` 0,25 → 1, `leak` → 1 (le panneau part, le kérosène sort en nuage). ≈ 55 % |
| `interieur1` 8,76 → 9,96 | « …de l'intérieur. Comment ? » | punch « l'intérieur » ; `feutre` cercle sur `concorde.A.panel` (le trou) de 8,76 à `toprincipe`. « Comment ? » : le plan tient, le jet bat |
| `toprincipe` 10,67 → `vun` 12,02 | « D'abord, une règle : » | **coupe** (raccord : l'avion sous l'aile → l'avion vu d'en haut, petit, au début de sa course) : `VIEW.runway`, `STAGED.piste` + `lit` large (`fs` ≈ 3 000), état propre : `run` 2 500, `alt` 0, `pitch` 0, `burst chunk tear leak fire surge` 0, `n1…n4` 1, `stop` 1 (la barre verte devant lui), `v1` 0. La piste ≈ 90 % de la hauteur |
| `vun` 12,02 → 13,62 | « V1. Une vitesse. » | `v1` 0 → 1 sur « V1 » (la ligne se trace en travers), punch ; l'avion roule (`run` → 6 200 à « Après » 15,38, `"none"`), la barre s'allonge |
| `principe:Avant` 13,62 → 14,74 | « Avant elle, tu peux encore freiner. » | la barre verte finit avant le bout de la piste (léger travelling vers le bout) |
| `apres` 15,38 → 16,90 | « Après, c'est le point de non-retour : » | **le train avant passe la ligne SUR « Après »** : la barre dépasse le bout et vire au rouge d'elle-même ; punch « non-retour » 16,46 |
| `principe:décolles` 17,30 → 18,18 | « tu décolles, quoi qu'il arrive. » | `run` → 9 000 (`sine.in`), la caméra pivote pour garder l'avion et la barre rouge |
| `principe:Ce` 19,01 → `toreservoir` | « Ce jour-là, V1, c'est 150 nœuds. » | `chip-v1` (déjà posée, de « 150 » 20,34 à `toreservoir`) ; recul lent. `stop` 0 à la sortie |

**Couture de sortie** : piste, `run` ≈ 9 000, `stop` 1 → l'acte 2 coupe et repose tout.

## acte2.js — `reservoir` → t2 (`toreservoir` 21,18 → `tot3` 44,38)

Les réservoirs, le chiffre à retenir, puis le vrai début : le top, la lamelle, V1. 13 phrases.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `toreservoir` 21,18 → 22,39 | « Et ton kérosène ? » | **coupe** (raccord : l'avion vu d'en haut → l'avion vu d'en dessous) : `VIEW.dessous`, `AT.dessous` (l'avion en l'air, un moment d'explication, pas du récit), état propre, `gear` 1 (on doit voir les roues), `ok` 0. Lente orbite. ≈ 70 % |
| `reservoir:ailes` 22,66 → 23,42 | « Dans les ailes, tout près des roues. » | « ailes » : `ok` 0 → 1 (les réservoirs verts) ; « roues » 23,42 : `feutre` cercle sur `concorde.A.tank5` (le 5, au-dessus du train gauche) jusqu'à 25,0 |
| `reservoir:Six` 24,10 → 26,86 | « Six fois déjà, un pneu éclaté a abouti à un réservoir percé. » | `chip-six` (posée) ; poussée vers le 5 ; « percé » 26,86 : `culprit` 2, `fault` 1, `leak` 0 → 0,08 (un filet, un petit trou), punch |
| `reservoir:pire` 27,66 → 29,06 | « Le pire cas : 4 kilos par seconde. » | `gauge` 0 → 1 (la jauge, zone haute ; `chip-six` est partie à « pire » − 0,2) ; `debit` 0 → 4 arrivé sur `quatre1` 28,32 (`power2.out`), punch ; `mark` 0 → 1 sur « seconde » 29,06 |
| `retiens` 29,73 → `tot1` | « Retiens bien ce chiffre. » | la marque 4 reste ; poussée sur le filet ; `gauge` → 0 à `tot1` − 0,1 |
| `tot1` 30,86 → `top` 32,10 | « 16:42:31. » | **coupe** (raccord : l'avion d'en dessous → l'avion de face, au sol) : `VIEW.depart`, `AT.roll` mais `run` 0 (au seuil), `n1…n4` 0,3, état propre (`ok` 0, `culprit` 0). ≈ 55 % |
| `top` 32,10 → 34,26 | « Top : tu mets les gaz. 109 personnes à bord. » | « Top » : `n1…n4` 0,3 → 1 (les quatre dards ambre s'allument), punch ; `run` 0 → 600 (`power1.in`) ; `chip-bord` (posée, de « 109 » 33,46) |
| `t1:Sur` 34,90 → `lamelle1` 37,54 | « Sur la piste, un avion parti cinq minutes plus tôt a perdu… » | **la course le long de la piste** (`path`, trois clés, de l'avion jusqu'à la lamelle 1 780 m plus loin, au ras du bitume, `ty` ≥ 2) : arrive en `VIEW.lamelle` sur « lamelle » |
| `lamelle1` 37,54 → `tot2` | « …une lamelle de titane. 43 centimètres. » | « titane » 38,06 : `culprit` 1, `fault` 1, `feutre` cercle sur `piste.A.strip`, punch ; « 43 » 38,66 → « centimètres » 39,14 : `ruler` 0 → 1 (la règle se déroule, finit à sa longueur). ≈ 45 % (la lamelle et sa règle) |
| `tot2` 39,90 → `vdeux` 42,50 | « 16:43:03. Ton copilote annonce… » | **coupe** (raccord : la lamelle au sol → la ligne au sol) : `VIEW.v1`, `v1` 1, `stop` 0, l'avion arrive (`run` 5 500 → 6 200 arrivé SUR `vdeux`, `n` 1, `culprit` 0). ≈ 50 % (le train avant et la ligne) |
| `vdeux` 42,50 → `tot3` | « V1. Le point de non-retour. » | le train avant passe la ligne SUR « V1 », punch ; « non-retour » 43,62 : `stop` 1 avec `run` > 6 200 → la piste devant lui passe au rouge ; l'avion sort du cadre |

**Couture** : piste, `run` ≈ 6 700, `v1` 1, `stop` 1, `ruler` 1, `culprit` 0.

## acte2b.js — t3 → t5 (`tot3` 44,38 → `tot6` 71,89)

Le pneu, le feu, le moteur. 13 phrases. Trois moments forts sans coupe dessus.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot3` 44,38 → `t3:pneu` 46,26 | « 16:43:10. » | **coupe** (raccord : la ligne → la lamelle, même sol) : `VIEW.pneu` (az −118 : le pneu n° 2 est la roue avant INTÉRIEURE du bogie gauche), `run` `RUN.strip` − 260 → `RUN.strip` arrivé SUR « lamelle » 47,70 (`"none"`), `ruler` 0, `burst chunk tear leak fire` 0. Les roues tournent vite. ≈ 50 % |
| `t3:pneu` 46,26 → 47,70 | « Un pneu du train gauche roule sur la lamelle. » | « pneu » : `culprit` 3, `fault` 1 (le pneu n° 2 rouge) ; il atteint la lamelle sur « lamelle » |
| `eclate` 48,42 | « Il éclate. » | `burst` 0 → 1 en 0,15 s SUR « éclate », punch ; la lamelle (`culprit` reste 3) roule sous les autres roues |
| `t3:morceau` 49,22 → 51,26 | « Un morceau de plus de 4 kilos frappe le dessous de l'aile. » | `chunk` 0 → 1 de « morceau » à `frappe1` 50,58 (le choc SUR « frappe ») ; **la caméra suit le morceau vers le haut** (`path`) jusqu'à l'intrados ; « dessous de l'aile » : `culprit` 2, `fault` 1, `feutre` cercle sur `concorde.A.panel`. ≈ 50 % |
| `tot4` 51,80 → `flammes` 54,26 | « 16:43:13. Le contrôleur te prévient : » | **coupe : le plan de la première image, plus large** (`POSE0` avec `d` × 1,4, `AT.first`, `tear` 1, `leak` 1, `fire` 0, `burst` 1, `chunk` 1, `culprit` 0) |
| `flammes` 54,26 → 55,06 | « des flammes derrière toi. » | `fire` 0 → 1 SUR « flammes » (le feu prend et s'étire sur plusieurs dizaines de mètres en 0,6 s), punch ; l'avion cabre (`pitch` 2 → 8) |
| `t4:fuit` 56,02 → 57,58 | « Ton réservoir fuit à environ 60 kilos par seconde. » | `gauge` 0 → 1 (`mark` 1 : la marque 4 est restée), `debit` 0 → 4 → 60 arrivé SUR `soixante` 56,74 (l'aiguille passe la marque et file dans le rouge), punch |
| `t4:Souviens` 58,29 → 59,98 | « Souviens-toi : le pire cas, c'était quatre. » | la marque 4 pulse ; travelling le long de la traînée (la caméra recule vers l'arrière) |
| `t4:Là` 60,58 → `tot5` | « Là, c'est au moins dix fois plus. » | punch `dixfois` 61,43 ; le feu se gonfle ; `gauge` → 0 à `tot5` − 0,1 |
| `tot5` 62,30 → `t5:Ton` 66,66 | « 16:43:22. L'alarme feu sonne neuf secondes après l'appel du contrôleur. » | **coupe** (raccord : le feu → l'entrée d'air qu'il lèche) : `VIEW.moteurs`, `AT.air`, `cutaway` 0 → 1 (la nacelle gauche s'ouvre) sur « sonne » ; `chip-feu` (posée, d'`alarme1` 63,49 à « Ton » 66,66). ≈ 55 % |
| `t5:moteur` 66,78 → `coupe` 68,82 | « Ton moteur 2 avale des gaz brûlants : on le coupe. » | « moteur » : `culprit` 4, `fault` 1 ; « avale » 67,38 : `surge` 0,3 → 1 (des bouffées dans l'entrée d'air) ; « coupe » : `n2` 1 → 0 en 1,5 s (les aubes ralentissent jusqu'à l'arrêt), punch |
| `t5:Le` 69,38 → `tot6` | « Le 1, juste à côté, va s'étouffer à son tour. » | `feutre` lâché ; sur `etouffer` 70,78 : `n1` 1 → 0,35 par à-coups (`steps`) |

**Couture** : `AT.air`, `cutaway` 1, `n1` 0,35, `n2` 0, `culprit` 4.

## acte2c.js — t6 → issue (`tot6` 71,89 → `todefaut` 97,84)

Le vol bas, Le Bourget, la chute (hors champ), la piste vide. 15 phrases courtes.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot6` 71,89 → 74,42 | « 16:43:56. Tu as demandé à rentrer le train. » | **coupe** (raccord : le moteur → la jambe juste à côté) : `VIEW.train`, `AT.low`, `cutaway` 0, `n1` 0,2, `n2` 0, `fire` 1, `gear` 1 ; « rentrer » 73,78 : `gear` 1 → 0,94 → 1 (l'essai). ≈ 45 % |
| `rentrepas` 74,71 → 75,46 | « Il ne rentre pas. » | `culprit` 5, `fault` 1 (les jambes rouges), `feutre` cercle sur `concorde.A.gearLeft` ; punch « pas » |
| `t6:Ton` 75,81 → `tot7` | « Ton Concorde reste à 60 mètres du sol, et ne monte plus. » | recul en `path` jusqu'à `VIEW.vol` : le profil au-dessus des champs, son ombre au sol, `alt` 300 plat ; `chip-alt` (posée). ≈ 35 % |
| `tot7` 78,94 → 81,70 | « 16:44:00. Une autre alarme : trop près du sol. » | **coupe** (raccord : l'avion de profil → son ombre vue d'en haut) : `VIEW.carte`, `AT.bourget` ; `traj` 0 → 1 de « alarme » 80,50 à 82,5 (la trajectoire se trace depuis Roissy) ; l'ombre rase les toits. La carte ≈ 100 % |
| `t7:Ton` 82,02 → `tot8` | « Ton copilote répète : Le Bourget, Le Bourget. » | `bourget` 0 → 1 SUR `bourget1` 83,30, une seconde pulsation sur `t7:Bourget#2` 83,99, punch ; poussée lente vers Le Bourget |
| `tot8` 84,62 → 87,94 | « 16:44:29. La poussée s'effondre. Une partie des commandes est détruite. » | **coupe** : `VIEW.chute`, `AT.fall` ; `effondre` 86,29 : `n3`, `n4`, `n1` → 0 l'un après l'autre (0,2 s d'écart), punch ; « commandes » 87,58 : `bank` 10 → 25. ≈ 45 % |
| `t8:penche` 89,26 → `toissue` | « Ton Concorde penche à gauche… et tombe. » | `bank` 25 → 100 en 1,2 s, l'aile gauche plonge ; `tombe` 90,50 : `alt` chute, `pitch` → −20, l'avion sort du cadre PAR LE BAS ; **la caméra ne le suit pas** (ciel vide, 0,8 s) ; punch « tombe » |
| `toissue` 91,37 → 94,00 | « 16:44:31. Ton Concorde s'écrase sur un hôtel. » | **coupe : la piste vide** (`VIEW.vide`, `alt` −100, `soot` 0 → 1 en 2 s, `culprit` 0) — la lamelle au premier plan, la suie qui s'éloigne ; T−0 s. **Aucune image du crash.** |
| `issue:113` 94,72 → `todefaut` | « 113 morts. Deux minutes pile après le top. » | `chip-bilan` (posée) ; poussée lente vers la lamelle ; « top » 97,12 : `culprit` 1, `fault` 1 (la lamelle rouge, un instant) |

**Couture** : piste vide, `soot` 1, `culprit` 1.

## acte3.js — 02 LE DÉFAUT : `defaut` → `preuve` (`todefaut` 97,84 → `todepuis` 121,91)

**LE CLIMAX, en grand et au ralenti** : le réservoir 5 en coupe ; le choc entre par un point et le réservoir cède AILLEURS, de l'intérieur. Puis la preuve sur la piste. 9 phrases, deux lieux.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `todefaut` 97,84 → 99,32 | « Alors, ce réservoir ? » | **coupe** (raccord : la lamelle rouge → la pièce qu'elle n'a pas touchée) : `VIEW.bay`, `STAGED.reservoir`, tout à 0. Le kérosène immobile. ≈ 75 % |
| `defaut:morceau` 99,42 → 101,2 | « Le morceau de pneu frappe le dessous de l'aile. » | `hit` 0 → 1 arrivé SUR `frappe2` 100,10, `dent` 0 → 0,4 au contact ; punch ; glissement vers `VIEW.impact` |
| `defaut:Derrière` 101,45 → 103,9 | « Derrière la paroi, le réservoir est plein de kérosène. » | la caméra passe la peau et remonte dans le liquide (`path`, deux clés) ; « plein » 103,06 : le kérosène s'éclaire |
| `defaut:liquide` 104,50 → 106,5 | « Et un liquide, ça ne se comprime presque pas : » | retour au plan maître (`VIEW.bay`, sans coupe) ; rien ne bouge — c'est le propos |
| `enfonce` 107,02 → 107,6 | « la paroi s'enfonce, » | `dent` 0,4 → 1 SUR « s'enfonce », punch |
| `trigger` 108,25 → `cede` 109,74 | « le kérosène est repoussé… » | **`wave` 0 → 1 de `trigger` à `cede`** (le front rouge traverse le liquide, `sine.inOut`) ; la caméra glisse le long de z avec lui (`path`, une clé) |
| `cede` 109,74 → 111,2 | « …et la paroi cède ailleurs, de l'intérieur. » | SUR « cède » : `culprit` 2, `fault` 1, `bulge` 0 → 1 en 0,25 s, punch ; « ailleurs » 110,06 : `tear` 0 → 1 et `gush` 0 → 1 (le panneau part vers le bas en tournant, le jet) ; `feutre` cercle sur `reservoir.A.panel` à « l'intérieur » 110,70. ≈ 75 % |
| `topreuve` 111,62 → `panneau` 113,54 | « L'indice, sur la piste : » | **coupe** (raccord : le panneau qui tombe → le même panneau posé sur le bitume) : `VIEW.preuve`, `STAGED.piste` + `lit` sur `FOUND.panel` (`fs` ≈ 40), `found` 1, `soot` 0, `alt` −100, `culprit` 0 |
| `panneau` 113,54 → 117,34 | « un panneau de l'aile de 30 centimètres, bombé vers l'extérieur, sans trace d'impact. » | orbite lente autour du panneau ; `bombe` 115,30 : la caméra descend au ras pour montrer le bombé ; « trace » 116,70 : gros plan sur la face lisse (`CLOSE`). ≈ 50 % |
| `preuve:titane` 117,90 → 119,58 | « Le titane n'a jamais touché le réservoir. » | glissement vers la lamelle et le morceau de pneu ; `culprit` 1, `fault` 1 ; `feutre` **flèche** de la lamelle vers le morceau de pneu (« elle n'a touché que le pneu »), aucune vers le panneau ; punch `verdict` « jamais » |
| `preuve:Et` 119,90 → `todepuis` | « Et ça, personne ne l'avait prévu. » | recul en hauteur : le panneau, le morceau, la lamelle, la longue piste ; `fault` → 0 |

**Couture** : piste, `found` 1, `culprit` 0.

## fin.js — 03 DEPUIS → la fin (`todepuis` 121,91 → 148,03)

Le correctif en vert, la question, l'annonce, la boucle. 6 phrases.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `todepuis` 121,91 → `kevlar` 124,26 | « En 2001, six de ses réservoirs sont doublés de Kevlar, » | **coupe** (raccord : le panneau sur la piste → le réservoir ouvert) : `VIEW.bay`, `BENCHED` (le réservoir tel qu'il a cédé, rouge) ; `depuis` 0 → 1 en 1 s (la lumière blanchit, grille et halo verts, le panneau rouge → vert) ; puis à l'image l'état revient intact (`tear bulge dent hit wave` → 0) et SUR « Kevlar » `kevlar` 0 → 1 (la doublure se pose), punch ; `chip-kevlar` (posée). ≈ 75 % |
| `depuis:pneus` 125,06 → 125,66 | « ses pneus changent. » | **le même choc** : `hit` 0 → 1, `dent` → 1, `wave` 0 → 1, `bulge` 0,2 — **la paroi tient** (pas de `tear`) |
| `depuis:Et` 126,02 → `tocta` | « Et à Roissy, les inspections de piste passent à 3 par jour. » | **coupe** : `VIEW.inspection`, `STAGED.piste` (lit large), `alt` −100, `found` 0, `soot` 0, `ruler` 0, `culprit` 0 ; `inspect` 0 → 1 de `inspections` 126,94 à 128,9 ; `chip-inspect` : `#tick-1`, `#tick-2` gris, `#tick-3` s'allume en vert SUR « 3 » 128,30, punch |
| `tocta` 129,22 → 133,66 | « Pour le BEA, dès l'avion touché, aucune manœuvre de l'équipage n'aurait pu empêcher l'accident. » | **coupe** : l'avion sur la piste juste après la ligne V1 (`VIEW.v1` élargie, `v1` 1, `run` 6 600, `fire` 1, `tear` 1, `leak` 1, `burst` 1) — vert de `depuis` toujours là ; punch « aucune » 131,30 |
| `comment:Toi` 134,13 → `toabo` | « Toi, en commentaire : le Concorde qui revole en 2001… tu remontes dedans, ou pas ? » | « le Concorde qui revole » 135,56 : l'avion propre (feu, fuite, pneu à 0 ; `ok` 1 : réservoirs verts) roule au soleil blanc de `depuis` ; `duelCall` (posé : « J'y remonte » sur `remontes`, « Jamais » sur `duelB`, `toneA` et `toneB` **null**) |
| `toabo` 139,01 → `toloop` | « Abonne-toi : prochain compte à rebours… un train garé démarre tout seul. » | `nextFile` (posé, le fait sur `locomotive` 142,92) ; dessous, l'avion s'éloigne en bout de piste, calme. (Le `voir` demande une locomotive : aucun décor ne la tient ; on ne la fabrique pas pour cinq secondes.) |
| `toloop` 145,96 → fin | « Tout s'est joué à la seconde… » | **coupe** sur la piste, état `FIRST` (`depuis` 0), un peu plus loin que `POSE0` ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` (posé) |

---

## La première image — quatre candidates

**« Ton Concorde décolle en feu. »** L'image 0 montre le feu déjà en cours, sans texte, à 270 px, et bouge dès l'image 1 **par son sujet** (l'avion avance et cabre, la traînée ondule). Tirées sur le vrai décor (après `concorde.js` et `piste.js`), choisies AVANT les actes ; la gagnante devient `POSE0`. Fichier : `.cache/planches/CR03/premiere-image/essais.json` (les quatre à 0,02 s puis à 0,6 s : `npm run look -- CR03 --file .cache/planches/CR03/premiere-image/essais.json --out .cache/planches/CR03/premiere-image/planche.jpg --cols 4`). État commun : `FIRST` (`run` 10 300, `pitch` 2, `fire` 0,85, `tear` 1, `leak` 1, `burst` 1). Notes sur bouchons (`.cache/planches/CR03/architecte/candidates-bouchon.jpg`), sur les six points (événement · perspective basse · menace derrière · forme reconnue sur 40 % · système là · bouge par le sujet) :

- **(a) Dans l'axe, au ras du bitume, la lamelle au premier plan** (`POSE0` provisoire, le `voir` de l'accroche) — ✓ · ✓ · ½ (le feu vient vers toi, devant l'avion plus que derrière) · ½ (l'avion vu de derrière : delta, dérive, quatre dards — ≈ 40 %, mais de dos) · ✓ (la lamelle, le système qui a lâché, au premier plan) · ✓ — **4,5 / 6**.
  `{ "at": 0.02, "pose": { "tx": -10269.2, "ty": 22.9, "tz": 0, "d": 1370, "az": 89.2, "el": -0.8, "fov": 24, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 } }`
- **(b) Devant lui, bas, sur sa gauche : il fonce sur toi** — ✓ · ✓ · ✓ (la traînée derrière lui) · ✓ (le nez basculé, l'ogive, ≈ 80 %) · ½ (le dessous de l'aile gauche, pas le réservoir) · ✓ — **5,5 / 6, recommandée**.
  `{ "at": 0.02, "pose": { "tx": -10329.2, "ty": 23, "tz": 0, "d": 950, "az": -38, "el": -1.1, "fov": 30, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 } }`
- **(c) Son profil gauche, au ras du sol, toute la traînée** — ✓ · ✓ · ✓ · ✓ (la silhouette la plus connue, ≈ 100 % : recule si elle déborde) · ½ · ✓ — 5 / 6 ; la plus lisible, la plus « photo connue » (à ne pas recopier : le cadrage reste le nôtre, au sol).
  `{ "at": 0.02, "pose": { "tx": -10259.2, "ty": 23.6, "tz": 0, "d": 1500, "az": 6, "el": -0.7, "fov": 26, "shift": 40, "side": 0, "roll": 0, "drift": 0, "dof": 0 } }`
- **(d) Sous l'aile gauche, de près : le jet, le feu, le train** — ✓✓ · ✓ · ✓ · ✗ (un dessous d'aile ne se reconnaît pas en un tiers de seconde) · ✓ (le réservoir 5, le trou) · ✓ — 4 / 6 ; plutôt le plan de `promesse`.
  `{ "at": 0.02, "pose": { "tx": -10315.6, "ty": 12.6, "tz": 18, "d": 90, "az": 28, "el": -6, "fov": 34, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "fx": -10315.4, "fy": 18.5, "fz": 16, "fs": 60 } }`

Si (b) l'emporte, l'acte 1 la garde jusqu'à « 16 » (2,00) puis coupe sur (c) ou (a) ; t4 « retour au plan de la première image » reprend (b) élargie, et la boucle revient sur (b). Si c'est (a), le plan de « 16 h 43 » est (b).

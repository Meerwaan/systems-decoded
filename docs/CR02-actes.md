# CR02 · Deepwater Horizon — le plan de mise en scène

**Deuxième « Compte à rebours ».** Pas un dossier : ni « Alors… on l'ouvre », ni éclaté, ni établi, ni like. La mécanique, c'est le temps ; le cœur du film, c'est **le défaut de la sécurité** : le BOP, la dernière barrière, s'est fermé sur un tube plié et décentré, l'a percé sans le couper — et son dernier recours n'a marché que par hasard. Recette : `docs/recette-compte-a-rebours.md` ; la DA « noir chaud » : `docs/reconstitution.md`. Exigence n° 1 de Merwan : **« que ce qui est dit soit à l'écran, expliqué aussi »**.

**La voix est enregistrée** (une prise, `eleven_v4_turbo`, **154,4 s**, 22 beats) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues`, ≈ 100, vérifiés sur la table ; image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur** ; les secondes ci-dessous ne servent qu'à te repérer (`npm run script -- CR02`). Pièges : `depuis:deux` tombe sur « deux mille seize » → le repère `deux` vise « jeux » ; `neufb` est « gaz » (t2) ; `avant58` = « Avant 21 h 58 » (le saut d'horloge de t9 est là, pas en tête de beat) ; `jours`, `mois` : les sauts de l'issue.

Quatre fichiers, un agent chacun : `acte1.js`, `acte2.js`, `acte2b.js`, `acte3.js` (aujourd'hui des squelettes : coupes d'entrée et étiquettes posées, à réécrire en entier). Chacun n'écrit que `st` / `shot` / `path` / `cut` / `chip` / `tl` contre `world.js` (l'état `FIRST`, les poses `VIEW`, `STAGED` par maquette, `BENCHED` pour le BOP de `depuis`, `lit(name, local, fs)` pour la lumière). Forme : `episodes/CR01-tchernobyl/src/acte*.js` ; outillage `kit/lib/direct.js` ; blocs `kit/lib/blocks.js` (`duelCall`, `nextFile`) ; `kit/lib/reconstitution.js` (`feutre`). Les poses qui cadrent vraiment sont dans les journaux des décors (`docs/journal/CR02-plateforme.md`, `-puits.md`, `-bop.md`) : pars d'elles. Faits : `docs/faits/CR02-deepwater.md` § 10 (« À ne pas dire »).

## Les trois maquettes et l'état

`S.set` choisit la maquette montrée (`SET.PLATEFORME` 0 · `PUITS` 1 · `BOP` 2) ; une coupe change de maquette avec `cut(at, SET.X, VIEW.y, { ...STAGED.x, … })`. **`culprit` désigne la pièce en défaut, `fault` l'allume en rouge** (`plan.js` → `CULPRIT` : puits 1 le cadran LIGNE · 2 le bouton ; bop 1 l'annulaire · 2 le tube · 3 la batterie · 4 l'électrovanne · 5 la pile) : **une pièce rouge à la fois**, `fault` 0 tant que la phrase ne la désigne pas. **Vert = ce qui marche** : `ok` allume la boue qui tient (puits) et les joints qui ferment (bop, proportionnel à leur fermeture). `depuis` 0 → 1 : la lumière blanchit, grille et halo passent au vert, le tube coupable guérit — à partir du beat `depuis`, et seulement là. Mêmes nombres, même lecture d'une maquette à l'autre : `annular`, `vbr`, `bsr` dans le BOP et dans le BOP simple du puits. Tables complètes : `docs/CR02-decors.md`.

## L'en-tête (déjà monté dans `main.js` : n'y touche pas)

L'heure réelle, en grand, **saute 0,17 s avant chaque étape** (dans le souffle, avec son `clack`) : 21:40 → 19:55 (t1) → 21:08 → 21:31 → 21:40 (t4) → 21:43 → 21:47 → 21:49 (t7) → 21:56 (t8) → 21:58 (sur « Avant », `avant58`) → 22 AVR. (`jours`) → 15 JUIL. (`mois`) → 2016 (`todepuis`). Dessous, **le temps qui reste jusqu'à l'explosion** (T−0 = 21:49) : T−9 min (« Il te reste neuf minutes »), T−1 h 54 min, T−41 min, T−18 min, T−9 min, T−6 min, T−2 min, T−0 ; il s'efface à t8. Les actes de l'en-tête : 01 L'HEURE (0) · 02 LE DÉFAUT (`todefaut`) · 03 DEPUIS (`todepuis`), posés dans `acte3.js`. **Tu n'écris jamais l'en-tête.**

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration, sur le mot.** Un chiffre que l'image ne montre pas entre en étiquette (`index.html`, une à la fois, place fixe en zone haute : `chip(id, null, 96, 470, de, à)`, déjà posées dans les squelettes) : `chip-10` · `chip-tube` · `chip-ligne` · `chip-reussi` (vert, vire à l'alarme sur « Il ne l'était pas ») · `chip-22` · `chip-bilan` · `chip-fuite` · `chip-regle`. Pas de pièce du dossier dans ce film.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout ce que la maquette lit ; il rend la main à l'instant où le suivant coupe. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe. Coupes posées sur les repères `to…` (0,12–0,14 s avant la phrase). **Chaque coupe est un raccord** (forme, objet, mouvement), écrit dans les tables.
- **0 → 25 s : la grille de rétention.** Le sujet bouge seul dès l'image 1 (le jet pulse, la boue retombe) ; **un geste ou une coupe toutes les 2 à 3 s**, aucune plage lente de 2 s ; un son dans le souffle après chaque mot-clé (déjà posés). Puis un changement toutes les 5 à 8 s au plus. **Le plan-séquence** (`D.path`, `docs/recette-actes.md`) pour les traversées : la plongée de `promesse`, la montée de la poche (t6), la descente du signal (t8) — chaque clé change d'angle de 6 à 15°.
- **Le moment fort se voit en entier, sans coupe dessus** : l'explosion (« explose », 81,72) arrive dans un plan déjà posé à `tot7` ; les lames qui percent le tube (105,4) dans le plan maître.
- **Le mécanisme suit la voix** : le gaz monte, l'aiguille passe, la lame se ferme SUR les mots. Couleurs franches : `fault` 0 ou 1, jamais à mi-chemin plus d'une demi-seconde.
- **Les fluides se lisent par leur mouvement** : un front qui avance, des bulles qui filent ; on ne fait jamais « monter » un fluide hors du cadre sans que la caméra le suive.
- **Les mots qui frappent** (`D.punch(t.mot, 0.06)`, un par phrase au plus, jamais sur une coupe, jamais deux à moins d'une seconde, jamais à l'image 0) : `choc` « crache » 2,28 · `sceller` 8,68 · `remonte` 17,48 · `bop` 20,84 · `dix1` 27,88 · `zero` 42,39 · `deja1` 48,84 · `dix2` 60,76 · `deborde` 63,88 · « pas » (t5) 72,04 · `tient` 76,60 · `explose` 81,72 · `passe` 87,66 · `plie` 99,66 · `couper` 106,18 · `hasard` 110,18 · `centre2` 132,16. `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **Le cercle rouge** (`feutre(D, { id, anchor, … })`, ancre = `world.puits.A.dialLine`, `world.bop.A.annular`, `A.pipeBend`…) : un à la fois, sur la pièce que la voix nomme — le cadran « Zéro », le joint « ne scelle pas », le tube « plié ».
- **Le son est posé** (`episode.json` → `sfx`, dans les souffles) : `clack` à chaque saut d'horloge ; `hit` sur les retournements ; `click` après « minute » (piège) ; `impact` sur la VBR ; `boom` après « explose » ; `hush` sur « Tu sais pourquoi ? » et sur le bilan ; `sting` à `depuis` ; `rewind` dans le dernier souffle. Si tu en veux un de plus, « À changer ailleurs ».
- **Zones** : en-tête 220–412 (ce qui monte derrière se fond dans le noir) · zone haute 436–790 (une étiquette à la fois) · sujet 440–1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête.
- **La part du cadre** que tient le sujet est donnée pour chaque plan (en largeur) ; sous 30 %, le plan est un plan d'ensemble et ne dure pas plus de 3 s.
- **`dof`** : les seules poses qui étalent `CLOSE` (gros plans) ; tout le reste `dof: 0`.
- **Interdits** : personne à l'image, aucune main sur le bouton ; aucun nom ; jamais « les lames ont coupé le tube » (pincé, percé) ; jamais « le BOP n'a pas fonctionné » ; aucune couleur jaune / bleue pour les boîtiers ; aucune grandeur affichée hors des étiquettes ; aucune scène du film de 2016.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée ; s'il t'en manque un, « À changer ailleurs ». Les étiquettes sont en capitales : aucune unité à symbole nouvelle. **26 images lues au plus.** Journal : `docs/journal/CR02-<ton fichier>.md`. Planches dans `.cache/planches/CR02/<ton fichier>/`, jamais dans `renders/`.

## La boucle

La dernière phrase (« Comme ce soir-là, à… », `boucle`) retombe sur « 21 h 40 » : `acte3.js` coupe à `toloop` sur la plateforme, à l'état `FIRST`, un peu plus loin que `POSE0`, et `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène la caméra sur `POSE0`. **La dernière image est la première** : tire les deux côte à côte.

---

## acte1.js — 01 L'HEURE : accroche → piege (0 → `tot1` 30,47)

Part de `POSE0` et `FIRST` (la plateforme), sans coupe. **C'est la zone qui retient (0 → 25 s)** : une coupe ou un geste toutes les 2 à 3 s. Rend la main à `tot1`.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| 0 → `deepwater` 3,68 | « 21 h 40. Ton derrick crache de la boue. » | `POSE0`, `FIRST` : contre-plongée depuis le plancher, **le jet monte déjà** (`jet` 0,6 → 0,72 dès l'image 1, `"none"`), la boue retombe ; la caméra monte lentement le long du treillis. Sur « crache » (`choc` 2,28) : `jet` → 0,85 d'un coup (`power2.out`, 0,25 s), `D.punch`. Le derrick ≈ 50 %, le jet ≈ 10 % |
| `deepwater` → `minutes` 5,72 | « C'est Deepwater Horizon. Il te reste neuf minutes. » | **coupe** (raccord : le jet qui monte → la tour qui le crache, de loin) : `VIEW.rig`, la plateforme de nuit entière, le jet au derrick (≈ 55 %) ; légère orbite ; « neuf minutes » : l'en-tête le dit (T−9 min) |
| `minutes` → `fermer` 7,72 | « Au fond, la sécurité va se fermer… » | **la plongée** (`D.path`, sans coupe) : la caméra descend sous la surface au bord d'aquarium (`VIEW.under`) et suit le riser jusqu'au fond (`VIEW.seabed`) ; le BOP simplifié grandit (≈ 25 %) sur « Au fond » (6,56) |
| `fermer` → `toprincipe` 10,23 | « …sans sceller le puits. Pourquoi ? » | **coupe** sur « fermer » − 0,12 (raccord : le BOP simplifié → le BOP, même angle) : `VIEW.bop`, `STAGED.bop`, `flow` 1, `pass` 1 ; les mâchoires et les lames se ferment au ralenti (`vbr` 0 → 0,8, `bsr` 0 → 0,6) et **le rouge passe quand même** ; `D.punch` sur « sceller » ; « Pourquoi ? » : le plan tient, le rouge monte (≈ 45 %) |
| `toprincipe` → `tube1` 13,08 | « D'abord, comment ça marche. » | **coupe** (raccord : le flux rouge vertical → la colonne verticale) sur le puits en coupe (`VIEW.middle`, `STAGED.puits`, `sea` 0, `gas` 0, `ok` 0, `balance` −1) : la colonne pleine de boue, ≈ 35 % |
| `tube1` → `pese` 15,24 | « Un puits, c'est un long tube plein de boue lourde. » | sur « long tube » un travelling rapide le long de la colonne (`path`, deux clés) ; sur « boue lourde » (13,84) la boue s'allume en vert (`ok` 0 → 1, 0,4 s) |
| `pese` → `remonte` 17,48 | « Tant que son poids bat la pression du gaz d'en bas… » | **le fond** (`VIEW.bottom`, ≈ 40 %) : sur « poids » la poussée de la boue (balance −1), sur « gaz d'en bas » (16,28) la poussée rouge qui pousse du réservoir (`gas` 0 → 0,02 : le rouge bute contre la boue) |
| `remonte` → `tobop` 18,23 | « …rien ne +remonte+. » | le gaz bloqué, la boue verte tient ; `D.punch` sur « remonte » |
| `tobop` → `bop` 20,84 | « Sinon, reste une dernière barrière, au fond : » | **coupe** (raccord : le BOP simple du puits → le BOP plein) : `VIEW.bop`, `STAGED.bop`, `ok` 1, `flow` 0, tout ouvert ; orbite lente de trois quarts (≈ 45 %) |
| `bop` → `machoires1` 21,88 | « le BOP. » | poussée vers l'empilement ; `D.punch` sur « BOP » |
| `machoires1` → `lames1` 23,72 | « Des mâchoires qui serrent le tube… » | `VIEW.vbr` (trajet, pas coupe) : l'annulaire se gonfle sur « mâchoires » (`annular` 0 → 1, vert), la VBR se ferme sur « serrent » (`vbr` 0 → 1, vert) (≈ 40 %) |
| `lames1` → `topiege` 25,59 | « …et des lames qui le coupent pour fermer le puits. » | `VIEW.bsr` : sur « coupent » (24,33) les lames se ferment (`bsr` 0 → 1) et tranchent net (`shear` 0 → 1), vert : le puits fermé (≈ 35 %) |
| `topiege` → `dix1` 27,88 | « Mais d'habitude, on referme des venues de l'ordre de dix barils par minute. » | **coupe** (raccord : les lames qui se ferment → l'aiguille qui monte) sur le compteur (`VIEW.flowDial`, `STAGED.puits` + `lit` sur le cadran, `ok` 0, `debit` 0, `mark` 0) : l'aiguille monte de « venues » à « dix » (`debit` 0 → 9, zone verte) ; `chip-10` (≈ 40 %) |
| `retiens` 29,24 → `tot1` | « Retiens bien ce chiffre. » | la marque 10 s'allume et reste (`mark` 0 → 1) ; recul lent qui montre le compteur au pied de la colonne (le `click` est posé avant « Retiens ») |

**Couture de sortie** : puits, `debit` 9, `mark` 1, `sea` 0 — l'acte 2 coupe et repose tout.

## acte2.js — t1 → t3 : le test, les deux cadrans, le gaz qui entre (`tot1` 30,47 → `tot4` 61,28)

Une seule maquette (le puits) : c'est la force de l'acte — **on voyage dans la colonne** (travellings `path`, pas de plans fixes), de la surface aux cadrans, des cadrans au fond. Part d'une coupe complète à `tot1`.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot1` → `remplace` 33,92 | « Plus tôt, 19 h 55. Pour mettre le puits en veille… » | **coupe** (raccord : le compteur au pied de la colonne → le haut de la même colonne ; l'horloge recule, `clack`) : `VIEW.top`, `STAGED.puits`, `sea` 0, `ok` 0, `gas` 0, `debit` 0 : le haut de la colonne sous le plancher (≈ 35 %) |
| `remplace` → `test1` 36,68 | « …on remplace sa boue lourde par de l'eau de mer. » | `sea` 0 → 0,45 de « remplace » à « mer » (`sine.inOut`) : l'eau claire descend par le haut, l'interface nette ; la caméra descend avec elle (`path`) |
| `test1` → `tolecture` 39,09 | « Avant, un test : deux cadrans qui doivent dire pareil. » | trajet vers le pupitre (`VIEW.dials`) : les deux cadrans au repos (`dialTube` = `dialLine` = 0), reliés à leurs tubes ; sur « pareil » les deux aiguilles frémissent ensemble (≈ 30 % chacun) |
| `tolecture` → `mille` 40,04 | « Le premier affiche… » | **coupe** sur les deux cadrans, plus près (`VIEW.dials`, `culprit` 1, `fault` 0) |
| `mille` → `zero` 42,39 | « …1 400 psi. Et l'autre ? » | `dialTube` 0 → 1 400 (`power2.out`, 0,6 s, dès « mille ») ; `chip-tube` ; « Et l'autre ? » : glissement vers le cadran LIGNE (`VIEW.dialLine`) |
| `zero` → `reussi` 44,20 | « Zéro. » | l'aiguille reste à 0 ; sur « Zéro » le cadran passe au rouge (`fault` 0 → 1, 0,2 s), **cercle rouge** (`feutre`, ancre `world.puits.A.dialLine`) ; `D.punch` ; `chip-ligne` (≈ 45 %) |
| `reussi` → `tot2` 45,92 | « Le test est pourtant jugé réussi. Il ne l'était pas. » | recul sur les deux cadrans (1 400 / 0) ; `chip-reussi` vert sur « réussi », **passe à l'alarme sur « pas »** (45,56 : `tl.to("#chip-reussi", { color: "var(--alarme)" })`) |
| `tot2` → `deja1` 48,84 | « 21 h 08. Sans sa boue lourde, le puits coule déjà : » | **coupe** (raccord : le cadran rouge → le fond rouge du puits) sur le fond (`VIEW.bottom`, `culprit` 0, `fault` 0, `sea` 0,85, `balance` −0,2) : sur « coule » la balance bascule (`balance` → +0,6) ; `D.punch` sur « déjà » (≈ 40 %) |
| `deja1` → `personne` 51,08 | « le gaz entre par le fond. » | `gas` 0 → 0,12 de « gaz » à « fond » : le rouge entre et monte lentement ; la caméra monte avec le front |
| `personne` → `tot3` | « Personne ne réagit. » | le trajet continue vers le haut : la colonne calme au-dessus, le rouge qui monte en dessous (≈ 30 %) |
| `tot3` → `entre` 56,64 | « 21 h 31. Pression anormale : on coupe les pompes. » | **coupe** (raccord : la même colonne, plus haut, plus tard) sur `VIEW.middle` (`gas` 0,35, `balance` 1) : le front rouge monte, plus vite, les bulles filent ; pas d'image propre aux pompes (aucun nombre) — la caméra descend vers le compteur |
| `entre` → `souviens` 58,80 | « En bas, ça entre à environ vingt-deux barils par minute. » | le compteur (`VIEW.flowDial`) : `debit` 9 → 22 de « entre » à « vingt-deux », **l'aiguille passe la marque 10 et entre dans le rouge** ; `chip-22` (≈ 40 %) |
| `souviens` → `tot4` | « Souviens-toi : d'habitude, de l'ordre de dix. » | la marque 10 éclaire (`mark` 1, une pulsation) ; `D.punch` sur « dix » ; recul : le compteur et le rouge qui file dans la colonne (`gas` → 0,6) |

**Couture de sortie** : puits, `gas` 0,6, `debit` 22.

## acte2b.js — t4 → t9 : la nuit (`tot4` 61,28 → `todefaut` 96,22)

Trois maquettes, une coupe par étape ; l'horloge est la relance. Part d'une coupe complète à `tot4`.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `tot4` → `deborde` 63,88 | « 21 h 40. On y est. » | **coupe** (raccord : le rouge qui monte la colonne → il sort du trou) sur **la première image, plus large** (`VIEW.floorLow`, `d` × 1,4, `STAGED.plateforme`, `jet` 0,6, `spill` 0,2) : on la reconnaît (≈ 45 %) |
| `deborde` → `jaillit` 65,32 | « La boue déborde sur le plancher… » | `spill` 0,2 → 1 de « déborde » à « plancher » ; recul qui montre le plancher noyé ; `D.punch` sur « déborde » |
| `jaillit` → `tot5` | « …et jaillit jusqu'en haut du derrick. » | `jet` 0,6 → 1 sur « jaillit » (`power2.out`, 0,5 s) ; la caméra lève les yeux vers la couronne |
| `tot5` → `joint` 70,52 | « 21 h 43. Au fond, on ferme le BOP : » | **coupe** (raccord : l'axe du jet → l'axe du riser, vers le bas) : `VIEW.bop` puis trajet vers `VIEW.annular` ; `flow` 1, `pass` 1, `culprit` 1, `fault` 0 (≈ 40 %) |
| `joint` → `scelle` 71,72 | « son joint en caoutchouc… » | l'annulaire se gonfle autour du tube (`annular` 0 → 1) |
| `scelle` → `tot6` | « …ne scelle pas. » | le rouge passe toujours autour (`pass` 1) ; sur « scelle » le joint passe au rouge (`fault` 1), **cercle rouge** (ancre `world.bop.A.annular`) ; `D.punch` sur « pas » |
| `tot6` → `tient` 76,60 | « 21 h 47. Une mâchoire se ferme sur le tube. Cette fois, ça tient. » | **coupe** sur la VBR (`VIEW.vbr`, `annular` 1, `culprit` 0, `fault` 0, `ok` 1, `inside` 1) : `vbr` 0 → 1 de « mâchoire » à « ferme », verte ; sur « tient » plus rien ne passe au-dessus (`pass` 1 → 0) ; `D.punch` (≈ 40 %) |
| `sauf` 77,14 → `toi1` 79,56 | « Sauf que le gaz est déjà au-dessus… » | **coupe** sur « Sauf » − 0,1 (raccord : au-dessus de la VBR → au-dessus du BOP simple) : `VIEW.bopSmall`, `STAGED.puits`, `vbr` 1, `annular` 1, `sea` 0,85, `gasBase` 0,42, `gas` 0,5 : **une poche rouge au-dessus du BOP** qui file vers le haut (`gas` → 0,9, `gasBase` → 0,6) |
| `toi1` → `tot7` | « …et il monte vers toi. » | la caméra suit la poche le long du riser (`path`) ; le plancher entre en haut du cadre sur « toi » |
| `tot7` → `explose` 81,72 | « 21 h 49. » | **coupe** (raccord : la poche qui arrive au plancher → la plateforme vue de la mer) : `VIEW.rig`, `jet` 1, `spill` 1 ; la caméra approche lentement (≈ 55 %) |
| `explose` → `tot8` | « Tout explose. » | **sans coupe** : `blast` 0 → 1 SUR « explose » (0,3 s), `fire` 0 → 1, `lamps` → 0 ; `D.punch` ; le `boom` est posé après le mot |
| `tot8` → `bouton` 84,98 | « 21 h 56. On presse le bouton d'urgence, » | **coupe** (raccord : le flash → la lumière du bouton) sur le panneau (`VIEW.eds`, `STAGED.puits`, `sea` 0,85, `gas` 1, `gasBase` 0,4, `vbr` 1, `annular` 1, `eds` 0, `signal` 0, `link` 1) : le bouton s'enfonce seul sur « presse » (`eds` 0 → 1) — aucune main (≈ 30 %) |
| `celui` 85,86 → `rien` 87,18 | « celui qui ferme les lames. » | `signal` 0 → 1 de « celui » à « lames » : l'impulsion descend le câble, la caméra la suit (`path` de `VIEW.eds` vers `VIEW.bopSmall`) |
| `rien` → `tot9` | « Rien ne se passe. » | l'impulsion arrive au BOP simple et meurt ; les bandes ne bougent pas. **La coupe vers le BOP peut se poser sur « Rien »** (`VIEW.bsr`, lames ouvertes, immobiles) — alors t9 continue dans le même plan sans recouper à `tot9` ; `D.punch` sur « passe » |
| `tot9` → `surface` 92,22 | « Reste un dernier recours : un système qui agit seul quand le BOP perd la surface. » | le BOP (`VIEW.bop`, `flow` 1, `pass` 0, `inside` 1, `annular` 1, `vbr` 1, `link` 1, `amf` 0, `bsr` 0) : sur « seul » les voyants des boîtiers s'allument (`amf` 0 → 1) ; sur « perd la surface » les liaisons qui descendent s'éteignent (`link` 1 → 0) (≈ 45 %) |
| `avant58` 92,90 → `todefaut` | « Avant 21 h 58, il ferme probablement les lames. » | l'horloge saute à 21:58 ; poussée vers les lames (`VIEW.bsr`) : elles se ferment **lentement** de « ferme » à « lames » (`bsr` 0 → 0,9) ; le rouge dans le tube continue |

**Couture de sortie** : bop, `bsr` 0,9, `vbr` 1, `annular` 1, `inside` 1, `amf` 1, `link` 0.

## acte3.js — 02 LE DÉFAUT → 03 DEPUIS → la fin (`todefaut` 96,22 → 154,4)

Allume l'acte 02 à `todefaut`, l'acte 03 à `todepuis` (`setAct`). **Le plan maître d'un seul tenant** sur `defaut` ; **rien du sujet ne revient après l'annonce** ; dernière image = première.

| repère | la voix | l'image · part du cadre |
| --- | --- | --- |
| `todefaut` → `letube` 98,88 | « Et le puits coule toujours. Tu sais pourquoi ? » | **coupe** (raccord : les lames qui se ferment, de près → les mêmes, en coupe large) sur le plan maître (`VIEW.master`, `STAGED.bop`, `bsr` 0,9, `vbr` 1, `annular` 1, `inside` 1, `pass` 0,4, `culprit` 2, `fault` 0) : un filet rouge s'échappe encore au-dessus des lames ; « Tu sais pourquoi ? » : poussée lente dans le silence (`hush` posé) (≈ 50 %) |
| `letube` → `arrosage` 102,82 | « Le tube s'était plié : tordu en partie par la pression dedans, » | **retour en arrière** : les lames se rouvrent vite (`bsr` → 0, 0,4 s, sur « Le tube ») ; sur « plié » le tube se cambre et sort de l'axe (`buckle` 0 → 1 jusqu'à « dedans »), il passe au rouge (`fault` 1), **cercle rouge** (ancre `world.bop.A.pipeBend`) ; « la pression dedans » : le rouge pulse dans le tube (`inside`) ; `D.punch` sur « plié » |
| `arrosage` → `centre` 104,18 | « comme un tuyau d'arrosage. » | le tube ondule une fois et se pose contre la paroi |
| `centre` → `topire` 106,94 | « Hors du centre, les lames l'ont percé… sans le couper net. » | poussée vers le tube décentré ; de « les lames » à « percé » `bsr` 0 → 1 : **pincé, percé** ; sur « couper » le rouge jaillit par le trou (`pass` 1) ; `D.punch` sur « couper » — le moment se voit en entier, sans coupe |
| `topire` → `boitier` 111,14 | « Et le pire ? Ce dernier recours n'a probablement marché que par hasard. » | **coupe** (raccord : le flanc de l'empilement → les boîtiers dessus) : `VIEW.pods`, `amf` 1, `podOpen` 0, `culprit` 0, `fault` 0 ; `D.punch` sur « hasard » (≈ 50 % les deux) |
| `boitier` → `lautre` 113,54 | « Dans un boîtier, la batterie était vide. » | `VIEW.podBattery` : le panneau s'ouvre sur « boîtier » (`podOpen` 0 → 1), `culprit` 3 : la jauge tombe de « batterie » à « vide » (`charge` 1 → 0), rouge sur « vide » (≈ 40 %) |
| `lautre` → `pile` 117,22 | « Dans l'autre, une vanne mal câblée… » | glissement le long du LMRP vers `VIEW.podValve` : `culprit` 4, rouge sur « câblée », les deux flèches opposées apparaissent (`coils` 0 → 1) |
| `pile` → `toissue` | « …qui ne marchait que grâce à une pile à plat. » | `culprit` 5 sur « pile » : la pile rouge (la vanne revient à l'argile) |
| `toissue` → `jours` 119,16 | « Onze morts. » | **coupe** sur la plateforme après (`VIEW.sink`, `STAGED.plateforme`, `jet` 0, `spill` 1, `fire` 0,8, `lamps` 0, `sink` 0), sobre, presque immobile ; `chip-bilan` (≈ 50 %) |
| `jours` → `mois` 121,35 | « La plateforme coule deux jours plus tard. » | l'horloge « 22 AVR. » ; `sink` 0 → 1 de « coule » à « tard », le feu s'éteint |
| `mois` → `todepuis` 126,81 | « Et le puits fuit pendant près de trois mois : environ 4,9 millions de barils. » | **coupe** (raccord : la coque qui descend → le fond) sur le BOP et sa fuite (`VIEW.plume`, `plume` 0 → 1) ; l'horloge « 15 JUIL. » ; `chip-fuite` (≈ 35 %) |
| `todepuis` → `deux` 130,04 | « Depuis 2016, aux États-Unis, un BOP doit avoir… » | **coupe** sur le BOP (`BENCHED`, `VIEW.bop` → poussée vers `VIEW.bsr`) ; `depuis` 0 → 1 de « Depuis » à « États-Unis » (la lumière, la grille) ; l'horloge « 2016 » |
| `deux` → `centre2` 132,16 | « deux jeux de lames, un moyen de garder le tube au centre, » | `rams2` 0 → 1 sur « deux jeux » ; `chip-regle` ; « au centre » : `ring` 0 → 1 et `buckle` 1 → 0, le tube se redresse et passe du rouge au vert ; `D.punch` sur « centre » |
| `cisaillement` 133,12 → `tocta` | « et un cisaillement vérifié par un expert indépendant. » | `bsr` 0,55 → 1 et `shear` 0 → 1 : la coupe nette, verte |
| `tocta` → `mais` 139,20 | « Pourquoi les lames n'ont pas scellé le puits ? Un tube plié. » | **coupe** sur le plan maître (`VIEW.master`, `depuis` 1, `buckle` 1, `bsr` 1, `pass` 1, `culprit` 2, `fault` 1) : le tube plié, percé |
| `mais` → `commentaire` 142,12 | « Mais tout avait commencé par deux cadrans. » | **coupe** (raccord : le tube rouge → le cadran rouge) sur `VIEW.dials` (`STAGED.puits`, `dialTube` 1 400, `dialLine` 0, `culprit` 1, `fault` 1) |
| `commentaire` → `toabo` 147,27 | « Toi, en commentaire : 1 400 d'un côté, zéro de l'autre… tu valides, ou tu arrêtes tout ? » | orbite lente ; sur « 1 400 » le cadran TUBE, sur « zéro » le cadran LIGNE ; `duelCall` (`aAt` `duelA` 145,44, `bAt` `duelB` 146,28, **`toneA: null, toneB: null`**) |
| `toabo` → `toloop` 152,25 | « Abonne-toi : chaque compte à rebours, un vrai accident… et la sécurité qui a lâché. » | **coupe** sur la plateforme de nuit, calme (`VIEW.rig`, `jet` 0, `spill` 0, `fire` 0, `depuis` 1), orbite lente ; `nextFile` (panneau caviardé, « Un vrai accident. La sécurité qui a lâché. ») ; chevrons `rail-follow` |
| `toloop` → fin | « Comme ce soir-là, à… » | **coupe** sur la plateforme, état `FIRST`, un peu plus loin que `POSE0` ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` |

---

## La première image — quatre candidates

**« 21 h 40. Ton derrick crache de la boue. »** L'image 0 montre l'éruption en cours. Sans texte, à 270 px, et elle bouge dès l'image 1 **par son sujet** (le jet pulse et monte, la boue retombe). Tirées sur le vrai décor (après `plateforme.js`), choisies AVANT les actes ; la gagnante devient `POSE0`. Fichier : `.cache/planches/CR02/premiere-image/essais.json` (`npm run look -- CR02 --file .cache/planches/CR02/premiere-image/essais.json --out .cache/planches/CR02/premiere-image/planche.jpg --cols 4`). Notes sur bouchons, sur les six points (événement · perspective basse · menace derrière · forme reconnue sur 40 % · système là · bouge par le sujet) :

- **(a) Contre-plongée sur le plancher** (`POSE0` provisoire) — ✓ · ✓ · ½ (le rouge est le jet lui-même ; il faut qu'il monte DERRIÈRE le treillis, la couronne dans la pluie) · ✓ (le treillis d'un derrick, ≈ 50 %) · ✗ (le BOP n'y est pas) · ✓ — **4,5 / 6, recommandée**.
  `{ "at": 0.02, "label": "a plancher", "pose": { "tx": 0, "ty": 528, "tz": 0, "d": 92, "az": -60, "el": -36, "fov": 58, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "set": 0, "fx": 0, "fy": 520, "fz": 0, "fs": 150, "jet": 0.6, "spill": 0.2 } }`
- **(b) Sous la mer, au bord d'aquarium, le long du riser** — ✓ · ✓ (du fond, la ligne du riser file vers la plateforme) · ✓ (le jet rouge en haut, derrière) · ½ (la plateforme vue d'en dessous, ≈ 40 % si la pose remonte) · ✓ (le BOP, petit, en bas) · ½ (le jet est petit à cette distance) — **4,5 / 6** ; dépend de la mer vue d'en dessous (`plateforme.js`, image 3).
  `{ "at": 0.02, "label": "b sous la mer", "pose": { "tx": 0, "ty": 240, "tz": 0, "d": 900, "az": -66, "el": -4, "fov": 40, "shift": 120, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "set": 0, "fx": 0, "fy": 300, "fz": 0, "fs": 300, "jet": 0.6, "spill": 0.2 } }`
- **(c) La ligne d'eau : la plateforme dessus, le BOP dessous** — ✓ · ½ · ½ · ✓ (la silhouette entière) · ✓ · ½ (le jet petit) — 4 / 6 ; la plus explicative, la moins frappante.
  `{ "at": 0.02, "label": "c ligne d'eau", "pose": { "tx": 0, "ty": 330, "tz": 0, "d": 1500, "az": -62, "el": 1, "fov": 30, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "set": 0, "fx": 0, "fy": 330, "fz": 0, "fs": 330, "jet": 0.6, "spill": 0.2 } }`
- **(d) La table de rotation, de près** — ✓✓ (la boue jaillit vers toi) · ✓ · ½ · ✗ (un trou dans un plancher ne se reconnaît pas) · ✗ · ✓ — 3,5 / 6.
  `{ "at": 0.02, "label": "d table", "pose": { "tx": 0, "ty": 478, "tz": 0, "d": 110, "az": -64, "el": 26, "fov": 30, "shift": 60, "side": 0, "roll": 0, "drift": 0, "dof": 6 }, "state": { "set": 0, "fx": 0, "fy": 480, "fz": 0, "fs": 60, "jet": 0.6, "spill": 0.4 } }`

Si (a) l'emporte, l'acte 1 la garde jusqu'à `deepwater` puis coupe sur la plateforme entière, et la plongée passe par (b). Si c'est (b), l'acte 1 commence sous la mer, remonte vers le derrick sur « crache » et la plongée de `promesse` repart de la plateforme entière ; la boucle (`acte3.js`) revient alors sur (b), et t4 coupe sur `VIEW.floorLow` sans « retour » à l'image 0.

## Note du décor bop (06/11)
- `flow` est la HAUTEUR du front rouge (l'animer 0 → 1 fait monter le gaz du puits) ; `pass` agit sur ce qui est au-dessus de l'élément fermé le plus bas ; le tube ne guérit qu'avec `ring` (`depuis` seul le laisse rouge). `rams2` soulève le LMRP de 13 cm : la seconde BSR tombe à y ≈ 94,5.

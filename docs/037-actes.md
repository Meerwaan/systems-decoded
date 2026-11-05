# 037 · Le parachute de secours — le plan des actes

Architecte, 04/11. Voix réelle, 87,1 s ; tous les instants viennent de `npm run script -- 037` (repères d'`episode.json` → `cues`). Lis ce haut commun, puis **ta section** (`## <ton fichier>`). Contrat : `src/world.js` (`FIRST`, `VIEW`, `BENCHED`, `STAGED`), `src/plan.js`. Poses de `VIEW` **réglées sur bouchons** : pars des journaux des décors (`docs/journal/037-model.md`, `037-sauteur.md`, `037-ciel.md`).

## Ce qui vaut pour tous les actes

**L'histoire et ses nombres.** `alt` (m au-dessus du sol) est la seule vérité : l'en-tête l'affiche (« ALTITUDE 1 350 m », signal sous 225 m tant que `vz` > 35), le sol et l'air la suivent. `vz` (m/s) : 55,6 en chute (l'en-tête lit 200 km/h, signal), 5 sous voile (20 km/h, veille), 0 au sol. Acte 1 **en temps réel** (`fallen(alt0, s)`, 55,6 m/s : 1 350 → ≈ 240 m à `tobench`) ; sur l'établi le temps s'arrête (`alt` ne bouge pas) ; acte 3 au ralenti autour de la fenêtre. Dans le principe et le repos, `alt` est celle du plan (0 au sol le matin, la montée à 4 000, la chute vue de loin).

**Exactitude** (`docs/faits/037-parachute.md`) : le boîtier **coupe la boucle**, jamais « il ouvre » à l'image ; aucune durée d'ouverture (ni chrono, ni étiquette) ; « vers 225 m » ; il ne voit pas ton corps ; aucune cause du malaise, aucun instant de l'évanouissement. Pas de main seule à l'image, personne de blessé.

**La grille de rétention (21/10).**
- 0 → 0,5 s : l'image bouge par son sujet (le corps tourne, `spin` ≈ 0,35 tour/s, l'air monte) ; `hit` + `impact` + `swish` déjà posés.
- 0,5 → 10,8 s (A·B·C) : une démonstration par phrase, sur le mot ; le mot qui frappe : `D.punch(t, 0.06)` sur « inconscient » (1,08) et « oublié » (10,12), pas plus.
- 10,8 → 25 s : **deuxième accroche** — un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; « Alors… on l'ouvre » dans le quasi-silence (`suck`, `hush`) ; un clic par pièce de l'éclaté (posés).
- Portes d'acte : coupe franche + son (posés : `tozero` 47,27, `toverdict` 61,45, `toloop` 84,83).
- Fin : `duelCall` « Le boîtier » / « Ta main », chacune sur son mot (`duelA` 73,98, `duelB` 75,10) ; le film ne répond pas.

**Les mots qui frappent** (`*…*`, `+…+` du script) : inconscient, réveillé, oublié, monte, la boucle, vitesse, chute, sol, secondes, tranchée, pas, fil, commentaire, main, Like, week-end, Abonne-toi, jaillit. Un `punch` par phrase au plus, jamais sur une coupe, jamais deux à moins d'une seconde. `D.captionStyle({ hit: 0.25 })` une fois (acte 1).

**« Alors… on l'ouvre. »** (19,42 → 20,56) : seule dans son plan ; `benchCut` à `tobench` 19,98 sur `VIEW.back` (même image, rien ne bouge que l'entour), l'éclaté s'ouvre **sur « l'ouvre »** (`explode` 20,24). Rien d'autre ne parle.

**La boucle** : la dernière image est la première. `FIRST` et `POSE0` sont fixés par la planche des quatre candidates (en bas) avant le montage ; `fin.js` revient dessus avec `D.loop`. `spin` reprend 0 (ou la valeur de `FIRST`), `alt` 1 350.

**Anti-parasites.** Une coupe se pose 2 à 4 images avant sa phrase ; pose complète, état complet (`{ ...STAGED, … }` / `{ ...BENCHED, … }`). Plus d'un quart de tour en une seconde = une coupe. Plongées et reculs par rapport (`shot(…, fromD)`). Le corps de verre frôlé en plein vol = image parasite : la caméra ne le traverse pas. `dof` sur les seuls gros plans (`CLOSE` dans `VIEW`). Rien de fin qui tourne vite : le `spin` ne dépasse pas 0,5 tour/s dans un plan serré. Une seule étiquette à la fois en zone haute (436–790), sortie avant la coupe suivante. Le sujet entre y 440 et 1160, rien sous 1600, rien sous les boutons (x > 905, y 880–1760).

**Sons** : la grille `sfx` est posée dans les souffles (36 sons, `ambience` « wind » qui suit la chute). N'en ajoute pas sur un mot ; si un geste en demande un, écris-le sous « À changer ailleurs ».

**Étiquettes** (`index.html`, déjà à opacité 0) : `chip-allume` (veille), `chip-eteint`, `chip-poignee`, `chip-coeur` (veille), `chip-seuil` (veille), `chip-zero` (ink), `chip-fenetre` (veille), `chip-sol`, `chip-france` (veille) ; titre barré « Il ouvre ton parachute » → « Il coupe un fil » ; duel ; prochain dossier 038. Les pièces de l'éclaté se nomment en `co.add` (callouts), en capitales, sans unité à symbole.

**La couture de l'en-tête** : n'écris jamais `#hud-clock` ni `#hud-count-v` (main.js les tient) ; bouge `alt` et `vz`.

---

## acte1.js

**01 MENACE, 0 → 19,98 (`tobench`).** Un mouvement, deux coupes au plus. Entrée : `POSE0`, `FIRST` (sans coupe). En continu sur tout l'acte : `st(0, t.tobench, { alt: fallen(FIRST.alt, t.tobench) }, "none")` (≈ 240 m) et `spin` qui tourne ≈ 0,35 tour/s puis ralentit pour tomber **sur un entier à 19,98** (`turnsOver`), `tilt` 0 à 19,98.

| Instant | Phrase | Image | Le sujet tient |
| --- | --- | --- | --- |
| 0,33–1,56 | Tu tombes, *inconscient*. | `POSE0` : le corps inerte qui tourne, le sac plein, l'air qui monte ; `punch` 1,08 | corps ≈ 45 % de la largeur |
| 2,04–3,64 | Ton sac, lui, est +réveillé+. | la caméra glisse vers le dos (vers `VIEW.rig`) ; sur « réveillé » (3,24) `wake` 0 → 1 ; `chip-allume` 3,3 → 6,3 | sac ≈ 35 % |
| 4,09–6,44 | Dedans, environ 200 grammes vont agir à ta place. | `fabric` 1 → 0 (4,1 → 4,9) : à travers la toile, le boîtier plein ; `litUnit` sur « grammes » (5,24) ; on arrive à `VIEW.rig` | boîtier ≥ 12 % |
| 6,76–7,88 | À quatre secondes du sol. | la caméra plonge le long du corps vers le damier, `threat` 0,4 → 0,9 ; `fabric` revient à 1 | le sol derrière le corps |
| 8,35–10,84 | Sauf si, ce matin, tu as *oublié* de l'allumer. | retour serré sur l'unité de contrôle (vers `VIEW.back`) ; sur « oublié » (10,12) `power` 1 → 0 en 0,15 s (diode et écran morts), `wake` 0 ; `chip-eteint` 10,15 → 11,4 ; `punch` 10,12 | unité de contrôle lisible (≥ 60 px) |
| 11,59–13,30 | Tu tournes, à 200 kilomètres-heure. | **coupe 1** à 11,53 vers `VIEW.under` (état : `power` 1, `threat` 0,6, `hand` 0) : toi contre le ciel, la campagne en bas ; le `spin` se voit ; l'en-tête « 200 km/h » se gonfle sur « deux cents » (12,34 : `tl.fromTo("#hud-count", …)`) | corps ≈ 45 % |
| 13,58–14,18 | Le sol *monte*. | `threat` 0,6 → 1 ; la caméra descend et montre le sol qui grossit ; `punch` 13,94 | le sol en bas du cadre |
| 14,54–16,42 | Ta poignée ? Personne ne la tirera. | la caméra glisse sous la poitrine jusqu'à `VIEW.handle` ; `hand` 0 → 1 (14,6 → 15,6) : la main flotte à côté, sans la prendre ; `chip-poignee` 15,66 → 16,6 | poignée + bras + torse |
| 16,78–18,66 | Il ne reste que ce boîtier, dans ton dos. | **coupe 2** à 16,72 vers le dos, de haut (au-dessus de `VIEW.back`, plus loin), puis on se pose sur `VIEW.back` à 19,98 ; `litUnit` 0,6 sur « boîtier » (17,62) puis 0 ; la diode respire | sac ≈ 70 % à l'arrivée |
| 18,66–19,98 | (« Alors… » commence à 19,42) | tenu sur `VIEW.back` ; le `spin` arrive sur son entier, l'image se calme | — |

**Sortie** : 19,98, `VIEW.back`, `spin` entier, `tilt` 0, `hang` 0, `fabric` 1, `power` 1, `alt` ≈ 240, `vz` 55,6.

## acte2.js

**02 AUTOPSIE, 19,98 → 29,17 (`toprincipe`).** `setAct(tl, 2, t.ouvre)` (19,42). Entrée : `benchCut(D, { at: t.tobench, set: SET.BENCH, view: VIEW.back, origin: [0, 0, 0], state: { ...BENCHED, alt: <celle de la sortie de l'acte 1>, vz: SPEED.fall } })`.

| Instant | Phrase | Image | Le sujet tient |
| --- | --- | --- | --- |
| 19,42–20,56 | Alors… on l'ouvre. | sur 19,42 → 19,98 rien ne bouge que le `mood` (1 → 0) ; `benchCut` 19,98 ; `explode` 0 → 1 de **20,24** à 21,5 ; recul vers `VIEW.exploded` | tout le sac, un cadre |
| 21,51–22,08 | Sous le rabat, | `litFlap` sur « rabat » (21,80) : le rabat du haut, soulevé | — |
| 22,32–24,00 | le boîtier et son capteur de pression. | la caméra glisse vers `VIEW.unit` ; `litUnit` 22,48 ; `litSensor` + callout « CAPTEUR DE PRESSION » à `A.sensor` sur « capteur » (23,28) | boîtier ≈ 40 % |
| 24,48–25,76 | Un câble file au coupe-boucle. | `litCable` 0 → 1 de « câble » (24,60) à « coupe-boucle » (25,28) : la tête de lumière court ; la caméra la suit jusqu'au coupe-boucle ; callout « COUPE-BOUCLE » | le câble en diagonale |
| 26,04–27,04 | Et dans son trou passe… | on entre dans le tube : `VIEW.cutter`, `section` 0 → 1 sur « trou » (26,48) | coupe-boucle ≈ 55 % |
| 27,40–28,64 | +la boucle+ qui le garde fermé. | `heart` 0 → 1 sur « boucle » (27,52) : la boucle seule, veille, sur son halo ; recul doux vers `VIEW.heart` ; `chip-coeur` 27,6 → 29,0 | la boucle debout, ≈ 30 % de la hauteur |

**Sortie** : 29,17, établi, `VIEW.heart`, `explode` 1, `heart` 1, `section` 1, `mood` 0. L'acte 2 propose la couverture (un repère, une pose `el` ≥ 28, tout le système éclairé et la boucle qui luit) — `cover` d'`episode.json` est provisoire.

## acte2b.js

**Le principe et le repos, 29,17 → 47,27 (`tozero`).** Sept phrases, quatre coupes. Pas d'abonnement ici.

| Instant | Phrase | Image | Le sujet tient |
| --- | --- | --- | --- |
| 29,29–31,08 | Plus tu descends, plus l'air s'épaissit. | **coupe** 29,17 vers la scène, `VIEW.side` plus large (état `{ ...STAGED, alt: 2600, vz: 55.6, strata: 1, mood: 0 }`) : `alt` 2 600 → 1 900 (illustratif), les nappes de grains montent et se resserrent | corps ≈ 25 %, les nappes dans tout le cadre |
| 31,44–34,20 | Le boîtier lit sa pression… et à quelle +vitesse+ elle monte. | **coupe** 31,38 vers l'établi `VIEW.unit` (`{ ...BENCHED, solo: 1 }`) : `press` 0 → 0,7 sur « pression » (32,44) ; `rate` 0 → 1 sur « vitesse » (33,44), la barre accélère | boîtier ≈ 50 % |
| 34,56–36,68 | Une voile ouverte : quelques mètres par seconde. | **coupe** 34,50 vers `VIEW.twin` (`twin` 1) : le second sauteur sous sa voile, lent, en haut ; toi qui files en bas | les deux silhouettes |
| 37,04–39,32 | Au-delà de 35, pour lui, c'est une *chute*. | `chip-seuil` « 35 MÈTRES PAR SECONDE » sur « trente » (37,48) → 39,4 ; sur « chute » (39,08) `mood` 0 → 1 (franc), `punch` | toi, en bas du cadre |
| 39,78–41,72 | Au sol, il prend cette pression comme son zéro. | **coupe** 39,66 (`torepos`) vers `VIEW.ground` : `{ ...STAGED, alt: 0, vz: 0, body: 0, mood: 0, power: 1 }`, le sac sur l'herbe le matin ; `test` 0 → 1 (39,9 → 41,4) ; `chip-zero` sur « zéro » (41,48) → 42,1 ; l'en-tête lit 0 m | sac ≈ 45 % |
| 42,16–43,72 | Dans l'avion, il compte la montée. | `alt` 0 → 4 000 (`power2.in`, 42,2 → 43,9) : le sol s'éloigne sous le sac, l'en-tête monte (pas d'avion modélisé : le `voir` le disait, la montée se lit par le sol et le compteur) | sac ≈ 35 %, le sol qui fuit |
| 44,08–47,00 | Et sa fenêtre ne s'ouvre que vers 225 mètres du *sol*. | **coupe** 44,02 vers `VIEW.gateWide` (`body` 1, `vz` 55,6, `alt` 900 → 330) : `gate` 0 → 1 sur « fenêtre » (44,36) ; `chip-fenetre` sur « deux » (45,64) → 47,1 | la nappe et la chute |

**Sortie** : 47,27, la scène, `gate` 1. (L'acte 3 coupe avec un état complet.)

## acte3.js

**03 RÉPONSE, 47,27 → 61,45 (`toverdict`).** En coupes, un plan par souffle. **Ralenti** : `alt` 232 → 225 sur « deux cent vingt-cinq » (47,39–47,96), puis 225 → 212 jusqu'à « tranchée » (56,44) ; `vz` reste 55,6 (l'air est long mais lent).

| Instant | Phrase | Image | Le sujet tient |
| --- | --- | --- | --- |
| 47,39–48,36 | 225 mètres. | **coupe** 47,27 vers `VIEW.cross` (`{ ...STAGED, alt: 232, vz: 55.6, gate: 1, spin: <entier>, tilt: 0, hang: 0, deploy: 0, flaps: 0, loop: 0, piston: 0, section: 0, fabric: 1, power: 1, threat: 1 }`) : tu traverses la nappe | corps ≈ 45 % |
| 48,68–50,28 | Plus de 35 mètres par seconde. | `chip-seuil` revient 48,9 → 50,5 ; l'en-tête 200 km/h en signal ; la caméra glisse vers le flanc | — |
| 50,64–51,40 | Ta main ne bouge pas. | **coupe** 50,58 vers `VIEW.handle` (`hand` 1) | poignée + bras |
| 51,84–52,52 | Quatre *secondes*. | `chip-sol` 51,84 → 52,95 ; `punch` sur « secondes » (52,12) | — |
| 53,09–55,68 | Dans le coupe-boucle, un piston avance de 5 millimètres. | **coupe** 53,03 vers `VIEW.cutter` **sur ton dos** (`fabric` 0, `section` 1, `litCutter` 1) ; `piston` 0 → 1 de « avance » (54,48) à « millimètres » (55,68), lent | coupe-boucle ≈ 55 % |
| 56,04–56,80 | La boucle est +tranchée+. | `loop` 0 → 1 à `trigger` (56,39), 0,08 s ; `heart` 1 ; `blip("#flash", …)` ≤ 0,05 | les deux bouts |
| 57,20–58,00 | Ton secours s'ouvre. | **coupe** 57,14 vers le dos (`VIEW.rig` reculé, `fabric` 1) : `flaps` 0 → 1 (57,36 → 57,9), `deploy` 0 → 0,25 | sac + extracteur |
| 58,28–59,20 | La voile se gonfle. | **coupe** 58,22 vers `VIEW.open` : `deploy` 0,25 → 1 (58,3 → 59,4), `hang` 0 → 1 (58,8 → 60,0), `vz` 55,6 → 5 (58,9 → 60,2) ; **`mood` 1 → 0 sur « gonfle » (58,88)** : le relâchement | voile + corps |
| 59,48–60,88 | Et toi… tu n'as pas bougé. | glisse lente vers `VIEW.hanging` : le corps pendu, inerte | corps ≈ 25 %, voile au-dessus |

**Sortie** : 61,45, `VIEW.hanging`, `deploy` 1, `hang` 1, `flaps` 1, `loop` 1, `piston` 1, `vz` 5, `alt` ≈ 190, `mood` 0.

## fin.js

**61,45 → 87,1.** L'ordre : chute → ce qui est dû et la question → like → prochain dossier → boucle. Modèle : `kit/template/src/fin.js`.

| Instant | Phrase | Image | Le sujet tient |
| --- | --- | --- | --- |
| 61,57–64,06 | Voilà le secret : il ne sait *pas* que tu es inconscient. | **coupe** 61,45 sur `VIEW.hanging` (état complet de la sortie de l'acte 3) ; recul lent ; `D.verdict(t.pas)` (63,06) | corps + voile |
| 64,34–65,82 | Il n'ouvre même pas ton parachute. | **coupe** 64,28 vers l'établi `VIEW.cutter` (`{ ...BENCHED, section: 1, piston: 1, loop: 1, heart: 1 }`) ; `retitle` : `showAt` 64,34, `strikeAt` « pas » (65,06) | les deux bouts de boucle |
| 66,14–66,94 | Il coupe un +fil+. | le bout coupé plein cadre (vers `VIEW.heart`, plus près) ; `swapAt` 66,65, `hideAt` 67,27 | le bout ≈ 50 % |
| 67,81–69,82 | Et si tu ne l'as pas allumé ? Il ne fait rien. | **coupe** 67,69 (`tocta`) vers `VIEW.ground` (`{ ...STAGED, alt: 0, vz: 0, body: 0, power: 0, mood: 0 }`) : le sac au sol, écran mort | sac ≈ 45 % |
| 70,14–72,06 | En France, il doit être allumé à chaque saut. | `test` 0 → 1 (70,2 → 71,8), `power` 1 sur « saut » (71,90) ; `chip-france` 70,38 → 72,3 | l'unité de contrôle |
| 72,37–75,18 | En commentaire : tu fais confiance au boîtier… ou à ta *main* ? | `duelCall(tl, { from: 72.0, aAt: duelA, bAt: duelB, to: 75.58, toneA: null, toneB: null })` ; la caméra tourne lentement autour du sac | — |
| 75,88–77,80 | +Like+ : pour quelqu'un qui saute ce *week-end*. | **coupe** 75,82 vers `VIEW.landed` (`land` 1, `deploy` 1, `alt` 0, `vz` 0, `body` 1) ; `likeCall` | le champ, la voile |
| 78,25–84,36 | +Abonne-toi+ : prochain dossier, le sous-marin. En urgence, l'air comprimé chasse l'eau de ses ballasts… et il *jaillit*. | même plan, recul lent ; `nextFile` (`showAt` « prochain » − 0,15, `factAt` + 0,7, `hideAt` 84,45, `railFrom` 78,35, `railTo` 84,5). Aucun modèle de sous-marin | — |
| 84,95–86,24 | Comme ce boîtier, quand… | **coupe** 84,83 (`toloop`) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` : retour à `POSE0` / `FIRST` | = la première image |

---

## Les quatre candidates de la première image

Instant 0,02 et 0,5 (le `spin` avance de ≈ 0,17 tour entre les deux). À tirer **sur les décors finis** (`npm run look -- 037 --file essais.json --out .cache/planches/037/premiere.jpg --cols 4`). Notes sur bouchons (planche p3 de l'architecte), sur les six points de `docs/recette-agents.md` : 1 événement · 2 perspective · 3 menace derrière · 4 forme reconnue, vue rare, ≥ 40 % · 5 système petit mais lisible · 6 bouge par son sujet.

| | Cadre | 1 | 2 | 3 | 4 | 5 | 6 | Total |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| **a · plongée** | de dessus et derrière l'épaule droite : le dos, le sac plein, la diode ; la campagne loin dessous ; l'air monte vers l'objectif et fuit vers le nadir derrière le corps | ✓ | ✓ | ✓ | ✓ | ✓ | ✓ | **6** |
| b · côté | à ta droite, un peu au-dessus : le corps de profil, l'horizon haut, le damier sous toi | ✓ | ½ | ✓ | ½ (vue connue) | ½ (sac de chant) | ✓ | 4,5 |
| c · dessous | sous toi, rasant : le ventre contre le ciel, la campagne et l'horizon en bas du cadre | ✓ | ✓ | ½ | ✓ | ✗ (sac derrière le corps, vu à travers le verre) | ✓ | 4,5 |
| d · tête en bas | `tilt` 55 : en piqué, de ta droite, à ta hauteur, le sol remplit le bas | ✓ | ✓ | ✓ | ✓ | ½ (sac de chant) | ✓ | 5,5 |

**Pressentie : a** (`POSE0` actuel). **d** colle au cas réel (« tête en bas ») ; si elle gagne, `FIRST.tilt` devient 55 et l'acte 1 le ramène à 0 avant 19,98.

`essais.json`, prêt à coller :

```json
[
 {"at":0.02,"label":"a plongée","pose":{"tx":0,"ty":-12,"tz":-20,"d":400,"az":-40,"el":60,"fov":58,"shift":40,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0}},
 {"at":0.02,"label":"b côté","pose":{"tx":0,"ty":-12,"tz":-20,"d":680,"az":-70,"el":24,"fov":42,"shift":40,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0}},
 {"at":0.02,"label":"c dessous","pose":{"tx":0,"ty":-12,"tz":-20,"d":520,"az":-50,"el":-14,"fov":56,"shift":0,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0}},
 {"at":0.02,"label":"d tête en bas","pose":{"tx":0,"ty":-12,"tz":-20,"d":640,"az":-90,"el":14,"fov":42,"shift":60,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0,"tilt":55}},
 {"at":0.5,"label":"a +0,5 s","pose":{"tx":0,"ty":-12,"tz":-20,"d":400,"az":-40,"el":60,"fov":58,"shift":40,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0.17}},
 {"at":0.5,"label":"b +0,5 s","pose":{"tx":0,"ty":-12,"tz":-20,"d":680,"az":-70,"el":24,"fov":42,"shift":40,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0.17}},
 {"at":0.5,"label":"c +0,5 s","pose":{"tx":0,"ty":-12,"tz":-20,"d":520,"az":-50,"el":-14,"fov":56,"shift":0,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0.17}},
 {"at":0.5,"label":"d +0,5 s","pose":{"tx":0,"ty":-12,"tz":-20,"d":640,"az":-90,"el":14,"fov":42,"shift":60,"side":0,"roll":0,"drift":0,"dof":0},"state":{"spin":0.17,"tilt":55}}
]
```

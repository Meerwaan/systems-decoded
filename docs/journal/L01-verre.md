# L01 — journal du décor `src/verre.js` (le verre, le héros)

- Lu : `docs/L01-decors.md` (Pour tous + verre), `plan.js`, `world.js`, `docs/recette-agents.md`, `kit/lib/build3d.js`, `kit/lib/stage.js` (environnement, lumière clé), en-têtes de `usine.js`, `postes.js`, `casse.js`, `car.js`.
- Choix : tout le verre (pare-brise, ruban, vitre, éprouvette, témoin, bain) passe par UN shader maison (`glassMat`) : le bombage est calculé dans le vertex shader (même formule que `onSurface`, donc exacte pour `casse.js`), les reflets du studio sont analytiques (la grande boîte chaude, la bande froide, le plafond : les mêmes que `studioEnvironment`), la chaleur (`glow`) est une émission signal avec un cœur plus chaud que les bords, le voile laiteux part par plaques depuis le centre. Mélange prémultiplié : le verre assombrit un peu ce qu'il y a derrière et y ajoute ses reflets — on garde le verre, jamais un aplat.
- Planches (dossier temporaire) : b1 → b5, 8 vignettes chacune. **40 images lues : dix de trop sur le budget de 30** (je n'ai pas compté au fil de l'eau ; la dernière retouche — le plafond des reflets à 0,55 — est faite sans la regarder).
- Ce qui a raté puis été corrigé : (1) le film teintait tout le pare-brise en vert (un panneau menthe) → teinte de face presque nulle, le vert vit dans sa TRANCHE (une ligne veille entre deux lignes encre) et dans l'éclaté ; (2) la chaleur à k ≈ 2,4 sortait rose-blanc (le tone mapping blanchit tout canal au-dessus de 1) → le canal rouge plafonne vers 1, un petit cœur blanc seulement au-dessus de 0,85 ; (3) le verre au repos n'avait aucun reflet (vu de face, le softbox du studio ne s'y reflète jamais) → une « bande de photographe » qui suit la caméra (`envView`) : une traînée douce et un dégradé, quel que soit l'angle ; (4) quatre faces qui reflétaient → seules les deux faces extérieures du feuilleté reflètent (verre / PVB / verre ont le même indice) ; (5) tas en « méduses » → cônes mats ; (6) un éblouissement blanc sur la feuille soulevée vue en rasant (`film .5`) → reflets plafonnés (0,55).

## Les nombres (ce qu'ils font chez moi)

- `hero` fondu du pare-brise (sur la ligne, visible seulement si `cut` > 0,02) · `bend` 0 → 1 le bombage (calculé dans le shader : centre d'abord, tout suit) · `explode` les deux verres à ±30 cm du film (bande et tampon restent sur le verre extérieur, capteurs sur l'intérieur) ; le film s'allume avec lui · `open` le verre du dessus (+z, l'intérieur) monte de 30 cm · `film` le film glisse depuis +x du pane (= +z sur la ligne, côté caméra) · `milk` voile laiteux sur le film, qui part par plaques depuis le centre (bruit) · `sensors` le boîtier caméra / capteur de pluie descend de 26 cm sur la face intérieure, sous la tache noire du rétroviseur (deux fenêtres claires y sont découpées) · `glow` chaleur du pare-brise (0,5 rouge sombre, 1 signal opaque, bords plus froids que le cœur) + une lumière ponctuelle signal · `lit*` la couche nommée s'allume un peu.
- `cut` : 0,02 → 0,4 le trait de coupe court le long du contour (encre, tête plus vive) ; 0,4 → 0,75 la chute rectangulaire autour s'écarte et s'efface ; 0,75 → 1 les bords passent de « nets » (reflet vif) à « meulés » (mat, plus clair).
- `print` : 0 → 0,45 la bande noire se pose par un balayage le long de y du pane (= +x de la ligne), front de −60 à +60 cm — exactement la course de la raclette (`squeegee` 0 → 1) ; 0,45 → 0,8 deuxième passage : le dégradé de points ; 0,8 → 1 le tampon apparaît.
- `queue` trois autres pare-brise (pos −420, +420, +840), même état, mêmes matières · `mould` l'anneau d'acier sombre (contour bombé du pare-brise, liseré encre, rougeoie avec `glow`) sur son chariot aux rayons X, suit `pos`.
- `batch` 0 → 5 les tas poussent un à un (sable, soude, calcaire, dolomie, calcin qui brille) · `charge` ils se vident l'un après l'autre et un filet de grains tombe de la bouche de la trémie · `melt` la pâte du four (volutes lentes, croûte de mélange côté chargement, lumière signal) · `ribbon` le ruban de la gorge (x 970) à la coupe (x 5 000) : langue épaisse qui tombe sur l'étain, s'étale à ≈ 4,2 m puis tenue à 3,6 m par six paires de molettes ; couleur = sa température (1 100 °C → 600 °C sur l'étain → froid au fond de l'étenderie) ; vagues à la gorge qui s'éteignent en flottant ; grain et reflets qui avancent avec `flow` · `pull` le ruban s'amincit (−58 % après les premières molettes), les molettes tournent 60 % plus vite (une dent de plus par période, sans saut) · `silver` les 11 fils et les deux barres de l'échantillon de lunette (x 5 700, z +135), imprimés par le même balayage.
- `side` (vitre latérale) · `sideFilm` 0 trempée, tampon « I » · 1 feuilletée (deux verres + film veille), tampon « II » · `sideGlow` sa chaleur · `stress` : la coupe dans la vitre (56 × 20 cm, posée côté intérieur) — 1 les deux peaux encre comprimées (flèches vers l'intérieur), le cœur signal qui tire (flèches vers l'extérieur) ; 2 une entaille dans la peau du dessus, tenue fermée ; 3 elle descend jusqu'au cœur, le cœur s'allume, une fissure encre part dedans.
- `sample` l'éprouvette de 30 cm feuilletée · `witness` le témoin de 50 cm trempé (fondus).

## Les poses qui cadrent bien (complètes)

- BENCH, le pare-brise en beauté : `{ tx: 0, ty: 60, tz: 0, d: 300, az: -28, el: 14, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `AT.bench`.
- BENCH, l'éclaté : `VIEW.exploded` + `{ explode: 1, litFilm: 1 }` (le film est la couche la plus vive).
- BENCH, le tampon : `VIEW.stamp` (E2 · II · 43R · 00 4127 lisibles).
- LINE, la découpe (le pare-brise est à 300 cm EN AVAL du portique : `VIEW.cut` le laisse hors cadre) : `{ tx: 5300, ty: 95, tz: 0, d: 420, az: -22, el: 40, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ cut: 0 → 1, pos: 5300, print: 0, bend: 0 }`.
- LINE, le bombage à chaud : `{ tx: 6600, ty: 100, tz: 0, d: 380, az: -30, el: 22, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ cut: 1, print: 1, mould: 1, bend: 0 → 1, glow: 1, pos: 6600 }` (la selle orange sur son chariot). `VIEW.bendLow` le montre de profil, une ligne mince.
- LINE, l'autoclave (le voile qui part) : `{ tx: 9300, ty: 100, tz: 0, d: 300, az: -25, el: 40, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ cut: 1, print: 1, bend: 1, film: 1, milk: 1 → 0, door: 0, pos: 9300 }`.
- LINE, la coupe du trempé : `{ tx: 7600, ty: 92, tz: -1100, d: 150, az: -90, el: 70, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ stress: 1 → 3, sidePos: 7600 }` (az −90 : le x du pane = la droite de l'écran, le schéma se lit à plat).
- LINE, la trempe à chaud : `{ tx: 6400, ty: 95, tz: -1100, d: 260, az: -20, el: 35, fov: 28, shift: 0, side: 0, roll: 0, drift: 0.3 }` + `{ sideGlow: 1, sidePos: 6400 }`.
- LINE : `VIEW.melt`, `VIEW.throat`, `VIEW.ribbon` (les molettes au bord), `VIEW.batch` + `{ batch: 5 }`, `VIEW.plate` + `{ sample: 1 }` — tels quels.
- CAR : `VIEW.sideIn` + `{ sideOn: 1, sideFilm: 1 }` (la vitre feuilletée, sa teinte veille, la toile de casse dessus).

## Pas encore au niveau

- La feuille du dessus soulevée (`open` 1), vue en rasant (`VIEW.film`) : un reflet blanc trop large ; plafonné après la dernière planche, pas revu.
- Le verre à chaud plein (`glow` 1, `sideGlow` 1) se lit comme un coussin orange uni : pas de reflet ni de tranche visibles à cette chaleur.
- Le témoin (50 cm, trempé) posé seul est très discret (verre clair sur fond sombre) : ce sont ses grains (`casse.js`) qui le porteront.
- Les tas restent des cônes trop réguliers ; le filet de grains n'a pas été regardé.
- La découpe (`cut` 0,02 → 0,4) : le trait de coupe n'a pas été vu nettement à 420 cm (largeur portée à 0,8 cm, plus vif, non revu).
- `pull` : la tranche qui s'amincit se voit mal à chaud (orange sur orange) ; plus lisible sur le ruban froid.

## À changer ailleurs

- `plan.js · ST.hopper.at[0]` = −200 : la trémie est EN AMONT de la voûte du four (x0 −120), le filet tombe dehors. J'ai dessiné une poche de verre en fusion sous elle (−218 → −108, large de 1,4 m) pour le recevoir. Plus juste : `hopper: { at: [-60, 0, 0], … }` (au-dessus du bain) — ma poche disparaît d'elle-même.
- Chapitre de l'impression : `squeegee` 0 → 1 pendant `print` 0 → 0,45 (la bande), puis 0 → 1 de nouveau pendant 0,45 → 0,8 (les points) ; même course pour `silver` 0 → 1.

## Reprise (demande de l'orchestrateur : forme, verre chaud, épaisseur) — 12 images lues (b6 : 8, b7 : 4)

- **La forme** : le contour n'est plus une formule. C'est un vrai trapèze : 150 cm au pied, la ligne du haut à 120 cm, des coins du haut très arrondis (r 26), ceux du bas serrés (r 7), le bas légèrement bombé vers le bas et le haut légèrement cintré. Il est rééchantillonné en 240 points (`windshieldOutline`). La largeur de la bande (7 cm, 11 en haut) est portée par les sommets (`aBand`, distance au contour), ce qui donne 24 anneaux denses au bord. **Le bombage** : profil 1 − 0,45·u² − 0,55·u⁴ (même creux au centre, `WS.sag`), plat au milieu, et les côtés fuient vers l'arrière : ça se voit de trois quarts (b6 « bench 3/4 »). `onSurface` ne dépend PAS du contour (seulement de w, h, sag, sagV) et reste exact, shader compris (`GLSL_BEND`).
- **Le verre chaud** : c'est une feuille, plus un coussin. Le cœur est plus clair que les bords et les coins (dégradé sur 42 cm depuis le bord), avec un grain de matière, et la feuille reste translucide (opacité 0,6 aux bords, 0,86 au cœur). Les reflets du studio passent encore dessus et la tranche est plus vive. Un halo additif suit le bombage sous la feuille, et une lumière ponctuelle (×3) l'éclaire par en dessous. Le verre du chariot vire au signal avec la chaleur. Pareil pour la vitre de trempe (`sideGlow`). Le canal rouge reste ≤ 1,3, l'émission est sous 3.
- **L'épaisseur** : TG 0,4, TF 0,22 → feuilleté de 1,0 cm (le vrai fait ≈ 5 mm). Vitres simples 0,42, éprouvette 0,4, film latéral 0,18.
- Les reflets du studio (la fenêtre chaude) sont baissés et ont un bord net : une fenêtre douce, plus un soleil qui bave.
- Encore un cran en dessous : vu en rasant tout près du bord (b6 « stack edge »), une rangée de dents sombres le long de la bande, sans doute les points du dégradé vus par la tranche. Au bombage à chaud, la selle orange reste un peu « siège en plastique » vue de haut. Le grand reflet doux sur le gros plan du tampon est encore large, mais le tampon se lit.

### À changer ailleurs (reprise)
- `plan.js · WS.drawn` → `{ glass: 0.4, film: 0.22 }`. `casse.js` (FACE_LAM) et `car.js` (ligne 237) lisent ces nombres pour poser les fissures et la tête sur la face : sans ce changement, ils sont 3 à 4 mm au-dessus de mon verre.
- `car.js` lignes 93–94 recopient l'ancienne formule du bombage (parabole). Remplacer par `glass.hero.onSurface`, ou par le profil `1 − 0.45·u² − 0.55·u⁴` (normale x : `−sag·(0.9·u + 2.2·u³)·2 / w`). Écart actuel au point de la tête : ≈ 0,9 cm.

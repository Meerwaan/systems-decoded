# 009 — model.js (le four et sa porte) — journal

Fichier : `episodes/009-micro-ondes/src/model.js`. Planches : dossier temporaire de la session (`scratchpad/009/009-model.jpg`, essais générés par `model-gen.mjs` au même endroit) — rien dans `renders/` ni dans le dépôt. Budget : 30 images.

## Ce qui est construit

- **La porte** (repère propre : centre à l'origine, x vers le bord libre, z vers la pièce ; 40 × 34 × 2,6) — six pièces, chacune ses matières :
  `frame` le cadre avant (sombre, feuillure où loge la vitre) et sa poignée (barre claire sur deux colonnettes) · `glass` la vitre (33,8 × 23,8 × 0,36 ; shader de vitre : presque rien de face, lèvre claire, deux bandes de studio qui glissent avec l'œil ; un voile fumé de 18 % derrière) · `mesh` **la plaque perforée** (36 × 26, bord tombé) · `film` le film intérieur · `inner` le cadre intérieur (deux lèvres, la rainure entre elles) · `hooks` les deux crochets (profil à nez tombant et rampe d'entrée, 0,6 d'épaisseur), dans un groupe qui se soulève.
- **La plaque** : un plan, les trous dans le shader (`perforated`, greffé sur la matière standard : elle reste éclairée et ombrée). Réseau triangulaire à l'échelle vraie, un trou en `HOLES.origin`. De près : trous **ouverts** (alpha 0), bord adouci sur un pixel, et une **épaisseur** (0,7 mm) — le rayon qui entre glisse dans la tôle et peut toucher la paroi du trou, ombrée comme une paroi (croissant de métal de trois quarts). Sous 4,2 px par trou le motif fond (`fwidth`) vers sa propre moyenne (un tiers d'ouverture, moins en biais) ; sous 2,4 px : teinte unie. Elle n'écrit pas la profondeur (`renderOrder` 7 : après les lueurs, avant les coques de verre).
- **Le corps aux rayons X** : coque de verre (`asShell` 20) et bandeau de commande dessiné au trait · cavité : cinq parois translucides (18 %), arêtes pleines doublées d'un trait, **bride** pleine autour de la bouche avec les deux lumières des crochets, deux axes de charnière · plateau de verre, couronne à galets, un bol clair **excentré** (on le voit tourner) · ampoule au plafond (un `PointLight` + une boule douce) · magnétron (bloc, aimants, culasse, huit ailettes, antenne, boîtier de filtre) et guide d'onde · **platine du loquet** : cadre + voile translucide (les interrupteurs se voient des deux côtés), deux gâches, deux guides, **trois micro-interrupteurs** (corps, levier articulé, poussoir, trois bornes, deux rivets, un voyant traversant) et la **bascule** du troisième · **fusible** : cartouche de verre, deux capsules, deux pinces, sa carte, filament (entier / deux moignons), suie, éclair · **fils** : secteur → fusible → interrupteur bas → interrupteur haut → magnétron, une dérivation vers le moniteur, et du moniteur au fusible ; gaine de lumière à tirets (≥ 5 px).
- **Sur l'établi** : un socle mat (semelle, lit, deux joues) où la porte tient debout, son centre en `DOOR.bench`.

## Les nombres de l'état

Voir le commentaire de `buildOven` (une ligne par nombre). À retenir : `body` 1 tout · 0,5 la coque, la cavité et le plateau partis, il reste la chaîne de sécurité · 0 rien. `latch` : les crochets montent de `LIFT` (1 cm), les leviers les suivent puis s'arrêtent (11°). `stuck` : les leviers sont levés, ce sont les contacts qui restent collés — voyants et fils en signal. `monitor` : la bascule descend sur le levier du troisième. Le fil moniteur → fusible ne s'allume que si la chaîne est encore sous tension (`max(sw, stuck) × fuse × monitor`). `explode` : `LAYERS` (cadre +21, vitre +11, plaque 0, film −7, cadre intérieur −14, crochets −17,6), et la plaque retrouve sa clarté en sortant de derrière la vitre (`DIM` 0,55 → 1).

## Ce qui a raté, et pourquoi

1. **Le profil du loquet filmé à az −84** : la caméra était devant le plan de la porte, on voyait la façade en rasant. Le profil se prend de **derrière** le plan de façade : `az` −98 à −104.
2. **La plaque blanche derrière sa vitre cachait la cavité** (un tiers de trous contre deux tiers de tôle éclairée par la clé) : la tôle est assombrie tant qu'elle est derrière la vitre fumée (`DIM`), l'ampoule poussée. Ce n'est pas la physique exacte, c'est ce qui fait lire « une porte de micro-ondes ».
3. **La porte fermée mettait la cavité et le loquet à l'ombre de la clé** : les grandes pièces de la porte ne portent d'ombre que sur l'établi (`casters`).
4. **L'ampoule sur la paroi droite brûlait le guide d'onde** (une lumière ne connaît pas les murs : à 5 cm, éclairement × 40) : elle est au plafond, côté gauche.
5. **Platine pleine** : les interrupteurs ne se voyaient que d'un côté → cadre + voile, corps gris moyen, voyant traversant.
6. **L'éclair du fusible** : une boule blanche unie → un cœur serré (puissance 26) et un halo large et faible.
7. **Éclatée, la porte est large et basse** dans un cadre vertical → couches écartées (35 cm de profondeur) et caméra plus haute (`el` 24).
8. **Les crochets ne se voient d'aucune vue de face** : ils sortent derrière la porte, sur son bord libre, et la couche qui les porte est la plus reculée. `hooksPart` se filme **de derrière** (`az` +142). De la droite de face (`az` > 0) la poignée passe devant la plaque.
9. **La vitre allumée** (`litGlass` 1, gain × 2,6) : un autocollant vert. Ramené à × 1,8, teinte 0,7 — réglé après la dernière planche, **non revu**.
10. **Motif à mi-distance** : à d 170 l'image fixe est propre (trous de 2,6 à 3,4 px, à moitié fondus). Le fondu a été remonté ensuite de 2,0–3,6 px à **2,4–4,2 px** par trou (compression, diffusion en 720p) : dans le sens sûr, mais **non revu**, et jamais vu en mouvement — à juger sur le brouillon.

## Poses qui cadrent (30 images lues sur 30)

Cuisine (`fov` 28, `side` 0, `roll` 0, `drift` 0,3) :
- `VIEW.door` : `{ tx: -8, ty: 161, tz: 57.3, d: 185, az: -40, el: 6, shift: 160 }` — vue à d 150 et 170 (shift 150) : la porte tient entre y ≈ 436 et 1164.
- macro sur la plaque : `{ tx: -8, ty: 161, tz: 57, d: 9, az: -25, el: 6, shift: 0 }` (lumière `fx: -8, fy: 161, fz: 57, fs: 20`) ; à d 60, `az` −30 : trame fine, propre.
- porte entrouverte (`open` 0,3) : `{ tx: -8, ty: 161, tz: 57.3, d: 200, az: -40, el: 6, shift: 185 }` ; grande ouverte (`open` 1) : `{ tx: -14, ty: 161, tz: 57.3, d: 235, az: -34, el: 8, shift: 185 }`.
- **le loquet de profil** (les deux crochets, les trois interrupteurs, le fusible en bas à gauche) : `{ tx: 11.2, ty: 160.5, tz: 50.5, d: 135, az: -100, el: 4, shift: 210 }`, avec `body: 0.5`, lumière `fx: 11, fy: 161, fz: 52, fs: 30`. Vu à d 128 / shift 160 (trop bas de 90 px : d'où 135 / 210). Les interrupteurs y font ≈ 100 px.
- **un crochet et son interrupteur, de près** : `{ tx: 11.2, ty: 168.6, tz: 53.2, d: 45, az: -102, el: 5, shift: 160 }`, `fy: 168, fs: 16` (vu à d 30, shift 0).
- le fusible de près : `{ tx: 20.6, ty: 149, tz: 46, d: 30, az: -100, el: 6, shift: 160 }`, `fx: 20.6, fy: 149, fz: 46, fs: 12` (vu à d 22).
- le loquet par la façade de verre, porte entrouverte : `{ tx: 13, ty: 161, tz: 52, d: 110, az: 38, el: 6, shift: 0 }` — lisible mais chargé (bol, magnétron, platine dans le même cadre).

Établi (`set: 0`, lumière de `BENCHED`) :
- `VIEW.whole` : `{ tx: 0, ty: 21, tz: 0, d: 200, az: -40, el: 10, shift: 140 }` (vu à d 190 ; `az` −22 marche aussi, plus affiche ; −60 trop de profil ; à droite la poignée passe devant la plaque).
- `VIEW.exploded` : `{ tx: 0, ty: 21, tz: 3.5, d: 270, az: -48, el: 24, shift: 230, side: 70 }` (vu à `side` 50 : la poignée touchait x = 907).
- `glassPart` : `{ tx: -12, ty: 24, tz: 11, d: 100, az: -46, el: 14, shift: 160 }` + `litGlass`
- `meshPart` : `{ tx: -9, ty: 22, tz: 0, d: 85, az: -38, el: 8, shift: 160 }` + `litMesh` (vu à shift 60 : les trous font 6 à 7 px)
- `hooksPart` : `{ tx: 19, ty: 21, tz: -19, d: 92, az: 142, el: 8, shift: 160 }` + `litHooks` (vu à d 105, shift 60 ; de derrière : c'est une coupe, ou un tour de 190° en trois secondes au moins)

## À changer ailleurs

- `world.js`, `VIEW` : remplacer `door`, `exploded`, `whole` par les poses ci-dessus et ajouter `glassPart`, `meshPart`, `hooksPart`, `latch`, `hook`, `fuse` (toutes à compléter de `fov: 28, side: 0, roll: 0, drift: 0.3`, sauf `side: 70` pour `exploded`).
- `world.js`, commentaire de `FIRST.body` : « 1 tout · 0.5 la chaîne de sécurité seule (platine, interrupteurs, fils, fusible, magnétron) · 0 rien ».
- `kitchen.js` (la main sur la poignée) : la porte tourne de `open × SWING` degrés (`SWING` = 100, exporté par `model.js`) autour de `HINGE`, `rotation.y = −angle` ; l'ancre `oven.A.handle` suit la poignée, `oven.A.hookTop` / `hookBottom` suivent les crochets.
- `waves.js` : la plaque est transparente (`renderOrder` 7, pas d'écriture de profondeur) : ce qui est dessiné avant elle (ordre < 7) est atténué par elle, ce qui est dessiné après passe par-dessus sans atténuation. Les lobes de la cavité doivent rester sous 7.
- Les actes : pendant le profil du loquet, `body: 0.5` et `power` bas — à `body` 1 la caméra regarde à travers la cavité et ses ondes (non essayé). Le plan « et si » : `stuck` 1 puis `monitor` → 1 avec `fuse` encore à 1 (le fil du troisième s'allume en signal : vu), puis `fuse` → 0 et `spark` 0 → 1,2 → 0 sur quatre à six images.

## Ce qui n'est pas encore au niveau

- **L'éclaté large** : la plaque-héros, fondue à cette distance (trou de 2 px), est un voile pâle parmi d'autres couches ; elle ne devient « la plaque à trous » que sous d ≈ 100 (`meshPart`). Les crochets n'y sont pas visibles.
- **Le loquet de profil** : juste mais petit quand les deux crochets sont dans le cadre ; le geste (le nez du crochet tient le levier, se lève, le levier remonte) ne se lit vraiment que dans le plan serré. C'est la chaîne qui s'éteint (veille → noir) qui porte le plan large.
- **La plaque assombrie derrière la vitre** (`DIM` 0,55) : le macro dans la cuisine n'a été vu qu'avant ce réglage (plaque plus claire) ; elle y est maintenant gris moyen, trous orange.
- **Le cadre avant** est très sombre (il se lit par son arête et par la fenêtre) ; le film intérieur est discret ; la rainure du cadre intérieur ne se voit que de derrière.
- Grande ouverte, la porte entre de 2,5 cm dans le montant de la colonne (`HINGE` est sur l'arête arrière de la porte).
- L'ampoule est une vraie lumière sans ombre : elle éclaire aussi ce qui est plein dans la cuisine à moins de 70 cm.
- Rien n'a été vu en mouvement : `spin`, le fondu de `door`, les tirets des fils (5 cm/s, un neuvième de période par image), l'ouverture.

# 026 · Soyouz MS-10 — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/026-actes.md`. Les décors sont rendus : `docs/journal/026-model.md`, `026-launcher.md`, `026-sky.md` (l'habillage : `docs/journal/026-habillage.md`, quand il existe). **La voix est enregistrée** (91,1 s) : les repères tombent sur les vrais mots.

## Fixé (personne ne le change)

- **`POSE0`** est choisi sur planche et collé dans `world.js` : la candidate (a) recadrée — `{ tx: 0, ty: -1100, tz: 0, d: 6400, az: -28, el: -32, fov: 46, shift: -40 }` : la fusée vue d'en dessous, **la tête (la coiffe et ses moteurs) en zone haute** (y ≈ 530–770), la croix qui s'ouvre en bas, D au signal en bas à gauche. Les pieds des propulseurs et leurs jets passent sous y 1600 : rien d'important n'y est.
- **`FIRST`** : `sep` 0,25 et `bad` 0,4 (au lieu de 0,12 et 0,15) — la croix est déjà ouverte à l'image 0, D déjà de travers. L'acte 1 les fait avancer dès l'image 1 : `sep` 0,25 → 0,35, `bad` 0,4 → 1 **sur « lâche »** (`choc`). C'est le sujet qui bouge (règle des six points), pas la seule caméra : vérifie 0,3 et 0,7 s, la tête ne doit pas sortir du cadre ni passer sous l'en-tête.

## Les poses (vues sur planche par les décors, collées dans `VIEW`)

`inside`, `console` (l'ancienne regardait le dos du pupitre), `nozzle`, `torn` (la tête n'est plus sous l'en-tête), `apogee` (`el` 3 : à 12 le limbe passe derrière le module), `fall` (mesurée, pas vue), `chute`, `whole`, `exploded`, `motorsBench`, `shipBench`, `sensorsBench` ; nouvelles : `column` (pour `tilt` 7), `stackTrail` (la pile et sa traînée), `night` (le teaser du 027, la route à gauche sous le panneau `#next`). `head`, `towerUp`, `cross`, `strike`, `fault`, `pad`, `stack`, `ground` : bons tels quels.

## Ce que les décors dessinent (et que `plan.js` ne dit pas)

- Les quatre moteurs sont dessinés 1,3 fois plus grands : leurs centres à y ≈ 630 (et non `MOTORS.y` 615). Les grilles sont à 45° des axes (entre les deux demi-coquilles).
- La lampe « avarie » est en `[-40, 164.5, -31.1]` ; ta tête en `[-56, 77, -52.5]`, celle de ton équipier en `[4, 77, -52.5]`.
- Dans l'éclaté (`explode` 1), le nez et ses moteurs montent de **200** (et non 260), le module orbital de 85, les coquilles s'ouvrent à ± 260 en x, tournées de 34°, les capteurs sortent de 42 cm.

## Les rythmes des nombres

- `flown` : il fait vivre jets, traînées et l'air ; il avance dans **tout** plan de vol, ≈ 100 à 150 m par seconde de film (au-delà de 300, les traînées sautent) ; tenu quand le temps s'arrête.
- `impact` 0 → 1 (0,08 s) → 0,35 : l'éclat puis la braise (étincelles au-dessus de 0,4).
- La descente : `pitch` à 0 près du sol ; `retro` 0 → 1 → 0 pendant que `alt` est sous 0,005, la voilure encore pleine (`chute` 1) jusqu'au posé, pour que la poussière retombe.

## Ce qui n'est pas au niveau, et comment le filmer

- **Un jet en gros plan** (depuis `nozzle`) vient vers l'objectif : un voile vert. Pour « Les quatre moteurs tirent », prendre `VIEW.head` (vérifié).
- **L'équipage est minuscule dans l'éclaté d'ensemble** : « ton vaisseau, ton équipier, toi » se montre sur `shipBench`.
- **De loin, la fusée est un dessin fin** : elle se lit par ses jets, ses bords et la tête — jamais un plan large sans jet.
- **Le pas de tir est un dessin de traits** : plans brefs ; la fosse ne se lit pas à `el` 4.
- **La pièce faussée** prend un tiers du cadre à `d` 420 et son signal est plat : elle se lit à côté de la ferrure saine de B, voisine — garde les deux dans le cadre.
- **La courbe de la Terre** est douce à 50 km ; la steppe posée est presque nue ; le teaser du 027 est petit (`night`).
- Jamais regardés : `skin` entre 0,25 et 0,75, `free`, `press` 1, la descente en mouvement.

## L'habillage (posé, `src/habillage.js`, journal `docs/journal/026-habillage.md`)

- **L'image 0 n'est pas touchée** (vérifié : aucun pixel ne change avec et sans l'habillage).
- **La steppe** (suit `alt`, dessinée sous 12 m, et `retro`) : des touffes d'herbe autour du module posé, jamais sur lui ; les plus proches s'éclairent à la dernière poussée. L'atterrissage est de jour. **Au parachute, arrête `alt` à 0,015 au plus bas, puis pose 0,004 par la coupe sur `VIEW.ground`** : sinon les touffes entrent par le bas du cadre.
- **Le pas de tir la nuit** (suit `pad`) : deux tours d'éclairage derrière la fusée, les lumières du cosmodrome au loin, des étoiles. **Garde `pad` à 1 pendant la montée de MS-12** (le commentaire : « vous repartez ») : étoiles et cosmodrome le suivent.
- **Le teaser du 027** (suit `truck`) : deux crêtes au-dessus de la route — on lit une descente de montagne.

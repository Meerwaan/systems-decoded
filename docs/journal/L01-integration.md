# L01 · intégration des décors dans le contrat — journal (2026-10-15, soir)

Fichiers touchés : `episodes/L01-pare-brise/src/world.js`, `src/plan.js`, `docs/L01-actes.md`, et `src/car.js` (seulement `onScreen` et la signature de `buildCars`, à la demande de celui qui orchestre). `verre.js` n'a pas été touché.

## Intégré

**`plan.js`**
- `ST.hopper.at` = [−60, 0, 0] : la trémie au-dessus du bain, dans la voûte (x0 −120) ; la poche de `verre.js` disparaît d'elle-même.
- `ST.furnace.canal` = { half 130, floor 94, x1 1 060 } (le canal de `usine.js`, passé au four par `world.js` : `melt`, `spout`, `canal`) ; `throat` y 100 → 104 (la langue reste plus haut dans le canal, son dessus ≈ au niveau du bain de verre).
- `IMPACT.head` [−37, 4] → [−37, 22] ; `IMPACT.bubble` = [18, −30] (copie de la constante `BUBBLE` de `casse.js`, qui ne la lit pas encore).
- `WS.drawn` → { glass 0,4, film 0,22 } (reprise de `verre.js` : sinon fissures et tête flottent de 3-4 mm).

**`world.js`**
- `time` passé à : four, étenderie, portiques (découpe, sérigraphie, poseuse, capteurs), four de bombage, salle blanche, tour, gabarit de tête, four de trempe, soufflerie.
- Tapis chauds : `warm` sur les rouleaux (relevage → étenderie + 900) et sur la voie de trempe ; `heat` = `S.ribbon` / `S.sideGlow`.
- Deux fours distincts (bombage : 9 résistances, 2 zones, 3 hublots, cheminée ; trempe : 18 résistances, 4 zones, fente, sans cheminée) ; quatre portiques distincts (A-frames, pont + cadre à la taille du pare-brise, colonne, deux axes) ; soufflerie `angle` 12, `oscillate` 10 ; `exitBox` sur le bain.
- `down` en rampe (fonction `ramp`, jamais de saut) pour la molette, la raclette, la buse ; la poseuse : `travel` 0,5 fixe, ventouses qui descendent avec `open` puis `lift: S.open`.
- `makeHeadRig` et `makeOpticBench` sur le vrai verre (`wTop`, `rest` LINE.y + 1,5, `sag`, `sagV`).
- `count` (0–1) dans `FIRST` / `REST`, branché sur `striker.set({ square })`.
- `AT.doc` : l'établi des pièces (`pool` 0,05, `hero` 0).
- `buildGlass()` est construit AVANT `buildCars({ surface: glass.hero.onSurface })` : la tête se pose sur la surface même que dessine `verre.js` (dans `car.js`, `onScreen` utilise cette surface quand elle est donnée, l'ancienne formule sinon).
- `VIEW` : toutes les poses vues par les décors, commentées « seen » (avec l'état) ou « posed ». Remplacées : `cut` (molette), `print` (raclette), `optics` (d'en haut), `chip` (d 58), `blower` (de près), `hopper` (vise −60). Recalées : `POSE0` / `hook1` (ty 134, tz −36), `hook2` (132, −24), `hook3` (128, −39) ; `hook4` inchangée (plan large). Ajoutées : `web`, `lunge`, `tool`, `nickel`, `bubble`, `chipRun`, `benchClose`, `rollers`, `cutOut`, `bladesLine`, `screen`, `bendHot`, `autoclaveDoor`, `milk`, `scan`, `chamber`, `opticsClose`, `count`, `temperHot`, `stress`, `blowerSide`, `fall`, `kneel`, `light`. `floor` gardée pour le flacon seul.

**`docs/L01-actes.md`** : section « Ce que les décors ont changé » en tête (poses, mécanismes, défauts à contourner) ; trémie à −60 dans le rappel des lieux.

## Pas intégré

- La langue de verre ne passe pas entièrement au-dessus du fond du canal : la descente de `ribbonBottom` (`verre.js`) commence à `furnace.x1 − 30` et finit au début du bain ; entre x ≈ 1 025 et 1 060 elle passe ≈ 2 cm sous le fond (94). Un nombre du plan ne suffit pas : il faut que `verre.js` tienne la langue ≥ `ST.furnace.canal.floor` jusqu'à `canal.x1`.
- `casse.js` garde sa constante `BUBBLE` (même valeur que `IMPACT.bubble`) : pas mon fichier.
- La bande grise du sol de la halle en contre-plongée sur la trémie (usine, constat) : non traitée.

## Vérifié

- `npm run build -- L01` passe ; `look` sans erreur de page sur la voiture (accroche) et sur une planche de contrôle de la ligne et de l'établi (molette, poseuse, gabarit `drop` 1, témoin `count` 1, soufflerie, banc optique, trémie, brevet).
- Vu sur la planche de contrôle : la trémie verse maintenant dans la voûte ; la tête de 10 kg repose sur le pare-brise du gabarit ; le carré de comptage se pose sur le témoin ; le banc optique tient le pare-brise au-dessus de sa mire. La poseuse n'est pas dans le cadre de contrôle (pose à 400 cm) : pas jugée.
- Planche des candidates de la première image (`lunge` 1, `crash` 0,6, `web` 0,6, `rings` 0,6, t 0,04) : `hook1`–`hook4`, `web` (toile de près) et `web` avec `side` 300, tirée après `WS.drawn` et la surface de `verre.js` dans `car.js`. Dossier temporaire : `scratchpad/integ/L01-hook.jpg`. Le choix revient à celui qui orchestre.

## Images lues : 3 / 12

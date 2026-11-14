# 049 — ce que les décors ont changé (à lire avant d'écrire un acte)

1. **Première image : A, sous le téléphone** (`POSE0` de l'architecte gardé, `err` 0,6, `eta` 5,9). Le satellite n'y est pas : il entre au premier changement de plan.
2. **`VIEW` recalé** dans `world.js` : `chase`, `climax` (d 7000, non revu), `sign`, `branches` (nouveau), `exploded`, `chip`, `quartzBench`, `up`, `satSky`, `satBench` (éclaté), `clocks`. Poses de détail dans `docs/journal/049-route.md`, `049-model.md`, `049-satellite.md`.
3. **Route** (`route.js`) : `gap`, `branchL` / `branchR`, `ditch` (0,6 si trop fort), `sign`, `streak` (4 m → 4 km), `holder`. Le carrefour en T ne frappe qu'à `eta` ≤ 2 ; avant, ce n'est qu'une haie à l'horizon.
4. **Téléphone** (`model.js`) : `err`, `strike`, `map`, `screen`, `peek`, `explode`, `qBeat`, `tremble`, `quartz`, `litChip`, `litQuartz`, `bench`. La puce ne se lit qu'au plan `chip`, pas dans l'éclaté large. `quartzBench` exige `explode` 1.
5. **Satellite** (`satellite.js`) : `bench`, `sats` / `others`, `satGlass`, `satExplode`, `core`, `twin`, `beatSat` / `beatGnd`, `rings`, `w1…w4`, `spheres` / `err`, `dot`, `thread` / `ruler` / `travel` / `distance`, `litOsc` / `litClock`. Sur `high`, `rings` 0 (les anneaux y flottent) ; ils sont forts en `up` et près du téléphone.
6. **Pour `look`** : un plan du ciel demande `"set": 1` dans l'état, sinon l'image sort noire.
7. **Manque** : la flèche montante barrée que prévoyait `fin.js` n'existe pas — montrer autrement (ou `strike` / un panneau du kit).
8. **Habillage** : fermes, village à gauche, lunettes sur la planche de bord (tout suit `shell`). `main.js` coupe au-delà de 900 m.
9. **Point bleu** #3B8CFF gardé : seule couleur hors des trois, sur le point seul.

# 032 — à changer ailleurs (hors du dossier)

- `docs/catalogue-notes.json` (après le rendu) : deux fiches — `032/model.js` (la barre anti-panique, un système re-parenté sur un battant) et `032/salle.js` (une salle publique aux rayons X, son issue de secours, une foule qui pousse ; et l'escalier de 1883 au même endroit, `era`) ; `032/avion.js` est un modèle d'enveloppe de la cabine du L03 (40 lignes).
- `scripts/sd.mjs` (`script`) : une option `--words` qui imprime les mots et les souffles ≥ 0,22 s (je l'ai refaite à la main depuis `gen/episode.data.js`, comme au 021 et au 025).
- `kit/lib/build3d.js` → `addMesh` : une matière `glass()` n'a pas de `.color` et casse le build (« reading 'r' ») ; un garde (`material.color ?` …) éviterait le piège à chaque agent.

## acte1.js (30/10)
- `world.js`, `VIEW.system` → `system: { ...P, tx: CX, ty: CY, tz: CZ, d: 400, az: -36, el: 14, shift: 120 },` (d 190 : la barre déborde du cadre ; d 400 : la porte et sa barre seules, vu sur planche ; l'acte 2 coupe dessus, les deux suivent).
- Couture acte 1 → acte 2 : `litBar` 1 à `tobench` (l'acte 2 : `state: { ...BENCHED, litBar: 1 }`, ou l'éteint sur sa coupe).

## acte3.js (30/10)
- `episode.json` → `sfx` : `{"type":"hit","at":"n183-0.14","gain":-16,"pitch":0.7}` au lieu de `"n183-0.44"` (sur la coupe de « 183 », dans le souffle ; 46,80 tombe sur la queue de « fois »).
- `episode.json` → `sfx` : `{"type":"click","at":"sans-0.2","gain":-16}` au lieu de `"sans-0.36"` (sur la coupe de « Sans barre »).

## fin.js (30/10)
- `src/salle.js` l. 49 : `const SURGE = { w: (2 * Math.PI * 59) / 88.8, k: (2 * Math.PI) / 340 };` et l. 763 `Math.sin(time * 31.4)` → `Math.sin(time * (2 * Math.PI * 444) / 88.8)` (la vague de la foule et le tremblement du battant périodiques sur le film, comme la lueur de habillage.js : la boucle exacte).

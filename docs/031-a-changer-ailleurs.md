# 031 — à changer ailleurs (pour le chef de production)

- `scripts/sd.mjs` (`script`) : une option `--words` qui imprime les mots et leurs instants (déjà demandée aux 021 et 025 ; ici relue dans `gen/episode.data.js`).
- `kit/` (souhait) : `023/avion.js` sert deux fois ici et sert de base aux longs — s'il monte dans le kit, lui donner une option `{ world: false }` (pas d'île, pas de dôme, pas d'étoiles) et `{ palette: "neutral" }` (gouvernes, circuits et réservoirs à l'encre) : `world.js` du 031 le fait aujourd'hui par un parcours des enfants et des couleurs (`quieten`), fragile si le 023 change.
- `CLAUDE.md`, section des dossiers : une ligne pour le 031 (contrat écrit le 30/10, voix réelle 93,5 s, décors à lancer : `tcas.js`, `cockpit.js` ; pas de décorateur pour les A330 du 023, déjà habillés).
- Après les décors : `docs/031-actes-maj.md` (poses vues, défauts) et `POSE0` / `FIRST.gap` de la candidate gagnante collés dans `world.js`.
- Décorateur : rien à habiller dans le ciel (le 023 l'est) ; au plus le poste de pilotage (`cockpit.js`) : quelques boutons du pylône, une lampe de lecture — jamais devant les écrans.

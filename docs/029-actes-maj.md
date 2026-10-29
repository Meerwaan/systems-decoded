# 029 · Airbag d'avalanche — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/029-actes.md`. Les décors sont rendus : `docs/journal/029-pente.md`, `029-model.md`, l'habillage `029-habillage.md`. **La voix est enregistrée** (83,8 s ; reprise de « on l'ouvre » montée) : les repères tombent sur les vrais mots, la table de `npm run script -- 029` fait foi.

## Exigence de Merwan pour ce dossier

« Fais attention aux erreurs de son et aux images qui scintillent. » Aucun mouvement de caméra d'un quart de tour en une seconde (une coupe) ; longs trajets en `sine.inOut` ; plongées et reculs par rapport (`fromD`) ; ce que la caméra frôle est invisible ; la neige qui vole reste en traînées (c'est `rush` qui la règle : ne le monte pas à 1 sur un plan rapproché qui file vite). Aucun son de `sfx` n'est à toi : n'en ajoute pas.

## Fixé (personne ne le change)

- **`POSE0`** est choisi sur planche (22/10) et collé dans `world.js` : une variante de la candidate (d), ni (a) ni (c) — `{ tx: 0, ty: 40, tz: 0, d: 420, az: 60, el: -40, fov: 54, shift: 40 }` : tes skis en diagonale vus d'en dessous, la marche de la cassure en grande diagonale signal sous eux, le manteau de neige clair, la poignée veille sur ta poitrine, ta tête vers y ≈ 560 (hors de l'en-tête). (a) sort : le rideau de face se lit comme de la pluie et ta silhouette de face fait mannequin.
- **`FIRST`** : `rush` 0,35 (au lieu de 0,2) — la poudre vole déjà à l'image 0. L'acte 1 fait bouger le sujet dès l'image 1 : `crack` et `slab` avancent, `rush` monte vers 0,7 ; à 0,7 s, le rideau de poudre jaillit derrière toi (vérifié sur planche). Ne pousse pas la caméra vers ta tête : elle entrerait dans l'en-tête.
- La pente a été reprise (`docs/journal/029-pente.md`) : la neige se lit comme une surface, la cassure est une marche (tranche signal de 40 cm qui descend de 12 × `slab` cm), la poudre est un rideau de traînées qui monte derrière toi. **Vu de face (az ≈ 0–20), le rideau se lit comme de la pluie** : filme-le de trois quarts.

## L'établi (model.js) — les poses

Vues sur planche, collées dans `VIEW` : `cartBench`, `venturiBench` (l'image la plus forte, lisible à 270 px), `bagBench`, `whole`. Collées mais non vues : `exploded` (resserrée, `d` 250), `handleBench` (garde la poignée tirée dans le cadre), `bagFull` (reculée : à `d` 330 le ballon entrait dans l'en-tête). **Vérifie ces trois-là sur ta première planche avant de monter dessus.**

Positions à `explode` 1 : poignée (−1, 4, 37), cartouche (−6, 27, 34), opercule (−6, 41, 34), venturi (−6, 59, 34), ballon plié (−3, 77, 31). Le ballon plié est à `BAG.folded` = `[1, 23.3, -10.5]` (déplacé : il traversait le venturi).

## Ce qui n'est pas au niveau, et comment le filmer

- **L'éclaté d'ensemble est petit dans le cadre** : resserre-le (`exploded` à `d` 250 ou moins) ; une pièce nommée se montre sur sa pose rapprochée.
- **Sous la lumière signal (`mood` 1), la cartouche claire vire au brun** : sur l'établi, `mood` 0.
- **Le déclencheur en coupe ne se lit que de près** : « il perce une cartouche » sur `cartBench`, `pierce` sur le mot.
- **Le ballon vers `bag` 0,55** (silhouette en chou-fleur, deux lobes qui pouvaient se lire comme deux ballons) a été corrigé sans être revu : regarde 0,4 / 0,55 / 0,7 sur ta planche ; s'il se lit comme deux ballons, passe vite cet état.
- Les tirets du gaz et de l'air avancent déjà à 1/8 et 1/9 de leur période par image : `gas` et `draw` se montent en rampes `"none"` régulières, jamais un saut.

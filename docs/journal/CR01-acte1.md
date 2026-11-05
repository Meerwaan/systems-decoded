# CR01 · acte1.js — journal (agent acte, 05/11)

Lu : recette-agents, recette-actes, regles-image, CR01-actes (haut + § acte1 + couture), CR01-actes-maj, recette-compte-a-rebours, world.js, main.js, index.html, journaux canal / coeur / centrale / salle / da-v3, direct.js (API).

## Instants (voix réelle, résolus par ref.mjs)
choc 3,36 · promesse 4,35 · bouton 8,02 (coupe 8,02 − 0,08) · arrêter 9,00 · inverse 9,93 · toprincipe 10,71 · toloupe 12,28 · casse 13,08 · neutrons 13,92 · cassent 14,57 · atomes 15,24 · chauffe 16,16 · vapeur1 16,92 · toturbine1 17,76 · tofreiner 18,50 · freiner 18,76 · avalent 20,04 · totrap 21,03 · trap 21,96 · eau1 22,65 · changee 24,56 · piege:vapeur 24,96 · moins 26,04 · accelere1 27,16 · retiens 28,12 · tot1 28,95.

## Montage (1er jet)
Voir l'en-tête du fichier. Coupes : salle (bouton), canal (toprincipe), centrale (toturbine1), canal haut (tofreiner), combustible (totrap). Le principe en vert (`ok` 1) ; le piège `ok` 0 ; la vapeur rouge par `viol` sur « vapeur » (canal.js ne lit pas encore `viol` : « À changer ailleurs »).

## Planches (.cache/planches/CR01/acte1/, avec en-tête et zones) — 26 images lues / 26
- p1 (8) : accroche, poussée, recul sur le cœur entier (≈ 55 %), bouton vert qui s'enfonce puis rouge (≈ 30 %), plongée, loupe (noyaux ≈ 60 % de la largeur), neutrons. Raté : la poussée (d 248, az −47) envoyait le cœur dans la colonne des boutons → d 262, side 185.
- p2 (8) : `VIEW.fuel` (d 470–520) illisible à 270 px — le canal fait 13 % de la largeur, l'eau ne se distingue pas ; la colonne de barre en vert (`ok` 1) volait la vedette au combustible. → `ok` 0 dans le canal, vert allumé seulement sur « barres » (19,56) ; canal resserré.
- p3 (8) : `ok` corrigé ; combustible à d 290 encore trop loin.
- p4 (2) : combustible à d ≈ 200 : pastilles au centre, anneau d'eau clair, vapeur sombre à bulles au-dessus du front, neutrons ≈ 15 px — lisible. Poses gardées : `ring = { ...VIEW.fuel, ty +35, d 215, shift 0 }`, `trap = { ...VIEW.fuel, ty −20, d 190, az −64, el 8, shift 0 }` (poussée à 168, recul à 300 sur « Retiens »).

## Couture de sortie (tot1)
Canal, plan `trap` reculé à d 300, `steam` 0,62, `pLow` = `pHigh` 0,9, `flux` 1, `split` 1, `ok` 0, `rod` 0, `fault` 0 ; `viol` remis à 0 à `tot1` (la vapeur rouge est à cet acte).

## Un cran en dessous (franchement)
- 11,6 s : au milieu de la plongée, la tranche passe presque de face (mur de colonnes) — transitoire, 0,5 s.
- 18,5–21 s (« des barres qui avalent ») : avec `ok` 1, le déplaceur (`alarm`) passe au vert sous l'absorbant : deux pièces vertes, alors que seul l'absorbant avale. Le déplaceur rougira à `defaut` (raccord de sens), mais l'image est inexacte d'un cran.
- 22,6–24,5 s (« l'eau aussi avale des neutrons ») : poussée lente seule ; l'extinction d'une traînée dans l'eau (petit disque sombre, 0,42 s) non vérifiée à l'image à cet instant.
- Le piège n'a pas de rouge tant que canal.js ne lit pas `viol` (ci-dessous).

## À changer ailleurs
`episodes/CR01-tchernobyl/src/canal.js` — la vapeur en rouge alarme au mot « vapeur » de `piege` (l'acte pose `viol` 0 → 1 à 24,96 et le remet à 0 à `tot1`), jamais verte (pas `alarm()` : elle passerait au vert avec `ok`) :
- après `  const vapourMat = tinted(G.vapour);` (l. 291), ajouter :
```js
  vapourMat.emissive = new THREE.Color(RECON.alarme); // piege: the vapour in alarm red on « vapeur » (S.viol) — never green; the water stays light
  vapourMat.emissiveIntensity = 0;
  const VAP_BASE = new THREE.Color(G.vapour), VAP_RED = new THREE.Color(0x5c1714);
```
- dans `update`, après `      heal(dispMat, S.depuis);`, ajouter :
```js
      const vr = cl01(S.viol ?? 0);
      vapourMat.color.copy(VAP_BASE).lerp(VAP_RED, Math.min(1, vr * 1.4));
      vapourMat.emissiveIntensity = 0.9 * vr;
```
- `world.js`, commentaire de `FIRST` : `// \`viol\` 0 → 1 the margin violated: the salle's board bars (« 8 contre 15 ») turn red · canal: the vapour of \`piege\` turns red`

`npm run check -- CR01` : passe (0 erreur, 1 avertissement de bord de canvas déjà connu).

## Retouche du 05/11 (agent retoucheur, 12 images lues, planches `.cache/planches/CR01/acte1-retouche/`)
- **Première demi-seconde immobile, plage lente 0–3 s** → `scram` 0,12 → 0,5 en `glide(2.2, 0.5)` dès l'image 0 (les barres tombent franchement), `pHigh` 0,3 → 0,5 jusqu'au choc, `pLow` qui pulse (1 à 0,7 s, 0,86 avant la flambée), poussée de caméra en `glide(3, 0.5)`. Image 0 = `FIRST`/`POSE0` inchangés. Vérifié à 0,03 / 0,5 : les pointes des barres ont nettement descendu.
- **Plage lente 8–10,5 s** → l'AZ-5 s'enfonce lentement de `bouton` à « arrêter » (plus 0,22 s sec), orbite lente az +8° sur le plan. Vérifié à 9,4.
- **Heurté 11,6 s** → plus de plongée : poussée lente sur la tranche (d 1100 → 960), puis coupe dans l'axe sur la loupe à `toloupe` − 0,15 (lumière posée dans l'état de la coupe), loupe ouverte à −0,12. Vérifié à 12,1 (tranche entière) et 14,1 (loupe).
- **Plage lente 13–15,5 s** → la chaîne `split` sans arrêt (chaque pas court jusqu'au mot suivant), `flux` dès « neutrons ». Vérifié à 14,1.
- **Heurté 28,3 s** → le recul 168 → 300 part de « accélère » (27,06) sur 1,6 s au lieu de 0,7 s ; même pose à `tot1`. Vérifié à 28,3 (cadre) ; la fluidité se confirme au `qa` du prochain brouillon.
- **18,5–21 s, l'absorbant** → plan plus serré et plus bas (d 300, ty +10), `rod` 0,2 : la colonne verte occupe le centre du cadre, hors du HUD, seule pièce verte. Vérifié à 19,9 et 20,3.
- **22,6–24,5 s « l'eau aussi avale »** → NON corrigé : à 23,5 une seule traînée, aucune extinction lisible à 270 px (les neutrons meurent dans l'anneau en ≈ 5 cm, la tache fait 2,6–5,2 cm et dure 0,42 s). Essai `pLow`/`pHigh` 0,6 sur « eau » : sans gain, retiré.
- Vapeur rouge (`viol`) : lisible à 26,6 (rouge franc des deux côtés des pastilles).

### À changer ailleurs
`episodes/CR01-tchernobyl/src/canal.js` — que les neutrons avalés par l'eau se voient : `const PUFF = 0.42;` → `const PUFF = 0.7;` et, dans la tache, `writeFacing(PM, i, NX + 0.3, y0 + dy * sAbs + yOff, z0 + dz * sAbs, 2.6 + 2.6 * pa);` → `… , 4.5 + 4 * pa);` (à vérifier à 23,0–24,0 ; si c'est encore maigre, l'acte peut pousser à d 125 sur « eau »).

## Retouche 2 du 05/11 (agent retoucheur, 4 images lues, planches `.cache/planches/CR01/acte1-retouche2/`)
Mesures `qa` du brouillon avant → après : première demi-seconde 0,5 → 2,2 ; par seconde 0:0.5 1:0.3 2:0.3 → 0:2.2 1:1.3 2:0.9 ; plages lentes 0–3, 8–10,5, 12,5–15,5 → aucune ; heurté 17,2 (10,3) → hors du classement ; image parasite : aucune.
- **0–3 s** → vraie poussée sous le cœur (d 275 → 205, az −14, side 300, `glide(2.6, 1)`), le bas rouge bat fort (`pLow` 0,3 ↔ 1, période ≈ 0,55 s), `pHigh` → 0,7 ; `fromD` du recul 262 → 205. Image 0 = `POSE0`/`FIRST`. Vérifié à 0,03 / 0,5 / 1,6 / 2,2 / 3,2 : l'orbite az + poussait le cœur dans la colonne des boutons, az − le garde à gauche (bord droit ≈ x 930 à 3,2, le flanc gauche rogné à la fin de la poussée).
- **8–10,5 s** → poussée linéaire jusqu'à « arrêter », puis coupe basse de l'autre côté du bouton (az +40, el 12) sur « arrêter » : l'AZ-5 s'y enfonce en grand (arrêter → inverse), poussée continue. Vérifié à 8,5 / 9,3 / 9,95 / 10,6.
- **12,5–15,5 s** → loupe : poussée + orbite (d 165, az +12) en `glide(1.3, 0)`. Vérifié à 14,5.
- **Heurté 17,2** → le panoramique loupe → anneau remplacé par une coupe dans l'axe à `chauffe` − 0,05 (`split`/`flux` déjà à 1), puis poussée lente 250 → 215. Vérifié à 16,2 / 17,2.
- Fermeture de la loupe étalée (0,13 s → 0,4 s) : sans effet sur le heurté à **15,9 s (12,1)**, qui vient sans doute des neutrons (`flux`) dans le combustible, pas de la caméra — NON corrigé.

# 049 — satellite.js (le ciel) : journal du décor

## 14/11 — premier jet
- Écrit en entier contre le bouchon (API gardée : `buildSky() → { group, hero, bench, A, update }`, mêmes nombres lus).
- Le satellite plein : caisson gris moyen + radiateurs clairs à ailettes (±z), couvercle avec capteur et antenne, deux ailes (deux panneaux chacune, cellules sombres en relief, cadre gris), réseau de 12 hélices sur un disque clair (−y). Dedans : oscillateur (boîtier, four à quartz, bandeau veille = `litOsc`) et l'horloge atomique (deux chapeaux clairs, trois tirants, tube de verre, cœur veille qui bat, collier et une perle qui fait un tour par battement).
- `twin` : même horloge, cœur et perle `ink`, sur un socle sombre.
- Les trois autres et la constellation : aux rayons X (verre + `asShell`, arêtes encre, une étincelle veille = leur horloge) ; la constellation glisse sur des traces inclinées (≈ 0,3°/s).
- Anneaux : `Line2` additifs (épaisseur en pixels) qui s'élargissent en descendant vers le téléphone (PHONE.at) ; quatre têtes par satellite, chacune avec deux traînées ; un anneau marqué par `w1…w4` ; une étincelle sur le téléphone à l'arrivée.
- Sphères : coque de Fresnel (lèvre + méridiens au `fwidth`), rien sous le sol, s'efface quand la caméra s'en approche/entre ; cercles au sol en `Line2` (cœur + gaine). Couleur franche signal/veille selon `err`.
- Point bleu : disque, lèvre claire, halo qui respire (2,6 s), anneau de précision.
- Établi : fil (cœur + manchon) qui se déroule du satellite au téléphone (`thread`), colliers de règle tous les « 300 m » (12, un long tous les 4) qui apparaissent de haut en bas (`ruler`), anneau voyageur + deux traînées + halo (`travel`) qui allume chaque collier au passage, puis un trait plein (`distance`) qui recouvre les colliers.

## Planche a/b — ce qui a raté
- Reflet du softbox sur l'aile droite (aile en clearcoat) : une tache verte qui bave sur l'établi en az −36 → ailes mates (rough 0,58, env 0,35).
- Anneaux trop larges (r jusqu'à 11 m) : un mur de cercles près de la caméra → r = 70 + 420·u.
- Point bleu dessiné en rectangle (le plan tourné, `position.xy` au lieu de `xz`) → corrigé.
- Sphères en plongée (`climax`) : coque et bande au sol trop fortes, l'image n'était plus que bandes orange → coque effacée de R·1,05 à R·1,7 de distance au centre, bande au sol réduite.
- `high` noir : piège de `look` — à `at` 42 le squelette d'acte est sur l'établi ; donner `"set": 1` dans l'état.
- Le `twin` à x 44 sortait du cadre `clocks` (et l'aile passait entre les deux) → posé à (15, 3, 13), devant le coin du caisson.

## Planches c/d/e — ce qui tient
- `satBench` : le satellite plein se lit (caisson gris moyen, radiateurs clairs, ailes sombres à cellules, hélices claires), sur son halo encre ; éclaté (`satExplode` 1) : couvercle en l'air, horloge qui sort par le haut, oscillateur qui glisse vers l'avant avec son bandeau veille (`litOsc`), ailes écartées, réseau qui descend.
- `heart` (`core` 1) : l'horloge seule, énorme, sur son halo veille — le plus beau plan du fichier.
- `thread` : fil, colliers de règle, anneau voyageur ; `distance` recouvre les colliers d'un trait plein.
- `climax` : à `err` 1 / `spheres` 3, trois cercles signal se croisent exactement sur le point bleu dans le champ ; à `err` 0 / `spheres` 4, quatre cercles veille sur la voiture. Lisible à 270 px.
- `high` (avec `"set": 1`) : les quatre satellites (le héros plein, trois aux rayons X), la constellation, les sphères veille à méridiens. Les anneaux à `rings` 1 y font un nuage de cerceaux : à éviter sur ce plan (`rings` 0 ou très bas).
- `clocks` : `core` 1 + `twin` 1, les deux horloges côte à côte (veille / encre), les perles qui tournent.

## Poses qui cadrent (à coller dans VIEW)
- hook (le satellite visible en haut, par le pare-brise) : `{ tx: 6, ty: 106, tz: -66, d: 40, az: -28, el: -30, fov: 52, shift: -250, side: 0, roll: 0, drift: 0, dof: 0 }` ; avec `rings` 1, la variante `{ …, d: 46, az: -20, el: -38, fov: 56, shift: -320, side: 40 }` montre les anneaux qui descendent autour du satellite au-dessus du téléphone (forte).
- up (de la voiture vers le satellite, anneaux en tunnel) : `{ tx: 1001, ty: 2154, tz: -1708, d: 3234, az: -29, el: -35, fov: 50, shift: 0, dof: 0 }`.
- satSky (satellite + twin dans le cadre) : `{ tx: 1500, ty: 3077, tz: -2400, d: 1500, az: -40, el: 12, fov: 30, shift: 120, dof: 0 }` (d 1100 : les ailes débordent largement).
- satBench entier : d 200 ; éclaté : `{ tx: 0, ty: 84, tz: -10, d: 230, az: -36, el: 10, fov: 30, shift: 100, dof: 0 }` (à d 150 l'envergure de 64 déborde).
- heart : la pose de VIEW telle quelle, avec `satExplode` 1 (l'horloge sortie au-dessus du caisson, y ≈ 95) — sinon viser ty 81.
- clocks : `{ tx: 7, ty: 81, tz: -7, d: 110, az: -30, el: 8, fov: 30, shift: 120, dof: 0 }` avec `core` 1, `twin` 1 (le twin est à (15, 3, 13) dans le repère du satellite).
- trois signaux (w1–w3) : `{ tx: 900, ty: 1500, tz: -300, d: 7500, az: -75, el: 8, fov: 40, shift: 60, dof: 0 }` — à resserrer, le 3ᵉ anneau sort à droite.
- high et climax : les poses de VIEW telles quelles (avec `"set": 1` dans `look`).

## Pas encore au niveau
- Les anneaux en plan large (`high`, « trois signaux ») : des cerceaux qui flottent, qui disent « signal » mais pas « vers la voiture ». Ils sont forts en `up` et au hook.
- L'étincelle d'arrivée sur le téléphone (`w` → 1) a été réduite après une planche où elle lavait tout le cadre du hook : réglage non revu à l'image (budget d'images épuisé).
- Le twin dans le ciel est un objet posé à côté du satellite (socle compris) : il se lit comme « une horloge », pas comme « restée au sol ».
- Pas de flèche montante barrée (fin.js la mentionne « si satellite.js la fournit ») : non fournie.

## À changer ailleurs
- `world.js` › `VIEW` : remplacer `up`, `satSky`, `satBench`, `clocks` par les poses ci-dessus ; `POSE0` : la première ligne « hook » si la candidate A garde le satellite en haut du cadre (sinon il n'est pas dans le cadre : S1 est à 47° de haut, 30° à droite).

Images lues : 32 (planches a 8, b 8, c 8, d 4, e 4) — deux de plus que le budget.

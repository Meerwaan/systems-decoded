# HS04 · acte3 (v2, 27/10) — tient → tir

Fichiers : `episodes/HS04-porte-avions/src/acte3.js`, `src/world.js` (seul à y toucher).

## Monté
- `tient` / `test` : plans v1 gardés, recalés sur les repères ; « La pression monte » n'existe plus → `press` 1 sur « jette », plan cylindres jusqu'à `tir − 0,12`.
- `tir` (49,51 → 55,29), loi du L04 c2 : navette `power1.in` de « casse » + 0,03 à « s'arrête », puis l'avion seul à la vitesse d'arrêt (`run`), montée `jetAt` + `alt` 4 sur « Tu voles ».
  1. 49,39 · gorge (VIEW.neck) : `broken` 0,3 en deux images sur « casse », puis 1 ; coupe à casse + 0,1 (au-delà, la pièce cassée est sombre sur sombre).
  2. 50,13 · `gearRun` : train avant + navette de bâbord, la demi-pièce verte pend : visée suivie (`track`, translation pure).
  3. 52,17 · `chase` : de l'arrière-bâbord, haut, suivi : l'avion grand, la proue arrive (le plan le plus lisible).
  4. 53,33 · `fly` : de l'avant-bâbord, suivi : la proue passe sous l'avion sur « s'arrête sous toi », puis le noir, l'avion cabré sur « voles ».
  - noir `D.cliff(D.breath("tir$"))` = 55,32 ; tout reverrouillé sous le noir (+0,15 s).
- Aucun `ride` (main.js n'en donne pas) : chaque plan suivi translate sa visée avec la loi (`launchZ`, `track(t1, t2)`), la caméra ne tourne jamais.
- Fils : `curiosite$` 1 · `scene$` 2 · `vapeur$` 3 (= repères fil1-3 du son) · « casse » + 0,25 → 1.
- `world.js` : exporte `SHUTTLE_STOP`, `BOW_EDGE` ; `L04_AT` casse 175,7 · chariot 179,1 · deux 182,6 · arrete 184,0 · vol 185,9 ; `VIEW.gearRun`, `chase`, `fly` ; règle des verrous réécrite (tombent pour `tir` seul) ; `kmh`/`kmhOn` documentés.

## Un cran en dessous
- 49,98–50,1 : l'éclat de la gorge se lit mal (flou vert, deux images) ; la casse se lit surtout sur la demi-pièce pendante du plan 2.
- 54,5 → 55,3 : l'avion seul sur fond noir (la mer ne se voit pas) ; la montée est faible.
- Pas de `D.punch` dans `tir` (la coupe tombe 0,1 s après « casse »).

## À changer ailleurs
- `src/main.js`, readouts de `#hud-count` (l'en-tête « Ton Rafale » 0 → 240 → « En vol ») :
  `D.readout("hud-count-l", () => (D.W.kmhOn > 0.5 ? "Ton Rafale" : D.W.yt > 0.5 ? "Réponses" : "Fils ouverts"));`
  et en tête de `hud-count-v` : `if (D.W.kmhOn > 0.5) { const air = D.W.kmh < 0; count.style.color = air ? "#5cffb0" : "#ff5b2e"; return air ? "En vol" : \`${Math.round(D.W.kmh)} km/h\`; }`
- `src/acte2.js` l. 72 : `now(t.lancer + 0.25, { fils: 1 })` → `{ fils: 2 }` (trois fils ouverts avant le paiement de la vapeur).
- `episode.json` → `sfx` : `drop` + `boom` sur « casse » (point 9) : `{"type":"drop","at":"tir:casse","pre":0.55}` (forme du L04 à `release`), `{"type":"boom","at":"tir:casse","gain":-14,"size":1}` (gain à l'oreille).

## Images lues : 3 planches (24 vignettes).

## Retouche du 27/10
- 53,3 → 55,3, Rafale minuscule sur du noir (vue `fly` az −120, d 6000, tournée vers l'arrière, ciel sombre) → deux plans suivis qui regardent VERS l'avant, dans l'aube : A `LOW` (flyAt → tu − 0,12 ; az −52, el 3, d 2700 → 2500, `lights: 1`) : l'avion grand, la proue orange passe dessous sur « s'arrête », l'horizon signal derrière ; B `SKY` (tu − 0,12 → noir ; az −16, el −6 → −8, d 3000 → 2700, ty suit `climbY` + 400) : l'avion cabré, clair sur le halo de l'horizon, la mer dessous. `lights: 0` reverrouillé sous le noir. Vérifié à 53,4 · 53,9 · 54,4 · 54,8 · 54,9 · 55,2 · 55,3 · 55,5.
- Noir de 54,2 → plus rien de presque noir avant `D.cliff` (55,32) ; à 55,5 seul le noir du cliff. À reconfirmer par `qa` sur le prochain brouillon.
- `check` passe (2 avertissements de contraste à 34,95 s, nav de l'en-tête, antérieurs).

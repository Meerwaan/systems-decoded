# L07 · fabrique.js — journal du décor

## Ce qui est fait (14/11)
L'usine aux rayons X, cinq postes le long de +x (machines en `xray` + `asShell`, traits fins ; sol = grille, pas de dalle), PLEINS : le liquide, la suie, la préforme, la goutte, le fil, les bobines, les roues, les mandrins et le brûleur.

1. **Le liquide** (x = 0) : cuve aux rayons X ; le liquide translucide et sa **surface miroir** (anneau lisse, frémit au shader avec `boil`) ; bulles (instances, `boil`) ; **dépôt signal** au fond (`dregs`, plus franc avec `boil`) ; colonne à plateaux ; tuyau colonne → x 620 → descente → bloc-vanne au tour ; vapeur = traînées d'encre (`makeStreaks`) qui montent la colonne puis filent dans le tuyau (`vapour`).
2. **Le tour** (x = 1600) : tige sur deux mandrins à trois mors (tournent : `spin`), lit, poupées, hotte ; chariot du brûleur qui va et vient (période 6 s, ± `LATHE.travel/2`, garé au centre quand `flame` = 0) ; flamme signal (deux cônes + halo, vacille) ; **fumée blanche** = traînées qui montent et s'enroulent autour du corps + grains (`makeMotes` en traînées) ; `mood` × `soot` : quelques points signal dans la fumée (« en atomes »). **Corps de suie** : rayon tige → `LATHE.body/2` avec `deposit`, couches = anneaux fins sur les cônes des bouts et sur la coupe ; un quart **écorché** (face caméra) s'ouvre avec `doped` (le coin plein s'efface) : cœur (r < `coreBody/2`) teinté veille, son liseré veille ; `dust` : un point signal entre deux couches, sur la coupe.
3. **Le four** (x = 3200) : four tubulaire vertical (enveloppe chauffée de dedans, cinq résistances signal), tube de quartz, potence ; le corps pend à sa tige et descend (`sink`) ; `chlorine` : traînées qui montent dans le tube ; **`sinter`** : le blanc devient clair **du bas vers le haut** (front qui monte, anneau signal sur le front), la partie claire est plus mince (`SINTER.clear`), le cœur veille visible dedans ; `water` : points signal (sur la suie, ou dans le verre clair), qui montent et s'éteignent ; `bubble` : bulle signal dans le verre ; `section` : le bout poli, disque de gaine + **disque du cœur veille** (même dessin que la face de la fibre).
4. **La tour** (x = 4800) : ossature quatre poteaux, cinq planchers en caillebotis (le 4ᵉ porte le four : la goutte pend dessous, à l'air), escalier extérieur côté −x, contreventement, armoire ; avance en haut (rails, vis, moteur, chariot qui descend avec `feed` : la préforme raccourcit, sa pointe reste au four) ; préforme claire + cœur veille ; **cône** dans le four qui sort de 28 cm sous lui (chauffé signal → blanc à la pointe, `heat`) ; four (enveloppe, alésage et résistances signal, halo sous lui) ; **goutte** (volume : plus blanche face à l'œil) qui se forme (0 → 0,3), s'étire avec son fil (→ 0,7), tombe (→ 1, accélère) ; **fil** (`draw`) : nu = encre lumineuse, enduits = plein clair ; marques qui défilent (tirets 3/60 cm, 240 cm/s × `flow`) ; trait de 2 px dessous (lisible de loin) ; **jauge** : deux faisceaux veille croisés + nappe, émetteurs/récepteurs pleins, réglette et curseur qui suit `diam` (veille → signal franc au-delà de |0,5|), le fil s'épaissit/s'amincit sous `diam` ; **deux pots** (résine molle / dure, pleines), le fil grossit (0,6 → 1,25 → 1,75 cm) ; **tunnel UV** : quatre caissons, deux tubes + `makeLamp` chacun, s'allument de haut en bas avec `uv` ; poulie, cabestan (bandage noir), bobine (`wind`) ; `flaw` met aussi un point signal discret sur cette bobine (« une fissure a pu se glisser »).
5. **Le test** (x = 6400, fibre à y = 110) : table, plaque arrière + halo très doux derrière les roues ; bobines débitrice et réceptrice ; deux paires de roues (moyeu acier, bandage noir, **anneau veille = ça tient**, se serrent de 1 cm avec `tension`) ; la fibre est UN tube au shader : mou entre les paires à `tension` 0, tendu à 1 ; impulsions veille (tête claire + traîne, 180 cm/s × `flow`, période 70) ; `flaw` : éclat signal au point de casse ; **`claque`** : la fibre s'ouvre au point, les deux bouts sautent en se relevant, éclair blanc à l'endroit (0 → 0,08 → 0,35 de `claque` : deux images si `claque` 0 → 1 en 0,15 s) ; plus d'impulsion au-delà de la casse ; `echo` 0 → 1 : une bande veille traverse la bobine réceptrice, le point signal du défaut s'allume à 0,72, puis 1 → 2 l'écho (plus faible) revient de là.

Ce qui a raté puis corrigé : enveloppes des fours trop chauffées (des « murs orange ») → chaleur de coque ÷ 2 à ÷ 3, la couleur reste dans l'alésage et le halo ; la goutte se formait dans le four (pointe à 1 430 < bas du four) → pointe sortie de 28 cm, plancher sous le four ; la goutte était un disque plat → shader à volume ; vapeur invisible → traînées plus larges et plus claires ; flash de casse qui lavait l'image → 24 cm ; jauge masquée par un poteau à az −40 (diagonale) → az −18.

## Nombres de l'état (lus seulement)
`boil` surface + bulles + dépôt · `vapour` traînées colonne/tuyau · `flame` flamme + chariot qui voyage · `soot` traînées + grains · `spin` mandrins + tige (vitesse) · `deposit` rayon du corps · `doped` coupe ouverte + cœur veille · `dust` point signal · `sink` descente au four · `sinter` front blanc → clair · `chlorine` traînées · `water` points signal · `bubble` bulle · `section` bout poli, cœur allumé · `draw` le fil (et ses marques) · `drop` goutte · `heat` four de la tour + cône chaud · `feed` la préforme descend · `gauge` faisceaux · `diam` dérive · `coat` 0/1/2 · `uv` tunnel · `wind` poulie, cabestan, bobines, roues du test (vitesse) · `tension` · `flaw` · `claque` · `echo` · `pulse`, `flow` impulsions du test (+ vitesse des marques de la tour) · `mood` points signal dans la fumée.

**`spin`, `wind`, `flow` sont des vitesses** : angle = temps × vitesse. À changer par `now` (ou sur une coupe), jamais par un `tl`/`st` étalé : à t ≈ 300 s, une rampe ferait tourner la pièce des centaines de tours en une seconde. « `spin` ralentit » (c2 `craie`) → un `now` à une valeur plus basse.

## Poses vérifiées (sur planche), prêtes pour VIEW
- still (cuve + colonne, vapeur visible) : `{ ...P, tx: STILL.x + 120, ty: 230, tz: 0, d: 800, az: -28, el: 14, ...SHARP }` (la pose du bouchon coupait peu, mais la cuve y est petite)
- lathe : celle de VIEW est bonne (d 520, az −30, el 14 ; corps ≈ 50 % de la largeur).
- latheCut (coupe dopée, `deposit` 0,75, `doped` 1) : `{ ...P, tx: LATHE.x + 20, ty: LATHE.y, tz: 0, d: 300, az: -30, el: 18, ...CLOSE }`
- sinter : `{ ...P, tx: SINTER.x, ty: 300, tz: 0, d: 760, az: -34, el: 8, ...SHARP }` (corps descendu, `sink` 1)
- preformEnd (corps REMONTÉ, `sink` 0, `sinter` 1, `section` 1) : `{ ...P, tx: SINTER.x, ty: SINTER.top - SINTER.len / 2 + 5, tz: 0, d: 130, az: -30, el: -38, ...CLOSE }` — la pose actuelle (ty 260) ne vise le bout que pour `sink` ≈ 0,8 ; à `sink` 1 le bout est à y = 160.
- towerWide : `{ ...P, tx: TOWER.x + 60, ty: 950, tz: 0, d: 4300, az: -30, el: 6, ...SHARP }` (tour ≈ 85 % de la hauteur ; le four du frittage entre au bord gauche)
- towerTop (préforme + cœur, four) : `{ ...P, tx: TOWER.x, ty: 1560, tz: 0, d: 760, az: -34, el: 4, ...SHARP }`
- drop : `{ ...P, tx: TOWER.x, ty: 1380, tz: 0, d: 260, az: -30, el: -6, ...CLOSE }` (0,3 / 0,7 ; à 1 + `draw` 1, d 300)
- proportions (le cône chaud dans l'alésage, `draw` 1) : `{ ...P, tx: TOWER.x, ty: 1440, tz: 0, d: 300, az: -30, el: 2, ...CLOSE }`
- gauge : `{ ...P, tx: TOWER.x, ty: TOWER.gauge, tz: 0, d: 260, az: -18, el: 12, ...CLOSE }` (faisceau ≈ 43 % de la largeur)
- coatCups, uvLamps, capstan, proof, proofBreak : celles de VIEW sont bonnes (proofBreak : d 120 pour l'éclair, d 160 pour les deux bouts à `claque` 1).
- echo (la bobine vue de côté, sinon le flasque cache tout) : `{ ...P, tx: PROOF.x + PROOF.takeup[0], ty: PROOF.y - 33, tz: 0, d: 240, az: -70, el: 22, ...CLOSE }`

## Première image et miniature
- **Miniature** (`thumb`) : `cam { tx: TOWER.x, ty: 1392, tz: 0, d: 140, az: -28, el: -10, fov: 34, shift: 0, side: 0, roll: 0 }`, `state { ...AT.usine, heat: 1, drop: 0.5 }`. La goutte (≈ 35-40 % de la hauteur, volume orange à cœur blanc), le cône chauffé à blanc qui sort du four, le dessous du four orange en haut : une grande surface orange franche. Vérifiée à ty 1400 / d 130 (la goutte touchait le bord bas) : la pose donnée descend un peu, non revue.
- **hook5** (entre les roues) : `{ ...P, tx: PROOF.x, ty: PROOF.y, tz: 0, d: 300, az: -12, el: 8, fov: 40, ...SHARP }`, `state { tension: 1, flaw: 1, wind: 1, pulse: 1 }` — la fibre ≥ 60 % de la largeur, quatre roues aux anneaux veille, l'éclat signal au milieu, les impulsions. Lisible.
- **hook3** (sous la goutte) : le meilleur essai `{ ...P, tx: TOWER.x, ty: 1370, tz: 0, d: 260, az: -30, el: -24, fov: 50, ...SHARP }`, `drop` 0,8, `heat` 1 : la goutte qui tombe avec son fil sous le four aux résistances, mais elle est petite (≈ 8 % de la hauteur) et un poteau clair barre la gauche. Plus bas (el −48 à −62) : les caillebotis et la jauge encombrent. **Faible** : pas au niveau d'une première image.

## Ancres
`tank` = la surface du liquide (pas le haut de la cuve) ; `burner` et `flame` sont sur le chariot du tour (elles voyagent avec lui ; le bouchon mettait `burner` à `STILL.burner`) ; `drop` suit la goutte ; `sinterBody` / `preformEnd` suivent le corps ; `takeup` = centre de la bobine réceptrice (y local −33).

## Pas encore au niveau
- hook3 (voir plus haut).
- towerWide se lit (four rouge en haut, tunnel UV, bobine en bas) mais la tour reste une silhouette fine à 270 px.
- Le cône de la préforme : on voit le cône chaud, pas le cœur au centre de la pointe (`proportions` de c3) — le cœur veille s'arrête au début du cône.
- Non revus sur planche (budget d'images dépassé) : la miniature à la pose finale, `stillLiquid`, la poussière de près, `echo` 1 → 2.

## À changer ailleurs
`episodes/L07-fibre-optique/src/world.js`, dans `VIEW` (remplacer les lignes existantes, ajouter les nouvelles) :
```
  still: { ...P, tx: STILL.x + 120, ty: 230, tz: 0, d: 800, az: -28, el: 14, ...SHARP },
  latheCut: { ...P, tx: LATHE.x + 20, ty: LATHE.y, tz: 0, d: 300, az: -30, el: 18, ...CLOSE },
  sinter: { ...P, tx: SINTER.x, ty: 300, tz: 0, d: 760, az: -34, el: 8, ...SHARP },
  preformEnd: { ...P, tx: SINTER.x, ty: SINTER.top - SINTER.len / 2 + 5, tz: 0, d: 130, az: -30, el: -38, ...CLOSE },
  towerWide: { ...P, tx: TOWER.x + 60, ty: 950, tz: 0, d: 4300, az: -30, el: 6, ...SHARP },
  towerTop: { ...P, tx: TOWER.x, ty: 1560, tz: 0, d: 760, az: -34, el: 4, ...SHARP },
  drop: { ...P, tx: TOWER.x, ty: 1380, tz: 0, d: 260, az: -30, el: -6, ...CLOSE },
  proportions: { ...P, tx: TOWER.x, ty: 1440, tz: 0, d: 300, az: -30, el: 2, ...CLOSE },
  gauge: { ...P, tx: TOWER.x, ty: TOWER.gauge, tz: 0, d: 260, az: -18, el: 12, ...CLOSE },
  echo: { ...P, tx: PROOF.x + PROOF.takeup[0], ty: PROOF.y - 33, tz: 0, d: 240, az: -70, el: 22, ...CLOSE },
  thumbDrop: { ...P, tx: TOWER.x, ty: 1392, tz: 0, d: 140, az: -28, el: -10, fov: 34, ...SHARP },
  hook3: { ...P, tx: TOWER.x, ty: 1370, tz: 0, d: 260, az: -30, el: -24, fov: 50, ...SHARP },
  hook5: { ...P, tx: PROOF.x, ty: PROOF.y, tz: 0, d: 300, az: -12, el: 8, fov: 40, ...SHARP },
```
Et dans `docs/L07-actes.md` (c2, c3) : `spin`, `wind`, `flow` se changent par `now`, jamais en rampe ; `preformEnd` se filme corps remonté (`sink` 0).

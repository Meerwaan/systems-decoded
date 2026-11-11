# L06 · model.js — journal de l'agent décor (10/11)

Fichier : `episodes/L06-blackout/src/model.js` (seul fichier touché). Planches : `.cache/planches/L06/model/` (`L06-model-a…f.jpg`, essais `a…f.json`). `npm run check -- L06` passe. 30 images lues.

## Ce qui est construit

Interface du bouchon gardée (`buildModel() → { rotors, dial, lw, hero, sync, report, update(S, time, px, ctx) }`, mêmes noms d'ancres). `update` ne met à jour que ce que `ctx` montre (établi 0 : alternateurs + couplage ; cadran : CARTE ou établi 0 ; établi 1 : ligne ; QUARTIER ou établi 2 : héros ; établi 3 : rapport). Aucune allocation dans `update`.

- **Turbo-alternateurs** (× 3, géométries partagées) : bâti, stator en deux demi-coques nervurées (carcasse, circuit magnétique, têtes de bobines, plan de joint boulonné), rotor d'acier clair à six encoches larges, arbre, accouplement, flasque et MARQUE veille (barre sur la face −x + trait sur la jante), index fixe sur potence au-dessus de chaque flasque, turbine : carter inférieur ouvert, tambour conique, cinq roues de dix aubes sous virole (36° de pas : 4,8° par image = 1/7,5 du pas ; aucune arête dessinée sur ce qui tourne hors de l'axe). Machine Ouest seule : vanne d'admission, flèches `drive` / `brake`, trois couches `res`.
- **Cadran de fréquence** : centre clair mat éclairé (+ plancher d'émission), couronne sombre à graduations claires, « 50 » sur la couronne, trois aiguilles sur un moyeu.
- **Landesbergen–Wehrendorf** : deux portiques d'extrémité, deux portiques de ligne, UN conducteur de lumière (shader), deux tores de mesure, deux armoires de relais identiques, disjoncteur de Wehrendorf, deux jeux de barres superposés et le couteau du coupleur.
- **Héros** : quatre cellules HTA, le relais sur la première, dix drapeaux sur un rail sous le relais, le disjoncteur sur chariot (trois pôles, le plus proche écorché sur ses contacts ; sur son flanc −x le mécanisme : levier, ressort, verrou).
- **Couplage**, **rapport** : voir les nombres.

## Chaque nombre de l'état

- `rotors` 1 / 2 / 3 : machines Nord-Est (z −115) et Sud-Est (z +115) visibles. `turnW/E/S` : angle de marque = `ROTOR.spin × time + turn*` (positif = horaire vu du bout −x). Toute la ligne d'arbre tourne avec la marque (rotor, accouplement, roues de turbine).
- `altOpen` : la demi-coque haute du stator monte de 58 cm, la turbine (carter, roues, vanne, flèche `drive`) recule de 46 cm. `altNamed` 1 turbine · 2 rotor · 3 stator : émission veille douce + arêtes veille.
- `drive` : flèche veille autour de l'arbre entre stator et turbine (rayon 22). `brake` : flèche signal entre flasque et stator (rayon 28 : elle dépasse du flasque, donc se voit du bout −x). `gov` : la bague veille de la tige de vanne monte de 9 cm et s'allume. `res` 0 → 3 : trois filets veille empilés sur le flanc +z du bâti.
- `dial` : fondu du cadran. `zone` : l'aiguille principale lit `hzW` (0) ou `hzE` (1). `needles` 3 : trois aiguilles (`hzW` large et longue, `hzE`, `hzS` plus fines et plus courtes). Une aiguille est sombre dans la bande ± 0,18 Hz, **signal** dehors. `band` : deux arcs veille (sur la lunette, et au bord intérieur de la couronne). `marks` : calque des seuils (traits + 49,5 · 49 · 48,5 · 48 ; 47,5 en signal).
- `amps` : les deux aiguilles (0 → 3 200 A sur 240°) ; le conducteur passe d'ink à signal autour de 1 795 A. `markRwe` / `markEon` : la zone rouge du cadran (toujours là, de 2 100 / de 3 000 à la fin de l'échelle, sombre) s'allume et le chiffre « 2 100 » / « 3 000 » apparaît SOUS le cadran (signal). « 1 795 » est gravé petit sur le cadran de Wehrendorf.
- `lwTrip` : la tige du disjoncteur recule de 7 cm (0 → 0,22), éclair localisé (blanc + halo signal, pic vers 0,06–0,1), volet signal sur l'armoire RWE (0 → 0,12), les aiguilles retombent à 0 (0,08 → 0,45), la lumière du conducteur meurt depuis le disjoncteur vers les deux bouts (front à 440 cm × `lwTrip`). `volt` 1 → 0,5 : la lumière du conducteur s'enfonce. `bars` : les deux barres et leurs départs s'allument (ink). `couple` : le couteau du coupleur se ferme (il s'ouvre vers −z). `lwNamed` 1 armoire E.ON · 2 armoire RWE · 3 barres (leurs supports) · 4 coupleur (ses mâchoires).
- `hero` : voyant veille du relais, qui respire (0,24 Hz). `setpt` : l'index tourne de 47 à 49 et « 49 » apparaît (veille). `precision` : secteur signal ± 0,15 Hz autour de l'index. `heroOpen` : 0 → 0,3 le capot-cadre du relais et la porte de la première cellule s'écartent et s'effacent ; 0,2 → 1 le chariot du disjoncteur SORT de 64 cm (position essai) ; > 0,85 le cordon du relais au chariot apparaît. `clac` : verrou (0 → 0,25), levier 34°, ressort qui se détend, contact mobile qui descend de 8 cm (ease-out), contacts veille, éclat veille, cordon et volet du relais veille, lame du synoptique de la porte (si elle est là) ouverte et veille, indicateur de face du chariot. `steps` 0 → 4 : portes de la cellule i en veille + barre-voyant en tête. `dep` : huit drapeaux tombent l'un après l'autre et passent veille, deux (n° 4 et n° 9) restent debout, ink.
- `sync` : fondu du dispositif (seulement si `rotors` ≥ 2) + fenêtres ± 10° sur les DEUX flasques, calées sur la marque Ouest. `tryK` : l'anneau se remplit (horaire). `fail` : anneau signal + éclat signal. `closed` : les deux tiges se rejoignent, les bras passent veille.
- `page` 0 fermé · 0 → 1 la couverture et les premières pages se retournent (deux causes à droite) · 1 → 2 un feuillet tourne (tableau à deux colonnes : deux barres inégales, aucune valeur).

## Ce qui a raté, et pourquoi

- Flèches `drive` / `brake` de rayon 15 : invisibles du bout −x (derrière le flasque, r 22) → rayons 22 et 28.
- `res` à k 1,95 sur 210 cm : une dalle verte → 0,89 au plus. Barres de Landesbergen à 1,55 : dalle blanche → 1,0.
- Gris d'origine trop sombres (armoires et cellules noires, bordées de traits) → remontés d'un tiers.
- Coupleur à z +46 : caché derrière l'armoire E.ON → passé à z −46.
- Disjoncteur de Wehrendorf à x −128 (bouchon) : caché par l'armoire depuis az −30 → **x −104** (l'ancre suit).
- Lueur permanente dans l'intervalle des contacts du héros : elle bouchait l'intervalle → un éclat puis presque rien ; l'intervalle sombre entre deux disques veille se lit.
- Premier `look` : `europe.js` sans export (en cours d'écriture ailleurs) ; attendu.

## Poses (prêtes à coller dans `world.js · VIEW`)

```js
  // BENCH · spot ALT
  alt: { ...P, tx: 5, ty: ROTOR.axisY + 2, tz: 0, d: 400, az: -38, el: 11, ...SHARP }, //                     testée
  altOpen: { ...P, tx: 20, ty: ROTOR.axisY + 20, tz: 0, d: 520, az: -30, el: 13, ...SHARP }, //               testée à d 680 (petit) : 520 non testée
  altDial: { ...P, tx: -150, ty: ROTOR.axisY, tz: -30, d: 420, az: -64, el: 8, ...SHARP }, //                 testée (peut se resserrer vers 340)
  threeRotors: { ...P, tx: ROTOR.flange.x - 13, ty: ROTOR.axisY - 2, tz: -10, d: 360, az: -72, el: 8, ...SHARP }, // testée ★
  dialC: { ...P, tx: DIAL.bench.at[0], ty: DIAL.r + 8, tz: DIAL.bench.at[2], d: 150, az: -52, el: 4, ...CLOSE }, //   testée (band 1, marks 1)
  // flange, syncC, dialMap : inchangées (syncC et dialMap testées, flange non)
  // BENCH · spot LW
  lwWide: { ...P, tx: 20, ty: 55, tz: 0, d: 470, az: -14, el: 12, ...SHARP }, //                              testée à 540 (petit)
  twoDials: { ...P, tx: 0, ty: 44, tz: 40, d: 375, az: -4, el: 6, ...SHARP }, //                              testée à 345 (chiffres lus, armoires coupées au bord) ★
  relayRwe: { ...P, tx: -LW.half + 25, ty: 52, tz: 35, d: 190, az: -30, el: 6, ...CLOSE }, //                  testée ★ (cadran + disjoncteur à côté)
  relayEon: { ...P, tx: LW.half - 25, ty: 52, tz: 35, d: 190, az: 24, el: 6, ...CLOSE }, //                    miroir, non testée
  breakerRwe: { ...P, tx: -102, ty: 56, tz: 0, d: 120, az: 15, el: 8, ...CLOSE }, //                          testée (az −20 : l'armoire bouche le cadre)
  bars: { ...P, tx: LW.bars.x - 5, ty: LW.y - 2, tz: -18, d: 220, az: -40, el: 14, ...CLOSE }, //              testée (l'armoire E.ON au premier plan)
  // BENCH · spot HERO
  heroW: { ...P, tx: -10, ty: 100, tz: 20, d: 470, az: -34, el: 8, ...SHARP }, //                              testée (heroOpen 0 et 1)
  heroRelay: { ...P, tx: HERO_BENCH[0] + HX, ty: HERO.relay.at[1], tz: HERO_BENCH[2] + 14, d: 72, az: -24, el: 4, ...CLOSE }, // testée à 95 ★
  heroBreaker: { ...P, tx: HERO_BENCH[0] + 22, ty: 62, tz: HERO_BENCH[2] + 33, d: 178, az: -72, el: 5, ...CLOSE }, // testée ★ — état { heroOpen: 1, clac: 0 → 1 }
  heroFlags: { ...P, tx: HERO_BENCH[0] + HX, ty: 130, tz: HERO_BENCH[2] + 3, d: 150, az: -28, el: 2, ...CLOSE }, //  testée (dep 1)
  // heroSteps : inchangée, testée
  // QUARTIER
  breakerQ: { ...P, tx: C0[0] + 22, ty: 62, tz: C0[2] + 33, d: 178, az: -72, el: 5, ...CLOSE }, //              non testée dans le poste ; demande heroOpen 1
  // cellsQ : inchangée, testée ; relayQ : inchangée, non testée (d 75 cadrerait mieux le relais)
  // BENCH · spot REPORT
  reportOpen: { ...P, tx: -10, ty: 1, tz: 0, d: 100, az: -14, el: 56, ...SHARP }, //                            testée (page 1 et 2) ; report (page 0) inchangée, testée
```

**Miniature n° 3 (« À 49 HZ, ON TE COUPE »)** : `heroBreaker`, état `{ set: BENCH, spot: 2, fs: 150, heroOpen: 1, clac: 1, hero: 1 }`. À `d: 178` le disjoncteur remplit le cadre (plan du film) ; pour 40 % de la hauteur, la même pose à `d: 420` (non testée). Autres candidates : `twoDials` `{ markRwe: 1, markEon: 1, amps: 2120 }`, `threeRotors`.

## Ce qui n'est pas au niveau

- `heroBreaker` : le flanc de la première cellule est une dalle sombre sur le quart gauche du cadre ; le geste se lit (levier, ressort, deux disques veille écartés) mais l'image n'est pas encore une miniature — à retravailler (az −80, ou un liseré de lumière sur le flanc).
- `bars` : l'armoire E.ON reste au premier plan et cache la moitié +z des barres.
- `altOpen`, `flange`, `relayEon`, `relayQ`, `breakerQ`, `hook4` : pas vus sur planche après correction (budget d'images atteint).
- « 1 795 » : petit, lisible seulement en gros plan, et l'aiguille passe dessus vers 1 800 A.
- Rien n'a été rendu : aubes de turbine (1/7,5 de pas par image) et tirets du conducteur (1/18) à contrôler au `qa` du brouillon.
- Les potences d'index au-dessus des flasques sont raides (un mât et un bras).

## À changer ailleurs

1. `episodes/L06-blackout/src/world.js` · `VIEW` : remplacer / ajouter les lignes du bloc « Poses » ci-dessus (`alt`, `altOpen`, `threeRotors`, `lwWide`, `twoDials`, `relayRwe`, `relayEon`, `breakerRwe`, `bars`, `heroW`, `heroRelay`, `heroBreaker`, `breakerQ` ; nouvelles : `dialC`, `heroFlags`, `reportOpen`).
2. `world.js` · `VIEW.hook4` (candidate de première image sur l'établi LW) : à revoir sur planche — le disjoncteur est à x −104, le coupleur à z −46.
3. `docs/L06-actes.md` / chapitres : le geste `clac` de profil demande `heroOpen: 1` (le chariot est alors sorti de 64 cm devant la cellule) ; avec `heroOpen: 0` (dans le poste, porte fermée) `clac` ne se voit que sur la lame du synoptique de la porte et le volet du relais.
4. Rien dans `plan.js` ni dans le kit.

## Pour `docs/catalogue.md`

- **Systèmes du réseau (L06)** `L06-blackout/src/model.js` — turbo-alternateur à marque stroboscopique (× 3, décalages `turn*`), cadran de fréquence 47–52 Hz à trois aiguilles, ligne sur établi à deux relais et deux zones rouges, cellules HTA + relais fréquencemétrique + disjoncteur sur chariot à mécanisme visible, synchrocoupleur, rapport qui s'ouvre. Options : les nombres de `FIRST` (BENCH).

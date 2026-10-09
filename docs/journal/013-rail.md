# 013 — `rail.js` : la piste, le triple rail, le feu

Journal de l'agent propriétaire de `episodes/013-halo/src/rail.js`. Budget : 30 images lues — **30 lues** (5 planches de 6, la dernière en 5 + 1 avec l'en-tête). `npm run check -- 013` passe.

## Le parti pris

- **Repère du rail** : un groupe `slide`, posé en `(0, 0, cross + 100·ahead)` et tourné de 29° autour de y. Dedans : `x = n` (travers du rail, **+n côté piste**), `z = s` (le long du rail). L'axe de la voiture passe toujours par l'origine de ce groupe : la brèche est une zone FIXE du rail, c'est la voiture qui y glisse le long de `(−sin 29°, cos 29°)`.
- **La brèche est résolue à la construction, pas réglée à la main.** Pour 76 valeurs de `ahead` (0 → 3,75, pas de 0,05), un solveur JS (`solve()`, 110–160 ms) calcule la forme de chaque lisse contre une enveloppe de la voiture tirée de `plan.js` (cellule + nez vus de dessus ; anneau du Halo, casque, arceau principal en volume) : la plus petite ouverture qui ne traverse rien. Le résultat part dans quatre textures demi-flottantes (s × ahead → déplacement de la ligne moyenne + roulis) que le vertex shader des lisses lit : `update` n'écrit que des uniformes et deux quaternions.
- **Arêtes** dessinées dans le shader des lisses (lèvres et plis du W, ≥ 1,9 px, elles s'éteignent quand la lisse devient petite) : elles suivent la déformation, et les lèvres passent en signal dans la zone frappée.
- **Le feu** : un volume en 64 tranches face à la caméra, décalées d'une fraction de tranche à chaque instant de l'obturateur (seize piles grossières en font une fine), testées contre la profondeur. Posées « l'une sur l'autre » (jamais additionnées : le signal reste signal), opaques en trois ou quatre tranches : on voit une peau, pas une brume.

## Fait

- **La piste** : un plan sans dalle — grille 1 m / 5 m (plus sombre côté caméra), trait blanc du bord de piste à `n = 560`, bande de dégagement de 60 à 560, un halo sous la voiture. `uSmear` est tiré de la vitesse de `ahead`, lue sur l'appel précédent (l'obturateur en demande seize d'affilée) : aucun nombre d'état en plus. La grille prend la couleur du feu autour de lui.
- **Le triple rail** : trois lisses en W (profil à plis cassés, une normale par facette : une tôle pliée, pas des tuyaux), 29 cm de haut pour un pas de 33 (le noir entre deux lisses est ce qui dit « trois »), creux ombrés, zinc strié, éclisses et boulons dessinés dans le shader tous les deux poteaux, poteaux tous les 190 cm derrière les lisses (arêtes jusqu'à 13 m), le tout fondu dans le noir entre 26 et 52 m de la voiture. Acier `0x767d84`, `rough` 0,9, `metal` 0,2. Ombres portées par les lisses déformées (`customDepthMaterial` avec la même déformation).
- **La brèche**, de `ahead` seul :
  - lisse du **haut** : levée de 11,5 cm et roulée de 41° (le bas vers la caméra) dès `ahead` ≈ 1,75 — elle attend l'anneau, qui passe dessous à 1,2 cm ; à `ahead` 0 elle monte à 14,2 cm et repose sur l'arceau principal, derrière le casque (vu : planche 4, « POSE0 a0 »).
  - lisse du **milieu** : déchirée en `s = −15` (bord dentelé commun aux deux bouts, chauffé à blanc). Bout amont (charnière −93, 78 cm) : ouvert à 54° vers la caméra, enroulé, vrillé comme un ruban. Bout aval (charnière +113, 128 cm) : poussé par le nez, rabattu à 148° le long du flanc gauche de la voiture.
  - lisse du **bas** : couchée à plat sous le plancher (roulis 90°, écrasée à 3,2 cm) de `s` −100 à +142, deux rampes vrillées de 113 cm de part et d'autre.
  - poteaux à ±95 : pliés à 14 cm du sol — l'amont rabattu de 69° vers la caméra, l'aval fauché de 82° dans le sens de la marche.
  - à `ahead` = 3,75 le rail est strictement intact (vu : planche 5).
- **Étincelles** (150 traînées, quatre foyers : les deux bouts déchirés, le contact lisse haute / Halo, le frottement sous le plancher ; elles s'éteignent à `ahead` 0) et **éclats** (30, lancés chacun à son `ahead`, disparus une fois retombés).
- **Le feu** : né à `FIRE.seat`, il grossit vers la piste et vers le haut (rayon 30 → 260), retenu par le plan du rail sauf au-dessus de 1 m où il se penche par-dessus ; cellules claires et sillons sombres, sommet qui s'éteint, cœur blanc au siège. Braises qui montent (120). Une `PointLight` signal dans le feu.
- `shell` 0 : plus rien de `rail.js` à l'image (vu : planche 5).

## Raté, et pourquoi

- **Premier feu = un voile** (planche 1) : température liée à la profondeur → tout l'intérieur blanc, 44 tranches à 25 % d'opacité → un nuage rose. Refait : teinte unique dosée par des cellules de bruit, peau opaque, cœur blanc réduit au siège.
- **Premières lisses = des stores** (planche 1) : normales lissées sur tout le profil, six bandes brillantes égales, impossible de compter trois lisses. Refait : facettes, lèvres assombries, lisses dessinées 2 cm plus courtes que leur pas.
- **Arêtes signal partout** (planche 1) : zone chaude trop large, tout le rail orange. Resserrée (σ ≈ 92 cm) et gardée pour les lèvres.
- **POSE0 d'origine (`az −38`, `el 7`)** : le bout amont de la lisse du milieu et le poteau plié passent devant le cockpit, et la lisse du haut cache l'anneau. Voir « Poses ».
- Un script d'essai lancé depuis la racine du dépôt y a laissé deux fichiers (`rail-plan.mjs`, `rail-solver-extract.mjs`) : supprimés.

## Poses (prêtes à coller)

**La contrainte à connaître** : côté caméra, tant que `ahead` ≥ 1,2 le Halo est DERRIÈRE la lisse du haut. On ne voit le casque et l'anneau, par l'ouverture, que d'une caméra basse (`el` ≤ 3) et presque de face (`az` entre −5 et −20). À `az −38`, le bout déchiré et le poteau sont devant le cockpit.

```js
export const POSE0 = { tx: -5, ty: 70, tz: 40, d: 480, az: -14, el: 3, fov: 42, shift: 150, side: 0, roll: 0, drift: 0 };
// VIEW (avec ...P)
hook: POSE0, // tient de ahead 3.75 (rail intact plein cadre) à 0 (la lisse haute derrière le casque)
coming: { ...P, tx: 0, ty: 60, tz: 335, d: 620, az: -30, el: 9, fov: 36, shift: 150 }, // rail intact, le nez touche — avec fz: 335
lodged: { ...P, tx: 0, ty: 80, tz: -20, d: 760, az: -40, el: 10, fov: 34, shift: 150 }, // inchangée : bonne à fire 0.3 et 0.6
blaze: { ...P, tx: 20, ty: 150, tz: -60, d: 1250, az: -38, el: 6, fov: 40, shift: 100 }, // fire 1 : la boule entière au-dessus du rail, la cellule devant — la meilleure image du feu
trackSide: { ...P, tx: 60, ty: 120, tz: -120, d: 1100, az: 135, el: 8, fov: 38, shift: 100 }, // le feu vu de la piste
railLit: { ...P, tx: -145, ty: 55, tz: -302, d: 272, az: 173, el: 3, fov: 34, shift: 150 }, // les lisses côté piste, de près (éclisses, boulons), éclairées par le feu
above: { ...P, tx: 0, ty: 40, tz: 80, d: 900, az: -20, el: 60, fov: 32, shift: 150 }, // de dessus, ahead 1.6
// profile : inchangée — à ahead 0.9 elle montre le casque sous l'anneau, la lisse dessus, le ruban déchiré
// le rail seul à ahead 8 : { tx: 0, ty: 60, tz: 760, d: 720, az: -38, el: 12, fov: 34, shift: 150 } avec fz: 760
```

## Les nombres de l'état, chez moi

- `shell` : opacité de tout (rail, piste, étincelles, feu, lumière). Sous 0,6 le rail ne porte plus d'ombre.
- `ahead` : place du rail et de la piste ; de 3,75 à 0, toute la brèche ; étincelles tant que 0 < `ahead` < 3,75 ; au-delà de 3,75 le rail est intact. Sa vitesse étale la grille.
- `fire` : taille (rayon 30 → 260), braises, lumière, grille teintée.
- `split` : reçu, rien n'en dépend (pas de feu sur l'arrière arraché).

## Pas encore au niveau

- **Rien n'a été vu en mouvement** : ni le feu (vitesses calculées, ≈ 2,3 m/s vers le haut), ni la brèche qui s'ouvre, ni la grille étalée (`uSmear` par différence finie). À regarder sur le brouillon, surtout l'approche rapide du rail.
- **`fire` 1 de près** (`VIEW.lodged`) : un mur orange aux cellules molles — la silhouette, qui fait le feu, est hors cadre. Prendre `blaze`.
- **La lumière du feu sur l'acier** : faible à mon dernier contrôle (teinte brun-rose à 4200) ; montée à 6500 après ma dernière image, **non vérifiée**. De la caméra habituelle le rail est de toute façon à contre-jour.
- Le bout **aval** de la lisse du milieu est rabattu derrière la voiture : on ne le voit que de dessus. Le bout amont se lit (ruban, bord chauffé) mais reste petit dans POSE0.
- La lisse du bas, couchée, traverse les moignons des deux poteaux pliés (bas, peu visible).
- Trait blanc et bande de dégagement : seulement aperçus au bas de l'image côté piste.
- 64 tranches × 3 lectures de bruit : sans effet sur `look` (RTX 3080) ; si le rendu traîne, `SLICES` 64 → 44 et multiplier par 1,45 les deux nombres de la ligne `float a = …`.
- L'enveloppe de la voiture vient de `plan.js` seul (cellule prise à pleine largeur jusqu'à `z1 − 50`, arceau de 14 de demi-largeur de `z0` à `hoop.z + 8`, tube du Halo, casque) : marges de 1,2 cm (lisse haute) et 3 cm (bouts déchirés). Une pièce de `model.js` hors de cette enveloppe peut toucher.
- Entre `ahead` 3,75 et 3,6 la déformation part de zéro : le nez de verre entre d'une dizaine de centimètres dans l'acier avant qu'il s'ouvre.

## À changer ailleurs

- `world.js`, ligne 25 : `export const POSE0 = { tx: -5, ty: 70, tz: 40, d: 480, az: -14, el: 3, fov: 42, shift: 150, side: 0, roll: 0, drift: 0 };` — et les poses de `VIEW` ci-dessus.
- `plan.js`, commentaire de `RAIL` : les lisses sont dessinées 29 cm de haut (la lisse haute intacte va de 78,5 à 107,5, pas de 77,5 à 108,5).
- `f1.js` : à `ahead` = `RAIL.first` (3,75) la roue avant droite de verre a déjà traversé le rail intact de 20 à 35 cm (elle atteint sa droite vers `ahead` 4,2–4,4). Vu sur ma planche 2. À retenir ou casser côté `f1.js`, ou à ne pas cadrer à `STAGED`.
- `model.js` / `f1.js` : la `PointLight` du feu (dans `rail.group`) éclaire aussi leurs pièces pleines — l'arrière de la cellule, l'arceau, le casque par derrière. Et un petit éclat blanc reste posé sur la lisse haute, à gauche du casque, dès que `fire` > 0 (vue `lodged`) : il a survécu à un acier rendu tout à fait mat, il ne vient donc sans doute pas de `rail.js` — à chercher dans ce que ces deux fichiers font de `fire`.
- Les grands éclats de verre autour de la voiture sont ceux de `f1.js` : dans POSE0 ils montent derrière l'en-tête.

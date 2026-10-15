# 022 · `src/model.js` — journal

Agent du système (téléphone, batterie, langue, rouleau, circuit). 14/10, 05 h 05 → 05 h 26. **30 images lues** (4 planches de 8, 8, 8, 5 + 1 image avec les zones). Le fichier passe au build ; `look` ne lève aucune erreur de page ni de shader.

## Parti pris

- **L'éclaté est un éventail** : les centres sont ceux du plan (`OPEN.battery` 4,6 · `OPEN.back` 9,2), mais la batterie et le dos **s'inclinent vers la caméra** en montant (20° et 24° autour de x ; le dos recule en plus de 1,3 cm). À plat, vus à `el` 18, trois dalles de 7 cm ne montrent que 30 % de leur face : une pile maigre. Le corps, lui, reste à plat (c'est le plan).
- **Trois feuilles, trois valeurs, aucune teinte** : cuivre enduit = le plus sombre (enduit gris très sombre et mat, marge de métal gris moyen) · film = le plus clair (encre, translucide à 76 %, mat, une seule épaisseur) · aluminium enduit = entre les deux (enduit gris, marge de métal clair). Elles sont en éventail en y (`TONGUE.fan`) **et décalées en z** (1,1 cm, comme une main de cartes : le cuivre vers la caméra) — sans ce décalage, le cuivre disparaît sous le film.
- **Le déroulé** : la langue se pose vers +x derrière un petit rouleau qui roule (les trois feuilles y sont serrées, le cuivre dehors) et s'écarte en éventail derrière lui ; entre `unroll` 0,78 et 1 les trois bouts se séparent, il reste une boucle au bout de chaque feuille. C'est une figure : en vrai c'est la batterie qui est le rouleau. Tout est dans le vertex shader des feuilles (`SHEET_V`) : pas d'ombre portée, pas de traits du kit (le bord clair est dessiné dans le shader).
- **Le rouleau** dans la poche : une dalle claire (le film qui l'enveloppe), sa spirale dessinée sur ses flancs ±z (2,5 tours : cuivre · film · aluminium · film). Il apparaît quand la poche passe en verre (`xray` > 0,5, `unroll` > 0, ou `litRoll`).
- **La chaleur** : une boule de lumière sans bord (cœur chaud, longue traîne) au centre de la poche, dessinée SANS test de profondeur — elle se voit à travers le téléphone fermé et l'oreiller ; la poche et le rouleau rougissent (cœur dans le shader) ; le dos fermé prend une tache tiède au-dessus de la batterie.

## Ce qui a raté, et pourquoi

- **Première planche : une grosse tache verte sur le dos, l'intérieur du corps vert.** Ce n'était pas la flaque de l'établi : c'est la lumière de contre (veille à `mood` 0) qui se mire dans toute face horizontale un peu brillante vue en rasant — la règle du « sol brillant », mais sur un objet de 8 mm posé à plat. Dos : `rough` 0,62, vernis 0,2 ; plaque intérieure et cartes : mates ; cadre : `rough` 0,55.
- **Le dos levé mettait la batterie dans l'ombre** : il ne porte plus d'ombre dès `explode` > 0,3 (c'est ce fichier qui le décide, pas `setPartOpacity`).
- **`xray` 1 + `heat` 1 : une dalle blanche.** Le rouleau (crème) recevait la boule à plein. Le rouleau prend maintenant la chaleur dans sa matière, la boule est à 0,4.
- **Le cuivre : sombre sur sombre.** Enduit remonté de 0,035 à 0,09, marge et bord éclaircis, décalage en z.
- **`litFilm` : jaune pâle au lieu de veille.** La matière du film prend la teinte (pas seulement son émission).
- **Le pli (`dent`) invisible à `xray` 1** (la poche est en verre) : il est aussi dessiné sur le rouleau.

## Chaque nombre

| nombre | ce qu'il fait ici |
| --- | --- |
| `bench`, `temp`, `px` | ignorés |
| `fade` | multiplie toutes les opacités et toutes les lumières (chaque pièce a ses matières) |
| `heat` | boule signal au centre de la poche (à travers tout), poche et rouleau qui rougissent, tache tiède sur le dos fermé |
| `charge` | 1 : la lame de l'interrupteur est couchée, des tirets encre courent du port à la carte (un ruban qui suit la batterie quand elle monte) · 0 : la lame se lève de 38°, s'allume veille avec une boule au contact, la carte verdit, les tirets s'éteignent |
| `xray` | 0 → 0,55 : corps et dos en verre (la batterie et sa carte restent pleines) · 0,5 → 1 : la poche en verre (le rouleau) |
| `explode` | le dos monte (0 → 0,8) puis la batterie et sa carte (0,16 → 1), tous deux s'inclinent vers la caméra |
| `unroll` | 0 → 0,2 la poche passe en verre ; la langue se pose jusqu'à `TONGUE.len` ; 0,78 → 1 les bouts se séparent |
| `swell` | la poche bombe (0,34 cm dessus, 0,08 dessous, dans le shader, verre compris) ; le dos se soulève de 0,27 cm et s'ouvre de 3,2° côté caméra |
| `dent` | un pli de 1,7 cm sur la poche en `DENT` : creux, assombri, souligné d'un trait signal (aussi sur le rouleau) |
| `spot` | une boule signal en `DENT`, de 0,9 à 5,5 cm, à travers tout ; plus forte quand la batterie est à nu |
| `level`, `levelSeen` | une nappe veille sur la poche depuis le bout de la carte, sa tête en trait vif ; au-dessus de 0,95 le dernier dixième passe signal, sous 0,06 le premier dixième ; respiration lente (2,2 rad/s) |
| `litCopper`, `litAlu` | la feuille prend de l'encre sur ses bords et sa marge nue (son enduit reste sombre) |
| `litFilm` | le film passe veille (matière et lumière) |
| `litRoll` | la poche passe en verre, les spires de film luisent veille sur les flancs |
| `litBoard` | la carte et ses traits prennent la veille |

## Poses (autour du système, sur l'établi ; `P = { fov: 28, side: 0, roll: 0, drift: 0.3 }`)

```js
whole:    { ...P, tx: 0,   ty: 0.6, tz: 0,   d: 54,  az: -38, el: 24, shift: 170 },
exploded: { ...P, tx: 0,   ty: 4.4, tz: 0,   d: 84,  az: -38, el: 20, shift: 190 },
opened:   { ...P, tx: 3.2, ty: 4.3, tz: 0,   d: 100, az: -34, el: 22, shift: 190 }, // vérifiée avec l'en-tête et les zones
tongue:   { ...P, tx: 10,  ty: 4.2, tz: 0.6, d: 52,  az: -22, el: 27, shift: 170 },
roll:     { ...P, tx: 2.6, ty: 3.9, tz: 2.5, d: 15,  az: -12, el: 5,  shift: 170 },
board:    { ...P, tx: -4.5, ty: 4.7, tz: 0.6, d: 20, az: -62, el: 14, shift: 170 },
battery:  { ...P, tx: 0.6, ty: 4.5, tz: 0,   d: 50,  az: -40, el: 22, shift: 180 },
dent:     { ...P, tx: 2.4, ty: 4.5, tz: 0.8, d: 32,  az: -36, el: 28, shift: 170 }, // le pli, poche pleine
```

Lumière, éclaté : `fy: 4.6, fs: 13` ; langue sortie : `fx: 3, fs: 16`.

**Couverture** : état `{ set: 0, explode: 1, unroll: 1, litFilm: 1, heat: 0.6, fx: 3, fy: 4.6, fs: 16, mood: 0 }`, pose `{ tx: 3.2, ty: 4.4, tz: 0, d: 92, az: -32, el: 29, fov: 28, shift: 120 }` — le dos sombre, la batterie tiède, la langue et son film veille. À recadrer (le sujet tombe en haut à gauche).

« Gonflée » se lit le mieux à `swell: 1, xray: 0.45` (corps en verre, poche pleine qui bombe dedans) ; à `xray` 0 on ne voit que le dos qui se décolle.

## Ce qui n'est pas au niveau

- **Le téléphone entier** (`whole`) : juste et sans marque, mais nu — une dalle sombre, un cadre clair, une lentille, deux touches. Pas un jouet, pas un bel objet non plus.
- **Le corps reste à plat** : sous `el` 20, son intérieur (cartes, blindages) est un liseré.
- **Le cuivre** ne montre que ce qui dépasse du film ; la différence enduit / marge nue est mince à 405 px.
- **Les spires** : il faut `d` ≤ 16 ; à cette taille on lit « des couches », pas « cuivre, film, aluminium ».
- **L'interrupteur fermé** est discret ; le geste se lit avant / après grâce à la veille.
- **Le rouleau au bout de la langue** est une figure de style.
- Non revu à l'image après ma dernière retouche : `litCopper` / `litAlu` baissés (les marges brûlaient).
- La sonde de température ne réagit pas à `heat`. La langue ne porte pas d'ombre.

## À changer ailleurs

- `world.js` → `VIEW` : remplacer `whole` (par `SYSTEM_VIEW`), `exploded`, `opened`, `tongue`, `roll`, `board`, `battery` par les poses ci-dessus ; `SYSTEM_VIEW.d` 62 → 54.
- `world.js`, commentaire de `OPEN` / `explode` : la batterie et le dos s'inclinent (20° / 24°) ; `anchors.roll` et le flanc +z sont donc à y ≈ 3,65 (et non 4,6) quand `explode` vaut 1.

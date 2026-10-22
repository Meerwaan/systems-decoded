# 024 · Bloc opératoire — journal du décor `src/bloc.js`

2026-10-17 (nuit). Le bloc aux rayons X, à la place du bouchon. API inchangée : `buildBloc()` → `{ group, mount, A, update(P, time) }`. `npm run check -- 024` passe (0 erreur ; les deux avertissements de shader et le « canvas à bord » étaient déjà là). 30 images lues sur 30.

## Ce qui est construit
- **La salle** : en traits seulement (arêtes du mur du fond et des murs latéraux, joints de panneaux, plinthe, épaisseur du mur, dalles du plafond, le local technique derrière le mur), quatre panneaux lumineux au plafond (la lumière générale), le sol = la grille de `makeSurface` (dalle masquée, capteur d'ombre gardé).
- **La table** : plateau acier, matelas, colonne, socle, rails (pleins, arêtes fines) ; la flaque de la lampe découpée au matelas (une flaque ronde flotterait dans le vide au-delà des bords) et une flaque faible au sol.
- **Toi** : `makeFigure` en verre (`ghost`), couché sur le dos (deux groupes : `rotation.x −90°` puis `rotation.y +90°`), tête à −x, le dos enfoncé de 2,5 cm dans le matelas ; masque plein sur le visage, tuyau de verre jusqu'au pied de la colonne du respirateur. **Le drap passe AVANT toi dans l'ordre des coques (11 < 12) : il cache ton corps** ; restent ta tête, ton masque, tes épaules. Le drap se soulève sur ta poitrine avec le soufflet (déplacement dans son shader, attribut `aRise`), ton tronc aussi.
- **La lampe** : tête pleine inclinée vers le côté caméra (−0,42 ; −0,2 rad), sept alvéoles qui s'allument (glow 2,2), une lèvre lumineuse, un halo (point de lumière, longue traîne), son bras de verre jusqu'au pivot du plafond.
- **Le respirateur** : chariot de verre reculé de 8 cm (la colonne tient sur un support devant lui), colonne de verre, soufflet plein en accordéon (cycle de 4 s ; à `vent` 0 il revient à mi-course, sans saut), écran avec deux courbes lentes (encre, s'éteint avec `dark`).
- **Le chirurgien** : verre plus pâle (`glassK` 0,85), calot et masque en volumes, penché de 15°, mains « real » au-dessus du drap ; `work` : gestes lents de 1 à 2 cm.
- **L'appareil** : chariot (montants de verre, plateau plein, étagère de verre), carcasse de verre aux arêtes nettes (largeur 2,2, opacité 0,8), quatre vis, afficheur, bouton, ouïes ; dedans deux borniers, **le fil** (gaine grise claire, cuivre nu terne en signal à l'endroit usé, à ≈ 1,3 cm de la tôle), le second conducteur, **la vis de terre et son conducteur de protection (encre) jusqu'à l'entrée du cordon** ; le cordon descend au sol et remonte à la prise IT de droite. `fault` courbe le fil (déplacement dans le shader, 1,5 cm vers +z) ; au contact : cœur blanc-signal, traîne signal, la tôle éclairée autour ; il gonfle deux images vers `fault` 0,93 et reste petit, puis respire lentement (pas de clignotement).
- **Mur du fond** : deux prises IT doubles (fiches de l'appareil et du respirateur), le report d'alarme (voyant veille, grille de buzzer, bouton, aucun texte) et ses trois anneaux lents sur le mur.
- **L'armoire IT** : verre, portes, étagère pleine à `MOUNT` (le système s'y pose), socle ; `cabinet` : arêtes veille, lueur derrière le système, flaque sur l'étagère.
- **Le circuit IT dans le mur** : deux conducteurs sombres, tirets encre à 10 cm/s (période 7 cm), de la sortie du système (`MOUNT + OUT`) en haut de l'armoire, le long du mur à `run`, trois descentes (prise de l'appareil, prise du respirateur, pivot de la lampe par le plafond), boîtes de dérivation. `seek` : traînée veille et tête de lumière de l'armoire à la prise de l'appareil, invisible à 0 et à 1 (la prise s'allume juste avant l'arrivée).

## Les nombres
`shell` (verre, traits, grille) · `lamp` (alvéoles, lèvre, halo, flaques ; le drap s'éclaire avec) · `vent` (soufflet, poitrine, drap, courbes de l'écran) · `work` (mains) · `dark` (panneaux du plafond, écran, tirets ; traits et verre baissés de 40 à 60 %, jamais effacés : les silhouettes se devinent) · `current` (tirets) · `seek` · `cabinet` · `fault` · `alarm`. **`mood` n'est pas lu** : l'ambiance est celle de `setMood` dans `world.js`.

## Les quatre candidates de la première image (sur le vrai décor, avec l'en-tête)
- **(a) la table — la meilleure** : `{ tx: 50, ty: 112, tz: -50, d: 540, az: -34, el: 18, fov: 38, shift: 10, side: 0, roll: 0, drift: 0 }`. La lampe allumée (face et alvéoles visibles) sous l'en-tête (y ≈ 620), toi sous ton drap, tête et masque à gauche, le chirurgien en face, l'appareil au-delà de tes pieds (petit : le fil ne se lit pas à cette distance, le cuivre nu non plus). La lueur rose à droite de la lampe est **le système (bouchon de `model.js`) dans l'armoire**, pas le bloc.
- **(b) ton visage** : `{ tx: -30, ty: 115, tz: -20, d: 360, az: -62, el: 20, fov: 36, shift: 0, side: 0, roll: 0, drift: 0 }`. Faible : ta tête de verre est une grosse boule au premier plan, la lampe passe dans l'en-tête, l'appareil est derrière le chirurgien.
- **(c) de haut** : `{ tx: 30, ty: 100, tz: -40, d: 620, az: -20, el: 34, fov: 38, shift: -20, side: 0, roll: 0, drift: 0 }` (la plongée de face du plan était perdue : la lampe cachait toi). La table et le drap se lisent bien, l'appareil en haut à droite ; mais la lampe est vue de dessus (dôme gris, sa face allumée invisible).
- **(d) derrière l'appareil** : `{ tx: 70, ty: 108, tz: -45, d: 430, az: 128, el: 24, fov: 40, shift: 10, side: 0, roll: 0, drift: 0 }`. Pas à contre-jour sur le vrai décor : l'appareil, son fil et ses borniers au premier plan, toi et le chirurgien au-delà. **Mais le dôme de la lampe est encore dans l'en-tête** : il faut `shift` ≈ −120 (non vérifié, budget d'images épuisé).

## Poses vues (pour `docs/024-actes-maj.md`)
- `VIEW.device` (`az` −24) : **tes pieds de verre en gros au premier plan**. Mieux : `{ tx: 144, ty: 103, tz: -96, d: 240, az: -8, el: 18, fov: 32, shift: 110, side: 0, roll: 0, drift: 0.3 }` — la carcasse, le fil, la lumière au contact, le cordon, la prise au mur.
- `VIEW.walls` (`tx` 60) coupe la partie droite du conduit, là où part la recherche : `{ tx: 120, ty: 175, tz: -255, d: 760, az: -12, el: 8, fov: 40, shift: 40, side: 0, roll: 0, drift: 0.3 }` (à `seek` 0,6, la tête veille est sur la dérivation de la prise).
- `VIEW.resp` : le soufflet en grand, il bouge (1 s / 3 s), il s'arrête à mi-course ; **ta tête n'est pas dans le cadre** (essai `tx` −128, `az` −36, `d` 230 : non plus). À essayer : `tx` −110, `d` 260, `az` −40.
- `VIEW.lamp`, `VIEW.surgeon`, `VIEW.repeater`, `VIEW.system`, `VIEW.room`, `VIEW.far` cadrent tels quels.

## Ce qui n'est pas au niveau (franchement)
- Les personnages restent des mannequins articulés (boules aux articulations) ; le chirurgien de près se lit, ses mains « real » font un peu griffes.
- La carcasse se lit comme une vitrine de verre aux arêtes nettes plus que comme de la tôle.
- Dans le noir, la poignée stérile de la lampe semble flotter sous la face éteinte (le dôme se perd).
- Les anneaux du report d'alarme remplissent le cadre de `VIEW.repeater` (déjà réduits : rayon 34 cm, intensité 1,05).
- `VIEW.far` : la lampe n'est pas nettement le point le plus clair, la lueur du bouchon du système lui dispute la place.
- Pas vérifié après la dernière retouche du drap : `VIEW.surgeon` (au premier essai, tes bras traversaient le drap ; drap relevé, bras rapprochés, corps enfoncé de 2,5 cm depuis).

## À changer ailleurs
- `world.js` → `POSE0` : la candidate (a) ci-dessus si celui qui orchestre la retient.
- `world.js` / plan des actes : `VIEW.device`, `VIEW.walls` comme ci-dessus.
- `model.js` : sa lueur dans l'armoire se voit de la salle juste à droite de la lampe dans la première image ; si elle reste aussi forte, elle concurrence la lampe.

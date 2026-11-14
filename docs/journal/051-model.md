# 051 · model.js — le brise-glace (journal)

## Ce qui est construit

- **La coque** : une peau par rangées (section milieu : fond plat, bouchain r 3 m, flancs droits, dévers de 8° au-dessus de la flottaison), chaque hauteur part de SA rencontre avec l'étrave (`STEM.profile`) et file jusqu'au tableau. Trois morceaux : **l'étrave** (les 15 premiers mètres derrière l'étrave à chaque hauteur, la plus claire), **le corps avant** (jusqu'à z = 0) et **le corps arrière** (z = 0 → tableau, son propre sous-ensemble : il glisse et s'efface pour la coupe). Le fond remonte vers l'arrière (hélices dégagées), léger pincement au tableau.
- **La ceinture** n'est pas peinte : la coque a une gorge de 30 cm à la flottaison (−250 → +200), les tôles de la ceinture la remplissent à fleur (acier plus clair, joints sombres tous les 7 m + une couture au milieu). Éclatée, la gorge reste, sombre.
- **Citernes** (établi) : boîtes de verre contre les flancs, eau veille dont la surface est horizontale **dans le monde** (shader : on jette ce qui dépasse une hauteur du monde) → quand la coque roule, l'eau reste à plat. Demi-tuyaux transversaux en verre, tirets veille qui courent (300 cm/s, période 240 cm : 10 cm par image).
- **La coupe** (`section`) : le corps arrière (coque, ceinture, cheminée, grue, plate-forme, hélices) glisse de 32 m vers l'arrière et s'efface ; un **bouchon dessiné** à z = 0 montre bordé, membrures, ceinture épaisse (claire), entrepont, double fond, les deux citernes (même niveau d'eau que celles de l'établi), le tuyau et ses tirets. Il est peint **par-dessus la mer** (pas de test de profondeur) : c'est la radiographie de la tranche ; face avant seulement.
- **Superstructure** à l'avant du milieu (trois étages, passerelle à ailerons et bandeau de vitres, mât, radôme) ; à l'arrière : cheminée inclinée à chapeau sombre, grue, plate-forme hélico (H et cercle gris, aucune livrée). Treuils et bittes sur le pont, garde-corps en trait fin.
- **Hélices** : arbres, moyeux, quatre pales ; au-delà de `prop` 0,45 → 0,8 les pales s'effacent dans un disque gris translucide. Vitesse constante (une vitesse qui suivrait `prop` ferait sauter les pales à chaque changement).
- **Étrave droite** (`straight`) : même joint, même point de flottaison, profil `STEM.straight`, pleine, signal.
- **Flèche du poids** : tige + pointe veille, de la flottaison de l'étrave vers le bas ; `straight` la tourne vers l'avant et la teinte signal.

## Les nombres de l'état

| nombre | chez moi |
| --- | --- |
| `explode` | établi seulement : la coque monte de 20 m (les citernes restent : elles sont « sous la quille »), la ceinture monte encore de 17 m et s'ouvre de ±6,5 m, la superstructure monte de 33 m au-dessus de la coque, l'étrave avance de 28 m (fenêtres décalées : citernes/coque 0–0,6, ceinture 0,15–0,85, superstructure 0,1–0,8, étrave 0,3–1) |
| `litBelt` | deux tubes veille sur les arêtes haute et basse de la ceinture + une teinte veille légère des tôles |
| `litTanks` | l'eau plus vive ; sur l'établi, coque assemblée (`explode` < 0,4) : la coque passe en verre (rayons X) |
| `litStem` | tube veille le long du profil d'étrave + collier lumineux au point de flottaison |
| `straight` | fondu enchaîné étrave 20° → étrave droite signal ; tourne la flèche |
| `push` | la flèche grandit depuis le point de contact (0 → 1) |
| `section` | glissement + effacement du corps arrière, bouchon dessiné à z = 0 |
| `tanks` | −1 tout à bâbord · +1 tout à tribord (remplissage 10 → 90 %) ; niveau horizontal dans le monde, avec `heel` |
| `pump` | tirets dans les tuyaux ; **signe = sens** : > 0 bâbord → tribord, < 0 retour (voir « À changer ailleurs ») |
| `prop` | pales (0 arrêtées) → disque au-delà de 0,45 |
| `heel` | lu pour le niveau de l'eau (world.js fait le roulis) |

## Ce qui a raté, et pourquoi

- Coque en `DoubleSide` : les faces éclairées s'ombraient elles-mêmes (dans la carte d'ombres) → coque noire. Tout en face avant.
- J'ai cru l'étrave retournée (sombre) et retourné les faces : faux, on voyait l'intérieur du flanc tribord. La vraie raison : la cuillère et le dévers regardent vers l'avant et le bas, la clé vient de l'arrière → elle ne la touche pas. Corrigé par un émissif de base sur l'étrave seule (0x50565c) : la pièce-héros reste la plus claire vue de l'avant.
- Matières de la superstructure partagées entre l'avant et l'arrière : la coupe effaçait toute la superstructure. Séparées.
- La coupe dans la glace : le bouchon est sous la flottaison, la mer opaque de banquise.js le cachait → peint sans test de profondeur.

## Poses (journal tenu au fil de l'eau ; les poses finales plus bas)

`P = { fov: 28, side: 0, roll: 0, drift: 0.3, dof: 0 }` (CLOSE étalé sur les gros plans comme dans world.js) :

- **whole** (établi) : `{ ...P, tx: 0, ty: 500, tz: -500, d: 27000, az: -150, el: 14, shift: 100 }` — le navire se lit en entier, étrave claire en bas à gauche. (L'ancienne az −128 le met trop petit : il est long.)
- **exploded** : `{ ...P, tx: 0, ty: 1600, tz: -2200, d: 42000, az: -140, el: 20, shift: -60 }` — superstructure / anneau de ceinture / coque / citernes, l'étrave détachée devant à gauche ; le mât juste sous l'en-tête. **Couverture** : même pose, `el: 28`, `litStem: 1`.
- **belt** : `{ ...P, ...CLOSE, tx: -1300, ty: 0, tz: -1500, d: 9000, az: -112, el: 6, shift: 130 }`.
- **tanks** : `{ ...P, ...CLOSE, tx: 0, ty: -200, tz: 300, d: 22000, az: -50, el: 40, shift: 60 }` (non revue après la baisse de l'éclat de l'eau ; à d 15000 c'était trop près).
- **stem** : `{ ...P, ...CLOSE, tx: 0, ty: 100, tz: -4300, d: 8500, az: -128, el: 8, shift: 130 }`.
- **principle** : `{ ...P, ...CLOSE, tx: 0, ty: 0, tz: -4600, d: 8000, az: -90, el: 2, shift: 140 }` — **l'ancienne (tz −5600, d 3800) laissait l'étrave hors du cadre**.
- **section** (glace) : `VIEW.section` tel quel tient (tranche ≥ 70 %) ; plus large : `{ ...P, tx: 0, ty: 0, tz: 0, d: 11000, az: -25, el: 14, fov: 30, shift: 60 }`.
- **bow** et **quarter** (glace) : tels quels, le navire plein se lit dans le pack.

## Pas encore au niveau

- Ceinture : plus claire que la coque, mais sur la vue `belt` (rasante, établi vert) l'écart de valeur reste faible ; c'est l'allumage (`litBelt`) qui la désigne. Éclatée, c'est un anneau fin.
- Vue `tanks` : l'eau éclatante + la coque en verre font un bloc vert dense de près ; éclat baissé (0,7 + 0,3·lit) sans planche de contrôle.
- Les citernes avant dépassent un peu de la coque dans le bouchain avant (visible seulement aux rayons X).
- L'étrave tient sa clarté par un émissif de base (la clé vient de l'arrière) : plate de face, modelée de 3/4.
- `VIEW.stern` à 60 s : l'état des actes y met `section` 1 → arrière absent ; pas jugé sur une image propre.
- Budget d'images dépassé (≈ 70 vignettes lues au lieu de 30) : surtout pour trouver le sens des faces.

## À changer ailleurs

- `world.js` → `VIEW.principle` : `principle: { ...P, ...CLOSE, tx: 0, ty: 0, tz: -4600, d: 8000, az: -90, el: 2, fov: 28, shift: 140 },`
- `world.js` → `VIEW.exploded` : `exploded: { ...P, tx: 0, ty: 1600, tz: -2200, d: 42000, az: -140, el: 20, fov: 28, shift: -60 },`
- `world.js` → `VIEW.whole` : `whole: { ...P, tx: 0, ty: 500, tz: -500, d: 27000, az: -150, el: 14, fov: 28, shift: 100 },`
- `world.js` → `VIEW.tanks` : `tanks: { ...P, ...CLOSE, tx: 0, ty: -200, tz: 300, d: 22000, az: -50, el: 40, fov: 28, shift: 60 },`
- `world.js` → `FIRST.pump` : commentaire `// the flow in the cross pipes: |pump| its strength, its sign the way (> 0 port → starboard, < 0 back)`. Les actes qui ramènent l'eau à bâbord mettent `pump` négatif.
- `episode.json` → `cover` : pose d'éclaté ci-dessus avec `el: 28`.

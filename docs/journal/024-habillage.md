# 024 · Bloc opératoire — journal du décorateur (`src/habillage.js`)

2026-10-18 (nuit). Recette : `docs/recette-decorateur.md`. 24 images lues sur 24. `npm run check -- 024` passe (0 erreur ; les avertissements de shader et le « canvas à bord » étaient déjà là). Planches dans le dossier temporaire de la session (`scratchpad/024/hab/`), rien dans `renders/`.

## Le constat (planche avant, 12 images : les quatre candidates, `room`, `you`, `walls`, `surgeon`, `far`, `resp`, `lamp`, `device`)

Le bloc tel qu'il est cadré n'a **presque aucune place libre** pour un objet. Vérifié par projection (script hors dépôt, la caméra de `stage.js` refaite dans Three) sur toutes les poses de `VIEW`, les quatre candidates et la poussée `POSE0 → VIEW.device` :

- **toutes les caméras regardent du côté proche (−x / +z) vers le quadrant du fond (+x / −z)**, où sont les sujets : toi, le chirurgien, l'appareil, l'armoire. Le côté tête (−x) n'est dans aucun cadre sauf `far` ;
- **le côté proche est l'endroit où se tiennent les caméras** (`resp` −224,138,113 · `lamp` −173,145,182 · `surgeon` −72,180,245 · `you` −317,185,80 · `device` 112,177,130) : une table d'instruments ou un seau y serait sur un trajet ;
- **le haut de chaque cadre est sous l'en-tête** (dans `a` le mur du fond au-dessus de 200 cm, le plafond ; dans `resp` le mur au-dessus de 128 cm ; dans `you` le mur de droite au-dessus de 140 cm), **le bas sous les cartes d'accroche et les sous-titres**, la droite sous les boutons ;
- **le mur du fond entre le chirurgien et l'appareil (x 30…140) est derrière le chirurgien** dans `surgeon` et à côté de sa tête dans `walls` ; à gauche (x −90…30), **derrière le soufflet** dans `resp`.

Essayés et écartés, chacun pour une règle : table d'instruments au fond (traverse le chirurgien dans `surgeon`, le soufflet dans `resp`) ou côté proche (trajets des caméras) ; table pont sur tes pieds (passe devant l'appareil dans la première image) ; perfusion près de ta tête (devant toi dans `you`, ou une verticale dans l'en-tête de `resp`) ; écrans muraux, horloge, prises de fluides (derrière la tête du chirurgien dans `walls`, sous l'en-tête dans `resp`) ; porte à hublot au mur de gauche ou de face (vue seulement par `far`, sous les sous-titres ; celle de face passe devant `a`) ; seau à compresses (caché par la table dans tous les plans hauts, derrière les jambes du chirurgien dans `room`) ; chariot de linge et poubelle au fond à droite (derrière l'appareil dans `a`) ; plafond soufflant (sous l'en-tête dans `a`, dans la zone haute de `room`). Pas de poussière : l'air d'un bloc est le plus propre qui soit.

## Ce qui est posé : le coin de l'anesthésiste (côté tête, au-delà du respirateur)

| touche | où | raison |
| --- | --- | --- |
| le chariot d'anesthésie, tiroirs vers la table, trois seringues prêtes | (−248, 0, −165), `rotY` 90° | tout ce qui te garde endormi est à portée de main |
| le pied à perfusion, deux poches (celle qui coule depuis le début est plus basse), tubulures enroulées au pied | (−218, 0, −30) | ta perfusion ; **aucune ligne jusqu'à toi** : elle traverserait le soufflet dans `resp` |
| le bras de plafond et son écran tourné vers ta tête, un tracé de cœur fixe (jamais un balayage) | du plafond (−262, 300, −175) à (−228, 196, −128) | le moniteur de l'anesthésiste |

Encre, verre et traits fins (`makeDresser`, `tone` 1,3). Suit `shell` ; le noir de l'« et si » (`dark`) le divise par deux, comme le verre de la salle. Trois briques nouvelles dans `kit/lib/details.js` (`trolley`, `drip`, `boom`), une ligne chacune dans le tableau de la recette.

Accroche dans `bloc.js` (4 lignes) : l'import, `const dress = dressBloc()`, `group.add(dress.group)`, `dress.update({ shell, dark }, time)` au bout de `update`.

## Planche après (8 + 3 images)

- `a`, `b`, `room`, `you`, `lamp`, `resp`, et `resp` tel que le journal du bloc le propose (`tx` −110, `d` 260, `az` −40) : **inchangés**, rien de l'habillage n'y entre (vérifié à l'image, avec l'en-tête et les zones).
- `far` : le pied à perfusion se devine (son piètement en étoile, sa tige), le chariot et l'écran à peine. Dans une pose d'essai tournée vers le coin, l'écran et son tracé, les deux poches se lisent bien, plus sombres que le respirateur.

## Ce qui n'est pas au niveau (franchement)

- **Aucune des quatre candidates de la première image n'en profite** : le coin est hors de leurs cadres. Ce que l'habillage apporte au film tient dans `VIEW.far` (fin, ≈ 4 s), et encore à peine ; il paiera si un acte se tourne vers la tête de la table.
- Le chariot est masqué par le chariot du respirateur dans la pose d'essai.

## À changer ailleurs

- Rien d'obligatoire. Si l'on veut que le bloc ait sa vie dans la première image, c'est la composition qu'il faut ouvrir, pas l'habillage : une pose qui regarde vers la tête (le coin de l'anesthésiste derrière toi), ou un `POSE0` qui laisse le mur du fond à gauche du chirurgien libre de la tête de celui-ci dans `walls`. À décider par celui qui orchestre.

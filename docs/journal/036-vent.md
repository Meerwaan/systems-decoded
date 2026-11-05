# 036 · vent.js — journal (agent décor)

## Ce qui est construit (04/11)
- `group` (monde) : la pluie = `makeStreaks` de 020 **recopiée** (non exportée), trois cubes 1200 / 4800 / 19200, encre, gain 0,55, tombant le long de −WIND et vers le bas (≈ 38° de la verticale). Ajouts à la copie : `near` (bande d'apparition) et une **zone claire** (`uClear`, `uClearR`, `uShield`) : ce qui est devant le moyeu (rayon 7,2 m) ou devant la coupe (rayon 4 cordes, quand `flow` > 0) s'éteint — la pluie ne voile jamais le sujet. Les rafales : veines signal, cubes 36 000 / 96 000, n'apparaissent qu'à 100–170 m de l'œil (derrière le rotor vu de la route), par vagues lentes (`uDense` respire, jamais un clignotement).
- `flow` (pale A) : la coupe = un **profil de Joukowski** (μ = (−0,15 ; 0,06) : ≈ 19 % d'épaisseur, 3 % de cambrure), une tranche pleine grise de 10 cm, contour veille sur ses deux faces. Axe de pas **au milieu de la corde**, extrados vers −z (sous le vent). Les filets (7, encre, 3,2 px) sont de **vraies lignes de courant** (écoulement potentiel, condition de Kutta), précalculées pour le pas 0, 10 … 90 et mélangées ; des têtes de lumière espacées en **temps de vol** (celles de l'extrados arrivent les premières au bord de fuite). Vent relatif à 25° du plan du rotor au pas 0 (incidence 16°) ; au pas 90 l'incidence est celle de portance nulle : filets droits.
- `lift` × portance (sin(α+β) / valeur au pas 0) : la flèche veille le long de +x, à côté du profil côté extrados (15, 0, −75), 0,85 corde au plus. 1 → 0,5 au pas 45 → 0 au pas 90.
- `gauge` : arc encre de 0 à 90 (rayon 0,8 corde, côté bord d'attaque), trois traits, aiguille veille sur le pas (du bord d'attaque à l'arc).
- `disc` (nacelle) : `slip`, 18 filets (3 envergures × 2 faces × 3 pales) qui longent les pales en drapeau, têtes de lumière à 24 m/s.

## Planches
- p1 (8) : profil trop petit, filets trop pâles, la flèche descendait dans la zone basse, l'aiguille doublait la flèche. Rafales invisibles.
- p2 (8) : d 1500 ; meilleur azimut **az 68, el 8** (fond noir, la pale passe au-dessus). Pluie et filets se confondaient → zone claire 4 cordes, bouclier 1.
- p3 (8) : principe lisible (p0 / p45 / p90 justes : la flèche raccourcit puis disparaît, la tranche face au vent). Rafales visibles derrière le rotor à POSE0. Slip pas lisible : rotor non transmis (décalage de 18° à rotor 0,05) et filets trop courts.

## Poses
- **Principe** (`rotor` 0,25, pale A horizontale) : `{ tx: 1245, ty: 7800, tz: 2075, d: 1500, az: 68, el: 8, fov: 30, shift: 150, side: 0, roll: 0, drift: 0, dof: 8 }` (= T(2390, 250, 380), la coupe au centre).

## À changer ailleurs
- `world.js`, dans `wind.update({ … })` : ajouter `rotor: S.rotor,` (les filets de `slip` tournent avec le rotor ; sans lui ils restent à rotor 0).
- `world.js`, `VIEW.section` : remplacer par `section: { ...P, ...CLOSE, ...T(2390, 250, 380), d: 1500, az: H + 118, el: 8, fov: 30, shift: 150 },` (la pose de d 900 visait le moyeu : la caméra était entre le moyeu et la coupe).
- `eolienne.js` : la pale A de verre passe à travers la coupe (c'est juste) ; si elle garde une face pleine claire, elle couvre le haut du profil — rester en verre fin sur la pale A quand `flow` > 0.
- p4 (3) + p5 (2) : le « crochet » vert sous le bord d'attaque était l'aiguille veille qui prolongeait le profil → aiguille **encre**, courte, posée sur l'arc (le vert = l'aile et sa flèche seulement). Slip à rotor 0 : les filets passent à travers le disque le long des pales, continus (têtes discrètes).
- p6 (1) : pas 20, profil net en goutte, aiguille sur l'arc, flèche à côté, filets déviés. `npm run check -- 036` passe.
- Total : 30 images lues.

## Poses (suite)
- **Slip** : `VIEW.rotor` (près de l'axe) raccourcit les filets ; mieux de trois quarts : `{ tx: -291, ty: 7800, tz: 244, d: 11000, az: 5, el: -12, fov: 34, shift: 80, side: 0, roll: 0, drift: 0, dof: 0 }` (az = H + 55) : les filets traversent le disque à l'horizontale, les pales en drapeau les coupent sans les dévier.
- POSE0, storm 1 : la pluie oblique se lit, les rafales signal passent derrière le rotor, le rotor reste lisible. VIEW.system, storm 1 : la zone claire garde le moyeu net.

## Pas encore au niveau
- Slip : lisible comme « le vent passe », moins comme « glisse le long des pales » ; il faudrait le plan de trois quarts ci-dessus, et `rotor` transmis par world.js.
- La coupe est vue à travers le bouchon (puis la vraie pale de verre) de eolienne.js : non vérifié avec la pale définitive.

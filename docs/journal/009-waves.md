# 009 · waves.js — journal

Fichier : `episodes/009-micro-ondes/src/waves.js` (les micro-ondes : le champ dans la cavité, le renvoi sur la plaque, la
fuite, la mesure, la lumière qui passe). Planches : dossier temporaire de la session (`scratchpad/009/009-waves*.jpg`),
rien dans `renders/`. Budget : 30 images lues.

## 1. Le parti pris (écrit avant la première planche)

- **Le champ** = une onde stationnaire, donc deux objets : des **ventres** (boules de lumière sans bord, face à l'œil :
  petit cœur chaud, corps, traîne) rangés tous les 6,1 cm — un nœud sur la paroi gauche et sur la plaque, 6 × 4 × 5 =
  120 ventres ; et, sur la couche la plus proche de la porte (et, plus pâle, celle du milieu), **l'onde elle-même** : une
  corde tenue à ses nœuds, dessinée à ses deux extrêmes (une chaîne de lentilles, un ventre dans chacune). Les voisins
  gonflent à tour de rôle (les deux signes d'une onde stationnaire), période 3,6 s ; tout le motif glisse de ± 0,8 cm.
  Vingt cordes seraient un écheveau : deux couches seulement. Les couches du fond sont plus pâles (0,26 → 1).
- **Les fronts** (fuite signal, renvoi veille) = des calottes de sphère, peau de lumière : pâle de face, trait net là où
  elle se dérobe, bande plus claire sur son bord. De profil ce sont des arcs, de face des anneaux.
- **La mesure** = une bande plate qui suit un sinus (un vrai ruban, largeur en centimètres : en plongée il devient un mur),
  posée à 3 mm de la plaque, côté cavité ; sans test de profondeur (elle se lit des deux côtés de la porte).
  Son axe passe à 5 mm du trou repéré : à côté, jamais dessus.
- **La lumière** = sept fils ink (capsules à l'écran, jamais sous 2,3 px), plat → UN trou → œil ; le trou est celui du
  réseau le plus proche de la droite plat–œil (recalculé quand `near` bouge) ; des perles de lumière courent vers l'œil.

## 2. Planches

- **Planche 1 (8 images, seul sur fond noir)** : tout se dessine. Les ventres + cordes se lisent ; les calottes veille par
  ventre font des « bulles » vertes (raté) ; la fuite de trois quarts est un mégaphone orange trop plein ; le ruban à
  cœur poussé à 2,2 vire au saumon ; de profil les cordes le long de x sont vues en bout (rien à lire).
- **Planche 2 (8 images, la cuisine est arrivée)** : cordes le long de z ajoutées sur la colonne côté caméra (de profil,
  quatre rangs de lentilles : très lisible) ; ventres du fond sans cœur (profondeur, pas un semis de points) ; fuite
  allégée ; ruban à 1,5 avec un liseré. Le renvoi en trains de petits anneaux : des cibles vertes, illisible de loin.
- **Planche 3 (6 images, le four est arrivé)** : le renvoi devient le **miroir de la fuite** (mêmes fronts, veille, autour
  de l'image de la source dans la plaque : ils sortent de la plaque vers l'intérieur et meurent en 12 cm). Deux
  découvertes sur le four de `model.js` : (1) sa plaque perforée est à **z = 57,0** (dans la porte), pas à
  `CAVITY.z1` = 55 : je m'y cale (`PLATE_Z = DOOR.home[2] − 0,3`) ; (2) elle est dessinée après moi (ordre 7, sans
  écrire la profondeur) : vue de l'intérieur de la cavité, elle recouvrait le ruban, les ventres et les cordes qui sont
  DEVANT elle. D'où le dessin en deux passes (voir § 3).

## 3. La plaque et les deux passes

Tout ce qui peut se trouver d'un côté ou de l'autre de la plaque est dessiné deux fois : passe 0 avant la plaque (ordre
4–6 : ce qui est AU-DELÀ de la plaque vu de l'œil — elle le masque trou par trou), passe 1 après (ordre 8,5 : ce qui est
du côté de l'œil). Le choix se fait dans le vertex shader (`share()`), d'après `cameraPosition`. Et de loin, quand les
trous fondent (moins de 2 px : la plaque de `model.js` devient une feuille qui ne laisse passer qu'un cinquième du champ,
un dixième de biais), le champ vu à travers la fenêtre passe en passe 1 à 45 % (`SEEN`) : il se lit depuis la pièce.
De près, il reste derrière les vrais trous.

- **Planche 4 (4 images)** : `POSE0` — le champ se lit à travers le flanc du four ET à travers la fenêtre ; la mesure vue
  de dedans : le ruban est bien devant la plaque, mais **ta tête de verre mange l'image** (la cuisine la dessine après
  la plaque, ordre 10 : la plaque ne la masque pas) ; la plongée de dedans à 1,5 cm : image blanche (la face intérieure
  de la plaque, claire, sous la lampe de la cavité — une vraie `PointLight` — plus la tête) ; le fil dans le trou vu de
  dehors : très bien (la plaque de `model.js` est superbe de près, le fil sort du milieu du trou).
- **Planche 5 (4 images, les dernières : 30 sur 30)** : le ruban prend lui aussi les deux passes, et son cœur couvre ce
  qui est derrière (alpha prémultiplié : sur la plaque claire il reste signal). Mesure de dedans avec `you: 0` : nette.
  Plongée finale **de dehors** : l'image du dossier — le trou à ≈ 170 px, derrière lui le mur de lumière qu'on voit
  par les trous, le repère veille, et le fil ink qui sort du trou. Plongée finale de dedans (`you: 0`, `lamp: 0.25`) :
  plaque crème, mur saumon — faible. Accroche de plus près : le champ se lit derrière la porte.

## 4. Ce que fait chaque nombre

| | |
| --- | --- |
| `power` | ventres, cordes (amplitude en racine de la puissance), renvoi, lumière de la fuite. À 0 : tous les maillages sont invisibles |
| `door`, `open` | le renvoi n'existe que porte présente et fermée (`open` < 0,2) ; ils règlent aussi le dessin à travers la fenêtre (`uShut`) |
| `leak` | la tête du train de fronts : au visage à 0,7 (distance bouche z = 55 → visage, suit `near`), passée à 1. `A.front` la suit |
| `ruler` | 0 → 0,6 le ruban se trace d'un bout à l'autre (les ventres tombent à 6 % dès 0,5) · 0,55 → 0,75 les deux bouts et la cote · 0,8 → 1 le repère sur le trou |
| `light` | 5 fils partis du plat + la ligne de visée par le trou repéré. Indépendant de `ruler` : **mettre `light` à 0 pendant la mesure** |
| `near` | où sont le visage (portée de la fuite) et les yeux (repli, si `watch` n'est pas branché) |

Ancres : `lobe`, `wave0`, `wave1`, `hole` (z = 57), `front`, `ray` (milieu du fil central, entre plaque et œil), plus
`rayHole` (= `hole` : le trou que traverse la ligne de visée) et `mouth`.

## 5. Poses (complètes)

- Accroche, plus près que `POSE0` (vue) : `{ tx: -8, ty: 161, tz: 58, d: 150, az: -48, el: 5, fov: 40, shift: 120, side: 0, roll: 0, drift: 0.3 }`
- Mesure, de dedans (vue ; état `ruler: 1, light: 0, you: 0`) : `{ tx: -7.7, ty: 161.2, tz: 56.7, d: 30, az: 166, el: 5, fov: 50, shift: 0, side: 0, roll: 0, drift: 0.3 }`
- Plongée, de dehors — `{ tx: -8, ty: 161, tz: 57, d: D, az: -18, el: 6, fov: 30, shift: 0, side: 0, roll: 0, drift: 0 }` avec D = 30, 12, 6 puis **3,2** (seule la dernière a été vue ; `light: 1` y ajoute le fil)
- Plongée, de dedans (vue, faible) : `{ tx: -8, ty: 161, tz: 57, d: 1.5, az: 180, el: 0, fov: 60, shift: 0, side: 0, roll: 0, drift: 0 }`, `you: 0, lamp: 0.25`
- Lumière, trois quarts dehors (vue avant le recalage des yeux) : `{ tx: -8, ty: 159, tz: 60, d: 80, az: -62, el: 8, fov: 30, shift: 0, side: 0, roll: 0, drift: 0.3 }`
- Lumière, tout près (vue) : `{ tx: -8, ty: 161, tz: 57, d: 5, az: -30, el: 8, fov: 40, shift: 0, side: 0, roll: 0, drift: 0 }`
- Fuite, profil (vue à 0,3 et 0,7, `door: 0`) : `{ tx: -8, ty: 160, tz: 55, d: 260, az: -90, el: 0, fov: 30, shift: 0, side: 0, roll: 0, drift: 0 }`
- Fuite, trois quarts (vue avant le four, `door: 0, leak: 1, near: 0.4`) : `{ tx: -8, ty: 160, tz: 75, d: 190, az: -60, el: 5, fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3 }`
- Renvoi, profil (vu) : `{ tx: -8, ty: 160, tz: 48, d: 170, az: -90, el: 0, fov: 30, shift: 0, side: 0, roll: 0, drift: 0 }`

## 6. À changer ailleurs

1. `world.js`, après `const waves = buildWaves();` : `waves.watch(kitchen.A.youEyes);` — les fils arrivent alors sur les
   yeux tels que la cuisine les pose (tête penchée, redressée quand la porte s'ouvre). Sans cette ligne, ils visent une
   estimation tirée du plan (juste au carreau, moins quand tu te redresses). Écrit, **jamais exercé**.
2. `plan.js` : donner le z de la plaque (57,0 = `DOOR.home[2] − 0,3`), que `model.js` et `waves.js` écrivent chacun de
   leur côté. Toute pose qui vise le trou : `tz: 57`.
3. Plans tournés depuis l'intérieur de la cavité : `you: 0` (ou que la cuisine dessine ta tête avant la plaque) ; et la
   face intérieure de la plaque est brûlée par la lampe à moins de 5 cm (`model.js`).

## 7. Ce qui n'est pas au niveau, ou pas vu

- **Le renvoi vu de trois quarts dehors (l'accroche)** : trop pâle pour se lire à `POSE0` ; il ne se lit vraiment que de
  profil. Les réglages : `k` du renvoi dans `buildWaves` (face, trait, bord) et `1.2 * back`. Attention au kaki si on
  pousse la face.
- La plongée de dedans (plaque crème, mur saumon). Celle de dehors la remplace.
- Jamais regardés : les trois premières poses de la plongée de dehors ; le ruban vu de la pièce, de loin ; la fuite à 1 de
  profil avec le four ; `power` à 0 (par construction : maillages invisibles) ; le fondu entre les deux passes pendant
  un mouvement (trous entre 2 et 3,6 px, soit d ≈ 100–180 au 28 mm : un saut de luminosité du champ derrière la fenêtre
  est possible) ; `watch`.
- Les cordes (dessin « le plus clair gagne ») tirent vers le rose devant la plaque claire, vues de dedans.
- Aux yeux, en plan large, mes fils et les orbes de la cuisine font une étoile blanche (`light` 0,4 dès la première image).

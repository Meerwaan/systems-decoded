# 045 · sauvegarde.js — journal

Agent décor, 08/11 (deuxième agent : le premier s'est arrêté sur la demande d'une coupe « de musée »).

## Le niveau voulu (consigne du chef de production)

Un schéma d'encyclopédie animé pour le grand public, pas un plan technique : aucune cote, aucune géométrie réelle, aucun intérieur de boîtier. Chaque pièce se reconnaît par sa silhouette, de trois quarts, à 270 px.

## Ce qui est construit

- **Antenne** : un radôme (dôme clair) sur un collet sombre. Dans la fusée, le dôme sort de la coque (y local négatif) ; sur l'établi il est tourné vers le haut (la bande posée au sol le cacherait).
- **Récepteur** : boîtier sombre, couvercle clair à cinq ailettes, une diode veille qui respire (`watch`). Un câble le relie au verrou (il s'étire dans l'éclaté).
- **Sécurité-armement** : boîtier fermé, plaque claire vissée avec une fente ; derrière, un disque témoin à quartiers (veille le long de la chaîne, signal en travers) et un moyeu sombre qui cache leur jonction : `arm` 0 = la fente est signal, 1 = veille, un quart de tour entre les deux (vérifié sur trois images, 0 / 0,5 / 1). Une douille où s'enfiche le détonateur.
- **Détonateur** : petit cylindre fermé, bague, bout arrondi, enfiché dans la douille.
- **Cordeau** : gaine sur trois pontets, embouts clairs ; il s'allonge de 20 à 40 cm dans l'éclaté (ROW).
- **Charge** : profilé en chevron (stylisé, 7 × 4,6 cm, plus grand que `SYS.charge.w/h` pour se lire), paroi claire, face intérieure plus claire encore, creux dessous ; bouchons sombres en retrait aux bouts. `section` montre le chevron en bout, creux, rien dedans.
- **Bande de coque** : seulement sur l'établi (dans la fusée la coque est le verre de `fusee.js` ; la bande cachait toute la chaîne vue de dehors). Sur l'établi, toute la chaîne est posée **2 cm plus haut** (`RAISE` = `SYS.plate.t`) sur quatre cales basses : la place de la plaque sous la charge.
- **Plaque** : dalle d'acier sous la charge (côté coupe), qui monte de sous le sol pendant que la bande sous la charge s'efface (jamais les deux au même endroit) ; elle s'ouvre en deux moitiés qui s'écartent et basculent, sept éclats lents retombent dessus.
- **Lumières** : tête de lumière (sprite) + traîne sur le cordeau et sur le dos du chevron ; lame de jet (une nappe vue de côté + la même vue en bout, pointe brillante en bas) ; anneaux d'écoute (traits fins additifs).

## Ce que fait chaque nombre

- `explode` : l'antenne part d'abord, puis récepteur, verrou, détonateur, cordeau (retards 0 → 0,2, fenêtre 0,62, petit saut, posés au sol à la fin) ; la charge et sa bande glissent vers +x tout de suite, la bande se retire sous la charge. Réversible.
- `litAnt` (antenne, récepteur, câble), `litLock`, `litDet`, `litCord`, `litCharge` : arêtes veille, un peu d'émission.
- `solo` : antenne, récepteur, câble, verrou, détonateur, cordeau s'effacent (la tête de lumière aussi tant qu'elle est sur eux).
- `listen` : trois anneaux montent du sol vers le dôme (dans la fusée : arrivent de dehors), période ≈ 1,8 s.
- `arm` : le disque, un quart de tour.
- `fire` : 0 → 0,2 de la douille au bout du détonateur (il s'allume), 0,2 → 0,6 le long du cordeau, 0,6 → 1 le long du dos du chevron ; la traîne du chevron s'éteint quand `jet` passe 0,05 → 0,4.
- `section` : moitié arrière (x < cut) de la charge, de la bande et les cales s'effacent ; la face coupée regarde −x.
- `jet` : 0 → 0,5 la face intérieure s'allume, la lame naît sous le chevron, sa pointe atteint le dessus de la plaque à 0,5 ; 0,5 → 0,78 elle traverse ; la plaque s'ouvre 0,55 → 0,95 ; éclats 0,6 → 1. **`plate` doit être à 1 avant `jet` 0,5.**
- `plate` : 0 → 0,4 la bande sous la charge s'efface, 0,2 → 1 la plaque monte à sa place.
- `watch` : respiration 3,2 s — diode, disque veille, arêtes de toute la chaîne à 0,3–0,5 veille (c'est ce qui se lit dans la case à 4 m).
- `bench` : orientation du radôme, cales, bande, `RAISE`. `shown` : tout, multiplié.

## Poses vérifiées (sur l'établi : la chaîne est 2 cm plus haut que sur bouchon)

Vérifiées sur planche (B = la constante de `world.js`) :
- `benchIn` (assemblée, entière) : `{ ...B, tx: -14, ty: 6, tz: 0, d: 320, az: -56, el: 22, shift: 40 }`
- `exploded` (la rangée entière) : `{ ...B, tx: -14, ty: 6, tz: 0, d: 430, az: -64, el: 22, shift: 40 }`
- `antenna` : `{ ...B, ...CLOSE, tx: ROW.antenna, ty: 5, tz: 0, d: 80, az: -24, el: 12, shift: 0 }`
- `lock` : `{ ...B, ...CLOSE, tx: ROW.lock, ty: 8.8, tz: 6.5, d: 60, az: -30, el: 14, shift: 0 }` (tz vise la fenêtre)
- `charge` : `{ ...B, tx: chargeMid, ty: 3, tz: 0, d: 150, az: -66, el: 16, shift: 40 }`
- `section` : `{ ...B, ...CLOSE, tx: ROW.cut, ty: 4, tz: 0, d: 34, az: -56, el: 14, shift: 0 }`
- `blast` : `{ ...B, tx: chargeMid + 4, ty: 3, tz: 0, d: 120, az: -64, el: 14, shift: 0 }`
- `jetView` : `{ ...B, ...CLOSE, tx: ROW.cut + 2, ty: 1, tz: 0, d: 34, az: -74, el: 8, shift: 0 }`
- `plateView` : `{ ...B, ...CLOSE, tx: 62, ty: 0, tz: 0, d: 60, az: -72, el: 18, shift: 0 }` (ou `tx: 60, d: 56, az: -80, el: 10`)
- `padBay` : celle de `world.js`, telle quelle (la chaîne debout dans la case, radôme en haut, arêtes veille).

Non vérifiées : `detView` → `d: 40, ty: 1.6` (à d 24-30 le détonateur déborde) ; `cord` → `ty: 2.4` ; la couverture.

**Conflit à trancher par l'acte 2** : la rangée entière (≈ 200 cm) ne tient dans un cadre vertical qu'en diagonale (az ≤ −56) ; à az −8 / −18 (`benchIn`, `exploded` de l'architecte), on n'en voit que le milieu. Garder l'ordre « az décroît » impose soit une glissade le long de la rangée au lieu d'un plan d'ensemble, soit de passer de −64 à −24 par une coupe.

## Ce qui n'est pas au niveau

- La face intérieure plus claire du chevron se distingue mal en `section` quand `litCharge` vaut 1 : les arêtes veille dominent. `litCharge` ≈ 0,4 pendant la section la laisserait lire.
- À `jet` 0,3, le creux allumé et la lame naissante font encore un triangle lumineux qui peut se lire « vers le haut » ; à partir de 0,5 (pointe brillante en bas, plaque qui s'ouvre), le sens est net. Passer vite sur 0 → 0,5.
- Le front sur le dos du chevron (`blast`) est une bande large plutôt qu'un trait.
- Dans la fusée, la fenêtre du verrou regarde le long de la peau : à `padBay` on ne lit pas son état, seulement la chaîne qui veille.

## À changer ailleurs

1. `world.js` → `VIEW` : les poses ci-dessus (benchIn, exploded, antenna, lock, charge, section, blast, jetView, plateView ; detView `d: 40, ty: 1.6`, cord `ty: 2.4`).
2. `episode.json` → `cover.cam` (celle de l'architecte coupe la rangée à gauche) : `{ "tx": -14, "ty": 6, "tz": 0, "d": 460, "az": -64, "el": 28, "shift": -300, "side": 0, "fov": 30, "roll": 0 }` — non vérifiée, à regarder avec `npm run cover`.
3. `docs/045-actes.md` : `plate` à 1 avant `jet` 0,5 ; `litCharge` ≈ 0,4 pendant `section`.

## Images lues

30 (planches p1 à p4, `.cache/planches/045/sauvegarde/`).

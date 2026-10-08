# 011 — model.js (le fusible pyro) : journal

Fichier : `episodes/011-fusible-pyro/src/model.js` (681 lignes, passe au build). Planches et `essais-*.json` : dossier temporaire `scratchpad/011` (jamais dans `renders/`). **30 images lues sur 30** (quatre planches : 8 + 8 + 8 + 6) ; une dernière planche d'une image a été tirée sans être lue, pour vérifier que la page se construit après les dernières retouches.

## Ce qui est construit

Repère du fusible : son boîtier centré sur l'origine, la barre le long de x (le courant va de −x vers +x), le piston descend (−y).

- **Boîtier** en deux coques (74 × 47 × 44 mm), plastique sombre, ses matières à lui (`lid` l'efface) : coque basse (semelle, corps avec la poche du puits, deux pattes de fixation en diagonale avec leur bague, nervures) ; coque haute (épaulements tirés le long de la barre avec la fente où elle passe, tour du piston, goussets, nervures, crochets, collerette de l'allumeur, deux vis M8).
- **Barre** : 17 cm × 22 mm × 3,2 mm, la pièce la plus claire (mate : voir planche 2). Deux moignons (trou de fixation à ±7,3), deux **lèvres** (les cols, plus étroits et plus minces, articulés en ±1,45) et le **morceau** du milieu (±0,85).
- **Piston** : plastique clair, joint sombre, tête en coin émoussé 3 mm au-dessus de la barre. Course 1,2 cm ; il touche la barre à `piston` 0,25.
- **Charge** : pot métallique sous son embase, deux broches, et la prise de l'ordre (elle se soulève de ses broches à l'ouverture).
- **Puits** : une cuvette sous la barre, ouverte vers la caméra (+z) : on voit le morceau s'y poser.
- **Support d'établi** (dans `benchGroup` seulement, ajouté par moi) : deux isolateurs à ailettes, la barre boulonnée dessus par ses deux trous (M8). Le centre du fusible est à y = 7 (FUSE.bench), la barre à 6,24 : sans support il flotterait à 4,6 cm du sol.

## Les nombres de l'état

- `bench` : change le fusible de parent (`group` ↔ `benchGroup`) et de place (FUSE.home ↔ FUSE.bench). Un seul fusible.
- `flow` : tirets signal (période 2,1 cm, 7 cm/s = un neuvième de période par image) sur le dessus et le chant avant de la barre, d'un bout à l'autre, de −x vers +x (ils contournent les trous). Barre coupée : ils s'arrêtent au premier moignon — **sauf si `arc` > 0** : l'arc porte le courant jusqu'au second moignon (c'est ce que dit la séquence Autoliv : l'arc se forme à 0,75 ms, s'éteint à 1 ms).
- `lid` : opacité des deux coques.
- `fire` : boule de lumière sous le pot (cœur blanc, corps veille), colonne de gaz jusqu'à la tête du piston, lumière ponctuelle. Boîtier fermé (`lid` 1) : un éclat vu à travers le boîtier et un filet de lumière au joint des deux coques (sinon, vu de la route, rien ne se verrait).
- `piston` : course. Garde-fou : passé 0,25, le piston pousse le morceau même si `snap` est resté à 0 (il ne traverse jamais une barre entière) ; à `piston` 0,5 le morceau est à mi-chemin, les lèvres déjà pliées.
- `snap` : le morceau descend de 0,9 cm sur le fond du puits, les lèvres plient de 34°.
- `arc` : ruban (cœur blanc-chaud, gaine signal, halo ; « le plus clair gagne », comme le `bolt.js` du 008) d'une lèvre à l'autre, passant devant le piston ; il ondule lentement. Une lumière ponctuelle signal éclaire le puits et la tête du piston.
- `explode` : colonne sur l'axe du piston — coque haute +7,4 · charge +2,0 (prise +0,6) · piston +1,3 ; la barre, le puits et la coque basse ne bougent pas.
- `litCase`, `litBar`, `litPiston`, `litCharge` : teinte veille + émission + arêtes. Franc à 1 ; « doucement » = 0,5 à 0,7.

Ancres `A` : `fuse`, `bar` (sur le moignon gauche, à −5,4), `stumpL`, `stumpR`, `piston` (suit sa course), `charge`, `pit`, `connector` (l'entrée des fils dans la prise, côté −z). Enfants des pièces : valables dans la voiture comme sur l'établi, et pendant l'ouverture.

## Ce que les planches ont montré

**Planche 1.** La barre « héros » (0xf0f1f1, metal 0,38) bavait : son dessus plat renvoie la lumière de contre comme un miroir. Le boîtier (0x2d3339) était un trou noir bordé de traits → 0x424a53. L'arc était une boule rose. La colonne éclatée complète (coque basse et puits descendus) faisait 16,7 cm : pièces minuscules. Les isolateurs prenaient trop de place à l'œil.

**Planche 2.** La barre bavait encore à az −38, el 13 (incidence rasante) → mate : 0xd4d7d9, rough 0,82, metal 0,1, env 0,55. Plus de bave à aucun angle essayé. **Colonne contre rangée** (les deux côte à côte) : la rangée (coque à gauche, piston au centre, charge à droite) ne grossit rien — c'est la barre de 17 cm qui fixe l'échelle — et perd « derrière lui… une charge ». **La colonne est gardée**, raccourcie : la coque basse reste sous la barre (c'est son siège). La coupe en cinq temps se lit sans légende.

**Planche 3.** L'état coupé et la macro sans arc sont les meilleures images du lot. L'arc brûlait la face du piston (sa lumière était à 3 mm) et faisait des perles (le ruban, plus large que ses ondulations, se replie sur lui-même) → lumière reculée à 1,8 cm, mélange « le plus clair gagne », ondulations plus longues. Les têtes de vis bavaient (acier trop miroir) → rough 0,7. Dans la voiture, un seul tiret de chaque côté → les voies du courant vont jusqu'aux bouts de la barre.

**Planche 4.** Arc : une ligne brisée fine devant le puits, gaine saumon. Dans la voiture (le pack de l'autre agent est arrivé) : le fusible se lit, deux tirets de chaque côté. `fire` boîtier fermé : l'éclat et le filet au joint se lisent. `lit*` à 1 : très vert → émission baissée d'un tiers après cette planche (**non revu**).

## Les poses (toutes essayées, sauf mention) — `fov: 28, side: 0, roll: 0, drift: 0.3`

| | pose | état |
| --- | --- | --- |
| `VIEW.fuse` | `tx: 10, ty: 35.3, tz: 101, d: 48, az: -40, el: 16, shift: 150` | `box: 0` |
| `VIEW.whole` | `tx: 0, ty: 7, tz: 0, d: 62, az: -32, el: 18, shift: 160` | (essayé à shift 160, pas à 60) |
| `VIEW.exploded` | `tx: 0, ty: 10.8, tz: 0, d: 68, az: -38, el: 13, shift: 160` | `explode: 1`, `fy: 10, fs: 11` |
| `casePart` | = `VIEW.whole` (d 60) | `litCase` |
| `barPart` | `tx: 0, ty: 6.6, tz: 0, d: 52, az: -34, el: 17, shift: 160` | `explode: 1, flow: 1` |
| `pistonPart` | `tx: 0, ty: 8.6, tz: 0, d: 26, az: -30, el: 12, shift: 160` | `explode: 1`, `fy: 9, fs: 7` |
| `chargePart` | `tx: 0, ty: 10.6, tz: 0, d: 30, az: -28, el: 10, shift: 160` | `explode: 1`, `fy: 10, fs: 8` |
| la coupe (cinq temps) | `tx: 0, ty: 7.7, tz: 0, d: 36, az: -22, el: 11, shift: 160` | `lid: 0` |
| la macro | `tx: 0, ty: 5.8, tz: 0.4, d: 21, az: -18, el: 12, shift: 160` | `lid: 0`, `fy: 6, fs: 5` |

Les cinq temps, depuis la coupe : `flow 1` · `fire 1.2, piston 0.08` · `fire 0.5, piston 0.5` · `piston 1, snap 1, arc 1.2` · `arc 0, flow 0`.

Côté choisi sur l'établi (quatre azimuts d'un coup : −65, −40, −20, +35) : entre −30 et −40 — la patte avant, la vis de l'épaulement, les nervures de la tour, la prise ; à +35 la face vue est à l'ombre.

## À changer ailleurs

- `world.js`, `VIEW` : coller les poses ci-dessus (`fuse`, `exploded`, `whole`).
- `pack.js` : les barres du boîtier de jonction doivent arriver aux deux bouts de la barre du fusible — x = FUSE.home[0] ± 8,5, dessus de la barre à y = 34,40 (centre 34,24), z = 101, 2,2 cm de large, 0,32 d'épaisseur, trous à ±7,3. Sinon la barre s'arrête dans le vide. Le fil de l'ordre finit sur `world.fuse.A.connector` (dans la voiture : [10, 38,1, 99,5]).
- Dans la voiture, la lueur des modules du pack bave beaucoup derrière le fusible (planche 4) : à doser chez `pack.js`.

## Ce qui n'est pas encore au niveau

- **L'arc** : il se lit (une ligne brisée blanche d'une lèvre à l'autre, devant le puits), mais il reste mince et sa gaine tire sur le saumon (signal + blanc). Il mériterait une passe : cœur plus épais, gaine franchement signal. Uniformes à toucher : `uWidth`, les gains de `arcMaterial`.
- **`lit*`** : baissé après la dernière planche, non revu. Si c'est encore trop vert, tenir 0,5.
- **`VIEW.whole` à shift 60** et **le boîtier effacé (`lid` 0) sur le cadre entier** : non regardés tels quels (l'état `lid` 0 a été vu six fois, de plus près ; `lid` 0,5 sur le cadre entier : oui).
- Le support d'établi (isolateurs) : l'isolateur avant-gauche pèse dans le cadre entier à az −40 ; à −32 ça passe.
- Le pot de la charge reste sombre sous son embase (à l'ombre) : c'est l'embase, les broches et la prise qui font lire « la charge » ; l'éclat de `fire` le désigne.

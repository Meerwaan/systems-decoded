# 033 · Porte d'avion — les décors

Contrat posé par l'architecte le 2026-10-30 (journal : `docs/journal/033-architecte.md`). **La voix est enregistrée (86,1 s)** ; le plan des actes est `docs/033-actes.md`. Deux fichiers, deux agents `decor`, en parallèle :

| fichier | ce qu'il construit | réutilise | taille |
| --- | --- | --- | --- |
| `src/model.js` | **le système, plein** : la porte bouchon, son cadre, ses butées, ses crochets et sa poignée, son hublot — et l'air sur ses deux faces | rien (neuf) | le gros morceau |
| `src/vol.js` | **le vol, aux rayons X** : l'A330 de verre du 023 avec la cabine de verre du L03 dedans, le voisin, toi, le passager de Corée, l'enregistreur du 034 | `023/avion.js` (+ son habillage, appelé par lui) · `L03/cabine.js` + `L03/habillage.js` · `@kit/figure.js` | une enveloppe |

**Commun aux deux.** Le repère est celui de l'A330 du 023, à l'échelle vraie (`src/plan.js`, à lire en entier : 90 lignes) : nez −x, haut +y, **flanc GAUCHE +z**, axe du fuselage y = 0. La porte 1L : milieu du seuil à `DOOR_AT` = (−2420, −96, 280). **Azimut vérifié sur planche** (`kit/lib/stage.js` l. 381) : `az` 0 = caméra du côté +z (DEHORS, devant la porte), −90 = devant le nez, +90 = derrière (dans l'allée, vers l'avant), ±180 = côté −z. **Depuis la cabine, on filme la porte avec `az` ≈ 130 → 170** ; du dehors, `az` −20 → −60. La clé vient de −x, +y, +z : elle éclaire la face EXTÉRIEURE de la porte et le flanc gauche — **la face cabine de la porte est à contre-jour** (vu sur bouchon : elle sort brun sombre sous `mood` 1). Le bouchon construit, `npm run check -- 033` passe ; les actes sont des squelettes. L'état : `FIRST` dans `src/world.js` (liste fermée ; s'il te manque un nombre, « À changer ailleurs »).

« À ne pas dire » qui valent pour l'image (`docs/faits/033-*.md`) : **jamais la porte qui se soulève ni qui pivote vers l'intérieur** (cinématique A320 non sourcée) ; **jamais la poignée qui encaisse** (la charge descend dans les butées) ; « les verrous lâchent » est une hypothèse (l'image reconstitue) ; **aucun toboggan** (le L03 l'a montré) ; aucune compagnie, aucun logo, aucun type d'avion écrit ; aucun nombre de butées dit ou écrit (douze à l'image, comme le 737-9 du NTSB).

## model.js

**Ce qu'il faut construire — PLEIN, à l'échelle vraie, en centimètres** (repère local : origine au milieu du seuil, le panneau dans le plan x-y, **+z vers l'extérieur**, −x vers l'avant ; cotes : `plan.js · DOOR`) :

- **Le cadre de porte** (door surround) : l'encadrement de fuselage autour de l'ouverture de 107 × 193, profond de `frame.d`, sombre (le plus sombre des trois gris) ; sur la face intérieure de ses deux montants, **les butées du cadre** (stop pads) : six par montant (`stops`), petites, usinées (gris clair) — elles s'allument en veille avec `stops` et `named` 4. Un bout de peau de fuselage autour (plein, sombre, une bande de ≈ 20 cm) pour que « plus grande que son cadre » se lise de profil.
- **Le panneau** : plus grand que l'ouverture de `lap` sur chaque bord, épais de `t` ; sa face extérieure (peau) affleure le fuselage, sa face intérieure (doublure) côté cabine est **le gris le plus clair** (c'est la pièce héros vue de la cabine) ; sur ses deux bords verticaux **les butées de la porte** (stop fittings) face aux butées du cadre ; **un hublot** (`DOOR.window`, une vitre de verre, bord plein) — c'est ce qui fait reconnaître une porte d'avion en un tiers de seconde ; un renfort (deux ou trois lisses) qui donne l'échelle.
- **La poignée intérieure** (pivot `handle.at`, longueur `handle.len`) et **l'arbre de verrouillage** le long du bord ARRIÈRE (`hooks.x`) avec ses **trois crochets** (`hooks.ys`) qui prennent des goupilles du cadre. La poignée tourne l'arbre (une biellette visible suffit).
- **Le bras de charnière** (hinge arm) au bord AVANT (`hinge`) : la porte de Corée sort et part vers l'avant dessus. Jamais de levée, jamais vers l'intérieur.
- **L'air** — LA pièce difficile : des flèches sur les deux faces. Leur NOMBRE suit la pression de chaque côté (`pin`, `pout` : fractions du niveau de la mer, calculées par `world.js` depuis `alt`) ; dedans, celles qui sont en surplus sur celles du dehors (`pin − pout`) sont **veille** (ce sont elles qui plaquent la porte), les autres **encre** ; dehors, encre, plus fines. Au sol (`alt` 0) : autant de chaque côté, toutes encre. En croisière : dedans ≈ 3,5 fois plus, la plupart veille. Elles **avancent** vers la porte (le temps : `time`), têtes nettes, jamais de points qui scintillent (traînées). `wall` 0 → 1 : le mur — des flèches veille partout dans la cabine jusqu'à `AIR.reach` (6,5 m) en arrière, qui filent vers la porte ; c'est le climax (« L'air de ta cabine pousse vers la nuit »). `tug` : UNE flèche signal à la poignée, vers la cabine (la force du voisin), minuscule à côté du mur.
- `load` (0–1, calculé) : la porte plaquée sur ses butées — elle s'y enfonce d'un poil (exagéré à quelques millimètres), les butées frémissent (lent, jamais un clignotement).
- `section` 0 → 1 : la porte, le cadre et la peau **coupés par le plan x = 0** (moitié avant retirée) pour qu'on voie le profil de côté : cabine | doublure | panneau | butées | cadre | dehors, et les flèches des deux faces. Une face de coupe pleine et claire, pas un vide.
- `explode` 0 → 1 : chaque pièce part vers la cabine (−z), dans son couloir — le panneau d'abord un peu, la poignée et son pivot plus loin, l'arbre et ses crochets de côté ; le cadre reste. Sur l'établi (`BENCH.turn` = π) la face cabine regarde la clé : **vérifie que la vue éclatée se lit d'un bord à l'autre dans `VIEW.exploded`** (un seul cadre vertical).
- `named` : 1 la poignée · 2 les crochets et leur arbre (les deux nommés à 0,8 s d'écart : ils tiennent dans UN cadre) · 3 le débord (le contour du cadre en encre, la bande du panneau qui le déborde en veille) · 4 les butées (le cœur). Ce qui est nommé s'éclaire, le reste baisse un peu.
- `hooks` 0 → 1 : les trois crochets se retirent **un à un** (bas, milieu, haut), signal pendant qu'ils partent ; `handle` 0 → 1 levée complète (Corée), ≤ 0,25 en vol, par à-coups (le voisin).
- `open` 0 → 1 : Corée seulement — la porte sort de son cadre et part vers l'avant sur son bras (`hinge.rotation.y` négatif : le bord arrière va vers +z), signal. **Pas de levée, pas d'intérieur.**

**Matières** : trois gris (cadre sombre, faces usinées et butées claires, doublure la plus claire), `metal` ≤ 0,5, arêtes fines ; chaque pièce qui s'efface a ses matières ; le hublot en verre du kit. Dans la cabine et sur l'avion, le modèle est le même objet re-parenté (`world.js`) : il doit tenir **en gros plan dans la cabine** (dos à la clé) et **petit sur le flanc** de l'avion (≈ 60 px) — prévois sa propre lumière d'appoint (un liseré, une doublure qui renvoie la lumière de la cabine) plutôt que de compter sur la clé.

**API (définitive, déjà dans le bouchon)** : `buildModel() → { root, parts, A, update(p, time, px) }` ; `p = { explode, named, section, handle, hooks, stops, open, air, pin, pout, load, wall, tug, mood }` ; `A = { mid, handle, hooks, stop, lap, edge, hinge }` (la poignée : là où vont les mains du voisin ; `stop` : une paire de butées, bord arrière, mi-hauteur — le cœur). Les constantes dans `plan.js · DOOR, AIR`.

**Les images à réussir (liste fermée)** — poses de départ dans `world.js · VIEW` (provisoires) :
1. L'établi, `VIEW.exploded`, `explode` 1 : poignée, arbre et crochets, panneau, cadre — chaque pièce lisible à 270 px, la face cabine éclairée.
2. `VIEW.handleB` puis un cadre poignée + crochets ensemble (`named` 1 puis 2) : le geste de la poignée qui tourne l'arbre.
3. `VIEW.lapB`, `explode` 0, `named` 3 : le panneau posé sur son cadre, qui le déborde — se lit sans légende.
4. `VIEW.stopB` (gros plan, `dof`) `named` 4 : une butée de porte sur une butée de cadre, allumées : le cœur.
5. `VIEW.section`, `section` 1, `air` 1, à `alt` 0 puis 11 300 : autant de flèches de chaque côté, puis dehors raréfié, dedans le surplus veille — cabine à GAUCHE de l'écran, nuit à DROITE.
6. Dans l'avion, `VIEW.doorIn` et `VIEW.handle` (depuis la cabine, `az` ≈ 140) : la porte pleine, claire sur son halo, hublot, poignée — elle ne doit plus sortir brun sombre.
7. Dans l'avion, `VIEW.wall`, `wall` 1, `tug` 1 : le mur de flèches vers la porte, la flèche signal du voisin minuscule.
8. Dehors, `VIEW.doorOut` et `VIEW.approach` (`open` 0,4, `alt` 200) : la porte sur le flanc, plaquée (`air` 1) puis entrouverte vers l'extérieur en signal.

**Propre au dossier** : la porte n'est pas un mécanisme qui « fait » quelque chose — c'est une géométrie et une pression. Ce qui doit se comprendre sans voix : (1) elle est plus grande que son trou, (2) elle est DEDANS et s'appuie sur des butées, (3) l'air de la cabine la pousse dehors, donc contre ses butées. Toute la pièce sert ces trois images.

## vol.js

**Ce qu'il faut construire — une ENVELOPPE, aux rayons X** (modèles : `019/cabine.js`, `L01/car.js`) ; on n'édite ni le 023 ni le L03 :

- **L'A330 de nuit** : `buildAvion()` du 023 tel quel (il appelle lui-même son habillage : étoiles, couche de nuages, lumières de l'île) ; tout est accroché à `avion.mount` reculé de `BAY.at` pour pencher avec l'avion. **À neutraliser** : ses couleurs qui ne disent rien ici — gouvernes (`surf` 0 = signal mort : sur la planche, la queue sort en traits signal), circuits (`lines`), réservoirs (`fuel`) — l'avion doit être encre partout, seule la porte a une couleur. Si le 023 ne sait pas les rendre neutres par ses nombres, les cacher depuis l'enveloppe (parcourir `avion.group`, sans toucher au fichier). Ses passagers (`pax`) et son « toi » (`you`) restent à 0 : ceux du L03 sont à bord.
- **La cabine de nuit du L03** dedans (`buildCabine()` + `dressCabine()` du L03, disposition large), son origine en `CABIN_AT` : sa porte 1L tombe sur la 1L du 023 (contours 106 × 188 contre 107 × 193 : ça raccorde). **Son panneau 1L (verre, pack, levier) est caché** : notre porte prend sa place. Vérifie que ses murs ne sortent pas du fuselage (sa demi-largeur 280 contre 265 au plancher) ; au besoin, une échelle de 0,95 en z sur `cabinRoot`. Fumée, feu, toboggan : à 0, toujours.
- **Le voisin** (`@kit/figure.js`, mains `real`) : debout devant la porte, les deux mains sur la poignée (`A.handle` du modèle, lu à chaque image : `buildVol({ handle })`), `pull` 0 → 1 : le corps part en arrière, les bras tendus, les talons calés — et **des à-coups dès l'image 1** (sur le temps, réguliers, pas un tremblement). C'est lui qui fait bouger la première image.
- **Toi**, assis au premier rang côté hublot gauche (`PEOPLE.you`) ; `grip` : ta main crispée sur l'accoudoir (1) qui se desserre (0). **Sur la planche, les passagers du L03 du premier rang s'empilent sur toi** : trouve le siège ou la pose qui te laisse seul lisible (un siège libre, `pax` baissé dans tes plans) et écris-le dans ton journal.
- **Le passager de Corée** (`seated` : 1 assis près de la porte, 2 son bras va à la poignée et la lève) — reconstitution ; il n'est pas toi.
- **L'enregistreur** (`recorder` : 1 dans le cône de queue, plein, gris clair, sa balise cylindrique ; 1 → 2 il tombe dans le noir jusqu'à son halo, `RECORDER.depth` sous la mer) — l'appât du 034, 4,5 s du film.

**Réglages qui changent l'allure** (023) : `shell` (≈ 0,35 dans la cabine, 1 dehors), `wind` (traînées le long du flanc), `alt` (profondeur de la mer), `ahead` + `runway` + `gear` (Corée : la piste et ses feux devant, signal — `made` reste 0) ; (L03) `lights` 0,15 (vol de nuit, lumière baissée), `pax`, `emerg` 0.

**API (définitive, déjà dans le bouchon)** : `buildVol({ handle }) → { group, A, update(p, time, px) }` ; `p = { alt, ahead, pitch, bank, wind, shell, runway, made, gear, cabin, lights, emerg, pax, voisin, pull, seated, you, grip, recorder, mood }` ; `A = { door, voisin, you, seated, recorder, floor, aisle }` ; `A.door` est le groupe où `world.js` accroche le modèle. Exporte aussi `groundOf(alt)`, `thresholdOf(ahead)`.

**Les images à réussir (liste fermée)** — poses de départ dans `VIEW` (provisoires) :
1. Les quatre candidates de la première image (`docs/033-actes.md`, en bas) sur le vrai décor : planche de quatre, au même instant, à rendre à celui qui orchestre.
2. `VIEW.plane` : l'A330 de nuit de trois quarts bas, la porte 1L lisible sur son flanc, l'avion encre partout ailleurs.
3. `VIEW.floor` → `VIEW.deep` : la plongée à travers le plancher de verre — les dix kilomètres de nuit, la couche de nuages traversée, les lumières de l'île tout en bas (sans aucune longueur affichée).
4. `VIEW.you` : toi assis, la porte juste à côté, le voisin dessus — lisible à 270 px.
5. `VIEW.aisle` : l'allée vers la porte (le seuil ; ≤ 40 cm/s le long de l'allée, règle du L03).
6. `VIEW.approach` : bas au-dessus de la piste, ses feux devant, train sorti, la porte entrouverte en signal.
7. `VIEW.tail` puis la chute de l'enregistreur jusqu'à son halo.
8. Le voisin seul, de dos et de trois quarts, `pull` 1 : il tire de tout son poids, sans que la porte bouge.

**Propre au dossier** : on est en croisière, rien ne brûle, personne n'évacue : la cabine est calme, sombre, endormie ; la seule tension est le voisin. L'avion du 023 est de nuit au-dessus de la mer : c'est notre « plus de dix kilomètres » (maquette : la mer dessinée à ≈ 320 m sous l'avion, aucune longueur affichée, `sources` le dit).

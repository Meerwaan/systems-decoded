# 016 — `model.js` (le système : le disjoncteur) : journal

Fichier : `episodes/016-disjoncteur/src/model.js`. API : `buildSystem()` → `{ root, update(P, time, px), A, parts }`.
Planches et `essais.json` : dossier temporaire `scratchpad/016/model-*` (générateur : `model-essais.mjs`, listes dans `model-sets.json`). Budget : 30 images lues — **30 lues** (8 + 8 + 2 + 7 + 4 + 1).

## Parti pris

- Tout le mécanisme est dessiné dans le plan (z, y) — z : du rail (0) à la façade (6) et la manette (7) ; y : de la borne du bas (0) à celle du haut (8,5) — puis épaissi selon x. On le regarde par le côté −x.
- Boîtier : le profil d'un vrai modulaire (épaulements à z = 4,4 où débouchent les vis des bornes, nez de 4,4 cm, fenêtre du rail DIN au dos avec ses deux becs, bouches des fils en haut et en bas, fente de la manette, six rivets sur le flanc, « C16 » imprimé en façade). Deux demi-coques : un flanc + des parois ; celle du fond (+x) a un fond sombre, trois nervures et les axes des pièces.
- Disposition (de gauche à droite, vue du côté −x) : la chambre contre le rail, entre ses deux cornes ; les contacts devant sa bouche (le fixe en haut, sous la borne d'arrivée ; le bras mobile s'ouvre vers le bas) ; le ressort (derrière le bras), la barre du verrou, la lame, puis le nez avec la manette. La bobine est couchée sous la chambre, son noyau part vers le pied de la barre.
- Le verrou est UNE barre sur un axe : le noyau la frappe en bas (vers la façade), la lame la pousse au-dessus de l'axe (vers le rail) — les deux la font tourner dans le même sens ; sa tête glisse de sous l'ergot du bras.
- La biellette est rigide (sa longueur et la place du maneton sont résolues à la construction pour tomber juste en marche ET à l'arrêt). Au déclenchement (`latch` 1, `gap` 1, `handle` encore 1) elle n'atteint plus le pied du bras : le « déclenchement libre » d'un vrai disjoncteur.
- Le ressort se tend avec `gap` : c'est lui qui ouvre quand le verrou lâche.

## Fait

- Le boîtier (deux demi-coques pleines, deux vitres pour `xray`), les deux bornes à cage et leurs vis, la chambre (11 plaquettes à encoche en V, épine en fibre, corne basse), le contact fixe (patte, pastille, corne haute), le bras mobile (poutre, pastille, pied, ergot), le ressort (9 spires, deux formes fondues), la barre du verrou, la manette (moyeu, levier, maneton) et sa biellette, la lame (deux métaux, 30 tranches, forme courbée en cible de fondu), sa bride, la tresse (suit `gap` et `bend`), la bobine (six spires de gros fil sur un mandrin, fils d'amenée) et son noyau, les anneaux du champ.
- Le courant : sept tronçons de gaine de lumière posés sur la face visible des conducteurs, un seul `aS` d'une borne à l'autre ; tirets de 0,5 cm à 1,6 cm/s (0,053 cm par image : un neuvième de période).
- L'arc : un ruban face à l'œil (cœur chauffé à blanc, gaine signal, halo), deux pieds en boules de lumière, une lumière ponctuelle ; découpé : douze petits rubans (un par intervalle, cornes comprises).
- L'éclaté : en bas le capot (à gauche) et la demi-coque du fond (à droite), les bornes et la chambre sorties devant leurs logements ; en haut UNE rangée, dans l'ordre de la voix : manette et biellette · verrou · ressort · contact fixe · bras · lame (et tresse) · bobine (noyau tiré).

## Raté, et pourquoi

- Premier éclaté : coques aux deux bouts d'une rangée de 19 cm → les pièces du mécanisme faisaient 20 px. Les coques font 7 × 8,5 cm, les pièces 0,3 à 2 cm : aucune disposition ne les montre toutes grandes. Resserré (13,5 cm de large) ; la rangée du haut est faite pour un travelling rapproché.
- Courant à `load` 3 : gaine gonflée, tout bavait (une bouillie blanche, l'arc invisible dedans). Devenu un trait fin chauffé à blanc dans une gaine signal ; la bobine a un gain propre (ses spires se touchent : leurs gaines s'additionnaient).
- Plaquettes à émission 0,5 pendant l'arc découpé : des ailettes roses peintes. Ramenées à 0,13 : ce sont les petits arcs qui éclairent.
- La lame en métal « métallique » (0,4) : ses faces plates ne reflétaient que le studio, noir — une planche gris sombre, pas « nettement plus claire ». Deux gris mats et clairs, une émission de fond.
- Intérieur trop sombre au premier jet (pièces 0x3d–0x4d) : éclairci d'un cran partout, la coque aussi (le fermé se lit mieux, la manette sombre s'en détache).
- Dans le tableau : depuis az −62 on ne voit pas le disjoncteur, on voit le flanc du différentiel (voir « À changer ailleurs »).

## Poses (complètes avec `fov: 28, side: 0, roll: 0, drift: 0.3`)

Sur l'établi (le disjoncteur est debout sur l'origine) :

1. Fermé (`cover` 1) : `{ tx: 0, ty: 4.2, tz: 3, d: 46, az: -40, el: 14, shift: 150 }`
2. Ouvert, `load` 1 — l'image du film : `{ tx: 0, ty: 4.2, tz: 3, d: 46, az: -62, el: 12, shift: 150 }` (c'est `VIEW.whole` ; le sujet tient entre 455 et 1165 px)
3. Éclaté, tout : `{ tx: 0, ty: 6.1, tz: 3.3, d: 63, az: -60, el: 12, shift: 160 }` · la rangée du haut seule : `{ tx: 0, ty: 10.8, tz: 3.3, d: 50, az: -60, el: 8, shift: 150 }` · pour nommer une pièce, viser son ancre (`A.handle`, `A.spring`, `A.contacts`, `A.blade`, `A.coil`) à d ≈ 26–30, même azimut. Places le long de la rangée (monde = [0,5 s ; 10,8 ; 3,3 + 0,866 s]) : manette s = −5,65 · verrou −3,85 · ressort −3,05 · contacts −0,2 à +2,3 · lame 2,85 · bobine 4,4.
4. La lame : `{ tx: 0, ty: 3.2, tz: 3.9, d: 20, az: -80, el: 6, shift: 120 }` (`bend` 0 → 1 : son bout va vers la gauche de l'image et touche la barre)
5. La bobine : `{ tx: 0, ty: 2.7, tz: 2.3, d: 20, az: -62, el: 10, shift: 120 }`
6. Déclenché (`latch` 1, `gap` 1, `handle` 0) : la pose 2
7. L'arc : `{ tx: 0, ty: 5.0, tz: 2.4, d: 22, az: -62, el: 10, shift: 120 }` (`split` 0 · 0,45 : l'arc long, debout dans la bouche de la chambre — la plus forte · 1)
8. `load` 3 : la pose 2
9. Dans le tableau (`xray` 1, `others` 0, lumière : `fx, fy, fz` sur le disjoncteur, `fs` 7) : `{ tx: HX, ty: HY + 4.2, tz: HZ + 3.5, d: 46, az: 56, el: 12, shift: 0 }` — du côté +x, là où les autres disjoncteurs se sont effacés.

## Pas vu en image (budget)

`cover` et `xray` à mi-course ; `litHandle`, `litSpring`, `litContacts`, `litChamber` (seuls `litBlade` et `litCoil` ont été vus) ; les anneaux du champ en mouvement ; le déclenché après les derniers changements de gris (vu une fois, au premier jet).

## À changer ailleurs

- **`wall.js` ou `plan.js` — le différentiel cache le disjoncteur.** Le différentiel occupe les emplacements 0–1, le disjoncteur le 2 : vu du côté −x (az < −10, donc `VIEW.system` à az −62, d'où part le raccord vers l'établi), on filme le flanc plein du différentiel. Au choix de celui qui orchestre : (a) dans `wall.js`, le différentiel passe en verre quand `others` tombe à 0 (il reste là, en traits) — le plus simple ; (b) dans `plan.js`, `ROW = { x0: -187.2, hero: 0, diff: [1, 2], last: 8 }` (le disjoncteur en tête de rangée, son voisin à sa droite) ; (c) garder tel quel et filmer le tableau depuis az +56 (pose 9) — mais le raccord vers l'établi (az −62) ne tombe alors plus sur le même côté.
- `world.js`, `VIEW.exploded` : `{ ...P, tx: 0, ty: 6.1, tz: 3.3, d: 63, az: -60, el: 12, shift: 160 }` ; ajouter `row: { ...P, tx: 0, ty: 10.8, tz: 3.3, d: 50, az: -60, el: 8, shift: 150 }`.
- Les deux vitres du disjoncteur sont dessinées à l'ordre 17 (`asShell`), juste avant le coffret de `wall.js` (18) : ce qui est dedans passe d'abord.
- `sources` (episode.json) : le disjoncteur est unipolaire ; la lame fait 2 mm d'épaisseur (0,8 à 1 mm en vrai), le fil de la bobine et la tresse sont grossis, la chambre n'a pas de joue du côté de la caméra, l'ordre lame → bobine sur le chemin du courant est celui de la consigne (dans beaucoup d'appareils la bobine est du côté de la borne d'arrivée).

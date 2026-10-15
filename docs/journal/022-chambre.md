# 022 — `chambre.js` (la chambre, la nuit ; les rangs) : journal

Fichier : `episodes/022-batterie-telephone/src/chambre.js`. API : `buildChambre()` → `{ group, ranks, anchors, update(s, time, px) }` (et, en plus, `fx`, `you`).
Planches et `essais.json` : dossier temporaire `scratchpad/022/chambre-*`. Budget : 30 images lues.

## Parti pris

- **L'oreiller est une lentille molle** (deux peaux qui se rejoignent sur une couture, coins pincés), creusée sous ta tête, et **voûtée au-dessus du téléphone** : son dessous fait une petite arche ouverte vers −x (vers la caméra), par où entre le câble. La « poche » de chaleur, c'est cette arche : son plafond est le dessous de l'oreiller.
- **La chaleur a un endroit** : le plafond de l'arche est teinté signal (cœur au-dessus du téléphone, traîne vers la bouche de l'arche), une flaque étroite s'échappe sur le matelas vers −x, une lumière « vue de loin » (cœur brillant, longue traîne) se tient à la bouche de l'arche, et des grains montent du dos du téléphone, butent sous le plafond, y glissent un peu et y restent. Oreiller levé ou téléphone sorti : ils montent libres, en traînées, et s'éteignent en hauteur.
- **`pillow` ne soulève pas l'oreiller tout droit : il le replie** — le coin côté caméra (−x, +z) se relève comme une page, autour d'une charnière qui passe juste devant ta tête ; ta tête reste posée. Le coin monte de `PILLOW.lift`. (Fait dans le shader de sommets : le même pli porte l'oreiller, son verre de coque et la teinte de son dessous.)
- **La couette** : une surface drapée sur ton corps (calculée d'après ta pose), dessinée par son contour là où elle est posée sur toi, son ourlet et un matelassage en carreaux qui s'efface avant de se serrer : à plat et en rasant elle ne donne rien — pas de dalle grise.
- **Toi** : `makeFigure` en coque, tout en verre, tête sculptée (celle des 012 / 016 / 017), couché sur le côté droit, tourné vers −x, genoux repliés, une main sous le bord de l'oreiller. Tu respires (`time`) : le buste et la couette.
- **Le matelas n'a pas de face du dessus** : ses traits, trois flancs de verre.
- **Le câble** : un tube sombre recalculé seulement quand `place` ou `plug` changent (une spline par dix points, trois tracés : sous l'oreiller, sur la table, au sol), des tirets encre de 3 cm tous les 6 cm à 9 cm/s (un vingtième de période par image).
- **Les rangs** : une seule géométrie instanciée (dalle aux coins ronds, une lentille ronde au dos), dessinée par son propre shader — arêtes claires, braise signal à cœur, flancs éclairés côté clé — et une lueur au sol sous chacune (le « jour »). Fondu dans le noir par numéro de rang.

## Journal

Fait le 14/10, de 4 h 59 à 5 h 28, **30 images lues sur 30** (8 + 8 + 8 + 1 + 4 + 1) ; le reste contrôlé à la mesure (moyennes de bandes d'image avec `sharp` : `scratchpad/022/chambre-mean.mjs`).

### Planche 1 (8 images, `--bare`) — le fichier passe au build du premier coup

- La couette : **une dalle grise** (le pan qui retombe côté caméra prenait le « relief », le corps sous elle était un nuage). Refaite : presque plus de remplissage, rien sur ce qui pend (9 cm au lieu de 15), le contour seulement là où elle est posée sur toi, un matelassage en carreaux de 21 cm, l'ourlet.
- `VIEW.under` (d 62) : la lueur remplissait tout le cadre — un voile. Plafond de l'arche et flaque resserrés (cœur plus étroit, traîne plus courte).
- Le dessus de la table de nuit : une dalle grise (verre à lèvre, vu en rasant). Passé en verre sans lèvre.
- Les grains : blancs (HDR 2,3 par-dessus la lueur) → 1,4, et assombris tant qu'ils sont retenus.
- `POSE0` tel que donné : le corps sort à droite, sous les boutons de TikTok, la moitié basse est vide.

### Planche 2 (8 images, avec l'en-tête et les zones) — quatre cadres d'ouverture

- Vu de −x (az −60 … −76) la bouche de l'arche est face à nous ; trop de face et trop bas (az −76, el 8) ton buste devient une boîte. Le bon secteur : az −46 … −60, el 15 … 20.
- La lueur était trop petite pour 270 px : ajout de la lumière « vue de loin » (le `halo()` du 006) à la bouche de l'arche, et `heat` pèse plus dans la poche (0,7 au lieu de 0,45).

### Planche 3 (8 images) — quatre cadres rapprochés ; les rangs : tout l'établi BLANC

- Isolé à la mesure, sans image (une couche cachée puis l'autre, puis le shader réduit terme à terme) : c'est la lueur au sol sous chaque jumeau, et dans son shader le terme `pow(1.0 - x, 2.2)`, où `x` atteint 1. Remplacé par un carré : l'établi est redevenu noir. **Mon hypothèse, non prouvée au-delà** : sur cette carte (ANGLE / D3D11) `pow(0.0, 2.2)` ne rend pas zéro, et le bloom étale le résultat. À retenir par prudence : la base d'un `pow` reste strictement positive (ou pas de `pow`).

### Planche 4 (4 images), puis une dernière

- Rangs : des centaines de braises en rangs, le rappel éteint le fond d'abord. Ils montaient jusque sous l'en-tête : fondu avancé de deux rangs (nuls au 18ᵉ, y ≈ 490 à `VIEW.ranks`), braises un cran plus bas (ça bavait).
- L'ouverture retenue et l'oreiller replié : vus, bons.
- La poche de près (`trapped` 1, `heat` 0,8) : le plafond de l'arche teinté, les grains dessous, le cœur sur le téléphone ; son cœur et sa lumière lointaine sont plafonnés (ils n'inondent plus le cadre).

## Chaque nombre, chez moi

| | |
| --- | --- |
| `room` | 1 : la chambre ; 0 : les rangs (s'ils sont demandés) |
| `fade` | multiplie TOUT ; sous 0,004 le groupe entier est invisible |
| `shell` | murs (trois feuilles de verre, traits), fenêtre et rideau en traits, grille du sol, lit (traits, flancs de verre, tête de lit), **couette**, table de nuit, plaque de la prise et chargeur. **Ni toi, ni l'oreiller, ni le câble, ni la chaleur n'en dépendent** |
| `you` | toi (verre) ; à 0 la couette retombe à plat |
| `cloth` | l'oreiller : 1 un corps de verre dense, sa couture → 0 un contour (sa lèvre, sa couture) |
| `pillow` | 0 posé → 1 **replié** : le coin côté caméra (−x, +z) se relève de 42° autour d'une charnière qui passe devant ta tête ; il monte de ≈ 26 cm (`PILLOW.lift`), le téléphone est à découvert, ta tête n'a pas bougé |
| `trapped` | les grains (170) : ils montent du dos du téléphone, butent sous le plafond de l'arche, glissent un peu vers sa bouche et restent ; et, avec `heat`, la lumière de la poche (plafond teinté, flaque sur le matelas, lumière lointaine). Dès `pillow` > 0,05 ou `place` > 0,1 : les grains montent libres (en traînées) et s'éteignent vers 40 cm, moitié moins nombreux ; la lumière de la poche s'éteint |
| `heat` | pèse dans la lumière de la poche : `0,7 · heat + 0,75 · trapped`, plafonné |
| `plug` | 1 : l'embout dans le port · 0 : reculé de 4,5 cm, posé ; les tirets s'arrêtent |
| `charge` | 1 : tirets encre qui courent vers le téléphone (3 cm tous les 6 cm, 9 cm/s) · 0 : les mêmes tirets, arrêtés et pâles |
| `place` | le bout du câble suit le téléphone (0 → 1 ; au-delà seulement s'il est branché, sinon il reste sur la table) ; les grains suivent le téléphone ; de 1,02 à 1,3 le chemin veille pointillé apparaît au sol, de la table au cercle d'isolement |
| `ranks` | les jumeaux arrivent rang après rang, les plus proches d'abord (ils se posent de 3 cm) |
| `recall` | leurs braises s'éteignent du fond vers nous (une vague de cinq rangs) ; à 1 il ne reste que des dalles aux arêtes claires |

Ancres : `pillow` (dessus de l'oreiller posé), `pocket` (la bouche de l'arche, côté −x du téléphone), `head` (au-dessus de ta tête), `socket`, `table`.

## Écarts au plan, voulus

- **Ta tête est à y = 68, pas 63** : à 63 elle est dans l'oreiller. `anchors.head` suit.
- **Les rangs : 15 colonnes (i de −7 à 7) sur 22 rangs**, pas 9 sur 46 : à `VIEW.ranks` les rangs du fond ne remplissaient pas la largeur, et au-delà du 18ᵉ rang ils sont dans le noir.
- **`pillow` replie un coin**, il ne soulève pas l'oreiller entier (ta tête est dessus).

## Les poses

- **Première image, quatre candidates** (état `FIRST`) :
  1. **retenue** `{ tx: -8, ty: 59, tz: -68, d: 250, az: -52, el: 17, fov: 36, shift: 160, side: 20 }` — toi de y ≈ 440 à 1070, la lueur à gauche du centre vers y ≈ 900, rien sous les boutons ;
  2. `{ tx: -8, ty: 60, tz: -70, d: 235, az: -60, el: 15, fov: 36, shift: 150, side: 0 }` — la bouche de l'arche face à nous ;
  3. `{ tx: -4, ty: 58, tz: -66, d: 270, az: -46, el: 20, fov: 36, shift: 160, side: 40 }` — plus de corps, le cœur de la lueur plus blanc ;
  4. `{ tx: 0, ty: 56, tz: -62, d: 300, az: -42, el: 38, fov: 36, shift: 170, side: 0 }` — d'en haut, ton corps replié (tes genoux touchent le bord droit vers y ≈ 950 : sous les boutons).
- lit entier : `VIEW.bed` tel quel · câble : `VIEW.cable` tel quel · loin du lit : `VIEW.away` tel quel · rangs : `VIEW.ranks` tel quel.
- la poche : `{ tx: -18, ty: 57, tz: -76, d: 190, az: -52, el: 14, fov: 32, shift: 180, side: 0 }` (`trapped` 1).
- sous le contour : `{ tx: -18, ty: 56, tz: -76, d: 120, az: -50, el: 20, fov: 28, shift: 170, side: 0 }` (`cloth` 0,2 ; garder `trapped` ≤ 0,6 de si près).
- l'oreiller replié : `{ tx: -18, ty: 60, tz: -76, d: 190, az: -52, el: 16, fov: 32, shift: 180, side: 0 }` (`pillow` 1, `trapped` 0,3).
- sur la table : `{ tx: -120, ty: 58.6, tz: -92, d: 100, az: -38, el: 24, fov: 28, shift: 170, side: 0 }` (`place` 1 ; l'embout retiré est à gauche du cadre).

## Ce qui n'est pas au niveau

- **La couette ne se lit presque pas** : un matelassage fin et un ourlet. Tu as l'air couché sur un matelas nu. Elle ne fait plus de dalle grise, mais elle ne dit pas « couette ».
- **L'oreiller replié a l'air d'une feuille** (verre mince) plutôt que d'un oreiller épais qu'on soulève.
- Le dessous de l'oreiller n'a pas de matière : la poche se lit par sa lumière, pas par un bord dessiné.
- Vu de face et de bas (az < −70, el < 10), ton buste est une boîte.
- Le chargeur, la prise, la fenêtre, la table : simples. Le câble branché pour `place` 2 traverse la pièce (jamais regardé).
- **Jamais regardés, seulement mesurés** : `ranks` 0,5, `recall` 1, `you` 0 avec `cloth` 0, `fade` 0. `VIEW.cable` avec `charge` 0 (tirets arrêtés) n'a été vu que sur la table ; les rangs n'ont pas été revus après leurs deux derniers réglages (fondu, braises).
- La respiration n'a été vue sur aucune image en mouvement.

## À changer ailleurs

- `world.js`, `POSE0` : `{ tx: -8, ty: 59, tz: -68, d: 250, az: -52, el: 17, fov: 36, shift: 160, side: 20, roll: 0, drift: 0 }`.
- `world.js`, `VIEW.pillow` : `{ ...P, tx: -18, ty: 57, tz: -76, d: 190, az: -52, el: 14, fov: 32, shift: 180 }` ; `VIEW.under` : `{ ...P, tx: -18, ty: 56, tz: -76, d: 120, az: -50, el: 20, shift: 170 }` (tel que donné, d 62, on ne voit que le téléphone) ; `VIEW.table` : `{ ...P, tx: -120, ty: 58.6, tz: -92, d: 100, az: -38, el: 24, shift: 170 }`.
- `plan.js`, pour mémoire seulement : `RANKS = { pitch: [21, 12], half: 7, rows: 22 }` est ce que je dessine ; `YOU.head` à y 68.
- `CLAUDE.md`, « Net et fluide », si l'hypothèse se confirme ailleurs : la base d'un `pow` doit rester strictement positive (un `pow(1.0 - x, 2.2)` avec `x` à 1 a blanchi tout l'établi ici).

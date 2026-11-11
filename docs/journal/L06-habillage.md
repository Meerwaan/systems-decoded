# L06 · habillage.js — journal du décorateur (10/11)

Fichier : `episodes/L06-blackout/src/habillage.js` (`dressEms`, `dressQuartier`). Planches : `.cache/planches/L06/habillage/` (`avant.jpg`, `apres.jpg`, `zoom1.jpg`, `fin.jpg` + leurs `.json`).

## Les touches

| # | Lieu | Touche | Pourquoi | Suit |
|---|---|---|---|---|
| 1 | Ems | **Les fermes de la plaine** : ≈ 420 lumières de cour, 1 à 3 par ferme, sur les routes de campagne (points ≥ 3 px, fixes) | des gens vivent sous cette ligne ; la plaine a une profondeur. Hors du fleuve, du couloir, et **hors du cône de `hook1`** (l'éclair reste seul sur son horizon) | `shell` |
| 2 | Ems | **Papenburg** (autour du hall, côté terre) et **Leer** (en aval, décalée à l'ouest du bout du fleuve) | la traversée est entre deux villes ; le chantier est dans la ville. Étalées : une ville lointaine ne fait jamais une boule derrière les câbles | `shell` |
| 3 | Ems | **Le chantier travaille la nuit** : deux projecteurs sur mât (`glow`) aux deux bouts du hall, côté terre | le hall vivant ; jamais devant le paquebot de verre | `shell × hall` |
| 4 | Quartier | **La ville autour**, jusqu'à l'horizon (`nightLights`, 5 200 points, r 160 m → 2,4 km) | tout le monde branché ce samedi soir ; elle ne suit PAS `shed` (jamais une ville noire) | `town × lights` |
| 5 | Quartier | **L'horloge de ta pièce**, à côté de ta fenêtre, aiguilles fixes à **22 h 10** | l'heure de la première phrase, dans ta pièce | `town × room` |

## Accroche dans le décor (3 lignes, `terrain.js`)

- l. 40 : `import { dressEms, dressQuartier } from "./habillage.js";`
- l. 749 (1ʳᵉ ligne de `buildEms().update`) : `(group.userData.dress ??= dressEms(group)).update(S, time, px);`
- l. 1217 (1ʳᵉ ligne de `buildQuartier().update`) : `(group.userData.dress ??= dressQuartier(group)).update(S, time, px);`

Construit une fois, au premier appel ; le groupe est enfant du groupe du lieu (montré / caché avec lui). **Rien à changer dans `world.js`.**

## Ce qui a raté et a été repris

- 1ʳᵉ passe : Leer dense au centre → une boule lumineuse au bout du fleuve, derrière les câbles (`crossing`) : étalée (`rand^0,6`), k 0,55, décalée à l'ouest.
- Projecteurs côté fleuve, trop petits (2 600) puis, agrandis, **devant le paquebot** sur `hallW` : passés aux deux bouts du hall, côté terre, 8 000, k 0,9 — **pas revus sur planche** (budget d'images épuisé).

## Première image (`hook1`, `tripRun` 0,14)

Avant / après identiques à 270 px ; à 780 px, quelques fermes très faibles sur l'horizon gauche, rien près de l'éclair. Elle n'est pas chargée.

## Ce qui n'est pas au niveau

- Les points (fermes, villes) disparaissent presque en vignette de 400 px : c'est voulu (« s'y devine »), mais le gain ne se voit qu'en grand.
- `crossing` : Leer fait un pointillé fin sur l'horizon, derrière les conducteurs — fin et loin, à juger à la relecture.
- L'horloge tombe au bord gauche du cadre `room` : lisible, pas centrale.
- Pas posé (faute de brique et de budget) : voitures garées, arbres de la rue, brume sur l'Ems.

## Images lues

`avant` 8 · `apres` 8 · `zoom1` 4 · `fin` 4 = 24.

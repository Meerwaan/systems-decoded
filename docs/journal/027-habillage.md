# 027 · `src/habillage.js` — l'habillage du col (journal du décorateur)

2026-10-22. Consigne : habiller `col.js` seulement (recette `docs/recette-decorateur.md`). Planches dans le dossier temporaire de la session (`scratchpad/027-habillage/`), jamais dans `renders/`.

## Planche avant (8 images, `--bare --no-zones`)

POSE0 (a), a2 (le POSE0 proposé par `camion.js`), (b) la roue, `side` + travel(110), `ahead` + travel(140), `lane` + travel(167), `colTop` + travel(−150), `map` + travel(−120).
Ce qui manquait : la montagne à gauche n'est qu'une masse noire sans échelle (on ne sait pas qu'on est en montagne : `side`, `colTop`, `map`) ; le haut du col n'a rien qui dise « ici commence la descente ». La route, ses balises, la vallée et ses lumières étaient déjà vivantes (`col.js`).

## Les touches

1. **La forêt de sapins sur le versant** (sapins de 6 à 15 m, en bosquets et clairières, champ lent ; jamais sur le bas-côté — seulement là où la montagne a déjà 1,2 m, à 6,5 m au moins du pied ; aucun autour de l'éperon du virage ni après, le côté de la menace ; plus clairsemés sur le replat du col). Raison : un col, c'est une route dans les sapins ; ils donnent l'échelle et font de la masse noire une montagne. Quatre étages de cônes **ouverts dessous** (fermés, leurs bases faisaient des abat-jour lumineux : planche 1, `side`), jitter d'une cellule entière (sinon des rangées), verre très discret (rim 0,1, edge 0,11 : au premier jet ils étaient aussi clairs que le camion). Immobiles : pas de vent.
2. **Le panneau du col** (un panneau vierge sur deux poteaux, cadre et cadre intérieur, aucun texte), au sommet (s −246), bas-côté droit.
3. **Le triangle « descente dangereuse »** (A14 : bord, bord intérieur, le coin qui descend ; aucun chiffre), 15 m après la crête (s −231), bas-côté droit. Raison des deux : « il freinait sans arrêt depuis le haut du col » — le haut du col est nommé et la longue descente annoncée là.

Tout suit `shell` (le P du col) : rien d'autre. Rien ne bouge, rien ne tourne, aucune lueur.

## Planches après

- p2 (4, avec en-tête et zones) : trop discrets après la baisse de clarté ; rien sous l'en-tête n'attire l'œil.
- p3 (4, 540 px) : `side` — la forêt se lit derrière le camion, sur la pente, au-dessus de lui, sans le toucher ; `colTop` — sapins sur le versant à droite, le triangle petit mais lisible à gauche du camion sur la crête ; POSE0 — quelques silhouettes au bord gauche, la remorque et l'axe de la route intacts ; `map` — la forêt en traits sur le flanc gauche.

## Ce qui n'est pas au niveau

- Les sapins sont stylisés (cônes étagés) : de près ils feraient « jouet » — aucune pose prévue ne s'en approche (la plus proche, `side`, est à ≈ 40 m).
- Sur `side`, ils remplissent faiblement le haut du cadre, sous l'en-tête (le `#hud-shade` les couvre ; à revoir si l'acte garde cette pose avec une étiquette en zone haute).
- Le panneau du col est caché par le camion sur `colTop` ; seul le triangle se voit (≈ 40 px à 1080).
- Pas vu en mouvement : les sapins sont à ≥ 8 m de toute caméra qui roule, larges, sans trait fin — au `qa` du brouillon de le confirmer.

## À changer ailleurs

Rien. Pas d'air (`stage.air.source`) proposé : aucune vraie lumière derrière le sujet dans les plans du col (les phares sont devant le camion, la remorque les cache sur l'image 0).

`npm run check -- 027` passe (0 erreur ; les deux avertissements sont ceux d'avant). Images lues : 24 (8 + 8 + 4 + 4).

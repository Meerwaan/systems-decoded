# 028 · `src/model.js` — journal (le détecteur de CO, la maquette du sang)

2026-10-22. Agent du système. Lu : consigne commune, `docs/recette-agents.md`, CLAUDE.md (patte, « jamais amateur », « net et fluide »), `docs/028-decors.md` (haut + ma section), `docs/028-actes.md`, `plan.js`, `world.js`, le bouchon, `kit/lib/build3d.js`, l'idiome de `012/src/model.js` (boule de lumière, tête de courant) et de `022/src/model.js` / `pores.js`, « À ne pas dire » des faits.

## Le dessin (avant d'écrire)
- Détecteur 11 × 11 × 4,4 : boîtier (dos + parois, gris foncé), façade (gris moyen) percée de vraies fentes au-dessus de la cellule et d'une bouche ronde pour le buzzer ; en haut, le voyant (dôme veille) au centre de l'anneau de douze segments (des guides de lumière : la façade montre l'anneau de LED de la carte, juste derrière).
- Dedans : la carte (puce noire au centre de son anneau de 12 LED, la piste imprimée de la cellule à la puce), la cellule (corps foncé, couronne grise, **disque de platine, la pièce la plus claire**), sa membrane devant elle, le buzzer (boîtier, disque piézo, céramique), la pile couchée derrière la carte.
- Trois gris : foncé (boîtier, corps de cellule, carte, pile), moyen (façade, membrane, buzzer, culots), clair (le platine seul). `metal` ≤ 0,45.
- L'éclaté : la rangée de `ROW` (pitch du plan), chaque pièce **grossie dans la rangée** pour se lire (liberté, réglée après la planche 1 : la membrane ×3,1, la cellule ×3, le buzzer ×3,4, la pile ×1,7, la carte ×1,05, la façade ×0,95 — ≈ 10 cm chacune) — sinon trois pièces de 3 cm sur 75 cm de rangée font 45 px. Le mouvement de recul de la caméra cache la croissance.
- Les fils de l'éclaté : la cellule → la carte (le fil où court le courant, veille) ; la pile → la carte et la carte → le buzzer (fils gris, sans lumière) : on lit que la pile alimente, jamais le gaz.
- Au mur, assemblé : le courant se voit À TRAVERS la façade (une lueur sous le plastique, sans test de profondeur, atténuée) — c'est ce qui permet « la tête de courant part » sur `VIEW.system`.

## Fait
- `src/model.js` réécrit en entier, API du bouchon gardée (`buildModel` → `{ root, A, parts, update }`, `buildBlood` → `{ group, update }`, mêmes ancres, mêmes noms de parties). `npm run check -- 028` passe (0 erreur, contraste 60/60).
- Les nombres, chez moi :
  - `bench` : 1 → pas de lumière sur le mur (le halo mural s'éteint).
  - `explode` : la rangée (`ROW.order`, `ROW.pitch`, `ROW.z`), chaque pièce part dans sa fenêtre (façade d'abord, pile en dernier, par l'arrière du boîtier), arrive avec un léger dépassement ; les petites pièces grossissent en route (liberté, voir plus haut) ; le boîtier pâlit à 18 %.
  - `sniff` : 0 → 14 perles signal (leur nombre), période 4,2 s ; au mur elles arrivent droit dans les fentes ; dans la rangée elles longent façade → membrane → se posent sur le platine, chacune à sa place, et brûlent (un éclat qui gonfle et blanchit ≈ 0,9 s, puis s'éteint). Pas de clignotement : l'éclat monte et descend en sinus.
  - `current` : le fil (cellule → plot de la carte) puis la piste imprimée jusqu'à la puce ; une gaine veille (opacité ∝ `current`) et deux têtes de lumière (∝ `current`, ≈ 0,62 tour de chemin par seconde). Assemblé (`explode` < 0,35) : vu À TRAVERS la façade, à moitié.
  - `dose` : les douze segments de la façade ET les douze LED de la carte, dans le sens des aiguilles depuis midi, le segment en cours se remplit en fondu.
  - `alarm` : le dôme du voyant 1,3 → 2,4, sa boule de lumière, une lueur douce sur le mur (0,05 au repos → 0,27), quatre anneaux veille depuis la bouche du buzzer (un toutes les 0,8 s, rayon 0,8 → 12,8 cm, profil fondu sous le pixel).
  - `litGrille` … `litPile` : une boule veille DERRIÈRE la pièce (sa silhouette se découpe sur sa propre lumière) + une teinte émissive de 7 %.
  - sang : `micro` = l'opacité de toute la maquette ; `swap` : 36 perles (9 globules × 4), chacune a son seuil ; au passage, la perle veille s'écarte et s'éteint pendant que la perle signal arrive de l'extérieur — jamais de couleur à mi-chemin. Les globules dérivent à 2,4 cm/s, entrent et sortent en fondu aux deux bouts coupés.
- `finish` (le grain d'usinage du plateau) coupé sur toutes les matières du détecteur (`userData.finish = false`) : sur la façade moulée, il dessinait des stries de velours côtelé.
- Les couleurs : signal = les perles de CO (et leur éclat), veille = voyant, anneaux, courant, alarme, lit…, oxygène. Le platine a perdu un reflet bleuté du studio (`metal` 0,45 → 0,3).

## Planches (30 images lues sur 30)
1. `p1` (8) : mur (system, wall, alarme), établi entier, éclaté az −14 / −30, électrode, sang 0,25. Tout se lit ; défauts : grain `finish` en stries sur la façade, halo mural de l'alarme = un voile, rangée trop petite (pièces ≈ 45 px en vignette), platine bleuté.
2. `p2` (8) : rangée sous quatre azimuts, couverture, mi-éclaté, puce, alarme. Pièces grossies (≈ 10 cm chacune) ; az −14 tient tout mais petit, az −35 / −50 plus vivants (la façade sort à gauche) ; puce et son anneau : très lisibles ; alarme corrigée (anneaux nets, lueur discrète).
3. `p3` (8, avec l'en-tête) : rangée az −32 d 260 tx −5 = la meilleure ; couverture à d 290 (la façade ne sort plus du cadre, la rangée sous y ≈ 1 500) ; `current` 0,3 / 1 : la tête restait cachée derrière la cellule → le fil part maintenant du bord de la cellule côté puce ; sang 0,85 (presque tout signal, lisible) ; `VIEW.pillow` : le détecteur HORS CADRE ; `POSE0` : le détecteur tombe à y ≈ 370, sous l'en-tête.
4. `p4` (6) : `VIEW.pillow` modifiée (ty 95, shift 60) : toujours hors cadre ; électrode 0,3 / 1 avec le nouveau fil : la proportion se lit (gaine et tête plus vives à 1) ; le mur, `current` 1 : la piste lumineuse sous la façade, des fentes à l'anneau ; l'établi `dose` 1 : l'anneau plein.

## Poses qui cadrent (prêtes à coller dans `VIEW`)
- `system`, `wall`, `whole`, `puce`, `blood` : celles de `world.js` cadrent bien, telles quelles.
- `exploded: { ...P, tx: -5, ty: BENCHAT[1], tz: ROW.z, d: 265, az: -32, el: 20, fov: 30, shift: 40 }` — la rangée en diagonale douce, la façade à gauche dans le cadre, la pile près du bord droit (vue à d 260 ; 265 lui donne de l'air).
- `electrode: { ...P, ...CLOSE, tx: -3, ty: BENCHAT[1], tz: ROW.z + 2, d: 70, az: -28, el: 12, fov: 28, shift: 60 }` — le platine, les perles qui s'y posent, le fil et la tête qui partent vers la carte, la carte et ses premiers segments à droite.
- couverture (`episode.json` → `cover.cam`) : `d` 290 au lieu de 250, le reste inchangé (az −14, el 30, shift −520).

## Pas encore au niveau (franchement)
- **Le détecteur vu depuis le lit (image 6, `VIEW.pillow`) n'a pas été vu** : ni la pose de `world.js` ni ma variante ne le mettent dans le cadre. La lumière de l'alarme est faite pour se voir de loin (anneaux de 12 cm, lueur sur le mur), mais le cadre reste à trouver (une planche de quatre poses, par l'acte 3).
- Rangée entière : ≈ 110 à 150 px par pièce (sous les 150 demandés pour les plus lointaines) — six pièces de ≈ 10 cm ne tiennent pas à 150 px chacune dans 974 px utiles ; c'est la caméra qui glisse le long de la rangée qui les donne grandes.
- La pile, couchée et fine, est la pièce la moins forte de la rangée (un bâton) ; la puce, sombre, se lit par ses arêtes et son anneau.
- `current` 0,3 contre 1 : la différence se lit, sans être spectaculaire (la gaine passe de 0,17 à 0,55, la tête de 0,45 à 1,5).
- La lueur murale de l'alarme dépend du mur rouge de l'ambiance (`mood` 1) : vert sur rouge, elle tire vers le jaune si on la pousse — gardée basse.

## À changer ailleurs
- `world.js`, `VIEW` : `exploded` et `electrode` comme ci-dessus.
- `episode.json`, `cover.cam.d` : 250 → 290.
- `world.js`, `apply` (sur l'établi) : le halo de l'établi (rayon 1,4 × SIZE ≈ 17 cm) n'éclaire que le milieu de la rangée (± 38 cm) ; proposer `bench.pool.mesh.scale.setScalar(1 + 1.6 * smooth(clamp01(S.explode)));` juste après `bench.set(...)`.
- `world.js`, `POSE0` : le détecteur tombe à y ≈ 370, sous l'en-tête (236–410) — c'est le choix de la planche des candidates, à régler là (shift plus bas, ≈ 120, ou ty plus haut).
- `world.js`, `VIEW.pillow` : le détecteur hors cadre (voir plus haut).
- `episode.json`, `sources` : une ligne « Vue éclatée : les petites pièces (membrane, cellule, buzzer, pile) sont montrées plus grandes qu'en vrai, pour se lire ; une seule électrode est dessinée ; l'anneau de douze segments est une image du calcul, pas un affichage réel. »

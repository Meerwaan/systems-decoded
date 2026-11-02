# 035 · model.js — le signal G2 (journal de l'agent décor)

2026-11-03. Fichier : `episodes/035-passage-a-niveau/src/model.js`. Planches : `.cache/planches/035/model/`.

## Lu
Recette agents, règles d'image, `docs/035-decors.md` (haut + § model.js), journal de l'architecte, bouchon, `plan.js` (bloc G2, SIGNALS, ROAD), `world.js` (FIRST, VIEW, BENCHED, STAGED, apply), `build3d.js` (API), `blocks.js` (makeBench), faits 035 § 3 et § 9, `softGlow` du 007.

## Choix de construction
- Coffret (fonte sombre) : socle, caisse, capot (pièce à part : il monte le long du mât à l'éclaté), une trappe par face, serrure. Rien dedans (non documenté).
- Moyeu au flanc du coffret (x −30, y 96) ; contrepoids sur un bras côté +x, à z +27 (devant la face du coffret, sinon il traverserait la caisse) ; il tourne avec la lisse (pend quand elle est levée).
- Mât gris moyen (sort du capot), collier, chapeau ; R24 : plaque noire 56 × 56 par face, lunette, lentille bombée rouge sombre, visière, halo doux (softGlow) devant chaque lentille.
- Sonnerie : cloche bouche en bas au sommet du mât (silhouette), frémit avec `ring`, deux ondes encre en arcs « (( )) » face caméra (billboard dans onBeforeRender).
- Lisse : 16 tronçons de 25 cm en chaîne (bandes de 50 cm, la pointe rouge), section ovale 11 × 8, manchon gris à la racine, embout rouge. Chaque tronçon a sa matière (émissive : rétroréflexion par tronçon).
- Trois gris : coffret 0x40464c (fonte), mât 0x8c949b, lisse blanche 0xdedad0 (la plus claire) ; bandes rouges 0x9a3a26 ; `metal` ≤ 0,4. Trappe + serrure + quatre lames d'aération sur chaque face du coffret.
- Rétroréflexion : émissive par tronçon (blanc → ink, rouge → signal), `shine` × un profil plus fort à ≈ 2 m du pivot (là où tapent les phares) ; `sweep` : deux taches de 40 cm, 150 cm d'écart, de la pointe au pivot.
- Liserés : `litLamp` / `litBell` / `litBar` passent les arêtes de leur pièce en veille ; la lisse (sans arêtes) prend un liseré par coque inversée (BackSide, +1,4 cm) ; `litBoom` ajoute un halo veille DERRIÈRE la lisse (ellipsoïde softGlow vu de l'intérieur : la lisse le cache, pas de voile) et, sur l'établi, passe le reste du signal en fantôme (opacité 0,2).
- `give` : 0 → 0,3 la lisse PLIE en porte-à-faux sous le capot (courbure ∝ (205 − s), 0,34 rad au contact : se lit d'en haut), 0,3 → 1 elle pivote vers −z (1,06 rad), le pli revient en fouet, s'efface de 0,45 à 0,85 ; liseré veille qui pulse de 0,24 à 0,8 (« Elle +cède+ »). Aucune cassure, aucun éclat.
- `flash` : 1 Hz, allumé 0,1 → 0,55 s de chaque seconde (+0,1 de phase : allumé à l'image 0), attaque 0,1 s, retombée 0,17 s ; lentille additive 1,1, halo softGlow 0,6 (au-delà, le cœur passe au blanc).
- `ring` : la cloche frémit (±1,7°, 6,5 Hz, flouté par les seize instants), deux ondes « (( )) » encre 2,2 px, rayon 1,7 → 5,3 × BELL.r en 1,4 s.
- `explode` (établi) : capot +48 le long du mât, sonnerie +70, lentille et visière +26 hors de leur plaque (les deux faces), lisse −95 hors de son moyeu (en rangée, en travers) ; échelonnés 0 / 0,12 / 0,24 / 0,36.

## Planches (54 vignettes lues : DÉPASSEMENT du budget de 30 — sept planches de 6 à 8 ; les deux premières ont été en partie perdues : une pose partielle hérite de `POSE0`, dont `side −150`)
1. p1 : lentille blanche (2,5 + halo 1,05 : trop) → 1,1 / 0,6 ; halo de `litBoom` en planche verte → resserré (puissance 3,2, 34 cm, 0,42) ; le sweep se lit.
2. p2–p4 : poses d'établi recentrées (`side: 0` explicite) ; la cloche trop brillante → mate ; visière en « flèche circulaire » à 270 px → arêtes à 0,3.
3. p5 (vue de dessus) : le pli et le pivot de `give` se lisent nettement ; le balayage de 1,36 rad entrait dans la voiture de la file → 1,06 rad, effacement plus tôt.
4. p6–p7 : `hood` (lisse à 0,6, R24, ondes), `plunge`, `top` lisibles ; cloche re-profilée (lèvre évasée : une cloche, plus un abat-jour) ; `litBar`, `litBoom` 0,6 sur la route lisibles.
5. `npm run check -- 035` : passe (0 erreur).

## Poses qui cadrent (repère de l'établi : pied du héros à l'origine ; `...P` de world.js, donc `side: 0`)
```
whole:     { ...P, tx: -70,  ty: 165, tz: 0, d: 850,  az: -38, el: 12, fov: 32, shift: 40 },
exploded:  { ...P, tx: -130, ty: 195, tz: 0, d: 1050, az: -38, el: 14, fov: 32, shift: 40 },
lampBench: { ...P, ...CLOSE, tx: 0, ty: R24.y + 8,   tz: 0, d: 300, az: -30, el: 6,  fov: 30, shift: 60 },
bellBench: { ...P, ...CLOSE, tx: 0, ty: BELL.y + 12, tz: 0, d: 240, az: -30, el: 10, fov: 30, shift: 60 },
boomBench: { ...P, tx: -200, ty: 116, tz: 0, d: 900, az: -22, el: 12, fov: 30, shift: 60 },
```
Couverture (éclaté, el 30) : `{ tx: -110, ty: 175, tz: 0, d: 1150, az: -35, el: 30, fov: 32, shift: 40 }` — les deux R24 luisent, tout le signal tient.
`give`, repère voiture coincée (gap −4,2 : le nez touche la lisse) — ce qui le lit le mieux est **en hauteur** : `{ ...P, tx: 20, ty: 0, tz: -400, d: 1300, az: 160, el: 70, fov: 36, shift: 0 }` (le pli puis le pivot, nets) ou trois quarts avant haut `{ ...P, tx: 40, ty: 60, tz: -420, d: 1150, az: 150, el: 30, fov: 36, shift: 60 }`. Au ras du sol de face (`VIEW.push`), la lisse pivote VERS la caméra : raccourcie, elle se lit moins — le pli (0 → 0,3) et le liseré qui pulse portent alors « cède ». Vue de côté (az ≈ 96) : à éviter, la lisse de `inB` (même ligne, en face) se lit comme un bout cassé de la nôtre.

## Pas encore au niveau
- `VIEW.push` au ras du sol : la rotation vers la caméra se lit mal à 270 px (voir ci-dessus).
- Vue `top` (d 3400) : les lisses font 2–3 px de large, lisibles par leur couleur seulement.
- Le texte « UN TRAIN PEUT EN CACHER UN AUTRE » (porté par les G2 des lignes à voies multiples, faits § 3) n'est pas sur le mât : un texte 3D illisible à 270 px ; à ajouter seulement si un gros plan le demande.

## À changer ailleurs
- `world.js`, `VIEW` : remplacer `whole`, `exploded`, `lampBench`, `bellBench`, `boomBench` par les cinq lignes ci-dessus.
- `episode.json` → `cover.cam` : `{ "tx": -110, "ty": 175, "tz": 0, "d": 1150, "az": -35, "el": 30, "fov": 32, "shift": 40 }` (état `explode` 1, `flash` 1).
- `docs/035-actes.md`, plan « Elle +cède+ » (50,13) : préférer la pose haute `az 160, el 70` ou `az 150, el 30` ci-dessus à `VIEW.push` pour le geste (`give` 0 → 1 en 0,6 s) ; ne jamais filmer le geste de côté (az ≈ 90) à cause de la lisse de `inB` dans l'alignement.
- `docs/catalogue.md` : « Le signal de passage à niveau G2 » `035/model.js` — mât, R24 double face, sonnerie, coffret, demi-barrière blanc et rouge rétroréfléchissante ; `buildSignal()` → état `down give flash ring shine explode sweep litLamp litBell litBar litBoom bench`, quatre instances (géométries partagées).

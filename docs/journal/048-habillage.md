# 048 · habillage.js — journal du décorateur

Agent décorateur, 13/11. Décors habillés : `rue.js` (la rue de Paris la nuit) ; `sol.js` lu, rien posé dedans. Planches dans `.cache/planches/048/habillage/`.

## Lu
recette-decorateur, regles-image, recette-agents (cadre, première image, économie), 048-actes (haut, plans, candidates), world.js (FIRST, POSE0, VIEW, STAGED), plan.js, journaux rue et sol, en-tête et API de `kit/lib/details.js`, têtes de rue.js et sol.js.

## Planches (23 images lues sur 24)
- `avant.jpg` (8, nu) : 0 POSE0 · 11 section · 15 face · 17 kerb · 19 profile · 38 principe · 44 rear · 79 bedroom. Le vide qui ne sert à rien : à droite de l'immeuble dans la section (un noir sans profondeur, la rue posée sur rien), les réverbères éteints. Le reste (face, profil, principe, arrière) est plein de machine : rien à y poser.
- Projection des points candidats sur les poses (script, sans image) : les réverbères ne sont dans le cadre que dans la section (bord droit) ; une flaque au sol tomberait sous les boutons ; la ville lointaine remplit le coin droit de la section ; rien de lointain n'entre dans POSE0 (plongée).
- `apres.jpg` (8, nu) : POSE0 identique ; section : la ville au loin et le réverbère allumé se lisent.
- `zoom.jpg` (3, 500 px, zones) : section, POSE0, kerb — la ville reste sous l'en-tête en traits à 0,2, le réverbère au-dessus de la zone des boutons (y ≈ 780).
- `reprise.jpg` (4, 360 px) : l'égout essayé ne se lit pas comme une galerie (deux traits de plus sous la chaussée) → retiré.

## Touches posées (`src/habillage.js`, `dressStreet()`)
1. **Les réverbères allumés** : un cœur et une longue traîne (`glow`, 300 cm, k 1,25) à la lanterne des trois réverbères de rue.js — c'est la nuit, une rue se lit par ses lampes. Suit `street`.
2. **La ville au loin** : deux rangs de toits parisiens en verre (façade, brisis, faîtage, souches) à 46 et 74 m derrière la rue, quelques fenêtres encore allumées (6 %, k 0,18–0,38) — la rue est une rue d'une ville, pas une maquette. Suit `street`, s'efface quand `town` monte (elle serait au milieu des îlots vus d'en haut).
Accroche : 3 lignes dans rue.js (import, `group.add(dress.group)`, `dress.update(p, time, px)`).

## Essayé et retiré
- Flaques de lumière sous les réverbères : invisibles à k 0,11, et sous les boutons TikTok dans la section.
- Égout ovoïde sous le trottoir d'en face et son regard : illisible à 270 px, et il traversait le haut de l'image 0.

## Ce qui n'est pas au niveau
- Deux touches seulement, toutes deux dans la section : POSE0, kerb, le tunnel ne changent pas (rien de juste n'y entrait sans toucher au sujet).

## À changer ailleurs
- **`sol.js`, ligne 299** (`makeFace`) : la dalle du front est posée à y = 0 au lieu de l'axe — c'est le grand ovale gris au-dessus de la roue dans l'image 0 et dans la section. Remplacer `slab.position.x = -19;` par `slab.position.set(-19, AY, 0);`.
- `rue.js` (pour fin.js, à juger par l'acte) : à `settle` 8, les tranches de la cuvette (`troughStrip`) font un mur rouge plein cadre dans les plans bas près de la rue (essai `80 descente like`, `{ tx: -420, ty: -150, tz: -300, d: 1600, az: -14, el: 10, fov: 34 }`).
- Catalogue : la ville lointaine peut monter dans `details.js` (`skyline({ x0, x1, z, rows })`).

# 035 · Passage à niveau — journal du décor `passage.js`

2026-11-03. L'enveloppe : route du 025 (+ voiture, toi, habillage), TGV du 021 sur la voie 2, voiture du 011 en fin de file ; neufs : voies, platelage, caténaire, A7, téléphone + pancarte, gens qui sortent, règle des 800 m, tableau de bord.

## Fait (premier jet)
- Voies : rails pleins (champignon, âme, patin) sur 1,2 km ; **champignon en ruban qui ne descend jamais sous 1,9 px** (shader `stripMat`, élargi au sommet selon la profondeur) et qui s'allume devant un train (`LIT_A` / `LIT_B` : 90 m de portée) ; traverses + ballast dans **un** shader de sol antialiasé (`fwidth`, moyenne grise sous le pixel) ; brouillard « doux » propre (densité de la scène × 0,42–0,5) lu chaque image dans `onBeforeRender`.
- Platelage : panneaux dessinés par leurs joints (ornières, joints tous les 120 cm), plus de dalle.
- TGV : son monde masqué ; **phares** = deux sprites (cœur, halo, traîne) jamais sous 46 px de rayon, sans brouillard ; sa coque de verre gagne ×1 → ×3,2 entre 30 et 260 m de la caméra (silhouette lisible au loin).
- Lisière du 025 : patch du shader `wood` de CETTE construction (± 17 m autour du passage, fondu à 23 m). Panneau A15b masqué (le nœud d'habillage à 3 enfants). Pluie du 025 masquée (`wet` ne garde que les reflets).
- A7 (triangle + barrière) à 44 m avant le passage, notre bas-côté. Caténaire : mâts tous les 63 m côté voie 2, bras, fils de contact à 5,6 m (au-dessus de la route aussi).
- File : voiture du 011 (`wall` 0, personne), feux stop sprites signal ; trois paires plus loin.
- Téléphone (poteau, coffret, capot, façade qui s'allume veille, combiné, notice) et pancarte (plaque claire, barres sombres : aucun chiffre).
- Gens : deux figures de verre (`makeFigure` shell), trajet en trois points (porte → derrière le coffre → bas-côté), marche par la distance parcourue, tournés vers le passage à l'arrivée.

## Ce qui a raté, et pourquoi (corrigé)
- Les rubans (champignons, règle) étaient tous invisibles : `ShaderMaterial` en `FrontSide`, un ruban tourné vers l'œil change de sens → `DoubleSide`.
- Le TGV disparaissait derrière la voiture de verre : `asShell` — la coque de la voiture (ordres 19–20) cache le verre dessiné après elle. Tout ce qui est ≥ 8 dans le TGV passe 12 ordres plus tôt : on le voit à travers la voiture.
- Les traits fins du TGV (fog: true) se noyaient à 140 m : sortis du brouillard de la scène, leur opacité suit un brouillard trois fois plus doux (crochet du ballast).
- `a7.children` contenait l'ancre (`anchor` ajoute un Object3D) → plantage dans `update`.
- Rails trop blancs près de la caméra et ballast surexposé sous les phares : champignon ×0,35 à moins de 3 m, `LIT_REACH` 90 → 60 m, ballast éclairé ×2,4 → ×1,4.

## Planches (30 images lues sur 30) — `.cache/planches/035/passage/p1…p5.jpg`
- p1 (8) : premier jet. `pass` (train −40) : le TGV plein cadre derrière la voiture, très bien. `phone` : vert trop plat (émissif 0,9 → 0,42). `top`, `plunge` : voies, traverses, joints du platelage lisibles.
- p2 (4) : `rail` — rails allumés, traverses, règle signal jusqu'au train, nez du TGV à 90 m : bon. **`VIEW.rail` (d 4700) met la caméra DANS la voiture** : d 3600.
- p3 (8) : `under` bon ; `wheels` (architecte) ne voit pas la voiture ; `top` à train 90 : le TGV est hors cadre ; `pass t40` / `pass other` : rien du train dans ce cadre (les actes choisiront les valeurs, cf. p1).
- p4 (8) : TGV vu de près à 140 m : il se lit (nez, phares, cabine). Phares à 640 m : un point net. `plunge` reculé : la file et ses feux stop se lisent.
- p5 (2) : accroche A, le nez du TGV apparaît enfin autour des phares, à travers la voiture ; gens au bas-côté, téléphone et pancarte allumés veille : lisibles.

## Poses qui cadrent (repère de la voiture, voiture coincée)
- **Accroche A** (la meilleure) : `{ tx: 2000, ty: 70, tz: 90, d: 3300, az: -92, el: 1.5, fov: 40, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 }` — sur l'axe de la voie 2, la voiture de profil en travers des rails, les rails filent jusqu'aux phares derrière son capot. `fov` 32–34 grandirait le TGV (non essayé).
- Accroche C : `{ tx: 3000, ty: 110, tz: 90, d: 4300, az: -96, el: 1.2, fov: 40, shift: 80, side: 120 }` — le mât en premier plan à gauche, la voiture à droite, les phares entre eux.
- `rail` : comme l'architecte mais `d: 3600`.
- `phone` : `{ tx: 400, ty: 100, tz: 1170, d: 900, az: -70, el: 8, fov: 32, shift: 60 }` — les deux personnes, le téléphone, la pancarte, les voies derrière.
- `pass` (architecte) avec `gap` −6,8 et `train` ≈ −40 : le TGV plein cadre derrière la voiture.
- Non vus (plus d'images) : `wheels` proposé `{ tx: -80, ty: 34, tz: 143, d: 380, az: -120, el: 4, fov: 34, shift: 60 }` (la roue arrière gauche, les rails derrière) ; `top` : `d` ≈ 5200 ou `train` ≈ 30.

## À changer ailleurs
- `world.js`, `VIEW.rail` : `d: 4700` → `d: 3600` (à 4700 la caméra est dans la voiture).
- `world.js`, `POSE0` : candidate « accroche A » ci-dessus (au choix du chef sur la planche des quatre).
- `world.js`, `VIEW.wheels` : la pose de l'architecte ne voit pas la voiture (cadre vertical étroit) — essayer celle ci-dessus.
- `world.js`, `VIEW.top` : à `train` 90 le TGV est hors cadre à `d` 3400 — `d` ≈ 5200, ou `train` ≈ 30 dans l'acte.
- Brouillard : **rien à changer** (0,00011 garde la route du 025 telle quelle ; voies, règle et traits du TGV ont leur brouillard doux). `far` 160 000 : suffit.

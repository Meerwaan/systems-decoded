# 037 · sauteur.js — journal du décor

2026-11-04. Le corps de verre inerte, le harnais et sa poignée, la main, l'extracteur en vol, le sac, les suspentes, la voile de secours (aile à sept caissons), posé au sol, le second sauteur.

## Lu
recette-agents, regles-image, 037-decors (haut + section), catalogue (figure, makeStreaks), figure.js (makeFigure), build3d (glass/asShell/lineMat/fatLine), 026 sky.js makeChute (idiome), plan.js, world.js, bouchon.

## Choix de construction
- Hiérarchie : group → spinG (spin) → tiltG (tilt) → landG (couché) → hangPivot (épaules) → hangG → frame (corps, harnais, poignée, `back`). La voile vit dans `wingPivot`, enfant de spinG seulement : elle s'ouvre vers le haut du monde quel que soit `tilt` ; ses points d'accroche (épaules, bac) sont lus par des ancres du corps ramenées dans son repère (aucune allocation).
- Voile : une aile en tube (29 stations × 28 points de profil), morphée sur le CPU seulement quand `deploy` ou `land` changent (gonflage, puis affaissement au sol) ; normales calculées à la main. Nervures (8), bord de fuite en traits ink, bord d'attaque veille quand elle est pleine. 32 suspentes, deux élévateurs, bride, extracteur (dôme de verre + ressort), sac de déploiement.
- Corps : `makeFigure({ shell, hands: "flat" })`, `ghost(true)` (verre de la tête aux mains : seul le sac et la poignée sont pleins). Pose de chute (membres traînés vers le ciel), pose pendue (gravité), pose couchée, mêlées par `hang` / `land` ; flottement lent des avant-bras et tibias avec `vz`.

## À changer ailleurs
- `model.js` : son **sac** (`bag`) reste dans le bac quand le mien en sort. Ligne à ajouter dans `update`, à côté de celle de l'extracteur : `setPartOpacity(bag, (p.deploy ?? 0) > 0.25 ? 0 : …)` (le sac de sauteur.js quitte le bac à 0,25). Sinon deux sacs entre 0,25 et 1.
- `world.js`, `VIEW.handle` : `{ ...P, ...CLOSE, tx: 6, ty: -28, tz: 16, d: 240, az: -35, el: -40, fov: 32, shift: 60 }` (voir « Poses » : non revue après le dernier déplacement de la main).
- `world.js`, `VIEW.landed` : `{ ...P, tx: 120, ty: 20, tz: -60, d: 1100, az: -60, el: 24, fov: 36, shift: 0 }` (plus près : le corps couché et la voile affaissée à côté se lisent).

## Planches (32 images lues : budget dépassé de 2, arrêt des planches)
1. p1 (8) : dive, side, under, headdown, handle, open .15/.4/.7 — le corps se lit sous les quatre angles ; la voile à .7 est belle ; `handle` d 300 illisible (sac en haut, main et poignée introuvables) ; jambes trop raides en chute.
2. p2 (8) : open 1, hanging, twin ✓ (la voile pleine, bord d'attaque veille, le second sauteur au-dessus et toi qui files en bas) ; dessus de voile trop blanc (spec) ; landed : voile hors cadre ; handle de près = capsules énormes.
3. p3 (8) : spec 0,1 / rim 0,26 ✓ ; jambes fléchies (chevilles 40 cm plus haut, tibias traînés vers le ciel) ✓ ; poignée trop sombre vue d'en dessous ; voile au sol déplacée.
4. p4 (8) : extracteur + ressort à .2 ✓, sac et bride à .35 ✓, faisceau à .6 ✓, .8 ✓ ; landed plus près ✓ ; poignée encore sombre et cachée par la main → main déplacée vers le milieu de la poitrine, poignée moins métallique, émissive (NON REVU sur planche).

## Poses qui cadrent (essais de `.cache/planches/037/sauteur/p*.json`)
- dive (POSE0) tel quel ✓ ; side, under, headdown (tilt 55) tels quels ✓ ; under de près : `{ tx 0, ty -12, tz -10, d 330, az -60, el -30, fov 50 }` ✓.
- open : `VIEW.open` tel quel pour .6 → 1 ; pour l'extracteur (.05–.25) plus près : `{ tx 0, ty 120, tz 0, d 700, az -40, el -10, fov 44 }` ; pour le sac (.25–.5) : `{ tx 0, ty 200, tz 0, d 1100, az -40, el -10, fov 44 }`.
- hanging, twin tels quels ✓. landed : voir « À changer ailleurs ».
- `hang` suit `deploy` : 0 jusqu'à .25, ≈ .5 à .6, ≈ .85 à .8, 1 à 1 (essayé ainsi).

## Pas encore au niveau
- `handle` : non revu après le dernier réglage (main déplacée, poignée éclaircie). De près, les membres du personnage du kit sont des capsules grosses comme le cadre : garder d ≥ 220.
- La voile affaissée au sol est une nappe plissée claire, lisible de loin seulement.

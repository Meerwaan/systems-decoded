# CR03 · acte2b.js — journal (t3 → t5, `tot3` 44,38 → `tot6` 71,89)

Agent `acte`, 13/11. Lu : recette-agents, recette-actes, regles-image, CR03-actes-maj, CR03-actes (haut, ma section, acte2/acte3 voisins), world.js, le squelette, index.html (étiquettes), journaux concorde / état, direct.js (`cut`, `path`, `punch`, `jolt`), `feutre`, le `update` de concorde.js (burst, chunk, tear, n, cutaway, fire), CR02 acte2 (idiome).

## Monté
- **A1 `tot3` → `eclate` − 0,45** : coupe sur un téléobjectif (fov 12, d 250) au ras du sol, droit devant le bogie gauche ; le Concorde arrive du fond (`run` en `glide(1,3 ; 0,35)` : lancé, puis ralenti — le film passe au ralenti à partir du contact), pneu 2 rouge sur « pneu » (`culprit` 3), la lamelle cerclée au sol (`feutre` sur `piste.A.strip`) jusqu'à « lamelle » + 0,2, où le pneu est dessus. `path` d 250 → 210, az −92 → −85 (pas plus bas que −92 : vers −96 la caméra passe la ligne d'axe, une grande dalle claire entre dans le cadre à 45,8 s).
- **A2 → `tot4`** : coupe 0,45 s avant « Il éclate » sur `VIEW.pneu` porté avec l'avion (`shift` 210 : le bogie au-dessus des sous-titres) ; `burst` sur « éclate » + punch ; `chunk` 0 → 0,85 de « morceau » à « frappe » (0,85 = le contact dans concorde.js), puis → 1 ; `jolt` 0,7 sur « frappe » ; « dessous » : `culprit` 2, cercle sur `concorde.A.panel`. La caméra remonte avec le morceau (`path`, el −2 → −10,5).
- **B `tot4` → `tot5`** : coupe sur le plan de la première image, plus large (d 1150) ; l'avion roule (`run` 10 300 → 11 800, linéaire), `fire` 0 → 0,85 sur « flammes » + cabré `pitch` 8 + punch ; `n2` 0,7 et `surge` 0,3 ensuite (l'état de la première image) ; jauge sur « fuit », 4 puis 60 sur « soixante » + punch ; la marque 4 plonge et revient une fois sur « quatre » ; `fire` → 1 sur « dix fois » + punch ; la caméra recule le long de la traînée (az 36 → 64, `shift` jusqu'à −150 : sinon le nez passe sous la jauge).
- **C `tot5` → `tot6`** : coupe (la traînée vue de l'arrière → les tuyères à côté, même sens de regard) : les deux moteurs gauches de trois quarts arrière, en dessous (az 46 → 36, d 135 → 112), leurs dards ambre, le feu derrière ; `chip-feu` d'« L'alarme » à « Ton » ; « moteur » : `culprit` 4 + cercle sur un point vide posé à la tuyère du 2 (`noz2`, ajouté au groupe de l'avion) ; « avale » : `surge` 1, `n2` 0,5 (le dard raccourcit) ; « coupe » : `n2` → 0 en 1,5 s (le dard meurt) + punch ; « s'étouffer » : `n1` 1 → 0,35 en `steps(3)`.
- **`cutaway` n'est pas utilisé** : vu sur deux poses (`VIEW.moteurs`, profil dessous), la coupe des nacelles fait des dalles rouges en biais, illisibles à 270 px — ce que dit déjà le journal du décor. Ce qui se lit, c'est le dard du moteur 2 qui s'éteint.

## Rendu à l'acte suivant
`AT.air` avancé : `run` ≈ 15 400, `alt` 70, `pitch` 10, `n1` 0,35, `n2` 0, `culprit` 4, `fault` 1, `fire` 1, `cutaway` 0 (le plan disait 1 : acte2c coupe et repose tout, cutaway 0).

## Planches (`.cache/planches/CR03/acte2b/`)
- p1 (8, essais de poses) : téléobjectif devant le bogie bon ; `VIEW.pneu` fixe ne voit pas l'approche (l'avion hors cadre) ; `VIEW.moteurs` et le profil en coupe illisibles ; le large du feu lisible.
- p2 (8, l'acte A) : dalle claire à 45,8 (ligne d'axe frôlée) → az corrigé ; pneu et éclatement sous les sous-titres → `shift` 210 ; intrados en haut du cadre.
- p3 (8, B et C) : B bon (feu, jauge 60) mais nez sous la jauge à 60–62 s → `shift` négatif ; C (entrées d'air de face) illisible → refait de l'arrière.
- p4 (8, poses moteurs + vérifs) : l'arrière lit les dards ; la traînée de feu fait une large bande rose en haut du cadre (≈ 420–700 px) quand la caméra est à el −10.
- **32 images lues : budget de 26 dépassé** (j'ai compté une planche pour une image au début). Les derniers réglages n'ont pas été revus.

## Pas revu à l'image (à vérifier en relecture)
- A2, 50,6 → 51,8 : `shift` passé de +90 à −150 pour descendre l'intrados rouge sous l'en-tête (il montait dans 340–660 px) ; le bas du bogie descend alors sous 1 500.
- C entier dans sa pose finale (el −6 au lieu de −10, `shift` −60, cercle sur la tuyère) : la bande rose de la traînée en haut du cadre, la place du cercle, et que le dard du 2 s'éteint bien à 270 px.
- A1 après la correction d'az (−92 → −85) : plus de dalle claire attendue, non revu.

## Sons (pour le monteur-son ; aucun son écrit)
- 44,38 coupe + grondement de roulement qui monte jusqu'au contact (47,70).
- 47,70 le pneu sur la lamelle (petit claquement) ; 48,42 l'éclatement (`CR03-pneu`), dans le souffle après « éclate » (≈ 48,98).
- 50,58 l'impact du morceau sous l'aile (`CR03-debris`), la caméra encaisse ; dans le souffle après « l'aile » (≈ 51,3).
- 54,26 le feu qui prend (`CR03-feu`, une bouffée), après « flammes » (≈ 54,9).
- 56,02 → 56,74 l'aiguille qui file (un tic qui accélère, ou rien).
- 63,49 l'alarme feu (`CR03-alarme`), dans le souffle après « L'alarme feu ».
- 68,82 → 70,3 le moteur 2 qui ralentit jusqu'à l'arrêt ; 70,78 le moteur 1 qui hoquette en trois à-coups (≈ 0,3 s).

## À changer ailleurs
- `docs/CR03-actes.md`, § acte2b, ligne `t5:Le` : le repère `t5:Le` attrape « le » de « on le coupe » (68,66) ; c'est `t5:Le#2` (69,38). Corrigé dans mon fichier.
- `docs/CR03-actes.md`, couture d'acte2b : `cutaway 0` (et non 1).

## Retouche du 13/11 (agent `retoucheur`)
- **48,4 « ILÉCLATE »** → pas le `D.punch` (il ne touche que l'objectif) : c'est le `hit` des sous-titres (`D.captionStyle({ hit: 0.25 })`, acte1.js:55). Le mot marqué `*éclate*` naît à l'échelle 1,25 autour de son centre (kit/lib/overlay.js:161) et mange l'espace avant « IL » pendant ≈ 0,2 s. Rien à corriger dans acte2b → « À changer ailleurs ».
- **49,9 heurté (13,0)** → la bascule bogie → intrados (cible +7 unités ET `shift` 210 → −150 en 1,7 s : ≈ 700 px de glissement) devient une **coupe à `morceau` − 0,12 (49,10)**, même côté (az −122 → −126), sur l'intrados ; puis poussée lente jusqu'à « frappe » (les poses de `frappe` et `tot4` inchangées). Vérifié à 49,07 / 49,14 (une image de part et d'autre de la coupe) et 50,62 (le morceau touche l'intrados, sous l'en-tête).
- **62–71 nappe rose** → cause : la traînée de feu reste horizontale dans le monde alors que l'avion cabre à 10°, elle passe ≈ 20 unités au-dessus des tuyères et venait vers l'objectif (vue arrière, az 46 → 36) ; floutée par le `dof`. Plan C refait de l'avant-côté, en dessous : az −14 → −19, el −11 → −12, `shift` 100, `dof` 0 (d et cibles inchangés). Le feu est un coin net qui s'éloigne derrière / à droite des nacelles, les deux dards séparés. Essais à 66,5 (az 40 haut, profil az 12, avant-côté az −18) ; vérifié à 62,6 et 70,9. **Reste** : un léger voile rose sous l'en-tête (≈ 420–560 px), au lieu de 440–1 050.
- Couture inchangée : aucun nombre d'état touché ; à `tot6` toujours n1 0,35, n2 0, fire 1, culprit 4.
- Images lues : 12 (planches `.cache/planches/CR03/acte2b-retouche/` : avant 4, essais 6, après 2). `check` passe.

### À changer ailleurs
- `kit/lib/overlay.js`, ligne 150 (`line.append(span, " ")`) : réserver la place du coup sur un mot marqué — `if (hit && w.a) span.style.margin = \`0 ${(hit * 0.5).toFixed(2)}em\`;` avant l'append — sinon tout mot long marqué après un mot court se colle à lui pendant le coup. À défaut, pour ce dossier seul : `episodes/CR03-concorde/src/acte1.js:55` `D.captionStyle({ hit: 0.25 })` → `{ hit: 0.12 }`.
- À vérifier sur le prochain brouillon (relecture à 270 px) : le dard du moteur 2 (le plus bas, plus loin) encore visible, court, à 70,9 alors que n2 = 0 — déjà le cas avant la retouche (décor `concorde.js`, pas acte2b).

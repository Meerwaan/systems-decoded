# CR03 — acte1.js (01 L'HEURE : accroche → principe, 0 → `toreservoir` 21,18)

## Lu
recette-agents, recette-actes, regles-image, CR03-actes-maj puis § acte1 de CR03-actes, world.js, main.js, plan.js, `npm run script -- CR03`, direct.js (cut, path, punch, match), journaux concorde / piste / état, CR02 acte1 (forme), `feutre`.

## Monté
- **0 → 1,90** : POSE0 (arrière 3/4, d 900), `path` qui suit l'avion un peu moins vite que lui (il prend de l'avance dans le cadre). L'avion roule (`run` 10 300 → 10 860, ≈ 290 /s) et cabre (`pitch` 2 → 6) ; « feu » : `fire` 0,85 → 1, punch court (relâché avant la coupe).
- **1,90 coupe sur « 16 »** : devant lui, bas, sur sa gauche, au téléobjectif (d 1 700, az −58, fov 22 → 30) : une caméra quasi fixe (elle glisse de 70 /s) qui panote quand il passe ; il quitte le sol sur « Trop » (`alt` 0 → 6 de 3,09 à 3,89), punch « freiner » court.
- **4,47 coupe sur « Il te reste »** : sous l'aile gauche, de l'avant (d 210, az −26) → `VIEW.aile` atteint sur « aile » (el −12 au lieu de −6 : l'intrados et le réservoir 5 face caméra). L'état revient avant la rupture (`tear` 0,25, `leak` 0,2, `fire` 0,5). « réservoir » : `culprit` 2, `fault` 1. « ouvert » : `tear` → 1, `leak` → 1, `fire` → 1, la caméra recule sans lâcher le réservoir (d 90 → 205, az 31 → 49). « l'intérieur » : cercle `feutre` sur `concorde.A.tank5` (pas `A.panel` : il part avec le panneau), punch. L'avion ralentit à 130 /s (plan d'explication), `alt` 9 → 20.
- **10,67 coupe** : la piste d'en haut (`VIEW.runway`, `shift` 220 : l'avion au-dessus des sous-titres), état propre, `stop` 1 ; « V1 » : `v1` 0 → 1, punch ; recul qui fait entrer le bout de piste sous l'en-tête à « Avant » ; le train avant sur la ligne SUR « Après » (`run` 6 200 pile) ; punch « non-retour » ; `run` → 11 300 à la sortie, `pitch` 0 → 7 à la fin (« tu décolles ») ; `chip-v1` de « 150 » à la sortie, punch court.
- Toutes les visées et la lumière (`fx fy fz fs`) de 0 à 10,67 sont calculées depuis l'état de l'avion à l'instant de chaque clé (`onPlane` + la même loi linéaire que les tweens).

## Planches (`.cache/planches/CR03/acte1/`, 26 images lues : budget épuisé)
- p1 (8) : 0 → 6,96. POSE0 bon. La « charge » à d 950 : l'avion coupé, trop gros, sorti à gauche → refait. Sous l'aile à el −6 : intrados en bande en haut, réservoir illisible → el −12.
- p2 (8) : charge à d 1 500 az −40 : un profil, presque la même image que POSE0 (faux raccord) → az −58 au téléobjectif. Sous l'aile : le 5 rouge se lit bien ; le jet et le feu invisibles (la traînée passe à côté de la caméra à az 31) → recul sur « ouvert ». Piste : l'avion sous les sous-titres à 10,75.
- p3 (8) : charge 3/4 avant, il fonce, le feu derrière : ✓ (≈ 60 % de la largeur). Sous l'aile après « ouvert » : le 5 rouge, le cercle, le train, la lueur du feu derrière : ✓ (le jet de kérosène lui-même reste peu net). Piste : barre verte → rouge, ligne V1, chip ✓, mais le bout de piste sous l'en-tête à 14,0.
- p4 (2) : recul à d 19 000 : le bout toujours sous l'en-tête. Corrigé ensuite **par le calcul** (projection vérifiée sur la planche : 1 427 calculé / ≈ 1 420 vu), clés résolues pour l'avion à y ≈ 1 100–1 180 et le bout à y ≈ 470 : **non revu à l'image**.

## Pas au niveau (dit franchement)
- **Principe 13,6 → 21,2** : clés résolues par projection, pas regardées. À tirer en relecture : 14,0 · 15,6 · 18,0 · 20,8 (le bout de piste sous l'en-tête ? la lumière fs 7 500 couvre-t-elle le bout ?). L'avion y fait ≈ 15 px (le plan l'acceptait : la piste est le sujet).
- **Sous l'aile, « ouvert » → « Comment ? »** (8,04 → 10,67) : le panneau part et le feu prend, mais le jet de kérosène se lit en lueur orange plus qu'en jet (il file derrière les nacelles).
- **Charge** (1,90 → 4,47) : le feu se lit en lueur derrière l'avion, pas en traînée (vu de l'avant, comme le disait le journal du décor).

## Sons (pour le monteur-son)
- 0 → 1,3 : le grondement du feu et des réacteurs (l'image bouge dès l'image 1) ; « feu » 1,36 : le feu qui enfle.
- 1,90 : coupe (souffle entre « feu » et « 16 », ≈ 1,4–1,8).
- ≈ 3,3–3,9 : l'avion quitte le sol (« Trop ») ; passage devant la caméra jusqu'à 4,4.
- 4,47 : coupe sous l'aile ; 8,04 « ouvert » : le panneau qui part et le jet (souffle après « ouvert ») ; 8,76 cercle.
- 10,67 : coupe vers la piste ; 12,02 la ligne V1 qui se trace ; 15,38 la barre qui vire au rouge (souffle après « Après ») ; 20,24 la puce.

## À changer ailleurs
Rien.

## Retouche du 13/11 (retoucheur ; planches `.cache/planches/CR03/acte1-retouche/r1–r5.jpg`, 5 images lues)
- **Piste vue d'en haut, 10,67 → 21,18 (avion ≈ 15 px, plage lente)** → plus de vue à 15–21 000 : une **poursuite** au-dessus, derrière lui sur sa gauche (d 1 350 → 1 600, fov 32, el 14), visées calculées sur sa course (`runAt`/`rollAt`, la même loi que les tweens `run` / `pitch`), az 80 → 48 sur le plan (il glisse vers son flanc quand il cabre), `side` 50–80 à partir de « décolles » (sa queue hors des boutons TikTok). La lumière le suit (`glow`, fs 1 600, en tweens linéaires sur la même loi). → vérifié à 10,8 · 12,1 · 13,5 · 15,4 · 16,5 · 18,0 · 19,5 · 21,1 : Concorde ≈ 30 % de la largeur, barre verte devant lui en perspective, ligne V1 en haut à gauche à 13,5 puis sous son nez SUR « Après » (15,4), barre rouge ensuite, puce 150 lisible ; le sol défile. État du raccord à 21,18 inchangé (run 11 300, pitch 7, stop 1, v1 1) ; la **pose** à 21,18 change (poursuite az 48, d 1 600 au lieu de la vue haute) — l'acte 2 coupe à cet instant.
- **Charge, 1,90 → 4,47 (petit, lent, feu en lueur)** → caméra au sol plus près (1 030 → 690 au lieu de 1 700), qui **avance vers lui** à 120 /s pendant qu'il charge, fov 30 → 44 → 50. → vérifié à 1,95 · 2,5 · 3,0 · 3,5 · 4,0 · 4,4 : il occupe ≈ 90 % de la largeur et grossit jusqu'à déborder, le feu une traînée rouge derrière lui à partir de 3,5. Faible : il reste presque de profil (vu au ras du sol, le delta se lit mal de trois quarts avant), il ne « passe » pas la caméra.
- **Jet de kérosène, 8,04 → 10,67 (lueur orange)** → `fire` 0,02 à la coupe c2 (au lieu de 0,5) et le feu ne prend qu'à `interieur1` + 0,3 ; la caméra recule **sur le côté** après « ouvert » (az 22 → 9 → 2, d 105 → 240, `side` 120–160) : le jet traverse le cadre au lieu de venir vers l'objectif. → vérifié à 8,3 · 8,7 · 9,2 · 10,0 · 10,5 : jet pâle qui file vers la droite sous l'aile, puis le feu au bout. Le panneau arraché passe en rouge flou devant l'objectif vers 8,7–9,2 et masque le jet un instant.
- `eye` retiré (plus utilisé). `npm run check -- CR03` passe.

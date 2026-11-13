# CR03 — fin.js (03 DEPUIS → la fin, `todepuis` 121,91 → 148,03)

## Lu
recette-agents, recette-actes, regles-image, CR03-actes-maj (vague 2 comprise), CR03-actes (haut, § acte3 à la couture, § fin, boucle), world.js, plan.js (RUNWAY, RUN, STOP, TRAJ), main.js (appel), index.html (chips, #duel, #next), direct.js (cut, path, punch, chip, loop, commit), blocks.js (duelCall, nextFile), journaux concorde / piste / reservoir / acte1, kit/template/src/fin.js, acte1.js (la loi de l'avion des premières images). Mots minutés : `audio/vo.json` → `takeWords` (décalés de +1,10 s sur depuis/comment, +1,40 s sur abo/boucle par rapport aux repères).

## Monté
- **121,91 coupe** (`todepuis`) : le réservoir tel qu'il a cédé (`BENCHED`), `VIEW.bay` reculé (d 600, shift 250 : le panneau tombé au sol entre dans le cadre) ; `depuis` 0 → 1 en 0,9 s : la lumière blanchit, grille et halo verts, le panneau rouge → vert. Path lent.
- **123,16 coupe dans le réservoir** (« réservoirs ») : le même réservoir intact (`tear bulge dent hit wave` 0, `depuis` 1), `VIEW.cede` bas dans le cadre (shift −130 : l'étiquette tient la zone haute). « Kevlar » 124,26 : `kevlar` 0 → 1, punch, `chip-kevlar` ; sa ligne « de nouveaux pneus » s'allume SUR « pneus » ; le même choc arrive (`hit` au contact sur « pneus », `dent` 1, `wave` 0 → 1, `bulge` 0,2) : la paroi tient.
- **125,90 coupe** (« Et à Roissy ») : la piste vue de haut, `depuis` 0 (dans l'ambiance verte, le lavis se perdait), `fs` 4 200 ; `inspect` 0 → 1 d'« inspections » à « jour » ; `chip-inspect`, `#tick-3` passe au vert SUR « 3 » (punch).
- **129,22 coupe** (`tocta`) : retour au jour, `depuis` 0 — l'avion en feu passé la lamelle (`run` 9 300 → ≈ 10 900, 260 /s), la ligne V1 derrière lui ; la caméra monte derrière lui ; la barre de freinage pousse devant lui et vire au rouge SUR « aucune » (son bout passe le bout de piste à cet instant, calculé) puis file au-delà ; punch « aucune ». `duelCall` (toneA, toneB null) sur ce plan.
- **135,52 coupe** (« Concorde qui revole ») : l'avion propre, `ok` 1, `depuis` 1 (lumière blanche, sol vert), il décolle SUR « revole » et monte (`alt` → ≈ 260) ; caméra en chasse, de l'avant-gauche bas à l'arrière-gauche, sans arrêt jusqu'à `toloop` ; le train rentre après « Abonne-toi » (il ne rentrait pas ce jour-là) ; `nextFile` par-dessus, l'avion sous le panneau.
- **145,96 coupe** (`toloop`) : `FIRST`, l'avion 580 avant sa place de l'image 0, qui roule à 290 /s (la vitesse de l'acte 1) ; caméra sur la même droite (d +29/s, az +2,2/s, el +0,29/s vers `POSE0`, la visée qui court comme `rear()` d'acte1) ; `D.loop({ ease: "none" })` : tout arrive linéairement sur `POSE0` / `FIRST`. `D.commit` ne signale rien (aucun « la dernière image n'est pas la première » dans le journal du check).

## Planches (`.cache/planches/CR03/fin/`, 26 images lues : budget épuisé)
- p1 (8) : réservoir trop haut sous l'étiquette ; barre rouge sans l'avion (visée trop loin devant) ; l'envol trop près (avion coupé).
- p2 (8) : recadrages OK ; **dernière / première côte à côte : même image** (le feu diffère, il dépend du temps ; le libellé « 01 L'HEURE » est allumé à la dernière et pas à la première — c'est `D.loop` → `setAct`, du kit).
- p3 (8) : panneau rouge → vert visible mais petit ; inspection noyée dans le vert de `depuis` → `depuis` 0 sur ce plan ; barre rouge ✓ (forte) ; envol et abo ✓.
- p4 (4) + p5 (2) : inspection en ambre, lumière resserrée : la piste vire au vert lisiblement à « 3 », mais l'image reste plate.

## Pas au niveau (dit franchement)
- **Inspection 125,90 → 129,22** : la piste entière d'en haut, baignée d'ambre ; le lavis vert se lit (bande verte à « 3 »), la camionnette jamais. Un cran en dessous. Piste pour le retoucheur : lavis plus fort dans `piste.js`, ou un plan bas qui suit le front vert.
- **121,91 → 123,16** : le panneau rouge → vert est petit (≈ 25 px à 270) ; le blanchiment se lit mieux que le panneau.
- **`chip-inspect`** tient sur une ligne et touche le bord droit (rogné par TikTok) : voir « À changer ailleurs ».
- Le plan BEA ne garde pas `depuis` 1 (le plan le demandait) : un avion en feu dans la lumière « corrigée » mélangeait les deux temps ; le blanc revient sur « le Concorde qui revole ».

## Sons (pour le monteur-son)
- 121,91 coupe ; 122,0 → 122,9 la lumière qui blanchit (montée claire, souffle après « 2001 »).
- 123,16 coupe ; 124,26 « Kevlar » : la doublure qui se pose (après le mot, ≈ 124,6).
- 124,72 → 125,06 le morceau de pneu qui monte, choc mat SUR la paroi qui tient (souffle après « changent », ≈ 125,6) — pas de déchirure.
- 125,90 coupe ; 126,7 → 128,9 le balayage de l'inspection ; 128,30 la coche verte (après « 3 », ≈ 128,5).
- 129,22 coupe : retour du feu (grondement) ; 130,6 → 131,8 la barre qui file et vire au rouge (souffle après « aucune », ≈ 131,5).
- 135,52 coupe ; ≈ 136,2 l'avion quitte le sol, réacteurs ; 139,6 → 141,0 le train qui rentre (après « Abonne-toi »).
- 145,96 coupe sur le feu ; jusqu'à la fin, le grondement de l'image 0.

## À changer ailleurs
- `episodes/CR03-concorde/index.html`, après la ligne `#chip-kevlar { … }` : `#chip-inspect { white-space: normal; flex-wrap: wrap; max-width: 820px; } #chip-inspect .ticks { flex-basis: 100%; }` (les coches sous le texte : l'étiquette ne touche plus le bord droit).

# 033 · fin.js — retouche du 30/10

Lu : journal 033-fin (« Un cran en dessous »), 033-actes-maj, fin.js, VIEW de world.js, `open` dans model.js (bras 62, sortie et avance), format `look --file`. Planches dans `.cache/planches/033/retouchefin/` (p1–p4 essais de poses, v1–v3 sur le film) : 7 images lues.

## Défauts → corrections → vérifié à
1. **Like 75,04–78,45** (toi illisible, porte sous les boutons, `grip` invisible) → plan qui part de ta main sur l'accoudoir (`YOU` d 170, az 105, el 30, la main au-dessus des sous-titres), tenu (`YOU_HOLD` d 160) pendant que `grip` 1 → 0 sur `pour` → `pour` + 0,9, puis recul (1,5 s, sine.inOut) jusqu'à toi assis et la porte (`YOU_END` tx −2280, d 380, az 97, el 16) qui tombe sur « porte ». La porte finit x ≈ 500–840, à gauche de la colonne. Vérifié à 75,10 · 76,62 · 77,88 · 78,30. La piste d'origine (`VIEW.you` d 470 az 104 side 130) laissait la porte à droite : écartée.
2. **Corée cabine 67,54–70,90** (ouverture mal lue, barre blanche) → `KOREA` presque de face à la porte et bas (tx DX+20, ty DY+76, d 420 → 400, az 168 → 166, el 4, fov 42) : passager assis entier à gauche, le bras au levier ; à `suffi` le battant glisse vers l'avant et une bande noire s'ouvre côté arrière, les flèches meurent. Les barres blanches venaient d'une caméra haute près du plafond (essai el 18 : deux barres en travers) ; à el 4 plus aucune. Vérifié à 67,60 · 70,04 · 70,13 · 70,78.
3. **Approche 64,01–67,54** (piste noire) → `APPROACH` dehors, de l'avant bas : la porte de trois quarts (≈ 35 % de la largeur, sous l'en-tête) et le train avant sorti sous elle (roue dans la zone morte) ; d 1250 → 1150, az −28 → −22. L'en-tête dit 1 500 → 200 m. Vérifié à 64,30 · 67,30.

Non touchés : chute, `duelCall`, prochain dossier, boucle (`POSE0`/`FIRST`). `npm run check -- 033` passe.

## Reste à voir sur le brouillon
- Le recul du like (76,8 → 78,33) est franc : le juger en mouvement.
- Corée : la porte déborde à droite derrière la colonne des boutons (rien de lisible n'y est) ; pas de « lumière du dehors » possible sans toucher au décor.

## À changer ailleurs
- rien.

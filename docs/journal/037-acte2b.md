# 037 · acte2b.js — le principe et le repos (29,17 → 47,27)

Agent acte, 04/11. Lu : recettes, `docs/037-actes.md` (haut + § acte2b), `docs/037-actes-maj.md`, `world.js`, `main.js`, `index.html` (étiquettes), journaux model / sauteur / ciel. Planches : `.cache/planches/037/acte2b/p1–p4` (26 images lues). `check` passe (le contraste à 82,26 s vient de la fin, pas d'ici).

## Monté (sept phrases, six plans)

| Instant | Phrase | Plan |
| --- | --- | --- |
| 29,17 coupe | Plus tu descends, plus l'air s'épaissit. | scène, `{ ...VIEW.side, d 600, az −60, el 32, fov 46 }` → d 520 ; `strata` 1, `alt` 2 600 → 1 900, `spin` 0 → 0,45 : les courbes de niveau montent autour de toi |
| 31,38 coupe | Le boîtier lit sa pression… et à quelle +vitesse+ elle monte. | établi `VIEW.unit` d 42 → 34, `solo` 1 ; `litSensor` sur « lit », `press` 0 → 0,7 sur « pression », `rate` 0 → 0,5 (veille) de « vitesse » à « monte » ; `punch` « vitesse » |
| 34,50 coupe | Une voile ouverte : quelques mètres par seconde. | scène `{ ...VIEW.twin, ty 320, d 2500 }` → d 2300, `twin` 1 : la voile en haut, toi petit en bas |
| 36,96 coupe | Au-delà de 35, pour lui, c'est une *chute*. | établi `{ ...VIEW.unit, d 32, az −74, el 18 }` → d 27 ; `rate` 0,12 → 0,62 (le repère) sur « 35 », → 1 signal + `mood` 1 sur « chute » ; `chip-seuil` 37,48 → 39,30 ; `punch` court |
| 39,66 coupe | Au sol, il prend cette pression comme son zéro. | scène, `alt` 0, `body` 0, le sac dans l'herbe ; poussée vers l'unité de contrôle (d 110) ; `test` 0 → 0,8 → 1 (segments puis diode franche sur « zéro ») ; `chip-zero` 41,48 → 42,16 |
| 41,74 recul | Dans l'avion, il compte la montée. | recul par rapport vers `{ tx 5, ty 8, tz 14, d 320, az −40, el 62, fov 36 }` ; `alt` 0 → 4 000 (`power2.in`) : la campagne rapetisse sous le sac, l'en-tête compte |
| 44,02 coupe | Et sa fenêtre ne s'ouvre que vers 225 mètres du *sol*. | scène `{ ...VIEW.dive, d 800, el 42, fov 50 }` → d 700, `alt` 820 → 250, `gate` sur « fenêtre », `chip-fenetre` 45,64 → 47,10, `threat` 0,2 → 0,6 + `punch` sur « sol » |

Sortie à 47,27 : la scène, `gate` 1, `alt` 250, `vz` 55,6, `spin` 1,4, `threat` 0,6, `mood` 0.

## Écarts au plan, et pourquoi

- Phrase 4 sur **la jauge** au lieu du jumeau : la consigne veut le principe montré sur le boîtier ; la barre de vitesse qui passe son repère et vire signal sur « chute » dit « pour lui » mieux qu'un sauteur.
- `VIEW.gateWide` (d 32 000) : toi invisible, un cadre presque vide → plongée au-dessus de toi, la nappe veille sous toi qui monte (p2, très lisible).
- `VIEW.twin` : toi sous y 1600 → reculé (d 2500, ty 320).

## Un cran en dessous

- 39,66–41,7 (sol) : le sac sombre sur un fond brun ; se lit par la diode et l'écran du test, pas par un halo franc.
- 42,3–43,9 (montée) : une route signal floue traverse le cadre en diagonale pendant le recul ; la campagne lit « haut » à 4 000, moins nettement entre 500 et 1 500.
- 34,5 (voile) : toi, en bas, petit (≈ y 1 300, sous les sous-titres).

## À changer ailleurs

Rien.

## Retouche du 04/11

Agent `retoucheur`. Planches : `.cache/planches/037/acte2b-retouche/` (7 images lues).

- **Route signal floue pendant la montée (42,3–43,9)** — cause : `sol: "repos:sol"` attrapait « **Au** sol » (39,9) et non « du sol » ; `threat` → 0,6 dès le plan du sol, les routes du ciel viraient signal sous le flou de mise au point. → `"repos:sol#2"`. Le `punch` et `threat` 0,2 → 0,6 tombent maintenant sur « du sol » (≈ 46,8), la sortie à 47,27 garde `threat` 0,6 (l'ancien rendu sortait en fait à 0,2). Vérifié à 42,5 · 42,8 · 43,1 (routes ink) et 46,9 · 47,25 (routes signal).
- **Image parasite à 42,50** — cause : `alt` 0 → 4 000 en `power2.in` sur ≈ 1,1 s depuis 42,2 : herbe, lumière du matin et routes (signal) passaient de 0 à 60 m en ≈ 4 images. → montée lancée à `lift` (le souffle après « zéro »), ease exponentielle `(e^{7,6u} − 1)/(e^{7,6} − 1)` : rythme régulier en rapport, 0 → 60 m en ≈ 0,6 s. Vérifié à 42,433 · 42,467 · 42,5 · 42,533 · 42,567 : images consécutives en continuité. Reste : quelques brins d'herbe flous à droite vers 32–45 m.
- **Heurté à 45,6 (20,7)** — 45,6 est le milieu exact du plan (pic de la poussée sine) et l'instant où le sous-titre passe à « 225 » ; la puce `chip-fenetre` entrait sur la même image. → puce à `t.deux + 0,25`. Vérifié à 45,567 · 45,6 · 45,633 · 45,667 · 45,7 · 45,9 : sous-titre à 45,633, puce à ≈ 45,9. Non prouvé sur MP4 : à relire au `qa` du prochain brouillon.

À changer ailleurs : rien dans ce fichier. Vu en passant : le sous-titre laisse une image vide à 45,6 entre « NE S'OUVRE QUE VERS » et « 225 » (`buildCaptions`, hors de ce fichier).

# L01 · `c1-ouverture.js` — journal

Chapitres 00 Introduction + 01 On l'ouvre (0 → carte « Le four », 47,5 s). Part de `FIRST` / `POSE0` sans coupe ; `run(D, 0, to)`. Aucun nombre en dur : tout instant vient d'un mot du script (`D.at("beat:mot")`) ou de `CARD_LEAD`. 26 images lues sur 26 (planches b1 8, b2 8, b3 8, b4 2, dans le dossier temporaire `scratchpad/c1/`). `npm run check -- L01` : 0 erreur.

## Ce qui est monté (plan par plan)

| Instant | Lieu | Plan | Sur le mot |
|---|---|---|---|
| 0 → 4,6 | CAR | POSE0 → avancée lente vers l'impact, 18° vers la face (`power1.out` : ça bouge à l'image 1), `side` 300 → 210 | « casse » : `web` → 1 ; « exactement » : `rings` → 1 |
| 4,8 → 7,0 | CAR | macro sur le front des fissures (d 44) | « sable » |
| 7,0 → 10,4 | CAR, coupe | tes yeux (`hook3`) puis lente poussée | « film » : coupe et `stick` → 1, `mood` 0 ; fait « LE FILM · MOINS D'1 MM » (veille, à droite) sur « millimètre » |
| 10,4 → 18,3 | CAR | panoramique de tes yeux vers la portière, DEHORS (`sideOut` resserré), puis long recul | `sideOn` 1 hors champ ; tu te rassois (`lunge` → 0) ; « ce film » : `litFilm` 1 sur le pare-brise, la vitre reste ink ; « sortir » : `tool` → 0,3 (main vide) |
| 18,3 → 21,7 | LINE, coupe | haut au-dessus du mélange, plongée par rapport sur les cinq tas (`batch` 5), puis survol en deux jambes (`power2.in` / `out`) jusqu'au gabarit | « fabriquer » : coupe ; « sable » : les tas ; « jusqu'au » : départ du survol |
| 21,7 → 26,4 | LINE | la tête tenue au-dessus du pare-brise (d 400), lent tour, puis on suit la tête qui tombe | fait « TÊTE FACTICE · 10 KG » (signal) sur « dix » ; « casser » : `drop` 0 → 0,82, COUPE avant le contact |
| 26,4 → 29,3 | BENCH, coupe sous la carte | fouet de profil (az −90) → trois-quarts (0,8 s `expo.out`), lente poussée | « l'ouvre » (repère `explode`) : `explode` → 1 ; la caméra recule et tourne (`exploded`) |
| 29,3 → 36,4 | BENCH | travelling le long de la pile, une couche par mot, puis plongée sur le coin | `litGlass` · `litFilm` · `litGlass` · `litBand` · `litStamp` (une à la fois) ; tampon E2 · II · 43R lisible |
| 36,4 → 43,2 | CAR, coupe | profil (`hook2`), la vitre ordinaire (`plain` 1, `hero` 0, `wall` 1), travelling vers ta tête | « choc » : `crash` → 0,5 ; « briser » : `blades` 0,12 ; « lames » : les lames volent (ralenti, `sine.out`) |
| 43,2 → 47,5 | BENCH, coupe | l'éclaté, puis plongée par rapport sur la tranche (d 22) | « trois » : `explode` → 0 ; « sable » : la tranche, le film en trait veille entre les deux verres |

## Un cran en dessous (dit franchement)

- **« sable » (4,8 → 7,0)** : vu en cours de route (5,6 s), la tête domine encore, floue ; la fin du mouvement (le macro sur les fissures seules) n'a pas été vue.
- **« ta vitre de côté ne l'a peut-être pas » (12,5)** : de dehors, on lit toi, le pare-brise vert, mais la vitre conducteur elle-même ne se distingue pas (son tampon ne se lit pas). Le « trait de lumière qui balaie puis s'arrête au montant » du tableau n'existe pas : remplacé par `litFilm` sur le pare-brise.
- **« une simple vitre » (36,5 → 39,4)** : la vitre ordinaire (`plain` 1) de profil ne se voit presque pas avant de casser ; les lames, elles, sont fortes (41,6).
- **« au travers »** : aucun nombre ne fait pousser la tête au-delà de `lunge` 1 ; c'est une lente poussée de caméra qui porte la phrase.
- Le survol (20,9) est une traînée orange : lu comme de la vitesse, pas comme une suite de postes.

## À changer ailleurs

- `casse.js` (facultatif) : la vitre ordinaire `plain` 1 vue de profil (`VIEW.hook2`) manque de contour ou de reflet : elle ne se lit qu'en éclatant.

## Miniature YouTube (proposition)

CAR, instant `accroche:prévu+0.3` (≈ 4,2 s), état `{ web: 1, rings: 1, stick: 0.3, lunge: 1, crash: 0.6 }`, pose `{ tx: -37, ty: 134, tz: -36, d: 110, az: -160, el: 14, fov: 32, shift: 0, side: -280, roll: 0, drift: 0 }` : la toile entière et sa tête de verre au tiers droit, la moitié gauche noire pour « IL DOIT / CASSER » (non tirée : budget d'images atteint).

## Reprise (après relecture du film entier)

- **Le survol (18,3 → 21,7)** n'est plus une traînée : après la plongée sur les tas, un travelling lisible (≈ 3 m/s, d 520) le long des tas vers la trémie et la voûte orange du four, puis une COUPE sur la tête de 10 kg tenue (`defi:tête` − 0,12), qui continue en lent tour. Vu à 20,2 · 20,9 · 21,6 : les tas, puis le four qui luit derrière.
- **« sable » (4,8 → 7,0)** : macro rasant (el 34, d 40 → 36) à 18 cm de l'impact, `side` 200 : les fissures et la bande à points emplissent le cadre, nettes ; la tête de verre glisse vers le bord droit (encore présente à 6,5 s, mais plus au centre ni floue).
- Première image inchangée (vérifiée à 0,04). `check` : 0 erreur. 8 images lues pour la reprise (r1 6, r2 2).

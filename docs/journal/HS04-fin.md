# HS04 · fin.js (v2, 27/10, 18 h 15 → 18 h 35)

Consigne : `docs/HS04-v2-montage.md` § 8 (commentaire, youtube) et § 1 (boucle). Voix v2 (69,5 s).

## Monté
- `comment` (sortie du noir `D.breath("tir$") + 0,6` → `youtube − 0,12`) : la nuit du L04 (`AT.night`, sans avion : `jet` 0, `hook` 0, `caught` 0), `wires` 1, `angled` 0,6.
  - plan 1 : Athéna vue de son bout bâbord, haut (le cadrage de c5 « Athéna », recadré 9:16, `shift` −170 sous #duel) ; glissé lent ; `wireName` 1 sur « Athéna » (le câble s'allume plus fort sur le mot) ; en-tête FILM 08:24 → 08:29.
  - plan 2 : coupe 4 images avant « Andromède » sur le troisième câble près de sa poulie (`VIEW.andromede` du L04, `side` 0, `shift` −80) ; `wireName` 3 sur le mot ; poussée lente ; FILM 08:32.
  - `#duel` « Athéna » / « Andromède », chacun allumé sur son mot ; kicker « Lequel t'attrape ? » (écrits par fin.js, voir plus bas).
- `youtube` : le plan v1 (le Rafale de profil, bas, `filmTitle`, `D.verdict` sur « chaîne »), coupe à `youtube − 0,12`, état de jour complet (la nuit d'avant ne fuit pas).
- `boucle` : inchangée (v1) : coupe derrière la dérive, `D.loop` → POSE0 / FIRST.

Poses écrites par `aimAt` (oeil → cible) sur `onAngled` (plan.js du L04), comme c5. `VIEW.wires` du L04 tel quel (d 2600) rend en 9:16 des câbles d'un pixel : écarté sur planche (p1, p2), comme la vue « dans l'axe de la piste ».

## Vérifié (planches .cache/planches/HS04/fin/p1 → p5)
56,63 · 58,95 · 60,21 · 62,35 · 64,24 · 67,68 · 69,87 contre 0 : même pose, même état (écart résiduel : la chaleur des tuyères et la mer, qui vivent avec le temps). `npm run check -- HS04` passe.

## Un cran en dessous
- « le dernier avant la mer » ne se voit pas : la mer de nuit est noire, la fin de piste ne lit pas en 9:16 (essai B4 écarté).

## À changer ailleurs
- `episodes/HS04-porte-avions/index.html`, l. 52-53 :
  `<div class="kicker">Lequel t'attrape ?</div>`
  `<div id="duel-row"><span id="duel-a" class="duel__opt">Athéna</span><span class="duel__or">ou</span><span id="duel-b" class="duel__opt">Andromède</span></div>`
  (fin.js les écrit déjà au montage ; une fois la page corrigée, retirer de fin.js le bloc `label(...)` / `kicker`).

## Retouche du 27/10 (18 h 30)
- Défaut : plan 2 de `comment` (« …ou Andromède, le dernier avant la mer ? », ≈ 59,5 → 63,3 s) : un trait vert en diagonale sur du noir.
- Correction : nouveau cadrage depuis l'arrière, bas, dans l'axe de la piste oblique (`aimAt(onAngled(−1800, 500, 600) → onAngled(13000, −200, 0))`, fov 24, poussée lente jusqu'à `onAngled(−700, 500, 600)`). Sur la coupe : `night` 0,5 (la mer prend sa lueur signal à l'horizon), `wires` 0,15 (Athéna et Aphrodite s'effacent, Andromède seule allumée par `wireName` 3). Andromède barre la piste entre ses deux poulies (y ≈ 1100), la fin du pont éclairée juste au-delà (y ≈ 900), la mer dessous le #duel (y ≈ 760–880). Toujours ni avion ni crosse.
- Vérifié à 59,8 · 60,5 · 61,5 · 62,8 (`.cache/planches/HS04/fin-retouche/verif.png`) ; `npm run check -- HS04` passe.
- Couture : `youtube` repart d'`AT.deck` complet (night et wires y sont remis) ; plan 1 et boucle inchangés.

# La rétention d'une promo de long (hors-série) : la grille seconde par seconde

Écrite le 2026-10-21 (agent 3, rétention et effet « wow »), après la mesure des deux promos en ligne et la remarque de Merwan : « ils font des stats de merde sauf insta ». Elle complète `docs/recette-promo.md` (pourquoi une promo, la règle du « sans spoil », la sortie) : celle-ci dit **comment une promo tient jusqu'au bout**. Le détail des mesures : `docs/scale/promo-3-retention-wow.md`.

## Le principe : un court qui tient seul, puis une bande-annonce

Sur Instagram, la promo est poussée à 31 000 abonnés qui connaissent le compte. Sur TikTok et YouTube Shorts, elle est montrée à des inconnus et jugée **comme n'importe quel court** : complétion, satisfaction. Une minute de questions sans réponse qui finit par « va voir ailleurs », c'est un court qui ne donne rien : on le balaie.

Donc : **une vraie récompense au milieu, la frustration à la fin seulement, une boucle qui relance.** La grande réponse (la C de l'accroche, le test, la toile d'araignée) reste au long. Un morceau secondaire, lui, se paie dans la promo : c'est la preuve que le long tient ses promesses.

## Ce que les deux promos en ligne font (rendus mesurés, `npm run qa`)

| | HS01 | HS02 | 015 (meilleur court) |
| --- | --- | --- | --- |
| Mouvement de la première demi-seconde | **0,4** | **0,2** | 9,8 |
| Plages lentes avant 25 s | 8–11 s | **0–4 s**, 6,5–10,5 s, 22–24,5 s | — |
| Attaques que joue un téléphone, 0 → 25 s | 1 | 1 | 3 (010 : 18) |
| Le film parle de lui-même | 11,7 s (18 %), dont « lancement » **11,3–17,9 s** | 8,9 s (15 %), dont « lancement » **11,1–15,6 s** | — |
| Morceaux payés dans le film | 0 | 0 | — |
| Fils ouverts (compteur de l'en-tête) | 7, un toutes les 6,3 s, **en silence** | 7, un toutes les 6,1 s, **en silence** | — |
| Noir | 2,9 s, dont 2,2 s d'un tenant | 3,1 s, dont 1,9 s d'un tenant | — |
| L'appel au long | à 84 %, dit en 5,1 s | à 85 %, dit en 4,3 s | — |
| Dernière image contre la première | 1,4 | **5,5** (la caméra n'est pas revenue) | 0 = parfait |

Les deux promos ont **la première demi-seconde la plus immobile du compte**, placent la phrase sur « notre nouveau grand format » exactement dans la deuxième fuite des courbes (fin de l'accroche → 25 s), ne paient rien, ouvrent leurs sept fils sans qu'on les voie ni les entende (un chiffre de 34 px), et finissent sur du noir puis une demande de partir.

## La grille (≈ 60–65 s)

| Seconde | Ce qui se passe | Image | Son (`episode.json` → `sfx`) |
| --- | --- | --- | --- |
| 0 → 0,5 | La première image du long, **déjà en mouvement** | `shot(0, d, pose, glide(3, 0.5))` si le sujet reste dans le cadre ; sinon une image où quelque chose bouge (le monde, pas la caméra) | `hit` à 0,02 · `swish` à 0,1 (avant le premier mot) |
| 0 → 9 | **A · B · C** : l'accroche du long (la miniature l'a promise), l'enjeu, la grande question (elle reste au long) | une image par phrase, `D.punch` sur le mot qui frappe | dans les souffles : `clack` / `hit` après le mot de la menace, `braam` après la fin de la phrase A |
| 9 → 25 | **Le morceau payé** : un fil ouvert ET fermé, 10 à 15 s, pris dans le long, qui n'est pas la grande question. Le spectateur repart avec quelque chose | la démonstration complète, sur ses images | `threads` (le fil s'ouvre), puis un `hit` sur la réponse, dans le souffle |
| 25 → 45 | **Les fils** : trois à cinq questions, une par image, une toutes les 4 à 6 s, de la plus belle à la plus inquiétante | `D.threads()` : le compteur bondit à chaque fil | `threads` : un ping qui monte d'un cran à chaque fil |
| 45 → 50 | **Le test, coupé avant le paiement** — la seule vraie coupure du film | `D.cliff(D.breath("…$"), { stamp: "Réponse · sur YouTube" })` : deux volets noirs qui se ferment, une ligne, 0,6 s de noir qui parle | `cliff` au même instant : l'habillage ralentit comme une bande qui s'arrête, se tait, un seul coup sonne dans le silence |
| 50 → 53 | **« Alors… on l'ouvre. »** → **« Pas ici. »** (le gag signature : jamais retiré) | l'éclaté commence, coupé par `D.cliff` (le tampon reste) | `hush` sous « Alors… », `cliff` sur la coupe |
| 53 → 57 | **Le rendez-vous** : une phrase, 3 s au plus | `filmCall` ; le compteur devient « 7 réponses · sur YouTube » | `braam` dans le souffle avant la phrase |
| 57 → fin | **La boucle** : la queue de la phrase retombe sur les premiers mots de l'accroche | dernière image = première (`qa` : écart ≤ 2) | `impact` sur la coupe, `rewind` |

Règles qui vont avec :

- **Entre 9 et 25 s, le film ne parle pas de lui-même.** La phrase de lancement (« Jusqu'ici, on ouvrait… », « Notre nouveau grand format… ») sort de la fuite : elle se fond dans le rendez-vous, ou elle disparaît (l'en-tête dit déjà « HORS-SÉRIE · FILM · 9 MIN 10 »). En tout, le film parle de lui-même moins de 6 s.
- **Le noir dure une respiration** (0,6 s par coupure, 1,5 s en tout) et il dit quelque chose (le tampon) : un écran noir vide est un pouce qui balaie.
- **Chaque fil finit sur un souffle d'au moins 0,25 s** (`hold` sur le beat, ou `[short pause]`) : c'est là que le compteur bondit et que le fil sonne. La voix turbo de HS02 ne laissait que 0,06 à 0,15 s entre ses phrases.
- **Un seul appel**, à la fin, en une phrase ; aucun son sur un mot (`qa` les liste).
- La C de l'accroche, le test et la réponse au gag restent au long : la promo ne paie qu'**un** morceau secondaire, noté `"paye": true` dans son beat.

## Les dispositifs (tous en option : un film qui ne les appelle pas est identique, à l'octet)

### Dans le script (`episode.json`)

```json
"cues": { "fil1": "curiosite$", "fil2": "arc$", "fil3": "gravier$", "fil4": "detecteur$", "fil5": "test$", … },
"beats": [ …, { "id": "arc", "paye": true, … }, { "id": "lancement", "meta": true, … } ]
```

- `fil1`, `fil2`… : les instants où les fils s'ouvrent. L'image (`D.threads()`) et le son (`{ "type": "threads" }`) les lisent tous les deux, et `qa` aussi : un seul endroit à écrire.
- `"paye": true` : le beat qui paie un morceau dans la promo. `"meta": true` : un beat où le film parle de lui-même (par défaut, `lancement` et `youtube`). `"call": true` : le beat de l'appel au long (par défaut, `youtube`).

### À l'image (`kit/lib/direct.js`, `kit/lib/overlay.js`)

| Dispositif | Une ligne dans un acte | Ce qu'il fait |
| --- | --- | --- |
| Le compteur qui bondit | `D.threads()` | à chaque `filN`, le chiffre du compteur passe à N, grossit 2,6 fois, brille en signal, tient 0,14 s et revient ; un « +1 » s'en échappe vers le haut. Chaque instant tombant sur un mot glisse au souffle qui suit (le même que le son). `D.threads(["beat:mot", …], { key: "fils" })` pour une liste explicite ; `{ set: false }` si les actes posent déjà le nombre |
| La réponse coupée au noir | `D.cliff(D.breath("test$"), { stamp: "Réponse · sur YouTube" })` | deux volets noirs se ferment en 0,12 s (haut et bas, jusqu'à une ligne), la ligne brille et meurt, 0,6 s de noir avec le tampon en mono veille. Au-dessus de l'image et de tout noir de la page, sous l'en-tête et les sous-titres (le mot dit reste à l'écran) |
| Le souffle d'un instant | `D.breath("beat:mot")` | l'instant, déplacé au souffle qui suit s'il tombe sur un mot |

### Au son (`scripts/sfx.mjs`)

| Type | Une ligne | Ce qu'il fait |
| --- | --- | --- |
| `threads` | `{ "type": "threads" }` (ou `"at": [ … ]`) | un tic, un coup sourd et un ping qui monte d'un cran par fil (gamme mineure depuis sol 5) : on **entend** les questions s'empiler |
| `braam` | `{ "type": "braam", "at": "pasici$", "gain": -15, "dur": 2.2 }` | le cuivre de la bande-annonce : un accord de ré en dents de scie, filtre qui s'ouvre en 50 ms ; un grave pour le casque, des partiels jusqu'à 3 kHz pour le téléphone |
| `cliff` | `{ "type": "cliff", "at": "test$", "dur": 0.6 }` | l'habillage entier ralentit comme une bande qui s'arrête (`tape` 0,22 s, la hauteur tombe), se tait jusqu'à `dur`, revient en `back` ; un seul coup sonne dans le silence. La voix n'est pas touchée |

Les trois se posent d'eux-mêmes dans le souffle qui suit leur instant (jamais sur un mot) ; `hit`, `swish`, `click`, `hush`, `suck` (la grille des courts, `docs/recette-actes.md`) et `ambience`, `buzz`, `boom` (celle des longs) servent tels quels.

La grille de départ d'une promo (à régler sur l'image) :

```json
"sfx": [
  { "type": "drone", "gain": -24, "curve": [[0, 0.8], ["fil5", 1], ["ouvre", 0.2], ["youtube", 0.5], ["rewind", 0.8]] },
  { "type": "hit", "at": 0.02, "gain": -13 },
  { "type": "swish", "at": 0.1, "dur": 0.28, "gain": -15 },
  { "type": "braam", "at": "accroche$", "gain": -17, "dur": 1.9 },
  { "type": "threads", "gain": -15 },
  { "type": "cliff", "at": "test$", "dur": 0.6, "tape": 0.2, "gain": -12 },
  { "type": "hush", "from": "ouvre", "to": "explode-0.02", "depth": -14 },
  { "type": "cliff", "at": "black", "dur": 0.5, "tape": 0.16, "gain": -15 },
  { "type": "braam", "at": "pasici$", "gain": -15, "dur": 2.2 },
  { "type": "impact", "at": "toloop", "gain": -16, "size": 0.7 },
  { "type": "rewind", "at": "rewind", "dur": 1, "gain": -21 }
]
```

Plus le lieu du long (`ambience` : `hum`, `factory`, `wind`, `room`) et un son par geste fort de l'image, dans les souffles. Le dernier fil peut être la coupure elle-même (le `cliff` sonne, le compteur bondit dans le noir) : on ne met pas de ping dans un silence.

### La mesure (`npm run qa -- HSnn`)

Après la section « rythme » des courts, une section **promo** : les secondes où le film parle de lui-même (et lesquelles tombent dans 10–25 s), les fils (repères `filN`, ou lus sur le compteur de l'en-tête dans l'image), les morceaux payés, le noir (en tout, dans les 15 dernières secondes, le plus long), l'instant de l'appel au long et ce qui reste après, et les cinq dernières secondes (mouvement, attaques d'un téléphone, écart entre la dernière et la première image).

Ce qu'une promo vise, à resserrer avec les premières courbes : mouvement de la première demi-seconde ≥ 3 ; aucune plage lente avant 25 s ; ≥ 8 attaques de téléphone de 0 à 25 s ; aucun son sur un mot ; rien de « méta » entre 9 et 25 s, moins de 6 s en tout ; un morceau payé avant 30 s ; noir ≤ 1,5 s en tout, aucun plus long que 0,8 s ; appel au long dit en 3 s au plus ; écart de boucle ≤ 2.

## Ce qui reste à apprendre

Rien de ceci n'a encore été mesuré sur une courbe de promo : les seuils viennent des courbes des courts (015, 012) et de la mesure des deux promos. À relever sur HS03 : la tenue à 3 s, la courbe à l'instant du morceau payé, à chaque fil, au `cliff`, au « Pas ici » et à l'appel ; la part qui finit ; et, dans YouTube Studio, les vues du long venues de la promo pour 1 000 vues de promo (`docs/recette-promo.md`).

# CR02 · acte3.js — journal (02 LE DÉFAUT → 03 DEPUIS → la fin, `todefaut` 96,22 → 154,4)

Agent acte, 06/11. Planches : `.cache/planches/CR02/acte3/A … D.jpg` (essais `A … D.json`). `npm run check -- CR02` passe (0 erreur ; aucun avertissement `[direct]` : la dernière image revient à `FIRST` et `POSE0`).

## Ce qui est monté (plan-séquence : un `D.path` par lieu, l'az monte toujours — moins négatif —, chaque path finit en « go »)

1. `todefaut` plan maître (az −74 → −55,5, d 340 → 164) — la couture de l'acte 2b (`bsr` 0,9, `buckle` 1, `pass` 0,4) ; « Tu sais pourquoi ? » poussée lente ; « Le tube » retour en arrière : lames rouvertes, `pass` 0, `inside` 0,25, le tube se redresse (`buckle` → 0) ; « plié » il se cambre (`buckle` → 1 jusqu'à « dedans »), rouge (`culprit` 2, `fault` 1), cercle `feutre-tube` sur `A.pipeBend`, punch ; « pression dedans » le rouge emplit le tube (`inside` → 1) ; « tuyau d'arrosage » une ondulation (`buckle` 1 → 0,78 → 1) ; « les lames… percé » `bsr` → 0,95 : pincé, percé ; « couper » `pass` → 1, le rouge jaillit par le trou, punch. Sans coupe sur le moment.
2. `topire` les boîtiers (az −80 → −71) — punch « hasard » ; « boîtier » `podOpen` → 1 ; « batterie… vide » `charge` 1 → 0, rouge (`culprit` 3).
   `lautre` − 0,12 **coupe** de boîtier à boîtier (az −92 → −82,5) : à az −70 la porte ouverte cache la pile 9 V (vu sur planche) ; à −84 la pile rouge et les deux flèches se lisent. « vanne » `coils` → 1, `culprit` 4, rouge sur « câblée » ; « pile » `culprit` 5 : la pile rouge, la vanne revient à l'argile. Aucun geste de la vanne inventé.
3. `toissue` la plateforme après (`VIEW.sink`, az −57 → −49) — `chip-bilan` ; « coule » `sink` → 1, le feu s'éteint.
   `mois` **coupe** sur le BOP et sa fuite (`ty` 165, d 760 → 664, az −63 → −53) : `plume` → 1 ; `chip-fuite`.
4. `todepuis` `BENCHED` (az −66 → −45) — `depuis` → 1 de « Depuis » à « États-Unis » ; « deux jeux » `rams2` → 1 (la première BSR s'ouvre à 0,25 : le tube centré ne doit pas être coupé avant « cisaillement ») ; `chip-regle` ; « garder… au centre » `ring` → 1, `buckle` → 0, vert, punch ; « cisaillement » `bsr` → 1, `shear` → 1.
5. `tocta` plan maître (az −72 → −64), `depuis` 1, tube plié rouge, percé ; cercle `feutre-tube2` sur « plié ».
6. `mais` les deux cadrans (az −81 → −63) : 1 400 / 0, LIGNE rouge ; « 1 400 » la caméra va au cadran TUBE, « zéro » au cadran LIGNE ; `duelCall` sans couleur.
7. `toabo` la plateforme de nuit, calme (`depuis` 1), orbite az −68 → −55 ; `nextFile`.
8. `toloop` coupe sur `POSE0` plus loin (d × 1,15), tournée de 12° (az −72) **et el −46** (à el −40 et az −72, le dessous du plancher barre le tiers bas du cadre : vu sur planche) ; `D.loop({ at, rewindAt: at + 0.04, fromD, ease: "none" })` : az −72 → −60, même sens.

## Mesures
`npm run camera -- CR02` : image quasi fixe 2 % du film, aucune plage fixe ≥ 1 s ; sur 96 → 154 s chaque seconde ≥ 5 °/s ; pointe 110–111 s ≈ 60 °/s (la plongée de « hasard » vers le boîtier, en distance par rapport).

## Un cran en dessous (franchement)
- 105,4–106,2 « percé… sans le couper » : le pincement se lit « le tube rouge passe entre les lames, du rouge jaillit » ; la taille pincée reste discrète à 270 px (défaut connu du décor).
- 134,4 « cisaillement » : la coupe nette verte ne se voit guère (tout est vert, l'écart de 2,5 cm est petit à d 186).
- 130,6 « deux jeux » : la seconde BSR se lit mal sous `chip-regle`, et l'étiquette déborde à droite du cadre (voir ci-dessous).
- 149 « Abonne-toi » : la plateforme est petite sous le panneau, coupée au bord gauche.
- Vanne / pile (113,4–118,2) : poses à az −92 → −82,5 non revues après réglage (vue à −84 seulement).
- Dernière image / première : même cadre ; seul le jet diffère (son animation suit le temps).

## À changer ailleurs
- `episodes/CR02-deepwater/index.html`, `<style>` : `#chip-regle { white-space: normal; flex-wrap: wrap; max-width: 820px; } #chip-regle i { flex-basis: 100%; }` — à 130,6 s l'étiquette « DEPUIS 2016 · ÉTATS-UNIS 2 JEUX DE LAMES TUBE CENTRÉ · COUPE VÉRIFIÉE » tient sur une ligne et sort du cadre à droite (`.chip` est `white-space: nowrap`, en ligne).

## Images lues
26 (A 8, B 8, C 8, D 2).

## Retouche du 06/11 (agent retoucheur)
Planches : `.cache/planches/CR02/acte3-retouche/` (f152, ends = brouillon ; L1, E1, E2, E3 = `look`).
1. ✗ 152,27 s « saute et revient » → dans le brouillon (rendu 04:30), 152,267 est bien la coupe sur `BACK` (le derrick), mais de 152,30 à ≈ 154,3 la glissade montre le dessous du plancher (grand plan damier qui barre les 2/3 du cadre), puis la dernière image revient au derrick : l'image isolée est la coupe, la vraie faute est la glissade. Avec les sources actuelles, `look` à 152,233 · 152,267 · 152,30 · 152,333 · 153 · 154,3 : coupe nette puis glissade continue sur le derrick, aucun plancher. Rien d'acte3 ne change à 152,29 (pas de path par-dessus la boucle, `cut` = FIRST complet, `D.loop` seul) ; `plateforme.js` a été retouché à 04:37, après ce brouillon (spill, damier). Non modifié ici : à reconfirmer par `qa` sur le prochain brouillon (un rendu séquentiel peut différer d'un `look`).
2. 110,6 heurté → la plongée vers les boîtiers étalée sur la phrase : `hasard` d 430 → 340 (aim z −8 → −24), `boitier` d 236, `batterie` d 140 → 172, fin d 120 → 136. `camera` : 110 s 37 → 38 °/s, 111 s 54 → 35 (avant ≈ 49–62) ; aucune plage fixe. Vérifié à 110,6 · 111,5 · 112,6 · 113,4.
3. 105,4–106,2 pincement → caméra plus près et plus tournée dans le même sens : `perce` d 174 → 146, az −57,5 → −52 ; fin d 134, az −48,5. La taille et le coude se lisent à 270 px (essais : az −48 lisait mieux que −66, qui aurait renversé le sens). Vérifié à 105,8 · 106,5.
4. 134,4 « cisaillement » → plus près des lames : d 186 → 160 sur le mot, fin d 168 → 124 (az −45 → −47, el 8). Le gradin de la coupe se voit, mais reste petit : le décor ne lève le haut du tube que de 2,5 (voir plus bas). Vérifié à 133,8 · 134,0 · 134,6 · 135,4.
5. 149 abo → `R0` d 1000 → 820, shift 200 → 140, puis 800 → 780 : la plateforme deux fois plus grande, sous le panneau, la coque entière dans le cadre (la grue touche le bord gauche). Vérifié à 149.
6. 113,4–118,2 vanne / pile → revues à 113,7 · 114,9 · 116 · 117,5 · 118,1 : lisibles à 270 px (vanne rouge et ses deux flèches, puis pile rouge, vanne à l'argile). Pas de changement.
Coutures : `todefaut` (cut M0 et son état) inchangé ; `toloop` / `D.loop` / `BACK` inchangés ; `check` passe.
À voir sur le prochain brouillon : `qa` à 152,27 et la glissade 152,3–154,4 ; 110–112 s.
À changer ailleurs : `episodes/CR02-deepwater/src/bop.js` (writePipe), `const y = y0 > YB + HB ? y0 + 2.5 * cut : y0;` → `const y = y0 > YB + HB ? y0 + 6 * cut : y0;` pour que la coupe nette se lise à 134,4 s.
Images lues : 6.

# 019 · `src/cabine.js` — journal

Début : 2026-10-14, 04 h 54. Budget : 30 images lues, 45 minutes.

## Ce qui est écrit (premier jet, 05 h 03)

- La voiture du 011 par import (`buildCar`), appelée avec `you: 0` ; sa ceinture cachée (`car.fx.belt.visible = false`) ; la toile des airbags à 35 %, sans écriture de profondeur (la tête se voit à travers).
- **Toi** : `makeFigure({ shell, hands: "real", order: 10 })`, `ghost(true)` (verre de la tête aux mains), posé par `pose(lunge, lean, slack, give, coat, load)` : hanches qui glissent (40 % de l'avance), tronc qui bascule depuis −24°, tête qui continue, mains à neuf heures et quart.
- **La sangle** : un ruban à section plate (deux faces, deux chants, 4,8 × 0,34 cm) sur 7 points (anneau · ventre · épaule · haut de poitrine · sternum · côtes · boucle), `solid` + trame dans le shader (`onBeforeCompile`) : chevrons pointés vers l'anneau (période 2,4 cm), deux coutures de lisière, fondus sous le pixel. `aSt.y` = centimètres de sangle depuis l'anneau : la trame ne s'étire pas. La ventrale : même ruban, 5 points.
- **Le mou** : la sangle décollée de `SLACK.off` × profil (épaule 0,35 · haut de poitrine 0,85 · sternum 1 · côtes 0,7), un ventre de 8 cm entre l'anneau et l'épaule ; une bande de lumière signal, faible, sur la poitrine là où elle DEVRAIT porter (`mark`).
- **Le manteau** : un tour scalopé (8 boudins) + coutures en traits fins + manches et épaules, verre, ordre 12.
- **L'ordre** : boîtier sur le tunnel, lampe veille, fil en 56 tronçons dont la partie allumée grandit (`instanceCount`), tête de lumière.
- **Le passager arrière** : figure de verre assise, mains sur les genoux, ceinture pendue (ruban plein + anneau + pêne).

## À changer ailleurs

- **`plan.js` — une marche de 3 cm entre les deux sangles.** `RETRACTOR.top = [0, 79, -5]`, tourné de −90° depuis `home = [-82, 34, 40]`, tombe en **(−77, 113, 40)** ; `BELT.ring` dit (−80, 113, 40). `cabine.js` part de l'extrémité RÉELLE de la sangle de `model.js` (calculée depuis `RETRACTOR`), donc pas de marche à l'image — mais `BELT.ring` n'est plus lu par personne. Une des deux lignes à corriger : `export const BELT = { ring: [-77, 113, 40], …` **ou** `RETRACTOR … top: [0, 79, -2]` (mon fichier suit tout seul dans les deux cas).
- **`model.js` — la trame et la teinte de la sangle** : pour un raccord sans marche à l'anneau, la sienne doit lire `WEB` (exporté par `cabine.js`) : couleur `0xb9b3a6`, `rough` 0,94, chevrons de période 2,4 cm, pente 0,8, trait 0,10, assombri de 0,26, pointe vers l'anneau ; coordonnée le long = centimètres depuis l'anneau, décalée de `REEL.take × (1 − slack) − REEL.out × give`.

## Planches

1. **Planche 1 (8 images, 05 h 05)** — le fichier passe au build. Raté : la sangle en travers de la poitrine est SOMBRE (la clé vient de derrière toi, −x +y +z : ta poitrine est sa face d'ombre) ; de l'anneau à l'épaule elle est vue sur la tranche (sa face est à plat, vers le haut) ; la trame fait « corde » ; la bande signal sur la poitrine est la chose la plus visible du cadre (à l'envers de ce qu'on veut).
   - Corrigé : un **plancher de lumière** dans le shader de la sangle (`outgoingLight = max(…, couleur × (0,55 + 0,45 × face à l'œil))`) — les parties éclairées par la clé ne changent pas ; la sangle quitte l'anneau **roulée de 35° vers la porte** (`AT_RING`) ; la bande signal baissée à 0,13 (`MARK`, 0 la retire).
2. **Planche 2 (8 images, 05 h 08)** — POSE0 mou / tendu : les deux vignettes diffèrent (le ventre sous l'anneau, la sangle décollée). L'ordre (lampe, fil, tête) et le climax (lueur signal, tête dans le sac pâle) se lisent. L'autre agent a écrit sa sangle entre-temps : `WEAVE` exporté par `model.js`, « cabine.js must draw the same » → **je lis son `WEAVE` et je recopie son `weaveMark`** (même couleur `0xbdb9ad`, même `rough` 0,86, même trame, même sens de course `REEL.take × (1 − slack) − REEL.out × give`).
3. **Planche 3 (8 images AVEC les zones, 05 h 10)** — quatre candidates pour la première image, manteau, position, cadre du raccord. Le manteau se lit (boudins + coutures). Au raccord (`shell` 0,25) un fantôme de mon calculateur traînait : la quincaillerie s'efface maintenant entre `shell` 0,8 et 0,3.
4. **Planche 4 (4 images, 05 h 11)** — `POSE0` avec `side: 200` : toute la chaîne dans le cadre, l'enrouleur à x ≈ 830 (hors boutons). « Si rien ne la retend » (`slack` 1, `lunge` 1) : la tête s'arrête ≈ 14 cm avant la jante. Le passager arrière, jambes rallongées.
5. **Planche 5 (2 images, 05 h 12)** — l'anneau de près : les deux sangles se rejoignent au même point, même trame, même teinte ; elles font un angle dans l'anneau (la sienne monte à plat contre la porte, la mienne part vers l'épaule). Le climax avec manteau : la sangle rouge-orangé de l'épaule au sternum, la tête dans le sac.

**30 images lues sur 30.** Dernière retouche à l'aveugle (pas d'image) : l'inclinaison du tronc plafonnée (`sin ≤ −0,08`) pour que `lean` 1 + `slack` 1 + `give` 1 + `lunge` 1 ensemble n'amènent jamais la tête à la jante (sans `lean` : ≈ 6 cm de marge au pire, ≈ 14 cm dans la scène « si rien ne la retend »). Build repassé avec TOUS les nombres à fond en même temps : il passe (image non lue).

## Chaque nombre, chez moi

| nombre | ce qu'il fait |
| --- | --- |
| `shell` `wall` `crush` `debris` `bags` | passés tels quels à la voiture du 011 (`you: 0`) ; la toile des sacs à 35 % ; `crush` ne te déplace pas. Ma quincaillerie (anneau, boucle, ancrage, calculateur, fil) s'efface entre `shell` 0,8 et 0,3 |
| `gap` | recule `slide` (mur + route) de `gap × 100` cm après `car.update` |
| `you` | toi, la sangle, la ventrale, la bande signal |
| `coat` | la coque matelassée (tronc, manches, épaules, coutures) ; la sangle passe DESSUS (+3,2 cm) |
| `lean` | ta poitrine +9 cm (le tronc bascule), la sangle décolle de ton épaule (5,5 cm) et du haut de ta poitrine |
| `lunge` | avance = e × (9 + 9 × `slack` + 6 × `give`) cm : hanches 40 %, tronc, tête qui continue, mains au volant. La sangle lâche reste où elle pend jusqu'à ce que ta poitrine l'ait rejointe (`free`) |
| `slack` | décollée de `SLACK.off` (profil 0,35 · 0,95 · 1 · 0,85), ventre de 10 cm entre l'anneau et l'épaule, bande signal sur la poitrine ; la trame court de `REEL.take` vers l'anneau, lueur veille sur la trame PENDANT la course (4 × s × (1 − s)) |
| `give` | la trame repart de `REEL.out`, +6 cm d'avance (linéaire : en douceur) |
| `load` | lueur signal sur la sangle de l'épaule au sternum (émissif ≤ 1,15) + deux halos dosés ; elle s'enfonce dans le manteau |
| `order` | 0,08 → 0,15 la lampe du calculateur ; 0,15 → 1 la tête de lumière sur le fil, allumé derrière elle ; à 1 elle est au pied du montant |
| `rear` | le passager arrière et sa ceinture pendue (0 / 1) |

## Les poses qui cadrent (vues, zones vérifiées)

Première image (toutes : `slack` 1 → 0, les deux vignettes diffèrent) :

1. `{ tx: -44, ty: 90, tz: 8, d: 300, az: -124, el: 8, fov: 38, shift: 150, side: 200, roll: 0, drift: 0 }` — `POSE0` poussée : enrouleur, montant, anneau, ventre, toi. **Ma préférée.**
2. `{ tx: -40, ty: 92, tz: 4, d: 235, az: -124, el: 8, fov: 38, shift: 150, side: 60, roll: 0, drift: 0 }` — plus près : la sangle la plus grosse ; anneau et enrouleur hors cadre.
3. `{ tx: -40, ty: 94, tz: 4, d: 260, az: -106, el: 5, fov: 38, shift: 150, side: 0, roll: 0, drift: 0 }` — presque de profil : le jour entre la sangle et la poitrine. L'enrouleur est coupé par le bord droit, sous les boutons.
4. `{ tx: -52, ty: 88, tz: 14, d: 290, az: -66, el: 10, fov: 38, shift: 150, side: 130, roll: 0, drift: 0 }` — de derrière ta porte, côté lumière : l'enrouleur et la sangle du montant au premier plan (x ≈ 530, y ≈ 1390), toi à gauche.

Ailleurs :

- le mou de profil : `{ tx: -37, ty: 92, tz: -4, d: 250, az: -108, el: 4, fov: 36, shift: 150, side: 0 }` (à `az` −90, `VIEW.side`, la sangle en diagonale est presque sur la tranche : 2,4 cm de large à l'image) ;
- le climax : `{ tx: -37, ty: 94, tz: -10, d: 240, az: -112, el: 5, fov: 36, shift: 150, side: 0 }` (près) ou `{ tx: -37, ty: 92, tz: -12, d: 300, az: -100, el: 4, fov: 36, shift: 150, side: 0 }` ;
- l'anneau : `{ tx: -70, ty: 106, tz: 32, d: 130, az: -112, el: 6, fov: 30, shift: 150, side: 0 }` ;
- le choc de profil avec `gap` 3 : `{ tx: -30, ty: 80, tz: -240, d: 1400, az: -90, el: 5, fov: 42, shift: 150, side: 0 }` (le mur au bord gauche, la voiture coupée derrière ton siège) — `VIEW.profile` (d 800) ne voit plus le mur au-delà de `gap` ≈ 0,5 ;
- `VIEW.chest`, `VIEW.order`, `VIEW.back`, `VIEW.system` : bons tels quels.

## Ce qui n'est pas au niveau

- **Le passager arrière** : simple. La banquette du plan est basse (`REAR.hips` y = 50), il a les genoux hauts ; sa ceinture pendue est un ruban droit et un pêne. À ne montrer qu'en plan moyen (`VIEW.back`).
- **Le manteau** : un tour à boudins, des coutures, des manches en tubes. Il se lit, sans plus ; « la sangle le creuse » n'est que la sangle qui s'y enfonce (pas vu seul).
- **La trame** (celle de `model.js`, `dark` 0,5) est lourde : de loin la sangle fait un peu ruban de chantier. `dark: 0.68` dans son `WEAVE` l'allégerait des deux côtés d'un coup.
- **La bande signal** sur la poitrine (là où la sangle devrait porter) est une liberté que j'ai prise pour que le mou se lise à 270 px ; de près c'est un trait rouge-orangé sur un torse : si elle gêne, `MARK = 0`.
- De l'anneau à l'épaule, la sangle court 45 cm presque à l'horizontale (l'anneau du 011 est 33 cm derrière l'épaule) : je l'ai roulée pour qu'elle montre sa face.
- **Pas vu en image** : `lean` et `coat` ensemble, `order` à 1 exactement, `shell` entre 0,3 et 0,8, la trame en train de courir (un mouvement), `coat` + `load` sans `lunge`.

## À changer ailleurs (suite)

- **`world.js`** — `POSE0` : `side: 200` (au lieu de 120) sort l'enrouleur de sous les boutons de TikTok.
- **`world.js`** — `VIEW.side` : `az: -108, d: 250, tz: -4` (voir plus haut).
- **`model.js`** — sa sangle n'a pas mon plancher de lumière : sur sa face d'ombre elle est plus sombre que la mienne. Pas visible à l'anneau depuis les angles essayés ; si ça se voit, la même ligne `outgoingLight = max(…)` avant `#include <opaque_fragment>`.
- La remarque « trame et teinte » du début de ce journal est réglée : `cabine.js` lit `WEAVE` dans `model.js` (`import * as MODEL` ; si l'export disparaît, des valeurs de repli identiques).


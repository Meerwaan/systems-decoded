# Audit « enchaînements » — 005 Arrêt d'urgence, 006 Défibrillateur

Lecture seule. 24 images regardées (séries `r005_*`, `r006_*`, `orient_006.jpg`, `loop_*_strips.jpg`, planches `film_07` du 005 et `film_09` du 006), les deux `main.js` lus de la ligne 100 à la fin, et une mesure : le score de changement d'image d'ffmpeg (`scene`) dans la zone du sujet (y 440–1160), 2 fois par seconde, ×1000 — fichiers `scene_005-arret-urgence.txt` et `scene_006-defibrillateur.txt`. Les instants de cette mesure sont justes à ±0,25 s. « Plage morte » = score < 15 pendant ≥ 2,5 s.

## En bref

- Le premier acte des deux films et les deux coupes vers l'établi sont au niveau visé. Ce qui sépare encore du « meilleur » est **après la 36ᵉ seconde**.
- 005 : 46 % des demi-secondes ont une image presque immobile dans la zone du sujet (78 sur 170) ; 006 : 30 % (51 sur 171). Sur les 20 dernières secondes : 61 % dans le 005 (25 sur 41), 45 % dans le 006 (19 sur 42).
- Trois moments clés se jouent sur une image qui ne bouge pas : l'accroche du 005 (0 → 4 s), « Zéro » (36,5 s) et la chute du 005 (53,6 → 57,7 s).
- Dans le 006, le retour au hall (36,90 s) est la seule coupe du film sans aucun raccord, et la chute n'est pas « le cadre du choc » : elle est tournée de 180°.
- Les trois CTA se jouent sur l'objet fermé, petit, caméra à l'arrêt : c'est un signal de fin 20 s avant la fin.

## Les 10 passages les plus faibles, avec le correctif

### 1. 005 — la chute se dit sur une image gelée (52,2 → 57,7 s) · main.js:294-304
Preuve : `film_07.jpg` (005) : de 52,0 à 55,5 s la cuve est la même vignette huit fois, petite (22 % de la largeur) ; seul le titre change (DU COURANT → RIEN à 53,5 s). Scores 54,5 → 57,0 : 0 1 1 0 2 1. La ligne 299 est une dérive de 12° en 5,5 s à d 5400.
« On dépense… pour l'empêcher de s'arrêter » — la thèse du film — n'a pas d'image. Elle en a une toute prête : la couronne de bobines, éteinte depuis `now(t.zero, { power: 0 })` (ligne 261), et le geste de l'accroche à l'envers (là elle faiblissait un instant, ici elle se rallume un instant).
```js
const PAID = { tx: X + 40, ty: 640, tz: 0, d: 2300, az: 30, el: 20, fov: 28, shift: 60, side: 0, roll: 0 }; // CROWN (l.167), un peu plus près
shot(t.chute + 0.75, t.depense2 - 0.35 - (t.chute + 0.75), { az: 22, el: 26 }, "sine.inOut"); // remplace la l.299
tl.to("#retitle", { opacity: 0, y: -24, duration: 0.25, ease: "power2.in" }, t.depense2 - 0.5);  // au lieu de toChicago - 0.25 (l.304)
shot(t.depense2 - 0.3, 1.5, PAID);                              // « on dépense… » : on monte à ce qu'on paie (même trajet que l.168)
show("#chip-feed-off", t.depense2 + 0.7); hide("#chip-feed-off", t.empecher - 0.1, 0.1); // « HORS TENSION »
st(t.empecher - 0.1, 0.3, { power: 1, feed: 1 }, "power2.out"); // « l'empêcher de s'arrêter » : elle se rallume…
st(toChicago - 0.45, 0.3, { power: 0, feed: 0 }, "power2.in");  // …et retombe avant la coupe
```
`show()` rejoue un élément déjà animé : lui passer `immediateRender: false`. À vérifier avec `look` : ce que montre la couronne tiges tombées ; `feed: 1` seulement caméra arrêtée (la ligne 182 l'éteint parce qu'elle bave en mouvement). Si le rallumage gêne, la couronne éteinte et son étiquette suffisent à sortir du gel.

### 2. 006 — le retour au hall n'a pas de raccord (36,90 s) · main.js:289-298
Preuve : `r006_3690_cut_hall.jpg` : six images du couvercle sur fond vert (« PRÊTE », d 84), puis un torse de verre rouge vu de dessus. Ni forme, ni lumière, ni objet commun ; on a quitté le hall depuis 12 s. Et la première électrode part à `t.colles - 0.3` = 36,81 s, **avant** la coupe : on atterrit sur un geste déjà lancé, lu en 0,2 s.
Le silence après « prête » (36,21 → 37,04 s) est libre. Y poser le plan de raccord : le même appareil, même place, même taille, mais par terre dans le hall — la règle de l'établi, appliquée au retour.
```js
const toFloor = t.colle - 0.62;
const FLOOR = { tx: X + SPOT.floorBox.x + 5, ty: 9.5, tz: SPOT.floorBox.z - 4, d: 84, az: -34, el: 30, fov: 28, shift: -80, side: -40 }; // az à régler avec look : le couvercle tel qu'à 36,4 s
shot(t.voyant - 0.3, toFloor - t.voyant + 0.3, { tx: 5, ty: 9.5, tz: -4, d: 84, az: -34, el: 30, shift: -80, side: -40 }, "sine.inOut"); // l.289, finit plus tôt
panel("#selftest", t.repos + 0.25, toFloor - 0.25);              // sorti pile à la coupe
cut(toFloor, IN_HALL, FLOOR, { /* l'état de la l.295 */ });
shot(toFloor, toHall - toFloor, { d: 125 }, "sine.inOut");       // on s'écarte : les mains prennent les électrodes
cut(toHall, IN_HALL, CHEST);                                      // inchangé, 0,14 s avant « Tu colles »
st(t.colles - 0.05, 0.45, { pad1: 1 }, "power2.inOut");           // l.296 : tout le trajet de l'électrode après la coupe
```
Le plan de raccord dure 0,48 s ; pour lui donner 0,8 s, `"hold": 0.3` sur le beat `repos` d'`episode.json` (du silence, pas de voix à refaire). Minimum (20 minutes) : seulement la dernière ligne, et `toHall = t.colle - 0.3`.

### 3. 005 — l'accroche : quatre secondes sans rien qui bouge (0 → 4,4 s) · main.js:157
Preuve : scores 0 5 4 2 1 1 1 2 3 de 0 à 4 s ; la ligne 157 ne fait que tourner de 7°. Le 006 a un événement dans la première seconde (213, 85 : la chute). « Panne de courant » se dit sans panne à l'image.
```js
st(0.28, 0.12, { power: 0.3, feed: 0 }, "power2.in");   // sur « Panne » : la couronne faiblit, la ligne se coupe
jolt(0.3, 0.25, 0.3);
st(0.7, 0.5, { power: 1, feed: 1 }, "power2.out");      // revenue avant « Et c'est toi »
shot(0, t.promesse - 0.35, { d: 4700, az: 23 }, "sine.inOut"); // et la caméra avance (5050 → 4700) au lieu de dériver
```
La boucle n'est pas touchée : à t = 0 l'état reste `FIRST`. C'est le geste de la ligne 177, montré une première fois sans légende. Recoupe le périmètre « accroche » : à arbitrer avec cet audit.

### 4. 005 — « Zéro » : la caméra dort au moment du déclenchement (36,3 → 38,4 s) · main.js:254-273
Preuve : `r005_3647_zero.jpg` : les anneaux s'éteignent et la jauge se vide à l'image près, mais le cadre est verrouillé (aucun `shot` de 36,27 à 38,43 s) et les lignes de champ restent vertes plus d'une seconde après « Hors tension » (`field` part à +0,25 s, en 0,9 s, `power2.in`). Scores 35,5 → 38,0 : 10 8 10 9 10 2. C'est le passage acte 2 → acte 3.
```js
st(t.zero + 0.02, 0.3, { field: 0 }, "power2.out");    // remplace la l.260 : pas de courant, pas de champ, tout de suite
shot(t.zero + 0.02, 0.4, { tx: 1.5, ty: 35.5, tz: 0, d: 124, az: -4, el: 5, shift: -150, side: 0 }, "power3.out"); // la caméra sursaute
shot(t.zero + 0.5, t.lache - 0.25 - (t.zero + 0.5), { d: 116, az: 0 }, "sine.inOut"); // puis serre sur « le courant tombe »
```
`shift: -150` tant que la jauge occupe la zone haute ; la ligne 273 reprend ensuite sans changement.

### 5. 005 — la barre tombe en retard, et les mille tiges plongent de loin (41,4 → 45,0 s) · main.js:277-287
Preuve : `r005_4228_cut_fall.jpg` : « TOMBE » est allumé dès la 4ᵉ image, la tige ne descend visiblement qu'à la 8ᵉ (≈ 0,3 s plus tard, `power2.in`) et n'est vue en chute que 4 images avant la coupe. Après la coupe la cuve fait 38 % de la largeur et les tiges ont fait 6 % de leur course : scores 43,5 → 45,0 : 14 8 11 14 sur « plongent dans le cœur », le climax.
```js
st(t.barreTombe - 0.12, toFall - t.barreTombe + 0.12, { drop: 55 }, "power1.in");   // l.277 : visible dès le mot
shot(toFall, t.pousse - toFall - 0.2, { ty: 40, d: 3200, az: -16, el: 16 }, "sine.inOut"); // l.283 (était d 4400) : on descend avec elles
```
La ligne 287 (d 2300) devient la fin du même mouvement : un seul plongeon 4700 → 3200 → 2300.

### 6. 005 — Chicago : coupe sans raccord, puis 4 s de fil de fer immobile (57,7 → 62,0 s) · main.js:307-311
Preuve : `r005_5769_cut_chicago.jpg` : sept images identiques de la pile au trait ; la barre est un fil, l'homme fait 12 px sur une vignette de 286. Scores 58,5 → 61,5 : 3 5 3 0 0 6 8. Additionné au gel du n° 1 : près de 10 s presque mortes d'affilée.
```js
shot(toChicago, t.barre - toChicago - 0.2, { tx: PX + 230, ty: 760, d: 4300, az: -13, el: 8 }, "sine.inOut"); // l.308 (était d 6600, az -14)
```
Un vrai travelling (la pile grossit de 63 % en 4,3 s) qui arrive presque sur la pose de la barre (l.311) : large → barre → homme deviennent un seul trajet. À voir dans `pile.js` : que la barre soit pleine et claire dès le plan large.

### 7. 006 — CTA : on quitte l'histoire 20 s avant la fin (65,7 → 80,6 s) · main.js:390-414
Preuve : `film_09.jpg` (006) : à 65,5 s l'appareil passe de 60 % à 37 % de la largeur, même objet, même vert — un saut dans l'axe — puis ne change plus. Caméra à l'arrêt complet de 70,69 à 75,14 s et de 76,74 à 80,60 s. Scores 66,5 → 69,0 : 10 2 0 5 0 4 ; 71,0 → 74,0 : 15 9 6 0 14 3 5.
La question du commentaire (« elle est où ? ») est l'image du C de l'accroche, et l'étiquette existe (`#chip-far`, « ELLE EST OÙ ? 30 M »). Jouer les CTA dans le hall, en reculant depuis l'appareil :
```js
// LIKE — « 7 fois sur 10 il y a un témoin » : le témoin
cut(toCta, IN_HALL, { ...GROUP, shift: -230 }, { ghost: 0, ecg: 0, listen: 0, halo: 0.8, ground: 0.22, push: 0, off: 1, mood: 0, gel: 0 });
shot(toCta, t.comment - toCta - 0.15, { d: 600, az: 16 }, "sine.inOut");
// COMMENTAIRE — le chemin, la boîte au bout
cut(t.comment - 0.12, IN_HALL, { ...TOIVIEW, shift: -40 }, { route: 1.3, far: 1.3, beacon: 1.6, lines: 1.4, ground: 0.3 });
shot(t.comment - 0.12, t.abo - t.comment - 0.05, { d: 1380, az: -76 }, "sine.inOut");
show("#chip-far", t.proche + 0.4); hide("#chip-far", t.commentEnd);   // en fromTo avec immediateRender: false
// ABONNEMENT puis BOUCLE — le hall se vide, on avance vers la boîte : la coupe de toTomorrow (l.419) disparaît
st(t.abo, 1.2, { cast: 0, chaos: 0, halo: 0, route: 0, far: 0.6 });
shot(t.abo - 0.15, t.rewind - t.abo + 0.15, { ...BOXCLOSE, d: 400, az: -24, shift: -60 }, "sine.inOut", 1380);
```
Poses à trouver avec `look` (panneaux de 443 à 710 px : le sujet dessous). À vérifier dans `hall.js` : que `cast` s'efface en fondu. Minimum (10 minutes), sans rien restructurer :
```js
shot(t.comment + 1.4, t.abo - t.comment - 1.6, { d: 186, az: -16 }, "sine.inOut");  // après la l.401
shot(t.abo + 1.5, toTomorrow - t.abo - 1.55, { d: 200, az: 12 }, "sine.inOut");     // après la l.409
```

### 8. 006 — la chute n'est pas « le cadre du choc » (55,55 s) · main.js:294, 329, 367-376
Preuve : `orient_006.jpg` : collage (CHEST, az 86) et chute (CALM, az 88) tête en haut ; lecture, choc et intérieur (az −96, −104, −86) tête en bas. Le torse se retourne deux fois, et la chute reprend un cadre vu 1,4 s dix-sept secondes plus tôt. `r006_5555_cut_calm.jpg` : le passage au vert a déjà eu lieu en gros plan ; la coupe va de vert à vert.
Supprimer la coupe : reculer depuis le cœur qui vient de repartir jusqu'au cadre du choc.
```js
const CALM = { tx: X + SPOT.chest.x + 2, ty: 14, tz: -3, d: 175, az: -100, el: 62, fov: 28, shift: -150, side: 0 }; // SHOCK (l.329), descendu pour le titre
shot(t.repart - 0.1, t.chute - 0.35 - (t.repart - 0.1), { d: 84, az: -74, el: 56 }, "sine.inOut"); // l.358, finit plus tôt
shot(t.chute - 0.3, 1.0, CALM, "sine.inOut", 84);              // remplace cut() l.368
st(t.chute - 0.3, 0.8, { halo: 0.5, ecg: 0, ground: 0.16 });
shot(t.chute + 0.75, t.refuse - 0.17 - (t.chute + 0.75), { d: 150, az: -92 }, "sine.inOut"); // l.376
panel("#ecg", tDark + 0.12, t.chute - 0.55);                    // l.352
```
Et pour un seul axe pendant tout l'acte : CHEST `az: -94`, sa dérive (l.298) `az: -102`. `shift` à régler pour que l'électrode du haut passe sous le titre.

### 9. 005 — CTA et boucle (65,95 → 84,8 s) · main.js:322-351
Preuve : caméra à l'arrêt de 70,36 à 74,57 s et de 76,17 à 80,34 s ; scores 70,5 → 74,5 : 3 0 0 11 2 14 0 12 4 ; 77,0 → 80,0 : 3 0 0 7 1 1 0. « Une fois arrêté, il chauffe encore combien de temps ? » se dit devant la bobine sur l'établi. `r005_8401_loop.jpg` : la bobine rapetisse (recul `power3.in`) juste avant de couper sur une cuve deux fois plus grande.
```js
shot(t.comment + 1.4, t.abo - t.comment - 1.6, { d: 280, az: -14 }, "sine.inOut");  // après la l.333
shot(t.abo + 1.5, t.boucle - t.abo - 1.55, { d: 420, az: 12 }, "sine.inOut");       // après la l.339
shot(t.rewind, toHook - t.rewind, { ty: 36, d: 210, el: 12 }, "power2.in");         // l.349 : on entre dans le tube au lieu de reculer
```
Le tube de verre et ses anneaux verts raccordent alors sur la cuve de verre et sa couronne verte (même axe, 48 % de la largeur) : régler `shift` pour mettre les anneaux à la hauteur de la couronne. Mieux, à essayer : le commentaire dans la cuve arrêtée (pose de la l.287, `shift: -60`), le fond du cœur qui rougeoie lentement — à vérifier dans `reactor.js` quel réglage porte l'orange une fois la réaction à 0.

### 10. 006 — « Toi : la boîte » : trois coupes en 2,5 s (22,43 → 24,91 s) · main.js:233-250
Preuve : `r006_2243_cut_toi.jpg`, `r006_2329_cut_box.jpg`, `r006_2491_cut_bench.jpg`. Le plan « Toi » dure 0,74 s pour une étiquette, un chemin, une boîte et un témoin, et TOI n'y bouge presque pas (`toiS: 0.17`, `power1.in`). La porte s'ouvre toute seule à côté d'une main immobile. À la coupe vers l'établi l'appareil saute de 33 % à 49 % de la largeur et remonte de 17 % de la hauteur (la même coupe du 005 tient à 2 % près).
```js
const toToi = t.toi - 0.7;                                   // l.233 (était -0.32) : 1,1 s de plan
shot(t.chaine, t.toi - t.chaine - 0.75, { … }, "sine.inOut"); // l.232 ; hide("#chip-call", t.toi - 0.84, 0.1) l.230
st(t.toi - 0.06, toBox - t.toi + 0.06, { toiS: 0.3 }, "power2.out"); // l.241 : il part vraiment
cut(toBench, BENCH, { tx: 0, ty: 6, tz: 0, d: 250, az: 0, el: 66, shift: -20 }, { … }); // l.250 : d et shift à caler avec look
```
L'étiquette « TOI » garde son instant (`show("#chip-toi", t.toi - 0.28, 0.1)`), sinon elle devance le mot. Dans `hall.js` : la main suit le bord de la porte (cible de `reach` fonction de `S.door`).

## Réglages d'une ligne

- 006, panneaux qui débordent d'une coupe : `panel("#ecg", t.analyse, toShock - 0.27)` (l.316, visible 2 images sur le torse dans `r006_4391_cut_shock.jpg`) ; `panel("#selftest", …, toHall - 0.3)` (l.286).
- 006, 38,31 et 42,63 s : l'appareil au sol est sombre sur sombre (`r006_3831_cut_device.jpg` : 27 % de la largeur, seuls les anneaux verts se lisent). Une flaque de lumière sous lui, comme sur l'établi — à faire dans `hall.js`.
- 006, 80,60 s : la boîte seule dans le noir ne dit pas « le même hall, demain » (`r006_8060_cut_tomorrow.jpg`) ; réglé par le n° 7.
- 005, 48,5 → 50,3 s et 006, 63,5 → 65,0 s : deux arrêts de caméra de 1,5 à 2 s ; une dérive suffit.

## Les trois étalons

1. **005, 20,54 → 23,53 s** (`r005_2353_cut_bench.jpg`) : le vol jusqu'à une bobine, les autres éteintes, coupe sur la même lumière — même place (49 % / 42 % → 50 % / 42 %), même taille (140 → 145 px). La référence de toute coupe vers l'établi.
2. **006, 8,47 → 12,5 s** (`r006_0872_pullback_where.jpg`, `r006_1070_dive_heart.jpg`) : le recul qui ne lâche pas la boîte jusqu'à voir le hall, puis la plongée dans la poitrine. Deux trajets de 30 m sans image vide ; le sujet ne quitte jamais le cadre.
3. **006, 42,63 → 44,4 s** (`r006_4391_cut_shock.jpg`) : le compteur monte à 150 J, le bouton s'allume une image avant la coupe, et la coupe pose le cœur à la place du bouton (60 % / 43 % → 52 % / 49 %) ; l'éclair a un endroit.

À garder aussi : le chrono qui vend l'ellipse à 23,17 s (T+0:54 → T+1:08) ; le silence tenu de 51,0 à 52,5 s (tracé plat) — une plage morte voulue ; toutes les coupes posées 0,12 à 0,14 s avant leur phrase ; les deux boucles, dont la dernière image est bien la première (`loop_005_strips.jpg`, `loop_006_strips.jpg`).

## Pour le 007 et pour `qa`

- **La caméra ne s'arrête jamais plus de 1,5 s** : tout `shot` court est suivi de sa dérive jusqu'au suivant (déjà fait dans les actes 1, oublié après les mouvements de 1,5 s des CTA et de l'acte 3 du 005).
- **Le retour de l'établi se raccorde comme l'aller** : même objet, même place, même taille, dans le décor.
- **Un seul axe par sujet pendant l'acte 3** : un corps vu de dessus ne se retourne pas d'un plan à l'autre.
- **Les CTA se jouent dans le monde de l'histoire**, chacun sur l'image dont parle sa phrase ; pas de plateau à part.
- **La chute a sa démonstration en deux temps** : une image pour l'idée reçue, une autre pour le retournement.
- **`npm run qa` : ajouter les plages mortes.** La mesure de cet audit tient en une commande ffmpeg (`crop=1080:720:0:440,scale=180:120,fps=2,select='gte(scene,0)',metadata=print`) : signaler toute fenêtre ≥ 2,5 s sous 15, avec la phrase dite à cet instant. Seuil d'alerte par film : 25 % de demi-secondes immobiles (005 : 46 %, 006 : 30 %).

## Annexe — coupes et plages mortes mesurées

| Film | Coupes (s) |
| --- | --- |
| 005 | 23,53 établi · 42,28 cuve · 57,69 Chicago · 65,95 CTA · 84,01 boucle |
| 006 | 22,43 Toi · 23,17 boîte · 24,91 établi · 36,90 torse · 38,31 appareil · 40,30 lecture · 42,63 bouton · 43,91 choc · 55,55 chute · 61,78 refus · 65,71 CTA · 80,60 demain · 84,35 boucle |

| Film | Plage (s) | Ce qui se dit |
| --- | --- | --- |
| 005 | 0,0 → 4,0 | l'accroche A |
| 005 | 35,5 → 38,0 | « reste en l'air » · « Zéro. Le courant tombe. » |
| 005 | 43,5 → 45,0 | « plongent dans le cœur » |
| 005 | 54,5 → 57,0 | « On dépense… pour l'empêcher de s'arrêter » |
| 005 | 58,5 → 61,5 | « Chicago, 1942. Le dernier secours… » |
| 005 | 70,5 → 74,5 · 77,0 → 80,0 | CTA commentaire · CTA abonnement |
| 006 | 66,5 → 69,0 · 71,0 → 74,0 · 78,0 → 80,0 | les trois CTA |
| 006 | 51,0 → 52,5 | « Silence… » (voulu) |

## Ce qui n'a pas été vérifié

- Aucun correctif n'a été essayé : toutes les poses proposées partent de poses existantes et sont à caler avec `look`.
- Non regardés image par image : 005, les mouvements de 7,55 à 20,5 s (mesure sans plage morte) et de 62,0 à 65,9 s ; 006, les coupes de 40,30 et 61,78 s (vues sur `orient_006.jpg` seulement).
- Non lus : `hall.js`, `reactor.js`, `pile.js` — les points « à vérifier dans… » en dépendent (fondu de `cast`, orange résiduel, main sur la porte, flaque sous l'appareil).
- L'effet sur la rétention est une hypothèse : la courbe des 002 à 004 à l'instant de la coupe CTA dirait si le plateau à part fait partir les gens.

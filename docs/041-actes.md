# 041 · Le bouclier de l'ISS — le plan des actes

Architecte, 08/11. Voix réelle 92,87 s (`eleven_v4`, une prise) : tous les instants ci-dessous sont lus sur `npm run script -- 041` (mots exacts), à retrouver par les repères de `episode.json` → `cues` ou `D.times({ x: "beat:mot" })`, jamais en dur. **Cinq fichiers** : `acte1.js` (0 → 20,54), `acte2.js` (20,54 → 31,41 : « on l'ouvre » et l'éclaté), `acte2b.js` (31,41 → 47,34 : le principe et le repos), `acte3.js` (47,34 → 61,45), `fin.js` (61,45 → 92,87). Les squelettes en place construisent, ils ne sont pas les actes : chacun se réécrit en entier. Poses de `VIEW` réglées sur bouchons : partir de celles des journaux des décors (`docs/journal/041-whipple.md`, `041-station.md`) et de `docs/041-actes-maj.md` s'il existe (ses lignes priment). Décors : `docs/041-decors.md`.

## Ce qui vaut pour tous

- **Le lieu** : un seul, à taille vraie. L'origine est le point d'impact (face extérieure de la tôle, flanc +z du labo) ; la bille vient de +z ; la station vole vers −x ; la Terre en bas. **az −90 : les couches de profil, le dehors à DROITE.** L'établi est le même lieu, station et Terre effacées (`SET.BENCH`).
- **La caméra en plan-séquence** (`docs/recette-actes.md` § « Le plan-séquence ») : **un `D.path` par lieu**, une clé par idée (1 à 3 s d'écart), 6 à 15° d'angle de plus à chaque clé ; **az DÉCROÎT dans tous les trajets du film** (l'œil lit une seule rotation, coupe après coupe ; l'ordre est écrit au-dessus de `VIEW` dans `world.js`). Rien d'autre ne pilote la caméra pendant un `path` (`punch`, `jolt` s'y ajoutent). Coupes du film, et rien de plus : 18,25 (acte 1) · `tobench` 21,18 · 31,41 · 40,68 · `tozero` 47,34 · 61,45 (invisible) · `toduo` 77,98 · `toabo` 85,65 · `toloop` 90,99. Les plans calmes bougent : la fin est une orbite lente et continue autour de chaque sujet.
- **La grille de rétention** : 0 → 0,5 s le sujet bouge (la bille et sa traînée), pas la seule caméra ; **jusqu'à 25 s, un geste ou un changement toutes les 2 à 3 s, aucune plage lente de 2 s** ; un son dans le souffle qui suit chaque mot-clé — **déjà posés** dans `sfx` (51 sons, tous dans les souffles : n'en ajoute aucun sur un mot).
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe ni à moins d'1 s d'un autre) : `accroche:tête` 1,44 · `accroche:frapper` 4,56 · `promesse:millimètres` 7,48 · `scene:balle` 14,50 · `scene:tôle` 19,46 · `eclate:vide` 30,64 · `principe:brise` 34,32 · `repos:centimètre` 46,68 · `reponse:tient` 60,64 · `chute:pas` 65,26 (verdict) · `comment:capsules` 77,42. `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **« Alors… on l'ouvre »** seule dans son plan : de 20,54 le temps s'arrête (`hush` posé, la traînée se fige, `trail` 0, la station s'efface), coupe sur l'établi à `tobench` 21,18 (`benchCut`, le coupon seul sur son halo, de trois quarts), **l'éclaté s'ouvre sur « on »** (`explode` 21,32).
- **Le chrono** (main.js le lit dans l'état : rien à écrire dans les actes) : avant le contact, `dist` (cm) = les µs qu'il reste à la bille à 10 km/s — FIRST 220 (« T−220 µs ») → **20 à `tobench`** (`STAGED.dist`, figé et atténué jusqu'à `tozero`) → 0 sur « Contact » 48,00. Après : `burst` → « T+0 » à « T+12 µs ». « 15/11/2021 » de « 2021 » au like. Second compteur « Débris » : « 1 cm » → « Arrêté » à `trigger` 60,59 → « > 1 500 » de « 1 500 » 73,70 au like.
- **La couleur** : `mood` 1 (signal) tant que la bille menace ; 0 sur l'établi et au repos ; dans l'acte 3 il passe à 0 **sur « tient » 60,64**, pas avant. Le système qui a gagné prend son liseré veille.
- **Anti-parasites** : un quart de tour en une seconde est une coupe ; une coupe se pose 0,1 à 0,2 s avant sa phrase ; ce que la caméra frôle est invisible ; la caméra ne traverse jamais le coupon ni la plaque-miroir (opaques) — elle traverse la coque de verre **à côté** du coupon (à plus de 25 cm de l'origine) ; aucune traînée ni éclat ne traverse l'en-tête (236–410) ou les sous-titres (1248–1488) quand un texte y est ; le sujet entre y 440 et 1160, rien d'important sous 1600 ni à x > 905 de 880 à 1760.
- **Les étiquettes** (`index.html`) : `chip-tole`, `chip-toi`, `chip-vide`, `chip-arrete`, `chip-pression`, `chip-tient`, `chip-capsules` ; les pièces de l'éclaté se nomment par `co.add` (« Tôle d'aluminium », « Céramique et kevlar », « Ta coque »). Une à la fois en zone haute ; **toutes doivent être appelées** (une étiquette jamais appelée reste affichée en haut à gauche). Capitales : aucune unité à symbole hors de l'en-tête.
- **À ne jamais montrer** : un débris « vaporisé » ou qui explose en boule de feu ; la coque percée ; le bouclier qui arrête la balle de baseball ; « 10 cm » comme ce que le bouclier arrête ; un blessé. Toi : mannequin de verre qui dort, jamais en très gros plan, jamais la main seule.
- **La boucle** : la dernière image est la première (`D.loop`, `D.commit`) — fin.js coupe à `toloop` sur `POSE0` tourné de 12° (`az` + 12, `d` × 1,1) et à l'état `FIRST`, la bille un peu plus loin (`dist` ≈ 600) qui revient à 220 sur la dernière image : **elle bouge à la dernière image comme à la première**.

## acte1.js

**01 MENACE, 0 → 20,54.** Part de `POSE0` et `FIRST`, sans coupe. UN trajet du dehors jusque dans la cabine, une coupe (18,25), un second trajet sur la tôle. Couture de sortie : le second trajet arrive lancé à `tobench` 21,18 (acte2 y coupe) ; `dist` vaut `STAGED.dist` (20) dès 19,6 et `trail` y descend ; rien ne tween après 20,54 sauf la caméra.

| Instant | Voix | Plan (part du cadre tenue par le sujet) |
| --- | --- | --- |
| 0 → 1,72 | « Un débris fonce sur ta *tête*, » | `POSE0` : le labo de trois quarts par-dessous (≈ 60 % de la largeur), toi endormi à travers le verre, la tôle à une main de la coque ; la bille entre par la droite, longue traînée (`dist` 220 → 60, power2.out : elle fonce, puis le ralenti la prend). Punch « tête ». |
| 2,12 → 3,32 | « 10 kilomètres par seconde. » | La caméra glisse le long de la traînée vers la paroi (clé ≈ 3,0 : `d` ≈ 500, az −70) ; la traînée file (`trail` 1). |
| 3,72 → 4,92 | « Ta station le laisse +frapper+. » | Rien ne s'écarte : la station reste immobile, la caméra passe sous le labo jusqu'au coupon (clé 4,9 : d ≈ 200, az −76 ; coupon ≈ 30 %), `dist` 45. Punch « frapper ». |
| 5,46 → 7,96 | « Devant ta coque, une tôle d'un ou deux +millimètres+. » | Clé 5,5 `VIEW.profile` (az −80) : de profil, la tôle comme un trait, le vide, la coque (70 % de la hauteur) ; `litBumper` 0 → 0,6 sur « tôle » 6,68 ; `chip-tole` 6,78 → 8,3. Punch « millimètres ». |
| 8,43 → 10,28 | « Au-delà d'un centimètre… tu te caches où ? » | `gauge1` 1 sur « centimètre » 8,84 (la bille au bord droit, `dist` 30) ; `big` 0 → 1 juste derrière elle (9,0 → 9,5), plus grosse, rouge ; sur « caches » 10,04 la caméra recule le long du chemin (az −84 → −98, d 52 → ≈ 400) : la bille et la grosse au premier plan, la paroi, et à travers le verre toi, seul dans le module. |
| 11,05 → 13,06 | « Un centimètre, trop petit pour être vu. » | `big` 0, la caméra replonge sur la bille (`VIEW.billeClose`, az −100, d 16 ; bille + jauge 30 %) ; `scan` 0 → 1 de « trop » 12,07 à « vu » 12,90 : le balayage passe sur elle sans rien allumer. |
| 13,46 → 14,74 | « 15 fois plus vite qu'une *balle*. » | `bullet` 0 → 1 sur « 15 » 13,46 : la balle de verre à côté ; `dist` 26 → 22, la balle reste sur place ; la caméra suit la bille (az −104). Punch « balle ». |
| 15,22 → 16,98 | « Derrière ta paroi, ton air. » | La caméra contourne le coupon et **traverse la coque de verre à côté** (à plus de 25 cm de l'origine) jusque dans la cabine (`VIEW.cabin`, az −130, d 330, en rapport) ; `cabin` 0 → 1 sur « air » 16,66 ; `bullet` 0. |
| 17,42 → 17,86 | « Tu dors… » | Toi dans ton sac contre la paroi (≈ 45 % de la largeur), la paroi derrière toi ; `chip-toi` 17,3 → 18,1 ; respiration du sac. |
| 18,25 | coupe | `VIEW.tole` (dehors, az −46, d 78, dof) : la tôle seule, en grand ; `shell` 1 → 0,25 en 0,6 s (la station s'efface autour), lumière sur le coupon (`LIGHT.coupon`). |
| 18,38 → 19,62 | « Tout repose sur cette +tôle+. » | La tôle ≈ 55 % du cadre, la bille au bord du cadre (`dist` 20, `trail` 0,4) ; litBumper 0,8 sur « tôle ». Punch « tôle ». Le trajet continue lancé jusqu'à `tobench` (az −46 → −58). |

## acte2.js

**02 AUTOPSIE, 20,54 → 31,41** (« on l'ouvre », l'éclaté). Couture d'entrée : de 20,54 l'acte fige le temps sur la pose laissée par l'acte 1 (`trail` 0, `shell` → 0, `you` 0, `mood` 0) ; coupe `benchCut` à `tobench` 21,18 sur `VIEW.system`, état `BENCHED` (bille cachée). Couture de sortie : le trajet arrive lancé sur `VIEW.gap` à 31,41 (acte2b y coupe), `explode` 0, `litGap` 1, `gauge10` 1.

| Instant | Voix | Plan |
| --- | --- | --- |
| 20,54 → 21,18 | « Alors… » | La tôle, le silence ; la station s'efface ; la bille s'arrête net (temps figé). |
| 21,18 | coupe `tobench` | `VIEW.system` (az −62, d 125) : le coupon seul sur son halo, de trois quarts (≈ 55 % de la largeur). |
| 21,32 → 22,60 | « …on l'ouvre. » | `explode` 0 → 1 sur « on » (1,2 s, power2.out) : les couches s'écartent vers d'où venait la bille ; la caméra recule vers `VIEW.exploded` (az −70 ; la rangée ≈ 80 % de la largeur). |
| 22,71 → 24,24 | « D'abord, la tôle d'aluminium. » | `litBumper` 1 sur « tôle » 23,44 ; `co.add` « Tôle d'aluminium » ; clé vers la tôle (az −72) ; tôle ≈ 40 %. |
| 24,60 → 26,08 | « Un matelas de céramique et de kevlar. » | `litBumper` 0, `litBlanket` 1 sur « matelas » 24,72 ; « Céramique et kevlar » ; clé (az −74) : les deux gris du matelas lisibles. |
| 26,56 → 28,40 | « Ta coque, 3 à 5 millimètres. » | `litWall` 1 sur « coque » 26,68 ; « Ta coque » ; clé (az −76). |
| 28,75 → 30,88 | « Et le cœur… 10 centimètres de *vide*. » | Sur « cœur » 28,96 les couches se resserrent (`explode` → 0 en 1,0 s) ; `gauge10` 1 sur « 10 » 29,80 ; `litGap` 1 sur « vide » 30,64 : **le vide s'éclaire** ; la caméra arrive sur `VIEW.gap` (az −78, dof ; le vide ≈ 60 % du cadre). `chip-vide` 30,54 → 31,30. Punch « vide ». Couverture : propose un repère et une pose (el ≥ 28) où le coupon éclaté est éclairé et où quelque chose luit. |

## acte2b.js

**02 AUTOPSIE, 31,41 → 47,34** (le principe sur l'établi, puis le bouclier au repos sur la station). Couture d'entrée : coupe à 31,41 (`principe` − 0,12) sur `VIEW.pair`, état `BENCHED` + `mirror` 1, `gauge10` 1, `bille` 1, `dist` 12, `trail` 0,3, `pierce` 0,1. Couture de sortie : le trajet arrive lancé à `tozero` 47,34 (acte3 y coupe) ; la bille à `dist` 20 contre sa jauge.

| Instant | Voix | Plan |
| --- | --- | --- |
| 31,41 | coupe | `VIEW.pair` (az −84, d 230) : le coupon en bas, la plaque-miroir au-dessus (« en miroir »), les deux billes au bord droit, la jauge de dix centimètres dans le vide (les deux ≈ 50 % de la hauteur). |
| 31,53 → 32,04 | « Pourquoi du vide ? » | Lent glissement (az −86) ; rien ne bouge encore que les billes qui approchent. |
| 32,51 → 35,40 | « Le débris perce la tôle, mais il s'y *brise* en nuage. » | `dist` → 0 sur « perce » 33,00 (et `pierce` 0,4 au même instant : les deux touchent ensemble) ; `burst` 0 → 0,3 de « perce » à « brise » 34,32 (le trou, le nuage naît) ; la caméra glisse vers le coupon (az −88, d ≈ 120 ; coupon 60 %). Punch « brise ». |
| 35,88 → 37,88 | « En 10 centimètres, ce nuage s'étale. » | `burst` 0,3 → 0,7 de « 10 » 36,00 à « s'étale » 37,40 : le cône s'ouvre le long de la jauge ; au-dessus, le cratère du miroir creuse (`pierce` 0,4 → 0,65). |
| 38,24 → 40,44 | « Et ta coque reçoit une pluie… pas une balle. » | `burst` 0,85 → 1 sur « pluie » 39,28 (des dizaines de points étalés, la coque tient, liseré veille) ; **sur « balle » 40,20 la plaque-miroir se troue** (`pierce` 0,8 → 1) ; la caméra recule pour tenir les deux (az −92, d 230). |
| 40,68 | coupe | `VIEW.whole` (az −40, d 26 000) : l'ISS entière sur le limbe, dans le silence (`STAGED` + `shell` 1, `you` 1, `shield` 1, `bille` 0, `mood` 0, `LIGHT.station`) ; `flown` court (la Terre défile). Station ≈ 70 % de la largeur. |
| 40,83 → 42,84 | « Il attend, plus épais à l'avant de la station. » | Trajet vers `VIEW.front` (az −72) ; `ram` 0 → 1 de « épais » 41,80 à « station » 42,64 : les tôles de l'avant s'épaississent en veille. |
| 43,28 → 45,16 | « Il arrête un centimètre. Pas plus. » | `chip-arrete` 43,40 → 45,2 ; **la plongée** (`path`, `d` en rapport, ≈ 2 s) de l'avant jusqu'au coupon du labo, à travers le verre (az −84 → −96). |
| 45,44 → 46,98 | « Et le tien… fait un *centimètre*. » | Arrivée sur la bille (`VIEW.billeClose` à az ≈ −100, `bille` 1 rouge, `dist` 20, `trail` 0) et sa jauge (`gauge1` 1 sur « tien » 45,64) : exactement la même taille. Bille ≈ 25 %. Punch « centimètre ». |

## acte3.js

**03 RÉPONSE, 47,34 → 61,45.** Le contact se voit **en entier, sans coupe dessus** : la caméra approche, le contact arrive dans le cadre, elle encaisse (`jolt` 0,9). Couture d'entrée : coupe à `tozero` 47,34, état complet (`STAGED` + `LIGHT.coupon` ; `dist` 20). Couture de sortie : le trajet arrive sur `VIEW.cabin` à `toverdict` 61,45, état `STAGED` + `burst` 1, `molten` 1, `cabin` 0,6, `mood` 0 — fin.js y coupe sur la même pose (coupe invisible).

| Instant | Voix | Plan |
| --- | --- | --- |
| 47,34 | coupe `tozero` | `VIEW.contact` (az −48, d 40, dof) : le coupon de trois quarts dans la station (60 %), chrono T−20 µs qui repart. |
| 48,00 → 48,04 | « *Contact*. » | `dist` 20 → 0 de 47,34 à « Contact » 48,00 (power2.in) : la bille entre et frappe dans le cadre ; `burst` 0 → 0,1 (l'éclair qui a un endroit), `shock` 0,2 ; `jolt` 48,02. |
| 48,40 → 51,16 | « Sur la tôle, un choc d'un million de fois la pression de l'air. » | `shock` → 1 (48,1 → 49,5 : l'anneau court dans la tôle) ; `chip-pression` 49,6 → 51,6 ; la caméra continue d'approcher (az −52). |
| 51,75 → 52,56 | « La tôle se perce. » | `burst` 0,1 → 0,3 sur « perce » 52,24 : le trou net. |
| 52,92 → 53,92 | « Le débris se brise. » | `burst` 0,3 → 0,4 sur « brise » 53,52 : les éclats se séparent derrière la tôle. |
| 54,32 → 55,44 | « Gouttes de métal fondu. » | `molten` 0 → 1 sur « Gouttes » 54,32 ; clé plus près du nuage (az −56, d 34). |
| 55,80 → 57,12 | « Le nuage s'ouvre dans le vide. » | `burst` 0,4 → 0,7 de « nuage » 55,92 à « vide » 56,88 ; `VIEW.cone` (az −62 ; le cône ≈ 50 %). |
| 57,48 → 58,80 | « La céramique le casse encore. » | `burst` 0,7 → 0,85 sur « casse » 58,16 ; la caméra commence à contourner le coupon. |
| 59,16 → 60,88 | « Ta coque encaisse… et *tient*. » | `burst` 0,85 → 1 sur « encaisse » 59,60 ; la caméra **traverse la coque de verre à côté du coupon** et voit, de l'intérieur, la paroi qui se bombe d'un rien et tient, toi endormi devant elle (`VIEW.cabin`, az −130) ; sur « tient » 60,64 : `mood` → 0, liseré veille, `chip-tient` 60,6 → 61,3. Punch « tient ». |

## fin.js

**61,45 → 92,87** : chute → ce qui est dû et le commentaire → like → prochain dossier → boucle. Plus rien du sujet ne revient après l'annonce. Couture d'entrée : coupe invisible à `toverdict` 61,45 sur `VIEW.cabin` (même état que la sortie de l'acte 3).

| Instant | Voix | Plan |
| --- | --- | --- |
| 61,45 → 64,54 | « Voilà le secret : ta station, la plus blindée jamais lancée… » | **Le recul** (`path`, `d` en rapport) de la cabine à la station entière, vue de l'arrière (`VIEW.whole` à **az −215**, la caméra derrière Progress : az décroît) ; `retitle` (kicker « La plus blindée jamais lancée », « Elle arrête tout » → « Elle esquive ») de « secret » 62,02. |
| 64,82 → 67,90 | « …n'arrête *pas* les gros débris. Elle les esquive… quand elle les voit. » | `D.verdict` sur « pas » 65,26 (strike) ; `flyby` 0 → 0,5 : l'objet rouge arrive de loin devant, au fond du cadre ; sur « esquive » 66,62 (swap) `burn` 1 — les jets de Progress au premier plan — et `dodge` 0 → 1 (66,6 → 67,8) ; `flyby` → 1 : il passe sous le labo à « voit » 67,78. Station ≈ 65 %. |
| 68,84 → 70,02 | « Et au-dessus, tu te caches où ? » | **L'orbite continue** (az −215 → −250) ; `crew` 0 → 1 : les six autres apparaissent à leurs postes. |
| 70,53 → 74,70 | « En 2021, un missile russe détruit un satellite : plus de 1 500 morceaux suivis. » | En-tête 15/11/2021 ; au loin `kosmos` 0,1 → 0,3 sur « détruit » 72,22 (le coup), → 1 à « suivis » 74,70 (le nuage s'étale le long de l'orbite) ; la station au premier plan à gauche, le nuage loin à droite. |
| 75,45 → 77,82 | « Les sept astronautes se réfugient… dans leurs *capsules*. » | `shelter` 0 → 1 de « astronautes » 75,74 à « capsules » 77,42, `capsules` 1 ; clé plus près (`VIEW.shelter` tourné, az −262) ; `chip-capsules` 77,3 → 77,9. Punch « capsules ». |
| 77,98 | coupe `toduo` | Établi : la bille et la balle de baseball côte à côte (`bille` 1, `big` 1, `dist` 25, `trail` 0), le coupon derrière (≈ 35 % chacune, az −66, d ≈ 70). |
| 78,21 → 81,34 | « En commentaire : le plus dangereux… le gros ou le petit ? » | Orbite lente (az −66 → −80) ; `duelCall` (`aAt` `duelA` 80,30, `bAt` `duelB` 81,10, `toneA: null, toneB: null`) ; la grosse s'allume sur « gros », la petite sur « petit » (un liseré, pas plus) ; chevrons `rail-comment`. Jamais la réponse tapée. |
| 82,12 → 85,32 | « Like pour qui croit que plus c'est épais, plus ça protège. » | Le même trajet continue (sans coupe) jusqu'à `VIEW.pair` (az −84 → −92) ; sur « épais » 84,04 les deux billes frappent : la plaque se troue en un point (`pierce` 0,4 → 1), la tôle et son vide tiennent (`burst` 0,1 → 1) à « protège » 84,96 ; `likeCall`, chevrons `rail-like`. |
| 85,65 | coupe `toabo` | `VIEW.teaser` (établi, `teaser` 1) : le char sous scellés dans le noir, son toit souligné en veille (≈ 50 % de la largeur) ; orbite lente (az −30 → −44). |
| 85,77 → 90,52 | « Abonne-toi : prochain dossier, un char dont le toit est fait pour sauter… pour sauver l'équipage. » | `nextFile` (montre à « prochain » 86,51, fait à « char » 87,59, sort à `toloop` − 0,38) ; `rail-follow` 85,87 → 90,67. |
| 90,99 | coupe `toloop` | `POSE0` tourné de 12° (`az` −50, `d` × 1,1), état `FIRST` sauf `dist` ≈ 600 ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène la caméra sur `POSE0` ; `dist` 600 → 220 jusqu'à la dernière image (la bille arrive comme à l'image 0). |
| 91,11 → 92,08 | « Comme ici, quand… » | La première image. Tire 0,02 et 92,85 côte à côte. |

## Les candidates de la première image

Quatre, à tirer sur les vrais décors (habillage posé) avec `npm run look -- 041 --file essais.json --out .cache/planches/041/image0.jpg` (sans `--bare`), à 0,02 et 0,5 s chacune. Notes sur bouchons (à refaire sur les décors) : 1 événement · 2 perspective basse · 3 menace derrière le sujet · 4 forme reconnue sur 40 % · 5 système petit mais lisible · 6 bouge par son sujet.

| | Idée | 1 | 2 | 3 | 4 | 5 | 6 | |
| --- | --- | --- | --- | --- | --- | --- | --- | --- |
| a | **Sous le labo** (le `voir`) : le module de trois quarts par-dessous, toi endormi à travers le verre, la bille qui file vers ta tête | ✓ | ✓ | ~ (elle vient de côté) | ~ (un tube de verre ; toi le rend lisible) | ✓ (la tôle à une main) | ✓ | 4,5 |
| b | **Derrière ta tête** : dans la cabine, bas, ta tête et ton sac au premier plan, la coque, et derrière, par le verre à côté du coupon, la lumière qui arrive | ✓ | ✓ | ✓✓ | ✓ (quelqu'un qui dort) | ✓ (la paroi, la tôle) | ✓ | 5,5 — **à vérifier** : sur bouchon le coupon opaque cachait la bille ; la caméra doit regarder en biais |
| c | **Le labo sur la Terre** : labo et Harmony par-dessous-devant, le limbe en bas, la traînée longue qui converge sur le labo | ✓ | ✓ | ✗ | ~ | ✓ (`shield` 0,3) | ✓ | 4 |
| d | **L'ISS entière** : la silhouette (les ailes !) sur le limbe, la traînée qui vient du fond, droit sur le labo | ✓ | ~ | ✓ | ✓✓ | ~ (`shield` 0,4) | ✓ | 4,5 |

```json
[
 { "at": 0.02, "label": "a sous le labo", "pose": { "tx": 60, "ty": -60, "tz": 40, "d": 1150, "az": -62, "el": -4, "fov": 48, "shift": -40, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "dist": 220, "trail": 1 } },
 { "at": 0.02, "label": "b derrière ta tête", "pose": { "tx": 40, "ty": 0, "tz": 40, "d": 240, "az": -120, "el": -4, "fov": 48, "shift": -20, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "dist": 220, "trail": 1, "cabin": 0.4 } },
 { "at": 0.02, "label": "c le labo sur la Terre", "pose": { "tx": -300, "ty": 60, "tz": -100, "d": 3600, "az": -66, "el": 2, "fov": 44, "shift": -80, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "dist": 900, "trail": 1, "shield": 0.3, "fx": 0, "fy": 0, "fz": -224, "fs": 2000 } },
 { "at": 0.02, "label": "d l'ISS entière", "pose": { "tx": 400, "ty": 200, "tz": -224, "d": 23000, "az": -55, "el": 4, "fov": 40, "shift": -260, "side": 0, "roll": 0, "drift": 0, "dof": 0 }, "state": { "dist": 6000, "trail": 1, "shield": 0.4, "fx": 400, "fy": 200, "fz": -224, "fs": 6000 } }
]
```

Celle qui est choisie : sa pose dans `POSE0`, son état dans `FIRST` (et `dist` / `trail` dans la table de l'acte 1), la ligne dans `docs/041-actes-maj.md`. Pour **c** et **d**, `dist` de départ plus grand : le chrono démarre alors en millisecondes (« T−9,00 ms »), main.js le gère.

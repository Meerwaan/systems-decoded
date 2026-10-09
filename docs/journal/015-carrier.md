# 015 — `carrier.js` (le navire) : journal

Fichier : `episodes/015-brin-arret/src/carrier.js`. Budget : 30 images lues.

## Ce qui est construit (premier jet)

- **Le repère de la quille.** La coque est tournée de `DECK.skew` : tout le navire est construit dans le repère de la quille (`u` vers l'avant depuis le tableau arrière, `v` vers tribord), posé dans le repère du navire par un seul groupe (`hull`, à `(0, 0, DECK.stern)`, `rotation.y = −skew`). L'axe d'appontage croise le tableau arrière sur la quille ; le pont fait 260 m de long, ≈ 63 m de large au droit du bout de la piste oblique.
- **Le bout du pont** est une arête d'équerre sur l'axe, de x = −1 800 à x = +950 (`EDGE`) : à droite de +950, le pont de l'avant continue vers l'étrave (qui est à x ≈ +3 840, z ≈ −19 200). Sur l'axe, après l'arête : le vide.
- **La coque** : deux bordés loftés (arête du pont, dessous du pont, bouchain à −900, flottaison à −1 600), étrave inclinée, tableau arrière, arrondi de l'arrière (un quart de rond de 2,6 m et son retour). Verre + `asShell(…, 60)`.
- **L'îlot** à `DECK.island`, aligné sur la quille : dix blocs, deux dômes, la bande de vitres de la passerelle, le mât et sa vergue.
- **Le pont n'a pas de dalle** : une forme qui n'écrit que la profondeur (ordre 57) cache, vue d'en haut, la mer, le verre et les traits de la coque ; par-dessus, la peinture (un shader, largeur vraie de près, jamais sous 2,1–2,6 px de loin) : deux bords, l'axe, une échelle de repères tous les 15 m, le seuil, deux ascenseurs, le rail d'une catapulte, un bordé à peine visible.
- **La mer et le ciel** : un dôme à l'infini dessiné EN DERNIER (ordre 100) et testé en profondeur — tout ce qui écrit sa profondeur (un solide, une coque de verre) les cache. Houle en crêtes brisées, quatre tailles ; sillage ; vague d'étrave ; lueur signal sur l'eau dans l'axe, après l'arête ; horizon, trois strates, aube dans l'axe.
- **`under`** : un couvercle (le noir de la scène, ordre −5, testé en profondeur) éteint ce qui est SOUS le pont ; `under` le lève. La soute (traits, sol, flaque de lumière) s'allume ; la vitre a son cadre dans la peinture.
- **`others`** : deux câbles (cylindre + trait de crête 2,6 px) et leurs poulies couchées.
- **`crew`** : cinq marins de verre à tribord (x ≥ 1 700), l'un accroupi.
- **`away`** : une lumière (cœur blanc, halo signal) et le trait qu'elle vient de tracer, sur une trajectoire écrite dans le shader.

## Planches

- A (8 images) : premier passage sur les huit cadres.
  - Lu : (2) et (8) tiennent du premier coup ; (1) le pont au ras est un vide noir, les brins un trait de 1 px ; (3) la lueur est un voile qui colle à l'arête, la coque de l'avant une voile blanche (verre vu par la tranche) ; (5) de l'arrière-bâbord le navire est une planche : on ne voit pas la coque sous le débord ; (6) cadré à travers l'avion (mon erreur : `jet` 0 pour ce cadre) ; (7) deux marins sur cinq dans le champ ; la peinture de près est une dalle blanche de 40 px.
- B (6 images, 540 px) après corrections : peinture plus fine, bordé et points d'arrimage (un treillis de points tous les 2,5 m, dessinés seulement là où ils sont écartés), lueur reculée à 12–70 m de l'arête et resserrée, verre de la coque divisé par deux, plus de bras de vague d'étrave (des traits droits perdus sur l'eau), marins en rang le long du bord tribord de la piste, brins à 3,2 px.
  - Lu : (2) avec l'îlot : bon ; (3) l'arête, le vide, la lueur plus loin : bon ; (5) par l'avant-bâbord : on reconnaît un porte-avions ; (7) cinq marins, l'îlot derrière eux est un carton blanc (verre trop clair) ; (1) le treillis ne montre que trois points : seuil trop sévère.
- C (6 images, AVEC l'en-tête) : peinture bornée à 8 px de large, treillis visible plus loin, îlot moins clair.
  - Lu : (1) et (2) tiennent sous l'en-tête et dans les zones (le brin du film vers y ≈ 1 160, le brin arrière vers 1 000, l'horizon vers 770 ; en (2) le mât s'arrête sous l'en-tête) ; (5) de l'avant, plus haut (`el` 30) : le meilleur cadre du navire ; (4) en longue focale : les trois brins ; (8) : la lumière, sa traîne, l'aube ; (6) : un fouillis de traits — la cage de la soute trop présente, et à `under` 0,3 elle traversait déjà la première image sous le brin.
- D (6 images) : la soute n'apparaît qu'au-delà de `under` 0,35, vitre sans bordé ni points, cadre double.

## Ce qui a raté, et pourquoi

- Un sol « en verre » : écarté avant d'écrire (Fresnel en rasant = dalle grise). Le pont est une forme de profondeur + un shader de peinture.
- Cacher la mer sous le pont par un test dans le shader du ciel : inutile, le dôme dessiné en dernier se teste contre la profondeur de tout le monde (et les coques de verre de l'avion et des marins le cachent aussi : leurs silhouettes se détachent).
- Un cache-profondeur dessiné tôt aurait caché les verres et les lueurs du frein sous le pont (model.js) : le cache du pont est à l'ordre 57, après tout ce que les autres dessinent ; seuls MES traits de coque (ordre 58) et mon verre (58–60) passent après lui.
- Les bras de la vague d'étrave en traits : lus comme des traits perdus. Retirés.
- `pow(x, 2.0)` avec x négatif dans un shader : remplacé par un produit (NaN sinon).
  - Lu (D) : (1) le dessous du brin est propre, le treillis fait un sol ; restait une bande pâle en travers : le cadre de la vitre, déjà dessiné à `under` 0,3 ; (3) l'arête, le vide, la lueur : bon ; (6) lisible, cadre trop clair ; (7) l'îlot encore trop présent, le brin hors champ ; de près, un point d'arrimage est une pastille blanche ; le sillage est une mèche de traits ondulés.
- E (4 images) : cadre de la vitre à partir de `under` 0,25, îlot plus sombre, point d'arrimage en anneau de près, sillage en traînées d'écume brisées, cadre (7) refait avec le brin arrière.
  - Lu : (7) cinq marins en rang, la poulie et le brin arrière à gauche, l'îlot derrière ; (6) avec le vrai frein de `model.js` : il est posé dans une soute éclairée, vu à travers le pont ; le sillage est devenu trop discret (remonté de 0,2 à 0,3 APRÈS la dernière image : non revu) ; le brin de près est un câble fin, clair.
- Dernier contrôle (planche NON lue, pour les erreurs seulement) : la page tourne avec tout à 0 et tout à 1.
- **30 images lues** (8 + 6 + 6 + 6 + 4).

## Chaque nombre de l'état, chez moi

- `shell` : verre de la coque et de l'îlot, tous les traits, la peinture du pont ; sous 0,003 le navire entier est retiré, **y compris ce que le pont cache** (la mer réapparaît sous lui d'un coup : baisser `sea` avec lui, ou couper).
- `sea` : tout le dôme — houle (elle recule à 6 m/s, fonction de `time`), sillage, horizon, strates, aube dans l'axe, lueur signal sur l'eau (de 12 m à l'horizon après l'arête, cœur vers 110 m).
- `under` : 0 → le couvercle éteint tout solide placé SOUS le pont (|x| < 1 500, |z| < 2 400) ; 0,3 → le frein à ≈ 20 %, rien d'autre ; à partir de 0,35 la soute apparaît (parois, sol, flaque de lumière), le cadre de la vitre à partir de 0,25 ; 1 → couvercle levé, peinture et bordé effacés sur la vitre. Le couvercle ne touche jamais ce qui est AU-DESSUS du pont, ni les traits, verres et lueurs (dessinés après lui) : avec `xray` ou `flow`, mettre `under` à 1.
- `others` : les deux brins (câble, trait de crête, poulies), fondu par `setPartOpacity`.
- `crew` : cinq marins (verre + têtes), fondu.
- `away` : 0 rien ; 0 → 0,06 la lumière s'allume au bout du pont ; jusqu'à 1 elle monte (93 m) et s'éloigne (740 m après l'arête), légèrement à bâbord. `A.away` la suit.
- Ancres : `end`, `stern`, `island`, `mast`, `bay`, `bow`, `sea` (le cœur de la lueur), `away`, `brinAft`, `brinFwd`, `crew` (une tête).

## Les poses (prêtes à coller, complètes)

1. Première image — `POSE0` : `{ tx: 0, ty: 150, tz: 2300, d: 3940, az: -160, el: 1.5, fov: 44, shift: 150, side: 0, roll: 0, drift: 0 }` (caméra à x −1 347, y 253, z −1 400 : le brin du film vers y ≈ 1 160 px, le brin arrière vers 1 000, les roues vers 870, l'horizon vers 770).
2. `VIEW.chase` (avec l'îlot à droite) : `{ ...P, tx: 600, ty: 0, tz: -3000, d: 15500, az: -8, el: 12, fov: 46, shift: 200 }`.
3. Le bout du pont : `{ ...P, tx: 0, ty: 0, tz: -11500, d: 5200, az: -14, el: 22, fov: 34, shift: 120 }`.
4. `VIEW.ahead` (longue focale, les trois brins) : `{ ...P, tx: 0, ty: 60, tz: 300, d: 8500, az: -172, el: 12, fov: 28, shift: 150 }`.
5. Le navire entier, par l'avant-bâbord : `{ ...P, tx: 1900, ty: 0, tz: -6400, d: 46000, az: -166, el: 30, fov: 28, shift: 0 }` ; par l'arrière (le sillage) : `{ ...P, tx: 600, ty: 0, tz: 2000, d: 44000, az: -18, el: 27, fov: 28, shift: 0 }`.
6. À travers le pont (`under` 1) : `{ ...P, tx: 0, ty: -300, tz: 0, d: 3600, az: -32, el: 32, fov: 28, shift: 150 }`.
7. Les marins (`crew` 1), le brin arrière à gauche : `{ ...P, tx: 1794, ty: 82, tz: 723, d: 4000, az: -37, el: 6, fov: 36, shift: 60 }`.
8. L'avion reparti (`away` 0,6) : `{ ...P, tx: 0, ty: 1500, tz: -30000, d: 27000, az: -4, el: -2, fov: 34, shift: 0 }`.

## Ce qui n'est pas au niveau

- **La première image, pour ma part, est mince** : au ras du pont, le pont est un treillis de points et quelques traits sur du noir ; l'arrondi de l'arrière n'y est pas visible (il est sous l'arête, caché par le pont lui-même : il se voit dans le cadre 2). Cette image tiendra par l'avion et par le brin du film, pas par le décor.
- Vue de dessus et de l'arrière, la muraille bâbord de l'avant (cadre 3, à droite) est une voile gris pâle : du verre vu par la tranche.
- La lueur sur l'eau est belle de l'arrière (une colonne jusqu'à l'aube) ; vue de haut (cadre 3) c'est une tache molle.
- Les marins : des mannequins sombres à liseré clair. De loin seulement.
- L'îlot : des boîtes. De loin seulement.
- Le sillage : discret, et modifié après la dernière image.
- Rien n'a été vu en mouvement (houle, treillis sous une caméra rapide) : à regarder sur le brouillon.

## À changer ailleurs

- `world.js`, `apply()` — brouillard du pont : `scene.fog.density = onBench ? bench.fog(stage.cam.d) : 0.00001;` (à 0,00003 les solides — roues, crosse, brin, frein — perdent 30 à 45 % dans le cadre de l'arrêt et 85 % dans le plan du navire entier, alors que le verre et les traits n'en perdent rien).
- `main.js` — `far: 400000` convient, ne pas le baisser sous 150 000 : la mer et le ciel n'en dépendent pas (dôme à l'infini), mais la lumière de `away` va jusqu'à 740 m après l'arête.
- `world.js` — `POSE0`, `VIEW.chase`, `VIEW.ahead` : voir les poses 1, 2 et 4 ci-dessus. `STAGED.fx/fy/fz` inchangés.
- Pour celui qui monte : un cadre de dessus sur le frein passe à travers l'avion tant que `pos` < 0 (cadre 6 : `jet` 0, ou l'avion plus loin).
- À vérifier avec `rafale.js` : sur mes planches D (cadre 1), la dérive et les tuyères de l'avion tombaient au bord gauche du cadre, pas là où `hookAt(-27)` et « le nez vers −z » les mettent — peut-être un état intermédiaire du fichier. Mes cadrages supposent `plan.js`.
- `rafale.js` / `model.js`, pour information : la mer et le ciel sont dessinés en dernier (ordre 100) et cachés par tout ce qui écrit sa profondeur — les coques de verre (`asShell`) se détachent donc en silhouette sur l'horizon. Le pont lui-même ne cache rien de ce qui est dessiné avant l'ordre 57.

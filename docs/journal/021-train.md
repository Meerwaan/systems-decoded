# 021 — `train.js` (le TGV Duplex aux rayons X, la ligne, la nuit) — journal

Propriétaire : `episodes/021-veille-tgv/src/train.js` (≈ 1 230 lignes). Budget : 30 images lues — **30 lues** (8 + 8 + 8 + 6).
Planches et essais : dossier temporaire `scratchpad/021/train-1…4.{json,jpg}`.

## Ce qui est construit

- **Motrices** (avant, et l'arrière en miroir autour de x = 17 820) : peau lofée de sections super-elliptiques (galbe,
  rentrée de caisse), un capot long depuis un bec arrondi, le pare-brise incliné aux cotes de `CAB.screen`, le toit. Le
  **bec est à x = −1 330**, pas à `POWER.nose` (−1 100) : 1,4 m de capot devant le pare-brise faisait un crapaud (voir
  « À changer ailleurs »). Traits : ceinture de caisse, ligne de crête (la pente du capot, le pare-brise, le toit),
  épaules du toit, jupes, bande sombre du visage du pare-brise aux phares, cadres.
- **Vitres** : pare-brise et vitres latérales de cabine (bord avant incliné comme le pare-brise, x −880 → −705,
  y 255 → 352) en verre clair à peine réfléchissant, l'air de la cabine allumé derrière (`cab`). Pas de porte latérale.
- **Phares** : deux grappes basses sur le visage, deux feux encre et leur halo chacune, faiblement allumés (toujours).
  Ceux de la motrice arrière éteints.
- **Cabine** : pupitre de verre (dessus, tablier au-dessus de l'espace des genoux, deux joues, face arrière à x −875
  derrière le boîtier, planche inclinée vers le pare-brise et ses deux écrans encre), l'afficheur de vitesse face au
  siège (`display`), plancher en traits seulement, paroi du fond en verre et **porte pleine, fermée** (poignée côté
  cabine). **Le siège vide**, plein, gris moyen : piètement, coussin, dossier incliné et ses ailes, appui-tête,
  accoudoirs, levier — éclairé par une lumière ponctuelle au-dessus du pupitre (× `cab`) : c'est le plus beau plein du
  décor (planches 1 et 4, « b cab »).
- **Traction** : pantographe unibras levé contre le fil, ligne de toit et ses isolateurs, traversée, transformateur
  (ailettes), blocs moteurs des bogies avant, câbles. Le courant : des têtes encre qui coulent du fil au pantographe, le
  long du toit, dans le transformateur, vers les moteurs (`traction` 1 → 0 : tout s'éteint, rien ne coule).
- **Bogies** (13) : roues (profil à boudin), essieux, disques, étriers et **garnitures** qui serrent et luisent veille
  derrière la tête du freinage ; **conduite générale** (tube, encre → veille derrière la tête `brake`).
- **Remorques** (8) à deux niveaux, la caisse basse entre les bogies, soufflets discrets ; vitres des deux niveaux
  en traits et leur lueur (avec `pax`, remorque par remorque) ; planchers des deux niveaux en traits pâles.
- **Les 393** : têtes et épaules de verre instanciées (7 sur 10 au niveau haut), et le dossier de TOUS les sièges en
  verre très pâle (les rangées se lisent même vides) ; révélés d'avant en arrière quand `pax` monte.
- **Toi** : `makeFigure` en verre (tête et mains comprises), assis niveau haut de la 1ʳᵉ remorque, fenêtre gauche,
  tourné vers le nez ; le téléphone dans la main droite, écran encre (`phone`). Ta place et celle d'à côté sont vides.
- **Radio** : trois coques veille qui ne se voient qu'à leur bord, depuis l'antenne (lame + fouet), effacées vers le bas.
- **La ligne** : rails pleins (champignon, âme, patin) + trait clair du champignon, fil de contact et porteur (traits
  continus, brouillard), poteaux côté −z tous les 63 m (colonne, console au-dessus des deux voies, hauban, pendules),
  **un seul shader de sol** : traverses filtrées exactement sur leur course pendant l'obturateur (bande lisse à 255,
  nettes à 0 — vérifié : deux images à 1/30 s identiques, « rail 255 t0 / t1 »), ballast, champs en grille 40 m / 10 m
  jusqu'à l'horizon (niveaux qui s'effacent avant de scintiller), la flaque des phares sur la voie devant le nez. Ciel :
  dôme noir, bande d'encre basse. Tout boucle sur 2 520 m (`run` négatif admis).

## Les nombres (`update`)

`run` fait glisser poteaux et sol (le train ne bouge pas) · `kmh` : l'étalement des traverses, du ballast et des
champs (0 = net) ; les poteaux s'étalent seuls par l'obturateur · `shell` : coque, soufflets, vitres et traits (le
verre du pupitre ne descend pas sous 0,4) · `cab` : lumière sur le siège, écrans, halo du pupitre, air des vitres ·
`pax` : têtes, dossiers, vitres des remorques, remorque par remorque · `you` (0/1), `phone` · `traction` · `brake`
(position de la tête) · `radio` · `display` · `mood` : non utilisé (la teinte franche est celle de `setMood`).

## ATTENTION : l'azimut

Dans `stage.js`, la caméra est en (sin az, cos az) : **az 0 = du flanc GAUCHE (+z), az −90 = de l'AVANT (−x), az +90 =
de l'ARRIÈRE (+x)**. Les poses de `VIEW` prises « de côté » à az −72/−80 sont en fait de face, et `VIEW.pax` (az −150)
regarde de l'avant-droite. Les poses ci-dessous sont dans la bonne convention.

## Poses (vues sur planche ; ajouter `side: 0, roll: 0, drift: …`)

Première image — les quatre candidates (état `FIRST`) :
- **(a) le nez** : `{ tx: -900, ty: 255, tz: 0, d: 1750, az: -60, el: 3, fov: 34, shift: 60 }` — vu avec l'en-tête :
  le nez de verre entre y ≈ 690 et 1 250, les phares, le pupitre et le cadran vert, le siège derrière (petit), les rails.
- **(b) la cabine** : `{ tx: -660, ty: 235, tz: 0, d: 273, az: -69, el: 20, fov: 40, shift: 60 }` (`fx -700, fy 240, fs 250`)
  — **la plus forte** : le siège vide plein cadre, éclairé, l'accoudoir, la porte fermée derrière.
- **(c) la rame** : `{ tx: 6000, ty: 200, tz: 0, d: 12000, az: -78, el: 16, fov: 34, shift: 160 }` (`pax` 0) — un tube de
  verre en diagonale ; à 270 px le siège ne se voit pas : la plus faible.
- **(d) au ras du rail** : `{ tx: -950, ty: 280, tz: 0, d: 1000, az: -60, el: -9, fov: 44, shift: 100 }` — le nez se lit le
  mieux (capot long, phares bas, bogie) ; le siège petit, en haut à droite.
Ma préférence : (b), ou (d) si l'on veut d'abord dire « TGV ».

Autres :
- `cab` (siège, porte derrière) = (b). `seatBack` : `{ tx: -800, ty: 260, tz: 0, d: 250, az: 80, el: 9, fov: 40, shift: 100 }`.
- `side` (flanc gauche, vitre allumée) : `{ tx: -790, ty: 300, tz: 140, d: 950, az: -10, el: 4, fov: 32, shift: 140 }`.
- `pax` (de derrière et au-dessus de la 1ʳᵉ remorque, vers l'avant) : `{ tx: 1300, ty: 330, tz: 0, d: 1400, az: 80, el: 22, fov: 34, shift: 100 }`
  (`pax` 1) — se lit, mais clairsemé (vu avant l'ajout des dossiers).
- `train` : `{ tx: 3000, ty: 250, tz: 0, d: 7000, az: -40, el: 18, fov: 34, shift: 0 }` (le train passe dans le haut : baisser `ty` ou `shift` négatif).
- `wide` : `{ tx: 4000, ty: 0, tz: 0, d: 32000, az: -40, el: 20, fov: 34, shift: 160 }` — le train et les poteaux jusqu'à l'horizon, mais tout en haut : `shift` ≈ −200.
- `rail` : `{ tx: -700, ty: 70, tz: 0, d: 720, az: -25, el: -2, fov: 40, shift: 120 }` — bogie avant, aucun saut à 255.
- `traction` : `{ tx: 350, ty: 280, tz: 0, d: 3000, az: -12, el: 16, fov: 30, shift: 40 }` — transformateur, toit, pantographe à droite, le courant visible.
- `brakes` : `{ tx: 1600, ty: 80, tz: 0, d: 3400, az: -25, el: -6, fov: 32, shift: 150 }` — à `brake` 0,12 la tête est entre motrice et 1ʳᵉ remorque ; la conduite veille derrière elle se lit.
- `roof` : `{ tx: -300, ty: 485, tz: 0, d: 1500, az: -25, el: 16, fov: 28, shift: 100 }` (`radio` 0,6).
- `you` : `{ tx: 1890, ty: 350, tz: 100, d: 330, az: -40, el: 6, fov: 34, shift: 40 }` (`you` 1, `phone` 1).
- `system` (avec le vrai `model.js`) : `{ tx: -820, ty: 190, tz: 15, d: 175, az: -50, el: 22, fov: 28, shift: 40 }` — la
  pédale et son ressort plein cadre, le cadran coupé au bord gauche : **d ≈ 210, tx ≈ −830** pour garder le cadran.

## Ce qui a raté, et pourquoi

- `half` et `out` sont des mots réservés de GLSL : le premier build a échoué (renommés).
- Planche 1 : vitres en dalles grises (le studio s'y reflétait) → réflexion presque coupée ; soufflets vus de face en
  grands cadres arrondis → plus étroits et pâles ; un poteau en plein dans la cabine à `run` 0 → décalés de 26 m.
- Planche 2 : le plancher de verre de la cabine, vu en rasant, faisait une planche blanche → remplacé par son contour ;
  roues en miroir bleu → matière mate ; rails trop brillants.
- Planche 4, **`pax` vu de dedans** (caméra à x 3 150 au niveau haut) : l'anneau de bout de la remorque, tout près,
  sature l'image — inutilisable. Tenir la caméra hors de la remorque (pose `pax` ci-dessus).

## Pas au niveau, dit franchement

- **Les passagers** : de près (`you`), têtes et épaules de verre font des « sucettes » ; de loin, ils se lisent comme
  des points. Les dossiers de verre (les rangées) ont été ajoutés APRÈS la dernière planche qui les montrait : **pas revus**.
- La rame de loin (`train`, `wide`) : les vitres allumées font un damier ; pas revu après la baisse de leur lueur.
- Le flux de traction a été renforcé après la planche 3 ; vu une fois à 1 (planche 4), **pas revu à 0** après le changement.
- Les anneaux radio : affinés après la planche 3 (dôme plein un peu lourd) ; **pas revus**.
- Les traits de la ligne (fils, rails) traversent tous les plans de cabine : c'est la perspective, mais ça charge.
- Le halo rose sur les rails et les jupes dans les plans larges vient de `setMood` (lumière signal), pas de ce fichier.

## À changer ailleurs

- `plan.js` : `export const POWER = { nose: -1330, … }` (le vrai bec ; `A.nose` y est déjà).
- `world.js` → `VIEW` : reprendre les poses ci-dessus (l'azimut de `VIEW.side`, `pax`, `dialCab`, `seatBack`, `desk`
  est à corriger : voir « ATTENTION »), et `POSE0` = la candidate retenue.

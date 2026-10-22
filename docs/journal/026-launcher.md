# 026 · Soyouz MS-10 — journal de `src/launcher.js` (la fusée Soyouz-FG aux rayons X, le pas de tir)

2026-10-21, nuit. Agent du décor `launcher.js` (consigne commune `scratchpad/nuit/consigne-decor.md`, section `launcher.js` de `docs/026-decors.md`). API du bouchon gardée : `buildLauncher()` → `{ group, pad, A, update(P, time, px) }` (plus `fx`, en plus). `npm run check -- 026` passe (0 erreur).

## Lu
`docs/recette-agents.md`, CLAUDE.md (patte, « jamais amateur », « net et fluide »), `docs/026-decors.md`, `docs/026-actes.md`, `docs/journal/026-architecte.md`, `plan.js`, `world.js`, le bouchon, `007/src/jet.js` (en entier), `flameMaterial` et `softGlow` de `007/src/model.js`, `makeHead` et `boltMat` de `008/src/bolt.js`, l'en-tête de `006/src/hall.js`, `kit/lib/build3d.js`, `kit/lib/atmo.js`, faits 026 (« À ne pas dire » : rien de chiffré ni d'écrit dans ce fichier).

## Construit
- **La pile** en verre (`glass` + `asShell` 20, `base` 0,006 : un voile de corps très léger, sinon un fil) : jupe de coiffe, troisième étage fermé par son dôme arrière, bloc central (dôme avant dans le treillis, épaulement, taille à −1900, pied à r 104, plaque de base), module de service en verre intérieur (`asShell` 14 : il se voit à travers la jupe) avec ses deux panneaux repliés et sa tuyère, moteur du troisième étage (4 chambres froides) pendu dans le treillis.
- **Les traits** : coutures (6 anneaux nets, 6 discrets), l'anneau de force à la taille, deux conduits le long du bloc, la baie d'instruments (16 traits), le treillis (12 V, l'identité de la Soyouz), les panneaux, les lèvres des 8 tuyères du bloc.
- **Les quatre propulseurs** : cônes obliques (bord intérieur le long du bloc, le nez se ferme sur le bloc à y −1905), 4 chambres + 2 verniers, aileron triangulaire, 5 anneaux, conduit extérieur. Un repère radial par propulseur (x = vers le propulseur), un `seat` le tourne à son azimut ; même géométrie pour les quatre. D a ses propres matières (verre, aileron, traits).
- **La jonction haute** : dans chaque nez une ferrure (équerre, tige coudée, rotule) ; la douille pleine sur le bloc pour D seulement (celles des quatre faisaient des rivets sur l'anneau). La ferrure de D est « la pièce ».
- **La frappe** : lumière billboard centrée sur son mesh (cœur blanc de ≈ 2 px, gaine 9 → 20 px, halo jusqu'à 340 px), étincelles lentes périodiques (pures fonctions du temps), marque sur la peau du bloc (brûlure, anneau, fissures qui n'apparaissent qu'après l'éclat).
- **Le feu** : disques de feu dans les 8 tuyères du bloc et les 6 de chaque propulseur (vus d'en dessous : la couronne de tuyères), jet du bloc et jets des propulseurs (`jetMat` = l'idiome `flameMaterial`, en ink), panache pâle de 47 m au-dessus de 2 km (plein à 30 km), **traînée** de 600 m : tube dont la ligne médiane est calculée dans le shader (part le long de l'axe, revient à la verticale du ciel sur ≈ 18 m quand `tilt` tourne la pile ; ses bouffées descendent avec `flown`). Vérifié au calcul : à `tilt` 18 elle quitte l'axe et redevient verticale.
- **Le pas de tir** (groupe à part, pont à y 0) : bord du pont, joints de dalles, rebord de la fosse, puits noir (BackSide : la steppe à l'infini ne passe pas par le trou), murs et arête du déflecteur ; quatre bras dans l'axe des propulseurs (treillis, sabot sur le propulseur à 14 m, contrepoids sous le pont) qui basculent dehors sur les 7 premiers mètres de montée ; deux mâts derrière (az 118 et −152) qui s'inclinent ; deux demi-portiques couchés à ±x ; fumée qui roule hors de la fosse au départ (points périodiques).

## Ce que fait chaque nombre ici
| nombre | effet |
| --- | --- |
| `shell` | verre et traits de la fusée (les traits gardent 12 %) |
| `sep` | les trois bons : 0 → 0,3 les nez s'ouvrent de 17° autour du pied (la croix), bouffée au nez de 0,02 à 0,46 ; 0,12 → 1 chute (48 m), 4,5 m dehors, culbute ; disparus à 0,97 |
| `bad` | D au signal de 0,03 à 0,12 ; 0 → 1 il tourne de 8° autour de sa jonction haute (le pied sort de 2,6 m), le nez s'écarte (60 cm à 0,5) puis revient : **contact à 1** (l'apex 4 cm dans le bloc) ; 1 → 2 rebond (5 m), culbute (1,5 rad), chute (52 m) ; disparu à 1,97 |
| `impact` | 0,45 → 1 l'éclat (cœur, gaine, halo) ; 0,12 → 0,35 la braise qui reste ; étincelles au-dessus de 0,4 ; marque au-dessus de 0,15, fissures après l'éclat |
| `fault` | la ferrure de D se coude de 8° et s'allume signal franc (sa base fonce, l'émissif porte), ses arêtes passent au signal |
| `burn` | jet du bloc, disques de feu ; en altitude le jet s'élargit et le panache paraît |
| `boost` | jets et disques de feu des propulseurs (ils partent avec eux) |
| `trail`, `tilt`, `flown` | la traînée ; son contre-tour ; ses bouffées (0,3 × la montée) et les ondulations / la respiration des jets (temps arrêté = jets figés) |
| `alt` | le panache (2 → 30 km) ; au pas de tir, les bras et les mâts basculent sur les 7 premiers mètres au-dessus de `PAD.alt` |
| `pad` | le pas de tir (traits, puits, fumée) |
| `apart`, `airspeed` | non lus : `world.js` fait tomber le groupe, la traînée reste attachée aux moteurs |

## Planches (30 images lues sur 30) et mesures
- **p1 (8)** : (a) se lit comme une Soyouz vue d'en dessous, D signal à gauche ; MAIS bouffées = projecteurs, boule blanche à la base, étoile des fissures, ferrure et douilles noires en « yeux », traînée invisible, fusée de loin = dessin fin. Pas de tir : se lit (bras, mâts, portiques). (c) : treillis et dôme du bloc en contre-plongée, très beaux.
- **p2 (8)** : bouffées réduites ; traînée toujours absente à l'œil → sonde numérique (`scratchpad/026/launcher/probe.mjs` : deux rendus, différence chiffrée, points projetés — pas d'image lue) : la traînée est là (+65 de luminance) mais tombe sous y 1500 dans `stack`, dans la zone basse ; `fault` et le décollage en blanc total : c'était `sky.js` en chantier (réglé ensuite) et ma fumée trop forte (÷ 4).
- **p3 (8)** : premier plan réel (`FIRST`) bon ; croix bonne ; éclat sans étoile ; la pièce rose pâle (émissif sur gris clair) → base qui fonce + émissif ; le panache de 92 m cachait le coude de la traînée → 47 m ; `torn` mal cadré.
- **p4 (5)** : la frappe tient (éclat signal, cœur blanc, étincelles, nez signal contre le flanc) ; la pièce signal franc (mesuré 253, 105, 70), coudée, à côté de la ferrure saine de B (grise, droite) ; `torn` corrigé au calcul.
- **p5 (1)** : `torn` v4 : la tête et ses quatre jets veille sous l'en-tête, la fusée inclinée qui s'éloigne dessous, la marque sur son flanc. Se lit.

## Poses (prêtes à coller)
- **POSE0 (a)** tel quel : mesuré, nez de la coiffe à y 83 px, bas de la coiffe à 250, moteurs à 1586 — **la tête est sous la barre de recherche de TikTok**. Pour la mettre en zone haute : `{ tx: 0, ty: -1300, tz: 0, d: 7000, az: -28, el: -32, fov: 46, shift: 0, side: 0, roll: 0, drift: 0, dof: 0 }` (nez 466, mais pieds des propulseurs à 1800–1860 : zone basse). À trancher sur la planche des quatre.
- **cross**, **strike**, **fault**, **pad** : les `VIEW` actuels cadrent bien.
- **stack avec sa traînée** : `{ ...P, tx: 0, ty: -2400, tz: 0, d: 16500, az: -8, el: 2, fov: 32, shift: 60 }`.
- **torn** : `{ ...P, tx: -640, ty: -800, tz: 0, d: 9400, az: -20, el: -4, fov: 36, shift: 0 }` — mesuré : à `apart` 0 le haut de la fusée est à (720, 648) px, à 15 m (537, 1059), à 30 m (342, 1500) : elle sort par le bas vers 30–40 m, la tête reste.
- (c) au ras du coup, `{ tx: -150, ty: -1250, tz: 0, d: 1700, az: -80, el: -38, fov: 50, shift: 150 }` : le plus beau plan de la structure (treillis, dôme, chambres du troisième étage), mais la menace est devant.

## Pas encore au niveau (franchement)
- De loin (`stack`, `torn`) la fusée reste un dessin fin : elle se lit par ses jets, ses lèvres et la tête pleine ; le bloc seul (après la séparation) est mince.
- Le pas de tir est un dessin technique de traits (bras, mâts, portiques) ; la fosse ne se lit comme un trou que d'un peu haut (à `el` 4 elle disparaît) ; c'est au décorateur de lui donner la nuit (projecteurs).
- La pièce, à d 420, fait un tiers du cadre et son signal est plat (émissif) ; elle se lit par comparaison avec la ferrure saine voisine.
- La fumée du décollage est discrète et tombe, avec les jets, dans la zone basse de `VIEW.pad`.
- Les bouffées de la croix sont devenues discrètes : la croix se lit surtout par les quatre pétales.

## À changer ailleurs
- `src/world.js`, `VIEW.torn` : `torn: { ...P, tx: -640, ty: -800, tz: 0, d: 9400, az: -20, el: -4, fov: 36, shift: 0 },`
- `src/world.js`, ajouter si utile : `stackTrail: { ...P, tx: 0, ty: -2400, tz: 0, d: 16500, az: -8, el: 2, fov: 32, shift: 60 },`
- `src/model.js` (section de verre de l'établi, « même verre que launcher.js ») : `glass(BRAND.ink, { base: 0.006, rim: 0.12, power: 3, edge: 0.3, spec: 0.22, through: 0.2 })`, `asShell(…, 20)`.
- Actes : `flown` fait vivre jets et traînée — à faire avancer dans tout plan de vol (≤ ≈ 150 m par seconde de film), à tenir quand le temps s'arrête ; `impact` 0 → 1 → 0,35 donne éclat puis braise (étincelles au-dessus de 0,4, fissures après l'éclat) ; `A.fault` et `A.boosterD` suivent D.
- `POSE0` : la tête passe sous la barre de recherche (voir Poses) — à régler sur la planche des quatre candidates.

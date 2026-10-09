# 017 — `suite.js` (la salle) : journal

Fichier : `episodes/017-irm/src/suite.js`. API : `buildSuite()` → `{ group, update(P, time, px), A, fx, you, held }`.
Planches, `essais.json` et petits outils : dossier temporaire `scratchpad/017/suite-*` (l'arithmétique des cadres : `suite-proj.mjs`, sans image). Budget : 30 images lues.

## Parti pris

- **Les murs, le plafond, le toit sont des feuilles de verre simples** (une surface, pas une dalle à six faces), sans coque : ils ne cachent jamais rien, vus du dedans comme du dehors. Leur dessin, ce sont leurs traits : pied des murs et angles en fin, plafond en très fin, **l'encadrement de la porte en fort** — trois barres de verre à lèvre (coque 22) plus l'ouverture tracée des deux côtés du mur (12 cm d'épaisseur). Le vantail (coque 24) est pendu au montant de droite et **ouvre vers l'extérieur** (100°) : c'est ce qu'on recommande pour une salle d'aimant, et dans la première image il sort du cadre au lieu de passer derrière toi.
- **Le sol** : ma propre grille, à la taille de la salle (30 cm, renforcée tous les 1,5 m), dont chaque famille de traits s'en va avant de se serrer sous le pixel (vue en rasant, une grille qui ne s'en va pas devient une dalle grise) ; un peu de lumière au sol sous la machine.
- **La ligne au sol** : une bande de peinture de 9 cm (signal, HDR 1,7), sa lueur sur 56 cm, et par-dessus un trait d'écran de 2,2 px qui ne passe jamais sous ce que l'écran sait dessiner. Elle respire très lentement (± 5 %).
- **La vitre du poste de commande est dans le mur −x, au fond** (z −250 … −70). Dans le mur de la porte, son cadre passait entre la caméra de la première image et la machine ; plus près, au-dessus du chariot.
- **Le chariot est contre le mur −x** (x −282, z 160), hors de la ligne, et hors de toutes les lignes de visée qui vont du mur de la porte à la machine (contre le mur de la porte, il s'est retrouvé devant la personne retenue : planche 3). Les objets (clés sur un anneau avec une plaquette, ciseaux, stylo) sont **une fois et demie plus grands que nature** : on les voit du bout d'une salle.
- **Ce que jette l'aimant laisse un sillage signal** (un cône de lumière sans bord, derrière l'objet, nul au départ et à l'arrivée) : de loin, c'est lui qui dit « projectile ». Celui de la bouteille est dosé (à pleine force au départ, c'était un flash qui la cachait).
- **Toi** : `makeFigure` en coque, mains vraies, tout en verre, la tête sculptée du 012 (comme le 016). Dans l'encadrement tu es **à mi-pas**, tourné vers la bouche du tunnel, la bouteille **presque debout** contre toi (30° de la verticale : son ogive blanche et son robinet dépassent à côté de ta tête — en travers de la poitrine, on ne la lisait pas à 405 px), une main dessus, une main dessous (`hold`, sur son rayon). Quand elle part : bras tendus vers elle (`bottle` 0,02 → 0,22), puis à demi baissés, mains ouvertes (0,72 → 1).
- **La personne retenue** : verre plus pâle (k 0,98 contre 1,25), debout dos à la façade, **à gauche de la bouche** (x −62), les deux mains sur la bouteille, la tête un peu baissée vers elle. Immobile, entière.

## Trois écarts au plan, voulus (voir « À changer ailleurs »)

1. **La première image est prise de DERRIÈRE le mur de la porte**, pas de l'intérieur. La bouche du tunnel regarde le mur de la porte : de l'intérieur, la bouche et la porte sont à plus de 43° l'une de l'autre quel que soit l'endroit (un cadre vertical de 38° de focale n'en voit que 22), et du `POSE0` donné (derrière la machine) la machine te cache entièrement. Du dehors, à travers le mur de verre : la machine à gauche, sa bouche vers nous, la boîte à boutons au milieu, toi dans l'encadrement à droite — et la bouteille volera de droite à gauche, en travers de l'image.
2. **La bouteille ne finit pas en (22, 118, 96) mais à plat sur la façade à GAUCHE de la bouche : (−60, 120, 98,7)**, presque horizontale, le robinet vers la bouche. Devant la bouche il y a la table : personne ne peut s'y tenir debout ; et à droite de la bouche, vue du côté éclairé (az −20 … −40), la table cache les jambes. À gauche, la personne est entière et la bouteille lui barre la poitrine. **Avec `victim`, la bouteille est 20 cm plus en avant** (le corps est entre elle et la façade) : c'est la seule chose que `victim` lui fait — elle « n'entre » pas dans le corps. Faire monter `victim` sur une coupe ou en fondu court : la bouteille avance pendant ce temps.
3. **À la boîte, tu n'es pas en `YOU.box` (92, 372) mais de l'autre côté de la boîte : (44, 372)**, et c'est ta main GAUCHE qui va aux boutons. Entre la boîte et la porte, quel que soit l'azimut, le montant de la porte passe derrière ton avant-bras ou derrière ta tête (calculé pour az −100 … 180) ; de l'autre côté, vu de az +150, l'image se lit de gauche à droite : la porte, la boîte, ton bras, toi.

## Ce que j'ai lu de `model.js` (sans y toucher)

- La façade est une cuvette : plate (z ≈ 88) entre 62 et 80 cm de l'axe, en entonnoir jusqu'à z = 73 au bord du tunnel. Les objets finissent **couchés sur la pente de l'entonnoir** (52, 54 et 50 cm de l'axe), pas à plat à z = 88 où ils flotteraient de 4 cm.
- Deux pavés de commande à x = ± 74, hauteur 121, qui dépassent de 2,6 cm : la bouteille repose sur celui de gauche (z = 88 + 7,5 + 3,2).
- La boîte est retournée vers la salle (`rotation.y = π`) : **l'arrêt d'urgence est en x = 77,5, l'arrêt de l'aimant en x = 62,5** ; le champignon finit à 9,6 cm du plan de la boîte, le bouton de l'aimant à 7,2 ; le capot se lève de 112° autour de son bord haut. D'où : une claque de la paume, doigts en l'air, sur l'arrêt d'urgence ; le bout des doigts, par-dessous le capot levé, sur l'arrêt de l'aimant.

## Ce qui a raté, et pourquoi

1. **Planche 1** — le chariot contre le mur de la porte, coupé par le bord gauche de la première image ; la bouteille en travers de la poitrine, illisible ; `VIEW.room` tel que donné te met hors cadre (x = 1283).
2. **Planche 2** — le sillage de la bouteille à `bottle` 0,3 : un flash blanc qui la cache. Les objets vus de derrière le chariot : minuscules (ils pointent vers l'aimant, donc on les voit par le bout).
3. **Planche 3 (avec l'en-tête)** — le chariot, déplacé à gauche du mur de la porte, était devant les jambes de la personne retenue. L'horizon du ciel : le trait le plus clair de l'image, en travers du nuage.
4. **Planche 4** — les objets collés ne tombaient pas quand le champ tombe : `(1 − 0,34) / 0,66` ne vaut pas 1 en flottants, et le test était `go >= 1`. Les objets en vol, vus du coin de la salle : des marques sombres — une pièce si petite n'est que ses arêtes, et elles étaient foncées et fortes (passées à 0,3).

## Chaque nombre, chez moi

| | |
| --- | --- |
| `shell` | le verre (murs, plafond, encadrement et vantail, vitre, chariot), les traits, la grille. Les objets du chariot sont entiers dès 0,5 et partis sous 0,25. **Ni toi, ni la bouteille, ni la personne, ni la ligne ne dépendent de `shell`** |
| `door` | le vantail : 0 fermé → 1 ouvert de 100° vers l'extérieur |
| `line` | la ligne peinte : bande, lueur, trait |
| `you` | toi (verre) et ton ombre de contact ; la bouteille dans tes bras disparaît avec toi |
| `spot` | 0 dans l'encadrement, à mi-pas, tourné vers la bouche du tunnel · 1 à la boîte (44, 372), face au mur. Entre les deux tu marches (deux pas) |
| `reach` | à la boîte, ta main gauche : 0 le long du corps · 1 la paume sur l'arrêt d'urgence · 2 le bout des doigts sur l'arrêt de l'aimant (elle recule de 7 cm entre les deux) ; la tête et le buste suivent |
| `carry` | 1 : la bouteille est à toi — dans tes bras tant que `bottle` vaut 0, puis bras tendus, puis mains ouvertes · 0 : bras le long du corps, et pas de bouteille tant que `bottle` vaut 0 |
| `bottle` | sa place ne dépend que de lui (et des 20 cm de `victim`) : chemin = `bottle`^2,4 (à 0,3 elle vient de quitter tes mains, à 0,7 elle est à 42 % du chemin) ; elle se met le pied en avant (0,02 → 0,42), claque à plat (0,8 → 1) ; sillage signal en vol. **`bottle` → 0 la fait revoler vers la porte : pour la retirer, une coupe** |
| `loose` | clés 0 → 0,62 · ciseaux 0,14 → 0,8 · stylo 0,3 → 1. Chacun : se soulève de 15 cm et se tourne vers l'aimant (premier tiers de sa fenêtre), puis file (accéléré, en vrille), puis se couche sur l'entonnoir de la bouche. À 0,4 : les clés planent et partent à peine |
| `victim` | la personne de verre, 0 → 1 ; avance la bouteille de 20 cm |
| `sky` | la dalle du toit (verre, acrotère en fort, grille), le manchon autour du tube ; au loin, dessinés à l'infini : l'horizon, l'air au-dessus, trois strates, et le sol jusqu'à l'horizon. Ne dépend pas de `shell` |
| `tesla` | sous 0,6 T, ce qui était collé lâche : la bouteille (si `bottle` = 1) glisse au pied de la machine, les objets (si `loose` = 1) tombent — à 0 ils sont par terre (les ciseaux sur la table) |

Ancres `A` : `door` (haut de l'encadrement), `head` (au-dessus de ta tête), `hand` (ta main GAUCHE, celle des boutons), `handR`, `you` (ta poitrine), `bottle` (son centre : elle la suit), `trolley`, `keys` (elles les suit), `victim` (au-dessus de sa tête), `line` (sur la ligne, entre la porte et l'aimant), `roof` (le manchon, là où le tube sort), `window`.

## Cadrer : ce que dit l'arithmétique (`suite-proj.mjs`, sans image)

- En vertical, le champ horizontal est étroit (22° à 38 de focale) : la machine et toi ne tiennent ensemble que vus de derrière le mur de la porte, presque de face (az −11), de loin (12,6 m) : la machine fait ≈ 430 px de large, toi ≈ 430 px de haut. Plus près ou plus de biais, tu sors à droite sous les boutons de TikTok ; plus à droite, la boîte à boutons passe devant la machine.
- La caméra reste sous 4,2 m de haut : au-dessus, l'arête haute du mur de la porte passe en travers de la machine.
- « Toute la salle » avec le chariot (contre le mur −x) : 1,4 px par centimètre, c'est un plan d'ensemble.
- Les objets filent surtout en profondeur vus du coin de la salle (ils pointent vers l'aimant : on les voit par le bout) ; vus de face ils traversent l'image mais le chariot et la bouche sont alors à 950 px l'un de l'autre. Deux cadres : l'un sur le chariot (le décollage), l'autre sur tout le trajet.
- « La ligne au sol devant toi », vue de face (depuis la machine) : la ligne est si près de la caméra qu'elle tombe 200 px sous tes pieds, dans les sous-titres. Vue de derrière toi, elle passe à gauche de tes jambes, entre toi et la machine : c'est ce cadre-là.

## Poses

Vues AVEC l'en-tête et les zones : 1 (deux fois), 5 (trois fois), 6 (le large), 7 (deux fois), 8. En 3D seule : 2, 3, 4, 6 (le serré). `P = { fov: 28, side: 0, roll: 0, drift: 0.3 }`.

```js
// 1 · la première image — de derrière le mur de la porte : la machine, la boîte, toi dans l'encadrement
export const POSE0 = { tx: 75, ty: 130, tz: 220, d: 1260, az: -10.8, el: 11.8, fov: 38, shift: 240, side: 70, roll: 0, drift: 0 };
// 2 · toute la salle (le chariot à gauche, toi à droite) — lumière : fs ≈ 700
room: { ...P, tx: 40, ty: 100, tz: 150, d: 2200, az: -20, el: 26, fov: 36, shift: 190 },
// 3 · le vol de la bouteille : dans le cadre de POSE0 (vu à bottle 0,3 · 0,7 · 1) — elle traverse l'image de droite à gauche
// 4 · les objets : le décollage, près du chariot (vu à loose 0,4)…
trolley: { ...P, tx: -190, ty: 110, tz: 140, d: 484.7, az: -52.9, el: 16.8, fov: 40, shift: 100 },
//     …et tout le trajet, du chariot (en bas à gauche) à la bouche (en haut à droite) (vu à loose 0,3 et 0,5)
loose: { ...P, tx: -170, ty: 105, tz: 130, d: 608.9, az: -54.1, el: 17.7, fov: 40, shift: 140 },
// 5 · la bouche : la bouteille plaquée, la personne retenue, les objets collés (bottle 1, victim 1) ; c'est aussi le cadre du champ qui tombe
mouth: { ...P, tx: -30, ty: 100, tz: 100, d: 1100, az: -24, el: 8, shift: 170 },
// 6 · toi à la boîte, en pied : la porte, la boîte, ton bras, toi (spot 1, reach 1 puis 2) — lumière : fx 62, fy 120, fz 400, fs ≈ 150
box: { ...P, tx: 62, ty: 100, tz: 398, d: 760, az: 150, el: 12, fov: 40, shift: 170 },
//     …et la boîte de près (7 px par centimètre : toi de dos, coupé à mi-cuisse — vu avec reach 2, flap 1, mstop 1)
boxNear: { ...P, tx: 64, ty: 128, tz: 404, d: 330, az: 152, el: 10, fov: 44, shift: 150 },
// 7 · la porte, toi mains vides, la ligne au sol devant toi (carry 0)
door: { ...P, tx: 110, ty: 105, tz: 330, d: 969.7, az: -10.5, el: 15.2, fov: 36, shift: 200 },
// 8 · au-dessus du toit (sky 1) — lumière : fs ≈ 500
roof: { ...P, tx: 0, ty: 450, tz: -30, d: 1000, az: -34, el: 5, fov: 36, shift: 80 },
```

Où tombent les choses (px, image de 1080 × 1920) : **POSE0** — bouche (271, 716), haut de la machine 458, toi : tête 690, pieds 1116, x ≈ 805 ; l'encadrement 690 → 940. **mouth** — la personne : tête ≈ 580, pieds ≈ 1140, x ≈ 440 ; le haut du tambour passe derrière le bas de l'en-tête (avec `shift` 140 il reste dessous, mais les pieds descendent à 1213). **door** — haut de l'encadrement à y ≈ 485 : sous un panneau d'appel à l'action, baisser `shift`. **boxNear** — ta tête à y ≈ 465.

## Ce qui n'est pas au niveau

- **Les objets** (`loose`) : petits. On lit les ciseaux près du chariot (≈ 110 px), les clés par leur sillage, le stylo à peine tant qu'il n'est pas collé. Ce qui porte le plan, ce sont les trois sillages signal et le chariot de verre. Collés autour de la bouche, les trois se lisent (cadre `mouth`).
- **La première image** : toi ≈ 430 px, la bouteille ≈ 170 px. Elle se lit (ogive blanche, robinet à côté de la tête), mais elle n'est pas grande, et on ne peut pas l'agrandir sans perdre la machine ou la porte. Tu es vu de trois quarts arrière.
- **La personne retenue** est pâle sur une façade claire (`model.js` : 0xb3babf) : on la lit en pied, pas davantage. Ne pas la cadrer de plus près.
- **`boxNear`** : un mannequin de dos à 7 px par centimètre. Le geste se lit (le bout des doigts sous le capot levé, sur le bouton vert) ; c'est la limite de ce que le personnage supporte.
- **Le ciel** : l'horizon, l'air et une strate se lisent ; le sol au loin, presque pas. La vitre du poste de commande ne se voit guère que dans le plan d'ensemble.
- **Jamais vus** : la porte fermée (`door` 0), toi en marche (`spot` entre 0 et 1), `victim` entre 0 et 1, la chute à mi-course (`tesla` entre 0,6 et 0), les objets tombés (trop petits dans le cadre `mouth` : la bouche est propre, c'est tout ce qu'on voit).

## À changer ailleurs

- **`world.js`** — remplacer `POSE0` et, dans `VIEW`, `room`, `mouth`, `box`, `roof` par les lignes ci-dessus ; y ajouter `trolley`, `loose`, `boxNear`, `door`. Le commentaire de `POSE0` (« seen from inside the room … in the doorway behind the table ») devient : `// The first frame is the hook, seen through the door's wall: the silent scanner, its mouth toward us; the box with the two buttons; and in the doorway, you, the cylinder in your arms.` Dans `FIRST` : `reach: 0, //   your LEFT hand at the box: 0 down · 1 flat on the emergency stop · 2 its fingers on the magnet stop` et `bottle: 0, //  the oxygen cylinder: 0 in your arms · 1 flat on the machine's front, left of the mouth (in between it flies, foot first)`.
- **`plan.js`** (pour qu'il dise vrai ; `suite.js` a ses propres constantes `STUCK`, `AT_BOX`, et ne lit plus que `YOU.box[2]`) : `export const YOU = { door: [175, 0, 404], box: [44, 0, 372] };` et `export const BOTTLE = { len: 68, r: 7.5, held: [168, 112, 388], stuck: [-60, 120, 98.7] };`. Son commentaire de tête (« the door beyond on the right ») : la caméra de la première image est derrière le mur de la porte.
- **`model.js`** — rien à changer. Mais `suite.js` recopie trois de ses mesures : le profil de la cuvette (`DISH`), les pavés à x = ± 74 qui dépassent de 2,6 cm (`STUCK.z`), la saillie des deux boutons et le retournement de la boîte (`BUTTONS`). Si elles bougent là-bas, elles bougent ici.
- **Les actes** — (1) `victim` monte sur une coupe ou un fondu court : la bouteille avance de 20 cm pendant ce temps. (2) `bottle` → 0 fait revoler la bouteille de la machine à la porte, et `loose` → 0 ramène les objets au chariot : pour les retirer (fin de l'acte 1), une coupe, pas un fondu. (3) À la boîte, `flap` 1 avant `reach` 2 : les doigts passent sous le capot levé. (4) `sky` ne se monte que caméra au-dessus du toit : dedans, l'horizon traverserait la salle à hauteur d'œil. (5) Le chariot n'est dans aucun des cadres de la machine : le plan « sur le chariot, les clés se soulèvent » du like se fait dans le cadre `trolley` (toi n'y es pas) — ou dans `room`, où les clés font 25 px.
- **`episode.json` → `sources`** : la forme de la ligne au sol est illustrative (déjà dit dans `plan.js`) ; les clés, les ciseaux et le stylo sont dessinés une fois et demie plus grands que nature ; le sillage lumineux de ce que l'aimant attire est une convention d'image ; la personne retenue est un mannequin, aucun accident réel n'est reconstitué.

Images lues : 29 sur 30.

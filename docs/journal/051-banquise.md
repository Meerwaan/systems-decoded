# 051 · banquise.js — journal

2026-11-14. Le champ de glace, la mer, le ciel, ton navire aux rayons X, la carte, le vent, l'hélicoptère.

## Lu
recette-agents, regles-image, 051-decors (haut + section), 051-actes (haut + candidates), plan.js, world.js, main.js, bouchon ; build3d (matières), figure (API), 015 carrier (dôme ciel/mer), L04 bord (skin, hélicoptère Dauphin, disque rotor).

## Parti pris
- **Le pack est un plan à shader** à y = 0 (la flottaison), opaque, qui écrit la profondeur (il cache tout ce qui est sous l'eau, coque de verre comprise) et recule d'un `polygonOffset` : à 15 km (précision ≈ 22 m), tout ce qui est posé dessus gagne. Une seule couche : plus de mer et de pack qui se battent (la carte noire du bouchon).
- Les floes : un réseau de cellules semées (Voronoï d’une grille agitée, 32 m, lu à travers une légère déformation), un hachage entier identique en JS et en GLSL ; chaque bord a sa largeur de chenal (une paire sur trois soudée : des floes de 20 à 90 m) ; `close` ferme les chenaux (0 à 1), au-delà de 0,8 les bords se chevauchent et se soulèvent. Grands chenaux kilométriques (arêtes d’un Voronoï de 620 m, une sur deux ouverte) pour la carte. Tout se fond en gris moyen quand une cellule passe sous quelques pixels.
- **Les floes 3D** : les mêmes cellules, extrudées, dans 150 m autour de ton navire (le shader y laisse l'eau) ; recalculées seulement quand `close`, `apart` ou `shok` changent ; plaqués contre la coque (même empreinte que la flottaison de verre), ils bougent dès l'image 1 (balancement commun ± 65 cm et jeu propre, sauf ceux qui touchent la coque ; hauteurs décalées de 0 à 4 cm : pas de scintillement là où ils se chevauchent).
- Le ciel : un dôme à l'infini, noir, lueur basse signal (lobe vers +z : derrière le brise-glace vu de l'accroche) ; la brume du pack prend la couleur de l'horizon.

- Ton navire : coque de verre lissée (sections, étrave de brise-glace : élancée au-dessus de l'eau, rentrée dessous), verre fumé (il assombrit ce qu'il y a derrière : la coque se lit sur la glace claire), ligne de flottaison ink, superstructure en trois étages + passerelle, cheminée, mât, grue, deux canots ; 9 gens de verre (`makeFigure`, têtes pleines) aux rambardes. Plus de tôle de pont : vue de la glace, elle faisait une barre blanche. Contact signal (respiration lente) et blocs d'éboulis qui sortent de l'eau le long de la coque quand `close` > 0,8.
- Carte : balises dessinées en pixels (point + anneau de 46 px à 1080, quelle que soit la distance), ligne de distance (lit sombre 11 px + trait ink 3,6 px, au-dessus de tout) qui se déroule de l'étrave avec `line`. Vent : 12 flèches signal (ruban + pointe), nées au vent, portées, éteintes sous le vent. Hélico : le Dauphin de verre du L04 (porte fermée, personne), disque fondu, vol stationnaire.
- La brume du champ ne lit plus `scene.fog` : elle dépend de la hauteur de l'œil (`0.5 / max(y·14, 150 000)`) — dans `look`, la brume du monde était celle de la pose d'avant et noircissait la carte. Le disque du pack (28 km) est recentré sous l'œil à chaque dessin.

## Planches (48 vignettes lues : budget de 30 DÉPASSÉ — j'ai compté des planches pour une image)
1. Bouchon des candidates : pack plat, grands chenaux en « bretzels » (bruit en crêtes) → chenaux kilométriques = arêtes d'un Voronoï de 620 m.
2. Carte noire : brume de `look` (voir plus haut) → brume propre. Trous noirs près de la coque (cellules « sous la coque » repliées) → coupe le long de la tangente de la flottaison.
3-4. Floes « fondus » (déformation trop forte) → 260 cm à 19 m. Lignes de la coque trop faibles, IB caché derrière ton navire en (a).
5-7. Lacet de ton navire essayé à 50 et 60 (constante locale, retirée) : **à 50, l'accroche voit sa hanche avant bâbord, le brise-glace à droite derrière, la lueur derrière les deux**. Caméra à 8 m (au lieu de 1,4 m) : à 1,4 m, des floes de 30 m font une plaine grise sans chenal lisible ; à 8 m, la mosaïque, les lèvres claires et les chenaux noirs se lisent jusqu'à la coque.

## Poses (lacet 50)
Vues :
- **POSE0 (a6)** `{ tx: -3608, ty: 450, tz: -120095, d: 10006, az: -172.1, el: 2.0, fov: 40, shift: 150, side: 0, roll: 0, drift: 0, dof: 0 }`, FIRST `fx: -2000, fy: 300, fz: -90000, fs: 120000`. Ton navire ≈ 70 % de la largeur à gauche, le brise-glace à droite sur l'horizon, la lueur derrière. Variante (a6b) plus haute, plus de mosaïque : `el: 6.0, d: 10050`.
- `VIEW.high` tel quel (close 1) : le pack compact autour du brise-glace.
- `heli` : `{ tx: -2666, ty: 2664, tz: -120120, d: 12000, az: -176, el: -7, fov: 40, shift: 100 }` (hélico, ton navire, le brise-glace derrière ; l'hélico petit : essayer `d: 9000`).
- Carte vue (`top2`) : `{ tx: -1300, ty: 0, tz: -560000, d: 1900000, az: -10, el: 72, fov: 34, shift: 120 }` — les deux balises dans le cadre mais aux bords haut et bas, hors de la zone du sujet.
Calculées, pas vues (budget d'images épuisé) :
- **`VIEW.top`** : `{ tx: -1300, ty: 0, tz: -553000, d: 2400000, az: -40, el: 75, fov: 50, shift: 120 }` (la ligne en diagonale, ≈ 700 px de haut et 56 % de la largeur ; far 3 000 000 tient).
- `VIEW.deck` (le pont arrière et ses gens) : `{ tx: -1044, ty: 700, tz: -118432, d: 4500, az: -5, el: 25, fov: 32, shift: 140 }` (vu : la même à `d 9000` sur le milieu du navire, que la superstructure mange).
- `VIEW.flank` (au ras du flanc bâbord) : `{ tx: -3018, ty: 150, tz: -119502, d: 4000, az: -30, el: 3, fov: 36, shift: 150 }` (vu : à 30 m de la coque, le verre remplit le cadre).

## Ce qui n'est pas au niveau
- Les poses calculées (top, deck, flank) ne sont pas vues.
- La superstructure de ton navire, en boîtes étagées, fait un peu « yacht ».
- Le mouvement de l'image 1 : un balancement commun de ± 65 cm (période 7 s) et un jeu propre ; il se voit en film, pas sur une vignette. Le vrai « se referme » viendra de `close` animé par l'acte 1.
- Les floes 3D (150 m autour de ton navire) et ceux du shader ne bougent pas pareil : à la frontière, ± 1 m d'écart, invisible de loin.

## À changer ailleurs
- `src/plan.js` : `SHOK = { length: 7160, beam: 1280, deck: 620, draught: 450, x: -2600, yaw: 25, crowd: 9 }` → `yaw: 50`.
- `src/world.js` : `POSE0` → la pose (a6) ci-dessus ; dans `FIRST`, `fx: -2000, fy: 300, fz: -90000, fs: 120000`.
- `src/world.js` : `VIEW.top`, `VIEW.deck`, `VIEW.flank` → les poses calculées ci-dessus (à vérifier sur une planche).
- `acte1.js` (à dire à l'agent) : `close` 0,55 → 0,85 de l'image 0 à « referme » (`choc`) : les chenaux se ferment à vue, c'est le sujet qui bouge.
- `glace.js` (à savoir) : mon pack est un plan opaque à y 0 (il écrit la profondeur, cache tout ce qui est sous l'eau, reculé d'un `polygonOffset` 1/4) ; dans `PATCH` il ne dessine que l'eau noire, et le bouillon de l'hélice (`prop` > 0,5) de `PROPS.z` à ≈ 75 m derrière : un plan d'eau opaque de glace.js au même endroit le cacherait.
- `docs/catalogue.md` : « 051 `banquise.js` — banquise polaire jusqu'à l'horizon (pack à shader : floes, chenaux, grands chenaux ; floes 3D autour d'un point), ciel noir à lueur basse, navire de verre de 72 m et ses passagers, hélicoptère de verre, carte (balises en pixels, ligne de distance), flèches de vent. État : close, wake, run, apart, line, wind, heli, mood. »

# L02 · `habillage.js` — journal du décorateur

2026-10-20. Fichier : `episodes/L02-poste-haute-tension/src/habillage.js` (deux fabriques, `dressPoste()` et `dressLigne()`). Build passe. **26 images lues** (planches `scratchpad/L02/hab-avant.jpg` 8, `hab-apres1.jpg` 10, `hab-apres2.jpg` 4 avec en-tête, `hab-apres3.jpg` 4 avec en-tête). Essais tirés par `scratchpad/L02/hab-mk.cjs` (état de repos complet sous chaque entrée, POSTE ou LIGNE).

## Les accroches (quatre lignes, toutes dans `world.js`)
- en tête : `import { dressPoste, dressLigne } from "./habillage.js"; // the decorator: the life of the places`
- `buildWorld`, juste après `places[SET.POSTE].add(corridor.group);` : `const dress = { poste: dressPoste(), ligne: dressLigne() }; places[SET.POSTE].add(dress.poste.group); places[SET.LIGNE].add(dress.ligne.group);`
- `apply`, POSTE, juste après `corridor.set(…)` : `dress.poste.update({ amount: S.poste }, time, px);`
- `apply`, LIGNE, juste après `ligne.set(…)` : `dress.ligne.update({ amount: S.span, day: S.day, crew: S.v87 - 1 }, time, px);`

Aucun nombre de l'état en plus. Rien dans `poste.js`, `ligne.js`, `model.js`.

## Ce qui est posé, et pourquoi
**Le poste la nuit** (suit `poste`) :
- **Quatre mâts d'éclairage de 15 m** sur la clôture du fond et le côté +x (`MASTS`) : un fût de verre doublé d'un trait de 1,8 px (le verre seul ne se lit pas à 150 m), une traverse, deux lampes (`glow` 380 cm, k 1,2) tournées vers les travées, et leur flaque sur le gravier (`makePool`, 30 × 42 m, k 0,085). Un poste est éclairé la nuit ; les plans larges y gagnent une profondeur et des points de lumière au fond.
- **Le pays au-delà de la clôture** : quatre villages (`nightLights`, 40 à 110 lumières chacun, 1,6 à 2,5 km) et 18 fermes (`glow` « far »), du côté où regardent les caméras (+x / −z), **jamais vers −x** (le couloir et le défaut lointain y brûlent : rien ne doit lui ressembler). « Le carrefour avant de descendre vers les villes ».
**La ligne dans la campagne** (suit `span`) :
- **Les éoliennes du Nord** (juillet 2025, Dunkerque–Arras), deux parcs de 5 et 4 machines à 2,3–3 km côté −z (le côté du crépuscule), en traits seulement, pales fixes ; elles suivent `day` (absentes la nuit et en Virginie 1987).
- **Villages et fermes au loin** (quatre villages, 26 fermes), les deux nuits et le crépuscule.
- **Virginie 1987 : le camion de l'équipe** (verre, cabine, caisse, six roues), derrière la tour et à côté (`TRUCK` [41 850, 0, −840], le nez vers −x), phares allumés, un projecteur de travail sur le toit, deux flaques au sol (devant lui, et au pied de la tour). Il suit l'équipe : `crew` = `v87` − 1 (là de 1 → 2 seulement : à 15,8 s et 513 s, sans l'équipe, il n'est pas là).

## Ce qui a été retiré, et pourquoi
- Une rangée de peupliers derrière la ligne (l'échelle : 25 m contre 60 m) : des fuseaux de verre qui se lisaient comme des bulles en plan de nuit (`pair`). Sortie.
- Un mât à [6 000, −5 000] : sur le hook (az −38), son fût tombait au milieu de l'image et sa flaque derrière la tête du détecteur. Déplacé à [6 000, −3 000] ; les mâts sont passés de 20 à 15 m pour que leurs lampes restent sous l'en-tête du hook.
- Écartés à l'étude (jamais vus par un plan du film, d'après `docs/L02-actes.md`) : le bâtiment de commande et le véhicule d'intervention près du portail (aucun plan ne regarde le portail ; placés au fond, ils tombaient derrière la tête du détecteur ou derrière ton disjoncteur), les panneaux « danger de mort » (du texte), les poussières d'humidité (`motes` : sous le pixel dans tous les plans larges).

## Vu sur planche
- `posteWide` : points de lampes au fond, flaques douces sur le gravier lointain ; une lampe à y ≈ 195 (juste sous l'en-tête de 170).
- `hook1` (az −38) : deux paires de lampes en haut, loin, à 630 px et plus à droite de la tête ; un fût fin derrière un isolateur, aucun derrière la tête.
- `pylon` : lampes et villages en points derrière le poste.
- `lineWide`, `heliWide` (crépuscule) : la rangée d'éoliennes sur la bande chaude, à travers les faisceaux — le plan le plus gagné.
- `v87` (équipe) : le camion se lit, phares et projecteur allumés ; `v87tower` : caché par la tour.
- `bay`, `corridor defect`, `pair` : rien ou presque (voulu : rien derrière ton disjoncteur, rien vers le défaut).

## Pas au niveau, dit franchement
- Le poste reste peu habillé (deux touches) : c'est un lieu fermé, et les plans qui le regardent regardent tous la même direction que la première image — tout ce qui s'y pose de grand finit derrière la tête du détecteur.
- Le camion de 1987 est une boîte de verre correcte, sans détail (pas de flèche ni de nacelle).
- Les éoliennes sont nombreuses et régulières sur `lineWide` ; à juger en mouvement.
- Jamais vus : `ident`, `gantry`, la plongée `vertigo` et le plan du défaut au lieu LIGNE.

## À proposer (touche au système ou à l'histoire, pas fait)
- Un projecteur de chantier sur trépied au pied de ta travée, qui éclairerait ta descente : c'est l'éclairage du sujet.
- « Une branche trop proche » (434,3 s) : un arbre de verre sous la phase basse de la voisine, au pylône du défaut (LIGNE, x ≈ 200 000, z < 0), si le plan c6 se tient là — à décider par celui qui monte le c6.

## À changer ailleurs
Rien.

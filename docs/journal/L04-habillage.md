# L04 — l'habillage (le décorateur)

Agent décorateur, 23/10. Fichier : `episodes/L04-porte-avions/src/habillage.js` (deux exports : `dressMer()`, de niveau, à côté de `sky` ; `dressPont()`, dans le repère du navire, il gîte avec lui). **Rien n'est encore branché dans `world.js`** (l'architecte y travaillait) : les quatre lignes sont sous « À poser ». Mes essais : une copie de l'épisode dans le dossier temporaire (`scratchpad/L04/hab/ep`, `world.js` de la copie patché par `sync.mjs`), planches avant / après (`SD_KIT='{"nodress":1}'`) — jamais `renders/`.

## Ce qui est posé, et pourquoi (tout en `ink`, aux rayons X, rien de plein)

**LA MER** (`dressMer`)
- **Le groupe aéronaval** : le Charles de Gaulle ne navigue jamais seul. Une frégate (profil type FREMM, 142 m) sur l'avant tribord (≈ 3,1 km, gisement 50°) et le pétrolier-ravitailleur (194 m, ses portiques de ravitaillement) sur l'arrière tribord (≈ 3 km, 140°). Le jour : une silhouette fine (contour 1,9 px, remplissage très pâle) posée sur l'horizon ; la nuit : quatre ou cinq feux fixes (≥ 2,6 px), sans couleur. Immobiles dans le repère de niveau (ils tiennent leur poste), effacés au-delà de 4,5 km de l'objectif (le « trait sur la mer » à 2,6 km reste seul) et dans la brume. Placés hors des trois candidates de la première image (hook3 regarde l'avant, hook1 le travers).

**LE PONT** (`dressPont`)
- **Les avions garés sont saisis** : des cales devant et derrière chaque roue, quatre chaînes du train principal aux crochets du pont et deux du train avant (traits 1,8 px qui s'effacent de 17 à 32 m) ; le deuxième avion garé (`PARK[1]`) est en cours de plein : un tuyau part du poste de bord.
- **Les tracteurs et les extincteurs** : un tracteur au pied de l'îlot, un autre près du parking arrière, deux extincteurs sur roues. Jamais sur une catapulte, jamais sur la piste oblique, rien devant ton nez. (Un tracteur attelé au Rafale garé à l'avant a été retiré : dans hook3, il se posait à côté de ta dérive.)
- **Les coursives et leurs filets** le long des bords (bâbord et tribord ; pas à l'étrave — la mer où l'on tombe —, pas sous l'îlot, pas devant les deux ascenseurs, pas aux plateformes du miroir et de l'officier), et **le filet sous la plateforme de l'officier d'appontage** (celui où il saute), qui suit `lso`. Une maille losange de 30 cm (cordes ≥ 1,8 px) qui part avant que ses mailles passent sous 14 px ; de loin, il reste le garde-corps et un montant tous les 3 m (qui partent eux aussi avant 16 px). Les filets du pont s'effacent à moins de 9 à 18 m de l'objectif (une caméra basse au bord du pont n'a pas de filet dans la figure), celui de l'officier à moins de 2,2 à 4,2 m.
- **La vapeur qui traîne** sur la fente de la catapulte avant (elle fuit entre deux lancements, le vent sur le pont la couche vers l'arrière) : 44 volutes basses, douces, étirées, nées entre 21 et 69 m devant la navette, qui reculent de 6,2 m au plus et meurent avant ton nez ; parties dès qu'une volute ferait moins de 9 px, au-delà de 90 m, sous le pont de verre (`under`), catapulte ouverte (`explode`), dans la coupe.

**LE HANGAR** (dans `dressPont`, ordre 43 : avant les coques)
- Un atelier qui dort : un réacteur de rechange sur son berceau dans le trou entre deux avions à bâbord (au milieu du cadre de `VIEW.hangar`), un groupe de parc à bâbord avant, un tracteur à bâbord arrière, deux servantes d'outils au coin arrière tribord. Il se montre comme le hangar de `navire.js` (`hangar`, `under`, `cutaway`, `curtain`, `lift`, `detectors`).

## Ce que chaque touche suit

`amount` = `ship` (pont, hangar) ou `sea` (la mer) ; `night` (le pont s'éteint à 30 %, les filets à 35 %, la vapeur à 40 % ; les escorteurs passent de la silhouette aux feux) ; `mist` (escorteurs) ; `parked` (cales et chaînes, à 0,6 pleines) ; `lso` (son filet) ; `under`, `explode`, `cutaway`, `wind` (la vapeur) ; `hangar`, `curtain`, `lift`, `detectors`, `under`, `cutaway` (l'atelier) ; `cutaway` > 0,5 retire aussi ce qui est devant `CUT.z`. Le temps HyperFrames seul (la vapeur) ; l'aléatoire est semé (`rng(404)`). Aucune lueur ne clignote, rien ne tourne. `SD_KIT='{"nodress":1}'` montre les décors nus.

## Où ça se voit

- **Le pont vivant** (95 → 103, 75 → 83, 108 → 112, 321 → 335, 361 → 368) : tracteurs, extincteurs, cales et chaînes, filets de bord, la frégate et le ravitailleur sur l'horizon.
- **La catapulte** (`catLong`, 6 → 11 ; au ras de la fente, 41 → 46 ; 143 → 150) : la vapeur basse sur la fente — elle se devine, elle ne se lit pas comme un sujet.
- **Le hangar** (270 → 279, 368 → 376) : le réacteur sur son berceau.
- **L'officier d'appontage** (430 → 476) : son filet sous la plateforme, en losanges.
- **La nuit** : les feux des escorteurs quand l'horizon tribord est dans le cadre.
- **La première image (hook3) est inchangée** à 270 px (vérifié avant / après) ; hook1 aussi.

## À poser (dans `episodes/L04-porte-avions/src/world.js`, l'état du 23/10 vers 12 h)

1. Sous `import { buildBord } from "./bord.js";` :
   ```js
   import { dressMer, dressPont } from "./habillage.js"; // the decorator: the life of the places
   ```
2. Sous `onShip.add(navire.ship);` (dans `buildWorld`) :
   ```js
   const dress = { mer: dressMer(), pont: dressPont() }; places[SET.PONT].add(dress.mer.group); onShip.add(dress.pont.group);
   ```
3. Dans `apply`, branche `if (set === SET.PONT)`, juste après l'appel `navire.set(…)` (avant `/* your aircraft, the next one */`) :
   ```js
   dress.mer.update({ amount: S.sea, night, mist: S.mist }, time, px);
   ```
4. Juste en dessous :
   ```js
   dress.pont.update({ amount: S.ship, night, parked: S.parked, lso: S.lso, under: S.under, explode: S.explode, cutaway: S.cutaway, wind: S.wind, hangar: S.hangar, curtain: S.curtain, lift: S.lift, detectors: S.detectors }, time, px);
   ```
(Sur l'établi, le lieu PONT est caché : rien à appeler.) Vérifié branché ainsi sur la copie : `npm run check` passe (0 erreur, contraste 37/37) ; `npm run check -- L04` et `npm run build -- L04` passent sur l'épisode tel qu'il est.

## Écarté

- **Les antennes fouets de l'îlot** : des tiges de quelques centimètres, sous le pixel dès 30 m, longées par la caméra (îlot = treillis à ne pas longer) ; l'îlot de hook1 charge déjà le haut droit.
- **Les embruns à l'étrave** : la vague d'étrave de `navire.js` porte déjà la vitesse ; des points d'écume grouilleraient de loin.
- **La chaleur au-dessus des tuyères** : `bord.js` la dessine déjà ; une déformation de l'image n'existe pas dans le plateau.
- Les panneaux du pont (du texte : interdit) ; les feux de navigation colorés des escorteurs (rouge / vert hors de nos trois couleurs).

## Un cran en dessous

- La vapeur est très discrète : elle se lit de près (au ras de la fente), à peine sur `catLong` ; dans hook3, rien (voulu). Si un chapitre la veut plus franche, monter `uColor` de `steamMat` (0,22).
- Les filets du pont, vus du large (`shipWide`), ne sont presque plus rien : une coursive se devine de près, pas de loin.
- Les escorteurs sont des profils plats : vus par l'étrave, ils deviennent un trait. Aucun plan ne les voit ainsi.
- Les feux de nuit des escorteurs n'ont pas été vus sur une planche (aucune pose de nuit essayée ne regardait l'horizon tribord).
- L'arc pâle en bas de `catLong` n'est pas de l'habillage (il est là sans lui : `navire.js`, la lumière sur l'eau ou la vague).

## À changer ailleurs

Rien (seulement les quatre lignes ci-dessus).

## Images lues : 10 (planches 8 + 8, 4, 6, 3, 3 recadrées, 8 + 8 côte à côte, 4 en grand, 3) — sous la limite de 25.

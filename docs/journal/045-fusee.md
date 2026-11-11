# 045 · fusee.js — journal (décor, 08/11)

Consigne : Ariane 5 de verre, matière qui rime avec `rocketMat` de 044 (`rue.js`), arêtes qui ne deviennent pas des bandes blanches de près, image 0 qui bouge par son sujet, jets qui s'éteignent net, pas de particules sautées au modulo. Planches : `.cache/planches/045/fusee/` (p1 à p6, essais `e1`–`e6`, `mk.mjs` calcule les cibles depuis une copie de `plan.js`).

## Diagnostic des « bandes blanches »
Sur le bouchon, `cyl(r, h, 4, 48)` est FERMÉ et chanfreiné : vus de la case, fonds et chanfreins sont de chant → le terme `edge` du verre (`smoothstep(0.6, 0.97, g)`) les allume en bandes pleines. Et même sans fond, ce terme est une bande dont la largeur suit la taille à l'écran : à 7 m, la coque devenait un néon (p3).
Remède, dans `nearGlass()` (le verre du kit, shader patché avant `asShell`) :
- coque en `LatheGeometry` OUVERTE (aucun fond, aucun chanfrein) ;
- le liseré devient une ligne de **largeur constante en pixels** (`fwidth(facing)`), le halo large et le reflet du softbox baissent quand la pièce grossit à l'écran (`sizeK` : 0,14 sous 15 m → 1 au-delà de 160 m) ;
- fondu de près par la profondeur de vue (80 → 420 cm), et le calque `hold` jette ces fragments (le fond reste visible) ;
- traits : `LineMaterial` patché (`onBeforeCompile`, fondu 50 → 240 cm) ; charges : 30 → 160 cm.
Vérifié p4–p6 : jonction à 6 m, case à 2–3 m, plongée à 60 cm : plus aucune bande. Au plan large, le liseré net en pixels lit mieux qu'avant.

## Construit
- **Coque en 18 morceaux** (chacun son verre, ses traits, ses pleins) : étage bas et haut (hors des 100° autour de la charge), **10 volets** de part et d'autre de la ligne de charge (5 rangs × 2), la case, la coiffe, chaque booster en deux. Cerclages aux limites des rangs, lisses, réservoirs (fond LH2, fond commun, dôme LOX), cadre de poussée, étage supérieur, couture des demi-coiffes : l'étage n'est jamais vide.
- **Pleins** : 3 tuyères (toujours, avec la fusée) ; avec `inside` : vérins (qui suivent le braquage), case (étagère ouverte à l'endroit de la chaîne, 3 boîtiers sombres, **2 SRI clairs** avec leur plaque d'état), bielles avant/arrière cassées en deux moitiés, prises des liaisons.
- **Liaisons** : un faisceau calculé dans le shader entre ses deux prises (mou → tendu quand le booster s'écarte), qui se rompt en deux bouts qui se rétractent, bouts rougis, étincelles aux bouts arrachés.
- **Charges** : tubes à largeur minimale en pixels ; lumière qui court (`charge`), front blanc-veille (`blast`), **une lumière qui a un endroit** court avec la tête et avec le front sur chaque ligne.
- **Feu** : aux jonctions (cœur + gaine + halo, langues de feu balayées par le vent relatif, braises en traînées, étincelles) ; à l'ouverture, une boule qui naît à la case et descend avec la fermeture éclair (cœur blanc → signal → fumée), fumée qui reste dans le ciel ; chaque débris a sa flamme et sa traînée de fumée le long de sa propre chute, puis couve au sol.
- **Traînée** : tube calculé dans le shader sur la parabole de `flightAt`, qui sort des tuyères dans l'axe et se recourbe sur la route ; rougie près de la fusée par le feu.
- **Angle** : axe, route en tirets qui se dessinent, arc veille.
- Aucune allocation dans `update` (temporaires préalloués, tampons de segments réécrits en place) ; aucun `Math.random` (`rng`).

## Les nombres de l'état, chez moi
`rocket` coque, traits, tuyères, jets · `inside` case, SRI, vérins, bielles, prises, faisceau · `climb` place (même calcul que `rocketAt`) et longueur de traînée · `incid` bascule · `gimbal` tuyères ±7°, vérins suivent · `guide` SRI : >0,5 plaque et arêtes veille, <0,5 plaque signal sourde (bascule par le noir) · `burn` jets (0 = éteints net ; boosters ×(1−0,65·débris), Vulcain s'éteint avec `rip`) · `trail` traînée · `tear` 0→0,45 les nez s'écartent (5,5° à 0,25, 14° à 0,45, léger battement), 0,45→1 arrachés : basculent de 75°, roulent, s'écartent et tombent · `links` 1 entier → 0 rompu · `pulse` signal veille de la prise +z à la case · `charge` 0,25 trait sourd → 1 tout allumé · `blast` front blanc · `rip` volets rang par rang depuis la case (100° + 110 cm), bords coupés allumés · `debris` 0→0,1 les morceaux se séparent, →1 au sol à l'est (FALL) · `arc` axe, route, arc.
**Les feux sont pilotés par des écarts** : jonctions `tear − 1,5·debris`, boule `rip − debris`, éclair de la case éteint dès que `rip` commence → la reconstitution (tout revient à 0 ensemble) ne rallume rien ; les débris remontent en ravalant leur fumée.

## Poses qui cadrent (essayées)
- `VIEW.hook`, `VIEW.side`, `VIEW.prevu`, `VIEW.hull`, `VIEW.nozzles` (état incid 6, gimbal 1, burn 1, inside 1), `VIEW.whole` (arc 1), `VIEW.tearView` (tear 0,7), `VIEW.rain` (debris 0,5–0,8), `VIEW.padOut` (ONPAD) : bons tels quels.
- **Jonction** : celle de l'architecte (az −14) regarde à travers le booster. Essayée et lisible (étage à gauche, faisceau tendu et rompu au milieu, booster à droite) :
  `junction: { ...P, ...CLOSE, tx: LINK_HOOK[0], ty: LINK_HOOK[1], tz: LINK_HOOK[2] + 60, d: 1300, az: -80, el: 4, fov: 36 }` (az −80 regarde dans la fente entre étage et booster).
- **Case** : à `VIEW.bay` (d 300), les deux SRI (az −80 et −5, ±127 cm de la cible) sont **hors du cadre** ; il faut ≈ 250 cm de large. Proposé, NON vérifié à l'image : cible `at(1, 0, ringPoint(-42, 120, 3135))`, d 850.

## Pas encore au niveau (franchement)
- **La fermeture éclair** (`rip`) se lit mal à 7–10 m : un volet qui dépasse, le reste caché par la boule de feu. Dernière retouche (volets à 100°, bords coupés 4 px veille ×1,6, feu retardé à `rip` 0,3–0,85) **non regardée** (budget d'images dépassé).
- **La boule de feu** reste une nuée douce (cœur blanc, signal, fumée) : pas encore « studio ». Une vraie structure (filaments, braises qui partent) serait le prochain pas.
- **SRI** : plaques d'état jamais vues à l'image (hors cadre à `VIEW.bay`).
- **Plongée `VIEW.det`** : plus de bandes, mais jugée sur les bouchons de `sauvegarde.js` (barres grises qui remplissent le cadre).
- **Image 0** : la fusée fait ≈ 45 % de la largeur à `POSE0` (22 m de recul, el −44) ; la bouger se décide sur la planche des candidates.
- **Images lues : 44** (p1 8, p2 8, p3 8, p4 4, p5 8, p6 8) — **au-delà des 30**. Planches de 8 tirées trop tôt pour des questions qu'une planche de 4 réglait.

## À changer ailleurs
- `world.js` → `VIEW.junction` : `junction: { ...P, ...CLOSE, tx: LINK_HOOK[0], ty: LINK_HOOK[1], tz: LINK_HOOK[2] + 60, d: 1300, az: -80, el: 4, fov: 36 },`
- `world.js` → `VIEW.bay` (à vérifier sur planche) : `const BAY_ZERO = at(1, 0, ringPoint(-42, 120, 3135));` et `bay: { ...P, ...CLOSE, tx: BAY_ZERO[0], ty: BAY_ZERO[1], tz: BAY_ZERO[2], d: 850, az: -18, el: 8, fov: 36 },`
- Actes (`acte3.js`, `fin.js`) : la chaîne (`sauvegarde.js`, posée sur `A.seat`) ne part pas avec les débris → `inside: 0` dès `blast`. Dans la reconstitution, ramener `rip` et `debris` ensemble (aucun feu ne se rallume).
- Kit (proposition, pas urgent) : `glass(…, { near, lip: "px" })` — le fondu de près et le liseré en pixels de `nearGlass()` servent à toute coque vue de près.

## Pour `docs/catalogue.md`
`045/src/fusee.js` — Ariane 5 de verre (lanceur lourd, deux boosters, taille réelle) dont la coque en morceaux s'arrache, s'ouvre en fermeture éclair et retombe en débris, rejouable à l'envers ; verre qui s'efface de près et liseré en pixels (`nearGlass`, `nearLine`), traînée sur une parabole, feux pilotés par écarts d'état. Nombres : rocket, inside, climb, incid, gimbal, guide, burn, trail, tear, links, pulse, charge, blast, rip, debris, arc.

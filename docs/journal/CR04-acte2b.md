# CR04 · Lac-Mégantic — journal de `acte2b.js` (t3 → t5, `tot3` 53,02 → `tozero` 76,46)

## Monté (un plan par ligne)
- **A** `tot3` → `tot4` : coupe sur `VIEW.cheminee`, un seul `path` qui se rapproche de la cheminée ; la fumée épaissit (0,4 → 1) ; `chip-911` de « appelle » à `tot4`−0,2 ; flammes SUR « feu » (punch) ; le capot se lève sur « Son moteur » ; moteur + turbo rouges SUR « mal », cercle `f2b-turbo` sur `lead.A.turbo` jusqu'à `tot4`.
- **C** `tot4` → `t4:feu`−0,3 : coupe, coupe-circuit **en plan rapproché** (`lookFrom(L([15, 9.5, 27]), L([6, 6.6, 7.9]))`, `ok` 0 pour que le réservoir vert ne vole pas le cadre) ; SUR « coupent » le capot s'ouvre et le levier bascule (aucune main) ; `engine` 1 → 0 sur 1,5 s (capot fermé : seul le frémissement de la caisse le lit).
- **D** → `t4:Mais`−0,12 : coupe sur la cheminée (plus près que A) ; SUR « s'éteint » `fire` → 0, la fumée retombe.
- **E** → `tot5` : coupe, **compresseur en gros plan** (capot ouvert, vu de derrière la cabine, `lookFrom(L([-6, 23, 22]), L([-22, 11, 0]))`, dof) : vert, il tourne (`engine` 0,7 constant) ; rouge SUR « compresseur » (punch) ; immobile SUR « s'arrête » (`now`, voir « À changer ailleurs »), `ok` → 0.
- **F** `tot5` → `reste5`−0,12 : un `path` sous le châssis, de l'avant gauche (la roue, la chaîne, le cylindre) vers le cylindre en gros plan ; SUR « fuit » cylindre et raccords rouges, bouffées ; `#mano` de « environ » à `reste5`−0,12 (60 → 57).
- **G** `reste5`−0,12 → `onzequarante` : coupe (le cylindre → toute la tête, même flanc) : la tête sombre, sans fumée, une bouffée ; lente dérive.
- **H** `onzequarante` → `t5:train`−0,24 : coupe sur le saut d'horloge, la route 161 en coordonnées monde (`W(x, h, z)`), les phares partent vers l'amont (`road` 0 → 1 de +0,42 sur 2 s), la visée les suit ; `psi` → 31.
- **I** → `tozero` : coupe `VIEW.seul`, punch « seul ».

## Rendu à l'acte suivant
`engine` 0, `cutoff` 1, `psi` 30, `brakes` 7, `leak` 0,4, `road` 1, `culprit` 0, `cutaway` 0, `mano` 0 ; pose `VIEW.seul` à peine resserrée (az +4, d × 0,95). L'acte 2c coupe et repose tout.

## Planches (32 images lues : 4 planches de 8 — six au-delà du budget de 26, dit franchement)
- p1 : coupe-circuit perdu à droite, le réservoir vert domine ; compresseur caché derrière le volant du frein à main ; raccords illisibles.
- p2 : coupe-circuit lisible (capot ouvert, levier baissé) ; compresseur repris de derrière la cabine ; F repris depuis l'avant gauche (bouffées visibles, cylindre rouge).
- p3 : compresseur vert → rouge, net ; `#mano` sur le cylindre rouge, lisible ; le recul de « reste coupé » passait en 1,3 s au ras de la chaîne (flou) → remplacé par une coupe ; les voitures de H étaient hors champ (les poses `L(…)` sont décalées de 51 en x et la route part de x monde ≈ 0).
- p4 : G lisible (la tête sombre, « 5017 », une bouffée) ; H : deux voitures, phares allumés, qui s'en vont, lisibles à 270 px.

## Un cran en dessous (repères)
- **I `seul5`** (75,22 → 76,46) : `VIEW.seul` met le train en trait fin à l'horizon, la ville n'y est pas : à 270 px, « seul » se lit à peine. Non re-tiré (budget dépassé).
- **C `tot4`** : un premier plan flou (passerelle, hors du foyer `fs` 24) traverse la bande des sous-titres ; le levier reste net.
- **A `tot3`** : la fumée monte jusque sous l'en-tête.

## Sons (pour le monteur-son)
- 56,10 souffle après « feu » (≈ 56,45) : les flammes qui s'allument (souffle de feu).
- 58,98 « réparé » → le capot qui se lève vers 57,9 – 58,7 (métal).
- 61,58 → souffle 62,0 : le levier du coupe-circuit qui bascule (clac).
- 64,18 → souffle 64,5 : le feu qui s'éteint.
- 66,74 « s'arrête » → souffle 67,1 : le compresseur qui s'arrête net.
- 68,90 « fuit » → souffle 69,15 : les bouffées d'air (pschit).
- 72,78 (coupe + horloge 00:44) ; 73,6 – 75,2 : les voitures qui partent.

## À changer ailleurs
- `episodes/CR04-lac-megantic/src/locomotive.js`, `update` : `L.fly.rotation.z = -time * 2 * PI * 2.2 * e;` tourne à `2,2 × e` tr/s seulement quand `engine` est constant : toute rampe de `engine` pendant qu'on voit le compresseur le fait tournoyer (dθ/dt ∝ `time` × de/dt, ≈ 66 s × …). Ici évité (`engine` constant à l'image, arrêt sur une image). **acte1 (« Coupe le moteur », 17,42, le compresseur qui ralentit)** est touché s'il rampe `engine` sur `VIEW.coupe`. Remède dans le décor : une phase qui ne dépend pas de `time × e`, par exemple un nombre d'état `spin` (tours du volant d'inertie) tweené par les actes, ou `rotation.z = -2 * PI * 2.2 * time` multiplié par `e > 0.5 ? 1 : 0` (arrêt net).

## Retouche du 14/11/2026
- **C coupe-circuit illisible (61,5–63)** → le plan s'ouvre au `tot4` sur toute la tête de trois quarts avant (cabine, volant de frein, feu sur la cheminée : `lookFrom(L([-95, 26, 70]), L([-6, 9, 5]))`), puis UNE poussée sur la même ligne jusqu'au coupe-circuit (`C1`, à `coupent`−0,2) ; la lumière se resserre sur lui (`fs` 34 → 12) ; cercle `feutre` « f2b-cutoff » de `coupent`−0,35 à `cutC`−0,2. Vérifié à 59,62 · 60,4 · 61,0 · 61,5 · 61,75 · 62,4 · 63,1 : la loco se reconnaît, le capot s'ouvre et le levier bascule dans le cercle.
- **I « seul » (75,22 → 76,46)** → `VIEW.seul` remplacé par une pose propre (`lookFrom(L([-230, 40, -150]), L([-45, 10, 0]))`, halo `fs` 60 sur la tête) : la locomotive de tête lisible à gauche du centre, la nuit vide devant elle et au-dessus ; lente approche (`d` × 0,93), plus de rotation. Vérifié à 75,25 et 76,4. La sortie ne raccorde plus sur `VIEW.seul`, mais acte2c coupe et repose tout au `tozero`.
- **`tot4` premier plan flou dans les sous-titres** → disparu avec la nouvelle pose (plus de bord de passerelle au premier plan). Vérifié à 59,57 · 59,6 · 59,62.
- Effet de bord corrigé : les deux cercles (`f2b-turbo`, `f2b-cutoff`) finissent 0,2 s avant leur coupe (leur fondu dure 0,15 s : il débordait dans le plan suivant). Vérifié à 59,57 / 59,6 et 63,79 / 63,83.
- Reste à voir sur le brouillon : la poussée C (≈ 2 s, d ≈ 120 → 37) en mouvement réel ; en D, un volant de frein vert au premier plan, non touché (hors liste).

## À changer ailleurs (retouche)
- `episodes/CR04-lac-megantic/src/locomotive.js`, ligne `B.add(box(1.9, 1.4, 0.45, 0.15), M.mid, { p: [CUT[0], CUT[1] - 0.05, 7.82] });` : le coupe-circuit est dans la même matière que la caisse ; un levier et un couvercle en matière claire (`ink`) le détacheraient sans cercle.

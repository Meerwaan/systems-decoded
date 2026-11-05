# CR01 — centrale.js (décor, 05/11)

DA V3 « le noir chaud » : argile satinée (`clay`), arêtes claires (`clayEdges`), la vanne en `alarm()`, la sécurité en `safe()` (vert quand `ok`), les flux en têtes de lumière papier (vertes quand `ok`). Fichier : `episodes/CR01-tchernobyl/src/centrale.js` (API du bouchon gardée : `buildCentrale()` → `{ group, A, haloR: 22, update(S, time, px) }`).

## Ce qui est construit (repère local, dessus de table y = 4, ouvert vers −x)
- **Table** argile sombre 380 × 260.
- **Hall du réacteur** (x −175 … −110) en maison de poupée ouverte sur −x **et** +z : mur du fond, mur +x, corniches ; dedans le fût du cœur, la dalle supérieure claire et ses ≈ 120 têtes de canaux. **Annexe basse** (x −110 … −85, h 30) et son **ballon séparateur** couché sur le toit. L'annexe est basse exprès : une annexe de 80 cachait les pompes depuis az −50.
- **Boucle de circulation** (`flow`) : montées dalle → ballon (4), descentes ballon → pompes (4), refoulement pompes → annexe (4). Têtes papier qui courent.
- **4 pompes** en rangée (volute, bride, moteur à ailettes, chapeau).
- **Ligne de vapeur** ballon → corps HP (têtes tant que `spin` ≈ 1 : l'essai ferme la vapeur, le groupe ralentit sur sa lancée).
- **Groupe turbo-alternateur** sur son socle : corps HP fermé ; **corps BP ouvert** (moitié basse seule) : 6 couronnes de 24 aubes en double flux, et au centre **un tambour en damier 8 × 3** (cible d'équilibrage) qui rend la vitesse lisible à 270 px ; volant en 4 secteurs clair / sombre ; alternateur (bandes claires), excitatrice. Rotation intégrée (`W0` = 7 rad/s à `spin` 1 : le damier avance de 0,15 période par image).
- **Tableau électrique** (x −12, z 52). **`feed`** : alternateur → tableau → barre → moteurs des 4 pompes (têtes plus lentes et plus faibles quand `spin` baisse). **Câble des diesels** → tableau (s'allume quand `diesel` > 0,85).
- **3 diesels** : châssis fixe ; bloc (`safe`), culasse, alternateur, radiateur et **ventilateur** face −x (tourne avec `diesel`), cheminée, **fumée d'argile** (10 bouffées facettées par cheminée, une colonne), **voyant** papier (vert si `ok`) ; ils **tremblent** au démarrage.
- **Refroidissement de secours** : 2 réservoirs (`safe`), tuyauterie (`safe`) jusqu'à l'annexe, **la vanne** (corps, brides, chapeau, volant) en `alarm()` : rouge avec `fault`, verte avec `ok` tant qu'elle n'est pas en défaut.
- **Réseau** (`mains`) : barre alternateur → transformateur (ailettes, 3 traversées) → 2 conducteurs, chacun UN tube jusqu'à la nuit (têtes longues et douces, période 70 cm : courtes, elles faisaient « guirlande ») → 3 pylônes en treillis → la ligne quitte la table et s'enfonce dans le noir (fondu sur les 150 derniers cm).

## L'état, chez moi
| nombre | effet |
| --- | --- |
| `spin` | angle du rotor intégré (`W0·spin`) ; vapeur allumée seulement à `spin` > 0,82 ; vitesse et force de `feed` |
| `flow` | vitesse des têtes de la boucle (`V0·flow`), force 0,35 + 0,8·flow |
| `diesel` | tremblement (dès 0), ventilateur, fumée (taille, cadence), voyant (0,12 → 2,3), câble vers le tableau (> 0,85) |
| `mains` | force des têtes alternateur → transfo → ligne |
| `feed` | force des têtes alternateur → pompes (× 0,35 + 0,65·spin) |
| `fault` | la vanne en rouge (`setAlarm`) ; halo rouge du monde sous `A.fault` (r 22) |
| `ok` | lu directement : têtes et voyants papier → vert ; `safe()` (diesels, réservoirs, tuyaux du secours) et la vanne non fautive en vert via `setOk` du monde |

Intégration : les phases s'intègrent entre deux appels (`dt` < 0,25 s) ; au-delà (un saut, la première image d'un tronçon de rendu), elles repartent de `time × vitesse courante` — déterministe, mais un rendu découpé en tronçons pourrait montrer un saut de phase du damier à une frontière de tronçon après un ralentissement. À surveiller dans `qa` sur 72–76 s.

## Poses qui cadrent (vérifiées sur planche, en-tête et zones dessinés)
- table entière : `[-15, 25, 0]`, d 1150, az −46, el 32, shift 170, side 80 (sous l'en-tête, hors colonne des boutons ; la ligne et les pylônes sous l'horloge).
- turbine : `[72, 30, -10]`, d 330, az −40, **el 50**, shift 30 (à el 14–34, le pylône et ses fils montaient derrière l'horloge ; à 50 le damier et les aubes se lisent de haut).
- turbine serrée (« ralentit ») : `[66, 30, -10]`, d 240, az −44, el 46, shift 20, dof.
- diesels : `[80, 24, 95]`, d 330, az −60, el 22, shift −40 (la fumée reste sous l'étiquette `chip-diesel`, qui se lit).
- pompes + `feed` : `[-35, 16, 0]`, d 300, az −30, el 34, shift 110 (depuis az −50 à −66, le hall et l'annexe cachent les pompes).
- vanne : `[-75, 20, 95]`, d 230, az −28, el 22, shift 130 (depuis az −70, les réservoirs passent devant la vanne).
- réseau : `[60, 40, -125]`, d 360, az −100, el 8, shift 80 (le long de la ligne, qui vient vers toi et part dans la nuit).

## À changer ailleurs
Dans `episodes/CR01-tchernobyl/src/world.js`, `VIEW`, remplacer les six lignes CENTRALE par :
```js
  centrale: pose("centrale", [-15, 25, 0], { d: 1150, az: -46, el: 32, shift: 170, side: 80 }),
  turbine: pose("centrale", [72, 30, -10], { d: 330, az: -40, el: 50, shift: 30, ...CLOSE }),
  turbineClose: pose("centrale", [66, 30, -10], { d: 240, az: -44, el: 46, shift: 20, ...CLOSE }),
  diesels: pose("centrale", [80, 24, 95], { d: 330, az: -60, el: 22, shift: -40, ...CLOSE }),
  pumps: pose("centrale", [-35, 16, 0], { d: 300, az: -30, el: 34, shift: 110, ...CLOSE }),
  eccs: pose("centrale", [-75, 20, 95], { d: 230, az: -28, el: 22, shift: 130, ...CLOSE }),
  mains: pose("centrale", [60, 40, -125], { d: 360, az: -100, el: 8, shift: 80 }),
```
(`turbineClose` est nouvelle ; pompes, vanne et réseau sortent de la fourchette az −50…−80 : c'est voulu, voir ci-dessus.)

## Reste faible (dit franchement)
- La rotation ne se juge pas sur une planche fixe : damier et aubes à vérifier en mouvement (brouillon). Si `qa` voit un stroboscope sur les aubes (24 par couronne, ≈ 13°/image à `spin` 1), passer `W0` à 5,5 ou les couronnes à 16 aubes.
- La fumée est en argile facettée (cohérente avec la maquette) ; elle peut se lire « cailloux » en plein écran.
- Vue de table : les têtes de lumière sont de petits points à cette distance ; la vanne rouge y est petite (le cercle `feutre` la désigne).
- Pose réseau : plan correct, pas spectaculaire.

## Images lues : 30 / 30
p1 (8), p2 (8), p3 (6), p4a (3), p4b (1), p5 (2), p6 (2). Planches : `.cache/planches/CR01/centrale/`.

## Catalogue
`CR01-tchernobyl/src/centrale.js` — une centrale thermique en maquette d'argile (V3 noir chaud) : hall ouvert, boucle de circulation, pompes, turbo-alternateur au corps BP ouvert (damier de vitesse), diesels (fumée, voyant, ventilateur), refroidissement de secours et sa vanne `alarm`, transfo et ligne à pylônes ; états `spin flow diesel mains feed fault ok`.

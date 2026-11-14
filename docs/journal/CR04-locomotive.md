# CR04 · Lac-Mégantic — journal du décor `locomotive.js`

2026-11-14. La GE C30-7 MMA 5017 et les quatre autres, pleines, en argile (DA noir chaud).

## Lu
recette-agents, regles-image, `CR04-decors.md` (haut + § locomotive.js), journal de l'architecte, `plan.js`, `world.js` (FIRST, VIEW, apply), le bouchon, `reconstitution.js` (clay, alarm, safe, heal, paint), l'idiome des bouffées de `CR03/concorde.js` (makePuffs, glowTexture).

## Choix
- **Une géométrie fusionnée par matière** (statique), un seul jeu d'arêtes par locomotive : cinq locomotives × ≈ 200 pièces seraient ≈ 2 000 appels de dessin, seize fois par image.
- Ancres déplacées de quelques unités (la vraie machine le veut) : `cylinder` [-37.0, 4.6, 6.1] (hors du longeron, tige plus longue), `compressor` [-22, 11, 0] (dégagé du panneau du volant), `reservoir` [2, 4.6, 6.4] (sous le bord de la passerelle, visible d'en haut : le réservoir de carburant prend le milieu), `volant` [-27.5, 13, 7.15] (sur son boîtier, devant la paroi du capot).
- Coupe-circuit : poignée **claire**, pas rouge (le rouge est l'incident ; les pompiers ont fait ce que prévoient les consignes).

## Fait
- `locomotive.js` réécrit (≈ 820 l.) : caisse Dash-7 (châssis, passerelle, pilotes et chasse-neige, attelages, marchepieds d'angle, capot court et ses deux phares, cabine à pare-brise et vitres sombres, capot long à portes et persiennes, trappe du frein dynamique, section radiateurs à ailes évasées avec grilles et deux ventilateurs, phares arrière, garde-corps), réservoir de carburant et deux réservoirs principaux, deux bogies FB-2 (longerons à mâchoires, traverses, essieux, moteurs de traction, sabots fixes), douze roues tournantes (voile, bande de roulement claire, deux traits de craie, chapeau d'essieu à trois boulons qui tourne aussi).
- **LE frein** : cylindre sur le longeron, tige de piston (s'allonge de 0,9 à 1,6), levier et timonerie, sabot sur la roue de tête ; **frein à main** : volant à quatre rayons + bouton, boîtier, chaîne de 30 maillons (instances) qui pend mollement desserrée et se tend droite serrée, renvoi sur le longeron.
- Tête seule : FDL-16 (carter, bloc, deux bancs en V, 16 culasses, collecteur, alternateur), turbo + cheminée, compresseur (carter, deux cylindres à ailettes en V, volant d'inertie qui tourne), conduite verte compresseur → réservoir → cylindre avec trois raccords, coupe-circuit (capot qui s'ouvre, levier qui bascule), cabine (pupitre, deux robinets de frein, manomètre à deux aiguilles, deux sièges, deux casques), « 5017 » des deux côtés ; fumée (bouffées en shader), flammes + lueur + lumière rouge, bouffées d'air cadencées sur cinq raccords.
- Fusion statique par matière + un jeu d'arêtes par locomotive ; roues des quatre autres en `InstancedMesh`. `look` : 24 ms par image (RTX 3080). `check` passe.

## Planches (30 images lues sur 30)
p1 (8) premières vues : silhouette lisible, moteur passait au vert sous `ok` → `noOk` sur moteur et turbo. p2 (8) : candidates trop chargées, écart du sabot trop petit → 0,7, cylindre reculé, flammes plus grandes. p3 (8) : candidates E/F/G, compresseur caché par le panneau du volant → reculé de 2,5. p4 (6, avec en-tête) : E, coupe, raccords, cabine, coupe-circuit, volant guéri.

## Nombres de l'état, chez moi
`run` roues (+ chapeaux d'essieu) · `psi` sabot serré au-dessus de ≈ 6, décollé de 0,7 à 0, tige qui rentre ; aiguille du manomètre ; poignée de l'indépendant · `brakes` (> i) volant 2,5 tours, chaîne tendue · `culprit/fault` 1 moteur+turbo, 2 compresseur, 3 cylindre+tige+levier+sabot, 4 volant+chaîne (× serré) · `ok` compresseur, réservoir, conduite, cylindre, sabot en vert · `depuis` volant+chaîne guéris (si serrés), casques verts · `engine` volant du compresseur tourne, caisse frémit (0,022) · `smoke` fumée · `fire` flammes, lueur, lumière, turbo rouge, fumée noircie · `cutaway` portes gauches + toit du capot montent (46) et s'en vont · `cab` flanc gauche + toit de la cabine · `crew` 0→2 casques · `cutoff` capot puis levier · `leak` bouffées · `auto` poignée de l'automatique, 2ᵉ aiguille.

## Poses qui cadrent (à coller dans `VIEW`, même idiome `lookFrom(L(...), L(...))`)
- première image, « E » (la roue et le cylindre au premier plan, la chaîne rouge, le flanc et le train qui remontent) : `lookFrom(L([-60, 1.0, 12.5]), L([-30, 5, 2]), { fov: 46, shift: 40 })` — la meilleure des miennes ; « F » derrière la roue (roue énorme, timonerie) : `lookFrom(L([-33.5, 0.4, 9.5]), L([-45, 3.0, 3.4]), { fov: 44, shift: 40 })`.
- `coupe` : `lookFrom(L([-120, 55, 85]), L([-14, 8, 3]), { fov: 30, shift: 20 })` (cabine, compresseur vert, moteur, cheminée, conduite et réservoir verts sous la passerelle).
- `cylindre` : `lookFrom(L([-30, 4.5, 20]), L([-39.2, 3.6, 4.5]), { fov: 30, shift: 20, ...CLOSE })` (cylindre, levier, sabot ; l'écart se voit entre psi 70 et 0).
- `cheminee` : `lookFrom(L([-80, 6, 55]), L([-16, 20, 0]), { fov: 30, shift: 60 })` (cabine « 5017 », volant, cheminée et sa flamme).
- `volant` (celle de l'architecte) cadre bien : rouge puis vert, la chaîne lisible.
- `pupitre`, `cabine` (architecte) : lisibles mais serrés ; `coupecircuit` : le levier clair se lit mal à 270 px (reculer, d ≈ 18).
- `raccords` de l'architecte vise x −2 : aucun raccord là. Les raccords sont à x −35,4 (cylindre), −33,4, −22,6, −13,4 (sous le bord gauche de la passerelle, z ≈ 7,3) et −50,9 (boyau avant).

## Pas encore au niveau (franchement)
- Les bouffées d'air de `raccords` ne se sont pas vues sur ma pose (elles se voient sur `file` et E) : à vérifier sur la pose de l'acte.
- Le coupe-circuit est petit et clair sur clair ; le compresseur reste petit dans `coupe` (≈ 5 % du cadre).
- Les quatre candidates restent chargées (marchepieds, longerons) : la roue est sombre sur sombre hors du halo — à juger par le chef sur la planche des quatre.

## À changer ailleurs
- `episodes/CR04-lac-megantic/src/world.js`, `VIEW` : remplacer `coupe`, `cylindre`, `cheminee` et `raccords` par
  `coupe: lookFrom(L([-120, 55, 85]), L([-14, 8, 3]), { fov: 30, shift: 20 }),`
  `cylindre: lookFrom(L([-30, 4.5, 20]), L([-39.2, 3.6, 4.5]), { fov: 30, shift: 20, ...CLOSE }),`
  `cheminee: lookFrom(L([-80, 6, 55]), L([-16, 20, 0]), { fov: 30, shift: 60 }),`
  `raccords: lookFrom(L([-8, 1.6, 22]), L([-24, 5.0, 7.0]), { fov: 30, shift: 20, ...CLOSE }),` (non vérifiée à l'image)
- `world.js` `STAGED.roue` / `FIRST` : rien (fs 14 sur la roue convient).
- `plan.js` `PARTS` (commentaires seulement, les ancres de `A` font foi) : `cylinder` [-37.0, 4.6, 6.1], `reservoir` [2, 4.6, 6.4], `volant` [-27.5, 13, 7.15], `compressor` [-22, 11, 0].

# 047 · `src/model.js` — le circuit d'eau (journal du décor)

Dossier temporaire : `.cache/planches/047/model/` (planches p1 à p4, essais e1 à e4). 30 images lues (budget plein).

## Construit
- **Électrovanne** : corps, bobine claire + connecteur, embout fileté vers −z, tuyau qui monte jusqu'à l'**orifice** (bec sur la paroi gauche, bouche noire). `inlet` : la bobine s'allume, le filet (shader additif) part du bec en arc, retombe et court en ruban sur le microfiltre jusqu'au trou du puisard ; sa tête avance avec `inlet` (arc sur 0 → 0,45, ruban sur 0,45 → 0,9).
- **Puisard** : coupelle avec collerette au niveau du fond, sortie vers la pompe. **Eau** : disque additif qui frémit (anneaux lents, bord plus clair) qui monte avec `water` jusqu'à 3,5 mm sous le bord ; de 0,8 à 1, une pellicule sur le microfiltre (plus mince loin du puisard). Jamais plus.
- **Filtres** : microfin = plaque perforée (texture mip-mappée, se fond en gris de loin, `finish` éteint), avec le trou ; fin = cylindre de toile tissée entre deux bagues ; grossier = coupelle claire à fentes noires et poignée. **Écart au plan** : `FILTERS.coarse` (bord 18, poignée 20) traversait le bras (dessous à 17) ; je les tiens sous lui (16 et 16,9 → `CF` dans le fichier).
- **Pompe** : volute à six vis, œil côté puisard, col, moteur à ailettes, boîte à bornes. `pump` : le moteur respire en veille (0,35 Hz).
- **Tube** volute → manchon sous le moyeu (double face, bague à la volute).
- **Résistance** : épingle sur le fond, deux pattes qui traversent le fond (bagues, bornes dessous). `heat` : émissif signal 1,6 × heat (une lampe, pas de voile ; vérifié p2 « heat »).
- **LE BRAS** : plaque profilée (moyeu renflé r 3,7, pales effilées, bouts ronds), **alésage ouvert** au moyeu (collerette en anneau, paroi noire : on voit dedans ; une lueur d'eau y monte quand ça tourne), dessous un manchon sur le fond et le tube — rien d'autre. Cinq bossages-buses par côté **inclinés vers l'arrière du mouvement** (14° → 26°, en éventail ±6°), une buse à chaque bout sur la face arrière, tirée de côté. Sens vérifié : bout +x vers +z, son jet vers −z, la flèche vers +z (p3 « tip side », p4 « hub thrust »).
- **Jets** : cônes additifs (cœur clair, gaine, pulsations lentes 11 cm/s sur 2,6 cm : pas de scintillement). Sous le plat ils s'arrêtent **sur la croûte** (intersection avec le plan incliné de `DISH`) avec une éclaboussure douce au point d'impact ; ailleurs ils montent 16 cm et s'éteignent dès 9 cm (bouts : 10 / 4). Avec `thrust`, les jets de bout ×1,6 et ceux du dessus ×0,4 ; avec `loop`, tous ×0,55.
- **Poussée** : flèches veille 3D aux bouts, le long du mouvement, qui grandissent avec `thrust`.
- **Distributeur** : plaque de fond, cadre, chambre noire, bouchon de rinçage à gauche, **trappe** claire (loquet, axe en bas), qui tombe vers la cuve (`trap` → 105°). **Pastille** bicolore dans la chambre (suit la porte), sort, tombe en culbutant jusqu'à `lands`, fond (0,55 → 0,85) et laisse un nuage clair (ink) qui glisse vers le puisard et s'éteint à 1.
- **Ronde** : `fatLine` 7 px + halo 18 px, par-dessus les pleins (`depthTest` off), couleurs par sommet réécrites en place ; 5 comètes (traîne ≈ 3 cm), phase = partie fractionnaire de `passes`.
- **lit…** : émissif veille faible sur les pleins + arêtes qui virent au veille (`litSump` = puisard et ses trois filtres).
- **Éclaté** : vanne, puisard, pompe, tube restent ; résistance +9, microfin +15, fin +27, grossier +40, bras +52 (VIEW.arm du bouchon reste juste) ; distributeur avancé de 5 cm.

## Poses (bench = coordonnées de l'établi)
- `VIEW.exploded` du bouchon (az −36, d 240) : tout tient, chaque pièce se nomme (p1). À az −50 le distributeur sort à droite : ne pas tourner plus.
- **Pas de moteur / poussée** (meilleur plan, p4) : `{ tx: 8, ty: 15, tz: 0, d: 85, az: -30, el: 34, fov: 28, shift: 40, dof: 8 }` avec `turn` ≈ 0,31 (+ k/2) à l'instant du mot : le bout +x pointe vers la caméra, flèche et jet de bout à l'horizontale de l'écran, en sens contraires. Le `VIEW.hub` du bouchon (d 56) ne montre aucun bout : trop serré pour un cadre vertical.
- **Moyeu vide** : `{ tx: 1, ty: 16, tz: -2, d: 110, az: -30, el: 42, shift: 60 }` (p2 « hub wide ») : la collerette ouverte, les buses, les jets.
- **L'établi entier** : `VIEW.whole` (az −38, d 150) coupe la pompe et la vanne ; az −62 d 175 (p4) tient tout mais cache la pompe derrière le microfiltre. **À essayer** : `{ tx: 4, ty: 14, tz: 0, d: 185, az: -45, el: 24, shift: 100 }` (non vu).
- **La ronde** : à az −28 la montée et la descente se superposent (elles sont presque dans le plan x = 0). **À essayer** : az −65, el 10, d 120 (non vu).
- Trappe de profil : `{ tx: 10, ty: 54, tz: 24, d: 40, az: -95, el: 5 }` (scène) ; pastille qui tombe : `VIEW.dispenser` (az −150) avec d 60, ty 50.
- Première image : le POSE0 du bouchon lit déjà la croûte signal et les jets qui la frappent à 270 px (p4 « hook 270 ») ; vu d'en dessous, le puisard (coupelle noire) est une grosse masse au centre : l'eau ne s'y voit pas.

## Pas encore au niveau
- La ronde se lit comme une boucle seulement de côté ; les comètes sont peu visibles à d 120 : la pose compte.
- Les buses inclinées ne se lisent qu'en gros plan, pas à 270 px.
- Sur l'établi, l'orifice d'arrivée flotte (pas de paroi) ; le distributeur aussi (pas de porte).
- `check` : contraste du HUD à t = 45,6 s (3 avertissements, pas des erreurs) — à regarder si c'est le bras clair sous l'en-tête.

## À changer ailleurs
- `world.js` → `VIEW.hub` : `hub: { ...P, ...CLOSE, tx: 8, ty: 15, tz: 0, d: 85, az: -30, el: 34, shift: 40 },` (et l'acte tient `turn` ≈ 0,31 modulo 0,5 sur ce plan).
- `plan.js` → `FILTERS.coarse` : `coarse: { r: 4.2, y0: 8, y1: 16, handle: 16.9 },` (le fichier le fait déjà de lui-même ; à reporter pour `cuve.js` et les ancres).

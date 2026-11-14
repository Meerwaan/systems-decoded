# L07 · voyage.js — journal du décor (mer et terre)

## Construit
- **034/fond.js importé, jamais modifié** : sa neige marine (masquée au-dessus de y = 0 par une ligne recopiée dans NOTRE copie du shader, cube 7 m) et sa surface vue d'en dessous ; épave, fonds plats, colonne, faisceau retirés (comme 038/mer.js).
- **Le câble = un RUBAN tourné vers l'œil** (`makeRibbon`) : largeur vraie, jamais sous 3 px, ombré en tube sombre, arêtes claires, cœur veille où courent les impulsions (tête claire + traîne, ≤ 1/7 de période par image). Recalculé sur le CPU seulement quand sa forme change (clé de 12 nombres) ; rien n'est alloué dans `update`.
- MER : fond en grille drapée sur `floorAt` (= `bottomAt` adouci), courbes de niveau sur la pente, 16 blocs de verre loin du câble ; surface vue de dessus (houle en traits) ; navire (coque de verre lissée par sections, passerelle à l'avant, portique et poulie de poupe pleine, deux cuves de verre avec le câble lové PLEIN, câble sur le pont) ; câble filé en courbe tangente au fond ; charrue (traîneau de verre, le câble soulevé dans son dépresseur, sillon ouvert derrière elle qui se referme, cicatrice) ; 4 répéteurs pleins (−21000, SEA.repeater, −11000, −8800) dont l'anneau s'allume veille ; ancre signal ×2,4 (chaîne, sillon), qui accroche le câble en V ; coupure (deux bouts écartés, deux lueurs signal, plus de lumière en aval) ; grappin ×2,4 et son filin jusqu'à l'étrave ; tronçon neuf (plus clair, deux lueurs veille aux jonctions) ; boucle Ω à plat vers +z.
- TERRE : sol en traits (houle vers la plage, sable pointillé, grille de rue), fond marin en traits, conduit foré (verre) et chambre d'atterrissement, central (verre), bordures et trottoirs, faisceau de 4 vieux fourreaux (A tient un câble cuivre plein), fourreau B écrasé (aplati, signal), chambre de tirage, souffleuse et touret côté −z, câble neuf qui sort du touret et file dans B jusqu'à sa tête (pleine, claire), traînées d'air qui la dépassent (encre), vieux câble du central lové dans la chambre (allumé), armoire ouverte (portes, 9 cassettes, coupleur), 32 foyers (maisons à pignon en traits, petits immeubles, une fenêtre par foyer au shader, un câble de branchement par foyer sous le trottoir), ton immeuble (s'efface, fenêtres éteintes), coffret de palier, colonne montante, dernier câble fin jusqu'à la prise, ta pièce (murs en traits, plinthe, sol en grille fine, PTO blanche + connecteur VERT, meuble de verre sur 4 pieds pleins, box CLAIRE trois gris vue de dos — ouïes, deux ports réseau, jack, port fibre + connecteur vert, LED veille —, cordon fin).

## Ce que fait chaque nombre
- `ship` présence (fondu du verre) · `sail` route sur SHIP.path · `pay` le câble descend de la poulie (0 → 1) ; **mode pose** = ship > 0 et pay > 0 et grapnel = loop = 0 : le câble du fond n'existe que derrière le point de contact (≈ 1,25 × la profondeur derrière la poupe), il n'apparaît au fond qu'à pay = 1.
- `plough` la charrue va de SEA.plough[0] à [1] ; derrière elle le câble est enterré (−52 cm, plus sombre). · `amp` chaque répéteur relance la lumière (sinon elle continue de faiblir : ≈ 38 % en arrivant au suivant) · `anchor` 0 → 0,75 l'ancre traverse depuis −z, 0,72 → 1 elle accroche (V de 190 cm vers +z) · `fault` > 0,5 coupure à SEA.anchor · `grapnel` 0 → 1 traîné vers le câble, 1 → 2 le bout +x monte à l'étrave ; dès grapnel > 0 la coupure est À SEA.repair (plus à l'ancre) jusqu'à mend 0,5 · `mend` le câble pend en un seul arc sous le navire, tronçon neuf · `loop` l'arc redescend en Ω à plat · `pulse`, `flow` lumière et vitesse · `mood` lu par la terre seulement (pied du meuble, fourreau écrasé).
- `beach` le conduit et la chambre s'allument · `ducts` les fourreaux, le cuivre, la tranchée · `blow` tête = pit + blow × (crushed − 74 − pit) : à 1 elle touche l'écrasement, **avec ou sans `crushed`** (pas de saut quand crushed passe à 1) · `crushed` aplatit B, signal, lueur quand la tête bute · `homes` part de lumière (fenêtres, branchements) · `talk` un foyer à la fois (2,2 foyers / s, fondu doux), lumière remontante en encre · `landing` l'immeuble s'efface, colonne, coffret · `room` la pièce · `pinch` 0 courbe douce à côté du pied, 1 pliée dessous (lueur signal, lumière ×0,15 après le pli, liseré signal du pied).

## Poses qui cadrent (prêtes pour VIEW ; P = { fov 28 … })
```
seaWide:   { ...P, tx: -14600, ty: -1500, tz: 0, d: 7400, az: -38, el: 7, ...SHARP },        // ship 1, sail 0.5, pay 1
shipStern: { ...P, tx: -12100, ty: -40, tz: 0, d: 2300, az: -35, el: 16, ...SHARP },        // sail 0.5 (le navire à −11750) : cuves lovées, poulie, câble qui file
plough:    { ...P, tx: SEA.plough[0] + 3450, ty: SEA.shelf + 60, tz: 0, d: 1200, az: -40, el: 14, ...SHARP }, // plough 0.5 ; suivre tx = plX + 200
repeater:  inchangée (tx SEA.repeater, ty SEA.deep + 50, d 520, az −40, el 12) — très bonne
anchor:    { ...P, tx: SEA.anchor, ty: SEA.shelf + 60, tz: -200, d: 1500, az: -30, el: 34, ...SHARP }, // plough 1, anchor 1, fault 1 : le V et la coupure
grapnel:   { ...P, tx: SEA.repair + 400, ty: -1500, tz: 0, d: 7600, az: -50, el: 6, ...SHARP }, // sail 0.1137 (étrave au-dessus de la réparation), pay 0
loopTop:   { ...P, tx: SEA.repair, ty: SEA.deep, tz: SEA.loop / 2, d: 1700, az: -20, el: 58, ...SHARP }, // grapnel 2, mend 1, loop 1 : Ω ≥ 50 % de la largeur
beach:     { ...P, tx: 700, ty: -180, tz: 0, d: 3000, az: -18, el: 10, ...SHARP },
street:    inchangée · pit: { ...P, tx: LAND.pit, ty: -60, tz: 0, d: 800, az: -30, el: 16, ...SHARP },
crushed:   { ...P, tx: LAND.crushed - 100, ty: LAND.duct + 14, tz: 0, d: 500, az: -30, el: 12, ...CLOSE },
cabinet:   { ...P, tx: LAND.cabinet[0], ty: 90, tz: LAND.cabinet[2], d: 600, az: -24, el: 12, ...CLOSE },
homes:     { ...P, tx: 7800, ty: 150, tz: 0, d: 4000, az: -20, el: 22, ...SHARP },
landing:   { ...P, tx: 7700, ty: 430, tz: -800, d: 800, az: -34, el: 8, ...CLOSE },
hook1:     { ...P, tx: RM[0], ty: RM[1] + 28, tz: RM[2] + 42, d: 56, az: 122, el: -12, fov: 46, side: 120, ...SHARP }, // box ≈ 45 % de la largeur
room:      { ...P, tx: RM[0] - 30, ty: RM[1] + 18, tz: RM[2] + 60, d: 230, az: -62, el: 16, ...CLOSE }, // pinch 0 → 1 : PTO, cordon, pied, box
```

## Ce qui n'est pas au niveau (franchement)
- `hook2` faible : le navire sort du cadre en haut (aucune lecture de « tout en haut, la coque »), pas de menace (l'ancre qui descend demanderait un nombre de plus). Je la classe derrière hook1.
- `landing` brouillon : la colonne et le câble fin se lisent comme un cadre de traits ; le coffret est petit. À recadrer par l'acte, ou à retoucher.
- `beach` : le conduit de verre se voit peu (le câble se lit, le tube à peine) ; l'ancre est lisible mais taillée en boîtes ; la charrue est un assemblage de boîtes de verre.
- `homes`/`talk` : on lit la ville et les fenêtres ; le foyer qui « répond » se voit mal à 4000 de distance (il faudrait un plan plus serré sur une rangée).

## À changer ailleurs
- `world.js`, `AT.mer` : `mer: { ...REST, set: SET.MER, ship: 1, pay: 0, amp: 1, pulse: 1, fx: SEA.repeater, fy: -1500, fz: 0, fs: 6000 },` — `pay: 0` (sinon tout plan MER est en « mode pose » et le câble du fond s'arrête derrière le navire) ; `amp: 1` (sinon la lumière meurt après le premier répéteur dans tous les plans ; le chapitre `repeteur` pose amp 0 puis 1).
- `world.js`, VIEW : les poses ci-dessus (seaWide, shipStern, plough, anchor, grapnel, beach, pit, crushed, cabinet, homes, landing, hook1, room).

## Images lues : 30 (planches mer1, terre1, p2, p3)

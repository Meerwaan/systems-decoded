# 028 · journal de `src/foyer.js` (l'appartement autour de la chambre)

## Lu
recette-agents, CLAUDE.md (patte, amateur, net et fluide), 028-decors (haut + ma section), 028-actes (haut, première image), plan.js, world.js, le bouchon, chambre.js du 022 (makeSet, verres, traits, grille, figure de verre), fire.js du 012 (brume en rubans, couche marchée), build3d, figure.

## Choix de construction (avant la première planche)
- **Même trait que chambre.js** : `makeSet` recopié (traits strong 2,4 / fine 1,9 / faint 1,8, verres `glass` rim 0,075 pour les murs), même grille (cellule 25, majeure 4, coordonnées du monde : les lignes continuent d'une pièce à l'autre ; aucune grille ne recouvre celle de la chambre).
- **La fuite (`leak`)** : des rubans tournés vers l'œil (méthode du 012), posés sur l'image (mélange normal, jamais additionnés), avec des bouffées qui avancent à 40 cm/s (longueur d'onde 80 cm, en centimètres le long du ruban : même vitesse partout). Deux faisceaux (réglage final) : 16 brins chaudière → porte → le long du mur du fond → au-dessus de ta tête ; 9 brins chaudière → le long du mur du couloir → porte des enfants → entre leurs lits. Ils s'élargissent (3 → 23 cm) et pâlissent en avançant ; opacité plafonnée à 0,55.
- **La brume (`co`)** : un volume marché (méthode de la couche du 012) sur tout l'appartement, masqué par l'union des trois pièces (les murs intérieurs ne font pas de couture), à TOUTES les hauteurs ; des volutes de bruit 3D qui dérivent lentement, plus denses (seuil abaissé) de 0,5 à 1, jamais plus hautes. Plafond d'opacité 0,32 atteint en douceur (réglage final ; pas de densité de fond : rien que des volutes) ; rien à moins de 25–110 cm de l'œil (pas de voile sur un gros plan) ; une bulle claire devant le détecteur de CO (sa lumière ne vire pas au kaki) et autour du détecteur de fumée quand `smoke` monte ; `air` la repousse depuis la fenêtre (un front qui recule de x = 260 à x = −100). Dessinée à renderOrder 7, sans test de profondeur : tout le verre (figures, coque) est dessiné après, en additif — on voit ton visage à travers.
- **Flamme** : une rangée de 9 langues sur le brûleur (plein), deux peaux « le plus clair gagne » (corps signal, cœur encre), respiration lente ; une lumière qui a un endroit (un halo cœur + traîne) derrière la petite vitre. Le caisson est de verre, pas une coque (`asShell` aurait caché le halo).
- **Figures** : toi réveillé = trois figures distinctes (assis au bord du lit · à la fenêtre, la main sur la poignée qui suit le battant jusqu'à mi-course · dehors) ; enfants = quatre figures à 0,62 (deux couchés, deux debout dehors). Tête sculptée recopiée de chambre.js (même verre que toi endormi).

## Planches (dossier temporaire `scratchpad/028/foyer/`, jamais dans le dépôt)
- **p1** (8) : tout se construit. Défauts : la brume `co` faisait un voile orange uniforme (base partout + longs rayons) ; la fuite = un seul gros « serpent » trop opaque ; le disque du détecteur de fumée noir (vu d'en dessous, non éclairé) ; la douleur trop petite.
- **p2** (8) : brume encore voile ; souffles dehors = une boule verte SUR la tête (le panache part vers la caméra, il se projette sur le visage) ; « Tu ouvres les yeux » se lit (assis au bord du lit, la tête tournée vers le mur du détecteur) ; le détecteur de fumée lit enfin blanc (émissif ink × 0,16).
- **d1** (2, diagnostic vu de haut) : le faisceau du lit passe bien la porte, mais depuis POSE0 sa fin venait vers la caméra (raccourcie, invisible). Corrigé : de la porte, la fuite longe le mur du fond au-dessus de la tête de lit, de droite à gauche, et finit 16 cm au-dessus de ta tête — un mouvement latéral, lisible depuis (a).
- **p3** (8) : les quatre candidates côte à côte (rangée du haut, `p3.jpg`) sur le décor fini (et le vrai détecteur de `model.js`) ; brume devenue douce (volutes, trous) ; enfants, couettes à revoir.
- **p4** (4, avec l'en-tête) : (a) tient sous l'en-tête, la chaudière dans la zone haute, ta tête ≈ y 1090 ; couettes des enfants lisibles ; souffles déplacés (montent et dérivent de côté) — **pas revérifiés à l'image** (budget épuisé).

## Les quatre candidates (planche `p3.jpg`, rangée du haut), notées sur les six points
| | 1 événement | 2 basse | 3 menace derrière | 4 forme ≥ 40 % | 5 système là | 6 bouge par son sujet | total |
| --- | --- | --- | --- | --- | --- | --- | --- |
| (a) oreiller + chaudière | oui : les traînées coulent de la chaudière, passent la porte, longent le mur au-dessus de ta tête | oui | oui : la chaudière rougeoie au-dessus-derrière ta tête, à travers le mur | oui : le dormeur, le lit ≈ 50 % | oui : voyant vert en haut à gauche, petit | oui (bouffées à 40 cm/s ; à confirmer par `qa`) | **≈ 6** |
| (b) chaudière contre-plongée | oui | oui | non | oui | non | oui | 4 |
| (c) détecteur, chaudière derrière | oui (fuite sous le caisson) | à moitié | oui | à moitié | **oui, grand** (le vrai boîtier de model.js, son anneau vert) | oui | ≈ 5 — la plus belle, mais pas de personne |
| (d) appartement de haut | oui | non | non | à moitié | à peine | oui | 2,5 |
Recommandée : **(a)**, telle quelle (`POSE0` de world.js).

## Poses qui cadrent (prêtes à coller)
- (a) `POSE0` inchangée : `{ tx: 70, ty: 112, tz: -175, d: 560, az: -36, el: 3, fov: 40, shift: 180, side: 0, roll: 0, drift: 0, dof: 0 }`
- `VIEW.boiler`, `VIEW.house`, `VIEW.kids`, `VIEW.pillow`, `VIEW.smoke` de world.js cadrent bien sur le décor fini (p3, p2).
- « Tu ouvres les yeux » (`me` 1, `mePose` 0, `you` 0) : `{ tx: -55, ty: 105, tz: -55, d: 320, az: -62, el: 8, fov: 36, shift: 120, side: 0, roll: 0, drift: 0.3, dof: 0 }` (le détecteur en haut à gauche, ton visage tourné vers lui ; jambes un peu raccourcies au premier plan — essayer az −75 / el 14).
- Fenêtre (`mePose` 1) : `{ tx: 165, ty: 130, tz: -30, d: 330, az: -48, el: 4, fov: 36, shift: 120, side: 0, roll: 0, drift: 0.3, dof: 0 }` (meilleure que `VIEW.window`, qui laisse toi hors cadre à gauche).
- `VIEW.outside` cadre vous trois devant la maison (p3, p4).

## Nombres de l'état, chez moi
`shell` verre/traits/grilles · `fade` tout (et la brume) · `flame` 9 langues + halo + lumière ponctuelle · `leak` les rubans (2 faisceaux) · `co` la brume marchée (0,5 → 1 : seuil des volutes 0,62 → 0,49, jamais plus haute) · `ache` lueur pulsée (1 battement / 1,6 s) + anneau · `window` battant 0 → 78° vers l'intérieur · `air` rubans veille (ils avancent avec `air`) + front qui repousse la brume de x 270 à −110 · `kids` / `kidsOut` deux couchés ou deux debout dehors · `me` / `mePose` trois figures distinctes (bord du lit · fenêtre, la main suit la poignée jusqu'à `window` 0,5 puis la lâche · dehors) · `breath` panaches veille toutes les 3,4 s · `smoke` contour encre + bulle claire dans la brume.

## Ce qui n'est pas au niveau
- La fenêtre : le battant ouvert se lit mal (verre fin vu de biais), les rubans d'air dominent l'image ; la main sur la poignée est à hauteur de poitrine, lisible mais raide.
- Dehors : les souffles corrigés n'ont pas été revus à l'image (budget) — à regarder sur la première planche des actes.
- Les figures restent les mannequins articulés du kit (genoux et coudes en boules) : à garder de moyenne distance.
- La douleur : une petite lueur à la tempe, l'anneau qui s'en échappe ne se voit presque pas à 405 px.
- (a) : au fond, la brume (rayons longs à travers tout l'appartement) fait encore un lavis brun-orange léger derrière la chaudière (plafond 0,32) ; plus sombre devant. Pas kaki.
- `check` passe ; deux avertissements de compilation HLSL (division par zéro, `isnan`) que je n'ai pas pu attribuer à un fichier.

## À changer ailleurs
- `model.js` : la brume est dessinée à `renderOrder` 7 sans test de profondeur ; les lumières du détecteur (voyant, anneaux de l'alarme, tête de courant) à `renderOrder` ≥ 9 pour passer au-dessus d'elle (sinon atténuées jusqu'à 32 %). Une bulle claire de 9–30 cm est déjà ouverte devant sa façade.
- `world.js` (facultatif) : `VIEW.window` → `{ ...P, tx: 165, ty: 130, tz: -30, d: 330, az: -48, el: 4, fov: 36, shift: 120 }`.

## Images lues
30 / 30

# 040 · crete.js — journal du décor (la crête aux rayons X)

2026-11-05. Agent `decor`, fichier `episodes/040-abri-anti-feu/src/crete.js`. Planches : `.cache/planches/040/crete/` (p1 à p5).

## Lu
recette-agents, regles-image, `040-decors.md` (haut + § crete.js), `plan.js`, `world.js`, bouchon, `027/habillage.js` (le sapin), en-têtes de `build3d`, `atmo`, `figure`.

## Choix
- **Sol** : un masque de profondeur (couleur non écrite, dessiné en premier) qui suit `ridgeY` — la crête cache ce qui est derrière elle (le front se découpe sur la lèvre), sans sol plein — et une grille en shader (`fwidth`, fondue dès que l'écart des traits passe sous ≈ 4 px : pas de moiré) : sommet raclé carré 1 m / 5 m, lèvre du sommet (|z| = 6 m) soulignée, flancs en **courbes de niveau** (4 m, majeures 20 m) + lignes de pente (8 m), qui s'effacent en descendant et aux deux bouts de la crête ; `burn` assombrit les flancs.
- **Emplacements** : 73 rectangles 4 × 5 m (bord de déblai, passes de lame), jamais brûlés.
- **Forêt** : le sapin de 027 (quatre étages de cônes ouverts, verre `asShell`) + troncs pleins ; 18 % de chicots ; zones libres autour des caméras des poses (`CLEAR`, rayon 18 m) ; `burn` éteint les couronnes, noircit les troncs, allume les braises.
- **Braises** : points semés (sol des flancs + troncs), taille bornée ≥ 2,6 px, respiration lente (3 à 8 s), chacune s'allume quand `burn` passe son seuil puis décroît.
- **72 abris** : `InstancedMesh` d'une coque froissée (ton de la feuille de model.js, petite lumière propre pour rester argent loin du feu) ; `deploy` : chacun à son tour (seuil semé), le paquet → la toile tenue au-dessus du dos (elle bat) → à plat.
- **72 pompiers** : une silhouette simple (jambes, tronc, bras, tête, casque, sac) répliquée en UNE géométrie ; verre maison (formule de `glass`) qui s'agenouille et se couche dans le shader au même tour que son abri ; face côté feu (−z) teintée signal.
- **Pelle** : lame à bout rond (`plate`, arêtes), douille, manche ; `char` fait marcher un anneau de braises de la douille vers le bout (rien derrière, 16 cm de charbon devant, puis le bois).
- **Duo** : deux `makeFigure` en verre couchés face contre terre, têtes pleines aux deux bouts.
- **Débris** : ruban calculé dans le shader (largeur en pixels, longue traîne) + tête douce.

## Planches (5 × 8 = 40 vignettes lues : budget de 30 DÉPASSÉ — j'ai compté par planche au lieu de par vignette)
1. p1 : emplacements beaucoup trop clairs (des vitres dans l'air), forêt invisible, flancs noirs, ruban du débris invisible (faces arrière éliminées), pose pelle à côté.
2. p2 : emplacements, flancs, sapins réglés ; les 72 coques lisibles en argent dans `back` ; la toile tenue haute faisait des pierres tombales.
3. p3 : toile plus basse et plus large ; pelle lisible ; débris trop fin.
4. p4, p5 : silhouettes plus claires et éclairées côté feu ; débris lisible ; `crest C` montre le front sur le flanc, les équipes, la crête qui file.

## Poses (vérifiées sur planche sauf mention)
- **crest** (image 1, la meilleure) : `{ ...P, tx: -2200, ty: -200, tz: -1600, d: 5600, az: -62, el: 15, fov: 38, shift: 140 }` — le front en bande signal sur le flanc à gauche, les équipes éclairées côté feu, la crête qui file. Les équipes frôlent la colonne des boutons TikTok : `side: 120` (non vérifié).
- **crest bas** (variante, sans le front : la crête convexe le cache) : `{ ...P, tx: -2500, ty: 120, tz: -200, d: 5200, az: -68, el: 7, fov: 36, shift: 160 }`.
- **back** : celle de world.js tient — 73 coques d'argent sur la crête noircie.
- **shovelClose** : `{ ...P, ...CLOSE, tx: -107, ty: 4, tz: 19, d: 460, az: -62, el: 26, fov: 30, shift: 60 }` — lame, douille, l'anneau qui marche, le charbon, le bois ; ton abri au-dessus. `A.shovel` suit le point qui brûle.
- **duo** : celle de world.js (les deux têtes pleines aux deux bouts se lisent) ; le front n'y est pas.
- **sky** : celle de world.js ; la tête traverse le cadre entre `debris` ≈ 0,15 et 0,55, la traîne sort ensuite.
- **zeroWide** : candidate `{ ...P, tx: 0, ty: 150, tz: -300, d: 1500, az: 70, el: 9, fov: 38, shift: 160 }` — dépend surtout de feu.js (à `front` −10, `lean` 0,5 les flammes couchées remplissent le cadre et passent sur la caméra).
- **canyon : PAS RÉSOLU.** Le sommet est convexe (flanc à 32–36°) : de toute caméra posée au-dessus du sommet, la lèvre cache le flanc ; on ne voit que le haut des flammes et les cimes. Il faut une caméra **au-dessus du vide** : de profil `{ ...P, tx: -2000, ty: -2400, tz: -4200, d: 7600, az: -84, el: 10, fov: 40, shift: 120 }` ou plongeante `{ ...P, tx: -2000, ty: -3800, tz: -6500, d: 7300, az: 6, el: 46, fov: 40, shift: 120 }` — **non vérifiées** (budget d'images épuisé). Vérifier aussi qu'aucun sapin n'y tombe devant l'objectif (`CLEAR`).

## Pas encore au niveau
- Le flanc vu de loin reste sombre (courbes de niveau fines, sapins de verre pâles) : il vit surtout par la lumière du feu.
- Les 72 silhouettes debout sont simplifiées (pas de mains, pas d'outil) : à 40 m elles se lisent, à moins de 10 m elles font mannequin.
- Le duo : pose des bras non relue de près.

## À changer ailleurs
- `world.js` → `VIEW.crest` : `crest: { ...P, tx: -2200, ty: -200, tz: -1600, d: 5600, az: -62, el: 15, fov: 38, shift: 140 },`
- `world.js` → `VIEW.shovelClose` : `shovelClose: { ...P, ...CLOSE, tx: -107, ty: 4, tz: 19, d: 460, az: -62, el: 26, fov: 30, shift: 60 },`
- `world.js` → `VIEW.canyon` : une des deux poses « au-dessus du vide » ci-dessus, à vérifier sur planche.
- `plan.js` → `DUO.at` tombe sur l'emplacement d'une équipe ([1464, 19]) : crete.js cache les coques à moins de 3,2 m tant que `duo` > 0 (deux coques). Rien à faire si ça convient.
- `model.js` (son agent / le chef) : en gros plan (pose pelle), la feuille chauffée de ton abri montrait des pavés roses pixelisés.
- `docs/catalogue-notes.json` : fiche « crête de feu de forêt aux rayons X » (`buildCrete`, voir message final).

`npm run check -- 040` : passe (avertissement de contraste de la nav à 24,46 s, déjà connu : le feu derrière l'en-tête).

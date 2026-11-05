# CR01 — DA V3 « le noir chaud » (05/11)

Mission : V2 (kraft, plâtre, Fraunces) refusée (« moche de fou, plus de la 3D… pas obligé de faire très différent, mais reconnaissable »). V3 = la V1 en vraie 3D studio + 3 signatures (noir chaud ambre + grille ambre, horloge géante, défaut rouge). En cours de route, code couleur de Merwan : « vert quand c'est bon, rouge quand c'est l'incident ».

## Fait
- V2 sauvegardée dans `.cache/CR01-da-claire/` (+ `fonts/` : les 6 woff2 Fraunces / Courier Prime et leurs licences, retirés de `kit/fonts`). V1 restaurée depuis `.cache/CR01-da-sombre/` : brand.css, reconstitution.js, CR01 index.html, main.js, coeur.js, salle.js (canal, centrale, world identiques).
- `kit/lib/reconstitution.js` : clé softbox du studio gardée (ombres douces), spot ambre sans ombre, sol des dossiers (`makeSurface`) brun-noir à grille ambre + halo ambre, suivant `focus.scale` ; fond #0B0705 ; argile satinée ; alarme brillante ; `feutre()` repris de V2 en rouge alarme ; `safe()` / `setOk()` (le vert du système qui marche ; une pièce `alarm` est verte tant qu'elle n'est pas en défaut).
- `kit/brand.css` bloc CR : fond chaud, horloge 106 px ambre lumineux (#hud à 214, T− à 168 : à 112 px l'audit voyait l'horloge chevaucher le T−), `--veille` vert tout le film, `.feutre` rouge lumineux.
- CR01 : `world.js` (états `ok`, `viol` ; `setOk` avant les décors), `coeur.js` (bas peint rouge 0,5–0,8 ; barres `safe`), `canal.js` (absorbant `safe`), `salle.js` (barres du tableau : vert par `ok`, rouge par `viol`), `main.js` (cercle rouge sur le déplaceur à `defaut`).
- Réglage : 1er essai trop orange (spot 2,4, clé #FFC98E) → spot 1,25, clé #FFDCBA, sol #0D0805. Principe recadré sur la barre (vert lisible).
- `check -- CR01` passe (1 avert. canvas au bord, déjà là) ; `check -- 036` identique à avant (0 erreur, 2 + 1 avert., 69/69).
- Images lues : 4 (instants × 2, comparaison, + 1 instants intermédiaire).

## Livrables
`.cache/planches/CR01/v3/comparaison.jpg` · `instants.jpg` (essais `instants.json`) · `image0.png`.

## Reste faible
- Image 0 : le cœur déborde à droite, dans la colonne des boutons (cadrage de l'architecte, inchangé).
- Piège : neutre (aucune pièce ne rougit : le décor n'a pas de matière « vapeur » en alarme).
- t4 : les barres rouges du tableau sont petites à 270 px.
- CLAUDE.md dit encore « vert seulement à la correction » pour le Compte à rebours : à mettre à jour par la conversation principale.

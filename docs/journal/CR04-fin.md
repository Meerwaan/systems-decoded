# CR04 — fin.js (03 DEPUIS → boucle), journal

Consigne (14/11) : `src/fin.js` seul, POSE0 retenue (actes-maj § 1), dernière image = première, volant vert = serré × `ok`, `depuis` le guérit.

## Monté
1. `todepuis` coupe sur la tête garée (`BENCHED` + `cab` 1), trois quarts avant-gauche haut : le volant ROUGE et sa chaîne au premier plan, la cabine ouverte derrière ; `depuis` 0 → 1 (109,6 → 110,8) : la lumière blanchit, le volant passe au vert. Un `path` glisse dans la cabine ; SUR « deux » (113,88) deux casques verts sur les deux sièges (`crew` 2), punch, `chip-deux` jusqu'à la coupe − 0,2.
2. `depuis:Et` − 0,12 coupe (vert sur vert) : les citernes en diagonale vues de haut (el ≈ 27), lumière blanche-verte ; SUR « déposer → main » `brakes` 7 → 18 (anneaux verts l'un après l'autre), la caméra glisse le long.
3. `tocta` coupe sur le cadre même de la question (acte1 `CAMP` : volant en haut, cylindre en bas), la nuit (`depuis` 0, moteur, `psi` 60) ; `#colonne` 119 t (air 97 + sept 22) ; « l'air » : la caméra descend au cylindre, `ok` 1.
4. `comment:Pour` − 0,12 coupe sur le cadre « sept » de l'acte 2c (les sept rouges là-bas) : ici les sept VERTS (`ok` 1) ; SUR « douze » `brakes` 7 → 12, `chip-douze`.
5. `commentaire` − 0,12 coupe : le train garé la nuit, la tête qui fume (`engine` 1, `smoke` 0,4), bas du cadre (le duel puis le dossier suivant tiennent la zone haute) ; un seul `path` qui descend le long des locomotives jusqu'au nez (« 5017 » en grand à la fin) ; duel (`toneA`/`toneB` null), `nextFile` (fait sur « lâché »), punches « commentaire », « pas », « lâché ».
6. `toloop` coupe sur `FIRST`, le train 1,4 run/s avant sa place (vitesse de l'acte 1) qui y roule, la caméra qui le suit à 60 % comme l'acte 1 ; `D.loop` (rewind « nuit-là »).

## Planches (24 images)
- p1 (8) : 109,6 / 111,1 excellents (rouge → vert lisible à 270 px) ; casques lisibles ; rangée trop dans l'axe (bande fine) ; « douze » et duel : train en trait, illisibles.
- p2 (8) : rangée basse latérale = bande noire au bas du cadre, volants cachés ; duel/abo resserrés sur les locomotives : bons ; la boucle tient.
- p3 (8) : rangée et douze en diagonale de haut (raccord acte 2c) : lisibles, anneaux verts petits mais visibles ; **143,46 et 0,00 côte à côte : même cadre, même roue, même chaîne, même lumière** ; seule différence, une bouffée d'air (`leak`, cadencée par le temps) visible à 143,46, pas à 0.

## Un cran en dessous
- 117–119 et 122,6–124,6 : les volants des citernes sont des points verts (≈ 6–10 px à 270) ; c'est la rangée qui s'allume qu'on lit, pas un compte.
- 114,5 : `chip-deux` déborde à droite (« AU MINI… » coupé).
- La bouffée d'air de la dernière image (pas sur la première) : petit saut de boucle.

## Sons (pour le monteur-son)
109,44 coupe + la lumière qui blanchit (109,6–110,8) · 113,9 deux casques posés (souffle après « bord », 114,6–114,85) · 117,1–118,9 cliquets des volants qui se serrent (souffle 118,84–119,27) · 119,3 la colonne monte · 123,6–124,3 cinq cliquets (souffle 124,40–124,84) · 141,25 coupe de boucle.

## À changer ailleurs
- `index.html` l. 44–45 (le ✗ de `check`, 87,72 et 119,61 : « 66 t » hors de sa boîte de hauteur 0) : `#col-mark { position: absolute; left: -14px; width: 240px; height: 44px; bottom: calc(10px + 320px * 66.5 / 120 - 22px); opacity: 0; }` · `#col-mark::before { content: ""; position: absolute; left: 0; top: 19px; width: 124px; border-top: 6px solid var(--veille); }` · `#col-mark b { position: absolute; left: 132px; top: 5px; font: 800 34px/1 var(--mono); color: var(--veille); white-space: nowrap; }`.
- `index.html` l. 112 : `#chip-deux` trop long pour la zone : `<span>Depuis 2013</span><b>2 personnes à bord</b><i>au minimum</i>` (« Canada » est dit par la voix).
- `locomotive.js` (bouffées `leak`) : phase des bouffées telle qu'aucune n'est visible à `END − 0,07` comme à 0 (ou bouffée nulle aux deux bouts).

## Retouche du 14/11
- Dernière image ≠ première (143,46 / 0,04 : grosse bouffée `leak` à la fin) → `locomotive.js` : l'horloge des bouffées `leak` repart de 0 sur les 3 dernières secondes (`time − durée du film`, durée lue sur `#root[data-duration]` ; `leak` vaut 0 avant la coupe de boucle, le saut ne se voit pas) : les bouffées de la fin sont celles du début. Caméra et train déjà identiques (vérifié). Vérifié à 0,04 / 143,46 / 143,50 : même cadre, même petite bouffée.
- 121 s : `#colonne` sur le « 5017 » → `surtout` et `c3` en `side: -420` (le train glisse à droite depuis la coupe `tocta`, qui garde le cadre de la question) : le panneau tombe sur la caisse vide, « 5017 » à droite, lisible. Vérifié à 120,73 / 121,0 / 121,3. Reste : de 119,4 à ≈ 120,3 le « 5017 » sort encore de sous le panneau pendant la glissade ; le volant sort du cadre à droite à « Surtout l'air » (le sujet est alors le cylindre).

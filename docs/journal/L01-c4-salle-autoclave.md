# L01 · `c4-salle-autoclave.js` — journal

Agent de mise en scène, 2026-10-15. Fichier : `episodes/L01-pare-brise/src/c4-salle-autoclave.js` (07 La salle blanche + 1903 + 08 L'autoclave, 215,55 → 325,31 s). 26 images lues sur 26 (planches `b1` 8, `b2` 8, `b3` 8, `b4` 2, dossier temporaire `scratchpad/c4/`). `npm run check -- L01` : passe, aucune erreur.

## Ce qui est monté (un plan toutes les 2 à 6 s, la caméra toujours en route)

- **07, salle blanche** — sous la carte, coupe haute vue de l'aval (az 34) et fouet `expo.out` de 0,85 s sur le pare-brise ; travelling qui passe la paroi AVEC lui (`pos` 7 640 → 7 900, sous la poseuse). `line` 0,62 et `air` 0,7 (au plein, l'air et les rouleaux mangeaient le verre) ; `litGlass` sur « deux verres ». « Entre les deux verres » : la feuille du dessus monte (`open` 0,7) ; « glisse le film » : le film entre de notre côté, vu par la tranche, étiquette « LE FILM · PVB » ; « colle » : la feuille redescend. « bulles » : plongée par rapport sur la bulle (position lue sur le verre : `world.glass.hero.onSurface`), elle naît sur le mot et repart à la fin de la phrase ; « Ce film » : glissement le long de sa tranche allumée.
- **1903** — « un Français. Chimiste » : coupe sur sa table et sa cornue ; « peintre » : travelling jusqu'au chevalet. « Novembre 1903 » (fact PARIS · NOVEMBRE 1903 · ÉDOUARD BÉNÉDICTUS) : la pièce entière, la caméra vole jusqu'à lui sur l'escabeau ; « échappe » : le flacon bascule au bord de la planche ; **« tombe » : il tombe sur le mot**, la caméra descend AVEC lui (même trajectoire bord de planche → sol, `power2.in` sur la chute libre). « ramasse » : coupe à genoux (jamais l'escabeau descendu à l'écran) ; « étoilé » : `star` sur le mot ; « il ne s'est pas brisé / d'un seul morceau » : debout, il le lève contre la fenêtre, la caméra tourne autour ; nitrocellulose : macro contre le ciel gris, de côté (sa tête ne passe plus devant). « étiquette » : elle est là sur la coupe (le fondu est caché) ; « Le range » : `VIEW.shelf`, puis lent recul jusqu'à la pièce entière à travers le `hold` (coupure pub) — le flacon étoilé sur l'étagère, la question ouverte.
- **1909 → années 40** — l'établi : le brevet glisse et se pose (« 1909 · BREVET N° 405.881 »), la caméra plonge sur son en-tête puis descend à la figure, les trois couches s'allument SUR « verre · celluloïd · verre » ; « Deux ans plus tard » : elle se lève (1911 · SOCIÉTÉ DU VERRE TRIPLEX) ; « pas le premier » : les lignes s'éteignent, la feuille vue de loin et de biais (1902) ; « son Triplex » : retour sur son nom ; « English Triplex » : la caméra remonte jusqu'au titre (1912). « Pilkington » : coupe sur le ruban sur l'étain, travelling ras (`step` 0). « années trente » : la voiture de face, avancée vers toi (ANNÉES 1930 · ANGLETERRE) ; « l'autre verre » : la caméra tourne jusqu'à la vitre de côté. Établi : « jaunit » (`gel` 0,12), « se décolle » (la bulle, plongée par rapport), « le PVB » : recul, l'éclaté s'ouvre sur le film veille plein (1930-1940), « celui de ton pare-brise » : il se referme.
- **08, autoclave** — fouet sous la carte sur le sandwich laiteux (sortie de salle blanche) ; « laiteux » : gros plan ; « On le chasse » : rasant le long des rouleaux, `milk` 1 → 0,6 ; « autoclave » : recul par rapport sur la porte ouverte, il entre, la porte se ferme, 140 °C, `press` (fact AUTOCLAVE · SOUS PRESSION). « colle pour de bon » : à travers le tambour (`press` 0,55 dans ce plan : à 1 tout le cadre était orange), le voile part. **« ressort »** : coupe EN AVAL du tambour (x 10 040 → 10 120), il roule vers la droite, transparent — l'autoclave n'a qu'une porte (amont) : le faire ressortir par elle l'aurait fait reculer à l'écran. « Une bulle oubliée » : plongée sur la bulle qui naît et repart ; « encaisser » : éclair de 0,85 s, la tête de 10 kg tenue au-dessus du gabarit (`mood` 1). Capteurs : la boîte descend (`sensors`), la caméra tourne autour ; « inspecté » : la lampe balaie (`scan`), recul.

## Les plans un cran en dessous

- Salle blanche, fouet et entrée (215,6 → 219,5) : le pare-brise se lit, mais les rouleaux au premier plan restent très présents.
- Tranche du film (220 → 224) et bulle (228,5) : la bande de reflet du verre fait une tache blanche à droite du cadre (connu, `verre.js`).
- La chute du flacon (238,4 → 239,3) : il ne fait que ≈ 60 px, le décor file autour ; ça se lit comme une chute, pas comme un gros plan.
- « Il le ramasse » (239,5) : sa tête de verre domine le cadre, le flacon étoilé est petit en bas.
- Le brevet de près (260 → 262,5) : le papier remplit le cadre, l'en-tête passe dessus (le contrôle de contraste passe).
- « jaunit » sur l'établi (288,7 → 292,5) : `gel` sur la bande de reflet fait un voile rose ; baissé à 0,12, pas revu.
- Entrée dans l'autoclave (305) : le verre qui passe la porte fait une tache blanche.
- Non revus après correction : l'éclaté du PVB rapproché (d 420), le tambour vu de plus loin (d 520), la plongée sur la bulle en sortie (arrive maintenant sur « décoller »), la boîte des capteurs à d 108 ; jamais vus : la glissée vers la vitre de côté (286,5), l'éclair du gabarit (317,2), le balayage d'inspection (323,5).
- Les mots-clés automatiques débordent sur une coupe : « BULLES » est encore à l'écran dans le laboratoire (jusqu'à ≈ 231,6 s, sur la table de Bénédictus).

## À changer ailleurs

- `main.js` · `D.commit({ long: { chapters: CARD, keywords: { skip: KEYWORDS_SKIP } } })` → `D.commit({ long: { chapters: CARD, keywords: { skip: KEYWORDS_SKIP }, quiet: [[D.at("flacon:français") - 0.25, D.at("flacon:peintre")]] } })` (le mot-clé qui commence avant s'arrête 0,05 s avant la coupe ; mieux encore : couper tout mot-clé à la coupe suivante dans `kit/lib/long.js · buildKeywords`) — « BULLES » ne doit pas entrer dans le laboratoire.
- `kit/lib/usine.js · makeAutoclave` : une porte de sortie à x1 (`hinge`/`door` des deux côtés) permettrait de faire « ressortir » le pare-brise vers l'aval sans coupe.

## Reprise après relecture du film (4 images lues : r1 3, r2 1)

- 231,9 s : le laboratoire de face et de plus loin (d 560 → 470) : étagères à gauche, fenêtre, table et cornue, chevalet à droite ; la caméra glisse de la table au chevalet sur « peintre ». Bénédictus est juste hors cadre à gauche (il revient sur « Novembre »).
- 270,3 s : le brevet à d 135, la moitié du cadre, ses trois lignes restent surlignées (« verre · celluloïd · verre » lisibles) pendant la phrase de 1902 ; plus d'extinction des lignes.
- 308,7 s : autoclave sombre : `press` 0,35 dehors, 0,05 dans le plan à travers le tambour, `hot` 0 sur tout le chapitre 08. Il reste une teinte brune très légère. La cause est dans le décor : `kit/lib/usine.js` · `makeAutoclave` · `set()` : `for (const [m, k] of hotShells) m.userData.heat(0.42 * p * k);` teint le tambour en signal avec la pression ; pour qu'un autoclave reste encre, il faudrait une lueur encre (ou ≤ 0,1 × p) à cet endroit.
- `check` passe (0 erreur).

## Images parasites du brouillon (239,03–239,10 s) — 4 images lues

- Cause : la caméra descendait AVEC le flacon (`power2.in`, au plus vite à l'arrivée) et balayait les planches rayées de l'étagère → images parasites, et le mouvement heurté de 238,8 s.
- Corrigé : pendant « échappe… et tombe », un cadre fixe qui tient toute la hauteur (planche du haut → sol, fov 44, d 560 → 530, simple avancée lente) : le flacon traverse un cadre immobile. Il y fait ≈ 50 px : un cran en dessous en taille, mais net. Non re-rendu (consigne).

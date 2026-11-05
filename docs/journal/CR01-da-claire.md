# CR01 — la DA « table d'enquête, sous la lampe » (05/11)

Mission : Merwan trouve la DA sombre « reconstitution » trop proche des dossiers. Première consigne : passer en clair (papier). Changée en cours de route (« blanc ça va faire mal aux yeux ») : **la table de l'enquêteur la nuit, sous une lampe de bureau** — kraft brun, plâtre clair, feutre rouge, papier en petites surfaces, ivoire pour les textes.

## Sauvegarde
`.cache/CR01-da-sombre/` : brand.css, reconstitution.js, reconstitution.md, recette-compte-a-rebours.md, CR01 index.html, src/{coeur,canal,salle,centrale,world,main}.js (état d'avant). Revenir en arrière = recopier ces fichiers (et retirer les 6 woff2 Fraunces / Courier Prime de kit/fonts, inoffensifs).

## Fait
- `check -- 036` avant : passe, 0 erreur, 2 avert. runtime, 1 avert. layout, 69/69 contraste (`.cache/planches/CR01/claire/check036-avant.txt`).
- Polices : `@fontsource/fraunces` 600–900 et `@fontsource/courier-prime` 400/700 (npm pack) → `kit/fonts/` + licences OFL. Fraunces : sérif gras, lisible petit ; Courier Prime plus net que Special Elite (trop « abîmé » à 20 px).
- `kit/lib/reconstitution.js` : palette RECON (kraft, plâtre, papier, ivoire, encre, surligneur, feutre, vert) ; fond = texture kraft (dégradé + fibres, graine fixe) ; lampe chaude + rebond chaud ; étalonnage doux ; sol kraft ; arêtes à l'encre ; `alarm` = peinture rouge feutre mate ; nouveau `feutre(D, …)` (cercle / flèche / soulignement tracés au feutre, ancrés sur la scène).
- `kit/brand.css` bloc CR réécrit : variables, Fraunces / Courier Prime, en-tête étiquette punaisée + heure surlignée + T− sur étiquette, sous-titres ivoire en casse de phrase, `+mot+` surligné, fiches papier scotchées, panneaux en carton sombre, marques de feutre.
- CR01 : `index.html` (couleur des fiches), `main.js` (étiquette « Pièce 01 · 26 avril 1986 », deux traits de feutre de démonstration : AZ-5 à t6, déplaceur à `defaut` — les agents d'acte peuvent les déplacer), `coeur.js` (bas du cœur peint en rouge), `salle.js` (pupitre d'un ton plus sombre).
- Planches (6 images lues + 1 image 0) : essai1 (4) → lampe trop forte, AZ-5 beige, cercle du défaut mal centré ; instants (8) ; essai2 (3) → bas du cœur peint ; kraft mesuré par échantillonnage (sharp, sans lire d'image) : centre L* 36–42, coins 10–16 ; image0 ; comparaison.

## Livrables
- `.cache/planches/CR01/claire/comparaison.jpg` (035 à 20 s | image 0 | défaut entouré | depuis)
- `.cache/planches/CR01/claire/instants.jpg` (les 8 instants) · `.cache/planches/CR01/claire/image0.png` (pleine résolution)

## Reste faible
- Gros plans très « plâtre » (AZ-5, t4 tableau) : beige sur brun, lisibles mais doux ; les actes peuvent serrer le cadre ou baisser la lampe.
- Piège (canal, gros plan combustible) : chargé (neutrons blancs + bulles).
- Fil rouge d'enquête : pas fait (option).
- Les actes de la salle (t4) : la silhouette en plâtre se confond un peu avec le pupitre.

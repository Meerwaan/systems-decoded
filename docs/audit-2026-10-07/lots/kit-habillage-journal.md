# Journal — lot « kit-habillage » (kit/brand.css, kit/lib/overlay.js)

Démarré le 2026-10-07. Lu : constats.md, critique.md, forces.md, audit/habillage/rapport.md, chunker3.cjs, chunks.cjs, hooklines.cjs.
État d'origine mesuré (chunks.cjs) : 005 91 lignes, 12 finissent sur un mot-outil, 12 sous 0,45 s ; 006 87 lignes, 9 et 11.

habillage/H1 (+R9) — FAIT. overlay.js : nouveau captionBlocks (découpage par coût, blocs d'1 ou 2 lignes, porté de chunker3.cjs), buildCaptions l'utilise (.cap__box porte l'entrée, une .cap__line par ligne) ; brand.css : .cap__box.
Vérif : count.cjs (dans ce dossier) → 005 70 blocs/23 sur 2 lignes/4 mot-outil/0 sous 0,45 s ; 006 74/13/4/0 ; 002-004 : 0 sous 0,45 s ; aucun mot perdu. Planches h1-005.jpg, h1-006.jpg : allumage traverse les 2 lignes, chevrons libres.
image-005/image-005-07 — FAIT. brand.css : text-shadow de .cap__line (et .hook) = liseré serré + halo large ; .cap__w en attente grisé par la couleur (rgba ink 0,34) et non par opacity, pour que son ombre reste entière.
Vérif : s-apres.jpg, s-apres2.jpg (005 : 11,6 / 16,95 / 18,3 s sur le combustible), s-apres2-006.jpg (vert). Pas de plaque.
habillage/H2 — FAIT (sans « phrase A allumée dès l'image 0 », décision Merwan). overlay.js buildHook : linesOf par coût (3 lignes max, coupe à la virgule, pas après un mot-outil, corps réduit jusqu'à 72 px si ligne > maxChars), petite ligne sans chiffre = .hook__k--say (Barlow 800 64 px) ; brand.css : .hook__w attente 0,62 par la couleur.
Vérif : h2-005.jpg, h2-006.jpg (image 1, allumage, copie de boucle identique). check 005 et 006 : passed.
habillage/H4 — NON FAIT ici : la taille du titre est surchargée dans episodes/005 et 006 index.html (pas mes fichiers). Voir pour-les-autres.md.

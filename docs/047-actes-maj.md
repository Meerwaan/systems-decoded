# 047 — ce que les décors ont changé (à lire avec docs/047-actes.md)

1. Image 0 : A « sous le panier » retenue telle quelle (POSE0 / FIRST inchangés). Planche : .cache/planches/047/image0.jpg.
2. VIEW.kitchen = la machine + les deux colonnes à sa droite (az −68, fov 40) ; l'évier est HORS champ, il n'entre qu'au glissé vers VIEW.sink (az −40, d 300). COLUMNS déplacées à z 42 (devant le panneau de fin, à droite de la machine). Ne pas aller plus près que VIEW.sink sur toi (bras en tubes épais).
3. VIEW.door recalée (d 300, shift −100 : porte entière, voyant hors de l'en-tête). VIEW.hub = le plan « pas de moteur » : avec turn ≈ 0,31 (modulo 0,5) la flèche de poussée et le jet de bout se lisent en sens contraires ; les buses inclinées ne se lisent QU'en gros plan → c'est là que se dit « sans moteur ».
4. Plat penché bord avant plus HAUT (sa croûte regarde vers la porte et la caméra basse). crack : fissures 0 → 0,18 puis 12 plaques qui tombent l'une après l'autre autour du filtre grossier ; crust 1 → 0 dissout par plaques.
5. ghosts = un parcours, pas un fondu : un seul tween 0 → 1 sur « Ni éponge, ni brosse » (éponge pleine vers 0,3, brosse vers 0,72, rien à 1).
6. Système : water monte au bord du puisard puis une pellicule sur le microfiltre, jamais plus (jamais cuve pleine). loop/passes : la ronde baisse les jets de 45 %. trap/tab suivent door. VIEW.whole coupe pompe et vanne (essayer az −45) ; la ronde se superpose à az −28 (essayer az −65).
7. Habillage (src/habillage.js) : verres et bols au panier haut (cachés sous el −10°), buée qui suit shell × heat (naît sur « cinquante degrés »), lumière du soir au sol qui suit room × (1 − night) : night 0 → 1 SUR « tu vas dormir ». Si les bols pèsent sous l'en-tête en VIEW.tub / VIEW.section, shift 110 → 80.
8. check : 3 avertissements de contraste de l'en-tête à 45,6 s (acte2b, sujet clair derrière l'en-tête) — à régler dans acte2b.

# 033 · acte1.js — retouche

## Retouche du 30/10/2026
Planches : `.cache/planches/033/retouche1/` (p1, p2 : essais de poses ; p3, p4 : vérification ± 1/30 s).
1. **0 → 0,5 s trop immobile (0,9)** → la poignée est arrachée par à-coups à 0,18 (au lieu de 0,06) dès l'image 1, les mains et le corps du voisin la suivent ; t = 0 reste POSE0 + FIRST (handle 0). Vérifié à 0,00 / 0,03 / 0,10. Le score de mouvement est à remesurer sur le brouillon.
2. **4,3–5,2 arc de verre + heurté 19,8** → le recul par la coque est remplacé par une COUPE sur « En croisière » (t.promesse − 0,12 ≈ 3,91) vers la porte 1L vue de dehors (`OUTDOOR` = VIEW.plane, tx DX+150, d 2 600 ; état STAGED + pull 1, shell 1, stops 0,7, L_PLANE), puis un recul lent `sine.out` jusqu'à VIEW.plane (7,1). Vérifié à 3,933 / 3,967 (images identiques en continuité).
3. **6,1 heurté 12,9** → disparu avec la coupe ci-dessus (c'était le même mouvement). **16,4 heurté 16,4** → le glissé de toi vers le bord (le voisin balayé hors du champ) devient une COUPE sur « Tu l'arrêtes » (16,0) vers EDGE d ×1,22, puis une poussée lente `sine.out` vers EDGE ×1,03 ; la tenue finale et l'état rendu à l'acte 2 sont inchangés (EDGE, STAGED + alt 11 300, pax 0,35, stops 0,7, mood 0, L_EDGE). Vérifié à 16,033 / 16,067.
4. **11,8–14,3 noir puis cadre vide** → la plongée est remplacée par une COUPE sur « Dehors » (11,90) : l'A330 vu de très haut (`OUT` : tx DX+508, ty −1 500, d 14 000, az −60, el 78, fov 44), cabine allumée (`lights` 0,7 le temps du plan), la côte de l'île en bas du cadre ; la caméra s'éloigne lentement (ty −2 500, d 17 000) jusqu'à la coupe « Toi ». Les à-coups de la poignée finissent avant la coupe. Vérifié à 11,867 / 11,90 / 11,933 / 11,95 / 11,967 / 12,0 / 13,5 : jamais de noir.
5. **≈ 18,0 « CETTEPORTE »** → pas le `D.punch` (il ne touche que l'objectif) : c'est le `hit` des sous-titres (`D.captionStyle({ hit: 0.25 })`), qui grossit le mot marqué +porte+ autour de son centre pendant 0,1 s et mange l'espace. Non corrigé ici (réglage du film entier) → « À changer ailleurs ».
- L'acte a maintenant six coupes (3,91 · 8,0 · 10,37 · 11,90 · 14,34 · 16,0) au lieu de trois : une toutes les 2 à 4 s.
- `npm run check -- 033` passe. Images lues : 4.

### À changer ailleurs
- `kit/lib/overlay.js`, `buildCaptions`, dans `if (hit && w.a) {` (l. ≈ 159) : réserver la place du mot à son plus grand — ajouter `span.style.margin = \`0 ${(hit * 1.4).toFixed(2)}em\`;` avant le `tl.fromTo` (≈ 0,35 em de chaque côté à 0,25) ; ou, plus simple, faire grossir le mot depuis sa gauche (`transformOrigin: "0% 60%"` dans le `fromTo`) — à vérifier sur « CETTE PORTE ? » à 17,99 / 18,02.

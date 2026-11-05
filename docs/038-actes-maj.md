# 038 — ce que les décors ont changé (à lire avant d'écrire un acte)

1. Première image : `POSE0` = { tx −4800, ty 200, d 9000, az 55, el −8, fov 46 } — la proue file vers la gauche, kiosque visible, la paroi remplit la gauche et le bas. L'acte 1 part de là (gap 120 → 0 au choc).
2. `VIEW` réglées par les décors : `bottles` (d 2300, az 38, el 26), `crew` (d 1150, el 12), `exploded` (d 9800, az 64, el 38 : le chemin de l'air monte dans le cadre), `tank` (d 2700), `cube` (d 1300, el 10), `surface` el 5 (à 2 la caméra traverse la surface), `mountain` (d 1 100 000, fov 50, drift 0,3).
3. `underB` vu de dos se lit comme un tube : ne pas l'utiliser ; toujours le bateau de trois quarts avec son kiosque.
4. Sous-marin : `crush` se lit « plié en accordéon » ; le `jolt` ne se lit qu'en plan serré (`crew`) ; `heart` laisse le seul ballast avant bâbord ; `explode` n'existe que sur l'établi (bateau intact).
5. Mer : `pitch` est maintenant transmis à `mer.update` (l'écume suit l'assiette). `speed` fait filer la neige ; `rush` > 0 = le bateau monte (la neige tombe). `gap` < 2,5 m déclenche le sédiment.
6. La paroi ne monte qu'à mi-cadre en plan large (épaule à 55 m au-dessus du contact) : cadrer bas pour qu'elle remplisse.
7. Jamais vus par les décors : `aft`, `torn`, `blow`, `surface`, `float`, `weight`+`lift` ensemble — à vérifier sur planche dès le premier essai.
8. Sous-titres : « 7 000 » et « 1 000 » s'affichent avec l'espace (episode.json corrigé, voix intacte).

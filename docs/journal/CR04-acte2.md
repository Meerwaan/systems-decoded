# CR04 · Lac-Mégantic — journal de `acte2.js` (t1 → t2, `tot1` 29,98 → `tot3` 53,02)

## Monté (un plan par ligne)
- `tot1` coupe `VIEW.arrivee` : le train arrive (`run` −260 → 0 en 1,45 s, `slack` 1 → 0), lente poussée jusqu'à « soixante-douze ».
- `soixantedouze`−0,14 coupe sur les citernes de près (`lookFrom(L([600,220,380]), L([1000,0,0]))`, cylindres verts), glissé lent vers la queue.
- `megantic`−0,14 coupe : la pente vers la ville (`TOWN` = [−23300, −820, 800]), la caméra descend de u 10 000 à 13 600 ; `town` 0,35 → 1 SUR « Lac-Mégantic ».
- `t1:Tu#2`−0,14 coupe sur la tête (`lookFrom(L([-210,60,150]), L([70,14,0]))`, la tête verte, fumée 0,6), une poussée de 2,4 s jusqu'à `SEVEN` avant « sept ».
- `SEVEN` = `lookFrom(L([-60,40,45]), L([300,14,7]), { fov: 18 })`, `lit(L([200,14,0]), 300)` : SUR « sept » `brakes` 0 → 7 en 0,64 s ; punch « main ».
- `tot2` coupe `VIEW.pupitre` (`cab` 1, `psi` 60) ; SUR « desserre » `auto` 1 → 0 en 0,9 s (la poignée).
- `t2:et`−0,14 coupe sur `SEVEN` (az +9, el +4) : les sept anneaux verts seuls ; la lumière se resserre SUR « seuls ».
- `t2:Mais`−0,14 coupe sur le pupitre (az +12) ; SUR « serrés » `#mano` sur 60 ; la caméra descend le flanc jusqu'au cylindre vert (`VIEW.cylindre` × 1,5) sur « locomotives ».
- `rien`−0,14 coupe `VIEW.immobile` (`cab` 0) ; `chip-essai` de « réussi » à `tot3`−0,2 ; punch « réussi ».

## Rendu à acte2b
`run` 0, `slack` 0, `engine` 1, `smoke` 0,5, `ok` 1, `psi` 60, `brakes` 7, `auto` 0, `cab` 0, `mano` 0, `town` 1 (acte2b coupe tout).

## Planches (.cache/planches/CR04/acte2/) — 40 vignettes lues (budget de 26 DÉPASSÉ)
1. b1 : `arrivee` tient ; citernes en travelling rapide = traînée floue ; `vallee` d'origine : ville petite au bord gauche ; `VIEW.tete` : sept volants invisibles ; pupitre lisible ; cylindre trop serré.
2. b2 (poses d'essai) : `g` citernes de près = le meilleur plan des wagons ; volants comptables nulle part en plan large ; vallée recentrée mieux.
3. b3 : flou de mouvement sur les citernes (34,6) ; cylindre × 1,5 bien.
4. b4 : `s1` (flanc, fov 18) = les anneaux verts se lisent le mieux ; « along » = un trait trop fin ; ville `z 800` lisible (bande de lumières).
5. b5 : poussée tête → sept en 0,7 s = flou (40,5) ; pupitre sombre sur sombre.
Après b5, corrigé SANS le revoir : citernes en coupe + glissé lent (au lieu du travelling), poussée vers les sept en un seul trajet de 2,4 s.

## Pas au niveau (franchement)
- Les sept volants restent de petits anneaux verts (≈ 15–40 px) : on voit une rangée qui s'allume, on ne les compte pas à 270 px.
- 33,5 → 35,3 et 38,3 → 40,7 : réécrits après la dernière planche, non revus.
- Pupitre (41,8 → 45,1, 47,1 → 49,2) : brun sombre sur brun ; la poignée qui part SUR « desserre » non vérifiée à l'image.
- La fumée de « une locomotive allumée » ne se voit pas : c'est le vert de la tête qui le dit.
- Le relâchement des citernes (`auto`) n'est pas à l'image (hors champ).

## Sons (pour le monteur-son)
31,3 le train s'arrête (frottement, souffle d'air) · 33,48 coupe · 40,86 → 41,50 sept cliquets de volant, un par 0,09 s · 44,10 la poignée, puis l'air relâché (dans le souffle après « air », 45,0–45,2) · 46,50 « seuls » : rien · 51,04 coupe · 52,6 « réussi » (après le mot).

## Couverture (proposée, non tirée)
Repère `sept`+0,8 ; pose `lookFrom(L([-120, 200, 200]), L([150, 10, 0]), { fov: 30 })` (el ≈ 30) ; état `{ ...STAGED.tete, ...lit(L([150,12,0]), 300), brakes: 7, ok: 1, engine: 1, smoke: 0.6, auto: 1 }` : les cinq locomotives éclairées, les sept volants et le compresseur en vert.

## À changer ailleurs
Rien.

## Retouche du 14/11/2026
- 49,8 s, mouvement le plus heurté (grue du pupitre au cylindre en 0,8 s) → coupe nette `t2:locomotives`−0,14 sur `VIEW.cylindre` (az −6, d × 1,5, halo cylindre fs 18 dans la coupe), puis glissé lent jusqu'à `rien`−0,16 ; le pupitre dérive à peine jusqu'à la coupe. Vérifié à 50,01 / 50,07 / 50,10 / 50,6 (r1) : coupe franche, images consécutives en continuité.
- 45 et 48 s, pupitre brun sur brun → pose resserrée et plus haute sur les deux poignées (`lookFrom(L([-33.2,18.6,4]), L([-37.8,12.9,-4.6]))`, el ≈ 29°), halo `lit(L([-38.2,12.7,-4.6]), 8)` sur les poignées (aussi dans la coupe `t2:Mais`). Les poignées claires remplissent le haut du cadre, la poignée automatique tourne de 70° entre 44,1 et 45 et se lit. Vérifié à 42,0 · 44,6 · 48,0 · 49,9 (r3), hors de la zone des boutons.
- 33,9 · 34,9 · 39,5 · 40,5 revus (r0) : citernes et locomotives lisibles, nets ; rien à changer.
- `npm run camera` : plus de plage fixe dans l'acte 2 ; `check` passe. Planches : .cache/planches/CR04/acte2-retouche/r0–r3.jpg.

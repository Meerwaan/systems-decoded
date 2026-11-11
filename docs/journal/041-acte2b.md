# 041 · acte2b.js — le principe et le repos (31,41 → 47,34)

Agent `acte`, 08/11. Planches : `.cache/planches/041/acte2b/`.

## Lu
recette-agents, recette-actes, regles-image, 041-actes-maj (prime), 041-actes (haut + § acte2b), world.js, main.js, index.html (étiquettes), squelette, `npm run script -- 041`, vo.json (mots), direct.js (path, cut, punch, chip), whipple.js (update : bille, jumelle, jauges, burst, pierce), journaux whipple / station / état.

## Instants (voix réelle, take + 1,40)
principe : Pourquoi 31,53 · vide 31,92 · perce 33,00 · brise 34,32 · nuage 35,08 · dix 36,00 · centimètres 36,12 · s'étale 37,40–37,88 · coque 38,52 · pluie 39,28 · pas 39,92 · balle 40,20.
repos : Il 40,83 · attend 40,92 · épais 41,80 · l'avant 42,09 · station 42,64 · arrête 43,40 · centimètre 43,88 · Pas plus 44,72–45,16 · tien 45,64 · fait 46,40 · centimètre#2 46,68 · fin 47,24 · tozero 47,34.

## Premier jet (écrit d'un trait)
- Établi, un seul `path` (az −86 → −93,6, el 3 → 14,5) : paire large (d 360 : les deux points d'impact, 54 cm d'écart, tiennent entre l'en-tête et les sous-titres), les deux billes au même `dist` que la jumelle (P0 = 0,4·(1 − 24/45)) → contact ensemble sur « perce » ; descente sur le coupon (brise, punch), le vide de près (d 52–60, jauge), « coque » allume la paroi, pluie, puis la caméra monte le long du coupon jusqu'à la plaque-miroir, percée sur « balle ».
- Orbite, un seul `path` (az −40 → −106) : whole → front 3/4 (tx −700) → panoramique sur le coupon encore loin (d 2600) → plongée par rapport (d 420 → 32) → la bille (dist 20, figée), `mood` 1 dans le souffle après « tien », `gauge1` sur « fait », punch « centimètre#2 ». `shell` → 0,15 sous d 150 ; la Terre ralentit et s'arrête (`flown` power1.out jusqu'à « tien »).

## Planche p1 (8) — le principe sur l'établi
- ✓ 31,55 paire large (d 360) : la plaque-miroir en haut, le coupon en bas, deux billes à droite ; les deux points d'impact entre 440 et 1160 (54 cm d'écart : à d 190 le coupon tombait sous les sous-titres et le miroir sous l'en-tête). Petit mais net.
- ✓ 34,42 → 38,10 : le cône naît du trou chaud, s'étale le long de la jauge, s'écrase sur le matelas — lisible à 270 px dès 35,3 s.
- ✓ 40,42 : la plaque-miroir percée, un jet serré vers la gauche (« pas une balle »).
- ✗ le flash de la jumelle arrivait 0,2 s après celui du coupon → `pierce` 0,4 → 0,45 en 0,24 s sur « perce » (vérifié p3 : deux flashes dans la même image).
- ✗ 39,55 : la pluie déjà finie → `burst` 0,85 → 0,93 de pluie − 0,18 à pluie + 0,32, puis 1 ; clé caméra tenue près (d 60) jusqu'à pluie + 0,2.

## Planche p2 (10) — pluie, orbite
- ✓ 39,38 (film) : colonne de points blancs sur la coque, le nuage encore là. az −86,5 la montre mieux (points étalés) mais casse l'ordre des az : gardé −91,9.
- ✓ 41,50 l'ISS sur le limbe, bouclier veille ; ✓ 42,75 l'avant, tubes veille épais.
- ✗ 43,90 / 44,70 : la caméra frôle Columbus (x −1145, côté +z) puis longe le labo : verre et bouclier vus en rasant = voile vert-blanc. → clé `arrete` à el 28 (passe au-dessus de Columbus).
- ✓ 45,95 / 46,85 : la bille (boule chaude sur noir), sa jauge d'un centimètre sous elle ; le cœur blanc et la jauge ont la même largeur.

## Planche p3 (8)
- ✓ 33,03 deux flashes ; ✓ 34,00 descente (le miroir sort par le haut) ; ✓ 40,62 avant la coupe.
- ✗ 43,55 → 44,32 : encore des modules de verre très clairs en grand (le labo vu en rasant, l'air de la cabine). Correction appliquée SANS planche (26/26 images lues) : dès « arrête » − 0,1, `shell` 0,15, `shield` 0,12, `cabin` 0 et `litBumper` 0,7 en 0,6 s (l'œil passe du bouclier de la station au morceau qu'on a ouvert), la bille à + 0,5. À revoir sur le brouillon : 43,5 et 44,3 s.

## Mesures
`npm run camera -- 041` : sur 31–47 s, aucune plage fixe ; le plus lent 32 s (12 °/s) ; la plongée 43–45 s à 167–229 °/s (rotation + déplacement/d + zoom : inhérent à une plongée par rapport, ratio 80 en 2,1 s ; pas une coupe, seuil 400 par image). `npm run check -- 041` passe ; aucune erreur de mon acte.

## Rendu à l'acte 3 (tozero 47,34)
Pose ≈ `{ tx 0, ty −1.5, tz 20.5, d 21.5, az −106, el 12, fov 30, dof 8 }` (orbite) ; état : `STAGED` + `shell` 0,15, `shield` 0,12, `cabin` 0, `litBumper` 0,7, `bille` 1, `dist` 20, `trail` 0, `gauge1` 1, `mood` 1, `flown` 24, `LIGHT.coupon`. `flown` n'est pas dans `STAGED` : l'acte 3 hérite de 24 s'il ne le pose pas.

## À changer ailleurs
- `src/acte2.js` : son dernier `path` finit à 31,43 s, mon acte coupe à `principe` − 0,12 = 31,41 (check : « un autre plan commence dedans ») → sa dernière clé à `t.principe - 0.12` (ou `D.at("principe") - 0.12`).

## Retouche du 08/11 (retoucheur ; planches `.cache/planches/041/retouche-acte2b/` p1–p4)
- **1. 43,0 heurté 31,9 + 44,0 tache blanche** → la plongée 5200 → 32 en 2 s remplacée par une coupe dans le souffle : `atC` = arrête − 0,24 = 43,16 (« station » finit 42,84, « Il » 43,28), sur le coupon en profil juste passé (`COUPON_SHOT` az −96, d 130 ; avant −90 sa face remplit le cadre en plaque pâle — p2). L'état est posé dans la coupe (shell 0,15, shield 0,12, cabin 0, litBumper 0,35, `LIGHT.coupon` ; le tween `LIGHT.coupon` est retiré), la tôle passe en veille 0,7 sur « arrête », puis travelling vers la bille (d 132 à arrête + 0,7 : tôle ≈ 210 px, bille ≈ 835 px ; d 40 à tien − 0,1). Le chemin en orbite finit lancé à atC (l'avant, d 5000). Vérifié p3/p4 : 43,13 l'avant · 43,17 tôle verte sur noir · 44,0–44,3 tôle + bille (≤ 870 px) · 44,8–46,6 bille sur noir.
- **2. 40,7 heurté 14,7** → départ doux après la coupe sur l'ISS (clé attend + 0,45 : d 20 500, az −46, au lieu de 11 500 / −56 à « épais ») : vitesse à la coupe ≈ moitié. Vérifié p1 40,73 (l'ISS entière, coupe nette).
- **3. 40,0 cadre vide** → coupe sur la plaque-miroir à pas − 0,13 = 39,79 (`MIRROR_SHOT` ty 47, d 114), recul lent jusqu'à repos − 0,17. Vérifié p1 39,85 / 40,05 (cratère chaud), p2 40,35 / 40,55 (jet serré vers la gauche).
- **4. 32,5 paire trop petite** → clés vide + 0,4 (d 268) et perce (d 250, ty 18,2) au lieu de 312 : ×1,3 à 32,5 ; les deux points d'impact entre ≈ 450 et 1 220 px. Vérifié p1 32,5 / 33,0, p4 32,0.
- Poses et états d'entrée (31,41) et de sortie (47,34) inchangés, `flown` intact. `camera` : 0 % quasi fixe, aucune plage fixe ; 41–42 s à 75–80 °/s (la poussée vers l'avant), 44–45 s à 58–68 °/s. `check` passe.
- À revoir sur le brouillon : `qa` à 41–42 s et 44,5–45,3 s ; le bord haut de la plaque-miroir sous l'en-tête à 32–33 s ; le haut du coupon qui dépasse en bas du plan miroir (sous 1 600 px).
- À changer ailleurs : rien.

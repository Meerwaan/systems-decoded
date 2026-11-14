# CR04 — acte2c.js (t6 → defaut, `tozero` 76,46 → `tot7` 93,61)

## Ce qui est monté
1. `tozero` — coupe sur LE cylindre garé (`VIEW.cylindre` reculé, `shift −110` pour passer sous la colonne), orbite lente de 17° (`D.path`), bouffées `leak` 0,6. « soixante-six tonnes » : `#colonne` (`col` 1, `mark` 1) 71 t vert ; « il en manque » : `psi` 30 → 26,6 (affiche **65**, rouge, sous la marque ; à 27 psi la colonne arrondissait à « 66 »). Colonne sortie 0,2 s avant la coupe.
2. `t6:Le −0,12` — coupe sur la première image (`POSE0`, `FIRST`, `col` 0, `mark` 0) ; poussée 7 % ; SUR « part » `run` 0 → 9 (`sine.in`, ce que fait l'acte 1), lumière qui suit la roue ; punch « part » ; « Tout seul » : `slack` 0 → 1 en 2,7 s.
3. `toverdict` — le train prend la pente, la caméra **roule avec lui** : clés toutes les 0,2 s recalculées sur `R(at)` (la loi même du `st` de `run` : 9 → 450 en `power1.in`), segments droits (aucun freinage sur une clé). Du nez bas avant-gauche (`VIEW.prend`) elle recule et monte le long des cinq locomotives jusqu'à la rangée des sept véhicules de tête qui file vers le haut du cadre (cam L[-140,110,120] → cible L[300,10,0], az ≈ −75, el ≈ 12). « l'air des locomotives » : `ok` 1 (cylindres verts) ; « sept » : `fault` 1, les sept volants rouges, cercle `feutre-sept` sur `world.A.seven` (520 × 560) jusqu'à `fallait`+0,2 ; `#colonne` revient à « sept » (66 rouge), `psi` → 0 sur « seuls » : **22** ; punch « tiers ».
4. `defaut:Et#2 −0,14` — coupe sur le cylindre, caméra roulante, plus large et plus basse que `VIEW.cylindre` (`shift −90`, sous `#mano`) : `culprit` 3, rouge SUR « l'air », fuite `leak` 1 ; `#mano` 14 → 6 → 0 (SUR « vidait » le sabot se décolle : `psi` < 6) ; `mano` sorti à `tot7`−0,3.

## Couture de sortie
`run` 450 (≈ 90 u/s), `slack` 1, `psi` 0, `culprit` 3 (l'air, pas 4 : la voix nomme l'air), `fault` 1, `leak` 1, `col` 0, `mano` 0, `mark` 0.

## Planches lues (32 images : 4 planches de 8 — budget de 26 dépassé de 6, je m'en excuse)
- p1 : premier jet ; caméra à `tete` du journal convoi = deux véhicules seulement à l'image (le cadre vertical ne fait que ≈ 17° de large) → rangée vue de l'arrière-gauche en hauteur.
- p2 : rangée et cercle lisibles ; flou de bougé à 84,4 (cible qui glissait de 100 unités en 1,2 s, et lissage par segment qui freinait à chaque clé) → segments droits, cible plus lente.
- p3 : départ net ; cylindre final sous `#mano` à décaler → recadré.
- p4 : couverture (2 essais) et contrôle des plans 1 et 4.

## Un cran en dessous (franchement)
- **`#colonne` : le vide de la barre est VERT** (`kit/brand.css:178` `.bar { background: var(--veille) }` fuit dans `#colonne .bar`) : à « tiers » (22 t), la barre paraît presque pleine et verte. C'est le défaut le plus grave de l'acte, il ment sur le chiffre (vu aussi à 78,6 et 81,4) — voir « À changer ailleurs ».
- « l'air des locomotives » (86,2) : le vert des cylindres n'est que quelques points dans le plan roulant ; la phrase est un peu illustrée « à peu près ».
- Le sabot qui se décolle (92 → 93,4) : l'écart de 0,7 unité n'a pas été vérifié de près (budget images épuisé) ; le cylindre rouge, lui, se lit.
- Les volants rouges de la rangée sont de petits points : c'est le cercle qui dit « les sept ».

## Sons (pour le monteur-son)
- 76,46 coupe sur le cylindre + bouffée d'air (souffle 76,6 → 77,9).
- 81,9 la colonne vire au rouge (dans le souffle après « kilos », 82,0).
- 82,58 → 83,2 la roue repart : grincement du sabot / roulement qui démarre (souffle 82,9 → 83,27) ; 83,6 → 84,0 les attelages qui claquent un à un (souffle avant « Et ton essai »).
- 87,46 les sept volants rouges + cercle (souffle 87,0 → 87,2 trop court : plutôt 88,2, avant « seuls »).
- 88,5 l'air retiré de la colonne (chute), souffle 90,5 → 90,9 pour la sortie.
- 90,80 coupe sur le cylindre ; 91,4 → 91,7 l'air qui fuit (souffle 0,32 après « l'air… ») ; 92,0 → 93,2 le roulement qui accélère, sous la voix, discret.

## À changer ailleurs
- `episodes/CR04-lac-megantic/index.html`, ligne 38 : `#colonne .bar { position: absolute; left: 0; top: 0; width: 96px; height: 320px; border: 3px solid rgba(239, 234, 224, 0.45);` → ajouter `background: rgba(11, 7, 5, 0.55);` (sinon `.bar` de `kit/brand.css:178` remplit la colonne de vert).
- `docs/CR04-actes.md`, couture de sortie de l'acte 2c : `culprit` 3 (l'air), `run` ≈ 450 (et non 700).

## Couverture proposée
Repère `defaut:sept` + 0,84 (88,3 s). Pose : `lookFrom(onLoco(0, { run: 88, slack: 1 }, [-120, 300, 140]), onLoco(0, { run: 88, slack: 1 }, [320, 10, 0]), { fov: 30, shift: 0 })` (el ≈ 33). État : `culprit` 4, `fault` 1, lumière `lit(onLoco(0, { run: 88, slack: 1 }, [300, 10, 0]), 420)` : les sept volants rouges sur le halo orange, le train qui file en diagonale.

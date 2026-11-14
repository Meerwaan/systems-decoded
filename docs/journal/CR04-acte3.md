# CR04 · journal de `acte3.js` (t7 → issue, `tot7` 93,61 → `todepuis` 109,44)

2026-11-14. Réécrit en entier sur le squelette de l'architecte.

## Monté
1. **`tot7` → `t7:Au`−0,12 (93,61 → 98,94)** — coupe sur la locomotive de tête **en marche** dans la ville, la caméra la chevauche (clés toutes les 0,2 s sur la loi de `run`), devant-gauche et en hauteur, la cabine ouverte (`cab` 1) : le siège vide, sombre, sur « sans personne à bord ». Puis la caméra la lâche (après « bord ») : elle tourne d'abord vers l'avant (au-dessus de la voie, jamais au-dessus des toits), puis recule **par rapport** (d 125 → 620) et monte : le train entre les commerces éclairés, « entre dans Lac-Mégantic ». `#vitesse` 62 → 84 → 105 (sur « cinq »), punch sur « cent ».
2. **`t7:Au`−0,12 → `toissue` (98,94 → 101,77)** — le « 16 » de près, à droite du cadre (libre de `#vitesse`, `side` −150, `shift` −120), le train qui file derrière lui, flou ; les feux du passage à niveau (`cross` 1). Lente avancée (d −25, az −4). Punch sur « seize ». `speedo` → 0 juste avant la coupe.
3. **`toissue` → `enquete`−0,14 (101,77 → 105,89)** — la courbe de loin (`VIEW.courbe`, `shift` −60), recul lent. `run` 24 010 → 24 050 jusqu'à « déraille », puis `derail` 0 → 1 ET `run` 24 050 → 26 100 ensemble, même courbe (`sine.inOut`), de « déraille » à `morts`−0,1 (2,6 s au lieu de 1,4 : vitesse moitié — maj § 3). « s'embrase » : `glow` → 0,55 (lisible 0,4–0,6). `chip-bilan` de `morts`−0,2 à la coupe −0,2.
4. **`enquete`−0,14 → `todepuis` (105,89 → 109,44)** — **la pente vide à Nantes** : le rail là où était la première image, qui file jusqu'aux lumières de la ville et à la lueur au point de fuite ; la caméra monte et s'éloigne lentement. `chip-facteurs` de `facteurs`−0,35 à `todepuis`−0,2. Raccord : la fin recoupe sur le train garé au même endroit.

## Couture rendue à `fin.js`
Caméra à Nantes, voie vide (`onTrack(0, [4, 13, 15])` vers `[-330, 1.5, -8]`) ; état : `run` 26 100, `derail` 1, `glow` 0,55 (pas 1 : maj § 6), `cross` 0, `cab` 0, `culprit` 0, `fault` 0, `psi` 0, instruments éteints. La fin coupe sur `BENCHED` (tout y est redit).

## Planches (26 images lues, budget atteint)
- `a1` (8) : cabine trop près (un empilement de boîtes), passage à 96,6 illisible (la caméra frôlait les toits) ; ville à 98,3 bonne ; « 16 » bien lisible mais le train caché derrière ; déraillement et lueur bons.
- `a2` (8) : quatre cadres de cabine, quatre du « 16 » → « 16 D » (plaque à droite, train derrière) retenu.
- `a3` (8) : cabine encore grosse, 97,2 une dalle grise (un toit) ; la pente vide à Nantes : très bonne, lueur au point de fuite.
- `a4` (2) : cabine reculée (locomotive entière sur son halo, siège vide) et ville à 97,3 : bons.

## Un cran en dessous
- Pas revus après la dernière retouche : `shift` −70 du plan 1 (tiré à −150), le « 16 » à `shift` −120, et l'instant 96,0–96,9 du plan 1.
- La cabine ouverte ne montre qu'un siège ; le capot avant aux deux hublots se lit un peu comme un visage.
- Pendant le déraillement, les locomotives (≈ 1 200 u/s au plus fort) font une traînée claire au milieu du cadre (≈ 102,6–103,8) : c'est le flou de mouvement, pas une image parasite, mais à regarder sur le brouillon.

## Sons (pour le monteur-son)
- 93,49 l'horloge saute à 01:15 ; 93,61 coupe sur le train lancé, roulement continu sous t7 (dans les souffles : 94,3–94,78, 98,42–99,06).
- ≈ 99,1 la tête passe la caméra et le « 16 » : un passage (souffle 98,42–99,06 trop tôt : le placer juste avant 99,06 ou dans 101,42–101,89). Feux du passage à niveau qui clignotent à 0,9 Hz de 98,94 à 101,77.
- 101,18 punch « seize » → coup dans le souffle 101,42–101,89.
- 101,98 → 104,64 les citernes qui se couchent : impact dans le souffle 102,90–103,38.
- 103,86 « s'embrase » : la lueur monte → souffle 104,30–104,74.
- 105,89 coupe sur la pente vide : quasi-silence (le roulement s'arrête net) jusqu'à `todepuis`.

## À changer ailleurs
- `docs/CR04-actes.md`, couture de sortie de l'acte 3 : `**Couture de sortie** : la pente vide à Nantes (voie vide), `derail` 1, `glow` 0,55.` (info pour `fin.js`, qui coupe de toute façon sur `BENCHED`).
- `npm run check` : la seule erreur (`#col-mark` « 66 t » déborde de sa boîte, 87,72 s et 119,61 s) vient d'`index.html` / des actes 2c et fin, pas de l'acte 3 : `index.html`, règle de `#col-mark` → ajouter `white-space: nowrap; overflow: visible;` à sa boîte ou élargir `#col-mark`.

## Retouche du 14/11/2026
- **102,6 → 104 « Il déraille en plein centre » (traînée floue)** → plan 3 : caméra plus proche, en amont de la courbe (`lookFrom(T(23820, [0, 300, -320]), T(24380, [0, 0, 20]))`, fov 32, `shift` −40), lumière sur la pile (`lit(T(24350), 520)`) ; `derail` 0 → 1 et `run` 24 050 → 26 100 désormais linéaires jusqu'à `enquete`−0,34 (≈ 550 u/s au plus au lieu de 1 240). Les citernes se couchent nettes, les locomotives s'éloignent dans l'axe. `glow` 0,55 inchangé. Vérifié à 102,6 / 103,3 / 104,0 / 104,6 (planche) et 103,1 (quatre candidates).
- **96,0–96,9** : de 95,5 à 96,1 la caméra traversait une façade au bord de la voie (images beiges uniformes, une image normale à 95,7 au milieu : clignotement). → plan 1 : `el` + 16° montés entre `LET`−1,1 et `LET`−0,3, rendus à 0 avec `w` (la vue de ville finale ne change pas). Vérifié par mesure (moyenne / écart-type de la zone sujet) sur 12 instants de 94,9 à 96,6 : plus aucune image beige, valeurs continues ; 96,5 et 96,9 bons sur planche.
- **Le « 16 » à 100 s (`shift` −120)** : relu, bon (plaque lisible à droite, hors des boutons TikTok, train derrière) ; inchangé.
- La couture de sortie (plan 4) et `POSE0` / `FIRST` sont intacts. `npm run check -- CR04` passe.

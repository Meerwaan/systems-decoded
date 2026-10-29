# HS04 · acte 2 (voix v2, 27/10)

## Fait
- `src/acte2.js` gardé tel quel (identique à `v1/src/acte2.js`), recalé : la seule seconde en dur (`22.0`, début de `eclate` en v1) devient `t.eclate` (22,03 s en v2). Tout le reste lisait déjà les repères. `paid` = `reacteurs:nucléaires` (36,69 s) ; l'éclaté s'ouvre sur `explode` = `ouvre:on` (20,55 s).
- `episode.json` → `sfx` : les vingt `hit` / `swish` / `click` à secondes chiffrées (v1) sont passés en repères, chacun dans le souffle après le mot qui le motive (vérifié : aucun ne tombe sur un mot) :
  `accroche:fond$+0.05` · `promesse-0.2` · `promesse:240$+0.03` · `promesse:kilomètres$+0.04/+0.07` · `curiosite:reviens$+0.04` · `curiosite$+0.06` · `scene:hurlent$+0.04` · `scene:tremble$+0.03/+0.06` (swish 0,2 s) · `scene:pièce$+0.04` · `scene:pour$+0.02` (swish 0,18 s, avant « casser ») · `scene:roues$+0.03` · `ouvre$+0.04` · `eclate:gaulle/mètres/cylindres/piston/chariot$+0.03` · `vapeur-0.4`.
- Ajouté avant `cliff` : `drop` à `tir:casse` (`pre` 0,55) et `boom` à `tir:casse$+0.04` (50,37 s, gain −14), comme le L04 à `release`.
- `npm run voice -- HS04` sans `--budget` : aucun enregistrement, aucun coût annoncé (les 14 phrases viennent de la prise 2 sur le disque) ; `audio/bed.wav` refait à 18:15. La séance note « MÊME TON PARTOUT » et « reacteurs : pause non jouée » (à l'oreille de Merwan).

## Un cran en dessous
- `whip = t.roues + 0.05` (17,43 s) : la fouettée sous les roues part 2,3 s avant « Alors… », pendant « ce qui va t'arracher » — tenu de la v1 ; l'acte 1 v2 doit s'arrêter à `scene:roues`.

## À changer ailleurs
- `src/acte1.js` ligne 17 : `casse: "promesse:casse"` n'existe plus en v2 (« casse » est dans `tir`) → la page casse à t = 0 (`npm run check`) ; c'est l'acte 1 v2 qui le remplace (corrigé à 18:16 par son agent).
- `src/acte3.js` (encore v1, 21:13 la veille) : `test:pression` n'existe plus en v2 → page en erreur, `check` et `look` bloqués à 18:17 ; aucune image de l'acte 2 n'a pu être tirée.

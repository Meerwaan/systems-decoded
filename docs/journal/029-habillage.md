# 029 · `src/habillage.js` — journal du décorateur

2026-10-22. Lu : `docs/recette-decorateur.md`, `docs/029-actes.md`, journaux `029-pente.md`, `029-architecte.md`, `029-etat.md`, `plan.js`, `world.js`, `pente.js` (structure, `still`, `update`), `kit/lib/details.js`, `027/src/habillage.js` (les sapins : idiome repris).

## Planche avant (8, `--bare --no-zones`)
(a) accroche, (c) crackSide, side, ride, section, large (like), vallée, (b). Le vide : en (a) la moitié haute est un ciel noir — mais la pente, vue d'en dessous, a son horizon de fuite juste là : la crête et tout l'amont de la cassure s'y écrasent en une ligne. En (c), un horizon nu à gauche, sous le ciel. Le large : une pente sans échelle. La vallée : un chalet seul sur une grille.

## Posé (dans `still` : défile avec `travel`, suit `shell`)
1. **Les sapins** (merge de cônes ouverts, verre ink, renderOrder 22) — l'échelle d'une montagne et la forêt où finit un couloir : clairsemés de s 4 000 à 30 000, jamais dans le couloir (|x| < 3 000 avant la vallée) ni entre la caméra de la vallée et le chalet ; quelques-uns sur ta DROITE à 35–75 m (s 1 500–6 000, x −7 600 à −3 600) : derrière les caméras qui regardent depuis ta droite (coupe, side), au fond de (c) ; un bouquet autour du chalet (derrière et sur ses côtés). Vus : vallée (le chalet a enfin un lieu), (b), (c) bas-gauche.
2. **Un soleil bas d'hiver** (`makeDresser().glow`, 400 m, `size` 7 000, `k` 0,75, direction (−1 ; 0,08 ; 0,26)) — d'où vient la lumière clé (de l'aval, ta droite), juste au-dessus des crêtes lointaines. Vu en (c) seulement (et les plans qui regardent vers −x) ; derrière toutes les autres caméras.
Accroche dans `pente.js` : l'import, `const dress = dressSlope({ heightAt: mountain.heightAt })`, `still.add(dress.group)`, `dress.update({ shell }, time, px)` (4 lignes).

## Essayé puis retiré
- **Ta trace** (deux skis, virages enchaînés de la crête à 2,6 m au-dessus de la cassure, en fondu) et **la corniche** (deux lèvres de verre sur la crête, coupées au-dessus de toi) : invisibles dans tous les plans — en (a) l'amont s'écrase sur l'horizon de fuite, en side reculé il passe sous l'en-tête, le large ne monte pas jusqu'à la crête. Un coût sans image.
- **Les jalons de la piste** (x ≈ +3 900, tous les 30 m) : des points à cette distance ; un tombait dans l'en-tête du large, un autre se dressait en diagonale derrière la coupe (la démonstration).

## Contrôles (≈ 32 images lues, au-dessus des 24 : la planche de la coulée demandée en plus)
- Après : 8 (mêmes instants) + 4 en grand (540) + 4 avec l'en-tête et les zones (c, side reculé, large, coupe) : rien dans l'en-tête ni sous les boutons après retrait des jalons ; l'accroche (a) inchangée (rien de posé n'y entre).
- Coulée : 8 images à 1/30 s en (c), `travel` +10 cm par image : le soleil ne bouge pas, ne bave pas ; rien de l'habillage ne saute. (`look` tient l'état sur les seize instants : le vrai contrôle reste le brouillon + `qa`.)
- `npm run check -- 029` passe (65/65).

## Pas au niveau
- Le soleil, en (c), tombe à côté de tes genoux / de tes skis (décalé vers la gauche après la planche : 0,26 au lieu de 0,2, non revu en image). Si l'acte 1 retient (c) et qu'il gêne, le retirer (une ligne : `d.glow`).
- Le large (like) reste sans échelle : ses sapins sont hors cadre (couloir dégagé). L'accroche (a) n'est pas habillée : rien de juste à poser dans un ciel au-dessus de l'horizon de fuite.

## À changer ailleurs
- Rien d'obligatoire. Si (c) est la première image : `stage.air` autour du soleil (point monde = direction ci-dessus × 400 m, `amount` 2, `spread` 0,15, `floor` 0) — à juger sur planche avant/après, non essayé.

# 020 · Taipei 101 — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/020-actes.md`. Les décors sont rendus : `docs/journal/020-model.md`, `docs/journal/020-tour.md`.

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : la candidate C de la tour — toi debout au centre gauche (≈ 265 px), la boule énorme qui remplit la droite, ses strates, les vérins dessous, la pluie du typhon en signal. `FIRST` n'a pas bougé. Personne ne les change. La première seconde : la boule glisse derrière toi (`swing` avance, tout droit) — de centre-droit à centre-gauche en un demi-aller, c'est l'image la plus forte du décor.

## Les poses (elles ont été vues ; celles de `VIEW` étaient réglées sur des bouchons)

- Le système (`020-model.md`) : `whole` (d 6300 — le `VIEW.whole` d'origine, d 4700, met le haut du cadre derrière l'en-tête : il convient au plan resserré de la chute, pas à « le système entier »), `chute`, `exploded` (`plates: 1`, `fs` 900), `ball`, `cables`, `dampersBench` (`xray` 0,6), `swing`, le climax d'en haut et de trois quarts bas.
- **Le climax se joue sur une course NÉGATIVE** (`swing` pair) : le jeu qui reste entre la tige et l'anneau est alors du côté de la caméra. Sur une course positive il est derrière la tige et la phrase « la butée est à un mètre cinquante… et elle avance encore » n'a pas d'image.
- La tour (`020-tour.md`) : `VIEW.tower`, `low`, `top`, `cage`, `system` cadrent tels quels, mais dans `low` et `top` la couronne et la flèche passent dans l'en-tête : vise plus bas. `grip` (toi penché, les mains sur la barre) ne se lit que de profil : `{ ...P, tx: YOU.at[0] - 25, ty: CY + YOU.at[1] + 105, tz: YOU.at[2], d: 1400, az: -14, el: 2, fov: 36, shift: 60 }` (non vérifiée à cette distance : regarde-la). De `VIEW.you` (az −64) la flexion de la tour est écrasée.

## Ce qui n'est pas au niveau dans les décors, et comment le filmer

- **La pluie n'a jamais été vue en mouvement** : c'est le premier risque d'images parasites. `storm` 0,6 au plus dans les plans au grand angle ; pas de mouvement de caméra rapide quand elle remplit le cadre ; pas de coupe sur un plan où elle est le seul sujet.
- Toi, de loin, es un pictogramme : tu donnes l'échelle, tu n'es jamais le sujet d'un plan large. La vitre devant toi ne dit pas « vitre ».
- Dans la tour, la boule se filme de az ≈ −36 : de az −20 ou −60 une paire de colonnes passe devant elle. Sur l'établi, un V de deux brins passe devant la boule de az −32 à −40 : essaie un cadrage depuis un axe, ou accepte-le s'il est fin.
- Vue d'en haut, dans la tour, les planchers de verre voilent les fûts des vérins : pour « les vérins freinent », de trois quarts bas.
- L'éclaté est complet mais sage (boule ≈ 300 px) : `plates` (la pile de 41 plaques qui s'écarte) est le geste qui le sauve — joue-le sur « 41 plaques d'acier soudées ».
- `heat` (la brume au-dessus des vérins) est discrète, les colliers de `lock` petits : approche-toi pour « changent l'élan en chaleur » et pour « ses vérins la brident ».
- Le séisme (`quake`) n'a jamais été vu en mouvement : court, et jamais de près.
- La ville : des boîtes de verre. Elle n'est qu'un fond.

## Le rythme, et ce qu'on affiche

- À l'acte 3, « elle avance encore » est un seul demi-aller étiré : garde-le en UN plan, sans coupe — c'est la tension.
- Aucune longueur ne s'affiche sur le décor (la tour est une maquette au balancement exagéré). Les seuls chiffres : l'en-tête (la course, « Butée 150 cm ») et les étiquettes du plan.
- Rien ne casse, personne n'est blessé : la chute dit que la tour tient seule.

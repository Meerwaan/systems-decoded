# 021 · Veille du TGV — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/021-actes.md`. Les décors sont rendus : `docs/journal/021-train.md`, `docs/journal/021-model.md`. **La voix est enregistrée** (93,4 s) : les repères tombent sur les vrais mots, il n'y aura pas de passe de recalage.

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : la candidate (d), **au ras du rail**, `{ tx: -950, ty: 280, tz: 0, d: 1000, az: -60, el: -9, fov: 44, shift: 100 }`. Le nez de verre se lit tout de suite (capot long, phares bas, bogie), la cabine allumée et le siège vide derrière le pare-brise, le cadran vert du pupitre. `FIRST` n'a pas bougé. Personne ne les change. La première seconde : la caméra file avec le train et commence à remonter vers la cabine ; « Dans la cabine… plus personne » se dit DANS la cabine, sur le siège vide (pose `cab`).
- La candidate (b), le siège vide plein cadre, a été écartée pour la première image (de si près, il se lit comme un fauteuil de bureau) : elle sert de plan, pas d'ouverture, et pas plus de deux secondes.
- **L'azimut** : dans `stage.js` la caméra est en (sin az, cos az) — **az 0 = flanc GAUCHE (+z), az −90 = l'AVANT (−x), az +90 = l'ARRIÈRE (+x)**. `plan.js` et `021-actes.md` disent l'inverse par endroits : toute pose écrite « de côté » à az −72/−80 y est en fait de face. Les poses de `VIEW` ont été remplacées par celles des journaux, dans la bonne convention.
- Le relais a bougé : `RELAY.at = [-50, 64, 2]` (sur le boîtier ; à son ancienne place il masquait la pédale). Le bec du train : `POWER.nose = -1330`.

## Les poses (vues sur planche)

- Dans `VIEW` : `cab`, `seatBack`, `system` (d 210 pour garder le cadran), `side`, `train`, `pax` (de l'extérieur, de derrière la 1ʳᵉ remorque — celle prise de dedans sature l'image), `rail`, `traction`, `brakes`, `wide`, `roof`, `you`, et sur l'établi `whole`, `exploded` (**ne change pas son azimut −40** : les places de l'éclaté y sont réglées), `keysBench`, `dial`, `dialCab` (non vérifiée). D'autres dans les deux journaux.
- Couverture : `npm run cover` à `d` 420, `shift` −400 sur l'éclaté (à `d` 360 il descend trop bas).

## Ce qui n'est pas au niveau dans les décors, et comment le filmer

- **Les passagers** : de près, des « sucettes » ; de loin, des points. Les 393 se disent sur un plan large et bref (`pax` ou `train`), jamais sur un gros plan de têtes. Toi et ton téléphone (`you`) : de l'extérieur à travers la vitre, pas de très près.
- La rame de loin (`train`, `wide`) : un damier de vitres, non revu. Plans brefs.
- **L'angle mort** (`blind`) se lit, sans marge : ≈ 20 px à 270 px de large depuis `VIEW.system`. On le montre sur le cadran de près (`dial`, `dialCab`).
- La chaussure de verre (`foot`, `still`) se lit comme une chaussure ; l'écart vivante / inerte est discret : c'est le cadran qui continue de se remplir pendant qu'elle appuie qui dit « un corps effondré peut appuyer encore ».
- Le système est petit dans la cabine (≈ 150 px pour le relais et la valve depuis `system`) : ses gestes se lisent sur l'établi ou en gros plan.
- Les fils et les rails traversent tous les plans de cabine : c'est la perspective. Rien de clair ne doit passer derrière l'en-tête.
- Les anneaux radio (`radio`), le courant de traction à 0 : non revus après les derniers réglages — à regarder sur ta planche.

## Le tact

L'accident est réel et le conducteur est mort : jamais de chute, jamais de corps, jamais de silhouette qui tombe. « Le conducteur tombe du train » se dit sur la vitre vide (`side`), et rien d'autre ne bouge dans le plan que le train et la nuit.

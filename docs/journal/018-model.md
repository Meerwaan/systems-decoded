# 018 · `src/model.js` — la cocotte (journal)

Agent du 2026-10-14. Fichier : `episodes/018-cocotte-minute/src/model.js` (remplace le bouchon, même interface). 32 images lues sur 32 (planches dans le dossier temporaire `scratchpad/018/model-*.jpg`, rien dans `renders/`). Le build passe (`npm run look` : cinq planches tirées).

## Ce qui est construit

- **La cuve** : un tour (`lathe`) creux — fond épais sombre, paroi, bord roulé, six ergots (`sector`), la poignée (silhouette extrudée), **la butée** : pied riveté, jambe hors de la jupe, languette percée au-dessus du couvercle.
- **Le couvercle** : jupe, bandeau où la **fenêtre est vraiment découpée** (un secteur de 336°), cône, calotte plate ; six bossages dehors, **six ergots pleins dedans** (sous ceux de la cuve) ; sa poignée, au-dessus de celle de la cuve.
- **Le joint** : un anneau clair ; à la fenêtre son vertex shader le fait gonfler dehors (`leak` 0 → 0,5), puis sa lèvre se soulève (0,5 → 1).
- **La cheminée** (tube percé, buse sous le couvercle) et **le poids** moleté, qui bascule autour de son pied ; **la soupape de sécurité** sur son siège ; **la tige**, sa bague, son témoin veille.
- **Dedans** : l'eau (volume d'encre + surface qui se soulève + bulles), 240 lentilles (disques pleins, lit au repos, roulis lent quand ça bout), **la mousse** (UNE surface posée par son vertex shader, qui épouse le dessous du cône), **la vapeur prisonnière** (volume signal + peau chaude sous le couvercle + 18 traits qui battent), et le verre du couvercle qui prend la couleur du signal avec `seen` × `bar`.
- **Dehors** : trois jets de bouffées sans bord (racine petite et vive, traîne large qui se fond), une lueur veille dans l'interstice sous le poids et sous le clapet, une boule de lumière à la fenêtre.
- **Dans l'alésage** : un fil veille quand la vapeur passe (`whistle`, vu en `xray`), une colonne signal qui monte avec `clog` et sa tête de lumière.

## Écart assumé avec `docs/018-decors.md`

- **Le tube de la cheminée devient du verre avec `xray`** (la consigne dit « les soupapes restent pleines »). Raison : la mousse, opaque, cache la bouche de la cheminée vue d'en dessous ; dans un tube de verre, la colonne signal qui grimpe se voit — c'est l'image de « le trou se bouche ». Le poids, le clapet, la tige, le joint, les ergots et les poignées restent pleins.
- **Le couvercle tourne dans l'autre sens que le bouchon** (vers +z) : libre, sa poignée vient à +15° (celle de la cuve reste à −15°), du côté de la caméra à az −40 — dans l'autre sens elle se cachait derrière le couvercle et, de haut, se lisait comme une tige verticale.
- Les trois jets sont fixés à la cocotte, pas au couvercle : ils ne suivent pas ses 30° de rotation (sans objet : pas de vapeur couvercle libre).
- Le couvercle ne se bombe pas au-dessus de 1,3 bar (la consigne disait « peut »).

## Ce qui a raté, et pourquoi

1. Premier jet : gris écrits en linéaire (0,86 pour le poids) → sur l'établi tout le dessus brûlait en vert-blanc avec un halo. Trois passes pour descendre (paroi 0,33 · couvercle 0,37 · poids 0,52 · joint 0,5), acier brossé (`rough` 0,5, `env` 0,75), vernis des poignées presque retiré. Il reste un point chaud sur le dessus du poids, sur l'établi.
2. La mousse à 0,78 d'albédo lavait le gros plan en blanc → 0,5, émissif 0,07.
3. La vapeur prisonnière sortait rose pâle (mélange vers un orange clair + verre blanc par-dessus) → signal franc, densité doublée, verre du couvercle teinté.
4. Le jet du poids flottait 1 cm au-dessus de lui (ses bouffées naissaient DANS le poids, qui les cachait) → racine en couronne de 2,1 cm autour du pied.
5. L'éclat de la tige était invisible (au centre de la tige) → posé juste au-dessus de sa tête.
6. `half` est un mot réservé en GLSL (lentilles) : renommé avant le premier tirage.

## Les poses (toutes vérifiées sur planche)

`HX, HY, HZ` = `HOME`. Celles de `VIEW` qui tiennent telles quelles : `level`, `system`, `whole`, `exploded`, `valvePart`, `pinPart`, `window`, `windowSide`.

- **Première image, quatre candidates** (état : `FIRST` + `xray: 1, seen: 1`) :
  - A · `POSE0` tel qu'il est (az −64, d 150, fov 40) : sage, le jet s'arrête vers y ≈ 480.
  - **B (la meilleure)** · `{ tx: HX, ty: HY + 14.3, tz: HZ, d: 104, az: -64, el: 2, fov: 40, shift: 130, side: 70, roll: 0, drift: 0 }` : la cocotte en grand, les flammes dessous, le jet finit vers y ≈ 430–440.
  - C · `{ tx: HX, ty: HY + 13.3, tz: HZ, d: 200, az: -58, el: 10, fov: 28, shift: 150, side: 60, roll: 0, drift: 0 }` : longue focale, plus « produit ».
  - D · `{ tx: HX, ty: HY + 14.8, tz: HZ, d: 118, az: -70, el: -5, fov: 46, shift: 110, side: 60, roll: 0, drift: 0 }` : d'en dessous ; la hotte entre dans la zone de l'en-tête (la plus faible).
- **Le trou qui se bouche** : `{ ...P, tx: HX, ty: HY + 16.3, tz: HZ, d: 70, az: -38, el: 12, shift: 150 }`, `xray` 1, `foam` 1, `clog` 0 → 1 (plus près : d 48).
- **Couverture** : établi, `explode: 1, litValve: 0.8, litPin: 1, litSeal: 0.7, litSafety: 0.8` · `{ tx: 0, ty: 18, tz: 0, d: 215, az: -40, el: 28, fov: 28, shift: 60 }`.

## À changer ailleurs

- `world.js`, `FIRST` — si la première image doit montrer la vapeur qui pousse : `seen: 1,` et `xray: 1,` (aujourd'hui 0 et 0) ; et `POSE0` ← la candidate B ci-dessus.
- `world.js`, `VIEW.foam` (el −5, d'en dessous) : la mousse, opaque, y cache la buse — pour le bouchage, la pose « le trou qui se bouche » ci-dessus. `VIEW.safety` : depuis az −40 / −50 le jet du clapet passe DEVANT le poids ; le filmer de az −75 ou de az −10.
- `world.js`, commentaires de `twist` / `explode` : le couvercle libre tourne vers +z (poignée à +15°, tige à 100°, fenêtre à 220°).
- `plan.js`, `APART` — la colonne se lit, mais la tige et le clapet sont à la même hauteur et font 6 px à 405 px de large. Pour les détacher sans rallonger la colonne : `export const APART = { seal: 4.5, lid: 9.5, pin: 12.5, safety: 14.5, weight: 17.5 };`. Mieux : un plan par pièce (`valvePart`, `pinPart`) plutôt que de compter sur l'éclaté pour les petites.
- `episode.json` → `sources` : dire que le tube de la cheminée est montré en verre, et (déjà prévu) la tige qui monte dans une butée solidaire de la cuve.

## Ce qui n'est pas au niveau

- La vapeur prisonnière se lit comme **un couvercle qui rougit** plus que comme un volume profond : à `fill` 0,8 il n'y a que 2,7 cm entre l'eau et le bord. Les traits de poussée n'ont pas été regardés de près.
- Sur l'établi (`mood` 0), le dessus du poids reste un point chaud vert-blanc ; en `xray` le haut du couvercle fait une bande très claire (verre + joint).
- Les lentilles, de près, sont des confettis (des disques face caméra).
- La hernie du joint, de profil, est petite ; le jet de fuite, de trois quarts, est une boule devant la fenêtre.
- En cours d'éclatement, le couvercle traverse la languette de la butée pendant quelques images.
- **Jamais regardé** : le mouvement (tout est jugé à t = 0,04 s : la danse du poids, le battement des traits, la respiration des jets), `litBody` / `litLid` en verre, `clog2`, `fill` 1, `boil` 0 avec mousse, `off` avec `whistle`, les valeurs intermédiaires d'`explode`, `safety` seule en gros plan.

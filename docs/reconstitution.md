# Le noir chaud — la DA du Compte à rebours (CRnn), V3

Option du kit (`kit/lib/reconstitution.js` + bloc `[data-serie="compte-a-rebours"]` de `kit/brand.css`). Spec : `docs/recette-compte-a-rebours.md` « L'image ». Les dossiers et les longs n'en voient rien (036 : même verdict de `check` avant / après, 05/11).

**En une phrase** : même 3D studio que les dossiers ; reconnaissable par **le noir chaud ambre**, **l'horloge géante** et **le défaut rouge**.

**Pourquoi** (Merwan, 05/11) :
- V1 « reconstitution » sombre (argile sous lumière dure, noir neutre) : « ça ressemble encore trop à l'autre format ».
- V2 « table d'enquête sous la lampe » (fond kraft, plâtre, feutre, typos à empattements Fraunces / Courier Prime) : **refusée** — « C'est moche de fou et c'est plus de la 3D, j'aime pas du tout. T'es pas obligé de faire très différent, mais reconnaissable. » **Le papier / kraft et les typos à empattements sont écartés** ; on ne les reprend pas.
- V3 : la V1 en vraie 3D studio, et trois signatures. Puis, sur les couleurs : « **Vert quand c'est bon, rouge quand c'est l'incident.** »

Planches : `.cache/planches/CR01/v3/comparaison.jpg` (035 à 20 s | image 0 | défaut | depuis), `instants.jpg`, `image0.png`. Sauvegardes : V1 `.cache/CR01-da-sombre/`, V2 `.cache/CR01-da-claire/`.

## Le code couleur (05/11)
- **Vert veille #5CFFB0 = ce qui marche**, le système sûr : le réacteur stable au `principe`, les barres qui freinent normalement, la marge respectée, la correction de `depuis`. Les sous-titres `+mot+` et le nom du compte au verdict.
- **Rouge alarme #FF2D2D = l'incident** : le piège qui s'enclenche, la marge violée (8 barres contre 15), le défaut, l'emballement, l'explosion. **Une même pièce passe du vert au rouge à l'écran au moment où elle devient l'incident** : c'est le récit en couleur.
- **Ambre #FFB23E = le temps et l'ambiance** : l'horloge, la lumière chaude, le sol-grille, le halo.
- `ink` #EFEAE0 pour la structure et le texte. Rien d'autre.

## Ce qu'on voit
- **La 3D des dossiers** : la clé softbox du studio (`keySize` 2,5) et ses **ombres douces**, le contre-jour qui découpe les silhouettes, l'environnement (reflets), les arêtes fines claires, le sujet sur un halo. Rien de plat, rien de dessiné.
- **Signature 1 — le noir chaud** : fond #0B0705 (celui des dossiers est froid), clé ambre clair #FFDCBA, une `SpotLight` ambre #FFA648 sans ombre qui pose une flaque chaude sur le sujet et le sol, étalonnage aux ombres et hautes lumières réchauffées. Le sol est **celui des dossiers** (`makeSurface` : sol mat, grille fine, capteur d'ombre), **brun-noir #0D0805 avec une grille fine AMBRE** et un **halo ambre** sous le sujet. Toute l'image vire au chaud.
- **Signature 2 — l'horloge géante** : l'heure réelle au centre de l'en-tête, JetBrains Mono 800 à 106 px, ambre lumineux #FFC25A avec un halo ; elle saute à chaque étape (éclat ambre). Dessous le « T− » en rouge.
- **Signature 3 — le défaut rouge** : la pièce fautive **peinte en rouge alarme et lumineuse** (`alarm` brillant, `peak` 1,15), halo rouge au sol, et **un cercle rouge lumineux** tracé autour d'elle quand la voix la nomme (`feutre`, trait 11 px, lueur rouge).
- **Les maquettes** : argile grise satinée (`rough` 0,6, `env` 0,7 : elle prend le studio), arêtes claires 1,8 px.
- **`depuis`** : la lumière blanchit, la grille et le halo passent au vert, la pièce corrigée passe du rouge au vert.
- **Typo** : celle du compte — Barlow Condensed (sous-titres, capitales) + JetBrains Mono (HUD). Pas d'autre police.
- **Le grain** : fin, déterministe, 0,12. Pas d'habillage de plus (ni cadres, ni coins de viseur, ni faux bandeaux).

## L'API
- `RECON` : `papier` #EFEAE0 · `ambre` #FFB23E · `alarme` #FF2D2D · `veille` (BRAND) · `bg` #0B0705 · `clay`.
- Variables CSS du bloc CR : `--bg --papier --ambre --alarme`, `--ink` = papier, `--signal` = alarme, `--veille` = vert #5CFFB0 tout le film.
- `setupReconstitution(stage, { floor, dir, reach, cone, penumbra, cell, fade, poolRadius, grain, finish })` → `{ key, floor, grid, pool, halo({ at, r, amount, k }), grain.set(a), setMood(k), aim() }`. Garde la clé du studio (ombres douces, `keySize` de `createStage`) et la teinte ; ajoute la spot chaude qui suit `stage.focus` ; pose le sol des dossiers à l'échelle de `focus.scale` (sa grille reste fixe dans le monde) ; `halo()` rouge sous la pièce en défaut (vert une fois guérie).
- `world.apply` : `setOk(S.ok)` AVANT la mise à jour des décors ; écrire `stage.focus`, PUIS `recon.setMood(S.depuis)` (0 la nuit chaude → 1 `depuis`). Ne pas appeler `setMood` de `blocks.js`.
- `clay({ tone })`, `clayEdges(geo)` : argile satinée, arêtes claires.
- `alarm({ peak, okPeak })` + `setAlarm(mat, k)` : argile à 0, rouge lumineux à 1 ; **verte tant que `setOk` est allumé et qu'elle n'est pas en défaut**. `heal(mat, k)` : rouge → vert en passant par le sombre.
- `safe(mat, gain)` + `setOk(k)` : marque une matière du système qui marche (barres, absorbant) ; `setOk(k)` les allume en vert veille, avec toutes les pièces `alarm` qui ne sont pas en défaut.
- `feutre(D, { id, anchor, kind, w, h, dx, dy, from, to, draw, seed })` : le cercle rouge (`"circle"`, `"arrow"`, `"underline"`), SVG posé sur `anchor` à chaque image, tracé en `draw` s, levé à `to`, couleur `--alarme` avec une lueur. Un trait à la fois, jamais sur les sous-titres ni l'en-tête.
- `crHud(D, { clock, remain, tag, depuis, loopAt })` : heure qui saute avec un éclat ambre, T− en marches, `data-phase="depuis"` et `D.verdict`.
- CR01 : états `ok` (le système qui marche en vert : barres du cœur, absorbant du canal, pièces non fautives) et `viol` (la marge violée : les barres du tableau de la salle en rouge).

## Les règles
- **Vert = ce qui marche, rouge = l'incident, ambre = le temps.** Une seule pièce rouge à la fois, un seul cercle.
- **Le sujet est le plus lisible du cadre**, sur son halo ; un mécanisme de trois quarts.
- **Grain déterministe** : hachage du numéro d'IMAGE.
- Les overlays du kit écrivent leurs couleurs en ligne : le bloc CR les remplace par des sélecteurs d'attribut.
- L'en-tête tient de 214 à ≈ 412 (horloge 106 px à 40, T− à 168 : sinon l'audit les voit se chevaucher).

## Réglages essayés (V3, 05/11)
- Spot ambre à 2,4 et clé #FFC98E : toute l'image orange-brun, l'argile couleur caramel → spot 1,25, clé #FFDCBA, saturation 0,98, sol #0D0805.
- Horloge à 112 px : chevauche le T− à l'audit → 106 px.
- Le bas du cœur « un peu réchauffé » (V1) ne se lit pas : peint (0,5–0,8) dès l'image 0.
- V1 (banc 04/11) : `peak` 2,2 rend la barre rose ; azimut −55 à −80 met la face éclairée et l'ombre dans le cadre (vaut toujours).

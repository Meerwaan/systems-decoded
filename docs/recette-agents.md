# La recette des agents (chaîne courte)

Ce que reçoit tout agent qui modélise un décor ou un système, ou qui monte un acte. Celui qui orchestre y ajoute, dans sa consigne : le fichier dont l'agent est propriétaire, l'API à rendre, la liste fermée des images à réussir.

## Le cadre

- **Un fichier par agent.** Tu n'écris que dans ton fichier (et ton journal). Si quelque chose doit changer ailleurs — `plan.js`, `world.js`, le kit — tu l'écris dans ton journal sous « À changer ailleurs », avec la ligne exacte : celui qui orchestre l'applique.
- **Pas de sous-agent, pas d'audit, pas de relecteur.** Tu te relis sur tes planches.
- **45 images lues au plus** (une planche de 8 vignettes compte pour 8). Regarde peu, mais regarde bien : chaque planche répond à une question posée avant de la tirer.
- **Un journal sur le disque**, `docs/journal/<épisode>-<fichier>.md`, complété au fur et à mesure (ce qui est fait, ce qui a raté et pourquoi, les poses qui cadrent bien) : une coupure ne doit rien perdre.
- Tout se dit en français dans le journal et le message final ; le code et ses commentaires sont en anglais, comme le reste du dépôt.

## À lire avant d'écrire (et rien d'autre)

- `CLAUDE.md` : « Notre patte » et, dans « L'image », la liste « Pour que ça ne fasse jamais amateur » et « Net et fluide » — chaque règle vient d'une image ratée.
- `kit/lib/build3d.js` (matières `solid` / `glow` / `glass` + `asShell`, arêtes, `box` / `cyl` / `plate` / `lathe` chanfreinés, `makePart` / `addMesh` / `setPartOpacity` / `explode`, `fatLine`, `anchor`), `kit/lib/atmo.js`, et `kit/lib/figure.js` s'il y a un personnage.
- Le `plan.js` et le `world.js` de l'épisode : **le contrat**. `FIRST` est la liste fermée des nombres de l'état ; `apply()` montre comment ton fichier est appelé.
- Un fichier voisin du même genre, pour l'idiome : un système → `episodes/007-siege-ejectable/src/model.js` ; un décor aux rayons X → `episodes/006-defibrillateur/src/hall.js` ou `004-differentiel/src/room.js` ; un fond de ciel, des traînées → `episodes/007-siege-ejectable/src/jet.js` (lignes 340–520).

## Les règles qui ne se discutent pas

- Centimètres, Y vers le haut. Tout dépend du temps passé en argument (`time`) et de l'état : jamais d'horloge, jamais de `Math.random` (l'aléatoire est semé : `kit/lib/rng.js`). Ta fonction de mise à jour est appelée **seize fois par image** : pas d'allocation dedans, des uniformes et des transformations.
- Trois couleurs, et elles ont un sens : `ink` (structure), `veille` (le système vivant), `signal` (la menace). Rien d'autre.
- Le système est **plein** (trois valeurs de gris, arêtes fines, métal peu métallique : `metal` ≤ 0,5) ; ce qui l'entoure est **aux rayons X** (`glass` + `asShell`, traits fins, et pleins dedans les seuls éléments qui comptent). Pas de sol plein dans un décor aux rayons X : une grille.
- On distingue tout, tout de suite : si la vignette (405 px de large) ne se lit pas, c'est raté. Pas de trait sous 1,8 px ; rien de fin qui défile vite ; ce qui émet se dose (au-dessus de 3, ça bave) ; une lumière a un endroit (un cœur brillant, une longue traîne), jamais un voile.
- Dans un shader : borner avant `pow`, `sqrt`, une division. Un pixel impossible devient une dalle noire d'une image.
- Chaque pièce qui peut s'effacer a ses propres matières.

## Regarder

```
npm run look -- <ep> --file <essais.json> --out <dossier temporaire>/<ep>-<toi>.jpg --bare --cols 4
```

`essais.json` : `[{ "at": 0.02, "label": "…", "pose": { caméra, partielle ou complète }, "state": { nombres de l'état tenus pour cette image } }, …]`. `--bare` : la 3D seule ; sans lui, l'en-tête et les zones de TikTok sont dessinés (à faire au moins une fois : le sujet tient entre y ≈ 440 et 1160, rien d'important sous 1600, l'en-tête couvre 236–410). `--out` : ta propre planche, deux agents ne s'écrasent pas — **jamais dans `renders/`** : Merwan voit ce dossier, et une image d'échafaudage prise pour le film lui a fait écrire « on est un niveau, même vingt, en dessous » (2026-10-08). Planches et `essais.json` vont dans le dossier temporaire que donne la consigne, pas dans le dépôt.

Si le build échoue dans un fichier qui n'est pas le tien, c'est qu'un autre agent est en train de l'écrire : attends trente secondes et relance.

Une pose : `{ tx, ty, tz, d, az, el, fov, shift, side }` — le point visé, la distance, l'azimut et l'élévation en degrés (`el` négatif : la caméra regarde vers le haut), `shift` / `side` en pixels (l'image poussée vers le haut / la gauche). La lumière clé vient de −x, +y, +z : on filme le plus souvent avec `az` entre −20 et −70.

## La barre

Chaque dossier doit montrer quelque chose que le précédent ne savait pas faire : le niveau de finition attendu est celui du dernier épisode rendu, **au-dessus**. Une image seulement « correcte » se refait avant de passer à la suivante.

## Ce que tu rends

Le fichier, qui passe au build ; et un message final de **quinze lignes au plus** : ce qui est construit ; chaque nombre de l'état et ce qu'il fait chez toi ; les poses qui cadrent le mieux, prêtes à coller ; ce qui n'est pas encore au niveau, dit franchement (un plan faible signalé se rattrape, un plan faible caché sort dans le film).

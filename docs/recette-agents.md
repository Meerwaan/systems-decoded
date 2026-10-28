# La recette des agents (chaîne courte)

Ce que reçoit tout agent qui modélise un décor ou un système, ou qui monte un acte. Depuis le 27/10, chaque rôle est un **type d'agent** défini une fois dans `.claude/agents/` (`architecte`, `decor`, `decorateur`, `acte`, `chapitre`, `retoucheur`, `faits`, `scenariste`, `contre-verif`, `chef-de-production` ; le `scenariste` ne modélise rien : sa recette est `docs/recette-script.md`, sa chaîne `docs/salle-d-ecriture.md`) qui renvoie ici : la consigne de celui qui orchestre ne dit plus que le dossier, le fichier et deux ou trois lignes propres au dossier — l'API à rendre et la liste fermée des images à réussir sont dans `docs/<ep>-decors.md` et `docs/<ep>-actes.md`, écrits par l'architecte. La chaîne entière : `docs/chaine-optimisee.md`.

## Le cadre

- **Un fichier par agent.** Tu n'écris que dans ton fichier (et ton journal). Si quelque chose doit changer ailleurs — `plan.js`, `world.js`, le kit — tu l'écris dans ton journal sous « À changer ailleurs », avec la ligne exacte : celui qui orchestre l'applique.
- **Pas de sous-agent, pas d'audit, pas de relecteur.** Tu te relis sur tes planches.
- **30 images lues au plus** (une planche de 8 vignettes compte pour 8 ; actes 26, décorateur 24, architecte 25, retoucheur 12 — le budget de chaque type est dans sa définition). Regarde peu, mais regarde bien : chaque planche répond à une question posée avant de la tirer.
- **Un journal sur le disque**, `docs/journal/<épisode>-<fichier>.md`, complété au fur et à mesure (ce qui est fait, ce qui a raté et pourquoi, les poses qui cadrent bien) : une coupure ne doit rien perdre.
- Tout se dit en français dans le journal et le message final ; le code et ses commentaires sont en anglais, comme le reste du dépôt.

## À lire avant d'écrire (et rien d'autre)

- `docs/memoire/regles-image.md` : « Pour que ça ne fasse jamais amateur » et « Net et fluide » — chaque règle vient d'une image ratée. (« Notre patte » est dans `CLAUDE.md`, déjà dans ton contexte : ne le relis pas.)
- `kit/lib/build3d.js` (matières `solid` / `glow` / `glass` + `asShell`, arêtes, `box` / `cyl` / `plate` / `lathe` chanfreinés, `makePart` / `addMesh` / `setPartOpacity` / `explode`, `fatLine`, `anchor`), `kit/lib/atmo.js`, et `kit/lib/figure.js` s'il y a un personnage.
- Le `plan.js` et le `world.js` de l'épisode : **le contrat**. `FIRST` est la liste fermée des nombres de l'état ; `apply()` montre comment ton fichier est appelé.
- `docs/catalogue.md` : ce qui existe déjà (décors, systèmes, habillages) — ce qu'on réutilise ne se modélise pas.
- Un fichier voisin du même genre, pour l'idiome : un système → `episodes/007-siege-ejectable/src/model.js` ; un décor aux rayons X → `episodes/006-defibrillateur/src/hall.js` ou `004-differentiel/src/room.js` ; un fond de ciel, des traînées → `episodes/007-siege-ejectable/src/jet.js` (lignes 340–520).

## Les règles qui ne se discutent pas

- Centimètres, Y vers le haut. Tout dépend du temps passé en argument (`time`) et de l'état : jamais d'horloge, jamais de `Math.random` (l'aléatoire est semé : `kit/lib/rng.js`). Ta fonction de mise à jour est appelée **seize fois par image** : pas d'allocation dedans, des uniformes et des transformations.
- Trois couleurs, et elles ont un sens : `ink` (structure), `veille` (le système vivant), `signal` (la menace). Rien d'autre.
- Le système est **plein** (trois valeurs de gris, arêtes fines, métal peu métallique : `metal` ≤ 0,5) ; ce qui l'entoure est **aux rayons X** (`glass` + `asShell`, traits fins, et pleins dedans les seuls éléments qui comptent). Pas de sol plein dans un décor aux rayons X : une grille.
- On distingue tout, tout de suite : si la vignette (405 px de large) ne se lit pas, c'est raté. Pas de trait sous 1,8 px ; rien de fin qui défile vite ; ce qui émet se dose (au-dessus de 3, ça bave) ; une lumière a un endroit (un cœur brillant, une longue traîne), jamais un voile.
- Dans un shader : borner avant `pow`, `sqrt`, une division. Un pixel impossible devient une dalle noire d'une image.
- Chaque pièce qui peut s'effacer a ses propres matières.

## Économie de contexte (27/10)

Ce que coûte un agent, c'est **son contexte relu à chaque appel** : tout ce que tu lis ou écris reste dans ton contexte jusqu'à la fin et se repaie à chaque appel suivant. Le chiffre de jetons qu'affiche la notification de fin est la taille de ce contexte à la fin (≈ 300 à 600 k pour un décor ou un acte) ; la consommation réelle de la fenêtre de 5 h suit à peu près « appels × contexte moyen ». D'où :

- **Lis des têtes, pas des fichiers** : d'un fichier du kit ou d'un décor voisin, `grep -n "^export"` et le commentaire de tête, puis `Read` avec `offset` / `limit` sur la seule fonction utile. D'un plan (`docs/<ep>-actes.md`, `docs/<ep>-decors.md`), le haut commun et **ta section** (`grep -n "^## "`, puis `Read` ciblé) — au L04, le plan des chapitres faisait 98 Ko, ≈ 28 k jetons pour chacun des six agents.
- **N'écris pas deux fois le même gros fichier** : une à trois `Write`, puis des `Edit`. Ne relis pas un fichier après l'avoir modifié (l'outil le garde à jour).
- **Peu d'appels, chacun utile** : construire et regarder dans la même commande ; une planche de 8 répond à plusieurs questions ; pas de `check` après chaque retouche, un à la fin. Budget visé dans la définition de chaque type (décor 45 appels, acte 40, retoucheur 20).
- **Une image coûte peu, mais reste** : une planche est UN fichier (≈ 1,6 k jetons quelle que soit sa taille : au-delà de ≈ 1 568 px de large elle est réduite avant lecture). Une planche de 8 vignettes à 270–405 px se lit ; une planche de 28 sur 4 600 px arrive à ≈ 110 px par vignette — on n'y voit plus ce qu'on cherche.
- **Ton dossier temporaire** : celui de ta consigne, sinon `.cache/planches/<ep>/<ton fichier>/` (ignoré par git, invisible pour Merwan). Jamais `renders/` (sans `--out`, `look` écrit dans `renders/`).

## Regarder

```
npm run look -- <ep> --file <essais.json> --out <dossier temporaire>/<ep>-<toi>.jpg --bare --cols 4
```

`essais.json` : `[{ "at": 0.02, "label": "…", "pose": { caméra, partielle ou complète }, "state": { nombres de l'état tenus pour cette image } }, …]`. `--bare` : la 3D seule ; sans lui, l'en-tête et les zones de TikTok sont dessinés (à faire au moins une fois : le sujet tient entre y ≈ 440 et 1160, rien d'important sous 1600, l'en-tête couvre 236–410). `--out` : ta propre planche, deux agents ne s'écrasent pas — **jamais dans `renders/`** : Merwan voit ce dossier, et une image d'échafaudage prise pour le film lui a fait écrire « on est un niveau, même vingt, en dessous » (2026-10-08). Planches et `essais.json` vont dans le dossier temporaire que donne la consigne, pas dans le dépôt.

Si le build échoue dans un fichier qui n'est pas le tien, c'est qu'un autre agent est en train de l'écrire : attends trente secondes et relance.

Une pose : `{ tx, ty, tz, d, az, el, fov, shift, side }` — le point visé, la distance, l'azimut et l'élévation en degrés (`el` négatif : la caméra regarde vers le haut), `shift` / `side` en pixels (l'image poussée vers le haut / la gauche). La lumière clé vient de −x, +y, +z : on filme le plus souvent avec `az` entre −20 et −70.

## La première image (règle du 2026-10-21)

Les courbes TikTok du 015 (≈ 100 k vues) et du 012 (15 k) disent la même chose : « la plupart ont cessé de regarder à 0:01 ». Le 015 garde 59 % à 0:07 et ≈ 40 % vers 0:23, le 012 52 % à 0:09 et ≈ 27 %. Ce que l'image 0 du 015 (le Rafale de dos, ses deux tuyères, les étincelles, le brin vert en travers) a, et celle du 012 (la casserole et sa mousse) n'a pas :

1. **Un événement déjà en cours, pas un état.** L'avion touche le pont dans une gerbe d'étincelles ; la casserole est posée, sa mousse immobile. Dans l'image 0, quelque chose agit et laisse une trace d'énergie (étincelles, traînées, phares qui foncent).
2. **Une perspective qui tire l'œil.** Caméra basse, lignes qui filent vers un point de fuite proche du sujet : la vitesse se lit sans le son. Le 012 est vu de trois quarts haut, comme une fiche produit.
3. **La menace derrière le sujet.** L'horizon signal derrière l'avion, qui s'y découpe ; au 012 le rouge est caché sous la casserole, et la masse claire (la mousse) ne dit aucun danger.
4. **Une forme que tout le monde reconnaît en un tiers de seconde**, vue d'où on ne la voit jamais (de dos, au ras du pont), grande : 40 % de la largeur au moins.
5. **Le système déjà là, petit mais lisible** — le brin vert en travers du pont : la promesse du film, sans légende.
6. **Elle bouge dès l'image 1, par son sujet.** Le « rythme » de `qa` sur la première demi-seconde : 9,8 au 015 (c'est l'avion qui fonce), 3,3 à 3,7 aux 010, 013, 014, 1,4 au 025. Une poussée de caméra seule ne suffit pas : le sujet, ou un premier plan, traverse le cadre.

Sur la planche des quatre candidates, chacune est notée sur ces six points ; celle qui en coche le moins sort, même belle. Les options du plateau (ci-dessous) ne rattrapent pas une composition : sur l'accroche du 025, elles n'ont rien apporté de net à 270 px et n'y sont pas.

## L'image d'un studio : les options du plateau (depuis le 2026-10-21)

Trois options de `kit/lib/stage.js`, éteintes par défaut : un film qui ne les demande pas est dessiné exactement comme avant (vérifié octet pour octet sur le 015). Merwan, devant le 025 : « la version là est déjà très bien » — **une option n'entre dans un film que si la planche avant / après montre un gain net à l'œil ; dans le doute, rien**.

- **L'optique (`dof`)** — une profondeur de champ par accumulation : chaque instant de l'obturateur voit la scène d'un autre point de l'objectif, sans passe de plus. C'est un nombre de pose (`cam.dof` : le flou, en pixels, de ce qui est très loin derrière le point visé ; `cam.focus` : où tombe la mise au point, en fraction de `d` — 1 le point visé, 0 `stage.focus`). **On la donne aux gros plans** (une pièce qu'on nomme, la caméra à quelques fois sa taille) : 6 à 8, jamais plus de 10 (les seize instants se séparent alors en copies). **Jamais** sur un plan large, une vue éclatée, une carte vue de haut, une chute : tout s'y lit d'un bord à l'autre. Dans `world.js`, chaque pose dit son optique — `const P = { …, dof: 0 }`, et `const CLOSE = { dof: LOOK.dof }` étalé dans les seules poses de gros plan (`unit: { ...P, ...CLOSE, … }`) — : une coupe n'hérite jamais du flou du plan d'avant, et la boucle revient sur `POSE0` avec le sien. Sur le 025 : le bloc ESP net, le disque de frein du premier plan et les traits du fond fondus — l'œil va où va la voix.
- **La matière (`finish`)** — le grain d'usinage (des anneaux le long de l'axe de la pièce, trois au centimètre) et des traces de main qui cassent le reflet des pièces pleines du kit (`solid()`), effacés avant de devenir plus fins que quatre pixels. Se voit en plein écran sur un gros plan, pas sur une vignette. `material.userData.finish = false` garde une pièce nue (un cadran, un écran). Si `qa` trouve une image parasite sur une pièce qui bouge, c'est la première à éteindre.
- **L'air (`air`)** — la lumière qui reste dans l'air **derrière** le plan net (la profondeur de l'image le dit) : rien devant le sujet, presque rien sur lui, un halo serré autour d'une source (`stage.air.source` : un point du monde, une lampe, des phares). Pour un vrai contre-jour seulement (l'horizon signal du 015). Essayé sur le 025 : sur l'accroche (les phares sous la pluie), pas de gain net à 270 px ; sur l'établi, il grise le vert — **éteint**. `floor` reste à 0 : au-dessus, c'est un voile.
- **L'interrupteur, une ligne** — dans `world.js` : `export const LOOK = { dof: 8, air: 0, finish: 1, ...(typeof window !== "undefined" ? window.__SD_KIT : null) };`, et dans `main.js` : `createStage($("stage"), { scale: SIZE, far: …, keySize: 2.5, ...LOOK })`. `{ dof: 0, air: 0, finish: 0 }` rend le film d'avant.
- **Juger** — `SD_KIT='{"dof":0,"air":0,"finish":0}' npm run look -- <ep> --file … --out …` tire l'avant, la même commande sans `SD_KIT` l'après (sous PowerShell : `$env:SD_KIT='…'`, puis `Remove-Item Env:SD_KIT`). Dans `essais.json`, `"kit": { "dof": 8, "finish": 1 }` essaie un réglage sur une image seule (une pose, la matière ; l'air d'un film dont le monde le règle à chaque image, non). `look` affiche ce qu'une image coûte à dessiner (médiane, en ms).
- **Ce que ça coûte** — aucune passe de plus ; `finish` ajoute un peu de calcul sur les pièces pleines. Mesuré dans `look` sur le 025 (carte graphique partagée, mesure bruitée) : ≈ +10 à +20 % par image.

## La barre

Chaque dossier doit montrer quelque chose que le précédent ne savait pas faire : le niveau de finition attendu est celui du dernier épisode rendu, **au-dessus**. Une image seulement « correcte » se refait avant de passer à la suivante.

## Ce que tu rends

Le fichier, qui passe au build ; et un message final de **quinze lignes au plus** : ce qui est construit ; chaque nombre de l'état et ce qu'il fait chez toi ; les poses qui cadrent le mieux, prêtes à coller ; ce qui n'est pas encore au niveau, dit franchement (un plan faible signalé se rattrape, un plan faible caché sort dans le film).

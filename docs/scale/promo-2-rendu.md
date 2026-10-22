# Agent 2 (promos) — rendu et design des hors-séries (2026-10-21)

Mission : qu'une promo ait l'allure d'une vraie bande-annonce et que son appel donne envie de cliquer. En cours de route, le message de Merwan (« ils font des stats de merde sauf insta ») a remis la priorité : **ce qui fait tenir une promo comme un vrai court, avant le cartouche**. Le rapport suit cet ordre.

## En bref

- **Les deux promos s'ouvrent sur les images les plus immobiles du compte** : mouvement de la première demi-seconde 0,4 (HS01) et 0,2 (HS02), contre 9,8 au 015 et 1,3 au 012, notre plus faible ; HS02 ne bouge presque pas pendant ses quatre premières secondes. Aucune des deux premières images ne vaut celle de nos meilleurs courts (règle des six points : une sur six pour HS01, deux pour HS02).
- **Le recadrage du 16:9 laisse des sujets illisibles** : entre 10 et 45 s, un plan sur quatre se lit à 270 px sur HS01, deux sur quatre sur HS02. Ce qui casse : les plans larges du long (la chaîne vue de haut, le treillis d'un pylône, des jambes de verre) ; ce qui tient : les objets pleins de près (l'isolateur, la chambre de coupure).
- **Deux secondes de noir avant l'appel** (« Pas ici » : 2,2 s et 1,9 s, à 80 % du film) : sur TikTok, un écran noir dit « fin ». C'est l'endroit le plus « publicité » du film, avec le panneau encadré qui suit.
- **Essais** : une première image construite sur les six points se trouve dans chacun des deux longs (l'arc dans sa chambre pour HS02, l'objet même de sa miniature ; le mannequin projeté vers le pare-brise intact pour HS01) ; l'optique (`dof`) n'apporte rien à 270 px ; un cartouche sans cadre (`filmTitle`) et une étiquette pleine pour la couverture sont prêts, en option.
- **Ce qui change** : `kit/lib/blocks.js` (`filmTitle`, une nouvelle fonction ; `filmCall` intact au caractère près), `kit/brand.css` (`#film.is-titre`, inerte sans la classe), `scripts/cover.mjs` (options d'une couverture de court : `tagStyle`, `tagTone`, `tagSize`, `foot`), et la recette `docs/recette-promo-image.md`. HS01 et HS02 ne sont ni modifiés ni rendus à nouveau.

## 1. Le diagnostic (16 images, plus trois mesures sur les MP4 publiés)

Planches `diag-HS01.jpg`, `diag-HS02.jpg` : image 0, 0,5 s, quatre plans entre 12 et 42 s, le cartouche, la dernière image.

**La première image, sur six points** (un événement en cours · perspective basse · menace derrière · forme connue sur 40 % de la largeur · système déjà là · elle bouge par son sujet) :

- **HS01** — la tête de verre dans la toile, de trois quarts face. Un état (le choc a déjà eu lieu, `crash` et `lunge` figés), à hauteur d'œil, rien derrière, une boule qui luit plutôt qu'une tête, le pare-brise là (✓), la toile qui s'ouvre en traits fins. Grise : aucune des trois couleurs ne porte le sujet. **1 / 6.**
- **HS02** — la tête du détecteur accrochée au conducteur, la voisine en signal derrière (✓), le conducteur là (✓) ; mais une forme que seuls les électriciens connaissent, une perche de verre blanche qui barre le cadre en diagonale, et rien ne se passe. **2 / 6.**

**Mesures** (fonction `rhythm` de `scripts/qa.mjs`, lue sur les MP4 publiés sans rien écrire ; `blackdetect` de ffmpeg) :

| | 1re demi-seconde | Plages lentes avant 25 s | Noir |
| --- | --- | --- | --- |
| HS01 | 0,4 | 8–11 s | 2,2 s sur « Pas ici » (+ 0,27 s à 15 s) |
| HS02 | 0,2 | 0–4 s, 6,5–10,5 s, 22–24,5 s | 1,9 s sur « Pas ici » (+ 0,53 s à 47 s) |
| 015 (référence) | 9,8 | aucune | 0,17 s |
| 012 (le plus faible) | 1,3 | 2–5 s, 8,5–10,5 s | — |

**Le recadrage, de 10 à 45 s, à 270 px** : HS01 — lancement (la chaîne vue de haut : une dalle verte et un bloc noir, illisible), four et flotte (des aplats orange : la couleur tient, pas l'objet), bande (un coin de verre gris, lisible de justesse). HS02 — champ (isolateurs et conducteurs signal : lisible), arc (la chambre en coupe : lisible), gravier (deux jambes de verre sur fond sombre : illisible), test (le treillis sur du noir : vide).

**Le cartouche** : lisible (titre 96 px), dans la charte ; mais un panneau encadré, une barre de progression et « Sur YouTube · Lien en bio » sur un plan large aux rayons X, juste après deux secondes de noir et pendant que la voix dit « notre chaîne YouTube » : c'est une fin de publicité.

**Les couvertures** (`grille-avant.png`, la grille d'un téléphone, recadrage 3:4) : l'étiquette grise « HORS-SÉRIE 0X » ne se lit pas à cette taille. HS02 se détache par sa couleur (l'arc orange parmi les dossiers verts) ; HS01 (une boule grise) se confond avec les dossiers.

## 2. Les essais (`look`, `cover`, sans toucher aux sources)

- **La première image** (`img0.jpg`, quatre candidates par promo, `look --file` avec pose et état) :
  - HS01 B — de profil, un peu bas, la tête à vingt centimètres du verre intact (`lunge` 0,78, `web` 0) : une silhouette entière projetée vers le pare-brise, reconnue tout de suite ; le choc arriverait dans les premières images, par le sujet. La meilleure des quatre. C (contre-plongée dehors) : moyen. D = B avec `dof` 5 : identique à 270 px.
  - HS02 C — l'arc dans la chambre (la miniature du L02) : un événement en cours, une lumière qui a un endroit, le signal, lisible d'un coup d'œil. La meilleure, de loin. B (la tête plus grosse, plus bas) : pose manquée, le détecteur sort du cadre. D (plus large, la voisine derrière) : le détecteur minuscule.
- **Le plateau** : `dof` 5 sur la meilleure candidate de HS01 ne change rien à 270 px ; `finish` et `air` restent éteints comme sur le long (essais du 21/10 : ils n'apportent rien ou tachent). **Aucune option `LOOK` n'est proposée pour les promos.**
- **Le cartouche** (`call.jpg` : avant / option, deux instants par promo ; `cov-call.jpg` : la version retenue) : `filmTitle` enlève le cadre et le fond, fait du titre un carton de fin de bande-annonce (HS01 « TON PARE-BRISE » 140 px sur une ligne, HS02 « COUPÉE, MAIS ENCORE MORTELLE » 112 px sur deux), sur la scène qui continue, un trait qui se dessine sous lui, « Sur YouTube · Lien en bio » en 34 px (au premier essai, en 27 px gris, il se lisait moins bien qu'avant : corrigé). Le titre se lit mieux qu'avant, la scène reste devant ; le gain est réel mais modeste — ce n'est pas lui qui fera tenir la promo.
- **La couverture** (`cov/HS01-solide.png`, `cov/HS02-solide.png`, `grille-apres.png`) : l'étiquette pleine fait un bloc vert visible dans la grille ; le texte de `foot` (« Film complet · 8 min 51 ») ne se lit qu'en grand. Le levier le plus fort reste l'image : une couverture de hors-série au signal se détache, une grise non.

## 3. Ce qui change dans le kit (en option ; ce qui existe rend à l'identique)

- `kit/lib/blocks.js` — **`filmTitle(tl, { showAt, hideAt })`**, exportée à côté de `filmCall`, appelée **à sa place** dans le `fin.js` d'une promo (une ligne). Même balisage (`#film` du modèle), mêmes instants ; elle ajoute la classe `is-titre`, fixe la taille du titre d'après sa longueur (jamais mesurée : les polices peuvent ne pas être chargées), fait monter le titre hors d'un masque, dessine le trait, puis la ligne « Sur YouTube », allume le nom du compte et porte `#title-shade`. `filmCall` est intacte au caractère près (une ligne de commentaire en plus).
- `kit/brand.css` — `#film.is-titre` et ses enfants : sans la classe, rien ne s'applique.
- `scripts/cover.mjs` — `shortExtra(cfg)` pour une couverture de court : `tagStyle: "solid"` (l'étiquette remplie de `tagTone`, veille par défaut), `tagSize`, `foot` (la ligne sous le titre à la place du nom du compte). Sans ces clés, le style est celui d'avant (chaîne vide ajoutée, `foot` nul → le nom du compte). `--thumbs essais.json --out <dossier>` marche pour un court (essais sans toucher `episode.json`).

**Essayé puis retiré** : une première version passait l'option par `filmCall({ style: "titre" })` et par `SD_KIT='{"film":"titre"}'` (pour l'essayer sur un film sans le toucher : c'est ainsi que `call.jpg` a été fait). Même éteinte, elle changeait de façon déterministe une image de HS01 (56,3 s, le cartouche à l'écran) d'un écart invisible (48 dB, jusqu'au dernier bit des pixels de toute l'image) ; ajouter les mêmes fonctions sans toucher au corps de `filmCall` ne changeait rien. D'où la forme finale : une fonction à part, `filmCall` intacte.

## 4. La preuve que rien ne change pour les films existants

- **HS01** (56,3 s, le cartouche à l'écran, et 62 s, la boucle) : rendu sans mes ajouts (deux fois), avec la forme finale : **identiques au bit près** (empreinte `effe0717` les trois fois).
- **025** (8 instants : 0,04 · 20 · 40 · 60 · 75 · 82 · 86 · 90 s, dont les appels à l'action) : sans mes ajouts / avec : 7 images sur 8 identiques au bit près, la huitième à 48–49 dB. **Deux rendus du même code donnent le même écart** (avec / avec : 48,07 et 49,42 dB, sur deux images différentes ; la carte graphique, d'un lancement à l'autre, sur les images les plus chargées) : c'est le bruit de la machine, pas le code. Le tout premier contrôle (avant toute modification / après la première version) était identique au bit près sur les 8 images.
- **Couvertures** : sans les nouvelles clés, `STYLE + ""` et le nom du compte : identiques par construction (non rendues à nouveau : `renders/` n'est pas à moi).

## 5. Ce que Merwan tranche (oui / non)

1. **Pour HS03 : la première image choisie sur une planche de quatre où figure l'objet de la miniature du long, un événement en cours qui bouge par son sujet, ≥ 5 au mouvement de la première demi-seconde** (HS01 0,4, HS02 0,2, le 015 9,8). Mon avis : oui — c'est le premier levier, avant tout le reste.
2. **Le noir de « Pas ici » ramené à une demi-seconde au plus** sur les prochaines promos (le gag reste ; c'est l'écran noir de deux secondes qui ressemble à une fin). Mon avis : oui ; à décider avec le rapport de l'agent 3 (rétention).
3. **Chaque plan de promo sur un objet plein, sur 40 % de la largeur au moins** (les plans larges du long ne passent pas le recadrage). Mon avis : oui.
4. **Le cartouche sans cadre (`filmTitle`) à la place du panneau**, à partir de HS03. Mon avis : oui, mais c'est un gain modeste : il ne compense pas une ouverture immobile.
5. **L'étiquette pleine sur la couverture des hors-séries** (`"tagStyle": "solid", "tagSize": 50, "foot": "Film complet · 8 min 51"`), et une image de couverture au signal. Mon avis : oui.

HS01 et HS02 restent tels qu'ils sont publiés : rien n'est rendu à nouveau.

## 6. À changer ailleurs (pas mes fichiers)

- `.claude/agents/promo.md` : lire `docs/recette-promo-image.md` ; la planche de la première image contient l'objet de la miniature du long ; après le brouillon, `qa` (première demi-seconde ≥ 5, aucune plage lente avant 25 s) et la recherche de noir (aucun au-delà de 0,5 s).
- `docs/recette-promo.md`, tableau « Reste / Change », ligne de la première image : « Elle vient du long : son plus beau plan, recadré en 9:16 » → « elle se choisit sur une planche de quatre, comme un court ; l'objet de la miniature du long parmi les candidates » ; ligne du gag : « noir d'une demi-seconde au plus ».
- `scripts/qa.mjs` : la recherche de noir (`blackdetect`) dans la section « rythme », pour tous les courts : un noir de plus d'une demi-seconde est signalé.
- Le `fin.js` d'une prochaine promo : `filmTitle(tl, { showAt, hideAt })` à la place de `filmCall(...)` si Merwan dit oui (point 4) ; l'image derrière l'appel : l'objet de la miniature en mouvement.

## 7. Pour CLAUDE.md (à intégrer par celui qui orchestre)

Dans « Dossiers », sous HS01 (ou dans « Le format long ») :

> **L'image d'une promo (21/10, `docs/recette-promo-image.md`)** — Merwan : « ils font des stats de merde sauf insta ». Sur TikTok et Shorts, une promo se joue comme un court. Mesuré sur les MP4 publiés : mouvement de la première demi-seconde 0,4 (HS01) et 0,2 (HS02), les deux ouvertures les plus immobiles du compte (015 : 9,8) ; HS02 presque immobile de 0 à 4 s ; 2,2 s et 1,9 s de noir complet sur « Pas ici », juste avant l'appel ; entre 10 et 45 s, un plan sur deux ou trois ne se lit pas à 270 px (les plans larges du long, recadrés, deviennent des dessins au trait). D'où : la première image se choisit sur une planche de quatre où figure l'objet de la miniature du long (essayé : l'arc dans sa chambre pour HS02, le mannequin projeté vers le pare-brise intact pour HS01), un événement en cours, ≥ 5 au mouvement de `qa` ; chaque plan sur un objet plein à 40 % de la largeur ; le noir de « Pas ici » une demi-seconde au plus ; aucune option `LOOK` en plus (l'optique ne change rien à 270 px). Le cartouche sans cadre `filmTitle(tl, { showAt, hideAt })` (`kit/lib/blocks.js`, à la place de `filmCall`, même balisage) et l'étiquette pleine de couverture (`cover` → `"tagStyle": "solid", "tagSize": 50, "foot": "Film complet · 8 min 51"`, essais : `node scripts/cover.mjs HS0x --thumbs essais.json --out <dossier> --gpu`) sont prêts, éteints par défaut.

## 8. Les preuves (dossier temporaire de la session, `…\4c4ece79-…\scratchpad\promo2\`)

- `diag-HS01.jpg`, `diag-HS02.jpg` — le diagnostic (8 instants chacun, zones TikTok par-dessus).
- `img0.jpg` — la première image : quatre candidates par promo.
- `call.jpg` — l'appel : avant / `filmTitle`, deux instants par promo ; `cov-call.jpg` — les deux grilles et `filmTitle` après correction de la ligne « Sur YouTube ».
- `grille-avant.png`, `grille-apres.png`, `cov/HS01-solide.png`, `cov/HS02-solide.png` — les couvertures.
- `id-025-sans.jpg`, `id-025-final.jpg`, `id-025-final2.jpg`, `id62-sans.jpg`, `id62-sans2.jpg`, `id62-final.jpg`, `diff56.png` — l'identité.
- `rythme.mjs` — la mesure de la première demi-seconde sur un MP4 publié, sans rien écrire (`node rythme.mjs HS01-pare-brise 015-brin-arret`).

## 9. Pas fait, et pourquoi

- **Une ouverture en mouvement réellement montée** : elle se règle dans les actes d'une promo (`acte1.js`), et HS01/HS02 sont publiés. `look` ne montre que des images fixes : la première demi-seconde des candidates n'est pas mesurée, seulement leur image 0.
- **Une couverture de HS01 au signal** : HS01 est publié avec la sienne ; la règle est dans la recette pour HS03.
- **Des chevrons vers l'avatar (« profil → lien »)** : le même film part sur quatre plateformes dont les boutons ne sont pas au même endroit ; écarté.
- Coût : ≈ 1 h 50 au lieu de 1 h 15 (un build cassé quelques minutes par une modification en cours d'un autre agent dans `direct.js` / `overlay.js`, puis la recherche de l'écart de la première version de l'option) ; 7 images lues.

# L'image d'une promo (hors-série) : la première seconde, le recadrage, l'appel, la couverture

Écrite le 2026-10-21 d'après le diagnostic de HS01 et HS02 (`docs/scale/promo-2-rendu.md`). Merwan, le même jour : « ils font des stats de merde sauf insta ». Sur TikTok et YouTube Shorts, une promo n'a aucun passe-droit : elle se joue comme n'importe quel court, et se balaie comme lui. Ce qui suit complète `docs/recette-promo.md` (le script, la forme) pour l'image. L'agent `promo` lit les deux.

## 1. Ce que les deux premières ont montré

| Mesure (sur le MP4 publié) | HS01 | HS02 | Repères |
| --- | --- | --- | --- |
| Mouvement de la première demi-seconde (`qa` → « rythme ») | **0,4** | **0,2** | 015, notre meilleur film : 9,8 · 012, le plus faible : 1,3 |
| Plages lentes (≥ 2 s sous 1) avant 25 s | 8–11 s | **0–4 s**, 6,5–10,5 s, 22–24,5 s | 015 : aucune |
| Noir complet sur « Pas ici » | **2,2 s** (51,6 → 53,8) | **1,9 s** (49,4 → 51,3) | 015 : 0,17 s (une coupe) |
| Plans de 10 à 45 s lisibles à 270 px | 1 sur 4 | 2 sur 4 | — |

Les deux ouvertures sont les plus immobiles du compte : une image figée (la tête déjà dans la toile, le détecteur déjà muet), grise ou sans forme connue. Le recadrage du 16:9 a fait des plans larges du long des dessins au trait (la chaîne vue de haut, les jambes de verre sur le gravier, le treillis du pylône sur fond noir). Et deux secondes de noir, à 80 % du film, juste avant l'appel : pour qui regarde TikTok, un écran noir, c'est la fin de la vidéo.

## 2. La première image

La règle des six points (CLAUDE.md, « L'accroche ») vaut telle quelle. Ce qui est propre à une promo :

1. **Pas la première image du long recadrée** : elle a été choisie pour un écran 16:9 et un spectateur qui a déjà cliqué. Celle de la promo se choisit sur une planche de quatre candidates, comme un court, **avec l'objet de la miniature du long parmi elles** : c'est ce que le spectateur retrouvera sur YouTube. Essayé sur HS02 : l'arc dans sa chambre (l'objet de la miniature du L02) se lit en un coup d'œil à 270 px — un événement en cours, une lumière qui a un endroit, le signal — là où la tête du détecteur, muette, ne dit rien à qui n'est pas électricien.
2. **Un événement en cours, pas un état** : un instant figé donne 0,4. On prend l'instant d'AVANT, et l'événement arrive dans les premières images (HS01 essayé : `lunge` 0,78, `web` 0, de profil et un peu bas — la tête à vingt centimètres du verre intact ; le choc et la toile qui s'ouvre font le mouvement de la première demi-seconde, par le sujet). Cible : **≥ 5** au mouvement de la première demi-seconde de `qa`.
3. **Une forme connue** : une silhouette entière de profil (un mannequin qu'on projette vers le pare-brise) se reconnaît plus vite qu'une boule qui luit. Un personnage de verre ne vaut que entier, sur plus de la moitié de la hauteur ; jamais petit, jamais en morceaux (des jambes).
4. **Rien ne traverse le cadre qui ne soit pas le sujet** (HS02 : la perche de verre blanche en diagonale, au premier plan, prend l'œil avant le détecteur).
5. **Le plateau** (`LOOK`) : l'optique (`dof` 5) sur la meilleure candidate n'a rien changé à 270 px. Une promo garde le plateau de son long (`dof` 5 au plus sur les plans rapprochés, `finish` et `air` éteints) ; aucune option n'est ajoutée pour la vignette.

## 3. Recadrer un long en 9:16

Un cadre vertical est trois fois moins large : un plan large du long devient, recadré, un dessin au trait. D'où :

- **Chaque teaser sur un objet plein, sur 40 % de la largeur au moins.** Le décor aux rayons X (la chaîne, le poste, la voiture) est le contexte, jamais le sujet d'un plan de promo. Mesuré : la chaîne vue de haut (HS01, 12 s), les jambes sur le gravier (HS02, 28 s), le treillis du pylône (HS02, 42 s) ne se lisent pas à 270 px ; l'isolateur et ses conducteurs (17 s), la chambre de coupure (21 s) se lisent.
- **Une coulée de couleur tient par la couleur, pas par la forme** (le verre en fusion, 19 et 23 s) : lui donner un bord dans le cadre (la lèvre du four, le rouleau), sinon c'est un aplat orange.
- **Aucune plage lente avant 25 s** (`qa`) : sur un court, c'est là que part le public. Une phrase de lancement (« Jusqu'ici, on ouvrait des systèmes… ») ne se pose jamais sur un plan large qui ne bouge pas.
- **De 10 à 25 s, un « wow » toutes les trois secondes**, le plus fort en premier : la scène qui suit l'accroche est celle qui décide qu'on reste.
- Les poses du long se reprennent avec `side` 0 et un `shift` pour la hauteur, puis on **rapproche** (`d` divisé par deux ou trois) : un plan de long qui « respire » est un plan de promo vide.

## 4. Le noir, et l'appel vers le long

- **Le noir de « Pas ici » tient une demi-seconde au plus** (une coupe sèche, pas un écran éteint). « Pas ici. » peut se dire sur l'image de l'appel déjà levée. À trancher avec la rétention : c'est le gag des hors-séries, mais deux secondes de noir ressemblent à une fin.
- **L'image derrière l'appel** : l'objet de la miniature du long, en mouvement (la reconnaissance, encore), jamais un plan large aux rayons X.
- **Le cartouche** : deux formes au choix, mêmes instants, même balisage (`#film` du modèle) —
  - `filmCall(tl, { showAt, hideAt })` : le panneau encadré, la barre qui se remplit, « Sur YouTube · Lien en bio » (HS01, HS02) ;
  - `filmTitle(tl, { showAt, hideAt })` (option du 21/10, `kit/lib/blocks.js`) : **sans cadre** — le titre du long en carton de fin de bande-annonce (140 px jusqu'à 15 lettres, 112 au-delà de 22), sur la scène qui continue, porté par `#title-shade` ; un trait qui se dessine sous lui ; « Sur YouTube · Lien en bio » en 34 px. Un cadre, une barre de progression et « lien en bio », c'est la grammaire d'une fin de publicité.
- Ce qui ne s'imite jamais : le rouge de YouTube, un triangle de lecture, une tête de lecture ronde, une interface de lecteur ou de TikTok. Le mot « YouTube », oui ; son logo, non.

## 5. La couverture d'un hors-série

Dans la grille d'un téléphone (≈ 130 px de large), l'étiquette grise « HORS-SÉRIE 0X » ne se lit pas : HS01 se perd entre les dossiers, HS02 s'en détache par sa seule couleur (l'arc). Donc :

- **L'image porte le signal** : l'objet chaud de la miniature du long (l'arc, le verre en fusion), au milieu des dossiers verts.
- **L'étiquette pleine** : dans `episode.json` → `cover`, `"tagStyle": "solid", "tagSize": 50, "foot": "Film complet · 8 min 51"` — un bloc vert dans la grille (le texte de `foot` ne se lit qu'en grand : il est pour celui qui ouvre le profil). Sans ces clés, une couverture sort comme avant.
- Essai sans toucher `episode.json` : `node scripts/cover.mjs HS0x --thumbs essais.json --out <dossier temporaire> --gpu` (`essais.json` : `[{ "name": …, "at": …, "cam": {…}, "title": [...], "tagStyle": "solid", … }]`), puis la grille à côté des dernières couvertures, à 130 et 200 px.

## 6. Avant de rendre

1. La planche des quatre candidates de la première image, à 270 px, notée sur six points.
2. Le brouillon, puis `qa` : première demi-seconde ≥ 5, aucune plage lente avant 25 s.
3. Le noir : `ffmpeg -i <brouillon>.mp4 -vf blackdetect=d=0.15:pix_th=0.08:picture_black_ratio_th=0.97 -an -f null -` — aucun noir au-delà de 0,5 s.
4. Une planche de 8 instants entre 10 et 45 s : chaque sujet se lit à 270 px.

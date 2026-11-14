# 049 · Le GPS — journal de l'architecte

14/11/2026 (nuit du 13 au 14). Contrat du dossier : plan, monde, bouchons, page, repères, plans des décors et des actes. Voix réelle 94,9 s, rien touché dans `audio/`, ni `text` ni `vo`.

## Fait
- Lu : catalogue (route, ciel, téléphone), recettes (agents, actes), règles d'image, faits 049 (scène, mécanisme, à ne pas dire), contre-vérification, le 025 (journal, `world.js`, API de `route.js`). Mots minutés : `.cache/planches/049/architecte/mots.txt` (script maison : `scripts/lib/episode.mjs` → `schedule`).
- **Décors : trois fichiers.** `route.js` = enveloppe de `025/route.js` importé tel quel (carrefour en T, champ, fossé signal, support du téléphone, panneau, trait de 11 km ; bois du 025 caché par l'attribut `aTree`). `model.js` = le téléphone (neuf, plein). `satellite.js` = le satellite (neuf, plein) + anneaux, sphères, cercles au sol, point au sol, fil et règle de l'établi. Écartés : `022/model.js` (téléphone centré sur la batterie : son éclaté montrerait la mauvaise chose), `026/sky.js` (la courbure ne se lit pas ; la constellation se fait en maquette au-dessus de la voiture).
- **La Terre et la constellation du `voir` de `repos` ne sont pas tenues littéralement** : pas de globe (un second lieu, un quatrième décor) ; la vue haute montre les quatre satellites et huit autres au-dessus de la voiture, en maquette.
- **Géométrie des sphères calculée** (`.cache`… script `sats.mjs` dans le dossier temporaire) : S1–S3 posés sur le cône où |S| − |S − FIELD_FIX| = DELTA (300) exactement ; S4 le manque de ≈ 9 m. Donc un seul nombre, `err`, fait tout : rayons rétrécis du même cran (contre-vérification : « toutes rétrécies du même rayon »), point bleu à l'écran et au sol, en-tête. Vérifié sur bouchon (planche p1, « climax champ ») : trois cercles se coupent sur le point.
- Le ciel vit dans le repère de la voiture (ne défile pas) : les sphères passent toujours par la voiture, quel que soit `gap`.
- `world.js` : `FIRST` 52 nombres (44 + 8 de lumière ; aucun nom de propriété GSAP), `eta` pilote l'en-tête et le défilement (`gap = eta × MPS`, `rolled = −gap`), `SLOWMO` 4, `VIEW` 18 poses, `BENCHED` / `STAGED` (gardent `eta` et `err`). `LOOK.dof` 6 sur `phone`, `quartzCar`, `chip`, `heart`, `quartzBench`.
- `main.js` : en-tête T−`eta` + « Retard » en **secondes** (« 0,000 001 S ») : en « µs », la capitale changeait µ en Μ et on lisait « 1 MS » (planche p2).
- `index.html` : 7 étiquettes, retitle (D'une carte → D'une horloge), duel (Le point bleu / Les panneaux), next 050 ; `#film` et `#cta-field` retirés.
- `episode.json` : 73 repères vérifiés sur la table (`snap` corrigé : `reponse:ton` attrapait le premier « Ton » → `reponse:point-0.5`, 62,22) ; `tobench` → `ouvre-0.12` (« Alors… on l'ouvre » seul dans son plan) ; sons hors des mots : riser `repos$ → tozero`, impact `trigger` → `snap` (62,22), impact-sec `verdict` → `stamp` (68,67), sig-boucle → `boucle$` ; `cover` provisoire (`eclate$`) ; une ligne de `sources` sur la maquette.
- Actes : squelettes qui construisent (étiquettes posées pour que `check` passe), à réécrire en entier.
- `npm run check -- 049` : passe (0 erreur ; avertissement : le canevas touche le bas, bouchon).

## Planches (14 images lues sur 25)
1. p1 (8, bouchons, `--bare`) : conventions justes (la voiture du 025, le support à droite du volant, le satellite face à la voiture) ; A trop serré et trop vers le haut ; C fort ; plongée : le point sort à droite ; établi : téléphone trop petit.
2. p2 (6, avec zones) : A recadré (`el` −8) ; « 1 MS » dans l'en-tête → corrigé ; plongée et établi recalés.

## Poses provisoires (réglées sur bouchons — à recaler par le chef de production d'après les journaux des décors)
Toutes celles de `VIEW` : `phone`, `quartzCar` (dépend de `PHONE.at` et de la carte de `model.js`), `up`, `satSky`, `high`, `climax`, `sign` (dépendent de `satellite.js` / `route.js`), `bench`, `exploded`, `chip`, `satBench`, `heart`, `thread`, `quartzBench`, `clocks` ; `POSE0` (candidate A) ; `cover.cam`. `PHONE.at` lui-même (le support dans la planche de bord) est à confirmer par `route.js`.

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` (la table mot à mot) — demandée depuis le 021, refaite ici à la main.
- Le point bleu est la seule couleur hors des trois (≈ #3B8CFF, sur le point seul) : à valider par le chef de production ; sinon `veille`, l'API ne change pas.
- Le contrôle `check` signale toute étiquette jamais posée (occlusion) : un squelette doit les poser — à dire dans `kit/template` (les squelettes du modèle ne posent que `chip-coeur`).

# 040 · L'abri anti-feu — journal de l'architecte

2026-11-05. Contrat du dossier 040 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle 88,067 s (turbo, `ouvre~3`) : rien touché dans `audio/`, ni `text` ni `vo`.

## Fait
- Lu : recettes (agents, actes, décorateur en tête), catalogue (extérieurs, effets, personnages, kit), faits 040 et contre-vérification (« À ne pas dire », « Reste ouvert »), le 025 (journal, `world.js`, `main.js`), `kit/lib/ref.mjs` (repères : `#2` pour la deuxième occurrence), `kit/lib/blocks.js` (CTA), `scripts/sfx.mjs` (signatures : `hiss` prend `from/to`).
- **Rien du catalogue ne fait un feu de forêt ni une crête** (012/fire est lié à son brûleur ; 029/027 habillent une pente et un col dans leur propre repère). Décors : `model.js` (le système), `crete.js` (le lieu), `feu.js` (le phénomène, séparé pour que l'étape ne dure pas ce que dure un seul gros agent ; il manque au catalogue et pourra monter au kit). Réutilisés : `@kit/figure.js`, `@kit/atmo.js`, `@kit/blocks.js` ; à recopier : le sapin de `027/habillage.js`, `makeEmbers` de L04, la recette des flammes de `012/fire.js`.
- `src/plan.js` (sans import) : `SHELTER` (218 × 79 × 39, pieds −z vers le feu, couches dessinées épaisses, levées de l'éclaté, poignées, sangles, coin de la colle), `PACK`, `BAG`, `YOU`, `AIR`, `RIDGE` + `ridgeY(x, z)`, `PAD`, `CREW` (73 positions, LCG déterministe, rien à moins de 9 m ni sur ton côté −x à moins de 24 m), `SHOVEL`, `DUO`, `FIRE`, `RAYS`, `DEBRIS`, `SIZE` 115. **Azimut vérifié sur planche** (stage.js : caméra en t + d·(sin az, …, cos az)) : az 0 côté +z, −90 côté −x ; le feu vient de −z.
- `src/world.js` : SET CRETE / BENCH ; `FIRST` fermé (45 nombres : `set` · `clock abris` · crête 8 · feu 10 · système 16 · lumière 8) ; `POSE0` (candidate A) ; `VIEW` (26 poses) ; `BENCHED`, `STAGED` ; `apply` re-parente l'abri ET les rayons (`fire.rays.group`) entre ton emplacement et l'établi ; `LOOK` `{ dof 8, air 0, finish 1 }`, `CLOSE` sur les seuls gros plans.
- Bouchons gris à l'API définitive : `model.js` (cinq demi-coques, coupe = moitié −x masquée, pliage, figure couchée, nappes d'air, colle, trou), `crete.js` (grille sur `ridgeY`, 72 coques instanciées, 72 capsules debout, cônes, pelle, duo, débris), `feu.js` (trois nappes signal couchées par `lean`, fumée, braises, `PointLight`, dix rayons, langue).
- `src/main.js` : en-tête = le chrono de l'histoire (`clock`, `stamp` : −0:25 … 0:00 … +1:30:00 ; signal ≤ 0, atténué pendant l'autopsie de `tobench` à `rattrape`) + « Abris » 0 → 73 (veille à 73). Actes : `acte1`, `acte2` (autopsie + repos : 12 phrases, pas de `acte2b`), `acte3`, `fin` — squelettes qui construisent, à réécrire.
- `index.html` : en-tête (+0:04, Abris 73), dix étiquettes, retitle (« Son secret » : « Il encaisse » → « Il renvoie »), duel (« Pieds au feu » / « Tête au feu », les deux en ink), prochain dossier 041 (« Un débris · 10 kilomètres par seconde »), `#cta-field` et `#film` retirés. `rail-follow` gardé (nextFile s'en sert).
- `episode.json` : 44 repères vérifiés sur la table (`outete` = `comment:tête#2`, `rattrape` = « Mais »), grille `sfx` refaite **dans les souffles** (le `swish` à 0,14, l'`impact` sur « on », le `blip` sur « pas », l'`impact` de `trigger` et le `rewind` sur « crête » tombaient sur des mots : déplacés au souffle suivant), `ambience` vent (le front), `cover` à `eclate$` (el 30), une ligne de `sources` (reconstitution, maquette, en-tête).
- `npm run check -- 040` passe (0 erreur ; avertissements : contraste de la nav de l'en-tête sur le feu à 24 et 44 s, bord gauche du canevas).

## Planches (3 images lues sur 25)
1. Bouchons, 8 images : la convention tient (le feu derrière le dôme en A ; rayons venus de −z en coupe). Un dôme voisin bouchait le premier plan de A → `CREW` écarté ; une étiquette jamais appelée restait affichée en haut à gauche → toutes appelées dans les squelettes.
2. Candidates reposées : le dôme tombait à y ≈ 1140 → `shift` 100 ; `under` trop serré → d 620 ; `section` décentrée → tz −20 ; `back` de haut : un dôme = 4 px → le long de la crête.
3. Planche des candidates : A et B à 6/6, C 5,5, D 5 (30 % de largeur) ; `back` se lit (les coques en perspective le long de la crête).

## Provisoire (à recaler par le chef de production sur les vrais décors)
- **`POSE0` et `FIRST`** (candidate A) : le feu des bouchons est un aplat ; le choix A/B se fait sur `premiere-image.json` avec le vrai `feu.js`.
- **Toutes les poses de `VIEW`** sont réglées sur bouchons ; les plus fragiles : `crest`, `canyon` (l'échelle du flanc dépend de `ridgeY` et du front), `shake` (le paquet), `over`, `mouth`, `standing`, `sky`. `exploded` et `section` dépendent des levées et de l'épaisseur réelle des couches.
- `scene.fog` 0,00004 dans la crête, `PointLight` du feu à 4 × `fire` : à régler par `feu.js` / `crete.js`.

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` (la table mot à mot existe dans `gen/episode.data.js` ; je l'ai tirée par un script de 5 lignes — demandée depuis le 021).
- `kit/lib/direct.js` ou `kit/brand.css` : une `.chip--live` jamais appelée reste visible en haut à gauche ; la cacher par défaut (`opacity: 0`).
- Décorateur (après les décors) : `crete.js` seulement — des lignes de pare-feu raclées au bulldozer, des chicots fumants, une sangle ou un sac posé près d'un emplacement, des braises au sol ; rien sur les abris, rien devant ton dôme, rien sur ton côté −x.
- `docs/catalogue-notes.json` : une fiche pour `040/feu.js` (le front de feu de forêt) une fois rendu — candidat au kit.

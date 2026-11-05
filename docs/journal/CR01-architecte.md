# CR01 · Tchernobyl — journal de l'architecte

2026-11-05. Contrat du premier « Compte à rebours » : plan, monde, bouchons, page, repères, sons, plans des décors et des actes.

## Fait
- Lu : recette CR (entière), `docs/reconstitution.md`, journal DA, faits § 4 / 5bis / 10-12, contre-vérification (« Reste ouvert », version éducative), le modèle 025 (journal, décors, tête des actes), recettes agents / actes / décorateur (entrée), `regles-image.md`, catalogue (rien d'approchant : la cuve du 005 est un REP en verre ; `005/chain.js` donné comme idiome des particules), API de `reconstitution.js`, `direct.js`, `blocks.js`. Azimut vérifié dans `stage.js` l. 381 et sur planche : az −90 = −x, face à la coupe.
- **Décors : quatre fichiers, quatre lieux** (`plan.js` → `ORIGIN`, éloignés, un seul montré par `S.set`) : `canal.js` (la tranche de cœur agrandie : toute la physique, le plan maître ; le plus lourd), `coeur.js` (le cœur en coupe ≈ 1:10 : première image, t2-t3, t6-t8), `centrale.js` (la table ≈ 1:50 : turbine, pompes, diesels, refroidissement de secours, réseau), `salle.js` (≈ 1:1 : AZ-5, clés, tableau des barres, silhouettes). Toutes coupées par x = 0 de leur repère, faces vers −x (la lumière). Pas de `habillage.js` : le format n'a pas de décorateur (maquettes d'argile, pas de rayons X).
- **`fault` = la pièce en défaut de la maquette montrée** (cœur : moitié basse ; canal : déplaceur ; centrale : vanne de l'ECCS ; salle : AZ-5) : une seule pièce rouge à l'image par construction. `depuis` ne guérit que le canal.
- **Actes : cinq fichiers** (le plafond de ≈ 14 phrases) : `acte1` (0 → `tot1`, 15 phrases), `acte2` (→ `tot4`, 13), `acte2b` (→ `tocanal`, 14 : la coupe vers le canal glisse de `defaut` à « Du graphite » pour que « Sauf que… au bout ? » se joue sur le pied d'une barre du cœur et que la coupe raccorde sur le pied du déplaceur), `acte3` (→ `toissue`, 13 : le plan maître d'un seul tenant), `fin` (14). En-tête : 02 LE DÉFAUT sur « Sauf que » (acte2b), 03 DEPUIS à `todepuis` (fin).
- `main.js` : `crHud` recalé sur les heures DITES, saut 0,17 s avant chaque beat (dans le souffle, avec un `clack` à la même place) ; T− compté jusqu'à AZ-5 (01:23:40, la voix dit « quarante ») ; « 01 h 22 » → 01:22:30 (la marge de 8 barres, WNA) ; à t8 l'heure devient « 01:23 » et T− s'efface (l'heure des explosions n'est pas figée).
- `index.html` : règle « BANC DA » et dispositifs du modèle retirés (retitle, like, #net, #film, #cta-field, chips du modèle) ; **la `.piece` INSAG-7 retirée** (aucune source ouverte ne porte une citation : la phrase IRSN du dossier de faits vient d'un relais non rouvert) ; onze étiquettes de chiffres ; `#next` (Deepwater Horizon, un fait CSB) ; `#duel` (« Les hommes / La machine »).
- `episode.json` : ≈ 140 repères, tous relus sur la table (`npm run script`) — pièges évités : `t6:vingt` attrapait « vingt-trois » (→ `t6:secondes-0.12`), `defaut:frein` attrapait « freine » (→ `accélère-0.24`), `comment:hommes` / `machine` attrapaient la première occurrence (→ `duelA`/`duelB` sur `comment:ou`) ; `cover` (`defaut$`, le canal) ; `sfx` (drone, clacks d'horloge, hits dans les souffles, hush, booms, sting à `depuis`, rewind) ; une ligne de `sources` sur la reconstitution et l'en-tête. Ni `text` ni `vo` touchés, rien dans `audio/`.
- Bouchons des quatre décors (volumes d'argile, API définitive) et squelettes des cinq actes (coupes d'entrée complètes, étiquettes posées) ; `model.js` du modèle supprimé. `npm run check -- CR01` passe (0 erreur ; ⚠ canvas à bord, notes de shader connues).

## Planches (2 images lues sur 25)
1. `.cache/planches/CR01/architecte/bouchons.jpg` — convention vérifiée (faces coupées éclairées, de trois quarts, halo rouge au sol) ; contre-plongée trop près, canal et centrale trop bas, salle masquée par les silhouettes, gros plan du combustible trop près, dalle dans l'en-tête.
2. `bouchons2.jpg` — poses reprises (ci-dessous) ; `shift` positif monte l'image. Restent : silhouettes trop massives (au décor), `VIEW.coeur` touche l'en-tête par ses tuyaux (à fondre dans le noir).

## Poses provisoires (réglées sur bouchons : à recaler sur les vrais décors)
**Toutes les poses de `VIEW`**, `POSE0` (= `coeurLow`) et la caméra de `cover`. Les plus sensibles : `coeurLow` (la première image), `canal` (le plan maître, d 1100), `salle` (les silhouettes ne doivent rien masquer), `slab` (la dalle en vol doit rester sous l'en-tête), `az5`.

## Reste ouvert
- La première image se choisit sur le vrai décor (planche de quatre, `docs/CR01-actes.md`) ; si (c) le bouton l'emporte, l'acte 1 et la boucle changent de maquette (écrit dans le plan).
- `t2` : `chip-1pct` ne vit que ≈ 1,1 s (de « à peine » à la coupe sur le xénon) ; si c'est trop court à la relecture, garder « Le xénon… » dans le cœur avec des grains (il faudrait que `coeur.js` lise `xenon`).
- Pièce du dossier : possible seulement si quelqu'un ouvre la fiche IRSN et en relève la phrase exacte.

## À changer ailleurs
- `scripts/` (`npm run script`) : une option `--words` (la table mot à mot ; je l'ai tirée de `gen/episode.data.js`) — demandée depuis le 021.
- `kit/lib/blocks.js` `duelCall` : `toneB` vaut « veille » (vert codé en dur) par défaut ; dans un CR après `depuis` ce vert répond à la place du spectateur — un défaut neutre (`null`) serait plus sûr.
- `docs/recette-compte-a-rebours.md` « La fabrication » : ce format a désormais des décors neufs (4 agents) et des actes à cinq fichiers ; la ligne « deux agents d'actes au plus » ne vaut plus pour un CR de 2 min 30.

# CR02 · Deepwater Horizon — journal de l'architecte

2026-11-06. Contrat du deuxième « Compte à rebours » : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Parti du CR01 (structure, `world.js`, un fichier par lieu, `crHud`), pas des `src/` du modèle des courts (remplacés ; `model.js` et `fin.js` supprimés).

## Fait
- Lu : recette CR, `docs/reconstitution.md`, journal d'état CR02, catalogue (rien d'approchant : aucune plateforme, aucun puits, aucune mer en argile — `015/carrier` et `L04/navire` sont en verre), journal de l'architecte CR01, `plan.js` / `world.js` / `main.js` / `index.html` / têtes des décors et des actes du CR01, faits § 2-4 et 10, « Reste ouvert » de la contre-vérification, recette agents (première image), recette actes (plan-séquence, grille), `regles-image.md`. Azimut vérifié (`stage.js` l. 381) et sur planche : az −60 montre les faces coupées de `puits` et `bop`.
- **Décors : trois fichiers, trois lieux** (`ORIGIN` éloignés, un seul montré par `S.set`) : `bop.js` (LE système en coupe, ≈ 1:10 : empilement dans l'ordre du CSB, rams de profil le long de ±z, tube qui flambe, lames qui pincent et percent, boîtiers qui s'ouvrent, seconde BSR et bague de `depuis` ; le plus lourd), `puits.js` (la colonne schématique : réservoir, roche, BOP simple, riser, fluides boue / eau / gaz, pupitre à deux cadrans TUBE / LIGNE, panneau d'urgence et câble, compteur de débit, balance), `plateforme.js` (la semi-submersible et son derrick, la mer arrêtée à un bord d'aquarium `SEA.cut` pour voir dessous, le riser jusqu'au BOP simplifié sur le fond = le sol, jet, boue, explosion, feu, naufrage). Pas de `habillage.js` (le format n'a pas de décorateur).
- **`culprit` + `fault`** (au lieu du seul `fault` du CR01) : chaque maquette a plusieurs pièces fautives successives (annulaire, tube, batterie, électrovanne, pile) ; `culprit` les désigne, une rouge à la fois par construction. Le vert des joints est à la charge du décor (fermeture × `ok`), pas de `setOk` seul : « les étages s'allument tour à tour ».
- **Actes : quatre fichiers** (plafond de quatre agents) : `acte1` (0 → `tot1`, 13 phrases), `acte2` (→ `tot4`, 16, une seule maquette), `acte2b` (→ `todefaut`, 17), `acte3` (→ fin, 18 dont abo et boucle, formulaires). Au-delà des ≈ 14 phrases : c'est le prix des quatre agents.
- `main.js` : `crHud` sur les heures DITES, sans secondes (± 1 min dans les sources) ; saut à 21:58 sur « Avant » (`avant58`, et le `clack` y est déplacé) ; à l'issue « 22 AVR. » et « 15 JUIL. » ; à `depuis` « 2016 » ; T− jusqu'à 21:49, effacé à t8.
- `index.html` : depuis celui du CR01 (en-tête CR, `#grain`) ; huit étiquettes posées dans les squelettes ; `#next` caviardé (la voix ne nomme pas le prochain : rapport de Haneda non publié) ; `#duel` « Je valide / J'arrête tout ».
- `episode.json` : repères relus sur la table — **`deux` attrapait « deux mille seize »** (→ `depuis:jeux-0.12`, 130,04) ; ajoutés `avant58`, `jours`, `mois`, `minutes`, `remplace`, `entre`, `sauf`, `celui`, `rien`, `letube`, `boitier`, `lautre`, `cisaillement`, `mais`. **Sons déplacés hors des mots** : `hit` choc+0,5 tombait sur « boue » (→ `accroche$+0.06`), `hit` sceller+0,6 sur « puits » (→ `promesse$+0.08`), `click` dix1+0,5 sur « barils » (→ avant « Retiens »), `impact` tient−0,5 sur « fois » (→ avant « Cette »), `hit` dix2+0,5 retiré (collait le `clack` de t4), `rewind` (était sur « soir-là » → `boucle:à-0.3`). `cover` sur le BOP (plan maître à `defaut$`). La ligne « Image : » de `sources` complétée (ordre du BOP, kill line, compteur de débit = indicateur de maquette). Ni `text` ni `vo` touchés ; `audio/bed.json` réécrit par le build (la grille `sfx` a changé), rien d'autre dans `audio/`.
- `npm run check -- CR02` passe (0 erreur ; ℹ canvas à bord).

## Planches (2 images lues sur 25)
1. `.cache/planches/CR02/architecte/bouchons.jpg` — convention vérifiée (fluides et alésage en coupe vus de trois quarts) ; (a) le derrick et le jet se lisent déjà sur bouchon ; (d) trop près ; cadrans trop près ; la colonne entière du puits déborde la zone du sujet.
2. `bouchons2.jpg` — `rig` trop bas (sous-titres sur le pont), la mer en argile lit gris clair (à faire noir brillant), vue d'en dessous la surface ne se voit pas ; boîtiers au bord du cadre. Poses reprises : `rig` shift 200, `under`, `table` d 110, `dials` d 240, `dialLine` d 130, `flowDial` d 150, `pods` d 520.

## Poses provisoires (réglées sur bouchons : à recaler sur les vrais décors)
**Toutes les poses de `VIEW`**, `POSE0` (= `floorLow`) et la caméra de `cover`. Les plus sensibles : `floorLow` (la première image), `under` et `line` (dépendent de la mer au bord d'aquarium), `master` (le climax), `pods` / `podBattery` / `podValve` (l'intérieur des boîtiers n'existe pas encore), `bopSmall` et `eds` (le trajet du signal), `rig` (sous-titres).

## Reste ouvert
- La première image se choisit sur le vrai décor (planche de quatre, `.cache/planches/CR02/premiere-image/essais.json`, instants 0,02 et 0,6 s) ; (a) recommandée, (b) si la mer vue d'en dessous tient.
- Quelle VBR s'est fermée à 21 h 47 : le dossier de faits dit « VBR » ; l'image en ferme une (la haute). Le nombre de colonnes de la plateforme est générique.
- Le « tampon réussi » du `voir` est une étiquette (`chip-reussi`), pas un objet 3D (pas d'habillage de plus).
- « Personne ne réagit » et « on coupe les pompes » n'ont pas d'image propre (aucun nombre) : la colonne les porte.

## À changer ailleurs
- `kit/lib/blocks.js` `duelCall` : `toneB` vaut toujours « veille » par défaut (déjà signalé au CR01) — les actes passent `null`.
- `scripts/` (`npm run script`) : l'option `--words` (la table mot à mot ; tirée ici de `gen/episode.data.js`) — demandée depuis le 021.
- `kit/lib/reconstitution.js` : `setOk(k)` est global ; un vert par pièce (« les étages s'allument tour à tour ») demande que chaque décor le fasse à la main — un `setSafe(mat, k)` par matière serait plus simple.
- `docs/recette-compte-a-rebours.md` « La fabrication » : un CR de 2 min 30 a des décors neufs (trois agents) et quatre fichiers d'actes à 13-18 phrases.

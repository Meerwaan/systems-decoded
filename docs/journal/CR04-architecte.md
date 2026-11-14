# CR04 · Lac-Mégantic — journal de l'architecte

2026-11-14. Contrat du quatrième « Compte à rebours » : plan, monde, bouchons, page, repères, grille de sons, plans des décors et des actes. Parti du CR03 (structure, `world.js`, `crHud`, six fichiers d'actes), pas des `src/` du modèle des courts (remplacés ; `model.js` supprimé).

## Fait
- Lu : recette CR, `docs/reconstitution.md`, état CR04, journal de l'architecte CR03, `world.js` / `main.js` / `index.html` / tête de `plan.js` du CR03, tête et acte 1 de `CR03-actes.md`, faits CR04 § 2-5, 10, 13-14, « Reste ouvert » de la contre-vérification, les `voir` d'`episode.json`, la table mot à mot (tirée de `gen/episode.data.js` → `.cache/CR04-mots.txt`, souffles marqués). Catalogue : rien de fidèle (le TGV du 021 est de verre ; aucune locomotive diesel, aucun wagon-citerne, aucune ville d'argile).
- **Un seul lieu, trois décors** : `locomotive.js` (le système plein : la GE C30-7 MMA 5017 et, du même constructeur, les quatre autres, placées par `world.js`), `convoi.js` (VB, tampon, 72 DOT-111, la voie entière, la route 161 et ses phares, les flèches du `seuil`, le déraillement), `ville.js` (Lac-Mégantic, rue Frontenac, le « 16 », les lumières, la lueur). Le plus lourd : `locomotive.js`.
- **Le sol est le plancher du studio incliné** : tout tient sur un seul plan `y = 0,035·x` (pente accentuée, distances compressées ≈ 2,4×) ; `world.apply` pose le plancher de `setupReconstitution` (grille ambre, halo, ombres) sur ce plan sous le foyer (`recon.floor.position.y`, `rotation.z`), après `setMood`. Un plan unique (la ville comprise) évite tout désaccord du plancher avec le terrain. Les véhicules suivent `trackFrame(u)` (pente + courbe en ville, abscisse curviligne exacte) ; tout le reste reste vertical.
- **`plan.js` porte les lois pures** (`trackXZ`, `trackPoint`, `trackFrame`, `vehicleU`, `groundY`) : `world.js` place les cinq locomotives, `convoi.js` ses propres wagons, avec la même loi.
- **La colonne de freinage** (`#colonne`) est calculée par `world.js` depuis `psi` et `brakes` (1,62 t par psi ; 2,5 t par frein de locomotive, 4,75 pour VB et tampon, 3,9 par citerne) : 27 psi + 7 freins = 65,7 t contre 66,5 (« quelques centaines de kilos »), 22 t seuls (« un tiers »), 119 t à l'essai. Un instrument ne peut donc pas mentir sur l'image. `#mano` lit `psi` (vert moteur allumé, rouge coupé), `#vitesse` lit `kmh` (rouge au-delà de 16).
- `main.js` : `crHud` sur les heures dites (hh:mm, la voix ne dit pas de secondes) ; **saut 0,24 s avant chaque étape, dans le souffle** (0,37 à 0,53 s avant chaque heure) ; 23:58 en arrière à `recule` ; 00:44 à `onzequarante` ; 01:15 tient pendant l'issue ; « 2013 » à `todepuis` ; T− jusqu'à 00:58:21, effacé à `toverdict`.
- `index.html` : depuis celui du CR03 ; trois instruments, six étiquettes, `#duel` « Normal / Pas normal » (la question DITE ; le `voir` disait « je la laisse tourner / je la coupe »), `#next` CR05 caviardé (« Un Airbus sans carburant plane 19 minutes. »).
- `episode.json` : **97 repères** relus sur la table (pièges : `principe:Le` → « Les », `depuis:deux` → « deux mille treize », `t5:zéro` → « 0 h 05 »). **Sons hors des mots** : `impact-lourd` à `trigger` tombait sur « part » (→ `t6:part+0.34`, souffle 82,90–83,27), `impact-sec` à `verdict` sur « tiers » (→ `defaut:fallait+0.42`, souffle 90,50–90,94), `sig-boucle` sur « nuit-là » (→ `boucle$+0.02`). `cover` = la candidate (b) à `t6$`. Ligne « Image (architecte…) » ajoutée à `sources`. Ni `text` ni `vo` touchés ; rien dans `audio/` (sauf ce que le build réécrit).
- `npm run check -- CR04` passe (0 erreur ; ℹ canvas au bord, les bouchons).

## Planches (3 images lues sur 25)
1. `.cache/planches/CR04/architecte/candidates-bouchon.jpg` — conventions vérifiées : (b) le train remonte la pente vers la droite du cadre, (d) l'avant, (a) la roue est à DROITE du cadre (la caméra est à +z de la roue et regarde vers −x). Les lumières de la ville ne se lisent pas (bouchon : boîtes grises sans fenêtres).
2. `vues-bouchon.jpg` — `pente` trop loin (le train = une ligne de pixels), `coupe` et `cheminee` trop près ; `tete`, `courbe`, `frontenac`, `cylindre` lisibles ; le plancher incliné tient (grille ambre sous le train).
3. `vues-bouchon2.jpg` — `pente` reprise (le train en fuite vers le haut de la pente), `coupe` et `cheminee` reculées.

## Poses provisoires (réglées sur bouchons : à recaler sur les vrais décors)
**Toutes les poses de `VIEW`**, `POSE0` (= (b) `file`), la caméra de `cover`, `STAGED` (`fs`). Les plus sensibles : les quatre candidates (dépendent de la vraie roue, du vrai longeron, de la place du volant), `coupe` / `compresseur` / `pupitre` / `cabine` (l'intérieur n'existe pas encore), `pente` (le train doit se lire comme un trait sur sa pente), `vallee` / `frontenac` / `courbe` (lisibilité des lumières et des toits). Le script qui calcule les poses avec la loi de `plan.js` : `…/scratchpad/poses.mjs` (copie de `plan.js` en `.mjs`) — à refaire si `plan.js` bouge.

## Reste ouvert
- La première image se choisit sur le vrai décor (`.cache/planches/CR04/premiere-image/essais.json`, quatre poses à 0,02 et 2,7 s) ; (b) recommandée, (a) colle au `voir` (la ville en bas) si les lumières se lisent.
- Le `voir` de l'accroche demande à la fois les citernes « derrière » et la ville « en contrebas, au fond » : elles sont de part et d'autre de la roue (la ville en aval, les citernes en amont) ; aucune pose basse ne tient les deux (a = la ville, b = les citernes).
- Le `voir` de `seuil` dit une jauge horizontale : c'est la colonne verticale demandée par la consigne (`#colonne`), même marque « 66 ».
- Emplacements reconstitués sur le C30-7 (volant, compresseur, turbo, coupe-circuit, cylindre) et les quatre autres locomotives sur la même silhouette : écrit dans `sources`.
- La boucle est dans la voix (« Comme cette nuit-là, à… » → « Zéro heure cinquante-huit ») ET dans l'image.

## À changer ailleurs
- `scripts/` (`npm run script`) : l'option `--words` (la table mot à mot) — toujours tirée de `gen/episode.data.js`.
- `scripts/look` : accepter `"pose": "VIEW.nom"` dans `essais.json` (sans ça, un script à part recopie la loi de placement).
- `kit/lib/reconstitution.js` : une option `floorTilt` / `floorAt(x)` à `setupReconstitution` (ici `world.js` réécrit `recon.floor.position.y` et `rotation.z` après `setMood`, ce qui dépend d'un détail interne : `aim()` ne repose la position que quand le foyer bouge) ; et le halo rouge de `halo()` reste horizontal (sur une pente il s'enfonce d'un côté).
- `docs/recette-compte-a-rebours.md` « La fabrication » : un CR avec décors neufs = trois agents `decor`, six fichiers d'actes en deux vagues de quatre au plus (deuxième fois après le CR03).

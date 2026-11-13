# CR03 · Concorde — journal de l'architecte

2026-11-13. Contrat du troisième « Compte à rebours » : plan, monde, bouchons, page, repères, grille de sons, plans des décors et des actes. Parti du CR02 (structure, `world.js`, `crHud`, un fichier par lieu), pas des `src/` du modèle des courts (remplacés ; `model.js` supprimé, `fin.js` réécrit en acte).

## Fait
- Lu : recette CR, `docs/reconstitution.md`, état CR03, journal de l'architecte CR02, `world.js` / `main.js` / `plan.js` / `index.html` / tête de `bop.js` du CR02, têtes de `CR02-decors.md` et `CR02-actes.md` (haut, acte 1, candidates), faits CR03 § 2-4, 10-12, « Reste ouvert » de la contre-vérification, les `voir` d'`episode.json`, la table mot à mot (tirée de `gen/episode.data.js` : `npm run script` n'a toujours pas `--words`). Pas de catalogue : aucun avion d'argile n'existe, et la consigne interdit l'A330 / l'A350 recolorés.
- **Deux lieux, trois décors** : `SET.PISTE` = le sol (`piste.js` : la 26R au 1:20, la lamelle, la campagne, Gonesse et l'hôtel, Le Bourget au loin, distances compressées) + **l'avion** (`concorde.js`, placé par `world.js` à chaque image depuis `run` / `alt` / `pitch` / `bank`, sur la courbe `trajZ` de `plan.js` au-delà de la piste) ; `SET.RESERVOIR` = le réservoir 5 en coupe au 1:2 (`reservoir.js`, ouvert par x = 0 comme le BOP du CR02). Le décor le plus lourd est `concorde.js`.
- **Une seule table `CULPRIT`** pour les trois décors (1 lamelle · 2 réservoir 5 et son panneau · 3 pneu n° 2 · 4 moteur 2 · 5 train gauche) : `world.js` choisit l'ancre du halo (lamelle → piste, 2-5 → avion ou réservoir), seulement près du sol.
- **`principe` sans schéma** : la barre de freinage (`stop`) a une longueur ∝ `run` (vitesse² ∝ distance), calée pour toucher le bout de la piste exactement à V1 : elle vire du vert au rouge d'elle-même quand le train avant passe la ligne. Le même nombre `run` sert au pneu sur la lamelle (`RUN.strip`).
- **La jauge de débit est un élément de la page** (`#gauge`), écrite par `world.apply` depuis trois nombres de l'état (`gauge`, `debit`, `mark`) : 4 puis 60 kg/s, la marque 4 qui reste. `alt` −100 cache l'avion (la piste vide de l'`issue`).
- `main.js` : `crHud` sur les heures locales DITES avec leurs secondes ; **saut 0,08 s avant chaque étape** (aucun souffle avant l'heure : pas de `clack` posé, le monteur-son tranchera) ; 16:43:13 de 0 à t1 ; T−0 = 16:44:31 ; « 2001 » à `todepuis` ; T− effacé à `todefaut`.
- `index.html` : depuis celui du CR02 ; huit étiquettes posées dans les squelettes ; la jauge ; `#duel` « J'y remonte / Jamais » (la question DITE : « tu remontes dedans, ou pas ? » — le `voir` du scénariste disait « je décolle / je freine ») ; `#next` caviardé (« Un train garé démarre tout seul. »).
- `episode.json` : 55 repères relus sur la table ; pièges trouvés : `reservoir:Le` attrape « les » (22,50), `depuis:ses` attrape « ses » de « six de ses » (123,14), `t6:rentre` attrape « rentrer » ; les nombres par leur forme dite (`t4:soixante`, `reservoir:quatre`). `tozero` → `tot3`, `toverdict` → `topreuve`. **Sons hors des mots** : `impact-lourd` à `trigger` tombait sur « repoussé » (retiré : aucun souffle dans `defaut`, le monteur-son placera `CR03-panneau-arrache`), `impact-sec` à `verdict` sur « jamais » (→ `preuve:Et-0.28`, souffle 119,58–119,90), `impact-lourd` à `tozero` sur « non-retour » (→ `t8$+0.06`, souffle de la chute 91,14–91,51), `riser` calé sur t2, `sig-boucle` sur « seconde » (→ `boucle$+0.02`). `cover` sur le réservoir (`defaut$`). Ligne « Image (architecte…) » ajoutée à `sources`. Ni `text` ni `vo` touchés ; rien dans `audio/` (sauf `bed.json` / `bed.wav` que le build réécrit).
- `npm run check -- CR03` passe (0 erreur ; ⚠ canvas au bord droit, le sol des bouchons).

## Planches (3 images lues sur 25)
1. `.cache/planches/CR03/architecte/bouchons.jpg` — **toutes les caméras au sol étaient sous le bitume** (el < 0 met la caméra sous sa cible) : rien de l'avion. Règle écrite partout : `ty + d·sin(el) ≥ 1,5`. Réservoir : la baie déborde à d 270.
2. `bouchons2.jpg` — convention vérifiée : az 6 montre le flanc gauche, nez à gauche de l'image ; az −118 voit le bogie gauche par l'intérieur ; la barre de freinage se lit d'en haut ; `VIEW.dessous` trop près, profil et face trop près.
3. `candidates-bouchon.jpg` — (b) et (c) lisibles même en bouchon ; (a) ne montrait pas la lamelle (la caméra était à côté d'elle) → repris dans l'axe, ≈ 25 derrière la lamelle, 4 au-dessus, la lamelle tournée presque en travers de la trace (`STRIP.yaw` 70).

## Poses provisoires (réglées sur bouchons : à recaler sur les vrais décors)
**Toutes les poses de `VIEW`**, `POSE0` (= `first`, candidate a), les positions `AT` et la caméra de `cover`. Les plus sensibles : `first` / `charge` / `profil` / `aile` (la première image : dépend de la vraie silhouette et du vrai feu), `pneu` (le bogie), `moteurs` (la nacelle ouverte n'existe pas encore), `runway` et `carte` (dépendent de la lisibilité du bitume et des toits vus de haut), `bay` / `impact` / `panneau` (la baie réelle). Script qui calcule les poses avec la loi d'`onPlane` : `…/scratchpad/poses.mjs` (copie de `plan.js` en `.mjs`) — à refaire si `plan.js` bouge.

## Reste ouvert
- La première image se choisit sur le vrai décor (`.cache/planches/CR03/premiere-image/essais.json`, quatre poses à 0,02 et 0,6 s) ; (b) recommandée, (a) colle au `voir`.
- **La boucle n'est pas dans la voix** : « Tout s'est joué à la seconde… » ne retombe pas sur « Ton Concorde décolle en feu » ; seule l'image boucle (à signaler, pas à moi de toucher la voix).
- Le `voir` d'`abo` (une locomotive en maquette) n'est tenu par aucun décor : l'avion qui s'éloigne sous le panneau.
- Les positions sur la piste (V1 ≈ 1 240 m, lamelle ≈ 1 780 m, rotation, décollage), l'orientation de la lamelle, la place du réservoir 5 et du panneau sur l'intrados sont reconstituées (`sources`).
- Le « témoin d'alarme feu » du `voir` de t5 est l'étiquette `chip-feu` (rouge : c'est l'incident), pas un objet 3D.

## À changer ailleurs
- `scripts/` (`npm run script`) : l'option `--words` (la table mot à mot) — demandée depuis le 021, encore tirée ici de `gen/episode.data.js`.
- `scripts/look` : accepter `"pose": "VIEW.nom"` (et un `AT`) dans `essais.json` — sans ça, chaque agent recopie la loi de placement de l'avion dans un script à part.
- `kit/lib/reconstitution.js` `crHud` : une option `clack: false` / un décalage par saut serait utile aux films dont l'heure ouvre la phrase sans souffle (ici, tous).
- `docs/recette-compte-a-rebours.md` « La fabrication » : un CR de 2 min 30 avec décors neufs = trois agents `decor`, six fichiers d'actes en deux vagues de quatre au plus.

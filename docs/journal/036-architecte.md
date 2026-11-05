# 036 · L'éolienne dans la tempête — journal de l'architecte

2026-11-04, soir. Contrat du dossier 036 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle : 88,7 s (rien touché dans `audio/`, ni `text` ni `vo`).

## Fait
- Lu : catalogue (route 025, tour 020, ciel), recettes (agents, actes, décorateur : où il entre), règles d'image, faits 036 et contre-vérification, le 025 (journal de l'architecte, `plan.js`, `world.js`, `main.js`, tête des décors et des actes), l'API de `025/route.js` (`buildRoute`, `update`), `makeStreaks` de `020/tour.js` (non exportée), azimut de `kit/lib/stage.js` (az 0 en +z, −90 en −x : confirmé).
- **Réutilisé** : `025-esp/src/route.js` importé tel quel par `world.js` (sa voiture, toi, sa pluie dans les phares, son habillage `dressRoute` qu'il appelle lui-même), posé à `CARAT`. **Pas réutilisable proprement** : la pluie du 020 (`makeStreaks` n'est pas exportée, `buildTour` construit la tour) → `vent.js` la recopie (dit dans `docs/036-decors.md`).
- **Découpage des décors** : `model.js` (le système plein : moyeu ouvert, trois moteurs de pas + trois coffrets de batteries, roulements, pieds de pale, générateur annulaire, frein froid, châssis, couronne d'orientation ; capot et cône de verre ; haut du mât sur l'établi) · `eolienne.js` (mât de verre, trois pales entières avec leur flou, échelle et technicien, réseau et poste, Formerie, portée) · `vent.js` (pluie et rafales, l'aile du principe, les filets de la chute). La route : aucun agent.
- `plan.js` : échelle VRAIE (ordre d'une E-82 : rotor 82 m, moyeu 78 m) ; origine au pied du mât ; la voiture à `CARAT` (100 m, 84 m en amont du rotor, 50 m à côté : à portée, jamais dessous) ; repère de la nacelle tourné de `heading` −50 ; sens du rotor (horaire vu de face) et du pas (0 en travers, 90 drapeau) écrits une fois, avec la formule three.js. `top()` donne un point de la nacelle dans le monde.
- `world.js` : l'établi posé au sommet du mât, tourné comme la nacelle → une pose visée sur le moyeu raccorde sur place. `world.js` accroche les pales (`A.pitch[k]`), l'aile (`A.root[0]`) et les filets (racine) aux repères du système : le pas et la rotation n'existent qu'à un endroit (`model.js`). `FIRST` : 41 nombres, dont 8 de lumière. `tipKmh`, `turnsOver` (le rotor avance avec `rpm`), `NOMINAL` 18, `IDLE` 3.
- `main.js` : en-tête = vitesse en bout de pale (de `rpm`, signal > 200 km/h) + « Pales » (pas de la pale A, veille).
- Actes : cinq fichiers — `acte2.js` (on l'ouvre, l'éclaté, 9,6 s) et `acte2b.js` (principe + repos, 18,3 s, 7 phrases) coupés en deux pour que l'acte 2 ne soit pas l'agent le plus lent. Squelettes qui construisent.
- `index.html` : étiquettes (réseau, portée, modèle, cœur, seule, relais, tours, ARIA, tiers), titre barré « Un frein » → « Le vent lâché », duel Panne / Sécurité, prochain dossier 037 (la phrase de la voix, sans chiffre), opacité 0 au départ (le modèle ne l'avait plus : 80 erreurs de chevauchement au premier `check`).
- `episode.json` : 78 repères vérifiés sur la table (aucun sur un autre mot ; `deux` évité : il attrape « deux mille dix-neuf », d'où `plie+0.44`) ; `explode` déplacé de « on » à « l'ouvre » ; 28 sons, tous dans les souffles (l'impact de l'éclaté après « l'ouvre », celui du déclenchement après « pivote », le blip du verdict après « ralentit ») sauf `rewind` (sous la boucle, comme au 025) ; ambiance `rain` sur la tempête ; `cover` à `eclate$` ; quatre lignes de `sources` (en-tête, maquette, voiture à portée, Formerie reconstituée).
- `npm run check -- 036` passe (1 avertissement : contenu au bord haut).

## Planches (24 images lues sur 25)
1. Bouchons, 8 : candidates trop lointaines (rotor ≈ 25 %, voiture hors champ) ; conventions : pas 90 = un trait vu de face ✓, pale B en bas à droite ✓ (horaire), établi ✓.
2. 8, avec l'en-tête : voiture toujours hors champ (elle était au bord gauche) ; en-tête « 185 km/h · PALES 0° » lisible ; le coffret A caché dans le moyeu plein du bouchon.
3. 8 : voiture rapprochée (180 → 100 m) et visée entre la voiture et le moyeu : (a) et (c) montrent la voiture et le rotor ; (d) sort le rotor en haut à gauche ; l'aile du principe hors champ (non vérifiée à l'image : elle est montée par construction dans `A.root[0]`).

## Décisions
- La voiture est **arrêtée** (`kmh` 0 passé à la route) : l'événement en cours, ce sont les pales. Aucun nombre de la route n'est dans `FIRST` sauf `shell`, `you`, `rain`.
- 200 km/h colore l'en-tête (la voix le dit menace) ; au repos, `rpm` 12 (encre) pour ne pas mentir.
- Formerie se joue sur notre éolienne avec `gel` 0,25 et la fiche à l'écran (le modèle n'est pas dans la fiche ARIA : `sources` le dit).
- Le prochain dossier n'a pas d'objet 3D (le `voir` d'`abo` voulait un boîtier sur un sac de parachute : un modèle de plus pour 5 s — non).

## Poses provisoires (réglées sur bouchons) — à recaler par le chef de production
`POSE0` (= `VIEW.behind`), `VIEW.windscreen`, `VIEW.road`, `VIEW.verge`, `VIEW.wide`, `VIEW.rotor`, `VIEW.section` (non vue), `VIEW.ladder` (non vue), `VIEW.system`, `VIEW.root`, `VIEW.whole`, `VIEW.exploded`, `VIEW.motor` (non vue), `VIEW.battery` (cachée par le moyeu du bouchon), `VIEW.brake` (non vue). Toutes. Le `cover` d'`episode.json` aussi.

## À changer ailleurs
- `kit/template/index.html` : la ligne `.chip--live, #retitle, #net, #next, #cta-field, #duel, #film, .rail { opacity: 0; }` a disparu du modèle — sans elle, `check` compte toutes les étiquettes comme superposées. La remettre.
- `scripts/sd.mjs` (`script`) : une option `--words` (la table mot à mot ; je l'ai tirée de `gen/episode.data.js`) — demandée depuis le 021.
- `kit/lib/` : `makeStreaks` (pluie, veines de vent) recopiée une 6ᵉ fois → `kit/lib/effets.js` (catalogue, « Recommandations » 7).
- Décorateur (après les décors) : `eolienne.js` seulement — balisage lumineux de la nacelle (rouge la nuit : un battement lent, jamais un clignotement), plateforme de grutage, chemin d'accès, poste de livraison ; rien sur le rotor ni devant le moyeu. La route a déjà son habillage (025).

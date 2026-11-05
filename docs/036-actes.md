# 036 · L'éolienne dans la tempête — le plan de mise en scène

**La voix est enregistrée** (`eleven_v4_turbo`, une prise, **88,7 s**) : le minutage est RÉEL. Tout instant se lit dans le script — un repère d'`episode.json` (`cues` : 78, vérifiés mot à mot sur la table ; image et son lisent les mêmes) ou `D.times({ nom: "beat:mot" })` — **jamais un nombre de secondes en dur**. Les secondes ci-dessous servent à se repérer (`npm run script -- 036`). Cinq fichiers, un agent chacun : `acte1.js`, `acte2.js`, `acte2b.js`, `acte3.js`, `fin.js` (des squelettes qui construisent, à réécrire en entier). Forme : `episodes/017-irm/src/acte*.js` ; fin : `kit/template/src/fin.js` ; outils : `kit/lib/direct.js`, `kit/lib/blocks.js`. Les poses qui cadrent seront dans les journaux des décors (`docs/journal/036-model.md`, `036-eolienne.md`, `036-vent.md`) : pars d'elles, `VIEW` a été réglé sur des bouchons.

## Ce qui vaut pour tous

- **La scène est un scénario** (`sources` le dit) : une nuit de tempête, le réseau coupe, le rotor s'emballe, les batteries de chaque pale les mettent en drapeau. **L'emballement est un instant, pas dix secondes** : le rotor accélère le temps d'une phrase, jamais d'une scène entière. Aucun délai en secondes (aucune source), aucun vérin, aucun freinage du rotor (le frein reste froid). Le seul cas réel est Formerie (2019), jamais dit « tempête ».
- **Le temps réel.** `rotor` (tours) avance avec `rpm` : chaque fois que `rpm` change sur un plan, `rotor` change dans le même tween de `turnsOver(rpm0, rpm1, durée)` (`world.js`) — `"none"` si la vitesse est tenue, `"power1.in"` si elle part de 0. Un plan où les pales ne tournent pas alors que `rpm` > 0, c'est une image fausse. Trois pales identiques : une coupe peut remettre `rotor` à une valeur égale modulo 1/3.
- **L'en-tête est l'emballement et sa réponse** (`main.js`) : en grand, la vitesse en bout de pale tirée de `rpm` (rotor de 82 m : 11 tr/min ≈ 170 km/h, 13 ≈ 200, 16 ≈ 247, 19 ≈ 294, 3 ≈ 46) — **signal au-dessus de 200 km/h**, encre en dessous ; « Pales » : le pas de la pale A en degrés (0 → 90), veille. **Tu ne les écris jamais : tu bouges `rpm` et `pitchA`.** Le chiffre doit passer 200 SUR « deux cents » (`kmh200` 12,17) et 90° sur « quatre-vingt-dix » (`deg90a` 34,99, `deg90b` 55,19). Sur l'établi, `rpm` garde sa valeur (le rotor y est arrêté, l'en-tête lit l'histoire).
- **Deux lieux, un objet.** L'établi est posé exactement où est le sommet du mât, tourné comme la nacelle : **une pose visée sur le moyeu se lit pareil dans la scène et sur l'établi** — la coupe vers l'établi raccorde sur place (`VIEW.root`, `VIEW.system`). Une coupe dit tout son état : `{ ...STAGED, … }` (la scène) ou `{ ...BENCHED, … }` (l'établi), plus `rotor`, `rpm`, les pas, `batt`, `charge`, `motors`.
- **Azimut** (`kit/lib/stage.js`) : `az` 0 se tient en +z, −90 en −x. Vu de la voiture, le mât est devant (−z) et à droite (+x) : une caméra derrière la voiture qui regarde le rotor a `az` ≈ −12. Le cône du rotor regarde vers `az` −50 (`TURBINE.heading`, `H` dans `world.js`). Le rotor tourne dans le sens horaire vu de face ; pale A en haut à `rotor` 0, B à 120° (en bas à droite vu de face), C à 240°.
- **Le pas** : 0 = la pale produit, corde en travers (« de biais ») ; 90 = en drapeau, elle montre sa tranche au vent. Vu de face (`VIEW.rotor`), une pale à 90 n'est plus qu'un trait : c'est la lecture de « chaque pale pivote ».
- **Chaque phrase a sa démonstration**, sur le mot. **Chaque coupe est un raccord** (forme, objet, mouvement) et se pose quelques images avant sa phrase (les repères `to…` sont 0,10–0,24 s avant). Un acte commence par une coupe complète et rend la main à l'instant où le suivant coupe ; rien ne déborde.
- **Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe, jamais à moins d'une seconde) : *s'emballent* (`choc` 2,51), *vieilli* (`vieilli1` 8,71), *lâcher* (`lacher` 14,01), *courant* (`courant1` 17,57), +batterie+ (`batterie2` 28,03), +ralentir+ (`ralentir` 38,47), *s'emballe* (`emballe` 50,63), +pivote+ (`trigger`/`pivoted` 54,5), *pas* (`verdict` 62,09), *deux* (`plieDeux` 72,73). `D.captionStyle({ hit: 0.25 })` une fois (acte 1).
- **« Alors… on l'ouvre. »** (18,65 → 19,95) est seul dans son plan : « Alors… » se dit dans la scène pendant que le vent tombe (`storm` → 0,3) et que la caméra recule du pied de pale ; la coupe vers l'établi tombe dans le souffle (`tobench` 19,37) ; **l'éclaté s'ouvre SUR « l'ouvre »** (`explode` 19,63). Le son : `suck` jusqu'à `ouvre−0,04`, `hush` de `ouvre` à `explode`, l'impact dans le souffle qui suit.
- **La grille de rétention** (`docs/recette-actes.md`) : l'image 1 bouge par son sujet (les pales, leur flou, la pluie) ; de 10 à 25 s, un changement toutes les 2 à 3 s, aucune plage lente de 2 s ; chaque porte d'acte, une coupe franche et son `hit`/`impact` (déjà dans `sfx`, dans les souffles). **Les sons sont posés** (`episode.json` → `sfx`, 28 entrées, tous dans les souffles sauf `rewind`) : n'en ajoute pas sans le dire.
- **La boucle** : la dernière phrase (« Seul, comme une éolienne en pleine… ») retombe sur « Tempête. » ; **la dernière image est la première** (`POSE0`, `FIRST`).
- **Couleurs** : `mood` 1 dans la tempête jusqu'à « retombe » (`retombe` 58,23), 0 sur l'établi, au principe, au repos et après. Jamais à mi-chemin plus d'une demi-seconde. `charge` < 0,5 = signal.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet 440–1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie AVEC l'en-tête. La lumière suit le sujet : `fx, fy, fz` autour de lui, `fs` sa taille (≈ 6 000 la tempête vue de la route, ≈ 1 500 le moyeu, ≈ 400 un coffret, `SIZE` sur l'établi).
- **Anti-parasites** : ce que la caméra frôle est invisible ; un quart de tour en une seconde est une coupe ; une montée de 100 m (de la route au moyeu) se fait **par rapport** (`shot(at, durée, pose, ease, fromD)`), sinon le dernier mètre passe en trois images ; les traînées de pluie et le flou des pales ne doivent pas scintiller (`qa`) — si un plan scintille, baisse `storm`, pas la vitesse des pales.
- Toi, de près, es de verre ; le technicien aussi : jamais en très gros plan. Personne n'est blessé ; aucune pale ne touche la voiture (« à portée » est un arc, pas un impact).
- **`FIRST` est une liste fermée** (aucun nom de propriété de GSAP) : s'il te manque un nombre, « À changer ailleurs ». Étiquettes en capitales, sans unité à symbole. **26 images lues au plus.** Journal : `docs/journal/036-<ton fichier>.md`. Planches et `essais.json` dans `.cache/planches/036/<ton fichier>/`, jamais dans le dépôt ni dans `renders/`.

**Les étiquettes** (`index.html`, invisibles tant qu'un acte ne les fait pas entrer) : `chip-reseau` (Réseau électrique / Coupé, signal — acte 1 et acte 3) · `chip-portee` (Ta voiture / À portée, signal) · `chip-modele` (Sur ce modèle / Moteurs électriques, encre) · `chip-coeur` (Le cœur / Une batterie par pale, veille) · `chip-seule` (Une seule pale / Tout le rotor ralentit, veille) · `chip-relais` (Batteries / Prennent le relais, veille) · `chip-tours` (Le rotor / Environ trois tours par minute, veille) · `#retitle` (Ce qui la ralentit : « Un frein » barré → « Le vent lâché ») · `chip-aria` (Fiche ARIA n° 53010 / Formerie · janvier 2019, encre) · `chip-tiers` (Batteries / Au tiers de leur capacité, signal) · `#duel` (Panne ou Sécurité) · `#net` (like) · `#next` (Prochain dossier · 037 — « Un boîtier qui déclenche ton parachute à ta place. ») · `.rail`. Les pièces se nomment avec `co.add`, sans chiffre (« Nacelle », « Générateur », « Moyeu », « Moteur de pas », « Batterie »).

---

## `src/acte1.js` — 01 · MENACE (0 → `tobench` 19,37)

Part de `POSE0` et de `FIRST`, sans coupe ; deux coupes au plus (`toscene`, `tovoiture`), le reste en mouvements. `rpm` 11 à l'image 0, `rotor` qui tourne dès l'image 1.

| repère | la voix | l'image — la part du cadre que tient le sujet |
| --- | --- | --- |
| 0 → 1,11 | « Tempête. » | `POSE0` : les pales balaient la pluie (flou, traînées encre), le rotor ≈ 50 % de la largeur en haut, le mât, la voiture en bas à gauche ; `rpm` 11 → 12,5 jusqu'à `choc` (l'en-tête monte, encre). Aucun texte à l'image 0 |
| 1,11 → 2,95 | « Au-dessus de toi, les pales *s'emballent*. » | sur `choc` 2,51 : `D.punch` ; les traînées des bouts s'allongent ; la caméra pousse lentement vers le rotor (rotor → 60 %) |
| 3,31 → 4,71 | « Et chacune n'a plus qu'une +batterie+. » | sur `batterie1` 4,39 : `batt` 0 → 1 — un point vert dans le moyeu (≥ 40 px) |
| 5,18 → 6,35 | « Le réseau a sauté : » | sur `saute1` 5,59 : `mains` 1 → 0, le câble vert au pied du mât meurt (il est dans le cadre de `POSE0`, en bas) ; `chip-reseau` ; la caméra commence à monter le long du mât (par rapport, `sine.inOut`) |
| 6,35 → 7,67 | « c'est elle qui doit +sauver+ ce géant. » | la montée continue jusqu'à `VIEW.system` (le moyeu ≈ 45 % de la largeur), `cover` → 0,4 : les trois coffrets verts dans le moyeu plein ; `fs` → 1 500 |
| 8,15 → 9,03 | « Si elle n'a pas *vieilli*. » | sur `vieilli1` 8,71 : `charge` 1 → 0,33, la jauge du coffret A descend et vire au signal (cadre resserré sur lui) |
| `toscene` 9,69 → 11,1 | « Le rotor accélère. » | **coupe 1** (raccord : du moyeu au rotor entier) : `VIEW.rotor`, d'en bas, presque de face, le rotor ≈ 70 % de la largeur ; `charge` revient à 1 (hors champ) ; `rpm` 12,5 → 13 sur `kmh200` |
| 11,1 → 13,1 | « Le bout des pales dépasse deux cents kilomètres-heure. » | sur « deux cents » (`kmh200` 12,17) l'en-tête passe 200 et vire au signal ; les traînées des bouts passent au signal ; `rpm` → 15 |
| 13,5 → 14,4 | « Une pale peut *lâcher*… » | sur `lacher` 14,01 : `shake` 0 → 1 sur la pale A (`D.punch` sur le mot) |
| `tovoiture` 14,61 → 15,7 | « ta voiture est à portée. » | **coupe 2** (raccord : du bout de pale vers le bas) : un plan vertical du rotor à la route (`VIEW.wide` resserré, `el` ≈ −10), `reach` 0 → 1 tracé du bout de pale à la voiture ; `chip-portee` ; `shake` → 0 |
| 15,7 → 16,93 | « Il faut les faire pivoter. » | on remonte de la voiture au pied de la pale A (par rapport, vers `VIEW.root`) ; `rotor` posé pour que A soit en haut à l'arrivée (modulo 1/3) |
| 17,41 → 17,81 | « Sans *courant*. » | `VIEW.root` : le pied de pale immobile sur son axe, `motors` 0 (le moteur reste noir) |
| 17,81 → `tobench` 19,37 | « Alors… » | le vent tombe (`storm` → 0,3, `rpm` → 0 : le rotor s'arrête avec A en haut), la caméra recule du pied de pale vers `VIEW.root` élargi ; `mood` reste 1 |

**Couture de sortie** : `VIEW.root` (ou ta variante vue), `rotor` ≡ 0 modulo 1/3, `rpm` 0, pas à 0, `batt` 1, `charge` 1, `motors` 0, `cover` ≈ 0,4. L'acte 2 coupe de là sur l'établi.

## `src/acte2.js` — 02 · AUTOPSIE : « on l'ouvre », l'éclaté (`tobench` 19,37 → `toprincipe` 28,96)

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `tobench` 19,37 | *(souffle)* | **coupe sur l'établi, même pose** (`VIEW.root`), `{ ...BENCHED, batt: 1, charge: 1, motors: 0 }` — le raccord tient sur place ; `setAct 2` |
| `explode` 19,63 → 20,9 | « …on l'ouvre. » | sur « l'ouvre » : `explode` 0 → 1 (`power2.out`), la caméra recule vers `VIEW.exploded` (le système ≈ 80 % de la hauteur utile) |
| 20,98 → 21,8 | « En haut du mât, » | `litMast` (le haut du mât et sa couronne) |
| 21,75 → 23,1 | « la nacelle et son générateur. » | `litNacelle` sur `nacelle`, puis `litGen` sur `generateur` (le capot levé, l'anneau dessous) — `co.add` |
| 23,51 → 24,45 | « Devant, le moyeu. » | `litHub` sur `moyeu` ; la caméra glisse vers lui |
| 24,88 → 25,95 | « Dedans, sur ce modèle, » | on entre dans le moyeu ouvert (par rapport, vers `VIEW.motor` élargi : les trois moteurs et leurs coffrets) ; `chip-modele` sur `modele` |
| 26,23 → 27,15 | « un moteur par pale… » | sur `moteur` : `motors` 1, `litMotor` ; un petit geste : `pitchA` 0 → 15 → 0 (le pignon tourne) |
| 27,43 → 28,35 | « et sa propre +batterie+. » | `VIEW.battery` : sur `batterie2` 28,03 `heart` 1 (le coffret de la pale A seul, les autres s'assombrissent), `chip-coeur` ; `D.punch` |

**Couture de sortie** : l'établi, `VIEW.battery`, `heart` 1. L'acte 2b coupe dans la scène. **Couverture** (`cover`, instant `eclate$`) : propose la pose et l'état (éclaté, `heart` 1, `el` ≥ 28).

## `src/acte2b.js` — le principe et le repos (`toprincipe` 28,96 → `tozero` 47,30)

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `toprincipe` 28,96 → 30,0 | « Pourquoi ça marche ? » | **coupe dans la scène** (raccord : de la batterie de la pale A à la pale A elle-même) : `VIEW.section`, `rotor` 0,25 (la pale A à l'horizontale), `rpm` 0, `storm` 0,3, `mood` 0 ; la coupe de la pale au centre (≈ 40 % de la largeur), le moyeu flou au loin (`dof`) |
| 30,15 → 31,3 | « Une pale, c'est une aile : » | sur `aile` 31,11 : `flow` 0 → 1 — le profil s'allume veille, les filets arrivent |
| 31,70 → 32,3 | « de biais au vent, » | sur `biais` : les filets se déroulent de biais autour du profil (`pitchA` 0) |
| 32,59 → 33,43 | « elle tire le rotor. » | sur `tire` : `lift` 0 → 1, la flèche ; `rpm` 0 → 2 (le rotor repart, la coupe glisse un peu : la caméra la suit) |
| 33,87 → 35,75 | « En drapeau, tournée de quatre-vingt-dix degrés, » | `gauge` 0 → 1 sur `drapeau` ; `pitchA` 0 → 90 de `drapeau` à `deg90a`+0,7 (`sine.inOut`) : l'en-tête 0° → 90° |
| 36,11 → 36,95 | « l'aile ne porte plus. » | sur `porte` : la flèche est à 0, les filets droits, la tranche face au vent |
| 37,47 → 38,95 | « Une seule suffit à tout +ralentir+. » | **coupe** (raccord : de la pale A à tout le rotor) `VIEW.rotor` : A à 90, B et C à 0 ; `rpm` 14 → 5 (le rotor ralentit à vue) ; `chip-seule` ; `D.punch` sur `ralentir` |
| `torepos` 39,30 → 42,7 | « Par vent fort, ses pales pivotent juste assez pour garder leur vitesse. » | **coupe** : la tempête (`STAGED`, `storm` 1, `mood` 0), de loin, depuis la route (`VIEW.behind` ou `VIEW.road`), `rpm` 12 tenu (en-tête encre, constant) ; sur `pivotent` les trois pas bougent par petites touches (4 → 10 → 7 → 12) |
| 43,06 → 44,6 | « Ses batteries, elles, attendent. » | **coupe** au sommet (`VIEW.system`, `cover` 0,3) : les trois coffrets, `batt` 0,4, immobiles — rien ne bouge qu'eux ne fassent |
| 44,95 → 46,95 | « Et quand le courant saute… il ne reste qu'*elles*. » | sur `saute2` : `motors` 1 → 0,2 d'un coup (le courant manque) ; sur `qelles` : `batt` → 1 |

**Couture de sortie** : la scène, `batt` 1. L'acte 3 coupe à `tozero`.

## `src/acte3.js` — 03 · RÉPONSE (`tozero` 47,30 → `toverdict` 60,61)

En coupes ; un plan par souffle. `mood` 1 jusqu'à `retombe`.

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `tozero` 47,30 → 48,1 | « Le réseau coupe. » | **coupe** depuis la route (`VIEW.behind`), `STAGED`, `rpm` 12, pas 8, `mains` 1, `motors` 1, `batt` 0,3, `charge` 1 ; sur `coupe` : `mains` → 0, `chip-reseau` ; `setAct 3` |
| 48,47 → 49,83 | « Plus de courant pour les moteurs de pales. » | **coupe** au sommet (`VIEW.system` resserré, `cover` 0,3) : sur `moteurs1` `motors` 1 → 0, les trois moteurs s'éteignent |
| 50,19 → 51,03 | « Le rotor *s'emballe*. » | **coupe** d'en bas (`VIEW.rotor` large) : `rpm` 12 → 19 de `emballe` à `trigger` (`power1.in`, `rotor` avec), flou et traînées signal, en-tête ≈ 294 |
| 51,62 → 52,59 | « Les batteries prennent le relais. » | **coupe** sur les coffrets (`VIEW.battery` élargi : les trois) : sur `relais` `batt` → 1 (veille franc), `chip-relais` |
| 52,91 → 53,71 | « Les moteurs tournent. » | même cadre, glisse vers un moteur : `motors` → 1, `pitchA/B/C` 8 → 20 (les pignons tournent) |
| `trigger` 54,46 → 56,03 | « Chaque pale +pivote+. Quatre-vingt-dix degrés. » | **coupe** sur le rotor entier, de face et d'en bas (`VIEW.rotor`, le rotor ≈ 75 % de la largeur) : les trois pas 20 → 90 d'ici à `deg90b`+0,8 (`sine.inOut`) — les trois pales deviennent des traits ; en-tête 90° |
| 56,43 → 57,23 | « Plus rien ne pousse. » | le flou s'efface ; `rpm` 19 → 8 |
| 57,59 → 60,03 | « Et le rotor retombe… à quelques tours par minute. » | sur `retombe` : `mood` → 0 ; `rpm` → 3 jusqu'à `tours` (`power2.out`), `chip-tours` ; la caméra recule lentement |

**Couture de sortie** : `rpm` 3, les trois pas à 90, `batt` 1, `mains` 0, `mood` 0.

## `src/fin.js` — chute, ce qui est dû, like, prochain dossier, boucle (`toverdict` 60,61 → 88,73)

| repère | la voix | l'image — la part du cadre |
| --- | --- | --- |
| `toverdict` 60,61 → 63,3 | « Voilà le secret : ce n'est *pas* un frein qui la ralentit. » | **coupe** au sommet (`VIEW.brake`, `cover` 0,3, rotor au ralenti) : `litBrake` 1, l'étrier froid, encre ; `retitle` (« Un frein » barré sur `verdict`) ; `D.verdict(verdict)` |
| 63,61 → 64,17 | « Ni la batterie. » | sur `nibatt` : `batt` 1 → 0,2 (elle a fini son effort) |
| 64,53 → 65,69 | « C'est le +vent+ qu'elle lâche. » | **coupe** large (`VIEW.rotor`), pas 90, `rpm` 3, `slip` 0 → 1 ; `retitle` passe à « Le vent lâché » sur `ventlache` |
| `tocta` 66,51 → 67,7 | « Et si la batterie a vieilli ? » | **coupe** sur le coffret A (`VIEW.battery`, scène, `cover` 0,3) : sur `vieilli2` `charge` 1 → 0,33, signal |
| 68,30 → 71,4 | « Formerie, deux mille dix-neuf : batteries au tiers de leur capacité. » | `chip-aria` sur `formerie`, puis `chip-tiers` sur `tiers` ; `gel` 0,25 (la reconstitution) |
| 71,73 → 72,9 | « Le mât a plié en *deux*. » | **coupe** `VIEW.wide` : pas à 0, `rpm` 16 ; `fold` 0 → 1 de `plie` à `plieDeux`+0,3, loin de la route ; `D.punch` sur `plieDeux` |
| 73,27 → 77,21 | « En commentaire : une éolienne à l'arrêt par grand vent… panne, ou sécurité ? » | **coupe** (`fold` 0, `gel` 0) : l'éolienne en drapeau dans la tempête, `rpm` 3 ; `duelCall` : `panne` (signal) / `securite` (veille) — le film ne répond pas |
| `tolike` 78,08 → 80,39 | « +Like+ : pour ceux qui grimpent là-haut tester ces *batteries*. » | `VIEW.ladder` : `tech` 0,2 → 0,6 sur l'échelle, les coffrets verts en haut ; `likeCall` |
| `toabo` 80,72 → 85,51 | « +Abonne-toi+ : prochain dossier, un boîtier qui déclenche ton parachute à ta place, si tu ne le fais *pas*. » | `VIEW.wide` (l'éolienne au repos, le sujet sous le panneau) ; `nextFile` (raccord prochain dossier : rien du parachute en 3D) ; plus rien du sujet ne revient |
| `toloop` 86,07 → 88,73 | « Seul, comme une éolienne en pleine… » | **coupe** sur `POSE0` reculée : `FIRST` (`rpm` 11, pas 0, `batt` 0, `charge` 1, `mains` 1, `mood` 1, `storm` 1) avec `rotor` = `FIRST.rotor − turnsOver(11, 11, durée jusqu'à la fin)` arrondi au tiers, qui revient à `FIRST.rotor` à la dernière image ; `D.loop` |

**La dernière image est la première** : tire 0,04 et 88,70 côte à côte.

---

## La première image — quatre candidates

« Tempête. Au-dessus de toi, les pales s'emballent. » Contre-plongée depuis la route, nuit, pluie, les pales qui s'emballent dès l'image 1, la voiture en bas. Fichier prêt : **`.cache/planches/036/premiere-image.json`** (les quatre à 0,04 s puis à 0,5 s, sans état : `FIRST`) — `npm run look -- 036 --file .cache/planches/036/premiere-image.json --out .cache/planches/036/premiere-image.jpg --cols 4`. Notées sur bouchons (sur les six points : événement en cours · perspective basse · menace derrière · forme reconnue à 40 % · système lisible · bouge par son sujet) ; **à re-tirer sur les vrais décors** : sur bouchon le rotor fait 40 à 55 % de la largeur et se tient trop haut, sous l'en-tête — à recadrer au `shift` (négatif : l'image descend) ou en rapprochant.

- **(a) Derrière ta voiture** (`POSE0` provisoire) — 5/6. Événement ✓ (les pales, la pluie), basse ✓, menace derrière ✓ (les rafales derrière le rotor), forme ✓ (≈ 50 %), système ~ (le moyeu petit : ≈ 30 px sur bouchon), bouge ✓. La voiture de verre en bas à gauche, ses phares vers le pied du mât : le « toi » sans légende. Risque : la voiture sous 1600.
  `{ "tx": -959, "ty": 4728, "tz": -1597, "d": 13064, "az": -12.2, "el": -20, "fov": 70, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`
- **(b) Par le pare-brise** — 4/6. Depuis ta tête, à travers le pare-brise : « au-dessus de toi » littéral. Basse ✓✓, bouge ✓, forme ✓ ; le cadre du pare-brise ne se lit pas encore sur bouchon (un montant seul), le système petit. Risque : un plan « d'habitacle » confus si le verre de la voiture charge l'image.
  `{ "tx": -636, "ty": 5584, "tz": -1311, "d": 12469, "az": -15, "el": -26, "fov": 76, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`
- **(c) La route qui file** — 5/6. De 30 m derrière, objectif plus long : la route file vers le pied du mât (point de fuite ✓), la voiture au milieu, le rotor par-dessus la route, le plus grand des quatre. Risque : la voiture petite (≈ 40 px), le « toi » moins direct.
  `{ "tx": -1263, "ty": 4923, "tz": -1346, "d": 14844, "az": -9.4, "el": -19, "fov": 50, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`
- **(d) De l'autre bas-côté** — 3/6. De l'autre côté de la route, la voiture de profil devant, l'éolienne derrière : sur bouchon le rotor sort en haut à gauche (à refaire : `az` plus près de −35, `fov` 56). Risque supplémentaire : la perspective peut mettre la voiture « sous » le rotor — ce que la contre-vérification interdit.
  `{ "tx": 4049, "ty": 4764, "tz": 1895, "d": 13724, "az": -50.5, "el": -20, "fov": 64, "shift": 0, "side": 0, "roll": 0, "drift": 0, "dof": 0 }`

Ma préférence sur bouchons : **(a)**, puis (c). Ce qui la fera gagner sur les vrais décors : le flou des pales (`eolienne.js`), le moyeu sombre sur son halo, la pluie oblique (`vent.js`). `glide` à essayer sur `rpm` (c'est le rotor qui accélère, pas la caméra).

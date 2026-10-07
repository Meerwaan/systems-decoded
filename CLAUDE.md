# Système Décodé

Compte TikTok qui ouvre les systèmes de sécurité (détecteur de fumée, airbag, disjoncteur, sprinkler, ascenseur…) et les explique en **storytelling + motion design 3D**. Merwan envoie un thème ; tu livres une vidéo verticale prête à publier : script, voix ElevenLabs, image HyperFrames, habillage sonore, MP4.

Tout se parle et s'écrit en français. Le public est francophone, on le tutoie.

L'ambition, dans les mots de Merwan : pas un compte qui suit la tendance, **le meilleur** — un rendu « digne d'un vrai studio d'animation », une 3D irréprochable, un storytelling aux petits oignons. Une image où « on ne distingue rien » ou qui « fait amateur » ne sort pas d'ici.

## Le compte

| | |
| --- | --- |
| Nom affiché | **Système Décodé** (choisi par Merwan le 2026-10-05 ; « Vue Éclatée » et « Systems Decoded » écartés) |
| @ | `@systeme.decode` — replis : `@systemedecode`, `@systeme_decode` |
| Bio | Ils veillent pendant que tu dors.⏎On les décode, un système à la fois. |
| Photo de profil | `brand/avatar.png` (source `brand/avatar.svg`, export `npm run brand`) : un œil ouvert en deux, le cœur allumé |
| Couverture de grille | `npm run cover -- <ep>` → `renders/<ep>-couverture.png`, toujours la même mise en page : DOSSIER 00X, titre sur deux lignes, vue éclatée |

Le nom n'existe qu'à un endroit dans le code : `BRAND.name` (`kit/lib/brand.js`). Il est affiché à droite de l'en-tête de chaque vidéo et **s'allume en vert au moment de la chute** (`brandHud`) : le nom du compte est aussi le verdict du dossier. Pas d'emoji dans le nom ni la bio.

## La règle qui passe avant tout : storytelling et rétention

C'est ce qui fait grimper le compte. Un épisode n'est pas une fiche technique, c'est une scène : quelqu'un, un danger, et un système qui a quelques secondes pour agir. La technique arrive **quand l'histoire en a besoin**.

### L'accroche, c'est 99 % du travail

Les images retiennent ; l'accroche décide si on reste pour les voir. Elle tient en trois temps, dans les 8 à 9 premières secondes — la **méthode ABC** de Merwan :

- **A · Accroche** (0 → 4 s) : une phrase choc, concrète, à la 2ᵉ personne, au présent. Elle menace ou contredit. Jamais de « Saviez-vous que », jamais de présentation.
- **B · Bénéfice** : pourquoi ça le concerne, ce qu'il y gagne. Une phrase.
- **C · Curiosité** : une question ouverte, précise et personnelle, dont la réponse n'arrive **qu'à la fin**, avec l'appel au commentaire.

002, tel qu'il est monté : « Cinquante kilomètres-heure. Dans une seconde, ton volant t'explose au visage. » (A) « C'est ce qui va te sauver la vie. » (B) « Sauf si tes mains sont au mauvais endroit. » (C) — la réponse (9 h 15) tombe 75 secondes plus tard.

Pour varier d'un épisode à l'autre sans perdre l'efficacité : l'heure précise et la scène (001 : « Trois heures sept. Tu dors. Et ton nez… dort aussi. »), le paradoxe (« il te sauve en se dégonflant »), le chiffre qui ne colle pas. Quelle que soit la forme, les trois fonctions A, B, C doivent être remplies avant la 10ᵉ seconde.

Ce qui va avec :

- **La première image** est la plus forte du film, et elle montre déjà ce que dit l'accroche. Elle doit tenir seule, sans le son.
- **Les cartes d'accroche** (`buildHook`) : les phrases du A, du B et du C sont à l'écran **en entier**, en attente, avant d'être dites, et s'allument mot à mot. Qui fait défiler sans le son lit l'accroche dès l'image 1.
- **La voix démarre vite** (`lead` ≈ 0,2 s) et l'accroche se joue avec de l'énergie, **sans crier** : `npm run voice` pénalise un silence dans la première phrase, signale une phrase « criée » (plus de 4 dB au-dessus du reste) et la baisse au mixage.
- **La boucle est sacrée** : la dernière phrase du film est inachevée et se termine par les premiers mots de l'accroche. Réécrire une accroche, c'est d'abord garder ces premiers mots (002 : « …Surtout à… » → « Cinquante kilomètres-heure. »).

### La structure d'un épisode (≈ 75–95 s)

1. **Accroche A · B · C** (voir ci-dessus).
2. **La scène et le compte à rebours** : ce qui se passe si rien n'agit. Le chrono reste à l'écran jusqu'à la fin.
3. **« Alors… on l'ouvre. »** : la vue éclatée. Énumération courte, puis on isole **le cœur**.
4. **Le mécanisme au repos** : comment il attend. Phrases courtes, une idée par phrase.
5. **Le danger arrive** : on reprend le chrono, le mécanisme réagit, climax.
6. **Chute** : on retourne l'idée reçue (« Tu ne percutes pas un airbag qui se gonfle. Tu t'enfonces dans un airbag qui se dégonfle. »).
7. **Appels à l'action**, dont celui qui paie la curiosité du C.
8. **Rebouclage** : dernière phrase inachevée, dernière image = première image.

Relance la tension toutes les 8–12 s (un fait, une question, un changement de plan). Aucune phrase ne doit pouvoir être coupée sans que l'histoire y perde.

### L'animation raconte aussi

Leçon tirée d'une vidéo de @souslecapot_ que Merwan a montrée en exemple (20 000 vues en 2 h) — on en garde le principe, pas le trait :

- **Chaque phrase a sa démonstration** : ce qu'elle dit se passe à l'écran pendant qu'elle le dit. Une image qui illustre « à peu près » est à refaire.
- **Les plans s'enchaînent** : un plan naît du précédent — on suit la pièce qui bouge, on recule depuis le détail qu'on vient de montrer, on raccorde sur une même forme. Pas de plans déconnectés.
- **On distingue tout, tout de suite** : un sujet par plan, grand, clair sur fond sombre. Si une capture réduite à 270 px de large ne se lit pas, le plan est raté.
- **Moins d'habillage, plus de mécanisme** : un panneau n'entre que s'il apporte un chiffre que l'image ne peut pas montrer.

### Appels à l'action : jamais à la va-vite

Trois CTA par épisode — **like, commentaire, abonnement** — après la chute, chacun avec sa phrase, sa raison tirée de l'histoire, et son moment d'image. Un CTA expédié (« like et abonne-toi ») est interdit.

- **Like** : un motif altruiste ou utile, lié au sujet (001 : « ça remontera chez quelqu'un qui dort sans détecteur »).
- **Commentaire** : la question du C revient, on y répond en un mot (002 : « où sont tes mains sur le volant. Dix heures dix ? Le sac passe exactement là. »).
- **Abonnement** : le prochain dossier, classé, avec un seul fait comme appât.

À l'image, les chevrons `.rail` désignent la colonne de boutons de TikTok ; on n'imite pas l'interface. `npm run voice` signale un CTA dit trop vite (débit au-dessus des autres phrases) : le redonner à jouer avec une pause.

### Exactitude

C'est un compte qui apprend des choses aux gens : chaque fait est vérifié (recherche web) avant d'entrer dans le script, et noté dans `episode.json` → `sources`. Simplifier oui, inventer non. Les chiffres douteux sortent du script ou deviennent des ordres de grandeur.

## Notre patte (et ce qu'on ne copie pas)

@souslecapot_ : dessin au trait blanc sur fond bleu nuit, vues en plan, sous-titres par phrase soulignés de jaune. **On ne reprend pas ce trait.** Notre identité :

- **Le dossier** : chaque épisode est un « DOSSIER 00X », avec un HUD (titre, chrono, compte à rebours, actes 01 MENACE / 02 AUTOPSIE / 03 RÉPONSE, et le nom du compte qui s'allume à la chute).
- **Le temps réel** : l'histoire se déroule à la seconde, le chrono affiché est celui que dit la voix.
- **De la vraie 3D éclairée comme en studio** (Three.js) : pièces pleines aux arêtes fines, ombres douces, reflets, flou de mouvement, vue éclatée qui s'ouvre et se referme.
- **Deux matières** : le système qu'on autopsie est **plein** (sombre, arêtes claires, posé sur un halo de lumière) ; ce qui l'entoure — la voiture, l'immeuble, la cage d'ascenseur — est vu **aux rayons X** (coque de verre, traits fins, et à l'intérieur, pleins, les seuls éléments qui comptent).
- **Trois couleurs qui ont un sens** : `ink` #E9E4D8 (structure, texte) · `veille` #5CFFB0 (le système vivant) · `signal` #FF5B2E (la menace). Rien d'autre.
- **Typo** : Barlow Condensed (titres, sous-titres) + JetBrains Mono (HUD, données).
- **Sous-titres mot à mot**, le mot dit s'allume ; `*mot*` = signal, `+mot+` = veille.

**Les zones de TikTok comptent** (Merwan, 06/10, capture du 002 dans l'app sur son iPhone) : sur un écran haut, l'app rogne ≈ 53 px de chaque côté, sa barre de recherche couvre le haut jusqu'à y ≈ 205, ses boutons le bord droit (x > 905) de y ≈ 880 à 1760, le nom du compte et la légende tout ce qui est sous y ≈ 1620. Nos zones, en variables dans `kit/brand.css` (`--safe-l`, `--safe-r`, `--clear-r`, `--hud-top`, `--slot-top`) : HUD 236–410 · **zone haute 436–790** (un seul panneau à la fois) · sujet 3D 440–1160, plutôt à gauche du centre s'il descend sous 880 (`cam.side`) · cartes d'accroche 1186–1542 et sous-titres 1248–1488, marge droite 190 · rien d'important sous 1600. `npm run review` dessine ces zones sur chaque vignette : rien de lisible ne doit tomber dedans.

## Du thème à la vidéo

```
npm run new     -- 003 ascenseur "Ascenseur"   crée episodes/003-ascenseur depuis kit/template
npm run script  -- 003                         script, minutage, repères
npm run credits                                solde ElevenLabs (appel gratuit)
npm run voice   -- 003                         séance de doublage : annonce le coût, n'enregistre rien sans --budget
npm run review  -- 003 [--from s --to s --every s]   planche-contact : le film entier sur une page
npm run look    -- 003 --at 0.04,beat:mot+0.2  images d'essai côte à côte, zones TikTok par-dessus (renders/<ep>-essais.jpg)
                   --file essais.json          …chacune avec sa pose de caméra : [{ "at": …, "pose": { "d": 240 }, "label": … }]
npm run snap    -- 003 --at 1,8,20             images en pleine résolution
npm run check   -- 003                         lint + audits HyperFrames, doit passer
npm run preview -- 003                         lecture en direct dans le studio
npm run render  -- 003 [--draft]               MP4 dans renders/, audio à -14 LUFS
npm run qa      -- 003 [--file renders/003-ascenseur-draft.mp4]   le MP4 rendu (ou le brouillon) : voix calée, niveau, aucune image parasite, fluidité
npm run cover   -- 003                         couverture de grille
npm run phone   -- 003                         copie du film sous 30 Mio (renders/<ep>-iphone.mp4), pour l'envoyer au téléphone par la conversation
npm run front                                  bureau de publication + cabine d'écoute, pour l'iPhone (même Wi-Fi) — lancé depuis une session il s'arrête au bout de 2 h : pour le garder ouvert, Merwan double-clique `publier.cmd` (si un bureau tourne déjà, sa fenêtre l'annonce, donne l'adresse et prend le relais dès que l'autre s'arrête)
```

Ordre de travail : recherche et faits → script (`episode.json`) → **accroche validée par Merwan** → **voix** (elle fixe le minutage) → modèle 3D → mise en scène (`look` pour trouver chaque cadrage : dix poses en un coup d'œil, sans rendu) → `review` jusqu'à ce que chaque vignette se lise → `check` → `render --draft` puis `qa --file …-draft.mp4` (les images parasites se corrigent sur le brouillon, 80 s de rendu) → `render` → `qa` → `cover`. Si la mise en scène a été montée sur un minutage estimé en attendant l'accord voix (005), elle se **repasse phrase par phrase** une fois la voix enregistrée, avec `look` par paquets de huit images : sur le 005, cette passe a fait refaire la moitié du film (voir « Dossiers »). Le `build` (lancé par toutes ces commandes) tient à jour ce qui dépend du minutage : la voix montée en un fichier (`audio/voix.wav`) et l'habillage sonore (`audio/bed.wav`).

### Le script (`episode.json`)

Chaque beat = `{ id, text, vo, voAlt?, hold? }`.

- `text` : ce qui s'affiche. `*…*` et `+…+` colorent, `[85|quatre-vingt-cinq]` affiche « 85 » et fait dire le reste.
- `vo` : le même texte **dirigé** pour la voix — mêmes mots, même ordre (sinon l'alignement échoue avec un message clair).
- `voAlt` : d'autres directions pour la même phrase (`["[dramatic] …"]`). Les reprises alternent entre `vo` et `voAlt` : la cabine permet de comparer deux intentions de jeu. À utiliser pour l'accroche.
- `hold` : secondes de silence ajoutées après le beat, pour laisser une image frapper.
- `lead` / `tail` : silence avant le premier mot (≈ 0,2 s) et après le dernier (≈ 0,45 s).
- `post` : ce qui accompagne la vidéo à la publication — `caption` (prolonge l'accroche sans la répéter, finit par la question du CTA commentaire), `hashtags` (5, pas plus) et `pinned` (le commentaire que Merwan épingle). Le front les affiche avec un bouton copier.
- `cover` : l'instant et la pose de caméra de la couverture de grille (`at`, `title`, `cam`).
- `cues` : moments nommés, écrits contre le script : `"alarm": "verif$+0.3"`, `"flash1": "led:flash"`. Syntaxe : `beat`, `beat$` (fin), `beat:mot`, `beat:mot#2`, `±secondes`. Image **et** son lisent les mêmes repères : une nouvelle voix recale tout.
- `sfx`, `duck` : la liste des sons synthétisés et de combien de dB le fond s'efface sous la voix (−4,5 par défaut).

### La voix : une séance de doublage, et des crédits qui se respectent

Voix « Eric – Calm, Low & Reflective » (`9osbeK6KzhDRV0yX4rTq`), modèle `eleven_v4`. Exigence de Merwan : **jouée, jamais monotone** — et l'excellence, pas seulement le correct.

**On reste sur Eric** (Merwan, 06/10, au lancement du 004). Juste avant, il trouvait la voix « pas ouf » à côté des comptes qui ont « des voix d'acteur » ; je lui ai proposé un casting, il a tranché : Eric. À savoir pour le diriger : c'est une voix française que son auteur décrit comme intime et retenue, « rather than a polished announcer style » — poussée, elle crie ou elle susurre ; on la garde dans son registre (ferme, posé, `[tense]` sans majuscules pour l'énergie). Si la question revient, les candidates repérées dans la bibliothèque ElevenLabs (extraits gratuits) : Paul K — Deep French Narrator (`5l4ttmr4SKNgi0HnOelT`), François Louis (`UBXZKOKbt62aLQHhc1Jm`), Guillaume — Narrator (`ohItIVrXTBI80RrUECOD`), Hugo (`DbbNuBL7lf62XwY7arQb`), Anatole (`Jrq4GqCKqYpigdQsZRkP`). Une voix de bibliothèque doit être ajoutée à son compte avant de servir : avec son accord.

**Les crédits sont à Merwan.** Rien ne s'enregistre sans qu'il ait vu le coût et dit oui : `npm run voice` annonce l'estimation et s'arrête ; il faut `--budget <crédits>` pour dépenser, et seulement après son accord. `npm run credits` donne le solde. Ordres de grandeur : une prise complète ≈ 230 crédits, une reprise de phrase ≈ 40.

Comment ça marche :

- **Nouveau script** → 3 prises complètes (`--takes 3 --budget 750`). Chaque phrase de chaque prise est mesurée (mouvement de la hauteur, registre, débit, pauses, accent sur les mots en MAJUSCULES, fin de phrase) et comparée à la direction écrite dans `vo`.
- **Le montage** : le film garde, phrase par phrase, la prise qui l'a le mieux jouée, sans changer de prise pour un gain minime. Les coupes tombent à l'instant le plus calme des silences, avec un fondu.
- **Une phrase ne va pas** (direction non suivie, ou Merwan ne l'aime pas) → on réécrit **sa** ligne `vo` et on la reprend seule : `npm run voice -- <ep> --retake <phrase> --budget 150`. Les autres phrases gardent leurs prises : changer une ligne n'invalide qu'elle. Jamais de nouvelle séance complète pour une phrase.
- `--pick phrase=enregistrement` ne vaut que pour l'exécution en cours : le prochain `npm run voice` remonte la phrase sur la prise par défaut, et le film rendu n'est plus calé. Un choix qui doit tenir s'écrit dans `audio/picks.json` (`{ "picks": { phrase: enregistrement }, "notes": { … } }`, le fichier de la cabine) — en notant que c'est un choix à la mesure, pas à l'oreille.
- **L'oreille tranche** : je mesure, je n'entends pas. La cabine du front (`/voix.html?ep=<dossier>`, lien « VOIX » sur le dossier) fait écouter chaque phrase dans chaque prise, garde celle que Merwan choisit, et recueille ses notes de direction (`audio/picks.json`). Lire ces notes avant de toucher à la voix. Un choix dans la cabine remonte la voix tout de suite mais ne refait pas le film : relancer `npm run render` ensuite — et ne pas rendre pendant qu'il choisit (les deux écrivent `audio/vo.json`). Elle n'a pas encore été essayée sur un vrai iPhone.
- **Le traitement** : chaque prise est nettoyée et égalisée en niveau (coupe-bas, compression légère, plafond), les phrases jouées bas sont un peu remontées, le fond sonore s'efface sous la voix, et le film entier est amené à −14 LUFS par un simple gain (jamais par un normaliseur qui ferait pomper le fond).

Direction (balises entre crochets, ponctuation, MAJUSCULES) :

| Balise (mesuré sur Eric) | Effet |
| --- | --- |
| `[ominous]`, `[low, grave voice]` | registre 3 à 6 demi-tons plus bas — menace, chute. Sort vite **plat**, et sur une phrase positive ça devient un grave soufflé, intime : Merwan a entendu « il essaye de draguer ». À réserver aux phrases de menace. Mesuré : sur une chute longue (« Voilà le secret : … ») il tient (−2 à −3 dt, vivant, 002/003/005) ; sur une phrase de huit mots (« Toute la question… c'est ce qui les retient », 005) il tombe à −4 dt et s'aplatit — là, essayer une autre intention (`[curious]`, `[thoughtful]`) sur une reprise : pas encore mesuré |
| `[firm, matter-of-fact]` | constat net, registre proche du narrateur — pour une phrase qui affirme sans menacer |
| `[tense]` | plus rapide, registre moyen |
| `[dramatic]` | registre haut, +5 dB : ça **crie**. Merwan (06/10) : « il peut parler fort mais pas jusqu'à hurler dans les oreilles du spectateur ». Plus jamais sur l'accroche, jamais avec un « ! » ; au plus un mot du climax |
| `[urgent]` | **crie aussi** (003 : +6 à +7 dB et 7 demi-tons plus haut sur les trois prises, surtout avec un mot en MAJUSCULES). À ne plus utiliser |
| `[tense]` sans majuscules | de l'énergie sans le cri (+2 à +3 dB) — l'accroche. Mais c'est le **texte** qui donne le ton : sur une accroche sombre, en trois phrases closes (006 : « Quelqu'un s'effondre. Devant toi. Son cœur ne pompe plus. »), il sort grave et retenu — 2 à 3 demi-tons sous le narrateur, 2 dB sous le reste du film, dans les trois prises. Aucun défaut signalé, mais pas l'énergie d'une accroche : à faire entendre à Merwan, reprise seulement s'il la demande. Toute balise jamais essayée se teste d'abord sur une reprise d'une phrase, pas sur une séance entière |
| `[slowly]` | débit ralenti, pauses longues — sur « Alors… on l'ouvre », plat et très grave (002, 003, 004) |
| `[calm]` | posé sans tomber dans le grave : « Alors… on l'ouvre » enfin vivant (005 : registre −1 dt, la phrase la mieux notée de la séance). C'est la balise de cette phrase |
| `[serious]`, `[thoughtful]`, `[curious]` | nuances douces |
| `...` / `MOT` / `[short pause]` | poids / accent / silence d'environ 0,8 s (pas de `<break>` en v4). Pour une pause **qui compte**, `[short pause]` : il est tenu à chaque prise (006 : « Like. [short pause] Sept fois sur dix… », « Silence. [short pause] Et le cœur repart »), alors que `...` n'est joué qu'une fois sur deux (« pause non jouée » : cinq fois sur le 005, dont les trois prises de « Like… ») |
| virgule finale | **la dernière phrase du film** (inachevée) s'écrit dans `vo` avec une virgule au bout — « …sur ton trajet, » — et garde ses « … » à l'affichage. La virgule laisse la voix en l'air, là où reprend l'accroche : suspendue dans les trois prises du 006, quand « … » retombait cinq fois sur six (004, 005) |

Jamais trois phrases de suite sur la même balise : c'est le contraste entre deux phrases qui fait le jeu. `speed` est ignoré par `eleven_v4` ; pour raccourcir, on coupe du texte. La clé est dans `.env` (jamais affichée, jamais committée).

### L'image

- `kit/` = le moteur partagé : `brand.css` (tokens, HUD, sous-titres, cartes d'accroche, callouts et dispositifs récurrents — bloc STORY OVERLAYS), `lib/stage.js` (le plateau), `lib/build3d.js` (matières, arêtes, pièces, vue éclatée), `lib/atmo.js` (sol, halo, particules), `lib/overlay.js` (`buildHook`, `buildCaptions`, callouts, les trois CTA : `rail`, `likeNet`, `typeAnswer`, et `brandHud`), `lib/timing.js` + `lib/ref.mjs` (repères).
- `episodes/NNN-slug/` = `episode.json`, `index.html` (overlays de l'épisode), `src/model.js` (le système, en centimètres), `src/main.js` (la mise en scène). `gen/` est reconstruit à chaque build. Un second décor a son fichier : `src/road.js` (002, la route), `src/shaft.js` (003, la gaine), `src/room.js` (004, la pièce et le tableau), `src/reactor.js`, `src/pile.js` et `src/chain.js` (005 : la cuve, Chicago 1942, les noyaux de la réaction en chaîne), `src/hall.js` et `src/heart.js` (006 : le hall de gare et ses trois personnages, le cœur). Le même modèle sert dans les deux décors — le parachute du 003 est boulonné sous la cabine **et** posé sur l'établi : la coupe de l'un à l'autre raccorde sur le même objet, même place à l'écran, même lueur.
- Dans `main.js` : `T.at("beat:mot")` pour l'heure d'un moment ; `shot(at, durée, pose)` pour un mouvement de caméra (une plongée ou un long recul : `shot(at, durée, pose, ease, fromD)`, voir « Net et fluide »), `cut(at, décor, pose)` pour une coupe franche ; `st(at, durée, {…})` pour l'état du monde `S` ; `tl` pour la page.

**Le plateau (`createStage`)** fait le travail d'un studio : environnement de boîtes à lumière (reflets), lumière clé avec ombres douces, obturateur (chaque image est la moyenne de 16 instants : flou de mouvement et lissage), bloom, puis **étalonnage** (`stage.grade` : contraste, ombres froides, hautes lumières chaudes, saturation, vignette, et `gel` pour teinter une scène). `stage.cut(t)` garde les coupes nettes, `stage.focus` dit aux lumières et aux ombres ce qu'on filme. Les fonctions passées à `stage.onUpdate` sont appelées plusieurs fois par image : elles ne dépendent que du temps.

**Pour que ça ne fasse jamais amateur** — chacune de ces règles vient d'une image ratée :

- Le sujet est l'élément le plus lisible du cadre : sombre **sur un halo de lumière**, ou clair sur sombre. Jamais sombre sur sombre.
- Un grand objet d'accompagnement (voiture, bâtiment) se fait aux rayons X, pas en « réaliste » : une carrosserie pleine modélisée vite ressemble à un jouet raté.
- Une couleur d'ambiance se tient **franche** : `mood` à 0 (veille) ou à 1 (signal). Un mélange à mi-chemin tenu plus d'une demi-seconde donne du kaki.
- Pour teinter une scène, `stage.grade.gel` (qui multiplie : les noirs restent noirs), jamais un voile coloré en CSS ; et jamais au-delà de 0,3 sur un objet clair, qu'il repeindrait.
- Le brouillard mange ce qui est loin : vérifier qu'un objet à 30 m se voit encore.
- Tout ce qui émet se dose à l'image : au-dessus de 3, ça bave.
- La caméra ne traverse pas un objet opaque ; elle peut traverser du verre.
- Une coupe se pose quelques images **avant** la phrase qui la motive.
- Une pièce faite de boîtes se lit par son **ombrage** : métal peu métallique (`metal` ≤ 0,5) et pas trop sombre. Un métal très métallique ne fait que refléter le studio, qui est noir : la pièce devient un trou bordé de traits (003, premier jet du parachute).
- Les faces usinées plus claires que la fonte, la pièce-héros (le coin) nettement plus claire que le reste : trois valeurs de gris, on comprend l'objet sans légende.
- Chaque pièce qui peut s'effacer (`setPartOpacity`) a **ses propres matières** : une matière partagée emporte les pièces voisines (le couvercle du 003 faisait disparaître les mâchoires).
- Un mécanisme se montre de trois quarts, jamais de face : de face, c'est un dessin au trait — exactement ce qu'on ne fait pas.
- Un éclair est une **lumière qui a un endroit** (une boule de lumière au point de rupture, qui gonfle deux images et meurt petite), pas un voile sur toute l'image : `#flash` au-dessus de 0,08 lave l'image en gris.
- Une boule de lumière se fait avec un dégradé (`softGlow` dans `shaft.js`) : une sphère additive unie se lit comme un disque plein dès qu'elle faiblit.
- Ce qui chauffe ou va céder a des **braises** qui tombent (`makeEmbers`, périodiques : vivantes dès la première image) ; ce qui frotte fait des étincelles lentes (`makeSparks`) — le film est au ralenti.
- Au ralenti, un objet dont **la vitesse est le sujet** (la poulie du limiteur) est montré à sa vitesse réelle de l'instant : ralenti quarante fois, il ne bougerait pas et la phrase « tu vas trop vite » n'aurait pas d'image.
- Le mécanisme suit **la voix** (« le coin remonte… et mord ») : on le pilote sur les mots, pas sur une cinématique exacte que personne ne peut vérifier — les chiffres affichés, eux, restent justes.
- Un grand angle (`fov` 50–60) vu d'en haut donne le vertige que le 28 mm écrase : c'est le cadre de l'accroche du 003. Les `cut()` remettent `fov` à 28.
- Pour qu'un mouvement reste près du sujet, écrire la pose d'arrivée avec un petit `d` (même point de vue, cible rapprochée) : la caméra interpole ses nombres, et un grand écart de `d` l'envoie se promener hors du décor.
- Un flux se dessine **clair sur un conducteur sombre** : des tirets larges, en centimètres (`mat.worldUnits = true`), sur un fil foncé. « Il en manque » = le fil du retour garde le même rythme avec des tirets plus courts. Des tirets fins sur du métal clair ne se voient pas.
- Une pièce qui s'ouvre (une palette, un clapet) se filme **de profil**, et on vérifie son sens sur deux images avant/après : la palette du 004 se repliait dans le relais sans que rien ne le signale.
- On choisit le côté d'où filmer l'établi en essayant quatre azimuts d'un coup (`look`) : le cœur du système au premier plan, rien devant lui.
- Le personnage de verre (`room.js` du 004 ; depuis le 005, `kit/lib/figure.js` : `makeFigure`, qu'on pose comme une marionnette — `reach`, `leg`, `lean` — et qu'on couche, agenouille ou fait courir en déplaçant son groupe, voir `hall.js` du 006) : chaque membre est taillé à sa longueur (étirer une capsule étire ses bouts ronds en pointes), la main a de vraies phalanges qui se referment. Un sol brillant vu en rasant devient une dalle grise en travers de l'image : sol mat dans une pièce.
- L'en-tête reste lisible quand un sujet clair passe derrière lui grâce à `#hud-shade` (un élément placé avant `#hud`, dans le modèle depuis le 004). Pas de `z-index` négatif : le lint le signale, à raison.
- Tout le premier acte en **un seul mouvement** (003 : la cabine → sous le plancher → les câbles → la plongée dans le vide → le parachute) : les coupes sont gardées pour l'acte 3, où elles font la tension.
- Un phénomène invisible (la réaction en chaîne du 005) ne se montre pas par une lueur : un mur orange « qui chauffe » n'explique rien. On lui donne sa petite scène — quelques objets qui font ce que dit la phrase, mot par mot (`src/chain.js` : des noyaux gris, un neutron arrive, le premier se brise, deux neutrons repartent, puis 2, 4, 8, 16) — et le décor s'éteint derrière (`glow` et `shell` baissés) pour la laisser lire.
- Beaucoup d'objets identiques (57 barres) vus de loin font une dalle grise. Ce qui leur rend un volume : plus sombres côté opposé à la caméra, un jour visible sous elles, la lumière de ce qu'elles surplombent sur leurs extrémités — et leur détail (les crayons) dessiné dans le shader avec `fwidth`, qui le fond en gris moyen dès qu'il passerait sous le pixel.
- Passer de « toutes » à « une » : les autres s'éteignent (un attribut par instance, `aHero` / `uOthers`), la caméra vole jusqu'à celle qui reste, et la coupe vers l'établi raccorde sur **la même lumière** — sur l'établi, la pièce porte un instant la même coque lumineuse (`coilGlow`), qui se dissout. Le raccord tient sans construire le modèle deux fois.
- Un objet tout en hauteur, aux pièces coaxiales, s'éclate mal : la vue éclatée est une colonne maigre. On l'ouvre en soulevant **une** pièce (la bobine), et chaque pièce a son plan sur son mot, avec un geste qui montre à quoi elle sert (les cliquets s'écartent, puis « pincent » : le film a déjà montré le geste quand il le rejoue pour de bon à l'acte 3).
- La couleur raconte l'action : dans le cœur du 005, le vert des barres (vues à travers le combustible, `ghost`) descend à mesure que l'orange s'éteint. On comprend la chute sans lire un chiffre.
- Ce qui monte derrière l'en-tête (tubes, tiges) se **fond dans le noir** avant de l'atteindre : un objet clair qui traverse le HUD fait échouer le contraste des libellés.
- Une étiquette (`chip`) qui suit un point de la scène sort du cadre dès que la caméra voyage : pendant un mouvement, elle prend une place fixe dans la zone haute (`follow(id, null, 96, 470)`). Et `.chip--live` est couleur signal : pour une étiquette veille ou encre, fixer la couleur par son identifiant.
- Un décor aux rayons X n'a pas de sol plein : vu d'un balcon, c'est une bande grise en travers de l'image (005, Chicago). La grille seule dit où est le sol.
- Deux panneaux qui redisent la voix n'ont pas leur place sur le sujet : si « toi, lu comme un système » doit entrer pendant l'accroche, le sujet lui fait de la place (il glisse à droite, le panneau prend une colonne étroite à gauche).
- Un lieu vu **de dessus** (le hall du 006) est un dessin au trait : une échelle et un pointillé. « Ici, là-bas, trente mètres entre les deux » se montre d'un point haut **en perspective**, grand angle, depuis derrière le sujet : les personnages debout donnent l'échelle, le chemin au sol file vers le fond.
- Une lumière vue de loin (la boîte verte) a un **cœur brillant et une longue traîne** (`halo()` dans `hall.js`). Une sphère qui s'éteint régulièrement du centre au bord se lit comme une boule collée au mur.
- **De près, les personnages sont en verre de la tête aux mains** (`ghost`, basculé sur une coupe ; les aidants plus pâles que la victime) : il ne reste de plein que ce dont parle la phrase — le cœur, les électrodes. Des têtes et des mains pleines penchées sur un torse, c'est un tas de boules. Et on ne montre pas trois personnages de verre les uns sur les autres : la chute du 006 a d'abord été « les deux aidants penchés sur la victime », illisible ; c'est devenu **le même cadre que le choc** (les deux électrodes, le cœur entre elles), où tout a changé de couleur.
- Les mains d'un personnage : `makeFigure({ hands: "flat" })`, une moufle qu'on oriente (`reach(…, { dir, palm })` : le talon de la main sur le sternum, une paume sur une électrode). Une boule au bout d'un bras, en gros plan, reste une boule.
- Ce que le personnage pose se déplace **avec sa main** : l'électrode part de devant lui, sa main dessus, et se colle. Un objet qui arrive seul à côté d'une main qui ne le tient pas, c'est une animation de menu.
- Un objet posé sur du verre (une électrode sur le torse) ne porte **pas d'ombre** : elle traverse le corps et tombe au sol, en rectangle sombre que personne ne sait placer.
- Un titre posé sur un sujet clair (la chute sur le torse éclairé en vert) se fait porter par une ombre : `#title-shade`, sous le HUD, comme `#hud-shade` porte l'en-tête.
- Les figurants : personne devant le sujet ni devant ce que promet la première image (un passant masquait la boîte verte), personne sur le trajet de la caméra.
- Un personnage qui part en courant au bord du cadre ne se voit pas. « Toi : la boîte. » a son plan (006) : de derrière toi, debout, l'étiquette au-dessus de la tête, le chemin au sol qui part de tes pieds, la boîte au bout, le témoin au travail à côté — tout ce qu'on te demande en une image, puis tu pars.
- Deux pièces voisines nommées à la suite (« une batterie, un condensateur ») tiennent dans **un** cadre : à moins d'une seconde par mot, un plan par mot ne laisse aucun temps d'arrêt. C'est ce qui s'allume (le condensateur qui se charge) qui dit de quel mot on parle.
- Ce qui est posé sur une pièce qui s'efface (le bouton, le voyant, le sigle sur le couvercle) est inscrit dans les matières de cette pièce (`part.userData.part.mats`) : un `lid.add(mesh)` tout nu laisse un bouton rouge flotter seul au-dessus de la carte.
- La zone haute se partage dans le temps, au dixième de seconde : le compteur du choc s'en va quand le tracé revient, le verdict de la puce reste jusqu'à la coupe du choc et la charge se compte à côté du bouton. Et rien d'un plan ne déborde sur le suivant : un titre ou un panneau a fini de sortir **avant** la coupe.

**Net et fluide, tout le temps.** Merwan a vu un rendu scintiller : « c'est pas pro ». `npm run qa` compte désormais les images parasites (l'image saute et revient) et situe les mouvements heurtés ; un rendu ne se livre pas avec une image parasite non voulue. Ce qui scintillait, et la règle qui en sort :

- Un pixel impossible (NaN) sorti d'un shader : le bloom l'étale en dalle noire pendant une image. Dans un shader, **borner avant `pow`, `sqrt`, une division** (`pow(clamp(x, 0.0, 1.0), p)`). Le plateau filtre maintenant ces pixels, mais on corrige la source.
- Des lignes fines qui défilent vite (grille, rayons de roue, pointillés) sautent d'une image à l'autre : étaler la grille sur sa course (`grid.uSmear`), ne pas dessiner de détails fins qui tournent, pas de trait sous 1,8 px.
- Des points qui filent (poussières, braises) : les dessiner en traînées (`motes.update(t, px, streak)`), pas en points.
- Des surfaces presque confondues vues de loin se battent : espacer les couches du sol (`makeSurface({ lift })`).
- Une lueur qui clignote plusieurs fois par seconde se lit comme un défaut : une respiration lente, ou rien.
- Un objet lumineux que la caméra frôle pendant un mouvement rapide remplit une bande de l'image pendant une image : ce qui ne sert pas au plan est **invisible**, pas seulement éteint (003 : les deux traits du seuil pendant la plongée).
- Des pointillés traversés vite deviennent un « sucre d'orge » : un trait plein dessous, et les tirets s'effacent pendant le mouvement (`S.dashes`).
- Les longs trajets de caméra en `power2.inOut` ou `sine.inOut` : `power3` passe au milieu trois fois plus vite que la moyenne.
- Des tirets **qui courent** (le courant dans un fil) avancent d'au plus un septième de leur période par image : à une demi-période, ils sautent d'une place à l'autre et `qa` signale une rafale d'images parasites (004 : 9 cm/s pour des tirets de 0,64 cm → 2,6 cm/s).
- Un motif rayé (la rangée de disjoncteurs) que la caméra traverse vite fait le même effet : glisser dessus lentement, pendant toute la phrase.
- Une plongée ou un long recul : la distance change **par rapport, pas par centimètres** — `shot(at, durée, pose, ease, fromD)` dans le `main.js` du 006 — et le point visé suit la distance. En centimètres, le dernier mètre d'une plongée passe en trois images, et le sujet sort du cadre au milieu du trajet (une demi-seconde d'image vide).
- Reculer depuis un détail **sans le lâcher** : la pose d'arrivée vise le même point, le cadrage se fait au `shift` (jusqu'à 490 px : un objectif à décentrement). Puis `reaim(pose, d)` donne la même image, visée de près : le mouvement suivant part de là au lieu d'envoyer la caméra hors du décor.
- Un figurant de verre frôlé en plein vol = une image parasite (`qa` : 8,13 s). On le déplace.
- Un mouvement qui ferait tourner la caméra de plus d'un quart de tour en une seconde (de la boîte au sol jusqu'au torse) est une **coupe**.
- `qa` classe aussi comme « heurtés » un geste rapide en gros plan (les mains qui arrivent sur le sternum) ou une pièce qui s'efface : regarder l'instant avant de corriger la caméra.
- Un brouillon **sans voix** se rend et se contrôle (`render --draft`, `qa --file`), mais son niveau est faux — le fond seul remonté à −14 LUFS, +19 dB : à Merwan, on l'envoie muet (`renders/<ep>-apercu-muet.mp4`, 720p).

Pièges techniques déjà rencontrés :

- GSAP ne sait pas revenir à un texte **vide** : ne jamais `tl.set(el, { textContent })` en partant de `""` (révéler par largeur ou opacité).
- Deux tweens sur la même propriété ne doivent pas se chevaucher ; `immediateRender: false` sur un `fromTo` qui rejoue un élément déjà animé.
- `lint` ne voit `window.__timelines` que dans le HTML : garder le petit script en bas d'`index.html`.
- Tout ce qui bouge dépend du temps HyperFrames (`hf-seek`), jamais d'une horloge ; l'aléatoire est semé (`kit/lib/rng.js`).
- Une pose de `cut()` doit être complète (`tx, ty, tz, d, az, el, shift`) : rien n'est hérité du plan précédent.
- Pour modifier du code par script, écrire le script avec l'outil d'écriture de fichier : un heredoc bash avale les antislashs des expressions régulières et casse sur les apostrophes.
- Le rendu a besoin de `ffmpeg` + `ffprobe` : s'ils ne sont pas dans le PATH, `scripts/lib/ffmpeg.mjs` les cherche dans les `node_modules` des projets voisins, ou dans `FFMPEG_DIR`. Sans eux, pas de traitement de la voix (le film joue alors les prises brutes).
- L'habillage sonore est synthétisé (`scripts/sfx.mjs`) pour un haut-parleur de téléphone. Personne ne l'a encore validé à l'oreille : baisser `bedVolume` ou retirer des éléments de `sfx` si Merwan le trouve envahissant.

### Avant de livrer

- `npm run review` : chaque vignette se lit, la première image arrête le pouce, la dernière est identique à la première.
- `npm run check` passe (au contrôle de contraste, un même texte en défaut à deux instants compte comme une erreur) ; `npm run qa` confirme la voix calée et le niveau.
- Merwan a écouté la voix dans la cabine (au moins l'accroche et les trois CTA).
- Le MP4 fait ≥ 60 s.
- Ne montrer à Merwan que des images dont on est fier : un essai technique raté se corrige avant, pas devant lui.

### Quand Merwan n'est pas chez lui

Le bureau de publication ne répond que sur le Wi-Fi de la maison. Dehors, les films lui parviennent par la conversation (`SendUserFile`), qui porte **30 Mio par fichier** vers le téléphone : les MP4 d'origine (80 à 110 Mo) ne passent pas. `npm run phone -- <ep>` fait la copie qui passe — même taille d'image, même cadence, son d'origine copié tel quel, image réencodée en deux passes au débit qui remplit la place (≈ 2,7 Mbit/s) — et la mesure contre l'original : sur les 003, 004 et 005, SSIM 0,993 à 0,995 et PSNR 45,6 à 48,2 dB, rien que l'œil voie, et TikTok recompresse plus fort de toute façon. Lui dire que ce n'est pas le fichier d'origine, et que celui-ci l'attend sur le bureau, à la maison. Un envoi qui échoue sur « timeout » se retente : c'est le réseau, pas la taille. Ouvrir le PC à Internet (un tunnel vers le bureau) est refusé par le garde-fou des sessions : ne pas le tenter.

### Après publication : on apprend de chaque vidéo

24 à 48 h après la mise en ligne, demander à Merwan la courbe de rétention et les chiffres (vues, durée moyenne, % qui finissent, abonnés gagnés). Noter ce qu'on en tire dans la section « Dossiers » ci-dessous : où la courbe chute, quelle accroche a tenu. L'épisode suivant s'écrit avec ça sous les yeux.

## Dossiers

- **001 — Détecteur de fumée** : publié le 2026-10-05 (ancien moteur, voix en une prise). Chrono = l'heure (03:07 → 03:08). Chiffres à demander à Merwan.
- **002 — Airbag** : publié le 2026-10-06 (avant le recalage des zones TikTok : son en-tête passe sous la barre de recherche). Refait avec tout ce qui précède — accroche ABC au volant, depuis le siège du conducteur ; la caméra sort de l'habitacle (voiture aux rayons X), le mur, les 14 mètres ; autopsie sur l'établi ; l'impact de profil ; chute « il te sauve en se dégonflant ». Chrono = T−1,00 s avant le mur puis T+000 → T+150 ms. C'est le modèle à étudier pour un nouvel épisode.
- **003 — Ascenseur** : publié le 2026-10-06, avant le 004 (Merwan : « tout est dans l'ordre, 1 2 3 4 sont postés » ; l'heure n'est pas connue). Accroche « Douzième étage. Le câble de ton ascenseur vient de casser. / Tu ne tomberas pas. Et ce n'est pas un câble qui va te retenir. » ; premier acte en un seul mouvement jusqu'au parachute sous le plancher ; autopsie sur l'établi (bloc, coin denté, rail) ; le limiteur de vitesse et sa jauge contre le seuil de 115 % ; la demi-seconde au ralenti (T+0,00 → T+0,50 s, 52 cm) coupée entre cabine, limiteur et coin ; chute « il ne tient pas à un fil, il tient à ses rails » ; Otis 1854 ; boucle « …le bouton du… » → « Douzième étage ». Voix : l'accroche et « mord le rail » sortent **criées** dans les trois prises (`[urgent]`) ; publié tel quel, sans reprise. Chiffres à demander à Merwan à partir du 2026-10-07 dans l'après-midi : c'est la seule vidéo en ligne dont l'accroche est criée — comparer le début de sa courbe à celui du 004, qui ne crie pas.
- **004 — Différentiel** : publié le 2026-10-06 vers 17 h (Merwan, le soir même : « je l'ai postée il y a 3 h »), après le 003 qui l'annonce. Accroche « Deux cent trente volts. Tu touches le fil… et ta main se referme dessus : impossible de lâcher. / Quelque chose va lâcher à ta place. Et ce n'est pas ton disjoncteur. » ; la caméra suit les fils dans le mur jusqu'au tableau ; « toi » lu comme un circuit (peau mouillée ≈ 1 500 Ω, 150 mA par le cœur, il en supporte 30) ; le disjoncteur qui attend 16 A, « cinq cents fois trop » ; autopsie sur l'établi (manette, ressort armé, anneau) ; la jauge « part / revient » contre le seuil de 30 mA ; les 30 ms au ralenti (T+00 → T+30 ms) coupées entre ta main et l'anneau : la bobine, l'aimant qui lâche sa palette, le ressort, les contacts ; chute « il ne t'a jamais vu, il sait seulement qu'il manque quelque chose » ; boucle « …dans tes murs, il y a toujours… » → « Deux cent trente volts ». Voix : 3 prises (687 crédits), dirigées sans `[urgent]` ni `[dramatic]` : **aucune phrase criée** (accroche à +1,1 dB) ; quatre phrases reprises d'une autre prise par `--pick` (gratuit). `[slowly]` sur « Alors… on l'ouvre » sort plat et très grave dans les trois prises : au prochain, `[calm]`. Chiffres à demander à Merwan à partir du 2026-10-07 vers 17 h.
- **005 — Arrêt d'urgence** : rendu le 2026-10-06, à faire écouter puis publier par Merwan — le 004, qui l'annonce, est en ligne depuis le 2026-10-06 vers 17 h : c'est le prochain à sortir. L'arrêt automatique d'un réacteur nucléaire ; choisi et lancé par Merwan le même jour (« Go pour la 5 » : accroche et budget voix). Accroche « Panne de courant. Et c'est toi qui es aux commandes d'un réacteur nucléaire. / Ne touche à rien : il s'arrête tout seul, en deux secondes. Et ce qui l'arrête… c'est la panne. » ; premier acte en un seul mouvement : la cuve aux rayons X → la couronne de bobines, qui s'éteint un instant sur « la panne » (étiquette « sous tension » → « hors tension ») → le cœur, puis de tout près la réaction en chaîne noyau par noyau (1, 2, 4, 8, 16) → les 57 grappes suspendues → le vol jusqu'à une seule bobine, les autres éteintes, et la coupe vers l'établi sur la même lumière ; autopsie pièce par pièce (la bobine se soulève, la tige crantée, les cliquets s'écartent puis pincent, la bobine redescend, son champ d'électroaimant) ; jauge « courant de maintien » ; les deux secondes au ralenti (T+0,0 → T+2,0 s) : la bague tombe, les cliquets s'ouvrent, la tige part, puis la cuve — le vert des barres descend dans le cœur et éteint l'orange ; chute « on ne dépense rien pour arrêter un réacteur, on dépense pour l'empêcher de s'arrêter » ; Chicago 1942, l'homme à la hache ; boucle « …il suffit d'une… » → « Panne de courant ». Le CTA d'abonnement annonce le 006 (« accroché à un mur, sur ton trajet »). Voix : 3 prises (699 crédits, solde 27 400), aucune phrase criée (accroche à +2,0 dB) ; mesuré dans les trois prises : « Like… » dit sans sa pause, et la dernière phrase qui retombe au lieu de rester suspendue (une reprise de `boucle` est annoncée à 86 crédits : à décider par Merwan après écoute). Montée d'abord sur un minutage estimé, la mise en scène a été refaite pour moitié une fois la voix posée : c'est de là que viennent les règles sur le phénomène invisible, les objets identiques, le passage de « toutes » à « une » et l'objet coaxial. Faits et simplifications assumées (l'arbre qui double, la hauteur des barres, un seul électroaimant) dans `sources`. Couverture : l'électroaimant vu de dessus, ses deux anneaux et son champ. Contrôles : voix calée à 0 ms, −14,1 LUFS, aucune image parasite.
- **006 — Défibrillateur** : choisi par Merwan le 2026-10-06 (son critère : « un truc rassurant, qui apprend aux gens » quelque chose qu'ils voient tous les jours sans savoir comment ça marche), lancé le soir même : « Go pour écrire la 6, fais pas la voix encore, juste le montage, script et décors, un truc poussé : on doit s'améliorer de vidéo en vidéo ». **Rendu le 2026-10-07 (85,5 s), à faire écouter puis publier par Merwan, après le 005 qui l'annonce.** Voix le 2026-10-07, sur son « go pour la voix du défi » : 3 prises, 699 crédits (716 annoncés ; solde 26 266), aucune phrase criée, « Like » tient sa pause et la dernière phrase reste suspendue dans les trois prises. Mesuré : **l'accroche sort grave et retenue** dans les trois (−2 à −3 dt, −2 dB sous le reste) ; elle est montée sur la prise 1, la moins grave (choix à la mesure, noté comme tel dans `audio/picks.json`). Une reprise sur deux autres directions — `[firm, matter-of-fact]` et `[tense]` avec une virgule, déjà écrites dans `vo` / `voAlt` — est annoncée à 68 crédits (`--retake accroche --count 2`) : à décider par Merwan après écoute. Accroche « Quelqu'un s'effondre. Devant toi, son cœur ne pompe plus. / Au mur, une boîte verte peut le sauver. Tu ne peux pas te tromper : c'est elle qui décide. Encore faut-il… savoir où elle est. » ; chrono = T+0:00 quand le cœur cesse de pomper → T+2:50 au choc, et des « chances » qui perdent 10 % par minute (72 % au choc, elles passent au vert au premier battement) ; premier acte en un seul mouvement : la chute → la boîte au mur, à trente mètres → on recule sans la lâcher jusqu'à voir tout le hall, le chemin vert de la victime à la boîte → plongée dans la poitrine, où le cœur tremble (tracé « fibrillation ») → ses chances minute par minute, les secours à 15 min → le témoin appelle le 15 et masse → une coupe sur « Toi » : de derrière toi, le chemin au sol, la boîte au bout, et tu pars → la porte s'ouvre sur « Alors… » ; autopsie (électrodes, batterie, le condensateur qui se charge, la puce qui écoute, l'autotest : 1 460 jours) ; acte 3 dans le hall, en coupes : tu colles les électrodes, « ne touchez pas le patient », dix secondes de lecture (« choc recommandé »), la charge, le choc vu de dessus (150 J, les 10 ms au ralenti), toutes les cellules s'éteignent, tracé plat, puis le cœur repart depuis son propre nœud ; chute « elle ne relance pas un cœur, elle l'arrête, pour qu'il redémarre de lui-même », sur le cadre du choc devenu vert ; « un cœur qui bat ? elle refuse » (bouton verrouillé) ; boucle « …sur ton trajet… » → « Quelqu'un s'effondre », dans le même hall le lendemain, sans personne à terre. Le CTA d'abonnement annonce un 007 **à faire valider par Merwan** : le siège éjectable (« te sort d'un avion en une demi-seconde, avec une fusée sous le siège »). Faits et simplifications dans `sources` (−10 % par minute, délai des secours, 150 J biphasique, refus du choc sur un rythme normal, loi de 2020 sur le citoyen sauveteur, Géo'DAE). Couverture : la vue éclatée, le condensateur chargé. Contrôles : `check` passe, voix calée à 0 ms, −14,1 LUFS, aucune image parasite (le premier rendu en avait une : un flash d'une image sur « Le 15 », retiré). C'est de ce dossier que viennent les règles sur le lieu vu de dessus, le halo, les personnages en verre de près, les mains, la plongée par rapport et le recul sans lâcher. Montée d'abord sur un minutage estimé (110 s), la mise en scène a été repassée phrase par phrase sur la vraie voix : « Toi : la boîte » est devenu un plan à part, la batterie et le condensateur tiennent dans un même cadre, le verdict de la puce reste jusqu'au choc, « Le 15, lui, le sait » a son étiquette. Reste : son écoute (l'accroche et les trois CTA), sa décision sur la reprise de l'accroche et sur le sujet du 007. En réserve : le groupe de sécurité du chauffe-eau.
- **Choisir un sujet** (Merwan, 06/10) : sprinkler et ceinture de sécurité écartés (« c'est pas top ») ; il veut des sujets « wow, qui claquent », en alternance avec un sujet du quotidien qui rassure. Et, en lançant le 006 : « on doit s'améliorer de vidéo en vidéo dans son contenu » — chaque dossier doit montrer quelque chose que le précédent ne savait pas faire.

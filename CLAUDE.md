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
npm run qa      -- 003                         le MP4 rendu : voix calée, niveau, aucune image parasite, fluidité
npm run cover   -- 003                         couverture de grille
npm run front                                  bureau de publication + cabine d'écoute, pour l'iPhone (même Wi-Fi) — lancé depuis une session il s'arrête au bout de 2 h : pour le garder ouvert, Merwan double-clique `publier.cmd`
```

Ordre de travail : recherche et faits → script (`episode.json`) → **accroche validée par Merwan** → **voix** (elle fixe le minutage) → modèle 3D → mise en scène (`look` pour trouver chaque cadrage : dix poses en un coup d'œil, sans rendu) → `review` jusqu'à ce que chaque vignette se lise → `check` → `render --draft` puis `qa` (les images parasites se corrigent sur le brouillon, 80 s de rendu) → `render` → `qa` → `cover`. Le `build` (lancé par toutes ces commandes) tient à jour ce qui dépend du minutage : la voix montée en un fichier (`audio/voix.wav`) et l'habillage sonore (`audio/bed.wav`).

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
- **L'oreille tranche** : je mesure, je n'entends pas. La cabine du front (`/voix.html?ep=<dossier>`, lien « VOIX » sur le dossier) fait écouter chaque phrase dans chaque prise, garde celle que Merwan choisit, et recueille ses notes de direction (`audio/picks.json`). Lire ces notes avant de toucher à la voix. Un choix dans la cabine remonte la voix tout de suite mais ne refait pas le film : relancer `npm run render` ensuite — et ne pas rendre pendant qu'il choisit (les deux écrivent `audio/vo.json`). Elle n'a pas encore été essayée sur un vrai iPhone.
- **Le traitement** : chaque prise est nettoyée et égalisée en niveau (coupe-bas, compression légère, plafond), les phrases jouées bas sont un peu remontées, le fond sonore s'efface sous la voix, et le film entier est amené à −14 LUFS par un simple gain (jamais par un normaliseur qui ferait pomper le fond).

Direction (balises entre crochets, ponctuation, MAJUSCULES) :

| Balise (mesuré sur Eric) | Effet |
| --- | --- |
| `[ominous]`, `[low, grave voice]` | registre 3 à 6 demi-tons plus bas — menace, chute. Sort vite **plat**, et sur une phrase positive ça devient un grave soufflé, intime : Merwan a entendu « il essaye de draguer ». À réserver aux phrases courtes de menace |
| `[firm, matter-of-fact]` | constat net, registre proche du narrateur — pour une phrase qui affirme sans menacer |
| `[tense]` | plus rapide, registre moyen |
| `[dramatic]` | registre haut, +5 dB : ça **crie**. Merwan (06/10) : « il peut parler fort mais pas jusqu'à hurler dans les oreilles du spectateur ». Plus jamais sur l'accroche, jamais avec un « ! » ; au plus un mot du climax |
| `[urgent]` | **crie aussi** (003 : +6 à +7 dB et 7 demi-tons plus haut sur les trois prises, surtout avec un mot en MAJUSCULES). À ne plus utiliser |
| `[tense]` sans majuscules | de l'énergie sans le cri (+2 à +3 dB) — l'accroche. Toute balise jamais essayée se teste d'abord sur une reprise d'une phrase, pas sur une séance entière |
| `[slowly]` | débit ralenti, pauses longues |
| `[serious]`, `[thoughtful]`, `[curious]` | nuances douces |
| `...` / `MOT` / `[short pause]` | poids / accent / silence d'environ 0,8 s (pas de `<break>` en v4) |

Jamais trois phrases de suite sur la même balise : c'est le contraste entre deux phrases qui fait le jeu. `speed` est ignoré par `eleven_v4` ; pour raccourcir, on coupe du texte. La clé est dans `.env` (jamais affichée, jamais committée).

### L'image

- `kit/` = le moteur partagé : `brand.css` (tokens, HUD, sous-titres, cartes d'accroche, callouts et dispositifs récurrents — bloc STORY OVERLAYS), `lib/stage.js` (le plateau), `lib/build3d.js` (matières, arêtes, pièces, vue éclatée), `lib/atmo.js` (sol, halo, particules), `lib/overlay.js` (`buildHook`, `buildCaptions`, callouts, les trois CTA : `rail`, `likeNet`, `typeAnswer`, et `brandHud`), `lib/timing.js` + `lib/ref.mjs` (repères).
- `episodes/NNN-slug/` = `episode.json`, `index.html` (overlays de l'épisode), `src/model.js` (le système, en centimètres), `src/main.js` (la mise en scène). `gen/` est reconstruit à chaque build. Un second décor a son fichier : `src/road.js` (002, la route), `src/shaft.js` (003, la gaine). Le même modèle sert dans les deux décors — le parachute du 003 est boulonné sous la cabine **et** posé sur l'établi : la coupe de l'un à l'autre raccorde sur le même objet, même place à l'écran, même lueur.
- Dans `main.js` : `T.at("beat:mot")` pour l'heure d'un moment ; `shot(at, durée, pose)` pour un mouvement de caméra, `cut(at, décor, pose)` pour une coupe franche ; `st(at, durée, {…})` pour l'état du monde `S` ; `tl` pour la page.

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
- Tout le premier acte en **un seul mouvement** (003 : la cabine → sous le plancher → les câbles → la plongée dans le vide → le parachute) : les coupes sont gardées pour l'acte 3, où elles font la tension.

**Net et fluide, tout le temps.** Merwan a vu un rendu scintiller : « c'est pas pro ». `npm run qa` compte désormais les images parasites (l'image saute et revient) et situe les mouvements heurtés ; un rendu ne se livre pas avec une image parasite non voulue. Ce qui scintillait, et la règle qui en sort :

- Un pixel impossible (NaN) sorti d'un shader : le bloom l'étale en dalle noire pendant une image. Dans un shader, **borner avant `pow`, `sqrt`, une division** (`pow(clamp(x, 0.0, 1.0), p)`). Le plateau filtre maintenant ces pixels, mais on corrige la source.
- Des lignes fines qui défilent vite (grille, rayons de roue, pointillés) sautent d'une image à l'autre : étaler la grille sur sa course (`grid.uSmear`), ne pas dessiner de détails fins qui tournent, pas de trait sous 1,8 px.
- Des points qui filent (poussières, braises) : les dessiner en traînées (`motes.update(t, px, streak)`), pas en points.
- Des surfaces presque confondues vues de loin se battent : espacer les couches du sol (`makeSurface({ lift })`).
- Une lueur qui clignote plusieurs fois par seconde se lit comme un défaut : une respiration lente, ou rien.
- Un objet lumineux que la caméra frôle pendant un mouvement rapide remplit une bande de l'image pendant une image : ce qui ne sert pas au plan est **invisible**, pas seulement éteint (003 : les deux traits du seuil pendant la plongée).
- Des pointillés traversés vite deviennent un « sucre d'orge » : un trait plein dessous, et les tirets s'effacent pendant le mouvement (`S.dashes`).
- Les longs trajets de caméra en `power2.inOut` ou `sine.inOut` : `power3` passe au milieu trois fois plus vite que la moyenne.

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
- `npm run check` passe ; `npm run qa` confirme la voix calée et le niveau.
- Merwan a écouté la voix dans la cabine (au moins l'accroche et les trois CTA).
- Le MP4 fait ≥ 60 s.
- Ne montrer à Merwan que des images dont on est fier : un essai technique raté se corrige avant, pas devant lui.

### Après publication : on apprend de chaque vidéo

24 à 48 h après la mise en ligne, demander à Merwan la courbe de rétention et les chiffres (vues, durée moyenne, % qui finissent, abonnés gagnés). Noter ce qu'on en tire dans la section « Dossiers » ci-dessous : où la courbe chute, quelle accroche a tenu. L'épisode suivant s'écrit avec ça sous les yeux.

## Dossiers

- **001 — Détecteur de fumée** : publié le 2026-10-05 (ancien moteur, voix en une prise). Chrono = l'heure (03:07 → 03:08). Chiffres à demander à Merwan.
- **002 — Airbag** : publié le 2026-10-06 (avant le recalage des zones TikTok : son en-tête passe sous la barre de recherche). Refait avec tout ce qui précède — accroche ABC au volant, depuis le siège du conducteur ; la caméra sort de l'habitacle (voiture aux rayons X), le mur, les 14 mètres ; autopsie sur l'établi ; l'impact de profil ; chute « il te sauve en se dégonflant ». Chrono = T−1,00 s avant le mur puis T+000 → T+150 ms. C'est le modèle à étudier pour un nouvel épisode.
- **003 — Ascenseur** : rendu le 2026-10-06, à faire écouter puis publier par Merwan. Accroche « Douzième étage. Le câble de ton ascenseur vient de casser. / Tu ne tomberas pas. Et ce n'est pas un câble qui va te retenir. » ; premier acte en un seul mouvement jusqu'au parachute sous le plancher ; autopsie sur l'établi (bloc, coin denté, rail) ; le limiteur de vitesse et sa jauge contre le seuil de 115 % ; la demi-seconde au ralenti (T+0,00 → T+0,50 s, 52 cm) coupée entre cabine, limiteur et coin ; chute « il ne tient pas à un fil, il tient à ses rails » ; Otis 1854 ; boucle « …le bouton du… » → « Douzième étage ». Voix : l'accroche et « mord le rail » sortent **criées** dans les trois prises (`[urgent]`) ; Merwan a choisi d'écouter avant de décider d'une reprise (≈ 80 crédits, à rejouer `[tense]` sans majuscules).
- **004 — Différentiel** (`episodes/004-differentiel`) : lancé par Merwan le 2026-10-06, **en cours**. Fait : faits vérifiés et sourcés, script (232 mots), modèle (`src/model.js` : boîtier, manette, ressort, relais, anneau et ses deux fils), second décor (`src/room.js` : la salle de bain aux rayons X, le personnage et sa main qui se referme, les fils dans le mur, le tableau), mise en scène complète **sur un minutage estimé**, repères, habillage sonore, pose de couverture ; `check` passe. Reste : son accord sur l'accroche (« Deux cent trente volts. Tu touches le fil… et ta main se referme dessus : impossible de lâcher. / Quelque chose va lâcher à ta place. Et ce n'est pas ton disjoncteur. ») et sur le budget voix (3 prises ≈ 700 crédits, voix Eric), puis enregistrement, réglage des plans sur le vrai minutage, rendu, `qa`. Annoncé à la fin du 003 par « le prochain dossier tient dans trente milliampères ».
- **005** : choisi par Merwan le 2026-10-06 — l'arrêt d'urgence d'un réacteur nucléaire (les barres qui tombent quand on coupe le courant ; faits à vérifier à l'écriture). Le 004 doit l'annoncer dans son CTA d'abonnement.
- **006** : choisi par Merwan le 2026-10-06 — le défibrillateur des lieux publics. Son critère : « un truc rassurant, qui apprend aux gens » quelque chose qu'ils voient tous les jours sans savoir comment ça marche. Angle proposé : « Tu passes devant tous les jours. Tu n'oserais jamais t'en servir. Et pourtant, tu ne peux pas te tromper. » (il analyse le cœur seul et refuse de choquer s'il ne faut pas — à vérifier à l'écriture). Le 005 doit l'annoncer dans son CTA d'abonnement. En réserve : le groupe de sécurité du chauffe-eau.
- **Choisir un sujet** (Merwan, 06/10) : sprinkler et ceinture de sécurité écartés (« c'est pas top ») ; il veut des sujets « wow, qui claquent », en alternance avec un sujet du quotidien qui rassure.

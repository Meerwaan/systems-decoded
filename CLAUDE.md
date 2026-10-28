# Système Décodé

Compte TikTok qui ouvre les systèmes de sécurité (détecteur de fumée, airbag, disjoncteur, sprinkler, ascenseur…) et les explique en **storytelling + motion design 3D**. Merwan envoie un thème ; tu livres une vidéo verticale prête à publier : script, voix ElevenLabs, image HyperFrames, habillage sonore, MP4.

Tout se parle et s'écrit en français. Le public est francophone, on le tutoie.

L'ambition, dans les mots de Merwan : pas un compte qui suit la tendance, **le meilleur** — un rendu « digne d'un vrai studio d'animation », une 3D irréprochable, un storytelling aux petits oignons. Une image où « on ne distingue rien » ou qui « fait amateur » ne sort pas d'ici.

**Ce fichier ne garde que les règles en vigueur.** Le détail, les mesures, l'histoire de chaque dossier et les citations complètes sont dans `docs/memoire/` (voir l'index en bas) : on ne les lit que quand la tâche le demande. La version intégrale d'avant le 27/10 : `docs/memoire/CLAUDE-complet-2026-10-27.md`.

## Le compte

| | |
| --- | --- |
| Nom affiché | **Système Décodé** |
| @ | `@systeme.decode` — replis : `@systemedecode`, `@systeme_decode` (le compte TikTok des exports est **@hors.ligne_mw**) |
| Bio | Ils veillent pendant que tu dors.⏎On les décode, un système à la fois. |
| Instagram, YouTube Shorts, Facebook | Bios : `brand/profil.json`. Textes de chaque dossier (`post.instagram`, `post.youtube`, `title` ≤ 100 caractères) écrits par `node scripts/posts.mjs`, où un nouveau dossier s'ajoute. **Cinq hashtags au plus sur chaque plateforme** ; jamais la chute, le mot que les gens cherchent, la question du commentaire à la fin. |
| Photo de profil | `brand/avatar.png` (source `brand/avatar.svg`, export `npm run brand`) |
| Couverture de grille | `npm run cover -- <ep>` → `renders/<ep>-couverture.png`, toujours la même mise en page : DOSSIER 00X, titre sur deux lignes, vue éclatée |

Le nom n'existe qu'à un endroit dans le code : `BRAND.name` (`kit/lib/brand.js`). Il est affiché à droite de l'en-tête de chaque vidéo et **s'allume en vert au moment de la chute** (`brandHud`) : le nom du compte est aussi le verdict du dossier. Pas d'emoji dans le nom ni la bio.

## La règle qui passe avant tout : storytelling et rétention

C'est ce qui fait grimper le compte. Un épisode n'est pas une fiche technique, c'est une scène : quelqu'un, un danger, et un système qui a quelques secondes pour agir. La technique arrive **quand l'histoire en a besoin**.

### L'accroche, c'est 99 % du travail

Elle tient en trois temps, dans les 8 à 9 premières secondes — la **méthode ABC** de Merwan :

- **A · Accroche** (0 → 4 s) : une phrase choc, concrète, à la 2ᵉ personne, au présent. Elle menace ou contredit. Jamais de « Saviez-vous que », jamais de présentation.
- **B · Bénéfice** : pourquoi ça le concerne, ce qu'il y gagne. Une phrase.
- **C · Curiosité** : une question ouverte, précise et personnelle, dont la réponse n'arrive **qu'à la fin**, avec l'appel au commentaire.

002 : « Cinquante kilomètres-heure. Dans une seconde, ton volant t'explose au visage. » (A) « C'est ce qui va te sauver la vie. » (B) « Sauf si tes mains sont au mauvais endroit. » (C). Formes possibles : l'heure précise et la scène, le paradoxe, le chiffre qui ne colle pas. Quelle que soit la forme, les trois fonctions A, B, C doivent être remplies avant la 10ᵉ seconde. Une accroche tient en 26 à 32 mots ; **le mot-choc avant 3 s** (repère `choc`).

- **La première image** est la plus forte du film, et elle montre déjà ce que dit l'accroche. Elle doit tenir seule, sans le son. **Six points** : un événement déjà en cours ; une perspective basse ; la menace derrière le sujet ; une forme reconnue en un tiers de seconde, vue d'où on ne la voit jamais, sur 40 % de la largeur ; le système déjà là, petit mais lisible ; et elle bouge dès l'image 1 **par son sujet**, pas par la seule caméra. Elle se choisit sur une planche de quatre candidates, AVANT les actes (`docs/recette-agents.md`).
- **Les textes s'affichent au moment où ils sont dits** (`buildHook`, `buildCaptions`) : chaque mot monte à sa place quand la voix le dit, rien n'est affiché en attente, la place de chaque mot est réservée. La première image du film n'a donc pas de texte.
- **La voix démarre vite** (`lead` ≈ 0,2 s) et l'accroche se joue avec de l'énergie, **sans crier**.
- **La boucle est sacrée** : la dernière phrase du film est inachevée et se termine par les premiers mots de l'accroche. Réécrire une accroche, c'est d'abord garder ces premiers mots. Cette dernière phrase est la queue de l'annonce du prochain dossier, qui passe en tout dernier.

### La structure d'un épisode (≈ 75–95 s)

1. **Accroche A · B · C**.
2. **La scène et le compte à rebours** : ce qui se passe si rien n'agit. Le chrono reste à l'écran jusqu'à la fin. **C'est la cible n° 1 (10 → 25 s)** : même instant que l'accroche, une image et un enjeu par phrase, l'enjeu visible, une tâche pour le spectateur, 30 mots au plus, une seule pause, dite vite.
3. **« Alors… on l'ouvre. »** : la vue éclatée. Énumération courte, puis on isole **le cœur**. **C'est la phrase signature du compte** : mot pour mot, jamais reformulée ni fondue dans une autre phrase ; seule dans son beat, une seule fois par film ; jouée `[calm]` avec sa pause (une prise où la pause manque se reprend) ; l'éclaté s'ouvre sur le mot. **Son ton : nonchalant, sûr de lui, charismatique** (1,06 à 1,36 s, 10,5 à 15,9 l/s sur les 005 à 017). Elle se dit **toujours dans la même requête que la scène tendue qui la précède**, jamais en tête d'une requête ni reprise seule : `npm run voice` la rattache d'office et signale « « on l'ouvre » traîne » au-delà de 1,5 s ou sous 9,5 l/s — une prise ainsi signalée se reprend avant le montage.
4. **Le mécanisme au repos** : comment il attend. Phrases courtes, une idée par phrase.
5. **Le seuil** (≈ 25–32 s, à la porte de l'acte 3) : une phrase, trois secondes au plus — la demande d'abonnement, portée par la promesse de ce qui arrive.
6. **Le danger arrive** : on reprend le chrono, le mécanisme réagit, climax.
7. **Chute** : on retourne l'idée reçue (« Tu ne percutes pas un airbag qui se gonfle. Tu t'enfonces dans un airbag qui se dégonfle. »).
8. **Ce que le film doit encore** : la réponse à la curiosité du C, et la question du commentaire. Juste après la chute.
9. **Le like**, puis **le prochain dossier, en tout dernier**.
10. **Rebouclage** : dernière phrase inachevée — la queue de l'annonce du prochain dossier —, dernière image = première image.

Relance la tension toutes les 8–12 s (un fait, une question, un changement de plan). Aucune phrase ne doit pouvoir être coupée sans que l'histoire y perde. Recette d'écriture complète : `docs/recette-script.md` (à lire avant d'écrire un script ; `npm run script` la vérifie). **La promesse ne rassure pas** ; **la question du commentaire est fermée, à deux camps** ; la légende TikTok ouvre sur le mot cherché (`post.keyword`). Les films qui ont percé sont sortis entre 19 h et 23 h.

### L'animation raconte aussi

- **Chaque phrase a sa démonstration** : ce qu'elle dit se passe à l'écran pendant qu'elle le dit. Une image qui illustre « à peu près » est à refaire.
- **Les plans s'enchaînent** : un plan naît du précédent — on suit la pièce qui bouge, on recule depuis le détail, on raccorde sur une même forme. Pas de plans déconnectés.
- **On distingue tout, tout de suite** : un sujet par plan, grand, clair sur fond sombre. Si une capture réduite à 270 px de large ne se lit pas, le plan est raté.
- **Moins d'habillage, plus de mécanisme** : un panneau n'entre que s'il apporte un chiffre que l'image ne peut pas montrer.

**La grille seconde par seconde** : les gens partent à la première seconde, puis de la fin de l'accroche à ≈ 25 s ; `npm run qa` → « rythme » le mesure. Dispositifs (`docs/recette-actes.md`) : `D.punch` (un mot qui frappe par phrase au plus, jamais sur une coupe), `glide`, `D.captionStyle({ hit })`, `duelCall` (**le film ne répond jamais à la place du spectateur**) ; les sons de `sfx` entre 600 Hz et 5 kHz, dans les souffles de la voix, jamais sur un mot. Le son est synthétisé : c'est l'écoute de Merwan, sur un téléphone, qui le valide.

### Appels à l'action : jamais à la va-vite

Trois CTA par épisode — **like, commentaire, abonnement** — chacun avec sa phrase, sa raison tirée de l'histoire, et son moment d'image. Un CTA expédié (« like et abonne-toi ») est interdit. Sa règle : « qu'on ne les sente pas passer, qu'on les entende, qu'on les comprenne, mais que ça ne coupe pas dans le dynamisme de la vidéo ».

**L'ordre de la fin (depuis le 018) : rien ne passe avant ce que le film doit encore.**

1. **la chute** ;
2. **ce qui est dû** : la question du C revient et on y répond, puis la question du commentaire — tout de suite, sans rien entre les deux ;
3. **le like**, une phrase ;
4. **le prochain dossier, en tout dernier** : plus rien du sujet en cours ne revient après lui. La voix l'annonce, avec un seul fait ; **elle ne redemande pas l'abonnement** : c'est le panneau qui le porte (« S'abonner pour l'ouvrir »), et ses chevrons ;
5. **la boucle** : la queue de cette annonce — une demi-phrase inachevée, deux secondes au plus, aucun fait nouveau, qui retombe sur les premiers mots de l'accroche.

Dans le modèle : `kit/template/episode.json` (beats `chute → comment → like → abo → boucle`, repère `tocta` sur `comment`) et `kit/template/src/fin.js`.

- **Like** : un motif altruiste ou utile, lié au sujet.
- **Commentaire** : la question du C revient, on y répond en un mot.
- **Abonnement : au seuil, pas à la fin.** Une seule phrase à la porte de l'acte 3 : deux mots de demande, puis la promesse de ce que l'acte 3 va montrer, avec les mots de l'épisode — de préférence ceux de l'accroche (008 : « Abonne-toi : ce millième de seconde, on te le montre en entier. »). Jamais une formule passe-partout, jamais plus de trois secondes, jamais dans les dix secondes de l'accroche. **Le film ne s'arrête pas pour elle** : pas de panneau, pas de silence, la caméra déjà en route vers la menace, chevrons `#rail-seuil`. Beat `seuil` dirigé `[tense]` ; `followCall` (`kit/lib/blocks.js`) à la fin d'`acte2.js`. Le seuil « passe crème » : on n'y touche pas.

À l'image, les chevrons `.rail` désignent la colonne de boutons de TikTok ; on n'imite pas l'interface. `npm run voice` signale un CTA dit trop vite : le redonner à jouer avec une pause.

### Exactitude

C'est un compte qui apprend des choses aux gens : chaque fait est vérifié (recherche web) avant d'entrer dans le script, et noté dans `episode.json` → `sources`. Simplifier oui, inventer non. Les chiffres douteux sortent du script ou deviennent des ordres de grandeur. Quand aucune source ne décrit un geste que l'image montre, la voix ne le dit pas et `sources` dit que l'image reconstitue.

## Notre patte (et ce qu'on ne copie pas)

On ne reprend pas le trait de @souslecapot_ (dessin blanc sur bleu nuit, vues en plan). Notre identité :

- **Le dossier** : chaque épisode est un « DOSSIER 00X », avec un HUD (titre, chrono, compte à rebours, actes 01 MENACE / 02 AUTOPSIE / 03 RÉPONSE, et le nom du compte qui s'allume à la chute).
- **Le temps réel** : l'histoire se déroule à la seconde, le chrono affiché est celui que dit la voix.
- **De la vraie 3D éclairée comme en studio** (Three.js) : pièces pleines aux arêtes fines, ombres douces, reflets, flou de mouvement, vue éclatée qui s'ouvre et se referme.
- **Deux matières** : le système qu'on autopsie est **plein** (sombre, arêtes claires, posé sur un halo de lumière) ; ce qui l'entoure est vu **aux rayons X** (coque de verre, traits fins, et à l'intérieur, pleins, les seuls éléments qui comptent).
- **Trois couleurs qui ont un sens** : `ink` #E9E4D8 (structure, texte) · `veille` #5CFFB0 (le système vivant) · `signal` #FF5B2E (la menace). Rien d'autre.
- **Typo** : Barlow Condensed (titres, sous-titres) + JetBrains Mono (HUD, données).
- **Sous-titres mot à mot** : chaque mot apparaît quand il est dit, jamais avant ; `*mot*` = signal, `+mot+` = veille. Ils sont en capitales : une unité à symbole (« 10 µs ») s'écrit en toutes lettres dans `text`, ou va dans l'en-tête.

**Les zones de TikTok comptent** : sur un écran haut, l'app rogne ≈ 53 px de chaque côté, sa barre de recherche couvre le haut jusqu'à y ≈ 205, ses boutons le bord droit (x > 905) de y ≈ 880 à 1760, le nom du compte et la légende tout ce qui est sous y ≈ 1620. Nos zones, en variables dans `kit/brand.css` (`--safe-l`, `--safe-r`, `--clear-r`, `--hud-top`, `--slot-top`) : HUD 236–410 · **zone haute 436–790** (un seul panneau à la fois) · sujet 3D 440–1160, plutôt à gauche du centre s'il descend sous 880 (`cam.side`) · cartes d'accroche 1186–1542 et sous-titres 1248–1488, marge droite 190 · rien d'important sous 1600. `npm run review` dessine ces zones sur chaque vignette : rien de lisible ne doit tomber dedans.

## Du thème à la vidéo

```
npm run new     -- 003 ascenseur "Ascenseur"   crée episodes/003-ascenseur depuis kit/template (Lnn : kit/template-long ; HSnn : kit/series.json)
npm run script  -- 003                         script, minutage, repères (et vérification de l'écriture)
npm run salle   -- 031 032 033                 un lot de scripts : accroche, mots, ✗/⚠, devis voix de chacun et total (ne dépense rien)
npm run credits                                solde ElevenLabs (appel gratuit)
npm run voice   -- 003                         séance de doublage : annonce le coût, n'enregistre rien sans --budget ; affiche la courbe de tension, acte par acte
npm run essai   -- 003 --file essais.json      banc d'essai voix : un passage sous plusieurs directions, mesuré contre le narrateur du film (même règle : rien sans --budget)
npm run review  -- 003 [--from s --to s --every s]   planche-contact : le film entier sur une page
npm run look    -- 003 --at 0.04,beat:mot+0.2  images d'essai côte à côte, zones TikTok par-dessus
                   --file essais.json          …chacune avec sa pose ({ "at", "pose", "label" }) et son état ("state": { "explode": 1 })
                   --out <fichier>             toute planche de travail hors de renders/ (Merwan voit renders/)
npm run snap    -- 003 --at 1,8,20             images en pleine résolution
npm run check   -- 003                         lint + audits HyperFrames, doit passer
npm run preview -- 003                         lecture en direct dans le studio
npm run render  -- 003 [--draft]               MP4 dans renders/, audio à -14 LUFS
npm run qa      -- 003 [--file renders/003-ascenseur-draft.mp4]   le MP4 rendu (ou le brouillon) : voix calée, niveau, aucune image parasite, fluidité, rythme
npm run cover   -- 003                         couverture de grille (long : --alt 2, --alt 3 ; essais : --thumbs essais.json --out … --gpu)
npm run srt     -- L01                         sous-titres et chapitres horodatés d'un long
npm run phone   -- 003                         copie du film sous 30 Mio (renders/<ep>-iphone.mp4), pour l'envoyer au téléphone par la conversation
npm run social  [-- --out <dossier>] [--only facebook|stories|youtube]   stories, bannière YouTube, post Facebook (scripts/social.mjs)
npm run chrono  -- 012 <étape> | stop | agent <nom> --jetons N … | jauge --session N --hebdo N   chronomètre de la fabrication
npm run metrics [-- 012]                       ce que coûte un dossier et ce qu'il rapporte
npm run front                                  bureau de publication + cabine d'écoute (même Wi-Fi ; `publier.cmd` le garde ouvert)
```

**Ordre de travail** : faits → script (`scenariste`) → contre-vérification (les seules phrases du script) → **un seul message à Merwan : l'accroche et le budget voix, oui ou non** → **voix** (elle fixe le minutage) → architecte (`plan.js` sans import, `world.js`, page, repères, `docs/<ep>-decors.md`, `docs/<ep>-actes.md`) → décors en parallèle → **habillage** (`docs/recette-decorateur.md`) → première image sur planche de quatre → quatre actes en parallèle → relecture sur planches `look` de 8 instants au plus (au-delà, chaque vignette est lue trop petite pour juger) → `check` → `render --draft` + `qa --file` (les images parasites se corrigent sur le brouillon) → retouches (`retoucheur`) → `render` → `qa` → `cover` → `node scripts/posts.mjs`. Préparer des sujets = lui donner la liste à valider ; ni agents ni films sans voix avant son oui. **Plusieurs courts à la fois** : `docs/salle-d-ecriture.md` (faits × N, `scenariste` × N, contre-vérif × N, puis `npm run salle -- 031 032 …` : un seul message à Merwan pour tout le lot).

### La chaîne, économe (cible : ≈ 2 h et ≈ 1,5 M de jetons par épisode, sans rien céder sur l'image)

- **Une conversation neuve par épisode.** C'est le projet (ce fichier, `docs/`, le code) qui porte la mémoire, pas la conversation. Une conversation d'orchestrateur qui dépasse 500 k jetons coûte plus que ses agents : un chef de production neuf la remplace.
- **Agents** : recherche et contre-vérification sur un modèle léger (`model: "sonnet"`, `effort: "medium"`, 30 requêtes) ; architecte, décors, décorateur et actes sur le modèle de la session. Un agent par fichier, liste fermée, **30 images lues au plus**, un journal sur le disque. Jamais d'audit, jamais de relecteur par agent. Recette : `docs/recette-agents.md`.
- **Celui qui orchestre** : ne lit pas un dossier de faits en entier (le message final de l'agent suffit, avec ses sections « à ne pas dire ») ; aucun fichier lu en entier s'il a un résumé ; **n'appelle rien pendant que les agents travaillent** ; relance la relecture dès la notification de fin, sans attendre Merwan ; écrit ses bouchons par script ; lance un `render` avec sa sortie jetée.
- **Une retouche** se confie à un agent neuf, `retoucheur` (le fichier, le journal de l'agent d'origine, la liste fermée des défauts : ≈ 0,15 M) ; `SendMessage` à l'agent d'origine seulement pour une retouche de trois appels au plus (il relit tout son contexte à chaque appel : 0,35 à 0,69 M la reprise).
- **Les rôles sont définis une fois** dans `.claude/agents/` (`faits`, `scenariste`, `contre-verif`, `architecte`, `decor`, `decorateur`, `acte`, `chapitre`, `retoucheur`, `chef-de-production`, `promo`) : la consigne d'un agent ne donne que le dossier, le fichier et ce qui est propre au dossier. La chaîne entière, qui lance quoi et en quel modèle : `docs/chaine-optimisee.md`.
- **Les commandes impriment un résumé** (verdict, ⚠ et ✗, chiffres clés, chemins) ; la sortie complète est dans `.cache/logs/<ep>-<cmd>.log`, `--verbose` la rend. `npm run -s` retire l'en-tête de npm. Détail : `docs/outillage.md`.
- **Réutiliser les décors** au lieu d'en modéliser un par épisode (un décor neuf ≈ 435 k jetons) : un décor qui sert deux fois monte dans le kit. Catalogue des décors existants : `docs/catalogue.md` (`npm run catalogue` le régénère, `--check` signale un décor sans fiche) ; l'histoire de chacun : `docs/memoire/dossiers-*.md`. Un décor réutilisé garde son habillage.
- **La fenêtre de 5 h est le plafond, pas le temps.** Un court entier (≈ 80 points de fenêtre) ne tient plus dans une fenêtre : architecte, décors et décorateur dans une, actes, relecture et rendu dans la suivante ; quatre agents à la fois au plus ; un gros lot se lance juste après une remise à zéro, jamais au-delà de ≈ 85 %. Des agents déjà lancés continuent de consommer. Sur une limite de jauge la nuit : un réveil programmé à la remise à zéro, courts avant longs, jamais les crédits voix.
- **Tout dossier est chronométré** (`npm run chrono`) : `chrono <étape>` à chaque changement d'étape (`faits`, `script`, `decors`, `actes`, `relecture`, `brouillon`, `voix`, `passe`, `rendu`), `chrono agent …` à chaque notification de fin d'agent, `chrono jauge` au début, à mi-parcours et à la fin. Données dans `metrics/`.

Le squelette d'un épisode (`world.js` : `FIRST`, `POSE0`, `VIEW`, `BENCHED`, `STAGED`, `apply` ; `kit/lib/direct.js` ; `kit/lib/blocks.js`), les mesures et ce qu'elles ont appris : `docs/memoire/production-chaine.md`.

### Le script (`episode.json`)

Chaque beat = `{ id, text, vo, voAlt?, hold? }` ; `text` s'affiche (`*…*`, `+…+`, `[85|quatre-vingt-cinq]`), `vo` est le même texte **dirigé** — mêmes mots, même ordre. Plus `post` (`caption`, 5 `hashtags`, `pinned` ≤ 150 caractères, `keyword`), `cover`, `cues` (`beat`, `beat$`, `beat:mot`, `±s` : image **et** son lisent les mêmes repères), `sfx`, `duck`. Un repère `beat:mot` attrape aussi la forme dite des nombres et le début des mots : le vérifier sur la table de `npm run script`. Détail : `docs/memoire/script-et-voix.md`.

### La voix : une séance de doublage, et des crédits qui se respectent

Voix « Eric – Calm, Low & Reflective » (`9osbeK6KzhDRV0yX4rTq`) — **on reste sur Eric**. Modèle **`eleven_v4_turbo` à partir du 018** (moitié prix, « exactement pareil » à l'oreille de Merwan) ; les 001 à 017 restent sur `eleven_v4` (une reprise chez eux se paie au plein tarif). Exigence : **jouée, jamais monotone** — et jamais criée. On garde Eric dans son registre (ferme, posé, `[tense]` sans majuscules pour l'énergie).

- **Les crédits sont à Merwan.** Rien ne s'enregistre sans qu'il ait vu le coût et dit oui : `npm run voice` annonce l'estimation et s'arrête ; il faut `--budget <crédits>` pour dépenser, et seulement après son accord. `npm run credits` donne le solde.
- **Le tarif se lit, il ne se retient pas.** Avant d'annoncer un coût à Merwan : lancer la commande sans `--budget` le jour même et lui donner le chiffre qu'elle affiche, jamais un ordre de grandeur de mémoire. `--budget` est un **plafond sur ce qui est réellement facturé** (`spendGuard`). Le turbo est facturé ≈ 0,44 de l'estimation.
- **La recette en vigueur (courts)** : **le film en UNE requête**, une prise (`DEFAULT_TAKES = 1`), `stability` 0,4, **une balise au plus par beat et aucune au milieu d'une ligne** ; le relief de l'acte 3 vient de l'écriture (phrases de trois à six mots, des points là où l'on mettrait des virgules), pas d'une balise. Jamais trois phrases de suite sur la même balise. Toute nouvelle façon d'enregistrer s'écoute d'abord sur un passage de 20 à 30 s qui traverse une porte d'acte, jamais sur deux phrases.
- **Balises** : `[calm]` pour « Alors… on l'ouvre » ; `[tense]`, `[firm, matter-of-fact]` pour la menace ; `[curious]` pour l'autopsie (pas `[serious]` sur une menace) ; la chute `[firm, matter-of-fact]` — **plus jamais `[low, grave voice]`** (« il essaye de draguer ») ; jamais `[dramatic]` sur l'accroche ni avec un « ! » ; `[urgent]` avec un mot en MAJUSCULES crie : interdit. `[short pause]` pour une pause qui compte (`...` n'est joué qu'une fois sur deux). La dernière phrase s'écrit dans `vo` avec une virgule au bout. `speed` est ignoré : pour raccourcir, on coupe du texte. Table mesurée sur Eric : `docs/memoire/script-et-voix.md`.
- **Quatre tons, pas un** : MENACE ça presse ; « on l'ouvre » la rupture, calme d'un coup ; AUTOPSIE curieux, complice, plus lent ; RÉPONSE le pic, puis le relâchement ; chute ferme et nette ; CTA complices. `npm run voice` affiche la courbe de tension (`audio/vo.json` → `arc`) ; une séance notée `MÊME TON PARTOUT` ne se monte pas en film — sur les 021 à 030, ce verdict a été laissé à l'oreille de Merwan.
- **Une phrase ne va pas** → on réécrit **sa** ligne `vo` et on la reprend seule (`--retake <phrase>`), jamais une séance complète. Un choix qui doit tenir s'écrit dans `audio/picks.json`. **L'oreille tranche** : la cabine (`/voix.html?ep=<dossier>`) ; lire ses notes avant de toucher à la voix ; ne pas rendre pendant qu'il choisit. Vérifier que rien n'est coupé.
- **La clé de secours (`elevenlabs_secours`) n'est branchée nulle part**, et ne doit pas l'être sans sa décision. Les clés sont dans `.env` (jamais affichées, jamais committées). Le MCP ElevenLabs ne sert jamais pour la voix des films.

L'histoire de ces règles (tarif du 13/10, essai turbo, bancs, échec du 018) : `docs/memoire/voix-historique.md`.

### L'image

`kit/` est le moteur partagé (plateau, matières, overlays, `direct.js`, `blocks.js`, `figure.js`, `details.js`) ; un acte n'écrit que `st`, `shot`, `cut` (pose complète), `tl` sur des instants lus dans le script. Options `LOOK` dans `world.js` (`{ dof: 8, air: 0, finish: 1 }` sur un court) : `dof` **aux seuls gros plans**, toute autre pose dit `dof: 0` ; une option n'entre que si la planche avant / après montre un gain net à 270 px. Détail et pièges : `docs/memoire/kit-et-plateau.md`.

**Pour que ça ne fasse jamais amateur** et **net et fluide** : `docs/memoire/regles-image.md`, à lire par tout agent de décor, de décorateur ou d'acte. L'essentiel : le sujet est le plus lisible du cadre (sombre **sur un halo**, ou clair sur sombre ; jamais sombre sur sombre) ; un mécanisme de trois quarts, jamais de face ; une coupe se pose quelques images **avant** sa phrase ; le mécanisme suit **la voix** ; plus d'un quart de tour en une seconde est une **coupe** ; ce qui ne sert pas au plan est **invisible**. Un rendu ne se livre pas avec une image parasite non voulue (`qa`).

### Avant de livrer

- `npm run review` : chaque vignette se lit, la première image arrête le pouce, la dernière est identique à la première.
- `npm run check` passe (au contrôle de contraste, un même texte en défaut à deux instants compte comme une erreur) ; `npm run qa` confirme la voix calée et le niveau.
- Merwan a écouté la voix dans la cabine (au moins l'accroche et les trois CTA).
- Le MP4 fait ≥ 60 s.
- Ne montrer à Merwan que des images dont on est fier : un essai technique raté se corrige avant, pas devant lui. Il voit `renders/` et le panneau du navigateur : les planches de travail sortent avec `--out` dans un dossier temporaire ; dès qu'une vraie image existe, on la lui envoie. L'outil d'écriture ouvre tout `index.html` écrit dans son panneau navigateur : écrire les pages par script.

**Hors de chez lui**, les films passent par la conversation (30 Mio par fichier : `npm run phone`) ; ne pas ouvrir le PC à Internet. **Ce qui est en ligne** se lit dans `metrics/publication.json`. Le bureau sert `front/` tel quel : on construit à côté (`front/next.*`, port 4174). Détail : `docs/memoire/publication.md`.

**Après publication** : 24 à 48 h après la mise en ligne, demander à Merwan la courbe de rétention et les chiffres (vues, durée moyenne, % qui finissent, abonnés gagnés) ; ils vont dans `metrics/audience.json` (`npm run metrics` en tire les ratios). L'épisode suivant s'écrit avec ça sous les yeux. Ce qu'on en a tiré jusqu'ici : `docs/memoire/audience.md`. On ne reposte jamais un dossier publié : l'ordre de la grille fait la DA.

## Le format long (YouTube)

Des longs de 9 à 14 minutes, 16:9, numérotés `L01`, `L02`… — « un vrai rendu pro », « un vrai but » : le spectateur repart avec de vraies connaissances. D'abord « comment c'est fait » (L01 le pare-brise), puis un lieu où tu n'entres jamais (L02 le poste haute tension) : **ce n'est pas une série** — jamais « série » ni « Accès interdit » face au public. Ses critères pour choisir un long : varier, universel, technique, de la matière, fait réagir et apprendre, très visuel.

- **La DA, transposée** : 3D aux rayons X, l'objet plein ; à chaque étape, sa menace ; l'acte 3 est le test ; « Alors… on l'ouvre » garde sa place. Le réel entre comme **pièce du dossier** (brevet, règlement, photo du domaine public vérifiée) ; jamais d'images de stock ni de vidéos d'autres chaînes.
- **La rétention d'abord** : la promesse du titre et de la miniature dite dans les 30 premières secondes ; pas de sommaire dit ; **chaque chapitre finit sur une relance** ; **coupures pub** (`"midroll": true`) juste après un fil laissé ouvert ; jamais de remplissage. Un nouveau plan toutes les 5 à 10 s ; **chaque coupe est un raccord** (forme, objet, mouvement).
- **La fin d'un long n'annonce pas le sujet suivant** : un rendez-vous, sans date ni sujet, puis la boucle.
- **Titres, miniatures, descriptions : c'est moi qui les gère.** La miniature fait 70 à 99 % du travail ; les titres « limite putaclic mais fidèles ».
- **La voix du long** : turbo, un narrateur qui raconte ; une requête par chapitre (`voice.parts` ; 10 000 caractères au plus par requête) ; `[conversational, curious]`, `[warm, conversational]`, `[curious]` en rotation, `[amused]` sur quatre paradoxes au plus, `[calm]` pour « on l'ouvre » ; jamais `[firm, matter-of-fact]`, `[thoughtful]`, `[urgent]`, `[dramatic]`, `[ominous]`, `[low, grave voice]`, ni `[tense]` hors de l'accroche, ni `[serious]` au test.
- **Les recettes, à lire avant tout long** : `docs/recette-long.md`, `docs/recette-long-image.md`, `docs/recette-long-retention.md`. Version longue : `docs/memoire/long-reference.md` ; L01 à L04 : `docs/memoire/dossiers-longs.md`.

**Les promos des longs** sont des courts hors-série (`HSnn`), faits par l'agent `promo` (`.claude/agents/promo.md`, `docs/recette-promo*.md`) : ne pas spoiler le long, frustrer, garder la boucle et « on l'ouvre » ; le long et ses liens d'abord, la promo ensuite.

## Index : où trouver le reste

| Pour… | Lire |
| --- | --- |
| écrire un script court | `docs/recette-script.md` ; justifications et citations : `docs/memoire/regles-recit.md` |
| organiser un dossier, ses agents, sa jauge | `docs/recette-agents.md`, `docs/memoire/production-chaine.md` |
| monter un acte | `docs/recette-actes.md`, `docs/<ep>-actes.md`, `docs/<ep>-actes-maj.md` |
| habiller un décor | `docs/recette-decorateur.md` (catalogue `kit/lib/details.js`) |
| réutiliser un décor | `docs/catalogue.md` (vignettes `docs/catalogue/`, promotions `docs/catalogue-promotions.md`), puis `docs/memoire/dossiers-*.md` |
| les règles d'image | `docs/memoire/regles-image.md` ; le kit et ses pièges : `docs/memoire/kit-et-plateau.md` |
| préparer une séance voix, une reprise, un banc | `docs/memoire/script-et-voix.md` (table des balises) ; l'histoire : `docs/memoire/voix-historique.md` |
| livrer, envoyer au téléphone, le bureau | `docs/memoire/publication.md` |
| les chiffres d'audience et ce qu'ils disent | `docs/memoire/audience.md`, `metrics/audience.json` |
| un long ou une promo | `docs/recette-long*.md`, `docs/recette-promo*.md`, `docs/memoire/long-reference.md`, `docs/memoire/dossiers-longs.md` |
| l'état et les leçons d'un dossier court | `docs/memoire/dossiers-001-017.md`, `docs/memoire/dossiers-018-030.md` ; les nuits : `docs/journal/` |
| proposer la suite (sujets faits, écartés, demandés) | `docs/memoire/sujets.md` |
| le rush YouTube (4 000 h avant le 31/01/2027 : rythme, affaires réelles, compilations, stock de courts) | `docs/plan-rush-youtube.md` |
| les passes « scale » du 21/10 | `docs/scale/` |
| un fait sourcé | `docs/faits/<ep>-*.md` et `<ep>-contre-verification.md` |

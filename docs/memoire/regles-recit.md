# Règles du récit : le compte, l'accroche, la structure, les appels à l'action, la patte, les zones (version longue)

> Recopié tel quel de l'ancien `CLAUDE.md` le 2026-10-27, quand il a été resserré (copie intégrale : `CLAUDE-complet-2026-10-27.md`). Les règles en vigueur sont dans `CLAUDE.md` ; ce fichier garde le détail, les mesures et l'histoire. Les dates et les « aujourd'hui » sont ceux du texte d'origine.

Pour : écrire ou relire un script, juger une première image, monter la fin d'un film. Le texte complet, avec les citations de Merwan et les mesures qui fondent chaque règle.

---

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
| Instagram et YouTube Shorts | Lancés par Merwan le 2026-10-08. Bios dans `brand/profil.json` → `bios` (Instagram : 150 caractères ; YouTube : la description de la chaîne). Pour chaque dossier, `episode.json` → `post.instagram` (`caption`, `hashtags`) et `post.youtube` (`title` de 100 caractères au plus, `description`, `hashtags`) : écrits par `node scripts/posts.mjs` (les textes y sont), affichés au bureau avec leurs boutons copier. **Cinq hashtags au plus sur chaque plateforme** (sa règle) ; mêmes règles que la légende TikTok : jamais la chute, le mot que les gens cherchent, la question du commentaire à la fin. Un nouveau dossier s'ajoute dans `scripts/posts.mjs`. |
| Facebook | Page créée par Merwan le 2026-10-09, pour débloquer la monétisation. Post de présentation et son image (`npm run social -- --only facebook`) livrés le même jour. |
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
- **La première image se note sur six points** (courbes TikTok du 015 et du 012, 21/10 : les deux perdent la plupart des spectateurs à 0:01 ; le 015 en tient 59 % à 0:07, le 012 52 % à 0:09) : un événement déjà en cours, pas un état ; une perspective basse qui tire l'œil ; la menace derrière le sujet, qui s'y découpe ; une forme reconnue en un tiers de seconde, vue d'où on ne la voit jamais, sur 40 % de la largeur ; le système déjà là, petit mais lisible ; et elle bouge dès l'image 1 **par son sujet**, pas par la seule caméra (`qa` → « rythme », mouvement de la première demi-seconde : 9,8 au 015, l'avion qui fonce ; 1,3 à 3,7 sur nos autres films). Ce mouvement se décide avec l'image 0, sur la planche des candidates : un sujet immobile au premier plan (le sanglier du 025) n'en donne pas. Détail : `docs/recette-agents.md`.
- **Les textes s'affichent au moment où ils sont dits** (Merwan, 07/10 au soir, après avoir vu les 005 et 006 en ligne : « ça serait bien que les textes s'affichent au moment où il est dit et pas tout d'un coup en gros bloc, ça fait pas pro »). Cartes d'accroche (`buildHook`) et sous-titres (`buildCaptions`) : chaque mot monte à sa place quand la voix le dit, rien n'est affiché en attente. La place de chaque mot est réservée dans le bloc, les lignes ne se recentrent pas en se remplissant. Conséquence : la première image du film n'a plus de texte — c'est l'image seule qui doit arrêter le pouce.
- **La voix démarre vite** (`lead` ≈ 0,2 s) et l'accroche se joue avec de l'énergie, **sans crier** : `npm run voice` pénalise un silence dans la première phrase, signale une phrase « criée » (plus de 4 dB au-dessus du reste) et la baisse au mixage.
- **La boucle est sacrée** : la dernière phrase du film est inachevée et se termine par les premiers mots de l'accroche. Réécrire une accroche, c'est d'abord garder ces premiers mots (002 : « …Surtout à… » → « Cinquante kilomètres-heure. »). À partir du 018, cette dernière phrase est la queue de l'annonce du prochain dossier, qui passe en tout dernier (voir « Appels à l'action »).

### La structure d'un épisode (≈ 75–95 s)

1. **Accroche A · B · C** (voir ci-dessus).
2. **La scène et le compte à rebours** : ce qui se passe si rien n'agit. Le chrono reste à l'écran jusqu'à la fin.
3. **« Alors… on l'ouvre. »** : la vue éclatée. Énumération courte, puis on isole **le cœur**. **C'est la phrase signature du compte** (Merwan, 10/10 : « les gens adorent le "alors on l'ouvre" dans les commentaires, ça revient souvent ») — elle est dans les 17 premiers scripts, elle reste dans tous les suivants. Ce que j'en tire, à moi : mot pour mot, jamais reformulée ni fondue dans une autre phrase ; seule dans son beat, une seule fois par film ; jouée `[calm]` avec sa pause (une prise où la pause manque, comme sur le 010, se reprend) ; et l'éclaté s'ouvre sur le mot. **Son ton : nonchalant, sûr de lui, charismatique** — celui des 005 à 015, que Merwan veut retrouver (16/10 : « maintenant on dirait qu'il n'a plus envie de l'ouvrir, et les gens le remarquent »). Mesuré du 005 au 017 : 1,06 à 1,36 s, 10,5 à 15,9 l/s. Sur les 018, 019 et 020, enregistrés acte par acte, la phrase ouvrait la requête de l'autopsie : dite à froid, elle traîne (1,7 s, 7,5 l/s, deux fois plus lente). Donc elle se dit **toujours dans la même requête que la scène tendue qui la précède**, jamais en tête d'une requête ni reprise seule : `npm run voice` la rattache d'office à la phrase d'avant (prise et reprise) et signale « « on l'ouvre » traîne » au-delà de 1,5 s ou sous 9,5 l/s — une prise ainsi signalée se reprend avant le montage.
4. **Le mécanisme au repos** : comment il attend. Phrases courtes, une idée par phrase.
5. **Le seuil** (≈ 25–32 s, à la porte de l'acte 3) : une phrase, trois secondes au plus — la demande d'abonnement, portée par la promesse de ce qui arrive (voir « Appels à l'action »).
6. **Le danger arrive** : on reprend le chrono, le mécanisme réagit, climax.
7. **Chute** : on retourne l'idée reçue (« Tu ne percutes pas un airbag qui se gonfle. Tu t'enfonces dans un airbag qui se dégonfle. »).
8. **Ce que le film doit encore** : la réponse à la curiosité du C, et la question du commentaire. Juste après la chute.
9. **Le like**, puis **le prochain dossier, en tout dernier** (voir « Appels à l'action » : l'ordre de la fin).
10. **Rebouclage** : dernière phrase inachevée — la queue de l'annonce du prochain dossier —, dernière image = première image.

Relance la tension toutes les 8–12 s (un fait, une question, un changement de plan). Aucune phrase ne doit pouvoir être coupée sans que l'histoire y perde.

### L'animation raconte aussi

Leçon tirée d'une vidéo de @souslecapot_ que Merwan a montrée en exemple (20 000 vues en 2 h) — on en garde le principe, pas le trait :

- **Chaque phrase a sa démonstration** : ce qu'elle dit se passe à l'écran pendant qu'elle le dit. Une image qui illustre « à peu près » est à refaire.
- **Les plans s'enchaînent** : un plan naît du précédent — on suit la pièce qui bouge, on recule depuis le détail qu'on vient de montrer, on raccorde sur une même forme. Pas de plans déconnectés.
- **On distingue tout, tout de suite** : un sujet par plan, grand, clair sur fond sombre. Si une capture réduite à 270 px de large ne se lit pas, le plan est raté.
- **Moins d'habillage, plus de mécanisme** : un panneau n'entre que s'il apporte un chiffre que l'image ne peut pas montrer.

**La grille seconde par seconde (21/10, après les courbes TikTok du 015 et du 012)** : les gens partent à deux endroits, la première seconde, puis de la fin de l'accroche à ≈ 25 s. `npm run qa` → « rythme » mesure le mouvement de la première demi-seconde, les plages lentes avant 25 s (deux secondes sous 1), les sons de l'habillage qu'un haut-parleur de téléphone joue (010 : 18 ; nos autres films avant le 21/10 : 2 à 4 — l'habillage y était presque muet) et les sons posés sur un mot. Les dispositifs, en une ligne depuis un acte : `D.punch(t.mot, 0.06)` (le mot qui frappe : un par phrase au plus, jamais sur une coupe), `glide(s0, s1)` (une rampe de vitesse, si le sujet reste dans le cadre), `D.captionStyle({ hit: 0.25 })` (les mots `*…*` / `+…+` arrivent plus gros et se posent), `duelCall` (la question du commentaire en deux réponses, chacune allumée sur son mot : **le film ne répond jamais à la place du spectateur** — le 022 tapait « LES MASSES », le 025 tapait « APRÈS ») ; et dans `sfx` : `hit`, `click` (chaque pièce nommée de l'éclaté, dans le souffle qui suit son mot), `swish`, `screech`, `suck` (la respiration qui s'arrête net avant « Alors… »), `hush` (presque le silence de l'habillage jusqu'à « on »), `impact.crack` — entre 600 Hz et 5 kHz, dans les souffles de la voix, jamais sur un mot. Le modèle porte une grille de départ (`kit/template/episode.json`). Recette : `docs/recette-actes.md` ; essai : le 025, `docs/scale/3-retention-wow.md`. Le son est synthétisé : c'est l'écoute de Merwan, sur un téléphone, qui le valide.

### Appels à l'action : jamais à la va-vite

Trois CTA par épisode — **like, commentaire, abonnement** — après la chute, chacun avec sa phrase, sa raison tirée de l'histoire, et son moment d'image. Un CTA expédié (« like et abonne-toi ») est interdit.

**L'ordre de la fin, à partir du 018 : rien ne passe avant ce que le film doit encore.** Merwan, 13/10, un commentaire sous le 015 à l'appui (« le contenu est super intéressant, dommage qu'en plein milieu on se retrouve avec le "abonne-toi" et le programme de la prochaine vidéo avant de reprendre le sujet en cours comme si de rien n'était ») : « ça coupe dans le dynamisme […] les gens quittent la vidéo, ils ne voient jamais la fin, là où on explique vraiment le pourquoi du début […] l'annonce de l'épisode suivant, il faut qu'elle soit vraiment à la toute fin ». Les 001 à 017 sont montés chute → like → « Abonne-toi. Prochain dossier… » → la réponse à la question de l'accroche (quinze secondes de vrai contenu) → boucle : l'annonce se lisait comme la fin du film, et la réponse arrivait après. Désormais :

1. **la chute** ;
2. **ce qui est dû** : la question du C revient et on y répond, puis la question du commentaire — tout de suite, sans rien entre les deux ;
3. **le like**, une phrase ;
4. **le prochain dossier, en tout dernier** : plus rien du sujet en cours ne revient après lui. La voix l'annonce, avec un seul fait ; **elle ne redemande pas l'abonnement** (elle l'a fait une fois, au seuil) : c'est le panneau qui le porte (« S'abonner pour l'ouvrir »), et ses chevrons ;
5. **la boucle** : la queue de cette annonce — une demi-phrase inachevée, deux secondes au plus, aucun fait nouveau, qui retombe sur les premiers mots de l'accroche (le prochain dossier et celui-ci, reliés par ce qui les oppose ou les rapproche).

Sa règle pour tous les appels à l'action, dans ses mots : « qu'on ne les sente pas passer, qu'on les entende, qu'on les comprenne, mais que ça ne coupe pas dans le dynamisme de la vidéo, sinon ça perd tout son charme ». Le seuil, lui, « passe crème » : on n'y touche pas. Dans le modèle : `kit/template/episode.json` (beats `chute → comment → like → abo → boucle`, repère `tocta` sur `comment`) et `kit/template/src/fin.js`, vérifiés sur un épisode d'essai (`check` passe, huit images de la fin). Les 001 à 017 ne sont pas remontés.

- **Like** : un motif altruiste ou utile, lié au sujet (001 : « ça remontera chez quelqu'un qui dort sans détecteur »).
- **Commentaire** : la question du C revient, on y répond en un mot (002 : « où sont tes mains sur le volant. Dix heures dix ? Le sac passe exactement là. »).
- **Abonnement** : il se demande **au seuil**, pas à la fin (Merwan, 08/10, devant la courbe du 003 où un spectateur sur dix seulement entendait « Abonne-toi » : « trouve et mets en place un moyen de catch les gens pour les abonnements, et faut que ce soit fluide et bien amené dans le thème, sinon ça casse tout le rythme »). **Le seuil** : une seule phrase à la porte de l'acte 3, là où ils sont encore trois à quatre fois plus nombreux et viennent de recevoir l'autopsie. Deux mots de demande, puis la promesse de ce que l'acte 3 va montrer, avec les mots de l'épisode — de préférence ceux de l'accroche, qui reviennent (008 : « Abonne-toi : ce millième de seconde, on te le montre en entier. »). Jamais une formule passe-partout, jamais plus de trois secondes, jamais dans les dix secondes de l'accroche. **Le film ne s'arrête pas pour elle** : pas de panneau, pas de silence après ; la caméra est déjà en route vers la menace (008 : elle bascule de la pointe vers la tête du traceur, l'image de l'accroche qui revient), le nom du compte s'allume dans l'en-tête, les chevrons `#rail-seuil` désignent le bouton, le chrono répond au mot. Dans le script : un beat `seuil` entre le repos et l'acte 3, dirigé `[tense]` ; dans le kit : `followCall` (`kit/lib/blocks.js`), monté à la fin d'`acte2.js`.
- **À la fin, l'abonnement n'est plus qu'un appât** : le prochain dossier, classé, avec un seul fait — c'est ce qui fait la transition d'un épisode au suivant. Il vient **en tout dernier**, après la réponse à l'accroche et le like (voir l'ordre ci-dessus), et la voix n'y dit plus « Abonne-toi ».

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
- **Sous-titres mot à mot** : chaque mot apparaît quand il est dit, jamais avant ; `*mot*` = signal, `+mot+` = veille.

**Les zones de TikTok comptent** (Merwan, 06/10, capture du 002 dans l'app sur son iPhone) : sur un écran haut, l'app rogne ≈ 53 px de chaque côté, sa barre de recherche couvre le haut jusqu'à y ≈ 205, ses boutons le bord droit (x > 905) de y ≈ 880 à 1760, le nom du compte et la légende tout ce qui est sous y ≈ 1620. Nos zones, en variables dans `kit/brand.css` (`--safe-l`, `--safe-r`, `--clear-r`, `--hud-top`, `--slot-top`) : HUD 236–410 · **zone haute 436–790** (un seul panneau à la fois) · sujet 3D 440–1160, plutôt à gauche du centre s'il descend sous 880 (`cam.side`) · cartes d'accroche 1186–1542 et sous-titres 1248–1488, marge droite 190 · rien d'important sous 1600. `npm run review` dessine ces zones sur chaque vignette : rien de lisible ne doit tomber dedans.


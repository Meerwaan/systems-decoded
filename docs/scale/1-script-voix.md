# Scale TikTok — 1. Script et voix

Rapport du 2026-10-21 (agent 1 sur 3 : script et voix). Demande de Merwan : « TikTok c'est au ralenti : je veux scale un max ». Ce qui suit : le diagnostic, la recette (`docs/recette-script.md`), le banc d'essai voix du 025, ce que la recette changerait au 025, et le script du 026. Aucun crédit dépensé par moi ; le banc a été enregistré par l'orchestrateur avec l'accord de Merwan (228 crédits facturés).

## En bref

- **Le mot-choc avant 3 s.** Les trois films qui ont percé sur TikTok le disent à 2,3-3,2 s ; les huit autres films postés depuis le 8 octobre, à 3,6-4,3 s, et plafonnent à 16 k. Biais : les trois ont été postés entre 19 h et 23 h.
- **La scène (10 → 25 s) est la cible n° 1.** Sur les deux courbes, l'accroche et la promesse coûtent pareil (≈ 20 + 20 points) au meilleur film (015) et à un film moyen (012) ; ce qui les sépare, c'est la scène qui suit (−17 contre −23 points de 10 à 24 s). Celle du 015 reste dans l'instant, ajoute une image et un enjeu par phrase, et se dit vite.
- **La question du commentaire** fait écrire quand elle est fermée, à deux camps, vérifiable chez soi (« tu lis 30 mA… ou rien ? » 3,5 ‰) ; pas quand elle demande une expérience passée ou un « tu le ferais ? » (« tu le tentes ? » 0,03 ‰ sur le film le plus vu).
- **La voix ne décide pas TikTok** (les trois films qui ont percé ont une voix aussi plate que les autres) ; elle tient le milieu. Banc du 025 : les balises de conversation du long relèvent l'autopsie (+1,4 dt) mais `[serious]` aplatit la menace et « on l'ouvre » traîne en requête courte. → la conversation seulement pour l'autopsie et les appels à l'action.
- **025** : ne rien toucher à la voix (la scène fait déjà l'essentiel ; le gain d'une reprise serait petit, le risque réel). Seule proposition : sa légende.
- **026** : script écrit selon la recette (262 mots, accroche 31 mots), devis voix 960 crédits annoncés (≈ 420 facturés), le 027 annoncé à valider (la voie de détresse).

## 1. Diagnostic

### Les films postés depuis le 8 octobre, sur TikTok

Vues du relevé du 15/10 (015 : ≈ 100 k le 21/10). Heure de mise en ligne lue dans l'identifiant de la vidéo TikTok. Instants mesurés sur la voix montée (`gen/episode.data.js`).

| Film | Vues | Posté | 3 premiers mots | Mot-choc | A·B·C fini | Question du commentaire | Comm. ‰ |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 015 Brin d'arrêt | 96 k | 11/10 23 h 02 | « Tes roues touchent » | « plein » 3,2 s | 9,0 s | « toi, tu le tentes ? » | 0,03 |
| 009 Micro-ondes | 48 k | 08/10 19 h 09 | « Mille watts de » | « visage » 3,2 s | 10,3 s | « il a quel âge ? » | 0,31 |
| 010 Scie | 31 k | 08/10 22 h 21 | « Ta main glisse » | « lame » 2,3 s | 9,2 s | « toi, tu poses le tien ? » | 0,79 |
| 014 ABS | 16 k | 11/10 21 h 23 | « Sous la pluie » | « trembler » 3,6 s | 11,8 s | « ta pédale a déjà tremblé ? » | 0,06 |
| 012 Gazinière | 15 k | 09/10 16 h 50 | « Ta casserole déborde » | « toujours » 4,3 s | 11,3 s | « la tienne, elle l'a ? » | 0,58 |
| 011 Fusible pyro | 15 k | 09/10 14 h 38 | « Choc. Tes airbags » | « explose » 4,1 s | 10,3 s | « tu le savais ? » | 0,81 |
| 016 Disjoncteur | 12 k | 12/10 12 h 03 | « Dans ton mur » | « coupe (pas) » 3,9 s | 9,3 s | « il saute sur quoi ? » | 0,25 |
| 008 Paratonnerre | 8,7 k | 08/10 16 h 43 | « Un millième de » | « toit » 3,6 s | 11,3 s | « tu vas où ? » (le film répond) | 0,34 |
| 013 Halo | 6,3 k | 10/10 16 h 05 | « Premier tour. Ta » | « feu » 3,9 s | 8,1 s | « pour ou contre ? » | 1,12 |
| 017 IRM | 5,2 k (2 jours) | 13/10 16 h 04 | « L'IRM s'est tue » | « arrachée » 4,0 s | 10,8 s | « tu as déjà passé une IRM ? » | 0,57 |
| 007 Siège éjectable | 2,8 k | 08/10 02 h 12 | « On t'offre un » | « mauvaise » 4,2 s | 12,8 s | « tu y vas ? » | 0,71 |

Avant le 8 octobre (TikTok réapprenait le compte) : 004 3,5 k (« Sur ton tableau, tu lis 30 mA… ou rien ? » 3,47 ‰), 003 ≈ 2 k à 47 h (« tu sauterais au dernier moment ? » 2,03 ‰), 005 1,2 k (« il chauffe encore combien de temps ? » 1,73 ‰), 006 2,8 k, 002 5,9 k (« Dix heures dix ? » 1,02 ‰).

- **Les cinq premiers mots disent-ils une image ?** Oui pour les trois qui ont percé (des roues sur un pont, un four à hauteur de visage, une main sur une lame). Les plus faibles ouvrent sur une offre (007), un calme (017), un contexte (013), une durée (008).
- **La menace arrive-t-elle avant toute explication ?** Partout, mais trop tard pour TikTok chez tous les films sous 16 k : le mot-choc tombe après 3,5 s, souvent derrière un « … ».
- **L'heure compte autant** : postés de 19 h à 23 h, 16 à 96 k ; l'après-midi, 5 à 15 k ; à 2 h du matin, 2,8 k. Le pic d'activité des abonnés est 19-22 h (export du 15/10). À l'orchestrateur : c'est un levier hors script.
- **Ce qui fait commenter** : une lecture à faire chez soi dont l'une des réponses fait peur, un camp à choisir, un chiffre à deviner. Ce qui ne fait rien : l'expérience passée, le « tu le ferais ? » sans enjeu, la question à laquelle le film répond.
- **La légende** : les films à partir du 007 ouvrent tous sur le mot cherché (« Micro-ondes : », « Scie sur table : ») ; les cinq premiers non (le 005 : « ☢️ Comment une centrale nucléaire… », 1,2 k). Trop peu pour conclure, mais rien ne s'y oppose.

### Les deux courbes, posées phrase par phrase

Points de `metrics/audience.json` → `courbe` (lus sur les captures, à quelques points près), interpolés sur les instants des phrases.

| Phrase | 015 (96 k) | 012 (15 k) |
| --- | --- | --- |
| accroche | 0,3-3,6 s : −19 pts (5,9/s) | 0,3-4,7 s : −23 pts (5,3/s) |
| promesse | 4,1-9,0 s : −18 (3,8/s) | 5,3-11,3 s : −22 (3,7/s) |
| **scène** | **9,8-17,2 s : −10 (1,3/s)** | **12,2-19,6 s : −13 (1,8/s)** |
| « on l'ouvre » | −2 | −2 |
| éclaté | −6 (0,9/s) | −9 (1,1/s) |
| repos | −8 (1,3/s) | −2 (0,3/s) |
| seuil → fin de l'acte 3 | −10 en 24 s (0,2 à 0,9/s) | −8 en 15 s |
| chute → fin (ancien ordre) | 16 → 2 % | 8 → 2 % |

- **La scène du 015** : « Ton Rafale arrive à plus de deux cents kilomètres-heure. Le pont, lui, finit dans la mer. En travers : trois câbles. Ta crosse doit en accrocher un. » — 25 mots, le même instant que l'accroche, un enjeu de plus par phrase, une tâche pour le spectateur, dite à +4 % du débit médian du film (une seule pause).
- **Celle du 012** : « Un grand feu ouvert, sans flamme : dans les cinq litres de gaz à la minute. Laisse-le toute une nuit, cuisine fermée… et un interrupteur peut suffire. » — 26 mots, une hypothèse (« toute une nuit »), un débit, à +0 %.
- **La promesse coûte autant que l'accroche** sur les deux : celle du 012 rassure (« il se coupe tout seul »), celle du 015 promet un fait incroyable puis deux menaces (« Sauf si tu le rates… ou s'il casse »).
- **L'éclaté** : le 015 suit un chemin (le câble, dessous les poulies, au bout le piston), le 012 énumère.
- Les scènes des 018 à 025 font 33 mots en médiane (11,6 s), jusqu'à 42 (020) ; trois ouvrent sur une date ou un méta (021 « Ce n'est pas un scénario. Vingt-quatre décembre… », 023 « Vingt-quatre août deux mille un. »).

### La voix

- **D'une phrase à l'autre**, le registre bouge de 2,2 à 2,6 dt sur les 002-004 (accroches criées), de 0,9 à 1,7 sur les 005-016, ≈ 1 sur les 017 et 021-025 (`MÊME TON PARTOUT`), 1,9-2,2 sur les 018-020 enregistrés acte par acte (« dégueulasse »). Les trois films qui ont percé : 1,21 (015), 1,62 (009), 1,07 (010) — **le relief de la voix n'explique pas TikTok** ; il répond aux retours « soporifique » sur le milieu du film.
- **L'accroche est souvent dite plus lentement que le reste du film** (−12 à −23 % sous le débit médian sur 009, 010, 012, 014, 016, 024) : le « … » avant le mot-choc.
- **La porte « on l'ouvre »** : 1,06-1,36 s sur 005-017 et 021-025, 1,68-1,77 s sur 018-020. Sur le 025, la scène sort à +3,0 dt, « on l'ouvre » à −2,9 : le contraste y est ; sur le 021, −1,4 puis −1,8 : aucun.

### Le banc d'essai du 025 (enregistré le 21/10 par l'orchestrateur, 228 crédits facturés pour 518 annoncés)

`episodes/025-esp/essais-conversation.json` : scène → « on l'ouvre » → éclaté → repos (10,7 → 35,9 s du film), une requête par essai, mêmes mots, turbo, stabilité 0,4. A : la direction du film. B : la recette du long (`[serious]`, `[calm]`, `[conversational, curious]`, `[amused]`). Écoute : `episodes/025-esp/audio/essais/025-essai-A-film.mp3`, `-B-conversation.mp3`, et le film tel quel `025-essai-0-film-actuel.mp3`.

| Phrase | Film | A (film, requête courte) | B (conversation) |
| --- | --- | --- | --- |
| scène | +3,0 dt | +1,8 dt, −10 % | **−0,5 dt**, −10 % |
| « on l'ouvre » | −2,9 dt, 1,31 s | −4,0 dt, **1,47 s**, 8,9 l/s | −5,1 dt, **1,39 s**, 9,4 l/s, « très grave » |
| éclaté | +0,3 dt | −0,2 dt | **+1,4 dt** |
| repos | +2,1 dt | +2,4 dt, +11 % | +1,8 dt, +10 % |

- **B relève l'autopsie** (+1,6 dt sur l'éclaté face à A) : c'est là que « même ton partout » se joue.
- **`[serious]` n'est pas `[tense]`** : mêmes mots, la menace sort 2,3 dt plus bas. Ce que CLAUDE.md tirait des moyennes (« [serious] tombe au même endroit que [tense] ») ne tient pas dans une scène.
- **« On l'ouvre » traîne dans les deux essais**, au-delà du seuil de `npm run voice` (1,5 s ou 9,5 l/s), alors que la reprise que garde le film — une requête courte elle aussi — tient 1,31 s, et les prises entières des 021-025 1,07-1,31 s. Une requête courte ne le garantit pas ; la prise du film entier reste sa source.
- **Le banc du 017 ne se reproduit pas** : il trouvait une requête courte ≈ 2 dt plus haute ; ici, la direction du film en requête courte sort plus bas que le film (scène +1,8 contre +3,0).
- **Conclusion** : la conversation pour l'autopsie et les appels à l'action ; la menace, l'acte 3 et « on l'ouvre » comme avant. **À Merwan de trancher B à l'oreille** ; le modèle et le 026 portent les deux (`vo` = conversation, `voAlt` = film, sur l'éclaté, le repos, le commentaire, le like et le relâchement).

## 2. La recette

`docs/recette-script.md` : les chiffres, les trois premières secondes mot à mot, la promesse qui ne rassure pas, la scène (cible n° 1 : même instant, une image et un enjeu par phrase, l'enjeu visible, une tâche pour le spectateur, 22 à 30 mots, une seule pause, dite vite), un fil ouvert toutes les 8 à 12 s et les portes qui finissent sur une question, la question du commentaire (fermée, deux camps), le budget de mots (255 à 265 ; par phrase), la direction par défaut et ce que le banc en dit, la grille d'autocontrôle phrase par phrase, la légende.

- **Le modèle** (`kit/template/episode.json`) : les phrases d'exemple portent la recette ; les directions par défaut (aucune balise interdite, une par phrase, en tête) ; `voAlt` porte la direction du film là où B s'applique ; le repère `choc`. Les mots que lisent les `src/` du modèle sont gardés (« Une », « trop », « cœur », « danger », « l'inverse », « commentaire », « savais », « prochain ») : un épisode neuf passe `check` tel quel (vérifié sur le 026 avant d'y écrire son script : 0 erreur, un avertissement de contraste à 36 s). Un premier essai les avait perdus (« Repère "scene:trop" introuvable ») : c'est ce qui fait échouer `check` sur un script neuf tant que ses `src/` sont ceux du modèle.
- **Les contrôles d'écriture** : `scripts/lib/ecriture.mjs`, appelé par `npm run script` après les repères (`scripts/sd.mjs`, sept lignes, dans un `try`) ; courts seulement (`001`-`999`), des avertissements, rien de bloqué, rien d'écrit. Essayé en lecture (sans `npm run` sur les épisodes des autres) : 015, 11 avertissements (278 mots, l'ancien ordre de la fin, `[low, grave voice]`, trois balises dans le commentaire, « tu le tentes ? »…) ; 009 et 010 relèvent aussi « 5 s » et « 5 ms » dans les sous-titres ; 021, 5 (scène de 33 mots ouverte sur un méta) ; 023, 7 (scène de 42 mots ouverte sur une date) ; 025, 3 ; 026, aucun.

## 3. Le 025

**Ne rien toucher à sa voix** (dit à l'orchestrateur, et c'est la remarque de Merwan : « la version là est déjà très bien »). Sa scène fait déjà l'essentiel (même instant, une image par phrase, un dilemme pour le spectateur) ; ce que la recette y ajouterait est petit et tiré d'une seule comparaison, et une reprise ajouterait deux raccords de timbre et un retimage pendant que les agents 2 et 3 y travaillent. Pour mémoire, ce que la recette en aurait fait (mots vérifiés à blanc, repères gardés) : « Ton volant dit : à gauche. Ta voiture, elle, pivote trop : elle part en toupie… vers le *fossé*. Contre-braquer ? Trop tard. Ou trop *fort*. » (reprise scène + « on l'ouvre » + éclaté : 325 crédits annoncés ; prise entière en palette B : 948).

**Sa légende TikTok** (à écrire dans son `episode.json` par l'orchestrateur, quand les agents 2 et 3 l'auront rendu ; puis `node scripts/posts.mjs`) :

- caption : « ESP, le contrôle de trajectoire : quand l'arrière décroche, ta voiture freine une seule roue pour te remettre dans l'axe. Et ce réflexe, elle le doit à un élan. La tienne : d'avant ou d'après 2014 ? » — le mot cherché et son synonyme courant en tête ; la question fermée, deux camps, vérifiable chez soi.
- pinned : « Réponds juste : « avant » ou « après » 2014. L'ESP est obligatoire sur toute voiture neuve en Europe depuis novembre 2014. » (≈ 120 caractères)
- hashtags inchangés (#apprendresurtiktok #commentcamarche #esp #voiture #securiteroutiere).

## 4. Le 026 — Soyouz MS-10

`episodes/026-soyouz-ms10/episode.json` (créé par `npm run new`, `src/` du modèle : à reprendre au lancement de la 3D). Faits : `docs/faits/026-soyouz-ms10.md` — rien n'est dit qu'il ne source pas, rien de ses « À ne pas dire ». Contre-vérification : pas lancée (à faire après moi).

**L'accroche (31 mots, mot-choc « lâche » à la 3ᵉ parole ≈ 0,8 s, retournement « vient de partir » ≈ 4 s)** :
> Ta fusée *lâche*, en pleine montée. Et ta tour de sauvetage… vient de *partir*. / Il te reste quatre petits +moteurs+. Et ce qui la fait lâcher… était là *avant le décollage*.

- A : ta fusée lâche (≈ 50 km, ≈ 2 min) et le système que tout le monde connaît, la tour, a été larguée quelques secondes plus tôt. B : il reste quatre petits moteurs (sans dire qu'ils suffisent : la promesse ne rassure pas). C : la cause était là avant le décollage — payée au commentaire (« une pièce faussée, au montage »).
- **La scène (29 mots, une seule pause)** : « À cinquante kilomètres du sol, un propulseur se détache mal. Il frappe ta fusée. Ça secoue, de gauche à droite. Au-dessus de toi, plus de tour… juste la coiffe. » — le même instant, un enjeu de plus par phrase, finit sur l'objet qu'on ouvre.
- Autopsie en chemin (le haut de la coiffe, les moteurs → ton vaisseau, ton équipier, toi → les capteurs sur la fusée), puis la fenêtre (≈ 40 s, de la tour qui part à la coiffe qui tombe : « et ta fusée lâche… pile dans cette fenêtre »). Seuil : « Abonne-toi : ces quatre petits moteurs… regarde-les tirer. » Acte 3 haché (« Personne n'appuie sur rien. Au pupitre, un mot s'allume : avarie. » → trois secondes → 93 km → près de sept fois ton poids), relâchement (« Un parachute. Une dernière poussée… et tu touches le sol. Vivant. »).
- **Chute** : « Voilà son secret : quand ta tour s'en va, ton sauvetage ne part pas avec elle. Il reste… sur la coiffe. » (les moteurs sont sur la coiffe, pas dedans : « outside the shroud », Spaceflight Now).
- **Ce qui est dû + commentaire** : « Et ce qui l'a fait lâcher ? Une pièce faussée, au montage. Cinq mois plus tard, ton équipier et toi… vous repartez. Ensemble. En commentaire : toi, tu remontes… ou plus jamais ? »
- Like : « Like : envoie ce dossier plus haut que ta fusée. » Prochain dossier, puis la boucle : « Prochain dossier : un poids lourd sans freins, en pleine descente. Et au bord de la route… une sortie. » → « Pour quand tout lâche. Comme… » → « Ta fusée lâche, en pleine montée. »
- **Minutage** : 262 mots, 121,7 s estimées ; l'estimateur compte ≈ 25 % de trop (le 025 : 259 mots, 91,5 s dits) → ≈ 93 s. `npm run script -- 026` : 57 repères, chacun vérifié sur sa table (tous dans leur phrase, sur leur mot) ; « Écriture : rien à signaler ».
- **Devis voix** (`npm run voice -- 026 --takes 1`, sans budget, le 21/10) : **1 prise complète ≈ 960 crédits annoncés**, `--budget 1000` ; le turbo est facturé ≈ 0,44 de l'annonce → ≈ 420. Sans `--takes 1`, la commande en prévoit trois (`DEFAULT_TAKES = 3` dans `voice.mjs` : à passer à 1, ce n'est pas mon fichier).
- **Si Merwan dit non à B** : échanger `vo` et `voAlt` sur `eclate`, `repos`, `sol`, `comment`, `like` — rien d'autre ne change, ni les mots ni le devis.
- **Légende et textes** : `post` dans son `episode.json` (mot cherché « Soyouz » en tête, `post.keyword`), l'entrée du 026 dans `scripts/posts.mjs` (Instagram, YouTube : titre de 87 caractères). Je n'ai pas lancé `node scripts/posts.mjs` (consigne).
- **À faire regarder par la contre-vérification** : « ces moteurs n'ont qu'une fenêtre » (sourcé comme mode de sauvetage, T+115 → T+157 s, Wikipedia : vérifier qu'ils ne servent pas aussi en vol normal) ; « trois secondes » (ordre de grandeur, les sources divergent d'une à deux) ; « avarie » pour « avaria » ; « Ça secoue, de gauche à droite » (Hague, CBS) ; « il te reste quatre petits moteurs » au moment même de l'avarie.
- **`check` échoue sur le 026 tant que ses `src/` sont ceux du modèle** (ils cherchent les mots du modèle) : attendu, c'est la 3D qui les remplace.

## 5. Ce que Merwan tranche (oui / non)

1. **L'accroche du 026** (ci-dessus) — oui / non.
2. **La voix du 026** : une prise, une requête, `eleven_v4_turbo`, ≈ 960 crédits annoncés (≈ 420 facturés), après la contre-vérification — oui / non.
3. **Le 027 annoncé par le 026 : la voie de détresse des poids lourds** (« un poids lourd sans freins, en pleine descente… une sortie ») — oui / non. Un non ne change que deux phrases (prochain dossier, boucle) : gratuit avant la voix.
4. **B (les balises de conversation) pour l'autopsie et les appels à l'action**, à l'écoute du banc — oui / non.

## 6. À ajouter à CLAUDE.md (l'orchestrateur l'intègre)

Dans « Du thème à la vidéo », après « Le script (`episode.json`) » :

> **La recette du script (depuis le 21/10)** : `docs/recette-script.md`, à lire avant d'écrire un script ; `npm run script` en vérifie l'écriture (`scripts/lib/ecriture.mjs` : des avertissements, rien de bloqué). Ce qu'elle tire des chiffres (des pistes) : **le mot-choc avant 3 s** (les trois films qui ont percé sur TikTok le disent à 2,3-3,2 s, tous les autres à 3,6 s ou plus ; il se déclare dans le repère `choc`) ; **la scène (10 → 25 s) est la cible n° 1** — c'est elle qui sépare le 015 du 012 sur les courbes (−17 contre −23 points) : même instant que l'accroche, une image et un enjeu par phrase, l'enjeu visible, une tâche pour le spectateur, 30 mots au plus, une seule pause, dite vite ; **la promesse ne rassure pas** ; **la question du commentaire est fermée, à deux camps** (« tu lis 30 mA… ou rien ? » 3,5 ‰ ; « tu le tentes ? » 0,03 ‰) ; la légende ouvre sur le mot cherché (`post.keyword`). Voix : le film d'une requête, une balise par phrase en tête de ligne. Banc du 21/10 sur le 025 (228 crédits) : les balises de conversation du long relèvent l'autopsie (+1,4 dt) ; `[serious]` aplatit la menace (−2,3 dt contre `[tense]`, mêmes mots) et « on l'ouvre » traîne en requête courte (1,39-1,47 s) — la conversation pour l'autopsie et les appels à l'action seulement, si Merwan la retient (le modèle la porte en `vo`, la direction du film en `voAlt`). L'heure de mise en ligne compte autant que le script : les trois films qui ont percé ont été postés entre 19 h et 23 h.

Dans le tableau des balises : `[serious]` — « sur une scène, 2,3 dt sous `[tense]` (banc du 025) : pas une balise de menace ». Et dans « La courbe de tension » : le banc du 025 ne reproduit pas les « + 2 dt » d'une requête courte trouvés sur le 017.

Dans « Dossiers » :

> **026 — Soyouz MS-10** : script écrit le 21/10 selon `docs/recette-script.md` (262 mots, accroche 31, ≈ 93 s attendues ; faits `docs/faits/026-soyouz-ms10.md`). Ce n'est pas la tour qui sauve (larguée ≈ 3 s avant l'avarie) mais quatre moteurs à poudre en haut de la coiffe, pendant une fenêtre d'une quarantaine de secondes ; chute « quand ta tour s'en va, ton sauvetage ne part pas avec elle » ; commentaire « tu remontes… ou plus jamais ? » ; annonce le 027 (la voie de détresse, à valider). Devis : 960 crédits annoncés, une prise turbo. Reste : contre-vérification, oui de Merwan (accroche, voix, 027), `node scripts/posts.mjs`, puis la 3D (`src/` repris du modèle).

## Fichiers

Écrits : `docs/recette-script.md`, `docs/scale/1-script-voix.md`, `scripts/lib/ecriture.mjs` (nouveau), `episodes/025-esp/essais-conversation.json` (le banc), `episodes/026-soyouz-ms10/` (créé, script). Modifiés : `kit/template/episode.json` (beats, directions, `post`, repère `choc`), `scripts/sd.mjs` (`npm run script` appelle les contrôles), `scripts/posts.mjs` (entrée du 026). Non touchés : le `episode.json` du 025, `voice.mjs`, `essai.mjs`, `credits.mjs`, CLAUDE.md, `front/`, `metrics/`, `renders/`.

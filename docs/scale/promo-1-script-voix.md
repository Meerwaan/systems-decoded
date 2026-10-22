# Promos des longs — 1. Script et voix

Rapport du 2026-10-21 (agent 1 sur 3 : script et voix des hors-séries). Demande de Merwan : « lance des agents sur les vidéos de promo des formats longs », puis, sur HS01 et HS02 : « ils font des stats de merde sauf insta ». Ce qui suit : le diagnostic (d'abord la question centrale : pourquoi Instagram oui, TikTok et Shorts non), la recette réécrite (`docs/recette-promo.md`), le brief de l'agent promo (`.claude/agents/promo.md`), les contrôles d'écriture des hors-séries (`scripts/lib/ecriture.mjs`), les textes à coller sur HS01 et HS02, le plan de la promo du L03. **Aucun crédit, aucune commande `npm run` sur HS01 ni HS02** : leurs scripts, voix et minutages lus en texte (`episode.json`, `audio/vo.json`, `gen/episode.data.js`), les contrôles lancés en lecture par un petit script hors dépôt.

## En bref

- **Aucun chiffre des promos n'est encore dans `metrics/`** : ce diagnostic vient des scripts, des voix mesurées et des dates de publication. Il dit ce qui est probable et comment le vérifier ; les captures de Merwan trancheront.
- **Instagram n'est pas la preuve que la forme marche.** Il porte tout le compte (4,0 M de vues la semaine où TikTok en faisait 235 k et YouTube 33 k) et il montre la promo d'abord à des dizaines de milliers d'abonnés qui connaissent le compte. TikTok (un compte qu'il réapprend) et Shorts (au stade du test) la montrent à des inconnus, qui la jugent seule.
- **Devant un inconnu, nos deux promos sont des bandes-annonces** : à 11 s elles disent que le film est ailleurs (« Jusqu'ici, on ouvrait des systèmes… », « Notre nouveau grand format… »), puis six teasers sur six objets, aucun fil payé, « Alors… on l'ouvre. » → « Pas ici. » au moment où l'on attend l'ouverture, et aucune question pour les commentaires. Un fil ouvert ne retient que si l'on croit qu'il sera payé dans la vidéo qu'on regarde : annoncer à 11 s que la réponse est sur YouTube libère le spectateur.
- **« Citer YouTube coûte de la diffusion sur TikTok »** : aucune source officielle (la page des règles du fil « Pour toi » n'en dit rien ; la seule règle écrite sur le hors-plateforme vise les lives qui poussent à acheter ailleurs). On ne bâtit rien dessus ; « YouTube » se dit une fois, à la fin.
- **Les dates cochées au bureau mettent les promos avant leur long** (HS01 sur TikTok le 16/10, le L01 le 19/10 ; HS02 sur Shorts à 18 h 10, le L02 à 22 h 05). Si c'est l'ordre réel, la « vidéo associée » du Short n'a pas pu être posée et le lien en bio menait ailleurs pendant les premières heures.
- **Ce que je propose, et que la recette applique désormais** : la promo devient **un court qui tient seul**. Elle garde la grande réponse du long (sa C, sa chute, l'issue du test) mais **paie un morceau** : « Alors… on l'ouvre. » ouvre pour de vrai une étape du long. La frustration est concentrée à la fin, sur la C qui revient en question de commentaire à deux camps, dont la réponse est dans le long ; puis un rendez-vous d'une phrase et la boucle. Une version pour les quatre plateformes ; une règle d'arrêt pour TikTok si la forme n'y prend toujours pas.
- **La voix** : `[calm]` sur « on l'ouvre » (dirigé `[nonchalant, confident]` et `[casual, charismatic]`, il dure 1,68 et 1,76 s ; « traîne » relevé sur le HS02 et publié tel quel) ; plus jamais `[serious]`, qui envoie Eric 1 à 4 demi-tons sous le film, jusque sur le teaser du test.
- **Fait** : la recette, le brief de l'agent, les contrôles d'écriture des hors-séries (une branche à part : la sortie des courts et des longs est identique, vérifié sur 015, 025, 026, L01, L02), les textes à coller (§ 3), le plan du HS03 (§ 4).

## 1. Diagnostic

### 1.1 Pourquoi Instagram oui, et TikTok et Shorts non

**Ce qui tient à la plateforme** (à vérifier en premier sur les captures : la promo contre la médiane des courts de la même semaine, plateforme par plateforme).

- **Les mêmes films, quatre mondes** (CLAUDE.md, exports du 15/10) : Instagram 4,0 M de vues dans la semaine, TikTok 235 k, YouTube 33 k ; le film le plus faible d'Instagram y fait presque le deuxième meilleur score de TikTok ; quatorze Shorts sur dix-huit finissent entre 1 100 et 2 800 vues. Une promo qui fait « comme un court ordinaire » paraît donc mauvaise sur TikTok et Shorts et bonne sur Instagram, sans que la forme y soit pour rien.
- **Qui la voit** : Instagram la pousse d'abord vers une base d'abonnés gagnée en masse (+31 200 dans la semaine du 15/10), des gens qui connaissent « Alors… on l'ouvre » et pour qui « notre nouveau grand format » est une nouvelle et « Pas ici » un clin d'œil. Sur TikTok, le compte est au stade où la plateforme le réapprend ; sur Shorts, au stade du test. Là, la promo passe devant des inconnus.
- **Le pont** : Instagram a le lien en bio et l'autocollant de lien en story ; TikTok n'a que le lien en bio (il faut 1 000 abonnés pour un compte personnel, d'après les guides qui citent TikTok : le compte les a — mais rien ne dit qu'il est posé, ni sur quoi) ; un Short n'a que la « vidéo associée » (les liens des descriptions et des commentaires de Shorts ne sont plus cliquables depuis le 31/08/2023). Et les bios ne disent nulle part qu'un film complet attend derrière le lien : Instagram dit « Un dossier en 3D, 80 secondes », la chaîne YouTube « en moins de 90 secondes » (`brand/profil.json`).

**Ce qui tient à la forme** (ce qu'une promo fait à quelqu'un qui ne connaît pas le compte). TikTok écrit (2020) qu'une vidéo regardée jusqu'au bout est un indicateur fort d'intérêt ; Shorts mesure qui balaie (39 % dès la première seconde sur nos courts). Une promo qui renvoie ailleurs perd sur les deux tableaux si elle le dit tôt :

| ≈ s | HS01 (64,7 s) | HS02 (60,8 s) | Ce qu'un inconnu en tire |
| --- | --- | --- | --- |
| 0 → 10 | l'accroche du long : « Ta tête part dans le pare-brise… » ; « tête » à 0,4 s, « pare-brise » à 1,2 s, « casse » à 2,2 s | « Quatre cent mille volts. La ligne est coupée… et elle peut te tuer. » ; « tuer » à 3,6 s, derrière un « … » | une vraie accroche dans les deux (celle du HS02 ouvre sur un chiffre et frappe tard) |
| 11 → 18 | « Jusqu'ici, on ouvrait des systèmes en moins de deux minutes. Cette fois… Près de neuf minutes. » (6,6 s) | « Notre nouveau grand format t'emmène là où tu n'entres jamais… » (4,6 s) | **c'est une publicité, le film est ailleurs** — dans la zone qui coûte le plus sur nos courts (10 → 25 s) |
| 18 → 48 | six teasers : le four, le bain, la bande noire, le flacon de 1903, le tampon, la vitre qui éclate | six teasers : le champ, l'arc, le gravier, la réparation sous tension, le détecteur, le test | un sujet neuf toutes les quatre secondes, aucun enjeu qui monte ; pas une scène, une liste |
| ≈ 50 | « Alors… on l'ouvre. » → noir → « Pas ici. » | idem | pour un abonné, un clin d'œil ; pour un inconnu, la confirmation que rien ne sera payé |
| fin | « Il t'attend sur notre chaîne YouTube : le lien est en bio. » | idem | le seul appel demande de quitter l'application ; aucune question pour les commentaires, des légendes TikTok qui finissent sur « lien en bio. » |

**« YouTube » sur TikTok** : vérifié, sans résultat. La page des règles d'éligibilité au fil « Pour toi » ne dit rien du hors-plateforme ; la seule règle écrite trouvée concerne les lives qui poussent à acheter ailleurs (mise à jour des règles de septembre 2025). Le reste n'est que rumeur de créateurs. On ne l'affirme pas, on ne bâtit rien dessus : « YouTube » est dit une fois, à la fin.

**Ce que les chiffres disent de « limite les frustrer »** : pas de chiffres des promos. Ceux du compte disent que la tension tient tant que la réponse est attendue **dans la vidéo** : la courbe du 003 casse juste après sa chute (« le film a payé, on part ») ; sur nos courts, qui passe le seuil reste jusqu'au bout. Une promo qui annonce à 11 s que la réponse est sur YouTube retire cette attente à tous ceux qui ne cliqueront pas — c'est-à-dire presque tout le monde sur un fil « Pour toi ». La frustration fait cliquer à la fin ; elle fait balayer au début.

**Ce que j'essaierais à la place, et que la recette applique** : garder la règle de Merwan là où elle marche. La grande réponse du long (sa C, sa chute, l'issue de son test) reste sur YouTube ; la promo paie **un** morceau du long, ouvert par « Alors… on l'ouvre. », pour tenir seule ; la C revient à la fin en question de commentaire à deux camps (« Sur le tampon de ta vitre conducteur : un I… ou un II ? »), sans réponse, puis le rendez-vous. Une seule version pour les quatre plateformes (la différence entre elles est dans le public et le pont, pas dans le film ; deux films doubleraient le coût et brouilleraient la mesure). Et une règle d'arrêt : si le HS03 fait moins de la moitié de la médiane des courts de sa semaine sur TikTok à 48 h, les promos ne partent plus sur TikTok (le lien du long reste dans la bio, les courts y portent le compte).

### 1.2 Les fils : les forts, les faibles

| | Forts | Faibles |
| --- | --- | --- |
| HS01 | « on le fait flotter. Pas sur de l'eau. » (un mystère précis, une réponse d'un mot : le meilleur candidat au morceau payé) ; le tampon (une lecture à faire chez soi : la meilleure question de commentaire) ; « une vitre éclate… toute seule » (la peur) ; la tête de dix kilos (le test) | le four (une image, pas une question) ; le flacon de 1903 (une date qui saute, et son paiement est le principe même du long : impossible à payer sans tout dire) ; le lancement (pas un fil, un méta) |
| HS02 | le détecteur qui ne réagit pas (le piège du long, à ne jamais payer) ; le test coupé sur « un court-circuit » ; « le dernier, dans le mauvais ordre… tue » ; « on attend un instant très précis » (l'arc) | « tu baignes déjà dedans » (dans quoi ? le brief le disait déjà) ; « on les répare sans couper » (l'image ne peut pas montrer ce qui porte la nacelle) ; le lancement |

**L'accroche** : dans les deux, c'est celle du long, ce qui est juste (celui qui a vu la miniature reconnaît la promesse). Elle devient « celle d'une bande-annonce » à la phrase suivante, avec le lancement.

**« Alors… on l'ouvre. »** est là dans les deux, sous sa variante « Pas ici ». Son ton : HS01 dit « Alors » en 0,48 s, se tait 0,80 s, puis « on l'ouvre » en 0,48 s (des mots nets, une pause longue : le plus proche du « nonchalant » demandé) ; HS02 étire « Alors » sur 0,80 s et « l'ouvre » sur 0,68 s — le profil des 018-020 que les spectateurs ont remarqué.

### 1.3 La voix (mesurée dans `audio/vo.json`)

- **« On l'ouvre »** : 1,76 s (HS01, reprise `[casual, charismatic]`, « plate ») et 1,68 s (HS02, `[nonchalant, confident]`, « « on l'ouvre » traîne » relevé par `npm run voice`, publié tel quel). Les courts d'une seule requête en `[calm]` : 1,06 à 1,36 s. Le ton « nonchalant, sûr de lui » que veut Merwan est celui des 005 à 015, enregistrés en `[calm]` juste après une scène tendue ; une balise qui décrit ce ton ne le produit pas.
- **`[serious]`** : HS01 promesse −3,8 dt, « une vitre éclate » −3,2, « une tête de dix kilos » −3,4 ; HS02 promesse −2,7, le test −1,1. Le teaser du test est dit plus bas que le reste, là où la promo devrait monter (le banc du 025 l'avait vu sur une scène : `[serious]` n'est pas `[tense]`).
- **L'accroche `[tense]`** sort grave et un peu plus bas en niveau (−2,3 et −3,5 dt, −2,2 et −2,9 dB), comme celle du 006 ; Merwan a jugé « parfaite » l'accroche `[tense]` du L01 : gardée, sans « … » avant le mot-choc.
- **La C** : « Le bon, tu le connais ? » retombe (HS02, « question qui tombe ») ; « ta vitre de côté… ne l'a peut-être pas » perd sa pause (HS01). Une question à deux camps (« … ou … ? ») se dit en deux montées courtes : à mesurer sur le HS03.
- **La courbe de tension** dit « relief incomplet » sur les deux : elle est calculée sur les actes d'un court ; sur une promo, elle ne veut rien dire.
- Le turbo d'une seule requête, `stability` 0,4 : rien à redire, à garder.

### 1.4 Quand les chiffres arriveront : quoi lire

1. **Plateforme ou forme** : sur chaque plateforme, vues de la promo à 48 h ÷ médiane des courts publiés la même semaine. Autour de 1 : c'est la plateforme. Nettement sous 1 : c'est la forme.
2. **La courbe** : la tenue à 3 s ; l'encoche à 11 s (le lancement) ; l'encoche sur « Pas ici » (52,6 s pour HS01, 49,9 s pour HS02) ; la part qui finit.
3. **Le pont** : YouTube Studio, L01 et L02, Sources de trafic sur 7 jours : la part « Shorts » et « Sources externes » ; Instagram, clics sur le lien en bio et sur l'autocollant ; TikTok, vues du profil.
4. **L'ordre de sortie réel** : à quelle heure le L01 et le L02 étaient-ils publics, et la « vidéo associée » des deux Shorts pointe-t-elle sur eux ?

## 2. La recette

- **`docs/recette-promo.md`, réécrite** : ce que les deux premières ont appris ; la règle de Merwan tenue autrement (la grande réponse gardée, un morceau payé, la frustration à la fin) ; **la forme depuis le HS03** — A·B·C (la C jamais payée), la scène, « Alors… on l'ouvre. » qui ouvre pour de vrai, le morceau payé (45 à 60 mots), le test coupé, le commentaire (la C en question à deux camps), le rendez-vous d'une phrase, la boucle ; 190 à 215 mots, 62 à 70 s ; le gag « Pas ici » rangé ; une version pour toutes les plateformes ; l'écriture phrase par phrase (beat payeur dans `sources`, fils déclarés `fil` / `paie`, le mot cherché, rien de ce que le long répond) ; **la voix** (tableau des balises, `[calm]` pour « on l'ouvre », `[serious]` interdite) ; **le pont plateforme par plateforme** et l'ordre de sortie (le long et les liens d'abord, la promo dans l'heure, 19 h-22 h, puis l'essai des liens depuis un téléphone) ; les textes (jamais le titre exact du long, il change en test A/B) ; ce que vérifie `npm run script` ; la mesure (plateforme ou forme) et la règle d'arrêt sur TikTok. En tête, les liens vers `docs/recette-promo-image.md` et `docs/recette-promo-retention.md` (écrits par les agents 2 et 3 ; ils n'existaient pas encore quand j'ai fini).
- **`.claude/agents/promo.md`** : à lire en plus (les deux recettes des agents 2 et 3, `docs/recette-script.md`, ce rapport) ; la règle et la forme nouvelles ; les ids attendus par les contrôles (`scene`, `ouvre`, `comment`, `youtube`, `boucle`) ; « zéro avertissement de `npm run script` avant de rendre la main, ou chacun justifié » ; la direction de la voix ; les textes et `post.lien` ; l'ordre de sortie. L'identité hors-série et la chaîne d'image sont inchangées, renvoyées à la recette de l'agent 2 pour l'image.
- **`scripts/lib/ecriture.mjs`** : une branche `HSnn` (`ecritureHorsSerie`), des avertissements seulement. Le budget (190 à 215 mots, compté comme l'affiche `npm run script` ; 60 à 72 s avec la voix) ; l'accroche (huit mots, la 2ᵉ personne, le repère `choc` avant 3 s, aucun « … » avant lui, A·B·C avant 10 s) ; **aucune annonce du long avant « on l'ouvre »** ; la scène (22 à 30 mots, une pause) ; « Alors… on l'ouvre. » une fois, mot pour mot, `[calm]`, 1,5 s au plus avec la voix, pas de « Pas ici » derrière ; les fils (la C jamais payée, au moins un morceau payé après l'ouverture) ; la question à deux camps et « commentaire » ; un seul rendez-vous, après l'ouverture et après le commentaire, qui dit où est le lien, « YouTube » une fois ; la boucle ; les balises ; une ligne de `sources` par phrase ; les légendes (mot cherché en tête, question à la fin, cinq hashtags), l'épinglé (150 caractères, pas le titre exact du long), le titre du Short (100 caractères, aucun méta), `post.lien`.
- **La preuve** (en lecture, sans `npm run`, rien d'écrit) : la sortie des contrôles est **identique avant et après** sur 015 (11 avertissements), 025 (3), 026 (0), L01 (20), L02 (15) ; HS01 en reçoit 18 et HS02 19 — exactement ce que ce diagnostic leur reproche ; un script d'essai écrit selon la recette (dans le dossier temporaire, 191 mots, ≈ 62 s) n'en reçoit **aucun** ; et six altérations de ce script déclenchent chacune l'avertissement attendu (la C payée, `[serious]` sur le test, une annonce dans la scène, « Pas ici » derrière l'ouverture, un « … » avant le mot-choc, le titre exact du long dans l'épinglé).

## 3. HS01 et HS02 : ce qui peut encore changer sans les republier

Rien n'a été écrit dans leurs `episode.json` ni dans `scripts/posts.mjs`. Tout se colle à la main par Merwan. Une légende TikTok ne se change que si l'application propose de modifier la publication ; sinon, seul l'épinglé change (un nouveau commentaire, épinglé). Les questions renvoient à des réponses que le long donne (L01 : `tampon`, « Un chiffre romain : I, trempé. II, feuilleté. » ; L02 : `malt2`, « On les accroche d'abord côté terre »), jamais données ici.

### HS01 — le pare-brise

**À vérifier d'abord** : YouTube Studio → Contenu → Shorts → HS01 → **Vidéo associée = le L01** ; le lien en bio TikTok et Instagram ouvre le L01.

- **TikTok — épinglé** (137 caractères) : Le film complet (8 min 51) : lien en bio, ou cherche « Système Décodé pare-brise » sur YouTube. Sur ton tampon de vitre : un I ou un II ?
- **TikTok — légende** (si modifiable) : Pare-brise : il doit casser pour réussir son test. On l'a suivi du sable en fusion jusqu'à la tête de dix kilos qu'on lâche dessus. Le film complet (8 min 51) est sur notre chaîne YouTube, lien en bio. Sur le tampon de ta vitre conducteur : un I… ou un II ?
  Hashtags : #parebrise #commentcestfait #commentcamarche #voiture #apprendresurtiktok
- **Instagram — légende** :
  Pare-brise : il doit casser pour réussir son test. Pourquoi ? On l'a suivi du sable en fusion jusqu'au jour où on lâche dessus une tête de dix kilos.
  Le film complet, 8 min 51, t'attend sur notre chaîne YouTube : lien en bio (et en story).
  Sur le tampon de ta vitre conducteur, tu lis un I… ou un II ?
  Hashtags : inchangés (#parebrise #commentcestfait #voiture #securiteroutiere #lesaviezvous)
- **Instagram — épinglé** (108) : Le film complet est dans le lien en bio (YouTube, 8 min 51). Ce que veut dire ton I ou ton II, c'est dedans.
- **Instagram — story** : une nouvelle story avec l'autocollant de lien vers le L01, gardée « À la une ».
- **YouTube Shorts — titre** (48) : Ton pare-brise DOIT casser pour réussir son test *(au lieu de « …notre premier grand film t'explique pourquoi » : un méta)*
- **YouTube Shorts — description** : Comment on fabrique ton pare-brise : du sable en fusion jusqu'au test où on lâche une tête de dix kilos dessus. Le film complet (8 min 51) : touche le lien du film, en bas de ce Short.
  Sur le tampon de ta vitre conducteur : un I… ou un II ?
  Hashtags : inchangés.
- **YouTube Shorts — épinglé** (107) : Le film complet (8 min 51) est lié en bas de ce Short. Et sur ta vitre conducteur, le tampon dit I… ou II ?
- **Facebook** (s'il y est) : en premier commentaire, « Le film complet (8 min 51), sur notre chaîne YouTube : » suivi du lien du L01.

### HS02 — le poste haute tension

**À vérifier d'abord** : la **Vidéo associée du Short HS02 = le L02** (le Short a été coché en ligne à 18 h 10, le L02 à 22 h 05 : elle n'a peut-être jamais été posée) ; le lien en bio TikTok et Instagram ouvre le L02, pas le L01.

- **TikTok — épinglé** (146) : Le film complet (9 min 10) : lien en bio, ou cherche « Système Décodé consignation » sur YouTube. Les pinces : côté terre d'abord… ou côté ligne ?
- **TikTok — légende** (si modifiable) : Consignation haute tension : la ligne de 400 000 volts est coupée, ton détecteur ne réagit pas… et elle peut encore te tuer. Les cinq gestes qui te ramènent chez toi sont dans le film complet (9 min 10), sur notre chaîne YouTube : lien en bio. Les pinces de terre, tu les poses côté terre d'abord… ou côté ligne ?
  Hashtags : #consignation #hautetension #electricien #electricite #apprendresurtiktok
- **Instagram — légende** :
  Consignation haute tension : la ligne de 400 000 volts est coupée. Ton détecteur ne réagit pas. Tout a l'air mort… et elle peut encore te tuer.
  Les cinq gestes qui te ramènent chez toi sont dans notre film complet, 9 min 10, sur notre chaîne YouTube : lien en bio (et en story).
  Les pinces de terre : tu les poses côté terre d'abord… ou côté ligne ?
  Hashtags : #consignation #hautetension #electricien #electricite #lesaviezvous
- **Instagram — épinglé** (124) : Film complet : lien en bio (YouTube, 9 min 10). Habilités, à vous : les pinces de terre, côté terre d'abord… ou côté ligne ?
- **Instagram — story** : l'autocollant de lien vers le L02, gardée « À la une ».
- **YouTube Shorts — titre** (82) : Ligne haute tension coupée… et pourtant mortelle : les 5 gestes de la consignation *(les deux mots qu'on tape, « haute tension » et « consignation », y entrent)*
- **YouTube Shorts — description** : Consignation haute tension : une ligne de 400 000 volts coupée peut encore te tuer. Le film complet (9 min 10) t'emmène dans un poste électrique, geste par geste : touche le lien du film, en bas de ce Short.
  Les pinces de terre : côté terre d'abord… ou côté ligne ?
  Hashtags : inchangés.
- **YouTube Shorts — épinglé** (120) : Le film complet (9 min 10) est lié en bas de ce Short. Et toi : les pinces de terre, côté terre d'abord… ou côté ligne ?
- **Facebook** : en premier commentaire, « Le film complet (9 min 10), sur notre chaîne YouTube : » suivi du lien du L02.

## 4. La promo du L03 — le plan, à écrire quand Merwan aura validé son sujet

1. Préalable : le sujet du L03 validé (le pneu est proposé), le L03 rendu et en ligne ; son `episode.json` (beats, `post.youtube.keyword`, titres en test) est la seule source de faits ; un brief `docs/HS03-brief.md` avec sa liste « ce qui ne se dit pas ».
2. A·B·C : l'accroche du L03, celle de son titre et de sa miniature ; mot-choc avant 3 s ; la C du L03 n'est jamais payée.
3. La scène (22-30 mots) reste dans l'instant de l'accroche (si c'est le pneu : le freinage sur route mouillée qu'elle promet) et finit sur l'objet qu'on ouvre ; aucune annonce du long.
4. « Alors… on l'ouvre. » `[calm]`, dans la même requête que la scène ; l'éclaté du L03 s'ouvre sur le mot.
5. Le morceau payé (45-60 mots) : l'étape la plus visuelle du L03 qui n'est ni sa C ni sa chute, choisie dans le brief.
6. Le test du L03, coupé au noir avant l'impact.
7. Le commentaire : la C, fermée, à deux camps, à vérifier chez soi — seulement une lecture que le L03 explique.
8. Le rendez-vous (une phrase, « YouTube » une fois, « le lien est en bio »), puis la boucle sur les premiers mots de l'accroche ; 190-215 mots, 62-70 s ; `npm run script -- HS03` sans avertissement.
9. La voix : une requête turbo, le tableau de la recette ; devis lu le jour même, accord de Merwan avant tout crédit.
10. La sortie : le L03 public et les liens posés d'abord, la promo dans l'heure entre 19 h et 22 h, sur les quatre ; à 48 h, vues ÷ médiane des courts de la semaine sur chaque plateforme — sous 0,5 sur TikTok, plus de promo sur TikTok.

## 5. Ce que Merwan tranche (oui / non)

1. **La promo devient un court qui tient seul** — elle paie un morceau du long, garde la grande réponse (sa C, sa chute, l'issue du test) pour YouTube, frustre à la fin et plus dès la 11ᵉ seconde, et range le gag « Pas ici » (« Alors… on l'ouvre. » ouvre pour de vrai). À partir du HS03. — oui / non
2. **Coller les textes du § 3 sur HS01 et HS02** (épinglés, légendes Instagram, titre et description des deux Shorts) et **vérifier leur « vidéo associée »** — oui / non
3. **Dire dans les bios TikTok et Instagram qu'un film complet attend derrière le lien**, et y mettre le dernier long (le texte des bios est dans `brand/profil.json`, pas mon fichier : § 7) — oui / non
4. **La règle d'arrêt** : si le HS03 fait moins de la moitié de la médiane des courts de sa semaine sur TikTok à 48 h, plus de promo sur TikTok — oui / non

Et ses captures, déjà demandées par l'orchestrateur : vues et courbes des HS01 et HS02 sur chaque plateforme, la part « Shorts » et « Sources externes » des vues du L01 et du L02 dans YouTube Studio, et l'heure réelle de mise en ligne du L01 et du L02.

## 6. À ajouter à CLAUDE.md (l'orchestrateur l'intègre)

À la fin de l'entrée « HS01 » de « Dossiers », ou juste après :

> **Les promos des longs, depuis le 21/10** (Merwan, sur HS01 et HS02 : « ils font des stats de merde sauf insta ») : `docs/recette-promo.md` réécrite, diagnostic dans `docs/scale/promo-1-script-voix.md`. Instagram porte tout le compte et montre la promo d'abord à ses abonnés ; TikTok et Shorts la montrent à des inconnus, qui la jugent seule. Les deux premières étaient des bandes-annonces : une annonce du long à 11 s (« Jusqu'ici… », « Notre nouveau grand format… »), six teasers sur six objets, aucun fil payé, « Pas ici » à l'ouverture, aucune question pour les commentaires. **Une promo est désormais un court qui tient seul** : l'accroche du long (sa C jamais payée), une scène, « Alors… on l'ouvre. » `[calm]` qui ouvre pour de vrai UN morceau du long, le test coupé avant l'impact, la C en question de commentaire à deux camps (réponse dans le long), un rendez-vous d'une phrase (« YouTube » une fois, à la fin), la boucle ; 190 à 215 mots, 62 à 70 s ; une version pour les quatre plateformes. Voix : `[calm]` sur « on l'ouvre » (`[nonchalant, confident]`, `[casual, charismatic]` : 1,68 et 1,76 s), jamais `[serious]` (−1 à −4 dt, jusque sur le test). Le pont : le long public et les liens posés AVANT la promo (les dates cochées au bureau disent l'inverse pour HS01 et HS02) ; Shorts → « vidéo associée », seul lien cliquable d'un Short ; jamais le titre exact du long dans un texte de promo (il change en test A/B) : « cherche « Système Décodé <mot> » ». Aucune source officielle ne dit que TikTok pénalise le mot « YouTube ». `npm run script -- HSnn` vérifie tout ça (`scripts/lib/ecriture.mjs`). On juge à 48 h : vues ÷ médiane des courts de la semaine, plateforme par plateforme ; sous 0,5 sur TikTok, plus de promo sur TikTok.

## 7. Pour des fichiers qui ne sont pas les miens

- **`brand/profil.json`** (`bios`) : Instagram dit « Un dossier en 3D, 80 secondes. », la chaîne YouTube « en moins de 90 secondes » — rien ne dit qu'un film complet attend derrière le lien. Proposé : Instagram, remplacer la troisième ligne par « Des dossiers en 3D. Les films complets : YouTube ↓ » ; YouTube, ajouter après le premier paragraphe « Et des films complets, d'une dizaine de minutes : comment on fabrique ce qui te protège, et les lieux où tu n'entres jamais. » La bio TikTok n'est pas dans le dépôt : même phrase, et le lien du dernier long.
- **`kit/template/episode.json`** (pas de modèle hors-série à part) : quand le HS03 se lance, l'agent promo écrit ses beats selon la recette ; si l'on veut qu'un `npm run new -- HSnn` parte d'un squelette qui passe les contrôles du hors-série, il faudra un `kit/template/episode.hors-serie.json` (ou la série dans `kit/series.json`) — à décider par celui qui tient le kit.
- **`front/`** : rien.

## Sources (web, 21/10)

- TikTok, « How TikTok recommends videos #ForYou » (18/06/2020) : le fait de finir une vidéo est un indicateur fort d'intérêt — newsroom.tiktok.com/en-us/how-tiktok-recommends-videos-for-you
- TikTok, règles d'éligibilité au fil « Pour toi » : rien sur le hors-plateforme — tiktok.com/community-guidelines/en/fyf-standards ; la règle sur les lives qui poussent à acheter ailleurs, résumée par TechCrunch (15/08/2025) — techcrunch.com/2025/08/15/tiktoks-new-guidelines-add-subtle-changes-for-live-creators-ai-content-and-more
- Liens non cliquables dans les descriptions et commentaires de Shorts depuis le 31/08/2023 : Malwarebytes et Search Engine Journal (08/2023), qui citent l'annonce de YouTube
- La « vidéo associée » d'un Short (YouTube Studio) : vidiq.com/blog/post/youtube-related-links-connect-shorts-long-videos
- Le lien en bio sur TikTok (1 000 abonnés pour un compte personnel) : guides de Shopify et d'Outfy, qui citent TikTok — à confirmer dans l'application

## Fichiers

- `docs/recette-promo.md` (réécrite)
- `.claude/agents/promo.md` (brief mis à jour)
- `scripts/lib/ecriture.mjs` (branche `ecritureHorsSerie` ; courts et longs inchangés)
- `docs/scale/promo-1-script-voix.md` (ce rapport)

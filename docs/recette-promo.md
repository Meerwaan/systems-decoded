# La recette d'une promo de long (hors-série, vertical)

Écrite le 2026-10-16 avant la première (HS01, pour le L01 — le pare-brise), **réécrite le 2026-10-21** après les deux premières (HS01, HS02 : « ils font des stats de merde sauf insta », Merwan). Ce que l'agent `promo` (`.claude/agents/promo.md`) applique, et pourquoi. Le diagnostic d'où sort cette version : `docs/scale/promo-1-script-voix.md`. **Révisée le 2026-10-27** après HS01 à HS04 (« ne percent pas du tout », Merwan, alors que 015, 009 et 010 font 100 000, 47 885 et 30 508 vues) : `docs/scale/promo-4-diagnostic.md`.

À lire avec :
- **l'image** d'une promo : `docs/recette-promo-image.md` ;
- **la rétention et l'effet « wow »** d'une promo : `docs/recette-promo-retention.md` ;
- **l'écriture des courts** (`docs/recette-script.md`) : elle vaut ici aussi, sauf là où ce fichier dit autrement ;
- le format long lui-même : CLAUDE.md, « Le format long (YouTube) », et `docs/recette-long.md`.

## Pourquoi une promo

Les longs vivent sur YouTube, où le compte n'a encore ni communauté ni historique : leur croissance viendra de la recherche et des suggestions, lentement. Le public, lui, est ailleurs — Instagram d'abord (4 M de vues la semaine du 7 au 13 octobre), puis Facebook, TikTok. Un court qui renvoie vers le long est le seul pont direct entre les deux. **Et c'est un court du compte : il doit tenir seul, comme n'importe quel dossier** — c'est ce que les deux premières n'ont pas fait.

## Ce que le diagnostic du 27/10 a changé

Aucun chiffre de promo n'est encore dans le dépôt (`metrics/audience.json` s'arrête au 019) : tout ce qui suit est une **hypothèse** tirée des scripts, des minutages de voix et des dates de publication, comparés à ceux des trois courts qui ont percé (015, 009, 010). On l'applique au HS05 parce qu'elle coûte peu et ne touche à aucune règle de Merwan ; les chiffres de HS01 à HS04 (liste : `docs/memoire/audience.md`, « À relever pour HS01-HS04 ») la confirmeront ou la déferont.

1. **Les hits jouent l'événement en entier ; les promos coupaient au noir juste avant** (hypothèse forte). 015, 009 et 010 ont une scène d'enjeu, puis un beat où le système agit du début à la fin (015 : 35,9 → 51,0 s) — c'est un fait lu dans leurs scripts. HS03 finit sur « un moteur *tourne* encore… », HS04 sur « La pression monte… *monte*… », puis passent au commentaire. **Désormais : le test du long se joue en entier dans la promo, 6 à 8 s, la pièce agit du début à la fin et l'image montre ce qui arrive.** Ce que le long garde, c'est **le pourquoi** (la cause, la réponse à la C, la chute) **et la grande question** — plus l'événement. Le spectateur voit *ce qui arrive* ; il ne sait pas *pourquoi*. Si l'issue du test est elle-même la chute du long, on joue l'événement jusqu'à l'instant où le système agit et on retire la phrase qui l'explique.
2. **La C était une anecdote, pas un enjeu** (hypothèse). 015 : « Sauf si tu le rates… ou s'il *casse*. » ; 009 et 010 : « Toi… tu poses le *tien* ? ». HS04 : « pourquoi « chien » ? » — une étymologie, sur un mot que presque personne ne connaît, à 7,3 s. **Désormais : la C est un enjeu ou un paradoxe sur le mécanisme ; elle répond à « qu'est-ce qui m'arrive ? », jamais à « comment ça s'appelle ? ».** Interdits en C : une anecdote, une étymologie, un nom de métier, un surnom. Test : peut-on la remplacer par « tu y survis ? », « tu le rates ? », « ça tient ? » sans changer son sens ? Sinon, elle est à refaire.
3. **La scène était un teaser, pas un danger** (hypothèse). HS04 : « ce qui va briser ta pièce… se cache sous tes *roues* ». **Désormais : la scène (10 → 22 s) met le danger là où est le spectateur, avec un enjeu et un chiffre qui fait peur par phrase** (modèle : la scène du 015) ; jamais une phrase qui annonce qu'une chose va arriver.
4. **Le mot que personne ne connaît sort de l'accroche** (hypothèse). Aucun mot technique ou d'argot que le grand public ne reconnaît (« chien jaune », « brin », « consignation ») dans les dix premières secondes : il arrive dans le morceau payé, une fois montré à l'image.
5. **Les promos sortaient avant leur long, ou dans l'ombre d'un autre court** (dates prouvées par `metrics/publication.json`, effet supposé). HS01 36 min après le 020 ; HS02 36 min avant le 024 et avant le L02 ; HS03 2 h 23 après le 027. **Désormais : le long public d'abord, ses liens posés, la promo dans l'heure entre 19 h et 22 h, et jamais le même soir qu'un autre court du compte** (« L'ordre de sortie », plus bas). Ordre validé par Merwan le 27/10 : le long à 18 h, la promo vers 19 h 30.
6. **Moins de temps « ailleurs » à la fin** (hypothèse) : le rendez-vous YouTube tient en une phrase, **≈ 3 s** (HS04 : 5,5 s, 8,5 % du film ; le 015 perdait déjà 14 points dans ses dernières secondes). La légende TikTok, elle, fait **≈ 120 caractères** et finit sur la question ; le rendez-vous n'y est pas, il est dans l'épinglé.
7. **Le décompte reste affiché** quand l'image le permet sans refaire la 3D, comme sur les courts (un « 3 · 2 · 1 » plutôt qu'un compteur de fils de 34 px que personne n'a lu).
8. **Quand un court du compte a percé sur le thème du long, la promo reprend sa forme** (danger à la 2ᵉ personne, événement joué, chute) : le porte-avions du L04 et le 015 (100 000 vues).
9. **TikTok reste une loterie** (en partie prouvé : sur les 17 premiers courts, 3 font 65 % des vues, 9 sur 17 sont sous 15 000). Quatre promos sous 15 000 ne prouvent pas seules que la forme est mauvaise ; si les courts 020 à 028 sont eux aussi sous 15 000, ce ne sont pas les promos. **Avant d'écrire le HS05, on applique à HS03 et HS04 la règle de `promo-1` § 1.4** (vues ÷ médiane des courts de la même semaine, plateforme par plateforme), dès que Merwan a donné les chiffres.

## La règle de Merwan (16/10)

> « Il faut pas spoil la vidéo, il faut donner aux gens envie d'en savoir plus, limite les frustrer. »
> « Ne surtout pas oublier la boucle, le alors on l'ouvre ou une variante. »

Ce qu'on en fait depuis le 21/10 :

- **La grande réponse reste dans le long** : la réponse à la question de l'accroche (la C), la chute du long, le pourquoi de son test. Personne ne les entend dans la promo. Depuis le 27/10, l'événement du test, lui, se joue en entier : on frustre sur le *pourquoi*, pas sur *ce qui arrive* (voir plus haut).
- **La frustration se place à la fin, sur une seule question** — celle de l'accroche, qui revient — **pas dès la 11ᵉ seconde, sur six**. Un fil ouvert ne retient que si le spectateur croit qu'il sera payé dans la vidéo qu'il regarde (le 003 l'a montré à l'envers : sa courbe casse juste après la chute, quand le film a payé) ; lui dire à 11 s que la réponse est ailleurs le libère. Une promo qui ne paie rien du tout est une bande-annonce : un inconnu de TikTok ou de Shorts la quitte (voir « Ce que les deux premières ont appris »).
- **Elle paie un morceau** : un fil du long, ouvert et payé dans la promo, le plus visuel — jamais la C ni la chute. C'est ce qui la fait tenir seule ; c'est aussi ce qui prouve au spectateur que le long tient ses promesses.
- **Frustrer n'est pas tricher.** Chaque fil ouvert est vrai et payé dans le long : on note, phrase par phrase, l'`id` du beat qui le paie (`sources`). Un spectateur qui clique et ne trouve pas la réponse ne revient pas — et YouTube sanctionne un « choc » qui ne paie pas plus vite qu'un swipe.
- **Aucun fait neuf** : la promo est une vitrine du long, pas un dossier de plus. Pas de recherche, pas de contre-vérification : les faits ont déjà été vérifiés pour le long.
- **« Alors… on l'ouvre. » et la boucle** sont dans chaque promo, sans exception.

## Ce que les deux premières ont appris (21/10, sans leurs chiffres)

Les vues et les courbes des HS ne sont pas encore dans `metrics/` : ce qui suit vient des scripts, des voix mesurées et des dates de publication. Des pistes, pas des lois — à confirmer sur les captures.

- **Instagram n'est pas la preuve que la forme marche** : il porte tout le compte (4,0 M de vues dans la semaine où TikTok en faisait 235 k et YouTube 33 k), et il montre la promo d'abord à des dizaines de milliers d'abonnés qui connaissent le compte, pour qui « notre nouveau grand format » est une nouvelle et « Pas ici » un clin d'œil. TikTok (un compte qu'il réapprend) et Shorts (au stade du test) la montrent à des inconnus qui la jugent seule : TikTok écrit (2020) qu'une vidéo regardée jusqu'au bout est un indicateur fort d'intérêt ; Shorts compte ceux qui balaient (39 % dès la première seconde sur nos courts).
- **À 11 s, les deux promos disent qu'elles sont une publicité** : « Jusqu'ici, on ouvrait des systèmes… Cette fois… Près de neuf minutes. » (HS01, 11,3 → 17,9 s), « Notre nouveau grand format t'emmène… » (HS02, 11,1 → 15,6 s). C'est la zone qui coûte le plus sur nos courts (10 → 25 s), et ce qu'on y apprend, c'est que le film est ailleurs.
- **Pas de scène, une liste** : après l'accroche, six teasers sur six objets différents (« Et la bande noire… », « Et le gravier… », « Et parfois… »), un sujet neuf toutes les quatre secondes, aucun enjeu qui monte. Le contraire de la scène du 015 (`docs/recette-script.md`, § 3).
- **Rien n'est payé** : six fils ouverts dans chacune, zéro payé. À 50 s, le moment que les spectateurs du compte attendent est refusé (« Alors… on l'ouvre. » → noir → « Pas ici. »).
- **Aucune action sur place** : pas de question pour les commentaires, des légendes TikTok qui finissent sur « lien en bio. » ; le seul appel demande de quitter l'application.
- **« YouTube » dit dans la vidéo** : aucune source officielle ne dit que TikTok le pénalise (sa page des règles du fil « Pour toi » n'en parle pas ; la seule règle écrite sur le hors-plateforme vise les lives qui poussent à acheter ailleurs). On ne bâtit rien sur cette rumeur ; on le dit une fois, à la fin.
- **Les dates cochées au bureau** (`metrics/publication.json`, l'heure où la case a été cochée) mettent les promos avant leur long : HS01 sur TikTok le 16/10, le L01 le 19/10 ; HS02 sur Shorts à 18 h 10, Instagram 18 h 13, TikTok 21 h 28, le L02 à 22 h 05. Si c'est l'ordre réel, la « vidéo associée » du Short n'a pas pu être posée, et le lien en bio menait ailleurs pendant les premières heures — celles où une plateforme teste une vidéo.
- **La voix** (mesurée sur les deux) : « Alors… on l'ouvre. » dirigé `[nonchalant, confident]` puis `[casual, charismatic]` dure 1,68 et 1,76 s (le seuil de `npm run voice` est 1,5 s ; 1,06 à 1,36 s sur les 005-017 et 021-025, en `[calm]`) ; `[serious]` envoie Eric 1 à 4 demi-tons sous le reste du film (HS01 : promesse −3,8, « une vitre éclate » −3,2, « une tête de dix kilos » −3,4 ; HS02 : promesse −2,7, le test −1,1) — exactement sur le teaser du test, qui devrait monter ; la question de la C retombe (HS02) ou perd sa pause (HS01) ; l'accroche `[tense]` sort grave (−2,4 et −3,5 dt), comme celle du 006 ; le mot-choc du HS02 (« tuer ») tombe à 3,6 s, derrière un « … ».

## La forme, depuis le HS05 : un court qui tient seul et joue son événement

| ≈ s | Phrase | Mots | Ce qu'elle fait |
| --- | --- | --- | --- |
| 0 → 10 | **A · B · C** : l'accroche du long | 26-32 | A : la promesse du titre et de la miniature, un danger immédiat à la 2ᵉ personne, première phrase de huit mots au plus, **mot-choc avant 3 s**, aucun « … » avant lui. B : un fait qu'on a du mal à croire (pas un soulagement). C : **un enjeu ou un paradoxe sur le mécanisme** (« qu'est-ce qui m'arrive ? »), **jamais une anecdote, une étymologie ni un nom de métier** ; c'est la grande question du long — **jamais payée ici**. Aucun mot que le grand public ne reconnaît |
| 10 → 22 | **la scène** | 22-30 | dans l'instant de l'accroche (même lieu, même seconde), le danger là où est le spectateur : **un enjeu et un chiffre qui fait peur par phrase**, une image par phrase, une seule pause ; jamais une phrase qui annonce qu'une chose va arriver (« ce qui va briser… ») ; elle finit sur l'objet qu'on ouvre. **Aucune annonce** : ni « grand format », ni « film », ni « YouTube », ni « Jusqu'ici » |
| ≈ 22 | **« Alors… on l'ouvre. »** | 3 | `[calm]`, dans la même requête que la scène ; **elle ouvre pour de vrai** : l'éclaté du long commence sur le mot |
| 23 → 42 | **le morceau payé** | 45-60 | UN fil du long, ouvert et payé ici : le plus visuel, jamais la réponse à la C ni la chute ; un chemin (la pièce qui agit, d'un bout à l'autre), pas une liste ; il finit sur une phrase qui retend |
| 42 → 50 | **le test du long** | 15-22 | **l'événement se joue en entier, 6 à 8 s** : la pièce agit du début à la fin, l'image montre ce qui arrive, sans coupe au noir. **Le long garde le POURQUOI** (la cause, ce qui a tenu ou cédé et pourquoi) **et la grande question** |
| 50 → 56 | **le commentaire** | 15-22 | la C revient, en question fermée à deux camps, à vérifier chez soi (« un I… ou un II ? ») ; la réponse est dans le long, pas dans la promo |
| 56 → 59 | **le rendez-vous** | 8-12 | **une phrase, ≈ 3 s** : le film complet, sa durée, notre chaîne YouTube, le lien en bio (« Le film entier, dix minutes : notre chaîne YouTube, lien en bio. ») ; **« YouTube » n'est dit qu'ici**. Si le long est le premier d'un genre, c'est ici qu'on le dit, pas à 11 s |
| 59 → 62 | **la boucle** | 4-8 | inachevée, deux secondes au plus, elle suit le rendez-vous sans pause et retombe sur les premiers mots de l'accroche |

**Budget : 190 à 215 mots affichés, 62 à 70 s** (mesuré : 185 mots → 64,7 s pour HS01, 176 → 60,8 s pour HS02, silences compris ; `npm run script` estime ≈ 20 % trop long). Jamais sous 60 s. Les secondes gagnées sur le rendez-vous vont au test et au morceau payé, pas à la fin.

**Le gag « Pas ici. » est rangé** : il refusait l'ouverture au moment où le spectateur l'attendait. « Alors… on l'ouvre. » ouvre maintenant pour de vrai — c'est la phrase signature elle-même, la règle de Merwan est tenue. Une variante n'est permise que si elle garde ses mots et n'arrive qu'une fois.

**Une seule version pour toutes les plateformes** : un film, une voix, un rendu. Ce qui change d'une plateforme à l'autre, c'est le pont (le lien) et les textes, pas le film.

## Ce qui reste du compte, et ce qui change

| Reste | Change |
| --- | --- |
| L'accroche ABC dans les 9 s, à la 2ᵉ personne, au présent ; le mot-choc avant 3 s | La C n'est pas payée dans la promo : elle revient à la fin en question de commentaire, sa réponse est dans le long |
| La première image la plus forte, sans texte | Elle vient du long, choisie sur une planche de quatre candidates : l'objet de sa miniature, un événement déjà en cours, au moins 5 au mouvement de la première demi-seconde (`qa` → « rythme » ; HS01 0,4, HS02 0,2, le 015 9,8), un objet plein sur 40 % de la largeur — un plan large du long recadré en 9:16 devient un dessin au trait (`docs/recette-promo-image.md`). Un noir dure une respiration, 0,5 s au plus |
| « Alors… on l'ouvre. », mot pour mot, `[calm]`, une fois | Elle ouvre un morceau du long, pas le système entier |
| La boucle (dernière phrase inachevée → l'accroche) | — |
| ≥ 60 s | 62 à 70 s, 190 à 215 mots |
| La question du commentaire, fermée, à deux camps | Sa réponse n'est pas dans le court : elle est dans le long |
| Trois CTA (like, commentaire, abonnement) | Deux : le commentaire (la C) et le rendez-vous YouTube, dans cet ordre, en fin de film. Pas de like, pas d'abonnement au seuil, pas d'annonce du prochain dossier ; aucun logo, un cartouche « FILM COMPLET · 8 MIN 51 » |
| « DOSSIER 00X », actes MENACE / AUTOPSIE / RÉPONSE | « HORS-SÉRIE 0X », actes MENACE / L'USINE (ou le lieu du long) / RENDEZ-VOUS — une option du modèle des courts (`"serie": "hors-serie"`) |
| La voix d'Eric, une requête, `eleven_v4_turbo` | Les balises du tableau « La voix » ci-dessous |

## L'écriture, phrase par phrase

- **La grille des courts s'applique** (`docs/recette-script.md`, § 8) : quelle question le spectateur se pose à cet instant ; la phrase peut-elle sauter ; qu'est-ce qu'on voit ; quel mot la porte (à la fin) ; est-elle dans son budget.
- **Chaque phrase a son beat payeur dans le long**, écrit dans `sources` (« `id` ← L0x `beat`, `beat` »). Une phrase sans beat payeur sort du script. Un chiffre se recopie du long tel qu'il y est dit (même arrondi, même « environ »).
- **Les fils se déclarent** dans le script, comme dans un long : `"fil": "<nom>"` sur la phrase qui l'ouvre, `"paie": "<nom>"` sur celle qui le paie. La C porte `"fil"` et aucune phrase de la promo ne la paie ; le morceau porte son `"fil"` et son `"paie"`. `npm run script` le vérifie.
- **Ce qui ne se dit jamais** : la réponse à la C, la chute du long (et toute phrase trop proche d'elle), le pourquoi de l'issue du test (l'événement se montre, sa cause ne se dit pas), une phrase du long qui est elle-même une réponse (on garde la question, on retire la réponse). Le brief de chaque promo les liste (`docs/HSnn-brief.md`, « Ce qui ne se dit PAS »).
- **Le mot que les gens cherchent** (relevé dans l'autocomplétion de YouTube pour le long : « consignation haute tension », « comment est fabriqué le verre ») est dit dans la promo au moins une fois, et ouvre ses légendes.
- **Les passages se lient** (Merwan, 16/10 : une date qui tombe sans transition « saute ») : « Et on est remontés jusqu'en… » plutôt qu'une date sèche.
- **Comment on annonce le long** (Merwan, 16/10, « trop nul comment c'est annoncé ») : « notre chaîne YouTube » et « le lien est en bio », sans redire le nom du compte ; un événement, chaleureux, pas une adresse dictée.

## La voix

Eric (`9osbeK6KzhDRV0yX4rTq`), **`eleven_v4_turbo`, une seule requête**, `stability` 0,4, `--takes 1` ; au plus une balise par phrase, en tête de ligne, jamais trois fois la même de suite.

| Phrase | Balise | Pourquoi |
| --- | --- | --- |
| accroche, scène | `[tense]` | la direction de l'accroche du long, « parfaite » pour Merwan ; pas de « … » avant le mot-choc |
| « Alors… on l'ouvre. » | `[calm]` (`voAlt` : `[calm] Alors... [short pause] on l'ouvre.`, si la pause n'est pas jouée) | 1,06-1,36 s sur les courts ; `[nonchalant, confident]` et `[casual, charismatic]` : 1,68 et 1,76 s sur les deux promos. Le ton nonchalant vient du `[calm]` dit juste après une scène tendue, dans la même requête — pas d'une balise qui le décrit |
| morceau payé | `[conversational, curious]`, `[curious]`, `[warm, conversational]` en rotation ; `[amused]` une fois au plus, sur un paradoxe mécanique | la conversation du long relève l'autopsie (banc du 025) |
| test du long | `[tense]` | `[serious]` le fait descendre (HS01 : −3,4 dt sur « une tête de dix kilos ») |
| commentaire | `[conversational, curious]` | une question à deux camps, qui monte |
| rendez-vous | `[warm, conversational]` | |
| boucle | `[calm]`, une virgule au bout du `vo` | la voix reste en l'air |

**Interdites sur une promo** : celles des courts (`[urgent]`, `[dramatic]`, `[ominous]`, `[low, grave voice]`, `[relieved]`, `[nervous]`, `[slowly]`), plus `[serious]`, `[firm, matter-of-fact]`, `[thoughtful]` ; un mot en MAJUSCULES, un « ! ». Une phrase ratée se reprend seule (`--retake <beat> --count 1`), coût annoncé d'abord ; « on l'ouvre » reste dans la requête de la scène qui le précède (`npm run voice` l'y rattache, prise et reprise).

## Le lien vers le long, plateforme par plateforme

| Plateforme | Le pont | Ce qu'on écrit |
| --- | --- | --- |
| **TikTok** | le lien en bio (1 000 abonnés au moins pour un compte personnel, d'après les guides qui citent TikTok : le compte les a) — **posé sur le long avant la promo**, et la bio dit qu'un film complet attend | légende : **≈ 120 caractères** (150 au plus), le mot cherché et l'enjeu en tête, la question à deux camps à la fin, **sans le rendez-vous** (il est dans l'épinglé) ; épinglé (150 caractères au plus) : « Le film complet (9 min) : lien en bio, ou cherche « Système Décodé <mot> » sur YouTube » |
| **Instagram** | le lien en bio + **une story à autocollant de lien le jour même**, gardée « À la une » | légende : idem ; épinglé : idem |
| **YouTube Shorts** | **« Vidéo associée »** → le long, choisie à la mise en ligne (YouTube Studio → Contenu → le Short → Vidéo associée). C'est le seul lien cliquable d'un Short : ceux des descriptions et des commentaires ne le sont plus depuis le 31/08/2023 | titre de 100 caractères au plus, le mot cherché dedans ; description : le mot cherché en tête, « le lien en bas de ce Short » ; épinglé : la question |
| **Facebook** | le lien du long en premier commentaire | légende : idem |

- **Jamais le titre exact du long dans un texte de promo** : ses titres passent en test A/B (YouTube Studio, « Tester et comparer ») et changent. On écrit le nom de la chaîne et le mot à chercher.
- **L'ordre de sortie** (resserré le 27/10 : HS01 est sorti 36 min après le 020, HS02 avant son long et 36 min avant le 024, HS03 2 h 23 après le 027) : (1) le long en ligne, **public** — jamais une promo avant son long ; (2) les liens posés (bio TikTok, bio Instagram, la story prête) ; (3) la promo **dans l'heure qui suit**, sur les quatre plateformes, **entre 19 h et 22 h** (le pic des abonnés TikTok), la « vidéo associée » choisie à la mise en ligne du Short — **l'ordre validé par Merwan le 27/10 : le long à 18 h, la promo vers 19 h 30** ; (4) une fois en ligne, depuis un téléphone : le lien du Short s'affiche, le lien en bio ouvre le long. **Jamais le même soir qu'un autre court du compte** : ce jour-là, pas de dossier — la promo prend le jour de pause d'un dossier. Que l'ombre d'un autre court ait coûté des vues aux promos est une hypothèse ; l'ordre, lui, ne coûte rien. Merwan publie ; personne d'autre.

## Les textes de publication

- **Légende TikTok** (depuis le 27/10 ; HS04 : ≈ 380 caractères, « lien en bio » au milieu) : **≈ 120 caractères, 150 au plus** ; première ligne, le mot cherché et l'enjeu ; **elle finit sur la question** à deux camps ; pas de rendez-vous (il est dans l'épinglé). La forme pour HS04 : `docs/scale/promo-4-diagnostic.md`, § 3, point 7.
- **Légende Instagram et Facebook** : première ligne, le mot cherché avec son synonyme courant ; puis l'accroche prolongée sans la répéter, sans réponse ; le rendez-vous (« le film complet, notre chaîne YouTube, lien en bio ») ; **elle finit sur la question à deux camps**.
- Cinq hashtags au plus sur chaque plateforme, sans accents, dont le mot cherché.
- **Épinglé** : 150 caractères au plus ; le chemin vers le long (lien en bio, ou le nom de la chaîne et le mot à chercher) et la question.
- **YouTube Shorts** : le titre est l'accroche « limite putaclic mais fidèle » (chaque mot vrai dans le long), avec le mot cherché ; jamais « notre premier grand film » ni un méta.
- **Le mode d'emploi du lien** pour le bureau, dans `post.lien` (le tableau ci-dessus, adapté au long).

## Ce que vérifie `npm run script` (hors-série)

`scripts/lib/ecriture.mjs` (des avertissements, rien de bloqué, rien d'écrit) : le budget (190 à 215 mots ; 60 à 70 s avec la voix) ; l'accroche (première phrase de huit mots au plus, la 2ᵉ personne, le repère `choc` avant 3 s, A·B·C finis avant 10 s) ; **aucune annonce avant « on l'ouvre »** (« grand format », « notre chaîne », « YouTube », « Jusqu'ici », « Cette fois »…) ; « Alors… on l'ouvre. » une fois, mot pour mot, `[calm]`, et sa durée avec la voix (1,5 s au plus) ; pas de « Pas ici » derrière ; les fils (`fil` / `paie`) : la C jamais payée, au moins un morceau payé ; une question à deux camps et le mot « commentaire » ; un seul rendez-vous, après « on l'ouvre », qui dit où est le lien ; « YouTube » dit une fois ; la boucle ; les balises (celles du tableau, une par phrase, en tête) ; chaque phrase dans `sources` ; la légende, les hashtags, l'épinglé, le titre du Short, `post.lien`. Ce qu'elle ne vérifie pas encore, ou plus assez, de la révision du 27/10 : « À changer dans les vérifications », en fin de fichier.

## Le coût visé

Pas de faits, pas de décor neuf, une seule requête de voix (≈ 200 mots en turbo : quelques centaines de crédits, chiffre exact lu le jour même), un film d'une minute monté sur des décors qui existent. Cible : **≈ 1 h de fabrication et moins de 1 M de jetons d'agents** — c'est le prix qui permet une promo par long.

## À mesurer après publication

À relever 48 h puis 7 jours après la sortie, dans `metrics/audience.json` (une entrée par promo, à côté de celle de son long), et à résumer en deux lignes dans CLAUDE.md, « Dossiers » :

- **Plateforme ou forme ?** Sur chaque plateforme, les vues de la promo divisées par la **médiane des courts publiés la même semaine sur la même plateforme**. Autour de 1 : c'est la plateforme (la promo fait ce que fait le compte là-bas). Nettement sous 1 : c'est la forme.
- **La promo, plateforme par plateforme** (TikTok, Instagram, Facebook, Shorts) : vues, tenue à 3 s, part regardée, % qui finissent, la courbe à 11 s (l'ancienne annonce) et sur « Alors… on l'ouvre », commentaires pour 1 000 vues, abonnés gagnés.
- **Les clics** : Instagram → clics sur le lien en bio et sur l'autocollant de la story ; TikTok → vues du profil et clics sur le lien en bio ; Shorts → les vues du long venues du Short.
- **Le long, dans YouTube Studio** (Audience → Sources de trafic, sur 48 h et 7 jours) : la part « Shorts » et la part « Sources externes » (instagram.com, tiktok.com, facebook.com), contre « Recherche YouTube » et « Vidéos suggérées » ; la durée moyenne de visionnage des spectateurs venus de l'extérieur contre les autres.
- **Le rapport qui compte** : vues du long venues des promos pour 1 000 vues de promo. Les promos suivantes se jugent là-dessus.

Ce qu'on en fera (des pistes) : si la promo fait les vues d'un court ordinaire mais n'envoie presque personne sur le long, c'est le pont (le lien, son ordre de sortie, la phrase du rendez-vous) ; si elle décroche avant la scène, c'est l'accroche ; si elle tient la médiane d'Instagram et reste sous la moitié de celle de TikTok avec la forme ci-dessus, la promo ne part plus sur TikTok (les courts y portent le compte, le lien du long reste en bio) ; si les spectateurs venus de l'extérieur partent du long plus vite que les autres, la promo a promis autre chose que le film.

Ce qui tranche entre les hypothèses du 27/10 (`docs/scale/promo-4-diagnostic.md`, § 4) : (a) promos à ≈ 1 × la médiane des courts de leur semaine **sur chaque plateforme** → c'est la plateforme, pas la forme ; (b) nettement sous 1 sur TikTok **et** Shorts, à 1 sur Instagram → c'est la forme (des inconnus contre des abonnés) ; (c) même courbe que les courts sur TikTok, mais personne sur le long → c'est le pont (lien en bio, ordre de sortie) ; (d) les courts 020 à 028 eux aussi sous 15 000 → ce ne sont pas les promos. Sur HS05, en plus : la courbe pendant le test joué en entier (≈ 42 → 50 s) contre celle de HS04, coupé au même endroit.

## À changer dans les vérifications

Relevé le 27/10 dans `scripts/lib/ecriture.mjs`, fonction `ecritureHorsSerie` ; rien n'y a été changé (un autre agent s'en sert). À faire par celui qui reprend l'outillage.

**Ce qui contredit la recette révisée :**
- **§ 7, le rendez-vous** : `if (n > 22) warn(… « 20 mots au plus »)` laisse passer un rendez-vous de 20 mots (≈ 6 s, celui de HS04) ; la recette veut une phrase de ≈ 3 s, **12 mots au plus**. Avec la voix : avertir si le beat du rendez-vous dure plus de 3,5 s.
- **§ 3, la scène** : son message dit « 22 à 30 (≈ 9 s) » ; la scène court maintenant de 10 à 22 s (≈ 12 s, toujours 22 à 30 mots) : le message est à corriger, pas son seuil de mots.

**Ce qu'elle ne vérifie pas et que la recette demande désormais :**
- **§ 11, la légende TikTok** : aucune longueur n'est vérifiée → avertir au-delà de 150 caractères (cible ≈ 120) ; avertir si `post.caption` contient le rendez-vous (« lien en bio », « YouTube », « film complet ») — il va dans l'épinglé. Instagram et Facebook gardent le leur.
- **Le test joué en entier** : aucun contrôle sur le beat `test` → avertir s'il manque, et, avec la voix, s'il dure moins de 6 s ; avertir s'il finit sur « … » ou sur un verbe d'attente (« monte… », « tourne encore… »), la forme coupée de HS03 et HS04.
- **La C** : avertir si `curiosite` est une question de vocabulaire (« pourquoi « … » ? », « on l'appelle », « comment s'appelle », « d'où vient le nom »).
- **La scène** : avertir sur une phrase qui annonce au lieu de montrer (« ce qui va … », « va arriver », « se cache ») et sur une scène sans aucun chiffre.
- **`qa.mjs`, section promo** (pour mémoire, hors `ecriture.mjs`) : le noir sur le test n'y est pas compté à part ; il devrait l'être, puisqu'il n'y en a plus.

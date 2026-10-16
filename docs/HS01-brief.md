# HS01 — brief de la première promo : le lancement des longs, avec le pare-brise

Écrit le 2026-10-16. **Script proposé à Merwan, pas encore validé** : rien n'est enregistré, aucun épisode n'est créé. À fabriquer par l'agent `promo` (`.claude/agents/promo.md`), selon `docs/recette-promo.md`.

## Ce qui rend celle-ci spéciale

C'est la première promo, et elle annonce **le lancement des formats longs de Système Décodé** : jusqu'ici, le public des courts n'a jamais vu de long. Elle renvoie vers le L01 :

- **le long** : `episodes/L01-pare-brise/`, rendu le 2026-10-15, **8 min 51** (`renders/L01-pare-brise.mp4`) ;
- **son titre YouTube** (`post.youtube.title`) : « Moins d'1 mm entre ta tête et la route : comment on fabrique ton pare-brise » — la B de la promo le reprend, pour que celui qui clique reconnaisse ce qu'on lui a promis ;
- **ses miniatures** : la masse de 10 kg qui fend le pare-brise (« IL DOIT CASSER »), la bille d'acier, le pare-brise étoilé.

Elle crée aussi ce que les suivantes réutiliseront : l'option `"serie": "hors-serie"` du modèle des courts (en-tête « HORS-SÉRIE 01 », actes « 01 MENACE / 02 L'USINE / 03 RENDEZ-VOUS »), le cartouche YouTube, et l'ouverture des outils aux identifiants `HSnn` (`scripts/sd.mjs`, `scripts/metrics.mjs`). Voir le prompt de l'agent, « L'identité hors-série ».

## Le script révisé (153 mots dits, ≈ 59 s de parole à 2,6 mots/s, ≈ 62-63 s avec les silences)

Chaque ligne : l'`id` du beat de la promo, le texte, la direction proposée, et **le beat du L01 qui la paie** (`episodes/L01-pare-brise/episode.json`).

| Beat | Texte | Direction | Payé dans le L01 par |
| --- | --- | --- | --- |
| `accroche` · A | Ta tête part dans le pare-brise. Il *casse*… exactement comme prévu. | `[tense]` (mot pour mot l'accroche du long) | `surprise` (« pour réussir l'essai… le pare-brise doit casser »), `reponse`, `chute` |
| `promesse` · B | Entre ta tête et la route : moins d'un +millimètre+. | `[serious]` | `promesse` (« un film de moins d'un millimètre va t'empêcher de passer au travers »), `reponse` |
| `curiosite` · C | Et ta vitre de côté… ne l'a peut-être *pas*. | `[conversational, curious]` | `curiosite`, `trempe`, `du`, `aaa`, `etiquette` — **pas payé dans la promo (voulu)** |
| `lancement` | Jusqu'ici, on ouvrait des systèmes en moins de deux minutes. Cette fois, on a suivi ton pare-brise dans l'usine. Près de neuf minutes. | `[warm, conversational]` | le L01 entier (8 min 51) |
| `four` | Du sable qui devient une rivière *orange*, vers [1500 °C\|mille cinq cents degrés]. | `[curious]` | `four`, `calcin` (« autour de 1500 °C »), `fusion` (« une pâte orange ») |
| `flotte` | Pour qu'il soit parfaitement plat, on le fait flotter. Pas sur de l'eau. | `[conversational, curious]` | `plat`, `etain`, `flotte`, `pourquoi` |
| `flacon` | Novembre [1903\|mille neuf cent trois]. Un flacon tombe par terre. Il aurait dû voler en *éclats*. | `[warm, conversational]` | `flacon`, `etoile` (« il ne s'est pas brisé »), `nitro` (le pourquoi) |
| `tampon` | Un petit tampon, dans le coin de ta vitre. Le jour où il faut sortir… tu sais le lire ? | `[curious]` | `tampon` (E2, I trempé, II feuilleté), `etiquette` (« c'est lui qui te dit laquelle viser ») |
| `tete` | Et à la fin, on lâche sur lui une tête de dix kilos. | `[serious]` | `tete` (10 kg, 1,5 m), `surprise`, `reponse` |
| `ouvre` | Alors… on l'ouvre. | `[calm]` (sa pause) | `ouvre`, `couches` |
| `pasici` | Pas ici. | `[amused]` | — (le gag) |
| `youtube` | C'est notre premier grand film. Il est sur YouTube : chaîne Système Décodé. | `[warm, conversational]` | — (cartouche « FILM COMPLET · 8 MIN 51 ») |
| `boucle` | Et tu sauras enfin ce qui se passe, le jour où… | `[calm]`, virgule finale dans `vo` | retombe sur « Ta tête part dans le pare-brise » ; payé par `chute` (« fait pour casser… sans te lâcher ») |

L'accroche (A · B · C) tient en 29 mots : elle finit vers 9-10 s, à la limite de la règle — B et C ont été raccourcies pour ça (33 mots dans le script de départ, soit ≈ 11-12 s). Si la voix la fait finir après 10 s, couper « exactement » dans A avant toute autre chose. Les actes : **01 MENACE** = `accroche` → `curiosite` ; **02 L'USINE** = `lancement` → `tete` ; la porte `ouvre` / `pasici` ; **03 RENDEZ-VOUS** = `youtube` → `boucle`. Le nom du compte s'allume dans l'en-tête sur « Système Décodé ». `hold` : ≈ 0,5 s de noir après « on l'ouvre », ≈ 0,4 s après « Pas ici. ».

## Ce que la vérification a changé dans le script de départ

1. **« Un flacon tombé par terre en 1903, sans lequel il n'existerait pas »** — faux d'après le long lui-même : le beat `premier` dit que Bénédictus « n'est pas le premier à y penser » (un brevet français de 1902). Devenu « Un flacon tombe par terre. Il aurait dû voler en éclats. » : un fil ouvert, payé par `etoile` et `nitro`.
2. **« Il te dit laquelle viser, le jour où il faut sortir »** — c'est presque mot pour mot la réponse du long (`etiquette` : « C'est lui qui te dit laquelle viser ») : un spoil de la C. Devenu une question : « Le jour où il faut sortir… tu sais le lire ? ». La lecture (E2, I, II) reste dans le long.
3. **« On l'a suivi dans l'usine, pendant neuf minutes »** — redisait la phrase de lancement : fondu dedans.
4. **« on ouvrait des systèmes en une minute »** (dans la phrase de lancement proposée) — les courts font 79 à 98 s : « en moins de deux minutes ».
5. **B et C** (« Entre ta tête et la route, il reste moins d'un millimètre. » / « Et ce millimètre… ta vitre de côté ne l'a peut-être pas. ») — 33 mots d'accroche, ≈ 11-12 s : au-delà des 8-9 s. Resserrées à 29 mots, sans rien changer au sens.
6. **« Neuf minutes »** — le long fait 8 min 51 : « Près de neuf minutes » ; le cartouche donne la durée exacte.
7. **« à mille cinq cents degrés »** — le long dit « autour de 1500 °C » : « vers ».
8. **« Le film entier est sur YouTube. Système Décodé. Près de neuf minutes. »** — devenu « C'est notre premier grand film. Il est sur YouTube : chaîne Système Décodé. » (la durée est déjà dite au lancement, et écrite dans le cartouche).

## Ce qui tire encore sur la règle (à garder en tête, pas bloquant)

- **A, « Il casse… exactement comme prévu »**, dévoile que l'essai fait casser le pare-brise (`surprise`). On le garde : c'est l'accroche du long, sa miniature écrit déjà « IL DOIT CASSER » en énorme, et le pourquoi (`reponse`, `chute`) reste fermé.
- **`four` n'ouvre pas de fil** : c'est une vitrine (la plus belle matière du long). Toléré parce qu'il dure trois secondes ; c'est le premier qui saute si le film dépasse 65 s.
- **`tete`** ne dit pas qu'elle doit casser : c'est l'image qui coupe avant l'impact. Ne pas montrer la toile de fissures nulle part avant le noir (sauf dans la première image, voir plus bas).

## Les plans prévus (tout vient du L01, recadré en 9:16)

Décors importés de `episodes/L01-pare-brise/src/` (`car.js`, `verre.js`, `casse.js`, `dossier.js`) et du kit (`kit/lib/usine.js`, `kit/lib/postes.js`) ; jamais `kit/lib/landscape.js` ni les fichiers de chapitres `c*.js` (on y lit les poses qui cadrent, on ne les importe pas). Un plan naît du précédent.

| Beat | Plan | Pris dans |
| --- | --- | --- |
| `accroche` | **Première image** : la tête de verre qui part dans le pare-brise, la toile qui naît autour d'elle, vue de l'intérieur de la voiture aux rayons X ; ça bouge dès l'image 1. À choisir sur une planche de quatre candidates (la tête du crash, la masse de 10 kg de la miniature, le pare-brise étoilé, le ruban orange) — la gagnante doit montrer ce que dit l'accroche | `c1-ouverture.js` · `car.js`, `casse.js` ; miniature `thumb` du L01 |
| `promesse` | On plonge dans la tranche du verre : deux verres, entre eux le film veille, mince ; la route floue derrière. Pas l'éclaté (réservé au gag) | `verre.js` (le film), poses de `c1-ouverture.js` |
| `curiosite` | Raccord sur le bord du verre → la vitre de côté, seule, sans film ; le film veille s'éteint | `car.js` (`sideMount`) |
| `lancement` | Fouet arrière : de la voiture à toute la ligne d'usine aux rayons X, qui défile | `c1-ouverture.js` (le lieu LINE), `usine.js` |
| `four` | Le verre fondu qui passe la lèvre du four, la langue orange qui s'étale | `c2-four-etain.js`, `usine.js` (four de fusion) |
| `flotte` | Le ruban orange sur le bain — la pièce maîtresse du long ; aucun mot « étain » à l'écran, le métal reste un miroir sombre | `c2-four-etain.js`, `usine.js` (cuve plate à miroir) |
| `flacon` | Le laboratoire de 1903, le flacon qui échappe et tombe — **coupe avant le sol** | `dossier.js` (`lab`), `c4-salle-autoclave.js` |
| `tampon` | Le tampon imprimé dans le coin, en macro, de biais : on voit qu'il y a un code, on ne le lit pas | `c3-plat-bombage.js`, `verre.js` |
| `tete` | La tour d'essai, la tête de 10 kg lâchée — **noir une image avant l'impact** | `c6-test.js`, `postes.js` (tour de chute, tête d'essai) |
| `ouvre` | Le pare-brise sur l'établi, l'éclaté commence à s'ouvrir sur le mot → **noir** | `c1-ouverture.js` (`couches`) |
| `pasici` | Noir ; l'en-tête seul | — |
| `youtube` | Le ruban orange revient, le cartouche « FILM COMPLET · 8 MIN 51 » en zone haute, le nom du compte s'allume | `c2-four-etain.js` |
| `boucle` | Retour vers la voiture, la dernière image est la première | comme `accroche` |

## Ce que Merwan doit trancher

1. **Le script ci-dessus** (oui / non), et en particulier la phrase de lancement.
2. **La voix** : le coût affiché par `npm run voice -- HS01` le jour même (une requête, `eleven_v4_turbo`), à lui annoncer avant tout enregistrement.

## Publication

Le L01 sort d'abord sur YouTube ; HS01 dans l'heure, sur TikTok, Instagram, Facebook et Shorts. Shorts : « vidéo associée » → le L01. Instagram : lien en bio + story à autocollant de lien. TikTok : lien en bio s'il est actif, sinon « Sur YouTube : Moins d'1 mm entre ta tête et la route : comment on fabrique ton pare-brise » en épinglé. Facebook : le lien en premier commentaire. Cinq hashtags au plus par plateforme. Merwan publie.

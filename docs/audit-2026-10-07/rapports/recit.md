# Audit « récit » — Système Décodé, dossiers 001 à 006

Périmètre : les six scripts (`episodes/*/episode.json`), leurs minutages réels (`scratchpad/timing/script_00X.txt`), les planches denses 002–006 (`scratchpad/frames/<ep>/film_NN.jpg`, `hook_NN.jpg`), quatre images extraites (`audit/recit/quad.png` : 005 à 2,0 s et 60,0 s, 006 à 33,5 s et 71,5 s). Lecture seule sur le dépôt. Aucune image du 001 n'était fournie : il est jugé sur son script seul.

Trois faits de moteur vérifiés dans le code, parce qu'ils décident de ce qui est gratuit :

- Une phrase enregistrée est reconnue par **son identifiant, sa ligne `vo` et ses mots dits** (`scripts/lib/episode.mjs:253`, `beatHash`). Ni l'ordre des beats, ni `hold`, ni le texte affiché (`[affiché|dit]`) n'entrent dans l'empreinte.
- Donc : **déplacer un beat entier, supprimer un beat entier, changer un `hold`, changer l'affichage = 0 crédit**, et c'est réversible (les prises restent sur le disque, `scripts/voice.mjs:101-136`).
- Couper **à l'intérieur** d'une phrase, ou changer un mot dit = reprise de cette phrase seule (ordre de grandeur du projet : ≈ 40 crédits la prise ; 68 annoncés pour 2 prises de l'accroche du 006, 86 pour 3 prises de la boucle du 005).

---

## 0. L'essentiel

1. **Personne n'a encore regardé une courbe de rétention.** Quatre films sont en ligne, tout ce qui suit est du raisonnement. La première action coûte zéro : relever sept points par film (§ 9).
2. **Le danger est réglé à 60–70 % du film, et il reste 30 à 40 % derrière.** Après la fin de la chute il reste en moyenne **24,9 s, soit 29 % du film**. Dans les six films, **le bloc « like / commentaire / abonnement / boucle » dure plus longtemps que l'acte 3** (ce pour quoi le spectateur est venu).
3. **Cette queue est la partie la plus prévisible de la série** : mêmes formules, mêmes trois panneaux, même ordre, sur un seul plan fixe de l'objet posé sur l'établi (15 s dans le 006, 17,5 s dans le 005). Le mot « Like », dit en premier et suivi d'une pause, est la sonnerie de sortie.
4. **005 est le film le plus « fiche technique » des six** : sa première image ne bouge pas pendant 7,5 s et ne montre pas la panne ; « tu » disparaît de 9,6 s à 69 s ; il n'y a ni enjeu ni chrono avant 36,5 s. Il se corrige surtout gratuitement (image + ordre des beats), plus deux phrases à reprendre.
5. **006 est le meilleur film, avec deux défauts d'écriture** : la chute redit ce que la phrase d'avant vient de dire (« Tout seul. » / « de lui-même »), et « Chaque jour, depuis des années… » (31,7–36,2 s) est une digression sur une image fixe pendant que quelqu'un meurt.
6. **« Alors… on l'ouvre » est une signature, à garder.** Ce qui use, c'est l'énumération « Un A. Un B. Et… un C. » (6 films sur 6) et le quatuor final.

---

## 1. Mesures

Durées `ffprobe` : 001 78,90 s · 002 94,10 s · 003 82,22 s · 004 85,72 s · 005 84,80 s · 006 85,51 s.

### 1.1 La chute et ce qui reste derrière

| | Danger réglé (fin de la phrase) | Chute (début → fin) | Fin de chute → dernière image | Début de chute → dernière image | Début du beat `like` → fin |
|---|---|---|---|---|---|
| 001 | 55,10 s (69,8 %) « droit sur le seul sens qui te reste » | 55,49 → 59,98 | **18,9 s · 24,0 %** | 23,4 s · 29,7 % | 17,7 s · 22,5 % |
| 002 | 59,96 s (63,7 %) « il est plein » | 60,95 → 68,48 | **25,6 s · 27,2 %** | 33,2 s · 35,2 % | 19,8 s · 21,0 % |
| 003 | 49,71 s (60,5 %) « un demi-mètre plus bas » | 50,71 → 57,11 | **25,1 s · 30,5 %** | 31,5 s · 38,3 % | 17,8 s · 21,7 % |
| 004 | 53,92 s (62,9 %) « ta main s'ouvre » | 54,98 → 58,44 | **27,3 s · 31,8 %** | 30,7 s · 35,9 % | 21,4 s · 25,0 % |
| 005 | 50,43 s (59,5 %) « est arrêtée » | 51,43 → 56,95 | **27,9 s · 32,8 %** | 33,4 s · 39,4 % | 18,7 s · 22,1 % |
| 006 | 54,39 s (63,6 %) « tout seul » | 55,67 → 61,03 | **24,5 s · 28,6 %** | 29,8 s · 34,9 % | 19,7 s · 23,0 % |
| moyenne | 63 % | | **24,9 s · 29,2 %** | 30,3 s · 35,6 % | 19,2 s · 22,6 % |

Lecture : à partir du 002, la queue n'a fait que s'allonger (27 → 31 → 32 → 33 %), 006 revient à 29 %. Le 001, écrit avant le gabarit, a la queue la plus courte (pas de coda entre la chute et le like).

### 1.2 Les actes

| | Acte 1 (0 → « on l'ouvre ») | Acte 2 (autopsie + repos) | **Acte 3 (déclenchement → chute)** | Chute + coda | **Bloc CTA + boucle** |
|---|---|---|---|---|---|
| 001 | 16,5 s | 23,5 s | **15,5 s** | 5,7 s | **17,7 s** |
| 002 | 27,7 s | 17,8 s | **15,4 s** | 13,4 s | **19,8 s** |
| 003 | 20,0 s | 16,5 s | **14,3 s** | 13,7 s | **17,8 s** |
| 004 | 25,1 s | 12,7 s | **17,2 s** | 9,3 s | **21,4 s** |
| 005 | 23,7 s | 12,8 s | **15,0 s** | 14,6 s | **18,7 s** |
| 006 | 24,2 s | 12,8 s | **18,6 s** | 10,2 s | **19,7 s** |

Dans les six films, on passe plus de temps à demander (17,7 à 21,4 s) qu'à montrer le système agir (14,3 à 18,6 s). C'est le chiffre à retenir.

### 1.3 Où tombe le C, et quand il est payé

| | C (fin) | Payé à | Ce qui tient encore le spectateur dans la queue |
|---|---|---|---|
| 001 | « elle n'a jamais vu de fumée de sa vie » (15,9 s) | **la chute** (55,5–60 s) | rien — mais la queue est courte |
| 002 | « sauf si tes mains sont au mauvais endroit » (9,0 s) | **CTA commentaire, 79–85 s (90 %)**, démontré sur le volant (10 h 10 rouge → 9 h 15 vert, `002/film_11.jpg`) | la réponse promise |
| 003 | « ce n'est pas un câble qui va te retenir » (6,4 s) | 28–30 s (« un parachute ») | la boucle « 1854 » jusqu'à 63 s, puis rien |
| 004 | « ce n'est pas ton disjoncteur » (9,3 s) | 21–24 s, puis verdict 59–63 s | une action (« va voir le tien ») |
| 005 | « ce qui l'arrête… c'est la panne » (9,6 s) | 36,5–41,7 s | une question **neuve**, dont la réponse est hors du film (« épinglée ») |
| 006 | « encore faut-il… savoir où elle est » (10,6 s) | CTA commentaire, 73 s (87 %) | une réponse… que le spectateur **ne sait pas qu'il attend** |

Le 002 est le seul où le spectateur sait qu'une réponse lui est due jusqu'à la fin, et où elle est montrée sur l'objet. C'est le modèle de CTA à étudier.

---

## 2. Où le spectateur décroche, film par film

### 005 — Arrêt d'urgence (84,8 s) — modifiable

| Instant | Constat | Preuve |
|---|---|---|
| **0 → 7,5 s** | **L'image ne bouge pas et ne montre pas l'accroche.** La cuve aux rayons X, cadrée pareil sur 16 vignettes. « Panne de courant » : rien ne s'éteint. « C'est toi qui es aux commandes » : personne à l'image. Les trois autres accroches récentes ont un événement dans la première seconde (006 : la chute du corps, `006/hook_01.jpg` ; 003 : l'éclair du câble, `003/film_01.jpg` ; 004 : la main qui se referme, `004/film_01.jpg`). | `005/film_01.jpg` (0–7,5 s), `005/hook_01.jpg`, `quad.png` (image 1) ; `main.js:157` : un seul glissement d'azimut de 4,4 s |
| 0 → 36,5 s | **Pas de chrono, pas de compte à rebours.** L'en-tête affiche « 100 % » sans libellé pendant 36 s. La règle de structure du projet (« le chrono reste à l'écran jusqu'à la fin ») n'est pas tenue ; rien ne dit au spectateur qu'il attend quelque chose. | `quad.png` (image 1), `005/film_01` à `film_05` |
| 4,75 → 9,6 s | **Le B désamorce la menace sans que rien la relance.** « Ne touche à rien : il s'arrête tout seul, en deux secondes. » Dans le 003, « Tu ne tomberas pas » est suivi de « Alors coupons-les tous » et de 36 m de vide. Ici rien ne dit ce qui se passe si les barres ne tombent pas. Le moteur n'est plus que la curiosité (« c'est la panne »). | script 005 |
| **9,6 → 69,0 s** | **« Tu » disparaît pendant 59 s.** Aucune 2ᵉ personne dans `coeur`, `barres`, `boite`, `eclate`, `repos`, `zero`, `lache`, `mille`, `deux`, `chute`, `hache`. Dans 002, 003, 004 et 006 le climax se dit à la 2ᵉ personne (« Toi, tu ne sais encore rien », « Tu es à l'arrêt », « Ta main s'ouvre », « Tu colles les électrodes »). Le B (« ne touche à rien ») n'est **jamais repayé**. | `episode.json` 005, lignes 42-65 |
| 10 → 23 s | 13 s d'exposé (réaction en chaîne, barres, « toute la question ») sans personne ni enjeu. La scène des noyaux (11,5–16 s) est très bien, mais c'est un cours. | `005/film_02.jpg`, `film_03.jpg` |
| 21,1 → 23,0 s | « Toute la question, c'est ce qui les retient » : abstraite, et mesurée plate (−4 dt, CLAUDE.md). L'idée reçue que la chute retourne (« il faut du courant pour l'arrêter ») n'a jamais été mise dans la tête du spectateur : elle n'apparaît qu'en titre à 52 s et dans le like (« gros bouton rouge »). | script, `005/film_07.jpg` ligne 2 |
| 31 → 36,5 s | 5,5 s sur le même cadre (l'électroaimant et son champ). Acceptable : c'est le mécanisme, et la jauge « courant de maintien » prépare le « Zéro ». | `005/film_05.jpg` ligne 1 |
| **47 → 57 s** | **10 s sur la cuve verte, petite, immobile** : toute la phrase « Deux secondes… arrêtée » puis toute la chute. | `005/film_06.jpg` (fin), `film_07.jpg` |
| 57,8 → 62 s | **Chicago arrive après la chute, et son image est faible pendant 4 s** : une pile en fil de fer, un bonhomme de quelques pixels. C'est la phrase la plus longue du film (7,2 s) et la meilleure anecdote, placée en appendice. | `005/film_08.jpg`, `quad.png` (image 2) |
| **66 → 83,5 s** | **17,5 s sur un seul plan : le mécanisme sur l'établi**, trois panneaux se succèdent au-dessus. | `005/film_09.jpg`, `film_10.jpg`, `film_11.jpg` ; `main.js:322-348` |
| légende | La légende **dévoile la chute** dès la première ligne visible : « Pour arrêter un réacteur nucléaire, il suffit d'arrêter de le retenir. » Les cinq autres légendes prolongent l'accroche sans la vendre. | `episode.json` 005, ligne 19 |

### 006 — Défibrillateur (85,5 s) — modifiable

| Instant | Constat | Preuve |
|---|---|---|
| 0 → 1 s | La chute du corps : la meilleure première seconde de la série. À garder telle quelle. | `006/hook_01.jpg` |
| 1,2 → 5,0 s | Le corps à terre, cadre inchangé 3,8 s. Tolérable (la carte d'accroche s'allume mot à mot), mais c'est le seul temps mort de l'accroche. | `006/hook_01.jpg`, `hook_03.jpg` |
| 4,3 → 10,6 s | B + C en trois phrases, 6,3 s ; **le C finit à 10,59 s**, au-delà de la règle des 10 s. Marginal. | script 006 |
| 10,6 → 24 s | Très bon : « il tremble » (fait surprenant), les barres « −10 % par minute » contre « 15 min » (le spectateur fait le calcul lui-même), « Toi : la boîte ». Trois relances en 13 s. | `006/film_02.jpg`, `film_03.jpg` |
| 24 → 31 s | L'autopsie se fait **chrono en marche** (T+1:11 → T+1:50, chances 88 → 82 %). C'est la meilleure idée de structure des six films : l'acte 2 ne suspend plus la tension. | `006/film_04.jpg` |
| **31,7 → 36,2 s** | **« Chaque jour, depuis des années, elle se teste toute seule. Voyant vert : prête. »** 4,5 s sur le boîtier refermé et un compteur de jours. Ce n'est pas le mécanisme du choc, c'est un fait annexe ; l'histoire ne perd rien si on l'enlève (« …une puce qui écoute. » → « Tu colles les électrodes. Elle parle… » s'enchaîne mieux). C'est le creux du film. | `006/film_05.jpg` ligne 1, `quad.png` (image 3) |
| 44,0 → 46,8 s | Trois chiffres en 2,8 s (150 J, 1 000 V, 10 ms). Seul « 10 ms » a son image (le compteur du choc) ; 150 J a été montré juste avant (le condensateur qui charge). « Plus de mille volts » n'a pas d'image. À garder : c'est un roulement de tambour. | `006/film_06.jpg` |
| 51,8 → 61,0 s | **La chute redit la phrase d'avant.** `repart` : « Et le cœur repart. **Tout seul.** » ; six secondes plus tard, `chute` : « …Pour qu'il redémarre… **de lui-même**. » Le retournement est lâché en deux mots, en passant, puis ré-expliqué en 5,4 s. Dans 002, 003, 005 le dernier membre de la chute est une information neuve. | `episode.json` 006, lignes 63-66 |
| 61,9 → 64,8 s | « Un cœur qui bat ? Elle refuse. Tu ne peux blesser personne. » Paie le B et le teaser du 005 (« tu n'oserais jamais t'en servir »). C'est le fait le plus utile du film. À garder. | `006/film_08.jpg` ligne 2 |
| **65,5 → 80,5 s** | **15 s sur un seul plan : le boîtier fermé sur l'établi**, trois panneaux au-dessus. « Like. » est dit seul, suivi d'une pause de 0,8 s. « Le 15, lui, le sait » — la réponse au C — est une étiquette sur un objet immobile, alors que le film possède le plan qui la montrerait (le hall, le chemin vert, 11–13 s). | `006/film_09.jpg`, `film_10.jpg`, `quad.png` (image 4) ; `main.js:390-409` |
| 75,3 → 80,3 s | Le teaser du 007 **donne la réponse** (« une fusée sous le siège ») et ne concerne pas le spectateur. Celui du 005 pour le 006 (« accroché à un mur, sur ton trajet. Et tu n'oserais jamais t'en servir. ») était personnel, paradoxal et ne nommait rien. Sujet non validé par Merwan, faits non vérifiés. | script 006 |
| 80,7 → 85,5 s | La meilleure boucle de la série : « Parce qu'un jour, sur ton trajet… / Quelqu'un s'effondre. Devant toi. » La phrase se termine réellement par l'accroche, dans le même hall. | `006/film_11.jpg` |

### 001 à 004 — en ligne, pour mémoire

- **001** : une seule boucle, parfaite (le C « jamais vu de fumée » est payé par la chute « détecteur de lumière enfermé dans le noir »). Acte 2 long (23,5 s, quatre phrases au repos). Queue la plus courte.
- **002** : `boite` (20,9–27,0 s) **répète A + B** (« elle est dans ton volant… et elle va t'exploser au visage ») : 6 s qui se coupent sans perte, et « on l'ouvre » n'arrive qu'à 27,7 s, le plus tard de la série. En revanche, le like est tressé avec une relance (« Mais seulement si tu es bien assis. Like, pour que… ») et le commentaire paie le C sur l'objet : **la meilleure queue des six**, bien que la plus longue en secondes.
- **003** : le meilleur acte 1 (accroche en 2,5 s, ABC bouclé à 6,4 s, « Alors coupons-les tous », le mystère daté « depuis 1854 » payé par Otis à 58 s). Après 63 s, plus rien n'est dû au spectateur : la question du commentaire est neuve et sa réponse est hors du film.
- **004** : le plus chargé en chiffres (230 V, 150 mA, 30, 16 A, « cinq cents fois », 40 ms, 3 000, 30 mA : huit nombres, dont cinq dans les 20 premières secondes). La chute (« il ne t'a jamais vu ») est la moins contre-intuitive ; le vrai déclic est le verdict qui suit (« le disjoncteur protège tes fils »). Boucle la plus longue (5,6 s).

---

## 3. Le gabarit : signature ou prévisibilité ?

| Formule | Présence | Verdict |
|---|---|---|
| « Alors… on l'ouvre. » | 6/6 (à 16,5 · 27,7 · 20,0 · 25,1 · 23,7 · 24,2 s) | **Signature. On garde.** 1,3 s, c'est le nom du compte en acte, et dans le 006 elle porte un double sens (la porte de la boîte s'ouvre sur « Alors… »). Ce qu'il faut surveiller n'est pas la phrase mais ce qu'elle annonce : si la courbe plie à cet instant dans 001–004, c'est que l'autopsie est vécue comme « le cours commence » — et la réponse est le modèle 006 (chrono qui continue), pas la suppression de la phrase. |
| « Un A. Un B. Et [au centre / derrière / entre les deux / au milieu / autour]… un C. » | 6/6 | **Tic. À casser.** Même rythme, même troisième terme suspendu, et c'est le moment le plus « fiche technique » : on nomme des pièces avant qu'elles aient fait quoi que ce soit. |
| « Zéro. » | 4/6 (002–005) | Petit rituel utile (il relance le chrono). Pas plus de deux épisodes de suite ; le 006 s'en passe très bien. |
| « (Et) voilà le secret : » | 4/6 (002, 003, 005, 006) | Efficace comme drapeau (« écoute »), mais c'est aussi « voici la récompense, après tu peux partir ». Un épisode sur deux. Variantes : commencer par la négation (« Elle ne relance pas un cœur. ») ; ou par la preuve (l'anecdote), puis la loi. |
| « Like… pour celui qui… » | 003, 004, 005 (+ « Like. » seul, 006) | **Usé.** Trois fois la même construction, « Like » en premier mot. |
| « Et dis-moi en commentaire : … » / « La réponse est épinglée. » | 002, 003, 005 / 003, 005 | Usé. « Épinglée » envoie vers les commentaires (bien) mais ne retient pas dans la vidéo. |
| « Abonne-toi : le prochain dossier… » | 5/6 | Formule correcte ; c'est la qualité de l'appât qui varie (§ 2, 006). |
| « En attendant, … » + phrase inachevée | 5/6 | La boucle est une force ; « En attendant » en est l'annonce systématique. Varier l'attaque. |
| Les trois panneaux (grille de 12 points « LA VIDÉO REMONTE », champ de commentaire qui se tape, « PROCHAIN DOSSIER · CLASSÉ »), dans cet ordre | 002, 003, 004, 005, 006 (`002/film_10-11`, `003/film_09`, `004/film_09`, `005/film_09-10`, `006/film_09-10`) | **C'est là que l'abonné de trois épisodes s'en va** : il reconnaît la grille de points, il sait qu'il reste vingt secondes sans histoire. |

Conclusion : le rituel du **début et du milieu** (dossier, HUD, « on l'ouvre », le nom qui s'allume à la chute) fait la marque. Le rituel de **la fin** coûte la complétion, donc les relectures, donc la portée.

---

## 4. Lequel est le mieux écrit

**Sur le papier : le 003.** 231 mots, aucune phrase qui en répète une autre, accroche en 2,5 s, deux boucles posées et payées toutes les deux (« pas un câble » → le parachute ; « depuis 1854 » → Otis), une expérience de pensée qui relance (« Alors coupons-les tous »), et une chute bâtie sur une expression que tout le monde a en bouche (« ne tient pas à un fil »). Son défaut est ailleurs (voix criée) et dans sa queue (25 s sans rien de dû).

**Comme film : le 006**, et c'est lui qui a le plus haut plafond. Quelqu'un, un danger, un compteur qui baisse et ne s'arrête jamais (même pendant l'autopsie), un « toi » qui agit à chaque acte, la chute la plus contre-intuitive et la plus vraie, la boucle la mieux raccordée. Deux phrases l'empêchent d'être le mieux écrit : « Tout seul. » et « Chaque jour, depuis des années… ».

Classement d'écriture : 003 > 006 > 001 > 002 > 004 > 005. Le 005 est dernier parce que c'est le seul où il n'y a ni personne ni danger entre la 10ᵉ et la 66ᵉ seconde.

---

## 5. 005 — édition ligne à ligne

Légende : **G** = gratuit (0 crédit) · **RV** = reprise de voix (accord de Merwan).

| Beat | Actuel | Proposé | Type | Pourquoi |
|---|---|---|---|---|
| `accroche` | « Panne de courant. Et c'est toi qui es aux commandes d'un réacteur nucléaire. » | texte inchangé. **Image refaite** (voir 5.1). | G | la première image doit montrer la panne |
| `promesse` | « Ne touche à rien : il s'arrête tout seul, en deux secondes. Et ce qui l'arrête… c'est la panne. » | inchangé | — | |
| `coeur` | « Dans la cuve : près de trois mille mégawatts. Chaque atome qui se brise… » | texte inchangé ; l'étiquette « ≈ 3 000 MW » gagne une ligne d'échelle : « plus d'un million de bouilloires » (ordre de grandeur : 2 785 MW ÷ 2 kW ≈ 1,4 million ; à noter dans `sources`) | G | un chiffre sans image ni comparaison |
| `barres` | « Des barres savent avaler ces neutrons. Elles attendent, suspendues juste au-dessus. » | inchangé | — | |
| `boite` | « Toute la question, c'est ce qui les retient. » | `text` : « Mais sans courant… qui les fait *descendre* ? Regarde plutôt ce qui les +retient+. » · `vo` : « [curious] Mais sans courant... qui les fait descendre ? [short pause] [serious] Regarde plutôt ce qui les retient. » | **RV** (+≈ 1,8 s) | plante l'idée reçue que la chute retourne ; remplace une ligne mesurée plate ; laisse 1,8 s de plus au vol vers la bobine |
| `ouvre`, `eclate`, `repos`, `zero`, `lache`, `mille` | — | inchangés | — | |
| `deux` | « Deux secondes. Elles sont au fond. La réaction en chaîne est arrêtée. » | `text` : « [2 s\|Deux secondes]. Elles sont au fond. La réaction en chaîne est +arrêtée+. Et toi, tu n'as touché à +rien+. » · `vo` : « [calm] Deux secondes. Elles sont au fond. [short pause] La réaction en chaîne est arrêtée. [short pause] [firm, matter-of-fact] Et toi, tu n'as touché à rien. » | **RV** (+≈ 1,6 s) | ramène « toi » au climax et **paie le B** mot pour mot (« Ne touche à rien ») |
| `hache` | après la chute (57,8–65,0 s) | **déplacé avant la chute** (≈ 51,4–58,6 s), texte inchangé | G | l'anecdote devient la preuve, la chute devient la loi (voir 5.2) |
| `chute` | 51,4–57,0 s | ≈ 59,7–65,2 s (hors allongement des reprises), texte inchangé | G | la chute redevient la dernière chose avant les CTA |
| `like` | « Like, pour celui qui imagine encore un gros bouton rouge. » | inchangé (2,6 s, court) — sert de **témoin** pour comparer au 006 où « Like » n'est plus en tête | — | |
| `comment` | « Et dis-moi en commentaire : une fois arrêté, il chauffe encore combien de temps ? La réponse est épinglée. » | texte inchangé ; `hold` 0,6 → 0,3 ; **image : retour à la cuve** (barres vertes au fond, une lueur rouge sombre qui respire encore au cœur) au lieu de l'établi | G | la question se voit ; la queue change de lieu |
| `abo` | « Abonne-toi : le prochain dossier est accroché à un mur, sur ton trajet. Et tu n'oserais jamais t'en servir. » | inchangé — le meilleur teaser de la série. Image possible : derrière le panneau « classé », la lueur verte au mur du hall du 006 (`episodes/006-defibrillateur/src/hall.js`), floue | G | la dernière image d'un dossier annonce la première du suivant |
| `boucle` | « …il suffit d'une… » (retombe dans les trois prises) | `vo` terminé par une virgule : « …il suffit d'une, » | **RV** (86 crédits déjà annoncés) | la virgule a tenu la voix en l'air dans les trois prises du 006 |
| légende | « Tu imaginais un gros bouton rouge ? Pour arrêter un réacteur nucléaire, il suffit d'arrêter de le retenir. Et une fois arrêté… » | « Plus de courant, et un réacteur de 3 000 mégawatts à arrêter. Tu as deux secondes, et rien à faire. Une fois arrêté, il chauffe encore combien de temps, à ton avis ? » | G | ne vend plus la chute ; garde « réacteur », « courant » pour la recherche |

Coût voix 005 : `boite` + `deux` (+ `boucle` déjà en attente). Avec `--count 2`, de l'ordre de 130 à 200 crédits pour les trois ; solde 26 266.
Durée après modifications : ≈ 88 s (84,8 + 1,8 + 1,6 − 0,3).

### 5.1 La première image du 005 (gratuit, `src/main.js:157-168`, `index.html`)

But : la panne **arrive** à l'image dans la première demi-seconde, et l'horloge promet les deux secondes.

```
0,00 s   cadre actuel, mais l'étiquette « BOBINES · SOUS TENSION » est déjà là (elle n'entre aujourd'hui qu'à 7,75 s)
         HUD : « T+0,0 s » en signal + sous-ligne « PUISSANCE 100 % » (à la place du « 100 % » nu)
0,28 s   sur « Panne » : la ligne pointillée verte qui arrive par la droite (l'alimentation, déjà dans le cadre)
         s'éteint de droite à gauche en 0,25 s — tirets veille → signal → noir —
         et S'ARRÊTE à un doigt de la couronne. Le temps se fige là (glyphe « ‖ » à côté du chrono).
0,3–4,3  au lieu du glissement d'azimut : avancer de d: POSE0.d → POSE0.d × 0,8 vers la couronne (sine.inOut),
         le front de panne figé reste dans le cadre
36,47 s  « Zéro. Le courant tombe. » : le front parcourt le dernier centimètre, la couronne s'éteint, le chrono repart (T+0,0 → T+2,0 s)
```

Tout le film se passe alors à l'intérieur des deux secondes promises : c'est le « temps réel » de la série, et le chrono figé est une promesse visible pendant 36 s. Option : un personnage de verre (`kit/lib/figure.js`) au pied de la cuve donne un corps à « toi » et une taille au réacteur (13 m contre 1,8 m).

### 5.2 Hache avant chute (gratuit, `episode.json` + `src/main.js:290-322`)

Dans `episode.json` : déplacer l'objet `hache` avant l'objet `chute`. Les repères (`chicago`, `rope`, `axe`, `secret`) suivent tout seuls.

Enchaînement dit : « …La réaction en chaîne est arrêtée. Et toi, tu n'as touché à rien. / Chicago, 1942. Le dernier secours du tout premier réacteur ? Une barre pendue à une corde… et un homme avec une hache. / Voilà le secret : on ne dépense rien pour arrêter un réacteur. On dépense… pour l'empêcher de s'arrêter. / Like, pour celui qui imagine encore un gros bouton rouge. »

Dans `main.js` :

```
shot(t.deux - 0.15, 1.6, …)                       // inchangé (ligne 290)
cut(toChicago = t.hache - 0.14, IN_CHICAGO, …)     // vient juste après « arrêtée » : la cuve verte ne tient plus 10 s
  // entrée plus serrée : d ≈ 4200 au lieu de 7000, la corde en signal dès la première image
  //   (aujourd'hui 4 s de plan large où rien ne se lit à 270 px)
shot(t.barre - 0.2, …) ; shot(t.homme - 0.35, …)   // inchangés (lignes 311-312)
cut(t.chute - 0.12, IN_REACTOR, ASIDE, { état de T+2,0 s : heat 0, barres vertes au fond })
  // le titre « POUR L'ARRÊTER, IL FAUT : DU COURANT → RIEN » et brandHud comme aujourd'hui
cut(toCta = t.like - 0.14, BENCH, …)               // inchangé
```

Effet mesurable : fin de chute → dernière image passe de **27,9 s (32,8 %) à ≈ 19,6 s (≈ 22 %)** sans retirer un mot, et le plan fixe de 10 s (47–57 s) est coupé en deux par Chicago.

---

## 6. 006 — édition ligne à ligne

| Beat | Actuel | Proposé | Type | Pourquoi |
|---|---|---|---|---|
| `accroche` | « Quelqu'un s'effondre. Devant toi, son cœur ne pompe plus. » | texte inchangé (la reprise à 68 crédits attend l'oreille de Merwan) | — | |
| `promesse` | trois phrases, `hold` 0,5 | texte inchangé ; `hold` 0,5 → 0,25 | G | le C finit à 10,59 s : au moins ne pas rallonger derrière |
| `tremble`, `compte`, `chaine`, `ouvre`, `eclate` | — | inchangés | — | le meilleur premier acte après le 003 |
| `repos` | « Chaque jour, depuis des années, elle se teste toute seule. Voyant vert : prête. » (31,7–36,2 s) | **supprimer le beat** (−5,3 s). Le fait passe en tête du commentaire épinglé : « Elle se teste toute seule, chaque jour, pendant des années : voyant vert, elle est prête. » (la légende le dit déjà) | G | digression sur image fixe au creux du film ; « …une puce qui écoute. / Tu colles les électrodes. Elle parle… » raccorde mieux |
| | | *variante si Merwan tient au fait* : garder la phrase, la **remettre dans le hall** — la boîte au mur, les passants en traînées, le compteur de jours — c'est « tu passes devant sans la regarder » | G (effort M) | la phrase parle alors du spectateur, et le plan suivant est dans le même lieu |
| `colle`, `analyse`, `choc`, `eteint` | — | inchangés | — | |
| `repart` | « Silence… Et le cœur repart. **Tout seul.** » | `text` : « Silence… Et le cœur +repart+. » · `vo` : « [calm] Silence. [short pause] Et le cœur repart. » · `hold` 0,8 → 1,0 | **RV** (−0,9 s) | le spectateur croit une seconde que le choc l'a relancé : la chute retourne une croyance qu'on vient de lui laisser |
| `chute` | « Voilà le secret : elle ne relance pas un cœur. Elle l'arrête. Pour qu'il redémarre… de lui-même. » | inchangé | — | « de lui-même » redevient neuf |
| `refuse` | « Un cœur qui bat ? Elle refuse. Tu ne peux blesser personne. » | texte inchangé ; `hold` 0,4 → 0,2 | G | |
| `like` | « **Like.** [pause] Sept fois sur dix, il y a un témoin. Autant qu'il ait vu ça. » | `text` : « [7 fois sur 10\|Sept fois sur dix], il y a un témoin. +Like+ : autant qu'il ait vu ça. » · `vo` : « [serious] Sept fois sur dix, il y a un témoin. [short pause] Like : autant qu'il ait vu ça. » | **RV** (−≈ 0,8 s) | le fait d'abord, le mot « Like » au milieu : plus de sonnerie de sortie. Les repères son `like:sept`, `like:il`, `like:témoin`, `like:vu` restent valables |
| ordre de la queue | `refuse` → `like` → `comment` → `abo` → `boucle` | `refuse` → `like` → **`abo`** → **`comment`** → `boucle` | G | « abonne-toi » est entendu 5 s plus tôt ; les 9 dernières secondes sont **la réponse au C puis la boucle**, toutes deux dans le hall. « …Le 15, lui, le sait. / En attendant, demain, repère la boîte verte » s'enchaîne mieux qu'après le teaser de l'avion |
| `comment` | texte inchangé ; image : établi | **image dans le hall**, pose `WHERE` (`main.js:185`) : étiquette « ELLE EST OÙ › ? », et sur le repère `known` le chemin vert se trace jusqu'à la boîte, l'étiquette devient « LE 15 TE DIT OÙ ». Le champ de commentaire reste en zone haute. `hold` 0,5 → 0,25 | G | la réponse au C est montrée par le plan qui a posé la question (11–13 s) |
| `like` (image) | établi | le hall en plan large : les passants sont « les témoins », la grille de 12 points au-dessus | G | un lieu par CTA, tirés de l'histoire |
| `abo` | « …te sort d'un avion en une demi-seconde. Avec une fusée sous le siège. » | à récrire **quand le 007 est validé** : un enjeu pour « toi » + un paradoxe, sans nommer l'objet, ≤ 14 mots. Gabarit : « Abonne-toi : dans le prochain dossier, [ce qui devrait te tuer] … et c'est ce qui te sauve. » | **RV** + décision | le teaser actuel donne la réponse et ne concerne pas le spectateur |
| `boucle` | « En attendant, demain, repère la boîte verte. Parce qu'un jour, sur ton trajet, » | inchangé | — | la meilleure boucle de la série |

Durée après modifications gratuites : ≈ 79,7 s (85,5 − 5,3 − 0,5). Avec les deux reprises : ≈ 78 s. Coût voix : `repart` + `like` ≈ 130–180 crédits à 2 ou 3 prises ; `abo` en plus quand le 007 est choisi.

### 6.1 Ce qu'implique la suppression de `repos` (`episode.json`, `src/main.js:285-295`)

- Retirer le beat, les repères `close` (« repos-0.15 ») et `ready` (« repos:prête »), et les sons qui les citent (`episode.json` lignes 148-150, et l'entrée `["close", 0.5]` de la courbe du drone).
- Retirer les deux `shot` de `main.js:285` et `:289`, le panneau « AUTOTEST · 1 460 JOURS » ; `toHall` suit directement la fin d'`eclate`.
- Recaler le chrono de l'en-tête : il saute aujourd'hui de T+1:50 à T+2:26 pendant cette phrase ; le faire courir de T+1:11 à T+2:26 sur `eclate` seul (ou arriver à T+2:10 — le choc reste à T+2:50, les chances à 72 %).
- Réversible sans crédit : la prise reste sur le disque.

### 6.2 Deux invitations muettes (gratuit, `kit/lib/overlay.js` : `rail`)

- **Like** : les chevrons `rail-like` passent une fois, 1,2 s, sur le premier battement vert (repère `beat`, 53,2 s) — c'est l'instant où le spectateur a envie d'aimer, douze secondes avant qu'on le lui demande.
- **Abonnement** : les chevrons `rail-follow` passent une fois quand le nom du compte s'allume (`brandHud`, repère `secret`, 58,6 s).

Aucun mot, aucune imitation d'interface. Si la courbe confirme que la queue tue, c'est ce qui permettra plus tard de raccourcir les phrases dites.

---

## 7. Structure recommandée pour le 007 et les suivants

Cible : **70 à 76 s** (au-dessus du plancher de 60 s, 10 à 15 s sous la moyenne actuelle), **acte 3 ≥ 25 % du film**, **fin de chute → dernière image ≤ 18 s et ≤ 24 %**.

| # | Beat | Fenêtre | Durée | Fonction, et ce qui change |
|---|---|---|---|---|
| 1 | **A** | 0 → 3,5 s | ≤ 12 mots | Une image **où quelque chose change d'état avant 0,5 s** et qui montre ce que dit la phrase. Chrono et compteur libellés dès l'image 1. |
| 2 | **B + C** | 3,5 → 9,5 s | 2 phrases | B = ce que le spectateur y gagne. C = **une question personnelle, binaire, que le film peut montrer sur l'objet** (modèle 002 : « tes mains »). Fini avant 10 s, mesuré. |
| 3 | **Menace** | 9,5 → 19 s | 3 phrases | Ce qui arrive si rien n'agit ; le compte à rebours démarre. **Un nombre par phrase au plus**, chacun avec sa jauge ou sa comparaison. L'**idée reçue** que la chute retournera est mise dans la bouche du spectateur ici (« Tu crois que… »). |
| 4 | « Alors… on l'ouvre. » | 19 → 21 s | 1,3 s | Signature. Le chrono **continue** (modèle 006). |
| 5 | **Autopsie** | 21 → 31 s | 10 s max | Plus d'inventaire « un A, un B, et un C » : **le cœur seul est nommé**, les autres pièces sont nommées par ce qu'elles font, au moment où elles le font. Le repos se dit dans le même souffle (« tant que… »). Une phrase à la 2ᵉ personne. |
| 6 | **Réponse** | 31 → 51 s | **≈ 20 s** | L'acte le plus long. Le déclenchement, 4 à 5 phrases, **« tu » dans deux d'entre elles**. La phrase de résultat **ne dit pas** le dernier membre de la chute. Chevrons « like » muets sur le pic. |
| 7 | **Chute** | 51 → 57 s | ≤ 6 s | Négation de l'idée reçue + affirmation, dernier membre neuf. Si une anecdote historique existe, elle passe **avant**, comme preuve. Nom du compte allumé + chevrons « abonnement » muets. |
| 8 | **Coda utile** | 57 → 60 s | 1 phrase | Paie le B (ce que tu peux faire, ou ne peux pas rater). Tressée avec une relance (modèle 002 : « Mais seulement si… »). |
| 9 | **Abonnement** | 60 → 64 s | ≤ 14 mots | Le prochain dossier : enjeu pour « toi » + paradoxe, sans nommer l'objet. Placé tôt : c'est le CTA qui compte pour l'objectif, il doit être entendu par le plus de monde possible. |
| 10 | **Like** | 64 → 66,5 s | ≤ 10 mots | Le fait d'abord, « like » au milieu de la phrase. Jamais en premier mot, jamais suivi d'une pause. |
| 11 | **Commentaire = réponse au C** | 66,5 → 71 s | 2 phrases | **Du contenu, pas une demande** : la réponse promise depuis la 8ᵉ seconde, démontrée sur l'objet ou dans le lieu de l'histoire. « La réponse est épinglée » : au plus un épisode sur trois, et jamais pour le C. |
| 12 | **Boucle** | 71 → 74,5 s | 1 phrase | Inachevée, virgule dans `vo`, finit par les premiers mots de l'accroche. Dans le lieu de la première image. |

Règles d'écriture qui vont avec :

1. **« Toi » dans chaque acte** : pas plus de 15 s sans 2ᵉ personne. (005 : 59 s.)
2. **Deux boucles, pas une** : le mystère du mécanisme (payé par l'acte 3 et la chute) et la question personnelle du C (payée en dernier). Le C est rappelé une fois à l'image au moment de la coda (une étiquette suffit : « TES MAINS ? »), pour que le spectateur sache qu'on lui doit encore quelque chose.
3. **La chute retourne une croyance que le film a nommée ou laissé naître**, pas une croyance supposée.
4. **Six nombres au plus par film**, jamais trois dans la même phrase hors climax.
5. **Une phrase qui répète l'accroche se coupe** (002 `boite`, 006 fin de `tremble`).
6. **Un lieu par CTA**, pris dans l'histoire ; jamais plus de 6 s sur l'objet posé sur l'établi après la chute.
7. **Les formules de fin ne se répètent pas deux épisodes de suite** (tableau § 3). Tenir la liste des attaques déjà utilisées dans CLAUDE.md, section « Dossiers ».
8. **Le teaser ne nomme pas l'objet et parle de « toi »** (modèle : celui du 005 pour le 006).
9. **La légende ne dit jamais la chute.**
10. Une idée à tester sur un épisode : un quatrième libellé d'acte dans l'en-tête, « 04 ET TOI », qui s'allume à la coda — il dit sans un mot que le film n'est pas fini et que la suite concerne le spectateur. Zéro panneau en plus.

---

## 8. Un garde-fou dans `npm run script` (`scripts/sd.mjs:101-139`)

La commande affiche déjà le minutage et les repères. Lui faire afficher un bloc « RÉCIT », avec des avertissements :

```
fin du C (fin du beat `promesse`)                > 10,0 s            → avertissement
« on l'ouvre »                                   > 24 s              → avertissement
acte 3 (premier beat après le repos → `chute`)   < 22 % du film      → avertissement
fin de `chute` → fin du film                     > 18 s ou > 24 %    → avertissement
bloc like+comment+abo+boucle  >  acte 3                               → avertissement
plus de 15 s sans tu / toi / te / ton / ta / tes (hors balises)      → avertissement, avec la plage
nombres dits (jetons [chiffre|…] + numéraux)     > 6, ou ≥ 3 dans un beat → avertissement
premier mot dit d'un beat ∈ { Like, Abonne-toi } ou beat commençant par « Et dis-moi en commentaire » → avertissement
ouverture de beat (3 premiers mots) identique à celle d'un beat du même id dans l'épisode précédent → avertissement
`post.caption` partage ≥ 5 mots consécutifs avec le beat `chute`      → avertissement
```

Il faut pour cela trois identifiants de beat stables d'un épisode à l'autre (`promesse`, `chute`, `boucle` le sont déjà ; `ouvre` aussi) et un champ facultatif `act3` dans `episode.json` nommant le beat qui déclenche (`zero`, `colle`, `fumee`). Appliqué aux six scripts actuels, ce bloc aurait signalé : le C du 006 (10,59 s), « on l'ouvre » des 002, 004 et 006, la queue des six, les 59 s sans « tu » du 005, les nombres du 004, « Like » en tête des 003 à 006, et la légende du 005.

---

## 9. Ce qu'il faut demander à Merwan

### 9.1 Les chiffres (avant de publier le 005)

Pour 001, 002, 003, 004 — capture de la courbe de rétention, et le pourcentage de spectateurs encore là à :

| Point | 001 | 002 | 003 | 004 |
|---|---|---|---|---|
| 3 s | 3,0 | 3,0 | 3,0 | 3,0 |
| fin du C | 15,9 | 9,0 | 6,4 | 9,3 |
| « on l'ouvre » | 16,5 | 27,7 | 20,0 | 25,1 |
| déclenchement | 40,0 | 45,5 | 36,5 | 37,8 |
| fin de la chute | 60,0 | 68,5 | 57,1 | 58,4 |
| mot « like » | ≈ 62,3 | 76,0 | 64,4 | 64,3 |
| dernière seconde | 78 | 93 | 81 | 85 |

Plus : vues, durée moyenne, % de vues complètes, abonnés gagnés par vidéo (→ abonnés pour 1 000 vues).

Ce qu'on en tire :

- **Survie de la queue** = % à la dernière seconde ÷ % à la fin de la chute. Sous 60 % : la restructuration du § 7 s'impose, et le 006 part avec sa queue réordonnée. Au-dessus de 75 % : la queue tient, on garde les trois CTA dits et on ne touche qu'à l'ordre.
- **Marche à « on l'ouvre »** : si la courbe perd plus de 5 points en 3 s à cet instant, l'autopsie est vécue comme un cours → modèle 006 obligatoire (chrono en marche), autopsie ≤ 10 s.
- **3 s et fin du C** : compare l'accroche criée du 003 à celle du 004 (déjà noté dans CLAUDE.md).
- **Abonnés pour 1 000 vues** : compare les teasers (« un câble casse et il ne se passe rien » dans le 002, « trente milliampères » dans le 003).

### 9.2 Les décisions

1. La règle « trois CTA après la chute, chacun avec sa phrase » : la garder telle quelle, ou accepter l'ordre abonnement → like → commentaire (réponse au C) → boucle, et des invitations muettes plus tôt.
2. 006 : supprimer « Chaque jour, depuis des années… » ou la remettre en scène dans le hall.
3. Le sujet du 007, puis son teaser.
4. Les reprises de voix : 005 `boite`, `deux`, `boucle` ; 006 `repart`, `like`, puis `abo`.
5. Publier 005 et 006 comme un test : 005 avec « Like » en tête de phrase et la queue sur l'établi revue a minima, 006 avec « Like » au milieu et la queue dans le hall — puis comparer la survie de la queue des deux.

---

## 10. Ordre d'exécution conseillé

1. Demander les chiffres (§ 9.1).
2. 005 gratuit : première image (§ 5.1), `hache` avant `chute` (§ 5.2), légende, image du commentaire.
3. 006 gratuit : `repos` supprimé (ou remis en scène), queue réordonnée et remise dans le hall, `hold` réduits, invitations muettes.
4. Annoncer à Merwan le coût des reprises (005 : `boite`, `deux`, `boucle` ; 006 : `repart`, `like`), attendre son accord, enregistrer, repasser la mise en scène des phrases touchées.
5. Garde-fou « RÉCIT » dans `npm run script`, puis écrire le 007 dans la structure du § 7.

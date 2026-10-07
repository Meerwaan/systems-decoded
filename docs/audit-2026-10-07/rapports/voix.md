# Audit « voix » — 004, 005, 006 (à la mesure, pas à l'oreille)

Sources : `mesures_004-006.txt` (par phrase), `prises.txt` (les 3 prises + balises + pauses), `simule.txt` (resserrage simulé), `hook.txt` et `voixbed.txt` (voix contre fond), planches `gaps_005_0N.jpg` / `gaps_006_0N.jpg` (4 images par silence > 0,6 s, regardées). Tout est dans ce dossier. Aucun crédit dépensé, rien modifié dans le dépôt.

Limite : je mesure, je n'entends pas. Tout ce qui touche au jeu reste à confirmer par Merwan dans la cabine.

---

## 1. Propositions précises

### A. Resserrage gratuit des silences (hold, tail) — `needs: rien`

Constat chiffré : 22 à 23 % de la piste voix est du silence (004 : 19,9 s ; 005 : 18,6 s ; 006 : 19,6 s), dont 11 à 12,5 s **entre** phrases. Médiane d'un silence entre phrases : 0,73 s (0,61 s sur le 002). 4 à 4,3 s viennent des `hold` écrits à la main.

Regardé image par image (4 vignettes par silence) : la moitié des `hold` tombent sur un plan **fixe** où il ne se passe plus rien — et sur trois d'entre eux le sous-titre a déjà disparu, il reste une image sans texte ni voix.

**006 — `episodes/006-defibrillateur/episode.json`** (85,5 s → 82,87 s, −2,63 s ; avec `tail`, −2,83 s)

| beat (ligne) | hold actuel → proposé | silence acoustique avant → après | ce que montre l'image pendant le silence |
| --- | --- | --- | --- |
| promesse (l.41) | 0,5 → **0,2** | 0,85 → 0,55 | la plongée du hall vers la poitrine (10,54 → 11,73 s) : mouvement, mais 1,1 s sans voix pile à la 10ᵉ seconde. À garder court. |
| ouvre (l.49) | 0,5 → **0,2** | 0,86 → 0,56 | la boîte s'ouvre (25,44 → 26,54) : sert l'image, 0,56 s suffit |
| eclate (l.51) | 0,3 → **0** | 0,61 → 0,31 | « qui écoute » : 3 vignettes identiques (30,90 / 31,21 / 31,46) — temps mort |
| repos (l.53) | 0,3 → **0** | 0,60 → 0,30 | « prête » : boîte fermée fixe (36,16 → 36,77) — temps mort |
| choc (l.59) | 0,3 (gardé) | 0,56 | le compteur du choc tourne (4,8 → 6,2 ms) : sert l'image |
| eteint (l.61) | 0,3 (gardé) | 0,71 | le tracé s'aplatit : sert l'image |
| repart (l.63) | 0,8 → **0,5** | 1,15 → 0,85 | « tout seul » : cœur vert fixe, tracé normal, 3 vignettes quasi identiques (54,34 → 55,24). Le plus long silence du film ; 0,85 s reste le plus long. |
| chute (l.65) | 0,4 → **0,2** | 0,73 → 0,53 | titre « arrête le chaos », le cœur s'allume à 61,61 : garder un peu |
| refuse (l.67) | 0,4 → **0,1** | 0,64 → 0,34 | « blesser personne » : 3 vignettes identiques (64,74 → 65,48) — temps mort avant le CTA |
| comment (l.71) | 0,5 → **0,15** | 0,82 → 0,47 | « lui le sait », puis à 74,99 une image **sans sous-titre ni panneau** — temps mort |

**005 — `episodes/005-arret-urgence/episode.json`** (84,8 s → 82,07 s, −2,73 s ; avec `tail`, −2,93 s)

| beat (ligne) | hold actuel → proposé | silence acoustique avant → après | image pendant le silence |
| --- | --- | --- | --- |
| ouvre (l.48) | 0,5 → **0,2** | 0,89 → 0,59 | la bobine se soulève (24,76 → 25,90) : sert l'image |
| eclate (l.50) | 0,3 → **0** | 0,71 → 0,41 | « une bobine » : 3 vignettes identiques (30,22 → 30,80) |
| repos (l.52) | 0,3 → **0,1** | 0,63 → 0,43 | champ fixe « en l'air » (35,58 → 36,19), la jauge ne bouge qu'à « Zéro » |
| zero (l.54) | 0,3 → **0** | 0,59 → 0,29 | « le courant tombe » : 3 vignettes identiques (37,88 → 38,40) |
| lache (l.56) | 0,3 → **0,2** | 0,55 → 0,45 | la tige tombe (41,62 → 42,17) : sert l'image |
| mille (l.58) | 0,3 (gardé) | 0,55 | le vert descend dans le cœur |
| deux (l.60) | 0,6 → **0,3** | 0,87 → 0,57 | recul sur la cuve ; à 51,10 plus de sous-titre |
| chute (l.62) | 0,4 → **0,15** | 0,77 → 0,52 | titre « RIEN » fixe ; à 57,54 plus de sous-titre |
| hache (l.64) | 0,4 → **0,15** | 0,60 → 0,35 | l'homme à la hache : 3 vignettes identiques (64,98 → 65,72) |
| comment (l.68) | 0,6 → **0,15** | 0,94 → 0,49 | « est épinglée », puis à 74,37 image sans texte |

**Les deux films : `tail` 0,45 → 0,25** (l.7). Le silence de boucle (dernier mot → premier mot au rebouclage) est de 0,97 s (005) et 1,13 s (006) : c'est l'endroit exact où le pouce part. Avec hold + tail : ≈ 0,5 s (005) et ≈ 0,65 s (006). `lead` reste à 0,2 (premier mot à 0,28 s : bon).

Résultat : débit film 169 → 174–175 mots/min, silences 22 % → ≈ 19 %, sans toucher un mot. Les deux films restent > 80 s.

Ce que ça coûte en image : les repères sont écrits contre le script, donc tout se recale ; mais les `shot(at, durée, …)` à durée fixe posés dans un silence raccourci doivent être revus aux dix frontières (un `look` par frontière : `beat$` et `beat_suivant+0.05`), et « un titre a fini de sortir avant la coupe » se revérifie sur `chute → hache` (005) et `chute → refuse` (006). Puis `render --draft` + `qa`. Effort M par film.

### B. Reprises, classées (crédits = accord de Merwan)

Coûts estimés par `simule.txt` (caractères × 0,135, phrase reprise avec ses voisines), pour **2 reprises** chacune.

| rang | film · phrase | mesuré | nouvelle ligne `vo` | coût (×2) |
| --- | --- | --- | --- | --- |
| 1 | **006 · accroche** | 3 prises sur 3 : −2,0 à −2,8 dt, −2,0 à −2,6 dB, 3,9 syll/s articulées (film : 4,9). C'est la phrase la plus lente du film et la 2ᵉ plus faible (−2,8 dB monté), et elle l'ouvre. 0,96 s de silence interne sur 3,44 s (28 %). 004 ouvrait à +0,1 dB / +0,4 dt, 005 à +0,8 dB. | Déjà écrites (l.39-40), à lancer telles quelles : `[firm, matter-of-fact] Quelqu'un s'effondre. Devant toi : son cœur ne pompe plus.` et `[tense] Quelqu'un s'effondre, devant toi. Son cœur ne pompe plus.` — `--retake accroche --count 2` | ≈ 68 |
| 2 | **005 · boucle** | « fin qui retombe » dans les 3 prises (fin −5,3 dt sur la montée). La boucle est sacrée, et la virgule finale a tenu 3/3 sur le 006. | `[calm] En attendant, retiens ça : pour arrêter un réacteur, il suffit d'une,` (le `text` garde « … ») | ≈ 57 |
| 3 | **005 · like** | « pause non jouée » ×3 (0,08–0,10 s après « Like »), 2,56 s pour 10 mots. Sur le 006, `Like. [short pause]` : pause tenue 3/3 (0,30–0,32 s). | `[serious] Like. [short pause] Pour celui qui imagine encore un gros bouton rouge.` | ≈ 90 (à faire annoncer par `npm run voice`) |
| 4 | **005 · boite** | `[low, grave voice]` sur 8 mots : −4,0 à −4,3 dt, variation 0,9–1,8 (film : 3,9), 6,4–7,2 syll/s. Plate **et** pressée : c'est la phrase-pivot avant « on l'ouvre ». | `[curious] Toute la question... c'est ce qui les retient.` (mesuré sur 9 phrases `[curious]` : +1,0 dt, variation 4,3) | ≈ 48 |
| 5 | **005 · chute** | la phrase la plus rapide du film (7,1 syll/s articulées, film 5,3) et parmi les moins modulées (2,7) : la chute est dite en courant. | `[firm, matter-of-fact] Voilà le secret : on ne dépense rien pour arrêter un réacteur. [short pause] On dépense... pour l'empêcher de s'arrêter.` | ≈ 111 |
| 6 | **006 · chute** | variation 2,1–2,3 dans les 3 prises : la phrase longue la moins modulée du film (médiane 3,6). Débit correct (5,9). | `[firm, matter-of-fact] Voilà le secret : elle ne relance pas un cœur. [short pause] Elle l'arrête. Pour qu'il redémarre... de lui-même.` | ≈ 87 |

Recommandation : **rangs 1 + 2 + 3 ≈ 215 crédits** (moins d'une prise complète, solde 26 266). Les rangs 4 à 6 seulement si, à l'écoute, Merwan trouve ces phrases ternes : `[low, grave voice]` sur une chute longue est noté « tient » dans le CLAUDE.md, la mesure dit « peu modulé », pas « raté ».

Non proposé en reprise : 005 `comment` (7,1 syll/s) et `abo` (7,0) — rapides, mais bien notés (4,5) et sans drapeau ; 006 `repart` (−4,9 dB brut, −3,1 monté) — bas mais c'est « Silence. » : un `ride` suffit (voir D).

### C. Direction à partir du 007 — `needs: rien` (règles)

1. **Accroche : jamais trois phrases closes de moins de 5 mots sous `[tense]`.** Mesuré sur 36 phrases `[tense]` : phrases courtes → −1,4 dt ; phrases longues → +0,3 dt. Sous `[firm, matter-of-fact]` c'est l'inverse : courtes +1,0 dt. Donc : A en une phrase d'au moins 8 mots avec une virgule sous `[tense]`, ou en phrases courtes sous `[firm, matter-of-fact]`. Cible à contrôler après la séance : niveau ≥ 0 dB, registre ≥ −1 dt, ≥ 4,5 syll/s.
2. **Le tableau des pauses est faux sur un point** : `[short pause]` ne fait pas « environ 0,8 s » mais **0,36 s en moyenne** (54 mesures, 0,25 à 0,63). Il reste le seul fiable (0 raté sur 54). `...` : 24 ratés sur 75 ; `:` : 26 sur 78 ; **virgule : 84 sur 93 non jouées**. Une virgule ne fait jamais une pause ; une pause qui doit durer plus de 0,5 s se fait au montage (`hold`), pas à la voix.
3. **Le contraste de registre s'aplatit de film en film** : écart-type des registres par phrase 2,61 (003) → 2,25 (004) → 1,70 (005) → **1,22 (006)**. En supprimant le cri on a aussi supprimé les hauts : le 006 tient dans 4,5 dt (−3,1 à +1,4). Remonter par le haut sans crier : `[curious]` (+1,0 dt, variation 4,3, +1,3 dB) et `[thoughtful]` (+1,2 dt) sur 4 phrases par film, pas seulement sur le CTA commentaire — par exemple la question de l'acte 1 et la phrase qui suit « on l'ouvre ». Cible : σ ≥ 2.
4. **`[calm]` sur une phrase de moins de 5 mots sort −2,4 dB et −1,3 dt** (ouvre, zero, repart). Pour « Alors… on l'ouvre », c'est accepté ; ailleurs, `[firm, matter-of-fact]`.
5. **`[low, grave voice]` : une fois par film, sur la chute ou pas du tout.** 15 mesures : −3,5 dt, variation 2,1 (la plus basse hors `[slowly]`), −2,1 dB. Jamais sur une phrase de moins de 12 mots (005 `boite`).
6. **CTA** : `Like. [short pause]` (jamais `Like,` ni `Like...` : 0,08 s dans 6 prises sur 6) ; même gabarit pour `Abonne-toi. [short pause]`. Pas plus de 16 mots par CTA : le 005 dit ses trois CTA à 6,2 / 7,1 / 7,0 syll/s contre 5,3 pour le film.
7. **Budget de temps écrit dans le script** : 240 mots pour 81–82 s (175–178 mots/min), silences ≤ 19 %, aucun `hold` > 0,3 s hors deux moments choisis (après « on l'ouvre », après le climax). Le 003, à 179 mots/min, est le plus dense des six et le seul au-dessus de 175.

### D. Pipeline et mixage — `needs: rien`

1. **`scripts/voice.mjs` (drapeaux, l.225-278) — trois contrôles à ajouter**, tous calculables avec ce qui est déjà mesuré :
   - accroche : niveau < 0 dB **ou** registre < −1,5 dt → « accroche en retrait » (aujourd'hui « pas assez tendu » exige rate < −2,5 et ne s'est levé sur aucune prise montée du 006) ;
   - film : σ des registres < 1,8 → « jeu resserré » ;
   - CTA : syll/s articulées > 1,2 × médiane du film → « CTA pressé » (le seuil actuel `rate > 3`, l.262, n'a rien levé sur le 005 à 7,1).
2. **`scripts/lib/episode.mjs` l.190-191 — autoriser un `hold` négatif borné** : `cursor += cutOut - cutIn + lastHold` l'accepte déjà en théorie, mais il faut vérifier que le montage audio supporte deux tranches qui se chevauchent dans leurs silences, et borner pour garder ≥ 0,25 s acoustique. Gain : les silences naturels longs sans `hold` (005 `barres → boite` 0,57 s sur un plan fixe de la cuve, 20,31 → 20,85 ; 006 `promesse` après retrait du hold). **À vérifier** avant de s'en servir.
3. **`ride` de l'accroche** : si Merwan ne reprend pas l'accroche du 006, la remonter de +2 dB au fader (`vo.ride`, lu l.186) — où ce fader est calculé n'a pas été relu : **à vérifier**. Même chose pour `repart` (+1,5 dB au lieu de +0,5).
4. **006, le second impact couvre « s'effondre »** : `sfx` `impact` à 0,86 s, −10 dB, size 1,3. Fenêtres 0,8–1,2 s : voix −26 / −33 dB, fond −17 / −19 dB (écart −8,7 puis −14,4 dB, `hook.txt`). Au-dessus de 300 Hz l'écart reste +17 dB : un haut-parleur de téléphone ne l'entend pas, des écouteurs oui. Proposition : le caler sur `accroche:s'effondre$+0.05` (≈ 1,21 s, dans le silence de 0,48 s qui suit) ou le baisser à −15 dB. À trancher à l'oreille.
5. **Option non testée : accélérer la voix de 4 %** (`atempo=1.04` dans `voiceBody`, `scripts/lib/ffmpeg.mjs` l.79, en divisant les temps des mots par 1,04 dans `episode.mjs`). Eric articule à 4,9–5,3 syll/s et `speed` est ignoré par `eleven_v4`. Gain ≈ 2,6 s par film. Risque : artefacts, voix « pressée ». À n'essayer que sur un brouillon, et seulement après A. Effort M.

---

## 2. Mesures de référence

| film | durée | mots | mots/min (film) | syll/s articulées | silences / voix | silence médian entre phrases | σ registres |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 001 | 78,8 | 208 | 158 | 5,21 | 29 % | 0,61 | 2,15 |
| 002 | 94,1 | 257 | 164 | 4,98 | 21 % | 0,61 | 2,21 |
| 003 | 82,2 | 245 | 179 | 5,38 | 23 % | 0,78 | 2,61 |
| 004 | 85,7 | 240 | 168 | 5,15 | 23 % | 0,70 | 2,25 |
| 005 | 84,8 | 239 | 169 | 5,29 | 22 % | 0,73 | 1,70 |
| 006 | 85,5 | 241 | 169 | 4,89 | 23 % | 0,73 | 1,22 |

Accroche (phrase A, prise montée) :

| film | durée | mots/s | syll/s art. | registre | niveau | silence interne |
| --- | --- | --- | --- | --- | --- | --- |
| 004 | 5,44 | 3,12 | 4,5 | +0,4 dt | +0,1 dB | 0,48 + 0,44 + 0,51 s |
| 005 | 4,00 | 3,25 | 5,0 | −1,9 dt | +0,8 dB | 0,48 + 0,44 s |
| 006 | 3,44 | 2,62 | 3,9 | −1,8 dt | **−2,8 dB** | 0,48 + 0,48 s |

Fin du C : 9,31 s (004), 9,56 s (005), **10,59 s (006)** — le 006 dépasse la règle des 10 s d'une demi-seconde, et la phrase d'après ne commence qu'à 11,70 s.

Balises (toutes prises 004–006, `prises.txt`) : `[thoughtful]` +1,2 dt · `[curious]` +1,0 · `[firm, matter-of-fact]` +0,1 · `[serious]` −0,1 · `[calm]` −0,3 · `[tense]` −0,4 · `[ominous]` −1,4 · `[low, grave voice]` −3,5 · `[slowly]` −5,7. Aucune phrase criée dans les 9 prises.

Voix contre fond (`voixbed.txt`, écart au-dessus de 300 Hz) : médiane 19,4 dB (004), 14,6 dB (005), 16,8 dB (006). Points bas : 006 `choc` 9,0 dB, 004 `clac` 8,6 dB — voulus (climax). Rien d'alarmant ; le fond du 005 est le plus présent des trois.

---

## 3. Raisonnement

**Pourquoi les silences d'abord.** C'est le seul levier qui ne coûte ni crédits ni accord. Le débit d'Eric ne se règle pas (`speed` ignoré) : à 4,9–5,3 syll/s articulées il parle à l'allure d'une conversation posée, et le film tombe à 169 mots/min parce qu'un quart du temps est muet. Le format court francophone d'explication se situe plutôt autour de 180–200 mots/min — ordre de grandeur de connaissance générale, non mesuré ici : à confronter aux courbes de rétention des 003 (179) et 004 (168), qui donnent justement la comparaison. Les `hold` ont été posés pour « laisser une image frapper » ; l'image regardée montre que sur dix `hold` du 006, quatre tombent sur un plan déjà fixe, et que trois frontières (006 `comment → abo` 74,99 s ; 005 `deux → chute` 51,10 s, `comment → abo` 74,37 s) contiennent une image sans sous-titre ni voix : rien à lire, rien à entendre, à l'instant des CTA.

**Pourquoi l'accroche du 006 en premier.** La règle du compte est que l'accroche fait 99 % du travail. Le 006 est le seul des trois dont l'accroche est sous le niveau moyen du film, et de loin (−2,8 dB contre +0,1 et +0,8). La cause est mesurable et ne tient pas à Eric : `[tense]` sur des phrases closes très courtes descend (−1,4 dt en moyenne, 15 mesures). Les deux lignes de reprise déjà écrites dans `episode.json` attaquent exactement ça (une virgule à la place d'un point, ou `[firm, matter-of-fact]`). 68 crédits pour la phrase qui décide si on reste.

**Pourquoi la boucle du 005 en second.** Le 005 sort le premier. Sa dernière phrase retombe dans les trois prises ; le remède (virgule finale) est prouvé 3/3 sur le 006. Avec le `tail` raccourci, le rebouclage passe de « phrase finie + 1 s de vide » à « phrase en l'air + 0,5 s ».

**Ce que je n'ai pas vérifié.** L'effet réel d'un `hold` négatif sur le montage audio ; où `vo.ride` est calculé ; l'effet d'`atempo` ; le coût exact de la reprise `like` du 005 (annoncé par `npm run voice` avant toute dépense). Les notes de la cabine du 005 n'existent pas (`audio/picks.json` absent) : Merwan ne l'a pas encore écouté.

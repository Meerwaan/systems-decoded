# La recette du script (courts)

Écrite le 2026-10-21, pour « scale TikTok » (Merwan : le contenu prend partout, sauf sur TikTok). À lire avant d'écrire un `episode.json`. La loi reste CLAUDE.md (« L'accroche, c'est 99 % du travail », « La structure d'un épisode », « Appels à l'action », « La voix ») ; ici, ce qu'on fait phrase par phrase, et ce que `npm run script` vérifie. Le diagnostic chiffré d'où elle sort : `docs/scale/1-script-voix.md`. Premier script écrit avec elle : le 026 (Soyouz MS-10).

## Ce que disent les chiffres (des pistes, pas des lois)

- **Le mot-choc avant 3 s.** Les trois films qui ont percé sur TikTok disent le mot qui fait peur ou qui retourne à 3,2 s au plus : 015 « plein (gaz) » 3,2 s · 009 « (ton) visage » 3,2 s · 010 « lame » 2,3 s, « (tu le) gardes » 3,2 s. Les huit autres films postés à partir du 8 octobre le disent entre 3,6 et 4,3 s et plafonnent à 16 k. Biais connu : les trois ont été postés entre 19 h et 23 h (007, posté à 2 h du matin : 2,8 k).
- **La première seconde est la première fuite** (TikTok l'écrit sur les deux courbes, 015 et 012). Dans les deux, l'accroche perd ≈ 20 points et la promesse encore ≈ 20 : c'est la décroissance normale, pareille sur le meilleur film et sur un film moyen.
- **Ce qui sépare le meilleur film : la scène (10 → 25 s).** 015 : −10 points dans la scène (1,3 par seconde), −17 de 10 à 24 s. 012 : −13 (1,8 par seconde), −23. La scène du 015 reste dans l'instant de l'accroche et ajoute une image et un enjeu par phrase ; celle du 012 saute à « toute une nuit » (une hypothèse, des litres par minute). Le 015 la dit vite (+4 % sur le débit médian du film), le 012 à +0 %, le 025 à −9 %.
- **Qui passe le seuil reste** : l'acte 3 ne perd presque rien (0,2 point par seconde sur les deux courbes). L'effort se met avant.
- **Les commentaires** (TikTok, pour 1 000 vues) : « Sur ton tableau, tu lis 30 mA… ou rien ? » 3,5 ‰ · « tu sauterais au dernier moment ? » 2,0 · « il chauffe encore combien de temps ? » 1,7 · « pour ou contre ? » 1,1 — contre « tu le tentes ? » 0,03 · « ta pédale a déjà tremblé ? » 0,06 · « il a quel âge ? » 0,3 · « tu y vas ? » 0,7. Les premiers films avaient peu de vues : le taux baisse quand les vues montent. Mais le partage est net : une lecture à faire chez soi ou un camp à choisir fait écrire ; une expérience passée ou un « tu le ferais ? » sans enjeu, non. Et une question à laquelle le film répond lui-même (008) ne fait rien.

## 1. Les trois premières secondes, mot à mot

| Instant | Ce qui est dit | A marché | À ne pas faire |
| --- | --- | --- | --- |
| 0,2 → 1 s | deux ou trois mots : **ta / ton / tes + une chose que tu as (ou une partie de ton corps) + un verbe d'action au présent** — ou la menace elle-même | « Ta main glisse. » « Tes roues touchent… » « Un sanglier. » | une date, un lieu, une durée, une offre (« On t'offre un vol »), un calme (« L'IRM s'est tue »), un contexte (« Premier tour ») |
| ≤ 3 s | **le mot-choc** : ce qui fait peur ou ce qui contredit, en fin de phrase | « …tu mets *plein gaz*. » « …touche la *lame*. » | un « … » avant lui : la pause le pousse au-delà de 3 s |
| ≤ 5 s | **le retournement** : ce qui ne colle pas avec ce qu'on attend | « Tu le gardes. » « C'est voulu. » « …vient de partir. » | expliquer |
| ≤ 10 s | A · B · C remplis (CLAUDE.md) | | une présentation, un « Saviez-vous », un « Imagine » |

- Première phrase : huit mots au plus, elle finit sur le mot-choc. La première image le montre déjà (sans texte : les mots montent quand ils sont dits).
- Le mot-choc se déclare dans les repères : `"choc": "accroche:lame"`. `npm run script` dit à quelle seconde il tombe et prévient au-delà de 3 s (voix réelle) ou de la 8ᵉ parole (minutage estimé).

## 2. La promesse (4 → 10 s) : ne pas rassurer

- **B est un fait qu'on a du mal à croire, pas un soulagement.** « C'est voulu : un câble va t'arrêter, en cent mètres » (015) tient ; « il se coupe tout seul » (012) libère le spectateur : il a sa réponse, il part.
- **C est concrète** : deux menaces qu'on voit (« Sauf si tu le rates… ou s'il casse ») ou un mystère précis (« elle le doit… à un élan »). Jamais « une condition », « cette pièce ».
- A + B + C : 26 à 32 mots, finis avant 10 s.

## 3. La scène (10 → 25 s) : la cible n° 1

1. **Elle reste dans l'instant de l'accroche** : même lieu, même seconde. Pas de « Sans elle… », pas de « Laisse-le toute une nuit », pas de date ni de « Ce n'est pas un scénario » en tête, pas de statistique.
2. **Une phrase = une image de plus et un enjeu plus haut** (015 : la vitesse → le pont finit dans la mer → trois câbles → ta crosse doit en accrocher un).
3. **L'enjeu se voit** : la mer, le fossé, le vide — une chose que l'image peut montrer (vérifier que le décor l'a).
4. **Elle finit sur une tâche ou un dilemme pour le spectateur, et sur l'objet qu'on va ouvrir** : sa dernière image est ce que « Alors… on l'ouvre » ouvre.
5. **Elle se dit vite** : phrases de trois à huit mots, **une seule pause** (un `[short pause]` ou un « … »), jamais deux. Son débit ne descend pas sous la médiane du film (mesuré par `npm run voice`) : 015, une pause, +4 % ; 025, deux, −9 %.
6. **22 à 30 mots, 9 s au plus.** Les scènes des 018 à 025 en font 33 en médiane (11,6 s), jusqu'à 42 (15,5 s) : trop pour la zone qui coûte le plus.

## 4. Un fil ouvert toutes les 8 à 12 s

Chaque phrase ouvre une question ou en paie une en ouvrant la suivante. Le parcours type :

| ≈ s | Phrase | La question que le spectateur se pose |
| --- | --- | --- |
| 0-4 | accroche | Quoi ?! |
| 4-10 | promesse | Comment c'est possible ? Et cette condition (C) ? |
| 10-19 | scène | Il reste quoi pour te sauver ? |
| 19-21 | « Alors… on l'ouvre. » | Qu'y a-t-il dedans ? |
| 21-38 | éclaté, repos | Comment il sait ? Et ça va marcher ? (la dernière phrase retend) |
| 38-41 | seuil | — il promet l'acte 3 avec les mots de l'accroche |
| 41-60 | zéro, réponse | À temps ? |
| 60-67 | chute | Alors c'est l'inverse de ce que je croyais ? |
| 67-80 | ce qui est dû + commentaire | La réponse au C… et toi ? |
| 80-92 | like, prochain dossier, boucle | Et le prochain ? (la boucle relance le film) |

**Les portes d'acte finissent sur une question** : la scène sur l'objet qu'on ouvre ; l'autopsie sur une phrase qui retend (de préférence avec les mots de l'accroche : « Et ta fusée lâche… pile dans cette fenêtre. ») ; la réponse sur la victoire, que la chute retourne ; la chute sur le retour du C. **L'éclaté suit un chemin** — la pièce qui agit, d'un bout à l'autre (015 : « Sur le pont… Dessous, il continue… et au bout… ») — il n'énumère pas (« Un capteur… Un capteur… Un capteur… »).

## 5. La question du commentaire

- **Fermée, à deux camps, une réponse d'un mot** : une lecture à faire chez soi dont l'une des deux réponses fait peur (« tu lis 30 mA… ou rien ? », « d'avant… ou d'après ? »), ou un camp à choisir (« pour ou contre ? », « tu remontes… ou plus jamais ? »).
- **Jamais** « tu le tentes ? », « tu y vas ? », « il a déjà… ? », « tu as déjà… ? », « tu le savais ? » ; jamais une question à laquelle le film répond.
- Elle termine la légende ; l'épinglé (150 caractères au plus) donne les deux réponses à recopier (« Réponds juste : … ou … »).

## 6. Le budget de mots

**255 à 265 mots affichés** (≈ 88 à 97 s en `eleven_v4_turbo`, mesuré sur les 021 à 025) ; au-delà de 265, couper — la scène et le commentaire d'abord.

| Phrase | Mots | Phrase | Mots |
| --- | --- | --- | --- |
| accroche (A) | 10-15 | zéro | 13-20 |
| promesse (B·C) | 13-18 | réponse (+ relâchement) | 22-32 |
| scène | 22-30 | chute | 17-23 |
| « Alors… on l'ouvre. » | 3 | ce qui est dû + commentaire | 25-35 |
| éclaté | 20-28 | like | 7-12 |
| repos | 20-28 | prochain dossier | 12-17 |
| seuil | 7-10 (3 s au plus) | boucle | 4-6 (2 s au plus) |

## 7. La voix : la direction par défaut

La recette des 17 premiers films, confirmée : **le film d'une seule requête**, `eleven_v4_turbo`, stabilité 0,4, `--takes 1` ; **une balise de direction au plus par phrase, en tête de ligne, jamais au milieu** (`[short pause]` est un silence, pas une direction : il reste permis) ; jamais trois phrases de suite sur la même balise.

| Phrase | Balise | Si Merwan dit non à B |
| --- | --- | --- |
| accroche, scène, seuil, réponse | `[tense]` | — |
| promesse, zéro, chute | `[firm, matter-of-fact]` | — |
| « Alors… on l'ouvre. » | `[calm]` (`voAlt` : avec `[short pause]`, si la pause n'est pas jouée) | — |
| éclaté, commentaire | `[conversational, curious]` | `[curious]` |
| repos, like | `[warm, conversational]` ; `[amused]` une fois par film au plus, sur un paradoxe mécanique de l'autopsie | `[curious]`, `[firm, matter-of-fact]` |
| prochain dossier | `[serious]` | — |
| boucle | `[calm]`, une virgule au bout du `vo` | — |

- **Le banc du 21/10 (025, scène → « on l'ouvre » → éclaté → repos, deux requêtes courtes, 228 crédits)** : la direction du long (B) relève l'autopsie (éclaté +1,4 dt contre −0,2 pour celle du film) mais **aplatit la menace** (`[serious]` sur la scène : −0,5 dt contre +1,8 pour `[tense]`, mêmes mots) — `[serious]` n'est donc pas `[tense]` ; et **« on l'ouvre » traîne dans les deux** (1,47 et 1,39 s, 8,9 et 9,4 l/s, −36 % de débit, au-delà du seuil de `npm run voice`), alors que la reprise que garde le film, enregistrée elle aussi en requête courte, tient 1,31 s, et que les prises entières des 021 à 025 le donnent entre 1,07 et 1,31 s. Une requête courte ne le garantit pas : la prise du film entier reste sa source, une reprise se juge à la mesure. D'où le tableau : la conversation pour l'autopsie et les appels à l'action, la menace et l'acte 3 comme avant. Le verdict de Merwan sur B tranche la colonne de droite (le modèle porte les deux : `vo` et `voAlt`).
- **Interdits sur un court** : `[urgent]`, `[dramatic]`, `[ominous]`, `[low, grave voice]`, `[relieved]`, `[nervous]`, `[slowly]`, un mot en MAJUSCULES, un « ! ».
- **`[amused]`** jamais sur la menace, une victime, la chute, un accident (« voix dragueuse », 019).
- Le relief de l'acte 3 vient de l'écriture : des points là où l'on mettrait des virgules, des phrases de trois à six mots.

## 8. La grille d'autocontrôle, phrase par phrase

Avant la voix, pour chaque phrase :

1. **Quelle question le spectateur se pose-t-il à cet instant ?** Si la réponse est « aucune », la phrase est à réécrire ou à retirer.
2. **Peut-elle sauter ?** Lue sans elle, l'histoire y perd-elle ? Sinon, elle saute.
3. **Qu'est-ce qu'on voit ?** Chaque phrase a sa démonstration à l'image (CLAUDE.md, « L'animation raconte aussi ») ; le décor doit l'avoir.
4. **Quel mot la porte ?** Il est à la fin de la phrase.
5. **Est-elle dans son budget de mots ?** (§ 6)
6. **Chaque fait est-il dans le dossier de faits, au bon niveau ?** Rien de la section « À ne pas dire ».

## 9. La légende TikTok

- **Première ligne : le mot que les gens cherchent**, avec son synonyme courant (« ESP, le contrôle de trajectoire : », « Soyouz : »), puis l'accroche prolongée sans la répéter et sans la chute.
- Elle finit par la question du commentaire. Cinq hashtags au plus, sans accents (`#fusee`), dont `#apprendresurtiktok` et `#commentcamarche`.
- L'épinglé : 150 caractères au plus, les deux réponses à recopier.

## Ce que vérifie `npm run script`

Après la table du minutage, `Écriture` (`scripts/lib/ecriture.mjs`) : le nombre de mots (film, accroche, scène), le mot-choc et sa seconde, une 2ᵉ personne dans les dix premiers mots, « Alors… on l'ouvre. » mot pour mot et une seule fois, l'ordre de la fin (chute → commentaire → like → prochain dossier → boucle), le seuil (« Abonne-toi », dix mots au plus) et aucun « Abonne-toi » au prochain dossier, la boucle (« … » à l'écran, virgule dans la voix), la question du commentaire (« ? », deux camps), les balises (une par phrase, en tête, aucune interdite, `[amused]` une fois, jamais trois fois la même de suite), les MAJUSCULES et les « ! » dans la voix, une unité à symbole dans les sous-titres (« µs » se lit « MS »), la légende (mot cherché en tête, cinq hashtags) et l'épinglé (150 caractères). Ce sont des avertissements : rien n'est bloqué.

Depuis le 27/10 (salle d'écriture), ce qu'un script écrit par un agent peut laisser passer : du **texte du modèle** resté en place (`__TITLE__`, `#sujet1`, une phrase de `kit/template/episode.json` mot pour mot) ; `vo` (et chaque `voAlt`) qui n'a **pas les mêmes mots que `text` dans le même ordre**, balises et `[85|quatre-vingt-cinq]` lus comme la voix les dit (le contrôle de la voix, lui, accepte un mot en trop) ; **`sources` vide** ; **`post.keyword` absent** ; un **titre YouTube** de plus de 100 caractères ; un **repère `beat:mot`** dont le début attrape plusieurs mots différents (« accroche:t » → « ta », « tension » : le premier est pris). Vérifiés sur 001 à 030 : aucun ne sonne sur 026 à 030 ; `post.keyword` manque aux 001 à 025, d'avant ce champ.

**`npm run salle -- 031 032 …`** met un lot de scripts sur une page avant le message à Merwan : pour chaque dossier l'accroche, les mots dits (film, accroche, scène), la durée (sans voix : mots × 0,343 s, mesuré sur 026 à 030 — l'estimation du minutage, elle, compte ≈ 35 % de trop), le mot-choc et sa seconde, le nombre de ⚠ ci-dessus, et le **devis voix tel que `npm run voice` l'annonce** (même code : `planVoice` + `estimateVoice` de `scripts/voice.mjs`, tarif lu le jour même) ; puis le total. Elle compte en ✗ ce qui empêcherait la séance : un script illisible, une `vo` que la voix refuserait, « Alors… on l'ouvre » en tête d'une requête voix ou seul dans la sienne. Rien n'est enregistré ; le détail des ⚠ est dans `.cache/logs/salle-<dossiers>.log` (ou `--verbose`).

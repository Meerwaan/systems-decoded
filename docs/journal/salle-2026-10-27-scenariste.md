# Salle d'écriture — l'agent `scenariste` et son essai à l'aveugle (27/10)

Lot : `.claude/agents/scenariste.md` (nouveau type d'agent), `docs/salle-d-ecriture.md` (la recette d'un lot), ce journal. Aucun crédit, aucun commit. Dossier d'essai `episodes/X30-essai-scenariste/` (id `030`, seulement `episode.json`) créé puis supprimé, ses journaux `.cache/logs/X30*` aussi ; rien sous `renders/`, rien dans `posts.mjs`.

## L'essai : le 030 réécrit depuis le seul dossier de faits

Lu : `docs/recette-script.md`, `docs/faits/030-prise-de-terre.md`, `kit/template/episode.json`, les beats du 029 (exemple, et son `abo` qui annonce le 030). **Contamination à signaler** : en lisant la tête de `scripts/posts.mjs` (pour savoir comment un dossier y entre), j'ai vu la légende Instagram du 030 réel (« Ta machine à laver est sous tension. Et rien n'a sauté. », « avec broche… ou sans ? ») avant d'écrire. J'ai écrit une autre accroche exprès ; la question du commentaire est de toute façon la n° 1 du dossier de faits. Le suivant du 030 n'étant pas connu à l'aveugle, l'annonce est restée en `À FAIRE` (chemin prévu pour le dernier d'un lot).

| | Essai (premier jet) | 030 réel (après contre-vérif et Merwan) |
| --- | --- | --- |
| `npm run script` → Écriture | 1re passe : 1 ⚠ (A+B+C 36 mots) ; 3e passe : **rien à signaler** | rien à signaler |
| Mots affichés (film) | 237 | 247 |
| Accroche (A) | « Ta machine passe à 230 *volts*. Ta main arrive dessus. » 10 mots | « Ta machine à laver est sous *tension*. Et rien n'a sauté. » 11 mots |
| B + C | « Ce qui coupe avant ? Un fil endormi dans tes murs : le vert-jaune. Sauf si ta prise… n'a pas de broche. » 20 | « Ton différentiel marche. Mais il attend… que le courant passe par toi. Souvent, ce qui manque se voit sur tes prises. » 21 |
| Mot-choc | « volts », 8ᵉ parole (« deux cent trente » en compte trois), 2,41 s estimé (≈ 2,1 s en voix, à l'œil) | « tension », 7ᵉ parole, **1,24 s** en voix réelle |
| Scène | 27 mots, 11,2 s estimées (≈ 8 s en voix) ; tâche : « Regarde où ta machine est branchée : la prise. » | 24 mots, 6,6 s en voix réelle |
| Question du commentaire | « tes prises, chez toi… avec broche, ou sans ? » | « chez toi… avec broche, ou sans ? » (la même) |
| Chute | « la terre n'avale pas le courant. Elle le montre à ton différentiel… avant que tu touches. » | « la terre ne te protège pas seule. Elle donne un chemin au courant… pour que ton tableau coupe avant toi. » |
| Durée | 104 s estimées | 83,3 s en voix réelle |

**Verdict.** Le premier jet passe les contrôles et tient la structure, les faits (rien de « À ne pas dire » ; le seul [O] est le passage « sans broche, il ne coupe qu'une fois que tu as touché »), la question et la chute du 030 réel. Il est **moins bon sur ce qui compte le plus** : le retournement manque à l'accroche (« Ta main arrive dessus » menace, « Et rien n'a sauté » retourne), le mot-choc tombe plus tard (8ᵉ parole contre 7ᵉ : le nombre dit en toutes lettres le pousse), la scène est plus longue de trois mots. Le réel est aussi meilleur à deux portes d'acte : le repos qui retend (« Mais ici, ce fil… n'arrive nulle part ») et un acte 3 qui joue les deux branches (sans fil : après toi ; avec : avant ta main), ce qui paie la chute. L'essai, lui, garde un vrai compte à rebours (la main qui arrive) et une tâche en fin de scène. Conclusion : le rôle tient pour un premier jet prêt pour `contre-verif` et `salle` ; l'accroche reste à juger par la conversation sur la table du § 1 avant le message à Merwan.

## Ce que l'essai a fait corriger dans la définition

1. **Le retournement est la 2ᵉ phrase de l'accroche**, et un nombre dit compte toutes ses paroles (ajouté au paragraphe « L'accroche d'abord »).
2. **Compter les mots à l'outil** : 32 comptés à la main, 36 mesurés par `npm run script`.
3. **La durée estimée est longue d'un quart** (104 s estimées pour 237 mots ; 83 s réelles pour 247) : tenir le budget en mots, annoncer mots ÷ 3.
4. **`id` à trois chiffres obligatoire** : `ecriture()` saute les contrôles pour tout autre id (un dossier d'essai garde l'id du vrai).
5. **`posts.mjs`** : un dossier y entre par la table `POSTS` (clé = nom du dossier). Le scénariste y ajoute son entrée par un seul `Edit`, mais **ne lance jamais `node scripts/posts.mjs`** : il réécrit tous les `episode.json` de la table, y compris ceux qu'un autre scénariste est en train d'écrire.
6. **Le suivant** : le scénariste ne peut pas l'inventer ; d'où les faits « N + 1 » de la salle et l'`À FAIRE` visible qui bloque la voix du dernier film.
7. `duck` : le modèle n'en a pas, le scénariste n'en écrit pas (il se pose sur la voix).

Pendant l'essai, `scripts/lib/ecriture.mjs` était en cours de modification par l'agent « outillage » (« mesures is not defined » sur deux lancements, puis réparé). `npm run salle` n'existait pas encore : tout s'est vérifié avec `npm run script`.

## Coût

Essai seul (lire recette, faits, modèle, exemple ; écrire ; trois passes de `script`) : ≈ 8 appels, ≈ 45 k de contexte ajouté. Un `scenariste` complet (plus `npm run new`, l'entrée de `posts.mjs`, son message) est visé à 12–18 appels et ≈ 60–90 k au compteur. Ce lot entier (lectures d'outillage, définition, recette, journal) : ≈ 25 appels, ≈ 100 k de contexte final.

## À changer ailleurs

- `CLAUDE.md`, « Du thème à la vidéo », ordre de travail : remplacer « faits → contre-vérification (les seules phrases du script) → script → » par « faits → script (`scenariste`) → contre-vérification (les seules phrases du script) → » et ajouter après le bloc : « Plusieurs courts à la fois : `docs/salle-d-ecriture.md`. »
- `CLAUDE.md`, « La chaîne, économe », liste des rôles : « (`faits`, `contre-verif`, `scenariste`, `architecte`, … ) ».
- `docs/chaine-optimisee.md` § 2, première phrase après le titre : « Avant : la conversation principale garde Merwan — sujet, `faits`, `scenariste` et `contre-verif` (en parallèle de plusieurs dossiers : `docs/salle-d-ecriture.md`), accroche et devis voix en un seul oui pour tout le lot, voix. »
- `docs/recette-agents.md` : ajouter une ligne `scenariste` (modèle de la session, 25 appels, lit recette-script + faits + modèle + beats d'un exemple, écrit `episode.json` + son entrée de `posts.mjs`).
- `.claude/agents/faits.md`, « Ton message final » : ajouter « la phrase « Pour l'annonce » telle quelle » (la salle la passe au scénariste du film précédent sans ouvrir le fichier).
- `scripts/posts.mjs` (agent outillage) : vérifier aussi les dossiers absents de `POSTS` qui ont `post.youtube` dans leur `episode.json` (titre ≤ 100, 5 hashtags), pour qu'un scénariste n'ait plus à éditer ce fichier commun.
- `npm run chrono` : une étape `script` (aujourd'hui faits et script tombent dans `faits`).

# La salle d'écriture : N courts à la fois (27/10)

Pour faire grandir le compte, les scripts s'écrivent par lots : des agents font les faits, le script et la contre-vérification de plusieurs courts en parallèle ; la conversation principale ne fait que lancer, appliquer et poser **une seule question à Merwan pour tout le lot**. La loi reste `CLAUDE.md` ; la recette d'écriture, `docs/recette-script.md` ; les rôles, `.claude/agents/` (`faits`, `scenariste`, `contre-verif`, `chef-de-production`).

## L'ordre

0. **Les sujets validés par Merwan** (`docs/sujets-*.md`, ou sa réponse dans la conversation). Jamais un agent avant son oui. **Un sujet passe s'il se voit** : une scène qui se met en scène en un plan (quelqu'un, un danger en cours), des pièces qui bougent quand on l'ouvre, un climax qui se montre — pas un calcul dans une puce ni un contact invisible. Chaque liste de sujets le note (« À l'image » ●●● / ●●○ / ●○○) ; un ●○○ ne passe que s'il a une vraie raison (électriciens, demande du public). Le lot suit **l'ordre de la grille** : 031, 032, 033… (CLAUDE.md : on ne reposte pas, l'ordre fait la DA).
1. **`faits` × (N + 1)** (sonnet), en parallèle, 3 à 4 à la fois. Le « + 1 » est le premier sujet du lot suivant : il ne sert ici qu'à l'annonce du dernier film (voir « La chaîne des annonces »).
2. **`scenariste` × N** (modèle de la session), en parallèle, 4 à la fois au plus. Consigne de cinq lignes : dossier, slug et titre ; fichier de faits ; précédent ; suivant et sa phrase d'annonce ; dossier d'exemple.
3. **`contre-verif` × N** (sonnet), en parallèle, dès que les scénaristes ont rendu.
4. **La conversation applique les remplacements** : chaque `beat : « ancienne » → « nouvelle »` de leurs messages, par `Edit` dans `episode.json`, `text` ET `vo` (mêmes mots, la balise gardée). Une phrase qui change de longueur ou touche l'accroche se relit à la table du § 1 de la recette.
5. **`npm run -s salle -- 031 032 033`** (à défaut, `npm run -s script` puis `npm run -s voice` sans `--budget`, par dossier) : accroche, mots, durée, ✗/⚠ d'écriture et devis voix de chaque dossier, et le total. Zéro ✗ avant d'aller plus loin.
6. **Un seul message à Merwan** : pour chaque dossier, l'accroche A · B · C telle qu'affichée et son devis ; le total du jour, **le chiffre affiché par l'outil le jour même**, jamais de mémoire ; puis « oui / non par dossier ». Rien d'autre à trancher : la question, la chute, le seuil sont déjà choisis (je tranche, il ne reçoit que des oui / non).
7. **La voix**, dossier par dossier, après son oui seulement : `npm run voice -- <ep> --budget <devis>`. Il écoute à la cabine avant tout montage. Un non → on réécrit l'accroche (le scénariste n'est pas réveillé : un `Edit` de la conversation, ou un `scenariste` neuf sur le seul dossier si tout est à refaire).
8. **Un `chef-de-production` par dossier**, l'un après l'autre (il lance lui-même jusqu'à quatre agents) : « Dossier 031, de l'architecte au rendu » + deux lignes.

## Ce que lit la conversation

Les **messages finaux** des agents (faits : 25 lignes, scénariste : 15, contre-vérif : 15) et la sortie de `salle`. **Jamais** un dossier de faits en entier, un `episode.json` en entier, ni le journal d'un agent. Deux exceptions, chacune en une commande : la section « Pour l'annonce » du dossier de faits suivant (`sed -n '/Pour l.annonce/,/^## /p' docs/faits/<ep>-*.md`), et une phrase que la contre-vérification désigne. Elle n'appelle rien pendant qu'une vague tourne.

## La chaîne des annonces

Chaque film annonce le suivant dans la grille (`abo`, un fait), et sa boucle est la queue de cette annonce qui retombe sur sa propre accroche.
- **Le film N** reçoit dans sa consigne la phrase « Pour l'annonce » du dossier de faits N + 1 (étape 1 : c'est pour elle que les faits de N + 1 passent avant les scripts).
- **Le premier du lot** a déjà été annoncé par le précédent : le scénariste lit l'`abo` du précédent et garde l'objet et le mot promis. Si le précédent est déjà enregistré, c'est lui qui fait foi.
- **Le dernier du lot** annonce le premier sujet du lot suivant, déjà validé, avec les faits du « + 1 ». Sans eux : `À FAIRE` visible dans son `abo` (`salle` et `script` le montrent) — **sa voix ne s'enregistre pas** tant que l'annonce n'est pas écrite (le film part en une requête).

## La jauge (`docs/chaine-optimisee.md` § 4)

`get_usage` avant chaque vague. Une vague part si fenêtre + agents du modèle de la session × 9 points × heures prévues ≤ 85 % et hebdo ≤ 92 % ; les sonnet (`faits`, `contre-verif`) pèsent peu. Quatre agents du modèle de la session à la fois au plus. Sinon « EN FILE », et un réveil programmé à la remise à zéro (jamais les crédits voix la nuit). Chaque notification de fin : `npm run chrono -- <ep> agent <nom> --jetons N`.

## Ce que coûte un lot (visé, à mesurer sur le premier)

| Rôle (modèle) | Par dossier | Durée | Appels |
| --- | --- | --- | --- |
| `faits` (sonnet) | ≈ 200 k | 4 à 8 min | 30 requêtes web |
| `scenariste` (session) | ≈ 60 à 90 k au compteur | ≈ 5 à 10 min | 12 à 25 |
| `contre-verif` (sonnet) | ≈ 177 k | 3 min | 12 requêtes web |
| la conversation | ≈ 10 à 15 k par dossier (messages, `Edit`, `salle`) | | |

Un lot de trois : ≈ 1,5 M de jetons d'agents, dont ≈ 0,25 M du modèle de la session ; ≈ 30 min du premier `faits` au message à Merwan. Mesure de l'essai du 27/10 (script du 030 à l'aveugle) : `docs/journal/salle-2026-10-27-scenariste.md`.

## Longs et promos : hors de cette salle

Un long (`Lnn`) s'écrit à part, un à la fois, par la conversation : faits en deux passes, un seul `contre-verif` sur tout le script, chapitres et voix par parties — `docs/recette-long.md`, `docs/recette-long-retention.md`. Sa promo (`HSnn`) est l'affaire de l'agent `promo` (`.claude/agents/promo.md`), une fois le long et ses liens en ligne. Le `scenariste` n'écrit que des courts numérotés à trois chiffres.

# La recette d'une promo de long (hors-série, vertical)

Écrite le 2026-10-16, avant la première (HS01, pour le L01 — le pare-brise). Ce que l'agent `promo` (`.claude/agents/promo.md`) applique, et pourquoi. Le format long lui-même est dans CLAUDE.md, « Le format long (YouTube) » ; la fabrication d'un long dans `docs/recette-long.md`.

## Pourquoi une promo

Les longs vivent sur YouTube, où le compte n'a encore ni communauté ni historique : leur croissance viendra de la recherche et des suggestions, lentement. Le public, lui, est ailleurs — Instagram (4 M de vues la semaine du 7 au 13 octobre), Facebook, TikTok. Un court qui renvoie vers le long est le seul pont direct entre les deux. Et c'est un court du compte : il doit tenir seul, comme n'importe quel dossier.

## La règle de Merwan (16/10)

> « Il faut pas spoil la vidéo, il faut donner aux gens envie d'en savoir plus, limite les frustrer. »

- **Un court qui répond tue le clic.** Les courts du compte paient leur accroche à la fin ; la promo, non : la réponse est sur YouTube. C'est la seule exception à l'ABC (la C n'est pas payée), et elle est voulue.
- **Frustrer n'est pas tricher.** Chaque fil ouvert est vrai et payé dans le long : on note, phrase par phrase, l'`id` du beat qui la paie. Un spectateur qui clique et ne trouve pas la réponse ne revient pas — et YouTube sanctionne un « choc » qui ne paie pas plus vite qu'un swipe.
- **Aucun fait neuf** : la promo est une vitrine du long, pas un dossier de plus. Pas de recherche, pas de contre-vérification : les faits ont déjà été vérifiés pour le long.
- **L'image coupe avant le paiement** : c'est elle qui frustre le mieux (la tête qui tombe, noir avant l'impact).

## Ce qui reste du compte, et ce qui change

| Reste | Change |
| --- | --- |
| L'accroche ABC dans les 8-9 s, à la 2ᵉ personne, au présent | La C n'est pas payée |
| La première image la plus forte, sans texte | Elle vient du long : son plus beau plan, recadré en 9:16 |
| La boucle (dernière phrase inachevée → l'accroche) | — |
| ≥ 60 s | 60 à 65 s, ≈ 180-195 mots (turbo : ≈ 3,3 mots par seconde) : pas de place pour un acte entier |
| « Alors… on l'ouvre. » | L'éclaté commence, coupe au noir, « Pas ici. » — le gag signature des hors-séries, gardé tant que la courbe ne casse pas là |
| Trois CTA (like, commentaire, abonnement) | **Un seul** : YouTube, la chaîne, la durée du long ; aucun logo, un cartouche « FILM COMPLET · 8 MIN 51 » |
| « DOSSIER 00X », actes MENACE / AUTOPSIE / RÉPONSE | « HORS-SÉRIE 0X », actes MENACE / L'USINE / RENDEZ-VOUS — une option du modèle des courts (`"serie": "hors-serie"`), qui servira aussi aux vidéos sponsorisées |
| La voix d'Eric | Les balises de conversation du long (`[conversational, curious]`, `[warm, conversational]`, `[curious]`), `[tense]` sur l'accroche seulement, `[calm]` sur « Alors… on l'ouvre », `[amused]` sur « Pas ici. », `[serious]` sur la menace ; `eleven_v4_turbo`, une seule requête |

## La forme qui marche (à corriger avec les chiffres)

1. **A · B · C** (≈ 9 s) : l'accroche du long, que la miniature et le titre YouTube ont déjà promise — celui qui clique reconnaît ce qu'il a vu.
2. **Le lancement** (une phrase, seulement quand c'est nouveau : un premier long, une nouvelle série).
3. **Quatre ou cinq teasers**, un par étape forte, chacun sur sa plus belle image, chacun une question sans réponse ; du plus beau au plus inquiétant.
4. **Le test** (la menace du long), coupé avant l'impact.
5. **Le gag** : « Alors… on l'ouvre. » → noir → « Pas ici. »
6. **Le rendez-vous** : YouTube, la chaîne, la durée.
7. **La boucle.**

## Le coût visé

Pas de faits, pas de décor neuf, une seule requête de voix (≈ 160 mots en turbo : quelques centaines de crédits, chiffre exact lu le jour même), un film d'une minute monté sur des décors qui existent. Cible à vérifier sur HS01 : **≈ 1 h de fabrication et moins de 1 M de jetons d'agents** — c'est le prix qui permet une promo par long.

## La sortie

Le long d'abord sur YouTube ; la promo dans l'heure, partout. Le lien : Shorts → « vidéo associée » ; Instagram → lien en bio et une story à autocollant de lien ; TikTok → lien en bio s'il est actif, sinon le titre exact du long dans l'épinglé ; Facebook → le lien en premier commentaire. Merwan publie ; personne d'autre.

## À mesurer après publication

À relever 48 h puis 7 jours après la sortie, dans `metrics/audience.json` (une entrée par promo, à côté de celle de son long), et à résumer en deux lignes dans CLAUDE.md, « Dossiers » :

- **La promo, plateforme par plateforme** (TikTok, Instagram, Facebook, Shorts) : vues, tenue à 3 s, part regardée, % qui finissent, **la courbe à l'instant du « Pas ici »** (encoche ou non), abonnés gagnés.
- **Les clics** : Instagram → clics sur le lien en bio et sur l'autocollant de la story (statistiques du profil et de la story) ; TikTok → vues du profil et clics sur le lien en bio s'il existe ; Shorts → les vues du long venues du Short.
- **Le long, dans YouTube Studio** (Audience → Sources de trafic, sur 48 h et 7 jours) : la part **« Shorts »** (le Short et sa vidéo associée), la part **« Sources externes »** (instagram.com, tiktok.com, facebook.com), contre « Recherche YouTube » et « Vidéos suggérées » ; abonnés gagnés sur le long ; durée moyenne de visionnage des spectateurs venus de l'extérieur contre les autres.
- **Le rapport qui compte** : vues du long venues des promos pour 1 000 vues de promo. Les promos suivantes se jugent là-dessus.

Ce qu'on en fera, pistes de travail (pas encore des lois) : si la promo fait ses vues habituelles mais n'envoie presque personne sur le long, c'est le rendez-vous qui manque de force (la phrase, le cartouche, le lien) ; si elle décroche avant le premier teaser, c'est l'accroche ; si la courbe casse sur « Pas ici », le gag change ; si les spectateurs venus de l'extérieur partent du long plus vite que les autres, la promo a promis autre chose que le film.

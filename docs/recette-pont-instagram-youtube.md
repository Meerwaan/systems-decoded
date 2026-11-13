# Le pont Instagram → YouTube

Écrit le 2026-11-13, à la demande de Merwan : faire passer l'audience d'Instagram (≈ 41 000 abonnés) vers YouTube (≈ 1 180), où sont les longs et où se comptent les 4 000 h (`docs/plan-rush-youtube.md`). Ce qui suit est un **système qui revient à chaque long**, pas une campagne. Je prépare, Merwan poste : rien ne part d'ici.

L'outil : `npm run pont -- <long>` (par ex. `L06`, `C02`, `L07`) écrit dans `renders/pont-<dossier>/` les textes prêts à copier (`pont-<dossier>.md`) et les visuels des stories. Essai : `--out <dossier temporaire>`.

## Ce qu'Instagram permet vraiment (vérifié le 13/11/2026)

| Levier | Cliquable ? | Ce qu'on en fait |
| --- | --- | --- |
| **Autocollant « Lien » en story** | oui, pour tous les comptes, **un seul par story** | le cœur du système : chaque story du pont porte le lien du film |
| **Liens de la bio** | oui, **jusqu'à 5**, mais seul le premier s'affiche en clair (« et N autres ») | lien 1 = toujours le dernier long, lien 2 = la chaîne, lien 3 = TikTok |
| **Légende d'un Reel ou d'un post** | **non** : une adresse y reste du texte. Meta teste depuis mars 2026 des liens cliquables réservés aux abonnés Meta Verified (payant, plafonné à quelques liens par mois) | on n'y met pas d'adresse ; on y met la phrase d'appel « lien en bio » |
| **Commentaire épinglé** (3 au plus par publication) | non | « lien en bio, ou cherche « Système Décodé <mot> » sur YouTube » : la recherche est le lien de secours |
| **À la une (Highlights)** | les stories gardées y gardent leur autocollant | un « À la une » **Films** : une story de lien par long, les plus récents d'abord |
| **Sondage, compte à rebours** (autocollants de story) | — | le compte à rebours rappelle la sortie à qui l'a touché ; le sondage fait voter avant d'envoyer au film |
| **Canal de diffusion** | à vérifier dans l'appli avant de compter dessus | pas maintenant : on l'ouvre si les stories de lien plafonnent (voir « Plus tard ») |
| **Message automatique sur commentaire** (« commente FILM, je t'envoie le lien ») | oui, en DM | **non** : il faut brancher un service tiers et lui ouvrir le compte ; et un mot à commenter casse la question à deux camps |
| **Collab** (publication à plusieurs comptes) | — | quand un créateur ou une marque s'y prête (le portfolio : `docs/portfolio-instagram.md`) |

Sources : guides 2026 qui citent l'aide d'Instagram (5 liens en bio, un autocollant de lien par story), presse spécialisée sur le test des liens en légende pour Meta Verified (mars 2026). Les détails des statistiques (clics par story, appuis sur les liens de la bio) se vérifient dans l'appli à la première relève.

## Le plan, par ordre d'impact attendu

1. **Le premier lien de la bio = le dernier long, toujours.** C'est le seul lien qu'on voit sans toucher « et autres », et la bio est visitée ≈ 100 000 fois par mois (relevé du 03/11). Changé le jour de chaque sortie, à la minute où le film est public.
2. **La légende des courts déjà en ligne qui renvoient à un long**, retouchée une fois (… → Modifier) avec la phrase d'appel, et le commentaire épinglé. Ce sont nos Reels les plus vus qui continuent de tourner : le 004 (826 k vues) et le 016 (331 k) mènent au L02, le 015 (377 k) et le 007 au L04, les 002, 011, 013, 014, 019, 025 au C01. Ça ne coûte qu'une fois et travaille ensuite tout seul. La table des liens court → long est celle du bureau (`front/bureau.js` → `RELATED`, ou `post.youtube.related` d'un dossier) : un court n'est relié qu'à un long qui prolonge vraiment son sujet.
3. **La séquence de stories autour de chaque sortie** (ci-dessous) : quatre stories, dont trois avec le lien.
4. **L'« À la une » Films** : la story de lien de chaque long y reste, avec sa couverture (`couverture-a-la-une.png`).
5. **Le Reel de la promo HSnn** quand le long en a une : il sort J0 vers 19 h 30, une fois le film public et les liens posés (`docs/recette-promo.md`, « L'ordre de sortie »). Pas de promo, pas de Reel : on n'en fabrique pas une pour le pont.
6. **Le catalogue** : deux stories de lien par semaine, lundi et vendredi à 21 h, chacune sur un long plus ancien, à tour de rôle (`npm run pont -- L02`, puis `L03`… : `story-rappel.png`).

## La séquence de stories d'une sortie

Le long sort à 18 h (ordre validé le 27/10), le court du soir à 20 h. Les stories passent après le court, quand le compte est le plus regardé, sauf celle du lien, posée dès que le film est public.

| Quand | Visuel | Autocollant | Pourquoi |
| --- | --- | --- | --- |
| **J-1, 21 h** | `story-annonce.png` | compte à rebours sur J0 18 h | ceux qui le touchent reçoivent le rappel à la sortie |
| **J0, 18 h 05** | `story-lien.png` | lien → le film, texte « LE FILM · 12 MIN » | la première vague ; elle va dans l'« À la une » Films |
| **J0, 21 h 30** | `story-sondage.png` | sondage, les deux camps de la question du film | on vote en un geste ; la question vient de la description du long (« Et toi : … ? ») |
| **J0, juste après** | `story-lien.png` reposée | lien | qui vient de voter tombe sur le lien |
| **J+2, 20 h 30** | `story-rappel.png` (« Tu l'as raté ? ») | lien | ceux qui n'ont pas ouvert Instagram le soir de la sortie |

Les visuels : la miniature du long en grand (celle que le spectateur retrouvera sur YouTube : il reconnaît ce qu'il cherche), son titre en dessous, une case marquée pour l'autocollant (y 1452–1570), l'en-tête du compte ; rien dans le haut (barre d'Instagram jusqu'à y ≈ 250) ni sous y ≈ 1640 (barre de réponse). Trois couleurs, Barlow Condensed et JetBrains Mono, pas de logo de plateforme. Un long qui sort un jour sans court du soir garde les mêmes heures.

**Un film qui n'est pas public n'a aucune story de lien.** `npm run pont` le signale s'il n'est pas coché sur YouTube au bureau.

## Les textes

**La bio Instagram** (proposée le 13/11, à poser après le oui de Merwan, puis à recopier dans `brand/profil.json` → `bios.instagram`) :

```
Ils veillent pendant que tu dors.
On les décode, un système à la fois.
Chaque soir un dossier ici. Les films complets, sur YouTube :
```

132 caractères (150 au plus). Les deux points finissent sur les liens, juste dessous. Plus de hashtags dans la bio : un hashtag y est un lien qui fait sortir du profil vers d'autres comptes, l'inverse du but. Pas d'emoji.

**Les liens du profil** : 1. « Nouveau film : <titre court> (12 min) » → le film · 2. « Tous nos films sur YouTube » → la chaîne · 3. « TikTok ». Le lien 1 change à chaque sortie (le `.md` du pont donne l'adresse : il la retrouve seul dans le flux public de la chaîne, sinon `--video <id>`).

**La phrase d'appel dans une légende de court** : posée juste avant la question de fin (la question reste le dernier mot, règle du compte) :

```
Pour aller plus loin : « <titre YouTube du long> ». Le film complet (12 min) est sur notre chaîne YouTube, lien en bio.
```

Elle n'entre que dans la légende d'un court qu'un long prolonge vraiment (la table `RELATED`). Pour un court pas encore sorti, `npm run pont` donne la légende entière à poster ; pour un court en ligne, la légende retouchée. Cinq hashtags au plus, inchangés.

**Le commentaire épinglé** (Reel de la promo et courts liés) :

```
Le film complet (12 min) est sur notre chaîne YouTube : lien en bio, ou cherche « Système Décodé <mot cherché> ».
```

Le mot cherché est `post.youtube.keyword` du long : c'est celui pour lequel le titre et la description sont écrits.

## Mesurer le transfert

YouTube Studio ne lit pas les paramètres UTM sur une adresse youtube.com : un lien « distinct par levier » ne se voit pas côté YouTube. **On compte donc le clic côté Instagram, levier par levier, et l'arrivée côté YouTube, au total.**

- **Instagram, J+1 et J+7** : chaque story → Statistiques → clics sur le lien et vues (une story n'a qu'un lien : sa ligne est son levier) ; profil → tableau de bord professionnel → appuis sur les liens externes (tous les liens de la bio ensemble). Dans `metrics/pont.json`.
- **YouTube Studio, J+7** : le film → Statistiques → Portée → Sources de trafic → **Externe** → la ligne Instagram (vues, heures de visionnage), et la part « Accès direct ou inconnu » : un lien ouvert dans le navigateur d'Instagram, sans compte connecté, peut y tomber. Dans `metrics/pont.json`.
- **Chaque jour, tout seul** : les abonnés YouTube, lus par le bureau dans `metrics/comptes.json`. On compare la semaine d'une sortie à la précédente.

Le verdict se lit au bout de trois longs : clics par story de lien, et heures venues d'Instagram par long. Une story qui fait moins de 1 % de clics sur ses vues se change (l'image, ou l'heure) avant de changer de levier.

## Plus tard (pas maintenant, et pourquoi)

- **Le canal de diffusion** : une notification dans la messagerie des membres, qui en fait le canal le plus direct ; mais il faut que les gens s'y abonnent, et il faut vérifier dans l'appli que les liens y sont cliquables. On l'ouvre si, après trois longs, les stories de lien plafonnent.
- **Un Reel taillé dans un long** : ce serait une nouvelle chaîne de fabrication ; la promo HSnn et les courts liés tiennent ce rôle.
- **Le message automatique sur commentaire** : un service tiers à brancher sur le compte, refusé tant que Merwan ne le demande pas.

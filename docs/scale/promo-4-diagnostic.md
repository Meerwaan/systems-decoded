# Promo · 4 · Pourquoi les hors-séries ne percent pas (diagnostic du 27/10)

Sources lues : recettes promo, `promo-1`, `promo-3`, `episode.json` et `audio/vo.json` de HS01 à HS04 et de 009, 010, 015, `metrics/audience.json`, `metrics/publication.json`, `docs/memoire/audience.md`. Aucune recherche web, aucune image.

**Prévenir d'abord : il n'existe aucun chiffre de promo dans le dépôt.** `metrics/audience.json` s'arrête au 019 et ne contient ni HS01 à HS03, ni les courts 020 à 028. Tout ce qui suit sur « pourquoi ça ne perce pas » est une **hypothèse** tirée des scripts, des minutages de voix et des dates. Les seuls faits prouvés sont marqués **[prouvé]** (lus dans un fichier).

## 1. Le verdict en 5 lignes

1. **Cause n° 1 (hypothèse forte) : la promo n'a ni danger où le spectateur se trouve, ni événement joué.** Les trois hits ont une scène d'enjeu (015 : « Le pont, lui, finit dans la *mer* », 10 → 17 s) puis un beat où l'événement se déroule, système en action (015 `zero` → `arret`, 35,9 → 51,0 s ; 009 `zero` → `coupe` ; 010 `zero` → `arret`) **[prouvé : structure des scripts]**. Les promos coupent avant l'événement : HS04 finit sur « La pression monte… *monte*… » (42 → 49,6 s) puis passe aux commentaires ; HS03 sur « un moteur *tourne* encore… » ; la scène de HS04 est un teaser cryptique (« ce qui va briser ta pièce… se cache sous tes *roues* »), pas une scène.
2. **Cause n° 2 (hypothèse) : la question C est une curiosité de vocabulaire, pas un enjeu.** 015 : « Sauf si tu le rates… ou s'il *casse*. » (je peux mourir ou rater) ; 009/010 : « Toi… tu poses le *tien* ? » (mon doigt). HS04 : « Devant toi, le chien jaune : pourquoi « chien » ? » (une étymologie, un mot que 95 % ne connaissent pas, posé à 7,3 s). HS03 « ton sac, tu le prends ? » est meilleure (personnelle), HS01 et HS02 sont des listes.
3. **Cause n° 3 (base rate, en partie prouvée) : TikTok est une loterie, pas un plancher.** Sur les 17 premiers courts, 3 font 65 % des vues ; médiane ≈ 6 à 15 k, 9 sur 17 sous 15 k **[prouvé : audience.json]**. Quatre promos sous 15 k ne prouvent pas, seules, que la forme est mauvaise ; et les courts 018 à 028 ne sont pas mesurés dans le dépôt : si eux aussi sont sous 15 k, ce n'est pas les promos.
4. **Cause n° 4 (dates prouvées, effet hypothèse) : les promos sortent dans l'ombre d'un dossier et parfois avant leur long.** HS01 TikTok 16/10 17:37, 36 min après le 020 (17:01) ; HS02 TikTok 20/10 21:28, 36 min avant le 024 (22:04), et avant le L02 (22:05) ; HS03 TikTok 21:30, 2 h 23 après le 027 (19:07) **[prouvé : publication.json]**.
5. **Ce qui n'explique PLUS HS03 et HS04** : l'annonce à 11 s et l'absence de morceau payé (corrigées depuis le HS03 : « on l'ouvre » à 19,2 s, rendez-vous à 53,6 s). Si HS03 ne perce pas non plus, la correction de forme de `recette-promo.md` n'a pas suffi : on retombe sur 1 et 2.

## 2. Les leviers, classés par gain attendu

Comparaison de base (minutages `vo.json`) : 015 accroche 0 → 3,7 s, scène 9,0 → 17,2 s, « on l'ouvre » 17,2 s, événement 35,9 → 51,0 s, chute 56,5 s. HS04 accroche 0 → 2,6 s, scène 10,0 → 18,5 s, « on l'ouvre » 18,5 s, test 42,0 → 49,6 s (coupé), rendez-vous YouTube 55,0 → 60,5 s (8,5 % du film ; 015 : 0 s « ailleurs »). Annonce de la promo : HS01 à 10,6 s, HS02 à 10,2 s, HS03 et HS04 seulement en fin (53,6 et 55,0 s). Parole « sur le film ailleurs » : HS01 11,2 s, HS02 11,2 s, HS03 5,5 s, HS04 5,5 s.

| # | Levier | Ce qu'on change dans la recette (mot pour mot) | HS04 aujourd'hui ? |
| --- | --- | --- | --- |
| 1 | **Jouer l'événement, retenir le pourquoi** | Dans `recette-promo.md`, « le test du long : coupée au noir avant l'impact » devient : « **L'événement visible se joue en entier dans la promo (la pièce agit, du début à la fin, 8 à 12 s) ; ce qui reste dans le long, c'est le pourquoi** (la réponse à la C, la chute, la cause) : jamais le résultat du danger. » Le spectateur doit voir *ce qui arrive* ; il ne doit pas savoir *pourquoi*. | Oui, la seule chose réaliste : voir le tir (voir §3). |
| 2 | **La C est un enjeu personnel, jamais un mot** | Ajouter à la recette : « **La C répond à « qu'est-ce qui m'arrive ? », jamais à « comment ça s'appelle ? ».** Interdits en C : une étymologie, un nom de métier, un surnom. Test : peut-on la remplacer par « tu y survis ? » / « tu le rates ? » / « tu le tentes ? » sans changer le sens ? Sinon, elle est à refaire. » | Oui : c'est la ligne à changer. |
| 3 | **La scène a un danger où le spectateur est, pas un teaser** | « La scène (10 → 18 s) tient en 30 mots, **une image, un enjeu et un chiffre qui fait peur par phrase** ; jamais une phrase qui annonce qu'une chose va arriver (« ce qui va briser… »). » (modèle : 015 `scene`). | Oui. |
| 4 | **Le mot que personne ne connaît ne va pas dans les 10 premières secondes** | « Dans l'accroche, aucun mot technique ou d'argot que 95 % du public ne reconnaît (« chien jaune », « brin », « consignation ») : il arrive dans le morceau payé, après qu'on l'a montré. » | Oui : « chien jaune » sort de l'accroche. |
| 5 | **Une promo sort seule dans sa soirée, après son long, entre 19 h et 22 h** | Dans la section « L'ordre de sortie » : « **Aucun autre court le même jour sur la même plateforme ; le long d'abord (au moins 30 min avant), jamais une promo avant son long** ; une promo le jour de pause d'un dossier. » | Oui : ne pas poster de dossier le 27/10 ; vérifier que le L04 est public avant. |
| 6 | **La légende TikTok est courte** | « Légende TikTok : 150 caractères au plus ; ligne 1 = le mot cherché + l'enjeu ; fin = la question à deux camps ; le rendez-vous YouTube n'y figure pas (il est dans l'épinglé). » La légende HS04 fait ≈ 380 caractères, avec « lien en bio » au milieu. | Oui. |
| 7 | **Moins de temps « ailleurs » en fin de film** | « Le rendez-vous tient en 3 s (une phrase) ; la boucle suit sans pause. » HS04 : 5,5 s (« Le film complet, dix minutes, du lancement au retour de nuit : sur notre chaîne YouTube. Le lien est en bio. »). Hypothèse : c'est la zone où le 015 perdait déjà 14 points (58 → 74 s). | Oui, couper à une phrase. |
| 8 | **Le décompte reste affiché** | Reprendre pour les promos la règle des courts : un chrono / décompte visible du début à la fin (le « compteur de fils » de 34 px n'a jamais été lisible, `promo-3`). Pour le HS04 : un décompte « 3 · 2 · 1 » sur le pont. | Si l'image le permet sans refaire la 3D ; sinon non. |
| 9 | **Le thème prouvé, l'angle miroir** | Le sujet porte-avions + Rafale a fait 100 k (015). Un angle qui reprend la forme du 015 (danger à la 2ᵉ personne, événement, chute) : « *Tu es à deux secondes de la mer* ». À vérifier dans les faits du L04 avant d'écrire. | Oui, sous réserve des faits. |
| 10 | **Décider sur des chiffres, avec une règle d'arrêt** | Garder la règle de `promo-1` §1.4 (vues ÷ médiane des courts de la semaine, par plateforme) **et l'appliquer au HS03 et au HS04 avant d'écrire le HS05**. | Non, c'est pour la suite. |

## 3. Le HS04 précisément (dix lignes au plus)

**À garder** : « Alors… on l'ouvre. » à 18,5 s (comme le 015 à 17,2 s) ; le fil vapeur → réacteurs nucléaires (« Ce qui le fait avancer… va te *lancer*. », c'est le meilleur paradoxe du film) ; la boucle ; le thème (porte-avions) ; « 240 à l'heure, en 75 mètres » comme chiffre.
**À réécrire** :
1. **Accroche** : sortir « le chien jaune » et « une pièce le retient » de l'accroche. Forme du 015 : un danger immédiat, à la 2ᵉ personne. Exemple à vérifier dans les faits du L04 : « Tes moteurs sont à *fond*. Ton Rafale ne bouge *pas*. » (A, on garde) / « Dans deux secondes : 240 à l'heure… ou la mer. » (B, si l'échec de tir est documenté ; sinon « 240 à l'heure, en 75 mètres : ton corps le sent. »).
2. **C** : remplacer « le chien jaune : pourquoi « chien » ? » par un enjeu qui se vérifie : « Et si la pièce qui te retient *casse trop tôt* ? Toi, tu fais quoi ? » (réponse dans le long).
3. **Scène (10 → 18,5 s)** : une image et un enjeu par phrase, 30 mots, danger visible (« 75 mètres de pont, puis le vide ») ; supprimer « Ton chien jaune ne dit pas un mot » ici, il n'a pas encore été introduit.
4. **Le chien jaune** passe dans le morceau payé (« Ce marin, en jaune, devant toi, on l'appelle le *chien*… »), une fois, après qu'on l'a vu à l'image ; la question à deux camps du commentaire peut le garder (« ses gestes… ou un cri ? »).
5. **Le test (42 → 49,6 s)** : jouer le tir en entier (de « La vanne s'ouvre » au bout du pont, 6 à 8 s) ; le long garde le pourquoi de la pièce qui casse.
6. **Rendez-vous** : une phrase de 3 s (« Le film entier, dix minutes : notre chaîne YouTube, lien en bio. »).
7. **Légende TikTok** : « Porte-avions Charles de Gaulle : moteurs à fond… et ton Rafale ne bouge pas. Une pièce le retient : tu la connais ? » (≈ 120 caractères).
8. **Publication** : le L04 public d'abord ; HS04 dans l'heure, 19–22 h ; aucun dossier le même jour.
Coût d'un script réécrit sans refaire l'image : une reprise de voix de 3 à 4 phrases (`--retake`), le montage existant ne bouge que sur le test et l'accroche ; annoncer le coût à Merwan avant (`npm run voice` sans `--budget`).

## 4. Les chiffres à demander à Merwan (HS01 à HS03)

Pour **chaque** promo, et pour les **courts de la même semaine** comme référence (020, 024, 027) :

- **TikTok** (7 premiers jours, capture « Fidélisation » comme pour le 015) : vues ; durée moyenne ; % à 0:01, 0:07, 0:11, 0:25 ; part « Pour toi » ; vues du profil ; clics sur le lien en bio ; abonnés gagnés.
- **Instagram** (Meta Business Suite → Statistiques → Contenu) : vues, couverture, durée moyenne, partages ; clics sur le lien en bio et sur l'autocollant de la story.
- **YouTube Shorts** (Studio) : vues, « Ont continué de regarder », durée moyenne ; **dans le L01, L02, L03 → Audience → Sources de trafic** : part « Shorts » et « Sources externes » (instagram.com, tiktok.com), sur 48 h et 7 jours.
- **Ce qui tranche** : (a) si les promos sont à ≈ 1 × la médiane des courts de leur semaine **sur chaque plateforme**, c'est la plateforme, pas la forme ; (b) si elles sont nettement sous 1 sur TikTok **et** sur Shorts mais à 1 sur Instagram, c'est la forme (inconnus contre abonnés) ; (c) si TikTok a la même courbe que les courts mais n'envoie personne sur le long, c'est le pont (lien en bio, ordre de sortie) ; (d) si les **courts 020 à 028** sont eux aussi sous 15 k, ce n'est pas les promos.

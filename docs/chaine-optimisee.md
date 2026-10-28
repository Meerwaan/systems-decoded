# La chaîne optimisée d'un dossier (27/10)

Le but de Merwan : **moins de jetons, plus vite, même qualité ou mieux, sans toucher au fond** (récit, DA, accroche, voix, ordre des appels, exactitude). Ce qui change : chaque rôle est un **type d'agent défini une fois** (`.claude/agents/`), un **chef de production** orchestre le dossier à la place d'une grosse conversation, et les retouches passent à un agent neuf. Les recettes de fond ne bougent pas (`docs/recette-*.md`) ; les définitions y renvoient.

## 1. Ce que coûte un dossier aujourd'hui (`metrics/production.json`, journaux du 21 au 23/10)

| Rôle (modèle) | Par agent | Par dossier | Remarques |
| --- | --- | --- | --- |
| faits + contre-vérification (sonnet) | 200 k / 4 min · 177 k / 3 min | ≈ 0,4 M | pèse peu dans la jauge ; long L02 : 9 relecteurs = 1,7 M |
| architecte (session) | 470 k (335–622 k), 28 min (max 49) | 0,5 M + intégration 0,27–0,65 M (architecte repris) | |
| décors (session) | 412 k (max 670 k), 29 min (max 61) | court 0,8–2,2 M · long 1,4–1,8 M | le poste n° 1 d'un court ; il fixe la durée de l'étape |
| décorateur (session) | 170–510 k, 13–32 min | 0,2–0,5 M | 026 : 102 appels, deux fois la recette |
| actes / chapitres (session) | 333 k, 18 min (max 49) | court 1,3–2,0 M · long 2,2–2,5 M | 84 agents mesurés |
| reprises par `SendMessage` (session) | **0,35–0,69 M chacune** | court 0,3–0,7 M · **L04 4,3 M (9 reprises), L03 ≈ 20 reprises** | le poste n° 1 d'un long (44 % du L04) |

Total : **court ≈ 4 M** de jetons d'agents (3,0 à 5,5 M, 026 → 030), ≈ 55 à 80 points de fenêtre de 5 h, deux fenêtres, 3 à 4 h de travail effectif ; **long ≈ 10 M** (L04 9,8 M ; L03 4,5 M notés + une vingtaine de reprises non notées), ≈ 4 h de 3D. Plus la conversation qui orchestre : > 500 k de contexte relus à chaque appel (≈ 100 appels), jamais comptée dans `production.json`.

**Ce qui se répète** : la même consigne réécrite à la main pour chaque agent (`consigne-architecte.md`, `-decor.md`, `-acte.md`… recopiées de nuit en nuit) ; les mêmes lectures dans chaque agent (`CLAUDE.md` de 211 Ko ≈ 60 k jetons chargé d'office dans CHAQUE agent ; les fichiers du kit lus en entier ; au L04, le plan de 98 Ko lu en entier par six agents). **Ce qui a été refait** : les reprises (L03 ≈ 20, L04 9 + 3 sur deux brouillons, 026 acte 1 0,69 M, 028 acte 1 par un agent neuf 0,27 M) ; les sons posés sur un mot (6 à 9 par film, replacés à la main) ; les « on l'ouvre » repris en voix (une reprise sur huit retenue). **Ce qui a cassé** : la fenêtre de 5 h coupée deux fois par des agents lancés sous le seuil (8 à 9 points par agent et par heure) ; l'hebdo à 100 % ; des images parasites au brouillon (deux tweens qui se chevauchent, rayures traversées vite, fondu hors image) ; l'azimut écrit à l'envers (021) ; des repères `beat:mot` qui attrapent un autre mot ; les décors du 023 morts sans rien écrire.

**Le modèle de coût, pour décider** : le chiffre d'une notification de fin d'agent est la **taille de son contexte à la fin** (une reprise du c1 du L04 : 0,42 M → 0,46 M) ; ce qu'il consomme vraiment, c'est ce contexte **relu à chaque appel** (≈ appels × contexte moyen). Mesuré : ≈ 13 à 14 points de fenêtre par million rapporté. D'où les trois leviers : un contexte de départ léger, peu d'appels, et ne jamais réveiller un agent obèse pour dix appels.

## 2. La chaîne d'un court (voix enregistrée → film)

Avant : la conversation principale garde Merwan — sujet, `faits` (sonnet), `scenariste` (session) et `contre-verif` (sonnet), en parallèle de plusieurs dossiers (`docs/salle-d-ecriture.md`), **accroches et devis voix en un seul oui pour tout le lot** (`npm run salle`), voix. Puis elle lance UN agent : `chef-de-production`, « Dossier 031, de l'architecte au rendu » + deux lignes.

| Étape | Qui (type, modèle) | Parallèle | Durée visée | Ce que le chef lit |
| --- | --- | --- | --- | --- |
| 1. Contrat | `architecte` (session) | 1 | 25 min · ≈ 0,40 M | son message (15 lignes) |
| 2. Décors | `decor` × 2 (session) — un décor du catalogue ne se modélise pas | 2–3 | 30 min · ≈ 0,38 M chacun | leurs messages ; les « À changer ailleurs » (lignes exactes) |
| 3. Intégration + première image | le chef lui-même (`Edit`, une planche de 4 candidates) | — | 10 min · 0 agent | une planche (≈ 1,6 k) |
| 3 bis. Habillage | `decorateur` (session), pendant l'étape 3 ; rien si le lieu est réutilisé habillé | 1 | 15 min · ≈ 0,20 M | son message, sa planche avant / après |
| 4. Actes | `acte` × 4 (session) | 4 | 20 min · ≈ 0,29 M chacun | leurs messages (12 lignes) |
| 5. Relecture | le chef : 4 planches de 7–8 vignettes à 270 px, puis `check`, brouillon, `qa` | — | 15 min | 4 planches, la fin de `qa` |
| 6. Retouches | `retoucheur` × 1–2 (session), UNE vague, tous les défauts d'un fichier dans une consigne ; le trivial (un son, un repère) par le chef | 1–2 | 15 min · ≈ 0,15 M chacun | leurs messages (8 lignes) |
| 7. Fin | le chef : rendu, `qa`, couverture, copie téléphone, `posts.mjs`, `chrono` | — | 15 min | la fin de `qa` |

**≈ 2 h 15, ≈ 3,1 M de jetons d'agents, ≈ 45 à 50 points de fenêtre (chef compris) : un court tient dans UNE fenêtre** s'il part sous ≈ 35 % (sinon : contrat + décors + habillage dans la première, le reste dans la suivante).

## 3. La chaîne d'un long

Même partage avec la conversation principale (faits en deux passes, `contre-verif` sur tout le script, script, emballage, devis, voix par chapitre). Le chef : `architecte` (40 min, ≈ 0,5 M) → `decor` × 3 en partant de `kit/lib/usine.js` / `postes.js` (≈ 0,40 M chacun) → intégration et planche de six candidates **par le chef** (l'architecte repris coûtait 0,65 M au L04) → `decorateur` × 1 (≈ 0,35 M) → `chapitre` × 6 en deux vagues de trois (≈ 0,35 M chacun : chacun ne lit que sa section du plan) → relecture (5 planches de 12 vignettes à 400 px) → brouillon, `qa` → **une vague de `retoucheur`** (≈ 0,15 M par fichier, au lieu de 0,46 M par reprise) → rendu, `qa`, `srt`, miniatures (planche à 160 px d'abord). **≈ 3 h, ≈ 5 M de jetons d'agents, deux fenêtres.**

## 4. Ce que le chef lit, et ce qu'il ne lit pas

Il lit : `docs/chaine-optimisee.md`, `docs/journal/<ep>-etat.md` (sa mémoire, qu'il tient), les **messages finaux** des agents, ses planches, la fin de `qa`. Il ne lit pas : un fichier source, un dossier de faits, un journal en entier (seulement la section qu'un message désigne), une sortie de rendu (jetée). Il n'appelle rien pendant qu'une vague tourne (une vague = plusieurs `Agent` dans un message : elle revient quand tous ont rendu). Au-delà de 200 k de contexte, il écrit l'état et rend la main ; un chef neuf reprend sur l'état. Vérifié le 21/10 : un agent lancé par la conversation peut lancer ses propres agents (le chef de la nuit des cinq courts).

**La jauge** : `get_usage` avant chaque vague ; une vague part seulement si fenêtre + agents × 9 points × heures prévues ≤ 85 % et hebdo ≤ 92 % ; quatre agents du modèle de la session à la fois au plus ; sinon « EN FILE », et la conversation principale programme le réveil. Un agent coupé par la limite se reprend par `SendMessage` (son travail est dans son contexte : c'est le seul cas où ce contexte vaut son prix).

## 5. Les leviers, chiffrés

| Levier | Avant | Après | Gain |
| --- | --- | --- | --- |
| **Retouches par un `retoucheur` neuf, en une vague** (fichier + journal + liste fermée, 12 images, 20 appels) | 0,35–0,69 M par reprise ; L04 9 reprises 4,3 M | ≈ 0,15 M par fichier | **long ≈ −3,4 M ; court −0,3 à −0,5 M** |
| **Contexte de départ léger** : `CLAUDE.md` 211 → 32 Ko (chargé dans chaque agent), têtes de fichiers au lieu des fichiers (`grep "^export"`), section du plan au lieu du plan | ≈ 60 k + 20–30 k de lectures inutiles par agent | ≈ 9 k + l'utile | ≈ −15 à −20 % par agent du modèle de la session : **court ≈ −0,6 M, long ≈ −1 M** (et davantage en consommation réelle) |
| **Le chef au lieu de la grosse conversation** ; intégration par lui-même | intégration 0,27–0,65 M ; conversation > 500 k relue ≈ 100 fois | 0 ; chef < 200 k | **−0,3 à −0,65 M par dossier**, plus la conversation (non mesurée dans `production.json`) |
| Réutiliser avant de modéliser (`docs/catalogue.md`, lu d'abord par l'architecte et les décors) | 2 à 4 décors neufs | 1 à 2 | ≈ −0,4 M et −30 min par décor évité |
| Plafonds d'appels par type (décor 45, acte 40, décorateur 30) | décorateur du 026 : 102 appels, 0,51 M | ≈ 30 appels | −0,1 à −0,3 M |
| Couper le fichier le plus lourd (un décor par lieu, `acte2b.js` au-delà de ≈ 14 phrases) | étape au pas de l'agent le plus lent (49 à 61 min) | ≈ 30 min | −15 à −25 min, jetons neutres |
| Planches lisibles (8 vignettes à 270 px au lieu de 28 sur 4 600 px) | relecture à ≈ 110 px par vignette | 270 px | même coût (≈ 1,6 k par planche), moins de plans faibles ratés |

**Les images ne sont pas le gros poste** : une planche est un fichier (≈ 1,6 k jetons), 30 images d'un agent ≈ 4 planches ≈ 6 k sur 400 k. Les budgets d'images servent au temps (`look`) et à la discipline ; c'est le texte lu et le nombre d'appels qui coûtent.

## 6. Avant / après (estimations, à mesurer sur le 031 et le L05)

| | Jetons d'agents | Fenêtres de 5 h | Durée de la 3D | Hebdo |
| --- | --- | --- | --- | --- |
| Court, avant (026 → 030) | ≈ 4 M (3,0–5,5) | 2 (≈ 55–80 points) | 3 à 4 h | +6 à +8 |
| **Court, après** | **≈ 3,1 M** (−25 à −35 %) | **1** (≈ 45–50 points) | **≈ 2 h 15** | **≈ +4 à +5** |
| Long, avant (L04) | ≈ 9,8 M | 2+ | ≈ 4 h | +11 |
| **Long, après** | **≈ 5 M** (−50 %) | **2** | **≈ 3 h** | **≈ +6** |

## 7. Ce qui passe sur sonnet, et ce qui n'y passe pas

- **Déjà sur sonnet, gardés** : `faits`, `contre-verif` (mesurés : rien de perdu, 4 à 7 phrases corrigées par script).
- **Proposé, à essayer une fois avec l'accord de Merwan** : le `decorateur` sur sonnet — trois à six touches, encadrées par une planche avant / après que le chef juge ; si l'image 0 ou un plan perd à 270 px, on revient. Gain attendu : ≈ 0,2 M de modèle de la session par dossier.
- **Non** : `architecte`, `decor`, `acte`, `chapitre`, `retoucheur` (c'est la 3D principale : aucune preuve qu'un modèle léger tient la barre, et une image ratée coûte une reprise) ; la relecture des planches (règle de Merwan : jamais de relecteur par agent — elle reste au chef) ; les retouches mécaniques n'ont pas besoin d'agent du tout (le chef les fait).

## 8. À décider par Merwan

1. Un long : **un seul `contre-verif` sur tout le script** au lieu d'un relecteur par chapitre (L02 : 9 agents, 1,7 M ; la machine compte désormais les fins à plat, les chiffres et les balises) : ≈ −1,4 M.
2. L'essai du `decorateur` sur sonnet (§ 7).
3. Le chef de production pour tout dossier (déjà fait la nuit du 21/10) : il ne valide jamais une accroche, une dépense de voix ni une publication à sa place ; il s'arrête et rend la main.

Journal de la passe : `docs/journal/opti-2026-10-27-chaine.md`.

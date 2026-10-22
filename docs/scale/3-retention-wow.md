# 3 · La rétention et l'effet « wow » : les détails (agent 3, 21/10)

Mission : ce qui fait rester seconde après seconde, revoir, commenter, s'abonner — d'abord sur TikTok. Changement de cap en cours de route : les essais se font sur le **025 (ESP)**, prochain à poster, rendu à nouveau avec ces améliorations ; Merwan : « la version là est déjà très bien » → chaque dispositif gardé est un gain mesuré ; dans le doute, retiré.

## Ce que Merwan tranche (oui / non)

1. **Le son du 025** — écouter `025-avant-0-25s.mp3` puis `025-apres-0-25s.mp3` (mêmes mots, même voix, même niveau). Oui : on garde la grille sonore. Non : on remet l'ancien `sfx` (sauvegardé).
2. **Le commentaire en deux réponses** (AVANT 2014 / APRÈS 2014, chacune allumée sur son mot ; avant, le champ tapait « APRÈS » à la place du spectateur). Oui / non.
3. **Les deux mots qui frappent** (« décroche », « fort » : l'objectif se resserre de 6 % une demi-seconde, un coup dans le souffle qui suit). Oui / non.
4. Si 1 à 3 passent : **la grille devient la règle des prochains dossiers** (déjà écrite dans `docs/recette-actes.md`, prête dans le modèle). Oui / non.

## 1. Le diagnostic

### Les chiffres qui comptent

- **Les courbes TikTok du 015 et du 012** (captures du 21/10) : deux fuites, la première seconde (« la plupart ont cessé de regarder à 0:01 »), puis de la fin de l'accroche à ≈ 25 s (015 : 56 → 40 %, −16 points en 11 s ; 012 : 48 → 27 %, −21 points).
- **YouTube mesure la première seconde** (« ont continué de regarder ») : sur les films postés à partir du 8, c'est le meilleur prédicteur des vues TikTok qu'on ait. 010 68,8 % → 31 k · 015 67,3 % → 96 k · 012 65,2 % → 15 k · 016 62,7 % → 12 k · 009 61,2 % → 48 k · 011 59,8 % → 15 k · 014 59,6 % → 16 k · **013 56,2 % → 6 k · 017 53,1 % → 5 k** : les deux plus faibles à la première seconde sont les deux plus faibles sur TikTok. Le repère public (tiers, non officiel) est 70 à 80 % : la première seconde fuit sur tous nos films, même le meilleur.

### La première seconde : ce que fait le 015 et pas les autres

Mesuré sur les films rendus (`renders/*.mp4`, aucune commande sur les épisodes des autres) : le **mouvement** = l'écart moyen d'une image à la suivante sur une copie grise réduite (0–255).

| Film (vues TikTok) | Mouvement 0 → 0,5 s | Image 0 |
| --- | --- | --- |
| **015 brin d'arrêt (96 k)** | **9,8** | le Rafale de dos, ras du pont : deux tuyères rondes allumées comme des yeux, les étincelles de la crosse, le bout du pont qui luit en signal — la menace est déjà dans l'image |
| 010 scie (31 k) | 3,7 | la lame, la main à un centimètre des dents |
| 013 halo (6 k) | 3,6 | la F1 de côté, chargée, le casque petit |
| 014 ABS (16 k) | 3,3 | les feux du camion sous la pluie, la roue |
| 024 bloc (en ligne le 20/10) | 2,7 | une salle grise vue de loin, aucune menace visible |
| 025 ESP (avant) | 1,4 | le sanglier sur la route mouillée, tes phares derrière |
| 012 gazinière (15 k) | 1,3 | la casserole qui déborde, poussée lente |

Ce que le 015 fait dans ses dix premières secondes (images et `acte1.js` lus) : **(1)** l'image 0 est une silhouette iconique avec la menace dedans ; **(2)** l'avion arrive à vitesse réelle une demi-seconde, puis le temps s'épaissit (c'est le **monde** qui fonce, pas seulement la caméra) ; **(3)** le mot de l'accroche a son image sur le mot (« plein gaz » : les tuyères s'allument dur ; une étiquette résume le paradoxe, « TES ROUES TOUCHENT · PLEINE PUISSANCE ») ; **(4)** un changement de couleur franc sur le C (« ou s'il casse » : la scène passe au signal, sur une coupe). En face : 013 dit « et prend feu » à 3,6 s, le feu n'est à l'écran qu'à 7,6 s ; 024 dit « touche le métal » sur un point dans une boîte grise ; 014 dit « ta pédale se met à trembler » sur un pied de verre flou.

### La deuxième fuite (fin de l'accroche → 25 s)

- **L'image** : le 015 a un gros événement toutes les 2 à 3 s (10,0 · 12,0 · 16–17,5 coupe · 20,5 · 23,0 · 24,5) ; le 012 a trois plages lentes (9,5–12 · 14–16 · 17,5–20 s) ; le 025 avait 1,3 s figée sur le volant et 3 s quasi immobiles sur le capteur de lacet (mouvement 0,1 à 0,4), en plein dans la fuite.
- **Le son** : **l'habillage est muet sur un téléphone dans presque tous les films.** Attaques qu'un haut-parleur de téléphone joue (au-dessus de 400 Hz, habillage seul) de 0 à 25 s : 010 18 · 012, 013 4 · 015, 014, 024 3 · 025 2. Le 015 tient sans son : le son n'explique pas son succès — c'est un levier **jamais essayé**, d'où l'extrait à écouter. Un impact sous −14 dB n'a pas son craquement à 2 kHz : on ne l'entend que dans un casque.
- **Les sons posés sur un mot** (règle de Merwan : jamais) : 11 dans le 015, dont un riser sous « tu mets » ; dans le 025, un whoosh sous « décroche » et un riser sous « Alors… on ».

### Les portes et la fin

« Alors… on l'ouvre » a toujours un plan calme et lisible (bien) ; dans le 025, un riser montait par-dessus. Le seuil est bien tenu partout. **La fin du 025 tapait « APRÈS » dans le champ du commentaire** : la réponse à la question posée au spectateur — l'erreur relevée au 022 (« LES MASSES » tuait le commentaire).

### Le web (8 recherches)

Presque rien de solide : des blogs d'outils. À retenir, avec prudence : TikTok (guide PDF pour les PME) — 88 % des utilisateurs disent le son essentiel ; Smartly — 93 % des vidéos qui marchent ont du son ; la cadence des « ruptures » va de 2–3 s à 8–12 s selon les sources, sans données ; rien d'officiel sur les boucles ni sur les questions à deux choix (mécanisme plausible : répondre ne coûte rien). **Nos courbes valent plus que ce qu'on trouve** — sources : [TikTok, Creative Best Practices](https://ads.tiktok.com/business/library/Creative_Best_Practices_UKI_SMB.pdf), [Smartly](https://www.smartly.io/blog/top-5-tiktok-creative-best-practices), [OpusClip](https://www.opus.pro/blog/tiktok-length-format-retention-data), [Bytecap, repères Shorts](https://www.bytecap.io/research/youtube-shorts-retention-benchmarks), [AIR Media-Tech](https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8), [SocialKit](https://socialk.it/en/blog/tiktok-retention-watch-time-guide).

## 2. Les dispositifs (kit, en option)

Sans eux, un film reste ce qu'il était **à l'octet près** (preuves au § 3).

| Dispositif | Où | Une ligne dans un acte |
| --- | --- | --- |
| Le mot qui frappe : l'objectif se resserre, tient, relâche, sur le plan en cours | `kit/lib/direct.js` (`punch`, nombre d'état `punch`) | `D.punch(t.mot, 0.06)` |
| La rampe de vitesse de l'image 1 | `kit/lib/direct.js` (`glide`, exporté) | `shot(0, d, pose, glide(3, 0.5))` — **le sujet doit rester dans le cadre** |
| Le mot-clé du sous-titre qui arrive plus gros | `kit/lib/overlay.js` (`buildCaptions` → `hit`) ; `D.captionStyle` | `D.captionStyle({ hit: 0.25 })` |
| La question du commentaire en deux réponses | `kit/lib/blocks.js` (`duelCall`), `kit/brand.css` (`#duel`), `kit/template/index.html` | `duelCall(tl, { from, aAt, bAt, to, toneA: "signal", toneB: "veille" })` |
| Le son qu'un téléphone joue | `scripts/sfx.mjs` : `hit`, `click`, `swish`, `screech`, `suck`, `hush` ; `impact` → `crack` | une entrée dans `episode.json` → `sfx`, sur un repère |
| La mesure | `scripts/qa.mjs` → section « rythme » | `npm run qa -- <ep>` : mouvement de la première demi-seconde, plages lentes avant 25 s, attaques téléphone, **sons posés sur un mot** |

Pas faits, et pourquoi : la promesse visible de ce qui vient (l'en-tête et le seuil le font déjà ; un panneau de plus surchargerait), le détail caché pour la deuxième vision (il se décide à l'écriture, pas dans le kit), `review.mjs` (rien à y gagner pour cette mission).

## 3. La preuve, sur le 025

**Ce qui a changé** (repères `beat:mot`, aucune seconde en dur ; mots et voix inchangés) :

- **Le son** (`episode.json` → `sfx`, 18 → 47 entrées) : à 0,02 s un coup et un souffle qu'un téléphone joue (avant le premier mot) ; les pneus qui crissent dans les souffles et se taisent net quand le temps s'arrête ; le temps arrêté, l'habillage recule de 6 dB ; un coup dans le souffle après « décroche », « élan », « fort », « non », « redresse », et à chaque coupe de la scène ; la flèche à l'encre, la roue qui mord, les trois qui s'éteignent : un clic ; avant « Alors… », une respiration qui s'arrête net, puis l'habillage recule de 14 dB jusqu'à « on » ; l'éclaté : trois clics de pièces qui se posent, puis un clic par pièce nommée. Retirés : le whoosh sous « décroche », le riser sous « Alors… on ».
  - Attaques audibles sur téléphone, 0 → 25 s : **2 → 21** (010 : 18).
  - **Sous les mots, l'habillage est 2,5 dB plus bas qu'avant** (écart voix / habillage au-dessus de 400 Hz : 20,5 → 23,0 dB) ; **dans les souffles, 9,5 dB plus haut**. `qa` ne liste plus aucun son nouveau posé sur un mot (restent les 5 anciens : impacts sous « Tu », « l'ouvre », « freine », « Elle », blip sous « tourner »).
- **L'image** : l'image de l'accroche est **inchangée**. Deux mots frappent (« décroche », « fort » : −6 %, relâché avant toute coupe). Le volant et le capteur de lacet ont une poussée lente au lieu d'être figés. Les mots-clés des sous-titres arrivent 25 % plus gros.
- **La fin** : le duel AVANT 2014 / APRÈS 2014 remplace le champ qui tapait « APRÈS ».

**Essayé et pas gardé** : une rampe de vitesse sur l'image 1 (caméra à 3,4 fois sa vitesse moyenne, route à 3) : mouvement de la première demi-seconde 1,35 → 2,86, mais **le sanglier sortait du cadre à 0,7 s** ; la caméra calée sur la rampe de la route : le sanglier tenait, mouvement 1,45 — aucun gain, donc rien. Trois mots qui frappent de plus (« roue », « vraiment », « redresse ») : retirés dans le doute. Le craquement forcé sur l'impact de l'éclaté : il tombait sur « on l'ouvre ».

**Les contrôles** : `npm run check -- 025` passe (65/65 contrastes) ; aucune alerte `[direct]` : la dernière image est la première ; le kit sans ces options est identique à l'octet — `look --cpu` sur une copie du 024 avec l'ancien kit contre le kit d'aujourd'hui (carte d'accroche, sous-titres, seuil, commentaire) : fichiers identiques ; les habillages de 010, 013, 014, 024 et l'ancien 025, rendus de nouveau avec le nouveau `sfx.mjs` : identiques à l'octet ; le modèle, rempli hors d'`episodes/`, passe `check` sans alerte `[direct]`. Le brouillon, `qa` et le rendu : l'orchestrateur.

**Les fichiers** (dossier temporaire de l'agent 3, `…\scratchpad\`) : `extraits\025-avant-0-25s.mp3`, `extraits\025-apres-0-25s.mp3` (voix + habillage, gain du film entier à −14 LUFS, plafond) ; `025-avant-apres.jpg` (rendu du 18/10 / `look` du 21/10, sept instants légendés — `look` dessine un peu plus clair que le rendu : ce n'est pas un changement).

## 4. Les recettes

- `docs/recette-actes.md` → « La grille seconde par seconde : ce qui retient (21/10) » : la grille 0 / 0,5 / 10 / 25 s, chaque dispositif en une ligne, la règle « jamais un son sur un mot ».
- Le modèle : `kit/template/src/acte1.js` appelle `D.captionStyle({ hit: 0.25 })` et dit où mettre `D.punch` ; `kit/template/src/fin.js` montre `duelCall` ; `kit/template/index.html` porte `#duel`.

### À changer ailleurs (pas mes fichiers)

- `kit/template/episode.json` (agent 1) : une grille sonore de départ, sur les repères du modèle — `{"type":"hit","at":0.02,"gain":-13}`, `{"type":"swish","at":0.14,"dur":0.3,"gain":-15}`, `{"type":"suck","to":"ouvre-0.04","dur":0.6,"gain":-17}`, `{"type":"hush","from":"ouvre","to":"explode-0.02","depth":-14}`, et un `click` par pièce nommée de l'éclaté, dans le souffle qui suit son mot ; retirer tout `riser` qui finit sur `explode` (il monte sous « Alors… on »).
- `scripts/front.mjs` : rien (aucune copie d'essai n'a existé dans `episodes/`).

## 5. Limites, et ce que j'en tire pour la suite

- **La première seconde du 025 n'a pas bougé à l'image** (1,4) : c'est l'image que Merwan aime. Pour les prochains, la rampe se décide **avec l'image 0**, sur la planche des quatre candidates : un sujet qui fonce vers l'objectif (le 015) donne du mouvement sans sortir du cadre ; un sujet immobile au premier plan (le sanglier) n'en donne pas.
- Le son est synthétisé ; **il n'a jamais été validé à l'oreille** — c'est l'écoute de Merwan qui tranche, sur un téléphone.
- Le duel n'a jamais été mesuré : comparer les commentaires pour 1 000 vues du 025 à ceux des 013 à 024.
- Les seuils de la section « rythme » de `qa` viennent de neuf films et de deux courbes : à resserrer à chaque nouvelle courbe.

## Texte proposé pour CLAUDE.md

> **La grille seconde par seconde (21/10, après les courbes TikTok du 015 et du 012).** Les gens partent à deux endroits : la première seconde, puis de la fin de l'accroche à ≈ 25 s. Ce que les rendus mesurent (`npm run qa` → « rythme ») : le mouvement de la première demi-seconde (015, le meilleur film : 9,8 ; nos autres films 1,3 à 3,7), les plages lentes avant 25 s (aucune de 2 s), les attaques qu'un téléphone joue dans l'habillage (010 : 18 ; tous les autres : 2 à 4 — l'habillage était muet sur un téléphone), et les sons posés sur un mot (aucun nouveau). Les dispositifs, en une ligne depuis un acte : `D.punch(t.mot, 0.06)` (le mot qui frappe, un par phrase au plus, jamais sur une coupe), `glide(s0, s1)` (la rampe de l'image 1, si le sujet reste dans le cadre), `D.captionStyle({ hit: 0.25 })`, `duelCall` (la question du commentaire en deux réponses, chacune allumée sur son mot ; le film ne répond jamais à la place du spectateur), et dans `sfx` : `hit`, `click`, `swish`, `screech`, `suck`, `hush`, `impact.crack` — tout entre 600 Hz et 5 kHz, **dans les souffles de la voix, jamais sur un mot**. Essayé d'abord sur le 025 (extrait avant / après à écouter, `docs/scale/3-retention-wow.md`) ; la recette : `docs/recette-actes.md`.

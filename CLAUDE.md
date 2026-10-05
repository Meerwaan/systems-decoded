# Système Décodé

Compte TikTok qui ouvre les systèmes de sécurité (détecteur de fumée, airbag, disjoncteur, sprinkler, ascenseur…) et les explique en **storytelling + motion design 3D**. Merwan envoie un thème ; tu livres une vidéo verticale prête à publier : script, voix ElevenLabs, image HyperFrames, habillage sonore, MP4.

Tout se parle et s'écrit en français. Le public est francophone, on le tutoie.

## Le compte

| | |
| --- | --- |
| Nom affiché | **Système Décodé** (choisi par Merwan le 2026-10-05 ; « Vue Éclatée » et « Systems Decoded » écartés) |
| @ | `@systeme.decode` — replis : `@systemedecode`, `@systeme_decode` |
| Bio | Ils veillent pendant que tu dors.⏎On les décode, un système à la fois. |
| Photo de profil | `brand/avatar.png` (source `brand/avatar.svg`, export `npm run brand`) : un œil ouvert en deux, le cœur allumé |
| Couverture de grille | `npm run cover -- <ep>` → `renders/<ep>-couverture.png`, toujours la même mise en page : DOSSIER 00X, titre sur deux lignes, vue éclatée |

Le nom n'existe qu'à un endroit dans le code : `BRAND.name` (`kit/lib/brand.js`). Il est affiché à droite de l'en-tête de chaque vidéo et **s'allume en vert au moment de la chute** (`brandHud`) : le nom du compte est aussi le verdict du dossier. Pas d'emoji dans le nom ni la bio.

## La règle qui passe avant tout : storytelling et rétention

C'est ce qui fait grimper le compte. Un épisode n'est pas une fiche technique, c'est une scène : quelqu'un, une heure, un danger, et un système qui a quelques secondes pour agir. La technique arrive **quand l'histoire en a besoin**.

Structure maison (≈ 70–80 s, ~200 mots — l'épisode 001 est la référence) :

1. **Accroche (0–5 s)** : une scène concrète au présent, à la 2ᵉ personne, plus un fait qui dérange (« Trois heures sept. Tu dors. Et ton nez… dort aussi. »). Jamais de « Saviez-vous que », jamais de présentation.
2. **Enjeu + compte à rebours** : ce qui se passe si rien n'agit. Le chrono reste à l'écran jusqu'à la fin.
3. **Boucle ouverte** : une phrase paradoxale sur le système, posée tôt, résolue seulement à la chute (« elle n'a jamais vu de fumée de sa vie »). C'est elle qui retient jusqu'au bout.
4. **« Alors… on l'ouvre. »** : la vue éclatée. Énumération courte, puis on isole **le cœur**.
5. **Le mécanisme au repos** : comment il attend. Phrases courtes, une idée par phrase.
6. **Le danger arrive** : on reprend l'heure (« Trois heures huit. »), le mécanisme réagit, climax.
7. **Chute** : la boucle ouverte se referme en retournant l'idée reçue (« Ce n'est pas un détecteur de fumée. C'est un détecteur de lumière… enfermé dans le noir. »).
8. **Appels à l'action** — voir plus bas.
9. **Rebouclage** : la dernière phrase est inachevée et se termine par la première (« …Avant qu'il soit… » → « Trois heures sept. »). La dernière image est la première.

Relance la tension toutes les 8–12 s (un fait, une question, un changement de plan). Aucune phrase ne doit pouvoir être coupée sans que l'histoire y perde.

### Appels à l'action : jamais à la va-vite

Trois CTA par épisode — **like, commentaire, abonnement** — après la chute, chacun avec sa phrase, sa raison tirée de l'histoire, et son moment d'image. Un CTA expédié (« like et abonne-toi ») est interdit.

- **Like** : un motif altruiste ou utile, lié au sujet (001 : « ça remontera chez quelqu'un qui dort sans détecteur » + le réseau de plafonds qui s'allument).
- **Commentaire** : une question précise à laquelle on répond en un mot, idéalement un peu piquante (001 : « la dernière fois que tu as appuyé dessus. Jamais, c'est une réponse. » + le champ qui écrit JAMAIS).
- **Abonnement** : le prochain dossier, classé, avec un seul chiffre comme appât (001 : « trente millisecondes pour te sauver »).

À l'image, les chevrons `.rail` désignent la colonne de boutons de TikTok ; on n'imite pas l'interface.

### Exactitude

C'est un compte qui apprend des choses aux gens : chaque fait est vérifié (recherche web) avant d'entrer dans le script, et noté dans `episode.json` → `sources`. Simplifier oui, inventer non. Les chiffres douteux sortent du script ou deviennent des ordres de grandeur.

## Notre patte (et ce qu'on ne copie pas)

La référence d'origine est @souslecapot_ : dessin au trait blanc sur noir, flux en pointillés bleus, sous-titres par phrase soulignés de jaune. **On ne fait rien de tout ça.** Notre identité :

- **Le dossier** : chaque épisode est un « DOSSIER 00X », avec un HUD (titre, heure qui tourne, compte à rebours, actes 01 MENACE / 02 AUTOPSIE / 03 RÉPONSE, et le nom du compte qui s'allume à la chute).
- **Le temps réel** : l'histoire se déroule à la seconde, l'heure affichée est celle que dit la voix.
- **De la vraie 3D** (Three.js) : pièces pleines, arêtes fines, vue éclatée qui s'ouvre et se referme, un seul plan-séquence de caméra.
- **Trois couleurs qui ont un sens** : `ink` #E9E4D8 (structure, texte) · `veille` #5CFFB0 (le système vivant) · `signal` #FF5B2E (la menace). Rien d'autre.
- **Typo** : Barlow Condensed (titres, sous-titres) + JetBrains Mono (HUD, données).
- **Sous-titres mot à mot**, le mot dit s'allume ; `*mot*` = signal, `+mot+` = veille.
- **L'humain lu comme un système** quand c'est possible (001 : panneau « TOI · CAPTEURS »).

Zones de l'écran 1080×1920 : HUD 184–360 · **zone haute 386–750** (un seul panneau/titre à la fois) · sujet 3D 700–1230 · sous-titres 1248–1488 · rien d'important sous 1500 ni à droite de x = 920 entre 950 et 1650 (boutons TikTok).

## Du thème à la vidéo

```
npm run new     -- 002 airbag "Airbag"     crée episodes/002-airbag depuis kit/template
npm run script  -- 002                     script, minutage, repères
npm run voice   -- 002 --takes 2           voix (Eleven v4), prises mesurées, meilleure retenue
npm run sfx     -- 002                     habillage sonore synthétisé
npm run snap    -- 002 --at 1,8,20         images de contrôle (à regarder vraiment)
npm run check   -- 002                     lint + audits HyperFrames, doit passer
npm run preview -- 002                     lecture en direct dans le studio
npm run render  -- 002 [--draft]           MP4 dans renders/, audio masterisé à -14 LUFS
npm run qa      -- 002                     vérifie dans le MP4 que la voix est calée
npm run cover   -- 002                     couverture de grille (à choisir comme couverture au moment de publier)
```

Ordre de travail : recherche et faits → script (`episode.json`) → **voix d'abord** (elle fixe le minutage) → modèle 3D → mise en scène → `snap` par petits lots jusqu'à ce que chaque moment soit propre → `check` → `sfx` → `render --draft` → rendu final → `qa` → `cover`. Montre le script à Merwan avant de dépenser des crédits voix s'il a demandé à valider.

### Le script (`episode.json`)

Chaque beat = `{ id, text, vo, hold? }`.

- `text` : ce qui s'affiche. `*…*` et `+…+` colorent, `[85|quatre-vingt-cinq]` affiche « 85 » et fait dire le reste.
- `vo` : le même texte **dirigé** pour la voix — mêmes mots, même ordre (sinon l'alignement échoue avec un message clair).
- `hold` : secondes de silence ajoutées après le beat (la voix est coupée dans les silences) — pour laisser une image frapper.
- `cues` : moments nommés, écrits contre le script : `"alarm": "verif$+0.3"`, `"flash1": "led:flash"`. Syntaxe : `beat`, `beat$` (fin), `beat:mot`, `beat:mot#2`, `±secondes`. Image **et** son lisent les mêmes repères : une nouvelle prise de voix recale tout.

### La voix : Eric, Eleven v4

Voix « Eric – Calm, Low & Reflective » (`9osbeK6KzhDRV0yX4rTq`), modèle `eleven_v4`, une seule prise continue pour tout l'épisode (≈ 190 crédits). Exigence de Merwan : **jouée, jamais monotone**. On dirige avec des balises entre crochets, la ponctuation, et les MAJUSCULES :

| Balise (mesuré sur Eric) | Effet |
| --- | --- |
| `[ominous]`, `[low, grave voice]` | registre ≈ 3 demi-tons plus bas, plus lent — menace, chute |
| `[tense]`, `[dramatic]` | registre plus haut, plus d'énergie — montée, climax |
| `[slowly]` | débit ralenti, pauses longues |
| `[whispers]` … `[normal voice]` | vrai chuchotement, à réserver à 2–3 mots |
| `[serious]`, `[thoughtful]`, `[curious]` | nuances douces |
| `...` / `MOT` / `[short pause]` | poids / accent / silence (pas de `<break>` en v4) |

Les CTA ont tendance à sortir trop aigus et « pub » : leur mettre `[low, grave voice]` ou `[serious]` pour garder le narrateur.

`npm run voice` mesure chaque prise (écart-type de hauteur, étendue, écart de registre entre beats, pauses) et imprime un verdict : < 2 demi-tons = monotone, à refaire en changeant la direction. Ce sont des mesures, pas une oreille : **Merwan écoute toujours `audio/vo.mp3` avant le rendu final.** Autre interprétation : `--takes 3 --seed <n>` ; choisir : `--pick <seed>`.

La clé est dans `.env` (jamais affichée, jamais committée).

### L'image

- `kit/` = le moteur partagé : `brand.css` (tokens, HUD, sous-titres, callouts, panneaux), `lib/stage.js` (rendu, bloom, caméra orbitale), `lib/build3d.js` (matières, arêtes, pièces, vue éclatée), `lib/atmo.js` (sol, halo, particules), `lib/overlay.js` (sous-titres, callouts), `lib/timing.js` + `lib/ref.mjs` (repères).
- `episodes/NNN-slug/` = `episode.json`, `index.html` (overlays de l'épisode), `src/model.js` (le système en 3D, en centimètres), `src/main.js` (la mise en scène). `gen/` est reconstruit à chaque build.
- Dans `main.js` : `T.at("beat:mot")` pour l'heure d'un moment ; `shot(at, durée, pose)` pour la caméra (les plans ne se chevauchent jamais) ; `st(at, durée, {…})` pour l'état du monde `S` ; `tl` pour la page. Tout part d'un nombre `S` appliqué dans `stage.onUpdate`.
- Modéliser en primitives (cylindres, tours `lathe`, boîtes fusionnées) : arêtes claires sur pièces sombres, sombres sur plastique clair, `glow()` pour ce qui émet.

Pièges déjà rencontrés :

- GSAP ne sait pas revenir à un texte **vide** : ne jamais `tl.set(el, { textContent })` en partant de `""` (révéler par largeur ou opacité).
- Deux tweens sur la même propriété ne doivent pas se chevaucher ; `immediateRender: false` sur un `fromTo` qui rejoue un élément déjà animé.
- `lint` ne voit `window.__timelines` que dans le HTML : garder le petit script en bas d'`index.html`.
- Tout ce qui bouge dépend du temps HyperFrames (`hf-seek`), jamais d'une horloge ; l'aléatoire est semé (`kit/lib/rng.js`).
- Le rendu a besoin de `ffmpeg` + `ffprobe` : s'ils ne sont pas dans le PATH, `scripts/lib/ffmpeg.mjs` les cherche dans les `node_modules` des projets voisins, ou dans `FFMPEG_DIR`.
- L'habillage sonore est synthétisé (`scripts/sfx.mjs`) et pensé pour un haut-parleur de téléphone : rien d'important sous 200 Hz. Personne ne l'a encore validé à l'oreille — baisser `bedVolume` ou retirer des éléments de `sfx` si Merwan le trouve envahissant.

### Avant de livrer

`npm run check` passe · chaque moment clé a été regardé en image · la voix a été écoutée par Merwan · le MP4 fait ≥ 60 s et reboucle proprement · la première image tient toute seule (c'est elle qui arrête le pouce).

## Dossiers

- **001 — Détecteur de fumée** : fait.
- **002** : annoncé à la fin du 001 comme « un système qui a trente millisecondes pour te sauver » → l'airbag. Si le sujet change, changer aussi cette phrase du 001 avant publication.

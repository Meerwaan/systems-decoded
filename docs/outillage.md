# L'outillage : des sorties courtes, des planches au juste prix

Passe du 2026-10-27 (journal : `docs/journal/opti-2026-10-27-outillage.md`). Ce que chaque commande imprime entre dans le contexte de l'agent qui la lance, et il le relit à chacun de ses appels suivants. Mesuré sur le 025 (lecture seule), en jetons ≈ octets ÷ 3,6.

## Ce qui a changé

- **Un résumé par défaut, le détail dans un journal.** `render`, `check`, `lint`, `snap` impriment le verdict, chaque ⚠ et ✗, les chiffres clés et le chemin de ce qu'ils ont écrit ; la sortie complète de HyperFrames va dans `.cache/logs/<dossier>-<commande>.log`, dont le chemin est imprimé. Les résumés sont faits **par retrait** (`scripts/lib/hfreport.mjs`) : une ligne inconnue passe toujours ; seuls disparaissent les barres de progression, les traces `[INFO]`, les lignes `Fix:` génériques, l'attente de `__renderReady` (le kit ne lève jamais ce drapeau : 3 s et une ligne dans chaque check) et les notes du compilateur de shaders Direct3D (X3577, X4008, X4122), **comptées** sur une ligne.
- **`--verbose`** (ou `SD_VERBOSE=1`) rend l'ancienne sortie de toutes les commandes.
- **`check` se souvient** : quand rien de ce que la page charge n'a bougé depuis le dernier contrôle (`index.html`, tout `gen/` octet par octet — le bundle porte le kit et le code de l'épisode —, la taille et la date des sons, la version de HyperFrames), il redonne son résultat tout de suite, en le disant (empreinte, heure). `--force` le relance. Cache : `.cache/check/<dossier>-check.json`.
- **`qa`** : le tableau des tranches de voix tient en une ligne quand toutes sont calées (« ✓ voix calée (10 tranches · écart max 0 ms · corrélation min 0.947) ») ; dès qu'une tranche est décalée ou méconnaissable, il est imprimé en entier.
- **`script`** : les repères sur quelques lignes (« 0.26 boar · 1.38 swerve · … »), mêmes nombres, même ordre.
- **`snap`** : le dossier une fois, les noms des images sur une ligne.
- **`look`** : vignettes de **270 px** par défaut (la taille à laquelle un film se juge ; 480 px pour un long), **jamais de colonne vide** (deux images font une planche de deux images de large), planche aussi haute que ses rangées. `--width 405` pour le détail.
- **`render --out <fichier>`** et **`review --out <fichier>`** : un essai hors de `renders/` (Merwan voit `renders/`) ; avec `review --out`, ses images de travail vont dans un dossier temporaire effacé après, plus dans `episodes/<ep>/snapshots/`.
- `SD_NO_METRICS=1` : une commande ne s'écrit pas dans `metrics/commandes.jsonl` (pour mesurer les outils sans fausser la production).

## Avant / après (025)

| commande | jetons avant | jetons après | secondes avant | après |
| --- | --- | --- | --- | --- |
| `render --draft` | ≈ 18 500 | ≈ 400 | 131 | 127 (même travail) |
| `check` | ≈ 540 | ≈ 185 | 43 | 42 · **0,9 si rien n'a changé** |
| `qa` | ≈ 550 | ≈ 400 | 7 | 7 |
| `snap` (3 images) | ≈ 370 | ≈ 190 | 11 | 10 |
| `script` | ≈ 1 090 | ≈ 1 020 | 0,5 | 0,5 |
| `look`, `build`, `cover` | ≈ 160, 35, 110 | inchangé | 7, 0,8, 6 | inchangé |

Chaque commande lancée par `npm run` ajoute en tête deux lignes (« > systems-decoded@1.0.0 … » et la commande, chemins compris : 25 à 80 jetons). **`npm run -s …`** ou `node scripts/sd.mjs …` les retire.

## Les planches : ce qu'une image coûte

Une image lue coûte selon ses pixels, ≈ largeur × hauteur ÷ 750 jetons, **plafonnée vers 1,15 Mpx (≈ 1 530 jetons)** : au-delà, elle est réduite avant d'être lue. Donc :

| planche `look` | avant (405 px, 4 colonnes) | après (270 px, colonnes utiles) |
| --- | --- | --- |
| 1 image | ≈ 1 500 | ≈ 220 |
| 2 images | ≈ 1 530 | ≈ 430 |
| 4 images | ≈ 1 500 | ≈ 830 |
| 8 images | ≈ 1 530 | ≈ 1 530 (vue de toute façon à ≈ 265 px par vignette) |

Comparé à l'œil sur huit instants du 025 : même lisibilité (la planche de 405 px était déjà réduite à ≈ 270 px à la lecture).

**À savoir** : une planche de plus de huit vignettes de 270 px dépasse le plafond et chaque vignette est lue plus petite — 24 instants : ≈ 155 px ; une `review` entière du 025 (≈ 90 instants) : ≈ 80 px, illisible. Au-delà de huit instants, deux planches de huit valent mieux qu'une de seize si le détail compte (≈ 1 530 jetons chacune).

## Vitesse : ce qui ne bouge pas, et pourquoi

Tout le temps est dans le dessin 3D (accumulation de 16 instants par image, sur la carte graphique) : `check` passe 36 s de ses 42 à seeker et dessiner dans une seule page, `render --draft` 111 s de ses 131 à capturer, `look` 3,2 s à charger la page et ≈ 0,25 s par image. Essayé et écarté : `render --workers 5` (114 s de capture contre 111, plus 18 s d'encodage hors flux : la carte est saturée à trois), une capture `look` à demi-échelle (−0,1 s), un `--timeout` plus court pour `check` (même durée). Le `build` prend 0,12 s : rien à mettre en cache. Ne pas réduire l'accumulation pour `check` : le contraste se mesure sur les pixels du fond.

Le gain sûr est de ne pas refaire : `check` inchangé → 0,9 s au lieu de 42.

## Le rendu reste identique

Aucune ligne de `kit/` n'a changé, ni la ligne de commande passée à HyperFrames. Vérifié sur le 025 : `gen/*` et `index.html` identiques à l'octet avant / après (sha1), et le brouillon rendu avant / après est **identique à l’octet** (md5 du MP4 entier `7e51a3bf…`, md5 des images décodées `f8e423bd…` et du son `5c2aa26e…` dans les deux).

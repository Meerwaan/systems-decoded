# La recette d'une compilation (YouTube, 16:9, 9 à 15 min)

Écrite le 2026-10-29 pour le rush des 4 000 h (`docs/plan-rush-youtube.md`) : une vidéo longue par semaine qui ne coûte presque rien, faite de nos courts déjà rendus. Outil : `npm run compil` (`scripts/compil.mjs`). Premier dossier : `episodes/C01-ta-voiture/`.

## Le principe

- **Une compilation raconte quelque chose qu'aucun court ne raconte seul.** C01 : les six systèmes de ta voiture **dans l'ordre d'un accident** (avant le choc, le choc, après, et en Formule 1). Une pile de courts sans fil est refusée : c'est le « contenu réutilisé » que YouTube regarde à l'entrée dans le programme partenaire.
- **Ce qui est neuf** : une voix (ouverture, un pont avant chaque dossier, une fin), l'image en 16:9 (le court au centre sur son propre flou, le dossier de chaque côté, la liste qui avance), les chapitres.
- **Ce qui ne change pas** : chaque court passe tel qu'il a été publié, coupé juste après ce qu'il devait (sa réponse et sa question du commentaire). Sans like, sans abonnement, sans annonce du prochain dossier, sans boucle : `compil` les retire d'office (ordre de la fin d'avant le 018 compris).

## Le dossier `Cnn-<slug>/episode.json`

- `format: "compil"`, la voix d'Eric en turbo, **une seule requête** (≈ 250 mots, ≈ 800 crédits annoncés, ≈ 350 facturés).
- `compil` : `lines` (le titre des panneaux), `kicker` (la promesse en une ligne), `chapIntro`, `chapFin`.
- `dossiers` : dans l'ordre du film, `{ "ep": "025", "label": "L'ESP", "lines": ["L'ESP"], "moment": "Avant le choc", "chap": "Avant le choc : l'ESP" }`. `keep` (facultatif) : les morceaux à garder, en repères ou en secondes, si la coupe automatique ne convient pas (un court dont les instants ne sont plus fiables le demande).
- `beats` : `intro1…` (l'ouverture, sur un montage des premières secondes de chaque court), `pont-<ep>` (un par dossier, sur sa couverture de grille qui avance doucement), `fin1…` (sur les couvertures, la moitié droite libre pour l'écran de fin). Un `chap` sur le premier beat de chaque groupe (la musique suit les chapitres).

## L'écriture

- **L'ouverture (20 à 30 s)** : une scène à toi, au présent (`[tense]` sur la première phrase seulement), la promesse (« six systèmes vont se passer le relais »), et un fil payé par le dernier dossier (« le dernier ne vient même pas d'une voiture de route »). Pas de « dans cette vidéo ».
- **Un pont (6 à 10 s)** naît de la fin du dossier d'avant et ouvre le suivant sans le dévoiler : il finit sur une suspension (« ta ceinture bouge… »). **Aucun chiffre neuf** : les faits sont ceux des dossiers, déjà sourcés.
- **La fin** : ce que les dossiers ont en commun (la chute de la compilation), une question à deux camps, le like avec sa raison, un rendez-vous sans sujet.
- Les balises du long (`docs/recette-long.md` § 10), jamais `[firm, matter-of-fact]`.

## Les thèmes qui suivent

« Ta maison » (001, 004, 009, 012, 016, 018, 028, 030 : l'ordre d'une nuit), « Dans le ciel » (007, 015, 023, 026 : du décollage à l'atterrissage), « Le courant » pour les électriciens (004, 008, 011, 016, 024, 030), puis chaque nouveau lot de courts. Un même court peut servir deux compilations, jamais deux fois la même semaine.

## La fabrication (≈ 30 min, presque pas de jetons)

1. Écrire `episode.json` ; `npm run script -- Cnn` pour le minutage estimé.
2. `npm run compil -- Cnn --draft` : un brouillon muet dans `.cache/compil/Cnn/` (≈ 4 min) pour juger l'image.
3. Devis : `npm run voice -- Cnn` ; avec l'accord de Merwan, `--budget`.
4. `npm run compil -- Cnn` : `renders/Cnn-<slug>.mp4` et `-chapitres.txt` (les chapitres à coller dans la description).
5. Miniature : une couverture de dossier en grand, ou la mosaïque ; titre « putaclic mais fidèle » avec le mot cherché.

# L01 — Pare-brise : où on en est, et la suite (l'image)

> **Fait le 2026-10-15 au soir** : l'image est montée et rendue (`renders/L01-pare-brise.mp4`), avec miniatures, sous-titres et chapitres. Ce qui suit est la passation d'avant ; la recette d'un long, d'après ce pilote, est `docs/recette-long.md`.

Passation écrite le 2026-10-15, à la fin de la conversation du script et de la voix. Le format est décrit dans CLAUDE.md (« Le format long (YouTube) : « Fabriqué pour te sauver » ») : le lire d'abord.

## Ce qui est fait et validé par Merwan

- **Faits** : `docs/faits/L01-pare-brise.md` (sections 1 à 9) et `docs/faits/L01-contre-verification.md`.
- **Script** : `episodes/L01-pare-brise/episode.json` — 76 phrases, 13 chapitres (`chap` sur la première phrase de chaque chapitre), coupures pub marquées (`midroll`), `sources`, `cues` (à compléter pour l'image). Version lisible : `docs/L01-script.md` (à régénérer : elle date d'avant les nouveaux appels à l'action et le rendez-vous de fin). Plan d'origine : `docs/L01-plan.md` (l'annonce de l'airbag y est caduque : on ne l'annonce plus).
- **Emballage** : `episode.json` → `post.youtube` (titre, deux titres à tester, description avec `__CHAPITRES__` à remplacer par les chapitres horodatés, hashtags, épinglé, concept de miniature, écran de fin).
- **Voix : FINIE et validée** (« c'est parfait »). 8 min 51 (531 s), ton de conversation H2, une requête par chapitre (`voice.parts`), l'accroche vient de l'essai A. Montage : `audio/vo.json`, `audio/picks.json`, `audio/voix.wav`. **Ne pas réenregistrer.** Les instants réels de chaque mot : `npm run script -- L01`.

## Ce qui n'existe pas encore

L'épisode n'a **ni `src/` ni `index.html`** : `npm run voice` et `build` finissent sur « Could not resolve src/main.js ». C'est attendu. Tout ce qui suit est à construire :

1. **Le kit 16:9** (une fois, pour tous les longs) : composition 1920 × 1080 dans HyperFrames, plateau (`createStage`) cadré en paysage, en-tête « DOSSIER L01 · ÉTAPE 03 / 08 · température du verre » (pas de chrono : la température, voir le plan), **cartes de chapitre**, mots-clés colorés à l'écran **sans sous-titres mot à mot** (un fichier `.srt` tiré de `vo.json` à la place), miniature 1280 × 720 (`npm run cover` en 16:9), zone libre des 15 dernières secondes pour l'écran de fin. Les zones TikTok de `brand.css` ne s'appliquent pas.
2. **Le kit d'usine** (une fois) : blocs paramétrés aux rayons X, dans `kit/lib/` — `four`, `cuve` (plate : bain d'étain ; cylindre : autoclave), `tapis` à rouleaux, `portique` (découpe, sérigraphie, pose du film), `salle` (salle blanche), `soufflerie` (trempe), `banc` (tour de chute, bille, tête factice). L'objet fabriqué est le seul élément plein.
3. **Les décors propres au L01** : le verre (ruban, feuilles, sandwich, toile d'araignée, grains du trempé), le moule de bombage, le laboratoire et le flacon de 1903 (reconstitution), les **pièces du dossier** (brevet de 1909, page du R43, marquage du coin) posées sur l'établi ; réutilisés : la voiture aux rayons X (011 / 014), `kit/lib/figure.js`.
4. **La mise en scène des 13 chapitres** sur les instants de la vraie voix, un agent par groupe de chapitres, en parallèle (recette : `docs/recette-actes.md`, adaptée au 16:9).
5. `check`, `render --draft`, `qa`, `render`, miniature, chapitres horodatés dans la description, `.srt`.

## Les règles à ne pas perdre

- Rétention d'abord : chaque phrase a sa démonstration, chaque chapitre finit sur une relance (déjà dans le script), un plan naît du précédent ; les plans peuvent respirer un peu plus que dans un court (écran d'ordinateur ou de télévision).
- Le mixage n'est plus celui d'un haut-parleur de téléphone : du grave, une musique sous la voix, un « sting » sur chaque carte de chapitre (qui cache aussi les coutures de voix).
- Images : tout en 3D ; le réel n'entre que comme pièce du dossier (domaine public vérifié pour toute photo).
- Pas d'échafaudage sous les yeux de Merwan (`renders/`, panneau du navigateur) : les planches de travail avec `--out` dans un dossier temporaire.
- Chronométrer (`npm run chrono`) : le pilote sert à écrire `docs/recette-long.md`, pour tenir 2 à 3 longs par semaine.

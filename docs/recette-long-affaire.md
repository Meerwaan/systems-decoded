# La recette d'une affaire réelle (un long YouTube, 16:9)

Écrite le 2026-10-29 pour le rush des 4 000 h (`docs/plan-rush-youtube.md`). Une affaire est **un long** : même chaîne, mêmes agents, même voix, mêmes règles d'image (`docs/recette-long.md`, `docs/recette-long-image.md`, `docs/recette-long-retention.md`). Ce fichier ne dit que ce qui change. Dans le script : `"genre": "affaire"` (`npm run new -- L05 hudson "Hudson" --affaire`) ; `npm run script` applique alors les seuils ci-dessous.

La demande de Merwan : des faits réels, ce qui s'est passé, pourquoi un plan de sécurité n'a pas suffi ou a dû changer en direct ; « éducatif, qui ne fait pas peur », qui montre « qu'on est là, qu'on peut vous expliquer ».

## Ce que c'est, ce que ce n'est pas

- **C'est** : un vrai jour, reconstitué en 3D à la seconde, où un plan de sécurité a été mis à l'épreuve, et ce qu'on en a appris. Le héros du film reste un système (une procédure, une machine, une règle), comme dans un dossier.
- **Ce n'est pas** un fait divers, ni un film-catastrophe : on ne s'attarde jamais sur la mort, on ne reconstitue jamais le corps d'une victime, on ne cherche pas le coupable.
- **Le film finit toujours sur ce qui te protège aujourd'hui grâce à ce jour-là.** C'est ce qui fait qu'il ne fait pas peur, et c'est la vraie promesse du format : tu repars en sachant pourquoi tu es plus en sécurité.

## Choisir une affaire (les six critères, tous)

1. **Un nom que les gens cherchent** : vérifié dans l'autocomplétion de YouTube (`docs/recette-long.md` § 1). Les affaires qui ont eu un film, un documentaire ou une actualité récente gardent une recherche pendant des années.
2. **Un plan prévu, identifiable** : une check-list, une procédure, un système, une règle. Sans plan, pas de dossier.
3. **Le moment où le plan ne colle plus**, et ce qu'on fait à la place : l'improvisation, la décision prise en quelques secondes ou quelques jours.
4. **Une issue qui protège** : des survivants, ou un système né de ce jour-là. Un bilan très lourd peut entrer seulement si le film porte sur ce qu'on a changé depuis, et le bilan se dit une fois, sobrement.
5. **Un rapport officiel public** (bureau d'enquête, agence, commission) : c'est lui qui donne la chronologie à la seconde.
6. **Très visuel en 3D**, si possible sur un décor qui existe déjà (`docs/catalogue.md`) et qui servira aussi aux courts de la semaine.

**Écartées d'office** : une enquête encore ouverte ou un procès en cours ; une affaire de moins de deux ans ; un attentat, une guerre, un crime ; une affaire dont la seule histoire est le nombre de morts.

## La structure (12 à 14 min)

| Chapitre | Ce qu'il fait | Repère |
| --- | --- | --- |
| **L'instant** (pas « Introduction ») | L'accroche au moment où tout bascule, à toi, au présent : la 3D, l'heure réelle, le chrono. A · B · C. La promesse du titre avant 30 s. | 0:00 → ≈ 0:40 |
| **On l'ouvre** | « Alors… on l'ouvre. » : on ouvre **le plan prévu** (la machine, la check-list, le système). Comment il devait marcher. | avant 1:00 |
| **Plus tôt ce jour-là** | Le retour en arrière : tout est normal, et c'est là que se cache le détail qui comptera. | |
| **La rupture** | Pourquoi le plan ne prévoyait pas ce jour-là. Le fil « tiendra ou pas » s'ouvre ici. | |
| **L'improvisation** (un ou deux chapitres) | Le climax, seconde par seconde, sur l'heure réelle. Phrases de trois à huit mots (`docs/recette-long.md` § 6). Le seuil d'abonnement est juste avant. | ≈ 50 à 65 % du film |
| **Le dénouement** | Ce qui s'est passé, le bilan dit une fois. | |
| **L'enquête** | Ce que le rapport a trouvé, montré comme pièce du dossier. Les « et si ? » des enquêteurs (simulations, autres choix possibles), seulement s'ils sont dans le rapport. | |
| **Ce qui a changé** | Le système, la règle ou la machine que tu as aujourd'hui grâce à ce jour-là. C'est le décodage du film, et sa note d'espoir. Beat `depuis`. | dernier chapitre avant la fin |
| **La fin** | Chute (l'idée reçue retournée) → la question du début payée → commentaire à deux camps → like → rendez-vous (sans sujet) → boucle. | |

- **Budget** : 2 200 à 2 700 mots (≈ 12 à 14 min à ≈ 190 mots par minute), jamais gonflé : un chapitre qui ne relance pas sort. 10 à 15 chapitres, 90 s au plus chacun.
- **Coupures pub** : quatre ou cinq, 90 s d'écart au moins, après un fil laissé ouvert (les règles du long). L'heure réelle qui tourne est une relance naturelle : « 15 h 27 min 36 s. Il lui reste… »
- **Trois fils au moins** : la question de l'accroche (payée à la fin), « est-ce que ça va tenir » (payé au dénouement), un fil d'enquête (le détail de « Plus tôt ce jour-là », payé à l'enquête).
- **La boucle** retombe sur les premiers mots de l'accroche, comme partout.

## L'heure réelle : notre signature, appliquée au réel

- L'en-tête affiche **la date et l'heure du jour de l'affaire** (« 15 JANV. 2009 · 15:27:11 »), et un compte à rebours quand il y en a un (altitude, oxygène, eau qui monte). L'heure dite par la voix est celle de l'en-tête, et celle du rapport.
- Toute heure, toute durée, toute altitude vient de la chronologie du rapport officiel, citée dans `sources`. Une valeur que le rapport ne donne pas devient un ordre de grandeur, ou sort.

## Le réel dans le film : des pièces du dossier, jamais des vidéos des autres

À l'entrée dans le programme partenaire, une personne de YouTube regarde **toute la chaîne** : le contenu réutilisé est la première cause de refus, et un refus fait attendre 30 jours. Les extraits de journaux télé déclenchent aussi Content ID. D'où la règle :

- **Oui, comme pièce du dossier**, quelques secondes, dans le cadre du dossier (étiquette « PIÈCE N° », source à l'écran), toujours commentée par la voix :
  - les rapports officiels : une page, un schéma, une ligne de la chronologie, cités ;
  - les œuvres des agences fédérales américaines, qui sont dans le domaine public (NTSB, FAA, NASA, CSB, NOAA, l'armée américaine) : photos, schémas, animations, enregistrements radio qu'elles ont publiés ;
  - les documents publics français réutilisables (licence ouverte d'Etalab), après vérification de la mention sur la page ;
  - une photo dont la licence est vérifiée fichier par fichier (domaine public ou licence libre, auteur crédité).
- **Jamais** : journaux télé, vidéos amateurs (même virales), extraits de films (le *Sully* de 2016, *Apollo 13* de 1995), vidéos d'autres chaînes, photos d'agences de presse.
- **Au plus ≈ 10 % du film** en pièces réelles. Le film, c'est notre 3D.
- **L'enregistrement des voix du cockpit n'est jamais diffusé** (il ne l'est pas, et ne doit pas l'être) : on cite sa transcription officielle, en une phrase, sans jouer les derniers mots de quelqu'un.
- Chaque pièce est notée dans `sources` avec son adresse et sa licence ; l'agent `faits` les liste dans « Pièces du dossier ».

## Les personnes

- Les acteurs connus de l'affaire (un pilote, un chef de secours, un ingénieur) peuvent être nommés : les mêmes faits que le rapport, ni plus, ni moins. À l'image, ce sont des silhouettes (`kit/lib/figure.js`), jamais un visage reconstitué.
- **Une victime n'est jamais nommée** sauf si sa famille l'a fait publiquement et largement ; jamais de détail sur sa mort.
- **On ne juge personne** : « le rapport conclut que… », jamais « il a fait une erreur ». La faute d'une personne n'est jamais la chute du film ; le système, oui.
- On ne prête à personne une pensée ni une phrase que la transcription officielle ou un témoignage public ne contient pas.

## La voix

Les balises du long (`docs/recette-long.md` § 10). En plus :

- **L'improvisation** se joue par l'écriture (phrases courtes, l'heure qui revient), sans `[serious]`, comme le test d'un long.
- **Le bilan** se dit une fois, `[serious]` permis sur cette seule phrase, puis on passe à autre chose.
- **Jamais `[amused]`** sur l'instant, l'improvisation, le dénouement ni l'enquête ; seulement sur un paradoxe du plan prévu.

## Titre et miniature

- **Le titre** : le paradoxe ou le chiffre fou, puis « : » et le nom que les gens tapent (« 208 secondes pour poser un avion sur un fleuve : le miracle de l'Hudson »). Chaque mot vrai, dans le film, sourcé.
- **La miniature** : l'objet 3D au moment critique, plein, éclairé (l'avion à l'instant où il touche l'eau), deux ou trois mots énormes. **Jamais une vraie photo de personne**, jamais l'affiche d'un film.

## La fabrication

La chaîne d'un long (`docs/chaine-optimisee.md` § 3), sans changement. Ce qui aide :

- **Le décor de l'affaire sert aussi aux courts de la semaine** (`docs/plan-rush-youtube.md`) : l'architecte de l'affaire le pose pour qu'un court puisse l'importer.
- L'agent `faits` reçoit `genre: affaire` dans sa consigne : il cherche d'abord le rapport officiel, en tire la chronologie à la seconde, et liste les pièces du dossier avec leur licence (`.claude/agents/faits.md`).
- Un seul `contre-verif` sur tout le script, comme un long.

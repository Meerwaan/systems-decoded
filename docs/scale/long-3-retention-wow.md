# Long · 3 · La rétention et l'effet « wow » (agent 3, 21/10)

Mission : qu'on ne voie pas passer neuf minutes, chapitre après chapitre, sur un ordinateur ou une télévision. Mesuré sur les deux longs en ligne (L01, L02) ; aucun film publié n'est touché ; les essais sont faits sur une copie de L02 hors du dépôt. **Les courbes de rétention YouTube ne sont pas encore arrivées** : tout ce qui suit se mesure sur les rendus, pas encore sur le public — à reposer sur la courbe dès qu'elle est là (§ 5).

## Ce que Merwan tranche (oui / non)

1. **Le son du long.** Écouter `L02-avant-0-90s.mp3` (le film publié) puis `L02-apres-0-90s.mp3` (même voix, même niveau, −14 LUFS) — au casque ou sur la télévision, puis sur l'ordinateur. Oui : la grille devient celle du modèle (`kit/template-long/episode.json`, lignes au § 4) à partir du L03. Non : l'ancienne reste.
2. **Le fil ouvert sous la carte qui suit une coupure pub** (« FIL OUVERT — La voisine ? Toujours sous tension. », `planche-fil-ouvert.jpg`, en haut avant, en bas après). Oui / non.
3. **La règle de rythme mesurée par `qa`** pour les prochains longs : aucun plan de plus de 12 s sans changement de vue, un premier changement de vue avant 3 s, la réponse à l'accroche mise en scène comme un moment. Oui / non.
4. **Les repères de coupure pub de L01 et L02**, à déplacer dans YouTube Studio (ça ne touche pas la vidéo) à l'instant le plus calme du souffle qui suit le fil ouvert : **L02 2:06.4 · 4:10.2 · 6:06.0 ; L01 2:14.2 · 4:16.9 · 6:39.5** (L01 4:16.9 n'a que 0,87 s de souffle). Oui / non.

## 1. Le diagnostic

### L'image : le rythme (mesuré sur les rendus, `qa` → « rythme du long »)

- **L01 change de vue toutes les 2,3 s, sans un plan de plus de 12 s** ; plutôt trop haché que trop lent (c'est le film des « transitions qui ne collent pas »).
- **L02 change de vue toutes les 5,3 s en moyenne, mais tient 9 plans de plus de 12 s (174 s, un tiers du film)** : 2:31 → 3:05 (34 s, la chambre du disjoncteur : l'arc, la sinusoïde, « 63 000 A », « 1956 » — les chiffres tournent, la composition reste), 6:02 → 6:26 (24 s, des lignes rouges fines sur du noir), **8:32 → 8:55 (23 s, la réponse à l'accroche, l'apprenti de 1987 : deux petits objets dans un grand cadre noir, la paie la plus attendue du film sur son image la plus faible)**, 3:28 → 3:48 (20 s), 4:51 → 5:10 (20 s, deux personnages de verre immobiles). Deux plages de plus de 4 s sans mouvement visible : 8:11 → 8:16 et 8:43 → 8:47.
- **Les 30 premières secondes** (YouTube Studio en donne la part encore là à 30 s) : **L02 tient la même image 8,9 s** (le poteau isolant et la ligne rouge ; mouvement de la première demi-seconde 0,21), puis enchaîne ; L01 change de vue à 1,0 s et toutes les 3 à 5 s (0,21 contre 2,19). La vague de la caméra qui démarre (L02, 8–11 s) arrive *après* l'accroche, pas dessous.
- **Les moments « wow » de L02** (lus sur les planches) : 0:51 (les lignes s'allument), 0:55 → 1:02 (le zoom arrière jusqu'à la carte de France), 1:16 (l'arc qui vient chercher), 1:32 (le sol qui monte en anneaux) — denses dans les deux premières minutes, plus rares ensuite, où les lignes rouges sur noir reviennent souvent.
- **L'écran de fin** : dans les 15 dernières secondes, la moitié droite est plus sombre et moins chargée que la gauche dans les deux films (L02 : luminance 20 contre 36, détail 7,8 contre 9,4) ✓.

### Les cartes et les coupures pub

- **Les coupures de L02 sont bien placées** : un fil ouvert (« Et pour l'instant… les deux… »), un souffle de 1,44 à 1,59 s, puis une carte. Mais **au retour de la pub, la carte ne dit que son titre** (« 03 LE DISJONCTEUR ») : rien ne rappelle ce qui était resté ouvert.
- **L01 « oubli » (4:16.8) n'a que 0,87 s de souffle et pas de carte** : depuis mai 2025, YouTube sert moins de pub sur un repère posé en pleine phrase et préfère une pause ou une transition visuelle (aide YouTube Studio).
- **Rien ne dit à Merwan où poser les repères** : `midroll` est dans le script, aucun outil ne l'imprimait. `qa` le fait maintenant (§ 2).

### Le son (mesuré sur les films, la voix seule et l'habillage seul)

- **L'habillage est mono** : côté / milieu −43 dB (L01), −44 dB (L02) ; le film entier −38 dB. Sur un casque ou une télévision, tout sort du centre.
- **La musique est une seule boucle de quatre accords (Dm B♭ F C, ≈ 23 s) pour tout le film** : L02 la fait 24 fois ; seuls son niveau et son « drive » bougent. Les chapitres ne s'entendent pas.
- **Dix à onze sons pour neuf minutes**, presque tous hérités du modèle des courts (impact à 0,03 s, riser sous « Alors… on », impact sur « on », une carte = whoosh + impact). **Dans un chapitre d'une minute, rien ne sonne avec l'image** : ni les machines, ni l'arc, ni la bille sur le verre (L01 a deux impacts au test).
- **Les sons des cartes tombent sur la fin de la phrase d'avant** : le whoosh commence 1,65 s avant le mot, la phrase finit 1,4 à 1,7 s avant — 8 cartes sur 10 (L02), 10 sur 12 (L01).
- **Ce qu'un portable joue de l'habillage** (au-dessus de 200 Hz) : 1 attaque par minute (L02), 2 (L01).
- **Plage de loudness 2,9 à 3,1 LU** : aucune dynamique — pas de silence avant un coup.
- Les niveaux, eux, sont bons : voix −23 LUFS, habillage −32 LUFS au volume du film (9 LU dessous), film −14,0 LUFS.

### Le web (8 recherches, sources notées, rien de copié)

Peu de données solides, beaucoup de blogs d'éditeurs. Ce qui sert :
- **YouTube Studio** définit l'« intro » (la part encore là à 30 s), les « top moments », « spikes » et « dips » (vidéos de plus de 60 s et 100 vues) — [aide YouTube, moments clés](https://support.google.com/youtube/answer/9314415).
- **Coupures pub** : placées par défaut aux pauses naturelles (« visual or audio breaks ») ; un repère posé en pleine phrase est moins servi depuis le 12 mai 2025 — [aide YouTube, mid-rolls](https://support.google.com/youtube/answer/6175006), [TechCrunch](https://techcrunch.com/2025/02/25/youtube-is-working-to-make-ad-slots-less-interruptive).
- **Écran de fin** : les 5 à 20 dernières secondes, quatre éléments au plus en 16:9 — [aide YouTube, écrans de fin](https://support.google.com/youtube/answer/6388789).
- **Rythme** : les éditeurs recommandent un changement visuel toutes les 10 à 20 s au début, un « pattern interrupt » vers 25–35 s, une relance toutes les 1 à 2 min, couper la musique avant une révélation — opinions, sans données publiées ([AIR Media-Tech](https://air.io/en/youtube-hacks/advanced-retention-editing-cutting-patterns-that-keep-viewers-past-minute-8), [Revid](https://www.revid.ai/blog/youtube-video-editing)). Notre règle (5 à 10 s) est plus serrée et c'est celle de Merwan.
- **Chapitres** : YouTube dit qu'on regarde plus longtemps une vidéo chapitrée, sans chiffre public ; les pourcentages des blogs ne se retrouvent pas à la source ([vidIQ](https://vidiq.com/blog/post/youtube-video-chapters/), [AIR](https://air.io/en/youtube-hacks/youtube-chapters-as-an-seo-tool-when-they-help-when-they-hurt)).
- **Le son des chaînes d'animation** : Kurzgesagt compose une musique par vidéo, « composée sur la vidéo finie », et décrit ses effets comme la couche qu'on ne remarque pas mais qui donne la profondeur (au casque) — [Kurzgesagt, notre processus](https://kurzgesagt.org/youtube/).

## 2. Les dispositifs (tous en option : sans eux, rien ne change)

| Dispositif | Fichier | Une ligne |
| --- | --- | --- |
| **La musique en sections et en stéréo** — à chaque carte une autre progression de la palette (4, dans le même ré mineur), son arpège, sa reprise sur la carte ; la musique se tait 0,5 s avant (`drop`) ; au-dessus de `drive` 0,6, une pulsation de doubles croches (l'horloge du test) | `scripts/sfx.mjs` · `music` avec `width` / `sections` → `score` | `{ "type": "music", "width": 0.7, "sections": "chapters", "skip": ["ouvre"], "drop": 0.5, "phone": 0.25, "gain": -21, "curve": … }` |
| **La carte qui s'entend** — un souffle stéréo qui monte du silence, un `boom`, l'accord de la section qui commence ; si la phrase d'avant court encore, le coup tombe dans le souffle qui la suit | `chapters` · `style: "film"` | `{ "type": "chapters", "style": "film", "skip": ["ouvre"] }` |
| **La pièce** — une réverbération stéréo (Freeverb, déterministe) pour la queue des coups, sans le grave | `space` | `{ "type": "space", "mix": 0.22, "size": 0.84, "damp": 0.35 }` |
| **Le lieu qui s'entend** — `hum` (100 Hz et ses harmoniques, le grésillement de la couronne : c'est lui qu'un portable joue), `factory`, `wind`, `room` | `ambience` | `{ "type": "ambience", "preset": "hum", "from": 0, "to": "recap", "gain": -33, "curve": … }` |
| **Le coup du « wow »** — sub qui tombe (télévision), corps vers 120 Hz et craquement vers 2,6 kHz (portable), écho de 11 ms de l'autre côté ; `gain` = la crête | `boom` | `{ "type": "boom", "at": "x", "gain": -14 }` |
| **Le silence avant** — la musique et les nappes se taisent, reviennent sur le coup | `drop` | `{ "type": "drop", "at": "x", "pre": 0.55 }` |
| **L'arc qui tient** | `buzz` | `{ "type": "buzz", "from": "a", "to": "b", "gain": -25 }` |
| **Le fil ouvert** sous une carte (au retour d'une pub) | `kit/lib/blocks.js` · `threadCall`, `kit/brand.css` · `.thread` | `threadCall(D.tl, { from: D.at("disj1") - 0.6, to: D.at("disj1") + 1.6, text: "La voisine ? Toujours sous tension." })` |
| **La mesure** — vues, plans > 12 s, plages immobiles, 30 premières s, souffle avant les cartes, **repère de chaque coupure pub**, sons sur un mot (cartes comprises), écran de fin, largeur et attaques de l'habillage | `scripts/qa.mjs` · `rhythmLong` | `npm run qa -- <long>` (les courts gardent leur section) |

Pas faits, et pourquoi : un repère de progression de plus (l'en-tête montre déjà l'étape et ses traits ; un compteur « fils ouverts » permanent chargerait l'image — le fil se montre là où il compte, au retour de la pub) ; un ralenti (le temps du film est celui de la voix) ; les dispositifs TikTok des courts (`followCall`, `duelCall`… plantent sur une page 16:9, `docs/recette-long.md`) ; `D.punch` existe déjà et sert tel quel dans un long.

## 3. La preuve

**L'extrait** (dossier temporaire de l'agent 3, `…\scratchpad\long3\extraits\`) : `L02-avant-0-90s.mp3` (la piste du film publié) et `L02-apres-0-90s.mp3` (la même voix, la grille ci-dessous, mixée comme le film : voix + habillage × 0,8, un gain pour tout le film à −14 LUFS) ; la grille complète : `L02-grille-sonore.json`. Ce qui s'y entend, dans les souffles : un coup à 0,03 s ; le clac de la ligne qu'on coupe après « coupée » ; le monde qui se tait sur « rien » ; la musique qui lâche sous « te tuer » puis un coup ; le clac de la pince « défaite dans le mauvais ordre » ; le vent quand tu montes ; la voisine qui grésille sous tension ; « Alors… on l'ouvre » (inspiration, silence, coup léger, trois pièces qui se posent, un clic par pièce nommée) ; la carte « Le poste » (coup et accord dans le souffle après « pourquoi », nouvelle section de musique) ; le bourdon du poste qui revient sur « champ électrique » ; l'arc qui tient sous « l'arc vient te chercher » ; un coup après « sous tes pieds ? ».

| 0 → 90 s | Avant (film publié) | Après |
| --- | --- | --- |
| Loudness · plage | −14,2 LUFS · 3,5 LU | −14,3 LUFS · 3,3 LU |
| Largeur (côté / milieu) | −37,6 dB (mono) | −14,3 dB |
| Grave < 60 Hz (sous le total) | −18,2 dB | −14,6 dB |
| 200 Hz → 8 kHz | identique à 0,2 dB près | |
| Crête du film entier après le gain | −0,6 dBFS | −0,5 dBFS |
| Habillage : attaques qu'un portable joue | 1,0 / min | 2,9 / min (sur tout le film ; la grille n'a été écrite en détail que pour les 100 premières s) |
| Sons nouveaux posés sur un mot | — | aucun (`qa` : restent les 2 anciens, « lâche » et « sec ») |

L'habillage est 2 à 3 dB plus bas qu'avant sous la voix (la musique s'efface sous la phrase, plus sous le mot) : la voix reste devant.

**La planche** : `…\scratchpad\long3\planche-fil-ouvert.jpg` — les trois cartes qui suivent les coupures pub de L02, avant / après `threadCall` (look sur la copie).

**Rien ne change pour ce qui existe** : avec le nouveau `sfx.mjs`, les habillages de **025 et L02 sont identiques à l'octet** à ceux sur le disque (empreintes 4e00e089… et 3ea6ae5c…, trois fichiers chacun : copie, référence, épisode) ; avec le nouveau kit, `look --cpu` sur des copies de **025 et L02** donne des planches **identiques à l'octet** avant / après (11af1981…, 7e47fe85…). Aucun fichier d'`episodes/` ni de `renders/` n'a été écrit.

## 4. À changer ailleurs (pas mes fichiers)

- **`kit/template-long/episode.json` (agent 1)** — la grille sonore de départ (remplace `sfx` ; le riser sous « Alors… on » et l'impact sur « on » sortent) :
  ```json
  "sfx": [
    { "type": "space", "mix": 0.22, "size": 0.84, "damp": 0.35 },
    { "type": "music", "width": 0.7, "sections": "chapters", "skip": ["ouvre"], "drop": 0.5, "gain": -21, "phone": 0.25, "curve": [[0, 0.9, 0.5], ["ouvre-0.4", 0.55, 0], ["etape1-1", 1, 0.55], ["test-1", 1, 0.85], ["chute", 0.7, 0], ["boucle", 0.8, 0.5]] },
    { "type": "drone", "gain": -27, "curve": [[0, 0.8], ["rewind", 0.8]] },
    { "type": "ambience", "preset": "room", "from": 0, "gain": -36 },
    { "type": "chapters", "style": "film", "skip": ["ouvre"] },
    { "type": "boom", "at": 0.03, "gain": -13, "size": 1.2 },
    { "type": "suck", "to": "ouvre-0.04", "dur": 0.3, "gain": -18 },
    { "type": "hush", "from": "ouvre", "to": "explode-0.02", "depth": -14 },
    { "type": "boom", "at": "ouvre$+0.05", "gain": -15, "size": 0.7 },
    { "type": "click", "at": "ouvre$+0.22", "gain": -18 },
    { "type": "click", "at": "ouvre$+0.38", "gain": -19, "pitch": 0.85 },
    { "type": "click", "at": "ouvre$+0.54", "gain": -20, "pitch": 1.15 },
    { "type": "impact", "at": "toloop", "gain": -16, "size": 0.7 },
    { "type": "rewind", "at": "rewind", "dur": 1, "gain": -21 }
  ]
  ```
  Le décorateur ou l'architecte remplace `room` par le lieu du film (`hum`, `factory`, `wind`) ; chaque chapitre ajoute ses sons calés sur l'image, dans les souffles.
- **Agent 1 (script)** : le fil ouvert d'une coupure pub suivi d'au moins 1,2 s de souffle et d'une carte ; une phrase courte du fil, prête pour `threadCall` (dans `docs/<ep>-actes.md`) ; la réponse à l'accroche écrite comme une scène.
- **Agent 2 (image)** : l'image 0 en mouvement et un changement de vue avant 3 s ; aucun plan de plus de 12 s (une même composition qui tourne ne compte pas) ; la réponse à l'accroche mise en scène (pas deux objets dans le noir) — `qa` les mesure.
- **`kit/lib/long.js`** (option possible) : un `thread(chapter)` dans `buildChapters` dessinerait le fil dans la carte elle-même ; `threadCall` le fait déjà de l'extérieur.
- **`scripts/srt.mjs`** (option) : écrire les repères de coupure pub sous les chapitres ; `qa` les donne déjà.

## 5. Limites, et ce que les courbes trancheront

- **Je mesure, je n'entends pas** : la grille n'a pas été validée à l'oreille ; c'est l'écoute de Merwan, au casque ou sur la télévision puis sur l'ordinateur, qui tranche. Le niveau des nappes (`hum` −33 dB, `wind` −31 dB) est le premier réglage à revoir.
- La grille n'a été écrite plan par plan que pour les 100 premières secondes de L02 ; le reste du film n'a que les nappes et les cartes.
- Les seuils de `qa` (12 s, 4 s, 3 s) viennent de la règle de Merwan et de deux films, pas d'une courbe. **Dès que les captures de YouTube Studio arrivent** : poser l'« intro » (part à 30 s) contre les 8,9 s d'image fixe de L02 et les 1,0 s de L01 ; chercher un « dip » dans les plans de plus de 12 s (2:31, 6:02, 8:32 sur L02) ; regarder la courbe aux trois coupures pub et au retour ; comparer la durée moyenne des deux films (L01 haché, L02 lent).

## Texte proposé pour CLAUDE.md

> **La rétention d'un long (21/10, après la mesure de L01 et L02).** Les deux longs en ligne ont un habillage mono (côté / milieu −43 dB), une seule boucle de quatre accords pour neuf minutes, dix sons dont les cartes tombent sur la fin de la phrase d'avant, et une plage de loudness de 3 LU ; L02 tient 9 plans de plus de 12 s (174 s, dont la réponse à l'accroche) et sa première image 8,9 s. La grille du long, minute par minute, et ses dispositifs sont dans `docs/recette-long-retention.md` : `music` en sections et en stéréo (`width`, `sections`, `drop`), `chapters` en style `film` (souffle, boom, accord de la section), `space` (la réverbération), `ambience` (`hum`, `factory`, `wind`, `room`), `boom`, `drop`, `buzz`, et `threadCall` (le fil ouvert sous la carte qui suit une coupure pub). `npm run qa -- <long>` mesure le rythme du long et **donne le repère de chaque coupure pub à poser dans YouTube Studio** (l'instant le plus calme du souffle). Tout est en option : 025 et L02 rendent à l'identique, à l'octet. Extrait avant / après et planche : `docs/scale/long-3-retention-wow.md`.

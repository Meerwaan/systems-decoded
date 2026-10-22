# La rétention d'un long — la grille, minute par minute (21/10)

Ce qui fait qu'on ne voit pas passer neuf minutes, sur un ordinateur ou une télévision. Écrite après la mesure des deux longs en ligne (L01 le pare-brise, L02 le poste haute tension) : le détail, les chiffres et les sources sont dans `docs/scale/long-3-retention-wow.md`. La forme du long (10 à 11 min, chapitres, coupures pub, fin sans annonce) est dans CLAUDE.md, la chaîne de fabrication dans `docs/recette-long.md`. Rien ici ne change un film publié.

**Ce qui se mesure** : `npm run qa -- <long>` a maintenant sa section « rythme du long » (≈ 30 s de plus) : les changements de vue (coupe, fondu, révélation), les plans de plus de 12 s, les plages sans mouvement, les 30 premières secondes, le souffle avant chaque carte, **le repère de chaque coupure pub à poser dans YouTube Studio**, les sons posés sur un mot, l'habillage tel qu'une télévision et un portable l'entendent. Quand les courbes de YouTube Studio arriveront, les seuils se resserrent sur elles.

## Les repères mesurés

| | L01 (pare-brise) | L02 (poste HT) | La règle |
| --- | --- | --- | --- |
| Changement de vue | toutes les 2,3 s | toutes les 5,3 s | 5 à 10 s, jamais plus de 12 s |
| Plans > 12 s sans changement | aucun | 9 (174 s, dont 34 s sur le disjoncteur) | aucun |
| Première demi-seconde (mouvement) | 2,19 | 0,21 | ≥ 2 |
| Premier changement de vue | 1,0 s | 8,9 s | avant 3 s |
| Habillage, largeur (côté / milieu) | −43 dB (mono) | −44 dB (mono) | −15 à −3 dB |
| Habillage, attaques qu'un portable joue (> 200 Hz) | 2 par minute | 1 par minute | une par coupe et par mot-pivot |
| Musique | une boucle de 4 accords (≈ 23 s) pour 9 min | la même, 24 fois | une section par chapitre |
| Sons de carte posés sur la fin de la phrase d'avant | 10 cartes sur 12 | 8 sur 10 | aucun |
| Moitié droite les 15 dernières s (écran de fin) | plus sombre et moins chargée ✓ | idem ✓ | libre |

## La grille

**0:00 → 0:01 — l'image 0 et le premier coup.** L'image 0 bouge déjà (un sujet qui fonce, une caméra en route : L01 2,19 contre L02 0,21) et porte la menace de l'accroche. Un `boom` à 0,03 s (le sub pour la télévision, le corps et le craquement pour un portable).

**0:01 → 0:30 — l'« intro » de YouTube** (Studio donne la part encore là à 30 s : c'est le premier chiffre à lire). Seconde par seconde :
- **0 → 4 s** : le mot de l'accroche a son image *sur le mot* ; un changement de vue avant 3 s (L02 a tenu la même image 8,9 s).
- **4 → 25 s** : un changement de vue toutes les 3 à 5 s (plus serré que le reste du film) ; sur chaque coupe et après chaque mot-pivot, un son court **dans le souffle** (`clack`, `click`, `hit`, `swish`) ; un `drop` puis un `boom` sur la phrase qui menace (« … elle peut encore te tuer » → le silence, puis le coup).
- **≈ 25 → 35 s** : la relance (le défi, l'abonnement de transition) avec un vrai changement de lieu — c'est là que l'attention décroche dans les longs (piste des éditeurs, à confirmer sur nos courbes).
- **« Alors… on l'ouvre »** : `suck` jusqu'au mot (dans le souffle qui le précède), `hush` entre « Alors… » et « on », puis l'éclaté : un `boom` léger et trois `click` de pièces qui se posent *après* « l'ouvre », un `click` par pièce nommée. Jamais de riser sous « Alors… on ».

**Chaque chapitre (60 à 80 s)** :
- **la carte** (`chapters` en style `film`) : un souffle qui monte du silence, un `boom`, un accord frappé dans la tonalité de la section qui commence — et **la musique change de section** (`music` avec `sections`) : la carte s'entend autant qu'elle se voit. La musique se tait 0,5 s avant (`drop`) : la carte tombe sur un souffle ;
- **un nouveau plan toutes les 5 à 10 s, jamais 12 s sur la même composition** — une même composition qui tourne lentement ne compte pas (L02 : 22 s sur la chambre du disjoncteur, 20 s sur le récit de 1987) ;
- **le lieu s'entend** : `ambience` (`hum` pour l'électricité, `factory` pour une usine, `wind` en hauteur, `room` sinon) ;
- **un mot qui frappe** (`D.punch`, une fois par chapitre au plus, jamais sur une coupe) et, sur le geste qu'on montre, son son (un `click` par pièce, un `buzz` sous un arc qui tient, un `clack` pour un sectionneur) ;
- **un moment « wow » au plus** : `drop` (la musique se tait 0,5 à 0,6 s) puis `boom` — la seule dynamique du film : un long rendu à LRA 3 LU sonne plat sur une télévision ;
- **la dernière phrase relance** (une question, une promesse, une menace) : c'est le script qui la porte (`docs/recette-long.md`).

**Les coupures pub (≈ 2:00, ≈ 4:00–4:30, ≈ 6:00–7:00)** — depuis mai 2025, YouTube sert moins de pub sur un repère posé en pleine phrase et préfère une pause ou une transition visuelle :
- le fil laissé ouvert, puis **un souffle d'au moins 1,2 s** avant la carte (L02 : 1,44 à 1,59 s ✓ ; L01 après « oubli » : 0,87 s et pas de carte) ;
- **le repère se pose à l'instant le plus calme de ce souffle** : `qa` le donne (L02 : 2:06.4, 4:10.2, 6:06.0) ;
- au retour de la pub, la carte du chapitre suivant et, sous elle, **le fil ouvert** (`threadCall`) : « La voisine ? Toujours sous tension. » — celui qui revient de la pub retrouve ce qu'on lui doit.

**L'acte 3, le test (≈ 6:30 → 7:50)** : `drive` à 0,85 dans la courbe de la musique (l'arpège, le pied, et au-dessus de 0,6 la pulsation des doubles croches : l'horloge du test), le plus gros `boom` du film précédé du plus long `drop`, les coupes serrées (3 à 5 s).

**La fin (la dernière minute)** : la chute dans un `hush` ; la réponse à l'accroche mise en scène comme un moment, pas comme deux objets dans le noir (L02, 8:32 → 8:55) ; like, commentaire, rendez-vous ; **les 15 dernières secondes laissent la moitié droite libre** (`qa` compare les deux moitiés) et la musique se résout pendant la boucle.

## Les dispositifs, en une ligne

| Dispositif | Où | La ligne |
| --- | --- | --- |
| La musique en sections, en stéréo | `scripts/sfx.mjs` · `music` avec `width` / `sections` (→ `score`) | `{ "type": "music", "width": 0.7, "sections": "chapters", "skip": ["ouvre"], "drop": 0.5, "phone": 0.25, "curve": … }` — quatre progressions (`PROG`), une par section, chacune son arpège ; `drive` > 0,6 ajoute la pulsation |
| La carte qui s'entend | `chapters` · `style: "film"` | `{ "type": "chapters", "style": "film", "skip": ["ouvre"] }` — souffle, `boom`, accord ; si la phrase d'avant court encore à l'instant de la carte, le coup tombe dans le souffle qui la suit |
| La pièce (la queue des sons) | `space` | `{ "type": "space", "mix": 0.22, "size": 0.84, "damp": 0.35 }` — une réverbération stéréo, sans le sub |
| Le lieu qui s'entend | `ambience` | `{ "type": "ambience", "preset": "hum", "from": 0, "to": "recap", "gain": -33, "curve": [[moment, niveau], …] }` |
| Le coup du « wow » | `boom` (+ `drop`) | `{ "type": "drop", "at": "x", "pre": 0.55 }`, `{ "type": "boom", "at": "x", "gain": -14 }` — `gain` est la crête |
| L'arc qui tient | `buzz` | `{ "type": "buzz", "from": "a", "to": "b", "gain": -25 }` |
| Le souffle avant la carte | `swell` | posé par `chapters` « film » ; seul : `{ "type": "swell", "to": "x", "dur": 0.85 }` |
| Le fil ouvert | `kit/lib/blocks.js` · `threadCall` ; `kit/brand.css` · `.thread` | `threadCall(D.tl, { from: D.at("disj1") - 0.6, to: D.at("disj1") + 1.6, text: "La voisine ? Toujours sous tension." })` |
| Le mot qui frappe | `kit/lib/direct.js` · `D.punch` (des courts) | `D.punch(D.at("beat:mot"), 0.05)` |
| La mesure | `scripts/qa.mjs` · `rhythmLong` | `npm run qa -- <long>` |

Les sons des courts (`hit`, `click`, `swish`, `suck`, `hush`, `clack`, `zap`) servent tels quels : la règle reste **dans les souffles, jamais sur un mot** (`qa` les liste).

## Le son d'un long : ce qui change par rapport au téléphone

- **La largeur** : la musique, les lieux et les queues en stéréo ; la voix au centre. Le film publié était mono (côté / milieu −38 dB) ; avec la grille : −14 dB.
- **Le grave existe** (la télévision, le casque) mais **ne porte rien seul** : un portable ne joue rien sous ≈ 150 Hz — chaque coup a un corps vers 120 Hz et un craquement vers 2,6 kHz.
- **Les niveaux** : la voix devant, l'habillage ≈ 9 LU dessous (inchangé) ; la crête du film après le gain à −14 LUFS reste sous −0,5 dBFS (`gain` d'un `boom` = sa crête ; −13 à −16 suffisent).
- **La dynamique se fabrique** : `drop` et `hush` avant les coups. Sans eux, la plage de loudness reste à ≈ 3 LU.
- **Jamais un son sur un mot** ; les nappes (musique, lieu, `buzz`) passent sous la voix et s'effacent sous les phrases.

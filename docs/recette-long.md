# La recette d'un long (YouTube, 16:9) — d'après le pilote L01

Écrite le 2026-10-15 au soir, à la fin du montage du L01 (« Fabriqué pour te sauver : ton pare-brise », 8 min 51), sur les mesures de `npm run metrics -- L01` (`metrics/production.json`). Le but de Merwan : **2 à 3 longs par semaine au départ, au moindre coût en jetons, sans rien céder sur la qualité**. Ce fichier dit comment, et ce qui coûte. Le format lui-même (le principe, la voix, la forme) est dans CLAUDE.md, « Le format long (YouTube) ».

## Trois exigences de Merwan, qui valent pour tous les longs

- **« Si c'est trop statique on perd l'attention »** : la caméra ne s'arrête jamais ; un nouveau plan (coupe, ou mouvement qui révèle autre chose) toutes les 5 à 10 s ; jamais plus de 4 s sans mouvement visible ; on suit l'objet le long de la chaîne ; un mouvement vif (un « fouet ») sous chaque carte de chapitre.
- **« Il ne faut pas que l'image soit vide, mais pas trop remplie non plus »** : un sujet par plan qui occupe le tiers à la moitié du cadre ; toujours un fond qui situe (machine aux rayons X, grille, lueur), plus sombre et plus fin que le sujet ; jamais un petit objet seul dans du noir ; une seule information écrite à la fois (mot-clé OU fait OU étiquette) ; ce dont on ne parle pas s'éteint.
- **Un long n'est pas un gabarit où seul l'objet change** (« trop simple, un manque de qualité et de professionnalisme ») : ce qui se réutilise, c'est l'outillage et le savoir-faire ; chaque long a ses machines fidèles à SON procédé réel, sa pièce maîtresse visuelle (ici le ruban orange sur l'étain), sa première image et sa mise en scène.

## Ce que le pilote a construit une fois (et qui ne se refait plus)

| Quoi | Où | Ce que ça fait |
| --- | --- | --- |
| Le cadre 16:9 | `kit/long.css`, `kit/lib/landscape.js` (importé en premier : sans lui la 3D est rendue en portrait puis étirée), `kit/template-long/` | 1920 × 1080, l'en-tête « DOSSIER · ÉTAPE 03 / 08 · température », les zones (mots-clés en bas à gauche, faits en colonne, moitié droite libre les 15 dernières secondes) |
| Les textes à l'écran | `kit/lib/long.js` (`buildChapters`, `buildKeywords`, `lineHud`, `fact`, `chipEl`) ; `D.commit({ long })` dans `kit/lib/direct.js` | une carte par chapitre (`chap` dans le script) 0,9 s avant son premier mot ; les mots marqués `*…*` / `+…+` en mots-clés au moment où ils sont dits ; `quiet` : des fenêtres où aucun mot-clé ne passe |
| Les mots hors de l'image | `npm run srt -- <ep>` (`scripts/srt.mjs`) | `renders/<dossier>.srt` tiré des vrais instants de la voix, et les chapitres horodatés écrits dans `post.youtube.description` (à partir de `descriptionTemplate`, marqueur `__CHAPITRES__`) |
| La miniature | `npm run cover -- <ep>` sur un long → `renders/<dossier>-miniature.png` 1280 × 720 | `episode.json` → `thumb` : `at`, `cam`, `state`, `title` (deux ou trois mots), `tone` |
| La musique | `scripts/sfx.mjs` → type `music` | pad, basse, arpège et pied quand « drive » monte ; s'efface sous la voix ; `curve: [[moment, niveau, drive]]` ; mesuré 8 à 10 LU sous la voix |
| Le kit d'usine aux rayons X | `kit/lib/usine.js` (fours : fusion, tunnel, résistances ; cuve plate à miroir, autoclave ; tapis à rouleaux), `kit/lib/postes.js` (portiques à quatre outils, salle blanche, soufflerie, tour de chute, tête d'essai, banc optique, poinçon) | **des familles de machines très réglables** : le catalogue (chaque réglage, des exemples de réglages qui donnent des machines différentes, les poses vues) est dans `docs/journal/L01-usine.md` et `L01-postes.md` |
| Les outils à la taille d'un long | `look`, `review` lisent le cadre de la page ; `qa` lit le film par tranches de 60 s (un long décodé d'un coup ne tient pas en mémoire) ; `chrono` accepte `L01` | |

Les blocs des courts qui désignent les boutons de TikTok (`followCall`, `likeCall`, `commentCall`, `nextFile`, `rail`) **plantent sur la page d'un long** : les appels à l'action d'un long passent par la voix, `fact` et le nom du compte allumé à la main.

## La chaîne, dans l'ordre (mesurée sur le L01)

| Étape | Qui | Mesuré au L01 |
| --- | --- | --- |
| 0. Kit 16:9 (une fois) | celui qui orchestre | ≈ 35 min |
| 1. Architecte : `plan.js` (sans import), `world.js` (le contrat), un bouchon par décor avec sa vraie interface, les fichiers de chapitres vides, `docs/<ep>-decors.md`, `docs/<ep>-actes.md` (les phrases sur les vrais instants de la voix) | 1 agent | 27 min · 417 k |
| 2. Décors, en parallèle, un fichier chacun | 5 agents | 23 à 28 min · 330 à 400 k chacun · 1,83 M |
| 2 bis. **Habillage** (depuis le 16/10, pas encore mesuré sur un long) : la vie de chaque lieu — `docs/recette-decorateur.md`, `kit/lib/details.js` ; il tourne pendant l'intégration | 1 à 2 agents | visé : 20 à 25 min · 250 à 400 k chacun |
| 3. Intégration des « À changer ailleurs » des décors dans le contrat, et la planche des candidates de la première image | 1 agent | 8 min · 272 k |
| 4. Choisir la première image (planche de six) | celui qui orchestre | 2 min |
| 5. Chapitres, en parallèle, un fichier par groupe de chapitres (≈ 60 à 110 s de film chacun) | 7 agents | 11 à 19 min · 280 à 380 k chacun · 2,21 M |
| 6. Relecture du film entier : deux planches de 28 images (une toutes les 9,6 s) | celui qui orchestre | 7 min |
| 7. Reprises des plans faibles, par l'agent qui les a montés (`SendMessage` : il garde son contexte) | 5 agents | 3 à 5 min · 13 à 23 k chacun |
| 8. Brouillon (8 min 42 de calcul), `qa`, reprises des images parasites | celui qui orchestre + 4 agents | 16 min · 63 k |
| 9. Rendu final, `qa`, miniature, `srt` | celui qui orchestre | 17 min |

**Total du pilote : ≈ 2 h 45 de bout en bout (2 h 13 chronométrées de l'architecte à la miniature, plus ≈ 35 min de kit 16:9) et 4,91 M de jetons d'agents** (21 agents ou reprises : décors et intégration 2,56 M, chapitres 2,35 M), sur une voix déjà faite. Jauge : la fenêtre de 5 h de 32 à ≥ 39 % avant sa remise à zéro, puis de 1 à 35 % — ≈ 45 points en tout ; hebdo 56 → 65 % (**+9 points**). Rendu final : `check` sans erreur (31/31 contrastes), voix calée à 0 ms, −14,03 LUFS, **aucune image parasite** (le mouvement le plus heurté : 465,0 s, le témoin de l'essai).

## Ce qui a raté, et la règle qui en sort

- **Des images vides** à la première relecture (un petit objet dans un grand cadre sombre : la tour d'essai en plan large, le témoin dans un coin, le document de 1902, la découpe) : la consigne des chapitres avait la règle, pas le chiffre. Écrire dans `docs/<ep>-actes.md`, pour chaque plan, **la part du cadre que tient le sujet**, et préférer le gros plan quand un décor est fait de traits fins.
- **Des murs orange** : un verre plat et chaud vu de près remplit la moitié du cadre d'un aplat. Le verre chaud se montre plus large, avec la machine qui le situe et sa lueur sur la hotte ; et **le signal est réservé au verre au-dessus de ≈ 450 °C** (l'autoclave à 140 °C teintait tout son tambour : corrigé dans `usine.js`).
- **Une plaque blanche sur le ruban** : le verre plat comme un miroir renvoie le panneau froid du studio (`stage.js · studioEnvironment`) quand on le regarde en rasant vers +x/−z (az ≈ −30 à −70). Sur le verre chaud : az ≥ −15 ou ≈ −86, el hors de 22–32 — ou baisser le poids de ce panneau dans le shader du ruban (`verre.js`).
- **Les images parasites du brouillon** (72, en six endroits) avaient quatre causes, toutes déjà écrites dans CLAUDE.md pour les courts : deux tweens du même nombre qui se chevauchent à une coupe (la pluie de grains remise à 0 par la coupe suivante) ; un motif rayé (rouleaux, planches, conduits) traversé vite ; un plan de durée négative qui chevauche le suivant ; la caméra qui quitte un voile (une hotte de verre) en plein plan. **À mettre dans la consigne de chaque chapitre** : aucun `shot` de durée ≤ 0, aucun nombre dont deux tweens se chevauchent, rouleaux et rayures longés lentement ou coupés.
- **Le premier plan choisi tôt** : la planche de six candidates tirée par l'intégration, choisie avant les chapitres, a fait que la fin a bouclé juste du premier coup. À garder.
- **Les reprises par `SendMessage` coûtent 13 à 23 k** au lieu de 300 k pour un agent neuf : c'est la bonne façon de corriger.

## Pour le L02 : ce qui doit coûter moins, sans rien céder

1. **Pas d'étape 0** : le kit 16:9 existe (−45 min).
2. **Les décors partent des kits, réglés autrement** : le four, la cuve, le tapis, les portiques, la salle, la tour sont là — un long ne modélise que **son objet** et **ses machines propres** (pour l'airbag : le métier à tisser, la découpe laser, la couture, le pliage, le générateur). Attendu : 3 décors au lieu de 5, ≈ −0,7 M. Jamais un bloc posé tel quel : la consigne de chaque décor dit quels réglages changent son allure.
3. **L'intégration se fond dans l'architecte** : les décors écrivent leurs « À changer ailleurs » dans leur journal, l'architecte (repris par `SendMessage`, il a le contexte) les applique et tire la planche des candidates (−270 k).
4. **Six groupes de chapitres au lieu de sept** si le film le permet, avec la règle du cadre chiffrée et les règles anti-parasites dès la consigne : moins de reprises.
5. **Un seul brouillon** : il a suffi ici ; le rendu final se lance dès que les reprises des images parasites sont rentrées.

Cible du L02, à mesurer : **≈ 2 h et ≈ 3,5 M de jetons d'agents**, ≈ 35 points de fenêtre et ≈ +6 d'hebdo. Deux longs par semaine tiennent alors dans l'hebdo avec les courts ; trois demandent que les courts de la semaine reprennent leurs décors.

## Les transitions : des plans qui se suivent et collent l'un à l'autre (Merwan, 16/10)

Après avoir vu le L01 en entier : « très bien pour un épisode 1 et pilote », mais « pour les futurs il faut des transitions vraiment qui se suivent et qui collent les unes aux autres, sinon ça rend pas bien » — certaines coupes du L01 cassent le rythme. Le L01 reste tel quel ; à partir du L02 :

- **Une coupe est un raccord, jamais un saut** : sur la même forme (le bord du verre d'un plan devient le bord du verre du suivant), sur le même objet à la même place de l'écran (comme le raccord décor → établi des courts), ou sur le mouvement (la caméra garde sa direction et sa vitesse de part et d'autre de la coupe).
- **On ne coupe pas pendant que la caméra freine ou repart** : soit le mouvement continue à travers la coupe, soit la coupe tombe sur un temps fort de la voix ou du son.
- **Entre deux lieux** (usine → labo → établi → voiture), un passage qui se voit : un fouet flou de mouvement des deux côtés de la coupe, ou une plongée dans un détail qui devient le détail du lieu suivant.
- **Au plan de mise en scène** (`docs/<ep>-actes.md`), chaque coupe écrit son raccord (forme, objet, mouvement) ; un groupe de chapitres rend à son voisin la pose ET le mouvement en cours.
- **À construire dans le kit avant le L02** : un fondu de quelques images sur les coupes de lieu à lieu (le plateau connaît les coupes : `stage.cut`), et une aide `D.match(at, from, to)` qui pose une coupe en raccord de mouvement.

## La miniature (refaite le 16/10 : la première faisait « vraiment amateur »)

La première version (la tête de verre contre la toile, vue de l'intérieur, grise sur noir) ne donnait pas envie de cliquer : à 160 px, une boule floue et des fissures en cheveux. Ce qui marche mieux :

- **un objet PLEIN, éclairé, au tiers droit** — au L01, la masse de 10 kg orange qui fend le pare-brise, la toile blanche qui rayonne autour ; jamais un personnage de verre, jamais un décor aux rayons X seul ;
- **la forme de l'objet qui traverse le cadre** (la courbe du pare-brise en diagonale) plutôt qu'un objet posé au centre ;
- **deux ou trois mots énormes** (300 px sur 1080, contour sombre), le dernier dans la couleur du sens (signal = la menace, veille = ce qui sauve), et **un cartouche-fait** au-dessus (« TEST · 10 KG ») plutôt que le numéro de dossier, qui ne dit rien à un inconnu ;
- **plus de contraste que le film** : `thumb.grade` (`{ contrast: 1.32, saturation: 1.15 }`) ;
- **trois miniatures pour le test de YouTube** (il en fait tourner jusqu'à trois) : `thumb`, `thumb2`, `thumb3` → `npm run cover -- <ep>`, `--alt 2`, `--alt 3` → `<dossier>-miniature.png`, `-miniature-2.png`, `-miniature-3.png`. Trois objets différents, trois phrases différentes, le même ton (au L01 : la masse de 10 kg « IL DOIT CASSER », la bille d'acier « ÇA NE PASSE PAS », le pare-brise étoilé « PAS FAIT POUR TENIR »).

On cherche l'image sur une planche `look --bare` de six angles autour de l'instant le plus fort du film, avant d'écrire le texte.

## Le titre (16/10 : « il fait autant le travail » que la miniature)

- **Le titre et la miniature se complètent, ils ne se répètent pas** : la miniature montre un instant (au L01 : la casse), le titre promet le chemin (« du sable au test de casse »). Le premier titre du L01 redisait « il DOIT casser », déjà écrit en énorme sur la miniature : deux fois la même information, une place perdue.
- Il doit aller avec les TROIS miniatures de la rotation : il ne parle donc d'aucune en particulier.
- Le mot que les gens cherchent en tête (« Comment c'est fait : », l'objet), l'essentiel dans les 60 premiers caractères (au-delà, le téléphone coupe), aucune majuscule criée, aucune promesse que le film ne tient pas.
- Deux titres de rechange dans `post.youtube.titleAlts` (un paradoxe court, une version « comment on fabrique ») pour le test ; la raison du choix dans `titleNote`.
- Retenu au L01 après une recherche (16/10) : **« Comment on fabrique un pare-brise (et pourquoi il casse) »** — la requête telle qu'on la tape, en tête ; la parenthèse est la QUESTION dont la miniature donne l'affirmation (« IL DOIT CASSER ») : c'est la paire qui ouvre une boucle, pas une répétition. Les données propres à notre créneau (CTR, suggestions de recherche) n'existent pas encore : c'est le test A/B de YouTube Studio et les chiffres du L01 qui trancheront pour la série.
- **Corrigé le même jour par Merwan : « pas assez accrocheur, beaucoup trop niche ; il faut limite du putaclic, mais qui reste fidèle ».** Le titre ne décrit pas la vidéo, il donne le fait le plus incroyable qu'elle prouve, en une phrase courte (≈ 45 à 55 caractères), au plus un mot en capitales. Retenu : **« S'il ne casse pas, ton pare-brise est refusé »** ; pour le test : « On lâche 10 kg sur ton pare-brise. Il DOIT casser » et « Ton pare-brise est fait de sable (et on le frappe exprès) ». Le mot de recherche (« comment on fabrique ») va dans la description, pas en tête du titre. Fidèle veut dire : chaque mot est vrai dans le film (ici, l'essai de la tête du R43).
- **Puis, plus choc encore (sa demande, « vrai titre YouTube »)** : **« Moins d'1 mm entre ta tête et la route »** — l'enjeu (ta tête), un chiffre qui intrigue, aucun mot technique ; pour le test : « Ton pare-brise DOIT casser pour te sauver la vie » et « On lâche une tête de 10 kg sur ton pare-brise ».
- **Et plus long** (« là c'est vraiment court ») : l'accroche d'abord, puis « : » et la promesse avec le mot cherché — **« Moins d'1 mm entre ta tête et la route : comment on fabrique ton pare-brise »** (75 caractères). Ce qui doit tenir si le téléphone coupe vers 60 caractères, c'est l'accroche, pas le mot-clé.

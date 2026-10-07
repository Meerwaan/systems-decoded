# Veille & références — Système Décodé (audit du 2026-10-07, version finale)

Portée : ce qui sépare nos films des meilleurs du genre, ce qu'on peut leur prendre sans perdre notre identité, et 15 sujets classés.
Matériel : mesures de mouvement de la première passe (`motion_*.txt`, `motion.mjs` : différence d'images dans la zone sujet 430–1170, 10 i/s), minutages réels (`timing/script_00X.txt`), 12 planches regardées, `episode.json` et `main.js` des 005/006, 30 recherches web.
Limites, dites franchement : aucune interview de première main trouvée sur les méthodes de Zack D. Films, Animagraffs ou Lesics (sources secondaires seulement) ; @souslecapot_ est introuvable par la recherche web (TikTok n'est pas indexé) ; les repères TikTok 2026 viennent de blogs d'agences, pas de TikTok. Je n'entends pas le son : tout ce qui touche à l'oreille est « à valider par Merwan ».

## 1. Propositions précises (du plus rentable au moins rentable)

### P1 — 005 : l'accroche ne montre ni la panne ni « toi » (gratuit, M)
Preuve : `frames/005/hook_01.jpg` et `hook_02.jpg` (0 → 3,3 s, 20 images) : la même cuve, au pixel près ; seuls les mots de la carte s'allument. `film_01.jpg` : rien ne change avant 4,5 s. Énergie mesurée : 0,4 / 0,5 / 0,6 / 0,5 sur les quatre premières secondes (006 : 11,1 / 8,6 / 7,7 ; 004 : 6,5 / 7,5 / 7,7). Cause : `episodes/005-arret-urgence/src/main.js:157` — `shot(0, t.promesse - 0.35, { az: 23 }, "sine.inOut")` : un quart de tour qui démarre à vitesse nulle. La voix dit « Panne de courant. Et c'est toi qui es aux commandes » : à l'image, pas de panne, pas de toi. Notre propre règle (« la première image montre déjà ce que dit l'accroche ») n'est pas tenue, et c'est le seul film de la série dans ce cas.
Correctif :
1. **La panne se voit à 0,28 s** (premier mot) : la lumière du plateau tombe à 25 % en 3 images (clé + environnement), il ne reste que ce qui émet — le cœur orange, la couronne verte. Une étiquette fixe en zone haute (96, 470), couleur signal : `RÉSEAU · 0 V`, sortie à `hands` (5,28 s). Le « 100 % » du HUD reste : c'est lui la menace.
2. **La caméra bouge dès l'image 1** : `shot(0, t.promesse - 0.35, { az: 23, d: D * 0.82 }, "power2.out", D * 1.22)` avec un départ à `az: -12` (signature `shot(at, durée, pose, ease, fromD)` du `main.js` du 006, à porter). `power2.out` part à pleine vitesse. Cible : énergie 0–1 s ≥ 3.
3. **« Toi » est dans l'image à 1,88 s** (repère `you`) : un personnage de verre (`kit/lib/figure.js`, déjà utilisé à Chicago) de dos, au tiers gauche, devant un pupitre de trois touches dont une rouge. À `hands` (5,28 s, « Ne touche à rien ») sa main part vers la touche rouge et s'arrête. Ce plan **remplace** le panneau « TOI · AUX COMMANDES » (`film_01.jpg`, 4,5–7,5 s), illisible à 270 px. Bénéfice double : la touche rouge plantée ici paie le CTA like (« celui qui imagine encore un gros bouton rouge »).

### P2 — 005 : le CTA commentaire parle de chaleur, l'image montre l'électroaimant (gratuit, M)
Preuve : `frames/005/film_09.jpg` (ligne 2) et `film_10.jpg` (ligne 1), 68,5 → 74 s : la voix demande « une fois arrêté, il chauffe encore combien de temps ? », l'image garde l'électroaimant posé sur l'établi, immobile depuis 66 s et jusqu'à 80 s (énergie 0,2–1,2 sur 70–72 s et 76–79 s). La phrase n'a pas sa démonstration.
Correctif : coupe à `comment − 0.2` (68,8 s) vers la cuve dans la pose de 47–50 s (barres au fond, vertes). Sous le vert, le cœur garde une lueur orange **locale** (pas de `gel`, pas de mélange d'ambiance), qui respire lentement (période ≥ 3 s, amplitude 0,20 → 0,35). C'est la question, montrée ; la réponse reste dans le commentaire épinglé. À `abo` (74,7 s), la caméra sort de la cuve par le haut pour laisser la place au panneau du prochain dossier (P6). **Ne pas** faire remonter les barres pendant les CTA : ce serait montrer un redémarrage.

### P3 — 005 : la chute est une diapositive (gratuit, M)
Preuve : `frames/005/film_07.jpg`, 47 → 56 s : neuf secondes sur la même cuve ; le retournement est porté par un panneau de texte (« DU COURANT » barré → « RIEN »). Énergie 52–56 s : 1,3 / 1,5 / 0,5 / 0,4 / 0,4. Dans le 006, la chute a son image (le cadre du choc devenu vert).
Correctif : garder le texte barré sur « on ne dépense rien pour arrêter un réacteur », puis coupe à `chute:dépense#2 − 0.15` vers l'électroaimant de l'établi : les tirets du courant courent dans la bobine (règle du 1/7 de période par image), la tige est tenue, et un compteur en JetBrains Mono tourne à côté — `MAINTIEN · 0,00 → 4,37 kWh` (ordre de grandeur, pas un chiffre sourcé : sinon un simple compteur sans unité). « On dépense… pour l'empêcher de s'arrêter » : l'image montre une dépense qui ne s'arrête jamais. `brandHud` s'allume sur `empecher`.

### P4 — 006 : 14,5 s de boîte fermée immobile pendant les CTA (gratuit, S ou M)
Preuve : `frames/006/film_09.jpg` (à partir de la 4ᵉ vignette) et `film_10.jpg` : de 65,8 à 80,5 s, la boîte fermée sur l'établi, même cadre ; énergie 0,2–0,5 sur 71–73 s et 78–79 s. La fin (80,6 → 84,6 s, `film_11.jpg` : l'armoire verte au mur, lent travelling avant, puis la première image) est réussie : on n'y touche pas.
Version légère (S) : une orbite lente de 60° sur toute la durée (`sine.inOut`, 65,6 → 80,3 s) et un geste par CTA — like : le voyant fait son autotest (un clignotement lent) ; commentaire : la porte s'entrouvre de 15° et se referme ; abonnement : la boîte glisse vers la gauche quand le panneau s'ouvre.
Version pleine (M) : coupe à `like − 0.2` vers le hall ; la boîte retourne à son armoire le long du chemin vert (celui de l'acte 1, à l'envers), caméra derrière, `fov` 50, pour arriver exactement sur le cadre actuel de `tomorrow` (80,6 s). Les CTA deviennent « le système retourne en veille », et la boucle est préparée pendant 15 s au lieu de 4.

### P5 — Méthode, 007 et suivants : l'image 1 contient un corps et un mouvement déjà commencé (gratuit, S)
Preuve dans notre propre série : les deux ouvertures les plus vivantes ont un corps en danger dès la première image — 006 (quelqu'un tombe, énergie 11,1 ; `frames/006/hook_01.jpg`) et 004 (la main sur le fil, 6,5 ; `frames/004/hook_01.jpg`). Les deux plus fixes ouvrent sur un objet : 005 (une cuve, 0,4) et 002 (0,9). C'est aussi la règle du genre : Zack D. Films ouvre toujours sur un personnage pris dans une situation en cours.
Règle à ajouter à CLAUDE.md : « Image 1 = toi (ou la victime), en mouvement, et l'objet promis visible dans le même cadre (006 : la boîte verte au fond). Contrôle : énergie 0–1 s ≥ 3, sinon l'accroche est à refaire. » Pour le 007 : l'image 1 est la verrière qui éclate au-dessus du casque, pas un siège posé.

### P6 — 005 : le teaser du 006 est une barre blanche, alors que le 006 existe (gratuit, S)
Preuve : `frames/005/film_10.jpg` (76 → 79,5 s) ; `episodes/005-arret-urgence/index.html:104-107` : « Prochain dossier · 006 / Classé », une barre blanche, « 0 fois que tu as osé t'en servir ».
Correctif : à la place de la barre, une vraie image du 006 révélée par un balayage — le hall en plan large avec la lueur verte au fond (instant ≈ 5 s du 006), **pas** l'armoire avec son sigle : on voit « une boîte verte sur un mur », on ne lit pas « défibrillateur », et les gens devinent en commentaire. `#next-img { width:100%; height:210px; object-fit:cover; clip-path:inset(0 100% 0 0); }` puis `tl.to("#next-img", { clipPath:"inset(0 0% 0 0)", duration:0.9, ease:"power2.out" }, t.mur)` et une échelle 1 → 1,06 jusqu'à `aboEnd`. Le tampon « Classé » reste par-dessus. Règle pour la suite : avant de rendre le dossier N, modéliser la silhouette du héros du dossier N+1 (30 min) pour que le teaser ait une image. Le 006 → 007 garde son « 0,5 s » (lisible, fort) tant que le siège n'existe pas.

### P7 — Méthode : 21 à 24 % de chaque film vient après le mot « Like » (mesure d'abord)
Preuve (minutages réels) : du début du like à la fin — 002 : 19,3 s sur 94 ; 003 : 17,1 sur 82 ; 004 : 21,0 sur 86 ; 005 : 18,0 sur 85 ; 006 : 18,8 sur 85. « Like » annonce la fin à qui regarde ; les formats courts de référence n'ont aucun CTA final et coupent sur la chute.
À demander à Merwan (TikTok Studio, courbe de rétention) : le % de spectateurs encore là à la fin de la chute, au mot « Like » et à la dernière seconde — 002 : 68,5 / 74,3 / 93,6 s ; 003 : 57,1 / 64,4 / 81,5 s ; 004 : 58,4 / 64,3 / 85,2 s.
Si plus d'un tiers de ceux qui restent partent entre « Like » et la fin, le 007 s'écrit ainsi (texte nouveau, donc sans reprise) : chute → like en une phrase courte (≤ 2,5 s) → commentaire (≤ 4 s) → abonnement (≤ 4,5 s) → **l'anecdote en dernier** (Otis, Chicago, « elle refuse » : 5–6 s), annoncée à l'écran dès le like par une étiquette (`ENCORE 12 s · CHICAGO 1942`) → boucle. Bloc CTA ≤ 14 s. Les trois CTA de Merwan sont gardés ; c'est leur place et leur longueur qui changent.

### P8 — Sujets 007 à 021 : voir la section 4 (décision de Merwan)

### P9 — Pipeline : un contrôle de rythme dans `npm run qa` (gratuit, S à M)
La mesure existe (première passe). Chaîne : `-vf "crop=1080:740:0:430,fps=10,tblend=all_mode=difference,signalstats,metadata=print:key=lavfi.signalstats.YAVG:file=-" -f null -`, puis moyenne par seconde.
Seuils tirés de nos cinq films : (1) 0–1 s ≥ 3 ; (2) avant le premier CTA, aucune fenêtre de 2,5 s sous 0,6 hors `hold` voulu ; (3) dans les CTA, aucune fenêtre de 3 s sous 0,4. `qa` liste les fenêtres fautives avec leurs instants, comme il le fait pour les images parasites. Aujourd'hui : 005 échoue à (1) et (3), 006 à (3), 002 à (1).

### P10 — Compte : légendes qui disent la série et le mot cherché, sans vendre la chute (gratuit, S)
La légende du 005 (`episode.json → post.caption`) donne la chute : « il suffit d'arrêter de le retenir ». Celle du 006 ne contient pas le mot « défibrillateur » hors hashtag, alors que la découverte TikTok glisse vers la recherche (ICUC, Darkroom).
- 005 : « DOSSIER 005 · Arrêt d'urgence d'un réacteur nucléaire. Panne de courant générale : qu'est-ce qui l'arrête en deux secondes ? Indice : pas un bouton rouge. Et une fois arrêté, il chauffe encore combien de temps, à ton avis ? »
- 006 : « DOSSIER 006 · Défibrillateur. La boîte verte devant laquelle tu passes tous les jours décide seule s'il faut choquer, et refuse si le cœur bat. La plus proche de chez toi, elle est où ? »
- Dans l'app (Merwan) : une playlist « Les dossiers », dans l'ordre, épinglée ; chaque commentaire épinglé finit par « Dossier suivant : … ».

### P11 — Son : la boîte parle avec sa propre voix ; un motif de deux notes pour « on l'ouvre » (gratuit, S, à valider à l'oreille)
- 006, 38,43 → 40,03 s (« Elle parle : ne touchez pas le patient ») : la même prise, passée dans un petit haut-parleur pour les quatre derniers mots — `highpass=f=450,lowpass=f=3200,acompressor=threshold=-18dB:ratio=6,acrusher=bits=10:mix=0.25` entre `speak` et la fin du beat. Aucun crédit. C'est le geste sonore littéral qui fait la signature des meilleurs formats courts.
- Kit : le son de la vue éclatée est déjà le même dans les cinq films (`impact −16, size 0.8` + `whoosh`), mais c'est un son générique. Le remplacer par un motif à nous, deux notes montantes (quinte, 90 ms + 140 ms, −17 dB), rejoué quand `brandHud` s'allume à la chute. Nouveau type dans `scripts/sfx.mjs`. Les sons sont déjà denses (55 entrées pour 26 repères sur le 005, 62 pour 36 sur le 006) : il ne manque pas de sons, il manque un son reconnaissable.

### P12 — 006 : la tête de la victime finit sous la première ligne de la carte d'accroche (gratuit, S)
Preuve : `frames/006/hook_01.jpg`, images 5 à 10 (0,7 → 1,6 s) : la sphère ivoire de la tête se pose à y ≈ 1230–1270, exactement sous « QUELQU'UN S'EFFONDRE » écrit en signal. Rouge sur ivoire, dans la première seconde. Correctif : remonter le cadrage de 110 à 130 px (`shift`) pour que le corps au sol reste au-dessus de 1160, ou faire tomber le corps 25 cm plus loin de la caméra.

## 2. Mesures (énergie de mouvement, zone sujet ; source : `motion.mjs`)

| Film | 0–1 s | 0–3 s | 3–8 s | Film entier | 20 dernières s | Médiane | Bloc CTA |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 002 | 0,90 | 1,34 | 7,71 | 3,67 | 2,90 | 1,43 | 19,3 s (21 %) |
| 003 | 1,94 | 4,33 | 10,79 | 4,94 | 3,34 | 2,51 | 17,1 s (21 %) |
| 004 | 6,54 | 7,28 | 13,40 | 5,53 | 2,14 | 2,97 | 21,0 s (24 %) |
| 005 | **0,39** | **0,52** | 2,03 | 4,53 | 1,56 | 1,39 | 18,0 s (21 %) |
| 006 | 11,09 | 9,05 | 6,78 | 6,12 | 1,98 | 3,56 | 18,8 s (22 %) |

Lecture : le 006 est le film le plus vivant de la série, le 005 a l'ouverture la plus fixe et la médiane la plus basse. Partout, les vingt dernières secondes tombent à un tiers de la moyenne du film.

## 3. Les meilleurs du genre

| Qui | Les 3 premières secondes | Image, rythme | Voix, son | Durée, série, CTA | À prendre | Niveau de preuve |
| --- | --- | --- | --- | --- | --- | --- |
| Zack D. Films (Shorts) | Un personnage déjà dans la situation, une phrase à la 2ᵉ personne, zéro présentation | 3D éclairée, un changement visuel toutes les 1,5–2 s | Sa voix, posée, presque neutre ; un bruitage littéral par geste | 20–45 s ; titre = la prémisse ; aucun CTA ; coupe sèche qui boucle | P1, P5, P9, P11 | Sources secondaires (annonces de studios qui imitent son style) + ma connaissance du compte |
| Animagraffs | Plan d'ensemble de l'objet, puis on le construit pièce par pièce | Maquette neutre, **une couleur vive sur la pièce nommée**, le reste en fantôme | Narration calme, peu de musique | 15–40 min ; un objet = un film | Nous le faisons déjà (plein / rayons X, trois couleurs) | Site officiel + connaissance |
| Jared Owen | L'objet réel, puis sa coque devient transparente | Blender, personnage-échelle, flux codés par couleur | Voix amicale, simple | 8–20 min ; « What's inside… » | Le personnage qui donne l'échelle (fait : 006) | BlenderNation |
| Lesics | Une question de physique | Problème → solution naïve qui échoue → vraie solution | Voix off sobre | 6–12 min | Le battement « ce à quoi tu penses ne suffit pas » (003 câble, 004 disjoncteur, 005 bouton rouge) : à rendre **obligatoire** dans l'acte 1 | Connaissance |
| Branch Education | L'objet entier, promesse d'aller jusqu'au nanomètre | Un seul zoom continu à travers les échelles, chapitres à l'écran | Narration dense | 20–40 min ; des mois par film | Le zoom d'échelle continu avec un indicateur dans le HUD (`×1 → ×400`) pour le micro-ondes ou le masque à oxygène | creatordb + connaissance |
| Kurzgesagt | Une question existentielle, univers visuel immédiatement reconnaissable | Aplats, palette stricte | Narrateur unique, musique composée pour chaque film | ≈ 1 200 h par film ; **sources publiées** | Publier nos sources (une ligne dans le commentaire épinglé : « Sources dans la bio / en réponse ») ; un motif sonore à nous | Vidéo officielle « 1200 hours » (résumé Glasp) |
| Mustard | Une image d'archive ou un plan lent sur une machine extrême | 3D photoréaliste, caméra lente | Musique devant, narration calme | 10–20 min ; titres en paradoxe | Le paradoxe dans la légende et sur la couverture | Connaissance |
| The Engineering Mindset | « Hey guys, Paul here » | Schémas 2D/3D codés par couleur | Voix d'enseignant | Long ; CTA au début | Rien : c'est le cours qu'on ne veut pas être | Connaissance |
| @souslecapot_ | Non vérifiable par le web | Trait blanc, fond bleu nuit (CLAUDE.md) | — | — | À relever dans l'app par Merwan : 5 vidéos, image 1, première phrase, durée, place du CTA, commentaire épinglé | Aucune source |

Repères TikTok 2026 (blogs d'agences, à prendre comme ordres de grandeur) : le temps de visionnage et la complétion pèsent le plus ; les vidéos de plus de 60 s sont favorisées **si** elles tiennent ; la découverte passe de plus en plus par la recherche ; le nombre d'abonnés ne décide pas de la diffusion.

Ce que nous faisons déjà mieux qu'eux :
- **Le temps réel** : un chrono à l'écran qui est celui de la voix. Aucune des références ne tient ça.
- **La boucle écrite** (dernière phrase inachevée) : Zack boucle par la coupe, nous par le texte et par l'image (`film_11.jpg` du 006).
- **Trois couleurs qui veulent dire quelque chose** : le 005 fait comprendre l'arrêt sans un chiffre (le vert descend, l'orange s'éteint, `film_07.jpg`).
- **L'ouverture du 006** : un corps qui tombe dans la première seconde et l'objet promis qui luit au fond. C'est au niveau du meilleur du genre ; c'est l'étalon pour la suite.
- **Les CTA motivés par l'histoire** et la réponse épinglée, sourcée.

## 4. Quinze sujets, classés (007 → 021)

Règles de classement : alternance « wow » / quotidien ; **pas un troisième « ça lâche quand le courant coupe »** après le 004 (aimant et palette) et le 005 (électroaimant) ; chaque dossier apporte une chose que le moteur n'a jamais montrée.

| N° | Sujet | Type | Accroche (angle) | Scène, chrono | Ce que ça fait progresser | Fait central, source, état |
| --- | --- | --- | --- | --- | --- | --- |
| 007 | Siège éjectable | wow | « Ton avion est perdu. Tu tires la poignée. Deux secondes et demie plus tard, tu es sous un parachute. » Paradoxe : il te sauve en t'écrasant, 12 à 14 g | Cockpit, T+0,0 → T+2,5 s | Le feu : fusée, fumée, verrière qui éclate, trajectoire | Séquence ≈ 2,5 s (Mk16), 12–14 g, zéro-zéro, > 7 700 vies (MiGFlug, d'après Martin-Baker). Vérifié en source secondaire ; le « 0,5 s pour quitter l'avion » du teaser reste à sourcer |
| 008 | Groupe de sécurité du chauffe-eau | quotidien | « Sous ton chauffe-eau, ça goutte. Ne répare rien : c'est ce qui l'empêche d'exploser. » | La nuit, heures creuses ; la jauge monte de 3 à 7 bar | L'eau : gouttes, cuve qui se remplit, pression en couleur | Tarage 7 bar (fiches Somatherm, Bricozor) : vérifié. Dilatation ≈ 2 % de 15 à 65 °C, soit ≈ 4 L pour 200 L : à confirmer |
| 009 | Masque à oxygène d'avion | wow, rassurant | « À 11 000 mètres, tu as trente secondes de lucidité. Et le masque qui tombe ne contient pas d'oxygène. » Il le fabrique en brûlant | Rangée de sièges aux rayons X, compte à rebours | Une réaction chimique en petite scène (comme `chain.js`), chaleur | Générateur au chlorate de sodium, 12–22 min, boîtier à 230–260 °C ; conscience utile 15–30 s à 35 000 ft en décompression rapide (MiGFlug, planefyi) : vérifié en secondaire |
| 010 | ABS | quotidien | « Tu écrases le frein. La pédale tremble. C'est ta voiture qui relâche les freins, exprès. » | Route mouillée, obstacle à 30 m | L'écran partagé : deux mondes, la même horloge (roue bloquée / roue qui tourne) | Maintien, relâche, remise en pression plusieurs fois par seconde ; la roue qui tourne garde la direction (edumech) : vérifié. « 15 fois par seconde » : à sourcer chez Bosch |
| 011 | Airbag d'avalanche | wow (à sortir en décembre–février) | « Le sac ne te fait pas flotter. Il te rend plus gros. » | La pente, T+0 → 3 s | Une coulée de milliers de grains (instances) : première simulation | Ségrégation inverse ; mortalité 22,2 % → 11,1 % (Haegeli 2014, via BCA, Utah Avalanche Center) : vérifié. Volume et temps de gonflage : à sourcer |
| 012 | Porte du micro-ondes | quotidien | « Entre ton nez et 800 watts d'ondes : une plaque pleine de trous. » | La cuisine, le plat tourne | Les ondes (shader), zoom continu de 12 cm à 1 mm | 2,45 GHz, onde de 12,2 cm, trous de 1–2 mm ; limite 5 mW/cm² à 5 cm (Straight Dope, Mental Floss, FDA) : vérifié |
| 013 | Déclencheur du parachute de secours | wow | « Tu tombes, inconscient. Une boîte grande comme un paquet de cartes te sauve en coupant une ficelle. » | Chute libre, l'altimètre | Le tissu qui se déploie, le ciel ouvert | Un sectionneur coupe la bouclette du secours ; > 5 400 vies, 181 millions de sauts (cypres.aero) : vérifié. Seuils (≈ 225 m, 35 m/s) : à lire dans le manuel |
| 014 | Veille automatique du train | quotidien | « Ton TGV roule à 300. Le conducteur fait un malaise. Sa pédale le sait. » Paradoxe : la tenir enfoncée déclenche l'alarme | Cabine aux rayons X, 3 km pour s'arrêter | La vitesse : un décor qui défile sur des kilomètres | VACMA : relâcher toutes les ≈ 55 s, sinon alarme puis freinage d'urgence ≈ 2,5 s après (techno-science, franco.wiki, Europe 1) : vérifié |
| 015 | Scie qui s'arrête au contact du doigt | wow | « Une lame à 4 000 tours touche ton doigt. Elle s'arrête avant la peau. » Elle se détruit pour ça | Atelier, T+0 → 5 ms | Une pièce qui se déforme : les dents mordent l'aluminium | Signal électrique sur la lame, frein en aluminium, moins de 5 ms, lame escamotée (sawstop.com) : vérifié. Peu vendue en France |
| 016 | Porte d'avion | rassurant | « Il peut tirer la poignée : il lui faudrait soulever six tonnes. » Aucun verrou ne la tient, c'est l'air | Cabine aux rayons X | La pression rendue visible (densité de particules) | Porte-bouchon ; ≈ 0,5 bar d'écart en croisière, ≈ 6 t sur une porte de 737 (aircrafttechnic) : vérifié en secondaire, à recalculer |
| 017 | Grand huit | wow | « Les freins ne touchent rien et marchent sans courant. » | La dernière ligne droite, 100 → 10 km/h | Un champ magnétique dessiné, caméra embarquée | Aimants permanents et ailette de cuivre, sans alimentation ; ne peuvent pas arrêter tout à fait (Wikipedia, Brake (roller coaster)) : vérifié |
| 018 | Gilet de sauvetage automatique | quotidien (été) | « Tu tombes à l'eau, assommé. Ce qui te sauve : une pastille qui fond. » | Le pont, la mer, T+0 → 3 s | La surface de l'eau, les bulles | Pastille de cellulose qui se délite, ressort, percuteur, cartouche de 33 g de CO₂ ; variante hydrostatique (bateaux.com) : vérifié |
| 019 | Boîte noire | wow | « Elle est orange. 3 400 g, 1 100 °C pendant une heure, 6 000 m de fond. » | Le choc, le feu, l'abysse | Trois milieux dans un même film | 3 400 g, 1 100 °C 60 min, 6 000 m, balise 30 jours, 90 pour les récentes (Le Temps, techno-science) : vérifié |
| 020 | Éolienne dans la tempête | quotidien | « 90 km/h de vent. Elle devrait produire comme jamais. Elle s'arrête. » | La plaine, la rafale | Un écoulement d'air dessiné, la grande échelle | Arrêt vers 25 m/s, pales en drapeau, frein (Futura, Connaissance des énergies) : vérifié |
| 021 | Paratonnerre | quotidien | « Il ne repousse pas la foudre. Il l'attire. » | Le clocher, l'orage | Un éclair qui se ramifie (procédural) | Capte le traceur, descente, prise de terre ; dizaines de milliers d'ampères en ordre de grandeur (Futura, choisir.com) : vérifié, sans chiffre précis |

Conseil d'ordre : 007 siège éjectable (annoncé) → 008 chauffe-eau (en réserve, très français) → 009 masque à oxygène → 010 ABS → 011 airbag d'avalanche calé sur l'hiver. Le masque à oxygène est, à mon avis, le meilleur rapport « tout le monde l'a vu, personne ne sait » de la liste.

## 5. À vérifier, à demander

- Merwan, TikTok Studio : rétention aux instants de P7 pour 002, 003, 004 ; comparer aussi les 3 premières secondes du 003 (accroche criée, 1,9) et du 004 (6,5).
- Merwan, dans l'app, 20 minutes : @souslecapot_ et deux comptes francophones qu'il suit — image 1, première phrase, durée, place du CTA, commentaire épinglé de leurs cinq meilleures vidéos.
- À l'oreille : P11 (voix de la boîte, motif de deux notes).
- Avant chaque script : les faits marqués « à sourcer » ou « à confirmer » du tableau.
- Non fait faute de budget : la planche 005 `film_02` à `film_06` et 006 `film_02` à `film_08` (actes 2 et 3) n'ont pas été relues dans cette passe.

## 6. Sources

Méthodes et plateforme : socialrevver.com/blog/how-to-write-scripts-for-youtube-shorts · freelancer.de/projects/video-production/viral-short-form-content-scriptwriter · glasp.co/youtube/uFk0mgljtns · blendernation.com/2018/11/19/meet-the-artist-jared-owen · animagraffs.com/about · creatordb.app/creatorstats/brancheducation · socialync.io/blog/tiktok-viral-retention-rate-2026 · icuc.social/resources/blog/tiktok-statistics-and-benchmarks-to-track · darkroomagency.com/observatory/how-tiktok-algorithm-works-in-2026 · socialinsider.io/blog/tiktok-engagement-report
Sujets : migflug.com/jetflights/how-ejection-seats-work-martin-baker-sequence-physics · migflug.com/afterburner/?p=23688857 · planefyi.com/de/systems/oxygen-system · backcountryaccess.com/en-fr/blog/p/how-effective-are-avalanche-airbags · utahavalanchecenter.org/node/26291 · bricozor.com/groupe-de-securite · edumech.co.uk/learn/braking/antilock-braking-systems · straightdope.com/21343269/what-keeps-microwave-radiation-from-leaking-out-the-oven-door · mentalfloss.com/science/physics/mesh-grate-microwave-purpose · cypres.aero/blog/saves · skydivemag.com/new?p=30818 · techno-science.net/fr/definitions/pedale-de-l-homme-mort · franco.wiki/fr/Veille_automatique.html · sawstop.com/why-sawstop/the-technology · aircrafttechnic.com/cabin_interior/what-happens-if-you-try-to-open-an-aircraft-door-mid-flight · en.wikipedia.org/wiki/Brake_(roller_coaster) · bateaux.com/article/22692/percuteur-gilet-autogonflant · techno-science.net/glossaire-definition/Boite-noire-aeronautique.html · letemps.ch/societe/boites-noires-avions-gardent-memoire-plus-plus-precise-accidents · futura-sciences.com/planete/questions-reponses/energie-renouvelable-eoliennes-ne-peuvent-exploiter-tous-vents-1098 · connaissancedesenergies.org/questions-et-reponses-energies/pourquoi-les-eoliennes-sont-elles-parfois-arretees-alors-que-le-vent-souffle · futura-sciences.com/maison/definitions/maison-paratonnerre-10813 · choisir.com/energie/articles/129208/comprendre-le-role-et-le-fonctionnement-dun-paratonnerre

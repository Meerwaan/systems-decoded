# 023 · `src/model.js` — la RAT (journal de l'agent)

## Ce qui est décidé (avant d'écrire)

Repère de la racine : la charnière du bras à l'origine, la trappe à fleur du ventre à y = −12, nez vers −x, flanc gauche (caméra) vers +z.

- **Rangé, tout tient dans la soute** : le bras n'est pas tout à fait à plat (9,2° au-dessus de +x : son bout à y = 24), la nacelle verticale, l'hélice à plat juste au-dessus de la trappe, ses pales couchées le long de x. Le bras descend de 100° (`ARM.travel`) : sorti, il pend presque à la verticale (−90,8°), l'hélice face au vent.
- **Les pales se rangent d'elles-mêmes** : sous `arm` 0,25, l'angle rendu glisse vers le demi-tour le plus proche de `turn` (pales le long de la soute). Au-dessus, c'est `turn` tel quel.
- **La trappe** : x de −16 à 210 (226 cm, pas 170 : l'hélice rangée fait 110 cm de pales au bout d'un bras de 150), z ±38, charnière sur le bord +z ; elle s'ouvre en « sortie rapide » (`door` 0,5 = 71°, 1 = 95°) pour que le bras ne la traverse jamais, même à `door` 0,5 / `arm` 0,3.
- **Le vérin à ressort** : du plafond, en arrière (x 112, y 52), au bras (à 62 cm de la charnière). Il passe de 62 cm (rangé, ressort serré) à 154 cm (sorti, spires ouvertes) : le ressort est un hélicoïde dessiné dans le shader, son fil garde son épaisseur quand il s'allonge. (`SPRING.from` de plan.js, devant la charnière, ne faisait presque pas varier la longueur : 121 → 128 cm.)
- **Les lignes, honnêtement** : la pompe a deux raccords (pression, retour) ; deux tuyaux descendent le bras côté caméra jusqu'au barillet de la charnière. Dans le plafond de la soute passent les TROIS circuits côte à côte (z 24, 36, 48 ; le vivant, `HYD.live`, au milieu) : seul celui du milieu sort du barillet. C'est la vérité du rapport (la RAT ne nourrit que le vert) et ça se lit : la lumière monte le bras et n'entre que dans une ligne sur trois.
- `flow` : sur l'établi, la tête va de la pompe (0) à la sortie de soute (1) ; dans l'avion, elle y arrive à `flow` 0,15 (pour que la lumière d'avion.js prenne le relais).

## À changer ailleurs

- `plan.js` (les vraies mesures du modèle, illustratives) : `DOOR = { len: 226, w: 76, y: -12, bay: 72 }` — la trappe va de x −16 à 210 autour de la charnière, la soute (verre) de x −34 à 226, y −12 à 60, z −58 à 44 ; `SPRING = { from: [112, 52, 0], at: 0.41, r: 6 }`.
- `avion.js` : les trois lignes sortent de la soute à x 250 (repère de la RAT), y 38, z −24 / −36 / −48 → dans l'avion **x −600, y −230 (= HYD.y), z 71 / 59 / 47** ; la vivante (HYD.live) est celle du milieu, **z 59**. Elles courent sur le côté −z de la soute (loin de la caméra). La découpe de peau, si elle en dessine une : x −866 … −640, z 57 … 133, y −280.
- `avion.js` : dans l'avion, ma tête de lumière atteint la sortie de soute à `flow` 0,15 ; la sienne peut partir de là.
- Le ventre à z 95 est à y ≈ −265 : la trappe (y −280) est 15 cm sous la peau, plate. Invisible dans le verre ; sinon `BAY.at[1]` = −254 (et décaler la sortie des lignes d'autant).
- `episode.json` → `cover.cam` est celui du modèle (d 120, ty 8 : faux). Proposé, non vérifié avec `npm run cover` : `{ "tx": 15, "ty": 160, "tz": 0, "d": 1550, "az": -44, "el": 16, "shift": -430, "side": 0, "fov": 28, "roll": 0 }` — à d 1400 l'hélice sort par le bas.
- `world.js` → `VIEW` (établi, repère du monde) : `whole { tx 40, ty 150, d 760, az −40, el 8, shift 60 }`, `exploded { tx 15, ty 160, d 1060, az −44, el 12, shift −50 }`, `door { tx 70, ty 205, d 480, az −26, el 8, shift 100 }`, rangée `{ tx 95, ty 235, d 520, az −32, el 24, shift 100 }`, `prop { tx −40, ty 75, d 520, az −66, el 6, shift 130 }`, `pump` (la pression qui monte le bras) `{ tx 20, ty 140, d 640, az −34, el 6, shift 60 }`. `VIEW.bay` tel quel.

## Journal

- Premier jet écrit (soute, trappe, bras, vérin à ressort hélicoïdal, hélice vrillée, pompe, lignes, disque, vent, patch de ventre et poteaux sur l'établi). Première planche bloquée : `avion.js` (autre agent, en cours) a un shader qui ne compile pas (`vec2 half`, mot réservé) — j'attends sa correction.
- Planche 1 (8) : l'hélice et son disque, la pompe, la RAT sous le ventre : bons. Ratés : l'éclaté (minuscule, la soute de verre au centre), la rangée encombrée par les lignes rouges côté caméra, le patch de ventre en dalle claire.
- Lignes passées côté −z ; signal mort baissé (0,11) ; patch supprimé (deux poteaux sous la margelle) ; le vent refait en un seul maillage de rubans croisés animés dans le shader (le Line2 n'était pas en cause : mes essais écrasaient `wind` par une clé JSON en double).
- L'éclaté refait : la soute (verre, margelle, ferrures) s'efface sous `explode` 0 → 0,3 ; la trappe monte à plat, inclinée vers la caméra ; les lignes en rangée devant ; le ressort en arrière ; l'hélice en avant ; la pompe sort de la nacelle. Lisible en un cadre (planche 6).
- Pales redessinées plus droites (avant : des cuillères). 30 images lues.

# Audit image — DOSSIER 005 « Arrêt d'urgence », plan par plan

Matériel regardé : les 11 planches `frames/005/film_NN.jpg` (2 i/s), `hook_01` et `hook_06`, la planche-contact du projet (`renders/005-arret-urgence-planche.jpg`, zones TikTok), et 57 images pleine résolution extraites de `renders/005-arret-urgence.mp4` (dans ce dossier : `f_<secondes>.png`, montages `m_*.png`, recadrages `c_*.png`). Code lu : `episodes/005-arret-urgence/src/main.js`, `reactor.js`, `chain.js`, `pile.js`, `model.js`, `index.html`, et dans le kit `build3d.js`, `stage.js` (caméra), `atmo.js`, `figure.js`, `brand.css`.

Rappel de l'échelle caméra (stage.js:229-245, fov 28) : **3850 / d pixels par centimètre**, la cible tombe à l'écran en y = 960 − shift, `side` négatif pousse l'image à droite. Toutes les poses proposées ci-dessous sont calculées avec ça ; elles se calent ensuite avec `npm run look` (je n'ai rien lancé qui écrive dans le dépôt).

Le 005 n'est pas publié : tout ce qui suit est gratuit (image, habillage, minutage d'image). Aucun correctif ne touche au texte dit.

---

## 0. Verdict en une page

Le film a trois niveaux de qualité très inégaux :

| Niveau | Où | Durée |
| --- | --- | --- |
| **Studio** | l'établi en gros plan (24–31 s, 38,6–42 s), la réaction en chaîne (13–16 s), le cœur vert en gros plan (46–47,4 s) | ≈ 15 s |
| **Correct, joli, mais petit ou immobile** | toutes les vues de la cuve entière (0–7,5 s, 42,3–45,7 s, 47,5–57,5 s), les CTA sur l'établi (66–84 s) | ≈ 42 s |
| **Sous le niveau** | Chicago (57,7–66 s), « Zéro. Le courant tombe » (36,5–38,4 s), le vol dans la forêt de tiges et l'arrivée sur la bobine (21,8–23,5 s), le mur orange de « Des barres savent avaler » (16,3–17 s) | ≈ 14 s |

Trois causes reviennent partout :

1. **Un objet haut et mince dans un cadre vertical.** La cuve entière (1 272 cm × 450 cm) ne peut pas dépasser ≈ 40 % de la largeur. Le film la montre en entier pendant ≈ 25 s, dont **le climax**. À 270 px, le cœur fait 70 px de large.
2. **Des phrases sans démonstration.** « Panne de courant » (0,3 s), « il s'arrête tout seul en deux secondes » (5–7 s), « des barres savent avaler ces neutrons » (16,3–18,3 s), « il serre les cliquets : la barre reste en l'air » (33,5–36 s), « on dépense pour l'empêcher de s'arrêter » (55–57 s) : l'image attend ou montre autre chose.
3. **Des objets pensés pour être vus de loin, filmés de près** (les bobines de la couronne, les tubes) **ou l'inverse** (Chicago : des traits de 1,9 px vus à 7 000 cm).

### Les 3 meilleurs plans — l'étalon

- **27,9 s — « Des cliquets, qui la pincent »** (`f_27.90.png`, main.js:226-236). Trois valeurs de gris, le cliquet-héros presque blanc, les dents signal, trois quarts, l'anneau à bande veille, le geste (s'écarter, pincer) sur les mots. C'est ce niveau qu'il faut partout.
- **15,6 s — « …qui en brisent d'autres »** (`f_15.60.png`, chain.js). 1, 2, 4, 8, 16 : chaque mot a son événement, le décor s'est éteint derrière, le sujet occupe 65 % de la largeur. Un phénomène invisible rendu évident.
- **46,4 s — « Leur poids suffit »** (`f_46.40.png`, main.js:287). Le vert des barres vu à travers le combustible mort, qui a chassé l'orange : la couleur raconte. C'est **ce cadrage-là** que le climax entier mérite (voir constat 1).

---

## 1. Le climax est filmé de loin (42,3 → 45,7 s) — le plus rentable

**Plan** : `cut(toFall, IN_REACTOR, FALL)` — main.js:281-283, `d: 4700 → 4400`.

**Preuve** (`f_44.60.png`, `m_fall1.png`, film_06.jpg vignettes 6 à 11) : la cuve occupe x 335–800 (43 % de la largeur), le combustible 400–680 (26 %). Sous y = 1400, 500 px de noir. Le compteur du HUD donne RÉACTION 98 % à 42,6 s, 71 % à 43,6 s, 25 % à 44,6 s, 1 % à 45,5 s : **toute la bascule orange → vert se joue dans ce plan large**. La caméra ne plonge qu'à `t.pousse − 0.2` (≈ 45,3 s, main.js:287), arrive à 46,8 s, et repart à `t.deux − 0.15` (46,92 s, main.js:290) : le gros plan dure 0,1 s au repos, et il montre les derniers 15 % de la chute sur un cœur déjà à 0 %. C'est un aller-retour, pas un geste.

**Pourquoi c'est grave** : c'est l'image que promet l'accroche (« il s'arrête tout seul, en deux secondes »). À 270 px la bascule tient sur 70 × 95 px.

**Correctif** (main.js:281-290) — de près pendant l'action, large sur le verdict :

```js
// "plus de mille tiges plongent dans le cœur. rien ne les pousse : leur poids suffit."
const FALL = { tx: X, ty: -60, tz: 0, d: 2400, az: -26, el: 14, fov: 28, shift: 150, side: 0 };
cut(toFall, IN_REACTOR, FALL, { heat: 0, glow: 3.2, neutrons: 1, mood: 1, gel: 0.1, feed: 0, others: 1, chain: 0, sealed: 0.8, shell: 1 });
// un seul mouvement : on descend avec le front vert jusqu'à T+2,0
shot(toFall, t.deux - 0.15 - toFall, { ty: -120, d: 2150, az: -12, el: 11 }, "sine.inOut");
// supprimer la ligne 287 (shot(t.pousse - 0.2, 1.5, …)) : plus d'aller-retour
// ligne 290 inchangée : le recul vers la cuve entière tombe sur "Deux secondes" — c'est le verdict
```

À d = 2400 : 1,6 px/cm, combustible 545 px de large (50 %), haut du combustible à y ≈ 720, bas à ≈ 1 290 ; les bouts des barres entrent par le haut à y ≈ 670. À d = 2150 : 610 px (56 %).

Avec ça :
- `follow("chip-count", reactor.A.barsTop, -40, -170)` (main.js:284) → `follow("chip-count", null, 96, 470)`. Aujourd'hui l'étiquette est ancrée sur les barres : elle **glisse vers le bas avec elles** par-dessus la cuve (y 540 → 615 entre 43,6 et 44,6 s). Règle déjà écrite dans CLAUDE.md (étiquette qui suit un point pendant un mouvement → place fixe).
- Ajouter `shell: 1` à l'état de la coupe (voir constat 8 : si on baisse `shell` pendant le vol, rien ne le remonte).
- Sous-titres sur le combustible encore orange en bas de cadre : voir constat 7 (`#cap-shade`).

Effort S (< 1 h avec `look`). Impact 5.

---

## 2. Les dix premières secondes : une image fixe, puis une panne qui ne se voit pas

### 2a. 0 → 4,4 s — rien ne bouge

**Preuve** (`hook_01.jpg` : dix images de 0 à 1,67 s rigoureusement identiques, seul « PANNE DE COURANT » passe au signal ; `f_0.04.png`, `f_2.50.png`). Le seul mouvement est `shot(0, t.promesse - 0.35, { az: 23 }, "sine.inOut")` (main.js:157) : 7° d'azimut en 4,4 s, soit 1,6°/s — invisible. La respiration du combustible fait ± 7 % (reactor.js:199).

La phrase dit « **Panne de courant.** » à 0,28 s ; l'image montre une couronne verte, alimentée, la ligne d'alimentation qui court normalement (reactor.js:333). La panne n'arrive à l'image qu'à 9,24 s. La règle de CLAUDE.md (« la première image montre déjà ce que dit l'accroche ») n'est pas remplie : c'est une belle coupe technique, calme, sans danger, sans « toi », sans échelle — rien ne dit que l'objet fait 13 mètres.

**Correctif** (image seule, la boucle reste intacte puisque l'image 0 ne change pas) :

1. **La panne à 0,3 s.** La couronne s'éteint sur le mot, et reste éteinte pendant toute l'accroche ; le film la rallume quand il plonge dans la cuve pour expliquer (c'est déjà ce que fait la ligne 178 : `st(t.coeur + 1.0, 0.4, { power: 1 })`).
   ```js
   const tPanne0 = T.at("accroche") + 0.05;           // "Panne…"
   st(tPanne0, 0.3, { cut: 1 }, "none");               // l'extinction en vague, voir 2c
   st(tPanne0 + 0.1, 0.25, { power: 0.12 }, "power2.in");
   jolt(tPanne0 + 0.05, 0.25, 0.35);
   // lignes 173-177 : garder l'étiquette "HORS TENSION" sur "la panne" (elle nomme ce qu'on a vu), supprimer le second st(power: 0.12)
   // FIRST garde power: 1, cut: 0 : la dernière image du film reste la première
   ```
   L'accroche devient : image 0 = le réacteur à pleine puissance ; 0,3 s = tout ce qui est vert meurt ; « et c'est toi qui es aux commandes » se dit sur un réacteur dont le cœur brûle encore et dont la sécurité vient de s'éteindre. C'est la menace, montrée.
2. **Un vrai mouvement.** Remplacer la ligne 157 par une avancée lisible : `shot(0, t.promesse - 0.35, { d: 4300, az: 16, ty: 120 }, "power2.out")` (15 % de rapprochement, 14° de rotation : la parallaxe entre bobines, barres et cœur donne du volume dès la première seconde).
3. **L'échelle et « toi »** (option, à essayer avec `look`) : un personnage de verre `makeFigure()` (kit/lib/figure.js, déjà utilisé dans pile.js:109) debout sur une passerelle au trait au niveau de la bride (`y = 470`), à droite de la cuve, sous la ligne d'alimentation : `man.group.position.set(330, 470, 120)`. À d = 5050 il mesure 134 px : on comprend d'un coup la taille de la cuve, et « toi » a un corps. Ne pas le poser au pied de la cuve : il tomberait sous les cartes d'accroche (y > 1186).

### 2b. 4,75 → 7,5 s — le panneau « TOI · AUX COMMANDES »

**Preuve** (`f_6.50.png`, film_01 vignettes 10 à 16) : le panneau `#senses` (index.html:48-53, largeur 396 px) redit mot pour mot la voix (« ne touche à rien », « 2 secondes »). Ses sous-lignes sont en mono 24 px : 6 px sur une vignette de 270, illisibles. Pendant ce temps la cuve glisse à droite (main.js:160) et il ne se passe rien d'autre. CLAUDE.md : « un panneau n'entre que s'il apporte un chiffre que l'image ne peut pas montrer ».

**Correctif** : retirer `#senses` (main.js:162-165, et le `side: -175` de la ligne 160). Garder la seule ligne qui sert plus tard — « BOUTON ROUGE · INUTILE », que paie le CTA like — en étiquette de la zone haute :
```html
<div id="chip-button" class="chip chip--live"><span>Bouton rouge</span><b>Inutile</b></div>
```
`follow("chip-button", null, 96, 470); show("#chip-button", t.seul - 0.1); hide("#chip-button", t.et - 0.15);` (couleur encre, comme `#chip-1942`). Et donner à « il s'arrête tout seul, en deux secondes » son image : le chrono du HUD. `tl.fromTo("#hud-clock", { scale: 1 }, { scale: 1.25, duration: 0.15, yoyo: true, repeat: 1, transformOrigin: "100% 50%" }, T.at("promesse:2"))` et, pendant 0,6 s, afficher « 2,0 s » à la place de « 100 % » (dans `stage.onProject`, main.js:429 : `time > tDeuxMot && time < tDeuxMot + 0.7 ? "2,0 s" : …`). Le spectateur apprend où regarder le compte.

### 2c. 9,24 s — « c'est la panne »

**Preuve** (`hook_06.jpg`, `f_9.50.png`) : 57 petites bobines passent ensemble du vert clair au vert bouteille en 0,25 s (main.js:177). Éteintes, elles sont sombres sur fond sombre ; ce qui se lit le mieux dans le plan, ce sont les tiges gris clair qui les traversent et l'étiquette. La ligne d'alimentation ne « casse » pas, elle pâlit (reactor.js:332).

**Correctif** — que l'extinction soit un événement qui a un sens de lecture, de la ligne d'alimentation vers le fond :

- model.js:31-60 (`coilGlow`) : un attribut par instance `aDelay` (0 → 1) et un uniform `uCut`.
  ```glsl
  attribute float aDelay; varying float vOn;            // vertex
  vOn = 1.0 - smoothstep(aDelay - 0.18, aDelay, uCut);  // uCut 0 → 1.2 : la vague
  // fragment
  vec3 lit = uColor * mix(uOthers, 1.0, vK) * (0.25 + 0.75 * facing * facing);
  vec3 dead = uDead * (0.25 + 1.6 * pow(1.0 - facing, 2.0));   // éteinte : un anneau de verre encre, plus de vert
  gl_FragColor = vec4(mix(dead, lit, vOn), uAlpha);
  ```
  avec `uDead = INK × 0.10`. Un système mort n'est pas veille : aujourd'hui `hue.copy(INK).multiplyScalar(0.12).lerp(VEILLE, S.power)` (reactor.js:329) laisse du vert sombre.
- reactor.js:281-288 : `delay[i] = (180 - c.x) / 360` (la ligne entre par x = +180, reactor.js:294), `coilGeo.setAttribute("aDelay", new THREE.InstancedBufferAttribute(delay, 1))`.
- La ligne d'alimentation (reactor.js:293-299, 332-333) : au moment de la coupure, ses tirets **s'arrêtent** et elle passe au signal : `fx.feed.dashOffset = -Math.min(time, S.feedStop) * 60`, `fx.feed.color.copy(VEILLE).lerp(SIGNAL, S.cut).multiplyScalar(1.6)`.
- main.js : `st(tPanne, 0.35, { cut: 1.2 }, "none")`.

Effort M pour l'ensemble 2a + 2b + 2c. Impact 5 (c'est l'accroche), confiance 3 sur 2a-1 et 2a-3 tant que les images d'essai ne sont pas vues.

---

## 3. « Il serre les cliquets : la barre reste en l'air » — la prise ne se voit pas (31 → 36,4 s)

**Plan** : `HOLD = { tx: 1.5, ty: 34.5, d: 150, az: 0, el: 5, shift: -150 }` — main.js:246-254.

**Preuve** (`f_33.80.png`, `f_35.40.png`, recadrage `c_hold.png`) :
- La dent est à y = 31,58 cm (`PIVOT.y − 7,62`, model.js:140), l'encoche à 31,5 (`NOTCH`), et l'anneau de maintien couvre y = 30 → 33,2 (`RING`, model.js:23, 145). **L'anneau, opaque et sombre, cache exactement l'endroit où la dent est dans l'encoche.** Sur « il serre les cliquets », seule une lueur de la bande (`pulse`, main.js:252) dit qu'il se passe quelque chose. Le geste clé du mécanisme n'est visible qu'ouvert (27,9 s) et au lâcher.
- Les éléments les plus lisibles du plan sont les deux bandes vertes de la bobine et les 16 lignes de champ ; le sujet (les cliquets) est une cage grise de 190 px de haut derrière elles.
- La tige monte derrière la jauge et l'en-tête (son sommet à y ≈ 290 : elle noie « 03 RÉPONSE »).
- « La barre reste en l'air » : le bout libre de la tige est à y ≈ 1 600 à l'écran, le socle à ≈ 1 650 — **dans la zone de la légende TikTok** (> 1 620). La preuve que la tige pend est invisible dans l'app.

**Correctif**

1. *L'anneau devient une pièce à part*, avec ses propres matières (règle CLAUDE.md : « chaque pièce qui peut s'effacer a ses propres matières »). model.js:143-152 :
   ```js
   const ringPart = makePart("ring", { lift: 0 });
   const m2b = metals();
   fx.ring = new THREE.Group();
   fx.ring.add(addMesh(ringPart, collar, m2b.cast, { threshold: 40, edgeOpacity: 0.85 }));
   fx.ring.add(band);                 // la bande veille reste pleine : c'est elle qui dit "anneau"
   ringPart.add(fx.ring);
   const parts = { stand, rod, latches, ring: ringPart, coil };
   ```
   main.js (état `ringA: 1` dans FIRST et dans les coupes vers l'établi) : `setPartOpacity(grip.parts.ring, S.ringA)` à côté de la ligne 403 ; `st(t.tant - 0.3, 0.5, { ringA: 0.18 })` ; `st(t.lacheMot - 0.25, 0.2, { ringA: 1 })` (au lâcher il tombe : il redevient un objet).
2. *Plus près, et les dents allumées sur le mot.* `HOLD = { tx: 1.5, ty: 33, tz: 0, d: 125, az: 3, el: 5, shift: -120, side: 0 }` : 30,8 px/cm, la cage des cliquets passe de 190 à 280 px, les dents à y ≈ 1 123, entre les deux bandes (y ≈ 1 037 et 1 185). Le cliquet à 0° (model.js:125) est de profil depuis az ≈ 0 : c'est le bon côté, on voit la dent entrer dans l'encoche.
3. *« La barre reste en l'air » : on recule pour voir le bout qui pend.* Remplacer la ligne 254 par
   `shot(t.barreMot - 0.3, t.zero - t.barreMot + 0.1, { ty: 24, d: 192, az: -8, el: 6, shift: 10 }, "sine.inOut")` : 20 px/cm, cliquets à y ≈ 730, bout de la tige (y = 12 cm) à ≈ 1 190, dessus du socle à ≈ 1 265 — au-dessus de la ligne de sous-titre (1 321–1 415), hors de la zone TikTok. Le jour sous la tige devient visible.
4. Ce recul prépare le constat 4 : à partir de « Zéro », un seul resserrement continu jusqu'aux cliquets.

Variante pour « la barre reste en l'air » si le recul ne suffit pas : un insert de 1,3 s sur la cuve (pose `BARS`, barres suspendues, couronne allumée), retour à l'établi sur « Zéro ». Deux coupes en acte 2 : à n'essayer que si l'option 3 ne se lit pas.

Effort M. Impact 4.

---

## 4. T+0,0 — « Zéro. Le courant tombe. » : 2,2 s de caméra fixe sur une image boueuse (36,5 → 38,4 s)

**Preuve** (`f_36.70.png`, `f_37.60.png`, film_05 ligne 2, vignettes 2 à 5 : trois vignettes quasi identiques) :
- La caméra finit son mouvement à `t.zero − 0.2` (main.js:254) et ne repart qu'à `t.lache − 0.2` (main.js:273) : **2,16 s sans mouvement**, au moment où le chrono démarre.
- `gPower` tombe à 0 en 0,3 s (main.js:259). La jauge passe de pleine à vide d'un coup : son seuil « ELLE LÂCHE » (18 %, main.js:425) n'est jamais *franchi* sous les yeux. Une jauge qui saute n'apporte rien que l'image ne montre déjà.
- Éteintes, les deux bandes de la bobine restent **vert sombre** (`VEILLE × 0,05`, model.js:240) sur un fond passé au brun (`mood: 1`, `gel: 0.12`) : vert sombre + brun, c'est le kaki que CLAUDE.md interdit. Les lignes de champ meurent en vert foncé pendant 0,9 s.
- Rien ne tombe avant 38,95 s (`lacheMot`).

**Correctif**

1. *Le courant « tombe » pendant qu'on le dit, et franchit le seuil quand l'aimant lâche.* Le film est au ralenti (T+0,0 → T+0,15 s entre `zero` et `barreTombe`) : la décroissance a le droit de durer.
   ```js
   // ligne 259-260
   st(t.zero, t.lacheMot - 0.05 - t.zero, { gPower: 0.12 }, "power1.in"); // 100 % → 12 % : il passe sous 18 % juste avant "lâche"
   st(t.lacheMot - 0.05, 0.25, { gPower: 0 }, "power2.out");
   st(t.zero, t.lacheMot - t.zero, { field: 0 }, "power1.in");             // le champ suit le courant, pas une horloge à part
   ```
   Lignes 263-265 : la couleur de la jauge et le statut « Hors tension — elle lâche » basculent au franchissement (`t.lacheMot − 0.1`), plus à `t.zero`. La jauge raconte enfin « une valeur contre le seul seuil qui compte ».
2. *Un seul resserrement de « Zéro » à « lâche ».* `shot(t.zero + 0.05, t.lache - 0.25 - t.zero, { ty: 31, d: 140, az: -2, el: 5, shift: -60 }, "sine.inOut")` puis la ligne 273 telle quelle (d = 112). Avec le recul du constat 3, la séquence devient : près → recul (« en l'air ») → resserrement continu sur 4 s jusqu'à la dent qui lâche.
3. *Une bobine morte n'est pas verte.* model.js:240 :
   ```js
   hue.copy(INK).multiplyScalar(0.09).lerp(VEILLE, Math.min(1, power * 4));
   fx.power.color.copy(hue).multiplyScalar(1 + (1.7 * power * bands - 1) * Math.min(1, power * 4) + 0); // éteinte : encre 9 %, allumée : comme aujourd'hui
   ```
   (ou plus simplement : `fx.power.color.copy(INK).multiplyScalar(0.09).lerp(tmp.copy(VEILLE).multiplyScalar(0.05 + 1.7 * bands), power)`).
4. `#gauge-th span` (kit/brand.css:248) : 19 px mono, c'est 6,9 pt sur un iPhone — passer à 24 px.

Effort S. Impact 3 à 4 (c'est le début du compte à rebours).

---

## 5. « Des barres savent avaler ces neutrons » n'a pas d'image (16,25 → 20,5 s)

**Preuve** (`f_16.60.png`, `m_act1b.png` image 4, `f_18.30.png`, film_03 ligne 1) :
- 16,25 → 17,0 s : la caméra recule à travers le combustible (`shot(t.barres - 0.2, 1.6, BARS)`, main.js:198). L'image est **un aplat orange uni** pendant ≈ 0,7 s, avec « DES BARRES » puis « SAVENT AVALER » dessus. Les barres ne sont pas à l'écran quand on les nomme.
- **Avaler un neutron ne se voit nulle part dans le film.** C'est pourtant le seul principe physique dont dépend la fin (« la réaction en chaîne est arrêtée »). La scène des noyaux (chain.js) est faite pour ça et le film la quitte juste avant.
- 17,65 → 20,5 s : le plan `BARS` (d = 2500 → 2350, az 22 → 16, el 9) tient 2,9 s presque immobile. « Suspendues juste au-dessus » : avec el = 9°, le bas des barres de devant recouvre le dessus du combustible de derrière — **le jour de 36 cm (`BAR.gap`, reactor.js:28) ne se voit pas**. Les éléments les plus contrastés du plan sont les quatre tubulures de verre (deux anneaux blancs de chaque côté, visibles comme deux « yeux » sur les vignettes de film_03), qui ne sont pas le sujet.

**Correctif**

1. *La démonstration, dans la scène des noyaux* (chain.js + main.js:189-204). La dernière génération ne casse plus toute seule : ses 16 neutrons sont en vol quand deux barres veille descendent dans l'image ; ceux qui les croisent s'y arrêtent, leurs noyaux restent gris.
   ```js
   // chain.js — deux barres : des pavés veille, qui entrent par le haut
   const BARS_X = [-21, 23], BAR_W = 7;
   const rods = BARS_X.map((x) => { const m = new THREE.Mesh(new THREE.BoxGeometry(BAR_W, 170, BAR_W), glow(BRAND.veille, 1.1)); m.position.set(x, 200, 0); group.add(m); return m; });
   // pour chaque arête de la génération 4 : croise-t-elle une barre ? à quelle fraction ?
   edges.forEach((e) => { e.stop = 1; if (e.g === 4) for (const x of BARS_X) { const u = (x - Math.sign(e.b.x - e.a.x) * BAR_W / 2 - e.a.x) / (e.b.x - e.a.x); if (u > 0.05 && u < 1) e.stop = Math.min(e.stop, u); } });
   // update(time, amount, absorb) : absorb 0 → 1, les barres descendent (y 200 → 0) ; rods[i].material.color = VEILLE × amount
   //   dans la boucle des arêtes : const uMax = absorb > 0.6 ? e.stop : 1; u = Math.min(u, uMax);
   //   un noyau dont l'arête est arrêtée (e.stop < 1) ne casse pas : dt = -1 pour lui
   //   à l'instant où u atteint e.stop : un petit éclat veille sur la barre (réutiliser `flashes`, couleur VEILLE, rayon 3)
   ```
   main.js : `schedule([t.brise, t.neutrons + 0.06, t.brisent - 0.16, t.autres, t.avaler + 0.25], 0.5)` (les 16 derniers neutrons volent pendant « des barres savent… » et arrivent sur « avaler ») ; `st(t.barres - 0.1, 0.55, { absorb: 1 }, "power2.out")` ; garder la caméra dans la scène jusqu'à `t.attendent − 0.35` ; sur « Elles attendent » les barres **remontent** (`absorb: 0`) et la caméra les suit vers le haut jusqu'au plan `BARS` : le plan naît du précédent, et le mur orange disparaît.
2. *« Suspendues » se voit* : `BARS = { tx: X, ty: 60, tz: 0, d: 2300, az: 22, el: 3, fov: 28, shift: 150, side: 0 }` et `BAR.gap: 60` (reactor.js:28 — le commentaire assume déjà l'exagération ; à 1,67 px/cm le jour fait 100 px : une bande noire nette entre le rose des bouts de barres et l'orange). Vérifier les deux autres plans qui dépendent de `gap` (image 0 et `FALL`).
3. *Les tubulures s'effacent* : reactor.js:133-140, leur donner leur propre verre `glass(BRAND.ink, { base: 0.004, rim: 0.07, power: 2.6 })` au lieu de `fx.shell` (rim 0,2). Elles restent comme forme, elles ne sont plus ce qu'on regarde.

Effort M (2 à 3 h). Impact 4.

---

## 6. Chicago 1942 : un dessin au trait, minuscule (57,7 → 66 s)

**Preuve** (`f_60.50.png`, `f_63.60.png`, `m_chi1.png`, `m_chi2.png`, recadrage dans `m_crops1.png`) :
- 57,7 → 61,8 s (4,1 s) : plan large à d = 7000 → 6600 (main.js:307-308). La pile est un empilement de boîtes **au trait** (verre `base 0.002, rim 0.045`, pile.js:37 : invisible ; arêtes 1,9 px à 45 %). L'ensemble occupe x 195–910, y 600–1 280 : un quart de la surface du cadre, 500 px de noir dessous. L'homme mesure 100 px (25 px sur la vignette), sa hache 5. C'est exactement le trait blanc sur fond sombre que CLAUDE.md dit ne pas reprendre.
- 62 → 64,2 s : la tige (10 cm de large → 12 px) et la corde (3,2 px) sont deux traits fins dans un grand carré noir ; la pile, floue puis nette, remplit la zone des sous-titres de lignes horizontales (`f_63.60.png` : « À UNE CORDE… » posé sur douze traits).
- 64,7 → 66 s : le meilleur plan du passage, mais **la lame de la hache est un carré** (`BoxGeometry(3.6, 17, 25)`, pile.js:125) : sur `f_63.60.png` et le recadrage, on lit une pancarte ou une tapette. Et la corde traverse l'en-tête jusqu'en haut de l'image.
- La couleur ne raconte rien ici : la barre de secours — **le système**, l'ancêtre des 57 grappes vertes — est encre comme tout le reste.

**Correctif**

1. *La barre est veille.* pile.js:53-61 : `const rodMat = glow(BRAND.veille, 1.25)` pour la tige (30 cm de large au lieu de 10 : `BoxGeometry(22, rodLen, 22)`, elle était « de bois recouvert de cadmium », pas un fil), arêtes veille. On reconnaît d'un coup d'œil la même chose que les barres vertes du plan d'avant.
2. *La pile a un corps et un cœur.* pile.js:37 : `glass(BRAND.ink, { base: 0.012, rim: 0.2, power: 2.4 })` (les valeurs de la cuve, reactor.js:130) ; arêtes `opacity: 0.22` (pile.js:45) ; au cœur de la pile une lueur signal faite au dégradé (le `softGlow` de `003/src/shaft.js` ou le `halo()` de `006/src/hall.js`, rayon ≈ 170 cm, intensité ≤ 1,5), et sous la tige **le puits où elle tomberait** : un canal vertical (deux traits encre + un verre plus clair, de `TOP` à `TOP − 320`). L'image dit alors « ça chauffe là-dedans, et cette barre verte tombe dedans si on coupe la corde ».
3. *La hache est une hache.* pile.js:125 :
   ```js
   const s = new THREE.Shape();
   s.moveTo(0, -5); s.lineTo(8, -6); s.quadraticCurveTo(20, -9, 27, -15);   // la joue du bas
   s.quadraticCurveTo(31, 0, 27, 15);                                        // le tranchant, courbe
   s.quadraticCurveTo(20, 9, 8, 6); s.lineTo(0, 5); s.closePath();
   const blade = new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth: 3.2, bevelEnabled: false }).translate(0, 0, -1.6).rotateY(Math.PI / 2), fx.blade);
   blade.position.set(0, 70, 2);
   ```
4. *Le trajet de caméra suit la corde* (main.js:307-318) — un sujet à chaque instant :
   ```js
   cut(toChicago, IN_CHICAGO, { tx: PX + 200, ty: 520, tz: 0, d: 5200, az: -24, el: 8, shift: 150 }, { mood: 0, gel: 0, hot: 0, axe: 0 });
   shot(toChicago, t.secours - 0.3 - toChicago, { az: -18, d: 5000 }, "sine.inOut");          // "Chicago, 1942." : 1,9 s, pas 4,1
   shot(t.secours - 0.3, 1.7, { tx: PX + 120, ty: 800, tz: 0, d: 2900, az: -12, el: 6, shift: 150 }); // la barre verte au-dessus du puits
   shot(t.corde - 0.3, 1.2, { tx: PX + 480, ty: 900, tz: 0, d: 2300, az: -22, el: 6, shift: 150 });   // la corde : par-dessus les poulies, et elle redescend
   shot(t.homme - 0.35, 1.2, { tx: PX + 545, ty: 640, tz: 0, d: 1150, az: -34, el: 5, shift: 150 });  // l'homme : 590 px de haut au lieu de 450
   ```
   À d = 5200 : 0,74 px/cm, la scène (1 180 cm de large) fait 873 px, 81 % du cadre.
5. La corde au-dessus des poulies n'existe pas : rien ne monte derrière l'en-tête. Dans le plan de l'homme, c'est le brin vertical qui traverse le HUD : `fx.rope` en `vertexColors` avec un dégradé vers le noir au-dessus de `PULLEY − 60`, ou baisser `ty` de 40.

Effort M. Impact 4 (10 % du film, et c'est la récompense de ceux qui sont restés).

---

## 7. Les sous-titres sur le combustible : orange sur orange (11 → 12,5 s, 16,5 → 20,5 s)

**Preuve** :
- `f_11.60.png` : « PRÈS DE **3 000 MW** » — le chiffre de la phrase est en signal, posé sur le bas du combustible signal. L'étiquette `#chip-power` (« DANS LA CUVE ≈ 3 000 MW », signal elle aussi, `.chip--live`, brand.css:257) est posée en plein sur le mur orange.
- `f_18.30.png` : « ELLES ATTENDENT » — le mot en attente (`.cap__w { opacity: 0.34 }`, brand.css:98) devient un rose translucide sur l'orange le plus vif du cadre.

L'ombre portée du texte (brand.css:96) ne suffit pas quand le fond est la zone la plus lumineuse de l'image.

**Correctif** (kit — servira à tous les dossiers) : une ombre sous les sous-titres, sœur de `#hud-shade` et `#title-shade`.
```css
/* kit/brand.css, après .cap__w */
#cap-shade { position: absolute; left: 0; right: 0; top: 1170px; height: 400px; opacity: 0;
  background: radial-gradient(ellipse 62% 50% at 45% 50%, rgba(7, 10, 12, 0.66) 0, rgba(7, 10, 12, 0.4) 55%, rgba(7, 10, 12, 0) 100%); }
```
`<div id="cap-shade"></div>` avant `#callouts` dans le modèle et dans index.html ; dans main.js : `show("#cap-shade", t.coeur - 0.1); hide("#cap-shade", t.atome - 0.4); show("#cap-shade", t.attendent - 0.5); hide("#cap-shade", t.boite + 0.4); show("#cap-shade", toFall); hide("#cap-shade", t.deux + 0.6);`.
Et `#chip-power { color: var(--ink); }` dans index.html:15-24 (signal sur signal : l'étiquette perd son cadre).

Ajouter à `npm run review` / `check` : le contraste des sous-titres se mesure aussi **sur le mot en attente** (opacité 0,34), pas seulement sur le mot dit.

Effort S. Impact 3.

---

## 8. Le vol vers « une seule bobine » et le raccord (21,8 → 23,5 s)

**Preuve** (`m_fly.png`, `f_23.50.png`) :
- 22,3 s : une image entièrement faite de traits verticaux gris — la « dalle grise » des objets identiques. Aucun sujet pendant ≈ 1,2 s.
- 23,0 s : la bobine-héros arrive floue **derrière l'en-tête** (y 380–450).
- 23,5 s, l'image du raccord : la bobine est **un cylindre vert uni**, sans spires, sans flasques, sans bandes ; autour, des cylindres vert bouteille unis ; les tubes sont des barres grises plates (matière additive sans ombrage, reactor.js:246-264) ; derrière, la bride de la cuve vue de près fait une dalle beige. C'est une scène de primitives : ces objets ont été dessinés pour d = 5 000 et on les filme à d = 190.

**Correctif**

1. *Passer de « toutes » à « une » dès le vol.* Les barres n'ont pas d'attribut héros : reactor.js:54-113, ajouter `attribute float aHero; varying float vHero;` et `uniform float uOthers;`, puis `col *= mix(uOthers, 1.0, vHero);` avant le fondu du haut ; reactor.js:231-237 `bundle.setAttribute("aHero", new THREE.InstancedBufferAttribute(mark, 1))` (le même `mark` que les bobines, à déclarer avant) ; `update` : `fx.barMat.uniforms.uOthers.value = 0.22 + 0.78 * S.others`. Main.js:209 : avancer l'extinction — `st(t.boite - 0.2, 1.0, { others: 0.1, heat: 0.15 })`. Pendant tout le vol on suit **une** tige claire parmi des tiges sombres jusqu'à **sa** bobine.
2. *La bobine de la couronne ressemble à celle de l'établi.* model.js:51-56, dans `coilGlow` (varying `vY` = position.y / hauteur, de −0,5 à 0,5) :
   ```glsl
   float t = vY * 15.0;                                   // 15 spires, comme `turns` (model.js:162)
   float ribs = 0.8 + 0.2 * sin(t * 6.2832);
   ribs = mix(ribs, 0.8, clamp(fwidth(t) * 1.6 - 0.2, 0.0, 1.0));  // de loin : leur moyenne, pas de moiré
   float bands = 1.0 - smoothstep(0.012, 0.03, abs(abs(vY) - 0.2)); // les deux bandes : à ±0,2 de la hauteur (COIL.y0 + 3,6 sur 12)
   vec3 c = uColor * mix(uOthers, 1.0, vK) * (0.25 + 0.75 * facing * facing) * (0.5 * ribs + 0.9 * bands);
   ```
   La coque lumineuse portée par la bobine de l'établi à la coupe (`fx.shell`, model.js:189) utilise le même shader : le raccord gagne les mêmes bandes des deux côtés.
3. *Les tubes ont un volume* : reactor.js:251-263, passer normale et vue au fragment et écrire `uColor * (0.3 + 1.4 * pow(1.0 - abs(dot(n, v)), 1.6))`.
4. *La bride s'efface à l'approche* : `st(t.boite + 0.6, 1.2, { shell: 0.3 })` — et **remettre `shell: 1` dans l'état de `cut(toFall, …)`** (main.js:282) et de `cut(toHook, …)` (déjà couvert par `...FIRST`).
5. La pose d'arrivée `ONE` (main.js:207) : `shift: 150` met la bobine à y ≈ 810, mais elle passe derrière le HUD en chemin. Finir le mouvement par en dessous : `el: 4` pendant le vol, `el: 10` à l'arrivée (deux `shot`), ou `shift: 60` jusqu'à 0,4 s de la coupe.

Effort M. Impact 3.

---

## 9. La chute (51,4 → 57,5 s) : cinq secondes et demie sur une petite cuve immobile

**Preuve** (`m_chute.png`, `f_52.60.png` → `f_56.90.png`, recadrage `c_chute_crown.png`) : pose `ASIDE` (d = 5400, `side: -165`, main.js:294-299). La cuve occupe x 540–907, y 475–1 425 ; la moitié gauche du cadre est noire sous le titre ; rien ne bouge sauf « DU COURANT » barré puis « RIEN ». « DU COURANT » déborde sur la couronne éteinte, qui se lit comme une touffe sombre et sale au-dessus de la cuve (bobines à `INK × 0,05`, tiges qui se fondent). La seconde moitié de la phrase — « on dépense… pour l'empêcher de s'arrêter » — n'a aucune image : c'est pourtant l'idée retournée, celle qu'on veut que les gens répètent.

**Correctif**

1. *Plus grand, sans la touffe.* `ASIDE = { tx: X, ty: -40, tz: 0, d: 3900, az: 16, el: 20, fov: 28, shift: 60, side: -200 }` : 0,99 px/cm, la cuve fait 1 255 px de haut (+32 %), la couronne sort par le haut sous la barre de recherche (y ≈ 196), le cœur vert tient y ≈ 860–1 220, x ≈ 572–908. Porter le titre par `#title-shade` (kit, depuis le 006) puisqu'il recouvre alors le haut de la cuve.
2. *Les bobines mortes sont des anneaux de verre*, pas des taches : c'est le `uDead` du constat 2c.
3. *« On dépense… pour l'empêcher »* (option, confiance 3) : sur `t.depense2`, la caméra remonte à la couronne (pose `CROWN`, main.js:167), la ligne d'alimentation se remet à courir et les bobines se rallument une à une (`cut: 1.2 → 0`, `power: 1`) pendant que le titre change : kicker « POUR L'EMPÊCHER, IL FAUT », mot « DU COURANT » en veille. L'image montre où part l'électricité. Puis Chicago. À valider avec Merwan sur une image d'essai : il ne faut pas qu'on lise « le réacteur redémarre » (garder RÉACTION 0 % au HUD, les barres en bas).

Effort S pour 1 et 2, M avec 3. Impact 3.

---

## 10. Les trois CTA : 18 secondes sur le même petit objet (66 → 84 s)

**Preuve** (`m_chi2.png` images 3-4, `m_cta.png`, film_09 à film_11) : de 66 à 84,1 s — 21 % du film — l'image est l'électroaimant sur l'établi, à d = 300–440 (25 à 30 % de la largeur), qui ne fait rien. Chaque CTA a bien son panneau, mais :

- **Commentaire** (69 → 73,7 s) : « une fois arrêté, il chauffe encore combien de temps ? » se dit devant une bobine. La question porte sur **le cœur**. L'image qui la pose, c'est le cœur arrêté — barres vertes en place — où une braise signal continue de respirer.
- **Abonnement** (74,7 → 80 s) : `#next` (index.html:103-108) apparaît à `t.abo + 0.3` mais sa barre caviardée n'arrive qu'à `t.mur − 0.6` et son fait à `t.jamais − 0.4` (main.js:340-342) : de 75,0 à ≈ 76,8 s c'est **un cadre vide de 400 px de haut** (film_10, vignettes 7 à 9). Puis la barre `#next-redact` est un rectangle encre plein de 520 × 78 (brand.css:214) : sur une vignette on lit une image qui n'a pas chargé, pas un titre caviardé. Et « 0 fois que tu as osé t'en servir » est en mono 26 px.

**Correctif**

1. *Le CTA commentaire se joue sur la cuve.* reactor.js:169-204 : un uniform `uDecay` dans le combustible —
   `float decay = uDecay * (0.5 + 0.5 * sin(uTime * 1.1 + vP.x * 0.015)) * profile;  float k = (0.07 + 0.55 * decay + uGain * 1.5 * uReaction * lit * profile * breath) * facing;`
   main.js : `cut(t.comment - 0.12, IN_REACTOR, { tx: X, ty: -150, tz: 0, d: 2300, az: 14, el: 12, shift: -40 }, { decay: 0, sealed: 1, glow: 3.2, neutrons: 0, mood: 0, gel: 0, feed: 0, others: 1, chain: 0, shell: 1 })`, `st(t.combien - 0.6, 1.2, { decay: 1 })`, lent `shot` d'approche, puis `cut(t.abo - 0.12, BENCH, …)`. Le cœur tient y ≈ 754–1 354 sous le champ de réponse. La braise orange qui revient sous le vert, c'est la question, en image. (`storyOf` garde `reaction = 0` après `t.deux` : rien d'autre ne se rallume.)
2. *`#next` n'est jamais vide.* Faire entrer la barre avec le panneau (`t.abo + 0.45`), et la remplacer par un titre à moitié lisible : `<div id="next-title">DÉ<span id="next-redact"></span></div>` avec `#next-redact { width: 430px; background: repeating-linear-gradient(90deg, var(--ink) 0 34px, transparent 34px 40px); }` — des pavés, on lit « mot caviardé ». `#next-fact span` : 26 → 34 px.
3. *Méthode pour 007+* : le CTA abonnement montre **une image** du dossier suivant (1,5 s, silhouette aux rayons X dans le panneau), pas seulement un cadre. La couverture du dossier suivant existe souvent déjà (`renders/006-…-couverture.png`) : floutée, assombrie, sous le caviardage.

Effort M. Impact 3. (Le texte dit ne change pas.)

---

## 11. Petits défauts qui font « presque » (à corriger en passant)

| Instant | Défaut | Fichier:ligne | Correctif |
| --- | --- | --- | --- |
| 11 → 12,5 s (`f_11.60.png`) | Le combustible de près est un **rideau orange mat** : 157 boîtes lisses, aucune matière ; les « neutrons » dérivent en diagonale comme de la neige | reactor.js:189-204, 214 | Dessiner les crayons dans le shader comme pour les barres (`fwidth`, reactor.js:88-96 : 17 crayons par face), et faire monter les étincelles droit vers le haut, en traînées : `drift: [0, 46, 0]`, `fx.neutrons.update(time, px, 1 / 24)` — l'eau traverse le cœur de bas en haut, ça dit « l'énergie s'en va » |
| 24 → 31 s (`m_bench1.png`, `m_bench2.png`) | Une tache d'ombre détachée à droite du socle (l'ombre de la bobine, jetée loin par la lumière clé rasante) : à 270 px, une salissure dans le halo vert | main.js:377-381 (`FOCUS[0]`), stage.js:219 | Remonter la clé pour l'établi (ombre sous l'objet) ou `castShadow = false` sur la bobine levée pendant `explode > 0` |
| 27,5 → 29 s | Le dessous de la bobine soulevée fait des ellipses fantômes en haut du cadre, derrière l'en-tête | main.js:226 | `setPartOpacity(grip.parts.coil, 0)` de `t.cliquets − 0.2` à `t.autour − 0.2` (elle est hors sujet), ou `lift: 34` |
| 38,6 → 42 s | Au lâcher, les arêtes de la bobine de verre restent en ellipses roses autour des cliquets | main.js:249 (`coilA: 0.1`) | `coilA: 0.04` à partir de `t.lache − 0.2` |
| 42 → 57 s | L'étiquette « EN CHUTE **1 368 TIGES** » alors que l'image montre 57 grappes et qu'on a lu « 57 GRAPPES » à 19 s | index.html:73 | `<span>57 grappes × 24</span><b>1 368 tiges</b>` : le chiffre se comprend |
| 64 s (`f_64.30.png`) | Le brin horizontal de la corde, flou, traverse l'en-tête pendant le mouvement | main.js:312 | réglé par le trajet du constat 6 |
| partout | Libellés d'étiquette en mono 23–26 px, seuil de jauge 19 px | brand.css:125, 248, 257 | plancher à 26 px pour tout ce qui doit se lire |

---

## 12. Règles à ajouter pour le 007 et les suivants (méthode)

1. **Le climax se filme de près.** La vue d'ensemble d'un objet haut et mince sert deux fois : la première image et le verdict. Jamais pendant l'action.
2. **Part du sujet.** Sur chaque vignette de `review`, le sujet de la phrase occupe au moins 45 % de la largeur ou 35 % de la hauteur utile (440–1 160). Mesurable : `review` peut dessiner la boîte englobante des pixels au-dessus d'un seuil de luminance et afficher le pourcentage sous la vignette.
3. **Un verbe, une image.** Dans `episode.json`, chaque verbe d'action du script (« avaler », « serrer », « rester en l'air », « dépenser ») a un repère dans `cues` et un événement à l'image. Un verbe sans repère = une phrase sans démonstration : `npm run script` peut les lister.
4. **Pas plus de 1,5 s de caméra immobile** en acte 3 (`qa` connaît déjà les mouvements : signaler les plages sans mouvement).
5. **Une pièce éteinte est encre, jamais veille sombre.** Le vert veut dire « le système vit ».
6. **Un objet qu'on approche à moins de dix fois sa taille a une matière** (spires, arêtes, ombrage) ; sinon on ne s'approche pas.
7. **Le mot en attente compte dans le contraste** des sous-titres ; `#cap-shade` dès que le fond est la zone la plus claire du cadre.
8. **La preuve d'une phrase ne tombe jamais sous y = 1 600** (légende TikTok) ni derrière le sous-titre.

---

## Ce qu'il ne faut pas casser

- La couleur qui raconte : le vert des barres qui descend à travers le combustible et éteint l'orange (`sealed` / `ghost`, reactor.js:97-99, 318-319), lié au compteur RÉACTION % du HUD par `storyOf` (main.js:134-148).
- La scène des noyaux (chain.js) : gris sur rouge sombre, décor éteint derrière, un événement par mot.
- L'établi en gros plan : trois valeurs de gris, pièce-héros claire, dents signal, bande veille, gestes sur les mots (main.js:226-236).
- Le principe du raccord cuve → établi sur la même lumière, à la même place (main.js:207-215) — on en améliore la matière, pas l'idée.
- Le premier acte en un seul mouvement, les coupes gardées pour l'acte 3.
- Les zones TikTok : rien de lisible n'y tombe aujourd'hui, les étiquettes de la zone haute sont à place fixe.

## Ordre de travail conseillé (≈ une journée)

1. Constat 1 (S) → `look` sur 42,5 / 43,5 / 44,5 / 45,5 / 46,5.
2. Constat 4 (S) + constat 7 (S) + tableau 11.
3. Constat 3 (M) → `look` sur 33,5 / 35,5 / 36,5 / 38.
4. Constat 2 (M) → montrer à Merwan deux images d'essai de l'accroche (panne à 0,3 s, avec et sans personnage) avant de monter.
5. Constat 5 (M), constat 6 (M), constat 8 (M).
6. Constats 9 et 10 (M), option 9-3 seulement après accord.
7. `review` complet → `check` → `render --draft` → `qa --file` (les nouveaux mouvements : vérifier « images parasites » sur 0,3 s, 16–18 s, 42–47 s).

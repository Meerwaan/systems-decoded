# Audit « moteur3d » — Système Décodé (005 et 006)

Périmètre : `kit/lib/stage.js`, `build3d.js`, `atmo.js`, `figure.js`, et les modèles des dossiers 005 et 006 (`episodes/00X/src/*.js`).
Lecture seule : aucun fichier du dépôt modifié, aucun rendu lancé. **Toutes les esquisses de code ci-dessous sont non testées** : elles se valident au `look`, puis `render --draft` + `qa --file`. Les API citées (GTAOPass, `toCreasedNormals`, `RoundedBoxGeometry`) ont été vérifiées dans `node_modules/three` (0.181.2).

## 0. Ce qui a été regardé

- Les 22 planches denses (`frames/005/film_01…11.jpg`, `frames/006/film_01…11.jpg`).
- 30 images pleine résolution extraites des MP4, dans ce dossier : `e5_<t>.png` (1.0, 12.5, 15.0, 19.0, 22.5, 24.6, 27.5, 29.0, 33.0, 40.5, 46.0, 60.0, 63.5) et `e6_<t>.png` (0.4, 2.0, 7.5, 9.0, 12.3, 16.0, 19.5, 25.6, 27.0, 28.6, 30.2, 34.0, 37.6, 44.3, 50.0, 57.0, 63.0).
- Des agrandissements (`z_*.png`) et les deux couvertures PNG (sorties du moteur, sans H.264), pour séparer ce qui vient du rendu de ce qui vient de l'encodage.

### Valeurs mesurées (moyenne RVB sur une zone, 0–255)

| Mesure | Image | Valeur | Ce que ça dit |
| --- | --- | --- | --- |
| Fond vu **à travers** le tube de verre du 005 | `e5_29.0.png` (330,1100) | 57 57 50 | le « verre » ajoute +50 de gris sur tout ce qu'il couvre |
| Fond **hors** tube, même hauteur | `e5_29.0.png` (120,1100) | 6 10 7 | |
| Torse de verre, 006 | `e6_37.6.png` (600,1300) | 100 83 75 | +80 par rapport au fond (20 16 14) : un corps laiteux, pas du verre |
| Tête du témoin, côté lumière / côté ombre | `e6_19.5.png` | 149 134 115 / 5 5 17 | rapport 30:1, l'ombre est un trou noir-bleu |
| Couvercle du défibrillateur, dessus / flanc | `e6_34.0.png` | 13 33 31 / 1 8 13 | le sujet vit dans les 5 % les plus sombres de l'échelle |
| Sol (halo vert) autour | `e6_34.0.png` (200,1400) | 17 57 39 | le sol est plus clair que le sujet : silhouette lisible, forme illisible |
| Cœur « éteint », centre / bord | `e6_50.0.png` | 220 191 175 / 200 175 161 | 10 % d'écart sur toute la surface : aucun modelé |
| Face claire d'un cliquet | `e5_27.5.png` (395,560) | 219 218 199 | un aplat crème, sans dégradé : une carte en papier |
| Cœur du réacteur, centre / bord | `e5_12.5.png` | 182 54 5 / 180 55 10 | aucun gradient de chaleur à l'image « 3 000 MW » |

## 1. Verdict : ce qui trahit le temps réel, par ordre de visibilité

Comparé à un rendu de studio (Animagraffs, Jared Owen, Blender Eevee/Cycles stylisé), le moteur a déjà ce que la plupart des comptes n'ont pas : un vrai flou de mouvement par accumulation, un anticrénelage propre des traits, un étalonnage, zéro image parasite. Ce qui sépare encore « très bon WebGL » de « studio » tient en huit points, tous vus sur les images :

1. **Le verre est du lait.** Le shader `glass()` additionne un voile constant et un fresnel large, recto et verso ; les capsules des personnages s'additionnent entre elles. Résultat : des corps en « sac de saucisses » où l'on compte les bouts ronds de chaque membre (`e6_37.6.png`, `e6_0.4.png`, `e6_19.5.png`), et un tube qui voile la pièce-héros du 005 (`e5_29.0.png`).
2. **Rien ne touche rien.** Pas d'occlusion ambiante, pas d'ombre de contact : la batterie et le condensateur flottent sur le socle (`e6_28.6.png`), les crans de la tige sont des rondelles empilées (`e5_29.0.png`).
3. **Les sujets sombres n'ont pas de forme interne.** Albedo ≈ 2 %, studio noir : seuls le trait d'arête et un filet spéculaire sur le chanfrein dessinent l'objet. Le dessus du couvercle est un aplat (`z_cover6_lid_gamma.png` : même remonté en gamma, pas un dégradé).
4. **Les faces claires sont des aplats** (lumière directionnelle = éclairement uniforme sur un plan) et **les ombres propres sont bouchées** (tête : 5 5 17).
5. **Les ombres portées sont au rasoir** (≈ 1 mm de pénombre pour un objet de 60 cm : `z_e5_24_shadow.png`) et **les ombres orphelines** des têtes et des mains, seules pièces pleines des personnages, font trois trous noirs au sol dès la première image du 006 (`z_e6_0_fig.png`).
6. **Ce qui brille n'éclaire rien** : les bandes vertes de la bobine ne teintent pas ses flasques (`e5_24.6.png`), le voyant ne touche pas le couvercle.
7. **Le flou de mouvement se voit en peigne** sur les mouvements rapides : 16 copies nettes des traits d'arête (`z_e5_27_pawl.png` à 27,5 s, `e5_22.5.png`).
8. **Deux héros sans matière** : le cœur du 006 (shader non éclairé, pâte à modeler à damier : `e6_16.0.png`, `e6_12.3.png`, `e6_50.0.png`) et le cœur du réacteur du 005 (aplat orange : `e5_12.5.png`).

S'y ajoutent trois détails : des poussières rouges qui se lisent comme des pixels morts (`z_e5_29_specks.png`, couverture 006), des blocs H.264 dans les verts sombres (`z_e6_34_lid_gamma.png` contre `z_cover6_lid_gamma.png`), et deux décors entièrement au trait (hall du 006, Chicago du 005 : `e5_63.5.png`) — précisément « le dessin au trait qu'on ne fait pas ».

## 2. Revue point par point

| Sujet | État actuel | Verdict | Piste retenue |
| --- | --- | --- | --- |
| Occlusion ambiante | aucune | manque n° 2 | GTAO **une fois par image**, après l'accumulation (§ A5) |
| Ombres de contact | ombre portée seule ; rien sous les personnages de verre | manque | pastille d'ombre douce sous chaque personnage (§ A2) ; l'AO fait le reste sur l'établi |
| Profondeur de champ | aucune | manque mineur | par l'obturateur, gratuit, CoC ≤ 6 px (§ A10) |
| Qualité des ombres | `PCFSoftShadowMap`, 4096², `stage.js:183,200` : nettes | à corriger | key « en surface » par l'obturateur, gratuit (§ A2) |
| Carte d'environnement | 4 rectangles unis dans le noir, `stage.js:32-48`, intensité 0,55 | à refaire | boîtes en dégradé, cyclo gris, sol de la couleur du halo (§ A4) |
| Tone mapping | `NeutralToneMapping`, `stage.js:181` | **bon choix, ne pas toucher** | ACES/AgX feraient virer `#FF5B2E` au jaune/rose et désatureraient `#5CFFB0` : les trois couleurs « qui ont un sens » ne survivraient pas |
| Chanfreins | `roundedBox` sur le 006 (bien) ; tige, bague, flasques, composants du 005/006 à angles vifs ; `flatShading` sur la tige (`005/model.js:104`) | à généraliser | `chamfer()` + `toCreasedNormals` (§ A8) |
| Lumière de contour | `lights.rim` directionnelle, direction fixe dans le monde (`stage.js:208`), 1,1 à 2,0 | elle existe mais n'accroche que les chanfreins vernis (filet du couvercle, `e6_34.0.png`) | pas de nouveau réglage : ce sont les chanfreins vernis qu'il faut généraliser (§ A8) |
| Verre | additif, `base` constant, fresnel large, double face (`build3d.js:62-85`) | manque n° 1 | coque unique + chant net + reflet (§ A1). **Pas** de `transmission` physique : un rendu de plus par échantillon (×16) et des tris impossibles avec les additifs |
| Sol et reflets | sol mat + grille + halo additif ; aucun reflet | correct sur l'établi | le halo doit se refléter dans l'objet (§ A4). Pas de SSR ni de `Reflector` (×2 les rendus du décor) ; pour le hall, un reflet étiré peint sous la boîte verte suffit (§ 5) |
| Brouillard, volumes | `FogExp2` ; poussières `signal` à 0,1 | les poussières desservent | poussières `ink`, plus rares, ou rien (§ A9) |
| Grain | tramage statique ±1,5/255 (`stage.js:164-166`) | suffisant | **pas de grain animé** : TikTok le transforme en blocs dans les sombres |
| Aberration chromatique | aucune | très bien | ne pas en mettre : elle baverait sur les traits et les étiquettes |
| Netteté | filtre boîte 1 px (jitter) | légèrement doux | accentuation bornée, 0,15 (§ A9) |
| Anticrénelage des lignes | 16 positions de Halton + traits ≥ 1,8 px | **propre** (grille de `e6_34.0.png`) | rien |
| Bloom | `UnrealBloomPass` 0,6 / 0,7 / seuil 1,0 (`stage.js:272`) | juste, un peu serré | queue un peu plus large, optionnel (§ A9) |
| Flou de mouvement | 16 instants réguliers | en peigne au-delà de ≈ 60 px/image | échantillons adaptatifs 16 → 48 (§ A7) |

## 3. Les améliorations, de la plus rentable à la moins rentable

Coûts de rendu donnés par rapport à aujourd'hui (16 rendus de scène + 16 cartes d'ombre 4096² par image). À mesurer sur un brouillon.

---

### A1 — Le verre : une coque, un chant, un reflet (kit, puis 005 et 006)

**Preuve.** `e6_37.6.png` (37,6 s, « Tu colles les électrodes ») : torse +80/255, on compte six disques de bouts de capsules, le cœur est derrière quatre voiles. `z_e6_0_fig.png` (première image du film) : genoux, hanches, épaules en anneaux superposés. `e5_29.0.png` : +50/255 dans tout le tube, sur la tige que le plan est censé montrer.

**Cause.** `build3d.js:62-85` : `AdditiveBlending`, `DoubleSide`, `uBase` constant (0,02 linéaire ×2 faces ≈ 20 % de gris à l'écran sur fond noir), `uPower` 2,3–2,6 (un fresnel qui remplit tout le volume au lieu de dessiner un bord). `figure.js:25` : `base 0.014, rim 0.34, power 2.3`. Chaque membre est une capsule à part : toutes leurs faces, avant et arrière, s'additionnent.

**Correctif.**

```js
// kit/lib/build3d.js — options nouvelles, valeurs par défaut = l'ancien rendu (les films publiés ne bougent pas)
const KEY = new THREE.Vector3(-30, 52, 38).normalize(); // la même que KEY_DIR de stage.js
export function glass(color = BRAND.ink, { base = 0.006, rim = 0.2, power = 3.2, edge = 0, spec = 0, shell = false } = {}) {
  return new THREE.ShaderMaterial({
    transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
    side: shell ? THREE.FrontSide : THREE.DoubleSide,
    uniforms: { /* …les mêmes… */ uEdge: { value: edge }, uSpec: { value: spec }, uKey: { value: KEY } },
    vertexShader: /* inchangé */,
    fragmentShader: /* glsl */ `
      uniform vec3 uColor, uKey; uniform float uBase, uRim, uPower, uEdge, uSpec, uAmount; varying vec3 vN; varying vec3 vV;
      void main() {
        vec3 n = normalize(vN); vec3 v = normalize(vV);
        float g = clamp(1.0 - abs(dot(n, v)), 0.0, 1.0);
        float body = pow(g, uPower);
        float lip = smoothstep(0.72, 0.96, g);                       // le chant du verre : un trait net sur la silhouette
        vec3 l = normalize((viewMatrix * vec4(uKey, 0.0)).xyz);
        float glint = pow(clamp(dot(n, normalize(l + v)), 0.0, 1.0), 120.0); // la boîte à lumière, en reflet
        gl_FragColor = vec4(uColor * (uBase + uRim * body + uEdge * lip + uSpec * glint) * uAmount, 1.0);
      }`,
  });
}

// Une pré-passe de profondeur : écrit la profondeur, pas la couleur. « transparent » pour être triée après les pleins.
const HOLD = new THREE.MeshBasicMaterial({ colorWrite: false, transparent: true });
/** Fait de plusieurs maillages de verre UNE coque : seule la surface la plus proche de l'œil s'allume. */
export function asShell(meshes, order = 20) {
  for (const mesh of meshes) {
    const hold = new THREE.Mesh(mesh.geometry, HOLD);
    hold.renderOrder = order - 1;   // toutes les pré-passes avant tous les verres
    mesh.add(hold);
    mesh.userData.hold = hold;
    mesh.renderOrder = order;       // après les traits (2, 3), le trajet du choc (7), les halos (0)
  }
}
```

- `figure.js:25` → `glass(BRAND.ink, { base: 0.004 * glassK, rim: 0.45 * glassK, power: 3.6, edge: 0.5 * glassK, spec: glassK > 0.5 ? 0.9 : 0, shell: true })`, puis `asShell([trunk, …membres, pieds])` à la fin de `makeFigure`. Pas de reflet (`spec 0`) sur les figurants lointains : un spéculaire sous le pixel scintille.
- `hall.js:491-499` (`ghost`) : quand la tête et les mains passent en verre, `mesh.userData.hold.visible = ghost` (leur pré-passe ne doit exister que lorsqu'elles sont en verre).
- `005/model.js:90` (tube) → `{ base: 0, rim: 0.25, power: 4.5, edge: 0.6, spec: 1.2, shell: true }` + `asShell([tube])` : la tige n'est plus voilée, le tube se lit par son chant et un reflet filé.
- `005/reactor.js:130` (cuve) → `{ base: 0.002, rim: 0.22, power: 3.4, edge: 0.35, shell: true }`.
- La porte de l'armoire (`hall.js:171`, un plan) reste en `shell: false`.

**Ce que ça change.** Un personnage devient une silhouette de verre continue, bordée d'un trait clair, avec un reflet le long des membres ; là où un bras passe devant un torse, on voit le bras **devant** (occlusion), plus une soupe. Le cœur et les électrodes ne sont plus derrière un voile.

**Faisabilité.** Tout ce qui est transparent avec `renderOrder < 19` est dessiné avant les pré-passes : rien ne disparaît derrière un personnage. Le cœur (opaque) est dessiné dans la passe des pleins, avant. **Risque scintillement :** nul (shader statique) ; surveiller le reflet sur les petits personnages. **Coût :** un tracé sans couleur par maillage de verre, < 2 %. **Effort : M.**

---

### A2 — Des ombres douces gratuites, et plus d'ombres orphelines (kit)

**Preuve.** `z_e5_24_shadow.png` (24,6 s) : bord d'ombre net au pixel, rayures de la bobine dans l'ombre. `e6_28.6.png` : ombres dures du condensateur. `z_e6_0_fig.png` et `z_e6_19_shadows.png` : la tête et les mains (seules pièces pleines) projettent trois ovales noirs sans corps — dont un au milieu de la cuisse de la victime, vu à travers elle.

**Correctif 1 — la key devient une boîte à lumière.** L'obturateur rend déjà 16 fois la scène **et** sa carte d'ombre. Déplacer la key d'un échantillon à l'autre sur un disque = une lumière de surface : pénombre physique, nette au contact, douce au loin. Coût : zéro.

```js
// kit/lib/stage.js — à côté de KEY_DIR (l. 18)
const KEY_U = new THREE.Vector3().crossVectors(KEY_DIR, new THREE.Vector3(0, 1, 0)).normalize();
const KEY_V = new THREE.Vector3().crossVectors(KEY_U, KEY_DIR).normalize();
const vogel = (n) => Array.from({ length: n }, (_, i) => { const r = Math.sqrt((i + 0.5) / n), a = i * 2.399963; return [r * Math.cos(a), r * Math.sin(a)]; });
// createStage(canvas, { …, keySize = 0 })  ← 0 = l'ancienne ombre ; 005 et 006 passent 2.5 (demi-angle, degrés)
const disc = vogel(samples);
function spreadKey(k) {
  if (!keySize) return;
  const reach = focus.scale * 8, R = reach * Math.tan(keySize * DEG);
  const [u, v] = disc[(k * 7) % samples];            // 7 est premier avec 16, 32, 48 : l'ordre du temps et celui du disque sont décorrélés
  lights.key.position.set(
    focus.x + KEY_DIR.x * reach + (KEY_U.x * u + KEY_V.x * v) * R,
    focus.y + KEY_DIR.y * reach + (KEY_U.y * u + KEY_V.y * v) * R,
    focus.z + KEY_DIR.z * reach + (KEY_U.z * u + KEY_V.z * v) * R);
}
// dans advance(k), l. 264, juste après aimLights() : spreadKey(k);
```

Le même motif à chaque image : aucune variation d'une image à l'autre. À 2,5°, la pénombre d'une pièce à 30 cm du sol fait ≈ 3 cm ; les 16 copies donnent des marches de 4 % de l'ombre, invisibles sur un sol sombre. **À vérifier sur un récepteur clair** (ombre de la bague sur la tige) : si des marches se voient, descendre à 1,8° ou monter les échantillons (A7). Une fois les ombres douces, `mapSize` peut descendre à 2048 (`stage.js:200`) : la passe d'ombre coûte quatre fois moins, 16 fois par image.

**Correctif 2 — les personnages de verre.** Soit tout le corps porte une ombre, soit rien. Le plus sûr (sans bruit) : rien ne projette, et une pastille d'ombre douce pose le corps au sol.

```js
// kit/lib/figure.js — fin de makeFigure : head.castShadow = false (l. 38) ; hand.castShadow = false (l. 102)
const shadow = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.ShaderMaterial({
  transparent: true, depthWrite: false, uniforms: { uA: { value: 0.5 } },
  vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `uniform float uA; varying vec2 vUv; void main(){ float d = length(vUv - 0.5) * 2.0; gl_FragColor = vec4(0.0, 0.0, 0.0, uA * pow(max(0.0, 1.0 - d), 1.6)); }`,
}));
shadow.rotation.x = -Math.PI / 2; shadow.renderOrder = 1;   // au-dessus du halo, comme le « catcher »
// rendu : { …, shadow } — c'est le décor qui la pose et la dimensionne
```

Dans `hall.js` : debout, `shadow.scale.set(46, 34, 1)` sous les pieds ; couché (`collapse` → 1), `scale.set(200, 64, 1)` sous le dos, interpolé sur `S.collapse` ; à genoux, `scale.set(70, 60, 1)`. Et `hall.js:496` : supprimer `mesh.castShadow = !ghost`.

**Effort : S. Risque scintillement : faible. Coût : 0 (voire un gain avec 2048²).**

---

### A3 — Le cœur du 006 : une matière (006)

**Preuve.** `e6_16.0.png` (16 s), `e6_12.3.png` (T+0:15) : une masse gris mat à taches orange disposées **en damier** ; aucun reflet, aucun creux entre oreillettes et ventricules. `e6_50.0.png` (« s'éteignent ») : 220 191 175 au centre, 200 175 161 au bord — un aplat. C'est le sujet de ≈ 25 s du film (11–23 s, 40–61 s) et de la chute.

**Cause.** `heart.js:70-127` : `ShaderMaterial` non éclairé, `col = uInk * (0.035 + 0.15·lam² + 0.06·bord)` (l. 107-109), aucun spéculaire. Les ondelettes sont un **produit de deux sinus** (l. 111) : un produit de sinus, c'est un damier.

**Correctif** (on reste dans les trois couleurs : muscle `ink`, électricité `signal`/`veille`) :

```glsl
// heart.js, fragment — remplace les l. 105-115
vec3 n = normalize(vN); vec3 v = normalize(vV);
// les fibres : une normale striée le long d'une hélice — la lumière accroche le muscle
vec3 fib = normalize(cross(n, vec3(0.35, 1.0, 0.2)));
n = normalize(n + fib * (noise(vP * vec3(3.4, 1.1, 3.4)) - 0.5) * 0.32);
float facing = clamp(abs(dot(n, v)), 0.0, 1.0);
vec3 l = normalize(vec3(-0.4, 0.75, 0.5));
float wrap = 0.5 + 0.5 * dot(n, l);
float spec = pow(clamp(dot(n, normalize(l + v)), 0.0, 1.0), 90.0);   // humide : un reflet net
float sheen = pow(1.0 - facing, 3.0);
float cavity = smoothstep(0.0, 1.4, vCrease);                         // 0 dans les sillons (attribut cuit, voir plus bas)
vec3 col = uInk * ((0.03 + 0.20 * wrap * wrap) * mix(0.35, 1.0, cavity) + 0.10 * sheen) + uInk * spec * 0.5 * cavity;
// la fibrillation : un bruit déformé par lui-même — des fronts qui errent, plus de damier
vec3 q = vP * 0.42 + vec3(0.0, uTime * 0.55, uTime * 0.35);
q += 0.9 * vec3(noise(q * 1.7 + 3.1), noise(q * 1.7 + 7.7), noise(q * 1.7 + 1.3));
float patches = smoothstep(0.50, 0.64, noise(q * 1.3 + uTime * 0.8));
col += uSignal * patches * uChaos * uActive * (0.5 + 1.5 * facing);
```

- `vCrease` : un attribut calculé à la construction (`heart.js:130-135`). Pour chaque sommet des ventricules, `min_i(|p − c_i| − r_i)` sur les deux oreillettes ; pour chaque sommet d'oreillette, la distance au ventricule et à l'autre oreillette. Vaut ≈ 0 dans le sillon, quelques centimètres ailleurs.
- Trois ou quatre vaisseaux coronaires : `TubeGeometry` de rayon 0,22 collés à la surface (du haut du sillon vers la pointe), matière `fx.vessels`. C'est le détail qui fait dire « un cœur » à 270 px.
- Garder les vitesses actuelles (≈ 1 Hz) : la règle « une lueur qui clignote plusieurs fois par seconde se lit comme un défaut » tient.

**Effort : M. Risque : nul (pas de passe ajoutée). Coût : 0.**

---

### A4 — L'éclairage des sujets sombres : l'environnement fait le travail (kit)

**Preuve.** `e6_34.0.png` (34 s, la meilleure image du film) : dessus du couvercle 13 33 31, flanc 1 8 13 ; `z_cover6_lid_gamma.png` : même remonté, le dessus est un aplat, seul le filet du chanfrein dessine. Couverture du 006 : le socle est une tache noire. Tête du témoin : 149 → 5. À l'inverse, **le condensateur** (`e6_30.2.png`, métal clair, `env 1.2`) est la seule pièce où le studio se reflète — et c'est la plus belle.

**Cause.** Un plastique à 2 % d'albedo ne se dessine que par ses reflets. Or `studioEnvironment` (`stage.js:32-48`) est une pièce noire avec quatre rectangles **unis**, à intensité 0,55 (l. 189), et **le halo du sol n'y est pas** : un objet noir posé sur un sol vert lumineux ne reflète pas ce vert. Côté diffus : hémisphère 0,22 à sol noir (l. 194), fill 0,2 (l. 197).

**Correctif.**

```js
// kit/lib/stage.js — studioEnvironment(renderer, floor = 0x0a0d10)
const soft = (w, h, color, power, pos, fall = 1.2) => {            // une boîte à lumière : brillante au centre, qui s'éteint vers ses bords
  const mat = new THREE.ShaderMaterial({ side: THREE.DoubleSide,
    uniforms: { uC: { value: new THREE.Color(color).multiplyScalar(power) }, uF: { value: fall } },
    vertexShader: `varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
    fragmentShader: `uniform vec3 uC; uniform float uF; varying vec2 vUv; void main(){ vec2 d = abs(vUv - 0.5) * 2.0; gl_FragColor = vec4(uC * pow(clamp(1.0 - max(d.x, d.y), 0.0, 1.0), uF), 1.0); }` });
  /* …même placement que panel()… */ };
soft(9, 6, 0xfff3e2, 13, [-7, 8, 6]);            // la clé
soft(1.6, 10, 0xdfeeff, 9, [8, 3, -7], 0.8);     // la bande de contre-jour
soft(3, 14, 0xffffff, 4, [0, 11, -2]);           // une longue boîte au plafond : le reflet filé sur les cylindres (tige, condensateur)
panel(40, 40, 0x15191d, 1, [0, 20, 0]);          // un cyclo gris très sombre : plus rien ne reflète du noir pur
panel(16, 16, floor, 1, [0, -6, 0]);             // le sol : la couleur du halo
```

- Trois environnements fabriqués au démarrage : sol neutre, sol `veille × 0,5`, sol `signal × 0,5`. `stage.mood(m)` choisit (`scene.environment = …`) : la règle « une ambiance se tient franche, 0 ou 1 » rend la bascule propre ; la faire au milieu des fondus de `mood` (0,3 s) ou sur les coupes.
- `scene.environmentIntensity` 0,55 → 0,85 ; key 2,5 → 2,1 (`stage.js:189,195`), derrière une option `look: 2` de `createStage` pour ne pas toucher aux anciens dossiers.
- Un rebond diffus pour les pièces **claires** (électrodes, cliquets, têtes) : `lights.bounce = new THREE.HemisphereLight(0x000000, 0x000000, 1)` ; par image, dans `main.js` à côté de `pool.uniforms.uColor` (005 l. 411, 006 l. 482) : `lights.bounce.groundColor.copy(mix).multiplyScalar(0.9 * S.pool)`. L'ombre propre d'une tête passe de 5 à ≈ 30/255, teintée par le sol.
- Matières du 005 à revoir dans la foulée (`005/model.js:79-83`) : `hero` 0xc9ced1 → 0xa4abb0, `rough 0.34`, `coat 0.4` (l'aplat crème à 219 devient une face métallique avec un dégradé de reflet).

**Ce que ça change.** Le dessus du couvercle reçoit un dégradé de boîte à lumière, ses flancs le vert du sol : l'objet est **posé dans sa lumière**. C'est le marqueur n° 1 d'une photo de produit.

**Effort : M** (réglage au `look` sur 6 images). **Risque scintillement : faible** (bascule d'environnement à poser hors des plans fixes). **Coût : 0.**

---

### A5 — Ce qui brille éclaire (kit : principe ; 005 et 006 : trois lumières chacun)

**Preuve.** `e5_24.6.png` : deux bandes vertes HDR à 2 cm des flasques, qui restent gris neutre. `e6_34.0.png` : le voyant vert ne dépose rien sur le couvercle. `e6_28.6.png` : les anneaux de charge ne teintent ni la batterie ni le socle. Aucune `PointLight` dans le dépôt.

**Correctif.** Une lumière ponctuelle sans ombre par émetteur-héros, pilotée par **la même variable** que sa lueur (donc fonction du temps seul). Scène en centimètres, `decay 2` : éclairement ≈ intensité / d².

```js
// 005/model.js, après l. 180 — trois lumières à 120° autour de la bobine
fx.powerLights = [0, 120, 240].map((deg) => {
  const L = new THREE.PointLight(BRAND.veille, 0, 45, 2);
  L.position.set((COIL.r1 + 3) * Math.cos(deg * DEG), (COIL.y0 + COIL.y1) / 2, (COIL.r1 + 3) * Math.sin(deg * DEG));
  coil.add(L); return L; });
// dans pose() : for (const L of fx.powerLights) L.intensity = 35 * power * bands;

// 006/model.js — voyant (après l. 180), charge (après l. 110), bouton (après l. 173)
fx.ledLight = new THREE.PointLight(BRAND.veille, 0, 22, 2);     fx.ledLight.position.set(6.9, 12.2, -5.6);  lid.add(fx.ledLight);
fx.capLight = new THREE.PointLight(BRAND.veille, 0, 30, 2);     fx.capLight.position.set(CAN.x, CAN.y + 4.5, 2); power.add(fx.capLight);
fx.btnLight = new THREE.PointLight(BRAND.signal, 0, 22, 2);     fx.btnLight.position.set(5.0, 12.6, 3.2);   lid.add(fx.btnLight);
// dans pose() : ledLight.intensity = 6 * led * (1 + 0.6 * sin(time * 2.2)) ; capLight.color ← hue, intensity = 30 * charge ; btnLight.intensity = 14 * armed
```

Une lumière ajoutée à une pièce qui s'efface doit s'éteindre avec elle (`setPartOpacity`) : multiplier par `part.userData.part.opacity`. **Effort : S. Risque : nul. Coût : négligeable.**

---

### A6 — Occlusion ambiante : GTAO une fois par image (kit)

**Preuve.** `e6_28.6.png` : batterie et condensateur sans assombrissement là où ils approchent le socle. `e5_29.0.png` : gorges de la tige sans creux, bague sans contact avec les cliquets. `e6_30.2.png` : composants de la carte posés comme des autocollants.

**Correctif.** `GTAOPass` (présent dans `three/addons`) inséré **après** `ShutterPass` et **avant** le bloom : une seule évaluation par image, multipliée sur l'image accumulée. Deux précautions propres à ce moteur :

1. **Un calque pour les pleins.** La passe rend la scène en `MeshNormalMaterial` : les coques de verre, les lueurs, le halo, les traits (`LineSegments2`) y deviendraient des solides. On lui donne une caméra qui ne voit que le calque 1.
2. **L'AO s'efface dans le mouvement** (elle est calculée à l'instant de l'image, sur une image floutée).

```js
// kit/lib/stage.js
import { GTAOPass } from "three/addons/postprocessing/GTAOPass.js";
export const AO_LAYER = 1;
const aoCam = camera.clone();
const gtao = new GTAOPass(scene, aoCam, W, H, undefined,
  { radius: scale * 0.12, distanceExponent: 1.4, thickness: 1.2, scale: 1.1, samples: 16 },
  { lumaPhi: 10, depthPhi: 2, normalPhi: 3, radius: 6, rings: 2, samples: 16 });
const aoRender = gtao.render.bind(gtao);
gtao.render = (r, w, rd, ...rest) => {
  applyCamera(frameTime);                         // la caméra de l'instant, sans jitter
  aoCam.copy(camera, false); aoCam.layers.set(AO_LAYER);
  gtao.updateGtaoMaterial({ radius: focus.scale * 0.12 });   // 3,6 cm sur l'établi, 29 cm dans le hall
  gtao.blendIntensity = stage.ao * (1 - smooth(20, 60, motionPx));   // motionPx : voir A7
  aoRender(r, w, rd, ...rest);
};
composer.addPass(shutterPass); composer.addPass(gtao); composer.addPass(bloomPass); /* … */
// stage.ao = 0 par défaut (anciens dossiers) ; 0.7 pour 005/006

// kit/lib/build3d.js:170 (addMesh)        if (mesh.castShadow) mesh.layers.enable(1);
// kit/lib/build3d.js:194 (setPartOpacity) mesh.layers[a > 0.6 ? "enable" : "disable"](1);
// kit/lib/atmo.js:23 (le sol)             base.layers.enable(1);   // l'AO au pied de l'objet = l'ombre de contact
// 005/reactor.js:207 (les 157 assemblages) fuel.layers.enable(1);   // des joints sombres entre les blocs : le cœur prend du relief (voir A9)
```

**Limites à connaître.** L'AO assombrit aussi ce qui est additif par-dessus un creux (une lueur dans une gorge) : à 0,7 c'est discret ; si ça gêne, la version propre est de faire lire la texture d'AO par les matières `solid()` (`onBeforeCompile`, multiplication de l'éclairage indirect) — un jour de travail de plus. Le bruit résiduel du GTAO est fixe à l'écran : sur un objet qui bouge lentement il peut « grouiller » ; garder le débruitage, et contrôler au `qa`.

**Effort : M. Risque scintillement : moyen** (c'est la seule piste qui en porte un vrai). **Coût : ≈ +10 à 20 %** (+5 à 8 % en demi-résolution : `new GTAOPass(scene, aoCam, W / 2, H / 2, …)`).

---

### A7 — Un obturateur qui s'adapte à la vitesse (kit)

**Preuve.** `z_e5_27_pawl.png` (27,5 s, la bobine se soulève pendant un mouvement de caméra) : les arêtes de la bague et du socle en « velours côtelé », la tige en trois fantômes. `e5_22.5.png` (vol vers la bobine) : le bas des barres en escalier. À 2 images/s, ces images sortent sur les planches.

**Cause.** 16 instants également espacés : au-delà de ≈ 4 px entre deux instants, un trait de 2 px ne se recouvre plus. Soit ≈ 60 px de déplacement par image.

**Correctif.** Compter les échantillons sur le déplacement réel, entre 16 et 48.

```js
// kit/lib/stage.js
const probes = [];                                    // stage.probe(obj) : ce qui bouge de soi-même (les pièces de la vue éclatée)
function motionAt(t) {                                // px parcourus pendant l'ouverture, au pire
  const span = shutter / FPS;
  if (cuts.some((c) => c > t - span - 1e-3 && c <= t + 1e-6)) return 0;
  const pts = () => { scene.updateMatrixWorld(true); return [...probes.map((o) => stage.project(o)), ...corners().map((p) => stage.project(p))]; };
  for (const fn of before) fn(t - span); applyCamera(t - span); const a = pts();
  for (const fn of before) fn(t);        applyCamera(t);        const b = pts();
  return Math.max(...a.map((p, i) => Math.hypot(p.x - b[i].x, p.y - b[i].y)));
}
// renderAt(t) : motionPx = motionAt(t); shutterPass.samples = clamp(8 * Math.ceil(motionPx / 24), 16, 48);
// advance(k) lit shutterPass.samples (aujourd'hui : la constante `samples`, l. 259 et 265) ; le disque de A2 se recalcule pour n
```

`corners()` : les 8 coins de la boîte `focus ± scale`. Dans `main.js` : `partList.forEach((p) => stage.probe(p))`. **Effort : S–M. Risque : nul** (plus d'échantillons = plus lisse). **Coût : ×2 à ×3 sur les seules images rapides, ≈ +10 à 25 % sur un film.**

---

### A8 — Des chanfreins qui accrochent, des normales à plis (kit, 005 d'abord)

**Preuve.** `e5_29.0.png`, `e5_40.5.png` : la tige est une pile de rondelles à angles vifs ; `m1.bright.flatShading = true` (`005/model.js:104`) facette aussi le tour du cylindre. `e5_27.5.png` : cliquets en carton. À l'inverse, le couvercle du 006 (`roundedBox`, `coat 0.5`) porte un filet de lumière sur son chanfrein (`e6_34.0.png`) : **c'est le chanfrein verni qui donne prise à la lumière de contour.**

**Correctif.**

```js
// kit/lib/build3d.js
import { toCreasedNormals } from "three/addons/utils/BufferGeometryUtils.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
/** Un profil dont chaque angle vif est cassé par un chanfrein de r (cm). */
export function chamfer(profile, r = 0.1) {
  const out = [];
  profile.forEach((p, i) => {
    const a = profile[i - 1], b = profile[i + 1];
    if (!a || !b) return out.push(p);
    const u = [a[0] - p[0], a[1] - p[1]], v = [b[0] - p[0], b[1] - p[1]];
    const lu = Math.hypot(...u), lv = Math.hypot(...v), k = Math.min(r, lu / 3, lv / 3);
    const cos = (u[0] * v[0] + u[1] * v[1]) / (lu * lv);
    if (cos > -0.94 && k > 1e-3) out.push([p[0] + (u[0] / lu) * k, p[1] + (u[1] / lu) * k], [p[0] + (v[0] / lv) * k, p[1] + (v[1] / lv) * k]);
    else out.push(p);
  });
  return out;
}
export const lathe = (profile, segments = 96, { bevel = 0, crease = 0 } = {}) => {
  const g = new THREE.LatheGeometry((bevel ? chamfer(profile, bevel) : profile).map(([r, y]) => new THREE.Vector2(r, y)), segments);
  return crease ? toCreasedNormals(g, crease * DEG) : g;   // lisse autour de l'axe, vif aux angles
};
export const box = (w, h, d, r = 0.1) => new RoundedBoxGeometry(w, h, d, 3, r);
```

- `005/model.js:104-105` : supprimer `flatShading`, `lathe(rodProfile(), 72, { bevel: 0.12, crease: 30 })`.
- `005/model.js:123` (cliquets) : `bevelSegments: 3`, `bevelSize 0.18` ; l. 145 (bague) et l. 172 (flasques) : `{ bevel: 0.15, crease: 30 }`, `threshold: 50` pour que le trait d'arête ne se dédouble pas sur le chanfrein.
- `006/model.js:116,132-136` : carte, composants, puce en `box(…, 0.06)`.
- Une fois les chanfreins en place, baisser l'opacité des traits d'arête de ces pièces (0,8 → 0,45) : le reflet remplace le trait, l'objet cesse d'être « un trou bordé de traits ».

**Effort : M. Risque : nul. Coût : 0.**

---

### A9 — Le cœur du réacteur, première image du 005 (005)

**Preuve.** `e5_1.0.png` (première image, tenue 9 s) et `e5_12.5.png` (« près de 3 000 MW ») : un cylindre orange uni, 182 54 5 au centre comme au bord, des points blancs dessus. Le tiers bas de l'image à 12,5 s est vide (6 6 6).

**Cause.** `reactor.js:194` : le profil « plus chaud au milieu » dépend de la distance de l'assemblage à l'axe — or on ne voit que la couronne **extérieure**. Et la face lointaine n'est pas plus sombre que la proche (les barres, elles, ont `vDepth`, l. 75-76 et 101).

**Correctif** (à régler au `look`, confiance moyenne) :

```glsl
// reactor.js — vertex : le même vDepth que barMaterial (l. 75-76)
// fragment, à la place des l. 196-203
float edge = max(abs(vL.x), abs(vL.z)) / 9.7;
float slit = smoothstep(0.86, 1.0, edge);                                   // tout près d'une arête verticale de l'assemblage
float heatY = sin(3.14159 * clamp(vL.y / 366.0 + 0.5, 0.0, 1.0));
float far = clamp(0.5 + vDepth / 340.0, 0.0, 1.0);
float k = (0.07 + uGain * 1.5 * uReaction * lit * profile * breath) * facing * mix(1.0, 0.5, far);
vec3 col = uColor * k;
col += mix(uColor, vec3(0.914, 0.894, 0.847), 0.5) * slit * heatY * uReaction * lit * 1.4;   // le feu vu entre deux assemblages : signal tiré vers ink
gl_FragColor = vec4(col, 1.0);
```

Avec `fuel.layers.enable(1)` (A6), l'AO creuse les joints entre assemblages. Et les « neutrons » (`reactor.js:214`, 900 points `ink` de 3 à 8 cm) : les passer en traînées (`update(t, px, streak)`), aujourd'hui ce sont des flocons.

**Effort : M. Risque : faible** (pas de lueur qui clignote ; garder la respiration lente). **Coût : 0.**

---

### A10 — Finitions (kit, pipeline)

- **Poussières.** `atmo.js:109` : couleur par défaut `signal`, ×2,2 (l. 129), `uAmount 0.1` dans les deux `main.js` (005 l. 416, 006 l. 487). Sur l'établi, en ambiance veille, ce sont des points rouges isolés : `z_e5_29_specks.png`, `e6_34.0.png` (705,487 ; 720,697 ; 890,920), couverture du 006. Ils se lisent comme des pixels morts — et le rouge veut dire « menace ». → `makeMotes({ color: BRAND.ink, count: 120, psize: [0.5, 1.8] })`, `uAmount 0.05`, ou rien. **S.**
- **Netteté.** Dans `GRADE` (`stage.js:150`), avant l'étalonnage, une accentuation bornée : `vec3 d = c − moyenne des 4 voisins ; c += clamp(d, −0.06, 0.06) * 0.6;` (deux uniformes : `uTexel`, `uSharp`). Bornée, elle ne crée pas de liseré sur les traits clairs. **S**, +1 %.
- **Bloom.** `bloomPass.compositeMaterial.uniforms.bloomFactors.value = [1.0, 0.7, 0.5, 0.45, 0.4]`, force 0,6 → 0,55 : un cœur serré et une traîne longue (la règle du `halo()` de `hall.js`, appliquée à tout le film). À doser : « au-dessus de 3, ça bave ». **S.**
- **Encodage.** `z_e6_34_lid_gamma.png` (MP4) contre `z_cover6_lid_gamma.png` (PNG du moteur) : le dégradé est propre à la sortie du moteur, en blocs dans le MP4 (7,9 Mbit/s, `scripts/sd.mjs:142`, `--quality high`). Le sujet vit dans les valeurs les plus sombres, là où H.264 est le plus avare, et TikTok recompresse par-dessus. → `--video-bitrate 16M` (ou `--crf 10`) pour le fichier d'origine ; `npm run phone` n'est pas concerné. A4 aide aussi : un sujet à 40–70/255 survit mieux qu'à 13/255. **S.**
- **Profondeur de champ par l'obturateur** (optionnelle). Décaler la caméra sur un disque d'ouverture à chaque échantillon en gardant le plan visé fixe ; gratuit. Avec 16 échantillons, rester à **≤ 6 px** de flou à deux fois la distance de mise au point, sinon les traits clairs hors mise au point se dédoublent (même défaut que A7).

```js
// stage.js — cam.blur (px à 2×d ; 0 = net), dans applyCamera(t, jx, jy, lu, lv)
const F = H / (2 * Math.tan((p.fov * DEG) / 2)), A = (p.blur * 2 * p.d) / F;       // ouverture en cm
camera.updateMatrix(); right.setFromMatrixColumn(camera.matrix, 0); up.setFromMatrixColumn(camera.matrix, 1);
camera.position.addScaledVector(right, lu * A).addScaledVector(up, lv * A);
side += -(lu * A * F) / p.d; shift += (lv * A * F) / p.d;   // le plan visé ne bouge pas — signes à caler au premier essai
```

  Plans où l'essayer : le cœur à 16 s, les cliquets à 29 s, la puce à 30 s (l'électrode du premier plan de `e6_28.6.png` devient un flou d'avant-plan). **S. Risque moyen.**

## 4. Ordre de mise en œuvre et contrôle

| Lot | Contenu | Durée | Gain attendu |
| --- | --- | --- | --- |
| 1 — réglages | A2 (key en surface, pastilles d'ombre), A5 (lumières des émetteurs), A10 (poussières, encodage), tube du 005 à `base 0` | une demi-journée | les ombres, les contacts lumineux, plus de pixels morts |
| 2 — matières | A1 (coque de verre), A3 (cœur), A4 (environnement, rebond) | une journée | les deux films changent de catégorie |
| 3 — moteur | A6 (AO), A7 (obturateur), A8 (chanfreins), A9 (cœur du réacteur) | une à deux journées | la finition « studio » de l'établi |

Images de contrôle (les mêmes instants qu'aujourd'hui, à comparer côte à côte avec les `e5_*.png` / `e6_*.png` de ce dossier) :

- `npm run look -- 006 --at 0.4,2.0,16.0,19.5,27.0,28.6,34.0,37.6,44.3,50.0,57.0,63.0`
- `npm run look -- 005 --at 1.0,12.5,19.0,24.6,27.5,29.0,33.0,40.5,46.0`

Puis `render --draft` + `qa --file` après **chaque** lot : A6 est la seule piste qui peut ramener du grouillement ; A2 et A7 ne peuvent que lisser. Budget de rendu si tout est activé : ≈ +25 à 45 %, dont une partie rendue par les cartes d'ombre en 2048².

## 5. Ce qu'il ne faut pas faire

- **ACES ou AgX** : les trois couleurs de la marque changeraient de teinte.
- **`transmission` physique** pour le verre : un rendu de scène en plus par échantillon (×16), et il ignore les additifs.
- **Grain animé, aberration chromatique** : bruit que TikTok transforme en blocs ; flou sur les traits et les libellés.
- **SSR, `Reflector` par échantillon** : coût ×2 du décor, traits fins réfléchis qui scintillent. Pour le hall du 006, un reflet **peint** suffit : un quad additif étiré sous la boîte verte (dégradé vertical, `veille × 0,25`, 40 × 260 cm, à y = 1), qui dit « sol poli » sans rien calculer — et donne à la première image une verticale lumineuse vers la boîte.
- **`VSMShadowMap`** pour adoucir : fuites de lumière ; la key en surface (A2) fait mieux, gratuitement.

Hors classement, pour le 007 : un décor « aux rayons X » réduit à des traits (hall du 006, Chicago à 57–65 s du 005, `e5_63.5.png`) redevient un dessin au trait. Avec la coque de A1, donner aux murs et aux volumes du décor de vraies surfaces de verre (chant net, reflet) plutôt que des segments seuls.

## 6. Ce qui marche et qu'il ne faut pas casser

- **L'obturateur à accumulation** (`stage.js:62-118`) : flou de mouvement réel et anticrénelage des traits dans la même passe, coupes nettes (`stage.cut`). Toutes les pistes gratuites de ce rapport (ombres douces, profondeur de champ) s'appuient dessus.
- **`NeutralToneMapping` + étalonnage en bout de chaîne** : les couleurs de marque sortent exactes.
- **Le déterminisme** : tout est fonction du temps, filtre NaN, tramage. Zéro image parasite : chaque ajout doit rester une fonction de `t` et d'un motif fixe.
- **Le sujet sombre sur un halo, la grille, le « catcher »** : la silhouette se lit à 270 px.
- **Le couvercle du 006** (`roundedBox` + vernis, `e6_34.0.png`) et **le condensateur** (`e6_30.2.png`) : les deux références de matière à généraliser.
- **La couleur qui raconte** (le vert qui descend dans le cœur à 42–50 s du 005, le cadre du choc devenu vert à 55 s du 006) et les raccords sur une même lumière (`coilGlow`).

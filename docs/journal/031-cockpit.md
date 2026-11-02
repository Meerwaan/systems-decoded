# 031 · `src/cockpit.js` — journal du décor

Agent décor, 2026-10-30. Contrat : `docs/031-decors.md` § `src/cockpit.js`, `plan.js` (DECK, BAY, OTHER, WAVES), `world.js` (`rig`, `apply`). API gardée telle quelle.

## Choix
- **Feux et cœurs** : un sprite face caméra écrit à la main (`glowSprite`) dont la taille est en **monde** mais bornée en **pixels** (`uMin`/`uMax`, `uFocal` = `px`) : cœur gaussien + longue traîne, jamais un disque plein ; les phares d'atterrissage sont directionnels (pleins de face, 15 % de dos) et portent une fine traînée horizontale (l'éblouissement sans voile).
- **Ondes** : plus de sphères. Chaque onde est un **anneau** (cercle `fatLine` en pixels : cœur 2,6 px HDR + halo 8 px) perpendiculaire à sa route, qui **vole** de l'antenne vers l'autre et **s'ouvre** (2,5 m → 30 m à l'arrivée, quel que soit l'écart) ; deux échos plus pâles derrière lui = la traîne. De face c'est un anneau qui se referme sur l'autre avion ; de profil, un trait qui file.
- **Coordination** : une tête (sprite) et une traîne `fatLine` à couleurs de sommet ; **lien** : une ligne fine qui respire à 0,5 Hz, deux têtes lentes qui se croisent.
- **Pilotes** : `makeFigure({ shell, hands: "real" })`, `ghost(true)`, assis (hanches à y 12) ; le commandant tient son manche par `hold` (recalculé seulement quand `pull` change), l'autre main sur la cuisse.

## Journal
- **Planche 1** (8 images) : anneaux de ping et feux justes à l'accroche (l'anneau se referme sur l'autre avion, ses trois phares éblouissent sans voile) ; poursuite et paire lisibles (tête de coordination, lien et deux cœurs) ; le manche plein se lit, la main de verre le tient. Défauts : trois échos trop proches → ruban rayé (passé à un écho à 0,3, retard 0,1) ; le geste « tirer » invisible à az 55 (course portée à 0,36 rad ≈ 21°, filmer de flanc) ; `VIEW.shoulder` provisoire ne montre ni l'épaule ni les écrans.
- **Planche 2-3** (16 images) : `VIEW.shoulder` provisoire rate l'autre avion (hors champ de 15° à az 75) → **pose E** : `{ tx: -2700, ty: 45, tz: 40, d: 266, az: 94, el: 12, fov: 50, shift: 0 }` — la tête et l'épaule de verre à gauche, l'autre avion et ses phares dans la zone haute, l'auvent, les écrans en bas ; ses phares grossissent de 300 à 200. Manche : **az 20** (de flanc) montre le geste, pull 0 penché vers l'avant → pull 1 vers l'arrière ; grain d'usinage éteint sur la poignée (ruche). Vue d'ensemble du poste (`{ tx:-2600, ty:10, tz:0, d:650, az:-50, el:28, fov:30, shift:60 }`) : deux pilotes assis, sièges, consoles, baie et cœur — lisible. Profil : l'anneau signal monte du sol en ellipse, puis s'ouvre et s'efface sur toi. À gap 1400 les phares sont petits mais là.
- Corrections : la balise rouge se perdait dans le halo blanc des phares → halo des phares réduit (1050 → 760 cm), balise plus grande et à son plus fort sur la première image ; **le ping est déphasé de 0,3 s** (`PHASE`) : à t = 0 un anneau est déjà en route (sinon l'image 0 n'en avait aucun).
- **Planche 4** (4 images, avec en-tête et zones) : à t = 0 l'anneau encercle l'autre avion, son feu rouge se lit au-dessus des phares, rien sous 1600 ; l'épaule E (tz 50) tient entre l'en-tête et les sous-titres. `npm run check -- 031` passe (0 erreur). Images lues : 4 planches = 28.

## Poses qui cadrent
- `hook` : `POSE0` tel quel (gap 260–320, `ping` 1, `lights` 1).
- `shoulder` : `{ ...P, tx: -2700, ty: 45, tz: 50, d: 266, az: 94, el: 12, fov: 50, shift: 0 }` (gap 300 → 200).
- `stick` : `{ ...P, ...CLOSE, tx: DECK.stick.x, ty: DECK.stick.y + 10, tz: DECK.stick.z, d: 80, az: 20, el: 18, shift: 80 }`.
- `fuselage`, `chase`, `pair`, `profile` : ceux de l'architecte marchent tels quels. Vue d'ensemble du poste (plan libre) : `{ ...P, tx: -2600, ty: 10, tz: 0, d: 650, az: -50, el: 28, fov: 30, shift: 60 }`.

## Pas encore au niveau
- `pair` (d 20000) : les deux cœurs et le lien se lisent, **les pilotes de verre non** (2 px à 200 m) — il faut un plan rapproché sur un poste si la voix les nomme.
- L'anneau de ping vu de l'accroche : l'écho reste presque confondu avec le front (même taille apparente vue du sommet du cône) — un double trait, pas un défaut.
- Le ping et la réponse vus de la poursuite (`chase`) : concentriques autour de l'autre avion (l'axe des ondes pointe sur la caméra) ; ça se lit comme « ça va vers lui », pas comme un trajet.

## À changer ailleurs
- `world.js`, `VIEW.shoulder` → `shoulder: { ...P, tx: -2700, ty: 45, tz: 50, d: 266, az: 94, el: 12, fov: 50, shift: 0 },`
- `world.js`, `VIEW.stick` → `stick: { ...P, ...CLOSE, tx: DECK.stick.x, ty: DECK.stick.y + 10, tz: DECK.stick.z, d: 80, az: 20, el: 18, shift: 80 },`
- `world.js`, `apply` : `Object.assign(W, { ping: S.ping, … })` alloue un objet à chaque appel (16 par image) → `W.ping = S.ping; W.coord = S.coord; W.answer = S.answer; W.link = S.link; W.atc = S.atc; W.mood = S.mood; W.a = a; W.b = b; W.ca = ca; W.cb = cb; W.atcFrom = atcFrom;`

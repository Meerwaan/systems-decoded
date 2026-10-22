# 024 · Bloc opératoire — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/024-actes.md`. Les décors sont rendus : `docs/journal/024-bloc.md`, `docs/journal/024-model.md`, l'habillage `docs/journal/024-habillage.md`. **La voix est enregistrée** (93,9 s) : les repères tombent sur les vrais mots.

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : la candidate (a), la table, `{ tx: 50, ty: 112, tz: -50, d: 540, az: -34, el: 18, fov: 38, shift: 10 }` — la lampe allumée sous l'en-tête, toi sous le drap, le chirurgien, l'armoire derrière le mur. `FIRST` n'a pas bougé. Personne ne les change. La première seconde bouge déjà, vers l'appareil (`VIEW.device`) : c'est là que « un fil touche le métal ».
- **L'azimut** : az 0 = la caméra sur +z, az −90 = sur −x.
- `OUT` = [36, 64, 3.6] dans `plan.js` ; les deux disjoncteurs sont bipolaires, un par circuit (ligne ajoutée dans `sources`).
- **Le commentaire n'est pas une réponse** : la question est « électriciens, dites-nous ce qu'on a simplifié ». Le texte tapé (`typeAnswer`) ne donne PAS la réponse (jamais « LES MASSES ») : le champ dit « À VOUS » (6 signes, déjà dans `index.html` : `commentCall` avec `chars` 6).
- **« Ici, le noir, c'est un respirateur qui s'arrête… »** est un « et si », pas ce qui arrive : il se joue avec un voile qui le dit (`gel` signal, la salle qui s'éteint puis se rallume d'un coup à la phrase suivante), jamais comme la suite réelle de l'histoire.

## Les poses (vues sur planche)

- Établi (`model.js`, `fov` 28) : `whole`, `exploded` (tout tient entre l'en-tête et y 1550), `xfo` (dans l'éclaté, les enroulements montent de 27 cm), `path`, `cpi`, `doubleBench` (double défaut et déclenchement), `caseA` (la carcasse A).
- Bloc (`bloc.js`) : `device` et `walls` corrigés ; `system` à d 340 (à 210 le système est coupé dans l'armoire). `lamp`, `surgeon`, `repeater`, `room`, `far` cadrent ; `resp` montre le soufflet qui bouge puis s'arrête, mais pas ta tête.
- Autres candidates vues : (c) de haut `{ tx: 30, ty: 100, tz: -40, d: 620, az: -20, el: 34, fov: 38, shift: -20 }` lisible ; (d) derrière l'appareil `{ tx: 70, ty: 108, tz: -45, d: 430, az: 128, el: 24, fov: 40, shift: -120 }` montre la table et l'appareil.

## Ce qui n'est pas au niveau, et comment le filmer

- Personnages : des mannequins articulés ; les mains du chirurgien font griffes — jamais en gros plan.
- La carcasse se lit plus vitrine que tôle : c'est le fil (signal à l'usure) et le contact (cœur blanc-signal) qui portent « un fil touche le métal ».
- Dans le noir, la poignée de la lampe semble flotter : plans brefs.
- La lueur de l'armoire concurrence la lampe dans les plans larges.
- Vue d'ensemble de l'établi : le CPI et les carcasses sont petits — resserre pour les nommer. Le chemin du défaut a beaucoup de verticales : il se lit, pas parfaitement à 270 px.
- Habillage : le coin de l'anesthésiste (chariot, perfusion, bras de plafond et son écran) est côté tête, au-delà du respirateur : hors des poses actuelles. Un plan tourné vers la tête de la table le montre (`{ tx: 40, ty: 112, tz: -50, d: 600, az: -60, el: 16, fov: 40, shift: 10 }` : toi, le chirurgien, la lampe, l'armoire).

## Le tact

Personne ne meurt et rien n'arrive au patient : le « noir » est un « et si ». Le chirurgien n'est jamais en difficulté à l'image.

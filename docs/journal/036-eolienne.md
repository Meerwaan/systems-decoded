# 036 · `src/eolienne.js` — journal du décor

Agent `decor`, 04/11. Section : `docs/036-decors.md` « src/eolienne.js ». Dossier temporaire : `.cache/planches/036/eolienne/`.

## Plan de construction (avant le premier jet)

- Mât : deux troncs de cône de verre (`glass` + `asShell`, ordre 40), coupés à `FOLD.y`. La moitié haute tourne autour d'un axe horizontal posé **sur le bord du mât côté chute** (az 150), pas en son centre : elle ne traverse pas la moitié basse. Brides en anneaux (`fatLine`), porte au pied (az −20), échelle intérieure en ruban dessiné au shader (barreaux tous les 30 cm, fondus par `fwidth` dès qu'ils passeraient sous le pixel : pas de moiré vu de la route).
- Pales : un profil d'aile lofté (racine ronde → corde max à 650 → bout de 45, vrillage 14° → 0), chaque pale en **8 tronçons enchaînés** (la flexion de `shake` est une onde de petits angles aux jointures, sans shader ni allocation). Verre + `asShell` (ordre 30), un **voile sombre** dessous (la pale se lit sombre sur le halo), bord d'attaque et bord de fuite en traits clairs.
- Flou : par pale, un éventail calculé au shader dans le plan du rotor (contre-tourné du pas), angle = rpm × 0,55°, éteint sous ≈ 4 tr/min ; un voile sombre + un léger voile clair ; la traînée des bouts (2,4 × l'angle), encre → signal entre 12,7 et 13,3 tr/min.
- Réseau : chemin inversé (du loin vers le pied) pour que `instanceCount` coupe depuis le pied ; conducteur encre sombre, tirets veille (queue + tête) qui courent à 3 000 cm/s (période 1 200 : ≈ 1/12 de période par image) ; un éclat signal court sur le front de coupure.
- Portée : arc de Bézier en tirets signal tracé par `instanceCount`, anneau au sol autour de la voiture.
- Technicien : `makeFigure({ shell: true, order: 10 })` tout en verre (`ghost`), mains sur les montants, pieds sur les barreaux, en alternance.

## Journal

- **Premier jet** (planche p1, 8 vignettes) : tout se construit. Mât, brides, échelle (barreaux fondus au loin : pas de moiré), réseau vivant / mort, poste, poteaux, arc de portée et anneau : bons du premier coup. Défauts : aucun halo derrière le rotor (le « halo » du plateau n'éclaire que les pleins) → les pales grises sur ciel noir, pas « sombres sur halo » ; le flou invisible sur ciel noir ; `shake` imperceptible.
- **Halo** (p2 → p3) : un sprite doux **signal** derrière le moyeu. Posé à un endroit fixe, il tombait derrière le milieu du mât (caméra basse) → il se place maintenant à chaque dessin sur la ligne caméra → moyeu, deux fois plus loin (`onBeforeRender`), taille ≈ 1,35 × le rotor, éteint sous 3,5–8 m du moyeu (gros plans : la lumière du moyeu prend le relais). Couleur : signal à `mood` 1, encre très sombre à `mood` 0 (`mood` à faire passer par `world.js`, voir plus bas). Résultat : rotor sombre sur halo signal à 270 px, la menace derrière le sujet.
- **Pales** : verre + voile sombre (0,62) : elles se lisent sombres sur le halo, bord d'attaque clair. Les traits passaient SOUS le voile (ordre 3 < 27) et sortaient éteints → ordre 28.
- **Flou** : visible à 19 tr/min (éventail derrière la pale du haut, traînée signal au bout) ; à 11, traînées encre en crochets aux bouts — c'est ce qui bouge dès l'image 1 ; à 3 tr/min, pas en drapeau : plus de flou, les trois tranches. Pale A à 90, B et C à 0 : la tranche contre les faces se lit.
- **`shake`** : d'abord en battement (vers le vent) → invisible depuis l'avant du rotor ; puis une onde dont la phase faisait un tour complet le long de la pale → le bout ne bougeait pas. Maintenant : surtout dans le plan du rotor, un quart d'onde le long de la pale, 2,1 Hz, ≈ 3 m au bout d'un extrême à l'autre ; bords de la pale A qui virent au signal. Vérifié en gros plan (p7) ; à 130 m, ça se voit en mouvement, pas sur une vignette fixe.
- **Pli** (p3, p4) : vu de `VIEW.wide` (az −30), un pli vers az 150 part droit dans l'axe de la caméra : illisible (un mât plus court). Vu de profil (caméra az 60), il se lit tout de suite : moitié haute couchée, nacelle et pales au bout, charnière signal. → demande de changer `FOLD.toward` (plus bas). Lueur de la déchirure réduite (elle saturait en blanc).
- **Échelle et technicien** (p3 → p6) : `VIEW.ladder` d'origine met la caméra hors du mât, contre sa peau : la peau de verre rasante fait un grand voile blanc, et le technicien (≈ 2 m à 35 m) disparaît. Caméra DANS le mât, côté opposé à l'échelle : l'échelle file jusqu'au moyeu, le technicien se lit (le verre du mât est atténué quand la caméra est dedans). Jamais une caméra à moins de 3 m à l'extérieur de la peau.

## Poses qui cadrent (vérifiées)

- Pli de profil : `{ tx: -300, ty: 3800, tz: 0, d: 24000, az: 60, el: 2, fov: 40, shift: 60 }` (avec `FOLD.toward` 150) — ou `VIEW.wide` tel quel si `FOLD.toward` passe à 60.
- Échelle (technicien à `tech` 0,5) : `{ tx: -75, ty: 4400, tz: 161, d: 1090, az: 155, el: -72, fov: 64 }` — vérifiée, mais le technicien y tombe bas (sous la zone des sous-titres). Variante calculée, NON vérifiée (budget d'images épuisé), qui le remonte vers 60 % de la hauteur : `{ tx: -75, ty: Y + 330, tz: 161, d: 985, az: 155, el: -70.6, fov: 64 }` avec `Y = 12 + tech × 7298` (à 0,5 : `ty` 3990). Le technicien monte de 73 m entre `tech` 0 et 1 : pour le like, `tech` 0,45 → 0,55 sur 2,3 s (≈ 3 m/s) plutôt que 0,2 → 0,6 (13 m/s, les bras battent à 2 Hz).
- `VIEW.rotor` tel quel : le rotor, le halo, les pas, le flou et les traînées s'y lisent.

## À changer ailleurs

- `world.js`, dans `apply()`, l'appel `turbine.update({ … })` : `shake: S.shake, reach: S.reach, mains: S.mains, fold: S.fold, tech: S.tech, mood: S.mood,` (le halo derrière le rotor suit `mood` : signal à 1, encre sombre à 0 ; sans cette ligne il reste signal partout).
- `plan.js` : `export const FOLD = { y: 3780, toward: 60, max: 78 };` (le pli tombe vers +x, loin de la route, et se lit de profil depuis `VIEW.wide` ; à 150 il part dans l'axe de la caméra).
- `world.js`, `VIEW.ladder` : `ladder: { ...P, tx: -75, ty: 3990, tz: 161, d: 985, az: 155, el: -70.6, fov: 64, shift: 0 },` (caméra dans le mât ; l'acte fait suivre `ty` = 12 + tech × 7298 + 330).

## Ce qui n'est pas au niveau

- Le flou des pales est un éventail calculé, pas une vraie obturation : à 11 tr/min il se lit surtout par les traînées des bouts ; c'est le mouvement réel (l'accumulation des seize instants) qui fait le reste.
- Le technicien est un personnage de verre fin vu de loin : il se lit en silhouette, pas en détail (voulu : jamais en gros plan).
- Budget d'images dépassé : 39 vignettes lues pour 30. La variante de `VIEW.ladder` et le pli avec `toward` 60 ne sont pas revus sur planche.

## Retouche du 04/11/2026 (retoucheur)
- **28,96 → 37,3 s : la pale A de verre en bande claire devant la coupe** → `update` prend `flow` ; à `flow` > 0,01, les tronçons de la pale A au-delà de `SECTION.y` sont cachés (le 6ᵉ et ses enfants) et le 5ᵉ est raccourci jusqu'à la coupe (`scale.y`). Vérifié à 30 · 32,5 · 35,6 · 37,2 (`.cache/planches/036/acte2b-retouche/p1.png`), avec la ligne ci-dessous posée le temps de la planche puis retirée.
- **À changer ailleurs** — `world.js`, `apply()`, l'appel `turbine.update({ … })` : `shake: S.shake, reach: S.reach, mains: S.mains, fold: S.fold, tech: S.tech, mood: S.mood, flow: S.flow,` (sans elle, la coupe de la pale A ne s'enclenche pas).

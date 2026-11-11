# 042 · habillage.js — journal du décorateur

08/11. Habille `char.js` (le char la nuit, sol en grille). Rien sur le caisson, rien devant lui ni devant la colonne. Dossier temporaire : `.cache/planches/042/habillage/`.

## Lu
recette-decorateur, recette-agents (cadre, première image, économie), regles-image, 042-actes (haut, liste des plans, candidates), world.js (FIRST, POSE0, VIEW, apply), plan.js, 042-decors (haut + char.js), journaux char et feu, details.js (en-tête, glow, nightLights, done/update), char.js (tête, sol, update).

## Planche avant (8 : POSE0, saute 2,6, roof, crewWide, columnWide, duo, rear, loader)
- POSE0, saute, columnWide, rear : le char et la colonne sur du **noir sans profondeur** ; l'horizon (0,1) ne se voit pas ; le bas du cadre est noir (c'est la place des sous-titres : on n'y met rien).
- crewWide, duo, roof : la grille seule dit le sol ; rien ne dit « un champ ».
- loader : intérieur, rien à ajouter près des portes.
- Tous les plans larges regardent vers −z (az −40 à +40) : l'habillage lointain n'a besoin que de cette moitié.

## Touches (premier jet)
1. **La lisière** (≈ 300 m) et **une crête** (≈ 1,2 km) : « dehors, la nuit, en rase campagne » ; deux couches qui glissent l'une sur l'autre quand la caméra bouge. Seulement vue d'en bas (œil < 2,5 m au-dessus du sol, éteinte au-dessus de 5 m : sinon elle monte dans l'en-tête). Dessinée après la profondeur du verre du char : la caisse la cache.
2. **Les ornières** : le char a roulé jusqu'ici, deux ornières derrière lui qui tournent vers −z et s'éteignent dans le noir. Baissées sous l'autre tourelle (`other`).
3. **Les écrans** (viseur du tireur, écran du chef, tableau du pilote) : la seule lumière d'un char la nuit ; suivent `crew`.
4. **Une ferme au loin** : dix lumières fixes entre les bosquets.

Nombres suivis : `shell` (tout), `crew` (écrans), `other` (ornières) ; `eye` (lointain).
Lignes dans `char.js` : 3 (import, `group.add`, `dress.update`).

## Après 1 (8, mêmes instants)
- La lisière se lit à 270 px en POSE0, saute, columnWide : un horizon de bois, le char n'est plus dans le vide. Mais à gauche elle longe le canon de POSE0 (même hauteur à 270 px), et en `loader` (œil à 3,2 m, dans la tourelle) elle monte **dans l'en-tête** → seuil de l'œil abaissé (plein sous 1,95 m, nul au-dessus de 2,9 m).
- Ornières : invisibles partout (POSE0 et columnWide rasants ; hors cadre en crewWide) → **retirées**.
- Écrans, ferme : invisibles à 270 px.

## Après 2 (4 à 540 px, avec les zones : POSE0, columnWide, crewWide, loader)
- Écrans : en crewWide un point à peine, en loader **un point blanc qui flotte** à gauche de la cloison → **retirés**. Ferme : invisible → **retirée**.
- Lisière limitée à deux secteurs (bois à droite, champ sous le canon) : il n'en restait qu'un bout au bord droit (zone des boutons), une ligne de sismographe → secteurs abandonnés.

## Après 3 (4 : POSE0, saute, columnWide, rear) — retenu
- Lisière sur tout le demi-tour −z, une seule trouée (un champ) derrière le canon de POSE0 (θ −67° → −57°) ; crête à 1,2 km, plus basse dans la trouée.
- Image 0 à 270 px à côté de l'avant : **aussi forte, pas plus** — le canon et le caisson nets, un horizon qui se devine aux bords. Le gain est dans saute et rear (le bois derrière l'arrière de la caisse). En columnWide, un bout de lisière au bord droit (zone des boutons, discret).
- `npm run check -- 042` : passe (contraste 66/66).

## Retenu
Une touche : **la lisière (≈ 300 m) et la crête (≈ 1,2 km)**, encre, traits de 2,0 / 1,8 px à 0,30 / 0,24, sans brouillard, après la profondeur du verre du char (la caisse la cache), dans le seul demi-tour −z, vue seulement d'en bas (`eye`). Suit `shell`.
Images lues : 24 (avant 8, après 1 8, après 2 4 à 540, après 3 4).

## À changer ailleurs
- Rien d'obligatoire. Pour l'éteindre d'un coup : retirer `dress.update(P, time, px, eye);` et `const dress = dressChar(); group.add(dress.group);` de `char.js` (plus l'import).
- Air du plateau : aucune lampe derrière le sujet dans un plan qui compte (la seule lumière est la colonne, déjà dessinée par `feu.js`) → rien à proposer.

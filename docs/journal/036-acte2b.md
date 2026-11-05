# 036 · `src/acte2b.js` — journal (agent acte)

Le principe et le repos, `toprincipe` 28,96 → `tozero` 47,30. Planches : `.cache/planches/036/acte2b/`.

## Plan monté (premier jet)
- `toprincipe` : coupe `VIEW.section`, `rotor` 0,25, `rpm` 0, `storm` 0,3, `mood` 0, lumière sur la coupe (fs 700) ; poussée d 1500 → 1380.
- « Une pale » `flow` 0,3 · « aile » 0,75 · « biais » 1.
- « tire » : `lift` 1, `rpm` 0 → 0,8 (rotor avec, `power1.in`), la caméra suit la coupe à 82 % (`sectionAt(rotor)` calculé par `top`) ; « porte » : `rpm` → 0, la coupe s'arrête.
- « drapeau » : `gauge` 1, `pitchA` 0 → 90 jusqu'à `deg90a`+0,3 (le clic de `sfx` à +0,37).
- coupe `seule`−0,3 : `VIEW.rotor`, A à 90, B C à 0, `rpm` 12 → 4 (et non 14 → 5 : l'en-tête reste encre dans une scène calme), `chip-seule`, `D.punch` sur `ralentir`.
- `torepos` : `VIEW.road` (acte 3 ouvre sur `VIEW.behind`), `storm` 1, `mood` 0, `rpm` 12 tenu ; pas 4 → 10 → 7 → 12.
- coupe `repos:batteries`−0,3 : `VIEW.system`, `cover` 0,3, `batt` 0,4 ; « saute » `motors` 0,2 ; « qu'elles » `batt` 1.

## Planches (26 images lues)
- p1 (8) : coupe trop petite, la pale A de verre en bande claire au-dessus du profil ; « Pourquoi ça marche ? » = un cadre vide ; `VIEW.system` dans la scène = sombre sur sombre (pales pleines de verre au voile sombre, halo encre à `mood` 0) ; la route : éolienne haute, petite.
- p2 (8) : `blades` 0,4 et `flow` 0,25 dès la coupe, d 1350 → 1200, shift 230 : le profil se lit à 270 px (goutte verte, filets, flèche, cadran). La pale A de verre passe DEVANT la moitié basse du profil (sa moitié côté bout est entre la caméra et la coupe). Établi : un pied de pale noir pointé vers l'objectif mange le cadre.
- p3 (8) : quatre poses pour les coffrets sur l'établi → retenue `az H−45, el 22, d 2150 → 1900, rotor 1/6` (les trois coffrets verts visibles, aucun pied vers l'objectif). Rotor (`seule`, `ralentir`) et route (shift −200, poussée vers le moyeu, side 140) : bons.
- p4 (2) : établi shift 40 (l'anneau ne passe plus derrière les libellés d'acte : le contrôle de contraste à 44,37 s est levé). `check` passe.

## Choix et écarts au plan
- « de biais » : c'est le cadran (`gauge`) qui entre sur ce mot (aiguille à 0) ; « drapeau » fait pivoter le profil et l'aiguille.
- `rpm` 12 → 4 au lieu de 14 → 5 (en-tête encre dans la scène calme).
- « Ses batteries, elles, attendent » : sur l'établi, pas dans la scène (illisible) — l'en-tête garde 185 km/h, comme sur le reste de l'établi.
- 90° à l'en-tête à `deg90a`+0,3 (le clic de `sfx` à +0,37).

## Pas au niveau
- Principe (28,96 → 37,3) : la pale A de verre traverse le bas du profil (bande grise en diagonale, surtout pas 90 à 35,5 s). Retouche `eolienne.js`.
- Repos sur la route (39,3 → 42,9) : les pas qui bougent ne se lisent qu'à l'en-tête (« Pales » 4 → 10 → 7 → 12) ; l'éolienne entière est trop loin pour voir 6°.
- Établi (42,9 → 47,3) : `batt` 0,4 → 1 se voit, sans plus (les coffrets luisent déjà à 0,4).

## À changer ailleurs
- `src/eolienne.js` : quand `flow` > 0,01, la pale A de verre ne garde que sa partie côté moyeu jusqu'à la coupe (SECTION.y) — sa moitié côté bout passe devant le profil vu de `VIEW.section`.

## Couverture (alternative à celle de l'acte 2)
- Repère `qelles` : établi, `{ tx: -291, ty: 7800, tz: 244, d: 2600, az: -110, el: 28, fov: 32, shift: 120, side: 0, roll: 0, drift: 0, dof: 0 }`, `{ ...BENCHED, cover: 0.3, rotor: 1/6, batt: 1, motors: 0.2 }` (p3, vignette c : trois coffrets verts).

## Retouche du 04/11/2026 (retoucheur)
- **34,6 s heurté (qa 16,9)** → `pitchA` 0 → 90 de `drapeau`−0,2 à `deg90a`+0,5 (1,7 s, ≈ 80°/s au plus, contre 108) : 90° à l'en-tête à 35,49, avant le clic (+0,66) ; le rotor ralentit dès `drapeau` (rpm 0,8 → 0 jusqu'à la coupe `seule`, rotor et caméra en `power1.out`) au lieu de glisser à pleine vitesse puis de s'arrêter net sur « porte ». Vérifié à 34,567 · 34,6 · 34,633 (39° · 42° · 44°, 10 km/h) et 35,6 / 36,5 / 37,2 (90°, 5 → 0 km/h). Planche : `.cache/planches/036/acte2b-retouche/p1.png`.
- **Pale A de verre devant la coupe** → corrigée dans `src/eolienne.js` (voir son journal) ; vérifiée à 30 · 32,5 · 35,6 · 37,2 avec `flow` branché à titre d'essai : le profil se lit en entier, il ne reste que la pale côté moyeu, derrière.

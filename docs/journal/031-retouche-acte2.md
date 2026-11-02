# 031 · `src/acte2.js` — retouche (agent retoucheur, 2026-10-30)

Lu : `docs/journal/031-acte2.md`, `docs/031-actes.md` (haut + section acte2), `acte2.js`, `VIEW` de `world.js`. Planches : `.cache/planches/031/retouche-acte2/p1-p3.jpg` (3 images lues). `npm run check -- 031` passe (70/70).

## Défaut → correction → vérifié à

1. **Image parasite 22,03 (recul 21,9–22,2 à travers le verre)** → le recul ne sort plus du poste : `FUS` (d 900, tx −2600) remplacé par `NDBACK = { ...VIEW.nd, d: 100, el: 16 }`, `sine.inOut` sur 21,84 → 22,38 (même cible, l'écran qui recule dans son cadre). Coupe d'entrée, `crew` 0 → 1, `mood`, `shell` inchangés. Vérifié à 21,92 · 22,03 · 22,067 · 22,20 · 22,34 : aucune strie, continuité nette, l'écran rouge lisible.
2. **Heurté 24,8** (poussée de 0,6 s de l'éclaté d 520 à l'antenne d 210) → `shot` EXPL finit à 24,84, **coupe** dans l'axe (même az −40) à « antenne » − 0,1 = 24,86 sur `{ ...ANT_UP, d: 240 }`, puis poussée lente vers `ANT_UP` jusqu'à 25,45 (là où `PAIR` part, inchangé). Vérifié à 24,80 / 24,83 (avant) et 24,90 (après).
   **Heurté 40,6** (glissé de 1,65 s du `PANEL` d 220 à `ANT`, cible qui bouge de 36 en z et 32 en y, el 14 → 30) → **coupe** sur « Mais » − 0,1 = 40,10 vers `{ ...ANT, d: 150 }`, poussée lente vers `ANT` jusqu'à « écoute » − 0,15. Vérifié à 40,57 / 40,60 (images en continuité).
3. **Éclaté petit à 23,5** → `EXPL` d 520 → **470**, `side: 28`. Le système éclaté est trop étalé pour 60 % : il fait ≈ 77 % de la largeur à d 470 (x ≈ 100 → 890 à 24,80), plus près il sort sous les boutons (d 420 : écrans à x ≈ 970) ou dans le rognage gauche. Vérifié à 23,5 et 24,80.
4. **Calculateur flou au bord gauche du `PANEL`** → **non corrigé**. Essayé (planches p1-p3, pose forcée à 34,5 / 38,6) : `shift` 60, az −30, az −50, tz 46, tx 10 tz 50, tz 58 side −40, tz 62 side −80 : le calculateur reste au bord, et dès qu'il recule l'ND se fait rogner à gauche à 38,6. `PANEL` laissé tel quel.

## Reste faible

- 23,5 (mi-course `whole` → `EXPL`) : le bord droit des écrans frôle x ≈ 905 vers y ≈ 1150.
- 24,80 : l'antenne levée, en haut, frôle le bas de l'en-tête (y ≈ 420).
- 40,1 → 41,6 : `ANT` d 150 → 120, le calculateur rassemblé remplit le bas du cadre sous les sous-titres (lourd, mais lisible).

## À changer ailleurs

- `tcas.js` / `world.js` : un nombre d'état pour éteindre le calculateur sur l'établi (`cpu` 0–1), ou un éclaté moins étalé à l'horizontale (transpondeur et écrans plus près de la colonne) : c'est ce qui permettrait l'éclaté à 60 % et un `PANEL` sans le calculateur au bord.

# 037 — ce que les décors ont changé (à lire avec `docs/037-actes.md`)

1. **Image 0 = candidate a (plongée)**, `POSE0` et `FIRST` inchangés (`spin` 0, `tilt` 0) : la seule où le sol-menace est derrière le corps ET le sac plein lisible ; c (dessous) perd la menace et le sac, d est trop petite. `fin.js` y revient avec `D.loop`.
2. **`deploy`** (sauteur + model) : extracteur hors du bac 0,05→0,25, sac jusqu'à l'extension des suspentes 0,25→0,5, voile qui se gonfle 0,5→0,85, bord d'attaque veille dès 0,8. `hang` suit `deploy` (le corps bascule aux épaules), le corps reste inerte.
3. **`VIEW.cutter`** : jamais sans `section` > 0 ou `heart` 1 (à d 16 la caméra est dans la paroi du bac). Avec `section` 1, les trois temps (piston 0, piston 1, `loop` 1) se lisent ; `section` éteint tout autour du coupe-boucle.
4. **`VIEW.exploded` resserré** (d 190, az −42, el 26, shift 0). Le coupe-boucle y reste petit (≈ 20 px à 270 px) : le désigner avec `litCutter` / `litLoop`, ou couper sur `cutter`. `explode` 0,6 ≈ 1 à l'image : ouvrir vite, le reste ne se voit pas.
5. Poses proposées par `model.js` : unité de contrôle `{ tx: 11, ty: 19.2, tz: 23.5, d: 24, az: -30, el: 52 }` ; climax de profil `{ tx: 0, ty: 14, tz: 16, d: 190, az: -90, el: 28 }` (le rabat droit y cache le sac : préférer az −70).
6. **Corps de près** : les membres du personnage du kit sont des capsules énormes, garder d ≥ 220. `handle` n'a pas été revue à l'image : la vérifier avant de s'y fier (proposition sauteur : `tx 6, ty -28, tz 16, d 240, az -35, el -40, fov 32, shift 60`).
7. **`under`** : la campagne tombe sous la zone TikTok ; essayer `el -6, shift -120`. **`landed`** : haie et arbres dans l'en-tête à d 1900 / el 18 ; essayer `el 26, d 1500`. La voile affaissée au sol ne se lit que de loin.
8. **Ciel** : `threat` 0,05→0,45 passe les routes au signal, 0,45→0,95 les haies ; `gate` = vraie nappe à 225 m qui respire ; `strata` se lit mieux à `alt` 2 000 qu'à 900 ; sous `alt` 60, herbe, clôture, haie et ombre de contact, halo autour du sac à `alt` 0.
9. **`sky.update(S, …)`** reçoit l'état entier ; `mood` n'est lu par aucun décor.

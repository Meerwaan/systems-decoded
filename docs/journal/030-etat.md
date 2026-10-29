# 030 — prise de terre : état de la fabrication (orchestrateur)

Tenu par la conversation qui fabrique le 030. Mis à jour avant chaque réveil.

## 22/10, ≈ 4 h 30 — en file (fenêtre de 5 h à 92 %, hebdo 84 %)

Fait :
- architecte (contrat, page, 128 repères, `docs/030-decors.md`, `docs/030-actes.md`, journal `030-architecte.md`) — 0,42 M, 23 min ;
- `src/buanderie.js` (décor neuf : la buanderie aux rayons X, la machine qui essore, toi, la coupe sous le sol) — 0,42 M, 24 min ; ses « À changer ailleurs » `VIEW.reach` et `VIEW.under` appliqués dans `world.js` ;
- `src/model.js` (la chaîne de terre) : agent en cours au moment de la mise en file.

Étape suivante, dans l'ordre :
1. lire le message final de `model.js`, appliquer ses « À changer ailleurs » (journal `030-model.md`) ;
2. le décorateur (`src/habillage.js`, buanderie seulement ; `docs/recette-decorateur.md`) ;
3. la planche des candidates de la première image : (a) = `POSE0` actuel, reach 0,3 ; (a′) `{ tx: 18, ty: 44, tz: 46, d: 270, az: -40, el: 1, fov: 46, shift: 70, side: -30, roll: 0, drift: 0, dof: 0 }`, reach 0,4 (préférée par le décor) — choisir, coller dans `world.js` (`POSE0`, `FIRST`, `STAGED`) ;
4. quatre actes, deux agents à la fois (acte1 + acte2, puis acte3 + fin) ;
5. sons de l'architecte posés sur un mot à déplacer dans `episode.json` → `sfx` : `impact` à `explode`, `impact` à `trigger`, `blip` à `verdict`, `rewind` à `rewind` ;
6. deux planches de 28, `check`, brouillon + `qa`, reprises, rendu, `qa`, `cover`, `phone`, envoi à Merwan.

Règle de jauge : deux agents à la fois au plus ; plus rien au-dessus de 90 % de fenêtre ou 95 % d'hebdo ; le 030 passe après 027, 028, 029.

## 22/10, ≈ 4 h 40 — mise à jour avant le réveil de 8 h 37
- `model.js` fini (0,44 M, 30 min) ; ses poses (`whole`, `exploded`, `bStub`, `bPlug`, `bTab`, nouvelle `bPlugSide`) et `cover.cam` appliquées ; `docs/030-actes-maj.md` écrit.
- **Première image choisie : (a′)** (planche lue : machine sur 65 % de la largeur, main sur le capot, carcasse signal), collée dans `world.js` (`POSE0`, `reach` 0,4 dans `FIRST` et `STAGED`).
- Étape suivante : 2 (le décorateur), puis 4 (actes 1 + 2, puis 3 + fin), 5 (sons sur un mot), 6.
- Limite d'usage atteinte à ≈ 4 h 40 : aucun agent en vol.

## 22/10, 8 h 40 — reprise (fenêtre 0 %, hebdo 86 %)
- Décorateur **sauté** (hebdo serré, la buanderie a déjà sa vie : sol mouillé, linge, gouttes ; l'image 0 est choisie).
- Sons faits par moi : la table « Le son » de `docs/030-actes.md` posée dans `sfx` (33 sons), les quatre sons sur un mot retirés ou déplacés (`s_chemin`, `s_apres`, `toloop`). `check` passe.
- Actes 1 et 2 lancés (agents `ac7a743f2e47a2194`, `a024f0fdecf03207c`). Ensuite : acte 3 + fin, puis relecture, brouillon, `qa`, rendu.
- 9 h : acte 2 fini (0,31 M, 10 min) ; acte 3 lancé (agent `a1407da969b9c7dfd`) ; hebdo 89 %.
- ≈ 9 h 10 : acte 1 fini (0,32 M, 15 min) ; fin lancée (agent `adbbe94f56e8ce824`). Ensuite : relecture (deux planches de 28), brouillon, qa.

## 22/10, ≈ 10 h — FINI
- Fin montée (0,34 M, 11 min) ; son « À changer ailleurs » (CSS de `#chip-anomalie`) non appliqué : la fin empile déjà les deux lignes.
- `main.js` : l'horloge se fige pendant les deux déclenchements (un 30 mA coupe en quelques centièmes : remarque de l'acte 3, pour les électriciens).
- Relecture sur deux planches de 28 ; brouillon + `qa` : aucune image parasite, voix 0 ms, −14,05 LUFS, aucun son sur un mot. Mouvement le plus heurté (16,7 s, la montée des pieds à la main) remplacé par une coupe et une poussée lente.
- Rendu : `renders/030-prise-de-terre.mp4` (83,3 s), `qa` : aucune image parasite, voix 0 ms, −14,05 LUFS, crête vraie −1,3 dBTP ; plus vifs restants 15,0 s, 8,2 s, 38,0 s (≈ 22, des poussées voulues). Couverture (l'éclaté allumé), copie téléphone (SSIM 0,993). Envoyés à Merwan.
- Un cran en dessous : « que » à 6 s (≈ 0,4 s presque noire, le mur nu entre le tableau et toi) ; sous le sol (28–32 s) la boucle est fine ; la manette du différentiel petite sur « coupe » à 59 s ; le recul du like finit sur du noir.
- Coût : 7 agents (architecte, deux décors, quatre actes ; pas de décorateur), ≈ 2,57 M de jetons ; hebdo 73 → ≈ 90 %.

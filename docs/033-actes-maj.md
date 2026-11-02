# 033 · Ce que les décors ont changé (à lire avant d'écrire un acte)

- **Première image choisie** : candidate « a2 profil bas » — `POSE0` = { tx −2412, ty −10, tz 235, d 400, az 118, el −14, fov 44, shift 110 } ; `FIRST` : `shell` 0,35, `pull` 1, `stops` 0,25. La boucle revient exactement là.
- **Poignée** : la prise est maintenant à ≈ 109 cm du plancher (pivot (34, 150), levier incliné de 30° vers l'avant). `VIEW.handle` refait en conséquence.
- **Poses refaites** (`world.js` · `VIEW`) : `you` (az 108, d 560 — poser `pax` 0,35 le temps du plan), `tail`, `deep` (ty −16000, d 3000, `ahead` 0,02 pendant la plongée), `approach` (non vérifiée), `exploded`, `handleB` (poignée + arbre dans un cadre), `lapB` (az −55), `section` (d 720), `handle`, `edge` (d 200, sans optique).
- **Butées dans l'avion** (« encaissent ») : `{ ...P, ...CLOSE, tx: DX + 58, ty: DY + 82, tz: DZ - 18, d: 110, az: 150, el: 12 }` — non revue, à juger sur ta planche.
- **Voile brun** : dans la cabine, la caméra près du plafond ou des parois prend un voile brun-rose (verre du L03 empilé). Les plans à moins de ≈ 250 de la porte en vue cabine en sont pleins (candidates c et d) : préférer les poses basses, ou baisser `shell` / `cabin` le temps du plan.
- **Dehors est noir** : la couche de nuages du 023 n'est pas sous l'avion ; une plongée droite ne la traverse pas (non vérifié).
- `named` 1 et 2 s'allument peu (le panneau domine le cadre) : appuyer par le cadrage. La coupe (`section`) passe par les butées arrière.
- Le gouvernail du 023 a été neutralisé à l'encre (correctif non relu à l'image) : si un trait rouge ou vert apparaît sur la queue, le signaler.

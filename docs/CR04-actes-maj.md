# CR04 — ce que les décors ont changé (à lire avec docs/CR04-actes.md)

1. **POSE0 retenue** : `{ ...VIEW.roue, d: 60, ty: VIEW.roue.ty + 3 }` (candidate (a) reculée : basse, le long du rail vers les lumières de la ville au point de fuite, la chaîne rouge du frein à main et la roue au premier plan à droite). Planche : .cache/planches/CR04/image0c.jpg (« a60 ty+3 »). La roue tourne et la chaîne bouge dès l'image 1 ; la chaîne passe près de l'en-tête : la caméra ne monte pas au départ.
2. **Poses remplacées dans `VIEW`** (world.js) : `coupe`, `cylindre`, `cheminee`, `raccords` (locomotive ; `raccords` non vérifiée), `pente`, `rangee`, `courbe` (convoi), `frontenac` (ville, trois quarts haut). Autres poses de près et lumières : journaux docs/journal/CR04-locomotive.md, -convoi.md, -ville.md, section « Poses qui cadrent ».
3. **acte3 `toissue`** : pendant `derail` 0 → 1, faire avancer `run` de 24 050 à ≈ 26 100 (sinon le wagon VB traverse la locomotive 5).
4. **Les sept volants** ne se comptent pas en plan d'ensemble : plan rapproché `tete` du journal convoi (`lookFrom(L([150, 60, 150]), L([420, 12, 0]), { fov: 30, shift: 20 })`, `lit(L([380, 12, 0]), 220)`). `rangee` : caméra à ≥ 15° de l'axe.
5. **`pente`** : le train entier reste un trait fin à 270 px ; ce sont les flèches qui se lisent — ne pas y tenir une phrase entière sans les flèches.
6. **Ville** : `glow` lisible entre 0,4 et 0,6 (à 1, voile sur le haut du cadre) ; `courbe` met le lac sur la moitié basse ; `VIEW.roue` met les lumières au bord gauche.
7. **Locomotive** : le compresseur reste petit dans `coupe` et le levier du coupe-circuit se lit mal à 270 px : un plan rapproché plutôt qu'un large. Les bouffées `leak` se voient sur `file` et la pose E.
8. Images de près : roue sombre sur sombre hors du halo — garder `fx fy fz fs` sur le sujet de chaque plan.

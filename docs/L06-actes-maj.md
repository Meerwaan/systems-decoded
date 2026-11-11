# L06 — ce que les décors ont changé (à lire AVANT sa section de `docs/L06-actes.md`)

1. **Première image choisie : `hook1`** (sous la ligne, vers l'est, `tripRun` 0,14) = `POSE0` ; `FIRST` inchangé. La boucle finit sur cette pose.
2. **Cassure** : la Hongrie est COUPÉE (Szeged au Sud-Est). Bielefeld, Bechterdissen, Landesbergen, Dipperz, Grafenrheinfeld, Schwandorf sur la plaque Nord-Est ; Wehrendorf, Spexard, Elsen, Twistetal, Raitersaich à l'Ouest. `crack2` en tirets autour du pays de Mikulowa. Tracé schématique : jamais de gros plan sur la frontière exacte.
3. **Carte** : couches 0 / 70 / 140 / 215, dérive ×5 ; `shed` rend les prises NOIRES (pas veille) ; `lw` 1 = lueur signal ; `markRwe` / `markEon` affichent « 2 100 » / « 3 000 » sous le cadran.
4. **Terrain** : `emsCut` 0→1 puis 1→2 ; `tripRun` : éclair 0→0,12, noir 0,2→1 ; `wind` jamais animé vite ; sur `socketC`, baisser `lights` à ≈ 0,3.
5. **Établi** : le `clac` de profil demande `heroOpen: 1` ; `sync` seulement si `rotors` ≥ 2 ; `dep` : 8 drapeaux tombent, 2 restent.
6. **Poses neuves** dans `VIEW` : `dialC`, `heroFlags`, `reportOpen` (24 poses retouchées par les décors : lire `VIEW`, pas les chiffres du plan).
7. **Pièces 4 et 5** : `FILES_IN` false (cadres de texte, aucune photo téléchargée).
8. **Plans faibles connus** (à éviter ou tenir court) : `exploded` (un empilement), `under` (gabarit du paquebot en pointillé fin : essayer `emsCut` 0), `heroBreaker` (dalle sombre à gauche), `bars`, `plain` (éoliennes petites : d ≈ 70000), `cellsQ`, `mapWide`.
9. **Habillage** (`src/habillage.js`, Ems et quartier) : posé par le `decorateur` ; ne pas l'animer depuis un chapitre sauf repère donné dans son journal.

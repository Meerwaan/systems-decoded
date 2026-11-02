# 033 · Porte d'avion — journal de l'architecte

2026-10-30. Contrat du dossier 033 (court) : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix enregistrée (86,1 s, turbo) : rien touché dans `audio/`, ni `text` ni `vo`.

## Fait
- Lu : recettes (agents, actes, décorateur §2-3), `regles-image`, faits 033 (§3-5, §10) et contre-vérification (image, reste ouvert), le 025 (journal, `main.js`, haut et structure de `025-actes.md`), les API de `023/avion.js` (en-tête, `mount`, portes du fuselage : 1L à x −2420, y −92 → 96 ; plancher −100) et de `L03/cabine.js` (en-tête, porte 1L, `A.door` = ancre du panneau, `set` et non `update`), le câblage des deux dans leur `world.js`. Azimut vérifié dans `kit/lib/stage.js` l. 381 et sur planche.
- **Un seul monde pour tout le vol** : la cabine du L03 est posée DANS l'A330 du 023 (même orientation : nez −x, gauche +z ; `CABIN_AT` = porte 1L du 023, plancher −96). Sa demi-largeur (280) colle au fuselage (282 au milieu, 265 au plancher). D'où le recul « par la coque » de l'accroche, la plongée à travers le plancher et la remontée en mouvements continus, sans coupe.
- **L'air est calculé** : `alt` seul (mètres vrais) donne l'altitude de l'en-tête, la pression de chaque face (atmosphère type ; cabine montant à 2 440 m en croisière), le nombre des flèches, la charge sur les butées et « Sur la porte » (≈ 8,2 t à 11 300 m, 0 au sol, 0,3 à 200 m). Les actes ne peuvent pas contredire la voix.
- `src/plan.js` (sans import), `src/world.js` (SET VOL/BENCH, `FIRST` fermé : 30 nombres + 8 de lumière, `VIEW` 20 poses, `BENCHED`, `STAGED`, `benchPose`, `pOut`/`pCab`/`tonnesOf`/`airOf`), `src/main.js` (en-tête altitude + « Sur la porte »), bouchons `src/model.js` (volumes gris, API définitive, flèches, `tug`) et `src/vol.js` (vrais imports 023 + L03, figures grossières, enregistreur), squelettes d'actes qui construisent.
- `index.html` : `chip-toi`, `chip-coree` (Reconstitution · Corée · mai 2023), `chip-butees`, `chip-hypothese`, `chip-charge`, retitle (« Un verrou » → « L'air »), duel (« Je la prends » / « Jamais »), next 034 (titre classé, « Presque deux ans au fond de l'Atlantique. ») ; retirés : `#cta-field` (jamais la réponse tapée), `#film` (hors-série).
- `episode.json` : 51 repères ajoutés (62 en tout, vérifiés sur la table : aucun nom de beat, mots longs ou premiers dans leur beat), `sfx` refaite (35) **dans les souffles** mesurés mot à mot (les trois posés sur un mot par le modèle déplacés : l'impact de l'éclaté à 19,92 avant « on », le blip du verdict à 60,39 avant « C'est l'air », le rewind après « où… ») ; `cover` provisoire (éclaté, el 28) ; deux lignes de `sources` (ce que l'image reconstitue, le nombre de butées).
- `npm run check -- 033` passe (0 erreur, 1 avertissement : canvas au bord).

## Planches (16 images lues sur 25)
1. `p1.jpg` (8) — conventions : depuis la cabine az 145-150 on voit bien la face cabine de la porte et le voisin de dos ; dehors az −38 le flanc gauche, la cabine du L03 tient dans le fuselage ; l'établi tourné de π montre la face cabine éclairée ; la section à az 90 met la cabine à gauche, la nuit à droite, flèches veille/encre lisibles ; le mur de flèches se lit ; à 200 m le train sort et la porte s'ouvre vers l'extérieur.
2. `p2.jpg` (8) — candidates et poses restantes : (a) tient, la porte trop sombre ; (b) grande porte, pas de vide visible ; (c) plongeante, les pieds du voisin ; (d) la poignée bouchon trop loin des mains. `deep` : les courbes de l'île, sans lumière ; `you` : **noyé dans les passagers de verre du premier rang** ; `tail` : la queue en traits signal (gouvernes du 023 à `surf` 0).

## Poses provisoires (réglées sur bouchons — à recaler par le chef de production d'après les journaux des décors)
**Toutes** celles de `VIEW` et `POSE0` sont provisoires. Les plus fragiles : `POSE0`/`hook` (la face cabine à contre-jour), `you` (les passagers du L03), `deep` (rien de lumineux en bas), `tail`, `approach` (la piste pas encore dans le cadre : `ahead` à régler), `handleB`/`hooksB`/`lapB`/`stopB` (cotes du bouchon). `section` et `exploded` cadrent déjà.

## Décisions
- Deux décors, deux agents : `model.js` (le système, neuf) et `vol.js` (une enveloppe 023 + L03). L'habillage du 023 vient avec `buildAvion`, celui du L03 avec `dressCabine` : un décorateur n'est utile que pour le calme de la cabine et la piste de Corée — à décider sur les planches des décors.
- Porte 1L (le `voir`), pas 1R, malgré le contre-jour de la face cabine : le modèle porte sa propre lumière d'appoint. L'établi tourne la porte de π pour l'éclairer ; `benchPose` garde le raccord.
- En-tête : l'altitude en grand (la voix donne des hauteurs, pas d'heure), « Sur la porte » en second — les deux sourcés/calculés, aucun autre chiffre à l'écran.
- `tug` ajouté pour « la poignée, presque rien » (une flèche signal contre le mur d'air) ; le hublot de la porte ajouté au plan (reconnaissance en un tiers de seconde).
- La Corée se montre deux fois : à l'accroche (dehors, 200 m, la porte qui s'entrouvre) et au commentaire (dedans, le levier) ; les deux étiquetées « Reconstitution ».

## À changer ailleurs
Voir `docs/033-a-changer-ailleurs.md` (option `--words` de `script`, fiches catalogue, neutre du 023, porte 1L du L03).

# 032 · Barre anti-panique — journal de l'architecte

2026-10-30. Contrat du dossier 032 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle : **88,8 s** (turbo), rien touché dans `audio/` ni dans les beats.

## Fait
- Lu : catalogue (aucun lieu public avec issue de secours et foule : 006/hall ancien moteur sans porte, 017/suite porte d'IRM, 028/foyer appartement → un décor neuf pour la salle), recettes (agents, actes, décorateur « Où il entre / Ce qu'il reçoit »), règles d'image, faits 032 et contre-vérification (« À ne pas dire »), le modèle 025 (journal, décors, actes, world, main, index), l'API de `L03/cabine.js` et `L03/habillage.js`, `figure.js`, `blocks.js` (benchCut, followCall, duelCall). Azimut vérifié dans `kit/lib/stage.js` l. 381 et sur planche : az 0 dans la salle (+z), −90 côté serrure (−x).
- `src/plan.js` : origine au sol au milieu du seuil, mur en z = 0 ; +z la salle, −z dehors ; −x côté serrure. Porte 100 × 210 ; barre 72 cm à y 96 ; bras, chape, boîtier d'extrémité, pêne (sortie −53 / rentré −48), gâche sur le dormant, ressort ; `BENCHAT` [−4, 66, 0] (la tranche de battant y 66 → 126 se pose sur l'établi) ; escalier de 1883 (16 marches, palier 70, deux murs), `AJAR` 24°, enfants à 0,72 ; `PLANE` (cabine du L03).
- **Le battant porte le système** : `salle.A.leaf` (coordonnées « porte fermée ») reçoit `system.root`, `salle.A.frame` reçoit `system.fixed` (la gâche). Même porte en 1883 au même endroit, paumelles retournées (ouverture vers l'escalier) : `era`, changé sur une coupe.
- `src/world.js` : SET BENCH / SALLE / AVION ; `FIRST` fermé (39 nombres dont 8 de lumière) ; `STAGED`, `BENCHED`, `PAST` (1883), `FLIGHT` (l'avion) ; `VIEW` 22 poses ; `LOOK` dof 8 aux seuls gros plans (`CLOSE`), air 0.
- Bouchons : `model.js` (volumes gris, API définitive `{ root, fixed, A, parts, update }`), `salle.js` (mur, dormant, battant sur paumelles, arcs, pictogramme, escalier, verrou, toi et 12 figures). **`avion.js` est fini** : il importe `buildCabine` et `dressCabine` du L03 sans les toucher, cabine en croisière, le PNC la main sur le levier de la porte 1L (`arm` 0,5 tenu : L03 ne dessine la main que entre les deux butées), `tug` = un tremblement d'un degré — rien ne s'ouvre, aucune flèche ni tonne.
- `src/main.js` : chrono T+ illustratif (0 → 6,4 s à `tobench`, tenu, reprend à `torejoue`, s'arrête à 9,8 s sur « dehors ») ; « 16 juin 1883 » en 1883 ; second compteur « Porte » lu dans l'état : Fermée / Libre / Ouverte / Verrou.
- Squelettes d'actes (construisent, à réécrire). `index.html` : `chip-coince`, `chip-1883`, `chip-183`, `chip-libre`, `chip-50` (« Vers la sortie », jamais « barre obligatoire »), retitle « Le calme » → « La panique », `#duel` Barre / Poignée (encre toutes deux), `#next` 033 sans chiffre.
- `episode.json` : 94 repères vérifiés sur la table (`zero:183`, `reponse:s'enfonce`, `chute:n'importe`, `abo:d'avion` se résolvent) ; `sfx` refait : 39 sons, chacun dans un souffle lu sur la table des écarts (trois déplacés hors des mots : `poitrine`, `bras`, `coince`) ; le `impact` sur `explode` (« on ») et le blip sur « panique » sortis des mots ; `cover` à `cadre` (el 30, shift −520 : provisoire, l'agent du système la règle) ; 3 lignes de `sources` (chrono illustratif, barre générique, cabine du L03).
- `npm run check -- 032` passe.

## Planches (20 images lues sur 25)
1. Bouchons, 8 : conventions justes (côté serrure à gauche depuis la salle, arc « vers toi » côté caméra) ; (a) la foule masque la porte, (b) se lit, (c) ne montre pas la porte, éclaté trop serré (d 250 : 75 cm de large visibles).
2. 8 : établi à az −55 / d 330 se lit (`VIEW.whole`), éclaté à az −62 / d 380 (le long de la barre), entonnoir corrigé (porte et pictogramme en haut), avion à az 110 / d 320 (la main sur le levier, l'oculus) ; le mur de verre vu de profil fait une dalle blanche (à proscrire, noté pour `salle.js`).
3. 4 instants du film sur squelettes : en-tête, 1883, annonce : tout tourne.

## Décisions
- Deux décors neufs (le système, la salle avec ses deux époques) ; l'escalier de 1883 n'est pas un fichier à part : c'est la même porte au même endroit (le `voir` le demande, et le raccord `tozero` / `torejoue` se fait en place).
- Pas d'en-tête chiffré de force ni de cote : « Porte » est un état, pas un nombre.
- L'éclaté se regarde le long de la barre : un système long et fin dans un cadre vertical se lit en profondeur, pas en travers.

## Poses provisoires (réglées sur bouchons — à recaler par le chef de production)
`POSE0` (candidate a), `VIEW.outside`, `under`, `bar`, `door`, `chest`, `hip`, `system`, `latch`, `outflow`, `stairTop`, `stairDoor`, `bolt`, `above1883`, `barBench`, `boxBench`, `jamBench`, `cover.cam`. Vues et tenues sur bouchons : `whole`, `exploded`, `crowd`, `plane`.

## À changer ailleurs
- Voir `docs/032-a-changer-ailleurs.md`.
- Pour l'orchestrateur : pas de décorateur sur `avion.js` (la cabine du L03 garde son habillage, déjà importé) ; le décorateur ne touche que `salle.js` (aujourd'hui : rien de domestique — un extincteur au mur, un plan d'évacuation SANS texte, des luminaires de secours éteints ; rien devant la porte ni sur toi).

# 031 · Anti-collision (TCAS) — journal de l'architecte

2026-10-30. Contrat du dossier 031 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle 93,5 s (rien touché dans `audio/`, ni `text` ni `vo`).

## Fait
- Lu : catalogue (Aviation, Ciel, Effets), recettes agents / actes (grille) / décorateur (entrée), règles d'image, faits 031 (mécanisme, « à ne pas dire ») et contre-vérification, modèle 025 (journal, world, main, index, têtes des plans), API de `023/avion.js` (en-tête, `update`, structure du groupe, île, habillage), convention d'azimut de `kit/lib/stage.js` (caméra = cible + d·(sin az·cos el, sin el, cos az·cos el)).
- `src/plan.js` (sans import) : repère de TON avion (023 : nez −x, gauche +z), `PLANE`, `SLEEPER`, `DECK`, `SCREENS`, `ANT`, `BAY`, `OTHER` (centre = x0 − gap·100), `WAVES`, `SYSTEM` (46), `RIG` (l'établi en maquette, le peer à gauche), `TCAS` (48 / 35 / 5 / 1 500). Maquette : aucune longueur affichée.
- `src/world.js` : SET SKY / BENCH ; deux `buildAvion` du 023 importés tels quels et enveloppés (île cachée sauf la couche de nuages ; l'autre sans son monde, demi-tour ; `quieten` : gouvernes du 023 remises à l'encre après chaque update, trouvées par leur couleur) ; `rig()` monte poste, écrans ×2 et antennes ×2 sur le `plane` de chaque avion ; `FIRST` (40 nombres + 8 de lumière), `POSE0` provisoire (candidate A), `VIEW` (21 poses), `otherPos`, `atHim`, `BENCHED`, `STAGED`, `LOOK` (dof 8 sur `CLOSE` seulement).
- Bouchons à l'API définitive : `tcas.js` (`buildTcas`, `buildScreens`, `buildAntenna`), `cockpit.js` (`buildCockpit`, `buildOndes`). `model.js` du modèle supprimé.
- `src/main.js` : en-tête = `tau` (secondes avant le point le plus proche) et « Pour obéir » = `obey` (5 s, « — » sans ordre).
- `index.html` : `#orders` (deux ordres), chips 1030 / 1090 / cœur / monte / descends / 1500 / toi / lui, `#retitle` (Toi → Deux machines), `#piece` (profil 2002, deux traces qui convergent), `#duel` (J'obéis / J'hésite, deux tons encre), `#net`, `#next` (032, « 1883 · Une porte bloquée. »). `#cta-field` et `#film` retirés.
- `episode.json` : 54 repères vérifiés sur la table (`scene:cinq#2` : « cinq » attrapait « 35 ») ; `cover` (eclate$, pose de l'éclaté) ; `sfx` : sons du scénariste déplacés hors des mots (explode 22,40, trigger 54,08, verdict 63,35, rewind 92,10) + blips (21,04, 36,58, 48,30), hit 11,14, clicks dans les souffles de la scène et de l'éclaté ; trois lignes de `sources` (maquette, en-tête, symboles et ondes).
- Actes : quatre squelettes qui construisent. `npm run check -- 031` passe.

## Planches (22 images lues sur 25)
1. `b1` (8) : premier jet des poses — hook, profile, chase vides (le cadre vertical ne fait que 17° de large à fov 30 : il faut des distances ×3).
2. `b2` (8) : l'autre de face se lit tout de suite ; `chase` (derrière ta dérive) est la plus forte ; `pair` empile bien les deux avions ; `profile` de côté = deux avions minuscules (à éviter) ; les gouvernes ne sont plus vertes.
3. `b3` (6) : candidates A, A2, B, C ; manche tiré ; `hisNd` (az −102) tombe bien sur son écran → convention vérifiée des deux côtés.

## Poses provisoires (réglées sur bouchons, à recaler par le chef de production après les décors)
- `POSE0` (A : ton nez sort du cadre sur bouchon → `shift` −300 à essayer), `VIEW.shoulder`, `nd`, `vsi`, `stick`, `hisNd`, `fuselage`, `chase`, `pair`, `cabin` : bonnes à ±20 % sur bouchons.
- `VIEW.profile` : faible par construction (deux avions de profil, 15 % de large chacun) — gardé pour l'onde du sol seulement.
- Toutes les poses de l'établi (`whole`, `exploded`, `cpuBench`, `antBench`, `ndBench`, `peerBench`) : à refaire sur le vrai `tcas.js` (le bouchon est petit dans le cadre, le peer hors champ).
- `FIRST.gap` 320 / `ping` 1 : à aligner sur la candidate gagnante.

## Décisions
- Le système s'ouvre sur l'établi (les pièces font 20–40 cm dans un avion de 59 m) ; le raccord de la coupe est l'écran rouge (même azimut −40 que `VIEW.fuselage`).
- L'autre avion = le même A330 (aucune compagnie). Rencontre de face, au même niveau, sur ta route : il passe exactement sous toi.
- Cercle de l'alerte en signal (pas d'ambre dans la palette) : c'est la forme qui change ; `sources` le dit.
- La pièce de 2002 est un profil schématique en HTML (pas de carte du lac dessinée à la main : ce serait inventé) ; deux traces qui descendent, coupées avant le contact.
- Le `voir` d'`abo` (une porte de secours en 3D) n'est pas tenu : ce serait un troisième décor ; le panneau `#next` le porte.
- Le contrôleur au sol : un front signal qui monte de sous les nuages (`atc`), jamais un personnage.

## À changer ailleurs
Voir `docs/031-a-changer-ailleurs.md`.

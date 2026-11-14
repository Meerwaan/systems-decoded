# 051 · Le brise-glace — journal de l'architecte

2026-11-13/14. Contrat du dossier 051 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes.

## Fait
- Lu : catalogue (rien de glace de mer ni de brise-glace ; **la voiture du 011 ne sert pas : le sujet est le navire brise-glace, pas le marteau de secours**), recettes (agents, actes, décorateur : entrée et réception), règles d'image, faits 051 et contre-vérification (« à ne pas dire »), champs `voir`, le modèle 025 (journal, décors, actes, plan, world), l'API de `kit/lib/blocks.js` (banc, `benchCut`) et `build3d.js`. Convention d'azimut vérifiée dans `kit/lib/stage.js` (caméra en t + d·(sin az·cos el, sin el, cos az·cos el)) : az 0 derrière (+z), −90 bâbord (−x).
- `src/plan.js` (sans import) : origine à la flottaison au milieu du brise-glace, étrave −z, bâbord −x ; `SHIP`, `STEM` (20° sur la zone de glace, et l'étrave « presque droite » à 82° au même point), `BELT`, `TANKS`, `DECKHOUSE`, `PROPS`, `PUSH`, `ICE`, `CONTACT`, `PATCH`, `RIDGE`, `SHOK`, `APART`, `FIELD`, `WIND`, `HELI`, `BENCH_FLOOR`, `SIZE` 6 000.
- **Un nombre, deux repères** : le brise-glace ne bouge jamais, la glace glisse de `+run·100` en z ; `heel` roule le navire (groupe de `world.js`). Sur l'établi le sol est descendu à la quille : mêmes coordonnées sur les deux décors, `benchCut` sans décalage.
- `src/world.js` : `SET` (BENCH, ICE), `FIRST` fermé (34 nombres + 8 de lumière), `POSE0` (provisoire, candidate a), `VIEW` (17 poses), `BENCHED`, `STAGED`, `shokAt(apart, run)`, `apply`, `LOOK` { dof 6 } avec `CLOSE` sur belt / tanks / stem / principle. Brume : `0.5 / max(d·12, 150 000)`.
- Bouchons gris : `model.js` (`buildShip`), `glace.js` (`buildGlace`), `banquise.js` (`buildBanquise`), API définitive.
- `src/main.js` : chrono « Déc. 2013 » → « T+0 → T+15 s » (gîte de l'Oden, de `rollFrom` à `rollTo`) → « Déc. 2013 » → « Janv. 2014 » ; compteur « Distance 11 km » (≈ 6 milles, fixe) ; `chip-jours-v` lu sur `days`. `acte2b.js` importé.
- Actes : squelettes qui construisent (acte1, acte2, acte2b, acte3, fin), à réécrire en entier.
- `index.html` : chips navire, brise (Xuelong), mètre, distance, cœur, vingt, oden, vent, jours ; `#gauge` (jauge du principe) ; retitle « Tape la glace » → « Pèse dessus » ; duel « Le brise-glace / L'hélico » ; `#next` 052 avec un pictogramme SVG du télésiège (`#next-pic`) ; `#film` et `#cta-field` retirés (inutiles).
- `episode.json` : 60 repères ajoutés (70 en tout), tous vérifiés sur la table ; `sfx` : impact de `trigger` déplacé après « casse » (`reponse$+0.02`), impact du verdict après « glace » (`chute:Il-0.25`), `sig-boucle` à `boucle$+0.02`, riser raccourci dans le souffle (`repos$` → `zero-0.02`), 16 `hit` / `click` posés dans les souffles (grille provisoire : le monteur-son la refait) ; `cover.cam` à l'échelle du navire (`el` 28) ; trois lignes de `sources` (ce que l'image reconstitue, les libertés d'échelle, l'en-tête). Ni `text` ni `vo` touchés, rien dans `audio/`.
- `npm run check -- 051` passe (3 avertissements de contraste sur les actes de l'en-tête, dus au plan gris du bouchon).

## Planches (21 images lues sur 25)
1. 8 bouchons : la coque n'était pas pleine (faces retournées par une échelle négative) ; la carte (15 km) noire : mer et pack à 13 cm l'un de l'autre se battent à cette distance → écrit pour `banquise.js`.
2-3. Coque corrigée (`rotateY(−π/2)`, sans échelle négative) ; vue `high` : l'avant part bien vers −z, la caméra à az −40 est sur l'arrière-bâbord.
4. Avec l'en-tête : « Déc. 2013 », « Distance 11 km » lisibles ; `whole` / `exploded` reculés (30 000 / 36 000) : le navire de 116 m déborde encore à droite à az −128 — l'agent de `model.js` cherche l'azimut où il tient.

## Poses provisoires (réglées sur bouchons — à recaler par le chef de production d'après les journaux des décors)
Toutes celles de `VIEW` et `POSE0`. Les plus fragiles : `POSE0` (le brise-glace à 1,2 km : est-il ≥ 12 % de la largeur ?), `whole` / `exploded` / `quarter` (le navire long dans un cadre vertical), `top` (15 km : lisibilité du pack), `principle` et `bowSide` (l'échelle de la plaque à 270 px), `section`.

## Décisions
- Trois décors : `model.js` (le brise-glace plein), `glace.js` (la mécanique de la rupture, le fichier du principe), `banquise.js` (le lieu et la carte). Aucun décor existant importé : le savoir-faire est copié (skin du L04 / 038, mer du 015, plaque du 029, fissures du L01, hélicoptère du L04).
- Un seul modèle de brise-glace pour le Xuelong (acte 1) et l'Oden (acte 3) : les étiquettes disent lequel (la contre-vérification exige qu'on ne confonde pas les deux).
- Acte 2 coupé en deux (`acte2.js` éclaté + principe, `acte2b.js` le repos en glace plate) : le principe porte la démonstration la plus dure, il garde son agent.
- `voir` non tenus à la lettre : « un point d'interrogation sur ce qui l'entoure » (promesse) n'est pas dessiné (la question est dans les sous-titres) ; « une cote affichée » d'un mètre devient `chip-metre` ; le télésiège de l'annonce est un pictogramme SVG dans le panneau `#next`, pas un décor 3D.

## À changer ailleurs
- `docs/catalogue.md` (par `npm run catalogue` après les décors) : trois fiches 051 (`model.js`, `glace.js`, `banquise.js`) — la banquise et la glace qui plie serviront à tout sujet polaire.
- Décorateur : `banquise.js` seulement — icebergs tabulaires sur l'horizon, neige soufflée au ras du pack (traînées, jamais de points), traces de glace de mer ancienne ; rien sur le brise-glace ni devant lui, rien dans le chenal.
- Les sons du sujet (`episode.json` → `sons`, 051-glace-fend, -coque-glace, -blocs-glace, -ballast-eau, -helice-effort) ne sont pas dans `kit/sons/` à l'heure de l'architecte : si `npm run sons -- 051` n'a pas tourné, le monteur-son le saura.
- Après les décors : `docs/051-actes-maj.md` (poses vues), `POSE0` collé dans `world.js`.

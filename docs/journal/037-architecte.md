# 037 · Le parachute de secours — journal de l'architecte

2026-11-04. Contrat du dossier 037 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle : 87,1 s (rien touché dans `audio/`, ni `text` ni `vo`).

## Fait
- Lu : catalogue (ciel 026, figure, `makeStreaks`, avions), recettes (agents, actes, décorateur : où il entre, ce qu'il reçoit), règles d'image, faits 037 (scène, mécanisme, chiffres, « à ne pas dire ») et contre-vérification (grep), le journal de l'architecte du 036 et son `world.js` / `main.js` / `index.html` (plus récents que le 025, même modèle), l'API de `026/sky.js` (`buildSky`, `makeLanding`, steppe), `makeFigure`, `benchCut`, l'azimut du plateau.
- **Réutilisation** : `kit/lib/figure.js` tel quel ; le dôme du 026 **pas importable** (son `buildSky` amène la steppe, le parachute rond et la fusée, et son sol se dessine dans le dôme : un damier par-dessus se battrait avec lui) → `ciel.js` le recopie et remplace la steppe par la campagne ; la voile du 026 (`makeChute`) recopiée en aile rectangulaire dans `sauteur.js`. Aucun décor existant ne porte un corps en chute ni un conteneur.
- **Découpage** (le système + deux décors neufs) : `model.js` (le conteneur plein, rabats, boucle, goupille, extracteur comprimé, sac, boîtier, unité de contrôle et diode, câbles, coupe-boucle et piston) · `sauteur.js` (le corps de verre inerte, harnais, poignée, main, extracteur en vol, voile de secours, posé au sol, le second sauteur) · `ciel.js` (dôme, campagne en damier à `alt`, air, nappes de pression, fenêtre de 225 m, champ et herbe près du sol).
- `plan.js` : origine = la plaque dorsale du conteneur ; repère du sauteur = repère de la scène à `spin`/`tilt`/`hang` 0 = repère de l'établi (le cut « on l'ouvre » raccorde sur place : vérifié, planche 1, images 6 et 7 identiques). Altitudes et vitesses sourcées (`ALT`, `SPEED`).
- `world.js` : `FIRST` 43 nombres (`alt, vz, sky, threat, strata, gate` · `body, shell, spin, tilt, hang, land, hand, deploy, twin` · `explode, flaps, loop, piston, section, power, wake, test, press, rate, fabric, solo, heart, litFlap, litUnit, litSensor, litCable, litCutter, litLoop` · `fx, fy, fz, fs, mood, gel, pool, grid` + `set`). Aucun nom de propriété GSAP (`window` → `gate`). Aides : `kmh`, `fallen`, `turnsOver`.
- `main.js` : en-tête = ALTITUDE (`alt`, signal sous 225 m en chute) + CHUTE en km/h (`vz` × 3,6 arrondi à 10 : 200 ; signal > 35 m/s, veille sous voile, ink à l'arrêt). Lisible sur planche 2 (« 1 328 m · 200 KM/H », « 218 m » signal, « 20 KM/H » veille). `far` 600 000.
- Actes : cinq fichiers, squelettes qui construisent — `acte2.js` (on l'ouvre + éclaté, 9,2 s) et `acte2b.js` (principe + repos, 18,1 s, 7 phrases) comme au 036.
- `index.html` : la ligne d'opacité 0 remise (`.chip--live, #retitle, #net, #next, #cta-field, #duel, #film, .rail`), « Altitude » devant la grande lecture, « Chute » pour la seconde ; étiquettes allumé / éteint / poignée / cœur / seuil / zéro / fenêtre / sol / France ; titre barré « Il ouvre ton parachute » → « Il coupe un fil » ; duel « Le boîtier » / « Ta main » (aucun des deux en couleur : le film ne répond pas) ; prochain dossier 038, son fait sans chiffre.
- `episode.json` : 51 repères vérifiés sur la table (`trente5` attrape bien « 35 » à 37,48, `gate1` « 225 » à 45,64, `coupe1` « coupe-boucle ») ; `explode` déplacé de « on » à « l'ouvre » (20,24, comme au 036) ; 36 sons dans les souffles — l'impact du climax déplacé de `trigger` (sur « tranchée ») à `tranche+0.40` (56,84), le blip du verdict de « pas » (sur un mot) à `inconscient2+0.50` (64,08) ; `ambience` « wind » qui suit la chute ; `rewind` sous la boucle (comme 025, 036) ; deux lignes de `sources` (l'en-tête, ce que l'image reconstitue) ; `cover` provisoire.
- `npm run check -- 037` passe (1 avertissement : contenu au bord, bouchons).

## Planches (24 images lues sur 25)
1. Bouchons, 8 : conventions ✓ (az −90 : tête à droite ; `tilt` 55 : tête en bas ; sac sur le dos ; `VIEW.back` scène = établi) ; candidates trop petites, `back` trop serré.
2. 8, avec l'en-tête : en-tête lisible ; `handle` dans le bras (trop près) ; `twin` côte à côte ne tient pas dans un cadre vertical → second sauteur **au-dessus** (TWIN [180, 260, −240]) ; la fenêtre se lit de loin ; le corps couché sous le plan du sol au repère « landed » (attendu : `land` est au décor).
3. 8 : candidates resserrées (a : corps ≈ 50 %, sac et diode lisibles, damier derrière) ; `back` d 170 ✓ ; `handle` d 300.

## Poses provisoires (réglées sur bouchons) — à recaler par le chef de production
Toutes celles de `VIEW` et `POSE0` : `dive`(=POSE0), `side`, `under`, `headdown`, `rig`, `back`, `handle`, `whole`, `exploded`, `unit`, `cutter`, `heart`, `twin` (non revue après le déplacement), `ground`, `gateWide`, `cross` (non vue), `open`, `hanging` (non vue), `landed`. Le `cover` d'`episode.json` aussi. Les journaux des décors donneront les bonnes.

## Décisions
- Le prochain dossier n'a pas d'objet 3D (le `voir` d'`abo` voulait un sous-marin aux rayons X : un modèle de plus pour 6 s).
- « Dans l'avion, il compte la montée » : pas d'avion, le sac monte au-dessus d'un sol qui s'éloigne et l'en-tête compte (4 000 m, cas de 2018).
- « Le pouce appuie sur le bouton » (comment) : pas de main seule (règle) : l'auto-test se lit sur l'écran et la diode.
- Le principe « deux silhouettes côte à côte » → l'une au-dessus de l'autre (cadre vertical), le seuil dit par `chip-seuil`.

## À changer ailleurs
- `kit/template/index.html` : la ligne d'opacité 0 des étiquettes manque toujours (remise à la main au 036 et au 037).
- `scripts/sd.mjs` (`script`) : une option `--words` (table mot à mot) — je l'ai tirée de `gen/episode.data.js` (`window.__EPISODE.beats[].words[].{t,s,e}`).
- `kit/lib/` : le dôme de ciel est recopié une 4ᵉ fois (007 → 026 → 029 → 037) et `makeStreaks` une 7ᵉ → `kit/lib/ciel.js` (catalogue, « Recommandations » 6 et 7).
- Décorateur (après les décors) : `ciel.js` seulement, s'il en faut — un autre avion de largage très loin, une route avec une voiture qui roule, un clocher ; rien entre la caméra et le corps, rien sur le sac.

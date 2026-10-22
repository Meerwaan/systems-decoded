# 026 · Soyouz MS-10 — journal du décorateur (`src/habillage.js`)

2026-10-21. Propriétaire : `episodes/026-soyouz-ms10/src/habillage.js`, plus trois lignes d'accroche dans `launcher.js` (import, `pad.add(dress.group)`, `dress.update(P, time, px)` dans le bloc du pas de tir) et trois dans `sky.js` (import, `landing.ground.add(dress.ground); group.add(dress.group)`, `dress.update(P, time, px)`). Rien dans `model.js`, `world.js`, les actes, `index.html`, `episode.json`. Consigne : `docs/recette-decorateur.md`, `docs/recette-agents.md`. Budget : 24 images lues. Planches, `essais.json` et sondes : `scratchpad/026/habillage/` (dossier temporaire de la session), jamais dans `renders/`.

## Lu
Les deux recettes, `docs/026-actes.md`, `docs/026-actes-maj.md` (prime), `world.js`, `plan.js`, journaux `026-launcher.md`, `026-sky.md`, `026-model.md`, `kit/lib/details.js`, `sky.js` (en entier), le pas de tir de `launcher.js`, la pose de caméra de `kit/lib/stage.js`, l'habillage et le journal du 023 (le voisin : le ciel), les faits 026 (lieu et heure de l'atterrissage, secours), `#next` dans `brand.css`.

## Ce que disent les faits pour l'habillage
- **Le pas de tir est de nuit dans le film, et c'est juste** : MS-10 est resté deux jours sur le pas avant son départ (le plan « avant le décollage » n'est pas l'instant du lancement) ; MS-12 est parti à 19:14 UTC, soit 1 h 14 du matin à Baïkonour.
- **L'atterrissage, lui, s'est fait de jour** (08:59 UTC, ≈ 15 h à Djezkazgan) : rien qui dise « la nuit » au-dessus de la steppe posée (pas d'étoiles, pas de lumières). Le noir y est le style du compte, pas une heure.
- Les secours (hélicoptères) ont décollé en quelques minutes : vrai, mais dans `VIEW.ground` le ciel passe sous l'en-tête — rien à y poser.

## Planche avant (8 images : la pièce, le pas de tir large, MS-12 dedans, MS-12 qui part, la poussée, Vivant, le teaser à 0,5 et à 1)
- Pas de tir (large, départ) : une fusée de traits sur une grille ; ciel noir plat ; l'horizon à y ≈ 640 (zone haute) ; rien ne dit la nuit ni Baïkonour.
- La pièce, dedans : pleins, rien à y mettre (et rien ne doit apparaître derrière la pièce).
- La steppe (poussée, Vivant) : sol noir et sa grille, sans échelle ni matière ; l'horizon à y ≈ 330, sous l'en-tête : tout se joue au sol, autour du module.
- Le teaser : un trait et un point à gauche, le module à droite, tout le reste est noir ; le panneau `#next` (fond à 86 %) couvre y ≈ 442–780 : des étoiles n'y paieraient pas.

## Touches posées (toutes en encre, aux rayons X, loin ou au sol)

| touche | raison | suit | où elle se voit |
| --- | --- | --- | --- |
| **Les touffes de la steppe** : herbe à plumes (8 à 14 brins arqués, 28 à 58 cm) et armoise (coussin de tiges fourchues, 16 à 26 cm), ≈ 640, de 2,6 à 35 m du module, plus sombres au loin | la steppe semi-désertique près de Djezkazgan en octobre ; elles donnent sa taille au module posé | `alt` (dessinées sous 12 m : `1 − smooth(0,006 ; 0,012 ; alt)`), `retro` (les plus proches, à moins de 5,2 m, s'éclairent × 2 au plus pendant la dernière poussée) | poussée et Vivant (de part et d'autre du module, et assourdies sous les mots) ; teaser (premier plan) |
| **Les projecteurs du pas de tir** : deux tours d'éclairage (trois montants effilés, croisillons à peine visibles, 33 et 35 m), à 130–140 m derrière la fusée, une rampe de 2 × 3 lampes tournée vers elle | la nuit au pas de tir, la fusée attend sous ses projecteurs | `pad` | pas de tir large et départ de MS-12 : x ≈ 240 et 860, lampes vers y ≈ 520, hors de la silhouette |
| **Le cosmodrome au loin** : lumières des routes et des bâtiments de 450 m à 1,4 km (`nightLights`), fixes, 3 à 5,5 px | Baïkonour est un champ de pas de tir dans la steppe, pas une tour dans le noir | `pad` | bande sous l'horizon du pas de tir (y ≈ 650–830) |
| **La nuit** : ≈ 2 600 étoiles à l'infini, fixes, 2,6 à 5 px, effacées près de l'horizon | la nuit du pas de tir (MS-12 est parti à 1 h 14) | `pad` (elles vivent dans le groupe du pas de tir : jamais au-dessus de la steppe posée ni dans le ciel du vol) | pas de tir, montée de MS-12 |
| **Les montagnes du teaser** : deux crêtes lointaines (≈ 8 et 13 km, 2 à 3,5° au-dessus de l'horizon), sommets décalés pour la profondeur, qui s'effacent avant le module | « en pleine descente » : la route du 027 descend d'une montagne | `truck` (`smooth(0 ; 0,06 ; truck)`) | teaser, au-dessus de la route, sous le panneau |

## Essais et reprises
- **Rien dans la première image** : sonde numérique (`probe.mjs` : chaque plan dessiné avec et sans mes groupes, pixels comparés) — image 0 : **0 pixel changé**. Au pas de tir, la bande de l'en-tête (236–410) ne gagne que 14 pixels (des étoiles), +0,02 de luminance moyenne.
- 1er jet des touffes : 0 pixel changé au sol. Mon cône d'exclusion (± 14°) était plus large que le cadre (± 9,8° en portrait) → remplacé par un test **à l'écran**, avec la caméra exacte du plateau pour `VIEW.ground` et `VIEW.night` (copiées dans `habillage.js`) : refus si la touffe touche la boîte du module (+ 40 px), la route du teaser, ou fait plus de 150 px de haut ; **assourdie à 40 %** si elle tombe dans la bande des sous-titres (x 80–900, y 1230–1500). Refusées là, elles vidaient le seul sol visible de « Vivant » (le module remplit le cadre) ; pleines, elles chargeaient le texte.
- 1er jet des montagnes : invisibles — posées à 2,9 et 4,6 km, au-delà du plan lointain (1,6 km). Chaque crête est maintenant construite à 1,5 km et réduite d'autant (comme le teaser de `sky.js`) : mêmes angles vus du module.
- Projecteurs : d'abord une rampe encadrée de 3 lampes faibles → on lisait des lampadaires portant un panneau. Cadre retiré, 2 × 3 lampes (`glow` 560 cm, k 0,72) : on lit des projecteurs de stade.
- Teaser : la caméra y est à 1,08 m ; de 12 à 25 m, les touffes s'écrasaient en une haie dense juste sous la route. Toute la moitié gauche sous la route est tenue propre (x 0–560, y 990–1240) : sonde, 0 pixel changé dans cette bande.
- Lumière de la poussée sur les touffes proches : × 2,6 faisait fleurir un halo au bas du cadre → × 2 au plus.

## Planches (24 images lues sur 24)
1. Avant, 8 images (`--bare --no-zones`).
2. Après, mêmes 8 images : steppe et montagnes lisibles ; projecteurs faibles et « panneau » ; étoiles et cosmodrome invisibles en vignette.
3. En grand, 4 images (540 px, textes et zones TikTok) : pas de tir, poussée, Vivant, teaser — projecteurs justes ; touffes de premier plan dans la bande des sous-titres.
4. En grand, 3 images (poussée, Vivant, teaser) après le test à l'écran : steppe juste ; haie sous la route du teaser.
5. Le teaser seul, en grand : route nette, crêtes au-dessus, plus de haie, sous-titres sur deux lignes lisibles.
- `npm run check -- 026` : passe (0 erreur, contrastes 63/63 ; avertissements X3577, toile au bord, `#duel` : ceux des décors et des squelettes).

## À dire aux actes (et à celui qui orchestre)
- **Le parachute** : les touffes se dessinent sous 12 m (`alt` 0,012). Si le plan du parachute fait descendre `alt` jusqu'à 0,004 avant de couper, elles entrent par le bas du cadre pendant les dernières images (le sol y monte vite) : y arrêter `alt` à 0,015 au plus bas, et poser 0,004 par la coupe sur `VIEW.ground` (« Une dernière poussée »).
- **La montée de MS-12** (« En commentaire… », la caméra suit la fusée) : les étoiles et le cosmodrome suivent `pad` : le garder à 1 pendant la montée.
- **Les touffes sont calculées pour `VIEW.ground` et `VIEW.night`** (copiées dans `habillage.js`, `EYES`) : un plan du module posé pris d'ailleurs peut en voir une derrière le verre du module — y copier sa pose et rebâtir.

## À changer ailleurs
Rien d'obligatoire. Aucune lumière Three.js ajoutée ; je ne propose pas l'air du plateau (`stage.air.source`) sur les projecteurs : plans brefs, non essayé.

## Pas au niveau (franchement)
- **Les étoiles et le cosmodrome** ne se devinent qu'en pleine résolution (points de 2,6 à 5,5 px) : invisibles à 270 px. Ce sont les deux touches les plus faibles ; à retirer si la relecture ne les voit pas.
- **Les tours d'éclairage** sont deux traits fins à cette distance (les croisillons ne se voient pas) : on lit les rampes de lampes, pas la charpente.
- Dans `VIEW.ground`, le module remplit le cadre : la steppe n'y vit que dans deux bandes étroites de part et d'autre (celle de droite sous les boutons de TikTok) et assourdie sous les mots. Elle paiera davantage dans un cadre plus large du module posé.
- Rien vu en mouvement : la poussée (touffes éclairées, sol qui remonte de 4 m sur « touches »), la montée de MS-12, le recul de l'acte 1 sur le pas de tir. Aucun brin ne bouge, aucune lumière ne clignote : à `qa` de dire s'il reste une image parasite.
- Les montagnes du teaser sont un paysage de scénario (le 027 n'a pas de lieu sourcé) : elles n'affirment rien.

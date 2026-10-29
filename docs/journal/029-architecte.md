# 029 · Airbag d'avalanche — journal de l'architecte

2026-10-22 (nuit du 21/10). Contrat du dossier 029 : plan, monde, bouchons, page, repères, son, plans des décors et des actes. Cinq autres conversations travaillent dans le dépôt : je n'ai écrit que dans `episodes/029-airbag-avalanche/` (hors `audio/` et beats), `docs/029-decors.md`, `docs/029-actes.md` et ce journal.

## Fait
- Lu : la consigne commune, CLAUDE.md (sections demandées), les trois recettes, faits 029 et contre-vérification, le 025 (journal de l'architecte, décors, actes, actes-maj, `plan.js`, `world.js`, `main.js`, `index.html`, `episode.json`), l'API de `kit/lib/figure.js`, `atmo.js` (`makeMotes` + `streak`), `blocks.js` (`benchCut`, `followCall`, `duelCall`), `direct.js`, `026/src/sky.js` et `007/src/jet.js` (ni l'un ni l'autre n'exporte son ciel ou ses traînées seuls : `buildSky` / `buildJet` emportent tout — **on copie l'idiome, on n'importe pas**).
- Table mot à mot de la vraie voix (83,8 s) tirée par `scratchpad/029/architecte/words.mjs` (`schedule()` de `scripts/lib/episode.mjs`).
- **`src/plan.js`** : deux repères. Le repère de la pente (x en travers, +x = ta gauche ; h la normale ; s vers l'aval ; groupe incliné de `SLOPE` 38° autour de x), le repère du monde ; `slopePt(x, h, s)`. **Tu restes à l'origine** : la montagne défile vers l'amont de `travel` (la règle du 013/015), toutes les poses tiennent. Le repère du sac (origine au panneau dorsal, +x ta gauche, −z vers l'extérieur) ; `PACK_ON_TORSO` (l'ancre sur `fig.torso`), `HANDLE` (bretelle GAUCHE, sternum), `CABLE`, `CARTRIDGE`, `TRIGGER`, `VENTURI`, `HOSE`, `BAG` (UN ballon, ≥ 150 L, fer à cheval autour de la tête), `BENCHAT` (le fond du sac au sol), `VALLEY` (le chalet du 030). Azimut vérifié dans `stage.js` et sur planche : az 0 en aval face à toi, +90 ta gauche (la poignée), ±180 en amont.
- **`src/world.js`** : SET SLOPE / BENCH ; `FIRST` fermé (14 nombres de pente + `sec` + 12 du système + 8 de lumière) ; `HANDOFF` ; `VIEW` (les quatre candidates, 9 poses de pente, 7 d'établi) ; `BENCHED`, `STAGED`. **Le raccord au même angle** : au build, le monde est posé une fois sur `HANDOFF`, on lit la position du sac, l'angle du sac et la poignée ; `VIEW.strap` vise la poignée ; `world.handoff.origin` pour `benchCut` ; sur l'établi, `upright` 0 tient le sac à cet angle, 1 le redresse. Vérifié sur bouchons (planche 1) : la poignée tombe au même endroit de l'image des deux côtés de la coupe.
- **Le personnage appartient à `pente.js`** ; le sac est le système (`model.js`), accroché à `pente.A.pack`. La main suit la poignée par `plan.js` (`HANDLE`, `pull`). La promesse de l'accroche (le contour du ballon) est dessinée par `model.js` (`promise`) : la même forme que le vrai.
- **`src/main.js`** : chrono = `sec`, « T+m:ss » (temps réel, la vision vers 10:00 puis retour, tenu à l'autopsie) ; couleur auto (signal sous la neige, veille ballon plein près de la surface) ; compteur « Ballon » = `bag` × 150 L (le minimum de la norme, le seul volume dit).
- Bouchons : `pente.js` (grille inclinée, plaque, cassure, quelques blocs triés par `sort`, figure posée par `fall` / `roll` / `bury` / `reach` / `pull`, chalet et ligne) ; `model.js` (sac, bretelles, poignée veille, câble, cartouche, venturi, ballon plié / tore plein, contour `promise`).
- Actes : squelettes qui construisent (à réécrire en entier).
- **`index.html`** : `chip-enseveli`, `chip-cinq`, `chip-tire`, retitle (« Ton sac / Te fait flotter » barré → « Te rend gros » : « flotter » n'existe à l'écran que barré), `#duel` (Avec airbag / Sans), `#next` 030 sans chiffre ; `#film` et `#cta-field` du modèle retirés.
- **`episode.json`** : 99 repères, tous vérifiés sur la table (aucun ne tombe sur un autre mot : `zero:petit#2` pour « petit » après « petits », `seuil:regarde-le`) ; `cover` (eclate$, `el` 30, `shift` −520) ; **`sfx` refait : 57 sons, chaque attaque dans un souffle** — le modèle en posait trois sur des mots (`impact` sur « on », `blip` sur « rend », `rewind` sur « jour », plus l'impact de `tozero` dans « là ») : déplacés dans le souffle suivant ; vent (`ambience`), la neige qui coule (`hiss`, en lit sous la voix comme la pluie du 025), clics de l'éclaté, `boom` du ballon ; trois lignes de `sources` (ce que l'image reconstitue, l'en-tête, le sac sans marque). Ni `text` ni `vo` touchés.
- `npm run check -- 029` passe (0 erreur, 65/65 contrastes).

## Planches (12 images lues sur 25)
1. Bouchons `--bare`, 8 images (les quatre candidates, la poignée à `HANDOFF`, l'établi `upright` 0, la coupe, l'établi entier) : conventions justes (le personnage regarde l'aval, la poignée à droite de l'image vue de l'aval, la pente monte à droite vue de ta gauche) ; le raccord tient. Le tore du bouchon est mal placé (sans importance).
2. Avec l'en-tête, 4 images : chrono et compteur justes ; sur la (a) ta tête monte dans l'en-tête (à recadrer) ; la vallée tombe derrière le panneau `#next` (le chalet doit passer dessous, écrit dans le brief).

## Décisions
- L'acte 1 garde une vision « et si rien n'agit » (deux coupes : enseveli, puis retour) avec un chrono qui file vers dix minutes et revient : le changement toutes les 2-3 s de la scène. Repli écrit dans le plan si c'est confus.
- « Tire. » à la fin de l'acte 1 : la main se ferme sur la poignée sans tirer — le tirage est l'acte 3.
- « Encore faut-il… que ta main tire » : le ballon de la démonstration se replie (rembobinage) pour que le seuil et l'acte 3 repartent du sac plié. Repli : garder le ballon plein, couper sur la poignée.
- La chute se joue dans la coupe de l'avalanche (la démonstration), pas sur l'établi ; la question « Et ta main ? » revient sur l'établi, à la poignée.
- Recommandation pour la première image : (a) sous tes skis, puis (c).

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` (table mot à mot) — demandée au 021 et au 025, toujours manquante.
- `CLAUDE.md`, « Dossiers » : une ligne pour le 029 (contrat écrit le 22/10, décors à lancer : `pente.js`, `model.js`).
- Après les décors : `docs/029-actes-maj.md` (poses vues, défauts) et `POSE0` choisi sur la planche des quatre, collé dans `world.js`. Si `HANDOFF` change (posture de fin d'acte 1), `world.handoff` et `VIEW.strap` suivent seuls.
- Décorateur : `pente.js` seulement — la vie d'une pente hors-piste : des traces de ski plus haut, un piquet à neige ou un balisage de verre au bord (sans texte), des sapins de verre en lisière basse, des crêtes plus lointaines, une corniche au-dessus de la cassure ; rien sur toi, le sac ou la cassure, rien dans la coulée.
- `kit/lib/blocks.js` : `benchCut` ne sait pas passer un `to` (`moved` le sait) — ici contourné par `world.handoff.origin` (position du sac moins `BENCHAT`).

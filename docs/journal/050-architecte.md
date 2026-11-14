# 050 · Plaque à induction — journal de l'architecte

2026-11-13/14. Contrat du dossier 050 : plan, monde, bouchons, page, repères, plans des décors et des actes. Voix réelle 85,0 s (rien touché dans `audio/`, ni `text` ni `vo`).

## Fait
- Lu : catalogue (cuisine 009, enveloppe 018), recettes (agents, actes, décorateur), règles d'image (tête), faits 050 + contre-vérification (« à ne pas dire », points 3 et 4), `voir` des beats, 025 (journal, plan d'actes), 018 `cuisine.js` / `world.js`, `kit/lib/stage.js` (azimut : caméra = t + d·(sin az, …, cos az) → az 0 à +z, −90 à −x), `blocks.js` (`benchCut` déplace la pose de la scène : on lui passe la pose de la CUISINE).
- `src/plan.js` (sans import) : la cuisine du 009 (plan de travail y 90), la plaque à l'emplacement de la plaque du 012 (`HOME` 181 / 90,4 / 31), repère de la plaque (origine = centre de la face du verre), quatre foyers (`ZONES` : `hand` avant gauche, `pan` avant droit héros), inducteurs, pastille, afficheurs, carte, ventilateur, cordon, casserole (`PAN`), champ, courants, chaleur, éclaté (`EXPLODE`), toi (`YOU`, `HAND`), la main d'enfant (`CHILD`). Échelle vraie.
- `src/world.js` : `SET` KITCHEN / BENCH, le système = plaque + casserole sur son foyer (un seul objet re-parenté) ; `FIRST` fermé (40 nombres, dont 8 de lumière) ; `POSE0` provisoire (candidate a) ; `VIEW` (20 poses, [K] cuisine / [B] établi) ; `BENCH_ORIGIN` pour `benchCut` ; `BENCHED`, `STAGED` ; `LOOK` + `CLOSE` / `SHARP`.
- Bouchons, API définitive : `model.js` (`buildHob`), `casserole.js` (`buildCasserole`), `cuisine.js` (`buildCuisine` : 009 `hob: false` + figure de verre aux mains réelles + main d'enfant).
- `src/main.js` : chrono jusqu'au geste (T−21 → T0 sur `souleves`, tenu sur l'établi, ralenti acte 3) ; second compteur « Champ ≈ 25 kHz » / « 0 » lu sur `on`.
- Actes : squelettes qui construisent (posent déjà toutes les étiquettes, sinon `check` signale des chevauchements).
- `index.html` : `chip-vide`, `chip-onduleur`, `chip-inducteur`, `chip-coeur`, `chip-champ`, `chip-courants`, `chip-h`, retitle (Ce qui chauffe : La plaque → Ta casserole), duel (Sur ta plaque ? Un H / Rien), next 051 (« Il ne tape pas sur la glace : il la plie. »). Retirés : `#cta-field`, `#film` (inutiles, ils chevauchaient).
- `episode.json` : 60 repères vérifiés mot à mot (`.cache/planches/050/architecte/cues.mjs`) — `toabo` mis à `abo-0.05` (à −0,1 il tombait sur « plaque ») ; `sfx` : riser retiré (continu sous des mots), impact du H → `reponse:apparaît+0.33`, du verdict → `chute:pas+0.5`, la boucle → `boucle$+0.02`, deux clics et un souffle ajoutés dans des souffles ; deux lignes `sources` « Image : … ». `cover` gardée (à recaler sur le vrai éclaté).
- `npm run check -- 050` : passe (restent des avertissements de contraste sur la nav de l'en-tête à 42,5 s, sur bouchon).

## Planches (20 images lues sur 25)
1. p1 (8, `--bare`) : conventions vérifiées (az −74 : la main au premier plan, la casserole derrière) ; (d) de face traversait ton corps → passée à az −20 ; `VIEW.top` traverse ta tête → `you` 0 au like.
2. p2 (8, avec en-tête) : l'établi noir après la coupe — `benchCut` recevait la pose de l'établi au lieu de celle de la cuisine (corrigé) ; une tache verte énorme sur l'éclaté.
3. p3 (4) : la coupe vers l'établi tombe au même endroit (vérifié) ; la tache reste avec `pool` 0,06 et `fs` 12 → c'est le reflet de la boîte à lumière dans le verre noir brillant du bouchon (`coat` 1, `rough` 0,12) : signalé à `model.js` comme première chose à régler.

## Décisions
- Le foyer vide est à GAUCHE (ta main gauche), la casserole à DROITE (ta main droite prend le manche) : filmé de la gauche basse (az −60 à −80, côté clé), la main est devant, la casserole derrière — l'ordre de l'accroche. Le `voir` de `scene` (« la main lâche le verre et attrape la poignée ») est remplacé : c'est l'autre main.
- `principe` : pas d'incandescence (contre-vérification) ; le H : pastille discrète, jamais « capteur » à l'écran.
- `on` (alimenté, lu par l'en-tête) séparé de `field` (combien du champ est dessiné) : l'en-tête ne dépend pas d'un choix de mise en scène.
- Trois décors seulement ; la cuisine reprise telle quelle ; pas de décorateur prévu.
- Actes : acte 3 a 14 phrases très courtes dans un seul lieu : pas coupé.

## Poses provisoires (réglées sur bouchons — à recaler par le chef de production)
`POSE0` et toutes les `VIEW` : `hook`, `glassLow`, `boil`, `twoZones`, `emptyZone`, `panLow`, `hotRing`, `display`, `top`, `system`, `whole`, `exploded` (d 190 ; à 200–260 sur bouchon la colonne tenait), `board`, `coil`, `heart`, `section`, `sectionWide`. `HAND` (`flat`, `over`, `away`) et `CHILD` dans `plan.js` : à recaler sur la vraie main. `SIZE` 32 (le halo de l'établi) à vérifier sur l'éclaté réel. `cover.cam` gardée du script : à recaler.

## À changer ailleurs
- `scripts/sd.mjs` (`script`) : une option `--words` (mots et instants) — redemandée (021, 025) ; mon outil : `.cache/planches/050/architecte/words.mjs` et `cues.mjs` (repères ET `sfx` contre les mots).
- `kit/lib/blocks.js` → `benchCut` : son commentaire dit `view` = « la pose du dernier plan de la scène » ; le modèle d'épisode (`kit/template/src/acte2.js`) lui passe `VIEW.system` : c'est juste, mais un `VIEW.whole` de l'établi passé par erreur donne un écran noir sans message — une ligne d'avertissement si la pose déplacée passe sous le plancher de l'établi aiderait.
- Catalogue : après le film, la plaque à induction (`050/model.js`) et la casserole (`050/casserole.js`) sont reprenables pour tout sujet de cuisine (cocotte, autocuiseur électrique, plancha).

# 034 · Boîte noire — journal de l'architecte

2026-10-30. Contrat du dossier 034 : plan, monde, bouchons, page, repères, sons, plans des décors et des actes. Voix réelle 89,6 s (turbo), rien touché dans `audio/` ni dans les beats.

## Fait
- Lu : catalogue (aviation, marine, effets, kit), recettes (agents, actes, décorateur), `regles-image.md`, faits 034 (§ 10) et contre-vérification, modèle 025 (journal, plans, `world.js`, `main.js`, `index.html`), API de `023/src/avion.js` (`buildAvion` → `{ group, mount, A, update }`, `mount.parent` = le groupe de l'avion) et son `world.js`. Azimut vérifié dans `kit/lib/stage.js` l. 381 : az 0 en +z, −90 en −x.
- **Décors** : DEEP (`fond.js`, neuf, léger), AIR (l'A330 du 023 importé tel quel, déjà habillé — aucun agent), BENCH (kit). Système : `model.js` (neuf). Deux agents `decor`, pas de décorateur.
- `src/plan.js` : repère de la boîte (base à l'origine, balise vers −x), `REC`, `CHASSIS`, `BOARDS`, `MODULE` (cylindre trapu, en haut au milieu), `LAYERS` (brevet Honeywell), `BEACON` (+ pile), `PING` (phase commune fond / modèle), `DEEP` (3 900 m, départ 40 m), `WRECK` (queue qui coule, champ de débris), `BEAM`. **La boîte reste à l'origine, la mer bouge** (`depth`).
- `src/world.js` : `SET` BENCH / DEEP / AIR ; `FIRST` fermé (46 nombres dont 8 de lumière) ; `POSE0` provisoire (candidate a) ; `VIEW` (22 poses) ; `BENCHED`, `STAGED`, `FLOWN` ; `sepOf` (le module qui remonte seul) ; `LOOK` `{ dof: 6, air: 0, finish: 1 }`, `CLOSE` sur les gros plans seulement. La boîte tourne autour de son centre (`spin`, `tilt`) via un pivot. Dans l'avion : un `tailMount` ajouté au groupe de l'avion (023 intact) ; ses gouvernes vertes éteintes de l'extérieur (`quiet` : la matière sombre double face du 023 et ses arêtes) — **non vérifié sur planche**.
- Bouchons `model.js` et `fond.js` : volumes gris, API définitive (exports, `update`, nombres lus).
- `src/main.js` : en-tête « J−30 » → « J−0 » (`days`, signal avec `alarm`), puis « +N mois » (`months`) ; « Profondeur » = `depth` à 10 m près (« — » dans l'avion). `far` 1e7.
- Actes : quatre bouchons qui construisent (acte1 0 → 20,70 ; acte2 → 43,36 ; acte3 → 61,45 ; fin → 89,6). Aucune section ne dépasse ≈ 12 phrases : pas de découpe en acte2b.
- `index.html` (écrit par script) : `#track` (piste de voix), `chip-feu`, `chip-eau`, `chip-2011`, `chip-2h`, `chip-25h`, retitle « Sa balise → Sa mémoire », duel « D'avant 2021 / D'après », next 035 avec la condition « coincé » ; retirés : `chip-toi`, `chip-coeur`, `#film`, `#cta-field`.
- `episode.json` : 94 repères vérifiés sur la table (« reponse:on » attrapait « onze » de 2011 → `reponse:Et`) ; `cover` el 30 ; `sfx` refait dans les souffles (table des souffles : `.cache/planches/034/architecte/gaps.mjs`) — l'impact de `trigger` déplacé de 51,91 (sur un mot) à `tient+0,25`, le blip du verdict à `sauve+0,32`, le `rewind` dans le souffle de « temps » ; une ligne de `sources` sur ce que l'image reconstitue.
- `npm run check -- 034` passe (0 erreur ; un contraste « 02 Autopsie » à 84,6 s et un canvas au bord, dus aux bouchons).

## Planches (20 images lues sur 25)
1. Bouchons, 8 : candidates a–d (la queue hors champ : `tailSink` mal placé), la colonne (`range` lisible, la sphère entière passe sous le fond → demi-sphère demandée), la queue dans l'avion (encombrée), l'éclaté (le boîtier passait sous le sol → règle « y ≥ 0 »), l'épave (le cône du bouchon fait dalle).
2. 8 : `tailSink` recalé `[700, 2600, −1900]` → la queue tombe derrière la boîte en (a) ; (c) dessous ne la voit pas ; poses AIR de côté et de haut encombrées par l'empennage ; `VIEW.plane` bon (trois quarts arrière, l'avion 90 %) ; `floor`, `alone`, `crushed` cadrent.
3. 4 avec l'en-tête : « J−30 » et « Profondeur 40 m » lisibles, « — » dans l'avion ; `tail` d 900 az 20 el 18 garde la boîte lisible ; `tailBox` d 120 : la peau masque la boîte.

## Décisions
- La peinture orange = la teinte signal assombrie, sur la seule boîte ; veille = la balise, la pile, l'acier qui tient, la lecture.
- La boîte se pose au fond sur « mètres » (12,02) ; « l'eau réveille sa balise » se joue en gros plan (la balise flashe déjà dans l'accroche : `ping` 0,6 → 1).
- « Le fond noir monte vers lui » (accroche) = le noir de l'abîme sous la boîte, pas le fond (atteint à 12 s).
- Le module remonte seul (`free`, `sepOf`) : le boîtier et la balise restent au fond ; leur casse (`apart`) n'est montrée qu'à la chute, sans cause.
- `D.verdict` sur « attendre » (le `voir`), pas sur « pas ».

## Poses provisoires (réglées sur bouchons — à recaler par le chef de production)
`POSE0` (candidate a), `VIEW.beacon`, `sink`, `range`, `ocean`, `floor`, `alone`, `crushed`, `wreck`, `rise`, `verdict`, **`tail`, `tailBox` (AIR, les plus fragiles)**, `whole`, `exploded`, `beaconBench`, `caseBench`, `core`, `section`, `like`, et `cover.cam`. Seul `VIEW.plane` a été vu bon sur bouchon. `WRECK.tailSink` (plan.js) suit la candidate retenue.

## À changer ailleurs
Voir `docs/034-a-changer-ailleurs.md`.

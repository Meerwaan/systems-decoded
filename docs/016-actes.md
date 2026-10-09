# 016 · Disjoncteur — le plan de mise en scène

**La voix est enregistrée** (98,4 s) : les instants sont ceux de la vraie voix. Ils se lisent quand même dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères (`npm run script -- 016` donne la table). Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui vides) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/014-abs/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`). Les poses qui cadrent bien sont dans les journaux des décors : `docs/journal/016-wall.md`, `016-model.md` — pars d'elles.

## La scène, et ce qu'on a le droit d'affirmer

Un soir, chez toi : une bouilloire et un radiateur d'appoint sur la même multiprise. 18 ampères passent dans un circuit protégé par un disjoncteur de 16 : dans le mur, le fil chauffe — et le disjoncteur ne coupe pas. Il n'est pas en panne : il attend. Dedans, deux pièges sur le chemin du courant. Le lent : un bilame, que le courant chauffe comme il chauffe le fil ; trop longtemps, il se tord et déclenche. Le rapide : une bobine, pour le court-circuit. Puis l'arc, soufflé dans la chambre de coupure. Ce public compte beaucoup d'électriciens : **tout ce qui s'affiche est juste**.

- Sourcé : un 16 A ne doit pas déclencher en une heure à 1,13 fois son calibre (18 A), doit déclencher en moins d'une heure à 1,45 fois (24 A est au-dessus) — CEI 60898-1 citée par Schneider et Hager ; court-circuit : « plusieurs milliers d'ampères », la bobine en moins de 0,02 s (Legrand) ; la chambre de coupure allonge, fractionne et refroidit l'arc ; le disjoncteur protège le circuit, le différentiel 30 mA protège la personne ; isolant en PVC : 70 °C en service.
- **Jamais de flamme, jamais de mur qui brûle** : `char` est un isolant qui brunit et fume, c'est tout. Personne ne s'électrise.
- Aucune température d'arc, aucune puissance d'appareil, aucun temps de déclenchement autre que les bornes de la norme ne s'affiche.

## L'en-tête : un ampèremètre, et depuis combien de temps

- **`amps`** (en grand) : le courant. Il passe en signal tout seul au-dessus de 16 (`main.js`). 18 le soir de l'accroche ; 24 pour le piège lent ; **3 000** pour le court-circuit (« plusieurs milliers » : la valeur est illustrative) ; 0 quand c'est coupé. **`load`** est le même courant pour l'image (`amps / 16`, plafonné à 3 pour le court-circuit) : **mets-les dans le même `st`**.
- **`secs`** (« Depuis ») : depuis combien de temps ce courant dure. Il s'écrit tout seul en centièmes de seconde, en secondes, puis en minutes. C'est lui qui raconte les deux pièges : il court jusqu'à 60 min pour le lent (le film accélère), il s'arrête à 0,02 s pour le rapide (le film ralentit).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin. On glisse LENTEMENT sur la rangée de disjoncteurs (un motif rayé traversé vite scintille).
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 120 sur le fil, ≈ 400 pour la pièce, ≈ 30 sur le tableau, `SIZE` sur l'établi, ≈ 2 sur le bilame ou les contacts).
- **Couleurs** : signal est la menace — le fil qui chauffe, la surcharge, le court-circuit, l'arc ; veille est le système vivant — le bilame qui se tord, la bobine qui tire, le verrou qui lâche, l'arc éteint, et à la fin son voisin le différentiel ; ink est le reste, courant normal compris. `mood` 1 tant que le courant dépasse 16, 0 sur l'établi au repos et dès que c'est coupé. Jamais à mi-chemin plus d'une demi-seconde.
- Un mécanisme se montre de trois quarts ; une pièce qui se tord ou s'ouvre se filme de profil.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **30 images lues au plus.** Journal : `docs/journal/016-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-18` (Calibre 16 ampères / 18 passent) · `chip-attend` (Pas en panne / Il attend) · `chip-70` (Isolant du fil / Fait pour 70 degrés) · `chip-cuit` (Trop chaud, trop longtemps / Il cuit) · `chip-comme` (Le courant le chauffe / Comme ton fil) · `chip-tenir` (18 ampères / Tenir 1 heure au moins) · `chip-couper` (24 ampères / Couper en moins d'1 heure) · `chip-cc` (Court-circuit / Des milliers d'ampères) · `chip-002` (La bobine / Moins de 0,02 seconde) · `chip-arc` (Arc électrique / Des milliers de degrés) · `chip-eteint` (Fractionné / Éteint) · `#retitle` (Ton disjoncteur : « Te protège » barré → « Protège ton mur ») · `chip-diff` (Son voisin / Le différentiel) · `#net` · `#next` (Prochain dossier · 017 — « Son aimant reste allumé. Jour et nuit. ») · `chip-brule` (Odeur de brûlé / Laisse coupé) · `chip-elec` (Il ressaute / Électricien) · `#cta-field` (« Le tien, il saute sur quoi ? » → « LE FOUR », 7 lettres) · les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `014-abs/src/acte2.js`). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tosystem`)

En UN mouvement si possible (le fil dans le mur → il monte → le tableau → le disjoncteur → dedans ; puis la pièce → la multiprise → le fil → l'isolant → retour au disjoncteur). Une coupe est permise là où le mouvement ferait plus d'un quart de tour (au plus deux dans l'acte). C'est toi qui règles `POSE0` et `FIRST` : rends-les dans ton message final, prêts à coller.

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, `FIRST` : dans le mur, tout près du fil qui luit ; au-delà, à travers le mur, toi, la bouilloire, le radiateur. **Ça bouge dès l'image 1** : la caméra glisse le long du fil, `hotwire` 0,5 → 0,8, `secs` court. La première image doit arrêter le pouce sans texte. |
| `wire` → `hot` | « Dans ton mur, un fil chauffe. » | elle remonte la course du fil, vers le plafond puis vers le tableau |
| `breaker` → `nocut` | « Et ton disjoncteur… ne coupe pas. » | elle arrive sur le tableau, sur LE disjoncteur dans sa rangée, manette en haut ; sur « pas » : rien ne bouge — c'est l'image ; `chip-18` |
| `nofault` → `waits` | « Il n'est pas en panne : il attend. » | `xray` 0 → 1 : son boîtier devient du verre ; dedans le bilame à peine tiède (`warm` 0,3, `bend` 0,1) ; `chip-attend` |
| `sauf` → `trips` → `twice` | « Mais le jour où il saute… ne le relève pas deux fois. » | sur « saute » : `latch` 1, `gap` 1, `handle` 1 → 0, `dark` 1, `amps` 0 ; sur « relève » : `handle` 0 → 1 (`latch` 0, `gap` 0, `amps` 18) ; sur « deux fois » : il retombe aussitôt (`handle` 0, `latch` 1, `gap` 1) — et l'image TIENT sur la manette en bas |
| `toscene` → `kettle` → `heater` → `plug` | « Bouilloire, radiateur, la même multiprise : » | **coupe** : `STAGED` avec `kettle` 0,15 et `heater` 0,15 — la pièce (`VIEW.plugs` puis `VIEW.room`) ; chacun s'allume sur son mot ; la multiprise et ses deux fiches |
| `a18` → `a16` | « 18 ampères, sur un disjoncteur de 16. » | elle suit le fil depuis la prise, dans le mur, vers le tableau ; l'en-tête répond (`amps` 18 pulse : un `tl` sur `#hud-clock`) ; `chip-18` |
| `insul` → `deg70` → `cooks` | « L'isolant du fil est fait pour 70 degrés. Trop chaud, trop longtemps… il cuit. » | elle redescend dans le mur jusqu'à `FAULT`, tout près du fil : `hotwire` → 1 ; `chip-70` ; sur « cuit » : `char` 0 → 1 (il brunit, un filet de fumée) ; `chip-cuit` |
| `back` → `tosystem` | *(silence)* | le « et si » se retire (`char` → 0, `hotwire` → 0,5) pendant qu'elle remonte le fil jusqu'au disjoncteur : `VIEW.system` ; `others` → 0, `shell` → 0,3, `you` → 0, `mood` → 0 à la fin |

## 02 · AUTOPSIE — `acte2.js` (`tosystem` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` → `explode` | « Alors… on l'ouvre. » | `benchCut` de `VIEW.system` vers `VIEW.whole`, `{ ...BENCHED, cover: 1 }` ; sur « on » : `cover` 1 → 0 (la demi-coque s'en va), puis `explode` 0 → 1, recul vers `VIEW.exploded` |
| `p1` → `p2` → `p3` | « Une manette, un ressort, deux contacts. » | les trois dans UN cadre (elles sont voisines : c'est ce qui s'allume qui dit de quel mot on parle) : `litHandle`, `litSpring`, `litContacts` sur leurs mots |
| `path` → `traps` | « Et sur le chemin du courant, deux pièges : » | `explode` → 0 (remonté, ouvert) ; `load` 0 → 1 : le chemin du courant s'allume d'une borne à l'autre |
| `p4` → `p5` | « un bilame… et une bobine. » | la caméra suit le courant jusqu'au bilame (`litBlade`), glisse jusqu'à la bobine (`litCoil`) — un seul cadre qui glisse |
| `torepos` → `metals` → `warms` → `likewire` → `toolong` → `bends` | « Le bilame : deux métaux soudés. Le courant le chauffe, comme ton fil. Trop longtemps… il se tord. » | de profil, de près sur le bilame : ses deux gris ; `load` 1 → 1,3, `warm` 0 → 0,8 sur « chauffe » ; `chip-comme` sur « comme ton fil » ; sur « tord » : `bend` 0 → 0,8 (il n'atteint pas encore le verrou) — le film montre le geste avant de le rejouer pour de bon ; puis il se redresse (`bend` 0,1, `warm` 0,3, `load` 1) |
| `toseuil` | « Abonne-toi : ce fil qui chauffe, regarde ce qu'il fait au bilame. » | `followCall` (voir `kit/lib/blocks.js` : les chevrons `#rail-seuil`, le nom du compte s'allume) ; **le film ne s'arrête pas** : `load` monte déjà (1 → 1,125), le bilame commence à tiédir, la caméra se resserre sur son extrémité et le verrou |

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes. Deux temps : le piège lent (le film accélère : `secs` court jusqu'à l'heure), le piège rapide (le film ralentit : `secs` s'arrête à 0,02).

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `hold18` → `norm` → `hour` | « À 18 ampères, la norme l'oblige à tenir au moins une heure. » | **coupe** : l'établi, ouvert (`{ ...BENCHED, load: 1.125, amps: 18, mood: 1 }`), le bilame et le verrou de profil : `secs` 0 → 3 600 (l'en-tête : 60 min), `warm` → 0,45, `bend` 0,1 → 0,3 seulement — il tient ; `chip-tenir` |
| `a24` → `cut23` → `hour2` | « À 24… à couper, en moins d'une heure. » | sur « 24 » : `amps` 18 → 24, `load` → 1,5, `secs` repart de 0 et court ; `warm` → 1, `bend` 0,3 → 0,9 ; `chip-couper` |
| `bend` → `trigger` | « Le bilame se tord, et déclenche. » | `bend` → 1 : son extrémité pousse le verrou ; sur « déclenche » : `latch` 1, puis `gap` 1, puis `handle` 0 (dans l'ordre, en un quart de seconde) ; `load` 0, `amps` 0 ; `mood` → 0 ; puis **coupe** brève vers la pièce : `dark` 1, la bouilloire et le radiateur s'éteignent |
| `toreponse` → `short` → `cc` → `kiloamps` | « Deux fils se touchent : court-circuit. Des milliers d'ampères. » | **coupe** : dans le mur, sur `FAULT` (`STAGED`, `handle` 1) : sur « touchent » `fault` 0 → 1 — une lumière qui a un endroit ; sur « milliers » : `amps` 18 → 3 000, `load` 3, `secs` 0 ; `chip-cc` |
| `notime` → `coil` → `fast` | « Le bilame n'a pas le temps. La bobine, si : moins de deux centièmes de seconde. » | **coupe** : l'établi, ouvert, `load` 3 — le bilame à peine tiède (`warm` 0,2, `bend` 0,1) ; sur « bobine » : `pull` 0 → 1 (ses anneaux veille), `plunger` 0 → 1 : le noyau frappe le verrou, `latch` 1 ; `secs` 0 → 0,02 ; `chip-002` |
| `toarc` → `opens` → `arcon` → `hotarc` | « Les contacts s'écartent : un arc, à des milliers de degrés. » | **coupe** : tout près des contacts, de profil : `gap` 0 → 0,5 ; sur « arc » : `arc` 0 → 1 — le courant passe encore (`amps` reste à 3 000) ; `chip-arc` |
| `chamber` → `plates` → `split` → `out` | « Il file dans une chambre de plaques… qui le fractionne, et l'éteint. » | `litChamber` ; `split` 0 → 1 : l'arc court le long des cornes, entre dans les plaques, s'y découpe ; sur « l'éteint » : `arc` → 0, `amps` → 0, `load` 0, `gap` 1, `handle` 0 ; `mood` → 0 ; `chip-eteint` |

## Fin — `fin.js` (`toverdict` → la fin)

Compare ta dernière image à la première (`look` aux deux instants) : elle doit être la même. `D.commit` prévient dans la console si un nombre de l'état n'est pas revenu — `look` ne l'affiche pas : relis `D.first`.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `notyou` → `verdict` → `wall` | « Voilà le secret : ton disjoncteur ne te protège pas, toi. Il protège le fil, dans ton mur. » | **coupe** : la pièce (`STAGED`, `dark` 1, `handle` 0, `amps` 0, `load` 0, `hotwire` 0,25, `mood` 0) : toi d'un côté, le fil dans le mur de l'autre — sur « le fil », le fil s'allume en veille… avec `hotwire` il ne sait que rougir : cadre plutôt le fil qui REFROIDIT (`hotwire` 0,25 → 0) ; `retitle` : « Te protège » barré sur `notyou`, « Protège ton mur » sur `verdict` ; `D.verdict(verdict)` |
| `neighbour` → `diff` | « Toi, c'est son voisin : le différentiel. » | la caméra glisse vers le tableau : `diff` 0 → 1 (le voisin s'allume en veille), `others` → 0,3 ; `chip-diff` |
| `tocta` → `fires` → `third` → `someone` | « Like. Entre un incendie de logement sur cinq et un sur trois est d'origine électrique : ça remontera chez quelqu'un. » | **coupe** : l'établi, le disjoncteur fermé (`cover` 1), qui tourne lentement ; `likeCall` |
| `toabo` → `next` → `nocut2` | « Abonne-toi. Prochain dossier : l'IRM… ne le coupe pas. » | même établi, on recule ; `nextFile` |
| `tocomment` → `iftrips` → `unplug` → `smell` → `leave` | « Et s'il saute ? Tu débranches. Ça sent le brûlé : tu laisses coupé. » | **coupe** : la pièce, éteinte (`dark` 1, `handle` 0, `kettle` 0, `heater` 0) ; sur « brûlé » : au fond, à `FAULT`, `char` 0 → 0,6 ; `chip-brule` |
| `once` → `again` → `sparky` | « Sinon tu le relèves, une fois. Il ressaute ? Tu n'insistes pas : électricien. » | le tableau : sur « relèves » `handle` 0 → 1 (`latch` 0, `gap` 0, `dark` 0) ; sur « ressaute » il retombe (`handle` 0, `latch` 1, `gap` 1, `dark` 1) ; `chip-elec` (elle remplace `chip-brule`) |
| `ask` → `answer` | « En commentaire : le tien, il saute sur quoi ? » | `commentCall` (`chars` 7) |
| `toloop` → `rewind` | « Parce que ce soir, peut-être… » | **coupe** : `STAGED` — le soir recommence ; `D.loop` ramène tout à `FIRST` et à `POSE0` : le fil luit de nouveau dans le mur |

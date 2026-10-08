# 010 · Scie sur table — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (`npm run script -- 010` le donne ; la vraie voix sera ≈ 20 % plus courte). Tout instant se lit donc dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères : le jour où la voix arrive, tout se recale seul. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js`) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/008-paratonnerre/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`).

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe.
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont déjà 0,12–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 60 pour la main et la lame, 16 sur le déclencheur de profil, 30 sous le plateau, 8 à 10 sur une pièce de l'établi, `SIZE` pour le kit entier).
- Couleurs : `mood` 1 (signal) tant que le doigt est menacé ; 0 (veille) sur l'établi et dès que la lame est arrêtée. Jamais à mi-chemin plus d'une demi-seconde.
- **Le temps** : la scie tourne (`blur` 1, la sciure vole) jusqu'au contact. Au contact le film S'ARRÊTE : `blur` → 0 en quelques images (chaque dent nette), et il ne repart qu'à l'acte 3, AU RALENTI — la lame fait alors moins d'un dixième de tour (`turn` 0 → ≈ 0,085, trois dents) avant d'être arrêtée par le bloc. Sous `blur` 0,5, `turn` n'avance jamais de plus de 0,2 tour par seconde de film (sinon les dents sautent d'une image à l'autre).
- **La main de près est un mannequin** (phalanges en capsules) : en très gros plan on ne voit que des boudins. Le doigt sur les dents se filme assez large pour montrer LE DOIGT ET LES DENTS (d ≥ 40), jamais la main seule.
- Sous le plateau : `table` 0,15, et `you` 0 (ta main et ton bras portent leur ombre sur la lame). Le déclencheur est petit : il se filme de profil, `d` ≤ 56 (`VIEW.fire`) ; boîtier effacé (`lid` 0) et vu de trois quarts à d 95, c'est un fouillis.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-5ms` (S'arrête en / < 5 ms) · `chip-gass` (Son inventeur / L'a testée sur lui) · `chip-ord` (Scie / Ordinaire) · `chip-usa` (Blessés par an · États-Unis / `#usa-v` : un compteur, `D.readout("usa-v", …)` de 0 à 30 000) · `chip-amp` (Amputations / Des milliers) · `chip-signal` (La lame porte / Un signal) · `chip-circuit` (Toi / Dans le circuit) · `chip-detect` (Détecté en / 0,05 ms) · `chip-stop` (Lame / Arrêtée) · `chip-nick` (Toi / 2 ou 3 points) · `chip-lame` (Lame / Perdue) · `chip-cart` (Cartouche / À remplacer) · `#retitle` (Pour s'arrêter : « Elle ralentit » barré → « Elle se sacrifie »), `#net`, `#next` (Prochain dossier · 011 — « Une charge explosive. Sur ta batterie. »), `#cta-field` (« Toi, tu poses ton doigt ? » → « JAMAIS », 6 lettres), les `.rail`. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir 008/acte2.js). Pas plus d'une étiquette à la fois sur le sujet.

## 01 · MENACE — `acte1.js` (0 → `tounder`)

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, état `FIRST` : ta main à plat sur la planche, l'index à un centimètre des dents ; la lame tourne, la sciure vole. **On doit lire en une demi-seconde UNE MAIN ET UNE LAME, trop près** : le bout du doigt ET l'arc de la lame au-dessus du bois entre y 440 et 1160 — règle `POSE0` avec `look` jusqu'à ce que ce soit vrai (piste : `{ tx: -2.5, ty: 92.5, tz: 5, d: 105, az: -64, el: 14, fov: 40, shift: 150, side: 40 }` montre mieux la lame que le `POSE0` actuel ; rends le tien dans ton journal, il sera recopié dans `world.js`). **La caméra bouge dès l'image 1** et la main glisse dès l'image 1 |
| `accroche` | « Ta main glisse. » | `slip` 0,85 → 0,95, la planche avance (`feed`), la caméra pousse vers le bout du doigt |
| `touch` | « Ton doigt touche la lame. » | `slip` → 1 sur « touche ». À l'instant du contact LE FILM S'ARRÊTE : `blur` 1 → 0 en trois images, un éclair veille qui a un endroit au bout du doigt (`circuit` 0 → 0,12), une secousse légère (`jolt`) ; l'horloge marque T+0,0 ms |
| `keep` | « Tu le gardes : elle s'arrête en moins de cinq millisecondes. » | la caméra tourne lentement autour du doigt posé sur les dents figées et recule pour montrer la lame entière ; `chip-5ms` accrochée à la lame |
| `his` | « Son inventeur l'a testée sur son doigt. » | la caméra continue son arc, le doigt et les dents au centre ; `chip-gass` en zone haute (`chip-5ms` est sortie) |
| `yours` | « Toi… tu poses le tien ? » | la caméra remonte le long de ton bras jusqu'à ton visage penché sur la scie (`VIEW.circuit`, sans `circuit`), puis s'arrête |
| `tosans` | « Sur une scie ordinaire, c'est déjà fini. » | **coupe** : le cadre de la première image, mais une scie ORDINAIRE — pas de signal sur la lame (`signal` 0), le temps ne s'arrête pas (`blur` 1, `slip` 1) ; `chip-ord` en zone haute. `over` : `harm` 0 → 1 — la lumière signal prend le bout du doigt, puis la main (`VIEW.harm`) |
| `usa` | « Aux États-Unis : trente mille blessés par an. » | recul par rapport jusqu'à toi en entier à la scie (`VIEW.you`), la main toujours en signal ; `chip-usa` en zone haute, son compteur court de 0 à 30 000 |
| `amput` | « Des milliers d'amputations. » | `chip-amp` remplace `chip-usa` ; la caméra tient, `harm` pulse lentement |
| `back` | *(silence)* | le film revient en arrière en 0,35 s : `harm` → 0 |

L'acte 2 coupe à `tounder`.

## 02 · AUTOPSIE — `acte2.js` (`tounder` → `tozero`)

| repère | la voix | l'image |
| --- | --- | --- |
| `tounder` | « Alors… » | **coupe** : sous le plateau, la cartouche près des dents (`VIEW.cartridge`, `STAGED` + `table` 0,15, `blur` 0, `dust` 0, `you` 0). L'atelier s'efface autour (`shell` → 0, `signal` → 0, `mood` → 0) |
| `tobench` | « …on l'ouvre. » | `benchCut` : la même lame et la même cartouche sur l'établi, à la même place de l'image (`origin: HOME`). La caméra recule par rapport jusqu'à `VIEW.whole` |
| `p0` | « Sous la table, tout près de la lame : une cartouche. » | sur l'établi, entier : la caméra descend vers la cartouche, boîtier fermé, son bloc face aux dents ; légende « Cartouche » / « Sous le plateau » |
| `p1` | « Un bloc d'aluminium. » | juste avant le mot, `explode` 0 → 1 (0,9 s, `"none"`) : la rangée ; `VIEW.blockPart`, `litBlock` ; légende « Bloc d'aluminium » / « Tout près des dents » |
| `p2` | « Un ressort comprimé. » | `VIEW.springPart`, `litSpring` ; légende « Ressort » / « Comprimé » |
| `p3` | « Et pour le retenir… un simple fil. » | `VIEW.wirePart`, `litWire` — le fil doit se VOIR ; légende « Fil » / « ≈ 0,25 mm » |
| `tosignal` | « La lame, elle, porte un petit signal électrique. » | **coupe** : la scie, la lame qui tourne au-dessus de la planche (`STAGED` + `slip` 0,4, `signal` 0) ; `signal` : `signal` 0 → 0,9, la lueur veille respire sur la lame ; `chip-signal` |
| `wood` | « Le bois sec n'y change presque rien. » | la planche avance dans la lame (`feed` +8, la sciure vole) : la lueur ne bouge pas |
| `body` | « Ton corps, si : en la touchant, tu entres dans le circuit. » | `slip` → 1, le film s'arrête (`blur` → 0) ; `circuit` : la lueur de la lame tombe (`signal` → 0,15) et le fil de lumière remonte ton bras (`circuit` 0 → 1), la caméra le suit (`VIEW.circuit`) ; `chip-circuit` |
| `toseuil` | « Abonne-toi : ton doigt est sur la lame, et on reprend au ralenti. » | `followCall` (voir 008/acte2.js, fin). Le film ne s'arrête pas : la caméra redescend ton bras jusqu'au doigt posé sur les dents — l'image de l'accroche qui revient ; l'horloge de l'en-tête répond (une pulsation sur « ralenti »). Pas de panneau |

L'acte 3 coupe à `tozero`.

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

Le ralenti : cinq millisecondes étirées sur quinze secondes. L'horloge de l'en-tête (millisecondes depuis le contact) et le compteur « Lame » (100 % → 0 %) sont câblés dans `main.js`. `setAct(tl, 3, zero)`. `turn` avance lentement de `tozero` à `bite` (0 → 0,06) puis s'arrête à `stop` (0,085).

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` | « Contact. » | **coupe** : le doigt sur les dents, l'image de l'accroche en plus serré (`STAGED` + `blur` 0,12, `slip` 1, `circuit` 0). Sur le mot (`trigger`) : l'éclair veille au bout du doigt (`circuit` → 0,15) |
| `drink` | « Ta peau boit le signal : la scie l'a senti avant toi. » | `signal` 0,6 → 0,1 sur « boit » pendant que `circuit` → 1 : la lumière quitte la lame et passe dans ton bras ; `chip-detect` |
| `tofil` | « Un courant brûle le fil. » | **coupe** : le déclencheur de profil (`VIEW.fire`, `table` 0,15, `lid` 0, `you` 0, `fs` 16). `burn` : `wire` 1 → 0 avec `flash` 0 → 1,2 → 0 |
| `throw` | « Le ressort jette l'aluminium dans les dents. » | `pawl` 0 → 1 en 0,15 s sur « jette » (la lame d'acier s'ouvre, le ressort s'allonge) ; `bite` : **coupe** vers les dents, de dessous (`VIEW.bite`), `bite` 0 → 1 : les dents se plantent, étincelles lentes ; une secousse (`jolt`) |
| `tostop` | « Moins de cinq millisecondes : la lame est arrêtée. » | **coupe** : la lame au-dessus de la planche, ton doigt encore contre elle (le cadre de l'accroche, plus large) ; `stop` : `turn` s'arrête, `blur` 0, `mood` → 0 ; `chip-stop` |
| `dive` | « Et son propre élan la tire sous la table. » | `drop` 0 → 1 (0,7 s, `power2.inOut`) : vue d'ici la lame s'enfonce dans la fente et disparaît — puis **coupe** de côté (`VIEW.dive`, `drop` 1) : elle est sous le plateau, le bloc planté dans ses dents |
| `toyou` | « Toi ? Une entaille. Deux ou trois points de suture. » | **coupe** : ta main relevée (`VIEW.after`, à recadrer : la main au centre), `flinch` 0 → 1, `nick` 1 sur « entaille » ; `chip-nick` |

`fin.js` coupe à `toverdict`.

## Chute, appels à l'action, boucle — `fin.js` (`toverdict` → fin)

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` | « Cette lame ne ralentit pas. » | **coupe** : sous le plateau, le bloc d'aluminium planté dans les dents (`VIEW.bite` ou `VIEW.fire` ; `STAGED` + `table` 0,15, `lid` 0, `you` 0, `blur` 0, `wire` 0, `pawl` 1, `bite` 1, `mood` 0). `retitle` : « Elle ralentit » arrive avec la phrase, barré sur « pas » (`verdict`). `D.verdict(verdict)` |
| `block` | « Elle prend un bloc de métal dans les dents. » | poussée vers les dents enfoncées dans l'aluminium |
| `trash` | « Lame, cartouche : à la poubelle. » | **coupe** : l'établi, la lame et sa cartouche mordue (`BENCHED` + `wire` 0, `pawl` 1, `bite` 1) ; `chip-lame` puis `chip-cart` |
| `truth` | « La scie se sacrifie… pour ton doigt. » | « Elle se sacrifie » remplace le titre barré ; il est sorti avant `tocta` |
| `tocta` | « Like. Ça remontera chez quelqu'un qui a une scie dans son garage. » | **coupe** : l'établi, le kit neuf (`BENCHED`, `VIEW.whole`), qui tourne lentement. `likeCall` (5 tuiles, « n personnes ») |
| `abo` | « Abonne-toi. Prochain dossier : dans une voiture électrique, une charge explosive… vissée sur le câble de la batterie. » | la caméra recule et descend ; `nextFile` (panneau à « Prochain », le fait à « charge ») |
| `tocomment` | « Et l'inventeur ? Avant son premier salon, il a posé son doigt sur la lame. Ça a marché. » | **coupe** : la scie qui tourne (`STAGED` + `slip` 0,5, `blur` 1, `signal` 0,6), le cadre de l'accroche. `finger` : le doigt descend exprès vers les dents (`slip` → 1 sur « posé »), et à vitesse réelle la lame s'arrête et plonge (`blur` 0, `pawl` 1, `bite` 1, `drop` 1 en un tiers de seconde) sur « Ça a marché » |
| `ask` | « En commentaire : toi, tu poses le tien ? » | `commentCall` (la question s'affiche ; « JAMAIS » se tape sur les premiers mots de la boucle : `chars: 6`) |
| `toloop` | « Lui a gardé le sien. Mais un accident de scie commence souvent comme ça… » | **coupe** : toi à la scie, large (`VIEW.you`, `STAGED` + `slip` 0,3, `blur` 1), tu pousses la planche. `rewind` : `D.loop({ at: toloop, rewindAt: rewind, fromD })` — retour à `POSE0` et à `FIRST` (la main revient à un centimètre des dents) |

La dernière image est la première : `commit` prévient dans la console si un nombre n'est pas revenu.

## Ce que les décors savent faire (rendu par ceux qui les ont construits — détail et autres poses : `docs/journal/010-shop.md`, `010-model.md`)

- **L'atelier et toi** (`shop.js`) : `slip` 0 (la main à 13 cm) → 0,85 (1 cm) → 0,95 (2 mm) → 1 (au contact, `TOUCH`). `feed` : la planche avance, le trait s'allonge. `circuit` : bout du doigt → poignet 0,19 → coude 0,47 → épaule 0,78 → buste 1, le verre du corps vire au vert. `harm` : 0–0,3 le bout du doigt, puis la main entière en signal, braises. `flinch` : la main relevée à 21 cm, doigts mi-clos, le buste redressé. `nick` : un trait signal sur le bout de l'index. `dust` × `blur` : la sciure (nulle quand la lame est figée). `table` : le plateau seul. L'atelier autour est presque invisible en cadre serré. Ancres `world.shop.A` : `youHead, fingertip, hand, elbow, boardEnd, fence, switch`.
- **La lame et la cartouche** (`model.js`) : `blur` 1 un disque d'acier opaque et sombre, son anneau clair de dents fondues, deux reflets qui tiennent en place · 0,7–1 les dents se referment en anneau · 0,05–0,17 fondu sans double image · 0 chaque dent nette, à l'angle `turn`. `signal` : des anneaux veille lents sur la plaque. `lid` : l'opacité du boîtier. `wire` : deux moitiés qui se rétractent ; `flash` : un cœur blanc et une haleine veille. `pawl` : la pièce noire s'envole, la lame d'acier s'ouvre de 26°, le ressort s'allonge, le bloc avance de 6 mm dans les dents — le geste est petit : il se lit par l'éclair et la lame d'acier, de profil. `bite` : le bloc s'écrase, étincelles lentes. `drop` : rotation linéaire (à adoucir dans l'acte). `explode` : le boîtier se lève et se dissout, la rangée bloc · ressort · fil · carte devant la lame. La lame qui tourne n'a pas d'épaisseur vue par la tranche (az proche de 0 ou 180) : à éviter. Ancres `world.saw.A` : `blade, tooth, top, cartridge, block, spring, wire, pcb, pivot`.
- Les poses de départ sont dans `VIEW` (`world.js`) : `cartridge, whole, exploded, blockPart, springPart, wirePart, fire, bite, dive, finger` (trop serrée : la reculer), `you, circuit, harm, after`. Ce sont des points de départ vus sur planche : chaque acte affine les siennes avec `look` et les garde dans son fichier.
- Dans `look --file`, donne dans `state` tous les nombres que ton image exige (`set: 0` pour l'établi).

# 018 · Cocotte-minute — le plan de mise en scène

**La voix n'est pas enregistrée** : le minutage est ESTIMÉ (120,8 s, soit ≈ 90 s dites). Tout instant se lit donc dans le script — `D.times({ nom: "beat:mot" })` ou un repère d'`episode.json` (`cues`, déjà écrits et vérifiés mot par mot : image et son lisent les mêmes) — **jamais un nombre de secondes en dur**, et les durées s'écrivent comme des écarts entre deux repères (`npm run script -- 018` donne la table). Une durée fixe n'est permise que pour un geste court (≤ 0,6 s) accroché à un repère. Chaque acte a son fichier (`src/acte1.js`, `acte2.js`, `acte3.js`, `fin.js` : aujourd'hui des échafaudages de dix lignes, à remplacer) et n'écrit que des `st` / `now` / `shot` / `cut` / `chip` / `tl` contre `world.js` — forme : `episodes/017-irm/src/acte*.js` ; outillage : `kit/lib/direct.js` ; blocs : `kit/lib/blocks.js` (`benchCut`, `retitle`, `followCall`, `likeCall`, `nextFile`, `commentCall`). Les poses qui cadrent bien seront dans le journal du décor (`docs/journal/018-model.md`) : pars d'elles ; celles de `VIEW` sont des points de départ calculés, pas des cadres réglés (seules `hook`, `youAt` et `system` ont été vues).

## La scène, et ce qu'on a le droit d'affirmer

Ce soir, ta cocotte-minute est sur le feu, et elle siffle : c'est la soupape de fonctionnement — un poids posé sur un trou — qui laisse sortir l'excès de vapeur. Tu l'as trop remplie, des lentilles : la mousse monte, bouche le trou. Elle se tait, la pression monte. La soupape de sécurité s'ouvre ; si elle est bouchée elle aussi, le joint cède sur le côté et fuit, exprès. Et tant qu'il reste de la pression, une tige bloque le couvercle. Sourcé (`episode.json` → `sources`, `docs/faits/018-*.md`) : « plus de 350 kg » sur le couvercle en fonctionnement (DREAL 2018) ; ≈ 111 °C à 0,55 bar ; l'ordre des sécurités (notices Batimex, SEB, Cristel) ; moitié au plus pour ce qui mousse ; les accidents de 2018 sont des ouvertures brutales sous pression, pas des éclatements.

- **Rien n'explose à l'image, jamais.** Pas d'éclair (`#flash` reste à 0), pas de `jolt` qui se lise comme un souffle, pas de couvercle qui vole, pas de projection, personne de brûlé. « Ouvert sous pression » se montre par la tige qui tient, pas par l'accident.
- **Aucun chiffre à l'écran** en dehors de l'en-tête et des étiquettes écrites ci-dessous : aucune pression en bar, aucune pression d'ouverture, aucune température autre que « plus de 110 degrés », aucune durée. La jauge de l'acte 3 n'a pas de chiffre.
- La scène est un scénario (`sources` le dit) : la mousse et les lentilles ne sont pas un fait divers. On ne nomme aucune marque.
- L'ordre est celui-ci, et pas un autre : **le trou se bouche → elle se tait → la pression monte → la soupape de sécurité s'ouvre → (bouchée aussi) → le joint cède sur le côté → la pression tombe**.
- Le mot « fenêtre » n'est pas un terme de notice : il n'apparaît dans aucune étiquette.

## L'en-tête : la poussée sous le couvercle

- En grand, **`bar`** — la pression — dite comme la dit l'accroche : **« +350 kg »** (plus de 350 kilos), signal, dès la pression de cuisson (`bar` ≥ 1) **et au-dessus : il ne grimpe pas plus haut**, aucun chiffre n'est sourcé là. Sous 1 il décompte (par dizaines) ; à 0 il affiche « 0 kg » et passe en veille (`main.js` le fait). Il ne tombe à 0 dans la cuisine qu'une fois, sur « La pression tombe ».
- Le second compteur, « Soupape », lit **`whistle`** et **`clog`** : « Siffle » (veille) / « Muette » (signal, s'il reste de la pression) / « Au repos » (encre, à froid). **« Muette » sous « +350 kg », c'est tout le film en un coup d'œil** : c'est l'image de « Plus un bruit ». Ne fais donc jamais descendre `whistle` sous 0,5 sans le vouloir (la respiration de « se règle » reste entre 0,6 et 1).
- La montée (« la pression monte. Encore. ») se voit dans l'image (`seen`) et sur **la jauge** de l'acte 3, sans chiffre.

## Ce que tout acte respecte

- **Chaque phrase a sa démonstration**, sur le mot. Une image qui illustre « à peu près » est à refaire.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }` ou `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe. (L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.)
- Une coupe se pose quelques images avant la phrase qui la motive (les repères `to…` sont 0,10–0,14 s avant). Rien d'un plan ne déborde sur le suivant : une étiquette a fini de sortir avant la coupe.
- **Zones** : en-tête 236–410 · zone haute 436–790 (un seul panneau ou une seule étiquette fixe à la fois) · sujet entre 440 et 1160, plutôt à gauche du centre s'il descend sous 880 · sous-titres 1248–1488 · rien d'important sous 1600. Vérifie chaque plan AVEC l'en-tête et les zones (sans `--bare`).
- **La vapeur ne monte pas dans l'en-tête** : `plume` dit combien du panache est dessiné. Dans le cadre de l'accroche il touche l'en-tête à 1 (vu sur planche, et `check` y relève un contraste sur « 03 Réponse ») : règle `plume` (≈ 0,6) ou le cadre pour qu'il s'arrête avant y ≈ 440. En gros plan : 0,3.
- **Toi** (`you` 1) es à la plaque, les doigts sur la manette : filmé entre az −58 et −72 ton bras passe à droite de la cocotte ; plus près de −40, ta main et ton avant-bras sont DEVANT elle (vu sur planche) — mets alors `you` 0. Tu es un mannequin de verre à la main pleine : jamais en gros plan, jamais la main seule.
- Mouvements : `sine.inOut`, longs ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; `reaim` avant de repartir d'une pose visée de loin.
- La lumière suit ce qu'on filme : `fx, fy, fz` autour du sujet, `fs` sa taille (≈ 40 pour la cocotte dans la cuisine, ≈ 12 sur une soupape ou la tige, ≈ 150 quand on te voit en entier, `SIZE` sur l'établi, ≈ 30 pour l'éclaté).
- **Couleurs** : signal est la PRESSION — la vapeur prisonnière, sa poussée, la mousse qui bouche, et le feu qui la fabrique ; veille est ce qui la LAISSE SORTIR — le jet de la soupape, la soupape de sécurité qui s'ouvre, le joint qui fuit exprès, la tige qui garde ta main loin du couvercle ; ink est le reste. `mood` 1 dans la cuisine tant qu'il y a de la pression, 0 sur l'établi au repos et dès qu'elle est tombée. Jamais à mi-chemin plus d'une demi-seconde.
- `xray` se tient franc lui aussi (0 ou 1) ; `seen` baisse quand la vapeur gênerait la lecture d'un niveau ou d'une pièce — la pression est là même à 0.
- **Un nombre de l'état ne porte jamais le nom d'une propriété de GSAP** : la liste de `FIRST` est fermée, n'en ajoute pas. S'il t'en manque un, écris-le dans ton journal sous « À changer ailleurs ».
- Les étiquettes sont en capitales : pas d'unité à symbole dans un texte neuf.
- **30 images lues au plus.** Journal : `docs/journal/018-<ton fichier>.md`. Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt, jamais dans `renders/`.

## Les étiquettes (déjà dans `index.html`, invisibles tant qu'un acte ne les fait pas entrer)

`chip-350` (Sous le couvercle / Plus de 350 kilos) · `chip-110` (Dedans, l'eau bout à / Plus de 110 degrés) · `chip-trop` (Ce soir / Trop remplie) · `chip-poids` (Celle qui siffle / Un poids sur un trou) · `chip-regle` (Ce bruit / La pression se règle) · `chip-tige` (Encore de la pression / Couvercle bloqué) · `#gauge` (Sous le couvercle · la pression — sa valeur `#gauge-v` est un MOT : « Réglée » / « Monte » / « Tombe » ; son repère : « Pression de cuisson », au milieu ; ses états `#gauge-s0` veille « la soupape siffle — elle se règle », `#gauge-s1` signal « plus rien ne sort — elle monte », `#gauge-s2` veille « ça fuit — elle tombe ») · `chip-secu` (Deuxième sortie / Soupape de sécurité) · `chip-joint` (Dernière sortie / Le joint fuit exprès) · `#retitle` (Une cocotte aux normes : « Explose » barré → « Fuit ») · `chip-brule` (Ce qui brûle / Ouvert sous pression) · `chip-feu`, `chip-attends`, `chip-force`, `chip-nettoie` (Elle se tait · 1 à 4 : Coupe le feu / Laisse retomber / Ne force jamais / Nettoie la soupape) · `#cta-field` (« Elle te fait peur, ta cocotte ? » → « UN PEU », 6 caractères) · `#net` · `chip-moitie` (Ce qui mousse / Jamais plus de la moitié) · `#next` (Prochain dossier · 019 — « Une charge explosive dans son enrouleur. Exprès. » — « S'abonner pour l'ouvrir ») · les `.rail`.

L'accroche a ses cartes, qui affichent déjà les mots : pendant elle, une seule étiquette, `chip-350`, et seulement sur le chiffre. Une étiquette qui suit un point sort du cadre quand la caméra voyage : donne-lui alors une place fixe en zone haute (`chip(id, null, 96, 470, de, à)`). Les légendes de pièces sur l'établi se font avec `co.add` (voir `017-irm/src/acte2.js`). La jauge se pilote ainsi (elle tient la zone haute : pendant elle, les étiquettes suivent leur point) :

```js
const fill = document.getElementById("gauge-fill");
D.readout("gauge-v", () => {
  const bar = D.W.bar;
  fill.style.transform = `scaleX(${Math.min(1, bar / 2).toFixed(3)})`;
  fill.style.backgroundColor = bar > 1.04 ? "#ff5b2e" : "#5cffb0";
  return /* un mot, jamais un chiffre */ bar > 1.04 ? "Monte" : "Réglée";
});
```

## 01 · MENACE — `acte1.js` (0 → `tobench`)

En UN mouvement (la cocotte → sous son couvercle → sa soupape → dedans, l'eau → le niveau et toi → la mousse jusqu'à la soupape → la cocotte seule). Deux coupes au plus, là où le mouvement ferait plus d'un quart de tour. C'est toi qui règles `POSE0` et `FIRST` : rends-les dans ton message final, prêts à coller. **Choisis la première image sur une planche de quatre cadres.**

| repère | la voix | l'image |
| --- | --- | --- |
| 0 | *(première image)* | `POSE0`, `FIRST` : la cocotte sur sa couronne de flammes, basse et proche ; le poids danse, un jet de vapeur veille en sort ; ton bras de verre entre par la droite. Aucun texte : c'est l'image seule qui arrête le pouce. **Ça bouge dès l'image 1** : la caméra avance (par rapport), le poids tourne, les flammes vivent. |
| `whistles` | « Ta cocotte-minute siffle. » | on arrive sur le couvercle ; le jet, le poids qui danse (`whistle` 1). L'en-tête dit déjà « +350 kg · Siffle ». |
| `under` → `pushes` → `kilos` | « Sous le couvercle, la vapeur pousse : plus de 350 kilos. » | sur « couvercle » : `xray` 0 → 1 — la cocotte devient du verre là où elle est ; sur « pousse » : `seen` 0 → 1 — la vapeur prisonnière, signal, se presse contre le dessous du couvercle, ses traits battent ; sur « 350 » : `chip-350`, et l'en-tête (« +350 kg ») répond (un battement d'échelle sur `#hud-clock`). `plume` baisse pendant ce temps : le dedans se lit. |
| `protects` | « Ce sifflement te protège. » | la caméra monte du dessous du couvercle à la soupape (`VIEW.valve`) : `seen` → 0,3, `plume` → 0,6, `litValve` 0 → 1 : le jet veille, en grand |
| `danger` → `silence` | « Le danger… c'est le jour où elle se tait. » | sur « tait » : `whistle` 1 → 0 en deux images — le poids retombe sur son trou, le jet meurt, le sifflement s'arrête (le son lit le même repère) ; l'en-tête passe à « Muette », signal ; `seen` → 1, `bar` 1 → 1,25 : dedans, ça s'épaissit. **L'image TIENT** (le `hold` de la phrase). |
| `toscene` → `prisoner` | « Dedans, la vapeur est prisonnière : » | ce n'était qu'un aperçu de « ce jour-là » : à `toscene`, `whistle` → 1, `bar` → 1. La caméra plonge à travers le verre (`VIEW.inside`, par rapport) : `xray` 1, `seen` 1 — la vapeur entre l'eau et le couvercle |
| `boils` → `hotter` | « l'eau ne bout plus à cent degrés, mais à plus de cent dix. » | on descend à la surface : `boil` 1, elle se soulève, les lentilles roulent ; sur « cent dix » : `chip-110` (place fixe : la caméra voyage) |
| `faster` | « Tout cuit plus vite. » | les lentilles brassées dans l'eau, de près ; `seen` → 0,3 |
| `tonight` → `toofull` → `lentils` | « Mais ce soir, tu l'as trop remplie : des lentilles. » | recul sans lâcher la surface jusqu'à voir toute la cuve de verre (`VIEW.level`), puis toi à la plaque (`VIEW.youAt`, az −66) : le niveau (`fill` 0,8) loin au-dessus du milieu ; sur « remplie » : `chip-trop` |
| `foams` → `tovalve` | « La mousse monte… vers la soupape. » | `foam` 0 → 0,85 sur toute la phrase : elle grimpe ; la caméra monte avec elle, puis passe sous le couvercle (`VIEW.foam`) : sur « soupape » on est à la bouche de la cheminée, la mousse à un doigt du trou. **`clog` reste à 0** : le bouchon est pour l'acte 3. |
| `back` → `tobench` | *(silence, puis « Alors… »)* | recul vers `VIEW.system` : `xray` → 0, `seen` → 0, `plume` → 0 (le jet n'est plus dessiné : rien ne saute à la coupe), `shell` → 0,2, `you` → 0, `fs` 40 → 26, `mood` → 0 dans les deux dernières images : il ne reste que la cocotte. **Ce que l'acte 2 trouve à `tobench`** : la pose `VIEW.system` exacte, la cocotte pleine, entière, sans jet. |

## 02 · AUTOPSIE — `acte2.js` (`tobench` → `tozero`)

Sur l'établi la cocotte est froide et vide (`BENCHED` : `bar` 0, l'en-tête dit « 0 kg · Au repos » — on ne l'ouvre QUE sans pression, et c'est vrai). La démonstration de la soupape lui redonne de l'eau et de la pression.

| repère | la voix | l'image |
| --- | --- | --- |
| `tobench` → `explode` | « Alors… on l'ouvre. » | `benchCut(D, { at: tobench, set: SET.BENCH, view: VIEW.system, origin: HOME, state: BENCHED })` ; **sur « on »** (`explode`) : `explode` 0 → 1 — le couvercle TOURNE, puis tout se soulève en une colonne ; recul vers `VIEW.exploded` (par rapport, depuis la pose rendue par `benchCut`) ; `fs` → 30. La phrase est seule dans son beat : rien d'autre ne se passe. |
| `p1` | « Une cuve. » | `litBody` ; légende |
| `p2` → `locked` | « Un couvercle, verrouillé. » | `litLid` : le couvercle ET ses ergots ; sur « verrouillé » la caméra se rapproche du bord — les ergots du couvercle au-dessus de ceux de la cuve, face à face |
| `p3` | « Un joint. » | `litSeal` : l'anneau suspendu entre les deux |
| `p4` | « Et dessus… deux soupapes. » | la caméra monte au sommet de la colonne : `litValve` et `litSafety` dans UN cadre (deux pièces nommées en moins d'une seconde) ; `chip`/légendes : « Fonctionnement », « Sécurité » |
| `torepos` → `first` | « La première, c'est elle qui siffle : » | `explode` 1 → 0 : la colonne redescend, le couvercle tourne et se verrouille (le geste de la baïonnette, qu'on vient de nommer) pendant que la caméra va à `VIEW.valvePart` ; `litValve` ; en douce, avant que le verre ne le montre : `fill` 0,4, `boil` 1 |
| `weight` → `seat` → `hole` | « un poids, posé sur un trou. » | `xray` 1 ; sur « poids » : `off` 0 → 1 — le poids quitte sa cheminée, le trou se voit ; sur « posé » : `off` 1 → 0 — il redescend dessus (le son claque à `seat+0.25`) ; sur « trou » : `chip-poids` |
| `toomuch` → `lifts` → `out` | « Trop de pression ? La vapeur le soulève… et sort. » | recul d'un cran (on voit le dessous du couvercle) : `bar` 0 → 1 et `seen` 0 → 0,8 sur « Trop de pression ? » — la vapeur signal s'accumule, l'en-tête grimpe jusqu'à « +350 kg » ; sur « soulève » : `whistle` 0 → 1, le poids se soulève ; sur « sort » : le jet veille (`plume` 0,5) |
| `noise` → `settles` | « Ce bruit, c'est la pression qui se règle. » | deux respirations lentes : `whistle` 1 → 0,6 → 1 → 0,6 → 1 avec `bar` 0,9 → 1 → 0,9 → 1 et `seen` qui suit — le poids se pose, la pression remonte, il se relève. Jamais plus vite qu'un souffle (≥ 0,7 s la demi-période). `chip-regle` |
| `toverrou` → `left` → `pin` → `blocks` | « Et tant qu'il reste de la pression, une tige bloque le couvercle : » | **coupe** (de la soupape à la tige : un quart de tour) vers `VIEW.pinPart`, `{ ...BENCHED, fill: 0.4, boil: 1, whistle: 1, plume: 0.3, bar: 0 }` : la tige est en bas ; sur « reste de la pression » : `bar` 0 → 1 — **elle monte toute seule dans le trou de la butée**, l'en-tête grimpe ; `litPin` sur « tige » |
| `nope` | « impossible de l'ouvrir. » | sur « impossible » : `twist` 0 → 1 — le couvercle part pour tourner et bute net sur la tige (le son claque) ; `twist` → 0 ; `chip-tige` |
| `toseuil` → `quiet` → `watch` | « Abonne-toi : le jour où elle se tait… regarde. » | `followCall(tl, { from: toseuil + 0.1, to: … })` — les chevrons `#rail-seuil`, le nom du compte s'allume ; **le film ne s'arrête pas** : la caméra quitte déjà la tige pour remonter à la soupape qui siffle (`plume` → 0,6) ; sur « tait » : `whistle` 1 → 0, le jet meurt, l'en-tête dit « Muette » — l'image de la promesse, qui revient ; sur « regarde » elle plonge vers le trou. Rend la main à `tozero`. |

## 03 · RÉPONSE — `acte3.js` (`tozero` → `toverdict`)

En coupes. La jauge `#gauge` entre sur « Plus un bruit » (`D.panel("#gauge", mute + 0.3, …)`) et tient la zone haute jusqu'après « tombe » : **cadre chaque plan sous elle** (480 → 680 px, opaque). Le feu reste allumé tout l'acte (`flame` 1) : tu n'as encore rien coupé.

| repère | la voix | l'image |
| --- | --- | --- |
| `tozero` → `plugs` | « La mousse bouche le trou. » | **coupe** : la cuisine, sous le couvercle (`VIEW.foam`) — `{ ...STAGED, you: 0, xray: 1, seen: 0.5, foam: 0.85, plume: 0.3 }` ; sur « bouche » : `foam` → 1 et `clog` 0 → 1 — la mousse entre dans la bouche de la cheminée et vire au signal |
| `mute` | « Plus un bruit. » | **coupe** : dehors, la soupape de près (`VIEW.valve`), `xray` 0 : le poids posé, immobile, plus de jet — et plus de son (le sifflement s'arrête sur ce repère). L'en-tête : « +350 kg · Muette ». **L'image TIENT.** La jauge entre. |
| `climbs` → `more` | « Dedans, la pression monte. Encore. » | **coupe** : la cocotte entière (`VIEW.system`), `xray` 1, `seen` 1 : `bar` 1 → 1,45 sur « monte », → 1,8 sur « Encore » — le signal s'épaissit sous le couvercle, les traits de poussée battent plus fort ; la jauge passe son repère et vire au signal (`#gauge-s1`, « Monte ») ; `gel` 0 → 0,15 au plus |
| `holds` | « Le couvercle, lui… tient toujours. » | **coupe** : le bord du couvercle (`VIEW.lugs`), `xray` 0 : ses ergots sous ceux de la cuve, `litLid` ; la tige en haut dans sa butée. Rien ne bouge : **l'image TIENT** (le `hold`). |
| `toreponse` → `trigger` | « La soupape de sécurité s'ouvre. » | **coupe** : `VIEW.safety` ; sur « s'ouvre » (`trigger`) : `safety` 0 → 1 en quatre images — elle se soulève, son jet veille ; `chip-secu` (sur son point) |
| `vents` | « La vapeur sort. » | léger recul pour voir le jet (`plume` 0,7) ; `bar` 1,8 → 1,35 : la jauge redescend d'un cran |
| `blocked2` | « Et si elle est bouchée, elle aussi ? » | sur « bouchée » : `clog2` 0 → 1 — son jet meurt ; `bar` 1,35 → 2 : la jauge va au bout. Le silence revient. `chip-secu` sort. |
| `tojoint` → `yields` → `side` | « Le joint cède, sur le côté. » | **coupe** : `VIEW.windowSide` (de profil) ; sur « cède » : `leak` 0 → 0,5 — le joint fait hernie par la fente du couvercle ; sur « côté » : → 0,8 |
| `leaks` → `onpurpose` | « Il fuit. Exprès. » | sur « fuit » : `leak` → 1 — la vapeur part sur le côté, veille ; sur « Exprès » : **coupe** de trois quarts (`VIEW.window`), `litSeal`, `chip-joint` |
| `falls` | « La pression tombe. » | **coupe** : la cocotte entière (`VIEW.system`), `xray` 1 : `bar` 2 → 0 et `seen` 1 → 0,2 — le signal se vide, l'en-tête décompte jusqu'à « 0 kg » et passe en veille, la jauge retombe sous son repère (`#gauge-s2`, « Tombe »), la tige redescend toute seule ; `mood` 1 → 0 sur « tombe ». La jauge sort avant `toverdict`. |

## Fin — `fin.js` (`toverdict` → la fin)

**L'ordre ne se discute pas** (CLAUDE.md, « Appels à l'action ») : la chute → ce qui est dû et la question du commentaire → le like → le prochain dossier, EN TOUT DERNIER → la boucle. Après le panneau du prochain dossier, plus rien du sujet ne revient, sauf la première image. La voix ne dit pas « Abonne-toi » ici : c'est le panneau qui le porte. Compare ta dernière image à la première (`look` aux deux instants) : elle doit être la même. `D.commit` prévient dans la console si un nombre de l'état n'est pas revenu — `look` ne l'affiche pas : relis `D.first`.

| repère | la voix | l'image |
| --- | --- | --- |
| `toverdict` → `secret` → `noblast` → `verdict` | « Voilà son secret : une cocotte aux normes n'explose pas. Elle fuit. » | **coupe** : l'établi, la cocotte entière qui fuit par le côté, calme (`{ ...BENCHED, leak: 1, bar: 0.3, plume: 0.6 }`, `VIEW.whole`, la fuite vers la gauche du cadre) ; `retitle` : le titre entre sur `secret`, « Explose » barré sur « n'explose **pas** », « Fuit » sur `verdict` ; `D.verdict(verdict)` ; le titre sort avant `burns` |
| `burns` → `opened` | « Ce qui brûle, c'est un couvercle… ouvert sous pression. » | **coupe** : `VIEW.pinPart`, `{ ...BENCHED, bar: 1, whistle: 1, plume: 0.3 }` — la tige en haut dans sa butée, `litPin` ; sur « ouvert » : `twist` 0 → 1, le couvercle bute et ne s'ouvre pas ; `chip-brule`. Personne, aucune projection. |
| `tocta` → `yours` | « Et si la tienne se tait ? » | **coupe** : la cuisine, toi à la plaque (`VIEW.youAt` ou le cadre de l'accroche) — `{ ...STAGED, foam: 1, clog: 1, whistle: 0, bar: 1.4 }` : muette, « +350 kg · Muette ». La question de l'accroche revient, tout de suite. |
| `fireoff` | « Coupe le feu. » | `press` 0 → 1, puis `flame` 1 → 0 : la couronne meurt sous la cocotte (le son claque à `fireoff+0.2`) ; `chip-feu` (place fixe, zone haute) |
| `letfall` | « Laisse la pression retomber. » | `xray` 1, `seen` 0,8 : `bar` 1,4 → 0,5 sur toute la phrase — le signal s'éclaircit, l'en-tête décompte ; `chip-attends` |
| `noforce` | « Ne force jamais le couvercle. » | **coupe** : la tige de près, dans la cuisine (`moved(VIEW.pinPart, [0, 0, 0], HOME)`), `you` 0, `xray` 0 : il reste de la pression (`bar` 0,5), elle est en haut ; `twist` 0 → 1 → 0 : ça bute ; `chip-force` |
| `clean` | « Puis nettoie la soupape. » | `bar` → 0 (la tige redescend, « 0 kg » en veille, `mood` 0) ; **coupe** : `VIEW.valve` ; `off` 0 → 1 — le poids ôté ; `clog` 1 → 0 : le trou dégagé ; `chip-nettoie` ; puis `off` → 0 |
| `ask` → `answer` | « En commentaire : elle te fait peur, ta cocotte ? » | la cocotte entière, froide, le poids reposé ; les étiquettes sont sorties ; `commentCall(tl, { from: ask, word: …, typedAt: answer, chars: 6, to: tolike − 0.3 })` |
| `tolike` → `brim` | « Like : quelqu'un, ce soir, va la remplir à ras bord. » | **coupe** : la cuve de verre (`VIEW.level`) — `{ ...STAGED, you: 0, flame: 0, bar: 0, whistle: 0, boil: 0, xray: 1, fill: 0.5 }`, `mood` 0 ; sur « ras bord » : `fill` 0,5 → 1 ; `likeCall` (`#net`), qui sort avant `foamy` |
| `foamy` → `half` | « Ce qui mousse : jamais plus de la moitié. » | sur « jamais » : `fill` 1 → 0,5 ; sur « moitié » : `mark` 0 → 1, le trait veille autour de la cuve ; `chip-moitie` (zone haute, `#net` parti) |
| `toabo` → `next` → `belt` → `charge` | « Prochain dossier : ta ceinture de sécurité. Au choc, une charge explosive part dans son enrouleur. Exprès. » | **coupe** : l'établi, la cocotte entière (`BENCHED`), approchée jusqu'à occuper la moitié de la largeur, sous le panneau ; `nextFile(tl, { showAt: next, factAt: charge, hideAt: toloop − 0.38, railFrom: toabo + 0.1, railTo: abo$ + 0.15 })`. Rien d'autre ne bouge. |
| `toloop` → `rewind` | « Tout le contraire de… » | **coupe** : la cuisine, `STAGED` ; `D.loop({ at: toloop, rewindAt: rewind, fromD })` ramène tout à `FIRST` et à `POSE0` : la cocotte siffle sur son feu (le sifflement revient au son sur `toloop`) — « Ta cocotte-minute siffle. » |

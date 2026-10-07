# Audit « son » — 005 Arrêt d'urgence, 006 Défibrillateur

Je n'entends pas : tout ce qui suit est mesuré (fichiers `mesures_00X.txt`, `calage_00X.txt`, `niveau_00X.txt`, `spectro_*.png` de ce dossier) ou lu dans le code. Aucun prototype n'a été écouté ni validé : la tentative de la première passe (`proto_run.mjs`) a planté sur une erreur de syntaxe, il n'en sort aucun chiffre. Les valeurs proposées sont des points de départ à mesurer avec `analyse.mjs` puis à faire écouter à Merwan.

## Le constat en une phrase

Sur un téléphone, l'habillage n'est pas un fond : c'est une suite de souffles et de bips. 89 à 90 % de l'énergie de `bed.wav` est sous 200 Hz (005 : 90,0 % ; 006 : 89,0 %), donc la nappe, les battements de cœur et le poids des impacts disparaissent. Ce qui reste (whoosh, blip, tick, riser) n'est pas baissé sous la voix et tombe pile dans sa bande d'intelligibilité.

## Propositions, de la plus rentable à la moins rentable

### P1 — 006 : le cœur qui repart ne s'entend pas (episode.json:167-168, sfx.mjs:195-209)
- Mesure : `heartbeat` = 97 % sous 200 Hz ; sur téléphone (>400 Hz) −65,7 dBFS, soit 43 dB sous la voix. Phrase « repart » (51,75 → 55,67 s) : 0 évènement, fond téléphone −63,2 dBFS. Le moment émotionnel du film est muet sur le haut-parleur qui le diffuse.
- Correctif dans `heartbeat` : ajouter un corps médium et un clic de valve, garder le sub pour le casque.
```js
// dans la boucle [dt,k] de heartbeat
const body = Math.sin(TAU * (190 + 120 * Math.exp(-x / 0.02)) * x) * 0.55 * Math.exp(-x / 0.05);   // 190–310 Hz
const valve = (Math.sin(TAU * 620 * x) + 0.5 * Math.sin(TAU * 930 * x)) * 0.30 * Math.exp(-x / 0.018); // « toc »
return (Math.sin(phase) + 0.45 * Math.sin(phase * 2) + body + valve) * Math.exp(-x / 0.07) * k * g * ...
```
- Cible mesurable : battement à −14 … −18 dB sous la voix dans la bande >400 Hz (aujourd'hui −43).
- Mise en scène sonore du 006 (gratuit, aucune phrase ne change) : **le cœur est le motif du film**.
  - Accroche : `{ "type": "heartbeat", "from": 0.05, "to": "accroche:pompe", "bpm": 72, "gain": -16 }` — deux ou trois battements, puis plus rien sur « ne pompe plus ». Remplace le 2ᵉ impact (ligne 121, −10 dB à 0,86 s, sub pur).
  - 4 → 51 s : aucun battement « sain » (les deux `heartbeat` à 108 bpm des lignes 135 et 152 sont le massage : les garder mais avec un timbre différent, plus mat, `valve` à 0).
  - « Et le cœur repart » (repère `beat`) : premier battement **seul**, dans le silence déjà mesuré (50,5 s = demi-seconde la plus calme du film, −75,8 dBFS), puis 65 bpm, gain −13 au lieu de −15.
- À vérifier : le nom exact du mot pour `accroche:pompe` et que `under` (bus baissé sous la voix) ne l'écrase pas — sinon écrire le battement de l'accroche sur le bus principal.

### P2 — kit : une nappe qui existe sur téléphone et qui change à la chute (sfx.mjs:68-101)
- Mesure : nappe + battement sur téléphone = −56 à −66 dBFS **constant** d'un bout à l'autre des deux films (colonne G). La courbe `curve` (0,12 → 1) écrite dans chaque episode.json n'est audible qu'au casque : pas de tension qui monte, pas de respiration. Harmoniquement : 55 / 82,4 / 110 / 164,8 / 220 / 329,6 Hz = une quinte à vide sur la, figée, la même dans tous les épisodes.
- Correctif : ajouter à `drone` une couche « pad » entre 220 et 1 320 Hz, dont l'accord dépend d'un second paramètre `mood` (comme `mood` à l'image : 1 = signal, 0 = veille).
```js
// drone({ gain, curve, mood = [[0, 1]] })  — mood interpolé comme curve
const TENSE = [220, 261.63, 311.13, 440];        // la – do – mi♭ : triton, la menace
const CALM  = [220, 277.18, 329.63, 493.88];     // la – do# – mi – si : majeur + 9e, la respiration
const pad = (t, m) => {
  let s = 0;
  for (let k = 0; k < 4; k++) {
    const f = TENSE[k] + (CALM[k] - TENSE[k]) * (1 - m);   // glisse en ~1 s quand mood change
    const trem = 0.6 + 0.4 * Math.sin(TAU * (0.11 + 0.03 * k) * t + k);
    s += (Math.sin(TAU * f * t) + 0.35 * Math.sin(TAU * f * 2.001 * t)) * trem * [0.30, 0.22, 0.20, 0.10][k];
  }
  return s;
};
// dans write(): tone + pad(t, moodAt(t)) * 0.55 + lp * 1.2 + ...   (lp passe de 2.0 à 1.2)
```
  (intégrer la phase au lieu de `sin(TAU*f*t)` si f glisse, comme le fait déjà `impact` avec `phase +=`.)
- Cible mesurable : nappe à −20 … −24 dB sous la voix dans la bande >400 Hz pendant la parole (aujourd'hui −32), et un écart d'au moins 8 dB entre le creux et le sommet de `curve` dans cette bande.
- Réglages d'épisode : 006 `mood` = `[[0,1],["dark",1],["beat",0],["rewind",0.6]]` ; 005 `[[0,1],["bottom",1],["stopped",0],["chicago",0.3],["rewind",0.7]]`. La chute devient audible : même cadre, l'accord a changé — l'équivalent sonore de « tout a changé de couleur ».
- Le `duck` actuel (sfx.mjs:233-249) ne s'applique qu'à `under` (nappe, battement), c'est-à-dire à ce qu'un téléphone ne joue pas. Avec le pad il devient utile : passer de −4,5 à −6 dB pour 005/006 une fois le pad en place, puis mesurer.

### P3 — kit : les effets passent devant la voix (sfx.mjs:129-150, 182-224 ; pas de duck sur ce bus)
- Mesure, bande téléphone, fenêtres de 0,25 s où un mot est dit :
  - 005 : 19 fenêtres sur 218 où la voix a moins de 6 dB d'avance, minimum **−13,3 dB**. Les pires : 41,25–41,50 s « la barre **tombe** » −8,0 / −12,0 dB (whoosh −18, ligne 141) ; 15,50 s « d'autres » −11,5 dB (whoosh −21 + ticks −16, lignes 119-122) ; 7,25 s « 2 s » −6,2 dB (ligne 110-111) ; 84,00 s « d'une… » −13,3 dB (rewind, ligne 159) : **le dernier mot du film, celui qui fait la boucle, est couvert**.
  - 006 : 12 sur 215, minimum +0,5 dB : nettement mieux, sauf 44,00 s (voir P4) et 15,25 s (+0,5 dB, whoosh −22 de la ligne 131).
- 72 à 77 % des évènements sont déclenchés pendant qu'un mot est dit. Le whoosh (51 % de son énergie entre 1 et 3 kHz, 33 % entre 3 et 6 kHz) est exactement dans la bande des consonnes.
- Correctif moteur : un second bus baissé sous la voix pour whoosh, riser, rewind, tick en rafale (pas pour blip ni impact, qui sont des ponctuations courtes).
```js
const fx = { L: new Float32Array(N), R: new Float32Array(N) };   // whoosh / riser / rewind / tick(count>3)
// ... après la boucle `under` :
const fxLow = db(ep.duckFx ?? -7), dn = 1 - Math.exp(-1 / (0.03 * SR)), upf = 1 - Math.exp(-1 / (0.18 * SR));
let gf = 1;
for (let i = 0; i < N; i++) { const tg = speaking[i] ? fxLow : 1; gf += (tg - gf) * (tg < gf ? dn : upf); L[i] += fx.L[i] * gf; R[i] += fx.R[i] * gf; }
```
  et dans `whoosh` : `fc = 240 + 1500 * sin²` (au lieu de 280 + 2400) pour sortir du 2–4 kHz.
- Correctifs d'épisode 005 immédiats (sans toucher au moteur) : ligne 141 `gain -18 → -24` ; lignes 119-120 `-16 → -22` ; ligne 159 `"at": "rewind"` → commencer après la fin du dernier mot (`"boucle$+0.05"`, `dur` 0,9) — à vérifier contre `tail` (0,45 s) : sinon allonger `tail` à 1,0 s, ce qui est gratuit.
- Cible : aucune fenêtre parlée sous +6 dB (téléphone), à faire contrôler par `qa` (P9).

### P4 — 005 et 006 : le climax n'a pas son silence avant le coup, et le coup écrase le mot (006:162-164 ; 005:136-137, 143-145)
- 006 : le riser (−13, 1,5 s) monte jusqu'à `shock` (44,130 s) ; la voix a repris à 44,01 s. Le coup (−6 dB, `size` 1,6) tombe **sur** « Cent cinquante joules » : voix/fond pleine bande −6,8 dB, téléphone +1,2 dB, et le limiteur du mastering retire jusqu'à 3,7 dB pendant 250 ms (calage_006, I) — c'est la voix qui est baissée par le coup. Même chose en 005 : « Zéro » (−1,7 dB), « Plus » (−2,1 dB), « 2 s » (−3,2 dB).
- Sur téléphone, le coup lui-même n'existe presque pas : `impact` = 98,8 % sous 200 Hz, il perd 22 dB. La seconde 44 est la plus forte du film en pleine bande (−10,6 dBFS) et **banale** sur téléphone (−20,8, comme la seconde 42). Le climax n'est pas plus fort que le reste là où il est écouté.
- Correctif « montée → silence → coup » :
  1. `hold` de `analyse` +0,35 s (gratuit : c'est un silence) pour que le coup tombe dans un trou de 0,8 s et que « 150 joules » soit dit **après**. À vérifier : comment `shock` est défini dans `cues` (s'il est ancré sur un mot de `choc`, l'ancrer sur `analyse$+0.45`), et que l'image du choc suit le même repère.
  2. Riser coupé net 0,12 s avant le coup : `{ "type": "riser", "to": "shock-0.12", "dur": 1.5, "gain": -13 }` + dans `riser`, fin sans traîne (déjà le cas : enveloppe `u*u`, arrêt sec). La nappe aussi : `["shock-0.12", 0.0]` dans `curve` juste avant `["shock", 1]`.
  3. Un coup qui a du médium (ci-dessous).
- `impact` traduit pour le téléphone (sfx.mjs:103-127) :
```js
const drive = (v) => Math.tanh(v * 2.6) / 2.6;                     // harmoniques 3, 5 du sub : fondamentale « devinée »
const crack = (hi - lp) * 1.1 * Math.exp(-t / 0.022);               // 1–4 kHz, 20 ms
const thud  = Math.sin(TAU * 240 * t) * 0.5 * Math.exp(-t / (0.06 * size));
return (drive(Math.sin(phase) * 1.8) * Math.exp(-t / (0.38 * size)) + Math.sin(knock) * 0.55 * ... + thud + crack + ...) * g * ...
```
  Cible : l'impact ne perd plus que 8 à 10 dB derrière un passe-haut à 400 Hz (22 aujourd'hui).
- Garder l'après-coup du 006 : `dark` à 49,69 s puis 50,5 s à −75,8 dBFS, « Silence… » dit dans un vrai silence. C'est la meilleure idée sonore des deux films.

### P5 — compte : un logo sonore, à l'ouverture et quand le nom s'allume (nouveau type `signature`)
- Constat : rien ne se reconnaît d'un épisode à l'autre. La première demi-seconde est un `impact` −13 (sub : inaudible sur téléphone) ; à la chute, `brandHud` s'allume en vert sur un `impact` −15 générique (006:169 `secret`, 005:147). Le seul motif récurrent est involontaire : les quatre blips montants du CTA like (pitch 0,9 / 1 / 1,12 / 1,26, identiques en 005:152-155 et 006:172-175) — à garder.
- Proposition : trois notes, timbre de verre (cohérent avec « rayons X »), dans 650–2 000 Hz.
```js
// signature({ at, gain = -17, open = false })
const NOTES = open ? [659.26, 987.77] : [659.26, 987.77, 1318.5];     // mi5–si5 (question) / mi5–si5–mi6 (réponse)
const STEP = 0.11;
NOTES.forEach((f, k) => write(t0 + k * STEP, 0.9, (k - 1) * 0.25, (t) =>
  (Math.sin(TAU * f * t) + 0.28 * Math.sin(TAU * f * 2.76 * t) * Math.exp(-t / 0.05)) * Math.exp(-t / (0.16 + 0.1 * k)) * g * Math.min(1, t / 0.002)));
```
  - `open: true` à 0,03 s de chaque film (deux notes, laissées en suspens : 0,25 s, sous l'accroche — elle ne retarde pas la voix).
  - forme complète sur le repère où `brandHud` s'allume (le dossier est « décodé » : la question reçoit sa réponse).
  - la boucle : le `rewind` finit sur la première note, et le film reboucle sur les deux notes d'ouverture.
- Décision de Merwan (identité) : ces trois notes ou d'autres ; à faire écouter en trois variantes.

### P6 — pipeline : 36 % de l'énergie du film est sous 200 Hz (ffmpeg.mjs:79 et :167)
- Mesure : FILM rendu <200 Hz = 37,4 % (005), 35,7 % (006). Niveau médian par seconde : −17,2 dBFS pleine bande, −22,4 sur téléphone (006). Le gain de mastering (+5,8 / +5,9 dB pour atteindre −14 LUFS) est calculé sur un signal dont un tiers ne sortira pas du téléphone : à −14 LUFS affichés, le film sonne plus faible que ses voisins du fil.
- Correctifs :
  - fond : passe-haut à 45 Hz sur `bed.wav` (dans sfx.mjs, un filtre un pôle ×2 avant le `tanh` ligne 254) et `lp * 2.0 → 1.2` (ligne 99).
  - voix (24,8 % sous 200 Hz, 1,1 % au-dessus de 6 kHz, perd 4,1 dB sur téléphone) : `voiceBody` → `highpass=f=85`, puis `equalizer=f=180:t=q:w=0.9:g=-2`, `equalizer=f=3000:t=q:w=1.1:g=2.5`. À faire écouter : c'est le timbre d'Eric qui change, légèrement.
- Cible : part <200 Hz du film rendu sous 25 %, écart pleine bande / téléphone sous 3,5 dB.

### P7 — 005 : la descente des barres n'a pas de son qui descend (005:141-146)
- Aujourd'hui : whoosh (qui couvre « tombe »), impact −9 à `fall`, riser 2,6 s **montant** jusqu'à `bottom`, impact −7. Une chute de deux secondes illustrée par un son qui monte.
- Proposition : un `riser` inversé (`down: true` : `90 + 520 * (1-u)²`) de `drop` à `bottom`, et la nappe qui s'éteint avec le vert qui descend (`mood` 1 → 0 entre `bottom` et `stopped`). Paramètre à ajouter dans `riser` : une ligne.

### P8 — kit : densité et hiérarchie des évènements
- Mesure : 53 (005) et 57 (006) évènements, 0,63 et 0,67 par seconde ; 16 et 17 impacts par film dont 10 entre −14 et −17 dB : presque tous inaudibles sur téléphone, ils ne servent qu'à manger de la marge au casque.
- Règle proposée : au plus 6 impacts par film, trois niveaux seulement (−6 climax, −10 coupe d'acte, −14 chute) ; les ponctuations de coupe passent en `tick`/`blip` grave. 006 : retirer les impacts des lignes 136, 155, 158, 170, 178 (−16 à −18, `size` ≤ 0,9).
- 006 `flutter` (ligne 129) : 22 ticks réguliers à 0,085 s = un métronome à 11,8 Hz, alors que la fibrillation est le désordre. Ajouter à `tick` un paramètre `jitter` (écart semé ±40 %, `kit/lib/rng.js` côté son : `rng()` existe déjà dans sfx.mjs) et le reprendre sur le tracé « fibrillation ».
- 006 `eclate` : blips à 0,85 / 0,95 / 1,05 / 1,3 (lignes 143-147) : bonne idée (une note par pièce) ; la finir en montant vers la première note de la signature.

### P9 — pipeline : faire entrer ces mesures dans `npm run qa`
- Reprendre de `analyse.mjs` (ce dossier) trois contrôles, sur `audio/voix.wav` et `audio/bed.wav` : (1) fenêtres parlées où la voix a moins de 6 dB d'avance derrière un passe-haut 400 Hz, avec le mot et l'évènement en cause ; (2) part <200 Hz de `bed.wav` ; (3) retrait du limiteur > 1,5 dB pendant un mot. Seuils : 0 fenêtre, < 60 %, 0.

### P10 — méthode (007 et suivants) : écrire le son comme on écrit l'image
- Un motif sonore par dossier, tiré du système (006 : le cœur ; 005 : le bourdonnement 50 Hz de l'électroaimant rendu à 200–400 Hz, qui s'arrête net sur « Zéro » ; 007 : le sifflement de la fusée). Il apparaît à l'accroche, disparaît, revient à la chute.
- Aucun évènement sur un mot porteur (chiffre, verbe du climax) ; les sons se placent dans les silences mesurés (`F` : 21-22 silences, 14,5-15,4 s par film, dont beaucoup vides sur téléphone à −60 dBFS).
- Tout son doit passer le test « passe-haut 400 Hz » : s'il perd plus de 10 dB, il lui faut un corps médium.

### P11 — décision de Merwan : son original ou son tendance
- Le film sort avec son propre son (« son original – Système Décodé »). Option : ajouter dans l'app un son tendance à 1–5 % de volume pour profiter de sa page. Contre : le mixage est fait pour la voix, un son tiers par-dessus le pad proposé fait de la bouillie, et un compte qui veut une identité a intérêt à ce que son « son original » soit réutilisable. Pour : gratuit, réversible, mesurable sur deux vidéos. À trancher, puis comparer les vues « page du son ».

## Ce qui est juste et ne doit pas bouger
- Calage : tous les impacts tombent sur leur repère à 0 ms, décalage du MP4 0,0 image (calage_005/006, H). Seul écart : 005 `release+0.17`, voulu.
- Image et son lisent les mêmes `cues`.
- Équilibre du rendu : le film joue bien voix + 0,8 × fond, même gain sur les deux (niveau_00X, J).
- Rapport voix/fond médian : +29 à +31 dB sur téléphone — la voix est devant presque partout ; le problème est dans les 10 % de fenêtres les pires, pas dans la moyenne.
- 006, 50–55 s : le vrai silence après le choc.
- Synthèse déterministe, sans échantillon ni licence.

## Preuves : où regarder
- `mesures_005.txt`, `mesures_006.txt` : A niveaux, B bandes, C téléphone, D voix/fond dans le temps, E évènements, F silences, G progression.
- `spectro_bed_006.png` : masse lumineuse sous 100 Hz, un filet à 220–330 Hz, cônes des whoosh de 500 Hz à 18 kHz, points isolés des blips ; trou de 49,5 à 52 s ; de 53 à 65 s les battements ne dépassent pas 330 Hz.
- `spectro_film_006.png` : la voix occupe 100–5 000 Hz ; à 44 s la colonne jaune du choc va de 20 à 500 Hz.
- Non fait, à vérifier : écoute réelle sur iPhone ; définition des repères `shock` et `rewind` dans `cues` ; stéréo (les spectrogrammes sont en mono, les whoosh sont panoramiqués à ±0,7 : sur un haut-parleur de téléphone, quasi mono, rien à craindre) ; la comparaison avec 002–004 (fichiers `film_00X.wav` extraits, non analysés).

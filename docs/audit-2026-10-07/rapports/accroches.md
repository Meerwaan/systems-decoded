# Audit « accroches » — les 10 premières secondes (002 à 006)

Version finale. Images regardées : 19 (hook_01 + film_01 des 002, 003, 004 ; hook_01/03/05/06 du 005 ; hook_01/02/03/05/06 du 006 ; f005_0000.png, f006_0000.png, c005_0620.png, c006_0890.png dans ce dossier). Rien n'a été modifié dans le dépôt. Les valeurs de pose proposées n'ont PAS été essayées (interdit de lancer `look`) : elles sont des points de départ, à régler avec `npm run look`.

## 1. Classement

1. **004 Différentiel** — seul film qui bouge dès l'image 0 (cœur qui pulse, étincelles : mouvement 7,8 à la seconde 0), le sujet remplit le cadre et c'est « toi » (ton corps, ta main). Limites : première carte trop courte pour qui lit sans le son (« 230 V / TU TOUCHES LE FIL… », la menace n'est écrite qu'à 3,5 s), A long (5,79 s).
2. **002 Airbag** — l'image la plus lisible et la plus lumineuse (volant noir sur halo vert, 65 % de la largeur, lum. 77), le meilleur texte (chiffre + délai + « t'explose »), et le seul C qui soit une vraie question personnelle payée au CTA. Les bascules vert → rouge → vert → rouge racontent A, B, C sans le son. Limite : rien ne bouge avant 3,5 s.
3. **003 Ascenseur** — le texte le plus rapide (A fini à 2,84 s, A·B·C à 6,44 s) et un vrai évènement à 2,57 s (le câble casse). Limites : image sombre (lum. 31), figée 2,5 s, carte en attente posée sur le fil de fer de la cabine (peu lisible à l'image 0).
4. **006 Défibrillateur** — la chute dans la première seconde et un premier acte en un mouvement. Limites : image 0 la plus sombre (lum. 23) et ambiguë (personnage « assis »), danger sur un tiers, 3 s de corps au sol sans rien qui se passe, C fini à 10,59 s.
5. **005 Arrêt d'urgence** — la meilleure idée des cinq sur le papier, la plus faible à l'image : 4,6 s strictement figées, sujet à 41 % de la largeur, et l'image dit le contraire du texte (tout est allumé pendant « Panne de courant »).

Ce classement est un jugement sur l'image et le texte : aucune courbe TikTok ne le confirme encore (voir § 8).

## 2. Mesures

| | 1er mot | fin du A | fin du C | mots affichés | lum. image 0 | secondes figées (0→5 s) | 1er évènement à l'image |
| --- | --- | --- | --- | --- | --- | --- | --- |
| 002 | 0,35 s | 4,75 | 8,99 | 26 | 77 | 3 (s0-s2) | 3,5 s (moyeu rouge) |
| 003 | 0,28 s | 2,84 | 6,44 | 24 | 31 | 1-2 (s0, s1) | 2,57 s (rupture) |
| 004 | 0,35 s | 5,79 | 9,31 | 28 | 62 | 0 | 0 s (pouls) |
| 005 | 0,28 s | 4,28 | 9,56 | 31 | 33 | 4 (s0-s3) | 4,6 s (glissement) ; 9,24 s (bobines) |
| 006 | 0,28 s | 3,72 | **10,59** | 33 | 23 | 0 | 0 s (chute) |

Mouvement par seconde (motion.js de la première passe : écart moyen entre images à 10 i/s, 108×76 px, probablement la bande 440-1200 ; < 1,5 = figé) :
002 : 0,8 · 1,4 · 1,1 · 6,1 · 4,6 · 10,8 · 16,0 · 5,4 · 1,2 · 14,5
003 : 1,0 · 1,6 · 6,2 · 2,5 · 2,3 · 15,8 · 8,2 · 23,4 · 2,1 · 4,9
004 : 7,8 · 8,1 · 8,4 · 11,3 · 10,9 · 6,2 · 26,5 · 18,5 · 8,6 · 6,3
005 : **0,3 · 0,4 · 0,5 · 0,4** · 4,2 · 2,8 · 0,7 · 1,2 · 13,6 · 2,2
006 : 9,2 · 7,4 · 6,3 · 2,5 · 11,8 · 6,4 · 5,8 · 7,6 · 10,2 · 15,1

Débit observé : 3,0 à 3,9 mots/s pauses comprises, ≈ 3,3 en moyenne. Pour finir le C avant 9,5 s : 30 mots au plus. Les heures de fin données pour les réécritures sont des estimations à ce débit ; seule la voix enregistrée les fixe.

## 3. 005 — propositions gratuites (image, cartes, son)

**3.1 La panne se voit à 0,28 s** (episodes/005-arret-urgence/src/main.js:157 ; aujourd'hui un seul `shot(0, t.promesse - 0.35, { az: 23 })`, soit 7° d'azimut en 4,4 s). À ajouter après la ligne 157, clés d'état déjà existantes (`feed` l.182, `power` l.177, `shell`, `heat`) :

```js
// A — la panne arrive sur le mot : ce qui est alimenté s'éteint, le cœur reste seul allumé
st(0.26, 0.10, { feed: 0, shell: 0.45 }, "power2.in");   // la ligne verte et le verre : coupés en 3 images, sans clignoter
show("#chip-cut", 0.34, 0.10);                            // chip signal « COURANT · COUPÉ », place fixe : follow("chip-cut", null, 96, 470)
hide("#chip-cut", t.toi - 0.15);
st(t.toi - 0.10, 0.6, { shell: 1 });                      // « toi » : le verre revient (l'impact du son est déjà là, sfx[3])
st(t.promesse - 0.5, 0.4, { feed: 1 });                   // le film revient en arrière avant le B
```
La couronne reste verte ici : sa coupure garde son moment sur « la panne » (9,24 s, l.177), qui est déjà la meilleure démonstration du début. Une seule chute franche, pas de scintillement (règle « net et fluide »). Avant 0,26 s, la ligne d'alimentation doit se voir : tirets larges et qui courent (≤ 1/7 de période par image), sinon la coupure ne se lit pas.

**3.2 Le son dit la panne** (episode.json, `sfx`) :
- drone : `"curve": [[0, 0.9], [0.26, 0.9], [0.40, 0.12], ["you", 0.55], ["hands", 0.6], …]` — le bourdonnement tombe sur « Panne » : le silence est le son d'une panne.
- battement : `{"type":"heartbeat","from":"you","to":"hands","bpm":100,"gain":-22}` au lieu de `"from": 0.3`. Aujourd'hui il bat sur une cuve ; à partir de « toi », c'est le tien.

**3.3 Le B a sa démonstration** (main.js:160-165, index.html:48-52). Le panneau `#senses` (« MAINS : ne touche à rien / BOUTON ROUGE : inutile / DÉLAI : 2 secondes », 5,1 → 7,7 s) redit la voix ; ses sous-lignes ne se lisent pas à 270 px (c005_0620.png). À la place :
```js
// B — « il s'arrête tout seul, en deux secondes » : on le voit, en 2 s réelles
st(t.seul - 0.1, 2.0, { pre: 1 }, "none");               // nouvelle clé S.pre (0 dans FIRST)
st(t.panne + 0.3, 0.05, { pre: 0 });                     // remis à zéro quand le cœur est sorti du cadre
// l.396 : fall: Math.max(cur.fall * S.falls, fallOf(2 * S.pre)), reaction: reactionOf(…) sur la même valeur
```
et un seul chiffre dans la colonne de gauche : un compteur `0,0 s → 2,0 s` (style de `#next-fact b`, mono 150 px, veille), calé sur les deux `tick` déjà posés à « promesse:2 ». Le vert des barres descend, l'orange s'éteint : la phrase est montrée, sans le son. À décider : cela montre l'arrêt avant l'acte 3 (003 montre bien le parachute à 5,5 s) ; version minimale si refus = le compteur seul, sans `pre`.

**3.4 Le cadre et l'en-tête.**
- La cuve occupe x 320-760 (41 %), y 420-1310 : son fond passe sous la carte (« ET C'EST TOI QUI ES » est écrit sur le dôme de verre, f005_0000.png). Essayer avec `look`, quatre poses : (a) actuelle ; (b) `{ ...POSE0, el: 44, d: 4700 }` — plongée : objet moins haut, on voit le dessus du cœur ; (c) `{ tx: X, ty: -60, tz: 0, d: 2600, az: 30, el: 18, fov: 50, shift: 150 }` — grand angle depuis le pied, le cœur en gros en bas ; (d) (b) avec `side: -60`. Critère : bas du sujet ≤ y 1160, sujet ≥ 55 % de la largeur. POSE0 et FIRST servent aussi à la dernière image (l.350-351) : la boucle suit toute seule.
- `hud-clock` affiche « 100 % » sans libellé (index.html:38, main.js:429). Mettre « ≈ 3 000 MW » : le chiffre du script, qui dit le danger à l'image 0.

**3.5 Option lourde (L), à ne faire qu'avec la réécriture R005-3** : « toi » dans l'image — un personnage de verre (`kit/lib/figure.js`, `makeFigure({ hands: "flat" })`) devant un pupitre (trois boîtes, un bouton rouge), au pied de la cuve ; sa main part vers le bouton (`reach`) et s'arrête sur « rien ». Donne l'échelle (1,8 m contre une cuve de 13 m) et paie le CTA like (« un gros bouton rouge »). Risque : un pupitre modélisé vite fait jouet.

## 4. 005 — trois réécritures (premiers mots gardés : la boucle « …il suffit d'une… » → « Panne de courant » tient)

Défaut du texte actuel : le B désamorce la menace à 5 s, le C (« Et ce qui l'arrête… c'est la panne ») se répond dans la même phrase, et la question du CTA commentaire (« il chauffe encore combien de temps ? ») n'est jamais plantée.

**R005-1 — la question plantée** (A inchangé = pas de reprise ; reprise de `promesse` seule)
- A : « Panne de courant. Et c'est toi qui es aux commandes d'un réacteur nucléaire. »
- B : « Ne touche à rien : la panne l'arrête, en deux secondes. »
- C : « Arrêté, mais pas froid. Pour combien de temps ? »
- 31 mots, C ≈ 9,7 s (à la limite). Le C est payé par le CTA commentaire tel qu'il est. Image du C : le cœur éteint qui rougeoie encore (`heat` bas, pas zéro). Le paradoxe perd sa pause (« Et ce qui l'arrête… ») : c'est le prix.

**R005-2 — « Tout s'éteint. Pas lui. »** (reprises : `accroche` + `promesse`) — ma préférence
- A : « Panne de courant. Tout s'éteint… sauf ton réacteur nucléaire. »
- B : « Ne touche à rien : il s'arrête seul, en deux secondes. »
- C : « Sans courant. Sans toi. Alors, qu'est-ce qui l'arrête ? »
- 27 mots, C ≈ 8,5 s. L'image 3.1 devient la démonstration exacte du A (tout coupé, le cœur seul allumé). La réponse au C n'arrive qu'à la toute fin et c'est la boucle elle-même : « …il suffit d'une… / Panne de courant. » Repères à renommer : `you` → `accroche:sauf`, `crown` → `promesse:Sans-0.2`, `outage` → `promesse:arrête` ; `t.et`, `t.panne` dans main.js:161-178.

**R005-3 — le bouton rouge** (reprises : `accroche` + `promesse` ; demande 3.5)
- A : « Panne de courant. Aux commandes d'un réacteur nucléaire, ta main part vers le gros bouton rouge. »
- B : « Inutile. Dans deux secondes, il sera à l'arrêt. »
- C : « Et ce qui l'arrête… c'est la panne. »
- 31 mots, C ≈ 10 s. Croyance retournée, payée par le CTA like. À vérifier dans `sources` : un arrêt manuel existe ; le script dit « inutile », pas « inexistant ».

Coût : faire annoncer par `npm run voice -- 005 --retake <phrase>` (sans `--budget` il s'arrête après l'estimation) ; ordre de grandeur CLAUDE.md : ≈ 40 crédits par reprise de phrase. Accord de Merwan obligatoire.

## 5. 006 — propositions gratuites

**5.1 L'image 0** (main.js:54 `collapse: 0.5`, hall.js:340-348). À c = 0,5 les hanches sont au plus bas (−36 cm) et le buste penché de 31° : sur f006_0000.png on lit un mannequin assis sur une chaise invisible, pas une chute. Essayer avec `look` : `collapse` 0,15 (debout, genoux qui lâchent) / 0,62 / 0,72 (corps à ≈ 65°, jambes qui se déplient : une diagonale qui tombe). Mon pari : 0,70, puis `st(0.02, 0.62, { collapse: 1 }, "power2.in")` et `jolt(0.62, 0.3, 0.4)` (l.167-168), impact du son `"at": 0.86` → `0.63`.
- Sujet : le personnage fait ≈ 300 px de large. POSE0 `d: 420 → 330` (l.52).
- La boîte verte, promesse de l'image, fait ≈ 30×60 px à (905, 545), soit 8×15 px sur une vignette : `beacon: 1.4 → 2.2` dans FIRST, et allonger la traîne de `halo()`.
- Lum. 23 : la plus sombre des cinq. `ground: 0.2 → 0.3`, verre de la victime un peu plus clair au début.

**5.2 0,85 → 4,0 s : il ne se passe rien pendant « son cœur ne pompe plus »** (hook_02.jpg, hook_03.jpg : même image pendant 3 s ; la caméra passe de d 420 à d 400, l.169). Et le film sur le cœur n'a aucun battement au son avant 21,8 s (`sfx[16]`), alors que le 005 en a un sur une cuve.
```js
// trois battements qui faiblissent, puis rien sur « plus »
[[0.95, 1.5], [1.75, 1.3], [2.55, 1.15]].forEach(([at, k]) => { st(at, 0.08, { halo: k }, "power2.out"); st(at + 0.08, 0.45, { halo: 1 }); });
shot(0, t.promesse - 0.25, { tx: X - 30, ty: 30, d: 250, az: -60, el: 13, fov: 44, side: 30 }, "sine.inOut", POSE0.d);  // un vrai rapprochement vers la poitrine
```
`sfx` : `{"type":"heartbeat","from":0.95,"to":"accroche:pompe","bpm":75,"gain":-19}` et le drone qui tombe à `"accroche:plus"` (≈ 0,3). Trois battements à 0,8 s d'écart = une respiration, pas un clignotement. Le rapprochement règle aussi la tête de la victime, qui est sous le kicker « QUELQU'UN S'EFFONDRE » de 0,85 à ≈ 2,6 s (hook_01 ligne 2, hook_02) : viser le corps entre y 700 et 1150.

**5.3 Cartes sur l'armoire allumée, 7,8 → 9,2 s** (hook_05.jpg ligne 2, hook_06.jpg ligne 1, c006_0890.png). L'armoire occupe y ≈ 705-1605 : « PAS TE TROMPER » est vert sur fond vert, et la carte du C attend, grise à 50 %, sur du vert vif — c'est la phrase la plus importante de l'accroche au moment où elle est le moins lisible. `BOXCLOSE` (main.js:172) : `d: 210 → 300`, et régler `shift` pour que le bas de l'armoire reste ≤ y 1160 à `t.encore − 0.1`.

**5.4 « Devant toi »** : le personnage debout en haut à gauche n'a pas d'étiquette et sa tête touche l'en-tête. Si c'est bien toi (à vérifier dans hall.js), `#chip-toi` existe déjà (index.html:76) : le montrer de `accroche:toi` à `t.promesse − 0.3`.

**5.5 L'en-tête** : « CHANCES 100 % » en signal est le texte le plus saturé de l'image 0 et ne veut rien dire avant 16,2 s. Le laisser en `ink` jusqu'à `compte:minute`, ou le faire entrer à ce moment-là.

## 6. 006 — trois réécritures (premiers mots gardés : « …sur ton trajet, » → « Quelqu'un s'effondre »)

Défaut du texte actuel : 34 mots, B en deux phrases, C dit comme un constat et fini à 10,59 s. Le fond du C est le meilleur des cinq (personnel, payé au CTA commentaire) : on le garde.

**R006-1 — resserrée** (reprises : `accroche` + `promesse`) — ma préférence
- A : « Quelqu'un s'effondre, devant toi. Son cœur ne pompe plus. » (c'est le `voAlt[0]` déjà écrit, `[tense]`, avec virgule : la piste notée dans CLAUDE.md pour sortir du grave)
- B : « Au mur, une boîte verte peut le sauver : elle décide à ta place. »
- C : « Mais toi… tu sais où elle est ? »
- 29 mots, C ≈ 9,5 s. « Tu ne peux pas te tromper » n'est pas perdu : le beat `refuse` (61,9 s) le dit. Repères : `decide` → `promesse:elle-0.15`, `where` → `promesse:Mais-0.25` ; `t.tu`, `t.encore` (main.js:175-186).

**R006-2 — le compte à rebours** (reprises : `accroche`, `promesse`, `compte`)
- A : « Quelqu'un s'effondre. Son cœur ne pompe plus : chaque minute, dix pour cent de chances en moins. »
- B : « Une boîte verte, au mur, peut le sauver. »
- C : « Tu passes devant tous les jours. Tu saurais dire où ? »
- 34 mots, C ≈ 10,5 s : ne règle pas le retard du C, il échange ce retard contre un enjeu chiffré. Un chiffre dans le A comme 002 et 004 ; « CHANCES 100 % » prend son sens à la 3ᵉ seconde. `compte` devient « Les secours ? Un quart d'heure. Fais le calcul. » Trois reprises.

**R006-3 — « tu n'oserais pas »** (reprises : `accroche` + `promesse`) — tient la promesse faite par le CTA du 005 (« tu n'oserais jamais t'en servir »)
- A : « Quelqu'un s'effondre, devant toi. Son cœur ne pompe plus. »
- B : « Au mur, une boîte verte. Tu n'oserais jamais t'en servir. »
- C : « Pourtant c'est elle qui décide, pas toi. Sais-tu seulement où elle est ? »
- 31 mots, C ≈ 9,7 s. Le B devient une contradiction adressée au spectateur.

## 7. Moteur, pipeline, méthode

**Kit — la première carte** (kit/brand.css:231, kit/lib/overlay.js:149). Les mots en attente sont à 50 % : à l'image 0, toute l'accroche est grise, et dans trois films sur cinq elle est posée sur le sujet (003 : fil de fer de la cabine ; 005 : dôme de la cuve ; 006 : tête de la victime).
```css
.hook--first .hook__w { opacity: 0.7; }
```
```js
const { node, spans } = make(card, true); if (i === 0) node.classList.add("hook--first");
```
À vérifier à 270 px : l'écart 0,7 / 1 doit rester visible quand le mot s'allume (les mots accentués changent aussi de couleur).

**Pipeline — un contrôle d'accroche dans `qa`** (scripts/qa.mjs:24). Tout ce tableau du § 2 se calcule sans personne : mouvement par seconde de 0 à 5 s (motion.js de ce dossier, 30 lignes ; extraction probable : `-vf "fps=10,crop=1080:760:0:440,scale=108:76,format=gray" -f rawvideo`), luminance de l'image 0, heure du premier mot, fin du dernier mot des beats d'accroche, nombre de mots. Alertes proposées : une seconde < 1,5 avant 5 s ; premier évènement > 1 s ; fin du C > 9,5 s ; plus de 30 mots ; luminance image 0 < 30. Avec ce contrôle, le 005 n'aurait pas été rendu ainsi.

**Méthode — trois règles à écrire dans CLAUDE.md pour le 007 :**
1. **Un évènement à l'image avant 1 s, puis aucune seconde figée jusqu'à 5 s.** « La voix démarre vite » est écrit ; l'image, non. Quatre films sur cinq attendent 2,5 à 4,6 s.
2. **« Toi » est dans la première image** : ton volant vu du siège (002), toi dans la cabine (003), ton corps (004). Les deux derniers montrent une cuve (005) et quelqu'un d'autre (006).
3. **Le C est la question du CTA commentaire, mot pour mot ou presque.** Vrai pour 002 (les mains) et 006 (où est-elle) ; faux pour 003 (C : « pas un câble » / CTA : « tu sauterais ? »), 004 et 005 (C : la panne / CTA : la chaleur). Et se méfier du moule « Et ce n'est pas… » / « Et ce qui… c'est » : trois films de suite.

À noter sans y toucher (films en ligne) : dans 002, 003, 004 l'en-tête répète le kicker de la carte (« 50 km/h », « 12e étage », « 230 V » écrits deux fois à l'image 0).

## 8. Ce que seules les courbes TikTok diront

Demander à Merwan, pour 002, 003, 004 : la valeur de la courbe de rétention à 2 s, 5 s et 10 s. Trois questions y trouvent leur réponse : (a) l'image qui bouge dès 0 s (004) retient-elle plus à 2 s que les images figées (002 : 3,5 s ; 003 : 2,5 s) ? (b) le texte court du 003 (C fini à 6,4 s) retient-il mieux à 10 s que le 004 (9,3 s) ? (c) l'accroche criée du 003 — mais la comparaison 003/004 est brouillée par l'image, il faut le dire.

## 9. Ordre de travail conseillé

005 d'abord (c'est le prochain à sortir) : 3.1 + 3.2 (moins d'une heure, sans voix) → choix de Merwan entre R005-1/2/3 → 3.3, 3.4 → `look`, brouillon, `qa`. Puis 006 : 5.1 à 5.3 sans attendre, R006 avec la reprise de l'accroche déjà en suspens (68 crédits annoncés pour deux directions : la réécriture la remplace).

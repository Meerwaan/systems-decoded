# 035 · Passage à niveau — le plan des actes

Voix réelle (turbo, 83,1 s) ; tous les instants ci-dessous viennent de `npm run script -- 035` et des repères d'`episode.json` (59, vérifiés mot à mot). Contrat : `src/world.js` (`FIRST`, `VIEW`, `STAGED`, `BENCHED`, `STORY`, `trainAt`). Les poses de `VIEW` sont **provisoires (bouchons)** : partir de celles des journaux `docs/journal/035-model.md` et `035-passage.md` ; `docs/035-actes-maj.md`, s'il existe, prime.

## Pour tous les actes (le haut commun)

**L'histoire et l'en-tête.** T = 0 quand les R24 s'allument (`clock`, lu par « Feux +N s »). L'accroche est l'instant où la lisse de sortie se pose devant ton capot (T 5,6 → 8,4) ; la scène **revient à T = 0** (coupe à 8,38 : un retour en arrière franc, la plongée) et rejoue jusqu'à ce même instant (« Tu es enfermé » = l'image de l'accroche). L'acte 2 arrête le temps (`clock` 8,8 figé). L'acte 3 le relance en temps réel : `clock` 8,8 à 40,30 → ≈ 25 à 57,46 ; **le TGV suit `trainAt(clock)`** (nez à la route à T 22, soit 53,64 « le train passe »). « Barrières N/4 » se calcule seul (`loweredOf`) : ne pas le contredire à l'image.

**La grille de rétention** (`docs/recette-actes.md`) : image 1 qui bouge par son sujet (la lisse qui descend, le R24 qui bat, les phares du train) ; 10 → 25 s un changement toutes les 2 à 3 s, **aucune plage lente de 2 s** — la scène (8,5 → 17,3) est la deuxième accroche ; une coupe ou un changement d'échelle franc à chaque porte d'acte ; la fin pose la question en duel.

**Les mots qui frappent** (`D.punch`, un par phrase au plus, jamais sur une coupe ni à moins d'une seconde d'un autre) : `rails` 1,08 · `sortie` 5,52 · `clignotent` 8,82 · `enfermé` 16,90 · `céder` 28,56 · `après` 36,92 · `céder` (seuil) 39,72 · `grossit` 41,16 · `encore` 46,88 · `cède` 50,36 · `passe` 53,64 · `autre` 56,72 · `pas` 59,42 · `sort` 65,22. Les sons sont posés (`sfx`, dans les souffles) : ne pas en ajouter sur un mot.

**« Alors… on l'ouvre. »** est seule dans son plan : « Alors… » (18,08) la caméra quitte la voiture et se pose sur le signal héros (`VIEW.system`, fin de l'acte 1), coupe vers l'établi à `tobench` 18,71, **l'éclaté s'ouvre sur « on »** (`explode` 18,85), quasi-silence (`suck`, `hush`). Rien d'autre ne bouge pendant « Alors… ».

**La boucle.** Dernier mot « où… » 82,16 ; `toloop` 80,59 coupe près de `POSE0`, `rewind` 81,96 ; la dernière image est la première (`D.loop`, état `FIRST`).

**Anti-parasites.** La caméra ne frôle ni un mât ni une lisse pendant un mouvement rapide (ce qui ne sert pas au plan est invisible) ; plus d'un quart de tour en une seconde = une coupe ; les rails filés au ras se fondent (`passage.js` les dessine pour ça, ne pas les longer à plus de ≈ 3 m/s à moins d'un mètre) ; le R24 bat à 1 Hz, jamais plus vite ; `mood` franc (1 sur la route, 0 sur l'établi et dès « tes roues quittent les rails ») ; pas de `#flash` > 0,08 ; une étiquette a fini de sortir avant la coupe suivante. Personne n'est jamais sur une voie quand un train est dans le cadre ; on ne montre jamais une voiture qui force une barrière pour passer devant un train ; aucune légende « charnière / fixation / fusible ».

**Étiquettes** (`index.html`, une seule à la fois en zone haute 436–790) : `chip-r24`, `chip-sonnerie`, `chip-demi`, `chip-lisse` (acte 2) · `chip-annonce` (compte `annonce` 20 → 0) et `chip-entree` (repos) · `chip-800`, `chip-autre` (acte 3) · `chip-sort`, `chip-alerte`, `#duel` (Téléphone / Pancarte), `#retitle` (« Un mur » barré → « Ta sortie »), `#next` (036, sans chiffre) (fin).

## acte1.js

**0 → 18,71** (accroche, promesse, scène, « Alors… »). Un seul mouvement, **une seule coupe** (le retour en arrière à 8,38). Rend la main à `tobench` 18,71 sur `VIEW.system`, état : route, `gap` −3, `downIn` 1, `downOut` 1, `flash` 1, `ring` 1, `alive` 1, `clock` 8,8, `train` `trainAt(8.8)` ≈ 513, `beam` 1.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 0 → 1,84 | « Ta voiture est sur les *rails*. » | `POSE0` (FIRST) : au ras du ballast, la voiture de verre en travers de la voie 2, les phares du TGV au point de fuite derrière elle ; la lisse de sortie descend (`downOut` 0,62 → 1, posée sur « casser » 3,20), R24 qui bat, sonnerie. Punch `rails`. `clock` 5,6 → 8,4. La caméra glisse à peine, c'est le sujet qui bouge. | voiture ≈ 55 % de la largeur, rails sur toute la largeur, phares du train ≈ 3 % |
| 1,84 → 3,56 | « Et cette barrière est faite pour +casser+. » | sans couper : la caméra se rapproche et tourne vers l'avant de la voiture ; la lisse finit sa course **plein cadre** sur « casser » (son `impact` est posé après le mot). | lisse ≈ 70 % de la largeur |
| 4,03 → 5,95 | « Ce n'est pas un défaut : c'est ta +sortie+. » | la caméra glisse le long de la lisse posée jusqu'au pare-chocs, à quelques centimètres (vers `VIEW.hood` en plus serré) ; sur « sortie » 5,52, la lisse prend un liseré veille (`litBoom` 0,6, 0,8 s). | lisse + pare-chocs ≈ 75 % |
| 6,43 → 7,72 | « Sauf si ta voiture ne *roule* plus. » | à travers le pare-brise de verre, le tableau de bord : `alive` 1 → 0 de 7,24 à 7,56 (il clignote et meurt sur « roule ») ; le flux du moteur s'arrête. | capot + tableau ≈ 50 % |
| 8,38 (coupe) → 11,4 | « Les feux *clignotent*. La sonnerie tinte. » | **retour en arrière** : `VIEW.plunge` grand angle, `clock` 0, `downIn` 0, `downOut` 0, `alive` 1, `flash` 0 → 1 sur « feux » 8,62, `ring` 0 → 1 sur « sonnerie » 9,70 ; les quatre R24 battent ensemble ; en-tête 0/4. Punch `clignotent`. | le passage entier ≈ 90 % ; la voiture ≈ 25 % |
| 10,85 → 12,45 | « Devant, la file ne bouge plus. » | la caméra glisse vers l'avant au-dessus de la voiture : les feux stop de la file (`file` monte à 1 sur « file » 11,54) devant la lisse de sortie encore levée. | file + voiture ≈ 60 % |
| 12,69 → 14,4 | « Dans ton dos, la barrière descend. » | la caméra tourne en douceur (≤ 30°/s) pour prendre l'arrière : `downIn` 0 → 1 de 12,6 à 13,9 (posée sur « descend »), au premier plan ; en-tête 2/4. | lisse d'entrée ≈ 50 %, voiture derrière |
| 14,55 → 16,5 | « Puis devant ton capot… la deuxième. » | la grue continue par-dessus le toit vers l'avant (`VIEW.over`) : `downOut` 0 → 1 de 14,0 à 16,9, la lisse descend devant le capot. | capot + lisse ≈ 70 % |
| 16,63 → 17,30 | « Tu es *enfermé*. » | la lisse se pose sur « enfermé » 16,90 ; recul serré qui prend la voiture entre les deux lisses, les phares du train au bout de la voie 2 (en-tête 4/4 signal). Punch `enfermé`. `clock` 8,4 → 8,8 puis figé. | voiture ≈ 50 %, deux lisses aux bords |
| 18,08 → 18,71 | « Alors… » | la caméra quitte la voiture et se pose sur le signal héros entier (`VIEW.system`), rien d'autre ne bouge. | signal ≈ 60 % de la hauteur |

## acte2.js

**18,71 → 40,30** (on l'ouvre, éclaté, repos, seuil). Entre par `benchCut(D, { at: tobench, set: SET.BENCH, view: VIEW.system, origin: BENCHAT, state: BENCHED })`. Rend la main à `tozero` 40,30 sur la route, caméra au ras du rail en route vers les phares.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 18,71 → 20,1 | « …on l'ouvre. » | l'établi ; `explode` 0 → 1 dès « on » 18,85 (1,2 s), recul vers `VIEW.exploded` ; trois clics posés après « l'ouvre ». | éclaté ≈ 70 % de la hauteur |
| 20,16 → 21,7 | « À droite de la route, un mât : » | l'éclaté entier, le mât désigné (`litBar` bref sur le mât et le coffret ? — un liseré, pas d'étiquette). | signal ≈ 70 % |
| 21,87 → 22,45 | « un feu rouge, » | `VIEW.lampBench` : le R24 seul, `flash` 1 (il bat), `litLamp` ; `chip-r24` 21,9 → 22,55. Deux mots en moins d'une seconde avec le suivant : **un seul cadre glissant** du feu vers la sonnerie. | feu ≈ 45 % |
| 22,64 → 23,3 | « une sonnerie. » | la caméra monte à la sonnerie (`VIEW.bellBench`) : `ring` 1, `litBell` ; `chip-sonnerie` 22,7 → 23,4. | sonnerie ≈ 35 % |
| 23,56 → 25,45 | « La demi-barrière, blanc et rouge : » | recul le long de la lisse (`VIEW.boomBench`), `litBar` ; `chip-demi` 24,6 → 26,9. | lisse en fuite ≈ 80 % de la largeur |
| 25,68 → 26,8 | « elle brille dans tes phares. » | `sweep` 0 → 1 de 25,7 à 26,8 : deux phares passent, les bandes s'allument où ils frappent. | lisse ≈ 80 % |
| 27,00 → 28,9 | « Et sa lisse… est conçue pour +céder+. » | la lisse seule sur son halo veille (`litBoom` 1 dès « lisse » 27,24), en grand ; punch `céder` 28,56 ; `chip-lisse` 28,5 → 29,2. **Sans montrer où elle casse.** | lisse ≈ 85 % |
| 29,28 (coupe) → 32,7 | « Un train approche : le feu s'allume, au moins [20] secondes avant lui. » | la maquette : `VIEW.top` sur la route, `car` 0, `file` 0, lisses levées, `flash` 0 → 1 sur « feu » 30,63 ; `chip-annonce` de 30,7 à 37,3, `annonce` 20 (sur « vingt » 31,76) → 0 à 36,9. Le TGV loin (`train` ≈ 900). | passage ≈ 85 % |
| 33,12 → 35,5 | « Les barrières d'entrée descendent, puis celles de sortie. » | `downIn` 0 → 1 de 33,2 à 34,3, puis `downOut` 0 → 1 de 34,6 à 35,5 ; `chip-entree` 33,2 → 35,6 (remplace l'annonce ? une seule à la fois : l'annonce reste, `chip-entree` attend la sienne si la zone est prise — à trancher sur planche). | idem |
| 35,69 → 37,5 | « Et le train peut passer juste *après*. » | le TGV entre dans le cadre par la droite à peine la dernière lisse posée (`train` ≈ 90 → 0 à 37,3) ; punch `après`. | TGV ≈ 40 % |
| 37,52 (coupe) → 40,3 | « +Abonne-toi+ : cette barrière, tu vas la voir *céder*. » | **sans arrêt** : retour sur la route (`STAGED`, `clock` 8,8, `train` 513, `beam` 1), la caméra rase déjà le rail de la voie 2 vers les phares (vers `VIEW.rail`) ; `followCall` 37,64 → 40,2 (chevrons `#rail-seuil`). | rail + phares au bout |

## acte3.js

**40,30 → 57,46** (zéro, réponse). En coupes, un plan par souffle. Entre par une coupe complète (`{ ...STAGED, train: trainAt(8.8), beam: 1, clock: 8.8 }`). `clock` court en temps réel (≈ 25,4 à 57,46) et `train` = `trainAt(clock)` (un `st` linéaire `"none"` sur les deux suffit). Rend la main à `toverdict` 57,46 : `gap` −6,8, `give` 1, `train` ≈ −130, `other` 1, `mood` 0.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 40,30 → 41,7 | « Le phare du train *grossit*. » | `VIEW.rail` : au ras de la voie 2, les phares grossissent au bout des rails ; punch `grossit`. | phares ≈ 10 % puis plus, rails sur toute la hauteur |
| 41,88 → 45,1 | « Même à [90] km/h, il lui faut [800] mètres pour s'arrêter. » | même cadre : `ruler` 0 → 1 de 42,6 à 44,6, la règle file le long de la voie **jusqu'au-delà du train** ; `chip-800` 42,2 → 45,3. | règle en fuite, train au milieu |
| 45,36 (coupe) → 47,3 | « Ta voiture, elle, roule +encore+. » | `VIEW.push` large : la face de la voiture, ses phares sur la lisse, le tableau de bord vivant (`alive` 1), le flux du moteur ; punch `encore`. | voiture ≈ 60 % |
| 47,63 (coupe) → 50,0 | « Tu avances. Ton capot pousse la lisse. » | `VIEW.push` serré, bas, trois quarts avant : `gap` −3 → −6,8 de 47,8 à 52,2 (`kmh` 4, `sine.inOut`), le capot touche la lisse sur « pousse » 49,20. | capot + lisse ≈ 75 % |
| 50,13 → 50,8 | « Elle +cède+. » | `give` 0 → 1 dès `trigger` 50,31 (0,6 s) : la lisse s'écarte et s'efface ; en-tête 3/4 veille ; punch `cède`. | idem |
| 50,84 (coupe) → 52,3 | « Tes roues quittent les rails. » | `VIEW.wheels` : bas, de côté, les roues passent le dernier rail sur « rails » 51,96 ; **`mood` → 0 ici** (le système a gagné). | roues + rail ≈ 60 % |
| 52,2 (coupe) → 54,3 | « Et derrière toi… le train *passe*. » | `VIEW.pass` : la voiture sortie au premier plan, le TGV traverse derrière **plein cadre** sur « passe » 53,64 (`train` 0) ; punch `passe`. | TGV ≈ 100 % de la largeur derrière, voiture ≈ 35 % |
| 54,40 → 57,2 | « Le feu clignote encore : un train peut en cacher un *autre*. » | le R24 du héros (ou de `inB`) bat au premier plan, le TGV finit de passer, `other` 0 → 1 de 55,6 à 56,9 : deux phares surgissent sur la voie 1 ; `chip-autre` 55,7 → 57,3 ; punch `autre`. | feu ≈ 25 %, phares au fond |

## fin.js

**57,46 → 83,1** (chute, ce qui est dû, like, prochain dossier, boucle). Ordre : `kit/template/src/fin.js`. Entre par une coupe complète.

| Instant | Voix | Image | Part du cadre |
| --- | --- | --- | --- |
| 57,46 → 61,5 | « Voilà le secret : cette barrière n'est *pas* un mur. Elle est faite pour casser. » | la caméra recule de la voiture arrêtée hors des voies jusqu'au signal qui bat, la lisse absente (`give` 1) ; `retitle` : « Un mur » barré sur « pas » 59,42 (`D.verdict`), « Ta sortie » sur « Elle » 60,22 ; caché à 62,48. | signal + voiture ≈ 60 % |
| 61,58 → 62,54 | « Toi, non. » | la voiture seule, petite, face aux rails (recul haut). | voiture ≈ 15 % |
| 62,90 (coupe) → 64,4 | « Et si ta voiture ne roule plus ? » | **retour à l'instant de la scène** : `gap` −3, `alive` 0 (tableau éteint), quatre lisses baissées, R24, `clock` 8,8, `train` 513 au loin. | voiture ≈ 50 % |
| 64,62 → 65,5 | « Tout le monde *sort*. » | `people` 0 → 1 de 64,6 à 66,6 : toi et un passager sortent et vont au bas-côté, derrière la barrière d'entrée ; `you` s'éteint ; `chip-sort` 64,7 → 66,3. | les deux silhouettes ≈ 30 %, la voiture vide |
| 65,55 → 68,9 | « Puis on alerte : le téléphone du passage, ou le numéro de la pancarte. » | la caméra file vers le bord (`VIEW.phone`) : `phone` 1 sur « téléphone » 66,51 (le poste), la pancarte sur « pancarte » 68,30 ; `chip-alerte` 65,6 → 67,0. Aucun numéro lisible. | poste + pancarte ≈ 55 % |
| 69,16 → 72,46 | « En +commentaire+ : près de chez toi… téléphone, ou pancarte ? » | même cadre, les deux côte à côte ; `duelCall` from 69,2, `aAt` `duelA` 70,83, `bAt` `duelB` 71,66, `to` 72,46. **Le film ne répond pas.** | idem |
| 72,64 (coupe) → 75,5 | « +Like+ : pour quelqu'un qui en passe un tous les *jours*. » | le passage, lisses levées, R24 éteints, la voiture le traverse comme chaque matin (`gap` +12 → −12, `kmh` 33, `file` 0) ; `likeCall` 72,76 → 75,52. | passage ≈ 80 % |
| 75,54 → 80,44 | « Prochain dossier : classé. Un système que tu croises sans le voir… et qui attend son *heure*. » | la caméra s'élève dans la nuit, le passage s'éteint (`shell` → 0,2) ; `nextFile` (show 75,4, fact 76,3, hide 80,2) — rien du sujet ne revient après. | panneau seul |
| 80,59 (coupe) → 83,1 | « Comme cette barrière, le jour où… » | près de `POSE0`, l'état revient à `FIRST` (la lisse remonte à 0,62 et redescend) ; `D.loop({ at: toloop, rewindAt: rewind, fromD })`. **La dernière image est la première.** | comme `POSE0` |

## Les candidates de la première image (quatre)

Planche sur bouchons : `.cache/planches/035/architecte/p2.jpg` (le TGV ne s'y voit pas encore : brouillard du bouchon). À retirer **sur les décors finis**, sans `--bare` puis avec, dans un `essais.json` — l'état commun est `FIRST` (`downOut` 0,62, `flash` 1, `ring` 1, `train` 638, `beam` 1, `file` 1).

| | a « rail » (POSE0) | b « capot » | c « plongée » | d « sous la lisse » |
| --- | --- | --- | --- | --- |
| 1 événement en cours | ✓ la lisse descend, le R24 bat, le train vient | ✓ | ✓ | ✓ |
| 2 perspective basse | ✓ au ras du ballast | ✓ | ✗ vue haute | ✓ contre-plongée |
| 3 la menace derrière le sujet | ✓ **si** les phares du TGV se lisent au point de fuite | ✗ le train hors champ | ~ le train entre par le côté | ✗ |
| 4 forme reconnue, d'où on ne la voit jamais, ≥ 40 % | ✓ la voiture de profil sur les rails, ≈ 55 % | ✓ face + lisse | ✓ | ✓ la face vue sous la lisse |
| 5 le système là, petit mais lisible | ~ la lisse vue de biais | ✓ (grand) | ✓ quatre lisses | ✓ |
| 6 bouge par son sujet | ✓✓ (lisse + phares) | ✓ | ✓ | ✓ |
| total | **5,5 / 6** | 4,5 | 4 | 4,5 |

```json
[
 {"at":0.04,"label":"a rail","pose":{"tx":300,"ty":90,"tz":90,"d":1500,"az":-100,"el":3,"fov":44,"shift":60,"side":-150,"roll":0,"drift":0,"dof":0},"state":{}},
 {"at":0.04,"label":"b capot","pose":{"tx":200,"ty":120,"tz":-380,"d":820,"az":150,"el":4,"fov":40,"shift":150,"side":0,"roll":0,"drift":0,"dof":0},"state":{}},
 {"at":0.04,"label":"c plongee","pose":{"tx":0,"ty":0,"tz":200,"d":1900,"az":-40,"el":38,"fov":50,"shift":120,"side":0,"roll":0,"drift":0,"dof":0},"state":{}},
 {"at":0.04,"label":"d sous la lisse","pose":{"tx":40,"ty":110,"tz":-250,"d":520,"az":172,"el":-6,"fov":50,"shift":120,"side":0,"roll":0,"drift":0,"dof":0},"state":{}}
]
```

Ce qui tranchera : (a) gagne si les phares du TGV à 640 m se lisent à 270 px et si la lisse, vue de biais, se lit en descendant (au bouchon elle se lit mal) ; sinon (b), en cherchant à amener une lueur de phares sur les rails par la gauche. À tirer aussi à 0,3 et 0,7 s.

# 019 · Prétensionneur — les décors

Deux fichiers neufs, un agent chacun, en parallèle : `episodes/019-pretensionneur/src/model.js` (le système : l'enrouleur) et `src/cabine.js` (la voiture du 011, toi au volant, la sangle). Les deux existent déjà comme **bouchons** (le film se construit, `look` sort une planche) : remplace le tien, garde ce qu'il rend. Le contrat : `src/plan.js` (où tout se tient, sans import) et `src/world.js` (`FIRST` : la liste FERMÉE des nombres de l'état ; `apply()` : comment ton fichier est appelé). Recette commune : `docs/recette-agents.md`. Tu n'écris que dans ton fichier et ton journal (`docs/journal/019-<fichier>.md`) ; ce qui doit changer ailleurs (`plan.js`, `world.js`, le kit, un autre épisode) s'écrit dans le journal sous « À changer ailleurs ». **30 images lues au plus.** Planches et `essais.json` dans le dossier temporaire donné par la consigne, jamais dans le dépôt ni dans `renders/`.

## Ce qu'on a le droit de montrer (faits : `docs/faits/019-pretensionneur.md`, `019-contre-verification.md`)

- Le prétensionneur **retire le mou**, il ne retient pas : c'est la sangle, puis le limiteur (la barre de torsion) qui cède vers 3 à 4 kN. À l'image : la bobine reprend quelques centimètres de sangle, pas plus ; ton corps n'est jamais « tiré » en arrière.
- Le montage montré est **un type parmi d'autres** : une charge pyrotechnique → du gaz → une turbine reliée à la bobine (NHTSA, pour l'enrouleur d'épaule). Il existe des versions à piston et crémaillère, à billes, dans la boucle : `sources` le dit déjà.
- Le blocage du quotidien (pendule → cliquet → roue à rochet) est une AUTRE pièce, purement mécanique, qui se réarme. Il ne reprend pas le mou.
- Aucune longueur de sangle, aucun délai avant l'airbag ne s'affiche (non publiés). Les longueurs de `plan.js` (`REEL`, `TRAVEL`, `SLACK`) sont illustratives, exagérées pour se lire à 270 px.
- **Personne n'est blessé à l'image** : ta tête s'arrête loin du volant, même avec tout le mou ; le passager arrière ne bouge jamais.
- Couleurs : **signal** = la menace (le choc, ton corps qui part, la force de la sangle sur ta poitrine, le mou) ; **veille** = ce que fait le système (l'ordre, le gaz, la sangle qui se retend, la barre qui cède exprès) ; **ink** = le reste. L'éclair de la charge est blanc (ink poussé), il a un endroit, il gonfle deux images et meurt petit.

---

## `src/model.js` — l'enrouleur (le système, plein)

**À lire pour l'idiome** : `episodes/011-fusible-pyro/src/model.js` (une charge qui part, une pièce de 9 cm sur l'établi, la coupe « lid ») et `episodes/014-abs/src/model.js` (`explode` en rangée en travers de la caméra, `xray`, les `lit…`, un mécanisme qui tourne).

**Ce qu'il construit.** Un enrouleur de ceinture à sa taille vraie (≈ 11 cm de haut), dans SON repère : l'origine au milieu de sa base, l'axe de la bobine le long de x, la sangle qui sort de la bobine côté +z et monte le long de +y (cotes : `FRAME`, `SPOOL`, `BAR`, `LOCK`, `TURBINE`, `CHARGE` dans `plan.js`).

- **Le bâti** (`frame`) : un U d'acier embouti, deux joues et un dos (côté −z), percé — la fonte sombre.
- **La bobine** (`spool`) et **la sangle** (`strap`) : la sangle enroulée (son épaisseur se lit sur la tranche), puis elle monte jusqu'à son bout — dans la voiture `RETRACTOR.top` (l'anneau de renvoi, 79 cm plus haut : c'est là que `cabine.js` prend le relais) ; sur l'établi `RETRACTOR.benchTop`, sur un fin poteau à boucle de renvoi. Une trame (chevrons ou coutures, dans le shader, fondue sous le pixel avec `fwidth`) pour que sa course se LISE quand elle file. La pièce-héros la plus claire.
- **La barre de torsion** (`bar`) : au centre de la bobine, le long de l'axe ; une génératrice gravée (une ligne droite) qui devient une hélice quand elle se tord — c'est ce qui rend la torsion visible.
- **Le blocage du quotidien** (`lock`), bout −x : la roue à rochet, son cliquet, et dessous le pendule dans sa coupelle.
- **Le prétensionneur**, bout +x : **la turbine** (`turbine`) dans son carter, sur l'axe de la bobine, des aubes franches (huit à douze, pas un disque strié) ; **le générateur de gaz** (`charge`) : un petit cylindre couché au-dessus du carter, sa buse dedans, son connecteur à deux fils.

Trois valeurs de gris (bâti sombre, faces usinées plus claires, sangle et barre nettement plus claires), `metal` ≤ 0,5, chaque pièce qui s'efface a SES matières.

**API à rendre, exactement** :

```js
export function buildSystem() → { root, parts, A, update(p, time, px) }
// root   THREE.Group — le monde le re-parente entre le montant de la voiture et l'établi (tourné pareil dans les deux)
// parts  { frame, spool, strap, bar, lock, turbine, charge }
// A      ancres (Object3D) : frame, spool, strap, strapTop, bar, ratchet, pendulum, turbine, charge
```

**Les nombres reçus** (`p`), et ce qu'ils font :

| nombre | ce qu'il fait |
| --- | --- |
| `bench` | 0 dans la voiture · 1 sur l'établi : seul change le bout de la sangle (`RETRACTOR.top` / `benchTop`, et son poteau, visible sur l'établi seulement) |
| `slack` | le mou : 1 la sangle lâche (sur l'établi elle fait un ventre entre la bobine et son bout) → 0 tendue, droite. La bobine a tourné **à l'envers** d'autant (`REEL.take`), la turbine avec elle |
| `give` | 0 → 1 : la barre se tord (sa génératrice devient hélice), la bobine repart dans l'autre sens et rend `REEL.out` de sangle — le bout côté rochet, lui, ne tourne pas |
| `load` | la force dans la sangle (0 … `LIMIT` kilos) : une lueur signal le long de la sangle tendue, dosée (≤ 1,5) |
| `fire` | la charge : 0 intacte → vers 0,15 l'éclair blanc, à la buse → 0,1 à 0,8 le gaz (veille, une tête de lumière qui entre dans le carter et tourne avec les aubes ; la turbine démarre) → 1 **tirée** : sombre, noircie, la buse ouverte — elle ne repartira pas (c'est l'image de « une seule fois ») |
| `order` | à 1 (≥ 0,95) le connecteur de la charge s'allume, veille : l'ordre est arrivé |
| `lock` | 0 libre → 1 le pendule a basculé, son cliquet est dans la roue à rochet |
| `tug` | la sangle tirée à la main (0–1) : libre (`lock` 0) la bobine tourne et rend de la sangle ; bloquée (`lock` 1) elle s'arrête net, la sangle se tend, RIEN ne revient — « bloquer ne reprend pas le mou » |
| `xray` | les joues du bâti, les capots et les flasques de la bobine passent en verre : on voit la barre dans la bobine, la turbine dans son carter |
| `explode` | sur l'établi : 0 assemblé → 1 les pièces en rangée **le long de l'axe**, en travers de la caméra (rochet et pendule · bâti · bobine et sangle · barre · turbine · générateur) |
| `litFrame` `litSpool` `litCharge` `litTurbine` `litBar` `litPendulum` | la pièce que la voix nomme luit doucement, veille |

**Les images à réussir** (liste fermée ; poses de départ dans `VIEW`, rends les tiennes) :

1. **L'établi, entier, au repos** (`VIEW.whole`, puis `VIEW.strap`) : on comprend « un enrouleur » sans légende ; la sangle fait son ventre (`slack` 1).
2. **L'éclaté** (`explode` 1, `VIEW.exploded`) : la rangée, chaque pièce ≥ 150 px de large à l'image — c'est aussi la couverture (`cover` : az −40, el 14 : vérifie-la).
3. **La bobine** de près (`litSpool`) · **la barre** (`xray` 1, `litBar`) : au centre, on la voit À TRAVERS la bobine.
4. **La charge** de près (`litCharge`), puis `fire` 0,15 : l'éclair a un endroit.
5. **La turbine** (`xray` 1, `fire` 0,5) : le gaz entre, les aubes prennent.
6. **Le climax, un seul cadre de trois quarts** : `fire` 0,8 → 1, `slack` 1 → 0 — le générateur, la turbine, la bobine qui tourne à l'envers et la sangle qui monte se voient ENSEMBLE.
7. **L'image de la chute** : `xray` 1, `slack` 0, `give` 0 → 1 — la barre tordue (l'hélice), la sangle repartie, la lueur de `load`.
8. **Le côté blocage** (`VIEW.lockSide`) : `lock` 0 → 1 de profil (vérifie le sens sur deux images), puis `tug` 1 : rien ne bouge, le ventre de la sangle est toujours là.
9. **Dans la voiture** (`bench` 0) : `VIEW.system` (tout le reste éteint : c'est le cadre du raccord vers l'établi) et `VIEW.pillar` (la sangle qui monte jusqu'à l'anneau).
10. **Tirée** (`fire` 1, au repos) : on voit qu'elle a servi.

---

## `src/cabine.js` — la cabine (aux rayons X, sauf la sangle)

**À lire pour l'idiome** : `episodes/011-fusible-pyro/src/car.js` — seulement `makeRibbon` (lignes 635–686), « YOU, AT THE WHEEL » (1018–1093 : `SEAT`, `BELT`, `poseYou`, `onTrunk`) et `update` (1161–1267) ; `episodes/014-abs/src/street.js` pour un personnage qui garde les mains au volant ; `kit/lib/figure.js`.

**Ce qui est réutilisé, par import direct** (ne modifie aucun fichier d'un autre épisode) : `import { buildCar } from "../../011-fusible-pyro/src/car.js"` — la voiture de verre, ses roues, ses sièges, son volant, le mur, la route, les éclats, les deux airbags. Le bouchon le fait déjà. Appelle `car.update({ shell, wall, you: 0, crush, debris, bags })` : **`you: 0`**, car le « toi » du 011 est lié à `crush` et sa ceinture est en verre. Sa ceinture se cache par sa matière (`car.fx.belt.visible = false`). Le mur et la route sont dans `car.A.wallFace.parent` (le groupe `slide` du 011) : après `car.update`, recule-le de `gap` mètres (le bouchon le fait). Les airbags : `car.fx.cloth` est leur toile — rends-la pâle (≈ 35 %), ils ne sont jamais le sujet.

**Ce qu'il construit en plus.**

- **Toi** : `makeFigure({ shell: true, hands: "real" })`, assis comme dans le 011 (mêmes hanches, mêmes mains à neuf heures et quart), mais posé par TES nombres : `lunge` (et non `crush`), `lean`, `coat`. De verre de la tête aux mains.
- **La sangle, PLEINE** : de l'anneau de renvoi (`BELT.ring`, en haut du montant) par-dessus ton épaule GAUCHE, en travers de ta poitrine, jusqu'à la boucle (`BELT.buckle`) ; puis la sangle ventrale jusqu'à `BELT.anchor`. Un ruban de `BELT.width`, clair, mat, avec la même trame que celle de `model.js` (pour que sa course se lise) ; l'anneau et la boucle, pleins. **C'est l'objet le plus lisible du cadre.** Elle ne porte pas d'ombre sur ton corps de verre.
- **Le manteau** (`coat`) : une coque de verre matelassée sur ton tronc et tes bras, SOUS la sangle.
- **L'ordre** (`order`) : le calculateur d'airbag sur le tunnel (`ECU`), son fil jusqu'au pied du montant (`WIRE`), une tête de lumière veille qui le parcourt.
- **Le passager arrière** (`rear`) : quelqu'un de verre assis derrière toi (`REAR`), sa ceinture pendue le long du montant, non bouclée (pleine, claire). Immobile, jamais projeté.

L'enrouleur n'est PAS à toi : `world.js` le pose dans le pied du montant (`RETRACTOR.home`) ; sa sangle arrive à `BELT.ring`, où la tienne commence — les deux bouts doivent se rejoindre sans marche (même largeur, même teinte, même trame).

**API à rendre, exactement** :

```js
export function buildCabine() → { group, A, update(p, time, px) }
// group  le décor, dans le repère de la voiture (c'est le mur qui vient à elle)
// A      ancres : head, chest, shoulder, ring, buckle, wheel, ecu, pillarFoot, nose, wallFace, rearHead
```

**Les nombres reçus** (`p`), et ce qu'ils font :

| nombre | ce qu'il fait |
| --- | --- |
| `shell` | les rayons X de la voiture (0–1) : à 0,25 il ne reste qu'un fantôme (le cadre du raccord vers l'établi) |
| `wall` | le mur et la route (0–1) |
| `gap` | mètres entre ton pare-chocs et le mur : 0 il touche (la première image) ; au-delà le mur est encore loin, la route a glissé avec lui |
| `crush` | le nez qui se plie (0 → 1, celui du 011). **Il ne te déplace pas** |
| `debris` | les éclats et la lumière du coup, là où le pare-chocs touche le mur (0–1, ceux du 011) |
| `you` | 0 personne · 1 toi (et ta sangle) |
| `coat` | ton manteau, dessiné (0–1) |
| `lean` | ta position : 0 le dos au dossier · 1 un peu avancé, décollé du dossier — la sangle quitte ton épaule |
| `lunge` | ton corps projeté : 0 assis → 1 aussi loin que la sangle le laisse aller. Ta poitrine avance de `TRAVEL.taut + slack × TRAVEL.slack + give × TRAVEL.give` : plus loin avec du mou, un peu plus loin quand la barre cède. Hanches qui glissent, tronc qui bascule, tête qui continue (comme `poseYou` du 011), mains qui restent au volant |
| `slack` | le mou : à 1 la sangle est décollée de ta poitrine de `SLACK.off` et fait un ventre sous l'anneau ; à 0 elle est plaquée, droite. Entre les deux, **elle file vers l'anneau** (la trame court). Quand `lunge` monte, ton corps vient d'abord manger ce mou |
| `give` | la sangle rendue par la barre (0 → 1) : la trame court dans l'autre sens, ton tronc avance encore un peu, EN DOUCEUR |
| `load` | la force de la sangle sur ta poitrine (0 … 400) : une lueur signal le long de la sangle, là où elle porte (épaule, sternum), dosée ; elle creuse un peu ton manteau |
| `bags` | les deux airbags du 011, pâles : 0 rangés → 1 pleins. À `lunge` 1, ta tête finit DANS le sac |
| `order` | 0 rien → 0,15 le calculateur s'allume (veille) → 1 la tête de lumière est arrivée au pied du montant |
| `rear` | 0 personne · 1 le passager arrière et sa ceinture pendue |

**Les images à réussir** (liste fermée) :

1. **La première image du film** (`POSE0`, `FIRST`) : l'instant du choc, toi droit au volant, la sangle LÂCHE en travers de ta poitrine, le montant et l'enrouleur derrière ton épaule. Elle doit arrêter le pouce sans texte. **Et la même 0,6 s plus tard** (`slack` 0) : les deux vignettes diffèrent à 270 px de large — sinon l'accroche n'a pas d'image.
2. **Le mou, de profil** (`VIEW.side`, `slack` 1 puis 0) : le jour entre la sangle et ta poitrine.
3. **La sangle jusqu'à l'anneau, puis le long du montant** (`VIEW.ring`, `VIEW.pillar`) : le raccord avec la sangle de `model.js`, sans marche.
4. **La scène « si rien ne la retend »** (`VIEW.profile`) : `gap` 3 → 0, `crush` 0 → 1, `slack` 1, `lunge` 0 → 1 — la voiture s'arrête, toi non ; tu pars plus loin, ta tête reste loin du volant.
5. **« Ton manteau. Ta position. »** (`VIEW.chest`) : `coat` 0 → 1, puis `lean` 0 → 1 : on VOIT d'où vient le mou.
6. **L'ordre** (`VIEW.order`) : le calculateur allumé, la tête de lumière sur le fil, le pied du montant.
7. **Le climax** (`VIEW.side`) : `slack` 0, `lunge` 0 → 1, `load` 0 → 400 — tu t'écrases dans la sangle, elle luit signal ; puis `give` 0 → 1, `bags` 1 : quelques centimètres de plus, ta tête dans le sac.
8. **La banquette arrière** (`VIEW.back`, `rear` 1) : quelqu'un, pas attaché, sa ceinture pendue.
9. **Le cadre du raccord** (`VIEW.system`, `shell` 0,25, `you` 0, `wall` 0) : il ne reste que l'enrouleur et sa sangle dans un fantôme de montant.
10. **La dernière image** : `STAGED` puis le retour à `FIRST` et `POSE0` — identique à la première.

Vérifie au moins une planche SANS `--bare` : le sujet entre y ≈ 440 et 1160, plutôt à gauche du centre sous 880 (dans `POSE0` l'enrouleur tombe sous les boutons de TikTok, x > 905 : pousse l'image avec `side`).

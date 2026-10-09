# 016 — `wall.js` (la pièce) : journal

Fichier : `episodes/016-disjoncteur/src/wall.js`. API : `buildWall()` → `{ group, update(P, time, px), A, fx, you }`.
Planches, `essais.json` et petits outils : dossier temporaire `scratchpad/016/wall-*`. Budget : 30 images lues.

## Parti pris

- Le mur est une dalle de verre (z de −10 à 0) ; dedans, en verre : des montants tous les 60 cm (sans traits : huit montants font trente-deux verticales, le mur devenait une cage), les rails haut et bas, la boîte d'encastrement de la prise, et la gaine du circuit (un tube de verre annelé, ouvert sur ± 15 à 27 cm autour de `FAULT` pour laisser voir les deux fils). Le sol : la grille seule (`makeSurface`, sa base et son attrape-ombre cachés).
- **Un montant longe la descente du fil** (x = 108, à 12 cm du fil, du côté opposé à toi) et **prend sa lueur** (`fx.stud` : sa couleur glisse de l'encre au signal avec `hotwire`). Vu de derrière le mur, c'est lui qui dit « dans un mur », et c'est une lumière qui se pose sur quelque chose.
- Le fil : deux tubes (phase et neutre, 1,6 cm d'écart, rayon 0,5 cm — plus gros que nature, il doit se voir du bout de la pièce), balayés par ma propre fonction (`sweep` : attributs `aS` = centimètres le long du fil, `aTh` = angle autour). C'est le shader qui dessine les tirets, la chaleur, les cloques et le pincement du court-circuit. Halo : deux tubes additifs autour de la phase (cœur r 2,7 / longue traîne r 10), même loi de chaleur que le fil.
- **Les tirets ne suivent pas `load` en vitesse.** Leur place est `time × vitesse` : une vitesse proportionnelle à `load` ferait défiler des dizaines de périodes dès que `load` bouge au milieu du film (rafale d'images parasites). Deux régimes à vitesse FIXE, fondus : normal (10 cm/s ; période 7 cm ; tirets d'autant plus longs et clairs que `load` monte : 57 % à 16 A, 60 % à 18, 67 % à 23) et court-circuit (30 cm/s = exactement un septième de période par image, tirets signal) ; fondu entre `load` 1,7 et 2,5. `load` 0 : plus de tirets.
- **Sur un fil qui luit, pas de tirets blancs** : le premier jet était un sucre d'orge rouge et blanc. Dès que le fil est chaud, le courant est un battement plus clair de sa propre lumière (+32 %).
- **Le neutre reste froid** (`NEUTRAL_HEAT = 0`) et ses tirets sont à demi-intensité : deux fils qui luisent, c'est un câble, pas « un fil », et le court-circuit a besoin de deux fils qu'on distingue. **Simplification à écrire dans `sources`** : en vrai le même courant passe dans les deux conducteurs, ils chauffent autant.
- Le disjoncteur du film est unipolaire dans `model.js` (une borne en bas) : le neutre part donc d'un **bornier de neutre** au pied du coffret. **À écrire dans `sources`** aussi : en France un divisionnaire est le plus souvent phase + neutre.
- Ordres des coques (`asShell`) : toi 10 · bouilloire, radiateur 14 · meuble 16 · coffret 18 · dans le mur 24 · le mur 30. Le mur est dessiné le DERNIER : vu de derrière lui (la première image), toute la pièce reste visible à travers.
- Le radiateur : trois barres qui rougissent (ça se lit « radiateur » à 3 px par centimètre ; une résistance de soufflant, non), un cercle de ventilateur derrière. Tourné de 15° : de la pièce on voit sa face, de derrière le mur ses barres en long à travers son dos.
- Toi : `makeFigure` en coque, tout en verre (`ghost`), la tête sculptée du 012 ; tu es **8 cm plus près de la bouilloire que `plan.js`** (117, 86 au lieu de 112, 92 : un bras fait 57 cm), tourné vers elle, la main droite sur sa poignée (la droite : c'est le bras qui se détache sur le noir vu de la pièce, et vu de derrière le mur côté +x).

## Ce qui a raté, et pourquoi

1. **Planche 1** — le fil : un sucre d'orge (tirets d'encre sur fil orange) ; à `hotwire` 0,5 aucun halo visible ; à 1 une dalle blanche. `VIEW.room` tel que donné ne tient pas dans un cadre vertical (toi à x = 1187, le tableau à x = −94) ; `POSE0` tel que donné te met hors cadre (x = 1088). Les montants : une cage.
2. **Planche 2** — les tirets du neutre, blancs, volaient la vedette au fil chaud (réglé : demi-intensité). « Il cuit » : deux lobes blancs de part et d'autre de la croûte. Un montant passait devant ta main et la bouilloire dans l'accroche (réglé : la trame des montants est calée sur x = 108).
3. **Planche 3** — la cause du blanc : **une couleur poussée au-delà de ≈ 2,5 n'a plus de couleur** (`HOT × 2,6` : les trois canaux saturent). Le cœur du fil plafonne maintenant à `HOT × 2,2`, le blanc est réservé au court-circuit. La fumée : deux balafres rouges de part et d'autre du fil (trois filets écartés de ± 6 cm, teintés signal) → des filets gris, serrés, qui quittent le fil d'un seul côté (`lean`). Ton bras gauche : une main sur la hanche → pendu, le coude en arrière.

## Cadrer : ce que dit l'arithmétique (outil `scratchpad/016/wall-proj.mjs`, sans image)

- **L'accroche ne peut pas tenir le fil de près ET la bouilloire ET le radiateur** : bouilloire (x 158) et radiateur (x 60) sont à un mètre l'un de l'autre, de part et d'autre du fil ; vus d'assez près pour que le fil pèse, ils sont à 45° l'un de l'autre. Choix : derrière le mur, côté +x, caméra basse (y ≈ 99) qui regarde vers le haut, grand angle 58 — de gauche à droite : la bouilloire, toi tourné vers elle (dos au fil), le fil qui luit, le montant qui prend sa lueur. Le radiateur est hors cadre (en bas à droite, sous les boutons) : il entre au premier recul.
- Du côté −x, le fil passerait ENTRE ta main et la bouilloire : on lirait « ta main va au fil ». Écarté.
- **« Tout le mur » ne tient en vertical que de biais**, depuis le bout gauche de la pièce (az −71) : le tableau, petit, est près ; toi et les appareils, grands, sont loin — les tailles s'égalisent, et la course du fil (tableau → plafond → descente) se lit en perspective. 2,7 px par centimètre au fond : c'est un plan d'ensemble.
- La prise et la multiprise de près : la bouilloire (90 cm plus haut) n'y tient pas ; on voit le radiateur à gauche, les deux fiches, et le cordon de la bouilloire qui monte le long du meuble.

4. **Planche 4 (avec l'en-tête et les zones)** — la prise passait sous l'en-tête (réglé : `shift` 30). À `hotwire` 0,5 le fil ne luisait qu'autour de `FAULT` (réglé : la chaleur porte plus loin, σ ≈ 46 cm, et le halo répond plus tôt). La fumée de « il cuit » montait hors du cadre.
5. **Planche 5 (les deux dernières images)** — la fumée, teintée signal à son pied, se lisait comme des langues roses : presque une flamme. **Passée au gris d'encre et baissée (0,6) APRÈS la dernière image : non revue.** Les tirets du neutre, encore trop présents à côté du fil chaud : baissés à 0,36, **non revu** non plus. Le fichier a été reconstruit après ces deux retouches (aucune erreur de page ni de shader), sans image lue.

## Chaque nombre, chez moi

| | |
| --- | --- |
| `shell` | le verre (mur, montants, gaine, coffret, meuble, bouilloire, radiateur), les traits, la grille. Les pleins de la pièce (prise, multiprise, cordons, rail, bornier, différentiel) **et les deux fils** sont entiers dès 0,4 et partis à 0 |
| `you` | toi (verre) et ton ombre de contact |
| `kettle` | la résistance (deux anneaux) rougit, son halo, sa lumière sur le meuble, deux filets de vapeur ; × (1 − `dark`) |
| `heater` | les trois barres rougissent, leurs halos, la flaque de lumière au sol devant lui ; × (1 − `dark`). Avec `kettle`, il réchauffe un peu la couleur de ton verre |
| `hotwire` | la phase : fil d'encre (0) → rouge sourd → signal → cœur jaune à `FAULT` (1) ; ses deux halos ; le montant voisin prend la couleur. 0,36 de la chaleur aux bouts de la course. Jamais blanc sans `fault` |
| `char` | à `FAULT`, sur ± 9 cm : la gaine noircit, cloque (jusqu'à + 0,5 cm), braises signal dans les plis ; le halo y baisse de moitié ; un filet de fumée grise qui part d'un côté |
| `fault` | les deux fils se penchent l'un vers l'autre et se touchent ; cœur blanc sur ± 6 cm de fil ; l'éclat (cœur blanc, corps et traîne signal, quatre rayons courts, 5 → 12 cm) ; 28 étincelles lentes |
| `dark` | plus de tirets, résistance, barres, voyant de la multiprise éteints. Le verre et les traits ne bougent pas : la pièce reste lisible |
| `others` | les six disjoncteurs des emplacements 3 à 8 et leur peigne (leurs propres matières) |
| `diff` | le différentiel : arêtes, manette, bouton de test, filet sous la manette et un halo doux passent en veille |
| `load` | les tirets (voir « Parti pris ») : 0 aucun · ≈ 1 normaux, plus longs et plus clairs quand il monte · ≥ 2,5 ceux du court-circuit, rapides et signal |

Ancres `A` : `wire` (milieu de la course, sur le parcours horizontal), `corner` (le coude, en haut de la descente), `fault`, `socket`, `strip`, `kettle` (au-dessus du couvercle), `heater` (au-dessus), `head` (au-dessus de ta tête), `hand` (ta main droite), `you` (ta poitrine), `board` (haut du coffret), `diff`, `hero`, `row` (milieu des six autres).

## Poses

Vues AVEC l'en-tête et les zones : 1 (deux fois), 2, 3, 5 (deux fois), 7 (dans le cadre de l'accroche), 8. En 3D seule : 4 et 6. Deux cadres sont donnés ici après un dernier décalage **calculé, pas revu** : `plugs` (vu à `d` 180, `shift` 120 : la prise passait sous l'en-tête ; l'arithmétique la met à y = 530 et la multiprise à y = 1082) et `fault` pour le court-circuit (vu à `d` 101,7, `shift` 150 ; « il cuit », lui, est vu dans ce cadre).

```js
// 1 · la première image — de derrière le mur, côté +x, caméra basse, grand angle : la bouilloire, toi, le fil
export const POSE0 = { tx: 129, ty: 123, tz: 30, d: 135.9, az: 160.3, el: -10.2, fov: 58, shift: 138, side: 20, roll: 0, drift: 0 };
// 2 · tout le mur, de biais depuis le bout gauche de la pièce
room: { ...P, tx: -20, ty: 120, tz: 10, d: 617.5, az: -71, el: 6.5, fov: 50, shift: 130, side: 50 },
// 3 · la prise, la multiprise, les deux fiches (le radiateur à gauche ; la bouilloire est hors cadre, son cordon monte à droite)
plugs: { ...P, tx: 114, ty: 14, tz: 30, d: 192, az: -32.1, el: 30.3, fov: 36, shift: 30, side: -40 },
// 4 et 8 · le tableau et sa rangée (8 : state { diff: 1, others: 0.3 })
board: { ...P, tx: BOARD.at[0], ty: BOARD.rowY, tz: 4, d: 150, az: -24, el: 6, shift: 150 },
// 5 et 6 · de près sur FAULT, depuis la pièce (5 : { hotwire: 1, char: 1 } · 6 : { hotwire: 0.6, char: 1, fault: 1, load: 3 })
fault: { ...P, tx: 120.8, ty: 132, tz: -3, d: 118, az: -30.3, el: 7.9, shift: 60 },
// 7 · tout est éteint : POSE0 ou `room`, avec { dark: 1, load: 0, hotwire: 0.2 }
```

Variantes de l'accroche, plus près du fil (vues en planche 3, avant les derniers réglages de chaleur) : `{ tx: 128, ty: 124, tz: 30, d: 127.5, az: 160.4, el: -10.8, fov: 58, shift: 140, side: 60 }` (le fil à 17 px/cm, la bouilloire coupée en deux par le bord gauche).

Rappel pour les actes : `POSE0` et `room` ont un `fov` qui n'est pas 28 ; `cut()` le remet à 28 si la pose ne le porte pas.

## Ce qui n'est pas au niveau

- **L'accroche est bonne, pas renversante.** Le fil y fait 16 px de large (un halo de ≈ 90 px) : une ligne qui luit, pas un gros plan ; le radiateur n'y est pas (il entre au premier recul) ; la bouilloire touche le bord gauche ; tu es un mannequin articulé vu de face. « Dans un mur » ne se lit que par le montant qui prend la lueur.
- La fumée (grise) et les tirets du neutre (0,36) : réglés à l'aveugle après la dernière image. À regarder au premier `look`.
- « Il cuit » : deux lobes très clairs de part et d'autre de la croûte (ça bave un peu) ; les cloques se lisent comme une croûte sombre fendue de braises, pas comme des bulles.
- Le court-circuit : l'éclat cache le geste (« les deux fils se touchent » ne se voit pas).
- La vue d'ensemble : 2,7 px par centimètre à ta hauteur — un plan d'ensemble, rien de plus.
- `dark` n'éteint que ce qui luit : la pièce n'a pas de lampe. Si « tout s'éteint » doit frapper, il faut le jouer dans un cadre où la bouilloire ou le radiateur sont grands.
- Jamais regardé : les tirets en mouvement, `fault` et `char` à mi-course, `shell` sous 1, `you` 0, `others` 0, le parcours horizontal du fil de près. `check` non lancé.

## À changer ailleurs

- `world.js` — `POSE0` et, dans `VIEW`, `room`, `plugs`, `board` : les lignes ci-dessus, telles quelles ; ajouter `fault`. Le commentaire de `POSE0` (« it runs up and away toward the consumer unit ») ne décrit plus l'image.
- `plan.js` — **ne pas toucher à `YOU`** : je te pose à (`YOU.x` + 5, `YOU.z` − 6) ; `A.head` donne ta tête.
- `model.js` — la phase arrive au point `HOME` + (0, 0,9, 2,1), soit (−183,6 · 161,65 · 2,6) : la borne basse du disjoncteur doit être là (ou me dire où elle est : c'est le premier point de `phasePath`).
- `episode.json` → `sources` : (1) le neutre est montré froid alors que le même courant y passe ; (2) le disjoncteur est montré unipolaire, le neutre partant d'un bornier — en France un divisionnaire coupe le plus souvent phase et neutre.
- Rien dans le kit.

Images lues : 30 (8 + 8 + 6 + 6 + 2).

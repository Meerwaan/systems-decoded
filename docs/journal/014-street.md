# Journal — 014 · `street.js` (la route mouillée, la pluie, le camion, la voiture aux rayons X, toi)

30 images lues sur 30 (quatre planches : 8 + 8 + 8 + 6). Planches et `essais.json` : dossier temporaire `scratchpad/014/street-*`.

## Parti pris (à lire avant de monter un acte)

- **Le repère est celui de la voiture** (elle ne bouge jamais). La route, la pluie et le camion vivent dans deux groupes emboîtés : `pivot` (tourne de −`yaw` autour de l'origine de la voiture) › `slide` (glisse de +`lane` × 100 en x). Le camion y est posé à z = `CAR.nose` − 100 × `gap` ; la peinture, la grille et la pluie défilent avec la même cote (`s = z + 100 × gap`). `gap` négatif : le camion est dépassé, il est à ta droite.
- La voiture est celle du 011, reprise dans ce fichier (peau lofée, verre qui distingue vitres et panneaux, traits pris sur la peau, sièges, planche de bord, ceinture, toi) — sans le mur, l'écrasement, les airbags, le secouriste ni l'onde « live ».
- **`dive` ne penche que la carrosserie** (peau, traits, rétroviseurs, poignées, lueur des phares) : −2,5° à 1 autour de la ligne (y 34, z −20) — à 1 l'arche avant effleure le pneu. Roues, sièges, volant, toi et ce que dessine `model.js` restent aux cotes du plan : ton pied ne quitte pas la pédale.
- **`steer`** : le volant tourne de 100° à ±1 (sens inverse des aiguilles vu de ton siège pour +1, tes deux mains suivent la jante), la roue avant droite braque de **30°** à ±1 (`LOCK` dans le fichier). `model.js` doit braquer la roue avant gauche du même angle.
- Les trois roues que je dessine sont de verre (le système, lui, est plein). Aucun rayon : **une marque peinte** sur le flanc, dessinée dans un shader sur un anneau qui ne tourne pas — elle s'étale en arc selon `kmh` (bande régulière à 80) et redevient un secteur net quand `skid` bloque les roues. Sa place vient de `rolled` (angle = 100 × `rolled` / 34, vers l'avant).
- Le camion est le seul objet plein de la rue. Il est éclairé par la lumière clé (elle vient de derrière la voiture) et par un vrai projecteur posé sur ton pare-chocs (`SpotLight` sans ombre, atténuation en 1/d pour qu'il porte à 40 m sans brûler à 6).
- Toi : tête et mains pleines (comme au 011), le reste en verre. Hanches à (−37, 48, −17), tête à `YOU.head`. **Le pied gauche est ramené en arrière, à plat** (cheville à z −44) : étendu vers le repose-pied, son tibia passait devant la pédale pour toute caméra placée côté portière.

## Fait

- **La route** (`makeRoad`, un seul shader, pas de sol plein) : grille 50 cm / 2,5 m qui s'éteint avec la distance et s'efface avant de se serrer sous le pixel ; peinture — bord droit de ta voie (x = +175), tirets à ta gauche (−175 ; 3 m tous les 13 m), double ligne (−525), puis les voies d'en face ; jamais un trait sous 1,8 px (plus fin, il garde sa lumière et perd sa force). Les lignes en travers et les tirets sont **étalés sur leur course** pendant l'obturateur (`kmh` × 0,5 / 30 s : 37 cm à 80) : rien de fin ne saute.
- **L'eau se lit par ses reflets** : les deux blocs de feux du camion renvoyés vers l'œil (demi-vecteur : la traînée s'allonge toute seule en vue rasante) plus une traînée posée sur la route, du pied du feu vers le pied de la caméra — elles sont sur la même ligne ; brisées par une texture lente le long de la route. Masquées sous la voiture (vue à travers le verre, une traînée dans l'habitacle se lisait comme un objet). Les phares : deux nappes d'encre qui s'élargissent et se rejoignent, elles relèvent la grille et la peinture jusqu'à ≈ 30 m. Derrière chaque pneu, **le sillon qu'il ouvre dans l'eau** (deux bords fins, encre) ; avec `skid` il devient une **trace signal droite**, large de 18 cm, sur ≈ 16 m.
- **La pluie** (`makeRain`, 2 400 traits) : gouttes attachées à la route (elles tombent et défilent avec `gap`), enveloppées dans une boîte qui reste devant la caméra, dessinées comme le trajet parcouru pendant l'obturateur : penchées par `kmh`, verticales à l'arrêt. Aucune dans l'habitacle, celles qui traversent le faisceau des phares s'éclairent, celles qui frôlent l'objectif s'effacent.
- **Les gerbes** (`makeSpray`) : derrière les quatre roues (avant gauche comprise), une brume en bouffées qui quittent le pneu, montent et s'élargissent (≈ 5 m à 80 km/h, rien à l'arrêt), plus des gouttes sur leur parabole, en traînées. Périodique dans le shader : vivant dès la première image. `skid` : plus de gerbe, une vague basse poussée DEVANT chaque pneu et chassée sur les côtés.
- **Le camion** (`makeTruck`) : semi-remorque pleine en trois gris — caisse, deux portes plus claires, cadre et châssis sombres ; quatre crémones d'acier avec gâches, guides et poignées ; charnières ; traverse porte-feux, plaque ; barre anti-encastrement claire et ses jambes ; trois essieux de roues jumelées, bavettes ; protections latérales, béquilles ; tracteur (cabine, déflecteur, deux essieux). Feux signal : feu fixe, warning qui **respire** (période 2,6 s), troisième feu à peine allumé, deux gabarits en haut, catadioptres, feux de côté ; un halo (cœur + traîne) par bloc et par gabarit. La quincaillerie fine (crémones, charnières) ne se trace que de près (`gap` 34 → 16).
- **La voiture** : peau en verre (corrigée : un flanc vu en enfilade ne s'allume plus en entier — mur laiteux de la première planche), traits, trois roues, sièges, planche de bord, colonne, rétroviseurs ; pleins : le volant (repère clair à midi), l'écran, la ceinture, les poignées.
- **Toi** : mains fermées sur la jante à 9 h 15, elles suivent le volant ; pied droit posé sur le patin par `pedalPad(brake, pulse, time)` de `plan.js` (la plante à 1,8 cm de la cote du patin, côté conducteur).
- `shell` : tout ce que dessine le fichier s'efface (matières propres à chaque pièce) ; à 0 le groupe est invisible.
- Ancres `A` : `truck` (centre de la face arrière), `truckTop`, `lights` (bloc de feux gauche), `left` (voie de gauche, 20 m devant), `wheelFR`, `wheelRL`, `wheelRR`, `head`, `hands` (moyeu du volant), `foot` (pied droit), `bumper`.
- Mise à jour sans allocation (uniformes, transformations) ; les mains ne sont reposées que si `steer` change, le pied que si `brake` / `pulse` changent (et à chaque appel tant que `pulse` > 0 : `pedalPad` rend alors un petit tableau).

## Raté, et pourquoi

- Planche 1 : le flanc de la voiture vu en enfilade (caméra de l'accroche) était une dalle laiteuse — tout le panneau est « de profil » pour le verre du 011. Corrigé par la vitesse à laquelle la surface se détourne (`fwidth`).
- `POSE0` d'origine (az −24) : le camion est hors cadre (21° à gauche de l'axe pour 12,8° de demi-champ). La roue et le camion ne tiennent ensemble qu'entre az −11 et −16.
- `VIEW.chase` d'origine (el 14) : à 38 m le camion sort par le haut. Il faut une caméra basse et longue.
- `VIEW.pedal` d'origine (az −70) : la jambe gauche, puis la roue avant droite de verre, derrière la pédale. Jambe gauche repliée, caméra passée à az −104, el 18 (le bas de caisse d'en face passe au-dessus de la pédale).
- Reflets en deux morceaux (un vers la caméra, un le long de la route) : ramenés sur une seule ligne.
- Traces de blocage à 2,4 : cœur blanc. Ramenées à 1,15 (saumon → signal).
- Pluie à 0,85 : vue de dessus, elle se confondait avec la peinture (des « lignes de vitesse »). À 0,6 elle manquait dans l'accroche. Réglée à 0,72, traits raccourcis.
- Brume des gerbes : invisible à la première planche (0,075), en boules de coton sous `skid` à la dernière.

## Poses qui cadrent (complètes ; ajouter `roll: 0, drift: …`)

- **POSE0** (état `FIRST`) : `{ tx: -84, ty: 30, tz: -150, d: 250, az: -13, el: 6, fov: 48, shift: 150, side: -120, roll: 0, drift: 0 }` — camion entre y ≈ 440 et 640 à gauche (x ≈ 200–350), roue de 480 à 1 080 à droite du centre, son sillon vers la caméra.
- `chase` (gap 38 → 8, de derrière) : `{ tx: 0, ty: 43, tz: -1500, d: 3023, az: -4.57, el: 5.45, fov: 40, shift: 237, side: 200 }` — voiture 830–1 150, camion 480–670 à 38 m ; à 8 m son toit arrive à ≈ 410. L'évitement (lane 1,8, yaw 9, gap 4) : la même avec `shift: 160`.
- `top` (de dessus) : `{ tx: 0, ty: 0, tz: -230, d: 1500, az: -9.5, el: 37.5, fov: 50, shift: 230 }` — voiture 710–1 200, ses traces vers le bas.
- `hands` : inchangée, `{ tx: -37, ty: 100, tz: -20, d: 210, az: -58, el: 12, fov: 28, shift: 150 }`.
- `pedal` : `{ tx: -33, ty: 48, tz: -64, d: 170, az: -104, el: 18, fov: 28, shift: 150 }`.
- Roues bloquées, de l'avant gauche, au ras du sol : `{ tx: 0, ty: 30, tz: -150, d: 620, az: -140, el: 10, fov: 36, shift: 150 }`.
- Profil : `{ tx: -40, ty: 50, tz: 30, d: 900, az: -78, el: 6, fov: 36, shift: 150 }` ; profil large avec les gerbes : `{ tx: -80, ty: 40, tz: 250, d: 2450, az: -82, el: 5, fov: 36, shift: 150 }`.
- Le camion à 6 m : `{ tx: 0, ty: 150, tz: -620, d: 1000, az: -14, el: 7, fov: 40, shift: 150 }` (son toit passe sous l'en-tête : baisser `shift` — non réglé).

## Pas au niveau, ou pas vu

- **De dessus, la voiture et le camion à 6 m ne tiennent pas ensemble** entre y 440 et 1 160 (25° d'écart) : avec `top`, le pied du camion et ses feux sont sous l'en-tête, il ne reste de lui que ses deux reflets. Pour les voir tous les deux : `chase`.
- La vague sous `skid` : des bouffées distinctes à la dernière planche. Élargies (30 → 78 cm) et baissées ensuite — **pas revu**.
- La pluie à 0,72 — **pas revue** (vue à 0,85 et à 0,6). Elle reste discrète dans l'accroche.
- Les gerbes : lisibles de derrière et de profil large, mais en taches rondes derrière les roues arrière plus qu'en panache ; dans l'accroche, un pétillement au pied de la roue et un peu de brume, pas la gerbe spectaculaire.
- `VIEW.hands` : sous le volant, les cuisses et les tibias de verre se croisent en faisceau (y > 1 100).
- Le pied est l'ellipsoïde de verre du kit : il se lit comme un pied par son tibia, pas par sa forme.
- `shell` 0 : jamais lu en image (le groupe est rendu invisible : garanti par le code). `shell` 0,5 : vu, le camion devient translucide (on voit ses arêtes du fond).
- La marque des roues : vue étalée (profil à 80 km/h) ; sa version nette sous `skid` n'a été vue que de loin.
- Toutes les images ont été faites contre le bouchon de `model.js` (un cylindre noir) : l'accroche est à rejuger avec la vraie roue.

## À changer ailleurs

- `world.js` : `export const POSE0 = { tx: -84, ty: 30, tz: -150, d: 250, az: -13, el: 6, fov: 48, shift: 150, side: -120, roll: 0, drift: 0 };`
- `world.js`, `VIEW` : `chase: { ...P, tx: 0, ty: 43, tz: -1500, d: 3023, az: -4.57, el: 5.45, fov: 40, shift: 237, side: 200 },` · `top: { ...P, tx: 0, ty: 0, tz: -230, d: 1500, az: -9.5, el: 37.5, fov: 50, shift: 230 },` · `pedal: { ...P, tx: -33, ty: 48, tz: -64, d: 170, az: -104, el: 18, shift: 150 },`
- `plan.js` (pour que `model.js` et `street.js` lisent la même chose) : `export const STEER = { wheel: 30, hand: 100 }; // degrees at steer ±1` et `export const DIVE = { deg: 2.5, y: 34, z: -20 }; // the body alone pitches about this line` — aujourd'hui ces nombres sont des constantes de `street.js` (`LOCK`, `SPIN`, `DIVE`).
- `model.js` : la roue avant gauche et la pédale ne doivent PAS suivre `dive` (ici, seule la carrosserie penche) ; la roue braque de 30° à `steer` ±1. Sa trace sous le pneu (`lock`) se superpose à la mienne (`skid`, x = −80 ± 9 cm) : même couleur, pas de conflit.
- `world.js`, brouillard : à 0,00016 le camion à 38 m est à moitié fondu dans le noir (ses traits et ses feux tiennent). Si on le veut plus présent au loin : 0,00012.

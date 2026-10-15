# L01 · `dossier.js` et `car.js` — journal

Agent de décor, 2026-10-15. Fichiers : `episodes/L01-pare-brise/src/dossier.js`, `episodes/L01-pare-brise/src/car.js`. Interfaces inchangées (mêmes exports, mêmes paramètres). 30 images lues sur 30 (planches `car1` 6, `dos1` 6, `mix2` 9, `mix3` 6, `mix4` 3, dans le dossier temporaire).

## Ce qui est fait

### `car.js`
- **Ton personnage à toi** : la voiture du 011 garde son conducteur caché (`you: 0` toujours) et **sa ceinture n'existe plus** (`fx.belt.visible = false`) ; à sa place, un `makeFigure` de verre de la tête aux mains (`ghost`), la tête d'un verre un peu plus net (rim 0,7, edge 0,62, spec 0,9) : c'est elle que la première image regarde.
- **`lunge`** : la pose finale est **résolue au build** contre le volant du 011 (jante 18,5, inclinée 22°) : le bassin quitte le siège, le buste bascule par-dessus la jante sans la traverser, le cou plie en dernier ; à `lunge` 1 la tête touche **exactement** la face intérieure du pare-brise en `IMPACT.head` (la courbure de `verre.js` est reprise : sag, sagV, épaisseurs dessinées). Le solveur lit `plan.js` : si `IMPACT.head` change, la pose suit sans rien toucher ici.
- **`tool`** : 0 → 0,3 la main gauche quitte le volant et monte vers la vitre, vide ; 0,3 → 0,45 le brise-vitre (corps signal : ce qui frappe ; deux pointes d'acier) apparaît dans la main ; 0,5 armé, reculé de 16 cm et basculé ; 0,5 → 1 la frappe, accélérée, la pointe touche la vitre en `IMPACT.side`. La main se ferme sur le manche (`hold`).
- **Les carreaux du 011 / 014 sont découpés là où sont les nôtres** : les shaders de carrosserie sont patchés sur leurs instances (fichiers du 011 et du 014 intacts) — le pare-brise toujours, la vitre conducteur quand `sideOn` > 0,5 (`discard`, le cadre reste). Plus de deux verres l'un sur l'autre.
- **MOUNT vérifié** : vu de face (`screenOut`), de trois quarts (`hook1`) et de profil, le pare-brise héros tombe dans la baie du 011, entre les montants. Rien à corriger dans `plan.js · MOUNT`.
- ROAD : la rue du 014 tourne (`kmh` 90, `drive` 800 vérifiés), son conducteur à lui, son pare-brise découpé.

### `dossier.js`
- **Trois pièces sur l'établi**, reconstitutions à notre typo, chacune marquée « RECONSTITUTION » dans son coin : papier ink vieilli (fibres, rousseurs, bord usé), coins relevés et légère vague, ombre portée + ombre de contact qui se resserre à l'atterrissage. Le surligneur est dans le shader du papier : le papier vire au veille, l'encre reste noire, une petite lueur ; il **balaie chaque ligne de gauche à droite** comme un vrai surligneur.
  1. Le brevet : RÉPUBLIQUE FRANÇAISE · OFFICE NATIONAL DE LA PROPRIÉTÉ INDUSTRIELLE · BREVET D'INVENTION · N° 405.881 · 25 NOVEMBRE 1909 · ÉDOUARD BÉNÉDICTUS ; FIG. 1, la coupe verre (hachuré) · celluloïd (veille imprimé) · verre, étiquettes en 84 px. Le corps du texte est fait de « mots » gris illisibles : rien d'inventé ne se lit.
  2. Le Règlement ONU n° 43 : titre, « Prescriptions uniformes relatives à l'homologation des vitrages de sécurité », 5. MARQUAGE ; trois lignes qui s'allument : 5.4 (E2 dans son cercle, « un cercle, la lettre E et le numéro du pays qui homologue »), 5.5 (« 43R + numéro d'homologation »), 5.5.1 (« I trempé · II feuilleté »). Paraphrases fidèles à `docs/faits` (§5.4–5.5, niveau A), pas une citation.
  3. Le tampon agrandi : une plaque de verre sombre (72 × 72, chants cassés, laquée), la bande noire et ses points dégradés en haut, et, en encre : le cercle et son E, le 2, 43R, « – 001234 » (numéro d'exemple, jamais allumé), II, FEUILLETÉ.
- **Le laboratoire de 1903** : la pièce en arêtes seules (un mur de verre vu de biais faisait une dalle blanche), une grille de 50 cm au sol, plinthe, corniche, une porte à gauche ; la fenêtre haute (x 30…190, y 196…322) à petits carreaux, son ciel gris, un rai de lumière qui tombe dans la pièce, une lumière directionnelle froide qui vient d'elle, de la poussière dans le rai ; l'étagère à cinq planches et ses flacons de verre (cinq profils), l'escabeau, la table et sa cornue, son support, son ballon récepteur, un portoir à tubes, un tabouret, et un chevalet (il était peintre aussi).
- **Bénédictus** : `makeFigure` de verre (mains « real », `ghost`), posé par clés le long de `ben` (escabeau → descendu et tourné → à genoux, la main sur le flacon → debout, le flacon à la poitrine → debout, le flacon levé contre la fenêtre). La main droite tient le flacon où qu'il soit (`hold`, barre de 6,5 cm).
- **Le flacon** : le seul plein de la pièce, verre clair laqué qui prend le studio ; chute en trois temps (il bascule au bord de la planche · chute libre, hauteur en carré du temps, plus d'un tour et demi · un rebond mat de 3 cm, il se couche, le goulot touche le sol, il ne roule pas) ; **l'étoilement** dans le shader : sept étoiles de rayons et deux anneaux brisés qui poussent avec `star`, blancs, jamais sous 1,8 px ; le film de nitrocellulose : un veille à peine, sur les bords rasants ; l'étiquette (« Novembre 1903 · ce flacon est tombé de 3,5 mètres de haut », ses mots) s'enroule sur le corps.
- Les canevas sont redessinés une fois les polices chargées (`document.fonts.check`) : rien ne sort en police de secours.

## Les paramètres

| nombre | ce qu'il fait ici |
| --- | --- |
| `doc` | 1 brevet · 2 R43 · 3 tampon (entier) |
| `docIn` | 0 → 1 la pièce glisse depuis le fond de l'établi (48 cm), se pose avec un léger tassement, son ombre se resserre · 1 → 2 les lignes s'allument une à une, balayées (brevet : verre · celluloïd · verre ; R43 : 5.4 · 5.5 · 5.5.1) |
| `mark` | tampon : 1 le cercle et son E · 2 le « 2 » (le E reste allumé : « E2 = France ») · 3 « 43R » · 4 « II » ; entre deux entiers, fondu |
| `flask` | 0 sur la planche haute · → 0,1 il bascule · → 0,84 chute libre · → 1 rebond, couché |
| `star` | 0 → 1 l'étoilement pousse de sept points (blanc), le flacon reste entier |
| `ben` | 0 escabeau · 0,55 descendu, tourné · 1 à genoux, main sur le flacon · 1,45 debout, flacon à la poitrine · 2 flacon levé contre la fenêtre. Pour `ben` ≥ 1, c'est `ben` qui place le flacon (`flask` est ignoré) |
| `labelOn` | l'étiquette apparaît (fondu) |
| `lunge` | 0 assis, mains au volant → 1 tête contre la face intérieure du pare-brise en `IMPACT.head` |
| `you` | ton personnage (CAR) ; dans ROAD, celui du 014 |
| `tool` | 0 main au volant · 0,3 main levée vide · 0,45 brise-vitre en main · 0,5 armé · 1 la pointe sur la vitre |
| `sideOn` | > 0,5 : le carreau de la porte est découpé sous notre vitre |
| `plain` | rien ici (la baie est toujours découpée ; c'est `casse.js` qui pose la vitre ordinaire) |

## Les poses qui cadrent bien (complètes)

```js
// CAR — la première image (POSE0 tel quel), avec { lunge: 1, crash: 0.6, web: 0.35, rings: 0.2 } : la tête de verre dans la toile
{ tx: -37, ty: 126, tz: -52, d: 430, az: -138, el: 10, fov: 32, shift: 0, side: 300, roll: 0, drift: 0.3 }
// CAR — profil serré, la bascule par-dessus le volant ({ lunge: 0 → 1 })
{ tx: -37, ty: 110, tz: -30, d: 260, az: -92, el: 4, fov: 32, shift: 0, side: 0, roll: 0, drift: 0.3 }
// CAR — le brise-vitre, depuis la place passager ({ sideOn: 1, tool: 0.5 → 1 }) : la main, l'outil rouge, la vitre et son marquage
{ tx: -86, ty: 120, tz: 4, d: 90, az: 100, el: 20, fov: 34, shift: 0, side: 0, roll: 0, drift: 0.3 }
// BENCH — les pièces : VIEW.doc tel quel, avec pool 0.05 (voir « À changer ailleurs »)
{ tx: 0, ty: 0, tz: 4, d: 175, az: -6, el: 62, fov: 30, shift: 0, side: -200, roll: 0, drift: 0.3 }
// LAB — la pièce entière : VIEW.lab tel quel ({ ben: 0, flask: 0 })
// LAB — « il range » / « le range » : VIEW.shelf tel quel ({ flask: 0, ben: 0, star: 1, labelOn: 1 }) — sa main sur le flacon
// LAB — la chute, de face, à hauteur d'homme ({ flask: 0 → 1 }) : les planches, l'escabeau, le flacon qui passe devant
{ tx: -120, ty: 150, tz: -170, d: 420, az: -22, el: 2, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }
// LAB — « il le ramasse » ({ flask: 1, star: 1, ben: 1 }) : à genoux en entier, la main sur le flacon — préférer à VIEW.floor (voir plus bas)
{ tx: -90, ty: 45, tz: -130, d: 330, az: -20, el: 14, fov: 28, shift: 0, side: -100, roll: 0, drift: 0.3 }
// LAB — « à la lumière » ({ ben: 2, star: 1, labelOn: 1 }) : le flacon levé sous la fenêtre
{ tx: 30, ty: 175, tz: -70, d: 260, az: -20, el: 4, fov: 28, shift: 0, side: -120, roll: 0, drift: 0.3 }
```

## Ce qui n'est pas au niveau (dit franchement)

- **`VIEW.floor` (d 130) sur « il le ramasse »** : de si près, la main de verre qui descend sur le flacon se lit comme quatre gros tubes. Le flacon étoilé, lui, se lit bien. Prendre la pose « à genoux » ci-dessus (d 330) pour le geste, et garder `VIEW.floor` sans la main (`ben` < 0,6) pour l'étoilement seul.
- **« À la lumière »** : le flacon est levé à hauteur de l'appui de la fenêtre, pas en plein carreau : contraste moyen (verre clair sur ciel gris). Une caméra plus basse (`el` −8) le met devant le ciel.
- **Entre `ben` 0 et 0,55** il descend l'escabeau en glissant (pas de pas sur les marches) : à ne pas filmer, couper pendant.
- **L'étiquette** apparaît en fondu : on ne le voit pas la coller.
- **Le brise-vitre** apparaît dans la main par un fondu rapide (0,3 → 0,45) : à cacher par le cadre ou une coupe.
- **`lunge` avec `IMPACT.head` = [−37, 4]** : la tête atteint le verre juste au-dessus du volant ; le meilleur compromis laisse la jante entrer de ≈ 3 cm dans le buste de verre et plie le cou de 38° (de profil, ça se voit un peu). Voir « À changer ailleurs ».
- Les objets du labo restent sobres et assez pâles (`opacity` 0,38) : dans le plan large, l'escabeau et les planches font l'essentiel ; le rai de lumière est très discret (voulu : jamais un voile).

## À changer ailleurs

- **`plan.js` · `IMPACT.head`** : `[-37, 4]` → **`[-37, 22]`**. Plus haut sur le pare-brise (c'est là qu'une tête non retenue le touche, au-dessus du volant) : la pose résolue n'a plus aucune interpénétration et le cou ne plie que de 8°. Contact alors en (−37, 138,4, −41,3) dans la voiture, centre de la tête en (−36,4, 128,8, −36,8). `car.js` suit tout seul ; `casse.js` aussi (il lit `IMPACT.head`). Recaler les poses d'accroche : `POSE0` / `VIEW.hook1` `ty: 134, tz: -36` ; `VIEW.hook2` `ty: 132, tz: -24` ; `VIEW.hook3` `ty: 128, tz: -39` (la tête monte de 7,6 cm et recule de 16).
- **`world.js` · état des plans de pièces (BENCH, `doc` > 0)** : `pool: 0.05` (au lieu de 0,2) — la flaque veille sous la feuille mange le surligneur veille et teinte tout l'établi en vert.
- `plan.js · MOUNT` : rien à changer (vérifié).

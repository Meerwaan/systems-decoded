# L07 · l'architecte — journal

2026-11-13/14. Rôle : contrat, bouchons des trois décors, six fichiers de chapitres (bouchons qui construisent), page, repères, grille de sons, `docs/L07-decors.md`, `docs/L07-actes.md`. Voix réelle : 805,6 s, 106 phrases, 17 chapitres, 5 coupures pub. Aucun sous-agent. 18 images lues (planche de vérification 8, planche des six candidates 6, reprise de deux candidates 2 ; deux planches de 1 ou 2 non comptées en plus). `npm run check -- L07` passe (37/37 contrastes).

## Ce qui est fait

- **`src/plan.js`** (sans import) : quatre lieux, chacun son origine — `BANC` (systèmes pleins : `FIBER` aux vraies proportions 9/125/190/245 µm, `CABLE`, `PRINCIPE`, `HIST` à la vraie longueur 20 m, `DOCS`, `SUBSEA`, `MULTI`, `SPLICE`, `COUPLER`, `PLUG`), `USINE` (`LINE`, `STILL`, `LATHE`, `SINTER`, `TOWER`, `PROOF`, une station tous les 16 m le long de +x), `MER` (`SEA` : plaine abyssale jusqu'à x −140 m, talus, plateau, côte en x = 0 ; `SHIP` et sa route), `TERRE` (`LAND` : plage, rue, central, chambre de tirage, tuyau écrasé, armoire, 32 foyers, immeuble, ta pièce — mur au plan z = room z, box à 45 cm, meuble devant). Convention d'azimut écrite et **vérifiée sur planche** (az 0 voit le flanc +z, az −90 le bout −x). Tout est maquette ; aucune grandeur affichée hors la fibre et le barreau de 1965.
- **`src/world.js`** : `SET`, `ITEM` (dix objets du banc), `STEPS` (12 : six de fabrication, six de voyage — la voix compte les cinq premières), `CHAP_STEP`, `CARD` (« Dossier L07 · Le fil de verre »), `REST` / `FIRST` (≈ 95 nombres commentés, aucun nom de propriété GSAP : `claque` au lieu de `snap`), `AT` (banc(item), usine, mer, terre), `LOOK`/`CLOSE`/`SHARP`, `VIEW` (≈ 50 poses, six candidates), `POSE0` = hook1, `HAND` (cinq coutures, toutes sous une carte : c12 et c34, c45 en raccord de forme / de mouvement avec fondu, c23 et c56 dans le même lieu, le mouvement continue), `buildWorld` (quatre groupes, un visible ; chaque décor `update(S, time, px)` lit S directement), `seam`, `span`, `cardAt`, `onFrame`.
- **Bouchons** : `fibre.js`, `fabrique.js`, `voyage.js` (avec `bottomAt(x)` exporté) — l'interface définitive en tête, volumes gris aux bonnes places, ancres `A`.
- **Chapitres** : `c1-ouverture` (0 → 180,4), `c2-preforme` (→ 308,7), `c3-tour` (→ 448,0), `c4-voyage` (→ 583,6), `c5-soudure` (→ 708,8), `c6-chez-toi` (→ 805,6) — bouchons qui construisent, coutures posées. `chapters.js`.
- **`main.js`** : l'en-tête lit l'étape et UNE lecture, température du verre (`tempOn`) ou lumière restante (`lumOn`, « < 1 % » sous 1, signal si `lumBad`) ; le libellé change avec elle. Couleurs de l'en-tête en CSS (le `LINE_HUD.tone` du L04 rend des nombres BRAND, que le style ignore : voir « À changer ailleurs »).
- **`index.html`** : « Dossier L07 · Le fil de verre », le titre de la chute (« Internet » · « Dans les nuages » barré · « Dans du verre »).
- **`episode.json`** : 170 repères `k…` ajoutés (rien ne porte un nom de beat), tous relus sur la table de `npm run script` ; `sfx` : l'ambiance par lieu (pièce → usine → vent en mer → pièce), le plus long `drop` et le plus gros `boom` dans le souffle après « Net. » (`test3$+0.1`), deux « wow » de plus (`goutte$`, `du2$`, chacun dans un souffle ≥ 0,47 s) ; une ligne de `sources` sur les maquettes et les marques des fibres. `paradoxe$` et `arc$` écartés : 0,08 s de souffle seulement.

## Décisions

- **Trois décors** (cap de trois agents) : `fibre.js` (le système plein, dix objets — le plus lourd en nombre de pièces), `fabrique.js` (l'usine, la tour = la pièce maîtresse, la miniature y est prise), `voyage.js` (mer + terre : deux lieux dans un fichier, faute d'un quatrième agent ; dessiner peu mais grand, réutiliser `034/fond.js`, regarder `L06/terrain.buildQuartier` et `044/rue.js`).
- **« On l'ouvre » sur le banc** : le câble d'intérieur en télescope le long de +x (un système long et fin s'ouvre en rangée), le verre au bout ; puis le bout de fibre, le cœur.
- **Le principe sur une maquette du cœur** (agrandi, angle exagéré) : `ray` / `steep` / `bend` / `leak` servent deux fois (60 s et 767 s) — la fin rejoue le geste que le principe a montré.
- **L'en-tête raconte deux choses** : la température dans l'usine (sourcée : 1 100 °C au chlore, 1 900 °C à la tour), puis la lumière restante (la loi des moitiés de 1965, 2 % en 1970, 95 % aujourd'hui, 3 % par foyer, < 1 % de budget).
- **Six fichiers de chapitres** (cap de six agents) pour 805 s : 180, 128, 139, 136, 125, 97 s — au-delà des 60–110 s de la recette. Découpage sur les lieux (chaque fichier = un ou deux lieux), coutures sous les cartes. **c1 est le plus lourd** (24 phrases, première image, éclaté, principe, histoire) : c'est lui qui fixera la durée de l'étape. Couper c1 en deux (`c1` 0 → 108 l'ouverture et le principe, `c1b` 108 → 180 l'histoire) si un septième agent est possible.
- **Les « couleurs » des fibres** : la DA n'en a que trois ; chaque fibre a une marque d'encre (`voir` que l'image ne peut pas tenir : « Chaque fibre reçoit une couleur »). Le connecteur vert, lui, est veille — et vert.
- **Pas de réponse affichée à la place du spectateur** au commentaire (courbe douce / plié : les deux images, la question reste).

## Les candidates de la première image

Fichier : `.cache/planches/L07/architecte/premiere-image.json` (six, avec en-tête : `npm run look -- L07 --file … --out … --cols 3`). Notes sur les six points dans `docs/L07-actes.md` → « Les candidates ». Classement : **hook1** (derrière ta box, au ras du sol : l'accroche et la boucle tombent dessus), hook2 (au fond de l'océan), hook3 (sous la goutte = la miniature). Planche sur bouchons : `.cache/planches/L07/architecte/candidates.jpg`, `h12.jpg` (hook1 et hook2 refaits après correction du fond et de la pièce).

## Provisoire (à recaler par le chef de production sur les vrais décors, AVANT les chapitres)

- **Toutes les poses de `VIEW`** (posées sur bouchons) et `POSE0` (= hook1) ; `FIRST` = l'état de hook1.
- **Les cinq `HAND`** (c12, c23, c34, c45, c56) : leurs `from` / `to` reprennent des poses de `VIEW` ; à refaire avec les poses des journaux des décors.
- Les six états de `premiere-image.json` (les nombres sont ceux de `FIRST`, ils ne bougent pas ; les poses, si).

## À changer ailleurs

- `episodes/L04-porte-avions/src/world.js` l. 62 (pour mémoire, pas pour le L07) : `tone: (v) => (v < 0 ? BRAND.veille : …)` rend un nombre que `style.color` ignore — la lecture du L04 reste toujours de la même couleur. Ligne juste : `tone: (v) => (v < 0 ? "#5cffb0" : v >= 1 ? "#ff5b2e" : "#e9e4d8")`. Mieux, dans `kit/lib/long.js` : exporter `TONE` (`{ danger, system }`) et `INK` pour qu'un long n'ait plus à recopier les codes.
- `kit/lib/long.js · lineHud` : un paramètre `label: () => string` pour le libellé de la lecture (le L07 le change à la main dans `main.js`, `stage.onProject`).
- `scripts/script.mjs` signale 2 570 mots et 5 coupures pub (la recette dit 1 950 et 3 ou 4) : c'est le script, déjà enregistré — rien à faire ici, à garder pour la mesure du L07.

# 040 · L'abri anti-feu — les décors

Contrat posé par l'architecte le 05/11 (`docs/journal/040-architecte.md`). Voix réelle : 88,07 s. Trois fichiers en parallèle, un agent `decor` chacun, contre le bouchon déjà en place (API définitive : on remplace l'intérieur, jamais les exports, les noms de nombres ni la signature d'`update`). Tout en centimètres, Y en haut, dans le repère de `src/plan.js` (à lire en entier : 120 lignes). **Azimut vérifié sur planche** : `az 0` caméra côté +z (elle regarde le feu par-dessus ta tête), `az −90` côté −x, le feu vient de −z.

Rien du catalogue ne fait un feu de forêt ni une crête : la crête et le feu sont neufs (deux fichiers : un lieu, un phénomène — le feu de forêt manque au catalogue et montera dans le kit). Réutilisés : `@kit/figure.js` (toi et les 72), `@kit/atmo.js` (grille), `@kit/blocks.js` (l'établi) ; à recopier plutôt que réinventer : le sapin de verre de `027-voie-de-detresse/src/habillage.js` (`dressCol`), `makeEmbers` de `L04-*/src/bord.js`, la flamme « la plus brillante gagne » et la brume en rubans de `012-gaziniere/src/fire.js` (commentaire de tête : la recette des flammes qui ne virent pas au saumon).

**Ce qui vaut pour les trois** (`docs/faits/040-*.md`, « À ne pas dire » et contre-vérification) : pas de cercle de feu fermé autour des 73 (les emplacements sont répartis le long de la crête, le feu du flanc opposé ne rejoint jamais le front) ; **la feuille rougeoie, elle ne fond jamais** ; pas d'eau ; personne de blessé à l'image ; aucun chiffre sur les objets. Trois couleurs : signal = le feu, sa lumière, la chaleur qui entre, la colle qui lâche ; veille = l'air frais du sol, les rayons une fois renvoyés, la couche nommée ; ink = le reste. Ce qui doit se lire **à 270 px sur fond sombre** (leçon du 039) : les flammes, la fumée, la chaleur, et l'aluminium (argent clair, jamais gris sur gris) — chaque agent le vérifie sur ses planches, pas seulement « à l'œil plein écran ».

## model.js

**Le système, plein** : l'abri M-2002 déployé, toi dessous, l'air qu'il garde. C'est la pièce maîtresse du film.

- **La forme** : un demi-tube bas aux bouts arrondis, 218 × 79 × 39 cm (`SHELTER`), l'axe long sur z, **pieds à −z (vers le feu), tête à +z**. Un ourlet (`skirt`) à plat au sol tout autour, que tes mains et tes bottes plaquent ; deux poignées dans le haut (`handles`) ; des sangles au bord (`straps`). La feuille est **froissée** (des plis vifs, un relief de papier d'alu qui attrape la lumière par facettes : c'est ce qui fait « alu » à 270 px) ; les coutures en traits.
- **Les quatre couches** (`SHELTER.layers`, de dehors à dedans) : feuille d'alu (miroir, clair) collée sur la silice (toile tissée, beige-gris, trame visible de près) · la lame d'air (un vide clair : deux traits fins et rien entre) · la fibre de verre (trame plus fine, gris) · la seconde feuille d'alu (tournée vers toi). Épaisseurs dessinées (`draw`), pas réelles : la coupe et l'éclaté doivent se lire.
- **L'éclaté** (`explode`) : les couches se décollent l'une de l'autre **comme des pages** (`SHELTER.lift`), du dessus, avec un léger retard de l'une à l'autre ; la lame d'air reste entre la silice et la fibre, visible comme un vide encadré. Tout l'éclaté dans UN cadre vertical (`VIEW.exploded`).
- **La coupe** (`cut`) : la moitié −x retirée le long de l'axe long (proprement : les tranches des couches se lisent comme un mille-feuille de cinq traits), et dedans : toi, couché, l'air frais au sol, l'air chaud au-dessus.
- **Le pliage** (`fold`) : 0 déployé · 0,5 sorti de son étui, tenu par ses deux poignées, qui se déplie en claquant au vent (le battement sur `time`, pas sur l'état) · 1 plié en pain de mie (`PACK`) dans son étui, sur le sac (`BAG`, établi seulement).
- **Toi** (`you`, `head`, `hands`, `rise`) : `makeFigure`, à plat ventre, visage contre la terre, pieds vers −z ; `head` soulève la tête de `YOU.lift` cm dans la nappe chaude ; `hands` plaque les mains et les bottes sur l'ourlet (sangles tendues) ; `rise` te relève debout au bord −x de l'abri (le like). Mannequin de verre : jamais en très gros plan, jamais la main seule.
- **L'air** (`cool`, `hot`) : une nappe mince veille au ras du sol (`AIR.cool`), une nappe signal mate plus haut (`AIR.hot`) — des volumes doux, pas des boîtes : une lumière a un endroit, jamais un voile.
- **La chaleur** (`heat`) : la feuille extérieure côté feu prend la lumière signal et rougeoie (émissif dosé ≤ 3) — elle **ne fond pas**. `glue` : au coin `SHELTER.glue`, un filet de fumée et le coin de feuille qui se soulève de sa toile ; `hole` : ce coin délaminé, un trou qui s'ouvre, la chaleur (signal) qui entre.
- `lean` (le vent, lu de feu.js) : l'ourlet libre et les pans frémissent — **le sujet bouge dès l'image 1**.
- Matières : `metal` ≤ 0,5, la feuille rugosité basse ; pièces qui s'effacent avec leurs propres matières ; `finish` à juger sur la feuille (si elle ne lit plus argent, `userData.finish = false`).

API : `buildModel() → { root, parts, A, figure, update(p, time, px) }` ; ancres `A` : `top feet head mouth glue handleL handleR gap pack`. Nombres lus : `bench explode fold cut you head hands rise cool hot heat glue hole lean litFoil litGap litFibre litInner`.

**Images à réussir** (liste fermée, poses dans `world.js` → `VIEW`) :
1. `hook` (POSE0) avec FIRST : le dôme argent au premier plan, la feuille rougeoyante côté feu, l'ourlet qui bat — 45 % de la largeur.
2. `system` puis `exploded` sur l'établi : l'abri entier de trois quarts ; les pages ouvertes, chaque couche lisible, la lame d'air comme un vide.
3. `foilClose`, `gapClose`, `fibreClose`, `innerClose` : chaque couche nommée, nette, `lit*` à 1.
4. `section` (coupe, `cut` 1, `you` 1, `cool` 1) : le mille-feuille et toi dedans, de profil.
5. `packBench` (`fold` 1) : le pain de mie dans son étui sur le sac ; `glueClose` (`glue` 1) : le coin qui fume.
6. `shake` (`fold` 0,5) : le paquet argenté secoué par ses poignées.
7. `under`, `inside`, `mouth` dans la crête (`cut` 1) : toi visage au sol, mains sur l'ourlet ; ta bouche dans l'air frais vert ; `head` 1 dans le rouge.
8. `standing` (`rise` 1) : debout au bord de l'abri, de dos.

**Propre au dossier** : la feuille froissée est ce qui fait « alu » — un dôme lisse lit comme du plastique gris. Le coin de la colle (`glue`) sert deux fois : le repos (il fume) et la chute (il lâche).

## crete.js

**Le lieu, aux rayons X** : le sommet de crête raclé de la Butte (Idaho, 29/08/1985), ses emplacements, les 72 autres, la forêt des flancs, ta pelle.

- **Le terrain** : `ridgeY(x, z)` (plan.js) — sommet plat raclé sur |z| < 6 m, flancs à ≈ 32° vers les fonds du canyon. Une **grille** qui suit le relief (jamais de sol plein ; `@kit/atmo.js` ou une grille maison), plus serrée et plus lumineuse sur le sommet, qui s'efface en descendant ; les **emplacements** (`PAD`, 4 × 5 m) se lisent comme des rectangles de terre nue (traits de lame de bulldozer). `burn` noircit le sol des flancs (des braises signal piquées dans la grille, qui s'éteignent lentement).
- **Les 72 autres abris** (`CREW[1…72]`) : **le même système, plein** — une copie légère (instanciée) du dôme de model.js, même ton argent, même froissé simplifié : à 40 m ils doivent briller comme de petites coques d'alu sur la crête noire (c'est l'image de « 73 abris »). `deploy` les déplie chacun à son tour (pas tous ensemble).
- **Les 72 pompiers debout** (`crowd`) : silhouettes de verre (`makeFigure` en version simplifiée ou instanciée), éclairées faiblement par le feu ; `deploy` les couche sous leurs abris.
- **La forêt** des flancs : sapins et chicots de verre (le sapin de `027/habillage.js`), épars, jamais sur le sommet ; `burn` 1 : troncs noirs, quelques braises.
- **Ta pelle** (`SHOVEL`) : manche de bois plein, lame d'acier ; `char` consume le manche **depuis la lame vers le bout** (braises signal, le bois qui noircit et disparaît), la lame reste. « Se consument », jamais « fondent ».
- **Le duo** (`DUO`) : deux pompiers de verre couchés côte à côte sur leur emplacement, l'un pieds vers le front (−z), l'autre tête vers le front — rien ne dit lequel est juste (même matière, même lumière).
- **Le débris** (`debris`) : une étincelle blanche à longue traîne qui traverse le ciel noir d'un trait (`DEBRIS`) — rien d'une station.

API : `buildCrete() → { group, A, heightAt, update(p, time, px) }` ; ancres `A` : `pad` (ton emplacement, l'origine : world.js y pose le système), `shovel`, `duo`. Nombres lus : `shell crowd deploy burn shovel char duo debris`.

**Images à réussir** :
1. `crest` (le bout de la crête, bas) avec `crowd` 1, `deploy` 0 → 0,3 : des dizaines de silhouettes sur les emplacements, le sommet qui file vers le fond, le front qui monte du flanc −z (feu.js).
2. `canyon` : par-dessus le bord de la crête, le flanc qui plonge, la forêt, le front qui y monte.
3. `back` (`deploy` 1, `burn` 1) : le long de la crête depuis ton côté −x, toi d'abord puis les grappes qui s'éloignent — **73 coques d'argent lisibles** sur la crête noircie (vu sur bouchon : de haut, un dôme fait 4 px ; le long de la crête, ils se lisent).
4. `shovelClose` (`char` 0,3 → 0,9) : le manche qui se consume à côté de ton abri.
5. `duo` : les deux couchés, le front en contrebas.
6. `zeroWide` : le sommet, ton dôme au premier plan depuis +x, le front qui le franchit.
7. `sky` (`debris` 0 → 1, `shell` 0,2) : la crête qui bascule dans le noir, l'étincelle.

**Propre au dossier** : aucun anneau de feu ; les grappes sont espacées le long de la crête (cinq équipes) ; rien à moins de 9 m de ton abri, rien sur ton côté −x à moins de 24 m (le premier plan de l'accroche et les plans serrés regardent de là). Le contraste de la nav de l'en-tête tombe sous 4,5:1 quand le feu passe derrière lui : garder le haut du cadre plus sombre que le front (fumée).

## feu.js

**La menace** : le front de feu de forêt, sa fumée, ses braises, sa lumière — et les dix rayons. Tout est signal.

- **Le front** (`front`, `fire`, `lean`) : un mur de flammes en travers de toute la crête (`FIRE.width`), 15 à 25 m de haut, **couché par le vent vers +z** (`lean`) : il roule, il « rabat ». Des langues qui montent et se détachent, un cœur blanc-jaune au pied, un corps signal, des pointes qui se dissolvent en fumée (la recette de `012/fire.js` : « la plus brillante gagne », rien d'additif qui vire au saumon). **Il bouge par lui-même** (sur `time`) : dès l'image 1, des langues passent par-dessus le dôme. À 270 px : une masse orange **découpée** sur le noir, avec des trous sombres et des langues — jamais un aplat orange ni un voile.
- **La fumée** (`smoke`) : une colonne sombre, éclairée par-dessous en signal sourd, qui garde le haut du cadre sombre (l'en-tête reste lisible).
- **Les braises** (`embers`) : des points à traînée qui filent avec le vent vers +z, quelques-unes vers l'objectif (`makeEmbers` de L04 à recopier).
- **Le flanc opposé** (`flank`) : une ligne de feu basse, loin en contrebas côté +z (`FIRE.flankZ`), qui ne rejoint jamais le front.
- **La lumière** (`light`) : un `PointLight` signal qui suit le front : c'est elle qui fait briller l'alu et les 72 coques ; sur l'établi elle s'éteint.
- **Les rayons** (`rays`, `bounce`, `leak`, `lick`) — dans le repère de l'abri (world.js les re-parente avec lui, sur l'emplacement ou sur l'établi) : dix traits signal nets, d'épaisseur ≥ 2 px, qui partent du côté −z (`RAYS.from`) vers la feuille ; `bounce` : **neuf rebondissent** et repartent vers −z en **veille** (renvoyés = le système vivant) ; `leak` : le dixième traverse la feuille, pâlit dans la lame d'air et s'éteint avant toi ; `lick` : **une seule langue de flamme** collée sur le coin `SHELTER.glue` (la limite : le contact direct).
- `bench` : sur l'établi le front, la fumée et les braises disparaissent ; les rayons restent (le principe se montre sur l'établi, leur source hors champ à gauche).

API : `buildFire() → { group, rays: { group, update }, light, A, update(p, time, px) }`. Nombres lus : `front fire lean flank smoke embers` (update) et `rays bounce leak lick` (rays.update), plus `bench`.

**Images à réussir** :
1. `hook` avec FIRST (`front` −4, `lean` 0,75) puis à 0,7 s : le mur derrière le dôme, des langues qui passent par-dessus, braises vers l'objectif — lisible à 270 px.
2. `crest` et `canyon` (`front` −120 → −60, `lean` 0,3) : le front qui monte le flanc, vu de loin, découpé, avec sa fumée.
3. `over` (`front` −3 → +4, `lean` 0,85) : le front qui roule sur le dôme, le climax.
4. `section` sur l'établi : dix rayons → neuf renvoyés en veille → le dixième qui meurt dans la lame d'air.
5. `section` avec `lick` 1 : la langue plaquée sur le coin.
6. `back` (`front` 60, `fire` 0,4) : le front parti en contrebas côté +z, la crête qui fume.

**Propre au dossier** : `front` est en **mètres** le long de z (0 à tes pieds). Le feu passe *sur* toi : au-delà de `front` 0, le mur est entre +z et ton dôme — pour l'accroche il reste derrière (−z) et c'est `lean` qui le fait rouler par-dessus.

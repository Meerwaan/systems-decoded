# 018 · Cocotte-minute — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/018-actes.md`. Le décor est rendu (`docs/journal/018-model.md`) ; les actes 1, 2 et 3 sont montés (`docs/journal/018-acte1.md`, `018-acte2.md`, `018-acte3.md`).

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : de près, az −64, la cocotte entière au-dessus des cartes. **`FIRST` a `xray: 1, seen: 1`** : la cocotte est en verre dès l'image 1 — l'eau qui bout, le dessous du couvercle qui pousse (signal), le jet de la soupape (veille), le feu. Personne ne les change. La boucle revient là : la dernière image est celle-là, en verre.
- `plan.js` → `APART` : `{ seal: 4.5, lid: 9.5, pin: 12.5, safety: 14.5, weight: 17.5 }`.
- `main.js` : « Siffle » dès que `whistle × (1 − clog)` dépasse 0,08 ; l'en-tête affiche « +350 kg » dès que `bar` ≥ 0,985 et ne monte jamais au-dessus ; en dessous il compte par dizaines — ne t'arrête sur aucune valeur intermédiaire tant que la voix parle (une montée ou une descente, oui ; une valeur tenue, non).
- La couverture de grille est prise dans l'acte 2 : repère `p1-0.4`, pose `{ tx: 0, ty: 18, tz: 0, d: 215, az: -40, el: 28, fov: 28, shift: 60 }`.

## Ce que les actes rendent à la fin

- L'acte 3 rend la main sur `toverdict` : la cocotte entière en verre sur le feu, `mood` 0 depuis « tombe », l'en-tête à « 0 kg » en veille, la jauge (`#gauge`) déjà sortie.
- `chip-350` n'est utilisé par personne : ne l'utilise pas non plus (la carte d'accroche dit déjà le chiffre).

## La fin (`fin.js`)

- **La chute** (« Voilà son secret : une cocotte aux normes n'explose pas. Elle fuit. Ce qui brûle, c'est un couvercle… ouvert sous pression. ») : `retitle` sur le couvercle, et une image qui ne montre AUCUNE explosion. « Elle fuit » : le joint, de profil, sa fuite veille (`leak` 1) ; « un couvercle ouvert sous pression » : `twist` qui bute sur la tige en butée (l'éclat signal), pas un couvercle qui part.
- **« Et si la tienne se tait ? Coupe le feu. Laisse la pression retomber. Ne force jamais le couvercle. Puis nettoie la soupape. »** : le plan comptait quatre étiquettes et trois coupes en douze secondes — trop. Une étiquette à la fois, deux au plus sur toute la phrase ; le geste porte le reste : `flame` → 0 sur « coupe le feu », `bar` qui descend (la tige redescend toute seule) sur « retomber », `twist` qui bute sur « ne force jamais », la soupape propre (`clog` → 0) sur « nettoie ». Deux coupes au plus.
- Puis la question du commentaire (`commentCall`), tout de suite, sans rien entre les deux.
- **Le like** (« quelqu'un, ce soir, va la remplir à ras bord. Ce qui mousse : jamais plus de la moitié. ») : la cuve en verre, `fill` à ras bord puis `mark` (le bandeau veille de la moitié) sur « la moitié ».
- **Le prochain dossier** (« ta ceinture de sécurité. Au choc, une charge explosive part dans son enrouleur. Exprès. ») : `nextFile`, le panneau porte l'abonnement ; la voix ne le redemande pas. Plus rien de la cocotte ne revient après lui : l'image est l'établi, la cocotte entière, sobre.
- **La boucle** (« Tout le contraire de… » → « Ta cocotte-minute siffle… ») : `D.loop` ramène tout à `FIRST` et à `POSE0` — la cocotte en verre qui siffle sur le feu. Tire la dernière image et la première côte à côte.

## Ce qui n'est pas au niveau dans le décor

- Sur l'établi, le dessus du poids fait un point chaud vert-blanc et le haut du couvercle en verre une bande très claire : dose `lit…` et `xray`.
- Dans les gros plans, le dessus du couvercle fait une grande plaine gris clair : cadre-le en biais.
- Les lentilles, de près, sont des confettis : pas de gros plan sur elles.

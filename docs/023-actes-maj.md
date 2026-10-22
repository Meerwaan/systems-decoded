# 023 · Éolienne de secours — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/023-actes.md`. Les décors sont rendus : `docs/journal/023-avion.md`, `docs/journal/023-model.md`, l'habillage `docs/journal/023-habillage.md`. **La voix est enregistrée** (93,4 s) : les repères tombent sur les vrais mots, il n'y aura pas de passe de recalage.

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : la candidate P3, `{ tx: -640, ty: -155, tz: 400, d: 5200, az: -48, el: -22, fov: 40, shift: 170 }` — l'avion en diagonale vu d'en dessous, l'aile entière, les DEUX moteurs morts (lèvres signal), le fuselage et ses hublots. On lit « ton avion » et « plus un seul moteur » sans le son. `FIRST` n'a pas bougé. Personne ne les change. Le bas du cadre est noir (la mer) : c'est la place des cartes d'accroche.
- **L'azimut** (`stage.js`) : la caméra est en (sin az, cos az) — az 0 = flanc +z, az −90 = depuis −x (l'avant), az +90 = depuis +x (l'arrière).
- Moteurs déplacés (`ENGINES` x −360, y −335), île élargie (`ISLAND.w` 4500), `whirl` passé à `avion.update` : déjà dans `plan.js` et `world.js`.
- `cover.cam` posé dans `episode.json` (proposé par le journal de `model.js`, à vérifier par `npm run cover`).

## Les poses (vues sur planche)

- `VIEW` mis à jour d'après les journaux : `plane` (el −16, fov 42 : à el −6 l'aile disparaît par la tranche), `wide` et `approach` (l'île sous / devant l'avion, vus de derrière, az 90), `you`, `gear` (de derrière à gauche, az 55 : de devant, le moteur proche masque le train), `tail` (de derrière, tout l'avion et ses trois gouvernes), et sur l'établi `whole`, `exploded` (ne change pas son azimut : les places de l'éclaté y sont réglées), `door`, `row` (la rangée), `prop`, `pump`, `bay`.
- Autres poses vues dans `docs/journal/023-avion.md` (P1, P2, P4 : de bons plans de moteur pour l'acte 1).

## Ce qui n'est pas au niveau, et comment le filmer

- `VIEW.plane` de trois quarts avant reste un tube si on remonte `el` : garder la version corrigée, ou la vue de derrière.
- `VIEW.bay` : le moteur proche occupe le bas gauche ; le caisson de soute de `model.js` dépasse sous la peau (une boîte grise sous le ventre) — plan bref, ou cadré plus serré sur la trappe.
- Étincelles des pneus et fuite de carburant jamais vues de près : les regarder sur ta planche avant de t'appuyer dessus.
- **Habillage** : sur les plans de toi en cabine, `pax` à 0,4 au moins (sinon tu es assis au milieu de sièges vides). La couche de nuages (≈ 6 000 m sur l'altimètre) s'efface pendant la phrase du plané, en une à deux secondes : ne coupe pas au milieu. Les lumières de Terceira se voient sur `approach` et sur « vise une île ».

## Le tact

Le vol est réel (Air Transat 236, 24 août 2001) et tout le monde a survécu. Personne n'est blessé à l'image ; l'atterrissage est dur (pneus qui éclatent, aucune violence), jamais un crash.

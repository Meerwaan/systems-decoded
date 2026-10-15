# 022 · Batterie — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/022-actes.md`. Les décors sont rendus : `docs/journal/022-model.md`, `docs/journal/022-pores.md`, `docs/journal/022-chambre.md`.

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : la candidate 1 de la chambre — ta tête sur l'oreiller, le téléphone qui luit dessous (signal), le câble à tirets. `FIRST` n'a pas bougé. Personne ne les change. La première seconde : on avance vers la lueur sous l'oreiller, la chaleur bute et reste.
- **La maquette des pores a son fichier** (`src/pores.js`), montée par `world.js` hors du système : `world.pores.anchors`. Le fondu d'échelle : `world.js` tient les deux bouts ; le téléphone et la chambre s'effacent avec `fade`, la maquette apparaît avec `micro`. Ne relance pas `install.mjs` (il écraserait `world.js`).

## Les poses (elles ont été vues ; celles de `VIEW` étaient réglées sur des bouchons)

- La maquette (`022-pores.md`) : repos, film de près, **climax** (`shift` 60, ou 40 si le contraste de l'en-tête râle), chute, « si elles se touchent » de profil caméra basse — la SEULE pose où `touch` se lit (d'en haut, ce n'est qu'une boule de lumière). Les `shift` de 170–175 de `VIEW` envoient l'électrode du haut derrière l'en-tête sur les plans serrés.
- Le téléphone (`022-model.md`) : `whole`, `exploded` (un éventail), `opened`, `tongue`, `roll`, `board`, `battery`, `dent`, avec leurs lumières (`fy: 4.6, fs: 13` ; langue sortie `fx: 3, fs: 16`). « Gonflée » se lit à `swell: 1, xray: 0.45`.
- La chambre (`022-chambre.md`) : la poche, sous le contour (`VIEW.under`, d 62, ne montre que le téléphone), l'oreiller replié, la table. `pillow` replie le coin côté caméra, il ne soulève pas l'oreiller entier.

## Ce qui n'est pas au niveau dans les décors, et comment le filmer

- Le téléphone fermé est juste mais nu : on ne s'y arrête pas, on l'ouvre.
- Les spires du rouleau se lisent « des couches », pas « cuivre, film, aluminium » : les trois noms se disent sur la LANGUE déroulée (`unroll`), dans UN cadre — c'est ce qui s'allume (`litCopper`, `litFilm`, `litAlu`) qui dit de quel mot on parle. Le rouleau sert à « enroulé, en couches serrées ».
- L'interrupteur du circuit est discret fermé : « il coupe » se lit par l'avant / après (la lame se lève, veille) — tiens le cadre sur les deux.
- Le cheveu d'échelle se lit comme une baguette de verre : bref, avec son étiquette, ou pas du tout.
- L'oreiller replié a l'air d'une feuille, la couette se lit à peine : pas de plan qui repose sur eux. De face et de bas (az < −70, el < 10) ton buste est une boîte.
- `chain` : sept points chauds qui s'allument de proche en proche — sobre ; c'est « la chaleur appelle la chaleur », sans flamme.

## Le rythme, et ce qu'on affiche

- **Acte 1 : une seule plongée à l'échelle des pores**, pas deux. « Deux électrodes, séparées par presque rien, dans un liquide inflammable. Si elles se touchent : la chaleur appelle la chaleur. » se jouent d'un trait dans la maquette ; puis UNE coupe vers les rangs du rappel de 2016. Pas d'aller-retour chambre → pores → chambre → pores.
- **Le climax (acte 3) est l'image du film** : « Ses pores se ferment. Le lithium ne passe plus. Le courant s'arrête. » tiennent en UN cadre, sans coupe — on regarde les pores se fermer un à un depuis le point chaud, les grains buter et s'arrêter. Le relâchement (`mood` 0) tombe sur « Le courant s'arrête ».
- Le thermomètre de l'en-tête (`temp`) : une seule valeur est sourcée, 130. Il monte par paliers peu nombreux et ne s'arrête qu'une fois, à ≈ 130, sur « Vers cent trente degrés ». Le décor l'ignore : c'est `heat`, `spot`, `trapped` qui dessinent la chaleur.
- « Tu l'éloignes » : le téléphone se déplace seul (`place`), le chemin veille au sol — tu dors, aucun geste.
- Aucune marque, aucune flamme, personne n'est blessé. Le séparateur est un DERNIER recours : l'image ne promet pas qu'il sauve à tous les coups.

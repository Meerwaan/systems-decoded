# 022 · `src/pores.js` — journal

Agent : la maquette de l'échelle des pores (le film entre ses deux électrodes). Budget : 30 images lues.

## Parti pris (avant d'écrire)

- **Le film** : une feuille plate dont les pores vivent dans le shader (comme la plaque du 009) : chaque pore est VRAIMENT ouvert (alpha 0, rien n'écrit la profondeur), il a une paroi (le rayon glisse dans l'épaisseur), et son ouverture est un nombre par pore (`uOpen[45]`, calculé en JS : le même nombre arrête les ions). Ordre de fermeture : le rang de la distance au point chaud, semé.
- **Translucide pour de vrai** : ce qui est SOUS le film (ions, lueur du point chaud, liquide) est dessiné AVANT lui, il les voile (alpha ≈ 0,8) ; ce qui est dessus est dessiné après. Et la braise est reportée sur la face du film (d'abord avec sa parallaxe : abandonné, voir planche b).
- **Fondre = changer de matière** : la feuille gonfle (sommets), se glace (rugosité 0,9 → 0,36 au final), devient opaque et veille ; chaque pore fermé garde une cicatrice (cuvette lisse).
- **Les ions** : une tête (boule de lumière) et une traîne orientée sur la vitesse ; ils convergent vers leur pore (entonnoir), le traversent, s'écartent dessous. Pore fermé : ils glissent vers une place de repos SUR le film (un petit tas de trois), fixe — aucune dépendance au temps une fois fermés (pas de clignotement).
- **Les électrodes** : enduit granuleux sombre (grain en relief dans le shader, fondu sous le pixel) + la feuille de métal claire au dos : trois gris avec le film.

## Fil

- **Planche a (4 images)** : le fichier passe au build du premier coup, les pores sont de vrais trous avec leur paroi. Raté : les grains bavent (trop gros, trop lumineux : un semis de points), la feuille de métal du haut renvoie la boîte à lumière (bave), le film fondu est un panneau néon vert, les points chauds sont de grosses boules roses, « si elles se touchent » illisible vu de trois quarts haut.
- **Planche b (8)** : grains plus petits avec une vraie traîne (r 0,165, traîne 1,9), métal mat, grain des enduits plus fin, film fondu en jade sombre, chaque pore fermé = une cuvette + un bourrelet clair, dômes resserrés. « Si elles se touchent » se lit enfin **de profil, caméra basse (el 9)** : les deux enduits se rejoignent en deux cônes à travers le film. Raté : la braise ne luisait PAS à travers le film — je l'avais reportée sur le film avec sa parallaxe (juste physiquement pour une vitre, faux pour une feuille laiteuse : à 32° la tache tombait hors du film).
- **Planche c (8)** : la braise fait maintenant une tache sur le film À SON APLOMB (une lampe sous une feuille de papier), quel que soit le point de vue. `litAlu` / `litCopper` / `litFilm` / `liquid` vérifiés ; la chambre (`set` 1) à `micro` 1 et 0,5 : la maquette tient seule sur le noir, l'entrée ne claque pas. Raté : reflets en têtes d'épingle sur le film glacé (risque de scintillement), « après » brûlé.
- **Planches d et e (6 + 4, avec l'en-tête et les zones)** : rugosité du film fondu 0,13 → 0,36 (une nappe de reflet, plus d'épingles), grains au repos moins lumineux (un tas qu'on compte). Avec les `shift` de `world.js` (175) l'électrode du haut passe derrière l'en-tête : poses ci-dessous. `npm run check -- 022` passe (58/58).

## Ce que fait chaque nombre

| nombre | chez moi |
| --- | --- |
| `micro` | fondu d'entrée (lissé) : opacité des électrodes et du film, gain de tout ce qui émet |
| `bench` | mon halo de fond à 55 % sur l'établi (sa flaque est dessous), 100 % dans la chambre |
| `temp` | **ignoré** (la chaleur est dessinée par `spot`, `touch`, `chain`) |
| `ions` | luminosité des grains (135 en vol : 3 par pore, 3 cm/s, un dix-septième de leur espacement par image) |
| `pores` | 1 → 0 : les 45 pores se ferment dans l'ordre de leur distance au point chaud (3 ou 4 en train de se fermer à la fois) ; le même nombre par pore arrête ses grains, qui glissent vers un tas de trois posé sur la cuvette — fixe, sans dépendance au temps |
| `melt` | le front part du point chaud : la feuille gonfle (0,24), passe de mat fibreux à glacé (rugosité 0,9 → 0,36), d'alpha 0,8 à 0,97, d'encre à jade veille |
| `spot` | taille (0,5 + 1,3·spot) et intensité de la braise : cœur + traîne sur la face de l'électrode du bas, un dôme, et sa tache sur le film |
| `liquid` | deux corps de verre signal dans les intervalles (×1,7 avec `chain`) |
| `touch` | deux cônes d'enduit poussent l'un vers l'autre et se rejoignent dans le plan du film, juste derrière la coupe (x 2,6 · z −1,4) ; le film s'ouvre là (rayon 0,8) ; à partir de 0,6 leurs pointes et la jonction s'allument signal |
| `chain` | sept points chauds s'allument l'un après l'autre sur la face du bas, de plus en plus loin (un sursaut à l'allumage) |
| `hair` | le cheveu : verre encre + treize écailles en traits de 2 px |
| `litAlu`, `litCopper` | l'enduit et sa feuille s'éclairent encre |
| `litFilm` | le film luit veille |

## Poses (prêtes à coller, vérifiées avec l'en-tête)

- **Au repos / après** : `{ ...P, tx: MX, ty: MY, tz: MZ, d: 86, az: -36, el: 24, shift: 185 }` (104 était trop loin : la maquette ne faisait que 60 % de la largeur)
- **Le film de près** : `{ ...P, tx: MX + 1, ty: MY, tz: MZ + 1.6, d: 72, az: -32, el: 32, shift: 120 }`
- **Le climax** (pores ≈ 70 × 40 px) : `{ ...P, tx: MX + 2.2, ty: MY, tz: MZ + 1.4, d: 60, az: -30, el: 36, shift: 60 }` — le coin arrière de l'électrode du haut affleure le bas de l'en-tête : `shift: 40` si `check` signale un contraste
- **« Si elles se touchent »** (de profil, caméra basse) : `{ ...P, tx: MX + 2.6, ty: MY - 0.3, tz: MZ + 0.5, d: 50, az: -24, el: 9, shift: 100 }`
- **Couverture (candidate)** : `{ tx: 0.6, ty: 6, tz: 0.4, d: 80, az: -32, el: 40, fov: 28, shift: 120 }` avec `set 0, micro 1, ions 1, spot 1, melt 0.55, pores 0.5, mood 0` : moitié ouverte (les grains passent), moitié fermée (jade, cuvettes), la braise au milieu

## À changer ailleurs

`episodes/022-batterie-telephone/src/world.js`, dans `VIEW` (les trois lignes « at the scale of the pores ») :

```js
    pores: { ...P, tx: MX, ty: MY, tz: MZ, d: 86, az: -36, el: 24, shift: 185 },
    film: { ...P, tx: MX + 1, ty: MY, tz: MZ + 1.6, d: 72, az: -32, el: 32, shift: 120 },
    hot: { ...P, tx: MX + 2.6, ty: MY - 0.3, tz: MZ + 0.5, d: 50, az: -24, el: 9, shift: 100 },
    climax: { ...P, tx: MX + 2.2, ty: MY, tz: MZ + 1.4, d: 60, az: -30, el: 36, shift: 60 },
```

Rien d'autre : `plan.js` (`MICRO`) est respecté à la lettre, sauf la paroi des pores, dessinée avec 0,34 de profondeur au lieu de 0,5 (on voit davantage à travers).

## Pas au niveau (dit franchement)

- **Rien n'a été vu en mouvement** : la fermeture « un à un » (le bourrelet qui gonfle, 0,06), le glissement des grains vers leur tas, le jumeau des grains passés sous le film (il peut s'éteindre en l'air sous un pore qui se ferme) ne sont jugés que sur des images fixes. À regarder au brouillon, avec `qa`.
- **Le cheveu** se lit comme une baguette de verre à gribouillis plus que comme un cheveu.
- **Le film « s'épaissit »** : c'est surtout la couleur, le glacé et l'opacité qui changent ; le gonflement (0,24) ne se voit qu'à la tranche avant.
- **Le grain des enduits** : un bruit « roche », un peu mou en très gros plan (la pose de profil).
- **`touch` vu d'en haut** (VIEW.film) : une boule de lumière ; il ne se lit que de profil. La brèche du film est invisible de profil.
- **`chain`** : sept dômes de même taille ; sobre, mais c'est « des points qui s'allument », pas davantage.
- Reflets du film glacé : rugosité remontée pour éviter le scintillement, non vérifié pendant un mouvement de caméra.

## Images lues : 30 / 30 (planches a 4 · b 8 · c 8 · d 6 · e 4)

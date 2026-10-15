# 019 · Ceinture — ce qui a changé depuis que le plan est écrit

Ces lignes priment sur `docs/019-actes.md`. Les décors sont rendus : `docs/journal/019-model.md`, `docs/journal/019-cabine.md`.

## Fixé

- **`POSE0`** est choisi sur planche et collé dans `world.js` : toute la chaîne dans le cadre (toi, la sangle et son mou, l'anneau, l'enrouleur en bas à droite, x ≈ 830), `side: 200`. `FIRST` n'a pas bougé (`slack: 1`). Personne ne les change. La première seconde : la sangle se retend SEULE (`slack` 1 → 0), toi immobile — c'est l'accroche.
- `plan.js` : `BELT.ring` corrigé (−77, 113, 40). `model.js` : la trame de la sangle allégée (`WEAVE.dark` 0,68), des deux côtés d'un coup.

## L'en-tête : aucun chiffre que la voix ne dit pas

- `load` reste à 0 pendant tout l'acte 1 (pas de « ≈ 400 kg » dans la scène « si rien ne la retendait ») : le second compteur y dit « Du mou », rien d'autre.
- À l'acte 3, `load` saute (`now`, pas de glissement : l'en-tête n'affiche jamais de valeur intermédiaire) à 300 sur « Trois cents », à 400 sur « Quatre cents ». Pas de « ≈ 200 kg » sur « s'écrase ».
- Le chrono `ms` : 20 sur « tendue » (le chiffre de la voix) ; au-delà il n'est qu'illustratif — fais-le avancer peu et lentement, ne t'arrête sur aucune valeur précise.

## Les poses (elles ont été vues ; celles de `VIEW` étaient réglées sur des bouchons)

- Sur l'établi (`019-model.md`) : `exploded`, `bar`, `chute`, `charge`, `turbine`, `climax`, `lockSide` — prends celles du journal. L'éclaté n'est pas une rangée de six : quatre pièces sur l'axe (bâti · bobine et sangle · barre · turbine), le blocage au-dessus du bâti, le générateur au-dessus de la turbine. Le `VIEW.lockSide` d'origine voit la roue par la tranche.
- Dans la voiture (`019-cabine.md`) : le mou de profil (az −108, d 250, tz −4 : à az −90 la sangle est sur la tranche), le climax, le choc avec `gap` 3 (`VIEW.profile` ne voit plus le mur au-delà de `gap` ≈ 0,5).

## Ce qui n'est pas au niveau dans les décors, et comment le filmer

- Dans la voiture, sans halo, le bâti de l'enrouleur est sombre sur sombre : quand la phrase parle de lui en situation, serre la lumière sur lui (`fx, fy, fz` sur `HOME`, `fs` petit) et monte `xray`.
- La charge partie est noire sur fond sombre : c'est l'éclair (une lumière qui a un endroit, au coude de la buse) et le gaz veille autour de la roue qui portent « la charge part » — tiens le cadre avant et après, sans coupe au milieu.
- La barre à travers la bobine ne se voit que de bas (`el` ≤ 4) ou depuis az ≥ −40 : pour « la barre se tord », la pose `bar` du journal, `xray` monté.
- La sangle sous charge est saumon sur toute sa largeur : dose `load` pour qu'elle reste une sangle.
- Le passager arrière (le like) : plan moyen seulement, jamais de près ; sa ceinture pendue à côté de lui doit se voir.

## Le rythme

- Acte 3 : le plan compte neuf coupes en ≈ 22 s. Regroupe « La charge part. Le gaz lance la turbine. La bobine tourne à l'envers. » dans UN cadre (la pose `climax` ou `turbine` : c'est ce qui s'allume qui dit de quel mot on parle), puis coupe sur toi pour « la sangle est tendue ».
- La boucle est causale : la voiture arrive au mur, la dernière image est l'instant de la première. `D.loop` ne sait pas laisser un nombre courir jusqu'à la couture : essaie `ease: "sine.in"` sur `gap`, et vérifie qu'il n'y a pas d'arrêt visible avant le contact.
- Personne n'est blessé à l'image : au climax ta tête finit dans le sac, pâle.

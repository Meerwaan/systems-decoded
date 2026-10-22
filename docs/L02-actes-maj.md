# L02 — Ce qui a changé depuis le plan (ses lignes priment sur docs/L02-actes.md)

Écrit le 2026-10-20 par celui qui orchestre, après les trois décors, leurs reprises, l'intégration de l'architecte et l'habillage.

## Un long n'est pas un court

`docs/recette-actes.md` a été écrite pour les courts : **ses zones TikTok ne s'appliquent pas**. Le cadre est celui de `docs/L02-actes.md` (« Le cadre 16:9 et ce qui est automatique »). Ses autres règles valent : un fichier par agent, une coupe complète en tête de chapitre, chaque phrase a sa démonstration sur le mot, 26 images lues au plus, planches AVEC l'en-tête (sans `--bare`), dans le dossier temporaire (`…\scratchpad\L02`, préfixe = ton fichier), jamais dans `renders/`.

Les exigences de Merwan pour tous les longs, à tenir plan par plan : un nouveau plan toutes les 5 à 10 s, jamais plus de 4 s sans mouvement visible ; un sujet qui tient le tiers à la moitié du cadre ; une image ni vide ni trop remplie (une seule information écrite à la fois) ; **chaque coupe est un raccord** (forme, objet ou mouvement : `D.match`, et `fade` sur les coupes de lieu à lieu), on ne coupe pas pendant que la caméra freine ou repart.

## La première image (choisie)

`POSE0` = **hook5** (macro : la tête du détecteur en gros plan, la voisine en signal derrière). Deux défauts, que **c1 seul** corrige en retouchant la pose dans son premier plan :
- une large diagonale de verre blanc traverse le cadre juste à droite de la tête : elle ne doit plus croiser la tête (décaler az / tx, ou la faire sortir du cadre) ;
- on ne voit pas sur quel conducteur le crochet est posé : le crochet doit se lire posé SUR ton conducteur (encre claire, coupé), la voisine signal derrière.
Si c1 change la pose de la première image, il écrit la nouvelle `POSE0` complète sous « À changer ailleurs » : celui qui orchestre la colle dans `world.js`. c6 lit `D.first` : la boucle suit d'elle-même ; c6 compare quand même sa dernière image à celle de `POSE0` actuelle et le dit.

## Ce que les décors ont dit (leurs journaux ont le détail et les poses vues : pars d'elles)

- **poste.js** — seuls ta ligne et la voisine ont un cœur et un halo, le reste du poste est un fil ténu ; ta ligne coupée est une encre claire nette. `efield` se lit de profil (az ≈ −75), presque droit de face. `couple` (arcs voisine → ta ligne) encore un peu emmêlé avec les portées : le cadrer serré ou de profil. `VIEW.ground` seulement avec `cutaway` > 0. Les chargés de consignation sont petits et une colonne de la travée +z passe devant eux : cadrer `cad3` serré, ou effacer la travée. `VIEW.gravel` + `gravel` est la vue la plus lisible du décor.
- **model.js** — la coupe de la chambre ne vaut que pour az −5 à −45. **Le pôle entier sur l'établi (`benchPole`) sort noir sur noir, même avec `AT.benchTall` : ne pas le filmer en entier ; s'en tenir à la chambre, à l'éclaté, aux pièces.** Traînées de SF6 fines en plan large : le gaz se montre de près. Le cuivre des pinces tire sur le brun sous la lumière du poste. Jamais revus après correction : la pancarte, `wrong` / `shock` de 1987 — à regarder dans ton premier lot si tu les filmes.
- **ligne.js** — l'hélicoptère est lisible mais simple et petit en plan large : préférer `heliClose`, `vertigo`, `basket`. La vieille entretoise sombre se voit mal dans les mains du technicien A. Le pied du pylône de 1987 est encombré : cadrer l'apprenti plus haut ou de plus près. Le défaut lointain vu du poste (`defect`) n'a pas été vu : premier lot de c6. `v87` n'a jamais été vue.
- **habillage.js** — voir `docs/journal/L02-habillage.md` : ne cadre pas un plan pour cacher l'habillage ; signale s'il gêne.

## Le kit des transitions

- `D.match(at, [a, b], to, { … })` garde direction et vitesse de part et d'autre de la coupe **seulement si le plan d'avant finit sur `from[0]`** : écris le plan d'avant pour qu'il y arrive.
- Le fondu `mix` laisse voir que l'image qui part est figée au-delà de 0,3 s : 0,2 à 0,3 s au plus ; `dip` (passage au noir) pour un changement de lieu franc (poste → campagne, poste → Virginie 1987).

## Les coutures entre chapitres

Les poses et mouvements rendus d'un chapitre au suivant sont dans `world.js · HAND` (inchangé par l'intégration). Coupures pub de YouTube aux cartes de 127,03 s, 250,72 s et 366,50 s : rien d'important dans la seconde qui suit une carte.

## L'habillage (posé)

Quatre mâts d'éclairage et leurs flaques sur le gravier, villages au loin (côté +x / −z, jamais vers −x où brûle le défaut lointain) ; au crépuscule 2025, deux parcs d'éoliennes à l'horizon côté −z ; en 1987, le camion de l'équipe, phares allumés (avec `v87` de 1 à 2). **Les lampes ont été vérifiées sur hook1, pas sur hook5 (la `POSE0` retenue)** : c1 vérifie qu'aucune ne tombe derrière la tête du détecteur ni dans l'en-tête. Une lampe de `posteWide` tombe à y ≈ 195, juste sous l'en-tête : à surveiller. Proposé à c6 : un arbre sous la phase basse de la voisine, au pylône du défaut, pour « une branche trop proche » (434,3 s) — s'il le veut, ligne exacte sous « À changer ailleurs » (habillage.js).

# CR03 Concorde : le son (monteur-son, 13/11)

`episode.json → sfx` réécrit en entier : 28 éléments, **18 sons ponctuels** (le plafond), 8 boucles, 1 `hush`, `space`. Compte à rebours, donc ni `aspiration`, ni blanc sur « on l'ouvre », ni `sig-ouverture`. À la place, la signature du format : **l'horloge ambre qui saute fait un clic à chaque étape**. Lu : la recette, la banque et ses fiches, la table du script, les « Sons » et « À changer ailleurs » des six journaux d'actes, et une planche de 8 instants (8,10 · 8,45 · 48,30 · 48,50 · 50,62 · 100,20 · 109,80 · 110,20) pour caler le panneau, le pneu, le morceau et la paroi sur l'image.

Niveaux : voix −23,1 LUFS, lit (×0,8) −30,7 LUFS (048 : −31,5 ; 047 : −32,5), crête du mélange −4,8 dBFS. Le lit est un peu plus présent que sur le 048 : c'est un film de menace presque d'un bout à l'autre (le feu brûle de t4 à l'issue).

Extrait à écouter : `episodes/CR03-concorde/audio/essais/CR03-son-ecoute.mp3`. Il n'y a pas de « on l'ouvre » dans ce format, donc deux tranches mises bout à bout : 0 → 12,7 s (accroche, promesse et la coupe vers `principe`), puis 0,8 s de silence, puis 44,0 → 66,8 s (t3 à t5 : trois sauts d'horloge, le pneu, le morceau, le feu, la fuite, l'alarme). C'est un mélange voix + lit fait à la main (pas de brouillon rendu), normalisé à −16 LUFS.

## Table de cohérence

| Instant | Ce qui bouge à l'image | Matière | Geste | Son choisi | Pourquoi il colle |
| --- | --- | --- | --- | --- | --- |
| 0 → 4,47 (boucle) | la traînée de feu derrière l'avion qui avance et cabre, image 0 | feu, air | grondement continu | `CR03-torche-feu` en boucle, −16, monte sur `choc` | c'est le feu de ce film (son sujet), déjà en cours à l'image 1 |
| 0,02 | la première image | (signature) | coup | `sig-dossier`, main −8 | signature du compte sur l'image 0 |
| 8,06 | le panneau d'intrados s'ouvre en rouge sous l'aile, le jet sort | aluminium, liquide | arrachement, puis jaillissement | `CR03-panneau-arrache` −10 | fabriqué pour ce panneau : pop, rivets, giclée ; la planche le montre ouvert dès 8,10 |
| 8,34 → 10,67 (boucle) | le jet de kérosène orange sous l'aile | liquide, air | jaillissement continu | `CR03-kerosene-fuite` en boucle, −18 | la fuite du film, tenue jusqu'à la coupe vers la piste |
| 30,90 · 39,94 · 44,42 · 51,84 · 62,34 · 71,92 · 78,98 · 84,66 · 91,43 | l'horloge ambre saute à l'heure de l'étape (0,08 s avant, t1 à t8, puis issue) | (affichage) | déclic | `relais` −9, 0,3 s | ce n'est pas un objet de la scène : un générique sec, le même à chaque saut, celui d'un afficheur qui bascule ; il tombe dans le seul creux avant l'heure dite |
| 48,40 | le pneu n° 2 éclate sur la lamelle | caoutchouc | explosion, lambeaux | `CR03-pneu-eclate` −8 | son du sujet ; la planche montre le pneu intact à 48,30 et éclaté à 48,50 |
| 50,76 | le morceau frappe le dessous de l'aile, la caméra encaisse | caoutchouc contre aluminium plein de kérosène | choc sourd | `CR03-debris-aile` −6 | fait pour ce choc (un coup creux sur une paroi pleine de liquide) ; posé dans le creux entre « frappe » et « le » |
| 54,26 → 91,37 (boucle) | le feu prend derrière l'avion et brûle jusqu'à la chute | feu, réacteurs | grondement continu | `CR03-torche-feu` en boucle, −17, entrée en 0,6 s | le feu qui prend (« flammes ») ; sa `curve` retombe au moteur 2 coupé (68,82), au moteur 1 étouffé (70,78) et quand la poussée s'effondre (86,29), puisque ce son mêle le feu au grondement des réacteurs ; il s'éteint en 0,6 s sur « tombe » et s'arrête net à `toissue` |
| 56,02 → 62,30 (boucle) | la fuite à 60 kg/s, l'aiguille de la jauge qui file | liquide | jaillissement | `CR03-kerosene-fuite` en boucle, −22 | ce que dit la jauge, entendu sous le feu |
| 63,40 | l'alarme feu (étiquette, la nacelle s'ouvre sur « sonne ») | cloche du poste | sonnerie | `CR03-alarme-feu` −17, 2,4 s, fondu 0,8 | l'alarme feu du Concorde, faite pour ce plan ; basse, sous la phrase qui la nomme |
| 91,37 → 97,84 | coupe sur la piste vide | air | vent | `amb-vent` seul ; `amb-tension` tombe d'un coup à 0,25 | « aucune image du crash » : le silence d'une piste vide, puis l'horloge saute (16:44:31) dans ce vide |
| 100,31 | le morceau de pneu frappe l'intrados (coupe du réservoir) | caoutchouc contre aluminium | choc sourd | `CR03-debris-aile` −6 | le même choc qu'à 50,76, le même son : on le reconnaît |
| 108,25 → 110,06 | le front traverse le kérosène | (pression) | montée | `amb-tension`, `curve` à 1 sur `trigger` | aucun son ponctuel ne dit juste une onde de pression dans un liquide : c'est la nappe qui monte |
| 110,08 | **climax** : la paroi cède ailleurs, les rivets sautent, le jet sort | aluminium, liquide | arrachement, jaillissement | `CR03-panneau-arrache`, main −5 | le même panneau qu'à 8,06 : la promesse « de l'intérieur » est payée par le même son, plus fort et dans la pièce |
| 119,60 → 121,95 | **chute** : « Et ça, personne ne l'avait prévu », recul sur la piste | — | vide | `hush` −14 | la chute sans aucun coup, dans un vide |
| 121,97 | l'horloge saute à 2001, la lumière blanchit | (affichage) | déclic | `relais` −9 | le dixième saut, juste après le vide (« un son qui tombe après un silence compte double ») |
| 129,22 → 135,52 (boucle) | retour sur le feu (réponse du BEA, appel au commentaire) | feu | grondement | `CR03-torche-feu` en boucle, −24 | c'est l'image ; tenu bas, puisqu'on est dans les appels à l'action |
| 145,96 → fin (boucle) | coupe sur le feu de l'image 0 | feu | grondement | `CR03-torche-feu` en boucle, −16 | la dernière image est la première : le même son qu'à 0 |
| 146,36 | la boucle | (signature) | aspiration | `sig-boucle` −10, à partir de 0,6 s | signature de la boucle |
| tout le film (boucles) | — | air | vent ; nappe | `amb-vent` −28 (le lieu, à ciel ouvert, presque coupé dans le réservoir) · `amb-tension` −16 (monte jusqu'à t5, retombe sur la piste vide, remonte avec le front) | les ambiances : un lieu, une tension |

Compte : 1 `sig-dossier` + 2 `panneau-arrache` + 10 sauts d'horloge + 1 pneu + 2 morceaux + 1 alarme + 1 `sig-boucle` = **18**.

## Sons à fabriquer (réserve, `episode.json → sons`, `"reserve": true`)

- **`CR03-reacteurs`**, 6 s, à jouer en boucle : les quatre réacteurs à pleine poussée, post-combustion allumée. Ils manquent à l'image : de « Top » (32,10, les quatre dards ambre s'allument) jusqu'à t3, l'avion roule sans aucun bruit de moteur. Aucun son de la banque ne convient (`moteur-fusee` est une fusée, `amb-cabine-avion` s'entend de l'intérieur). En attendant, ce passage reste sans moteur. Une fois le son fabriqué, la ligne à poser (une boucle, elle ne compte pas parmi les 18) :
  `{ "type": "sample", "file": "CR03-reacteurs.wav", "loop": true, "from": "top", "to": "toissue", "gain": -20, "bus": "under", "fade": 0.4, "curve": [["top", 0.2], ["t1:gaz", 1], ["coupe", 0.75], ["etouffer", 0.55], ["effondre", 0.15], ["tombe", 0]] }`
  et, pour le décollage de 2001 (≈ 135,5 → 139) : `{ … "from": "comment:Concorde-0.14", "to": "toabo", "gain": -24, "fade": 0.5 }`.

## Ce qui n'est pas au niveau

- **Le plafond de 18 est atteint**, et la moitié va à l'horloge (dix sauts). Plusieurs mouvements restent donc muets, faute de place ou de bon son : le train qui retombe (74,4), les trois moteurs qui s'éteignent un par un (86,29, rendu seulement par la `curve` du feu), les feux du Bourget (83,3), la doublure en Kevlar (124,26), le morceau qui rebondit sur la paroi doublée (125,6), la coche verte (128,30), le train qui rentre en 2001 (139,6), et toute la partie `principe` / `reservoir` (10,7 → 30,9 : la ligne V1, la barre qui vire au rouge, la goutte). Si l'oreille trouve l'horloge trop présente, on peut ne garder le clic qu'à t1, t3, t5, t8 et issue, et rendre ces places au train ou au Kevlar.
- **Les sons ponctuels tombent sur des mots.** La voix ne laisse presque aucun souffle (aucun creux de plus de 0,22 s entre 44 et 62 s). J'ai calé le pneu, le morceau, le panneau et l'alarme sur l'image, dans le plus petit creux disponible : ils passent sous la phrase, sur le bus `fx` (−7 dB). Le panneau de la promesse (8,06) tombe sur « ouvert… », comme l'image.
- **L'alarme** est une cloche continue sous « sonne neuf secondes après l'appel du contrôleur » : elle est basse (−17, puis −7 dB sous la phrase). À l'oreille de Merwan de dire si elle gêne.
- `sig-boucle` démarre sur « joué à la seconde… », pas dans un souffle (il n'y en a pas). Je l'ai repris tel que dans le 048 (`rewind`, à partir de 0,6 s).
- Le lit est ≈ 1 dB plus fort que celui du 048 (−30,7 contre −31,5 LUFS).
- `npm run script` ne vérifie pas le son sur un CR (`Number("CR03")` n'est pas un nombre) : j'ai compté à la main.

## À changer ailleurs

- `scripts/lib/ecriture.mjs`, § 11 : le test `Number(ep.id) >= 43` saute les Comptes à rebours (CRnn). Il faudrait appliquer le plafond de 18 et l'interdiction des synthés aux CR, sans la vérification « on l'ouvre » / `sig-ouverture` qu'ils n'ont pas.

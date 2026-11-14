# CR04 Lac-Mégantic — le son (monteur-son, 14/11)

Compte à rebours : pas de « Alors… on l'ouvre » (recette-compte-a-rebours), donc ni `aspiration`, ni blanc, ni `sig-ouverture`. Banque `kit/sons/` seule : **aucun des cinq sons du sujet (`episode.json → sons`) n'est fabriqué** (aucun `CR04-*.wav` dans `kit/sons/`, et `npm run sfx` refuse un fichier absent). Les moments qu'ils devaient rendre restent **sans son** en attendant ; rien de générique à leur place.

`sfx` : 20 éléments, **16 ponctuels**, `space` 0,18, deux boucles, un `hush`. `npm run sfx` : crête −9,1 dBFS ; `npm run script` : aucun ⚠ « son ». `duck`, `duckFx`, `bedVolume` (0,8) inchangés.

Écoute : `episodes/CR04-lac-megantic/audio/essais/CR04-son-ecoute.mp3` (voix + bed, −14 LUFS), trois morceaux collés : 0 → 12 s (accroche, promesse) · 41,5 → 72 s (essai, feu, coupe-circuit, compresseur, bouffées) · 97,5 → 112 s (passage, déraillement, embrasement, silence, « Depuis »).

## Table de cohérence

| Instant | Ce qui bouge | Matière | Geste | Son | Pourquoi il colle |
| --- | --- | --- | --- | --- | --- |
| 0 → fin | la nuit dehors, sur la pente de Nantes | air | souffle | `amb-vent` −30, bus under, courbe (0,4 au principe, 1 à l'issue, 0,35 aux CTA) | le lieu : une voie dehors, la nuit, comme CR03 |
| 0 → fin | la tension du compte à rebours | — | — | `amb-tension` −16, courbe 0,45 principe → 1 de `tozero` à l'issue → 0,3 CTA → 0,8 boucle | le lit, pas un objet |
| 0,02 | première image, signature | — | — | `sig-dossier` −8, main | signature du compte |
| 30,02 · 41,86 · 53,06 · 59,61 · 67,46 · 76,50 · 93,65 (`tN−0,08`) | l'horloge ambre saute d'heure | horloge | bascule | `relais` −9, 0,3 s | signature 2 du format (« l'horloge saute, avec un son dans un souffle »), même réglage que CR03 ; dans chaque souffle d'entrée de beat |
| 45,0 (`desserre+0,9`) | la poignée des freins à air relâchée | air comprimé | échappement | `vapeur` −17, 1,1 s, fondu 0,6 | un desserrage de frein à air est un pschit sous pression ; même matière, même geste |
| 56,45 (`feu3+0,35`) | les flammes s'allument sur la locomotive de tête | feu | embrasement | `feu` −15 | prévu au devis (`CR04-feu-loco` reprend `feu`) |
| 62,0 (`coupent+0,42`) | le levier du coupe-circuit bascule | métal | claquement lourd | `disjoncteur` −10 | un interrupteur industriel qu'on jette : thunk mécanique lourd, c'est ce qu'on voit |
| 67,1 (`arrete+0,36`) | le compresseur s'arrête net | moteur, métal | ralentit, s'arrête | `046-compresseur-arret` −16, 0,5 s | un son de sujet d'un autre film qui montre la même chose (un compresseur coupé) ; coupé court avant le saut d'horloge 67,46 |
| 69,15 (`fuit5+0,25`) | les bouffées d'air sortent du raccord | air comprimé | bouffée | `vapeur` −20, 0,5 s | même pschit, plus court et plus bas : la fuite lente |
| 102,9 (`deraille+0,92`) | les citernes se couchent | acier | écrasement | `metal-ecrase` −15, fondu 0,6 | tôle d'acier qui se plie et s'écrase ; vu de loin, donc bas |
| 104,3 (`embrase+0,44`) | le pétrole s'embrase, la lueur monte | feu | explosion | `explosion` −12, main | prévu au devis (`CR04-deraille` reprend `explosion`) ; le climax |
| 105,73 → 109,39 (`hush`, −14) | coupe sur la pente vide, plus rien ne bouge | — | silence | `hush` de `enquete−0,16` à `todepuis−0,05` | le vide avant la chute (« le roulement s'arrête net ») ; la chute elle-même : rien |
| 141,74 (`rewind`) | la boucle | — | — | `sig-boucle` −10, offset 0,6 | signature |

## Sons à fabriquer

Les cinq du devis, déjà dans `episode.json → sons`, pas encore fabriqués :

| Son | Où il entre une fois fait |
| --- | --- |
| `CR04-train-s-ebranle` (5 s) | 0,02 première image (le train garé qui démarre : sabot, attelages) ; 82,58 `trigger` « Le train part » (souffle 82,9 → 83,27, attelages 83,6 → 84,0) — c'est le cœur du film, aujourd'hui sans bruit |
| `CR04-frein-main` (3 s) | 40,86 → 41,50 les sept cliquets (`sept`) ; 21,5 → 22,4 cliquet du volant (principe) ; 117,1 → 118,9 et 123,6 → 124,3 (fin) |
| `CR04-air-fuit` (4 s, boucle) | sous `t5` (67,5 → 76) et 91,4 → 91,7 (`vidait`), bus under |
| `CR04-train-file` (5 s, boucle) | 93,61 → 105,73 sous `t7`, coupée net par le `hush` |
| `CR04-loco-arret` (4 s) | 6,84 → 7,1 (promesse, moteur coupé) et 17,42 → 18,4 (principe) ; pourrait remplacer `046-compresseur-arret` à 67,1 |

Réserve ajoutée (`reserve: true`, 3 s sur 9) : **`CR04-passage-niveau`**, la cloche du passage à niveau, 98,94 → 101,77 (les feux clignotent à l'image).

Une fois faits, rester sous 18 ponctuels : les boucles ne comptent pas ; `train-s-ebranle` ×2 et `frein-main` ×1 font 19 → retirer le `relais` de `t4` (le coupe-circuit 62,0 tient déjà ce plan) ou le second `vapeur`.

## Ce qui n'est pas au niveau

- Sans les sons du sujet, **le départ du train (82,58) et la première image n'ont pas leur vrai bruit** : seule la tension monte. C'est le manque principal.
- Le train lancé (t7) ne roule pas à l'oreille ; la cloche du passage à niveau manque.
- `vapeur` est un jet de vapeur « fort » : à 45,0 il colle ; à 69,15 il est raccourci, à réentendre (l'`air-fuit` du devis sera plus juste).
- Rien sur le feu qui s'éteint (64,5) ni sur les casques posés (113,9) : pas d'objet sonore juste dans la banque, et on est dans les CTA.

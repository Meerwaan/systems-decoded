# 013 Halo : contre-vérification du script (2026-10-09)

9 appels web. Sources lues : the-race.com (rapport FIA cité), crash.net (Brawn ; Grosjean 2016), autosport.com (How to build a halo), moteurs de recherche (résumés, signalés).

## Verdicts

| # | Beat | Verdict |
|---|------|---------|
| 1 | accroche | EXACT |
| 2 | promesse | EXACT (voir note sur « grâce à ») |
| 3 | scene | EXACT (roue arrière droite de Grosjean / avant gauche de Kvyat ; 192 km/h, 29 degrés, 67 g : rapport FIA) |
| 4 | ouvre | sans objet |
| 5 | eclate | À NUANCER (ancrages) |
| 6 | repos | À NUANCER (125 kN, « avant de courir ») |
| 7 | seuil | EXACT (la cellule perce la glissière : voir 8) |
| 8 | zero | EXACT |
| 9 | reponse | **NON SOURCÉ** (à remplacer) |
| 10 | feu | À NUANCER (« par-dessus le rail » vs 28 s) |
| 11 | chute | À NUANCER (« n'amortit rien ») |
| 12 | like | sans objet |
| 13 | abo | sans objet |
| 14 | comment | EXACT (citations) |
| 15 | boucle | sans objet |
| épinglé | | EXACT |

## Détail

**9. NON SOURCÉ.** Aucune source lue ne dit que le rail « s'écarte au-dessus de ta tête » ni que le Halo « prend l'acier ». Ce qui est établi :
- Rapport FIA (cité par The Race, https://the-race.com/formula-1/fia-completes-investigation-into-grosjean-bahrain-crash/) : après la rupture du rail du milieu et la forte déformation des rails haut et bas, « the survival cell was able to pierce the barrier and came to rest behind the barrier, constrained by the primary roll structure against the upper rail ». Le texte dit « primary roll structure » : c'est l'arceau principal, non nommé Halo ; ne pas l'identifier au Halo sans plus.
- Le même rapport : casque, HANS, harnais, cellule, siège, appui-tête et Halo ont fonctionné « according to their specifications in protecting the driver's survival space ».
- The Race (analyse du crash) : le Halo est resté intact, enfoncé dans la glissière.
- Brawn (https://www.crash.net/f1/news/949560/1/halo-f1-device-saved-grosjeans-life-bahrain-brawn) : « no doubt » que le Halo a sauvé Romain ; rail qui se sépare = « normally resulted in a fatality ». Il ne décrit pas le mécanisme. Un résumé de moteur de recherche ne retrouve aucune source pour « au-dessus de la tête ».
- Remplacement : « Et devant ton casque, l'arceau tient : il reste entre toi et l'acier. » (garde « devant ton casque », « l'arceau », « l'acier »). Si le plan montre la glissière qui s'ouvre autour de la cellule, c'est le rapport FIA : la cellule perce, rien de plus.

**5. À NUANCER.** Titane grade 5 : FIA (https://www.fia.com/news/how-make-f1-halo, via archive) et Autosport. Cellule en carbone : connu, non rouvert. Les points de fixation : seule source lue (Novatech, résumé) dit « trois positions » ; la répartition 1 devant / 2 derrière n'est confirmée par aucune page lue, et Autosport dit seulement qu'il se boulonne à un châssis renforcé. Remplacement : « Un arceau de titane. Un pied, devant tes yeux. Deux ancrages, sur les côtés. » ; ou, à la voix, « Trois ancrages » sans placer. Sinon garder l'original en l'indiquant dans `sources` comme simplification.

**6. À NUANCER.** FIA/Autosport (2017) : 125 kN par le dessus tenu cinq secondes, et 125 kN de côté, sans défaillance de la cellule ni des fixations. Mais des résumés du règlement 2018 donnent 116 kN vertical + 46 kN et 93 kN latéral + 83 kN (non confirmés par une page lue) : 125 kN est la valeur d'un article de la FIA, pas forcément le texte réglementaire actuel. « Bus à impériale » : James Allison (Mercedes), « roughly the weight of a London double decker bus sitting on top of the halo » (motorsport.com, via archive) : c'est une image d'ingénieur, ordre de grandeur. « Avant de courir » : c'est un essai d'homologation du châssis (chaque conception doit le passer), pas un test avant chaque course : « avant de courir » peut se lire ainsi, mais ne pas dire « chaque course ». Remplacement : « Avant de courir, on l'écrase : plus de cent kilonewtons. À peu près le poids d'un bus à impériale. Il n'a pas le droit de céder. » À l'écran : « ≈ 12 tonnes » sans « 125 kN » exact, ou « 125 kN » avec « environ ».

**10. À NUANCER.** Rapport FIA : pied gauche d'abord coincé, libéré en laissant la botte dans la voiture (The Race). 28 s : « from the accident finishing to successfully exiting the car », selon Grosjean (le résumé du communiqué FIA parle de 27 s : « environ » est la bonne marque). Le franchissement du rail vient après la sortie de la voiture et avec l'aide du médecin (Ian Roberts, archive). Remplacement : « Le feu. Ton pied est coincé : tu laisses ta chaussure. 28 secondes, environ… et tu es hors de la voiture. » ; ou garder « tu passes par-dessus le rail » en le plaçant après l'horloge (le compteur s'arrête à ≈ 28 s, la scène du rail vient ensuite).

**11. À NUANCER.** FIA : casque, HANS, harnais, cellule, siège, appui-tête « managing the forces applied to the driver ». Le Halo est listé pour « protecting the driver's survival space » : rien dans les sources n'en fait un absorbeur. « n'amortit rien » est vrai en substance (structure rigide) mais net ; l'attribution des 67 g à « ta coque et ton harnais » omet le siège, le HANS et l'appui-tête. Remplacement : « 67 g : c'est ta coque, ton siège et ton harnais qui les ont pris. L'arceau, lui, n'est pas là pour amortir. Il garde une seule chose… la place de ta tête. » (garde « 67 g », « coque », « harnais », « L'arceau, lui », « la place de ta tête »).

**2.** « Grâce à un arceau » : Brawn et Grosjean l'attribuent au Halo ; le rapport FIA dit que tout l'équipement a fonctionné. Acceptable en promesse, car la chute (11) précise. Ne pas ajouter « seul ».

**8.** « L'arrière s'arrache » : FIA, « separation of the power train assembly from the survival cell ». « Ta voiture se sépare en deux » : formule courante dans la presse, acceptable. « Ta coque entre dans le rail » : « survival cell was able to pierce the barrier ». EXACT.

**14.** 2016 : Grosjean (directeur du GPDA), « sad day for F1 / Formula One », juillet 2016, quand la FIA a confirmé le Halo pour 2018 (https://crash.net/f1/news/871430/1/its-a-sad-day-for-f1-grosjean-on-halo ; la formulation exacte varie d'un média à l'autre : « Formula One » dans l'archive, « F1 » dans le titre). 2020 : « I wasn't for the Halo some years ago but I think it's the greatest thing that we've brought to Formula 1. Without it I wouldn't be able to speak to you today. » (RaceFans, Instagram 29/11/2020, via archive ; confirmé par résumé de recherche). Traductions fidèles. Épinglé : Halo obligatoire depuis 2018, Grosjean contre : exact.

## À écrire dans `sources` (simplifications assumées)
- Le Halo : trois points de fixation ; seul le nombre est retenu, pas la répartition.
- 125 kN : valeur de la FIA (essai par le dessus, cinq secondes) ; le règlement donne d'autres valeurs selon l'année et la direction ; « bus à impériale » = image d'Allison.
- 28 s : durée selon Grosjean/presse (27 s dans un résumé du communiqué FIA) ; « environ ».
- Le film ne dit pas comment le Halo touche le rail : il montre la cellule qui perce la glissière (FIA) et le Halo qui reste entre le casque et l'acier (Halo intact selon The Race ; « survival space » préservé selon la FIA).
- « Se sépare en deux » = le groupe propulseur se détache de la cellule de survie.
- Citations de Grosjean traduites.

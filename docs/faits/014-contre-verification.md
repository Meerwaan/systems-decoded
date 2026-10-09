# 014 — ABS : contre-vérification du script (2026-10-09)

11 appels web (7 recherches/pages lues, 4 pages en échec ou résumé de moteur seulement, signalés).

## Verdicts

| # | Beat | Verdict | Remplacement |
| --- | --- | --- | --- |
| 1 | accroche | EXACT | — |
| 2 | promesse | À NUANCER | « C'est ta voiture : elle relâche tes freins, roue par roue, exprès. » |
| 3 | scene | EXACT | — |
| 4 | ouvre | EXACT | — |
| 5 | eclate | À NUANCER | « …Un calculateur. Et sur le circuit de tes freins… deux vannes par roue, et une pompe. » |
| 6 | repos | À NUANCER | « Tant qu'aucune roue ne se bloque, il ne touche à rien. Il surveille tes quatre roues… et il attend qu'une seule ralentisse trop vite. » |
| 7 | seuil | À NUANCER (léger) | « …regarde ce qui se passe dans ta roue. » |
| 8 | zero | EXACT | — |
| 9 | reponse | EXACT | — |
| 10 | tourne | EXACT | — |
| 11 | chute | À NUANCER | « L'ABS ne sert pas d'abord à freiner plus court : sur du gravier, il t'arrête même plus loin. Il garde tes roues en vie… pour que tu puisses tourner. » |
| 12 | like | EXACT (éditorial) | — |
| 13 | abo | hors périmètre | — |
| 14 | comment | EXACT | — |
| 15 | boucle | EXACT (pas un fait) | — |

## Détail

**1, 10, 14 — pédale et consigne (fermé, source constructeur).**
- Honda, notice (honda.ca, GUID-B610DADA…) : « you may notice vibrations through the brake pedal or the vehicle body » ; « These are all normal » ; « Do not pump the brake pedal, rather continue to hold it firmly down. » (via WebFetch ; la copie techinfo.honda.com a échoué sur le certificat.)
- Transport Canada (archive 2007), https://bac-lac.wayback.archive-it.org/web/20071124035317/http://www.tc.gc.ca/roadsafety/tp/tp13082/abs2_e.htm : « As the ABS engages, you may feel the brake pedal pulsating. » ; « This is caused by the system applying and releasing pressure to the brakes. » ; « do not take your foot off the brake pedal until the vehicle has stopped » ; « do not pump the brake ». Même page : une pédale qui pulse à CHAQUE freinage peut venir de disques voilés (l'épinglé dit « freinage d'urgence » : bon).
- Bosch : « Depending on the system, the pedal may pulsate » (« peut »).
- AARP (déjà lu) : Stomp / Stay (« Do not pump the brakes! ») / Steer. NHTSA 1996 « the antilock brakes are doing their own pumping. Do not pump the pedal » : trouvé seulement dans un RÉSUMÉ de moteur, page non ouverte : ne pas citer NHTSA. Citer Honda et Transport Canada.
- « Ton pied veut relâcher » : réflexe humain, présenté comme tel ; pas un fait chiffré, rien à corriger.

**2 — « elle relâche tes freins ».** Bosch : le système baisse la pression « on that wheel alone » (la roue qui va se bloquer), puis la remonte. Phrase juste pour la phase de réduction, mais « tes freins » en entier est trop large : « roue par roue ».

**3 — roue bloquée.** Saab WIS (déjà lu) : « At 100% slip… no lateral force remains for steering. » Deuxième source indépendante non trouvée ; une source A suffit. Transport Canada et DEKRA (déjà lu) disent la même chose de façon qualitative.

**5 — composants.** Bosch (page ouverte) : capteur de vitesse à chacune des quatre roues ; unité hydraulique avec « valves that control braking pressure at each individual wheel, a return pump, and an electronic control unit ». Saab : vanne d'admission (inlet) + vanne d'échappement (outlet) par roue, pompe de retour qui renvoie le liquide au maître-cylindre. Donc « deux vannes par roue » exact, « une pompe » exact (un groupe motopompe, parfois une par circuit). « Sur le tuyau de tes freins… deux vannes » lue seule laisse croire à deux vannes en tout.
- Couronne dentée : décrite par un brevet Bosch GmbH (capteur lisant une « tone ring ») et des sources d'atelier, via résumé de moteur ; pas de page constructeur ouverte (tomorrowstechnician.com : 403). Les systèmes récents à capteur actif lisent parfois une bague magnétique, pas dentée : simplification.

**6, 8 — le calculateur.** Les capteurs « transmit this information to the control unit » (Bosch). Que le calculateur « compare » les roues entre elles n'est PAS écrit par Bosch ; un article d'atelier (résumé de moteur seulement) dit qu'il repère une roue qui ralentit plus vite que les autres. Les calculateurs réels utilisent aussi une vitesse de référence du véhicule et le glissement : « surveille » est vrai sans trop affirmer. « Ne fait rien » : au repos, vannes d'admission ouvertes et d'échappement fermées (article d'atelier), freinage normal ; acceptable. Saab : le module détecte la roue qui chute vers 0 puis ferme la vanne d'admission : phrase 8 exacte.

**7 — seuil.** « Ce qu'elle fait à ta roue » donne à la pédale un rôle actif ; elle ne fait que transmettre le retour. Bénin, variante proposée.

**9 — cycle.** Saab WIS : « Pressure holding: Inlet and outlet valves closed » ; « Pressure reduction: Inlet valve closed, outlet valve open and return pump activated » ; puis montée en pression (admission rouverte). Ordre isoler → relâcher → resserrer : exact. « Il isole ton frein » = la vanne d'admission se ferme, le circuit de l'étrier n'est plus relié au maître-cylindre : bonne façon de le dire. « Jusqu'à 40 fois par seconde » : Bosch, https://www.bosch-mobility.com/en/solutions/driving-safety/antilock-braking-system/ , « up to 40 times a second » (page ouverte, 2026-10-09). Réserve : le résumé d'atelier lu donnait la phase 3 avec la vanne d'admission « closed » : c'est une erreur de résumé, la montée exige l'admission ouverte ; l'ordre du film reste bon.

**11 — chute.** Gravier : étude NHTSA, SAE 1999-01-1287 (Forkenbrock, Flick, Garrott), https://www.nhtsa.gov/sites/nhtsa.dot.gov/files/sae1999-01-1287.pdf (403 à l'ouverture ; contenu lu par résumé de moteur — « Loose gravel was the exception: stopping distances increased by an average of 27.2 percent »). Le PDF doit être confirmé à la main. Même résumé : sur les autres surfaces, l'ABS donne « généralement » des distances plus COURTES, et la stabilité est presque toujours meilleure. Transport Canada (page ouverte) : sur sec ou mouillé, distance « about the same as with conventional brakes » ; sur gravier, neige, neige fondue, allonger la distance, car la roue qui roule « rides on top » du sol meuble alors qu'une roue bloquée s'y enfonce. La phrase « L'ABS n'est pas là pour freiner plus court » est donc trop nette : sur mouillé il fait souvent aussi bien ou mieux. « Ne sert pas d'abord à… » est honnête. Titre à l'image « FREINE PLUS COURT → TE LAISSE TOURNER » : acceptable comme idée reçue barrée ; ne pas écrire « toujours ».

## À écrire dans `sources` (simplifications assumées)
- Un schéma à deux vannes par roue et une pompe ; le nombre réel de vannes et de pompes varie selon la voiture.
- La couronne dentée est la forme classique ; les capteurs actifs lisent aussi une bague magnétique.
- « Il surveille tes quatre roues » : le vrai calcul mêle vitesse de référence et glissement.
- Le tremblement est ressenti « sur certains systèmes » (Bosch : « may pulsate ») ; la consigne vient des notices (Honda, Transport Canada), pas de la NHTSA.
- Le film montre un seul cycle isoler / relâcher / resserrer ; les phases réelles incluent une phase de maintien.
- Gravier : +27 % est une moyenne d'un essai NHTSA de 1999 sur neuf voitures, non affichée à l'écran.

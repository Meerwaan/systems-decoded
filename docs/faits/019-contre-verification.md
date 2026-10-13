# 019 — Prétensionneur : contre-vérification du script

Faite le 2026-10-13 sur `episode.json` (beats) contre `docs/faits/019-pretensionneur.md`. 4 requêtes web sur 12.

Verdict : 12 beats sur 15 tiennent entièrement ; 3 demandent un ajustement (promesse, repos, reponse), 1 une précision (comment).

## Beat par beat

- **accroche** « Choc frontal. Tu n'as pas encore bougé… et ta ceinture se resserre, seule. » — tient. Le dossier autorise « tout de suite, avant que ton corps parte vers l'avant » (NHTSA, A) ; 15-20 ms (IRCOBI, A). Pas de chronologie à la ms près dite : correct. « seule » : pas de capteur propre mais aucun geste de ta part, juste.
- **promesse** « Une charge explosive vient de partir : elle te plaque au siège. » — **ajuster**. « plaque » = elle te retient ; le dossier : il retire le mou, c'est la ceinture puis le limiteur qui retiennent (« À ne pas dire : le prétensionneur te retient »). Effort mesuré 1,5-2 kN : c'est un rappel, pas un plaquage. « Charge explosive » tient (pyrotechnique « en général », NHTSA A). « qu'une fois » tient (Kia A).
- **scene** — tient. Mou, manteau (AXA, B ; ADAC/TÜV B/C), « quelques centimètres » sans chiffre : conforme.
- **ouvre** — tient (signature).
- **eclate** — tient pour un enrouleur : bobine, turbine, générateur de gaz, barre de torsion (NHTSA A). La barre est « souvent », pas toujours : l'image montre un cas type, c'est assumé dans `sources`.
- **repos** « elle se bloque. Aucun explosif : un simple pendule. » — tient avec réserve : le blocage « véhicule » est un pendule ou une bille, il existe aussi un blocage sensible à la sangle (brevets US 3 945 587, 4 166 592 ; B/C ; recherche web du jour concordante). « Mais bloquer ne reprend pas le mou. Pour ça, il faut une explosion » : **ajuster** — il existe des prétensionneurs électriques réversibles (dossier §9, « À ne pas dire : tous pyrotechniques »).
- **seuil** — tient (aucune affirmation factuelle).
- **zero** « Les capteurs de l'airbag donnent l'ordre » — tient (NHTSA A : mêmes capteurs). « Le gaz lance la turbine. La bobine tourne à l'envers » — tient (turbine reliée à la bobine, qui rembobine ; « à l'envers » = dans le sens inverse du déroulement). « Une vingtaine de millièmes de seconde : la sangle est tendue » — tient : 15-20 ms en moyenne, essais NCAP 56 km/h (IRCOBI 2023, A). Réserve déjà notée dans `sources` : ce n'est pas depuis l'instant exact du choc, c'est le début de la montée d'effort ; l'ordre de mise à feu est un peu antérieur. Acceptable comme ordre de grandeur. « Et ton corps… arrive » tient.
- **reponse** « Trois cents kilos. Quatre cents. » — tient : 3-4 kN = ≈ 306-408 kgf (seuil actuel du limiteur, IRCOBI A ; recherche web : limiteur de 4 kN homme moyen / 3 kN petite femme, brevet USPTO 12559057, B). **« Assez pour enfoncer des côtes » — fragile** : 3-4 kN est le seuil choisi *pour ménager* la poitrine (NHTSA : « injury risk is still relatively low »). Au même niveau, des essais sur cadavres montrent encore des fractures (SAE 2019-22-0012, B) ; aucun seuil de fracture en kN n'est établi. La phrase fait de la valeur de protection la valeur qui blesse, et contredit « Ta poitrine ralentit… en douceur ». « Alors la barre se tord. La sangle repart » — tient (NHTSA A, « le plus souvent » une barre).
- **chute** — tient (retend avant, cède ensuite ; pas de ms).
- **comment** « Après un choc, même sans airbag, la ceinture se remplace. » — **préciser** : Kia dit « après l'activation » ; MecaLife (B) précise que même un accident bénin peut le déclencher. Tous les chocs ne déclenchent pas la charge ; « après un choc » seul, sans « déclenchée », dit trop (un pare-chocs frôlé, rien ne part). « Une seule fois ? Oui : la charge est partie » tient.
- **like** — tient (aucun fait).
- **abo** « une boule d'acier de 660 tonnes, suspendue en haut d'une tour » — tient. 660 tonnes métriques (A+H Tuned Mass Dampers via Business Insider, B ; Gigazine, B) ; 41 plaques d'acier, ≈ 5,5 m de diamètre, étages 87-92 selon les sources. Un site (Amusing Planet) donne 728 : ce sont des tonnes courtes (660 t = 728 short tons). Rien de contradictoire. Voir aussi `020-taipei-101.md`.
- **boucle** — tient (aucun fait).

## Corrections proposées

1. **promesse** · « elle te plaque au siège » → « elle retire le mou » (ou « elle te colle au siège ») · le prétensionneur retire le mou, il ne retient pas (NHTSA 811 835, A : « retract the safety belt almost instantly… remove excess slack »).
2. **repos** · « Pour ça, il faut une explosion. » → « Pour ça, ici… une explosion. » · des prétensionneurs électriques réversibles existent (dossier §9, C) ; garder « Aucun explosif : un simple pendule » (brevets, B/C ; le blocage peut aussi être une bille).
3. **reponse** · « Assez pour enfoncer des côtes. » → « C'est ce que ta poitrine peut encaisser. » (ou « Plus haut, ta poitrine souffre. ») · 3-4 kN est le seuil de protection du limiteur, pas un seuil de fracture ; aucun seuil de fracture établi (SAE 2019-22-0012 ; NHTSA A). Longueur voisine, même rythme.
4. **comment** · « Après un choc, même sans airbag, la ceinture se remplace. » → « Une fois la charge partie, même sans airbag, la ceinture se remplace. » · Kia A : remplacement « après l'activation » ; MecaLife B : part même sur un choc bénin.

## Ce que `sources` devrait préciser

- « Plaque » retiré : le prétensionneur retire le mou (~2 kN, 1,5-2,5), c'est la ceinture puis le limiteur qui retiennent.
- 3-4 kN : seuil du limiteur (≈ 300-400 kg), moyenne d'essais NCAP ; pas un seuil de fracture ; 5 kN dans les années 1990.
- Le blocage « pendule » : cas véhicule-sensible (pendule ou bille) ; les enrouleurs ont aussi un blocage sensible à la sangle.
- 660 tonnes métriques (≈ 728 tonnes courtes) pour le Taipei 101 ; étages donnés 87-92 selon les sources, ne pas citer d'étage dans le film.
- Existence des prétensionneurs électriques réversibles, non montrés ici.

## Requêtes utilisées (4 sur 12)

1. Taipei 101 tuned mass damper 660 tonnes — Business Insider, Gigazine, Amusing Planet (B).
2. Load limiter 3-4 kN et fractures de côtes — SAE 2019-22-0012, Comillas IIT-23-150R, brevet USPTO 12559057 (B).
3. Enrouleur véhicule-sensible / sensible à la sangle — brevets USPTO 4166592, 3945587, 4083511 (B/C).
4. Prétensionneur et temps avant le corps / capteurs — MecaLife, Wards Auto (B/C).

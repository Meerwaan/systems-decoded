# L03 — Évacuation d'un avion : contre-vérification du script

Faite le 2026-10-21, avant la voix. 14 requêtes web sur 15.
**Sources ouvertes** : Federal Register du 18/07/1995 (lu, A) ; communiqué EASA du 12/12/2006 (lu, A : 853 passagers plus équipage, 78 s, rien sur le noir ni les blessés) ; Wikipedia « 1985 Manchester Airport disaster » et « Japan Airlines Flight 516 » (lues, B) ; Halldale sur le JL516 (lu, C) ; CBS sur Emirates 521 (lu, B) ; résumés de recherche (A380 : Airbus, ATW, HeraldNet ; Emirates : rapport préliminaire du GCAA).
**Non lus** : le rapport de l'AAIB 8/1988 (PDF de 16,9 Mo, refusé : taille), la copie FAA du rapport (403), le rapport du JTSB sur le JL516 (ni final ni d'étape : introuvable ou inaccessible), le rapport final du GCAA, la fiche SAFO 25003. **Aucun fait de Manchester ni du JL516 n'est donc de niveau A strict** : tout vient de sources secondaires qui citent les rapports.

Verdict : **6 phrases à corriger** (`debit`, `rate1991`, `top`, `p2b`, `p3`, `dubai`), le reste tient. **L'accroche tient telle quelle.**

## Les huit points demandés

1. **Accroche.** « Cinq portes sur huit fermées » : JAL, Wikipedia, Aviation Herald (trois toboggans, 1L, 1R, 4L). « Derrière elles, il y a le feu » : défendable comme simplification. Halldale dit que les portes L2, R2, L3, R3 sont restées fermées à cause du feu extérieur, mais que R4 l'est restée à cause des **étincelles du moteur droit encore en marche** : le film le dit au beat `t6` (« un moteur tourne encore »), donc rien de faux, on ne touche pas. « Trois toboggans pour 379 » : JAL (A). « Presque personne n'a pris son sac » : Reuters et la presse (B) ; « presque » est le bon mot, le JTSB n'a pas été lu. « Les haut-parleurs se taisent » : JAL, sonorisation en panne, mégaphones ou voix (A). « La fumée descend du plafond » : physique générale (la fumée s'accumule en haut, les lumières du haut sont noyées en premier, FAA) ; Wikipedia dit que la cabine s'est remplie de fumée vite ; aucune source ne décrit le sens dans lequel elle a rempli la cabine du JL516 : c'est une scène à la deuxième personne, tient.
2. **A380.** 853 passagers + équipage en 78 s : EASA (A). Obscurité et 8 sorties sur 16 : document Airbus en français (78,04 s, 8 sur 16) et communiqué Airbus (B). 33 blessés dont une jambe cassée : « un homme s'est cassé la jambe, 32 blessés légers » (presse, B/C, une source donne 80 s au lieu de 78, écartée). Tient, toujours dit avec le contexte ; seule la « moyenne par porte » est à corriger (voir `debit`).
3. **Garde-côtes (`t2`).** Dash 8 JA722A, mission de secours après le séisme de Noto, 6 membres d'équipage, 5 morts (pompiers de Tokyo via Wikipedia, B). La phrase ne donne ni nom ni cause, attribue aucune faute, et dit « se percutent » : exacte et retenue. Tient. Rien d'autre dans le film ne doit parler de la cause (rapport d'étape non lu).
4. **Deux déductions.** « Ceux du milieu remontent l'allée » : défendable. Halldale : les équipages de L2, R2, L3, R3 sont restés fermés ; un article de presse dit que les passagers ont été dirigés vers l'avant. Aucun récit de passager n'est cité, et une partie des gens est allée à 4L à l'arrière (ouverte bien plus tard) : le film ne le dit pas, ce n'est pas faux. Tient comme simplification. « Un équipage qui n'a ouvert que les portes loin du feu » : trop positif et en partie faux (4L a été ouverte après une évaluation d'environ huit minutes par un PNC isolé, Halldale, C ; la presse spécialisée discute la coordination de l'équipage). Ce qui est sourcé, c'est que **l'équipage a gardé fermées les portes côté feu**. À corriger (`p3`).
5. **Dubaï.** L'équipage a dit de laisser les bagages et plusieurs passagers sont sortis avec les leurs (rapport préliminaire du GCAA, B ; CBS) ; le capitaine : « drop the bags ». « Ces bagages ont coûté du temps » : CBS lie la récupération des bagages à **une pause** avant l'évacuation, sans la chiffrer ; un commentateur dit « potentiellement, sinon réellement » retardée. Le rapport final n'a pas été lu. À corriger (`dubai`) : dire ce qui est établi, que des passagers ont pris le temps de récupérer leurs bagages. **FAA 2025** : SAFO 25003 du 19/09/2025, non contraignante, non lue (CNN, CTV, NBC, B) : bagages = évacuation retardée, plus de blessés, survie compromise. « Deux mois plus tard » (Denver fin juillet 2025 → 19 septembre) tient. Le film dit « l'écrit noir sur blanc aux compagnies » : un SAFO est une information de sécurité adressée aux exploitants, c'est exact.
6. **Manchester (Wikipedia citant l'AAIB, B ; le rapport lui-même n'a pas pu être lu).** Porte avant gauche ouverte « après environ 25 secondes » (point de départ non précisé dans l'article : le film le place après l'arrêt, comme le reste de la séquence) ; porte avant droite : le steward tente de l'ouvrir 10 s avant l'arrêt, elle se coince « à cause d'un défaut de conception du système de toboggan », ouverte entièrement environ **une minute** après l'arrêt ; issue sur l'aile « disponible 45 secondes après l'arrêt » (deux passagers retirent la trappe de 22 kg) ; passage de 27 cm dans la rangée ; « aucune obligation de briefer les passagers de la rangée » ; le feu perce la cabine arrière par le plancher en moins d'une minute après l'arrêt ; 55 morts (53 passagers, 2 PNC), 48 par inhalation de fumée ; conclusion de l'AAIB : « incapacitation rapide par inhalation de fumée dense, toxique et irritante ». `manch1` à `manch5` tiennent. Réserve : à relire dans le PDF de l'AAIB avant de graver les chiffres à l'image.
7. **Calcul, 16 g, 1991.** « Plus d'une personne par seconde à chaque porte » : (853 + ≈ 20) / 78 s / 8 portes ≈ 1,4 par seconde et par porte, en supposant une répartition égale (jamais sourcée) : à dire « en moyenne » (`debit`). **Sièges** : 14 CFR 25.562, 1988, essai dynamique avec mannequin et critères de blessure, contre 9 g statique sans critère avant (FAA, B) ; « lancés, puis arrêtés net » est une description juste d'un essai sur chariot et le film dit déjà que 16 g est la violence de l'essai : tient. **1991** : le Federal Register dit « deux démonstrations ratées le 26 octobre 1991 » et, dans la même phrase, « un participant a été gravement blessé » sans dire laquelle : le film ne doit pas lier les deux au même essai ; « cette année-là » suffit (`rate1991`). 269 blessés sur 5 797, 4,6 %, 19 démonstrations de 1972 à 1991 : lu et tient (la blessure la plus grave à ce jour : paralysie, le film ne le dit pas, c'est inutile).
8. **Chute.** « Un avion n'est pas fait pour ne jamais brûler. Il est fait pour brûler… après toi. » : défendable. Les règles de survie (coussins qui résistent à la flamme, panneaux qui brûlent moins, balisage au sol, 90 s) supposent qu'un incendie après accident est possible et visent à te laisser le temps de sortir ; le fait du JL516 (le feu entre dans la cabine après le dernier passager) l'illustre. Réserve : un avion est aussi conçu pour retarder et prévenir le feu (matériaux, réservoirs) : la phrase est une synthèse, pas un règlement, et `sources` le dit. Tient telle quelle.

## Phrase par phrase

| Beat | Verdict | Source / remarque |
| --- | --- | --- |
| accroche | tient | JAL (haut-parleurs) ; fumée : scène |
| scene | tient | JAL, Wikipedia ; R4 fermée aussi pour les étincelles (dit en `t6`) |
| promesse | tient | 14 CFR 25.803, annexe J (A) ; preuve par essai ou calcul |
| defi | tient | JAL (A) |
| curiosite | tient | Reuters, presse (B) ; « presque » |
| paquet | tient | Smithsonian (B) |
| ouvre | tient | signature |
| eclate | tient | brevets US 4 368 009, 6 004 176 (A) |
| avant | tient | |
| gonfle | tient | Smithsonian (B) |
| ouverture | tient | Smithsonian (B) |
| bouteille | tient | brevets : azote, souvent avec du CO₂ |
| jet | tient | brevets (A pour le principe) |
| aspire | tient | brevets |
| plein | tient | « quelques secondes » : aucun temps chiffré |
| fuite | tient | brevet US 11 608 838 (A) |
| desarme | tient | Smithsonian (B) |
| relance1 | tient | |
| origine | tient | Federal Register 1995 (A, via résumé) : 1965, 120 s, 50 % des sorties |
| regle67 | tient | 24/10/1967, 90 s |
| essai | tient | annexe J |
| noir | tient | annexe J : seul l'éclairage de secours, une sortie par paire |
| passagers | tient | annexe J : 40 % de femmes, 35 % de plus de 50 ans |
| poupees | tient | annexe J |
| obstacles | tient | annexe J |
| pilotes | tient | équipage de conduite sans rôle actif (annexe J) |
| top | **à corriger** | « Personne » trop large : la règle vise les volontaires |
| indemnes | tient | Federal Register |
| a380 | tient | EASA (A) |
| bord | tient | Airbus (B) |
| top2 | tient | 90 − 78 = 12 s |
| debit | **à corriger** | moyenne calculée, pas mesurée |
| blesses | tient | B/C, une source ; ne jamais dire « 853 en 78 s » sans cette phrase |
| cout | tient | Federal Register : 269/5 797 = 4,6 % |
| rate1991 | **à corriger** | deux essais ratés le 26/10/1991 ; la blessure grave n'est pas rattachée à un essai |
| calcul | tient | amendement 25-46 (1978) |
| fumee | tient | |
| manch1 | tient | Wikipedia/AAIB (B) |
| manch2 | tient | |
| manch3 | tient | ≈ 25 s ; R1 coincée par un défaut de toboggan, ≈ 1 min |
| manch4 | tient | 22 kg, 27 cm, pas de briefing exigé |
| manch4b | tient | « disponible 45 secondes après l'arrêt » |
| manch5 | tient | 48 morts sur 55 par la fumée |
| apres | tient | B (Wikipedia citant BBC / Manchester Evening News) |
| relance2 | tient | |
| lum1 | tient | amendements 25-58 et 121-183, 26/10/1984 ; dix mois avant l'accident |
| lum2 | tient | |
| lum3 | tient | 1,20 m = 4 pieds (FAA) |
| lum4 | tient | éléments photoluminescents, AC 25.812-2 |
| lum5 | tient | Wikipedia/Aviation Herald (B) |
| seuil | tient | |
| siege1 | tient | |
| neufg | tient | 9 g statique, sans critère de blessure (FAA, B) |
| seizeg | tient | 14 CFR 25.562, 1988 |
| mannequin | tient | |
| coussin | tient | règle de 1984, ≈ 650 000 coussins (FAA, B) |
| tout | tient | |
| t1 | tient | 17 h 47, 52 min après le coucher du soleil (Airbus) |
| t2 | tient | retenue ; Wikipedia/pompiers de Tokyo (B) |
| t3 | tient | JAL : 379, dont 8 enfants de moins de 2 ans |
| t4 | tient | JAL |
| t5 | tient | 3 toboggans sur 8 ; « ceux du milieu remontent l'allée » : déduction défendable |
| t6 | tient | 4L ouverte tard (≈ 8 min, Halldale C) : non dit, non faux ; moteur droit en marche |
| t7 | tient | Reuters (B) |
| t8 | tient | JAL : tous vivants |
| t9 | tient | « quelques minutes » ; Halldale (C) : moins de deux minutes |
| t10 | tient | 18 min (JAL) ou 11 (JTSB révisé) : « moins de vingt » |
| p1 | tient | |
| p2 | tient | |
| p2b | **à corriger** | causalité trop absolue |
| p3 | **à corriger** | 4L ouverte tard ; seul le côté feu est sourcé |
| p4 | tient | Wikipedia, Halldale |
| chute | tient | voir point 8 |
| du | tient | GCAA préliminaire, CBS |
| dubai | **à corriger** | « coûté du temps » non établi |
| denver | tient | CNN, NBC (B) |
| safo | tient | non contraignant, non lu (B) |
| derriere | tient | figure de style, pas un chiffre |
| conseil | tient | JAL, FAA |
| comment | tient | |
| like | tient | |
| abo | tient | |
| boucle | tient | |

## Corrections (même texte affiché et dit, balise gardée en tête du `vo`)

**debit**
- text : `En moyenne, plus d'une personne par seconde… à chaque porte. En décembre, l'Europe et les États-Unis lui donnent son certificat.`
- vo : `[warm, conversational] En moyenne, plus d'une personne par seconde... à chaque porte. En décembre, l'Europe et les États-Unis lui donnent son certificat.`

**rate1991**
- text : `En [1991|mille neuf cent quatre-vingt-onze], deux essais ratent le même jour. Et cette année-là, un volontaire est gravement *blessé*.`
- vo : `[serious] En mille neuf cent quatre-vingt-onze, deux essais ratent le même jour. Et cette année-là, un volontaire est gravement blessé.`

**top** (cues `go` = `top:chrono`, `ground` = `top:sol` : mots conservés)
- text : `Aucun volontaire n'a fait d'essai semblable depuis six mois. Ceintures bouclées. Le chrono part… et il ne s'arrête que quand le dernier a les pieds au sol.`
- vo : `[conversational, curious] Aucun volontaire n'a fait d'essai semblable depuis six mois. Ceintures bouclées. Le chrono part... et il ne s'arrête que quand le dernier a les pieds au sol.`

**p2b**
- text : `Un vrai accident dure plus longtemps : des portes ne s'ouvrent pas, la fumée gêne. Ça ne rend pas la règle fausse.`
- vo : `[conversational, curious] Un vrai accident dure plus longtemps : des portes ne s'ouvrent pas, la fumée gêne. Ça ne rend pas la règle fausse.`

**p3**
- text : `Ce soir-là, rien de tout ça : trois portes sur huit, plus de haut-parleurs, et la fumée. Mais il y avait tout ce qu'on vient de voir… et un équipage qui a gardé fermées les portes côté feu.`
- vo : `[curious] Ce soir-là, rien de tout ça : trois portes sur huit, plus de haut-parleurs, et la fumée. Mais il y avait tout ce qu'on vient de voir... et un équipage qui a gardé fermées les portes côté feu.`

**dubai**
- text : `Les trois cents personnes à bord survivent. Mais plusieurs ont pris le temps de récupérer leurs bagages.`
- vo : `[conversational, curious] Les trois cents personnes à bord survivent. Mais plusieurs ont pris le temps de récupérer leurs bagages.`

## À mettre à jour dans `sources` après correction

- Retirer « le bagage a coûté du temps » (ligne Bagages) : remplacer par « plusieurs passagers ont pris le temps de récupérer leurs bagages (CBS, rapport préliminaire du GCAA) ; le rapport final n'a pas été lu ».
- Ajouter : « 1991 : le Federal Register ne dit pas lequel des deux essais ratés a causé la blessure grave ».
- Le descriptif YouTube ne dit rien de faux ; sa ligne de sources cite l'AAIB et le GCAA, tous deux non lus en entier : le garder, c'est ce que leurs résumés rapportent.
- Réserve à lever avant le rendu image : relire dans le PDF de l'AAIB (8/1988) les trois instants de Manchester (25 s, ≈ 1 min, 45 s) et leur point de départ.

# 024 — Bloc opératoire : contre-vérification du script

Faite le 2026-10-13, 13 requêtes sur 15 (recherches et pages). Lecture d'un électricien ayant câblé des locaux à usage médical. Niveaux : A primaire lue · B secondaire sérieuse · C faible. `episode.json` n'a pas été touché.

**Bilan** : 40 phrases, 34 tiennent telles quelles, 6 à retoucher (5 de vocabulaire ou de précision, 1 facultative). Aucune erreur de fond : le principe (premier défaut = alarme sans coupure, second = coupure, raison d'être = continuité) est confirmé en français.

## Beat par beat

**accroche** « Tu dors, sur la table d'opération. » tient. « Dans une machine, un fil touche le métal. » → **à retoucher** : « machine » est imprécis (un électricien dira « appareil »), et le défaut d'isolement est un fil qui touche une masse. Voir Corrections 1.

**promesse** « Chez toi, tout sauterait. » → **à retoucher** : un défaut phase-masse sur une installation TT ou TN fait déclencher la protection du circuit concerné (DDR 30 mA ou disjoncteur), pas « tout ». Voir 2. « Ici, rien ne coupe : exprès. » tient (au premier défaut ; la phrase suivante le dit). « Mais ça ne marche… qu'une fois. » tient (vulgarisation : l'installation tolère un premier défaut, pas deux).

**scene** « Chez toi, ce défaut ferait sauter le différentiel : le noir. » tient (« sauter » est familier mais courant sur chantier ; le DDR « déclenche »). « Ici, le noir, c'est un respirateur qui s'arrête. Une lampe qui s'éteint. Un chirurgien… qui ne voit plus rien. » tient comme enjeu de la continuité (UTC : respirateur et scialytique en « niveau 1 », aucune coupure admise). Simplification à noter : un respirateur a en général une batterie interne et la lampe une reprise sur source de sécurité ≤ 0,5 s.

**ouvre** tient (signature, inchangée).

**eclate** « Un transformateur d'isolement. » tient (CEI 61558-2-15, Socomec/Voltwork, B). « Deux bobines, qui ne se touchent pas. » → **à retoucher** : on dit « deux enroulements » (primaire, secondaire), séparés galvaniquement ; « ne se touchent pas » est correct pour un non-initié mais « bobines » fait tiquer. Voir 3. « D'un côté, le réseau. » tient. « De l'autre… un circuit que rien ne relie à la terre. » → **à préciser** : vrai pour les conducteurs actifs du secondaire ; les masses, elles, restent reliées à la terre (UTC : « les masses des appareils, elles, sont reliées à la terre » ; dossier de faits § 4, Wiring Matters 77, B). Un électricien commenterait « mais les masses sont à la terre ». Voir 4.

**repos** « Chez toi, le courant qui fuit repart par la terre : ton différentiel le voit. » tient (principe du DDR, TT/TN). « Ici, il n'a aucun chemin de retour : il ne passe presque rien. » → **à nuancer** : le chemin de retour existe, mais seulement par les capacités de fuite, très faibles (Wiring Matters 77, B : « depend only on the capacitive coupling »). « Aucun » est trop fort, « presque rien » rattrape. Voir 5. « Et un boîtier veille : le contrôleur permanent d'isolement. » tient (« boîtier » est acceptable pour le grand public ; le terme exact CPI est donné juste après).

**seuil** tient.

**zero** « Le fil touche la carcasse. » tient (carcasse = enveloppe métallique d'un appareil, mot de métier). « Premier défaut. » tient. « Le respirateur tourne. La lampe éclaire. » tient : GN7 710.411.6.3.1 (B) place en IT les circuits des appareils de maintien en vie et de chirurgie dans l'environnement patient ; en France le scialytique a souvent son circuit IT dédié (24 V, CPI 5–50 kΩ, Legrand, B) mais reste en IT médical. « Personne n'a rien vu. » tient (avant l'alarme, qui répond en ≤ 5 s). « Mais le circuit, lui… n'est plus isolé. » tient (isolé de la terre).

**reponse** « Le contrôleur l'a mesuré. Une alarme, dans la salle. Rien ne coupe. Le chirurgien continue. Le défaut sera cherché, puis réparé. Et toi… tu respires toujours. » tient : voyant et signal sonore dans le local par des reports d'état (Legrand : « signal sonore et visuel dans le local concerné », B ; Bender 107TD47, A), défaut localisé et éliminé ensuite (Socomec/guides, B).

**chute** « Voilà son secret : au bloc, la sécurité, ce n'est pas de couper. C'est de tenir… et de prévenir. » tient sur le fond (« a total loss of supply in Group 2 locations shall be prevented », GN7 710.512.1.2, B ; Guidelec : « permet en cas de premier défaut d'éviter toute coupure », B). Légèrement absolu puisque le second défaut coupe : correction facultative 6. « Parce qu'ici, la panne est plus dangereuse que le défaut. » tient.

**comment** « Qu'une fois ? Oui : au deuxième défaut, là, ça coupe. » tient avec une nuance à porter dans `sources` : le second défaut ne coupe que s'il fait boucle (sur l'autre conducteur actif, masses reliées entre elles) ; les protections de surintensité déclenchent alors comme sur un court-circuit (UTC : « courant de double défaut »). « D'où l'alarme : on répare avant. » tient. « Électriciens, dites-nous ce qu'on a simplifié. » tient.

**like**, **abo**, **boucle** : hors sujet technique, tiennent.

## Corrections proposées

1. **accroche** — « Dans une machine, un fil touche le métal. » → « Dans un appareil, un fil touche le métal. » (vocabulaire ; même longueur.)
2. **promesse** — « Chez toi, tout sauterait. » → « Chez toi, ça couperait. » (seul le circuit en défaut déclenche ; Guidelec/UTC, B.)
3. **eclate** — « Deux bobines, qui ne se touchent pas. » → « Deux enroulements, qui ne se touchent pas. » (vocabulaire de métier ; ou « Deux enroulements, sans aucun lien. »)
4. **eclate** — « De l'autre… un circuit que rien ne relie à la terre. » → « De l'autre… un circuit dont aucun fil n'est relié à la terre. » (précise « conducteurs actifs » ; les masses restent à la terre, UTC B, GN7 B). À défaut, garder la phrase et écrire la nuance dans `sources` (déjà fait).
5. **repos** — « Ici, il n'a aucun chemin de retour : il ne passe presque rien. » → « Ici, le chemin de retour est minuscule : il ne passe presque rien. » (capacités de fuite seules, Wiring Matters 77, B ; « aucun » est faux strictement.)
6. *(facultative)* **chute** — « au bloc, la sécurité, ce n'est pas de couper. » → « au bloc, la sécurité, c'est d'abord de ne pas couper. » (le second défaut coupe ; la phrase suivante « tenir… et prévenir » reste.)

À ne pas modifier : « Alors… on l'ouvre. »

## Ce que les sources françaises confirment

- **Principe** : schéma IT médical en groupe 2 (blocs, soins intensifs), « permet en cas de premier défaut d'éviter toute coupure » (Guidelec, B ; https://guidelec.com/electricite/nfc-15-211-ce-que-dit-la-norme-pour-les-locaux-medicaux/). Socomec France et Voltwork : premier défaut sans coupure, second défaut coupure (B).
- **NF C 15-211** : sommaire de l'édition d'août 2006 avec « Schéma IT médical » (5.3) et « Contrôle de l'isolement des installations alimentées en schéma IT médical » (11.3) (AFNOR, fiche lue, B ; https://www.boutique.afnor.org/en-gb/standard/nf-c15211/lowvoltage-electrical-installations-installations-in-medically-used-rooms/fa144685/27745). Le texte lui-même reste payant, non lu.
- **Transformateur d'isolement** CEI 61558-2-15 ; **CPI** CEI 61557-8 ; localisateurs CEI 61557-9 (Socomec, Legrand, B).
- **50 kΩ** : non confirmé comme valeur de norme en français. Legrand : « Paramétrage d'isolement : 50kΩ à 500kΩ » (plage réglable, fabricant, B) ; variante 5–50 kΩ pour circuits de scialytique (Legrand 24 V). Voltwork cite 150 kΩ comme réglage pratique. Le script ne dit pas « 50 kΩ » : rien à corriger.
- **0,5 s / 15 s** : Socomec (classe ≤ 0,5 s, ≤ 15 s, > 15 s, B) et Guidelec (« inférieur à 0,5 s pour les systèmes critiques », C/B). **3 heures** : non trouvé en français (reste GN7, B). Le script ne les dit pas.
- **Groupe 2** : blocs opératoires et soins intensifs (Guidelec, Socomec).
- **Masses reliées à la terre, neutre isolé** : UTC, master qualité 2007-2008 (B ; https://www.utc.fr/master-qualite/public/publications/qualite_et_biomedical/UTC/master_mts/2007-2008/projets/secu_elec_bloc_op/). Le même document place respirateur et scialytique en « niveau 1 » (aucune coupure admise). Son « de l'ordre de 70 mA » pour un premier défaut est une valeur d'IT générique, pas médicale : ne pas la reprendre.
- Circulaire DHOS/E4 n° 2005-256 du 30 mai 2005 (A, lue) : les sources de remplacement respectent la NF C 15-211 ; 48 h de combustible. Elle ne parle pas d'IT médical.

## Ce que `sources` devrait préciser

- Le second défaut ne coupe que s'il fait boucle entre les deux conducteurs actifs (masses interconnectées) ; sinon rien ne se passe, le CPI alarme toujours.
- « Respirateur qui s'arrête » et « lampe qui s'éteint » : scénario d'enjeu ; ces appareils ont en pratique batterie interne ou reprise ≤ 0,5 s.
- Les valeurs chiffrées (50 kΩ, 0,5 s, 15 s) viennent de sources britanniques et de fabricants, confirmées en plage par Legrand et Socomec ; la NF C 15-211 n'a pas été lue (déjà dit).

## Requêtes utilisées (13 sur 15)

1. Recherche : schéma IT médical NF C 15-211 transformateur CPI 50 kΩ groupe 2
2. Recherche : IT médical bloc cours régime de neutre masses à la terre premier/deuxième défaut
3. Recherche : Schneider Vigilohm IT médical NF C 15-211
4. Page : Legrand CPI 230 V 50–500 kΩ
5. Page : vialis régime de neutre (PDF illisible)
6. Recherche : IT médical 0,5 s 15 s alimentation de sécurité scialytique
7. Page : circulaire DHOS/E4 2005-256 (AP-HP)
8. Page : Socomec (403)
9. Recherche (étendue) : IT médical transformateur secondaire non relié à la terre, guides FR
10. Recherche : Bender France IT médical premier défaut
11. Page : Guidelec NF C 15-211
12. Page : electrical-installation.org Schéma IT (403)
13. Page : UTC « Sécurité électrique au bloc opératoire »

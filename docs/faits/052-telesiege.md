# 052 — Le télésiège débrayable : ton siège lâche le câble à chaque gare, puis le rattrape

Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur seulement.

## Verdict sur l'angle

**À ajuster, il tient.** Le retournement (le siège lâche le câble à chaque gare) est vrai et sourcé. Deux chiffres de la consigne sont faux : le câble ne file **pas** « à la vitesse d'une voiture en ville » (≈ 18 à 22 km/h, soit 5 à 6 m/s), et le siège n'arrive **pas** à 0,2–0,5 m/s en gare (≈ 1 m/s, plafond réglementaire 1,3 m/s pour des skieurs ; 0,5 m/s ne vaut que pour les cabines fermées).
**Spectacle** : passe à moitié. La pince qui s'ouvre sur la came, le siège qui quitte le câble et glisse seul sur les pneus se lit sans le son, mais ce n'est pas un événement « énorme » tout seul. **Histoire** : passe si on prend l'enjeu réel : un siège dont la pince serre mal glisse en arrière et percute le suivant (Pontresina 2012, deux blessés, siège n° 37 contre n° 38). Angle qui passe les deux : le siège lâche le câble, puis la menace est la reprise du câble ; la fin montre la machine qui refuse de laisser partir une pince qui serre mal.
« Vu et revu » : je n'ai pas cherché sur les réseaux. Des pages pédagogiques en français expliquent le débrayable (remontees-mecaniques.net) ; le retournement « il lâche le câble » reste peu connu du grand public [O, non mesuré].

## La scène

- **Cas réel daté [P]** : mardi 18 septembre 2012, télésiège Pontresina – Alp Languard (Suisse). Pendant la montée, le siège n° 37, deux personnes à bord, a glissé vers le bas sur le câble tracteur et heurté le siège n° 38 (deux passagers). Les deux occupants du n° 38 ont été blessés au choc ; ceux du n° 37 sont sortis indemnes. Cause : la pince n'avait pas été fixée conformément aux instructions d'utilisation ; la force de résistance au glissement avait été mesurée avec un appareil non conçu pour cette pince. (SESE, recommandation de sécurité n° 53, rapport final 12091803.)
- **Second cas [P]** : 25 août 2018, Sun Peaks (Colombie-Britannique), télésiège détachable. Une pince n'a pas serré le câble, le siège a reculé sur une pente raide, heurté le siège suivant, deux sièges emmêlés, le télésiège ne s'est pas arrêté avant la gare d'arrivée. Aucun blessé. Cause probable : un élément de fixation oublié au remontage de la pince par un mécanicien souvent interrompu ; la vérification faite par le même mécanicien (Technical Safety BC, II-736022-2018).
- **Montrable** : l'entrée en gare à 5 m/s ; la came qui appuie sur le levier de la pince ; la pince qui s'ouvre ; le siège libre sur les pneus à ≈ 1 m/s ; la relance ; la pince qui se referme sur le câble ; le capteur de pesage. La chute de la pince sur la pente est une reconstitution (le rapport suisse ne donne pas de vitesse), la dire telle dans `sources`.

## Le système qui sauve

Une **attache découplable** (« pince ») par siège : elle tient le siège au câble en ligne, s'en sépare dans chaque gare pour qu'on monte à vitesse piétonne, puis se referme. Un **dispositif de contrôle de la force de serrage** (« pesage ») est obligatoire dans chaque station : il doit rendre matériellement impossible à un véhicule de quitter la gare si sa liaison au câble n'est pas assez robuste (STRMTG RM2 A5-5.1.11 [P]). Tous les télésièges et télécabines débrayables en ont un ; en France c'est l'arrêté du 7 août 2009 [P].

## Le mécanisme ouvert

Pièces (mots de pro) :
1. **Pince / attache découplable** : mors fixe, mors mobile, corps de pince, queue de pince (RM1 [P], liste des pièces de sécurité).
2. **Ressort de serrage** : à boudin chez Doppelmayr (« dead-center grip with coil spring »), à torsion sur les pinces DT (brochure D-Line [P]) ; la pince est conçue pour un câble jusqu'à 64 mm de diamètre, 100 % de pente, véhicule jusqu'à 1 800 kg (Doppelmayr D-Line [P] ; ce sont les capacités de ce modèle).
3. **Levier de pince + galets** : le galet roule sur la « rigole » ; le levier est poussé pour ouvrir le mors (remontees-mecaniques.net [S]).
4. **Came de débrayage** (rail) : « une poutre appelée came de débrayage va faire pression sur le levier de la pince pour ouvrir celle-ci » [S].
5. **Train de pneus** (lanceur / ralentisseur) : prennent le relais du câble pour entraîner le siège ; entraînés par le câble via des courroies ; l'accélération vient du rapport de diamètres des poulies [S].
6. **Rail de gare / voie de traînage** : le siège y roule libre, à ≈ 1 m/s [S].
7. **Capteur de pesage** : placé à la fin de la zone d'embrayage, là où la pince ne touche plus le câble ; la came se déforme au passage de la pince, un capteur inductif mesure la déformation, la force s'affiche en kg au poste [S, remontees-mecaniques.net tsd_7].
8. **Automate de sécurité** : arrêt immédiat si le signal est insuffisant [S].

Ordre des événements (à la gare) [S sauf mention] : entrée à vitesse du câble (≈ 5 m/s) → la came ouvre la pince → le siège quitte le câble → les pneus le ralentissent à ≈ 1 m/s → promenade en gare, on monte → les pneus le relancent jusqu'à la vitesse du câble → la pince se referme sur le câble → le pesage mesure la serrage → bon : le siège part en ligne ; insuffisant : arrêt de l'installation, véhicule isolé pour contrôle. Le câble, lui, ne s'arrête jamais et ne ralentit pas.

Seuils et chiffres :
- **Sécurité au glissement 2**, coefficient d'adhérence pris égal à celui mesuré aux essais de qualification, **au maximum 0,18** : le dispositif doit vérifier que la force de serrage est au moins celle qui donne ce coefficient de sécurité dans la pente la plus forte (RM2 A5-5.1.11 [P]).
- **Vitesse en gare, plafonds français** : 1,3 m/s véhicules ouverts découplables avec skieurs ; 1,0 m/s piétons par l'avant ; 0,5 m/s véhicules fermés (RM2 A4-10 [P], art. 10 de l'arrêté du 7 août 2009).
- **Vitesse en ligne** : 6 m/s limite réglementaire, la plupart à 5 m/s pour le confort (remontees-mecaniques.net tsd_1 [S]) ; « entre 2,5 et 6 m/s selon les appareils, autour de 5 » (remontees-mecaniques.net, page « Le télésiège » [S]) ; D-Line Doppelmayr « jusqu'à 7 m/s » (page catalogue, toutes versions confondues [P]).
- Valeur de pesage lue : **523 kg** sur une pince de TSD6 Poma (page tsd_7 [S, une valeur isolée]). Un forum donne une alarme à 185 kg sur un TSD4 avec la plupart des pinces entre 220 et 260 kg [O, forum, non officiel, dépend du modèle]. Ne pas dire un seuil unique.

**Pourquoi ça marche (beat `principe`)** : le câble avance toujours à 5 m/s, mais le siège n'y est attaché que sur la ligne : en gare la pince s'ouvre, le siège roule libre à ≈ 1 m/s, cinq fois plus lentement que le câble, puis revient à la vitesse du câble avant de se refermer. Ordre de grandeur : 18 km/h en ligne, ≈ 3,6 km/h en gare (5 m/s ↔ 1 m/s) [S, calcul].

## Chiffres

| Chiffre | Source | Niveau |
| --- | --- | --- |
| Ligne : 5 m/s (18 km/h), plafond 6 m/s | remontees-mecaniques.net tsd_1 ; fr.wikipedia « Télésiège » (18 km/h) | S |
| Gare : ≈ 1 m/s | remontees-mecaniques.net « Le télésiège » ; tsd_3 ; fr.wikipedia | S |
| Plafond gare : 1,3 m/s skieurs, 1,0 piétons, 0,5 fermé | STRMTG RM2 v3 A4-10 | P |
| Sécurité de 2 au glissement, μ ≤ 0,18 | STRMTG RM2 v3 A5-5.1.11 | P |
| Inspection pluriannuelle des attaches découplables : 5 ans au plus ; 12 500 h au plus entre deux contrôles d'une même attache | STRMTG RM1 v5 D.3 (art. 46 arrêté 7/8/2009) | P |
| Débit : 6 places jusqu'à 3 200 pers./h (appareils de 2010) ; 8 places 4 800 théorique | fr.wikipedia « Télésiège » | S |
| Câble jusqu'à 64 mm, véhicule jusqu'à 1 800 kg (pince D3000/D5000) | Doppelmayr D-Line | P |
| Pontresina : 2 blessés, sièges 37 et 38, 18/09/2012 | SESE rec. n° 53 | P |
| Sun Peaks : 25/08/2018, 0 blessé | Technical Safety BC | P |

## Ce qui retourne une idée reçue (chute)

1. « Ton siège ne reste pas accroché au câble. Il le lâche à chaque gare, puis le rattrape. » [P/S]
2. « Ce n'est pas la pince qui te sauve parce qu'elle serre fort. C'est la machine qui refuse de te laisser partir si elle serre mal. » (RM2 : « matériellement impossible » de quitter la station.) [P]
3. « Ce qui est lent, c'est toi qui montes ; le câble, lui, ne ralentit jamais. » [S]

## La question du commentaire

1. « Au sommet, ton siège tient le câble… ou il le lâche ? » (réponse : il le lâche ; lisible chez soi à la prochaine gare.)
2. « Une pince serre mal : le télésiège s'arrête… ou il te laisse partir ? » (réponse : il s'arrête ; la mauvaise réponse fait peur.)
3. « À l'embarquement, ton siège est à l'arrêt… ou il avance ? » (réponse : il avance, ≈ 1 m/s.)

## L'histoire du système

- **1945** : Von Roll met au point la pince débrayable VR101 ; Flims (Suisse), « premier télésiège biplace du monde » à attaches débrayables [S, fr.wikipedia ; remontees-mecaniques.net « Le télésiège » donne aussi 1945, Suisse]. En.wikipedia cite plutôt White Lady, Cairngorm (Écosse), 1961 [S, contradictoire] : dire « dès 1945 » avec prudence ou rester sur « les années 1940 à 1960 ».
- **1973** : Poma construit en France les premiers triplaces débrayables du monde [S, fr.wikipedia]. Les débrayables modernes « datent de la fin des années 70 début des années 80 » ; ≈ 5 m/s depuis 1982 [S, tsd_1].
- **1981** : Doppelmayr, Breckenridge (Colorado), premier quadriplace débrayable rapide [S, en.wikipedia]. **1991** : premier six places (Mont Orignal, Doppelmayr) ; **1993** : Avoriaz, premier six places d'Europe (Poma) [S].

## Pour l'annonce

- **Phrase (après « Abonne-toi : »)** : « Prochain dossier : à chaque gare, ton siège lâche le câble, puis le rattrape en pleine course. » (16 mots)
- **Un seul fait sûr (fin du 051)** : « Un télésiège débrayable lâche le câble à chaque gare. »

## À ne pas dire

- « Vitesse d'une voiture en ville » : faux, 5 m/s = 18 km/h, un cycliste, pas une voiture. Dire « un vélo lancé » ou « 18 kilomètres-heure ».
- « 0,2 à 0,5 m/s en gare » : faux pour un siège (≈ 1 m/s ; 0,5 m/s est le plafond des cabines fermées). Le 0,3 m/s vient d'une page sur les télécabines.
- « Les pinces sont déplacées sur le câble » : la règle de déplacement (art. 56-1) vise les **attaches fixes** ; je n'ai rien lu qui l'impose aux débrayables. Ne pas l'affirmer.
- Un seuil de serrage unique (« 185 kg », « 523 kg ») : dépend du modèle ; forum ou valeur isolée.
- « Poma 1966 » : c'est la télécabine débrayable SP4, pas un télésiège (forum). Ne pas dater le télésiège par là.
- « Premier débrayable en 1961 » : source contradictoire ; 1945 (Flims) est mieux sourcé mais en wiki.
- Ne pas attribuer le Pontresina à « un défaut de fabrication » : le rapport dit pince non fixée selon les instructions et mesure de glissement avec un appareil inadapté.
- Heavenly (déc. 2024), Attitash (2025), Breckenridge (2022, vent) : aucune conclusion officielle lue ; ne pas s'en servir.
- Le « test de non-glissement annuel » : lu dans RM1 seulement pour les attaches découplables **non marquées CE** (à genouillère ou crémaillère) ; ne pas généraliser à toutes les pinces.

## Ce que la voix peut dire

1. Le câble ne s'arrête jamais. Il file à cinq mètres par seconde.
2. Cinq mètres par seconde, c'est dix-huit kilomètres-heure.
3. En gare, ton siège avance à un mètre par seconde.
4. La pince s'ouvre sur une came. Le siège lâche le câble.
5. Des pneus prennent le relais du câble.
6. Ils relancent le siège à la vitesse du câble.
7. Puis la pince se referme.
8. À chaque passage, un capteur pèse son serrage.
9. Serrage insuffisant : l'installation s'arrête.
10. La règle impose une marge de deux au glissement.

## Sources

- **SESE (Suisse), recommandation de sécurité n° 53, 11/06/2015, rapport final 12091803** — https://www.sust.admin.ch/fr/recommandations-de-securite/rail-et-navigation/bs_se_53.pdf [P, lu] : Pontresina 2012, sièges 37/38, cause, recommandation ; rapport final allemand non lu.
- **Technical Safety BC, II-736022-2018** — https://www.technicalsafetybc.ca/regulatory-resources/incident-investigations/unsecured-grip-causes-chairlift-slide-backwards-incline [P, lu] : Sun Peaks.
- **STRMTG, Guide RM2 v3 (12/07/2023)** — https://www.gart.org/wp-content/uploads/2023/07/Guide-RM2_v3.pdf [P, lu, extrait texte] : A4-10 vitesses en gare ; A5-5.1.11 sécurité 2, μ ≤ 0,18.
- **STRMTG, Guide RM1 v5 (12/07/2023)** — https://www.gart.org/wp-content/uploads/2023/07/Guide-RM1_v5.pdf [P, lu, extrait texte] : contrôle quotidien du pesage, chaque pince au moins une fois dans le pesage avant ouverture ; inspection annuelle du dispositif de contrôle de serrage ; non-glissement ; 5 ans et 12 500 h ; déplacement des attaches fixes. L'URL strmtg.developpement-durable.gouv.fr (Partie K) : non lue, erreur 403.
- **Doppelmayr, brochure D-Line** — http://www.doppelmayr.com/wp-content/uploads/2022/11/D-Line_EN.pdf [P, lu partiellement] : ressorts, 64 mm, 1 800 kg, jusqu'à 7 m/s. Aucune force de serrage chiffrée.
- remontees-mecaniques.net, pages tsd_1, tsd_3, tsd_7, « Le télésiège » — [S, lues] : vitesses, came, pneus, pesage, 523 kg, 1945. Forum « Pesage de la pince ? » : non lu, erreur 403 (seuils de forum repris du résumé de recherche, [O]).
- fr.wikipedia « Télésiège » [S, lu à 100 000 caractères sur ≈ 107 000] ; en.wikipedia « Detachable chairlift » [S, lu] : jalons 1945, 1973, 1981, 1991, 1993 ; contrôle de serrage Doppelmayr / Poma.
- Non lus : Poma, Leitner (aucune fiche constructeur chiffrée trouvée sur la force de serrage) ; textes de loi sur Légifrance ; rapport final allemand de Pontresina.

Requêtes utilisées : ≈ 29 sur 30.

# L07 — La fibre optique : on suit le fil de verre, de la poudre de silice au câble sous l'océan

Niveaux : **[P]** source primaire lue · **[S]** source secondaire · **[O]** ordre de grandeur seulement · **[calcul]** déduit de chiffres sourcés.
Requêtes utilisées : 44 sur 45. Beaucoup de pages de fabricants (Corning, Nextrom, OFS) et le Nobel ont répondu « 403 » : voir « Non lu » en fin de fichier.

## Verdict sur l'angle

**À ajuster, mais il tient.** Originalité : le sujet n'est pas vierge, mais je n'ai trouvé **aucune explication française en 3D de la fabrication de bout en bout**, avec un menace par étape. Ce qui existe en français (titres vus via la recherche, **vues et durées non lisibles**, YouTube est resté fermé aux outils) : des visites d'usine (Rosace chez un grand producteur en Corée du Sud, ≈ 7 ans ; « Visite d'une entreprise de fabrication de fibres optiques », ≈ 2 ans ; « Comment la fibre optique est-elle fabriquée ? » avec la Cité des télécoms de Pleumeur-Bodou, ≈ 8 ans), des reprises d'un reportage Discovery Channel (« Comment c'est fait », ≈ 14-15 ans), des cours sur la réflexion totale et la chaîne Veritation citée pour la fibre. En anglais : « How It's Made » (segment fibre dans l'épisode « Honey ; Fiber Optics ; Bricks ; Pipe Organs », 2002) et des vidéos de fabricants. **Sujet donc « vu » en visite d'usine et en principe physique, peu en récit-chaîne avec 3D et chiffres. Verdict d'originalité : moyen, pas « vu et revu » côté angle ; à vérifier par Merwan sur YouTube (vues) avant de lancer.**
**Angle qui passe les deux tests** : fabriquer la fibre est le bon corps de film, mais le titre doit porter autre chose que « comment c'est fait » : *le verre le plus transparent jamais fait* (avant 1970, le verre éteignait la lumière en quelques mètres, aujourd'hui en dizaines de kilomètres) ou *le fil qui tombe à 16 m/s*.
- **Spectacle** : la tour de fibrage. Le bout de la préforme, ~1 900 à 2 000 °C, incandescent ; un fil invisible plus fin qu'un cheveu en tombe à 10-20 m/s (≈ 1 km par minute). Lisible sans le son en une seconde : une barre de verre qui rougeoie et un fil qui file. À défaut, le « fiber fuse » (une fibre qui brûle à 1-3 m/s) est le plus visuel, voir plus bas.
- **Histoire** : verre « à 1 000 dB/km » (la lumière divisée par deux en 3 m) → Kao dit « ce sont des impuretés, pas la physique » (1966) → Corning y arrive en août 1970. Raison d'envoyer le film : « ton Internet passe par un fil de verre fabriqué comme ça ».

## 1. Chaîne de fabrication, dans l'ordre réel (pour les chapitres)

| # | Étape | Ce qu'on voit | Menace propre à l'étape |
|---|---|---|---|
| 1 | **Matières premières** : tétrachlorure de silicium (SiCl4) et de germanium (GeCl4), liquides ultra-purs | cuves, vapeurs, gaz | une trace de fer ou de cuivre, ou d'eau (OH), absorbe la lumière : le signal s'éteint |
| 2 | **Préforme (dépôt)** : OVD, MCVD, VAD ou PCVD | tube de silice tournant sur un tour, chalumeau mobile (MCVD) ; ou « suie » blanche qui s'accumule sur une tige (OVD) | un profil d'indice faux ou une inclusion : le cœur ne guide plus |
| 3 | **Séchage et frittage (consolidation)** : la suie poreuse devient verre | four, chlore, 950-1 250 °C pour le séchage | eau résiduelle (OH), bulles : pics d'absorption |
| 4 | **Tour de fibrage** : le bout de la préforme fond, la fibre est tirée | four ≈ 1 900-2 000 °C, jauge laser, fibre qui file | diamètre qui dérive (tolérance 1 µm sur 125 µm), rupture |
| 5 | **Revêtement polymère double + UV** | applicateur, lampes UV, fibre devenue orange/transparente | bulle, revêtement excentré, humidité qui fragilise la silice |
| 6 | **Épreuve de traction (« proof test »)** | cabestans qui tirent la fibre en continu | une microfissure : elle casse sous charge, on la rejette en usine plutôt que chez toi |
| 7 | **Bobinage et mesures** | bobines, OTDR, atténuation, diamètre de champ de mode | un point défectueux caché sur des kilomètres |
| 8 | **Mise en câble** : fibres colorées, tubes, gel, renfort ; câble FTTH | brins colorés dans des tubes | écrasement, courbure serrée (les fibres « G.657 » tolèrent un rayon de 7,5 mm) |
| 9 | **Câble sous-marin** : tube inox, cuivre, polyéthylène, armure | usine de Calais, navires câbliers | ancre, chalut, eau : la fibre est protégée par des couches |

Procédés (préforme) : **MCVD** (dépôt à l'intérieur d'un tube de silice, chalumeau mobile ; « le plus répandu » selon la page française de Wikipedia **[S]**, non confirmé par fabricant), **OVD** (dépôt de suie à l'extérieur d'une tige ; c'est la voie de Corning, que Corning décrit dans sa page « Manufacturing Excellence », **non lue : 403**, relevée par un moteur de recherche **[S]**), **VAD** (Sumitomo/NTT historiquement, **non confirmé à la source**), **PCVD / plasma** (Prysmian, « proprietary plasma vapour deposition technologies » sur son site de Douvrin **[P]**, procédé exact non nommé). **Ne pas dire lequel est « le plus courant » sans source.** Le beat « principe » ne dépend pas de ce choix : montrer l'OVD (suie, spectaculaire, beau) et dire « il y a plusieurs façons de construire la préforme ».

Pour chaque étape, « pourquoi ça marche » :
- **Cœur et gaine / réflexion totale** : le cœur (silice dopée au germanium, indice ≈ 1,4475) est un peu plus « lent » que la gaine (silice pure, ≈ 1,444 à 1 500 nm) ; la différence est **inférieure à 1 %**, la lumière qui frappe la frontière sous un angle rasant reste enfermée. Aucun miroir. **[S, Wikipedia « Optical fiber »]**
- **Pureté** : avant 1965 le verre faisait environ 1 000 dB/km, la lumière divisée par 2 en ≈ 3 m ; Kao et Hockham ont affirmé que 20 dB/km était atteignable car la perte venait d'impuretés **[S, Nature Photonics / Hecht]**. Cible actuelle : métaux de transition (cuivre, fer) sous 1 ppb, eau résiduelle sous 0,3 ppm **[S, brevets cités par la recherche, non ouverts]**.
- **Fibrage** : c'est la tension et la vitesse qui fixent le diamètre ; la jauge laser lit le diamètre plus de 750 fois par seconde et corrige la vitesse (plus gros → on tire plus vite) **[P, foa.org]**.
- **Proof test** : on sacrifie la fibre faible pour livrer la forte : niveau courant 0,7 GPa (100 kpsi) **[S, Corning WP8002 relevé par recherche, non ouvert : 403 ; Sterlite]**.

## 2. Test et climax (acte 3)

- **Climax A, l'épreuve de traction** : cabestans, fibre tendue à 0,7 GPa. Sur un cladding de 125 µm, cela fait **≈ 8,6 N (≈ 0,9 kg-force) [calcul]**. Une microfissure = la fibre claque, la ligne s'arrête, on rattache. Menace : « et si elle avait cassé chez toi, dans la gaine du immeuble ? ».
- **Climax B, la mesure** : OTDR (on envoie une impulsion et on lit l'écho ; un défaut apparaît comme une marche) ; atténuation de la fibre finie ≈ 0,2 dB/km (G.652.D : 0,22 maxi à 1 550 nm sur fiches Prysmian **[S]** ; Corning SMF-28 ULL : 0,17 dB/km maxi **[S, recherche, fiche non ouverte]**). Le record de laboratoire est ≈ 0,14 dB/km (Wikipedia, silice, 1 560 nm) **[S]**.
- **Climax C, le « fiber fuse »** (visuel, hors usine) : au-dessus de **2 MW/cm²** une fibre peut « brûler » vers l'émetteur à **1-3 m/s** **[S, Wikipedia]**. À présenter comme un incident, pas comme le test d'usine.
- **Recommandation** : A pour le chapitre « fabrication », B pour la conclusion de l'objet fini, C en bonus si Merwan veut un moment « incident ».

## 3. Le système qui sauve (l'objet fini)

La « fibre » monomode standard : cœur ≈ 8-9 µm, gaine optique 125 µm, double revêtement ≈ 245-250 µm ; l'ensemble est « de la taille d'un cheveu » **[S]**. Elle est dans la prise de chaque foyer fibré : fin 2025, **27,1 millions d'abonnements fibre, 82 % des abonnements fixes ; 42,4 millions de locaux raccordables, 94,3 % [P, Arcep, communiqué du 12/03/2026]**. Elle est aussi sur le fond des océans : **plus de 99 % du trafic international de données** passe par des câbles sous-marins **[P, UIT]** (la TeleGeography confirme dans sa « vérification » 2023, **non lue : 404**, relevé par recherche).

## 4. Le mécanisme ouvert, pièces (pour la vue éclatée)

1. **Cœur** de silice dopée germanium, ≈ 9 µm (monomode) ; 50 ou 62,5 µm en multimode **[P, foa.org]**.
2. **Gaine optique** de silice pure, 125 µm ±1 µm (±0,7 µm sur la plupart des fiches G.652.D) **[P / S]**.
3. **Revêtement interne** mou, **revêtement externe** dur, tous deux durcis aux UV ≈ 245-250 µm **[P, foa.org ; épaisseurs non données]**.
4. **Tube** (loose tube) rempli de gel, ou « ribbon » ; fibres colorées pour les repérer **[S]**.
5. **Renfort** (aramide / verre / acier) selon le câble **[O]**.
6. Pour le câble sous-marin : **tube inox** avec une douzaine de fibres, fils d'acier, **gaine de cuivre** qui alimente les répéteurs, **polyéthylène**, **bitume** ; double armure : **80 tonnes** à la rupture **[S, La Gazette France]**. Diamètre d'un câble moderne ≈ 25 mm **[S, Wikipedia]** ; répéteurs tous les **70 à 100 km** environ (les deux sources donnent « plus de 100 km » et « 70 à 100 km » : dire « une centaine de km »).
7. Ce qui déclenche : la lumière infrarouge d'un laser, **1 550 nm** (fenêtre de plus faible perte) **[S]**.

Ordre des événements : suie ou couches → verre pur → fusion en bout de préforme → fil → revêtement → test → câble. **Pourquoi ça marche, en une phrase** : « un cœur à peine plus lent que sa gaine garde la lumière prisonnière, et un verre assez pur la laisse passer des dizaines de kilomètres : à 0,2 dB/km, il en reste 1 % après 100 km » (calcul : 0,2 × 100 = 20 dB = 1 %) **[calcul, cohérent avec fr.wikipedia]**.

## 5. Chiffres

| Chiffre | Valeur | Source / niveau |
|---|---|---|
| Diamètre fibre nue | 125 µm, tolérance 1 µm | foa.org **[P]** |
| Diamètre cœur monomode | ≈ 9 µm (MFD 9,2 ±0,4 µm à 1 310 nm) | foa.org **[P]** ; fiches Prysmian **[S]** |
| Four | « approchant 1 900 °C » ; autre source 2 000 °C | foa.org **[P]** ; fr.wikipedia **[S]** |
| Vitesse de tirage | 10-20 m/s « courant » ; ≈ 1 km/min | foa.org **[P]** ; fr.wikipedia **[S]** |
| Jauge laser | > 750 mesures/s | foa.org **[P]** |
| Tour de fibrage | ≈ 15 m (fr.wikipedia) ; 38 m (un modèle commercial Nextrom, page non lue : 403, relevée par recherche) | **[S]** ; dire « une tour de plusieurs étages » **[O]** |
| Longueur par préforme | « plusieurs centaines de km » (fr.wikipedia) ; « jusqu'à 50 km » (article de revue ancien) : **contradictoire, ne pas chiffrer** | **[O]** |
| Revêtement à la vitesse de ≈ 100 km/h | | Wikipedia **[S]** |
| Proof test | 0,7 GPa (100 kpsi) | **[S]** |
| Rayon de courbure | ≈ 30 mm avant perte forte ; 7,5 mm en G.657 | Wikipedia **[S]** |
| Atténuation 1965 / 1970 / aujourd'hui | ≈ 1 000 dB/km ; 17 dB/km (carnet de Keck, août 1970) ; ≈ 0,15-0,2 dB/km | ETHW (IEEE milestone) **[P]** ; Wikipedia **[S]** |
| Vitesse de la lumière dans la fibre | ≈ 200 000 km/s, soit 2/3 de c | Wikipedia **[S]** |
| Sydney - New York (16 000 km) | ≈ 80 ms minimum | Wikipedia **[S]** |
| Fibre posée dans le monde | « plus de 1,6 milliard de km » en 2011 (IEEE) ; **chiffre actuel : non trouvé** | ETHW **[S]**, à ne pas actualiser |
| Câbles sous-marins | > 500 systèmes ; 1,4 million de km (GCR 2025) **ou** 1,7 million (communiqué UIT 2026) : **incohérent**, dire « plus d'un million de km » | UIT **[S]** |
| Pannes de câbles | 150 à 200 par an (UIT) ; « plus de 200 » (communiqué de Porto) | UIT **[S]** |
| Câbles sous-marins posés par an | ≈ 45 000 km (article de presse, ancien) ; 200 000 km en 2024 (UIT) : **contradictoires**, ne pas dire | **[O]** |
| Part du trafic transocéanique par câble | « 99 % » | UIT **[P]** |
| France | 27,1 M abonnements fibre ; 42,4 M locaux ; 94,3 % de couverture | Arcep **[P]** |
| Usine de Douvrin (Prysmian) | « 25 millions de km de préformes par an » (2015) : **chiffre de 2016, historique** ; 155 000 m² | **[S]** |

## 6. Ce qui retourne une idée reçue (candidates de chute)

1. **« La lumière rebondit sur des miroirs. »** Non : il n'y a aucun miroir. Un cœur un peu plus « lent » que sa gaine (moins de 1 % d'écart d'indice) suffit **[S]**. Chute : « Tu ne vois pas un fil qui reflète la lumière. Tu vois un verre si pur qu'il la laisse passer, et si peu différent de sa gaine qu'il la garde. »
2. **« Internet, c'est le satellite et le Wi-Fi. »** Plus de 99 % du trafic international passe par un câble au fond de la mer, large comme un tuyau (≈ 25 mm) **[P, UIT ; S]**.
3. **« Le verre, ça se casse. »** Une fibre tient 0,7 GPa ; testée sur toute sa longueur en usine (≈ 8,6 N pour 125 µm) **[S + calcul]**. La menace est la *microfissure*, pas le verre.
4. **« Le verre est transparent comme une vitre. »** Avant 1970, le verre éteignait la lumière en quelques mètres ; la fibre moderne garde 1 % à 100 km **[S]**.

## 7. La question du commentaire (fermée, à deux camps, un mot)

- « Le câble qui entre chez toi : **fibre ou cuivre** ? » (le spectateur peut regarder sa prise ; 18 % des abonnés fixes ne sont pas en fibre, Arcep **[P]**)
- « Tes vidéos arrivent d'Amérique par **satellite ou par câble** ? » (réponse : câble, 99 % ; une réponse « satellite » est le signal qu'il faut le film)
- « Ta box est branchée en **fibre jusqu'à chez toi, ou jusqu'en bas de l'immeuble** ? » (FTTH vs FTTB : lecture possible sur le boîtier, à vérifier avec un électricien/technicien)

## 8. L'histoire du système

- **1966** : Charles Kao et George Hockham (Standard Telecommunication Laboratories, Harlow, Royaume-Uni) publient dans Proc. IEE 113(7), pp. 1151-1158 : une fibre diélectrique peut servir de support de communication si les pertes tombent à ≈ 20 dB/km ; la perte est due à des impuretés **[S ; non lu]**. Wikipédia anglais date la proposition de **1965** (présentée à l'IEE en janvier 1966) : dire « 1966 » en citant la publication. **Kao a le prix Nobel 2009** ; Hockham ne l'a pas **[S]**.
- **Août 1970** : Robert Maurer, Peter Schultz, Donald Keck (Corning) mesurent **17 dB/km** (le carnet de Keck) ; on dit « moins de 20 ». Fibre monomode à cœur de 0,75 µm, gaine de 100 µm, cœur dopé au titane (puis germanium, 4 dB/km en 1972) **[P, ETHW + article de Keck, Lightwave 2000]**. En 1970, la méthode était un dépôt *à l'intérieur* d'un tube (technique de Frank Hyde), **pas l'OVD** : ne pas dire « l'OVD de 1970 » **[P, Keck]**.
- **1982-1983** : premières grosses commandes commerciales, MCI **[P, Keck]**. **1988** : TAT-8, premier câble téléphonique à fibre transatlantique : deux paires + une de secours **[S]**.

## 9. Pour l'annonce

Long : la fin n'annonce pas le sujet suivant. Proposition de rendez-vous (sans sujet ni date), dite après « Abonne-toi : » : **« Abonne-toi : on continue d'ouvrir ce que tu ne vois jamais, et ce qui te garde en vie. »** (15 mots).
Un seul fait sûr pour la fin du film précédent (si un court annonce ce long) : « La fibre qui entre chez toi est un verre plus fin qu'un cheveu. » **[S]**.

## 10. À ne pas dire

- Pas de **« 1 milliard de km »** installés : seule source = IEEE 2011, **1,6 milliard** ; aucun chiffre actuel vérifié. Ne rien chiffrer, ou dire « des milliards de kilomètres » **[O]**.
- Pas de « 20 dB/km en 1966 » comme *résultat* : c'était une *prédiction* ; le résultat (Corning) est de 1970, **17 dB/km**.
- Pas de « Kao a fabriqué la fibre » : il a montré que c'était possible ; Corning l'a faite.
- Pas de « OVD est le plus courant », ni de « Corning utilise MCVD » : non vérifié.
- Pas de longueur par préforme (50 km ? centaines de km ?) ni de hauteur de tour (15 m ? 38 m ?).
- Pas de « 65 000 fois plus d'information que le cuivre » (fr.wikipedia ; non confirmé par la recherche).
- Pas de « une fibre de la taille d'un cheveu » pour le **cœur** : le cœur (9 µm) est bien plus fin ; c'est la fibre avec son revêtement (250 µm) qui ressemble à un cheveu.
- Pas de chiffres de câbles posés par an ni de 1,4/1,7 million de km sans choisir « plus d'un million ».
- Pas de « transparence = vitre » en chiffres : « le verre à 1 000 dB/km » est la vitrerie optique de 1965, pas une vitre de maison.
- Pas de « la lumière va à 300 000 km/s dans la fibre » : ≈ 200 000.

## 11. Ce que la voix peut dire (phrases courtes, vraies telles quelles)

1. Une fibre optique est un fil de verre de cent vingt-cinq microns.
2. Le cœur qui guide la lumière fait neuf microns, à peine.
3. Un four à presque deux mille degrés fait fondre le bout de la préforme.
4. Le fil en tombe à dix, vingt mètres par seconde.
5. Un laser mesure son diamètre plus de sept cent cinquante fois par seconde.
6. La tolérance sur le diamètre : un micron.
7. En 1970, Corning mesure dix-sept décibels par kilomètre.
8. Avant, la lumière s'éteignait en quelques mètres de verre.
9. Plus de quatre-vingt-dix-neuf pour cent du trafic international passe par un câble au fond de la mer.
10. En France, plus de vingt-sept millions d'abonnements sont déjà en fibre.

(Calcul : phrase 6, 125 µm ±1 µm ; phrase 7 : « dix-sept » selon le carnet de Keck ; si on veut rester prudent, « moins de vingt ».)

## 12. Éléments de long (recette-long)

**Trois fils candidats** : (a) « Combien de kilomètres de verre sort d'une seule barre ? » (ouvert tôt, payé à la tour de fibrage, **réponse seulement si une source est trouvée** : sinon, « des centaines ») ; (b) « Qu'est-ce qui casse une fibre ? » (la microfissure, payé à l'épreuve de traction) ; (c) « Pourquoi le verre le plus pur du monde n'est-il pas dans une vitre ? » (payé à la pureté 1 ppb / 1970).

**Pièces du dossier** (vérifiées une par une) :
- **Brevet US 3 659 915** « Fused silica optical waveguide » (Maurer et Schultz, Corning, 2 mai 1972) : un brevet américain est une pièce publique, **non ouvert ni vérifié ici** : à vérifier sur Google Patents avant de le montrer.
- **Publication de Kao et Hockham (Proc. IEE 113(7), 1966)** : droits IET, ne pas l'afficher, citer seulement ; **non lue**.
- **Carnet de Keck (août 1970)** : photo de page de l'ETHW, **licence non vérifiée**.
- **Photos de tours de fibrage** : OFS (foa.org) crédite ses photos ; **non domaine public** ; Wikimedia Commons non ouvert (à vérifier fichier par fichier).
- **Cartes de câbles** (TeleGeography) : droits réservés, non utilisables.

## 13. Sources, et ce que j'y ai lu

- **foa.org/tech/fibr-mfg.htm** : [P, lu] 125 µm ±1 µm, cœur 9 µm, four ≈ 1 900 °C, 10-20 m/s, jauge laser > 750/s, revêtement double UV, OTDR ; pas de hauteur de tour ni de valeurs numériques de proof test.
- **fr.wikipedia.org/wiki/Fibre_optique** [S, lu jusqu'à 100 000 car.] : tour ≈ 15 m, 2 000 °C, 1 km/min, histoire, tableau d'atténuation, usines Acome/Prysmian.
- **en.wikipedia.org/wiki/Optical_fiber** [S, lu partiellement] : indices, 200 000 km/s, record 0,14 dB/km, G.657, fiber fuse, 100 km/h.
- **en.wikipedia.org/wiki/Submarine_communications_cable** [S] : ≈ 25 mm, 99 %, répéteurs, TAT-8.
- **ethw.org Milestone 1970** [P] : 17 dB/km, 20 dB/km cible, 1 000 dB/km, trois chercheurs, 1,6 milliard de km en 2011.
- **lightwaveonline.com, « Optical fiber spans 30 years »** [P, article de Keck] : méthode 1970, 1982-1983, 300 millions de km à 30 ans.
- **arcep.fr, communiqué du 12/03/2026** [P] : chiffres fibre.
- **itu.int/hub/2025/02/…** [P] : « 99 % », « 500+ » ; (longueur, pannes : trouvés par recherche, non ouverts ; deux valeurs divergentes).
- **lagazettefrance.fr, article sur ASN Calais** [S] : structure du câble, 80 t, 70-100 km, 250 km/jour en eaux profondes.
- **prysmian.com/en/en_2015-PR-Douvrin.html** [P] : 155 000 m², 25 M km de préformes (2015).
- **Recherches sans ouvrir la page** : fiches G.652.D Prysmian, Corning SMF-28 ULL (0,17 dB/km), brevets (pureté), Kao/Hockham (Nature Photonics), TeleGeography.
- **Non lu (403/404)** : pages Corning « Manufacturing Excellence » (OVD) ; Nobel 2009 (press release et PDF) ; fiche Corning SMF-28 ULL ; WP8002 (proof test) ; Nextrom ; OFS « FiberGeek » ; communiqué UIT février 2025 ; blog TeleGeography ; YouTube (aucune vue ni durée lisible). **Aucune norme UIT-T G.652/G.657 n'a été lue à la source** : les valeurs « G.652 » viennent de fiches de fabricants.

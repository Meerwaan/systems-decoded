# CR04 — Lac-Mégantic, 6 juillet 2013 : l'air qui tenait le train

Faits réunis le 13/11/2026. Source maîtresse : **rapport d'enquête ferroviaire R13D0054 du BST** (Bureau de la sécurité des transports du Canada), page HTML intégrale **lue à la source** (version anglaise, https://www.tsb.gc.ca/eng/rapports-reports/rail/2013/r13d0054/r13d0054.html ; chronologie = § 1.1, tableau 1 du § 1.13.1 et annexe A). Note de méthode : l'outil de lecture web recevait « 403 » du site du BST ; la page a été récupérée par une requête HTTP directe (page publique) et lue en texte. La version française n'a pas été relue ligne à ligne (même rapport). Niveaux : **[P]** primaire lue · **[S]** secondaire · **[O]** ordre de grandeur.

## 1. Verdict sur l'angle

**Tient, et il est meilleur que prévu.** Le rapport confirme point par point l'angle « les freins à air tenaient le train ; on a éteint la locomotive ; l'air a fui ». En plus, trois détails du rapport donnent le « wow » : (a) le tableau de la boîte noire donne la seconde où la locomotive s'arrête (23 h 58 min 42 s) et la seconde où le train part (0 h 58 min 21 s), soit **59 min 39 s** de sursis ; (b) à l'instant du départ, la force de freinage restante (146 000 lb) est **juste sous** celle qu'il fallait (146 700 lb) ; (c) le contrôleur de Farnham savait que la locomotive de tête n'était « pas normalement éteinte à cause du frein à air » (annexe A, 0 h 18) et a dit au contremaître de « laisser les choses comme elles étaient ».

« Vu et revu » : **oui pour le sujet général** (documentaires, séries, vidéos de chaînes de catastrophes), mais presque toujours raconté par le bilan, l'explosion et le procès. Le **mécanisme de l'air qui fuit en 59 min, vu comme un compte à rebours**, est le créneau libre. Je n'ai pas fait d'inventaire des réseaux (non vérifié).

**Test du spectacle** (passe) : un train de 72 wagons-citernes, 4 700 pieds (≈ 1,4 km), qui **démarre tout seul** à l'arrêt, dans la nuit, puis prend de la vitesse à 25, 50, 65 mph ; lisible sans le son (un trait de 1,4 km qui glisse, des phares absents, l'horloge). Plan choc : la locomotive de tête qui crache de la fumée à l'arrêt, puis la première roue qui tourne.
**Test de l'histoire** (passe) : quelqu'un (le mécanicien, seul à bord, pas de conducteur), un danger (un feu), des secondes (59 min qui s'écoulent à 1 psi par minute), et une raison d'envoyer le film : « les pompiers ont fait exactement ce que le manuel disait ». Attention : **ne pas faire des pompiers des fautifs** (voir « À ne pas dire »).

## 2. La scène

Cas réel daté : **5 juillet 2013, 22 h 49 min 37 s**, le train MMA-002 s'arrête à Nantes (Québec), sur la voie principale, en pente descendante (pente moyenne 0,92 %), à 7,2 miles (≈ 11,6 km) de Lac-Mégantic [P, § 1.1, 1.8.1, tableau 1]. 72 wagons-citernes de pétrole brut (≈ 7,7 millions de litres), 1 wagon tampon, 5 locomotives et 1 « VB car » (wagon spécial de tête) ; ≈ 10 290 tonnes [P, § 1.1, 1.7]. Mécanicien seul à bord [P, § 1.1].

À **montrer** : la pente (360 pieds de dénivelé entre Nantes et Lac-Mégantic [P, § 1.4.1]), les 5 locomotives dont une seule tourne, la fumée noire puis blanche de la tête (MMA 5017), un feu sur la locomotive à 23 h 40 (appel au 911), la jauge de pression de l'air, 7 freins à main serrés sur ~73 voitures, l'horloge. Ne **pas** montrer les morts ni l'incendie de la ville comme sujet : la fin du film est le départ du train et la vitesse (65 mph) ; l'explosion tient en une phrase.

## 3. Le système qui sauve (et ses deux couches)

Ce qui est censé empêcher un train garé de partir : **deux couches** [P, § 1.9, 1.10, 1.12] :
1. **Les freins à air** (le frein « automatique » du train et le frein « indépendant » des locomotives) : alimentés en air par les compresseurs de la locomotive qui tourne. Ce sont des freins qui **ont besoin d'air** : sans compresseur, l'air fuit lentement par les raccords.
2. **Les freins à main** (un volant ou un levier + chaîne, un par wagon) : la règle d'exploitation **CROR 112** impose d'en serrer assez, et **un essai d'efficacité** (112 b) : relâcher tous les freins à air et vérifier que les freins à main seuls retiennent le train [P, § 1.12.1].

Qui l'a : tous les trains de marchandises canadiens de compétence fédérale (règle CROR). Chez MMA, la consigne interne dite « 10 % + 2 » donnait **9 freins à main pour 70 à 79 voitures**, locomotives comprises [P, § 1.12.2, 1.12.3 (règle 9210 k)]. Ce minimum de 9 était d'ailleurs **insuffisant**, selon les essais du BST [P, § 2.2, voir plus bas].

## 4. Le mécanisme ouvert

**Pièces (mot de métier)**
1. **Compresseur d'air de la locomotive** (moteur diesel qui l'entraîne) : recharge tout le système.
2. **Réservoir principal** (« main reservoir ») de la locomotive : stocke l'air ; il alimente à la fois la conduite générale et les freins indépendants [P, § 1.9].
3. **Conduite générale** (« brake pipe ») : tube qui court sous tout le train ; **95 psi = freins desserrés** ; en cas de baisse, chaque wagon freine [P, § 1.9, 1.13.1].
4. **Cylindre de frein** de la locomotive (frein indépendant) : **70 psi = serrage maximal** ; pousse les sabots sur les roues [P, § 1.13.1].
5. **Sabots de frein** : garnitures qui frottent sur la roue (la « bleuissure » des roues montre la chaleur dégagée) [P, § 1.14.2.2].
6. **Frein à main** : volant, chaîne, qui serre les sabots ; **soupape QRB** (« quick release brake valve ») qui doit purger l'air du cylindre quand on serre le frein à main [P, § 1.14.2.1].
7. **Disjoncteurs / coupe-circuit de carburant d'urgence** de la locomotive (ce que les pompiers ont actionné) [P, Annexe A, 23 h 58].
8. **Dispositif de veille « RSC »** (reset safety control) : censé freiner le train en urgence quand on coupe l'électricité de la cabine ; **câblé directement sur la batterie, il ne s'est pas déclenché** [P, § 1.14.5 (n° de section à revérifier) et § 2.1].

**Ce qui déclenche** : arrêt du moteur de la locomotive de tête → arrêt du compresseur → l'air des réservoirs fuit lentement par les raccords.
**Ordre des événements** (heures de la boîte noire de la locomotive, tableau 1, sauf mention) [P] :
- 22 h 49 min 37 s : arrêt à Nantes, serrage automatique 13 psi, freins indépendants serrés à fond.
- 23 h 03 min 48 s : freins automatiques desserrés ; **freins indépendants restés serrés** (essai d'efficacité fait ainsi).
- 23 h 40 : appel au 911 pour un feu sur le train (annexe A).
- 23 h 58 min 42 s : la locomotive de tête s'arrête (coupe-circuit de carburant d'urgence).
- 0 h 05 min 55 s : la pression de la conduite générale commence à baisser, **≈ 1 psi par minute**.
- 0 h 13 min 55 s : la pression du cylindre de frein indépendant commence à baisser au même rythme.
- ≈ 0 h 44 : le contremaître de MMA et les pompiers quittent le site (annexe A).
- **0 h 58 min 21 s : le train part** (à 27 psi dans le cylindre de frein) : 1 mph.
- 1 h 07 : 25 mph · 1 h 14 : 50 mph (annexe A) · **1 h 15 min 30 s : 65 mph** · 1 h 15 min 31 s : pression à 0, les wagons déraillent, les locomotives se séparent des wagons (tableau 1).

**Seuils chiffrés (essais du BST, § 1.14.2.3, 1.14.1, 2.2)** [P]
- Force de freinage nécessaire pour tenir le train sur la pente : **≈ 146 700 lb**.
- Freins indépendants avant le serrage des freins à main : ≈ 249 760 lb ; après : ≈ 215 500 lb.
- **7 freins à main : ≈ 48 600 lb au total.** Un seul (locomotive MMA 5026) n'a pas serré correctement : la soupape QRB n'a pas purgé l'air ; **6 des 7 donnaient une force** (§ 4.3.1).
- Au départ (27 psi) : freins indépendants réduits à ≈ 97 400 lb ; total avec les freins à main ≈ **146 000 lb**, donc **juste sous 146 700 lb** (§ 2.2 : seuil critique atteint environ 1 heure après l'arrêt de la locomotive).
- Essai de fuite sur les locomotives : pression du cylindre à 27 psi en **1 h 06 min** à partir d'un système plein ; autre essai : 1 h 35 min après l'arrêt de la locomotive (essai d'un train identique) [P, § 1.14.1, 1.14.2]. Le temps réel (59 min 39 s) tombe dans la fourchette : le délai de fuite est variable (« hautement variable » dit le rapport).
- Frein à main de locomotive : ≈ 5 590 lb chacun (rapport de frein ≈ 3,8 %) ; frein à main de wagon-citerne ≈ 8 650 lb à 100 pi-lb de couple [P, § 1.14.2.3, 1.14.3].
- **Nombre de freins à main qu'il aurait fallu**, selon le BST [P, § 2.2] : **18 à 26** si aucun frein à air n'avait servi ; **15 à 20** avec l'arrêt fait à 13 psi ; **12 à 18** si posés seulement sur les wagons. Le minimum de MMA (9) « n'aurait pas suffi ».
- Serrés : **7** (5 locomotives, le VB, le wagon tampon : « 7 voitures en tout ») ≈ **10 % des voitures** [P, § 1.1, 2.2].

**Pourquoi ça marche (beat `principe`)** : un frein à air **serre par la pression et lâche quand l'air fuit** ; il retient tant qu'un moteur recharge l'air, et le frein à main, lui, retient sans air mais seulement s'il y en a assez. Ordre de grandeur sourcé : dans les essais du BST, l'air d'un train de locomotives éteintes met **de 1 h à 1 h 35** à ramener le frein à 27 psi ; ici, **59 min 39 s** [P, tableau 1 et § 1.14.1].

## 5. Chiffres (source, niveau)

| Chiffre | Source | Niv. |
| --- | --- | --- |
| 22 h 49 min 37 s arrêt à Nantes | rapport R13D0054, tableau 1 | P |
| 23 h 40 appel au 911 (feu) | rapport § 1.1, annexe A | P |
| 23 h 58 min 42 s locomotive de tête arrêtée | tableau 1 ; annexe A dit « 2358 » | P |
| 0 h 58 min 21 s le train part (« run away ») | tableau 1 | P |
| 1 h 15 min 30 s : 65 mph (≈ 105 km/h) ; 1 h 15 min 31 s pression 0 | tableau 1 | P |
| Durée sursis : 59 min 39 s (calcul 23:58:42 → 00:58:21) | calcul sur le tableau 1 | P |
| Trajet : 7,2 miles (≈ 11,6 km), ≈ 17 min (0:58 → 1:15) | § 1.1 ; calcul | P |
| 72 wagons-citernes, ≈ 7,7 millions de litres de brut ; 4 700 pieds ; ≈ 10 290 tonnes | § 1.1, 1.7 | P |
| Pente moyenne 0,92 % à Nantes ; 1,30 % les 2 derniers miles ; chute 360 pieds | § 1.4.1, 1.8.1 | P |
| 7 freins à main serrés ; 9 requis par la consigne MMA ; 15 à 20 (ou 18 à 26) vraiment nécessaires | § 1.1, 1.12.2, 2.2 | P |
| 146 700 lb requis ; 146 000 lb au départ | § 1.14.2.3, 2.2 | P |
| Limite à Frontenac Street : 10 mph (restriction permanente) ; vitesse maxi voie 40 mph, avec restrictions à 25 mph | § 1.4.1 | P |
| 63 wagons + 2 voitures déraillés ; 6 millions de litres déversés ; 40 bâtiments, 47 morts | Sommaire, § 1.2 | P |
| 59 des 63 wagons Classe 111 (94 %) ont fui par impact | § 4.1.2.1 | P |
| 18 facteurs ayant joué un rôle | communiqué TSB repris sur canada.ca | S |
| 13 passages à niveau traversés | § 1.1 | P |
| Hors-service MMA 5017 : réparation du moteur non conforme (octobre 2012), roulement de came fracturé, huile surchauffée dans le turbo → fumée | § 1.15.1, 2.1 | P |

## 6. Ce qui retourne une idée reçue (candidates de chute)

1. **« Les pompiers ont éteint le feu. Et c'est en éteignant le feu que le train est parti. »** Les pompiers ont suivi l'instruction ferroviaire (couper le carburant, ouvrir les disjoncteurs) ; ce geste « en conformité avec les instructions de la compagnie » a arrêté le compresseur [P, § 1.1, 2.1]. L'idée reçue : « le frein à main a lâché » ; la réalité : **il n'avait jamais tenu seul**, l'air le cachait.
2. **« L'essai a réussi parce qu'il était faux. »** L'essai d'efficacité a été fait **sans desserrer les freins indépendants** : le train tenait grâce à l'air, pas aux freins à main [P, § 1.1, 2.1].
3. **« Le feu n'était pas l'accident. Le feu était le détonateur d'un défaut déjà là depuis 22 h 49. »** (variante narrative de 1)

## 7. La question du commentaire (fermée, deux camps, un mot)

- **« Un train garé, c'est ses freins à air… ou ses freins à main qui le tiennent ? »** (le spectateur répond « air » ou « main » ; la bonne réponse, sur la nuit du film, est « les deux, et l'air partait en une heure » : à utiliser après la réponse du C.)
- **« Une locomotive garée tourne… ou elle est éteinte ? »** (lecture simple chez soi : une locomotive à l'arrêt devant la gare.)
- **« Les pompiers ont bien fait de couper le moteur… oui ou non ? »** (clivante ; à éviter si elle sonne comme une accusation : le rapport dit qu'ils suivaient les consignes.)

## 8. L'histoire du système

- Les freins à air « automatiques » des trains datent de l'invention de **George Westinghouse (1869)**, qui fait **freiner** le train quand l'air se perd (principe de sécurité par défaut). Le frein à main ne dépend d'aucun air. **[Non vérifié dans cette passe : à sourcer avant usage.]**
- Depuis le 6 juillet 2013 : voir § « Ce qui a changé » ci-dessous.

## 9. Pour l'annonce

Phrase de 12 à 17 mots, un seul fait sûr (dite après « Abonne-toi : ») :

**« Prochain dossier : cinquante-neuf minutes après l'arrêt de sa locomotive, un train garé démarre tout seul. »** (16 mots ; tableau 1 du rapport, 23:58:42 → 00:58:21 [P])

Pour le film précédent (un seul fait sûr, dit à la fin du film d'avant) : « Le 6 juillet 2013 à 0 h 58, un train de 72 wagons de pétrole est parti seul, à l'arrêt. »

## 10. À ne pas dire

- **« Le mécanicien a mal serré / a oublié les freins. »** Faux : il en a serré 7 sur 73 voitures, ce qui correspond à la pratique locale (« 10 % ») ; la compagnie demandait 9 ; il a **fait un essai**, mais dans de mauvaises conditions (freins indépendants restés serrés) ; le rapport parle de **formation, de culture de sécurité, de pratique répandue** chez MMA (« d'autres mécaniciens ne relâchaient pas non plus les freins indépendants ») [P, § 2.2]. Le rapport ne dit pas « faute du mécanicien » ; le BST « ne détermine ni faute ni responsabilité civile ou criminelle » (page de garde).
- **« Les pompiers ont fait une erreur. »** Faux : ils ont agi **conformément aux instructions ferroviaires** [P, § 1.1, 2.1]. MMA a envoyé un contremaître sans expérience de locomotive ; personne n'a redémarré une locomotive [P, § 2.1].
- **« Il n'y avait personne à bord. »** Le train était garé sans personne à bord (mécanicien parti à l'hôtel), c'est vrai ; mais ne pas dire « sans freins ».
- **« 11 freins à main. »** Chiffre qui circule (préliminaire) : le rapport final dit **7**. **« 17 à 26 freins nécessaires » (communiqué)** : le rapport complet dit **18 à 26 / 15 à 20 / 12 à 18** selon le scénario ; ne citer que le rapport.
- **« 23 h 40, les pompiers éteignent la locomotive. »** 23 h 40 = l'appel ; l'arrêt de la locomotive est à **23 h 58** (tableau 1 et annexe A).
- **« Le train est parti à 1 h »** : « vers 1 h » dans le résumé ; la boîte noire dit **0 h 58 min 21 s**.
- **Mythes du « film » (non lus ici)** : le pétrole « plus explosif que prévu » (mal classé) relève d'une autre partie du rapport (§ 1.18 : non lue en détail) ; ne pas en faire un fait du film.
- Ne pas parler de « sabotage » : aucune source.
- Ne jamais dire « les freins à air ont lâché » comme une panne : ils **ont fui** comme prévu en l'absence de compresseur ; c'est la **conception** (§ 1.9, 4.3.1 : « la technologie n'est pas à l'épreuve des pannes »).

## 11. Ce que la voix peut dire (phrases courtes, vraies telles quelles)

1. Vingt-deux heures quarante-neuf. Le train s'arrête à Nantes.
2. Soixante-douze wagons de pétrole. Une seule locomotive allumée.
3. Le mécanicien serre sept freins à main. Pour soixante-treize voitures.
4. À vingt-trois heures quarante, quelqu'un appelle le neuf-un-un. Un feu.
5. À vingt-trois heures cinquante-huit, les pompiers coupent le moteur.
6. Sans moteur, plus de compresseur. L'air se met à fuir.
7. Une livre par minute. Pendant une heure.
8. Le train tenait par l'air. Pas par ses freins à main.
9. À zéro heure cinquante-huit, il part. Tout seul.
10. Cent cinq à l'heure. Dans une courbe limitée à seize.

(Phrase 10 : 65 mph = 105 km/h [P, tableau 1] ; limite à Frontenac 10 mph ≈ 16 km/h [P, § 1.4.1] ; ne pas dire « dans la courbe » si on n'a pas vérifié la limite exacte de courbe : dire « au centre-ville ».)

## 12. Ce qui a changé depuis (dates, sources)

**Dans le rapport lui-même (action de sécurité, § 4.1)** [P] :
- **23 juillet 2013** : Transport Canada émet une **directive d'urgence** (art. 33 de la Loi sur la sécurité ferroviaire) : consignes pour les locomotives sans surveillance ; train de marchandises dangereuses interdit à moins de **2 personnes** ; freins à main selon les instructions CROR 112 si un train est laissé plus de **1 heure** ; avant 1 h, frein automatique en service complet + frein indépendant serré. Même jour : **arrêté ministériel 07-2013** (règles à refaire sous 120 jours : cabine fermée, inverseur retiré, mouvements incontrôlés, équipage minimal).
- **26 décembre 2013** : TC approuve la **règle générale M (iii)** des CROR : « équipage minimal de deux » pour un train avec au moins un wagon-citerne chargé de marchandises dangereuses.
- **30 décembre 2013** : TC ordonne aux chemins de fer de déposer leurs instructions sur l'essai d'efficacité des freins à main (CROR 112).
- MMA a supprimé les trains à un seul mécanicien et interdit de laisser sans surveillance un train de marchandises dangereuses sur la voie principale (§ 4.1.1).
- **23 avril 2014** : directive de protection n° 34 : interdit les wagons Classe 111 sans renfort continu du fond pour les liquides inflammables de classe 3 (brut, éthanol) ; plan : retrait ou modernisation des Classe 111 d'avant CPC-1232 sous 3 ans (§ 4.1.2.1).

**Recommandations du BST** (R14-01 à R14-05, 19 août 2014 ; trois recommandations intermédiaires déjà émises en janvier 2014 selon le rapport) [P] :
- **R14-01** (Classe 111 plus résistants) : « entièrement satisfaisant », dossier **fermé**, mars 2023 [P, page de recommandation].
- **R14-04** (**défenses physiques contre les mouvements incontrôlés**) : « satisfaisant en partie », dossier **actif**, évaluation de **mars 2026**. Le BST écrit que le cadre d'amarrage actuel est « plus robuste qu'en 2014 », qu'un risque résiduel demeure là où des déraillements fixes ne protègent pas la voie principale, et que « les mouvements non planifiés ou incontrôlés » ont été **retirés de la Liste de surveillance du BST en 2025** [P, https://www.tsb.gc.ca/eng/recommandations-recommendations/rail/2014/rec-r1404.html]. Transport Canada demande la fermeture du dossier.
- Le BST critique la **règle 112 réécrite** : « alambiquée », avec une référence circulaire, qui permet dans certains cas de laisser un train jusqu'à 2 h sur le frein à air seul sur 1,25 % de pente (§ 4.3.1) [P, version du rapport de 2014].

**Wagons** [S] : la norme **TC-117** introduite en 2015 ; **avancement du retrait des DOT-111 (brut) au 1er novembre 2016** annoncé en juillet 2016 (directive de protection 38) [S : presse et cabinets d'avocats, non lu à la source TC ; **à sourcer sur canada.ca avant usage**].

**Équipage** : depuis 2013 (directive d'urgence puis règle M iii, 26/12/2013), deux membres d'équipage minimum pour un train avec au moins un wagon-citerne de marchandises dangereuses chargé [P, § 4.1.6].

## 13. Les personnes (noms publics, ce qu'on ne peut pas leur prêter)

- **Le rapport du BST ne nomme personne** : « le mécanicien (LE) », « le contrôleur de Farnham (RTC) ». Le BST précise que son rapport n'est pas fait pour établir faute ou responsabilité.
- **Tom Harding** (mécanicien), **Richard Labrie** (contrôleur de la circulation) et **Jean Demaître** (directeur de l'exploitation) : **accusés de négligence criminelle ayant causé la mort (47 chefs)** ; **acquittés par le jury à Sherbrooke le 19 janvier 2018**, après neuf jours de délibération ; la Couronne **n'a pas fait appel** (février 2018) [S : presse — Radio-Canada International, Daily Hive, Times Colonist via PressReader ; non lu à la source judiciaire]. L'avocat de Harding a dit qu'il a toujours reconnu sa responsabilité (« à porter »). **Je n'ai pas confirmé** le détail (peine de maison d'arrêt, « plaidoyers de culpabilité » de 2018 sous la Loi sur la sécurité ferroviaire) : **à ne pas dire**.
- **Ed Burkhardt** (Rail World, maison mère de MMA) : cité dans la presse, **non accusé** [S, Wikipédia anglais].
- **Les pompiers de Nantes** : non nommés ; ils ont suivi les instructions ; aucune faute ne leur est prêtée par le rapport.
- **Le chauffeur de taxi** et un passant (photo de l'incendie de la locomotive, crédit Nancy Cameron dans le rapport) : ne pas nommer dans le film.
- Phrase sûre : « Le rapport ne dit pas “c'est la faute d'un homme” : il liste dix-huit facteurs. » [S pour « 18 facteurs »].

## 14. Les pièces du dossier (images)

- **Photos du rapport R13D0054** : © Gouvernement du Canada, **reproduction non commerciale uniquement** (conditions du site du BST), « sauf mention contraire » ; certaines sont d'un tiers (photo 13 : Nancy Cameron, feu de la locomotive à Nantes ; photo 2 : Richard Deuso) : **non réutilisables sans autorisation** sur une chaîne monétisée. **Ne pas les inclure**. Source des conditions : https://www.tsb.gc.ca/eng/avis-notices/avis-notices.html [P].
- **Schémas du rapport** (carte MMA, profil de pente Nantes-Lac-Mégantic) : mêmes conditions : **refaire en 3D** à partir des chiffres (pente, distances).
- **Journaux télé, vidéos amateurs, film** : non autorisés.
- **Utilisable sans risque** : les **chiffres et les heures** du rapport (des faits ne sont pas protégés), cités en source.

## 15. Sources (ce qui a été lu)

1. **Rapport R13D0054, BST** — https://www.tsb.gc.ca/eng/rapports-reports/rail/2013/r13d0054/r13d0054.html — lu en entier (HTML récupéré par requête directe) : sommaire, § 1.1 à 1.15, 2.1, 2.2, 4.1 à 4.3, annexes A et B. **[P]**
2. **Recommandation R14-04** — https://www.tsb.gc.ca/eng/recommandations-recommendations/rail/2014/rec-r1404.html — lue (réponses de TC et de l'ACFC jusqu'en février 2026 ; évaluation du BST de mars 2026). **[P]**
3. **Recommandation R14-01** — https://www.tsb.gc.ca/eng/recommandations-recommendations/rail/2014/rec-r1401.html — lue (en-tête : « entièrement satisfaisant », fermée, mars 2023). **[P]**
4. **Conditions d'utilisation du BST** — https://www.tsb.gc.ca/eng/avis-notices/avis-notices.html — lue (reproduction non commerciale). **[P]**
5. **Communiqué du BST (via canada.ca)** — https://www.canada.ca/en/news/archive/2014/08/tsb-identifies-systemic-problems-leading-lac-megantic-train-accident-calls-additional-safety-defences-improve-rail-safety.html — lu (18 facteurs, 6 millions de litres, 47 morts). **[S]**
6. **Wikipédia (anglais), « Lac-Mégantic rail disaster »** — lue partiellement (premiers 100 000 caractères) : sert de recoupement et pour les noms ; la page donne « 23 h 50 : appel 911 », que le rapport corrige à **23 h 40**. **[S]**
7. Presse sur l'acquittement : Radio-Canada International (https://www.rcinet.ca/en/2018/01/19/jury-acquits-trio-charged-in-lac-megantic-rail-disaster/), Daily Hive, Times Colonist via PressReader : **résultats de recherche lus, pages non ouvertes**. **[S]**
8. Presse sur les directives de TC et le TC-117 : résultats de recherche (CBC, Globe and Mail, Railway Age, Mondaq) **non ouverts** ; tout ce qui n'est pas dans le rapport est marqué [S] ou « à sourcer ».
9. **Non lu** : la version française du rapport (même contenu), le PDF du rapport (erreur 403 sans en-tête de navigateur), pages de Transport Canada sur les ordonnances (aucune page canada.ca de TC ouverte), jugement et pièces du procès, § 1.17, 1.18 (organisation de MMA, classification du pétrole) en détail.

## 16. Pour la voix — repères de montage (utile au scénariste)

Horloge à afficher : **22:49:37 → 23:03:48 → 23:40 → 23:58:42 → 00:58:21 → 01:15:31**. Le compte à rebours du film peut être **les 59 min 39 s** entre l'arrêt de la locomotive et le départ, vues en pression qui baisse (95 → 27 psi pour le cylindre, 70 → 27 psi). Le chiffre « 146 000 contre 146 700 livres » est le « retiens bien ça » du beat `principe` : le train tient tant que le total des freins dépasse 146 700 lb.

# CR02 — Deepwater Horizon, 20 avril 2010 : la sécurité qui devait fermer le puits (le BOP) a fermé… sur un tube plié

**Avertissement de lecture, en tête.** Rapports officiels publics et ouverts à la source : **CSB, rapport technique sur le BOP « Engineering Services » (06/02/2014, 83 p., PDF lu en texte)** et **CSB, Macondo Investigation Report Volume 2 (05/06/2014, PDF lu en texte)** : ce sont les deux seules sources **[P] lues**. **Non lues** : rapport BP « Bly » (08/09/2010 : erreur 403 sur le miroir de la Garde côtière), rapport de la National Commission (janvier 2011) et Chief Counsel's Report (PDF de plus de 10 Mo, refusés par l'outil), rapport DNV (lu **à travers OGJ**, presse spécialisée, donc [S]), Federal Register 2016 (lu par résumé de l'outil sur les 100 000 premiers caractères d'une page de 950 000). Les heures viennent de la **simulation d'Engineering Services (ES) calée sur les données du puits, publiée par le CSB** : ce sont des heures **reconstituées**, pas des horodatages bruts, et BP / Transocean diffèrent d'une minute par endroits (ex. 21:08 vs 21:09). Niveaux : **[P]** primaire lue · **[S]** secondaire · **[O]** ordre de grandeur seulement.

## 1. Verdict sur l'angle

**Tient, avec un recentrage.** Le sujet est très vu (film de 2016, documentaires, séries) mais **toujours raconté par la marée noire et les « méchants » BP**. Ce qui est peu vu, et que porte ton angle : la dernière sécurité, le BOP, **a bien fermé ses mâchoires**… sur un tube que la pression venait de plier hors du centre. Et le second système de secours ne tenait que par **deux défauts de câblage qui se sont annulés** [P : CSB Vol. 2, §3.2]. Le test négatif mal lu (1 400 psi sur le tube, 0 sur la ligne) est l'erreur humaine qui lance le compte à rebours ; à ne pas faire : refaire le procès de BP.
- **Spectacle** : passe. Première image possible : le tube qui sort du plancher de forage et la boue qui jaillit de la tour (21 h 40, événement en cours), ou, sous l'eau, le BOP de 5 étages qui ferme ses mâchoires sur un tube qui se plie. Lisible sans le son : une colonne de boue qui monte dans le derrick.
- **Histoire** : passe. Quelqu'un (le foreur, qui voit 1 400 sur un cadran et 0 sur l'autre), un danger (du gaz qui remonte à 22 barils par minute), quelques minutes (21 h 40 → 21 h 49), et une raison de l'envoyer : « les deux sécurités de secours étaient en panne… et celle qui a marché a quand même échoué ».
- **Réserve de format** : le temps réel dense est **21 h 31 → 21 h 58** (≈ 27 min), plus long que les autres CR. Recommandation : compte à rebours **21 h 08 → 21 h 49** puis suite « après l'explosion » (21 h 56 EDS, 21 h 58 AMF) en `issue`. La phase « test négatif » (17 h 52 → 19 h 55) se dit en **une** phrase dans le principe/la promesse.

## 2. La scène

Cas réel daté : **Deepwater Horizon (semi-submersible de forage Transocean, au service de BP), puits Macondo, golfe du Mexique, ≈ 50 miles au sud-est de Venice (Louisiane), mardi 20 avril 2010, soir.** Le puits est cimenté, on le prépare à être « abandonné temporairement » : on remplace la boue lourde par de l'eau de mer, plus légère. **126 personnes à bord** (79 Transocean, 7 BP, 40 sous-traitants) [S : Wikipedia citant les témoignages officiels / CSB : « 126-member crew » P-site]. Le jour même, des cadres de BP et Transocean étaient à bord pour fêter **sept ans sans accident avec arrêt de travail** [S : Wikipedia citant CNN et le témoignage de P. O'Bryan ; la Commission le reprend, non lue].
**Montrable fidèlement** : tableau de bord à deux cadrans (pression du tube vs ligne d'étranglement), la remontée du gaz, le BOP en 5 étages sur le fond (≈ 1 500 m d'eau, voir §5), les mâchoires, un tube plié. **À reconstituer sans le dire** : les visages, les dialogues du 20 avril, la salle de forage (aucune transcription publique lue), la forme exacte des flammes.

## 3. Le système qui sauve

Le **BOP (blowout preventer, « bloc obturateur de puits »)** : un empilement d'équipements posé sur la tête du puits au fond, qui doit **fermer le puits** si du pétrole ou du gaz remonte. Sur Deepwater Horizon, il avait, de haut en bas : des **annulaires** (joints en caoutchouc qui serrent le tube), des **VBR** (« variable bore rams », mâchoires qui enserrent le tube), et la **BSR** (« blind shear ram », **mâchoires aveugles cisaillantes** : deux lames qui coupent le tube et se referment sur le puits) [P : CSB ES, §3 et Vol. 2 §2]. Le fabricant est Cameron, modèle TL 18¾", pression nominale 15 000 psi, packer de cisaillement type SBR [P : CSB ES, p. 1904 du texte]. **Qui l'a** : toute installation de forage en mer ; les mêmes équipements existent partout (depuis, règle américaine de 2016 : deux jeux de mâchoires cisaillantes obligatoires sur les BOP sous-marins).

## 4. Le mécanisme ouvert

**Pièces** (mots de métier) :
1. **Annulaire** (annular preventer) : manchon en caoutchouc qui se gonfle autour du tube [P : CSB Vol. 2].
2. **VBR** : mâchoires à tube ; ferment sur un tube de diamètre variable [P].
3. **BSR** : deux lames cisaillantes + garniture d'étanchéité ; coupe le tube **et** ferme le puits [P].
4. **Pods jaune et bleu** : deux boîtes de commande redondantes, chacune avec ses **électrovannes (solénoïdes)** et ses **SEM** (modules électroniques) A et B [P : Vol. 2 §2.3].
5. **Batteries de secours** : 27 volts (partagée) et 9 volts [P : Vol. 2, fig. 3-2].
6. **Système AMF / « deadman »** (Automatic Mode Function, version Cameron du « homme mort ») : se déclenche **seul**, sans personne, si le BOP perd à la fois la puissance hydraulique et la communication avec la plateforme [P : Vol. 2 note a, API Spec 16D].
7. **EDS** (Emergency Disconnect System) : bouton sur la passerelle, qui doit fermer la BSR puis détacher la colonne montante [P : CSB ES].
8. **Accumulateurs** : réservoirs d'huile sous pression au fond, qui fournissent la force de fermeture [P : CSB ES].

**Ce qui déclenche** : une venue de gaz (le « kick ») détectée à temps → les membres d'équipage ferment l'annulaire puis les VBR. En dernier recours, EDS à la main, ou AMF seul si tout le reste est coupé.

**Ordre des événements** (heures de la simulation ES calée sur les données, plus les dates documentées ; ⚠ = reconstitué) :
- **15 h 56 → 16 h 52** : on remplace la boue par un bouchon « spacer » puis de l'eau de mer (421 barils de spacer à 16 ppg) [P : ES].
- **16 h 54** : annulaire fermé pour le **test négatif** [P : ES]. Pression attendue ≈ 1 600 psi, observée ≈ 2 300 psi [P : ES, p. 14].
- **17 h 52 → 19 h 55** : la ligne d'étranglement (kill line) donne 0 pression, 0 débit ; le tube garde 1 400 psi. **À 19 h 55, l'équipe décide que le test est réussi** [P : ES]. Erreur de jugement : les deux cadrans auraient dû dire la même chose. Le CSB note aussi que le bouchon visqueux a pu boucher la ligne [P : ES, hypothèse].
- **20 h 00** : on reprend le déplacement vers l'eau de mer ; la pression au fond passe sous celle du réservoir ; **≈ 20 h 51** : le réservoir commence à entrer (⚠ simulation) [P : ES].
- **21 h 08** : pompes arrêtées pour un test de brillance (« sheen test ») ; ≈ **9 barils/min** entrent, gain de **≈ 60 barils** en 16 min dans les bacs ; personne n'agit [P : ES].
- **21 h 31** : le foreur voit une différence de pression anormale, coupe les pompes ; le gaz remonte à ≈ **22 barils/min** (⚠ simulation) [P : ES].
- **≈ 21 h 40** : la boue déborde sur le plancher, passe la table rotative et jaillit dans le derrick [P : ES].
- **≈ 21 h 43** : annulaire supérieur actionné : **il ne scelle pas** [P : ES].
- **21 h 47** : VBR fermé : scelle bien (pression du tube > 5 000 psi) — mais **gaz et pétrole sont déjà au-dessus du BOP**, dans la colonne montante [P : ES].
- **21 h 49** : **explosion** [P : ES]. Le tube se plie dans le BOP à peu près à ce moment (CSB : « presque certainement avant 21 h 49 ») [P : ES].
- **21 h 56** : bouton EDS pressé sur la passerelle : rien ne se passe, alarme « accumulateurs bas » [P : ES].
- **Avant 21 h 58** : l'**AMF/deadman** doit se déclencher seul (1 à 2 min après la perte de communication) [P : ES]. Le CSB estime qu'il a **vraisemblablement** fermé la BSR, mais **partiellement** [P : Vol. 2 §3.2.2, ES].
- **22 h 19 (≈ 30 min)** : le top drive tombe de ≈ 26 pieds sur le plancher [P : ES].
- **22 avril, matin** : la plateforme coule après ≈ 36 h de feu (≈ 10 h 21 selon la Garde côtière) [S].

**Pourquoi la sécurité n'a pas arrêté le puits** (noyau du défaut, tous deux [P : CSB Vol. 2]) :
- **Le pod bleu** : un câblage défectueux a fait croire à la commande qu'elle était coupée de la plateforme → la batterie de 27 volts a **rempli sa veille jusqu'à se vider** avant le 20 avril. Elle ne pouvait plus ouvrir les électrovannes.
- **Le pod jaune** : l'électrovanne Y103 (celle qui ferme la BSR à haute pression) a été **mal câblée** : ses deux bobines créent des champs **opposés** et la vanne reste fermée si les deux sont alimentées. Une seule fonctionnait parce qu'une **batterie de 9 volts était à plat** : deux défauts qui s'annulent, donc « ça marche » par hasard. Hypothèse du CSB, formulée comme « vraisemblable ».
- **Le tube plié** : la BSR a bien fermé, mais le tube était hors de l'axe : une partie hors des lames, donc **pincée, perforée et non coupée** [P : Vol. 2, fig. 3-4].
- **Pourquoi le tube a plié** : l'**« effective compression »** — une grosse différence de pression entre l'intérieur et l'extérieur du tube (5 850 psi mesurés au tube vs ≈ 6 800 psi de différentiel au BOP) le plie comme un tuyau d'arrosage sous pression, même sans effort de compression [P : ES, p. 24-25 ; Vol. 2 §3.2.3]. Le DNV (2011) voyait un pliage dû au débit du puits et plus tardif ; **le CSB le place dans les premières minutes** [S : OGJ].

**Pourquoi ça marche (beat `principe`)** : un puits profond est un tuyau plein de fluide ; tant que la colonne de boue pèse plus que la pression du réservoir, rien ne monte. Le BOP est la fermeture de secours, pensée pour un puits qui coule à moins de ≈ 10 barils/min ; ici le débit était 22 [P : ES, p. 21, « usually below 10 BPM »]. Le BOP est une **dernière barrière**, pas une première.

**Délais et seuils** : de l'erreur (19 h 55) à l'explosion : **1 h 54**. De la boue sur le plancher (21 h 40) à l'explosion : **9 min**. De l'annulaire (21 h 43) au VBR scellant (21 h 47) : 4 min. De l'explosion au bouton EDS : **7 min**.

## 5. Chiffres (source et niveau)

| Chiffre | Valeur | Source / niveau |
| --- | --- | --- |
| Morts | **11** | CSB (page du dossier : « killed 11 workers ») [P]. |
| À bord / évacués | 126 / **115** | JIT, via presse [S]. Blessés : **16 (Garde côtière) ou 17 (Wikipedia/CNN)** : divergence non résolue → ne pas dire. |
| Explosion | **21 h 49** | CSB ES, simulation calée [P]. Wikipedia donne « 21 h 56 » pour le feu (CNN) → ne pas utiliser. |
| Pression tube après VBR | **5 850 psi** (≈ 6 800 psi de différentiel) | CSB ES [P]. |
| Pression nominale du BOP | **15 000 psi** (VBR, BSR) | CSB ES [P]. |
| Test négatif | 1 400 psi (tube) vs 0 (ligne) | CSB ES [P]. |
| Débit entrant | 9 barils/min à 21 h 08 ; 22 barils/min à 21 h 31 | CSB ES, **simulation** [O]. |
| Gaz libéré | 100 à 400 millions de pieds cubes par jour pendant 7-8 min | CSB ES, simulation [O]. |
| Fuite | **87 jours** (du 20/04 au 15/07/2010) ; **≈ 4,9 millions de barils** (± 10 %) ; 62 000 → 53 000 barils/jour | DOI / FRTG (release 11/03/2011) [P-site : « 4,9 millions, 53 000 avant la fermeture, ± 10 % »] ; les 62 000 sont lus en presse [S]. |
| Puits déclaré mort | 19 septembre 2010 | OGJ / presse [S]. |
| BOP remonté | 4 septembre 2010 | CSB Vol. 2 [P]. |
| Seuil de cisaillement | « Le BOP ne pouvait pas cisailler **de façon fiable** le tube de 6 po utilisé la plupart du temps » (hors 20 avril) | CSB Vol. 2 §5.2.1 [P], le détail de diamètre est mal rendu dans l'extraction texte → dire « le tube le plus épais ». |
| Câblage | Les deux pods n'auraient pas passé les essais d'acceptation en usine du fabricant | CSB Vol. 2, constat 6 [P]. |
| Rapport CSB | Vol. 1-2 : 5 juin 2014 ; Vol. 3-4 : 2016 ; 16 recommandations | CSB site [P-site]. |

## 6. Ce qui retourne une idée reçue

1. **« Le BOP n'a pas marché. »** Faux, ou plus exactement : **il a marché trois fois sur quatre et ça n'a pas suffi.** Le VBR a scellé à 21 h 47 ; la BSR s'est fermée (probablement) ; c'est le **tube plié** qui l'a empêchée de couper [P : CSB Vol. 2]. Chute possible : « Tu pensais que les mâchoires n'avaient pas fermé. Elles ont fermé. Sur un tube qui n'était plus au milieu. »
2. **« Deux systèmes de secours : l'un des deux marchera. »** Les deux étaient défectueux (batterie vidée, vanne mal câblée) ; **le jaune a fonctionné par la compensation de deux pannes** [P : CSB Vol. 2, fig. 3-2]. Chute : « Deux sécurités. Une vide. Une qui marche parce qu'une autre est à plat. »
3. **« Une pression forte plie un tube parce qu'on appuie dessus. »** Faux : **la pression à l'intérieur plie le tube sans compression** (« effective compression »), comme un tuyau d'arrosage [P : CSB Vol. 2 §3.2.3 ; ES]. Prérequis : image simple, une loi physique, un chiffre (≈ 6 800 psi).
4. (Option) **L'erreur** : un test négatif réussi qui ne l'était pas : « 1 400 d'un côté, 0 de l'autre, et on a validé » [P : ES].

## 7. La question du commentaire (fermée, deux camps, un mot)

- « Test négatif : 1 400 psi sur le tube, zéro sur la ligne. Tu valides… ou tu arrêtes tout ? » (le spectateur n'a pas à lire de cadran mais la peur vient de sa réponse).
- « Deux sécurités de secours, une seule marche. Pour toi, c'est du hasard… ou de la conception ? »
- « Sur ta plateforme : tu testes le système de secours… ou tu fais confiance à l'usine ? »

## 8. L'histoire du système

Le BOP est né en **1922** (Cameron / James Abercrombie, Harry Cameron) pour les puits terrestres ; les mâchoires cisaillantes datent des années 1960 en mer [S : mémoire générale, non vérifiée en cette passe ⚠]. Sur Macondo : BOP **Cameron TL 18¾" 15 000 psi** fourni avec la plateforme (manuel d'exploitation Cameron de septembre 2000 cité par le CSB) [P : ES]. Après 2010 : arrêt immédiat des forages en eaux profondes aux USA (moratoire de mai 2010 ⚠ non lu), **règle « Well Control Rule » de BSEE publiée le 29/04/2016** (entrée en vigueur 28/07/2016 ; deux mâchoires cisaillantes au plus tard à 5 ans ; **centrage du tube** à 7 ans ; vérification par tiers du cisaillement ; essais tous les 14 jours ; suivi en temps réel à 3 ans) [P : Federal Register, résumé] ; **révision de 2019** qui garde la double mâchoire cisaillante mais remplace le « BAVO » par un tiers indépendant et assouplit le suivi en temps réel [P : fiche BSEE lue].

## 9. Pour l'annonce

- **Phrase après « Abonne-toi : »** (12-17 mots) : « Chaque compte à rebours, un vrai accident, et la sécurité qui a lâché. Le prochain : … » (reprendre la tournure de CR01 ; compléter avec le prochain).
- **Un fait sûr pour la fin du CR précédent** (à dire à la fin du film qui précède) : « Le 20 avril 2010, au large de la Louisiane, un système de secours de plateforme avait une batterie vidée et une vanne mal câblée. » [P : CSB Vol. 2].

## 10. À ne pas dire

- **« Le BOP n'a pas fonctionné. »** Il a fonctionné en partie (VBR scellé à 21 h 47, BSR fermée par l'AMF) : dire « n'a pas pu couper ».
- **« L'explosion à 21 h 56 »** (CNN/Wikipedia) : 21 h 56 est l'heure de l'EDS pressé ; l'explosion = 21 h 49 (CSB). Heures **à ± 1 min** selon le rapport (BP 21 h 09, ES 21 h 08).
- **« Un seul défaut »** : plusieurs (test mal lu, détection tardive, AMF défectueux, tube plié, BSR sous-dimensionnée pour le tube épais).
- **« Les 11 morts étaient… [noms, rôles] »** et tout nom de personne sur la plate-forme (foreur, Jimmy Harrell, Vidrine, Kaluza…) : les rapports en nomment, **je n'ai pas lu ces passages** ; la voix ne nomme personne. Ne rien prêter aux gens (ni « il a ignoré », ni « il a protesté » : ce dernier récit de CNN est de presse [S]).
- **« Un million de litres par jour », « 5 millions »** : le chiffre officiel est **4,9 millions de barils ± 10 %** ; d'autres études (Columbia : 4,4 ; modélisations : 4,9-5,8) divergent.
- **« BP a débranché la sécurité »** : le CSB parle de **câblage défectueux**, pas de décision de la débrancher. Ne pas dire non plus que les batteries étaient « sabotées ».
- **Le détail du diamètre du tube** (5½ po / 6⅝ po) : mal extrait du PDF ; dire « le tube le plus épais ».
- **Le temps de chute du top drive** et la fuite à travers le tube (30 min) : reconstitués, ne pas citer.
- **« Il y a eu une alarme générale »** : non vérifié en cette passe.
- **Mythes du film (2016)** : ne reprendre aucun dialogue ni scène du film.
- **« Les mâchoires ont coupé le tube »** : non, elles l'ont **pincé et perforé** [P : CSB Vol. 2 §3.2.2].
- **« La fuite a duré 87 jours »** : OK, mais certaines sources disent 86 (convention de comptage) ; dire « près de trois mois » si doute.

## 11. Ce que la voix peut dire (phrases vraies telles quelles)

1. Il est vingt et une heures huit. Le puits coule déjà.
2. Neuf barils par minute entrent dans le puits. Personne ne le voit.
3. À dix-neuf heures cinquante-cinq, un test a été jugé réussi. Il ne l'était pas.
4. Un cadran affichait mille quatre cents psi. L'autre : zéro.
5. À vingt et une heures quarante, la boue jaillit du plancher.
6. Vingt et une heures quarante-sept : les mâchoires du bas se ferment.
7. Mais le gaz est déjà au-dessus. Deux minutes plus tard, tout explose.
8. Le bouton d'urgence, sur la passerelle, ne répond pas.
9. Dans le bloc, une batterie était vide. Une vanne était mal câblée.
10. Les lames se sont fermées. Sur un tube qui n'était plus au centre.
11. La pression à l'intérieur du tube l'avait plié. Comme un tuyau d'arrosage.
12. Depuis 2016, un puits sous-marin doit avoir deux mâchoires cisaillantes.

## 12. Sources

1. **CSB, « Deepwater Horizon Blowout Preventer Failure Analysis » (rapport ES, 06/02/2014, 83 p.)** — https://www.csb.gov/assets/1/20/appendix_2_a__deepwater_horizon_blowout_preventer_failure_analysis1.pdf — **lu en texte (pdftotext)** : toutes les heures 15 h 56 → 22 h 19, les pressions, les débits simulés, EDS à 21 h 56, AMF avant 21 h 58, tube plié.
2. **CSB, Macondo Investigation Report Volume 2 (05/06/2014)** — https://www.csb.gov/assets/1/7/vol_2_final_version.pdf — **lu en texte** : résumé, constats 1-7, §3.2 (pods, batteries 27 V / 9 V, Y103), §3.2.3 (effective compression), §5.2.1 (cisaillement), §6 (règles BSEE).
3. **CSB, page Macondo** — https://www.csb.gov/macondo-blowout-and-explosion/ — lue : 11 morts, 126 à bord, dates de rapports, 16 recommandations.
4. **DOI, évaluation du débit (11/03/2011)** — https://www.doi.gov/news/pressreleases/Scientific-Teams-Complete-Peer-Reviewed-Assessment-of-Oil-Flow-Rate-Methodologies — lue : 4,9 millions de barils, 53 000 b/j, ± 10 %.
5. **Federal Register, 29/04/2016, 2016-08921** — https://www.govinfo.gov/content/pkg/FR-2016-04-29/html/2016-08921.htm — résumé via l'outil, **sur 100 000 caractères / 950 000** : entrée en vigueur 28/07/2016, délais de conformité.
6. **BSEE, fiche 2019** — https://www.bsee.gov/sites/bsee.gov/files/fact-sheet/bsee-fact-sheet-well-control-rule-2019.pdf — lue en texte : ce que la révision garde (double mâchoire, RTM, tiers) et change.
7. **OGJ, DNV** — https://www.ogj.com/general-interest/hse/article/17264475/government-releases-dnvs-findings-on-deepwater-horizon-bop — [S] : tube hors axe, 27 V insuffisant.
8. **Wikipedia, Deepwater Horizon explosion** — https://en.wikipedia.org/wiki/Deepwater_Horizon_explosion — [S] : 126 à bord, 7 ans sans accident, sinking, 17 blessés (divergence).
9. **Non lus** : rapport BP « Bly » (https://www.dco.uscg.mil/Portals/9/OCSNCOE/Casualty-Information/DWH-Macondo/BP/BP-DWH-Accident-Investigation-Report-2010.09.08.pdf : erreur 403) ; National Commission « Deep Water » (govinfo GPO-OILCOMMISSION : trop lourd pour l'outil) ; Chief Counsel's Report (GOVPUB-PR-PURL-gpo4390 : idem) ; rapport DNV direct ; CSB Volumes 3 et 4. À ouvrir à la main pour figer 21 h 08 / 21 h 49 et les 115 évacués avant la voix.

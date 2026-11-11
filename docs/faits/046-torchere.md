# 046 — La torchère de raffinerie : elle brûle pour que l'usine n'explose pas

Niveaux : [P] source primaire lue · [S] secondaire · [O] ordre de grandeur seulement. 27 requêtes web au total (+4 pour l'annonce 047).

## 1. Verdict sur l'angle

**Tient.** L'angle de 045 est juste et se défend : la torche est la **sortie de secours de toutes les soupapes** de l'usine ; sans elle, la soupape n'a nulle part où envoyer le gaz. Sujet pas « vu et revu » côté mécanisme (les réseaux montrent la flamme, jamais le ballon, la garde hydraulique, la purge). Attention : le public croit qu'elle « brûle pour rien » ; c'est la chute.

- **Test du spectacle** : passe. Une flamme de dizaines de mètres qui enfle d'un coup + fumée noire, lisible sans le son dès la 1re seconde (cas Fos 2017 : « large plume de fumée noire et bruit » vus depuis l'extérieur [P ARIA]).
- **Test de l'histoire** : passe si on ancre sur un riverain/une alerte (« tu vois ça de ta fenêtre à 8 h ») + un danger réel : **Milford Haven 1994** (foudre, ballon de torche débordé, collecteur de 30 pouces rompu, explosion et incendies, 26 blessés légers, aucun mort) montre ce qui arrive quand la chaîne de torche cède. Raison d'envoyer à un proche : « la flamme que tu vois, c'est le bon signe ».
- Piège : ne pas montrer une torche « idéale » ; une torche qui fume à Feyzin est un système qui **marche sous contrainte**.

## 2. La scène

**Scénario typique sourcé** : perte électrique ou panne d'un compresseur → arrêt de l'unité → il faut dépressuriser → tout part à la torche.

**Cas réel 1 (France, à la minute) — Fos-sur-Mer, 31/08/2017 [P, fiche ARIA n° 50272, lue]** :
- 16 h 30 : défaut électrique, un compresseur de l'unité de craquage catalytique (FCC) s'arrête.
- L'arrêt du FCC impose de dépressuriser les unités en aval : par procédure, les hydrocarbures gazeux vont à la torche.
- Un panache de fumée noire et du bruit sont perçus hors du site.
- 17 h 00 : compresseur redémarré ; vers 17 h 30 retour à la normale.
- Estimations exploitant : ≈ 4,2 t de SOx pendant l'arrêt (≈ 50 t au redémarrage à froid). Pas de blessé signalé.

**Cas réel 2 — Notre-Dame-de-Gravenchon (ExxonMobil), samedi 19/10/2019, ≈ 8 h [S, presse Tendance Ouest lue ; exploitant cité]** : déclenchement électrique, arrêt du vapocraqueur, torche allumée « pour dépressuriser en sécurité » ; fumée épaisse ; flamme encore visible à plusieurs km le dimanche matin ; arrêt volontaire programmé le 23/10. Pas de hauteur de flamme donnée, pas de bruit signalé (ne pas inventer le grondement ici ; il est attesté à Fos).

**Cas réel 3 (la chaîne qui casse) — Milford Haven (Texaco), 1994 [S, article IChemE 2015 lu ; rapport HSE 1997 cité, non lu]** : après un coup de foudre, redémarrage d'une unité, alarmes en cascade, le liquide déborde vers le **ballon de torche**, qui déborde à son tour ; un bouchon de liquide rompt un coude du collecteur de 30 pouces ; ≈ 20 t d'hydrocarbures libérées, explosion puis incendies. Dommages ≈ 140 M$ (valeur 2013), 26 blessés légers sur site. (Le « 3 morts » que je citais à l'oral était Augusta 2001, autre cas : **ne pas l'attribuer à Milford Haven**, qui n'a pas fait de mort.)

**À montrer** : plan basse perspective sur la flamme qui enfle ; le collecteur (grosse conduite) qui gronde ; la soupape qui s'ouvre sur une colonne ; le ballon qui garde le liquide ; la garde hydraulique où le gaz bulle ; la flamme pilote toute petite à côté du gros panache.

## 3. Le système qui sauve

Le « système de torche » est **tout un réseau** : toutes les soupapes de sûreté de l'usine débouchent dans un collecteur commun qui converge vers un ballon puis la cheminée. Il est dans chaque raffinerie et usine pétrochimique (France : Feyzin, Fos/Lavera, Gonfreville, Donges, Gravenchon…). Les exploitants ne le décrivent pas comme « poubelle » mais comme **dernière barrière**.

## 4. Le mécanisme ouvert

Source principale : IChemE Hazards 25 (Denham & Donnelly, 2015) [S/P lue] ; ISO 23251 / API 521 cités, **non lus**.

Ordre de la chaîne :
1. **Soupape de sûreté** (PSV, « soupape tarée ») : s'ouvre quand la pression dépasse son tarage ; le gaz part vers le réseau. Les disques de rupture existent aussi sur certains équipements (non traités dans ma source : ne pas détailler).
2. **Collecteur de torche** (« header ») : grosse conduite qui rassemble toutes les soupapes et les « vannes de dépressurisation ». Exemple de diamètre : un collecteur de 30 pouces (≈ 76 cm) a cassé à Milford Haven [S].
3. **Ballon de torche** (« knock-out drum ») : sépare le liquide (hydrocarbure, eau) du gaz. Sinon : « pluie » de liquide en feu (rain-out) retombant de la flamme, coups de bélier dans la conduite, extinction des pilotes [S IChemE]. Un guide cite des gouttes < 300 µm acceptées [O, source de recherche faible, ne pas dire].
4. **Garde hydraulique** (« seal drum », ballon à joint liquide) : le gaz bulle dans un tube plongeant dans un liquide ; garde la pression positive dans le réseau et **empêche le retour de flamme** de la cheminée vers l'usine [S].
5. **Gaz de purge** : deux purges, en bout de collecteur et en pied de cheminée ; elles maintiennent un petit flux continu pour que **l'air ne remonte pas** (diffusion, refroidissement de la cheminée) [S]. Air + gaz dans une conduite fermée = mélange explosif, déflagration possible [S, IChemE].
6. **Joint moléculaire / joint de vitesse** (« molecular seal », « velocity seal ») : pièce près du bout de la cheminée qui limite l'air entrant avec peu de purge [S].
7. **Flamme pilote** (plusieurs brûleurs pilotes + allumage) : toujours allumée pour enflammer immédiatement ce qui arrive. Aux USA la règle fédérale exige une flamme pilote présente quand du gaz va à la torche, surveillée en continu (thermocouple, UV ou infrarouge) [P, 40 CFR 63.670, extraits lus par recherche]. IChemE : si elle s'éteint, la torche devient un évent à l'air libre, et une réallumage tardif peut provoquer un flash fire [S].
8. **Injection de vapeur** au bout de la cheminée : les jets de vapeur aspirent l'air dans le gaz et le brassent → combustion sans fumée noire [S, brochures Zeeco/John Zink via recherche]. Trop de vapeur = « oversteaming » qui baisse le rendement et peut éteindre [S Wikipédia citant EPA ; IChemE].

**Ce qui déclenche** : surpression, ou perte d'une « utilité » (électricité, vapeur, eau de refroidissement). Les cas dimensionnant la torche sont typiquement « panne d'eau de refroidissement ou d'électricité » [S, présentation Aramco/slides].

**Délais et seuils** : temps d'ouverture d'une soupape : **non sourcé, ne pas chiffrer** (« très vite » ≈ [O] sans chiffre). Pression de tarage : **non sourcée** ; seul repère lu : contre-pression admissible d'une soupape conventionnelle ≈ 10 % de sa pression de tarage [S, recherche, non vérifié] → ne pas dire.

**Pourquoi ça marche (beat principe)** : brûler change un gaz dangereux en deux gaz peu réactifs, et c'est la seule sortie qui garde l'air dehors et la pression ouverte. Version chiffrée : le méthane brûlé devient du CO₂ ; relâché tel quel il réchauffe **environ 30 fois plus** que son poids de CO₂ sur 100 ans (GWP100 fossile 29,8, IPCC AR6 tab. 7.15 [S, via secondaires ; non lu à la source IPCC]). Formulation sûre : « une trentaine de fois ».

## 5. Chiffres

| Chiffre | Niveau |
| --- | --- |
| Fos 2017 : défaut électrique 16 h 30, compresseur relancé 17 h, normal ≈ 17 h 30 | [P ARIA] |
| Fos 2017 : ≈ 4,2 t de SOx à l'arrêt (estimation exploitant) | [P ARIA, estimation exploitant] |
| Gravenchon : 19/10/2019 ≈ 8 h, visible à plusieurs km le lendemain | [S presse] |
| Milford Haven 1994 : ≈ 20 t libérées, collecteur 30 pouces, 140 M$ (2013) | [S IChemE] |
| Poza Rica (Mexique) 1951 : torche éteinte > 20 min, 22 morts, 320 hospitalisés (gaz toxique, H₂S) | [S IChemE] |
| Rayonnement : 1,58 kW/m² = seuil continu admis pour le personnel (ISO 23251/API 521) | [S IChemE + Wikipédia] ; 4,73 kW/m² ≈ 3-4 min ; 6,31 ≈ 30 s [S Wikipédia/Honeywell] |
| Hauteur : fixée par le rayonnement maxi toléré, pas par un standard | [S IChemE, Argoflares] |
| Hauteur d'une structure réelle : un cas de torche à 112 m (étude raffinerie indienne) ; Feyzin : travaux « à plus d'une centaine de mètres » | [O] |
| Flamme observée à Feyzin lors d'un incident : 20 à 30 m, jugée anormalement haute | [S presse, via recherche] |
| Rendement de combustion : **98 %** supposé par l'EPA/industrie ; mesure aérienne (≈ 300 torches, Permian/Eagle Ford/Bakken) ≈ **91 %**, torches éteintes ou mal brûlantes comprises (Plant et al., Science, 30/09/2022) | [S, presse scientifique ; étude non lue] — **gaz de champ pétrolier US, pas raffinerie : ne pas transposer** |
| GWP méthane fossile 29,8 (100 ans) ; ≈ 82,5 (20 ans) | [S] |
| Vapeur « bas » : un fabricant annonce -35 % de vapeur nécessaire avec injection basse | [S, brochure Zeeco] |
| Débit en urgence, tarage, ouverture soupape | **non trouvés** : à dire sans chiffre |

## 6. Candidates de chute

1. **« Elle ne brûle pas pour rien : elle brûle pour que le gaz ne reste pas dans les tuyaux. »** Retourne « pétrole gâché » → « dernière barrière ». Sourcé : toutes les soupapes y débouchent [S IChemE].
2. **« Ce n'est pas quand la flamme est grosse qu'il faut s'inquiéter : c'est quand elle est éteinte. »** Flame-out = évent à l'air libre, réallumage = flash fire ; Poza Rica [S IChemE]. Chute forte, vraie.
3. **« La flamme la plus importante est minuscule : le pilote, allumé jour et nuit. »** Sourcé (règle fédérale US, IChemE) ; la voix reste factuelle.
4. Plus technique : « le gaz ne vaut pas d'être sauvé, c'est l'air qu'il faut empêcher d'entrer. » (purge) [S].

## 7. Question du commentaire (fermées, un mot)

- « Une torchère qui fume : bon signe… ou mauvais signe ? » (réponse vraie : en général, signe que le système travaille ; la fumée vient de la combustion incomplète, la vapeur la réduit)
- « La flamme pilote d'une torchère : allumée en permanence… ou seulement en urgence ? » (réponse : en permanence)
- « De ta fenêtre, tu vois une grosse flamme de raffinerie : tu te mets à l'abri… ou tu restes ? » (à vérifier avec l'exploitant ; Gravenchon : pas de plan d'opération interne déclenché ; réponse prudente, ne pas la trancher dans le film)

## 8. L'histoire du système

Les torches existent dès les débuts de la pétrochimie ; le réseau « collecteur-ballon-garde-purge-pilote » est codifié dans API 521 et ISO 23251 (2006) [non lues, citées par IChemE]. Dates précises non vérifiées. Les accidents ont forgé les règles : Grangemouth 1987 (2 morts, travaux sur ligne de torche), Milford Haven 1994, Augusta 2001 [S IChemE].

## 9. Pour l'annonce

**Un seul fait sûr (fin du film précédent)** : « Quand une usine s'arrête d'un coup, tout son gaz part dans une seule et même conduite : celle de la torche. »
**Pour l'annonce du 046 elle-même (après « Abonne-toi : »)** : voir section « Pour l'annonce du 047 ».

## 10. À ne pas dire

- « La torchère brûle du pétrole en permanence pour rien » : faux. Le **torchage de routine** (gaz des champs pétroliers brûlé faute d'infrastructure) est un autre sujet ; la torche de raffinerie sert de **sécurité** (+ petite combustion de gaz de purge).
- « 98 % de rendement » : valeur supposée par l'EPA, **contestée** (91 % sur un échantillon de champs US). Jamais comme « mesuré en raffinerie ».
- Pas de hauteur « typique » chiffrée : aucune source primaire lue (112 m = un cas). Dire « plusieurs dizaines de mètres, parfois plus de cent ».
- Pas de temps d'ouverture de soupape ni de pression de tarage ni de débit.
- Ne pas dire que Milford Haven a fait des morts (non).
- Ne pas dire que la fumée noire est « le gaz toxique » : c'est du carbone suie (combustion incomplète) ; les SOx sont invisibles. Ne pas prêter la panne de Fos à un seul coupable : « défaut électrique ».
- Attention au conflit presse Gravenchon : la presse parle d'une chaudière vapeur, l'exploitant d'un déclenchement électrique ; dire « une panne » seulement.
- Sources françaises « TotalEnergies tarage » non trouvées.

## 11. Ce que la voix peut dire (≈ 8 mots)

1. Toutes les soupapes de l'usine débouchent au même endroit.
2. Ce point d'arrivée s'appelle le collecteur de torche.
3. Avant la flamme, un ballon retient le liquide.
4. Sinon, de l'hydrocarbure en feu retomberait en pluie.
5. Une garde hydraulique empêche la flamme de redescendre.
6. Un petit flux de gaz empêche l'air de remonter.
7. Air et gaz dans un tuyau, c'est une bombe.
8. La flamme pilote reste allumée jour et nuit.
9. De la vapeur au bout du tube limite la fumée noire.
10. Brûler le méthane le change en CO2, bien moins nocif.

(Phrases vraies selon IChemE/Wikipédia/EPA ; phrase 10 : « bien moins » = GWP ≈ 30 contre 1, [S].)

## 12. Sources (ce que j'y ai lu)

- ARIA n° 50272, Fos 2017 : https://aria.developpement-durable.gouv.fr/accident/50272 — lue, chronologie. [P]
- Tendance Ouest, Gravenchon : https://www.tendanceouest.com/actualite-338397-notre-dame-de-gravenchon-la-torchere-declenchee.html — lue. [S]
- IChemE Hazards 25, Denham & Donnelly 2015 : https://www.icheme.org/media/8462/xxv-paper-15.pdf — lue (PDF extrait en local) : composants, purge, air, flame-out, Milford Haven. [S/P académique]
- Wikipédia Gas flare : https://en.wikipedia.org/wiki/Gas_flare — lue (composants, rayonnement). [S]
- 40 CFR 63.670 (Cornell) : https://www.law.cornell.edu/cfr/text/40/63.670 — vue seulement par extraits de recherche, **page non ouverte**.
- Plant et al., Science 2022 (via EurekAlert) : https://www.eurekalert.org/news-releases/965945 — extraits de recherche, non ouvert ; étude non lue.
- GWP IPCC AR6 : via Muñoz 2024 (ERL), **non lu à la source IPCC**.
- Zeeco / John Zink : brochures vues par résultat de recherche seulement.
- Non lues : API 521, ISO 23251 (payantes) ; INERIS Oméga 8 (non consulté) ; EPA flares.pdf (erreur 403) ; AIChE CEP (403) ; Techniques de l'Ingénieur (payant).

## Pour l'annonce du 047

Sujet : canot de sauvetage à chute libre.

- **Obligation SOLAS** : la résolution MSC.152(78) (adoptée 20/05/2004) entre en vigueur le **1er juillet 2006** [P, lue, mais son extrait lu ne porte que sur les exercices ; le texte III/31 lui-même n'a pas été lu]. Un document IACS (SSE 11/4/2) [S] indique que les règles sur les canots à chute libre de vraquiers visent les vraquiers **construits à partir du 1er juillet 2006** (SOLAS III/31.1.8). Steamship Mutual 2006 [S] parle de canot « obligatoire » ; l'Institut nautique britannique écrit « recommandé » (III/31.1.2) : **conflit de sources, formulation prudente**.
- **Hauteur de chute** : **non trouvée**. Seul repère [S, résumé] : le canot doit résister à une chute depuis **1,3 fois la hauteur de chute certifiée**, plein. La « hauteur certifiée maximale » : non trouvée.
- **Sièges face à l'arrière** : **non vérifié** (non trouvé).

Phrase d'annonce (16 mots, dite après « Abonne-toi : prochain dossier, ») :
« les vraquiers neufs, depuis juillet 2006, embarquent un canot qu'on lâche dans le vide, équipage dedans. »
Niveau : [S] (IACS + Steamship Mutual ; la nuance « obligatoire/recommandé » reste ouverte). Variante plus sûre si doute : « le canot qu'on lâche dans le vide, avec tout l'équipage sanglé dedans. »

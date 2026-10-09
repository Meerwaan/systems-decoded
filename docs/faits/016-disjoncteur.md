# Dossier de faits — 016 Disjoncteur divisionnaire (magnéto-thermique modulaire, logement français)

Recherche du 2026-10-09. Format : fait — valeur — phrase de la source — URL — niveau (A primaire lu · B secondaire sérieux · C faible).
Budget : 28 requêtes sur 30 (recherches + pages). Pages en échec : ABB (deux timeouts), 123elec (corps tronqué), CNRS Bauchire (certificat). Le catalogue Hager Belgique a été extrait en local (pdftotext). Mention « résumé de recherche, non lu » = vu seulement dans le résumé du moteur. **La norme NF EN 60898-1 elle-même n'a pas été lue (payante).**

## 1. Le mécanisme, pièce par pièce

- **Thermique (bilame) = surcharge.** Legrand FAQ : le bilame est formé de « deux lames (dispositif bilame) qui vont se dilater sous l'effet de la chaleur » ; réaction « de 2 min à plusieurs min ». Cours enseignons.be (document de formation, lu) : « Une lame bimétallique (bilame) est parcourue par le courant », réglée pour ne pas se déformer au courant nominal. — https://www.legrand.fr/questions-frequentes/comment-fonctionne-un-disjoncteur-en-cas-de-surcharges-electriques ; https://www.enseignons.be/preparation/download/63443 — **A (Legrand) / B (cours)**. Le bilame est chauffé par effet Joule par le courant lui-même (résumé de recherche, plusieurs sites, non lu — C).
- **Magnétique (bobine) = court-circuit.** Legrand : « Un court-circuit se caractérise par l'augmentation soudaine de courant électrique (plusieurs milliers d'ampères) » ; magnétique « déclenchement < 0,02 s » — **A**. Cours enseignons.be : « le courant de court-circuit provoque une violente aimantation de l'armature mobile » (le cours dit « armature mobile », pas « noyau » ni « percuteur ») — **B**. Le « percuteur / marteau lié au plongeur qui frappe la lame de contact » : fiche Havells (résumé de recherche, non lue) — **C**.
- **Déclenchement libre** : « the breaker trips internally even if the operating knob is held in ON position » — manuel de constructeur, vu dans un résumé de recherche (non lu) — **C**. Aucune source française lue ne l'explique. Le mécanisme (verrou à ressort armé par la manette, déclencheurs qui le libèrent) : non sourcé, simplification de modélisation.
- **Chambre de coupure** : « Le but de cette chambre est de couper le plus rapidement possible l'arc électrique. » ; à la séparation des contacts la force de Laplace pousse l'arc vers la chambre, « l'arc est canalisé entre deux joues qui permettent » d'accélérer, guider et allonger l'arc — cours enseignons.be — **B**. Empilement de plaques métalliques isolées qui « divide and cool the arc » : fractionner l'arc augmente sa tension, qui limite le courant ; 11 à 13 plaques sur des fiches de fabricants — résumé de recherche, non lu — **C**. CNRS (support Bauchire) : même logique, allonger, fractionner, refroidir — résumé, non lu (certificat) — **C+**.
- **Température de l'arc** : sources discordantes — « jusqu'à 20 000 °C » (viox.com) ; « 15 000 à 30 000 °C » (tableau du même site) ; un cours universitaire parle de « quelques milliers à plusieurs dizaines de milliers » de degrés — résumés de recherche, non lus — **C**. À ne dire qu'en ordre de grandeur (« des milliers de degrés »).
- **Temps de coupure d'un court-circuit** : Legrand « < 0,02 s » — **A** ; le cours enseignons.be donne « 0,1 s au maximum » (pour la zone magnétique, plus conservateur) — **B**. Un temps de limitation plus court (≈ quelques ms) : non trouvé en source lue.

## 2. Les seuils de la norme

- **Magnétique**, NBN EN 60898-1 (domestique) — catalogue Hager Belgique 2025 : « B : 3 à 5 In · C : 5 à 10 In · D : 10 à 20 In » — https://assets1.sc.hager.com/belgique/pdf/Disjoncteurs_modulaires.pdf — **A** (fabricant, texte extrait). Cours enseignons.be : courbe B « entre 3 et 5 x In » — **B**. Attention : en CEI 60947-2 (industriel) les plages sont autres (B 3,2–4,8 ; C 7–10 ; D 10–14 In) — résumé CERN/Schneider, non lu — **C**. Pour un logement : la plage domestique ci-dessus.
- **Thermique** : Hager (même catalogue) : « les valeurs thermiques sont inchangées soit 1,13 In à 1,45 In » (en continu) — **A**. Schneider Acti9 FAQ FA369327 (lu) : CEI 60898-1 « Conventional non-tripping current 1.13 x In ; Conventional tripping current 1.45 x In ; Conventional time 1 h » (réf. 30 °C) — https://www.se.com/de/de/faqs/FA369327/ — **A**. ABB catalogue : 1,13 In > 1 h (résumé, non lu) — C.
- **2,55 In (1 s à 60 s)** : **non confirmé par une source lue.** Valeur de mémoire de la CEI 60898-1 (déclenchement entre 1 s et 60 s à 2,55 In pour In ≤ 32 A). Ne pas l'afficher sans la norme.
- **Temps à ≈ 1,5 In / C16 à ≈ 25 A d'après une courbe de fabricant : non trouvé.** Calcul : 25 A = 1,56 In pour un 16 A, au-dessus de 1,45 In : la norme impose un déclenchement en moins d'une heure ; le temps réel (minutes) vient de la courbe du produit, non lue.
- **Pouvoir de coupure** : Legrand (guide de choix) : « généralement de 3 kA ou 4,5 kA » pour le domestique — résumé de recherche, non lu — **C+** ; fiche Eaton/Weldom : « Icn = 4 500 A » selon EN 60898-1 — résumé — C. Hager Belgique : 3 kA (MWS/MWN), 6 kA (MBA/MCA) — **A** (catalogue belge). Définition : « C'est l'intensité maximale du courant de court-circuit que peut couper le dispositif de protection sans se détériorer » ; il doit être « au moins égal au courant de court-circuit présumé » — cours enseignons.be — **B**.
- **Ordre de grandeur d'un court-circuit dans un logement** : « plusieurs milliers d'ampères » (Legrand, **A**). Valeur Enedis au tableau : non trouvée.

## 3. Ce qu'il protège : les câbles, pas les personnes

- Legrand : « La coupure au niveau du disjoncteur permet d'éviter les échauffements qui risquent d'endommager les circuits. » — **A**.
- Cours enseignons.be : « Le disjoncteur de canalisation n'assure que la protection des lignes » — **B**.
- Résumé de recherche (Legrand/EDF, non lus) : l'interrupteur différentiel est « conçu pour protéger les personnes » ; le disjoncteur « protège uniquement les circuits contre les surcharges et les courts-circuits » — **C+**. Seuil de 30 mA des logements fixé par la NF C 15-100 — résumé, non lu. **Attention : Legrand écrit aussi que le disjoncteur « protège les biens »** : à citer ainsi, pas « protège les gens ».

## 4. NF C 15-100 dans un logement

- Hager (page normes, lue) — https://hager.com/fr/normes/nfc-15-100/disjoncteur — **B/A** (fabricant) :
  - Éclairage : 1,5 mm², « 16 A » au plus, 8 points lumineux.
  - Prises 16 A : 1,5 mm² → 16 A (8 prises max) ; 2,5 mm² → 20 A (12 prises max) ; cuisine dédiée : 6 prises sur 2,5 mm².
  - Volets roulants : 1,5 mm², 16 A max.
  - Plaque de cuisson : 32 A monophasé (la page ne donne pas la section ; 6 mm² est donné par Legrand/Engie, résumé non lu — C+).
  - Lave-linge, lave-vaisselle, sèche-linge, four : un circuit 16 A chacun (2P+T).
  - Chauffage : 16 A / 1,5 mm² (3 500 W) ; 20 A / 2,5 mm² (4 500 W) ; 25 A / 4 mm² ; 32 A / 6 mm².
  - « L'installation de coupe-circuits (fusibles, plombs ou cartouches cylindriques) est désormais interdite » (sans date).
- Ce qui a changé récemment : non trouvé (la page Legrand « norme 2026 » n'a pas été lue).
- **Surcalibrage** : « surdimensionner le disjoncteur peut entraîner une surchauffe des fils avant que le disjoncteur ne se déclenche » ; « n'employez jamais un… disjoncteur de calibre supérieur à celui d'origine » — résumé de recherche (guides grand public, pas officiel) — **C**. Legrand FAQ lue ne traite pas le surcalibrage.
- **Consigne quand « ça saute »** — Legrand FAQ (lue) : « Pour toute odeur de brûlé, échauffement inhabituel ou déclenchements répétés, laissez hors tension, ne forcez pas le réarmement » ; causes : « surcharge ou surintensité, court-circuit ou défaut d'isolement » ; débrancher les appareils suspects avant de réarmer — https://www.legrand.fr/questions-frequentes/que-faire-quand-un-disjoncteur-saute-ou-ne-se-rearme-pas — **A**. Aucune page officielle (Promotelec, Consuel, service-public) lue.

## 5. Sans lui

- Isolant PVC : 70 °C en fonctionnement, 160 °C en court-circuit (5 s au plus) — Prysmian (H05V-K, NYM) et BS 6004, vus dans un résumé de recherche, non lus — **C+**. Entre 70 et 160 °C : vieillissement accéléré, pas de cinétique chiffrée trouvée.
- **ONSE** (question écrite du Sénat, 09/05/2024, lue) : « 20 à 35 % des incendies d'habitation sont d'origine électrique » ; « 55 % des incendies d'origine électrique seraient causés par des comportements humains », 45 % composants défectueux ou vétustes — https://www.senat.fr/questions/base/2024/qSEQ240511619.html — **B** (baromètre 2024 cité par un sénateur ; source ONSE non lue). Économie Matin (baromètre 2025, résumé) : 35 % en 2022 — C. Un nombre d'incendies électriques précis : non trouvé (80 000 incendies domestiques par an dont 25 % électriques selon Que Choisir, résumé — C).

## 6. Scénario de surcharge

- 16 A × 230 V = **3 680 W** — calcul, repris par des fiches fabricants — **A (calcul)**.
- Puissances typiques (ordres de grandeur, non sourcés par une page lue ; à vérifier sur plaques signalétiques) : bouilloire ≈ 2 200 W (≈ 9,6 A) ; radiateur d'appoint ≈ 2 000 W (≈ 8,7 A) ; four ≈ 3 000 W (≈ 13 A) — **C**. Bouilloire + radiateur = 4 200 W ≈ 18,3 A, soit 1,14 In pour un 16 A : le seuil des 1,13 In est tout juste dépassé, le disjoncteur peut tenir très longtemps. Il faut ≈ 23 A (1,45 In) pour qu'il doive couper en moins d'une heure.
- Temps réel d'un C16 à 25 A : **non trouvé** (courbe de fabricant non lue).

## 7. Histoire

- Hugo Stotz (Mannheim) et son directeur du développement Heinrich Schachtner : idée de combiner un déclencheur électromagnétique instantané (court-circuit) et un déclencheur thermique à bilame retardé (surcharge) dans un seul appareil, remis en service à la main, contrairement au fusible. **Invention et dépôt en 1924 (novembre)**, brevet accordé en avril 1928 (VDE), **production en série en 1928** (ABB, page d'histoire) — résumé de recherche (VDE, ABB, meile-der-innovationen.de), pages ABB non lues (timeout) — **C+/B**. Fusion Stotz-Kontakt en 1930. Stotz meurt en 1935.
- « Premier disjoncteur miniature » : formule des sources allemandes (Sicherungsautomat) ; « le premier au monde » n'est pas contre-vérifié.

## 8. Vocabulaire

- **Disjoncteur divisionnaire** (modulaire, protège un circuit, au tableau) ≠ **disjoncteur de branchement** (en tête, après le compteur, propriété du distributeur ; Legrand/Enedis « disj. branchement » — non lu). **Interrupteur différentiel** : protège les personnes (30 mA), ne protège pas contre la surcharge ; **disjoncteur différentiel** : les deux dans un seul module (Legrand, résumé non lu).
- Calibre (en ampères, In), courbe B/C/D, pouvoir de coupure (en kA), chambre de coupure, bilame, manette. Module de 17,5 mm (« 18 mm ») : non vérifié.

---

## À dire tel quel
- Le disjoncteur a deux déclencheurs : un bilame qui chauffe pour la surcharge, une bobine qui réagit au court-circuit (Legrand).
- Magnétique : B 3 à 5 In, C 5 à 10 In, D 10 à 20 In (catalogue Hager, norme domestique).
- Thermique : jusqu'à 1,13 In il ne déclenche pas ; à 1,45 In, il doit couper en moins d'une heure (Schneider, Hager).
- « Un court-circuit : plusieurs milliers d'ampères » ; la bobine déclenche en moins de 0,02 s (Legrand).
- Il protège les câbles (« éviter les échauffements qui risquent d'endommager les circuits »), pas ton corps : ça, c'est le différentiel 30 mA.
- Un 16 A sous 230 V : 3 680 W.
- Quand il saute à répétition : ne force pas le réarmement, laisse hors tension, appelle un électricien (Legrand).
- « 20 à 35 % des incendies d'habitation sont d'origine électrique » (ONSE, baromètre 2024, cité au Sénat).
- Stotz, Mannheim : idée de 1924, production en série en 1928.

## Ordres de grandeur (à dire avec « environ »)
- Surcharge : plusieurs minutes au seuil de 1,45 In ; court-circuit : moins de 0,02 s.
- Arc : des milliers de degrés (les sources vont de 15 000 à 30 000 °C, non fiables).
- Court-circuit en logement : plusieurs milliers d'ampères ; pouvoir de coupure domestique 3 à 6 kA (4,5 kA courant).
- Isolant PVC : 70 °C en service, 160 °C en court-circuit.
- Bouilloire ≈ 2 200 W, radiateur d'appoint ≈ 2 000 W, four ≈ 3 000 W.

## À ne pas dire
- « 2,55 In en 1 à 60 secondes », « 1,5 In en tant de minutes » : non lu, non confirmé.
- « Le disjoncteur protège les personnes » ; « il te sauve de l'électrocution » (c'est le différentiel).
- Une température d'arc précise (sources discordantes) ; « le disjoncteur coupe en 1 ms » (non trouvé).
- « Le premier disjoncteur du monde » sans nuance ; « inventé en 1924 » sans dire « idée, dépôt » (production 1928).
- Une règle officielle sur le surcalibrage (seulement des guides grand public).
- « Module de 17,5 mm » ; calibre de la plaque de cuisson en 6 mm² comme texte de la norme (non lu).
- « Tous les logements » ; « 30 % des incendies » sans la fourchette 20 à 35 %.
- Mélanger disjoncteur divisionnaire, disjoncteur de branchement, différentiel.

## Trois faits-accroche
1. Un 16 A tient 3 680 W : une bouilloire et un radiateur d'appoint, ensemble, le dépassent (calcul, **A**) — mais il ne coupe pas tout de suite : à 1,13 In il ne doit pas déclencher (Schneider, **A**).
2. Un fusible se jette ; le disjoncteur de 1924 (Stotz) se réarme : un bilame pour la surcharge, une bobine pour le court-circuit (ABB/VDE, **C+**).
3. 20 à 35 % des incendies d'habitation sont d'origine électrique (ONSE via Sénat, **B**).

## Non trouvé
Norme NF EN 60898-1 lue ; temps à 2,55 In ; temps réel d'un C16 à 25 A (courbe de fabricant) ; température de l'arc fiable ; temps de coupure en ms ; courant de court-circuit présumé Enedis ; consigne officielle sur le surcalibrage et sur « ça saute » (Promotelec, Consuel, ministère) ; changements récents de NF C 15-100 ; module de 17,5 mm ; page ABB d'histoire lue ; part des incendies pour 2023.

## URL lues
hager.com/fr/normes/nfc-15-100/disjoncteur · assets1.sc.hager.com/belgique/pdf/Disjoncteurs_modulaires.pdf (pdftotext) · se.com/de/de/faqs/FA369327 · legrand.fr/…/comment-fonctionne-un-disjoncteur-en-cas-de-surcharges-electriques · legrand.fr/…/que-faire-quand-un-disjoncteur-saute-ou-ne-se-rearme-pas · enseignons.be/preparation/download/63443 · senat.fr/questions/base/2024/qSEQ240511619.html.

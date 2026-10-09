# Dossier de faits — 012 Sécurité de flamme d'une gazinière / table de cuisson à gaz (« sécurité thermocouple »)

Recherche du 2026-10-08. Format : fait — valeur — phrase de la source (dans sa langue) — URL — niveau.
Niveaux : **A** = norme, fabricant, organisme officiel, texte de loi (lu) · **B** = secondaire sérieux (encyclopédie, distributeur de pièces, fournisseur d'énergie, fiche de sécurité) · **C** = faible, à ne pas mettre dans le script.
Fichier écrit au fur et à mesure. Sections finales (à dire tel quel, ordre de grandeur, à ne pas dire, trois faits-accroche, non trouvé, URL lues) en bas.
Budget : 31 requêtes (recherches + pages ouvertes) pour un plafond de 30 — dont 6 sans contenu utile (GRDF ×2 et Engie : 403 ; INRS : erreur de certificat puis mauvaise fiche ; page de catalogue de normes vide) et 8 recherches dont le résumé est le seul texte vu. Les PDF (ministère de l'Intérieur 2009, BARPI/ARIA, SABAF, AIL, GRDF-Cegibat) ont été extraits en local avec pdftotext, pas seulement résumés. Les pages de normes (EN 30-1-1, EN 125) sont payantes : leurs valeurs limites n'ont pas pu être lues.
**Attention aux « résumés de recherche »** : l'outil de recherche renvoie un résumé rédigé, pas la page. Ce que j'ai tiré seulement d'un tel résumé est marqué « résumé de recherche, non lu » et jamais classé A sans réserve. Un de ces résumés a même attribué à la fiche GRDF une phrase sur l'« ionisation de flamme » que le texte réel de la fiche ne contient pas.

Vocabulaire : « sécurité thermocouple » = en normes **dispositif de surveillance de flamme thermoélectrique** (« thermoelectric flame supervision device », EN 125) ; en anglais courant « flame failure device » (FFD) ; « groupe magnétique » = en anglais « magnet unit » / « safety magnet » (l'électroaimant + l'armature, dans le robinet) ; « LIE / LSE » = limites inférieure / supérieure d'explosivité ; PCI = pouvoir calorifique inférieur.

---

## 1. Le mécanisme, pièce par pièce

### 1.1 Le thermocouple : deux métaux, une pointe dans la flamme, quelques millivolts
- Fait : la pointe du thermocouple est placée dans la flamme ; elle produit une tension qui sert à garder la vanne de gaz ouverte.
- Phrase (Wikipédia EN, « Thermocouple », rubrique sécurité des appareils à gaz) : « The tip of the thermocouple is placed in the pilot flame, generating a voltage which operates the supply valve. » — URL : https://en.wikipedia.org/wiki/Thermocouple — niveau **B**.
- Effet : effet Seebeck (une force électromotrice naît entre deux points d'un conducteur à des températures différentes) ; pour un type K, « about 41 μV/°C » ; les tensions de thermocouple sont « in the microvolt range » par degré — même page — **B**. (Le thermocouple d'une gazinière n'est pas un type K : voir 1.2.)
- Chiffres pour un thermocouple de sécurité de robinet « Honeywell » : « 25 mV open circuit falling by half » quand la bobine est chargée ; « 10–12 mV, 0.2–0.25 A source, typically » pour tenir la vanne — Wikipédia EN, même page, section gaz — **B** (chiffres d'un modèle de veilleuse, pas d'une table de cuisson précise).

### 1.2 De quoi est-il fait ? (distributeur de pièces, pas une norme)
- Fait : branche positive **Ni90Cr10** (nickel-chrome), branche négative **constantan** (cuivre-nickel) ; rendement de tension d'environ **5,5 mV par 100 °C**, **maximum d'environ 30 mV** ; température maximale de la pointe d'environ **650 °C** ; temps d'ouverture 1 à 3 s, temps de fermeture 60 à 90 s.
- Source : fiche produit du thermocouple universel OEG (distributeur de pièces d'électroménager) : lue via l'outil de lecture (tableau « Parameter / Value ») — URL : https://www.oeg.net/oeg-universal-thermocouples-g133466000 — niveau **B** (fiche d'un composant de rechange, ne cite pas de norme).
- Un forum cité en résultat de recherche donne « une vingtaine de mV à vide, une dizaine en fonctionnement » — **C**, non lu.

### 1.3 Le « groupe magnétique » : un électroaimant qui RETIENT, mais n'attire pas
- Fait 1 (le fonctionnement dans la vanne) : « To turn the valve on, simultaneously press and turn the control shaft. » ; « A few seconds after the burner ignites, the thermocouple generates enough current to hold the safety magnet open. The control shaft needs no longer be pressed down. » ; « If the flame should accidentally go out, the thermocouple cools and the current is reduced, the safety magnet is closed and the flow of gas is blocked after a few seconds. »
  - Source : SABAF (l'un des deux grands fabricants de robinets de tables de cuisson), notice « Model 16C — 2-outlets manually-operated gas valve with flame surveillance device for cooking appliances » (rev. 00, février 2018), extraite en local — URL : https://www.sabaf.it/sites/default/files/allegati/user%20manual%20mod%2016C%20rev%2000%20feb%2018%20CE.pdf — niveau **A**. Applications citées dans la notice : « hot plates, ovens, grills etc ». Normes citées : EN 126:2012, EN 13611:2007+A1:2011, EN 437:2003+A1:2009.
- Fait 2 (courant de tenue) : la notice Sabaf 16C donne, pour le « hold-on current / drop-out current (safety device) », trois versions : « < 180 mA / > 60 mA (version 1) », « < 110 mA / > 20 mA (version 2) », « < 60 mA / > 10 mA (version 3) ». **Lecture d'un tableau dont la mise en page est brouillée** (étiquettes et valeurs décalées) : à citer comme « de l'ordre de quelques dizaines à une centaine de milliampères », pas comme une ligne précise. Niveau **A** pour l'ordre de grandeur.
- Fait 3 (l'électroaimant ne sait que retenir) : la bobine alimentée par le thermocouple est dimensionnée « to be able to hold the valve open against a light spring » ; la vanne ne s'ouvre « only after the initial turning-on force is provided by the user pressing and holding a knob » ; le courant de tenue est bien inférieur à ce qu'il faudrait pour attirer la vanne depuis la position fermée — Wikipédia EN, « Thermocouple » (résumé de la section gaz par l'outil de lecture ; formulations à vérifier avant citation mot à mot) — **B**. Cohérent avec Sabaf (fait 1 : c'est la main qui ouvre en appuyant, l'aimant ne fait que tenir).
- **Réponse à la question « trop faible pour attirer, ne peut que retenir » : EXACT** (A pour le fonctionnement décrit par Sabaf, B pour la formule « sized to hold, not to pull in »). C'est pour ça qu'il faut appuyer à l'allumage : la main amène l'armature au contact de l'aimant et ouvre le passage ; l'aimant la garde ensuite.
- Où est-il ? Dans le corps du robinet de chaque brûleur (la notice Sabaf décrit une vanne à boisseau conique « 2 - conical plug valve » avec le dispositif de surveillance dans la même pièce) ; le thermocouple relié par un fil à la vanne : « The thermocouple must be positioned in correspondence of the burner connected with the valve's first outlet. » — Sabaf — **A**. (Un thermocouple par brûleur.)

### 1.4 « Aucune électricité extérieure n'est nécessaire » ? — oui pour la sécurité, mais pas pour toute la table
- Fait : le dispositif thermoélectrique est alimenté **par la chaleur de la flamme** ; il n'a besoin ni de la prise ni d'une pile pour tenir le robinet ouvert ni pour le fermer. La norme EN 125 concerne les dispositifs thermoélectriques (le résumé de l'outil de recherche précise qu'elle exclut les dispositifs qui utilisent une énergie auxiliaire, par exemple électrique fournie de l'extérieur) — pages de catalogue de normes (BSI, Sist, etc.) — **B**.
- Mais **l'allumage** d'une table moderne (étincelle) utilise une pile ou le secteur ; et d'autres tables (voir 4.3) ont une surveillance **électronique** (réallumage automatique, électrode d'ionisation) qui, elle, a besoin d'électricité.
- => On peut dire « la sécurité n'a besoin ni de prise ni de pile : c'est la flamme qui la fabrique ». On ne dit pas « sans électricité » (le thermocouple FAIT de l'électricité) ni « toutes les tables ».

---

## 2. Pourquoi il faut garder le bouton enfoncé à l'allumage

- Fait : tant que la pointe n'est pas chaude, le thermocouple ne donne pas assez de courant ; la main maintient l'armature contre l'aimant pour que le gaz passe jusqu'à ce que la flamme ait chauffé la pointe.
- Phrase (Sabaf) : « Holding down the control shaft and turning it anti-clockwise allows the gas to pass to the burner. » + « A few seconds after the burner ignites, the thermocouple generates enough current to hold the safety magnet open. » — notice 16C (voir 1.3) — **A**.
- Phrase (AIL, Aziende Industriali di Lugano, distributeur d'énergie suisse, fiche « Informazione AIL » pour les propriétaires de cuisinières, 2022) : « appena accesa la fiamma del fornello è necessario tenere premuta per alcuni secondi la manopola del gas. Se non si tiene premuta la manopola la fiamma si spegne » — URL : https://www.ail.ch:443/dam/jcr:afdb22c4-8e0f-4cd8-9007-57fd5bb65122/Cucine%20a%20gas%20info.pdf — niveau **A-** (opérateur de réseau, document suisse ; extrait en local avec pdftotext).
- **Durée** : « quelques secondes » (Sabaf, AIL) — **A**. Fiche thermocouple OEG : temps d'ouverture 1 à 3 s — **B**. Un fournisseur britannique d'équipement de cuisine (gasproducts.co.uk, résumé de recherche, page non lue) parle d'« up to 30 seconds » à l'extrême — **C**. Des guides de dépannage et forums cités en résultat de recherche : 5 à 10 s, voire 15 à 20 s — **C**.
- **Maximum de la norme (EN 125 / EN 30-1-1)** : **non trouvé** (textes payants, non accessibles).
- Pourquoi si longtemps : la pointe du thermocouple a une inertie thermique ; un brevet de table de cuisson (US 6 698 417, résultat de recherche non lu) attribue la fermeture lente à l'inertie thermique du thermocouple et note que si l'utilisateur lâche trop tôt « la flamme s'éteint » — **C** (non lu).

---

## 3. Flamme éteinte : combien de temps avant que le gaz se coupe ?

- **Fait** : la notice Sabaf 16C donne un **temps de fermeture maximal des thermocouples de 90 secondes** (« Themocouples maximum closing time » — faute de frappe d'origine — la valeur « 90 sec » apparaît dans la même ligne du tableau, mise en page brouillée) et dit dans le texte : « blocked after a few seconds » — URL ci-dessus — **A** (fabricant, tableau lu en local ; la correspondance étiquette/valeur est une lecture de mise en page : je la tiens pour fiable parce que « 90 sec » est la seule valeur de durée du tableau et qu'elle est placée sous « Flame supervisor device continued operation »).
- La fiche du thermocouple OEG : temps de fermeture « 60 à 90 secondes » — **B**.
- AIL (Suisse) : « la termocoppia chiuderebbe immediatamente l'erogazione di gas » — c'est une formule de vulgarisation : à ne pas reprendre (voir « À ne pas dire »). **A-** pour l'idée, **faux pris à la lettre** (la source de fabricant dit « few seconds » et jusqu'à 90 s).
- Un brevet (US 4 318 687, résultat de recherche non lu) cite des conceptions anciennes qui mettaient 10 à 20 s, et jusqu'à 22 s, à couper — **C**.
- **Maximum de la norme EN 30-1-1 pour une table de cuisson et pour un four** : **non trouvé**. Les valeurs « 60 s / 90 s » circulent (code de New York : « the main gas valve shall close automatically within 90 seconds after flame failure » pour les brûleurs de moins de 400 000 Btu, résumé de recherche, texte américain, hors sujet pour la France) — **C** pour la France. Ne pas écrire « 60 secondes selon la norme ».
- **Température de la pointe du thermocouple** : « max. temperature at tip approx. 650 °C » (OEG) — **B** (limite de la pièce, pas la température en service). **Température de flamme** : **non sourcée** ici.

---

## 4. Réglementation

### 4.1 Le texte européen en vigueur
- Fait : le **règlement (UE) 2016/426** sur les appareils brûlant des combustibles gazeux est **applicable à partir du 21 avril 2018** et **abroge la directive 2009/142/CE** ; les appareils conformes à la directive précédente et mis sur le marché avant le 21 avril 2018 peuvent continuer à être mis à disposition.
- Phrases (EUR-Lex, texte français, lu par l'outil de lecture) : « Le présent règlement est applicable à partir du 21 avril 2018 » (art. 46 § 2) ; « La directive 2009/142/CE est abrogée avec effet au 21 avril 2018 » (art. 45) ; art. 44 § 1 : les États membres « n'empêchent pas la mise à disposition sur le marché ou la mise en service » des appareils conformes à la directive précédente et mis sur le marché avant le 21 avril 2018 — URL : https://eur-lex.europa.eu/eli/reg/2016/426/oj/fra — niveau **A**.
- Annexe I (exigences essentielles) : point 3.3 « l'allumage et le réallumage s'effectuent doucement et un interallumage soit assuré » ; point 3.2.2 sur le risque d'« une accumulation dangereuse de gaz non brûlé dans l'appareil » ; point 3.2.1 « le taux de fuite de gaz n'entraîne aucun danger » — même URL — **A** (extraits de lecture partielle ; l'outil n'a pas retrouvé les mots « dispositif de surveillance de flamme » dans la partie lue : **le texte exact de l'exigence « surveillance de flamme » n'a pas été relu mot à mot**).
- Le règlement fixe des **exigences essentielles** ; les moyens techniques sont dans les **normes harmonisées** : EN 30-1-1 (cuisinières et tables, sécurité), EN 125 (dispositifs thermoélectriques de surveillance de flamme), publiée en dernière édition **EN 125:2022+A1:2024** (6 novembre 2024), rattachée au règlement 2016/426 d'après un site de normes (genorma.com, résumé de recherche) — **B**.
- **Ce que dit GRDF (fiche Cegibat n° 5, janvier 2020) — la meilleure source française trouvée sur la date** : fiche « Règles d'installation appareils à gaz n° 5 — Installer une plaque, un piano de cuisson ou un four au gaz naturel » (© GRDF – Cegibat, dépôt légal janvier 2020), extraite en local, p. 3 : « L'ouvrant dans une pièce n'est pas obligatoire (appareil antérieur à 2009) si : les appareils à gaz sont munis d'un dispositif de sécurité assurant une coupure automatique du gaz en cas d'extinction fortuite de la flamme (sécurité par thermocouple par exemple) » ; encadré « À savoir » : « Depuis 2009, les appareils destinés à être utilisés dans des pièces et espaces intérieurs sont conçus et construits de manière à empêcher tout dégagement de gaz non brûlé dans toutes les situations qui pourraient entraîner une accumulation dangereuse d'un tel gaz dans ces pièces et espaces. » — URL : https://cegibat.grdf.fr/sites/default/files/assets/librairie/fiches/Fiche%205_LI_APG_Installer%20une%20plaque%20un%20piano%20de%20cuisson%20ou%20un%20four%20au%20gaz%20naturel.pdf — niveau **A** (distributeur de gaz, document technique pour installateurs).
  - **Ce que ça établit** : (1) il existait avant 2009 des appareils sans sécurité de flamme (la règle de ventilation distingue « appareil antérieur à 2009 ») ; (2) **depuis 2009 la règle impose un RÉSULTAT** (« empêcher tout dégagement de gaz non brûlé dans toutes les situations » dangereuses), pas la technique ; la sécurité par thermocouple n'est citée que comme **exemple** (« par exemple ») ; (3) la formule reprend celle de l'annexe I du texte européen (« accumulation dangereuse de gaz non brûlé », point 3.2.2 du règlement 2016/426, voir ci-dessus) — la directive 2009/142/CE.
  - **Ce que ça n'établit pas** : « 2009 » est la date de la directive 2009/142/CE, dont je n'ai pas lu le texte ; elle est, de mémoire, une version codifiée de la directive 90/396/CEE (**non vérifié**) : l'exigence peut donc être plus ancienne que 2009. Des sites commerciaux (Saint-Gobain, un expert de PagesJaunes, un guide d'achat) écrivent « depuis 2010 » : résultats de recherche non lus, **C** (hypothèse sans preuve : la norme NF EN 30-1-1 de novembre 2008 aurait été annulée le 18/09/2010, d'après une page AFNOR vue en résultat de recherche — **C**).
  - **À ne pas confondre : le ROAI**. Même fiche, p. 5 : « Depuis le 1er juillet 1997 [...] Les tuyauteries d'alimentation en gaz des appareils de cuisson doivent être munies d'un dispositif de déclenchement assurant automatiquement la coupure de l'alimentation en gaz, en cas de débranchement ou de sectionnement du tuyau flexible. » — c'est le **robinet de sécurité à obturation automatique intégrée (ROAI)** : il coupe si le **flexible** est arraché ou coupé, **pas si la flamme s'éteint**. Niveau **A**. (Et : « Depuis le 1er juillet 2015, les robinets à abouts porte-caoutchouc soudés [...] sont interdits ».)
  - Arrêté du 23 février 2018, § 13.2.1 « Installations des appareils non raccordés (type A) », qui fixerait des conditions pour « un appareil de cuisson non muni de dispositif de sécurité de flamme sur chaque brûleur » : lu seulement dans un résumé de recherche (non vérifié, Légifrance non consulté) — **C**.
- **La date exacte à partir de laquelle un dispositif de surveillance de flamme est obligatoire sur une table de cuisson neuve vendue en France ou en Europe : NON TROUVÉE** (aucun texte lu ne la donne). Formule sûre : « les appareils conçus depuis 2009 doivent empêcher tout dégagement dangereux de gaz non brûlé » (GRDF) ; avant 2009, on trouvait encore des appareils sans sécurité.

### 4.2 Reste-t-il des appareils sans sécurité en service ?
- Fait (Suisse) : AIL cite la directive G1 de la SSIGA (association suisse du gaz), édition de janvier 2017 : « apparecchi sprovvisti del dispositivo di sorveglianza della fiamma non soddisfano lo stato attuale della tecnica e della sicurezza » et doivent être « sostituiti » ; « Invitiamo tutti i proprietari di vecchie cucine e stufe a gas a verificare se i loro apparecchi possiedono un dispositivo di sorveglianza della fiamma. » — URL AIL ci-dessus — **A-** (document suisse, pas français ; prouve qu'il existe, ou qu'il a existé, des cuisinières sans cette sécurité en service dans un pays voisin).
- Fait (France) : la fiche GRDF Cegibat n° 5 (4.1) parle explicitement d'« appareil antérieur à 2009 » et prévoit, pour eux, une dispense d'ouvrant seulement s'ils ont une sécurité de flamme (« sécurité par thermocouple par exemple ») : **ce qui prouve qu'on trouvait des appareils sans sécurité, et que la règle d'installation les distingue** — **A**.
- Un site de dépannage français (SAV Darty, résultat de recherche, non lu) : « les appareils anciens n'en sont pas équipés » — **C**.
- **Pour la France : aucune source officielle lue sur le nombre ou la proportion d'appareils sans sécurité encore en service.** On peut dire « les très vieilles cuisinières n'en ont pas toujours » (appuis : GRDF « antérieur à 2009 », AIL en Suisse), pas un chiffre.

### 4.3 Autres technologies
- **Réallumage automatique** : « Auto reignition relights the burner if the flame goes out while gas is still flowing. » — Wikipédia EN, « Gas stove » — URL : https://en.wikipedia.org/wiki/Gas_stove — **B**. (La même page dit que des « safety valves called flame failure devices were added to gas hobs and ovens to prevent unignited gas from building up » et que la vanne « depends on a thermocouple that sends a signal to the valve to stay open » ; elle ne donne aucune date.)
- **Surveillance électronique / ionisation** : la fiche GRDF Cegibat n° 5 écrit « sécurité par thermocouple **par exemple** » (donc d'autres moyens existent ; ils ne sont pas nommés dans ce texte). Un résumé de recherche attribuait à cette fiche la phrase « Une sécurité par thermocouple ou ionisation de flamme répond à cette exigence » : **je ne l'ai pas retrouvée dans le texte extrait du PDF — à ne pas utiliser**. Le principe de l'électrode d'ionisation (la flamme conduit un courant, un circuit électronique le mesure) n'a **pas été sourcé** ici : **non trouvé**. À ne pas décrire en détail.
- La norme EN 30-1-4 existe pour les appareils de cuisson à gaz « having one or more burners with an automatic burner control system » (pages de catalogue iteh/BSI, résumé de recherche) — **B** : preuve qu'une famille d'appareils à contrôle automatique du brûleur est prévue à part de la sécurité thermocouple.

### 4.4 Le test « si tu dois garder le bouton enfoncé, elle a la sécurité »
- Source qui le valide : AIL (fiche suisse, voir 2) donne exactement ce test, en deux temps : « 1) Controllo visivo: presenza della termocoppia nelle immediate vicinanze del/dei bruciatore/i. 2) Controllo pratico: [...] tenere premuta per alcuni secondi la manopola » ; et pour un fourneau sans dispositif : « per accendere il gas è sufficiente girare la manopola [...] Senza la termocoppia non è necessario tenere premuta la manopola » — **A-** (opérateur de réseau).
- **Ce qui le rend incomplet ou faux** (déduit des sources lues, à formuler avec prudence) :
  1. Le test suppose un dispositif **thermoélectrique à bouton** ; une table à **surveillance électronique** (allumage automatique, réallumage) peut ne demander qu'un clic ou une pression très brève tout en ayant une sécurité (voir 4.3 : **non sourcé en détail**).
  2. Le test dit « avoir la sécurité » ; il ne dit pas qu'elle **fonctionne** : un thermocouple encrassé, mal placé ou usé ne retient plus la flamme au lâcher (ce sont les pannes décrites par les notices et forums de dépannage, **C**), ou, à l'inverse, un thermocouple dont l'électroaimant est usé peut mettre plus de temps à couper.
  3. L'inverse est vrai : une table sans sécurité peut avoir un bouton à appuyer pour une autre raison (verrou enfant, étincelle liée à la poussée) — **non sourcé** ; ne pas l'affirmer.
- => Formule prudente : « Sur une table à gaz classique, si tu dois garder le bouton enfoncé quelques secondes pour que la flamme tienne, c'est qu'elle a une sécurité thermoélectrique. L'absence de ce geste ne prouve pas à elle seule qu'elle n'en a pas : cherche aussi le petit thermocouple à côté de la flamme. » Source du double contrôle : AIL (contrôle visuel + contrôle pratique) — **A-**.

---

## 5. Le danger sans sécurité

### 5.1 Débit d'un brûleur ouvert sans flamme (calcul, pas une mesure)
- Relation : « puissance calorifique (kW) = débit de gaz entrant (m³/h) × PCI (kWh/m³) » ; « le PCI moyen du gaz en France est d'environ 10 kWh/m³ » ; PCS/PCI ≈ 1,11 — GRDF Cegibat / Engie (résultats de recherche : pages « cegibat.grdf.fr/reponse-expert/difference-puissance-utile-puissance-calorifique », « particuliers.engie.fr/.../pci-gaz-naturel.html », non lues en entier) — **B**.
- **Calcul** (à présenter comme tel) : un brûleur de 1 kW ≈ 0,1 m³/h ≈ 1,7 litre/min ; 2 kW ≈ 0,2 m³/h ≈ 3,3 L/min ; **3 kW ≈ 0,3 m³/h ≈ 5 L/min** (puissance nominale, en gaz naturel). Pour une pièce de 30 m³ (hauteur ≈ 2,5 m, 12 m²), 0,3 m³/h pendant 5 heures = 1,5 m³ de gaz, soit 5 % de 30 m³ : **ordre de grandeur de la limite inférieure d'explosivité atteinte en quelques heures dans une petite pièce sans ventilation** (calcul simple sans ventilation, pas une mesure ; le renouvellement d'air d'un logement le repousse beaucoup).
- Pour mémoire : la vanne Sabaf 16C annonce « nominal flow rate 0,50 m³/h (test gas: air - pressure drop 100 Pa) » par sortie (mesure à l'air, pas au gaz) — **A** mais d'une autre nature.

### 5.2 Le gaz naturel : inodore à l'état brut, odorisé, explosif entre ~5 et ~15 %
- Limites d'explosivité du méthane / gaz naturel : « La fiche de données de sécurité d'ENGIE indique que le gaz naturel s'enflamme dans une plage de 5 % (limite inférieure) à 15 % (limite supérieure) dans l'air » ; INERIS : mélange dangereux « entre 5 et 15 % vol » (résumé de recherche d'après une fiche de sécurité Engie et un rapport INERIS, non lus en entier) — URLs : https://entreprises-collectivites.engie.fr/wp-content/uploads/2024/10/Fiche-securite-gaz.pdf ; https://www.ineris.fr/sites/default/files/contribution/Documents/Rapport_Biogaz_web.pdf — niveau **B** (lus seulement en résultat de recherche).
- **Nuance** : le guide d'achat des détecteurs de gaz de la Direction de la sécurité civile (ministère de l'Intérieur, 2009), lu en local : « la LIE du méthane était à 5% il y a quelques années en Europe, elle est aujourd'hui à 4.4% » ; il précise que « LIE et LSE sont des valeurs expérimentales, et ne font pas l'objet d'un consensus » — URL : https://www.interieur.gouv.fr/content/download/81948/601861/file/Guide%20d'aide%20%C3%A0%20l'achat%20relatif%20aux%20d%C3%A9tecteurs%20de%20gaz_2009.pdf — niveau **A**. => **dire « à partir de 4 à 5 % de gaz dans l'air »** ; la limite supérieure (≈ 15 à 17 %) n'a pas été relue à une source A : ne pas la chiffrer à l'écran.
- Définition (même guide) : « La LIE est la concentration au-dessous de laquelle il n'y pas assez de gaz combustible pour assurer la combustion » — **A**.
- **Odorisation** : « à l'état brut, le gaz n'a pas d'odeur. Afin de détecter rapidement toute fuite, il est donc impératif de l'odoriser avant son injection dans le réseau » (GRDF, page urgence-gaz, citée par un résumé de recherche : la page elle-même est interdite à la lecture, erreur 403) — **A (non relu)**. Le distributeur impose **15 à 40 mg/m³ de THT** (tétrahydrothiophène) d'après le décret 2004-555 (document GRDF « Prescriptions techniques », résumé de recherche, non lu : https://projet-methanisation.grdf.fr/cms-assets/assets/2019/07/Prescriptions_techniques_GRDF.pdf) — **B**. Détectable « à partir de 1 % de gaz dans l'air » d'après Engie (résumé de recherche) — **B** : 1 %, c'est un cinquième de la limite basse de 5 %.

### 5.3 Chiffres français d'accidents liés au gaz (domestique)
- Source : **BARPI / base ARIA** (ministère de la Transition écologique), « Éléments d'accidentologie sur l'utilisation domestique du gaz », période 2010-2019, PDF extrait en local — URL : https://www.aria.developpement-durable.gouv.fr/wp-content/uploads/2021/02/2020-09-07_UTILGAZ_VIP-b_vBSERR-DR-Vff.pdf — niveau **A**.
  - « La base de données ARIA recense du 01/01/2010 au 31/12/2019, 1 189 événements français relatifs à l'utilisation domestique du gaz. » ; « une certaine stabilité du nombre d'événements sur les 3 dernières années (environ 125 par an) » ; gaz naturel « dans 69 % des cas », gaz liquéfiés « dans 29,7 % des cas » ; « une explosion se produit dans 42 % des cas étudiés » (505 explosions, 694 incendies) ; « le nombre de morts diminue (11 sur la période 2017-2019 contre 21 entre 2014 et 2016), ainsi que le nombre de blessés (235 sur la période 2017-2019 contre 349 entre 2014 et 2016) » ; « plus de 12 % des événements impliquent une gazinière ou une chaudière ».
  - **Définition d'un événement** (note de bas de page du rapport) : explosion, fuite de gaz enflammée, interruption du réseau (≥ 500 abonnés ou évacuation > 300 personnes), ou conséquences corporelles ; **les intoxications au monoxyde de carbone sont exclues** de l'étude.
  - Causes (parmi celles que cite le rapport) : « des oublis volontaires ou accidentels de fermeture du gaz », « des erreurs de manipulation, d'utilisation des équipements ou des mauvaises pratiques (par exemple utilisation d'une allumette pour détecter des fuites de gaz) » ; la malveillance et les coffrets de gaz pèsent lourd (56 % des événements relèvent d'une « perte de confinement sans rupture », 30 % de malveillance). **Le rapport ne chiffre pas les accidents dus à une flamme de cuisson éteinte avec un gaz qui continue de sortir** : aucune statistique « flamme éteinte » trouvée.
  - Gazinières : le rapport liste les « gazinières (y compris réchauds et autres dispositifs de chauffage de la nourriture) » parmi les grandes familles d'équipements, sans nombre lisible dans le texte extrait (chiffres dans un graphique).
- Une page de synthèse ARIA, lue seulement en résumé de recherche (non lue en direct) : « 66 événements en 2022 (10,7 millions d'abonnés) contre 89 en 2021 » ; « 1 décès en 2022 contre 5 en 2021 et 11 en 2020 » ; 18 blessés en 2022 — URL : https://www.aria.developpement-durable.gouv.fr/synthese/syntheses/elements-daccidentologie-sur-lutilisation-domestique-du-gaz/ — **B** (non relu à la source).
- Ancienne réponse ministérielle (Sénat, 2010, résumé de recherche, non lue) : en 2009, « 84 % des 71 accidents dus au gaz ayant entraîné des dommages corporels étaient liés à l'utilisation domestique du gaz » — **C**.
- Monoxyde de carbone : **non traité ici** (chiffres Santé publique France non lus).

### 5.4 Pourquoi une flamme s'éteint
- Fait (AIL, 2022) : « se durante la cottura di cibo dovesse fuoriuscire dell'acqua dalla pentola e spegnere la fiamma del fornello » ; « se durante l'esercizio dell'apparecchio la fiamma dovesse spegnersi (acqua sulla fiamma, corrente d'aria, ecc.) il rischio principale [...] è l'accumulo di gas incombusto con seguente pericolo di esplosione in presenza di un'energia d'accensione. » — **A-**.
- Fait (ARIA, voir 5.3) : le gaz peut aussi rester ouvert par oubli de fermeture — **A**.

---

## 6. La consigne officielle française en cas d'odeur de gaz

- **Sapeurs-pompiers de France** (pompiers.fr, page « Fuite de gaz »), lue : « Éteindre les cigarettes » ; « Ne pas activer ou ne pas désactiver les appareils ou interrupteurs pouvant produire une étincelle » ; « En milieu confiné, aérer le local autant que possible » ; « Evacuer les lieux dans le calme » ; « Si possible, couper le gaz ou actionner la vanne de coupure d'alimentation du bâtiment » ; « Attendre que les secours donnent le droit d'entrer à nouveau dans le local » ; « Avant toute remise en marche de l'installation, appeler un professionnel du gaz pour la vérifier » ; appeler le **18 ou le 112** « depuis la zone non dangereuse pour ne pas créer d'étincelle » — URL : https://www.pompiers.fr/fuite-de-gaz/ — niveau **A** (la page ne contient pas le numéro d'urgence gaz du distributeur).
- **Numéro Urgence Sécurité Gaz du distributeur GRDF : 0 800 47 33 33**, service gratuit, 24 h/24 et 7 j/7, avec ces réflexes (ordre donné par la page GRDF, d'après un résumé de recherche — **la page est interdite à la lecture (403), texte non relu mot à mot**) : aérer largement en ouvrant les fenêtres ; couper l'arrivée de gaz au robinet d'arrêt près du compteur (poignée tournée à angle droit du tuyau) ; éviter flammes et étincelles ; ne toucher à aucun appareil électrique ni téléphone ; sortir pour appeler ; attendre dehors le technicien ; mise en sécurité « en moins d'une heure » — URL : https://www.grdf.fr/particuliers/urgence-gaz — niveau **A (page officielle, contenu non relu)**. Le numéro 0 800 47 33 33 apparaît aussi dans un résumé de recherche sur des pages de pompiers/Intérieur.
- Pour le film : « Odeur de gaz : tu n'allumes rien, tu n'actionnes aucun interrupteur, tu ouvres les fenêtres, tu coupes le gaz si tu peux l'atteindre, tu sors, et tu appelles depuis dehors le 18, le 112 ou le numéro gratuit d'urgence gaz, 0 800 47 33 33. » — chaque élément est sourcé ci-dessus ; la forme condensée est une simplification.
- À ne pas ajouter : « appelle depuis chez le voisin » (non sourcé tel quel) ; « touche pas la sonnette » (la source pompiers dit « interrupteurs » et, dans un autre résumé, « sonnettes » : prudence).

---

## 7. Histoire : qui a inventé la sécurité thermoélectrique ?

- **Inventeur et date de la sécurité thermoélectrique : NON TROUVÉS** dans une source solide. À ne pas écrire « inventée en 19xx par X ».
- Ce qui est sourcé : l'effet physique est la découverte de Seebeck, **1821** (Wikipédia EN, « Thermocouple » : seules dates citées dans la page, 1821 pour Seebeck ; la page ne donne ni inventeur ni date pour l'application aux appareils à gaz) — **B**. Un brevet de sécurité pour chauffe-eau à gaz existe très tôt (US 1 167 257, « Safety appliance for gas water-heaters » : résultat de recherche, date et contenu non lus ; l'extrait ne mentionne pas de thermocouple), un brevet américain de juillet 1949 attribué à un certain Kronmiller par une page du Minnesota Inventors Hall of Fame (attribution douteuse, l'adresse de la page nomme une autre personne), un modèle d'utilité espagnol de 1963 (ES 99622 Y), des brevets Honeywell de 1978-1980 qui disent que le thermocouple + électroaimant est déjà « widely used » — résultats de recherche non lus — **C**. Tout ce qui précède montre que le dispositif est ancien (brevets du milieu du XXe siècle), pas qui l'a inventé.
- Une anecdote de sécurité (résumé de recherche d'un site de formation, non lu) : sur des modèles anciens, éteindre puis rallumer très vite, avant que le thermocouple ait refroidi, laissait la vanne ouverte — **C**, ne pas l'utiliser ; elle rappelle seulement que le thermocouple a une inertie (voir 3).

---

## 8. Vérification de la phrase du 011 : « son gaz ne reste ouvert que tant que la flamme le tient »

- **Verdict : exacte pour une table à sécurité thermoélectrique, à nuancer sur quatre points.**
  1. Pour la table à thermocouple, c'est bien le principe : l'aimant retient la vanne tant que le thermocouple, chauffé par la flamme, donne du courant ; quand la flamme tombe, la pointe refroidit, l'aimant lâche, le ressort ferme (Sabaf — A ; Wikipédia — B).
  2. **Au démarrage, ce n'est pas la flamme mais la main** qui tient la vanne ouverte les premières secondes (Sabaf, AIL — A).
  3. **Quand la flamme s'éteint, le gaz ne se coupe pas à l'instant** : « after a few seconds » (Sabaf) et jusqu'à 90 secondes (temps maximal pour la vanne Sabaf 16C) — **A**. Pendant ce temps, du gaz sort sans brûler.
  4. **Pas toutes les tables** : des appareils anciens n'en ont pas (Suisse : AIL — A-), et d'autres tables utilisent une surveillance électronique (non sourcé en détail).
- Phrase de remplacement possible : « Sur une table à gaz classique, le robinet ne reste ouvert que tant que la flamme chauffe un petit thermocouple : la flamme s'éteint, il refroidit, et le gaz se coupe. »

<!-- FIN DES BLOCS DE FAITS : sections finales ci-dessous -->

---

## Ce qu'on peut dire tel quel (phrases courtes, sources A ou B)

1. « Sur une table à gaz classique, un petit thermocouple trempe dans la flamme. Chauffé, il fabrique un courant minuscule. » — Sabaf (A), Wikipédia EN (B), OEG (B).
2. « Ce courant alimente un électroaimant, dans le robinet. » — Sabaf : « safety magnet » dans la vanne (A).
3. « Cet électroaimant est trop faible pour ouvrir le robinet : il sait seulement le retenir. » — Wikipédia EN : bobine « sized to hold the valve open against a light spring », ouverture par la main (B) ; Sabaf : on appuie et on tourne pour ouvrir, l'aimant prend le relais après (A).
4. « C'est pour ça qu'il faut garder le bouton enfoncé quelques secondes à l'allumage : ta main ouvre, la flamme chauffe le thermocouple, puis l'aimant prend le relais. » — Sabaf (A), AIL (A-).
5. « Si la flamme s'éteint, la pointe refroidit, le courant baisse, l'aimant lâche : le gaz se coupe. » — Sabaf : « the thermocouple cools and the current is reduced, the safety magnet is closed and the flow of gas is blocked after a few seconds » (A).
6. « Pour cette sécurité-là : ni prise, ni pile. C'est la flamme qui fournit l'électricité. » — Sabaf, Wikipédia EN (B), EN 125 pour les dispositifs thermoélectriques (B). (Dire « cette sécurité-là », pas « la table ».)
7. « Il y a un thermocouple près de chaque brûleur. » — AIL : « nelle immediate vicinanze del/dei bruciatore/i » (A-) ; Sabaf (A).
8. « Une casserole qui déborde, un courant d'air : voilà comment une flamme s'éteint. » — AIL : « acqua sulla fiamma, corrente d'aria » (A-).
9. « Sans cette sécurité, le gaz continue de sortir sans brûler et s'accumule dans la pièce. » — AIL : « accumulo di gas incombusto con seguente pericolo di esplosione in presenza di un'energia d'accensione » (A-) ; règlement 2016/426, annexe I : « accumulation dangereuse de gaz non brûlé » (A).
10. « Depuis 2009, les appareils doivent empêcher tout dégagement dangereux de gaz non brûlé. » — GRDF Cegibat n° 5, 2020 (A).
11. « Avant 2009, il existait des appareils sans cette sécurité : les règles d'installation les distinguent. » — GRDF Cegibat (A).
12. « Le gaz naturel n'a pas d'odeur. On lui en ajoute une avant de l'envoyer dans le réseau. » — GRDF : « à l'état brut, le gaz n'a pas d'odeur » (A, page non relue : 403 ; confirmé par la plupart des sources sur le THT, B).
13. « En France, la base du ministère recense 1 189 accidents de gaz domestique en dix ans (2010-2019), dont 42 % avec une explosion. » — BARPI / ARIA (A) ; préciser « événements : explosion, fuite enflammée ou blessés ; hors monoxyde de carbone ».
14. « Un robinet oublié ouvert fait partie des causes. » — ARIA : « des oublis volontaires ou accidentels de fermeture du gaz » (A).
15. « Le robinet à obturation automatique (ROAI) te protège d'un flexible arraché, pas d'une flamme éteinte. » — GRDF Cegibat (A).
16. Odeur de gaz : « Tu n'allumes rien, tu n'actionnes aucun interrupteur, tu aères, tu coupes le gaz si tu peux, tu sors, et tu appelles depuis dehors. » — pompiers.fr (A) ; numéro « 18 ou 112 » (A, pompiers.fr) et Urgence Sécurité Gaz « 0 800 47 33 33 » (GRDF, A non relu).
17. Test du doigt : « Cherche la petite tige de métal près du brûleur. Et regarde si tu dois appuyer quelques secondes. » — AIL : contrôle visuel + contrôle pratique (A-). Voir 4.4 pour la nuance.

## À dire en ordre de grandeur (et la formulation prudente)

- **Tension** : « quelques millivolts, une trentaine au maximum » (OEG : « maximum d'environ 30 mV », ≈ 5,5 mV par 100 °C ; Wikipédia EN : 25 mV à vide pour un modèle, la moitié en charge ; B). Pour parler à l'oreille : « une pile de télécommande fait 1,5 V, jusqu'à cinquante fois plus » (1,5 V est une constante usuelle, non sourcée ici ; le « cinquante » est un calcul sur le maximum de 30 mV).
- **Courant de tenue** : « une fraction d'ampère » (Wikipédia EN : 0,2–0,25 A pour un modèle ; Sabaf : de quelques dizaines à moins de 180 mA selon la version ; A/B).
- **Combien de temps on appuie** : « quelques secondes » (Sabaf, AIL ; A). Ne pas chiffrer plus précisément.
- **Combien de temps le gaz coule après l'extinction** : « quelques secondes, jusqu'à une minute et demie au maximum pour cette vanne » (Sabaf 16C : « a few seconds » dans le texte, « 90 sec » maximum dans le tableau ; OEG 60 à 90 s ; A/B). Formulation prudente : « il faut compter de quelques secondes à plus d'une minute avant que le gaz soit coupé ». À ne pas attribuer à « la norme ».
- **Pointe du thermocouple** : « elle supporte environ 650 °C » (OEG, limite de la pièce ; B). La température réelle de la pointe et de la flamme : non sourcées.
- **Débit** (calcul, PCI ≈ 10 kWh/m³ — GRDF/Engie, B) : « un brûleur de 3 kilowatts, c'est environ 0,3 m³ de gaz par heure, de l'ordre de 5 litres par minute ». Pour 1 kW : ≈ 0,1 m³/h (≈ 1,7 L/min).
- **Temps pour atteindre la limite d'explosivité** : « dans une petite pièce fermée, de l'ordre de quelques heures » (calcul : 30 m³ de pièce, 0,3 m³/h → 5 % en 5 h, sans aucune ventilation). Formulation prudente : « une pièce mal aérée ». Ne pas l'afficher comme un essai.
- **Limites d'explosivité** : « à partir de 4 à 5 % de gaz dans l'air » (ministère de l'Intérieur : 4,4 % aujourd'hui, 5 % avant ; Engie FDS / INERIS : 5 à 15 % ; A/B). Ne pas chiffrer la limite haute à l'écran.
- **Odorisation** : « on ajoute du THT (tétrahydrothiophène), de l'ordre de 15 à 40 milligrammes par mètre cube, qu'on sent dès environ 1 % de gaz dans l'air, bien en dessous des 5 % qui explosent » (GRDF « Prescriptions techniques » via résumé de recherche ; Engie via résumé de recherche ; B).
- **Accidents** : « environ 125 accidents de gaz domestique par an en France » (BARPI, les trois dernières années de la période 2010-2019 ; A) ; « onze morts sur 2017-2019, vingt et un sur 2014-2016 » (A) ; « plus d'un accident sur dix implique une gazinière ou une chaudière » (A : « plus de 12 % ») — attention, deux appareils regroupés.

## À ne pas dire (faux ou non sourcé)

1. **« Sans électricité »** — le thermocouple produit de l'électricité ; l'allumage d'une table moderne utilise pile ou secteur ; certaines tables ont une surveillance électronique. Dire « sans prise ni pile pour la sécurité ».
2. **« Instantanément / tout de suite / immédiatement »** — Sabaf : « after a few seconds », jusqu'à 90 s en maximum de fabrication ; seul AIL écrit « immediatamente » (vulgarisation).
3. **« Elle détecte le gaz »** — elle ne détecte que la chaleur de la flamme. Aucun capteur de gaz. (Si la flamme est là, il n'y a rien à détecter : si elle s'éteint, la pointe refroidit.)
4. **« Toutes les gazinières / toutes les tables »** — des appareils d'avant 2009 existent sans cette sécurité (GRDF) ; certaines tables ont autre chose (électronique) ; pas de statistique sur le parc.
5. **« Obligatoire depuis telle année »** — date non trouvée ; « 2009 » (GRDF) est le début d'une règle de résultat, et « 2010 » ne vient que de sites commerciaux.
6. **« La norme impose X secondes »** (60 s, 90 s…) — EN 30-1-1 / EN 125 non lues ; seul Sabaf donne 90 s pour sa vanne.
7. **« L'électroaimant attire le robinet »** — faux : il le retient.
8. **« Le thermocouple, c'est du cuivre / du platine / un type K »** — seule fiche lue (OEG) : nickel-chrome + constantan, pour un thermocouple de rechange universel ; une autre marque peut différer.
9. **« Elle empêche les fuites »** — non : elle ne couvre ni un robinet oublié ouvert à froid (cause ARIA), ni un flexible arraché (c'est le ROAI), ni le début de l'allumage (la main tient le gaz ouvert quelques secondes).
10. **« Elle te protège du monoxyde de carbone »** — hors sujet ; les cas de CO sont exclus des chiffres BARPI.
11. **« Une table sans bouton à tenir n'a pas de sécurité »** — le test n'est valable que pour le thermoélectrique à bouton (voir 4.4).
12. **« X personnes meurent chaque année parce qu'une flamme s'éteint »** — aucune statistique par cause « flamme éteinte » trouvée ; BARPI donne des totaux par type d'équipement.
13. **« Inventée par … en 19.. »** — non trouvé.
14. **« Elle ferme le gaz si la casserole déborde »** — c'est l'effet, pas le but : un débordement n'éteint pas toujours la flamme ; dire « si le débordement éteint la flamme ».
15. **« Le gaz de ville »** (ancien gaz manufacturé, toxique) — hors sujet ; ne pas mélanger avec le gaz naturel.
16. **« Mercaptan »** comme odorant du réseau français — la source dit THT (tétrahydrothiophène) ; les mercaptans servent ailleurs (butane/propane) : non sourcé ici.
17. **« Les chiffres 2022 »** (66 événements, 1 mort) — lus seulement dans un résumé de recherche ; ne pas les afficher sans relire la page ARIA.

## Trois faits-accroche

1. **L'aimant qui ne sait que retenir.** « Dans ta cuisinière, un aimant tient ton gaz ouvert… mais il est trop faible pour l'ouvrir : c'est ta main qui ouvre, et la flamme qui prend le relais. » — Sabaf notice 16C (A) + Wikipédia EN « Thermocouple » (B). *Pourquoi ça claque : l'objet banal (tu tiens le bouton enfoncé depuis toujours) prend soudain un sens.*
2. **Une tension cinquante fois plus faible qu'une pile.** « C'est la flamme qui fait le courant : une trentaine de millivolts au plus… cinquante fois moins qu'une pile de télécommande. » — OEG : « maximum d'environ 30 mV » (B) ; 1,5 V = constante usuelle. *Honnêteté : ordre de grandeur, pas la valeur d'un modèle précis ; Wikipédia donne 10–12 mV en charge (B).*
3. **Quand la flamme s'éteint, le gaz coule encore.** « Quelques secondes… et jusqu'à une minute et demie pour certaines vannes : le temps que la pointe refroidisse. » — Sabaf, « a few seconds » + « 90 sec » (A). *C'est le « paradoxe » de l'épisode : la sécurité n'est pas instantanée, elle compte sur la patience du thermocouple.*
   - Faits-accroche de réserve : 1 189 accidents de gaz domestique en dix ans en France, dont 42 % avec une explosion (BARPI/ARIA, A) ; le ROAI de 1997 ne protège pas d'une flamme éteinte (GRDF Cegibat, A) ; des appareils d'avant 2009 existent sans cette sécurité (GRDF Cegibat, A).

## Non trouvé (honnêteté)

- **Le temps maximal de fermeture imposé par la norme** (EN 30-1-1 pour une table et pour un four ; EN 125) et le **temps maximal d'appui à l'allumage** : normes payantes, aucune valeur lue. Les « 60 s / 90 s » qui circulent viennent de fournisseurs, d'un code américain et de la notice Sabaf (90 s pour sa vanne) : valeurs de fabricants, pas de la norme.
- **La date exacte d'obligation** du dispositif de surveillance de flamme sur les tables de cuisson neuves (France ou UE). Meilleur appui : « depuis 2009 » (GRDF, règle de résultat) ; le texte de la directive 2009/142/CE, celui de la 90/396/CEE et l'arrêté français du 23 février 2018 n'ont pas été lus.
- **Le texte exact de l'annexe I du règlement 2016/426 sur la « surveillance de flamme »** : seuls les points 3.2.1, 3.2.2 et 3.3 ont été retrouvés (lecture partielle).
- **Le principe d'une surveillance électronique / par ionisation** et la part des tables qui en ont : non sourcés.
- **La tension réelle à vide / en charge, et la température de la pointe, pour une table précise** : seules les données de composants (OEG, Wikipédia, Sabaf) sont lues. Température de la flamme : non sourcée.
- **L'inventeur et la date** de la sécurité thermoélectrique : non trouvés.
- **Le nombre d'appareils sans sécurité encore en service en France** ; **une statistique d'accidents causés par une flamme de cuisson éteinte** ; le **nombre d'accidents impliquant spécifiquement une gazinière** (BARPI le donne en graphique, non lisible dans le texte extrait) ; les chiffres 2023-2025 de BARPI ; les intoxications au monoxyde de carbone (Santé publique France).
- **Le texte intégral de la page GRDF « urgence gaz »** (403) : le numéro 0 800 47 33 33, sa gratuité et la liste des gestes de GRDF reposent sur un résumé de recherche ; la page pompiers.fr, lue, ne cite pas ce numéro.
- **La fiche de sécurité Engie du gaz naturel** (403) et les fiches INRS (certificat / mauvaise fiche) : les limites 5–15 % et le THT restent en niveau B.

## URL lues

Contenu lu et exploité :
1. https://www.sabaf.it/sites/default/files/allegati/user%20manual%20mod%2016C%20rev%2000%20feb%2018%20CE.pdf (extrait en local)
2. https://www.ail.ch:443/dam/jcr:afdb22c4-8e0f-4cd8-9007-57fd5bb65122/Cucine%20a%20gas%20info.pdf (extrait en local)
3. https://cegibat.grdf.fr/sites/default/files/assets/librairie/fiches/Fiche%205_LI_APG_Installer%20une%20plaque%20un%20piano%20de%20cuisson%20ou%20un%20four%20au%20gaz%20naturel.pdf (extrait en local)
4. https://www.aria.developpement-durable.gouv.fr/wp-content/uploads/2021/02/2020-09-07_UTILGAZ_VIP-b_vBSERR-DR-Vff.pdf (extrait en local)
5. https://www.interieur.gouv.fr/content/download/81948/601861/file/Guide%20d'aide%20%C3%A0%20l'achat%20relatif%20aux%20d%C3%A9tecteurs%20de%20gaz_2009.pdf (extrait en local)
6. https://www.pompiers.fr/fuite-de-gaz/
7. https://eur-lex.europa.eu/eli/reg/2016/426/oj/fra (lu en deux passes, par l'outil de lecture)
8. https://www.oeg.net/oeg-universal-thermocouples-g133466000
9. https://en.wikipedia.org/wiki/Thermocouple
10. https://en.wikipedia.org/wiki/Gas_stove

Lues sans contenu utile ou refusées : https://www.grdf.fr/particuliers/urgence-gaz et https://www.grdf.fr/particuliers/urgence-depannage-fuite-gaz (403) ; https://entreprises-collectivites.engie.fr/wp-content/uploads/2024/10/Fiche-securite-gaz.pdf (403) ; https://ftweb.inrs.fr/dam/ficheTox/FicheFicheTox/FICHETOX_7-1.pdf (certificat) ; https://www.inrs.fr/dam/ficheTox/FicheFicheTox/FICHETOX_5-2.pdf (c'est le méthanol, pas le gaz naturel) ; https://standards.iteh.ai/catalog/standards/cen/91822d57-7ecd-48cc-9d2b-408d1e3e1419/en-30-1-1-2021 (page de catalogue sans contenu).

Résultats de recherche utilisés comme pistes seulement (marqués « résumé de recherche, non lu » ou C dans le texte) : pages de normes EN 125 / EN 30-1-1 / EN 30-1-4 (BSI, Sist, iteh, genorma, AFNOR), https://www.grdf.fr/particuliers/urgence-gaz, https://www.aria.developpement-durable.gouv.fr/synthese/syntheses/elements-daccidentologie-sur-lutilisation-domestique-du-gaz/, https://projet-methanisation.grdf.fr/cms-assets/assets/2019/07/Prescriptions_techniques_GRDF.pdf, https://particuliers.engie.fr/gaz-naturel/conseils-gaz-naturel/conseils-normes-securite-gaz-naturel/odeur-de-gaz.html, https://www.ineris.fr/sites/default/files/contribution/Documents/Rapport_Biogaz_web.pdf, gasproducts.co.uk (fournisseur britannique), brevets US 6 698 417, US 4 318 687, US 1 167 257, forums (Futura-Sciences, Électroguide), sav.darty.com, lamaisonsaintgobain.fr.

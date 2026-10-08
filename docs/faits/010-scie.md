# Dossier de faits — 010 Scie sur table (SawStop)

Recherche du 2026-10-08. Format : fait — valeur — phrase exacte de la source (dans sa langue) — URL — niveau (PRIMAIRE lu / SECONDAIRE lu / NON VÉRIFIÉ).
Fichier écrit au fur et à mesure (bloc par bloc). Sections finales (simplifications, « à ne pas dire », trois chiffres qui claquent, URL lues) complétées à la fin.

Limites de la recherche : sawstop.com renvoie « 403 Forbidden » aux outils de lecture automatique — les pages officielles SawStop (technologie, FAQ, communiqués) n'ont donc **pas pu être lues directement**. Les brevets (Google Patents) et le Federal Register (govinfo.gov) servent de sources primaires pour la technique et la règle ; les phrases de SawStop sont citées de seconde main (Woodcraft, revendeur officiel) et signalées comme telles.

Convention : « Gass » = Stephen F. (Steve) Gass, inventeur et fondateur de SawStop. « CPSC » = Consumer Product Safety Commission (agence fédérale américaine de sécurité des produits). « AIM » = *active injury mitigation* (le terme de la CPSC pour les systèmes du type SawStop).

---

## 1. La détection (ce que la lame « sent »)

### 1.1 Le signal
- Fait : un oscillateur envoie dans la lame un signal d'environ **200 kHz**, par **couplage capacitif** (une plaque posée parallèlement à la lame, sans contact).
- « an oscillator circuit that generates a wave input signal, such as a square wave signal, at a frequency of approximately 200 khz » ; « Plate 62 is capacitively coupled to the saw blade by virtue of its size and placement parallel to and spaced-apart from the saw blade. » — brevet US 7,055,417 B1 (Gass, déposé le 2000-09-29) — https://patents.google.com/patent/US7055417B1/en — PRIMAIRE lu (brevet).
- Autre description, secondaire : « An oscillator generates a 12-volt, 200-kilohertz (kHz) pulsed electrical signal, which is applied to a small plate on one side of the blade » (résumé de recherche web de pages revendeurs ; **12 V non relu dans une source primaire**) — NON VÉRIFIÉ pour les 12 V ; le 200 kHz est confirmé par le brevet.

### 1.2 Ce que le corps change
- Fait : le corps humain a une capacité électrique propre et conduit ; en touchant la lame, on ajoute cette capacité à celle de la lame, et le signal change (il chute).
- « the capacitance of the human body is approximately 300 picofarads. As a result, when a user contacts cutting tool 14, the capacitance of the user's body is electrically coupled to the inherent capacitance of the cutting tool » — brevet US 7,055,417 B1 — https://patents.google.com/patent/US7055417B1/en — PRIMAIRE lu.
- « the detection system may be adapted to capacitively impart an electric charge on the working portion and to detect when that charge drops. » — brevet US 9,724,840 B2 (Gass, déposé le 2002-03-13, délivré le 2017-08-08, échéance 2033-04-08) — https://patents.google.com/patent/US9724840B2/en — PRIMAIRE lu.
- Côté revendeur : « The blade in a SawStop table saw carries a small electrical signal. The human body, and therefore your skin, is conductive. » — Woodcraft (revendeur officiel SawStop) — https://www.woodcraft.com/blogs/shop-knowledge-guides/sawstop-table-saw-safety-system-how-it-works-with-video-woodcraft — SECONDAIRE lu.
- => Formulation exacte : ce n'est pas la scie qui « voit » un doigt ; **ton corps devient une partie du circuit** : sa capacité fait chuter le petit signal porté par la lame.

### 1.3 Bois sec, bois mouillé, métal, bypass
- Logique (brevet) : la lame est une électrode ; ce qui la touche et lui ajoute de la capacité / de la conduction fait chuter le signal. Le bois sec est mauvais conducteur : il ne change presque rien. Ce raisonnement est le mien, déduit du brevet (pas une phrase du brevet) — niveau : DÉDUCTION, la formulation « le bois sec n'est pas conducteur » est du savoir général.
- Ce qui peut déclencher « par erreur » (sources lues) :
  - « Errant staples and excess moisture in the wood can inadvertently set off the safety system. » ; « NEVER send painted or wet materials, reclaimed materials, materials of unknown origin, metals, or materials off the laser cutter through the saw. (Note: the laser cutter will create a very high carbon build up on the edges of the material which makes the material conductive.) » — consignes de sécurité d'un atelier universitaire (Penn State, Origin Labs) — https://originlabs.psu.edu/wp-content/uploads/2023/11/SAFETY-OPERATING-PROCEDURES-SAWSTOP-TABLE-SAW.pdf — SECONDAIRE lu (règlement d'atelier, pas la notice SawStop).
  - L'industrie (Power Tool Institute) cite des « unintended/false activations » dues à « the blade contacting moist pressure treated wood, static electric discharge, voltage spikes from switch activations, etc. » — https://www.powertoolinstitute.com/?p=983 — SECONDAIRE lu (partie adverse : ses chiffres sont à lire comme tels).
- Le contournement (« bypass ») : le test de 2004 dit que le système se désactive « with a keyed lock » pour les bois traités — Fine Woodworking, 2004 — https://www.finewoodworking.com/2004/12/01/a-safer-tablesaw-finally-arrives — SECONDAIRE lu. Le « mode bypass » des scies actuelles (test de coupe pour voir si le bois très vert déclenche) m'est connu seulement par un résumé de recherche web de la FAQ SawStop (page illisible, 403) — NON VÉRIFIÉ à la source. Festool vend la sienne avec un capteur qui « peut être désactivé » (résumé de recherche web de fiches revendeurs, non relu) — NON VÉRIFIÉ.

---

## 2. Le frein (le « bloc jeté dans les dents »)

- Fait : un **ressort** pousse un **sabot (« pawl »)** dans les dents de la lame ; le ressort est retenu comprimé par un **fil fusible** que le système brûle avec un fort courant.
- « spring 130 adapted to press the free end of the pawl against the blade » ; « Fusible member 122 is connected to a firing system 115 that melts the wire in response to an output signal » — brevet US 7,055,417 B1 — https://patents.google.com/patent/US7055417B1/en — PRIMAIRE lu.
- Matière du sabot (le brevet) : « The pawl may be constructed from one or more of a variety of materials. Examples of suitable materials include plastics, such as polycarbonate, rubber and wood, or even soft metals, such as lead or aluminum. » — même brevet — PRIMAIRE lu. => le brevet admet plusieurs matières ; que le sabot commercial soit en **aluminium** est dit par le revendeur Woodcraft (« the aluminum assembly springs into the path of the blade », voir ci-dessous), pas par une page SawStop lue. Niveau : SECONDAIRE.
- Force du ressort : « the spring will supply 1–500 pounds of force to the pawl, with values between 15–100 being more preferred. » (≈ 0,5 à 225 kgf ; préféré 15–100 lb = 7 à 45 kgf) — brevet US 7,055,417 B1 — PRIMAIRE lu **pour le brevet de 2000, pas pour la cartouche vendue** (valeur commerciale NON VÉRIFIÉ). Autre phrase du même brevet : « the spring typically applies between 5 and 15 pounds of force against the fusible member » (la force que le fil retient, ≈ 2 à 7 kgf).
- Le fil brûle vite : « the sudden release of the charge stored in the capacitor bank heats the fusible member to its melting point in approximately 1–5 ms » ; « approximately 20–100 Amps are required to ensure complete and rapid melting » — brevet US 7,055,417 B1 — PRIMAIRE lu (valeurs du brevet).
- Où il mord : dans les dents. « the pawl engages the blade » (brevet) ; revendeur : « The brake cartridge fires and the aluminum assembly springs into the path of the blade » — Woodcraft — https://www.woodcraft.com/blogs/shop-knowledge-guides/sawstop-table-saw-safety-system-how-it-works-with-video-woodcraft — SECONDAIRE lu. Autre revendeur : le frein « stops the blade by jamming a brake pawl against it, drops the blade down below the surface of the table, and shuts off the motor » — Woodworkers Journal — https://www.woodworkersjournal.com/sawstop-come-for-the-safety-stay-for-the-saw/ — SECONDAIRE lu.
- Précision à ne pas oublier (pour la chute) : ce n'est pas un frein qui serre la lame sur les côtés (comme un frein à disque) ; c'est un **bloc que le ressort envoie dans les dents**, qui s'y coince. Source de cette description : brevet (pawl pressé « against the blade » dont les dents s'y enfoncent : « blade is mounted with a plurality of teeth disposed along the perimetrical edge ») — PRIMAIRE lu pour le principe ; que les dents « s'enfoncent » dans l'aluminium est NON VÉRIFIÉ dans une page lue (le résumé de recherche web le dit, pas relu).

---

## 3. Les temps

### 3.1 Ce que dit SawStop et ce que disent les sources lues
- « The time involved, from activation to a completely stopped saw blade, is less than 5 milliseconds! » — Woodcraft (revendeur officiel) — https://www.woodcraft.com/blogs/shop-knowledge-guides/sawstop-table-saw-safety-system-how-it-works-with-video-woodcraft — SECONDAIRE lu.
- « All this happens in five milliseconds. That's faster than an airbag deploys in your car, faster than you blink and, most importantly, quick enough to prevent major injury. » — Woodworkers Journal — https://www.woodworkersjournal.com/sawstop-come-for-the-safety-stay-for-the-saw/ — SECONDAIRE lu. (Comparaison « plus vite qu'un airbag » : à ne pas reprendre sans mesure propre — c'est la phrase du magazine, pas une mesure.)
- Fiche d'un revendeur de la scie PCS31230 : « stops the spinning blade on contact with skin in less than 5 milliseconds » — Toolnut — https://www.toolnut.com/products/sawstop-pcs31230-tgp236-220v-single-phase-3-hp-13-amp-10-professional-cabinet-saw-with-36-professional-series-t-glide-fence-system — SECONDAIRE lu. => la formulation commerciale constante est **« en moins de 5 millisecondes »**. Je n'ai **pas pu lire** la page SawStop elle-même (403) ; la formule « less than 5 milliseconds » est donc rapportée par deux revendeurs, pas lue chez SawStop.
- Le brevet de 2000 (états de l'invention, pas du produit vendu) : « Stopping times of less than 10 milliseconds from initial contact between the cutting tool and the user are preferred, with stopping times of less than 5 milliseconds » ; et « the blade will normally come to rest within not more than 2–10 ms of brake engagement » — brevet US 7,055,417 B1 — PRIMAIRE lu.
- Pourquoi si vite : « If a brake is triggered immediately upon contact between the user's body and the saw's blade, the blade must be stopped within approximately one-hundredth of a second to limit the depth of injury to about one-eighth of an inch. » — brevet US 9,724,840 B2 — https://patents.google.com/patent/US9724840B2/en — PRIMAIRE lu. (1/100 s = 10 ms ; 1/8 pouce = 3,2 mm.) Le brevet de 2000 dit la même chose : « the blade must be stopped within approximately one-hundredth of a second to limit the depth of injury to one-eighth of an inch ».
- Exigence de la règle CPSC proposée (même ordre de grandeur) : profondeur de coupe limitée à **3,5 mm** quand une sonde vient sur la lame à **1 m/s** — « limit the depth of cut to no more than 3.5 millimeters when a test probe, acting as surrogate for a human finger or other body part, approaches the spinning blade at a rate of 1 meter per second (m/s) » — Federal Register, 88 FR (1 novembre 2023), https://www.govinfo.gov/content/pkg/FR-2023-11-01/html/2023-23898.htm — PRIMAIRE lu.

### 3.2 Le temps de détection (brevet)
- « the system is capable of detecting contact within approximately 50 µs » ; « charging circuit 106 is configured to decay within approximately 25–50 µs to ensure that second electrical system 88 responds to even momentary contact » — brevet US 7,055,417 B1 — PRIMAIRE lu (brevet). Chiffre produit : NON VÉRIFIÉ sur une page SawStop (un résumé de recherche parle de 25 µs, non relu).
- Chronologie ordre de grandeur (brevet) : détection ≈ 0,05 ms ; fusion du fil ≈ 1 à 5 ms ; arrêt ≤ 5 ms au total d'après les revendeurs. Les trois ne s'additionnent pas proprement dans les sources : ne pas annoncer un découpage à la milliseconde. Dire : « en moins de 5 millisecondes, de la détection à la lame arrêtée ».

### 3.3 Ce que ça donne en tours et en dents — CALCUL (je montre le calcul ; les entrées sont signalées)
- Entrées sourcées : lame de **10 pouces = 254 mm** (Toolnut : « 10 in. » ; Festool TKS 80 : « blade diameter of 254 mm », voir Europe) — SECONDAIRE lu. Temps d'arrêt : 5 ms (ci-dessus).
- **Vitesse de rotation : NON VÉRIFIÉ dans une page lue.** Un résumé de recherche web donne « 4 000 tr/min, vitesse maximale de lame » pour les scies à caisson 10" de SawStop (revendeurs) et un autre résumé « 3 500 tr/min » (Lumafield, page illisible par l'outil). Le brevet de 2000 ne donne pas de vitesse. Je prends donc **4 000 tr/min comme ordre de grandeur, NON VÉRIFIÉ** (≈ 3 500 à 4 000 selon le modèle ; 3 450 tr/min est la vitesse d'un moteur à induction 60 Hz — connaissance générale, non sourcée).
- Calcul (hypothèse 4 000 tr/min, NON VÉRIFIÉ) :
  - 4 000 tr/min ÷ 60 = 66,7 tours/s.
  - Vitesse en bout de dent = π × diamètre × tours/s = 3,1416 × 0,254 m × 66,7 = **53 m/s ≈ 191 km/h**.
  - En 5 ms la lame fait 66,7 × 0,005 = **0,33 tour** (un tiers de tour, 120°).
  - Longueur de lame qui défile pendant ces 5 ms, si elle freinait de façon uniforme : à vitesse constante 53 m/s × 0,005 s = 27 cm ; en freinant jusqu'à zéro (décélération constante) la moyenne est la moitié : **≈ 13 cm, soit un sixième de tour**. (Hypothèse de décélération constante : NON VÉRIFIÉ ; ordre de grandeur.)
  - Nombre de dents : hypothèse **40 dents** (lame combinée courante) — NON VÉRIFIÉ ici. Pendant les 5 ms : au plus 0,33 × 40 ≈ **13 dents** passent à pleine vitesse ; avec décélération, ≈ 7 dents.
  - Distance parcourue par une main qui avance à 1 m/s (la sonde de la règle CPSC) pendant 5 ms : 1 m/s × 0,005 s = **5 mm** ; pendant 10 ms : 1 cm. Cohérent avec la limite de profondeur de 3,5 mm de la règle (la sonde est encore en train d'avancer quand la lame s'arrête).
- Pour la voix : « une dent file à près de 200 km/h » (si 4 000 tr/min) est un ordre de grandeur honnête mais NON VÉRIFIÉ à la source ; préférer « un tiers de tour » en gardant la vitesse hors du script, ou la dire comme « près de deux cents kilomètres-heure en bout de dent » seulement si Merwan accepte « ordre de grandeur ».

---

## 4. La lame plonge sous la table

- Fait : le frein, en bloquant la lame, transfère son **moment cinétique (angular momentum)** à l'ensemble qui porte la lame (le support pivotant) ; le mouvement de rotation de ce support fait **basculer la lame vers le bas** ; elle disparaît sous la table et le moteur est coupé.
- Brevet (version 2000, premier montage à bras oscillant) : « when the pawl engages the blade and the angular momentum of the blade is transferred to the swing arm, the swing arm may tend to rise upward depending on its weight and the amount of play in worm gear 224. » ; autre phrase : « proper positioning of the brake in combination with a deformable bushing may be employed to cause the blade to move away from the user upon activation of the brake. » — brevet US 7,055,417 B1 — PRIMAIRE lu (il décrit le principe d'un mouvement de recul induit par la prise du frein ; **pas le montage du produit actuel**).
- CPSC (Federal Register, 1/11/2023), sur le système SawStop : « stop the blade and allow angular momentum to retract it » (et « The Bosch REAXX retracts the blade with an explosive discharge ») — https://www.govinfo.gov/content/pkg/FR-2023-11-01/html/2023-23898.htm — PRIMAIRE lu (agence fédérale, mais phrase de contexte, pas de mesure).
- Revendeurs : « As the turning blade comes to a stop, the entire saw blade assembly drops beneath the table surface—removing the risk of further skin and blade contact. » — Woodcraft — SECONDAIRE lu ; « drops the blade down below the surface of the table, and shuts off the motor » — Woodworkers Journal — SECONDAIRE lu.
- **Le brevet qui décrit exactement ça** : US 8,061,245 B2, « Safety methods for use in power equipment », inventeur Stephen F. Gass, priorité 2000-09-29, déposé 2004-11-08, délivré 2011-11-22, **échéance indiquée : 2026-05-29** (donc tombé dans le domaine public cette année, si les taxes de maintien ont été payées — NON VÉRIFIÉ au-delà de la date affichée par Google Patents). Phrase clé : « the angular momentum of the blade causes the blade, arbor block and cartridge to all pivot down away from the cutting region when the pawl strikes the blade. Thus, the angular momentum of the blade causes the retraction. » — https://patents.google.com/patent/US8061245B2/en — PRIMAIRE lu.
- **Durée de la plongée** : le même brevet dit que le système a été démontré pour « retract the blade completely below table 303 within approximately 14 milliseconds after contact is detected » (≈ 14 ms après la détection, lame entièrement sous le plateau) — brevet US 8,061,245 B2 — PRIMAIRE lu (valeur de brevet, démonstration d'époque ; pas une mesure du produit actuel). Ordre de grandeur cohérent avec « arrêt en < 5 ms » : la lame est d'abord arrêtée, puis finit de basculer. Les phrases « tout ça en 5 ms » des revendeurs englobent l'arrêt, pas forcément la plongée.
- Pourquoi c'est élégant (pour le scénario) : la même énergie qui était un danger (la lame qui tourne) fait le travail de se retirer — pas de moteur ni de second mécanisme pour la retraite, selon la description du brevet et de la CPSC (« allow angular momentum to retract it »). Formulation simple : « c'est la lame elle-même, en s'arrêtant d'un coup, qui se tire vers le bas ».

---

## 5. Le prix du sauvetage : cartouche, lame, doigt, saucisse

### 5.1 Ce qui est détruit
- « The blade is ruined in the process, and the cartridge will need to be replaced. » — Fine Woodworking, test de la première SawStop, 2004 — https://www.finewoodworking.com/2004/12/01/a-safer-tablesaw-finally-arrives — SECONDAIRE lu (magazine spécialisé de référence ; article de 2004).
- « the brake cartridge must be replaced » (changement « around 90 seconds ») — Woodcraft — https://www.woodcraft.com/blogs/shop-knowledge-guides/sawstop-table-saw-safety-system-how-it-works-with-video-woodcraft — SECONDAIRE lu.
- Industrie (Power Tool Institute) : « Activation of the SawStop brake results in additional costs to the owner in the form of a new blade ($60-$80) and new brake cartridge ($95-$130). » — https://www.powertoolinstitute.com/?p=983 — SECONDAIRE lu (source partie adverse, année non indiquée sur la page lue ; prix de l'époque du dossier CPSC 2023-2024).
- Prix d'une cartouche 10 pouces : **119,00 $** — Highland Woodworking (revendeur), page lue le 2026-10-08 — https://www.highlandwoodworking.com/sawstop-10-brake-cartridge.aspx — SECONDAIRE lu. Pour comparaison, **59 $** pour la cartouche 10 pouces (69 $ pour les piles de rainurage) en 2004 — Fine Woodworking (même lien que ci-dessus) — SECONDAIRE lu.
- Remise gratuite de la cartouche quand elle a vraiment évité une blessure : annoncée par un résumé de recherche web de la FAQ SawStop (page illisible, 403) — NON VÉRIFIÉ.
- Fait de contexte utile : la lame ruinée est celle qu'on aurait de toute façon dans la scie, à 60-80 $ ; la cartouche à 119 $ est le « prix » du doigt sauvé. À mettre en regard du coût d'une hospitalisation (§ 6) sans prétendre à une équation.

### 5.2 Ce que devient le doigt
- Gass lui-même, au micro de Planet Money (NPR), 11/10/2024 : « SawStop is a technology for table saws that, if you run your hand into the blade, it stops it so quick, you just get a little nick instead of cutting your fingers off. » — https://www.wusf.org/2024-10-11/planet-money-what-does-it-take-to-make-table-saws-safer — SECONDAIRE lu (propos de l'inventeur, partie prenante). => « une égratignure » ≈ « a little nick ».
- Test mesuré sur une saucisse (hot dog) : « the result was a 1/16-in.-deep by 1/8-in.-wide by 3/16-in.-long cut. » Un médecin juge qu'une telle plaie demanderait « two or three stitches at most ». Avec une cuisse de poulet à vitesse normale : « the cut was almost imperceptible. » — Fine Woodworking 2004 (lien ci-dessus) — SECONDAIRE lu. (1/16 pouce = 1,6 mm de profondeur ; 2 à 3 points de suture au plus.) **« Égratignure » est un peu court : la formulation exacte des sources est « une petite entaille / quelques points de suture au plus ».**
- Claim de Gass (partie prenante) : « Well over 10,000 fingers now » sauvés — Planet Money (WUSF, lien ci-dessus) — SECONDAIRE lu, **auto-déclaré**, non audité.
- Ce que la CPSC exige dans la règle proposée (mesure, pas anecdote) : profondeur de coupe ≤ 3,5 mm à 1 m/s (voir § 3.1) — PRIMAIRE lu.

### 5.3 La saucisse (hot dog)
- Origine de la démo : « what do we have that's sort of finger like with similar electrical properties » (Gass, rapporté) — la saucisse a été prise « from his fridge » — Kottke.org, 2021, citant Gass — https://kottke.org/21/02/the-table-saw-that-wont-cut-your-fingers-off — SECONDAIRE lu (blog ; la source primaire — vidéo ou entretien — n'est pas nommée par la page).
- **Retournement vrai** : la page de Kottke précise que, comme la scie sent « the capacitance of the human body », la saucisse doit être **tenue par une personne** pour que la démo marche — SECONDAIRE lu (paraphrase du blogueur, pas une citation de Gass). Cohérent avec le brevet (capacité du corps ≈ 300 pF qui s'ajoute à celle de la lame). Je n'ai pas lu de test d'une saucisse **posée seule**.
- Date des premières démonstrations publiques : prototype montré en **août 2000** à un salon professionnel (Wikipédia, d'après Design News, sept. 2006) — SECONDAIRE (Wikipédia sert à trouver la source ; Design News non lu).

### 5.4 Gass a testé avec SON doigt
- Version détaillée : « After numerous tests using a hot dog as a finger-analog, in spring 2000, Gass conducted the first test with a real human finger: he applied Novocain to his left ring finger, and after two false starts, he placed his finger into the teeth of a whirring saw blade. The blade stopped as designed » ; la citation « hurt like the dickens and bled a lot » vient de l'article de Melba Newsome, « He Took On the Whole Power-Tool Industry », *Inc.*, juillet 2005 — https://www.inc.com/magazine/20050701/disruptor-gass.html — **cité par Wikipédia (https://en.wikipedia.org/wiki/SawStop) ; la page *Inc.* elle-même m'a répondu « 403 » : NON VÉRIFIÉ à la source** (niveau : SECONDAIRE lu pour la reprise Wikipédia, NON VÉRIFIÉ pour *Inc.*). Attention : le même résumé dit que son doigt est « resté intact » alors que la citation « bled a lot » dit qu'il a saigné — les deux sont dans la version rapportée.
- Version courte de Gass lui-même, rapportée par Kottke : « before the first trade show I had to test it with my actual finger. Thankfully it worked! » — https://kottke.org/21/02/the-table-saw-that-wont-cut-your-fingers-off — SECONDAIRE lu (citation attribuée à Gass ; d'où elle vient — commentaire, entretien — n'est pas précisé).
- => Ce qui est solide : il l'a fait avant le salon de 2000. Ce qui reste à confirmer avant de le dire à l'antenne : « Novocaïne », « annulaire gauche », « deux faux départs ».

---

## 6. L'enjeu : les chiffres des blessures (États-Unis, puis France / Europe)

### 6.1 CPSC, États-Unis — ce que dit le Federal Register (le document le plus solide lu)
Source : *Federal Register*, vol. 88, n° 210, 1er novembre 2023 (supplément à la proposition de règle ; vote de la Commission le 18 octobre 2023 ; proposition initiale : 12 mai 2017 d'après la lecture) — https://www.govinfo.gov/content/pkg/FR-2023-11-01/html/2023-23898.htm — PRIMAIRE lu.
- Tableau 1 du document (blessures de contact avec la lame, traitées aux urgences, estimation annuelle) : **2010 : 30 100 · 2011 : 29 600 · 2012 : 29 500 · 2013 : 29 500 · 2014 : 30 300 · 2015 : 30 800 · 2016 : 30 000 · 2017 : 31 300 · 2018 : 31 300 · 2019 : 30 300 · 2020 : 34 600 · 2021 : 30 000.** (Valeurs telles que renvoyées par l'outil de lecture ; ma moyenne 2010-2021 = 367 300 ÷ 12 ≈ **30 600 par an** — calcul à partir de ces valeurs.) Phrase du document : « there has been no discernible change in the pattern of blade-contact injuries ».
- **Autre chiffre du même document, qui ne colle pas avec le tableau** : « In 2017, there were an estimated 26,500 table saw blade-contact, emergency department-treated injuries », dont « an estimated 16,100 lacerations (60.9 percent), 5,500 fractures (20.6 percent), and 2,800 amputations (10.7 percent) », 96,4 % aux doigts / mains. (Le tableau donne 31 300 pour 2017 : l'écart n'est pas expliqué dans ce que j'ai lu — c'est peut-être une estimation plus ancienne de la même année, rappelée par le texte. **À ne pas mélanger : « 26 500 en 2017 » et « 31 300 en 2017 » sont deux versions dans le même document.**)
- Les 2 800 amputations (2017) sont un chiffre de la **CPSC lu dans le texte** ; « environ 4 000 amputations par an » est un chiffre rapporté par NPR (ci-dessous), non retrouvé dans le document lu.
- Gain attendu de la règle : « net benefits would range from approximately $1.28 billion to $2.32 billion per year » — même document — PRIMAIRE lu.
- Vitesse d'approche réelle de la main dans les accidents : « the approach rate is unlikely to exceed 0.368 m/s » — même document — PRIMAIRE lu (l'essai de la règle prend 1 m/s, donc 2,7 fois plus).
- Kickback : « most blade-contact injuries are not related to kickback, and in almost all instances AIM systems prevented serious injury, whether or not kickback was a factor » — même document — PRIMAIRE lu (c'est la position de la CPSC, que l'industrie conteste).

### 6.2 Les autres versions qui circulent (et leur niveau)
- NPR / MPR News, 2 avril 2024 : « approximately 30,000 blade-contact injuries require medical treatment each year » ; « About 4,000 result in amputations » ; « An average of more than 10 people per day in the U.S. suffer amputations » ; « when a person is hospitalized, the societal cost per table saw injury exceeds $500,000 » — https://www.mprnews.org/story/2024/04/02/npr-table-saw-injuries-safety-sawstop-cpsc — SECONDAIRE lu. (4 000 ÷ 365 ≈ 11 par jour : cohérent avec « plus de dix par jour ».)
- Planet Money (NPR), 11/10/2024 : « the saws send more than 30,000 people to the emergency room each year » — https://www.wusf.org/2024-10-11/planet-money-what-does-it-take-to-make-table-saws-safer — SECONDAIRE lu.
- Popular Woodworking (date de l'article non repérée sur la page lue, probablement années 2010) : « Over the last 10 years, accidents to users of table saws requiring emergency room treatment have averaged about 38,000 per year, with about 10 percent of those injuries requiring amputation of some form. » — https://www.popularwoodworking.com/article/should-we-license-table-saws/ — SECONDAIRE lu, **daté NON VÉRIFIÉ** : chiffre plus ancien (toutes blessures de scie sur table, pas seulement contact lame ?), à ne pas utiliser.
- Industrie (PTI) : moyenne 2016-2021 de « 33,791 » blessures déclarées, mais « only 25 blade contact injuries involving benchtop table saw over a six-year period » dans les données de ses membres — https://www.powertoolinstitute.com/?p=983 — SECONDAIRE lu (partie adverse). Mon calcul avec le tableau 1 de la CPSC pour 2016-2021 donne 31 250 : le 33 791 vient d'une autre série (toutes blessures de scie sur table ?) — NON VÉRIFIÉ.
- Résumé de recherche web (non relu à la source) : « between 2004 and 2020 … approximately 32,000 emergency department-treated blade-contact injuries … annually » (supposé tiré d'un Federal Register de décembre 2023) et « in 2015 … 33,400 table saw ED-treated injuries, with 30,800 (92 percent) likely related to blade contact » — NON VÉRIFIÉ. (Le 30 800 pour 2015 recoupe le tableau 1 du Federal Register lu.)
- **Recommandation** : « environ 30 000 blessures par an aux urgences américaines, causées par le contact avec la lame » (tableau 1, chaque année 2010-2021 entre 29 500 et 34 600 — PRIMAIRE) ; amputations : « plus de 2 800 par an » (CPSC, 2017, PRIMAIRE) ou « environ 4 000 » (NPR, SECONDAIRE) — choisir le premier si on veut le chiffre le plus sûr.

### 6.3 France / Europe
- **Aucun chiffre français ou européen propre à la scie sur table n'a été retrouvé dans une source lue** (recherches INRS / Assurance Maladie / Assemblée nationale : seulement des statistiques générales sur les machines à bois, les scieries, la main). Ne pas en inventer.
- Contexte général sourcé : « Il y a plus de 1,4 million de blessures de la main par an en France et une grande majorité (1,2 million) survient sur le lieu de travail » ; « Une blessure de la main est comptabilisée toutes les huit minutes et elle concerne 28 % des accidents du travail. » — La Revue du Praticien, « Prévention des accidents de la main », 15 février 2024 — https://www.larevuedupraticien.fr/article/prevention-des-accidents-de-la-main — SECONDAIRE lu (la scie circulaire y est citée comme agent vulnérant, sans chiffre propre ; ce ne sont pas des chiffres de scie sur table).
- Technologie SawStop vendue en Europe : Festool TKS 80 EBS, annoncée en 2020 — « Festool are releasing a new table saw on the European market which features licensed Sawstop technology », « the first portable table saw with SawStop technology to be marketed in Europe » — Tooled-Up (revendeur britannique) — https://www.tooled-up.com/blog/festool-tks-80-sawstop-table-saw-uk-release/ — SECONDAIRE lu. Fiche française : « Capteurs sophistiqués qui freinent instantanément la lame dès le moindre contact avec la peau » ; lame 254 mm ; prix catalogue **1 812 € HT** — Batiproduits — https://www.batiproduits.com/fiche/produits/scie-circulaire-sur-table-tks-80-ebs-avec-techno-p372696755.html — SECONDAIRE lu (fiche produit ; date du prix inconnue).
- Propriété : SawStop et Festool appartiennent au même groupe allemand, TTS Tooltechnic Systems (SawStop depuis 2017, d'après l'annonce du 26 juin 2017 citée par Wikipédia) — SECONDAIRE (Wikipédia ; annonce non lue).

---

## 7. L'histoire

### 7.1 Gass, l'idée, les refus
- Stephen (Steve) Gass : « Steve Gass — himself a patent attorney » (NPR/MPR, SECONDAIRE lu) ; appelé « Dr. Gass » dans l'arrêt Osorio (PRIMAIRE lu : docteur, la discipline n'y est pas précisée dans ce que j'ai lu). Qu'il soit **docteur en physique** et que l'**idée date de 1999** : Wikipédia, d'après *Inc.* (juillet 2005) — SECONDAIRE ; l'article *Inc.* n'a pas pu être lu (403).
- Le brevet de base (US 7,055,417) est déposé le **29 septembre 2000** — PRIMAIRE lu.
- Refus des fabricants : « tried to interest manufacturers in licensing his idea. He got no takers. » — NPR/MPR — SECONDAIRE lu. L'arrêt de la cour d'appel (1ᵉʳ circuit) dit que Gass « has presented the technology to several major manufacturers of table saws, including Ryobi in 2000. To date, none of the major power tool manufacturers has adopted SawStop. » — *Osorio v. One World Technologies*, 5 octobre 2011 — https://hallapproved.com/us/cases/ca1/2011/614845 — PRIMAIRE lu (transcription de l'arrêt par un site tiers ; l'original PDF du tribunal n'a pas pu être lu par l'outil). Wikipédia : négociations 2000-2001 ; « In January 2002, SawStop appeared to come close to a licensing agreement with Ryobi » mais Gass « gave up on the effort in mid-2002 » — SECONDAIRE.
- **La création de SawStop** : prototype montré en août 2000 (« three guys out of a barn in Wilsonville »), **première scie commercialisée fabriquée en novembre 2004** (Taïwan) — Wikipédia citant *Inc.* — SECONDAIRE. NPR : « Since SawStop came onto the market in 2004 » — SECONDAIRE lu. => « SawStop sur le marché depuis 2004 » est sûr ; « société créée en 2004 » est **inexact** (la société existe dès 2000).
- Rachat par TTS (Festool) en 2017 : voir 6.3.

### 7.2 Le procès Osorio
- Carlos Osorio, Malden (Massachusetts), pose du parquet ; blessé le **19 avril 2005** avec une scie de table Ryobi BTS15. Verdict de jury en **mars 2010** : **1,5 million de dollars** contre One World Technologies (Ryobi) ; le jury répartit la responsabilité 35 % Osorio / 65 % Ryobi ; l'arrêt de la cour d'appel du 1ᵉʳ circuit (5 octobre 2011) confirme. — Woodshop News, https://www.woodshopnews.com/news/table-saw-suit-nets-1-5m-verdict (date « March 2010 » ; « two severed tendons » ; « the design of the bench-top table saw was defective because it did not have a system to protect the user in the event of contact », propos rapportés de Gass) et arrêt (hallapproved.com ci-dessus : « the jury also found that Osorio was negligent and thirty-five percent at fault for the accident ») — SECONDAIRE (Woodshop News) / PRIMAIRE (arrêt). Gass a témoigné comme expert (Wikipédia). Précision : le 1,5 M$ est le montant du jury avant partage éventuel de responsabilité — le montant exact payé après les 35 % n'est pas dans ce que j'ai lu : NON VÉRIFIÉ.

### 7.3 Bosch Reaxx
- Février 2015 : Bosch dévoile le **REAXX** au salon World of Concrete (Las Vegas) — Wikipédia (d'après Design News / presse) — SECONDAIRE.
- 9 septembre 2016 : le juge administratif de l'ITC (Thomas B. Pender) rend une décision préliminaire : « the Bosch Reaxx saw infringes patents related to SawStop's » technologie — Woodworkers Journal — https://www.woodworkersjournal.com/recent-developments-sawstop-bosch-litigation/ — SECONDAIRE lu (la page lue date d'octobre 2016 et dit que la décision finale était attendue début janvier 2017). Brevets en cause : 7,895,927 et 8,011,279 (Wikipédia, d'après la presse) — SECONDAIRE.
- Issue : « when Bosch Power Tools began selling a saw with its own version of an injury-mitigation system, SawStop won a patent-infringement suit » ; « Bosch never reintroduced it to the U.S. market » — NPR/MPR — SECONDAIRE lu. Différence technique : le CPSC écrit que « The Bosch REAXX retracts the blade with an explosive discharge » (Federal Register, PRIMAIRE lu) ; qu'il évite de ruiner la lame est NON VÉRIFIÉ (résumé de recherche web non relu).
- Troisième acteur nommé par la CPSC : le groupe Felder : « three firms that supply…table saws equipped with AIM technology. These are SawStop (now owned by TTS)…Bosch…and the Felder Group » — Federal Register — PRIMAIRE lu. En mai 2024, SawStop (SawStop Holding LLC) a attaqué Felder KG pour contrefaçon : déclaration des commissaires Feldman et Dziak du 21 mai 2024 — https://www.cpsc.gov/About-CPSC/Commissioner/Douglas-Dziak/Statement/Statement-of-Commissioners-Peter-A-Feldman-and-Douglas-Dziak-Table-Saw-Lawsuit-Underscores-SawStop%E2%80%99s-Intention-to-Act-as-a-%E2%80%9CGatekeeper%E2%80%9D-With-Its-Patents — PRIMAIRE lu (déclaration d'une agence ; opinion de deux commissaires : SawStop posséderait « more than 100 patents » et serait un « gatekeeper »).

### 7.4 La règle CPSC et le brevet 9,724,840 — où on en est (octobre 2026)
- Chronologie : avis préalable de 2011 (le numéro « 76 Fed. Reg. 62678 » donné par la CPSC renvoie au volume 76 du Federal Register, soit 2011 — DÉDUCTION) ; proposition de règle initiale en 2017 (12 mai 2017 d'après la lecture du Federal Register) ; supplément voté le **18 octobre 2023**, publié le **1ᵉʳ novembre 2023** (Federal Register, PRIMAIRE lu) ; audience de la CPSC le **28 février 2024**.
- La promesse : SawStop s'engage à rendre le brevet US 9,724,840 « publicly available upon the effective date of a new rule mandating safety technology on all table saws » ; communiqué du 28 février 2024, annoncé par le PDG Matt Howard : « We invest heavily in safety innovation, and our patents have real value. Even so, we will not allow this patent to be an obstacle to a safer future. » — OH&S, https://ohsonline.com/articles/2024/03/06/sawstop-to-dedicate-patent-to-public-amid-proposed-safety-rule-for-table-saws.aspx — SECONDAIRE lu. NPR : « dedicate the 840 patent to the public » si une norme était adoptée — SECONDAIRE lu. => la promesse est **conditionnelle** (« si la règle entre en vigueur »).
- Le brevet '840 : délivré le 8 août 2017, échéance indiquée **8 avril 2033** — Google Patents — PRIMAIRE lu.
- **État actuel : la règle a été RETIRÉE.** Le 20 août 2025, la CPSC annonce retirer « several existing and pending rulemakings », parmi lesquelles « Safety Standard Addressing Blade-Contact Injuries on Table Saws (76 Fed. Reg. 62678) » — communiqué de la CPSC, 20/08/2025 — https://www.cpsc.gov/Newsroom/News-Releases/2025/CPSC-Withdraws-Rules-That-Are-Outdated-Fail-to-Advance-Safety-New-Leadership-Focuses-on-Hazards-That-Pose-Real-Risks — PRIMAIRE lu. Explication du président par intérim Peter Feldman : « Regulations that promote unscientific agendas, impose unnecessary costs, and reduce competition are no longer agency priorities. » (même communiqué) ; d'après ToolGuyd (secondaire lu) il parle de ne pas « squander limited resources on symbolic rules that serve ideological ends, diminish consumer choice, or hand unfair market advantages to foreign competitors » — https://toolguyd.com/cpsc-sawstop-table-saw-safety-rulemaking-withdrawal/ — SECONDAIRE lu.
- Conséquence : aucune règle n'est en vigueur ; la condition de la promesse (« effective date of a new rule ») n'est donc pas remplie. Je n'ai lu **aucune source** indiquant que SawStop ait cédé le brevet quand même (recherches d'octobre 2026 : rien de postérieur à août 2025 sur la règle) — NON VÉRIFIÉ qu'il n'y a pas eu de geste unilatéral depuis ; état au 2026-10-08 : « retirée, brevet non cédé à ma connaissance ».
- Le brevet de la plongée (US 8,061,245, § 4) arrive à échéance le 29 mai 2026 : il a donc, en principe, expiré en 2026 — un fait bon pour une phrase « le principe de la lame qui plonge sous la table est tombé dans le domaine public cette année » — **NON VÉRIFIÉ** (échéance estimée par Google Patents ; maintenance non contrôlée ; et SawStop détient « more than 100 patents »).
- Aucune règle équivalente en Europe n'a été retrouvée.

---

## 8. Les idées reçues à retourner (le cœur de la chute) — ce qui est exact

1. **« Elle voit ton doigt. »** — Non. Elle ne reconnaît ni un doigt ni de la peau : elle mesure un petit signal électrique porté par la lame, et ton corps, en la touchant, **s'ajoute au circuit** (capacité du corps ≈ 300 pF qui s'ajoute à celle de la lame ; le signal chute). Brevet US 7,055,417 — PRIMAIRE lu. Preuve par la saucisse : elle ne marche que **tenue par une personne** (Kottke — SECONDAIRE lu). Corollaire : n'importe quel conducteur peut la déclencher (bois très mouillé, métal, agrafes — PSU, PTI — SECONDAIRE lu).
2. **« Elle freine. »** — Non. Un frein serre ; ici un **bloc est jeté dans les dents** par un ressort libéré par un fil qui fond (brevet — PRIMAIRE lu). Et la lame comme la cartouche sont **sacrifiées** : « The blade is ruined in the process, and the cartridge will need to be replaced. » (Fine Woodworking 2004 — SECONDAIRE lu).
3. **« Elle s'arrête… puis un moteur la range. »** — Non. C'est **l'élan de la lame elle-même** qui, en butant sur le bloc, fait basculer lame + arbre + cartouche vers le bas (« Thus, the angular momentum of the blade causes the retraction », brevet US 8,061,245 — PRIMAIRE lu) ; la lame est entièrement sous la table environ 14 ms après la détection (même brevet, valeur de démonstration).
4. **« Elle fait la différence entre le bois et la chair. »** — Pas vraiment : elle mesure de l'électricité, pas de la matière ou de la dureté. Un bois sec ne change presque pas le signal (DÉDUCTION, voir § 1.3) ; un bois très mouillé, une agrafe peuvent déclencher la scie à tort (PSU, PTI — SECONDAIRE lu).
5. **« Zéro blessure. »** — Non : « a little nick » (Gass), une plaie de 1/16 pouce de profondeur avec une saucisse (Fine Woodworking : 2-3 points de suture au plus) ; la CPSC dit « almost all instances AIM systems prevented serious injury » (« presque tous les cas », pas tous).
6. **« Une démo avec une saucisse suffit à tout prouver. »** — La saucisse sert car elle a, tenue à la main, des propriétés électriques proches du doigt (Gass, rapporté par Kottke). C'est une démonstration, pas un essai de blessure.
7. **« SawStop, c'est un tour de passe-passe de laboratoire. »** — Le brevet de base date de **septembre 2000** (déposé), la scie est vendue depuis **2004** : plus de vingt ans.
8. **« C'est obligatoire. »** — Non : la règle américaine a été retirée le 20 août 2025 (communiqué CPSC — PRIMAIRE lu). Pas de règle équivalente retrouvée en Europe.
9. **« Tous les fabricants ont refusé. »** — Prudence : Gass a présenté la technologie à plusieurs grands fabricants dont Ryobi en 2000, « none … has adopted SawStop » (arrêt Osorio). Le détail des offres de licence est contesté (industrie : SawStop « declined various offers to license our technology »; commissaires CPSC : SawStop agit en « gatekeeper »). Dire le fait simple : « personne n'a pris la licence ».

---

## 9. Les limites honnêtes

- **Rejet de la pièce (kickback)** : le système réagit au contact peau-lame, pas à une pièce de bois projetée. Industrie : « SawStop cannot mitigate fractures and crushing injuries caused by workpiece kickback or loss of vision caused by high velocity particles ejected by the saw blade. » (PTI — SECONDAIRE lu, partie adverse). CPSC : « most blade-contact injuries are not related to kickback » (PRIMAIRE lu). La SawStop de 2004 est livrée avec un couteau diviseur (« riving knife ») contre le rejet (Fine Woodworking 2004 — SECONDAIRE lu). Un atelier universitaire le rappelle : kickback contrôlé par « Riving knife, push stick, appropriate push technique » (PSU — SECONDAIRE lu).
- **Vitesse de la main** : la profondeur de la coupure augmente avec la vitesse d'approche. Ce qui est lu : la règle CPSC teste à 1 m/s et limite à 3,5 mm (PRIMAIRE) ; les accidents réels sont « unlikely to exceed 0.368 m/s » (PRIMAIRE) ; le brevet vise « one-eighth of an inch » pour un arrêt en 1/100 s. Ma conversion : à 0,3048 m/s (1 pied par seconde) pendant 5 ms la main avance de 1,5 mm (≈ 1/16 pouce) — c'est ce que dirait la notice SawStop (« 1 foot per second … 1/16th of an inch or less », selon un résumé de recherche web de la FAQ ; **non relu à la source : NON VÉRIFIÉ**). Une main projetée très vite (gant qui accroche, chute) coupe plus profond : même résumé de recherche web, NON VÉRIFIÉ ; l'atelier PSU interdit déjà les gants (« NO gloves ») — SECONDAIRE lu.
- **Faux déclenchements** : bois mouillé / traité sous pression, agrafes, charbon de découpe laser (PSU) ; décharges statiques, tensions parasites, bois traité (PTI : « activation rate of more than one per year » dans leurs données — sans préciser pour quelle population — SECONDAIRE lu, partie adverse). Chaque faux déclenchement coûte une cartouche et une lame (§ 5.1).
- **Coût** : voir § 5.1 et § 10. Prix du marché américain : la CPSC estime que les prix des scies d'entrée de gamme « will more than double to $400 or more » et « could increase by as much as $285 to $700 per unit » — Federal Register — PRIMAIRE lu (estimation de la CPSC, pas un prix catalogue).
- **Ce que le système ne remplace pas** : le protège-lame, le couteau diviseur, le pousse-bois, la bonne technique (l'atelier PSU les liste comme contrôles séparés — SECONDAIRE lu) ; le système ne protège que du contact avec la lame.

---

## 10. Pour l'appel au commentaire : questions et matière vraie

1. **« Tu mettrais ton doigt ? »** — Matière : Gass l'a fait lui-même avant le salon de 2000 (« I had to test it with my actual finger. Thankfully it worked! » — Kottke citant Gass ; Novocaïne, annulaire gauche : *Inc.* 2005 via Wikipédia, NON VÉRIFIÉ à la source). Réponse en un mot pour le film : « Gass l'a fait. Avec de la Novocaïne. » (à ne dire qu'avec Novocaïne confirmée ; sinon : « Gass l'a fait. »)
2. **« Elle coûte plus cher : tu paies ? »** — Matière : la cartouche à 119 $ (Highland) contre un coût sociétal de plus de 500 000 $ par hospitalisation (CPSC via NPR) ; la CPSC estime +285 à +700 $ par scie d'entrée de gamme ; en France, la Festool TKS 80 EBS à 1 812 € HT (Batiproduits). Les ordres de grandeur sont sourcés ; ne pas conclure à ta place.
3. **« Pourquoi toutes les scies n'en ont pas ? »** — Matière : brevets (plus de 100 selon deux commissaires CPSC), règle américaine retirée le 20 août 2025, promesse de céder le brevet '840 conditionnelle (§ 7.4). C'est la question la plus riche pour un fil de commentaires, mais elle touche à des affaires de brevets : formuler les faits (« la règle a été retirée »), pas de procès d'intention.
4. **« Tu l'as déjà vue déclencher ? »** — Matière : une cartouche détruite, une lame ruinée, un coût de 119 $ + une lame — à relier au doigt sauvé.

---

## 11. Simplifications possibles (acceptables à l'antenne)

- « Moins de cinq millisecondes » (SawStop) → « en quelques millisecondes » ou « avant que tu aies le temps de bouger ». Pour l'image : un **tiers de tour** de lame pendant l'arrêt (calcul § 3.3 : à 4 000 tr/min, 5 ms = 0,33 tour — la vitesse de rotation est l'hypothèse non vérifiée ; le « tiers de tour » ne vaut que si la lame tourne bien autour de 4 000 tr/min).
- Le frein : « un bloc d'aluminium, poussé par un ressort, retenu par un fil qui fond » (brevet : le sabot peut être en plastique, bois ou métal tendre comme l'aluminium ; SawStop commercial : aluminium selon les revendeurs).
- La détection : « ton corps change le petit signal que porte la lame » (≈ 200 kHz, capacité du corps ≈ 300 pF — brevet).
- La plongée : « l'élan de la lame la tire sous la table » (brevet 8,061,245 ; ≈ 14 ms).
- Les blessures : « environ 30 000 par an aux urgences américaines, des milliers d'amputations » (CPSC : 2 800 amputations en 2017).
- L'argent : « une cartouche détruite et une lame, une centaine de dollars chacune ou moins » — cartouche 119 $ (revendeur), lame 60-80 $ (industrie).
- L'histoire : « un inventeur, avocat en brevets, propose l'idée aux fabricants en 2000 ; personne ne prend la licence ; il vend lui-même la scie à partir de 2004 ».
- Le point d'actualité : « aux États-Unis, la règle qui aurait imposé ça à toutes les scies a été retirée en août 2025 ».

---

## 12. À NE PAS DIRE (affirmations fausses, non sourcées ou à risque)

1. « La lame s'arrête en 5 millisecondes » (sans nuance) → c'est « en **moins de** 5 millisecondes » selon SawStop, rapporté par deux revendeurs ; le brevet de 2000 dit « < 10 ms préféré, < 5 ms » et « 2-10 ms » ; **je n'ai pas lu la page SawStop**.
2. « Plus vite qu'un airbag / qu'un clignement d'œil » : c'est une phrase de magazine (Woodworkers Journal), pas une mesure ; et 002 est sur l'airbag — éviter la comparaison croisée sans mesure.
3. « Elle sent la peau » ou « elle voit le doigt » → elle sent un changement électrique ; tout conducteur peut la déclencher.
4. « La lame est réutilisable » / « on remet une cartouche et c'est reparti » sans dire que la lame est ruinée → faux (Fine Woodworking 2004).
5. « Le doigt est intact » / « zéro blessure » → une entaille, parfois quelques points de suture (1/16 pouce de profondeur dans le test à la saucisse). Garde « une égratignure » seulement si on l'assume comme formule de Gass (« a little nick »).
6. « Gass s'est mis le doigt dans la lame sans anesthésie » / « Novocaïne, annulaire gauche, deux faux départs » : les détails viennent de Wikipédia citant *Inc.* 2005 (page illisible) — NON VÉRIFIÉ ; le fait « il a testé avec son doigt avant le salon de 2000 » est rapporté par Kottke (citation de Gass).
7. « SawStop a été fondée en 2004 » → la société existe en 2000 ; 2004 = première scie commercialisée.
8. « Plus de 10 000 doigts sauvés » → **allégation de Gass**, auto-déclarée (Planet Money 2024), non auditée. À ne dire qu'attribuée.
9. « 38 000 blessures par an » → chiffre ancien (Popular Woodworking, date non établie) ; « 32 000 » et « 33 400 » → résumés de recherche web, non relus. Utiliser ~30 000 (CPSC, tableau 1, PRIMAIRE).
10. « 26 500 blessures en 2017 » ET « 31 300 blessures en 2017 » → deux chiffres du même Federal Register, non réconciliés : ne pas citer une année précise ; dire « environ 30 000 par an ».
11. « Environ 4 000 amputations par an » → NPR (secondaire) ; le chiffre CPSC lu est 2 800 amputations en 2017. Choisir l'un et l'attribuer.
12. « La loi / l'Europe impose ces scies » → faux : pas de règle américaine (retirée 20/08/2025) ; aucune obligation européenne retrouvée.
13. « Le brevet de SawStop est maintenant libre / dans le domaine public » → pas pour le '840 (échéance 2033, promesse conditionnelle à une règle qui n'existe plus). Le brevet 8,061,245 (la lame qui plonge) a, selon Google Patents, une échéance au 29 mai 2026 : NON VÉRIFIÉ au-delà.
14. « Bosch a été interdit / Bosch a perdu parce qu'il avait copié » → on sait : SawStop a gagné la procédure ITC pour contrefaçon, Bosch n'a jamais remis le Reaxx sur le marché américain (NPR). Ne pas attribuer d'intention.
15. « Tous les fabricants ont refusé par cupidité » / « SawStop bloque tout le monde » → opinions : l'industrie et deux commissaires de la CPSC disent le second (« gatekeeper »), SawStop et les défenseurs de la règle disent le contraire. Rester sur les faits : « personne n'a pris la licence ; la règle a été retirée ».
16. « Elle coûte 100 $ de plus » → pas de chiffre commun : cartouche 119 $ (2026, revendeur) ; estimation CPSC +285 à +700 $ sur une scie d'entrée de gamme ; aucune comparaison de prix de scie lue côté SawStop.
17. « Elle se déclenche tous les ans » → l'industrie dit « activation rate of more than one per year » (population non précisée) — NON VÉRIFIÉ ; ne pas citer.
18. « 4 000 tr/min » ou « 190 km/h en bout de dent » → hypothèse non vérifiée (§ 3.3).

---

## 13. Trois chiffres qui claquent, parfaitement sourcés

1. **Environ 30 000 blessures par contact avec la lame, par an, aux urgences américaines** — tableau 1 du Federal Register (CPSC, 1er novembre 2023) : entre 29 500 et 34 600 chaque année de 2010 à 2021, « no discernible change in the pattern » ; 30 000 en 2021 — https://www.govinfo.gov/content/pkg/FR-2023-11-01/html/2023-23898.htm — PRIMAIRE lu. (Plus : 2 800 amputations en 2017 dans le même document.)
2. **Moins de 5 millisecondes** pour arrêter la lame — formule de SawStop rapportée par Woodcraft et Toolnut (SECONDAIRE lu) et brevet US 7,055,417 (« stopping times of less than 5 milliseconds » préférés — PRIMAIRE lu). À dire « selon SawStop ».
3. **Environ 14 millisecondes pour que la lame soit entièrement sous la table**, par le seul élan de la lame — brevet US 8,061,245 B2 : « retract the blade completely below table 303 within approximately 14 milliseconds after contact is detected » — https://patents.google.com/patent/US8061245B2/en — PRIMAIRE lu (valeur de démonstration d'un brevet).
- Mentions honorables, toutes PRIMAIRE lu : **3,5 mm** (profondeur max. de la règle CPSC à 1 m/s) ; **≈ 300 picofarads** (capacité du corps dans le brevet) ; **200 kHz** (signal de la lame) ; **1/100 de seconde → 1/8 de pouce** (brevet).

---

## 14. Ce qui n'a pas pu être lu (et ce que ça change)

- **sawstop.com** (technologie, FAQ, communiqués) : « 403 » à chaque tentative → pas de phrase SawStop lue à la source ; la formule « less than 5 milliseconds », le « mode bypass », la remise de cartouche gratuite viennent de revendeurs ou de résumés de recherche.
- Article *Inc.* (Newsome, 2005, test au doigt, idée de 1999) : 403. Transcription NPR de l'épisode 1200551215 : délai dépassé. Woodworking Network : 403. L'arrêt PDF du tribunal (ca1.uscourts.gov) : binaire illisible, remplacé par une transcription (hallapproved.com).
- Lumafield (CT scan d'une SawStop) : la page ne contient pas l'article. Fiches Sauter, Toolnut (page technologie) : navigation seule.
- Aucune source primaire lue pour la vitesse de rotation de la lame, le nombre de dents de la lame fournie, la force de ressort **du produit** (celle du brevet est lue), la durée mesurée de la plongée **du produit actuel**.
- Aucune statistique française ou européenne propre à la scie sur table.

---

## 15. URL lues (pages dont le contenu a été exploité)

1. https://www.woodcraft.com/blogs/shop-knowledge-guides/sawstop-table-saw-safety-system-how-it-works-with-video-woodcraft
2. https://patents.google.com/patent/US7055417B1/en
3. https://patents.google.com/patent/US9724840B2/en
4. https://patents.google.com/patent/US8061245B2/en
5. https://www.govinfo.gov/content/pkg/FR-2023-11-01/html/2023-23898.htm
6. https://www.cpsc.gov/Newsroom/News-Releases/2025/CPSC-Withdraws-Rules-That-Are-Outdated-Fail-to-Advance-Safety-New-Leadership-Focuses-on-Hazards-That-Pose-Real-Risks
7. https://www.cpsc.gov/About-CPSC/Commissioner/Douglas-Dziak/Statement/Statement-of-Commissioners-Peter-A-Feldman-and-Douglas-Dziak-Table-Saw-Lawsuit-Underscores-SawStop%E2%80%99s-Intention-to-Act-as-a-%E2%80%9CGatekeeper%E2%80%9D-With-Its-Patents
8. https://hallapproved.com/us/cases/ca1/2011/614845 (arrêt *Osorio*, 1ᵉʳ circuit, 5 oct. 2011)
9. https://www.mprnews.org/story/2024/04/02/npr-table-saw-injuries-safety-sawstop-cpsc
10. https://www.wusf.org/2024-10-11/planet-money-what-does-it-take-to-make-table-saws-safer
11. https://toolguyd.com/cpsc-sawstop-table-saw-safety-rulemaking-withdrawal/
12. https://ohsonline.com/articles/2024/03/06/sawstop-to-dedicate-patent-to-public-amid-proposed-safety-rule-for-table-saws.aspx
13. https://www.powertoolinstitute.com/?p=983
14. https://www.woodshopnews.com/news/table-saw-suit-nets-1-5m-verdict
15. https://www.woodworkersjournal.com/sawstop-come-for-the-safety-stay-for-the-saw/
16. https://www.woodworkersjournal.com/recent-developments-sawstop-bosch-litigation/
17. https://www.finewoodworking.com/2004/12/01/a-safer-tablesaw-finally-arrives
18. https://kottke.org/21/02/the-table-saw-that-wont-cut-your-fingers-off
19. https://www.popularwoodworking.com/article/should-we-license-table-saws/
20. https://www.highlandwoodworking.com/sawstop-10-brake-cartridge.aspx
21. https://www.toolnut.com/products/sawstop-pcs31230-tgp236-220v-single-phase-3-hp-13-amp-10-professional-cabinet-saw-with-36-professional-series-t-glide-fence-system
22. https://originlabs.psu.edu/wp-content/uploads/2023/11/SAFETY-OPERATING-PROCEDURES-SAWSTOP-TABLE-SAW.pdf (PDF lu par extraction de texte locale)
23. https://www.tooled-up.com/blog/festool-tks-80-sawstop-table-saw-uk-release/
24. https://www.batiproduits.com/fiche/produits/scie-circulaire-sur-table-tks-80-ebs-avec-techno-p372696755.html
25. https://www.larevuedupraticien.fr/article/prevention-des-accidents-de-la-main
26. https://en.wikipedia.org/wiki/SawStop (pour trouver les sources — jamais comme source seule)

Ouvertures sans contenu utile (comptées dans le budget) : lumafield.com (×2), sautershop.com, toolnut.com/sawstop-technology, ca1.uscourts.gov (PDF illisible). Total d'ouvertures ayant renvoyé une page : 31 (26 exploitées + 5 vides ou illisibles).


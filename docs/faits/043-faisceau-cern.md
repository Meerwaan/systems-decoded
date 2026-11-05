# 043 — L'arrêt d'urgence du faisceau du LHC : on ne l'arrête pas, on le jette dehors et on l'étale

Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur. Requêtes : ≈ 36 (dépassement du plafond de 30, les téléchargements de PDF comptés). Non lus : voir la fin.

## 1. Verdict sur l'angle

**À ajuster.** Le fond tient, trois mots de l'angle sont faux ou à nuancer :
- « plus fin qu'un cheveu » n'est vrai qu'aux points de collision (σ ≈ 16,7 µm [S, cours CERN]). Dans les arcs ≈ 0,3 mm [S] ; devant le bloc ≈ 1 mm × 1 mm [P arXiv 2110.08783]. Dire « fin comme un trait de crayon » ou ne dire que ce qui est vrai au bloc.
- « énergie d'un train lancé » : tient (362 MJ nominal ≈ train de 200 m à 155 km/h [P Schmidt, arXiv 1608.02433]). Run 3 : plus de 400 MJ, record 430 MJ [P HB2023].
- « en moins d'un tour » : tient pour **l'extraction** (tout le faisceau part en un tour, ≈ 89 µs [P]). Le délai total détection → départ n'est pas chiffré dans les sources lues : ne pas le promettre.

**Vu et revu ?** Le LHC en général, oui (collisions, tunnel). Le *beam dump* (l'arrêt, le bloc de graphite) : rarement traité en 3D, mais je n'ai pas mesuré la saturation sur les réseaux (non vérifié).

**Test du spectacle** : OUI en 3D. Événement physique énorme et en cours dès l'image 1 : un train de paquets de protons file dans l'anneau ; un « trou » noir dans le train ; les 15 aimants s'allument et le faisceau quitte l'anneau, plonge dans une ligne de 700 m, peint un « e » de 1,2 m sur un disque de graphite qui passe au blanc (≈ 1400 °C). Lisible sans le son. Rien de tout cela n'existe en film réel : c'est la force de la 3D.

**Test de l'histoire** : il faut un « quelqu'un ». Il n'y a pas d'humain dans la boucle (le système agit seul). **Angle qui passe les deux : le grain de poussière.** « Un grain de poussière de quelques micromètres tombe dans le LHC. Face à lui, un faisceau de 362 MJ. » Le danger est minuscule et banal, la réaction du système est automatique, et la raison de l'envoyer à un proche est la disproportion (un grain de poussière a déjà fait arrêter la machine : 37 fois entre juillet 2010 et début 2012 [P IPAC12]). Le « toi » du film = le spectateur à la place du faisceau (ou de la poussière).

## 2. La scène

**Scénario typique sourcé (le meilleur)** : *UFO — « unidentified falling objects »*. Des particules de poussière de taille micrométrique (jusqu'à ≈ 100 µm) se détachent, tombent dans le faisceau, provoquent une perte de faisceau d'une durée d'**environ 10 tours** (≈ 1 ms) [P IPAC12, Baer et al.]. Les ≈ 3600 moniteurs de pertes (BLM) la voient ; si le seuil est franchi, la demande de dump part. Depuis juillet 2010, les UFO ont provoqué **37 dumps prématurés** (chiffre à la date de l'article, IPAC 2012). Seuils relevés depuis mi-2011 pour limiter l'impact [P]. Plus de 16 000 événements UFO candidats détectés en 2011, presque tous très en dessous du seuil [P].

**Cas réels datés (pour ancrer, sans en faire le cœur)** :
- **28 nov 2022, 6 h 00** : l'ingénieur en charge du LHC déclenche le dump des derniers faisceaux de protons de 2022 ; « un dernier tour » puis rejetés dans les absorbeurs [P home.cern, rapport LHC]. Scène calme, planifiée.
- **23 nov 2024, 6 h 35** : faisceaux dumpés par des quenchs non voulus (perte de cryogénie en secteur 8-1 ; la perte de faisceau a perturbé l'électronique de protection ; 23 dipôles et 2 quadripôles ont quenché ; ≈ 110 MJ dissipés) ; run arrêté 2 jours avant la date prévue, redémarrage prévu le 5 avril 2025 [P home.cern, accelerator report]. Attention : les 110 MJ sont l'énergie des aimants, pas du faisceau.
- **14 juil 2018** : décharge dans deux aimants de dilution (MKBV), qui s'est propagée avec un retard inattendu de 10 µs et a fait perdre plus de deux dilueurs ; la répartition sur le bloc en a été touchée [P LBDS Run II, IPAC/Evian]. Bon pour « le système a des failles qu'on a corrigées ».

**Pas de scène « tour de garde au CCC » sourcée** : je n'ai trouvé aucun récit d'opérateur daté et vérifiable avec heure et mots. Ne pas inventer de dialogue.

**À montrer** : ●●● la poussière qui tombe dans le faisceau (reconstitution, à dire « reconstitué ») ; ●●● le train de paquets avec son trou ; ●●● l'« e » sur le graphite ; ●●○ l'anneau de 3600 BLM qui s'allument ; ●○○ salle de contrôle (aucune photo à licence libre vérifiée).

## 3. Le système qui sauve

Le LBDS (LHC Beam Dumping System), au **point 6** du LHC, un par faisceau. Ce n'est pas un « bouton d'urgence » rarement utilisé : **chaque fill se termine par un dump**, planifié (10-15 h de fill optimal) ou sur panne ; ≈ **70 % des fills** étaient terminés par une panne (MTBF ≈ 6 h) selon Schmidt [P, arXiv 1601.05207, chiffre de l'époque de Run 1-2, à citer « historiquement »]. Il est conçu pour être **à sûreté intrinsèque** : le signal « tout va bien » doit être actif en permanence ; son absence vaut demande de dump [P 1601.05207]. Après **chaque dump**, un système d'analyse (IPOC) contrôle le tir ; le permis de faisceau n'est rendu que si tous les tests passent [P IPAC16].
Il est le **seul composant** capable d'encaisser la perte totale du faisceau : tout le reste serait gravement endommagé [P 1608.02433].

## 4. Le mécanisme ouvert

**Ordre des événements**
1. Un système détecte une anomalie (BLM, aimants, cryogénie, etc.) → le **Beam Interlock System** transmet une demande de dump [P 1601.05207].
2. Le **système de synchronisation (TSU, redondant)** attend que le **trou sans particules (abort gap, 3 µs)** passe devant les kickers : le dump est calé sur la rotation du faisceau [P]. Le tir attend donc au plus un tour (≈ 89 µs) [déduction; la phrase exacte « en un tour » est dans IPAC16].
3. Les **15 kickers d'extraction MKD** s'allument dans le trou : montée de champ < 3 µs ; mesurée **2,65 et 2,70 µs** à 450 GeV, spéc. < 2,80 µs [P IPAC16].
4. Les **septa MSD** (15 par faisceau) courbent le faisceau de 2,4 mrad vers le haut/hors de l'anneau [P 1601.05207] ; les MKD donnent 0,275 mrad au total [P IPAC16].
5. Les **dilueurs MKB** (4 horizontaux + 6 verticaux) alimentés en sinusoïdes déphasées font tourner le faisceau pour peindre une trace en forme de « e » de **1,2 m** sur la face du bloc [P 2110.08783].
6. **Ligne d'extraction de 700 m** : elle laisse le faisceau s'élargir (σ de 0,2 à 1,5 mm [P 1601.05207] ; 1,1 × 1,0 mm à 6,8 TeV [P 2110]).
7. Le **bloc TDE** absorbe. La trace dure **≈ 89 µs** (un tour) [P].

**Pièces (le mot du métier)** : kicker/aimant d'extraction (MKD, 1,4 m, 30 kV, 19 kA [P IPAC16]) · septum (MSD) · aimants de dilution (MKB H/V) · ligne d'extraction · fenêtre d'entrée en titane (Ti grade 5, ajoutée au LS2) [P 2110] · bloc d'absorption TDE (« Target Dump External ») · moniteurs de pertes BLM (≈ 3600 chambres d'ionisation, fenêtre d'intégration de 40 µs [P]).

**Le bloc** : cylindre en acier duplex 318LN de **8,52 m** de long et **722 mm** de diamètre, **≈ 6,2 t** (6,4 t selon une autre étude), noyau de graphite de densités différentes qui absorbent le faisceau « progressivement » ; sous azote à **1,2 bar** (contre l'oxydation du graphite) ; fenêtre aval en titane [P 2110.08783 ; masse 6,2 t et 1 700 disques de graphite expansé de 2 mm [S home.cern]]. Le noyau fait ≈ 15 longueurs d'interaction nucléaire : il ne reste que 3×10⁻⁵ % des protons de 7 TeV [P 2110].
**Refroidissement : de l'air**, soufflé en continu sous le noyau [P 2110] — pas de l'eau (le dump du Tevatron utilisait de l'eau, pas le LHC).
**Température** : simulation Run 3 : pic dans le noyau ≈ **1416 °C** (≈ 2,5 kJ/g) ; l'enveloppe en acier monte à un maximum de **194 °C après ≈ 13 min** ; il reste **13,4 % de la chaleur dans le noyau après 12 h** [P 2110]. Ancien chiffre de conception : ≈ 800 °C pour le faisceau nominal [P 1601.05207] : les deux ne se mélangent pas.

**Pourquoi ça marche (phrase du beat « principe »)** : *un faisceau concentré sur un seul point percerait n'importe quel matériau ; on le fait donc sortir de l'anneau, s'élargir sur 700 m, puis tourner pour dessiner un « e » de 1,2 m, et ce qu'aucun matériau n'encaisserait en un point, un bloc de graphite l'encaisse étalé.* Sourcé : « même les absorbeurs les plus robustes ne supporteraient pas l'impact du faisceau plein sur un seul point » [P 2110.08783 §3.4]. Chiffre qu'on retient : **1,2 m** de trace, **89 µs**, **1400 °C**.

**Délais** : détection par BLM : fenêtre de 40 µs [P] ; perte UFO ≈ 10 tours [P] ; kicker < 3 µs ; abort gap 3 µs ; tour 89 µs. **Délai complet détection → faisceau parti : non chiffré dans mes sources, ne pas l'annoncer.**

**Redondance** : 15 kickers, la machine tolère la perte d'un (14 sur 15) [S, résumé de recherche d'une revue de risque, non ouverte] ; chaque générateur MKD a deux circuits redondants qui se partagent le courant [P IPAC16] ; TSU redondante [P Evian 2019] ; liaison directe du re-déclenchement LBDS au BIS [P Evian 2019].

**Si le dump sort mal** : un dump non synchronisé balaierait le faisceau sur l'ouverture : protégé par le TCDS (absorbeur fixe) et le TCDQ (absorbeur mobile) [P]. Test périodique : on éteint l'accélération RF pour que le faisceau remplisse le trou, puis on dumpe [P Evian 2019].

## 5. Chiffres

| Chiffre | Source | Niveau |
|---|---|---|
| 362 MJ par faisceau (conception : 2808 paquets, 1,15×10¹¹ p, 7 TeV) | arXiv 1608.02433 (Schmidt) | P |
| ≈ train de 200 m à 155 km/h ; ≈ 90 kg de TNT | idem | P |
| Run 3 : 6,8 TeV, ≈ 2500 paquets de 1,6×10¹¹ ; record **430 MJ** ; « plus de 400 MJ » | HB2023 THBP49 (Redaelli) | P |
| Blocs refaits pour recevoir **539 MJ** par dump (Run 2 fin : 320 MJ) | arXiv 2110.08783 | P |
| 5 % d'un paquet nominal (10¹¹ p) suffit à endommager une bobine supraconductrice à 7 TeV | 1608.02433 | P |
| Dégâts sur métal dès ≈ 10¹⁰ protons | 1601.05207 | P |
| Tour = **≈ 89 µs** | 2110, IPAC16 | P |
| Abort gap **3 µs** ; montée kicker mesurée 2,65–2,70 µs | IPAC16, 1601.05207 | P |
| 15 MKD par faisceau, 1,4 m, 30 kV, 19 kA | IPAC16 | P |
| 4 MKBH + 6 MKBV ; trace en « e » de 1,2 m | 2110 | P |
| Ligne de 700 m | 2110, 1601 | P |
| Bloc : 8,52 m × 722 mm, ≈ 6,2 t, N₂ 1,2 bar | 2110 ; home.cern | P / S |
| Pic ≈ 1416 °C (noyau), enveloppe 194 °C à 13 min | 2110 | P (simulation) |
| ≈ 3600 BLM ; fenêtre 40 µs | 1601.05207, IPAC12 | P |
| 37 dumps UFO (jusqu'à début 2012), ≈ 10 tours de perte | IPAC12 | P |
| 70 % des fills finissent par panne ; MTBF ≈ 6 h (Run 1-2) | 1601.05207 | P (daté) |
| Bloc : 3 défaillances de dilution > 150 MJ en 9 ans, la pire **196 MJ** | arXiv 2505.04235 | P (résumé de lecture, partiel) |
| Vitesse du faisceau ≈ c ; anneau ≈ 26,7 km | connu, non rouvert ici | O |
| 500 kg de cuivre fondus par un faisceau (498 kg) | CERN outreach, **page non ouverte** (DNS) | S/O |

## 6. Ce qui retourne une idée reçue (candidates de chute)

1. **On n'arrête pas le faisceau, on l'étale.** Aucun matériau n'encaisse 400 MJ en un point ; le salut vient de 700 m de ligne et d'un « e » de 1,2 m (cause physique, sourcée).
2. **Le système qui te sauve se déclenche tout seul pour un grain de poussière.** 37 dumps dus à des poussières ; on a ensuite relevé les seuils pour qu'il ne se déclenche pas trop (compromis protection/disponibilité, sourcé).
3. **Le même système vérifie qu'il marchera la prochaine fois.** Après chaque dump, tests ; si un seul échoue, pas de faisceau (IPOC, sourcé).
4. **Le bloc n'est pas indestructible.** Après 9 ans, les plaques de graphite extrudé étaient fissurées (une de ≈ 50 cm) ; on les a exclues des blocs de rechange [P home.cern, arXiv 2505.04235]. Retourne « bloc de graphite = invincible ».

## 7. La question du commentaire (fermée, deux camps, un mot)

- « Un grain de poussière peut tout arrêter. Pour toi, ce système est fragile… ou solide ? »
- « Ce bloc de 6 tonnes avale 400 mégajoules. Refroidi à l'eau… ou à l'air ? » (réponse : air, sourcé ; la réponse surprend)
- « Au moindre doute, il coupe. Tu préfères une machine qui coupe trop… ou pas assez ? »
(Aucune n'est « faisable chez soi » : le LHC n'a pas d'équivalent domestique. La première se rapproche d'un détecteur de fumée « fragile / solide ».)

## 8. L'histoire du système

Conçu à la fin des années 1990 (bloc d'origine, dessin de la fin des années 1990 [P 2110]) pour le LHC du CERN. Démarrage du LHC en 2009 (Run 1), 4 TeV puis 6,5 TeV. Fuite d'azote observée en 2015 ; vibrations et déplacement du bloc mesurés par interféromètres ; blocs entièrement refaits pendant le LS2 (2019-2021), fenêtres en titane. Run 3 depuis 2022 à 6,8 TeV, jusqu'à 539 MJ par dump à la conception [P 2110.08783].

## 9. Pour l'annonce

- **Phrase (16 mots)** : « Un faisceau de protons porte l'énergie d'un train lancé, et un bloc de graphite doit l'avaler. »
- **Un seul fait sûr (fin du film précédent)** : « Un faisceau du LHC, c'est 362 mégajoules : l'énergie d'un train de 200 mètres à 155 kilomètres-heure. » [P Schmidt]. Variante moins chiffrée : « Ce bloc pèse six tonnes. »
(Je n'ai pas les faits du dossier 044 : l'annonce du 044 à la fin du 043 doit venir de son dossier.)

## 10. À ne pas dire

- « Plus fin qu'un cheveu » partout : faux au bloc (≈ 1 mm).
- **L'incident de 2008 n'était pas le faisceau** : défaut d'interconnexion d'aimant, arc électrique, onde de pression d'hélium, ≈ 600 m abîmés, 53 aimants à réparer [P 1608.02433]. Ne pas le lier au beam dump. Seulement utile : il a limité l'énergie à 4 TeV (≈ 140 MJ) pendant 2009-2013.
- **L'essai de 2004** : c'était au SPS (ligne TT40, 25 oct 2004, 23 h 46), faisceau de 3,2×10¹³ protons à 450 GeV mal dirigé par un septum ; chambre à vide « déchirée » sur ≈ 20 cm (échauffement sur ≈ 1 m), aimant remplacé une semaine plus tard, ≈ 24 h d'arrêt [P Wenninger, slides]. L'énergie ≈ 2,3 MJ [calcul O ; une note CERN citée par recherche dit ≈ 2,5 MJ, non ouverte] = moins de 1 % du faisceau LHC nominal. Ne pas dire « c'était le LHC ».
- **362 MJ ≠ 400 MJ ≠ 539 MJ** : conception / Run 3 mesuré / limite de conception du bloc. Par faisceau, pas pour les deux.
- Comparaisons de train variables (CERN : 400 t à 150 km/h ; autres : 160 ou 200 km/h) : prendre Schmidt (200 m, 155 km/h) ou dire « un train lancé ».
- « Refroidi à l'eau » : faux (air).
- « 800 °C » = ancien chiffre de conception ; Run 3 : ≈ 1400 °C (simulation).
- « Le bloc est neuf tous les tirs » : non ; il sert à chaque fin de fill. 9 ans de service avant remplacement.
- « Tout s'arrête en 89 µs » : 89 µs = durée de l'extraction, pas le délai depuis la détection.
- Ne pas montrer ni citer la photo CERN d'un bloc : « © CERN. Some rights reserved », usage non commercial, licence non vérifiée page par page → on reconstitue en 3D.

## 11. Ce que la voix peut dire (vraies telles quelles)

1. Un grain de poussière tombe dans le faisceau.
2. Trois mille six cents capteurs guettent la moindre perte.
3. Un tour de l'anneau dure quatre-vingt-neuf microsecondes.
4. Dans le faisceau, un trou. Trois microsecondes sans aucun proton.
5. C'est dans ce trou que quinze aimants s'allument.
6. Le faisceau quitte l'anneau. Sept cents mètres de ligne.
7. Il ne tape pas au même endroit. Il dessine un « e ».
8. Une trace d'un mètre vingt sur le graphite.
9. Six tonnes, huit mètres et demi, refroidi par de l'air.
10. Trois cent soixante-deux mégajoules, c'est un train de deux cents mètres à cent cinquante-cinq.

## 12. Sources (ce que j'y ai lu)

- [P] J. Uythoven et al., « Injection and Dumping Systems », arXiv 1705.09502 : montée de l'extraction 3 µs synchronisée à un trou sans faisceau ; dilueurs en sinusoïdes déphasées → ellipse ; TDE sous N₂ ; TCDS/TCDQ. https://arxiv.org/pdf/1705.09502 (lu en PDF local).
- [P] J. Maestre et al., « Design and behaviour of the LHC external beam dumps capable of receiving 539 MJ/dump », arXiv 2110.08783 : dimensions du bloc, 89 µs, « e » de 1,2 m, 4 H + 6 V, 1416 °C, 194 °C à 13 min, air, N₂ 1,2 bar, 6 t. https://arxiv.org/pdf/2110.08783
- [P] R. Schmidt, « Introduction to Machine Protection », arXiv 1608.02433 : 362 MJ, train 200 m à 155 km/h, 90 kg TNT, 2008, 2808 paquets. https://arxiv.org/pdf/1608.02433
- [P] R. Schmidt, « Machine Protection », arXiv 1601.05207 : 15 kickers < 3 µs, 280 µrad, 2,4 mrad, 10 dilueurs, ligne 700 m, BLM 40 µs, 3600 BLM, fail-safe, 70 % des fills, ≈ 800 °C. https://arxiv.org/pdf/1601.05207
- [P] T. Baer et al., « UFOs in the LHC », IPAC2012 THPPP086 : 37 dumps, ≈ 10 tours, 16 000 événements. https://accelconf.web.cern.ch/IPAC2012/papers/THPPP086.pdf
- [P] IPAC2016 THPOR052 : montée MKD 2,65/2,70 µs, 15 MKD, 30 kV, 19 kA, 89 µs, IPOC après chaque dump. https://accelconf.web.cern.ch/ipac2016/papers/thpor052.pdf
- [P] C. Bracco et al., « LBDS performance in Run II », Evian 2019 : TSU redondante, liaison au BIS, tests asynchrones, vol. du 14 juil 2018. https://indico.cern.ch/event/751857/contributions/3259389/attachments/1785628/2957271/Evian2019_LBDS.pdf
- [P] S. Redaelli et al., HB2023 THBP49 : 430 MJ, 2500 paquets, 362 MJ de conception. https://accelconf.web.cern.ch/hb2023/papers/thbp49.pdf
- [P] J. Wenninger, « TT40 incident », 25.11.2004 : événement SPS. https://uspas.fnal.gov/materials/14JAS/TT40-Incident.pdf
- [P] home.cern, « LHC Report : switch was flipped and beams were dumped » (28 nov 2022) ; « Accelerator Report : excellent 2024 LHC run ended abruptly » (23 nov 2024) ; « Autopsy of an LHC beam dump » (8 juin 2022 : 6,2 t, 1 700 disques, plaques extrudées fissurées).
- [P/résumé] arXiv 2505.04235, démantèlement des blocs (lu à 100 000 car. sur 113 000).
- **Non lus / non confirmés** : page lhc-machine-outreach.web.cern.ch (DNS impossible : comparaisons 500 kg de cuivre, 400 t non vérifiées par moi) ; le rapport de conception LHC (ch. 17 LBDS) n'a pas pu être téléchargé (page d'authentification) ; la note CERN AB-Note-2005-014 sur le TT40 non ouverte ; la redondance « 14 sur 15 » provient d'un résumé de recherche (revue de risque non ouverte) ; aucun délai total détection → dump trouvé.

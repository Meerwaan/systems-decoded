# 045 — L'autodestruction de la fusée : elle s'est détruite toute seule, comme prévu

Niveaux : **[P]** source primaire lue · **[S]** secondaire · **[O]** ordre de grandeur. Court : ~30 requêtes utilisées.

## 1. Verdict sur l'angle

**À ajuster.** Le retournement tient (Ariane 501 : « Destruction was automatically initiated upon disintegration, as designed » [P]). Mais l'accroche « ta fusée dévie vers la côte / la ville » **ne colle pas à 501** : la fusée a été détruite à ~4 km d'altitude et ~1 km du pas de tir, les débris sont tombés sur ~12 km² de mangrove et de savane à l'est du pas de tir [P]. Aucune ville menacée. Il faut donc une accroche honnête : *la fusée tourne sur elle-même à 37 s, tu es à 1 km, rien ne l'arrête sauf elle-même*.
- Vu et revu ? Ariane 501 est un classique, mais par le **bug logiciel** (64 -> 16 bits). L'angle « la charge sur sa peau et personne n'a appuyé » est peu traité. Moyen-faible.
- **Spectacle** : OUI, l'image réelle de 501 (la fusée qui bascule à 37 s, boosters qui s'arrachent, boule de feu à 4 km) est lisible sans le son ; en 3D on montre la même chose, le long de la peau. **Histoire** : quelqu'un (toi, à 1 km du pas de tir, ou l'équipe de la salle de sauvegarde), un danger (une fusée de 700 t qui part de travers), quelques secondes (36,7 s -> 39 s -> destruction), raison de l'envoyer : « personne n'a appuyé ». Passe les deux, à condition de rester sur 501.
- Piège : la presse et certains sites disent « le contrôleur au sol a aussi envoyé l'ordre » (techno-science.net [S], non vérifié) ; le rapport Lions n'en parle pas. Ne pas dire « personne n'a rien envoyé du sol », dire « la destruction s'est déclenchée automatiquement ».

## 2. La scène

- **Cas réel : Ariane 501, 4 juin 1996, Kourou.** H0 = 09 h 33 min 59 s heure locale (12 h 33 min 59 s UT) [P, rapport Lions §1.1]. Vol nominal jusqu'à ~H0+36 s ; le Système de Référence Inertielle (SRI) de secours s'arrête à **H0+36,7 s**, l'actif ~0,05 s après (même cause) ; tuyères des boosters à fond puis de Vulcain ; incidence > 20° ; **désintégration vers H0+39 s** ; **destruction automatique** à 4 km d'altitude et 1 km du pas de tir ; télémesure reçue au sol jusqu'à H0+42 s [P].
- À montrer : la fusée qui bascule, l'incidence, les liaisons boosters / étage principal qui cassent, la charge qui s'amorce, la dispersion. Alternative sûre : AC-67 (26/03/1987) où l'officier a appuyé (voir §6).
- Réel et montrable : **rien d'ESA/Arianespace en vidéo** (droits non vérifiés, non libres). La 3D suffit. Rapport Lions : texte public, citable à l'écran comme pièce (mais licence de reproduction non vérifiée : citer, ne pas reproduire).

## 3. Le système qui sauve

- Toute fusée porte un **système de destruction / « Flight Termination System » (FTS)** : récepteurs radio, dispositif de sécurité-armement, détonateurs, lignes pyrotechniques, **charges linéaires** [P NASA PT-TE-1438 ; P fiche Pyroalliance].
- Embarqué sur Ariane 6 et Vega-C : charges linéaires Pyroalliance (ArianeGroup) pour « terminate a mission, sink used motor cases or passivate propellant tanks » [P, fiche Pyroalliance 04.2025]. Ariane 5 : même principe, mais **détails de la chaîne pyro d'Ariane 5 non trouvés à la source** (non dit).
- Au sol : **la sauvegarde** (CNES, Kourou). Le CNES est chargé de la sauvegarde vol par la Loi sur les Opérations Spatiales [S, CNES]. Salle de sauvegarde distincte de la salle de contrôle ; caméras, radars, stations de télécommande, télémesure ; ~10 min de vol suivi sur Ariane 6/CSO-3 [P CNES 2025, article du 06/03].
- Couloir de vol : « the safety zone where the rocket poses no danger to people or property, even if it has to be destroyed » [P, Centre spatial guyanais]. Si elle dévie dangereusement, « CNES destroys the rocket before it can leave its flight corridor » [P]. Avant le lancement le CNES vérifie qu'une destruction ne fera pas tomber de gros débris sur les zones habitées, et n'autorise que si le vent ne peut porter de substances toxiques vers elles [P].
- Futur : programme UDS (Unité de décision sauvegarde), confié à Safran Space, communiqué CNES du 04/06/2026 : sauvegarde **autonome** embarquée, « indépendamment des moyens équipant la base » ; transition envisagée « à partir de 2030 » [P].

## 4. Le mécanisme ouvert

Pièces (mot de pro) :
1. **Antennes + récepteurs-décodeurs** (Shuttle SRB : 2 antennes, 2 « integrated receiver decoder » par booster) [P NASA].
2. **Dispositif de sécurité-armement** (« Safe & Arm », S&A) : verrou mécanique, armé ~5 min avant allumage (Shuttle) [P NASA].
3. **Détonateur** (NASA Standard Detonator, 2 par SRB) [P].
4. **Cordeau détonant confiné** (« CDF ») : transmet la détonation jusqu'aux charges ; 7 assemblages + 2 manifolds par SRB [P].
5. **Charge linéaire** (« LSC / LSCD ») : cordon de cuivre (ou lame) dans un support en V ; la détonation crée un jet de métal qui cisaille la structure. Perfo Pyroalliance : jusqu'à 22 mm d'acier ou 35 mm de composite carbone, 0,60 à 2 m de long, vitesse de détonation > 7 700 m/s, 25 à 380 g/m d'explosif RDX [P fiche].
6. **Batterie dédiée** de sécurité, **parafoudre** (« lightning protection stub », 3 par SRB) [P NASA].
7. **Calculateur de décision embarqué** (version autonome : processeurs de vol redondants, GPS + centrale inertielle, règles de mission) [P NASA AFSS] ; absent sur le FTS classique.

Ce qui déclenche, deux voies :
- **Commandée** : un officier / analyste voit la trajectoire sortir du couloir ; envoi par émetteurs de commandes. Shuttle : plusieurs impulsions « arm », une pause d'une seconde, puis plusieurs « fire » [P NASA PT-TE-1438].
- **Automatique** : sur 501, la **rupture des liaisons électriques entre boosters et étage principal** déclenche la destruction. Rapport : « Destruction was automatically initiated upon disintegration, as designed » (§3.1 j) [P].

Délais / seuils : fiabilité visée **0,999 à 95 % de confiance** pour le système de destruction du Shuttle [P NASA] ; 0,999 aussi pour FTS classique [P NASA AFSS]. Chrono 501 : 36,7 s -> 39 s -> destruction (écart d'une fraction de seconde à 2-3 s ; la destruction exacte n'est pas chiffrée à la seconde dans mes lectures).

**Pourquoi ça marche (phrase du beat `principe`).** La charge ouvre la peau : la fusée perd sa poussée et sa tenue, se disloque, et son propellant se répand au lieu de rester entier [S Wikipédia "Range safety": « the propellant tanks are cut open to spill out their contents » ; P NASA : sur les boosters à poudre, la charge « cuts the case along 70 percent of the length »]. Pour une **solide** (SRB), on fend le corps sur 70 % de sa longueur [P]. L'idée « le carburant brûle dispersé en l'air, loin du sol » est plausible mais **je n'ai pas trouvé de source qui la dise comme but chiffré** : à dire en [O] et sans « loin du sol » (ce qui compte pour le public, c'est que les morceaux retombent dans la zone prévue, le couloir [P CNES]).

## 5. Chiffres

| Chiffre | Source | Niveau |
| --- | --- | --- |
| H0 = 09 h 33 min 59 s locale, 4 juin 1996 | Rapport Lions §1.1 | P |
| Vol nominal jusqu'à ~H0+36 s ; SRI de secours stoppe à H0+36,7 s | Lions §1.1 | P |
| Désintégration à ~H0+39 s | Lions §2.1, §3.1 i | P |
| Incidence > 20° | Lions §2.1 | P |
| Destruction à ~4 km d'altitude, 1 km du pas de tir | Lions §3.1 j / §1.3 | P |
| Débris sur ~12 km² (5 x 2,5 km²), mangrove et savane, à l'est du pas de tir | Lions §1.3, §3.1 k | P |
| Télémesure reçue jusqu'à H0+42 s | Lions §1.2 | P |
| Conversion d'un flottant 64 bits en entier 16 bits signé : « Operand Error » ; variable BH (biais horizontal) | Lions §2.1 | P |
| Fonction d'alignement inutile en vol, qui tournait encore ~40 s après le décollage | Lions §2.1 | P |
| SRB : charge linéaire coupe 70 % de la longueur ; armement ~5 min avant allumage | NASA PT-TE-1438 | P |
| Fiabilité visée 0,999 (95 % de confiance) | NASA PT-TE-1438 | P |
| Charge Pyroalliance : 22 mm d'acier, 35 mm de composite, > 7 700 m/s | fiche Pyroalliance 04.2025 | P |
| Falcon 9 CRS-10, 19 février 2017 : premier lancement avec destruction autonome (Gen. Raymond) | Air & Space Forces, 06/03/2017 | S |
| Coût d'un essai FTS avant lancement ~100 000 $ ; coût range d'un lancement Atlas/Delta ~500 000 $ | NASA, Bull & Lanzi, AFSS (2008) | P (ancien) |
| AC-67 : 26/03/1987, foudre ~49 s après décollage (sources : 48 à 51 s) | NASA SMA ; Space Congress | S |
| Starship vol 1, 20/04/2023 : AFSS a émis la destruction, puis rupture « après un délai inattendu » | FAA (résumé trouvé par recherche, page non lue : 403) | S |
| F9R Dev1, 22/08/2014 : « auto-terminated », port de capteur bouché | Musk, presse | S |

## 6. Ce qui retourne une idée reçue (chutes)

1. **« Personne n'a appuyé. »** 501 : la destruction s'est faite automatiquement, comme prévu, à la rupture des liaisons boosters / étage [P]. (La mauvaise nouvelle : la fusée s'est détruite à cause d'un nombre trop grand dans un code qui ne servait plus à rien [P].)
2. **« Le bouton rouge n'est que la moitié du système. »** Sur AC-67 (1987) c'est l'officier de sécurité qui a détruit la fusée [S NASA / Space Congress] ; sur 501 c'est la fusée ; sur Falcon 9 depuis 2017 c'est un calculateur à bord [S]. Trois âges du même geste.
3. **« Le plus dangereux, ce n'est pas la destruction, c'est qu'elle n'arrive pas. »** Starship vol 1 : « after an unexpected delay following AFSS activation, Starship broke up » [S FAA] ; le délai précis (≈ 40 s sur Wikipédia) **non vérifié**, ne pas chiffrer.
4. (Plus faible) **« Le sol, une salle, des gens, avant même le décollage »** : la sauvegarde du CNES approuve la trajectoire des mois avant (« if, and only if, it is not dangerous ») [P CNES].

## 7. La question du commentaire (fermée, deux camps)

- **« Une fusée qui dévie : tu laisses un humain décider… ou un ordinateur ? »** (réponse : humain / ordinateur) — clivant, vraie tension (le CNES prépare lui-même la bascule vers l'autonome d'ici 2030 [P]).
- « Ton avion de ligne a aussi un bouton de destruction : oui… ou non ? » — non, ne pas utiliser (faux, jamais sourcé).
- « Si la fusée se détruit seule, tu fais confiance à la machine… ou à l'humain ? » — variante de la 1re.
- Aucune lecture chez soi possible ici : sujet sans test domestique.

## 8. L'histoire du système

- Destruction commandée au sol : depuis les débuts des lancements ; les ranges radars + émetteurs sont décrits comme coûteux et lourds à maintenir [P NASA, Bull & Lanzi 2008].
- Autonome : programme AFSS de la NASA (Wallops + Kennedy) ; premier vol sur Falcon 9 CRS-10, 19/02/2017 [S]. 2014 : F9R Dev1 détruit automatiquement après capteur bouché [S].
- France : CNES chargé de la sauvegarde par la LOS ; programme UDS (Safran Space) annoncé le 04/06/2026, bascule envisagée « à partir de 2030 » [P CNES].

## 9. Pour l'annonce

- **Phrase (12 à 17 mots), après « Abonne-toi : »** — *à choisir par le scénariste selon le sujet 046 ; une candidate neutre :* « prochain dossier : ce qui se passe quand une fusée dévie, et celui qui la détruit n'est pas celui qu'on croit » (≈ 21 mots, **trop longue**) -> version courte à utiliser : « Prochain dossier : l'objet qui détruit la fusée avant qu'elle ne retombe sur toi » (15 mots) — **à ajuster au vrai 046, non connu.**
- **Un seul fait sûr (à dire à la fin du film précédent)** : « En 1996, Ariane 5 s'est détruite toute seule, 39 secondes après l'allumage du moteur. » [P Lions] (« 39 s après H0 », pas « après le décollage » : H0 ≠ décollage).

## 10. À ne pas dire

- « Ariane 501 a dévié vers la ville / la côte » : faux. Destruction à 4 km d'altitude, 1 km du pas de tir, sur mangrove et savane [P].
- « 30 s après le décollage » / « 37 s après le décollage » : le rapport donne H0+36,7 / 37 s depuis l'**allumage** (séquence de vol) ; ne pas convertir en « après le décollage » sans source du décalage H0 -> décollage.
- « Le moteur / la fusée s'est détruite à cause du pilote automatique » : la cause est le **SRI** : un flottant 64 bits trop grand pour un entier 16 bits dans une fonction d'alignement inutile en vol, logiciel repris d'Ariane 4 [P]. Ne pas dire « bug de conversion de 500 millions de dollars » (le coût n'est pas dans ma lecture du rapport).
- « Elle s'est autodétruite sur ordre de l'ordinateur de bord » : non. C'est la **rupture des liaisons** qui a déclenché le système [P]. Aucune décision de calculateur n'est décrite.
- « Personne n'a rien envoyé du sol » : non prouvé ; dire « s'est déclenchée automatiquement ». techno-science.net [S] parle d'un ordre sol arrivé trop tard : non confirmé par le rapport.
- « Falcon 9 se détruit sans humain sur tous ses vols » : sourcé **seulement pour CRS-10, 2017** et comme programme en transition ; l'état actuel (2025-2026) n'est **pas vérifié**.
- « Le carburant brûle en l'air, loin du sol » : non sourcé tel quel ; ne pas le présenter comme but chiffré.
- « Les charges coupent les réservoirs d'Ariane 5 » : détail Ariane 5 non lu. Général (Wikipédia [S]) : « propellant tanks are cut open » pour les étages liquides ; pour les boosters à poudre, le corps est fendu sur 70 % (Shuttle [P]). Ne pas attribuer le détail à Ariane 5.
- « Starship a mis 40 s à se détruire » : 40 s vient de Wikipédia, non confirmé par l'FAA lue.
- « Personne n'a été blessé / pas de victime » : pas dans mes lectures du rapport.

## 11. Ce que la voix peut dire (phrases courtes, vraies telles quelles)

1. Ariane 5, vol 501, quatre juin mille neuf cent quatre-vingt-seize.
2. À trente-six secondes, son guidage s'arrête.
3. Les tuyères partent à fond d'un seul côté.
4. L'incidence dépasse vingt degrés.
5. Les boosters s'arrachent de l'étage principal.
6. Ces liaisons coupées déclenchent la destruction.
7. Personne n'a eu à appuyer. C'était prévu.
8. Quatre kilomètres d'altitude, un kilomètre du pas de tir.
9. Les débris tombent sur douze kilomètres carrés de savane et de mangrove.
10. Le bouton rouge n'est que la moitié du système.

Phrase « principe » candidate (vraie, ordres de grandeur) : « Une charge linéaire détone à plus de sept mille mètres par seconde. Son jet de métal tranche la peau de la fusée. » (22 mots, à ajuster ; « sept mille sept cents » est le seuil minimal de la fiche, dire « plus de sept mille »).

## 12. Sources (ce que j'y ai lu)

- [P] Rapport de la commission d'enquête Ariane 501 (Lions, 19 juillet 1996), copie MIT OCW : https://ocw.mit.edu/courses/16-355j-software-engineering-concepts-fall-2005/91f1e550b30b00ad797293f430220f18_ari5fail_ful_rep.pdf — texte extrait et lu : chronologie §1.1, récupération §1.3, cause §2.1, chaîne §3.1 (i, j, k). Le texte de l'ESA n'a pas été rouvert à la source ESA ; l'URL de ESA citée dans la repérage non lue.
- [P] NASA MSFC, Preferred Practice PT-TE-1438 (command destruct system du Shuttle SRB) : https://extapps.ksc.nasa.gov/Reliability/Documents/Preferred_Practices/1438.pdf — lue (texte extrait) : composants, 70 %, armement 5 min, fiabilité 0,999.
- [P] Bull & Lanzi, « An Autonomous Flight Safety System » (NASA, 2008) : https://ntrs.nasa.gov/api/citations/20080044860/downloads/20080044860.pdf — lue : FTS classique (radars + émetteurs), AFSS (processeurs de vol, GPS + centrale inertielle), 0,999, coûts.
- [P] Fiche Pyroalliance LSCD (04/2025) : https://ariane.group/app/uploads/sites/5/2025/06/Fiche-LINEAR-SHAPED-CHARGE-DEVICE_Space_Pyroalliance_04.2025.pdf — lue : performances, Ariane 6 et Vega-C.
- [P] Centre spatial guyanais, « During a launch » : https://visite.centrespatialguyanais.cnes.fr/en/lors-dun-lancement — lue : couloir de vol, vents, destruction.
- [P] CNES, « La sauvegarde vol d'Ariane 6… » : https://cnes.fr/actualites/sauvegarde-vol-dariane-6-cest-une-preparation-pris-annees — lue : salle de sauvegarde, moyens, ~10 min, ne parle pas de destruction.
- [P] CNES, programme UDS (04/06/2026) : https://cnes.fr/communiques/cnes-sengage-un-nouveau-programme-de-sauvegarde-centre-spatial-guyanais — lue : autonome vs commandée, Safran, 2030.
- [S] Air & Space Forces, 06/03/2017 (CRS-10) : https://airandspaceforces.com/spacex-launch-pioneered-autonomous-termination-system — lue.
- [S] Wikipédia « Range safety » : https://en.wikipedia.org/wiki/Range_safety — lue (via résumé) : arm/fire, tanks cut open, F9R Dev1, Starship.
- [S] NASA SMA AC-67 : page **non lue (404)** ; faits AC-67 d'après un résumé de recherche (NASA SMA, Space Congress, UPI) : 26/03/1987, foudre ~48-51 s, destruction par l'officier de sécurité.
- **Non lues** : Patrick SFB (403), FAA mishap Starship (403), fiche Pyroalliance 2021 (410), question Assemblée nationale (PDF illisible), ESA « Dans les pas du vol 135 » (rien sur la destruction), pages des détails de l'Ariane 5 pyro (introuvables), rapport ESA de presse.

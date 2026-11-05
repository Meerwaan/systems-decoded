# 043 — Contre-vérification du script (Le faisceau du CERN)

Sources relues en local : arXiv 2110.08783 (Maestre, blocs 539 MJ), arXiv 1608.02433 (Schmidt), IPAC2012 THPPP086 (Baer, UFO), IPAC2016 THPOR052. Requêtes web : 3 (une redirection incluse).

## Verdict

**5 phrases à corriger** (4 beats : scene, principe ×2, reponse, chute), le reste tient. Les trois erreurs de fond : « un e d'un mètre vingt » (1,2 m est la LONGUEUR du trait, sur un bloc de 722 mm de diamètre), « on ne l'arrête pas » (le bloc l'arrête bel et bien), « 1 400 degrés » (c'est le pic simulé pour 539 MJ, pas pour le train de 362 MJ du film).

## Points demandés

- **« l'énergie d'un train lancé »** : tient. Schmidt 1608.02433 : « 362 MJ = train de 200 m à 155 km/h » (lu). Run 3 : 430 MJ record ; aucune phrase du film ne mélange 362 / 430 / 539 sauf le « 1 400 degrés » (voir reponse).
- **« un bloc de 6 tonnes »** : tient (6,2 t [S home.cern], 6,4 t autre étude ; un bloc par faisceau). Pas dit « refroidi à l'eau » : OK, rien dans le script.
- **« 37 fois, en moins de deux ans »** : tient. IPAC12 : « Since July 2010, UFOs led to 37 premature protection beam dumps » ; article de mai 2012, soit 1 an 10 mois. Réserves : (a) chiffre figé en 2012, à 3,5-4 TeV (faisceau bien plus faible que 362 MJ) ; (b) en 2011, 2 dumps par UFO dans les arcs et 11 aux aimants d'injection (MKI) : la plupart des 37 ne sont pas des grains « dans l'anneau » mais près de l'injection. « Moins de deux ans » reste vrai.
- **« un grain de poussière va le jeter dehors »** : tient (UFO ≈ micrométrique, pertes d'environ 10 tours, dump si le seuil BLM est franchi ; « va » = quand il franchit le seuil, la grande majorité des UFO restent très en dessous : >16 000 en 2011).
- **« le grain dévie des protons contre les aimants »** : à corriger. La source dit : le grain interagit avec le faisceau, perte de protons ~10 tours, et ce sont des gerbes de particules qu'on mesure et qui menacent les aimants (simulations FLUKA). « Dévier contre les aimants » décrit une trajectoire de protons qui n'est pas ce qui est établi.
- **« quinze aimants le poussent hors de l'anneau »** : tient. 15 kickers MKD (IPAC16) ; les 15 septa MSD font l'essentiel du coude (2,4 mrad contre 0,275 mrad). La phrase reste vraie en comptant les kickers ; l'image doit montrer kickers qui s'allument puis septa, sans prétendre qu'il n'y en a que 15 au total.
- **« dix aimants le font tourner »** : tient (4 MKBH + 6 MKBV). « Tourner » = balayer en ellipse.
- **« un e d'un mètre vingt »** : à corriger. Maestre §3.4 : « a 1.2 m long "e"-shaped trace » ; le bloc fait 722 mm de diamètre : un « e » de 1,2 m de large ne tiendrait pas dessus. Dit ainsi, l'oreille entend la taille de la lettre. L'image ne doit pas dessiner un e plus grand que le bloc.
- **« vers quatorze cents degrés »** : à corriger. 1416 °C = pic simulé « for nominal Run 3 parameters », soit 539 MJ stockés (la limite de conception du bloc), dans le secteur Sigraflex. Pour 362 ou 430 MJ le pic est plus bas (proportionnel à l'énergie, ordre de 1 000 °C ; non chiffré par la source). Dit comme un fait du train du film, c'est faux.
- **89 µs** : tient. « within one beam revolution, about 89 µs » ; dans le script il suit « Le trou passe… Il peint son e », donc se lit comme la durée de l'extraction, pas le délai depuis la détection. Ne pas l'associer à « L'alerte part ».
- **362 / 430 / 539 MJ** : le script ne cite que « l'énergie d'un train » : OK.

## Phrase par phrase

- **accroche** « Ton faisceau porte l'énergie d'un train lancé » tient. « Un grain de poussière va le jeter dehors » tient.
- **promesse** « Pour l'avaler un bloc de 6 tonnes » tient. « Et des grains comme lui… combien ont déjà gagné ? » tient (« gagné » = forcé l'arrêt ; nuance : c'est la protection qui a fonctionné, pas un échec ; le comment le reprend, voir plus bas).
- **scene** « Le grain dévie des protons contre les aimants » **à corriger** (ci-dessus). « Un vingtième d'un paquet suffit à en abîmer un » tient : Schmidt, « about 5 % of a single nominal bunch (10^11 protons) could damage equipment (e.g. superconducting coils) » à 7 TeV. « Ton train en compte des milliers » tient (2 808 prévus, ≈ 2 500 en Run 3). « Ta seule issue… la sortie de secours » tient.
- **ouvre** tient.
- **eclate** « 3 600 capteurs guettent la moindre perte » tient (≈ 3 600 chambres BLM ; « moindre » est un raccourci : seuils réglés, la plupart des UFO passent sous le seuil). « 15 aimants le poussent hors de l'anneau » tient. « 700 mètres de ligne » tient. « Et au bout… le bloc » tient.
- **principe** « Pourquoi il tient ? » tient. « Sur un seul point ce train percerait n'importe quel matériau » **à corriger** : la source dit « Even the most robust absorber materials could not sustain the impact of the full beam on a single spot without being damaged » : abîmé, pas percé, et « absorbeur » pas « n'importe quel matériau ». « 10 aimants le font tourner » tient. « il dessine un e d'un mètre vingt » **à corriger**. « Même énergie… étalée » tient.
- **repos** « Dans le train un trou » tient. « 3 microsecondes sans aucun proton » tient (IPAC16 : « 3 µs particle-free abort-gap »). « Les aimants ne s'allument que là » tient. « Ailleurs… ils balaieraient ce train contre les parois » tient (un tir hors du trou touche des paquets et les envoie sur l'ouverture ; protégée par TCDS/TCDQ) ; ne pas montrer le train « détruit ».
- **zero** « La perte franchit le seuil. L'alerte part. Le système attend… le trou » tient (attente d'un tour au plus, ≈ 89 µs, déduction).
- **reponse** « Le trou passe 15 aimants s'allument Le train quitte l'anneau Il peint son e sur le bloc 89 microsecondes tout est dedans » tient. « Le graphite grimpe vers 1 400 degrés » **à corriger**. « Il tient » tient.
- **chute** « ce train on ne l'arrête pas. On ne le freine pas » **à corriger** : le bloc arrête 99,99997 % des protons (il en reste 3×10⁻⁵ %) ; le film vient de dire « un bloc pour l'avaler » et « Il tient ». Ce qui est vrai : on ne l'encaisse pas sur un point. Le mot « freine » est aussi faux (il n'y a pas de freinage, une absorption sur ≈ 8,5 m). « On le jette dehors… et on l'étale » tient.
- **comment** « Et ces grains combien ont gagné ? 37 fois en moins de deux ans » tient (réserves ci-dessus). « trop prudent ou juste assez ? » tient.
- **like** tient. **abo** « un policier croit avoir pris une pierre dans les côtes. C'était une balle » : c'est l'impression du policier (Nîmes) ; la contre-vérification du 044 propose « ventre » pour le lieu réel : garder les deux annonces cohérentes. **boucle** « Une balle ça va vite. Mais… » : à caler sur l'accroche du 044 (hors de ma portée).

## Phrases de remplacement

- **scene** : « Le grain fait pleuvoir des particules sur les aimants Un vingtième d'un paquet suffit à en abîmer un Ton train en compte des milliers Ta seule issue… la sortie de secours » (seule la première ligne change : « Le grain fait pleuvoir des particules sur les aimants. »)
- **principe** : « Pourquoi il tient ? Sur un seul point, même le matériau le plus robuste lâcherait Alors 10 aimants le font tourner il dessine un « e » : un trait d'un mètre vingt Même énergie… étalée »
- **reponse** : « Le trou passe 15 aimants s'allument Le train quitte l'anneau Il peint son « e » sur le bloc 89 microsecondes tout est dedans Le graphite peut monter jusqu'à 1 400 degrés Il tient »
- **chute** : « Voilà le secret ce train on ne l'encaisse pas sur un point On le jette dehors… et on l'étale »

(Dans `vo`, mêmes mots, mêmes balises ; les repères `principe:e`, `reponse:graphite`, `chute:freine` éventuels à revoir.)

## Pour l'image

Un seul bloc : l'« e » doit être plus petit que le disque du bloc (trait de 1,2 m tracé dans 72 cm de diamètre, donc une courbe serrée qui occupe la face) ; le graphite chauffe vers l'orange, pas de blanc de fusion ; le train du repos n'est pas détruit, il est balayé vers l'ouverture.

## Reste ouvert

- Masse exacte du bloc (6,2 t [S] ; 6,4 t) : « 6 tonnes » tient dans les deux cas.
- Pic de température pour 362 / 430 MJ : non chiffré dans les sources lues ; « peut monter jusqu'à 1 400 » ne le promet pas.
- Le coude des 15 septa non cité dans le script : à ne pas faire dire.
- La phrase « Du trou : sans aucun proton » est celle d'IPAC16 ; un petit résidu de particules est surveillé en réalité (« Abort Gap Keeper ») : reste dans l'idéalisation de la source.
- « Le système attend… le trou » : l'attente est au plus un tour (déduction, non chiffrée par la source).

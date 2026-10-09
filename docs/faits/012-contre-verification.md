# Contre-vérification — 012 Gazinière (sécurité thermocouple)

Faite le 2026-10-08, indépendamment du premier dossier (`012-gaziniere.md`) : chaque phrase dite (`beats[].text`), la légende, le commentaire épinglé, chaque entrée de `sources`, et ce que le film affiche en plus (chrono, compteur « gaz sorti », titre barré de la chute) sont relus contre ce que le dossier porte déjà et contre 12 appels web.

Légende des niveaux : **primaire** = fabricant, régulateur, ministère, rapport d'enquête · **secondaire** = presse, encyclopédie, fournisseur de pièces · **extrait** = lu seulement dans le résumé d'un résultat de recherche (la page n'a pas pu être ouverte) · **dossier** = déjà lu à la source dans `012-gaziniere.md`, non rouvert · **calcul** = refait ici.

Budget : 12 appels web sur 12 (6 recherches dont 1 refusée pour un filtre de domaine, 6 lectures dont 1 en 403 : grdf.fr, comme dans le dossier, et 1 PDF illisible en direct). Le PDF Sabaf a été relu en local (`pdftotext`) : ce n'est pas un appel web de plus.

Repères de voix : les remplacements 1 à 4 gardent les mots-repères des `cues` (`promesse:minute`, `scene:5`, `repos:retienne`, `abo:arceau`) ; seul le calage des mots voisins bouge.

Verdicts : **EXACT** · **À NUANCER** (vrai mais trop net, ou imprécis) · **FAUX** · **NON SOURCÉ**.

---

## Tableau des verdicts

| Beat / texte | Début de la phrase | Verdict |
| --- | --- | --- |
| accroche | « Ta casserole déborde. La flamme s'éteint… » | EXACT |
| promesse | « Dans une minute, il se coupe tout seul… » | **À NUANCER** (« Dans une minute ») |
| scene | « Un grand feu ouvert, sans flamme : cinq litres… » | **À NUANCER** (« cinq », « gaz ») ; la 2ᵉ phrase EXACT |
| ouvre | « Alors… on l'ouvre. » | EXACT |
| eclate | « Sous la manette : un robinet… » | EXACT |
| repos | « Chauffée, cette pointe fabrique du courant… » | **À NUANCER** (léger : « retienne le ressort ») |
| main | « Pas assez pour l'attirer… » | EXACT |
| seuil | « Abonne-toi : ce gaz qui sort toujours… » | EXACT |
| zero | « La flamme est éteinte. La pointe refroidit… » | EXACT |
| reponse | « L'aimant lâche. Le ressort claque… » | EXACT |
| bilan | « Il est sorti quelques litres de gaz… » | EXACT |
| chute | « Rien n'a détecté ton gaz. C'est un ressort… » | EXACT |
| like | « Like. Ça remontera chez quelqu'un… » | EXACT (rien à vérifier) |
| abo | « …Une Formule 1 coupée en deux… l'arceau qui a sauvé son pilote. » | **À NUANCER** (« a sauvé ») |
| comment | « Et la tienne, elle l'a ? Regarde à côté de la flamme… » | EXACT |
| boucle | « Parce qu'un soir ou l'autre, forcément… » | **À NUANCER** (léger : « forcément ») |
| post.caption | « Gazinière : la flamme s'éteint, le gaz continue… » | EXACT |
| post.pinned | « Odeur de gaz : tu n'allumes rien, tu ouvres… » | **À NUANCER** (consigne incomplète) |
| affichage : chrono | ≈ 50–65 s, « Dans une minute » | **À NUANCER** (voir promesse) |
| affichage : compteur | 5 L/min × t → 4–5,5 L | EXACT (calcul), à étiqueter « ≈ » |
| affichage : titre barré | « UN DÉTECTEUR » → « UN RESSORT » | **À NUANCER** (« DÉTECTEUR DE GAZ ») |
| sources[0] | dossier + contre-vérification | sans objet |
| sources[1] | Sabaf 16C | EXACT (une réserve de mise en page) |
| sources[2] | Wikipédia + OEG | EXACT (une formule à reprendre) |
| sources[3] | « Dans une minute » et chrono | **À NUANCER** |
| sources[4] | Cinq litres à la minute | EXACT (calcul) ; « grand brûleur de 3 kW » **NON SOURCÉ** |
| sources[5] | Toute une nuit, interrupteur | EXACT |
| sources[6] | Reconnaître la sécurité (AIL) | EXACT |
| sources[7] | Accidents BARPI | **À NUANCER** (« environ 125 par an ») |
| sources[8] | Simplifications, épinglé | « ≈ 4 mm en vrai » **NON SOURCÉ** ; le reste EXACT |

Réécritures à prendre, une par phrase, même longueur à ± 2 mots (la voix ne bouge que pour les trois premières lignes de la liste ; **chaque mot de `vo` changé coûte une reprise, ≈ 40 crédits, si la voix est déjà enregistrée**) :

1. promesse : « **Au bout d'une minute environ**, il se coupe tout seul : sans prise ni pile. »
2. scene : « Un grand feu ouvert, sans flamme : **environ** cinq litres de **gaz naturel** à la minute. »
3. abo : « …et l'arceau qui a **protégé** son pilote. »
4. repos (léger) : « Juste assez pour que l'aimant retienne **le robinet**. »
5. boucle (léger, à ne pas reprendre pour ça) : « Parce qu'un soir ou l'autre, **sûrement**… »
6. titre de la chute (sans voix, gratuit) : « Ce qui coupe ton gaz : **UN DÉTECTEUR DE GAZ** » (barré) → « UN RESSORT ».
7. post.pinned (sans voix, gratuit) : « Odeur de gaz : ni flamme ni interrupteur, tu aères, tu sors, puis tu appelles le 0 800 47 33 33 (gratuit). La tienne, elle a la pointe ? » (136 caractères).
8. sources[8] (sans voix) : retirer « (≈ 4 mm en vrai) » ou écrire « course du clapet exagérée (non chiffrée) ».

---

## 1. Les phrases dites

### accroche — « Ta casserole déborde. La flamme s'éteint. Le gaz, lui… sort toujours. »
**EXACT.** Un liquide qui déborde peut éteindre la flamme : AIL (dossier §5.4) « se durante la cottura di cibo dovesse fuoriuscire dell'acqua dalla pentola e spegnere la fiamma del fornello » (primaire, opérateur suisse). Le gaz continue de sortir tant que le robinet n'est pas fermé : Sabaf 16C, flamme éteinte, « the flow of gas is blocked after a few seconds » (relu ici). « Sort toujours » est lu au sens « sort encore » (et non « sort à jamais »), puisque la phrase suivante dit qu'il se coupe. Réserve (dossier, « À ne pas dire » n° 14) : un débordement n'éteint pas toujours la flamme ; ici c'est un scénario qui commence par « Ta casserole déborde. La flamme s'éteint. », pas une loi : rien à changer.

### promesse — « Dans une minute, il se coupe +tout seul+ : sans prise ni pile. Sauf si ta gazinière… n'a *pas* cette pièce. »
**À NUANCER, sur « Dans une minute » seulement.**
- « il se coupe tout seul » : EXACT. Le ressort referme dès que l'aimant lâche, sans intervention (Wikipédia EN relu : « the thermocouple temperature falls, causing the voltage across the thermocouple to drop… the valve to close »).
- « sans prise ni pile » : EXACT **pour cette sécurité** : le courant vient de la pointe chauffée (Sabaf : « the thermocouple generates enough current to hold the safety magnet open »). La phrase reste dans le périmètre voulu par le dossier (« sans prise ni pile pour la sécurité », pas « sans électricité »).
- « Sauf si ta gazinière n'a pas cette pièce » : EXACT. Implicite non dit : une table à surveillance électronique n'a pas « cette pièce » et peut quand même couper (dossier §4.3, non sourcé en détail) ; le film ne l'affirme pas.
- **« Dans une minute »** : le chiffre n'est pas une valeur de fabricant. Sabaf donne « a few seconds » dans le texte et **90 s au plus** dans le tableau ; OEG (secondaire) donne 60 à 90 s de « temps de fermeture » ; la norme (EN 30-1-1 / EN 125) n'a pas été lue par personne. « Une minute » est plausible et dans la limite, mais un spectateur y entend une durée typique, alors qu'elle va de quelques secondes à 90 s.
- **Remplacement** : « **Au bout d'une minute environ**, il se coupe tout seul : sans prise ni pile. » Même nombre de mots, et le chrono du film (50–65 s) devient cohérent avec la voix sans promettre « une minute pile ».

### scene — « Un grand feu ouvert, sans flamme : [5|cinq] litres de gaz à la minute. Laisse-le toute une nuit, cuisine fermée… et un *interrupteur* peut suffire. »
**Phrase 1 : À NUANCER.** Calcul refait : 3 kW ÷ 10 kWh/m³ = 0,30 m³/h = 5,0 L/min ; avec un PCI de 10,45 kWh/m³ (valeur courante du gaz H français, de mémoire, non sourcée ici) : 4,8 L/min ; avec un brûleur de 3,5 kW : 5,6 à 5,8 L/min. Donc **« environ cinq »**, pas « cinq » tout court. Deux points non sourcés : (a) qu'un « grand feu » fasse 3 kW (le dossier le pose sans source ; c'est la valeur courante d'un brûleur rapide, mais je ne l'ai pas sourcée, faute d'appel restant) ; (b) le calcul vaut pour le **gaz naturel du réseau** (PCI ≈ 10 kWh/m³). Beaucoup de gazinières françaises sont sur bouteille de butane/propane, dont le pouvoir calorifique par m³ est environ trois fois plus élevé : le débit en litres/min serait bien inférieur, mais la limite d'explosivité aussi (chiffres de mémoire, non sourcés). Dire « gaz naturel » règle la question sans alourdir.
- **Remplacement** : « Un grand feu ouvert, sans flamme : **environ** cinq litres de **gaz naturel** à la minute. »
**Phrase 2 : EXACT.** 30 m³ (cuisine fermée, sans ventilation) ; 0,3 m³/h : 4 % de LIE en 4,0 h, 4,4 % en 4,4 h, 5 % en 5,0 h ; une nuit de 8 h = 2,4 m³ = 8 % dans la pièce, donc dans la plage explosive. Limite : « la LIE du méthane était à 5 % il y a quelques années en Europe, elle est aujourd'hui à 4,4 % » (ministère de l'Intérieur, 2009 ; dossier). « Peut suffire » est le bon mot : une cuisine réelle est ventilée, le délai s'allonge. Source de l'interrupteur : voir §4, point 3.

### ouvre — « Alors… on l'ouvre. »
EXACT (formule, rien à vérifier).

### eclate — « Sous la manette : un robinet. Un ressort, qui ne demande qu'à le fermer. Un électroaimant, pour le retenir. Et dans la flamme… une +pointe de métal+. »
**EXACT.**
- « Un robinet sous la manette » : Sabaf 16C, « 2 - conical plug valve », commandé par « the control shaft » (relu).
- « Un électroaimant, pour le retenir » : Sabaf, « the safety magnet » avec un courant de maintien en mA (« hold-on current / drop-out current », relu).
- « Un ressort, qui ne demande qu'à le fermer » : Wikipédia EN, relu : « by sizing the coil to be able to hold the valve open against a light spring ». Le ressort **de fermeture** n'est pas nommé dans la notice Sabaf (son seul « external spring » est le limiteur de rotation de la manette) : niveau secondaire, cohérent avec la physique de l'ensemble.
- « Une pointe de métal dans la flamme » : Wikipédia EN, « The tip of the thermocouple is placed in the pilot flame » (dossier §1.1) ; Sabaf « the thermocouple must be positioned in correspondence of the burner ».

### repos — « Chauffée, cette pointe fabrique du courant : [30|trente] millièmes de volt, au mieux. Juste assez pour que l'aimant +retienne+ le ressort. »
**À NUANCER (léger).**
- « trente millièmes de volt, au mieux » : EXACT comme ordre de grandeur. OEG (secondaire, dossier) : maximum d'environ 30 mV ; Wikipédia EN relu : « 25 mV open circuit falling by half with the coil connected ». « Au mieux » est le bon verbe (à vide ; en charge 10–15 mV).
- « Juste assez pour que l'aimant retienne **le ressort** » : l'aimant retient **le robinet** (l'armature) contre le ressort ; le ressort, lui, est ce qui pousse. La phrase d'avant (eclate) dit bien « un électroaimant, pour le retenir [le robinet] » : les deux se contredisent un peu. Compris comme « garde le ressort bandé », c'est défendable, mais autant dire la même chose dans les deux phrases.
- **Remplacement** : « Juste assez pour que l'aimant retienne **le robinet**. » (garde le mot « retienne », qui sert de repère `grip` à l'image).

### main — « Pas assez pour l'attirer : c'est pour ça que tu gardes la manette *enfoncée*, le temps qu'elle chauffe. »
**EXACT.** Sabaf, relu : « To turn the valve on, simultaneously press and turn the control shaft… A few seconds after the burner ignites, the thermocouple generates enough current to hold the safety magnet open. The control shaft needs no longer be pressed down. » Wikipédia EN, relu : la vanne ne s'ouvre « only after the initial turning-on force is provided by the user pressing and holding a knob ». Le « pas assez pour l'attirer » est la lecture du dossier (§1.3) ; ni Sabaf ni Wikipédia ne l'écrivent mot pour mot, mais c'est la conséquence directe de ces deux phrases. « Le temps qu'elle chauffe » : « quelques secondes », cohérent avec le dossier. Valable pour une table à thermocouple et bouton.

### seuil — « +Abonne-toi+ : ce gaz qui sort toujours, regarde ce qui l'*arrête*. »
**EXACT.** Écho de l'accroche : « toujours » = « encore » (voir accroche). La seconde moitié (« ce qui l'arrête ») annonce l'acte 3. Rien de factuel de plus.

### zero — « La flamme est *éteinte*. La pointe refroidit. Le courant baisse… baisse… »
**EXACT.** Sabaf, relu : « If the flame should accidentally go out, the thermocouple cools and the current is reduced, the safety magnet is closed and the flow of gas is blocked after a few seconds. » Wikipédia EN, relu : « the thermocouple temperature falls, causing the voltage across the thermocouple to drop ».

### reponse — « L'aimant *lâche*. Le ressort claque. Le gaz est +coupé+. »
**EXACT.** Sabaf (« the safety magnet is closed and the flow of gas is blocked ») : l'aimant lâche quand le courant tombe sous le courant de décrochage (« drop-out current », de l'ordre de la dizaine à la soixantaine de mA selon la version ; tableau mal extrait, lu par position) ; le ressort referme (Wikipédia EN). « Claque » est une image sonore ; le gaz coupé est celui **de ce brûleur** (le gaz du réseau reste ouvert en amont).

### bilan — « Il est sorti quelques litres de gaz. Pas des +centaines+. »
**EXACT (calcul).** 5 L/min × 50–65 s = 4,2–5,4 L ; au maximum fabricant (90 s) : 7,5 L. « Quelques » tient dans tous les cas. Des centaines de litres, c'est 20 minutes ou plus de débit à 5 L/min : « pas des centaines » est vrai même au pire cas de la notice. Rappel : le débit est celui du « grand feu » à pleine ouverture.

### chute — « Rien n'a détecté ton gaz. C'est un *ressort* : la flamme payait pour le retenir. Elle s'est éteinte… il a +fermé+. »
**EXACT, avec un titre à retoucher (voir §2).**
- « Rien n'a détecté ton gaz » : EXACT, c'est le point 3 des « À ne pas dire » à l'envers : la pointe ne sent que la chaleur de la flamme (la notice Sabaf ne décrit aucun capteur de gaz, seulement le thermocouple et l'aimant).
- « C'est un ressort » : simplification assumée : la force qui ferme est un ressort (Wikipédia EN, secondaire) ; la décision de lâcher vient de la pointe et de l'aimant, ce que le film vient de montrer. Acceptable parce que le film l'a déjà dit en trois phrases.
- « La flamme payait pour le retenir » : image juste (l'énergie qui tient l'aimant vient de la chaleur de la flamme).
- « Rien » est absolu mais vrai : sur une table à thermocouple, rien ne détecte du gaz.

### like — « +Like+. Ça remontera chez quelqu'un qui cuisine au gaz sans savoir ça. »
Sans objet factuel. Rien à corriger.

### abo — « +Abonne-toi+. Prochain dossier : d'autres flammes. Une Formule [1|un] coupée en deux… et l'arceau qui a *sauvé* son pilote. »
**À NUANCER, sur « a sauvé » ; le reste est EXACT.** Voir §4, point 2.
- « Une Formule 1 coupée en deux » : EXACT en presse (Wikipédia EN, extrait de recherche : « the impact at the barrier tearing his car in half » ; le rapport de la FIA parle, lui, de « separation of the power train assembly from the survival cell », cité par motorsport.com, relu). La voiture s'est bien rompue en deux parties, le moteur arraché de la cellule.
- « d'autres flammes » : EXACT. Rapport de la FIA : « Fire was ignited during the final moments of the barrier impact, starting from the rear of the survival cell and progressing forwards towards the driver » ; il est resté 27 à 28 secondes dans le feu.
- « l'arceau qui a sauvé son pilote » : le Halo a rempli sa fonction (FIA : « Halo frontal cockpit protection performed according to their specifications »), mais le rapport **ne dit pas** qu'il l'a « sauvé » ; le mot est celui de Grosjean (« without it I wouldn't be able to speak to you today », formula1.com, 29/11/2020) et de la presse, et le pilote de la voiture médicale, Alan van der Merwe, rappelle que sans l'un des éléments (Halo, barrière, ceintures) « it could have been a very different outcome » (extrait de recherche). Le film est une phrase d'annonce, mais « a sauvé » est une affirmation causale absolue.
- **Remplacement** : « …et l'arceau qui a **protégé** son pilote. » (exact et même ton). Variante qui garde le mot fort en l'attribuant : « …et l'arceau auquel il dit devoir la vie. » (+3 mots).

### comment — « Et la tienne, elle l'a ? Regarde à côté de la flamme : une petite pointe de métal. Et si tu dois garder la manette enfoncée pour allumer… c'est +elle+. En commentaire : la tienne, elle l'a ? »
**EXACT.**
- « Regarde à côté de la flamme : une petite pointe de métal » : AIL, contrôle visuel, « presenza della termocoppia nelle immediate vicinanze del bruciatore » (dossier, A-). Léger flottement avec eclate (« dans la flamme ») : la pointe est à la lisière de la flamme, les deux tournures sont vraies. Point d'attention visuel, non sourcé : l'allumeur (étincelle) est aussi une pièce près du brûleur, et un spectateur peut le prendre pour la pointe.
- « Si tu dois garder la manette enfoncée… c'est elle » : le sens sûr. AIL écrit pour le cas **sans** thermocouple « non è necessario tenere premuta la manopola » ; par contraposée, **devoir** la garder enfoncée indique qu'il y en a une. Le film n'affirme pas l'inverse (« pas de geste = pas de sécurité »), qui est interdit par le dossier (« À ne pas dire » n° 11). Source unique (un opérateur suisse) : niveau A-, déjà noté dans le dossier §4.4.

### boucle — « Parce qu'un soir ou l'autre, forcément… »
**À NUANCER (léger, non bloquant).** Rebouclée sur « Ta casserole déborde », « forcément » promet qu'elle débordera, et « un soir ou l'autre » le dit déjà. Hyperbole de rebouclage, sans conséquence sur la sécurité. **Ne pas reprendre la voix pour ça** (la dernière phrase est suspendue par sa virgule, choix de voix délicat). Si la voix est refaite pour une autre raison : « Parce qu'un soir ou l'autre, sûrement, ».

---

## 2. Ce que le film affiche en plus des phrases

### Le chrono en temps réel (flamme éteinte → gaz coupé, ≈ 50 à 65 s)
**À NUANCER.** Mesure ici : 50–65 s est **dans** la limite du fabricant (Sabaf, 90 s au plus) et au bas de la fourchette « 60 à 90 s » d'OEG. Mais c'est la valeur de **cette** plaque, pas une valeur typique ni de norme (aucune source lue ne donne le maximum de la norme ; le dossier a raison de ne pas écrire « selon la norme »). Une lecture honnête côté image : un spectateur voit un chrono « réel » et en déduit que toute gazinière met une minute. Mitigation gratuite : la voix dit « au bout d'une minute **environ** » (voir promesse) ; aucune autre étiquette à ajouter. La notice dit « a few seconds » : une gazinière peut couper en moins de temps.

### Le compteur « gaz sorti » (5 L/min × temps écoulé)
**EXACT (calcul).** Refait : 5,0 L/min × 50 s = 4,2 L ; × 65 s = 5,4 L ; × 90 s = 7,5 L ; donc « 4 à 5,5 L » est juste. À afficher avec « ≈ » ou en entier (« 4 L », « 5 L »), pas en décimales trompeuses (« 4,17 L »), et à étiqueter comme un calcul pour un grand brûleur de 3 kW au gaz naturel : ce n'est pas une mesure (sources[4] le dit déjà).

### Le titre de la chute : « Ce qui coupe ton gaz : ~~UN DÉTECTEUR~~ → UN RESSORT »
**À NUANCER.** « Un ressort » est défendable (c'est lui qui referme, Wikipédia EN). Mais le mot barré, « un détecteur », est faux **dans la bouche du film** : la pointe de métal **est** un détecteur de flamme (en norme : « dispositif de surveillance de flamme », EN 125) ; la voix dit « Rien n'a détecté ton gaz », donc c'est de **gaz** qu'il s'agit. Barrer « UN DÉTECTEUR » laisse croire que la pointe n'en est pas un, ce que la phrase d'à côté et tout l'acte 2 contredisent.
- **Remplacement** : « Ce qui coupe ton gaz : ~~UN DÉTECTEUR DE GAZ~~ → UN RESSORT » (ou « UN CAPTEUR DE GAZ » si la place manque).

---

## 3. La légende et le commentaire épinglé

### post.caption — « Gazinière : la flamme s'éteint, le gaz continue… et ce qui le coupe n'a ni prise, ni pile, ni détecteur de gaz. La tienne, elle a la petite pointe à côté de la flamme ? »
**EXACT.** « Ni prise, ni pile » : pour la sécurité (voir promesse) ; « ni détecteur de gaz » : EXACT (« À ne pas dire » n° 3 respecté). Elle contient le mot « gazinière », ne dit pas la chute (« ressort ») et finit sur la question du commentaire. 168 caractères. Même réserve que pour le chrono : rien ne dit une durée.

### post.pinned — « Odeur de gaz : tu n'allumes rien, tu ouvres, tu sors, et tu appelles le 0 800 47 33 33 (gratuit). La tienne, elle a la pointe ? »
**À NUANCER (consigne incomplète, numéro EXACT).** Voir §4, point 1 pour le numéro.
- « tu n'allumes rien » : la consigne des sapeurs-pompiers est « Ne pas activer ou ne pas désactiver les appareils ou interrupteurs pouvant produire une étincelle » (dossier, lu à la source) ; GRDF (extrait de recherche) : « Évitez les flammes et les étincelles. Ne touchez à aucun appareil électrique ni téléphone. » « N'allume rien » ne couvre pas **éteindre** une lampe, et le film vient d'expliquer que l'interrupteur est le danger.
- « tu ouvres » : ouvres quoi ? (les fenêtres : GRDF, pompiers « aérer ») ; la phrase est ambiguë.
- « tu sors, et tu appelles » : l'ordre est bon (appeler de dehors, pompiers : « depuis la zone non dangereuse pour ne pas créer d'étincelle »).
- **Remplacement** (136 caractères, sous la limite de 150) : « Odeur de gaz : ni flamme ni interrupteur, tu aères, tu sors, puis tu appelles le 0 800 47 33 33 (gratuit). La tienne, elle a la pointe ? »
- Limite du numéro, non sourcée par moi mais à garder en tête : il est celui du **réseau GRDF** (gaz naturel). Une gazinière sur bouteille de butane/propane n'est pas concernée ; le 18 ou le 112 restent valables pour tous (pompiers.fr).

---

## 4. Les trois points sourcés

### Point 1 — Numéro « Urgence Sécurité Gaz » de GRDF : 0 800 47 33 33, gratuit, 24 h/24 ?
**Verdict : EXACT.**
- Numéro et horaire, **page officielle lue** : ministère de l'Intérieur, « Ma Sécurité », fiche « Numéros utiles nationaux » : « Les professionnels d'urgence sécurité gaz répondent à vos appels 24h/24 et 7j/7 au 0 800 47 33 33 » — https://www.masecurite.interieur.gouv.fr/fr/fiches-pratiques/famille-et-aides-aux-victimes/numeros-utiles-nationaux (primaire ; cette page ne dit ni « gratuit » ni « GRDF » : le préfixe 0 800 est celui d'un numéro vert).
- Gratuité et nom du service, **extrait de recherche limité au domaine grdf.fr** (la page elle-même est en 403 à la lecture, comme pour le dossier) : « Sortez à l'extérieur de votre domicile pour contacter le n° Vert Urgence sécurité gaz au 0 800 47 33 33 (service et appel gratuits) » — https://www.grdf.fr/particuliers/urgence-gaz ; mêmes gestes sur https://www.grdf.fr/particuliers/numero-urgence-fuite-gaz (aérer, couper le gaz, éviter flammes et étincelles, sortir, appeler de l'extérieur, attendre le technicien). Niveau primaire, texte non relu en direct.
- À savoir : le résumé de recherche note que « sur la gratuité depuis un mobile, les sources divergent » ; un 0 800 est gratuit depuis un mobile aussi (règle générale des numéros verts, non sourcée ici). Les comparateurs d'énergie cités par la première recherche disent « gratuit depuis tous les postes, fixe ou mobile, 24h/24, 7j/7, jours fériés inclus » (secondaire).
- `sources[8]` (« gratuit, 24 h/24 ») : EXACT.

### Point 2 — Annonce du 013 : « Une Formule 1 coupée en deux… et l'arceau qui a sauvé son pilote »
**Verdict : coupée en deux EXACT ; « d'autres flammes » EXACT ; « a sauvé » À NUANCER → « a protégé ».**
- **Coupée en deux** : Grand Prix de Bahreïn, 29 novembre 2020, Grosjean (Haas VF-20) contre la glissière au virage 3. Rapport de la FIA, tel que cité par motorsport.com (relu) : « separation of the power train assembly from the survival cell » (le groupe motopropulseur arraché de la cellule de survie) ; l'expression « tear in two » vient du chapeau de l'article, pas du texte du rapport. Wikipédia EN (extrait) : « the impact at the barrier tearing his car in half ». Pas de mensonge : la voiture s'est rompue en deux parties ; si l'on veut coller au rapport : « une Formule 1 arrachée en deux ».
  https://www.motorsport.com/f1/news/grosjean-fire-bahrain-crash-report/5595326/ · https://en.wikipedia.org/wiki/2020_Bahrain_Grand_Prix
- **Incendie** : oui. Rapport de la FIA (même article) : « Fire was ignited during the final moments of the barrier impact, starting from the rear of the survival cell and progressing forwards towards the driver » ; Grosjean est resté 27 s dans le feu (motorsport.com), 28 s selon d'autres médias.
- **Le Halo « a sauvé »** : le rapport dit seulement que l'ensemble de la protection du pilote (casque, HANS, harnais, cellule, siège, appui-tête, Halo) « performed according to their specifications » et ne dit pas que le Halo l'a sauvé. Grosjean l'a dit lui-même depuis l'hôpital : « the greatest thing we brought to Formula 1 » et « without it I wouldn't be able to speak to you today » (formula1.com, 29/11/2020 : https://www.formula1.com/en/latest/article/grosjean-describes-halo-as-greatest-thing-from-hospital-bed-saying-he.5MK7YgW3eTYADMLzifORes). Alan van der Merwe, pilote de la voiture médicale, a rappelé qu'il fallait **tout** ensemble (extrait de recherche). « A protégé » est exact ; « a sauvé » est vrai dans la bouche du pilote, trop net dans celle d'un compte pédagogique.
- Pour le dossier de faits du 013 : l'idée que le Halo a empêché la glissière de toucher la tête de Grosjean vient d'un résumé de recherche (Wikipédia EN) et de la presse ; le texte du rapport lu ici ne l'écrit pas. À sourcer à la source (rapport de la FIA) avant de le dire.

### Point 3 — « Laisse-le toute une nuit, cuisine fermée… et un interrupteur peut suffire »
**Verdict : EXACT.**
- Source officielle française : sapeurs-pompiers de France (pompiers.fr, « Fuite de gaz », lue par le dossier) : « Ne pas activer ou ne pas désactiver les appareils ou interrupteurs pouvant produire une étincelle » — https://www.pompiers.fr/fuite-de-gaz/ (primaire, non rouverte ici).
- Seconde source, **sans le mot « interrupteur »** : GRDF, gestes à avoir en cas d'odeur de gaz (extrait de recherche limité à grdf.fr) : « Évitez les flammes et les étincelles. Ne touchez à aucun appareil électrique ni téléphone. » — https://www.grdf.fr/particuliers/urgence-gaz. Elle confirme le principe (un appareil électrique peut faire une étincelle) mais ne nomme pas l'interrupteur ; le mot vient des pompiers.
- L'arithmétique du « toute une nuit » est dans la rubrique scene ci-dessus : 4 à 5 h pour atteindre 4 à 5 % dans 30 m³ sans ventilation, 8 % au bout d'une nuit de 8 h.

---

## 5. Les entrées de `sources`

### sources[0] — « Dossier de faits complet… contre-vérification phrase par phrase… »
Sans objet factuel.

### sources[1] — Sabaf 16C (mécanisme, 90 s)
**EXACT, avec une réserve de mise en page.** Les trois phrases entre guillemets sont exactes, **relues ici dans le PDF** extrait en local (page 3) : « To turn the valve on, simultaneously press and turn the control shaft », « A few seconds after the burner ignites, the thermocouple generates enough current to hold the safety magnet open », « If the flame should accidentally go out, the thermocouple cools and the current is reduced, the safety magnet is closed and the flow of gas is blocked after a few seconds ». La mention « 90 s » : le tableau de la page 2 est extrait en désordre (la colonne des valeurs est décalée de celle des libellés) ; la seule valeur en secondes est « 90 sec », le dernier libellé est « Themocouples maximum closing time ». L'appariement est donc **inféré par position**. Remplacement : ajouter « (tableau de la notice mal extrait ; 90 s lu par position) » à `sources`.

### sources[2] — « L'aimant retient mais n'attire pas… » (Wikipédia EN + OEG)
**EXACT, une formule à reprendre.** Wikipédia EN relu : « by sizing the coil to be able to hold the valve open against a light spring » ; « 25 mV open circuit falling by half with the coil connected to a 10–12 mV, 0.2–0.25 A source, typically » ; la vanne ne s'ouvre « only after the initial turning-on force is provided by the user pressing and holding a knob ». Mais la page **n'écrit pas** « n'attire pas » : c'est une déduction. Remplacement : « la bobine est dimensionnée pour tenir la vanne ouverte contre un ressort léger ; l'ouverture initiale vient de la main (Wikipédia EN, cohérent avec Sabaf) ». OEG (≈ 30 mV au maximum, pointe à 650 °C, fermeture en 60 à 90 s) : lu par le dossier, non rouvert ici (secondaire, fiche d'un thermocouple de rechange).

### sources[3] — « Dans une minute » et le chrono
**À NUANCER.** La phrase « plausible et dans la limite du fabricant (90 s au plus) ; ce n'est pas une valeur de norme » est honnête et correcte. À ajouter : « la notice Sabaf dit aussi "a few seconds" : une table peut couper plus vite que ce chrono » et, côté voix, « environ ».

### sources[4] — « Cinq litres à la minute »
**EXACT (calcul), « grand brûleur de 3 kW » NON SOURCÉ.** 3 kW ÷ 10 kWh/m³ = 0,3 m³/h = 5 L/min = 300 L/h : arithmétique juste. Sensibilité : 4,8 L/min avec un PCI de 10,45 ; 5,8 L/min pour 3,5 kW. Le PCI « ≈ 10 kWh/m³ » est attribué à GRDF Cegibat : le dossier ne l'a vu que dans des résumés de recherche (secondaire pour le moment). Ajouter à `sources` : « gaz naturel du réseau ; puissance d'un brûleur rapide courant, non sourcée ».

### sources[5] — « Toute une nuit, cuisine fermée… un interrupteur peut suffire »
**EXACT.** Arithmétique refaite : 4,0 h / 4,4 h / 5,0 h pour 4 / 4,4 / 5 % dans 30 m³ à 0,3 m³/h. « 4 à 5 % » et la citation du ministère de l'Intérieur (guide de 2009, 4,4 %) : dossier. Consigne des pompiers : voir §4, point 3.

### sources[6] — « Reconnaître la sécurité sur sa plaque » (AIL)
**EXACT.** Le raisonnement du texte (« le film n'affirme que le sens sûr ») se démontre : AIL dit que **sans** thermocouple « non è necessario tenere premuta la manopola » ; par contraposée, devoir garder la manette enfoncée implique qu'il y en a un. Le dossier a raison d'interdire l'inverse. « AIL, distributeur de gaz de Lugano » : AIL (Aziende Industriali di Lugano) est une régie d'énergie, le mot « distributeur » est juste.

### sources[7] — Accidents BARPI (non cité dans le film)
**À NUANCER.** « 1 189 événements de 2010 à 2019 » : exact (dossier). « Environ 125 par an » : c'est le rythme **des trois dernières années** (« une certaine stabilité du nombre d'événements sur les 3 dernières années (environ 125 par an) »), pas la moyenne des dix ans (1 189 ÷ 10 = 119). « Une explosion dans 42 % des cas » : 505 sur 1 189 = 42,5 %, exact. Remplacement : « 1 189 événements de 2010 à 2019, soit ≈ 119 par an en moyenne (≈ 125 les trois dernières années) ». Aucun effet sur le film.

### sources[8] — « Simplifications assumées… Commentaire épinglé »
- « la course du clapet est exagérée à l'image (≈ 4 mm en vrai) » : **NON SOURCÉ.** Le dossier ne contient aucune valeur de course (ni Sabaf, ni Wikipédia, ni OEG). À retirer ou à écrire « course du clapet exagérée (non chiffrée) ».
- « un seul brûleur est suivi ; l'allumage (étincelle) n'est pas montré ; le film ne dit pas que toutes les gazinières ont cette sécurité » : EXACT.
- « Commentaire épinglé : numéro Urgence Sécurité Gaz de GRDF, 0 800 47 33 33 (gratuit, 24 h/24) » : EXACT (point 1).

---

## 6. Arithmétique (refaite)

| Calcul | Résultat |
| --- | --- |
| 3 kW ÷ 10 kWh/m³ | 0,30 m³/h = 300 L/h = **5,0 L/min** |
| même, PCI 10,45 kWh/m³ (valeur courante, de mémoire) | 4,8 L/min |
| 3,5 kW ÷ 10 / ÷ 10,45 | 5,8 / 5,6 L/min |
| 5 L/min × 50 s / 65 s / 90 s | **4,2 L / 5,4 L / 7,5 L** |
| temps pour « des centaines » de litres à 5 L/min | 100 L = 20 min |
| 30 m³ × 4 % / 4,4 % / 5 % ÷ 0,3 m³/h | **4,0 h / 4,4 h / 5,0 h** |
| une nuit de 8 h dans 30 m³ | 2,4 m³ = 8 % de gaz (explosif entre 4,4 % et, au moins, 15 %) |
| BARPI : 1 189 ÷ 10 ans ; 505 ÷ 1 189 | 119 par an ; 42,5 % |

Tout le raisonnement suppose du gaz naturel et une pièce fermée sans ventilation (pas une cuisine réelle) : « peut » est le bon verbe, et le chrono/compteur sont des illustrations calculées, pas des mesures.

---

## 7. Liste des appels web (12)

1. Recherche « GRDF Urgence Sécurité Gaz 0 800 47 33 33… » (comparateurs d'énergie, secondaire).
2. Recherche limitée à grdf.fr, ministère de l'Intérieur, service-public.fr… (extrait GRDF + ministère).
3. Lecture https://www.masecurite.interieur.gouv.fr/fr/fiches-pratiques/famille-et-aides-aux-victimes/numeros-utiles-nationaux (numéro, 24 h/24, 7 j/7 : lu).
4. Lecture https://www.grdf.fr/particuliers/numero-urgence-fuite-gaz (403).
5. Recherche « FIA report Grosjean Bahrain 2020… » (Jalopnik, motorsportweek, presse).
6. Recherche refusée (filtre de domaines inaccessibles : bbc, lequipe, francetvinfo).
7. Recherche limitée à fia.com, formula1.com, wikipedia.org, autosport.com, motorsport.com (extrait Wikipédia EN, formula1.com, motorsport.com).
8. Lecture https://www.motorsport.com/f1/news/grosjean-fire-bahrain-crash-report/5595326/ (rapport de la FIA : citations).
9. Lecture https://www.formula1.com/en/latest/article/grosjean-describes-halo-as-greatest-thing-from-hospital-bed-saying-he.5MK7YgW3eTYADMLzifORes (déclaration de Grosjean).
10. Recherche « fuite de gaz odeur interrupteur étincelle… » limitée aux sites officiels (extrait GRDF).
11. Lecture https://en.wikipedia.org/wiki/Thermocouple (ressort, 25 mV, extinction : relu).
12. Lecture du PDF Sabaf 16C (illisible en direct ; relu en local avec `pdftotext`).

Non vérifié faute de budget : la puissance d'un « grand feu » (3 kW) et l'effet butane/propane sur le débit et la limite d'explosivité ; le maximum de fermeture de la norme EN 30-1-1 / EN 125 ; la page pompiers.fr (déjà lue par le dossier) ; la fiche OEG (dossier).

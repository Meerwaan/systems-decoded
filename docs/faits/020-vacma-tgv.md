# Dossier de faits — 020 La veille automatique du TGV (VACMA, « pédale de l'homme mort »)

Recherche du 2026-10-09. Format : fait — valeur — phrase de la source — URL — niveau (A primaire lu · B secondaire sérieux · C faible).
Budget : ≈ 26 requêtes sur 30 (recherches + pages + téléchargements). Pages en 403/404 ou illisibles : franco.wiki (404), Latts-T2C (bloqué par un anti-robot). Les PDF de l'EPSF et du BEA-TT ont été extraits en local (pdftotext). « Résumé de recherche, non lu » = vu seulement dans le résumé du moteur.

## 1. Fonctionnement exact (référence : la recommandation EPSF SAM S 301)

- **Texte de référence A** : EPSF, recommandation SAM S 301 « Dispositif de contrôle de l'état de veille du conducteur », v2 du 13/12/2013, applicable au réseau ferré national, à tout matériel équipé (locomotives, automotrices, trains automoteurs). — https://www.securite-ferroviaire.fr/sites/default/files/reglementations/pdf/2023-03/sam-s301-v2-mac.pdf — **A**. Le texte est un « moyen acceptable de conformité » : il présume le respect de l'arrêté du 19 mars 2012, dont l'art. 49 h) : « Toute cabine de conduite […] est équipée d'un dispositif destiné à provoquer automatiquement l'arrêt du train en cas de défaillance du conducteur ». Les entreprises peuvent adopter d'autres solutions. Le réglage exact d'une rame TGV n'est pas lu (voir « Non trouvé »).
- Rôle : « Ce dispositif interrompt l'effort de traction de l'engin moteur et déclenche un freinage d'urgence en cas de manipulation non conforme du conducteur, et signale cette prise en charge au régulateur exploitant la ligne si la radio sol-train est présente. » — SAM S 301 §1 — **A**.
- Armement : « armé lorsque la vitesse atteint 3 km/h » — §5.2 — **A**.
- **Fonction maintien d'appui** : « Le temps maximal du maintien peut atteindre 55 secondes. Un signal acoustique retentit après ce délai. » Puis « freinage d'urgence […] et la cessation de l'effort de traction surviennent immédiatement après 5 secondes de signal acoustique sans réaction du conducteur (relâché) » — §5.3 — **A**. Soit ≈ 60 s au total.
- **Fonction relâché d'appui** : « Le temps maximal du relâchement est fixé à 2,5 secondes. Un signal acoustique retentit après ce délai. » Puis freinage d'urgence et coupure de la traction « après 2,5 secondes de signal acoustique sans réaction du conducteur (appui) » — §5.4 — **A**. Soit 5 s au total si le conducteur lâche et ne réappuie pas.
- Tolérance : « Toutes les temporisations peuvent varier dans une plage maximum de ±15% » — §5 — **A**.
- **Alarme radio** : « dans les 30 secondes suivant l'arrêt du train, donner l'ordre à l'équipement radio d'émettre l'alarme veille automatique. La durée de cette émission est limitée à 5 secondes. » (engins équipés de radio sol-train) — §5.5 — **A**. Le conducteur peut l'interrompre dans les 30 s.
- Cabine : le dispositif comprend « des organes spécifiques (boutons poussoirs, pédales, etc.) » ET « des commandes implantées sur certains appareils dédiés à la conduite (manipulateurs de traction et de freinage, avertisseur sonore de route, boutons poussoirs d'acquittement des signaux...) », actionnables « sans quitter le poste de conduite » ; les touches sensitives existent (elles doivent être « cohérentes avec une action volontaire ») — §5.1 — **A**.
- Voyant : freinage et coupure « signalés, en plus du signal sonore, par l'allumage d'un voyant spécifique » — §5.7 — **A**. Deux sons distincts (maintien / relâché) — **A**.
- Isolement : commutateur scellable ; test à l'arrêt possible — §5.8, 5.9 — **A**.
- Pédale et cerclo : « La pédale de Veille automatique ou le "cerclo" est à deux positions : relevée ou en maintien d'appui » ; sur la SNCF le conducteur doit relâcher puis réappuyer au signal ; temps de 58 s environ + 3 s — https://www.techno-science.net/fr/definitions/pedale-de-l-homme-mort — **B/C** (reprise de Wikipédia, valeurs divergentes de la SAM : « 58 s », « 3 s »). Wikipédia FR « Veille automatique » (lu) : alarme « environ une minute (±10 s) » après la dernière action, puis ≈ 3 s — **B**. Les valeurs exactes dépendent donc du matériel.
- Presse (30 s / 5 s / 3 s) : Europe 1, 25/12/2024 : le conducteur doit relâcher « au moins toutes les 30 secondes », sinon alarme ; 3 s pour réagir ; « moteurs coupés » et freinage d'urgence — https://www.europe1.fr/societe/suicide-dun-conducteur-le-soir-de-noel-comment-le-systeme-darret-durgence-du-tgv-permis-deviter-le-pire-236714 — **C** (la page elle-même est ambiguë ; ne contredit pas la SAM mais ne colle pas : 30 s ≠ 55 s). Connexion France reprend les mêmes chiffres : https://www.connexionfrance.com/news/tgvs-urgent-stop-system-prevents-catastrophe-in-france-after-driver-jumps-from-cab/696811 — **C**. Un forum de conducteurs (résumé de recherche, non lu) dit « VA réglée à 60 s pour 98 % des trains SNCF, quelques TGV internationaux à 30 s » — **C**, à ne pas utiliser. **Ne pas utiliser les « 30 s » de la presse** : la SAM dit 55 s.
- **Mesure réelle sur le terrain** : le BEA-TT, rapport Versailles Rive Gauche (13/08/2007, rame Z2N, matériel SNCF) : « la constante de temps (60 secondes) du système de veille automatique » — https://www.era.europa.eu/system/files/2023-07/Versailles-130807.pdf — **A**.

## 2. Pourquoi RELÂCHER et pas seulement appuyer

- Wikipédia FR « Veille automatique » (lu en entier par moi via WebFetch) : sans cycle, on peut défaire le dispositif en coinçant la pédale (« avec un sac ») ou en bloquant le cerclo appuyé ; et le poids mort d'un membre peut maintenir un actionneur enfoncé. Il faut donc un cycle relâcher/appuyer « pour distinguer l'action volontaire de l'involontaire ». — https://fr.wikipedia.org/wiki/Veille_automatique — **B** (la phrase exacte n'a pas été recopiée ; paraphrase de ma lecture).
- Même page : un cas où la pédale n'a pas détecté l'incapacité du conducteur : Waterfall (Australie, 31/01/2003), 7 morts, 41 blessés ; le conducteur était mort et la pédale est restée appuyée (le texte parle de conducteurs lourds, > 92 kg) — **B**. Ce cas n'est pas français : à dire comme tel, ou à taire.
- Dans la SAM S 301, la fonction « maintien d'appui » est bornée à 55 s : on ne peut donc pas rester appuyé en continu sans déclencher le signal. C'est le fait vérifié (A) ; le **pourquoi** (cadavre ou objet qui reste appuyé) est un raisonnement sourcé B seulement.
- Pas trouvé : une source de la SNCF ou de l'EPSF qui dit nettement « l'ancienne veille à maintien ne suffisait pas parce qu'un conducteur évanoui pouvait rester appuyé ». La source B (Wikipédia FR) la plus proche suffit pour dire « c'est pour ça », avec « on ». Je n'ai pas pu vérifier l'origine de la phrase.

## 3. Sur un TGV précisément

- Le BEA-TT, fiche de présentation Crisenoy (24/12/2024) : le TGV n° 6689 (Paris-Lyon → Saint-Étienne, rame Duplex, 393 passagers) « circule à la vitesse de 255 km/h, le système de veille automatique du train provoque l'arrêt d'urgence du TGV (ouverture des disjoncteurs et mise à l'atmosphère de la conduite générale). L'arrêt est obtenu à 19 h 22 min 38 s en 2 320 m. Le système de veille automatique émet immédiatement un signal radio d'alarme reçu par le CCSE de Lyon » — https://www.bea-tt.developpement-durable.gouv.fr/IMG/pdf/beatt_2024_12-crisenoy_fiche_presentation.pdf — **A**. Le conducteur n'était plus dans la cabine ; son corps a été retrouvé à environ 2 000 m en amont ; le train a repris sa marche à 0 h 10. LGV Sud-Est, voie 1C, TVM et COVIT.
- Vitesse commerciale : LGV Sud-Est (Paris-Lyon) à 300 km/h, 320 km/h sur la LGV Est/Rhin-Rhône — **non lu en source A** ; ne pas chiffrer précisément sans l'avoir confirmé.
- Distance d'arrêt d'urgence à 300 ou 320 km/h : **aucune valeur A**. Ordre de grandeur de ma conclusion : l'arrêt de Crisenoy (255 km/h, 2 320 m) donne une décélération moyenne ≈ 1,1 m/s² (v²/2d, calcul personnel) ; à 300 km/h cela donne ≈ 3,2 km (calcul personnel, distance ∝ v²) — cohérent avec « 3 km depuis 320 km/h » attribué à un porte-parole SNCF par Connexion France (résumé de recherche, non lu — **C**) et avec un exercice de physique (Labolycee 2020, 425 t, 320 km/h : 3,2 km — **C**, résumé non lu). À dire : « plus de deux kilomètres à 255 km/h, environ trois kilomètres à 300 ».
- Emplacement des commandes en cabine d'un TGV (pédale, cerclo, manipulateur) : **non trouvé**. Les sources disent seulement « une pédale avec le pied, soit un contacteur avec la main » (Europe 1, C) et « pédale ou cerclo » (techno-science, C).

## 4. Histoire

- Décret du 22 mars 1942, article 30 : permet la circulation avec un seul agent en cabine si l'engin est équipé d'un dispositif d'arrêt en cas de défaillance. Wikipédia FR (lu) : « L'article 30 du décret du 22 mars 1942 » — https://fr.wikipedia.org/wiki/Veille_automatique — **B** (le texte du décret n'a pas été lu). Europe 1 : « obligatoire sur les trains en France à partir de 1942 » — **C**.
- Avant, sur les locomotives à vapeur : deux agents toujours à bord (techno-science, **C**).
- 1942 : les ingénieurs de la SNCF Garreau et Laplaîche analysent les systèmes candidats ; la SNCF a longtemps préféré la veille à maintien d'appui, « jusqu'au milieu des années 1960 », date de passage à la VACMA (cycle) — Wikipédia FR, **B** ; un résumé de recherche d'un colloque (Latts, 2004) dit « années 1960 », non lu — **C**.
- 2006 : l'article 30 est abrogé pour le réseau ferré national (décret n°2006-1279, Wikipédia FR, **B**) ; l'arrêté du 19 mars 2012 impose le dispositif (art. 49 h), cité par la SAM S 301 — **A**.
- L'origine « tramways, métro » : **non trouvée**. Le « dispositif d'homme mort » existe aussi en tramway (Rouen, plus bas). Ne pas dire « inventé pour le métro ».

## 5. Cas documentés

- **Crisenoy, 24/12/2024** : voir §3. Elle a agi : arrêt d'urgence en 2 320 m, 393 passagers sans danger, alerte radio reçue par Lyon. Le conducteur était tombé du train (le BEA-TT parle d'une « chute » et ouvre une enquête : cause non établie dans la fiche ; la presse parle de suicide — **ne pas le dire dans le film**).
- **Versailles Rive Gauche, 13/08/2007** (BEA-TT, rapport de mars 2008, lu) : le conducteur s'endort à deux reprises avant le heurtoir, l'accostage est brutal, la rame heurte le heurtoir. Le BEA-TT : « la constante de temps (60 secondes) du système de veille automatique n'aurait pas pu agir car l'évènement s'est déroulé sur une période largement inférieure à la minute. » — **A**. La veille est armée mais trop lente pour un endormissement bref : à dire comme « elle laisse passer ce qui dure moins d'une minute ».
- **Tramway de Rouen, 30/08/2004** (BEA-TT 2004-007, lu) : la rame franchit un signal rouge et heurte une autre rame ; « La cause identifiée de l'accident réside dans la perte de vigilance du conducteur […] alors que le système de veille "VACMA" s'est révélé inadapté pour détecter cet état de fait. » — https://www.bea-tt.developpement-durable.gouv.fr/IMG/pdf/rapport_BEATT_2004_007_cle72739d.pdf — **A**. Le test en atelier après l'accident : la VACMA fonctionnait normalement ; elle « a été activée par le conducteur malgré l'état de vigilance dégradée dans lequel il se trouvait, ce qui revient à dire qu'elle n'a pas rempli sa fonction » ; et « la seule information fiable qu'elle peut délivrer sur le conducteur est la présence effective de ce conducteur sur la rame ! ». Réglage du tramway de Rouen : 13 s en maintien + 2 s de buzzer, ou 2 s + 2 s en relâché (valeurs du tram, pas du TGV). Le conducteur a donc réarmé « au moins deux à trois fois » pendant les 44 s du trajet (calcul du rapport). Nombre de morts/blessés : non lu.
- Pas trouvé : un cas de malaise ou d'endormissement d'un conducteur de TGV arrêté par la VACMA, ni un accident majeur de la SNCF qui ait fait évoluer la règle. À ne pas inventer.

## 6. Ce qu'elle ne fait PAS

- La SAM S 301 décrit un seul rôle : détecter un manque d'action du conducteur et déclencher arrêt + alarme. Elle ne lit ni signaux ni vitesses.
- Wikipédia FR (lu) : elle ne détecte pas la somnolence ni l'inattention, et ne prévient pas l'excès de vitesse ; d'autres dispositifs ont été ajoutés « pour la répétition des signaux et le contrôle de vitesse » (KVB, crocodile, etc.) — **B**. Sur la LGV, le BEA-TT (Crisenoy) cite la TVM (signaux captés par l'antenne sous la motrice, « présentés en continu au conducteur pour lui permettre de respecter la vitesse limite ») et le COVIT (« système de contrôle de vitesse, qui interviendra directement en cas de besoin ») — **A**. La TVM et le COVIT sont donc distincts de la veille.
- Rouen 2004 (BEA-TT, A) : la VACMA ne vaut que pour la présence, pas pour la vigilance.

## 7. Combien de fois par trajet

- Au plus 55 s d'appui puis un signal de 5 s : au mieux un cycle de relâchement environ toutes les 55 à 60 s, ±15 %. Sur un Paris-Lyon d'environ 2 h (non sourcé ici), cela fait de l'ordre de 120 cycles obligatoires au minimum (calcul personnel : 7 200 s / 60 s). En pratique le conducteur agit plus souvent : toute action sur le manipulateur, le klaxon ou les acquittements de signaux remet le compteur à zéro (SAM §5.1) ; on dit donc « au moins une fois par minute ».

## 8. Vocabulaire

veille automatique (VA) · VACMA = veille automatique à contrôle du maintien d'appui (dans la SAM S 301 : « Veille Automatique à Contrôle de Maintien d'Appui » ; le BEA-TT et la SNCF écrivent « veille automatique avec contrôle du maintien d'appui » — les deux circulent) · pédale · cerclo · manipulateur · touches sensitives · signal acoustique · freinage d'urgence (FU) · effort de traction · radio sol-train · conduite générale · homme mort (terme familier, pas le terme officiel).

---

## À dire tel quel
- « La veille automatique doit prouver que le conducteur est là : sans geste, elle coupe la traction et déclenche le freinage d'urgence » (SAM S 301, A).
- Il faut relâcher puis réappuyer à intervalles réguliers : l'appui maintenu au-delà de 55 secondes déclenche un signal sonore, puis un freinage d'urgence cinq secondes plus tard (SAM S 301, A ; ±15 %).
- Si le conducteur relâche, le signal sonore retentit après 2,5 secondes, et le freinage d'urgence 2,5 secondes plus tard (SAM S 301, A).
- Après l'arrêt, elle envoie une alarme radio (SAM S 301 ; observé à Crisenoy, BEA-TT, A).
- Crisenoy, 24 décembre 2024 : un TGV de 393 passagers, 255 km/h, la veille automatique le stoppe en 2 320 mètres (BEA-TT, A).
- Rouen 2004 : la veille « ne peut fournir que la présence du conducteur » (BEA-TT, A).

## Ordres de grandeur (à dire avec « environ »)
- Un geste au plus toutes les 55 à 60 secondes ; de l'ordre de 120 par Paris-Lyon (calcul).
- Arrêt d'urgence : un peu plus de deux kilomètres à 255 km/h (mesuré) ; environ trois kilomètres à 300 km/h (calcul).
- Décélération moyenne de l'arrêt de Crisenoy ≈ 1,1 m/s² (calcul), soit environ 65 s d'arrêt.

## À ne pas dire
- « Toutes les 30 secondes » : chiffre de presse, non confirmé par la SAM (55 s + 5 s).
- « Une pédale de l'homme mort » comme nom officiel de la VACMA, ou « inventée pour le métro / les tramways » (non sourcé).
- « Elle surveille la vigilance » ou « elle détecte l'endormissement » : faux, elle détecte l'absence de geste (BEA-TT Rouen 2004).
- « Elle contrôle la vitesse » ou « elle lit les signaux » : non, ce sont la TVM / le COVIT (LGV) ou le KVB.
- « Suicide » à propos de Crisenoy : le BEA-TT parle de « chute » ; l'enquête judiciaire est ouverte.
- « Elle a sauvé des vies » à propos de Crisenoy : le conducteur n'a pas été sauvé ; la SNCF dit seulement que la sécurité des passagers n'a pas été menacée (presse, C).
- Une distance d'arrêt exacte à 300/320 km/h attribuée à la SNCF : aucune source A.
- « En 1942 la pédale a été inventée » : 1942 est la date du décret qui l'autorise à un agent seul, pas l'invention de la pédale.
- La position exacte de la pédale dans la cabine d'un TGV.

## Trois faits-accroche
1. 24 décembre 2024 : un TGV de 393 passagers roule à 255 km/h sans conducteur dans la cabine ; la veille automatique le stoppe en 2 320 m (BEA-TT, A).
2. Elle n'est pas là pour savoir si tu es réveillé : « la seule information fiable », c'est ta présence (BEA-TT Rouen, A).
3. Il faut relâcher la pédale pour prouver qu'on est là : appuyer sans bouger ne suffit pas (SAM S 301 A + Wikipédia B).

## Non trouvé
Réglage exact de la veille d'une rame TGV Duplex (55/5 s est la recommandation générale, pas le réglage TGV) ; emplacement de la pédale et du cerclo en cabine TGV ; distance d'arrêt d'urgence officielle à 300 ou 320 km/h ; texte du décret du 22 mars 1942 ; origine tramway/métro ; une source SNCF/EPSF qui dit nettement pourquoi il faut relâcher ; cas TGV de malaise ou d'endormissement arrêté par la VACMA ; nombre de morts et de blessés de Rouen 2004.

## URL lues
sam-s301-v2-mac.pdf (EPSF, extrait pdftotext) · beatt_2024_12-crisenoy_fiche_presentation.pdf (BEA-TT, extrait) · rapport_BEATT_2004_007_cle72739d.pdf (Rouen, extrait) · Versailles-130807.pdf (ERA/BEA-TT, extrait) · fr.wikipedia.org/wiki/Veille_automatique · techno-science.net pédale de l'homme mort · europe1.fr (25/12/2024) · connexionfrance.com/…/696811 · RC A-B 2d (EPSF, PDF illisible en extraction : sigle VACMA seul).

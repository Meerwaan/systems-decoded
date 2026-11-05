# 037 — Contre-vérification du script (parachute de secours, déclencheur automatique)

Requêtes web : 5 sur 12 (manuel CYPRES 2 relu en texte intégral via le PDF local, 3 recherches DT 49 / Code du sport, 1 recherche chasse d'urgence).

## Verdict

**3 phrases à corriger sur 16 beats** (2 vraies corrections, 1 réglage léger). Tout le reste tient. Rien de faux sur les points les plus risqués (« il ne fait rien », « allumer », DT 49, 4 secondes).

## Points demandés

1. **« 198 grammes »** : le manuel CYPRES 2 (éd. 2025, p. 53-54) donne « approx. 198 grams » dans le bloc « Standard settings for EXPERT CYPRES », à côté d'un volume de 139 cm³. Or l'unité de traitement seule fait 85 × 43 × 32 mm = ≈ 117 cm³ : 139 cm³ et 198 g décrivent donc très probablement **l'ensemble** (boîtier + unité de contrôle + coupe-boucle), pas le seul boîtier comme le dossier de faits l'écrit. Et « Dedans » (dans le sac) ne couvre pas l'unité de contrôle, posée à l'extérieur. Le chiffre est un « approx. », propre à l'Expert (le Tandem, le Student ont d'autres masses). **À corriger : « environ deux cents grammes »**, vrai quelle que soit la lecture.
2. **« À quatre secondes du sol »** : le calcul tient. 225 m à 55 m/s = 4,1 s ; le manuel donne lui-même « typical freefall speed approx. 50 m/s » (4,5 s) ; et le fabricant admet un tir jusqu'à 260 ft plus haut (Vigil/PD, [S]). C'est un ordre de grandeur honnête, « quatre secondes » ne ment pas. **Tient.** Ne pas écrire « exactement ».
3. **« Sauf si, ce matin, tu as oublié de l'allumer » puis « il ne fait rien »** : vrai. Manuel : mise en marche par quatre clics avant le premier saut de la journée (« Switch it on prior to the first jump of the day ») ; « Functioning period : 14 hours from switch-on », puis « the unit will switch itself off automatically ». Un CYPRES éteint (jamais allumé, ou allumé depuis plus de 14 h) n'est pas en veille : il n'agit pas. **Tient.** (« S'éteint seul au bout de 14 h » = 14 h après la mise en marche.)
4. **« En France, il doit être allumé à chaque saut »** : DT 49 FFP, modifiée le 27/03/2026, applicable au 01/04/2026 : « L'emport d'un déclencheur de sécurité … est obligatoire et doit être en fonction marche pour les sauts pour tous les pratiquants » [P, lu]. Le Code du sport A322-158 le dit aussi (« déclencheur de sécurité activé »), mais lu seulement via une reprise secondaire [S]. **Tient.**
5. **« Au-delà de 35, c'est une chute »** : le seuil est celui du **boîtier** (Expert : > 35 m/s ≈ 70 % de la chute libre, [P]), pas une loi physique ; le manuel Speed CYPRES reconnaît qu'une voile de vitesse peut dépasser 46 m/s. Formulée sans « pour lui », la phrase se lit comme une définition universelle, et l'unité n'est dite qu'au beat suivant. **À corriger (léger)** : « pour lui ».
6. **Seconde accroche, voAlt[1] du beat accroche** (« Ton parachute s'ouvre. Personne n'a tiré ta poignée. Et toi… tu es inconscient. ») : le fait est vrai (la voile de secours s'ouvre bien, le boîtier a tranché la boucle). Mais elle ne commence pas par « Tu tombes » : la boucle est sacrée, la dernière phrase (« Comme ce boîtier, quand, ») doit retomber sur les premiers mots de l'accroche ; avec « Ton parachute », c'est un autre début, et `npm run script` le signale. **À corriger.**
7. **Annonce du 038 dans `abo`** (« En urgence, l'air comprimé chasse l'eau de ses ballasts… et il jaillit ») : vrai comme fait général. Wikipedia (EMBT) et les articles sur les essais décrivent la chasse d'urgence : air haute pression dans les ballasts principaux, l'eau est expulsée, le sous-marin remonte vite ; les photos de sous-marins qui percent la surface sont des essais (USS Columbus, USS Kentucky). « Chasser l'eau » est le bon verbe. Aucun bateau n'est nommé, donc rien d'attribué au San Francisco. Réserve : « jaillit » dépend de la profondeur et de la vitesse ; au 038, ne jamais dire que le San Francisco a jailli (le dossier 038 le note déjà). **Tient.**

## Phrase par phrase

- **accroche** « Tu tombes, inconscient. Ton sac, lui, est réveillé. » — **tient.** « Réveillé » est une image qui suppose l'appareil allumé, ce que le beat suivant précise aussitôt.
- **accroche, voAlt[0]** — tient (même texte, autre balise).
- **accroche, voAlt[1]** — **à corriger** (voir 6).
- **promesse** « Dedans, 198 grammes vont agir à ta place. » — **à corriger** (voir 1).
- **promesse** « À quatre secondes du sol. » — tient (voir 2).
- **promesse** « Sauf si, ce matin, tu as oublié de l'allumer. » — tient (voir 3).
- **scene** « Tu tournes, à 200 kilomètres-heure. Le sol monte. Ta poignée ? Personne ne la tirera. Il ne reste que ce boîtier, dans ton dos. » — tient. 200 km/h = ordre de grandeur de la chute à plat (le manuel dit ≈ 50 m/s, soit 180 km/h ; la fiche de 2018 parle de 170 mph tête en bas). Le boîtier est bien dans le conteneur du secours, dans le dos.
- **ouvre** — tient (phrase signature).
- **eclate** — tient : boîtier sous le rabat, capteur de pression barométrique, câble vers le coupe-boucle, boucle de fermeture passée dans le trou du coupe-boucle (« the closing loop must pass through the cutter hole »).
- **principe** « Plus tu descends, plus l'air s'épaissit. Le boîtier lit sa pression… et à quelle vitesse elle monte. Une voile ouverte : quelques mètres par seconde. » — tient (3 à 13 m/s sous voile ouverte, manuel Student). « Au-delà de 35, c'est une chute. » — **à corriger (léger)** (voir 5).
- **repos** « Au sol, il prend cette pression comme son zéro. Dans l'avion, il compte la montée. Et sa fenêtre ne s'ouvre que vers 225 mètres du sol. » — tient (« zeroing », calcul d'altitude en continu, 750 ft ≈ 225 m, « vers » suffit).
- **zero** « 225 mètres. Plus de 35 mètres par seconde. Ta main ne bouge pas. Quatre secondes. » — tient.
- **reponse** « un piston avance de 5 millimètres. La boucle est tranchée. Ton secours s'ouvre. La voile se gonfle. Et toi… tu n'as pas bougé. » — tient : piston ≈ 5 mm, boucle coupée, aucune durée d'ouverture annoncée.
- **chute** « il ne sait pas que tu es inconscient. Il n'ouvre même pas ton parachute. Il coupe un fil. » — tient : le manuel dit « cannot open your reserve — only intended to cut your reserve closing loop ». « Un fil » = la boucle de fermeture, image acceptable.
- **comment** « Et si tu ne l'as pas allumé ? Il ne fait rien. En France, il doit être allumé à chaque saut. En commentaire : tu fais confiance au boîtier… ou à ta main ? » — tient (voir 3 et 4). Question fermée à deux camps : conforme.
- **like** — tient.
- **abo** — tient (voir 7).
- **boucle** « Comme ce boîtier, quand… » — tient avec l'accroche principale (« …quand tu tombes »).

## Phrases de remplacement

- **promesse** : « Dedans, [200|environ deux cents] grammes vont agir à ta place. À quatre secondes du sol. Sauf si, ce matin, tu as *oublié* de l'allumer. » — `vo` : « [firm, matter-of-fact] Dedans, environ deux cents grammes vont agir à ta place. À quatre secondes du sol. [short pause] Sauf si, ce matin, tu as oublié de l'allumer. » (le repère `promesse:cent` éventuel est à revoir : le mot dit est maintenant « environ »/« deux »). Plus courte que l'ancienne.
- **principe** : « … Une voile ouverte : quelques mètres par seconde. Au-delà de [35|trente-cinq], pour lui, c'est une *chute*. » (deux mots de plus, le seul ajout qui fait de 35 son seuil et non une loi).
- **accroche, voAlt[1]** : `vo` « [tense] Tu tombes, inconscient. Personne n'a tiré ta poignée. Et ton parachute s'ouvre. » (mêmes premiers mots que l'accroche ; même rôle ; une phrase de moins).

## Reste ouvert

- 198 g : le manuel ne dit pas explicitement quelles pièces sont pesées ; « environ deux cents grammes » est vrai dans les deux lectures. Le dossier de faits (§ 3, 4, 8) dit « unité de traitement = 198 g » : probablement inexact.
- 200 km/h : le manuel donne ≈ 180 km/h en chute à plat ; ordre de grandeur toléré, pas un chiffre à afficher en grand.
- Code du sport A322-158 : lu seulement dans une reprise secondaire ; la DT 49 (primaire) suffit.
- L'unité « 35 m/s » n'est dite qu'au beat `zero` ; l'oreille a déjà « quelques mètres par seconde » juste avant, ce qui suffit.

# Contre-vérification du script 021 (VACMA / veille automatique du TGV)

Faite le 2026-10-13 sur le tableau `beats` (champ `text`) et `sources` d'`episode.json`, contre `docs/faits/021-vacma-tgv.md`. Limite : les pages BEA-TT, EPSF et SNCF sont en 403 ou en PDF illisible pour WebFetch ; seuls des résumés de recherche ont pu être relus (niveau indiqué à chaque fois). Les valeurs de la SAM S 301 et la fiche de Crisenoy ne sont donc confirmées que par le dossier de faits (extraits locaux, niveau A, lus par l'auteur du dossier) et, pour la fiche, par un résumé de recherche qui reprend les mêmes chiffres.

## Nouveauté à connaître

Le BEA-TT a **remis son rapport conclusif à SNCF le 18 décembre 2025** (6 recommandations, dont R1 sur le cadre des visites médicales VMT / VMAS) ; des recommandations immédiates datent du 21 février 2025 (visites d'aptitude). Source : résumés de recherche de la page « Décembre 2024, chute sur la voie du conducteur d'un TGV en marche à Crisenoy (77) » et du courrier SNCF du 11 mars 2026 (https://www.bea-tt.developpement-durable.gouv.fr/recommandations-immediates-m1030.html?lang=fr ; niveau C ici, page non ouverte). Le rapport n'a pas pu être lu : il peut contenir le réglage réel de la VACMA du TGV et le délai chute → arrêt, ce qui lèverait deux réserves ci-dessous. Même source (réponse SNCF d'avril 2025, résumé) : « après la chute d'un conducteur, le dispositif VACMA s'est déclenché » — le BEA-TT et SNCF emploient bien le mot « chute ». Page probable du rapport : https://www.bea-tt.developpement-durable.gouv.fr/rapport-d-enquete-technique-sur-la-chute-sur-la-a1464.html (403).

## Beat par beat

**accroche** — « Ton TGV file à 255 kilomètres-heure. Dans la cabine… plus personne. » — **Tient.** Fiche BEA-TT (A) : 255 km/h au moment du déclenchement, conducteur absent de la cabine. (255 est la vitesse au déclenchement ; le film ne dit pas « depuis le départ ».)

**promesse** — « Il va s'arrêter tout seul. Mais ce qui l'arrête… a un angle mort. » — **Tient.** Arrêt d'urgence par la veille automatique (fiche, A) ; angle mort = Versailles 2007 et Rouen 2004 (A).

**scene**
- « Ce n'est pas un scénario. Vingt-quatre décembre 2024 : le conducteur tombe du train. » — **Tient, et c'est le bon mot.** Le BEA-TT intitule l'événement « chute sur la voie du conducteur d'un TGV en marche » ; « tombe du train » est fidèle, sobre, sans cause ni nom. Ne pas passer à « saute » / « se jette » (presse).
- « Derrière lui, 393 passagers. » — **Tient** (fiche, A ; la fiche ajoute 4 agents d'accompagnement, que la phrase n'exclut pas).
- « Aucun ne le sait. » — **Fragile, non sourcé.** Rien dans la fiche ne dit ce que les passagers savaient ; un agent d'accompagnement a tenté de joindre le conducteur (SNCF, résumé, C). Remplacer par une phrase qui décrit sans affirmer.
- « le train avale soixante-dix mètres par seconde » — **Tient** : 255 / 3,6 = 70,8 m/s.

**ouvre** — « Alors… on l'ouvre. » — signature, rien à vérifier.

**eclate**
- « Une pédale. » — **Tient** (SAM §5.1 : pédales ; Wikipédia : pédale ou cerclo).
- « Des touches, sous les doigts. » — **Fragile.** La SAM admet des touches sensitives et des commandes de conduite ; l'emplacement et le type d'organe sur un TGV ne sont pas lus (« non trouvé » dans le dossier). Dire « ou des touches » plutôt que de les poser sur toutes les rames.
- « Un simple compte à rebours. » — **Tient** (temporisations de la SAM).

**repos**
- « Appuyer ne suffit pas. Près d'une minute sans geste : une sonnerie. » — **Tient avec réserve.** SAM §5.3 (A) : maintien 55 s puis signal acoustique ; ±15 % ; BEA-TT Versailles : « constante de temps (60 secondes) » (A, rame Z2N). « Près d'une minute » est assez large pour couvrir 47 à 63 s. Le réglage d'une rame TGV n'est pas lu : `sources` doit le dire.
- « Il faut relâcher. Puis réappuyer. Toute la journée. » — **Tient** (SAM §5.3-5.4). « Toute la journée » = image (≈ 1 geste par minute), acceptable.
- « Parce qu'un corps effondré… appuie toujours. » — **Trop absolu.** Source B seulement (Wikipédia FR : le poids d'un membre peut maintenir un actionneur enfoncé ; Waterfall, Australie 2003, pédale restée appuyée). Aucune source SNCF / EPSF ne donne ce « pourquoi ». « toujours » est faux (un corps tombe aussi hors de la pédale — c'est ce qui se passe dans le film). Voir corrections.

**seuil** — « Abonne-toi : cette cabine vide, regarde ce qui s'y passe. » — **Tient** (cabine vide = fiche).

**zero**
- « La pédale se relève. Deux secondes et demie. Une sonnerie. Personne ne répond. » — **Tient avec réserve.** SAM §5.4 (A) : relâché 2,5 s puis signal, ±15 %, recommandation générale, pas le réglage TGV. Ajouter « environ » est suffisant et gratuit. Le délai réel chute → relâché à Crisenoy n'est pas connu : le film ne le prétend pas, ne pas l'afficher.
- « Le train, lui, file toujours. » — **Tient.**

**reponse**
- « Deux secondes et demie de plus. » — **Tient** (SAM §5.4 : 2,5 s de signal sans réaction), même réserve.
- « Verdict : absent. » — **Tient** (image : la SAM dit « sans réaction du conducteur »).
- « Le courant est coupé. » — **Tient** : fiche, « ouverture des disjoncteurs » ; SAM, « interrompt l'effort de traction ».
- « L'air des freins s'échappe : freinage d'urgence. » — **Tient** : fiche, « mise à l'atmosphère de la conduite générale » (A). Le dossier de faits note la simplification.
- « 2 320 mètres plus loin… le train est arrêté. » — **Tient** (fiche : arrêt obtenu en 2 320 m, A). « plus loin » = depuis le déclenchement du freinage.
- « Il prévient lui-même, par radio. » — **Tient** : fiche, « émet immédiatement un signal radio d'alarme reçu par le CCSE de Lyon » ; SAM §5.5 (dans les 30 s après l'arrêt, si radio sol-train).

**chute**
- « Elle ne surveille pas le conducteur. » — **Tient** (Rouen 2004, A : « la seule information fiable […] est la présence effective de ce conducteur »). Plus exact : « ne surveille pas son état » ; optionnel.
- « Elle ne sait pas s'il dort. Elle sait une seule chose… quelqu'un a bougé. » — **Tient.** BEA-TT dit « présence » ; la SAM dit « manipulation » ; « a bougé » = « a agi sur une commande », compatible. (Pour Rouen 2004 : un conducteur en vigilance dégradée a réarmé la VACMA — l'idée « elle voit un geste, pas un état » est bien celle-là.)

**comment**
- « Son angle mort ? La minute. Un conducteur qui s'assoupit quelques secondes… elle ne le voit pas. » — **Tient** (Versailles 2007, A : l'événement « s'est déroulé sur une période largement inférieure à la minute »). Attention : le même rapport vise une rame Z2N, pas un TGV ; le principe est général.
- « Pour ça, d'autres systèmes surveillent la vitesse. » — **Tient** (fiche Crisenoy : TVM et COVIT, A ; KVB hors LGV, Wikipédia B). « surveillent la vitesse » est exact pour COVIT et KVB ; la TVM transmet la vitesse limite.
- « En commentaire : cette pédale, tu connaissais ? » — rien à vérifier.

**like** — « Pour celles et ceux qui conduisent, seuls, des centaines de passagers. » — **Tient** (un conducteur en cabine, 393 passagers à Crisenoy).

**abo / boucle** — hors périmètre (batterie du téléphone, dossier 022 : « un film plus fin qu'un cheveu » non vérifié ici ; à voir dans `022-batterie-telephone.md`).

## Ton à l'égard du conducteur décédé

Rien de déplacé : le film ne donne ni cause, ni nom, ni jugement et dit « tombe » comme le BEA-TT ; le like salue même ceux qui conduisent. Seule fausse note possible : « Aucun ne le sait », qui fait de la mort une chute de suspense — la corriger règle aussi ce point. Garder « Verdict : absent » (on parle de la machine, pas de l'homme).

## Corrections proposées

1. **scene** · « Aucun ne le sait. » → « Aucun ne le voit. » (ou « Personne ne leur dit rien. ») · non sourcé que les passagers ignoraient ; « ne le voit » est vrai de la cabine fermée sans prétendre à leur état d'esprit (fiche BEA-TT, A, rien sur les passagers).
2. **eclate** · « Une pédale. Des touches, sous les doigts. » → « Une pédale. Ou des touches, sous les doigts. » · l'organe TGV n'est pas lu ; la SAM §5.1 (A) admet pédales, boutons, touches sensitives et commandes de conduite.
3. **repos** · « Parce qu'un corps effondré… appuie *toujours*. » → « Parce qu'un corps effondré… peut appuyer *encore*. » · source B seulement (Wikipédia FR « Veille automatique », Waterfall 2003) ; « toujours » est contredit par la scène même.
4. **zero** · « Deux secondes et demie. » → « Environ deux secondes et demie. » · SAM S 301 §5.4 : tolérance ±15 %, recommandation générale, pas le réglage TGV. Idem **reponse** : « Deux secondes et demie de plus. » → « Deux secondes et demie de plus, environ. »
5. (optionnel) **repos** · « Près d'une minute sans geste » → « Près d'une minute sans relâcher » · précision : pendant le maintien, le conducteur fait « un geste » (il appuie) ; ce qui manque est le relâchement.

## Ce que `sources` devrait préciser

- Que le 255 km/h est la vitesse au déclenchement, et que le délai entre la chute et le déclenchement n'est pas connu ; le film n'en donne pas.
- Que 55 s / 5 s et 2,5 s / 2,5 s (±15 %) viennent de la recommandation générale SAM S 301 (v2, 13/12/2013), pas du réglage mesuré d'une rame TGV (le rapport conclusif BEA-TT de décembre 2025 n'a pas été lu et peut le donner) ; « environ » dans le film.
- Que « un corps effondré peut rester appuyé » est une source B (Wikipédia, Waterfall), pas une affirmation SNCF / EPSF.
- Que « Ce n'est pas un scénario » concerne l'événement (réel) et que le « tu » est un procédé : la mention actuelle « c'est un scénario posé sur le cas réel » se contredit avec la phrase.
- L'existence du rapport conclusif (remis le 18/12/2025) et des recommandations immédiates du 21/02/2025 (visites d'aptitude), non lus.
- Que « touches » est une possibilité de la SAM, pas une description de la cabine TGV.

## Requêtes utilisées (7 sur 12)

1. WebFetch fiche BEA-TT Crisenoy (PDF) — 403.
2. WebSearch « BEA-TT rapport d'enquête Crisenoy 24 décembre 2024 TGV 6689… » — fiche relue en résumé (B/C), rapport introuvable.
3. WebFetch SAM S 301 (EPSF) — PDF illisible (compressé).
4. WebFetch page BEA-TT « recommandations immédiates » — 403.
5. WebSearch BEA-TT Crisenoy recommandation immédiate 21/02/2025 — recommandation sur les visites d'aptitude ; réponse SNCF d'avril 2025 (« la VACMA s'est déclenché ») ; rapport conclusif transmis le 18/12/2025.
6. WebFetch courrier SNCF de réponse — 403.
7. WebSearch rapport conclusif Crisenoy VACMA — rapport confirmé publié (décembre 2025, 6 recommandations), texte non accessible. WebFetch de sa page — 403 (8e appel).

# L04 — état de la fabrication (pour la reprise)

## 22/10, 4 h 27 — mis en file

Jauge : fenêtre de 5 h à 94 % (remise à zéro 8 h 30), hebdo à 85 % (remise à zéro le 23/10 à 9 h). Consigne de Merwan (relayée par la conversation qui orchestre) : au-dessus de 85 % d'hebdo, le L04 passe après les courts (027 → 030) et le L03 ; il se met en file. **Réveil programmé : 23/10 à 9 h 05.**

### Fait
- **Durée tranchée** : cueillette retirée (clé `retires` dans `episode.json`, remise en une ligne), Forrestal gardé.
- **Voix** (oui « 6700 » de Merwan, donné directement) : une prise turbo, 11 requêtes, **2 935 crédits facturés** pour 6 672 annoncés, plus 71 pour deux reprises de « on l'ouvre » (montée : reprise 1, 1,22 s). Film : **628,1 s (10 min 28)**. Écoute envoyée : `audio/essais/L04-voix-complete.mp3`. Solde après : ≈ 107 800.
- **Architecte** (1 agent, 570 k jetons, 42 min) : `src/plan.js`, `src/world.js`, trois bouchons de décors (`navire.js`, `model.js`, `bord.js`), six chapitres vides (`c1-ouverture` 0 → 103,37 · `c2-lancement` → 204,74 · `c3-reacteur-stabilite` → 320,95 · `c4-feu-nuit` → 414,15 · `c5-miroir-brins` → 525,53 · `c6-appontage-fin` → 628,8), `index.html`, 90 repères ; `docs/L04-decors.md`, `docs/L04-actes.md`, `docs/journal/L04-architecte.md`. `check` passe.

**Consigne de Merwan (22/10, 4 h 30) : « reprends une fois le L03 fini ».** Au réveil, vérifier d'abord que `renders/L03-evacuation-avion.mp4` existe et que la session ep-l03 ne travaille plus ; sinon, nouveau réveil dans ≈ 2 h.

**23/10, 9 h 05** : L03 pas fini (seul le brouillon existe ; sa conversation se réveille à 9 h 07 pour ses reprises et son rendu final). Rien lancé. Nouveau réveil : 23/10 à 11 h 07.

**23/10, 11 h 07** : L03 FINI (rendu 9 h 52). Jauge : fenêtre 20 %, hebdo 3 %. **Trois décors lancés** : navire.js (a6d5a3484dae7c056), model.js (a7c10aec5153713a5), bord.js (adf88c2b6e26432c5) — journaux `docs/journal/L04-<décor>.md`. Si la session s'arrête : les reprendre par SendMessage (« La limite est levée : reprends là où tu t'es arrêté »).

**23/10, 11 h 45** : trois décors FINIS (bord 0,48 M, navire 0,47 M, model 0,44 M ; `check` passe). Fenêtre 42 %, hebdo 6 %. Lancés : intégration + planche de six premières images par l'architecte (a2c6fabb25c7d3529, SendMessage) ; décorateur (a653a342d3c5d295e, `src/habillage.js`, ses lignes d'accroche dans `docs/journal/L04-habillage.md` → « À poser », à poser APRÈS l'intégration). Ensuite : choisir la première image, puis chapitres c1-c3, puis c4-c6.

**23/10, 11 h 55** : intégration FAITE (architecte, 0,65 M). Première image choisie : `POSE0` = `hook3` (derrière la queue, cœurs blancs), collée dans world.js, `check` passe. Fenêtre 49 %. Lancés : c1 (acc6bba9d23ecceac), c2 (ae77e2c91f81ac450) ; décorateur toujours en cours. Suivant : c3 quand un agent rend, puis c4-c6 (après la remise à zéro de 14 h si la fenêtre passe 85 %), puis lignes « À poser » du décorateur.

**23/10, 12 h 20** : décorateur FINI (0,43 M) ; ses quatre lignes posées dans world.js, `check` passe. c3 lancé (a72077079d3fe0548). En cours : c1, c2, c3. Suivant : c4, c5, c6.

**23/10, 12 h 20** : c2 FINI (0,42 M, 60 images ; crans : 161,9 miniature 1 petite ?, 180,7-185,3 cockpit, 110,6/122,8 noir, 185,3-188,6 fond noir ; risques qa : 131,4, 173,5, 142,1, 161,25). c4 lancé (a0ebc1975551722e0). Fenêtre 63 %. En cours : c1, c3, c4. Restent : c5, c6 (après la remise à zéro de 14 h).

**23/10, 12 h 25** : c1 FINI (0,42 M ; crans 11,4-17,5 nuit en traits, 18-23 casque absent, 28,5-29,5 cylindre près de l'objectif, 40,5 / 67,5 / 95-97 non revus). Ses sons ajoutés à `sfx` (5 clicks de l'éclaté, 2 swish, 2 hit) — à vérifier au `qa` (sons sur un mot). Piège : repère `bravo` = nom du beat → utiliser `bravo:pour`. c5 lancé (a9d58840cc11860d4). En cours : c3, c4, c5. Reste c6 (après 14 h).

**23/10, 12 h 35** : c3 FINI (0,43 M ; crans 241,3 non revu — bande claire de verre ; 224 coque en traits ; 272,5 sombre ; 275 hangar chargé ; 216 cabine ; 288 boîte de verre = cabine devant la coupe → la cacher quand `cutaway` > 0,5 ; `VIEW.fins` à reposer : `{ tx:-1400, ty:-2300, tz:-3500, d:2300, az:-60, el:-6, fov:32, ...CLOSE }` ; le chien qui disparaît à la couture c34). Sons ajoutés (boom penche, click masses). Fenêtre 71 % : c6 attend la remise à zéro de 14 h (réveil 14 h 03). En cours : c4, c5.

**c4 FINI** (0,39 M ; couture c34 vérifiée : night 0,45 / swell 0,3 cohérents ; crans 324,5-325,6 vide, 363-368 ascenseur chargé, 349,2 roquette petite, 393,8 vue de côté, 411 casque ; qa à juger : 331,9-333,3, 337,5-339,6, 381,24-382,74). En cours : c5. c6 à 14 h 03.

**12 h 55** : c5 FINI (0,42 M). `HAND.c56.at` corrigé en `"bolter:au-0.2"` (le repère `bolter` masquait le beat). c6 LANCÉ (a278b1203f1bcce85). Relecture planche A (0 → 524 s, pas 18,7 s, `scratchpad/L04/relecture-a.jpg`) — plans faibles à joindre aux reprises APRÈS le `qa` du brouillon (une seule reprise par agent) : c1 19,2 (chien jaune seul, cadre vide) ; c2 187,5 (« Tu voles » : avion minuscule dans le noir) ; c4/c5 411,9 (cockpit : casque énorme en bas à gauche) ; c5 449,3 (officiers sombres, noir), 468 (laser = un point), 505,4 (câble seul sur le noir). Agents : c1 acc6bba9d23ecceac, c2 ae77e2c91f81ac450, c3 a72077079d3fe0548, c4 a0ebc1975551722e0, c5 a9d58840cc11860d4.

**13 h 35 — BROUILLON** `renders/L04-porte-avions-draft.mp4` (rendu 12 min) ; `qa` (journal : `scratchpad/L04/qa-draft.log`) : **voix calée 0 ms, −14,05 LUFS, crête −1,64 dBTP, AUCUNE image parasite**, boucle exacte (c6). Trois sons tombés sur un mot retirés de `sfx` (swish 7,21, hit 17,91, click 567,9). c6 FINI (0,51 M, a278b1203f1bcce85). Fenêtre 81 % → reprises à 14 h 03.
**REPRISES À ENVOYER (SendMessage, une par agent, trois à la fois, courtes et précises)** :
- c1 (acc6bba9d23ecceac) : heurtés 2,7 · 28,4 · 39,2 ; plan de 16 s 7,2 → 23 dont 4 s immobiles 18 → 23 ; plan de 20 s 74,6 → 94,6 ; immobile 88 → 93 ; plan de 15 s 95,7 → 110,7 (couture c12, avec c2) ; 19,2 chien jaune seul dans un cadre vide ; carte « Comment marche la catapulte » posée sur les mots (souffle 0,6 s).
- c2 (ae77e2c91f81ac450) : heurté 161,6 ; 187,5 « Tu voles » avion minuscule dans le noir ; couture 95,7 → 110,7 avec c1.
- c3 (a72077079d3fe0548) : heurté 272,7 ; immobile 233 → 237,5.
- c4 (a0ebc1975551722e0) : PLAN DE 46 s 323,8 → 370 (seulement deux vues pour tout le Forrestal) et de 39 s 369,9 → 409 ; immobiles 391,5 → 395,5, 399 → 408.
- c5 (a9d58840cc11860d4) : heurté 493,8 ; plans 416,9 → 432 (15 s), 503,7 → 523,7 (20 s) ; immobiles 446 → 451, 457,5 → 461,5, 476,5 → 482, 499 → 503 ; cadres faibles 411,9 (casque), 449,3, 468 (laser = un point), 505,4 (câble seul).
- c6 (a278b1203f1bcce85) : plan de 20 s 580,3 → 600 ; immobiles 532 → 537, 618,5 → 622,5 ; cockpit où l'arceau domine.
Règle pour toutes : un changement de vue toutes les 5 à 10 s, jamais 4 s immobile, aucune nouvelle image parasite (mêmes règles anti-scintillement), `check` passe, 12 images au plus. Puis rendu final, `qa`, `srt`, miniatures.

### Étape suivante (au réveil)
1. `get_usage` : si l'hebdo est remis à zéro et que les courts/L03 ne sont pas en train de tout prendre, continuer.
2. **Décors, trois agents en parallèle** (un par fichier : `navire.js`, `model.js`, `bord.js`), consignes dans `docs/L04-decors.md`, journaux `docs/journal/L04-<décor>.md`. Réutiliser les outils du 015 (`carrier.js`, `rafale.js`, `model.js`), pas un gabarit.
3. Reprise de l'architecte (identifiant `a2c6fabb25c7d3529`, par SendMessage, s'il répond encore ; sinon un agent neuf avec ses docs) : appliquer les « À changer ailleurs », reposer les poses de `VIEW`/`HAND` sur les vrais décors, planche de six candidates de la première image (`hook1` profil bas du Rafale, `hook2` train avant, `hook3` derrière la queue).
4. Décorateur (1 agent, `docs/recette-decorateur.md`).
5. Première image choisie par celui qui orchestre, puis six chapitres en deux vagues de trois.
6. Deux planches de 28, reprises par SendMessage, brouillon + `qa` (zéro image parasite), rendu, `qa`, `npm run srt -- L04`, trois miniatures (`cover`, `--alt 2`, `--alt 3`).

### Fragile (relevé par l'architecte)
Gilet du chien jaune dessiné en veille (trois couleurs) : à juger ; ralentis du catapultage et de l'appontage ; c3 et c5 un peu au-dessus de 110 s ; ≈ dix Rafale à l'écran (une version allégée pour les autres) ; pas de barricade (Andromède = le troisième brin).

**14 h 05** : reprises envoyées à c4, c5, c1 (vague 1). Ensuite c2, c3, c6.

**14 h 35** : les six reprises RENDUES (c1 0,46 M, c2 0,43, c3 0,46, c4 0,46, c5 0,46, c6 0,53 — une reprise relit tout le contexte de l'agent). Cabine cachée dans le plan en coupe (world.js, après model.set). Second brouillon en cours, puis qa, rendu final, srt, miniatures (thumb/thumb2/thumb3 déjà réglés aux instants plein:tient, casse:casse, attrape:andromède).

**14 h 55 — second brouillon** : qa AUCUNE image parasite, voix 0 ms, aucun son sur un mot, un changement de vue toutes les 4,4 s ; heurtés max 24 (7,3 · 28,1 · 2,7 · 132,5 · 523,6 · 203,1). Dernières retouches envoyées : c1 (heurtés 2,7/7,3/28,1), c5 (plan 498,8 19 s, couture 525, immobiles 446-451 et 457,5-461,5, heurté 523,6), c6 (580-600, fin 614-628,8, immobile 532-536). Puis rendu final.

## FINI — 23/10 ≈ 15 h
`renders/L04-porte-avions.mp4` (10 min 28) : `check` passe, boucle exacte ; `qa` : voix calée 0 ms (22 clips), −14,05 LUFS, crête vraie −1,78 dBTP, **AUCUNE image parasite**, aucune plage immobile, aucun son sur un mot, un seul plan > 12 s (l'écran de fin, voulu), première demi-seconde 7,1. Mouvements les plus vifs : 2,7 s (24,2, la poussée de l'ouverture), 132,5, 203,1, 493,1, 231,8, 578,0 (21 à 23 ; moyenne 3,3).
Sous-titres et chapitres : `renders/L04-porte-avions.srt` (+ description). Miniatures : `-miniature.png` (IL NE BOUGE PAS, la tuyère à pleine poussée), `-miniature-2.png` (FAITE POUR CASSER, la pièce calibrée sur l'établi). La troisième (REVENIR DE NUIT) est retirée : le Rafale de verre la nuit ne se lit pas à 160 px (quatre essais) — le test tourne à deux. Coupures pub à poser dans YouTube Studio : 2:21,8 · 4:21,6 · 6:20,9 · 8:56,7.
Coût : 12 agents ≈ 5,5 M + 9 reprises par SendMessage ≈ 4,3 M (chaque reprise relit tout le contexte de l'agent : ≈ 0,45 M) ; hebdo 3 → 14 %. Voix 3 006 crédits.
Un cran en dessous : la carte « Comment marche la catapulte » arrive sur la fin de la phrase d'avant (souffle 0,6 s) ; les plans cockpit de nuit ; Pedro simplifié ; quelques plans de nuit faits de traits fins.

**23/10 — 3e miniature** : `-miniature-3.png` « SOUS TES ROUES » (la catapulte éclatée sous le pont ; promesse « ce qui va la briser… se cache juste sous tes roues », 0:25). Le test tourne à trois.

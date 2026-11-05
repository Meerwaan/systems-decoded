# CR01 Tchernobyl — état du chef de production

Mission (04/11) : de l'architecte au POINT DE CONTRÔLE (DA « reconstitution » construite dans le kit + première image choisie sur planche de 4 + planche look de 6-8 instants), puis rendre la main ; Merwan valide la DA avant les actes. Voix faite (150,6 s, 19 beats) : n'y pas toucher. Pas de commit.

## Fait
- 22 h 35 : lectures (chaîne, recette CR, script, contre-vérif). Jauge 50 % fenêtre (RAZ 03 h 10), hebdo 49 %.

## Plan
1. Vague 1 : agent DA (kit/lib/reconstitution.js, bloc CSS [data-serie="compte-a-rebours"], en-tête CR dans CR01 index.html/main.js, docs/reconstitution.md).
2. Vague 2 : architecte (contrat CR01, sur la DA).
3. Vague 3 : décors (cœur RBMK + barres ; dalle ; t1 turbine/pompes/diesels ; salle de commande) ≤ 4.
4. Intégration, planche de 4 candidates, image0 pleine résolution, planche look 6-8 instants → rendre la main.

## Agents
- 23 h 52 : agent DA (a91cc873e9374ae90) rendu, 246 k, 59 outils, 17 min. kit/lib/reconstitution.js, bloc CSS CR, en-tête CR dans CR01, docs/reconstitution.md, journal docs/journal/CR01-da.md. Planche .cache/planches/CR01/da/avant-apres.jpg jugée bonne (argile + rouge + horloge ambre lisibles). Jauge 58 % / 50 %.
- 23 h 55 : vague 2, architecte lancé.
- 00 h 20 : architecte (a31f4b71a160d88f0) rendu, 352 k, 50 outils, 24 min. 4 décors (canal, coeur, centrale, salle), 5 actes (acte1, acte2, acte2b, acte3, fin). Candidates image 0 dans docs/CR01-actes.md § « La première image » (recommande a). Rien à appliquer de ses « À changer ailleurs » (kit / recette : à signaler à la conversation principale).
- 00 h 21 : jauge 64 % → vague 3 = canal, coeur, salle (centrale après, la jauge ne permet pas 4).
- 00 h 45 : décors rendus — canal (af531d82c492f9417) 291 k/31 outils/20 min ; coeur (a8bcedf57981205a6) 276 k/42/18 min, 40 images (budget dépassé) ; salle (af85706131b7ab7a9) 220 k/21/10 min. « À changer ailleurs » appliqués (plan.js RODS 9 + crew ; world.js 7 poses). check passe.
- 00 h 50 : image 0 = (a) contre-plongée sous le cœur, 4,5/6 (planche .cache/planches/CR01/image0.jpg ; pleine résolution .cache/planches/CR01/image0-pleine/frame-00-at-0.04s.png). POSE0 déjà = VIEW.coeurLow. Planche de 8 instants : .cache/planches/CR01/instants.jpg (essais instants.json). docs/CR01-actes-maj.md écrit.
- POINT DE CONTRÔLE : main rendue, attente de la validation de la DA par Merwan.
## Reste
1. Décor `centrale.js` (agent decor) ; 2. actes × 5 (acte1, acte2, acte2b, acte3, fin) en deux vagues (4 + 1) ; 3. relecture 4 planches, check, brouillon, qa ; 4. retouches ; 5. rendu, qa, cover, phone, posts.mjs (CR01 à ajouter à posts.mjs ?).
- Jauge au point de contrôle : 74 % fenêtre (RAZ 03 h 10), hebdo 53 %. Suite : centrale + 3 actes passent seulement après la RAZ (74 + 4×9×0,5 > 85).

## Reprise 05/11 04 h 25 (DA V3 validée « Go ») — fabrication jusqu'au film
- Jauge 2 % / 54 % (RAZ 08 h 30). Image 0 recadrée : VIEW.coeurLow d 275, side 160 (planche .cache/planches/CR01/image0-v3/planche.jpg, c). docs/CR01-actes-maj.md mis à jour (V3, exigences de Merwan).
- Vague 1 : decor centrale + acte acte3 + acte fin. Vague 2 : acte1, acte2, acte2b (dépendent de la centrale).
- 05 h 05 : vague 1 rendue — centrale (a74de0da2f0e6465d) 272 k/31/18 min ; acte3 (a838d7e222f41af0a) 268 k/53/14 min ; fin (a4a056573088534b8) 246 k/37/10 min. Appliqués : 7 poses CENTRALE (+ turbineClose) dans world.js ; ligne feutre-defaut retirée de main.js ; #chip-12s « 18 → 12 secondes » ; reconstitution.js paint() garde `h < 0.5` (CR seul). check CR01 passe.
- Pour la conversation principale : episode.json `comment` text écrit `*machine*` (rouge dans le sous-titre pendant le duel) — non touché (episode.json gelé).
- 05 h 06 : jauge 10 % / 55 %. Vague 2 : acte1, acte2, acte2b.
- 05 h 20 : vague 2 rendue — acte1 (aed45d8a9bafec67c) 255 k/35/12 min ; acte2 (abd315bd7579fba0b) 254 k/37/11 min ; acte2b (a019a912b47a3571a) 242 k/35/10 min. Appliqués : canal.js vapeur rouge sur `viol` ; centrale.js A.fault ancré sur la vanne ; coeur.js lowMat `noOk` (kit/lib/reconstitution.js : option `noOk` d'alarm(), CR seul).
- Relecture : 5 planches .cache/planches/CR01/relecture/p1-5.jpg. Faibles : acte1 18,5–24,5 (absorbant vert peu visible, « l'eau aussi avale » sans démonstration) ; acte2b 73,5–77,6 (vapeur/puissance faibles) ; fin 133–140 (salle voilée de gris). Suite : check, brouillon, qa.
- 05 h 40 : brouillon + qa : voix calée, −14,03 LUFS ; ✗ 2 parasites 38,47 / 38,67 ; heurtés 85,4 · 83,4 · 88,3 · 11,6 · 91,8 · 28,3 ; 1re demi-seconde mouvement 0,1, plages lentes 0–3, 8–10,5, 13–15,5. Sons sur un mot (5) déplacés par moi dans les souffles (episode.json sfx seulement ; copie avant : scratchpad episode.avant-sfx.json). canal.js dispMat noOk.
- Vague retouches : acte1, acte2, acte2b, fin (retoucheur) ; acte3 ensuite. Jauge 18 % / 56 %.
- 06 h 05 : retouches rendues — acte1 (a0c0fed7fdbfecf80) 169 k ; acte2 (af807539f5671e0b0) 168 k ; acte2b (a2fa8ad260fc039bb) 155 k ; fin (adbdcc40226b043e5) 148 k ; acte3 (a2cf57d345d758611) 155 k. canal.js PUFF 0,7 + bouffées 4,5+4·pa. Brouillon 2 + qa en cours.
- 06 h 35 : brouillon 2 + qa : ✓ aucune image parasite, voix calée, −14,04 LUFS ; heurtés max 12,5 (93,3 · 91,6 · 71,9 · 59,0) ; swish sur « Pour » retiré de sfx. Retouche 2 acte1 (aa0406c176698f527, 169 k/28/16 min) : 1re demi-seconde 0,5 → 2,2, plus de plage lente avant 25 s ; heurté 15,9 (12,1) ouvert. check CR01 passe ; check 036 identique (0 err, 2+1 avert., 69/69).
- DÉFAUT OUVERT : image 0 ≠ dernière image (la poussée de acte1 `shot(0, t.choc, …glide(2.6,1))` bouge la caméra dès t = 0 ; 150,58 = POSE0). SendMessage envoyé à aa0406c176698f527 (fix ≤ 3 appels) — réponse NON reçue au moment du rendu de main.
## Reste
1. Vérifier le fix boucle (look --at 0.0,150.58) ; 2. render final, qa ; 3. cover -- CR01 ; phone ; posts.mjs (entrée CR01 à ajouter si absente) ; chrono rendu + jauge.
- 06 h 45 : défaut de boucle CORRIGÉ par aa0406c176698f527 (acte1 l. 52 : la poussée part de 0,02 s ; planche .cache/planches/CR01/acte1-retouche2/boucle.jpg : 0,0 = 150,58). Pas de brouillon relancé (la 1re demi-seconde peut baisser un peu sous 2,2). Reste : render final, qa, cover, phone, posts.mjs, chrono.
- 06 h 50 : rendu final 1 : qa ✗ 1 parasite 38,47 (aubes de la turbine, 13°/image pour 15° d'espacement) → W0 7 → 5,5 dans centrale.js ; re-rendu. Boucle vérifiée sur le MP4 (image 0 = dernière).
- 07 h 05 : W0 5,5 → 6 parasites 71,1–71,8 (même stroboscope) → W0 3,5 (< 7,5°/image à toute vitesse) ; re-rendu.
- 07 h 25 : vraie cause des parasites = angle de la turbine time × W0 × spin pendant les rampes (le rendu « seek » chaque image). Corrigé : état rotorT (FIRST −1 dans world.js), centrale.js le lit, acte2 et acte2b le tweenent avec ramp() ; W0 revenu à 7. check passe. Re-rendu final.
- 07 h 40 : FINI. Rendu final renders/CR01-tchernobyl.mp4 : qa ✓ aucune parasite, voix calée, −14,04 LUFS, aucun son sur un mot ; boucle vérifiée sur le MP4. Brouillon déplacé dans .cache/brouillons/. Couverture (horloge en ambre : option `lastTone` ajoutée à scripts/cover.mjs, episode.json cover.lastTone), copie iphone, posts.mjs (entrée CR01 ajoutée). Images finales : .cache/planches/CR01/final/. Jauge 30 % / 57 %.

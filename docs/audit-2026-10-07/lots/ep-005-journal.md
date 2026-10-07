# Journal — lot ep-005

## voix/V2 — hold resserrés (fait)
- episode.json : eclate 0,3 → 0,1 ; repos 0,3 → 0,15 ; zero 0,3 → 0,1 ; deux 0,6 → 0,4 ; hache 0,4 → 0,2 ; comment 0,6 → 0,25. ouvre, lache, mille, chute et tail inchangés (ils servent l'image / la boucle).
- Film 84,8 → 83,5 s (−1,3 s). Aucun mot touché.
- Vérif : `node scripts/sd.mjs script 005` → « 83.5s · 230 mots affichés · timing voix réelle ».

## 1 · accroches/ACC-01 (A1, A2, CRIT-03) — accroche en mouvement (fait, sauf la coque)
- main.js (bloc « A — ») : shot(0, …, { d: 4700, az: 44, el: 44, shift: 200 }, "sine.out") au lieu de { az: 23 } ; B : { d: 5200, az: 40, side: -165 } puis { d: 5100, az: 37 } (un seul sens d'arc jusqu'à CROWN az 34). Rebouclage : la coupe toHook arrive par { d+100, az−4, el−4, shift−14 } en "none" (même sens et même vitesse que le départ de l'accroche). POSE0 et FIRST inchangés.
- Coque shell 1 → 0,45 sur « Panne » : essayée, ne se lit pas à 270 px (h1.jpg, 0,04 / 0,5 / 1,0 s) → retirée, reactor.js revenu à l'identique. feed, couronne, étiquette intacts jusqu'à 9,24 s.
- Vérif : h1.jpg (270 px) : la cuve monte et s'ouvre dès 0,5 s ; à 4,4 s couronne y ≈ 432, fond de cuve ≈ 1160, combustible au-dessus de la carte. Pourquoi el 44 : à el 30 la cuve fait déjà 810 px de haut, toute avancée la met sous l'en-tête ou sous la carte (e1.jpg, e2.jpg).

## 2 · critique/CRIT-04 — « RÉACTION 100 % » dès l'image 0 (fait)
- index.html : #hud-clock = <span id="hud-clock-l">Réaction</span><span id="hud-clock-v">100 %</span> + style #hud-clock-l (24 px mono, signal). main.js (onProject) : hudClock = #hud-clock-v, le libellé est masqué dès t.zero (il descend alors sur le compteur « Réaction » existant).
- Vérif : b1.jpg, images 0,04 / 33,0 / 35,4 s : « RÉACTION 100 % » ; 36,2 s : « T+0,0 s » + compteur « RÉACTION 100 % » dessous.

## 3 · image-005-04 + enchainements/E2 — « Zéro. Le courant tombe » (fait)
- main.js (bloc T+0,0) : gPower et field décroissent ensemble de t.zero à t.lacheMot − 0,05 (ease `decay`, exponentielle : 93 % à 36,2 s, 61 % à 36,7, 25 % à 37,8), passent sous 18 % à `lets` ≈ 38,2 s où la jauge vire au signal et le statut bascule ; jauge masquée à t.lacheMot + 0,2 (au lieu de t.lache − 0,25) ; poussée lente shot(t.zero + 0,05, …, { d: 138, az: -2 }). model.js pose() : bande éteinte = encre 9 % (plus de vert sombre).
- Le coup sur « Zéro » reste : secousse, chrono, passage au signal.
- Vérif : z1.jpg (36,2 → 39,0 s) : jauge 93/61/37/25/19 puis 17 % orange, 0 % ; le champ s'éteint avec elle ; cadre qui se resserre sans arrêt ; bandes grises une fois mortes.

## 4 · enchainements/E3 (+ image-005-01 réduit par CRIT-10) — la barre tombe à l'heure, la poussée avancée (fait)
- main.js : drop 34 en "power1.in" dès t.barreTombe − 0,12 (au lieu de 30 en power2.in à −0,05). Pas 55 : la tige (54 cm) sortirait entièrement du mécanisme. Après la coupe : shot(toFall, …, { ty: 0, d: 3200, az: -18, el: 18, shift: 210 }) au lieu de d 4400 ; #chip-count en place fixe (96, 470). Le gros plan existant (d 2300) inchangé.
- Vérif : f1.jpg : 41,2 s la tige a bougé, 41,45 son bout entre dans le cadre, 41,68 elle quitte les cliquets ; 42,6 → 44,2 la cuve grossit pendant que le vert descend, bas du combustible ≈ 1230 (au-dessus des sous-titres).

## 5 · enchainements/E1 + image-005-09 — la chute monte vers la couronne éteinte (fait)
- main.js : ASIDE d 4400 / shift 110 / side −165 (au lieu de d 5400) ; dérive { az: 28, el: 30 } jusqu'à toCrown = t.depense2 − 0,15 ; #retitle sort à t.depense2 + 0,15 ; shot(toCrown, 1.5, CROWN) (le cadre de « c'est la panne ») puis dérive { d: 2400, az: 30 } ; #chip-feed-off « Bobines · hors tension » de t.empecher − 0,2 à toChicago − 0,15. Couronne jamais rallumée (power 0), feed 0.
- index.html : #retitle-main 108 px (120) pour que « Du courant » ne morde plus sur la couronne. reactor.js update() : bobines mortes = encre × 0,3 (0,12) pour qu'elles restent des objets.
- Vérif : f1.jpg + g1.jpg : 51,9 titre à gauche, cuve à droite (bord droit ≈ 909 px au niveau de la bride, combustible ≈ 860) ; 54,9 montée ; 55,6 / 56,7 couronne sombre + étiquette, un seul panneau en zone haute.

## 6 · image-005-03 — « il serre les cliquets » (fait)
- model.js : l'anneau de maintien est une pièce à part (`ring`, matières m2b) ; main.js : état ringA (FIRST, coupe CTA), setPartOpacity(grip.parts.ring, S.ringA), verre (0,18) de t.tant − 0,3 à t.lacheMot − 0,3 ; HOLD { ty: 33, d: 125, az: 3, shift: -120 } ; « en l'air » : recul { ty: 24, d: 205, az: -8, el: 6, shift: 40 } ; puis resserrement { ty: 31, d: 140, az: -2, el: 5, shift: -60 }.
- index.html : #top-fade (dégradé noir 0 → 560 px, sous le HUD) allumé de t.repos − 0,1 à toFall : la tige se fond au noir avant l'en-tête.
- Vérif : g1.jpg 33,9 s : dents allumées visibles dans l'encoche à travers l'anneau ; c1.jpg 35,8 s : bout libre de la tige au-dessus du socle ; tige absente de l'en-tête sur toutes les images 32 → 41 s.

## 7 · image-005-06 + enchainements/E6 — Chicago (fait)
- pile.js : verre de la pile base 0,004 / rim 0,085 (0,002 / 0,045), arêtes 0,22 ; cœur signal en dégradé (softGlow, r 215, 1,4 × heart) ; puits sous la barre ; barre de secours veille, 22 cm ; fer de hache en forme (ExtrudeGeometry) ; update() reçoit `heart`.
- main.js : coupe d 5600 → poussée d 4700 (au lieu de 7000 → 6600) ; shot(t.secours − 0,3, 1.9, { tx: PX+270, ty: 760, d: 3300 }) ; dérive le long de la corde ; shot(t.corde + 0,15, 1.35, homme d 1150) ; heart 1 → 0,15 quand la pile passe sous les sous-titres ; #top-fade sur le plan de l'homme. index.html : #chip-1942 fond opaque.
- Vérif : c1.jpg, c2.jpg : pile en volume avec son cœur, barre verte lisible à 300 px, homme à x ≈ 875 (hors boutons) à 61,3 s, 590 px de haut à 63,9 s, fer de hache triangulaire.

## 8 · recit/R02 + emballage/E1 — post (fait)
- episode.json → post.caption : « Tu imaginais un gros bouton rouge ? Un réacteur nucléaire n'en a pas besoin pour s'arrêter. Et une fois arrêté, il chauffe encore combien de temps, à ton avis ? » ; post.pinned : 144 caractères (texte de l'audit emballage).
- Vérif : compte node (144 / 160), `script 005` → « timing voix réelle ».

## Contrôle
- `check 005` : échouait (contraste « 03 Réponse » à 4,64 s : couronne allumée derrière l'en-tête) → fin du mouvement d'accroche ramenée à { d: 4720, shift: 165 } → « Check passed » (2 avertissements de contraste à 23,19 s, un seul instant chacun).
- `render 005 --draft` → renders/005-arret-urgence-draft.mp4 (83,5 s, −14,09 LUFS). `qa 005 --file …-draft.mp4` : voix calée (écart max 0 ms), « aucune image parasite », mouvements les plus heurtés 22,5 s (27,1, vol vers la bobine, non touché) · 16,8 · 34,9 (15,3, le recul « en l'air ») · 10,6 · 31,5 · 29,3.
- Planche finale : final.jpg (16 instants). Choses pour les autres lots : pour-les-autres.md. LOT TERMINÉ.

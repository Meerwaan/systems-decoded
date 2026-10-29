# L03 — journal de celui qui orchestre (22/10)

Go de Merwan pour toute la chaîne (« fais attention aux erreurs de son et aux images qui scintillent ») ; file d'attente autorisée sur les limites (fenêtre > 90 % ou hebdo > 95 % : réveil programmé, reprise seule ; au-dessus de 85 %, les courts 027-030 passent avant).

## Fait
- Architecte (agent a19d6a00ea01b4c3b, 499 k, 31 min) : `plan.js`, `world.js`, `main.js`, `chapters.js`, bouchons, six chapitres bouchons, `docs/L03-decors.md`, `docs/L03-actes.md`, `check` passe. Six groupes : c1 0→49,84 · c2 →161,59 · c3 →272,06 · c4 →361,82 · c5 →435,05 · c6 →534,27.
- Jauge après l'architecte : fenêtre 56 %, hebdo 80 %.

## En cours
- Décors lancés ensemble : `avion.js` (aa03c4aedc65fba0f), `cabine.js` (a3487bb569d436fa5), `model.js` (a60af8c2fe9a21435).

- 22/10 vers 8 h 30 : les trois décors se sont arrêtés sur la limite de la fenêtre de 5 h, à mi-travail (avion : première planche faite, retouches en cours ; cabine et model : avant le premier build). Leur travail est sur le disque ; on les REPREND par SendMessage, jamais un agent neuf.
- Consigne de Merwan (22/10, 15 h 40) : « Reprend après le 27 ». Hebdo à 93 %. Contrôle toutes les 30 min (réveil récurrent) : 027 fini et hebdo < 95 % → reprise ; sinon reprise au réveil du 23/10 à 9 h 07.

- 22/10 vers 15 h 55 : 027 rendu (renders/027-voie-de-detresse.mp4, 15 h 46), hebdo 93 %, fenêtre 4 % → les trois décors repris par SendMessage. Réveil récurrent supprimé ; le réveil du 23/10 à 9 h 07 reste en filet (s'ils sont déjà repris, il passe à l'étape suivante).

- Décors finis (avion 449 k · cabine 499 k · model 439 k). Intégration par l'architecte (+62 k) : check passe ; planche des candidates `scratchpad/L03/candidates.jpg`.
- PREMIÈRE IMAGE CHOISIE : C3 `hook2` (l'A350 en feu au ras de la piste, le toboggan 1L qui se déroule), recadrée plus bas, nez et feu dans les 60 % de gauche ; coupe dans la cabine (C5) sur « La fumée descend » avant 3 s. c1 fixe POSE0/FIRST.
- Vague 1 lancée (hebdo 94 %) : décorateur (a2443af0651c7b778), c1 (ab8b55c527a7a3f90), c2 (a2a0e4537c447dc4a).
- Vague 2 à lancer quand ils rendent : c3 (a380-manchester), c4 (balisage-siege), c5 (tokyo) ; puis c6 (pourquoi-fin) — dire à c6 de lire POSE0/FIRST fixés par c1.

- 22/10 ≈ 16 h 25 : c2 FINI (341 k ; check passe ; rend à c3 : FOOT_A à 160,4, recul lent du pied du toboggan 1L, puis `seam(D,"c23","out")` vers FOOT_B ; hangar, doorA 1, shut 1, evac 0,16, hurt 1, chronoOn 0). Ses crans en dessous : 49,8-56 levier sans main ; 61,5 et 80,4 recadrés pas revus ; 153,1 « Ceintures bouclées » sans geste (manque un nombre `belts` dans cabine.js + FIRST) ; 157,0 evac avancé pas revu.
- RÉGLÉ (23/10) : l'avertissement « NaN » est celui du compilateur D3D sur le filtre anti-NaN du kit (`kit/lib/stage.js:63`, `isnan`) — bénin, commun à tous les films, aucun NaN réel. « Canvas au bord, en haut » = du dessin 3D qui touche le haut du cadre : avertissement de mise en page, à juger à la relecture.
- (ancien) ⚠ `check` signale « NaN dans un shader » (page entière, pas c2) : à trouver avant le brouillon (risque de dalle noire au bloom = image parasite).
- HEBDO 95 % → plus aucun lancement. Décorateur et c1 tournent encore (s'ils s'arrêtent sur la limite : les reprendre par SendMessage). Réveil le 23/10 à 9 h 07.

- c1 FINI (check passe). POSE0 = `{ tx:-2700, ty:420, tz:300, d:2300, az:-68, el:-10, fov:36, shift:0, side:200, roll:0, drift:0.3, ...SHARP }` ; FIRST = AT.haneda + `{ doorA:0.52, shut:1, smoke:0.8, fire:0.7, fx:-2700, fy:300, fz:300, fs:1800 }`, set PISTE (floor, signs, crowd, pa à 0). **Pour c6** : à la fin, revenir à cet état ; au début du film `doorA` 0,52→0,86 en 1,5 s et `fire`→1 sur « brûle ». Coupe à 1,6 s sur `thumbSmoke` (miniature 2). Crans en dessous : 3,5 s haut-parleur (fumée 0,35 au lieu de 0,85) ; 44,9-47,2 « le vide » (sol illisible, porte vers l'en-tête) ; 1,6-3,5 dossiers de verre au premier plan ; 5,1-9,2 avion mince, portes signal petites. Avertissement « canvas au bord, en haut » (29,68 → 504,59 s) à regarder.

- Décorateur FINI (habillage.js, aucune accroche dans les décors). À vérifier par le chapitre qui la monte : `VIEW.approach` (alt 6 000) cadrait la piste sans l'avion. Avant/après : `SD_KIT='{"nodress":1}' npm run look`.
- Le 22/10 au soir, plus aucun agent ne tourne : tout attend le réveil du 23/10 9 h 07 (étape 1 de la reprise déjà faite : décorateur et c1 ont rendu).

- 23/10 ≈ 2 h 45, sur le « Go » de Merwan (hebdo 96 %) : c3 (a1bcebe571faf754f), c4 (a5bcbff0df38ff90b), c5 (a993f78a5ad209e1b) LANCÉS. À 9 h 07 : ceux qui n'ont pas rendu → SendMessage « La limite est levée : reprends… » ; puis c6.

- c4 FINI (349 k, check passe ; rend à c5 sur HAND.c45 → APP_B ; crans : « 1984 » non affiché, la ligne s'allume d'un coup, tête du mannequin près de l'en-tête vers 336,9 s, traîneau 35 % de la largeur). c6 LANCÉ (ac7a6a63bd06f6fd4), hebdo 97 %.
- Merwan (23/10, nuit) : « l'A380 c'est un avion à deux étages, les détails sont importants » → transmis à c3 ; à vérifier sur la planche de relecture (deux ponts, 16 portes, toboggans du pont supérieur plus hauts, quatre moteurs).
- c3 FINI (check passe ; A380 : trois quarts avant aux deux ponts et quatre moteurs, toboggans du pont supérieur plus hauts). LISTE DES RETOUCHES DE DÉCORS après la relecture : (a) `avion.js` — au hangar, les portes condamnées de l'A380 en SIGNAL (aujourd'hui encre sombre barrée, illisibles) [agent avion aa03c4aedc65fba0f] ; (b) `cabine.js` — dossiers du passage du 737 plus clairs, et un nombre `belts` pour « Ceintures bouclées » [agent cabine a3487bb569d436fa5] ; (c) `HAND.c34` à tz 123 (grosses têtes au bord droit 264-272 s) — touche c3 ET c4. Crans de c3 : passage de 27 cm vu d'en haut sombre (240,1, 261,6), trappe noyée et sans geste (236,7, 242,8), toboggans « planches » 175-184.
- À 9 h 07 : reprendre par SendMessage ceux de c3, c5, c6 qui n'ont pas rendu ; puis relecture (deux planches de 28).

- 23/10 ≈ 3 h 10 : LES SIX CHAPITRES SONT MONTÉS, check passe, boucle exacte. `hush` ajouté sur la chute (sfx). Relecture sur deux planches de 28 (`scratchpad/L03/relecture-a.jpg`, `-b.jpg`).
- Reprises vague A (hebdo 98 %) : avion (toboggans → vrais boudins gonflés ; A380 plus haut), c1 (5,1-9,2 flanc mince ; 3,5 haut-parleur ; 44,9-47,2 « le vide »), c2 (120-128 avion trait ; 150-156 mur de verre ; 67,35 boudin mur gris ; revoir 61,5 et 80,4).
- Reprises vague B, ensuite : c3 (a1bcebe571faf754f) 191,5 deux figurines dans le vide ; 220,15 le 737 minuscule ; 239,25 mur de têtes ; HAND.c34 tz 123 (avec c4) — c5 (a993f78a5ad209e1b) 372,95 approche/Dash 8 minuscules ; 382,5 avion petit ; choc 30 % — c6 (ac7a6a63bd06f6fd4) 439,8 avion mince ; 458,9 haut-parleur cercle dans le rouge ; 468,45 avion petit + foule verte en bas à droite ; revoir ses 3 recadrages non revus. Puis cabine (a3487bb569d436fa5) : `belts` + dossiers du 737.
- Puis : planche de contrôle, brouillon, qa.

## Reprise du 23/10 (dans l'ordre)
1. get_usage. Si décorateur (a2443af0651c7b778) ou c1 (ab8b55c527a7a3f90) n'ont pas rendu : SendMessage « La limite est levée : reprends là où tu t'es arrêté… ».
2. Lancer c3 (`c3-a380-manchester.js`), c4 (`c4-balisage-siege.js`), c5 (`c5-tokyo.js`) avec le même brief que c2 (section du chapitre dans docs/L03-actes.md, règles anti-parasites, journal docs/journal/L03-cN.md, 30 images, scratchpad/L03/cN) ; c3 lit la couture rendue par c2 ci-dessus. Puis c6 (`c6-pourquoi-fin.js`), qui lit POSE0/FIRST fixés par c1 pour la boucle.
3. Le nombre `belts` et le NaN : une reprise courte de l'agent cabine (a3487bb569d436fa5) — vérifier d'abord quel shader.

## Ensuite
1. « À changer ailleurs » des trois journaux → l'architecte par SendMessage (a19d6a00ea01b4c3b) les intègre et tire la planche de six candidates de la première image (POSE0 provisoire = `hook1`). Ajouter `state: { site: 1, doorA: 1, shut: 1 }` au `thumb` (proposé par l'architecte).
2. Décorateur (`docs/recette-decorateur.md`, `src/habillage.js`).
3. Choix de la première image (moi), puis chapitres en deux vagues de trois (c1-c3, puis c4-c6).
4. Deux planches de 28, reprises par SendMessage, brouillon, `qa`, rendu, `qa`, `srt`, trois miniatures.

## ÉTAT AU 23/10 ≈ 3 h 30 — HEBDO À 100 % : TOUT ATTEND LE RÉVEIL DE 9 h 07 (CETTE SECTION REMPLACE « Reprise du 23/10 » CI-DESSUS)
Fait : six chapitres, reprises de relecture (c1, c2, c3, c5, c6), toboggans refaits en vrais boudins, A380 à deux ponts et portes condamnées en signal (consigne de Merwan), `hush` sur la chute. Brouillon `renders/L03-evacuation-avion-draft.mp4` (−14,03 LUFS, crête −1,59 dBTP) ; `qa` (journal complet : scratchpad/L03/qa-draft.log) : voix calée 0 ms sur les 21 clips, aucun son sur un mot, boucle exacte.
À corriger avant le rendu final, par SendMessage à l'agent qui a monté le plan (trois à la fois) :
- c2 (a2a0e4537c447dc4a) : IMAGE PARASITE à 146,23 s ; heurté 155,4 ; plage immobile 1:56,0–2:00,0.
- c3 (a1bcebe571faf754f) : heurté 247,4 ; plages immobiles 3:17,0–3:21,5 · 3:23,0–3:27,0 · 3:36,0–3:41,5 (Manchester).
- c4 (a5bcbff0df38ff90b) : heurtés 315,1 (le plus fort, 24,7) et 274,6 ; plan de 19 s 5:58,1 → 6:17 qui traverse la couture c45 (avec c5 : un changement de vue avant 6:08).
- c1 (ab8b55c527a7a3f90) : heurté 42,4.
- c5 (a993f78a5ad209e1b) : plage immobile 6:11,5–6:16,5 ; le Dash 8 encore petit à 373,5 ; plan long avec c4 ci-dessus.
- c6 (ac7a6a63bd06f6fd4) : heurté 509,7 ; plage immobile 7:28,5–7:34,0.
Puis : `npm run render -- L03` (final, ≈ 9 min, en arrière-plan), `npm run qa -- L03` (zéro image parasite exigée), `npm run srt -- L03`, `npm run cover -- L03`, `--alt 2`, `--alt 3` (planche 160 px d'abord : `node scripts/cover.mjs L03 --sheet --out scratchpad/L03`), copie téléphone `npm run phone -- L03` si utile, et trois lignes à Merwan. Repères de coupure pub donnés par qa (à recalculer sur le final) : 1:46,5 · 4:31,7 · 7:14,6.

## FINI — 23/10 ≈ 9 h 55
`renders/L03-evacuation-avion.mp4` (8 min 54) : `check` 0 erreur, boucle exacte ; `qa` : voix calée 0 ms (21 clips), −14,03 LUFS, crête vraie −1,59 dBTP, AUCUNE image parasite, aucun plan > 12 s, aucune plage immobile, aucun son sur un mot. Mouvements les plus vifs restants : 164,6 s (17,4, glissement lent sur l'A380, regardé image par image), 405,8, 32,4 (l'éclaté sur « on », voulu). Sous-titres et chapitres : `renders/L03-evacuation-avion.srt` (+ description). Miniatures : `-miniature.png` (90 SECONDES, l'A350 en feu et ses toboggans), `-2` (LA FUMÉE DESCEND), `-3` (TON SAC, TU LE PRENDS ?). Coupures pub à poser dans YouTube Studio : 1:46,5 · 4:31,7 · 7:14,6.
Coût : ≈ 17 agents ou reprises (architecte 0,56 M ; décors 1,46 M ; décorateur 0,39 M ; six chapitres ≈ 2,2 M ; une vingtaine de reprises par SendMessage à ≈ 0,35-0,45 M chacune — une reprise relit tout le contexte de l'agent : c'est le poste le plus cher) ; hebdo 73 → 100 % (avec les autres dossiers) puis 0 → 3 % ; fenêtre 5 h : 0 → 20 % le 23/10.
Un cran en dessous : le haut-parleur (grille petite, 3,5 s et 458 s), « le vide » (44,9-47,2 s, sol à peine lisible), la poupée et la trappe sans geste, le plan de 2:05 encore sous 40 %.

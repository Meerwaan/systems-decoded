# 037 · Le parachute de secours — les décors

Architecte, 04/11. Trois fichiers, montés en parallèle contre leur bouchon (`episodes/037-parachute/src/`), l'API est définitive : on remplace l'intérieur, on garde ce que la fonction rend. Le contrat : `plan.js` (cotes, conventions, sans import) et `world.js` (`FIRST`, `VIEW`, `apply`). **Ne touchez ni l'un ni l'autre** : un changement s'écrit dans votre journal sous « À changer ailleurs ».

**Ce qui vaut pour les trois.**
- Origine = le centre de la plaque dorsale du conteneur. **Repère du sauteur** : à plat ventre, dos vers +y, tête vers +z, sa gauche vers +x. Avec `spin`, `tilt`, `hang` à 0, c'est le repère de la scène — et celui de l'établi (le sac y est posé comme sur ton dos : plaque en bas, rabats en haut, tête vers +z).
- Azimut vérifié sur planche : az 0 est en +z (côté tête), az −90 en −x (à ta **droite**) : vue de là, ta tête est à droite de l'image. La lumière clé vient de −x, +y, +z (az −20 à −70).
- Le monde vient au sauteur : le sol est le plan y = −`alt` · 100 (alt en mètres), l'air défile à `vz` (m/s). Rien ne voyage 1 350 m : `alt` le fait.
- Faits (`docs/faits/037-parachute.md`, « À ne pas dire ») : le boîtier **coupe la boucle**, il n'ouvre pas le parachute ; aucun temps d'ouverture ; « 225 m » est un repère ; il n'a aucun capteur du corps. Aucune marque, aucun chiffre écrit sur les pièces.
- Trois couleurs : signal = le sol qui monte, la vitesse, le boîtier éteint ; veille = la diode, la boucle quand on la nomme, la fenêtre de 225 m, la voile qui sauve ; ink le reste.

---

## model.js

**Le système, plein** : le conteneur de secours sur ton dos et ce qui le garde fermé. `buildSystem()` → `{ root, parts, A, update(p, time, px) }`. Modèle de l'idiome : `episodes/007-siege-ejectable/src/model.js`.

**À construire** (cotes dans `plan.js`, à l'échelle vraie : manuel CYPRES 2 [P]) :
- Le **conteneur** (`CONTAINER`) : deux bacs, le secours en haut (vers la tête, `RESERVE`), le principal en bas ; toile sombre mate (pas un bloc lisse : coutures en traits fins, bords roulés, la plaque dorsale). `fabric` 1 → 0 le fait passer **aux rayons X** (verre, traits fins) : dedans, pleins, le boîtier, le câble, le coupe-boucle, la boucle.
- Les **quatre rabats** du secours (`FLAPS` : bas, haut, gauche, droite, chacun avec son œillet sur la boucle) : `flaps` les ouvre **vers l'extérieur autour de leur charnière** (pas un fondu : à vérifier de profil, fermé / ouvert). La **goupille** (`PIN`) à travers la boucle, au-dessus du dernier rabat.
- La **boucle de fermeture** (`LOOP`) : un cordon ancré au plancher, qui monte par le **trou** du coupe-boucle, traverse l'extracteur et les œillets jusqu'à la goupille. `loop` 1 : coupée dans le trou, ses deux bouts s'écartent, le haut file vers le haut. `heart` / `litLoop` : elle s'allume veille, seule, sur son halo.
- **Le coupe-boucle** (`CUTTER`, 43 × 8 mm, la pièce-héros, la plus claire) : un tube posé sur le plancher, son trou en travers, le **piston** dedans qui avance de ≈ 5 mm (`piston`) à travers le trou. `section` 1 : un quart du tube s'efface (coupe), on voit le piston et la boucle dans le trou — c'est l'image du climax.
- **Le boîtier** (`UNIT`, 85 × 43 × 32 mm, 198 g) dans sa pochette au fond du bac, son **capteur de pression** (un orifice rond sur son flanc, `A.sensor`) ; sur son autre flanc, la **jauge** du principe : une barre veille qui monte avec `press`, et un repère de vitesse `rate` (lent → vite ; signal au-delà du seuil). `solo` : il reste seul, le reste s'efface.
- **L'unité de contrôle** (`CONTROL`) sur le rabat du haut, lisible de dehors : un petit écran à segments, un bouton, et **la diode** (`CONTROL.diode`) : `power` 1 = elle respire, veille (lent, jamais un clignotement) ; `wake` = allumée franc ; `power` 0 = écran et diode morts ; `test` = l'auto-test (les segments font le tour, puis la diode passe au vert).
- Les **deux câbles** (contrôle → boîtier, enroulé ; boîtier → coupe-boucle) le long du plancher et de la paroi. `litCable` : **une tête de lumière qui court** du boîtier (0) au coupe-boucle (1), pas un fil qui s'allume d'un coup.
- Sous les rabats : l'**extracteur** comprimé (un ressort et sa toile, `PILOT`) sur le **sac de déploiement** (`BAG`). `deploy` > 0,05 : l'extracteur est parti (sauteur.js le fait voler).
- `explode` : l'éclaté **qui suit un chemin, dans UN cadre vertical** (`VIEW.exploded`) : les rabats se soulèvent (celui du haut le plus haut), l'extracteur et le sac montent, le boîtier sort de sa pochette sur le côté, son câble se tend jusqu'au coupe-boucle qui reste près du plancher avec la boucle debout dedans. La lecture : rabat → boîtier → câble → coupe-boucle → boucle, dans l'ordre où la voix les nomme.
- `litFlap`, `litUnit`, `litSensor`, `litCutter` : la pièce nommée luit doucement.

**Ce qui change son allure** : trois gris (toile foncée, boîtier moyen, coupe-boucle clair), `metal` ≤ 0,5, arêtes fines ; chaque pièce qui s'efface a ses propres matières (la diode et l'écran sont inscrits dans les matières du rabat du haut). `finish` du plateau est allumé : `userData.finish = false` sur l'écran.

**API (définitive)** — exports : `buildSystem`, `MODEL`. `A` : `unit, sensor, control, diode, cable, cutter, hole, piston, loop, loopTop, pin, flapTop, pilot, centre`. Nombres lus par `update` : `bench, explode, flaps, deploy, loop, piston, section, power, wake, test, press, rate, fabric, solo, heart, litFlap, litUnit, litSensor, litCable, litCutter, litLoop`.

**Images à réussir (liste fermée)** — poses de `world.js` :
1. `VIEW.back`, scène (`spin` 0) et établi : la même image — le dessus du secours, ses rabats fermés, l'unité de contrôle et sa diode qui respire.
2. `VIEW.rig`, `fabric` 0 : à travers la toile, le boîtier plein dans sa pochette, le coupe-boucle au plancher, la boucle qui monte à la goupille.
3. `VIEW.exploded`, `explode` 1 : toutes les pièces lisibles à 270 px, dans un seul cadre vertical.
4. `VIEW.unit`, `solo` 1, `litSensor` 1, `press` 0,6, `rate` 1 : le boîtier seul, son orifice, sa jauge.
5. `VIEW.cutter`, `section` 1 : `piston` 0 puis 1 (deux images), puis `loop` 1 : deux bouts coupés qui s'écartent.
6. `VIEW.heart`, `heart` 1 : la boucle seule, veille, sur son halo, le reste éteint.
7. Le climax sur ton dos : `flaps` 0 → 1 de profil (deux images), `deploy` 0,2 : le bac ouvert, l'extracteur parti.
8. L'unité de contrôle : `power` 0 / 1 / `test` 0,5 / `wake` 1 (quatre images d'un même cadre serré).
9. `VIEW.ground` (avec ciel.js, `alt` 0, `body` 0) : le sac posé sur l'herbe.

**Propre au dossier** : le sac est vu **plein sur un corps de verre** dès la première image — c'est lui le sujet ; à 400 cm, l'unité de contrôle fait ≈ 25 px : la diode doit rester lisible là (une lumière qui a un cœur et une traîne, ≈ 1 cm de halo). Le boîtier ne « tire » rien vers l'extérieur : « nothing escapes or is expelled » [P] — pas d'étincelle, pas de fumée au coupe-boucle.

---

## sauteur.js

**Toi, aux rayons X, et ce qui sort du sac** : le corps en chute, le harnais et sa poignée, l'extracteur en vol, la voile de secours, le second sauteur du principe. `buildDiver()` → `{ group, A, update(p, time, px) }`. **Le sac n'est pas à toi** : `world.js` accroche `system.root` à `A.back` ; tout ce que tu fais au corps (spin, tilt, hang, land), le sac le suit.

**À construire** :
- Le **corps** : `makeFigure({ shell: true, hands: "flat" })` (`kit/lib/figure.js`), couché face au sol comme le bouchon (rotation.x +90°, épaules à z 34, dos à y 0). **Inerte** : bras qui traînent vers le haut et l'arrière, avant-bras lâches, jambes un peu fléchies et écartées, tête qui pend ; avec `vz`, un flottement lent des avant-bras et des tibias (l'air qui les secoue, une respiration, jamais un tremblement). Jamais blessé, jamais un visage.
- Le **harnais** : sangles de cuisses, de poitrine, élévateurs aux épaules — traits fins `fatLine`, ink. La **poignée de secours** (`BODY.handle`, sur la sangle de poitrine, côté gauche) pleine, métal clair, petite.
- `hand` : ta main droite vient flotter à côté de la poignée, ouverte, sans la prendre (« ta main ne bouge pas »).
- `spin` (tours, autour de y par l'origine), `tilt` (degrés, tête vers le bas), `hang` (0 à plat → 1 debout sous la voile, pivot aux épaules : le sac part dans ton dos), `land` (couché sur le côté sur `groundY`, la voile affaissée à côté, sur l'herbe).
- `deploy` : l'**extracteur** (une petite voile de verre et son ressort) quitte le bac vers le haut (0,05–0,25) au bout de sa bride ; le **sac de déploiement** et les **suspentes** se tendent (0,25–0,5) ; la **voile de secours**, une aile rectangulaire à sept caissons, en verre aux nervures fines, s'ouvre et se gonfle (0,5–0,85) au-dessus de toi, pleine à 1 ; son bord d'attaque veille quand elle est pleine (ce qui te sauve). Plus petite qu'en vrai (`CANOPY`) : un cadre vertical.
- `twin` : un second sauteur, **pâle**, sous sa voile ouverte, à `TWIN` (au-dessus et à côté de toi : dans un cadre vertical, sa voile en haut, toi qui files en bas) ; autour de lui, peu d'air et lent (ses propres traînées courtes, `makeStreaks` de `kit/lib/postes.js`), autour de toi l'air de ciel.js, long.
- `shell` : la luminosité de ton verre et de la voile.

**Réutilisé** : `kit/lib/figure.js` (poses : `reach`, `leg`, `lean`) ; l'idiome de la voile du 026 (`episodes/026-soyouz-ms10/src/sky.js`, `makeChute`, l. 440–520 : élévateurs, suspentes, extracteur, verre à fuseaux fins) **recopié et refait en aile rectangulaire** (pas importé : une voile ronde de Soyouz). `glassFigure` des 017 / 022 / 028 si un plan rapproché le demande (de près, le personnage est en verre de la tête aux mains).

**API (définitive)** — export : `buildDiver`. `A` : `back` (groupe de montage du sac = le repère du sauteur), `handle`, `hand`, `head`, `canopy`, `twin`. Nombres lus : `body, shell, spin, tilt, hang, land, hand, deploy, twin, vz, groundY, mood`.

**Images à réussir (liste fermée)** :
1. `POSE0` / `VIEW.dive`, `spin` 0,06 : le corps inerte vu de dessus-derrière, bras et jambes lâches, ≈ 45 % de la largeur, le sac plein sur le dos.
2. `VIEW.side`, `VIEW.under` (`spin` 0,06), `VIEW.headdown` (`tilt` 55) : le même corps se lit d'un coup d'œil sous chaque angle.
3. `VIEW.handle`, `hand` 1 : la poignée sur la sangle et la main ouverte à côté, vues de sous la poitrine — le bras et le torse dans le cadre (jamais une main seule).
4. `VIEW.open`, `hang` suivant `deploy` : `deploy` 0,15 / 0,4 / 0,7 / 1 (quatre images) — l'extracteur qui part, le sac et les suspentes, la voile qui se gonfle, pleine au-dessus d'un corps inerte.
5. `VIEW.hanging` : le corps pendu, immobile, sous la voile pleine.
6. `VIEW.landed`, `land` 1, `groundY` 0 : couché dans le champ, la voile affaissée, vu de loin.
7. `VIEW.twin`, `twin` 1 : le second sauteur sous sa voile en haut, toi qui files en bas — les deux se lisent.

**Propre au dossier** : l'image 0 bouge **par toi** : `spin` (≈ 0,35 tour/s dans l'acte 1) et le flottement des membres ; rien de fin qui tourne vite (le harnais en traits ≥ 1,8 px). Le cas réel : le sauteur part « en tournant » et peut être tête en bas (`tilt`) ; personne ne voit l'instant du malaise.

---

## ciel.js

**Le ciel, la campagne, l'air** : tout ce qui n'est ni toi ni le sac. `buildSky()` → `{ group, A, update(p, time, px) }`, jamais tourné.

**À construire** :
- Un **dôme à l'infini** d'après `episodes/026-soyouz-ms10/src/sky.js` (`domeMat`, l. 60–160) et `007/jet.js` : noir-bleu en haut, une fine ligne d'horizon claire sous une bande d'air pâle, l'horizon à la dépression que donne `alt` ; **recopié, pas importé** (son `buildSky` amène la steppe, le parachute et la fusée du 026).
- **La campagne en damier**, dessinée dans le dôme sur le plan y = −`alt` · 100 : des champs de 120 à 420 m (`GROUND.field`) en trois ou quatre valeurs sombres d'ink (jamais une dalle grise), les haies en traits fins, quelques routes un peu plus claires, un village en points ; brume vers l'horizon. À 1 350 m elle se lit comme un damier, elle grossit quand `alt` descend : « le sol monte ». `threat` : haies et routes virent au signal (la menace derrière le sujet). Le détail fin fondu par `fwidth` dès qu'il passerait sous le pixel (pas de scintillement en chute).
- **L'air** (`makeStreaks`, copie du 026 l. 169–230 ou `kit/lib/postes.js`) : des traînées fines verticales qui montent le long de toi, leur longueur suit `vz`, leur course suit `alt` (au ralenti de l'acte 3, `alt` bouge peu : elles glissent lentement, longues) ; à `vz` 0, rien.
- `strata` (le principe) : des nappes horizontales de grains, espacées de 140 m en haut, de 40 m près du sol (`STRATA`), qui montent à travers toi quand `alt` descend — « l'air s'épaissit » ; aucun chiffre dessus.
- `gate` : **la fenêtre**, une nappe horizontale à 225 m au-dessus du sol (`ALT.gate`, `GATE.r`) : grille fine veille et bord lumineux, translucide ; lisible de loin (`VIEW.gateWide`) et à ta hauteur (`VIEW.cross`).
- Près du sol (`alt` < `GROUND.near`) : de la vraie géométrie — le champ d'atterrissage (sillons, une haie, une clôture) et l'herbe du matin (touffes, comme `dressSteppe` du 026) sous le sac à `alt` 0. `A.ground`, `A.field` suivent le plan du sol.

**API (définitive)** — export : `buildSky`. `A` : `ground`, `field`. Nombres lus : `alt, vz, sky, threat, strata, gate, mood`. `main.js` ouvre la caméra jusqu'à `far` 600 000 cm : tout ce qui est plus loin est dans le dôme.

**Images à réussir (liste fermée)** :
1. `VIEW.dive`, `alt` 1 350, `threat` 0,4 : le damier derrière le corps, lisible à 270 px.
2. `VIEW.side` et `VIEW.under`, `alt` 1 350 : le ciel, l'horizon, la campagne qui fuit vers lui.
3. `threat` 0 / 1 sur la même image : le sol qui vire au signal.
4. `VIEW.side`, `alt` 2 000, `strata` 1 : les nappes, plus serrées vers le bas.
5. `VIEW.gateWide`, `alt` 400, `gate` 1 : la fenêtre sous le sauteur, vue de loin ; `VIEW.cross`, `alt` 228, `gate` 1 : la nappe à ta hauteur.
6. La montée vue de `VIEW.ground` : `alt` 0 / 300 / 4 000 (trois images) — le sol qui s'éloigne.
7. `VIEW.ground` et `VIEW.landed`, `alt` 0 : l'herbe et le champ.

**Propre au dossier** : le jour du cas réel, il faisait jour ; ici, le ciel est celui du compte (sombre, l'horizon clair) — pas de soleil, pas de bleu. La campagne est française et ordinaire (aucun lieu nommé).

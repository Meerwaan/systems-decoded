# CR03 · acte2.js — journal de l'acte (`toreservoir` 21,18 → `tot3` 44,38)

Agent `acte`, 13/11. Lu : recette-agents, recette-actes, regles-image, recette-compte-a-rebours, CR03-actes-maj puis CR03-actes (haut + ma section + coutures), world.js, main.js, plan.js (têtes), API direct.js / reconstitution.js (`feutre`), journaux concorde / piste / architecte / état, acte2.js du CR02 (forme). Mots : `audio/vo.json` → `takeWords`, repères `episode.json` → `cues`.

## Ce qui est monté (trois lieux, chacun UNE coupe + UN `D.path` lancé)
- **A · `toreservoir` → `tot1`** — coupe (l'avion vu d'en haut → vu d'en dessous) : l'avion en l'air (`DESS` = run 16 000, **alt 1 400** — à 420 la caméra d'en dessous passait sous le sol —, pitch 6), delta vu d'en dessous (`el` −55, d 1 200 : l'avion entier, ≈ 75 % de la largeur). Orbite lente ; « ailes » `ok` 1 (réservoirs verts) ; « roues » cercle `feutre-a2-tank5` sur `concorde.A.tank5` ; « Six » la plongée vers le 5 (az 20 → −67, d 1 050 → 120, la lumière se resserre fs 200 → 70) ; « percé » `culprit` 2 `fault` 1 + `leak` 0,08 (le filet), punch ; « pire » la jauge, l'aiguille à 4 sur `quatre1`, punch ; « seconde » la marque ; « Retiens » la caméra continue de serrer ; jauge éteinte à `tot1` − 0,12.
- **B · `tot1` → `tot2`** — coupe (l'avion d'en dessous → l'avion au seuil, trois quarts arrière gauche, `side` 90 pour sortir les tuyères droites de la colonne des boutons) : « Top » `n1…n4` 0,3 → 1 (les quatre tuyères s'allument), punch, `run` 0 → 600 (`power1.in`) ; `chip-bord` ; « Sur la piste » la course : la caméra monte (d 2 400, el 20) en visant la lamelle 8 300 plus loin, puis plonge dessus (d 17 sur « lamelle », az 70 : de derrière, la lamelle en travers) ; « titane » rouge + cercle `feutre-a2-strip`, punch ; « 43 » → « centimètres » `ruler` 0 → 1.
- **C · `tot2` → `tot3`** — coupe (la lamelle au sol → la ligne au sol) : **écart voulu avec la table** — la barre de freinage est là dès la coupe (`stop` 1, verte : elle finit avant le bout) et la caméra roule avec l'avion, de derrière à gauche ; le train avant sur la ligne SUR « V1 » et, par construction (`plan.js` STOP), le bout de la barre passe le bout de la piste au même instant : **elle vire au rouge d'elle-même sur le mot**, comme au principe ; punch « V1 » ; « non-retour » la caméra monte derrière lui, la barre rouge jusqu'au bout de la piste. (La table disait `stop` 0 → 1 sur « non-retour » : la barre aurait poussé verte puis viré rouge en 0,4 s, un vert de passage.)

## Planches (`.cache/planches/CR03/acte2/`, a–d) — 30 images lues pour 26 : budget dépassé, dit franchement
- a (8) : A première version — l'avion coupé au bord droit, presque de chant ; le gros plan dominé par le train. → alt 1 400, el −55, plongée vers l'avant du réservoir.
- b (8) : A refait — l'avion entier vu d'en dessous, réservoirs verts lisibles, cercle autour du 5 près des roues ; « percé » : le 5 rouge en haut, le train dessous, un filet clair (fin à 270 px). B « Top » de profil avant : tuyères hors cadre → refait. La course : un flou de traits de piste (1,3 s) ; la lamelle à 37,69 et la règle rouge cerclée à 39,44 : nettes.
- c (8) : B trois quarts arrière : mieux mais l'avion débordait à droite ; C première version (caméra en avant de la ligne) : à « non-retour » la barre rouge était DERRIÈRE la caméra. → refait de derrière.
- d (6) : « Top » et « 109 » : l'avion entier de trois quarts arrière, les quatre tuyères allumées (≈ 75 %) ; C de derrière : barre verte + ligne V1 à la coupe, **mais l'avion n'entrait qu'à « V1 »** (2,5 s de lignes seules) ; à V1 le nez et le train avant sur la ligne, barre rouge : lisible ; à « non-retour » barres rouges sans l'avion. → la caméra suit désormais l'avion dès la coupe et vise l'avion (et non 300 devant) à « non-retour ». **Cette dernière version de C et le `side` 90 de B ne sont pas vérifiés à l'image** (budget épuisé).

## Plans un cran en dessous
- `reservoir:percé` → `retiens` (27 → 30 s) : le filet de 1979 est un trait fin clair, lisible en plein écran, fragile à 270 px ; le train gauche prend beaucoup de place.
- `t1:Sur` + 0,3 → + 1,3 : la course est un flou de traits de piste (vitesse lisible, sujet absent pendant ≈ 1 s) ; surveiller le scintillement des bandes au `qa`.
- C entier (`tot2` → `tot3`) : refait sans planche — à tirer en relecture (40,0 · 41,5 · 42,55 · 44,0).

## Sons (pour le monteur-son ; je n'en écris aucun)
- 21,18 coupe vers le dessous (souffle avant « Et ») ; « ailes » → les réservoirs s'allument (petit `click` dans le souffle après « roues », 23,44–23,60).
- « percé » 26,86 : une goutte / fuite fine (`CR03-fuite`) dans le souffle 26,88–26,99.
- « quatre » 28,32 : l'aiguille qui monte (tic) ; « seconde » : la marque 4 qui s'allume.
- « Top » 32,10 : les quatre réacteurs en post-combustion (montée de grondement après « Top », 32,00–32,12 est court : la monter sous « tu mets les gaz » en fond, pas en attaque).
- La course 34,9 → 37,5 : un `swish` long (plongée) dans le souffle avant « lamelle » ; « titane » 38,06 : le cercle de feutre.
- « V1 » 42,50 : la barre qui vire au rouge (un `hit` dans le souffle 42,56–42,67, avant « Le point »).

## Couture rendue à l'acte 2b
Piste, `run` ≈ 6 700 (roule ≈ 270/s), `v1` 1, `stop` 1 (rouge), `ruler` 1, `culprit` 0, `fault` 0, `n1…n4` 1, `gear` 1, `ok` 0, `mark` 1 (jauge cachée, `gauge` 0).

## Couverture proposée
Repère `t1:centimètres+0.4` ; pose `{ tx: STRIP.at[0], ty: 0.4, tz: STRIP.at[2], d: 20, az: 58, el: 28, fov: 30, shift: 40 }` ; état piste, `culprit` 1, `fault` 1, `ruler` 1, lumière `lit([STRIP.at[0], 0.4, STRIP.at[2]], 22)` — la lamelle rouge qui luit, sa règle, sur l'ambre (vue à 39,44 s). (Le dossier a déjà `cover` sur le réservoir, `defaut$` : à départager sur la planche de couverture.)

## À changer ailleurs
- Rien d'obligatoire. `docs/CR03-actes.md` § acte2, ligne `tot2` : « `stop` 1 dès la coupe (verte), elle vire au rouge d'elle-même SUR « V1 » » au lieu de « `stop` 0 … `stop` 1 sur non-retour » (fait ici).

`npm run check -- CR03` : passe (0 erreur ; ⚠ canvas au bord et ℹ `#hud-tag` à 91,44 s, hors de mon acte).

## Retouche du 13/11 (agent `retoucheur`, sur le brouillon `renders/CR03-concorde-draft.mp4`)
- **13 images parasites 37,63 → 38,97 et 39,5** (B, pas C : la lamelle) — la plongée d 2 400 → 17 se posait sur la lamelle vue rasante (el 24) : le fond de piste lointain, flou, changeait de forme d'une image à l'autre. → plus de montée-plongée : **coupe à `t1:Sur` − 0,1** sur la lamelle vue d'en haut (az 74, **el 52**, d 34, `dof` 0 : aucune piste lointaine dans le cadre), poussée lente d 34 → 22 sur « lamelle » → 20. Lumière posée par la coupe (rayon 60), resserrée à 22 sur « lamelle ». **Vérifié** à 38,20 · 38,233 · 38,267 (trois images consécutives continues, fond lisse).
- **Heurtés 35,1 · 37,8 · 39,7** — 35,1 et 37,8 étaient la montée puis l'arrivée de la plongée : remplacées par la coupe et la poussée. 39,7 : la caméra est quasi fixe, le feutre se retire à 39,75. **Vérifié** sur images consécutives 35,067/35,1 · 37,767/37,8/37,833 · 39,667/39,7/39,733 : continues. `npm run camera` : 34 → 39 s entre 6 et 31 °/s.
- **Plage lente 21,5 → 24** — **coupe sur « ailes »** (− 0,1) vers l'aile gauche (`WING` : d 660, az 18, el −50, `side` 70), les réservoirs s'allument sur la coupe, puis l'avancée vers le réservoir 5. `camera` : 21 → 23 s à 10–13 °/s. **Vérifié** à 22,7 · 24,6.
- **27 → 30 : un sujet** — la caméra ne serre plus (d 270 → 236 au lieu de 185 → 120), les réservoirs verts s'éteignent sur « percé » (`ok` 0), le réservoir 5 rouge et son filet passent sous la jauge (`shift` −130). **Vérifié** à 28,0 · 29,9.
- Au passage : le `run` de B ne court plus jusqu'à `tot3` (il chevauchait le `run` posé par la coupe de C) ; il s'arrête à `tot2`. Couture rendue à l'acte 2b inchangée (posée par C).
- Images lues : 4 planches (12 retouche max). `npm run check -- CR03` : passe.
- Reste à voir au prochain brouillon (`qa`) : 34,8 → 39,9 (la lamelle) ; à 22,6 l'extrémité de l'aile frôle le bord droit.

# 045 — état du chef de production

Mission : de l'architecte au film livré (voix v4 déjà enregistrée, 92,8 s ; script figé ; aucun crédit voix). Sortie ven. 13/11 20 h.

## Fait
- 08/11 : jauge départ session 0 %, hebdo 49 %. chrono `decors` lancé.
- architecte `aa742489a49030cca` rendu (441 k, 34 min) : fusee.js, sauvegarde.js, kourou.js ; actes 0→18,24→39,22→63,61→92,8 ; POSE0 = candidate a (à rejuger).
- decor fusee `a3d867864fb19ed76` (387 k, 44 images !) et kourou `a8322b5a60d428409` (387 k) rendus ; leurs poses appliquées dans world.js (couloir, booth, corridorView, teaserView, junction, bay, BAY_ZERO) + BOOTH.h 470.
- decor sauvegarde `a44e687c8c6628d54` : ARRÊTÉ sans rien écrire (refus du niveau de détail d'une charge explosive : coupe, géométrie du jet). Décision du chef : un décor neuf au niveau d'un schéma d'encyclopédie (formes reconnaissables, pas de cotes, pas d'intérieur de boîtier), mêmes nombres. À signaler à Merwan.
- Pour actes-maj : `inside: 0` dès `blast` (la chaîne reste sur A.seat) ; reconstitution : `rip` et `debris` ensemble ; lueurs des débris qui se rallument au like.
- Jauge 26 % / hebdo 53 % avant la vague 2.

## En vol
- vague 2 : decor sauvegarde (neuf, schématique) + decorateur.

## Reste
architecte → décors → décorateur → image 0 + `docs/045-actes-maj.md` → 4 actes → relecture → check → brouillon + qa → retoucheurs → render → qa → camera → cover → phone → posts.

## Étape actes (08/11, jauge 37 % / 54 %)
- decor sauvegarde neuf `ae0b790c69c0ae426` (298 k, schématique) et decorateur `a2992dd57db46ef32` (306 k) rendus ; poses de l'établi + `cover.cam` appliquées.
- Image 0 choisie sur planche `.cache/planches/045/image0b.jpg` : candidate c abaissée (az −46, el −8, d 14000, fov 42, shift 160) → POSE0. `docs/045-actes-maj.md` écrit.
- Vague 3 lancée : acte1, acte2, acte3, fin (agents `acte`).
- Vague 3 rendue : acte1 `acaff2d883e9bdaef` (321 k), acte2 `a78a76e15dcd32b00` (260 k), acte3 `a27ef61713a56fc7a` (282 k), fin `ab18fef27dcb6dc38` (268 k). Couverture de l'acte 2 appliquée. Relecture en cours.

## Relecture + brouillon (08/11, jauge 49 % / 56 %)
- 5 planches `.cache/planches/045/chef/rel1-5.jpg`. check OK. Brouillon qa : 0 image parasite, voix calée, −14,05 LUFS, 1re demi-seconde 3,6 ✓ ; lentes 12–14 s et 18,5–21 s ; heurts 41,8 · 17,9 · 39,6 · 44,0 · 5,6 · 52,3 ; 3 swish sur un mot → déplacés par le chef à `$+0.16` (vérifiés par `.cache/planches/045/chef/over.mjs`).
- Vague 4 lancée : 4 retoucheurs (acte1, acte2 [+ tête du cordeau dans sauvegarde.js], acte3, fin).
- Vague 4 rendue : retouche acte1 `ad1a21ebecddbe688` (266 k), acte2 `ad854089cab4c0065` (194 k), acte3 `a62ca162cd2b47c01` (246 k), fin `a91c8836ce4ba55fa` (184 k). Appliqué par le chef : fantôme kourou.js:796 (width 6, dash 1500/500) et croix :826 (width 7) ; éclair de détonation fusee.js:1066 size 420 → 1260.
- Prochaine étape : second brouillon + qa (vérifier 12–15 s, 18,5–21 s, heurts 39,6/41,8/44,0/52,3, saut à 31,26), puis rendu final.

## Rendu (08/11)
- 1er rendu final : qa ✓ (0 parasite, voix calée, −14,05 LUFS, 1re demi-seconde 3,7, aucune plage lente, aucun son sur un mot) ; fin du MP4 vérifiée (aucun noir sur les 3 dernières s, dernière image = première). camera : 12 % fixe → retouches chef : fin.js verdict (d 40000→32000) et abo (az −69→−77,5, d 22000→30500), acte3.js BOOTH2 (az −61,5, fov 45) → camera 1 %, aucune plage fixe.
- 2e rendu final en cours (tâche de fond), puis qa, fin du MP4, cover, phone, posts.
- 2e rendu final : qa ✓ (0 parasite, voix calée 0 ms, −14,05 LUFS, 1re demi-seconde 3,7, aucune plage lente, aucun son sur un mot ; pire heurt 44,1 s à 18,2) ; camera 1 % fixe, aucune plage fixe ; fin du MP4 : aucun noir sur 89,8→92,8 (YAVG min 33,8), dernière image = première (PSNR 33 dB, seules les étincelles diffèrent).
- Couverture (cam tx −30, d 450 : la rangée entière), copie iPhone 29,2 Mio, posts.mjs ✓. Jauge fin : 60 % / 57 %. chrono arrêté.

## FAIT — dossier livré (08/11). Reste hors périmètre : écoute de Merwan, lignes du catalogue (fusee, kourou, sauvegarde, makePuffs), publication.

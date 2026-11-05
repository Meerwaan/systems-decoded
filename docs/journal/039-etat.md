# 039-cendrier-reacteur — état du chef de production

Consigne (05/11) : de l'architecte au MP4 final. Voix enregistrée (93,4 s, 14 beats), ne pas y toucher (⚠ « MÊME TON PARTOUT », « boucle trop pressé » : écoute de Merwan). Aucun crédit.
Contexte du chef : base ≈ 151 k (outils) dès le départ.

## Journal
- 05/11 ≈ 20 h : jauge fenêtre 40 % (RAZ 22 h 59 locale), hebdo 63 %. Lancement architecte.
- architecte ac4def4d150190cf1 rendu (346 k, 22 min) : 3 décors (model, corium, batiment→005/reactor), 5 actes (acte1,2,2b,3,fin), candidates image0 en fin de docs/039-actes.md (a = POSE0). check passe (3 ⚠ contraste 5,19 s, acte 1).
- décors rendus : model a3afe421446c67426 (322 k), corium aa64c11b42df174e6 (304 k), batiment a0ef83a4c175cf80c (232 k). Appliqué par le chef : 9 poses VIEW (plugTop valve graze exploded pool = model ; teaser chamberLow = batiment ; heap channel = corium), paroi de fosse model.js 0x85837d → 0x4a4640.
- Reste pour fin.js : `cut(t.abo - 0.12, SET.PLANT, VIEW.teaser, { ...STAGED, teaser: 0.3, mood: 1 })` puis teaser → 1 de t.abo à t.toloop. Non fait : eaten → corium.update (fossé autour du bain à eaten 0,9 ?), plugGlow à y ≤ 0,3 ; à juger sur planche.
- Ensuite : décorateur sur batiment.js, puis image0.
- image0 : POSE0 = chambre basse c4 (planche .cache/planches/039/image0b.jpg, image0c.jpg), FIRST breach 0.6 pour 1. docs/039-actes-maj.md écrit. Décorateur a2767c718ed34c24a rendu (224 k). Ensuite : actes.
- actes rendus : acte1 a7ff9dffe307262f9 (214 k), acte2 a0ccbe666a87ca69a (221 k), acte2b a701b4b84ad3d8db6 (232 k), acte3 afdd31e8f12fae1df (231 k). check passe. Faibles signalés : porte sous le bain (18,9–20,9 ; 50,0–51,5), piscine = bloc gris (7,2–9,5 ; 31–32 ; 45–47), flèches droites absentes à spread 1 (corium, renderOrder ?), tête d'eau invisible 63,08. Couverture proposée par acte2 (repère `chambre`, pose éclatée).
- Ensuite : fin.js (seul), puis relecture.
- fin a09a845a8f74037df rendu (235 k). Relecture : 4 planches .cache/planches/039/relecture/p1-4.jpg. check passe (0 erreur). Brouillon : voix calée, −14,04 LUFS, 0 image parasite ; heurté 64,4 s (34) 18,0 (23) 16,1 (20) 7,8 45,5 ; 1re demi-seconde 0,8 ; lent 1,5–4 et 12–14,5 s. 4 sons sur un mot : déplacés par le chef (couler+0.48, sortie+0.55, commentaire-0.75), swish droit-0.26 retiré.
- Défauts : eau invisible (62–65, 84 ; piscine 7,8–9, 46 = blocs gris) → model.js ; flèches droites absentes (40,8), porte sous le bain, explosion = brume, 1re image peu mobile → corium.js ; acte1 (9,0 dalle pâle, heurts 7,8/16,1/18,0, lent 1,5–4/12–14,5) ; acte3 (heurt 64,4) ; vague 2 : acte2 (21,3 « on l'ouvre » lavé de beige), acte2b (45,5 heurt, 46 piscine).
- vague retouche 1 rendue : model a279f51dc88cde8b3, corium ae990189e94613f7b, acte1 a158b800710af0e62, acte3 a7db4835714fc7669 ; plug: S.plug ajouté à corium.update (world.js). Vague 2 : acte2, acte2b.
- vague retouche 2 rendue : acte2 ae95b3752965d2b58, acte2b aafde31c728f1145a. Brouillon 2 en cours.
- brouillon 2 : 1 image parasite 78,07 (tuyau qui s'allume d'un coup : tween water 0,3 retiré de fin.js), 2 sons sur un mot retirés (sortie+0.55, commentaire-0.75) ; lent 1,5–4 et 7,5–11,5 s ; heurté max 17 (moy. 3,4). Rendu final en cours.
- 05/11 22 h 55 : FINI. renders/039-cendrier-reacteur.mp4 (93,4 s) : voix calée, −14,03 LUFS, 0 image parasite, 0 son sur un mot ; heurté max 17 (moy. 3,3). Couverture (éclaté c3), copie iphone, posts.mjs passés. Jauge fin : fenêtre 83 %, hebdo 69 %. Agents : 16, ≈ 3,63 M.
- ⚠ restants : plages lentes 1,5–4 et 7,5–11,5 s (acte1, poussées lentes) ; 1re demi-seconde 1,2 ; voix « MÊME TON PARTOUT » / « boucle trop pressé » → écoute de Merwan.

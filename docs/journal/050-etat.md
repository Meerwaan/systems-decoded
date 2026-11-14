# 050 induction — état du chef de production

- 13/11 22:45 : début. Jauge session 4 %, hebdo 18 %. Script, voix, picks, bed déjà faits (ne pas toucher audio/).
- Étape decors : architecte lancé (cuisine 009/kitchen.js hob:false, enveloppe sur 018/cuisine.js ; système = plaque induction + casserole).
- Architecte a5b9b65cd97b43cf4 rendu (304 k, 28 min). Décors : model.js (plaque), casserole.js, cuisine.js. Candidates image0 : docs/050-actes.md dernière section + .cache/planches/050/architecte/candidates.json (reco b, sinon a). Reflet verre noir à régler dans model.js. Pas de décorateur.
- Décors rendus : model a7f66244eb58ec8f0 (263 k), casserole a351623de5de40bda (240 k), cuisine a6f077449f633fc50 (217 k). VIEW recalés dans world.js. Image0 = (a), POSE0 gardé. docs/050-actes-maj.md écrit. Prochaine étape : vague de 4 actes.
- 14/11 ≈ 23:32 (Paris) : jauge 79 % (autres sessions), hebdo 28 %. Vague d'actes (4 × 9 × 0,4 h ≈ +14) dépasserait 85 % → EN FILE : reprise à 04:40 (Paris), 03:40 UTC.
- RESTE : vague `acte` × 4 (src/acte1.js, acte2.js, acte3.js, fin.js ; consigne : lire docs/050-actes.md + docs/050-actes-maj.md) → appliquer leurs « À changer ailleurs » → `monteur-son` → relecture 4 planches 8 vignettes 270 px → check → render --draft + qa → une vague retoucheur → render, qa, cover, phone, node scripts/posts.mjs. Chrono : reprendre par `npm run chrono -- 050 actes`.
- 14/11 : jauge 0 % / hebdo 30 %. Vague actes rendue : acte1 a30acefaa818bc6ea (202 k), acte2 a57535cfcad636082 (213 k), acte3 a072d5281260ffb3c (197 k), fin a70ff768ec2855e3d (212 k). check passe.
- À retoucher (décors) : casserole.js (cut>0 : assombrir intérieur arrière, tranche du fond plus épaisse ; panHeat lumière propre ≈ 0,5 en coupe) ; model.js (chevrons de sens du champ). Proposition POSE0 az −58 el 9 de acte1 à trancher sur planche.
- POSE0 changé (az −58, el 9 : main à plat lisible). Son a729d53d568eb58c9 rendu (sfx 17, bed régénéré par `npm run sfx`). Sons du sujet NON fabriqués (`npm run sons -- 050 --budget 154`, + réserve 17) : question pour Merwan ; lignes sfx prêtes dans docs/journal/050-son.md « Sons à fabriquer ».
- Retouches décors rendues : casserole a70a5119214ab521d (voile arrière, 3 couches, panHeat 0,5), model a29fa069cd172ad08 (chevrons champ, colonne verte = fil montant corrigé, voile rose). Proposition : eddy ≈ 0,3 pendant « naît dans le fond » (acte2, fin). Étape : relecture.
- Relecture (planches .cache/planches/050/r1-r5.jpg) + check OK + brouillon qa : voix calée, −14,05 LUFS, 1 parasite 33,77 s, 1re demi-seconde mouvement 1,0. Jauge 33 % / 34 %.
- Vague retoucheur lancée : acte1 (mouvement du sujet dès l'image 1), acte2 (coupe 28,5→38,3 illisible : bouillie verte, parasite 33,77), fin (like/abo 71→83 sans sujet, « naît » 63,6→65 bouillie verte).
- Retouches rendues : acte2 ab9e823a9f17cd195, fin a2b53d11f32fcdc50, acte1 a38ff72511d86ad3e. Appliqué moi-même dans model.js : chevrons × min(1,|B|/0,35) (parasite 33,77), clignotement du « 9 » en phase (boucle).
- FINI : renders/050-induction.mp4 (qa : 0 parasite, voix calée, −14,05 LUFS), couverture, iphone, posts (script filtré sur 050). Brouillon supprimé de renders/.
- RESTE pour Merwan : sons du sujet (`npm run sons -- 050 --budget 154`, + 17 réserve) puis coller les lignes sfx de docs/journal/050-son.md et re-rendre ; écoute cabine.

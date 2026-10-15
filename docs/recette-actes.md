# La recette d'un acte (chaîne courte)

Ce que reçoit tout agent qui monte un acte (`acte1.js`, `acte2.js`, `acte3.js`, `fin.js`). Elle complète `docs/recette-agents.md`, dont le cadre s'applique en entier : un fichier par agent, pas de sous-agent, un journal tenu au fur et à mesure, planches et `essais.json` dans le dossier temporaire de la consigne — jamais dans le dépôt, JAMAIS dans `renders/`.

## À lire, dans cet ordre, et rien d'autre

1. `docs/recette-agents.md`.
2. `docs/<ep>-actes.md` EN ENTIER (le haut vaut pour tous les actes, puis ton tableau), puis `docs/<ep>-actes-maj.md` s'il existe : ce qui a changé depuis que le plan est écrit — **ses lignes priment**.
3. `episodes/<dossier>/src/world.js` (le contrat : `FIRST`, `POSE0`, `VIEW`, `BENCHED`, `STAGED`) et `main.js` (ce que lit l'en-tête).
4. `kit/lib/direct.js`, `kit/lib/blocks.js`.
5. Les journaux des décors, `docs/journal/<ep>-*.md` : ce que fait chaque nombre, **les poses qui cadrent** (pars d'elles : elles ont été vues, celles de `VIEW` ont souvent été réglées sur des bouchons), ce qui n'est pas au niveau.
6. La forme d'un acte : le même fichier dans `episodes/017-irm/src/`. Pour `fin.js` : `kit/template/src/fin.js` aussi — l'ordre de la fin à partir du 018.
7. `episodes/<dossier>/index.html` pour les étiquettes qui existent ; `npm run script -- <ep>` pour la table des repères.

## Le cadre

- **Le minutage est estimé tant que la voix n'est pas enregistrée.** Tout instant vient d'un repère du script (`cues`, `D.times({ nom: "beat:mot" })`), jamais d'un nombre de secondes en dur ; une durée s'écrit comme un écart entre deux repères. La vraie voix recalera tout.
- **Un acte commence par une coupe** dont la pose est complète et dont l'état dit tout (`{ ...STAGED, … }`, `{ ...BENCHED, … }`) : il ne dépend pas de l'acte d'avant. Il rend la main à l'instant où le suivant coupe et ne laisse rien déborder : toute étiquette a fini de sortir avant. L'acte 1 part de `POSE0` et de `FIRST`, sans coupe.
- **`POSE0` et `FIRST` sont choisis avant le montage** (une planche de quatre candidates, lue par celui qui orchestre) et collés dans `world.js` : personne ne les change — la fin compare la dernière image à la première. Si tu penses qu'il le faut, dis-le dans ton message final.
- Tu n'écris que dans ton fichier et ton journal (`docs/journal/<ep>-<ton fichier>.md`). Ni `world.js`, ni `main.js`, ni `index.html`, ni `episode.json`, ni un décor : s'il manque une étiquette, un repère ou un nombre, écris la ligne exacte sous « À changer ailleurs » et dis-le dans ton message final. Ne lance aucun script du dossier temporaire que tu n'as pas écrit.
- Les autres actes sont montés en même temps que le tien : si le build casse dans un autre fichier, attends trente secondes et relance.
- **26 images lues au plus**, par planches de 8, AVEC l'en-tête et les zones de TikTok (sans `--bare`) : le sujet entre y ≈ 440 et 1160, rien d'important sous 1600 ni sous les boutons (x > 905 de y 880 à 1760), une seule étiquette à la fois en zone haute (436–790).

## La barre

- **Chaque phrase a sa démonstration, sur le mot.** Une image qui illustre « à peu près » est à refaire ; un plan seulement « correct » se refait avant de passer au suivant.
- Acte 1 : un seul mouvement (deux coupes au plus), ça bouge dès l'image 1, la première seconde arrête le pouce sans texte.
- Acte 2 : « Alors… on l'ouvre. » est la phrase signature du compte — seule dans son plan, l'éclaté s'ouvre SUR le mot. Chaque pièce nommée a son geste. Le seuil ne s'arrête pas : `followCall`, la caméra déjà en route vers la menace.
- Acte 3 : en coupes. La voix y est hachée, par souffles courts : un plan par souffle, lisible en une demi-seconde ; deux pièces nommées à moins d'une seconde d'écart tiennent dans UN cadre. Le relâchement tombe sur la phrase où le système a gagné : `mood` passe à 0 là, pas avant.
- Fin : chute → ce qui est dû et le commentaire → like → prochain dossier → boucle. Plus rien du sujet ne revient après l'annonce ; la voix n'y redemande pas l'abonnement, c'est le panneau qui le porte. Rien d'un plan ne déborde sur le suivant : un titre a fini de sortir avant la coupe. **La dernière image est la première** : tire les deux côte à côte ; `D.commit` prévient dans la console si un nombre n'est pas revenu — `look` ne l'affiche pas, relis `D.first`.
- Mouvements longs en `sine.inOut` ; une plongée ou un long recul par rapport (`shot(at, durée, pose, ease, fromD)`) ; un quart de tour en une seconde est une coupe ; ce que la caméra frôle est invisible, pas seulement éteint.
- Un chiffre que la voix ne dit pas n'entre ni dans l'en-tête ni dans une étiquette, sauf s'il est sourcé et que le plan le nomme. Les étiquettes sont en capitales : aucune unité à symbole.
- Toi, de près, es un mannequin de verre : jamais en très gros plan, jamais la main seule. Personne n'est blessé à l'image.

## Avant de rendre

`npm run check -- <ep>` ne montre aucune erreur qui vienne de ton acte.

## Ce que tu rends

Ton fichier, qui passe au build ; et un message final de **douze lignes au plus** : ce qui est monté ; les plans un cran en dessous, dits franchement, avec leur repère ; « À changer ailleurs » (lignes exactes) ; tes images lues. L'acte 2 propose en plus la couverture de grille : un repère, une pose (`el` ≥ 28) et l'état où tout le système est éclairé et où quelque chose luit.

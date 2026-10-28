# La recette d'un acte (chaîne courte)

Ce que reçoit tout agent qui monte un acte (`acte1.js`, `acte2.js`, `acte3.js`, `fin.js`) — le type `acte` (`.claude/agents/acte.md`) ; un plan à corriger après le brouillon passe au type `retoucheur`. Un long a son type `chapitre`. Elle complète `docs/recette-agents.md`, dont le cadre s'applique en entier : un fichier par agent, pas de sous-agent, un journal tenu au fur et à mesure, planches et `essais.json` dans le dossier temporaire de la consigne — jamais dans le dépôt, JAMAIS dans `renders/`.

## À lire, dans cet ordre, et rien d'autre

1. `docs/recette-agents.md`.
2. `docs/<ep>-actes.md` EN ENTIER (le haut vaut pour tous les actes, puis ton tableau), puis `docs/<ep>-actes-maj.md` s'il existe : ce qui a changé depuis que le plan est écrit — **ses lignes priment**.
3. `episodes/<dossier>/src/world.js` (le contrat : `FIRST`, `POSE0`, `VIEW`, `BENCHED`, `STAGED`) et `main.js` (ce que lit l'en-tête).
4. `kit/lib/direct.js`, `kit/lib/blocks.js` : leur API (`grep -n "^export\|^  const [a-zA-Z]* = ("` : les méthodes de `createDirector`, commentées juste au-dessus), pas tout le code.
5. Les journaux des décors et de l'habillage, `docs/journal/<ep>-*.md` (l'habillage est déjà posé quand tu montes : ne cadre pas un plan pour le cacher, signale-le s'il gêne) : ce que fait chaque nombre, **les poses qui cadrent** (pars d'elles : elles ont été vues, celles de `VIEW` ont souvent été réglées sur des bouchons), ce qui n'est pas au niveau.
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

## La grille seconde par seconde : ce qui retient (21/10)

Les courbes TikTok du 015 (le meilleur film, ≈ 100 k vues) et du 012 perdent les gens à deux endroits : **la première seconde**, puis **de la fin de l'accroche (≈ 10 s) à ≈ 25 s** — le 015 y perd 19 points, le 012 25. Ce que les films rendus mesurent là (`npm run qa` l'imprime sous « rythme » ; le détail : `docs/scale/3-retention-wow.md`) :

| Instant | Ce que l'image et le son font | Repère mesuré |
| --- | --- | --- |
| 0 → 0,5 s | l'image bouge dès l'image 1 **et le sujet reste dans le cadre** ; un son qu'un téléphone joue avant le premier mot (`hit`, `swish`) | mouvement de la première demi-seconde : 015 9,8 · 010, 013, 014 3,3 à 3,7 · 024 2,7 · 025 1,4 · 012 1,3 |
| 0,5 → 10 s | l'accroche : chaque phrase a sa démonstration ; le mot sur lequel elle se retourne **frappe** (`D.punch` + `hit` dans le souffle qui suit) | |
| 10 → 25 s | la scène est une **deuxième accroche** : un changement toutes les 2 à 3 s (un geste, une coupe, une étiquette, un mouvement de caméra) — **aucune plage lente de 2 s** (mouvement < 1) ; un son dans le souffle qui suit chaque mot-clé ; « Alors… on l'ouvre » dans un quasi-silence (`suck` puis `hush`) ; le clic de chaque pièce de l'éclaté | attaques qu'un téléphone entend, 0 → 25 s : 010 18 · 015 3 · 025 2 avant le 21/10, 21 après |
| portes d'acte | une coupe ou un changement franc d'échelle, et son coup (`hit`) dans le souffle | |
| fin | la question du commentaire : si c'est un choix que dit la voix, **`duelCall`** ; jamais la réponse tapée à la place du spectateur | commentaires TikTok : 0,5 pour 1 000 vues |

**Les dispositifs, une ligne chacun** (en option : sans eux, un film reste ce qu'il était, image et son à l'octet près) :
- `D.punch(t.mot, 0.06)` — **le mot qui frappe** : l'objectif se resserre de 6 % en 0,08 s, tient, relâche. Un par phrase au plus, sur son mot-clé (`*mot*`, `+mot+`), jamais deux à moins d'une seconde, **jamais sur une coupe** (il a relâché avant : `{ hold, down }` plus courts), jamais sur l'image 0.
- `glide(s0, s1)` (`@kit/direct.js`) — **la rampe de vitesse** de la première image : `shot(0, …, pose, glide(3, 0.5))` part à trois fois sa vitesse moyenne. **À vérifier à 0,3 et 0,7 s avec `look` : le sujet ne doit pas sortir du cadre** (essayé sur le 025 : le sanglier glissait hors champ à 0,7 s — pas gardé). Si la caméra suit un objet qui avance, c'est l'objet qui doit faire la rampe, pas la caméra seule.
- `D.captionStyle({ hit: 0.25 })` — **le mot-clé du sous-titre** arrive 25 % plus gros et se pose, à sa place (la ligne ne bouge pas). Une fois, n'importe où dans un acte (le modèle l'appelle dans `acte1.js`).
- `duelCall(tl, { from, aAt, bAt, to, toneA, toneB })` (`@kit/blocks.js`, balisage `#duel` dans `index.html`) — **la question du commentaire en deux réponses**, chacune allumée sur son mot (deux repères), le curseur qui attend sous « À toi ». Le film ne répond jamais à la place du spectateur (le 025 tapait « APRÈS » : c'est le « LES MASSES » du 022).
- Le son (`episode.json` → `sfx`, synthétisé par `scripts/sfx.mjs`, tout entre 600 Hz et 5 kHz : ce qu'un téléphone joue) : `hit` (le mot-clé, une coupe, un titre barré) · `click` (une pièce qui se pose, une lumière qui s'allume) · `swish` (un mouvement rapide de caméra) · `screech` (des pneus qui lâchent) · `suck` (la respiration avant « Alors… », elle s'arrête net) · `hush` (tout l'habillage recule de `depth` dB entre deux instants : le silence autour de la phrase signature, le temps arrêté) · `impact` + `crack` (le craquement à 2 kHz forcé, sinon un impact sous −14 dB est muet sur un téléphone).
- **Jamais un son sur un mot.** Un son se pose dans le souffle qui suit le mot qu'il ponctue (les trous de la voix : `npm run script` donne les mots, l'écart se lit entre deux mots) ; un son continu (`screech`) tient dans un souffle, pas sous une phrase. `npm run qa` liste « sons posés sur un mot » : la liste doit être vide pour tout ce que tu ajoutes. Mesuré sur le 025 : l'habillage est 2,5 dB plus bas sous les mots qu'avant, et 9,5 dB plus haut dans les souffles.

## Avant de rendre

`npm run check -- <ep>` ne montre aucune erreur qui vienne de ton acte.

## Ce que tu rends

Ton fichier, qui passe au build ; et un message final de **douze lignes au plus** : ce qui est monté ; les plans un cran en dessous, dits franchement, avec leur repère ; « À changer ailleurs » (lignes exactes) ; tes images lues. L'acte 2 propose en plus la couverture de grille : un repère, une pose (`el` ≥ 28) et l'état où tout le système est éclairé et où quelque chose luit.

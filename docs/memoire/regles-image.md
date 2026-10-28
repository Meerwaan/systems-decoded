# Règles d'image : « pour que ça ne fasse jamais amateur » et « net et fluide »

> Recopié tel quel de l'ancien `CLAUDE.md` le 2026-10-27, quand il a été resserré (copie intégrale : `CLAUDE-complet-2026-10-27.md`). Les règles en vigueur sont dans `CLAUDE.md` ; ce fichier garde le détail, les mesures et l'histoire. Les dates et les « aujourd'hui » sont ceux du texte d'origine.

Pour : tout agent de décor, de décorateur ou d'acte, et la relecture des planches. Chaque règle vient d'une image ratée.

---

**Pour que ça ne fasse jamais amateur** — chacune de ces règles vient d'une image ratée :

- Le sujet est l'élément le plus lisible du cadre : sombre **sur un halo de lumière**, ou clair sur sombre. Jamais sombre sur sombre.
- Un grand objet d'accompagnement (voiture, bâtiment) se fait aux rayons X, pas en « réaliste » : une carrosserie pleine modélisée vite ressemble à un jouet raté.
- Une couleur d'ambiance se tient **franche** : `mood` à 0 (veille) ou à 1 (signal). Un mélange à mi-chemin tenu plus d'une demi-seconde donne du kaki.
- Pour teinter une scène, `stage.grade.gel` (qui multiplie : les noirs restent noirs), jamais un voile coloré en CSS ; et jamais au-delà de 0,3 sur un objet clair, qu'il repeindrait.
- Le brouillard mange ce qui est loin : vérifier qu'un objet à 30 m se voit encore.
- Tout ce qui émet se dose à l'image : au-dessus de 3, ça bave.
- La caméra ne traverse pas un objet opaque ; elle peut traverser du verre.
- Une coupe se pose quelques images **avant** la phrase qui la motive.
- Une pièce faite de boîtes se lit par son **ombrage** : métal peu métallique (`metal` ≤ 0,5) et pas trop sombre. Un métal très métallique ne fait que refléter le studio, qui est noir : la pièce devient un trou bordé de traits (003, premier jet du parachute).
- Les faces usinées plus claires que la fonte, la pièce-héros (le coin) nettement plus claire que le reste : trois valeurs de gris, on comprend l'objet sans légende.
- Chaque pièce qui peut s'effacer (`setPartOpacity`) a **ses propres matières** : une matière partagée emporte les pièces voisines (le couvercle du 003 faisait disparaître les mâchoires).
- Un mécanisme se montre de trois quarts, jamais de face : de face, c'est un dessin au trait — exactement ce qu'on ne fait pas.
- Un éclair est une **lumière qui a un endroit** (une boule de lumière au point de rupture, qui gonfle deux images et meurt petite), pas un voile sur toute l'image : `#flash` au-dessus de 0,08 lave l'image en gris.
- Une boule de lumière se fait avec un dégradé (`softGlow` dans `shaft.js`) : une sphère additive unie se lit comme un disque plein dès qu'elle faiblit.
- Ce qui chauffe ou va céder a des **braises** qui tombent (`makeEmbers`, périodiques : vivantes dès la première image) ; ce qui frotte fait des étincelles lentes (`makeSparks`) — le film est au ralenti.
- Au ralenti, un objet dont **la vitesse est le sujet** (la poulie du limiteur) est montré à sa vitesse réelle de l'instant : ralenti quarante fois, il ne bougerait pas et la phrase « tu vas trop vite » n'aurait pas d'image.
- Le mécanisme suit **la voix** (« le coin remonte… et mord ») : on le pilote sur les mots, pas sur une cinématique exacte que personne ne peut vérifier — les chiffres affichés, eux, restent justes.
- Un grand angle (`fov` 50–60) vu d'en haut donne le vertige que le 28 mm écrase : c'est le cadre de l'accroche du 003. Les `cut()` remettent `fov` à 28.
- Pour qu'un mouvement reste près du sujet, écrire la pose d'arrivée avec un petit `d` (même point de vue, cible rapprochée) : la caméra interpole ses nombres, et un grand écart de `d` l'envoie se promener hors du décor.
- Un flux se dessine **clair sur un conducteur sombre** : des tirets larges, en centimètres (`mat.worldUnits = true`), sur un fil foncé. « Il en manque » = le fil du retour garde le même rythme avec des tirets plus courts. Des tirets fins sur du métal clair ne se voient pas.
- Une pièce qui s'ouvre (une palette, un clapet) se filme **de profil**, et on vérifie son sens sur deux images avant/après : la palette du 004 se repliait dans le relais sans que rien ne le signale.
- On choisit le côté d'où filmer l'établi en essayant quatre azimuts d'un coup (`look`) : le cœur du système au premier plan, rien devant lui.
- Le personnage de verre (`room.js` du 004 ; depuis le 005, `kit/lib/figure.js` : `makeFigure`, qu'on pose comme une marionnette — `reach`, `leg`, `lean` — et qu'on couche, agenouille ou fait courir en déplaçant son groupe, voir `hall.js` du 006) : chaque membre est taillé à sa longueur (étirer une capsule étire ses bouts ronds en pointes), la main a de vraies phalanges qui se referment. Un sol brillant vu en rasant devient une dalle grise en travers de l'image : sol mat dans une pièce.
- L'en-tête reste lisible quand un sujet clair passe derrière lui grâce à `#hud-shade` (un élément placé avant `#hud`, dans le modèle depuis le 004). Pas de `z-index` négatif : le lint le signale, à raison.
- Tout le premier acte en **un seul mouvement** (003 : la cabine → sous le plancher → les câbles → la plongée dans le vide → le parachute) : les coupes sont gardées pour l'acte 3, où elles font la tension.
- Un phénomène invisible (la réaction en chaîne du 005) ne se montre pas par une lueur : un mur orange « qui chauffe » n'explique rien. On lui donne sa petite scène — quelques objets qui font ce que dit la phrase, mot par mot (`src/chain.js` : des noyaux gris, un neutron arrive, le premier se brise, deux neutrons repartent, puis 2, 4, 8, 16) — et le décor s'éteint derrière (`glow` et `shell` baissés) pour la laisser lire.
- Beaucoup d'objets identiques (57 barres) vus de loin font une dalle grise. Ce qui leur rend un volume : plus sombres côté opposé à la caméra, un jour visible sous elles, la lumière de ce qu'elles surplombent sur leurs extrémités — et leur détail (les crayons) dessiné dans le shader avec `fwidth`, qui le fond en gris moyen dès qu'il passerait sous le pixel.
- Passer de « toutes » à « une » : les autres s'éteignent (un attribut par instance, `aHero` / `uOthers`), la caméra vole jusqu'à celle qui reste, et la coupe vers l'établi raccorde sur **la même lumière** — sur l'établi, la pièce porte un instant la même coque lumineuse (`coilGlow`), qui se dissout. Le raccord tient sans construire le modèle deux fois.
- Un objet tout en hauteur, aux pièces coaxiales, s'éclate mal : la vue éclatée est une colonne maigre. On l'ouvre en soulevant **une** pièce (la bobine), et chaque pièce a son plan sur son mot, avec un geste qui montre à quoi elle sert (les cliquets s'écartent, puis « pincent » : le film a déjà montré le geste quand il le rejoue pour de bon à l'acte 3).
- La couleur raconte l'action : dans le cœur du 005, le vert des barres (vues à travers le combustible, `ghost`) descend à mesure que l'orange s'éteint. On comprend la chute sans lire un chiffre.
- Ce qui monte derrière l'en-tête (tubes, tiges) se **fond dans le noir** avant de l'atteindre : un objet clair qui traverse le HUD fait échouer le contraste des libellés.
- Une étiquette (`chip`) qui suit un point de la scène sort du cadre dès que la caméra voyage : pendant un mouvement, elle prend une place fixe dans la zone haute (`follow(id, null, 96, 470)`). Et `.chip--live` est couleur signal : pour une étiquette veille ou encre, fixer la couleur par son identifiant.
- Un décor aux rayons X n'a pas de sol plein : vu d'un balcon, c'est une bande grise en travers de l'image (005, Chicago). La grille seule dit où est le sol.
- Deux panneaux qui redisent la voix n'ont pas leur place sur le sujet : si « toi, lu comme un système » doit entrer pendant l'accroche, le sujet lui fait de la place (il glisse à droite, le panneau prend une colonne étroite à gauche).
- Un lieu vu **de dessus** (le hall du 006) est un dessin au trait : une échelle et un pointillé. « Ici, là-bas, trente mètres entre les deux » se montre d'un point haut **en perspective**, grand angle, depuis derrière le sujet : les personnages debout donnent l'échelle, le chemin au sol file vers le fond.
- Une lumière vue de loin (la boîte verte) a un **cœur brillant et une longue traîne** (`halo()` dans `hall.js`). Une sphère qui s'éteint régulièrement du centre au bord se lit comme une boule collée au mur.
- **De près, les personnages sont en verre de la tête aux mains** (`ghost`, basculé sur une coupe ; les aidants plus pâles que la victime) : il ne reste de plein que ce dont parle la phrase — le cœur, les électrodes. Des têtes et des mains pleines penchées sur un torse, c'est un tas de boules. Et on ne montre pas trois personnages de verre les uns sur les autres : la chute du 006 a d'abord été « les deux aidants penchés sur la victime », illisible ; c'est devenu **le même cadre que le choc** (les deux électrodes, le cœur entre elles), où tout a changé de couleur.
- Les mains d'un personnage : `makeFigure({ hands: "flat" })`, une moufle qu'on oriente (`reach(…, { dir, palm })` : le talon de la main sur le sternum, une paume sur une électrode). Une boule au bout d'un bras, en gros plan, reste une boule.
- Ce que le personnage pose se déplace **avec sa main** : l'électrode part de devant lui, sa main dessus, et se colle. Un objet qui arrive seul à côté d'une main qui ne le tient pas, c'est une animation de menu.
- Un objet posé sur du verre (une électrode sur le torse) ne porte **pas d'ombre** : elle traverse le corps et tombe au sol, en rectangle sombre que personne ne sait placer.
- Un titre posé sur un sujet clair (la chute sur le torse éclairé en vert) se fait porter par une ombre : `#title-shade`, sous le HUD, comme `#hud-shade` porte l'en-tête.
- Les figurants : personne devant le sujet ni devant ce que promet la première image (un passant masquait la boîte verte), personne sur le trajet de la caméra.
- Un personnage qui part en courant au bord du cadre ne se voit pas. « Toi : la boîte. » a son plan (006) : de derrière toi, debout, l'étiquette au-dessus de la tête, le chemin au sol qui part de tes pieds, la boîte au bout, le témoin au travail à côté — tout ce qu'on te demande en une image, puis tu pars.
- Deux pièces voisines nommées à la suite (« une batterie, un condensateur ») tiennent dans **un** cadre : à moins d'une seconde par mot, un plan par mot ne laisse aucun temps d'arrêt. C'est ce qui s'allume (le condensateur qui se charge) qui dit de quel mot on parle.
- Ce qui est posé sur une pièce qui s'efface (le bouton, le voyant, le sigle sur le couvercle) est inscrit dans les matières de cette pièce (`part.userData.part.mats`) : un `lid.add(mesh)` tout nu laisse un bouton rouge flotter seul au-dessus de la carte.
- La zone haute se partage dans le temps, au dixième de seconde : le compteur du choc s'en va quand le tracé revient, le verdict de la puce reste jusqu'à la coupe du choc et la charge se compte à côté du bouton. Et rien d'un plan ne déborde sur le suivant : un titre ou un panneau a fini de sortir **avant** la coupe.
- Un décor qui ne tient pas dans un cadre vertical avec son sujet (008 : une maison de 8 m et un éclair qui se joue 60 m plus haut) devient une **maquette à l'échelle du sujet** : le nuage à 60 m, des bonds de 3 m, la jonction à 4 m de la pointe. Aucune hauteur ni longueur ne s'affiche alors sur ce décor, la voix donne les vrais ordres de grandeur, `sources` le dit — et pendant la phrase qui donne un chiffre (« par bonds de cinquante mètres ») le sujet qui servirait d'échelle sort du cadre.
- Un éclair n'est jamais un trait : chaque tronçon est une capsule avec un cœur, une gaine et un halo, large selon sa distance, et les tronçons se recouvrent en « le plus clair gagne » (pas de perle aux coudes) — `008/src/bolt.js`. Le bond qui vient de tomber est chauffé à blanc, les anciens retombent à leur couleur.
- Trois couleurs qui racontent un phénomène : la menace qui descend en signal, ce que le système envoie à sa rencontre en veille, et l'instant où ils se touchent en blanc. On comprend la jonction sans légende.
- Un système tout en longueur et tout en finesse (une tige, un fil, un piquet) s'ouvre **en rangée, en travers de la caméra**, pas en colonne : les pièces sont deux fois plus grosses à l'image. Et sous un panneau d'appel à l'action, on s'en approche jusqu'à ce qu'il occupe la moitié de la largeur.
- « Ça grimpe », « ça descend » : il faut **une tête de lumière qui avance** (`climb`, `flow` dans `008/src/model.js`), pas un fil qui s'allume d'un coup. Et quand la caméra court le long d'un conducteur à tirets, les tirets se fondent en trait plein (`dash` → 0) et le décor frôlé s'éteint : sinon, un sucre d'orge sur une dalle grise.
- Un « et si rien n'agissait » (la maison sans paratonnerre) a besoin de sa cause à l'image : sans canal dans le ciel, « la foudre entre par ta cheminée » était le plan le plus faible de l'acte — un canal déjà frappé, du nuage à la cheminée (`hit`), l'a réglé.
- Des réponses trop petites pour être nommées une à une (des filaments de 2 m dans un plan large) : on les allonge avant de resserrer le cadre — ce que la voix nomme fait au moins 150 px.

**Net et fluide, tout le temps.** Merwan a vu un rendu scintiller : « c'est pas pro ». `npm run qa` compte désormais les images parasites (l'image saute et revient) et situe les mouvements heurtés ; un rendu ne se livre pas avec une image parasite non voulue. Ce qui scintillait, et la règle qui en sort :

- Un pixel impossible (NaN) sorti d'un shader : le bloom l'étale en dalle noire pendant une image. Dans un shader, **borner avant `pow`, `sqrt`, une division** (`pow(clamp(x, 0.0, 1.0), p)`). Le plateau filtre maintenant ces pixels, mais on corrige la source.
- Des lignes fines qui défilent vite (grille, rayons de roue, pointillés) sautent d'une image à l'autre : étaler la grille sur sa course (`grid.uSmear`), ne pas dessiner de détails fins qui tournent, pas de trait sous 1,8 px.
- Des points qui filent (poussières, braises) : les dessiner en traînées (`motes.update(t, px, streak)`), pas en points.
- Des surfaces presque confondues vues de loin se battent : espacer les couches du sol (`makeSurface({ lift })`).
- Une lueur qui clignote plusieurs fois par seconde se lit comme un défaut : une respiration lente, ou rien.
- Un objet lumineux que la caméra frôle pendant un mouvement rapide remplit une bande de l'image pendant une image : ce qui ne sert pas au plan est **invisible**, pas seulement éteint (003 : les deux traits du seuil pendant la plongée).
- Des pointillés traversés vite deviennent un « sucre d'orge » : un trait plein dessous, et les tirets s'effacent pendant le mouvement (`S.dashes`).
- Les longs trajets de caméra en `power2.inOut` ou `sine.inOut` : `power3` passe au milieu trois fois plus vite que la moyenne.
- Des tirets **qui courent** (le courant dans un fil) avancent d'au plus un septième de leur période par image : à une demi-période, ils sautent d'une place à l'autre et `qa` signale une rafale d'images parasites (004 : 9 cm/s pour des tirets de 0,64 cm → 2,6 cm/s).
- Un motif rayé (la rangée de disjoncteurs) que la caméra traverse vite fait le même effet : glisser dessus lentement, pendant toute la phrase.
- Une plongée ou un long recul : la distance change **par rapport, pas par centimètres** — `shot(at, durée, pose, ease, fromD)` dans le `main.js` du 006 — et le point visé suit la distance. En centimètres, le dernier mètre d'une plongée passe en trois images, et le sujet sort du cadre au milieu du trajet (une demi-seconde d'image vide).
- Reculer depuis un détail **sans le lâcher** : la pose d'arrivée vise le même point, le cadrage se fait au `shift` (jusqu'à 490 px : un objectif à décentrement). Puis `reaim(pose, d)` donne la même image, visée de près : le mouvement suivant part de là au lieu d'envoyer la caméra hors du décor.
- Un figurant de verre frôlé en plein vol = une image parasite (`qa` : 8,13 s). On le déplace.
- Un mouvement qui ferait tourner la caméra de plus d'un quart de tour en une seconde (de la boîte au sol jusqu'au torse) est une **coupe**.
- `qa` classe aussi comme « heurtés » un geste rapide en gros plan (les mains qui arrivent sur le sternum) ou une pièce qui s'efface : regarder l'instant avant de corriger la caméra.
- Un brouillon **sans voix** se rend et se contrôle (`render --draft`, `qa --file`), mais son niveau est faux — le fond seul remonté à −14 LUFS, +19 dB : à Merwan, on l'envoie muet (`renders/<ep>-apercu-muet.mp4`, 720p).

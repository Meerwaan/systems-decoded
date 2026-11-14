# 052 — ce que les décors ont changé (à lire avant les actes)

- POSE0 = candidate « A3 contre-plongée, toi assis » (az −72, el −14, d 800, ty 200) ; FIRST passe à rider 1, sit 0.7, sway 0.5 : tu es en train de t'asseoir quand le siège arrive. Note 4/6 : il manque la menace rouge et la pince est petite — acte1 doit faire bouger le sujet dès l'image 1 (siège qui arrive, pince qui s'ouvre sur la came) et faire lire la pince (veille) ; la pente en signal derrière si possible.
- VIEW recalées par les décors : wheel, tyres, principle, came, weigh, run, wide (az −100, de derrière la poulie), garage (gare.js) ; quay, exit, steep (ligne.js) ; whole et exploded vus de l'avant az +30 (model.js : de l'arrière, l'oreille et le levier cachent les mors).
- Pince : ouvert / fermé se lit mal à 270 px de trois quarts → le vide pince-câble se montre dans la gare avec `free` ; `weak` se dit par le liseré signal du ressort (le jour de 2 mm ne se voit pas). Poses de gare grip, jaws, still, came non vérifiées avec la vraie pince : à juger sur planche.
- Câble : à 5 m/s les torons deviennent unis (pas de scintillement) ; le défilement se lit par la poulie et les pneus. Plan `still` : `vrope: 0` passé à station.update si la caméra suit la pince. Plan serré sur câble en mouvement : court.
- Jauge de pesage suspendue au toit [1240, 425, 430] ; jamais de vert absolu (bande rouge jusqu'à ok, rail vide ink).
- `greens` (ligne.js) : front de pinces allumées depuis la bouche ; `pull` : flèche rouge vers le bas, verte vers le haut (comment).
- Sol de verre de ligne.js : peut barrer certaines vues de gare d'un coin blanc — estomper `line` dans la gare.

## 14/11, après l'habillage (chef 2)
- Image 0 rejugée (planche .cache/planches/052/image0f.jpg, « H ») : POSE0 3/4 avant bas sur la pince (az −115, el −14, d 520, ty 270) ; la pince ouverte, ses pneus et le ressort en signal (`weak: 1` dès l'image 0 = la menace) lisibles à 270 px. FIRST : free 0.6, weak 1, line 0.3. Note 5/6 : toi n'est pas dans le cadre ; acte1 fait bouger la pince dès l'image 1 (galet sur la came, mors qui s'écarte, siège qui balance) puis recule vers toi assis.
- Habillage (src/habillage.js, `dressLine`) : `st.line = 0.3` à chaque coupe sur un plan intérieur de gare (quay, wheel, tyres, jaws, grip, still, came, weigh, run), `line: 1` dès la bouche (exit) et dehors ; sinon le sol de verre se voit à travers la gare.
- `weak` revient à 0 quand le récit dit que la pince serre bien (acte1/acte2 le décident sur la voix) ; il se rallume à « … mal ».

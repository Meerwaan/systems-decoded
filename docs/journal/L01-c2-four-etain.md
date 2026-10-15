# L01 — `src/c2-four-etain.js` (02 Le four + 03 Le bain d'étain, 47,5 → 133,5 s) — journal

2026-10-15. Propriétaire : `episodes/L01-pare-brise/src/c2-four-etain.js` seul. `npm run check -- L01` passe (0 erreur ; les avertissements viennent des shaders et d'un bord de canevas hors de mon temps).

## Lu

`docs/L01-actes.md` (le haut, c2), `docs/recette-actes.md`, `world.js` (FIRST, AT, VIEW, onLine, span, run), `plan.js`, `main.js`, `kit/lib/direct.js`, `kit/lib/long.js` (`fact`), journaux `usine`, `verre`, `integration`, `casse` (les lames sur la ligne).

## Ce qui est monté

- **02 Le four** — coupe sous la carte au ras du quai vide, vu de l'amont, fouet latéral (0,85 s, `expo.out`) sur la rangée des tas, le four qui luit au bout ; travelling lent le long des tas, un tas par mot (`batch` 1 → 5 sur sable, soude, calcaire, dolomie, calcin). « Tout tombe » : la caméra monte en contre-plongée sur la trémie, `charge` 0 → 1 (le filet tombe dans la voûte). « 1 500 » : `temp` 1 500 / `tempOn` 1, la voûte s'embrase (`melt` 0,6 → 1), la caméra bascule dans le four. Dolly le long de la voûte (fact PLUS DE 1 200 T, signal, sorti avant ORANGE), puis travelling jusqu'à la gorge sur « couler ». « Plate » : glissé rasant sur la langue ; « polissait » : le long du bord ; « des deux côtés » : un S, au ras de la tranche puis plongée au-dessus.
- **03 Le bain d'étain** — coupe très haut, fouet en plongée sur tout le bain (`step` 2, 1 100 °C). Descente lente vers la lèvre où la langue tombe sur l'étain (« verser », fact 1952 · ALASTAIR PILKINGTON après la carte), puis au ras du miroir sur « métal liquide ». Travelling latéral le long du ruban et de ses molettes (fact 1960). Coupe sur « Alors le verre flotte » : de profil, au ras de l'étain ; « s'étale » : remontée vers la gorge, la langue qui s'élargit ; « plane » : glissé rasant en travers. « toute la plage » : un seul long travelling d'un bout du bain à l'autre, puis poussée lente sur l'étain calme (« ne bout pas »). Coupe sur « trois à quatre mètres » : en travers, en plongée (fact 3 À 4 M), retour vers l'entrée, puis la caméra suit le ruban jusqu'aux rouleaux, l'en-tête 1 100 → 600. « Au-dessus » : montée au-dessus de la hotte. « La vitesse » : plongée au profil, les molettes qui tiennent le bord tournent plus vite (`pull` 0 → 1 → 0, fact 0,5 MM → 2,5 CM). « 370 lignes » : grand recul par rapport jusqu'à voir four, bain et étenderie (fact ≈ 370 LIGNES). « lames » : plongée vers le bout de la coupe, `plain` 1, l'en-tête 600 → 20 au-dessus de l'étenderie ; « casse » : `blades` 0,12 puis → 1, les lames retombent sur les rouleaux ; la caméra continue de tourner autour pendant la coupure pub.

## Ce qui a raté et pourquoi

- Planche 1 : de trop près, le verre chaud est une dalle orange (la voûte à d 520, la langue à d 420, la tranche à d 150). Les plans du ruban tiennent à moyenne distance (d ≥ 500) avec les molettes et la hotte dans le cadre.
- Planche 2 : la tranche au bout froid de la ligne (x 5 000) est illisible — la caméra est dans les rouleaux de l'étenderie, le ruban de 1 cm ne se voit pas. Abandonnée : « la vitesse » se montre au profil, par les molettes.
- Planche 3 : « des deux côtés » (d 300 → 560) remplissait le cadre d'orange ; « au-dessus » DANS la hotte faisait une barre blanche en travers. Le premier refait et revu (bon), le second refait au-dessus de la hotte, de dehors (non revu).

## Plans un cran en dessous

- `plat:plate` (69,5 s) : la langue au premier plan reste un bloc orange épais ; refait plus loin (d 760, el 8), non revu.
- `azote` (112,7 s) : la hotte vue de dehors, non revue après correction.
- `azote:vitesse` → `centimètres` (117,7 → 122,9 s) : l'amincissement lui-même ne se lit pas (la tranche fait quelques pixels) ; ce sont les molettes qui accélèrent et le fact qui portent la phrase. Le geste « en coupe » du plan n'existe pas.
- `flotte:flotte` (93 s) : de profil, le ruban est une bande mince ; le « jour » entre le ruban et son reflet ne se voit pas.
- `pourquoi:bout` (102,8 s) : le miroir d'étain calme se lit comme une bande sombre, sans reflet notable.
- L'en-tête reste à 600 °C pendant le profil des molettes (x ≈ 2 050, plus chaud en vrai) et à 20 °C pendant le grand recul.

## À changer ailleurs

- (`verre.js`) pour que « plus on tire vite, plus le verre est fin » ait une image : une coupe lisible du bord du ruban à chaud (une tranche épaissie à l'écran, ou un trait encre sur la face de la tranche) ; aujourd'hui 1,15 → 0,48 cm ne fait que quelques pixels à d 270.

## Images lues : 26 / 26 (planches de 8, 8, 8, 2)

## Reprise (relecture de celui qui orchestre : la plaque blanche à 68,7 et 97,5 s, l'aplat orange)

- **La plaque blanche** : c'est le reflet de la bande froide du studio (`stage.js · studioEnvironment`, panneau `[8, 3, -7]`, recopié par `verre.js · ENV[1]`, poids 4,5 dans `envSpec`) dans le ruban, plat comme un miroir. Il apparaît dès que la caméra regarde vers +x / −z (az ≈ −30 à −70 en rasant). À 113,7 s, une seconde bande venait de la « bande de photographe » (`envView`), qui suit la caméra, pour une élévation d'environ 27°. Corrigé par les poses : tous les plans sur le ruban sont maintenant à az ≥ −15 (ou ≈ −86, dans l'axe de la ligne) et hors de el 22–32. Revu à 68,9, 95,8, 97,5 et 113,7 s : plus de plaque (une traînée douce reste à 113,7 s).
- **L'aplat** : les plans s'éloignent (d 700 → 1 100) et changent de côté (vus de l'aval, az 16–64, avec le four qui luit au fond ; plongées à el 34–42 avec la hotte et les molettes). Plus d'un cadre garde quand même la moitié de l'image en orange (la lèvre à 80,6 s, la langue à 95,8 s, le ruban vu de l'amont à 110,5 s, avant le recul).
- À changer ailleurs (`verre.js`, ligne 253) : `+ vec3(0.92, 0.95, 1.0) * 4.5 * rectHit(r, uE1c, …)` → un poids plus bas pour le ruban seul (par exemple `* (uRibbonMode ? 1.2 : 4.5)`), pour que n'importe quel angle soit permis sur le verre chaud.
- Images lues pendant la reprise : 10 (9 + 1).

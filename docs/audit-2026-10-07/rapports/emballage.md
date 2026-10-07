# Audit « emballage » — Système Décodé (07/10/2026)

Périmètre : couvertures, avatar, nom / @ / bio, bloc `post` des six dossiers, logique de série, ce qui manque autour des vidéos.
Verdict : l'emballage est **cohérent mais muet**. Il est beau pour quelqu'un qui connaît déjà le compte ; il ne dit rien à celui qui arrive par la recherche ou qui ouvre le profil trois secondes. Quatre défauts mesurés : (1) quatre épinglés sur six ne tiennent pas dans un commentaire TikTok, dont celui que le film 005 promet à voix haute ; (2) le nom du sujet manque dans quatre légendes sur six, et « défibrillateur » n'est ni dit ni écrit dans le 006 ; (3) la grille, à sa taille réelle, est six fois la même vignette vert sombre, sans numéro lisible ni promesse ; (4) rien ne ramène un spectateur vers les autres dossiers.

## 1. À coller tel quel — 005 et 006 (gratuit)

### 005 — `episodes/005-arret-urgence/episode.json`
```json
"title": "Réacteur nucléaire",
"post": {
  "caption": "Réacteur nucléaire : pour l'arrêter, pas de gros bouton rouge. On coupe le courant, et plus de mille tiges tombent dans le cœur en 2 secondes. Dossier 005 : l'arrêt d'urgence d'une centrale nucléaire. Et une fois arrêté, il chauffe encore combien de temps, à ton avis ?",
  "hashtags": ["#nucleaire", "#centralenucleaire", "#physique", "#apprendresurtiktok", "#systemedecode"],
  "pinned": "Réponse : des années. 1 seconde après l'arrêt, le cœur dégage encore environ 7 % de sa puissance. 1 heure après : 1,5 %. Tu aurais dit combien ?",
  "replies": [
    "La réaction en chaîne est arrêtée, mais les atomes déjà cassés chauffent encore. On refroidit sans relâche : la cuve, puis des années en piscine.",
    "Dossier précédent : 004, ce qui coupe le courant avant ton cœur. Le suivant est accroché à un mur, sur ton trajet. Tout est sur le profil."
  ],
  "followup": "Le dossier 006 est en ligne : la boîte verte accrochée au mur, celle dont tu n'oserais pas te servir. Il est sur le profil.",
  "shorts": "Comment un réacteur nucléaire s'arrête tout seul en 2 secondes"
},
"cover": { "at": 0.6, "title": ["Réacteur", "nucléaire"], "hook": "Une *panne* suffit à l'arrêter",
           "cam": { "tx": 30000, "ty": 170, "tz": 0, "d": 8600, "az": 30, "el": 30, "fov": 28, "shift": -330, "side": 0 } }
```
- Longueurs mesurées (`compte2.mjs`) : légende 269 ; épinglé 144 ; réponses 145 / 138 ; suite 123 ; toutes ≤ 150.
- **Pourquoi l'épinglé garde la réponse** : la voix dit « La réponse est épinglée » (73,2 s) et le sous-titre l'écrit en orange (`frames/005/film_10.jpg`, vignettes 2 à 4). L'épinglé actuel fait 353 caractères : il ne peut pas être posté.
- **Titre** : « Arrêt d'urgence » ne dit pas « nucléaire ». Le mot qui claque n'est ni sur la couverture ni dans l'en-tête du film. `title` alimente l'en-tête (`scripts/build.mjs:29`) : un `render` + `qa` à refaire, sans voix. Le dossier garde son nom de dossier `005-arret-urgence`. À vérifier sur une image `look` : « RÉACTEUR NUCLÉAIRE » (18 lettres) tient à gauche du chrono.
- Pose de couverture : celle de la maquette `m005_a.png` (d 7000, shift −200) fait mordre « NUCLÉAIRE » sur la couronne verte (y ≈ 890–940) ; d 8600 / shift −330 est une estimation, à régler avec `npm run look -- 005 --file`. Cible : la cuve entre y 930 et 1 440.

### 006 — `episodes/006-defibrillateur/episode.json`
```json
"post": {
  "caption": "Défibrillateur : comment ça marche, et pourquoi tu ne peux pas te tromper. La boîte verte se teste seule chaque jour, te dicte chaque geste, et refuse de choquer un cœur qui bat. Arrêt cardiaque : appeler le 15, masser, défibriller. Dossier 006. La plus proche de chez toi, elle est où ?",
  "hashtags": ["#defibrillateur", "#arretcardiaque", "#premierssecours", "#apprendresurtiktok", "#systemedecode"],
  "pinned": "La plus proche de chez toi, elle est où ? Mairie, gare, pharmacie, salle de sport… Tu ne sais pas ? Dis-le aussi : la suite est en réponse.",
  "replies": [
    "Le jour où ça arrive, pas besoin de le savoir : appelle le 15 ou le 112. L'opérateur voit les défibrillateurs déclarés autour de toi et te guide.",
    "Dans l'ordre : appeler, masser, puis la boîte. Elle parle et te dit quoi faire, et elle ne choque jamais un cœur qui bat.",
    "Pour la repérer dès aujourd'hui, sans appeler personne : les applis gratuites Staying Alive et SAUV Life les montrent sur une carte.",
    "Dossier précédent : 005, le réacteur nucléaire qui s'arrête tout seul en 2 secondes. Il est sur le profil."
  ],
  "shorts": "Défibrillateur : comment ça marche, et pourquoi tu ne peux pas te tromper"
},
"cover": { "at": 83.0, "title": ["Défibrillateur"], "hook": "Elle *arrête* le cœur. Il repart seul.", "cam": { "shift": -260 } }
```
- Longueurs : légende 287 ; épinglé 139 ; réponses 145 / 121 / 132 / 106.
- L'épinglé ne donne plus la réponse : il pose la question du film et autorise « je ne sais pas » (un commentaire facile à écrire). Les faits passent en réponses, repliées sous lui.
- Couverture : la maquette `m006_a.png` (83,0 s : le panneau cœur-éclair et l'armoire verte) se reconnaît sans lire le titre. **Défaut à corriger** : un trait vertical clair traverse le titre vers x ≈ 500 (le « L » de DÉFIBRILLATEUR). Tourner `az` de quelques degrés ou monter le voile haut (voir § 2).
- **Option voix (reprise_voix, ≈ 40 crédits, à décider avec la reprise de l'accroche)** : le mot « défibrillateur » n'est jamais prononcé (`timing/script_006.txt` : seulement « boîte verte » et « elle »). Candidat le moins coûteux : `chaine` → « Un témoin appelle le 15 et masse. Toi : le défibrillateur. » (22,7 s ; « Alors… on l'ouvre » enchaîne sans changer de genre). Le plan « Toi : la boîte » et son étiquette sont à recaler.

## 2. Couvertures — `scripts/cover.mjs:12-24`

Constat à 130 px de large, la taille d'une vignette de profil (`grille_3x4_130.png`, `grille_3x4_360.png`) :
- « DOSSIER 00X » est en 46 px → 5,5 pt dans la grille. La numérotation, qui est toute la logique de série, ne se lit pas.
- « SYSTÈME DÉCODÉ » (36 px → 4,3 pt) répète le nom affiché juste au-dessus de la grille, et prend 110 px.
- Six vignettes du même vert sombre. Aucune couleur signal dans toute la grille : la menace, moitié de chaque histoire, n'y existe pas.
- Sombre sur sombre : 006 est une dalle noire, 003 des barres sombres, 005 une tige grise qu'on prend pour une vis. Sans lire le titre, on ne sait pas ce qu'on regarde.
- Le titre nomme l'objet, jamais la promesse. « DIFFÉRENTIEL » et « ARRÊT D'URGENCE » ne sont pas des mots que les gens tapent.
- En face (`compare_130.png`) : la cuve au cœur orange (005, 0,6 s), l'armoire verte (006, 8,3 s et 83,0 s) et la cabine de verre au point rouge (003, 1,5 s) se lisent d'un coup d'œil.

Proposition (reprend `maquette.mjs` de la première passe, lecture seule) :
```css
/* :15 — voile haut un peu plus dense, plus un voile bas pour la promesse */
#cover .shade  { background: linear-gradient(to bottom, rgba(7,10,12,.96) 0, rgba(7,10,12,.78) 32%, rgba(7,10,12,0) 48%); }
#cover .shade2 { position:absolute; left:0; right:0; top:1130px; bottom:0;
                 background: linear-gradient(to bottom, rgba(7,10,12,0) 0, rgba(7,10,12,.8) 38%, rgba(7,10,12,.95) 100%); }
/* :17 */ #cover .lock { left:84px; right:84px; top:396px; }
/* :18-19 — le numéro devient le signe : 92 px = 11 pt dans la grille ; le point vert disparaît */
#cover .tag   { display:flex; align-items:baseline; gap:24px; font:500 38px/1 var(--mono); letter-spacing:.18em; text-transform:uppercase; color:var(--ink-dim); }
#cover .tag b { font:800 92px/.78 var(--mono); letter-spacing:0; color:var(--veille); text-shadow:0 0 34px rgba(92,255,176,.45); }
/* :23 — .brand supprimée */
/* nouveau — une ligne de promesse, deux lignes au plus (≤ 44 caractères) */
#cover .hook    { position:absolute; left:84px; right:84px; bottom:380px; font:700 88px/.98 var(--display); text-transform:uppercase; color:var(--ink); text-shadow:0 2px 26px rgba(7,10,12,.95); }
#cover .hook em { font-style:normal; color:var(--signal); }
#cover .hook b  { font-weight:700; color:var(--veille); }
```
`cover.mjs:58` : `<div class="tag"><span>Dossier</span><b>${id}</b></div>` ; après le `.lock`, `<div class="hook">` construit depuis `cfg.hook` avec les mêmes marques que les sous-titres (`*mot*` signal, `+mot+` veille).

Règles :
- **L'image de couverture est la première image du film**, pas la vue éclatée. C'est par règle la plus forte, elle porte la couleur signal, et la vidéo s'ouvre sur la même image quand on tape la vignette. Budget vertical dans le recadrage 3:4 (y 240 → 1 680) : numéro 396–470, titre 500–890 (deux lignes) ou 500–700 (une), sujet 930–1 440, promesse 1 360–1 540. Rien de lisible sous 1 565 (compteur de vues, en bas à gauche).
- Le titre est le mot courant : « Réacteur nucléaire », pas « Arrêt d'urgence ».
- Promesses : 005 « Une *panne* suffit à l'arrêter » (28 car.) ; 006 « Elle *arrête* le cœur. Il repart seul. » (36) ; 007, si le siège éjectable est validé, « Dehors en une demi-seconde » (26).
- **Non vu en image** : `m005_a.png` et `m006_b.png` montrent le nouveau cartouche sans la ligne de promesse. Avant d'adopter, sortir deux couvertures et les regarder à 130 px. Si la promesse n'est pas lisible à cette taille, on garde le numéro et l'image, sans elle.
- Cela change la règle écrite dans CLAUDE.md (« toujours … vue éclatée ») : **décision de Merwan**, sur deux grilles côte à côte.
- À vérifier sur son iPhone : le badge « Épinglé » se pose en haut à gauche des trois vidéos épinglées, là où se trouve la ligne du numéro.
- 001–004 : la couverture se choisit à la publication (« Modifier la couverture » → « Importer »). Les sources se contredisent sur le changement après coup : regarder dans l'app (••• → « Modifier la publication », 7 jours). Sinon elles restent telles quelles et descendent dans la grille.

## 3. Profil (decision_merwan)

- Bio actuelle (70 car.) : « Ils veillent pendant que tu dors.⏎On les décode, un système à la fois. » Le ton est juste, mais « Ils » n'a pas d'antécédent pour qui arrive à froid, et rien ne dit le format (3D), le sujet (ce qui te protège) ni le rythme.
- **B (72)** : « Airbag, ascenseur, défibrillateur…⏎Ce qui te sauve la vie, ouvert en 3D. » — la plus claire en trois secondes.
- **E (71)** : « Airbag, ascenseur… ils veillent sur toi.⏎On les ouvre en 3D, un par un. » — garde « ils veillent ».
- **A (75)** : « Ils veillent pendant que tu dors.⏎On les ouvre en 3D : un dossier par jour. » — seulement si le rythme est tenu.
- Nom, @, avatar : rien à changer. L'avatar tient à 40 px (`brand/avatar-controle.png` : un point vert entre deux arcs, sur noir comme sur blanc).
- Trois vidéos épinglées en haut du profil : à choisir sur chiffres (la plus vue, la plus finie, la plus récente).

## 4. Dossiers 001–004 : légendes encore modifiables (decision_merwan, c'est lui qui le fait dans l'app)

« Modifier la publication » permet de changer légende et hashtags pendant 7 jours, une fois par jour (sources secondaires) : 001 jusqu'au 12/10, 002–004 jusqu'au 13/10. Les films ne bougent pas.
- 001 : « Ton détecteur de fumée n'a jamais vu de fumée de sa vie. C'est pourtant lui qui te réveille à 3 h du matin, quand ton nez dort. Dossier 001. Et toi, ton dernier test, c'était quand ? »
- 002 : « Un airbag t'explose au visage à 300 km/h. Et ce qui te sauve, c'est qu'il se dégonfle déjà. Dossier 002. Tes mains, elles sont où sur le volant ? »
- 003 : « Ascenseur : le câble casse, et tu ne tombes pas. Ce qui te retient n'est pas un câble, et ça date de 1854. Dossier 003. Toi, tu sauterais au dernier moment ? »
- 004 : « L'interrupteur différentiel 30 mA : ta main se referme sur le fil, et c'est lui qui coupe à ta place, pas ton disjoncteur. Dossier 004. Sur ton tableau électrique, tu lis 30 mA… ou rien ? »
- Épinglés 003 (254 car.) et 004 (339) : demander à Merwan ce qu'il a réellement posté. Versions ≤ 150 : 003 « Sauter ne sert à rien : tu arrives à près de 100 km/h, un saut t'en enlève une dizaine. Et en chute libre, tu n'as aucun appui. Tu y croyais ? » (142) ; 004 « Tu lis « 30 mA » sur un module à bouton T : c'est lui. Appuie sur T une fois par mois, il doit couper net. Tu as lu quoi, toi ? » (127), puis en réponse « Tu ne lis que « 500 mA » (le disjoncteur d'abonné) ou rien du tout ? Rien ne te protège de l'électrocution : fais venir un électricien. » (135).

## 5. La série jusqu'au bout : routine de publication (gratuit)

Ce qui existe : le panneau « PROCHAIN DOSSIER · 00X — CLASSÉ — S'ABONNER POUR L'OUVRIR » (`cta_abo_006_005.png`, 005 à 78,9 s, 006 à 79,6 s). Il fait office d'écran de fin sans casser la boucle : ne pas ajouter de carton.
Ce qui manque : aucun lien arrière (qui finit le 006 ne sait pas que cinq dossiers l'attendent), « Dossier 00X » dans aucune des six légendes, et les playlists sont fermées sous 10 000 abonnés environ.

Routine à afficher dans le front, sous le bouton copier :
1. Publier avec la couverture importée, la légende, les 5 hashtags.
2. Poster l'épinglé, l'épingler, poster les `replies` dessous dans l'ordre.
3. Rester 60 min : répondre à chaque commentaire (une réponse = une notification).
4. Retourner sur le dossier précédent : poster `followup` sous son épinglé, et répondre aux gens qui y avaient commenté : « Le dossier promis est sorti : la boîte verte accrochée au mur. Il est sur le profil. » (84 car.). C'est la seule notification gratuite vers des gens déjà conquis.
5. Noter l'heure de publication dans CLAUDE.md.
- `#systemedecode` sur chaque vidéo : tant qu'il n'y a pas de playlist, c'est la seule page cliquable qui rassemble les dossiers.
- **Avant de publier le 006** : faire valider le 007. Le film l'annonce (77,4 s) et un film publié ne se corrige pas.

Cadence (decision_merwan) : 002, 003 et 004 sont sortis le même jour ; impossible de savoir quelle accroche a tenu. Proposition : un dossier par jour au plus, à heure fixe, jamais le suivant avant les chiffres à 24 h du précédent. Créneaux français les plus cités : 7–9 h, 12–14 h, 18–21 h en semaine, vues au plus haut le soir. Départ : 18 h 30, puis l'heure d'activité de ses abonnés dès qu'il en a une centaine. 005 ce soir ou demain, 006 le lendemain, 007 en production pendant ce temps.

Mesures à demander (needs : mesure), par vidéo et pour le compte :
- Sources de trafic : part « Recherche » et part « Profil ». Recherche à 0 % = les légendes ; Profil faible = la série ne renvoie pas.
- Requêtes de recherche qui ont mené à la vidéo : elles donnent les mots des prochaines légendes.
- Vues du profil et abonnés gagnés par jour : le rapport des deux est la seule mesure de la grille et de la bio.
- Creator Search Insights (taper ce nom dans la recherche de l'app, onglet des sujets peu couverts) : pour choisir les sujets et les mots.

## 6. Ce qui manque encore

**Réponses en vidéo aux commentaires (decision_merwan : ≈ 60 crédits la prise).** Les épinglés trop longs de 003 et 004 sont déjà des scripts. Format « annexe » : 15–25 s, 4 à 6 phrases, un décor existant, un seul CTA (abonnement), même boucle. Trois candidats : 003 « et si je saute au dernier moment ? » (la gaine et la cabine existent) ; 002 « 10 h 10 ou 9 h 15 ? » ; 004 « je n'ai pas de bouton T ». Laisser la zone haute libre (436–790) : TikTok y pose l'autocollant du commentaire. Intérêt : un rythme entre deux dossiers sans nouveau décor, et le commentateur est notifié.

**Reels et Shorts (decision_merwan : deux comptes à créer, par lui).** Les MP4 de `renders/` n'ont pas de filigrane : envoi natif, même fichier. Un Reel avec filigrane visible n'est pas recommandé ; un envoi propre est traité comme un autre. Titre Shorts ≤ 100 caractères dans `post.shorts`. La grille Instagram est aussi en 3:4 : la même couverture sert. À vérifier sur une capture : les zones réservées de Reels et Shorts contre les nôtres.

**Playlists** : dès qu'elles s'ouvrent, « Les dossiers » dans l'ordre, puis par famille (maison / route / hors norme).

## 7. Pipeline et méthode (gratuit)

`scripts/front.mjs:90-97` (`postOf`) : ajouter `replies` (tableau, un bouton copier par ligne), `followup`, `shorts`, et la routine du § 5.
`scripts/sd.mjs:126` (`check`) : un contrôle du bloc `post`, en erreur :
```js
const n = (s) => [...s].length, p = ep.post ?? {}, kw = (p.keyword ?? ep.title).toLowerCase();
if (n(p.pinned ?? "") > 150) err(`épinglé : ${n(p.pinned)} car. (150 au plus)`);
(p.replies ?? []).forEach((r, i) => n(r) > 150 && err(`réponse ${i + 1} : ${n(r)} car.`));
if ((p.hashtags ?? []).length !== 5) err("hashtags : il en faut 5");
if (![...(p.caption ?? "")].slice(0, 50).join("").toLowerCase().includes(kw)) err(`légende : « ${kw} » absent des 50 premiers caractères`);
if (!/dossier \d{3}/i.test(p.caption ?? "")) err("légende : « Dossier 00X » absent");
if (!ep.beats.some((b) => (b.vo ?? b.text).toLowerCase().includes(kw))) warn(`voix : « ${kw} » jamais dit`);
```
Règles à écrire dans CLAUDE.md pour 007 et suivants :
- Le nom courant du sujet est **dit avant la 15ᵉ seconde**, écrit à l'écran, et dans les 50 premiers caractères de la légende. État actuel : 003 et 005 le disent dans l'accroche, 004 à la promesse, 001 et 002 seulement à la chute, 006 jamais.
- Légende : mot-clé, puis « comment ça marche » ou le paradoxe, « Dossier 00X », et la question du CTA en dernier.
- Hashtags : 3 du sujet (un large, deux précis), 1 de catégorie (`#apprendresurtiktok`), 1 de série (`#systemedecode`). `#commentcamarche` sort : l'expression est mieux placée en toutes lettres dans la légende. Regarder le compteur de chaque # dans l'app avant de publier.
- Épinglé : un fait ou une question, 150 caractères ; le reste en réponses. Modèles : 001 (98 car.) et 002 (109).

## 8. Preuves

| Mesure | Résultat | Source |
| --- | --- | --- |
| Longueur des épinglés | 001 : 98 · 002 : 109 · 003 : 254 · 004 : 339 · 005 : 353 · 006 : 311 | `compte.mjs` |
| Nom du sujet dans la légende | absent : 001, 002, 003, 006 ; présent : 004 (« disjoncteur »), 005 | `compte.mjs` |
| Nom du sujet dans la voix | 006 : « défibrillateur », « arrêt cardiaque », « massage » jamais dits ; 005 : « centrale » jamais dit | `timing/script_00X.txt` |
| 50 premiers caractères | commencent par « Il », « Le câble », « Ta main », « Tu imaginais », « Tu passes » | `compte.mjs` |
| Hashtags | `#apprendresurtiktok` + `#commentcamarche` sur les six ; `#securite` ×2, `#ingenierie` ×2 | `episode.json` |
| « Dossier 00X » dans la légende | 0 sur 6 | `episode.json` |
| Tailles dans la grille | numéro 46 px → 5,5 pt ; marque 36 px → 4,3 pt ; titre 150–220 px → 18–26 pt | `cover.mjs:18-23` |

Images regardées : `grille_3x4_360.png`, `grille_3x4_130.png`, `compare_130.png`, `candidats_couverture.png`, `m005_a.png`, `m006_a.png`, `m006_b.png`, `cta_abo_006_005.png`, `renders/005-arret-urgence-couverture.png`, `brand/avatar-controle.png`, `frames/005/film_10.jpg`.

## 9. Limites

- Aucun chiffre TikTok : les impacts sont estimés.
- Les limites et règles de TikTok viennent de sources secondaires (blogs d'outils), concordantes sur 150 / 80 / 5 hashtags, **contradictoires** sur le changement de couverture après publication et sur la longueur maximale d'une légende (2 200 ou 4 000 ; nos 290 caractères sont loin dessous). À confirmer dans l'app.
- Volumes des hashtags non mesurés. `#physique` (005) est un pari sur le public lycéen ; repli : `#reacteurnucleaire`.
- Non vérifié : la ligne de promesse en image, le badge « Épinglé » sur le numéro, les zones Reels / Shorts, ce que Merwan a posté comme épinglé et comme couverture sur 001–004.
- Le poids de la voix dans la recherche est affirmé par des guides, pas par TikTok : d'où une option, pas une exigence, pour la reprise du 006.

## 10. Sources

- Limites de caractères : https://typecount.com/blog/tiktok-caption-character-limit · https://www.wordcountertool.net/character-limits/tiktok · https://replug.io/blog/tiktok-bio-character-limit
- 5 hashtags : https://www.socialmediatoday.com/news/tiktok-implements-five-hashtag-limit-per-post/757857/ · https://www.mediapost.com/publications/article/408371/tiktok-limits-hashtags-as-algorithms-become-more-s.html
- Recherche (légende, texte à l'écran, voix, hashtags) : https://www.trymypost.com/blog/tiktok-seo-ranking-factors-2026 · https://tlinky.com/tiktok-search/ · https://neuronwriter.com/tiktok-seo-guide-ranking-social-search/
- Couverture importée : https://www.kapwing.com/resources/how-to-change-tiktok-thumbnail/ — Modifier la publication (7 jours) : https://www.theleap.co/blog/tiktok-edit-post-no-watermark/ · https://www.technobezz.com/how-to-edit-a-tiktok-caption-after-posting-zte
- Grille 3:4, compteur de vues : https://socialk.it/en/tools/tiktok-grid-planner · https://moda.app/resources/sizes/tiktok-thumbnail
- Playlists : https://www.shopify.com/blog/how-to-make-a-playlist-on-tiktok · https://publer.com/blog/tiktok-playlists/amp/
- Heures : https://buffer.com/fr/resources/meilleure-heure-pour-publier-sur-tiktok · https://publer.com/blog/fr/meilleures-heures-pour-publier-sur-tiktok/ · https://metricool.com/fr/meilleure-heure-poster-tiktok
- Filigranes, publication croisée : https://tech.slashdot.org/story/21/02/09/2158255/instagram-says-its-algorithm-wont-promote-reels-that-have-a-tiktok-watermark · https://www.socialmediatoday.com/news/repurposing-tiktok-reels-youtube-shorts/739515/
- Creator Search Insights : https://metricool.com/fr/tiktok-creator-search-insight/ · https://swello.com/fr/blog/creator-search-insights-comment-analyser-les-recherches-tiktok-pour-creer-du-contenu-strategique/

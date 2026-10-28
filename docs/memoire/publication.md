# Avant de livrer, téléphone, bureau de publication

> Recopié tel quel de l'ancien `CLAUDE.md` le 2026-10-27, quand il a été resserré (copie intégrale : `CLAUDE-complet-2026-10-27.md`). Les règles en vigueur sont dans `CLAUDE.md` ; ce fichier garde le détail, les mesures et l'histoire. Les dates et les « aujourd'hui » sont ceux du texte d'origine.

Pour : livrer un film, l'envoyer à Merwan quand il n'est pas chez lui, toucher au bureau (`front/`, `scripts/front.mjs`).

---

### Avant de livrer

- `npm run review` : chaque vignette se lit, la première image arrête le pouce, la dernière est identique à la première.
- `npm run check` passe (au contrôle de contraste, un même texte en défaut à deux instants compte comme une erreur) ; `npm run qa` confirme la voix calée et le niveau.
- Merwan a écouté la voix dans la cabine (au moins l'accroche et les trois CTA).
- Le MP4 fait ≥ 60 s.
- Ne montrer à Merwan que des images dont on est fier : un essai technique raté se corrige avant, pas devant lui. Il voit `renders/` et le panneau du navigateur : une planche de bouchons écrite là pendant le 008 lui a fait écrire « on est clairement un niveau, même vingt, en dessous ». Les planches de travail sortent avec `--out` dans un dossier temporaire ; dès qu'une vraie image existe, on la lui envoie.

### Quand Merwan n'est pas chez lui

Le bureau de publication ne répond que sur le Wi-Fi de la maison. Dehors, les films lui parviennent par la conversation (`SendUserFile`), qui porte **30 Mio par fichier** vers le téléphone : les MP4 d'origine (80 à 110 Mo) ne passent pas. `npm run phone -- <ep>` fait la copie qui passe — même taille d'image, même cadence, son d'origine copié tel quel, image réencodée en deux passes au débit qui remplit la place (≈ 2,7 Mbit/s) — et la mesure contre l'original : sur les 003, 004 et 005, SSIM 0,993 à 0,995 et PSNR 45,6 à 48,2 dB, rien que l'œil voie, et TikTok recompresse plus fort de toute façon. Lui dire que ce n'est pas le fichier d'origine, et que celui-ci l'attend sur le bureau, à la maison. Un envoi qui échoue sur « timeout » se retente : c'est le réseau, pas la taille. Ouvrir le PC à Internet (un tunnel vers le bureau) est refusé par le garde-fou des sessions : ne pas le tenter.

### Le bureau de publication (refait le 2026-10-09)

Merwan, le 09/10 : « il y a trop de trucs à scroller pour aller voir les vidéos qui ne sont pas postées, celles qui sont postées […] il faut un truc simple, rapide, efficace ». L'ancienne page déroulait les 17 dossiers ouverts en entier : 51 600 px, 64 écrans d'iPhone, et « posté » n'était retenu que par le téléphone qui l'avait coché. Depuis :

- **Une liste, puis une fiche.** L'index (`À poster` · `Postés` · `En cours`, une ligne par dossier, trois voyants TT · IG · YT : 17 dossiers en 2 écrans) et une fiche à la fois. Le téléphone montre l'un ou l'autre ; à partir de 960 px, les deux côte à côte, le film lisible dans la fiche. « À poster » va du plus ancien au plus récent : le premier est le suivant à sortir. L'adresse dit la fiche (`/#012-gaziniere`, `/#profil`).
- **Dans une fiche** : le film (la copie `-iphone.mp4` quand elle est du même rendu), les téléchargements, puis les textes **d'une plateforme à la fois** (onglets TikTok · Instagram · YouTube) et, fixée en bas de l'écran, sous le pouce, **une case par plateforme**. Cocher ouvre les textes de la plateforme suivante ; les trois cochées, le dossier passe dans « Postés ». « Tout cocher » classe d'un coup un dossier déjà en ligne, sans lui inventer de date.
- **Ce qui est en ligne est gardé sur le PC**, dans `metrics/publication.json` — `{ "dossiers": { "012-gaziniere": { "tiktok": "2026-10-09T18:22", "instagram": true } } }` : une date = le moment où la case a été cochée, `true` = en ligne sans date connue, `false` = décoché ; sans ligne, TikTok se lit dans `audience.json` → `publie`. L'ordinateur et l'iPhone disent donc la même chose, et **c'est ce fichier qu'on lit pour savoir ce qui est posté** avant de demander des chiffres (`npm run metrics` le lit). Les rappels « avant de publier » (IA, HD…) restent sur l'appareil.
- Le serveur (`scripts/front.mjs`) n'écrit qu'à deux adresses : la cabine, et `POST /api/publication/<dossier>`. Il fabrique les vignettes des couvertures (`.cache/vignettes`, 360 px : 30 Ko par ligne au lieu de 1,5 Mo). Une quatrième plateforme = `PLATFORMS` dans `front.mjs` et dans `front/app.js`.
- **Pour y retoucher** : le bureau que Merwan laisse tourner (`publier.cmd`) sert `front/` tel qu'il est sur le disque — une page en chantier dans `front/index.html` arrive sous ses yeux. On construit à côté (`front/next.html`, `next.css`, `next.js`), on essaie sur un second serveur (`.claude/launch.json` → `bureau-essai`, port 4174), on bascule les trois fichiers d'un coup. Un changement de `scripts/front.mjs` ne vaut qu'après relance de `publier.cmd` ; en attendant, la page le dit et garde les cases sur l'appareil, puis les confie au PC à la relance (c'est aussi ainsi que les « posté » de l'ancien bureau, restés dans son iPhone, remontent).
- Essayé dans le navigateur à 320, 375, 768 et 1440 px ; **pas sur un vrai iPhone** : à lui faire confirmer la barre de cases fixée en bas et le film en plein écran.

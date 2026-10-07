# Audit « outillage » — Système Décodé

**En une phrase** : la chaîne contrôle bien le son et le scintillement, mais rien de ce qui fait la rétention (accroche, zones TikTok, lisibilité, boucle, rythme des CTA) — et elle fait attendre une minute pour un `look` que la carte graphique rendrait en cinq secondes.

Les trois gestes les plus rentables : (1) `look`/`cover` sur le GPU — §4 V1 ; (2) corriger le modèle et ajouter le lint du script — F1 + G1 ; (3) donner à `qa` la boucle, les plages mortes et un code de sortie — G4.

Mesures : `texte.txt` (script, sous-titres, CTA, sources), `dom_00X.json` (boîtes du DOM contre les zones, 4 instants/s), `m00X.json` (MP4 image par image en 270×480), `loop_00X.jpg`, `zones_006.jpg`, `bench_cote.jpg`. Tout est dans ce dossier ; les trois scripts (`texte.mjs`, `dom.mjs`, `mesures.mjs`) sont des prototypes en lecture seule, réutilisables tels quels.

## 1. Ce que la chaîne ne voit pas aujourd'hui (preuves)

| Défaut | Où il est passé | Mesure |
| --- | --- | --- |
| A·B·C pas finis à 10 s | 006 (non publié) | fin du C à 10,59 s ; le C ne démarre qu'à 9,98 s (`texte.txt`) |
| Boucle : dernière image ≠ première | 004 (en ligne), 006 | écart moyen 9,5 / 3,8 niveaux (zone haute 25,6 / 13,3) contre 0,68 pour le 005 ; `loop_004.jpg` : halo plus fort à la fin ; `loop_006.jpg` : la victime a glissé de quelques pixels |
| Texte dans une zone TikTok | 006 | « Sang pompé 0 L/min » à 50 % sous les boutons (14,8–15,8 s) ; « Lire, puis choquer » à x = 24, rogné par les 53 px de gauche (27,0 s) ; « Bouton verrouillé » 13 % sous les boutons (63,3–65,5 s) ; « Le 15 » 11 % à gauche (21,0–22,3 s). Vu sur `zones_006.jpg` |
| Deux panneaux dans la zone haute | 006 | `cta-field` + `chip-samu` ensemble de 73,25 à 74,54 s |
| Textes trop petits | tous | 006 : « TOI » 17 px, axe des chances 19 px, 13 libellés à 20–21 px (≈ 5 px de haut sur la vignette de 270 px) |
| Sous-titres trop brefs | tous | 15 à 21 lignes par film sous 0,5 s ou au-dessus de 24 car/s ; mots orphelins (006 : « ne » 0,40 s puis « part » à 15,3 s — visible sur `zones_006.jpg`) |
| Plage morte | 002, 004, 006 | 006 : 77,8–80,3 s (2,5 s sans rien qui bouge dans la zone du sujet, pendant le CTA d'abonnement) ; 004 : 76,4–79,8 s |
| Sujet sombre | 006 | 64,2–70,2 s : six secondes où le 95ᵉ centile de luminance de la zone du sujet est à 52/255 (tout le CTA like) |
| Chiffre sans source | 005 | « 3 000 MW » (beat `coeur`) n'apparaît dans aucune entrée de `sources` |
| Source « à valider » encore dans un film rendu | 006 | l'annonce du 007 |
| Alertes voix oubliées au rendu | 005 | « like : pause non jouée », « boucle : fin qui retombe » sont dans `vo.json`, mais `render` et `qa` ne les rappellent pas |

Ce qui est sain et qu'il faut garder : cartes d'accroche présentes à l'image 1 dans les cinq films (9 à 11 mots, opacité 0,5), aucune ligne de sous-titre au-delà de 17 caractères, 5 hashtags et légende en question partout, part des CTA stable (21–25 %).

## 2. Les garde-fous, classés gain / effort

### G1 — Lint du script dans `build` (S, gratuit, avant toute dépense de crédits)
Fichier : nouveau `scripts/lint.mjs`, appelé à la fin de `build()` (`scripts/build.mjs:89`) et par `npm run script`. Aucune image, < 1 s. Il lit `ep` et `sched`.

```js
export function lintScript(ep, sched) {
  const out = []; const warn = (id, msg) => out.push({ id, msg });
  const B = Object.fromEntries(sched.beats.map((b) => [b.id, b]));
  // accroche : episode.json → "abc": { "a": ["accroche"], "b": ["promesse"], "c": ["menace"] }
  const abc = ep.abc; if (!abc) warn("abc", "episode.json n'a pas de champ abc : l'accroche n'est pas contrôlée");
  else {
    const end = (ids) => Math.max(...ids.map((i) => B[i].end));
    if (sched.beats[0].start > 0.40) warn("abc", `premier mot à ${sched.beats[0].start} s (> 0,40)`);
    if (end(abc.a) > 4.5) warn("abc", `A fini à ${end(abc.a)} s (> 4,5)`);
    if (end(abc.c) > 10.0) warn("abc", `A·B·C finis à ${end(abc.c)} s (> 10) : resserrer les silences (trim) ou couper un mot`);
    for (const b of sched.beats.filter((b) => b.end <= end(abc.c)))
      b.words.slice(1).forEach((w, k) => w.s - b.words[k].e > 0.7 && warn("abc", `silence de ${(w.s - b.words[k].e).toFixed(2)} s après « ${b.words[k].t} »`));
  }
  // CTA : du début de "like" à la fin
  const like = B.like?.start; if (like) {
    const part = (sched.duration - like) / sched.duration;
    if (sched.duration - like > 20 || part > 0.23) warn("cta", `CTA = ${(sched.duration - like).toFixed(1)} s, ${Math.round(part * 100)} % du film (plafond 20 s / 23 %)`);
  }
  if (sched.duration < 60) warn("duree", `film de ${sched.duration} s (< 60)`);
  // sources : chaque nombre affiché doit se retrouver dans une source
  const src = JSON.stringify(ep.sources ?? []).replace(/[\s  ]/g, "");
  for (const b of ep.beats) for (const n of b.text.match(/\d[\d\s  .,]*\d|\d/g) ?? [])
    if (!src.includes(n.replace(/[\s  ]/g, "")) && !(ep.sourcesIgnore ?? []).includes(n)) warn("sources", `« ${n} » (${b.id}) sans trace dans sources`);
  for (const s of ep.sources ?? []) /à (vérifier|valider)/i.test(JSON.stringify(s)) && warn("sources", `source encore « à vérifier » : ${JSON.stringify(s).slice(0, 80)}`);
  // direction de la voix (les règles mesurées du CLAUDE.md)
  const tag = (b) => /^\[([^\]]+)\]/.exec(b.vo ?? "")?.[1];
  ep.beats.forEach((b, i) => {
    const vo = b.vo ?? "";
    if (/\[(urgent|dramatic)\]/.test(vo) && (/\[urgent\]/.test(vo) || abc?.a.includes(b.id) || vo.includes("!"))) warn(b.id, "[urgent] / [dramatic] : ça crie");
    if (/\[(ominous|low, grave voice)\]/.test(vo) && ["like", "comment", "abo"].includes(b.id)) warn(b.id, "grave sur un CTA positif (« il essaye de draguer »)");
    if (/\[slowly\]/.test(vo) && /on l'ouvre/i.test(vo)) warn(b.id, "[slowly] sort plat sur « on l'ouvre » : [calm]");
    if (["like", "comment", "abo"].includes(b.id) && /\.\.\./.test(vo)) warn(b.id, "« ... » n'est joué qu'une fois sur deux : [short pause]");
    if (i === ep.beats.length - 1 && !/,\s*$/.test(vo)) warn(b.id, "la dernière phrase doit finir par une virgule dans vo");
    if (i >= 2 && tag(b) && tag(b) === tag(ep.beats[i - 1]) && tag(b) === tag(ep.beats[i - 2])) warn(b.id, `trois phrases de suite sur [${tag(b)}]`);
  });
  // repères
  for (const [k, t] of Object.entries(sched.cues)) (t < 0 || t > sched.duration) && warn("cues", `repère ${k} hors du film (${t} s)`);
  for (const b of ep.beats) /^[a-z][a-z0-9_]*$/.test(b.id) || warn(b.id, "identifiant de beat : lettres, chiffres, _ seulement (un « -2 » final est lu comme un décalage)");
  return out;
}
```
Sortie dans `build` : `  ⚠ abc · A·B·C finis à 10.59 s (> 10) …`. Sur les six dossiers il lève : 001 (premier mot 0,43), 002 (A 4,75), 004 (A 5,79), 005 (3 000 MW), 006 (ABC 10,59 ; source à valider) — et **le modèle lui-même** (voir F1).

### G2 — Découpe des sous-titres : orphelins et lignes éclair (S/M)
Le découpage vit dans le navigateur (`kit/lib/overlay.js:24-60`, `maxChars = 17`, `maxWords = 4`) : Node ne peut pas le contrôler. Sortir la fonction pure `captionLines(beat, { maxChars, maxWords })` dans `kit/lib/captions.mjs` (importée par `overlay.js` et par `lint.mjs`), puis :
- alerte si une ligne dure < 0,45 s **ou** dépasse 26 car/s (seuils calés : médiane mesurée 13–15 car/s, durée médiane 0,72–0,84 s) ;
- correction automatique plutôt qu'alerte : une ligne d'un seul mot de ≤ 4 lettres est fusionnée avec sa voisine la plus courte si le total reste ≤ 20 caractères ; une ligne < 0,45 s reste affichée jusqu'à 0,45 s si la suivante commence plus tard.
Message : `⚠ sous-titres · coeur 15.3 s « ne » seul 0,40 s`.

### G3 — Audit du DOM contre les zones (M) : `npm run audit -- <ep>`
Fichier : `scripts/audit.mjs` (le prototype `dom.mjs` de ce dossier en est la base). Chrome charge `index.html`, on avance la timeline à 4 instants/s + chaque repère, et on lit `getBoundingClientRect()` de chaque nœud de texte visible (opacité cumulée > 0,3). Coût mesuré : 0,9 à 2,5 s pour 350–400 instants, plus le chargement (5–27 s). Règles :
- **zones** (source unique : `kit/lib/zones.mjs`, aujourd'hui recopiées en dur dans `scripts/review.mjs:15` et en variables dans `kit/brand.css:29-33`) : gauche x < 53, droite x > 1027, haut y < 205, boutons x > 905 et 880 < y < 1760, bas y > 1620. Erreur si > 8 % de la boîte d'un texte y tombe pendant ≥ 2 instants ;
- **taille** : erreur sous 20 px, alerte sous 24 px (tout ce qui se lit) ; l'en-tête est exempté par sélecteur ;
- **zone haute** (436–790) : alerte si deux conteneurs de premier niveau y sont visibles ensemble plus de 0,3 s ;
- **texte sur texte** : deux boîtes de conteneurs différents qui se recouvrent (004 à 9,67 s : carte d'accroche sur le premier sous-titre) ;
- **image 1** : `#hook` porte ≥ 6 mots à t = 0,04 s, opacité ≥ 0,4 ;
- **fuite à travers une coupe** : `cut()` pousse son instant dans `stage.cuts` ; pour chaque coupe, tout conteneur dont l'opacité est entre 0,05 et 0,95 à t − 1 image ou t + 1 image est signalé (il était en train d'entrer ou de sortir). La version « pixels » (m00X.json, `slotSame`) est trop bruyante : elle signale les raccords voulus (005 à 23,53 s).
Sortie : une ligne par défaut avec plage de temps et boîte, code de sortie 1 s'il y a une erreur ; `check` l'appelle après le lint HyperFrames (`scripts/sd.mjs:126-133`).

### G4 — `qa` : boucle, plages mortes, plancher de luminance, et un code de sortie (S/M)
`scripts/flicker.mjs` lit déjà tout le film en 270×480 gris : les mesures de `mesures.mjs` s'y ajoutent dans la même passe.
- **boucle** : écart absolu moyen dernière/première image. Calibrage : 005 = 0,68 ; 002 = 1,93 ; 003 = 2,86 ; 006 = 3,84 ; 004 = 9,48. Seuil : ✓ ≤ 2,0 · ⚠ ≤ 3,0 · ✗ au-delà ; et par bande (zone haute, sujet) ✗ au-delà de 6. Message : `✗ boucle : la dernière image diffère de la première (3,8 ; sujet 9,0)`.
- **plage morte** : différence moyenne de la zone du sujet (y 440–1160) entre t et t − 1,5 s < 2,0 pendant ≥ 2,5 s → `⚠ rien ne bouge de 77,8 à 80,3 s`.
- **plancher** : p95 de la zone du sujet < 70 ou écart-type < 9 pendant ≥ 1,5 s, hors dernière seconde → `⚠ sujet sombre de 64,2 à 70,2 s (p95 52)`.
- **accroche** : mouvement moyen de la zone du sujet sur les 2 premières secondes (005 : 0,28 — une image presque fixe ; 006 : 6,8). Alerte sous 0,5.
- `qa` renvoie aujourd'hui `{ ok, … }` que `sd.mjs:184-187` ignore : le processus sort toujours à 0, même avec une image parasite ou une voix décalée. Ajouter `if (!r.ok || r.smooth?.stray.length || r.loop > 3) process.exitCode = 1;`, la durée (≥ 60 s), et l'âge du rendu : `✗ le rendu est plus ancien que audio/vo.json / episode.json / src/*.js` (le cas « choix dans la cabine sans nouveau rendu » du CLAUDE.md).

### G5 — `render` : rappeler ce qui reste ouvert (S)
`scripts/sd.mjs:135-146`. Avant le rendu final (pas `--draft`) : refuser un minutage estimé (aujourd'hui simple ⚠ ligne 139), afficher les alertes du lint et les alertes voix restées dans le montage (`vo.json`), et écrire `renders/<ep>-bilan.txt` (lint + audit + qa) que le front peut afficher à côté du film.

## 3. Fragilités réelles trouvées en lisant

- **F1 — Le modèle enseigne quatre directions que le CLAUDE.md dit fausses** (`kit/template/episode.json`) : `[slowly] Alors... on l'ouvre.` (→ `[calm]`), `[low, grave voice]` sur le CTA like (→ `[firm, matter-of-fact]`), `...` comme pause dans les CTA (→ `[short pause]`), dernière phrase `…par...` (→ virgule finale). Chaque nouveau dossier part de là : corriger le modèle coûte dix minutes et évite des reprises payantes.
- **F2 — `qa` ne fait jamais échouer la commande** (voir G4).
- **F3 — Tout écrit dans le dépôt** : `build()` réécrit `gen/` et `index.html` à chaque `snap`, `check`, `review`, `look`, `cover` (`scripts/build.mjs:38-58, 87`), contrairement à son commentaire d'en-tête. Deux commandes en parallèle se marchent dessus (esbuild réécrit `bundle.js` pendant qu'un Chrome le charge). Écrire seulement si le contenu change, et poser `gen/.lock`.
- **F4 — Valeurs par défaut contraires à la règle** : `scripts/lib/episode.mjs:26-27` met `lead` à 0,5 et `tail` à 2,0 quand le CLAUDE.md dit 0,2 et 0,45. Un `episode.json` sans ces champs ouvre sur une demi-seconde de silence, sans alerte.
- **F5 — Repères** (`kit/lib/ref.mjs:17`) : `/[+-]\d*\.?\d+$/` prend pour un décalage la fin d'un identifiant (`cta-2` → beat `cta`, −2 s) ou d'un mot (`dix:10-20`). Imposer le format des identifiants (G1).
- **F6 — `snap --at` ne résout pas les repères** (`scripts/sd.mjs:119` passe la chaîne brute à HyperFrames) alors que `look` le fait.
- **F7 — `master()`** (`scripts/lib/ffmpeg.mjs:159`) : un échec affiche ✗ mais la commande sort à 0 ; sur un brouillon sans voix le gain monte de +19 dB : plafonner à +6 dB et le dire.
- **F8 — Zones en double** : `scripts/review.mjs:15` et `kit/brand.css:29-33` ; une troisième copie arriverait avec G3.
- **F9 — `flicker()`** charge tout le film en mémoire (`spawnSync`, ≈ 330 Mo pour 85 s, plafond 1 Gio) : passer en flux en ajoutant G4.

## 4. Vitesse de travail

- **V1 — `look` et `cover` rendent la 3D sur le processeur alors que la machine a une RTX 3080.** Ils lancent Chrome avec `--enable-unsafe-swiftshader` (`scripts/look.mjs:28`, `scripts/cover.mjs:34`). Banc `bench.mjs` sur le 006, neuf instants du film, même page, même code :

  | moteur | chargement | ms par image |
  | --- | --- | --- |
  | SwiftShader (actuel) | 4,9 s | 2 136 · 2 479 · 12 860 · 3 290 · 3 134 · 9 433 · 2 832 · 14 154 · 2 589 |
  | `--use-gl=angle --use-angle=d3d11 --enable-gpu --ignore-gpu-blocklist` | 1,8 s | 29 · 16 · 412 (compilation des shaders) · 21 · 18 · 20 · 10 · 12 · 10 |

  Soit 100 à 1 000 fois plus vite ; l'image est la même à l'œil (`bench_cote.jpg`, 45 s, les deux moteurs côte à côte). Un `look` de huit poses passe d'environ une minute à moins de cinq secondes : on peut essayer quarante cadrages au lieu de huit. Correctif : dans `scripts/lib/chrome.mjs`, `export const GPU = ["--use-gl=angle", "--use-angle=d3d11", "--enable-gpu", "--ignore-gpu-blocklist"]`, utilisé par `look` et `cover`, avec repli sur SwiftShader si `UNMASKED_RENDERER_WEBGL` contient « SwiftShader » malgré tout (et une ligne qui le dit). À vérifier : quel moteur utilisent `hyperframes snapshot` (donc `review`, `snap`) et `hyperframes render` — le brouillon en 80 s laisse penser que le rendu est déjà sur le GPU ; si `review` ne l'est pas, le refaire sur le modèle de `look` (une page, `renderAt`, une capture) le rendrait quasi instantané.
- **V2 — Une planche dense sans rendu** : avec V1, `review --every 0.5` (170 images) coûte quelques secondes. C'est la planche à 2 images/s qui a servi à cet audit, disponible avant tout rendu.
- **V3 — Resserrer un silence sans crédits** : l'accroche du 006 dépasse de 0,59 s. Le silence entre `accroche` et `promesse` fait 0,54 s, celui d'après « décide » 0,63 s (à l'intérieur de `promesse`). Ajouter à `schedule()` (`scripts/lib/episode.mjs:184`) un champ `trim` par beat : `const cutOut = cutOut0 - Math.min(beat.trim ?? 0, Math.max(0, cutOut0 - raw.at(-1).e - 0.12))` — il ne touche pas à `beatHash`, donc à aucune prise. Seul, il ramène la fin du C vers 10,2 s (0,3 s entre les deux phrases, `lead` de 0,2 à 0,1) ; pour passer sous 10 s il faut aussi couper dans le silence interne (même principe, au mot : `"trimAfter": { "décide": 0.3 }`), effort M. Sinon, la règle se reformule : « le C a commencé avant 10 s » (9,98 s : tenu de justesse).
- L'audit du DOM (G3) n'a pas besoin de rendre la 3D : il passe le film entier en moins de 30 s. C'est le contrôle le plus rapide de toute la chaîne ; le lancer avant chaque `review`.
- Le lint (G1) tourne sans voix, sur le minutage estimé : l'accroche hors budget et le CTA trop long se voient avant de payer.

## 5. Ordre conseillé

0. V1 (vingt minutes) : `look` et `cover` sur le GPU.
1. F1 + G1 (une heure) : tout nouveau script est contrôlé avant la voix.
2. G4 + G5 (deux heures) : plus aucun rendu livré avec une boucle cassée ou un défaut que personne n'a relu.
3. G3 (une demi-journée) : les zones TikTok et les tailles ne dépendent plus de l'œil sur la planche.
4. G2, puis F3–F9.

Sur les deux films non publiés, ces contrôles donnent déjà la liste des retouches gratuites : 006 — quatre étiquettes à déplacer, 13 libellés à grossir, la boucle, la plage morte du CTA d'abonnement, le like trop sombre, l'accroche à ramener sous 10 s ; 005 — sourcer ou retirer « 3 000 MW », décider de la reprise de `like` et `boucle`.

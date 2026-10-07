# Audit « habillage » — Système Décodé (kit, 005, 006)

Base : `kit/brand.css`, `kit/lib/overlay.js`, les deux `index.html`, 21 images regardées (pleine résolution `f005_*.png` / `f006_*.png` de ce dossier, planche `frames/006/film_06.jpg`), mesures relancées (`chunks.cjs`, `chunker3.cjs`, `hooklines.cjs`, `contrast2.cjs`, lecture seule). PROTO = ce dossier (`…/scratchpad/audit/habillage/`).
Rien n'a été rendu : toute valeur CSS ci-dessous est à confirmer par un `look` (voir § À vérifier).

**Verdict.** L'identité tient (3 couleurs, 2 polices, le dossier). Ce qui sépare du « meilleur compte » n'est pas le style, c'est la **hiérarchie** : partout, le texte qui compte est le plus petit (le verdict de la puce en 23 px, la question du commentaire en 26 px, « s'abonner » en 28 px, « RIEN » — la chute du 005 — sur 200 px de large), et le texte le plus lu (sous-titres, accroche) est mal coupé.

---

## 1. Sous-titres : découpage par coût, une ou deux lignes — kit, M
**Constat (mesuré sur le minutage réel).** 005 : 91 lignes, 19 fautives ; 006 : 87 lignes, 14 fautives. Fautes : ligne finissant sur un mot-outil (« C'EST UN » 31,01 s, « TANT QUE LE » 32,34 s, « 7 FOIS SUR 10 IL » 66,31 s — `caps_fautes.png`), ligne-éclair < 0,45 s (« PREMIER » 0,24 s), « NE » seul (006, 15,27 s). Cause : `overlay.js:33` coupe sur toute respiration > 0,3 s et `:43-56` équilibre en longueur sans regarder les mots.
**Correctif.** Remplacer les étapes 1-2 de `buildCaptions` (`kit/lib/overlay.js:25-58`) par `chunk()` de `PROTO/chunker3.cjs:7-97` (programmation dynamique ; un bloc de deux lignes n'est choisi que s'il évite une faute). Résultat : 005 → 70 blocs (23 sur deux lignes), 0 sous 0,45 s, médiane 0,99 s ; 006 → 74 blocs (13), min 0,48 s. Il reste 4 blocs par film dont la **première** ligne finit sur un mot-outil (« C'EST UN / ÉLECTROAIMANT ») : acceptables, le sens est complet dans le bloc.
Rendu (remplace `overlay.js:60-81`) : une `.cap__line` par rangée, `spans` dans une `Map(mot → span)`.
```css
/* brand.css:91-98 */
#captions { height: 260px; }
.cap { flex-direction: column; justify-content: flex-start; padding-top: 73px; } /* la 1re ligne reste à 1321-1413 ; la 2e s'ajoute dessous (→ 1505) : l'œil ne bouge pas */
```
Garde-fou : le chevron `#rail-comment` (y 1251-1305) reste au-dessus de la 1re ligne ; c'est la raison du `padding-top` plutôt que d'un centrage.

## 2. Cartes d'accroche : l'image 1 doit se lire d'un coup — kit + pipeline, M
**Constats.** (a) Aucune ponctuation : « DEVANT TOI SON CŒUR », « TROMPER C'EST ELLE » (`f006_0.05.png`, `f006_8.5.png`) — `captionOf` (`scripts/lib/episode.mjs:69`) retire `, ; :` et la carte ne les remet pas. (b) Coupes sur mot-outil : « PAS TE / TROMPER », « VERTE PEUT LE / SAUVER », « TOUT / SEUL EN 2 S » (`f005_6.5.png`). (c) Mots en attente à 50 % : 4,3:1 (006) et 4,4:1 (005) sur l'image que le fil montre à l'arrêt. (d) La phrase A (« Quelqu'un s'effondre », « Panne de courant ») devient la **petite ligne** mono 46 px grisée : la règle « ≤ 2 mots = petite ligne » (`overlay.js:105`) est faite pour « 230 V », pas pour la phrase choc.
**Correctifs.**
1. Build : là où `p` est posé sur un mot, garder le signe : `c: (tok.d.match(/[,;:]+$/u) ?? [""])[0]`. Dans `row()` (`overlay.js:134`) : `w.t + (w.p === 1 ? (w.c === ":" ? " :" : w.c || ",") : "")`. Cartes seulement, pas les sous-titres.
2. `linesOf` (`overlay.js:114-126`) → `linesNew` de `PROTO/hooklines.cjs:41-83` (`maxChars 21`, 3 lignes max) + réduction du corps si une ligne dépasse 19 signes : `fontSize = max(72, floor(88 × 19.5 / plusLongue))`. Sorties vérifiées :
   - 006 : « DEVANT TOI, / SON CŒUR / NE POMPE PLUS » · « AU MUR, / UNE BOÎTE VERTE / PEUT LE SAUVER » · « TU NE PEUX / PAS TE TROMPER : / C'EST ELLE QUI DÉCIDE » (81 px)
   - 005 : « NE TOUCHE À RIEN : / IL S'ARRÊTE / TOUT SEUL, EN 2 S » ; 004 et 003 s'améliorent aussi (« LE CÂBLE / DE TON ASCENSEUR / VIENT DE CASSER »).
3. `brand.css:231` `.hook__w { opacity: 0.72; }` → 7,9:1 mesuré sur l'image 1 du 006.
4. Petite ligne : mono 46 px seulement si elle contient un chiffre ; sinon `.hook__k--say { font: 800 64px/1 var(--display); letter-spacing: 0.01em; }` (64 + 18 + 3 × 90 = 352 ≤ 356 px).
5. La première phrase de la carte 0 est **allumée dès l'image 0** (couleur d'accent comprise : « QUELQU'UN S'EFFONDRE » en signal), y compris sur la copie de boucle (`overlay.js:166` : `make(cards[0], true)` puis même `gsap.set`). Elle est dite à 0,28 s : on ne perd rien, et l'image arrêtée a un titre à plein contraste.

## 3. CTA d'abonnement (`#next`) : une boîte vide au moment qui rapporte — kit + 005 + 006, M
**Constats.** 005 : la boîte entre à 75,02 s, la barre à 76,39 s, le fait à 78,67 s, sortie ≈ 80,3 s → le fait est à l'écran ≈ 1,6 s ; à 76,5 s la boîte ne contient qu'un rectangle de 40 px (`f005_76.5.png`). 006 : boîte 75,59 s, fait 77,57 s (`f006_78.5.png`). L'appel « S'ABONNER POUR L'OUVRIR » est en mono 28 px, le « + » perdu à droite. La barre crème se lit comme un rectangle blanc, pas comme un titre caviardé. « 0,5 s » en mono 150 px : la virgule et l'espace prennent chacune une case → « 0 , 5   s ».
**Correctifs.**
```css
/* brand.css:212-218 */
#next-redact { position: relative; width: 100%; max-width: 640px; }
#next-redact::after { content: "CLASSÉ"; position: absolute; right: 18px; top: 50%; transform: translateY(-50%); font: 700 30px/1 var(--mono); letter-spacing: 0.3em; color: var(--bg); }
#next-cta { margin: 30px -34px -34px; padding: 22px 34px; background: var(--veille); color: var(--bg); font: 800 54px/1 var(--display); letter-spacing: 0.02em; }
#next-fact b { letter-spacing: -0.09em; }
#next-fact b i { font: 700 0.42em/1 var(--mono); font-style: normal; margin-left: 0.12em; letter-spacing: 0; }
```
- Balisage : retirer le second `<span>Classé</span>` de l'en-tête (005 `index.html:104`, 006 `:142`) ; `#next-cta` = `<span>Abonne-toi pour l'ouvrir</span>` (impératif, comme la voix ; plus de « + ») ; 006 `:144` → `<b>0,5<i>s</i></b>`.
- Minutage (005 `main.js:341`, 006 `main.js:411`) : la barre se révèle **avec** la boîte, par `clipPath` (un `scaleX` étirerait « CLASSÉ ») : `tl.fromTo("#next-redact", { clipPath: "inset(0 100% 0 0)" }, { clipPath: "inset(0 0% 0 0)", duration: 0.4, ease: "power3.inOut" }, t.abo + 0.45)`. La plaque verte se déroule sur « Abonne-toi » : `tl.fromTo("#next-cta", { scaleX: 0, transformOrigin: "0 50%" }, { scaleX: 1, duration: 0.3, ease: "power3.out" }, t.abo + 0.15)`. Le fait reste sur son mot.
- Noir sur veille : 15,5:1. C'est la seule plaque pleine du film : elle n'imite pas l'interface, elle dit quoi faire.

## 4. Titre de chute : plus gros que les sous-titres — 005, 006, S
**Constat.** 006 : 104 px (`index.html:47`) contre 94 px pour un sous-titre : pas de hiérarchie (`f006_59.5.png`). 005 : « RIEN », la chute du film, fait 200 × 90 px dans un coin, à côté de 430 px de noir vide (`f005_55.5.png`).
**Correctif.** 006 `index.html:47-49` : `#retitle-main { font-size: 136px; } #retitle-slot { height: 136px; } #retitle-strike { top: 66px; height: 12px; }` (« ARRÊTE LE CHAOS » mesure 682 px à 104 px → 892 px à 136 px, sous les 904 disponibles). 005 `index.html:12-14` : garder 120 px pour « DU COURANT », et `#retitle-b { font-size: 260px; line-height: 0.82; }` (≈ 433 px de large, bas ≈ 715 px : dans la zone haute). Kit : `.kicker` du retitle à 30 px, encre à 80 %.

## 5. En-tête : un faux italique, une rangée illisible — kit, S
**Constats.** `.hud__brand` est un `<em>` (modèle `kit/template/index.html:27`) et aucune JetBrains Mono italique n'est chargée (`brand.css:11-14`) : le nom du compte est en **oblique synthétique**, sur toutes les images. Actes éteints : encre 62 % × 0,4 = 2,0:1 mesuré. Tailles : 24 / 20 / 21 / 21 px.
**Correctif.**
```css
.hud__tag { font-size: 26px; }                       /* :70 */
.hud__count { font-size: 24px; } .hud__count b { font-size: 40px; }   /* :78-80 */
.hud__acts { font-size: 26px; letter-spacing: 0.1em; gap: 26px; }      /* :85 */
.hud__acts span { display: inline-flex; gap: 12px; opacity: 1; color: var(--ink-dim); }
.hud__acts span i { font-style: normal; overflow: hidden; white-space: nowrap; max-width: 0; }
.hud__brand { font-style: normal; font-weight: 700; }                  /* :88 */
```
Balisage : `<span><b>01</b><i>Menace</i></span>…` ; `setAct` (`overlay.js:231-236`) ouvre le libellé de l'acte courant (`maxWidth: 220`, 0,35 s, `power3.inOut`) et referme les autres. À l'écran : « 01 MENACE  02  03 ………… SYSTÈME DÉCODÉ » : deux mots de moins, 26 px au lieu de 21, ≈ 600 px sur 904. Repli sans toucher au balisage : 24 px et `opacity: 0.62` sur les actes éteints.

## 6. Mot à venir à 34 %, et un rebond par ligne — kit, S
**Constat.** `brand.css:98` : 2,7:1 mesuré (006, 14,5 s) ; « PASSE » sur les lignes de champ (`f005_33.0.png`), « UN CŒUR » sur le torse vert (`f006_57.5.png`), « UN GROS » (`f005_67.5.png`) : pour qui regarde sans le son, la moitié de la ligne est invisible jusqu'à ce qu'elle soit dite. `overlay.js:76` : chaque ligne entre avec `scale 0.9 → 1, back.out(2.2)` — 91 rebonds dans le 005.
**Correctif.** `.cap__w { opacity: 0.5; }`. `overlay.js:76` → `tl.fromTo(cap, { y: 10, opacity: 0 }, { y: 0, opacity: 1, duration: 0.12, ease: "power3.out" }, start)`. Le geste est réservé au mot marqué : dans la boucle `:77-79`, `if (w.a) tl.fromTo(span, { scale: 1.1 }, { scale: 1, duration: 0.16, ease: "power2.out" }, …)`.

## 7. Petits textes mono : un plancher de 26 px, et un seul en-tête par panneau — kit + 005 + 006, M
**Constat.** Sur un écran de 6 pouces, 1 px vidéo ≈ 0,064 mm : une capitale de 21 px fait ≈ 1 mm de haut. Sont sous 26 px : `.panel__h` 21 (`brand.css:120`), `.chip` 23 (`:125`), `.co__s` 22 (`:110`), seuils 19 (`:172`, `:248`), statuts 23 (`:175`, `:249`), `.tile__you` 17 (`:204`) ; 006 : `#odds-help`/`#odds-axis` 19 (`index.html:31-32`), `#ecg-status` 23 (`:21`), `.say span` 20 (`:42`). À 270 px de large (`film_06.jpg`), aucun en-tête ni statut de panneau ne se lit ; seuls le chrono, le titre et les sous-titres passent.
**Correctif.**
```css
.panel__h { font-size: 26px; letter-spacing: 0.1em; color: rgba(233, 228, 216, 0.8); }
.panel { background: rgba(7, 10, 12, 0.9); }   .chip { font-size: 26px; background: rgba(7, 10, 12, 0.86); }   .chip--live { font-size: 28px; }
.co__s { font-size: 26px; color: var(--ink); opacity: 0.85; }
#scope-th span, #gauge-th span { font-size: 24px; top: -26px; }
#scope-status, #gauge-status { font-size: 28px; height: 30px; text-transform: uppercase; }
.tile__you { font-size: 22px; top: 62px; }
```
Fond des panneaux : à 78 % le sujet transparaît (électrode derrière « CE QUE LIT LA PUCE », `f006_42.9.png` ; le témoin derrière les barres, `f006_18.5.png` ; la tige à travers la jauge, `f005_33.0.png`).
Budget à 26 px : 18,2 px par signe, 46 signes pour les deux côtés d'un en-tête pleine largeur. Donc retirer les seconds libellés décoratifs : « Par les électrodes » (006 `:88`), « Seule » (`:103`) ; 005 `:94` : « Like » seul à gauche (l'en-tête actuel fait 50 signes) ; 006 `:91` : « ● Fibrillation » (la voix dit « du chaos »). 006 : `#odds-help span, #odds-axis { font-size: 24px; }`, `#ecg-status, #selftest-s { font-size: 28px; }`, `.say span { font-size: 24px; }`.

## 8. CTA like et commentaire : la hiérarchie est à l'envers — kit + 005 + 006, M
**Constats.** Commentaire (`f006_72.6.png`) : la question — ce à quoi on veut une réponse — est en mono 26 px grisé ; la moitié droite du champ est vide. Like (`f006_66.5.png`, `f005_67.5.png`) : 12 cercles, un compteur de 21 px (« BOUTONS ROUGES OUBLIÉS 3/12 »), 2,5 s pour comprendre. Chevrons `.rail` : 60 × 44 px, deux sur trois éteints à tout instant (`overlay.js:259`), sur fond vert : on ne les remarque pas.
**Correctifs.**
```css
.rail { left: 790px; width: 100px; height: 64px; gap: 8px; }   .rail i { width: 28px; height: 64px; }   /* :193-194 */
#rail-follow { top: 938px; } #rail-like { top: 1102px; } #rail-comment { top: 1251px; }
#cta-q { margin-top: 16px; font: 800 60px/1 var(--display); letter-spacing: 0.01em; text-transform: uppercase; }
#cta-field-v { margin-top: 18px; height: 56px; font: 800 50px/56px var(--mono); }   #cta-typed { height: 56px; }   #cta-caret { height: 48px; }
#net .panel__h span:first-child { font: 800 54px/1 var(--display); letter-spacing: 0.02em; color: var(--ink); }
#net-n { align-self: flex-end; font: 700 30px/1 var(--mono); color: var(--veille); }
```
- `overlay.js:259` : une poursuite au lieu d'un clignotement : `tl.fromTo(arrow, { opacity: 0.2, x: -8 }, { opacity: 1, x: 0, duration: 0.28, ease: "power2.out", repeat: beats - 1, repeatDelay: 0.32 }, from + 0.1 + i * 0.09)`.
- Commentaire : `<div class="kicker">Commentaire</div><div id="cta-q">La plus proche de chez toi ?</div>` puis la réponse tapée. 005 : « Il chauffe encore… / combien de temps ? » sur deux lignes.
- Like : `<span>Like</span><span id="net-n">2/12 témoins prêts</span>`.

## 9. Texte sur sujet clair, accent de la couleur du fond — kit + 005, S
**Constats (mesurés).** Carte d'accroche sur la boîte verte, 006 à 8,5 s : veille **et** encre à 2,8:1. Sous-titre « 3 000 MW » en signal sur le cœur orange, 005 à 11,8 s : 2,6:1 (l'encre y ferait 6,5:1). 005, image 1 : le fond de la cuve (y ≈ 1180-1340) passe derrière « ET C'EST TOI QUI ES » (`f005_0.05.png`), puis derrière « RIEN » à 6,5 s.
**Correctifs.**
- Une ombre sous les cartes, sœur de `#hud-shade`, visible de 0 à la sortie de la dernière carte (valeur rendue par `buildHook`) et de nouveau à `loopAt` : `#hook-shade { position: absolute; left: 0; right: 0; top: 1100px; height: 560px; background: linear-gradient(to bottom, rgba(7,10,12,0) 0, rgba(7,10,12,0.45) 28%, rgba(7,10,12,0.45) 78%, rgba(7,10,12,0) 100%); }` → ≈ 6,6:1 calculé sur la boîte verte.
- Règle de méthode : un mot d'accent n'a jamais la couleur de ce qui est derrière lui. 005 : retirer les `*…*` de « 3 000 MW » dans `text` (affichage seul, la voix ne change pas).
- 005, plans 0-9 s : remonter la cuve de ≈ 170 px à l'écran pour que son fond finisse au-dessus de 1170 (à régler au `look`).

## 10. Le tampon : un geste de marque pour les verdicts — kit, M, décision de Merwan
**Constat.** Deux moments portent l'histoire et sont minuscules. Le verdict de la puce (« CHOC RECOMMANDÉ », « CHOC REFUSÉ » — « c'est elle qui décide ») : 23 px dans un cadre de 2 px, invisible à 270 px (`film_06.jpg`, vignettes 7-8). Le nom du compte qui « s'allume à la chute » : 21 px dans un coin (`f006_59.5.png`) ; personne ne le voit s'allumer.
**Proposition.** Un dispositif `.stamp` — le tampon d'un dossier — qui claque :
```css
.stamp { position: absolute; padding: 10px 22px 12px; border: 5px solid currentColor; background: rgba(7, 10, 12, 0.6); font: 800 64px/1 var(--display); letter-spacing: 0.06em; text-transform: uppercase; white-space: nowrap; }
```
```js
export function stamp(tl, sel, at, hold) {
  tl.fromTo(sel, { opacity: 0, scale: 1.7, rotation: -9 }, { opacity: 1, scale: 1, rotation: -4, duration: 0.14, ease: "power4.in", immediateRender: false }, at);
  tl.fromTo(sel, { x: 0 }, { x: 5, duration: 0.03, ease: "none", yoyo: true, repeat: 3 }, at + 0.14);
  if (hold != null) tl.to(sel, { opacity: 0, duration: 0.2, ease: "power2.in" }, at + hold);
}
```
Usages : 006 `main.js:317` et `:383` (les deux verdicts, 52 px, à droite du statut) ; et, dans tous les films, **« DÉCODÉ »** en veille à `decodedAt` (`brandHud`), dans la zone haute, pendant que le nom s'allume dans l'en-tête. Le même geste à chaque épisode, au moment où le spectateur a compris : c'est ce qu'on retient d'un compte. Trois couleurs, deux polices, « le dossier » : rien ne sort de l'identité, mais c'est un élément de signature nouveau — à lui de trancher.

## 11. Détails de cohérence — kit, S
- `#gauge-status` et `#scope-status` n'ont pas de `text-transform` (`brand.css:249`, `:175`) : « Sous tension — elle serre » est le seul texte mono en bas de casse du 005 (`f005_33.0.png`). Corrigé au § 7.
- Callout « CONDENSATEUR / IL STOCKE LE CHOC » : le libellé commence à x = 68, sous `--safe-l` 88 (`f006_28.9.png` ; 006 `main.js`, les `co.add({ …, align: "end" })` autour de la ligne 277). Dans `createCallouts.add` : `if (align === "end") box.style.maxWidth = (x - 88) + "px"`, ou choisir `x` ≥ 88 + largeur.
- Le titre du callout redit le sous-titre (« UN CONDENSATEUR ») ; ce qui apporte quelque chose — « il stocke le choc » — est le plus petit. Avec `.co__s` à 26 px encre (§ 7), l'écart se réduit.
- `#retitle-strike` déborde de 8 px à gauche (x = 80) : `left: 0`.

## 12. Mouvement : un seul geste pour tout — kit, M
**Constat.** Tous les panneaux entrent par le même fondu + 24 px, `power3.out`, 0,35 s (006 `main.js:103`, 005 `main.js:99`, `overlay.js:276`, `:294`) : propre, mais c'est le geste par défaut de tout gabarit. Les sorties (0,25 s, `power2.in`) sont déjà plus courtes que les entrées : bien.
**Proposition.** Un `panelIn` dans le kit : le cadre se déroule depuis la gauche (`clipPath: inset(0 100% 0 0) → inset(0 0% 0 0)`, 0,32 s, `power3.inOut`), puis ses enfants montent en décalé (`y: 10 → 0`, `opacity`, 0,22 s, `stagger 0.06`, à +0,14 s) : en-tête, valeur, statut — l'ordre de lecture. Sortie : `opacity → 0` en 0,2 s. Attention au piège connu : `immediateRender: false` sur un panneau rejoué.

---

## Ordre et effort
1. Une demi-journée, sans risque : § 5, § 6, § 4, § 11, puis § 3. → `look` sur 0,05 / 33 / 55,5 / 59,5 / 76,5 / 78,5 s.
2. Une journée : § 1 et § 2 (prototypes prêts, à porter dans `overlay.js`), § 7, § 9.
3. Après accord : § 10. Ensuite § 8, § 12.
Tout est gratuit (aucun mot dit ne change) ; 005 et 006 se rendent de nouveau (`render --draft`, `qa`, `render`).

## À ne pas casser
- Sous-titres 94 px Barlow Condensed 800 en capitales : c'est le texte le plus lisible du film à 270 px.
- Le chrono mono 52 px et le compteur qui change de couleur au dénouement (`f006_59.5.png` : « CHANCES 72 % » passé au vert).
- Un seul panneau à la fois dans la zone haute : respecté sur toutes les images vues.
- Les trois couleurs avec leur sens ; le barré signal puis la correction en veille du titre de chute.
- La réponse qui se tape toute seule (`typeAnswer`) et la barre caviardée : bonnes idées, à agrandir, pas à remplacer.
- Dernière image = première image : toute modification de la carte 0 se répète sur la copie de boucle.

## À vérifier (non testé ici)
- Largeurs réelles en Barlow Condensed 800 : 136 px (« ARRÊTE LE CHAOS »), 260 px (« RIEN »), `#cta-q` 60 px, plaque `#next-cta` 54 px.
- Carte d'accroche à 72 % : l'allumage mot à mot reste-t-il visible ? Sinon 0,65.
- Bloc de sous-titres de deux lignes pendant le CTA commentaire : pas de contact avec `#rail-comment` agrandi (x 790-890).
- `#hook-shade` à 0,45 sur l'image 1 du 006 : la lueur rouge du sol doit rester (sinon 0,35).
- `clipPath` et `max-width` animés : passer `npm run check` (rendu déterministe).
- Contraste `check` des nouveaux libellés d'actes.

## Mesures brutes
| Élément | Instant | Rapport |
| --- | --- | --- |
| Carte éteinte (encre 50 %), 006 sol rouge / 005 noir | 0,05 s | 4,3:1 / 4,4:1 |
| La même à 72 % | 0,05 s | 7,9:1 |
| Veille ou encre sur la boîte verte (carte 3, 006) | 8,5 s | 2,8:1 |
| « 3 000 MW » signal sur le cœur (005) ; encre au même endroit | 11,8 s | 2,6:1 ; 6,5:1 |
| Mot à venir d'un sous-titre (encre 34 %) | 006, 14,5 s | 2,7:1 |
| Actes éteints du HUD | 0,05 s | 2,0:1 |
| « ARRÊTE LE CHAOS » veille sur le torse ; kicker 26 px | 59,5 s | 12,6:1 ; 6,0:1 |
| Chevrons veille sur le sol vert | 67,4 s | 8,4:1 |

| Sous-titres | lignes | fautives | sous 0,45 s |
| --- | --- | --- | --- |
| 005 actuel / proposé | 91 / 70 | 19 / 4 | 12 / 0 |
| 006 actuel / proposé | 87 / 74 | 14 / 4 | 11 / 0 |

« Fautive » = finit sur un mot-outil, ou dure moins de 0,45 s, ou mot-outil seul. Les 4 restantes du découpage proposé sont toutes des premières lignes d'un bloc de deux lignes.

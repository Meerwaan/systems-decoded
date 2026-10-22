# HS02 — brief de la promo du L02 : le poste haute tension, premier « Accès interdit »

Écrit le 2026-10-20. **Script proposé, pas encore validé par Merwan** : rien n'est enregistré. À fabriquer par l'agent `promo` (`.claude/agents/promo.md`), selon `docs/recette-promo.md`, sur le modèle du HS01 (`docs/HS01-brief.md`, `episodes/HS01-pare-brise/`).

## Ce qui rend celle-ci spéciale

- **Le long** : `episodes/L02-poste-haute-tension/`, rendu le 2026-10-20, **9 min 10** (`renders/L02-poste-haute-tension.mp4`, 550 s). Cartouche : **« FILM COMPLET · 9 MIN 10 »** (`filmCall`).
- **Son titre YouTube** (`post.youtube.title`) : « Coupée, mais encore mortelle : les 5 gestes qui te gardent en vie à 400 000 volts » — l'accroche de la promo le reprend (A : coupée, et elle peut te tuer ; B : cinq gestes). Miniatures : l'arc dans la chambre (COUPÉE / ET MORTELLE), les pinces (5 GESTES), la nacelle (SANS COUPER).
- **C'est le premier long d'une nouvelle série, « Accès interdit »** (un lieu où tu n'entres jamais, décodé à travers une intervention) : la phrase de lancement l'annonce, comme celle du HS01 annonçait les longs.
- **Le public visé en premier : les électriciens**, qui partagent les vidéos du compte. Vocabulaire du long, au mot près (consignation, habilitation, sectionneur, vérification d'absence de tension) — mais la promo n'en a besoin que de très peu.
- Rien à créer dans le kit : la série hors-série, `filmCall`, `#film`, les outils `HSnn` existent depuis le HS01. Deuxième acte : **« 02 LE POSTE »** (`"acts": ["01 Menace", "02 Le poste", "03 Rendez-vous"]`).

## Ce qui ne se dit PAS (les réponses du long)

- **Pourquoi le détecteur ne voit rien** : la tension que la voisine fait naître dans ta ligne (`vat4`, `induit1`, `induit2`). La promo dit qu'il ne réagit pas et demande si tu le crois ; jamais ce qu'il rate.
- **L'ordre des pinces** (côté terre d'abord, côté terre en dernier : `malt2`, `regle`). La promo demande si tu connais le bon ordre ; jamais lequel.
- **L'hélicoptère** (`tst2` à `tst4`) : ni dit ni montré. On dit qu'on répare parfois ces lignes sans couper ; l'image montre la nacelle et son câble qui monte hors du cadre, jamais ce qui la porte.
- **La chute** : « Une ligne coupée n'est pas une ligne morte », « ce qui te garde en vie, c'est la terre » ; et le paradoxe de `malt5` (« on fabrique un court-circuit, exprès »), trop proche de la chute.
- **Ce qui t'arrive pendant l'incident** (`defaut` → `calme`) : le teaser du test coupe au noir sur « un court-circuit ».
- Aucun chiffre que le long ne dit pas tel quel ; aucune recherche neuve.

## Le script proposé (≈ 190 mots dits ; à 3,3 mots/s ≈ 58 s, ≈ 62-64 s avec les silences)

| Beat | Texte | Direction | Payé dans le L02 par |
| --- | --- | --- | --- |
| `accroche` · A | [400 000 V\|Quatre cent mille volts]. La ligne est *coupée*… et elle peut encore te tuer. | `[tense]` | `accroche`, `vat4`, `induit2`, `chute` |
| `promesse` · B | Pour rentrer chez toi, tu as cinq gestes. | `[serious]` | `promesse`, `tst5`, `recap` |
| `curiosite` · C | Et le dernier, dans le *mauvais* ordre… tue. Le bon, tu le connais ? | `[conversational, curious]` | `curiosite`, `virginie`, `apprenti`, `regle` — **pas payé dans la promo (voulu)** |
| `lancement` | Nouvelle série : +Accès interdit+. Les endroits où tu n'entres jamais. Le premier : un poste à quatre cent mille volts. | `[warm, conversational]` | le L02 entier (série « Accès interdit », `abo` : « un autre endroit où tu n'entres jamais », `lieu`) |
| `champ` | Sous la ligne, sans rien toucher… tu baignes déjà dedans. Et tu ne sens rien. | `[curious]` | `champ` (« tu baignes dans un champ électrique […] Et tu ne sens rien ») — le mot « champ » n'est pas dit |
| `arc` | Couper ce courant, c'est éteindre un éclair qui approche les vingt mille degrés. Et pour ça… on attend un instant très précis. | `[conversational, curious]` | `disj2`, `disj3` (« approche les vingt mille degrés »), `disj4` (le passage par zéro) |
| `gravier` | Et le gravier, partout au sol ? Ce n'est *pas* pour faire propre. | `[warm, conversational]` | `gravier` (la phrase même, sans sa réponse) |
| `sanscouper` | Et parfois, ces lignes, on les répare… sans jamais couper le courant. | `[curious]` | `tst1` à `tst4` (l'hélicoptère n'est ni dit ni montré) |
| `detecteur` | Ton détecteur ne réagit pas. Tout a l'air *mort*. Tu le crois ? | `[conversational, curious]` | `vat3` (« Tout a l'air mort »), `vat4`, `induit2` |
| `test` | Tu montes. Juste à côté, sa voisine est toujours *sous tension*. Et là, à des kilomètres… un *court-circuit*. | `[serious]` | `defi`, `pret`, `orage` ; coupe au noir avant `defaut` |
| `ouvre` | Alors… on l'ouvre. | `[nonchalant, confident]` + `[short pause]` (celle du HS01) | `ouvre`, `couches` |
| `pasici` | Pas ici. | `[amused]` | — (le gag) |
| `youtube` | Neuf minutes, tout en haut du poste : elles t'attendent sur notre chaîne +YouTube+. Le lien est en bio. | `[warm, conversational]` | — (cartouche « FILM COMPLET · 9 MIN 10 ») |
| `boucle` | Et tu sauras enfin ce qui t'attend, là-haut, à… | `[calm]`, virgule finale dans `vo` | retombe sur « Quatre cent mille volts » |

L'accroche A · B · C fait 31 mots : elle finit vers 9-10 s. Si la voix la fait finir après 10 s, couper « encore » dans A, puis « chez toi » → « Pour rentrer, tu as cinq gestes. ». Actes : **01 MENACE** = `accroche` → `curiosite` ; **02 LE POSTE** = `lancement` → `test` ; la porte `ouvre` / `pasici` ; **03 RENDEZ-VOUS** = `youtube` → `boucle`. Le nom du compte s'allume sur « notre chaîne YouTube » (`D.verdict`). `hold` : ≈ 0,4 s après C, ≈ 0,5 s sur le noir du `test`, ≈ 0,5 s après « on l'ouvre », ≈ 0,6 s après « Pas ici. », ≈ 1,2 s après `youtube`.

## Ce qui tire encore sur la règle (pas bloquant)

- **A dit « coupée… et elle peut encore te tuer »** : c'est la promesse du titre et de la miniature (COUPÉE / ET MORTELLE), sans le pourquoi. Gardée.
- **C dit que le dernier geste tue « dans le mauvais ordre »** : le long le dit à sa 15ᵉ seconde (`curiosite`). Ni « pince » ni « terre » ne sont prononcés ; l'ordre reste dans le long.
- **`champ` n'est qu'à moitié un fil** (« tu baignes dedans » : dans quoi ?) ; c'est le premier qui saute si le film dépasse 65 s.
- **`arc` dit qu'on attend un instant précis** : il ne dit ni lequel ni avec quoi on souffle l'arc.

## Les plans prévus (tout vient du L02, recadré en 9:16)

`src/world.js` importe `buildWorld`, `FIRST`, `SET`, `AT` etc. de `episodes/L02-poste-haute-tension/src/world.js` tels quels (comme `HS01/src/world.js` importe le L01) ; jamais `main.js`, `chapters.js` ni les chapitres `c*.js` du long (16:9) — on y lit les poses, on ne les importe pas. Un plan naît du précédent ; un nouveau plan toutes les 2 à 4 s.

| Beat | Plan | Pris dans |
| --- | --- | --- |
| `accroche` | **Première image**, choisie sur une planche de quatre : le conducteur 400 kV de près, la tête du détecteur muette contre lui, la voisine qui luit en signal derrière (le premier plan du long) ; candidates : l'arc dans la chambre de la miniature, toi au pied du portique la nuit, les pinces sur les trois phases. Ça bouge dès l'image 1 | `c1-ouverture.js`, `model.js` (perche, détecteur), `ligne.js` |
| `promesse` | Cinq repères qui s'allument un à un sur le poste (le cinquième respire en veille) | `c1-ouverture.js` |
| `curiosite` | Le pylône de nuit, deux pinces de verre : aucune ne s'allume, on ne voit pas laquelle part en premier | `c6-retenir-fin.js` (Virginie 1987), `ligne.js` |
| `lancement` | Recul : le poste entier aux rayons X, la nuit, portiques et jeux de barres | `c2-terre-disjoncteur.js` (le lieu), `poste.js` |
| `champ` | Sous les conducteurs, toi de verre debout ; les lignes de champ montent du sol, en signal, sans étiquette | `c2-terre-disjoncteur.js` (`champ`) |
| `arc` | La chambre du disjoncteur : les contacts s'écartent, l'arc naît — **coupe avant que le gaz ne souffle** | `c2-terre-disjoncteur.js` / `c3-gaz-helico.js` (`disj2`, `disj3`), `model.js` |
| `gravier` | Plongée au sol : la couche de gravier, le maillage dessous à peine visible, sans cote ni résistance dessinée | `c2-terre-disjoncteur.js` (`gravier`), `poste.js` |
| `sanscouper` | Une ligne vivante au crépuscule, en signal ; la nacelle entre dans le cadre par le haut, son câble file hors champ — l'hélicoptère n'est jamais vu | `c3-gaz-helico.js`, `ligne.js` |
| `detecteur` | La tête du détecteur se présente à une phase, voyants éteints ; tout se détend… et la voisine luit derrière | `c4-separer-verifier.js` (`vat2`, `vat3`) |
| `test` | Tu montes au portique ; la voisine en signal à côté ; au loin, un arc sur la voisine — **noir** | `c5-terre-incident.js` (`pret`, `orage`) |
| `ouvre` | La travée sur l'établi qui commence à s'éclater sur le mot → **noir** | `c1-ouverture.js` (`ouvre`, `couches`) |
| `pasici` | Noir ; l'en-tête seul | — |
| `youtube` | Le poste en plan large la nuit, le cartouche « FILM COMPLET · 9 MIN 10 » en zone haute, le nom du compte s'allume | `c6-retenir-fin.js` (`abo`) |
| `boucle` | Retour au conducteur et au détecteur : la dernière image est la première | comme `accroche` |

## Ce que Merwan doit trancher

1. **Le script ci-dessus** (oui / non), en particulier l'accroche et la phrase de lancement de la série.
2. **La voix** : le coût affiché par `npm run voice -- HS02` le jour même (une requête, `eleven_v4_turbo`).

## Publication

Le L02 sort d'abord sur YouTube ; HS02 dans l'heure, sur TikTok, Instagram, Facebook et Shorts. Shorts : « vidéo associée » → le L02. Instagram : lien en bio + story à autocollant de lien. TikTok : lien en bio s'il est actif, sinon « Sur YouTube : Coupée, mais encore mortelle : les 5 gestes qui te gardent en vie à 400 000 volts » en épinglé. Facebook : le lien en premier commentaire. Cinq hashtags au plus par plateforme. Merwan publie.

# L02 — Consigne commune des relecteurs de chapitre (2026-10-19)

Tu relis UN chapitre du script du L02 (« Poste haute tension », série « Accès interdit », YouTube 16:9, ≈ 8 min 50). Le but de Merwan : un rendu « pro et quali », un public tenu en haleine du début à la fin, une grande partie d'électriciens habilités qui commenteront la moindre erreur. Tu améliores ton chapitre ; tu ne réécris pas le film.

## À lire (et rien d'autre)

1. Le script : `episodes/L02-poste-haute-tension/episode.json`. Extrais-le par node, sans le lire en entier :
   `node -e "const e=require('./episodes/L02-poste-haute-tension/episode.json');for(const b of e.beats)console.log(b.id,'|',b.chap||'','|',b.text,'||',b.vo.match(/^\[[^\]]+\]/)[0])"`
   Lis tout le film une fois (pour les raccords et les fils ouverts), puis concentre-toi sur TES beats.
2. Les faits : `docs/faits/L02-poste-haute-tension.md` (cherche ce dont tu as besoin avec grep ; sections « Compléments du 2026-10-19 » et « À ne pas dire ») et `docs/faits/L02-contre-verification.md`.
3. Le style : CLAUDE.md, sections « La règle qui passe avant tout : storytelling et rétention » et « Le format long (YouTube) » (grep par titre, lis ces deux sections seulement).

## Ce que tu cherches

- **La tension** : chaque phrase relance (un fait, une question, une menace), aucune phrase à plat, aucune phrase qu'on pourrait couper sans perte. Le chapitre finit sur une relance vers le suivant.
- **Le raccord** : ta première phrase naît de la dernière du chapitre d'avant ; ta dernière ouvre le suivant.
- **L'exactitude et le vocabulaire de métier** : rien qui ne soit dans les faits (niveau A ou B de préférence) ; ce qui est dans « À ne pas dire » ne s'écrit pas ; le mot juste pour un électricien (conducteur, circuit, consignation, chargé de consignation, chargé de travaux, attestation, VAT, MALT-CC, zone équipotentielle…) sans perdre le grand public (un mot technique s'explique en cinq mots la première fois).
- **L'oreille** : phrases courtes, une idée par phrase, tutoiement, présent ; des points là où l'on mettrait des virgules quand ça presse ; des « … » pour le poids. Les chiffres s'écrivent `[63 000 A|soixante-trois mille ampères]` (affiché | dit). Jamais d'unité à symbole dans le texte dit.
- **L'image** : chaque phrase doit pouvoir se montrer (« chaque phrase a sa démonstration »). Pour chacun de tes beats, une note d'image de 15 mots au plus (ce qu'on voit pendant qu'elle est dite, et le raccord avec le plan d'avant).

## Ce que tu ne touches pas

- « Alors… on l'ouvre. » (beat `ouvre`) : intouchable.
- Les identifiants des beats, leur ordre, les champs `chap`, `midroll`, `hold` (tu peux proposer un `hold` différent avec sa raison).
- Les mots qui portent un repère : `ouvre` « on », `orage` « lâche », `chute` « jamais », `calme` « sec », `boucle` « reste ». La dernière phrase (`boucle`) doit retomber sur les premiers mots de l'accroche (« Quatre cent mille volts »).
- La longueur : ton chapitre garde son nombre de mots à ±15 %. Pas de remplissage.
- Les balises de voix : une seule par beat, en tête, prise dans cette liste — `[conversational, curious]`, `[warm, conversational]`, `[curious]`, `[serious]` (menaces), `[amused]` (paradoxes ; quatre au plus dans tout le film : `climat`, `gravier`, `tst1`, `malt5` les ont déjà), `[warm]` (appels à l'action), `[tense]` (accroche seulement), `[calm]` (`ouvre` et `boucle`). Jamais trois fois la même de suite.
- Aucune recherche web, sauf pour vérifier un fait que tu voudrais AJOUTER (3 requêtes au plus, source lue, sinon tu ne l'ajoutes pas).
- Tu ne modifies aucun fichier. Tu n'écris rien sur le disque.

## Ton message final (c'est tout ce qui sera lu)

```
CHAPITRE : <nom>
VERDICT : <une phrase : ce qui tenait, ce qui ne tenait pas>
CHANGEMENTS :
<id> | <balise> | <nouveau texte complet, avec * + et [affiché|dit]> | <raison en 10 mots>
(seulement les beats changés ; « aucun » sinon)
IMAGES :
<id> | <note d'image, 15 mots au plus>
(tous tes beats)
RÉSERVES : <ce qu'un électricien pourrait encore contester, ou « aucune »>
```

# Recette du son (depuis le 12/11)

Merwan, le 12/11 : les SFX sont « vraiment éclatés au sol… juste des ting, boum, bah ». Mesuré : 43 à 60 sons synthétisés par court (043 à 045), un toutes les 1,5 à 2 s, presque tous posés juste après un mot (`mot$+0.06`). Ils soulignaient la voix au lieu de faire entendre l'image, parce qu'ils étaient écrits avec le script, avant que l'image existe. Le plan en 13 étapes ci-dessous a été validé en entier par Merwan le 12/11.

Cette recette vaut pour les courts à partir du 043 (043 à 046 ne sont pas publiés) et pour les longs à partir du L07. On ne touche pas aux films en ligne.

## 1. Les règles

1. **Un son = un mouvement à l'image.** Ce qu'on voit bouger fait son bruit : le verrou claque quand il se ferme, le moteur gronde quand il s'allume, la pièce glisse quand l'éclaté s'ouvre. Jamais un son pour souligner un mot de la voix ; un repère `beat:mot` ne sert qu'à caler un son sur l'image qui montre ce mot.
2. **12 à 18 sons ponctuels par film** (tout ce qui a un `at`). Ils vont sur les coupes et sur cinq moments : la première image, « Alors… on l'ouvre », le climax, la chute, la boucle. `npm run script` signale au-delà de 18.
3. **Un ton par acte** :
   - MENACE : dense et grave — l'ambiance du lieu, le danger qui monte (`riser`, `amb-tension`).
   - « Alors… on l'ouvre » : `aspiration` vers le blanc, la phrase dans le blanc total, puis la signature `sig-ouverture` juste après.
   - AUTOPSIE : aérée, précise — de petits bruits mécaniques réels (`clic-mecanisme`, `verrou`, `pieces-glissent`), espacés.
   - RÉPONSE : le pic — le vrai bruit du système qui agit (`pyro`, `moteur-fusee`, `hydraulique`…), un `impact-lourd` au plus.
   - Chute : sèche, un seul coup (`impact-sec`) ou rien.
   - Appels à l'action : presque rien ; l'ambiance redescend.
4. **« Alors… on l'ouvre » se dit dans un blanc total** (Merwan, 12/11 : « pendant le alors, on l'ouvre, il doit pas y avoir de SFX… ça doit être blanc. Et c'est ça qui fait que les gens ils aiment bien ») : `hush` de `ouvre` à `ouvre$+0.02`, `depth` −90 — ni ambiance, ni tension, ni signature pendant la phrase. L'`aspiration` y mène avant ; la signature `sig-ouverture` tombe **après** « l'ouvre », dans le souffle avant l'éclaté (`ouvre$+0.16`, puis le glissement à `ouvre$+0.38`, 0,55 s). **Le silence est un outil** : un vide aussi juste avant la chute. Un son qui tombe après un silence compte double.
5. Inchangé : jamais un son sur un mot (`breathAfter`), les sons entre 600 Hz et 5 kHz dans les souffles, la voix devant tout.

## 2. Les sons eux-mêmes

6. **La banque** : `kit/sons/banque.json`, 40 sons enregistrés (effets sonores ElevenLabs) faits une fois, réutilisés partout : signature, impacts, transitions, mécanismes, danger, signaux, ambiances en boucle. Ponctuels à une crête de −1 dBTP, boucles à −20 LUFS : un `gain` se lit pareil d'un son à l'autre. Chaque fiche (durée, niveau, devis) est dans `kit/sons/banque-fiches.json`. Fabriquée le 12/11 : 1 662 crédits annoncés, ≈ 1 694 facturés au solde. Écoute : `kit/sons/ecoute-banque.mp3` (minutage dans `ecoute-banque.txt`).
   - **Le solde se met à jour en retard** (plusieurs sons d'un coup) : `npm run sons` attend qu'il soit stable avant de commencer et compare les totaux. ElevenLabs refuse au-delà d'≈ 30 requêtes d'affilée (429) : l'outil attend et réessaie.
   - **`sig-ouverture` a deux temps** : un claquement (0 → 0,3 s), 1,6 s de silence, puis un glissement (1,75 → 2,9 s). Le modèle joue les deux collés (`dur` 0,3, puis `offset` 1,75 à +0,22 s).
7. **Les sons du sujet, dans chaque film (court ou long)** — Merwan, le 12/11 : « si on met un ding sur un coup de pistolet, ça marche pas… faut que ce soit cohérent à chaque fois ». La banque est générique par construction ; elle ne connaît aucun sujet.
   - **Dès le script**, `episode.json → sons` liste les objets et gestes réels que l'histoire montre, chacun avec son vrai bruit : `{ "id": "044-balle-impact", "image": "la balle frappe le gilet", "duree": 1.5, "prompt": "…" }` pour un son à fabriquer (id préfixé du dossier, prompt en anglais, à la manière de `banque.json`), ou `{ "id": "…", "image": "…", "reprend": "verre" }` quand la banque a déjà **le bon** son. Un son générique (impact, whoosh) ne reprend jamais un objet réel : un coup de feu est un coup de feu.
   - **Le devis va avec la voix** : le message unique à Merwan donne l'accroche, le budget voix et le budget sons (`npm run salle`, `npm run voice` impriment la ligne « sons ») — les sons à fabriquer, plus une **réserve de 99 crédits** (9 s) pour ce que le monteur son découvre en regardant l'image, dépensée seulement si elle sert.
   - **Après son oui** : `npm run sons -- <ep> --budget <devis>` fabrique les sons du film. Chacun entre aussitôt dans `banque.json` avec `"sujet": "<ep>"` : **le film suivant qui montre la même chose le reprend**. Un son de sujet qui sert dans un deuxième film perd son `sujet` et devient commun. La banque grandit avec les films ; à terme on ne fabrique presque plus rien.
   - **Avant d'écrire un son à fabriquer**, chercher dans `banque.json` (familles, `image` et `prompt` des sons de sujet déjà faits) : ce qui existe et colle se reprend.
8. **La signature** : `sig-ouverture` sur « Alors… on l'ouvre », `sig-dossier` sur la première image, `sig-boucle` sur la boucle. Les mêmes dans tous les films : le compte se reconnaît à l'oreille.
9. **La musique** : à décider à part (source et coût). En attendant, `amb-tension` remplace le `drone` synthétisé sous la menace.

Les synthés de `scripts/sfx.mjs` restent pour ce qu'aucun enregistrement ne fait mieux : `hush` (le silence), `drop`, `space` (la pièce commune). `click`, `hit`, `swish`, `blip`, `impact`, `whoosh` ne s'écrivent plus dans un court neuf.

### La cohérence, son par son

Chaque son du film a sa ligne dans le journal du monteur son : **l'instant · ce qui bouge à l'image · sa matière (métal, verre, tissu, air, feu, électricité, eau…) · son geste (choc, frottement, déchirure, souffle, explosion…) · le son choisi · pourquoi il colle**. Un son dont la matière ou le geste ne correspond pas à l'image sort du film, même s'il « sonne bien ». Les sons génériques de la banque ne servent qu'à ce qui n'est pas un objet : les coupes, la signature, les ambiances, le silence.

## 3. Le mixage

10. **Une même pièce** : `{ "type": "space" }` en tête de liste sur un court, pour que les sons ponctuels sonnent dans le même lieu (il n'existait que sur les longs). Un son de `sample` y entre avec `"bus": "main"`.
11. **Les ambiances en stéréo** sous la voix (`"loop": true`, bus `under`, elles s'effacent de `duck` dB quand on parle) ; les ponctuels sur le bus `fx` (−7 dB sous une phrase).
12. **La voix plus présente** (clarté dans les médiums, « s » adoucis) : à essayer à l'oreille de Merwan avant d'entrer dans `masterVoice` — sa chaîne est volontairement sans égaliseur depuis le début.

## 4. Écrire un son

```json
{ "type": "space", "mix": 0.18 },
{ "type": "sample", "file": "amb-tension.wav", "loop": true, "from": 0, "to": "ouvre", "gain": -26, "curve": [[0, 0.7], ["toscene", 1]] },
{ "type": "sample", "file": "sig-dossier.wav", "at": 0.02, "gain": -14, "bus": "main" },
{ "type": "hush", "from": "ouvre", "to": "explode-0.02", "depth": -14 },
{ "type": "sample", "file": "aspiration.wav", "to": "ouvre-0.04", "at": "ouvre-1.5", "gain": -18 },
{ "type": "sample", "file": "sig-ouverture.wav", "at": "explode", "gain": -15, "bus": "main" }
```

`at` (instant de départ), `to` (fin), `dur`, `offset` (sauter le début), `fade`, `pan` (−1…1), `curve` (une boucle qui respire avec l'histoire), `bus` (`fx` par défaut, `under` pour une boucle, `main` pour qu'il entre dans la pièce).

## 5. Qui fait quoi

13. **Le son se fait après l'image.** Le scénariste n'écrit plus de sons ; les actes n'en demandent plus. Un rôle neuf, `monteur-son` (`.claude/agents/monteur-son.md`), passe une fois les actes montés et avant le brouillon : il regarde les planches, écrit toute la liste `sfx` d'un coup, rend un extrait accroche → « on l'ouvre » que Merwan écoute.

## 6. Les outils

- `npm run sons` : ce qui manque à la banque et le devis ; `--budget N` fabrique (plafond sur ce qui est facturé) ; `--only a,b --force` refait des sons. Rien sans l'accord de Merwan sur le devis du jour.
- `npm run sfx -- <ep>` : refait `audio/bed.wav` seul.
- `npm run script -- <ep>` : compte les sons ponctuels, signale un synthé de l'ancienne recette.

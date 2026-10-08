# Nuit du 8 octobre 2026 — 009, 010, 011 préparés sans voix (journal de l'orchestration)

Demande de Merwan (≈ 6 h, avant d'aller dormir) : « prépare 3 vidéos d'avance sans les voix ». Aucun crédit ElevenLabs dépensé : le minutage des trois films est ESTIMÉ (`npm run script -- <ep>`), la vraie voix sera ≈ 20 % plus courte et tout se recale seul (les actes ne lisent que des repères du script).

## Où en est chaque dossier (tenu à jour au fil de la nuit)

| | 009 Micro-ondes | 010 Scie sur table | 011 Fusible pyro |
| --- | --- | --- | --- |
| Faits + contre-vérification | `docs/faits/009-*.md` | `docs/faits/010-*.md` | `docs/faits/011-*.md` |
| Script (`episode.json`) | écrit, corrigé | écrit, corrigé | écrit, corrigé |
| Décors / modèle | `kitchen.js`, `model.js`, `waves.js` | `shop.js`, `model.js` | `car.js`, `pack.js`, `model.js` |
| Plan de mise en scène | `docs/009-actes.md` | `docs/010-actes.md` | `docs/011-actes.md` |
| Actes | 1, 2, 3, fin montés · relus sur planches · `check` passe | idem · `check` passe | idem · `check` passe |
| Brouillon / `qa` | aucune image parasite | aucune image parasite | aucune image parasite (une à 3,73 s au premier brouillon : la caméra traversait le vitrage pendant la plongée de l'accroche — la coque s'efface maintenant le temps de la traversée) |
| Aperçu muet | `renders/009-micro-ondes-apercu-muet.mp4` | `renders/010-scie-apercu-muet.mp4` | `renders/011-fusible-pyro-apercu-muet.mp4` |
| Couverture | faite, relue | faite, relue (caméra à `el` 29) | faite, relue |

## La voix (accord de Merwan en fin de matinée : « Tu peux lancer les rendus voix, go »)

Trois prises par film, 2 130 crédits dépensés (690 + 717 + 723 ; 2 180 annoncés ; solde 21 793). Aucune phrase criée. Durées : **009 78,9 s · 010 83,5 s · 011 87,7 s**. Signalé par la mesure : 009 — l'accroche et la promesse sortent graves (−2,6 et −2,4 dt, prise 2), la chute à −4,2 dt ; 010 — « Alors… on l'ouvre » : pause non jouée ; 011 — « tu le savais ? » : question qui tombe, tout le film sur la prise 3. Rien n'est repris sans son écoute (cabine : `npm run front` → Voix). Reste après la voix : la passe phrase par phrase, `check`, rendu, `qa`.

## Comment c'est fabriqué (pour reprendre après une coupure)

- Les trois `episode.json` sont ÉCRITS PAR UN GÉNÉRATEUR gardé hors dépôt (dossier temporaire de la session : `scratchpad/scripts.mjs` + `patch*.mjs`). S'il n'existe plus, les `episode.json` du dépôt font foi : les modifier directement.
- Les pages `index.html` du 010 et du 011 viennent de `scratchpad/pages.mjs` (même remarque) ; celle du 009 est écrite à la main.
- Planches de relecture : dossier temporaire `scratchpad/009|010|011/` — jamais dans `renders/`.
- Chaque agent a laissé son journal : `docs/journal/<ep>-<fichier>.md` (poses, « À changer ailleurs », ce qui n'est pas au niveau).

## Retouches demandées par les actes

Faites : tout ce qui touchait `episode.json` (repères, sons, silences), les horloges et compteurs de `main.js`, `POSE0` des trois films, `STAGED`, les étincelles du 010 qui ne s'arrêtaient pas, le plateau miroir du 009, `snap` → `broken` dans le 011.

Pas faites (à reprendre avec la vraie voix, pendant la passe phrase par phrase) :

- **009** : une tête de lumière sur le fil du troisième interrupteur (`model.js`) ; l'anneau parasite sur ta bouche vu de l'intérieur de la cavité (`waves.js`) ; la trame de la plaque entre d 40 et d 90 vue de biais.
- **010** : `shop.js` — figer la sciure en l'air quand `blur` tombe, au lieu de l'éteindre ; l'index arrive 1,9 mm sous `TOUCH` (avertissement console) ; la main de près reste un mannequin.
- **011** : `pack.js` — le fil de l'ordre ne s'efface ni avec `pack` ni avec `shell`, et finit 1 cm devant le connecteur du fusible ; plus de lueur de la batterie vue de loin pour « Restés dans la batterie » ; `model.js` — l'arc est mince, l'embase de la charge brille.

## À dire à Merwan au réveil

- Trois accroches à valider + un budget voix (≈ 3 × 730 crédits) : rien n'est enregistré.
- Le 008 est repassé en minutage ESTIMÉ : son script a reçu le beat `seuil` après l'enregistrement (≈ 40 crédits de reprise à lui demander).
- 011 : « Ce qui est orange, tu n'y touches jamais » et l'épinglé (18 / 112) ne sont pas une consigne officielle française — à valider par lui. L'annonce du 012 (gazinière) reste à sourcer.
- Les trois films ont été montés sur un minutage estimé : une passe phrase par phrase est à prévoir une fois la voix posée.

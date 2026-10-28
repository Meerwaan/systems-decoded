# Salle d'écriture — l'outillage (27/10)

Lot « outillage » de la salle d'écriture : une commande qui met un lot de scripts sur une page, et des contrôles mécaniques de plus pour un script écrit par un agent. Aucun crédit dépensé, aucun `episode.json` touché, pas de commit.

## Ce qui a été ajouté

- **`npm run salle -- <ep> [<ep>…]`** (`scripts/salle.mjs`, `case "salle"` dans `scripts/sd.mjs`, entrée `package.json`, aide à jour). Par dossier : accroche (beats avant `scene`, texte affiché), mots dits (film / accroche / scène, la mesure d'`ecriture.mjs`, exportée en `mesures()`), durée, mot-choc et sa seconde, ✗ et ⚠, devis voix. Puis le total et un verdict. Détail des ⚠ dans `.cache/logs/salle-<dossiers>.log`, ou `--verbose`. Un argument introuvable devient une ligne ✗, la commande continue (sortie 1 s'il y a un ✗).
- **Le devis est celui de `npm run voice`**, même code : `scripts/voice.mjs` exporte `planVoice(dir, opts)` (le plan et le texte des requêtes, sans rien mesurer ni écrire ; `fresh: true` = comme si le disque était vide) et `estimateVoice(plan)` (le contrôle `alignTokens` gratuit, puis `creditRate`, puis le coût). `voice()` les appelle à la place de son code d'avant, sans autre changement. Preuve : sur des copies sans voix de 026 et 030, l'ancien `voice.mjs` et le nouveau impriment les mêmes lignes au caractère près (« 1 prise complète ≈ 939 crédits », « --budget 950 » ; « ≈ 831 », « --budget 850 »), et `salle` donne les mêmes chiffres. `npm run script` sur 026 à 030 : sortie identique à celle d'avant (diff vide).
- **Aucun crédit ne peut partir de `salle`** : son seul appel réseau est `creditRate` (GET `/v1/models`, lecture seule, déjà utilisé par l'estimation de `voice`). `synthesize` (le seul POST text-to-speech) n'est appelé que dans la boucle d'enregistrement de `voice()`, que `salle` n'importe pas. Le tarif affiché est celui que l'API donne le jour même (0,50 crédit/caractère pour `eleven_v4_turbo` aujourd'hui) ; l'outil voix n'applique pas de facteur 0,44, donc `salle` non plus.
- **Durée sans voix** : l'estimation du minutage compte ≈ 35 % de trop (026 : 123 s estimées, 91 s dites). `salle` donne, sans voix, mots dits × 0,343 s (mesuré sur 026 à 030 : 0,335 à 0,359 s par mot, pauses comprises), et le dit.
- **✗ (ce qui empêcherait la séance)** : script illisible (repère introuvable, JSON), `vo` que la voix refuserait (`alignTokens`), « Alors… on l'ouvre » en tête d'une requête voix ou seul dans la sienne — lu sur les vraies requêtes de `planVoice`, pas sur une copie de la règle.
- **Contrôles d'écriture ajoutés** (`scripts/lib/ecriture.mjs`, `mecanique()`, avertissements) : texte du modèle resté en place (`__X__`, `#sujet1`, phrases-consignes du modèle, beat identique à celui de `kit/template/episode.json` sauf la signature) ; `vo` et chaque `voAlt` ≠ `text` (mêmes mots, même ordre, balises retirées, `[150|cent cinquante]` lu comme dit) ; `sources` vide ; `post.keyword` absent ; titre YouTube > 100 caractères ; repère `beat:mot` dont le début attrape plusieurs mots différents. Les scripts d'essai `X30…` sont lus comme des courts.

## Ce qui a été corrigé ou retiré parce que faux

- « Ta main glisse » comme marqueur du modèle : c'est la vraie accroche du 010 (le modèle a été tiré de lui). Retiré ; la comparaison au beat du modèle mot pour mot le remplace.
- Beat identique au modèle : sonnait sur `ouvre` dans tous les films (la signature est celle du modèle, exprès). Exclue.
- `vo` ≠ `text` : sonnait sur 029 (« cent cinquante ») et 030 (« deux cent trente ») — un `[150|cent cinquante]` dit en plusieurs mots. Corrigé : la forme dite est découpée en mots.
- Non ajoutés, déjà là : `[low, grave voice]`, `[dramatic]`, `[urgent]` (balises interdites), MAJUSCULES dans la voix, `!`.
- Après correction, sur 001 à 030 : aucun nouveau contrôle ne sonne sur 026 à 030 ; seul `post.keyword` manque aux 001 à 025, d'avant ce champ (vrai manque au regard de la règle, sans effet sur ces films publiés). Chaque contrôle a été vu sonner sur un 030 cassé exprès (mot changé dans `vo`, mot ajouté, `sources: []`, keyword retiré, titre de 101 caractères, `#sujet1`, beat du modèle, repère « accroche:t »).

## `npm run -s salle -- 026 027 028 029 030`

```

  Salle d'écriture · 5 dossiers · tarif lu aujourd'hui : eleven_v4_turbo 0,50 crédit/caractère

  026-soyouz-ms10 · Soyouz MS-10 · 91,1 s (voix réelle) · 0 ✗ · 0 ⚠
    « Ta fusée lâche, en pleine montée. Et ta tour de sauvetage… vient de partir. Il te reste quatre petits moteurs. Et ce qui la fait lâcher… était là avant le décollage. »
    mots dits : film 265 · accroche 31 · scène 29 · mot-choc « lâche » à 0,76 s
    voix : rien à enregistrer (déjà sur le disque) · une prise neuve coûterait ≈ 939 crédits
  027-voie-de-detresse · Voie de détresse · 86,1 s (voix réelle) · 0 ✗ · 0 ⚠
    « Ton camion n'a plus de freins. Ils ne sont pas cassés : ils sont trop chauds. Ce qui va t'arrêter ? Des cailloux. Et ce qui les a fait chauffer… c'est ton propre pied. »
    mots dits : film 253 · accroche 32 · scène 27 · mot-choc « freins » à 1,16 s
    voix : rien à enregistrer (déjà sur le disque) · une prise neuve coûterait ≈ 882 crédits
  028-detecteur-co · Détecteur de CO · 85,7 s (voix réelle) · 0 ✗ · 1 ⚠
    « Ta chaudière t'empoisonne. Et ton détecteur… ne dit rien. Normal : à faible concentration, il a le droit d'attendre une heure. Sauf si ce détecteur… n'a jamais su voir ce gaz. »
    mots dits : film 239 · accroche 30 · scène 28 · mot-choc « empoisonne » à 0,80 s
    voix : rien à enregistrer (déjà sur le disque) · une prise neuve coûterait ≈ 829 crédits
  029-airbag-avalanche · Airbag d'avalanche · 84,2 s (voix réelle) · 0 ✗ · 0 ⚠
    « Sous tes skis, la neige casse. La pente part avec toi. Ce qui peut te sauver ? Un ballon, sorti de ton dos en quelques secondes. Sauf si ta main… ne tire pas. »
    mots dits : film 248 · accroche 32 · scène 21 · mot-choc « casse » à 1,72 s
    voix : rien à enregistrer (déjà sur le disque) · une prise neuve coûterait ≈ 837 crédits
  030-prise-de-terre · Prise de terre · 83,3 s (voix réelle) · 0 ✗ · 0 ⚠
    « Ta machine à laver est sous tension. Et rien n'a sauté. Ton différentiel marche. Mais il attend… que le courant passe par toi. Souvent, ce qui manque se voit sur tes prises. »
    mots dits : film 249 · accroche 32 · scène 26 · mot-choc « tension » à 1,24 s
    voix : rien à enregistrer (déjà sur le disque) · une prise neuve coûterait ≈ 831 crédits

  Total voix : ≈ 0 crédits ElevenLabs à enregistrer (0 dossier) — rien n'a été enregistré
  Verdict : ✓ prêt pour le message à Merwan · 1 ⚠ d'écriture (docs/recette-script.md)
  détail des ⚠ : C:\Users\merwa.ORDI-MERWAN\Documents\systems-decoded\.cache\logs\salle-026-027-028-029-030.log  (ou --verbose)

```

# 026 — Soyouz MS-10 : contre-vérification du script

Faite le 2026-10-21, avant la voix. Sources relues : RussianSpaceWeb (chronologie, ouverte), Wikipedia « Soyuz abort modes » (ouverte), CBS News / Hague (ouverte), recherche web sur l'usage nominal des moteurs de coiffe, recherche sur les voies de détresse.
**Le PDF de la NASA (sma.nasa.gov) renvoie toujours une erreur 500 : non lu.** Aucun fait n'est donc de niveau A strict.

Verdict : **1 phrase à corriger** (`repos`), le reste tient. L'accroche tient telle quelle.

## Les huit points demandés

1. **Moteurs de coiffe.** Wikipedia : ils agissent « entre le largage de la tour (T+115 s) et celui de la coiffe (T+157 s) » pour éloigner la tête de sauvetage. RussianSpaceWeb : quatre moteurs RDG à poudre, allumés sur l'ordre d'abandon (une paire, l'autre 0,32 s plus tard) à ≈ T+122 s. Aucune source ouverte ne dit qu'ils servent aussi en vol normal ; aucune ne dit non plus le contraire (une recherche n'a trouvé que le cas du N1, sans rapport). « Il te reste quatre petits moteurs » tient. « Ces moteurs n'ont qu'une fenêtre » affirme implicitement un usage unique non prouvé : on le recadre en « Pour te sauver, … » (la fenêtre de sauvetage, elle, est sourcée). Environ 42 s : « quarante secondes, environ » tient.
2. **« Trois secondes »** : heurt ≈ T+119 s, moteurs ≈ T+122 s (RussianSpaceWeb) ; 117,8 s est le début de la séparation, 121,57 s chez spacefacts.de. Tient comme ordre de grandeur.
3. **« Avarie »** : RussianSpaceWeb, « the "avariya" (accident) abort signal appears on the crew console » à T+122 s. Tient (CBS n'en parle pas ; une seule source, B+).
4. **Secousses** : CBS, « thrown violently from side to side », « shaking … only lasted a few seconds » (mots du journaliste, pas une citation directe de Hague : la voix ne le met pas dans sa bouche, donc tient). **Sept fois ton poids** : Hague, « about seven Gs » ; 6,7 g (RussianSpaceWeb). Tient. **93 km** : RussianSpaceWeb et Wikipedia. Tient. **Cinq mois plus tard** : MS-12, 14 mars 2019 (Wikipedia MS-12, fiche de faits). Tient.
5. **Cause** : capteur tordu de 6°45' à l'assemblage (enquête préliminaire, RussianSpaceWeb) ou rotule déformée (rapport final selon Wikipedia). « Une pièce faussée, au montage » tient sans trancher. « Ce qui la fait lâcher était là avant le décollage » tient dans les deux versions.
6. **« Personne n'appuie sur rien »** : CBS, « automatically igniting an escape rocket » ; RussianSpaceWeb, ordre généré quand le 2ᵉ étage dévie de plus de 7° ou le 3ᵉ de plus de 10°. (Wikipedia note que le sol peut aussi déclencher par radio : ici, ce n'est pas ce qui s'est passé.) Tient.
7. **Chute** : la tour était déjà larguée (T+114,6 s), ce sont les moteurs de la coiffe qui ont arraché le vaisseau. « Ton sauvetage ne part pas avec elle. Il reste… sur la coiffe » tient comme formule.
8. **Annonce du 027** : une voie de détresse (rampe d'arrêt de gravier ou de sable, en montée ou en lit d'arrêt) est bien faite pour un poids lourd dont les freins ont lâché en descente, sur une pente longue, souvent avant un virage dangereux (SlashGear, Mental Floss, NCDOT). « Une sortie au bord de la route » tient. Aucun fait précis n'est dit.

## Phrase par phrase

| Beat | Verdict | Remarque / source |
| --- | --- | --- |
| accroche | tient | Tour larguée à T+114,6 s, avarie à T+117,8–119 s : « vient de partir » juste. Ne dit pas que la tour sauve. |
| promesse | tient | Quatre moteurs RDG ; cause connue avant le décollage (pièce faussée à l'assemblage). |
| scene | tient | ≈ 50 km (Borisov), bloc D qui heurte le bloc central, secousses (CBS). |
| ouvre | tient | Signature. |
| eclate | tient | Quatre moteurs à poudre, capteurs de vitesse angulaire (RussianSpaceWeb). |
| repos | **à corriger** | Voir ci-dessous. |
| seuil | tient | |
| zero | tient | Ordre automatique ; « avariya » au pupitre. |
| reponse | tient | 3 s, apogée 93 km, ≈ 6,7 g. |
| sol | tient | Parachute puis rétrofusées d'atterrissage (CBS, RussianSpaceWeb). Équipage sans blessure grave. |
| chute | tient | |
| comment | tient | Pièce faussée ; MS-12 cinq mois plus tard. |
| like | tient | |
| abo | tient | Voir point 8. |
| boucle | tient | |

## Correction

**`repos`** — raison : « n'ont qu'une fenêtre » laisse entendre un usage unique des moteurs, que les sources ouvertes ne prouvent pas ; on cadre la fenêtre comme celle du sauvetage.

Nouveau `text` :
`Pour te sauver, ces moteurs n'ont qu'une fenêtre : de la tour qui part à la coiffe qui tombe. Quarante secondes, environ. Et ta fusée lâche… pile dans cette *fenêtre*.`

Nouveau `vo` :
`[warm, conversational] Pour te sauver, ces moteurs n'ont qu'une fenêtre : de la tour qui part à la coiffe qui tombe. Quarante secondes, environ. [short pause] Et ta fusée lâche... pile dans cette fenêtre.`

Nouveau `voAlt[0]` :
`[curious] Pour te sauver, ces moteurs n'ont qu'une fenêtre : de la tour qui part à la coiffe qui tombe. Quarante secondes, environ. [short pause] Et ta fusée lâche... pile dans cette fenêtre.`

Les repères `repos:fenêtre`, `repos:part`, `repos:tombe`, `repos:Quarante`, `repos:pile` ne bougent pas (« fenêtre » reste son premier mot-repère).

## Reste ouvert

PDF NASA non lu ; la poussée, la durée de combustion et la vitesse à l'avarie ne sont pas publiées : le script n'en dit aucune.

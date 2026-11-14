# 052 télésiège — état du chef de production

- 13/11 ~22h50 : chef démarré. Voix 90,5 s (turbo, 1 prise), sons du sujet en banque. src/ = modèle seul.
- Empreinte voix au départ : voir ligne md5 ci-dessous (à recomparer avant le render final ; picks.json absent au départ).
- Jauge départ : fenêtre 14 %, hebdo 19 %.
- Étape 1 : architecte lancé.
d250f4a3ea98046ce1f032fa0b760ee9 *episodes/052-telesiege/audio/voix.wav
6e1c493faf663ee656c688c250bd1cbf *episodes/052-telesiege/audio/vo.json
- Architecte rendu (abd90399efc429095, 312 k, 62 outils, 24 min) : 3 décors neufs model.js gare.js ligne.js ; candidates .cache/planches/052/architecte/candidates-premiere-image.json ; POSE0 provisoire = A.
- Décors rendus : model aa4cd8d33549fbc6e 224k, gare ad434c20d2982c892 252k, ligne a650973f6c087f6bf 270k. À changer ailleurs appliqués (VIEW, POSE0 de ligne, WEIGH.gauge, lever, vrope). Non fait : harmonisation des torons gare/ligne (émission, fondu) — à voir en relecture.
- Première image : planches .cache/planches/052/image0b.jpg, image0c.jpg ; choix A3 (POSE0 + FIRST rider 1 sit 0.7 sway 0.5), note 4/6. docs/052-actes-maj.md écrit.
- 14/11 ~00h40 : jauge fenêtre 89 % (> 85) → ARRÊT avant décorateur. EN FILE : reprise après 03h40 UTC (04h40 Paris).
- RESTE : decorateur (habillage, sapins dressSlope 029) → re-juger image0 → 4 actes (acte1, acte2, acte3, fin) → monteur-son → relecture 4 planches → check → render --draft → qa → retoucheurs → (si voix/picks inchangés, md5 ci-dessus) render, qa, cover, phone, posts.mjs (052 à ajouter dans posts.mjs ?).
- 14/11 reprise (chef 2) : jauge fenêtre 0 %, hebdo 30 %. md5 voix/vo inchangés, picks.json absent. Décorateur lancé. NB : contexte de base du chef ≈ 165 k (liste d'outils), seuil 200 k impossible tel quel.
- Décorateur rendu (a4de4553fea9ca7d1, 206 k, 32 outils, 8 min). Image0 rejugée : H (image0f.jpg), 5/6, collée. actes-maj complété. Prochaine vague : 4 actes.
- Actes rendus : acte1 a302e662d90b1a891 243k · acte2 a84383f5509b2c69b 237k · acte3 ab7e00ef5a3672c85 282k · fin a1674dd0d295f6e06 230k. À changer ailleurs appliqués (chip-deux, flèches pull ligne.js, track/vrope world.js). Non faits : jauge gare.js ×0,5 (→ retoucheur), cover acte2 (à juger au cover). Raccord acte1→acte2 : acte1 finit grip d112 à AT_S.board+512, acte2 attend VIEW.grip AT.launch d170 → à vérifier en relecture.
- Relecture faite (.cache/planches/052/relecture/p1-p5). Plans faibles : 1.9, 4, 6.5, 14.5 (acte1) ; 16.6/18.5 traînée blanche en haut ; 22 éclaté petit, 31 pince petite (acte2) ; 71, 84-87 vides (fin). Jauge 41 %/36 %. Monteur-son lancé.
- Monteur-son rendu (ab30a19e20ddcb32a, 172 k) : 15 ponctuels ; 2 sons de réserve à fabriquer (052-cable-glisse, 052-capteur) = crédits → question Merwan. Brouillon lancé.
- Brouillon + qa : voix calée, −14,07 LUFS ; ✗ parasite 10,13 ; heurtés 2,4 4,4 6,0 8,2 10,2 (acte1), 41,7 (acte3). gare.js jauge ×0,5 en rouge fait par le chef. Vague de 4 retoucheurs lancée (jauge 46 %).
- Retoucheurs rendus : acte1 a0f72529f869de1b0 · acte2 a1eeee29f44680e9c · acte3 aa83996eba57c595c (44,4 et 59,8–61,6 non corrigés) · fin a83be0a91f2c70026. Brouillon 2 lancé.
- Parasites 35,5/36,3 (montants de gare devant l'objectif) : station 0,3 pendant la lancée (acte2, chef). Rendu final lancé.
- 14/11 FIN : rendu final renders/052-telesiege.mp4 (90,9 s, −14,07 LUFS, voix calée, aucune image parasite), couverture, iphone, posts.mjs OK ; brouillon supprimé. md5 voix/vo inchangés, pas de picks.json.
- Un cran en dessous : 44,4 (autre pince sur le pesage), 59,8–61,6 (bouche et vide peu lisibles), 22,9 poutre de came, 37,2 reflet du câble. Heurté max 28,4 s (21,6).
- En attente Merwan : 2 sons de réserve (052-cable-glisse 54,30 ; 052-capteur 55,86) = crédits ; écoute cabine. Jauge fin : 54 % / 37 %. Agents de cette reprise ≈ 2,02 M.

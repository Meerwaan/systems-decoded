# 027 · Ce qui a changé depuis le plan (22/10) — ces lignes priment sur `docs/027-actes.md`

## La première image est choisie : « a2 », de dos, à 42 cm

- `world.js` : `LENS0 = { fov: 46, shift: 110, … }`, `POSE0 = frame(road(0, 42, 2250), road(0, 160, 600), LENS0)` → `{ tx: 0, ty: 208, tz: 600, d: 1650, az: 0, el: 0.5 }`. Pleinement de dos, dans l'axe : la remorque de verre ≈ 75 % de la largeur, les deux feux stop, les dix tambours rouges et leurs braises, la route qui plonge sous le camion. Personne ne la change ; la fin la compare à la dernière image.
- Point faible connu : **la voie (veille) ne se voit pas sur l'image 0** (elle est derrière le camion dans cet axe). L'acte 1 la révèle tôt, dès que la phrase en parle, par un mouvement qui naît de ce cadre (on se décale, on monte), pas par une étiquette.
- Le mouvement de l'image 1 vient du sujet : braises, marques des roues, peinture qui défile. Un `glide` éventuel se vérifie à 0,3 et 0,7 s (`look` : ajouter `travel(s)` à la pose).
- La candidate (b) « la roue » a été écartée (le camion ne se lit pas) ; (a) d'origine aussi (de biais, la remorque se lit en boîtes emboîtées).

## L'habillage est posé (`src/habillage.js`, journal `docs/journal/027-habillage.md`)

Une forêt de sapins de verre sur le versant gauche (6 à 15 m, à ≥ 40 m de toute pose prévue), le panneau du col (s −246) et le triangle « descente dangereuse » (s −231), tous en `ink`, suivant `shell`. Ne cadre pas un plan pour les cacher ; s'ils gênent, signale-le. Aucune pose ne doit approcher un sapin à moins de ≈ 40 m (ils sont stylisés).

## Les exigences de Merwan pour ce film (22/10) : « fais attention aux erreurs de son et aux images qui scintillent »

- **Zéro image parasite** au `qa`. Toute la section « Net et fluide » de CLAUDE.md : la caméra roule avec le camion et longe des choses répétées (balises, peinture, catadioptres, sapins) — rien de fin ni de rayé ne défile vite près de la caméra ; ce qu'elle frôle est invisible ; un quart de tour en une seconde est une coupe ; une coupe en fondu tombe pile sur une image et jamais sur un mouvement rapide.
- Les roues : sans `kmh` cohérent, sculptures et trous de jante font de l'effet stroboscopique dès que la roue tourne (journal `model.js`) — vérifie chaque plan où une roue tourne de près.
- **Son** : tout son de `sfx` que tu ajoutes ou déplaces tombe dans un souffle, jamais sur un mot (`npm run qa` → « sons posés sur un mot » doit rester vide pour ce que tu touches).

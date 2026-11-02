# 033 · À changer ailleurs (hors de episodes/033-porte-avion/)

Écrit par l'architecte le 2026-10-30. Rien de ceci n'a été appliqué : c'est au chef de production.

- `scripts/sd.mjs` (`script`) : une option `--words` qui imprime chaque mot avec son début, sa fin et le souffle qui suit (je l'ai refaite à la main depuis `gen/episode.data.js` ; déjà demandée aux 021 et 025). Elle sert à poser les `sfx` dans les souffles.
- `docs/catalogue-notes.json` : après le rendu du 033, une fiche pour `033/model.js` (la porte bouchon, ses butées, l'air sur ses deux faces — réutilisable pour une porte de soute, un hublot, la dépressurisation) et pour `033/vol.js` (le modèle d'enveloppe qui met la cabine du L03 DANS l'A330 du 023 : un seul monde de l'intérieur à l'extérieur — utile au TCAS, à la boîte noire, à tout court d'avion de ligne).
- `023/avion.js` : aucune façon de rendre les gouvernes, circuits et réservoirs NEUTRES par leurs nombres (0 = signal « mort », 1 = veille) ; l'agent de `vol.js` les cache depuis l'enveloppe. Si l'A330 du 023 monte dans le kit, un nombre `neutral` serait utile.
- `L03/cabine.js` : son panneau 1L ne se cache que par `cabine.A.door.parent.visible = false` (anchor du panneau) ; une option `door1L: false` serait plus propre si la cabine monte dans le kit.

## Retouches du 30/10 (orchestrateur)
- `kit/lib/overlay.js` · `buildCaptions`, dans `if (hit && w.a) {` (≈ l. 159) : le mot marqué qui grossit (`captionStyle({ hit })`) mange l'espace avec le mot d'avant pendant 2 à 3 images (033 à 18,0 s : « À CETTEPORTE ? »). Proposition : avant le `tl.fromTo`, `span.style.margin = \`0 ${(hit * 1.4).toFixed(2)}em\`;` (réserver la place à la taille maximale), ou `transformOrigin: "0% 60%"` dans le `fromTo`. Vaut pour tous les films.

# 030 — ce qui a changé depuis le plan des actes (ces lignes priment)

## Système (`model.js`, journal `030-model.md`)
- `plug` 0 tire la fiche de 6 cm ; la broche du socle ne se lit que **fiche tirée** (`plug` ≤ 0,3) et vue d'au-dessus (`el` ≥ 25) : pour « Sans broche », tirer la fiche. Poses : `VIEW.bPlug` (au-dessus), `VIEW.bPlugSide` (de profil, les broches qui sortent).
- `ddr` allume la fenêtre et le corps du différentiel ; `trip` fait basculer la manette (0,42 → 2,72 rad).
- Sur l'établi, `leak` ne s'allume que si `chain` > 0,5.
- Avec `live` 1, le bout de carcasse de l'établi tire un peu vers le saumon ; en place, la cosse reste petite dans la carcasse de verre : ne pas la nommer dans un plan large.
- Non vus par le décor : la tête `run` en place, l'éclaté en mouvement, la fonte des tirets quand la caméra balaie — à regarder sur tes planches.

## Décor (`buanderie.js`, journal `030-buanderie.md`)
- `VIEW.reach` et `VIEW.under` réglés (appliqués).
- Le tambour ne décélère pas : quand `spin` baisse, le linge tombe en tas mais les aubes sont fixes — ne pas filmer le tambour en gros plan pendant que `spin` baisse.
- `VIEW.fault` est dominé par les arêtes signal du renfort, floues en barres : lui préférer `VIEW.machine` serré.
- Vu d'en haut, le capot sous tension se lit comme une boîte orange pleine : rester sous `el` 20 sur le capot allumé.
- `VIEW.section` : semelles et boucle fines, la tranche de la dalle fait une bande claire — préférer `VIEW.under`.
- Le vert-jaune du mur (y 214), allumé veille, fait un halo qui monte jusque sous l'en-tête dans `VIEW.wall` : `pe` bas pendant ce plan, ou cadrer plus bas.

# Journal — lot « son »

Référence (avant, re-mesurée le 07/10 sur le minutage actuel, 005 = 83,5 s, 006 = 84,4 s) : fenêtres parlées sous +6 dB (tél) 005 14/220, min −11,5 dB ; 006 14/214, min −1,4 dB. Crête du fond : 005 −3,8 dBFS, 006 −2,7 dBFS.
Mesure : `node scripts/sd.mjs sfx <ep>` puis, dans audit/son : `node make_stems_src.mjs && node stems.mjs && node analyse.mjs <ep>`.

## son/son-05 — FAIT
- scripts/sfx.mjs, `impact` : corps 240 Hz saturé (constante BODY = 0,55), claquement 2 kHz (CRACK = 0,6) plein au-dessus de −10 dB, nul sous −14 ; l'ensemble est ramené à la crête du sub seul (même crête qu'avant). Essais écartés : BODY 0,3 (rien de mesurable), BODY 0,7 (trois mots de plus sous +6 dB).
- Vérifié (sonde.mjs, stems) : perte à 400 Hz −22,5 → −17,6 dB ; choc du 006 sur téléphone, fenêtre 43,4–44,2 s : −16,8 → −12,6 dB sous la voix ; crêtes du fond inchangées (−3,8 / −2,7 dBFS) ; fond pleine bande −29,6 → −31,2 dBFS (ne monte pas).
- Coût : trois coups posés sur un mot passent sous +6 dB (005 « 2 s » +3,5, « une » +5,0 ; 006 « s'effondre » +4,3).

## son/son-03 — FAIT (lot terminé)
- episodes/005-arret-urgence/episode.json, clé sfx : whoosh drop −18 → −26 ; ticks « d'autres » (×8 et ×16) −16 → −22 ; whoosh crown −20 → −24 ; tick promesse:2 −21 → −25 ; whoosh rods −21 → −24. Rewind inchangé (le bus fx suffit : plus aucune fenêtre de « d'une… » sous +6 dB).
- Vérifié : « barre / tombe » −8,7 → au-dessus de +6 dB ; « d'autres » −11,5 → +1,2 ; « 2 s » −6,2 → +0,6 ; 005 : 10/220 fenêtres sous +6 dB, min −0,2 (avant 14/220, min −11,5). `script 005` : timing voix réelle.

## son/son-01 — FAIT
- scripts/sfx.mjs `heartbeat` : paramètre body (corps 190–310 Hz + clic 620/930 Hz, constante VALVE = 0,3) ; 006 episode.json, les deux lignes heartbeat du retour (beat → refuse, refuse → like) : "body": true. Massage 108 bpm et 005 inchangés.
- Vérifié (sonde.mjs) : battement 52,6–54,0 s, 50 ms le plus fort sur téléphone −30,0 → −16,1 dB sous la voix (seconde ligne −35,9 → −22,0) ; massage −37,9 inchangé ; mesure de l'auditeur −43,1 → −29,6 ; 006 reste à 7/214 fenêtres sous +6 dB. `script 006` : timing voix réelle.

## son/son-07 — FAIT
- scripts/sfx.mjs : bus `fx` (whoosh, riser, rewind, tick avec count > 3), baissé de `duckFx` (−7 dB par défaut, lisible dans episode.json mais aucune clé ajoutée) sous une phrase ; masque « phrase » = masque des mots avec les trous < 0,35 s bouchés ; descente 30 ms, retour 180 ms. blip, impact et tick isolés restent à leur niveau.
- Vérifié : 005 sous +6 dB 14 → 9, min −11,5 → −4,6 dB ; 006 14 → 6, min −1,4 → +2,6 dB. Crêtes inchangées (−3,8 / −2,7). Whoosh non recentré (les fenêtres qui restent sont des blips et les whoosh du 005 traités par son-03).

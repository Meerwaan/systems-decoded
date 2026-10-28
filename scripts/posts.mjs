// What goes with each film on Instagram (Reels) and YouTube (Shorts), next to TikTok's caption: written into
// episode.json → post.instagram { caption, hashtags } and post.youtube { title, description, hashtags }.
// Rules kept for every platform: five hashtags at most · the caption never gives the chute away · it carries the
// word people search for · it ends on the question of the comment call. A Shorts title holds in 100 characters.
//   node scripts/posts.mjs            writes them · prints what does not fit
import fs from "node:fs";
import path from "node:path";
import { ROOT } from "./lib/env.mjs";

const POSTS = {
  "001-detecteur-fumee": {
    instagram: {
      caption: "Il n'a jamais vu de fumée de sa vie. C'est pourtant lui qui te réveille à trois heures du matin.\n\nDossier 001 : on ouvre un détecteur de fumée.\n\nSois honnête : ton dernier test, c'était quand ?",
      hashtags: ["#detecteurdefumee", "#incendie", "#securite", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Détecteur de fumée : comment ça marche vraiment (il n'a jamais « vu » de fumée)",
      description: "Dossier 001 — on ouvre un détecteur de fumée : ce qu'il surveille pendant que tu dors, et ce qui le fait hurler.\n\nTon dernier test, c'était quand ?",
      hashtags: ["#shorts", "#detecteurdefumee", "#incendie", "#commentcamarche", "#science"],
    },
  },
  "002-airbag": {
    instagram: {
      caption: "Il t'explose au visage à 300 km/h. Et c'est exactement ce qui te sauve.\n\nDossier 002 : l'airbag, milliseconde par milliseconde.\n\nTes mains, elles sont où sur le volant ?",
      hashtags: ["#airbag", "#securiteroutiere", "#voiture", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Airbag : ce qui se passe en 150 millisecondes (et pourquoi tes mains comptent)",
      description: "Dossier 002 — l'airbag ouvert, du choc au dégonflage.\n\nTes mains, elles sont où sur le volant ?",
      hashtags: ["#shorts", "#airbag", "#securiteroutiere", "#voiture", "#science"],
    },
  },
  "003-ascenseur": {
    instagram: {
      caption: "Le câble de ton ascenseur casse. Tu ne tombes pas. Et ce n'est pas un câble qui te retient.\n\nDossier 003 : ce qui arrête une cabine en une demi-seconde.\n\nToi, tu sauterais au dernier moment ?",
      hashtags: ["#ascenseur", "#ingenierie", "#securite", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Ascenseur : que se passe-t-il si le câble casse ?",
      description: "Dossier 003 — douzième étage, le câble casse : ce qui retient la cabine en une demi-seconde.\n\nTu sauterais au dernier moment, toi ?",
      hashtags: ["#shorts", "#ascenseur", "#ingenierie", "#securite", "#science"],
    },
  },
  "004-differentiel": {
    instagram: {
      caption: "Ta main se referme sur le fil et ne lâche plus. Ce qui coupe le courant à ta place, ce n'est pas ton disjoncteur.\n\nDossier 004 : l'interrupteur différentiel, trente millisecondes pour te lâcher.\n\nSur ton tableau, tu lis 30 mA… ou rien ?",
      hashtags: ["#electricite", "#differentiel", "#securite", "#bricolage", "#commentcamarche"],
    },
    youtube: {
      title: "Interrupteur différentiel 30 mA : ce qui te sauve de l'électrocution (pas le disjoncteur)",
      description: "Dossier 004 — 230 volts, ta main ne lâche plus : comment le différentiel coupe en trente millisecondes.\n\nSur ton tableau, tu lis 30 mA… ou rien ?",
      hashtags: ["#shorts", "#electricite", "#differentiel", "#bricolage", "#science"],
    },
  },
  "005-arret-urgence": {
    instagram: {
      caption: "Panne de courant dans un réacteur nucléaire. Ne touche à rien : il s'arrête tout seul, en deux secondes.\n\nDossier 005 : l'arrêt automatique d'un réacteur.\n\nUne fois arrêté, il chauffe encore combien de temps, à ton avis ?",
      hashtags: ["#nucleaire", "#energie", "#ingenierie", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Réacteur nucléaire : comment il s'arrête tout seul en 2 secondes",
      description: "Dossier 005 — panne de courant, et le réacteur s'arrête sans que personne ne touche à rien.\n\nUne fois arrêté, il chauffe encore combien de temps, à ton avis ?",
      hashtags: ["#shorts", "#nucleaire", "#energie", "#ingenierie", "#science"],
    },
  },
  "006-defibrillateur": {
    instagram: {
      caption: "Quelqu'un s'effondre devant toi. Au mur, une boîte verte peut le sauver, et tu ne peux pas te tromper : c'est elle qui décide.\n\nDossier 006 : le défibrillateur. Appeler le 15, masser, défibriller.\n\nLa plus proche de chez toi, elle est où ?",
      hashtags: ["#defibrillateur", "#premierssecours", "#sante", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Défibrillateur (DAE) : comment ça marche, et pourquoi tu ne peux pas te tromper",
      description: "Dossier 006 — arrêt cardiaque : appeler le 15, masser, défibriller. La boîte verte te dicte chaque geste et refuse de choquer un cœur qui bat.\n\nLa plus proche de chez toi, elle est où ?",
      hashtags: ["#shorts", "#defibrillateur", "#premierssecours", "#sante", "#science"],
    },
  },
  "007-siege-ejectable": {
    instagram: {
      caption: "On t'offre un vol en Rafale. Au décollage, ta main agrippe une poignée : la mauvaise. Deux secondes après, tu es sous un parachute.\n\nDossier 007 : le siège éjectable. Histoire vraie, Saint-Dizier, 2019.\n\nCe vol, on te l'offre : tu y vas ?",
      hashtags: ["#rafale", "#siegeejectable", "#aviation", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Siège éjectable du Rafale : 2 secondes entre la poignée et le parachute",
      description: "Dossier 007 — en 2019, un passager de 64 ans s'éjecte d'un Rafale sans le vouloir (rapport du BEA-É). Ce qui se passe pendant ces deux secondes.\n\nCe vol, on te l'offre : tu y vas ?",
      hashtags: ["#shorts", "#rafale", "#siegeejectable", "#aviation", "#science"],
    },
  },
  "008-paratonnerre": {
    instagram: {
      caption: "Un millième de seconde avant que la foudre touche ton toit, une tige de métal va l'appeler.\n\nDossier 008 : le paratonnerre, ce millième de seconde au ralenti.\n\nEt toi, si l'orage te surprend dehors : tu vas où ?",
      hashtags: ["#paratonnerre", "#foudre", "#orage", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Paratonnerre : ce qui se passe sur ton toit une milliseconde avant la foudre",
      description: "Dossier 008 — la foudre descend par bonds, tout ce qui dépasse lui répond… et une tige de métal décide de la suite.\n\nSi l'orage te surprend dehors, tu vas où ?",
      hashtags: ["#shorts", "#paratonnerre", "#foudre", "#orage", "#science"],
    },
  },
  "009-micro-ondes": {
    instagram: {
      caption: "Mille watts de micro-ondes, à dix centimètres de ton visage. Et entre les deux : une porte pleine de trous.\n\nDossier 009 : la porte du micro-ondes, et ce qui se passe si tu l'ouvres en plein chauffage.\n\nLe tien, il a quel âge ?",
      hashtags: ["#microondes", "#cuisine", "#physique", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Micro-ondes : pourquoi la lumière sort de la porte, et (presque) pas les ondes",
      description: "Dossier 009 — la porte de ton micro-ondes : sa plaque à trous, ses crochets, et ce qui se passe en dix millionièmes de seconde quand tu l'ouvres en plein chauffage.\n\nLe tien, il a quel âge ?",
      hashtags: ["#shorts", "#microondes", "#cuisine", "#physique", "#science"],
    },
  },
  "010-scie": {
    instagram: {
      caption: "Ta main glisse. Ton doigt touche la lame d'une scie en marche… et tu le gardes.\n\nDossier 010 : la scie qui s'arrête en moins de cinq millisecondes. Son inventeur l'a testée sur son propre doigt.\n\nEt toi, tu poserais le tien ?",
      hashtags: ["#bricolage", "#menuiserie", "#sawstop", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "La scie qui s'arrête quand elle touche ton doigt (SawStop) : comment ça marche",
      description: "Dossier 010 — moins de cinq millisecondes entre ton doigt et l'arrêt de la lame : le signal, le fil, le ressort, le bloc d'aluminium. Son inventeur l'a testée sur son doigt.\n\nEt toi, tu poserais le tien ?",
      hashtags: ["#shorts", "#sawstop", "#bricolage", "#menuiserie", "#science"],
    },
  },
  "011-fusible-pyro": {
    instagram: {
      caption: "Choc. Tes airbags partent. Et sous le plancher de ta voiture électrique, une autre charge explose.\n\nDossier 011 : le fusible pyrotechnique, une milliseconde pour couper quatre cents volts.\n\nLes câbles orange, tu savais ?",
      hashtags: ["#voitureelectrique", "#tesla", "#securiteroutiere", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Voiture électrique : la charge qui explose sous le plancher au moment de l'accident",
      description: "Dossier 011 — le fusible pyrotechnique : au choc, une charge tranche le cuivre de la batterie en une milliseconde. Et les volts, ils vont où ?\n\nLes câbles orange, tu savais ?",
      hashtags: ["#shorts", "#voitureelectrique", "#tesla", "#securiteroutiere", "#science"],
    },
  },
  "012-gaziniere": {
    instagram: {
      caption: "Ta casserole déborde. La flamme s'éteint. Le gaz, lui, sort toujours.\n\nDossier 012 : la gazinière. Une minute, en temps réel, jusqu'à ce qu'il se coupe tout seul — sans prise ni pile.\n\nLa tienne, elle a la petite pointe à côté de la flamme ?",
      hashtags: ["#gaziniere", "#cuisine", "#gaz", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Gazinière : la flamme s'éteint, le gaz continue… et ce qui le coupe en une minute",
      description: "Dossier 012 — la sécurité d'une plaque à gaz, filmée en temps réel : de la flamme qui s'éteint au gaz qui se coupe, sans prise ni pile.\n\nLa tienne, elle a la petite pointe à côté de la flamme ?",
      hashtags: ["#shorts", "#gaziniere", "#cuisine", "#gaz", "#science"],
    },
  },
  "013-halo": {
    instagram: {
      caption: "Premier tour. Ta Formule 1 traverse un rail d'acier, et prend feu.\n\nDossier 013 : le Halo. 192 km/h, 67 g, le feu — et un arceau de titane entre ton casque et l'acier.\n\nToi, ce Halo, tu étais pour… ou contre ?",
      hashtags: ["#f1", "#formule1", "#halo", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Halo de Formule 1 : 192 km/h dans un rail d'acier, le feu… et l'arceau qui tient",
      description: "Dossier 013 — le Halo, raconté par un accident réel : Bahreïn 2020, premier tour. Ce que fait vraiment cet arceau de titane au-dessus du casque.\n\nToi, tu étais pour ou contre ?",
      hashtags: ["#shorts", "#f1", "#formule1", "#halo", "#science"],
    },
  },
  "014-abs": {
    instagram: {
      caption: "Sous la pluie, tu écrases le frein… et ta pédale se met à trembler.\n\nDossier 014 : l'ABS. Ce tremblement, c'est ta voiture qui travaille — jusqu'à 40 fois par seconde.\n\nTa pédale, elle a déjà tremblé ?",
      hashtags: ["#abs", "#voiture", "#securiteroutiere", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "ABS : pourquoi ta pédale de frein tremble (et pourquoi il ne faut pas la lâcher)",
      description: "Dossier 014 — l'ABS ouvert : le capteur, le calculateur, les deux vannes et la pompe, et ce qui se passe dans ta roue quand tu écrases le frein sous la pluie.\n\nTa pédale, elle a déjà tremblé ?",
      hashtags: ["#shorts", "#abs", "#voiture", "#securiteroutiere", "#science"],
    },
  },
  "015-brin-arret": {
    instagram: {
      caption: "Tes roues touchent le pont du porte-avions. Et là… tu mets plein gaz.\n\nDossier 015 : le brin d'arrêt. Un Rafale, un câble d'acier, cent mètres — et sous le pont, ce qui freine vraiment.\n\nToi, cet appontage, tu le tentes ?",
      hashtags: ["#rafale", "#porteavions", "#marinenationale", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Rafale sur porte-avions : pourquoi il met plein gaz en touchant le pont (brin d'arrêt)",
      description: "Dossier 015 — le brin d'arrêt du Charles de Gaulle : la crosse, le câble, et sous le pont le frein hydraulique qui arrête un Rafale en cent mètres.\n\nToi, cet appontage, tu le tentes ?",
      hashtags: ["#shorts", "#rafale", "#porteavions", "#marinenationale", "#science"],
    },
  },
  "016-disjoncteur": {
    instagram: {
      caption: "Dans ton mur, un fil chauffe. Et ton disjoncteur… ne coupe pas.\n\nDossier 016 : le disjoncteur. Deux pièges dans la même boîte : un lent, un rapide.\n\nLe tien, il saute sur quoi ?",
      hashtags: ["#disjoncteur", "#electricite", "#electricien", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Disjoncteur : pourquoi il ne coupe pas tout de suite (bilame, bobine, arc électrique)",
      description: "Dossier 016 — un disjoncteur ouvert : le bilame qui attend, la bobine qui frappe en moins de deux centièmes de seconde, et la chambre qui éteint l'arc.\n\nLe tien, il saute sur quoi ?",
      hashtags: ["#shorts", "#disjoncteur", "#electricite", "#electricien", "#science"],
    },
  },
  "017-irm": {
    instagram: {
      caption: "L'IRM s'est tue. Tu entres… et ta bouteille d'oxygène t'est arrachée des mains.\n\nDossier 017 : l'aimant de l'IRM. 1,5 tesla, jour et nuit — et le bouton qui l'éteint vraiment.\n\nTu as déjà passé une IRM ?",
      hashtags: ["#irm", "#hopital", "#radiologie", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "IRM : son aimant reste allumé jour et nuit (et l'arrêt d'urgence ne le coupe pas)",
      description: "Dossier 017 — l'IRM ouverte : le fil supraconducteur dans son bain d'hélium, l'arrêt d'urgence qui ne coupe pas le champ, et l'arrêt de l'aimant.\n\nTu as déjà passé une IRM ?",
      hashtags: ["#shorts", "#irm", "#hopital", "#radiologie", "#science"],
    },
  },
  "018-cocotte-minute": {
    instagram: {
      caption: "Ta cocotte-minute siffle. Sous le couvercle, la vapeur pousse : plus de 350 kilos.\n\nDossier 018 : la cocotte-minute ouverte. Ses deux soupapes, son couvercle verrouillé… et le jour où elle se tait.\n\nElle te fait peur, ta cocotte-minute ?",
      hashtags: ["#cocotteminute", "#cuisine", "#securite", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Cocotte-minute : pourquoi elle siffle, et ce qui se passe le jour où elle se tait",
      description: "Dossier 018 — la cocotte-minute ouverte : pourquoi l'eau y bout à plus de 110 degrés, ses deux soupapes, son couvercle verrouillé… et le jour où la mousse monte vers la soupape.\n\nElle te fait peur, ta cocotte-minute ?",
      hashtags: ["#shorts", "#cocotteminute", "#cuisine", "#physique", "#science"],
    },
  },
  "019-pretensionneur": {
    instagram: {
      caption: "Choc frontal. Tu n'as pas encore bougé… et ta ceinture se resserre, seule.\n\nDossier 019 : le prétensionneur de ceinture de sécurité, demandé en commentaire. Une charge explosive, une turbine, une vingtaine de millièmes de seconde — et il ne sert qu'une fois.\n\nTa voiture… elle a déjà tapé ?",
      hashtags: ["#ceinturedesecurite", "#pretensionneur", "#securiteroutiere", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Prétensionneur de ceinture de sécurité : la charge explosive qui la retend au choc",
      description: "Dossier 019 — le prétensionneur de ceinture de sécurité, ouvert : l'enrouleur, la charge, la turbine, et ce qui se passe dans la sangle en une vingtaine de millièmes de seconde, avant même que ton corps arrive.\n\nTa voiture… elle a déjà tapé ?",
      hashtags: ["#shorts", "#ceinturedesecurite", "#pretensionneur", "#securiteroutiere", "#science"],
    },
  },
  "020-taipei-101": {
    instagram: {
      caption: "Typhon sur Taipei. Tu es au sommet d'une tour… et elle se balance.\n\nDossier 020 : Taipei 101 et la boule d'acier de 660 tonnes suspendue tout en haut. Typhon Soudelor, 2015 : on la regarde bouger, centimètre par centimètre.\n\nUn jour de typhon… tu montes ?",
      hashtags: ["#taipei101", "#architecture", "#ingenierie", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Taipei 101 : la boule d'acier de 660 tonnes suspendue en haut de la tour (typhon Soudelor)",
      description: "Dossier 020 — Taipei 101, 2015 : le typhon Soudelor frappe la tour, et tout en haut une boule d'acier de 660 tonnes se met à bouger. Ses plaques, ses câbles, ses vérins, sa butée… et ce que ça donne au pic de la tempête.\n\nUn jour de typhon… tu montes ?",
      hashtags: ["#shorts", "#taipei101", "#architecture", "#ingenierie", "#science"],
    },
  },
  "021-veille-tgv": {
    instagram: {
      caption: "Ton TGV file à 255 km/h. Dans la cabine… plus personne.\n\nDossier 021 : la veille automatique du TGV (la VACMA). Une pédale sous le pupitre, un compte à rebours, et un train qui sait s'arrêter seul. Mais elle a un angle mort.\n\nCette pédale, tu connaissais ?",
      hashtags: ["#tgv", "#sncf", "#train", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "TGV sans conducteur à 255 km/h : la pédale qui arrête le train toute seule (VACMA)",
      description: "Dossier 021 — la veille automatique du TGV, ouverte : la pédale, les touches, le compte à rebours, la sonnerie, et ce qui se passe quand plus personne ne répond. Jusqu'au train arrêté, 2 320 mètres plus loin.\n\nCette pédale, tu connaissais ?",
      hashtags: ["#shorts", "#tgv", "#sncf", "#train", "#science"],
    },
  },
  "022-batterie-telephone": {
    instagram: {
      caption: "Ton téléphone charge, sous ton oreiller. Dedans, sa batterie chauffe.\n\nDossier 022 : la batterie de téléphone. Entre ses deux électrodes, un film de plastique plus fin qu'un cheveu : son dernier rempart. Et ton oreiller travaille contre lui.\n\nTu le charges où, la nuit ?",
      hashtags: ["#batterietelephone", "#smartphone", "#lithium", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Batterie de téléphone : ce qui se passe quand elle chauffe sous ton oreiller",
      description: "Dossier 022 — la batterie de téléphone ouverte : deux électrodes séparées par presque rien, un film de plastique plus fin qu'un cheveu, un petit circuit qui surveille tout. Et ce qui se passe quand tu la charges sous l'oreiller.\n\nTu le charges où, la nuit ?",
      hashtags: ["#shorts", "#batterietelephone", "#smartphone", "#lithium", "#science"],
    },
  },
  "023-eolienne-de-secours": {
    instagram: {
      caption: "Au-dessus de l'Atlantique, ton avion n'a plus un seul moteur.\n\nDossier 023 : l'éolienne de secours des avions de ligne. Une petite hélice qui sort du ventre, toute seule, et qui garde l'avion pilotable. 24 août 2001 : un Airbus plane dix-neuf minutes jusqu'aux Açores. Mais elle ne fait pas tout.\n\nEn avion, tu as peur ?",
      hashtags: ["#avion", "#aviation", "#airbus", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Plus aucun moteur au-dessus de l'Atlantique : la petite hélice qui sauve l'avion",
      description: "Dossier 023 — l'éolienne de secours d'un avion de ligne (la RAT), ouverte : la trappe, le bras, l'hélice, la pompe. Et le vol Air Transat 236, qui a plané dix-neuf minutes sans moteur jusqu'aux Açores, en 2001.\n\nEn avion, tu as peur ?",
      hashtags: ["#shorts", "#avion", "#aviation", "#airbus", "#science"],
    },
  },
  "024-bloc-operatoire": {
    instagram: {
      caption: "Tu dors, sur la table d'opération. Dans un appareil, un fil touche le métal.\n\nDossier 024 : le bloc opératoire. Chez toi, ça ferait tout sauter. Ici, rien ne coupe : c'est voulu, et ça porte un nom, le schéma IT médical. Mais ça ne marche qu'une fois.\n\nÉlectriciens : qu'est-ce qu'on a simplifié ?",
      hashtags: ["#electricite", "#electricien", "#hopital", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Au bloc opératoire, un défaut électrique ne doit RIEN couper : le schéma IT médical",
      description: "Dossier 024 — le bloc opératoire ouvert : le transformateur d'isolement, le contrôleur permanent d'isolement, l'alarme. Pourquoi, ici, le premier défaut ne coupe rien… et pourquoi le deuxième, si.\n\nÉlectriciens : qu'est-ce qu'on a simplifié ?",
      hashtags: ["#shorts", "#electricite", "#electricien", "#hopital", "#science"],
    },
  },
  "025-esp": {
    instagram: {
      caption: "Un sanglier. Tu braques d'un coup… et l'arrière de ta voiture décroche.\n\nDossier 025 : l'ESP, demandé en commentaire. Ta voiture compare où tu veux aller et où elle va, et freine une seule roue pour te remettre dans l'axe. Et ce réflexe, elle le doit à un élan.\n\nLa tienne, elle est d'avant ou d'après 2014 ?",
      hashtags: ["#esp", "#voiture", "#securiteroutiere", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Ta voiture décroche : l'ESP freine UNE roue pour te rattraper (et c'est grâce à un élan)",
      description: "Dossier 025 — l'ESP ouvert : le capteur d'angle du volant, le capteur de lacet, le calculateur, le bloc qui freine une roue à la fois. Et le test de l'élan, en Suède, en 1997.\n\nLa tienne, elle est d'avant ou d'après 2014 ?",
      hashtags: ["#shorts", "#esp", "#voiture", "#securiteroutiere", "#science"],
    },
  },
  "026-soyouz-ms10": {
    instagram: {
      caption: "Ta fusée lâche, en pleine montée. Et ta tour de sauvetage… vient de partir.\n\nDossier 026 : Soyouz MS-10, le 11 octobre 2018. Il te reste quatre petits moteurs. Et ce qui a fait lâcher ta fusée était là avant même le décollage.\n\nToi, tu remontes… ou plus jamais ?",
      hashtags: ["#soyouz", "#espace", "#fusee", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Ta fusée lâche en pleine montée… et ta tour de sauvetage vient de partir (Soyouz MS-10)",
      description: "Dossier 026 — Soyouz MS-10, 11 octobre 2018 : à cinquante kilomètres du sol, un propulseur se détache mal et frappe la fusée. La tour de sauvetage est déjà partie. Ce qui ramène l'équipage tient en quatre petits moteurs. On l'ouvre.\n\nToi, tu remontes… ou plus jamais ?",
      hashtags: ["#shorts", "#soyouz", "#espace", "#fusee", "#science"],
    },
  },
  "027-voie-de-detresse": {
    instagram: {
      caption: "Ton camion n'a plus de freins. Ils ne sont pas cassés : ils sont trop chauds.\n\nDossier 027 : la voie de détresse, le lit d'arrêt des poids lourds. Ce qui va t'arrêter, ce sont des cailloux… et pas n'importe lesquels. Et tes freins, c'est ton propre pied qui les a fait chauffer.\n\nToi, en descente : frein, ou moteur ?",
      hashtags: ["#poidslourd", "#camion", "#securiteroutiere", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Ton camion n'a plus de freins : ce qui va t'arrêter, ce sont des cailloux (voie de détresse)",
      description: "Dossier 027 — la voie de détresse ouverte : le lit d'arrêt, ses grains ronds, sa glissière, sa butte de terre. Pourquoi les freins d'un poids lourd lâchent dans une longue descente, et comment quarante tonnes s'arrêtent sans toucher la pédale.\n\nToi, en descente : frein, ou moteur ?",
      hashtags: ["#shorts", "#poidslourd", "#camion", "#securiteroutiere", "#science"],
    },
  },
  "028-detecteur-co": {
    instagram: {
      caption: "Ta chaudière t'empoisonne. Et ton détecteur… ne dit rien.\n\nDossier 028 : le détecteur de monoxyde de carbone. Un gaz sans odeur, une centaine de morts par an en France, et un boîtier qui a le droit d'attendre une heure avant de sonner. Pourquoi ?\n\nLe tien, au plafond : fumée… ou CO ?",
      hashtags: ["#monoxydedecarbone", "#chauffage", "#maison", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Ta chaudière t'empoisonne… et ton détecteur de CO a le droit d'attendre une heure",
      description: "Dossier 028 — le détecteur de monoxyde de carbone ouvert : la membrane, l'électrode où le gaz s'oxyde, la puce, la pile. Pourquoi il ne sonne pas tout de suite, et pourquoi un détecteur qui n'est que de fumée ne voit pas ce gaz.\n\nLe tien, au plafond : fumée… ou CO ?",
      hashtags: ["#shorts", "#monoxydedecarbone", "#chauffage", "#maison", "#science"],
    },
  },
  "029-airbag-avalanche": {
    instagram: {
      caption: "Sous tes skis, la neige casse. La pente part avec toi.\n\nDossier 029 : l'airbag d'avalanche. Une poignée, une cartouche, un ballon sorti de ton dos en quelques secondes… si ta main tire. Et ce qui te fait remonter n'est pas ce que tu crois.\n\nToi, en hors-piste : avec airbag… ou sans ?",
      hashtags: ["#avalanche", "#ski", "#horspiste", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "La neige casse sous tes skis… et un ballon sort de ton dos (airbag d'avalanche)",
      description: "Dossier 029 — l'airbag d'avalanche ouvert : la poignée, la cartouche, le venturi qui aspire l'air, le ballon d'au moins 150 litres. Ce qui se passe dans la neige qui coule, et pourquoi un sac sur cinq ne se gonfle pas.\n\nToi, en hors-piste : avec airbag… ou sans ?",
      hashtags: ["#shorts", "#avalanche", "#ski", "#horspiste", "#science"],
    },
  },
  "030-prise-de-terre": {
    instagram: {
      caption: "Ta machine à laver est sous tension. Et rien n'a sauté.\n\nDossier 030 : la prise de terre. Un fil vert-jaune, une broche sur ta prise, un câble de cuivre nu autour des fondations. Ton différentiel marche… mais sans elle, il attend que le courant passe par toi.\n\nChez toi : des prises avec broche… ou sans ?",
      hashtags: ["#electricite", "#electricien", "#maison", "#commentcamarche", "#lesaviezvous"],
    },
    youtube: {
      title: "Ta machine à laver est sous tension… et rien n'a sauté : la prise de terre",
      description: "Dossier 030 — la prise de terre ouverte : le conducteur de protection vert-jaune, la broche de la prise, le tableau, le câble de cuivre nu autour des fondations. Ce qu'elle fait vraiment le jour d'un défaut.\n\nÉlectriciens : qu'est-ce qu'on a simplifié ? Et chez toi : avec broche… ou sans ?",
      hashtags: ["#shorts", "#electricite", "#electricien", "#maison", "#science"],
    },
  },
  "HS01-pare-brise": {
    instagram: {
      caption: "Ton pare-brise doit casser pour réussir son test. Pourquoi ? On l'a suivi du sable jusqu'au jour où on lâche une tête de dix kilos dessus.\n\nHors-série 01 : notre tout premier grand format, près de neuf minutes. Il t'attend sur notre chaîne YouTube : le lien est en bio.\n\nTa vitre conducteur, tu sais lire le petit tampon dans son coin ?",
      hashtags: ["#parebrise", "#commentcestfait", "#voiture", "#securiteroutiere", "#lesaviezvous"],
    },
    youtube: {
      title: "Ton pare-brise DOIT casser : notre premier grand film t'explique pourquoi",
      description: "Hors-série 01 — on a suivi ton pare-brise du sable en fusion jusqu'au test où on lâche une tête de dix kilos dessus. Le film complet (8 min 51) est sur la chaîne, lié juste sous ce Short.\n\nTa vitre conducteur, tu sais lire le petit tampon dans son coin ?",
      hashtags: ["#shorts", "#parebrise", "#commentcestfait", "#voiture", "#science"],
    },
  },
  "HS02-poste-haute-tension": {
    instagram: {
      caption: "Une ligne de 400 000 volts, coupée. Ton détecteur ne réagit pas. Tout a l'air mort… et elle peut encore te tuer.\n\nCinq gestes pour rentrer chez toi : les cinq opérations de la consignation. Et le dernier, dans le mauvais ordre, tue. Le bon, tu le connais ?\n\nNotre nouveau grand format t'emmène là où tu n'entres jamais, dans un poste électrique. Le film complet, plus de neuf minutes, t'attend sur notre chaîne YouTube : le lien est en bio.",
      hashtags: ["#electricien", "#hautetension", "#consignation", "#electricite", "#lesaviezvous"],
    },
    youtube: {
      title: "Coupée… et pourtant mortelle : 400 000 volts, et 5 gestes pour rentrer chez toi",
      description: "Une ligne de 400 000 volts coupée peut encore te tuer. Notre nouveau grand format t'emmène dans un poste électrique, là où tu n'entres jamais : les cinq gestes de la consignation, un par un. Le film complet (9 min 10) est sur la chaîne, lié juste sous ce Short.\n\nLe dernier geste, dans le mauvais ordre, tue. Le bon, tu le connais ?",
      hashtags: ["#shorts", "#electricien", "#hautetension", "#consignation", "#electricite"],
    },
  },
  "HS03-evacuation-avion": {
    instagram: {
      caption: "Évacuation d'un avion en feu : cinq portes sur huit restent fermées. Il en reste trois, pour 379 personnes, et la fumée descend du plafond.\n\nDans chaque porte dort un toboggan plié. Sa bouteille de gaz ne suffit pas à le gonfler : il avale l'air du dehors. Et ce soir-là, presque personne ne prend son sac.\n\nLe film complet, près de neuf minutes, t'attend sur notre chaîne YouTube : le lien est en bio.\n\nEt toi : ton sac… tu le laisses, ou tu le prends ?",
      hashtags: ["#evacuation", "#avion", "#aviation", "#securite", "#lesaviezvous"],
    },
    youtube: {
      keyword: "évacuation avion",
      title: "Évacuation avion : 3 portes pour 379 personnes… et toi, ton sac, tu le prends ?",
      description: "Évacuation d'un avion en feu : cinq portes sur huit fermées, trois toboggans, 379 personnes. Le toboggan se gonfle en avalant l'air ; le reste de la nuit est dans le film complet (8 min 54), lié juste sous ce Short.\n\nTon sac : tu le laisses, ou tu le prends ?",
      hashtags: ["#shorts", "#evacuation", "#avion", "#aviation", "#securite"],
    },
  },
  "HS04-porte-avions": {
    instagram: {
      caption: "Porte-avions Charles de Gaulle : tes moteurs sont à fond, et ton Rafale ne bouge pas. Une seule pièce le retient, faite pour casser. Quand elle cède : 240 km/h en 75 mètres.\n\nSous le pont, deux cylindres, deux pistons, un croc accroché à ton avion. Et la vapeur qui les pousse vient d'un endroit que tu n'imagines pas.\n\nLe film complet, dix minutes, du lancement au retour de nuit, t'attend sur notre chaîne YouTube : le lien est en bio.\n\nEt ce soir, de nuit, trois câbles t'attendent. Lequel t'attrape : Athéna, le premier… ou Andromède, le dernier avant la mer ?",
      hashtags: ["#porteavions","#charlesdegaulle","#rafale","#marinenationale","#lesaviezvous"],
    },
    youtube: {
      keyword: "porte-avions Charles de Gaulle",
      title: "Porte-avions Charles de Gaulle : moteurs à fond… et ton Rafale ne bouge pas",
      description: "Porte-avions Charles de Gaulle : moteurs à fond, ton Rafale ne bouge pas. Une seule pièce le retient, faite pour casser ; quand elle cède, 240 km/h en 75 mètres. Le film complet (10 min 28), du lancement au retour de nuit, est lié juste sous ce Short.\n\nCe soir, de nuit : Athéna, le premier câble… ou Andromède, le dernier avant la mer ?",
      hashtags: ["#shorts","#porteavions","#charlesdegaulle","#rafale","#marinenationale"],
    },
  },
};

const problems = [];
for (const [dir, post] of Object.entries(POSTS)) {
  const file = path.join(ROOT, "episodes", dir, "episode.json");
  const ep = JSON.parse(fs.readFileSync(file, "utf8"));
  ep.post = { ...(ep.post ?? {}), instagram: post.instagram, youtube: post.youtube };
  for (const [where, tags] of [["tiktok", ep.post.hashtags ?? []], ["instagram", post.instagram.hashtags], ["youtube", post.youtube.hashtags]]) {
    if (tags.length > 5) problems.push(`${dir} · ${where} : ${tags.length} hashtags (5 au plus)`);
  }
  if (post.youtube.title.length > 100) problems.push(`${dir} · titre YouTube : ${post.youtube.title.length} caractères (100 au plus)`);
  if (post.instagram.caption.length > 2200) problems.push(`${dir} · légende Instagram trop longue`);
  fs.writeFileSync(file, JSON.stringify(ep, null, 2) + "\n");
  console.log(`  ${dir} · titre ${String(post.youtube.title.length).padStart(3)} car. · légende Instagram ${post.instagram.caption.length} car.`);
}
console.log(problems.length ? `\n  ✗ ${problems.join("\n  ✗ ")}\n` : "\n  ✓ tout tient : 5 hashtags au plus, titres de 100 caractères au plus\n");

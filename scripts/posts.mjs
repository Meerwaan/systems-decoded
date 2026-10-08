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

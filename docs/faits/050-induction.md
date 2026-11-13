# 050 — La plaque à induction : ce n'est pas la plaque qui chauffe, c'est la casserole

Niveaux : [P] source primaire lue · [S] secondaire · [O] ordre de grandeur. Recherche : 17 requêtes (sur 30).

## 1. Verdict sur l'angle

**À ajuster.** Le retournement est vrai et fort, mais « tu poses la main sur la plaque allumée » doit être cadré : le verre est chauffé par la casserole, donc sous et contre la casserole il devient chaud (le voyant « H » s'allume au-dessus de ≈ 60 °C du verre). La main se pose sur **la zone voisine éteinte, ou sur un foyer allumé SANS casserole** (rien ne chauffe : la plaque ne s'active que si un récipient est détecté). Ne jamais dire « le verre reste froid », dire « le verre ne chauffe que par la casserole ».
- Sujet « vu et revu » ? Oui sur le fond (« l'induction chauffe la casserole, pas la plaque », très présent en vidéos de cuisine/éco-électro) ; peu vu en vue éclatée 3D avec le champ et les courants dans le fond. L'angle neuf : montrer ce qu'on ne voit jamais.
- **Spectacle** : un champ magnétique invisible qui fait tourner des courants dans le fond de la casserole (3D aux rayons X : lignes de champ de la bobine, boucles de courant dans l'inox, l'eau qui se met à bouillir pendant que le verre autour reste sombre). Lisible sans le son si on montre le contraste : eau qui bout à gros bouillons / main posée à côté sur le verre. Événement en cours : l'ébullition. **Moyen**, faute de flamme ou d'étincelle.
- **Histoire** : quelqu'un (toi, un enfant, un invité) pose la main sur la plaque « allumée » ; le danger imaginé (brûlure) ne vient pas ; mais le vrai danger est l'inverse : la chaleur résiduelle rendue par la casserole, ou un objet métallique posé dessus. Raison d'envoyer : « montre ça à quelqu'un qui a peur de l'induction / à ceux qui laissent des enfants près de la cuisine ». **Passe, de justesse.** Pour passer les deux tests : accroche = la main posée à côté de la casserole qui bout, chute = « la plaque n'a jamais chauffé, c'est la casserole qui la réchauffe » + « H » qui rappelle que le verre peut brûler quand même.

## 2. La scène

Scénario typique, pas un fait divers daté. Une casserole d'eau bout sur un foyer ; à côté, un foyer éteint du même verre. Le spectateur pose la main dessus. Rien. Source du comportement : verre chauffé uniquement par le récipient, vitrocéramique mauvaise conductrice, donc la chaleur ne s'étale pas [S, Wikipedia EN « Induction cooking »] ; la table « ne s'active que lorsqu'un ustensile adapté est posé » et coupe l'apport de chaleur dès qu'on retire le récipient [P, Siemens/BSH aide en ligne].
À montrer : casserole qui bout, main à côté (pas dessous), bobine en dessous (vue éclatée), champ, boucles de courant, thermomètre/teinte du verre, puis voyant « H » après extinction.
Sécurité : ne jamais filmer/conseiller la main sur le verre sous la casserole ; dire que le verre sous la casserole est chaud.

## 3. Le système qui sauve (ici : le système qui est détrompé)

La plaque à induction : en France, en 2017, l'induction représentait près de 56 % des plaques de cuisson installées, taux d'équipement en plaques 61 % [S, Wikipedia FR « Plaque à induction », chiffres INSEE/ADEME non vérifiés à la source]. Sécurité intégrée : détection du récipient (rien à chauffer = coupure), voyant de chaleur résiduelle, arrêt automatique. Elle est chez des millions de foyers.

## 4. Le mécanisme ouvert

Pièces (mots de pro) :
1. **Vitrocéramique** (plateau de verre, ≈ 4 mm [O, non lu à la source], mauvais conducteur de chaleur [S]).
2. **Inducteur** : bobine plate de fil de cuivre (spirale), sous le verre. Souvent un **ferrite** (barreaux) dessous pour canaliser le champ [O, non sourcé ici ; à valider avant de le dire].
3. **Onduleur / convertisseur de puissance** (électronique : redresse le 50 Hz du secteur et fabrique la haute fréquence) [S : « le courant alternatif de l'inducteur est modulé en fréquence, typiquement ≈ 25 kHz », Wikipedia FR].
4. **Capteur de présence / détection du récipient** : la plaque surveille la puissance qu'elle délivre ; pas de casserole, ou casserole trop petite, ou non adaptée : elle coupe [S Wikipedia EN]. Chez Siemens : le niveau de puissance clignote et le foyer s'éteint automatiquement après 90 secondes [P, Siemens BE, modèles précis non identifiés].
5. **Ventilateur** : refroidit l'électronique, peut continuer après l'arrêt [P Siemens BE ; P Miele via moteur de recherche, page non lue, erreur 403].
6. **Capteur de température du verre** et voyant « H » / « h » [S, manuel CDA via manualslib].
7. **Fond de casserole ferromagnétique** (inox magnétique, fonte, acier émaillé) : la pièce qui chauffe vraiment.

Ordre des événements : le secteur (50 Hz) → l'onduleur le transforme en courant alternatif ≈ 25–50 kHz → la bobine crée un champ magnétique alterné → le champ traverse le verre (isolant, transparent au champ) → dans le fond métallique naissent des **courants de Foucault** → effet Joule : le fond chauffe → la chaleur passe à l'eau.
Délais/seuils : pas de chiffre de délai sourcé. Seuils chiffrés : voyant « H » au-dessus de ≈ 60 °C du verre, « h » entre ≈ 45 et 60 °C, « températures approximatives » [S, manuel CDA]. Le voyant s'éteint en cas de coupure de courant alors que la zone peut rester chaude [S, CDA ; AEG].

**Pourquoi ça marche (beat « principe »)** : un champ magnétique qui change vite fait naître des courants dans un métal posé dessus, et ces courants, en luttant contre la résistance du métal, le réchauffent comme un fil de grille-pain ; le champ passe à travers le verre sans le chauffer. Le fond d'une casserole fait un seul tour de fil court-circuité, énorme. Ordre de grandeur : fréquence ≈ 25 kHz, soit 25 000 inversions du champ par seconde, ≈ 500 fois plus que le 50 Hz du secteur [S pour 25 kHz ; calcul 25 000/50 = 500].
Précision exacte : les courants de Foucault font l'essentiel du chauffage ; l'hystérésis des ferromagnétiques ajoute « moins de 10 % » du total selon Wikipedia EN [S]. Un forum l'a donné plus haut : sa source est peu fiable, ne pas le retenir. Dans le script : « surtout des courants de Foucault », rien de plus.

**Fréquence (point 1)** : typique 25–50 kHz [S Wikipedia EN] ; « typiquement aux alentours de 25 kHz » [S Wikipedia FR]. Westinghouse 1971-75 : 25 kHz [S]. Fourchette annoncée 20–100 kHz : plausible, mais le haut (≈ 100 kHz) concerne des appareils spéciaux ; Panasonic 2009 « tout métal » : 60 kHz et plus [S]. **Pourquoi au-dessus de 20 kHz** : c'est la limite haute de l'ouïe humaine (≈ 20 kHz) [O, connaissance générale, aucune source lue ne le dit explicitement pour l'induction : elle dit seulement que les essais à 50 Hz ont échoué et que l'ultrason est devenu la bonne pratique]. À dire : « au-dessus de ce que l'oreille entend », jamais « pour ne pas faire de bruit » comme une raison unique (le chauffage est plus efficace en haute fréquence).

**Alu, cuivre, verre (point 2)** : les récipients en cuivre, aluminium et verre sont « non utilisables » sauf double fond compatible [S Wikipedia FR ; P Siemens BE : à proscrire : verre, terre cuite, cuivre, aluminium]. Pourquoi (physique) : aux fréquences de table, pour un métal non ferreux, la profondeur de peau est trop grande et le chauffage inefficace ; la résistance de surface du cuivre est environ 1/56 de celle de l'acier au carbone à 24 kHz [S Wikipedia EN]. Le verre n'est pas conducteur : aucun courant. Un aluminium **peut** chauffer à plus haute fréquence (brevets, Panasonic 2009) [S]. Le test à l'aimant : un fond compatible attire l'aimant ; l'inox ferromagnétique (non austénitique) marche [S Wikipedia FR].
**Détection (point 2)** : la plaque mesure la puissance délivrée ; sans casserole, ou casserole trop petite : elle coupe [S Wikipedia EN]. Chaque foyer a une limite basse de taille [S résultat de recherche, notice Siemens non ouverte]. **Petite cuillère : attention** : une cuillère en inox magnétique peut chauffer, et les notices (Bosch/Siemens, Electrodepot) interdisent de poser couteaux, fourchettes, cuillères et couvercles sur la table [S, résumés de notices vus par recherche, non ouverts : le PDF BSH n'a pas pu être lu]. Ne pas affirmer « la cuillère ne chauffe pas » : le script dira « la plaque ignore les objets trop petits, mais ne pose rien de métal dessus ».

**Verre froid ? (point 3)** : non, pas froid. « La surface reste relativement froide, chauffée seulement par le récipient » [S Wikipedia FR] ; « le verre est chauffé uniquement par la casserole, la chaleur ne s'étale pas » [S Wikipedia EN]. Sous la casserole, le verre chauffe par contact et le voyant H/h le signale (seuils ci-dessus). Pas de durée de refroidissement sourcée.

**Rendement (point 4)** : les chiffres varient, il faut le dire.
- ADEME : **non lu à la source** (aucune page ADEME ouverte). Relayé par des sites de fournisseurs d'énergie [S/O] : induction ≈ 90 %, vitro ≈ 47–70 %, gaz ≈ 50–60 % ; consommation annuelle 135 kWh (induction) contre 159 kWh (vitrocéramique), soit environ 15 % d'économie ; d'autres citent 20 %. Chiffres incohérents entre sites : **ne pas attribuer à l'ADEME dans le film.**
- DOE américain (Federal Register 2014, via Wikipedia EN) [S] : induction mesurée 70,7–73,6 %, bobine électrique 71,9 %, gaz 43,9 %. Le « 84 % » de l'induction, très cité, vient d'une étude de 1992 que le DOE dit ne pas avoir vérifiée [S]. ACEEE 2014 : induction ≈ 76 % pour chauffer de l'eau ; gaz 30 à 40 % [S].
- Wikipedia FR : « 80 à 90 % » pour l'induction [S, comparaison non chiffrée].
- Formulation sûre : « l'induction envoie de l'ordre de **70 à 85 %** de l'énergie dans la casserole, le gaz **40 %** environ ». [O]

**Bourdonnement (point 5)** : il vient de la casserole, pas du verre. Les forces magnétiques font vibrer les fonds multicouches mal soudés entre eux [S résumé du moteur de recherche d'une page Miele non ouverte : erreur 403 ; Wikipedia EN : « bruit induit électromagnétiquement, aigu, surtout à forte puissance, plus probable avec des couches mal collées »]. Siemens BE [P] : bourdonnement grave à feu vif, sifflements si le récipient est vide, craquements avec fonds multicouches, sifflements aigus quand deux foyers chauffent fort, ventilateur, tic-tac quand plusieurs foyers sont allumés. Remède : baisser la puissance ou changer de casserole. Certains entendent mieux les hautes fréquences [S Wikipedia EN].

## 5. Chiffres

| Fait | Valeur | Niveau |
| --- | --- | --- |
| Fréquence typique | 25 à 50 kHz | [S] |
| Westinghouse Cool Top | 25 kHz (1971-75) | [S] |
| Inversions par seconde vs secteur | 25 000 contre 50 : ×500 | [S + calcul] |
| Hystérésis dans la chaleur | < 10 % du total | [S] |
| Résistance de surface cuivre / acier à 24 kHz | ≈ 1/56 | [S] |
| Voyant H | verre > 60 °C ; h : 45–60 °C | [S] |
| Arrêt auto sans récipient | 90 s (Siemens, modèles non précisés) | [P] |
| Rendement induction | 70 à 85 % | [S/O] |
| Rendement gaz | ≈ 40 % (DOE 43,9 %) | [S] |
| Part de l'induction en France | ≈ 56 % des plaques (2017) | [S] |
| Westinghouse Cool Top 2 | 4 foyers, ≈ 1 600 W chacun, 1 500 $, 1973-75 | [S] |

## 6. Candidates de chute (idée reçue retournée)

1. « Tu crois que la plaque chauffe. Elle ne chauffe pas : elle fait chauffer ta casserole. » [S/P]
2. « Le verre ne chauffe que parce que la casserole le réchauffe. » (puis « H » qui reste allumé) [S, CDA]
3. « Une casserole en alu ou en verre ? Rien. Le champ est le même, mais le métal ne réagit pas. » [S/P]

## 7. Questions du commentaire (fermées, deux camps)

1. « Ta casserole colle à l'aimant… oui ou non ? » (chez soi, test à l'aimant ; une réponse « non » = elle ne marche pas)
2. « Sur ta plaque, tu lis un H… ou rien ? » (peur : verre chaud sans l'avoir vu)
3. « Ta casserole : alu ou inox ? »

## 8. Histoire du système

Brevets dès 1906 (Arthur Berry, UK) et 1909 (Simon Hohlfeld, Allemagne). Frigidaire (années 1950) : démonstration sans production. Westinghouse : présenté en 1971 à Houston (congrès NAHB), Cool Top 1973-75 [S Wikipedia EN]. En France : CEPEM/Thomson, table de 3 kW au début des années 1990 (marques Sauter, Thermor) [S Wikipedia FR].

## 9. Pour l'annonce

- Phrase de 12 à 17 mots (après « Abonne-toi : ») : « Prochain dossier : la plaque à induction, qui ne chauffe pas, et pourtant ta casserole bout. » (17 mots)
- Un seul fait sûr (à la fin du 049) : « Une plaque à induction ne chauffe pas : elle fait chauffer la casserole. » [S/P]

## 10. À ne pas dire

- « Le verre reste froid » / « tu peux poser la main dessus » : faux sous et contre la casserole ; le voyant « H » existe pour ça.
- « La plaque est à 90 % de rendement (ADEME) » : ADEME non lu, valeurs contradictoires ; le 84 % du DOE n'a pas été vérifié par le DOE lui-même.
- « L'hystérésis fait la chaleur » : minoritaire (< 10 %).
- « Elle fonctionne à 20 kHz pour ne pas faire de bruit » : l'oreille, oui, mais non sourcé comme motif d'ingénierie.
- « L'alu ne marche pas » en absolu : possible à plus haute fréquence ; vrai pour la table de ménage standard.
- « La plaque détecte une cuillère et ne chauffe pas » : non garanti ; les notices interdisent de poser des couverts.
- Pas de promesse sur les stimulateurs cardiaques, non traités.
- « 1971 Westinghouse a inventé l'induction » : brevets de 1906, 1909.
- Ne pas dire « arrêt en 90 s » comme règle générale.

## 11. Ce que la voix peut dire (dix phrases)

1. Ta plaque ne chauffe pas. Elle chauffe ta casserole.
2. Sous le verre, une bobine de cuivre.
3. Elle change de sens vingt-cinq mille fois par seconde.
4. Ça fait un champ magnétique qui passe à travers le verre.
5. Dans le fond de la casserole naissent des courants.
6. Ces courants chauffent le métal comme un fil de grille-pain.
7. Pas de casserole, pas de chauffage.
8. Une casserole en alu ou en verre ? Elle ne réagit pas.
9. Le verre ne chauffe que par la casserole.
10. Le H te dit qu'il est encore chaud.

## 12. Sources

- [Siemens-Home BSH Belgique, aide en ligne, tables de cuisson](https://www.siemens-home.bsh-group.com/be/fr/nos-services/aide-en-ligne/depannage/tables-de-cuisson) [P] lue : principe, détection, ustensiles proscrits, arrêt 90 s, liste de bruits.
- [Wikipedia FR, Plaque à induction](https://fr.wikipedia.org/wiki/Plaque_%C3%A0_induction) [S] lue : 25 kHz, matériaux, rendement 80–90 %, histoire Thomson, parts de marché.
- [Wikipedia EN, Induction cooking](https://en.wikipedia.org/wiki/Induction_cooking) [S] lue : fréquences, profondeur de peau, hystérésis < 10 %, rendements ACEEE/DOE/2023, détection, histoire, bruit.
- [Manuel CDA HN6860FR sur ManualsLib](https://www.manualslib.com/manual/3212441/Cda-Hn6860fr.html?page=19) [S] lue : H > 60 °C, h 45–60 °C, pas d'affichage en panne.
- [Miele support, bruits](https://www.miele.co.uk/support/customer-assistance/hob-1232/all/noises_coming_from_the_induction_hob_during_cooking-92672858251) **non lue : erreur 403** ; contenu connu par le résumé de la recherche.
- [ACEEE 2014, papier 9-702](https://www.aceee.org/files/proceedings/2014/data/papers/9-702.pdf) **non ouvert** (cité par recherche).
- [Notice BSH 9001378885](https://media3.bsh-group.com/Documents/9001378885_C.pdf) **non lue : PDF illisible**. [Cecconi, académie de Versailles](https://www.hotellerie-restauration.ac-versailles.fr/IMG/pdf/La_plaque-a_induction-_F_Cecconi.pdf) **non lue : PDF chiffré**.
- ADEME : **aucune page ADEME lue** ; chiffres par sites de fournisseurs (Selectra, Ekwateur, TotalEnergies), non utilisés comme sources.

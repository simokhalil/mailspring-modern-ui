# Modern UI pour Mailspring

Plugin pour le **build officiel de Mailspring** (testé contre la 1.26.2) qui
modernise l'interface dans l'esprit d'Airmail, sans fork, sans recompilation,
sans toucher au bundle de l'application et sans thème séparé.

```
[Rail des comptes][Dossiers][Liste des messages][Lecture]
```

Basé sur le starter officiel
[Mailspring-Plugin-Starter](https://github.com/Foundry376/Mailspring-Plugin-Starter) :
même empaquetage (`src/` compilé par `tsc` vers `lib/`, `styles/` chargé par
Mailspring, `package.json` avec `engines.mailspring` et `windowTypes`).

## Fonctionnalités

| # | Fonctionnalité | État | Mécanisme |
|---|---|---|---|
| A | Rail vertical des comptes | ✅ Implémentée | Composant injecté dans la colonne `RootSidebar`, navigation via `Actions.focusDefaultMailboxPerspectiveForAccounts` (comme Cmd+1…9) |
| B | Avatars dans la liste des messages | ✅ Implémentée | Rôle `ThreadListIcon` (point d'extension officiel de la liste) |
| C | Titre dynamique du dossier | ✅ Implémentée | Composant injecté dans la colonne `ThreadList`, lit `FocusedPerspectiveStore` |
| D | « Supprimer » au lieu d'« Archiver » dans les notifications | ✅ Implémentée, avec garde-fous | Remplace l'instance `Notifier` du package interne `unread-notifications` par une sous-classe (aucun patch) |
| — | Palette sombre/claire, accent | ✅ Implémentée | `styles/chrome.less`, `styles/content.less`, `styles/accents.less`, désactivables |
| — | Réglages | ✅ Implémentée | Onglet natif Préférences › Modern UI (`PreferencesUIStore`), ⚙ dans le rail |

### A. Rail des comptes
- 64 px, fond `#202833`, à gauche de la sidebar native, dans la même colonne :
  la barre d'outils, les boutons de fenêtre macOS et le redimensionnement restent natifs.
- Entrée « Tous les comptes » (si plusieurs comptes) puis un rond par compte.
- Icône d'un compte : celle choisie dans Préférences › Modern UI › Icônes des
  comptes ; sinon le logo du fournisseur **déjà présent dans Mailspring**
  (Gmail, Outlook, Office 365, iCloud, Yahoo, Fastmail, GMX, Yandex, Exchange) ;
  sinon les initiales sur une couleur déterministe, ou la couleur choisie dans
  Préférences › Comptes. Rien n'est téléchargé.
- Indicateur de sélection (barre + anneau turquoise `#27B8C7`), survol, focus clavier.
- Info-bulle : libellé + adresse.
- Badge : non-lus de la boîte de réception (somme pour « Tous les comptes »), plafonné à 99+.
- Réagit à l'ajout/suppression de comptes, au changement de compte ou de dossier
  et aux compteurs ; défilement discret si les comptes dépassent la hauteur.
- Bouton « + » (ajouter un compte) et clic droit (ajouter / gérer les comptes).
- La flèche « sélecteur de compte » native est masquée (redondante) ; ses deux
  commandes restent accessibles depuis le rail. La sidebar n'a pas d'entrée
  « Unified Inbox » distincte : en vue « Tous les comptes », elle affiche les
  dossiers unifiés natifs, qui sont nécessaires et sont conservés.

### B. Avatars
- Cercle de 34 px (24 px en disposition large), centré verticalement.
- Contact choisi : expéditeur le plus récent qui n'est pas vous ; s'il n'y a que
  vos messages (Envoyés), le premier destinataire ; sinon le premier participant.
  Les brouillons sont ignorés. Le choix ne change que si un nouveau message arrive.
- Photo : uniquement une photo **stockée localement** dans le carnet d'adresses
  (vCard CardDAV avec PHOTO intégrée). Les photos distantes (Google, URL) ne
  sont jamais chargées. Recherche groupée en une requête SQLite locale par image,
  avec cache.
- Sinon initiales (nom, ou partie locale de l'adresse), fond pastel et texte
  foncé de la même teinte, toujours la même couleur pour une adresse.
- Aucune différence de géométrie entre messages lus et non lus.

### C. Titre du dossier
- 22 px, graisse 650, `#1F2937`, sur le fond de la liste, sous la barre d'outils.
- Nom réel du dossier (noms personnalisés respectés). Pour la boîte unifiée et
  `INBOX`, le libellé traduit de Mailspring (« Boîte de réception »).
  « Résultats de la recherche » + la requête pendant une recherche.
- Sous-titre : compte courant, ou « Tous les comptes ».

### D. Notifications
- Les notifications restent celles de Mailspring (même API, même son, réponse
  rapide, regroupement « N nouveaux messages », fermeture à la lecture).
- Le second bouton devient « Supprimer » et appelle
  `TaskFactory.tasksForMovingToTrash` : **déplacement vers la Corbeille** du bon
  compte, jamais de suppression définitive. Le bouton « Marquer comme lu » est inchangé.
- Si le compte n'a pas de Corbeille, la notification garde « Archiver ».
- Si la structure interne de Mailspring ne correspond pas, la fonctionnalité ne
  s'active pas et les notifications d'origine restent en place.

## Installation (macOS)

Prérequis : Node.js ≥ 18 et npm (pour compiler).

```bash
cd mailspring-modern-ui
```

```bash
sh scripts/install.sh
```

Le script installe les dépendances de développement, compile `src/` vers `lib/`,
valide les styles avec le compilateur LESS de Mailspring (3.13.1), vérifie le
paquet, puis **demande confirmation** avant de copier `package.json`, `lib/`,
`styles/`, `README.md` et `LICENSE` dans :

```
~/Library/Application Support/Mailspring/packages/mailspring-modern-ui
```

Quittez ensuite Mailspring (Cmd+Q) et rouvrez-le. Pour le développement,
`sh scripts/install.sh --link` crée un lien symbolique : après `npm run build`,
utilisez Developer › Reload dans la fenêtre principale.

Alternative sans script : `npm install && npm run build`, puis
Mailspring › Install a Plugin… et choisir le dossier.

## Désinstallation

```bash
sh scripts/uninstall.sh
```

ou supprimez le dossier `~/Library/Application Support/Mailspring/packages/mailspring-modern-ui`,
puis relancez Mailspring. Le plugin n'écrit rien d'autre : pas de fichier
modifié dans Mailspring, pas de réglage enregistré, et le remplacement des
notifications n'existe qu'en mémoire.

## Réglages

**Mailspring › Préférences › Modern UI** (onglet ajouté par le plugin via l'API
publique `PreferencesUIStore`, comme les plugins intégrés « Signatures » ou
« MCP »). Aussi accessible depuis l'icône ⚙ en bas du rail et son clic droit ;
l'onglet reste disponible quand le rail est désactivé.

| Section | Réglage | Valeurs (défaut en gras) |
|---|---|---|
| Rail des comptes | Afficher le rail | **oui** / non |
| | Entrée « Tous les comptes » | **oui** / non |
| | Badges de non-lus | **oui** / non |
| Liste des messages | Avatars des contacts | **oui** / non |
| | Taille des avatars | 28 / 32 / **36** / 40 px |
| | Titre du dossier | **oui** / non |
| Apparence | Barre d'outils et sidebar sombres | **oui** / non |
| | Couleurs Modern UI pour la liste et la lecture | **oui** / non |
| | Couleur d'accent | **turquoise**, bleu, indigo, violet, rose, orange, vert |
| Notifications | Second bouton | **Supprimer (Corbeille)** / Archiver (natif) |
| Icônes des comptes | Icône et couleur de fond, par compte | **automatique** (logo du fournisseur, sinon initiales) ; 64 icônes Lucide, 36 logos Simple Icons, 12 couleurs |

Chaque changement s'applique immédiatement, sans redémarrer. Les valeurs sont
enregistrées par le système de configuration de Mailspring (`AppEnv.config`,
validé par le schéma exporté par le plugin) dans `config.json`, sous la clé
`mailspring-modern-ui`. Le bouton « Rétablir les réglages par défaut » les efface.
Les préférences natives de Mailspring ne sont pas modifiées.

### Icônes des comptes

Section en bas de l'onglet : la liste des comptes à gauche ; à droite,
l'aperçu (sur un morceau de rail, à la taille réelle), les couleurs de fond
(« A » = automatique : couleur de la marque pour un logo, couleur du compte
sinon), une recherche (nom, mots-clés anglais et français, sans accents) et
les deux grilles. Chaque clic s'applique au rail immédiatement ;
« Réinitialiser » revient à l'icône automatique.

Les choix sont enregistrés par identifiant de compte Mailspring (pas par
position), dans `mailspring-modern-ui.accountIcons` :

```json
"accountIcons": {
  "cf55791f": { "icon": "briefcase", "source": "lucide", "backgroundColor": "#04876A" },
  "d0db3624": { "icon": "gmail", "source": "simple-icons" }
}
```

- Les comptes Mailspring ne sont pas modifiés.
- Une icône introuvable (supprimée d'une version future du plugin) revient à
  l'icône automatique en gardant la couleur choisie.
- Un compte supprimé disparaît de la liste ; son entrée est nettoyée au
  prochain changement d'icône. Un compte ajouté a l'icône automatique.
- Simple Icons ne contient plus les marques retirées à la demande de leurs
  propriétaires (Microsoft/Outlook, Yahoo, Slack, LinkedIn, Amazon…). Pour
  Outlook et Yahoo, le logo intégré à Mailspring reste l'icône automatique.

Notes :
- Si l'entrée « Tous les comptes » est masquée, la vue unifiée reste accessible
  par Cmd+1 ou le menu Fenêtre.
- En disposition liste (lignes de 36 px), les avatars sont plafonnés à 26 px.
- Si la version de Mailspring ne permet pas de modifier les notifications, le
  réglage est grisé avec une explication.
- L'onglet utilise l'icône générique des Préférences : Mailspring ne cherche
  les icônes d'onglet que dans ses propres ressources.
- Les clés `theme`, `notificationDeleteAction` et `accountIconStyle` des versions
  précédentes sont ignorées (remplacées par `darkChrome`/`lightContent`,
  `notificationAction` et `accountIcons`).

## Structure

```
package.json            main ./lib/main, engines.mailspring, windowTypes, syncInit
src/main.ts             activate/deactivate, activation de chaque fonctionnalité
src/settings.ts         schéma de réglages (export `config`), lecture/écriture
src/i18n.ts             textes du plugin (anglais, français)
src/icons/icon-data.ts  icônes embarquées, GÉNÉRÉ par scripts/build-icons.js
src/components/         AccountRail, AccountIcon, RailTooltip, Avatar, ThreadAvatar,
                        FolderTitle, SettingsTab (onglet des Préférences),
                        AccountIconsEditor, AccountAvatar, IconGlyph
src/services/           navigation comptes, choix du contact, initiales/couleurs,
                        photos vCard, cache photos, titre, largeur de colonne,
                        accents, notifications
styles/index.less       point d'entrée chargé par Mailspring (+ partiels : rail,
                        avatars, titre, accents, chrome sombre, contenu clair, onglet)
lib/                    JavaScript compilé, livré
types/mailspring/       déclarations TypeScript de l'API Mailspring utilisée
test/                   tests (node:test) avec un runtime Mailspring simulé
scripts/                install.sh, uninstall.sh, verify-package.js, build-icons.js
THIRD_PARTY_NOTICES.md  licences Lucide (ISC) et Simple Icons (CC0), marques
docs/compatibility.md   API utilisées, détails internes, risques
```

React n'est pas embarqué : le plugin utilise celui de Mailspring via
`mailspring-exports` (`react`, `react-dom` et `react-test-renderer` ne servent
qu'aux tests). Aucun module `node_modules` n'est nécessaire à l'exécution.

## Licences des icônes

- **Lucide** : licence ISC (avec des icônes issues de Feather, MIT). Texte
  complet dans `THIRD_PARTY_NOTICES.md`, livré avec le plugin.
- **Simple Icons** : CC0 1.0. Les logos restent des marques de leurs
  propriétaires ; ils servent seulement à reconnaître vos comptes. Liens vers
  les chartes de marque dans `THIRD_PARTY_NOTICES.md`.
- Seules les 100 icônes listées dans `scripts/build-icons.js` sont copiées
  (72 Ko de source) ; les bibliothèques sont des dépendances de développement,
  jamais chargées à l'exécution. Pour changer la sélection : modifier les
  listes puis `npm run icons`.

## Développement

```bash
npm install
```

```bash
npm run verify
```

`verify` = recompilation, lint LESS (Less 3.13.1), tests, contrôle du paquet.

## Tests effectués

| Vérification | Résultat |
|---|---|
| `tsc` (TypeScript 5.9, strict sur les variables inutilisées) | ✅ sans erreur |
| Compilation LESS avec Less 3.13.1 (version embarquée par Mailspring 1.26.2) | ✅ |
| `scripts/verify-package.js` : nom, `engines`, `windowTypes`, point d'entrée, exports, `lib/` à jour, aucun `require` hors runtime Mailspring | ✅ |
| 42 tests `node:test` : services purs (dont icônes : jeu embarqué, résolution et fallbacks, recherche, persistance) ; 19 qui chargent `lib/` contre un runtime Mailspring simulé (enregistrement, rendu React 17, navigation, stores, désabonnements, réglages à chaud, onglet des Préférences, éditeur d'icônes, notifications) ; 3 qui compilent le LESS | ✅ 42/42 |
| `install.sh` / `uninstall.sh` vers un dossier temporaire (annulation, copie, suppression) | ✅ |
| Chargement dans Mailspring 1.26.2 (votre installation) | ✅ actif, aucune erreur console |

Pas de seconde instance de test : avec un profil vide, la fenêtre principale ne
s'affiche pas sans compte, et un profil de test partagerait le trousseau macOS de
l'installation principale. La validation visuelle se fait sur l'installation réelle.

## Validation manuelle dans Mailspring

1. Installer, relancer Mailspring. Developer › Toggle Developer Tools : aucune
   erreur `mailspring-modern-ui` dans la console ; la ligne
   `notifications: "Archive" replaced with "Delete"` apparaît ~1 s après le démarrage.
2. **Rail** : 6 entrées (Tous + 5 comptes). Outlook a son logo ; les deux Gmail
   et les deux IMAP ont des initiales de couleurs différentes. Cliquer un compte :
   la sidebar n'affiche que ses dossiers, la boîte de réception s'ouvre,
   l'indicateur suit. Cmd+1…6 : le rail suit aussi. Info-bulle au survol.
   Redimensionner la sidebar ; vérifier les boutons de fenêtre et la barre d'outils.
3. **Avatars** : en vue scindée et en disposition liste (View › Layout), dossiers
   Inbox, Envoyés (avatar du destinataire), Brouillons, une liste de diffusion.
   Faire défiler rapidement une longue liste : fluidité.
4. **Titre** : changer de dossier, de compte, ouvrir un dossier personnalisé,
   lancer une recherche, revenir à « Tous les comptes ».
5. **Notifications** : s'envoyer un message depuis un autre compte, Mailspring
   en arrière-plan ; Réglages Système › Notifications › Mailspring : style
   « Alertes » pour voir les boutons. « Supprimer » → le message est dans la
   Corbeille du bon compte.
6. **Réglages** : Préférences › Modern UI (ou ⚙ dans le rail). Changer
   l'accent, la taille des avatars, masquer « Tous les comptes » : effet
   immédiat. Désactiver le rail : l'onglet reste dans les Préférences.
   Décocher les deux options d'Apparence : couleurs d'origine immédiatement.
   Icônes des comptes : choisir une icône et une couleur pour un compte, le
   rail change aussitôt ; relancer Mailspring, le choix est conservé ;
   « Réinitialiser » rend l'icône automatique.
7. **Désinstallation** : désinstaller et relancer → interface native complète.

## Limites

- **Largeur de la sidebar** : la colonne s'élargit de la largeur du rail, donc
  la liste des dossiers garde sa plage native (165 à 250 px). Cela passe par la
  déclaration de largeur du composant natif `AccountSidebar` (voir docs/compatibility.md).
- **Sidebar masquée** (View › Hide Sidebar) : le rail est masqué avec elle (même colonne).
- **Photos de contacts** : seulement les photos intégrées aux vCards CardDAV.
  Les contacts Google (photos distantes) et les comptes sans carnet d'adresses
  ont des initiales. C'est voulu : aucune requête réseau.
- **Vue scindée** : Mailspring n'affiche qu'une icône injectée par ligne ; les
  icônes des autres plugins (suivi d'ouverture…) sont redessinées en pastille
  sur l'avatar.
- **Notifications** : dépendent du package interne `unread-notifications` (voir
  docs/compatibility.md). Les boutons d'action macOS ne s'affichent qu'en style
  « Alertes » ou au survol de « Options » en style « Bannières », comme pour
  les notifications natives. Les 5 nouveaux messages ou plus sont regroupés
  sans bouton (comportement natif).
- **Thème** : écrit par-dessus les styles de base de Mailspring et de
  ui-darkside, et vérifié à l'écran avec ui-darkside. Avec un thème sombre, décochez « Couleurs Modern UI pour la liste
  et la lecture ».
- **Futures versions** : la branche `master` de Mailspring ajoute un rail de
  navigation natif ; voir docs/compatibility.md.

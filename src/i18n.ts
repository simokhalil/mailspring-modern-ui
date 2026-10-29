import { getCurrentLocale, localized } from 'mailspring-exports';

// Strings that belong to the plugin. Mailspring's `localized` only knows the
// app's own strings, so the plugin carries English and French itself and
// follows the language Mailspring is displayed in.

const FR: { [en: string]: string } = {
  'Modern UI': 'Modern UI',
  'Modern UI settings': 'Réglages Modern UI',
  'Account rail': 'Rail des comptes',
  'Show the account rail': 'Afficher le rail des comptes',
  'Show the "All Accounts" entry': 'Afficher l’entrée « Tous les comptes »',
  'Show unread badges': 'Afficher les badges de messages non lus',
  'Account icons': 'Icônes des comptes',
  'Automatic (logo, initials when two accounts share a provider)':
    'Automatique (logo, initiales si deux comptes ont le même fournisseur)',
  'Provider logo': 'Logo du fournisseur',
  Initials: 'Initiales',
  'Message list': 'Liste des messages',
  'Show contact avatars': 'Afficher les avatars des contacts',
  'Avatar size': 'Taille des avatars',
  'Show the folder title above the list': 'Afficher le titre du dossier au-dessus de la liste',
  Appearance: 'Apparence',
  'Dark toolbar and sidebar': 'Barre d’outils et sidebar sombres',
  'Modern UI colors for the list and the reader': 'Couleurs Modern UI pour la liste et la lecture',
  'Accent color': 'Couleur d’accent',
  turquoise: 'Turquoise',
  blue: 'Bleu',
  indigo: 'Indigo',
  violet: 'Violet',
  pink: 'Rose',
  orange: 'Orange',
  green: 'Vert',
  Notifications: 'Notifications',
  'Second button of new mail notifications': 'Second bouton des notifications de nouveaux messages',
  'Delete (move to Trash)': 'Supprimer (déplacer vers la Corbeille)',
  'Archive (Mailspring default)': 'Archiver (comportement de Mailspring)',
  'This Mailspring version does not allow changing it; notifications keep the Archive button.':
    'Cette version de Mailspring ne permet pas de le modifier ; les notifications gardent le bouton Archiver.',
  'Settings apply immediately and are saved with your Mailspring preferences.':
    'Les réglages s’appliquent immédiatement et sont enregistrés avec vos préférences Mailspring.',
  'When the rail is hidden, this tab stays available in Preferences.':
    'Quand le rail est masqué, cet onglet reste accessible dans les Préférences.',
  'Restore defaults': 'Rétablir les réglages par défaut',
};

function language(): string {
  try {
    return (getCurrentLocale() || 'en').split('-')[0].toLowerCase();
  } catch (err) {
    return 'en';
  }
}

export function t(en: string): string {
  if (language() === 'fr' && FR[en]) {
    return FR[en];
  }
  // Mailspring may know the string (e.g. "Appearance", "Notifications").
  return localized(en);
}

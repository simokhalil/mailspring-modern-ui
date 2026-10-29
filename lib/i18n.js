"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.t = t;
const mailspring_exports_1 = require("mailspring-exports");
// Strings that belong to the plugin. Mailspring's `localized` only knows the
// app's own strings, so the plugin carries English and French itself and
// follows the language Mailspring is displayed in.
const FR = {
    'Modern UI': 'Modern UI',
    'Modern UI settings': 'Réglages Modern UI',
    'Account rail': 'Rail des comptes',
    'Show the account rail': 'Afficher le rail des comptes',
    'Show the "All Accounts" entry': 'Afficher l’entrée « Tous les comptes »',
    'Show unread badges': 'Afficher les badges de messages non lus',
    'Account icons': 'Icônes des comptes',
    'Automatic (logo, initials when two accounts share a provider)': 'Automatique (logo, initiales si deux comptes ont le même fournisseur)',
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
    'This Mailspring version does not allow changing it; notifications keep the Archive button.': 'Cette version de Mailspring ne permet pas de le modifier ; les notifications gardent le bouton Archiver.',
    'Settings apply immediately and are saved with your Mailspring preferences.': 'Les réglages s’appliquent immédiatement et sont enregistrés avec vos préférences Mailspring.',
    'When the rail is hidden, this tab stays available in Preferences.': 'Quand le rail est masqué, cet onglet reste accessible dans les Préférences.',
    'Restore defaults': 'Rétablir les réglages par défaut',
};
function language() {
    try {
        return ((0, mailspring_exports_1.getCurrentLocale)() || 'en').split('-')[0].toLowerCase();
    }
    catch (err) {
        return 'en';
    }
}
function t(en) {
    if (language() === 'fr' && FR[en]) {
        return FR[en];
    }
    // Mailspring may know the string (e.g. "Appearance", "Notifications").
    return (0, mailspring_exports_1.localized)(en);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pMThuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBc0RBLGNBTUM7QUE1REQsMkRBQWlFO0FBRWpFLDZFQUE2RTtBQUM3RSx5RUFBeUU7QUFDekUsbURBQW1EO0FBRW5ELE1BQU0sRUFBRSxHQUE2QjtJQUNuQyxXQUFXLEVBQUUsV0FBVztJQUN4QixvQkFBb0IsRUFBRSxvQkFBb0I7SUFDMUMsY0FBYyxFQUFFLGtCQUFrQjtJQUNsQyx1QkFBdUIsRUFBRSw4QkFBOEI7SUFDdkQsK0JBQStCLEVBQUUsd0NBQXdDO0lBQ3pFLG9CQUFvQixFQUFFLHlDQUF5QztJQUMvRCxlQUFlLEVBQUUsb0JBQW9CO0lBQ3JDLCtEQUErRCxFQUM3RCx1RUFBdUU7SUFDekUsZUFBZSxFQUFFLHFCQUFxQjtJQUN0QyxRQUFRLEVBQUUsV0FBVztJQUNyQixjQUFjLEVBQUUsb0JBQW9CO0lBQ3BDLHNCQUFzQixFQUFFLG1DQUFtQztJQUMzRCxhQUFhLEVBQUUsb0JBQW9CO0lBQ25DLHNDQUFzQyxFQUFFLG9EQUFvRDtJQUM1RixVQUFVLEVBQUUsV0FBVztJQUN2QiwwQkFBMEIsRUFBRSxtQ0FBbUM7SUFDL0QsOENBQThDLEVBQUUsZ0RBQWdEO0lBQ2hHLGNBQWMsRUFBRSxrQkFBa0I7SUFDbEMsU0FBUyxFQUFFLFdBQVc7SUFDdEIsSUFBSSxFQUFFLE1BQU07SUFDWixNQUFNLEVBQUUsUUFBUTtJQUNoQixNQUFNLEVBQUUsUUFBUTtJQUNoQixJQUFJLEVBQUUsTUFBTTtJQUNaLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLEtBQUssRUFBRSxNQUFNO0lBQ2IsYUFBYSxFQUFFLGVBQWU7SUFDOUIseUNBQXlDLEVBQUUsc0RBQXNEO0lBQ2pHLHdCQUF3QixFQUFFLHdDQUF3QztJQUNsRSw4QkFBOEIsRUFBRSx1Q0FBdUM7SUFDdkUsNEZBQTRGLEVBQzFGLDBHQUEwRztJQUM1Ryw0RUFBNEUsRUFDMUUsOEZBQThGO0lBQ2hHLG1FQUFtRSxFQUNqRSw2RUFBNkU7SUFDL0Usa0JBQWtCLEVBQUUsa0NBQWtDO0NBQ3ZELENBQUM7QUFFRixTQUFTLFFBQVE7SUFDZixJQUFJLENBQUM7UUFDSCxPQUFPLENBQUMsSUFBQSxxQ0FBZ0IsR0FBRSxJQUFJLElBQUksQ0FBQyxDQUFDLEtBQUssQ0FBQyxHQUFHLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUNsRSxDQUFDO0lBQUMsT0FBTyxHQUFHLEVBQUUsQ0FBQztRQUNiLE9BQU8sSUFBSSxDQUFDO0lBQ2QsQ0FBQztBQUNILENBQUM7QUFFRCxTQUFnQixDQUFDLENBQUMsRUFBVTtJQUMxQixJQUFJLFFBQVEsRUFBRSxLQUFLLElBQUksSUFBSSxFQUFFLENBQUMsRUFBRSxDQUFDLEVBQUUsQ0FBQztRQUNsQyxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBQ0QsdUVBQXVFO0lBQ3ZFLE9BQU8sSUFBQSw4QkFBUyxFQUFDLEVBQUUsQ0FBQyxDQUFDO0FBQ3ZCLENBQUMifQ==
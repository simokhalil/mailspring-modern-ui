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
    Accounts: 'Comptes',
    'Background color': 'Couleur de fond',
    Automatic: 'Automatique',
    'Custom icon': 'Icône personnalisée',
    'Automatic icon (provider logo, else initials)': 'Icône automatique (logo du fournisseur, sinon initiales)',
    Reset: 'Réinitialiser',
    'Search icons…': 'Rechercher une icône…',
    Icons: 'Icônes',
    Brands: 'Marques',
    'No icon matches this search.': 'Aucune icône ne correspond à cette recherche.',
    'Icons: Lucide (ISC license) and Simple Icons (CC0). Logos are trademarks of their owners.': 'Icônes : Lucide (licence ISC) et Simple Icons (CC0). Les logos sont des marques de leurs propriétaires.',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaTE4bi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9pMThuLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBK0RBLGNBTUM7QUFyRUQsMkRBQWlFO0FBRWpFLDZFQUE2RTtBQUM3RSx5RUFBeUU7QUFDekUsbURBQW1EO0FBRW5ELE1BQU0sRUFBRSxHQUE2QjtJQUNuQyxXQUFXLEVBQUUsV0FBVztJQUN4QixvQkFBb0IsRUFBRSxvQkFBb0I7SUFDMUMsY0FBYyxFQUFFLGtCQUFrQjtJQUNsQyx1QkFBdUIsRUFBRSw4QkFBOEI7SUFDdkQsK0JBQStCLEVBQUUsd0NBQXdDO0lBQ3pFLG9CQUFvQixFQUFFLHlDQUF5QztJQUMvRCxlQUFlLEVBQUUsb0JBQW9CO0lBQ3JDLFFBQVEsRUFBRSxTQUFTO0lBQ25CLGtCQUFrQixFQUFFLGlCQUFpQjtJQUNyQyxTQUFTLEVBQUUsYUFBYTtJQUN4QixhQUFhLEVBQUUscUJBQXFCO0lBQ3BDLCtDQUErQyxFQUM3QywwREFBMEQ7SUFDNUQsS0FBSyxFQUFFLGVBQWU7SUFDdEIsZUFBZSxFQUFFLHVCQUF1QjtJQUN4QyxLQUFLLEVBQUUsUUFBUTtJQUNmLE1BQU0sRUFBRSxTQUFTO0lBQ2pCLDhCQUE4QixFQUFFLCtDQUErQztJQUMvRSwyRkFBMkYsRUFDekYseUdBQXlHO0lBQzNHLGNBQWMsRUFBRSxvQkFBb0I7SUFDcEMsc0JBQXNCLEVBQUUsbUNBQW1DO0lBQzNELGFBQWEsRUFBRSxvQkFBb0I7SUFDbkMsc0NBQXNDLEVBQUUsb0RBQW9EO0lBQzVGLFVBQVUsRUFBRSxXQUFXO0lBQ3ZCLDBCQUEwQixFQUFFLG1DQUFtQztJQUMvRCw4Q0FBOEMsRUFBRSxnREFBZ0Q7SUFDaEcsY0FBYyxFQUFFLGtCQUFrQjtJQUNsQyxTQUFTLEVBQUUsV0FBVztJQUN0QixJQUFJLEVBQUUsTUFBTTtJQUNaLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLE1BQU0sRUFBRSxRQUFRO0lBQ2hCLElBQUksRUFBRSxNQUFNO0lBQ1osTUFBTSxFQUFFLFFBQVE7SUFDaEIsS0FBSyxFQUFFLE1BQU07SUFDYixhQUFhLEVBQUUsZUFBZTtJQUM5Qix5Q0FBeUMsRUFBRSxzREFBc0Q7SUFDakcsd0JBQXdCLEVBQUUsd0NBQXdDO0lBQ2xFLDhCQUE4QixFQUFFLHVDQUF1QztJQUN2RSw0RkFBNEYsRUFDMUYsMEdBQTBHO0lBQzVHLDRFQUE0RSxFQUMxRSw4RkFBOEY7SUFDaEcsbUVBQW1FLEVBQ2pFLDZFQUE2RTtJQUMvRSxrQkFBa0IsRUFBRSxrQ0FBa0M7Q0FDdkQsQ0FBQztBQUVGLFNBQVMsUUFBUTtJQUNmLElBQUksQ0FBQztRQUNILE9BQU8sQ0FBQyxJQUFBLHFDQUFnQixHQUFFLElBQUksSUFBSSxDQUFDLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLFdBQVcsRUFBRSxDQUFDO0lBQ2xFLENBQUM7SUFBQyxPQUFPLEdBQUcsRUFBRSxDQUFDO1FBQ2IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQWdCLENBQUMsQ0FBQyxFQUFVO0lBQzFCLElBQUksUUFBUSxFQUFFLEtBQUssSUFBSSxJQUFJLEVBQUUsQ0FBQyxFQUFFLENBQUMsRUFBRSxDQUFDO1FBQ2xDLE9BQU8sRUFBRSxDQUFDLEVBQUUsQ0FBQyxDQUFDO0lBQ2hCLENBQUM7SUFDRCx1RUFBdUU7SUFDdkUsT0FBTyxJQUFBLDhCQUFTLEVBQUMsRUFBRSxDQUFDLENBQUM7QUFDdkIsQ0FBQyJ9
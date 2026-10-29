"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const settings_1 = require("../settings");
const accents_1 = require("../services/accents");
const notification_delete_action_1 = require("../services/notification-delete-action");
const i18n_1 = require("../i18n");
function readAll() {
    const values = {};
    for (const key of settings_1.SETTING_KEYS) {
        values[key] = (0, settings_1.getSetting)(key);
    }
    return values;
}
const fieldId = (key) => `modern-ui-setting-${key}`;
// Preferences › Modern UI. Uses the same markup as Mailspring's own tabs
// (section > h6 + .item, see preferences/lib/tabs/config-schema-item.tsx) so it
// picks up the native preferences styling. Values go through AppEnv.config,
// which validates them against the schema and saves them to config.json; the
// plugin applies each change as soon as it is written.
class SettingsTab extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this.subscriptions = [];
        this.state = readAll();
    }
    componentDidMount() {
        // Also catches edits made elsewhere (config.json, another window).
        this.subscriptions = settings_1.SETTING_KEYS.map((key) => (0, settings_1.observeSetting)(key, (value) => this.setState({ [key]: value })));
    }
    componentWillUnmount() {
        this.subscriptions.forEach((s) => s.dispose());
        this.subscriptions = [];
    }
    renderCheckbox(key, label, disabled = false) {
        return (mailspring_exports_1.React.createElement("div", { className: `item${disabled ? ' modern-ui-setting-disabled' : ''}` },
            mailspring_exports_1.React.createElement("input", { id: fieldId(key), type: "checkbox", checked: !!this.state[key], disabled: disabled, onChange: (e) => (0, settings_1.setSetting)(key, e.target.checked) }),
            mailspring_exports_1.React.createElement("label", { htmlFor: fieldId(key) }, label)));
    }
    renderSelect(key, label, options, disabled = false) {
        const numeric = typeof options[0].value === 'number';
        return (mailspring_exports_1.React.createElement("div", { className: `item${disabled ? ' modern-ui-setting-disabled' : ''}` },
            mailspring_exports_1.React.createElement("label", { htmlFor: fieldId(key), style: { paddingRight: 8 } },
                label,
                ":"),
            mailspring_exports_1.React.createElement("select", { id: fieldId(key), value: this.state[key], disabled: disabled, onChange: (e) => (0, settings_1.setSetting)(key, numeric ? Number(e.target.value) : e.target.value) }, options.map((o) => (mailspring_exports_1.React.createElement("option", { key: o.value, value: o.value }, o.label))))));
    }
    renderAccentPicker() {
        const current = this.state.accent;
        return (mailspring_exports_1.React.createElement("div", { className: "item" },
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-setting-label" },
                (0, i18n_1.t)('Accent color'),
                ":"),
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-accent-swatches", role: "radiogroup", "aria-label": (0, i18n_1.t)('Accent color') }, accents_1.ACCENT_PRESETS.map((preset) => (mailspring_exports_1.React.createElement("button", { key: preset.id, type: "button", role: "radio", "aria-checked": current === preset.id, "aria-label": (0, i18n_1.t)(preset.id), title: (0, i18n_1.t)(preset.id), className: `modern-ui-accent-swatch${current === preset.id ? ' is-selected' : ''}`, style: { backgroundColor: preset.color }, onClick: () => (0, settings_1.setSetting)('accent', preset.id) }))))));
    }
    render() {
        const railOff = !this.state.accountRail;
        const avatarsOff = !this.state.threadAvatars;
        const notificationsUnavailable = (0, notification_delete_action_1.notificationActionStatus)() === 'unavailable';
        return (mailspring_exports_1.React.createElement("div", { className: "container-modern-ui" },
            mailspring_exports_1.React.createElement("p", { className: "modern-ui-settings-intro" },
                (0, i18n_1.t)('Settings apply immediately and are saved with your Mailspring preferences.'),
                ' ',
                (0, i18n_1.t)('When the rail is hidden, this tab stays available in Preferences.')),
            mailspring_exports_1.React.createElement("div", { className: "two-columns-flexbox" },
                mailspring_exports_1.React.createElement("div", { style: { flex: 1 } },
                    mailspring_exports_1.React.createElement("section", null,
                        mailspring_exports_1.React.createElement("h6", null, (0, i18n_1.t)('Account rail')),
                        this.renderCheckbox('accountRail', (0, i18n_1.t)('Show the account rail')),
                        this.renderCheckbox('railShowAllAccounts', (0, i18n_1.t)('Show the "All Accounts" entry'), railOff),
                        this.renderCheckbox('railUnreadBadges', (0, i18n_1.t)('Show unread badges'), railOff),
                        this.renderSelect('accountIconStyle', (0, i18n_1.t)('Account icons'), [
                            { value: 'auto', label: (0, i18n_1.t)('Automatic (logo, initials when two accounts share a provider)') },
                            { value: 'provider', label: (0, i18n_1.t)('Provider logo') },
                            { value: 'initials', label: (0, i18n_1.t)('Initials') },
                        ], railOff)),
                    mailspring_exports_1.React.createElement("section", null,
                        mailspring_exports_1.React.createElement("h6", null, (0, i18n_1.t)('Message list')),
                        this.renderCheckbox('threadAvatars', (0, i18n_1.t)('Show contact avatars')),
                        this.renderSelect('avatarSize', (0, i18n_1.t)('Avatar size'), settings_1.AVATAR_SIZES.map((px) => ({ value: px, label: `${px} px` })), avatarsOff),
                        this.renderCheckbox('folderTitle', (0, i18n_1.t)('Show the folder title above the list')))),
                mailspring_exports_1.React.createElement("div", { style: { width: 30 } }),
                mailspring_exports_1.React.createElement("div", { style: { flex: 1 } },
                    mailspring_exports_1.React.createElement("section", null,
                        mailspring_exports_1.React.createElement("h6", null, (0, i18n_1.t)('Appearance')),
                        this.renderCheckbox('darkChrome', (0, i18n_1.t)('Dark toolbar and sidebar')),
                        this.renderCheckbox('lightContent', (0, i18n_1.t)('Modern UI colors for the list and the reader')),
                        this.renderAccentPicker()),
                    mailspring_exports_1.React.createElement("section", null,
                        mailspring_exports_1.React.createElement("h6", null, (0, i18n_1.t)('Notifications')),
                        this.renderSelect('notificationAction', (0, i18n_1.t)('Second button of new mail notifications'), [
                            { value: 'trash', label: (0, i18n_1.t)('Delete (move to Trash)') },
                            { value: 'archive', label: (0, i18n_1.t)('Archive (Mailspring default)') },
                        ], notificationsUnavailable),
                        notificationsUnavailable ? (mailspring_exports_1.React.createElement("div", { className: "platform-note" }, (0, i18n_1.t)('This Mailspring version does not allow changing it; notifications keep the Archive button.'))) : null),
                    mailspring_exports_1.React.createElement("section", null,
                        mailspring_exports_1.React.createElement("button", { type: "button", className: "btn", onClick: settings_1.resetSettings }, (0, i18n_1.t)('Restore defaults')))))));
    }
}
SettingsTab.displayName = 'ModernUISettingsTab';
exports.default = SettingsTab;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3NUYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9TZXR0aW5nc1RhYi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFBQSwyREFBMkM7QUFDM0MsMENBUXFCO0FBQ3JCLGlEQUFxRDtBQUNyRCx1RkFBa0Y7QUFDbEYsa0NBQTRCO0FBSTVCLFNBQVMsT0FBTztJQUNkLE1BQU0sTUFBTSxHQUFHLEVBQVksQ0FBQztJQUM1QixLQUFLLE1BQU0sR0FBRyxJQUFJLHVCQUFZLEVBQUUsQ0FBQztRQUMvQixNQUFNLENBQUMsR0FBRyxDQUFDLEdBQUcsSUFBQSxxQkFBVSxFQUFDLEdBQUcsQ0FBQyxDQUFDO0lBQ2hDLENBQUM7SUFDRCxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsTUFBTSxPQUFPLEdBQUcsQ0FBQyxHQUFXLEVBQUUsRUFBRSxDQUFDLHFCQUFxQixHQUFHLEVBQUUsQ0FBQztBQUU1RCx5RUFBeUU7QUFDekUsZ0ZBQWdGO0FBQ2hGLDRFQUE0RTtBQUM1RSw2RUFBNkU7QUFDN0UsdURBQXVEO0FBQ3ZELE1BQXFCLFdBQVksU0FBUSwwQkFBSyxDQUFDLFNBQTBDO0lBS3ZGLFlBQVksS0FBOEI7UUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBSFAsa0JBQWEsR0FBK0IsRUFBRSxDQUFDO1FBSXJELElBQUksQ0FBQyxLQUFLLEdBQUcsT0FBTyxFQUFFLENBQUM7SUFDekIsQ0FBQztJQUVELGlCQUFpQjtRQUNmLG1FQUFtRTtRQUNuRSxJQUFJLENBQUMsYUFBYSxHQUFHLHVCQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsR0FBRyxFQUFFLEVBQUUsQ0FDNUMsSUFBQSx5QkFBYyxFQUFDLEdBQUcsRUFBRSxDQUFDLEtBQUssRUFBRSxFQUFFLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxFQUFFLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFTLENBQUMsQ0FBQyxDQUN2RSxDQUFDO0lBQ0osQ0FBQztJQUVELG9CQUFvQjtRQUNsQixJQUFJLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLE9BQU8sRUFBRSxDQUFDLENBQUM7UUFDL0MsSUFBSSxDQUFDLGFBQWEsR0FBRyxFQUFFLENBQUM7SUFDMUIsQ0FBQztJQUVPLGNBQWMsQ0FBQyxHQUFlLEVBQUUsS0FBYSxFQUFFLFFBQVEsR0FBRyxLQUFLO1FBQ3JFLE9BQU8sQ0FDTCxrREFBSyxTQUFTLEVBQUUsT0FBTyxRQUFRLENBQUMsQ0FBQyxDQUFDLDZCQUE2QixDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUU7WUFDcEUsb0RBQ0UsRUFBRSxFQUFFLE9BQU8sQ0FBQyxHQUFHLENBQUMsRUFDaEIsSUFBSSxFQUFDLFVBQVUsRUFDZixPQUFPLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLEVBQzFCLFFBQVEsRUFBRSxRQUFRLEVBQ2xCLFFBQVEsRUFBRSxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsSUFBQSxxQkFBVSxFQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxHQUNsRDtZQUNGLG9EQUFPLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUcsS0FBSyxDQUFTLENBQ3pDLENBQ1AsQ0FBQztJQUNKLENBQUM7SUFFTyxZQUFZLENBQ2xCLEdBQWUsRUFDZixLQUFhLEVBQ2IsT0FBeUQsRUFDekQsUUFBUSxHQUFHLEtBQUs7UUFFaEIsTUFBTSxPQUFPLEdBQUcsT0FBTyxPQUFPLENBQUMsQ0FBQyxDQUFDLENBQUMsS0FBSyxLQUFLLFFBQVEsQ0FBQztRQUNyRCxPQUFPLENBQ0wsa0RBQUssU0FBUyxFQUFFLE9BQU8sUUFBUSxDQUFDLENBQUMsQ0FBQyw2QkFBNkIsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFO1lBQ3BFLG9EQUFPLE9BQU8sRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsWUFBWSxFQUFFLENBQUMsRUFBRTtnQkFDckQsS0FBSztvQkFDQTtZQUNSLHFEQUNFLEVBQUUsRUFBRSxPQUFPLENBQUMsR0FBRyxDQUFDLEVBQ2hCLEtBQUssRUFBRSxJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxFQUN0QixRQUFRLEVBQUUsUUFBUSxFQUNsQixRQUFRLEVBQUUsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUEscUJBQVUsRUFBQyxHQUFHLEVBQUUsT0FBTyxDQUFDLENBQUMsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLENBQUMsSUFFbEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FDbEIscURBQVEsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLEVBQUUsS0FBSyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQ2pDLENBQUMsQ0FBQyxLQUFLLENBQ0QsQ0FDVixDQUFDLENBQ0ssQ0FDTCxDQUNQLENBQUM7SUFDSixDQUFDO0lBRU8sa0JBQWtCO1FBQ3hCLE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxDQUFDO1FBQ2xDLE9BQU8sQ0FDTCxrREFBSyxTQUFTLEVBQUMsTUFBTTtZQUNuQixrREFBSyxTQUFTLEVBQUMseUJBQXlCO2dCQUFFLElBQUEsUUFBQyxFQUFDLGNBQWMsQ0FBQztvQkFBUTtZQUNuRSxrREFBSyxTQUFTLEVBQUMsMkJBQTJCLEVBQUMsSUFBSSxFQUFDLFlBQVksZ0JBQWEsSUFBQSxRQUFDLEVBQUMsY0FBYyxDQUFDLElBQ3ZGLHdCQUFjLENBQUMsR0FBRyxDQUFDLENBQUMsTUFBTSxFQUFFLEVBQUUsQ0FBQyxDQUM5QixxREFDRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEVBQUUsRUFDZCxJQUFJLEVBQUMsUUFBUSxFQUNiLElBQUksRUFBQyxPQUFPLGtCQUNFLE9BQU8sS0FBSyxNQUFNLENBQUMsRUFBRSxnQkFDdkIsSUFBQSxRQUFDLEVBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUN4QixLQUFLLEVBQUUsSUFBQSxRQUFDLEVBQUMsTUFBTSxDQUFDLEVBQUUsQ0FBQyxFQUNuQixTQUFTLEVBQUUsMEJBQTBCLE9BQU8sS0FBSyxNQUFNLENBQUMsRUFBRSxDQUFDLENBQUMsQ0FBQyxjQUFjLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxFQUNsRixLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUUsTUFBTSxDQUFDLEtBQUssRUFBRSxFQUN4QyxPQUFPLEVBQUUsR0FBRyxFQUFFLENBQUMsSUFBQSxxQkFBVSxFQUFDLFFBQVEsRUFBRSxNQUFNLENBQUMsRUFBRSxDQUFDLEdBQzlDLENBQ0gsQ0FBQyxDQUNFLENBQ0YsQ0FDUCxDQUFDO0lBQ0osQ0FBQztJQUVELE1BQU07UUFDSixNQUFNLE9BQU8sR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsV0FBVyxDQUFDO1FBQ3hDLE1BQU0sVUFBVSxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxhQUFhLENBQUM7UUFDN0MsTUFBTSx3QkFBd0IsR0FBRyxJQUFBLHFEQUF3QixHQUFFLEtBQUssYUFBYSxDQUFDO1FBRTlFLE9BQU8sQ0FDTCxrREFBSyxTQUFTLEVBQUMscUJBQXFCO1lBQ2xDLGdEQUFHLFNBQVMsRUFBQywwQkFBMEI7Z0JBQ3BDLElBQUEsUUFBQyxFQUFDLDRFQUE0RSxDQUFDO2dCQUFFLEdBQUc7Z0JBQ3BGLElBQUEsUUFBQyxFQUFDLG1FQUFtRSxDQUFDLENBQ3JFO1lBQ0osa0RBQUssU0FBUyxFQUFDLHFCQUFxQjtnQkFDbEMsa0RBQUssS0FBSyxFQUFFLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTtvQkFDckI7d0JBQ0UscURBQUssSUFBQSxRQUFDLEVBQUMsY0FBYyxDQUFDLENBQU07d0JBQzNCLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUEsUUFBQyxFQUFDLHVCQUF1QixDQUFDLENBQUM7d0JBQzlELElBQUksQ0FBQyxjQUFjLENBQUMscUJBQXFCLEVBQUUsSUFBQSxRQUFDLEVBQUMsK0JBQStCLENBQUMsRUFBRSxPQUFPLENBQUM7d0JBQ3ZGLElBQUksQ0FBQyxjQUFjLENBQUMsa0JBQWtCLEVBQUUsSUFBQSxRQUFDLEVBQUMsb0JBQW9CLENBQUMsRUFBRSxPQUFPLENBQUM7d0JBQ3pFLElBQUksQ0FBQyxZQUFZLENBQ2hCLGtCQUFrQixFQUNsQixJQUFBLFFBQUMsRUFBQyxlQUFlLENBQUMsRUFDbEI7NEJBQ0UsRUFBRSxLQUFLLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxJQUFBLFFBQUMsRUFBQywrREFBK0QsQ0FBQyxFQUFFOzRCQUM1RixFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUEsUUFBQyxFQUFDLGVBQWUsQ0FBQyxFQUFFOzRCQUNoRCxFQUFFLEtBQUssRUFBRSxVQUFVLEVBQUUsS0FBSyxFQUFFLElBQUEsUUFBQyxFQUFDLFVBQVUsQ0FBQyxFQUFFO3lCQUM1QyxFQUNELE9BQU8sQ0FDUixDQUNPO29CQUNWO3dCQUNFLHFEQUFLLElBQUEsUUFBQyxFQUFDLGNBQWMsQ0FBQyxDQUFNO3dCQUMzQixJQUFJLENBQUMsY0FBYyxDQUFDLGVBQWUsRUFBRSxJQUFBLFFBQUMsRUFBQyxzQkFBc0IsQ0FBQyxDQUFDO3dCQUMvRCxJQUFJLENBQUMsWUFBWSxDQUNoQixZQUFZLEVBQ1osSUFBQSxRQUFDLEVBQUMsYUFBYSxDQUFDLEVBQ2hCLHVCQUFZLENBQUMsR0FBRyxDQUFDLENBQUMsRUFBRSxFQUFFLEVBQUUsQ0FBQyxDQUFDLEVBQUUsS0FBSyxFQUFFLEVBQUUsRUFBRSxLQUFLLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxDQUFDLENBQUMsRUFDNUQsVUFBVSxDQUNYO3dCQUNBLElBQUksQ0FBQyxjQUFjLENBQUMsYUFBYSxFQUFFLElBQUEsUUFBQyxFQUFDLHNDQUFzQyxDQUFDLENBQUMsQ0FDdEUsQ0FDTjtnQkFDTixrREFBSyxLQUFLLEVBQUUsRUFBRSxLQUFLLEVBQUUsRUFBRSxFQUFFLEdBQUk7Z0JBQzdCLGtEQUFLLEtBQUssRUFBRSxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7b0JBQ3JCO3dCQUNFLHFEQUFLLElBQUEsUUFBQyxFQUFDLFlBQVksQ0FBQyxDQUFNO3dCQUN6QixJQUFJLENBQUMsY0FBYyxDQUFDLFlBQVksRUFBRSxJQUFBLFFBQUMsRUFBQywwQkFBMEIsQ0FBQyxDQUFDO3dCQUNoRSxJQUFJLENBQUMsY0FBYyxDQUFDLGNBQWMsRUFBRSxJQUFBLFFBQUMsRUFBQyw4Q0FBOEMsQ0FBQyxDQUFDO3dCQUN0RixJQUFJLENBQUMsa0JBQWtCLEVBQUUsQ0FDbEI7b0JBQ1Y7d0JBQ0UscURBQUssSUFBQSxRQUFDLEVBQUMsZUFBZSxDQUFDLENBQU07d0JBQzVCLElBQUksQ0FBQyxZQUFZLENBQ2hCLG9CQUFvQixFQUNwQixJQUFBLFFBQUMsRUFBQyx5Q0FBeUMsQ0FBQyxFQUM1Qzs0QkFDRSxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsS0FBSyxFQUFFLElBQUEsUUFBQyxFQUFDLHdCQUF3QixDQUFDLEVBQUU7NEJBQ3RELEVBQUUsS0FBSyxFQUFFLFNBQVMsRUFBRSxLQUFLLEVBQUUsSUFBQSxRQUFDLEVBQUMsOEJBQThCLENBQUMsRUFBRTt5QkFDL0QsRUFDRCx3QkFBd0IsQ0FDekI7d0JBQ0Esd0JBQXdCLENBQUMsQ0FBQyxDQUFDLENBQzFCLGtEQUFLLFNBQVMsRUFBQyxlQUFlLElBQzNCLElBQUEsUUFBQyxFQUNBLDRGQUE0RixDQUM3RixDQUNHLENBQ1AsQ0FBQyxDQUFDLENBQUMsSUFBSSxDQUNBO29CQUNWO3dCQUNFLHFEQUFRLElBQUksRUFBQyxRQUFRLEVBQUMsU0FBUyxFQUFDLEtBQUssRUFBQyxPQUFPLEVBQUUsd0JBQWEsSUFDekQsSUFBQSxRQUFDLEVBQUMsa0JBQWtCLENBQUMsQ0FDZixDQUNELENBQ04sQ0FDRixDQUNGLENBQ1AsQ0FBQztJQUNKLENBQUM7O0FBcktNLHVCQUFXLEdBQUcscUJBQXFCLEFBQXhCLENBQXlCO2tCQUR4QixXQUFXIn0=
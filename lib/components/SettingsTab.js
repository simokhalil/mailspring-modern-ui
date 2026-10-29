"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const settings_1 = require("../settings");
const accents_1 = require("../services/accents");
const notification_delete_action_1 = require("../services/notification-delete-action");
const i18n_1 = require("../i18n");
const AccountIconsEditor_1 = __importDefault(require("./AccountIconsEditor"));
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
                        this.renderCheckbox('railUnreadBadges', (0, i18n_1.t)('Show unread badges'), railOff)),
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
                        mailspring_exports_1.React.createElement("button", { type: "button", className: "btn", onClick: settings_1.resetSettings }, (0, i18n_1.t)('Restore defaults'))))),
            mailspring_exports_1.React.createElement("section", { className: "modern-ui-account-icons-section" },
                mailspring_exports_1.React.createElement("h6", null, (0, i18n_1.t)('Account icons')),
                mailspring_exports_1.React.createElement(AccountIconsEditor_1.default, null))));
    }
}
SettingsTab.displayName = 'ModernUISettingsTab';
exports.default = SettingsTab;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiU2V0dGluZ3NUYWIuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9TZXR0aW5nc1RhYi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBMkM7QUFDM0MsMENBUXFCO0FBQ3JCLGlEQUFxRDtBQUNyRCx1RkFBa0Y7QUFDbEYsa0NBQTRCO0FBQzVCLDhFQUFzRDtBQUl0RCxTQUFTLE9BQU87SUFDZCxNQUFNLE1BQU0sR0FBRyxFQUFZLENBQUM7SUFDNUIsS0FBSyxNQUFNLEdBQUcsSUFBSSx1QkFBWSxFQUFFLENBQUM7UUFDL0IsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLElBQUEscUJBQVUsRUFBQyxHQUFHLENBQUMsQ0FBQztJQUNoQyxDQUFDO0lBQ0QsT0FBTyxNQUFNLENBQUM7QUFDaEIsQ0FBQztBQUVELE1BQU0sT0FBTyxHQUFHLENBQUMsR0FBVyxFQUFFLEVBQUUsQ0FBQyxxQkFBcUIsR0FBRyxFQUFFLENBQUM7QUFFNUQseUVBQXlFO0FBQ3pFLGdGQUFnRjtBQUNoRiw0RUFBNEU7QUFDNUUsNkVBQTZFO0FBQzdFLHVEQUF1RDtBQUN2RCxNQUFxQixXQUFZLFNBQVEsMEJBQUssQ0FBQyxTQUEwQztJQUt2RixZQUFZLEtBQThCO1FBQ3hDLEtBQUssQ0FBQyxLQUFLLENBQUMsQ0FBQztRQUhQLGtCQUFhLEdBQStCLEVBQUUsQ0FBQztRQUlyRCxJQUFJLENBQUMsS0FBSyxHQUFHLE9BQU8sRUFBRSxDQUFDO0lBQ3pCLENBQUM7SUFFRCxpQkFBaUI7UUFDZixtRUFBbUU7UUFDbkUsSUFBSSxDQUFDLGFBQWEsR0FBRyx1QkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLEdBQUcsRUFBRSxFQUFFLENBQzVDLElBQUEseUJBQWMsRUFBQyxHQUFHLEVBQUUsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsRUFBRSxDQUFDLEdBQUcsQ0FBQyxFQUFFLEtBQUssRUFB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
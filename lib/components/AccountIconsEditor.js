"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const AccountAvatar_1 = __importDefault(require("./AccountAvatar"));
const IconGlyph_1 = require("./IconGlyph");
const account_icons_1 = require("../services/account-icons");
const settings_1 = require("../settings");
const i18n_1 = require("../i18n");
// Preferences › Modern UI › Account icons. Picks an icon (bundled Lucide and
// Simple Icons sets) and a background color per account. Every click writes
// the `accountIcons` setting, which the rail observes, so the rail updates
// while the user is still choosing.
class AccountIconsEditor extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this.unlisten = null;
        this.subscription = null;
        const accounts = mailspring_exports_1.AccountStore.accounts();
        this.state = {
            accounts,
            icons: (0, account_icons_1.normalizeAccountIcons)((0, settings_1.getSetting)('accountIcons')),
            selectedId: accounts.length ? accounts[0].id : null,
            query: '',
        };
    }
    componentDidMount() {
        // Accounts added or removed while the tab is open.
        this.unlisten = mailspring_exports_1.AccountStore.listen(() => {
            const accounts = mailspring_exports_1.AccountStore.accounts();
            this.setState((state) => ({
                accounts,
                selectedId: accounts.some((a) => a.id === state.selectedId)
                    ? state.selectedId
                    : accounts.length
                        ? accounts[0].id
                        : null,
            }));
        });
        this.subscription = (0, settings_1.observeSetting)('accountIcons', (value) => this.setState({ icons: (0, account_icons_1.normalizeAccountIcons)(value) }));
    }
    componentWillUnmount() {
        if (this.unlisten)
            this.unlisten();
        if (this.subscription)
            this.subscription.dispose();
    }
    selected() {
        return this.state.accounts.find((a) => a.id === this.state.selectedId) || null;
    }
    save(choice) {
        const account = this.selected();
        if (!account)
            return;
        const next = (0, account_icons_1.withAccountChoice)(this.state.icons, account.id, choice, this.state.accounts.map((a) => a.id));
        this.setState({ icons: next });
        (0, settings_1.setSetting)('accountIcons', next);
    }
    chooseIcon(source, icon) {
        const current = this.state.icons[this.state.selectedId] || {};
        this.save({ ...current, source, icon });
    }
    chooseColor(color) {
        const current = { ...(this.state.icons[this.state.selectedId] || {}) };
        if (color) {
            current.backgroundColor = color;
        }
        else {
            delete current.backgroundColor;
        }
        this.save(current);
    }
    renderAccounts() {
        const { accounts, icons, selectedId } = this.state;
        return (mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__accounts", role: "listbox", "aria-label": (0, i18n_1.t)('Accounts') }, accounts.map((account) => (mailspring_exports_1.React.createElement("button", { key: account.id, type: "button", role: "option", "aria-selected": account.id === selectedId, className: `modern-ui-icon-editor__account${account.id === selectedId ? ' is-selected' : ''}`, onClick: () => this.setState({ selectedId: account.id }) },
            mailspring_exports_1.React.createElement(AccountAvatar_1.default, { className: "modern-ui-icon-editor__account-avatar", appearance: (0, account_icons_1.resolveAccountAppearance)(account, icons[account.id]) }),
            mailspring_exports_1.React.createElement("span", { className: "modern-ui-icon-editor__account-text" },
                mailspring_exports_1.React.createElement("span", { className: "modern-ui-icon-editor__account-label" }, account.label || account.emailAddress),
                account.label !== account.emailAddress ? (mailspring_exports_1.React.createElement("span", { className: "modern-ui-icon-editor__account-email" }, account.emailAddress)) : null))))));
    }
    renderColors(choice) {
        const current = choice.backgroundColor || null;
        return (mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__colors", role: "radiogroup", "aria-label": (0, i18n_1.t)('Background color') },
            mailspring_exports_1.React.createElement("button", { type: "button", role: "radio", "aria-checked": !current, title: (0, i18n_1.t)('Automatic'), className: `modern-ui-color-swatch modern-ui-color-swatch--auto${!current ? ' is-selected' : ''}`, onClick: () => this.chooseColor(null) }, "A"),
            account_icons_1.BACKGROUND_PRESETS.map((color) => (mailspring_exports_1.React.createElement("button", { key: color, type: "button", role: "radio", "aria-checked": current === color, title: color, className: `modern-ui-color-swatch${current === color ? ' is-selected' : ''}`, style: { backgroundColor: color }, onClick: () => this.chooseColor(color) })))));
    }
    renderGrids(choice) {
        const { lucide, simple } = (0, account_icons_1.searchIcons)(this.state.query);
        const tile = (source, id, label, glyph) => {
            const selected = choice.source === source && choice.icon === id;
            return (mailspring_exports_1.React.createElement("button", { key: `${source}:${id}`, type: "button", title: label, "aria-label": label, "aria-pressed": selected, className: `modern-ui-icon-tile${selected ? ' is-selected' : ''}`, onClick: () => this.chooseIcon(source, id) }, glyph));
        };
        if (lucide.length === 0 && simple.length === 0) {
            return mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__empty" }, (0, i18n_1.t)('No icon matches this search.'));
        }
        return (mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__grids" },
            lucide.length ? (mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__group" },
                mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__group-title" },
                    (0, i18n_1.t)('Icons'),
                    " \u00B7 Lucide"),
                mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-grid" }, lucide.map((icon) => tile('lucide', icon.id, icon.label, mailspring_exports_1.React.createElement(IconGlyph_1.LucideGlyph, { icon: icon, className: "modern-ui-icon-tile__glyph" })))))) : null,
            simple.length ? (mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__group" },
                mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__group-title" },
                    (0, i18n_1.t)('Brands'),
                    " \u00B7 Simple Icons"),
                mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-grid" }, simple.map((icon) => tile('simple-icons', icon.id, icon.label, mailspring_exports_1.React.createElement(IconGlyph_1.SimpleGlyph, { icon: icon, className: "modern-ui-icon-tile__glyph" })))))) : null));
    }
    render() {
        const account = this.selected();
        if (!account) {
            return null;
        }
        const choice = this.state.icons[account.id] || {};
        const customized = !!(choice.icon || choice.backgroundColor);
        return (mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor" },
            this.renderAccounts(),
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__panel" },
                mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__preview" },
                    mailspring_exports_1.React.createElement("span", { className: "modern-ui-icon-editor__preview-rail" },
                        mailspring_exports_1.React.createElement(AccountAvatar_1.default, { className: "modern-ui-icon-editor__preview-avatar", appearance: (0, account_icons_1.resolveAccountAppearance)(account, choice) })),
                    mailspring_exports_1.React.createElement("span", { className: "modern-ui-icon-editor__preview-text" },
                        mailspring_exports_1.React.createElement("span", { className: "modern-ui-icon-editor__account-label" }, account.label || account.emailAddress),
                        mailspring_exports_1.React.createElement("span", { className: "modern-ui-icon-editor__account-email" }, customized ? (0, i18n_1.t)('Custom icon') : (0, i18n_1.t)('Automatic icon (provider logo, else initials)'))),
                    mailspring_exports_1.React.createElement("button", { type: "button", className: "btn modern-ui-icon-editor__reset", disabled: !customized, onClick: () => this.save(null) }, (0, i18n_1.t)('Reset'))),
                mailspring_exports_1.React.createElement("div", { className: "modern-ui-icon-editor__label" }, (0, i18n_1.t)('Background color')),
                this.renderColors(choice),
                mailspring_exports_1.React.createElement("input", { type: "search", className: "modern-ui-icon-editor__search", placeholder: (0, i18n_1.t)('Search icons…'), "aria-label": (0, i18n_1.t)('Search icons…'), value: this.state.query, onChange: (e) => this.setState({ query: e.target.value }) }),
                this.renderGrids(choice),
                mailspring_exports_1.React.createElement("p", { className: "modern-ui-icon-editor__credits" }, (0, i18n_1.t)('Icons: Lucide (ISC license) and Simple Icons (CC0). Logos are trademarks of their owners.')))));
    }
}
AccountIconsEditor.displayName = 'ModernUIAccountIconsEditor';
exports.default = AccountIconsEditor;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjb3VudEljb25zRWRpdG9yLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvQWNjb3VudEljb25zRWRpdG9yLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7OztBQUFBLDJEQUFrRTtBQUNsRSxvRUFBNEM7QUFDNUMsMkNBQXVEO0FBQ3ZELDZEQVNtQztBQUNuQywwQ0FBcUU7QUFDckUsa0NBQTRCO0FBUzVCLDZFQUE2RTtBQUM3RSw0RUFBNEU7QUFDNUUsMkVBQTJFO0FBQzNFLG9DQUFvQztBQUNwQyxNQUFxQixrQkFBbUIsU0FBUSwwQkFBSyxDQUFDLFNBQStDO0lBTW5HLFlBQVksS0FBOEI7UUFDeEMsS0FBSyxDQUFDLEtBQUssQ0FBQyxDQUFDO1FBSlAsYUFBUSxHQUF3QixJQUFJLENBQUM7UUFDckMsaUJBQVksR0FBK0IsSUFBSSxDQUFDO1FBSXRELE1BQU0sUUFBUSxHQUFHLGlDQUFZLENBQUMsUUFBUSxFQUFFLENBQUM7UUFDekMsSUFBSSxDQUFDLEtBQUssR0FBRztZQUNYLFFBQVE7WUFDUixLQUFLLEVBQUUsSUFBQSxxQ0FBcUIsRUFBQyxJQUFBLHFCQUFVLEVBQUMsY0FBYyxDQUFDLENBQUM7WUFDeEQsVUFBVSxFQUFFLFFBQVEsQ0FBQyxNQUFNLENBQUMsQ0FBQyxDQUFDLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FBQyxFQUFFLENBQUMsQ0FBQyxDQUFDLElBQUk7WUFDbkQsS0FBSyxFQUFFLEVBQUU7U0FDVixDQUFDO0lBQ0osQ0FBQztJQUVELGlCQUFpQjtRQUNmLG1EQUFtRDtRQUNuRCxJQUFJLENBQUMsUUFBUSxHQUFHLGlDQUFZLENBQUMsTUFBTSxDQUFDLEdBQUcsRUFBRTtZQUN2QyxNQUFNLFFBQVEsR0FBRyxpQ0FBWSxDQUFDLFFBQVEsRUFBRSxDQUFDO1lBQ3pDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQyxLQUFLLEVBQUUsRUFBRSxDQUFDLENBQUM7Z0JBQ3hCLFFBQVE7Z0JB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
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAIL_WIDTH = void 0;
const mailspring_exports_1 = require("mailspring-exports");
const AccountIcon_1 = __importDefault(require("./AccountIcon"));
const account_navigation_1 = require("../services/account-navigation");
const settings_1 = require("../settings");
const i18n_1 = require("../i18n");
// Keep in sync with @modern-ui-rail-width in styles/variables.less.
exports.RAIL_WIDTH = 64;
// Settings the rail reads; it re-renders when any of them changes.
const RAIL_SETTINGS = ['accountIconStyle', 'railShowAllAccounts', 'railUnreadBadges'];
function unreadInboxCount(account) {
    const inbox = mailspring_exports_1.CategoryStore.getInboxCategory(account);
    if (!inbox) {
        return 0;
    }
    return mailspring_exports_1.ThreadCountsStore.unreadCountForCategoryId(inbox.id) || 0;
}
function sameUnread(a, b) {
    const keys = Object.keys(a);
    return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}
function iconStyleSetting() {
    const value = (0, settings_1.getSetting)('accountIconStyle');
    return value === 'provider' || value === 'initials' ? value : 'auto';
}
// The vertical account selector. It is injected into the RootSidebar column
// (the column that hosts Mailspring's folder sidebar) and drawn along its left
// edge by styles/account-rail.less, so the toolbar above it, the window
// controls and the column resizing stay native.
class AccountRail extends mailspring_exports_1.React.Component {
    constructor(props) {
        super(props);
        this.unlisteners = [];
        this.configSubscriptions = [];
        this.frame = null;
        // ThreadCountsStore triggers in bursts while mail syncs; coalesce to one
        // update per frame and only re-render when something visible changed.
        this.scheduleUpdate = () => {
            if (this.frame !== null) {
                return;
            }
            this.frame = requestAnimationFrame(() => {
                this.frame = null;
                const next = this.getStateFromStores();
                const prev = this.state;
                const changed = next.selection !== prev.selection ||
                    next.iconStyle !== prev.iconStyle ||
                    next.showAllAccounts !== prev.showAllAccounts ||
                    next.showBadges !== prev.showBadges ||
                    next.accounts.length !== prev.accounts.length ||
                    next.accounts.some((a, i) => a !== prev.accounts[i]) ||
                    !sameUnread(next.unread, prev.unread);
                if (changed) {
                    this.setState(next);
                }
            });
        };
        this.onSelect = (account) => {
            if (account) {
                (0, account_navigation_1.focusAccount)(account);
            }
            else {
                (0, account_navigation_1.focusAllAccounts)();
            }
        };
        this.onContextMenu = () => {
            const { Menu } = require('@electron/remote');
            Menu.buildFromTemplate([
                { label: `${(0, mailspring_exports_1.localized)('Add Account')}...`, click: account_navigation_1.addAccount },
                { label: `${(0, mailspring_exports_1.localized)('Manage Accounts')}...`, click: account_navigation_1.manageAccounts },
                { type: 'separator' },
                { label: `${(0, i18n_1.t)('Modern UI settings')}...`, click: account_navigation_1.openModernUISettings },
            ]).popup({});
        };
        this.state = this.getStateFromStores();
    }
    componentDidMount() {
        this.unlisteners = [
            mailspring_exports_1.AccountStore.listen(this.scheduleUpdate),
            mailspring_exports_1.FocusedPerspectiveStore.listen(this.scheduleUpdate),
            mailspring_exports_1.CategoryStore.listen(this.scheduleUpdate),
            mailspring_exports_1.ThreadCountsStore.listen(this.scheduleUpdate),
        ];
        this.configSubscriptions = RAIL_SETTINGS.map((key) => (0, settings_1.observeSetting)(key, this.scheduleUpdate));
    }
    componentWillUnmount() {
        this.unlisteners.forEach((unlisten) => unlisten());
        this.unlisteners = [];
        this.configSubscriptions.forEach((s) => s.dispose());
        this.configSubscriptions = [];
        if (this.frame !== null) {
            cancelAnimationFrame(this.frame);
            this.frame = null;
        }
    }
    getStateFromStores() {
        const accounts = mailspring_exports_1.AccountStore.accounts();
        const unread = {};
        let total = 0;
        for (const account of accounts) {
            const count = unreadInboxCount(account);
            unread[account.id] = count;
            total += count;
        }
        unread[account_navigation_1.ALL_ACCOUNTS] = total;
        return {
            accounts,
            selection: (0, account_navigation_1.currentSelection)(),
            unread,
            iconStyle: iconStyleSetting(),
            showAllAccounts: (0, settings_1.getSetting)('railShowAllAccounts') !== false,
            showBadges: (0, settings_1.getSetting)('railUnreadBadges') !== false,
        };
    }
    render() {
        const { accounts, selection, unread, iconStyle, showAllAccounts, showBadges } = this.state;
        if (accounts.length === 0) {
            return null;
        }
        const multiple = accounts.length > 1;
        const showAllEntry = multiple && showAllAccounts;
        const providerCounts = {};
        accounts.forEach((a) => {
            providerCounts[a.provider] = (providerCounts[a.provider] || 0) + 1;
        });
        return (mailspring_exports_1.React.createElement("nav", { className: "modern-ui-account-rail", "aria-label": (0, mailspring_exports_1.localized)('Accounts') },
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__list" },
                showAllEntry ? (mailspring_exports_1.React.createElement(AccountIcon_1.default, { account: null, label: (0, mailspring_exports_1.localized)('All Accounts'), selected: selection === account_navigation_1.ALL_ACCOUNTS, unread: showBadges ? unread[account_navigation_1.ALL_ACCOUNTS] || 0 : 0, providerShared: false, iconStyle: iconStyle, onSelect: this.onSelect, onContextMenu: this.onContextMenu })) : null,
                showAllEntry ? mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__separator", role: "separator" }) : null,
                accounts.map((account) => (mailspring_exports_1.React.createElement(AccountIcon_1.default, { key: account.id, account: account, label: account.label || account.emailAddress, description: account.label !== account.emailAddress ? account.emailAddress : null, selected: selection === account.id || (!multiple && selection === account_navigation_1.ALL_ACCOUNTS), unread: showBadges ? unread[account.id] || 0 : 0, providerShared: providerCounts[account.provider] > 1, iconStyle: iconStyle, onSelect: this.onSelect, onContextMenu: this.onContextMenu })))),
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__footer" },
                mailspring_exports_1.React.createElement("button", { type: "button", className: "modern-ui-account-rail__add", title: `${(0, mailspring_exports_1.localized)('Add Account')}...`, "aria-label": (0, mailspring_exports_1.localized)('Add Account'), onClick: account_navigation_1.addAccount, onContextMenu: (e) => {
                        e.preventDefault();
                        this.onContextMenu();
                    } },
                    mailspring_exports_1.React.createElement("svg", { viewBox: "0 0 16 16", "aria-hidden": "true" },
                        mailspring_exports_1.React.createElement("path", { d: "M8 3v10M3 8h10", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }))),
                mailspring_exports_1.React.createElement("button", { type: "button", className: "modern-ui-account-rail__settings", title: (0, i18n_1.t)('Modern UI settings'), "aria-label": (0, i18n_1.t)('Modern UI settings'), onClick: account_navigation_1.openModernUISettings },
                    mailspring_exports_1.React.createElement("svg", { viewBox: "0 0 20 20", "aria-hidden": "true" },
                        mailspring_exports_1.React.createElement("path", { d: "M8.6 2.5h2.8l.4 2.1 1.5.9 2-.8 1.4 2.4-1.6 1.4v1.8l1.6 1.4-1.4 2.4-2-.8-1.5.9-.4 2.1H8.6l-.4-2.1-1.5-.9-2 .8-1.4-2.4 1.6-1.4V8.5L3.3 7.1l1.4-2.4 2 .8 1.5-.9Z", fill: "none", stroke: "currentColor", strokeWidth: "1.4", strokeLinejoin: "round" }),
                        mailspring_exports_1.React.createElement("circle", { cx: "10", cy: "10", r: "2.4", fill: "none", stroke: "currentColor", strokeWidth: "1.4" }))))));
    }
}
AccountRail.displayName = 'ModernUIAccountRail';
AccountRail.containerRequired = false;
// The sheet sizes a column from the largest minWidth of its components.
// Mailspring's AccountSidebar asks for 165px (its CSS variable); the rail
// adds its own width so the folder list keeps that minimum. The maximum is
// raised the same way by services/sidebar-width.ts.
AccountRail.containerStyles = {
    minWidth: mailspring_exports_1.DOMUtils.getWorkspaceCssNumberProperty('account-sidebar-min-width', 165) + exports.RAIL_WIDTH,
};
exports.default = AccountRail;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjb3VudFJhaWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9BY2NvdW50UmFpbC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkRBUzRCO0FBQzVCLGdFQUE4RDtBQUM5RCx1RUFRd0M7QUFDeEMsMENBQXFFO0FBQ3JFLGtDQUE0QjtBQUU1QixvRUFBb0U7QUFDdkQsUUFBQSxVQUFVLEdBQUcsRUFBRSxDQUFDO0FBVzdCLG1FQUFtRTtBQUNuRSxNQUFNLGFBQWEsR0FBaUIsQ0FBQyxrQkFBa0IsRUFBRSxxQkFBcUIsRUFBRSxrQkFBa0IsQ0FBQyxDQUFDO0FBRXBHLFNBQVMsZ0JBQWdCLENBQUMsT0FBZ0I7SUFDeEMsTUFBTSxLQUFLLEdBQUcsa0NBQWEsQ0FBQyxnQkFBZ0IsQ0FBQyxPQUFPLENBQUMsQ0FBQztJQUN0RCxJQUFJLENBQUMsS0FBSyxFQUFFLENBQUM7UUFDWCxPQUFPLENBQUMsQ0FBQztJQUNYLENBQUM7SUFDRCxPQUFPLHNDQUFpQixDQUFDLHdCQUF3QixDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsSUFBSSxDQUFDLENBQUM7QUFDbkUsQ0FBQztBQUVELFNBQVMsVUFBVSxDQUFDLENBQTZCLEVBQUUsQ0FBNkI7SUFDOUUsTUFBTSxJQUFJLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUM1QixPQUFPLElBQUksQ0FBQyxNQUFNLEtBQUssTUFBTSxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxNQUFNLElBQUksSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQ25GLENBQUM7QUFFRCxTQUFTLGdCQUFnQjtJQUN2QixNQUFNLEtBQUssR0FBRyxJQUFBLHFCQUFVLEVBQUMsa0JBQWtCLENBQUMsQ0FB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
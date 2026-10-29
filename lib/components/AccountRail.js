"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.RAIL_WIDTH = void 0;
const mailspring_exports_1 = require("mailspring-exports");
const AccountIcon_1 = __importDefault(require("./AccountIcon"));
const account_icons_1 = require("../services/account-icons");
const account_navigation_1 = require("../services/account-navigation");
const settings_1 = require("../settings");
const i18n_1 = require("../i18n");
// Keep in sync with @modern-ui-rail-width in styles/variables.less.
exports.RAIL_WIDTH = 64;
// Settings the rail reads; it re-renders when any of them changes.
const RAIL_SETTINGS = ['accountIcons', 'railShowAllAccounts', 'railUnreadBadges'];
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
                    JSON.stringify(next.accountIcons) !== JSON.stringify(prev.accountIcons) ||
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
            accountIcons: (0, account_icons_1.normalizeAccountIcons)((0, settings_1.getSetting)('accountIcons')),
            showAllAccounts: (0, settings_1.getSetting)('railShowAllAccounts') !== false,
            showBadges: (0, settings_1.getSetting)('railUnreadBadges') !== false,
        };
    }
    render() {
        const { accounts, selection, unread, accountIcons, showAllAccounts, showBadges } = this.state;
        if (accounts.length === 0) {
            return null;
        }
        const multiple = accounts.length > 1;
        const showAllEntry = multiple && showAllAccounts;
        return (mailspring_exports_1.React.createElement("nav", { className: "modern-ui-account-rail", "aria-label": (0, mailspring_exports_1.localized)('Accounts') },
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__list" },
                showAllEntry ? (mailspring_exports_1.React.createElement(AccountIcon_1.default, { account: null, label: (0, mailspring_exports_1.localized)('All Accounts'), selected: selection === account_navigation_1.ALL_ACCOUNTS, unread: showBadges ? unread[account_navigation_1.ALL_ACCOUNTS] || 0 : 0, onSelect: this.onSelect, onContextMenu: this.onContextMenu })) : null,
                showAllEntry ? mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__separator", role: "separator" }) : null,
                accounts.map((account) => (mailspring_exports_1.React.createElement(AccountIcon_1.default, { key: account.id, account: account, label: account.label || account.emailAddress, description: account.label !== account.emailAddress ? account.emailAddress : null, selected: selection === account.id || (!multiple && selection === account_navigation_1.ALL_ACCOUNTS), unread: showBadges ? unread[account.id] || 0 : 0, choice: accountIcons[account.id], onSelect: this.onSelect, onContextMenu: this.onContextMenu })))),
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjb3VudFJhaWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9BY2NvdW50UmFpbC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkRBUzRCO0FBQzVCLGdFQUF3QztBQUN4Qyw2REFBa0Y7QUFDbEYsdUVBUXdDO0FBQ3hDLDBDQUFxRTtBQUNyRSxrQ0FBNEI7QUFFNUIsb0VBQW9FO0FBQ3ZELFFBQUEsVUFBVSxHQUFHLEVBQUUsQ0FBQztBQVc3QixtRUFBbUU7QUFDbkUsTUFBTSxhQUFhLEdBQWlCLENBQUMsY0FBYyxFQUFFLHFCQUFxQixFQUFFLGtCQUFrQixDQUFDLENBQUM7QUFFaEcsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFnQjtJQUN4QyxNQUFNLEtBQUssR0FBRyxrQ0FBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNELE9BQU8sc0NBQWlCLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsQ0FBNkIsRUFBRSxDQUE2QjtJQUM5RSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkYsQ0FBQztBQUVELDRFQUE0RTtBQUM1RSwrRUFBK0U7QUFDL0Usd0VBQXdFO0FBQ3hFLGdEQUFnRDtBQUNoRCxN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
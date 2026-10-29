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
// Keep in sync with @modern-ui-rail-width in styles/variables.less.
exports.RAIL_WIDTH = 64;
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
        this.configSubscription = null;
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
        this.configSubscription = AppEnv.config.onDidChange('mailspring-modern-ui.accountIconStyle', this.scheduleUpdate);
    }
    componentWillUnmount() {
        this.unlisteners.forEach((unlisten) => unlisten());
        this.unlisteners = [];
        if (this.configSubscription) {
            this.configSubscription.dispose();
            this.configSubscription = null;
        }
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
        };
    }
    render() {
        const { accounts, selection, unread, iconStyle } = this.state;
        if (accounts.length === 0) {
            return null;
        }
        const multiple = accounts.length > 1;
        const providerCounts = {};
        accounts.forEach((a) => {
            providerCounts[a.provider] = (providerCounts[a.provider] || 0) + 1;
        });
        return (mailspring_exports_1.React.createElement("nav", { className: "modern-ui-account-rail", "aria-label": (0, mailspring_exports_1.localized)('Accounts') },
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__list" },
                multiple ? (mailspring_exports_1.React.createElement(AccountIcon_1.default, { account: null, label: (0, mailspring_exports_1.localized)('All Accounts'), selected: selection === account_navigation_1.ALL_ACCOUNTS, unread: unread[account_navigation_1.ALL_ACCOUNTS] || 0, providerShared: false, iconStyle: iconStyle, onSelect: this.onSelect, onContextMenu: this.onContextMenu })) : null,
                multiple ? mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__separator", role: "separator" }) : null,
                accounts.map((account) => (mailspring_exports_1.React.createElement(AccountIcon_1.default, { key: account.id, account: account, label: account.label || account.emailAddress, description: account.label !== account.emailAddress ? account.emailAddress : null, selected: selection === account.id || (!multiple && selection === account_navigation_1.ALL_ACCOUNTS), unread: unread[account.id] || 0, providerShared: providerCounts[account.provider] > 1, iconStyle: iconStyle, onSelect: this.onSelect, onContextMenu: this.onContextMenu })))),
            mailspring_exports_1.React.createElement("div", { className: "modern-ui-account-rail__footer" },
                mailspring_exports_1.React.createElement("button", { type: "button", className: "modern-ui-account-rail__add", title: `${(0, mailspring_exports_1.localized)('Add Account')}...`, "aria-label": (0, mailspring_exports_1.localized)('Add Account'), onClick: account_navigation_1.addAccount, onContextMenu: (e) => {
                        e.preventDefault();
                        this.onContextMenu();
                    } },
                    mailspring_exports_1.React.createElement("svg", { viewBox: "0 0 16 16", "aria-hidden": "true" },
                        mailspring_exports_1.React.createElement("path", { d: "M8 3v10M3 8h10", stroke: "currentColor", strokeWidth: "1.6", strokeLinecap: "round" }))))));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjb3VudFJhaWwuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9BY2NvdW50UmFpbC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7O0FBQUEsMkRBUzRCO0FBQzVCLGdFQUE4RDtBQUM5RCx1RUFPd0M7QUFDeEMsMENBQXlDO0FBRXpDLG9FQUFvRTtBQUN2RCxRQUFBLFVBQVUsR0FBRyxFQUFFLENBQUM7QUFTN0IsU0FBUyxnQkFBZ0IsQ0FBQyxPQUFnQjtJQUN4QyxNQUFNLEtBQUssR0FBRyxrQ0FBYSxDQUFDLGdCQUFnQixDQUFDLE9BQU8sQ0FBQyxDQUFDO0lBQ3RELElBQUksQ0FBQyxLQUFLLEVBQUUsQ0FBQztRQUNYLE9BQU8sQ0FBQyxDQUFDO0lBQ1gsQ0FBQztJQUNELE9BQU8sc0NBQWlCLENBQUMsd0JBQXdCLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxJQUFJLENBQUMsQ0FBQztBQUNuRSxDQUFDO0FBRUQsU0FBUyxVQUFVLENBQUMsQ0FBNkIsRUFBRSxDQUE2QjtJQUM5RSxNQUFNLElBQUksR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0lBQzVCLE9BQU8sSUFBSSxDQUFDLE1BQU0sS0FBSyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDLE1BQU0sSUFBSSxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7QUFDbkYsQ0FBQztBQUVELFNBQVMsZ0JBQWdCO0lBQ3ZCLE1BQU0sS0FBSyxHQUFHLElBQUEscUJBQVUsRUFBQyxrQkFBa0IsQ0FBQyxDQUFDO0lBQzdDLE9BQU8sS0FBSyxLQUFLLFVBQVUsSUFBSSxLQUFLLEtBQUssVUFBVSxDQUFDLENBQUMsQ0FBQyxLQUFLLENBQUMsQ0FBQyxDQUFDLE1BQU0sQ0FBQztB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
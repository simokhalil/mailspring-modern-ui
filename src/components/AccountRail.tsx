import {
  React,
  localized,
  Account,
  AccountStore,
  CategoryStore,
  DOMUtils,
  FocusedPerspectiveStore,
  ThreadCountsStore,
} from 'mailspring-exports';
import AccountIcon, { AccountIconStyle } from './AccountIcon';
import {
  ALL_ACCOUNTS,
  addAccount,
  currentSelection,
  focusAccount,
  focusAllAccounts,
  manageAccounts,
  openModernUISettings,
} from '../services/account-navigation';
import { getSetting, observeSetting, SettingKey } from '../settings';
import { t } from '../i18n';

// Keep in sync with @modern-ui-rail-width in styles/variables.less.
export const RAIL_WIDTH = 64;

interface AccountRailState {
  accounts: Account[];
  selection: string;
  unread: { [accountId: string]: number };
  iconStyle: AccountIconStyle;
  showAllAccounts: boolean;
  showBadges: boolean;
}

// Settings the rail reads; it re-renders when any of them changes.
const RAIL_SETTINGS: SettingKey[] = ['accountIconStyle', 'railShowAllAccounts', 'railUnreadBadges'];

function unreadInboxCount(account: Account): number {
  const inbox = CategoryStore.getInboxCategory(account);
  if (!inbox) {
    return 0;
  }
  return ThreadCountsStore.unreadCountForCategoryId(inbox.id) || 0;
}

function sameUnread(a: AccountRailState['unread'], b: AccountRailState['unread']) {
  const keys = Object.keys(a);
  return keys.length === Object.keys(b).length && keys.every((k) => a[k] === b[k]);
}

function iconStyleSetting(): AccountIconStyle {
  const value = getSetting('accountIconStyle');
  return value === 'provider' || value === 'initials' ? value : 'auto';
}

// The vertical account selector. It is injected into the RootSidebar column
// (the column that hosts Mailspring's folder sidebar) and drawn along its left
// edge by styles/account-rail.less, so the toolbar above it, the window
// controls and the column resizing stay native.
export default class AccountRail extends React.Component<Record<string, unknown>, AccountRailState> {
  static displayName = 'ModernUIAccountRail';
  static containerRequired = false;

  // The sheet sizes a column from the largest minWidth of its components.
  // Mailspring's AccountSidebar asks for 165px (its CSS variable); the rail
  // adds its own width so the folder list keeps that minimum. The maximum is
  // raised the same way by services/sidebar-width.ts.
  static containerStyles = {
    minWidth: DOMUtils.getWorkspaceCssNumberProperty('account-sidebar-min-width', 165) + RAIL_WIDTH,
  };

  private unlisteners: Array<() => void> = [];
  private configSubscriptions: Array<{ dispose(): void }> = [];
  private frame: number | null = null;

  constructor(props: Record<string, unknown>) {
    super(props);
    this.state = this.getStateFromStores();
  }

  componentDidMount() {
    this.unlisteners = [
      AccountStore.listen(this.scheduleUpdate),
      FocusedPerspectiveStore.listen(this.scheduleUpdate),
      CategoryStore.listen(this.scheduleUpdate),
      ThreadCountsStore.listen(this.scheduleUpdate),
    ];
    this.configSubscriptions = RAIL_SETTINGS.map((key) => observeSetting(key, this.scheduleUpdate));
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

  // ThreadCountsStore triggers in bursts while mail syncs; coalesce to one
  // update per frame and only re-render when something visible changed.
  private scheduleUpdate = () => {
    if (this.frame !== null) {
      return;
    }
    this.frame = requestAnimationFrame(() => {
      this.frame = null;
      const next = this.getStateFromStores();
      const prev = this.state;
      const changed =
        next.selection !== prev.selection ||
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

  private getStateFromStores(): AccountRailState {
    const accounts = AccountStore.accounts();
    const unread: AccountRailState['unread'] = {};
    let total = 0;
    for (const account of accounts) {
      const count = unreadInboxCount(account);
      unread[account.id] = count;
      total += count;
    }
    unread[ALL_ACCOUNTS] = total;
    return {
      accounts,
      selection: currentSelection(),
      unread,
      iconStyle: iconStyleSetting(),
      showAllAccounts: getSetting('railShowAllAccounts') !== false,
      showBadges: getSetting('railUnreadBadges') !== false,
    };
  }

  private onSelect = (account: Account | null) => {
    if (account) {
      focusAccount(account);
    } else {
      focusAllAccounts();
    }
  };

  private onContextMenu = () => {
    const { Menu } = require('@electron/remote');
    Menu.buildFromTemplate([
      { label: `${localized('Add Account')}...`, click: addAccount },
      { label: `${localized('Manage Accounts')}...`, click: manageAccounts },
      { type: 'separator' },
      { label: `${t('Modern UI settings')}...`, click: openModernUISettings },
    ]).popup({});
  };

  render() {
    const { accounts, selection, unread, iconStyle, showAllAccounts, showBadges } = this.state;
    if (accounts.length === 0) {
      return null;
    }
    const multiple = accounts.length > 1;
    const showAllEntry = multiple && showAllAccounts;
    const providerCounts: { [provider: string]: number } = {};
    accounts.forEach((a) => {
      providerCounts[a.provider] = (providerCounts[a.provider] || 0) + 1;
    });

    return (
      <nav className="modern-ui-account-rail" aria-label={localized('Accounts')}>
        <div className="modern-ui-account-rail__list">
          {showAllEntry ? (
            <AccountIcon
              account={null}
              label={localized('All Accounts')}
              selected={selection === ALL_ACCOUNTS}
              unread={showBadges ? unread[ALL_ACCOUNTS] || 0 : 0}
              providerShared={false}
              iconStyle={iconStyle}
              onSelect={this.onSelect}
              onContextMenu={this.onContextMenu}
            />
          ) : null}
          {showAllEntry ? <div className="modern-ui-account-rail__separator" role="separator" /> : null}
          {accounts.map((account) => (
            <AccountIcon
              key={account.id}
              account={account}
              label={account.label || account.emailAddress}
              description={account.label !== account.emailAddress ? account.emailAddress : null}
              selected={selection === account.id || (!multiple && selection === ALL_ACCOUNTS)}
              unread={showBadges ? unread[account.id] || 0 : 0}
              providerShared={providerCounts[account.provider] > 1}
              iconStyle={iconStyle}
              onSelect={this.onSelect}
              onContextMenu={this.onContextMenu}
            />
          ))}
        </div>
        <div className="modern-ui-account-rail__footer">
          <button
            type="button"
            className="modern-ui-account-rail__add"
            title={`${localized('Add Account')}...`}
            aria-label={localized('Add Account')}
            onClick={addAccount}
            onContextMenu={(e) => {
              e.preventDefault();
              this.onContextMenu();
            }}
          >
            <svg viewBox="0 0 16 16" aria-hidden="true">
              <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" />
            </svg>
          </button>
          <button
            type="button"
            className="modern-ui-account-rail__settings"
            title={t('Modern UI settings')}
            aria-label={t('Modern UI settings')}
            onClick={openModernUISettings}
          >
            <svg viewBox="0 0 20 20" aria-hidden="true">
              <path
                d="M8.6 2.5h2.8l.4 2.1 1.5.9 2-.8 1.4 2.4-1.6 1.4v1.8l1.6 1.4-1.4 2.4-2-.8-1.5.9-.4 2.1H8.6l-.4-2.1-1.5-.9-2 .8-1.4-2.4 1.6-1.4V8.5L3.3 7.1l1.4-2.4 2 .8 1.5-.9Z"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              <circle cx="10" cy="10" r="2.4" fill="none" stroke="currentColor" strokeWidth="1.4" />
            </svg>
          </button>
        </div>
      </nav>
    );
  }
}

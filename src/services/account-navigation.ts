import { Account, AccountStore, Actions, FocusedPerspectiveStore } from 'mailspring-exports';
import { ipcRenderer } from 'electron';

// Everything the rail does goes through Mailspring's own actions, the same ones
// the native account switcher menu and the Cmd+1..9 shortcuts use
// (account-sidebar/lib/account-commands.ts), so the sidebar, the thread list and
// the saved state all follow.

export const ALL_ACCOUNTS = '__all__';

// The rail's selected entry: an account id, or ALL_ACCOUNTS for the unified view.
// FocusedPerspectiveStore.sidebarAccountIds() is what the native sidebar shows.
export function currentSelection(): string {
  const ids = FocusedPerspectiveStore.sidebarAccountIds();
  if (ids.length === 1) {
    return ids[0];
  }
  return ALL_ACCOUNTS;
}

export function focusAccount(account: Account) {
  Actions.focusDefaultMailboxPerspectiveForAccounts([account]);
}

export function focusAllAccounts() {
  Actions.focusDefaultMailboxPerspectiveForAccounts(AccountStore.accounts());
}

export function addAccount() {
  ipcRenderer.send('command', 'application:add-account');
}

export function manageAccounts() {
  Actions.switchPreferencesTab('Accounts');
  Actions.openPreferences();
}

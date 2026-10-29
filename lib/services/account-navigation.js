"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ALL_ACCOUNTS = void 0;
exports.currentSelection = currentSelection;
exports.focusAccount = focusAccount;
exports.focusAllAccounts = focusAllAccounts;
exports.addAccount = addAccount;
exports.manageAccounts = manageAccounts;
const mailspring_exports_1 = require("mailspring-exports");
const electron_1 = require("electron");
// Everything the rail does goes through Mailspring's own actions, the same ones
// the native account switcher menu and the Cmd+1..9 shortcuts use
// (account-sidebar/lib/account-commands.ts), so the sidebar, the thread list and
// the saved state all follow.
exports.ALL_ACCOUNTS = '__all__';
// The rail's selected entry: an account id, or ALL_ACCOUNTS for the unified view.
// FocusedPerspectiveStore.sidebarAccountIds() is what the native sidebar shows.
function currentSelection() {
    const ids = mailspring_exports_1.FocusedPerspectiveStore.sidebarAccountIds();
    if (ids.length === 1) {
        return ids[0];
    }
    return exports.ALL_ACCOUNTS;
}
function focusAccount(account) {
    mailspring_exports_1.Actions.focusDefaultMailboxPerspectiveForAccounts([account]);
}
function focusAllAccounts() {
    mailspring_exports_1.Actions.focusDefaultMailboxPerspectiveForAccounts(mailspring_exports_1.AccountStore.accounts());
}
function addAccount() {
    electron_1.ipcRenderer.send('command', 'application:add-account');
}
function manageAccounts() {
    mailspring_exports_1.Actions.switchPreferencesTab('Accounts');
    mailspring_exports_1.Actions.openPreferences();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC1uYXZpZ2F0aW9uLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3NlcnZpY2VzL2FjY291bnQtbmF2aWdhdGlvbi50cyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOzs7QUFZQSw0Q0FNQztBQUVELG9DQUVDO0FBRUQsNENBRUM7QUFFRCxnQ0FFQztBQUVELHdDQUdDO0FBbkNELDJEQUE2RjtBQUM3Rix1Q0FBdUM7QUFFdkMsZ0ZBQWdGO0FBQ2hGLGtFQUFrRTtBQUNsRSxpRkFBaUY7QUFDakYsOEJBQThCO0FBRWpCLFFBQUEsWUFBWSxHQUFHLFNBQVMsQ0FBQztBQUV0QyxrRkFBa0Y7QUFDbEYsZ0ZBQWdGO0FBQ2hGLFNBQWdCLGdCQUFnQjtJQUM5QixNQUFNLEdBQUcsR0FBRyw0Q0FBdUIsQ0FBQyxpQkFBaUIsRUFBRSxDQUFDO0lBQ3hELElBQUksR0FBRyxDQUFDLE1BQU0sS0FBSyxDQUFDLEVBQUUsQ0FBQztRQUNyQixPQUFPLEdBQUcsQ0FBQyxDQUFDLENBQUMsQ0FBQztJQUNoQixDQUFDO0lBQ0QsT0FBTyxvQkFBWSxDQUFDO0FBQ3RCLENBQUM7QUFFRCxTQUFnQixZQUFZLENBQUMsT0FBZ0I7SUFDM0MsNEJBQU8sQ0FBQyx5Q0FBeUMsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUM7QUFDL0QsQ0FBQztBQUVELFNBQWdCLGdCQUFnQjtJQUM5Qiw0QkFBTyxDQUFDLHlDQUF5QyxDQUFDLGlDQUFZLENBQUMsUUFBUSxFQUFFLENBQUMsQ0FBQztBQUM3RSxDQUFDO0FBRUQsU0FBZ0IsVUFBVTtJQUN4QixzQkFBVyxDQUFDLElBQUksQ0FBQyxTQUFTLEVBQUUseUJBQXlCLENBQUMsQ0FBQztBQUN6RCxDQUFDO0FBRUQsU0FBZ0IsY0FBYztJQUM1Qiw0QkFBTyxDQUFDLG9CQUFvQixDQUFDLFVBQVUsQ0FBQyxDQUFDO0lBQ3pDLDRCQUFPLENBQUMsZUFBZSxFQUFFLENBQUM7QUFDNUIsQ0FBQyJ9
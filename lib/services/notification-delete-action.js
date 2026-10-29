"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.notificationActionStatus = notificationActionStatus;
exports.enableNotificationDeleteAction = enableNotificationDeleteAction;
exports.disableNotificationDeleteAction = disableNotificationDeleteAction;
const mailspring_exports_1 = require("mailspring-exports");
const path_1 = __importDefault(require("path"));
// Replaces "Archive" with "Delete" (move to Trash) in new-mail notifications.
//
// The built-in `unread-notifications` package hard-codes its two notification
// buttons ("Mark as Read", "Archive") and exposes no setting or extension point
// for them. Its module does export the Notifier class and keeps the running
// instance on its exports (`activate() { this.notifier = new Notifier(); }`).
// So instead of patching anything, this stops that instance through its own
// public `unlisten()` and runs a subclass that only changes the buttons and what
// the second one does. Every other behavior (filtering, the "N new messages"
// summary, sounds, inline reply, closing on read, the "Show notifications"
// preference) is inherited.
//
// This relies on private details of unread-notifications, so every step is
// checked; if anything differs, the built-in notifier is left untouched.
// deactivate() puts back a stock Notifier.
const BUILTIN_PACKAGE = 'unread-notifications';
const SOURCE = 'Notification Action';
const WAIT_STEP_MS = 500;
const WAIT_MAX_MS = 30000;
let status = 'off';
let builtinModule = null;
let installed = null;
let waitTimer = null;
// For the settings tab, which says so when this Mailspring version cannot be changed.
function notificationActionStatus() {
    return status;
}
function log(...args) {
    console.log('[mailspring-modern-ui] notifications:', ...args);
}
function loadBuiltinModule() {
    const pkg = AppEnv.packages.getPackageNamed(BUILTIN_PACKAGE);
    if (!pkg || !pkg.directory) {
        return null;
    }
    // Same path Mailspring required when it activated the package, so Node's
    // module cache hands back that very module (and its live `notifier`).
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    return require(path_1.default.join(pkg.directory, 'lib', 'main'));
}
function isCompatible(mod) {
    if (!mod || typeof mod.Notifier !== 'function') {
        return false;
    }
    const proto = mod.Notifier.prototype;
    return (typeof proto.unlisten === 'function' &&
        typeof proto._notifyOne === 'function' &&
        typeof proto._handleNotificationAction === 'function');
}
function createDeleteNotifierClass(BaseNotifier) {
    return class DeleteActionNotifier extends BaseNotifier {
        // Mirrors Notifier#_notifyOne in Mailspring 1.26.2; only the second
        // action button differs.
        async _notifyOne({ message, thread }, playSound) {
            const canTrash = !!(thread && mailspring_exports_1.CategoryStore.getTrashCategory(thread.accountId));
            if (!canTrash) {
                // No Trash folder for this account: keep the stock Archive button.
                return super._notifyOne({ message, thread }, playSound);
            }
            const from = message.from[0] ? message.from[0].displayName() : 'Unknown';
            let subtitle = null;
            let body = null;
            if (message.subject && message.subject.length > 0) {
                subtitle = message.subject;
                body = message.snippet;
            }
            else {
                subtitle = message.snippet;
            }
            const notification = await mailspring_exports_1.NativeNotifications.displayNotification({
                title: from,
                subtitle,
                body,
                tag: `thread-${thread.id}`,
                threadId: thread.id,
                messageId: message.id,
                playSound,
                canReply: true,
                replyPlaceholder: (0, mailspring_exports_1.localized)('Reply to %@...', from),
                actions: [
                    { type: 'button', text: (0, mailspring_exports_1.localized)('Mark as Read') },
                    { type: 'button', text: (0, mailspring_exports_1.localized)('Delete') },
                ],
                onActivate: ({ response, activationType, actionIndex }) => {
                    if (activationType === 'replied' && response && typeof response === 'string') {
                        mailspring_exports_1.Actions.sendQuickReply({ thread, message }, response);
                    }
                    else if (activationType === 'action') {
                        this._handleDeleteNotificationAction(actionIndex, thread);
                    }
                    else if (activationType === 'clicked') {
                        AppEnv.displayWindow();
                        mailspring_exports_1.Actions.ensureCategoryIsFocused('inbox', thread.accountId);
                        mailspring_exports_1.Actions.setFocus({ collection: 'thread', item: thread });
                    }
                },
            });
            if (notification) {
                if (!this.activeNotifications[thread.id]) {
                    this.activeNotifications[thread.id] = [notification];
                }
                else {
                    this.activeNotifications[thread.id].push(notification);
                }
            }
        }
        _handleDeleteNotificationAction(actionIndex, thread) {
            if (actionIndex !== 1) {
                // "Mark as Read" is unchanged.
                return this._handleNotificationAction(actionIndex, thread);
            }
            // Same task as the thread list's Trash button: a ChangeFolderTask to the
            // account's Trash folder. Nothing is deleted permanently.
            const tasks = mailspring_exports_1.TaskFactory.tasksForMovingToTrash({ threads: [thread], source: SOURCE }) || [];
            if (tasks.length > 0) {
                mailspring_exports_1.Actions.queueTasks(tasks);
            }
        }
    };
}
function swapIn(mod) {
    const previous = mod.notifier;
    if (!previous || typeof previous.unlisten !== 'function') {
        return false;
    }
    const DeleteNotifier = createDeleteNotifierClass(mod.Notifier);
    previous.unlisten();
    const next = new DeleteNotifier();
    // Keep the open notifications so reading a thread still closes them.
    next.activeNotifications = previous.activeNotifications || {};
    next.activationTime = previous.activationTime || next.activationTime;
    mod.notifier = next;
    installed = next;
    return true;
}
function enableNotificationDeleteAction() {
    if (installed || waitTimer) {
        return;
    }
    let mod;
    try {
        mod = loadBuiltinModule();
    }
    catch (err) {
        log('built-in notifier not found, leaving notifications unchanged', err);
        status = 'unavailable';
        return;
    }
    if (!isCompatible(mod)) {
        log('built-in notifier has an unexpected shape, leaving notifications unchanged');
        status = 'unavailable';
        return;
    }
    builtinModule = mod;
    status = 'pending';
    // This plugin activates early (syncInit) and unread-notifications a moment
    // later, so its instance may not exist yet.
    const startedAt = Date.now();
    const attempt = () => {
        waitTimer = null;
        if (mod.notifier) {
            try {
                if (swapIn(mod)) {
                    status = 'active';
                    log('"Archive" replaced with "Delete"');
                }
                else {
                    status = 'unavailable';
                }
            }
            catch (err) {
                status = 'unavailable';
                log('could not install, leaving notifications unchanged', err);
            }
            return;
        }
        if (Date.now() - startedAt < WAIT_MAX_MS) {
            waitTimer = setTimeout(attempt, WAIT_STEP_MS);
        }
        else {
            status = 'unavailable';
            log('unread-notifications never activated, nothing to replace');
        }
    };
    attempt();
}
function disableNotificationDeleteAction() {
    if (waitTimer) {
        clearTimeout(waitTimer);
        waitTimer = null;
    }
    if (status !== 'unavailable') {
        status = 'off';
    }
    if (!installed || !builtinModule) {
        return;
    }
    try {
        installed.unlisten();
        if (builtinModule.notifier === installed) {
            const restored = new builtinModule.Notifier();
            restored.activeNotifications = installed.activeNotifications || {};
            builtinModule.notifier = restored;
        }
        log('stock notifications restored');
    }
    catch (err) {
        log('could not restore the stock notifier', err);
    }
    installed = null;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLWRlbGV0ZS1hY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvbm90aWZpY2F0aW9uLWRlbGV0ZS1hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUE2Q0EsNERBRUM7QUFxSEQsd0VBK0NDO0FBRUQsMEVBdUJDO0FBNU9ELDJEQVE0QjtBQUM1QixnREFBd0I7QUFFeEIsOEVBQThFO0FBQzlFLEVBQUU7QUFDRiw4RUFBOEU7QUFDOUUsZ0ZBQWdGO0FBQ2hGLDRFQUE0RTtBQUM1RSw4RUFBOEU7QUFDOUUsNEVBQTRFO0FBQzVFLGlGQUFpRjtBQUNqRiw2RUFBNkU7QUFDN0UsMkVBQTJFO0FBQzNFLDRCQUE0QjtBQUM1QixFQUFFO0FBQ0YsMkVBQTJFO0FBQzNFLHlFQUF5RTtBQUN6RSwyQ0FBMkM7QUFFM0MsTUFBTSxlQUFlLEdBQUcsc0JBQXNCLENBQUM7QUFDL0MsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUM7QUFDckMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQztBQVMxQixJQUFJLE1BQU0sR0FBNkIsS0FBSyxDQUFDO0FBQzdDLElBQUksYUFBYSxHQUEwQixJQUFJLENBQUM7QUFDaEQsSUFBSSxTQUFTLEdBQVEsSUFBSSxDQUFDO0FBQzFCLElBQUksU0FBUyxHQUF5QyxJQUFJLENBQUM7QUFFM0Qsc0ZBQXNGO0FBQ3RGLFNBQWdCLHdCQUF3QjtJQUN0QyxPQUFPLE1BQU0sQ0FBQztBQUNoQixDQUFDO0FBRUQsU0FBUyxHQUFHLENBQUMsR0FBRyxJQUFXO0lBQ3pCLE9BQU8sQ0FBQyxHQUFHLENBQUMsdUNBQXVDLEVBQUUsR0FBRyxJQUFJLENBQUMsQ0FBQztBQUNoRSxDQUFDO0FBRUQsU0FBUyxpQkFBaUI7SUFDeEIsTUFBTSxHQUFHLEdBQUcsTUFBTSxDQUFDLFFBQVEsQ0FBQyxlQUFlLENBQUMsZUFB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
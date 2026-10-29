"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
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
let builtinModule = null;
let installed = null;
let waitTimer = null;
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
        return;
    }
    if (!isCompatible(mod)) {
        log('built-in notifier has an unexpected shape, leaving notifications unchanged');
        return;
    }
    builtinModule = mod;
    // This plugin activates early (syncInit) and unread-notifications a moment
    // later, so its instance may not exist yet.
    const startedAt = Date.now();
    const attempt = () => {
        waitTimer = null;
        if (mod.notifier) {
            try {
                if (swapIn(mod)) {
                    log('"Archive" replaced with "Delete"');
                }
            }
            catch (err) {
                log('could not install, leaving notifications unchanged', err);
            }
            return;
        }
        if (Date.now() - startedAt < WAIT_MAX_MS) {
            waitTimer = setTimeout(attempt, WAIT_STEP_MS);
        }
        else {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibm90aWZpY2F0aW9uLWRlbGV0ZS1hY3Rpb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvbm90aWZpY2F0aW9uLWRlbGV0ZS1hY3Rpb24udHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUE0SkEsd0VBdUNDO0FBRUQsMEVBb0JDO0FBek5ELDJEQVE0QjtBQUM1QixnREFBd0I7QUFFeEIsOEVBQThFO0FBQzlFLEVBQUU7QUFDRiw4RUFBOEU7QUFDOUUsZ0ZBQWdGO0FBQ2hGLDRFQUE0RTtBQUM1RSw4RUFBOEU7QUFDOUUsNEVBQTRFO0FBQzVFLGlGQUFpRjtBQUNqRiw2RUFBNkU7QUFDN0UsMkVBQTJFO0FBQzNFLDRCQUE0QjtBQUM1QixFQUFFO0FBQ0YsMkVBQTJFO0FBQzNFLHlFQUF5RTtBQUN6RSwyQ0FBMkM7QUFFM0MsTUFBTSxlQUFlLEdBQUcsc0JBQXNCLENBQUM7QUFDL0MsTUFBTSxNQUFNLEdBQUcscUJBQXFCLENBQUM7QUFDckMsTUFBTSxZQUFZLEdBQUcsR0FBRyxDQUFDO0FBQ3pCLE1BQU0sV0FBVyxHQUFHLEtBQUssQ0FBQztBQU8xQixJQUFJLGFBQWEsR0FBMEIsSUFBSSxDQUFDO0FBQ2hELElBQUksU0FBUyxHQUFRLElBQUksQ0FBQztBQUMxQixJQUFJLFNBQVMsR0FBeUMsSUFBSSxDQUFDO0FBRTNELFNBQVMsR0FBRyxDQUFDLEdBQUcsSUFBVztJQUN6QixPQUFPLENBQUMsR0FBRyxDQUFDLHVDQUF1QyxFQUFFLEdBQUcsSUFBSSxDQUFDLENBQUM7QUFDaEUsQ0FBQztBQUVELFNBQVMsaUJBQWlCO0lBQ3hCLE1BQU0sR0FBRyxHQUFHLE1BQU0sQ0FBQyxRQUFRLENBQUMsZUFBZSxDQUFDLGVBQWUsQ0FBQyxDQUFDO0lBQzdELElBQUksQ0FBQyxHQUFHLElBQUksQ0FBQyxHQUFHLENBQUMsU0FBUyxFQUFFLENBQUM7UUFDM0IsT0FBTyxJQUFJLENBQUM7SUFDZCxDQUFDO0lBQ0QseUVB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
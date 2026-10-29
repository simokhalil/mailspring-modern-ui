import {
  Actions,
  CategoryStore,
  NativeNotifications,
  TaskFactory,
  Thread,
  Message,
  localized,
} from 'mailspring-exports';
import path from 'path';

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

interface NotifierModule {
  Notifier: any;
  notifier: any;
}

let builtinModule: NotifierModule | null = null;
let installed: any = null;
let waitTimer: ReturnType<typeof setTimeout> | null = null;

function log(...args: any[]) {
  console.log('[mailspring-modern-ui] notifications:', ...args);
}

function loadBuiltinModule(): NotifierModule | null {
  const pkg = AppEnv.packages.getPackageNamed(BUILTIN_PACKAGE);
  if (!pkg || !pkg.directory) {
    return null;
  }
  // Same path Mailspring required when it activated the package, so Node's
  // module cache hands back that very module (and its live `notifier`).
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  return require(path.join(pkg.directory, 'lib', 'main'));
}

function isCompatible(mod: NotifierModule | null): boolean {
  if (!mod || typeof mod.Notifier !== 'function') {
    return false;
  }
  const proto = mod.Notifier.prototype;
  return (
    typeof proto.unlisten === 'function' &&
    typeof proto._notifyOne === 'function' &&
    typeof proto._handleNotificationAction === 'function'
  );
}

function createDeleteNotifierClass(BaseNotifier: any) {
  return class DeleteActionNotifier extends BaseNotifier {
    // Mirrors Notifier#_notifyOne in Mailspring 1.26.2; only the second
    // action button differs.
    async _notifyOne({ message, thread }: { message: Message; thread: Thread }, playSound: boolean) {
      const canTrash = !!(thread && CategoryStore.getTrashCategory(thread.accountId));
      if (!canTrash) {
        // No Trash folder for this account: keep the stock Archive button.
        return super._notifyOne({ message, thread }, playSound);
      }

      const from = message.from[0] ? message.from[0].displayName() : 'Unknown';
      let subtitle: string = null;
      let body: string = null;
      if (message.subject && message.subject.length > 0) {
        subtitle = message.subject;
        body = message.snippet;
      } else {
        subtitle = message.snippet;
      }

      const notification = await NativeNotifications.displayNotification({
        title: from,
        subtitle,
        body,
        tag: `thread-${thread.id}`,
        threadId: thread.id,
        messageId: message.id,
        playSound,
        canReply: true,
        replyPlaceholder: localized('Reply to %@...', from),
        actions: [
          { type: 'button', text: localized('Mark as Read') },
          { type: 'button', text: localized('Delete') },
        ],
        onActivate: ({ response, activationType, actionIndex }) => {
          if (activationType === 'replied' && response && typeof response === 'string') {
            Actions.sendQuickReply({ thread, message }, response);
          } else if (activationType === 'action') {
            this._handleDeleteNotificationAction(actionIndex, thread);
          } else if (activationType === 'clicked') {
            AppEnv.displayWindow();
            Actions.ensureCategoryIsFocused('inbox', thread.accountId);
            Actions.setFocus({ collection: 'thread', item: thread });
          }
        },
      });

      if (notification) {
        if (!this.activeNotifications[thread.id]) {
          this.activeNotifications[thread.id] = [notification];
        } else {
          this.activeNotifications[thread.id].push(notification);
        }
      }
    }

    _handleDeleteNotificationAction(actionIndex: number, thread: Thread) {
      if (actionIndex !== 1) {
        // "Mark as Read" is unchanged.
        return this._handleNotificationAction(actionIndex, thread);
      }
      // Same task as the thread list's Trash button: a ChangeFolderTask to the
      // account's Trash folder. Nothing is deleted permanently.
      const tasks = TaskFactory.tasksForMovingToTrash({ threads: [thread], source: SOURCE }) || [];
      if (tasks.length > 0) {
        Actions.queueTasks(tasks);
      }
    }
  };
}

function swapIn(mod: NotifierModule): boolean {
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

export function enableNotificationDeleteAction() {
  if (installed || waitTimer) {
    return;
  }
  let mod: NotifierModule | null;
  try {
    mod = loadBuiltinModule();
  } catch (err) {
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
      } catch (err) {
        log('could not install, leaving notifications unchanged', err);
      }
      return;
    }
    if (Date.now() - startedAt < WAIT_MAX_MS) {
      waitTimer = setTimeout(attempt, WAIT_STEP_MS);
    } else {
      log('unread-notifications never activated, nothing to replace');
    }
  };
  attempt();
}

export function disableNotificationDeleteAction() {
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
  } catch (err) {
    log('could not restore the stock notifier', err);
  }
  installed = null;
}

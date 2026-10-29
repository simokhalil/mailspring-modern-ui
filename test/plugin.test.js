'use strict';
// Loads the compiled plugin (lib/) against an in-memory Mailspring runtime and
// checks registration, rendering, navigation, updates and teardown.
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');
const React = require('react');
const TestRenderer = require('react-test-renderer');
const { install, tick } = require('./helpers/mailspring-stub');

const { act } = TestRenderer;

function setupAccounts(rt) {
  rt.state.accounts = [
    rt.makeAccount('a1', 'outlook', 'Work', 'me@work.io'),
    rt.makeAccount('a2', 'gmail', 'me@gmail.com', 'me@gmail.com'),
    rt.makeAccount('a3', 'imap', 'Perso', 'me@perso.fr', '#ff0000'),
    rt.makeAccount('a4', 'gmail', 'jane.doe@gmail.com', 'jane.doe@gmail.com'),
  ];
  rt.state.sidebarAccountIds = ['a1', 'a2', 'a3', 'a4'];
  rt.state.inboxes = { a1: 'in1', a2: 'in2', a3: 'in3', a4: 'in4' };
  rt.state.unread = { in1: 3, in2: 0, in3: 120 };
}

const byClass = (root, cls) =>
  root.findAll((n) => typeof n.type === 'string' && (n.props.className || '').split(' ').includes(cls));

test('activate registers every feature in the right place; deactivate removes all', () => {
  const rt = install();
  const main = rt.lib('main');
  main.activate();

  const entries = rt.modules['mailspring-exports'].ComponentRegistry.entries();
  const where = Object.fromEntries(
    entries.map(({ component, descriptor }) => [
      component.displayName,
      descriptor.role || descriptor.location.id,
    ])
  );
  assert.deepEqual(where, {
    ModernUIAccountRail: 'RootSidebar',
    ModernUIThreadAvatar: 'ThreadListIcon',
    ModernUIFolderTitle: 'ThreadList',
  });
  assert.ok(document.body.classList.contains('modern-ui-theme'));
  assert.equal(typeof main.config, 'object', 'config schema exported for Mailspring');
  assert.equal(main.config.accountIconStyle.default, 'auto');

  main.deactivate();
  assert.equal(rt.modules['mailspring-exports'].ComponentRegistry.entries().length, 0);
  assert.ok(!document.body.classList.contains('modern-ui-theme'));
  assert.equal(rt.modules['mailspring-exports'].DatabaseStore.listenerCount(), 0, 'no DB listener left');
});

test('the rail widens the sidebar column by its own width, and gives it back', () => {
  const rt = install();
  const { ComponentRegistry, WorkspaceStore } = rt.modules['mailspring-exports'];
  const nativeStyles = { minWidth: 165, maxWidth: 250 };
  const AccountSidebar = () => null;
  AccountSidebar.displayName = 'AccountSidebar';
  AccountSidebar.containerStyles = nativeStyles;
  ComponentRegistry.register(AccountSidebar, { location: WorkspaceStore.Location.RootSidebar });

  const main = rt.lib('main');
  main.activate();
  const column = ComponentRegistry.findComponentsMatching({ location: WorkspaceStore.Location.RootSidebar });
  // Same reduction as app/src/sheet.tsx: smallest max, largest min.
  const max = Math.min(...column.map((c) => (c.containerStyles || {}).maxWidth ?? 10000));
  const min = Math.max(...column.map((c) => (c.containerStyles || {}).minWidth ?? 0));
  assert.equal(max, 250 + 64, 'folders keep their native 250px maximum');
  assert.equal(min, 165 + 64, 'and their native 165px minimum');
  assert.deepEqual(nativeStyles, { minWidth: 165, maxWidth: 250 }, 'native object not mutated');

  rt.AppEnv.config.set('mailspring-modern-ui.accountRail', false);
  assert.equal(AccountSidebar.containerStyles, nativeStyles, 'original restored when the rail is off');
  rt.AppEnv.config.set('mailspring-modern-ui.accountRail', true);
  assert.equal(AccountSidebar.containerStyles.maxWidth, 314);
  main.deactivate();
  assert.equal(AccountSidebar.containerStyles, nativeStyles);
});

test('settings toggle features live, without restart', () => {
  const rt = install();
  rt.state.config['mailspring-modern-ui.threadAvatars'] = false;
  const main = rt.lib('main');
  main.activate();
  const names = () =>
    rt.modules['mailspring-exports'].ComponentRegistry.entries().map((e) => e.component.displayName);
  assert.ok(!names().includes('ModernUIThreadAvatar'));

  rt.AppEnv.config.set('mailspring-modern-ui.threadAvatars', true);
  assert.ok(names().includes('ModernUIThreadAvatar'));
  rt.AppEnv.config.set('mailspring-modern-ui.accountRail', false);
  assert.ok(!names().includes('ModernUIAccountRail'));
  rt.AppEnv.config.set('mailspring-modern-ui.theme', false);
  assert.ok(!document.body.classList.contains('modern-ui-theme'));
  main.deactivate();
});

test('account rail: entries, icons, badges, selection', () => {
  const rt = install();
  setupAccounts(rt);
  const AccountRail = rt.lib('components/AccountRail').default;
  assert.equal(AccountRail.containerStyles.minWidth, 165 + 64);

  let r;
  act(() => {
    r = TestRenderer.create(React.createElement(AccountRail));
  });
  const icons = byClass(r.root, 'modern-ui-account-icon');
  assert.equal(icons.length, 5, '"All accounts" + 4 accounts');
  assert.deepEqual(
    icons.map((i) => i.props['aria-label']),
    ['Tous les comptes (123)', 'Work (3)', 'me@gmail.com', 'Perso (120)', 'jane.doe@gmail.com']
  );
  assert.ok(icons[0].props.className.includes('is-selected'), 'unified view selected');

  // Outlook is the only Outlook account -> bundled logo. The two Gmail
  // accounts would look identical -> initials. IMAP has no logo -> initials.
  const retina = r.root.findAll((n) => n.type === 'img' && n.props['data-retina']);
  assert.deepEqual(retina.map((n) => n.props['data-retina']), ['ic-settings-account-outlook.png']);
  const initials = byClass(r.root, 'modern-ui-avatar').map((n) => n.props.children);
  assert.deepEqual(initials, ['M', 'P', 'JD']);
  const perso = byClass(r.root, 'modern-ui-avatar')[1];
  assert.equal(perso.props.style.backgroundColor, '#ff0000', 'account color from preferences');

  const badges = byClass(r.root, 'modern-ui-account-icon__badge').map((n) => n.props.children);
  assert.deepEqual(badges, ['99+', '3', '99+'], 'counts above 99 are capped');
  act(() => r.unmount());
});

test('account rail: clicking navigates through Mailspring actions and follows the store', async () => {
  const rt = install();
  setupAccounts(rt);
  const AccountRail = rt.lib('components/AccountRail').default;
  let r;
  act(() => {
    r = TestRenderer.create(React.createElement(AccountRail));
  });
  const icons = () => byClass(r.root, 'modern-ui-account-icon');

  await act(async () => {
    icons()[2].props.onClick();
    await tick(10);
  });
  assert.deepEqual(rt.calls.actions.at(-1), ['focusDefault', ['a2']]);
  assert.ok(icons()[2].props.className.includes('is-selected'));
  assert.ok(!icons()[0].props.className.includes('is-selected'));

  await act(async () => {
    icons()[0].props.onClick();
    await tick(10);
  });
  assert.deepEqual(rt.calls.actions.at(-1), ['focusDefault', ['a1', 'a2', 'a3', 'a4']]);
  assert.ok(icons()[0].props.className.includes('is-selected'));

  // Unread counts update.
  await act(async () => {
    rt.state.unread.in2 = 7;
    rt.modules['mailspring-exports'].ThreadCountsStore.trigger();
    await tick(10);
  });
  assert.equal(icons()[2].props['aria-label'], 'me@gmail.com (7)');

  // Account removed.
  await act(async () => {
    rt.state.accounts = rt.state.accounts.filter((a) => a.id !== 'a4');
    rt.state.sidebarAccountIds = ['a1', 'a2', 'a3'];
    rt.modules['mailspring-exports'].AccountStore.trigger();
    await tick(10);
  });
  assert.equal(icons().length, 4);
  // The remaining Gmail account is now unique -> its logo.
  assert.ok(r.root.findAll((n) => n.props && n.props['data-retina'] === 'ic-settings-account-gmail.png').length === 1);

  // "+" adds an account; the context menu offers Add / Manage.
  byClass(r.root, 'modern-ui-account-rail__add')[0].props.onClick();
  assert.deepEqual(rt.calls.ipc.at(-1), ['command', 'application:add-account']);
  icons()[1].props.onContextMenu({ preventDefault() {} });
  const menu = rt.remoteMenus.at(-1);
  assert.deepEqual(menu.map((m) => m.label), ['Ajouter un compte...', 'Gérer les comptes...']);
  menu[1].click();
  assert.deepEqual(rt.calls.actions.slice(-2), [['switchPreferencesTab', 'Accounts'], ['openPreferences']]);

  const stores = ['AccountStore', 'FocusedPerspectiveStore', 'CategoryStore', 'ThreadCountsStore'];
  act(() => r.unmount());
  for (const s of stores) {
    assert.equal(rt.modules['mailspring-exports'][s].listenerCount(), 0, `${s} unsubscribed`);
  }
});

test('account rail: single account has no "All accounts" entry', () => {
  const rt = install();
  rt.state.accounts = [rt.makeAccount('a1', 'imap', 'me@x.io', 'me@x.io')];
  rt.state.sidebarAccountIds = ['a1'];
  const AccountRail = rt.lib('components/AccountRail').default;
  const r = TestRenderer.create(React.createElement(AccountRail));
  const icons = byClass(r.root, 'modern-ui-account-icon');
  assert.equal(icons.length, 1);
  assert.ok(icons[0].props.className.includes('is-selected'));
  r.unmount();
});

const contact = (name, email, me = false) => ({ name, email, isMe: () => me });

test('thread avatar: initials, photo from the address book, batching and cleanup', async () => {
  const rt = install();
  const PNG = 'data:image/png;base64,iVBORw0KGgo=';
  rt.state.contacts = [
    { email: 'Alice@X.io', info: { vcf: `BEGIN:VCARD\nPHOTO:${PNG}\nEND:VCARD` } },
    { email: 'bob@x.io', info: { photos: [{ url: 'https://remote/photo.jpg' }] } },
  ];
  const cache = rt.lib('services/contact-photo-cache').default;
  cache.activate();
  const ThreadAvatar = rt.lib('components/ThreadAvatar').default;

  const t1 = { id: 't1', participants: [], __messages: [{ from: [contact('Alice Martin', 'Alice@X.io')] }] };
  const t2 = { id: 't2', participants: [], __messages: [{ from: [contact('Bob', 'bob@x.io')] }] };
  let r1;
  let r2;
  act(() => {
    r1 = TestRenderer.create(React.createElement(ThreadAvatar, { thread: t1 }));
    r2 = TestRenderer.create(React.createElement(ThreadAvatar, { thread: t2 }));
  });
  assert.equal(byClass(r1.root, 'modern-ui-avatar')[0].props.children, 'AM');
  assert.equal(byClass(r1.root, 'modern-ui-avatar')[0].props.title, 'Alice Martin <Alice@X.io>');

  await act(async () => {
    await tick(60);
  });
  assert.equal(rt.calls.queries.length, 1, 'one batched query for both rows');
  assert.deepEqual(rt.calls.queries[0].sort(), ['Alice@X.io', 'alice@x.io', 'bob@x.io'].sort());
  const img = r1.root.findAll((n) => n.type === 'img');
  assert.equal(img.length, 1);
  assert.equal(img[0].props.src, PNG);
  assert.equal(r2.root.findAll((n) => n.type === 'img').length, 0, 'remote Google photo not used');

  // Same thread again: cached, no new query.
  act(() => r2.update(React.createElement(ThreadAvatar, { thread: { ...t2 } })));
  await tick(60);
  assert.equal(rt.calls.queries.length, 1);

  act(() => {
    r1.unmount();
    r2.unmount();
  });
  cache.deactivate();
  assert.equal(rt.modules['mailspring-exports'].ComponentRegistry.listenerCount(), 0);
});

test('thread avatar: renders other ThreadListIcon components (narrow layout limit)', () => {
  const rt = install();
  const { ComponentRegistry } = rt.modules['mailspring-exports'];
  const ThreadAvatar = rt.lib('components/ThreadAvatar').default;
  ComponentRegistry.register(ThreadAvatar, { role: 'ThreadListIcon' });

  const thread = { id: 't', participants: [contact('Zoé', 'zoe@x.io')] };
  let r;
  act(() => {
    r = TestRenderer.create(React.createElement(ThreadAvatar, { thread }));
  });
  assert.equal(byClass(r.root, 'modern-ui-thread-avatar__extras').length, 0);

  const OpenTrackingIcon = () => React.createElement('i', { className: 'open-tracking' });
  OpenTrackingIcon.displayName = 'OpenTrackingIcon';
  act(() => ComponentRegistry.register(OpenTrackingIcon, { role: 'ThreadListIcon' }));
  assert.equal(r.root.findAll((n) => n.props.className === 'open-tracking').length, 1);
  assert.equal(r.root.findAll((n) => n.type === ThreadAvatar).length, 1, 'never renders itself');
  act(() => r.unmount());
});

test('folder title follows the focused perspective', async () => {
  const rt = install();
  setupAccounts(rt);
  const inbox = (ids) => ({
    name: 'Inbox',
    accountIds: ids,
    categories: () => ids.map(() => ({ role: 'inbox', path: 'INBOX' })),
    categoriesSharedRole: () => 'inbox',
  });
  rt.state.perspective = inbox(['a1', 'a2', 'a3', 'a4']);
  const FolderTitle = rt.lib('components/FolderTitle').default;
  let r;
  act(() => {
    r = TestRenderer.create(React.createElement(FolderTitle));
  });
  const text = () => r.root.findAll((n) => typeof n.type === 'string' && n.type !== 'header').map((n) => n.props.children);
  assert.deepEqual(text(), ['Boîte de réception', 'Tous les comptes']);

  act(() => {
    rt.state.perspective = {
      name: 'Projets/Client A',
      accountIds: ['a1'],
      categories: () => [{ role: null, path: 'Projets/Client A' }],
      categoriesSharedRole: () => null,
    };
    rt.modules['mailspring-exports'].FocusedPerspectiveStore.trigger();
  });
  assert.deepEqual(text(), ['Projets/Client A', 'Work']);

  act(() => {
    rt.state.perspective = { name: 'Searching Inbox', accountIds: ['a1'], searchQuery: 'facture', categories: () => [] };
    rt.modules['mailspring-exports'].FocusedPerspectiveStore.trigger();
  });
  assert.deepEqual(text(), ['Résultats de la recherche', '“facture”']);
  act(() => r.unmount());
  assert.equal(rt.modules['mailspring-exports'].FocusedPerspectiveStore.listenerCount(), 0);
});

// A copy of the shape of unread-notifications/lib/main in Mailspring 1.26.2.
function fakeUnreadNotificationsModule(rt) {
  const { NativeNotifications, Actions, TaskFactory, localized } = rt.modules['mailspring-exports'];
  class Notifier {
    constructor() {
      this.activationTime = Date.now();
      this.activeNotifications = {};
      this.listening = true;
      Notifier.instances.push(this);
    }
    unlisten() {
      this.listening = false;
    }
    async _notifyOne({ message, thread }) {
      return NativeNotifications.displayNotification({
        title: 'stock',
        actions: [
          { type: 'button', text: localized('Mark as Read') },
          { type: 'button', text: localized('Archive') },
        ],
        onActivate: ({ activationType, actionIndex }) => {
          if (activationType === 'action') this._handleNotificationAction(actionIndex, thread);
        },
      });
    }
    _handleNotificationAction(actionIndex, thread) {
      if (actionIndex === 0) {
        Actions.queueTask(TaskFactory.taskForSettingUnread({ threads: [thread], unread: false }));
      } else if (actionIndex === 1) {
        Actions.queueTasks(TaskFactory.tasksForArchiving({ threads: [thread] }));
      }
    }
  }
  Notifier.instances = [];
  return { Notifier, notifier: null };
}

function installFakeNotifier(rt) {
  const dir = path.join(__dirname, 'fixtures', 'unread-notifications');
  // The plugin requires <package dir>/lib/main; reuse that module object.
  const mod = require(path.join(dir, 'lib', 'main'));
  Object.assign(mod, fakeUnreadNotificationsModule(rt));
  rt.state.packages['unread-notifications'] = { name: 'unread-notifications', directory: dir };
  return mod;
}

const message = { id: 'm1', subject: 'Hello', snippet: 'Hi', from: [{ displayName: () => 'Alice' }] };

test('notifications: waits for the built-in notifier, then Delete moves to Trash', async () => {
  const rt = install();
  const mod = installFakeNotifier(rt);
  rt.state.trash = { a1: 'trash-a1' };
  const notif = rt.lib('services/notification-delete-action');

  notif.enableNotificationDeleteAction();
  assert.equal(mod.notifier, null, 'nothing to replace yet (syncInit activates first)');
  const stock = new mod.Notifier();
  stock.activeNotifications = { t0: ['open'] };
  mod.notifier = stock;
  await tick(600);

  assert.notEqual(mod.notifier, stock, 'replaced');
  assert.equal(stock.listening, false, 'stock instance stopped');
  assert.deepEqual(mod.notifier.activeNotifications, { t0: ['open'] }, 'open notifications carried over');

  const thread = { id: 't1', accountId: 'a1' };
  await mod.notifier._notifyOne({ message, thread }, false);
  const shown = rt.calls.notifications.at(-1);
  assert.deepEqual(shown.opts.actions.map((a) => a.text), ['Marquer comme lu', 'Supprimer']);
  assert.equal(shown.opts.canReply, true, 'inline reply kept');

  shown.opts.onActivate({ activationType: 'action', actionIndex: 1, response: null });
  assert.deepEqual(rt.calls.tasks.at(-1), { type: 'ChangeFolderTask', folder: 'trash-a1', threads: [thread] });
  shown.opts.onActivate({ activationType: 'action', actionIndex: 0, response: null });
  assert.equal(rt.calls.tasks.at(-1).type, 'ChangeUnreadTask');
  shown.opts.onActivate({ activationType: 'replied', response: 'Thanks!' });
  assert.deepEqual(rt.calls.actions.at(-1), ['sendQuickReply', 'Thanks!']);
  assert.ok(mod.notifier.activeNotifications.t1, 'tracked so reading the thread closes it');

  // Account without a Trash folder keeps the stock Archive button.
  await mod.notifier._notifyOne({ message, thread: { id: 't2', accountId: 'nope' } }, false);
  assert.deepEqual(rt.calls.notifications.at(-1).opts.actions.map((a) => a.text), ['Marquer comme lu', 'Archiver']);

  const installed = mod.notifier;
  notif.disableNotificationDeleteAction();
  assert.equal(installed.listening, false);
  assert.ok(mod.notifier instanceof mod.Notifier && mod.notifier.constructor === mod.Notifier, 'stock notifier back');
  assert.equal(mod.notifier.listening, true);
});

test('notifications: leaves everything alone when the built-in is missing or different', async () => {
  const rt = install();
  const notif = rt.lib('services/notification-delete-action');
  notif.enableNotificationDeleteAction(); // no package at all
  notif.disableNotificationDeleteAction();

  const mod = installFakeNotifier(rt);
  delete mod.Notifier.prototype._handleNotificationAction; // shape changed upstream
  const stock = new mod.Notifier();
  mod.notifier = stock;
  notif.enableNotificationDeleteAction();
  await tick(20);
  assert.equal(mod.notifier, stock);
  assert.equal(stock.listening, true);
});

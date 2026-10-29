// A small in-memory stand-in for the Mailspring runtime, so the compiled plugin
// in lib/ can be loaded and exercised with Node's test runner. It mirrors the
// behavior of the 1.26.2 APIs the plugin calls, nothing more.
'use strict';

const Module = require('module');
const path = require('path');
const React = require('react');
const ReactDOM = require('react-dom');

function createStore(extra) {
  const listeners = new Set();
  return Object.assign(
    {
      listen(fn) {
        listeners.add(fn);
        return () => listeners.delete(fn);
      },
      trigger(...args) {
        [...listeners].forEach((fn) => fn(...args));
      },
      listenerCount() {
        return listeners.size;
      },
    },
    extra
  );
}

function makeContact(name, email, me = false) {
  return {
    name,
    email,
    isMe: () => me,
    displayName: () => name || email,
  };
}

function makeAccount(id, provider, label, email, color = '') {
  return { id, provider, label, emailAddress: email, name: 'Same Owner', color };
}

function createRuntime() {
  const state = {
    accounts: [],
    sidebarAccountIds: [],
    perspective: null,
    inboxes: {}, // accountId -> category id
    trash: {}, // accountId -> category id
    unread: {}, // category id -> count
    contacts: [], // rows returned by DatabaseStore.findAll(Contact)
    config: {},
    packages: {},
  };
  const calls = { actions: [], tasks: [], notifications: [], queries: [], ipc: [] };

  const configListeners = new Map();
  const AppEnv = {
    config: {
      get: (key) => state.config[key],
      set(key, value) {
        state.config[key] = value;
        (configListeners.get(key) || []).forEach((fn) => fn({ newValue: value }));
      },
      onDidChange(key, fn) {
        if (!configListeners.has(key)) configListeners.set(key, new Set());
        configListeners.get(key).add(fn);
        return { dispose: () => configListeners.get(key).delete(fn) };
      },
    },
    packages: {
      getPackageNamed: (name) => state.packages[name],
      isPackageActive: (name) => !!state.packages[name],
    },
    displayWindow: () => calls.actions.push(['displayWindow']),
    showErrorDialog: () => {},
    reportError: () => {},
    isMainWindow: () => true,
  };

  const registry = new Map();
  const ComponentRegistry = createStore({
    register(component, descriptor) {
      if (registry.has(component.displayName)) {
        throw new Error(`already registered: ${component.displayName}`);
      }
      registry.set(component.displayName, { component, descriptor });
      this.trigger();
    },
    unregister(component) {
      registry.delete(component.displayName);
      this.trigger();
    },
    findComponentsMatching({ role, location }) {
      return [...registry.values()]
        .filter(
          ({ descriptor }) =>
            (role && descriptor.role === role) || (location && descriptor.location === location)
        )
        .map(({ component }) => component);
    },
    entries: () => [...registry.values()],
  });

  const AccountStore = createStore({
    accounts: () => state.accounts,
    accountIds: () => state.accounts.map((a) => a.id),
    accountForId: (id) => state.accounts.find((a) => a.id === id) || null,
  });

  const FocusedPerspectiveStore = createStore({
    current: () => state.perspective,
    sidebarAccountIds: () => state.sidebarAccountIds,
  });

  const CategoryStore = createStore({
    getInboxCategory: (acc) => {
      const id = typeof acc === 'string' ? acc : acc.id;
      return state.inboxes[id] ? { id: state.inboxes[id], accountId: id, role: 'inbox' } : null;
    },
    getTrashCategory: (acc) => {
      const id = typeof acc === 'string' ? acc : acc.id;
      return state.trash[id] ? { id: state.trash[id], accountId: id, role: 'trash' } : null;
    },
  });

  const ThreadCountsStore = createStore({
    unreadCountForCategoryId: (id) => (id in state.unread ? state.unread[id] : null),
  });

  const DatabaseStore = createStore({
    findAll(klass) {
      return {
        where(matcher) {
          calls.queries.push(matcher.values);
          const wanted = new Set(matcher.values);
          return Promise.resolve(state.contacts.filter((c) => wanted.has(c.email)));
        },
      };
    },
  });

  const Actions = {
    focusDefaultMailboxPerspectiveForAccounts(accounts) {
      calls.actions.push(['focusDefault', accounts.map((a) => (typeof a === 'string' ? a : a.id))]);
      state.sidebarAccountIds = accounts.map((a) => (typeof a === 'string' ? a : a.id));
      FocusedPerspectiveStore.trigger();
    },
    switchPreferencesTab: (tab) => calls.actions.push(['switchPreferencesTab', tab]),
    openPreferences: () => calls.actions.push(['openPreferences']),
    queueTask: (task) => calls.tasks.push(task),
    queueTasks: (tasks) => tasks.forEach((t) => calls.tasks.push(t)),
    ensureCategoryIsFocused: (role, accountId) => calls.actions.push(['ensureCategoryIsFocused', role, accountId]),
    setFocus: () => calls.actions.push(['setFocus']),
    sendQuickReply: (ctx, body) => calls.actions.push(['sendQuickReply', body]),
  };

  const TaskFactory = {
    taskForSettingUnread: ({ threads, unread }) => ({ type: 'ChangeUnreadTask', threads, unread }),
    tasksForArchiving: ({ threads }) => [{ type: 'Archive', threads }],
    tasksForMovingToTrash: ({ threads }) => {
      const trash = state.trash[threads[0].accountId];
      return trash ? [{ type: 'ChangeFolderTask', folder: trash, threads }] : [];
    },
  };

  const NativeNotifications = {
    async displayNotification(opts) {
      const n = { opts, closed: false, close() { this.closed = true; } };
      calls.notifications.push(n);
      return n;
    },
  };

  const LocalizedStringForRole = {
    inbox: 'Boîte de réception',
    sent: 'Messages envoyés',
    trash: 'Corbeille',
    drafts: 'Brouillons',
    archive: 'Archives',
    spam: 'Indésirables',
  };
  const FR = {
    'All Accounts': 'Tous les comptes',
    'Search Results': 'Résultats de la recherche',
    Delete: 'Supprimer',
    'Mark as Read': 'Marquer comme lu',
    Archive: 'Archiver',
    'Add Account': 'Ajouter un compte',
    'Manage Accounts': 'Gérer les comptes',
    Accounts: 'Comptes',
  };
  const localized = (key, ...args) => {
    let s = FR[key] || key;
    args.forEach((a) => (s = s.replace('%@', a)));
    return s;
  };

  const exportsModule = {
    React,
    ReactDOM,
    localized,
    Actions,
    AccountStore,
    FocusedPerspectiveStore,
    CategoryStore,
    ThreadCountsStore,
    DatabaseStore,
    ComponentRegistry,
    TaskFactory,
    NativeNotifications,
    WorkspaceStore: createStore({
      Location: {
        RootSidebar: { id: 'RootSidebar' },
        ThreadList: { id: 'ThreadList' },
      },
    }),
    DOMUtils: { getWorkspaceCssNumberProperty: (name, fallback) => fallback },
    Category: { LocalizedStringForRole },
    Contact: { attributes: { email: { in: (values) => ({ values }) } } },
  };

  class RetinaImg extends React.Component {
    render() {
      return React.createElement('img', { 'data-retina': this.props.name, alt: this.props.alt });
    }
  }
  RetinaImg.Mode = { ContentPreserve: 'preserve', ContentIsMask: 'mask' };

  const remoteMenus = [];
  const modules = {
    'mailspring-exports': exportsModule,
    'mailspring-component-kit': { RetinaImg },
    electron: { ipcRenderer: { send: (...args) => calls.ipc.push(args) } },
    '@electron/remote': {
      Menu: {
        buildFromTemplate(template) {
          remoteMenus.push(template);
          return { popup() {} };
        },
      },
    },
  };

  return { state, calls, modules, AppEnv, exportsModule, remoteMenus, makeAccount, makeContact };
}

// Installs a fresh runtime: globals, module aliases, and a clean require cache
// for lib/ so each test file starts from scratch.
function install() {
  const runtime = createRuntime();
  const libDir = path.resolve(__dirname, '..', '..', 'lib');

  for (const key of Object.keys(require.cache)) {
    if (key.startsWith(libDir)) delete require.cache[key];
  }

  const stubIds = Object.keys(runtime.modules);
  if (!Module.__modernUiOriginalResolve) {
    Module.__modernUiOriginalResolve = Module._resolveFilename;
  }
  const original = Module.__modernUiOriginalResolve;
  Module._resolveFilename = function (request, parent, ...rest) {
    if (stubIds.includes(request)) return `stub:${request}`;
    return original.call(this, request, parent, ...rest);
  };
  for (const id of stubIds) {
    require.cache[`stub:${id}`] = {
      id: `stub:${id}`,
      filename: `stub:${id}`,
      loaded: true,
      exports: runtime.modules[id],
    };
  }

  global.AppEnv = runtime.AppEnv;
  const classes = new Set();
  global.document = global.document || {};
  global.document.body = {
    classList: {
      add: (c) => classes.add(c),
      remove: (c) => classes.delete(c),
      contains: (c) => classes.has(c),
    },
  };
  global.requestAnimationFrame = (fn) => setTimeout(fn, 0);
  global.cancelAnimationFrame = (id) => clearTimeout(id);

  runtime.lib = (rel) => require(path.join(libDir, rel));
  return runtime;
}

const tick = (ms = 5) => new Promise((resolve) => setTimeout(resolve, ms));

module.exports = { install, tick };

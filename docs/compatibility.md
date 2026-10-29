# Compatibility and internal APIs

Written against **Mailspring 1.26.2** (tag `1.26.2`, commit `4de23b0`), the
version installed from the official build. `engines.mailspring` is `>=1.26.0`.

Mailspring has no versioned plugin API. This page lists everything the plugin
relies on, split between what Mailspring documents or uses for its own plugins
(public) and what is an implementation detail (internal), with what happens if
it changes.

## Public APIs (from `mailspring-exports` / `mailspring-component-kit`)

| API | Used for | Source in 1.26.2 |
|---|---|---|
| `ComponentRegistry.register/unregister/findComponentsMatching/listen` | Injecting the 3 components | `app/src/registries/component-registry.ts` |
| `WorkspaceStore.Location.RootSidebar` / `.ThreadList` | Rail and title locations | `app/src/flux/stores/workspace-store.ts` |
| Role `ThreadListIcon` | Thread avatar | `thread-list/lib/thread-list-columns.tsx` |
| `Actions.focusDefaultMailboxPerspectiveForAccounts` | Rail navigation, same as Cmd+1..9 | `account-sidebar/lib/account-commands.ts` |
| `Actions.switchPreferencesTab`, `Actions.openPreferences`, `application:add-account` command | Rail "+" button and context menu | `account-sidebar/lib/components/account-switcher.tsx` |
| `FocusedPerspectiveStore.current()/sidebarAccountIds()` | Rail selection, folder title | `app/src/flux/stores/focused-perspective-store.ts` |
| `AccountStore`, `CategoryStore.getInboxCategory/getTrashCategory`, `ThreadCountsStore.unreadCountForCategoryId` | Accounts, unread badges | `app/src/flux/stores/*` |
| `Category.LocalizedStringForRole`, `localized()` | Translated folder names | `app/src/flux/models/category.ts`, `app/src/intl.ts` |
| `DatabaseStore.findAll(Contact).where(Contact.attributes.email.in(...))` | Local contact photos | `app/src/flux/stores/database-store.ts` |
| `NativeNotifications.displayNotification`, `TaskFactory.tasksForMovingToTrash`, `Actions.queueTasks` | Delete action | `app/src/native-notifications.ts`, `app/src/flux/tasks/task-factory.ts` |
| `RetinaImg` with `ic-settings-account-<provider>.png` | Provider logos already shipped with Mailspring | `preferences/lib/tabs/preferences-account-list.tsx` |
| Package fields `main`, `engines`, `windowTypes`, `syncInit`, exported `config` | Packaging, settings schema | `app/src/package.ts`, `app/src/package-manager.ts` |
| `PreferencesUIStore.TabItem`, `registerPreferencesTab/unregisterPreferencesTab`, `Actions.switchPreferencesTab` | Preferences › Modern UI | `app/src/flux/stores/preferences-ui-store.ts` (also used by composer-signature, composer-templates, mcp-server) |
| `AppEnv.config.get/set/unset/onDidChange` | Persisted, validated settings | `app/src/config.ts` |
| `getCurrentLocale` | Plugin strings in French or English | `app/src/intl.ts` |

## Internal details relied on

### 1. Account rail layout (CSS)
- `.column-RootSidebar` and its first child `div` (`app/src/sheet.tsx`,
  `components/resizable-region.tsx`, `components/injected-component-set.tsx`)
  get a left padding; the rail is absolutely positioned inside.
- `.account-switcher` (native account dropdown) is hidden while the rail is shown.
- Column width: the sheet caps a column at the smallest `containerStyles.maxWidth`
  of its components (`app/src/sheet.tsx`). `AccountSidebar` declares 250px, read
  from a CSS variable when its module loads, before plugin styles exist. While the
  rail is on, `services/sidebar-width.ts` points the `containerStyles` static of
  the RootSidebar components at a copy with `maxWidth + 64` (the rail width), and puts the original
  object back when the rail is turned off. The native object is never mutated.
- **If it changes:** the rail may overlap the folder list or sit above it. Data
  and navigation are unaffected. Set Turn the rail off in Preferences › Modern UI.

### 2. Narrow thread-list rows (CSS + ordering)
- `.thread-list-narrow .icons-column` and its children `.thread-icon`,
  `.thread-injected-icons`, `.mail-important-icon` are rearranged into a grid.
- In narrow rows Mailspring renders **only the first** `ThreadListIcon`
  component (`matchLimit={1}`). The plugin uses `syncInit: true` so it registers
  before the optional `open-tracking` and `personal-level-indicators` packages,
  and re-renders their icons in a small chip on the avatar so they stay visible.
- **If it changes:** the avatar may be missing or misaligned in split view.
  Turning avatars off in Preferences › Modern UI removes it.

### 3. Notification "Delete" button (JS)
- Loads `<unread-notifications package>/lib/main` (resolved through
  `AppEnv.packages.getPackageNamed`, same module instance Mailspring uses),
  calls `notifier.unlisten()` on the running instance and installs a subclass of
  the exported `Notifier`, overriding `_notifyOne` only.
- Before doing anything it checks that `Notifier`, `unlisten`, `_notifyOne` and
  `_handleNotificationAction` exist. If any check fails, or the package is not
  found within 30 s, the stock notifications are left untouched and a line is
  logged to the console.
- No Mailspring function is patched or wrapped; nothing is written to disk.
- **If it changes:** notifications keep their stock "Archive" button. A future
  version could also change `_notifyOne`'s behavior in ways the subclass does
  not copy (it mirrors 1.26.2). Choosing "Archive" in Preferences › Modern UI
  puts the stock notifier back. The settings tab greys the option out when the
  checks fail.

### 4. Theme colors (CSS)
`styles/chrome.less` (under `body.modern-ui-dark-chrome`) and
`styles/content.less` (under `body.modern-ui-light-content`) restyle `.sheet-toolbar*`, `.toolbar-<Column>`,
`.btn-toolbar`, `.button-group` (draws the macOS pill outline), `.thread-search-bar`, `.account-sidebar`, `.outline-view .item`,
`.list-tabular-item`, `.thread-list`, `.column-<Column>` and `#message-list`.
Visual only; each set is removed at once by its setting. The accent is a CSS
custom property; translucent variants use `color-mix()` (Chromium 111+).

## Forward compatibility notes

- Mailspring's `master` branch (after 1.26.2) adds a native **NavRail** on the
  far left of the main window (Mail / Calendar / Activity) with a
  `NavRail:Section` role for plugins. Once that ships, the account rail will sit
  between the NavRail and the folders. Moving the account icons into a
  `NavRail:Section` is the natural follow-up; it was not done here because the
  installed 1.26.2 build has no such API to test against.
- Electron in 1.26.2 is Chromium-based with `:has()` support, which the layout
  rules need. Mailspring compiles plugin LESS with Less 3.13.1; the
  `lint:less` script uses that exact version.

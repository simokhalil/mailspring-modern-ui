import { ComponentRegistry, WorkspaceStore, PreferencesUIStore } from 'mailspring-exports';

import AccountRail, { RAIL_WIDTH } from './components/AccountRail';
import FolderTitle from './components/FolderTitle';
import ThreadAvatar from './components/ThreadAvatar';
import ContactPhotoCache from './services/contact-photo-cache';
import { widenRootSidebar, restoreRootSidebarWidth } from './services/sidebar-width';
import {
  enableNotificationDeleteAction,
  disableNotificationDeleteAction,
} from './services/notification-delete-action';
import { getSetting, observeSetting, SettingKey, SETTINGS_TAB_ID } from './settings';
import { t } from './i18n';

export { config } from './settings';

// Body classes for the stylesheet. Every theme rule is scoped under one of
// them, so turning a setting off (or removing the plugin) restores
// Mailspring's own look.
const DARK_CHROME_CLASS = 'modern-ui-dark-chrome';
const LIGHT_CONTENT_CLASS = 'modern-ui-light-content';

interface Feature {
  setting: SettingKey;
  // A setting value turns the feature on when isOn returns true.
  isOn?: (value: any) => boolean;
  enable(): void;
  disable(): void;
}

const FEATURES: Feature[] = [
  {
    setting: 'accountRail',
    // Widen first: registering triggers the sheet to re-read column widths.
    enable: () => {
      widenRootSidebar(RAIL_WIDTH, AccountRail);
      ComponentRegistry.register(AccountRail, { location: WorkspaceStore.Location.RootSidebar });
    },
    disable: () => {
      restoreRootSidebarWidth();
      ComponentRegistry.unregister(AccountRail);
    },
  },
  {
    setting: 'threadAvatars',
    enable: () => {
      ContactPhotoCache.activate();
      ComponentRegistry.register(ThreadAvatar, { role: 'ThreadListIcon' });
    },
    disable: () => {
      ComponentRegistry.unregister(ThreadAvatar);
      ContactPhotoCache.deactivate();
    },
  },
  {
    setting: 'folderTitle',
    enable: () =>
      ComponentRegistry.register(FolderTitle, { location: WorkspaceStore.Location.ThreadList }),
    disable: () => ComponentRegistry.unregister(FolderTitle),
  },
  {
    setting: 'darkChrome',
    enable: () => document.body.classList.add(DARK_CHROME_CLASS),
    disable: () => document.body.classList.remove(DARK_CHROME_CLASS),
  },
  {
    setting: 'lightContent',
    enable: () => document.body.classList.add(LIGHT_CONTENT_CLASS),
    disable: () => document.body.classList.remove(LIGHT_CONTENT_CLASS),
  },
  {
    setting: 'notificationAction',
    isOn: (value) => value === 'trash',
    enable: enableNotificationDeleteAction,
    disable: disableNotificationDeleteAction,
  },
];

// Settings with several values that map to one body class each:
// `modern-ui-accent-<id>` and `modern-ui-avatar-<px>` (styles/accents.less,
// styles/avatars.less).
const BODY_OPTIONS: Array<{ setting: SettingKey; prefix: string }> = [
  { setting: 'accent', prefix: 'modern-ui-accent-' },
  { setting: 'avatarSize', prefix: 'modern-ui-avatar-' },
];

const enabled = new Set<SettingKey>();
const bodyOptionClasses = new Map<SettingKey, string>();
let subscriptions: Array<{ dispose(): void }> = [];
let settingsTab: any = null;

function apply(feature: Feature, on: boolean) {
  if (on === enabled.has(feature.setting)) {
    return;
  }
  try {
    if (on) {
      feature.enable();
      enabled.add(feature.setting);
    } else {
      enabled.delete(feature.setting);
      feature.disable();
    }
  } catch (err) {
    // One feature failing (e.g. after a Mailspring update) must not take the
    // others down with it.
    console.error(`[mailspring-modern-ui] could not ${on ? 'enable' : 'disable'} ${feature.setting}`, err);
  }
}

function applyBodyOption(setting: SettingKey, prefix: string, value: any) {
  const previous = bodyOptionClasses.get(setting);
  if (previous) {
    document.body.classList.remove(previous);
    bodyOptionClasses.delete(setting);
  }
  if (value !== null) {
    const cls = `${prefix}${value}`;
    document.body.classList.add(cls);
    bodyOptionClasses.set(setting, cls);
  }
}

function isOn(feature: Feature, value: any) {
  return feature.isOn ? feature.isOn(value) : value !== false;
}

// The settings tab lives in Mailspring's own Preferences, through the same
// public API the bundled plugins use, so it stays reachable when the rail is
// hidden. The rail adds shortcuts to it.
function registerSettingsTab() {
  settingsTab = new PreferencesUIStore.TabItem({
    tabId: SETTINGS_TAB_ID,
    displayName: t('Modern UI'),
    componentClassFn: () => require('./components/SettingsTab').default,
    order: 4.5,
  });
  PreferencesUIStore.registerPreferencesTab(settingsTab);
}

// Called by Mailspring when the plugin loads. package.json limits it to the
// main window ("windowTypes": {"default": true}), so composer and popout
// windows are never touched.
export function activate() {
  for (const feature of FEATURES) {
    apply(feature, isOn(feature, getSetting(feature.setting)));
    subscriptions.push(observeSetting(feature.setting, (value) => apply(feature, isOn(feature, value))));
  }
  for (const { setting, prefix } of BODY_OPTIONS) {
    applyBodyOption(setting, prefix, getSetting(setting));
    subscriptions.push(observeSetting(setting, (value) => applyBodyOption(setting, prefix, value)));
  }
  try {
    registerSettingsTab();
  } catch (err) {
    console.error('[mailspring-modern-ui] could not add the Preferences tab', err);
  }
}

export function serialize() {}

// Undoes everything activate() did. Mailspring rarely calls this (removing the
// plugin takes effect on the next launch), but it is complete so a reload
// without the plugin leaves nothing behind.
export function deactivate() {
  subscriptions.forEach((s) => s.dispose());
  subscriptions = [];
  for (const feature of [...FEATURES].reverse()) {
    apply(feature, false);
  }
  for (const { setting, prefix } of BODY_OPTIONS) {
    applyBodyOption(setting, prefix, null);
  }
  if (settingsTab) {
    PreferencesUIStore.unregisterPreferencesTab(settingsTab);
    settingsTab = null;
  }
}

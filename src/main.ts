import { ComponentRegistry, WorkspaceStore } from 'mailspring-exports';

import AccountRail, { RAIL_WIDTH } from './components/AccountRail';
import FolderTitle from './components/FolderTitle';
import ThreadAvatar from './components/ThreadAvatar';
import ContactPhotoCache from './services/contact-photo-cache';
import { widenRootSidebar, restoreRootSidebarWidth } from './services/sidebar-width';
import {
  enableNotificationDeleteAction,
  disableNotificationDeleteAction,
} from './services/notification-delete-action';
import { getSetting, observeSetting, SettingKey } from './settings';

export { config } from './settings';

// Class added to <body> while the color theme is on. Every rule in
// styles/theme.less is scoped under it, so turning the setting off (or removing
// the plugin) restores Mailspring's own theme.
const THEME_BODY_CLASS = 'modern-ui-theme';

interface Feature {
  setting: SettingKey;
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
    setting: 'theme',
    enable: () => document.body.classList.add(THEME_BODY_CLASS),
    disable: () => document.body.classList.remove(THEME_BODY_CLASS),
  },
  {
    setting: 'notificationDeleteAction',
    enable: enableNotificationDeleteAction,
    disable: disableNotificationDeleteAction,
  },
];

const enabled = new Set<SettingKey>();
let subscriptions: Array<{ dispose(): void }> = [];

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

// Called by Mailspring when the plugin loads. package.json limits it to the
// main window ("windowTypes": {"default": true}), so composer and popout
// windows are never touched.
export function activate() {
  for (const feature of FEATURES) {
    apply(feature, getSetting(feature.setting) !== false);
    subscriptions.push(observeSetting(feature.setting, (value) => apply(feature, value !== false)));
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
}

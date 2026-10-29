// User settings. Exported from lib/main as `config`, which Mailspring turns into
// a config schema under the package name (app/src/package.ts). They have no
// UI; set them in config.json, e.g. "mailspring-modern-ui": { "threadAvatars": false }.
// Changes apply immediately, without restarting.

export const PACKAGE_NAME = 'mailspring-modern-ui';

export const config = {
  accountRail: {
    type: 'boolean',
    default: true,
    title: 'Show the account rail to the left of the folder sidebar',
  },
  accountIconStyle: {
    type: 'string',
    default: 'auto',
    enum: ['auto', 'provider', 'initials'],
    title:
      'Account icons: provider logo, initials, or auto (logo unless two accounts share a provider)',
  },
  threadAvatars: {
    type: 'boolean',
    default: true,
    title: 'Show contact avatars in the thread list',
  },
  folderTitle: {
    type: 'boolean',
    default: true,
    title: 'Show the folder name above the thread list',
  },
  theme: {
    type: 'boolean',
    default: true,
    title: 'Apply the Modern UI colors to the toolbar, sidebar and lists',
  },
  notificationDeleteAction: {
    type: 'boolean',
    default: true,
    title: 'Replace "Archive" with "Delete" (move to Trash) in new mail notifications',
  },
};

export type SettingKey = keyof typeof config;

export function getSetting(key: SettingKey): any {
  const value = AppEnv.config.get(`${PACKAGE_NAME}.${key}`);
  return value === undefined || value === null ? config[key].default : value;
}

export function observeSetting(key: SettingKey, callback: (value: any) => void): { dispose(): void } {
  return AppEnv.config.onDidChange(`${PACKAGE_NAME}.${key}`, () => callback(getSetting(key)));
}

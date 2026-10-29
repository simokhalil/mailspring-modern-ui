import { ACCENT_PRESETS, DEFAULT_ACCENT } from './services/accents';

// User settings, stored by Mailspring's own config system under the package
// name ("mailspring-modern-ui.*" in config.json). Exported from lib/main as
// `config`; app/src/package.ts registers it with AppEnv.config.setSchema, which
// validates every value written. Edited in Preferences › Modern UI
// (components/SettingsTab.tsx); every change applies immediately.

export const PACKAGE_NAME = 'mailspring-modern-ui';

// Preferences tab id; also what Actions.switchPreferencesTab expects.
export const SETTINGS_TAB_ID = 'Modern UI';

export const AVATAR_SIZES = [28, 32, 36, 40];

export const config = {
  accountRail: {
    type: 'boolean',
    default: true,
  },
  railShowAllAccounts: {
    type: 'boolean',
    default: true,
  },
  railUnreadBadges: {
    type: 'boolean',
    default: true,
  },
  // Per-account icon and color, keyed by account id; see
  // services/account-icons.ts for the format. Without an entry an account
  // shows its provider's logo, else its initials.
  accountIcons: {
    type: 'object',
    default: {},
  },
  threadAvatars: {
    type: 'boolean',
    default: true,
  },
  avatarSize: {
    type: 'integer',
    default: 36,
    enum: AVATAR_SIZES,
  },
  folderTitle: {
    type: 'boolean',
    default: true,
  },
  darkChrome: {
    type: 'boolean',
    default: true,
  },
  lightContent: {
    type: 'boolean',
    default: true,
  },
  accent: {
    type: 'string',
    default: DEFAULT_ACCENT,
    enum: ACCENT_PRESETS.map((p) => p.id),
  },
  notificationAction: {
    type: 'string',
    default: 'trash',
    enum: ['trash', 'archive'],
  },
};

export type SettingKey = keyof typeof config;

export const SETTING_KEYS = Object.keys(config) as SettingKey[];

function isValid(key: SettingKey, value: any) {
  const schema: any = config[key];
  if (value === undefined || value === null) {
    return false;
  }
  if (schema.enum) {
    return schema.enum.includes(value);
  }
  if (schema.type === 'object') {
    return typeof value === 'object' && !Array.isArray(value);
  }
  return schema.type === 'boolean' ? typeof value === 'boolean' : true;
}

export function getSetting(key: SettingKey): any {
  const value = AppEnv.config.get(`${PACKAGE_NAME}.${key}`);
  return isValid(key, value) ? value : config[key].default;
}

export function setSetting(key: SettingKey, value: any) {
  AppEnv.config.set(`${PACKAGE_NAME}.${key}`, value);
}

export function resetSettings() {
  for (const key of SETTING_KEYS) {
    AppEnv.config.unset(`${PACKAGE_NAME}.${key}`);
  }
}

export function observeSetting(key: SettingKey, callback: (value: any) => void): { dispose(): void } {
  return AppEnv.config.onDidChange(`${PACKAGE_NAME}.${key}`, () => callback(getSetting(key)));
}

"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SETTING_KEYS = exports.config = exports.AVATAR_SIZES = exports.SETTINGS_TAB_ID = exports.PACKAGE_NAME = void 0;
exports.getSetting = getSetting;
exports.setSetting = setSetting;
exports.resetSettings = resetSettings;
exports.observeSetting = observeSetting;
const accents_1 = require("./services/accents");
// User settings, stored by Mailspring's own config system under the package
// name ("mailspring-modern-ui.*" in config.json). Exported from lib/main as
// `config`; app/src/package.ts registers it with AppEnv.config.setSchema, which
// validates every value written. Edited in Preferences › Modern UI
// (components/SettingsTab.tsx); every change applies immediately.
exports.PACKAGE_NAME = 'mailspring-modern-ui';
// Preferences tab id; also what Actions.switchPreferencesTab expects.
exports.SETTINGS_TAB_ID = 'Modern UI';
exports.AVATAR_SIZES = [28, 32, 36, 40];
exports.config = {
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
        enum: exports.AVATAR_SIZES,
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
        default: accents_1.DEFAULT_ACCENT,
        enum: accents_1.ACCENT_PRESETS.map((p) => p.id),
    },
    notificationAction: {
        type: 'string',
        default: 'trash',
        enum: ['trash', 'archive'],
    },
};
exports.SETTING_KEYS = Object.keys(exports.config);
function isValid(key, value) {
    const schema = exports.config[key];
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
function getSetting(key) {
    const value = AppEnv.config.get(`${exports.PACKAGE_NAME}.${key}`);
    return isValid(key, value) ? value : exports.config[key].default;
}
function setSetting(key, value) {
    AppEnv.config.set(`${exports.PACKAGE_NAME}.${key}`, value);
}
function resetSettings() {
    for (const key of exports.SETTING_KEYS) {
        AppEnv.config.unset(`${exports.PACKAGE_NAME}.${key}`);
    }
}
function observeSetting(key, callback) {
    return AppEnv.config.onDidChange(`${exports.PACKAGE_NAME}.${key}`, () => callback(getSetting(key)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2V0dGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7O0FBc0ZBLGdDQUdDO0FBRUQsZ0NBRUM7QUFFRCxzQ0FJQztBQUVELHdDQUVDO0FBdkdELGdEQUFvRTtBQUVwRSw0RUFBNEU7QUFDNUUsNEVBQTRFO0FBQzVFLGdGQUFnRjtBQUNoRixtRUFBbUU7QUFDbkUsa0VBQWtFO0FBRXJELFFBQUEsWUFBWSxHQUFHLHNCQUFzQixDQUFDO0FBRW5ELHNFQUFzRTtBQUN6RCxRQUFBLGVBQWUsR0FBRyxXQUFXLENBQUM7QUFFOUIsUUFBQSxZQUFZLEdBQUcsQ0FBQyxFQUFFLEVBQUUsRUFBRSxFQUFFLEVBQUUsRUFBRSxFQUFFLENBQUMsQ0FBQztBQUVoQyxRQUFBLE1BQU0sR0FBRztJQUNwQixXQUFXLEVBQUU7UUFDWCxJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO0tBQ2Q7SUFDRCxtQkFBbUIsRUFBRTtRQUNuQixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO0tBQ2Q7SUFDRCxnQkFBZ0IsRUFBRTtRQUNoQixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO0tBQ2Q7SUFDRCx1REFBdUQ7SUFDdkQsd0VBQXdFO0lBQ3hFLGdEQUFnRDtJQUNoRCxZQUFZLEVBQUU7UUFDWixJQUFJLEVBQUUsUUFBUTtRQUNkLE9BQU8sRUFBRSxFQUFFO0tBQ1o7SUFDRCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO0tBQ2Q7SUFDRCxVQUFVLEVBQUU7UUFDVixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxFQUFFO1FBQ1gsSUFBSSxFQUFFLG9CQUFZO0tBQ25CO0lBQ0QsV0FBVyxFQUFFO1FBQ1gsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtLQUNkO0lBQ0QsVUFBVSxF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
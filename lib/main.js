"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = void 0;
exports.activate = activate;
exports.serialize = serialize;
exports.deactivate = deactivate;
const mailspring_exports_1 = require("mailspring-exports");
const AccountRail_1 = __importStar(require("./components/AccountRail"));
const FolderTitle_1 = __importDefault(require("./components/FolderTitle"));
const ThreadAvatar_1 = __importDefault(require("./components/ThreadAvatar"));
const contact_photo_cache_1 = __importDefault(require("./services/contact-photo-cache"));
const sidebar_width_1 = require("./services/sidebar-width");
const notification_delete_action_1 = require("./services/notification-delete-action");
const settings_1 = require("./settings");
const i18n_1 = require("./i18n");
var settings_2 = require("./settings");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return settings_2.config; } });
// Body classes for the stylesheet. Every theme rule is scoped under one of
// them, so turning a setting off (or removing the plugin) restores
// Mailspring's own look.
const DARK_CHROME_CLASS = 'modern-ui-dark-chrome';
const LIGHT_CONTENT_CLASS = 'modern-ui-light-content';
const FEATURES = [
    {
        setting: 'accountRail',
        // Widen first: registering triggers the sheet to re-read column widths.
        enable: () => {
            (0, sidebar_width_1.widenRootSidebar)(AccountRail_1.RAIL_WIDTH, AccountRail_1.default);
            mailspring_exports_1.ComponentRegistry.register(AccountRail_1.default, { location: mailspring_exports_1.WorkspaceStore.Location.RootSidebar });
        },
        disable: () => {
            (0, sidebar_width_1.restoreRootSidebarWidth)();
            mailspring_exports_1.ComponentRegistry.unregister(AccountRail_1.default);
        },
    },
    {
        setting: 'threadAvatars',
        enable: () => {
            contact_photo_cache_1.default.activate();
            mailspring_exports_1.ComponentRegistry.register(ThreadAvatar_1.default, { role: 'ThreadListIcon' });
        },
        disable: () => {
            mailspring_exports_1.ComponentRegistry.unregister(ThreadAvatar_1.default);
            contact_photo_cache_1.default.deactivate();
        },
    },
    {
        setting: 'folderTitle',
        enable: () => mailspring_exports_1.ComponentRegistry.register(FolderTitle_1.default, { location: mailspring_exports_1.WorkspaceStore.Location.ThreadList }),
        disable: () => mailspring_exports_1.ComponentRegistry.unregister(FolderTitle_1.default),
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
        enable: notification_delete_action_1.enableNotificationDeleteAction,
        disable: notification_delete_action_1.disableNotificationDeleteAction,
    },
];
// Settings with several values that map to one body class each:
// `modern-ui-accent-<id>` and `modern-ui-avatar-<px>` (styles/accents.less,
// styles/avatars.less).
const BODY_OPTIONS = [
    { setting: 'accent', prefix: 'modern-ui-accent-' },
    { setting: 'avatarSize', prefix: 'modern-ui-avatar-' },
];
const enabled = new Set();
const bodyOptionClasses = new Map();
let subscriptions = [];
let settingsTab = null;
function apply(feature, on) {
    if (on === enabled.has(feature.setting)) {
        return;
    }
    try {
        if (on) {
            feature.enable();
            enabled.add(feature.setting);
        }
        else {
            enabled.delete(feature.setting);
            feature.disable();
        }
    }
    catch (err) {
        // One feature failing (e.g. after a Mailspring update) must not take the
        // others down with it.
        console.error(`[mailspring-modern-ui] could not ${on ? 'enable' : 'disable'} ${feature.setting}`, err);
    }
}
function applyBodyOption(setting, prefix, value) {
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
function isOn(feature, value) {
    return feature.isOn ? feature.isOn(value) : value !== false;
}
// The settings tab lives in Mailspring's own Preferences, through the same
// public API the bundled plugins use, so it stays reachable when the rail is
// hidden. The rail adds shortcuts to it.
function registerSettingsTab() {
    settingsTab = new mailspring_exports_1.PreferencesUIStore.TabItem({
        tabId: settings_1.SETTINGS_TAB_ID,
        displayName: (0, i18n_1.t)('Modern UI'),
        componentClassFn: () => require('./components/SettingsTab').default,
        order: 4.5,
    });
    mailspring_exports_1.PreferencesUIStore.registerPreferencesTab(settingsTab);
}
// Called by Mailspring when the plugin loads. package.json limits it to the
// main window ("windowTypes": {"default": true}), so composer and popout
// windows are never touched.
function activate() {
    for (const feature of FEATURES) {
        apply(feature, isOn(feature, (0, settings_1.getSetting)(feature.setting)));
        subscriptions.push((0, settings_1.observeSetting)(feature.setting, (value) => apply(feature, isOn(feature, value))));
    }
    for (const { setting, prefix } of BODY_OPTIONS) {
        applyBodyOption(setting, prefix, (0, settings_1.getSetting)(setting));
        subscriptions.push((0, settings_1.observeSetting)(setting, (value) => applyBodyOption(setting, prefix, value)));
    }
    try {
        registerSettingsTab();
    }
    catch (err) {
        console.error('[mailspring-modern-ui] could not add the Preferences tab', err);
    }
}
function serialize() { }
// Undoes everything activate() did. Mailspring rarely calls this (removing the
// plugin takes effect on the next launch), but it is complete so a reload
// without the plugin leaves nothing behind.
function deactivate() {
    subscriptions.forEach((s) => s.dispose());
    subscriptions = [];
    for (const feature of [...FEATURES].reverse()) {
        apply(feature, false);
    }
    for (const { setting, prefix } of BODY_OPTIONS) {
        applyBodyOption(setting, prefix, null);
    }
    if (settingsTab) {
        mailspring_exports_1.PreferencesUIStore.unregisterPreferencesTab(settingsTab);
        settingsTab = null;
    }
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQStJQSw0QkFjQztBQUVELDhCQUE4QjtBQUs5QixnQ0FhQztBQWpMRCwyREFBMkY7QUFFM0Ysd0VBQW1FO0FBQ25FLDJFQUFtRDtBQUNuRCw2RUFBcUQ7QUFDckQseUZBQStEO0FBQy9ELDREQUFxRjtBQUNyRixzRkFHK0M7QUFDL0MseUNBQXFGO0FBQ3JGLGlDQUEyQjtBQUUzQix1Q0FBb0M7QUFBM0Isa0dBQUEsTUFBTSxPQUFBO0FBRWYsMkVBQTJFO0FBQzNFLG1FQUFtRTtBQUNuRSx5QkFBeUI7QUFDekIsTUFBTSxpQkFBaUIsR0FBRyx1QkFBdUIsQ0FBQztBQUNsRCxNQUFNLG1CQUFtQixHQUFHLHlCQUF5QixDQUFDO0FBVXRELE1BQU0sUUFBUSxHQUFjO0lBQzFCO1FBQ0UsT0FBTyxFQUFFLGFBQWE7UUFDdEIsd0VBQXdFO1FBQ3hFLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDWCxJQUFBLGdDQUFnQixFQUFDLHdCQUFVLEVBQUUscUJBQVcsQ0FBQyxDQUFDO1lBQzFDLHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxxQkFBVyxFQUFFLEVBQUUsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUNELE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDWixJQUFBLHVDQUF1QixHQUFFLENBQUM7WUFDMUIsc0NBQWlCLENBQUMsVUFBVSxDQUFDLHFCQUFXLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQ0Y7SUFDRDtRQUNFLE9BQU8sRUFBRSxlQUFlO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDWCw2QkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3QixzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsc0JB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
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
var settings_2 = require("./settings");
Object.defineProperty(exports, "config", { enumerable: true, get: function () { return settings_2.config; } });
// Class added to <body> while the color theme is on. Every rule in
// styles/theme.less is scoped under it, so turning the setting off (or removing
// the plugin) restores Mailspring's own theme.
const THEME_BODY_CLASS = 'modern-ui-theme';
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
        setting: 'theme',
        enable: () => document.body.classList.add(THEME_BODY_CLASS),
        disable: () => document.body.classList.remove(THEME_BODY_CLASS),
    },
    {
        setting: 'notificationDeleteAction',
        enable: notification_delete_action_1.enableNotificationDeleteAction,
        disable: notification_delete_action_1.disableNotificationDeleteAction,
    },
];
const enabled = new Set();
let subscriptions = [];
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
// Called by Mailspring when the plugin loads. package.json limits it to the
// main window ("windowTypes": {"default": true}), so composer and popout
// windows are never touched.
function activate() {
    for (const feature of FEATURES) {
        apply(feature, (0, settings_1.getSetting)(feature.setting) !== false);
        subscriptions.push((0, settings_1.observeSetting)(feature.setting, (value) => apply(feature, value !== false)));
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
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibWFpbi5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL3NyYy9tYWluLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQTZGQSw0QkFLQztBQUVELDhCQUE4QjtBQUs5QixnQ0FNQztBQS9HRCwyREFBdUU7QUFFdkUsd0VBQW1FO0FBQ25FLDJFQUFtRDtBQUNuRCw2RUFBcUQ7QUFDckQseUZBQStEO0FBQy9ELDREQUFxRjtBQUNyRixzRkFHK0M7QUFDL0MseUNBQW9FO0FBRXBFLHVDQUFvQztBQUEzQixrR0FBQSxNQUFNLE9BQUE7QUFFZixtRUFBbUU7QUFDbkUsZ0ZBQWdGO0FBQ2hGLCtDQUErQztBQUMvQyxNQUFNLGdCQUFnQixHQUFHLGlCQUFpQixDQUFDO0FBUTNDLE1BQU0sUUFBUSxHQUFjO0lBQzFCO1FBQ0UsT0FBTyxFQUFFLGFBQWE7UUFDdEIsd0VBQXdFO1FBQ3hFLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDWCxJQUFBLGdDQUFnQixFQUFDLHdCQUFVLEVBQUUscUJBQVcsQ0FBQyxDQUFDO1lBQzFDLHNDQUFpQixDQUFDLFFBQVEsQ0FBQyxxQkFBVyxFQUFFLEVBQUUsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFdBQVcsRUFBRSxDQUFDLENBQUM7UUFDN0YsQ0FBQztRQUNELE9BQU8sRUFBRSxHQUFHLEVBQUU7WUFDWixJQUFBLHVDQUF1QixHQUFFLENBQUM7WUFDMUIsc0NBQWlCLENBQUMsVUFBVSxDQUFDLHFCQUFXLENBQUMsQ0FBQztRQUM1QyxDQUFDO0tBQ0Y7SUFDRDtRQUNFLE9BQU8sRUFBRSxlQUFlO1FBQ3hCLE1BQU0sRUFBRSxHQUFHLEVBQUU7WUFDWCw2QkFBaUIsQ0FBQyxRQUFRLEVBQUUsQ0FBQztZQUM3QixzQ0FBaUIsQ0FBQyxRQUFRLENBQUMsc0JBQVksRUFBRSxFQUFFLElBQUksRUFBRSxnQkFBZ0IsRUFBRSxDQUFDLENBQUM7UUFD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
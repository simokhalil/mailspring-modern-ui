"use strict";
// User settings. Exported from lib/main as `config`, which Mailspring turns into
// a config schema under the package name (app/src/package.ts). They have no
// UI; set them in config.json, e.g. "mailspring-modern-ui": { "threadAvatars": false }.
// Changes apply immediately, without restarting.
Object.defineProperty(exports, "__esModule", { value: true });
exports.config = exports.PACKAGE_NAME = void 0;
exports.getSetting = getSetting;
exports.observeSetting = observeSetting;
exports.PACKAGE_NAME = 'mailspring-modern-ui';
exports.config = {
    accountRail: {
        type: 'boolean',
        default: true,
        title: 'Show the account rail to the left of the folder sidebar',
    },
    accountIconStyle: {
        type: 'string',
        default: 'auto',
        enum: ['auto', 'provider', 'initials'],
        title: 'Account icons: provider logo, initials, or auto (logo unless two accounts share a provider)',
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
function getSetting(key) {
    const value = AppEnv.config.get(`${exports.PACKAGE_NAME}.${key}`);
    return value === undefined || value === null ? exports.config[key].default : value;
}
function observeSetting(key, callback) {
    return AppEnv.config.onDidChange(`${exports.PACKAGE_NAME}.${key}`, () => callback(getSetting(key)));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2V0dGluZ3MuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9zcmMvc2V0dGluZ3MudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLGlGQUFpRjtBQUNqRiw0RUFBNEU7QUFDNUUsd0ZBQXdGO0FBQ3hGLGlEQUFpRDs7O0FBeUNqRCxnQ0FHQztBQUVELHdDQUVDO0FBOUNZLFFBQUEsWUFBWSxHQUFHLHNCQUFzQixDQUFDO0FBRXRDLFFBQUEsTUFBTSxHQUFHO0lBQ3BCLFdBQVcsRUFBRTtRQUNYLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUseURBQXlEO0tBQ2pFO0lBQ0QsZ0JBQWdCLEVBQUU7UUFDaEIsSUFBSSxFQUFFLFFBQVE7UUFDZCxPQUFPLEVBQUUsTUFBTTtRQUNmLElBQUksRUFBRSxDQUFDLE1BQU0sRUFBRSxVQUFVLEVBQUUsVUFBVSxDQUFDO1FBQ3RDLEtBQUssRUFDSCw2RkFBNkY7S0FDaEc7SUFDRCxhQUFhLEVBQUU7UUFDYixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLHlDQUF5QztLQUNqRDtJQUNELFdBQVcsRUFBRTtRQUNYLElBQUksRUFBRSxTQUFTO1FBQ2YsT0FBTyxFQUFFLElBQUk7UUFDYixLQUFLLEVBQUUsNENBQTRDO0tBQ3BEO0lBQ0QsS0FBSyxFQUFFO1FBQ0wsSUFBSSxFQUFFLFNBQVM7UUFDZixPQUFPLEVBQUUsSUFBSTtRQUNiLEtBQUssRUFBRSw4REFBOEQ7S0FDdEU7SUFDRCx3QkFBd0IsRUFBRTtRQUN4QixJQUFJLEVBQUUsU0FBUztRQUNmLE9BQU8sRUFBRSxJQUFJO1FBQ2IsS0FBSyxFQUFFLDJFQUEyRTtLQUNuRjtDQUNGLENBQUM7QUFJRixTQUFnQixVQUFVLENBQUMsR0FBZTtJQUN4QyxNQUFNLEtBQUssR0FBRyxNQUFNLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxHQUFHLG9CQUFZLElBQUksR0FBRyxFQUFFLENBQUMsQ0FBQztJQUMxRCxPQUFPLEtBQUssS0FBSyxTQUFTLElBQUksS0FBSyxLQUFLLElBQUksQ0FBQyxDQUFDLENBQUMsY0FBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLE9BQU8sQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFDO0FBQzdFLENBQUM7QUFFRCxTQUFnQixjQUFjLENBQUMsR0FBZSxFQUFFLFFBQThCO0lBQzVFLE9BQU8sTUFBTSxDQUFDLE1BQU0sQ0FBQyxXQUFXLENBQUMsR0FBRyxvQkFBWSxJQUFJLEdBQUcsRUFBRSxFQUFFLEdBQUcsRUFBRSxDQUFDLFFBQVEsQ0FBQyxVQUFVLENBQUMsR0FBRyxDQUFDLENBQUMsQ0FBQyxDQUFDO0FBQzlGLENBQUMifQ==
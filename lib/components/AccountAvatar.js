"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = AccountAvatar;
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const Avatar_1 = __importDefault(require("./Avatar"));
const IconGlyph_1 = require("./IconGlyph");
// One account's round icon, as resolved by resolveAccountAppearance. Shared by
// the rail and the settings editor so the preview is exactly what the rail shows.
function AccountAvatar({ appearance, className, }) {
    const base = `modern-ui-account-avatar${className ? ` ${className}` : ''}`;
    if (appearance.kind === 'lucide' || appearance.kind === 'simple-icons') {
        return (mailspring_exports_1.React.createElement("span", { className: `${base} modern-ui-account-avatar--glyph`, style: { backgroundColor: appearance.background, color: appearance.foreground } }, appearance.kind === 'lucide' ? (mailspring_exports_1.React.createElement(IconGlyph_1.LucideGlyph, { icon: appearance.icon, className: "modern-ui-account-avatar__glyph" })) : (mailspring_exports_1.React.createElement(IconGlyph_1.SimpleGlyph, { icon: appearance.icon, className: "modern-ui-account-avatar__glyph" }))));
    }
    if (appearance.kind === 'provider') {
        return (mailspring_exports_1.React.createElement("span", { className: `${base} modern-ui-account-avatar--logo`, style: appearance.background ? { backgroundColor: appearance.background } : undefined },
            mailspring_exports_1.React.createElement(mailspring_component_kit_1.RetinaImg, { name: `ic-settings-account-${appearance.provider}.png`, fallback: "ic-settings-account-imap.png", mode: mailspring_component_kit_1.RetinaImg.Mode.ContentPreserve, alt: "" })));
    }
    return (mailspring_exports_1.React.createElement(Avatar_1.default, { className: base, initials: appearance.initials, colors: { background: appearance.background, foreground: appearance.foreground } }));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjb3VudEF2YXRhci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb21wb25lbnRzL0FjY291bnRBdmF0YXIudHN4Il0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7O0FBUUEsZ0NBK0NDO0FBdkRELDJEQUEyQztBQUMzQyx1RUFBcUQ7QUFDckQsc0RBQThCO0FBQzlCLDJDQUF1RDtBQUd2RCwrRUFBK0U7QUFDL0Usa0ZBQWtGO0FBQ2xGLFNBQXdCLGFBQWEsQ0FBQyxFQUNwQyxVQUFVLEVBQ1YsU0FBUyxHQUlWO0lBQ0MsTUFBTSxJQUFJLEdBQUcsMkJBQTJCLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUM7SUFFM0UsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLFFBQVEsSUFBSSxVQUFVLENBQUMsSUFBSSxLQUFLLGNBQWMsRUFBRSxDQUFDO1FBQ3ZFLE9BQU8sQ0FDTCxtREFDRSxTQUFTLEVBQUUsR0FBRyxJQUFJLGtDQUFrQyxFQUNwRCxLQUFLLEVBQUUsRUFBRSxlQUFlLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxLQUFLLEVBQUUsVUFBVSxDQUFDLFVBQVUsRUFBRSxJQUU5RSxVQUFVLENBQUMsSUFBSSxLQUFLLFFBQVEsQ0FBQyxDQUFDLENBQUMsQ0FDOUIseUNBQUMsdUJBQVcsSUFBQyxJQUFJLEVBQUUsVUFBVSxDQUFDLElBQUksRUFBRSxTQUFTLEVBQUMsaUNBQWlDLEdBQUcsQ0FDbkYsQ0FBQyxDQUFDLENBQUMsQ0FDRix5Q0FBQyx1QkFBVyxJQUFDLElBQUksRUFBRSxVQUFVLENBQUMsSUFBSSxFQUFFLFNBQVMsRUFBQyxpQ0FBaUMsR0FBRyxDQUNuRixDQUNJLENBQ1IsQ0FBQztJQUNKLENBQUM7SUFFRCxJQUFJLFVBQVUsQ0FBQyxJQUFJLEtBQUssVUFBVSxFQUFFLENBQUM7UUFDbkMsT0FBTyxDQUNMLG1EQUNFLFNBQVMsRUFBRSxHQUFHLElBQUksaUNBQWlDLEVBQ25ELEtBQUssRUFBRSxVQUFVLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxFQUFFLGVBQWUsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLENBQUMsQ0FBQyxDQUFDLFNBQVM7WUFFckYseUNBQUMsb0NBQVMsSUFDUixJQUFJLEVBQUUsdUJBQXVCLFVBQVUsQ0FBQyxRQUFRLE1BQU0sRUFDdEQsUUFBUSxFQUFDLDhCQUE4QixFQUN2QyxJQUFJLEVBQUUsb0NBQVMsQ0FBQyxJQUFJLENBQUMsZUFBZSxFQUNwQyxHQUFHLEVBQUMsRUFBRSxHQUNOLENBQ0csQ0FDUixDQUFDO0lBQ0osQ0FBQztJQUVELE9BQU8sQ0FDTCx5Q0FBQyxnQkFBTSxJQUNMLFNBQVMsRUFBRSxJQUFJLEVBQ2YsUUFBUSxFQUFFLFVBQVUsQ0FBQyxRQUFRLEVBQzdCLE1BQU0sRUFBRSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLFVBQVUsRUFBRSxVQUFVLENBQUMsVUFBVSxFQUFFLEdBQ2hGLENBQ0gsQ0FBQztBQUNKLENBQUMifQ==
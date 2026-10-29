"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const mailspring_component_kit_1 = require("mailspring-component-kit");
const Avatar_1 = __importDefault(require("./Avatar"));
const RailTooltip_1 = __importDefault(require("./RailTooltip"));
const identity_1 = require("../services/identity");
const TOOLTIP_DELAY_MS = 350;
let nextTooltipId = 0;
// Providers whose logo ships inside Mailspring (static/images/preferences/
// ic-settings-account-<provider>@2x.png). "imap" only has a generic icon, so
// generic IMAP accounts use initials.
const PROVIDER_LOGOS = new Set([
    'gmail',
    'office365',
    'outlook',
    'yahoo',
    'icloud',
    'fastmail',
    'gmx',
    'yandex',
    'eas',
]);
function accountInitials(account) {
    const label = (account.label || '').trim();
    // A custom label ("Work", "Perso") identifies the account better than the
    // owner's name, which is usually the same for all of them.
    if (label && !label.includes('@')) {
        return (0, identity_1.initialsFor)(label, account.emailAddress);
    }
    return (0, identity_1.initialsFor)(null, account.emailAddress);
}
function AllAccountsGlyph() {
    return (mailspring_exports_1.React.createElement("svg", { className: "modern-ui-account-icon__glyph", viewBox: "0 0 20 20", "aria-hidden": "true" },
        mailspring_exports_1.React.createElement("path", { d: "M3 11.5 5.2 5.3A1.5 1.5 0 0 1 6.6 4.3h6.8a1.5 1.5 0 0 1 1.4 1l2.2 6.2v3.7a1.5 1.5 0 0 1-1.5 1.5h-11A1.5 1.5 0 0 1 3 15.2Z", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" }),
        mailspring_exports_1.React.createElement("path", { d: "M3.4 11.5h3.9l1 1.7h3.4l1-1.7h3.9", fill: "none", stroke: "currentColor", strokeWidth: "1.5", strokeLinejoin: "round" })));
}
class AccountIcon extends mailspring_exports_1.React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { tooltipAt: null };
        this.button = mailspring_exports_1.React.createRef();
        this.tooltipTimer = null;
        this.tooltipId = `modern-ui-rail-tooltip-${nextTooltipId++}`;
        this.showTooltipSoon = () => {
            if (this.tooltipTimer || this.state.tooltipAt) {
                return;
            }
            this.tooltipTimer = setTimeout(() => {
                this.tooltipTimer = null;
                const el = this.button.current;
                if (!el || !el.isConnected) {
                    return;
                }
                const rect = el.getBoundingClientRect();
                this.setState({ tooltipAt: { left: rect.right + 10, top: rect.top + rect.height / 2 } });
            }, TOOLTIP_DELAY_MS);
        };
        this.hideTooltip = () => {
            if (this.tooltipTimer) {
                clearTimeout(this.tooltipTimer);
                this.tooltipTimer = null;
            }
            if (this.state.tooltipAt) {
                this.setState({ tooltipAt: null });
            }
        };
        this.onClick = () => {
            this.hideTooltip();
            this.props.onSelect(this.props.account);
        };
        this.onContextMenu = (event) => {
            event.preventDefault();
            this.hideTooltip();
            this.props.onContextMenu(this.props.account);
        };
    }
    componentWillUnmount() {
        if (this.tooltipTimer) {
            clearTimeout(this.tooltipTimer);
        }
    }
    renderVisual() {
        const { account, iconStyle, providerShared } = this.props;
        if (!account) {
            return (mailspring_exports_1.React.createElement("span", { className: "modern-ui-account-icon__visual modern-ui-account-icon__visual--all" },
                mailspring_exports_1.React.createElement(AllAccountsGlyph, null)));
        }
        // Account has no picture of its own in Mailspring's model, so the order is:
        // the provider logo bundled with Mailspring, then initials.
        const hasLogo = PROVIDER_LOGOS.has(account.provider);
        const useLogo = hasLogo && (iconStyle === 'provider' || (iconStyle === 'auto' && !providerShared));
        if (useLogo) {
            return (mailspring_exports_1.React.createElement("span", { className: "modern-ui-account-icon__visual modern-ui-account-icon__visual--logo" },
                mailspring_exports_1.React.createElement(mailspring_component_kit_1.RetinaImg, { name: `ic-settings-account-${account.provider}.png`, fallback: "ic-settings-account-imap.png", mode: mailspring_component_kit_1.RetinaImg.Mode.ContentPreserve, alt: "" })));
        }
        const colors = (0, identity_1.strongColorsFor)((account.emailAddress || account.id || '').toLowerCase());
        // Respect the color picked for the account in Preferences > Accounts.
        const custom = (0, identity_1.sanitizeCssColor)(account.color);
        return (mailspring_exports_1.React.createElement(Avatar_1.default, { className: "modern-ui-account-icon__visual", initials: accountInitials(account), colors: custom ? { background: custom, foreground: '#FFFFFF' } : colors }));
    }
    render() {
        const { selected, unread, label, description } = this.props;
        const { tooltipAt } = this.state;
        const badge = unread > 0 ? (unread > 99 ? '99+' : `${unread}`) : null;
        return (mailspring_exports_1.React.createElement("button", { ref: this.button, type: "button", className: `modern-ui-account-icon${selected ? ' is-selected' : ''}`, "aria-label": badge ? `${label} (${unread})` : label, "aria-current": selected ? 'page' : undefined, "aria-describedby": tooltipAt ? this.tooltipId : undefined, onClick: this.onClick, onContextMenu: this.onContextMenu, onMouseEnter: this.showTooltipSoon, onMouseLeave: this.hideTooltip, onFocus: this.showTooltipSoon, onBlur: this.hideTooltip },
            mailspring_exports_1.React.createElement("span", { className: "modern-ui-account-icon__indicator", "aria-hidden": "true" }),
            this.renderVisual(),
            badge ? (mailspring_exports_1.React.createElement("span", { className: "modern-ui-account-icon__badge", "aria-hidden": "true" }, badge)) : null,
            mailspring_exports_1.React.createElement(RailTooltip_1.default, { id: this.tooltipId, anchor: tooltipAt, title: label, description: description })));
    }
}
AccountIcon.displayName = 'ModernUIAccountIcon';
exports.default = AccountIcon;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjb3VudEljb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9BY2NvdW50SWNvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBb0Q7QUFDcEQsdUVBQXFEO0FBQ3JELHNEQUE4QjtBQUM5QixnRUFBd0M7QUFDeEMsbURBQXNGO0FBRXRGLE1BQU0sZ0JBQWdCLEdBQUcsR0FBRyxDQUFDO0FBQzdCLElBQUksYUFBYSxHQUFHLENBQUMsQ0FBQztBQUV0QiwyRUFBMkU7QUFDM0UsNkVBQTZFO0FBQzdFLHNDQUFzQztBQUN0QyxNQUFNLGNBQWMsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUM3QixPQUFPO0lBQ1AsV0FBVztJQUNYLFNBQVM7SUFDVCxPQUFPO0lBQ1AsUUFBUTtJQUNSLFVBQVU7SUFDVixLQUFLO0lBQ0wsUUFBUTtJQUNSLEtBQUs7Q0FDTixDQUFDLENBQUM7QUF1QkgsU0FBUyxlQUFlLENBQUMsT0FBZ0I7SUFDdkMsTUFBTSxLQUFLLEdBQUcsQ0FBQyxPQUFPLENBQUMsS0FBSyxJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksRUFBRSxDQUFDO0lBQzNDLDBFQUEwRTtJQUMxRSwyREFBMkQ7SUFDM0QsSUFBSSxLQUFLLElBQUksQ0FBQyxLQUFLLENBQUMsUUFBUSxDQUFDLEdBQUcsQ0FBQyxFQUFFLENBQUM7UUFDbEMsT0FBTyxJQUFBLHNCQUFXLEVBQUMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztJQUNsRCxDQUFDO0lBQ0QsT0FBTyxJQUFBLHNCQUFXLEVBQUMsSUFBSSxFQUFFLE9BQU8sQ0FBQyxZQUFZLENBQUMsQ0FBQztBQUNqRCxDQUFDO0FBRUQsU0FBUyxnQkFBZ0I7SUFDdkIsT0FBTyxDQUNMLGtEQUFLLFNBQVMsRUFBQywrQkFBK0IsRUFBQyxPQUFPLEVBQUMsV0FBVyxpQkFBYSxNQUFNO1FBQ25GLG1EQUNFLENBQUMsRUFBQywySEFBMkgsRUFD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
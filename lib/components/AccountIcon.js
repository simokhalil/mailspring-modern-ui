"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mailspring_exports_1 = require("mailspring-exports");
const AccountAvatar_1 = __importDefault(require("./AccountAvatar"));
const RailTooltip_1 = __importDefault(require("./RailTooltip"));
const account_icons_1 = require("../services/account-icons");
const TOOLTIP_DELAY_MS = 350;
let nextTooltipId = 0;
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
        const { account, choice } = this.props;
        if (!account) {
            return (mailspring_exports_1.React.createElement("span", { className: "modern-ui-account-icon__visual modern-ui-account-icon__visual--all" },
                mailspring_exports_1.React.createElement(AllAccountsGlyph, null)));
        }
        return (mailspring_exports_1.React.createElement(AccountAvatar_1.default, { className: "modern-ui-account-icon__visual", appearance: (0, account_icons_1.resolveAccountAppearance)(account, choice) }));
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQWNjb3VudEljb24uanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9BY2NvdW50SWNvbi50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7QUFBQSwyREFBb0Q7QUFDcEQsb0VBQTRDO0FBQzVDLGdFQUF3QztBQUN4Qyw2REFBd0Y7QUFFeEYsTUFBTSxnQkFBZ0IsR0FBRyxHQUFHLENBQUM7QUFDN0IsSUFBSSxhQUFhLEdBQUcsQ0FBQyxDQUFDO0FBbUJ0QixTQUFTLGdCQUFnQjtJQUN2QixPQUFPLENBQ0wsa0RBQUssU0FBUyxFQUFDLCtCQUErQixFQUFDLE9BQU8sRUFBQyxXQUFXLGlCQUFhLE1BQU07UUFDbkYsbURBQ0UsQ0FBQyxFQUFDLDJIQUEySCxFQUM3SCxJQUFJLEVBQUMsTUFBTSxFQUNYLE1BQU0sRUFBQyxjQUFjLEVBQ3JCLFdBQVcsRUFBQyxLQUFLLEVBQ2pCLGNBQWMsRUFBQyxPQUFPLEdBQ3RCO1FBQ0YsbURBQ0UsQ0FBQyxFQUFDLG1DQUFtQyxFQUNyQyxJQUFJLEVBQUMsTUFBTSxFQUNYLE1BQU0sRUFBQyxjQUFjLEVBQ3JCLFdBQVcsRUFBQyxLQUFLLEVBQ2pCLGNBQWMsRUFBQyxPQUFPLEdBQ3RCLENBQ0UsQ0FDUCxDQUFDO0FBQ0osQ0FBQztBQUVELE1BQXFCLFdBQVksU0FBUSwwQkFBSyxDQUFDLGFBQWlEO0lBQWhHOztRQUdFLFVBQUssR0FBcUIsRUFBRSxTQUFTLEVBQUUsSUFBSSxFQUFFLENBQUM7UUFFdEMsV0FBTSxHQUFHLDBCQUFLLENBQUMsU0FBUyxFQUFxQixDQUFDO1FBQzlDLGlCQUFZLEdBQXlDLElBQUksQ0FBQztRQUMxRCxjQUFTLEdBQUcsMEJBQTBCLGFBQWEsRUFBRSxFQUFFLENBQUM7UUFReEQsb0JBQWUsR0FBRyxHQUFHLEVBQUU7WUFDN0IsSUFBSSxJQUFJLENBQUMsWUFBWSxJQUFJLElBQUksQ0FBQyxLQUFLLENBQUMsU0FBUyxFQUFFLENBQUM7Z0JBQzlD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
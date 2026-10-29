"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RailTooltip;
const mailspring_exports_1 = require("mailspring-exports");
// Rendered into document.body so neither the rail's scroll area nor the sheet
// column clips it. Same approach as Mailspring's own nav rail tooltips.
function RailTooltip({ id, anchor, title, description }) {
    if (!anchor) {
        return null;
    }
    return mailspring_exports_1.ReactDOM.createPortal(mailspring_exports_1.React.createElement("div", { id: id, role: "tooltip", className: "modern-ui-rail-tooltip", style: { left: anchor.left, top: anchor.top } },
        mailspring_exports_1.React.createElement("div", { className: "modern-ui-rail-tooltip__title" }, title),
        description ? mailspring_exports_1.React.createElement("div", { className: "modern-ui-rail-tooltip__description" }, description) : null), document.body);
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiUmFpbFRvb2x0aXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvY29tcG9uZW50cy9SYWlsVG9vbHRpcC50c3giXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7QUFXQSw4QkFnQkM7QUEzQkQsMkRBQXFEO0FBU3JELDhFQUE4RTtBQUM5RSx3RUFBd0U7QUFDeEUsU0FBd0IsV0FBVyxDQUFDLEVBQUUsRUFBRSxFQUFFLE1BQU0sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFvQjtJQUN0RixJQUFJLENBQUMsTUFBTSxFQUFFLENBQUM7UUFDWixPQUFPLElBQUksQ0FBQztJQUNkLENBQUM7SUFDRCxPQUFPLDZCQUFRLENBQUMsWUFBWSxDQUMxQixrREFDRSxFQUFFLEVBQUUsRUFBRSxFQUNOLElBQUksRUFBQyxTQUFTLEVBQ2QsU0FBUyxFQUFDLHdCQUF3QixFQUNsQyxLQUFLLEVBQUUsRUFBRSxJQUFJLEVBQUUsTUFBTSxDQUFDLElBQUksRUFBRSxHQUFHLEVBQUUsTUFBTSxDQUFDLEdBQUcsRUFBRTtRQUU3QyxrREFBSyxTQUFTLEVBQUMsK0JBQStCLElBQUUsS0FBSyxDQUFPO1FBQzNELFdBQVcsQ0FBQyxDQUFDLENBQUMsa0RBQUssU0FBUyxFQUFDLHFDQUFxQyxJQUFFLFdBQVcsQ0FBTyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQzFGLEVBQ04sUUFBUSxDQUFDLElBQUksQ0FDZCxDQUFDO0FBQ0osQ0FBQyJ9
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Avatar;
const mailspring_exports_1 = require("mailspring-exports");
// A circle showing a photo when one is available, else initials on a color.
// Sized by the stylesheet, so the same component fits every layout.
function Avatar({ initials, colors, photo, className, title }) {
    const classes = `modern-ui-avatar${photo ? ' modern-ui-avatar--photo' : ''}${className ? ` ${className}` : ''}`;
    if (photo) {
        return (mailspring_exports_1.React.createElement("span", { className: classes, title: title, "aria-hidden": "true" },
            mailspring_exports_1.React.createElement("img", { src: photo, alt: "", draggable: false })));
    }
    return (mailspring_exports_1.React.createElement("span", { className: classes, title: title, "aria-hidden": "true", style: { backgroundColor: colors.background, color: colors.foreground } }, initials));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiQXZhdGFyLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvQXZhdGFyLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQWFBLHlCQXFCQztBQWxDRCwyREFBMkM7QUFXM0MsNEVBQTRFO0FBQzVFLG9FQUFvRTtBQUNwRSxTQUF3QixNQUFNLENBQUMsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLEtBQUssRUFBRSxTQUFTLEVBQUUsS0FBSyxFQUFlO0lBQ3ZGLE1BQU0sT0FBTyxHQUFHLG1CQUFtQixLQUFLLENBQUMsQ0FBQyxDQUFDLDBCQUEwQixDQUFDLENBQUMsQ0FBQyxFQUFFLEdBQ3hFLFNBQVMsQ0FBQyxDQUFDLENBQUMsSUFBSSxTQUFTLEVBQUUsQ0FBQyxDQUFDLENBQUMsRUFDaEMsRUFBRSxDQUFDO0lBQ0gsSUFBSSxLQUFLLEVBQUUsQ0FBQztRQUNWLE9BQU8sQ0FDTCxtREFBTSxTQUFTLEVBQUUsT0FBTyxFQUFFLEtBQUssRUFBRSxLQUFLLGlCQUFjLE1BQU07WUFDeEQsa0RBQUssR0FBRyxFQUFFLEtBQUssRUFBRSxHQUFHLEVBQUMsRUFBRSxFQUFDLFNBQVMsRUFBRSxLQUFLLEdBQUksQ0FDdkMsQ0FDUixDQUFDO0lBQ0osQ0FBQztJQUNELE9BQU8sQ0FDTCxtREFDRSxTQUFTLEVBQUUsT0FBTyxFQUNsQixLQUFLLEVBQUUsS0FBSyxpQkFDQSxNQUFNLEVBQ2xCLEtBQUssRUFBRSxFQUFFLGVBQWUsRUFBRSxNQUFNLENBQUMsVUFBVSxFQUFFLEtBQUssRUFBRSxNQUFNLENBQUMsVUFBVSxFQUFFLElBRXRFLFFBQVEsQ0FDSixDQUNSLENBQUM7QUFDSixDQUFDIn0=
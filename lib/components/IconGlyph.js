"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LucideGlyph = LucideGlyph;
exports.SimpleGlyph = SimpleGlyph;
const mailspring_exports_1 = require("mailspring-exports");
// Draws a bundled icon as inline SVG in `currentColor`. Lucide icons are
// strokes on a 24px grid, Simple Icons a single filled path on the same grid.
// Built with React elements from the generated data, never from HTML strings.
function LucideGlyph({ icon, className }) {
    return (mailspring_exports_1.React.createElement("svg", { className: className, viewBox: "0 0 24 24", fill: "none", stroke: "currentColor", strokeWidth: 2, strokeLinecap: "round", strokeLinejoin: "round", "aria-hidden": "true" }, icon.nodes.map(([tag, attrs], i) => mailspring_exports_1.React.createElement(tag, { key: i, ...attrs }))));
}
function SimpleGlyph({ icon, className }) {
    return (mailspring_exports_1.React.createElement("svg", { className: className, viewBox: "0 0 24 24", fill: "currentColor", "aria-hidden": "true" },
        mailspring_exports_1.React.createElement("path", { d: icon.path })));
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiSWNvbkdseXBoLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL2NvbXBvbmVudHMvSWNvbkdseXBoLnRzeCJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiOztBQU9BLGtDQWVDO0FBRUQsa0NBTUM7QUE5QkQsMkRBQTJDO0FBRzNDLHlFQUF5RTtBQUN6RSw4RUFBOEU7QUFDOUUsOEVBQThFO0FBRTlFLFNBQWdCLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQTRDO0lBQ3ZGLE9BQU8sQ0FDTCxrREFDRSxTQUFTLEVBQUUsU0FBUyxFQUNwQixPQUFPLEVBQUMsV0FBVyxFQUNuQixJQUFJLEVBQUMsTUFBTSxFQUNYLE1BQU0sRUFBQyxjQUFjLEVBQ3JCLFdBQVcsRUFBRSxDQUFDLEVBQ2QsYUFBYSxFQUFDLE9BQU8sRUFDckIsY0FBYyxFQUFDLE9BQU8saUJBQ1YsTUFBTSxJQUVqQixJQUFJLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsR0FBRyxFQUFFLEtBQUssQ0FBQyxFQUFFLENBQUMsRUFBRSxFQUFFLENBQUMsMEJBQUssQ0FBQyxhQUFhLENBQUMsR0FBRyxFQUFFLEVBQUUsR0FBRyxFQUFFLENBQUMsRUFBRSxHQUFHLEtBQUssRUFBRSxDQUFDLENBQUMsQ0FDaEYsQ0FDUCxDQUFDO0FBQ0osQ0FBQztBQUVELFNBQWdCLFdBQVcsQ0FBQyxFQUFFLElBQUksRUFBRSxTQUFTLEVBQTRDO0lBQ3ZGLE9BQU8sQ0FDTCxrREFBSyxTQUFTLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBQyxXQUFXLEVBQUMsSUFBSSxFQUFDLGNBQWMsaUJBQWEsTUFBTTtRQUNuRixtREFBTSxDQUFDLEVBQUUsSUFBSSxDQUFDLElBQUksR0FBSSxDQUNsQixDQUNQLENBQUM7QUFDSixDQUFDIn0=
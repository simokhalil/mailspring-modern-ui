"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.widenRootSidebar = widenRootSidebar;
exports.restoreRootSidebarWidth = restoreRootSidebarWidth;
const mailspring_exports_1 = require("mailspring-exports");
// The sheet caps a column at the smallest maxWidth among its components
// (app/src/sheet.tsx, _buildState). AccountSidebar declares 250px, read from a
// CSS variable once when its module loads, before any plugin stylesheet, so
// CSS cannot raise it. With the rail in the same column that 250px would
// include the rail; this gives the column the rail's width on top, so the
// folder list keeps its native range.
//
// The components' own `containerStyles` objects are not mutated: the static
// property is pointed at a copy, and restoreRootSidebarWidth() puts the
// original object back.
const originals = new Map();
function widenRootSidebar(extra, except) {
    const components = mailspring_exports_1.ComponentRegistry.findComponentsMatching({
        location: mailspring_exports_1.WorkspaceStore.Location.RootSidebar,
    });
    for (const component of components) {
        if (component === except || originals.has(component)) {
            continue;
        }
        const styles = component.containerStyles;
        if (styles && typeof styles.maxWidth === 'number') {
            originals.set(component, styles);
            component.containerStyles = { ...styles, maxWidth: styles.maxWidth + extra };
        }
    }
}
function restoreRootSidebarWidth() {
    for (const [component, styles] of originals) {
        component.containerStyles = styles;
    }
    originals.clear();
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoic2lkZWJhci13aWR0aC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9zaWRlYmFyLXdpZHRoLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7O0FBZUEsNENBY0M7QUFFRCwwREFLQztBQXBDRCwyREFBdUU7QUFFdkUsd0VBQXdFO0FBQ3hFLCtFQUErRTtBQUMvRSw0RUFBNEU7QUFDNUUseUVBQXlFO0FBQ3pFLDBFQUEwRTtBQUMxRSxzQ0FBc0M7QUFDdEMsRUFBRTtBQUNGLDRFQUE0RTtBQUM1RSx3RUFBd0U7QUFDeEUsd0JBQXdCO0FBRXhCLE1BQU0sU0FBUyxHQUFHLElBQUksR0FBRyxFQUFZLENBQUM7QUFFdEMsU0FBZ0IsZ0JBQWdCLENBQUMsS0FBYSxFQUFFLE1BQVc7SUFDekQsTUFBTSxVQUFVLEdBQUcsc0NBQWlCLENBQUMsc0JBQXNCLENBQUM7UUFDMUQsUUFBUSxFQUFFLG1DQUFjLENBQUMsUUFBUSxDQUFDLFdBQVc7S0FDOUMsQ0FBQyxDQUFDO0lBQ0gsS0FBSyxNQUFNLFNBQVMsSUFBSSxVQUFVLEVBQUUsQ0FBQztRQUNuQyxJQUFJLFNBQVMsS0FBSyxNQUFNLElBQUksU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLENBQUMsRUFBRSxDQUFDO1lBQ3JELFNBQVM7UUFDWCxDQUFDO1FBQ0QsTUFBTSxNQUFNLEdBQUcsU0FBUyxDQUFDLGVBQWUsQ0FBQztRQUN6QyxJQUFJLE1BQU0sSUFBSSxPQUFPLE1BQU0sQ0FBQyxRQUFRLEtBQUssUUFBUSxFQUFFLENBQUM7WUFDbEQsU0FBUyxDQUFDLEdBQUcsQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLENBQUM7WUFDakMsU0FBUyxDQUFDLGVBQWUsR0FBRyxFQUFFLEdBQUcsTUFBTSxFQUFFLFFBQVEsRUFBRSxNQUFNLENBQUMsUUFBUSxHQUFHLEtBQUssRUFBRSxDQUFDO1FBQy9FLENBQUM7SUFDSCxDQUFDO0FBQ0gsQ0FBQztBQUVELFNBQWdCLHVCQUF1QjtJQUNyQyxLQUFLLE1BQU0sQ0FBQyxTQUFTLEVBQUUsTUFBTSxDQUFDLElBQUksU0FBUyxFQUFFLENBQUM7UUFDNUMsU0FBUyxDQUFDLGVBQWUsR0FBRyxNQUFNLENBQUM7SUFDckMsQ0FBQztJQUNELFNBQVMsQ0FBQyxLQUFLLEVBQUUsQ0FBQztBQUNwQixDQUFDIn0=
import { ComponentRegistry, WorkspaceStore } from 'mailspring-exports';

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

const originals = new Map<any, any>();

export function widenRootSidebar(extra: number, except: any) {
  const components = ComponentRegistry.findComponentsMatching({
    location: WorkspaceStore.Location.RootSidebar,
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

export function restoreRootSidebarWidth() {
  for (const [component, styles] of originals) {
    component.containerStyles = styles;
  }
  originals.clear();
}

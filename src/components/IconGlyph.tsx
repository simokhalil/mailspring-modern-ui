import { React } from 'mailspring-exports';
import { LucideIcon, SimpleIcon } from '../icons/icon-data';

// Draws a bundled icon as inline SVG in `currentColor`. Lucide icons are
// strokes on a 24px grid, Simple Icons a single filled path on the same grid.
// Built with React elements from the generated data, never from HTML strings.

export function LucideGlyph({ icon, className }: { icon: LucideIcon; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {icon.nodes.map(([tag, attrs], i) => React.createElement(tag, { key: i, ...attrs }))}
    </svg>
  );
}

export function SimpleGlyph({ icon, className }: { icon: SimpleIcon; className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d={icon.path} />
    </svg>
  );
}

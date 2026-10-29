import { React, ReactDOM } from 'mailspring-exports';

interface RailTooltipProps {
  id: string;
  anchor: { left: number; top: number } | null;
  title: string;
  description?: string | null;
}

// Rendered into document.body so neither the rail's scroll area nor the sheet
// column clips it. Same approach as Mailspring's own nav rail tooltips.
export default function RailTooltip({ id, anchor, title, description }: RailTooltipProps) {
  if (!anchor) {
    return null;
  }
  return ReactDOM.createPortal(
    <div
      id={id}
      role="tooltip"
      className="modern-ui-rail-tooltip"
      style={{ left: anchor.left, top: anchor.top }}
    >
      <div className="modern-ui-rail-tooltip__title">{title}</div>
      {description ? <div className="modern-ui-rail-tooltip__description">{description}</div> : null}
    </div>,
    document.body
  );
}

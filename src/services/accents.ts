// Accent color presets. The colors themselves live in styles/accents.less as
// CSS custom properties on `body.modern-ui-accent-<id>`; this list drives the
// settings UI. test/styles.test.js checks that both stay in sync.

export interface AccentPreset {
  id: string;
  color: string;
  hover: string;
}

export const ACCENT_PRESETS: AccentPreset[] = [
  { id: 'turquoise', color: '#27B8C7', hover: '#1DA6B5' },
  { id: 'blue', color: '#3B82F6', hover: '#2563EB' },
  { id: 'indigo', color: '#6366F1', hover: '#4F46E5' },
  { id: 'violet', color: '#8B5CF6', hover: '#7C3AED' },
  { id: 'pink', color: '#EC4899', hover: '#DB2777' },
  { id: 'orange', color: '#F97316', hover: '#EA580C' },
  { id: 'green', color: '#10B981', hover: '#059669' },
];

export const DEFAULT_ACCENT = 'turquoise';

export function accentPreset(id: string): AccentPreset {
  return ACCENT_PRESETS.find((p) => p.id === id) || ACCENT_PRESETS[0];
}

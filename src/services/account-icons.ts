// Per-account icon customization (setting `accountIcons`). Pure: no Mailspring
// imports, covered by test/services.test.js.
//
// Stored in the plugin's config, keyed by the Mailspring account id (stable
// across launches and reordering), e.g.
//   { "cf55791f": { "icon": "briefcase", "source": "lucide", "backgroundColor": "#27B8C7" } }
// The accounts themselves are never modified.

import { LUCIDE_ICONS, SIMPLE_ICONS, LucideIcon, SimpleIcon } from '../icons/icon-data';
import { initialsFor, sanitizeCssColor, strongColorsFor } from './identity';

export type IconSource = 'lucide' | 'simple-icons';

export interface AccountIconChoice {
  icon?: string;
  source?: IconSource;
  backgroundColor?: string;
}

export type AccountIconMap = { [accountId: string]: AccountIconChoice };

export interface AccountLike {
  id: string;
  provider?: string;
  label?: string;
  emailAddress?: string;
  color?: string;
}

// Background presets offered in the settings. Dark enough for white glyphs.
export const BACKGROUND_PRESETS = [
  '#27B8C7',
  '#04876A',
  '#0F766E',
  '#2563EB',
  '#4F46E5',
  '#7C3AED',
  '#DB2777',
  '#DC2626',
  '#EA580C',
  '#B45309',
  '#475569',
  '#1F2937',
];

// Providers whose logo ships inside Mailspring (static/images/preferences/
// ic-settings-account-<provider>@2x.png). "imap" only has a generic icon, so
// plain IMAP accounts fall back to initials.
export const BUNDLED_PROVIDER_LOGOS = new Set([
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

const lucideById = new Map(LUCIDE_ICONS.map((i) => [i.id, i]));
const simpleById = new Map(SIMPLE_ICONS.map((i) => [i.id, i]));

export function findIcon(source: string, id: string): LucideIcon | SimpleIcon | null {
  if (source === 'lucide') return lucideById.get(id) || null;
  if (source === 'simple-icons') return simpleById.get(id) || null;
  return null;
}

// Keeps only well-formed entries; anything else in config.json (hand edits,
// older formats) is ignored rather than trusted.
export function normalizeAccountIcons(raw: any): AccountIconMap {
  const out: AccountIconMap = {};
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
    return out;
  }
  for (const [accountId, value] of Object.entries(raw)) {
    if (!value || typeof value !== 'object') continue;
    const v = value as any;
    const choice: AccountIconChoice = {};
    if (typeof v.icon === 'string' && (v.source === 'lucide' || v.source === 'simple-icons')) {
      choice.icon = v.icon;
      choice.source = v.source;
    }
    const color = sanitizeCssColor(v.backgroundColor);
    if (color) choice.backgroundColor = color;
    if (choice.icon || choice.backgroundColor) out[accountId] = choice;
  }
  return out;
}

// Readable glyph color on a given background (WCAG relative luminance).
export function foregroundFor(background: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(background || '');
  if (!m) return '#FFFFFF';
  const channel = (i: number) => {
    const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
  };
  const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
  return luminance > 0.45 ? '#1F2937' : '#FFFFFF';
}

export type AccountAppearance =
  | { kind: 'lucide'; icon: LucideIcon; background: string; foreground: string }
  | { kind: 'simple-icons'; icon: SimpleIcon; background: string; foreground: string }
  | { kind: 'provider'; provider: string; background: string | null }
  | { kind: 'initials'; initials: string; background: string; foreground: string };

function accountInitials(account: AccountLike) {
  const label = (account.label || '').trim();
  // A custom label ("Work", "Perso") identifies the account better than the
  // owner's name, which is usually the same for all of them.
  if (label && !label.includes('@')) {
    return initialsFor(label, account.emailAddress);
  }
  return initialsFor(null, account.emailAddress);
}

function automaticBackground(account: AccountLike) {
  // The color picked in Mailspring's Preferences › Accounts, else one derived
  // from the address.
  return (
    sanitizeCssColor(account.color) ||
    strongColorsFor((account.emailAddress || account.id || '').toLowerCase()).background
  );
}

// What the rail draws for an account:
//  1. the icon chosen in Preferences › Modern UI, if it still exists in the
//     bundled set (on the chosen color, else the brand color / account color);
//  2. otherwise Mailspring's own logo for the provider, if there is one;
//  3. otherwise initials.
// A chosen color without an icon (or whose icon is gone) still applies.
export function resolveAccountAppearance(
  account: AccountLike,
  choice: AccountIconChoice | null | undefined
): AccountAppearance {
  const chosenColor = choice ? sanitizeCssColor(choice.backgroundColor) : null;
  const icon = choice && choice.icon && choice.source ? findIcon(choice.source, choice.icon) : null;

  if (icon && choice.source === 'lucide') {
    const background = chosenColor || automaticBackground(account);
    return { kind: 'lucide', icon: icon as LucideIcon, background, foreground: foregroundFor(background) };
  }
  if (icon && choice.source === 'simple-icons') {
    const background = chosenColor || (icon as SimpleIcon).hex;
    return {
      kind: 'simple-icons',
      icon: icon as SimpleIcon,
      background,
      foreground: foregroundFor(background),
    };
  }
  if (account.provider && BUNDLED_PROVIDER_LOGOS.has(account.provider)) {
    return { kind: 'provider', provider: account.provider, background: chosenColor };
  }
  const background = chosenColor || automaticBackground(account);
  return { kind: 'initials', initials: accountInitials(account), background, foreground: foregroundFor(background) };
}

function fold(text: string) {
  return text
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase();
}

// Search by name, id or keyword (English and French), accent-insensitive.
export function searchIcons(query: string) {
  const q = fold(query.trim());
  const matches = (haystack: string[]) => !q || haystack.some((h) => fold(h).includes(q));
  return {
    lucide: LUCIDE_ICONS.filter((i) => matches([i.id, i.label, ...i.keywords])),
    simple: SIMPLE_ICONS.filter((i) => matches([i.id, i.label])),
  };
}

// The map to save after editing one account: drops the entry when it no longer
// customizes anything, and entries of accounts that no longer exist.
export function withAccountChoice(
  current: AccountIconMap,
  accountId: string,
  choice: AccountIconChoice | null,
  existingAccountIds: string[]
): AccountIconMap {
  const next: AccountIconMap = {};
  for (const id of existingAccountIds) {
    if (current[id]) next[id] = current[id];
  }
  const cleaned = choice ? normalizeAccountIcons({ x: choice }).x : undefined;
  if (cleaned) {
    next[accountId] = cleaned;
  } else {
    delete next[accountId];
  }
  return next;
}

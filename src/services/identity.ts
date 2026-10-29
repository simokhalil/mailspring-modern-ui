// Pure helpers that turn a name / email address into the initials and colors
// drawn by avatars and account icons. Nothing here touches Mailspring, so it is
// covered by the unit tests in test/.

export interface IdentityColors {
  background: string;
  foreground: string;
}

// FNV-1a, 32 bit. Stable across sessions and machines, so a contact keeps the
// same color everywhere it appears.
export function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

export function identityKey(email: string | null | undefined, name?: string | null): string {
  const key = (email || '').trim().toLowerCase();
  return key || (name || '').trim().toLowerCase() || '?';
}

// Soft background + dark text of the same hue, for the light message list.
export function softColorsFor(key: string): IdentityColors {
  const hue = hashString(key) % 360;
  return {
    background: `hsl(${hue}, 58%, 88%)`,
    foreground: `hsl(${hue}, 45%, 28%)`,
  };
}

// Deep, saturated background + white text, for the dark account rail. Dark
// enough for white initials to stay legible (green comes out near
// rgb(15, 138, 108)).
export function strongColorsFor(key: string): IdentityColors {
  const hue = hashString(key) % 360;
  return {
    background: `hsl(${hue}, 80%, 30%)`,
    foreground: '#FFFFFF',
  };
}

const NAME_NOISE = /["'`()<>[\]{}]/g;

function firstGrapheme(word: string): string {
  // Array.from splits by code point, so emoji and astral characters survive.
  const chars = Array.from(word);
  return chars.length ? chars[0] : '';
}

function isLetterOrDigit(ch: string): boolean {
  return /[\p{L}\p{N}]/u.test(ch);
}

function wordsOf(value: string, separators: RegExp): string[] {
  return value
    .replace(NAME_NOISE, ' ')
    .split(separators)
    .map((w) => w.trim())
    .filter((w) => w.length > 0 && isLetterOrDigit(firstGrapheme(w)));
}

// "Ada Lovelace" -> "AL", "ada.lovelace@x.io" -> "AL", "Amazon" -> "A",
// "ada@x.io" -> "A". Uses the name when it holds letters, else the email's
// local part.
export function initialsFor(name: string | null | undefined, email: string | null | undefined): string {
  let cleanName = (name || '').trim();
  if (cleanName.includes('@')) {
    // Names like "ada@x.io" or "Ada (ada@x.io)" carry no more than the email.
    cleanName = cleanName.replace(/\S+@\S+/g, '').trim();
  }

  let words = wordsOf(cleanName, /\s+/);
  if (words.length === 0) {
    const local = (email || '').split('@')[0] || '';
    words = wordsOf(local, /[\s._+\-]+/);
  }
  if (words.length === 0) {
    return '?';
  }

  const first = firstGrapheme(words[0]);
  const last = words.length > 1 ? firstGrapheme(words[words.length - 1]) : '';
  return (first + last).toLocaleUpperCase();
}

// Accepts a user-chosen account color from Mailspring's preferences ("#rrggbb",
// "rgb(...)", a named color...). Rejects anything that could escape a CSS value.
export function sanitizeCssColor(value: string | null | undefined): string | null {
  const color = (value || '').trim();
  if (!color) {
    return null;
  }
  if (/^#[0-9a-f]{3,8}$/i.test(color)) {
    return color;
  }
  if (/^(rgb|rgba|hsl|hsla)\([0-9.,%\s]+\)$/i.test(color)) {
    return color;
  }
  if (/^[a-z]{3,20}$/i.test(color)) {
    return color;
  }
  return null;
}

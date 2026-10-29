"use strict";
// Pure helpers that turn a name / email address into the initials and colors
// drawn by avatars and account icons. Nothing here touches Mailspring, so it is
// covered by the unit tests in test/.
Object.defineProperty(exports, "__esModule", { value: true });
exports.hashString = hashString;
exports.identityKey = identityKey;
exports.softColorsFor = softColorsFor;
exports.strongColorsFor = strongColorsFor;
exports.initialsFor = initialsFor;
exports.sanitizeCssColor = sanitizeCssColor;
// FNV-1a, 32 bit. Stable across sessions and machines, so a contact keeps the
// same color everywhere it appears.
function hashString(value) {
    let hash = 0x811c9dc5;
    for (let i = 0; i < value.length; i++) {
        hash ^= value.charCodeAt(i);
        hash = Math.imul(hash, 0x01000193);
    }
    return hash >>> 0;
}
function identityKey(email, name) {
    const key = (email || '').trim().toLowerCase();
    return key || (name || '').trim().toLowerCase() || '?';
}
// Soft background + dark text of the same hue, for the light message list.
function softColorsFor(key) {
    const hue = hashString(key) % 360;
    return {
        background: `hsl(${hue}, 58%, 88%)`,
        foreground: `hsl(${hue}, 45%, 28%)`,
    };
}
// Deep, saturated background + white text, for the dark account rail. Dark
// enough for white initials to stay legible (green comes out near
// rgb(15, 138, 108)).
function strongColorsFor(key) {
    const hue = hashString(key) % 360;
    return {
        background: `hsl(${hue}, 80%, 30%)`,
        foreground: '#FFFFFF',
    };
}
const NAME_NOISE = /["'`()<>[\]{}]/g;
function firstGrapheme(word) {
    // Array.from splits by code point, so emoji and astral characters survive.
    const chars = Array.from(word);
    return chars.length ? chars[0] : '';
}
function isLetterOrDigit(ch) {
    return /[\p{L}\p{N}]/u.test(ch);
}
function wordsOf(value, separators) {
    return value
        .replace(NAME_NOISE, ' ')
        .split(separators)
        .map((w) => w.trim())
        .filter((w) => w.length > 0 && isLetterOrDigit(firstGrapheme(w)));
}
// "Ada Lovelace" -> "AL", "ada.lovelace@x.io" -> "AL", "Amazon" -> "A",
// "ada@x.io" -> "A". Uses the name when it holds letters, else the email's
// local part.
function initialsFor(name, email) {
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
function sanitizeCssColor(value) {
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiaWRlbnRpdHkuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9zcmMvc2VydmljZXMvaWRlbnRpdHkudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IjtBQUFBLDZFQUE2RTtBQUM3RSxnRkFBZ0Y7QUFDaEYsc0NBQXNDOztBQVN0QyxnQ0FPQztBQUVELGtDQUdDO0FBR0Qsc0NBTUM7QUFLRCwwQ0FNQztBQXlCRCxrQ0FtQkM7QUFJRCw0Q0FlQztBQWpHRCw4RUFBOEU7QUFDOUUsb0NBQW9DO0FBQ3BDLFNBQWdCLFVBQVUsQ0FBQyxLQUFhO0lBQ3RDLElBQUksSUFBSSxHQUFHLFVBQVUsQ0FBQztJQUN0QixLQUFLLElBQUksQ0FBQyxHQUFHLENBQUMsRUFBRSxDQUFDLEdBQUcsS0FBSyxDQUFDLE1BQU0sRUFBRSxDQUFDLEVBQUUsRUFBRSxDQUFDO1FBQ3RDLElBQUksSUFBSSxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUMsQ0FBQyxDQUFDO1FBQzVCLElBQUksR0FBRyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksRUFBRSxVQUFVLENBQUMsQ0FBQztJQUNyQyxDQUFDO0lBQ0QsT0FBTyxJQUFJLEtBQUssQ0FBQyxDQUFDO0FBQ3BCLENBQUM7QUFFRCxTQUFnQixXQUFXLENBQUMsS0FBZ0MsRUFBRSxJQUFvQjtJQUNoRixNQUFNLEdBQUcsR0FBRyxDQUFDLEtBQUssSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsQ0FBQztJQUMvQyxPQUFPLEdBQUcsSUFBSSxDQUFDLElBQUksSUFBSSxFQUFFLENBQUMsQ0FBQyxJQUFJLEVBQUUsQ0FBQyxXQUFXLEVBQUUsSUFBSSxHQUFHLENBQUM7QUFDekQsQ0FBQztBQUVELDJFQUEyRTtBQUMzRSxTQUFnQixhQUFhLENBQUMsR0FBVztJQUN2QyxNQUFNLEdBQUcsR0FBRyxVQUFVLENBQUMsR0FBRyxDQUFDLEdBQUcsR0FBRyxDQUFDO0lBQ2xDLE9BQU87UUFDTCxVQUFVLEVB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
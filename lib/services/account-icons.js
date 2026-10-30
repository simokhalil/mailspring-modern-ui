"use strict";
// Per-account icon customization (setting `accountIcons`). Pure: no Mailspring
// imports, covered by test/services.test.js.
//
// Stored in the plugin's config, keyed by the Mailspring account id (stable
// across launches and reordering), e.g.
//   { "account-id-1": { "icon": "briefcase", "source": "lucide", "backgroundColor": "#27B8C7" } }
// The accounts themselves are never modified.
Object.defineProperty(exports, "__esModule", { value: true });
exports.BUNDLED_PROVIDER_LOGOS = exports.BACKGROUND_PRESETS = void 0;
exports.findIcon = findIcon;
exports.normalizeAccountIcons = normalizeAccountIcons;
exports.foregroundFor = foregroundFor;
exports.resolveAccountAppearance = resolveAccountAppearance;
exports.searchIcons = searchIcons;
exports.withAccountChoice = withAccountChoice;
const icon_data_1 = require("../icons/icon-data");
const identity_1 = require("./identity");
// Background presets offered in the settings. Dark enough for white glyphs.
exports.BACKGROUND_PRESETS = [
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
exports.BUNDLED_PROVIDER_LOGOS = new Set([
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
const lucideById = new Map(icon_data_1.LUCIDE_ICONS.map((i) => [i.id, i]));
const simpleById = new Map(icon_data_1.SIMPLE_ICONS.map((i) => [i.id, i]));
function findIcon(source, id) {
    if (source === 'lucide')
        return lucideById.get(id) || null;
    if (source === 'simple-icons')
        return simpleById.get(id) || null;
    return null;
}
// Keeps only well-formed entries; anything else in config.json (hand edits,
// older formats) is ignored rather than trusted.
function normalizeAccountIcons(raw) {
    const out = {};
    if (!raw || typeof raw !== 'object' || Array.isArray(raw)) {
        return out;
    }
    for (const [accountId, value] of Object.entries(raw)) {
        if (!value || typeof value !== 'object')
            continue;
        const v = value;
        const choice = {};
        if (typeof v.icon === 'string' && (v.source === 'lucide' || v.source === 'simple-icons')) {
            choice.icon = v.icon;
            choice.source = v.source;
        }
        const color = (0, identity_1.sanitizeCssColor)(v.backgroundColor);
        if (color)
            choice.backgroundColor = color;
        if (choice.icon || choice.backgroundColor)
            out[accountId] = choice;
    }
    return out;
}
// Readable glyph color on a given background (WCAG relative luminance).
function foregroundFor(background) {
    const m = /^#([0-9a-f]{6})$/i.exec(background || '');
    if (!m)
        return '#FFFFFF';
    const channel = (i) => {
        const c = parseInt(m[1].slice(i, i + 2), 16) / 255;
        return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
    };
    const luminance = 0.2126 * channel(0) + 0.7152 * channel(2) + 0.0722 * channel(4);
    return luminance > 0.45 ? '#1F2937' : '#FFFFFF';
}
function accountInitials(account) {
    const label = (account.label || '').trim();
    // A custom label ("Work", "Perso") identifies the account better than the
    // owner's name, which is usually the same for all of them.
    if (label && !label.includes('@')) {
        return (0, identity_1.initialsFor)(label, account.emailAddress);
    }
    return (0, identity_1.initialsFor)(null, account.emailAddress);
}
function automaticBackground(account) {
    // The color picked in Mailspring's Preferences › Accounts, else one derived
    // from the address.
    return ((0, identity_1.sanitizeCssColor)(account.color) ||
        (0, identity_1.strongColorsFor)((account.emailAddress || account.id || '').toLowerCase()).background);
}
// What the rail draws for an account:
//  1. the icon chosen in Preferences › Modern UI, if it still exists in the
//     bundled set (on the chosen color, else the brand color / account color);
//  2. otherwise Mailspring's own logo for the provider, if there is one;
//  3. otherwise initials.
// A chosen color without an icon (or whose icon is gone) still applies.
function resolveAccountAppearance(account, choice) {
    const chosenColor = choice ? (0, identity_1.sanitizeCssColor)(choice.backgroundColor) : null;
    const icon = choice && choice.icon && choice.source ? findIcon(choice.source, choice.icon) : null;
    if (icon && choice.source === 'lucide') {
        const background = chosenColor || automaticBackground(account);
        return { kind: 'lucide', icon: icon, background, foreground: foregroundFor(background) };
    }
    if (icon && choice.source === 'simple-icons') {
        const background = chosenColor || icon.hex;
        return {
            kind: 'simple-icons',
            icon: icon,
            background,
            foreground: foregroundFor(background),
        };
    }
    if (account.provider && exports.BUNDLED_PROVIDER_LOGOS.has(account.provider)) {
        return { kind: 'provider', provider: account.provider, background: chosenColor };
    }
    const background = chosenColor || automaticBackground(account);
    return { kind: 'initials', initials: accountInitials(account), background, foreground: foregroundFor(background) };
}
function fold(text) {
    return text
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .toLowerCase();
}
// Search by name, id or keyword (English and French), accent-insensitive.
function searchIcons(query) {
    const q = fold(query.trim());
    const matches = (haystack) => !q || haystack.some((h) => fold(h).includes(q));
    return {
        lucide: icon_data_1.LUCIDE_ICONS.filter((i) => matches([i.id, i.label, ...i.keywords])),
        simple: icon_data_1.SIMPLE_ICONS.filter((i) => matches([i.id, i.label])),
    };
}
// The map to save after editing one account: drops the entry when it no longer
// customizes anything, and entries of accounts that no longer exist.
function withAccountChoice(current, accountId, choice, existingAccountIds) {
    const next = {};
    for (const id of existingAccountIds) {
        if (current[id])
            next[id] = current[id];
    }
    const cleaned = choice ? normalizeAccountIcons({ x: choice }).x : undefined;
    if (cleaned) {
        next[accountId] = cleaned;
    }
    else {
        delete next[accountId];
    }
    return next;
}
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYWNjb3VudC1pY29ucy5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9zZXJ2aWNlcy9hY2NvdW50LWljb25zLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7QUFBQSwrRUFBK0U7QUFDL0UsNkNBQTZDO0FBQzdDLEVBQUU7QUFDRiw0RUFBNEU7QUFDNUUsd0NBQXdDO0FBQ3hDLGtHQUFrRztBQUNsRyw4Q0FBOEM7OztBQXlEOUMsNEJBSUM7QUFJRCxzREFrQkM7QUFHRCxzQ0FTQztBQWlDRCw0REF5QkM7QUFVRCxrQ0FPQztBQUlELDhDQWlCQztBQTdMRCxrREFBd0Y7QUFDeEYseUNBQTRFO0FBb0I1RSw0RUFBNEU7QUFDL0QsUUFBQSxrQkFBa0IsR0FBRztJQUNoQyxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7SUFDVCxTQUFTO0lBQ1QsU0FBUztJQUNULFNBQVM7Q0FDVixDQUFDO0FBRUYsMkVBQTJFO0FBQzNFLDZFQUE2RTtBQUM3RSw2Q0FBNkM7QUFDaEMsUUFBQSxzQkFBc0IsR0FBRyxJQUFJLEdBQUcsQ0FBQztJQUM1QyxPQUFPO0lBQ1AsV0FBVztJQUNYLFNBQVM7SUFDVCxPQUFPO0lBQ1AsUUFBUTtJQUNSLFVBQVU7SUFDVixLQUFLO0lBQ0wsUUFBUTtJQUNSLEtBQUs7Q0FDTixDQUFDLENBQUM7QUFFSCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyx3QkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztBQUMvRCxNQUFNLFVBQVUsR0FBRyxJQUFJLEdBQUcsQ0FBQyx3QkFBWSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENBQUMsQ0FBQyxDQUFDLENBQUMsRUFBRSxF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
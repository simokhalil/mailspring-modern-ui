#!/usr/bin/env node
// Generates src/icons/icon-data.ts and THIRD_PARTY_NOTICES.md from the
// `lucide-static` and `simple-icons` dev dependencies.
//
// Only the icons listed below are copied into the plugin (a few dozen KB);
// the libraries themselves are never shipped or loaded at runtime. Run with
// `npm run icons` after changing the lists or upgrading either package.
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const lucideDir = path.join(root, 'node_modules', 'lucide-static');
const lucidePkg = require(path.join(lucideDir, 'package.json'));
const lucideNodes = require(path.join(lucideDir, 'icon-nodes.json'));
const lucideTags = require(path.join(lucideDir, 'tags.json'));
const simpleIcons = require('simple-icons');
const simplePkg = require(path.join(root, 'node_modules', 'simple-icons', 'package.json'));

// Lucide icon name -> extra (French) search keywords.
const LUCIDE = {
  mail: ['courrier', 'email', 'e-mail'],
  inbox: ['boîte', 'réception'],
  'at-sign': ['arobase', 'adresse'],
  send: ['envoyer'],
  archive: ['archives'],
  briefcase: ['travail', 'pro', 'boulot'],
  building: ['entreprise', 'bureau', 'société'],
  landmark: ['banque', 'administration', 'impôts'],
  house: ['maison', 'perso', 'personnel', 'home'],
  user: ['moi', 'personnel', 'profil'],
  users: ['famille', 'équipe', 'groupe'],
  handshake: ['clients', 'partenaires', 'affaires'],
  heart: ['cœur', 'coeur', 'amour'],
  star: ['étoile', 'favori'],
  sparkles: ['étincelles', 'magie'],
  crown: ['couronne', 'vip'],
  globe: ['web', 'monde', 'internet'],
  'shopping-cart': ['achats', 'courses', 'panier'],
  'shopping-bag': ['shopping', 'boutique'],
  'credit-card': ['carte', 'paiement'],
  wallet: ['portefeuille', 'argent'],
  'piggy-bank': ['épargne', 'tirelire'],
  receipt: ['factures', 'reçu'],
  'graduation-cap': ['école', 'études', 'université'],
  'book-open': ['lecture', 'livre'],
  code: ['développement', 'dev'],
  terminal: ['console'],
  laptop: ['ordinateur', 'portable'],
  smartphone: ['téléphone', 'mobile'],
  'gamepad-2': ['jeux', 'gaming'],
  'eighth-notes': ['musique', 'music'],
  camera: ['photo', 'appareil'],
  plane: ['voyage', 'avion', 'vacances'],
  car: ['voiture', 'auto'],
  bike: ['vélo'],
  rocket: ['projet', 'startup', 'fusée'],
  coffee: ['café'],
  utensils: ['restaurant', 'cuisine', 'repas'],
  leaf: ['nature', 'feuille', 'écologie'],
  sun: ['soleil', 'été'],
  moon: ['lune', 'nuit'],
  cloud: ['nuage'],
  zap: ['éclair', 'énergie'],
  flame: ['feu', 'flamme'],
  shield: ['sécurité', 'bouclier'],
  lock: ['cadenas', 'privé'],
  key: ['clé', 'clef'],
  bell: ['notifications', 'cloche'],
  calendar: ['agenda', 'calendrier'],
  newspaper: ['newsletter', 'journal', 'actualités'],
  megaphone: ['marketing', 'annonces'],
  tag: ['étiquette', 'promo'],
  gift: ['cadeau'],
  trophy: ['trophée', 'victoire'],
  flag: ['drapeau'],
  anchor: ['ancre'],
  palette: ['art', 'design', 'peinture'],
  wrench: ['outils', 'réparation'],
  stethoscope: ['santé', 'médecin'],
  baby: ['bébé', 'enfant'],
  'paw-print': ['animaux', 'chien', 'chat'],
  dumbbell: ['sport', 'fitness'],
  'life-buoy': ['support', 'aide', 'assistance'],
  hash: ['dièse'],
};

// Simple Icons slugs. Many brands (Microsoft/Outlook, Yahoo, Slack, LinkedIn,
// Amazon...) were removed from Simple Icons at their owners' request; for
// Outlook and Yahoo accounts, Mailspring's own logo remains the default.
const SIMPLE = [
  'gmail',
  'google',
  'googledrive',
  'googlecalendar',
  'icloud',
  'apple',
  'proton',
  'protonmail',
  'tuta',
  'zoho',
  'gmx',
  'thunderbird',
  'hey',
  'mailchimp',
  'github',
  'gitlab',
  'atlassian',
  'notion',
  'trello',
  'figma',
  'discord',
  'telegram',
  'whatsapp',
  'signal',
  'x',
  'facebook',
  'instagram',
  'mastodon',
  'bluesky',
  'youtube',
  'spotify',
  'netflix',
  'paypal',
  'revolut',
  'orange',
  'ovh',
];

const ALLOWED_TAGS = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);

function label(id) {
  const words = id.replace(/-\d+$/, '').split('-');
  const text = words.join(' ');
  return text.charAt(0).toUpperCase() + text.slice(1);
}

const lucide = [];
for (const [id, extra] of Object.entries(LUCIDE)) {
  const nodes = lucideNodes[id];
  if (!nodes) {
    console.warn(`lucide: "${id}" not found, skipped`);
    continue;
  }
  for (const [tag] of nodes) {
    if (!ALLOWED_TAGS.has(tag)) throw new Error(`lucide ${id}: unexpected <${tag}>`);
  }
  lucide.push({
    id,
    label: label(id),
    keywords: [...new Set([...(lucideTags[id] || []), ...extra])],
    nodes,
  });
}

const bySlug = {};
for (const icon of Object.values(simpleIcons)) {
  if (icon && icon.slug) bySlug[icon.slug] = icon;
}
const simple = [];
for (const slug of SIMPLE) {
  const icon = bySlug[slug];
  if (!icon) {
    console.warn(`simple-icons: "${slug}" not found, skipped`);
    continue;
  }
  simple.push({
    id: slug,
    label: icon.title,
    hex: `#${icon.hex}`,
    path: icon.path,
    license: icon.license ? icon.license.type || icon.license.url : null,
    guidelines: icon.guidelines || null,
  });
}

const out = `// GENERATED by scripts/build-icons.js from lucide-static@${lucidePkg.version}
// (ISC) and simple-icons@${simplePkg.version} (CC0-1.0). Do not edit by hand.
// See THIRD_PARTY_NOTICES.md for licenses and trademark notes.

export type LucideNode = [string, { [attr: string]: string }];

export interface LucideIcon {
  id: string;
  label: string;
  keywords: string[];
  nodes: LucideNode[];
}

export interface SimpleIcon {
  id: string;
  label: string;
  hex: string;
  path: string;
}

export const LUCIDE_VERSION = ${JSON.stringify(lucidePkg.version)};
export const SIMPLE_ICONS_VERSION = ${JSON.stringify(simplePkg.version)};

export const LUCIDE_ICONS: LucideIcon[] = ${JSON.stringify(lucide, null, 2)};

export const SIMPLE_ICONS: SimpleIcon[] = ${JSON.stringify(
  simple.map(({ id, label: l, hex, path: p }) => ({ id, label: l, hex, path: p })),
  null,
  2
)};
`;
fs.mkdirSync(path.join(root, 'src', 'icons'), { recursive: true });
fs.writeFileSync(path.join(root, 'src', 'icons', 'icon-data.ts'), out);

// Full license texts ship with the plugin in licenses/.
const lucideLicense = fs.readFileSync(path.join(lucideDir, 'LICENSE'), 'utf8');
const simpleLicense = fs.readFileSync(path.join(root, 'node_modules', 'simple-icons', 'LICENSE.md'), 'utf8');
fs.mkdirSync(path.join(root, 'licenses'), { recursive: true });
fs.writeFileSync(path.join(root, 'licenses', 'lucide-LICENSE.txt'), lucideLicense);
fs.writeFileSync(path.join(root, 'licenses', 'simple-icons-LICENSE.md'), simpleLicense);

// Lucide's LICENSE lists the icons derived from Feather (MIT).
const featherMatch = /derived from the Feather project:\s*\n\s*\n([^\n]+)/.exec(lucideLicense);
const featherIds = new Set(featherMatch ? featherMatch[1].split(',').map((x) => x.trim()) : []);
const fromFeather = lucide.filter((i) => featherIds.has(i.id)).map((i) => i.id);

const notices = `# Third-party notices

mailspring-modern-ui embeds a selection of icons from the projects below,
copied at build time by \`scripts/build-icons.js\` into
\`lib/icons/icon-data.js\`. Nothing is downloaded at runtime. The full license
texts are in the \`licenses/\` folder, distributed with the plugin.

## Lucide — ${lucide.length} icons

- Source: https://lucide.dev/ (package \`lucide-static\` ${lucidePkg.version})
- License: ISC, Copyright (c) Lucide Icons and Contributors.
  Full text: \`licenses/lucide-LICENSE.txt\`.
- ${fromFeather.length} of the included icons are derived from Feather and are
  also under the MIT License, Copyright (c) 2013-present Cole Bemis (same file):
  ${fromFeather.join(', ')}.
- Included icons: ${lucide.map((i) => i.id).join(', ')}.

## Simple Icons — ${simple.length} logos

- Source: https://simpleicons.org/ (package \`simple-icons\` ${simplePkg.version})
- License: CC0 1.0 Universal for the Simple Icons project.
  Full text: \`licenses/simple-icons-LICENSE.md\`. Individual icons may carry
  their own license; those listed in Simple Icons' data are noted below.
- Trademarks: every logo is a trademark of its owner. They are included only so
  users can recognise their own accounts; their use does not imply endorsement.
  See https://github.com/simple-icons/simple-icons/blob/develop/DISCLAIMER.md
  and each brand's guidelines.

| Logo | Slug | License noted by Simple Icons | Brand guidelines |
|---|---|---|---|
${simple
  .map((i) => `| ${i.label} | \`${i.id}\` | ${i.license || '—'} | ${i.guidelines || '—'} |`)
  .join('\n')}
`;
fs.writeFileSync(path.join(root, 'THIRD_PARTY_NOTICES.md'), notices);

const size = fs.statSync(path.join(root, 'src', 'icons', 'icon-data.ts')).size;
console.log(`icons: ${lucide.length} Lucide + ${simple.length} Simple Icons = ${lucide.length + simple.length} (${Math.round(size / 1024)} KB)`);

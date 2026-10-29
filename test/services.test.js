'use strict';
// Unit tests for the pure services (no Mailspring runtime needed).
const test = require('node:test');
const assert = require('node:assert/strict');
const path = require('path');

const lib = (rel) => require(path.resolve(__dirname, '..', 'lib', rel));
const identity = lib('services/identity');
const { pickAvatarContact } = lib('services/avatar-resolver');
const { photoFromVCard, photoFromContactInfo } = lib('services/vcard-photo');
const { folderTitleFor } = lib('services/folder-title');

const PNG = 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';

test('initials: names, emails, unicode and junk', () => {
  assert.equal(identity.initialsFor('Ada Lovelace', 'ada@x.io'), 'AL');
  assert.equal(identity.initialsFor('Jean-Pierre de la Fontaine', null), 'JF');
  assert.equal(identity.initialsFor('Amazon', 'no-reply@amazon.com'), 'A');
  assert.equal(identity.initialsFor('', 'ada.lovelace@x.io'), 'AL');
  assert.equal(identity.initialsFor(null, 'john_doe+news@x.io'), 'JN');
  assert.equal(identity.initialsFor('ada@x.io', 'ada@x.io'), 'A', 'name that is only an email');
  assert.equal(identity.initialsFor('"Élodie Durand"', null), 'ÉD');
  assert.equal(identity.initialsFor('Ülkü (via List)', null), 'ÜL');
  assert.equal(identity.initialsFor('张 伟', null), '张伟');
  assert.equal(identity.initialsFor('', ''), '?');
  assert.equal(identity.initialsFor('---', '...@x.io'), '?');
});

test('colors: deterministic, case-insensitive key, distinct', () => {
  const key = identity.identityKey('Ada@X.io', 'Ada');
  assert.equal(key, 'ada@x.io');
  assert.deepEqual(identity.softColorsFor(key), identity.softColorsFor('ada@x.io'));
  assert.notDeepEqual(identity.softColorsFor('ada@x.io'), identity.softColorsFor('bob@x.io'));
  assert.match(identity.softColorsFor(key).background, /^hsl\(\d+, 58%, 88%\)$/);
  assert.equal(identity.strongColorsFor(key).foreground, '#FFFFFF');
  assert.equal(identity.hashString('abc'), identity.hashString('abc'));
  assert.equal(identity.identityKey('', 'Some List'), 'some list');
});

test('account color sanitizer rejects CSS injection', () => {
  assert.equal(identity.sanitizeCssColor('#27b8c7'), '#27b8c7');
  assert.equal(identity.sanitizeCssColor('rgb(1, 2, 3)'), 'rgb(1, 2, 3)');
  assert.equal(identity.sanitizeCssColor('teal'), 'teal');
  assert.equal(identity.sanitizeCssColor(''), null);
  assert.equal(identity.sanitizeCssColor('red; background: url(x)'), null);
  assert.equal(identity.sanitizeCssColor('url(https://evil)'), null);
});

const me = (name, email) => ({ name, email, isMe: () => true });
const them = (name, email) => ({ name, email, isMe: () => false });

test('avatar: latest sender who is not me', () => {
  const alice = them('Alice', 'alice@x.io');
  const bob = them('Bob', 'bob@x.io');
  const thread = {
    participants: [alice, bob],
    __messages: [
      { from: [alice], to: [me('Me', 'me@x.io')] },
      { from: [me('Me', 'me@x.io')], to: [alice] },
      { from: [bob], to: [alice] },
      { from: [me('Me', 'me@x.io')], to: [bob], draft: true },
    ],
  };
  assert.equal(pickAvatarContact(thread), bob);
});

test('avatar: sent thread shows the recipient', () => {
  const carol = them('Carol', 'carol@x.io');
  const thread = { __messages: [{ from: [me('Me', 'me@x.io')], to: [carol], cc: [] }] };
  assert.equal(pickAvatarContact(thread), carol);
});

test('avatar: falls back to participants, then to me, then null', () => {
  const dan = them('', 'list@lists.x.io');
  assert.equal(pickAvatarContact({ participants: [me('Me', 'me@x.io'), dan] }), dan);
  const self = me('Me', 'me@x.io');
  assert.equal(pickAvatarContact({ __messages: [{ from: [self], to: [self] }], participants: [] }), self);
  assert.equal(pickAvatarContact({ participants: [them('', '')] }), null);
  assert.equal(pickAvatarContact(null), null);
});

test('avatar: injected isMe wins over Contact#isMe', () => {
  const a = them('A', 'a@x.io');
  const b = them('B', 'b@x.io');
  const thread = { __messages: [{ from: [a] }, { from: [b] }] };
  assert.equal(pickAvatarContact(thread, { isMe: (c) => c.email === 'b@x.io' }), a);
});

test('vCard 4.0 data URI photo', () => {
  const vcf = `BEGIN:VCARD\r\nVERSION:4.0\r\nFN:Ada\r\nPHOTO:data:image/png;base64,${PNG}\r\nEND:VCARD`;
  assert.equal(photoFromVCard(vcf), `data:image/png;base64,${PNG}`);
});

test('vCard 3.0 folded base64 photo', () => {
  const folded = `${PNG.slice(0, 30)}\r\n ${PNG.slice(30, 60)}\r\n\t${PNG.slice(60)}`;
  const vcf = `BEGIN:VCARD\nVERSION:3.0\nitem1.PHOTO;ENCODING=b;TYPE=PNG:${folded}\nEND:VCARD`;
  assert.equal(photoFromVCard(vcf), `data:image/png;base64,${PNG}`);
});

test('vCard remote and unsafe photos are ignored', () => {
  assert.equal(photoFromVCard('BEGIN:VCARD\nPHOTO;VALUE=uri:https://x.io/a.jpg\nEND:VCARD'), null);
  assert.equal(photoFromVCard('BEGIN:VCARD\nPHOTO:https://x.io/a.jpg\nEND:VCARD'), null);
  assert.equal(
    photoFromVCard('BEGIN:VCARD\nPHOTO:data:image/svg+xml;base64,PHN2Zz48L3N2Zz4=\nEND:VCARD'),
    null
  );
  const huge = 'A'.repeat(500 * 1024);
  assert.equal(photoFromVCard(`BEGIN:VCARD\nPHOTO:data:image/png;base64,${huge}\nEND:VCARD`), null);
  assert.equal(photoFromVCard(null), null);
});

test('contact info: CardDAV vs Google', () => {
  assert.equal(
    photoFromContactInfo({ vcf: `BEGIN:VCARD\nPHOTO:data:image/png;base64,${PNG}\nEND:VCARD` }),
    `data:image/png;base64,${PNG}`
  );
  assert.equal(
    photoFromContactInfo({ photos: [{ url: 'https://lh3.googleusercontent.com/a' }] }),
    null,
    'remote Google photo never loaded'
  );
  assert.equal(photoFromContactInfo(undefined), null);
});

const ctx = {
  accounts: [
    { id: 'a1', label: 'Work', emailAddress: 'me@work.io' },
    { id: 'a2', label: 'me@home.io', emailAddress: 'me@home.io' },
  ],
  localized: (k) => ({ 'All Accounts': 'Tous les comptes', 'Search Results': 'Résultats de la recherche' }[k] || k),
  localizedRoles: { inbox: 'Boîte de réception', sent: 'Messages envoyés' },
};
const persp = (name, accountIds, categories, role, extra = {}) => ({
  name,
  accountIds,
  categories: () => categories,
  categoriesSharedRole: () => role,
  ...extra,
});

test('title: unified inbox uses the localized role and "All Accounts"', () => {
  const p = persp('Inbox', ['a1', 'a2'], [{ role: 'inbox', path: 'INBOX' }, { role: 'inbox', path: 'INBOX' }], 'inbox');
  assert.deepEqual(folderTitleFor(p, ctx), { title: 'Boîte de réception', subtitle: 'Tous les comptes' });
});

test('title: single-account role folder keeps its server name', () => {
  const p = persp('Envoyés', ['a1'], [{ role: 'sent', path: 'INBOX.Envoyés' }], 'sent');
  assert.deepEqual(folderTitleFor(p, ctx), { title: 'Envoyés', subtitle: 'Work' });
  const inbox = persp('Inbox', ['a2'], [{ role: 'inbox', path: 'INBOX' }], 'inbox');
  assert.deepEqual(folderTitleFor(inbox, ctx), { title: 'Boîte de réception', subtitle: 'me@home.io' });
});

test('title: custom folders, starred/drafts, search, nothing', () => {
  assert.equal(folderTitleFor(persp('Factures 2026', ['a1'], [{ role: null, path: 'Factures 2026' }], null), ctx).title, 'Factures 2026');
  assert.equal(folderTitleFor(persp('Favoris', ['a1', 'a2'], [], null), ctx).title, 'Favoris');
  const search = persp('Searching Inbox', ['a1'], [], null, { searchQuery: 'invoice' });
  assert.deepEqual(folderTitleFor(search, ctx), { title: 'Résultats de la recherche', subtitle: '“invoice”' });
  assert.deepEqual(folderTitleFor(null, ctx), { title: '', subtitle: null });
  const single = { ...ctx, accounts: [ctx.accounts[0]] };
  assert.equal(folderTitleFor(persp('Inbox', ['a1'], [{ role: 'inbox', path: 'INBOX' }], 'inbox'), single).subtitle, null);
});

const icons = lib('services/account-icons');
const iconData = lib('icons/icon-data');

test('icon set: 50 to 100 icons, unique ids, only safe SVG elements', () => {
  const total = iconData.LUCIDE_ICONS.length + iconData.SIMPLE_ICONS.length;
  assert.ok(total >= 50 && total <= 100, `${total} icons`);
  const ids = (list) => list.map((i) => i.id);
  assert.equal(new Set(ids(iconData.LUCIDE_ICONS)).size, iconData.LUCIDE_ICONS.length);
  assert.equal(new Set(ids(iconData.SIMPLE_ICONS)).size, iconData.SIMPLE_ICONS.length);
  const allowed = new Set(['path', 'circle', 'rect', 'line', 'polyline', 'polygon', 'ellipse']);
  for (const icon of iconData.LUCIDE_ICONS) {
    for (const [tag, attrs] of icon.nodes) {
      assert.ok(allowed.has(tag), `${icon.id}: <${tag}>`);
      assert.ok(!Object.keys(attrs).some((a) => /^on/i.test(a) || a === 'href'), `${icon.id}: unsafe attr`);
    }
  }
  for (const icon of iconData.SIMPLE_ICONS) {
    assert.match(icon.hex, /^#[0-9A-F]{6}$/i);
    assert.match(icon.path, /^[MmLlHhVvCcSsQqTtAaZz0-9.,\s-]+$/);
  }
  for (const id of ['briefcase', 'house', 'mail']) assert.ok(icons.findIcon('lucide', id), id);
  assert.ok(icons.findIcon('simple-icons', 'gmail'));
});

test('stored map: malformed entries are dropped, colors sanitized', () => {
  assert.deepEqual(
    icons.normalizeAccountIcons({
      a1: { icon: 'briefcase', source: 'lucide', backgroundColor: '#27B8C7' },
      a2: { icon: 'gmail', source: 'simple-icons' },
      a3: { icon: 'x', source: 'font-awesome', backgroundColor: 'red; x: url(y)' },
      a4: 'nope',
      a5: { backgroundColor: '#04876A' },
    }),
    {
      a1: { icon: 'briefcase', source: 'lucide', backgroundColor: '#27B8C7' },
      a2: { icon: 'gmail', source: 'simple-icons' },
      a5: { backgroundColor: '#04876A' },
    }
  );
  assert.deepEqual(icons.normalizeAccountIcons(null), {});
  assert.deepEqual(icons.normalizeAccountIcons([1, 2]), {});
});

const gmail = { id: 'g1', provider: 'gmail', label: 'me@gmail.com', emailAddress: 'me@gmail.com' };
const imap = { id: 'i1', provider: 'imap', label: 'Perso', emailAddress: 'me@perso.fr' };

test('appearance: chosen icon on chosen, brand or account color', () => {
  const lucide = icons.resolveAccountAppearance(imap, { icon: 'briefcase', source: 'lucide', backgroundColor: '#27B8C7' });
  assert.equal(lucide.kind, 'lucide');
  assert.equal(lucide.icon.id, 'briefcase');
  assert.equal(lucide.background, '#27B8C7');

  const brand = icons.resolveAccountAppearance(imap, { icon: 'gmail', source: 'simple-icons' });
  assert.equal(brand.kind, 'simple-icons');
  assert.equal(brand.background, iconData.SIMPLE_ICONS.find((i) => i.id === 'gmail').hex, 'brand color by default');

  const auto = icons.resolveAccountAppearance(imap, { icon: 'house', source: 'lucide' });
  assert.match(auto.background, /^hsl\(/, 'account color when none chosen');
  const prefColor = icons.resolveAccountAppearance({ ...imap, color: '#112233' }, { icon: 'house', source: 'lucide' });
  assert.equal(prefColor.background, '#112233', 'Mailspring account color first');
});

test('appearance: defaults and fallbacks', () => {
  assert.deepEqual(icons.resolveAccountAppearance(gmail, undefined), { kind: 'provider', provider: 'gmail', background: null });
  const init = icons.resolveAccountAppearance(imap, null);
  assert.equal(init.kind, 'initials');
  assert.equal(init.initials, 'P');

  // An icon that no longer exists in the bundled set: back to the default,
  // keeping the chosen color.
  const gone = icons.resolveAccountAppearance(imap, { icon: 'removed-icon', source: 'lucide', backgroundColor: '#DC2626' });
  assert.equal(gone.kind, 'initials');
  assert.equal(gone.background, '#DC2626');
  const goneLogo = icons.resolveAccountAppearance(gmail, { icon: 'removed', source: 'simple-icons' });
  assert.equal(goneLogo.kind, 'provider');
});

test('appearance: glyph color stays readable', () => {
  assert.equal(icons.foregroundFor('#1F2937'), '#FFFFFF');
  assert.equal(icons.foregroundFor('#27B8C7'), '#FFFFFF');
  assert.equal(icons.foregroundFor('#FFE01B'), '#1F2937', 'light brand yellow gets dark glyph');
  assert.equal(icons.foregroundFor('hsl(1, 2%, 3%)'), '#FFFFFF');
});

test('search: names, English tags, French keywords, accents ignored', () => {
  const ids = (q) => {
    const r = icons.searchIcons(q);
    return [...r.lucide.map((i) => i.id), ...r.simple.map((i) => i.id)];
  };
  assert.ok(ids('travail').includes('briefcase'));
  assert.ok(ids('work').includes('briefcase'));
  assert.ok(ids('ecole').includes('graduation-cap'), 'école without accent');
  assert.ok(ids('GMAIL').includes('gmail'));
  assert.deepEqual(ids('zzzz'), []);
  assert.equal(ids('').length, iconData.LUCIDE_ICONS.length + iconData.SIMPLE_ICONS.length);
});

test('saving one account: keyed by id, empty choices and removed accounts pruned', () => {
  const current = { a1: { icon: 'mail', source: 'lucide' }, gone: { icon: 'x', source: 'simple-icons' } };
  const next = icons.withAccountChoice(current, 'a2', { icon: 'gmail', source: 'simple-icons', backgroundColor: '#EA4335' }, ['a1', 'a2']);
  assert.deepEqual(next, {
    a1: { icon: 'mail', source: 'lucide' },
    a2: { icon: 'gmail', source: 'simple-icons', backgroundColor: '#EA4335' },
  });
  assert.deepEqual(icons.withAccountChoice(next, 'a1', null, ['a1', 'a2']), { a2: next.a2 });
  assert.deepEqual(icons.withAccountChoice(next, 'a1', {}, ['a1', 'a2']), { a2: next.a2 });
  assert.equal(current.gone.icon, 'x', 'input not mutated');
});

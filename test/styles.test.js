'use strict';
// Compiles styles/index.less with the Less version Mailspring 1.26.2 bundles
// and checks it against the settings the plugin exposes.
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');
const less = require('less');

const root = path.resolve(__dirname, '..');
const { ACCENT_PRESETS } = require(path.join(root, 'lib', 'services', 'accents'));
const { AVATAR_SIZES } = require(path.join(root, 'lib', 'settings'));

async function compile() {
  const file = path.join(root, 'styles', 'index.less');
  const out = await less.render(fs.readFileSync(file, 'utf8'), { filename: file });
  return out.css;
}

test('every accent preset has its body class with the same colors', async () => {
  const css = await compile();
  for (const preset of ACCENT_PRESETS) {
    const block = css.match(new RegExp(`body\\.modern-ui-accent-${preset.id} \\{([^}]*)\\}`));
    assert.ok(block, `missing body.modern-ui-accent-${preset.id}`);
    assert.match(block[1], new RegExp(`--modern-ui-accent: ${preset.color}`, 'i'));
    assert.match(block[1], new RegExp(`--modern-ui-accent-hover: ${preset.hover}`, 'i'));
  }
});

test('every avatar size has its body class', async () => {
  const css = await compile();
  for (const px of AVATAR_SIZES) {
    assert.match(css, new RegExp(`body\\.modern-ui-avatar-${px} \\{\\s*--modern-ui-avatar-size: ${px}px`));
  }
});

test('theme rules only apply under their body class', async () => {
  const css = await compile();
  for (const internal of ['.sheet-toolbar', '.account-sidebar', '.list-tabular-item', '#message-list']) {
    const selectors = css
      .split('}')
      .map((block) => block.split('{')[0].trim())
      .filter((sel) => sel.includes(internal) && !sel.startsWith('.column-RootSidebar'));
    for (const sel of selectors) {
      assert.match(sel, /body\.modern-ui-(dark-chrome|light-content)/, `unscoped: ${sel}`);
    }
  }
});

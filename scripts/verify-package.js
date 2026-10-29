#!/usr/bin/env node
// Checks that the folder is a plugin Mailspring 1.26 will load, the way
// app/src/package.ts and package-manager.ts read it. Run after `npm run build`.
'use strict';

const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const errors = [];
const check = (ok, message) => {
  if (!ok) errors.push(message);
};

const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

check(/^[a-zA-Z0-9._-]+$/.test(pkg.name || ''), 'package.json "name" must match /^[a-zA-Z0-9._-]+$/');
check(pkg.engines && pkg.engines.mailspring, 'package.json needs engines.mailspring or Mailspring refuses to activate it');
check(pkg.windowTypes && pkg.windowTypes.default === true, 'windowTypes.default must be true (main window)');
check(!pkg.theme, 'must not be marked as a theme (themes never run code)');

const mainFile = path.join(root, `${pkg.main}.js`);
check(fs.existsSync(mainFile), `entry point ${pkg.main}.js is missing: run npm run build`);
check(fs.existsSync(path.join(root, 'styles', 'index.less')), 'styles/index.less is missing');

// Every source file has a compiled counterpart newer than it.
const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? walk(path.join(dir, e.name)) : [path.join(dir, e.name)]
  );
for (const src of walk(path.join(root, 'src'))) {
  const rel = path.relative(path.join(root, 'src'), src).replace(/\.tsx?$/, '.js');
  const out = path.join(root, 'lib', rel);
  if (!fs.existsSync(out)) {
    check(false, `lib/${rel} missing: run npm run build`);
  } else {
    check(fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs, `lib/${rel} is older than its source: run npm run build`);
  }
}

// The plugin must use Mailspring's React (from mailspring-exports), not bundle
// its own, and must not rely on node_modules (they are not shipped).
const allowed = new Set(['mailspring-exports', 'mailspring-component-kit', 'electron', '@electron/remote', 'path']);
for (const file of walk(path.join(root, 'lib')).filter((f) => f.endsWith('.js'))) {
  const code = fs.readFileSync(file, 'utf8');
  for (const m of code.matchAll(/require\("([^"]+)"\)/g)) {
    const id = m[1];
    check(id.startsWith('.') || allowed.has(id), `${path.relative(root, file)} requires "${id}", which Mailspring does not provide`);
  }
}

// Exports Mailspring calls.
if (fs.existsSync(mainFile)) {
  const code = fs.readFileSync(mainFile, 'utf8');
  for (const name of ['activate', 'deactivate', 'config']) {
    check(new RegExp(`exports\\.${name}\\b`).test(code), `lib/main.js does not export ${name}`);
  }
}

if (errors.length) {
  console.error('Package check failed:\n  - ' + errors.join('\n  - '));
  process.exit(1);
}
console.log(`Package check passed: ${pkg.name}@${pkg.version} (engines.mailspring ${pkg.engines.mailspring})`);

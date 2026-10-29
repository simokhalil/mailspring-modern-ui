#!/bin/sh
# Builds the plugin, checks it, and copies it into Mailspring's plugin folder.
#
#   sh scripts/install.sh           build, check, ask, copy
#   sh scripts/install.sh --link    symlink instead of copy (development)
#   sh scripts/install.sh --yes     do not ask for confirmation
#
# Only the plugin's own folder is written:
#   ~/Library/Application Support/Mailspring/packages/mailspring-modern-ui
# Mailspring itself (the app bundle, your mail data, config.json) is not touched.
set -eu

cd "$(dirname "$0")/.."
NAME="mailspring-modern-ui"
PACKAGES_DIR="${MAILSPRING_PACKAGES_DIR:-$HOME/Library/Application Support/Mailspring/packages}"
TARGET="$PACKAGES_DIR/$NAME"
MODE=copy
ASK=1
for arg in "$@"; do
  case "$arg" in
    --link) MODE=link ;;
    --yes|-y) ASK=0 ;;
    *) echo "Unknown option: $arg" >&2; exit 2 ;;
  esac
done

echo "==> Building"
[ -d node_modules ] || npm install --no-audit --no-fund
npm run --silent rebuild

echo "==> Checking"
npm run --silent lint:less >/dev/null
node scripts/verify-package.js

if [ -e "$TARGET" ] || [ -L "$TARGET" ]; then
  if [ ! -L "$TARGET" ] && ! grep -q "\"name\": \"$NAME\"" "$TARGET/package.json" 2>/dev/null; then
    echo "Refusing to replace $TARGET: it is not a copy of this plugin." >&2
    exit 1
  fi
  ACTION="replace the existing plugin at"
else
  ACTION="install the plugin to"
fi

if [ "$ASK" = 1 ]; then
  printf "This will %s:\n  %s\n(%s mode). Continue? [y/N] " "$ACTION" "$TARGET" "$MODE"
  read -r answer
  case "$answer" in
    y|Y|yes|YES) ;;
    *) echo "Cancelled, nothing changed."; exit 0 ;;
  esac
fi

mkdir -p "$PACKAGES_DIR"
rm -rf "$TARGET"
if [ "$MODE" = link ]; then
  ln -s "$(pwd)" "$TARGET"
else
  mkdir -p "$TARGET"
  cp -R package.json lib styles README.md LICENSE "$TARGET/"
fi
echo "==> Installed to $TARGET"

if pgrep -xq Mailspring; then
  echo "Mailspring is running: quit it (Cmd+Q) and reopen it to load the plugin,"
  echo "or use Developer > Reload in the main window."
else
  echo "Start Mailspring to load the plugin."
fi
echo "To remove it: sh scripts/uninstall.sh"

#!/bin/sh
# Removes the plugin from Mailspring's plugin folder.
#
#   sh scripts/uninstall.sh         ask, then remove
#   sh scripts/uninstall.sh --yes   remove without asking
#
# The plugin keeps no other state: its settings exist only if you added them to
# config.json yourself (keys under "mailspring-modern-ui"), and the notification
# change only lives in memory while Mailspring runs.
set -eu

NAME="mailspring-modern-ui"
PACKAGES_DIR="${MAILSPRING_PACKAGES_DIR:-$HOME/Library/Application Support/Mailspring/packages}"
TARGET="$PACKAGES_DIR/$NAME"
ASK=1
[ "${1:-}" = "--yes" ] || [ "${1:-}" = "-y" ] && ASK=0

if [ ! -e "$TARGET" ] && [ ! -L "$TARGET" ]; then
  echo "Nothing to remove: $TARGET does not exist."
  exit 0
fi

if [ "$ASK" = 1 ]; then
  printf "Remove %s? [y/N] " "$TARGET"
  read -r answer
  case "$answer" in
    y|Y|yes|YES) ;;
    *) echo "Cancelled, nothing changed."; exit 0 ;;
  esac
fi

if [ -L "$TARGET" ]; then
  rm "$TARGET" # only the link; the source folder stays
else
  rm -rf "$TARGET"
fi
echo "Removed $TARGET"
if pgrep -xq Mailspring; then
  echo "Quit and reopen Mailspring to get its original interface back."
fi

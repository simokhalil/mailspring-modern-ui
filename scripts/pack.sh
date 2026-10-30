#!/bin/sh
# Builds the distributable archive:
#   dist/mailspring-modern-ui-<version>.zip         one mailspring-modern-ui/ folder
#   dist/mailspring-modern-ui-<version>.zip.sha256
# Users unzip it and pick the folder in Mailspring > Install a Plugin...
#
#   sh scripts/pack.sh              verify (clean build, LESS, tests, package check), then pack
#   sh scripts/pack.sh --no-verify  pack the current files as they are
#
# Prints the archive path on the last line.
set -eu

cd "$(dirname "$0")/.."
. scripts/dist-files.sh

NAME="mailspring-modern-ui"
VERSION="$(node -p "require('./package.json').version")"
ARCHIVE="dist/$NAME-$VERSION.zip"

if [ "${1:-}" != "--no-verify" ]; then
  npm run --silent verify >&2
fi

STAGE="dist/.stage"
rm -rf "$STAGE" "$ARCHIVE" "$ARCHIVE.sha256"
mkdir -p "$STAGE/$NAME"
# shellcheck disable=SC2086
cp -R $DIST_FILES "$STAGE/$NAME/"
find "$STAGE" -name .DS_Store -delete

(cd "$STAGE" && zip -qrX "../$NAME-$VERSION.zip" "$NAME")
rm -rf "$STAGE"
(cd dist && shasum -a 256 "$NAME-$VERSION.zip" > "$NAME-$VERSION.zip.sha256")

echo "$ARCHIVE"

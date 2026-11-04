#!/usr/bin/env bash
# Refreshes the icons in assets/ from the app repository's docs/icon.png, and
# the plugin logos from their sites.
#
#   scripts/sync-from-app.sh        # expects the app at ../remote-code, or REMOTECODE_APP=/path
set -euo pipefail
cd "$(dirname "$0")/.."

APP="${REMOTECODE_APP:-../remote-code}"
ICON="$APP/docs/icon.png"
[[ -f "$ICON" ]] || { echo "Missing $ICON — set REMOTECODE_APP to the app repository" >&2; exit 1; }

sips -Z 512 "$ICON" --out assets/icon-512.png >/dev/null
sips -Z 180 "$ICON" --out assets/apple-touch-icon.png >/dev/null
sips -Z 64 "$ICON" --out assets/favicon.png >/dev/null
curl -fsS -o assets/plugins/vitrin-logo.svg https://vitrin.ardasnturk.com/assets/logo.svg
curl -fsS -o assets/plugins/promo-icon.png https://promo.ardasnturk.com/assets/icon-512.png
echo "✓ Icons updated from $ICON and the plugin sites"

#!/bin/bash
set -euo pipefail

if [[ $# -ne 1 || -z "$1" ]]; then
  echo "用法：copy-web-assets.sh <App Resources 目錄>" >&2
  exit 64
fi

DESTINATION="$1"
SCRIPT_DIRECTORY="$(cd "$(dirname "$0")" && pwd)"
REPOSITORY_ROOT="$(cd "$SCRIPT_DIRECTORY/../.." && pwd)"
ANDROID_ASSETS="$REPOSITORY_ROOT/android/assets"
PUBLIC_ASSETS="$REPOSITORY_ROOT/public"

test -f "$ANDROID_ASSETS/index.html"
mkdir -p "$DESTINATION" "$DESTINATION/site-assets"

for source in "$ANDROID_ASSETS"/*; do
  if [[ -f "$source" ]]; then
    /bin/cp -f "$source" "$DESTINATION/"
  fi
done

for source in "$PUBLIC_ASSETS"/icon-*.png; do
  /bin/cp -f "$source" "$DESTINATION/site-assets/"
done

for name in home-ui-bg.png home-hero-banner.png kether-clan-logo.png stat-card-silver-frame-filled.png; do
  /bin/cp -f "$PUBLIC_ASSETS/$name" "$DESTINATION/site-assets/$name"
done

/bin/cp -f "$PUBLIC_ASSETS/kether-clan-logo.png" "$DESTINATION/kether-clan-logo.png"
/bin/cp -f "$PUBLIC_ASSETS/home-hero-banner.png" "$DESTINATION/kether-hero-official.png"

echo "KETHER iOS 共用資產已同步至 $DESTINATION"

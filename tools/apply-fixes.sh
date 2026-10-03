#!/bin/bash
# One-time fixer for CodeCrafix HTML pages. Run from the repo root: bash tools/apply-fixes.sh
set -e
cd "$(dirname "$0")/.."
for f in *.html; do
  perl -0pi -e '
    s#<script data-tmly-media-guard="1">.*?</script>\n?##s;
    s#images/hero\.jpg#images/hero-mockup.webp#g;
    s#images/publish\.jpg#images/project-platform.webp#g;
    s#images/custom-dev\.jpg#images/hero-mockup.webp#g;
    s#content="assets/img/og-cover\.png"#content="https://codecrafix.shop/images/hero-mockup.webp"#g;
    s#<link rel="icon" href="assets/img/favicon\.ico"[^>]*>#<link rel="icon" type="image/svg+xml" href="assets/img/logo.svg">#g;
    s#<link rel="icon" type="image/png"[^>]*>\n?##g;
    s#<link rel="apple-touch-icon"[^>]*>\n?##g;
  ' "$f"
done
for f in admin.html deploy-guide.html; do
  grep -q 'noindex' "$f" || perl -0pi -e 's#<meta charset="UTF-8">#<meta charset="UTF-8">\n<meta name="robots" content="noindex,nofollow">#' "$f"
done
echo "Done. HTML pages fixed."
rm -- "$0"

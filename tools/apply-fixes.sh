#!/bin/bash
# Safe to run more than once. Run from repo root:  bash tools/apply-fixes.sh
set -e
cd "$(dirname "$0")/.."
for f in *.html; do
  perl -0pi -e '
    s#<script data-tmly-media-guard="1">.*?</script>\n?##s;
    s#<img src="images/(hero|publish|custom-dev)\.jpg"(?! onerror)#<img src="images/$1.jpg" onerror="this.onerror=null;this.src=\x27images/hero-mockup.webp\x27"#g;
    s#content="assets/img/og-cover\.png"#content="https://codecrafix.shop/images/hero-mockup.webp"#g;
    s#<link rel="icon" href="assets/img/favicon\.ico"[^>]*>#<link rel="icon" type="image/svg+xml" href="assets/img/logo.svg">#g;
    s#<link rel="icon" type="image/png"[^>]*>\n?##g;
    s#<link rel="apple-touch-icon"[^>]*>\n?##g;
    s#\?v=2026\d{4}[a-z]#?v=20261004b#g;
    s#(<link rel="stylesheet" href="assets/css/style\.css[^>]*>)(?!\s*<link rel="stylesheet" href="assets/css/theme-v2)#$1\n<link rel="stylesheet" href="assets/css/theme-v2.css?v=20261004b">#g;
  ' "$f"
done
for f in admin.html deploy-guide.html; do
  grep -q 'noindex' "$f" || perl -0pi -e 's#<meta charset="UTF-8">#<meta charset="UTF-8">\n<meta name="robots" content="noindex,nofollow">#' "$f"
done
echo "Done. HTML pages fixed."

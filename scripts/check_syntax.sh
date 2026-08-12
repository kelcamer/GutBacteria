#!/usr/bin/env bash
# Real JS syntax check for gut-flora-atlas.html's <script> content, using
# JavaScriptCore's CLI (ships with macOS, not on PATH, no node/deno needed).
#
# This is authoritative, not a heuristic: `new Function(src)` actually
# parses the code (without executing it, so missing DOM/React globals don't
# matter) and throws a real SyntaxError on anything broken. Prefer this over
# any brace/paren-counting checker for the real answer.
#
# Usage: scripts/check_syntax.sh [path-to-html, default gut-flora-atlas.html]

set -euo pipefail

JSC=/System/Library/Frameworks/JavaScriptCore.framework/Versions/A/Helpers/jsc
if [ ! -x "$JSC" ]; then
  echo "jsc not found at $JSC — this script assumes macOS with JavaScriptCore.framework present." >&2
  exit 2
fi

HTML="${1:-gut-flora-atlas.html}"
TMPDIR="$(mktemp -d)"
trap 'rm -rf "$TMPDIR"' EXIT

python3 -c "
data = open('$HTML').read()
s = data.find('<script'); s2 = data.find('>', s) + 1; e = data.find('</script>', s2)
open('$TMPDIR/script.js', 'w').write(data[s2:e])
"

cat > "$TMPDIR/check.js" <<EOF
var src = readFile('$TMPDIR/script.js');
try {
  new Function(src);
  print('SYNTAX_OK');
} catch (e) {
  print('SYNTAX_ERROR: ' + e);
  // jsc's quit(1) exits 0 regardless (a real quirk, tested) - an uncaught
  // throw is the only way to actually get a nonzero process exit code.
  throw e;
}
EOF

"$JSC" "$TMPDIR/check.js"

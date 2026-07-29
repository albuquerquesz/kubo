#!/usr/bin/env bash
# One-shot: browser login + publish create-kubojs, then restore workspace package.json
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
CLI="$ROOT/apps/cli"
cd "$ROOT"

echo "==> Logging in via browser (open the URL npm prints)..."
npm login --auth-type=web --registry https://registry.npmjs.org/
echo "==> Logged in as: $(npm whoami)"

echo "==> Preparing package.json for publish..."
cp "$CLI/package.json" /tmp/create-kubojs-pkg.json.bak
python3 - <<'PY'
import json
from pathlib import Path
p = Path("apps/cli/package.json")
data = json.loads(p.read_text())
data["name"] = "create-kubojs"
for dep in ["@kubojs/types", "@kubojs/template-generator"]:
    if dep in data.get("dependencies", {}):
        data["dependencies"][dep] = f"^{data['version']}"
data["publishConfig"] = {**(data.get("publishConfig") or {}), "access": "public"}
p.write_text(json.dumps(data, indent=2) + "\n")
print(data["name"], data["version"], data["bin"])
PY

echo "==> Building..."
bun run build:cli

echo "==> Publishing create-kubojs..."
cd "$CLI"
npm publish --access public

echo "==> Restoring workspace package.json..."
cp /tmp/create-kubojs-pkg.json.bak "$CLI/package.json"

echo "==> Verify:"
npm view create-kubojs version
npm view create-kubojs bin
echo "Done. bun create kubojs@latest should work."

#!/usr/bin/env bash
# Repair corrupted ETHERFUSE_API_URL line if BASE_URL was glued on.
set -euo pipefail
envf=/home/edgar/remesa-blink/backend/.env
cp "$envf" "$envf.bak.$(date +%s)"
python3 - <<'PY'
from pathlib import Path
p = Path("/home/edgar/remesa-blink/backend/.env")
text = p.read_text(encoding="utf-8", errors="replace")
lines = text.splitlines()
out = []
blinks = None
base = None
for line in lines:
    if "BASE_URL=" in line and line.startswith("ETHERFUSE_API_URL="):
        # e.g. ETHERFUSE_API_URL=https://api.sand.etherfuse.comBASE_URL=https://...
        idx = line.find("BASE_URL=")
        ef = line[:idx]
        base = line[idx:]
        out.append(ef)
        continue
    if line.startswith("BLINKS_BASE_URL="):
        blinks = line
        continue
    if line.startswith("BASE_URL="):
        base = line
        continue
    out.append(line)
# Prefer current tunnel from log if present
tunnel = None
try:
    import re
    log = Path("/tmp/remesa-tunnel-api.log").read_text(errors="replace")
    m = re.findall(r"https://[a-z0-9-]+\.trycloudflare.com", log)
    if m:
        tunnel = m[-1]
except Exception:
    pass
if tunnel:
    out.append(f"BLINKS_BASE_URL={tunnel}")
    out.append(f"BASE_URL={tunnel}")
elif blinks:
    out.append(blinks)
    if base:
        out.append(base)
elif base:
    out.append(base)
# Ensure etherfuse url clean
fixed = []
for line in out:
    if line.startswith("ETHERFUSE_API_URL=") and "BASE_URL=" in line:
        line = line.split("BASE_URL=")[0]
    if line.startswith("ETHERFUSE_API_URL=") and not line.strip().endswith("etherfuse.com"):
        # if truncated oddly, reset sandbox default
        if "api.sand.etherfuse.com" not in line and "api.etherfuse.com" not in line:
            line = "ETHERFUSE_API_URL=https://api.sand.etherfuse.com"
    fixed.append(line)
# Deduplicate keys keeping last
seen = {}
order = []
for line in fixed:
    if not line.strip() or line.strip().startswith("#"):
        order.append(("#", line))
        continue
    if "=" in line:
        k = line.split("=", 1)[0]
        if k not in seen:
            order.append(("k", k))
        seen[k] = line
    else:
        order.append(("r", line))
final = []
emitted = set()
for kind, val in order:
    if kind == "#":
        final.append(val)
    elif kind == "r":
        final.append(val)
    else:
        if val in emitted:
            continue
        final.append(seen[val])
        emitted.add(val)
for k, v in seen.items():
    if k not in emitted:
        final.append(v)
p.write_text("\n".join(final) + "\n", encoding="utf-8")
print("repaired .env")
# print non-secret status
for k in ["ETHERFUSE_API_URL", "BLINKS_BASE_URL", "BASE_URL", "ETHERFUSE_WEBHOOK_SECRET"]:
    v = seen.get(k, "")
    if not v:
        print(f"{k}=missing")
    elif k.endswith("SECRET") or k.endswith("KEY"):
        print(f"{k}=set" if v.split('=',1)[1].strip() else f"{k}=empty")
    else:
        print(v)
PY

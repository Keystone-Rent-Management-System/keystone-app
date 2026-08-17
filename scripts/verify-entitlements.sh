#!/usr/bin/env bash
#
# Assert that a BUILT .app carries the signing identity and keychain
# entitlement it needs. Run in CI on the release archive, and any time a
# signing setting, profile, or bundle identifier changes.
#
# WHY THE BUILT PRODUCT, NOT THE SOURCE .entitlements FILE:
# the source file is an input, not a result. Entitlements are filtered and
# substituted during packaging, and the output can be empty even when the
# input looks correct — this project's simulator builds produce an empty
# entitlement set from the exact same file that yields a correct one on
# device. Only the signature on the product tells you what the app can do.
#
# The failure this guards against is silent: react-native-keychain links,
# registers, exposes its methods, and every read and write fails with
# -34018. Nothing in the JS layer can detect it before a user does.
#
# Usage:
#   scripts/verify-entitlements.sh <path-to.app> [expected-bundle-id] [expected-team-id]
#
# Exit 0 = entitlements present and (if expectations given) matching.
# Exit 1 = entitlements missing or wrong.
# Exit 3 = COULD NOT EXTRACT. Deliberately distinct from exit 1: an
#          extraction failure is not evidence of absence, and reporting it
#          as "carries no entitlements" is exactly the false conclusion
#          this script exists to prevent.

set -uo pipefail

APP="${1:-}"
EXPECTED_BUNDLE_ID="${2:-}"
EXPECTED_TEAM_ID="${3:-}"

if [[ -z "$APP" || ! -d "$APP" ]]; then
  echo "usage: $0 <path-to.app> [expected-bundle-id] [expected-team-id]" >&2
  exit 2
fi

exec /usr/bin/python3 - "$APP" "$EXPECTED_BUNDLE_ID" "$EXPECTED_TEAM_ID" <<'PYTHON'
import plistlib
import re
import subprocess
import sys

app, expected_bundle, expected_team = sys.argv[1], sys.argv[2], sys.argv[3]

MISSING, MISMATCH, UNEXTRACTABLE = 1, 1, 3


def run(args):
    """Return (stdout_bytes, stderr_text, returncode). Never raises."""
    try:
        p = subprocess.run(args, capture_output=True)
        return p.stdout, p.stderr.decode("utf-8", "replace"), p.returncode
    except Exception as exc:  # codesign absent, app unreadable, …
        return b"", str(exc), 127


def parse_plist(raw):
    """XML or binary plist, possibly behind a code-signing blob header."""
    if not raw:
        return None
    try:
        return plistlib.loads(raw)
    except Exception:
        pass
    # Embedded blobs are prefixed with an 8-byte magic+length header.
    for marker in (b"<?xml", b"bplist00"):
        i = raw.find(marker)
        if i > 0:
            try:
                return plistlib.loads(raw[i:])
            except Exception:
                pass
    return None


def parse_der_text(text):
    """
    Parse codesign's DER pretty-printer:

        [Dict]
            [Key] application-identifier
            [Value]
                [String] TEAM.bundle.id
            [Key] keychain-access-groups
            [Value]
                [String] TEAM.bundle.id
                [String] TEAM.other

    Newer toolchains emit this instead of a plist. Reading it is what
    keeps the check working when the ':-' form is unavailable.
    """
    if "[Key]" not in text:
        return None
    out, key = {}, None
    for line in text.splitlines():
        s = line.strip()
        m = re.match(r"^\[Key\]\s+(.*)$", s)
        if m:
            key = m.group(1).strip()
            continue
        m = re.match(r"^\[(String|Bool|Integer)\]\s+(.*)$", s)
        if m and key:
            val = m.group(2).strip()
            if m.group(1) == "Bool":
                val = val.lower() == "true"
            prev = out.get(key)
            if prev is None:
                out[key] = val
            elif isinstance(prev, list):
                prev.append(val)
            else:
                out[key] = [prev, val]
    return out or None


# Try every extraction the toolchain might support. The ':-' form is
# deprecated (and on some toolchains yields nothing at all); the '-' form
# may return a blob or DER text. Absence of a working extractor must NOT
# be reported as absence of entitlements.
attempts = []
ents = None

for args, how in (
    (["codesign", "-d", "--entitlements", ":-", app], "codesign --entitlements :-"),
    (["codesign", "-d", "--entitlements", "-", app], "codesign --entitlements -"),
):
    raw, err, rc = run(args)
    attempts.append(f"{how} (rc={rc}, {len(raw)} bytes)")
    ents = parse_plist(raw)
    if ents is not None:
        break
    ents = parse_der_text(raw.decode("utf-8", "replace"))
    if ents is not None:
        break

if ents is None:
    print(f"CANNOT VERIFY: no extraction method produced entitlements for {app}", file=sys.stderr)
    print("  tried: " + "; ".join(attempts), file=sys.stderr)
    print("  This is NOT proof the app lacks entitlements — it means the check", file=sys.stderr)
    print("  could not read them. Investigate the toolchain before drawing a", file=sys.stderr)
    print("  conclusion. (Cross-check by hand: codesign -d --entitlements - <app>)", file=sys.stderr)
    sys.exit(UNEXTRACTABLE)

app_id = ents.get("application-identifier")
team_id = ents.get("com.apple.developer.team-identifier")
groups = ents.get("keychain-access-groups")
if groups is None:
    groups = []
elif not isinstance(groups, list):
    groups = [groups]

failed = []


def fail(msg):
    failed.append(msg)


if not ents:
    fail("the entitlement set is empty; keychain calls will fail with -34018 at runtime.")
if not app_id:
    fail("application-identifier is missing.")
if not team_id:
    fail("com.apple.developer.team-identifier is missing.")
if not groups:
    fail("keychain-access-groups is missing or empty.")

# With BOTH expectations supplied, require the exact team-prefixed group.
# Checking the bundle suffix and the team separately would accept a group
# carrying the right bundle id under the WRONG team prefix.
if expected_bundle and expected_team:
    required = f"{expected_team}.{expected_bundle}"
    if required not in groups:
        fail(f"keychain-access-groups {groups} does not contain the required exact group '{required}'.")
    if app_id != required:
        fail(f"application-identifier '{app_id}' != expected '{required}'.")
elif expected_bundle:
    if not any(g.endswith("." + expected_bundle) for g in groups):
        fail(f"no keychain-access-group in {groups} matches bundle id '{expected_bundle}'.")
    if not (app_id or "").endswith("." + expected_bundle):
        fail(f"application-identifier '{app_id}' does not end in bundle id '{expected_bundle}'.")

if expected_team and team_id != expected_team:
    fail(f"team-identifier '{team_id}' != expected '{expected_team}'.")

if any("org.reactjs.native.example." in str(v) for v in (app_id, *groups)):
    print("WARN: still using the React Native placeholder bundle id.", file=sys.stderr)
    print("      A release build must not ship this identity.", file=sys.stderr)

if failed:
    for msg in failed:
        print(f"FAIL: {msg}", file=sys.stderr)
    print("--- entitlements found ---", file=sys.stderr)
    for k, v in ents.items():
        print(f"  {k} = {v}", file=sys.stderr)
    sys.exit(MISMATCH)

print(f"OK: application-identifier={app_id} team={team_id} keychain-access-groups={groups}")
PYTHON

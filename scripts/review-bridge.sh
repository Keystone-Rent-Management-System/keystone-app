#!/usr/bin/env bash
# Keystone review bridge — lets the reviewer drive your emulator / simulator.
#
# WHAT THIS DOES
#   Watches review-artifacts/bridge/cmd.txt. When the file changes, it runs the
#   contents as a shell command on THIS Mac, and writes stdout+stderr to
#   review-artifacts/bridge/out.txt. That's it. No network, no daemon, no install.
#
#   Every command it runs is appended to review-artifacts/bridge/history.log so
#   you can see exactly what was executed. Ctrl-C stops it.
#
# WHY
#   The reviewer runs in a cloud sandbox and cannot reach your simulator. It can
#   read and write files in this repo folder. This turns that file access into
#   the ability to run `xcrun simctl` / `adb` / `maestro` on your behalf.
#
# RUN
#   cd ~/WebstormProjects/keystone-app && bash scripts/review-bridge.sh
#
set -uo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
BRIDGE="$ROOT/review-artifacts/bridge"
mkdir -p "$BRIDGE/shots"

CMD="$BRIDGE/cmd.txt"
OUT="$BRIDGE/out.txt"
STATE="$BRIDGE/state.txt"
HIST="$BRIDGE/history.log"

: > "$CMD"
echo "idle" > "$STATE"
touch "$HIST"

hash_of() { shasum -a 256 "$1" 2>/dev/null | awk '{print $1}'; }
LAST="$(hash_of "$CMD")"

echo "=============================================="
echo " Keystone review bridge is LIVE"
echo " repo:    $ROOT"
echo " watching: review-artifacts/bridge/cmd.txt"
echo " log:      review-artifacts/bridge/history.log"
echo " Ctrl-C to stop. Every command is logged."
echo "=============================================="

# Report environment once so the reviewer knows what's available.
{
  echo "### bridge online $(date -u +%Y-%m-%dT%H:%M:%SZ)"
  echo "--- tooling ---"
  for t in xcrun adb maestro node bun; do
    printf '%s: %s\n' "$t" "$(command -v "$t" || echo MISSING)"
  done
  echo "--- booted ios simulators ---"
  xcrun simctl list devices booted 2>&1 | sed 's/^/  /'
  echo "--- adb devices ---"
  adb devices 2>&1 | sed 's/^/  /'
  echo "--- macos ---"
  sw_vers 2>&1 | sed 's/^/  /'
} > "$OUT" 2>&1
echo "ready" > "$STATE"
echo "[bridge] environment report written. Waiting for commands..."

while true; do
  NOW="$(hash_of "$CMD")"
  if [[ "$NOW" != "$LAST" && -s "$CMD" ]]; then
    LAST="$NOW"
    echo "running" > "$STATE"
    {
      echo "=== $(date -u +%Y-%m-%dT%H:%M:%SZ) ==="
      cat "$CMD"
      echo "==="
    } >> "$HIST"
    echo "[bridge] $(date +%H:%M:%S) running:"
    sed 's/^/    | /' "$CMD"
    {
      echo "### exec $(date -u +%Y-%m-%dT%H:%M:%SZ)"
      ( cd "$ROOT" && timeout 600 bash "$CMD" ) 2>&1
      echo "### exit=$?"
    } > "$OUT" 2>&1
    echo "done" > "$STATE"
    echo "[bridge] $(date +%H:%M:%S) done -> review-artifacts/bridge/out.txt"
  fi
  sleep 2
done

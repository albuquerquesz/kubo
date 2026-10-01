#!/usr/bin/env bash
# Wait until npm registry serves pkg@version (indexing can lag minutes after publish).
set -euo pipefail

wait_for_npm_version() {
  local pkg="$1"
  local version="$2"
  local attempts="${3:-36}"
  local delay="${4:-10}"
  local i got

  for i in $(seq 1 "$attempts"); do
    got=$(npm view "$pkg@$version" version 2>/dev/null || true)
    if [ "$got" = "$version" ]; then
      echo "OK $pkg@$got (attempt $i/$attempts)"
      return 0
    fi
    echo "Waiting for $pkg@$version (attempt $i/$attempts, got='${got:-missing}')..."
    sleep "$delay"
  done

  echo "Error: expected $pkg@$version after $attempts attempts (~$((attempts * delay))s)"
  return 1
}

if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
  if [ "$#" -lt 2 ]; then
    echo "Usage: $0 <package> <version> [attempts] [delay_seconds]" >&2
    exit 1
  fi
  wait_for_npm_version "$@"
fi

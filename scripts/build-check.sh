#!/usr/bin/env bash
# Production build in a throwaway copy of the project.
#
# `next dev` and `next build` both write to ./.next; running a build while the
# dev server is up corrupts the dev output (missing routes, dropped CSS,
# unhydrated pages). Building a copy leaves ./.next, tsconfig.json and
# next-env.d.ts untouched, so this is safe to run at any time.
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d "${TMPDIR:-/tmp}/bglobal-build-check.XXXXXX")"
trap 'rm -rf "$TMP"' EXIT
# Real env files are not copied: the check builds with local, throwaway settings.
rsync -a --exclude .next --exclude node_modules --exclude .git --exclude ".env*" --include ".env.example" "$ROOT/" "$TMP/"
ln -s "$ROOT/node_modules" "$TMP/node_modules"
cd "$TMP"
# Stores refuse to run without an explicit backend (no silent fallback); the check uses memory.
ALLOW_MEMORY_STORE=1 AUTH_SECRET=build-check-only ADMIN_BASE_PATH=build-check-0123456789abcdef npx next build

#!/usr/bin/env node
/**
 * Remove transitive entries from package-lock.json that npm 11 occasionally
 * writes without a `version` field. They originate from optional WASM
 * bindings (@oxc-*-wasm32-wasi → @emnapi/{core,runtime}) and are never
 * installed on the platforms we run on, but `npm ci` with stricter npm
 * builds rejects them with "npm error Invalid Version:".
 *
 * Safe to run repeatedly; no-op when the lockfile is already clean.
 *
 * Wired into the `prepare` script so it runs after every `npm install`
 * / `npm ci`, keeping the lockfile self-healing.
 */

import { readFileSync, writeFileSync, existsSync } from 'node:fs'

const LOCK = 'package-lock.json'
if (!existsSync(LOCK)) process.exit(0)

const data = JSON.parse(readFileSync(LOCK, 'utf8'))
const packages = data.packages ?? {}
const removed = []

for (const path of Object.keys(packages)) {
  if (!path) continue
  const pkg = packages[path]
  if (pkg.version == null && pkg.resolved == null) {
    delete packages[path]
    removed.push(path)
  }
}

if (removed.length > 0) {
  writeFileSync(LOCK, JSON.stringify(data, null, 2) + '\n')
  console.warn(`[scrub-lockfile] removed ${removed.length} version-less entries`)
}

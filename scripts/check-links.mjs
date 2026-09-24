#!/usr/bin/env node
/**
 * Static link + asset checker for the Terry AI demo sites.
 *
 * Walks every .html file in the repo and verifies that:
 *   - relative href/src targets exist on disk (directories resolve to index.html)
 *   - in-page "#anchor" links point at an element id in the same document
 *   - cross-document "./page/#anchor" links point at a real id in the target document
 *
 * External URLs (http, https, mailto, tel, data) are intentionally skipped.
 */

import { readdir, readFile, stat } from "node:fs/promises";
import { existsSync } from "node:fs";
import { dirname, join, relative, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");

const SKIP_DIRS = new Set(["node_modules", ".git", "dist", "coverage", ".tmp"]);
const EXTERNAL = /^(?:[a-z][a-z0-9+.-]*:|\/\/)/i;

async function walk(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const files = [];
  for (const entry of entries) {
    if (entry.isDirectory()) {
      if (SKIP_DIRS.has(entry.name)) continue;
      files.push(...(await walk(join(dir, entry.name))));
    } else if (entry.isFile() && entry.name.endsWith(".html")) {
      files.push(join(dir, entry.name));
    }
  }
  return files;
}

function collectIds(html) {
  const ids = new Set();
  const re = /\sid\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    ids.add(match[2] !== undefined ? match[2] : match[3]);
  }
  return ids;
}

function collectRefs(html) {
  const refs = [];
  const re = /\s(?:href|src)\s*=\s*("([^"]*)"|'([^']*)')/gi;
  let match;
  while ((match = re.exec(html)) !== null) {
    const value = (match[2] !== undefined ? match[2] : match[3]).trim();
    if (value) refs.push(value);
  }
  return refs;
}

async function isFile(path) {
  try {
    const info = await stat(path);
    return info.isFile();
  } catch {
    return false;
  }
}

const problems = [];
const htmlFiles = (await walk(root)).sort();

if (htmlFiles.length === 0) {
  problems.push("No HTML files found.");
}

// Cache document ids so cross-document anchors can be checked.
const idCache = new Map();
async function idsFor(file) {
  if (!idCache.has(file)) {
    idCache.set(file, collectIds(await readFile(file, "utf8")));
  }
  return idCache.get(file);
}

for (const file of htmlFiles) {
  const html = await readFile(file, "utf8");
  const relFile = relative(root, file);
  const ids = collectIds(html);
  idCache.set(file, ids);

  for (const ref of collectRefs(html)) {
    if (EXTERNAL.test(ref) || ref.startsWith("#")) {
      if (ref.startsWith("#") && ref.length > 1 && !ids.has(decodeURIComponent(ref.slice(1)))) {
        problems.push(`${relFile}: in-page anchor "${ref}" has no matching id`);
      }
      continue;
    }

    const [pathPart, hash] = ref.split("#");
    const target = resolve(dirname(file), decodeURIComponent(pathPart));

    if (!target.startsWith(root + sep) && target !== root) {
      problems.push(`${relFile}: link "${ref}" escapes the repository root`);
      continue;
    }

    let resolved = target;
    if (existsSync(target) && (await stat(target)).isDirectory()) {
      resolved = join(target, "index.html");
    }

    if (!(await isFile(resolved))) {
      problems.push(`${relFile}: broken link "${ref}" (missing ${relative(root, resolved)})`);
      continue;
    }

    if (hash && resolved.endsWith(".html")) {
      const targetIds = await idsFor(resolved);
      if (!targetIds.has(decodeURIComponent(hash))) {
        problems.push(`${relFile}: link "${ref}" points at a missing id in ${relative(root, resolved)}`);
      }
    }
  }
}

if (problems.length > 0) {
  console.error(`\nLink check failed with ${problems.length} problem(s):\n`);
  for (const problem of problems) console.error(`  - ${problem}`);
  console.error("");
  process.exit(1);
}

console.log(`Link check passed: ${htmlFiles.length} HTML file(s), all internal links and assets resolve.`);

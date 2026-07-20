import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { extname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const requiredFiles = [
  "index.html",
  "assets/preview.css",
  "assets/preview-data.mjs",
  "assets/preview-state.mjs",
  "assets/preview.mjs",
];
const textExtensions = new Set([
  ".html",
  ".css",
  ".js",
  ".mjs",
  ".json",
  ".txt",
]);
const prohibited = [
  ["backend route", /\/api\//i],
  ["network primitive", /\b(fetch|XMLHttpRequest|WebSocket|sendBeacon)\b/],
  ["external URL", /https?:\/\//i],
  [
    "credential field",
    /api[ _-]?key|credential|password|cookie|secret|signature|token/i,
  ],
  ["provider host", /aigcfox|6uss|shitapi|deepseek|agnes/i],
  [
    "production identifier",
    /7539232|omotu1\.my|rueuiohder1\.th|yndsfd5885\.vn|euouiogtfffg1\.br/i,
  ],
];
const prohibitedPaths = [
  ["environment file", /(^|\/)\.env(?:\.|$)/i],
  ["configuration file", /\.(?:ini|toml|ya?ml)$/i],
  ["runtime data file", /\.(?:db|jsonl|log|sqlite|sqlite3)$/i],
];

function walk(rootDir) {
  const files = [];
  for (const entry of readdirSync(rootDir)) {
    const path = join(rootDir, entry);
    if (statSync(path).isDirectory()) files.push(...walk(path));
    else files.push(path);
  }
  return files;
}

export function scanPreviewDirectory(rootDir) {
  const root = resolve(rootDir);
  const findings = [];
  if (!existsSync(root)) return [`missing preview directory: ${root}`];

  for (const required of requiredFiles) {
    if (!existsSync(join(root, required))) {
      findings.push(`missing required file: ${required}`);
    }
  }

  for (const file of walk(root)) {
    const name = relative(root, file).replaceAll("\\", "/");
    for (const [label, pattern] of prohibitedPaths) {
      if (pattern.test(name)) findings.push(`${name}: ${label}`);
    }
    if (!textExtensions.has(extname(file))) continue;
    const content = readFileSync(file, "utf8");
    for (const [label, pattern] of prohibited) {
      if (pattern.test(content)) findings.push(`${name}: ${label}`);
    }
  }

  return findings;
}

export function assertPreviewDirectory(rootDir) {
  const findings = scanPreviewDirectory(rootDir);
  if (findings.length) {
    throw new Error(`Unsafe public preview:\n${findings.join("\n")}`);
  }
}

const invokedPath = process.argv[1] ? resolve(process.argv[1]) : "";
if (invokedPath === fileURLToPath(import.meta.url)) {
  const rootDir = process.argv[2] ?? "public/preview";
  assertPreviewDirectory(rootDir);
  console.log(`Public preview check passed: ${rootDir}`);
}

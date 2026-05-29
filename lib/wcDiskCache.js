import "server-only";

import fs from "fs";
import path from "path";

const CACHE_DIR = path.join(process.cwd(), "data", "api-cache");
const MAX_STALE_MS = 7 * 24 * 60 * 60 * 1000;

function cacheFileName(apiPath) {
  const safe = apiPath.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "_");
  return `${safe}.json`;
}

export function readDiskCache(apiPath) {
  try {
    const filePath = path.join(CACHE_DIR, cacheFileName(apiPath));
    if (!fs.existsSync(filePath)) return null;

    const stat = fs.statSync(filePath);
    const parsed = JSON.parse(fs.readFileSync(filePath, "utf8"));

    return {
      data: parsed.data,
      savedAt: parsed.savedAt ?? stat.mtimeMs,
    };
  } catch {
    return null;
  }
}

export function writeDiskCache(apiPath, data) {
  try {
    fs.mkdirSync(CACHE_DIR, { recursive: true });
    const filePath = path.join(CACHE_DIR, cacheFileName(apiPath));
    fs.writeFileSync(
      filePath,
      JSON.stringify({ savedAt: Date.now(), data }, null, 2),
    );
  } catch {
    // Disk cache is best-effort
  }
}

export function readDiskCacheIfFresh(apiPath, maxAgeMs) {
  const entry = readDiskCache(apiPath);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > maxAgeMs) return null;
  return entry.data;
}

export function readDiskCacheStale(apiPath) {
  const entry = readDiskCache(apiPath);
  if (!entry) return null;
  if (Date.now() - entry.savedAt > MAX_STALE_MS) return null;
  return entry.data;
}

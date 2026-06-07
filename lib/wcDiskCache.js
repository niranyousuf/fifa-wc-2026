import "server-only";

import fs from "fs";
import path from "path";
import { CACHE_MAX_STALE_MS } from "@/lib/cacheConfig";

const CACHE_DIR = path.join(process.cwd(), "data", "api-cache");

function legacyCacheFileName(apiPath) {
  const safe = apiPath.replace(/^\//, "").replace(/[^a-zA-Z0-9]+/g, "_");
  return `${safe}.json`;
}

/** e.g. /teams?tournament=2026 → teams/2026.json */
export function cacheFileRelPath(apiPath) {
  const clean = apiPath.replace(/^\//, "");
  const [segment, query = ""] = clean.split("?");
  const params = new URLSearchParams(query);
  const label =
    params.get("year") ??
    params.get("tournament") ??
    params.get("id") ??
    "index";

  return path.join(segment, `${label}.json`);
}

function readCacheFile(relativePath) {
  try {
    const filePath = path.join(CACHE_DIR, relativePath);
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

export function readDiskCache(apiPath) {
  const folderPath = cacheFileRelPath(apiPath);
  const fromFolder = readCacheFile(folderPath);
  if (fromFolder) return fromFolder;

  return readCacheFile(legacyCacheFileName(apiPath));
}

export function writeDiskCache(apiPath, data) {
  try {
    const relativePath = cacheFileRelPath(apiPath);
    const filePath = path.join(CACHE_DIR, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      JSON.stringify({ savedAt: Date.now(), data }, null, 2),
    );
  } catch {
    // Disk cache is best-effort on serverless; bundled git files still serve reads.
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
  if (Date.now() - entry.savedAt > CACHE_MAX_STALE_MS) return null;
  return entry.data;
}

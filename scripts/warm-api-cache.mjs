#!/usr/bin/env node
/**
 * Fetches core Zafronix endpoints and writes data/api-cache/{teams|standings|matches}/.
 * Run when API quota is available: npm run cache:warm
 *
 * Keys: process.env.ZAFRONIX_API_KEY(S) (CI/Vercel) or .env.local (local dev).
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const envPath = path.join(root, ".env.local");
const year = process.env.WC_YEAR || "2026";
const base = "https://api.zafronix.com/fifa/worldcup/v1";
const paths = [
  `/teams?tournament=${year}`,
  `/standings?year=${year}`,
  `/matches?year=${year}`,
];
const cacheDir = path.join(root, "data", "api-cache");

function cacheFileRelPath(apiPath) {
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

function keysFromEnv() {
  const keys = [];

  if (process.env.ZAFRONIX_API_KEYS) {
    for (const part of process.env.ZAFRONIX_API_KEYS.split(",")) {
      const trimmed = part.trim();
      if (trimmed) keys.push(trimmed);
    }
  }

  const primary = process.env.ZAFRONIX_API_KEY?.trim();
  if (primary && !keys.includes(primary)) {
    keys.unshift(primary);
  }

  return [...new Set(keys)];
}

function keysFromEnvFile() {
  if (!fs.existsSync(envPath)) {
    return [];
  }

  const env = fs.readFileSync(envPath, "utf8");
  const keys = [];

  const listMatch = env.match(/ZAFRONIX_API_KEYS=(.+)/);
  if (listMatch?.[1]) {
    for (const part of listMatch[1].split(",")) {
      const trimmed = part.trim();
      if (trimmed) keys.push(trimmed);
    }
  }

  const primaryMatch = env.match(/ZAFRONIX_API_KEY=(.+)/);
  const primary = primaryMatch?.[1]?.trim();
  if (primary && !keys.includes(primary)) {
    keys.unshift(primary);
  }

  return [...new Set(keys)];
}

function loadApiKeys() {
  const keys = keysFromEnv().length ? keysFromEnv() : keysFromEnvFile();

  if (!keys.length) {
    throw new Error(
      "Set ZAFRONIX_API_KEY or ZAFRONIX_API_KEYS in the environment or .env.local",
    );
  }

  return keys;
}

async function fetchPath(apiKeys, apiPath) {
  let lastStatus = 0;

  for (let index = 0; index < apiKeys.length; index += 1) {
    const apiKey = apiKeys[index];
    let response;
    try {
      response = await fetch(`${base}${apiPath}`, {
        headers: { "X-API-Key": apiKey },
      });
    } catch (error) {
      throw new Error(
        `${apiPath} network error: ${error?.message ?? "fetch failed"}`,
      );
    }

    if (response.ok) {
      return response.json();
    }

    lastStatus = response.status;

    if (response.status === 429 || response.status === 401 || response.status === 403) {
      const retryAfter = response.headers.get("retry-after");
      console.warn(
        `  key ${index + 1}/${apiKeys.length} → ${response.status}${retryAfter ? ` (retry-after: ${retryAfter}s)` : ""}, trying next…`,
      );
      continue;
    }

    break;
  }

  throw new Error(`${apiPath} failed: ${lastStatus || "unknown"} (all keys tried)`);
}

async function main() {
  const apiKeys = loadApiKeys();
  console.log(`Using ${apiKeys.length} API key(s)\n`);
  fs.mkdirSync(cacheDir, { recursive: true });

  for (const apiPath of paths) {
    process.stdout.write(`Fetching ${apiPath}… `);
    const data = await fetchPath(apiKeys, apiPath);
    const relativePath = cacheFileRelPath(apiPath);
    const filePath = path.join(cacheDir, relativePath);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    fs.writeFileSync(
      filePath,
      JSON.stringify({ savedAt: Date.now(), data }, null, 2),
    );
    console.log("ok →", relativePath);
  }

  console.log(
    "\nCache warmed (24h TTL). Push triggers a Vercel deploy with bundled fallback data.",
  );
}

main().catch((error) => {
  console.error(error.message);
  console.error(
    "\nIf you see 429, wait for quota reset or use a new API key from https://api.zafronix.com/signup",
  );
  process.exit(1);
});

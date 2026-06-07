import "server-only";

import {
  CORE_API_CACHE_PATHS,
  CACHE_REVALIDATE_SECONDS,
} from "@/lib/cacheConfig";
import { writeDiskCache } from "@/lib/wcDiskCache";
import {
  getActiveZafronixKeyIndices,
  getZafronixApiKeys,
  markZafronixKeyExhausted,
} from "@/lib/zafronixKeys";

const API_BASE = "https://api.zafronix.com/fifa/worldcup/v1";

async function fetchPath(apiPath) {
  const apiKeys = getZafronixApiKeys();
  if (!apiKeys.length) {
    throw new Error("No Zafronix API keys configured");
  }

  const url = `${API_BASE}${apiPath.startsWith("/") ? apiPath : `/${apiPath}`}`;
  const keyIndices = getActiveZafronixKeyIndices(apiKeys);
  let lastStatus = 0;

  for (const keyIndex of keyIndices) {
    const response = await fetch(url, {
      headers: { "X-API-Key": apiKeys[keyIndex] },
      next: { revalidate: CACHE_REVALIDATE_SECONDS },
    });

    if (response.ok) {
      return response.json();
    }

    lastStatus = response.status;

    if (response.status === 429) {
      markZafronixKeyExhausted(keyIndex, response.headers.get("retry-after"));
      continue;
    }

    if (response.status === 401 || response.status === 403) {
      continue;
    }

    break;
  }

  throw new Error(`${apiPath} failed: ${lastStatus || "unknown"}`);
}

/**
 * Fetch core endpoints and write data/api-cache/{teams|standings|matches}/.
 * @returns {Promise<{ refreshed: string[], failed: { path: string, error: string }[] }>}
 */
export async function refreshAllApiCache() {
  const refreshed = [];
  const failed = [];

  for (const apiPath of CORE_API_CACHE_PATHS) {
    try {
      const data = await fetchPath(apiPath);
      writeDiskCache(apiPath, data);
      refreshed.push(apiPath);
    } catch (error) {
      failed.push({
        path: apiPath,
        error: error?.message ?? "Unknown error",
      });
    }
  }

  return { refreshed, failed };
}

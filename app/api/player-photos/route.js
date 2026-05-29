import fs from "fs";
import path from "path";
import { NextResponse } from "next/server";
import { isValidPlayerPhotoUrl } from "@/lib/playerPhotoLookup";

export const runtime = "nodejs";

const CACHE_PATH = path.join(process.cwd(), "data", "player-photos.json");
const THESPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const PLAYER_ALIASES = {
  Neymar: ["Neymar Jr", "Neymar da Silva Santos Junior"],
  "Neymar Jr": ["Neymar"],
  Casemiro: ["Carlos Henrique Casemiro"],
  "Bruno Guimarães": ["Bruno Guimaraes"],
  "Lucas Paquetá": ["Lucas Paqueta"],
  "Éder Militão": ["Eder Militao"],
  "Edson Álvarez": ["Edson Alvarez"],
  "Vinícius Júnior": ["Vinicius Junior", "Vini Jr"],
};

function readCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) {
      fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
      fs.writeFileSync(CACHE_PATH, JSON.stringify({}, null, 2));
    }
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

function writeCache(cache) {
  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
  fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
}

async function fetchPlayerPhoto(name) {
  const url = `${THESPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(name)}`;
  const response = await fetch(url, { next: { revalidate: 86400 } });
  if (!response.ok) return null;

  const data = await response.json();
  const first = data?.player?.[0];
  return normalizeSportsDbImageUrl(first?.strCutout || first?.strThumb || null);
}

function normalizeLookupName(name) {
  return String(name)
    .replace(/\s*\(captain\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function buildNameVariants(rawName) {
  const base = normalizeLookupName(rawName);
  const ascii = stripDiacritics(base);
  const noPunct = ascii.replace(/[.'’]/g, "");
  const compact = noPunct.replace(/-/g, " ");
  const words = compact.split(" ").filter(Boolean);
  const variants = new Set([base, ascii, noPunct, compact]);

  // Common "First Last" fallback from long names.
  if (words.length >= 2) {
    variants.add(`${words[0]} ${words[words.length - 1]}`);
  }

  const aliasSeed = [base, ascii, rawName];
  for (const key of aliasSeed) {
    const aliases = PLAYER_ALIASES[key];
    if (!aliases) continue;
    for (const alias of aliases) {
      variants.add(alias);
      variants.add(stripDiacritics(alias));
    }
  }

  return [...variants].filter(Boolean);
}

function normalizeSportsDbImageUrl(url) {
  if (!url) return null;
  if (!url.startsWith("http")) return null;
  // Some entries come from www.thesportsdb.com, some from r2 CDN.
  return url.replace("http://", "https://");
}

export async function POST(request) {
  try {
    const body = await request.json();
    const names = Array.isArray(body?.names) ? body.names : [];

    const normalized = names
      .map((name) => (typeof name === "string" ? name.trim() : ""))
      .filter(Boolean)
      .slice(0, 60);

    const cache = readCache();
    const result = {};

    for (const rawName of normalized) {
      const variants = buildNameVariants(rawName);
      const cached =
        (isValidPlayerPhotoUrl(cache[rawName]) && cache[rawName]) ||
        variants.map((name) => cache[name]).find((value) => isValidPlayerPhotoUrl(value));

      if (cached) {
        result[rawName] = cached;
        continue;
      }

      let photo = null;
      for (const name of variants) {
        try {
          photo = await fetchPlayerPhoto(name);
          if (photo) break;
        } catch {
          // Skip failed variant and continue trying others.
        }
      }

      cache[rawName] = photo;
      for (const name of variants) {
        cache[name] = photo;
      }
      result[rawName] = photo;
    }

    writeCache(cache);

    return NextResponse.json({ photos: result });
  } catch (error) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch player photos" },
      { status: 500 },
    );
  }
}


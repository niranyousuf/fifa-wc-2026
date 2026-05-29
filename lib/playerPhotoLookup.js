import fs from "fs";
import path from "path";
import teamCaptainsData from "@/data/team-captains.json";
import { isValidPlayerPhotoUrl } from "@/lib/utils";

export { isValidPlayerPhotoUrl };

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
  "Son Heung-min (captain)": ["Son Heung-min", "Heung-min Son"],
  "Son Heung-min": ["Heung-min Son"],
};

export function readPhotoCache() {
  try {
    if (!fs.existsSync(CACHE_PATH)) return {};
    return JSON.parse(fs.readFileSync(CACHE_PATH, "utf8"));
  } catch {
    return {};
  }
}

export function writePhotoCache(cache) {
  try {
    fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true });
    fs.writeFileSync(CACHE_PATH, JSON.stringify(cache, null, 2));
  } catch {
    // Vercel/serverless: disk is read-only — bundled data/player-photos.json still works.
  }
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

export function buildNameVariants(rawName) {
  const base = normalizeLookupName(rawName);
  const ascii = stripDiacritics(base);
  const noPunct = ascii.replace(/[.'’]/g, "");
  const compact = noPunct.replace(/-/g, " ");
  const words = compact.split(" ").filter(Boolean);
  const variants = new Set([base, ascii, noPunct, compact]);

  if (words.length >= 2) {
    variants.add(`${words[0]} ${words[words.length - 1]}`);
  }

  for (const key of [base, ascii, rawName]) {
    const aliases = PLAYER_ALIASES[key];
    if (!aliases) continue;
    for (const alias of aliases) {
      variants.add(alias);
      variants.add(stripDiacritics(alias));
    }
  }

  return [...variants].filter(Boolean);
}

function normalizeCaptainMatchName(name) {
  return normalizeLookupName(name).toLowerCase();
}

function squadPlayerMatchesName(player, targetName) {
  const target = normalizeCaptainMatchName(targetName);
  const playerName = normalizeCaptainMatchName(player.name);
  return (
    playerName === target ||
    playerName.startsWith(`${target} `) ||
    target.startsWith(`${playerName} `)
  );
}

async function fetchPlayerPhoto(name, teamName) {
  const searchTerms = [name];
  if (teamName) {
    searchTerms.push(`${name} ${teamName}`);
  }

  for (const term of searchTerms) {
    const url = `${THESPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(term)}`;
    const response = await fetch(url, { next: { revalidate: 86400 } });
    if (!response.ok) continue;

    const data = await response.json();
    const players = data?.player ?? [];
    if (!players.length) continue;

    const preferred =
      players.find((entry) => {
        if (!teamName) return false;
        const team = String(entry.strTeam ?? "").toLowerCase();
        const country = teamName.toLowerCase();
        return team.includes(country) || country.includes(team.split(" ")[0]);
      }) ?? players[0];

    const urlOut = preferred?.strCutout || preferred?.strThumb || null;
    if (!urlOut || !urlOut.startsWith("http")) continue;
    return urlOut.replace("http://", "https://");
  }

  return null;
}

function readCachedPhoto(cache, rawName, variants) {
  const candidates = [rawName, ...variants];

  for (const name of candidates) {
    const value = cache[name];
    if (isValidPlayerPhotoUrl(value)) {
      return value;
    }
  }

  return null;
}

export async function resolvePlayerPhoto(rawName, teamName) {
  const variants = buildNameVariants(rawName);
  const cache = readPhotoCache();

  const cached = readCachedPhoto(cache, rawName, variants);
  if (cached) {
    return cached;
  }

  let photo = null;
  for (const name of variants) {
    try {
      photo = await fetchPlayerPhoto(name, teamName);
      if (photo) break;
    } catch {
      // try next variant
    }
  }

  if (photo) {
    cache[rawName] = photo;
    for (const name of variants) {
      cache[name] = photo;
    }
    writePhotoCache(cache);
  }

  return photo;
}

export function findCaptainFromSquad(squad, teamName) {
  if (!Array.isArray(squad) || !squad.length) return null;

  const marked = squad.find(
    (player) => /\(captain\)/i.test(player.name) || player.captain === true,
  );
  if (marked) return marked;

  const fallbackName = teamName
    ? teamCaptainsData.captains?.[teamName]
    : null;

  if (!fallbackName) return null;

  const fromSquad = squad.find((player) =>
    squadPlayerMatchesName(player, fallbackName),
  );
  if (fromSquad) return fromSquad;

  return { name: fallbackName };
}

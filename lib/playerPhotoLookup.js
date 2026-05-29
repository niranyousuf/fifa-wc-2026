import fs from "fs";
import path from "path";
import teamCaptainsData from "@/data/team-captains.json";
import { pickPlayerCutoutPhoto } from "@/lib/playerCutoutPhoto";
import { teamHints } from "@/lib/teamSearchAliases";
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
  "Riyad Mahrez": ["Riyad Mahrez", "Mahrez"],
  "Ryan Mendes": ["Ryan Mendes", "Ryan Mendes da Silva"],
  "Ellyes Skhiri": ["Ellyes Skhiri", "Skhiri"],
  "Diego Godín": ["Diego Godin", "Diego Godín"],
  "Kylian Mbappé": ["Kylian Mbappe", "Mbappe"],
  "Martin Ødegaard": ["Martin Odegaard", "Odegaard"],
  "Hakan Çalhanoğlu": ["Hakan Calhanoglu"],
  "Ladislav Krejčí": ["Ladislav Krejci"],
  "Gustavo Gómez": ["Gustavo Gomez"],
  "Aníbal Godoy": ["Anibal Godoy"],
  "Andy Robertson": ["Andrew Robertson"],
  Rodri: ["Rodrigo Hernandez", "Rodrigo Hernández"],
  "Mathew Ryan": ["Mat Ryan", "Matthew Ryan"],
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

function nameMatchScore(playerName, searchName) {
  const a = stripDiacritics(normalizeLookupName(playerName)).toLowerCase();
  const b = stripDiacritics(normalizeLookupName(searchName)).toLowerCase();
  if (a === b) return 24;
  if (a.includes(b) || b.includes(a)) return 18;
  const aLast = a.split(" ").pop();
  const bLast = b.split(" ").pop();
  if (aLast && aLast === bLast) return 12;
  return 0;
}

function scoreNationalPlayer(player, teamName, searchName) {
  let score = nameMatchScore(player.strPlayer, searchName);
  const hints = teamHints(teamName);
  const team = String(player.strTeam ?? "").toLowerCase();
  const nat = String(player.strNationality ?? "").toLowerCase();

  const team2 = String(player.strTeam2 ?? "").toLowerCase();

  for (const hint of hints) {
    if (team.includes(hint) || hint.includes(team.split(" ")[0])) score += 12;
    if (team2.includes(hint) || hint.includes(team2.split(" ")[0])) score += 18;
    if (nat.includes(hint)) score += 10;
    if (team.includes("national")) score += 4;
  }

  if (team.includes("retired") || team.includes("_retired")) score -= 40;

  if (player.strCutout) score += 10;
  else if (player.strRender) score += 4;
  else if (player.strThumb) score += 2;

  return score;
}

async function lookupSportsDbPlayer(idPlayer) {
  const response = await fetch(
    `${THESPORTSDB_BASE}/lookupplayer.php?id=${idPlayer}`,
    {
      headers: { "User-Agent": "fifa-wc-2026/1.0" },
      next: { revalidate: 86400 },
    },
  );
  if (!response.ok) return null;

  const text = await response.text();
  if (!text.trim().startsWith("{")) return null;

  try {
    const data = JSON.parse(text);
    return data?.players?.[0] ?? null;
  } catch {
    return null;
  }
}

async function fetchPlayerPhoto(name, teamName) {
  const searchTerms = new Set([name]);
  for (const variant of buildNameVariants(name)) {
    searchTerms.add(variant);
    if (teamName) {
      searchTerms.add(`${variant} ${teamName}`);
      searchTerms.add(`${variant} World Cup`);
    }
  }

  let bestPhoto = null;
  let bestScore = -1;
  const candidateIds = new Set();

  for (const term of searchTerms) {
    const url = `${THESPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(term)}`;
    const response = await fetch(url, {
      headers: { "User-Agent": "fifa-wc-2026/1.0" },
      next: { revalidate: 86400 },
    });
    if (!response.ok) continue;

    const text = await response.text();
    if (!text.trim().startsWith("{")) continue;

    let data;
    try {
      data = JSON.parse(text);
    } catch {
      continue;
    }

    const players = data?.player ?? [];
    if (!players.length) continue;

    for (const player of players) {
      if (player.idPlayer) candidateIds.add(player.idPlayer);

      const score = scoreNationalPlayer(player, teamName, name);
      const photo = pickPlayerCutoutPhoto(player);
      if (photo && score > bestScore) {
        bestScore = score;
        bestPhoto = photo;
      }
    }

    if (bestPhoto && bestScore >= 28) break;
  }

  for (const idPlayer of candidateIds) {
    const full = await lookupSportsDbPlayer(idPlayer);
    if (!full) continue;

    const score = scoreNationalPlayer(full, teamName, name);
    const photo = pickPlayerCutoutPhoto(full);
    if (photo && score > bestScore) {
      bestScore = score;
      bestPhoto = photo;
    }
  }

  return bestPhoto;
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
  const fallbackName = teamName
    ? teamCaptainsData.captains?.[teamName]
    : null;

  if (!Array.isArray(squad) || !squad.length) {
    return fallbackName ? { name: fallbackName } : null;
  }

  const marked = squad.find(
    (player) => /\(captain\)/i.test(player.name) || player.captain === true,
  );
  if (marked) return marked;

  if (!fallbackName) return null;

  const fromSquad = squad.find((player) =>
    squadPlayerMatchesName(player, fallbackName),
  );
  if (fromSquad) return fromSquad;

  return { name: fallbackName };
}

/**
 * Build data/captain-photos.json — bundled captain cutouts for hero banners (Vercel-safe).
 * Run: node scripts/warm-captain-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
const TEAM_SEARCH_ALIASES = {
  "United States": ["United States", "USA", "US"],
  "South Korea": ["South Korea", "Korea Republic", "Korea"],
  "DR Congo": ["DR Congo", "Congo DR", "Democratic Republic of the Congo"],
  "Czech Republic": ["Czech Republic", "Czechia"],
  "Ivory Coast": ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  Turkey: ["Turkey", "Türkiye", "Turkiye"],
  "Cape Verde": ["Cape Verde", "Cabo Verde"],
  "Bosnia and Herzegovina": ["Bosnia and Herzegovina", "Bosnia"],
};

function teamHints(teamName) {
  const aliases = TEAM_SEARCH_ALIASES[teamName] ?? [teamName];
  return [...new Set([teamName, ...aliases].map((t) => t.toLowerCase()))];
}

function pickPlayerCutoutPhoto(player) {
  if (!player) return null;
  return (
    normalizeUrl(player.strCutout) ||
    normalizeUrl(player.strRender) ||
    normalizeUrl(player.strThumb) ||
    null
  );
}

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const THESPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const FETCH_HEADERS = { "User-Agent": "fifa-wc-2026-cache/1.0 (captain-photos)" };
const REQUEST_GAP_MS = 650;

function stripDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeName(name) {
  return String(name)
    .replace(/\s*\(captain\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function buildPlayerVariants(name) {
  const base = normalizeName(name);
  const ascii = stripDiacritics(base);
  const words = ascii.split(" ").filter(Boolean);
  const variants = new Set([base, ascii]);
  if (words.length >= 2) {
    variants.add(`${words[0]} ${words[words.length - 1]}`);
  }
  return [...variants];
}

function nameMatchScore(playerName, searchName) {
  const a = stripDiacritics(normalizeName(playerName)).toLowerCase();
  const b = stripDiacritics(normalizeName(searchName)).toLowerCase();
  if (a === b) return 24;
  if (a.includes(b) || b.includes(a)) return 18;

  const aLast = a.split(" ").pop();
  const bLast = b.split(" ").pop();
  if (aLast && aLast === bLast) return 12;

  return 0;
}

function scorePlayer(player, teamName, searchName) {
  let score = nameMatchScore(player.strPlayer, searchName);
  const hints = teamHints(teamName);
  const team = String(player.strTeam ?? "").toLowerCase();
  const nat = String(player.strNationality ?? "").toLowerCase();

  const team2 = String(player.strTeam2 ?? "").toLowerCase();

  for (const hint of hints) {
    if (!hint) continue;
    if (team.includes(hint) || hint.includes(team.split(" ")[0])) score += 12;
    if (team2.includes(hint) || hint.includes(team2.split(" ")[0])) score += 18;
    if (nat.includes(hint) || hint.includes(nat.split(" ")[0])) score += 10;
    if (team.includes("national")) score += 4;
  }

  if (team.includes("retired") || team.includes("_retired")) score -= 40;

  if (player.strCutout) score += 10;
  else if (player.strRender) score += 4;
  else if (player.strThumb) score += 2;

  return score;
}

function pickBestPlayer(players, teamName, searchName) {
  if (!players?.length) return null;
  const ranked = [...players].sort(
    (a, b) =>
      scorePlayer(b, teamName, searchName) - scorePlayer(a, teamName, searchName),
  );
  return ranked[0] ?? null;
}

function normalizeUrl(url) {
  if (!url || !String(url).startsWith("http")) return null;
  return String(url).replace("http://", "https://");
}

async function fetchJson(url, retries = 6) {
  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, { headers: FETCH_HEADERS });
      if (!response.ok) {
        await sleep(REQUEST_GAP_MS * (attempt + 2));
        continue;
      }

      const text = await response.text();
      if (!text.trim().startsWith("{")) {
        await sleep(REQUEST_GAP_MS * (attempt + 2));
        continue;
      }

      return JSON.parse(text);
    } catch {
      await sleep(REQUEST_GAP_MS * (attempt + 2));
    }
  }

  return null;
}

const PLAYER_SEARCH_ALIASES = {
  "Andy Robertson": ["Andrew Robertson"],
  Rodri: ["Rodrigo Hernandez", "Rodrigo Hernández"],
  "Mathew Ryan": ["Mat Ryan", "Matthew Ryan"],
};

function searchAliases(playerName) {
  const extra = PLAYER_SEARCH_ALIASES[playerName] ?? [];
  return [...buildPlayerVariants(playerName), ...extra.flatMap(buildPlayerVariants)];
}

async function lookupPlayer(idPlayer) {
  const data = await fetchJson(
    `${THESPORTSDB_BASE}/lookupplayer.php?id=${idPlayer}`,
  );
  return data?.players?.[0] ?? null;
}

async function fetchPhoto(playerName, teamName) {
  const terms = [];
  for (const variant of searchAliases(playerName)) {
    terms.push(variant);
    terms.push(`${variant} ${teamName}`);
    terms.push(`${variant} World Cup`);
  }

  let bestPhoto = null;
  let bestPlayer = null;
  let bestScore = -1;
  const candidateIds = new Set();

  for (const term of terms) {
    const url = `${THESPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(term)}`;
    const data = await fetchJson(url);
    const players = data?.player ?? [];

    for (const player of players) {
      if (player.idPlayer) candidateIds.add(player.idPlayer);
      const score = scorePlayer(player, teamName, playerName);
      const photo = pickPlayerCutoutPhoto(player);
      if (photo && score > bestScore) {
        bestScore = score;
        bestPhoto = photo;
        bestPlayer = player;
      }
    }

    if (bestPhoto && bestScore >= 28) {
      break;
    }

    await sleep(REQUEST_GAP_MS);
  }

  for (const idPlayer of candidateIds) {
    const full = await lookupPlayer(idPlayer);
    if (!full) continue;

    const score = scorePlayer(full, teamName, playerName);
    const photo = pickPlayerCutoutPhoto(full);
    if (photo && score > bestScore) {
      bestScore = score;
      bestPhoto = photo;
      bestPlayer = full;
    }

    await sleep(REQUEST_GAP_MS);
  }

  return bestPhoto;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function loadCaptainNames() {
  const tournamentPath = path.join(
    ROOT,
    "data/api-cache/teams_tournament_2026.json",
  );
  const fallbackPath = path.join(ROOT, "data/team-captains.json");
  const photoCachePath = path.join(ROOT, "data/player-photos.json");
  const captainBundlePath = path.join(ROOT, "data/captain-photos.json");
  const overridesPath = path.join(ROOT, "data/captain-photo-overrides.json");

  const teams = JSON.parse(fs.readFileSync(tournamentPath, "utf8")).data;
  const fallbacks = JSON.parse(fs.readFileSync(fallbackPath, "utf8")).captains;
  const photoCache = fs.existsSync(photoCachePath)
    ? JSON.parse(fs.readFileSync(photoCachePath, "utf8"))
    : {};
  const existingBundle = fs.existsSync(captainBundlePath)
    ? JSON.parse(fs.readFileSync(captainBundlePath, "utf8")).captains ?? {}
    : {};
  const overrides = fs.existsSync(overridesPath)
    ? JSON.parse(fs.readFileSync(overridesPath, "utf8")).overrides ?? {}
    : {};

  const out = {};

  for (const team of teams) {
    const teamName = team.name;
    const marked = (team.squad ?? []).find(
      (p) => /\(captain\)/i.test(p.name) || p.captain,
    );
    const captainName = marked
      ? normalizeName(marked.name)
      : fallbacks[teamName]
        ? normalizeName(fallbacks[teamName])
        : null;

    if (!captainName) continue;

    const cacheKeys = [
      captainName,
      `${captainName} (captain)`,
      marked?.name,
    ].filter(Boolean);

    let photo =
      overrides[teamName] ??
      existingBundle[teamName]?.photo ??
      null;

    if (!photo) {
      for (const key of cacheKeys) {
        const cached = photoCache[key];
        if (cached && String(cached).startsWith("http")) {
          photo = cached;
          break;
        }
      }
    }

    out[teamName] = { name: captainName, photo };
  }

  return { captains: out, overrides };
}

async function main() {
  const { captains, overrides } = loadCaptainNames();
  const entries = Object.entries(captains);
  let fetched = 0;

  const onlyMissing = process.argv.includes("--only-missing");
  const forceRefresh = process.argv.includes("--force");

  for (const [teamName, entry] of entries) {
    if (entry.photo && onlyMissing && !forceRefresh) {
      process.stdout.write(`  ✓ ${teamName} (cache)\n`);
      continue;
    }

    if (entry.photo && !onlyMissing && !forceRefresh) {
      process.stdout.write(`  ✓ ${teamName} (cache)\n`);
      continue;
    }

    if (forceRefresh) {
      entry.photo = overrides[teamName] ?? null;
    }

    process.stdout.write(`  … ${teamName} (${entry.name})\n`);
    const photo = await fetchPhoto(entry.name, teamName);
    if (photo) {
      entry.photo = photo;
      fetched += 1;
      process.stdout.write(`  ✓ ${teamName}\n`);
    } else {
      process.stdout.write(`  ✗ ${teamName} — no cutout found\n`);
    }
  }

  for (const [teamName, url] of Object.entries(overrides)) {
    if (!captains[teamName] || !url) continue;
    captains[teamName].photo = url;
  }

  const output = {
    note: "Bundled captain photos for hero banners. Regenerate with: npm run cache:captains",
    updatedAt: new Date().toISOString(),
    captains,
  };

  const outPath = path.join(ROOT, "data/captain-photos.json");
  fs.writeFileSync(outPath, JSON.stringify(output, null, 2));

  const withPhoto = Object.values(captains).filter((c) => c.photo).length;
  console.log(`\nWrote ${outPath}`);
  console.log(`${withPhoto}/${entries.length} teams have photos (${fetched} newly fetched).`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});

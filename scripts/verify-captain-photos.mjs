/**
 * Verify bundled captain cutouts against TheSportsDB search.
 * Run: node scripts/verify-captain-photos.mjs
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const THESPORTSDB_BASE = "https://www.thesportsdb.com/api/v1/json/123";
const FETCH_HEADERS = { "User-Agent": "fifa-wc-2026-verify/1.0" };
const GAP_MS = 400;

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

const PLAYER_SEARCH_ALIASES = {
  "Andy Robertson": ["Andrew Robertson"],
  Rodri: ["Rodrigo Hernandez", "Rodrigo Hernández"],
  "Mathew Ryan": ["Mat Ryan", "Matthew Ryan"],
};

function teamHints(teamName) {
  const aliases = TEAM_SEARCH_ALIASES[teamName] ?? [teamName];
  return [...new Set([teamName, ...aliases].map((t) => t.toLowerCase()))];
}

function stripDiacritics(text) {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function normalizeName(name) {
  return String(name)
    .replace(/\s*\(captain\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function normalizeUrl(url) {
  if (!url) return null;
  return String(url).replace("http://", "https://").split("?")[0];
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

  return score;
}

function pickCutout(player) {
  return (
    normalizeUrl(player?.strCutout) ||
    normalizeUrl(player?.strRender) ||
    normalizeUrl(player?.strThumb)
  );
}

function buildVariants(name) {
  const base = normalizeName(name);
  const ascii = stripDiacritics(base);
  const words = ascii.split(" ").filter(Boolean);
  const variants = new Set([base, ascii]);
  if (words.length >= 2) variants.add(`${words[0]} ${words[words.length - 1]}`);
  const extra = PLAYER_SEARCH_ALIASES[name] ?? [];
  for (const e of extra) variants.add(e);
  return [...variants];
}

function sleep(ms) {
  return new Promise((r) => setTimeout(r, ms));
}

async function fetchJson(url) {
  const response = await fetch(url, { headers: FETCH_HEADERS });
  if (!response.ok) return null;
  const text = await response.text();
  if (!text.trim().startsWith("{")) return null;
  try {
    return JSON.parse(text);
  } catch {
    return null;
  }
}

async function resolveCaptain(teamName, captainName) {
  const terms = [];
  for (const variant of buildVariants(captainName)) {
    terms.push(variant, `${variant} ${teamName}`);
  }

  let best = null;
  let bestScore = -1;
  const seen = new Set();

  for (const term of terms) {
    const data = await fetchJson(
      `${THESPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(term)}`,
    );
    await sleep(GAP_MS);

    for (const player of data?.player ?? []) {
      if (!player.idPlayer || seen.has(player.idPlayer)) continue;
      seen.add(player.idPlayer);

      const score = scorePlayer(player, teamName, captainName);
      const cutout = pickCutout(player);
      if (cutout && score > bestScore) {
        bestScore = score;
        best = player;
      }
    }

    if (bestScore >= 28) break;
  }

  for (const id of [...seen].slice(0, 8)) {
    const data = await fetchJson(
      `${THESPORTSDB_BASE}/lookupplayer.php?id=${id}`,
    );
    await sleep(GAP_MS);
    const player = data?.players?.[0];
    if (!player) continue;
    const score = scorePlayer(player, teamName, captainName);
    const cutout = pickCutout(player);
    if (cutout && score > bestScore) {
      bestScore = score;
      best = player;
    }
  }

  return { player: best, score: bestScore, cutout: pickCutout(best) };
}

async function findCutoutOwner(teamName, captainName, bundledUrl) {
  const terms = buildVariants(captainName);
  const ownerCandidates = [];

  for (const term of terms.slice(0, 4)) {
    const data = await fetchJson(
      `${THESPORTSDB_BASE}/searchplayers.php?p=${encodeURIComponent(term)}`,
    );
    await sleep(GAP_MS);

    for (const player of data?.player ?? []) {
      if (pickCutout(player) === bundledUrl) {
        ownerCandidates.push(player);
      }
    }
  }

  return ownerCandidates[0] ?? null;
}

const bundle = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/captain-photos.json"), "utf8"),
).captains;
const overrides = JSON.parse(
  fs.readFileSync(path.join(ROOT, "data/captain-photo-overrides.json"), "utf8"),
).overrides;

const issues = [];
const ok = [];
const missing = [];

const teams = Object.keys(bundle).sort();

for (const teamName of teams) {
  const entry = bundle[teamName];
  const captainName = entry.name;
  const bundled =
    normalizeUrl(overrides[teamName]) ?? normalizeUrl(entry.photo);

  if (!bundled) {
    missing.push({ teamName, captainName });
    continue;
  }

  const owner = await findCutoutOwner(teamName, captainName, bundled);
  const resolved = await resolveCaptain(teamName, captainName);

  const ownerName = owner?.strPlayer ?? "?";
  const ownerTeam = owner?.strTeam ?? "?";
  const ownerNat = owner?.strNationality ?? "?";
  const ownerScore = owner
    ? nameMatchScore(owner.strPlayer, captainName)
    : 0;

  const expectedName = resolved.player?.strPlayer ?? "?";
  const expectedTeam = resolved.player?.strTeam ?? "?";
  const expectedCutout = resolved.cutout;
  const urlMatch = expectedCutout === bundled;

  if (owner && ownerScore < 16) {
    issues.push({
      teamName,
      captainName,
      kind: "wrong_player_in_image",
      detail: `Bundled cutout is ${ownerName} (${ownerTeam}, ${ownerNat})`,
      expected: `${captainName} → ${expectedName} (${expectedTeam})`,
      suggested: expectedCutout,
    });
  } else if (!urlMatch && resolved.score >= 22 && expectedCutout) {
    issues.push({
      teamName,
      captainName,
      kind: "better_url_available",
      detail: `Bundled differs from best match (score ${resolved.score})`,
      expected: `${expectedName} (${expectedTeam})`,
      suggested: expectedCutout,
      bundled,
    });
  } else if (resolved.score < 18) {
    issues.push({
      teamName,
      captainName,
      kind: "low_confidence",
      detail: `Best match score ${resolved.score}: ${expectedName} (${expectedTeam})`,
      bundled,
    });
  } else {
    ok.push(teamName);
  }

  console.log(
    `${urlMatch && ownerScore >= 16 ? "OK" : "!!"} ${teamName}: ${captainName}` +
      (owner && ownerScore < 16
        ? ` | image=${ownerName}`
        : "") +
      (!urlMatch && expectedCutout
        ? ` | suggest=${expectedName}`
        : ""),
  );
}

console.log("\n--- Summary ---");
console.log(`OK: ${ok.length}`);
console.log(`Missing photo: ${missing.length}`, missing.map((m) => m.teamName).join(", "));
console.log(`Issues: ${issues.length}`);
for (const issue of issues) {
  console.log("\n", JSON.stringify(issue, null, 2));
}

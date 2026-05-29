import { getTeam, getTeamsList, teamIdFromName } from "@/lib/api";
import { resolveCanonicalTeamName } from "@/lib/teamNames";
import {
  findCaptainFromSquad,
  isValidPlayerPhotoUrl,
  resolvePlayerPhoto,
} from "@/lib/playerPhotoLookup";

const CAPTAIN_CACHE_MS = 24 * 60 * 60 * 1000;
/** @type {Map<string, { value: { name: string | null, photo: string | null }, expiresAt: number }>} */
const captainCache = new Map();

function displayCaptainName(rawName) {
  return String(rawName)
    .replace(/\s*\(captain\)\s*/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export async function getCaptainForTeam(teamName, teams = null) {
  const rosterTeams = teams ?? (await getTeamsList());
  const canonical = resolveCanonicalTeamName(teamName, rosterTeams);
  const now = Date.now();
  const cached = captainCache.get(canonical);

  if (cached && now < cached.expiresAt) {
    return cached.value;
  }

  const data = await getTeam(teamIdFromName(canonical));
  const captainPlayer = findCaptainFromSquad(data.squad, canonical);

  if (!captainPlayer?.name) {
    const empty = { name: null, photo: null };
    captainCache.set(canonical, { value: empty, expiresAt: now + CAPTAIN_CACHE_MS });
    return empty;
  }

  const resolvedPhoto = await resolvePlayerPhoto(captainPlayer.name, canonical);
  const value = {
    name: displayCaptainName(captainPlayer.name),
    photo: isValidPlayerPhotoUrl(resolvedPhoto) ? resolvedPhoto : null,
  };

  captainCache.set(canonical, { value, expiresAt: now + CAPTAIN_CACHE_MS });
  return value;
}

export async function getCaptainsForMatch(homeTeam, awayTeam) {
  const teams = await getTeamsList();

  const [home, away] = await Promise.all([
    getCaptainForTeam(homeTeam, teams),
    getCaptainForTeam(awayTeam, teams),
  ]);

  return { home, away };
}

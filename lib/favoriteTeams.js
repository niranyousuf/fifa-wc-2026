const STORAGE_KEY = "wc2026_favorite_teams";
const TTL_MS = 60 * 24 * 60 * 60 * 1000;

function readPayload() {
  if (typeof window === "undefined") return null;

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;

    const payload = JSON.parse(raw);
    if (!payload?.expiresAt || !Array.isArray(payload.teamIds)) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    if (Date.now() > payload.expiresAt) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }

    return payload;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

export function loadFavoriteTeamIds() {
  return readPayload()?.teamIds ?? [];
}

export function saveFavoriteTeamIds(teamIds) {
  if (typeof window === "undefined") return;

  const payload = {
    teamIds: [...new Set(teamIds)],
    expiresAt: Date.now() + TTL_MS,
    savedAt: Date.now(),
  };

  localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
}

export function toggleFavoriteTeamId(teamId, currentIds) {
  const next = new Set(currentIds);

  if (next.has(teamId)) {
    next.delete(teamId);
  } else {
    next.add(teamId);
  }

  const teamIds = [...next];
  saveFavoriteTeamIds(teamIds);
  return teamIds;
}

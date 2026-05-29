/** Build a stable match detail URL from a Zafronix match id (e.g. 2026-001). */
export function matchDetailPath(matchId) {
  const id = String(matchId ?? "").trim();
  if (!id) return "/hub";
  return `/match/${encodeURIComponent(id)}`;
}

/** Keys this site may write in the visitor's browser (documented on /privacy). */

export const SITE_LOCAL_STORAGE_KEYS = [
  {
    key: "wc2026_favorite_teams",
    purpose: "Starred / favorite national teams for personalized feeds",
    ttl: "60 days (then removed automatically)",
  },
  {
    key: "wc2026_tournament_simulator_v1",
    purpose: "Tournament prediction simulator scores (group + knockout)",
    ttl: "60 days from last save (then removed automatically)",
  },
  {
    key: "theme",
    purpose: "Light or dark colour theme preference",
    ttl: "Until you clear it or use the button below",
  },
];

export const SITE_SESSION_STORAGE_KEYS = [];

export function clearAllSiteBrowserData() {
  if (typeof window === "undefined") return { local: 0, session: 0 };

  let local = 0;
  let session = 0;

  for (const { key } of SITE_LOCAL_STORAGE_KEYS) {
    if (localStorage.getItem(key) !== null) {
      localStorage.removeItem(key);
      local += 1;
    }
  }

  for (const { key } of SITE_SESSION_STORAGE_KEYS) {
    if (sessionStorage.getItem(key) !== null) {
      sessionStorage.removeItem(key);
      session += 1;
    }
  }

  return { local, session };
}

/**
 * Zafronix uses different labels in standings/matches vs the teams roster.
 * Map feed names to canonical team names from GET /teams.
 */
export const TEAM_NAME_ALIASES = {
  Czechia: "Czech Republic",
  "Korea Republic": "South Korea",
  USA: "United States",
  Türkiye: "Turkey",
  Turkiye: "Turkey",
  "Côte d'Ivoire": "Ivory Coast",
  "Cote d'Ivoire": "Ivory Coast",
  "IR Iran": "Iran",
  "Cabo Verde": "Cape Verde",
  "Congo DR": "DR Congo",
};

/**
 * @param {string} name
 * @param {{ name: string }[] | string[]} [teams]
 */
export function resolveCanonicalTeamName(name, teams = []) {
  if (!name) return name;

  if (TEAM_NAME_ALIASES[name]) {
    return TEAM_NAME_ALIASES[name];
  }

  const rosterNames = teams.map((entry) =>
    typeof entry === "string" ? entry : entry.name,
  );

  if (rosterNames.includes(name)) {
    return name;
  }

  const lower = name.toLowerCase();
  const exactInsensitive = rosterNames.find((rosterName) => rosterName.toLowerCase() === lower);
  if (exactInsensitive) {
    return exactInsensitive;
  }

  return name;
}

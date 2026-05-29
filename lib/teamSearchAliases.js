export const TEAM_SEARCH_ALIASES = {
  "United States": ["United States", "USA", "US"],
  "South Korea": ["South Korea", "Korea Republic", "Korea"],
  "DR Congo": ["DR Congo", "Congo DR", "Democratic Republic of the Congo"],
  "Czech Republic": ["Czech Republic", "Czechia"],
  "Ivory Coast": ["Ivory Coast", "Côte d'Ivoire", "Cote d'Ivoire"],
  Turkey: ["Turkey", "Türkiye", "Turkiye"],
  "Cape Verde": ["Cape Verde", "Cabo Verde"],
  "Bosnia and Herzegovina": ["Bosnia and Herzegovina", "Bosnia"],
};

export function teamHints(teamName) {
  const aliases = TEAM_SEARCH_ALIASES[teamName] ?? [teamName];
  return [...new Set([teamName, ...aliases].map((t) => t.toLowerCase()))];
}

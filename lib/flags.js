const PLACEHOLDER_FLAG_PATTERN = /unknown\.svg|placeholder/i;

/** FIFA/home nations not served by Zafronix flag URLs */
const TEAM_FLAG_ISO = {
  England: "gb-eng",
  Scotland: "gb-sct",
  Wales: "gb-wls",
  "Northern Ireland": "gb-nir",
};

export function flagUrlForTeam(team) {
  const apiUrl = team?.flag?.flagUrl;
  if (apiUrl && !PLACEHOLDER_FLAG_PATTERN.test(apiUrl)) {
    return apiUrl;
  }

  const iso =
    TEAM_FLAG_ISO[team?.name] ?? team?.iso ?? team?.flag?.iso ?? null;

  if (iso) {
    return `https://flagcdn.com/w40/${String(iso).toLowerCase()}.png`;
  }

  return null;
}

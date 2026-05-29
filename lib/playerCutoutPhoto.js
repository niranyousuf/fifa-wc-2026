function normalizeUrl(url) {
  if (!url || !String(url).startsWith("http")) return null;
  return String(url).replace("http://", "https://");
}

/** Full-body cutout for hero banners — prefers club kit strCutout from TheSportsDB. */
export function pickPlayerCutoutPhoto(player) {
  if (!player) return null;

  return (
    normalizeUrl(player.strCutout) ||
    normalizeUrl(player.strRender) ||
    normalizeUrl(player.strThumb) ||
    null
  );
}

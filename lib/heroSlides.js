import { isHighVoltageFixture } from "@/lib/highVoltage";
import { isFinished } from "@/lib/utils";

function isUpcomingFixture(fixture) {
  const home = fixture?.teams?.home?.name;
  const away = fixture?.teams?.away?.name;

  if (!home || !away || home === "TBD" || away === "TBD") {
    return false;
  }

  return !isFinished(fixture.fixture?.status?.short);
}

function byKickoff(a, b) {
  return (
    new Date(a.fixture.date).getTime() - new Date(b.fixture.date).getTime()
  );
}

const FAVORITE_BANNER_COUNT = 2;
const HIGH_VOLTAGE_BANNER_COUNT = 2;

export function buildHeroSlides(fixtures, favoriteIds = []) {
  const slides = [{ type: "promo" }];
  const upcoming = fixtures.filter(isUpcomingFixture).sort(byKickoff);
  const usedMatchIds = new Set();
  const favoriteSet = new Set(favoriteIds);

  if (favoriteSet.size > 0) {
    let favoriteCount = 0;

    for (const fixture of upcoming) {
      if (favoriteCount >= FAVORITE_BANNER_COUNT) break;

      const involvesFavorite =
        favoriteSet.has(fixture.teams.home.id) ||
        favoriteSet.has(fixture.teams.away.id);

      if (!involvesFavorite) continue;

      const id = fixture.fixture.id;
      if (usedMatchIds.has(id)) continue;

      slides.push({ type: "match", fixture, variant: "favorite" });
      usedMatchIds.add(id);
      favoriteCount += 1;
    }
  }

  let highVoltageCount = 0;

  for (const fixture of upcoming) {
    if (highVoltageCount >= HIGH_VOLTAGE_BANNER_COUNT) break;

    const id = fixture.fixture.id;
    if (usedMatchIds.has(id)) continue;
    if (!isHighVoltageFixture(fixture)) continue;

    slides.push({ type: "match", fixture, variant: "high-voltage" });
    usedMatchIds.add(id);
    highVoltageCount += 1;
  }

  return slides;
}

export function pickRandomPromoImage(images) {
  if (!images?.length) return null;
  const index = Math.floor(Math.random() * images.length);
  return images[index];
}

/** Stable image per match/fixture — avoids hydration mismatch vs Math.random(). */
export function pickPromoImageForSeed(seed, images) {
  if (!images?.length) return null;

  const value = String(seed);
  let hash = 0;

  for (let i = 0; i < value.length; i += 1) {
    hash = (hash + value.charCodeAt(i)) | 0;
  }

  const index = Math.abs(hash) % images.length;
  return images[index];
}

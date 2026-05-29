import captainPhotosData from "@/data/captain-photos.json";
import captainOverridesData from "@/data/captain-photo-overrides.json";
import { isValidPlayerPhotoUrl } from "@/lib/utils";

/** @type {Record<string, { name: string, photo: string | null }>} */
const BUNDLED = captainPhotosData.captains ?? {};
const OVERRIDES = captainOverridesData.overrides ?? {};

export function getBundledCaptain(teamName) {
  if (!teamName) return null;

  const entry = BUNDLED[teamName];
  const overridePhoto = OVERRIDES[teamName];
  const photo = isValidPlayerPhotoUrl(overridePhoto)
    ? overridePhoto
    : isValidPlayerPhotoUrl(entry?.photo)
      ? entry.photo
      : null;

  if (!entry?.name && !photo) return null;

  return {
    name: entry?.name ?? null,
    photo,
  };
}

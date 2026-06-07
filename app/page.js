import { HomeLandingClient } from "@/components/home/HomeLandingClient";
import promoImages from "@/data/hero-promo-images.json";
import { getHubDataSafe } from "@/lib/api";
import { pickRandomPromoImage } from "@/lib/heroSlides";

export const revalidate = 86400;

export const metadata = {
  title: "Home | FIFA World Cup 2026",
  description: "Your personalized FIFA World Cup 2026 home.",
};

export default async function HomePage() {
  const { fixtures } = await getHubDataSafe();
  const promoImage = pickRandomPromoImage(promoImages.images);

  return (
    <HomeLandingClient fixtures={fixtures} promoImage={promoImage} />
  );
}

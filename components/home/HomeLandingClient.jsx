"use client";

import { HomeHeroSlider } from "@/components/home/HomeHeroSlider";
import { HomeSidebarCountdowns } from "@/components/home/HomeSidebarCountdowns";
import { HomeTournamentFormatSection } from "@/components/home/HomeTournamentFormatSection";
import { HomeUpcomingMatches } from "@/components/home/HomeUpcomingMatches";

export function HomeLandingClient({ fixtures = [], promoImage = null }) {
  return (
    <div className="space-y-8 sm:space-y-10">
      <HomeHeroSlider fixtures={fixtures} promoImage={promoImage} />

      <div className="grid gap-8 lg:grid-cols-2 lg:gap-10">
        <div className="space-y-8">
          <HomeUpcomingMatches fixtures={fixtures} />
        </div>
        <HomeSidebarCountdowns fixtures={fixtures} />
      </div>

      <HomeTournamentFormatSection />
    </div>
  );
}

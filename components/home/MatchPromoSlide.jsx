"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import promoImages from "@/data/hero-promo-images.json";
import { HeroKickoffCountdown } from "@/components/home/HeroKickoffCountdown";
import { HERO_INNER_CONTAINER } from "@/lib/heroBanner";
import { pickPromoImageForSeed } from "@/lib/heroSlides";
import { LocalKickoffDateTime } from "@/components/LocalKickoffDateTime";
import { cn, isValidPlayerPhotoUrl } from "@/lib/utils";

export function MatchPromoSlide({ fixture, variant = "high-voltage" }) {
  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const kickoff = fixture.fixture.date;
  const [captains, setCaptains] = useState({ home: null, away: null });
  const [imageFailed, setImageFailed] = useState(false);

  const background = useMemo(
    () => pickPromoImageForSeed(fixture.fixture.id, promoImages.images),
    [fixture.fixture.id],
  );

  const badgeLabel =
    variant === "favorite" ? "Your team" : "High voltage";

  useEffect(() => {
    let active = true;

    async function loadCaptains() {
      try {
        const params = new URLSearchParams({
          home: home.name,
          away: away.name,
        });
        const response = await fetch(`/api/captain-photos?${params}`);
        if (!response.ok) return;
        const data = await response.json();
        if (active) setCaptains(data);
      } catch {
        // Captain photos are optional enhancement
      }
    }

    loadCaptains();

    return () => {
      active = false;
    };
  }, [home.name, away.name]);

  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#121a2e] to-[#1a1030]"
        aria-hidden
      />
      {background?.url && !imageFailed && (
        <Image
          src={background.url}
          alt={background.alt}
          fill
          className="object-cover"
          sizes="100vw"
          onError={() => setImageFailed(true)}
        />
      )}
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#0a0f1e]/92 via-[#0a0f1e]/78 to-[#0a0f1e]/92"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#0a0f1e]/85 via-[#0a0f1e]/35 to-transparent"
        aria-hidden
      />
      <div
        className="absolute inset-0 opacity-40"
        style={{
          background:
            "radial-gradient(ellipse at 18% 80%, hsl(var(--wc-accent) / 0.14), transparent 50%), radial-gradient(ellipse at 82% 80%, rgba(48,63,159,0.15), transparent 50%)",
        }}
        aria-hidden
      />

      <CaptainFigure
        side="home"
        team={home}
        captain={captains.home}
      />
      <CaptainFigure
        side="away"
        team={away}
        captain={captains.away}
      />

      <div className="relative z-10 flex h-full flex-col justify-end pb-16 pt-10 sm:pb-20">
        <div
          className={cn(
            HERO_INNER_CONTAINER,
            "flex flex-col items-center text-center",
          )}
        >
        <span className="rounded-full border border-wc-accent/50 bg-wc-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-wc-accent">
          {badgeLabel}
        </span>
        <p className="mt-4 font-display text-2xl uppercase tracking-[0.15em] text-white/90 sm:text-3xl">
          {fixture.league.round}
        </p>

        <div className="mt-6 flex items-center gap-4 sm:gap-8">
          <TeamBadge team={home} />
          <span className="font-sans text-2xl text-wc-accent sm:text-3xl">VS</span>
          <TeamBadge team={away} />
        </div>

        <HeroKickoffCountdown kickoff={kickoff} />

        <div className="mt-5 max-w-xl sm:mt-6">
          <p className="font-display text-xl tracking-wide text-white sm:text-2xl">
            {home.name}
            <span className="mx-2 text-wc-accent">vs</span>
            {away.name}
          </p>
          <p className="mt-2 text-sm text-white/70">
            <LocalKickoffDateTime date={kickoff} />
          </p>
          {fixture.fixture.venue?.name && (
            <p className="mt-1 text-xs text-white/50">
              {fixture.fixture.venue.name}
              {fixture.fixture.venue.city ? `, ${fixture.fixture.venue.city}` : ""}
            </p>
          )}
        </div>
        </div>
      </div>
    </div>
  );
}

function CaptainFigure({ side, team, captain }) {
  const isHome = side === "home";
  const photoUrl = isValidPlayerPhotoUrl(captain?.photo) ? captain.photo : null;

  if (photoUrl) {
    return (
      <div
        className={cn(
          "pointer-events-none absolute bottom-0 z-[1] w-[38%] max-w-[320px] sm:max-w-[360px]",
          isHome
            ? "left-[8%] sm:left-[12%] md:left-[14%]"
            : "right-[8%] sm:right-[12%] md:right-[14%]",
        )}
      >
        <div className="relative mx-auto h-[min(85vh,620px)] w-full max-h-[680px] sm:h-[min(88vh,680px)] md:max-h-[720px]">
          <Image
            src={photoUrl}
            alt={captain.name ? `${captain.name}, ${team.name}` : team.name}
            fill
            className="object-contain object-bottom drop-shadow-[0_8px_32px_rgba(0,0,0,0.5)]"
            sizes="(max-width: 768px) 42vw, 360px"
          />
        </div>
      </div>
    );
  }

  if (!team.logo) return null;

  return (
    <div
      className={cn(
        "pointer-events-none absolute bottom-0 top-8 z-0 w-[36%] opacity-25",
        isHome ? "left-[6%] sm:left-[10%]" : "right-[6%] sm:right-[10%]",
      )}
    >
      <Image
        src={team.logo}
        alt=""
        fill
        className="object-contain object-bottom blur-[2px]"
        sizes="40vw"
      />
    </div>
  );
}

function TeamBadge({ team }) {
  return (
    <div className="flex flex-col items-center gap-2">
      {team.logo ? (
        <div className="relative h-16 w-24 sm:h-20 sm:w-28">
          <Image
            src={team.logo}
            alt={team.name}
            fill
            className="object-contain drop-shadow-lg"
            sizes="120px"
          />
        </div>
      ) : (
        <span className="inline-block h-12 w-20 border border-white/20 bg-white/5" />
      )}
    </div>
  );
}

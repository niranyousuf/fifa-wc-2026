"use client";

import { useMemo, useRef } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Autoplay, EffectFade, Navigation, Pagination } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/react";
import { useFavoriteTeams } from "@/components/FavoriteTeamsProvider";
import { MatchPromoSlide } from "@/components/home/MatchPromoSlide";
import { PromoSlide } from "@/components/home/PromoSlide";
import { buildHeroSlides } from "@/lib/heroSlides";
import { HERO_SLIDE_HEIGHT } from "@/lib/heroBanner";
import { cn } from "@/lib/utils";

import "swiper/css";
import "swiper/css/effect-fade";
import "swiper/css/navigation";
import "swiper/css/pagination";

const AUTOPLAY_MS = 10000;

export function HomeHeroSlider({ fixtures = [], promoImage = null }) {
  const swiperRef = useRef(null);
  const { hydrated, favoriteIds } = useFavoriteTeams();

  const slides = useMemo(() => {
    if (!hydrated) {
      return [{ type: "promo" }];
    }
    return buildHeroSlides(fixtures, favoriteIds);
  }, [fixtures, favoriteIds, hydrated]);

  const swiperKey = useMemo(
    () =>
      slides
        .map((slide, index) => slideKey(slide, index))
        .join("|"),
    [slides],
  );

  const hasMultipleSlides = slides.length > 1;

  return (
    <section
      className={cn(
        "hero-swiper-section relative left-1/2 -mt-6 mb-8 w-screen max-w-[100vw] -translate-x-1/2 overflow-hidden sm:-mt-8 sm:mb-10",
        HERO_SLIDE_HEIGHT,
      )}
      aria-label="Featured highlights"
      onMouseEnter={() => swiperRef.current?.autoplay?.pause()}
      onMouseLeave={() => swiperRef.current?.autoplay?.resume()}
    >
      <Swiper
        key={swiperKey}
        className="hero-swiper h-full w-full"
        modules={[Autoplay, EffectFade, Navigation, Pagination]}
        onSwiper={(swiper) => {
          swiperRef.current = swiper;
        }}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        slidesPerView={1}
        speed={600}
        loop={hasMultipleSlides}
        autoplay={
          hasMultipleSlides
            ? {
                delay: AUTOPLAY_MS,
                disableOnInteraction: false,
              }
            : false
        }
        navigation={
          hasMultipleSlides
            ? {
                prevEl: ".hero-swiper-prev",
                nextEl: ".hero-swiper-next",
              }
            : false
        }
        pagination={hasMultipleSlides ? { clickable: true } : false}
      >
        {slides.map((slide, slideIndex) => (
          <SwiperSlide key={slideKey(slide, slideIndex)} className="h-full">
            <div className="relative h-full w-full">
              {slide.type === "promo" ? (
                <PromoSlide promoImage={promoImage} />
              ) : (
                <MatchPromoSlide
                  fixture={slide.fixture}
                  variant={slide.variant}
                />
              )}
            </div>
          </SwiperSlide>
        ))}
      </Swiper>

      {hasMultipleSlides && (
        <>
          <button
            type="button"
            className="hero-swiper-prev absolute left-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:left-5"
            aria-label="Previous slide"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
          <button
            type="button"
            className="hero-swiper-next absolute right-3 top-1/2 z-20 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-md border border-white/20 bg-black/40 text-white backdrop-blur-sm transition-colors hover:bg-black/60 sm:right-5"
            aria-label="Next slide"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        </>
      )}
    </section>
  );
}

function slideKey(slide, index) {
  if (slide.type === "promo") return "promo";
  return `match-${slide.fixture.fixture.id}-${slide.variant}-${index}`;
}

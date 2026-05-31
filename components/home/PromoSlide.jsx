"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import promoImages from "@/data/hero-promo-images.json";
import { HERO_INNER_CONTAINER } from "@/lib/heroBanner";

export function PromoSlide({ promoImage = null }) {
  const image = promoImage ?? promoImages.images[0] ?? null;
  const [imageFailed, setImageFailed] = useState(false);
  const showImage = image?.url && !imageFailed;

  return (
    <div className="relative h-full w-full">
      <div
        className="absolute inset-0 bg-gradient-to-br from-[#0a1628] via-[#121a2e] to-[#1a1030]"
        aria-hidden
      />
      {showImage && (
        <Image
          src={image.url}
          alt={image.alt}
          fill
          priority
          className="object-cover brightness-[0.72] saturate-[0.95]"
          sizes="100vw"
          onError={() => setImageFailed(true)}
        />
      )}
      <div className="absolute inset-0 bg-[#070b16]/30" aria-hidden />
      <div
        className="absolute inset-0 bg-gradient-to-r from-[#070b16]/55 via-transparent to-[#070b16]/55"
        aria-hidden
      />
      <div
        className="absolute inset-0 bg-gradient-to-t from-[#070b16]/92 via-[#070b16]/40 to-transparent"
        aria-hidden
      />

      <div className="absolute inset-0 flex flex-col justify-end pb-14 pt-10 sm:pb-16">
        <div className={HERO_INNER_CONTAINER}>
          <p className="text-sm uppercase tracking-[0.2em] text-wc-accent [text-shadow:0_1px_8px_rgba(0,0,0,0.75)]">
            FIFA World Cup 2026
          </p>
          <h2 className="mt-2 max-w-xl font-display text-4xl tracking-wide text-white [text-shadow:0_2px_14px_rgba(0,0,0,0.85)] sm:text-5xl md:text-6xl">
            Your World Cup home
          </h2>
          <p className="mt-3 max-w-lg text-sm text-white/90 [text-shadow:0_1px_10px_rgba(0,0,0,0.85)] sm:text-base">
            Follow every group, knockout tie, and nation — star your teams for a
            personalized feed.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/hub"
              className="inline-flex items-center justify-center rounded-md bg-wc-accent px-4 py-2 text-sm font-semibold text-[#0a0f1e] transition-opacity hover:opacity-90"
            >
              Tournament hub
            </Link>
            <Link
              href="/teams"
              className="inline-flex items-center justify-center rounded-md border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              All teams
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

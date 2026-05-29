import Link from "next/link";
import { Star } from "lucide-react";

export function HomeFavoritesSection({ favoriteCount }) {
  return (
    <section className="space-y-4" aria-labelledby="home-favorites-heading">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h2
            id="home-favorites-heading"
            className="font-display text-2xl tracking-wide sm:text-3xl"
          >
            For your teams
          </h2>
          <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
            Personalized block — shown when you have starred teams ({favoriteCount}{" "}
            selected). Data wiring comes next.
          </p>
        </div>
        <Link
          href="/teams"
          className="text-sm font-medium text-[hsl(var(--accent))] hover:underline"
        >
          Manage favorites
        </Link>
      </div>

      <div className="grid gap-4">
        <PlaceholderCard
          title="Upcoming matches"
          description="Fixtures involving your favorite nations."
        />
        <PlaceholderCard
          title="Group snapshot"
          description="Standings and position for teams you follow."
        />
        <PlaceholderCard
          title="Quick links"
          description="Squads, results, and bracket paths for your picks."
        />
      </div>
    </section>
  );
}

function PlaceholderCard({ title, description }) {
  return (
    <article className="flex min-h-[140px] flex-col rounded-xl border border-[hsl(var(--border))] border-dashed bg-[hsl(var(--card))] p-5">
      <Star className="mb-3 h-4 w-4 text-wc-accent" aria-hidden />
      <h3 className="font-display text-lg tracking-wide">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
      <span className="mt-3 text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
        Placeholder
      </span>
    </article>
  );
}

import Link from "next/link";
import { Compass } from "lucide-react";

export function HomeDiscoverSection() {
  return (
    <section className="space-y-4" aria-labelledby="home-discover-heading">
      <div>
        <h2
          id="home-discover-heading"
          className="font-display text-2xl tracking-wide sm:text-3xl"
        >
          Discover the tournament
        </h2>
        <p className="mt-1 text-sm text-[hsl(var(--muted-foreground))]">
          Default block — shown when no favorites are saved. Data wiring comes next.
        </p>
      </div>

      <div className="grid gap-4">
        <DiscoverCard
          title="Pick your teams"
          description="Star nations on the teams page to unlock a personalized home feed."
          href="/teams"
          cta="Browse teams"
        />
        <DiscoverCard
          title="Full tournament hub"
          description="Groups, calendar, results, and the knockout bracket in one place."
          href="/hub"
          cta="Open hub"
        />
        <DiscoverCard
          title="High-voltage matches"
          description="Top-tier clashes and key knockout ties highlighted across the site."
          href="/hub"
          cta="See fixtures"
        />
      </div>
    </section>
  );
}

function DiscoverCard({ title, description, href, cta }) {
  return (
    <article className="flex min-h-[160px] flex-col rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-5">
      <Compass className="mb-3 h-4 w-4 text-[hsl(var(--accent))]" aria-hidden />
      <h3 className="font-display text-lg tracking-wide">{title}</h3>
      <p className="mt-2 flex-1 text-sm text-[hsl(var(--muted-foreground))]">
        {description}
      </p>
      <Link
        href={href}
        className="mt-4 text-sm font-medium text-[hsl(var(--accent))] hover:underline"
      >
        {cta} →
      </Link>
    </article>
  );
}

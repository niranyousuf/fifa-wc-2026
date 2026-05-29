import Link from "next/link";
import {
  Globe2,
  LayoutGrid,
  Medal,
  Trophy,
  Users,
} from "lucide-react";

const FORMAT_HIGHLIGHTS = [
  {
    icon: Users,
    value: "48",
    label: "Teams",
    detail: "Expanded from 32 — the biggest World Cup ever.",
  },
  {
    icon: LayoutGrid,
    value: "12×4",
    label: "Groups",
    detail: "Groups A–L, four nations each, three matches per team.",
  },
  {
    icon: Medal,
    value: "32",
    label: "Knockout spots",
    detail: "Top two from every group plus the eight best third-place sides.",
  },
  {
    icon: Trophy,
    value: "104",
    label: "Matches",
    detail: "72 group games, then Round of 32 through Final (+ third-place play-off).",
  },
];

const FORMAT_STEPS = [
  {
    title: "Group stage",
    body: "Each team plays three games in its group. Win 3 pts, draw 1, loss 0. Goal difference and head-to-head break ties in the table.",
  },
  {
    title: "Who advances",
    body: "24 teams go through as group winners or runners-up. The eight highest-ranked third-place teams join them for a 32-team knockout bracket.",
  },
  {
    title: "Knockout path",
    body: "Round of 32 → Round of 16 → Quarter-finals → Semi-finals → Final. Losers of the semis meet in the third-place match.",
  },
  {
    title: "Hosts",
    body: "USA, Canada, and Mexico co-host — first World Cup across three nations and the first with 48 finalists.",
  },
];

export function HomeTournamentFormatSection() {
  return (
    <section
      className="rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"
      aria-labelledby="home-format-heading"
    >
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="max-w-2xl space-y-2">
          <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">
            2026 tournament format
          </p>
          <h2
            id="home-format-heading"
            className="font-display text-2xl tracking-wide sm:text-3xl"
          >
            FIFA&apos;s new 48-team World Cup
          </h2>
          <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))] sm:text-base">
            The 2026 edition changes how the tournament is structured: more nations,
            twelve groups, and a larger knockout round. Here is how it works before
            you dive into fixtures and standings on this site.
          </p>
        </div>
        <Globe2
          className="hidden h-10 w-10 shrink-0 text-[hsl(var(--accent))]/40 sm:block"
          aria-hidden
        />
      </div>

      <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {FORMAT_HIGHLIGHTS.map(({ icon: Icon, value, label, detail }) => (
          <li
            key={label}
            className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--background))]/50 p-4"
          >
            <Icon
              className="mb-2 h-4 w-4 text-[hsl(var(--accent))]"
              aria-hidden
            />
            <p className="font-display text-2xl tracking-wide text-[hsl(var(--foreground))]">
              {value}
            </p>
            <p className="mt-0.5 text-sm font-medium text-[hsl(var(--foreground))]">
              {label}
            </p>
            <p className="mt-2 text-xs leading-relaxed text-[hsl(var(--muted-foreground))]">
              {detail}
            </p>
          </li>
        ))}
      </ul>

      <ol className="mt-8 grid gap-4 md:grid-cols-2">
        {FORMAT_STEPS.map((step, index) => (
          <li
            key={step.title}
            className="flex gap-4 rounded-xl border border-[hsl(var(--border))]/80 bg-[hsl(var(--background))]/30 p-4"
          >
            <span
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-[hsl(var(--accent))]/40 bg-[hsl(var(--card))] font-sans text-sm font-semibold tabular-nums text-[hsl(var(--accent))]"
              aria-hidden
            >
              {index + 1}
            </span>
            <div className="min-w-0 space-y-1">
              <h3 className="font-display text-lg tracking-wide text-[hsl(var(--foreground))]">
                {step.title}
              </h3>
              <p className="text-sm leading-relaxed text-[hsl(var(--muted-foreground))]">
                {step.body}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
        Explore live standings, the full calendar, and the{" "}
        <Link
          href="/hub"
          className="font-medium text-[hsl(var(--accent))] hover:underline"
        >
          knockout bracket
        </Link>{" "}
        in the hub — or try the{" "}
        <Link
          href="/simulator"
          className="font-medium text-[hsl(var(--accent))] hover:underline"
        >
          prediction simulator
        </Link>{" "}
        to play through your own 48-team path.
      </p>
    </section>
  );
}

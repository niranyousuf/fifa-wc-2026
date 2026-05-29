import Link from "next/link";
import { Facebook, Linkedin } from "lucide-react";
import { VisitorCounter } from "@/components/VisitorCounter";

const SOURCE_REPO_URL = "https://github.com/niranyousuf/fifa-wc-2026";

const DEVELOPER_SOCIAL_LINKS = [
  {
    href: "https://www.linkedin.com/in/niranyousuf/",
    label: "LinkedIn — AHM Yousuf Niran",
    Icon: Linkedin,
  },
  {
    href: "https://www.facebook.com/tufan.express",
    label: "Facebook — Tufan Express",
    Icon: Facebook,
  },
];

export const metadata = {
  title: "About | FIFA World Cup 2026",
  description:
    "What this site offers, how the tournament prediction simulator works, credits, and data sources for the WC 2026 hub.",
};

function Section({ title, children, className = "", contentClassName = "" }) {
  return (
    <section
      className={`rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8 ${className}`}
    >
      <h2 className="font-display text-2xl tracking-wide">{title}</h2>
      <div
        className={`mt-4 space-y-4 text-[hsl(var(--muted-foreground))] [&_a]:text-[hsl(var(--accent))] [&_a]:underline-offset-2 hover:[&_a]:underline [&_h3]:text-[hsl(var(--foreground))] [&_li]:leading-relaxed [&_strong]:font-medium [&_strong]:text-[hsl(var(--foreground))] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5 ${contentClassName}`}
      >
        {children}
      </div>
    </section>
  );
}

export default function AboutPage() {
  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">About</p>
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl md:text-5xl">
          FIFA World Cup 2026 hub
        </h1>
        <p className="max-w-3xl text-lg leading-relaxed text-[hsl(var(--muted-foreground))]">
          A fan-built site to follow the tournament — live-style fixtures, standings,
          teams, and knockouts from real API data — plus a separate prediction
          simulator to play out your own bracket. Not affiliated with FIFA.
        </p>
        <Link
          href="/"
          className="inline-block text-sm font-medium text-[hsl(var(--accent))] hover:underline"
        >
          Back to home →
        </Link>
      </header>

      <Section title="What you will find">
        <p>
          Each section below is a page in the nav. The main site shows{" "}
          <strong>real tournament data</strong> from the API (refreshed on a schedule).
          The <strong>simulator</strong> is entertainment only and does not change
          official results.
        </p>
        <ul>
          <li>
            <Link href="/">
              <strong>Home</strong>
            </Link>{" "}
            — Hero slider (promo + upcoming favorite / high-voltage matches), match
            feed with stage filters, sidebar countdowns for starred teams, and quick
            links into the hub.
          </li>
          <li>
            <Link href="/favorites">
              <strong>Favorites</strong>
            </Link>{" "}
            — Star nations in the navbar search; see only their fixtures, results, and
            kickoff countdowns in one place (stored in your browser).
          </li>
          <li>
            <Link href="/hub">
              <strong>Hub</strong>
            </Link>{" "}
            — Full tournament view: all 12 group tables, calendar of fixtures, finished
            results, and the knockout bracket (Round of 32 through Final).
          </li>
          <li>
            <Link href="/teams">
              <strong>Teams</strong>
            </Link>{" "}
            — Every qualified nation, searchable and sorted by FIFA ranking snapshot;
            open a team for squad list and player photos where available.
          </li>
          <li>
            <strong>Match detail</strong> — Open any fixture for scoreline, events
            timeline, and match statistics (from the API when the match has been played).
          </li>
          <li>
            <Link href="/simulator">
              <strong>Tournament prediction simulator</strong>
            </Link>{" "}
            — Your own scores for every group game and knockout tie; see predicted
            standings, qualifiers, and champion (details below).
          </li>
        </ul>
        <h3>Match times &amp; countdowns</h3>
        <p>
          Kickoff dates, clock times, and live countdowns use your{" "}
          <strong>device&apos;s local timezone and locale</strong> — not a fixed
          stadium zone. Someone in Bangladesh and someone in London will see the
          same match at different local times, each correct for where they are.
          Official kickoff instants come from the API as UTC; your browser converts
          them for display.
        </p>

        <h3>Extras across the site</h3>
        <ul>
          <li>
            <strong>High voltage</strong> — Knockout ties and clashes between top-ranked
            nations (from a local FIFA ranking snapshot) are highlighted.
          </li>
          <li>
            <strong>Light / dark theme</strong> — Toggle in the bottom corner; preference
            is remembered in the browser.
          </li>
          <li>
            <strong>Team search</strong> — Find a country quickly from the navbar.
          </li>
          <li>
            <strong>Visitor counter</strong> — A simple session-based count (see below).
          </li>
        </ul>
      </Section>

      <Section
        title="Tournament prediction simulator"
        className="border-[hsl(var(--accent))]/30 bg-[hsl(var(--accent))]/5"
      >
        <p>
          Open the{" "}
          <Link href="/simulator">simulator</Link> to run a full what-if tournament.
          It uses the <strong>real group-stage schedule</strong> from the API but{" "}
          <strong>your entered scores</strong> for everything else — it is not linked
          to live or final World Cup results.
        </p>

        <h3>Group stage</h3>
        <ul>
          <li>Groups A–L with every group match and score inputs.</li>
          <li>
            Live <strong>predicted standings</strong> per group (points, goal difference,
            goals for, and head-to-head among tied teams).
          </li>
          <li>
            A <strong>third-place table</strong> ranking all 12 group runners-up in 3rd;
            the top 8 are highlighted as predicted Round of 32 qualifiers.
          </li>
          <li>
            <strong>Reset Group X</strong> clears only that group&apos;s scores.
          </li>
        </ul>

        <h3>Knockout stage</h3>
        <ul>
          <li>
            Unlocks after every group match has a complete score. Tabs: Round of 32,
            Round of 16, Quarter-finals, Semi-finals, Final.
          </li>
          <li>
            Later rounds appear <strong>as soon as both teams are known</strong> — you
            do not need to finish an entire round first.
          </li>
          <li>
            Draws after 90 minutes can be decided with a <strong>penalties</strong>{" "}
            checkbox and pen scores.
          </li>
          <li>
            On the <strong>Final</strong> tab: the final plus a{" "}
            <strong>3rd place play-off</strong> between semi-final losers (when both
            semis have a result).
          </li>
          <li>
            <strong>Reset [round]</strong> clears that round and all later rounds.
            Separate <strong>Reset 3rd place</strong> on the Final tab.
          </li>
        </ul>

        <h3>Smart resets when you edit scores</h3>
        <ul>
          <li>
            Change a <strong>group</strong> result → the entire knockout stage is cleared
            (qualifiers may change).
          </li>
          <li>
            Change a <strong>knockout</strong> winner → all matches that depend on that
            fixture are cleared (same path as the bracket tree).
          </li>
        </ul>

        <h3>Saving your work</h3>
        <ul>
          <li>
            Predictions are stored in <strong>localStorage</strong> in this browser for{" "}
            <strong>60 days</strong>, then expire automatically.
          </li>
          <li>
            <strong>Reset all</strong> wipes group and knockout predictions and starts
            over.
          </li>
        </ul>

        <p className="text-sm">
          Bracket pairings in the simulator use a simplified entertainment seeding model,
          not necessarily the official FIFA 2026 draw path. Use it for fun, not as a
          forecast of the real tournament.
        </p>
      </Section>

      <div className="grid gap-4 lg:grid-cols-2">
        <Section title="Technology">
          <dl className="space-y-4 text-sm [&_dd]:mt-1">
            <div>
              <dt className="font-medium text-[hsl(var(--foreground))]">Framework</dt>
              <dd>Next.js 16 (App Router), React 19, Tailwind CSS</dd>
            </div>
            <div>
              <dt className="font-medium text-[hsl(var(--foreground))]">UI</dt>
              <dd>
                Custom components, Lucide icons, Swiper (home hero), light/dark via{" "}
                @teispace/next-themes
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[hsl(var(--foreground))]">Typography</dt>
              <dd>
                Playfair Display &amp; Inter via{" "}
                <a
                  href="https://fonts.google.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Google Fonts
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-medium text-[hsl(var(--foreground))]">Caching</dt>
              <dd>
                ISR and on-disk API cache (<code className="text-xs">data/api-cache/</code>
                ) to stay within API limits; warm with{" "}
                <code className="text-xs">npm run cache:warm</code>
              </dd>
            </div>
          </dl>
        </Section>

        <Section title="Data &amp; API">
          <ul>
            <li>
              <strong>
                <a
                  href="https://api.zafronix.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  Zafronix World Cup API
                </a>
              </strong>{" "}
              — Fixtures, standings, team rosters, match events and statistics, knockout
              bracket. Requires an API key in <code className="text-xs">.env.local</code>
              .
            </li>
            <li>
              <strong>Local FIFA ranking snapshot</strong> —{" "}
              <code className="text-xs">data/fifa-rankings.json</code> for high-voltage
              and team ordering (manual update; not live FIFA data).
            </li>
            <li>
              <strong>Visitor count</strong> —{" "}
              <code className="text-xs">data/visitors.json</code> on the server (one
              increment per browser session).
            </li>
          </ul>
          <p className="text-sm">
            Squads, logos, and live stats depend on the upstream feed and may be
            incomplete or delayed for some teams.
          </p>
        </Section>
      </div>

      <Section title="Credits &amp; third-party resources">
        <p>
          Thank you to the projects and creators whose work powers or decorates this
          site. Please respect their licenses and terms of use.
        </p>

        <h3>Match &amp; team data</h3>
        <ul>
          <li>
            <a href="https://api.zafronix.com/" target="_blank" rel="noopener noreferrer">
              Zafronix
            </a>{" "}
            — Tournament fixtures, standings, teams, and match detail.
          </li>
        </ul>

        <h3>Images</h3>
        <ul>
          <li>
            <a href="https://unsplash.com/" target="_blank" rel="noopener noreferrer">
              Unsplash
            </a>{" "}
            and{" "}
            <a href="https://www.pexels.com/" target="_blank" rel="noopener noreferrer">
              Pexels
            </a>{" "}
            — Football-only hero banner photos (
            <a
              href="https://unsplash.com/license"
              target="_blank"
              rel="noopener noreferrer"
            >
              Unsplash License
            </a>
            ,{" "}
            <a
              href="https://www.pexels.com/license/"
              target="_blank"
              rel="noopener noreferrer"
            >
              Pexels License
            </a>
            ). Curated list in <code className="text-xs">data/hero-promo-images.json</code>
            .
          </li>
          <li>
            Team and player imagery from API responses; many player cutouts reference{" "}
            <a
              href="https://www.thesportsdb.com/"
              target="_blank"
              rel="noopener noreferrer"
            >
              TheSportsDB
            </a>{" "}
            URLs in <code className="text-xs">data/player-photos.json</code> (captain /
            promo figures on the home hero when available).
          </li>
          <li>National flags and badges as provided by the data API.</li>
        </ul>

        <h3>Open-source libraries</h3>
        <ul>
          <li>
            <a href="https://nextjs.org/" target="_blank" rel="noopener noreferrer">
              Next.js
            </a>{" "}
            (Vercel) — App framework
          </li>
          <li>
            <a href="https://react.dev/" target="_blank" rel="noopener noreferrer">
              React
            </a>
          </li>
          <li>
            <a href="https://tailwindcss.com/" target="_blank" rel="noopener noreferrer">
              Tailwind CSS
            </a>
          </li>
          <li>
            <a
              href="https://www.npmjs.com/package/@teispace/next-themes"
              target="_blank"
              rel="noopener noreferrer"
            >
              @teispace/next-themes
            </a>{" "}
            — Theme switching (maintained fork of next-themes)
          </li>
          <li>
            <a href="https://lucide.dev/" target="_blank" rel="noopener noreferrer">
              Lucide
            </a>{" "}
            — Icons
          </li>
          <li>
            <a href="https://swiperjs.com/" target="_blank" rel="noopener noreferrer">
              Swiper
            </a>{" "}
            — Home hero carousel
          </li>
          <li>clsx, tailwind-merge — class name utilities</li>
        </ul>

        <h3>Fonts</h3>
        <ul>
          <li>
            <a
              href="https://fonts.google.com/specimen/Playfair+Display"
              target="_blank"
              rel="noopener noreferrer"
            >
              Playfair Display
            </a>{" "}
            — Headings (OFL)
          </li>
          <li>
            <a
              href="https://fonts.google.com/specimen/Inter"
              target="_blank"
              rel="noopener noreferrer"
            >
              Inter
            </a>{" "}
            — UI text (OFL)
          </li>
        </ul>
      </Section>

      <Section title="Visitors">
        <p>
          The counter below increases once per browser session when you visit. It is
          stored on the server for fun, not analytics.
        </p>
        <VisitorCounter />
      </Section>

      <Section
        title="Developed by"
        contentClassName="!space-y-0 flex flex-col gap-2"
      >
        <p className="text-lg font-medium text-[hsl(var(--foreground))]">
          niranyousf —{" "}
          <a
            href="https://niranyousuf.me"
            target="_blank"
            rel="noopener noreferrer"
          >
            AHM Yousuf Niran
          </a>
        </p>
        <p>
          Design, development, and maintenance of this project. Questions or bugs:
          reach out via the site above or on social:
        </p>
        <ul className="flex flex-wrap items-center gap-3 !mt-0 !space-y-0 !pl-0 !list-none [&>li]:!mt-0">
          {DEVELOPER_SOCIAL_LINKS.map(({ href, label, Icon }) => (
            <li key={href} className="!mt-0">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="inline-flex h-10 w-10 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]"
              >
                <Icon className="h-5 w-5" aria-hidden />
              </a>
            </li>
          ))}
        </ul>
        <p>
          <strong>Source code</strong> —{" "}
          <a href={SOURCE_REPO_URL} target="_blank" rel="noopener noreferrer">
            github.com/niranyousuf/fifa-wc-2026
          </a>
        </p>
        <p className="text-xs">
          This site is an unofficial fan project. FIFA, World Cup, and related marks
          are trademarks of their respective owners. No endorsement or affiliation is
          implied.
        </p>
      </Section>
    </div>
  );
}

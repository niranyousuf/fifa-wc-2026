import Link from "next/link";
import { ClearBrowserDataButton } from "@/components/privacy/ClearBrowserDataButton";
import {
  SITE_LOCAL_STORAGE_KEYS,
  SITE_SESSION_STORAGE_KEYS,
} from "@/lib/siteBrowserStorage";

export const metadata = {
  title: "Privacy Policy | FIFA World Cup 2026",
  description:
    "How this site uses browser storage, third-party data, and how you can delete your local data.",
};

function Section({ title, children, id }) {
  return (
    <section
      id={id}
      className="rounded-xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8"
    >
      <h2 className="font-display text-2xl tracking-wide">{title}</h2>
      <div className="prose-policy mt-4 space-y-4 text-[hsl(var(--muted-foreground))] [&_a]:text-[hsl(var(--accent))] [&_a]:underline-offset-2 hover:[&_a]:underline [&_h3]:text-[hsl(var(--foreground))] [&_li]:leading-relaxed [&_strong]:font-medium [&_strong]:text-[hsl(var(--foreground))] [&_ul]:list-disc [&_ul]:space-y-2 [&_ul]:pl-5">
        {children}
      </div>
    </section>
  );
}

export default function PrivacyPage() {
  const effectiveDate = "29 May 2026";

  return (
    <div className="space-y-8">
      <header className="space-y-4">
        <p className="text-sm uppercase tracking-[0.2em] text-wc-accent">
          Legal
        </p>
        <h1 className="font-display text-3xl tracking-wide sm:text-4xl">
          Privacy Policy
        </h1>
        <p className="max-w-3xl text-[hsl(var(--muted-foreground))]">
          Effective date: {effectiveDate}. This policy explains what happens
          when you use the FIFA World Cup 2026 fan hub at this website.
        </p>
        <p className="text-sm text-[hsl(var(--muted-foreground))]">
          <a href="#delete-your-data" className="font-medium text-[hsl(var(--accent))]">
            Jump to: delete your data →
          </a>
        </p>
      </header>

      <Section title="Summary">
        <p>
          This is a small, unofficial fan site. We do <strong>not</strong> ask
          you to create an account, and we do <strong>not</strong> sell your
          personal information. Most “personalization” (favorite teams, simulator
          scores, theme) stays in <strong>your own browser</strong> via
          localStorage. We use a simple visitor counter that stores one flag per
          browser tab in sessionStorage and a total count on our server.
        </p>
      </Section>

      <Section title="Who operates this site">
        <p>
          The site is operated by <strong>niranyousf</strong> (
          <a
            href="https://niranyousuf.me"
            target="_blank"
            rel="noopener noreferrer"
          >
            niranyousuf.me
          </a>
          ). For privacy questions, contact via that website. This project is
          not affiliated with FIFA or any national federation.
        </p>
      </Section>

      <Section title="Information we do not collect directly">
        <p>We do not operate a login system and do not intentionally collect:</p>
        <ul>
          <li>Name, email address, or postal address</li>
          <li>Payment or billing information</li>
          <li>Precise geolocation from your device</li>
          <li>Contacts, photos, or files from your device</li>
        </ul>
      </Section>

      <Section title="Browser storage we use">
        <p>
          When you use the site, data may be saved in your browser so features
          work without an account. Nothing in the table below is uploaded to our
          servers as a personal profile — except where noted for the visitor
          counter.
        </p>

        <h3>localStorage (persists until cleared or expired)</h3>
        <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Retention</th>
              </tr>
            </thead>
            <tbody className="text-[hsl(var(--muted-foreground))]">
              {SITE_LOCAL_STORAGE_KEYS.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-[hsl(var(--border))] last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--foreground))]">
                    {row.key}
                  </td>
                  <td className="px-4 py-3">{row.purpose}</td>
                  <td className="px-4 py-3">{row.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <h3>sessionStorage (cleared when you close the tab)</h3>
        <div className="overflow-x-auto rounded-lg border border-[hsl(var(--border))]">
          <table className="min-w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[hsl(var(--border))] bg-[hsl(var(--muted))]/40 text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                <th className="px-4 py-3">Key</th>
                <th className="px-4 py-3">Purpose</th>
                <th className="px-4 py-3">Retention</th>
              </tr>
            </thead>
            <tbody className="text-[hsl(var(--muted-foreground))]">
              {SITE_SESSION_STORAGE_KEYS.map((row) => (
                <tr
                  key={row.key}
                  className="border-b border-[hsl(var(--border))] last:border-0"
                >
                  <td className="px-4 py-3 font-mono text-xs text-[hsl(var(--foreground))]">
                    {row.key}
                  </td>
                  <td className="px-4 py-3">{row.purpose}</td>
                  <td className="px-4 py-3">{row.ttl}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <p className="text-sm">
          Favorites and simulator data automatically expire after{" "}
          <strong>60 days</strong> from the last save. The theme preference does
          not expire until you remove it.
        </p>
      </Section>

      <Section title="Server-side data">
        <h3>Visitor counter</h3>
        <p>
          The public visitor count is stored in a file on our server (
          <code className="text-xs">data/visitors.json</code>). When you first
          load a page in a tab, we increment that total once per tab session. We
          do not store your name or a persistent user ID with that count.
        </p>
        <h3>Tournament data from third parties</h3>
        <p>
          Fixtures, standings, and team information are fetched from the{" "}
          <a
            href="https://api.zafronix.com/"
            target="_blank"
            rel="noopener noreferrer"
          >
            Zafronix World Cup API
          </a>{" "}
          from our servers. Those requests may include your IP address and are
          subject to the API provider’s policies. Responses may be cached on
          disk to reduce API usage.
        </p>
      </Section>

      <Section title="Hosting and logs">
        <p>
          If you deploy or access this site on a host such as Vercel, the host
          may log standard web data (IP address, browser type, pages requested,
          timestamps) for security and operations. We do not use third-party
          advertising or analytics cookies on this site.
        </p>
      </Section>

      <Section title="Children">
        <p>
          The site is intended for general football fans and is not directed at
          children under 13. We do not knowingly collect personal information
          from children.
        </p>
      </Section>

      <Section title="Changes to this policy">
        <p>
          We may update this page when features or storage change. The effective
          date at the top will be revised. Continued use of the site after
          changes means you accept the updated policy.
        </p>
      </Section>

      <Section title="Delete your data" id="delete-your-data">
        <p>
          Because favorites and simulator scores live in <strong>your browser</strong>,
          you can remove them at any time. Choose one of the options below.
        </p>

        <h3>Option 1 — Clear everything for this site (recommended)</h3>
        <p>
          This button removes all localStorage and sessionStorage keys listed
          above for this website in the browser you are using now:
        </p>
        <ClearBrowserDataButton />

        <h3>Option 2 — Use in-app reset controls</h3>
        <ul>
          <li>
            <Link href="/simulator">Tournament prediction simulator</Link> —{" "}
            <strong>Reset all</strong>, or reset an individual group / knockout
            round.
          </li>
          <li>
            <strong>Favorite teams</strong> — Unstar teams from the search bar
            or team pages (updates localStorage).
          </li>
          <li>
            <strong>Theme</strong> — Use the theme toggle; clearing browser data
            resets to default.
          </li>
        </ul>

        <h3>Option 3 — Browser settings</h3>
        <p>
          In your browser, open site settings or “Clear browsing data” and remove
          cookies and site data for this domain. That deletes localStorage,
          sessionStorage, and any other data this origin stored. Exact steps
          depend on Chrome, Safari, Firefox, or Edge.
        </p>

        <p className="text-sm">
          Clearing browser data here does <strong>not</strong> lower the public
          visitor counter on the server; that number is anonymous and aggregate.
        </p>
      </Section>

      <p className="text-sm text-[hsl(var(--muted-foreground))]">
        <Link href="/" className="font-medium text-[hsl(var(--accent))] hover:underline">
          ← Back to home
        </Link>
        {" · "}
        <Link href="/about" className="font-medium text-[hsl(var(--accent))] hover:underline">
          About
        </Link>
      </p>
    </div>
  );
}

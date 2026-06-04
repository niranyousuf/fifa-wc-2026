import { BarChart3 } from "lucide-react";

/**
 * Vercel Web Analytics has no public read API — counts only appear in the dashboard.
 * @see https://community.vercel.com/t/vercel-web-analytics-get-visitors-over-sdk/27804
 */
export function VercelAnalyticsLink({ className = "" }) {
  return (
    <a
      href="https://vercel.com/dashboard"
      target="_blank"
      rel="noopener noreferrer"
      className={[
        "inline-flex items-center gap-2 rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--muted))]/30 px-4 py-2.5 text-sm font-medium text-[hsl(var(--foreground))] transition-colors hover:border-[hsl(var(--accent))] hover:text-[hsl(var(--accent))]",
        className,
      ].join(" ")}
    >
      <BarChart3 className="h-4 w-4 shrink-0 text-wc-accent" aria-hidden />
      Open Vercel Analytics (dashboard)
    </a>
  );
}

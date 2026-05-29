import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { ThemeToggleFloating } from "@/components/ThemeToggleFloating";
import { getSiteUrl } from "@/lib/siteUrl";
import "./globals.css";

const siteUrl = getSiteUrl();
const siteTitle = "FIFA World Cup 2026 Hub";
const siteDescription =
  "Follow WC 2026 — fixtures, group standings, teams, knockout bracket, favorites, and a tournament prediction simulator.";

const displayFont = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-display",
});

const bodyFont = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: siteTitle,
    template: `%s | FIFA World Cup 2026`,
  },
  description: siteDescription,
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: siteTitle,
    title: siteTitle,
    description: siteDescription,
    images: [
      {
        url: "/opengraph-image.png",
        width: 1200,
        height: 630,
        alt: "FIFA World Cup 2026 Hub — fixtures, standings, and knockout bracket",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/opengraph-image.png"],
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${displayFont.variable} ${bodyFont.variable}`}>
        <Providers>
          <Navbar />
          <main className="mx-auto min-h-[calc(100dvh-12rem)] w-full max-w-content px-4 py-6 sm:py-8">
            {children}
          </main>
          <footer className="border-t border-[hsl(var(--border))]">
            <div className="mx-auto flex max-w-content flex-col gap-2 px-4 py-3 text-xs text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} niranyousf</span>
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                <Link
                  href="/privacy"
                  className="font-medium text-[hsl(var(--foreground))] underline-offset-2 hover:text-[hsl(var(--accent))] hover:underline"
                >
                  Privacy Policy
                </Link>
                <span>
                  Developed by:{" "}
                  <a
                    href="https://niranyousuf.me"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-[hsl(var(--foreground))] underline-offset-2 hover:text-[hsl(var(--accent))] hover:underline"
                  >
                    AHM Yousuf Niran
                  </a>
                </span>
              </div>
            </div>
          </footer>
          <ThemeToggleFloating />
        </Providers>
      </body>
    </html>
  );
}

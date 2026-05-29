import { Inter, Playfair_Display } from "next/font/google";
import Link from "next/link";
import { Navbar } from "@/components/Navbar";
import { Providers } from "@/components/Providers";
import { ThemeToggleFloating } from "@/components/ThemeToggleFloating";
import "./globals.css";

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
  title: "FIFA World Cup 2026",
  description: "Fixtures, standings, teams, and knockout bracket for WC 2026.",
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
            <div className="mx-auto flex max-w-content flex-col gap-3 px-4 py-4 text-sm text-[hsl(var(--muted-foreground))] sm:flex-row sm:items-center sm:justify-between">
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

"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { NAV_LINKS } from "@/lib/navLinks";
import { cn } from "@/lib/utils";

function NavLink({ href, label, onNavigate }) {
  const pathname = usePathname();
  const active = href === "/" ? pathname === "/" : pathname.startsWith(href);

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn(
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        active
          ? "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]"
          : "text-[hsl(var(--muted-foreground))] hover:bg-[hsl(var(--muted))] hover:text-[hsl(var(--foreground))]",
      )}
    >
      {label}
    </Link>
  );
}

export function Navbar() {
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    setMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!menuOpen) return undefined;

    const onKeyDown = (event) => {
      if (event.key === "Escape") setMenuOpen(false);
    };

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [menuOpen]);

  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-[hsl(var(--border))] bg-[hsl(var(--background))]/90 backdrop-blur">
      <div className="mx-auto max-w-content px-4 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="flex min-w-0 shrink-0 items-center gap-2"
            onClick={closeMenu}
          >
            <Image
              src="/wc-2026-logo.png"
              alt="FIFA World Cup 2026"
              width={32}
              height={44}
              className="h-9 w-auto shrink-0 object-contain sm:h-10"
              priority
            />
            <span className="truncate font-display text-xl tracking-wide sm:text-2xl">
              WC 2026
            </span>
          </Link>

          <nav
            className="hidden items-center gap-1 md:flex"
            aria-label="Main navigation"
          >
            {NAV_LINKS.map((link) => (
              <NavLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>

          <button
            type="button"
            className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] md:hidden"
            aria-expanded={menuOpen}
            aria-controls="mobile-nav"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            onClick={() => setMenuOpen((open) => !open)}
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        <div
          id="mobile-nav"
          className={cn(
            "grid transition-[grid-template-rows] duration-200 md:hidden",
            menuOpen ? "grid-rows-[1fr]" : "grid-rows-[0fr]",
          )}
        >
          <div className="overflow-hidden">
            <nav
              className="flex flex-col gap-1 border-t border-[hsl(var(--border))] pt-3"
              aria-label="Mobile navigation"
            >
              {NAV_LINKS.map((link) => (
                <NavLink
                  key={link.href}
                  href={link.href}
                  label={link.label}
                  onNavigate={closeMenu}
                />
              ))}
            </nav>
          </div>
        </div>
      </div>
    </header>
  );
}

"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { SearchResults } from "@/components/SearchResults";
import { cn } from "@/lib/utils";

export function TeamSearchBar({ className }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [searchOpen, setSearchOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setSearchOpen(false);
      return;
    }

    const timeout = setTimeout(async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(query.trim())}`);
        const data = await response.json();
        setResults(Array.isArray(data) ? data : []);
        setSearchOpen(true);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 300);

    return () => clearTimeout(timeout);
  }, [query]);

  return (
    <div className={cn("relative mx-auto w-full max-w-2xl", className)}>
      <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[hsl(var(--muted-foreground))]" />
      <input
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        placeholder="Search teams..."
        className="h-11 w-full rounded-lg border border-[hsl(var(--border))] bg-[hsl(var(--card))] pl-11 pr-4 text-sm outline-none ring-[hsl(var(--ring))] focus:ring-2"
      />
      {loading && (
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-[hsl(var(--muted-foreground))]">
          ...
        </span>
      )}
      {searchOpen && (
        <SearchResults
          results={results}
          onSelect={() => {
            setSearchOpen(false);
            setQuery("");
          }}
        />
      )}
    </div>
  );
}

"use client";

import Image from "next/image";
import Link from "next/link";
import { TeamFavoriteStar } from "@/components/TeamFavoriteStar";

export function FavoriteTeamChips({ teams = [] }) {
  if (!teams.length) return null;

  return (
    <ul className="flex flex-wrap gap-2">
      {teams.map((team) => (
        <li key={team.id}>
          <Link
            href={`/team/${team.id}`}
            className="inline-flex items-center gap-2 rounded-md border border-[hsl(var(--border))] bg-[hsl(var(--card))] px-3 py-2 text-sm font-medium transition-colors hover:border-[hsl(var(--accent))]/40 hover:bg-[hsl(var(--muted))]/30"
          >
            {team.logo ? (
              <span className="relative h-5 w-7 shrink-0">
                <Image
                  src={team.logo}
                  alt=""
                  fill
                  className="object-contain"
                  sizes="28px"
                />
              </span>
            ) : null}
            <span>{team.name}</span>
            {team.fifaRank != null && (
              <span className="text-xs text-[hsl(var(--muted-foreground))]">
                #{team.fifaRank}
              </span>
            )}
            <TeamFavoriteStar teamId={team.id} teamName={team.name} size="sm" />
          </Link>
        </li>
      ))}
    </ul>
  );
}

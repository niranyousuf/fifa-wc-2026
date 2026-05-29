"use client";

import { Star } from "lucide-react";
import { useFavoriteTeams } from "@/components/FavoriteTeamsProvider";
import { cn } from "@/lib/utils";

const sizeClasses = {
  sm: { button: "h-7 w-7", icon: "h-3.5 w-3.5" },
  md: { button: "h-8 w-8", icon: "h-4 w-4" },
};

export function canFavoriteTeam(team) {
  return Boolean(team?.id && team?.name && team.name !== "TBD");
}

export function TeamFavoriteStar({ teamId, teamName, size = "md" }) {
  const { hydrated, isFavorite, toggleFavorite } = useFavoriteTeams();
  const classes = sizeClasses[size] ?? sizeClasses.md;
  const active = hydrated && isFavorite(teamId);

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite(teamId);
      }}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md text-[hsl(var(--muted-foreground))] transition-colors hover:bg-[hsl(var(--muted))] hover:text-wc-accent",
        classes.button,
      )}
      aria-pressed={active}
      aria-label={
        active ? `Remove ${teamName} from favorites` : `Add ${teamName} to favorites`
      }
    >
      <Star
        className={cn(
          classes.icon,
          active ? "fill-wc-accent text-wc-accent" : "fill-none",
        )}
        strokeWidth={active ? 0 : 2}
      />
    </button>
  );
}

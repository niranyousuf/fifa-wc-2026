"use client";

import Image from "next/image";
import Link from "next/link";
import {
  TeamFavoriteStar,
  canFavoriteTeam,
} from "@/components/TeamFavoriteStar";
import { cn } from "@/lib/utils";

const flagSizes = {
  sm: { box: "h-5 w-5", placeholder: "h-[13.5px] w-6" },
  md: { box: "h-8 w-8", placeholder: "h-[18px] w-8" },
  lg: { box: "h-16 w-16 md:h-20 md:w-20", placeholder: "h-[18px] w-8" },
};

export function TeamLabel({
  team,
  href,
  linkOnClick,
  align = "left",
  size = "md",
  showFlag = true,
  starPosition = "after-name",
  mobileStack,
  stackCentered = false,
  nameClassName,
  className,
}) {
  const isRight = align === "right";
  const flags = flagSizes[size] ?? flagSizes.md;
  const favorite = canFavoriteTeam(team);
  const starBeforeFlag = starPosition === "before-flag";
  const stackOnMobile =
    stackCentered || (mobileStack ?? (size === "md" || size === "lg"));

  const nameContent = (
    <span
      className={cn(
        "min-w-0 font-medium leading-tight",
        stackOnMobile
          ? stackCentered
            ? "min-w-0 break-words text-center"
            : "w-full break-words text-center text-[11px] leading-snug sm:w-auto sm:truncate sm:text-left sm:text-sm"
          : "truncate",
        size === "sm" && "text-sm",
        size === "lg" &&
          "font-display text-xl tracking-wide sm:text-2xl md:text-3xl",
        nameClassName,
      )}
    >
      {team.name}
    </span>
  );

  const star = favorite ? (
    <TeamFavoriteStar
      teamId={team.id}
      teamName={team.name}
      size={size === "lg" ? "md" : "sm"}
    />
  ) : null;

  const flag =
    showFlag &&
    (team.logo ? (
      <Image
        src={team.logo}
        alt=""
        width={size === "lg" ? 80 : size === "sm" ? 20 : 32}
        height={size === "lg" ? 80 : size === "sm" ? 20 : 32}
        className={cn("shrink-0 object-contain", flags.box)}
      />
    ) : (
      <span
        className={cn(
          "inline-block shrink-0 border border-[hsl(var(--border))] bg-[hsl(var(--muted))]",
          flags.placeholder,
        )}
        aria-hidden
      />
    ));

  const name = href ? (
    <Link
      href={href}
      onClick={linkOnClick}
      className={cn(
        "min-w-0 hover:text-[hsl(var(--accent))] hover:underline",
        size === "lg" && "transition-opacity hover:opacity-80 hover:no-underline",
      )}
      title={team.name}
    >
      {nameContent}
    </Link>
  ) : (
    nameContent
  );

  if (stackCentered) {
    return (
      <div
        className={cn(
          "flex min-w-0 items-center justify-center gap-2 text-center sm:gap-3",
          className,
        )}
      >
        {flag || null}
        {name}
        {star}
      </div>
    );
  }

  if (stackOnMobile) {
    return (
      <div
        className={cn(
          "flex min-w-0 flex-col items-center gap-1 text-center",
          !stackCentered && "sm:flex-row sm:items-center sm:gap-2 sm:text-left",
          !stackCentered && isRight && "sm:flex-row-reverse sm:text-right",
          className,
        )}
      >
        {starBeforeFlag ? (
          <span className="sm:contents">{star}</span>
        ) : null}
        {flag || null}
        <div
          className={cn(
            "flex max-w-full items-center justify-center gap-0.5",
            !stackCentered && "sm:contents",
          )}
        >
          {name}
          {!starBeforeFlag ? star : null}
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-w-0 items-center gap-1.5 sm:gap-2",
        isRight && "flex-row-reverse text-right",
        className,
      )}
    >
      {starBeforeFlag ? star : null}
      {flag || null}
      {name}
      {!starBeforeFlag ? star : null}
    </div>
  );
}

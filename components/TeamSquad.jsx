"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Shirt } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const POSITION_ORDER = ["GK", "DF", "MF", "FW"];

const POSITION_LABELS = {
  GK: "Goalkeepers",
  DF: "Defenders",
  MF: "Midfielders",
  FW: "Forwards",
};

function normalizePosition(position) {
  if (!position) return "OTHER";
  return String(position).trim().toUpperCase();
}

function sortPlayers(players) {
  return [...players].sort((a, b) => {
    const numA = a.number ?? 999;
    const numB = b.number ?? 999;
    if (numA !== numB) return numA - numB;
    return a.name.localeCompare(b.name);
  });
}

function groupPlayersByPosition(players) {
  const groups = new Map();

  for (const player of players) {
    const key = normalizePosition(player.position);
    if (!groups.has(key)) groups.set(key, []);
    groups.get(key).push(player);
  }

  const known = POSITION_ORDER.filter((key) => groups.has(key));
  const rest = [...groups.keys()]
    .filter((key) => !POSITION_ORDER.includes(key))
    .sort();

  return [...known, ...rest].map((key) => ({
    key,
    label: POSITION_LABELS[key] ?? key,
    players: sortPlayers(groups.get(key)),
  }));
}

function getInitials(name) {
  return String(name)
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

export function TeamSquad({ team, players }) {
  if (!players?.length) {
    return (
      <p className="text-[hsl(var(--muted-foreground))]">
        Squad information is not available yet.
      </p>
    );
  }

  const groups = useMemo(() => groupPlayersByPosition(players), [players]);
  const flatPlayers = useMemo(
    () => groups.flatMap((group) => group.players),
    [groups],
  );

  const [photos, setPhotos] = useState({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let active = true;

    async function loadPhotos() {
      setLoading(true);
      try {
        const response = await fetch("/api/player-photos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ names: flatPlayers.map((p) => p.name) }),
        });

        if (!response.ok) {
          throw new Error("Photo request failed");
        }
        const data = await response.json();
        if (!active) return;
        setPhotos((previous) => ({ ...previous, ...(data?.photos ?? {}) }));
      } catch {
        // Keep already resolved photos instead of wiping the list.
      } finally {
        if (active) setLoading(false);
      }
    }

    loadPhotos();

    return () => {
      active = false;
    };
  }, [flatPlayers]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          Squad
          {loading ? (
            <span className="ml-2 text-sm font-normal text-[hsl(var(--muted-foreground))]">
              Loading photos…
            </span>
          ) : null}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-8">
        {groups.map((group) => (
          <section key={group.key}>
            <h3 className="mb-3 font-display text-lg tracking-wide text-wc-accent">
              {group.label}
              <span className="ml-2 text-sm font-sans font-normal text-[hsl(var(--muted-foreground))]">
                ({group.players.length})
              </span>
            </h3>
            <div className="grid gap-3 md:grid-cols-2">
              {group.players.map((player) => (
                <div
                  key={`${group.key}-${player.id}`}
                  className="flex items-center justify-between rounded-lg border border-[hsl(var(--border))] px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <PlayerAvatar
                      name={player.name}
                      photo={photos[player.name]}
                      flag={team?.logo}
                    />
                    <div>
                      <p className="font-medium">{player.name}</p>
                      <p className="text-sm text-[hsl(var(--muted-foreground))]">
                        {player.age ? `${player.age} yrs` : null}
                        {player.age && player.club ? " · " : null}
                        {player.club ?? null}
                      </p>
                    </div>
                  </div>
                  {player.number != null ? (
                    <Badge variant="outline">#{player.number}</Badge>
                  ) : null}
                </div>
              ))}
            </div>
          </section>
        ))}
      </CardContent>
    </Card>
  );
}

function PlayerAvatar({ name, photo, flag }) {
  if (photo) {
    return (
      <div className="relative h-11 w-11 overflow-hidden rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
        <Image
          src={photo}
          alt={name}
          fill
          unoptimized
          className="object-cover"
          sizes="44px"
        />
      </div>
    );
  }

  // Fallback: jersey style avatar with country flag.
  return (
    <div className="relative flex h-11 w-11 items-center justify-center overflow-hidden rounded-full border border-[hsl(var(--border))] bg-[hsl(var(--muted))]">
      {flag ? (
        <Image
          src={flag}
          alt="Team flag"
          fill
          className="object-cover opacity-20"
          sizes="44px"
        />
      ) : null}
      <div className="relative flex h-full w-full items-center justify-center">
        <Shirt className="h-5 w-5 text-[hsl(var(--muted-foreground))]" />
      </div>
      <span className="sr-only">{getInitials(name)}</span>
    </div>
  );
}

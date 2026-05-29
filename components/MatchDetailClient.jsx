"use client";

import Link from "next/link";
import { TeamLabel } from "@/components/TeamLabel";
import { notFound } from "next/navigation";
import { useState } from "react";
import { ArrowLeft, Zap } from "lucide-react";
import { getHighVoltageInfo } from "@/lib/highVoltage";
import { MatchStats } from "@/components/MatchStats";
import { MatchEvents } from "@/components/MatchEvents";
import { TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { LocalKickoffDateTime } from "@/components/LocalKickoffDateTime";
import { cn, getScore, isFinished } from "@/lib/utils";

export function MatchDetailClient({ data }) {
  const [tab, setTab] = useState("events");
  const fixture = data.fixture;

  if (!fixture) notFound();

  const home = fixture.teams.home;
  const away = fixture.teams.away;
  const score = getScore(fixture);
  const finished = isFinished(fixture.fixture.status.short);
  const highVoltage = getHighVoltageInfo(fixture);

  return (
    <div className="space-y-8">
      <Link
        href="/hub"
        className="inline-flex items-center gap-2 text-sm text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to hub
      </Link>

      <section
        className={cn(
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-6 md:p-8",
          highVoltage.highVoltage && "border-[hsl(var(--accent))]",
        )}
      >
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline">{fixture.league.round}</Badge>
            {highVoltage.highVoltage && (
              <Badge className="gap-1 border-[hsl(var(--accent))] bg-[hsl(var(--card))] text-[hsl(var(--accent))]">
                <Zap className="h-3 w-3" aria-hidden />
                High voltage
              </Badge>
            )}
          </div>
          <Badge variant="muted">{fixture.fixture.status.long}</Badge>
        </div>

        <div className="grid grid-cols-1 items-center gap-6 md:grid-cols-[1fr_auto_1fr]">
          <TeamHeader team={home} align="left" href={`/team/${home.id}`} />
          <div className="order-first text-center md:order-none">
            {score ? (
              <p className="font-sans text-4xl tabular-nums tracking-wider text-wc-accent sm:text-5xl">
                {score.home} - {score.away}
              </p>
            ) : (
              <div>
                <p className="font-sans text-3xl">VS</p>
                <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                  <LocalKickoffDateTime date={fixture.fixture.date} />
                </p>
              </div>
            )}
            {finished && (
              <p className="mt-2 text-sm text-[hsl(var(--muted-foreground))]">
                <LocalKickoffDateTime date={fixture.fixture.date} />
              </p>
            )}
          </div>
          <TeamHeader team={away} align="right" href={`/team/${away.id}`} />
        </div>

        {fixture.fixture.venue?.name && (
          <p className="mt-6 text-center text-sm text-[hsl(var(--muted-foreground))]">
            {fixture.fixture.venue.name}
            {fixture.fixture.venue.city ? `, ${fixture.fixture.venue.city}` : ""}
          </p>
        )}
      </section>

      <section>
        <div className="overflow-x-auto pb-1">
          <TabsList className="w-max min-w-full sm:min-w-0">
          <TabsTrigger value="events" activeValue={tab} onValueChange={setTab}>
            Goals &amp; cards
          </TabsTrigger>
          <TabsTrigger value="stats" activeValue={tab} onValueChange={setTab}>
            Statistics
          </TabsTrigger>
        </TabsList>
        </div>
        <TabsContent value="events" activeValue={tab}>
          <MatchEvents events={data.events} />
        </TabsContent>
        <TabsContent value="stats" activeValue={tab}>
          <MatchStats statistics={data.statistics} />
        </TabsContent>
      </section>
    </div>
  );
}

function TeamHeader({ team, align, href }) {
  return (
    <TeamLabel
      team={team}
      href={href}
      align={align}
      size="lg"
      className={cn(
        "flex-col items-center gap-3 text-center",
        align === "right"
          ? "md:flex-row-reverse md:items-end md:text-right"
          : "md:flex-row md:items-start md:text-left",
      )}
    />
  );
}

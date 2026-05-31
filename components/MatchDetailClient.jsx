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
          "rounded-2xl border border-[hsl(var(--border))] bg-[hsl(var(--card))] p-4 sm:p-6 md:p-8",
          highVoltage.highVoltage && "border-[hsl(var(--accent))]",
        )}
      >
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2 sm:mb-4 sm:gap-3">
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

        <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-center gap-1.5 sm:gap-4 md:gap-6">
          <div className="flex min-w-0 w-full justify-center sm:justify-start">
            <TeamHeader team={home} align="left" href={`/team/${home.id}`} />
          </div>
          <div className="min-w-[2.25rem] shrink-0 text-center px-0.5 sm:min-w-0 sm:px-0">
            {score ? (
              <p className="font-sans text-2xl tabular-nums tracking-wider text-wc-accent sm:text-4xl md:text-5xl">
                {score.home} - {score.away}
              </p>
            ) : (
              <div>
                <p className="font-sans text-lg sm:text-3xl">VS</p>
                <p className="mt-1 hidden text-[10px] text-[hsl(var(--muted-foreground))] sm:mt-2 sm:block sm:text-sm">
                  <LocalKickoffDateTime date={fixture.fixture.date} />
                </p>
              </div>
            )}
            {finished && (
              <p className="mt-1 hidden text-[10px] text-[hsl(var(--muted-foreground))] sm:mt-2 sm:block sm:text-sm">
                <LocalKickoffDateTime date={fixture.fixture.date} />
              </p>
            )}
          </div>
          <div className="flex min-w-0 w-full justify-center sm:justify-end">
            <TeamHeader team={away} align="right" href={`/team/${away.id}`} />
          </div>
        </div>

        <p className="mt-3 text-center text-[10px] text-[hsl(var(--muted-foreground))] sm:hidden">
          <LocalKickoffDateTime date={fixture.fixture.date} />
        </p>

        {fixture.fixture.venue?.name && (
          <p className="mt-3 text-center text-[10px] text-[hsl(var(--muted-foreground))] sm:mt-6 sm:text-sm">
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
      nameClassName="text-[11px] leading-snug sm:text-2xl md:text-3xl"
      className={cn(
        "min-w-0 max-w-[5.25rem] sm:max-w-none",
        "[&_img]:!h-9 [&_img]:!w-9 sm:[&_img]:!h-16 sm:[&_img]:!w-16 md:[&_img]:!h-20 md:[&_img]:!w-20",
      )}
    />
  );
}

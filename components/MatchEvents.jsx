import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const eventLabels = {
  Goal: "⚽",
  Card: "🟨",
  subst: "🔄",
};

export function MatchEvents({ events }) {
  if (!events?.length) {
    return (
      <p className="text-[hsl(var(--muted-foreground))]">
        Match events are not available yet.
      </p>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Events</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {events.map((event, index) => (
          <div
            key={`${event.time.elapsed}-${event.type}-${index}`}
            className="flex items-start justify-between gap-4 rounded-lg border border-[hsl(var(--border))] px-4 py-3"
          >
            <div>
              <p className="font-medium">
                {eventLabels[event.type] || "•"} {event.player?.name || event.detail}
              </p>
              <p className="text-sm text-[hsl(var(--muted-foreground))]">
                {event.team?.name} · {event.detail}
                {event.assist?.name ? ` (assist: ${event.assist.name})` : ""}
              </p>
            </div>
            <Badge variant="muted">{event.time.elapsed}&apos;</Badge>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export function MatchStats({ statistics }) {
  if (!statistics?.length) {
    return (
      <p className="text-[hsl(var(--muted-foreground))]">
        Statistics are not available for this match yet.
      </p>
    );
  }

  const homeStats = statistics[0]?.statistics ?? [];
  const awayStats = statistics[1]?.statistics ?? [];

  const statTypes = homeStats.map((stat) => stat.type);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Match Statistics</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {statTypes.map((type) => {
          const homeValue = parseStatValue(
            homeStats.find((stat) => stat.type === type)?.value,
          );
          const awayValue = parseStatValue(
            awayStats.find((stat) => stat.type === type)?.value,
          );
          const total = homeValue + awayValue || 1;

          return (
            <div key={type} className="space-y-2">
              <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-3 text-sm">
                <span className="text-right font-medium">{formatStatValue(homeValue, type)}</span>
                <span className="text-xs uppercase tracking-wide text-[hsl(var(--muted-foreground))]">
                  {type}
                </span>
                <span className="font-medium">{formatStatValue(awayValue, type)}</span>
              </div>
              <div className="grid grid-cols-2 gap-1">
                <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                  <div
                    className="h-full rounded-full bg-wc-accent"
                    style={{ width: `${(homeValue / total) * 100}%` }}
                  />
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[hsl(var(--muted))]">
                  <div
                    className="ml-auto h-full rounded-full bg-wc-ink dark:bg-white"
                    style={{ width: `${(awayValue / total) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}

function parseStatValue(value) {
  if (typeof value === "number") return value;
  if (typeof value === "string" && value.endsWith("%")) {
    return Number.parseFloat(value.replace("%", "")) || 0;
  }
  return Number.parseFloat(value) || 0;
}

function formatStatValue(value, type) {
  if (type.toLowerCase().includes("possession")) {
    return `${value}%`;
  }
  return value;
}

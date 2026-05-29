import { Zap } from "lucide-react";
import { cn } from "@/lib/utils";

export function HighVoltageBadge({ label, className }) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-0.5 rounded-full border border-[hsl(var(--accent))] bg-[hsl(var(--card))] px-1.5 py-px text-[8px] font-semibold uppercase leading-none tracking-wide text-[hsl(var(--accent))] sm:gap-1 sm:px-2 sm:py-0.5 sm:text-[10px]",
        className,
      )}
      title={label}
    >
      <Zap
        className="h-2.5 w-2.5 shrink-0 sm:h-3 sm:w-3"
        aria-hidden
      />
      High voltage
    </span>
  );
}

import { cn } from "@/lib/utils";

export function Badge({ className, variant = "default", ...props }) {
  const variants = {
    default: "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))]",
    outline: "border border-[hsl(var(--border))] text-[hsl(var(--foreground))]",
    muted: "bg-[hsl(var(--muted))] text-[hsl(var(--muted-foreground))]",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}

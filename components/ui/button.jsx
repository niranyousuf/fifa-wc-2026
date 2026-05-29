import { cn } from "@/lib/utils";

export function Button({ className, variant = "default", size = "default", ...props }) {
  const variants = {
    default:
      "bg-[hsl(var(--accent))] text-[hsl(var(--accent-foreground))] hover:opacity-90",
    outline:
      "border border-[hsl(var(--border))] bg-transparent hover:bg-[hsl(var(--muted))]",
    ghost: "bg-transparent hover:bg-[hsl(var(--muted))]",
  };

  const sizes = {
    default: "h-10 px-4 py-2",
    sm: "h-8 px-3 text-sm",
    icon: "h-10 w-10",
  };

  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[hsl(var(--ring))] disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        sizes[size],
        className,
      )}
      {...props}
    />
  );
}

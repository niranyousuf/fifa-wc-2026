"use client";

import { cn } from "@/lib/utils";

export function Tabs({ value, onValueChange, children, className }) {
  return (
    <div className={cn("space-y-4", className)} data-value={value}>
      {typeof children === "function" ? children({ value, onValueChange }) : children}
    </div>
  );
}

export function TabsList({ className, children }) {
  return (
    <div
      className={cn(
        "inline-flex h-10 items-center rounded-lg bg-[hsl(var(--muted))] p-1",
        className,
      )}
    >
      {children}
    </div>
  );
}

export function TabsTrigger({ value, activeValue, onValueChange, className, children }) {
  const isActive = value === activeValue;

  return (
    <button
      type="button"
      onClick={() => onValueChange(value)}
      className={cn(
        "inline-flex items-center justify-center rounded-md px-4 py-1.5 text-sm font-medium transition-colors",
        isActive
          ? "bg-[hsl(var(--card))] text-[hsl(var(--foreground))] shadow-sm"
          : "text-[hsl(var(--muted-foreground))] hover:text-[hsl(var(--foreground))]",
        className,
      )}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeValue, className, children }) {
  if (value !== activeValue) return null;

  return <div className={cn("mt-2", className)}>{children}</div>;
}

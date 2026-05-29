"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const views = [
  { id: "groups", label: "Groups", labelMd: "Group View" },
  { id: "calendar", label: "Calendar", labelMd: "Calendar View" },
  { id: "results", label: "Results", labelMd: "Finished Results" },
  { id: "bracket", label: "Knockout", labelMd: "Knockout" },
];

export function ViewToggle({ activeView, onChange }) {
  return (
    <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 sm:flex-wrap sm:overflow-visible sm:pb-0">
      {views.map((view) => (
        <Button
          key={view.id}
          type="button"
          variant={activeView === view.id ? "default" : "outline"}
          onClick={() => onChange(view.id)}
          className={cn("shrink-0", activeView === view.id && "shadow-sm")}
        >
          <span className="sm:hidden">{view.label}</span>
          <span className="hidden sm:inline">{view.labelMd}</span>
        </Button>
      ))}
    </div>
  );
}

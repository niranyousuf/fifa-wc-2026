"use client";

import { useEffect, useState } from "react";
import { Moon, Sun } from "lucide-react";
import { useTheme } from "@teispace/next-themes";
import { Button } from "@/components/ui/button";

export function ThemeToggleFloating() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const isDark = (theme === "system" ? resolvedTheme : theme) === "dark";

  if (!mounted) {
    return <div className="fixed bottom-4 right-4 z-50 h-10 w-10" aria-hidden />;
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        type="button"
        variant="outline"
        size="icon"
        aria-label="Toggle theme"
        onClick={() => setTheme(isDark ? "light" : "dark")}
      >
        {isDark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
      </Button>
    </div>
  );
}

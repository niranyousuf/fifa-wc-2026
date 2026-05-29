"use client";

import { ThemeProvider as NextThemesProvider } from "@teispace/next-themes";
import { FavoriteTeamsProvider } from "@/components/FavoriteTeamsProvider";

export function Providers({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="dark" enableSystem={false}>
      <FavoriteTeamsProvider>{children}</FavoriteTeamsProvider>
    </NextThemesProvider>
  );
}

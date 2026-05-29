"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  loadFavoriteTeamIds,
  toggleFavoriteTeamId,
} from "@/lib/favoriteTeams";

const FavoriteTeamsContext = createContext(null);

export function FavoriteTeamsProvider({ children }) {
  const [favoriteIds, setFavoriteIds] = useState([]);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    setFavoriteIds(loadFavoriteTeamIds());
    setHydrated(true);
  }, []);

  const isFavorite = useCallback(
    (teamId) => favoriteIds.includes(teamId),
    [favoriteIds],
  );

  const toggleFavorite = useCallback((teamId) => {
    setFavoriteIds((current) => toggleFavoriteTeamId(teamId, current));
  }, []);

  const value = useMemo(
    () => ({
      favoriteIds,
      hydrated,
      isFavorite,
      toggleFavorite,
    }),
    [favoriteIds, hydrated, isFavorite, toggleFavorite],
  );

  return (
    <FavoriteTeamsContext.Provider value={value}>
      {children}
    </FavoriteTeamsContext.Provider>
  );
}

export function useFavoriteTeams() {
  const context = useContext(FavoriteTeamsContext);

  if (!context) {
    throw new Error("useFavoriteTeams must be used within FavoriteTeamsProvider");
  }

  return context;
}

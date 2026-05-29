const STORAGE_KEY = "wc2026_tournament_simulator_v1";
const TTL_MS = 60 * 24 * 60 * 60 * 1000;

export function createEmptyPredictions() {
  return {
    group: {},
    knockout: {},
  };
}

export function loadSimulatorState() {
  if (typeof window === "undefined") return createEmptyPredictions();

  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createEmptyPredictions();

    const parsed = JSON.parse(raw);
    const savedAt = parsed.savedAt;

    if (savedAt && Date.now() - savedAt > TTL_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return createEmptyPredictions();
    }

    return {
      group: parsed.group ?? {},
      knockout: parsed.knockout ?? {},
    };
  } catch {
    return createEmptyPredictions();
  }
}

export function saveSimulatorState(state) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify({
      group: state.group ?? {},
      knockout: state.knockout ?? {},
      savedAt: Date.now(),
    }),
  );
}

export function clearSimulatorState() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(STORAGE_KEY);
}

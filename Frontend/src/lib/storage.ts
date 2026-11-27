const STORAGE_PREFIX = "cineview_demo_";

/**
 * SSR-safe localStorage reader for non-sensitive demo state.
 */
export function readDemoStorage<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") {
    return fallback;
  }
  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${key}`);
    if (!raw) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * SSR-safe localStorage writer for non-sensitive demo state.
 */
export function writeDemoStorage<T>(key: string, value: T): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.setItem(`${STORAGE_PREFIX}${key}`, JSON.stringify(value));
  } catch {
    // Ignore quota errors in demo mode
  }
}

export function removeDemoStorage(key: string): void {
  if (typeof window === "undefined") {
    return;
  }
  try {
    window.localStorage.removeItem(`${STORAGE_PREFIX}${key}`);
  } catch {
    // Ignore storage errors
  }
}

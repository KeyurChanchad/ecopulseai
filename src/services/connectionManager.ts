import { useState, useEffect } from "react";

export interface ConnectionState {
  isOnline: boolean;
  isBackendConnected: boolean;
  backendVersion?: string;
  aiEngine?: string;
  lastChecked?: Date;
  checking: boolean;
  error?: string;
}

let currentState: ConnectionState = {
  isOnline: typeof navigator !== "undefined" ? navigator.onLine : true,
  isBackendConnected: false,
  checking: false,
};

const listeners = new Set<(state: ConnectionState) => void>();

function notify() {
  listeners.forEach((listener) => listener({ ...currentState }));
}

export async function pingBackend(): Promise<boolean> {
  currentState.checking = true;
  notify();

  if (!navigator.onLine) {
    currentState.isOnline = false;
    currentState.isBackendConnected = false;
    currentState.checking = false;
    currentState.lastChecked = new Date();
    notify();
    return false;
  }

  currentState.isOnline = true;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 2500);

    const resp = await fetch("/health", {
      method: "GET",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    if (resp.ok) {
      const data = await resp.json();
      currentState.isBackendConnected = true;
      currentState.backendVersion = data.version || "2.0.0";
      currentState.aiEngine = data.aiEngine || "Active";
      currentState.error = undefined;
    } else {
      currentState.isBackendConnected = false;
      currentState.error = `HTTP ${resp.status}`;
    }
  } catch (err: any) {
    currentState.isBackendConnected = false;
    currentState.error = err.name === "AbortError" ? "Timeout" : "Unreachable";
  } finally {
    currentState.checking = false;
    currentState.lastChecked = new Date();
    notify();
  }

  return currentState.isBackendConnected;
}

// Global initialization
if (typeof window !== "undefined") {
  window.addEventListener("online", () => {
    currentState.isOnline = true;
    notify();
    pingBackend();
  });

  window.addEventListener("offline", () => {
    currentState.isOnline = false;
    currentState.isBackendConnected = false;
    notify();
  });

  // Initial check & periodic ping every 5 minutes (300,000 ms)
  const HEALTH_CHECK_INTERVAL_MS = 5 * 60 * 1000; // 5 minutes
  pingBackend();
  setInterval(pingBackend, HEALTH_CHECK_INTERVAL_MS);
}

export function useConnectionStatus(): ConnectionState & {
  recheck: () => Promise<boolean>;
} {
  const [state, setState] = useState<ConnectionState>({ ...currentState });

  useEffect(() => {
    const handler = (newState: ConnectionState) => setState(newState);
    listeners.add(handler);
    // Initial fetch if never tested
    if (!state.lastChecked) {
      pingBackend();
    }
    return () => {
      listeners.delete(handler);
    };
  }, []);

  return {
    ...state,
    recheck: pingBackend,
  };
}
